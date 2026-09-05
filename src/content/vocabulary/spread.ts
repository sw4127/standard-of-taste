/**
 * THE RECOGNITION FILTER, IN SENTENCES (E17/S4, Track N).
 *
 * Deterministic templates over what the engine computed. No LLM, no cohort, no
 * percentile, nothing about the person — every sentence is about a sitting.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS FILTER EXISTS, AND WHY IT CAN ONLY EVER SUBTRACT
 *
 * Half of the works a published critic ranks are famous. A listener who
 * recognises the Eroica is not rating what they heard in the last forty
 * seconds; they are rating a reputation, which is the exact thing the Prestige
 * Test measures and the exact thing this instrument must not be measuring by
 * accident. So before anything is computed, the listener says which clips they
 * had heard before, and those clips are removed.
 *
 * IT IS SELF-REPORT, AND THAT IS SAID OUT LOUD EVERY TIME (N3). Nobody checked.
 * A listener who half-remembers something, or who says no because saying yes
 * feels like admitting a shortcut, moves what gets counted. `RECOGNITION_
 * DISCLOSURE` is appended wherever the filter is described, unconditionally,
 * because a filter presented as though it were verified is a false claim about
 * the apparatus and this product has a narrower rule about those than most.
 *
 * IT IS A FILTER AND NEVER A MEASUREMENT. The count of recognised clips is not
 * a score, not a sub-score, and not reported as a fact about the listener's
 * knowledge. It exists to say how much evidence was left. A product that told
 * you how much Beethoven you recognised would be measuring recall, and recall
 * is not on Hume's list.
 *
 * ---------------------------------------------------------------------------
 * THE REFUSAL IS THE POINT OF THIS SLICE (PM ruling RT-N1 a)
 *
 * Recognise enough clips and there is not enough left to read. The ruled
 * behaviour is: no number, a plain sentence naming how many were set aside and
 * why that leaves too little, and an invitation to come back.
 *
 * The tempting alternative — print the number anyway with a caveat — was
 * rejected because it prints a figure the engine has just declared it cannot
 * support, and a caveat under a number does not stop anyone reading the number.
 * The engine now makes that structurally impossible: a refused reading carries
 * no mean at all, only counts.
 *
 * AND THE REFUSAL MUST NOT FLATTER. "You know your Beethoven!" is the obvious
 * warm thing to say to someone who recognised everything, and it converts a
 * failure to measure into a compliment about the person — a verdict smuggled in
 * where the instrument just said it had nothing. Guarded, not just avoided.
 */

import type { SpreadResult } from "@/engine/spread";
import { MIN_PAIRS_PER_KIND } from "@/content/spread/ranking";
import { numberWord, numberWordLeading } from "./numbers";

/**
 * SAID WHEREVER THE FILTER IS DESCRIBED, WITH NO CONDITION ON IT.
 *
 * The apparatus rule from Track P applies to our own apparatus first: describe
 * what the instrument does, never overstate what it knows.
 */
export const RECOGNITION_DISCLOSURE =
  "You told us which of these you had heard before, and we took your word for it — nothing here " +
  "checks. It only ever leaves clips out; what you recognised is not part of any result.";

/**
 * SAID EVERY TIME A READING IS PRODUCED, WITH NO CONDITION ON IT.
 *
 * The likeliest misreading of two numbers sitting side by side is that the
 * bigger one is better. What the pair can show is whether a listener's ratings
 * moved where a critic's judgment moved — not whether they moved the same way,
 * which this instrument cannot see and would refuse to report if it could.
 */
export const SPREAD_BOUNDARY =
  "Neither number says you agreed with him, and neither could: this only ever looks at how far " +
  "apart your two ratings fell, never at which one you put higher. Preferring the work he ranked " +
  "lower costs you nothing here, because nothing here is checking. Small numbers are not a poor " +
  "result either — six recordings of six different works are not spaced out by quality, and if " +
  "they genuinely sounded close to you then rating them close was the accurate thing to do.";

/** How many clips the listener set aside, as self-report rather than a score. */
export function recognitionLine(result: SpreadResult): string {
  const n = result.excludedClipIds.length;
  const left = result.usedClipIds.length;
  if (n === 0) {
    return (
      "You said none of these were familiar, so all of them counted. " + RECOGNITION_DISCLOSURE
    );
  }
  /**
   * NOTHING MAY COUNT, AND THE ALL-RECOGNISED CASE PROVED IT AGAIN. The single
   * template read "what follows rests on the zero that were new to you" when a
   * listener recognised everything — a sentence that both counts wrongly and
   * promises a reading the very next line refuses. Found by printing the copy,
   * not by the guards, which were all green.
   */
  if (left === 0) {
    return (
      `Every clip here was one you had heard before, so all ${numberWord(n)} were set aside. ` +
      RECOGNITION_DISCLOSURE
    );
  }
  return (
    `${numberWordLeading(n)} ${n === 1 ? "clip" : "clips"} you had heard before ` +
    `${n === 1 ? "was" : "were"} set aside before anything was worked out, so what follows rests on the ` +
    `${numberWord(left)} that ${left === 1 ? "was" : "were"} new to you. ${RECOGNITION_DISCLOSURE}`
  );
}

/**
 * WHY THERE IS NO NUMBER, in the reader's terms rather than the engine's.
 *
 * Every branch names what was set aside, says what the instrument needed, and
 * ends by inviting the reader back — because the honest thing to offer someone
 * who ran out of unfamiliar clips is another sitting, not a consolation prize.
 */
export function spreadRefusal(result: SpreadResult): string {
  const set = result.excludedClipIds.length;
  const left = result.usedClipIds.length;
  const need = numberWord(MIN_PAIRS_PER_KIND);

  if (result.refusal === "too-few-rated-clips") {
    return (
      `You had heard all ${numberWord(set)} of these before, so there is nothing here to read. This one only ` +
      `works on music that is new to you — on anything you already know, a rating is partly memory, and no ` +
      `instrument can separate the two afterwards. There is no second attempt that would fix that: it needs ` +
      `more music than this pool currently holds. Come back if it grows.`
    );
  }

  const far = result.refusal === "too-few-far-pairs";
  const count = far ? result.far.count : result.close.count;
  const spacing = far ? "widely-spaced" : "closely-spaced";
  return (
    `No number this time. Setting aside the ${numberWord(set)} you had heard before left ` +
    `${numberWord(left)} ${left === 1 ? "clip" : "clips"}, and ${count === 1 ? "that makes" : "those make"} only ` +
    `${numberWord(count)} usable ${spacing} ${count === 1 ? "pair" : "pairs"} where this needs ${need}. ` +
    `Below that, one clip's wobble moves the answer further than the answer moves. ` +
    `Come back and try it with fewer set aside.`
  );
}

/**
 * The recognition half of the reading, in order: what was set aside, and — when
 * there is nothing to report — why. The two numbers themselves are composed in
 * the reading layer; this is the part that has to be right before any number
 * is allowed to appear.
 */
export function recognitionLines(result: SpreadResult): string[] {
  const lines = [recognitionLine(result)];
  if (result.refusal) lines.push(spreadRefusal(result));
  return lines;
}

/** One decimal, which is all the resolution four pairs can carry. */
const points = (n: number) => n.toFixed(1);

/**
 * THE TWO NUMBERS, SAID PLAINLY, AND ALWAYS AGAINST THE CHANCE FIGURE.
 *
 * A reader handed "4.0 and 4.8" has no idea whether either is large. The
 * indifferent-rater figure is not decoration here, it is the only reference
 * point that exists: chance does not know which works a critic separated, so it
 * produces the SAME expected gap on both kinds of pair.
 */
export function figuresLine(result: SpreadResult): string {
  const far = result.far.meanGap;
  const close = result.close.meanGap;
  if (far === null || close === null) {
    throw new Error("figuresLine: called on a refused reading");
  }
  return (
    `Across the ${numberWord(result.far.count)} pairs he placed far apart, your two ratings differed ` +
    `by ${points(far)} points on average. Across the ${numberWord(result.close.count)} pairs he bracketed ` +
    `together, ${points(close)}. Rating at random produces ${points(result.spreadIfIndifferent)} on both, ` +
    `because chance does not know which works a critic separated.`
  );
}

/**
 * WHICH NUMBER IS LARGER IS A FACT ABOUT THE SITTING. WHETHER IT MEANS ANYTHING
 * IS NOT KNOWN, AND THIS SENTENCE SAYS SO IN THE SAME BREATH.
 *
 * The reading has to survive the way people actually read: a reader who sees
 * two numbers will decide which is bigger whether or not the copy names it, and
 * will take the bigger one as a result. Saying nothing does not prevent that
 * inference, it just leaves it unchallenged. So the direction is stated — and
 * the refusal is attached to it, unconditionally, rather than left as a caveat
 * further down where it can be skipped.
 *
 * THE REFUSAL IS NOT MODESTY, IT IS ARITHMETIC. Four pairs against four, drawn
 * from six clips that appear in several pairs each, so the gaps are not even
 * independent of one another. Nobody has sat this instrument twice, so how much
 * a second attempt would move these numbers has never been measured. Under
 * those conditions there is no honest threshold at which a difference becomes a
 * finding, and inventing one would be the manufactured norm this product spends
 * its whole existence refusing.
 */
export function directionLine(result: SpreadResult): string {
  const far = result.far.meanGap;
  const close = result.close.meanGap;
  if (far === null || close === null) {
    throw new Error("directionLine: called on a refused reading");
  }
  /**
   * THE FLAT RATER NEEDS HIS OWN SENTENCE, and the general one was wrong for
   * him. Someone who gave every clip the same number produces 0.0 and 0.0, and
   * the even-handed template said "your ratings moved the same amount either
   * way" — technically true, and it describes a symmetry where the real fact is
   * that nothing moved at all. Found by printing the copy for a flat rater.
   */
  if (far === 0 && close === 0) {
    return (
      `You gave every one of these the same rating, so there are no gaps to compare and nothing ` +
      `for this to work on. That is a real answer rather than a failed attempt — if the six ` +
      `genuinely sounded alike to you, saying so was the accurate thing to do.`
    );
  }
  const shape =
    far > close
      ? "Your ratings moved further apart where his judgment did"
      : far < close
        ? "Your ratings moved further apart where his judgment did not"
        : "Your ratings moved the same amount either way";
  return (
    `${shape}. Whether that means anything is a question this cannot answer: ` +
    `${numberWord(result.far.count)} pairs against ${numberWord(result.close.count)}, built from clips that ` +
    `each appear in several of them, and nobody has sat this twice to find out how far the numbers wander ` +
    `on their own. There is no honest size at which the gap between them becomes a result, so none is offered.`
  );
}

/**
 * The reading, in order: what was set aside, the two numbers, what the
 * difference between them is not, and the limit. A refused reading stops after
 * the refusal — there is nothing to compose.
 */
export function spreadLines(result: SpreadResult): string[] {
  const lines = recognitionLines(result);
  if (!result.refusal) {
    lines.push(figuresLine(result));
    lines.push(directionLine(result));
  }
  lines.push(SPREAD_BOUNDARY);
  return lines;
}
