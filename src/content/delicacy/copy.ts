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
import { detectionBand, type DelicacyResult, type DetectionBand } from "@/engine/delicacy";
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
  // "calls 7.5" again — the third surface carrying it. A coin averages a
  // fraction; it cannot call one. Same number, same fix as the summary line.
  return `I called ${nCorrect} of ${nTrials} originals in the Delicacy Trials — a coin flip averages ${chanceCall(nTrials)}. Think your ears are better?`;
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
  // "calls 7.5" was live here. An odd trial count makes chanceCall fractional,
  // and a coin cannot CALL a fraction — it can average one. Same number, and it
  // stops reading as a broken sentence. See the note on `detectionBody`.
  return `${r.nCorrect} of ${r.nTrials} originals — a coin flip averages ${chanceCall(r.nTrials)}`;
}

/**
 * THE DETECTION READOUT — what replaced the six ranked tiers (PM ruling
 * RT-105a b, on E6/S8's measurement).
 *
 * THE RULE THIS FOLLOWS. E6/S8 measured the six shipped tiers placing people
 * correctly 30.5% of the time at fifteen trials, and found no granularity that
 * rescues it — two bands reach 70.2% against the 89.3% the Prestige verdict
 * manages. RT-90a had already ruled the general case for the staircase: report
 * the band, never the point. A tier name is a point estimate wearing an
 * adjective, so the same ruling lands here.
 *
 * WHAT SURVIVES, AND WHAT DOES NOT. The ranked adjective goes. The numbers and
 * the prose around them stay and get MORE room, because the interesting thing
 * was never the rank — it was that a two-way choice hands out half the score
 * for free and almost nobody knows it. The one categorical line left is whether
 * the whole interval clears chance, which is a claim about this session rather
 * than a rank against other people.
 *
 * IT MUST NOT BE A HOAX AND IT MUST NOT CONFUSE (PM, 2026-08-21). So: no
 * percentage is printed without saying which percentage it is, the guessing
 * correction is explained in the sentence that uses it rather than in a
 * footnote, and the width of the band is named as a property of a short session
 * instead of being hidden behind a confident midpoint.
 */

/**
 * The smallest score that clears chance outright at this length — COMPUTED from
 * the same function the readout uses, never typed in. At fifteen trials it is
 * 12, and if the session length ever changes this sentence changes with it
 * instead of quietly becoming false.
 */
export function minToClearChance(nTrials: number): number | null {
  for (let k = Math.ceil(nTrials / 2); k <= nTrials; k++) {
    if (detectionBand(k, nTrials).excludesChance) return k;
  }
  return null;
}

/** One named line. It describes the measurement; it does not rank the person. */
export function detectionTitle(band: DetectionBand): string {
  return `${band.nCorrect} of ${band.nTrials}. Now subtract the guessing.`;
}

const pct = (x: number) => `${Math.round(x * 100)}%`;

/**
 * "A COIN FLIP CALLS 7.5" IS WHAT THE FIRST DRAFT SAID, and a coin cannot call
 * 7.5 of anything. `chanceCall` returns nTrials/2 exactly, which is the right
 * NUMBER — the expected score really is 7.5 on fifteen two-way choices — paired
 * with a verb that makes it read like a nonsense prediction rather than a mean.
 * "Averages" carries the same number and is true of a fraction.
 *
 * Found by reading the rendered output rather than the source, and the same
 * defect is live in `delicacyResultSummary` above, where it has been shipping.
 */
export function detectionBody(band: DetectionBand): string {
  const chance = chanceCall(band.nTrials);
  const margin = band.nCorrect - band.nTrials / 2;
  const need = minToClearChance(band.nTrials);
  const n = band.nTrials;

  // The opening move is shared by all three branches ON PURPOSE: the one thing
  // a reader must leave understanding is that a two-way choice pays out half
  // the paper before they hear anything, and that has to be said whether they
  // beat the coin or not.
  const generosity =
    `A two-way choice is generous: guess every pair blind and the long-run average is ` +
    `${chance} of ${n}, half the paper handed over before you hear anything.`;

  if (band.excludesChance) {
    // THE ONE DEVIATION FROM THE COPY AS DELIVERED, and it is a factual one.
    // The line read "past the {need} it takes", which is true at 13, 14 and 15
    // and false at exactly 12 — you MET the threshold, you did not pass it. On a
    // screen whose entire purpose is not claiming more than the number supports,
    // an off-by-one at the boundary is the last place to let it go. Landing
    // exactly on the bar is also the more interesting sentence.
    const clearance = band.nCorrect > (need ?? 0) ? `past the ${need}` : `exactly the ${need}`;
    return (
      `${generosity} You returned ${band.nCorrect} — ${margin} beyond what that generosity ` +
      `covers, and ${clearance} it takes to clear the coin at 95% confidence. Subtract the ` +
      `pairs luck would have handed you anyway and what remains, flaws actually detected rather ` +
      `than merely called, lands somewhere between ${pct(band.lo)} and ${pct(band.hi)}. That ` +
      `window is embarrassingly wide, and wide for an honest reason: ${n} pairs is ${n} pairs. ` +
      `But every value inside it sits above zero, and staying above zero is the one thing a coin ` +
      `cannot arrange.`
    );
  }

  if (margin > 0) {
    return (
      `${generosity} You returned ${band.nCorrect} — ${margin} beyond what that generosity ` +
      `covers, and ${margin} is not a margin anyone can defend. Subtract the pairs luck would ` +
      `have handed you anyway and the range that still fits your session runs from ` +
      `${pct(band.lo)} to ${pct(band.hi)} detected, touching zero at the bottom. On ${n} pairs ` +
      `it takes ${need} to pull clear of the coin at 95% confidence. So the honest reading is ` +
      `not that you heard nothing — it is that a session this short cannot tell you apart from ` +
      `a lucky afternoon. A longer one can.`
    );
  }

  // `margin` IS DELIBERATELY ABSENT BELOW (Cowork, RT-107a). At or under chance
  // it is zero or negative, and "sits -0.5 beyond" is the same class of nonsense
  // as a coin calling 7.5. "At or beneath what that generosity alone returns"
  // carries the same fact without printing a negative as if it were a margin.
  const collapsed = band.lo === band.hi;
  const rangeClause = collapsed
    ? `there is no range left to draw, it sits flat at ${pct(band.hi)} detected`
    : `the range that fits runs from ${pct(band.lo)} to ${pct(band.hi)} detected`;

  return (
    `${generosity} You returned ${band.nCorrect}, at or beneath what that generosity alone ` +
    `returns, so once the lucky guesses come out there is nothing left to credit: ${rangeClause}. ` +
    `Clearing the coin at 95% confidence would have taken ${need} of ${n}. What these ${n} pairs ` +
    `found is nothing that separates your ear from chance — which is a sentence about ${n} pairs, ` +
    `and not yet a sentence about your ear.`
  );
}
