/**
 * THE READING SAYS WHAT ITS AMENDMENT PROMISED IT WOULD SAY (D1, third surface).
 *
 * Same derivation as `src/content/card/statement.test.ts`: the sentence is read
 * out of `CLAUDE.md` — the document that suspended D1 for this surface — and
 * compared with what the page renders. Editing either alone fails the build.
 * It reads the LAST marker that names the reading, so the card's statements,
 * which sit earlier in the same file, can never be mistaken for this one.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { READING_STATEMENT } from "./statement";

const NL = String.fromCharCode(10);

export function statementFor(constitution: string, surface: "card" | "reading"): string | null {
  const lines = constitution.split(NL);
  const markers = lines
    .map((l, i) => ({ l, i }))
    .filter(({ l }) => l.startsWith("**On-surface statement"))
    .filter(({ l }) => (surface === "reading" ? l.includes("for the reading") : !l.includes("for the reading") && l.includes("card")));
  if (markers.length === 0) return null;
  const quoted: string[] = [];
  for (const line of lines.slice(markers[markers.length - 1].i + 1)) {
    if (line.startsWith("> ")) quoted.push(line.slice(2).trim());
    else if (quoted.length > 0) break;
  }
  return quoted.length ? quoted.join(" ") : null;
}

describe("the reading says what the third-surface amendment promised", () => {
  const constitution = readFileSync("CLAUDE.md", "utf8");

  it("found the amendment and its statement", () => {
    expect(constitution.indexOf("### D1 amendment, third surface")).toBeGreaterThan(-1);
    expect(statementFor(constitution, "reading")?.length ?? 0).toBeGreaterThan(60);
  });

  it("renders the constitution's sentence, word for word", () => {
    expect(READING_STATEMENT).toBe(statementFor(constitution, "reading"));
  });

  it("is not the card's sentence (the two markers are told apart)", () => {
    expect(statementFor(constitution, "card")).not.toBe(statementFor(constitution, "reading"));
  });

  it("says the surface speaks about the reader, and that the hearing tests do not", () => {
    expect(READING_STATEMENT).toMatch(/\byou\b/);
    expect(READING_STATEMENT).toMatch(/hearing tests describe only what you did/);
  });
});
