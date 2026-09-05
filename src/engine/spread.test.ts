/**
 * TRACK N / S3 proof. PRE-REGISTERED before the engine was written:
 *
 *   (a) AGREEMENT IS UNCOMPUTABLE, not merely unscored. Reversing every
 *       rating — turning every preference into its opposite — must not move
 *       either number, because the instrument never imported the sign of the
 *       critic's ordering. This is the trap the whole track is shaped around.
 *   (b) THE NULL MODEL IS RIGHT, cross-checked by Monte Carlo rather than by
 *       restating the algebra, and an indifferent rater lands on it for BOTH
 *       numbers.
 *   (c) A DISCRIMINATING LISTENER AND A FLAT ONE COME OUT DIFFERENT, on
 *       worked examples computed by hand.
 *   (d) THE RECOGNITION FILTER ONLY SUBTRACTS, and when it leaves too little
 *       the engine REFUSES rather than reporting a flattering number (RT-N1 a).
 *   (e) THE DIFFERENCE IS NOT EXPORTED (RT-N2 a).
 */
import { describe, expect, it } from "vitest";
import { MIN_PAIRS_PER_KIND, SPREAD_POOL, closePairs, farPairs } from "@/content/spread/ranking";
import {
  SPREAD_DEGREES,
  SPREAD_METRICS,
  computeSpreadResult,
  spreadIfIndifferent,
} from "./spread";

const ids = SPREAD_POOL.map((i) => i.id);
const rate = (values: number[]) =>
  Object.fromEntries(ids.map((id, n) => [id, values[n]])) as Record<string, number>;

describe("(a) agreement with the critic is uncomputable", () => {
  it("is unchanged when every preference is inverted", () => {
    const original = rate([9, 2, 7, 1, 8, 3]);
    // 10 − r turns every "I liked this more" into "I liked this less".
    const inverted = Object.fromEntries(
      Object.entries(original).map(([id, r]) => [id, 10 - r]),
    );
    const a = computeSpreadResult(original);
    const b = computeSpreadResult(inverted);
    expect(b.far.meanGap).toBe(a.far.meanGap);
    expect(b.close.meanGap).toBe(a.close.meanGap);
  });

  it("is unchanged when the pool order is reversed", () => {
    const values = rate([9, 2, 7, 1, 8, 3]);
    const forwards = computeSpreadResult(values);
    const backwards = computeSpreadResult(values, [], [...SPREAD_POOL].reverse());
    expect(backwards.far.meanGap).toBe(forwards.far.meanGap);
    expect(backwards.close.meanGap).toBe(forwards.close.meanGap);
    expect(backwards.far.count).toBe(forwards.far.count);
  });

  it("carries no signed ranking information anywhere in the result", () => {
    const r = computeSpreadResult(rate([9, 2, 7, 1, 8, 3])) as unknown as Record<string, unknown>;
    const banned = /higher|lower|better|worse|agree|match|rank|correct|score/i;
    for (const key of Object.keys(r)) expect(banned.test(key)).toBe(false);
  });
});

describe("(b) the null model", () => {
  it("matches a Monte Carlo draw rather than restating its own algebra", () => {
    // Deterministic mulberry32 — a flaky proof is not a proof, and the LCG
    // written here first was WORSE than flaky: `seed * 1103515245` exceeds
    // 2^53, so the multiply lost precision in double arithmetic and the draw
    // came out biased. It disagreed with the formula by 0.028 and the formula
    // was right. Math.imul keeps the arithmetic in 32 bits, where it belongs.
    let seed = 20260904;
    const rand = () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = seed;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    let total = 0;
    const draws = 400_000;
    for (let n = 0; n < draws; n += 1) {
      const x = Math.floor(rand() * SPREAD_DEGREES);
      const y = Math.floor(rand() * SPREAD_DEGREES);
      total += Math.abs(x - y);
    }
    const empirical = total / draws;
    expect(Math.abs(empirical - spreadIfIndifferent())).toBeLessThan(0.02);
  });

  it("is about 3.64 points on the eleven-point scale", () => {
    expect(spreadIfIndifferent()).toBeCloseTo(3.6364, 4);
  });

  it("is the SAME reference for both numbers, because chance knows no ranking", () => {
    // The reading rests on this: if the baseline differed by pair kind, two
    // equal figures would not mean "did not discriminate".
    const far = farPairs().length;
    const close = closePairs().length;
    expect(far).toBeGreaterThan(0);
    expect(close).toBeGreaterThan(0);
    const r = computeSpreadResult(rate([5, 5, 5, 5, 5, 5]));
    expect(r.spreadIfIndifferent).toBe(spreadIfIndifferent());
  });
});

describe("(c) worked examples, computed by hand", () => {
  // Pool positions: sp1=4, sp2=9, sp3=12, sp4=14, sp5=15, sp6=19.
  // far   pairs: (sp1,sp4) (sp1,sp5) (sp1,sp6) (sp2,sp6)
  // close pairs: (sp2,sp3) (sp3,sp4) (sp3,sp5) (sp4,sp5)
  it("a flat rater produces zero on both", () => {
    const r = computeSpreadResult(rate([6, 6, 6, 6, 6, 6]));
    expect(r.far.meanGap).toBe(0);
    expect(r.close.meanGap).toBe(0);
    expect(r.refusal).toBeNull();
  });

  it("a listener who splits exactly where the critic did", () => {
    // sp1 low, everything the critic put near it high-ish, so far pairs open up
    // and close pairs stay tight. sp1=1, sp2=8, sp3=8, sp4=8, sp5=8, sp6=8.
    const r = computeSpreadResult(rate([1, 8, 8, 8, 8, 8]));
    // far: |1-8|,|1-8|,|1-8|,|8-8| = 7,7,7,0 -> 21/4 = 5.25
    expect(r.far.meanGap).toBe(5.25);
    // close: all 8 vs 8 -> 0
    expect(r.close.meanGap).toBe(0);
  });

  it("a listener whose gaps fall the other way round", () => {
    // sp3 alone at the bottom: it sits in three of the four CLOSE pairs.
    const r = computeSpreadResult(rate([7, 7, 0, 7, 7, 7]));
    // far pairs involve sp1,sp2,sp4,sp5,sp6 only -> all 7 vs 7 -> 0
    expect(r.far.meanGap).toBe(0);
    // close: |7-0|,|0-7|,|0-7|,|7-7| = 7,7,7,0 -> 5.25
    expect(r.close.meanGap).toBe(5.25);
  });

  it("counts the pairs the pool actually offers", () => {
    const r = computeSpreadResult(rate([9, 2, 7, 1, 8, 3]));
    expect(r.far.count).toBe(farPairs().length);
    expect(r.close.count).toBe(closePairs().length);
  });
});

describe("(d) the recognition filter only ever subtracts", () => {
  it("drops every pair a recognised clip belonged to", () => {
    const values = rate([9, 2, 7, 1, 8, 3]);
    const all = computeSpreadResult(values);
    const minusOne = computeSpreadResult(values, ["sp1"]);
    expect(minusOne.excludedClipIds).toEqual(["sp1"]);
    expect(minusOne.usedClipIds).not.toContain("sp1");
    expect(minusOne.far.count).toBeLessThan(all.far.count);
  });

  it("refuses rather than reporting a number it cannot support", () => {
    // sp1 sits in three of the four far pairs; losing it takes far below the
    // floor, which is exactly the case RT-N1(a) rules on.
    const r = computeSpreadResult(rate([9, 2, 7, 1, 8, 3]), ["sp1"]);
    expect(r.far.count).toBeLessThan(MIN_PAIRS_PER_KIND);
    expect(r.refusal).toBe("too-few-far-pairs");
  });

  it("refuses when everything is recognised, and says which clips", () => {
    const r = computeSpreadResult(rate([9, 2, 7, 1, 8, 3]), ids);
    expect(r.refusal).toBe("too-few-rated-clips");
    expect(r.excludedClipIds).toEqual(ids);
    expect(r.usedClipIds).toEqual([]);
    expect(r.far.meanGap).toBeNull();
    expect(r.close.meanGap).toBeNull();
  });

  it("never turns a refusal into a zero", () => {
    const r = computeSpreadResult(rate([9, 2, 7, 1, 8, 3]), ids);
    expect(r.far.meanGap).not.toBe(0);
    expect(r.close.meanGap).not.toBe(0);
  });

  it("leaves no printable number on a refused reading, only the counts", () => {
    // The hazard this closes: a refusal that still carries a mean averaged
    // over two pairs is one forgotten `if` away from being rendered.
    const r = computeSpreadResult(rate([9, 2, 7, 1, 8, 3]), ["sp1"]);
    expect(r.refusal).not.toBeNull();
    expect(r.far.meanGap).toBeNull();
    expect(r.close.meanGap).toBeNull();
    // The counts survive, because the surface has to say how much was left.
    expect(r.close.count).toBeGreaterThan(0);
  });

  it("needs no rating for a clip the listener recognised", () => {
    const partial: Record<string, number> = { sp2: 4, sp3: 6, sp4: 2, sp5: 9, sp6: 5 };
    expect(() => computeSpreadResult(partial, ["sp1"])).not.toThrow();
  });
});

describe("(e) the difference between the two numbers is not exported", () => {
  it("carries no precomputed difference field", () => {
    const r = computeSpreadResult(rate([1, 8, 8, 8, 8, 8]));
    const flat = JSON.stringify(r);
    // 5.25 − 0 = 5.25; the two numbers are present, their difference is not.
    expect(r.far.meanGap).toBe(5.25);
    expect(r.close.meanGap).toBe(0);
    const values = Object.values(r as unknown as Record<string, unknown>);
    expect(values).not.toContain(5.25 - 0);
    expect(flat.includes('"difference"')).toBe(false);
    expect(flat.includes('"delta"')).toBe(false);
  });

  it("declares both numbers in the metric dictionary, and the baseline", () => {
    const declared = SPREAD_METRICS.map((m) => m.id);
    expect(declared).toContain("spread_far_pairs");
    expect(declared).toContain("spread_close_pairs");
    expect(declared).toContain("spread_if_indifferent");
    for (const m of SPREAD_METRICS) {
      expect(m.formula.length).toBeGreaterThan(10);
      expect(m.target).toBeNull();
    }
  });
});

describe("malformed input is a bug upstream, not a user error", () => {
  it("throws on a missing rating", () => {
    const partial: Record<string, number> = { sp1: 3 };
    expect(() => computeSpreadResult(partial)).toThrow(/missing rating/);
  });

  it("throws on a rating off the scale", () => {
    expect(() => computeSpreadResult(rate([9, 2, 7, 1, 8, 99]))).toThrow(/must be an integer/);
  });

  it("throws on a non-integer rating", () => {
    expect(() => computeSpreadResult(rate([9, 2, 7, 1, 8, 3.5]))).toThrow(/must be an integer/);
  });
});
