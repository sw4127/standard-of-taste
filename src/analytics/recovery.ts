/**
 * Parameter recovery (artifact pivot §2 — the reason the simulator exists).
 *
 * THE CLAIM THIS SUPPORTS: "I validated the estimator by parameter recovery
 * before fielding it." The procedure is the standard one — generate responses
 * from KNOWN parameters, estimate as though they were unknown, and measure how
 * close the estimates land — repeated across sample sizes so the error is shown
 * to shrink with n rather than asserted to.
 *
 * WHAT RECOVERY DOES AND DOES NOT PROVE (N3, load-bearing):
 * - It proves the ESTIMATOR is correct: given data from this model, it returns
 *   the model's parameters. That is a statement about arithmetic.
 * - It proves NOTHING about the items or about real listeners. Recovering d4's
 *   assigned difficulty says only that the code recovers what was put in; it
 *   does not mean anyone can hear d4's pitch drift, and it is not evidence
 *   about any human population. Item audibility is Layer A's job.
 * - If the real response process differs from this model — and it will — the
 *   estimates carry that misspecification. Recovery bounds implementation
 *   error, not model error.
 *
 * WHY MONTE CARLO REPLICATION: a single simulated cohort is one draw. Error at
 * n=50 from one seed can undercut error at n=1000 from another purely by luck,
 * so every point is averaged over independent replications and the monotonicity
 * claim is made about mean error, which is the quantity that actually behaves.
 */

import {
  correlation,
  delicacyMatrix,
  estimateBiasCohort,
  estimateItems,
  estimatePersonScores,
  estimateReliability,
  regressionSlope,
  rmse,
} from "./estimate";
import {
  DEFAULT_PERSON_MODEL,
  pCorrectSide,
  simulateBias,
  simulateDelicacy,
  simulatePersons,
  type PersonModel,
  type SimBiasItem,
  type SimDelicacyItem,
  type SimPerson,
} from "./simulate";

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const sd = (xs: number[]) => {
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
};
const meanOfDefined = (xs: (number | null)[]) => {
  const d = xs.filter((x): x is number => x !== null && Number.isFinite(x));
  return d.length > 0 ? mean(d) : null;
};

/**
 * The model-implied proportion correct for each item IN THIS COHORT — the
 * quantity a CTT p-value actually estimates. Not the item's intrinsic
 * difficulty: p is population-dependent by construction (see estimate.ts), so
 * comparing p̂ against `item.b` would be measuring the wrong thing and would
 * look like a failure of an estimator that is working correctly.
 */
export function trueItemP(items: SimDelicacyItem[], persons: SimPerson[]): number[] {
  return items.map((item) => mean(persons.map((p) => pCorrectSide(item, p.theta))));
}

/**
 * Classical true reliability: Var(true score) / Var(observed score), where a
 * person's true score is their EXPECTED number correct under the model. This is
 * the definition α is an estimator of, so it is the honest benchmark for α.
 */
export function trueReliability(items: SimDelicacyItem[], persons: SimPerson[]): number {
  const trueScores = persons.map((p) => items.reduce((s, item) => s + pCorrectSide(item, p.theta), 0));
  // Observed = true score + independent binomial noise per item, so observed
  // variance is true variance plus the summed per-item error variance.
  const errorVar = mean(
    persons.map((p) => items.reduce((s, item) => {
      const q = pCorrectSide(item, p.theta);
      return s + q * (1 - q);
    }, 0)),
  );
  const m = mean(trueScores);
  const trueVar = mean(trueScores.map((x) => (x - m) ** 2));
  return trueVar / (trueVar + errorVar);
}

/** One (n, reps) cell of the recovery table. Nulls mean "undefined", not zero. */
export interface RecoveryPoint {
  n: number;
  reps: number;
  /** Correlation of estimated vs model-implied item p — same units, so RMSE is meaningful too. */
  itemPCorrelation: number | null;
  itemPRmse: number;
  /**
   * Correlation of corrected point-biserial against the generating
   * discrimination `a`. Reported as a correlation ONLY: r_pbis and a are
   * monotonically related but live in different units, so an RMSE between them
   * would be a number with no interpretation.
   */
  discriminationCorrelation: number | null;
  /** Correlation of per-person proportion correct against true ability θ. */
  thetaCorrelation: number | null;
  /** Estimated α against the model's true reliability. */
  alpha: number | null;
  trueReliability: number;
  /** Correlation of estimated per-person sway (points) against true β. */
  betaCorrelation: number | null;
  /**
   * Regression slope of estimated sway on true β. 1.0 = faithful; below 1.0 =
   * the instrument UNDERSTATES susceptibility, which the engine's own header
   * predicts (anchoring + the scale ceiling). This measures that understatement
   * for the first time instead of asserting it.
   */
  betaSlope: number | null;
  /**
   * Per-person RMSE of estimated sway against true β. THIS DOES NOT SHRINK
   * WITH n, and it is not supposed to: β is a person parameter estimated from
   * that person's own items, so its precision is set by TEST LENGTH. Adding
   * respondents sharpens item statistics and cohort aggregates; it cannot tell
   * you more about a person who answered the same eight questions.
   */
  betaRmse: number;
  /**
   * SAMPLING error of the cohort mean: the SD across replications of
   * (mean β̂ − mean β). Shrinks as 1/√n — this is the column that answers
   * "would more respondents help?".
   */
  meanBetaSe: number;
  /**
   * SYSTEMATIC error of the cohort mean: the average of (mean β̂ − mean β)
   * across replications. FLAT IN n, because it is bias, not noise — it comes
   * from anchoring and the scale ceiling attenuating every measurement in the
   * same direction. Recruiting ten thousand people would not move it.
   *
   * Reported separately from meanBetaSe on purpose: collapsing them into one
   * "error" figure is how a report ends up implying that a known instrument
   * bias is a sample-size problem.
   */
  meanBetaBias: number;
}

export interface RecoveryReport {
  dataSource: "SIMULATED";
  seed: number;
  nItems: number;
  model: PersonModel;
  points: RecoveryPoint[];
}

export interface RecoveryConfig {
  seed: number;
  sampleSizes: number[];
  reps: number;
  delicacyItems: SimDelicacyItem[];
  biasItems: SimBiasItem[];
  model?: PersonModel;
}

export function runRecovery(config: RecoveryConfig): RecoveryReport {
  const { seed, sampleSizes, reps, delicacyItems, biasItems } = config;
  const model = config.model ?? DEFAULT_PERSON_MODEL;
  if (reps < 1) throw new Error(`recovery: reps must be >= 1, got ${reps}`);

  const points = sampleSizes.map((n) => {
    const acc = {
      itemPCorrelation: [] as (number | null)[],
      itemPRmse: [] as number[],
      discriminationCorrelation: [] as (number | null)[],
      thetaCorrelation: [] as (number | null)[],
      alpha: [] as (number | null)[],
      trueReliability: [] as number[],
      betaCorrelation: [] as (number | null)[],
      betaSlope: [] as (number | null)[],
      betaRmse: [] as number[],
      /** Per-replication (mean β̂ − mean β); its mean is bias, its SD is the SE. */
      meanBetaError: [] as number[],
    };

    for (let rep = 0; rep < reps; rep++) {
      // Each replication is an INDEPENDENT cohort — a fresh seed per (n, rep),
      // not a prefix of the previous one, so replications are not correlated.
      const repSeed = seed + rep * 7919 + n * 104729;
      const persons = simulatePersons(repSeed, n, model);
      const del = simulateDelicacy(repSeed, delicacyItems, persons);
      const bias = simulateBias(repSeed, biasItems, persons);

      const matrix = delicacyMatrix("SIMULATED", delicacyItems, del.responses);
      const itemReport = estimateItems(matrix);
      const truth = trueItemP(delicacyItems, persons);
      const estimatedP = itemReport.items.map((i) => i.pValue);

      acc.itemPCorrelation.push(correlation(estimatedP, truth));
      acc.itemPRmse.push(rmse(estimatedP, truth));

      // Items whose discrimination is undefined are excluded from the
      // correlation rather than coerced to 0 (N3) — with the pairs dropped on
      // both sides so the vectors stay aligned.
      const defined = itemReport.items
        .map((it, i) => ({ d: it.discrimination, a: delicacyItems[i].a }))
        .filter((x): x is { d: number; a: number } => x.d !== null);
      acc.discriminationCorrelation.push(
        defined.length >= 2 ? correlation(defined.map((x) => x.d), defined.map((x) => x.a)) : null,
      );

      acc.thetaCorrelation.push(correlation(estimatePersonScores(matrix), persons.map((p) => p.theta)));
      acc.alpha.push(estimateReliability(matrix).alpha);
      acc.trueReliability.push(trueReliability(delicacyItems, persons));

      const biasReport = estimateBiasCohort("SIMULATED", biasItems, bias.blind, bias.labeled);
      const trueBeta = persons.map((p) => p.beta);
      acc.betaCorrelation.push(correlation(biasReport.swayPts, trueBeta));
      acc.betaSlope.push(regressionSlope(trueBeta, biasReport.swayPts));
      acc.betaRmse.push(rmse(biasReport.swayPts, trueBeta));
      acc.meanBetaError.push(biasReport.meanSwayPts - mean(trueBeta));
    }

    return {
      n,
      reps,
      itemPCorrelation: meanOfDefined(acc.itemPCorrelation),
      itemPRmse: mean(acc.itemPRmse),
      discriminationCorrelation: meanOfDefined(acc.discriminationCorrelation),
      thetaCorrelation: meanOfDefined(acc.thetaCorrelation),
      alpha: meanOfDefined(acc.alpha),
      trueReliability: mean(acc.trueReliability),
      betaCorrelation: meanOfDefined(acc.betaCorrelation),
      betaSlope: meanOfDefined(acc.betaSlope),
      betaRmse: mean(acc.betaRmse),
      meanBetaSe: sd(acc.meanBetaError),
      meanBetaBias: mean(acc.meanBetaError),
    } satisfies RecoveryPoint;
  });

  return { dataSource: "SIMULATED", seed, nItems: delicacyItems.length, model, points };
}

/** One item's known-vs-estimated pair — a single dot on the recovery plot. */
export interface RecoveryScatterPoint {
  itemId: string;
  /** Model-implied proportion correct for this cohort — the KNOWN value. */
  trueP: number;
  /** What the estimator returned, knowing none of the above. */
  estimatedP: number;
}

/**
 * ONE replication's raw pairs, for plotting. The aggregate table answers "how
 * big is the error"; the scatter answers "is it error, or is it bias" — a
 * cloud hugging the diagonal and a cloud sitting parallel to it can share an
 * RMSE while meaning entirely different things. Deliberately a single
 * replication rather than an average: averaging replications would shrink the
 * visible spread and make the estimator look better than one run of it is.
 */
export function recoveryScatter(
  seed: number,
  n: number,
  items: SimDelicacyItem[],
  model: PersonModel = DEFAULT_PERSON_MODEL,
): RecoveryScatterPoint[] {
  const persons = simulatePersons(seed, n, model);
  const data = simulateDelicacy(seed, items, persons);
  const estimated = estimateItems(delicacyMatrix("SIMULATED", items, data.responses));
  const truth = trueItemP(items, persons);
  return items.map((item, i) => ({
    itemId: item.id,
    trueP: truth[i],
    estimatedP: estimated.items[i].pValue,
  }));
}

/** Fixed-width recovery table — the S2 proof artifact and the S4 panel's source. */
export function formatRecoveryTable(report: RecoveryReport): string {
  const f = (x: number | null, dp = 3) => (x === null ? "  n/a" : x.toFixed(dp).padStart(5));
  const rows = report.points.map(
    (p) =>
      `  ${String(p.n).padStart(5)} ${String(p.reps).padStart(5)} ` +
      `${f(p.itemPCorrelation)} ${f(p.itemPRmse)} ${f(p.discriminationCorrelation)} ` +
      `${f(p.thetaCorrelation)} ${f(p.alpha)} ${f(p.trueReliability)} ` +
      `${f(p.betaCorrelation)} ${f(p.betaSlope)} ${f(p.betaRmse)} ${f(p.meanBetaSe)} ${f(p.meanBetaBias)}`,
  );
  return [
    `  RECOVERY [SIMULATED] · ${report.nItems} items · seed ${report.seed}`,
    "      n  reps  r(p) rmse(p)  r(a)  r(θ) alpha  true_rel  r(β) slope(β) rmse(β) se(β̄) bias(β̄)",
    ...rows,
    "  rmse(p) shrinks with n: item stats are what more respondents buy.",
    "  rmse(β) is per-PERSON — flat in n by design; TEST LENGTH drives it, not cohort size.",
    "  se(β̄) shrinks with n (sampling error); bias(β̄) does NOT (instrument attenuation).",
  ].join("\n");
}
