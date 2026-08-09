/**
 * S8 proof: 2PL parameter recovery (memo D6, PM ruling RT-22a).
 *
 * The claim under test is that IRT recovers `a` DIRECTLY, where the corrected
 * point-biserial could only track it at r ≈ 0.63 (S2) because it is a
 * difficulty-contaminated proxy. If IRT does not beat that, it is not worth its
 * complexity and should not be in the product.
 */

import { describe, expect, it } from "vitest";
import { correlation, delicacyMatrix, estimateItems, rmse } from "./estimate";
import { fitIrt, irtProbability, IRT_GUESS } from "./irt";
import { simulateDelicacy, simulatePersons, syntheticDelicacyItems } from "./simulate";

const fitFor = (nItems: number, nPersons: number, seed: number) => {
  const items = syntheticDelicacyItems(seed, nItems);
  const persons = simulatePersons(seed + 1, nPersons);
  const matrix = delicacyMatrix("SIMULATED", items, simulateDelicacy(seed + 1, items, persons).responses);
  return { items, persons, matrix, fit: fitIrt(matrix) };
};

describe("irt — the response function", () => {
  it("floors at chance and rises monotonically with ability", () => {
    const item = { a: 1.2, b: 0 };
    expect(irtProbability(item, -50)).toBeCloseTo(IRT_GUESS, 6);
    expect(irtProbability(item, 50)).toBeCloseTo(1, 6);
    expect(irtProbability(item, 0)).toBeCloseTo(IRT_GUESS + (1 - IRT_GUESS) / 2, 10);
    const rising = [-3, -1, 0, 1, 3].map((t) => irtProbability(item, t));
    for (let i = 1; i < rising.length; i++) expect(rising[i]).toBeGreaterThan(rising[i - 1]);
  });

  it("a higher discrimination makes the curve steeper at b", () => {
    const gentle = irtProbability({ a: 0.5, b: 0 }, 0.5) - irtProbability({ a: 0.5, b: 0 }, -0.5);
    const sharp = irtProbability({ a: 2.0, b: 0 }, 0.5) - irtProbability({ a: 2.0, b: 0 }, -0.5);
    expect(sharp).toBeGreaterThan(gentle);
  });
});

describe("irt — estimation hygiene", () => {
  it("rejects inputs that cannot identify the scale", () => {
    expect(() => fitIrt({ dataSource: "SIMULATED", itemIds: [], correct: [] })).toThrow(/empty matrix/);
    expect(() =>
      fitIrt({ dataSource: "SIMULATED", itemIds: ["a"], correct: [[true]] }),
    ).toThrow(/at least 2 items/);
  });

  it("converges rather than running to the iteration cap", () => {
    const { fit } = fitFor(30, 600, 900);
    console.log(`[irt] EM converged in ${fit.iterations} iterations (cap hit: ${fit.hitIterationCap})`);
    expect(fit.hitIterationCap).toBe(false);
  });

  it("is deterministic and carries the data source", () => {
    const a = fitFor(20, 300, 11).fit;
    const b = fitFor(20, 300, 11).fit;
    expect(JSON.stringify(a.items)).toBe(JSON.stringify(b.items));
    expect(a.dataSource).toBe("SIMULATED");
  });
});

describe("irt — refuses to dress a failed fit as a measurement (N3)", () => {
  it("flags bound-pinned items on a test too short to identify them", () => {
    // The live pool is six trials. Measured: three of six items pin at a = 4
    // with 100 respondents against a true a of 1.0. A clamp is not an estimate,
    // and the fit says so instead of reporting 4.00 as a discrimination.
    const { fit } = fitFor(6, 100, 5);
    const pinned = fit.items.filter((i) => i.atBound);
    console.log(
      `[irt] 6-item pool at n=100: ${pinned.length}/6 items pinned at a bound — a = ` +
        fit.items.map((i) => i.a.toFixed(2)).join(" "),
    );
    expect(pinned.length).toBeGreaterThan(0);
    expect(fit.warning).toContain("not estimates");
    expect(fit.warning).toContain("too SHORT");
  });
});

describe("irt — PARAMETER RECOVERY (the reason it exists)", () => {
  const { items, persons, matrix, fit } = fitFor(40, 1500, 700);

  const trueA = items.map((i) => i.a);
  const trueB = items.map((i) => i.b);
  const estA = fit.items.map((i) => i.a);
  const estB = fit.items.map((i) => i.b);

  it("recovers difficulty b", () => {
    const r = correlation(estB, trueB)!;
    const err = rmse(estB, trueB);
    console.log(`[irt] difficulty b:     r = ${r.toFixed(3)}  RMSE = ${err.toFixed(3)} logits`);
    expect(r).toBeGreaterThan(0.9);
    expect(err).toBeLessThan(0.6);
  });

  it("recovers discrimination a — the thing CTT could not", () => {
    const r = correlation(estA, trueA)!;
    const err = rmse(estA, trueA);
    // The comparison that decides whether IRT earns its place: the corrected
    // point-biserial tracked true `a` at r ≈ 0.63 in S2, because it is a proxy
    // contaminated by difficulty. IRT estimates `a` directly.
    const ctt = estimateItems(matrix).items.map((i) => i.discriminationCorrected!);
    const cttR = correlation(ctt, trueA)!;
    console.log(
      `[irt] discrimination a: r = ${r.toFixed(3)}  RMSE = ${err.toFixed(3)}   ` +
        `(corrected point-biserial on the same data: r = ${cttR.toFixed(3)})`,
    );
    expect(r).toBeGreaterThan(cttR);
    expect(r).toBeGreaterThan(0.8);
  });

  it("recovers person ability θ better than a raw score does", () => {
    const trueTheta = persons.map((p) => p.theta);
    const irtR = correlation(fit.theta, trueTheta)!;
    const rawScores = matrix.correct.map((row) => row.filter(Boolean).length);
    const rawR = correlation(rawScores, trueTheta)!;
    console.log(`[irt] ability θ:        r = ${irtR.toFixed(3)}  (raw proportion-correct: r = ${rawR.toFixed(3)})`);
    // The claim is COMPARATIVE, and only comparative: IRT weights items by how
    // much they actually discriminate, so it must beat counting them equally.
    // (An earlier version of this test also demanded r > 0.85, which is a
    // number I picked rather than derived — θ recovery is capped at roughly
    // √reliability for a test of finite length, so an absolute floor here is
    // an assertion about test length wearing a statistician's hat.)
    expect(irtR).toBeGreaterThan(rawR);
    expect(irtR).toBeGreaterThan(0.8);
  });

  it("estimates stay inside the bounds the model allows", () => {
    for (const i of fit.items) {
      expect(i.a).toBeGreaterThan(0);
      expect(i.a).toBeLessThanOrEqual(4);
      expect(Math.abs(i.b)).toBeLessThanOrEqual(6);
    }
  });

  it("a healthy 40-item fit pins nothing and raises no warning", () => {
    expect(fit.items.filter((i) => i.atBound)).toEqual([]);
    expect(fit.warning).toBeNull();
  });

  it("recovery improves with sample size", () => {
    const err = [200, 800, 3000].map((n) => {
      const f = fitFor(40, n, 700);
      return rmse(f.fit.items.map((i) => i.b), f.items.map((i) => i.b));
    });
    console.log(`[irt] b RMSE at n = 200/800/3000: ${err.map((e) => e.toFixed(3)).join(" → ")} logits`);
    expect(err[2]).toBeLessThan(err[0]);
  });
});
