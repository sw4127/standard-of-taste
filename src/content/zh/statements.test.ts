/**
 * THE CHINESE PAGES SAY WHAT THE CONSTITUTION'S CHINESE STAMP SAYS (bilingual Part 2, 2026-09-29).
 *
 * The English on-surface statements are read out of CLAUDE.md and compared with
 * what the pages render (`reading/statement.test.ts`, `card/statement.test.ts`).
 * The Chinese renderings are held the same way: extracted from the stamp marked
 * "zh rendering", compared with the modules the pages render from. Editing
 * either alone fails the build. Serves D1 (as amended) and BA-3; N3.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CARD_STATEMENT_ZH, READING_STATEMENT_ZH } from "./copy/statements";
import { zhBanBreaches } from "./style";

const NL = String.fromCharCode(10);

/** The quoted sentence under the LAST "zh rendering" marker for a surface. */
export function zhStatementFor(constitution: string, surface: "card" | "reading"): string | null {
  const lines = constitution.split(/\r?\n/);
  const markers = lines
    .map((l, i) => ({ l, i }))
    .filter(({ l }) => l.startsWith("**zh rendering of the on-surface statement for the " + surface));
  if (markers.length === 0) return null;
  const quoted: string[] = [];
  for (const line of lines.slice(markers[markers.length - 1].i + 1)) {
    if (line.startsWith("> ")) quoted.push(line.slice(2).trim());
    else if (quoted.length > 0) break;
  }
  return quoted.length ? quoted.join("") : null;
}

/**
 * Whether the renderings in force carry a status: the last marker of each surface
 * says "pending owner approval", or an APPROVED stamp naming the zh renderings sits
 * after both (owner ruling 1a, 2026-10-01). A rendering appended after an approval
 * is unapproved until its own stamp, and without the pending mark it fails.
 */
export function zhStatementStatus(constitution: string): "approved" | "pending" | "unmarked" {
  const lines = constitution.split(/\r?\n/);
  const last = (["card", "reading"] as const).map((surface) =>
    lines.findLastIndex((l) => l.startsWith("**zh rendering of the on-surface statement for the " + surface)),
  );
  const approval = lines.findLastIndex((l) => l.startsWith("*[APPROVED ") && l.includes("zh renderings"));
  // In the same section: an approval stamp under a later heading approves something else.
  const sameSection = !lines.slice(Math.max(...last), approval).some((l) => l.startsWith("#"));
  if (approval > Math.max(...last) && sameSection) return "approved";
  return last.every((i) => i >= 0 && lines[i].includes("pending owner approval")) ? "pending" : "unmarked";
}

describe("the Chinese statements are the constitution's", () => {
  const constitution = readFileSync("CLAUDE.md", "utf8");

  it("found the stamp, and the renderings in force are approved by the owner (ruling 1a, 2026-10-01)", () => {
    expect(zhStatementStatus(constitution)).toBe("approved");
    expect(zhStatementFor(constitution, "reading")?.length ?? 0).toBeGreaterThan(40);
    expect(zhStatementFor(constitution, "card")?.length ?? 0).toBeGreaterThan(30);
  });

  it("reads a rendering's status from the stamps, not from the newest line alone", () => {
    const card = "**zh rendering of the on-surface statement for the card (pending owner approval):**";
    const reading = "**zh rendering of the on-surface statement for the reading (pending owner approval):**";
    const ok = "*[APPROVED 2026-10-01, the zh renderings above.]*";
    expect(zhStatementStatus([card, reading].join(NL))).toBe("pending");
    expect(zhStatementStatus([card, reading, ok].join(NL))).toBe("approved");
    // A new rendering after the approval is not covered by it.
    expect(zhStatementStatus([card, reading, ok, card].join(NL))).toBe("pending");
    expect(zhStatementStatus([card, reading, ok, "**zh rendering of the on-surface statement for the card:**"].join(NL))).toBe("unmarked");
    // An approval under a later heading is another section's.
    expect(zhStatementStatus([card, reading, "### D3 amendment", ok].join(NL))).toBe("pending");
  });

  it("renders the stamp's sentences, character for character", () => {
    expect(READING_STATEMENT_ZH).toBe(zhStatementFor(constitution, "reading"));
    expect(CARD_STATEMENT_ZH).toBe(zhStatementFor(constitution, "card"));
  });

  it("keeps the English statements' two halves: it speaks to you, and the hearing tests describe only what you did", () => {
    for (const s of [READING_STATEMENT_ZH, CARD_STATEMENT_ZH]) {
      expect(s).toMatch(/你/);
      expect(s).toMatch(/只描述你做了什么/);
    }
  });

  it("keeps the owner's Chinese rules", () => {
    expect([READING_STATEMENT_ZH, CARD_STATEMENT_ZH].flatMap(zhBanBreaches)).toEqual([]);
  });

  it("the English marker readers do not mistake the Chinese stamp for the English statement", () => {
    // Both English parsers look for lines starting with this; the stamp's markers must not.
    const english = constitution.split(NL).filter((l) => l.startsWith("**On-surface statement"));
    expect(english.some((l) => l.includes("zh rendering"))).toBe(false);
  });
});
