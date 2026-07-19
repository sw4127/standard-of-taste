/**
 * Calibration math (memo §3: confidence-vs-accuracy → the calibration curve;
 * memo D6: Brier/calibration analysis is a named pillar of the psychometrics
 * pipeline). This is what operationalizes Hume's "good sense" as a computed
 * number: not whether you were right, but whether you KNEW how right you
 * were. Content-free like the rest of src/engine — input is (claimed
 * confidence, was-correct) observations; delicacy receipts map onto it
 * directly (receipt.confidence, receipt.correct).
 *
 * Honesty notes (memo N3), load-bearing for the copy that surfaces these:
 * - A session is n≈6 observations. Per-bin accuracy over 2 trials is noise;
 *   bins under MIN_BIN_N must render as "too few to say", never as a
 *   percentage with a straight face.
 * - The over/underconfident direction uses a PROVISIONAL ±CALIBRATION_GAP_AT
 *   threshold chosen by judgment, not data — at n=6 the accuracy granularity
 *   alone is ~17 points. Copy labels the verdict provisional and shows the
 *   raw numbers next to it. Revisit with cohort data (memo §7).
 * - Brier alone misleads at the anchors: always-guessing at 50% scores 0.25,
 *   and a perfect-accuracy user claiming 50% ALSO scores 0.25 (underconfident
 *   ace). Copy must anchor Brier against BRIER_COIN_FLIP and pair it with the
 *   direction, never present it as a lone quality score.
 * - No percentiles, no norms — session-local numbers only until a cohort
 *   exists.
 */

import { DELICACY_CONFIDENCE_LEVELS, type DelicacyConfidence } from "./delicacy";

/** One scored performance item: what was claimed, and what happened. */
export interface CalibrationObservation {
  confidence: DelicacyConfidence;
  correct: boolean;
}

/** Bins below this n are flagged tooFewToSay (N3). */
export const MIN_BIN_N = 3;

/**
 * PROVISIONAL (N3): |mean confidence − accuracy| in points beyond which the
 * direction verdict leaves "calibrated". Judgment, not data — see header.
 */
export const CALIBRATION_GAP_AT = 10;

/** Brier of always guessing 50% on a 2AFC — the copy's honesty anchor. */
export const BRIER_COIN_FLIP = 0.25;

export type CalibrationDirection = "overconfident" | "underconfident" | "calibrated";

/** One row of the claimed-vs-actual table, in DELICACY_CONFIDENCE_LEVELS order. */
export interface CalibrationBin {
  confidencePct: DelicacyConfidence;
  n: number;
  correct: number;
  /** Actual accuracy in this bin as a %, null when the bin is empty. */
  actualPct: number | null;
  /** actualPct − confidencePct (negative = did worse than claimed), null when empty. */
  gapPct: number | null;
  /** n < MIN_BIN_N — the UI must say so instead of quoting actualPct (N3). */
  tooFewToSay: boolean;
}

/** The fully computed, deterministic result. Values unrounded; copy rounds. */
export interface CalibrationResult {
  n: number;
  /** Mean squared error of claimed probability vs outcome, in [0,1]; lower is better. */
  brier: number;
  meanConfidencePct: number;
  accuracyPct: number;
  /** meanConfidencePct − accuracyPct: positive = claiming more than delivered. */
  gapPct: number;
  /**
   * Binomial standard error of the accuracy term, in points:
   * √(p̂(1−p̂)/n)·100. Claims carry no sampling error, so this is the SE of
   * the gap too. Copy MUST pair the verdict with it (gap ± SE) and soften
   * the verdict whenever |gapPct| < gapSePct — at session n the threshold
   * sits inside one SE, and pretending otherwise is exactly the fabricated
   * precision N3 bans. Degenerate at p̂∈{0,1} (SE 0); the copy shows the raw
   * counts alongside either way.
   */
  gapSePct: number;
  /** Sign of gapPct beyond ±CALIBRATION_GAP_AT — PROVISIONAL, see header. */
  direction: CalibrationDirection;
  bins: CalibrationBin[];
}

/**
 * Pit-of-success accessor for UI: the bin's accuracy % ONLY when it stands on
 * enough data, else null. Charts/pipeline aggregates may read bin.actualPct
 * directly; user-facing copy goes through this.
 */
export function binDisplayPct(bin: CalibrationBin): number | null {
  return bin.tooFewToSay ? null : bin.actualPct;
}

/**
 * The computation. Throws on empty input or an out-of-band confidence level —
 * the UI/engine upstream must never let those reach here.
 */
export function computeCalibration(observations: CalibrationObservation[]): CalibrationResult {
  if (observations.length === 0) throw new Error("calibration: no observations");
  for (const o of observations) {
    if (!(DELICACY_CONFIDENCE_LEVELS as readonly number[]).includes(o.confidence)) {
      throw new Error(
        `calibration: confidence must be one of ${DELICACY_CONFIDENCE_LEVELS.join("/")}, got ${JSON.stringify(o.confidence)}`,
      );
    }
  }

  const n = observations.length;
  const nCorrect = observations.filter((o) => o.correct).length;
  const brier =
    observations.reduce((sum, o) => {
      const p = o.confidence / 100;
      const outcome = o.correct ? 1 : 0;
      return sum + (p - outcome) ** 2;
    }, 0) / n;
  const meanConfidencePct = observations.reduce((sum, o) => sum + o.confidence, 0) / n;
  const accuracyPct = (nCorrect / n) * 100;
  const gapPct = meanConfidencePct - accuracyPct;

  const bins: CalibrationBin[] = DELICACY_CONFIDENCE_LEVELS.map((level) => {
    const inBin = observations.filter((o) => o.confidence === level);
    const correct = inBin.filter((o) => o.correct).length;
    return {
      confidencePct: level,
      n: inBin.length,
      correct,
      actualPct: inBin.length > 0 ? (correct / inBin.length) * 100 : null,
      gapPct: inBin.length > 0 ? (correct / inBin.length) * 100 - level : null,
      tooFewToSay: inBin.length < MIN_BIN_N,
    };
  });

  const pHat = nCorrect / n;
  return {
    n,
    brier,
    meanConfidencePct,
    accuracyPct,
    gapPct,
    gapSePct: Math.sqrt((pHat * (1 - pHat)) / n) * 100,
    direction: gapPct >= CALIBRATION_GAP_AT ? "overconfident" : gapPct <= -CALIBRATION_GAP_AT ? "underconfident" : "calibrated",
    bins,
  };
}
