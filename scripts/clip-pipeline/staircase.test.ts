/**
 * The staircase ladder's SPEC (E2/S4).
 *
 * WHAT THIS CAN AND CANNOT CHECK. It cannot render audio — the source cache is
 * git-ignored, and a test that silently skipped when the cache is absent would
 * report green while proving nothing (the argument is spelled out in
 * validate.test.ts). So the measured evidence that these levels render to the
 * magnitudes they claim lives in `clip-pipeline curve`, and its output is
 * quoted in rungs.mjs beside the ladder it justifies.
 *
 * What IS checkable here is every property a staircase actually depends on:
 * constant ratio, monotonicity, the bottom sitting above the measurability
 * floor, the top respecting the drift-not-a-wrong-note constraint, and the
 * ladder still passing through the values already shipping — so the existing
 * pool stays interpretable instead of becoming orphans on a new scale.
 */
import { describe, expect, it } from "vitest";
import {
  LADDER_RUNGS,
  MIN_MEASURABLE_PITCH_CENTS,
  STAIRCASE_LEVELS,
} from "./rungs.mjs";

const pitch = STAIRCASE_LEVELS["pitch-drift"] as number[];

describe("staircase ladder — pitch-drift", () => {
  it("has 8-12 levels", () => {
    expect(pitch.length).toBeGreaterThanOrEqual(8);
    expect(pitch.length).toBeLessThanOrEqual(12);
  });

  it("is strictly increasing", () => {
    for (let i = 1; i < pitch.length; i++) expect(pitch[i]).toBeGreaterThan(pitch[i - 1]);
  });

  /**
   * THE PROPERTY A STAIRCASE RESTS ON. A step must mean the same thing wherever
   * it lands, or "one step down" is a different-sized question at the top of the
   * ladder than at the bottom and the converged threshold means less than it
   * appears to. Constant RATIO, not constant difference — the ruler's own error
   * scales with the value, and so does hearing.
   */
  it("is geometric, at a constant ratio of about sqrt(2)", () => {
    const ratios = pitch.slice(1).map((v, i) => v / pitch[i]);
    for (const r of ratios) {
      expect(r, `ratio ${r.toFixed(3)} is not ~sqrt(2)`).toBeGreaterThan(1.38);
      expect(r, `ratio ${r.toFixed(3)} is not ~sqrt(2)`).toBeLessThan(1.46);
    }
    // And the spread between the loosest and tightest step stays small, so no
    // single rounded value quietly becomes a double step.
    expect(Math.max(...ratios) - Math.min(...ratios)).toBeLessThan(0.07);
  });

  /**
   * The bottom is a MEASUREMENT limit, not a judgment: below 3 cents the ruler
   * under-reads what was rendered (2 cents reads 1.4 against 1.9 predicted), so
   * a level down there would be a number we cannot back (N3).
   */
  it("never goes below the measurability floor", () => {
    expect(Math.min(...pitch)).toBeGreaterThanOrEqual(MIN_MEASURABLE_PITCH_CENTS);
  });

  /**
   * The top is inherited from LADDER_RUNGS' own reasoning: 100 cents is a
   * semitone accumulated across a 20s clip — a drift. Beyond that it stops
   * being the thing the instrument claims to measure, whatever the ruler says.
   */
  it("does not exceed the drift-not-a-wrong-note ceiling", () => {
    const shippingTop = Math.max(...(LADDER_RUNGS["pitch-drift"].values as number[]));
    expect(Math.max(...pitch)).toBeLessThanOrEqual(shippingTop);
  });

  /**
   * The sqrt(2) ratio was chosen partly so this holds. If a future edit breaks
   * it, every already-rendered clip becomes an orphan that sits between levels
   * and cannot be reused or compared.
   */
  it("passes through the values already shipping", () => {
    for (const v of LADDER_RUNGS["pitch-drift"].values as number[]) {
      if (v < MIN_MEASURABLE_PITCH_CENTS) continue;
      const hit = pitch.some((p) => Math.abs(p - v) <= Math.max(0.6, v * 0.05));
      expect(hit, `shipping value ${v} cents has no level near it`).toBe(true);
    }
  });

  it("spans a wide enough range to find a threshold in", () => {
    // Under 10x, a staircase that starts in the wrong place cannot walk to the
    // right one inside a session.
    expect(Math.max(...pitch) / Math.min(...pitch)).toBeGreaterThan(10);
  });

  /**
   * Families without a level list are absent BY DECISION, not by oversight —
   * each has an unsolved problem recorded in rungs.mjs. This test exists so
   * that adding one is a deliberate act with a reason attached.
   */
  it("only families whose ruler is settled have a ladder", () => {
    expect(Object.keys(STAIRCASE_LEVELS)).toEqual(["pitch-drift"]);
  });
});
