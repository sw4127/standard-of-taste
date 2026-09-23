/**
 * THE CARD'S SELF-DESCRIPTION COMES FROM THE CONSTITUTION (E21/T-S5, Track T).
 *
 * D1 is suspended for the prompt card and nowhere else, and the amendment
 * granting that attaches a condition: the surface says so on itself. This is
 * the condition, enforced.
 *
 * THE DERIVATION IS THE POINT. The sentence is extracted from `CLAUDE.md` — the
 * document that authorised the suspension — and compared with what the card
 * renders. Editing either one alone fails the build. Without this, the
 * "requirement" is a constant somebody wrote near a docblock, which is exactly
 * the shape of every stale claim this repository has spent slices deleting.
 *
 * WHAT IT CANNOT DO: judge whether the sentence is a good disclosure. It checks
 * that the card says the thing the constitution says it will.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CARD_STATEMENT } from "./statement";

const NL = String.fromCharCode(10);
const CONSTITUTION = "CLAUDE.md";
const MARKER = "**On-surface statement";

/**
 * The blockquoted sentence under the amendment's on-surface-statement
 * paragraph. A blockquote is used because it is the one markdown shape that
 * means "this exact text" rather than "roughly this".
 *
 * THE LAST ONE, because the constitution is append-only and the newest
 * amendment governs (2026-09-23: the second-surface amendment narrowed "on this
 * site" to "in the gym" when the snack became a second surface). The superseded
 * sentence stays in the file, stamped; reading the first marker would hold the
 * card to a rule that no longer applies.
 */
function statementInConstitution(text: string): string | null {
  const at = text.lastIndexOf(MARKER);
  if (at === -1) return null;
  const lines = text.slice(at).split(NL);
  const quoted: string[] = [];
  for (const line of lines.slice(1)) {
    if (line.startsWith("> ")) quoted.push(line.slice(2).trim());
    else if (quoted.length > 0) break;
  }
  return quoted.length === 0 ? null : quoted.join(" ");
}

describe("the card says what the amendment promised it would say", () => {
  const constitution = readFileSync(CONSTITUTION, "utf8");

  it("read a real constitution with a real statement in it", () => {
    expect(constitution.length, "CLAUDE.md is missing or empty").toBeGreaterThan(10000);
    expect(
      constitution.indexOf("### D1 amendment"),
      "the D1 amendment is gone, so the card is rendering a disclosure for a suspension that is not " +
        "recorded anywhere",
    ).toBeGreaterThan(-1);
    const found = statementInConstitution(constitution);
    expect(
      found,
      `no blockquoted sentence follows "${MARKER}" in ${CONSTITUTION}. Either the amendment lost its ` +
        "on-surface statement or this extractor has stopped matching, and both mean the check below " +
        "is comparing the constant to nothing.",
    ).not.toBeNull();
    expect(found!.length, "the extracted statement is too short to be one").toBeGreaterThan(60);
  });

  it("renders the constitution's sentence, word for word", () => {
    expect(
      CARD_STATEMENT,
      "the card's self-description and the constitution's have drifted apart. The amendment is the " +
        "authority: change it there, and this constant follows.",
    ).toBe(statementInConstitution(constitution));
  });

  it("says what it is for: that this surface speaks about the reader", () => {
    const flat = CARD_STATEMENT.toLowerCase();
    expect(flat, "the statement does not address the reader").toContain("you");
    expect(
      flat.includes("everything else") || flat.includes("other"),
      "the statement does not say that the REST of the product is different, which is the whole " +
        "disclosure — a card that says 'this is about you' without that contrast tells a reader " +
        "nothing they could not assume about every screen here",
    ).toBe(true);
  });
});
