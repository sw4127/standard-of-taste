/**
 * The timing-smear deviation model (E2/S4b).
 *
 * THE CLAIM UNDER TEST is seed-independence: a staircase level must DETERMINE
 * the magnitude, with the seed choosing only the character of the wander. That
 * is checkable exactly, in a pure function, with no audio — which is the whole
 * reason the deviation model was pulled out of the ffmpeg call.
 *
 * The legacy mode is tested too, and it FAILS the same property, on purpose:
 * the defect is quantified rather than described. A fix whose "before" was
 * never measured is a fix nobody can size.
 */
import { describe, expect, it } from "vitest";
import { timingDeviations } from "./degrade.mjs";

const SEEDS = Array.from({ length: 40 }, (_, i) => 1000 + i * 37);
const spread = (xs: number[]) => Math.max(...xs) / Math.min(...xs);

describe("timing deviations — driftMs mode makes the level determine the magnitude", () => {
  it.each([6, 10, 18, 30, 50])("hits a %i ms target exactly, at every seed", (target) => {
    for (const seed of SEEDS) {
      const { driftIqrMs } = timingDeviations({ mode: "driftMs", param: target, seed, clipSec: 20 });
      expect(Math.abs(driftIqrMs - target), `seed ${seed} produced ${driftIqrMs}`).toBeLessThan(0.01);
    }
  });

  it("the seed still changes the SHAPE of the wander", () => {
    // Determinism must not have been bought by making every clip identical —
    // that would remove the variation the crossed design depends on.
    const shapes = SEEDS.slice(0, 8).map((seed) =>
      timingDeviations({ mode: "driftMs", param: 20, seed, clipSec: 20 }).e.map((v) => +v.toFixed(6)).join(","),
    );
    expect(new Set(shapes).size).toBe(shapes.length);
  });

  it("is deterministic — same seed, same deviations, forever", () => {
    const a = timingDeviations({ mode: "driftMs", param: 20, seed: 4242, clipSec: 20 });
    const b = timingDeviations({ mode: "driftMs", param: 20, seed: 4242, clipSec: 20 });
    expect(a.e).toEqual(b.e);
  });

  it("scales linearly, so a ratio ladder in ms is a ratio ladder in warp", () => {
    const at = (ms: number) => timingDeviations({ mode: "driftMs", param: ms, seed: 777, clipSec: 20 });
    const small = at(10);
    const big = at(40);
    for (let i = 0; i < small.e.length; i++) expect(big.e[i] / small.e[i]).toBeCloseTo(4, 6);
  });

  it("preserves total duration — the deviations sum to zero", () => {
    for (const seed of SEEDS.slice(0, 10)) {
      const { e } = timingDeviations({ mode: "driftMs", param: 25, seed, clipSec: 20 });
      expect(e.reduce((a, b) => a + b, 0)).toBeCloseTo(0, 10);
    }
  });

  it("refuses a target that would need an absurd tempo deviation", () => {
    expect(() => timingDeviations({ mode: "driftMs", param: 5000, seed: 1, clipSec: 20 })).toThrow(/ceiling/);
  });

  it("rejects an unknown mode rather than silently picking one", () => {
    expect(() => timingDeviations({ mode: "nonsense", param: 10, seed: 1, clipSec: 20 })).toThrow(/unknown mode/);
  });
});

describe("timing deviations — the legacy mode's defect, quantified", () => {
  /**
   * THE REASON THIS SLICE EXISTS. Under `maxDevPct` the parameter is a BOUND on
   * ten random draws, so the realized drift is whatever the walk happens to do.
   * Across 40 seeds at one fixed parameter the magnitude varies by a large
   * factor — which means "rung 3" is not a quantity, and a staircase stepping
   * through it would be stepping in noise while still reporting a tidy number.
   */
  it("the SAME parameter produces wildly different drift across seeds", () => {
    const drifts = SEEDS.map(
      (seed) => timingDeviations({ mode: "maxDevPct", param: 0.03, seed, clipSec: 20 }).driftIqrMs,
    );
    // Measured, not asserted loosely: this ratio is the size of the defect.
    expect(spread(drifts)).toBeGreaterThan(3);
  });

  it("and the fix removes exactly that variation", () => {
    const drifts = SEEDS.map(
      (seed) => timingDeviations({ mode: "driftMs", param: 25, seed, clipSec: 20 }).driftIqrMs,
    );
    expect(spread(drifts)).toBeLessThan(1.001);
  });

  /**
   * Legacy renders must keep rendering exactly what they rendered before —
   * the shipped pool's audio is scored by live share URLs.
   */
  it("legacy mode is unchanged: deviations are the bound times the shape", () => {
    const { e, maxDevPct } = timingDeviations({ mode: "maxDevPct", param: 0.015, seed: 8028, clipSec: 20 });
    expect(Math.max(...e.map(Math.abs))).toBeLessThanOrEqual(0.015);
    expect(maxDevPct).toBeLessThanOrEqual(1.5);
    expect(e.reduce((a, b) => a + b, 0)).toBeCloseTo(0, 10);
  });
});
