/**
 * EVERY SURFACE THE VOCABULARY LAYER RENDERS HAS A SECTION IN THE COPY DECK
 * (E18/S8).
 *
 * WHAT WENT WRONG. `scripts/export-copy-deck.mjs` groups the corpus by a TYPED
 * LIST of surface keys. The Ranking Test shipped in E17 and added thirteen
 * sentences under `vocabulary/spread/`; no section claimed that prefix, so the
 * exporter dropped all thirteen on the floor. Silently — the deck's own footer
 * went on saying "131 concrete sentences across 5 surfaces" as though that were
 * the whole product. Regenerating the deck did not help, because the omission
 * was in the grouping rather than in the data.
 *
 * That is the failure this repository keeps paying for: a hand-written roster
 * cannot see a new thing. Four guards in E17 held one and stayed green while the
 * product outgrew them.
 *
 * WHICH SIDE IS DERIVED MATTERS. The corpus side is computed from
 * `vocabularyStrings()`, the same fixtures the voice gate runs over; the script
 * side is the typed list being checked. A new surface therefore fails this the
 * day it ships, which is the point — and an obsolete key fails it too, so a
 * section for a surface that no longer renders cannot sit in the deck telling
 * the PM to review sentences nobody sees.
 *
 * IT SCANS THE SCRIPT AS TEXT, which is the weak part and is deliberate. The
 * exporter runs its whole pipeline at import — it spawns a vitest process to
 * reach the TypeScript modules — so importing it from a test would run the
 * export. The scan asserts it FOUND keys before comparing, because a regex that
 * matches nothing would pass this test while checking nothing at all.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { vocabularyStrings } from "./fixtures";

const SCRIPT = "scripts/export-copy-deck.mjs";
const PREFIX = "vocabulary/";

/** Surface keys the corpus actually produces, e.g. "threshold", "spread". */
function surfacesRendered(): string[] {
  const keys = new Set<string>();
  for (const entry of vocabularyStrings()) {
    if (!entry.surface.startsWith(PREFIX)) continue;
    const rest = entry.surface.slice(PREFIX.length);
    const cut = rest.indexOf("/");
    keys.add(cut < 0 ? rest : rest.slice(0, cut));
  }
  return [...keys].sort();
}

/** Surface keys the deck exporter groups by. */
function surfacesInDeck(): string[] {
  const source = readFileSync(SCRIPT, "utf8");
  const keys: string[] = [];
  // `key: "…"`, the shape every SECTIONS entry uses.
  const pattern = /key:\s*"([a-z-]+)"/g;
  let hit = pattern.exec(source);
  while (hit !== null) {
    keys.push(hit[1]);
    hit = pattern.exec(source);
  }
  return keys.sort();
}

describe("the copy deck covers every surface the product renders", () => {
  it("found keys on both sides, so neither list is vacuously empty", () => {
    expect(surfacesRendered().length).toBeGreaterThan(4);
    expect(surfacesInDeck().length).toBeGreaterThan(4);
  });

  it("groups by exactly the surfaces the vocabulary layer produces", () => {
    const rendered = surfacesRendered();
    const deck = surfacesInDeck();
    const missing = rendered.filter((k) => !deck.includes(k));
    const obsolete = deck.filter((k) => !rendered.includes(k));
    expect(
      missing,
      "these surfaces render sentences that no deck section claims, so the export drops them:",
    ).toEqual([]);
    expect(
      obsolete,
      "the deck has sections for surfaces that render nothing:",
    ).toEqual([]);
  });

  it("names the Ranking Test, whose absence is why this exists", () => {
    expect(surfacesRendered()).toContain("spread");
    expect(surfacesInDeck()).toContain("spread");
  });

  /**
   * THE OTHER HALF: A SECTION CAN EXIST AND THE FILE CAN STILL BE STALE.
   *
   * The committed deck sat ten days behind the code with every check green,
   * because nothing compared the artifact to the corpus. A section for a
   * surface proves the exporter would emit it; it does not prove anybody ran
   * the exporter. This asserts the FILE contains a sentence each surface
   * actually renders.
   *
   * IT CHECKS ONE SENTENCE PER SURFACE, NOT ALL OF THEM, and that limit is
   * deliberate rather than lazy: the deck collapses interpolated values into
   * `{n}` slots, so a sentence carrying a number cannot be matched verbatim
   * against its rendered form. A digit-free sentence can, and one per surface
   * is enough to catch a file that predates a surface's copy — which is the
   * failure that actually happened.
   */
  it.each([
    ["docs/copy-deck-vocabulary.md", "node scripts/export-copy-deck.mjs > docs/copy-deck-vocabulary.md"],
    // THE ASSEMBLED DOCUMENT IS THE READING SURFACE (E18/S9), so it can go
    // stale in exactly the same way and for the same cost. Both are checked,
    // and one command regenerates both.
    ["docs/copy-deck.md", "node scripts/export-copy-decks.mjs"],
  ])("%s contains sentences the product renders now", (file, command) => {
    const deck = readFileSync(file, "utf8");
    const bySurface = new Map<string, string[]>();
    for (const entry of vocabularyStrings()) {
      if (!entry.surface.startsWith(PREFIX)) continue;
      const rest = entry.surface.slice(PREFIX.length);
      const cut = rest.indexOf("/");
      const key = cut < 0 ? rest : rest.slice(0, cut);
      if (!/[0-9]/.test(entry.text) && entry.text.length > 60) {
        const held = bySurface.get(key) ?? [];
        held.push(entry.text);
        bySurface.set(key, held);
      }
    }
    // The scan must have found something to check, on enough surfaces to mean
    // anything, or this passes by having nothing to look at.
    expect(bySurface.size).toBeGreaterThan(4);
    const absent: string[] = [];
    for (const [key, texts] of bySurface) {
      const longest = texts.sort((a, b) => b.length - a.length)[0];
      if (!deck.includes(longest.slice(0, 60))) absent.push(key + ": " + longest.slice(0, 60));
    }
    expect(
      absent,
      file + " is stale — these surfaces render sentences it does not contain. Regenerate it: " + command,
    ).toEqual([]);
  });
});
