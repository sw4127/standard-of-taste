/**
 * R3 — WHAT THE ACCEPTANCE CRITERION SHOULD BE (2026-08-15).
 *
 * THE PROBLEM THIS SLICE EXISTS TO FIX. E3 set out to hold the staircase to
 * RMSE < 1.0 ladder steps, measured 0.85-1.39, and moved the line to 1.5. Both
 * numbers were invented: 1.0 was a pre-measurement guess, and 1.5 was argued
 * backwards from the result. Neither was derived from anything the product has
 * to say to a person.
 *
 * SO DERIVE IT. The product makes exactly two claims (CLAUDE.md, D4 amendment:
 * "a per-flaw sensitivity threshold in physical units ... plus where the ear
 * fails and a loop that moves it"), and RMSE-in-steps is the wrong gate for
 * both of them.
 *
 * CLAIM 1, CROSS-SECTIONAL: "your threshold is 34 cents (CI 24-48)."
 *   The gate is not RMSE. It is whether the stated interval actually contains
 *   the truth as often as it says. A 95% interval that covers 60% of the time
 *   is a false statement printed next to every result (N3), and nobody had ever
 *   checked ours.
 *
 * CLAIM 2, LONGITUDINAL, and it is the Gym's entire reason to exist: "your ear
 * moved." The gate here is different again, and the difference matters:
 *
 *   A RETEST IS A DIFFERENCE, AND A CONSTANT BIAS CANCELS IN A DIFFERENCE.
 *   R2 measured the dominant bias term as a constant -0.25 steps. It is present
 *   in session 1 and in session 2 and subtracts out of the change. So the
 *   longitudinal claim is limited by PRECISION (the run-to-run SD), not by
 *   RMSE. Judging the retest arc by RMSE would hold it to a standard the
 *   arithmetic says it does not have to meet.
 *
 *   With both sessions at SD sigma, the change has SD sigma*sqrt(2). So:
 *     MDC     = 1.96 * sqrt(2) * sigma = 2.772 sigma   (detected 50% of the time)
 *     MDC80   = 2.80 * sqrt(2) * sigma = 3.960 sigma   (detected 80% of the time)
 *   and the criterion inverts: sigma <= (smallest change the arc must show) /
 *   3.96. That is a derivation from the claim, and it does not care what the
 *   measured number turns out to be — which is exactly what 1.5 could not say.
 *
 * THE CAVEAT ON CANCELLATION, stated rather than buried: term A cancels because
 * it is constant. Term B — ladder-end truncation — does NOT, because a listener
 * who improves moves closer to the ladder floor and picks up more of it. On the
 * timing ladder R2 measured B at +0.499 steps for a floor-adjacent listener.
 * Improvement therefore carries a bias of its own, in the direction of
 * UNDERSTATING improvement, and no estimator fixes that. Only a longer ladder does.
 *
 * SIMULATED throughout; there are zero real responses (N3).
 */
import { describe, expect, it } from "vitest";
import {
  claimTarget,
  observer as obs,
  runStaircaseSession,
  type Observer,
} from "@/analytics/observer";
import { DEFAULT_STAIRCASE, type StaircaseConfig } from "./staircase";

const PITCH = [3.1, 4.4, 6.3, 8.8, 12.5, 17.7, 25, 35.4, 50, 70.7, 100];
const TIMING = [12.5, 15.7, 19.8, 25, 31.5, 39.7, 50, 63, 79.4, 100];

const stepUnit = (levels: number[]) => Math.pow(levels[levels.length - 1] / levels[0], 1 / (levels.length - 1));

const cfg = (levels: number[], overrides: Partial<StaircaseConfig> = {}): StaircaseConfig => ({
  ...DEFAULT_STAIRCASE,
  levels,
  startIndex: levels.length - 3,
  ...overrides,
});

/**
 * THE SMALLEST CHANGE THE ARC MUST BE ABLE TO SHOW: one ladder step.
 *
 * Not chosen for convenience — it is the instrument's own unit of resolution.
 * The ladders are geometric by construction so that one step means the same
 * proportional change wherever it lands, and a training loop that cannot see
 * its own smallest increment is claiming something it cannot observe. On pitch
 * one step is a factor of sqrt(2): "you now hear 25-cent drift where you used
 * to need 35."
 */
const SMALLEST_MEANINGFUL_CHANGE_STEPS = 1;

/** Two-sided 95%, 50% power — the classic minimum detectable change. */
const MDC_FACTOR = 1.96 * Math.SQRT2;
/** Two-sided 95%, 80% power — what it takes to show a person their own change. */
const MDC80_FACTOR = (1.96 + 0.8416) * Math.SQRT2;

/**
 * THE DERIVED CRITERION. sigma is the run-to-run standard deviation of the
 * estimate in ladder steps.
 */
const TARGET_SIGMA_50 = SMALLEST_MEANINGFUL_CHANGE_STEPS / MDC_FACTOR;
const TARGET_SIGMA_80 = SMALLEST_MEANINGFUL_CHANGE_STEPS / MDC80_FACTOR;

const CONDITIONS: Array<[string, number[], Observer]> = [
  ["pitch, sensitive", PITCH, obs(12, 0.35)],
  ["pitch, average", PITCH, obs(25, 0.35)],
  ["pitch, insensitive", PITCH, obs(50, 0.35)],
  ["pitch, shallow slope", PITCH, obs(25, 0.7)],
  ["timing, average", TIMING, obs(31.5, 0.35)],
  ["timing, sensitive", TIMING, obs(19.8, 0.35)],
];

const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
const sd = (v: number[]) => {
  const m = mean(v);
  return Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / (v.length - 1));
};
const quantile = (v: number[], q: number) => {
  const s = [...v].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(q * s.length))];
};

/** One batch of independent sessions, reported in ladder steps from the truth. */
function batch(levels: number[], o: Observer, seedBase: number, n: number, overrides: Partial<StaircaseConfig> = {}) {
  const config = cfg(levels, overrides);
  const unit = Math.log(stepUnit(levels));
  const truth = Math.log(claimTarget(o));
  const errors: number[] = [];
  let covered = 0;
  let trials = 0;
  for (let s = 1; s <= n; s++) {
    const { outcome } = runStaircaseSession(o, (seedBase + s) * 7919, config);
    if (outcome.kind !== "threshold") continue;
    errors.push((Math.log(outcome.threshold) - truth) / unit);
    if (Math.log(outcome.ci95[0]) <= truth && truth <= Math.log(outcome.ci95[1])) covered++;
    trials += outcome.trials;
  }
  return {
    errors,
    bias: mean(errors),
    sigma: sd(errors),
    rmse: Math.sqrt(mean(errors.map((e) => e * e))),
    coverage: covered / errors.length,
    meanTrials: trials / errors.length,
    n: errors.length,
    /**
     * Runs that produced no number, and therefore contribute to no sigma.
     * SELECTION, and it flatters: the runs `estimateThreshold` refuses are the
     * ones pinned against a ladder end, which are also the extreme ones. Every
     * sigma below is computed on the survivors and is optimistic by however
     * much this is not zero.
     */
    dropped: n - errors.length,
  };
}

describe("R3 — claim 1: does the printed interval mean what it says? [SIMULATED]", () => {
  const SESSIONS = 2000;

  it("measures the actual coverage of the ci95 we print", () => {
    console.log(`\n[R3] === CI95 COVERAGE [SIMULATED] — ${SESSIONS} sessions per cell ===`);
    console.log(`[R3] A 95% interval must contain the truth 95% of the time. Anything lower is`);
    console.log(`[R3] a false statement printed beside every result (N3).`);
    console.log(`[R3] ${"condition".padEnd(21)} ${"λ=0%".padStart(8)} ${"λ=2%".padStart(8)} ${"λ=6%".padStart(8)}`);
    const worst: number[] = [];
    for (const [label, levels, o] of CONDITIONS) {
      const cells = [0, 0.02, 0.06].map((lapse) => batch(levels, { ...o, lapse }, 0, SESSIONS));
      worst.push(Math.min(...cells.map((c) => c.coverage)));
      console.log(
        `[R3] ${label.padEnd(21)} ${cells.map((c) => `${(c.coverage * 100).toFixed(1)}%`.padStart(8)).join(" ")}`,
      );
    }
    const best = Math.max(...worst);
    const floor = Math.min(...worst);
    console.log(`[R3] coverage spans ${(floor * 100).toFixed(1)}% .. ${(best * 100).toFixed(1)}% (nominal 95%)`);
    /**
     * RECORDED AS A MEASURED FACT, not as a pass. The shipped `ci95` is the
     * standard error of eight reversal LEVELS — it describes how much those
     * eight numbers disagree with each other WITHIN one run, which is a
     * different quantity from how much the estimate moves BETWEEN runs. The
     * engine's own doc comment says as much ("describes the SPREAD OF THE
     * REVERSALS ONLY"); what nobody had done is measure the consequence.
     *
     * BOUNDED ON BOTH SIDES on purpose. The first version asserted only "< 95%",
     * which is satisfied just as well by coverage collapsing to 10% — a guard
     * that only notices good news is not a guard. The upper bound is the
     * tripwire (if it fails, the CI was fixed and the claim can be upgraded);
     * the lower bound catches a regression.
     */
    expect(best, "if this fails the CI now covers — upgrade the claim and this test").toBeLessThan(0.95);
    expect(floor, "coverage has regressed below anything previously measured").toBeGreaterThan(0.4);
  });
});

describe("R3 — claim 2: can the arc see a change? [SIMULATED]", () => {
  const PAIRS = 2000;

  /**
   * The retest, simulated end to end: the same listener, two independent
   * sessions, difference in ladder steps. Under the null there is no change, so
   * everything this produces is measurement noise — which is exactly what the
   * minimum detectable change has to be calibrated against.
   */
  const retestNull = (levels: number[], o: Observer, overrides: Partial<StaircaseConfig> = {}) => {
    const a = batch(levels, o, 0, PAIRS, overrides);
    const b = batch(levels, o, 500_000, PAIRS, overrides);
    const n = Math.min(a.errors.length, b.errors.length);
    const deltas = Array.from({ length: n }, (_, i) => b.errors[i] - a.errors[i]);
    return { a, b, deltas, empirical95: quantile(deltas.map(Math.abs), 0.95) };
  };

  it("derives the minimum detectable change, and checks the formula against simulation", () => {
    console.log(`\n[R3] === MINIMUM DETECTABLE CHANGE [SIMULATED] — ${PAIRS} retest pairs ===`);
    console.log(`[R3] sigma = run-to-run SD (bias cancels in a difference). All figures in ladder steps.`);
    console.log(
      `[R3] ${"condition".padEnd(21)} ${"sigma".padStart(6)} ${"MDC calc".padStart(9)} ` +
        `${"MDC emp.".padStart(9)} ${"MDC80".padStart(7)}   as a factor on the threshold`,
    );
    for (const [label, levels, o] of CONDITIONS) {
      const r = retestNull(levels, o);
      const sigma = sd(r.a.errors);
      const calc = MDC_FACTOR * sigma;
      const ratio = stepUnit(levels);
      console.log(
        `[R3] ${label.padEnd(21)} ${sigma.toFixed(2).padStart(6)} ${calc.toFixed(2).padStart(9)} ` +
          `${r.empirical95.toFixed(2).padStart(9)} ${(MDC80_FACTOR * sigma).toFixed(2).padStart(7)}   ` +
          `x${Math.pow(ratio, calc).toFixed(2)} to detect at all, x${Math.pow(ratio, MDC80_FACTOR * sigma).toFixed(2)} to see reliably` +
          `${r.a.dropped ? `  [${r.a.dropped}/${PAIRS} runs dropped — sigma is optimistic]` : ""}`,
      );
      /**
       * THE CHECK WITH TEETH. The parametric MDC assumes the change is roughly
       * normal; the estimate is a discrete, bounded thing and need not be. If
       * the empirical 95th percentile of |change| under the null disagreed with
       * the formula, the formula would be the wrong tool and every number
       * derived from it would be decoration.
       */
      expect(r.empirical95, `${label}: empirical vs parametric MDC`).toBeGreaterThan(calc * 0.8);
      expect(r.empirical95, `${label}: empirical vs parametric MDC`).toBeLessThan(calc * 1.2);
    }
  });

  it("states the gap between the derived criterion and the instrument", () => {
    console.log(`\n[R3] === THE DERIVED CRITERION vs THE INSTRUMENT [SIMULATED] ===`);
    console.log(`[R3] To show a ${SMALLEST_MEANINGFUL_CHANGE_STEPS}-step change (one ladder rung, x${stepUnit(PITCH).toFixed(2)} on pitch):`);
    console.log(`[R3]   sigma must be <= ${TARGET_SIGMA_50.toFixed(3)} steps to detect it at all (50% power)`);
    console.log(`[R3]   sigma must be <= ${TARGET_SIGMA_80.toFixed(3)} steps to show it reliably (80% power)`);
    const measured = CONDITIONS.map(([label, levels, o]) => {
      const r = batch(levels, o, 0, PAIRS);
      return { label, sigma: r.sigma, rmse: r.rmse, trials: r.meanTrials };
    });
    const worstSigma = Math.max(...measured.map((m) => m.sigma));
    for (const m of measured) {
      console.log(
        `[R3]   ${m.label.padEnd(21)} sigma ${m.sigma.toFixed(2)} — ` +
          `${(m.sigma / TARGET_SIGMA_80).toFixed(1)}x too noisy · ` +
          `needs ~${Math.round(m.trials * (m.sigma / TARGET_SIGMA_80) ** 2)} trials (has ${Math.round(m.trials)})`,
      );
    }
    console.log(`[R3] SHORTFALL: worst sigma ${worstSigma.toFixed(2)} against a target of ${TARGET_SIGMA_80.toFixed(3)}.`);
    console.log(`[R3] The one-step-per-retest claim is NOT supportable at this session length.`);
    /**
     * A TRIPWIRE, not a pass. The instrument fails the derived criterion today
     * and this records by how much. If R4 (or a longer session, or a different
     * estimator) ever closes the gap, THIS ASSERTION FAILS — which is the
     * signal to update the criterion and the product claim together, rather
     * than discovering years later that the copy was never revised.
     */
    expect(worstSigma, "instrument still misses the derived criterion — if this fails, the claim can be upgraded")
      .toBeGreaterThan(TARGET_SIGMA_80);
  });

  /**
   * WHAT PRECISION COSTS. sigma falls as 1/sqrt(reversals), so the question is
   * never "can we be more precise" but "how many minutes is it worth". At 25
   * seconds a trial this is the only table that decides session length.
   */
  it("prices precision in trials, so session length is a choice and not an accident", () => {
    console.log(`\n[R3] === WHAT PRECISION COSTS [SIMULATED] — pitch, average listener ===`);
    console.log(`[R3] reversals  useLast   sigma   trials   minutes@25s   detects (80% power)`);
    for (const [rev, use] of [
      [8, 6],
      [12, 8],
      [20, 16],
      [32, 24],
      [50, 40],
    ]) {
      const r = batch(PITCH, obs(25, 0.35), 0, 500, {
        stopAfterReversals: rev,
        useLastReversals: use,
        maxTrials: 400,
      });
      const detect = Math.pow(stepUnit(PITCH), MDC80_FACTOR * r.sigma);
      console.log(
        `[R3] ${String(rev).padStart(9)} ${String(use).padStart(8)}   ${r.sigma.toFixed(2)}   ` +
          `${r.meanTrials.toFixed(0).padStart(6)}   ${(r.meanTrials * 25 / 60).toFixed(1).padStart(11)}   x${detect.toFixed(2)}`,
      );
    }
  });
});
