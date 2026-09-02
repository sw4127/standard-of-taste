import { describe, expect, it } from "vitest";

import { BIAS_SCALE_MAX, BIAS_SCALE_MIN, type BiasItemSpec, type BiasRatings } from "./bias";
import { BIAS_CLIPS } from "@/content/bias/items";
import {
  ASSERTION_FLOOR,
  COMPARISON_METRICS,
  DEGREES_AVAILABLE,
  computeComparisonResult,
  pairIsEligible,
} from "./comparison";

/**
 * A synthetic pool, so the arithmetic below can be checked by hand: four items
 * whose labels push up, four that push down, two controls.
 *
 * Eligible pairs, worked longhand: the up items pair with each other 4·3/2 = 6
 * ways, the down items likewise 6, the two controls 1 way, and nothing else is
 * eligible. Thirteen.
 */
const ITEMS: BiasItemSpec[] = [
  { id: "u1", labelDirection: "up", labelIsTrue: true },
  { id: "u2", labelDirection: "up", labelIsTrue: true },
  { id: "u3", labelDirection: "up", labelIsTrue: false },
  { id: "u4", labelDirection: "up", labelIsTrue: true },
  { id: "d1", labelDirection: "down", labelIsTrue: true },
  { id: "d2", labelDirection: "down", labelIsTrue: false },
  { id: "d3", labelDirection: "down", labelIsTrue: true },
  { id: "d4", labelDirection: "down", labelIsTrue: true },
  { id: "c1", labelDirection: "up", labelIsTrue: true, isControl: true },
  { id: "c2", labelDirection: "up", labelIsTrue: true, isControl: true },
];

const rate = (values: number[]): BiasRatings =>
  Object.fromEntries(ITEMS.map((item, i) => [item.id, values[i]]));

/* Spread across the scale: u 0,3,6,9 · d 1,4,7,10 · controls 2,8. */
const WIDE = [0, 3, 6, 9, 1, 4, 7, 10, 2, 8];

describe("comparison — degrees used", () => {
  it("A compressed rater: two degrees, no pair asserted, and a refusal rather than a zero", () => {
    /* Everything lands on 5 or 6, so no pair is separated by two points. */
    const blind = rate([5, 6, 5, 6, 6, 5, 6, 5, 5, 6]);
    const result = computeComparisonResult(ITEMS, blind, blind);

    expect(result.degreesUsed).toBe(2);
    expect(result.lowestUsed).toBe(5);
    expect(result.highestUsed).toBe(6);
    expect(result.span).toBe(1);
    expect(result.pairs.eligible).toBe(13);
    expect(result.pairs.asserted).toBe(0);
    // The refusal that matters: no asserted pair means no share, not 0%.
    expect(result.reversedShare).toBeNull();
  });

  it("B wide and stable: ten degrees, every asserted pair kept", () => {
    const blind = rate(WIDE);
    const result = computeComparisonResult(ITEMS, blind, blind);

    /* {0,3,6,9,1,4,7,10,2,8} — ten distinct values out of the eleven offered. */
    expect(result.degreesUsed).toBe(10);
    expect(result.degreesAvailable).toBe(11);
    expect(result.span).toBe(10);
    expect(result.pairs.eligible).toBe(13);
    /* Every eligible pair is separated by at least three points here. */
    expect(result.pairs.asserted).toBe(13);
    expect(result.pairs.kept).toBe(13);
    expect(result.pairs.tied).toBe(0);
    expect(result.pairs.reversed).toBe(0);
    expect(result.reversedShare).toBe(0);
  });

  it("C wide and unstable: five reversals, one tie, seven kept — worked by hand", () => {
    const blind = rate(WIDE);
    /*
     * u1 and u4 swap ends (0→9, 9→0); the down items do not move; the two
     * controls both land on 5, which is a collapse rather than a reversal.
     *
     * Up items blind 0,3,6,9 and labelled 9,3,6,0:
     *   u1-u2 reversed · u1-u3 reversed · u1-u4 reversed
     *   u2-u3 kept     · u2-u4 reversed · u3-u4 reversed   -> 5 reversed, 1 kept
     * Down items unchanged -> 6 kept. Controls -> 1 tied.
     */
    const labeled = rate([9, 3, 6, 0, 1, 4, 7, 10, 5, 5]);
    const result = computeComparisonResult(ITEMS, blind, labeled);

    expect(result.pairs.asserted).toBe(13);
    expect(result.pairs.reversed).toBe(5);
    expect(result.pairs.kept).toBe(7);
    expect(result.pairs.tied).toBe(1);
    expect(result.pairs.kept + result.pairs.tied + result.pairs.reversed).toBe(
      result.pairs.asserted,
    );
    expect(result.reversedShare).toBeCloseTo(5 / 13, 10);
  });
});

describe("comparison — which pairs may be counted at all", () => {
  it("counts two controls, and two labels pushing the same way", () => {
    const [u1, u2, , , d1, , , , c1, c2] = ITEMS;
    expect(pairIsEligible(c1, c2)).toBe(true);
    expect(pairIsEligible(u1, u2)).toBe(true);
    expect(pairIsEligible(d1, ITEMS[5])).toBe(true);
  });

  it("refuses a control against a labelled clip, and opposing labels", () => {
    const [u1, , , , d1, , , , c1] = ITEMS;
    // One is being pushed and the other is not: a flip has an innocent cause.
    expect(pairIsEligible(u1, c1)).toBe(false);
    expect(pairIsEligible(d1, c1)).toBe(false);
    // Opposite pushes are a differential reason to reorder, which is sway.
    expect(pairIsEligible(u1, d1)).toBe(false);
  });

  it("ignores a reversal on a pair the labels could explain", () => {
    /*
     * Constructed so that ONE cross-direction pair flips and nothing else does.
     * u4 and d4 trade places (4 <-> 7, three points apart, so the assertion
     * floor is not what excludes them), while each group's internal order
     * survives: up reads 0,1,2,4 then 0,1,2,7 · down reads 8,9,10,7 then
     * 8,9,10,4. An earlier version of this test moved two items to opposite
     * ends of the scale, which also reversed each of them against its own
     * same-direction siblings — six real reversals the engine was right to
     * count, and the test was wrong to forbid.
     */
    const blind = rate([0, 1, 2, 4, 8, 9, 10, 7, 3, 6]);
    const labeled = rate([0, 1, 2, 7, 8, 9, 10, 4, 3, 6]);
    const [, , , u4, , , , d4] = ITEMS;

    // Assert the situation the test claims to be testing actually obtains.
    expect(pairIsEligible(u4, d4)).toBe(false);
    expect(blind[u4.id]).toBeLessThan(blind[d4.id]);
    expect(labeled[u4.id]).toBeGreaterThan(labeled[d4.id]);
    expect(Math.abs(blind[u4.id] - blind[d4.id])).toBeGreaterThanOrEqual(ASSERTION_FLOOR);

    const result = computeComparisonResult(ITEMS, blind, labeled);
    expect(result.pairs.reversed).toBe(0);
  });

  it("ignores a flip inside the assertion floor", () => {
    /* u1 and u2 one point apart blind, swapped on the labelled pass. */
    const blind = rate([5, 6, 0, 10, 1, 4, 7, 10, 2, 8]);
    const labeled = rate([6, 5, 0, 10, 1, 4, 7, 10, 2, 8]);
    const result = computeComparisonResult(ITEMS, blind, labeled);
    expect(ASSERTION_FLOOR).toBe(2);
    expect(result.pairs.reversed).toBe(0);
    // ...and the pair really was eligible, so the floor is what excluded it.
    expect(pairIsEligible(ITEMS[0], ITEMS[1])).toBe(true);
  });
});

describe("comparison — malformed input is a bug upstream, not a user error", () => {
  const blind = rate(WIDE);

  it("throws on an empty item list", () => {
    expect(() => computeComparisonResult([], {}, {})).toThrow(/item list is empty/);
  });

  it("throws on duplicate ids", () => {
    const dupes = [ITEMS[0], ITEMS[0]];
    expect(() => computeComparisonResult(dupes, { u1: 3 }, { u1: 3 })).toThrow(/duplicate item ids/);
  });

  it("throws on a missing rating, naming the pass and the clip", () => {
    const missing = { ...blind };
    delete missing.u3;
    expect(() => computeComparisonResult(ITEMS, missing, blind)).toThrow(
      /missing blind rating for "u3"/,
    );
  });

  it("throws on a rating outside the scale or not a whole number", () => {
    expect(() => computeComparisonResult(ITEMS, { ...blind, u1: 11 }, blind)).toThrow(/got 11/);
    expect(() => computeComparisonResult(ITEMS, { ...blind, u1: -1 }, blind)).toThrow(/got -1/);
    expect(() => computeComparisonResult(ITEMS, { ...blind, u1: 4.5 }, blind)).toThrow(/got 4.5/);
  });
});

describe("comparison — against the pool that actually ships", () => {
  it("derives the same eligible-pair count as the combinatorics, longhand", () => {
    const scored = BIAS_CLIPS.filter((c) => !c.isControl);
    const nUp = scored.filter((c) => c.labelDirection === "up").length;
    const nDown = scored.filter((c) => c.labelDirection === "down").length;
    const nControl = BIAS_CLIPS.length - scored.length;
    const choose2 = (n: number) => (n * (n - 1)) / 2;
    const expected = choose2(nUp) + choose2(nDown) + choose2(nControl);

    // The scan must have found a real pool, not an empty one.
    expect(BIAS_CLIPS.length).toBeGreaterThan(0);
    expect(nUp).toBeGreaterThan(0);
    expect(nDown).toBeGreaterThan(0);
    expect(expected).toBeGreaterThan(0);

    const flat: BiasRatings = Object.fromEntries(BIAS_CLIPS.map((c, i) => [c.id, i % 11]));
    const result = computeComparisonResult(BIAS_CLIPS, flat, flat);

    expect(result.itemCount).toBe(BIAS_CLIPS.length);
    expect(result.pairs.eligible).toBe(expected);
  });

  it("can never report more degrees than the scale offers or the clips allow", () => {
    const flat: BiasRatings = Object.fromEntries(BIAS_CLIPS.map((c, i) => [c.id, i % 11]));
    const result = computeComparisonResult(BIAS_CLIPS, flat, flat);
    expect(result.degreesUsed).toBeLessThanOrEqual(DEGREES_AVAILABLE);
    expect(result.degreesUsed).toBeLessThanOrEqual(BIAS_CLIPS.length);
  });
});

describe("comparison — metric declarations", () => {
  it("declares its metrics beside the arithmetic, with unique ids", () => {
    expect(COMPARISON_METRICS.length).toBeGreaterThan(0);
    const ids = COMPARISON_METRICS.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const m of COMPARISON_METRICS) {
      expect(m.definition.trim().length, m.id).toBeGreaterThan(0);
      expect(m.formula.trim().length, m.id).toBeGreaterThan(0);
      expect(m.target, m.id).toBeNull();
    }
  });

  it("derives the available degrees from the bounds the engine validates", () => {
    expect(DEGREES_AVAILABLE).toBe(BIAS_SCALE_MAX - BIAS_SCALE_MIN + 1);
  });
});
