/**
 * THE D3 AMENDMENT QUOTES WHAT IT AMENDS, AND SAYS WHAT IT COST (blueprint audit, BA-6).
 *
 * The same rule `d1-amendment.test.ts` holds for D1, for the same reason: an
 * amendment that only summarises what it overrides leaves the reader to take
 * its word for what the old rule said. The first draft of this amendment did
 * exactly that — it "quoted" CLAUDE.md's shorthand for D3, a sentence the memo
 * never contained — and nothing would have noticed.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const HEADING = "### D3 amendment";
const flat = (t: string) => t.replace(/\s+/g, " ").trim();

function body(constitution: string): string {
  const at = constitution.indexOf(HEADING);
  if (at === -1) return "";
  const rest = constitution.slice(at + HEADING.length);
  const end = rest.search(/\n#{2,3} /);
  return end === -1 ? rest : rest.slice(0, end);
}

describe("the D3 amendment names what it amends, quotes it, and states its cost", () => {
  const constitution = readFileSync("CLAUDE.md", "utf8");
  const memo = readFileSync("restructuring_decision_memo_2026-07-11.md", "utf8");
  const text = body(constitution);

  it("found a real amendment (a floor, so an empty body cannot pass)", () => {
    expect(text.length).toBeGreaterThan(1000);
  });

  it("quotes the memo's D3 verbatim, and the memo still says it", () => {
    const quoted = /\*\*Was \(memo D3\)[^*]*\*\* \*([^*]+)\*/.exec(text)?.[1];
    expect(quoted, "the amendment has no italic quotation after its 'Was (memo D3)' label").toBeTruthy();
    // The memo bolds its label ("**V1 flagship:**"); the quotation drops the bold.
    expect(flat(memo.replace(/\*\*/g, "")), "the memo does not contain what the amendment quotes").toContain(
      flat(quoted!).replace(/\.$/, ""),
    );
  });

  it("names the reading as the flagship and keeps the instruments unchanged", () => {
    const f = flat(text).toLowerCase();
    expect(f).toContain("the reading is the flagship");
    expect(f).toContain("the instruments themselves are not changed");
  });

  it("states what it cost, in substance", () => {
    const at = flat(text).toLowerCase().indexOf("what it cost");
    expect(at).toBeGreaterThan(-1);
    expect(flat(text).slice(at, at + 400).length).toBeGreaterThan(200);
  });
});
