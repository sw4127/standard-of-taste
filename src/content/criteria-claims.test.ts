import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * NO PUBLIC SURFACE MAY SAY A LIVE CRITERION HAS NO INSTRUMENT (E16/S6).
 *
 * Track I shipped the comparison reading, and the claim that it was unbuilt was
 * sitting in SIX places: the reading-room page, the registry description, an FAQ
 * answer that is also served as FAQPage structured data, both machine-readable
 * llms files, the README's instrument table, and two sentences plus a table row
 * on the published summary page.
 *
 * WORSE, THE SWEEP FOUND A CLAIM THAT WAS ALREADY FALSE. The retest arc shipped
 * in E14 and is mounted on all three result screens, and the README still listed
 * practice as unbuilt while the summary page's own table marked it built two
 * lines above prose saying the opposite. Nobody had swept the neighbours.
 *
 * WHY THIS GUARD IS SHAPED AROUND LINES, NOT FILES. The reading-room page now
 * describes, in the past tense, the design it used to promise — that correction
 * is deliberate and must not trip a guard. So the rule is narrow: a line that
 * NAMES one of these criteria may not also carry an unbuilt marker. It scans
 * only the files listed, so its own needles cannot match themselves.
 */

/** Criteria whose instruments are live. Adding one here is the whole update. */
const LIVE_CRITERIA = ["comparison", "practice"];

/** Phrases that assert something is not built. */
const UNBUILT_MARKERS = [
  "no instrument yet",
  "not built",
  "have no instrument",
  "has no instrument",
  ">planned<",
];

const SURFACES = [
  "public/llms.txt",
  "public/llms-full.txt",
  "README.md",
  "docs/index.html",
  "src/content/learn.ts",
];

describe("public surfaces do not call a live instrument unbuilt", () => {
  it("finds each criterion named, and never beside an unbuilt marker", () => {
    let linesNamingACriterion = 0;
    const offences: string[] = [];

    for (const path of SURFACES) {
      const text = readFileSync(path, "utf8");
      expect(text.length, path).toBeGreaterThan(0);

      for (const raw of text.split("\n")) {
        const line = raw.toLowerCase();
        if (!LIVE_CRITERIA.some((c) => line.includes(c))) continue;
        linesNamingACriterion++;
        for (const marker of UNBUILT_MARKERS) {
          if (line.includes(marker)) offences.push(`${path}: ${raw.trim().slice(0, 90)}`);
        }
      }
    }

    // A scan that matched nothing would pass by having nothing to look at.
    expect(linesNamingACriterion).toBeGreaterThan(SURFACES.length);
    expect(offences).toEqual([]);
  });

  it("counts no criterion as instrument-less on the summary page", () => {
    const html = readFileSync("docs/index.html", "utf8");
    // The prose that used to say two criteria had no instrument, and the table
    // row that agreed with it, are both gone; the legend explaining the tag may
    // stay, because it describes a convention rather than a row.
    expect(html).toMatch(/five criteria now has an instrument|All five of Hume/i);
    const plannedRows = html.match(/<tr>(?:(?!<\/tr>)[\s\S])*?tag p">planned[\s\S]*?<\/tr>/g) ?? [];
    expect(plannedRows).toEqual([]);
  });
});

/**
 * NO PUBLISHED PAGE MAY COUNT FEWER INSTRUMENTS THAN EXIST (2026-09-13).
 *
 * `docs/index.html` said "Three of the five have working instruments" in one
 * paragraph and "All five of Hume's criteria now have an instrument" in two
 * others. The unbuilt-marker scan above could not see it: the sentence carries
 * no unbuilt marker and names no criterion, it just counts. So the summary page
 * — the one written to convince a stranger — undersold the product by two
 * instruments, and would have gone to GitHub Pages that way.
 *
 * A COUNT IS A CLAIM. This checks the shape rather than the sentence, so the
 * next page to phrase it differently is still caught.
 */
describe("published pages count the instruments correctly", () => {
  /*
   * BUILT WITH `new RegExp`, NOT WRITTEN AS A LITERAL. The transport this file
   * was authored through eats one level of backslash escaping, so every word
   * boundary in the first version arrived as a literal BACKSPACE character and
   * the pattern matched nothing at all -- while the corpus scan reported no
   * violations, which looks exactly like success. The fixture test above is the
   * only reason it was caught, and it is the third regex this repository has
   * had hollowed out the same way.
   */
  const BS = String.fromCharCode(92);
  const EDGE = BS + "b";
  const WS = BS + "s";
  const COUNTED = new RegExp(
    EDGE + "(one|two|three|four|five|six)" + WS + "+of" + WS + "+the" + WS + "+five" + EDGE,
    "gi",
  );
  const WORD = ["", "one", "two", "three", "four", "five", "six"];

  /*
   * FIVE IS HUME'S NUMBER, NOT A COUNT OF OUR WORK. The criteria are fixed by
   * the 1757 essay; what moves is how many have instruments, and
   * `criteria-coverage.test.ts` is what proves that all five do — it opens each
   * implementing file and checks the symbol is exported. This guard does the
   * other half: it stops a published page CLAIMING fewer than exist.
   *
   * My first version asserted `LIVE_CRITERIA.length === 5`, which is a list of
   * the two criteria whose instruments shipped most recently. It failed
   * immediately, which is the only reason the mistake is not in the repository.
   */
  const HUME_CRITERIA = 5;

  /*
   * THE PATTERN IS PROVEN ON A FIXTURE, NOT ON THE CORPUS, and that correction
   * is worth recording. My first vacuity check required a counting sentence to
   * EXIST in the published files — which passed only while the defect was still
   * there, and failed the moment it was fixed. A guard that needs a violation
   * present in order to believe itself is backwards; what has to be shown is
   * that the matcher would catch one.
   */
  it("catches an understated count, and lets a correct one through", () => {
    const said = (text: string) => (text.match(COUNTED) || []).length;
    expect(said("Three of the five have working instruments.")).toBe(1);
    expect(said("Two of the five are built.")).toBe(1);
    expect(said("All five have working instruments.")).toBe(0);
    expect(said("Five of the five have working instruments.")).toBe(1);
  });

  it("reads real files, so the scan below is not scanning nothing", () => {
    const all = SURFACES.map((path) => readFileSync(path, "utf8")).join(" ");
    expect(all.length).toBeGreaterThan(5000);
  });

  it("never says fewer of the five are built than are built", () => {
    const wrong: string[] = [];
    for (const path of SURFACES) {
      const text = readFileSync(path, "utf8");
      for (const hit of text.match(COUNTED) || []) {
        const said = WORD.indexOf(hit.trim().split(/\s+/)[0].toLowerCase());
        if (said > 0 && said < HUME_CRITERIA) wrong.push(`${path}: "${hit}"`);
      }
    }
    expect(
      wrong,
      `all ${HUME_CRITERIA} of Hume's criteria have an instrument. These pages count fewer, ` +
        "which understates the product on the surfaces written to convince a stranger:",
    ).toEqual([]);
  });
});

