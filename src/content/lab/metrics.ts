/**
 * The metric dictionary — the Lab's semantic layer (artifact pivot §4).
 *
 * ONE definition per number, and every number the Lab displays must appear
 * here. This is the thing that separates a dashboard from a pile of charts: a
 * reader can ask "what exactly is that, who owns it, and what would good look
 * like" and get an answer without reading the source.
 *
 * RULES ENFORCED BY TEST (src/content/lab/lab.test.ts):
 * - ids are unique, kebab-free, and stable (they are referenced by panels)
 * - `computedIn` names a REAL module that exists in the repo — a dictionary
 *   that drifts from the code is worse than no dictionary, because it looks
 *   authoritative while lying
 * - every panel's `metricIds` resolve here
 * - `target` is either a concrete band or explicitly null; a metric with no
 *   defensible target must SAY so rather than inventing one (N3)
 */

export type MetricUnit =
  | "proportion"
  | "percent"
  | "points"
  | "logits"
  | "correlation"
  | "count";

/**
 * Who is accountable for the number moving — the BI ownership column.
 *
 * There is deliberately no "product" owner yet: product metrics (completion,
 * share, return rate) require a fielded instrument, and declaring the category
 * while nothing fills it is scaffolding pretending to be structure. S11 adds it
 * when it has something real to hold.
 */
export type MetricOwner = "instrument" | "psychometrics" | "ops";

export interface MetricDefinition {
  id: string;
  label: string;
  /** Plain language. What does this number mean to someone who is not us? */
  definition: string;
  /** The formula as actually implemented, not an idealized version of it. */
  formula: string;
  unit: MetricUnit;
  /** Repo-relative module that computes it. Existence is asserted by test. */
  computedIn: string;
  owner: MetricOwner;
  /** A concrete acceptance band, or null when we have no honest target yet. */
  target: string | null;
  /** Said EVERY time the number is shown. N3 lives in this field. */
  caveat?: string;
}

export const METRICS: MetricDefinition[] = [
  // ---------------------------------------------------------- item statistics
  {
    id: "item_p_value",
    label: "Item difficulty (p)",
    definition:
      "Proportion of respondents who answered the item correctly. Higher means EASIER — the field's unfortunate convention, kept because the acceptance band is written in it.",
    formula: "p = (number correct) / (number who answered)",
    unit: "proportion",
    computedIn: "src/analytics/estimate.ts",
    owner: "psychometrics",
    target: "0.55 – 0.85",
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
    computedIn: "src/analytics/estimate.ts",
    owner: "psychometrics",
    target: "≥ 0.20",
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
    computedIn: "src/analytics/estimate.ts",
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
    computedIn: "src/analytics/estimate.ts",
    owner: "psychometrics",
    target: "≥ 0.70 (conventional floor)",
    caveat: "Odd/even is ONE arbitrary split; a different split gives a different number.",
  },

  // ------------------------------------------------------------- prestige bias
  {
    id: "sway_pct",
    label: "Sway (drift-corrected)",
    definition:
      "How far ratings moved toward the shown label between the blind and labeled passes, as a share of the rating scale. Positive = swayed by the label; negative = resisted it.",
    formula: "pct = round((adjusted mean shift / scale span) · 100), adjusted = raw − d̄·(nUp−nDown)/n",
    unit: "percent",
    computedIn: "src/engine/bias.ts",
    owner: "instrument",
    target: null,
    caveat:
      "Not a percentile. Understates the true effect: re-rating anchors people on their first answer, and the scale ceiling truncates upward movement.",
  },
  {
    id: "sway_raw_pct",
    label: "Sway (uncorrected)",
    definition:
      "The same shift before the control-drift correction is applied. Shown beside the corrected figure so the correction is never invisible.",
    formula: "rawPct = round((mean shift toward label / scale span) · 100)",
    unit: "percent",
    computedIn: "src/engine/bias.ts",
    owner: "instrument",
    target: null,
  },
  {
    id: "control_drift_pts",
    label: "Control drift",
    definition:
      "How much a respondent's ratings move on the second pass for clips that carry NO label — the baseline for memory, familiarity, and regression.",
    formula: "d̄ = mean(second pass − first pass) over control items",
    unit: "points",
    computedIn: "src/engine/bias.ts",
    owner: "instrument",
    target: null,
    caveat:
      "Biased toward zero by the scale ceiling: control ratings sitting at the maximum can only fall, so the correction it feeds is systematically too small.",
  },
  {
    id: "sway_share",
    label: "Sway share",
    definition:
      "Of the clips that had room to move toward their label, the share that actually did. The one sway statistic the scale-edge artifact cannot touch.",
    formula: "share = (items moved toward label) / (items with headroom > 0)",
    unit: "proportion",
    computedIn: "src/engine/bias.ts",
    owner: "instrument",
    target: null,
  },

  // -------------------------------------------------------------- delicacy
  {
    id: "delicacy_accuracy",
    label: "Delicacy accuracy",
    definition:
      "Share of trials where the respondent correctly identified which of two clips was the unmodified original.",
    formula: "accuracy = (correct side picks) / (trials)",
    unit: "proportion",
    computedIn: "src/engine/delicacy.ts",
    owner: "instrument",
    target: "above 0.50 chance",
    caveat: "Two-alternative forced choice: 50% is a coin flip, not a middling score.",
  },
  {
    id: "flaw_accuracy",
    label: "Flaw-identification accuracy",
    definition:
      "Share of correctly-identified trials where the respondent also named the right degradation family.",
    formula: "accuracy = (correct flaw picks) / (trials where the side pick was correct)",
    unit: "proportion",
    computedIn: "src/engine/delicacy.ts",
    owner: "instrument",
    target: "above 0.33 chance",
    caveat:
      "Scored only on trials where the side pick was right — judging the flaw in the wrong file is unscoreable, not wrong.",
  },

  // ---------------------------------------------------------- good sense
  {
    id: "brier",
    label: "Brier score",
    definition:
      "Mean squared error between claimed confidence and what actually happened. Lower is better; it rewards knowing how right you are.",
    formula: "brier = mean((claimed probability − outcome)²)",
    unit: "proportion",
    computedIn: "src/engine/calibration.ts",
    owner: "instrument",
    target: "below 0.25 (the always-guess-50% anchor)",
    caveat:
      "Misleads alone: a perfectly accurate respondent who always claims 50% scores the same 0.25 as someone guessing. Always pair it with the confidence gap.",
  },
  {
    id: "calibration_gap_pts",
    label: "Confidence gap",
    definition:
      "Mean claimed confidence minus actual accuracy. Positive = claiming more than delivered.",
    formula: "gap = mean(confidence) − accuracy, both in percentage points",
    unit: "points",
    computedIn: "src/engine/calibration.ts",
    owner: "instrument",
    target: "within ±10 points",
    caveat:
      "The ±10 threshold is provisional judgment, not data. At session length the gap's standard error can exceed the threshold itself.",
  },

  // ------------------------------------------------------- pipeline validation
  {
    id: "item_p_rmse",
    label: "Item-difficulty recovery error",
    definition:
      "Root mean squared error between estimated item difficulty and the known difficulty that generated the data. The headline evidence that the estimator works.",
    formula: "rmse = √mean((estimated p − true p)²)",
    unit: "proportion",
    computedIn: "src/analytics/recovery.ts",
    owner: "psychometrics",
    target: "shrinks toward 0 as sample size grows",
    caveat: "Computable only against simulated data, where the truth is known by construction.",
  },
  {
    id: "theta_recovery_r",
    label: "Ability recovery correlation",
    definition:
      "Correlation between a respondent's score and their true underlying ability. Capped by reliability — it cannot reach 1 on a test of finite length.",
    formula: "r = corr(proportion correct, true θ)",
    unit: "correlation",
    computedIn: "src/analytics/recovery.ts",
    owner: "psychometrics",
    target: "approaches √reliability",
    caveat: "Improves with TEST LENGTH, not with sample size.",
  },
  {
    id: "mean_beta_bias",
    label: "Sway attenuation bias",
    definition:
      "How far the cohort's mean measured sway sits below the true mean susceptibility. Systematic, not noise — recruiting more respondents does not reduce it.",
    formula: "bias = mean(estimated sway) − mean(true β), averaged over replications",
    unit: "points",
    computedIn: "src/analytics/recovery.ts",
    owner: "psychometrics",
    target: "0 (currently ≈ −0.065)",
    caveat:
      "Magnitude depends on assumed model parameters and must not be quoted as a measured property of real listeners.",
  },

  // ------------------------------------------------------------------- ops
  {
    id: "sessions_completed",
    label: "Completed sessions",
    definition:
      "Sessions that reached the result screen. The denominator under every cohort statistic.",
    formula: "count(bias_result events), excluding ?ref=dev traffic",
    unit: "count",
    computedIn: "scripts/analysis/kpi-status.mjs",
    owner: "ops",
    target: "≥ 300 for defensible provisional norms; ≥ 100 for meaningful charts",
    caveat: "Currently 0 — the instrument has never been fielded.",
  },
];

const byId = new Map(METRICS.map((m) => [m.id, m]));

/** Throws on an unknown id: a panel referencing a nonexistent metric is a bug. */
export function metric(id: string): MetricDefinition {
  const m = byId.get(id);
  if (!m) throw new Error(`lab: unknown metric id "${id}" (not in the dictionary)`);
  return m;
}

export function metricIds(): string[] {
  return METRICS.map((m) => m.id);
}
