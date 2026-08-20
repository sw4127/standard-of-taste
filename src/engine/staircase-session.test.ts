/**
 * E5/S2 — one staircase session, end to end, against the pool of record.
 *
 * PRE-REGISTERED CRITERIA (session plan, 2026-08-20). S2 is done when:
 *   1. every ladder round-trips label -> magnitude -> label EXACTLY, and every
 *      config handed to the estimator is strictly ascending;
 *   2. simulated sessions recover a known threshold, reported in DISPLAY UNITS
 *      as well as ladder steps, on all five ladders. CORRECTED WHILE MEASURING:
 *      the plan said "2000 sessions per ladder" at the shipped session length,
 *      and at that length four of the five ladders return almost no numbers at
 *      all. Recovery is therefore proven at a budget where the estimator can
 *      speak, and the refusal rate is measured, pinned, and escalated (RT-90a)
 *      rather than tuned away;
 *   3. no session ever references a window `sessionInstances` did not give it,
 *      and no clip URL is one the manifest cannot resolve;
 *   4. all four outcome kinds are reachable, and lossy's `below` reports a
 *      bitrate ABOVE the top of its ladder — the semantic flip, stated.
 *
 * AND ONE THE PLAN DID NOT CONTAIN: the NAIVE version — kbps handed to the
 * estimator in numeric order, which is what any consumer assuming "up" would
 * build — is run against the same simulated listeners, because a fix nobody can
 * watch fail is indistinguishable from no fix.
 *
 * SIMULATED throughout. Zero real responses (N3).
 */

import { describe, expect, it } from "vitest";
import { claimTarget, observer as obs, pCorrect, rng, type Observer } from "@/analytics/observer";
import { DEFAULT_STAIRCASE, recordResponse, startStaircase, type StaircaseConfig } from "./staircase";
import { fitThreshold, P_CONVERGE_2DOWN1UP } from "./threshold-fit";
import { eligibleSources } from "./staircase-pool";
import { ladderLevels, STAIRCASE_FAMILIES } from "./staircase-manifest";
import {
  answer,
  axisFor,
  BAND_TAIL,
  MAX_GYM_TRIALS,
  medianTrialsFor,
  reversalsFor,
  sessionMinutes,
  isFinished,
  sessionBand,
  configFor,
  degradedSideFor,
  flipAxis,
  isCorrectPick,
  nextTrial,
  pickSourceForSeed,
  sessionResult,
  startSession,
  type StaircaseAxis,
  type StaircaseSession,
} from "./staircase-session";

const LOSSY = "lossy-artifact";

/**
 * Every ladder a session can actually run on. `eligibleSources` returns the
 * SHIPPING set, so pb6 is absent here by construction after RT-92a — its
 * evidence is pinned in its own block at the end of this file rather than
 * carried through tests about what users experience.
 */
const LADDERS: Array<{ name: string; family: string; sourceId?: string }> = [
  { name: "pitch", family: "pitch-drift" },
  { name: "timing", family: "timing-smear" },
  ...eligibleSources(LOSSY).map((sourceId) => ({ name: `lossy/${sourceId}`, family: LOSSY, sourceId })),
];

const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
/** One ladder step, in log units — the natural scale for a geometric ladder. */
const stepUnit = (m: number[]) => Math.log(m[m.length - 1] / m[0]) / (m.length - 1);

describe("E5/S2 — the axis adapter", () => {
  it("flipAxis is its own inverse, exactly, on every rung of every ladder", () => {
    for (const { family, sourceId } of LADDERS) {
      const axis = axisFor(family, sourceId);
      for (const label of axis.labels) {
        expect(flipAxis(axis.direction, flipAxis(axis.direction, label))).toBeCloseTo(label, 12);
      }
    }
  });

  it("every config the estimator is handed is STRICTLY ASCENDING", () => {
    for (const { name, family, sourceId } of LADDERS) {
      const config = configFor(axisFor(family, sourceId));
      for (let i = 1; i < config.levels.length; i++) {
        expect(config.levels[i], `${name} rung ${i} is not above rung ${i - 1}`).toBeGreaterThan(
          config.levels[i - 1],
        );
      }
      expect(config.startIndex).toBe(config.levels.length - 3);
      expect(config.stopAfterReversals).toBe(reversalsFor(family));
    }
  });

  it("lossy magnitudes are inverse bitrates; pitch and timing are the labels themselves", () => {
    const pitch = axisFor("pitch-drift");
    expect(pitch.direction).toBe("up");
    expect(pitch.magnitudes).toEqual(pitch.labels);

    const pb1 = axisFor(LOSSY, "pb1");
    expect(pb1.direction).toBe("down");
    expect(pb1.labels[0]).toBe(160);
    expect(pb1.magnitudes[0]).toBeCloseTo(1 / 160, 12);
    expect(pb1.magnitudes.at(-1)).toBeCloseTo(1 / 32, 12);
    expect(pb1.unit).toBe("kbps");
  });

  it("a ladder too short to start three from the top is refused, not silently clamped", () => {
    const stub = { ...axisFor("pitch-drift"), labels: [1, 2, 3], magnitudes: [1, 2, 3] } as StaircaseAxis;
    expect(() => configFor(stub)).toThrow(/too few to start/);
  });
});

describe("E5/S2 — trials come from the pool, never from a list", () => {
  it("every trial in a full session lands on an eligible window with a resolvable pair", () => {
    for (const { name, family, sourceId } of LADDERS) {
      const legal = new Set(
        startSession(family, 4242, sourceId).instances.map((i) => `${i.sourceId}@${i.startSec}`),
      );
      let s = startSession(family, 4242, sourceId);
      const rand = rng(99);
      let seen = 0;
      while (!isFinished(s)) {
        const t = nextTrial(s);
        expect(legal.has(`${t.instance.sourceId}@${t.instance.startSec}`), `${name}: illegal window`).toBe(true);
        expect(t.degraded.level).toBe(t.label);
        expect(t.degraded.family).toBe(family);
        expect(t.reference.sourceId).toBe(t.instance.sourceId);
        expect([t.srcA, t.srcB].sort()).toEqual([t.degraded.url, t.reference.url].sort());
        if (sourceId) expect(t.instance.sourceId).toBe(sourceId);
        seen++;
        s = answer(s, rand() < 0.7);
      }
      expect(seen).toBeGreaterThan(10);
    }
  });

  it("nextTrial is idempotent — a React re-render must not advance the cycle", () => {
    const s = startSession("pitch-drift", 7);
    const a = nextTrial(s);
    const b = nextTrial(s);
    expect(b).toEqual(a);
    const after = answer(s, true);
    expect(after.visits[a.levelIndex]).toBe(1);
    expect(s.visits[a.levelIndex]).toBeUndefined(); // the original is untouched
  });

  it("the damaged side is balanced and not alternating", () => {
    let bs = 0;
    let runs = 0;
    let prev: string | null = null;
    const N = 20000;
    for (let i = 1; i <= N; i++) {
      const side = degradedSideFor(31337, i);
      if (side === "b") bs++;
      if (side !== prev) runs++;
      prev = side;
    }
    const share = bs / N;
    console.log(`[E5/S2] damaged side: ${(share * 100).toFixed(1)}% on B · ${runs} runs in ${N} trials`);
    expect(share).toBeGreaterThan(0.47);
    expect(share).toBeLessThan(0.53);
    // Perfect alternation would give N runs; a fair coin gives about N/2.
    expect(runs).toBeGreaterThan(N * 0.45);
    expect(runs).toBeLessThan(N * 0.55);
  });

  it("a correct pick is the one holding the damaged clip", () => {
    const t = nextTrial(startSession("timing-smear", 5));
    expect(isCorrectPick(t, t.degradedSide)).toBe(true);
    expect(isCorrectPick(t, t.degradedSide === "a" ? "b" : "a")).toBe(false);
  });

  it("a lossy session names its source before it starts, and stays on it (RT-65)", () => {
    for (const seed of [1, 2, 3, 4, 5, 6]) {
      const picked = pickSourceForSeed(LOSSY, seed);
      expect(eligibleSources(LOSSY)).toContain(picked);
      const s = startSession(LOSSY, seed);
      expect(s.sourceId).toBe(picked);
      expect(new Set(s.instances.map((i) => i.sourceId))).toEqual(new Set([picked]));
      expect(sessionResult(s).sourceId).toBe(picked);
    }
    expect(pickSourceForSeed("pitch-drift", 1)).toBeUndefined();
  });
});

/** One full session against a simulated listener, through the real session API. */
function simulate(family: string, sourceId: string | undefined, seed: number, o: Observer): StaircaseSession {
  let s = startSession(family, seed, sourceId);
  const rand = rng(seed ^ 0x5bf03635);
  while (!isFinished(s)) {
    const t = nextTrial(s);
    s = answer(s, rand() < pCorrect(s.axis.magnitudes[t.levelIndex], o));
  }
  return s;
}

/**
 * A session at an arbitrary reversal budget, so recovery can be measured at a
 * length where the estimator is able to speak at all — see the refusal table
 * below for why that is not the shipped length on four of the five ladders.
 */
function simulateAt(
  family: string,
  sourceId: string | undefined,
  seed: number,
  o: Observer,
  stopAfterReversals: number,
): { state: ReturnType<typeof startSession>["state"]; config: StaircaseConfig } {
  const base = startSession(family, seed, sourceId);
  const config = { ...base.config, stopAfterReversals, maxTrials: 200 };
  const rand = rng(seed ^ 0x5bf03635);
  let state = startStaircase(config);
  while (!state.finished) {
    state = recordResponse(state, rand() < pCorrect(config.levels[state.currentIndex], o), config);
  }
  return { state, config };
}

describe("E5/S2 — the adapter recovers a known threshold [SIMULATED]", () => {
  /**
   * CRITERION 2, MET WITH A CORRECTION TO ITS OWN PREMISE. The plan said "2000
   * sessions per ladder recover a known threshold". Measuring it exposed that at
   * the SHIPPED session length four of the five ladders almost never return a
   * number at all (the table in the next block), which is a property of the
   * ESTIMATOR and the ladder widths, not of the adapter this slice built.
   *
   * So the adapter is proven at a budget where the estimator can speak — 32
   * reversals — which isolates the question this slice is answerable for: does a
   * threshold measured on an INVERTED axis come back correct, in kbps? The
   * refusal rate is reported separately and escalated, not smuggled in here.
   */
  const SESSIONS = 400;
  const REVERSALS = 32;

  it(
    "bias, RMSE and coverage on all five ladders, in display units",
    { timeout: 300_000 },
    () => {
      const rows: string[] = [];
      for (const { name, family, sourceId } of LADDERS) {
        const axis = axisFor(family, sourceId);
        const unit = stepUnit(axis.magnitudes);
        for (const idx of [3, axis.magnitudes.length >> 1, axis.magnitudes.length - 4]) {
          const o = obs(axis.magnitudes[idx], 0.35, 0.02);
          const truthMag = claimTarget(o);
          const truth = Math.log(truthMag);
          const trueLabel = flipAxis(axis.direction, truthMag);
          const errors: number[] = [];
          const labels: number[] = [];
          let covered = 0;
          let refused = 0;
          for (let n = 1; n <= SESSIONS; n++) {
            const { state, config } = simulateAt(family, sourceId, n * 7919, o, REVERSALS);
            const raw = fitThreshold(state, config);
            if (raw.kind !== "threshold") {
              refused++;
              continue;
            }
            // Reported in the family's OWN unit, then compared in magnitude —
            // the round trip through kbps is part of what is being proven.
            const reportedLabel = flipAxis(axis.direction, raw.threshold);
            labels.push(reportedLabel);
            errors.push((Math.log(flipAxis(axis.direction, reportedLabel)) - truth) / unit);
            const ends = raw.ci95.map((m) => flipAxis(axis.direction, m)).sort((a, b) => a - b);
            if (ends[0] <= trueLabel && trueLabel <= ends[1]) covered++;
          }
          const bias = mean(errors);
          const rmse = Math.sqrt(mean(errors.map((e) => e * e)));
          rows.push(
            `[E5/S2] ${name.padEnd(11)} true ${trueLabel.toFixed(1).padStart(6)} ${axis.unit.split(" ")[0].padEnd(5)}` +
              ` -> median ${median(labels).toFixed(1).padStart(6)}` +
              `   bias ${(bias >= 0 ? "+" : "") + bias.toFixed(2)} steps · RMSE ${rmse.toFixed(2)} · ` +
              `CI covers ${((100 * covered) / Math.max(1, errors.length)).toFixed(0)}% · ` +
              `${refused}/${SESSIONS} refused`,
          );
          expect(Math.abs(bias), `${name} @ ${trueLabel}: bias`).toBeLessThan(0.35);
          // R4 measured the fit's RMSE at 0.8-1.3 ladder steps and the reversal
          // average at the same; this asserts the adapter costs nothing on top.
          expect(rmse, `${name} @ ${trueLabel}: RMSE`).toBeLessThan(1.5);
          expect(errors.length, `${name} @ ${trueLabel}: too few to measure`).toBeGreaterThan(SESSIONS * 0.4);
          // The interval must not become a false statement on an inverted axis.
          expect(covered / Math.max(1, errors.length), `${name} @ ${trueLabel}: coverage`).toBeGreaterThan(0.9);
        }
      }
      console.log(rows.join("\n"));
    },
  );
});

describe("E5/S4 — what the session costs and what it buys [SIMULATED]", () => {
  /**
   * THE BEFORE, which this rule replaced. At a fixed 12 reversals — ~39 trials,
   * ~20 minutes for everyone — E5/S2 measured:
   *
   *   ladder      ladder span   a number   bias among survivors
   *   pitch             x32.3        99%          -0.07 steps
   *   timing             x8.0        32%          -0.16
   *   lossy/pb1          x5.0         3%          +0.04   (n=46)
   *   lossy/pb4          x6.0         8%          -0.54   (n=138)
   *   lossy/pb6          x3.5         0%             -    (n=0)
   *
   * Two things were wrong and they were the same thing. Four ladders spent 20
   * minutes to say "inconclusive", and the few that did produce a number were
   * SELECTED on having produced a narrow posterior — which is why pb4's came
   * back more than half a ladder step too sensitive with nothing on screen to
   * distinguish them.
   *
   * The information rule fixes both by construction: a session that has not
   * resolved keeps going instead of being discarded, so there is no selection
   * left to bias anything, and a session that HAS resolved stops instead of
   * charging for another eight questions.
   *
   * Pinned, both halves. If the rate collapses or the bias returns, this fails.
   */
  const SESSIONS = 600;

  it("the stopping rule pays for the time it takes", { timeout: 300_000 }, () => {
    const rows: string[] = [];
    const rates: Record<string, number> = {};
    const biases: Record<string, number> = {};
    let pitchTrials: number[] = [];
    for (const { name, family, sourceId } of LADDERS) {
      const axis = axisFor(family, sourceId);
      const unit = stepUnit(axis.magnitudes);
      const kinds: Record<string, number> = {};
      const err: number[] = [];
      const trials: number[] = [];
      let informative = 0;
      for (const idx of [3, axis.magnitudes.length >> 1, axis.magnitudes.length - 4]) {
        const o = obs(axis.magnitudes[idx], 0.35, 0.02);
        const truth = Math.log(claimTarget(o));
        for (let n = 1; n <= SESSIONS; n++) {
          const sess = simulate(family, sourceId, n * 7919, o);
          const r = sessionResult(sess);
          kinds[r.kind] = (kinds[r.kind] ?? 0) + 1;
          trials.push(sess.state.trials.length);
          if (r.band.heardIndex !== null && r.band.missedIndex !== null) informative++;
          if (r.kind === "threshold") err.push((Math.log(flipAxis(axis.direction, r.label)) - truth) / unit);
        }
      }
      const total = SESSIONS * 3;
      rates[name] = (kinds.threshold ?? 0) / total;
      biases[name] = err.length ? mean(err) : NaN;
      if (name === "pitch") pitchTrials = trials;
      // 2 clips x 8s min-listen, x1.9 for taps and replays (DelicacyFlow's own
      // derivation) — the honest floor on what a session costs someone.
      const minutes = (median(trials) * 16 * 1.9) / 60;
      rows.push(
        `[E5/S4] ${name.padEnd(11)} ${median(trials).toFixed(0).padStart(3)} trials ` +
          `(~${minutes.toFixed(0).padStart(2)} min) -> a number ${`${(100 * rates[name]).toFixed(0)}%`.padStart(4)} · ` +
          `two-sided band ${`${((100 * informative) / total).toFixed(0)}%`.padStart(4)} · ` +
          `bias ${(biases[name] >= 0 ? "+" : "") + biases[name].toFixed(2)} steps · ` +
          `${(informative / total / minutes * 100).toFixed(1)} pts of band per minute`,
      );
    }
    console.log("[E5/S4] === MINUTES IN, INFORMATION OUT ===\n" + rows.join("\n"));

    /**
     * PITCH GETS SIX MINUTES BACK. It used to be charged 40 trials for a 90%
     * band; it is now charged 27 for a 78% one, which is a worse session and a
     * better RATE — 5.7 points of band per minute against 4.5. That is the
     * trade the budget rule is for, and the Gym is where it pays: a 7-day
     * cooldown means the arc is made of repeat sessions, so two short ones beat
     * one long one that gets abandoned.
     */
    expect(median(pitchTrials), "pitch is still being overcharged").toBeLessThan(32);

    /**
     * LOSSY GETS THE TIME PITCH GAVE BACK, and it converts: pb1's band goes
     * 36% -> 51% and pb4's 49% -> 70% against the flat 12-reversal budget.
     */
    expect(rates["lossy/pb1"], "pb1 did not improve on the flat budget").toBeGreaterThan(0.15);
    expect(rates["lossy/pb4"], "pb4 did not improve on the flat budget").toBeGreaterThan(0.2);

    /**
     * AND THE SELECTION BIAS IS GONE ON EVERY LADDER THAT SHIPS. pb4 was -0.54
     * steps under the flat budget with nothing on screen to warn its users; it
     * is now -0.09.
     */
    for (const { name } of LADDERS) {
      expect(Math.abs(biases[name]), `${name}: survivor bias is back`).toBeLessThan(0.35);
    }

  });

  it("nobody is charged for questions that buy nothing", { timeout: 300_000 }, () => {
    for (const { name, family, sourceId } of LADDERS) {
      const axis = axisFor(family, sourceId);
      const o = obs(axis.magnitudes[axis.magnitudes.length >> 1], 0.35, 0.02);
      let capped = 0;
      const trials: number[] = [];
      for (let n = 1; n <= 300; n++) {
        const sess = simulate(family, sourceId, n * 7919, o);
        trials.push(sess.state.trials.length);
        if (sess.state.trials.length >= MAX_GYM_TRIALS) capped++;
        expect(sess.state.trials.length).toBeLessThanOrEqual(MAX_GYM_TRIALS);
      }
      console.log(
        `[E5/S4] ${name.padEnd(11)} median ${median(trials).toFixed(0)} trials · ` +
          `${reversalsFor(family)} reversals · hit the ${MAX_GYM_TRIALS}-trial ceiling ${((100 * capped) / 300).toFixed(0)}%`,
      );
    }
  });
});

describe("E5/S2 — what the adapter buys [SIMULATED]", () => {
  /**
   * THE DEFECT, MEASURED STRUCTURALLY. A listener whose ear works the way ears
   * do — damage gets easier to hear as the bitrate falls — is run against a
   * config holding the same bitrates in NUMERIC order, which is what any
   * consumer assuming "up" would build.
   *
   * TWO GUESSES ABOUT THE MECHANISM WERE WRONG BEFORE THIS WAS MEASURED, which
   * is the reason it is measured. The staircase does NOT run away to the wrong
   * end — reversing the ladder turns 2-down/1-up into an effective 2-up/1-down,
   * which still converges, just onto a different criterion point (P = 0.618
   * rather than 0.707). The sampler looks fine. The damage is entirely at the
   * REPORT: `fitThreshold` reads `levels[0]` as the gentlest rung, so the two
   * bounds are swapped, and the sentence a person would read comes out exactly
   * inverted.
   */
  it("kbps in numeric order reports the bound from the OPPOSITE end of the ladder", () => {
    const axis = axisFor(LOSSY, "pb1");
    const naive: StaircaseConfig = {
      ...DEFAULT_STAIRCASE,
      levels: [...ladderLevels(LOSSY, "pb1")].sort((a, b) => a - b),
      startIndex: axis.labels.length - 3,
    };
    const gentlest = Math.max(...naive.levels); // 160 kbps — least damage
    const harshest = Math.min(...naive.levels); // 32 kbps — most damage

    // A listener far MORE sensitive than the instrument's gentlest rung.
    const keen = obs(axis.magnitudes[0] / 4, 0.35);
    const naiveBounds: number[] = [];
    for (let n = 1; n <= 100; n++) {
      const rand = rng(n * 7919);
      let state = startStaircase(naive);
      while (!state.finished) {
        // The LISTENER is real: correctness follows the damage (1 / kbps),
        // whatever order the config happens to store the bitrates in.
        state = recordResponse(state, rand() < pCorrect(1 / naive.levels[state.currentIndex], keen), naive);
      }
      const r = fitThreshold(state, naive);
      if (r.kind === "below" || r.kind === "above") naiveBounds.push(r.bound);
    }
    const adapter = sessionResult(simulate(LOSSY, "pb1", 12345, keen));

    console.log(
      `[E5/S2] a listener who hears damage at ${flipAxis("down", claimTarget(keen)).toFixed(0)} kbps — ` +
        `finer than the ${gentlest} kbps gentlest rung:\n` +
        `[E5/S2]   adapter: "${adapter.kind}", bound ${adapter.kind === "below" ? adapter.boundLabel : "-"} kbps · ` +
        `naive: bound ${median(naiveBounds)} kbps on ${naiveBounds.length}/100 sessions`,
    );

    // The adapter names the rung the listener actually beat.
    expect(adapter.kind).toBe("below");
    if (adapter.kind === "below") expect(adapter.boundLabel).toBe(gentlest);
    // The naive config names the other end of the ladder — a statement that is
    // not merely imprecise but the reverse of the truth.
    expect(naiveBounds.length).toBeGreaterThan(90);
    expect(median(naiveBounds)).toBe(harshest);
  });
});

describe("E5/S2 — all four outcome kinds, and the inverted bound", () => {
  it("a listener far better than the instrument gets a BOUND, not a number", () => {
    for (const { name, family, sourceId } of LADDERS) {
      const axis = axisFor(family, sourceId);
      // Threshold two full steps below the gentlest rung we can render.
      const o = obs(axis.magnitudes[0] / 4, 0.35);
      const r = sessionResult(simulate(family, sourceId, 12345, o));
      expect(r.kind, `${name}`).toBe("below");
      if (r.kind !== "below") continue;
      expect(r.boundLabel).toBe(axis.labels[0]);
      if (axis.direction === "down") {
        // THE FLIP, stated: "below the gentlest rung" is a HIGHER bitrate than
        // anything on the ladder, because the ladder counts downward.
        expect(r.boundLabel).toBe(Math.max(...axis.labels));
      }
    }
  });

  it("a listener far worse than the instrument gets the other bound", () => {
    for (const { name, family, sourceId } of LADDERS) {
      const axis = axisFor(family, sourceId);
      const o = obs(axis.magnitudes[axis.magnitudes.length - 1] * 4, 0.35);
      const r = sessionResult(simulate(family, sourceId, 999, o));
      expect(r.kind, `${name}`).toBe("above");
      if (r.kind !== "above") continue;
      expect(r.boundLabel).toBe(axis.labels[axis.labels.length - 1]);
    }
  });

  it("a session with no answers is inconclusive, not a number", () => {
    const r = sessionResult(startSession("pitch-drift", 1));
    expect(r.kind).toBe("inconclusive");
    expect(r.trials).toBe(0);
  });

  /**
   * THE INVERTED INTERVAL, on the family that has one. The seed is SEARCHED
   * rather than picked, because only about 3% of pb1 sessions return a number
   * at the shipped budget (the finding above) — a hand-chosen seed here would
   * be a test that passes for a reason unrelated to what it claims to check.
   */
  it("a converged lossy session reports kbps with its interval the right way round", () => {
    const axis = axisFor(LOSSY, "pb1");
    const o = obs(axis.magnitudes[axis.magnitudes.length >> 1], 0.35);
    let found = 0;
    for (let n = 1; n <= 400 && found < 3; n++) {
      const r = sessionResult(simulate(LOSSY, "pb1", n * 7919, o));
      if (r.kind !== "threshold") continue;
      found++;
      expect(r.ci95[0]).toBeLessThan(r.ci95[1]);
      expect(r.label).toBeGreaterThan(r.ci95[0]);
      expect(r.label).toBeLessThan(r.ci95[1]);
      // A kbps threshold is a fact about the listener AND the material (N3).
      expect(r.sourceId).toBe("pb1");
      expect(r.unit).toBe("kbps");
      console.log(
        `[E5/S2] ${r.label.toFixed(1)} kbps on ${r.sourceId} ` +
          `(95% CI ${r.ci95[0].toFixed(1)}-${r.ci95[1].toFixed(1)} kbps), ` +
          `${r.trials} trials, n = ${r.cohortN} [SIMULATED]`,
      );
    }
    expect(found, "no pb1 session converged in 400 tries").toBe(3);
  });
});

describe("E5/S2 — every result carries what it cannot claim (N3, RT-85a)", () => {
  it("cohortN is zero and the ladder's reach is stated on every outcome", () => {
    for (const { family, sourceId } of LADDERS) {
      const r = sessionResult(startSession(family, 3, sourceId));
      expect(r.cohortN).toBe(0);
      expect(r.gentlest).toBe(ladderLevels(family, sourceId)[0]);
      expect(r.harshest).toBe(ladderLevels(family, sourceId).at(-1));
      expect(r.unit).toBeTruthy();
    }
  });

  it("a lossy result names its source AND carries that source's damage spread", () => {
    for (const sourceId of eligibleSources(LOSSY)) {
      const r = sessionResult(startSession(LOSSY, 1, sourceId));
      expect(r.sourceId).toBe(sourceId);
      expect(r.limits.length).toBeGreaterThan(0);
      expect(r.limits.every((l) => l.sourceId === sourceId)).toBe(true);
      expect(r.limits.some((l) => l.kind === "damage-varies-by-window")).toBe(true);
    }
  });

  it("pitch carries its two limits; timing has none to carry", () => {
    expect(sessionResult(startSession("pitch-drift", 1)).limits).toHaveLength(2);
    expect(sessionResult(startSession("timing-smear", 1)).limits).toHaveLength(0);
  });
});

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}


describe("E5/S3 — the band, which every session gets [SIMULATED]", () => {
  /**
   * PRE-REGISTERED CRITERIA (PM ruling RT-90a b, written before the band existed):
   *   1. EVERY finished session produces a band — no per-session selection, which
   *      is what created the 0.54-step bias E5/S2 measured;
   *   2. the band CONTAINS the true threshold at least 90% of the time, on all
   *      five ladders, measured over ALL sessions and not just the scoreable ones;
   *   3. its width is reported in rungs, so the cost of (b) over (a) is a number
   *      rather than an adjective;
   *   4. the RETEST question is answered: the minimum change in an ear that a
   *      band can detect, against what the fitted point could detect.
   */
  const SESSIONS = 600;

  it.each([0.025, 0.1, 0.16])(
    "at tail %s: how often the band brackets the truth, and how often it says anything",
    { timeout: 300_000 },
    (tail) => {
    const rows: string[] = [];
    for (const { name, family, sourceId } of LADDERS) {
      const axis = axisFor(family, sourceId);
      const unit = stepUnit(axis.magnitudes);
      let produced = 0;
      let contained = 0;
      let total = 0;
      const widths: number[] = [];
      let openTop = 0;
      let openBottom = 0;
      for (const idx of [3, axis.magnitudes.length >> 1, axis.magnitudes.length - 4]) {
        const o = obs(axis.magnitudes[idx], 0.35, 0.02);
        const truth = claimTarget(o);
        for (let n = 1; n <= SESSIONS; n++) {
          const s = simulate(family, sourceId, n * 7919, o);
          const band = sessionBand(s, tail);
          total++;
          expect(band.rungs).toHaveLength(axis.labels.length);
          if (band.heardIndex !== null || band.missedIndex !== null) produced++;
          // Compared in MAGNITUDE, which is the axis the truth lives on; the
          // labels are the same fact read the other way round for lossy.
          const hi = band.heardIndex === null ? Infinity : axis.magnitudes[band.heardIndex];
          const lo = band.missedIndex === null ? 0 : axis.magnitudes[band.missedIndex];
          if (lo <= truth && truth <= hi) contained++;
          if (band.heardIndex === null) openTop++;
          if (band.missedIndex === null) openBottom++;
          if (band.heardIndex !== null && band.missedIndex !== null) {
            widths.push(band.heardIndex - band.missedIndex);
          }
        }
      }
      const coverage = contained / total;
      rows.push(
        `[E5/S3] ${name.padEnd(11)} band brackets the truth ${`${(100 * coverage).toFixed(0)}%`.padStart(4)} · ` +
          `two-sided ${`${((100 * widths.length) / total).toFixed(0)}%`.padStart(4)} · ` +
          `median width ${median(widths).toFixed(0)} rungs (x${Math.exp(median(widths) * unit).toFixed(1)}) · ` +
          `open at top ${`${((100 * openTop) / total).toFixed(0)}%`.padStart(4)} · bottom ${`${((100 * openBottom) / total).toFixed(0)}%`.padStart(4)}`,
      );
      if (tail === BAND_TAIL) {
        // THE PRE-REGISTERED CRITERION, applied only to the tail we ship. The
        // other two rows are the evidence for why this one was chosen.
        expect(coverage, `${name}: the band must bracket the truth`).toBeGreaterThan(0.9);
        expect(produced / total, `${name}: sessions where the band says nothing`).toBeGreaterThan(0.75);
      }
    }
    console.log(
      `[E5/S3] --- band drawn at the ${(100 * (1 - 2 * tail)).toFixed(0)}% interval ---\n` + rows.join("\n"),
    );
  },
  );

  /**
   * CRITERION 4 — THE TRADE-OFF THE PM ASKED FOR, AS A NUMBER.
   *
   * The Gym's whole purpose is the retest arc: did the ear move? What matters
   * is therefore not how precise one session is, but the SMALLEST CHANGE two
   * sessions could distinguish (R3's gate: sigma, not RMSE). MDC80 = 3.96 * the
   * between-session SD of whatever statistic the retest compares.
   *
   * Measured for both candidates on the same simulated sessions: the band edge
   * the reader is actually shown, and the fitted point option (a) would have
   * printed instead.
   */
  it("what change in an ear a band can detect, against the fitted point", { timeout: 300_000 }, () => {
    const MDC80 = (1.96 + 0.8416) * Math.SQRT2;
    const rows: string[] = [];
    for (const { name, family, sourceId } of LADDERS) {
      const axis = axisFor(family, sourceId);
      const unit = stepUnit(axis.magnitudes);
      const o = obs(axis.magnitudes[axis.magnitudes.length >> 1], 0.35, 0.02);
      const heard: number[] = [];
      const fitted: number[] = [];
      for (let n = 1; n <= SESSIONS; n++) {
        const s = simulate(family, sourceId, n * 7919, o);
        const band = sessionBand(s);
        if (band.heardIndex !== null) heard.push(band.heardIndex);
        const r = sessionResult(s);
        if (r.kind === "threshold") fitted.push(Math.log(flipAxis(axis.direction, r.label)) / unit);
      }
      const sdOf = (v: number[]) => {
        if (v.length < 2) return NaN;
        const m = mean(v);
        return Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / (v.length - 1));
      };
      const sdBand = sdOf(heard);
      const sdFit = sdOf(fitted);
      rows.push(
        `[E5/S3] ${name.padEnd(11)} band edge SD ${sdBand.toFixed(2)} rungs -> detects a x${Math.exp(MDC80 * sdBand * unit).toFixed(2)} change · ` +
          `fitted point SD ${(Number.isNaN(sdFit) ? NaN : sdFit).toFixed(2)} rungs -> x${Math.exp(MDC80 * sdFit * unit).toFixed(2)} ` +
          `(from ${fitted.length}/${SESSIONS} scoreable sessions)`,
      );
      expect(sdBand, `${name}: band edge is unusably noisy`).toBeLessThan(2);
    }
    console.log(
      "[E5/S3] === CAN A BAND STILL DETECT THAT AN EAR MOVED? (MDC80, two sessions) ===\n" + rows.join("\n"),
    );
  });

  it("the band names rungs the pipeline can actually render", () => {
    for (const { family, sourceId } of LADDERS) {
      const axis = axisFor(family, sourceId);
      const o = obs(axis.magnitudes[axis.magnitudes.length >> 1], 0.35);
      const band = sessionBand(simulate(family, sourceId, 4242, o));
      for (const r of band.rungs) expect(axis.labels).toContain(r.label);
      if (band.heardAt !== null) expect(axis.labels).toContain(band.heardAt);
      if (band.missedAt !== null) expect(axis.labels).toContain(band.missedAt);
      // The rung counts must add up to the session that produced them.
      const shown = band.rungs.reduce((a, b) => a + b.shown, 0);
      expect(shown).toBeGreaterThan(10);
    }
  });

  it("an unstarted session has rungs but claims nothing", () => {
    const band = sessionBand(startSession("pitch-drift", 1));
    expect(band.heardAt).toBeNull();
    expect(band.missedAt).toBeNull();
    expect(band.rungs.every((r) => r.shown === 0)).toBe(true);
  });

  it("a lossy band reads in kbps, gentlest first, and its heard rung is the LOWER bitrate", () => {
    const axis = axisFor(LOSSY, "pb1");
    const o = obs(axis.magnitudes[axis.magnitudes.length >> 1], 0.35, 0.02);
    for (let n = 1; n <= 50; n++) {
      const band = sessionBand(simulate(LOSSY, "pb1", n * 7919, o));
      if (band.heardAt === null || band.missedAt === null) continue;
      // More damage = fewer kbps, so the rung they HEARD is the smaller number.
      expect(band.heardAt).toBeLessThan(band.missedAt);
      console.log(
        `[E5/S3] pb1: caught the damage at ${band.heardAt} kbps · at ${band.missedAt} kbps could not [SIMULATED]`,
      );
      return;
    }
    throw new Error("no two-sided pb1 band in 50 sessions");
  });
});


describe("E5/S3 — the band under a listener whose ear is not the model's shape [SIMULATED]", () => {
  /**
   * THE GAP THIS CLOSES, and it is the worst thing about the block above.
   *
   * Every coverage number for the band was measured against a simulated
   * listener drawn from THE SAME logistic `psychometric` the fitter assumes —
   * `observer.ts` imports it rather than keeping its own copy. That makes the
   * evidence well-specified, which flatters it. R4 hit this exact problem and
   * answered it with a Weibull generator; the band inherits the obligation,
   * because a 90% bracketing rate that only holds when the fit already knows
   * the answer is not evidence about real ears (N3).
   *
   * The bar here is deliberately lower than 90%: the question is whether the
   * band DEGRADES or COLLAPSES.
   */
  const weibull = (x: number, scale: number, shape: number, lapse: number) =>
    0.5 + (0.5 - lapse) * (1 - Math.exp(-Math.pow(x / scale, shape)));

  const weibullTarget = (scale: number, shape: number) => {
    let lo = Math.log(scale) - 20;
    let hi = Math.log(scale) + 20;
    for (let i = 0; i < 200; i++) {
      const mid = (lo + hi) / 2;
      if (weibull(Math.exp(mid), scale, shape, 0) < P_CONVERGE_2DOWN1UP) lo = mid;
      else hi = mid;
    }
    return Math.exp((lo + hi) / 2);
  };

  it("brackets a Weibull ear too, or degrades visibly", { timeout: 300_000 }, () => {
    const rows: string[] = [];
    for (const { name, family, sourceId } of LADDERS) {
      const axis = axisFor(family, sourceId);
      const mid = axis.magnitudes[axis.magnitudes.length >> 1];
      for (const [shape, lapse] of [
        [2.0, 0],
        [3.5, 0.02],
        [1.5, 0.06],
      ] as Array<[number, number]>) {
        const scale = mid * 1.1;
        const truth = weibullTarget(scale, shape);
        let contained = 0;
        let produced = 0;
        const N = 300;
        for (let n = 1; n <= N; n++) {
          let sess = startSession(family, n * 7919, sourceId);
          const rand = rng((n * 7919) ^ 0x5bf03635);
          while (!isFinished(sess)) {
            const t = nextTrial(sess);
            const x = sess.axis.magnitudes[t.levelIndex];
            sess = answer(sess, rand() < weibull(x, scale, shape, lapse));
          }
          const band = sessionBand(sess);
          const hi = band.heardIndex === null ? Infinity : axis.magnitudes[band.heardIndex];
          const lo = band.missedIndex === null ? 0 : axis.magnitudes[band.missedIndex];
          if (lo <= truth && truth <= hi) contained++;
          if (band.heardIndex !== null || band.missedIndex !== null) produced++;
        }
        rows.push(
          `[E5/S3] ${name.padEnd(11)} Weibull shape ${shape.toFixed(1)} lapse ${(100 * lapse).toFixed(0)}% -> ` +
            `brackets ${`${((100 * contained) / N).toFixed(0)}%`.padStart(4)} · says something ${`${((100 * produced) / N).toFixed(0)}%`.padStart(4)}`,
        );
        // Degrade, do not collapse. The logistic bar is 90%; a differently
        // shaped ear may cost some of that, but a band that brackets the truth
        // less than four times in five would be a false statement on screen.
        expect(contained / N, `${name} Weibull ${shape}/${lapse}: band collapsed`).toBeGreaterThan(0.8);
      }
    }
    console.log("[E5/S3] === MISSPECIFIED EAR (Weibull generator, logistic fit) ===\n" + rows.join("\n"));
  });
});


describe("E5/S5 — pb6 is retired, and the reason stays measured [SIMULATED]", () => {
  /**
   * RT-92a (a). pb6 is rendered, validated, and NOT presented. Retiring a source
   * on the strength of a measurement means the measurement has to keep running,
   * or in six months it is folklore. This block reaches past the shipping guard
   * on purpose — it is the only place in the codebase that may.
   */
  it("its ladder is the narrowest in the pool and its fitted point is biased", () => {
    const axis = axisFor(LOSSY, "pb6");
    const config = configFor(axis);
    const unit = stepUnit(axis.magnitudes);
    const span = axis.magnitudes[axis.magnitudes.length - 1] / axis.magnitudes[0];

    const err: number[] = [];
    for (const idx of [3, axis.magnitudes.length >> 1, axis.magnitudes.length - 4]) {
      const o = obs(axis.magnitudes[idx], 0.35, 0.02);
      const truth = Math.log(claimTarget(o));
      for (let n = 1; n <= 400; n++) {
        const rand = rng((n * 7919) ^ 0x5bf03635);
        let state = startStaircase(config);
        while (!state.finished) {
          state = recordResponse(state, rand() < pCorrect(config.levels[state.currentIndex], o), config);
        }
        const r = fitThreshold(state, config);
        if (r.kind === "threshold") err.push((Math.log(r.threshold) - truth) / unit);
      }
    }
    const bias = mean(err);
    console.log(
      `[E5/S5] pb6 retired: ladder x${span.toFixed(1)} over ${axis.labels.length} rungs · ` +
        `fitted bias ${bias.toFixed(2)} steps at ${config.stopAfterReversals} reversals (n=${err.length}) [SIMULATED]`,
    );

    // Narrowest ladder in the pool, by a wide margin.
    for (const other of eligibleSources(LOSSY)) {
      const a = axisFor(LOSSY, other);
      expect(span, `pb6 is no longer the narrowest — ${other} is`).toBeLessThan(
        a.magnitudes[a.magnitudes.length - 1] / a.magnitudes[0],
      );
    }
    // And the bias that disqualified it. If a re-render fixes this, the test
    // fails and RT-92a gets reopened rather than quietly outliving its reason.
    expect(Math.abs(bias), "pb6 now clears the honesty bar — reopen RT-92a").toBeGreaterThan(0.35);
  });

  it("no session can reach it, even by asking for it directly", () => {
    expect(() => startSession(LOSSY, 1, "pb6")).toThrow(/retired/);
    expect(eligibleSources(LOSSY)).not.toContain("pb6");
    expect(eligibleSources(LOSSY, true)).toContain("pb6");
    // Retirement is per family — pb6 still carries pitch and timing windows.
    expect(eligibleSources("pitch-drift")).toContain("pb6");
  });
});


describe("E5/S7 — session length has ONE definition [SIMULATED]", () => {
  /**
   * THE STORED MEDIAN IS RE-MEASURED, not trusted. `FAMILY_BUDGET.medianTrials`
   * cannot be derived — how many trials a reversal costs depends on the ladder
   * and the listener — so it is a measured constant, and a measured constant
   * nobody re-measures is how `MEASURED_LOSSY_FLOOR_KBPS` became this repo's top
   * standing risk. This is the check that keeps it honest.
   *
   * It also covers the reason the constant was consolidated at all: the number
   * used to be written down three times — the reversal budget here, an
   * `ESTIMATED_MINUTES` table in the flow, and a `MEDIAN_TRIALS` lookup with its
   * own arithmetic on the picker. Both surfaces now call `sessionMinutes`.
   */
  it("the stored median trial count matches what the budget actually costs", { timeout: 300_000 }, () => {
    for (const { name, family, sourceId } of LADDERS) {
      const axis = axisFor(family, sourceId);
      const trials: number[] = [];
      for (const idx of [3, axis.magnitudes.length >> 1, axis.magnitudes.length - 4]) {
        const o = obs(axis.magnitudes[idx], 0.35, 0.02);
        for (let n = 1; n <= 300; n++) trials.push(simulate(family, sourceId, n * 7919, o).state.trials.length);
      }
      const measured = median(trials);
      const stored = medianTrialsFor(family);
      console.log(
        `[E5/S7] ${name.padEnd(11)} ${reversalsFor(family)} reversals -> stored ${stored} trials, ` +
          `re-measured ${measured} -> ~${sessionMinutes(family)} min`,
      );
      // Within one trial: the median is over three listener placements and a
      // lossy family pools two sources, so exact equality would be brittle.
      expect(Math.abs(measured - stored), `${name}: stored median has drifted`).toBeLessThanOrEqual(1);
    }
  });

  it("minutes are derived from the trial count, not typed in anywhere", () => {
    for (const { family } of LADDERS) {
      const expected = Math.round((medianTrialsFor(family) * 2 * 8 * 1.9) / 60);
      expect(sessionMinutes(family)).toBe(expected);
    }
    // The three families must not all cost the same — that was the defect the
    // per-family budget fixed, and a regression would be silent otherwise.
    const distinct = new Set(STAIRCASE_FAMILIES.map((f) => sessionMinutes(f)));
    expect(distinct.size).toBe(3);
  });

  it("refuses a family with no measured budget rather than guessing one", () => {
    expect(() => reversalsFor("stereo-collapse")).toThrow(/no measured session budget/);
    expect(() => sessionMinutes("stereo-collapse")).toThrow(/no measured session budget/);
  });
});
