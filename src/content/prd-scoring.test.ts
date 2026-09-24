/**
 * THE PRD'S RANKINGS ARE COMPUTED FROM ITS OWN TABLE (E20, PRD part 2).
 *
 * WHY THIS EXISTS, MEASURED. Part 2 scores its features on two axes and lists
 * the top five under three weightings. The first version's lists were written
 * by reading the table and thinking; recomputing them found **five of fifteen
 * positions wrong**, including a claim in the analysis the arithmetic denied.
 *
 * A DOCUMENT THAT DISAGREES WITH ITS OWN NUMBERS IS WORSE THAN ONE WITHOUT
 * NUMBERS. The scores are subjective and say so; the rankings are arithmetic
 * over them and have no excuse. This recomputes and compares, so a score edited
 * later cannot leave a stale order standing underneath it.
 *
 * THE AXES ARE BP-GOAL'S CLAUSES (revised 2026-09-23, BA-2). The first version
 * scored CRAFT and LEGIBILITY: what building a feature proved. The owner
 * reopened that rule because it conflicts with BP-GOAL, and part 2 now scores
 * TRY (a reviewer can try the core) and FUND (a reviewer can see why a company
 * would fund it and how it would test that). The arithmetic is unchanged; the
 * headings it reads are the new ones, and a heading from the old axes is
 * refused so the replaced rule cannot come back beside the new one.
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
  try: number;
  fund: number;
}

/** The weightings the document publishes, with the heading each appears under. */
const WEIGHTINGS = [
  { tryW: 0.5, fundW: 0.5, heading: "**50 / 50" },
  { tryW: 0.7, fundW: 0.3, heading: "**70 TRY / 30 FUND" },
  { tryW: 0.3, fundW: 0.7, heading: "**30 TRY / 70 FUND" },
];

/** The replaced rule's axes (BA-2). Neither may head a column or a weighting again. */
const REPLACED_AXES = ["CRAFT", "LEGIBILITY"];

/** Every scored row of the feature table. */
function features(doc: string): Scored[] {
  const out: Scored[] = [];
  for (const line of doc.split(NL)) {
    if (!line.startsWith("| ")) continue;
    const cells = line.split("|").map((c) => c.trim());
    if (cells.length < 5) continue;
    const tryScore = Number(cells[2]);
    const fund = Number(cells[3]);
    if (!Number.isInteger(tryScore) || !Number.isInteger(fund)) continue;
    out.push({ name: cells[1], try: tryScore, fund });
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
  /*
   * LINE ENDINGS NORMALISED ON READ. This repository is checked out with
   * core.autocrlf=true on the owner's machine, so a file git has touched there
   * arrives with CRLF — and the list parser below ends a list at a blank line,
   * "\n\n", which a CRLF file never contains. Found 2026-09-23 when a file
   * rewritten with Windows endings made all three rankings "wrong".
   */
  const doc = readFileSync(PRD, "utf8").replace(/\r\n/g, NL);
  const scored = features(doc);

  it("parsed a real table, so nothing below passes vacuously", () => {
    expect(scored.length, "no scored features parsed").toBeGreaterThan(10);
    for (const f of scored) {
      expect(f.try, f.name).toBeGreaterThan(0);
      expect(f.fund, f.name).toBeGreaterThan(0);
      expect(f.try, f.name).toBeLessThanOrEqual(5);
      expect(f.fund, f.name).toBeLessThanOrEqual(5);
    }
  });

  it("scores on BP-GOAL's clauses, not on the axes BA-2 replaced", () => {
    const header = doc.split(NL).find((l) => l.startsWith("| Feature |")) ?? "";
    expect(header, "no feature table header found").toContain("| TRY | FUND |");
    // A weighting heading reads "**70 TRY / 30 FUND"; the history section may still NAME the old axes.
    const heads = REPLACED_AXES.filter((a) => header.indexOf(a) !== -1 || new RegExp("\\*\\*\\d+ " + a).test(doc));
    expect(heads, "a replaced axis heads a column or a weighting again (BA-2)").toEqual([]);
  });

  it.each(WEIGHTINGS)("ranks correctly at $tryW / $fundW", ({ tryW, fundW, heading }) => {
    const ranked = [...scored]
      .sort((a, b) => {
        const diff = b.try * tryW + b.fund * fundW - (a.try * tryW + a.fund * fundW);
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
