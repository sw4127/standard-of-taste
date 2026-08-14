/**
 * The staircase, proven by PARAMETER RECOVERY (E3, 2026-08-15).
 *
 * The standard `src/analytics/` holds its estimators to, applied to the thing
 * that will actually produce a user's headline number: simulate listeners whose
 * threshold is KNOWN, run the real staircase against them, and measure how well
 * it comes back. An adaptive procedure that has only ever been run on real
 * people — whose thresholds nobody knows — has not been shown to measure
 * anything.
 *
 * SIMULATED, and labelled so everywhere it appears (N3). There are still zero
 * real responses.
 */
import { describe, expect, it } from "vitest";
import {
  DEFAULT_STAIRCASE,
  estimateThreshold,
  recordResponse,
  startStaircase,
  type StaircaseConfig,
} from "./staircase";

/** The pitch ladder of record (scripts/clip-pipeline/rungs.mjs, E2/S4a). */
const PITCH = [3.1, 4.4, 6.3, 8.8, 12.5, 17.7, 25, 35.4, 50, 70.7, 100];
/** The timing ladder of record (E2/S4b), a finer ratio over a narrower span. */
const TIMING = [12.5, 15.7, 19.8, 25, 31.5, 39.7, 50, 63, 79.4, 100];

const cfg = (levels: number[], startIndex = levels.length - 3): StaircaseConfig => ({
  ...DEFAULT_STAIRCASE,
  levels,
  startIndex,
});

/** Deterministic PRNG so a failing recovery run can be reproduced exactly. */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A simulated listener. `alpha` is their 75%-correct point; `beta` is the slope
 * in log units (smaller = sharper transition from guessing to hearing).
 *
 * Floored at 0.5 because the task is two-alternative forced choice: someone who
 * hears nothing still gets half right, and any simulation that forgets this
 * makes every estimator look better than it is.
 */
const pCorrect = (x: number, alpha: number, beta: number) =>
  0.5 + 0.5 / (1 + Math.exp(-(Math.log(x) - Math.log(alpha)) / beta));

/**
 * The level a 2-down/1-up rule actually converges on is where P(correct) =
 * 0.707, NOT the 75% point. Solving the curve above for 0.707 gives this, and
 * comparing recovery against alpha instead would build in a fixed bias and then
 * report it as accuracy.
 */
const trueTarget = (alpha: number, beta: number) => alpha * Math.exp(Math.log(0.414 / 0.586) * beta);

function runSession(
  levels: number[],
  alpha: number,
  beta: number,
  seed: number,
  overrides: Partial<StaircaseConfig> = {},
) {
  const config = { ...cfg(levels), ...overrides };
  const rand = rng(seed);
  let state = startStaircase(config);
  while (!state.finished) {
    const x = levels[state.currentIndex];
    state = recordResponse(state, rand() < pCorrect(x, alpha, beta), config);
  }
  return { outcome: estimateThreshold(state, config), state };
}

describe("staircase — the rule behaves as specified", () => {
  const config = cfg(PITCH);

  it("takes two correct answers to make the task harder", () => {
    let s = startStaircase(config);
    const start = s.currentIndex;
    s = recordResponse(s, true, config);
    expect(s.currentIndex).toBe(start); // one correct is not enough
    s = recordResponse(s, true, config);
    expect(s.currentIndex).toBeLessThan(start);
  });

  it("one wrong answer makes it easier immediately", () => {
    let s = startStaircase(config);
    const start = s.currentIndex;
    s = recordResponse(s, false, config);
    expect(s.currentIndex).toBeGreaterThan(start);
  });

  it("uses big steps until the first reversal, then small ones", () => {
    let s = startStaircase(config);
    const start = s.currentIndex;
    s = recordResponse(s, false, config); // up by bigStep
    expect(s.currentIndex - start).toBe(config.bigStep);
    s = recordResponse(s, true, config);
    s = recordResponse(s, true, config); // down — first reversal
    expect(s.reversalIndices).toHaveLength(1);
    const afterReversal = s.currentIndex;
    s = recordResponse(s, false, config); // up by step
    expect(s.currentIndex - afterReversal).toBe(config.step);
  });

  it("is a pure function of the answers — replaying gives the same run", () => {
    const answers = [true, true, false, true, true, true, false, false, true, true];
    const play = () => answers.reduce((s, a) => recordResponse(s, a, config), startStaircase(config));
    expect(play()).toEqual(play());
  });

  it("stops at the reversal budget", () => {
    const { state } = runSession(PITCH, 20, 0.4, 99);
    expect(state.reversalIndices.length).toBeGreaterThanOrEqual(config.stopAfterReversals);
    expect(state.trials.length).toBeLessThanOrEqual(config.maxTrials);
  });

  it("never presents a level outside the ladder", () => {
    for (let seed = 0; seed < 50; seed++) {
      const { state } = runSession(PITCH, 3, 0.3, seed); // a listener far past the floor
      for (const t of state.trials) {
        expect(t.index).toBeGreaterThanOrEqual(0);
        expect(t.index).toBeLessThan(PITCH.length);
      }
    }
  });
});

describe("staircase — it refuses to invent a threshold it did not measure (N3)", () => {
  const config = cfg(PITCH);

  it("reports a BOUND, not a number, when the listener never misses at the floor", () => {
    // A perfect listener: correct at everything, so the run pins at the bottom.
    let s = startStaircase(config);
    while (!s.finished) s = recordResponse(s, true, config);
    const out = estimateThreshold(s, config);
    expect(out.kind).toBe("below");
    if (out.kind === "below") expect(out.bound).toBe(PITCH[0]);
  });

  it("reports a BOUND when the listener is at chance even at the strongest level", () => {
    let s = startStaircase(config);
    while (!s.finished) s = recordResponse(s, false, config);
    const out = estimateThreshold(s, config);
    expect(out.kind).toBe("above");
    if (out.kind === "above") expect(out.bound).toBe(PITCH[PITCH.length - 1]);
  });

  it("says inconclusive rather than guessing from too few reversals", () => {
    let s = startStaircase(config);
    s = recordResponse(s, true, config);
    s = recordResponse(s, true, config);
    expect(estimateThreshold(s, config).kind).toBe("inconclusive");
  });

  it("averages in LOG space — the midpoint of 25 and 50 is 35.4, not 37.5", () => {
    // Drive a run whose reversals sit at known levels, then check the mean.
    const two = [PITCH.indexOf(25), PITCH.indexOf(50)];
    const state = {
      trials: [{ index: 8, correct: true }],
      reversalIndices: two,
      currentIndex: 8,
      consecutiveCorrect: 0,
      lastDirection: "down" as const,
      floorHits: 0,
      ceilingHits: 0,
      finished: true,
    };
    const out = estimateThreshold(state, config);
    expect(out.kind).toBe("threshold");
    if (out.kind === "threshold") expect(out.threshold).toBeCloseTo(Math.sqrt(25 * 50), 5);
  });
});

/**
 * THE HEADLINE EVIDENCE. Known thresholds in, estimated thresholds out.
 *
 * Tolerances are stated in STEPS of the ladder rather than in cents, because a
 * discrete staircase cannot resolve better than its own spacing: on the pitch
 * ladder one step is a factor of sqrt(2), so "within half a step" is the best
 * any run could do and is the honest unit to judge it in.
 */
describe("staircase — RECOVERY of known thresholds [SIMULATED]", () => {
  const SESSIONS = 200;

  const recover = (levels: number[], alpha: number, beta: number, overrides: Partial<StaircaseConfig> = {}) => {
    const errorsInSteps: number[] = [];
    const trialCounts: number[] = [];
    let inconclusive = 0;
    const ratio = levels[1] / levels[0];
    for (let seed = 1; seed <= SESSIONS; seed++) {
      const { outcome } = runSession(levels, alpha, beta, seed * 7919, overrides);
      if (outcome.kind !== "threshold") {
        inconclusive++;
        continue;
      }
      // Error expressed in ladder steps: log ratio of estimate to truth,
      // divided by the log of one step.
      errorsInSteps.push(Math.log(outcome.threshold / trueTarget(alpha, beta)) / Math.log(ratio));
      trialCounts.push(outcome.trials);
    }
    const n = errorsInSteps.length;
    const bias = errorsInSteps.reduce((a, b) => a + b, 0) / n;
    const rmse = Math.sqrt(errorsInSteps.reduce((a, b) => a + b * b, 0) / n);
    trialCounts.sort((a, b) => a - b);
    return {
      bias,
      rmse,
      n,
      inconclusive,
      medianTrials: trialCounts[Math.floor(n / 2)],
      /** What the step-error means in the family's own unit: a multiplying factor. */
      physicalFactor: Math.pow(ratio, rmse),
    };
  };

  it.each([
    ["pitch, sensitive listener", PITCH, 12, 0.35],
    ["pitch, average listener", PITCH, 25, 0.35],
    ["pitch, insensitive listener", PITCH, 50, 0.35],
    ["pitch, shallow slope", PITCH, 25, 0.7],
    ["timing, average listener", TIMING, 31.5, 0.35],
    ["timing, sensitive listener", TIMING, 19.8, 0.35],
  ])("recovers %s", (label, levels, alpha, beta) => {
    const r = recover(levels as number[], alpha as number, beta as number);
    console.log(
      `[staircase] ${String(label).padEnd(30)} bias ${r.bias >= 0 ? "+" : ""}${r.bias.toFixed(2)} steps · ` +
        `RMSE ${r.rmse.toFixed(2)} steps (x${r.physicalFactor.toFixed(2)}) · median ${r.medianTrials} trials · ` +
        `${r.inconclusive}/${SESSIONS} inconclusive [SIMULATED]`,
    );
    /**
     * THE CRITERION, and why it is this and not something tighter.
     *
     * A discrete staircase cannot resolve better than its own spacing, and the
     * question that matters is whether it can PLACE someone on the ladder. The
     * pitch ladder is 10 steps end to end, so an RMSE of 1.5 steps locates a
     * listener within about a seventh of the instrument's whole range — enough
     * to separate a 12-cent ear from a 50-cent one, which is the claim the
     * product actually makes.
     *
     * It is emphatically NOT enough to report a threshold as a bare number, and
     * `ci95` exists so no surface has to. Precision is buyable with reversals
     * (see the consistency test below); this is the floor of usefulness, not a
     * target to sit at.
     */
    expect(Math.abs(r.bias), "systematic bias").toBeLessThan(0.5);
    expect(r.rmse, "spread").toBeLessThan(1.5);
    expect(r.inconclusive).toBeLessThan(SESSIONS * 0.1);
  });

  /**
   * CONSISTENCY: precision must be buyable. If more reversals did not reduce
   * the error, the estimator would not be converging on anything and the whole
   * procedure would be theatre with a number attached.
   */
  it("more reversals buy precision — the estimator converges", () => {
    const few = recover(PITCH, 25, 0.35, { stopAfterReversals: 6, useLastReversals: 4, maxTrials: 90 });
    const many = recover(PITCH, 25, 0.35, { stopAfterReversals: 20, useLastReversals: 16, maxTrials: 140 });
    console.log(
      `[staircase] 6 reversals: RMSE ${few.rmse.toFixed(2)} steps, ${few.medianTrials} trials · ` +
        `20 reversals: RMSE ${many.rmse.toFixed(2)} steps, ${many.medianTrials} trials [SIMULATED]`,
    );
    expect(many.rmse).toBeLessThan(few.rmse);
    expect(many.medianTrials).toBeGreaterThan(few.medianTrials);
  });

  it("a listener past the bottom of the ladder is reported as a BOUND, not a number", () => {
    let below = 0;
    for (let seed = 1; seed <= 100; seed++) {
      const { outcome } = runSession(PITCH, 1.2, 0.3, seed * 7919);
      if (outcome.kind === "below") below++;
    }
    // The point is that these are NOT silently reported as a threshold of 3.1.
    expect(below).toBeGreaterThan(50);
  });

  it("pins the session length the instrument actually needs", () => {
    const r = recover(PITCH, 25, 0.35);
    console.log(`[staircase] median session: ${r.medianTrials} trials per family [SIMULATED]`);
    expect(r.medianTrials).toBeLessThanOrEqual(DEFAULT_STAIRCASE.maxTrials);
  });
});
