import { flawFamilyCountWordLeading } from "./flaw-families";
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
/**
 * THE FIRST THING ANYONE READS (PM direction, 2026-09-13).
 *
 * WHY THE PAGE DID NOT OPEN LIKE THIS BEFORE, and why it now does. The front
 * door led with "Your taste has a number." — true, differentiating, and cold.
 * The owner's objection is that nothing on it gives a reason to care before it
 * asks for eight minutes, and he is right: a measurement is an answer to a
 * question nobody has been made to ask yet.
 *
 * THE QUESTION IS HIS, AND IT IS THE BEST FRAME THIS PROJECT HAS HAD. The
 * feeling of good music is the feeling of being understood. That is also
 * exactly what a recommender does and exactly what it withholds — it models you
 * as coordinates that are machine-readable and not human-readable, so it can
 * act on your taste while you still cannot say a word about it. That is not a
 * slogan bolted on; it is the SECOND of the two user findings this project
 * actually has, the one it has served least.
 *
 * WHAT IT MAY NOT BECOME. "We understand you" is a claim about a person, which
 * D1 forbids and which nothing here has measured. The line is about the
 * EXPERIENCE of music understanding you, and about the machines that already
 * do; the product's own promise stays what it was — what your ears did, in
 * words, and you can be wrong about it.
 */
/*
 * REPLACED 2026-09-23 (blueprint Part 7; BA-6). The opener above introduced a
 * gym: "The music that got you understood something you could not say" read two
 * ways (the music understood you / you understood something), and the turn below
 * it promised "a number you can read" as the deliverable, where the blueprint
 * promises words for the pattern (BP-INSIGHT). The reading is now the front door.
 */
// serves BP-INSIGHT (docs/blueprint.md): the pattern exists; the reading puts it into words.
export const LANDING_HEADLINE =
  "Your last month of listening holds a pattern you have probably never put into words.";
/**
 * THE SECOND BEAT. Split out of the headline after reading the rendered page:
 * all three sentences as one `h1` ran to seven lines of display type at 1280px
 * and pushed every machine card below the fold — which defeats the other half
 * of the same complaint, that nothing shows a person what they are being asked
 * to do. A headline is one sentence.
 */
// serves BP-UNMET (docs/blueprint.md): a paraphrase of what existing tools lack.
export const LANDING_ALGORITHM =
  "So does every algorithm that has ever recommended you a song. It just never " +
  "tells you, because what it knows about you is a row of numbers no person can read.";

/**
 * THE TURN, NOW TOWARD THE READING (blueprint Part 7). The recommender holds the
 * pattern and will not say; here it is read back. The old turn promised "a number
 * you can read" and was removed (it contradicted BP-INSIGHT, change list C).
 */
// serves BP-UNMET (docs/blueprint.md): check it, argue with it, carry it into a prompt.
export const LANDING_READING_TURN =
  "Here a month of someone's listening is read back line by line, with the plays behind every line. " +
  "Keep what fits, reject what doesn't, and carry what is left into a prompt.";

export const LANDING_CARDS_LEAD = "Try it on a month that isn't yours.";

export const HEARING_KICKER = "THE HEARING TESTS";
export const HEARING_HEADING = "Then find out which words in a prompt you can actually hear.";

export function landingLead(machineCount: number): string {
  return (
    `Not a personality. Not a vibe. ${countWordCapitalised(machineCount)} machines, each measuring one thing ` +
    `Hume said a real judge needs: whether a famous name can move your ratings, whether your ears ` +
    `can catch damage when nobody tells you where it is, how small that damage can get before ` +
    `you lose it, and whether the gaps you hear fall where a critic's did.`
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

/** A quiet door under the machine cards: an accented label, then a plain line. */
export interface SecondaryDoor {
  href: string;
  /** The accented lead. Short — it is what the eye lands on. */
  label: string;
  line: string;
}

/**
 * THE SECONDARY DOORS, AS DATA (E11/S4, Track B / B1, PM ruling RT-AO(a)).
 *
 * The reference page needed a way in that was not "browse the reading room and
 * hope", and RT-C(b) put creator language on that page and on results while
 * leaving the landing general. So this is one more quiet line in a list that
 * already had two — not a redesign, and it names no audience.
 *
 * WHY THE NEW ONE IS FIRST. The order of a list is a claim about what matters.
 * Of the doors here when it arrived, it was the only one that served the person
 * the blueprint is written for, and the one it displaced describes itself,
 * accurately, as having no measurement behind it.
 *
 * WHY THEY MOVED OUT OF JSX AT ALL. Same reason as `landingLead` in E11/S2:
 * prose written into a component is outside the voice deck. Two of the original
 * lines had been on the busiest page in the product, ungated, since the gym
 * opened.
 *
 * THE READING-ROOM DOOR IS GONE (Track V/S1, PM ruling RT-1 (2026-09-22) a).
 * It read "Reading room. Hume's five criteria, and how we measure them." and
 * the header nav added in Phase 3 already said READING ROOM, so the front door
 * offered one room twice. The owner kept the nav: it is the one shared frame
 * (RT-Z3 a), it is the first thing on a phone screen where the door was ~1,900
 * px down, and this list is for destinations the header does not carry.
 * `src/app/site-doors.test.tsx` now fails if a door here and the header ever
 * point at the same room again. Nothing in this comment counts the list.
 */
export const SECONDARY_DOORS: SecondaryDoor[] = [
  {
    href: "/learn/flaws",
    label: "Something sounds wrong.",
    line:
      `${flawFamilyCountWordLeading()} kinds of damage, what each one is called, and which ` +
      "machine measures it.",
  },
  // The snack's door ("Snack." -> /music/quiz) was removed when the owner
  // retired it for good, 2026-09-23 (BA-7).
];
