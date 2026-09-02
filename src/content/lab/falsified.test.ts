/**
 * E15/S6 proof. PRE-REGISTERED, written before the entries were authored:
 *
 *   (a) COMPLETE AGAINST THE RECORD. Every belief recorded under a "FALSIFIED"
 *       heading in any handoff must appear in the registry. This is the
 *       assertion the whole panel rests on: a registry of failures that its
 *       author may curate is a registry of the failures its author found
 *       flattering, which is the selection bias this product exists to measure.
 *   (b) EVERY CITATION OPENS. The anchor must really appear in the file it
 *       names, compared whitespace-collapsed because the documents hard-wrap.
 *       Same rule as `/method`, for the same reason: a citation is a claim.
 *   (c) EVERY NAMED GUARD EXISTS ON DISK.
 *   (d) EVERY ENTRY CARRIES A MEASUREMENT, not an opinion — the thing that
 *       killed a belief has to be something other than a change of mind.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { FALSIFIED } from "./falsified";

const collapse = (s: string) => s.replace(/\s+/g, " ").trim();

/** Strip the markdown a belief was written in, so it compares as prose. */
const plain = (s: string) =>
  collapse(s.replace(/[`*]/g, "")).toLowerCase();

/**
 * Every belief recorded under a FALSIFIED heading in `docs/`, with the file it
 * came from. This is the ledger the registry is checked against — parsed from
 * the record rather than from a list maintained beside it, because a list I
 * maintain is a list I can quietly shorten.
 */
function recordedBeliefs(): { file: string; belief: string }[] {
  const out: { file: string; belief: string }[] = [];
  for (const file of readdirSync("docs").filter((f) => /^handoff-.*\.md$/.test(f))) {
    const lines = readFileSync(`docs/${file}`, "utf8").split("\n");
    let inSection = false;
    for (const line of lines) {
      if (/^#{2,3} +(FALSIFIED|Falsified)/.test(line)) {
        inSection = true;
        continue;
      }
      if (!inSection) continue;
      if (/^#{1,3} /.test(line) || /^---\s*$/.test(line)) {
        inSection = false;
        continue;
      }
      // A recorded item opens with a list marker and a bolded quotation.
      const m = line.match(/^\s*(?:\d+\.|-) \*\*[""]([^""]+)[""]/);
      if (m) out.push({ file, belief: m[1] });
    }
  }
  return out;
}

describe("E15/S6 — the registry is complete against the record", () => {
  it("finds the record at all, or every assertion below is vacuous", () => {
    const recorded = recordedBeliefs();
    expect(recorded.length, "no FALSIFIED sections found in docs/").toBeGreaterThan(20);
    expect(new Set(recorded.map((r) => r.file)).size).toBeGreaterThan(4);
  });

  /**
   * THE CENTRAL ASSERTION OF THIS PANEL. If it ever fails, the registry has
   * fallen behind the record — and the honest fix is to add the entry, never to
   * relax this test.
   */
  it("carries every belief the handoffs recorded as falsified", () => {
    const claimed = new Set(FALSIFIED.flatMap((e) => e.beliefs).map(plain));
    const missing = recordedBeliefs()
      .filter((r) => !claimed.has(plain(r.belief)))
      .map((r) => `${r.file}: "${r.belief}"`);
    expect(
      missing,
      "these falsified beliefs are in the record but not in the registry — add them, do not " +
        "weaken this test",
    ).toEqual([]);
  });

  /**
   * An entry MAY be newer than the last handoff's list — the two premises E14
   * killed live in an analytics derivation, and the delicacy tier result in
   * another. What an entry may NOT be is a belief nobody ever held, dressed up
   * as a dead one to pad the page. So anything absent from the handoff record
   * has to rest on a derivation document, which is a stricter citation than
   * prose, not a looser one.
   */
  it("rests anything not in the handoff record on a derivation instead", () => {
    const recorded = new Set(recordedBeliefs().map((r) => plain(r.belief)));
    for (const entry of FALSIFIED) {
      if (entry.beliefs.some((b) => recorded.has(plain(b)))) continue;
      const derived = entry.sources.some((s) => s.path.startsWith("docs/analytics/"));
      expect(
        derived,
        `${entry.id} is in no handoff's FALSIFIED list and cites no derivation — where did ` +
          "this belief come from?",
      ).toBe(true);
    }
  });
});

describe("E15/S6 — every entry is checkable", () => {
  it("has unique ids and a date", () => {
    const ids = FALSIFIED.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const e of FALSIFIED) {
      expect(e.id, e.id).toMatch(/^[a-z][a-z0-9-]*$/);
      expect(e.date, e.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("OPENS every citation and finds the passage really there", () => {
    for (const entry of FALSIFIED) {
      expect(entry.sources.length, `${entry.id} cites nothing`).toBeGreaterThan(0);
      for (const source of entry.sources) {
        expect(existsSync(source.path), `${entry.id} → ${source.path}`).toBe(true);
        const body = collapse(readFileSync(source.path, "utf8"));
        expect(
          body.includes(collapse(source.anchor)),
          `${entry.id}: "${source.anchor}" is not in ${source.path}`,
        ).toBe(true);
      }
    }
  });

  it("points every named guard at a test that exists", () => {
    const guarded = FALSIFIED.filter((e) => e.guard);
    expect(guarded.length, "no entry names a guard at all").toBeGreaterThan(0);
    for (const e of guarded) {
      expect(existsSync(e.guard!), `${e.id} → ${e.guard}`).toBe(true);
      expect(e.guard!, e.id).toMatch(/\.test\.(ts|tsx|mjs)$/);
    }
  });

  it("was killed by a measurement, not by a change of mind", () => {
    for (const e of FALSIFIED) {
      expect(e.killedBy.length, `${e.id} states no measurement`).toBeGreaterThan(40);
      expect(e.consequence.length, `${e.id} states no consequence`).toBeGreaterThan(20);
      expect(e.beliefs.length, `${e.id} states no belief`).toBeGreaterThan(0);
      for (const b of e.beliefs) expect(b.length, e.id).toBeGreaterThan(10);
      /*
       * A MEASURED FINDING NAMES ITS NUMBER. Not proof of rigour on its own,
       * but a registry of prose with no figures in it is a page of opinions.
       *
       * THE `derived` ESCAPE IS NARROW AND IT IS NOT A LOOPHOLE — it exists
       * because the first version of this rule demanded a number from
       * "information per minute is constant by construction", a finding that
       * HAS no number, and the only way to satisfy it would have been to
       * manufacture one. That is the exact failure this page catalogues,
       * committed on the page itself. So the kind is declared, and the
       * assertion below keeps the escape rare.
       */
      if (e.kind === "measured") {
        expect(/\d/.test(e.killedBy), `${e.id} is measured but names no number`).toBe(true);
      }
    }
    const derived = FALSIFIED.filter((e) => e.kind === "derived").length;
    expect(
      derived / FALSIFIED.length,
      "most entries should rest on a measurement, not on an argument",
    ).toBeLessThan(0.25);
  });
});
