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
  GUESS,
  P_CONVERGE,
  claimTarget,
  observer as obs,
  procedureTarget,
  runStaircaseSession,
  type Observer,
} from "@/analytics/observer";
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

/**
 * THE SIMULATED LISTENER now lives in `@/analytics/observer` — R1's lapse model
 * plus the numerically-solved targets. It moved out of this file when R2 needed
 * the same observer, because the alternative was a second copy of the model,
 * which is the defect `rungs.mjs` was written to end.
 */
function runSession(levels: number[], o: Observer, seed: number, overrides: Partial<StaircaseConfig> = {}) {
  return runStaircaseSession(o, seed, { ...cfg(levels), ...overrides });
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
    const { state } = runSession(PITCH, obs(20, 0.4), 99);
    expect(state.reversalIndices.length).toBeGreaterThanOrEqual(config.stopAfterReversals);
    expect(state.trials.length).toBeLessThanOrEqual(config.maxTrials);
  });

  it("never presents a level outside the ladder", () => {
    for (let seed = 0; seed < 50; seed++) {
      const { state } = runSession(PITCH, obs(3, 0.3), seed); // a listener far past the floor
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

  const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
  const rms = (v: number[]) => Math.sqrt(v.reduce((a, b) => a + b * b, 0) / v.length);
  /** Standard error of a mean. Every bias below is an estimate from 200 runs. */
  const sem = (v: number[]) => {
    const m = mean(v);
    return Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / (v.length - 1) / v.length);
  };

  const recover = (levels: number[], o: Observer, overrides: Partial<StaircaseConfig> = {}) => {
    /**
     * Kept PER SEED, not just aggregated. Two recovery runs over the same seed
     * list see the same random draws, so their difference can be tested as a
     * paired sample — which is the only way to tell a real shift from the
     * sampling noise of 200 sessions. Aggregates alone cannot support the
     * comparison, and eyeballing two means and declaring a direction is how a
     * 0.01-step wobble gets reported as an effect.
     */
    const samples: Array<{ seed: number; proc: number; claim: number; trials: number }> = [];
    let inconclusive = 0;
    const ratio = levels[1] / levels[0];
    const procT = procedureTarget(o);
    const claimT = claimTarget(o);
    for (let seed = 1; seed <= SESSIONS; seed++) {
      const { outcome } = runSession(levels, o, seed * 7919, overrides);
      if (outcome.kind !== "threshold") {
        inconclusive++;
        continue;
      }
      // Error expressed in ladder steps: log ratio of estimate to truth,
      // divided by the log of one step.
      samples.push({
        seed,
        proc: Math.log(outcome.threshold / procT) / Math.log(ratio),
        claim: Math.log(outcome.threshold / claimT) / Math.log(ratio),
        trials: outcome.trials,
      });
    }
    const procErrors = samples.map((s) => s.proc);
    const claimErrors = samples.map((s) => s.claim);
    const trialCounts = samples.map((s) => s.trials).sort((a, b) => a - b);
    return {
      samples,
      /** Bias/RMSE vs the rule's own target — "does the procedure work". */
      bias: mean(procErrors),
      biasSe: sem(procErrors),
      rmse: rms(procErrors),
      /** Bias/RMSE vs the ear itself — "is the printed number right about them". */
      claimBias: mean(claimErrors),
      claimBiasSe: sem(claimErrors),
      claimRmse: rms(claimErrors),
      n: samples.length,
      inconclusive,
      medianTrials: trialCounts[Math.floor(samples.length / 2)],
      /** What the step-error means in the family's own unit: a multiplying factor. */
      physicalFactor: Math.pow(ratio, rms(procErrors)),
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
    const r = recover(levels as number[], obs(alpha as number, beta as number));
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
    const few = recover(PITCH, obs(25, 0.35), { stopAfterReversals: 6, useLastReversals: 4, maxTrials: 90 });
    const many = recover(PITCH, obs(25, 0.35), { stopAfterReversals: 20, useLastReversals: 16, maxTrials: 140 });
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
      const { outcome } = runSession(PITCH, obs(1.2, 0.3), seed * 7919);
      if (outcome.kind === "below") below++;
    }
    // The point is that these are NOT silently reported as a threshold of 3.1.
    expect(below).toBeGreaterThan(50);
  });

  it("pins the session length the instrument actually needs", () => {
    const r = recover(PITCH, obs(25, 0.35));
    console.log(`[staircase] median session: ${r.medianTrials} trials per family [SIMULATED]`);
    expect(r.medianTrials).toBeLessThanOrEqual(DEFAULT_STAIRCASE.maxTrials);
  });

  /**
   * R1 — THE LISTENER WHO SLIPS (2026-08-15).
   *
   * Everything above this point was measured against an observer who never
   * makes a careless mistake. That observer does not exist, and the omission is
   * not neutral: a staircase can only be driven UPWARD by errors, so a listener
   * who errs at levels they can plainly hear supplies upward pressure at every
   * point in the run, including the easy end where the response carries no
   * information about their threshold at all.
   *
   * `lapse` here is the asymptotic error rate. 2% is an alert listener's
   * mis-click rate; 6% is what thirty-eight trials of a self-paced web session
   * can plausibly produce near the end. Both are inside the range the
   * psychophysics literature fits routinely.
   *
   * This slice MEASURES the cost. It does not correct it — the correction is
   * R4's, and choosing one before the size and direction of the effect are
   * known would be picking a fix and then finding a reason.
   */
  describe("under a listener who slips [SIMULATED]", () => {
    const LAPSES = [0, 0.02, 0.06];
    const CONDITIONS: Array<[string, number[], number, number]> = [
      ["pitch, sensitive", PITCH, 12, 0.35],
      ["pitch, average", PITCH, 25, 0.35],
      ["pitch, insensitive", PITCH, 50, 0.35],
      ["pitch, shallow slope", PITCH, 25, 0.7],
      ["timing, average", TIMING, 31.5, 0.35],
      ["timing, sensitive", TIMING, 19.8, 0.35],
    ];
    const sgn = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(2)}`;

    it("the numeric target reproduces the hand-solved closed form at lapse 0", () => {
      /**
       * The one place the algebra is allowed to appear. If these disagree, one
       * of the two is wrong and the test says so BEFORE a recovery number is
       * quoted anywhere — rather than after, in a handoff, as a mystery bias.
       */
      const closedForm = (alpha: number, beta: number) =>
        alpha * Math.exp(Math.log((P_CONVERGE - GUESS) / (1 - P_CONVERGE)) * beta);
      for (const [, , alpha, beta] of CONDITIONS) {
        expect(procedureTarget(obs(alpha, beta))).toBeCloseTo(closedForm(alpha, beta), 9);
      }
    });

    it("refuses to name a threshold for an observer who can never reach 70.7%", () => {
      // lapse 0.30 caps the curve at 0.70 — below what 2-down/1-up chases. The
      // simulation must say so rather than return a number from a bad bracket.
      expect(() => procedureTarget(obs(25, 0.35, 0.3))).toThrow(/never reaches/);
    });

    /**
     * The shift between two lapse settings, tested as a PAIRED sample.
     *
     * Both runs walk the same seed list, so seed 37 sees the same random draws
     * in both — the difference on that seed isolates the lapse, and the noise
     * that dominates either run separately cancels. `t` is the shift in units
     * of its own standard error; |t| < 2 means the numbers moved but nothing
     * has been shown.
     */
    const pairedShift = (a: ReturnType<typeof recover>, b: ReturnType<typeof recover>, key: "proc" | "claim") => {
      const lookup = new Map(a.samples.map((s) => [s.seed, s[key]]));
      const diffs = b.samples.filter((s) => lookup.has(s.seed)).map((s) => s[key] - lookup.get(s.seed)!);
      const se = sem(diffs);
      return { shift: mean(diffs), se, t: mean(diffs) / se, pairs: diffs.length };
    };

    it("measures what a lapse rate costs recovery", () => {
      console.log(`\n[staircase] === R1 LAPSE SWEEP [SIMULATED] — ${SESSIONS} sessions per cell ===`);
      console.log(`[staircase] bias/RMSE in LADDER STEPS, +/- one standard error.`);
      console.log(`[staircase]   proc  = vs the level the RULE chases (this observer's own 70.7% point)`);
      console.log(`[staircase]   claim = vs the same ear with lapses removed (what we would PRINT)`);
      console.log(
        `[staircase] ${"condition".padEnd(21)} ${"λ".padStart(3)}  ${"proc bias".padStart(12)} ` +
          `${"RMSE".padStart(5)}  ${"claim bias".padStart(12)} ${"RMSE".padStart(5)}  trials  inc`,
      );

      const byCondition = new Map<string, Array<ReturnType<typeof recover>>>();
      for (const [label, levels, alpha, beta] of CONDITIONS) {
        const cells = LAPSES.map((lapse) => recover(levels, obs(alpha, beta, lapse)));
        byCondition.set(label, cells);
        cells.forEach((r, i) => {
          console.log(
            `[staircase] ${label.padEnd(21)} ${`${(LAPSES[i] * 100).toFixed(0)}%`.padStart(3)}  ` +
              `${`${sgn(r.bias)}±${r.biasSe.toFixed(2)}`.padStart(12)} ${r.rmse.toFixed(2).padStart(5)}  ` +
              `${`${sgn(r.claimBias)}±${r.claimBiasSe.toFixed(2)}`.padStart(12)} ${r.claimRmse.toFixed(2).padStart(5)}  ` +
              `${String(r.medianTrials).padStart(6)}  ${String(r.inconclusive).padStart(3)}`,
          );
        });
      }

      /**
       * PRE-REGISTERED, written before the numbers were seen: lapses push the
       * estimate UP the ladder (toward reporting people as LESS sensitive),
       * because an error at a level the listener can plainly hear is an upward
       * step their actual sensitivity did not earn.
       *
       * Scored on the PAIRED shift, not on which of two means is larger. The
       * first draft of this test scored it by comparing the two aggregates and
       * would have reported 6/6 — including a condition that moved 0.01 steps,
       * which is a seventh of its own standard error.
       */
      console.log(`[staircase] --- paired shift, λ=0% → λ=6% (same seeds; |t|>2 is a real move) ---`);
      let realMoves = 0;
      for (const [label, cells] of byCondition) {
        const p = pairedShift(cells[0], cells[cells.length - 1], "proc");
        const c = pairedShift(cells[0], cells[cells.length - 1], "claim");
        if (p.t > 2) realMoves++;
        console.log(
          `[staircase] ${label.padEnd(21)} proc ${sgn(p.shift)} steps (t=${p.t.toFixed(1)})  ` +
            `claim ${sgn(c.shift)} steps (t=${c.t.toFixed(1)})  n=${p.pairs} pairs`,
        );
      }
      console.log(
        `[staircase] prediction (lapses bias UPWARD) is SUPPORTED at |t|>2 in ` +
          `${realMoves}/${CONDITIONS.length} conditions.`,
      );

      // Asserted on the canonical condition only — well clear of both ladder
      // ends, so ladder-end censoring cannot be what produces the result.
      const avg = byCondition.get("pitch, average")!;
      const canonical = pairedShift(avg[0], avg[avg.length - 1], "proc");
      expect(canonical.t, "lapses push the estimate up the ladder, beyond sampling noise").toBeGreaterThan(2);

      for (const [label, cells] of byCondition) {
        // Bookkeeping guard: with no lapses the two truths ARE the same number,
        // so any divergence here means the two error series got crossed.
        expect(cells[0].claimRmse, `${label}: claim==proc at lapse 0`).toBeCloseTo(cells[0].rmse, 12);
        // A procedure that stops producing thresholds under a realistic lapse
        // rate is unusable, whatever its bias looks like on the runs it keeps.
        for (const r of cells) {
          expect(r.inconclusive, `${label}: still reports a threshold`).toBeLessThan(SESSIONS * 0.1);
        }
      }
    });
  });
});
