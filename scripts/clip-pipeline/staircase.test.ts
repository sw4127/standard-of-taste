/**
 * The staircase ladders' SPEC (E2/S4).
 *
 * WHAT THIS CAN AND CANNOT CHECK. It cannot render audio — the source cache is
 * git-ignored, and a test that silently skipped when the cache is absent would
 * report green while proving nothing (the argument is spelled out in
 * validate.test.ts). So the measured evidence that these levels render to the
 * magnitudes they claim lives in `clip-pipeline curve`, quoted in rungs.mjs
 * beside each ladder it justifies.
 *
 * What IS checkable here is every property a staircase depends on: constant
 * ratio, monotonicity, a range wide enough to walk, and — for pitch — the
 * ladder still passing through the values already shipping, so existing renders
 * stay interpretable instead of becoming orphans between levels.
 */
import { describe, expect, it } from "vitest";
import { LADDER_RUNGS, MIN_MEASURABLE_PITCH_CENTS, STAIRCASE_LEVELS } from "./rungs.mjs";

type Ladder = { unit: string; ratio: number; renderMode?: string; values: number[] };
const ladders = Object.entries(STAIRCASE_LEVELS) as [string, Ladder][];

describe.each(ladders)("staircase ladder — %s", (family, ladder) => {
  it("has 8-12 levels", () => {
    expect(ladder.values.length).toBeGreaterThanOrEqual(8);
    expect(ladder.values.length).toBeLessThanOrEqual(12);
  });

  it("is strictly increasing", () => {
    for (let i = 1; i < ladder.values.length; i++) {
      expect(ladder.values[i]).toBeGreaterThan(ladder.values[i - 1]);
    }
  });

  /**
   * THE PROPERTY A STAIRCASE RESTS ON. A step must mean the same thing wherever
   * it lands, or "one step down" is a different-sized question at the top of the
   * ladder than at the bottom, and the converged threshold means less than it
   * appears to. Constant RATIO, not constant difference — the ruler's error
   * scales with the value, and so does hearing.
   */
  it("is geometric at its declared ratio", () => {
    const ratios = ladder.values.slice(1).map((v, i) => v / ladder.values[i]);
    for (const r of ratios) {
      expect(r / ladder.ratio, `step ratio ${r.toFixed(3)} vs declared ${ladder.ratio.toFixed(3)}`).toBeGreaterThan(0.95);
      expect(r / ladder.ratio, `step ratio ${r.toFixed(3)} vs declared ${ladder.ratio.toFixed(3)}`).toBeLessThan(1.05);
    }
  });

  it("states the physical unit its levels are in", () => {
    // A bare list of numbers is how "rung 3" came to mean two different things.
    expect(ladder.unit).toMatch(/\S/);
  });

  it("spans enough steps to walk to a threshold from a bad start", () => {
    // Expressed in STEPS rather than raw range: what a staircase needs is
    // enough moves to reach the answer, and the two families have honestly
    // different usable spans (pitch 32x, timing 8x).
    expect(ladder.values.length - 1).toBeGreaterThanOrEqual(7);
  });
});

describe("staircase ladder — pitch-drift specifics", () => {
  const pitch = (STAIRCASE_LEVELS["pitch-drift"] as Ladder).values;

  /**
   * The bottom is a MEASUREMENT limit, not a judgment: below 3 cents the ruler
   * under-reads what was rendered (2 cents reads 1.4 against 1.9 predicted), so
   * a level down there would be a number we cannot back (N3).
   */
  it("never goes below the measurability floor", () => {
    expect(Math.min(...pitch)).toBeGreaterThanOrEqual(MIN_MEASURABLE_PITCH_CENTS);
  });

  /**
   * Inherited from LADDER_RUNGS' own reasoning: 100 cents is a semitone
   * accumulated across a 20s clip — a drift. Beyond that it stops being the
   * thing the instrument claims to measure, whatever the ruler says.
   */
  it("does not exceed the drift-not-a-wrong-note ceiling", () => {
    const shippingTop = Math.max(...(LADDER_RUNGS["pitch-drift"].values as number[]));
    expect(Math.max(...pitch)).toBeLessThanOrEqual(shippingTop);
  });

  /**
   * sqrt(2) was chosen partly so this holds. If a future edit breaks it, every
   * already-rendered clip becomes an orphan sitting between levels.
   */
  it("passes through the values already shipping", () => {
    for (const v of LADDER_RUNGS["pitch-drift"].values as number[]) {
      if (v < MIN_MEASURABLE_PITCH_CENTS) continue;
      const hit = pitch.some((p) => Math.abs(p - v) <= Math.max(0.6, v * 0.05));
      expect(hit, `shipping value ${v} cents has no level near it`).toBe(true);
    }
  });
});

describe("staircase ladder — timing-smear specifics", () => {
  const timing = STAIRCASE_LEVELS["timing-smear"] as Ladder;

  /**
   * The whole point of S4b. Under the legacy `maxDevPct` parameterisation the
   * value is a bound on a random draw and realized drift varies 5.3x across
   * seeds, with rung ranges overlapping completely. These levels MUST render in
   * the mode where the level determines the magnitude.
   */
  it("renders in driftMs mode, where the level determines the magnitude", () => {
    expect(timing.renderMode).toBe("driftMs");
  });

  it("stays inside the range the correlator can measure", () => {
    // Below ~12 ms the 1 ms envelope hop dominates (targets 4.4/6.3/8.8
    // measured 6/8/8 — a tie and an inversion). Above ~140 ms the correlator
    // gives out (200 ms measured 102, inverted).
    expect(Math.min(...timing.values)).toBeGreaterThanOrEqual(12);
    expect(Math.max(...timing.values)).toBeLessThanOrEqual(140);
  });

  /**
   * Its levels are in MILLISECONDS while LADDER_RUNGS' are tempo fractions.
   * Reading one as the other would render a 12.5 ms level as a 1250% tempo
   * deviation, so the units must not be confusable.
   */
  it("is not on the same scale as the legacy rung values", () => {
    const legacy = LADDER_RUNGS["timing-smear"].values as number[];
    expect(Math.max(...legacy)).toBeLessThan(1);
    expect(Math.min(...timing.values)).toBeGreaterThan(1);
  });
});

describe("staircase ladders — coverage is deliberate", () => {
  /**
   * Families without a ladder are absent BY DECISION, each with an unsolved
   * problem recorded in rungs.mjs. This exists so adding one is a deliberate
   * act with a reason attached, not a silent fill-in.
   */
  it("all three families have one, each on its own settled scale", () => {
    expect(Object.keys(STAIRCASE_LEVELS).sort()).toEqual(["lossy-artifact", "pitch-drift", "timing-smear"]);
  });

  /**
   * Each family's levels are in a DIFFERENT unit — cents, milliseconds,
   * decibels — because each manipulation has a different natural quantity and
   * forcing one scale on all three is what produced the unitless anchor ratio
   * this session spent three slices unpicking.
   */
  it("no two families share a unit", () => {
    const units = ladders.map(([, l]) => l.unit);
    expect(new Set(units).size).toBe(units.length);
  });
});
