/**
 * THE ANSWER KEY FOR THE LAB'S FUNNEL DEMONSTRATION (E19/S17).
 *
 * The rates here are INVENTIONS and the page says so in as many words. They are
 * not this product's rates and not anybody's: they exist so the estimator can be
 * asked to find them. Keeping them in `content/` rather than in the page is the
 * same rule the rest of this project follows — a figure a surface prints comes
 * from a module, so a test can reach it.
 *
 * THE STEPS ARE REAL EVENT NAMES, taken from the published funnel specification
 * rather than typed again here. A demonstration that ran on invented event
 * names would be demonstrating something other than this product's funnel, and
 * `funnel-demo.test.ts` refuses that.
 */
import { FUNNEL_SPEC } from "./funnel-spec";
import { recoverFunnel, type FunnelRecoveryRow, type FunnelStep } from "@/analytics/funnel";

/** Enough that the estimator should be tight; small enough to run at build time. */
export const DEMO_ARRIVALS = 4000;
export const DEMO_REPLICATIONS = 200;

/** Fixed, so the table is identical for every reader and every checkout. */
export const DEMO_SEED = 20260907;

/**
 * Pass-through rates, in the order the specification lists its steps. Chosen to
 * span the range where a proportion behaves differently — near the top, at a
 * half where the uncertainty is largest, and in between — so the demonstration
 * is not quietly easy.
 */
const CHOSEN: readonly number[] = [0.9, 0.5, 0.75, 0.6, 0.55, 0.45, 0.7, 0.65];

export const DEMO_STEPS: FunnelStep[] = FUNNEL_SPEC.map((step, i) => ({
  event: step.event,
  passThrough: CHOSEN[i % CHOSEN.length],
}));

/**
 * MEMOISED, BECAUSE IT IS DETERMINISTIC AND IT IS NOT CHEAP (E19/S23).
 *
 * 200 replications over 4,000 arrivals across 8 steps is about 6.4 million
 * Bernoulli draws. The seed is fixed, so every call returns the identical table
 * — and it was being called three times by the tests and once per render of
 * `/lab`. Recomputing an answer that cannot change is the kind of waste that
 * shows up as somebody else's test timing out: this session's additions pushed
 * the suite from roughly 120 to 199 seconds of test time, and unrelated tests
 * began failing under the contention.
 */
let cached: FunnelRecoveryRow[] | null = null;

export function demoRecovery(): FunnelRecoveryRow[] {
  if (cached === null) {
    cached = recoverFunnel(DEMO_STEPS, DEMO_ARRIVALS, DEMO_REPLICATIONS, DEMO_SEED);
  }
  return cached;
}
