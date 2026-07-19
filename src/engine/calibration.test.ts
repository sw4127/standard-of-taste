import { describe, expect, it } from "vitest";
import {
  BRIER_COIN_FLIP,
  CALIBRATION_GAP_AT,
  MIN_BIN_N,
  binDisplayPct,
  computeCalibration,
  type CalibrationObservation,
} from "./calibration";

const obs = (entries: Array<[95 | 70 | 50, boolean]>): CalibrationObservation[] =>
  entries.map(([confidence, correct]) => ({ confidence, correct }));

describe("computeCalibration — worked examples (hand-computed)", () => {
  /**
   * WORKED EXAMPLE 1 — perfect calibration at 70%.
   * 20 observations all claiming 70, exactly 14 correct (70%).
   * By hand: each correct contributes (0.7−1)² = 0.09, each wrong (0.7−0)²
   * = 0.49 → Brier = (14·0.09 + 6·0.49)/20 = (1.26 + 2.94)/20 = 0.21,
   * which equals the theoretical p(1−p) = 0.7·0.3 for a perfectly
   * calibrated claimer. gap = 70 − 70 = 0 → "calibrated". The 70 bin has
   * n=20, actual 70%, bin gap 0, not tooFewToSay.
   */
  it("perfectly calibrated at 70: Brier exactly 0.21, direction calibrated", () => {
    const r = computeCalibration(
      obs([
        ...Array.from({ length: 14 }, () => [70, true] as [70, true]),
        ...Array.from({ length: 6 }, () => [70, false] as [70, false]),
      ]),
    );
    expect(r.n).toBe(20);
    expect(r.brier).toBeCloseTo(0.21, 12);
    expect(r.meanConfidencePct).toBe(70);
    expect(r.accuracyPct).toBeCloseTo(70, 12);
    expect(r.gapPct).toBeCloseTo(0, 12);
    expect(r.direction).toBe("calibrated");
    const bin70 = r.bins.find((b) => b.confidencePct === 70)!;
    expect(bin70).toEqual({ confidencePct: 70, n: 20, correct: 14, actualPct: 70, gapPct: 0, tooFewToSay: false });
  });

  /**
   * WORKED EXAMPLE 2 — always 95, half right (the overconfident case).
   * 6 observations at 95, 3 correct.
   * By hand: correct → (0.95−1)² = 0.0025; wrong → (0.95−0)² = 0.9025.
   * Brier = (3·0.0025 + 3·0.9025)/6 = 2.715/6 = 0.4525 — nearly twice as
   * bad as coin-flip guessing. gap = 95 − 50 = +45 → "overconfident".
   * The 95 bin: n=6, actual 50%, bin gap −45, not tooFewToSay.
   */
  it("always-95-half-right: Brier exactly 0.4525, direction overconfident", () => {
    const r = computeCalibration(obs([[95, true], [95, true], [95, true], [95, false], [95, false], [95, false]]));
    expect(r.brier).toBeCloseTo(0.4525, 12);
    expect(r.gapPct).toBeCloseTo(45, 12);
    expect(r.direction).toBe("overconfident");
    const bin95 = r.bins.find((b) => b.confidencePct === 95)!;
    expect(bin95.actualPct).toBeCloseTo(50, 12);
    expect(bin95.gapPct).toBeCloseTo(-45, 12);
    expect(bin95.tooFewToSay).toBe(false);
  });

  /**
   * WORKED EXAMPLE 3 — the underconfident ace (Brier's honesty anchor).
   * 6 observations at 50, ALL correct.
   * By hand: each contributes (0.5−1)² = 0.25 → Brier = 0.25, numerically
   * IDENTICAL to coin-flip guessing (BRIER_COIN_FLIP) even though the user
   * aced every trial. gap = 50 − 100 = −50 → "underconfident". This pair of
   * facts is why copy must never quote Brier without the direction.
   */
  it("underconfident ace: Brier 0.25 (= coin-flip anchor), direction underconfident", () => {
    const r = computeCalibration(
      obs([[50, true], [50, true], [50, true], [50, true], [50, true], [50, true]]),
    );
    expect(r.brier).toBeCloseTo(BRIER_COIN_FLIP, 12);
    expect(r.accuracyPct).toBe(100);
    expect(r.gapPct).toBeCloseTo(-50, 12);
    expect(r.direction).toBe("underconfident");
  });

  /**
   * WORKED EXAMPLE 4 — the realistic 6-trial session (matches WE3 in
   * delicacy.test.ts shape): (95,T) (95,T) (70,T) (70,F) (50,T) (50,F).
   * By hand: 0.0025 + 0.0025 + 0.09 + 0.49 + 0.25 + 0.25 = 1.085 →
   * Brier = 1.085/6 = 0.18083̄. meanConfidence = 430/6 = 71.6̄, accuracy
   * = 4/6 = 66.6̄% → gap = +5 → within ±10 → "calibrated".
   * Every bin has n=2 < MIN_BIN_N → all tooFewToSay (the UI must not quote
   * "100%" for the 95 bin off two trials).
   */
  it("realistic session: Brier 1.085/6, calibrated, every 2-trial bin tooFewToSay", () => {
    const r = computeCalibration(
      obs([[95, true], [95, true], [70, true], [70, false], [50, true], [50, false]]),
    );
    expect(r.brier).toBeCloseTo(1.085 / 6, 12);
    expect(r.meanConfidencePct).toBeCloseTo(430 / 6, 12);
    expect(r.accuracyPct).toBeCloseTo(400 / 6, 12);
    expect(r.gapPct).toBeCloseTo(30 / 6, 12);
    expect(r.direction).toBe("calibrated");
    expect(r.bins.map((b) => b.tooFewToSay)).toEqual([true, true, true]);
    const bin95 = r.bins.find((b) => b.confidencePct === 95)!;
    expect(bin95.n).toBe(2);
    expect(bin95.actualPct).toBe(100); // present for charts — but flagged tooFewToSay
    expect(binDisplayPct(bin95)).toBeNull(); // …and the UI accessor refuses to quote it
    /**
     * gapSePct by hand: p̂ = 4/6 → √((2/3 · 1/3)/6)·100 = √(2/54)·100
     * = 19.245² — the +5 gap is well inside one SE, exactly why the copy
     * must soften the "calibrated" verdict at session n.
     */
    expect(r.gapSePct).toBeCloseTo(Math.sqrt(2 / 54) * 100, 12);
    expect(Math.abs(r.gapPct)).toBeLessThan(r.gapSePct);
  });
});

describe("computeCalibration — contract and N3 guards", () => {
  it("throws on empty input (no data is not a score)", () => {
    expect(() => computeCalibration([])).toThrow(/no observations/);
  });

  it("throws on an out-of-band confidence level", () => {
    expect(() => computeCalibration([{ confidence: 80 as never, correct: true }])).toThrow(/95\/70\/50.*80/);
  });

  it("bins are always all three levels in 95/70/50 order; empty bins carry nulls", () => {
    const r = computeCalibration(obs([[70, true], [70, false], [70, true]]));
    expect(r.bins.map((b) => b.confidencePct)).toEqual([95, 70, 50]);
    const bin95 = r.bins[0];
    expect(bin95).toEqual({ confidencePct: 95, n: 0, correct: 0, actualPct: null, gapPct: null, tooFewToSay: true });
  });

  it("tooFewToSay boundary sits exactly at MIN_BIN_N", () => {
    const atMin = computeCalibration(obs([[70, true], [70, false], [70, true]]));
    expect(atMin.bins.find((b) => b.confidencePct === 70)!.tooFewToSay).toBe(MIN_BIN_N > 3);
    const belowMin = computeCalibration(obs([[70, true], [70, false]]));
    expect(belowMin.bins.find((b) => b.confidencePct === 70)!.tooFewToSay).toBe(true);
  });

  it("binDisplayPct quotes a bin only when it stands on MIN_BIN_N observations", () => {
    const r = computeCalibration(obs([[70, true], [70, false], [70, true]]));
    expect(binDisplayPct(r.bins.find((b) => b.confidencePct === 70)!)).toBeCloseTo(200 / 3, 12);
    expect(binDisplayPct(r.bins.find((b) => b.confidencePct === 95)!)).toBeNull();
  });

  it("gapSePct is 0 at degenerate accuracy (all right / all wrong)", () => {
    expect(computeCalibration(obs([[50, true], [50, true]])).gapSePct).toBe(0);
    expect(computeCalibration(obs([[95, false], [95, false]])).gapSePct).toBe(0);
  });

  it("direction threshold is symmetric at ±CALIBRATION_GAP_AT (boundary inclusive)", () => {
    // 10 obs at 70, 6 correct → gap = 70 − 60 = +10 = the threshold exactly.
    const atPlus = computeCalibration(
      obs([...Array.from({ length: 6 }, () => [70, true] as [70, true]), ...Array.from({ length: 4 }, () => [70, false] as [70, false])]),
    );
    expect(atPlus.gapPct).toBeCloseTo(CALIBRATION_GAP_AT, 12);
    expect(atPlus.direction).toBe("overconfident");
    // 10 obs at 70, 8 correct → gap = 70 − 80 = −10 → underconfident.
    const atMinus = computeCalibration(
      obs([...Array.from({ length: 8 }, () => [70, true] as [70, true]), ...Array.from({ length: 2 }, () => [70, false] as [70, false])]),
    );
    expect(atMinus.gapPct).toBeCloseTo(-CALIBRATION_GAP_AT, 12);
    expect(atMinus.direction).toBe("underconfident");
  });
});
