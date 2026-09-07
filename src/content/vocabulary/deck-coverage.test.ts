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
import { existsSync, readdirSync, readFileSync } from "node:fs";
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

/**
 * THE LEDGER KNOWS ABOUT EVERY SURFACE THE DECKS ENUMERATE (E18/S11, RT-Q3 a).
 *
 * `docs/copy-review-ledger.md` answers "has anyone ever written this" per
 * surface. It replaces a per-sentence NEW marker whose baseline made 182 of 216
 * sentences render as reviewed when almost none are — an error that came from
 * assuming the PM performs the pass. It is Cowork's, and Cowork has seen none
 * of this.
 *
 * A LEDGER IS ONLY WORTH ANYTHING IF IT CANNOT MISS A SURFACE. Both sides are
 * derived from the generated decks, so a new surface arrives in the table marked
 * "never" rather than silently absent, and a row for a surface that no longer
 * exists fails too.
 */
describe("the review ledger accounts for every surface", () => {
  const DECK_FILES = [
    "docs/copy-deck-vocabulary.md",
    "docs/copy-deck-instruments.md",
    "docs/copy-deck-pages.md",
    "docs/copy-deck-method.md",
  ];

  const surfaces = DECK_FILES.flatMap((file) =>
    readFileSync(file, "utf8")
      .split(String.fromCharCode(10))
      .filter((line) => line.startsWith("## ") && line.indexOf("How to use") === -1)
      .map((line) => line.slice(3).trim()),
  );

  const ledger = readFileSync("docs/copy-review-ledger.md", "utf8");

  it("found surfaces to check, so this cannot pass vacuously", () => {
    expect(surfaces.length).toBeGreaterThan(20);
    expect(ledger.length).toBeGreaterThan(1000);
  });

  it("has a row for every surface in every deck", () => {
    const missing = surfaces.filter((s) => !ledger.includes("| " + s + " |"));
    expect(
      missing,
      "docs/copy-review-ledger.md has no row for these surfaces, so they would be commissioned " +
        "blind. Regenerate it: node scripts/export-copy-decks.mjs",
    ).toEqual([]);
  });

  it("has no row for a surface that no longer exists", () => {
    const rows = ledger
      .split(String.fromCharCode(10))
      .filter((line) => line.startsWith("| ") && line.indexOf("---") === -1 && line.indexOf("| Part |") === -1)
      .map((line) => line.split(" | ")[1])
      .filter((name) => typeof name === "string" && name.length > 0);
    expect(rows.length).toBe(surfaces.length);
    const orphans = rows.filter((name) => !surfaces.includes(name));
    expect(orphans, "the ledger lists surfaces the decks no longer enumerate:").toEqual([]);
  });

  /**
   * THE HEADLINE IS A COUNT AND COUNTS GO STALE. It is derived in the generator,
   * but a stale committed file would still show the old one, and "0 of 27" is
   * the sentence a reader acts on.
   */
  it("states a total that matches the decks", () => {
    expect(ledger.includes("of " + surfaces.length + " surfaces in the decks")).toBe(true);
  });

  /** The stamp that made unreviewed copy look reviewed is gone for good. */
  it("carries no reviewed-stamp file", () => {
    expect(existsSync("docs/copy-deck-reviewed.txt")).toBe(false);
    expect(readFileSync("scripts/export-copy-decks.mjs", "utf8").includes("copy-deck-reviewed")).toBe(false);
  });
});

/**
 * EVERY SENTENCE HAS AN ID AND A STATE (E18/S12, PM ruling RT-Q6 a).
 *
 * The deck exists to be handed to Cowork and to have edits handed back. Without
 * an id per sentence, 235 returned lines have to be matched to their originals
 * by eye, which is where errors enter. Without a state per sentence, a writer
 * edits the clip blurbs — which are not copy at all but the Prestige Test's
 * INDEPENDENT VARIABLE, where a changed word is a pool change that invalidates
 * every stored response.
 */
describe("the deck is commissionable", () => {
  const deck = readFileSync("docs/copy-deck.md", "utf8");
  const lines = deck.split(String.fromCharCode(10));
  const TAG = "` · ";

  /*
   * A REPEATED ID IS NOW LEGAL, AND SAYING SO IS THE POINT (E19/S9).
   *
   * These tests were written when one id meant one LINE. The deck now mints one
   * id per TEMPLATE: where the same sentence is shown again at another branch,
   * the line carries the id it belongs to and is marked as a further rendering.
   * That is a strengthening of the rule these tests exist for — one id, one
   * editable string — not a violation of it, so the NEEDLE moves and the rule
   * does not. Pasting the new shape in without deciding which of those it was
   * is the trap this project has a standing note about.
   *
   * `tags` therefore means "lines that MINT an id". The repeats are checked
   * separately, and both directions are enforced: a repeat must be marked, and
   * a marked line must repeat an id that exists.
   */
  const REPEAT = "another rendering";

  const tagged = lines
    .map((line, at) => ({ line, at }))
    .filter((row) => row.line.startsWith("`") && row.line.indexOf(TAG) !== -1)
    .map((row) => ({
      at: row.at,
      id: row.line.slice(1, row.line.indexOf(TAG)),
      state: row.line.slice(row.line.indexOf(TAG) + TAG.length).trim(),
    }));

  const repeats = tagged.filter((t) => t.state.startsWith(REPEAT));
  const tags = tagged.filter((t) => !t.state.startsWith(REPEAT));

  it("found tags, so nothing below passes vacuously", () => {
    expect(tags.length).toBeGreaterThan(200);
  });

  it("mints every id exactly once", () => {
    const seen = tags.map((t) => t.id);
    const duplicates = seen.filter((id, at) => seen.indexOf(id) !== at);
    expect(
      [...new Set(duplicates)],
      "two DIFFERENT sentences share an id, so a returned edit is ambiguous:",
    ).toEqual([]);
  });

  /**
   * The other half of the same rule. A line reusing an id must say it is a
   * further rendering — otherwise it reads as a second editable sentence, which
   * is the defect — and the id it reuses must have been minted somewhere, or it
   * points at nothing.
   */
  it("attaches every repeated id to a sentence that exists", () => {
    const minted = new Set(tags.map((t) => t.id));
    const orphans = repeats.filter((r) => !minted.has(r.id));
    expect(orphans.map((r) => r.id), "these repeats name an id no sentence owns:").toEqual([]);
    for (const repeat of repeats) {
      expect(
        repeat.state,
        `${repeat.id} reuses an id without telling the writer not to edit it twice`,
      ).toContain("edit it once");
    }
  });

  it("uses only the four declared states", () => {
    const allowed = ["OPEN", "LOCKED", "PART-LOCKED", "PASSED"];
    const strange = [...new Set(tags.map((t) => t.state))].filter((s) => allowed.indexOf(s) === -1);
    expect(strange, "undeclared sentence states:").toEqual([]);
  });

  it("tags a sentence, not a blank line", () => {
    const orphans = tags.filter((t) => {
      let next = t.at + 1;
      while (next < lines.length && lines[next].trim() === "") next += 1;
      const target = lines[next] || "";
      return !target.startsWith(">") && target.trim().length < 40;
    });
    expect(orphans.map((t) => t.id), "these ids label nothing:").toEqual([]);
  });

  /**
   * THE LOCK THAT MATTERS MOST, CHECKED AGAINST THE POOL RATHER THAN A NUMBER.
   * Every scored clip blurb must be LOCKED; if the pool grows and a blurb
   * arrives unlocked, a writer is invited to edit the instrument.
   */
  it("locks every clip blurb", () => {
    const locked = tags.filter((t) => t.id.startsWith("INS-CLIP-BLURBS-"));
    expect(locked.length).toBeGreaterThan(10);
    const unlocked = locked.filter((t) => t.state !== "LOCKED");
    expect(unlocked.map((t) => t.id), "a clip blurb is editable; it is the independent variable:").toEqual([]);
  });

  it("marks the one passed batch as passed, not as work", () => {
    const passed = tags.filter((t) => t.state === "PASSED");
    expect(passed.length).toBeGreaterThan(0);
    for (const t of passed) expect(t.id.startsWith("INS-DELICACY-DETECTION-"), t.id).toBe(true);
  });

  /** A quoted /method span is verified word for word by a test elsewhere. */
  it("part-locks the /method blocks that carry quotations", () => {
    const method = tags.filter((t) => t.id.startsWith("MET-"));
    expect(method.length).toBeGreaterThan(10);
    expect(method.some((t) => t.state === "PART-LOCKED")).toBe(true);
  });

  /** The worked example in the header must be an id the document contains. */
  it("cites a real id in its own instructions", () => {
    const header = deck.slice(0, deck.indexOf("## Contents"));
    const cited = header.split("Return edits keyed on the id — `")[1];
    expect(cited, "the header no longer shows a worked example").toBeTruthy();
    const example = cited.split("`")[0];
    expect(tags.map((t) => t.id), "the header teaches an id that does not exist").toContain(example);
  });
});

/**
 * THE BRIEF'S NUMBERS MATCH THE DECK IT DESCRIBES (E18/S13, RT-Q3 a).
 *
 * `docs/copy-commission.md` is the artefact handed to a writer, and it tells
 * them how much work each batch is. A brief whose batch sizes disagree with the
 * document it describes is the stale-document defect this session has now fixed
 * four times, and here it would be discovered by the writer rather than by us.
 */
describe("the commission brief agrees with the deck", () => {
  const deck = readFileSync("docs/copy-deck.md", "utf8");
  const brief = readFileSync("docs/copy-commission.md", "utf8");
  const TAG = "` · ";

  const tags = deck
    .split(String.fromCharCode(10))
    .filter((line) => line.startsWith("`") && line.indexOf(TAG) !== -1)
    .map((line) => ({
      id: line.slice(1, line.indexOf(TAG)),
      state: line.slice(line.indexOf(TAG) + TAG.length).trim(),
    }))
    /*
     * A FURTHER RENDERING IS NOT A SENTENCE (E19/S9). The deck mints one id per
     * TEMPLATE and shows the same string again where it renders at another
     * branch. Counting those made the brief claim a batch was 61 sentences when
     * 50 are editable, and this guard -- whose whole job is to catch the brief
     * disagreeing with the deck -- agreed with it, because both were counting
     * the same lines twice. The RULE is unchanged; the needle now expresses it.
     */
    .filter((tag) => !tag.state.startsWith("another rendering"));

  it("found a brief and a deck to compare", () => {
    expect(tags.length).toBeGreaterThan(200);
    expect(brief.length).toBeGreaterThan(3000);
  });

  /*
   * THE ROWS ARE PARSED AND COMPARED IN ORDER, not searched for as substrings.
   * The first version asked whether " | 69 | " appeared anywhere in the brief.
   * It always does: the row is "| 1 | The reading layer | 69 | 69 | 0 |", so the
   * Open column answers for the Sentences column and changing one of them left
   * the guard green. Reverse-testing found that, not review.
   */
  it("states each batch's size as the deck actually has it", () => {
    const PREFIXES = ["VOC-", "PAGE-", "INS-", "MET-"];
    const rows = brief
      .split(String.fromCharCode(10))
      .filter((line) => line.startsWith("| ") && line.indexOf("---") === -1)
      .map((line) => line.split("|").map((cell) => cell.trim()))
      .filter((cells) => /^[0-9]+$/.test(cells[1] || ""));
    expect(rows.length, "the brief has no batch table").toBe(PREFIXES.length);
    const wrong: string[] = [];
    PREFIXES.forEach((prefix, at) => {
      const n = tags.filter((t) => t.id.startsWith(prefix)).length;
      const open = tags.filter(
        (t) => t.id.startsWith(prefix) && (t.state === "OPEN" || t.state === "PART-LOCKED"),
      ).length;
      expect(n, prefix + " has no sentences").toBeGreaterThan(0);
      if (rows[at][3] !== String(n)) wrong.push(prefix + " sentences: says " + rows[at][3] + ", deck has " + n);
      if (rows[at][4] !== String(open)) wrong.push(prefix + " open: says " + rows[at][4] + ", deck has " + open);
    });
    expect(wrong, "the brief's batch table disagrees with the deck:").toEqual([]);
  });

  it("states each state's count as the deck actually has it", () => {
    for (const state of ["OPEN", "LOCKED", "PART-LOCKED", "PASSED"]) {
      const n = tags.filter((t) => t.state === state).length;
      expect(
        brief.includes("**" + state + "** (" + n + ")"),
        "the brief says the wrong number of " + state + " sentences; the deck has " + n,
      ).toBe(true);
    }
  });

  /**
   * The return-format worked examples must be ids the deck contains.
   *
   * LINE ENDINGS ARE NORMALISED FIRST. The generator writes LF and git hands
   * this repository CRLF on checkout, so matching on a bare newline made this
   * pass or fail depending on how the file had been written last -- which it
   * did, in the middle of reverse-testing something else.
   */
  it("shows a return format keyed on real ids", () => {
    const flat = brief.split(String.fromCharCode(13)).join("");
    const NEWLINE = String.fromCharCode(10);
    const shown = tags.map((t) => t.id).filter((id) => flat.includes(NEWLINE + id + NEWLINE));
    expect(shown.length, "the brief's return-format examples are not real ids").toBeGreaterThan(1);
  });

  it("names the rules that are not style, and the anti-clone clause", () => {
    for (const needle of ["D1 —", "N3 —", "no leaderboard", "independent variable"]) {
      expect(brief.toLowerCase().includes(needle.toLowerCase()), "the brief omits: " + needle).toBe(true);
    }
  });
});
