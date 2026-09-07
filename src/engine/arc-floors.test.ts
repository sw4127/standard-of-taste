/**
 * THE FLOORS THE READING ROOM DESCRIBES MUST EXIST (E19/S13).
 *
 * `/learn/practice` states the pitch ladder's two-sitting floor and the prestige
 * test's, both read from `ARC_FLOORS`. The page throws rather than printing a
 * placeholder if the pitch entry disappears — correct, and a build failure in a
 * page component is a bad way to learn about it. This says so here instead.
 */
import { describe, expect, it } from "vitest";
import { ARC_FLOORS, soloFloorFactor } from "./arc";

describe("the floors /learn/practice describes", () => {
  it("has a pitch floor to state, as a multiple", () => {
    const factor = soloFloorFactor("pitch-drift");
    expect(factor, "the practice page throws without this").not.toBeNull();
    expect(factor!, "a floor at or below 1x is not a floor").toBeGreaterThan(1);
  });

  it("has a prestige floor to state, in points of the scale", () => {
    expect(ARC_FLOORS.bias, "the practice page prints this as a word").toBeGreaterThan(0);
  });
});
