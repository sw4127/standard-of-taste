/**
 * THE PRD'S RANKINGS ARE COMPUTED FROM ITS OWN TABLE (E20, PRD part 2).
 *
 * WHY THIS EXISTS, MEASURED. Part 2 scores sixteen features on two axes and
 * lists the top five under three weightings. I wrote those lists by reading the
 * table and thinking. Recomputing them found **five of fifteen positions
 * wrong** — including a claim in the analysis that the Prestige Test reaches
 * the top five only under the recruiter weighting, which the arithmetic denies.
 *
 * A DOCUMENT THAT DISAGREES WITH ITS OWN NUMBERS IS WORSE THAN ONE WITHOUT
 * NUMBERS. The scores are subjective and say so; the rankings are arithmetic
 * over them and have no excuse. This recomputes and compares, so a score edited
 * later cannot leave a stale order standing underneath it.
 *
 * WHAT IT CANNOT CHECK: whether a score is right. That is a judgment the
 * document defends in prose, and no test can hold it.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const NL = String.fromCharCode(10);
const PRD = "docs/prd-2-features.md";

interface Scored {
  name: string;
  craft: number;
  legibility: number;
}

/** The weightings the document publishes, with the heading each appears under. */
const WEIGHTINGS = [
  { craft: 0.5, legibility: 0.5, heading: "**50 / 50" },
  { craft: 0.7, legibility: 0.3, heading: "**70 CRAFT" },
  { craft: 0.3, legibility: 0.7, heading: "**30 CRAFT" },
];

/** Every scored row of the feature table. */
function features(doc: string): Scored[] {
  const out: Scored[] = [];
  for (const line of doc.split(NL)) {
    if (!line.startsWith("| ")) continue;
    const cells = line.split("|").map((c) => c.trim());
    if (cells.length < 5) continue;
    const craft = Number(cells[2]);
    const legibility = Number(cells[3]);
    if (!Number.isInteger(craft) || !Number.isInteger(legibility)) continue;
    out.push({ name: cells[1], craft, legibility });
  }
  return out;
}

/** The document's own five names under one heading, in order. */
function published(doc: string, heading: string): string[] {
  const at = doc.indexOf(heading);
  if (at === -1) return [];
  /*
   * THE LIST ENDS AT THE NEXT BLANK LINE, not at the next "**". Terminating on
   * the bold marker ran past the list into the following section heading, which
   * has no separator, so it was swallowed into the fifth item — and the test
   * reported a ranking mismatch that was entirely its own parse. A guard whose
   * failure message blames the document for the guard's bug is the worst kind.
   */
  const after = doc.slice(doc.indexOf(NL, at)).replace(/^\s+/, "");
  const block = after.slice(0, after.indexOf(NL + NL));
  return block
    .split("·")
    .map((part) => part.replace(/\d+\./, "").replace(/[\r\n]/g, " ").trim())
    .filter((part) => part.length > 0);
}

describe("the PRD's rankings match its own scores", () => {
  const doc = readFileSync(PRD, "utf8");
  const scored = features(doc);

  it("parsed a real table, so nothing below passes vacuously", () => {
    expect(scored.length, "no scored features parsed").toBeGreaterThan(10);
    for (const f of scored) {
      expect(f.craft, f.name).toBeGreaterThan(0);
      expect(f.legibility, f.name).toBeGreaterThan(0);
    }
  });

  it.each(WEIGHTINGS)("ranks correctly at $craft / $legibility", ({ craft, legibility, heading }) => {
    const ranked = [...scored]
      .sort((a, b) => {
        const diff = b.craft * craft + b.legibility * legibility - (a.craft * craft + a.legibility * legibility);
        return diff !== 0 ? diff : a.name.localeCompare(b.name);
      })
      .slice(0, 5)
      .map((f) => f.name);
    const said = published(doc, heading);
    expect(said.length, `no published list found under ${heading}`).toBe(5);
    expect(
      said,
      `the document's order under ${heading} is not what its own scores produce. Recompute or ` +
        "change a score, but do not leave the two disagreeing:",
    ).toEqual(ranked);
  });
});
