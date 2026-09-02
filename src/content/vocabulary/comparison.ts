/**
 * THE COMPARISON READING, IN SENTENCES (E16/S4, Track I).
 *
 * Deterministic templates over numbers the engine already computed. No LLM
 * (blueprint §4), no cohort, no percentile, and nothing about the person —
 * every sentence is about a sitting (D1, N3).
 *
 * WHAT THIS LAYER HAD TO GET RIGHT, AND WHY IT IS THE HARD PART OF THE TRACK.
 *
 * A degrees count is a number that INVITES a verdict. "You used five of eleven"
 * reads as a mark out of eleven unless three things are said in the same breath:
 *
 *   1. THE CEILING IS REACHABLE BY ACCIDENT. Rating the clips at random lands
 *      on about nine distinct values, so eleven is not an achievement and five
 *      is not a failing grade. The engine carries that figure; this layer says
 *      it out loud, every time, in the same sentence as the count.
 *   2. A NARROW SPREAD MAY BE THE CORRECT ANSWER. If the clips really are close
 *      in quality, compressing them is right, and this instrument cannot tell
 *      that case from a narrow ear. That sentence is not optional and not a
 *      footnote — it is `COMPARISON_BOUNDARY` and it is appended unconditionally.
 *   3. NOBODY IS BEING RANKED. There is no cohort. The only outside reference
 *      is what professional critics do with their OWN scales, which is a
 *      reference point and never a target — see `criticReferenceLines`.
 *
 * THE CRITIC SENTENCES ARE NOT WRITTEN HERE. They are composed from
 * `src/content/comparison/scales.ts`, where each one is bound to the page it
 * came from and the date somebody opened it. Retyping them into a copy deck
 * would be the two-tables defect on the one part of this product that quotes
 * an outside source, which is the worst possible place for it.
 *
 * AND THE REFUSAL IS A SENTENCE, NOT A BLANK. The reader whose ratings were all
 * within a point of each other gets a degrees count and no stability figure,
 * because there is nothing there to compute. A screen that showed one live
 * number beside one empty space would read as a bug; what belongs there is a
 * statement of why the instrument is not speaking.
 */

import { MIN_ASSERTED_PAIRS, comparisonDegreesClaim, comparisonStabilityClaim } from "@/engine/evidence";
import { ASSERTION_FLOOR, type ComparisonResult } from "@/engine/comparison";
import { CRITIC_SCALES, OUR_SCALE } from "@/content/comparison/scales";
import { numberWord } from "./numbers";

/**
 * SAID EVERY TIME, WITH NO CONDITION ON IT.
 *
 * The single most likely misreading of this instrument is that a small number
 * means a poor ear. It does not, and the reason is not modesty: the clips were
 * chosen for licence clarity and genre spread, never for being equally good, so
 * nobody knows how far apart they truly are. A listener who heard them as close
 * together and rated them that way did the task correctly.
 */
export const COMPARISON_BOUNDARY =
  "None of that says your ear is narrow. These clips were never spaced out by quality — if they " +
  "really do sit close together, hearing them that way is the right answer, and this instrument " +
  "cannot tell that apart from a listener who hears everything as much the same.";

/** The degrees count, with the figure that makes it readable attached. */
export function degreesLine(say: {
  degreesUsed: number;
  degreesAvailable: number;
  degreesIfIndifferent: number;
  lowestUsed: number;
  highestUsed: number;
  itemCount: number;
}): string {
  const spread =
    say.degreesUsed === say.degreesAvailable
      ? `all ${numberWord(say.degreesAvailable)} of the degrees this scale offers`
      : `${numberWord(say.degreesUsed)} of the ${numberWord(say.degreesAvailable)} degrees this scale offers`;
  /*
   * THE RANGE CLAUSE MUST NOT RESTATE THE SCALE. A listener who used the whole
   * width got "nothing below zero and nothing above ten" — which is true of
   * every possible sitting, reads as a finding, and says nothing. Found by
   * reading the rendered sentence; every test was green.
   */
  const usedFullWidth = say.highestUsed - say.lowestUsed === say.degreesAvailable - 1;
  const range =
    say.lowestUsed === say.highestUsed
      ? `every one of them on ${numberWord(say.lowestUsed)}`
      : usedFullWidth
        ? "the top and the bottom both in play"
        : `nothing below ${numberWord(say.lowestUsed)} and nothing above ${numberWord(say.highestUsed)}`;
  return (
    `You put ${numberWord(say.itemCount)} clips on ${spread}, with ${range}. ` +
    `Someone rating the same clips at random would have landed on about ` +
    `${numberWord(Math.round(say.degreesIfIndifferent))}.`
  );
}

/**
 * The pairs a listener ordered one way and then the other.
 *
 * It names the two exclusions in the sentence itself rather than in a footnote,
 * because a share whose denominator is invisible is a share nobody can check —
 * and this one drops roughly a fifth of the eligible pairs before it starts.
 */
export function stabilityLine(say: {
  asserted: number;
  kept: number;
  tied: number;
  reversed: number;
}): string {
  const scope =
    `Of the ${numberWord(say.asserted)} pairs you separated by ${numberWord(ASSERTION_FLOOR)} points or more, ` +
    `counting only pairs where the names on screen pushed both clips the same way`;
  if (say.reversed === 0) {
    return `${scope}, you put every one of them back in the same order.`;
  }
  /*
   * The tie clause is JOINED, not started. Written as its own sentence it
   * opened with a spelled-out number and rendered "…the second time. three
   * more came out level" — a lowercase sentence opening, invisible to every
   * test here and obvious the moment the line was printed.
   */
  const ties = say.tied === 0 ? "" : `, and ${numberWord(say.tied)} more came out level`;
  return `${scope}, you put ${numberWord(say.reversed)} of them the other way round the second time${ties}.`;
}

/**
 * WHAT PROFESSIONALS DO WITH THEIR OWN SCALES — the reference point.
 *
 * Composed from the cited data, never retyped. Each line names whose scale it
 * is, which is the condition RT-H2(a) attaches to using critics at all: they
 * set the spread, never the answer, and no reader is ever scored against them.
 */
export function criticReferenceLines(): string[] {
  /*
   * THE `scale` FIELD IS NOT PRINTED HERE, and that is the fix rather than an
   * omission. Prefixing it produced "Pitchfork — 0.0 to 10.0, to one decimal
   * place. The scale runs from 0.0 to 10.0 in tenths…" — the same fact twice
   * in one breath, because the first cited finding already states the range.
   * The findings carry sources; the field does not, so the findings win. The
   * field stays for a table that wants the scale in a column of its own.
   */
  return CRITIC_SCALES.map(
    (entry) => `${entry.critic}: ${entry.findings.map((f) => f.statement).join(" ")}`,
  );
}

/** This instrument's own scale, said in the same breath as theirs. */
export function ourScaleLine(): string {
  return (
    `This one gives you ${numberWord(OUR_SCALE.degreesAllowed)} — ${OUR_SCALE.scale} — and asks only how many ` +
    `of them you used. Not whether you used the right ones. There is no right one.`
  );
}

/**
 * WHY THERE IS NO NUMBER HERE, in the reader's terms rather than the gap's.
 *
 * `too-few-clips-for-degrees` cannot happen on the shipped pool and is written
 * anyway: a refusal that exists in code and not in copy is a blank screen
 * waiting for a pool change nobody remembers making.
 */
export function comparisonRefusal(gap: string, result: ComparisonResult): string {
  if (gap === "too-few-asserted-pairs") {
    return (
      `Your ratings sat too close together for this second number to mean anything: it needs ` +
      `${numberWord(MIN_ASSERTED_PAIRS)} pairs separated by ${numberWord(ASSERTION_FLOOR)} points or more, and this ` +
      `sitting produced ${numberWord(result.pairs.asserted)}. Below that, one clip's wobble moves the answer ` +
      `further than the answer moves, so there is nothing here worth printing.`
    );
  }
  return (
    `This sitting had fewer clips than the scale has degrees, so a count out of ` +
    `${numberWord(result.degreesAvailable)} would be measuring you against room you were never given.`
  );
}

/**
 * The reading, in order: what you did, whether it held, what the professionals
 * do, and the limit. Empty only if the engine refuses everything, which the
 * shipped pool cannot produce.
 */
export function comparisonLines(result: ComparisonResult): string[] {
  const lines: string[] = [];

  const degrees = comparisonDegreesClaim(result);
  if (degrees.ok) lines.push(degreesLine(degrees.value));
  else lines.push(comparisonRefusal(degrees.gap, result));

  const stability = comparisonStabilityClaim(result);
  if (stability.ok) lines.push(stabilityLine(stability.value));
  else lines.push(comparisonRefusal(stability.gap, result));

  lines.push(COMPARISON_BOUNDARY);
  return lines;
}
