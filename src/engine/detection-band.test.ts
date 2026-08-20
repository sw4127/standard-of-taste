import { describe, it, expect } from "vitest";
import { detectionBand } from "./delicacy";

/**
 * E6/S9 — the band that replaced the tier name (RT-105a b, applying RT-90a).
 *
 * The cases that matter are the ENDS and the middle-of-nowhere, because a short
 * session puts real people there constantly and those are precisely where the
 * textbook interval fails.
 */
describe("detectionBand — guessing correction", () => {
  it("reports a coin-flip score as zero detection, not fifty percent", () => {
    const b = detectionBand(8, 16);
    expect(b.accuracy).toBe(0.5);
    // The hoax this exists to prevent: 50% correct is 0% detected.
    expect(b.rate).toBe(0);
    expect(b.excludesChance).toBe(false);
  });

  it("halves the headline number, because half of it was luck", () => {
    const b = detectionBand(11, 15);
    expect(b.accuracy).toBeCloseTo(0.733, 3);
    expect(b.rate).toBeCloseTo(0.467, 3);
  });

  it("never reports negative detection when someone scores below chance", () => {
    const b = detectionBand(3, 15);
    expect(b.accuracy).toBe(0.2);
    expect(b.rate).toBe(0);
    expect(b.lo).toBe(0);
    expect(b.excludesChance).toBe(false);
  });
});

describe("detectionBand — the interval", () => {
  /**
   * THE CASE THAT KILLS THE TEXTBOOK FORMULA. p +/- z*sqrt(p(1-p)/n) has zero
   * width at p = 1, so a perfect fifteen would print "100% of flaws, give or
   * take nothing" from fifteen two-way choices. Wilson keeps a real width.
   */
  it("keeps a real width at a perfect score", () => {
    const b = detectionBand(15, 15);
    expect(b.rate).toBe(1);
    expect(b.hi).toBe(1);
    expect(b.lo).toBeLessThan(0.8);
    expect(b.lo).toBeGreaterThan(0.3);
    expect(b.excludesChance).toBe(true);
  });

  it("keeps a real width at a floor score", () => {
    const b = detectionBand(0, 15);
    expect(b.lo).toBe(0);
    expect(b.hi).toBe(0);
    expect(b.excludesChance).toBe(false);
  });

  it("brackets the point estimate", () => {
    for (const k of [0, 1, 5, 8, 11, 14, 15]) {
      const b = detectionBand(k, 15);
      expect(b.lo, `lo <= rate at ${k}/15`).toBeLessThanOrEqual(b.rate + 1e-9);
      expect(b.hi, `rate <= hi at ${k}/15`).toBeGreaterThanOrEqual(b.rate - 1e-9);
      expect(b.lo).toBeGreaterThanOrEqual(0);
      expect(b.hi).toBeLessThanOrEqual(1);
    }
  });

  /**
   * The whole point of E6/S7: fifteen trials buy a WIDE answer. If this ever
   * gets narrow, either the session got much longer or the arithmetic broke,
   * and both deserve a failing test rather than a quiet improvement.
   */
  it("is honestly wide at the shipping length", () => {
    expect(detectionBand(11, 15).hi - detectionBand(11, 15).lo).toBeGreaterThan(0.3);
  });

  it("narrows as trials are added, at the same accuracy", () => {
    const short = detectionBand(11, 15);
    const long = detectionBand(44, 60);
    expect(long.rate).toBeCloseTo(short.rate, 2);
    expect(long.hi - long.lo).toBeLessThan(short.hi - short.lo);
  });
});

describe("detectionBand — beating the coin", () => {
  it("does not call a one-trial edge a result", () => {
    expect(detectionBand(9, 15).excludesChance).toBe(false);
  });

  it("calls it only when the whole interval clears chance", () => {
    const b = detectionBand(14, 15);
    expect(b.excludesChance).toBe(true);
    expect(b.lo).toBeGreaterThan(0);
  });

  /**
   * Equality is not evidence. At a bare majority the lower bound sits below
   * chance and the claim must not be made — this is the common case at n=15,
   * not an edge.
   */
  it("refuses the claim at a bare majority", () => {
    for (const k of [8, 9, 10]) {
      expect(detectionBand(k, 15).excludesChance, `${k}/15 must not claim`).toBe(false);
    }
  });
});

describe("detectionBand — refuses impossible input", () => {
  it("rejects counts outside the trial range", () => {
    expect(() => detectionBand(16, 15)).toThrow(/out of range/);
    expect(() => detectionBand(-1, 15)).toThrow(/out of range/);
  });
  it("rejects a non-positive or fractional trial count", () => {
    expect(() => detectionBand(0, 0)).toThrow(/positive integer/);
    expect(() => detectionBand(1, 2.5)).toThrow(/positive integer/);
  });
});
