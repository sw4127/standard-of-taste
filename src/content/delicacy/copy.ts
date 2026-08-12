/**
 * Delicacy Trials verdict copy — shared by the flow, the share page, and the
 * card so the voice can never drift between surfaces.
 *
 * VOICE-CHECKED AUTOMATICALLY (2026-08-08): every string here is run through
 * src/content/voice.ts, which implements docs/voice-spec.md's litmus tests and
 * banned-moves list. That check REPLACES the PM voice pass, for the same reason
 * Layer A replaced the PM ear pass — a gate only one person can discharge, and
 * cannot reliably perform, is debt rather than quality control.
 *
 * TIERS ARE POOL-SIZE-RELATIVE, and must stay that way. They were once keyed on
 * raw counts out of six; the pool expanded to eighteen and the thresholds did
 * not move, so a score of 6/18 — comfortably BELOW the chance line of 9 — still
 * returned the top verdict. Everything below is computed from nTrials and the
 * 2AFC chance rate instead. Enforced by voice.test.ts.
 *
 * Thresholds are judgment, not data (N3).
 */
import type { DelicacyResult } from "@/engine/delicacy";
import type { CalibrationResult } from "@/engine/calibration";

export interface DelicacyVerdictCopy {
  title: string;
  sub: string;
}

/**
 * Tiered on how far above CHANCE the score sits, as a share of the headroom
 * available. A 2AFC task floors at half the trials, so raw counts mean nothing
 * without the pool size: 6 correct is a triumph out of 6 and a failure out of 18.
 */
export function delicacyVerdict(nCorrect: number, nTrials: number): DelicacyVerdictCopy {
  const chance = nTrials / 2;
  const headroom = nTrials - chance;
  const above = (nCorrect - chance) / headroom; // 1 = perfect, 0 = chance, <0 = worse

  if (nCorrect === nTrials)
    return { title: "The key in the wine.", sub: `All ${nTrials} flaws found. Sancho's kinsmen would pour you a glass.` };
  if (above >= 0.75)
    return { title: "Sharp ears.", sub: `${nCorrect} of ${nTrials}, against a coin flip's ${chance}. Very little got past you.` };
  if (above >= 0.4)
    return { title: "Better than the coin.", sub: `${nCorrect} of ${nTrials} — the coin calls ${chance}. You hear something real.` };
  if (above > 0)
    return { title: "A hair above chance.", sub: `${nCorrect} of ${nTrials}, and the coin calls ${chance}. Not nothing — barely.` };
  if (above === 0)
    return { title: "The coin ties you.", sub: `A flipped coin calls ${chance} of ${nTrials}. So did you.` };
  return { title: "The village.", sub: `${nCorrect} of ${nTrials}, under the coin's ${chance}. You laughed at the tasters. The key was at the bottom of the barrel.` };
}

/**
 * The calibration sentence — the S4 header contract enforced in words:
 * verdict SOFTENED when the gap sits inside one standard error, Brier never
 * quoted without its anchor.
 */
export function calibrationLine(cal: CalibrationResult): string {
  const gap = Math.round(cal.gapPct);
  const se = Math.round(cal.gapSePct);
  if (Math.abs(cal.gapPct) < cal.gapSePct) {
    return `Claimed ${Math.round(cal.meanConfidencePct)}% sure on average, delivered ${Math.round(cal.accuracyPct)}% — a gap of ${gap > 0 ? "+" : ""}${gap} points, inside the ±${se} noise of ${cal.n} trials. Too close to call.`;
  }
  const label =
    cal.direction === "overconfident"
      ? "You claim more than your ears deliver."
      : cal.direction === "underconfident"
        ? "Your ears deliver more than you claim."
        : "Claim and delivery line up.";
  return `Claimed ${Math.round(cal.meanConfidencePct)}% sure on average, delivered ${Math.round(cal.accuracyPct)}%. ${label}`;
}

/** The one-line share text next to the permalink. */
export function shareText(nCorrect: number, nTrials: number): string {
  return `I called ${nCorrect} of ${nTrials} originals in the Delicacy Trials — a coin flip calls ${nTrials / 2}. Think your ears are better?`;
}

/** Card + result-page strapline for the free calibration phase (D4 ruling 1a). */
export const CALIBRATION_PHASE_LINE =
  "Free while the gym calibrates — the trials join the paid training arc once norms exist.";

/** One-word magnitude descriptors for the receipts (authored intensity, N3: not IRT difficulty). */
/**
 * Ladder-rung words. Four rungs since the S6 strength ladder + pool expansion
 * (2026-08-07): rung 1 is the gentlest step, added below the three that were
 * shipping. These describe the MANIPULATION's measured strength, never its
 * difficulty — how often people actually miss a rung is a Layer B question.
 */
export const MAGNITUDE_WORDS: Record<1 | 2 | 3 | 4, string> = {
  1: "faintest",
  2: "subtle",
  3: "moderate",
  4: "blatant",
};

export function delicacyResultSummary(r: DelicacyResult): string {
  return `${r.nCorrect} of ${r.nTrials} originals — a coin flip calls ${Math.round(r.nTrials / 2)}`;
}
