/**
 * FITTING A THRESHOLD INSTEAD OF AVERAGING LEVELS (R4, 2026-08-15).
 *
 * WHY THIS EXISTS. `estimateThreshold` averages the ladder levels at the last
 * eight reversals. R2 measured what that costs, exactly, on an endless ladder
 * over an infinite run: a bias of -0.25 ladder steps — the printed number is a
 * flat ~8.5% too sensitive, for every listener, on every family. R2 also
 * located it: both halves of that bias are properties of averaging LEVELS. The
 * levels the staircase visits are not centred on the threshold, and reversals
 * are a further shifted subset of them.
 *
 * R3 measured the other half of the problem. The interval we print beside the
 * number covers the truth 49-72% of the time while claiming 95%, because it is
 * the standard error of eight reversal levels — how much those eight numbers
 * disagree WITHIN one run, which is not how much the estimate moves BETWEEN
 * runs. A 95% interval that covers 60% is a false statement (N3).
 *
 * THE MOVE. Stop averaging levels. Treat the session for what it is — a set of
 * (magnitude, right/wrong) observations — and fit the curve that generated
 * them. Where the samples fell then changes the estimate's PRECISION, not its
 * centre, so neither of R2's terms binds it. And the uncertainty comes out of
 * the fit rather than from the scatter of eight numbers.
 *
 * The staircase does not change at all. It remains the sampler; it is a good
 * one, because it spends its trials near the threshold where they are
 * informative. Only the arithmetic at the end changes, so this costs zero extra
 * trials and zero extra seconds of anybody's time.
 *
 * HOW, and it is deliberately the boring version. A grid over (alpha, beta,
 * lapse), the exact likelihood of the observed responses at every grid point, a
 * flat prior, and the posterior read off. No optimiser, no starting values, no
 * convergence to check — a grid cannot land in a local maximum or fail to
 * terminate, and at this size it costs under a millisecond. The estimator stays
 * a PURE FUNCTION of the responses, which is the property the rest of
 * src/engine/ has and the reason a session can be replayed from a share URL.
 *
 * WHAT IT STILL REFUSES TO DO. The four outcome kinds survive, because the
 * honesty they encode is not negotiable: a listener whose threshold sits past
 * the end of the ladder gets a BOUND, not a number (see `estimateThreshold`'s
 * header). The test is now posterior mass rather than a half-step heuristic,
 * which is both more principled and easier to state: if the fit's best guess
 * lies outside the range we can render, we say so.
 */
import type { StaircaseConfig, StaircaseState, ThresholdOutcome } from "./staircase";

/** Chance performance on a two-alternative forced choice. Not a parameter. */
export const GUESS_2AFC = 0.5;

/**
 * Where a 2-down/1-up rule converges: P(correct)^2 = 0.5, exactly 1/sqrt(2).
 * The threshold this module reports is the level at this probability, so that
 * it means the same thing the staircase was chasing.
 */
export const P_CONVERGE_2DOWN1UP = Math.SQRT1_2;

/**
 * The psychometric function: probability of a correct answer at magnitude `x`.
 *
 * `alpha` is the 75%-point in the family's physical unit, `beta` the slope in
 * LOG units, `lapse` the error rate at asymptote (a mis-click at a level the
 * listener can plainly hear).
 *
 * Logistic in log(x) because every ladder in this system is geometric — one
 * step is a constant RATIO — so log-magnitude is the axis on which listeners
 * are modelled and thresholds are averaged everywhere else in the codebase.
 *
 * THE ONE DEFINITION. `src/analytics/observer.ts` simulates listeners with this
 * same function rather than its own copy. That makes the recovery evidence
 * WELL-SPECIFIED — the fit knows the true functional form — which flatters it,
 * and the honest response is to test misspecification explicitly rather than to
 * keep a second, differently-wrong copy of the model around (threshold-fit.test.ts).
 */
export function psychometric(x: number, alpha: number, beta: number, lapse: number): number {
  return GUESS_2AFC + (1 - GUESS_2AFC - lapse) / (1 + Math.exp(-(Math.log(x) - Math.log(alpha)) / beta));
}

/** The magnitude at which this curve reaches `target`, by bisection on log(x). */
export function levelAtP(target: number, alpha: number, beta: number, lapse: number): number {
  if (target >= 1 - lapse) throw new Error(`levelAtP: curve with lapse ${lapse} never reaches P=${target}`);
  let lo = Math.log(alpha) - 50 * beta;
  let hi = Math.log(alpha) + 50 * beta;
  for (let i = 0; i < 120; i++) {
    const mid = (lo + hi) / 2;
    if (psychometric(Math.exp(mid), alpha, beta, lapse) < target) lo = mid;
    else hi = mid;
  }
  return Math.exp((lo + hi) / 2);
}

/**
 * THE GRID IS PARAMETERISED BY THE THING WE REPORT, and that is not a detail.
 *
 * The obvious grid is over (alpha, beta) — the curve's own parameters — with a
 * flat prior on each. MEASURED, and it is why this comment exists: that grid
 * carries a bias of about -0.30 ladder steps, because a flat prior on
 * (log alpha, log beta) is NOT a flat prior on the threshold. The reported
 * quantity is a function of both, so an opinion about alpha and beta becomes an
 * unintended opinion about the answer.
 *
 * So the axes are (threshold, beta) and alpha is derived. The relationship is
 * exact rather than fitted: for a lapse-free 2AFC curve at P = 1/sqrt(2), the
 * logistic's midpoint sits a factor of sqrt(2)^beta above the threshold. Now a
 * flat prior on log(threshold) means what it says, and beta is a nuisance
 * parameter integrated out rather than a second opinion smuggled in.
 *
 * THE RANGE spans a quarter of the ladder's floor to four times its ceiling —
 * wider than the ladder ON PURPOSE. A listener whose threshold is past the end
 * has to be REPRESENTABLE, or the fit would be forced to place them inside it
 * and would manufacture exactly the over-claim the outcome kinds exist to
 * prevent. This is also what lets the fit escape the ladder-end truncation that
 * R2 measured at +0.499 steps for a floor-adjacent listener: the reversal
 * average cannot report a level the ladder does not contain, and this can.
 *
 * beta 0.10 to 1.50 in log units covers a listener who goes from guessing to
 * certain within a third of a ladder step, out to one who takes four steps.
 *
 * lapse is a short discrete set rather than a continuous axis. Four values is
 * all 38 trials can distinguish, and pinning it at a single value would hand
 * back the R1 finding — a 6% lapse rate shifted the printed threshold by up to
 * half a step.
 */
const THRESHOLD_POINTS = 81;
const BETA_POINTS = 12;
const BETA_MIN = 0.1;
const BETA_MAX = 1.5;
const LAPSE_GRID = [0, 0.02, 0.04, 0.06];

interface FitGrid {
  cells: number;
  /** log of the lapse-free 70.7% level for each cell — what we report. */
  logThreshold: Float64Array;
  /** cells x levels, flattened: log P(correct) and log P(wrong). */
  logP: Float64Array;
  log1mP: Float64Array;
  /** Cell indices sorted by logThreshold, for weighted quantiles. */
  order: Int32Array;
}

const gridCache = new Map<string, FitGrid>();

function buildGrid(levels: number[]): FitGrid {
  const key = levels.join(",");
  const cached = gridCache.get(key);
  if (cached) return cached;

  const logSpace = (from: number, to: number, n: number) =>
    Array.from({ length: n }, (_, i) => Math.exp(Math.log(from) + ((Math.log(to) - Math.log(from)) * i) / (n - 1)));

  const thresholds = logSpace(levels[0] / 4, levels[levels.length - 1] * 4, THRESHOLD_POINTS);
  const betas = logSpace(BETA_MIN, BETA_MAX, BETA_POINTS);

  /**
   * alpha = threshold * ALPHA_OVER_THRESHOLD^beta. Derived from the model, not
   * typed in: at the reported probability the lapse-free logistic has risen a
   * fraction F of its range, and the log-odds of F is exactly how far the
   * midpoint sits above the threshold, in units of beta.
   */
  const F = (P_CONVERGE_2DOWN1UP - GUESS_2AFC) / (1 - GUESS_2AFC);
  const ALPHA_OVER_THRESHOLD = (1 - F) / F;

  const cells = thresholds.length * betas.length * LAPSE_GRID.length;
  const logThreshold = new Float64Array(cells);
  const logP = new Float64Array(cells * levels.length);
  const log1mP = new Float64Array(cells * levels.length);

  let c = 0;
  for (const t of thresholds) {
    for (const beta of betas) {
      // The reported threshold is the LAPSE-FREE 70.7% level: a mis-click is
      // not deafness, so the number describes the ear rather than the session
      // (R1's `claimTarget`, and the D4 deliverable it serves).
      const alpha = t * Math.pow(ALPHA_OVER_THRESHOLD, beta);
      for (const lapse of LAPSE_GRID) {
        logThreshold[c] = Math.log(t);
        for (let l = 0; l < levels.length; l++) {
          const p = psychometric(levels[l], alpha, beta, lapse);
          logP[c * levels.length + l] = Math.log(p);
          log1mP[c * levels.length + l] = Math.log(1 - p);
        }
        c++;
      }
    }
  }

  const order = Int32Array.from(
    Array.from({ length: cells }, (_, i) => i).sort((a, b) => logThreshold[a] - logThreshold[b]),
  );
  const grid: FitGrid = { cells, logThreshold, logP, log1mP, order };
  gridCache.set(key, grid);
  return grid;
}

/**
 * The threshold, its interval, or an honest statement that there isn't one.
 *
 * Drop-in for `estimateThreshold`: same arguments, same four outcome kinds.
 *
 * The likelihood depends only on how many trials at each LEVEL were right, not
 * on the order they arrived in, so the session collapses to two small counts
 * per level before any grid work happens. That is not an approximation — the
 * responses are conditionally independent given the curve, and a staircase's
 * choice of what to present next depends only on answers already given, which
 * makes the adaptive design ignorable for the likelihood.
 */
/**
 * THE POSTERIOR ITSELF, before any refusal is applied (E5/S3, 2026-08-20).
 *
 * `fitThreshold` computes this and then decides whether the session has earned
 * the right to print a point estimate. That decision is the right one — but it
 * throws the INTERVAL away with the point, and the interval is the part that
 * was never in doubt: R4 measured its coverage at 94-100% while the point was
 * the contested quantity.
 *
 * E5/S2 measured what discarding it costs. Refusing per session and reporting
 * only the survivors SELECTS on having produced a narrow posterior, and that
 * selection is correlated with where the estimate landed: pb4's survivors came
 * back 0.54 ladder steps too sensitive, against 0.04-0.11 for the same ladder
 * at a budget where it never has to refuse. A selected minority getting a
 * flattering number is worse than everyone getting a wide honest one.
 *
 * So this is exported: it lets a surface report EVERY session's interval and
 * withhold only the interpolated point, which removes the selection rather than
 * correcting for it (PM ruling RT-90a b).
 *
 * Returns `null` for a session with no answers — there is a posterior there,
 * but it is exactly the prior, and handing that back as a measurement is the
 * thing this whole module exists to refuse.
 */
export interface ThresholdPosterior {
  /** All in LOG magnitude, on the config's own axis. */
  logMedian: number;
  logLo: number;
  logHi: number;
  trials: number;
  reversalsUsed: number;
}

export function fitPosterior(
  state: StaircaseState,
  config: StaircaseConfig,
  /**
   * One-sided tail probability for `logLo`/`logHi`. 0.025 gives the 95%
   * interval `fitThreshold` uses for its own refusal; a caller reporting a
   * BAND may ask for a tighter one, provided it measures what that costs in
   * coverage (E5/S3 does).
   */
  tail = 0.025,
): ThresholdPosterior | null {
  const r = fitInternal(state, config, tail);
  return r.posterior;
}

export function fitThreshold(state: StaircaseState, config: StaircaseConfig): ThresholdOutcome {
  return fitInternal(state, config, 0.025).outcome;
}

function fitInternal(
  state: StaircaseState,
  config: StaircaseConfig,
  tail: number,
): { outcome: ThresholdOutcome; posterior: ThresholdPosterior | null } {
  const { levels } = config;
  const trials = state.trials.length;
  const nCorrect = new Float64Array(levels.length);
  const nWrong = new Float64Array(levels.length);
  for (const t of state.trials) {
    if (t.correct) nCorrect[t.index]++;
    else nWrong[t.index]++;
  }
  if (trials === 0) {
    return { outcome: { kind: "inconclusive", reversalsUsed: 0, trials }, posterior: null };
  }

  const grid = buildGrid(levels);
  const logPost = new Float64Array(grid.cells);
  let best = -Infinity;
  for (let c = 0; c < grid.cells; c++) {
    let ll = 0;
    const base = c * levels.length;
    for (let l = 0; l < levels.length; l++) {
      if (nCorrect[l]) ll += nCorrect[l] * grid.logP[base + l];
      if (nWrong[l]) ll += nWrong[l] * grid.log1mP[base + l];
    }
    logPost[c] = ll; // flat prior, so the log-posterior IS the log-likelihood
    if (ll > best) best = ll;
  }

  // Normalise in a way that cannot overflow: subtract the maximum first.
  let total = 0;
  for (let c = 0; c < grid.cells; c++) {
    logPost[c] = Math.exp(logPost[c] - best);
    total += logPost[c];
  }

  /** Weighted quantile over cells sorted by threshold. */
  const quantile = (q: number) => {
    let acc = 0;
    for (let i = 0; i < grid.order.length; i++) {
      acc += logPost[grid.order[i]] / total;
      if (acc >= q) return grid.logThreshold[grid.order[i]];
    }
    return grid.logThreshold[grid.order[grid.order.length - 1]];
  };

  const median = quantile(0.5);
  const lo = quantile(tail);
  const hi = quantile(1 - tail);
  const floor = levels[0];
  const top = levels[levels.length - 1];
  const reversalsUsed = Math.min(state.reversalIndices.length, config.useLastReversals);
  const posterior: ThresholdPosterior = { logMedian: median, logLo: lo, logHi: hi, trials, reversalsUsed };

  /**
   * THE REFUSALS, restated as posterior statements rather than heuristics.
   *
   * A threshold outside the ladder is one the pipeline cannot render a trial
   * for, so we never observed the listener there and must not print a number as
   * though we had. The old check asked whether the reversal average sat within
   * half a step of an end; this one asks where the fit actually believes the
   * answer is, which is the question that was always meant.
   */
  if (median < Math.log(floor)) return { outcome: { kind: "below", bound: floor, trials }, posterior };
  if (median > Math.log(top)) return { outcome: { kind: "above", bound: top, trials }, posterior };

  /**
   * And if the interval is wider than the whole ladder, the session has not
   * located anything — reporting its midpoint would be reporting the prior.
   */
  if (hi - lo >= Math.log(top) - Math.log(floor)) {
    return { outcome: { kind: "inconclusive", reversalsUsed, trials }, posterior };
  }

  /**
   * THE POINT ESTIMATE IS THE POSTERIOR MEDIAN, not its mean, and the reason is
   * coherence before it is performance: the `below` / `above` refusals above
   * are median tests, and an estimator whose printed number can sit on the
   * other side of the ladder end from the statement that decided whether to
   * print it is incoherent by construction.
   *
   * It also happens to be the robust choice. The prior spans a quarter of the
   * ladder floor to four times its ceiling, which for a NARROW ladder is a lot
   * of prior mass outside the range any trial can be rendered in — the timing
   * ladder covers 8x while its prior covers 128x. A posterior with mass leaking
   * into that region drags a mean and barely moves a median.
   */
  return {
    outcome: {
      kind: "threshold",
      threshold: Math.exp(median),
      ci95: [Math.exp(lo), Math.exp(hi)],
      reversalsUsed,
      trials,
    },
    posterior,
  };
}
