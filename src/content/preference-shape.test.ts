/**
 * THE SITTING THE RULING ACTUALLY BOUGHT (E21/S2).
 *
 * RT-2 (a) was ruled on a figure of "~20 minutes" that engineering put in the
 * decisions block without deriving it. This file is the derivation, and it
 * pins the real numbers so the next person to quote a session length is
 * quoting something a test holds.
 */
import { describe, expect, it } from "vitest";
import {
  PREFERENCE_DIMENSIONS,
  PREFERENCE_DESIGN_RATE,
  PREFERENCE_OMITTED_DIMENSIONS,
  PREFERENCE_SHIPPED_DIMENSION_IDS,
  TAKES_PER_PAIR,
  minimumTrialsForDetection,
  planSitting,
  trialsForPower,
} from "@/engine/preference";
import {
  PREFERENCE_DIMENSION_COUNT,
  PREFERENCE_PAIR_COUNT,
  PREFERENCE_SECONDS_PER_PAIR,
  PREFERENCE_SESSION_MINUTES,
  PREFERENCE_TRIALS_PER_DIMENSION,
} from "./instrument-shape";

describe("preference — the shipped set accounts for every dimension", () => {
  it("ships three of the six, and names them", () => {
    expect([...PREFERENCE_SHIPPED_DIMENSION_IDS]).toEqual(["dynamics", "space", "saturation"]);
    expect(PREFERENCE_DIMENSION_COUNT).toBe(3);
  });

  it("names a real dimension in every shipped id and every omission", () => {
    const known = new Set(PREFERENCE_DIMENSIONS.map((d) => d.id));
    for (const id of PREFERENCE_SHIPPED_DIMENSION_IDS) expect(known.has(id)).toBe(true);
    for (const o of PREFERENCE_OMITTED_DIMENSIONS) expect(known.has(o.id)).toBe(true);
  });

  it("leaves no dimension unaccounted for — shipped or explained, never dropped", () => {
    const accounted = [
      ...PREFERENCE_SHIPPED_DIMENSION_IDS,
      ...PREFERENCE_OMITTED_DIMENSIONS.map((o) => o.id),
    ].sort();
    expect(accounted).toEqual(PREFERENCE_DIMENSIONS.map((d) => d.id).sort());
  });

  it("gives every omission a reason a stranger could read", () => {
    for (const o of PREFERENCE_OMITTED_DIMENSIONS) {
      expect(o.because.length).toBeGreaterThan(60);
    }
  });
});

describe("preference — what three dimensions actually costs", () => {
  const plan = planSitting(3)!;

  it("needs 28 choices per dimension, not the 8 the floor allows", () => {
    expect(plan.detectionFloor).toBe(7);
    expect(plan.trialsPerDimension).toBe(28);
    expect(PREFERENCE_TRIALS_PER_DIMENSION).toBe(28);
  });

  it("is 84 pairs and 168 rendered takes", () => {
    expect(plan.pairs).toBe(84);
    expect(plan.takes).toBe(168);
    expect(PREFERENCE_PAIR_COUNT).toBe(84);
    expect(plan.takes).toBe(plan.pairs * TAKES_PER_PAIR);
  });

  it("is EIGHTY-FOUR MINUTES at the pace this product already assumes", () => {
    // The finding of this slice. "~20 minutes" was never reachable: the ruling
    // was taken on a number nobody derived.
    expect(PREFERENCE_SECONDS_PER_PAIR).toBe(60);
    expect(PREFERENCE_SESSION_MINUTES).toBe(84);
    expect(PREFERENCE_SESSION_MINUTES).toBeGreaterThan(20);
  });

  it("is barely cheaper per dimension than six — the saving is in the COUNT", () => {
    // The other half of the correction. Cutting six dimensions to three does
    // not make each dimension much cheaper (47 -> 28 choices); it saves by
    // asking about three fewer things. Stated so nobody re-derives the wrong
    // lesson from the ruling.
    expect(trialsForPower(PREFERENCE_DESIGN_RATE, 6)).toBe(32);
    expect(trialsForPower(PREFERENCE_DESIGN_RATE, 3)).toBe(28);
    const sixPairs = (trialsForPower(PREFERENCE_DESIGN_RATE, 6) as number) * 6;
    expect(sixPairs / plan.pairs).toBeLessThan(2.5);
  });
});

describe("preference — the design rate is the lever, and it is steep", () => {
  it("halves the sitting at a firmer listener and explodes it at a fainter one", () => {
    expect(planSitting(3, 0.9)!.pairs).toBe(42);
    expect(planSitting(3, 0.8)!.pairs).toBe(84);
    expect(planSitting(3, 0.75)!.pairs).toBe(120);
  });

  it("returns null rather than a number when the design rate is undetectable", () => {
    expect(planSitting(3, 0.7)).toBeNull();
    expect(planSitting(3, 0.6)).toBeNull();
  });

  it("reports the power it was planned at, not only the rate", () => {
    // Two sittings at the same design rate and different power differ by more
    // than a third. A plan that surfaced one and hid the other described half
    // its own design.
    expect(planSitting(3, 0.8, 0.8)!.designPower).toBe(0.8);
    expect(planSitting(3, 0.8, 0.5)!.pairs).toBeLessThan(planSitting(3, 0.8, 0.8)!.pairs);
  });

  it("never plans a sitting below its own detection floor", () => {
    for (const m of [1, 2, 3, 4, 6]) {
      for (const rate of [0.75, 0.8, 0.9, 1]) {
        const plan = planSitting(m, rate);
        if (plan === null) continue;
        expect(plan.trialsPerDimension).toBeGreaterThanOrEqual(plan.detectionFloor);
        expect(plan.detectionFloor).toBe(minimumTrialsForDetection(m));
      }
    }
  });
});

describe("preference — an undetectable design rate fails CI, not the website", () => {
  it("keeps the shipped sitting detectable, which is what the null guards", () => {
    // instrument-shape.ts is imported by the reading room and the landing page.
    // It used to throw here at module load; the blast radius of a faint design
    // rate is now this assertion instead of every page on the site.
    expect(PREFERENCE_TRIALS_PER_DIMENSION).not.toBeNull();
    expect(PREFERENCE_PAIR_COUNT).not.toBeNull();
    expect(PREFERENCE_SESSION_MINUTES).not.toBeNull();
  });

  it("still renders the pages that import this module", async () => {
    const shape = await import("./instrument-shape");
    expect(shape.BIAS_CLIP_COUNT).toBeGreaterThan(0);
    expect(shape.SPREAD_SESSION_MINUTES).toBeGreaterThan(0);
  });
});
