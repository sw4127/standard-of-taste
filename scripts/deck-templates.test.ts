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
// ONE IMPLEMENTATION OF "can a writer's edit land", not two. The first version
// of the guard below re-derived it, mis-stripped the deck's own labels, and
// reported twenty-nine live strings as hand-typed.
import { trace } from "./deck-source-trace.mjs";

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

/**
 * A DECK LINE THAT IS IN NO SOURCE FILE (E20/S2).
 *
 * WHAT WENT WRONG. `NotBuiltYet` was deleted on 2026-09-02 when the fifth
 * criterion got an instrument. Its two sentences stayed in the copy deck for
 * eight days, under a preamble promising every string below is live in the
 * product today, because that section was HAND-TYPED into the exporter instead
 * of read from the module. Nothing was asking the question, so nobody could
 * have been told; it was found by writing the census that asks it.
 *
 * THIS IS THE PART 2 GUARD ONLY, and the scope is a fact rather than a choice.
 * Chains are parsed from the content modules, so Part 3 -- whose copy is
 * written inline in JSX -- cannot be matched at all and would report thirty-one
 * live strings as absent. A guard extended past what it can see does not become
 * broader, it becomes wrong.
 */
/**
 * THE PARTS THIS GUARD CAN SPEAK FOR, AND WHY NOT THE OTHER ONE (E20/S3).
 *
 * Chains are parsed from the content modules, so a part whose copy is written
 * inline in JSX cannot be matched and would report thirty-one live strings as
 * absent. Part 3 is that part. Parts 2 and 4 have had their copy moved into
 * modules -- that was the work of E20 -- so they can be held to the whole
 * invariant. A guard extended past what it can see does not become broader, it
 * becomes wrong.
 *
 * THE COUNTS ARE CANARIES, NOT SPECIFICATIONS. They are expected to change when
 * a part gains or loses copy; the point is that it cannot change SILENTLY.
 * E20/S4 found that a lost handle -- a live string whose only id disappeared --
 * broke no test at all, because the section it sat in still had other ids.
 */
const COVERED = [
  { part: 2, name: "the instrument copy", ids: 49 },
  { part: 4, name: "the /method page", ids: 36 },
];

describe.each(COVERED)("Part $part, $name, shows the copy the product has", ({ part, ids }) => {
  const rows = trace(part);

  it("read the part, so nothing below passes vacuously", () => {
    expect(rows.length).toBeGreaterThan(20);
    expect(rows.filter((r) => r.verdict === "TEMPLATE").length).toBeGreaterThan(15);
  });

  it("prints no rendering, no glued pair and nothing hand-typed", () => {
    const wrong = rows
      .filter((r) => r.verdict !== "TEMPLATE")
      .map((r) => `${r.id}  [${r.verdict}]  ${r.note}  ::  ${r.text.slice(0, 64)}`);
    expect(
      wrong,
      "these ids do not show the string the product has. RESOLVED means the slots were filled in, " +
        "so rewriting it freezes a value that is supposed to move. ASSEMBLED means two source " +
        "strings share one id, so one of two edits lands nowhere. TYPED means the line is in no " +
        "source file at all, which is how a deleted component's copy stayed in this deck for " +
        "eight days:",
    ).toEqual([]);
  });

  it("still hands out the number of ids it did when this was written", () => {
    expect(
      rows.length,
      "this part's id count moved. If copy was added or removed deliberately, update the number in " +
        "COVERED and name the string in the commit message. If it was not deliberate, a live " +
        "sentence has just lost the only handle a writer could return an edit on, and nothing " +
        "else will say so.",
    ).toBe(ids);
  });
});

describe("the deck's hand-typed allowlist is empty and stays visible", () => {
  /*
   * THE ALLOWLIST IS EMPTY, AND IT REACHED EMPTY IN ONE SLICE (E20/S3). It held
   * the Prestige title, whose deck block was a pseudo-template an engineer
   * typed -- "<signed percentage> toward the labels" -- rather than the string
   * in `bias/copy.ts`. The exporters now THROW rather than printing a string no
   * content module contains, so the class is refused at the generator.
   *
   * An entry added back is a visible act in a diff, which is why the list stays
   * rather than being deleted with its last member.
   */
  const KNOWN_TYPED: string[] = [];
  const rows = COVERED.flatMap((c) => trace(c.part));

  it("keeps every allowlisted id real, so the list cannot hide an empty check", () => {
    const known = rows.filter((r) => KNOWN_TYPED.indexOf(r.id) !== -1);
    expect(
      known.length,
      "an allowlisted id is not in the deck any more. Delete it from KNOWN_TYPED rather than " +
        "leaving an exemption nobody can see the subject of.",
    ).toBe(KNOWN_TYPED.length);
    expect(
      known.filter((r) => r.verdict !== "TYPED").map((r) => r.id),
      "these ids are allowlisted as hand-typed but are no longer hand-typed. Remove them; an " +
        "exemption that is not exempting anything is a hole left open for the next one.",
    ).toEqual([]);
  });
});
