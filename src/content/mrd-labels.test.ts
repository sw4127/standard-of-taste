/**
 * EVERY MARKET CLAIM IN THE MRD CARRIES EVIDENCED OR ASSUMED (E21/S3, Track U3).
 *
 * WHY THIS DOCUMENT AND NOT ANOTHER. `docs/mrd-prompt-card-2026-09-16.md` is
 * tracked by RT-Z6 (2026-09-16) (a), and the repository is public, so tracking
 * it published it. It is the only document here that makes assertions about a
 * MARKET — what tools do, what people cannot do, what nobody is collecting —
 * and a repository whose public page publishes its own refusals cannot carry a
 * file of unsupported claims. The ruling made the labels the condition of
 * publication. This is that condition, enforced.
 *
 * WHAT IT MEASURED BEFORE IT WAS WRITTEN. The document's header claimed
 * "4 EVIDENCED, 7 ASSUMED". There were three `Status:` lines in the whole file,
 * carrying one EVIDENCED and four ASSUMED between them, and two entire sections
 * of market claims — §1.4 and §2 — with no label at all. The summary of a
 * document about honest labelling was the one number in it nobody could check.
 *
 * THE RULE THIS ENFORCES, which is narrower than the test's name:
 *
 *   1. Every claim marker is `**M<n> · EVIDENCED —` or `**M<n> · ASSUMED —`.
 *   2. The ids run 1..n with no gap and no repeat, so a claim cannot be deleted
 *      or duplicated quietly — a gap is the shape a removal leaves behind.
 *   3. Every claim-bearing section holds at least one marker. Sections are
 *      WALKED from the headings, never typed, so a new §1.5 of unlabelled
 *      claims is caught rather than being outside a list somebody maintained.
 *   4. The header's ratio sentence matches the counted labels.
 *
 * WHAT IT CANNOT DO, said plainly, because the failure mode here is believing
 * otherwise: it cannot tell whether a label is HONEST. Calling an assumption
 * EVIDENCED passes every check below. It also cannot find a market claim
 * written with no marker at all inside an already-labelled section — only an
 * entire unlabelled section trips rule 3. The register's membership is a
 * judgment, defended in the document; what is mechanised is that the judgment
 * is written down, complete, and counted correctly.
 *
 * COUNT-FLOOR TRIPWIRES ON EVERY SCAN. Three of this repository's guards have
 * passed by matching nothing: a regex hollowed out by an escaping bug, a deck
 * census whose corpus was empty, a slot detector whose fixtures varied in the
 * code and not the output. Each scan below asserts its own corpus is real
 * before it asserts anything about it.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const NL = String.fromCharCode(10);
const MRD = "docs/mrd-prompt-card-2026-09-16.md";

/** The labels, as the PRD spells them. */
type Label = "EVIDENCED" | "ASSUMED";

interface Claim {
  id: number;
  label: Label;
  /** 1-indexed line, for a failure message that points at the place. */
  line: number;
  /** The heading the claim sits under, for the coverage check. */
  section: string;
}

/**
 * The marker. The middle dot is the document's own separator; it is built from
 * a char code because this transport has twice eaten a level of escaping and
 * left a regex matching nothing while reporting success.
 */
const DOT = String.fromCharCode(183);
const MARKER = new RegExp(`\\*\\*M(\\d+) ${DOT} (EVIDENCED|ASSUMED) `, "g");

/**
 * Sections that must carry at least one claim. Derived from the headings, not
 * typed: everything under "## 1" and the "## 2" heading itself is the position
 * and who it is for, which is where the market claims live. Sections 3 onward
 * describe the product, and a product description is not a market claim.
 */
function claimBearingSections(lines: string[]): string[] {
  const out: string[] = [];
  let inPosition = false;
  for (const line of lines) {
    const h2 = /^## (\d+) /.exec(line);
    if (h2) {
      inPosition = h2[1] === "1";
      // "## 2 · Who it is for" carries claims in its own body, with no
      // subheadings under it.
      if (h2[1] === "2") out.push(line.trim());
      continue;
    }
    if (inPosition && /^### \d+\.\d+ /.test(line)) out.push(line.trim());
  }
  return out;
}

/** Which heading a line sits under. */
function sectionOf(lines: string[], index: number): string {
  for (let i = index; i >= 0; i--) {
    if (/^#{2,3} /.test(lines[i])) return lines[i].trim();
  }
  return "<no heading>";
}

function claims(text: string): Claim[] {
  const lines = text.split(NL);
  const out: Claim[] = [];
  lines.forEach((line, i) => {
    MARKER.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = MARKER.exec(line)) !== null) {
      out.push({
        id: Number(m[1]),
        label: m[2] as Label,
        line: i + 1,
        section: sectionOf(lines, i),
      });
    }
  });
  return out;
}

describe("the MRD labels every market claim it makes", () => {
  const text = readFileSync(MRD, "utf8");
  const lines = text.split(NL);
  const found = claims(text);

  it("read a real document and found a real register", () => {
    expect(text.length, "the MRD is empty or missing").toBeGreaterThan(8000);
    /*
     * THE COUNT FLOOR. Ten is below the thirteen that exist and far above the
     * zero a broken marker produces. Without this, every assertion underneath
     * is vacuously true the moment the pattern stops matching — which is how
     * this project has shipped three guards that had never once failed.
     */
    expect(
      found.length,
      "fewer than ten claim markers were found, so either the document lost its register or this " +
        "scan has stopped matching. Everything below this line would pass on an empty list.",
    ).toBeGreaterThanOrEqual(10);
  });

  it("gives every claim an id, with no gap and no repeat", () => {
    const ids = found.map((c) => c.id).sort((a, b) => a - b);
    const expected = ids.map((_, i) => i + 1);
    expect(
      ids,
      "the claim ids are not 1..n. A gap is the shape a deleted claim leaves behind, and a repeat " +
        "means two claims answer to one id:" + NL + ids.join(", "),
    ).toEqual(expected);
  });

  it("labels every claim EVIDENCED or ASSUMED, and nothing else", () => {
    const unlabelled = found.filter((c) => c.label !== "EVIDENCED" && c.label !== "ASSUMED");
    expect(unlabelled).toEqual([]);
  });

  it("carries at least one claim in every claim-bearing section", () => {
    const sections = claimBearingSections(lines);
    expect(
      sections.length,
      "no claim-bearing sections were found, so this check is looking at nothing",
    ).toBeGreaterThanOrEqual(5);
    const labelled = new Set(found.map((c) => c.section));
    const bare = sections.filter((s) => !labelled.has(s));
    expect(
      bare,
      "these sections of the position carry no labelled claim. A whole section of unlabelled " +
        "assertions is exactly what this document shipped with before the register existed:" +
        NL + bare.join(NL),
    ).toEqual([]);
  });

  /**
   * THE HEADER IS DERIVED FROM THE BODY, NOT TYPED BESIDE IT.
   *
   * This is the check that would have caught the original defect. The header
   * said "4 EVIDENCED, 7 ASSUMED" over a document containing neither, and it
   * was the most quotable sentence in the file — the ratio is the point rather
   * than an embarrassment, so it is the sentence most likely to be read and
   * least likely to be recounted.
   */
  it("states a ratio that matches the labels underneath it", () => {
    const evidenced = found.filter((c) => c.label === "EVIDENCED").length;
    const assumed = found.filter((c) => c.label === "ASSUMED").length;
    expect(evidenced, "no claim is labelled EVIDENCED").toBeGreaterThan(0);
    expect(assumed, "no claim is labelled ASSUMED").toBeGreaterThan(0);
    const sentence = `**${evidenced} EVIDENCED, ${assumed} ASSUMED**`;
    expect(
      text.indexOf(sentence) !== -1,
      `the register holds ${evidenced} EVIDENCED and ${assumed} ASSUMED claims, and the header does ` +
        `not say so. It must contain the exact phrase ${sentence}. The ratio is the most quoted ` +
        "sentence in this document and the easiest to let drift once a claim is added.",
    ).toBe(true);
  });
});
