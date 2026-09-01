/**
 * E14/S6 — WHAT COMING BACK BUYS (Track H, PM ruling RT-H3 a).
 *
 * H3 asks for two things and they pull against each other. Recent sittings must
 * outweigh older ones, so an ear that has moved is not averaged with the ear it
 * used to be; and sittings must be pooled, because that is the ONLY way to make
 * the arc able to see a smaller change without making a session longer. Pooling
 * blurs; recency-weighting sharpens and costs precision. Neither can be chosen
 * by argument.
 *
 * PRE-REGISTERED, WRITTEN BEFORE THE POOLING CODE WAS FINISHED:
 *
 *   (a) THE POOLED FLOOR KEEPS THE SAME PROMISE. At every window shape the arc
 *       can produce — one against one, one against two, two against two — the
 *       rule fires on at most 5% of people who did not change. The floor is
 *       computed by a FORMULA now rather than read off a simulation, so the
 *       formula has to be held to the measurement it replaced.
 *   (b) POOLING ACTUALLY BUYS SOMETHING. Two sittings a side must lower the
 *       floor to at most 0.8x of one a side. Arithmetic says 1/sqrt(2) = 0.71
 *       before the recency weight gives some back; a floor that did not move
 *       would make the whole slice a decoration.
 *   (c) A MOVED EAR IS NOT DRAGGED BACK BY ITS OWN HISTORY. This is H3's
 *       sentence, and it is the one thing pooling could plausibly break. A
 *       person who genuinely changed and then held steady must still be read as
 *       changed, not averaged back toward who they were.
 *   (d) THE RECENCY WEIGHT IS PRICED, BOTH WAYS. What it costs in effective
 *       sample and what it buys in lag are both measured and printed, so the
 *       choice of `RECENCY_DECAY` is a reported trade rather than a taste.
 *
 * SIMULATED (N3), through the real session API at the shipped budget.
 */
import { describe, expect, it } from "vitest";
import {
  ARC_FLOORS,
  MAX_POOLED,
  RECENCY_DECAY,
  floorKey,
  poolWindow,
  pooledFloor,
  thresholdArc,
  type ThresholdArcEntry,
} from "./arc";
import { observer as obs, pCorrect, rng, type Observer } from "@/analytics/observer";
import { answer, axisFor, isFinished, nextTrial, startSession } from "./staircase-session";
import { fitPosterior } from "./threshold-fit";

const PITCH = "pitch-drift";
const stepLog = (m: number[]) => Math.log(m[m.length - 1] / m[0]) / (m.length - 1);

function play(seed: number, o: Observer) {
  let s = startSession(PITCH, seed);
  const rand = rng(seed ^ 0x5bf03635);
  while (!isFinished(s)) {
    const t = nextTrial(s);
    s = answer(s, rand() < pCorrect(s.axis.magnitudes[t.levelIndex], o));
  }
  return s;
}

const entry = (seed: number, o: Observer, at: number): ThresholdArcEntry => ({
  at,
  session: play(seed, o),
});

const moved = (o: Observer, steps: number, unitLog: number): Observer => ({
  ...o,
  alpha: o.alpha * Math.exp(-steps * unitLog),
});

const axis = axisFor(PITCH);
const UNIT = stepLog(axis.magnitudes);
const STEADY = obs(axis.magnitudes[axis.magnitudes.length >> 1], 0.35, 0.02);
const BASE = ARC_FLOORS[floorKey(PITCH)];

/** One trial of the arc over `shape` sittings, oldest first. */
function readingOver(observers: Observer[], seedBase: number) {
  const entries = observers.map((o, i) => entry((seedBase + i * 977) * 7919, o, 1000 + i));
  return thresholdArc(entries);
}

describe("E14/S6 — the pooled floor keeps the promise the measured one made", () => {
  const TRIALS = 300;

  /**
   * The three window shapes `split` can produce. Two sittings is one a side;
   * three is one against two; four is two a side. Anything past four is
   * truncated to the most recent four, so there is no fourth shape.
   */
  const SHAPES: Array<[string, number]> = [
    ["1 v 1", 2],
    ["1 v 2", 3],
    ["2 v 2", 4],
  ];

  /**
   * THE SPLIT ITSELF, PINNED. Breaking it — sending every sitting to the newer
   * window — does fail the suite, but it fails as a TypeError on an undefined
   * entry, which names the symptom rather than the cause. A wrong split that
   * merely leaned the wrong way would not crash at all. This says what the
   * shape must be.
   */
  it("splits the sittings half and half, giving the odd one to the newer side", () => {
    const shape = (n: number) => {
      const claim = readingOver(Array.from({ length: n }, () => STEADY), 991);
      expect(claim.ok, `${n} sittings refused`).toBe(true);
      return claim.ok ? claim.value.pooled : null;
    };
    expect(shape(2)).toEqual({ older: 1, newer: 1 });
    expect(shape(3)).toEqual({ older: 1, newer: 2 });
    expect(shape(4)).toEqual({ older: 2, newer: 2 });
    // Past the read-back the OLDEST are dropped, never the newest.
    expect(shape(6), "a long history is not truncated to the most recent four").toEqual({
      older: 2,
      newer: 2,
    });
  });

  it("does not invent movement at any window shape", { timeout: 900_000 }, () => {
    console.log(`\n[E14/S6] === POOLING, ${TRIALS} unchanged people per shape [SIMULATED] ===`);
    console.log(`[E14/S6] shape   sittings   floor(x)   false movement   vs one-a-side`);
    const floors: Record<string, number> = {};
    for (const [name, n] of SHAPES) {
      let fired = 0;
      let floorFactor = 0;
      for (let t = 1; t <= TRIALS; t++) {
        const claim = readingOver(Array.from({ length: n }, () => STEADY), t * 31);
        expect(claim.ok, `${name}: refused an ordinary run of sittings`).toBe(true);
        if (!claim.ok) continue;
        floorFactor = claim.value.floorFactor ?? 0;
        if (claim.value.direction !== null) fired++;
      }
      floors[name] = floorFactor;
      const rate = fired / TRIALS;
      console.log(
        `[E14/S6] ${name.padEnd(7)} ${String(n).padStart(8)}   ${floorFactor.toFixed(2).padStart(8)}   ` +
          `${(100 * rate).toFixed(1).padStart(14)}%   ${(floorFactor / floors["1 v 1"]).toFixed(2)}x`,
      );
      // (a) the formula has to keep the promise the simulation made
      expect(rate, `${name}: pooling made the arc invent movement`).toBeLessThanOrEqual(0.05);
    }

    // (b) and it has to actually buy something
    expect(
      floors["2 v 2"] / floors["1 v 1"],
      "pooling two sittings a side did not lower the floor",
    ).toBeLessThanOrEqual(0.8);
    console.log(
      `[E14/S6] two sittings a side cut the floor to ${(floors["2 v 2"] / floors["1 v 1"]).toFixed(2)}x — ` +
        `the whole return on coming back`,
    );
  });

  /**
   * (c) H3'S OWN SENTENCE, AS A TEST.
   *
   * The listener changes once and then holds: two sittings at the old level,
   * two at the new. Pooling must still report the change. If the windows or the
   * weights were wrong — if a stale sitting leaked into the newer window — this
   * is where it shows, because the newer estimate would be dragged back toward
   * the ear this person no longer has.
   */
  it("does not average a moved ear with the ear it used to be", { timeout: 900_000 }, () => {
    const TRUE_CHANGE = 2 * BASE;
    const after = moved(STEADY, TRUE_CHANGE, UNIT);
    let caught = 0;
    const observed: number[] = [];
    for (let t = 1; t <= TRIALS; t++) {
      const claim = readingOver([STEADY, STEADY, after, after], t * 71);
      if (!claim.ok) continue;
      if (claim.value.direction === "closer") caught++;
      observed.push(Math.log(claim.value.distanceFactor ?? 1) / UNIT);
    }
    const mean = observed.reduce((a, b) => a + b, 0) / observed.length;
    console.log(
      `\n[E14/S6] a person who changed by ${TRUE_CHANGE.toFixed(2)} steps and then held: ` +
        `read as moved ${((100 * caught) / TRIALS).toFixed(1)}% of the time, ` +
        `size read as ${mean.toFixed(2)} steps`,
    );
    expect(caught / TRIALS, "a real change is lost when the history is pooled").toBeGreaterThanOrEqual(0.9);
    // The size must not be systematically shrunk toward zero by the pooling.
    expect(mean, "pooling dragged the measured change back toward the old ear").toBeGreaterThan(
      0.75 * TRUE_CHANGE,
    );
  });
});

describe("E14/S6 — the recency weight, priced both ways", () => {
  /**
   * (d) WHAT THE WEIGHT COSTS. Two sittings weighted 1 and `RECENCY_DECAY` are
   * worth fewer than two equally-weighted ones, and the floor pays for it
   * directly. Reported as a number rather than waved through as "mild".
   */
  it("states the precision it gives up", () => {
    const w = [RECENCY_DECAY, 1];
    const sw = w[0] + w[1];
    const nEff = (sw * sw) / (w[0] * w[0] + w[1] * w[1]);
    const withWeight = pooledFloor(BASE, nEff, nEff);
    const withoutWeight = pooledFloor(BASE, 2, 2);
    console.log(
      `\n[E14/S6] === THE RECENCY WEIGHT, PRICED [SIMULATED] ===\n` +
        `[E14/S6] decay ${RECENCY_DECAY} over a window of ${MAX_POOLED}: effective sittings ${nEff.toFixed(2)} of ${MAX_POOLED}\n` +
        `[E14/S6] floor ${withWeight.toFixed(2)} steps against ${withoutWeight.toFixed(2)} unweighted — ` +
        `${(100 * (withWeight / withoutWeight - 1)).toFixed(1)}% wider`,
    );
    expect(nEff).toBeLessThan(MAX_POOLED);
    // The cost has to stay small enough that pooling is still worth doing; if a
    // future decay makes the weighted floor worse than a single pair, the
    // weight has eaten the entire benefit and should be reconsidered.
    expect(withWeight, "the recency weight has eaten the whole benefit of pooling").toBeLessThan(BASE);
  });

  /**
   * WHAT THE WEIGHT BUYS, in the case it exists for: the change happens INSIDE
   * the newer window, so that window holds one sitting from before it and one
   * from after. An unweighted mean splits the difference; the weight leans on
   * the newer one. Measured as the share of runs read as moved.
   */
  it("measures the lag it avoids when a change lands inside a window", { timeout: 900_000 }, () => {
    const TRUE_CHANGE = 2 * BASE;
    const after = moved(STEADY, TRUE_CHANGE, UNIT);
    const TRIALS = 300;
    let caught = 0;
    for (let t = 1; t <= TRIALS; t++) {
      // older window: two steady. newer window: one steady, then the changed ear.
      const claim = readingOver([STEADY, STEADY, STEADY, after], t * 113);
      if (claim.ok && claim.value.direction === "closer") caught++;
    }
    /*
     * THE SAME SITTINGS, POOLED BOTH WAYS. Without this the "benefit" of the
     * weight is an assertion: the shipped rate alone cannot say whether the
     * weight helped, because an unweighted mean might well have caught the same
     * runs. Same seeds, same sessions, one number changed.
     */
    let weightedLead = 0;
    let unweightedLead = 0;
    for (let t = 1; t <= TRIALS; t++) {
      const obsSeq = [STEADY, STEADY, STEADY, after];
      const entries = obsSeq.map((o, i) => entry((t * 113 + i * 977) * 7919, o, 1000 + i));
      const logs = entries.map((e) => {
        const p = fitPosterior(e.session.state, e.session.config);
        return { at: e.at, value: p ? p.logMedian : 0, withinRange: true };
      });
      const older = logs.slice(0, 2);
      const newer = logs.slice(2);
      const gap = (decay: number) =>
        Math.abs(poolWindow(newer, decay).value - poolWindow(older, decay).value) / UNIT;
      weightedLead += gap(RECENCY_DECAY);
      unweightedLead += gap(1);
    }
    const w = weightedLead / TRIALS;
    const u = unweightedLead / TRIALS;
    console.log(
      `[E14/S6] change landing INSIDE the newer window is read as moved ` +
        `${((100 * caught) / TRIALS).toFixed(1)}% of the time (the case the weight exists for)`,
    );
    console.log(
      `[E14/S6] measured gap on the same sittings: weighted ${w.toFixed(2)} steps vs ` +
        `unweighted ${u.toFixed(2)} — the weight recovers ${(100 * (w / u - 1)).toFixed(0)}% more of it`,
    );
    expect(caught).toBeGreaterThan(0);
    // The weight must lean toward the newer sitting, or it is doing nothing at
    // all and the docblock claiming it does is wrong.
    expect(w, "the recency weight does not lean toward the newer sitting").toBeGreaterThan(u);
  });
});
