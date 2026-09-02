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
