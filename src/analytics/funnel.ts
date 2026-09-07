/**
 * THE FUNNEL ANALYSIS, DEMONSTRATED ON DATA WHOSE TRUTH IS KNOWN (E19/S17,
 * PM ruling RT-J a + the 2026-09-06 amendment).
 *
 * WHY THIS EXISTS. The Lab already says honestly why the funnel panel is not
 * built — a funnel is a set of ratios and nobody has been through the
 * instrument, so every rate would be zero over zero — and it publishes the
 * SPECIFICATION plus how much traffic each rate would need. That is the right
 * answer to "where is your data".
 *
 * It is not an answer to the question a hiring reader is actually asking, which
 * is whether the person can DO the analysis. The owner ruled that the Lab must
 * carry a demonstration, because traffic will not arrive before the
 * applications do.
 *
 * A MOCK DASHBOARD WOULD BE THE WRONG ANSWER, and N2 names why: numbers that
 * look like findings and are not. So the demonstration borrows the argument the
 * psychometrics panel already makes — generate data from parameters you CHOSE,
 * run the estimator, and show it recovers them. Nothing here is a claim about
 * this product's funnel. Every figure is a claim about the ESTIMATOR, and it is
 * checkable because the answer was known before the data existed.
 *
 * WHAT IT DEMONSTRATES, in the order a reader meets it:
 *   1. that the estimator is unbiased — the mean estimate converges on the rate
 *      that generated the data, and the error shrinks as the square root of n;
 *   2. that its interval means what it says — a 95% interval covers the true
 *      rate about 95 times in 100, which is the property that makes a number
 *      publishable rather than decorative;
 *   3. what sample size the funnel would need before a step's rate could be
 *      read at all — which is the same arithmetic the Lab already publishes,
 *      now shown working rather than asserted.
 *
 * NO SEEDED-RANDOM SURPRISES. `mulberry32`, the generator the clip pipeline and
 * the psychometrics simulation already use: same seed, same table, forever, so
 * a figure on the page is reproducible by anyone who checks out this commit.
 */

/** mulberry32 — the generator used everywhere else in this project. */
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** z for a two-sided 95% interval. The Lab's precision arithmetic uses the same. */
export const Z_95 = 1.96;

export interface FunnelStep {
  /** The event this step would be counted from. */
  readonly event: string;
  /** Share of the PREVIOUS step's arrivals that reach this one. */
  readonly passThrough: number;
}

export interface StepEstimate {
  readonly event: string;
  /** Reached this step. */
  readonly n: number;
  /** Reached the previous step — the denominator. */
  readonly of: number;
  /** n / of, or null when the denominator is zero. A rate needs a denominator. */
  readonly rate: number | null;
  /** Wilson bounds, null wherever the rate is. */
  readonly low: number | null;
  readonly high: number | null;
}

/**
 * THE WILSON INTERVAL, not the textbook one.
 *
 * The normal approximation puts the bound outside [0, 1] at the edges and
 * collapses to zero width at exactly 0 or 1 — "everybody converted, give or
 * take nothing". `delicacy.ts` chose Wilson for the same reason on the same
 * grounds, and a funnel spends its life near the edges.
 */
export function wilson(n: number, of: number, z = Z_95): { low: number; high: number } {
  if (of <= 0) throw new Error("wilson: no denominator");
  const p = n / of;
  const d = 1 + (z * z) / of;
  const centre = p + (z * z) / (2 * of);
  const spread = z * Math.sqrt((p * (1 - p)) / of + (z * z) / (4 * of * of));
  return { low: Math.max(0, (centre - spread) / d), high: Math.min(1, (centre + spread) / d) };
}

/**
 * One synthetic run: `arrivals` people enter, each step keeps them with its own
 * probability. Independent Bernoulli draws per person per step — the simplest
 * model that can be wrong in the way a real funnel is wrong.
 */
export function simulateFunnel(
  steps: readonly FunnelStep[],
  arrivals: number,
  seed: number,
): number[] {
  const rng = makeRng(seed);
  const counts: number[] = [];
  let alive = arrivals;
  for (const step of steps) {
    let survived = 0;
    for (let i = 0; i < alive; i += 1) if (rng() < step.passThrough) survived += 1;
    counts.push(survived);
    alive = survived;
  }
  return counts;
}

/** Per-step rate and interval, from counts alone. Never invents a denominator. */
export function estimateFunnel(
  steps: readonly FunnelStep[],
  counts: readonly number[],
  arrivals: number,
): StepEstimate[] {
  const out: StepEstimate[] = [];
  let previous = arrivals;
  for (const [i, step] of steps.entries()) {
    const n = counts[i];
    const of = previous;
    if (of <= 0) {
      out.push({ event: step.event, n, of, rate: null, low: null, high: null });
    } else {
      const { low, high } = wilson(n, of);
      out.push({ event: step.event, n, of, rate: n / of, low, high });
    }
    previous = n;
  }
  return out;
}

export interface FunnelRecoveryRow {
  readonly event: string;
  readonly truth: number;
  /** Mean of the per-replication estimates. */
  readonly estimated: number;
  /** estimated − truth, in percentage points. */
  readonly biasPoints: number;
  /** Share of replications whose interval contained the truth. */
  readonly coverage: number;
  /** Replications where the step had a denominator at all. */
  readonly usable: number;
}

/**
 * THE DEMONSTRATION ITSELF. Run the whole thing `replications` times and ask
 * two questions of the estimator: does it land on the truth on average, and do
 * its intervals contain the truth as often as they claim.
 *
 * A replication whose denominator collapsed to zero is COUNTED SEPARATELY
 * rather than dropped quietly. At small arrivals the last step can have nobody
 * reaching it, and averaging only over the runs that worked would report a
 * cleaner estimator than the one that exists.
 */
export function recoverFunnel(
  steps: readonly FunnelStep[],
  arrivals: number,
  replications: number,
  seed: number,
): FunnelRecoveryRow[] {
  const sums = steps.map(() => 0);
  const covered = steps.map(() => 0);
  const usable = steps.map(() => 0);

  for (let r = 0; r < replications; r += 1) {
    const counts = simulateFunnel(steps, arrivals, seed + r * 7919);
    const rows = estimateFunnel(steps, counts, arrivals);
    for (const [i, row] of rows.entries()) {
      if (row.rate === null || row.low === null || row.high === null) continue;
      usable[i] += 1;
      sums[i] += row.rate;
      if (steps[i].passThrough >= row.low && steps[i].passThrough <= row.high) covered[i] += 1;
    }
  }

  return steps.map((step, i) => {
    const mean = usable[i] > 0 ? sums[i] / usable[i] : 0;
    return {
      event: step.event,
      truth: step.passThrough,
      estimated: mean,
      biasPoints: (mean - step.passThrough) * 100,
      coverage: usable[i] > 0 ? covered[i] / usable[i] : 0,
      usable: usable[i],
    };
  });
}
