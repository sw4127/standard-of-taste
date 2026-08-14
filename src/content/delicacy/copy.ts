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
/**
 * The chance expectation, as text. ONE definition, because the scored set went
 * odd (15 trials) and the surfaces disagreed in the browser: the result heading
 * rounded to "8" while the verdict beneath it said "7.5" — same quantity, two
 * numbers, one screen. Rounding is also the dishonest choice: the expected
 * score of a coin over 15 trials IS 7.5, and an instrument that rounds its own
 * null hypothesis has no business reporting anyone else's precision (N3).
 */
export function chanceCall(nTrials: number): string {
  return String(nTrials / 2);
}

export function delicacyVerdict(nCorrect: number, nTrials: number): DelicacyVerdictCopy {
  const chance = chanceCall(nTrials);
  const headroom = nTrials / 2;
  const above = (nCorrect - nTrials / 2) / headroom; // 1 = perfect, 0 = chance, <0 = worse

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
  return `I called ${nCorrect} of ${nTrials} originals in the Delicacy Trials — a coin flip calls ${chanceCall(nTrials)}. Think your ears are better?`;
}

/**
 * Result-page strapline (RT-44a, 2026-08-14). REPLACES a line that told users
 * "the trials join the paid training arc once norms exist" — false since the
 * no-payment ruling (CLAUDE.md, "D4 amendment"), and user-visible, which makes
 * it an N3 violation rather than a stale comment.
 *
 * Two things it must not do. It must not imply the Gym EXISTS — it does not
 * yet, so the arc is future tense. And it must not present the 7-day cooldown
 * as a withholding tactic; the cooldown is a validity gate, and saying why
 * costs one clause and is the D5 move (depth unlocked, never buried).
 *
 * Rendered mid-paragraph on the result screen, between "Provisional read —
 * you're early." and "Difficulty labels are authored, not yet norm-calibrated."
 */
export const CALIBRATION_PHASE_LINE =
  "Nothing here costs money, and no paid tier is coming. The training arc will gate on a seven-day gap between retests, because a retake the same day measures your memory, not your ears.";

/**
 * THE WHOLE FOOTNOTE, assembled here rather than in JSX (RT-44a, 2026-08-14).
 *
 * WHY THIS MOVED. `CALIBRATION_PHASE_LINE` was voice-checked; the two literals
 * sitting either side of it in DelicacyFlow.tsx were not, because they lived in
 * JSX and the gate only ever sees the copy deck. So a third of the paragraph a
 * user actually reads was outside the gate that exists to check what users read.
 *
 * That is the same failure mode as the "a coin flip calls 8" / "the coin calls
 * 7.5" contradiction: each fragment was individually fine, and the defect only
 * existed in the ASSEMBLY. A gate that can only see fragments cannot see it.
 * Assembling here makes the paragraph one string, so voice.ts reads exactly what
 * the screen shows.
 */
export const PROVISIONAL_FOOTNOTE = [
  "Provisional read — you're early.",
  CALIBRATION_PHASE_LINE,
  "Difficulty labels are authored, not yet norm-calibrated.",
].join(" ");

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
  return `${r.nCorrect} of ${r.nTrials} originals — a coin flip calls ${chanceCall(r.nTrials)}`;
}
