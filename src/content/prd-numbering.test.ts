/**
 * PARTS 2–4 CITE THE USE CASES PART 1 ACTUALLY HAS (PRD revision, 2026-09-23).
 *
 * WHY THIS EXISTS. Part 1 was re-derived from `docs/blueprint.md` and its use
 * cases renumbered. Parts 2–4 went on citing the earlier numbers, and nothing
 * noticed, because the earlier numbers still EXIST: the new inventory also
 * runs from UC-1 upward, so "the Prestige Test serves UC-1" read as a valid
 * citation of a use case that had become the reading. The stamp on each part
 * was the only thing saying so.
 *
 * WHAT IT HOLDS:
 * 1. Every `UC-n` in parts 2–4 is a use case in part 1's tables.
 * 2. Every use case in part 1 is served by at least one scored feature in
 *    part 2, so no use case is ranked by nothing.
 * 3. Every scored feature in part 2 says what it serves, or says "none".
 *
 * WHAT IT CANNOT CHECK: that a citation is the RIGHT use case. It can see that
 * UC-8 exists and that a feature cites it; whether the Prestige Test is what
 * UC-8 describes is a judgment. That failure is exactly the one that happened,
 * and the defence against it is a reader.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const NL = String.fromCharCode(10);
const PART1 = "docs/prd-1-use-cases.md";
const PART2 = "docs/prd-2-features.md";
const PART3 = "docs/prd-3-requirements.md";
const PART4 = "docs/prd-4-screens.md";

const read = (f: string) => readFileSync(f, "utf8");
const ucs = (text: string) => [...text.matchAll(/\bUC-(\d+)\b/g)].map((m) => "UC-" + m[1]);

/** Use cases part 1 defines: a table row opening with the bold id. */
function defined(): string[] {
  return read(PART1)
    .split(NL)
    .filter((l) => l.startsWith("| **UC-"))
    .map((l) => /\*\*(UC-\d+)\*\*/.exec(l)![1]);
}

/** The ids in part 1's "The core" section. */
function core(): string[] {
  const doc = read(PART1);
  const at = doc.indexOf(NL + "## The core");
  const section = doc.slice(at, doc.indexOf(NL + "## ", at + 1));
  return section
    .split(NL)
    .filter((l) => l.startsWith("| **UC-"))
    .map((l) => /\*\*(UC-\d+)\*\*/.exec(l)![1]);
}

/** Part 2's scored rows: name, then the Serves cell. */
function features(): { name: string; serves: string }[] {
  return read(PART2)
    .split(NL)
    .filter((l) => l.startsWith("| "))
    .map((l) => l.split("|").map((c) => c.trim()))
    .filter((c) => c.length >= 6 && Number.isInteger(Number(c[2])) && Number.isInteger(Number(c[3])))
    .map((c) => ({ name: c[1], serves: c[4] }));
}

/** Part 3's requirements, in order, with the use cases each one's "Serves" row names. */
function requirements(): { id: string; serves: string[] }[] {
  const doc = read(PART3);
  return doc
    .split(NL + "## ")
    .slice(1)
    .filter((sec) => /^FR-\d+/.test(sec))
    .map((sec) => ({
      id: /^(FR-\d+)/.exec(sec)![1],
      serves: ucs(sec.split(NL).find((l) => l.startsWith("| **Serves**")) ?? ""),
    }));
}

describe("the PRD's use-case numbers are part 1's", () => {
  const known = defined();

  it("read a real inventory, so nothing below passes vacuously", () => {
    expect(known.length, "part 1 defines no use cases").toBeGreaterThanOrEqual(10);
    expect(core().length, "part 1 has no core section").toBeGreaterThan(0);
    expect(features().length, "part 2's feature table did not parse").toBeGreaterThan(10);
    expect(requirements().length, "part 3 has no FR sections").toBeGreaterThan(5);
  });

  it.each([PART2, PART3, PART4])("cites only use cases part 1 defines, in %s", (file) => {
    const unknown = [...new Set(ucs(read(file)))].filter((u) => !known.includes(u));
    expect(unknown, `${file} cites use cases part 1 does not have`).toEqual([]);
  });

  it("serves every use case with at least one scored feature in part 2", () => {
    const served = new Set(features().flatMap((f) => ucs(f.serves)));
    expect(known.filter((u) => !served.has(u)), "no feature in part 2 serves these").toEqual([]);
  });

  it("says what every feature serves, or says none", () => {
    const silent = features().filter((f) => ucs(f.serves).length === 0 && f.serves !== "none");
    expect(silent.map((f) => f.name)).toEqual([]);
  });

});
