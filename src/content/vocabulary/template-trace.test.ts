/**
 * EVERY RENDERED SENTENCE TRACES TO EXACTLY ONE TEMPLATE (E18/S15, RT-R5 a).
 *
 * WHY THIS IS THE FOUNDATION AND NOT A CURIOSITY. The copy deck presents each
 * rendering as an independently editable sentence, and Cowork's batch-1 return
 * showed that it is not: eleven collapses cover twenty-four ids, and applying a
 * rewrite to each in turn would have the last one silently overwrite the rest.
 * A deck keyed to TEMPLATES is the fix, and it can only be built if the mapping
 * from rendering to template is exact. This asserts it is.
 *
 * IT PARSES SOURCE RATHER THAN DIFFING RENDERINGS, decided by a measurement.
 * All eight arc renderings in the deck said "pitch drift", because the fixtures
 * only exercised one flaw family — so `${label}` varied in the CODE and not in
 * the OUTPUT, and any slot-detector built on diffing renderings would have
 * missed it exactly as the old regex did. The fixtures are wider now (RT-R6 a)
 * and that does not change the argument: fixtures can never be guaranteed to
 * exercise every branch, so the templates are the only sound source.
 *
 * AMBIGUITY IS A FAILURE, NOT A TIE TO BREAK. If a rendering matches two
 * templates, the deck cannot say which one an edit belongs to, and a returned
 * pass would be applied to a guess.
 */
import { describe, expect, it } from "vitest";
import { vocabularyStrings } from "./fixtures";
import { flawFamilies } from "@/content/flaw-families";
import { allChains, matchesFor } from "../../../scripts/template-match.mjs";

/** The rendered sentences the deck enumerates, deduplicated as the deck does. */
function renderings(): Map<string, string> {
  const seen = new Map<string, string>();
  for (const entry of vocabularyStrings()) {
    if (!entry.surface.startsWith("vocabulary/")) continue;
    if (entry.text.length < 40) continue;
    if (!seen.has(entry.text)) seen.set(entry.text, entry.surface);
  }
  return seen;
}

describe("every rendered sentence traces to one template", () => {
  const chains = allChains();
  const seen = renderings();

  it("found templates and renderings, so nothing below passes vacuously", () => {
    expect(chains.length).toBeGreaterThan(100);
    expect(seen.size).toBeGreaterThan(60);
  });

  it("matches each rendering to exactly one template", () => {
    const unmatched: string[] = [];
    const ambiguous: string[] = [];
    for (const [text, surface] of seen) {
      const hits = matchesFor(text, chains);
      if (hits.length === 0) unmatched.push(surface + " — " + text.slice(0, 70));
      else if (hits.length > 1) ambiguous.push(surface + " — matched " + hits.length);
    }
    expect(
      unmatched,
      "these rendered sentences trace to no template in src/content/vocabulary, so a deck keyed " +
        "to templates could not place an edit to them:",
    ).toEqual([]);
    expect(
      ambiguous,
      "these rendered sentences match more than one template, so an edit could not be placed " +
        "without guessing:",
    ).toEqual([]);
  });

  /**
   * THE COLLAPSE IS THE FINDING. Cowork estimated "roughly forty distinct
   * strings" behind the deck's sixty-nine ids by hand; this computes it. The
   * assertion is that renderings genuinely outnumber templates — if that ever
   * stopped being true the deck's one-id-one-sentence framing would be correct
   * and this whole apparatus would be unnecessary.
   */
  it("shows fewer templates than renderings, which is why ids had to change", () => {
    const templates = new Set<string>();
    for (const text of seen.keys()) {
      const hits = matchesFor(text, chains);
      if (hits.length === 1) templates.add(hits[0].text);
    }
    expect(templates.size).toBeGreaterThan(30);
    expect(templates.size).toBeLessThan(seen.size);
    console.log(
      "[trace] " + seen.size + " renderings <- " + templates.size + " templates, from " +
        chains.length + " chains",
    );
  });

  /** RT-R6 (a): the arc surface must show more than one flaw family. */
  it("exercises more than one flaw family in the arc fixtures", () => {
    /*
     * THE FAMILY NAMES ARE DERIVED, NOT TYPED. The first version listed them
     * on one line and `flaw-families.test.ts` failed it — correctly, because a
     * hand-typed roster of families is how a phantom fourth family reached four
     * published surfaces once. That guard is right and this reads the labels
     * from the module that owns them.
     */
    const arc = [...seen.keys()].filter((t) => t.indexOf("sittings") !== -1);
    const families = new Set<string>();
    for (const family of flawFamilies()) {
      const name = family.label.toLowerCase();
      if (arc.some((t) => t.indexOf(name) !== -1)) families.add(name);
    }
    expect(
      families.size,
      "every arc rendering shows one flaw family, so a writer never sees what the others say",
    ).toBeGreaterThan(1);
  });
});
