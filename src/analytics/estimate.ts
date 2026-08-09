/**
 * Classical test theory estimators (artifact pivot §1 Layer B, memo D6).
 *
 * These compute the numbers the §1 acceptance band is literally written in —
 * item difficulty 0.55–0.85, discrimination ≥ 0.20 — plus the reliability
 * coefficients that say whether the instrument measures anything stable at all.
 * IRT (S8) comes later and answers a different question; this is the layer the
 * auto-flag gate (S7) actually reads.
 *
 * DESIGN RULE — one scoring path (pivot §2, "the identical pipeline"):
 * nothing here re-implements scoring. A response matrix is built by running
 * responses through the SHIPPING engines (`computeDelicacyResult`,
 * `computeBiasResult`) and reading their receipts. If scoring changes, these
 * estimates change with it, automatically. A parallel scorer here would let
 * the two drift and would make every recovery claim a claim about code users
 * never touch.
 *
 * HONESTY (N3):
 * - Every result carries the `dataSource` of the matrix it came from. A number
 *   computed from simulated responses is stamped SIMULATED all the way to the
 *   panel that renders it; the badge is not reattached by hand downstream.
 * - Undefined statistics return `null`, never 0. An item everybody answered
 *   correctly has NO defined discrimination — reporting 0 would read as
 *   "measured, and bad", which is a different and false claim.
 * - CTT difficulty is POPULATION-DEPENDENT: p is the proportion correct in the
 *   cohort that happened to sit the test, so the same item is "easier" in an
 *   abler cohort. That limitation is the reason S8 exists, and it is why the
 *   recovery harness targets the population-conditional truth rather than the
 *   item's intrinsic difficulty.
 */

import { computeBiasResult, type BiasItemSpec, type BiasRatings } from "@/engine/bias";
import { computeDelicacyResult, type DelicacyItemSpec, type DelicacyResponses } from "@/engine/delicacy";
import type { MetricSpec } from "@/engine/metricMeta";

/** Provenance of a set of responses. Rendered as the /lab panel badge. */
export type DataSource = "SIMULATED" | "REAL" | "MIXED";

/** Persons × items of scored outcomes, plus the provenance that rides along. */
export interface ResponseMatrix {
  dataSource: DataSource;
  itemIds: string[];
  /** `correct[personIndex][itemIndex]`. */
  correct: boolean[][];
}

/** §1 Layer B acceptance band. The gate in S7 reads these. */
export const ACCEPT_P_MIN = 0.55;
export const ACCEPT_P_MAX = 0.85;
export const ACCEPT_DISCRIMINATION_MIN = 0.2;

// ------------------------------------------------------------ small helpers

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

/** Population SD. Returns 0 for a constant vector — callers must check. */
function sd(xs: number[]): number {
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
}

/** Pearson r. Null when either side is constant (undefined, not zero — N3). */
export function correlation(xs: number[], ys: number[]): number | null {
  if (xs.length !== ys.length) throw new Error(`correlation: length mismatch ${xs.length} vs ${ys.length}`);
  if (xs.length < 2) return null;
  const sx = sd(xs);
  const sy = sd(ys);
  if (sx === 0 || sy === 0) return null;
  const mx = mean(xs);
  const my = mean(ys);
  return mean(xs.map((x, i) => (x - mx) * (ys[i] - my))) / (sx * sy);
}

/** Root mean squared error. Only meaningful when both sides share units. */
export function rmse(estimated: number[], truth: number[]): number {
  if (estimated.length !== truth.length) throw new Error("rmse: length mismatch");
  return Math.sqrt(mean(estimated.map((e, i) => (e - truth[i]) ** 2)));
}

/** Least-squares slope of y on x — the attenuation measure for sway recovery. */
export function regressionSlope(xs: number[], ys: number[]): number | null {
  const sx = sd(xs);
  if (sx === 0) return null;
  const mx = mean(xs);
  const my = mean(ys);
  return mean(xs.map((x, i) => (x - mx) * (ys[i] - my))) / (sx * sx);
}

// ----------------------------------------------------- building the matrix

/**
 * Score delicacy sessions through the SHIPPING engine and collect the
 * side-pick outcomes. Flaw picks are deliberately excluded: they are scored on
 * a different denominator (only trials where the side pick was right), so
 * folding them into one matrix would silently mix two instruments.
 */
export function delicacyMatrix(
  dataSource: DataSource,
  items: DelicacyItemSpec[],
  sessions: DelicacyResponses[],
): ResponseMatrix {
  if (sessions.length === 0) throw new Error("estimate: no sessions");
  const correct = sessions.map((responses) => {
    const receipts = computeDelicacyResult("estimate", items, responses).receipts;
    const byId = new Map(receipts.map((r) => [r.id, r.correct]));
    return items.map((i) => byId.get(i.id) as boolean);
  });
  return { dataSource, itemIds: items.map((i) => i.id), correct };
}

// ------------------------------------------------------------- item statistics

export interface ItemStats {
  id: string;
  /** Persons who answered this item. */
  n: number;
  /**
   * CTT difficulty: the PROPORTION CORRECT. Higher = EASIER — the field's
   * unfortunate convention, kept because the §1 band is stated in it.
   */
  pValue: number;
  /**
   * Corrected item-total point-biserial: correlation of this item with the
   * total score EXCLUDING itself. Uncorrected correlations are inflated by an
   * item's own contribution to the total, badly so with few items — with 6
   * trials, an item is a sixth of the thing it is being correlated against.
   * Null when either the item or the rest-score is constant.
   */
  discrimination: number | null;
  /**
   * Discrimination CORRECTED FOR ATTENUATION (PM ruling RT-21a, 2026-08-07):
   * r / √(reliability of the rest-score).
   *
   * The raw point-biserial correlates an item against the rest of the test, so
   * the test is the criterion — and an unreliable criterion drags every
   * correlation toward zero regardless of item quality. Measured before this
   * correction: 0/6 items cleared the §1 floor of 0.20 at six trials, 11/40 at
   * forty, because a 2AFC guessing floor makes half the correct answers on
   * hard items coin flips. Dividing out the criterion's own unreliability is
   * the standard classical-test-theory remedy and makes the figure comparable
   * across test lengths.
   *
   * Null when reliability is unknown or non-positive. NOT a licence to treat a
   * short test as a long one: the correction widens the standard error too,
   * and the reported value should always be read next to `n` and the test length.
   */
  discriminationCorrected: number | null;
}

export interface ItemStatsReport {
  dataSource: DataSource;
  nPersons: number;
  items: ItemStats[];
}

export function estimateItems(matrix: ResponseMatrix): ItemStatsReport {
  const { correct, itemIds } = matrix;
  const nPersons = correct.length;
  if (nPersons === 0) throw new Error("estimate: empty matrix");
  const scores = correct.map((row) => row.filter(Boolean).length);
  const k = itemIds.length;

  // Reliability of the REST-score (k−1 items), not of the whole test: that is
  // the criterion each item is actually correlated against. Spearman-Brown
  // steps the full-test alpha down by one item.
  const alpha = estimateReliability(matrix).alpha;
  const ratio = k > 1 ? (k - 1) / k : 0;
  const restReliability =
    alpha === null || alpha <= 0 || k < 3 ? null : (ratio * alpha) / (1 + (ratio - 1) * alpha);

  const items = itemIds.map((id, i) => {
    const x = correct.map((row) => (row[i] ? 1 : 0));
    // Rest-score: total minus this item, the "corrected" in corrected r_pbis.
    const rest = scores.map((total, p) => total - x[p]);
    const r = correlation(x, rest);
    return {
      id,
      n: nPersons,
      pValue: mean(x),
      discrimination: r,
      discriminationCorrected:
        r === null || restReliability === null || restReliability <= 0
          ? null
          : r / Math.sqrt(restReliability),
    };
  });
  return { dataSource: matrix.dataSource, nPersons, items };
}

// -------------------------------------------------------------- reliability

export interface ReliabilityReport {
  dataSource: DataSource;
  nPersons: number;
  nItems: number;
  /** Cronbach's α (KR-20 for dichotomous items). Null when total variance is 0. */
  alpha: number | null;
  /** Odd/even split-half, Spearman-Brown corrected. Null when a half is constant. */
  splitHalf: number | null;
}

export function estimateReliability(matrix: ResponseMatrix): ReliabilityReport {
  const { correct, itemIds } = matrix;
  const k = itemIds.length;
  const nPersons = correct.length;
  const base = { dataSource: matrix.dataSource, nPersons, nItems: k };
  if (k < 2 || nPersons < 2) return { ...base, alpha: null, splitHalf: null };

  const totals = correct.map((row) => row.filter(Boolean).length);
  const varTotal = sd(totals) ** 2;
  const sumPQ = itemIds.reduce((acc, _, i) => {
    const p = mean(correct.map((row) => (row[i] ? 1 : 0)));
    return acc + p * (1 - p);
  }, 0);
  const alpha = varTotal === 0 ? null : (k / (k - 1)) * (1 - sumPQ / varTotal);

  // Odd/even is ONE arbitrary split; a different split gives a different
  // number. Reported alongside α rather than instead of it for that reason.
  const half = (parity: number) =>
    correct.map((row) => row.filter((_, i) => i % 2 === parity).filter(Boolean).length);
  const r = correlation(half(0), half(1));
  return { ...base, alpha, splitHalf: r === null ? null : (2 * r) / (1 + r) };
}

// ------------------------------------------------------------- person scores

/** Per-person proportion correct, in matrix order. */
export function estimatePersonScores(matrix: ResponseMatrix): number[] {
  return matrix.correct.map((row) => row.filter(Boolean).length / row.length);
}

// ------------------------------------------------------------- bias cohort

export interface BiasCohortReport {
  dataSource: DataSource;
  nPersons: number;
  /**
   * Per-person drift-corrected sway in RATING POINTS — the engine's
   * `adjustedMeanShiftPts`, which is the direct estimate of a person's label
   * susceptibility β. Kept in points (not the % headline) so it can be
   * compared against β without a unit conversion inviting an error.
   */
  swayPts: number[];
  /** Per-person control drift in points; null for a person with no controls. */
  controlDriftPts: (number | null)[];
  meanSwayPts: number;
  meanControlDriftPts: number | null;
}

export function estimateBiasCohort(
  dataSource: DataSource,
  items: BiasItemSpec[],
  blind: BiasRatings[],
  labeled: BiasRatings[],
): BiasCohortReport {
  if (blind.length !== labeled.length) throw new Error("estimate: blind/labeled length mismatch");
  if (blind.length === 0) throw new Error("estimate: no sessions");
  const results = blind.map((b, i) => computeBiasResult("estimate", items, b, labeled[i]));
  const swayPts = results.map((r) => r.adjustedMeanShiftPts);
  const drifts = results.map((r) => r.controlDriftPts);
  const withDrift = drifts.filter((d): d is number => d !== null);
  return {
    dataSource,
    nPersons: blind.length,
    swayPts,
    controlDriftPts: drifts,
    meanSwayPts: mean(swayPts),
    meanControlDriftPts: withDrift.length > 0 ? mean(withDrift) : null,
  };
}

/** The metrics this module computes (RT-9c). See engine/metricMeta.ts. */
export const ESTIMATE_METRICS: MetricSpec[] = [
  {
    id: "item_p_value",
    label: "Item difficulty (p)",
    definition:
      "Proportion of respondents who answered the item correctly. Higher means EASIER — the field's unfortunate convention, kept because the acceptance band is written in it.",
    formula: "p = (number correct) / (number who answered)",
    unit: "proportion",
    owner: "psychometrics",
    target: `${ACCEPT_P_MIN} – ${ACCEPT_P_MAX}`,
    caveat:
      "Population-dependent: the same item is 'easier' in an abler cohort. Not an intrinsic property of the item.",
  },
  {
    id: "item_discrimination",
    label: "Item discrimination (corrected r-pbis)",
    definition:
      "How well an item separates strong respondents from weak ones — the correlation between getting this item right and scoring well on everything else.",
    formula: "r = corr(item score, total score EXCLUDING this item)",
    unit: "correlation",
    owner: "psychometrics",
    target: `≥ ${ACCEPT_DISCRIMINATION_MIN}`,
    caveat:
      "Undefined (not zero) when everyone answers alike. Attenuated at extreme difficulty, which caps how well it can track true discrimination.",
  },
  {
    id: "alpha",
    label: "Reliability (Cronbach's α / KR-20)",
    definition:
      "How consistently the trials measure the same underlying ability. Low α means an individual score is mostly noise.",
    formula: "α = k/(k−1) · (1 − Σp·q / Var(total))",
    unit: "proportion",
    owner: "psychometrics",
    target: "≥ 0.70 (conventional floor)",
    caveat:
      "The live 6-trial delicacy pool measures α ≈ 0.25 under simulation — far below the floor. Six two-alternative trials cannot support a reliable individual score.",
  },
  {
    id: "split_half",
    label: "Split-half reliability",
    definition:
      "Reliability estimated by correlating two halves of the test and correcting for the halving.",
    formula: "r_sb = 2r / (1 + r), halves split odd/even",
    unit: "proportion",
    owner: "psychometrics",
    target: "≥ 0.70 (conventional floor)",
    caveat: "Odd/even is ONE arbitrary split; a different split gives a different number.",
  },
];

// --------------------------------------------------- Layer B item auto-flag

/**
 * The §1 Layer B verdicts. `PENDING` is not a hedge — it is the honest state
 * of every item in a pool that has never been fielded, and it must be
 * distinguishable from `ACCEPT` at every surface that renders it.
 */
export type ItemVerdict = "ACCEPT" | "TOO_EASY" | "TOO_HARD" | "RETIRE" | "PENDING";

export interface ItemGrade {
  id: string;
  verdict: ItemVerdict;
  /** What to do about it, in the pipeline's own vocabulary. */
  action: string;
  reasons: string[];
  /** Responses behind the verdict. 0 means the verdict is PENDING by definition. */
  n: number;
  pValue: number | null;
  discrimination: number | null;
  discriminationCorrected: number | null;
  /** Binomial SE of p̂ in proportion units — null at n = 0. */
  pStandardError: number | null;
}

/**
 * Minimum responses before an item may be judged at all.
 *
 * At n = 30 the standard error of p̂ near the middle of the band is about 0.09,
 * which is wider than the distance from the band edge to its centre — so a
 * verdict there would be a coin flip dressed as a decision. This is the number
 * that stops the auto-flag from retiring good items on noise. PROVISIONAL: it
 * is a power argument, not a measured threshold, and it should rise if the
 * cohort turns out to be heterogeneous.
 */
export const MIN_N_TO_GRADE = 30;

/**
 * Reliability below which DISCRIMINATION verdicts are withheld.
 *
 * A corrected point-biserial correlates an item against the rest of the test,
 * so the test IS the criterion. When the test is unreliable the criterion is
 * unreliable, and every item's discrimination is attenuated toward zero
 * regardless of its quality — judging items on it then retires good items for
 * a defect of the instrument around them.
 *
 * MEASURED (2026-08-08, simulated banks at 800 respondents): the number of
 * items clearing the 0.20 floor is 0/6 at six trials, 2/12, 8/24, 11/40 and
 * 43/80. At the live pool's length NOTHING can pass, because a two-alternative
 * task floors at 50% and half the correct answers on hard items are coin
 * flips. The §1 band was written without reference to what a 2AFC instrument
 * of this length can achieve.
 */
export const MIN_RELIABILITY_TO_JUDGE_DISCRIMINATION = 0.5;

/**
 * Grade one item against the §1 acceptance band (pivot §1 Layer B).
 *
 * This is the computed verdict that REPLACES the PM ear pass. Note what it
 * does and does not decide: it judges an item by how people actually answered
 * it, which is the standard of evidence in psychometrics — and it is silent
 * until people have. An item with no responses is PENDING, never ACCEPT.
 *
 * Order matters: non-discrimination is checked FIRST and retires the item
 * regardless of difficulty. An item everyone gets right at exactly p = 0.70
 * would otherwise be "accepted" while telling us nothing about anybody, and
 * discrimination is the property that makes an item worth keeping at all.
 */
export function gradeItem(stats: ItemStats, reliability: number | null = 1): ItemGrade {
  const canJudgeDiscrimination =
    reliability !== null && reliability >= MIN_RELIABILITY_TO_JUDGE_DISCRIMINATION;
  const base = {
    id: stats.id,
    n: stats.n,
    pValue: stats.n > 0 ? stats.pValue : null,
    discrimination: stats.discrimination,
    discriminationCorrected: stats.discriminationCorrected ?? null,
    pStandardError:
      stats.n > 0 ? Math.sqrt((stats.pValue * (1 - stats.pValue)) / stats.n) : null,
  };

  if (stats.n < MIN_N_TO_GRADE) {
    return {
      ...base,
      verdict: "PENDING",
      action: `collect responses — ${stats.n}/${MIN_N_TO_GRADE} needed before this item can be judged`,
      reasons: [`n = ${stats.n} is below the ${MIN_N_TO_GRADE} required to grade`],
    };
  }

  // DIFFICULTY IS CHECKED FIRST, and the ordering is load-bearing.
  //
  // An out-of-band item has a cheap, reversible fix — move it a rung on the
  // strength ladder. Retirement is terminal. For a two-alternative task the two
  // conditions overlap badly: p is bounded below by 0.5, so an item near the
  // floor is BOTH "too hard" and, necessarily, non-discriminating — nothing
  // correlates with a coin flip. Checking discrimination first would retire
  // every too-hard item outright, destroying items that would be perfectly good
  // one rung gentler. Only an item that sits INSIDE the band and still fails to
  // separate anyone is genuinely dead weight.
  if (stats.pValue > ACCEPT_P_MAX) {
    return {
      ...base,
      verdict: "TOO_EASY",
      action: "increase degradation one rung on the strength ladder",
      reasons: [`p ${stats.pValue.toFixed(2)} > ${ACCEPT_P_MAX} — nearly everyone gets it right`],
    };
  }
  if (stats.pValue < ACCEPT_P_MIN) {
    return {
      ...base,
      verdict: "TOO_HARD",
      action: "decrease degradation one rung on the strength ladder",
      reasons: [`p ${stats.pValue.toFixed(2)} < ${ACCEPT_P_MIN} — closer to guessing than to hearing`],
    };
  }

  // Discrimination is only judged when the test is reliable enough for the
  // judgement to mean anything (see MIN_RELIABILITY_TO_JUDGE_DISCRIMINATION).
  if (!canJudgeDiscrimination) {
    return {
      ...base,
      verdict: "PENDING",
      action: "lengthen the test — discrimination cannot be judged on an unreliable criterion",
      reasons: [
        `difficulty is in band, but reliability ${reliability === null ? "is unknown" : reliability.toFixed(2)} ` +
          `< ${MIN_RELIABILITY_TO_JUDGE_DISCRIMINATION}: the rest-score this item is correlated against is itself mostly noise`,
      ],
    };
  }
  // The gate judges the ATTENUATION-CORRECTED figure (RT-21a) — the raw
  // point-biserial is contaminated by the criterion's own unreliability, and
  // judging items on it retired good ones for a defect of the test around them.
  const judged = stats.discriminationCorrected ?? stats.discrimination;
  if (judged === null) {
    return {
      ...base,
      verdict: "RETIRE",
      action: "retire — every respondent answered identically",
      reasons: ["discrimination is undefined (no variance in responses)"],
    };
  }
  if (judged < ACCEPT_DISCRIMINATION_MIN) {
    return {
      ...base,
      verdict: "RETIRE",
      action: "retire — the item does not separate strong respondents from weak ones",
      reasons: [
        `discrimination ${judged.toFixed(2)} < ${ACCEPT_DISCRIMINATION_MIN}` +
          (stats.discriminationCorrected !== null ? " (corrected for attenuation)" : ""),
      ],
    };
  }

  return { ...base, verdict: "ACCEPT", action: "keep", reasons: [] };
}

export interface ItemGradeReport {
  dataSource: DataSource;
  nPersons: number;
  grades: ItemGrade[];
  /** Counts per verdict — the auto-flag summary the /lab panel renders. */
  summary: Record<ItemVerdict, number>;
  /**
   * Set when the verdicts indict the INSTRUMENT rather than the items.
   *
   * Measured 2026-08-08: applying the §1 floor of 0.20 to a healthy simulated
   * bank retires 24 of 40 items at alpha 0.634, and 6 of 6 at the live pool's
   * length. A two-alternative task floors at 50%, so half the correct answers
   * on hard items are coin flips and every item-total correlation is
   * attenuated; the number of items clearing 0.20 runs 0/6, 2/12, 8/24, 11/40,
   * 43/80. A gate that condemns most of a good bank is reporting its own
   * threshold, not the items, and it must say so rather than let someone act
   * on the verdicts.
   */
  warning: string | null;
}

export function gradeItems(report: ItemStatsReport, reliability: number | null = 1): ItemGradeReport {
  const grades = report.items.map((i) => gradeItem(i, reliability));
  const summary: Record<ItemVerdict, number> = {
    ACCEPT: 0,
    TOO_EASY: 0,
    TOO_HARD: 0,
    RETIRE: 0,
    PENDING: 0,
  };
  for (const g of grades) summary[g.verdict]++;

  const judged = grades.length - summary.PENDING;
  const warning =
    judged > 0 && summary.RETIRE / judged > 0.5
      ? `${summary.RETIRE} of ${judged} judged items were retired. A rate this high usually means the ` +
        `discrimination floor (${ACCEPT_DISCRIMINATION_MIN}) is unreachable for a test of this length and ` +
        `format, not that the items are bad — a 2AFC task's guessing floor attenuates every item-total ` +
        `correlation. Lengthen the test or revisit the floor before acting on these verdicts.`
      : null;

  return { dataSource: report.dataSource, nPersons: report.nPersons, grades, summary, warning };
}
