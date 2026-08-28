/**
 * THE FRONT DOOR'S LEAD SENTENCE (E11/S2, Track B).
 *
 * WHY IT MOVED OUT OF THE PAGE. It said "Two machines" while the page beneath
 * it rendered three, and had done since the Threshold Test shipped. Two things
 * were wrong at once, and only one of them is about a number:
 *
 *   1. the count was hand-typed, so nothing connected it to the list; and
 *   2. it lived in JSX, which the voice deck cannot reach — so the most-read
 *      sentence in the product was outside the one gate that screens copy.
 *
 * Fixing only the number would have left the second, which is the more
 * expensive one. This is the same move the delicacy card's hardcoded "calls 3"
 * needed, and the same one `learn.ts`'s FAQ strings already have.
 */

/** Counts a person reads as words, not digits, at the sizes the gym uses. */
const WORDS = ["no", "one", "two", "three", "four", "five", "six"];

export function countWord(n: number): string {
  return WORDS[n] ?? String(n);
}

/**
 * The same word, starting a sentence.
 *
 * Split out because the first draft interpolated `countWord` straight after a
 * full stop and shipped "Not a vibe. three machines" — a lowercase sentence
 * opening, in the largest paragraph on the front door. The guard caught it on
 * its first run, which is the only reason this comment is not a confession.
 */
export function countWordCapitalised(n: number): string {
  const w = countWord(n);
  return w.charAt(0).toUpperCase() + w.slice(1);
}

/**
 * The lead paragraph, minus its closing emphasis (which stays in JSX because
 * it carries a colour).
 *
 * THE COUNT IS PASSED IN, NOT IMPORTED. The caller is the page that renders
 * the list, so the page's own list is the only thing that can be right about
 * how many cards are on screen. Importing a registry here would let the two
 * disagree again — differently, and just as quietly.
 *
 * THE THREE CLAUSES ARE NOT DERIVED, and that is deliberate rather than lazy.
 * A machine's `criterion` is a taxonomy label ("Delicacy of taste · measured"),
 * not a sentence that survives being read aloud in a list, and generating
 * grammar from a data table to avoid typing three clauses is complexity bought
 * with nothing (N2). What protects them instead is a tripwire:
 * `instrument-state.test.ts` fails if the machine count ever stops being
 * three, and says to come here and write the missing clause.
 */
export function landingLead(machineCount: number): string {
  return (
    `Not a personality. Not a vibe. ${countWordCapitalised(machineCount)} machines, each measuring one thing ` +
    `Hume said a real judge needs — whether a famous name can move your ratings, whether your ears ` +
    `can catch damage when nobody tells you where it is, and how small that damage can get before ` +
    `you lose it.`
  );
}

/**
 * The line under the machine cards.
 *
 * FOUND BY READING THE RENDERED PAGE, NOT THE SOURCE (E11/S2). Every grep this
 * slice ran for a stale count looked for a NUMBER, and this said "pick either"
 * — a two-ness with no number in it, sitting under three cards, invisible to
 * every sweep and plainly wrong to anyone actually looking at the page.
 *
 * The repair is to stop counting in this sentence at all rather than to count
 * correctly: a line that does not depend on how many machines there are cannot
 * go stale when a fourth arrives. `instrument-state.test.ts` holds it to that.
 */
export function landingHint(): string {
  return "Free · no sign-up · headphones help · pick one, the room follows";
}
