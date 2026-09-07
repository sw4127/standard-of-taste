/**
 * THE CREATOR TRANSLATION — what a measured threshold means to someone making
 * music with AI tools (E8/S2, 2026-08-26).
 *
 * WHAT THIS LAYER IS FOR, and what it deliberately is not. The Gym's result
 * screen already reports the measurement thoroughly: `resultLines` in
 * `src/content/staircase/copy.ts` gives the band, the fitted point where the
 * ladder earned one, the per-rung evidence, the material, the retest, and the
 * no-cohort footnote. None of that is missing, and restating it here in warmer
 * words would be the redundancy the PM specifically refused.
 *
 * So this module answers the ONE question those lines do not: what is this
 * flaw in the work you are actually making, and what does your measured band
 * imply about the damage that goes past you? Two sentences. Nothing else.
 *
 * DETERMINISTIC TEMPLATES, NOT GENERATED PROSE (blueprint section 4). Identical
 * results must produce identical sentences, or a share link stops recomputing
 * to the same page. There is no LLM anywhere in this file and there must not
 * be one.
 *
 * DIRECTION-FREE BY CONSTRUCTION. Two of the three ladders run "up" (more cents,
 * more milliseconds = worse) and lossy runs "down" (fewer kbps = worse), so
 * "below 25 cents" and "below 96 kbps" mean opposite things. Every comparative
 * here is written as GENTLER or HARSHER, which is true on both axes and needs
 * no direction flag to get right. `bandLine` learned this the hard way when
 * ordering by difficulty rendered "between 160 kbps and 64 kbps".
 *
 * D1 / N3. Every sentence is about what this session measured, not about the
 * person and not about anyone else. There is no percentile, no cohort, and no
 * promise that practice will improve anybody's output.
 */
import type { ThresholdSay } from "@/engine/evidence";
import { quantity } from "@/content/staircase/copy";
import { emit, type EmissionSpec } from "./emission";

/**
 * WHERE THE FLAW LIVES IN GENERATED AUDIO.
 *
 * Distinct from `FAMILY_BLURB`, which describes the MANIPULATION we applied
 * ("the whole track sliding slowly out of tune across twenty seconds"). These
 * describe the SYMPTOM in someone's own render, which is the thing a person
 * recognises before they have a word for it — the blueprint's stated problem:
 * a generation sounds cheap or wrong and they cannot name why.
 */
export const FLAW_IN_A_GENERATION: Record<string, string> = {
  "pitch-drift":
    "In a render this is the lead that turns faintly sour over a long note — a vocal, a bowed " +
    "string, a synth lead — where the slide is slow enough to read as a bad performance rather " +
    "than bad audio.",
  "timing-smear":
    "In a render this is the rubbery, unanchored feel — everything agreeing on the tempo but not " +
    "quite on where the beat sits, so the groove never locks.",
  "lossy-artifact":
    "In a render this is the underwater, brittle quality — cymbals turning to gauze, reverb tails " +
    "breaking into grit, the whole thing sounding like a worse copy of itself.",
};

export function flawInAGeneration(family: string): string {
  return FLAW_IN_A_GENERATION[family] ?? "";
}

/**
 * WHAT THE MEASURED BAND IMPLIES ABOUT THE DAMAGE THAT GETS PAST YOU.
 *
 * Three shapes, because the band can be open at either end and the honest
 * sentence differs each time. The one-sided cases are NOT failures to be
 * apologised for — they are real statements about where the instrument stopped
 * being able to follow, and the copy says so plainly.
 *
 * The sentence names a range rather than predicting behaviour. "This is the
 * range a generation can drift inside without you flagging it" is a statement
 * about what was measured, mapped onto the reader's own work; "you will miss
 * it next time" would be a claim about a person and a future, which is exactly
 * what D1 forbids.
 */
export function whatGetsPast(say: ThresholdSay): string {
  const { heardAt, missedAt, unit } = say;

  if (heardAt !== null && missedAt !== null) {
    /**
     * A WIDE BAND MUST NOT BE SPOKEN AS A FINDING (E8/S2, found in the deck).
     *
     * `bandLine` already learned this one rung over. The first draft here
     * rendered "Damage gentler than 100 cents slipped past you on these clips"
     * for a session that had bracketed seven rungs of eleven — a near-vacuous
     * measurement stated with the confidence of a precise one, and worse,
     * 100 cents is a whole semitone, so the sentence reads as an alarming claim
     * built on almost nothing. `wide` comes from `isWideBand`, the one rule both
     * copy layers ask.
     */
    /*
     * THE WIDE BRANCH IS GONE, AND IT WAS DEAD (E18/S18, PM ruling RT-S2 a).
     *
     * It returned a sentence for a wide band, and a docblock justified keeping
     * it: "the combined view shows these sentences with no bandLine beside
     * them, so the refusal has to be spoken rather than assumed." That caller
     * does not exist. `creatorLines` is the only one, and it drops the
     * consequence sentence entirely when the band is wide -- so the branch was
     * unreachable, and the comment explaining why it was kept described a
     * relationship that had gone.
     *
     * Found by a census of templates no fixture renders (E18/S17), which listed
     * it as possibly dead rather than deleting it on a guess. Checked, then
     * removed.
     *
     * IT RETURNS EMPTY RATHER THAN FALLING THROUGH, and that is the whole care
     * in this change. Deleting the branch outright would have let a wide band
     * reach the two-sided sentence below -- "Damage gentler than 100 cents
     * slipped past you" on a session that bracketed seven rungs of eleven,
     * which is the exact false confidence the branch existed to prevent.
     * Silence is what `creatorLines` already does with a wide band, and an
     * empty string is filtered there, so this states the invariant instead of
     * relying on every future caller knowing it.
     */
    if (say.wide) return "";
    return (
      `Damage gentler than ${quantity(heardAt, unit)} slipped past you on these clips. ` +
      `That is the margin a render can wander inside while still sounding clean to you.`
    );
  }

  if (heardAt !== null) {
    /**
     * ONE-SIDED, HEARD — and the flattering reading of this state is WRONG.
     *
     * Found by reading the rendered deck (E8/S2). The first draft said "nothing
     * this session played was gentle enough to fool you", which describes only
     * ONE of the two situations that produce `missedAt === null`. A rung is
     * named only when it falls entirely outside the posterior interval, so the
     * low edge goes unnamed either because the listener really is that sharp OR
     * because the interval is simply too wide to exclude anything. Two sessions
     * on the same ladder rendered the identical sentence at heardAt = 160 kbps
     * (sharp, near the gentle end) and at heardAt = 64 kbps (mid-ladder, where
     * four gentler rungs were never resolved at all) — and for the second the
     * sentence was plainly false.
     *
     * So it now says what is true of both: one edge was pinned, the other was
     * not, and the width of the gap is not something this session established.
     */
    return (
      `This session pinned ${quantity(heardAt, unit)} as damage you catch, but never found the level ` +
      `where you stop catching it — so what gets past you is gentler than that, by some amount these ` +
      `clips never established.`
    );
  }

  // missedAt !== null: the claim floor in evidence.ts guarantees one of the two.
  return (
    `This session never found a level of damage you catch reliably, so it cannot say what would slip ` +
    `past you — only that ${quantity(missedAt!, unit)} already did.`
  );
}

/**
 * The sentences for a RESULT SCREEN, in reading order.
 *
 * ON A WIDE BAND THIS DROPS THE CONSEQUENCE, and that is a decision about the
 * screen rather than about the sentence. Read in place (E8/S3), a wide session
 * refused three times in a row: the figure renders "no reading", `bandLine`
 * says "that is a wide answer, covering most of the range this ladder can ask
 * about", and then this layer said it a third time. The refusal is already
 * made, twice, by the layer whose job it is. What this layer still has to give
 * is the vocabulary — what the flaw IS in the reader's own work — which is
 * exactly what they came for and is true regardless of how the band came out.
 *
 * `whatGetsPast` HAD a wide branch on the same reasoning -- that the combined
 * view shows these sentences with no `bandLine` beside them. It was removed in
 * E18/S18: this function is the only caller, it drops the sentence on a wide
 * band, and so the branch could not be reached from anywhere.
 */
export const THRESHOLD_EMISSION: EmissionSpec<ThresholdSay> = {
  fn: "creatorLines",
  in: "threshold.ts",
  parts: [
    {
      id: "symptom",
      says: "what this flaw sounds like in a track the reader made",
      always: true,
      produce: (say) => [flawInAGeneration(say.family)].filter((line) => line !== ""),
    },
    {
      id: "consequence",
      says: "what their measured band implies gets past them",
      always: false,
      when: "only on a band narrow enough to name a limit",
      produce: (say) => (say.wide ? [] : [whatGetsPast(say)].filter((line) => line !== "")),
    },
  ],
};

export function creatorLines(say: ThresholdSay): string[] {
  return emit(THRESHOLD_EMISSION, say);
}
