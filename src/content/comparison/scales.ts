/**
 * HOW MANY DEGREES THE PROFESSIONALS ALLOW THEMSELVES (E16/S1, Track I).
 *
 * WHY THIS EXISTS. Hume's fifth criterion is comparison: by comparison alone,
 * he argued, do we learn to assign DEGREES of praise. The Comparison reading
 * reports how many of the eleven degrees on our rating scale a person actually
 * used — and a bare count like that is unreadable. Five of eleven sounds narrow
 * until you know what a professional does with a scale.
 *
 * THE PM ASKED FOR A CONNECTION TO MODERN CRITICISM AND THIS IS IT. Pitchfork's
 * catalogue can never be played here — it is copyrighted, and memo §8.2 permits
 * public-domain and Creative-Commons audio only — so the instrument borrows
 * their SCALE rather than their records. That turns out to be the more
 * interesting half: the most numerically ambitious critical institution in
 * music gives itself a hundred and one places to put a record, and most of its
 * reviews land in a band a point and a bit wide — while the critic who ran the
 * longest-lived grading column in American rock criticism retired the bottom of
 * his own ladder.
 *
 * AN EARLIER DRAFT OF THIS PARAGRAPH PUT A NUMBER ON THAT SECOND CLAUSE, saying
 * Pitchfork behaves as though it had roughly a certain count of degrees. No
 * source says any such thing; it was arithmetic on a band width, performed
 * three lines above a comment refusing to do arithmetic on Christgau's ladder
 * for precisely that reason. Two standards in one file, in the file whose
 * subject is unsourced figures. The prose now carries only what the sources
 * carry, and the reader can do their own arithmetic if they want to.
 *
 * WHAT THIS IS FOR, AND WHAT IT IS NOT FOR (RT-H2 a, and the trap that shapes
 * this whole track). It is a REFERENCE POINT, never a target. The product
 * measures being swayed by a prestigious name; scoring a reader's agreement
 * with a prestigious critic would make it contradict itself in public. Nothing
 * here may be used to say a reader's degrees are right, wrong, too few or too
 * many. It says what these scales allow and what their owners did with them,
 * names whose scale it is every time, and stops.
 *
 * IT IS DELIBERATELY NOT COUPLED TO THE COMPARISON INSTRUMENT. These are facts
 * about rating scales, not about one reading, so any surface that shows a
 * person a rating scale can cite them. The types below mention no instrument.
 *
 * WHAT THE BUILD CAN CHECK AND WHAT IT CANNOT. `claims.ts` machine-checks its
 * citations because they are files in this repository; a passage that moves
 * breaks the build. THESE CITATIONS ARE EXTERNAL PAGES AND NO TEST CAN OPEN
 * THEM. So the discipline is different and weaker, and saying so is the point:
 * every entry records the date the page was actually opened and read by a
 * person, and anything that could not be opened did not ship. Rolling Stone's
 * own account of its star ratings was wanted here and is absent for exactly
 * that reason — the page answered with a payment wall, so it is not a source.
 */

import { BIAS_SCALE_MAX, BIAS_SCALE_MIN } from "@/engine/bias";

/** One external page, opened and read on `retrieved`. */
export interface ScaleCitation {
  /** Stable key, referenced by a finding. */
  id: string;
  /** Named author where the page has one; null when the institution is it. */
  author: string | null;
  publication: string;
  title: string;
  url: string;
  /** ISO date on which the page was opened and its content read. */
  retrieved: string;
}

/** One statement about a scale, bound to the page it came from. */
export interface ScaleFinding {
  /** The claim as it will be printed. No figure may appear without a source. */
  statement: string;
  /** `id` of the citation in the same entry that supports this statement. */
  citationId: string;
}

export interface CriticScale {
  id: string;
  /** Who does the judging — a publication or a person. */
  critic: string;
  /** The scale as published, in words a reader can go and check. */
  scale: string;
  /**
   * Degrees the published range fixes. NULL where it does not fix one, which
   * is not a gap to be filled in later: a letter ladder implies a step count
   * only if you assume every step is used, and assuming that here would invent
   * the very number this file exists to question.
   */
  degreesAllowed: number | null;
  /** What was actually done with those degrees. */
  findings: ScaleFinding[];
  citations: ScaleCitation[];
}

export const CRITIC_SCALES: CriticScale[] = [
  {
    id: "pitchfork",
    critic: "Pitchfork",
    scale: "0.0 to 10.0, to one decimal place",
    degreesAllowed: 101,
    citations: [
      {
        id: "pitchfork-scale",
        author: null,
        publication: "Wikipedia",
        title: "Pitchfork (website)",
        url: "https://en.wikipedia.org/wiki/Pitchfork_(website)",
        retrieved: "2026-09-02",
      },
      {
        id: "conaway",
        author: "Nolan Conaway",
        publication: "nolanbconaway.github.io",
        title: "What I found in 18000 Pitchfork album reviews",
        url: "https://nolanbconaway.github.io/blog/2017/pitchfork-roundup.html",
        retrieved: "2026-09-02",
      },
    ],
    findings: [
      {
        statement:
          "The scale runs from 0.0 to 10.0 in tenths, which is a hundred and one places a record can land.",
        citationId: "pitchfork-scale",
      },
      {
        statement:
          "Across more than 18,000 reviews published between January 1999 and January 2017, the mean score was 7.0.",
        citationId: "conaway",
      },
      {
        // "Most" is the source's own word and the source does not define it —
        // no percentile is attached to this band anywhere on the page. Kept
        // because it is what the analysis says, phrased so it cannot be read as
        // an interquartile range or any other statistic it is not.
        statement: "Most of those scores lie between 6.4 and 7.8.",
        citationId: "conaway",
      },
      {
        statement:
          "Scores ending in .0 appear nearly twice as often as scores ending in .1 — the reviewers avoid the decimals their own scale offers them.",
        citationId: "conaway",
      },
    ],
  },
  {
    id: "christgau",
    critic: "Robert Christgau's Consumer Guide",
    scale: "letter grades, A+ down to E−",
    // Left null on purpose. The range implies a ladder; the number of rungs a
    // reader would infer from it is arithmetic, not something either cited page
    // states, and this file does not print arithmetic as though it were a
    // published fact.
    degreesAllowed: null,
    citations: [
      {
        id: "christgau-wiki",
        author: null,
        publication: "Wikipedia",
        title: "Robert Christgau",
        url: "https://en.wikipedia.org/wiki/Robert_Christgau",
        retrieved: "2026-09-02",
      },
      {
        id: "christgau-grades",
        author: "Robert Christgau",
        publication: "robertchristgau.com",
        title: "Consumer Guide: Grades",
        url: "https://www.robertchristgau.com/xg/web/grades.php",
        retrieved: "2026-09-02",
      },
    ],
    findings: [
      {
        statement: "The Consumer Guide's letter grades ran from A+ down to E−.",
        citationId: "christgau-wiki",
      },
      {
        statement:
          "From 1990 he used fewer letter grades for records below B+, replacing the bottom of his own ladder with honourable mentions and the categories Choice Cuts, Neither and Duds.",
        citationId: "christgau-grades",
      },
    ],
  },
];

/**
 * THIS INSTRUMENT'S OWN SCALE, DERIVED RATHER THAN TYPED.
 *
 * The bounds live in the engine that validates every rating against them. A
 * second copy here would be a page telling a reader how many degrees they had
 * while the engine offered a different number — the two-tables defect, on the
 * one figure this whole reading turns on.
 */
export const OUR_SCALE = {
  critic: "This instrument",
  scale: `${BIAS_SCALE_MIN} to ${BIAS_SCALE_MAX}, whole numbers only`,
  degreesAllowed: BIAS_SCALE_MAX - BIAS_SCALE_MIN + 1,
} as const;

/** Every citation across every entry, for a page that lists its sources once. */
export function allScaleCitations(): ScaleCitation[] {
  return CRITIC_SCALES.flatMap((s) => s.citations);
}
