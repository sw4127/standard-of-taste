/**
 * ONE ID PER TEMPLATE, AND EVERY SECTION KEEPS A HANDLE (E19/S9).
 *
 * WHAT WENT WRONG. The instrument deck shows a template one branch at a time —
 * "the band, at every branch a reader can reach" — and the assembler minted a
 * fresh id and an editable state for every LINE. Six renderings of one sentence
 * arrived as six independently editable strings. A writer rewrites it six times
 * and the last edit silently overwrites the other five. Cowork reported this in
 * the vocabulary deck and predicted it here; measuring found 15 of 63 sentences
 * in that batch were renderings of 5 templates.
 *
 * AND THE FIRST FIX BROKE SOMETHING WORSE. Tagging the assembled block as a
 * demonstration removed its ids — and its parts were emitted as BOLD LABELS,
 * which the assembler never treated as reviewable, so the flaw line vanished
 * from the deck entirely. A duplicated sentence wastes a writer's time; a
 * missing one cannot be edited at all. The second test here exists because of
 * that half hour.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { allChains, contentFiles, matchesFor } from "./template-match.mjs";

const NL = String.fromCharCode(10);
const DECK = "docs/copy-deck.md";
const CHAINS = allChains(contentFiles());

interface Owned {
  id: string;
  text: string;
}

/** Every line the deck hands an editable id to, with that id. */
function owned(): Owned[] {
  const out: Owned[] = [];
  let pending: string | null = null;
  for (const raw of readFileSync(DECK, "utf8").split(NL)) {
    const line = raw.trim();
    const marked = /^`([A-Z]+-[A-Z0-9-]+)` · (.+)$/.exec(line);
    if (marked) {
      pending = marked[2].startsWith("another rendering") ? null : marked[1];
      continue;
    }
    if (pending !== null && line.length >= 40) {
      out.push({ id: pending, text: line.replace(/^> /, "") });
      pending = null;
    }
  }
  return out;
}

describe("the copy deck keys sentences to templates", () => {
  const rows = owned();

  it("found ids and templates, so nothing below passes vacuously", () => {
    expect(rows.length).toBeGreaterThan(150);
    expect(CHAINS.length).toBeGreaterThan(500);
  });

  /**
   * THE DEFECT ITSELF. Two ids resolving to one source template means one
   * string is presented as two editable sentences.
   *
   * MATCHED AGAINST PARSED `${...}` TEMPLATES, never against rendered numbers.
   * The digit-wildcard version was measured in E18/S16 and was wrong in both
   * directions — it split one template whenever a non-numeric slot varied, and
   * merged unrelated text that happened to share a shape.
   */
  it("gives one template one id", () => {
    const byTemplate = new Map<string, Set<string>>();
    for (const row of rows) {
      const hits = matchesFor(row.text, CHAINS);
      if (hits.length !== 1) continue; // refuses rather than guessing
      const key = hits[0].display;
      if (!byTemplate.has(key)) byTemplate.set(key, new Set());
      byTemplate.get(key)!.add(row.id);
    }
    expect(byTemplate.size, "no deck line matched a source template at all").toBeGreaterThan(3);
    const split = [...byTemplate.entries()]
      .filter(([, ids]) => ids.size > 1)
      .map(([key, ids]) => `${[...ids].join(" + ")} :: ${key.slice(0, 60)}`);
    expect(
      split,
      "these ids are the SAME string rendered differently — a writer rewrites it once per id and " +
        "the last edit silently wins:",
    ).toEqual([]);
  });

  /**
   * THE OTHER DIRECTION, WHICH I SHIPPED FOR HALF AN HOUR. A section whose
   * copy is real but carries no id cannot be edited at all, and nothing said
   * so: the deck simply stopped listing the flaw line.
   */
  it("leaves no section of product copy without a handle", () => {
    /*
     * SPLIT ON THE LEVEL THE ASSEMBLED DOCUMENT ACTUALLY USES. It demotes every
     * per-deck heading by one when it concatenates them, so the surfaces are
     * `###` here and `##` in the files they came from. The first version of
     * this test split on `##`, found two sections, and would have passed on any
     * deck at all — which is why the count is asserted before the check.
     */
    const sections = readFileSync(DECK, "utf8").split(NL + "### ").slice(1);
    expect(sections.length, "the split found almost no sections, so this checks nothing").toBeGreaterThan(10);
    const mute: string[] = [];
    for (const section of sections) {
      const heading = section.split(NL)[0].trim();
      const body = section.split(NL).slice(1);
      const hasCopy = body.some((l) => l.trim().startsWith("> ") || l.trim().startsWith("```"));
      const hasId = body.some((l) => /^`[A-Z]+-[A-Z0-9-]+` · /.test(l.trim()));
      if (hasCopy && !hasId) mute.push(heading.slice(0, 64));
    }
    expect(
      mute,
      "these sections show copy a writer cannot return an edit for, because nothing in them " +
        "carries an id:",
    ).toEqual([]);
  });
});
