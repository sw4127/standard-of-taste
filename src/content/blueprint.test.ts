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
import { BLUEPRINT_PATH, loadBlueprint, publicSource, type BpId } from "./blueprint";
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
        expect(
          quotes(file, BP[row.id]),
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
