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
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { vocabularyStrings } from "./fixtures";
import { flawFamilies } from "@/content/flaw-families";
import { allChains, matcherFor, matchesFor } from "../../../scripts/template-match.mjs";

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

  /**
   * SENTENCES WHOSE TEMPLATE IS ENTIRELY SLOTS.
   *
   * `${critic}: ${description}` and `${name} — ${blurb}` carry no fixed text at
   * all, and a chain with no literal cannot identify anything — it would match
   * every string in the product. The extractor drops those by design, so the
   * renderings they produce trace to nothing. Their words are real and editable;
   * they live in the DATA modules, one field per sentence, and a writer edits
   * the field rather than the joining template.
   */
  const COMPOSED = ["comparison/critic-scales", "apparatus/lines"];

  it("matches each rendering to exactly one template", () => {
    const unmatched: string[] = [];
    const ambiguous: string[] = [];
    for (const [text, surface] of seen) {
      if (COMPOSED.some((prefix) => surface.indexOf(prefix) !== -1)) continue;
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

/**
 * PART 1 OF THE DECK SHOWS TEMPLATES, NOT RENDERINGS (E18/S16, RT-R7 a).
 *
 * The deck used to key each rendered string as its own editable sentence, with
 * braces produced by a regex over rendered numbers. That was wrong in both
 * directions: one template appeared as several ids, and the braces were not the
 * product's slots — a family name and an entire alternating clause were printed
 * as literals a writer was invited to rewrite.
 *
 * This holds the generated deck to the fix. Every quoted block in the
 * vocabulary part must be a template the extractor found in source, so a
 * rendering can never sneak back in as the editable unit.
 */
describe("the vocabulary deck is keyed to templates", () => {
  const deck = readFileSync("docs/copy-deck-vocabulary.md", "utf8");
  const NEWLINE = String.fromCharCode(10);

  const quoted = deck
    .split(NEWLINE)
    .filter((line) => line.startsWith("> "))
    .map((line) => line.slice(2).trim());

  it("found quoted blocks to check", () => {
    expect(quoted.length).toBeGreaterThan(30);
  });

  it("quotes only strings that exist in source as templates", () => {
    const known = new Set(allChains().map((chain) => chain.display.trim()));
    /*
     * THE ALL-SLOT COMPOSED LINES ARE THE EXCEPTION, for the reason given
     * above: `${critic}: ${description}` has no fixed text, so the extractor
     * drops it and the deck keys the rendering instead. Their words live one
     * field per sentence in the data modules, which the section rules say.
     */
    const composed = (block: string) =>
      block.startsWith("Pitchfork:") ||
      block.startsWith("Robert Christgau") ||
      block.indexOf(" — ") > 0 && /^[A-Z][A-Za-z0-9 .()-]+ — /.test(block);
    const strangers = quoted.filter((block) => !known.has(block) && !composed(block));
    expect(
      strangers.map((s) => s.slice(0, 70)),
      "these blocks in the vocabulary deck are not templates found in source — a rendering has " +
        "been keyed as the editable unit again:",
    ).toEqual([]);
  });

  /**
   * THE CASE THAT STARTED IT. `${label}` renders as a flaw family and `${floor}`
   * as a whole multiple; the old deck printed the first as a literal and split
   * the second into `{n}.5x`. Both must now appear as slots.
   */
  it("shows the arc template's slots rather than one rendering of them", () => {
    const arc = quoted.filter((block) => block.indexOf("sittings") !== -1);
    expect(arc.length).toBeGreaterThan(2);
    const withLabel = arc.filter((block) => block.indexOf("${label}") !== -1);
    expect(withLabel.length, "no arc template shows ${label} as a slot").toBeGreaterThan(0);
    /*
     * DERIVED AGAIN, AND I TYPED THEM AGAIN. This assertion listed two family
     * names in one regex and `flaw-families.test.ts` failed it -- the second
     * time in this session, in a test whose subject is derived-versus-typed
     * rosters. The guard is right both times.
     */
    for (const block of withLabel) {
      for (const family of flawFamilies()) {
        expect(
          block.indexOf("your " + family.label.toLowerCase() + " sittings"),
          "a flaw family is printed as a literal where the template has a slot",
        ).toBe(-1);
      }
    }
    expect(
      quoted.some((block) => block.indexOf("${floor}") !== -1),
      "no template shows ${floor} as a slot; the old deck split it into {n}.5x",
    ).toBe(true);
  });
});

/**
 * NO PROSE TEMPLATE GOES UNRENDERED WITHOUT A REASON (E18/S17, RT-R9 a).
 *
 * Cowork found eight live sentences in no deck by reading source. A census of
 * the extracted templates found TWENTY-NINE, including two whole modules —
 * `comparison.ts` and `apparatus.ts` — that had no fixtures at all.
 *
 * THE E18/S8 GUARD COULD NOT SEE THEM, and that is the lesson. It checks that
 * every surface the vocabulary layer RENDERS has a deck section. A module with
 * no fixtures renders nothing, so it produced no surface, so a guard written to
 * catch missing sections was blind to the modules missing entirely. Checking
 * rendered output against a deck cannot find copy that never rendered; only
 * checking the MODULES can.
 *
 * A template may still be unrendered — a branch a simulated listener never
 * reaches, or a string that is not user-facing at all — but it has to be named
 * here with a reason, so the list is a decision rather than an oversight.
 */
describe("every prose template is reachable, or listed as not", () => {
  const SLOT = String.fromCharCode(1);

  /** Unrendered on purpose. Each entry says why, and each is a debt. */
  const ALLOWED = [
    {
      match: "numberWord: expected a non-negative integer",
      why: "a thrown Error, not user-facing copy — it reaches a developer, never a reader",
    },
    {
      match: "Your ratings moved the same amount either way",
      why:
        "directionLine's third shape, reached only when the two means are exactly equal. No " +
        "fixture produces that and constructing one would pin an arithmetic coincidence.",
    },
    {
      match: "What I found in 18000 Pitchfork album reviews",
      why:
        "the TITLE of a cited source, not a sentence this product wrote. It is a field in a " +
        "citation record and is rendered as an attribution wherever the citation appears; " +
        "rewriting it would be misquoting someone else's article.",
    },
  ];

  it("lists only templates that are genuinely unrendered", () => {
    const rendered = [
      ...new Set(
        vocabularyStrings()
          .filter((entry) => entry.surface.startsWith("vocabulary/"))
          .map((entry) => entry.text),
      ),
    ];
    const unreached = allChains().filter((chain) => {
      const literal = chain.text.split(SLOT).join("").trim();
      if (literal.length < 45 || literal.indexOf(" ") === -1) return false;
      const re = matcherFor(chain.text);
      if (rendered.some((text) => re.test(text))) return false;
      // A fragment spliced into a larger template is reached inside it.
      const runs = chain.text.split(SLOT).map((r) => r.trim()).filter((r) => r.length > 24);
      if (runs.length > 0 && runs.every((run) => rendered.some((t) => t.indexOf(run) !== -1))) return false;
      return true;
    });

    const unexplained = unreached.filter(
      (chain) => !ALLOWED.some((a) => chain.display.indexOf(a.match) !== -1),
    );
    expect(
      unexplained.map((c) => c.file.split("/").pop() + ": " + c.display.slice(0, 70)),
      "these prose templates are live in the code and no fixture renders them, so they appear in " +
        "no deck and no writer will ever see them. Add a fixture that reaches the branch, or list " +
        "it in ALLOWED with a reason:",
    ).toEqual([]);

    // And the list may not rot: an entry that no longer matches anything is a
    // reason kept for a template that has moved on.
    const stale = ALLOWED.filter((a) => !unreached.some((c) => c.display.indexOf(a.match) !== -1));
    expect(stale.map((a) => a.match), "ALLOWED excuses templates that are now reachable:").toEqual([]);
  });

  /** The two modules that had no fixtures at all now render. */
  it("renders the modules that were in no deck", () => {
    const surfaces = new Set(
      vocabularyStrings()
        .filter((e) => e.surface.startsWith("vocabulary/"))
        .map((e) => e.surface.split("/")[1]),
    );
    expect(surfaces.has("comparison"), "comparison.ts renders nothing").toBe(true);
    expect(surfaces.has("apparatus"), "apparatus.ts renders nothing").toBe(true);
  });
});

/**
 * EVERY SURFACE SAYS WHAT RENDERS WITH IT (E18/S18, from Cowork's second return).
 *
 * Three of Cowork's twenty-four batch-1 edits existed only because it had read
 * the assembly functions and found sentences repeating each other inside one
 * block — a writer with the deck alone could not have caught any of them. It
 * called this the highest-value addition to the brief, and it also said the
 * scoping was too large: the assemblers already return each block as an ORDERED
 * ARRAY, so the order is the adjacency and one line per surface carries it.
 */
describe("the deck says what each sentence renders beside", () => {
  const source = readFileSync("scripts/export-copy-deck.mjs", "utf8");
  const deck = readFileSync("docs/copy-deck-vocabulary.md", "utf8");

  it("gives every surface an adjacency line", () => {
    const keys = source.split('key: "').slice(1).map((part) => part.split('"')[0]);
    expect(keys.length).toBeGreaterThan(7);
    const alongside = deck.split("**What renders with it, in order.**").length - 1;
    expect(
      alongside,
      "some surfaces do not say what renders with them, so a writer cannot see repetition inside " +
        "a block — which is how three sentences repeated each other in shipped copy",
    ).toBe(keys.length);
  });

  /**
   * The chart is a DIFFERENT defect from adjacency, as Cowork pointed out: a
   * deck that enumerates strings will never contain an SVG however good the
   * adjacency data gets. It needs a hand-written line, and the sentence that
   * referred to "the line above" is the reason.
   */
  it("names the non-text a reader sees on the expert panel", () => {
    expect(deck).toContain("Not text, and not in this deck.");
    expect(deck).toContain("DASHED DIAGONAL");
    expect(deck, "the Brier sentence still refers to a line the deck never describes").not.toContain(
      "the distance from the line above",
    );
  });
});
