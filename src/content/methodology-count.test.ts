import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * THE PAGE MAY NOT COUNT ITS OWN CONSTRAINTS (E16b/P3).
 *
 * Its opening once told the reader how many engineering constraints followed,
 * as a typed word. Adding a fifth made that word wrong — NOTHING MAY COUNT,
 * and this is the reusable-sentence version of it: a summary that states an
 * arity goes stale the moment the list under it grows.
 *
 * The count is not derived here, it is REMOVED. The constraints are prose with
 * inline markup, so turning them into data to make one word computable would
 * have been a refactor of shipped copy for a word nobody needs.
 */
const PATH = "src/app/learn/methodology/page.tsx";

describe("the methodology page states no count of its own constraints", () => {
  it("has constraints to count, and no sentence counting them", () => {
    const source = readFileSync(PATH, "utf8");
    expect(source.length).toBeGreaterThan(0);

    // The scan must find the list it is guarding, or it guards nothing.
    const numbered = source.match(/<strong>\d+\. /g) ?? [];
    expect(numbered.length, "no numbered constraints found — this guard is vacuous").toBeGreaterThan(3);

    const flat = source.replace(/\s+/g, " ");
    const counting = /\b(?:Two|Three|Four|Five|Six|Seven) of them\b/i.exec(flat);
    expect(counting?.[0] ?? null, `the page counts its own constraints again`).toBeNull();
  });
});
