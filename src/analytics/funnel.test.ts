/**
 * THE FUNNEL ESTIMATOR, CHECKED AGAINST ANSWERS KNOWN BEFORE THE DATA EXISTED
 * (E19/S17).
 *
 * This is the whole argument of the demonstration: the Lab cannot show a real
 * funnel because nobody has been through the instrument, so it shows the
 * ESTIMATOR instead, on data generated from rates that were chosen. If these
 * tests pass, the figures on that page are claims about arithmetic rather than
 * claims about users — which is the only kind this product is allowed to make
 * with a cohort of zero (N3).
 */
import { describe, expect, it } from "vitest";
import {
  estimateFunnel,
  recoverFunnel,
  simulateFunnel,
  wilson,
  type FunnelStep,
} from "./funnel";

const STEPS: FunnelStep[] = [
  { event: "landing_view", passThrough: 0.9 },
  { event: "bias_start", passThrough: 0.5 },
  { event: "bias_blind_done", passThrough: 0.75 },
  { event: "bias_result_view", passThrough: 0.6 },
];

describe("the Wilson interval", () => {
  it("stays inside [0, 1] at the edges, where the textbook one does not", () => {
    const all = wilson(40, 40);
    expect(all.high).toBeLessThanOrEqual(1);
    expect(all.low).toBeGreaterThan(0.85);
    const none = wilson(0, 40);
    expect(none.low).toBe(0);
    expect(none.high).toBeGreaterThan(0);
  });

  it("narrows as the square root of n, not linearly", () => {
    const small = wilson(50, 100);
    const large = wilson(500, 1000);
    const wSmall = small.high - small.low;
    const wLarge = large.high - large.low;
    // Ten times the data is about 3.16 times narrower.
    expect(wSmall / wLarge).toBeGreaterThan(2.8);
    expect(wSmall / wLarge).toBeLessThan(3.5);
  });

  it("refuses a rate with no denominator rather than inventing one", () => {
    expect(() => wilson(0, 0)).toThrow();
  });
});

describe("a funnel with no denominator", () => {
  it("reports null rather than zero, because they are different claims", () => {
    const rows = estimateFunnel(STEPS, [0, 0, 0, 0], 0);
    for (const row of rows) {
      expect(row.rate, `${row.event} invented a rate from nothing`).toBeNull();
      expect(row.low).toBeNull();
    }
  });
});

describe("the estimator recovers the rates that generated the data", () => {
  const rows = recoverFunnel(STEPS, 4000, 200, 20260907);

  it("exercised every step in every replication", () => {
    for (const row of rows) expect(row.usable, `${row.event} never had a denominator`).toBe(200);
  });

  it("lands on the truth, within a quarter of a point", () => {
    for (const row of rows) {
      expect(
        Math.abs(row.biasPoints),
        `${row.event}: truth ${row.truth}, estimated ${row.estimated.toFixed(4)}`,
      ).toBeLessThan(0.25);
    }
  });

  /**
   * THE PROPERTY THAT MAKES A NUMBER PUBLISHABLE. An interval that does not
   * cover the truth at its stated rate is decoration; this is what separates a
   * reported rate from a drawn one.
   */
  it("covers the truth about 95 times in 100", () => {
    for (const row of rows) {
      expect(row.coverage, `${row.event} coverage ${row.coverage}`).toBeGreaterThan(0.9);
      expect(row.coverage, `${row.event} coverage ${row.coverage}`).toBeLessThanOrEqual(1);
    }
  });

  it("is worse at small n, which is the reason the panel is not built", () => {
    const thin = recoverFunnel(STEPS, 40, 200, 20260907);
    const wide = estimateFunnel(STEPS, simulateFunnel(STEPS, 40, 1), 40);
    const last = wide[wide.length - 1];
    expect(last.rate).not.toBeNull();
    // At forty arrivals the last step's interval is far too wide to publish.
    expect((last.high as number) - (last.low as number)).toBeGreaterThan(0.25);
    // And the estimate itself is noisier than at four thousand.
    const noisy = thin.some((row) => Math.abs(row.biasPoints) > 0.25);
    expect(noisy, "forty arrivals produced textbook-clean estimates, which is suspicious").toBe(true);
  });
});

describe("the simulation is reproducible", () => {
  it("gives the same counts for the same seed, forever", () => {
    expect(simulateFunnel(STEPS, 500, 42)).toEqual(simulateFunnel(STEPS, 500, 42));
    expect(simulateFunnel(STEPS, 500, 42)).not.toEqual(simulateFunnel(STEPS, 500, 43));
  });
});
