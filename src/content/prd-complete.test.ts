/**
 * THE PRD IS FOUR PARTS AND EACH ONE EXISTS (E20, PRD part 4).
 *
 * WHY A COMPLETENESS CHECK IS THE LAST GUARD THIS DOCUMENT NEEDS. The owner is
 * pointing a résumé at this repository, and a half-finished requirements
 * document undercuts the exact quality it was written to demonstrate — a
 * reviewer who finds parts 1 and 2 and no 3 learns something worse than if
 * there were no PRD at all.
 *
 * IT ALSO PINS THE MEASUREMENTS IN PART 4. Those numbers were read from the
 * running application's DOM, and they are the one thing in the PRD that goes
 * stale silently: a layout change moves them and nothing else notices. The two
 * that matter most are checked against the constants the product renders from,
 * so the specification cannot quietly describe a screen that no longer exists.
 *
 * WHAT IT CANNOT DO: verify a measurement taken in a browser. It checks that
 * part 4's stated container width is the shell's, and that the scale row count
 * it specifies matches the scale's own length. Colour, rhythm and whether a
 * screen feels finished are outside any test and the document says so itself.
 */
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { SHELL_WIDTH } from "@/content/shell";
import { BIAS_SCALE_MAX } from "@/engine/bias";
import { MAX_LINES, MIN_LINES } from "@/engine/reading/patterns";
import { LISTENERS } from "@/content/reading/listeners";
import { GUARDRAILS, STAKEHOLDERS, SUPPORTING } from "@/content/company/copy";
import { METHOD_REFUSALS, METHOD_REVERSALS } from "@/content/method/claims";

const NL = String.fromCharCode(10);

/** The four parts, in the order the brief scopes them. */
const PARTS = [
  { file: "docs/prd-1-use-cases.md", name: "use cases" },
  { file: "docs/prd-2-features.md", name: "feature breakdown" },
  { file: "docs/prd-3-requirements.md", name: "functional requirements" },
  { file: "docs/prd-4-screens.md", name: "screen specifications" },
];

describe("the PRD is complete", () => {
  it("has all four parts on disk", () => {
    const missing = PARTS.filter((p) => !existsSync(p.file)).map((p) => `${p.file} (${p.name})`);
    expect(
      missing,
      "the PRD is missing a part. A half-finished requirements document in a repository a reviewer " +
        "is being pointed at undercuts the quality it exists to demonstrate:" + NL + missing.join(NL),
    ).toEqual([]);
  });

  it("gives every part real content, not a stub", () => {
    const thin = PARTS.filter((p) => readFileSync(p.file, "utf8").length < 2000).map((p) => p.file);
    expect(thin, "these parts exist and are stubs:" + NL + thin.join(NL)).toEqual([]);
  });

  it("makes each part point at the others, so no part is an orphan", () => {
    const orphaned: string[] = [];
    for (const part of PARTS) {
      const text = readFileSync(part.file, "utf8");
      const names = PARTS.filter((o) => o.file !== part.file).some((o) => text.indexOf(o.file) !== -1);
      if (!names) orphaned.push(part.file);
    }
    expect(
      orphaned,
      "these parts reference no other part, so a reader who finds one cannot find the rest:" + NL +
        orphaned.join(NL),
    ).toEqual([]);
  });

  /*
   * THE TWO MEASUREMENTS MOST LIKELY TO ROT. Part 4's numbers came from a
   * browser; nothing else in the repository reads them. These two have
   * constants behind them and can be held to the product.
   */
  it("states the shell width the product actually uses", () => {
    const screens = readFileSync("docs/prd-4-screens.md", "utf8");
    expect(
      screens.indexOf("`" + SHELL_WIDTH + "`"),
      `part 4 specifies a container and does not name ${SHELL_WIDTH}, which is what the product ` +
        "renders. A screen specification describing a width the app does not use is worse than none.",
    ).toBeGreaterThan(-1);
  });

  it("specifies the rating scale with the number of points the scale has", () => {
    const screens = readFileSync("docs/prd-4-screens.md", "utf8");
    const points = BIAS_SCALE_MAX + 1;
    expect(
      screens.indexOf(`${points} buttons, one row`),
      `the scale has ${points} points and part 4 does not specify one row of ${points}. The row ` +
        "count is the specification — a wrapped scale reads as a grid rather than a line.",
    ).toBeGreaterThan(-1);
  });
});

/*
 * PART 2'S COUNTS ARE THE PRODUCT'S (PRD revision, 2026-09-23). Part 2 describes
 * each feature with a count — three listeners, three or four lines, seven
 * refusals — and every one of them is a number a later change moves without
 * touching this document. Each is built here from the constant the product
 * renders from, and the phrase must appear.
 */
const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
const word = (n: number) => WORDS[n] ?? String(n);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

describe("part 2 states the counts the product has", () => {
  const features = readFileSync("docs/prd-2-features.md", "utf8");
  const phrases = [
    `${cap(word(LISTENERS.length))} illustrative listeners`,
    `${cap(word(MIN_LINES))} or ${word(MAX_LINES)} lines`,
    `${word(SUPPORTING.length)} supporting metrics`,
    `${word(GUARDRAILS.length)} guardrails`,
    `The ${word(STAKEHOLDERS.length)} stakeholder notes`,
    `${cap(word(METHOD_REFUSALS.length))} things refused and ${word(METHOD_REVERSALS.length)} reversals`,
  ];

  it.each(phrases)("says %s", (phrase) => {
    expect(
      features.indexOf(phrase),
      `part 2 should say "${phrase}", which is what the product has. A count typed into a ` +
        "specification goes stale the day the product changes and nothing else notices.",
    ).toBeGreaterThan(-1);
  });
});
