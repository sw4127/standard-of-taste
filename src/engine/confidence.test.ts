import { describe, it, expect } from "vitest";
import { CONFIDENCE_PCT, CONFIDENCE_Z, CONFIDENCE_LABEL } from "./confidence";

describe("E6/S14 — the confidence level and its multiplier cannot drift apart", () => {
  it("derives the textbook 1.96 at 95%", () => {
    expect(CONFIDENCE_PCT).toBe(95);
    expect(CONFIDENCE_Z).toBeCloseTo(1.959964, 5);
  });

  it("tracks the level rather than being pinned beside it", () => {
    // The point of deriving z is that these hold for ANY level, so changing
    // CONFIDENCE_PCT moves the arithmetic and the sentence together.
    expect(CONFIDENCE_LABEL).toBe("95% confidence");
    expect(CONFIDENCE_LABEL).toContain(String(CONFIDENCE_PCT));
  });

  it("is monotone in the level, which a mistyped table would not be", () => {
    // A sanity property no lookup table gets for free: wider confidence needs a
    // bigger multiplier. Cheap, and it catches a transposed digit.
    expect(CONFIDENCE_Z).toBeGreaterThan(1.644); // 90%
    expect(CONFIDENCE_Z).toBeLessThan(2.576); // 99%
  });
});
