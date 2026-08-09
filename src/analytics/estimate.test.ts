/**
 * S2 proof, part 1: the estimators are correct on HAND-COMPUTED cases.
 *
 * Recovery (recovery.test.ts) shows the estimators converge on the truth in
 * aggregate. It cannot catch an estimator that is wrong by a constant factor in
 * a way the simulation happens to mirror. These tests pin the arithmetic
 * against values worked out by hand, so the two proofs fail independently.
 */

import { describe, expect, it } from "vitest";
import {
  correlation,
  delicacyMatrix,
  estimateBiasCohort,
  estimateItems,
  estimatePersonScores,
  estimateReliability,
  regressionSlope,
  rmse,
  type ResponseMatrix,
} from "./estimate";
import { assignDelicacyParams, simulateDelicacy, simulatePersons } from "./simulate";
import { DELICACY_TRIALS } from "@/content/delicacy/items";
import type { BiasItemSpec } from "@/engine/bias";

const m = (correct: boolean[][], itemIds: string[]): ResponseMatrix => ({
  dataSource: "SIMULATED",
  itemIds,
  correct,
});

const T = true;
const F = false;

describe("estimate — helpers", () => {
  it("correlation matches a hand-computed value", () => {
    // x=[1,2,3,4], y=[2,4,5,9]: cov=2.75, sd_x=√1.25, sd_y=√6.5 → r=0.964764
    expect(correlation([1, 2, 3, 4], [2, 4, 5, 9])!).toBeCloseTo(0.964764, 6);
    expect(correlation([1, 2, 3], [3, 2, 1])!).toBeCloseTo(-1, 10);
  });

  it("returns null — not 0 — when a vector is constant (N3)", () => {
    expect(correlation([1, 1, 1], [1, 2, 3])).toBeNull();
    expect(regressionSlope([1, 1, 1], [1, 2, 3])).toBeNull();
    expect(correlation([1], [2])).toBeNull();
  });

  it("rmse and regressionSlope match hand-computed values", () => {
    expect(rmse([1, 2, 3], [1, 2, 3])).toBe(0);
    expect(rmse([2, 4], [1, 2])).toBeCloseTo(Math.sqrt((1 + 4) / 2), 10);
    // y = 2x exactly → slope 2
    expect(regressionSlope([1, 2, 3], [2, 4, 6])!).toBeCloseTo(2, 10);
  });

  it("throws on mismatched lengths rather than silently truncating", () => {
    expect(() => correlation([1, 2], [1])).toThrow(/length mismatch/);
    expect(() => rmse([1, 2], [1])).toThrow(/length mismatch/);
  });
});

describe("estimate — item statistics", () => {
  it("pValue is the proportion correct (higher = EASIER)", () => {
    const r = estimateItems(m([[T, F], [T, F], [T, T], [F, F]], ["i1", "i2"]));
    expect(r.items[0].pValue).toBe(0.75);
    expect(r.items[1].pValue).toBe(0.25);
    expect(r.nPersons).toBe(4);
  });

  it("discrimination is CORRECTED (correlates with the rest-score, not the total)", () => {
    // 4 items, 4 persons. Item 1 tracks ability; item 4 is answered by everyone.
    const matrix = m(
      [
        [T, T, T, T], // strong
        [T, T, F, T],
        [F, F, T, T],
        [F, F, F, T], // weak
      ],
      ["i1", "i2", "i3", "i4"],
    );
    const r = estimateItems(matrix);
    // totals = [4,3,2,1]; i1 x=[1,1,0,0]; rest = total−x = [3,2,2,1].
    // cov=0.25, sd_x=0.5, sd_rest=√0.5 → r = 0.25/(0.5·0.70711) = 0.707107
    expect(r.items[0].discrimination!).toBeCloseTo(0.707107, 6);
    // i4 is constant across persons → discrimination UNDEFINED, not 0.
    expect(r.items[3].discrimination).toBeNull();
    expect(r.items[3].pValue).toBe(1);
  });

  it("an item everyone gets right has null discrimination, not zero (N3)", () => {
    const r = estimateItems(m([[T, T], [T, F], [T, T]], ["easy", "other"]));
    expect(r.items[0].discrimination).toBeNull();
  });

  it("propagates dataSource so the badge cannot be lost downstream", () => {
    expect(estimateItems(m([[T]], ["i1"])).dataSource).toBe("SIMULATED");
    const real: ResponseMatrix = { dataSource: "REAL", itemIds: ["i1"], correct: [[T]] };
    expect(estimateItems(real).dataSource).toBe("REAL");
    expect(estimateReliability(real).dataSource).toBe("REAL");
  });

  it("throws on an empty matrix", () => {
    expect(() => estimateItems(m([], ["i1"]))).toThrow(/empty matrix/);
  });
});

describe("estimate — reliability", () => {
  it("KR-20 matches a hand-computed value", () => {
    // 4 persons × 4 items, totals = [4,3,2,1].
    const matrix = m(
      [
        [T, T, T, T],
        [T, T, T, F],
        [T, T, F, F],
        [T, F, F, F],
      ],
      ["i1", "i2", "i3", "i4"],
    );
    // p = [1, .75, .5, .25]; Σpq = 0 + .1875 + .25 + .1875 = .625
    // totals variance (population) = 1.25; α = (4/3)(1 − .625/1.25) = 0.6667
    expect(estimateReliability(matrix).alpha!).toBeCloseTo(2 / 3, 10);
  });

  it("returns nulls instead of NaN when variance is zero", () => {
    const flat = estimateReliability(m([[T, T], [T, T]], ["i1", "i2"]));
    expect(flat.alpha).toBeNull();
    expect(flat.splitHalf).toBeNull();
  });

  it("returns nulls for degenerate shapes (k<2 or n<2)", () => {
    expect(estimateReliability(m([[T]], ["i1"])).alpha).toBeNull();
    expect(estimateReliability(m([[T, F]], ["i1", "i2"])).alpha).toBeNull();
  });

  it("a more consistent instrument scores higher α than a noisy one", () => {
    const persons = simulatePersons(3, 400);
    const consistent = delicacyMatrix(
      "SIMULATED",
      assignDelicacyParams(DELICACY_TRIALS),
      simulateDelicacy(3, assignDelicacyParams(DELICACY_TRIALS), persons).responses,
    );
    // Coin-flip items carry no signal at all → α should collapse toward 0.
    const noisyItems = assignDelicacyParams(DELICACY_TRIALS).map((i) => ({ ...i, a: 0.001 }));
    const noisy = delicacyMatrix("SIMULATED", noisyItems, simulateDelicacy(3, noisyItems, persons).responses);
    const aC = estimateReliability(consistent).alpha!;
    const aN = estimateReliability(noisy).alpha!;
    console.log(`[est] α: signal-bearing items ${aC.toFixed(3)}  vs  coin-flip items ${aN.toFixed(3)}`);
    expect(aC).toBeGreaterThan(aN);
    expect(Math.abs(aN)).toBeLessThan(0.1); // no signal ⇒ α collapses toward 0
  });

  it("MEASURES the live pool's reliability against the conventional floor", () => {
    // A finding, not a threshold to tune: six 2AFC trials cannot support a
    // reliable individual score. Half the correct answers on hard items are
    // coin flips, and the guessing floor throws away information that no
    // amount of scoring cleverness recovers. Spearman-Brown says the fix is
    // LENGTH: reaching the conventional α ≥ 0.70 needs roughly 46 trials.
    // Locked here so the number is impossible to quietly forget, and carried
    // to S7 (gate design) and the write-up.
    const items = assignDelicacyParams(DELICACY_TRIALS);
    const persons = simulatePersons(31, 2000);
    const alpha = estimateReliability(
      delicacyMatrix("SIMULATED", items, simulateDelicacy(31, items, persons).responses),
    ).alpha!;
    const needed = Math.ceil(items.length * ((0.7 * (1 - alpha)) / (alpha * (1 - 0.7))));
    console.log(
      `[est] live pool (${items.length} trials): α = ${alpha.toFixed(3)} — BELOW the conventional 0.70 floor. ` +
        `Spearman-Brown: ~${needed} trials needed for α ≥ 0.70. [SIMULATED, assigned item params]`,
    );
    // The pool expanded from 6 trials to 24 (RT-24a) and this number moved with
    // it: at six trials alpha was 0.25 and Spearman-Brown demanded ~42 trials;
    // at 24 it demands ~51 in total, i.e. roughly twice again. 24 does NOT
    // reach the conventional floor and nothing may claim it does — but the
    // requirement is now a stretch rather than an impossibility.
    expect(alpha).toBeLessThan(0.7);
    expect(needed).toBeGreaterThan(items.length);
  });
});

describe("estimate — person scores and the matrix adapter", () => {
  it("person score is the proportion correct", () => {
    expect(estimatePersonScores(m([[T, T, F, F], [T, F, F, F]], ["a", "b", "c", "d"]))).toEqual([0.5, 0.25]);
  });

  it("delicacyMatrix scores through the SHIPPING engine (no parallel scorer)", () => {
    const items = assignDelicacyParams(DELICACY_TRIALS);
    const persons = simulatePersons(12, 25);
    const data = simulateDelicacy(12, items, persons);
    const matrix = delicacyMatrix("SIMULATED", items, data.responses);
    expect(matrix.itemIds).toEqual(items.map((i) => i.id));
    expect(matrix.correct).toHaveLength(25);
    // Cross-check every cell against the raw pick vs the answer key.
    for (let p = 0; p < persons.length; p++) {
      for (let i = 0; i < items.length; i++) {
        expect(matrix.correct[p][i]).toBe(data.responses[p][items[i].id].pickedSide === items[i].originalSide);
      }
    }
  });

  it("throws on no sessions", () => {
    expect(() => delicacyMatrix("SIMULATED", assignDelicacyParams(DELICACY_TRIALS), [])).toThrow(/no sessions/);
  });
});

describe("estimate — bias cohort", () => {
  const items: BiasItemSpec[] = [
    { id: "up1", labelDirection: "up", labelIsTrue: true },
    { id: "dn1", labelDirection: "down", labelIsTrue: true },
    { id: "c1", labelDirection: "up", labelIsTrue: true, isControl: true },
  ];

  it("sway is reported in POINTS and matches the engine's adjusted mean", () => {
    // Person moved +2 toward the "up" label and +2 toward the "down" label
    // (i.e. down by 2 in raw points); control drifted 0 → adjusted = raw.
    const r = estimateBiasCohort("SIMULATED", items, [{ up1: 5, dn1: 5, c1: 5 }], [{ up1: 7, dn1: 3, c1: 5 }]);
    expect(r.swayPts[0]).toBeCloseTo(2, 10);
    expect(r.meanControlDriftPts).toBe(0);
    expect(r.nPersons).toBe(1);
  });

  it("carries the engine's drift correction rather than recomputing it", () => {
    // Control drifted +1; balanced up/down items (nUp−nDown = 0) ⇒ residual 0.
    const r = estimateBiasCohort("SIMULATED", items, [{ up1: 5, dn1: 5, c1: 5 }], [{ up1: 7, dn1: 3, c1: 6 }]);
    expect(r.swayPts[0]).toBeCloseTo(2, 10);
    expect(r.meanControlDriftPts).toBe(1);
  });

  it("throws on mismatched or empty passes", () => {
    expect(() => estimateBiasCohort("SIMULATED", items, [{ up1: 5, dn1: 5, c1: 5 }], [])).toThrow(/length mismatch/);
    expect(() => estimateBiasCohort("SIMULATED", items, [], [])).toThrow(/no sessions/);
  });
});
