/**
 * Delicacy Trials verdict copy — shared by the flow, the share page, and the
 * card so the voice can never drift between surfaces.
 *
 * PROVISIONAL VOICE (2026-07-19): drafted by engineering against
 * docs/voice-spec.md (the Examiner — tease the judgment, never the person;
 * every barb datum-anchored). NOT yet voice-locked: PM pass pending, same
 * process as the bias copy (which is locked). Thresholds are judgment, not
 * data (N3) — tiers are keyed on raw correct counts out of six, chance = 3.
 */
import type { DelicacyResult } from "@/engine/delicacy";
import type { CalibrationResult } from "@/engine/calibration";

export interface DelicacyVerdictCopy {
  title: string;
  sub: string;
}

/** Tiered on nCorrect out of 6 (2AFC chance calls 3). PROVISIONAL. */
export function delicacyVerdict(nCorrect: number): DelicacyVerdictCopy {
  if (nCorrect >= 6)
    return { title: "The key in the wine.", sub: "Every flaw found. Sancho's kinsmen would pour you a glass." };
  if (nCorrect === 5) return { title: "Sharp ears.", sub: "One got past you. Only one." };
  if (nCorrect === 4)
    return { title: "Better than the coin.", sub: "You hear something real. It comes and goes." };
  if (nCorrect === 3)
    return { title: "The coin ties you.", sub: "A flipped coin calls three of six. So did you." };
  return { title: "The village.", sub: "You laughed at the tasters. The key was at the bottom of the barrel." };
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
    return `Claimed ${Math.round(cal.meanConfidencePct)}% sure on average, delivered ${Math.round(cal.accuracyPct)}% — a gap of ${gap > 0 ? "+" : ""}${gap} points, inside the ±${se} noise of six trials. Too close to call.`;
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
  return `I called ${nCorrect} of ${nTrials} originals in the Delicacy Trials — a coin flip calls 3. Think your ears are better?`;
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
