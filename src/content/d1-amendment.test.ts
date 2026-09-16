/**
 * THE D1 AMENDMENT KEEPS ITS PRICE (E21/S4, Track U2).
 *
 * WHAT HAPPENED. RT-Z5 (2026-09-16) was ruled (b): the product's readable
 * output may speak about the PERSON. That repeals part of D1, which is the
 * spine of this constitution and the rule the $3.99 personality quiz was killed
 * under. RT-Z9 (a) scoped the repeal to one surface. The amendment is recorded
 * in `CLAUDE.md`, append-only, with the old D1 stamped and kept.
 *
 * WHY A TEST AND NOT TRUST. An amendment is the most quotable kind of document
 * and the easiest to quietly improve. The dangerous edit is not deletion — it
 * is the trim: keeping "what it bought", losing "what it cost", and leaving a
 * paragraph that reads like a decision and functions like an advertisement.
 * This project has already watched a refusal without a price turn into a boast
 * (`claims.ts`, MethodRefusal.price). The same rule binds here.
 *
 * THE FOUR THINGS IT HOLDS:
 *
 *   1. The repealed text is STILL READABLE in the memo. Not paraphrased — the
 *      amendment quotes it, and the quotation is checked against the memo, so
 *      deleting the old D1 breaks the build rather than tidying the record.
 *   2. The amendment names WHERE the repeal applies and where it does not.
 *   3. The amendment names WHAT IT COST, in substance, not as a gesture.
 *   4. The memo's own D1 section carries a stamp pointing at the amendment, so
 *      a reader who opens the memo first is not told the unamended rule.
 *
 * WHAT IT CANNOT DO: judge whether the scope is right or the price honest.
 * It checks that both are stated and that the quotation is real. Whether the
 * cost paragraph tells the truth is a person's job, and the docblock says so
 * rather than letting the test's name imply otherwise.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const CONSTITUTION = "CLAUDE.md";
const MEMO = "restructuring_decision_memo_2026-07-11.md";

/** Whitespace collapsed: every document here hard-wraps, and a quotation that
 *  spans a line break is still the same quotation. The convention is
 *  `method/claims.test.ts`'s, deliberately — one anchor rule, not two. */
function flat(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/** The heading the amendment lives under. */
const HEADING = "### D1 amendment";

/** The amendment's own text, from its heading to the next h2/h3. */
function amendmentBody(constitution: string): string {
  const at = constitution.indexOf(HEADING);
  if (at === -1) return "";
  const rest = constitution.slice(at + HEADING.length);
  const end = rest.search(/\n#{2,3} /);
  return end === -1 ? rest : rest.slice(0, end);
}

describe("the D1 amendment names what it repeals, where, and what it cost", () => {
  const constitution = readFileSync(CONSTITUTION, "utf8");
  const memo = readFileSync(MEMO, "utf8");
  const body = amendmentBody(constitution);

  it("read two real documents and found a real amendment", () => {
    expect(constitution.length, "the constitution is missing or empty").toBeGreaterThan(10000);
    expect(memo.length, "the memo is missing or empty").toBeGreaterThan(3000);
    /*
     * THE COUNT FLOOR. Every assertion below reads `body`, and an empty body
     * makes the `indexOf` checks fail loudly but the substance checks pass
     * vacuously. A renamed heading is the likeliest way this file stops
     * checking anything, so the length is asserted before the content is.
     */
    expect(
      body.length,
      `no text was found under "${HEADING}" in ${CONSTITUTION}. Either the amendment was removed or ` +
        "its heading changed, and every check below would then be reading an empty string.",
    ).toBeGreaterThan(1500);
  });

  /**
   * THE REPEALED TEXT SURVIVES, AND THE QUOTATION IS REAL.
   *
   * This is the append-only rule with teeth. The amendment quotes the sentence
   * it repeals; that sentence must still be in the memo, word for word. So the
   * old D1 cannot be deleted "because it is superseded anyway", and the
   * amendment cannot drift into quoting a version of D1 that never existed.
   */
  it("quotes the repealed sentence, and the memo still contains it", () => {
    const REPEALED = "It does **not** predict personality, mood, or psychological states.";
    expect(
      flat(body).indexOf(flat(REPEALED)),
      "the amendment does not quote the sentence it repeals. An amendment that only summarises what " +
        "it overrides leaves the reader to take its word for what the old rule said.",
    ).toBeGreaterThan(-1);
    expect(
      flat(memo).indexOf(flat(REPEALED)),
      `${MEMO} no longer contains the sentence the amendment quotes as repealed. The constitution is ` +
        "append-only: the old rule is stamped and kept, never deleted.",
    ).toBeGreaterThan(-1);
  });

  it("names where the repeal applies and where D1 still stands", () => {
    const flatBody = flat(body).toLowerCase();
    expect(flatBody, "the amendment does not name the surface it suspends D1 for").toContain(
      "suspended for the prompt card",
    );
    expect(
      flatBody,
      "the amendment does not say where D1 still stands. A repeal with no stated boundary is a " +
        "product-wide repeal whatever it says it is.",
    ).toContain("where d1 still stands");
    for (const readout of ["prestige", "delicacy", "threshold", "ranking"]) {
      expect(flatBody, `the amendment does not name the ${readout} readout as still under D1`).toContain(
        readout,
      );
    }
  });

  /**
   * THE PRICE, AND THE SHAPES THAT MEAN "NOTHING".
   *
   * `MethodRefusal.price` rejects the same shapes for the same reason: a
   * decision with no stated cost is a boast. The substance floor is a blunt
   * length check and it is deliberately blunt — it cannot tell whether the
   * price is honest, only whether somebody wrote one.
   */
  it("states what it cost, in substance", () => {
    const at = flat(body).toLowerCase().indexOf("what it cost");
    expect(
      at,
      "the amendment does not say what the repeal cost. This is the trim that matters: keeping what " +
        "it bought and dropping what it cost leaves a paragraph that reads like a decision and " +
        "functions like an advertisement.",
    ).toBeGreaterThan(-1);
    const price = flat(body).slice(at, at + 400);
    expect(
      price.length,
      "the cost section is too short to be a cost. Say what was lost.",
    ).toBeGreaterThan(200);
    for (const empty of ["nothing", "no cost", "n/a"]) {
      expect(
        price.toLowerCase().indexOf(`cost: ${empty}`),
        `the cost is given as "${empty}", which is the shape this rule exists to refuse`,
      ).toBe(-1);
    }
    expect(
      flat(body).toLowerCase(),
      "the amendment does not say what the repeal bought either. Both halves or neither.",
    ).toContain("what it bought");
  });

  it("leaves a stamp in the memo, so the memo cannot be read as unamended", () => {
    const section = memo.slice(memo.indexOf("## 2. Core decision"), memo.indexOf("## 3."));
    expect(
      section.length,
      "the memo's D1 section was not found, so this check is reading nothing",
    ).toBeGreaterThan(400);
    expect(
      section,
      "the memo's D1 section carries no amendment stamp. A reader who opens the memo first would be " +
        "told the unamended rule with nothing to warn them.",
    ).toContain("D1 AMENDED 2026-09-16");
    expect(
      section,
      "the stamp does not point at where the amendment actually lives",
    ).toContain("CLAUDE.md");
  });

  it("amends D1 alone, and says N3 is not relaxed", () => {
    const flatBody = flat(body);
    expect(flatBody, "the amendment does not scope itself to D1").toContain("Amends **D1 only");
    expect(
      flatBody,
      "the amendment does not say N3 survives it. N3 is the rule that forbids percentiles, cohorts " +
        "and comparison between people, and a surface newly allowed to speak about the reader is " +
        "exactly where it would be tempting to drop.",
    ).toContain("N3 is expressly not relaxed");
  });
});
