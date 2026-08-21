import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";

/**
 * THE GATES CANNOT SILENTLY SHRINK (E6/S24, PM ruling RT-130a c).
 *
 * WHAT HAPPENED. Retiring the delicacy tiers in E6/S23 meant deleting a block
 * from `voice.test.ts`. The script cut from the wrong comment, took the
 * enclosing `describe`'s closing brace, and removed EIGHT tests where five
 * belonged to the tiers. Three of the casualties had nothing to do with them:
 * both halves of the PAID-TIER guard's two-directional proof, and the assertion
 * that the sweep stays a sweep.
 *
 * `tsc` caught the brace. Nothing caught the tests. Vitest reported 1646
 * passing and every other check was green. It surfaced only because the total
 * had dropped by fifteen when five was the ceiling, and that was luck.
 *
 * WHY A COUNT, WHICH IS A CRUDE THING TO ASSERT. A deleted test is invisible to
 * every tool we run: it does not fail to compile, it does not lint, and the
 * suite gets FASTER and greener. There is no signal at all. A floor is the only
 * cheap check that turns silence into noise.
 *
 * WHY ONLY THESE FILES (the PM's ruling, and it is the right one). A global
 * floor fires on every legitimate removal, so it becomes a number people bump
 * without reading — worse than nothing, because it teaches everyone that this
 * class of failure is routine. Nobody retires a hazard-gate test casually, so a
 * failure HERE is worth a human stopping to read.
 *
 * A FLOOR IS NOT A TARGET. Lowering one is allowed; doing it silently is not.
 * If a gate genuinely sheds a test, drop the number in the same commit and say
 * in the message which protection went and why it is no longer needed.
 */

/**
 * Files whose job is to stop a class of defect reaching a user, where losing a
 * test means losing protection rather than losing housekeeping.
 *
 * Counts measured 2026-08-22, not guessed.
 */
const GATES: { file: string; floor: number; guards: string }[] = [
  { file: "src/content/voice.test.ts", floor: 17, guards: "the hazard gate: five banned moves, the paid-tier ban, and both directions of each" },
  { file: "src/content/bias/claims.test.ts", floor: 8, guards: "every hardcoded pool/duration claim against the pool that backs it" },
  { file: "src/engine/confidence.test.ts", floor: 3, guards: "the confidence level and its multiplier cannot drift apart" },
  { file: "src/engine/staircase-shipping.test.ts", floor: 3, guards: "no reachable clip missing from the deploy (RT-88a), and nothing unreachable swept in" },
  { file: "src/lib/readable-on.test.ts", floor: 11, guards: "button ink clears AA, and BRAND_ACCENT tracks the stylesheet" },
  { file: "src/app/fan-verdict/accent-contrast.test.ts", floor: 6, guards: "all twenty nation accents stay readable" },
  { file: "src/app/threshold/share-links.test.ts", floor: 4, guards: "one builder for the share payload; a card cannot describe a different session than its page" },
  { file: "src/app/bias/clip-player-errors.test.ts", floor: 4, guards: "an interrupted play is not a failed clip, and a real failure still locks the gate" },
  { file: "src/content/delicacy/card-lines.test.ts", floor: 3, guards: "the delicacy card's figure fits the card at the size it renders" },
  { file: "src/content/staircase/card-fit.test.ts", floor: 5, guards: "every threshold card figure fits, proven against the character-count rule it replaced" },
  { file: "src/lib/retest-cooldown.test.ts", floor: 15, guards: "the 7-day validity gate, including its fail-open cases" },
];

/**
 * Matches `it(`, `it.skipIf(...)(`, `it.each(...)(` and friends at the start of
 * a line. Written deliberately wider than `it(`: the first version of this
 * counter missed `it.skipIf` and reported the staircase deploy guard as having
 * ONE test when it has three — a counter that undercounts sets its own floor
 * too low and protects nothing.
 */
const TEST_PATTERN = /^\s+it(\.\w+\([^)]*\))?\(/gm;

function countTests(source: string): number {
  return (source.match(TEST_PATTERN) ?? []).length;
}

describe("E6/S24 — the gates cannot silently shrink", () => {
  it("every gate file still exists", () => {
    const missing = GATES.filter((g) => !existsSync(g.file)).map((g) => g.file);
    expect(
      missing,
      "a whole gate file is gone — if that is deliberate, remove its entry here in the same commit",
    ).toEqual([]);
  });

  it("no gate has quietly lost a test", () => {
    const shrunk: string[] = [];
    for (const { file, floor, guards } of GATES) {
      if (!existsSync(file)) continue;
      const n = countTests(readFileSync(file, "utf8"));
      if (n < floor) shrunk.push(`${file}: ${n} tests, floor ${floor} — this file guards ${guards}`);
    }
    expect(
      shrunk,
      "A gate lost coverage. Nothing else in the toolchain reports this: a deleted " +
        "test compiles, lints, and makes the suite greener and faster. If the removal " +
        "is deliberate, lower the floor in the same commit and say which protection " +
        "went.\n" + shrunk.join("\n"),
    ).toEqual([]);
  });

  /**
   * The counter is proven against a specimen rather than trusted, because a
   * counter that silently returns 0 would make every floor pass forever — the
   * same shape of failure it exists to catch.
   */
  it("the counter actually counts, including skipIf and each", () => {
    const specimen = [
      'describe("x", () => {',
      '  it("plain", () => {});',
      '  it.skipIf(!present)("conditional", () => {});',
      '  it.each([1, 2])("parameterised %i", () => {});',
      '  // it("commented out", () => {});',
      "});",
    ].join(String.fromCharCode(10));
    // Three real tests; the commented-out line is indented past the pattern's
    // anchor and must not inflate the count.
    expect(countTests(specimen)).toBe(3);
    expect(countTests("")).toBe(0);
  });

  it("the floors describe files that actually have tests", () => {
    // A floor of 0, or an entry pointing at a file with no tests, would pass
    // forever while guarding nothing.
    for (const { file, floor } of GATES) {
      expect(floor, `${file} has a floor of ${floor}`).toBeGreaterThan(0);
      if (existsSync(file)) expect(countTests(readFileSync(file, "utf8"))).toBeGreaterThan(0);
    }
  });
});
