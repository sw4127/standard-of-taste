/**
 * THE CREATOR TRANSLATION FOR THE DELICACY TRIALS (E8/S4, 2026-08-26).
 *
 * WHAT THE SCREEN ALREADY SAYS, so this does not say it again: the score
 * against chance, the detection band, the flaw line, and — in its own named
 * block, "DID YOU KNOW WHEN YOU KNEW?" — the whole calibration read with its
 * Brier score and per-confidence-level breakdown. That block already exists and
 * already has a heading; RT-D's premise that calibration is buried inside a
 * paragraph does not match the shipped page.
 *
 * SO THIS LAYER ADDS TWO THINGS THE SCREEN HAS NEVER SAID.
 *
 * 1. WHY NAMING MATTERS. The trials ask two questions — which clip is the
 *    original, and what is wrong with the other one — and the second is the one
 *    that transfers. Hearing that a render is wrong sends someone back to
 *    regenerate blind, which is the exact loop the blueprint says these people
 *    are stuck in. Knowing that it is PITCH sends them to a control.
 *
 * 2. WHY THERE IS NO PER-FLAW BREAKDOWN. `byFamily` has been computed since the
 *    instrument shipped and displayed nowhere, and the first draft of this
 *    module displayed it — three tallies in a column with a disclaimer beneath.
 *
 *    THE SLICE'S PRE-REGISTERED CONDITION KILLED THAT, and the condition was
 *    written before the code: the breakdown ships only if its error rate is
 *    defensible. MEASURED (delicacy.test.ts re-derives it): at five pairs a
 *    family, a listener whose true sensitivity is IDENTICAL across all three
 *    still shows unequal tallies 88.7-92.8% of the time. A disclaimer under
 *    three numbers does not fix that — the reader has already done the ranking
 *    the disclaimer declines to do. Nine times in ten they would be ranking
 *    noise.
 *
 *    So the screen says why it will not break the result down, which is the one
 *    honest thing available and is also the thing no competing quiz says.
 *    `familyTallies` stays exported for the expert view (RT-E a, Track C),
 *    where raw per-family counts are labelled as raw and the audience has asked
 *    for them.
 *
 * DETERMINISTIC TEMPLATES, no LLM (blueprint section 4). D1: nothing here is a
 * claim about the person. N3: no percentile, no cohort, no rate where the
 * denominator is five.
 */
import type { DelicacyResult, DegradationFamily } from "@/engine/delicacy";
import { DEGRADATION_FAMILIES } from "@/engine/delicacy";
import { FLAW_LABELS } from "@/content/delicacy/items";
import { delicacyClaim, delicacyFamilyClaim, familyContrastClaim } from "@/engine/evidence";

/**
 * WHAT EACH FLAW IS IN SOMEONE'S OWN RENDER.
 *
 * Deliberately NOT shared with the Threshold layer's `FLAW_IN_A_GENERATION`,
 * even though the families are the same three. The Threshold screen has one
 * family and can afford a long sentence about it; this screen has all three at
 * once and needs a clause each, or the block becomes a wall. Sharing one string
 * across both would have forced the wrong length on one of them.
 */
export const FLAW_IN_YOUR_WORK: Record<DegradationFamily, string> = {
  "pitch-drift": "leads and vocals going quietly sour",
  "timing-smear": "the groove never quite locking",
  "lossy-artifact": "the brittle, underwater sheen of a bad export",
};

/**
 * The naming sentence — the one skill in this instrument that transfers.
 *
 * `flawEligible` is the denominator and it can be zero, which is NOT "named the
 * flaw 0% of the time": a person who identified no originals was never asked
 * the naming question at all. No data is not a score of nothing (N3).
 */
export function namingLine(result: DelicacyResult): string | null {
  const claim = delicacyClaim(result);
  if (!claim.ok) return null;
  const { flawEligible, flawAccuracy, flawCorrect } = claim.value;

  if (flawEligible === 0 || flawAccuracy === null) {
    return (
      `You never got far enough into a pair to be asked what was wrong with it, so this session says ` +
      `nothing about whether you can name a flaw — only about whether you spotted one.`
    );
  }

  return (
    `Naming is the half that transfers. Hearing that a render is wrong sends you back to generate ` +
    `again and hope; knowing WHICH of the three it is sends you to a control. You named it ` +
    `${flawCorrect} of the ${flawEligible} times you were asked.`
  );
}

/**
 * THE REFUSAL. See the module header for the measurement that forced it.
 *
 * Phrased as a fact about the instrument, not as an apology. Five trials a
 * family is a real constraint of a short session, and naming it is the thing
 * that separates this from every quiz that hands out a strength.
 *
 * Returns null if a future, longer pool ever earns the comparison — the gate is
 * `familyContrastClaim`, not a hardcoded "never".
 */
export function perFamilyRefusal(result: DelicacyResult): string | null {
  const contrast = familyContrastClaim(result);
  if (contrast.ok) return null; // A future, longer pool could earn the comparison.

  const counts = DEGRADATION_FAMILIES.map((f) => result.byFamily[f]?.n ?? 0);
  const per = Math.min(...counts);
  if (per === 0) return null;

  return (
    `This session will not break your result down by flaw type, and the reason is arithmetic rather than ` +
    `modesty: at ${per} pairs of each, a listener equally good at all three comes out with uneven ` +
    `tallies about nine times in ten. Any split shown here would mostly be luck wearing a label.`
  );
}

export interface FamilyTally {
  family: DegradationFamily;
  label: string;
  inYourWork: string;
  correct: number;
  n: number;
}

/** The per-family counts. Counts, never rates — five is not a percentage (N3). */
export function familyTallies(result: DelicacyResult): FamilyTally[] {
  const out: FamilyTally[] = [];
  for (const family of DEGRADATION_FAMILIES) {
    const claim = delicacyFamilyClaim(result, family);
    if (!claim.ok) continue;
    out.push({
      family,
      label: FLAW_LABELS[family].label,
      inYourWork: FLAW_IN_YOUR_WORK[family],
      correct: claim.value.correct,
      n: claim.value.n,
    });
  }
  return out;
}

/**
 * Everything this layer contributes, in reading order.
 *
 * A SESSION THAT CAUGHT NOTHING GETS ONE SENTENCE, NOT TWO (E8/S5, found by
 * rendering the real page). When `flawEligible` is 0 the naming line is itself
 * a refusal — "this session says nothing about whether you can name a flaw" —
 * and following it with the per-flaw refusal says the same thing again in a
 * longer way, about a split the reader was never shown and could not have
 * constructed from three identical zeroes. Two refusals stacked at the bottom
 * of an already-empty result is boilerplate, and the screen above has said the
 * honest thing once already.
 */
export function creatorLines(result: DelicacyResult): string[] {
  const naming = namingLine(result);
  if (result.flawEligible === 0) return naming === null ? [] : [naming];
  return [naming, perFamilyRefusal(result)].filter((l): l is string => l !== null);
}
