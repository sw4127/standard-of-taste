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
import { readdirSync, readFileSync } from "node:fs";
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

/**
 * EVERY PAGE IN THE READING ROOM APPEARS IN THE PAGE DECK (E18/S10, RT-P9 a).
 *
 * The page deck is the only one built from components rather than from content
 * modules, so its completeness cannot be checked against a corpus function.
 * It is checked against the FILESYSTEM instead, which is the same principle:
 * the side that says what exists is derived, and the deck is what has to keep
 * up. A new reading-room page fails this the day it ships.
 */
describe("the page deck covers every page in the reading room", () => {
  const deck = readFileSync("docs/copy-deck-pages.md", "utf8");

  const learnRoutes = readdirSync("src/app/learn", { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => "/learn/" + entry.name);

  it("found pages on disk, so this cannot pass vacuously", () => {
    expect(learnRoutes.length).toBeGreaterThan(6);
    expect(deck.length).toBeGreaterThan(5000);
  });

  it("has a section for every reading-room page, plus /legal and the flow", () => {
    const missing = learnRoutes.filter((route) => !deck.includes("## `" + route + "`"));
    expect(
      missing,
      "docs/copy-deck-pages.md has no section for these pages. Regenerate it: " +
        "node scripts/export-copy-decks.mjs",
    ).toEqual([]);
    expect(deck.includes("## `/legal`")).toBe(true);
    expect(deck.includes("src/app/spread/SpreadFlow.tsx")).toBe(true);
  });

  /**
   * THE EXTRACTOR CAN SILENTLY YIELD NOTHING. A page whose markup changes shape
   * -- a paragraph rendered by a helper rather than a `<p>` -- would produce an
   * empty section and the deck would still look complete. Every section has to
   * carry either a quoted line or the note saying its words come from a module.
   */
  it("no section is empty", () => {
    const sections = deck.split("## `").slice(1);
    const hollow = sections
      .filter((s) => !s.includes(String.fromCharCode(10) + ">") && !s.includes("filled entirely from content modules"))
      .map((s) => s.split("`")[0]);
    expect(hollow, "these page-deck sections extracted no copy at all:").toEqual([]);
  });

  /** A sentence that is on the page today must be in the deck today. */
  it("is not stale", () => {
    const onScreen = "A critic ranked these works";
    expect(readFileSync("src/app/spread/SpreadFlow.tsx", "utf8").includes(onScreen)).toBe(true);
    expect(deck.includes(onScreen), "docs/copy-deck-pages.md is stale").toBe(true);
    expect(readFileSync("docs/copy-deck.md", "utf8").includes(onScreen)).toBe(true);
  });
});

/**
 * THE EXTRACTOR CAN GO PARTIALLY BLIND, AND "NO SECTION IS EMPTY" WOULD NOT SEE
 * IT (E18/S10).
 *
 * That guard catches a page that yields nothing. It does not catch a page that
 * used to yield eight paragraphs and now yields three -- markup rearranged, a
 * paragraph moved into a helper component, a tag this scanner does not know.
 * The deck would still look complete and the PM would review two thirds of a
 * page believing it was the whole one.
 *
 * SO THE COUNT IS COMPARED TO THE SOURCE. Blocks in the deck plus blocks
 * declared as module-filled must account for most of the block-level tags in
 * the component. The threshold is deliberately loose -- a page can legitimately
 * hold a tag this scanner skips -- because the failure being caught is a large
 * silent loss, not an off-by-one.
 */
describe("the page extractor has not gone partially blind", () => {
  const deck = readFileSync("docs/copy-deck-pages.md", "utf8");

  const surfaceFiles = readdirSync("src/app/learn", { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({ route: "/learn/" + entry.name, file: "src/app/learn/" + entry.name + "/page.tsx" }))
    .concat([{ route: "/legal", file: "src/app/legal/page.tsx" }]);

  it("accounts for most of each page's block tags", () => {
    expect(surfaceFiles.length).toBeGreaterThan(6);
    const thin: string[] = [];
    for (const surface of surfaceFiles) {
      const source = readFileSync(surface.file, "utf8");
      const opens =
        source.split(String.fromCharCode(60) + "p").length - 1 +
        (source.split(String.fromCharCode(60) + "li").length - 1);
      if (opens < 3) continue;
      const start = deck.indexOf("## `" + surface.route + "`");
      expect(start, surface.route + " has no section").toBeGreaterThan(-1);
      const rest = deck.slice(start + 4);
      const nextAt = rest.indexOf("## `");
      const section = nextAt === -1 ? rest : rest.slice(0, nextAt);
      const quoted = section.split(String.fromCharCode(10) + "> ").length - 1;
      /*
       * READ THE NUMBER BACKWARDS FROM THE PHRASE, not by splitting on "*".
       * The first version split the section on asterisks and took the second
       * field, which is `Edits land in` — every section carries bold markers
       * before the note. It scored /learn/flaws at 2 of 5 and reported the
       * extractor blind on a page it had handled correctly.
       */
      const noteAt = section.indexOf(" further block");
      let digits = "";
      for (let k = noteAt - 1; k >= 0 && section[k] >= "0" && section[k] <= "9"; k -= 1) {
        digits = section[k] + digits;
      }
      const fromModules = noteAt === -1 ? 0 : Number(digits) || 0;
      if (quoted + fromModules < Math.ceil(opens / 2)) {
        thin.push(surface.route + ": " + (quoted + fromModules) + " accounted for, " + opens + " in the source");
      }
    }
    expect(
      thin,
      "the page extractor is missing most of these pages' copy — its scanner has gone stale " +
        "against the markup. Check scripts/export-page-deck.mjs:",
    ).toEqual([]);
  });
});
