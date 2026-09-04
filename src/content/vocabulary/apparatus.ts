/**
 * THE BORROWED APPARATUS, IN SENTENCES (E16b/P2, Track P).
 *
 * Deterministic templates over the cited registry. No LLM, no cohort, no
 * percentile, and — the rule this whole track turns on — **nothing about how
 * well anybody scores.** An entry may describe the measuring apparatus; a
 * figure about human performance printed beside a reader's result would be a
 * norm wearing a citation (N3).
 *
 * WHY THIS IS WORTH SAYING AT ALL. Every psychometric number this product
 * publishes is simulated and its cohort is zero, so it cannot argue from data
 * about people. The argument it CAN make is that its rulers were not invented
 * here, and that where it departs from the published ones it says so. That
 * argument is available at n = 0, and it is the only kind that is.
 *
 * THE DEPARTURES ARE NOT AN APPENDIX. A registry of borrowed credibility with
 * no departures stated is a claim of compliance nobody audited, so where an
 * entry has one it is rendered in the same breath as the borrowing rather than
 * in a footnote under it.
 *
 * NO FIGURE HERE IS TYPED. The two counts in the convergence sentence come from
 * the modules that own them — the critic registry and the rating scale the
 * engine validates against — and MUSHRA's scale arrives as the PHRASE its own
 * recommendation uses, because that scale is continuous and writing a count for
 * it would convert a line into boxes. That is the same false precision this
 * product is arguing about, committed in the sentence making the argument.
 */

import { BORROWED_STANDARDS, externalStandards, inRepoStandards } from "@/content/apparatus/standards";
import { CRITIC_SCALES, OUR_SCALE } from "@/content/comparison/scales";
import { numberWord, numberWordLeading } from "./numbers";

/** One paragraph per standard: what it is, what we do with it, where we differ. */
export function apparatusLines(): string[] {
  return BORROWED_STANDARDS.map((s) => {
    const departure = s.departure ? ` ${s.departure}` : "";
    return `${s.name} — ${s.what} ${s.howWeUseIt}${departure}`;
  });
}

/**
 * WHICH OF THESE CITATIONS A MACHINE CAN CHECK, AND WHICH IT CANNOT.
 *
 * The distinction is the honest part of the registry and it would be invisible
 * without a sentence. Both counts are computed, so the sentence cannot go stale
 * as entries are added on either side.
 */
export function citationStrengthLine(): string {
  const inRepo = numberWordLeading(inRepoStandards().length);
  const external = numberWord(externalStandards().length);
  return (
    `${inRepo} of these are decisions living in this repository, so a test opens the file that ` +
    `implements them and fails the build if the passage has moved. The other ${external} rests on a ` +
    `document no test can open, and carries the date a person opened it instead. Those are not the ` +
    `same strength of claim, and this page will not pretend otherwise.`
  );
}

/**
 * THE SENTENCE THIS TRACK EXISTS FOR.
 *
 * A professional audio standard and a professional music critic, working in
 * disciplines that have nothing to do with each other, both reached for about a
 * hundred degrees.
 *
 * TWO CLAIMS WERE CUT FROM THIS SENTENCE AFTER READING IT RENDERED, and both
 * were mine. It said the two were "a century apart", which is simply false —
 * MUSHRA and Pitchfork are contemporaries. And it said both spend most of their
 * time in a narrow band near the top of their scales, which is measured for
 * Pitchfork and entirely unsourced for MUSHRA. A decorative flourish that
 * asserts a fact is still an assertion (N3), and neither was caught by any
 * guard here: one carried no figure at all, and the other read as apparatus. This product offers eleven and asks only how many of them
 * you used — which is Track I's argument arriving from somewhere else entirely.
 *
 * Returns null rather than inventing a sentence if either source stops
 * declaring its scale: a convergence with one term missing is not a
 * convergence.
 */
export function degreesConvergenceLine(): string | null {
  const mushra = BORROWED_STANDARDS.find((s) => s.scaleLabel);
  const pitchfork = CRITIC_SCALES.find((s) => s.degreesAllowed !== null);
  if (!mushra?.scaleLabel || !pitchfork?.degreesAllowed) return null;
  return (
    `${mushra.name} puts a sample anywhere on ${mushra.scaleLabel}. ${pitchfork.critic} offers ` +
    `${pitchfork.degreesAllowed} places to put a record. Two very different attempts at the same ` +
    `problem, both landing near a hundred degrees. This one offers ` +
    `${numberWord(OUR_SCALE.degreesAllowed)}, and asks only how many of them you used.`
  );
}

/** The section, in reading order. */
export function apparatusSection(): string[] {
  const convergence = degreesConvergenceLine();
  return [...apparatusLines(), citationStrengthLine(), ...(convergence ? [convergence] : [])];
}
