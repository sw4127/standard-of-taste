/**
 * ONE TEXT, AND A GUARD ON EVERY COPY OF IT (blueprint audit, 2026-09-23, change list A4).
 *
 * The project's founding ideas had been restated in at least nine places, in
 * wording that drifted until two copies made different claims. The fix is one
 * canonical file (`docs/blueprint.md`) and this test:
 *
 * 1. PARSE — the file yields every statement it must, with a count floor,
 *    because three guards in this repository have passed by matching nothing.
 * 2. INTERNAL CONSISTENCY — the argument's conclusion IS the insight, and its
 *    third premise IS the second challenged assumption's rejection.
 * 3. REGISTRY — every registered copy holds to its mode (`blueprint-copies.ts`).
 * 4. SUPERSEDED PHRASINGS — the sentences the audit replaced may not return to
 *    the site, the README or the recruiter page.
 *
 * WHAT IT CANNOT DO: find a paraphrase nobody registered. A new sentence that
 * restates the insight in fresh words passes until somebody adds its row.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  BLUEPRINT_PATH,
  BLUEPRINT_ZH_PATH,
  caption,
  loadBlueprint,
  parseBlueprint,
  publicCitation,
  publicSource,
  type BpId,
  type BpStatement,
} from "./blueprint";
import { BLUEPRINT_COPIES } from "./blueprint-copies";

/** Pointed at by mutation (d): an empty file here must fail the count floor. */
const SOURCE = BLUEPRINT_PATH;

const REQUIRED: BpId[] = [
  "BP-GOAL", "BP-INSIGHT", "BP-DEMAND", "BP-UNMET",
  "BP-CA1", "BP-CA2", "BP-CA2-PUBLIC", "BP-CA3", "BP-BRIDGE", "BP-BUSINESS",
  "BP-F1", "BP-F2",
  "BP-ARG-P1", "BP-ARG-P2", "BP-ARG-S1", "BP-ARG-P3", "BP-ARG-P4", "BP-ARG-C",
  "BP-ARG-WEAK", "BP-ARG-OBJECTION", "BP-ARG-REPLY", "BP-ARG-OPEN", "BP-CHAIN",
];

const SUPERSEDED = [
  "Read the taste, read the person",
  "back door into understanding yourself",
  "measure what a listener can currently discriminate, and return it in language",
  "predicts less than present taste,",
  "this project's thesis restated by somebody else",
  "Timescale split — recent taste reads your current mood; durable taste reads the stable you",
];

const collapse = (s: string) => s.replace(/^> /gm, "").replace(/\s+/g, " ");
const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

/** Quoted: contained verbatim, allowing hard-wrap, a lower-case first letter and no closing stop. */
function quotes(file: string, statement: string): boolean {
  const hay = collapse(file);
  const needle = collapse(statement).replace(/\.$/, "");
  return hay.includes(needle) || hay.includes(lowerFirst(needle));
}

/** Derived: `BP-<ID>` within five lines of the anchor. */
function namesItsSource(file: string, anchor: string, id: string): boolean {
  const lines = file.split(/\r?\n/);
  const at = lines.findIndex((l) => l.includes(anchor));
  if (at < 0) return false;
  return lines.slice(Math.max(0, at - 5), at + 6).some((l) => new RegExp(`\\b${id}\\b`).test(l));
}

const blueprint = loadBlueprint(SOURCE);
const BP_ZH = loadBlueprint(BLUEPRINT_ZH_PATH).BP;
const BP = blueprint.BP;
const BP_STATEMENTS_FOR_TEST = blueprint.statements;

describe("the blueprint of record parses into every statement it must hold", () => {
  it("finds at least 23 statements, all unique (a count floor, not a match)", () => {
    const ids = blueprint.statements.map((s) => s.id);
    expect(ids.length, `${SOURCE} yielded ${ids.length} statements`).toBeGreaterThanOrEqual(23);
    expect(new Set(ids).size, "a BP- ID appears twice").toBe(ids.length);
  });

  it("holds every statement the rest of the project cites", () => {
    expect(REQUIRED.filter((id) => !BP[id])).toEqual([]);
  });

  it("labels every premise of the argument, so a reader can see which is which (N3)", () => {
    const unlabelled = blueprint.statements
      .filter((s) => /^BP-ARG-(P\d|S\d|C)$/.test(s.id) && !s.label)
      .map((s) => s.id);
    expect(unlabelled).toEqual([]);
  });
});

describe("the blueprint agrees with itself", () => {
  it("concludes exactly the insight (BP-ARG-C = BP-INSIGHT)", () => {
    expect(BP["BP-ARG-C"]).toBe(BP["BP-INSIGHT"]);
  });

  it("uses the second challenged assumption's rejection as its third premise", () => {
    const rejected = BP["BP-CA2"]?.split("Rejected: ")[1];
    expect(rejected, "BP-CA2 has no 'Rejected: ' clause").toBeTruthy();
    expect(lowerFirst(BP["BP-ARG-P3"])).toBe(lowerFirst(rejected!));
  });
});

describe("every registered copy holds to its mode", () => {
  it("has rows to check (the registry is not empty)", () => {
    expect(BLUEPRINT_COPIES.length).toBeGreaterThanOrEqual(10);
  });

  for (const row of BLUEPRINT_COPIES) {
    it(`${row.path} · ${row.id} · ${row.mode}`, () => {
      expect(existsSync(row.path), `${row.path} does not exist`).toBe(true);
      expect(BP[row.id], `${row.id} is not in the blueprint`).toBeTruthy();
      const file = readFileSync(row.path, "utf8");
      if (row.mode === "quoted") {
        // A Chinese copy quotes the Chinese blueprint (bilingual Part 3).
        const source = row.lang === "zh" ? BP_ZH[row.id] : BP[row.id];
        expect(source, `${row.id} is not in the ${row.lang === "zh" ? "Chinese " : ""}blueprint`).toBeTruthy();
        expect(
          quotes(file, source),
          `${row.path} no longer quotes ${row.id} verbatim. The blueprint is the source: copy it from ` +
            `docs/blueprint.md, or register the line as derived and name the ID beside it.`,
        ).toBe(true);
      } else if (row.mode === "derived") {
        expect(row.anchor, "a derived row needs an anchor").toBeTruthy();
        expect(
          namesItsSource(file, row.anchor!, row.id),
          `${row.path}: "${row.anchor}" paraphrases ${row.id} and no longer names it within five lines`,
        ).toBe(true);
      } else {
        expect(row.reason, "a historical row must say why it is exempt").toBeTruthy();
        expect(row.reason!, "a historical row must carry its date").toMatch(/\b20\d\d-\d\d-\d\d\b/);
        expect(
          Boolean(row.anchor && file.includes(row.anchor)),
          `${row.path}: the record this row exempts ("${row.anchor}") is gone, so the row exempts nothing`,
        ).toBe(true);
      }
    });
  }
});

describe("a reader is never shown the blueprint's internal cross-references", () => {
  it("drops a note that cites the spec, the MRD or another BP- ID, and keeps a published citation", () => {
    const reply = BP_STATEMENTS_FOR_TEST.find((s) => s.id === "BP-ARG-REPLY")!;
    const objection = BP_STATEMENTS_FOR_TEST.find((s) => s.id === "BP-ARG-OBJECTION")!;
    expect(reply.note).toMatch(/BP-UNMET/);
    expect(publicSource(reply)).toBeNull();
    expect(publicSource(objection)).toMatch(/Forer \(1949\)/);
  });

  /*
   * ONE SPECIMEN PER ALTERNATIVE (2026-09-28). The case above cannot fail if the
   * filter loses its RT-, MRD or spec alternative: the real note it checks is nulled
   * by "BP-UNMET" alone. The red-team subagent showed a planted commit removing
   * `RT-\d` would have passed. Each specimen carries exactly one internal
   * reference, so removing any one alternative fails at least one case (the RT
   * alternative fails three: a numbered, a Z-series and a lettered ruling).
   */
  const specimen = (...lines: string[]) => parsed(...lines.map((l) => `*${l}*`));
  it.each([
    ["a ruling", "Label: ASSUMED (RT-8)."],
    ["a Z-series ruling", "Carve-out: RT-Z10 a."],
    ["a lettered ruling with no digit", "Kind: owner ruling (RT-H)."],
    ["a memo decision", "Label: ASSUMED (D2)."],
    ["a guardrail", "Held to N3."],
    ["a memo section", "See memo §8.1."],
    ["an argument step", "INFERENCE from P1 and P2."],
    ["a repository path", "Ruling: docs/rt-answers-2026-09-23-audit.md."],
    ["a PM ruling", "Decided in PM-3a."],
    ["a session slice", "Measured in E7/S8."],
    ["an owner ruling", "Kind: owner ruling (BA-3)."],
    ["the MRD", "See MRD M8."],
    ["the spec", "Source: spec §20.B."],
    ["another statement", "Supporting finding: BP-F1."],
  ])("drops a note whose only internal reference is %s", (_, note) => {
    expect(publicSource(specimen(note))).toBeNull();
  });
  it("drops a LINE whole when a published source shares it with a cross-reference", () => {
    // Fails closed within a line: the filter cannot tell where a citation ends and
    // a cross-reference begins, so a mixed line shows nothing. The blueprint's
    // format rule (owner-approved 2026-09-28) puts a citation on a line of its own.
    expect(publicSource(specimen("Hume (1757). Connects only through BP-BRIDGE."))).toBeNull();
  });

  it("shows the published line of a note and keeps its cross-reference line off the page", () => {
    const s = specimen("Hume (1757), a position.", "Connects only through BP-BRIDGE.");
    expect(publicSource(s)).toBe("Hume (1757), a position.");
  });

  it("keeps a published citation that carries no internal reference", () => {
    expect(publicSource(specimen("Forer (1949), J. Abnorm. Soc. Psychol."))).toBe("Forer (1949), J. Abnorm. Soc. Psychol.");
  });

  it("never shows an amendment stamp, which names no ID (red-team, 2026-09-28)", () => {
    const s = specimen("Label: ASSUMED.", "[AMENDED 2026-10-02 — the statement above is kept verbatim.]");
    expect(s.noteLines).toHaveLength(2);
    expect(publicSource(s)).toBe("Label: ASSUMED.");
  });

  it("does not read a markdown bullet under a statement as a note", () => {
    expect(parsed("* a list item, not a note").noteLines).toEqual([]);
  });
});

/** One statement parsed from a minimal blueprint, so a specimen has exactly the fields a real one has. */
function parsed(...under: string[]): BpStatement {
  return parseBlueprint(["<!-- BLUEPRINT:BEGIN", "**BP-X** · x", ...under, "<!-- BLUEPRINT:END -->"].join("\n"))
    .statements[0];
}

describe("the blueprint's own notes reach the page as the owner split them (2026-09-28)", () => {
  const get = (id: BpId) => BP_STATEMENTS_FOR_TEST.find((s) => s.id === id)!;

  it("parses every italic line under a statement, not only the first", () => {
    expect(get("BP-CA3").noteLines).toHaveLength(2);
    expect(get("BP-CA3").note).toMatch(/BP-BRIDGE/);
  });

  it("shows BP-CA3's Hume citation, and not its cross-reference", () => {
    expect(publicSource(get("BP-CA3"))).toMatch(/Hume, "Of the Standard of Taste", 1757/);
    expect(publicSource(get("BP-CA3"))).not.toMatch(/BP-BRIDGE/);
  });

  it("labels BP-CA2-PUBLIC as the evidence it is, and says so on the page (N3)", () => {
    expect(get("BP-CA2-PUBLIC").label).toBe("EVIDENCED");
    expect(caption(get("BP-CA2-PUBLIC"))).toBe("EVIDENCED, qualitatively.");
  });

  it("still shows nothing for BP-ARG-REPLY, whose note cites only the repository", () => {
    expect(publicSource(get("BP-ARG-REPLY"))).toBeNull();
  });

  it("shows the premises' published sources without repeating their label", () => {
    expect(publicCitation(get("BP-ARG-P1"))).toMatch(/^Knobloch & Zillmann \(2002\)/);
    expect(publicCitation(get("BP-ARG-P4"))).toBeNull(); // "ASSUMED." and nothing else
  });

  it("keeps the qualifier on a label whose line is hidden (P3: interviews, not a journal)", () => {
    // P3's only line also names BP-CA2, so it is off the page; its label must not
    // read as the same standard of evidence as P1's and P2's citations (red-team).
    expect(publicSource(get("BP-ARG-P3"))).toBeNull();
    expect(get("BP-ARG-P3").labelText).toBe("EVIDENCED, qualitatively");
  });

  it("keeps every note it had: a note detached by a blank line would unlabel its statement", () => {
    // BP-ARG-WEAK and BP-CHAIN have never had one. Every other statement has.
    const bare = BP_STATEMENTS_FOR_TEST.filter((s) => s.noteLines.length === 0).map((s) => s.id);
    expect(bare).toEqual(["BP-ARG-WEAK", "BP-CHAIN"]);
  });
});

describe("the line a page prints under a statement", () => {
  it.each([
    ["a label and no public note", parsed("*Label: ASSUMED (RT-8).*"), "ASSUMED"],
    ["no note", parsed(), null],
    ["a kind line, capitalised", parsed("*Kind: a position (Hume, 1757).*"), "A position (Hume, 1757)."],
    ["a label line that keeps its qualifier", parsed("*Label: EVIDENCED, qualitatively.*"), "EVIDENCED, qualitatively."],
    ["a hidden line whose qualifier survives", parsed("*EVIDENCED, qualitatively. See BP-F1.*"), "EVIDENCED, qualitatively"],
    ["a citation that does not name its label", parsed("*EVIDENCED. Forer (1949).*"), "EVIDENCED · Forer (1949)."],
  ])("%s", (_, s, expected) => {
    expect(caption(s)).toBe(expected);
  });
});

describe("no superseded phrasing returns", () => {
  const walk = (d: string): string[] =>
    readdirSync(d, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name).replace(/\\/g, "/")],
    );
  const files = [
    ...walk("src").filter((f) => /\.(tsx?|mjs|css)$/.test(f) && !/\.test\.tsx?$/.test(f)),
    "docs/index.html",
    "README.md",
  ];

  it("reads the whole source tree (a floor, so an empty walk cannot pass)", () => {
    // Measured 2026-09-23: 251 files before the snack and its narrators were deleted.
    expect(files.length).toBeGreaterThan(150);
  });

  it("finds none of the six in src/, docs/index.html or README.md", () => {
    const found = files.flatMap((f) => {
      const text = collapse(readFileSync(f, "utf8"));
      return SUPERSEDED.filter((p) => text.includes(p)).map((p) => `${f}: "${p}"`);
    });
    expect(found).toEqual([]);
  });
});
