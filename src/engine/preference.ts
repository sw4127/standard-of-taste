/**
 * THE PREFERENCE INSTRUMENT (E21/S1, Track RT-P1 a).
 *
 * The four shipped instruments turn DAMAGE into language — detune, smear,
 * codec artifacts. None turns PREFERENCE into language, and the second of the
 * project's two listener findings is that almost nobody can describe their own
 * taste in words. This module is the arithmetic for the instrument that tries.
 *
 * WHAT IT DOES. A person states six preferences in words, then makes forced
 * choices between pairs that are the SAME PERFORMANCE re-rendered, differing on
 * exactly one dimension. The stated preference is compared with the chosen one.
 * The product is the disagreement.
 *
 * ---------------------------------------------------------------------------
 * THE SELF-REPORT STEP, AND WHY IT DOES NOT BREACH D2
 *
 * D2 says measurement is performance tasks where the user can be wrong, never
 * self-report. There is a stated claim here, so the tension is real and is
 * stated rather than buried. The defence is structural: THE CLAIM IS NEVER
 * SCORED. It contributes nothing to any number. It is a hypothesis the blind
 * choices are about to confirm or refute, and the only thing it can produce is
 * the label "agrees" or "contradicts" attached to a result computed entirely
 * from performance. Delete every claim and every number in this module is
 * unchanged. That is the test of whether self-report is being scored, and this
 * module passes it — `computePreferenceResult` takes the claims second and
 * touches them in exactly one place.
 *
 * ---------------------------------------------------------------------------
 * WHY A SIGN TEST, AND WHY MULTIPLICITY IS CORRECTED
 *
 * A dimension is a run of forced binary choices with no right answer. Under
 * indifference each choice is a coin, so the exact two-sided binomial test
 * against p = 0.5 is the whole statistic — there is no model to fit and no
 * parameter to estimate, which matters because this instrument has never been
 * fielded and any estimated parameter would be simulated (N3).
 *
 * SIX DIMENSIONS MEANS SIX TESTS. At alpha = 0.05 uncorrected, the chance of
 * at least one false "we found something" across six indifferent dimensions is
 * about 26%. This instrument's entire product is a single sentence of the form
 * "you said X, you chose Y" — so a false positive here is not a rounding error,
 * it is the fabricated finding N3 exists to forbid, arrived at by being helpful.
 * Holm-Bonferroni is applied across the dimensions tested in the sitting. It
 * controls the family-wise error rate, it is uniformly more powerful than plain
 * Bonferroni, and its first and most stringent step is alpha/m — which is what
 * sets the trial floor below.
 *
 * ---------------------------------------------------------------------------
 * THE FLOOR, WHICH IS THE POINT OF BUILDING THIS FIRST
 *
 * With n binary choices the smallest attainable two-sided p is 2^(1-n), reached
 * only by a unanimous run. So below a certain n a dimension CANNOT produce a
 * finding no matter how strong the listener's preference is. That n depends on
 * how many dimensions share the correction:
 *
 *     m = 1 -> 6 choices     m = 3 -> 7 choices     m = 6 -> 8 choices
 *
 * A dimension under its floor is reported as UNDERPOWERED, never as "no
 * preference found". The difference is the difference between "we looked and
 * there was nothing" and "we could not have seen it if it were there", and
 * collapsing the second into the first is how an instrument invents a null
 * result. `verdictOf` keeps them apart by construction.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS MODULE MAY NEVER BE USED TO SAY (N3, D1)
 *
 * Nothing here is a percentile and nothing compares one person to another;
 * there is no cohort and there will not be one. A consistent leaning is a fact
 * about choices made on these pairs in this sitting, not a trait, a personality
 * or a prediction (D1). Every pair differs on ONE rendered dimension of the
 * same performance, so nothing here speaks to melody, arrangement, structure or
 * words — a surface claiming otherwise is inventing. And nobody has measured
 * whether acting on these words improves anything anyone makes; the transfer
 * claim stays refused.
 */

import type { MetricSpec } from "./metricMeta";

/** Family-wise error rate this instrument is willing to run. */
export const PREFERENCE_ALPHA = 0.05;

/**
 * Largest run this module will evaluate exactly.
 *
 * Past a point the binomial coefficients and the 2^n denominator stop being
 * exactly representable as doubles, and an instrument whose p-values silently
 * lose precision is worse than one that refuses. The binding quantities are the
 * central coefficient and the largest reachable tail, 2^(n-1); at n = 48 those
 * are 3.2e13 and 1.4e14, both far under 2^53, and at n = 54 the tail reaches
 * 2^53 exactly. So 48, and `the arithmetic stays exact` is pinned by test
 * rather than asserted here.
 *
 * IT WAS 40, AND 40 WAS WRONG — recorded because the correction came from the
 * instrument's own power calculation rather than from review. `trialsForPower`
 * returned null for a listener choosing one pole 75% of the time across six
 * dimensions, which reads as "no run can detect that" and is false: the honest
 * answer is a number in the forties. A bound chosen for numerical comfort had
 * truncated the range the instrument most needs to talk about, and a refusal
 * that lands inside the interesting region is indistinguishable from a finding.
 */
export const PREFERENCE_MAX_TRIALS = 48;

/** One end of a dimension: what a person can prefer, and what they can be told. */
export interface PreferencePole {
  id: string;
  /** The word a generation tool would take. */
  word: string;
  /** The first-person statement shown at the self-report step. */
  statement: string;
}

export interface PreferenceDimension {
  id: string;
  label: string;
  /** What is rendered differently between the two takes. Plain language. */
  renders: string;
  poles: [PreferencePole, PreferencePole];
}

/**
 * The six dimensions, chosen because this project's own render pipeline can
 * already produce all of them from one performance. That is the only reason
 * this instrument is feasible at all, and it is a constraint on the list
 * rather than a claim that these six are the important ones.
 */
export const PREFERENCE_DIMENSIONS: PreferenceDimension[] = [
  {
    id: "dynamics",
    label: "Dynamics",
    renders: "how much the loud and quiet parts are levelled against each other",
    poles: [
      { id: "open", word: "open", statement: "I like music that feels open and unforced" },
      {
        id: "controlled",
        word: "tightly controlled",
        statement: "I like music that feels tight and controlled",
      },
    ],
  },
  {
    id: "brightness",
    label: "Brightness",
    renders: "how much energy sits in the top of the frequency range",
    poles: [
      { id: "bright", word: "bright", statement: "I like music that sounds bright and forward" },
      { id: "dark", word: "dark", statement: "I like music that sounds dark and rounded" },
    ],
  },
  {
    id: "space",
    label: "Space",
    renders: "how much room tone sits around the performance",
    poles: [
      { id: "spacious", word: "spacious", statement: "I like music that sounds like a large room" },
      { id: "close", word: "close", statement: "I like music that sounds close and intimate" },
    ],
  },
  {
    id: "saturation",
    label: "Warmth",
    renders: "how much harmonic colour is added to the signal",
    poles: [
      { id: "warm", word: "warm", statement: "I like music that sounds warm and coloured" },
      { id: "clean", word: "clean", statement: "I like music that sounds clean and uncoloured" },
    ],
  },
  {
    id: "tempo",
    label: "Tempo",
    renders: "how fast the same performance is played back",
    poles: [
      { id: "faster", word: "faster", statement: "I like music that pushes ahead" },
      { id: "slower", word: "slower", statement: "I like music that takes its time" },
    ],
  },
  {
    id: "width",
    label: "Width",
    renders: "how far apart the stereo image is spread",
    poles: [
      { id: "wide", word: "wide", statement: "I like music that spreads wide across the speakers" },
      { id: "narrow", word: "narrow", statement: "I like music that stays centred" },
    ],
  },
];

const DIMENSIONS_BY_ID = new Map(PREFERENCE_DIMENSIONS.map((d) => [d.id, d]));

/** Exact binomial coefficient. Exact for n <= PREFERENCE_MAX_TRIALS. */
function choose(n: number, k: number): number {
  let acc = 1;
  for (let i = 1; i <= k; i++) acc = (acc * (n - k + i)) / i;
  return Math.round(acc);
}

/**
 * Exact two-sided binomial (sign) test of k successes in n against p = 0.5.
 *
 * Symmetric form: twice the tail beyond whichever side is further from the
 * middle, capped at 1. Returns 1 for n = 0 — no evidence is not evidence of
 * nothing, and a zero there would read as certainty.
 */
export function twoSidedSignP(k: number, n: number): number {
  if (!Number.isInteger(k) || !Number.isInteger(n)) {
    throw new Error("preference: counts must be integers");
  }
  if (n < 0 || k < 0 || k > n) throw new Error(`preference: ${k} of ${n} is not a valid count`);
  if (n > PREFERENCE_MAX_TRIALS) {
    throw new Error(
      `preference: ${n} trials exceeds the exact-arithmetic bound of ${PREFERENCE_MAX_TRIALS}`,
    );
  }
  if (n === 0) return 1;
  const far = Math.max(k, n - k);
  let tail = 0;
  for (let i = far; i <= n; i++) tail += choose(n, i);
  return Math.min(1, (2 * tail) / Math.pow(2, n));
}

/**
 * Fewest choices on one dimension that could EVER produce a finding, when m
 * dimensions share the Holm correction.
 *
 * Computed by asking `twoSidedSignP` rather than by inverting it in closed
 * form, so the floor and the test cannot disagree about what clears alpha.
 * Returns null when no run within the exact bound would clear it.
 */
export function minimumTrialsForDetection(
  dimensionCount: number,
  alpha: number = PREFERENCE_ALPHA,
): number | null {
  if (!Number.isInteger(dimensionCount) || dimensionCount < 1) {
    throw new Error("preference: dimensionCount must be a positive integer");
  }
  const strictest = alpha / dimensionCount;
  for (let n = 1; n <= PREFERENCE_MAX_TRIALS; n++) {
    if (twoSidedSignP(n, n) <= strictest) return n;
  }
  return null;
}

/**
 * Fewest choices per dimension for an ~80%-power chance of detecting a listener
 * whose true rate of choosing one pole is `rate`.
 *
 * THIS IS THE NUMBER THAT SIZES THE CLIP POOL, which is the expensive part of
 * building this instrument. The detection floor says what is possible; this
 * says what is likely, and the gap between them is large. Returns null when no
 * run within the exact bound reaches the requested power — which is itself the
 * answer for weak preferences, and is meant to be reported rather than rounded
 * away.
 *
 * IT IS DELIBERATELY CONSERVATIVE, AND THE DIRECTION IS STATED RATHER THAN
 * BURIED. Every dimension is costed against Holm's STRICTEST step, alpha/m,
 * because which step a dimension lands on depends on the other dimensions'
 * results and so is unknown when a pool is being planned. That is plain
 * Bonferroni, so the true requirement for a dimension that happens to sort late
 * is lower and this figure is an UPPER bound. Sizing a pool from an upper bound
 * wastes rendering; sizing it from an optimistic one produces a sitting that
 * reports noise, and only one of those two errors is a lie to a reader.
 */
export function trialsForPower(
  rate: number,
  dimensionCount: number,
  power = 0.8,
  alpha: number = PREFERENCE_ALPHA,
): number | null {
  if (!(rate > 0.5 && rate <= 1)) throw new Error("preference: rate must lie in (0.5, 1]");
  const strictest = alpha / dimensionCount;
  for (let n = 1; n <= PREFERENCE_MAX_TRIALS; n++) {
    let attained = 0;
    for (let k = 0; k <= n; k++) {
      if (twoSidedSignP(k, n) > strictest) continue;
      attained += choose(n, k) * Math.pow(rate, k) * Math.pow(1 - rate, n - k);
    }
    if (attained >= power) return n;
  }
  return null;
}

/** A stated preference. Never scored — see the header. */
export interface PreferenceClaim {
  dimension: string;
  /** Which pole of that dimension the person said they prefer. */
  pole: string;
}

/** One forced choice between two takes of the same passage. */
export interface PreferenceTrial {
  dimension: string;
  /** The pole of the take they chose to hear more of. */
  chose: string;
}

export type PreferenceVerdict =
  /** The leaning cleared the corrected threshold. */
  | "consistent"
  /**
   * Enough choices to have found something; nothing cleared the threshold.
   * This is a refusal, not a zero: it means "no preference, or one too weak
   * for this many choices to see", and the instrument cannot separate those.
   */
  | "indeterminate"
  /** Below the floor. A finding was IMPOSSIBLE here, however strong the taste. */
  | "underpowered";

export type PreferenceAgreement = "agrees" | "contradicts" | "no-claim" | "undetermined";

export interface PreferenceDimensionResult {
  dimension: string;
  label: string;
  trials: number;
  /** Choices toward each pole, in the dimension's declared pole order. */
  counts: [number, number];
  /** The pole chosen more often, or null on an exact tie. */
  leaning: string | null;
  /** Exact two-sided p for the leaning, uncorrected. */
  p: number;
  /**
   * The Holm threshold this dimension's p was compared against, or NULL when
   * Holm stopped before reaching it and no threshold was ever applied.
   *
   * Null rather than zero, which is what this carried first. Zero is
   * unreachable and so behaves correctly in the comparison, but a surface
   * rendering it prints "the bar was 0.000", which tells a reader the
   * instrument demanded impossible evidence rather than that it stopped
   * testing. A sentinel that is only correct until somebody displays it is a
   * defect with a delay on it (N3).
   */
  threshold: number | null;
  verdict: PreferenceVerdict;
  /** What they said, if they said anything about this dimension. */
  claimed: string | null;
  agreement: PreferenceAgreement;
}

export interface PreferenceResult {
  dimensions: PreferenceDimensionResult[];
  trialCount: number;
  /** Fewest choices per dimension that could have produced any finding here. */
  trialFloor: number | null;
  /** True when EVERY dimension tested met that floor. */
  powered: boolean;
  /** Dimensions whose blind choices contradicted the stated preference. */
  contradictions: string[];
  /** Dimensions whose blind choices confirmed it. */
  agreements: string[];
  /**
   * The words a generation tool would take. Drawn ONLY from dimensions whose
   * verdict is "consistent" — an indeterminate or underpowered dimension
   * contributes nothing, because a word offered on a coin-flip is a fabricated
   * finding wearing a helpful tone (N3).
   */
  words: string[];
}

/**
 * THE ORDER OF THESE THREE BRANCHES IS THE HONESTY OF THE INSTRUMENT.
 *
 * Underpowered is checked FIRST, and it is not redundant with the threshold
 * comparison — which is what it looked like until a mutation test found the
 * case. Holm's later steps are LAXER than its first (alpha/1 at the end against
 * alpha/m at the start), so a dimension with too few choices to clear the
 * strictest step can still clear a late one if enough other dimensions rejected
 * ahead of it. Six unanimous choices reach p = 0.031 and would pass a final
 * step of 0.05 while sitting two choices below the six-dimension floor of 8.
 * Without this branch first, that dimension is reported as a finding — a real
 * one by arithmetic, but one the sitting was never long enough to have earned.
 */
function verdictOf(
  p: number,
  threshold: number | null,
  trials: number,
  floor: number | null,
): PreferenceVerdict {
  if (floor === null || trials < floor) return "underpowered";
  if (threshold === null) return "indeterminate";
  return p <= threshold ? "consistent" : "indeterminate";
}

/**
 * The instrument. Throws on malformed input exactly as the other engines do:
 * a trial naming a dimension that does not exist is a bug upstream, not a user
 * error, and swallowing it would silently drop evidence.
 */
export function computePreferenceResult(
  trials: PreferenceTrial[],
  claims: PreferenceClaim[] = [],
  alpha: number = PREFERENCE_ALPHA,
): PreferenceResult {
  if (trials.length === 0) throw new Error("preference: no trials");

  const byDimension = new Map<string, [number, number]>();
  for (const trial of trials) {
    const dimension = DIMENSIONS_BY_ID.get(trial.dimension);
    if (!dimension) throw new Error(`preference: unknown dimension "${trial.dimension}"`);
    const index = dimension.poles.findIndex((pole) => pole.id === trial.chose);
    if (index < 0) {
      throw new Error(`preference: "${trial.chose}" is not a pole of "${trial.dimension}"`);
    }
    const counts = byDimension.get(trial.dimension) ?? [0, 0];
    counts[index]++;
    byDimension.set(trial.dimension, counts);
  }

  const claimed = new Map<string, string>();
  for (const claim of claims) {
    const dimension = DIMENSIONS_BY_ID.get(claim.dimension);
    if (!dimension) throw new Error(`preference: unknown dimension "${claim.dimension}"`);
    if (!dimension.poles.some((pole) => pole.id === claim.pole)) {
      throw new Error(`preference: "${claim.pole}" is not a pole of "${claim.dimension}"`);
    }
    if (claimed.has(claim.dimension)) {
      throw new Error(`preference: two claims for "${claim.dimension}"`);
    }
    claimed.set(claim.dimension, claim.pole);
  }

  // Tested in the order the dimensions are declared, so a result reads the same
  // way twice regardless of the order trials happened to arrive in.
  const tested = PREFERENCE_DIMENSIONS.filter((d) => byDimension.has(d.id));
  const m = tested.length;
  const floor = minimumTrialsForDetection(m, alpha);

  const rows = tested.map((dimension) => {
    const counts = byDimension.get(dimension.id) as [number, number];
    const trialsHere = counts[0] + counts[1];
    const tied = counts[0] === counts[1];
    const leadIndex: 0 | 1 = counts[0] > counts[1] ? 0 : 1;
    return {
      dimension,
      counts,
      trials: trialsHere,
      leaning: tied ? null : dimension.poles[leadIndex].id,
      p: twoSidedSignP(Math.max(counts[0], counts[1]), trialsHere),
    };
  });

  // Holm-Bonferroni: p-values ascending, compared against alpha/(m - step), and
  // the moment one fails, every larger p fails with it regardless of its own
  // step threshold. Walked over the ORIGINAL indices so the declared output
  // order survives the sort.
  const ascending = rows.map((row, i) => i).sort((a, b) => rows[a].p - rows[b].p);
  const thresholds = new Array<number | null>(rows.length);
  let stillRejecting = true;
  ascending.forEach((rowIndex, step) => {
    if (stillRejecting && rows[rowIndex].p > alpha / (m - step)) stillRejecting = false;
    // Once one step fails, every larger p fails with it and no threshold is
    // applied to it at all — that is what "Holm stops" means, and null says it
    // rather than encoding it as a number a surface would then print.
    thresholds[rowIndex] = stillRejecting ? alpha / (m - step) : null;
  });

  const dimensions: PreferenceDimensionResult[] = rows.map((row, i) => {
    const verdict = verdictOf(row.p, thresholds[i], row.trials, floor);
    const said = claimed.get(row.dimension.id) ?? null;
    const agreement: PreferenceAgreement =
      said === null
        ? "no-claim"
        : verdict !== "consistent" || row.leaning === null
          ? "undetermined"
          : row.leaning === said
            ? "agrees"
            : "contradicts";
    return {
      dimension: row.dimension.id,
      label: row.dimension.label,
      trials: row.trials,
      counts: row.counts,
      leaning: row.leaning,
      p: row.p,
      threshold: thresholds[i],
      verdict,
      claimed: said,
      agreement,
    };
  });

  const wordFor = (row: PreferenceDimensionResult): string => {
    const dimension = DIMENSIONS_BY_ID.get(row.dimension) as PreferenceDimension;
    return (dimension.poles.find((pole) => pole.id === row.leaning) as PreferencePole).word;
  };

  return {
    dimensions,
    trialCount: trials.length,
    trialFloor: floor,
    powered: floor !== null && dimensions.every((d) => d.trials >= floor),
    contradictions: dimensions.filter((d) => d.agreement === "contradicts").map((d) => d.dimension),
    agreements: dimensions.filter((d) => d.agreement === "agrees").map((d) => d.dimension),
    words: dimensions.filter((d) => d.verdict === "consistent").map(wordFor),
  };
}

/**
 * Declared beside the arithmetic per RT-9c. DELIBERATELY NOT REGISTERED in
 * `src/content/lab/metrics.ts`: the Lab is a public surface, this instrument is
 * not built, and a dictionary entry for a metric nobody can produce describes a
 * product that does not exist. Register it in the slice that ships the flow.
 */
export const PREFERENCE_METRICS: MetricSpec[] = [
  {
    id: "preference_consistency",
    label: "Preference consistency",
    definition:
      "How often a listener chose the same side of one rendered dimension, across forced choices between two takes of the same performance. There is no right answer; the measurement is whether the choices agree with each other.",
    formula:
      "exact two-sided binomial test of the majority count against p = 0.5, compared against a Holm-Bonferroni threshold over the dimensions tested in the sitting",
    unit: "proportion",
    owner: "instrument",
    target: null,
    caveat:
      "A dimension below the detection floor is reported as underpowered, never as no-preference-found: a short run cannot see a preference however strong it is. A leaning that does not clear the corrected threshold is reported as indeterminate, which means no preference OR one too weak for this many choices — the instrument cannot separate those two.",
  },
  {
    id: "preference_contradiction",
    label: "Stated-versus-chosen contradiction",
    definition:
      "Dimensions where the pole a listener chose blind is the opposite of the one they said they preferred. The stated preference is never scored; it only labels a result computed entirely from blind choices.",
    formula: "claimed pole != leaning pole, counted only where the leaning is consistent",
    unit: "count",
    owner: "instrument",
    target: null,
    caveat:
      "A fact about choices on these pairs in this sitting, not a trait and not a prediction (D1). Every pair is one performance re-rendered, so nothing here speaks to melody, arrangement or structure. Nobody has measured whether acting on these words improves what anyone makes.",
  },
];
