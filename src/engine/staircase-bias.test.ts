/**
 * R2 — WHERE THE NEGATIVE BIAS COMES FROM (2026-08-15).
 *
 * E3 measured a persistent bias of -0.15 to -0.35 ladder steps in five of six
 * recovery conditions: the staircase reports listeners as slightly MORE
 * sensitive than they are. Flattering, therefore the direction nobody
 * investigates. R1 ruled out the missing lapse rate as the cause — the
 * procedure bias barely moved. So it is something about the rule, the
 * estimator, or the ladder, and "which" has been an opinion until now.
 *
 * THE DECOMPOSITION. Four sources, each isolated by changing exactly one thing:
 *
 *   A  RULE + ESTIMATOR, run forever, on a ladder with no ends.
 *      Does 2-down/1-up with reversal-averaging land on the 70.7% point at all?
 *      Computed EXACTLY from the stationary distribution of the rule's Markov
 *      chain — no simulation, no sampling error.
 *
 *   B  THE LADDER HAS ENDS. Same computation on the real, bounded ladder.
 *      B is what truncation costs.
 *
 *   C  THE RUN IS SHORT. A real session stops at 12 reversals and starts from
 *      a fixed index above the threshold. C is burn-in plus finite-sample.
 *
 *   D  THE N3 GUARD CENSORS. `estimateThreshold` refuses to print a number when
 *      the reversals sit within half a step of a ladder end. That refusal is a
 *      SELECTION on which sessions get reported, and selection moves a mean.
 *
 * A + B + C + D telescopes to the total bias BY CONSTRUCTION — it is an
 * identity, not evidence, and is asserted only to catch a bookkeeping slip. The
 * evidence is the SIZE of each term, plus the independent check that the
 * analytic chain agrees with brute-force simulation.
 *
 * PRECISION. 2000 sessions per condition, not 200. R1's standard errors were
 * +/-0.06 to +/-0.10 steps, and this slice's plan promised components resolved
 * to +/-0.05 — a criterion below its own noise floor, which would have been
 * unfalsifiable. The sweep costs milliseconds; there was never a reason to be
 * imprecise.
 *
 * SIMULATED throughout (N3).
 */
import { describe, expect, it } from "vitest";
import {
  observer as obs,
  claimTarget,
  pCorrect,
  rawReversalMean,
  runStaircaseSession,
  type Observer,
} from "@/analytics/observer";
import { DEFAULT_STAIRCASE, type StaircaseConfig } from "./staircase";

const PITCH = [3.1, 4.4, 6.3, 8.8, 12.5, 17.7, 25, 35.4, 50, 70.7, 100];
const TIMING = [12.5, 15.7, 19.8, 25, 31.5, 39.7, 50, 63, 79.4, 100];

/**
 * ONE STEP, defined as the ladder's GEOMETRIC MEAN ratio rather than its first
 * gap. The shipped ladders are geometric by design but their values are ROUNDED
 * for legibility (3.1 x sqrt(2) is 4.384, and the ladder says 4.4), so
 * consecutive gaps differ by up to 2%. `staircase.test.ts` uses `levels[1] /
 * levels[0]`, which is 1.4194 against the true mean of 1.4154 — a 0.8%
 * difference in the step unit, which moves a -0.35 bias to -0.3528 and rounds
 * to the same printed number. Immaterial, and stated because an unexplained
 * 0.8% between two files is how the next mystery starts.
 */
const stepUnit = (levels: number[]) => Math.pow(levels[levels.length - 1] / levels[0], 1 / (levels.length - 1));

const cfg = (levels: number[]): StaircaseConfig => ({
  ...DEFAULT_STAIRCASE,
  levels,
  startIndex: levels.length - 3,
});

/**
 * THE RULE'S STATIONARY DISTRIBUTION, computed exactly.
 *
 * The staircase is a Markov chain: where it goes next depends only on the
 * current level, how many correct answers are banked, and which way it last
 * moved. Three facts, so three fields, and the whole chain is (levels x 2 x 2)
 * states. `consecutiveCorrect` can only be 0 or 1 because reaching 2 triggers a
 * downward move that resets it — which is why this is small enough to solve
 * rather than sample.
 *
 * Solving it rather than simulating it is the point: the answer to "does this
 * rule converge where it claims to" should not itself carry sampling error.
 *
 * The chain models the POST-FIRST-REVERSAL regime, where the step size is
 * `step` rather than `bigStep`. That is the regime a long run spends all its
 * time in, and it is the one the estimate averages over.
 */
function stationary(levels: number[], o: Observer) {
  if (DEFAULT_STAIRCASE.downRule !== 2) {
    throw new Error(`chain models downRule 2; config says ${DEFAULT_STAIRCASE.downRule}`);
  }
  const L = levels.length;
  const UP = 0;
  const DOWN = 1;
  const at = (i: number, c: number, d: number) => (i * 2 + c) * 2 + d;
  const N = L * 4;
  const p = levels.map((x) => pCorrect(x, o));

  /** [from, to, probability, reversal?] — two out-edges per state. */
  const edges: Array<[number, number, number, boolean]> = [];
  for (let i = 0; i < L; i++) {
    for (let c = 0; c <= 1; c++) {
      for (const d of [UP, DOWN]) {
        const from = at(i, c, d);
        if (c === 1) {
          // Second correct answer in a row: move DOWN (harder).
          edges.push([from, at(Math.max(i - 1, 0), 0, DOWN), p[i], d === UP]);
        } else {
          // First correct answer: bank it, present the same level again.
          edges.push([from, at(i, 1, d), p[i], false]);
        }
        // Any wrong answer: move UP (easier), immediately.
        edges.push([from, at(Math.min(i + 1, L - 1), 0, UP), 1 - p[i], d === DOWN]);
      }
    }
  }

  // Power iteration with two reused buffers. Allocating a fresh array per
  // sweep is what made the first version slow enough to notice.
  let pi = new Float64Array(N).fill(1 / N);
  let next = new Float64Array(N);
  let converged = false;
  for (let iter = 0; iter < 50_000; iter++) {
    next.fill(0);
    for (const [from, to, prob] of edges) next[to] += pi[from] * prob;
    let delta = 0;
    for (let s = 0; s < N; s++) delta += Math.abs(next[s] - pi[s]);
    [pi, next] = [next, pi];
    if (delta < 1e-15) {
      converged = true;
      break;
    }
  }
  /**
   * LOUD, not silent. Without this, a chain that failed to settle returns a
   * half-mixed distribution that looks like a perfectly ordinary number and
   * every figure downstream is quietly wrong — the exact shape of defect this
   * project has been bitten by repeatedly (a stale alpha caveat, a stale rung
   * table). An exact computation that might not be exact is worse than a
   * simulation that admits its error bars.
   */
  if (!converged) throw new Error(`stationary: power iteration did not converge in 50,000 sweeps (${N} states)`);

  let presentedLog = 0;
  let revRate = 0;
  let revLog = 0;
  let endMass = 0;
  for (let s = 0; s < N; s++) {
    const i = Math.floor(s / 4);
    presentedLog += pi[s] * Math.log(levels[i]);
    if (i === 0 || i === L - 1) endMass += pi[s];
  }
  for (const [from, , prob, isReversal] of edges) {
    if (!isReversal) continue;
    const i = Math.floor(from / 4);
    revRate += pi[from] * prob;
    revLog += pi[from] * prob * Math.log(levels[i]);
  }
  return {
    presentedMean: Math.exp(presentedLog),
    /** What an infinitely long run's reversal average would converge to. */
    reversalMean: Math.exp(revLog / revRate),
    /** Stationary mass parked against a ladder end. Must be ~0 for "unbounded". */
    endMass,
  };
}

/**
 * The real ladder extended geometrically at both ends, so the chain can be run
 * as if the ladder had none.
 *
 * The INTERIOR KEEPS THE SHIPPED VALUES, rounding and all. Where a threshold
 * falls relative to the grid changes the bias of a discrete rule, so an
 * idealised replacement ladder would answer a question about a different
 * instrument than the one that ships.
 */
function extended(levels: number[], pad: number) {
  const r = stepUnit(levels);
  const below = Array.from({ length: pad }, (_, k) => levels[0] * Math.pow(r, -(pad - k)));
  const above = Array.from({ length: pad }, (_, k) => levels[levels.length - 1] * Math.pow(r, k + 1));
  return { levels: [...below, ...levels, ...above], offset: pad };
}

describe("R2 — the Markov chain is right before it is used [SIMULATED]", () => {
  /**
   * THE CHAIN VS BRUTE FORCE. The decomposition below is only worth reading if
   * the analytic chain describes the code that actually runs. So: one 300,000
   * trial session against the same observer, averaging every reversal it makes,
   * compared against the chain's exact answer.
   *
   * This is the assertion with teeth. Everything else in this file is either an
   * identity or a printed number.
   */
  it(
    "agrees with brute-force simulation of the real staircase",
    { timeout: 60_000 },
    () => {
      /**
       * POOLED SHORT RUNS, not one enormous one. `recordResponse` rebuilds its
       * trial list on every answer — correct and immaterial for a 40-trial
       * session, quadratic for a 300,000-trial one, which is how the first
       * version of this test spent ten minutes and then died on the default
       * 5-second timeout. 600 runs of 500 trials pool the same number of
       * stationary reversals in a fraction of a second.
       */
      const RUNS = 600;
      /**
       * 60, not 30. At 30 the residual gap ran +0.007 to +0.011 steps and was
       * POSITIVE in all three conditions — a one-sided error is leftover
       * burn-in, not sampling noise, because every run starts above the
       * threshold and descends into it.
       */
      const BURN_IN_REVERSALS = 60;
      for (const [label, levels, o] of [
        ["pitch, average", PITCH, obs(25, 0.35)],
        ["timing, average", TIMING, obs(31.5, 0.35)],
        ["pitch, lapsing 6%", PITCH, obs(25, 0.35, 0.06)],
      ] as Array<[string, number[], Observer]>) {
        const long: StaircaseConfig = { ...cfg(levels), stopAfterReversals: 1e9, maxTrials: 700 };
        let sum = 0;
        let count = 0;
        for (let seed = 1; seed <= RUNS; seed++) {
          const { state } = runStaircaseSession(o, seed * 104729, long);
          // Each run starts above the threshold and descends into it; those
          // early reversals are burn-in, not stationary behaviour.
          for (const i of state.reversalIndices.slice(BURN_IN_REVERSALS)) {
            sum += Math.log(levels[i]);
            count++;
          }
        }
        const mc = Math.exp(sum / count);
        const chain = stationary(levels, o).reversalMean;
        const steps = Math.log(mc / chain) / Math.log(stepUnit(levels));
        console.log(
          `[R2] chain check ${label.padEnd(18)} analytic ${chain.toFixed(4)} · ` +
            `simulated ${mc.toFixed(4)} (${count} reversals) · gap ${steps.toFixed(4)} steps`,
        );
        expect(Math.abs(steps), `${label}: chain vs simulation`).toBeLessThan(0.02);
      }
    },
  );

  it("an extended ladder really is unbounded — no mass parks against its ends", () => {
    const { levels } = extended(PITCH, 25);
    const { endMass } = stationary(levels, obs(25, 0.35));
    console.log(`[R2] extended-ladder end mass: ${endMass.toExponential(2)} (must be ~0)`);
    expect(endMass).toBeLessThan(1e-9);
  });
});

describe("R2 — decomposing the negative bias [SIMULATED]", () => {
  const SESSIONS = 2000;

  const CONDITIONS: Array<[string, number[], Observer]> = [
    ["pitch, sensitive", PITCH, obs(12, 0.35)],
    ["pitch, average", PITCH, obs(25, 0.35)],
    ["pitch, insensitive", PITCH, obs(50, 0.35)],
    ["pitch, shallow slope", PITCH, obs(25, 0.7)],
    ["timing, average", TIMING, obs(31.5, 0.35)],
    ["timing, sensitive", TIMING, obs(19.8, 0.35)],
  ];

  const decompose = (levels: number[], o: Observer) => {
    const unit = Math.log(stepUnit(levels));
    const truth = Math.log(claimTarget(o));
    const config = cfg(levels);

    const boundedChain = Math.log(stationary(levels, o).reversalMean);
    const ext = extended(levels, 25);
    const unboundedChain = Math.log(stationary(ext.levels, o).reversalMean);

    // The finite runs: raw (guard disabled) and guarded (what ships).
    const rawLogs: number[] = [];
    const guardedLogs: number[] = [];
    let noEstimate = 0;
    for (let seed = 1; seed <= SESSIONS; seed++) {
      const { outcome, state } = runStaircaseSession(o, seed * 7919, config);
      const raw = rawReversalMean(state, config);
      if (raw === null) {
        noEstimate++;
        continue;
      }
      rawLogs.push(Math.log(raw));
      if (outcome.kind === "threshold") guardedLogs.push(Math.log(outcome.threshold));
    }
    const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
    const rawMean = mean(rawLogs);
    const guardedMean = mean(guardedLogs);

    return {
      /** A — the rule and its estimator, run forever, on an endless ladder. */
      A: (unboundedChain - truth) / unit,
      /** B — what having ends costs. */
      B: (boundedChain - unboundedChain) / unit,
      /** C — what stopping at 12 reversals from a fixed start costs. */
      C: (rawMean - boundedChain) / unit,
      /** D — what the N3 ladder-end guard's selection costs. */
      D: (guardedMean - rawMean) / unit,
      total: (guardedMean - truth) / unit,
      censored: rawLogs.length - guardedLogs.length,
      noEstimate,
      n: guardedLogs.length,
    };
  };

  it("attributes the bias to a source, in every condition", () => {
    console.log(`\n[R2] === BIAS DECOMPOSITION [SIMULATED] — ${SESSIONS} sessions per condition ===`);
    console.log(`[R2] all figures in LADDER STEPS. Negative = reports the listener as MORE sensitive.`);
    console.log(`[R2]   A rule+estimator (exact)   B ladder ends (exact)`);
    console.log(`[R2]   C short run (sampled)      D the N3 guard's selection (sampled)`);
    console.log(
      `[R2] ${"condition".padEnd(21)} ${"A".padStart(7)} ${"B".padStart(7)} ${"C".padStart(7)} ` +
        `${"D".padStart(7)} ${"= total".padStart(8)}  censored`,
    );
    const results = new Map<string, ReturnType<typeof decompose>>();
    for (const [label, levels, o] of CONDITIONS) {
      const d = decompose(levels, o);
      results.set(label, d);
      const f = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(3)}`.padStart(7);
      console.log(
        `[R2] ${label.padEnd(21)} ${f(d.A)} ${f(d.B)} ${f(d.C)} ${f(d.D)} ${f(d.total).padStart(8)}  ` +
          `${String(d.censored).padStart(5)}/${d.n + d.censored}`,
      );

      // Bookkeeping only: the four terms telescope to the total by construction.
      expect(d.A + d.B + d.C + d.D, `${label}: terms telescope`).toBeCloseTo(d.total, 10);
    }

    /**
     * THE FINDING, asserted so it cannot quietly stop being true: on the
     * canonical mid-ladder condition the rule-and-estimator term A is the
     * dominant negative contributor, and it is EXACT — no ladder end, no
     * sampling, no guard. That makes the bias a property of 2-down/1-up with
     * reversal-averaging on a discrete ladder, not an artifact of our setup.
     */
    const avg = results.get("pitch, average")!;
    expect(avg.A, "A is negative").toBeLessThan(0);
    expect(Math.abs(avg.A), "A dominates B and C").toBeGreaterThan(Math.abs(avg.B) + Math.abs(avg.C));
  });

  /**
   * IS IT INHERENT? — AND THE HYPOTHESIS THAT FAILED.
   *
   * PRE-REGISTERED (session plan, before any of this was computed): the bias
   * tracks STEP SIZE RELATIVE TO THE PSYCHOMETRIC SLOPE, because the E3 table
   * looked like it did — pitch step/beta 0.99 gave -0.35, timing 0.66 gave
   * -0.15, shallow-slope 0.50 gave -0.16. The prediction was that a fine enough
   * ladder would be essentially unbiased, and the first version of this test
   * asserted exactly that.
   *
   * IT IS FALSE. Term A sits at roughly -0.25 steps across a TWENTY-FOLD range
   * of step/slope and never approaches zero. The apparent pattern in the E3
   * table was terms B and C — ladder ends and short runs — varying between
   * conditions while A held still underneath them.
   *
   * The test is kept, inverted, because the true finding is more useful than
   * the hypothesis was: a bias that is CONSTANT is the easiest kind to correct.
   * The asserted band was set after seeing these numbers and is a regression
   * guard on a measured fact, not an acceptance criterion.
   */
  it("shows the bias is NOT a function of ladder coarseness — it is a constant", () => {
    const r = Math.SQRT2;
    const stepLog = Math.log(r);
    console.log(`\n[R2] === TERM A vs LADDER COARSENESS [SIMULATED, exact — no sampling] ===`);
    console.log(`[R2] PRE-REGISTERED PREDICTION: |A| shrinks toward 0 as the ladder gets fine. FALSIFIED below.`);
    console.log(`[R2] step/slope   bias A (steps)   factor on reported threshold`);
    const values: number[] = [];
    for (const ratio of [0.1, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 2.5, 5.0]) {
      const beta = stepLog / ratio;
      const grid = Array.from({ length: 81 }, (_, k) => 25 * Math.pow(r, k - 40));
      const A =
        (Math.log(stationary(grid, obs(25, beta)).reversalMean) - Math.log(claimTarget(obs(25, beta)))) / stepLog;
      values.push(A);
      console.log(
        `[R2] ${ratio.toFixed(2).padStart(9)}   ${((A >= 0 ? "+" : "") + A.toFixed(3)).padStart(7)}` +
          `${" ".repeat(9)}x${Math.pow(r, A).toFixed(3)}`,
      );
    }
    const spread = Math.max(...values) - Math.min(...values);
    console.log(`[R2] A ranges ${Math.min(...values).toFixed(3)} .. ${Math.max(...values).toFixed(3)} — spread ${spread.toFixed(3)} steps`);
    // The falsification, asserted so it cannot be quietly un-learned: a fine
    // ladder is NOT unbiased.
    expect(Math.abs(values[0]), "a fine ladder is still biased").toBeGreaterThan(0.15);
    for (const A of values) expect(A, "A is negative everywhere").toBeLessThan(0);
    expect(spread, "A is near-constant across a 50x range of step/slope").toBeLessThan(0.12);
  });

  /**
   * WHERE INSIDE TERM A DOES IT LIVE? Two sub-terms, and the answer surprised
   * me twice, so the labels here are deliberately literal.
   *
   *   SAMPLING OFFSET — log(mean level PRESENTED) minus the true 70.7% point.
   *   Where the rule's stationary distribution sits.
   *
   *   REVERSAL SELECTION — log(mean level at REVERSALS) minus log(mean level
   *   presented). What restricting attention to turning points adds on top.
   *
   * A NOTE ON WHAT THIS DOES *NOT* MEAN, because my first version of this test
   * asserted the opposite and its comment called the sampling offset "the rule
   * parking in the wrong place". That framing is wrong. A staircase is a
   * SAMPLER; there is no requirement that the mean level it visits equal the
   * 70.7% point, and the stationary distribution of 2-down/1-up is known to be
   * asymmetric. The offset is a fact about where the trials land, not an error.
   *
   * What it does mean is narrower and more useful: BOTH sub-terms are
   * properties of averaging LEVELS. An estimator that instead fits a
   * psychometric function to the (level, correct) pairs does not average levels
   * at all, so neither term binds it — where the samples fall changes such an
   * estimator's PRECISION, not its centre. That is R4's hypothesis and it is
   * NOT established here; this test only shows that the bias is entirely inside
   * the level-averaging, which is what makes the hypothesis worth testing.
   */
  it("locates term A inside the level-averaging, not in one guilty half", () => {
    console.log(`\n[R2] === WHERE INSIDE TERM A? [SIMULATED, exact] ===`);
    console.log(
      `[R2] ${"condition".padEnd(21)} ${"sampling".padStart(11)} ${"rev.selection".padStart(14)} ${"= A".padStart(8)}`,
    );
    for (const [label, levels, o] of CONDITIONS) {
      const ext = extended(levels, 25);
      const s = stationary(ext.levels, o);
      const unit = Math.log(stepUnit(levels));
      const truth = Math.log(claimTarget(o));
      const sampling = (Math.log(s.presentedMean) - truth) / unit;
      const selection = (Math.log(s.reversalMean) - Math.log(s.presentedMean)) / unit;
      const f = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(3)}`;
      console.log(
        `[R2] ${label.padEnd(21)} ${f(sampling).padStart(11)} ${f(selection).padStart(14)} ` +
          `${f(sampling + selection).padStart(8)}`,
      );
      /**
       * The corrected assertion. The SAMPLING offset is the larger half — which
       * is why "just swap the reversal average for something else that averages
       * levels" would recover at most a fifth of the bias.
       */
      expect(Math.abs(sampling), `${label}: sampling offset is the larger half`).toBeGreaterThan(
        Math.abs(selection),
      );
      expect(sampling, `${label}: sampling offset is negative`).toBeLessThan(0);
    }
  });
});
