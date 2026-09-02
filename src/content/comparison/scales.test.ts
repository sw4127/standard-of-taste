import { describe, expect, it } from "vitest";

import { BIAS_SCALE_MAX, BIAS_SCALE_MIN } from "@/engine/bias";
import { CRITIC_SCALES, OUR_SCALE, allScaleCitations } from "./scales";

/**
 * WHAT THESE GUARDS CAN AND CANNOT DO.
 *
 * The citations here are external pages, so no test can open them and confirm
 * the passage is still there — the check `claims.test.ts` performs on repo
 * files is unavailable. What a test CAN do is refuse the failure modes that do
 * not need a network: a figure whose source reference does not resolve, a
 * source listed but never used, a citation with no date on which somebody
 * actually read it, and this instrument's own scale drifting away from the
 * engine that enforces it.
 *
 * Every scan below asserts it FOUND something before asserting anything about
 * what it found. Two guards written in E15 passed while matching zero strings.
 */
describe("critic scales", () => {
  it("has entries, each with at least one finding and one citation", () => {
    expect(CRITIC_SCALES.length).toBeGreaterThan(0);
    for (const entry of CRITIC_SCALES) {
      expect(entry.findings.length, entry.id).toBeGreaterThan(0);
      expect(entry.citations.length, entry.id).toBeGreaterThan(0);
    }
  });

  it("uses unique entry ids, and unique citation ids within an entry", () => {
    const ids = CRITIC_SCALES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const entry of CRITIC_SCALES) {
      const cids = entry.citations.map((c) => c.id);
      expect(new Set(cids).size, entry.id).toBe(cids.length);
    }
  });

  it("resolves every finding's citation inside its own entry", () => {
    let checked = 0;
    for (const entry of CRITIC_SCALES) {
      const known = new Set(entry.citations.map((c) => c.id));
      for (const finding of entry.findings) {
        expect(known.has(finding.citationId), `${entry.id}: ${finding.citationId}`).toBe(true);
        checked++;
      }
    }
    // The scan must have had something to look at.
    expect(checked).toBeGreaterThan(0);
  });

  it("leaves no citation unreferenced — a source nobody cites is decoration", () => {
    for (const entry of CRITIC_SCALES) {
      const used = new Set(entry.findings.map((f) => f.citationId));
      for (const citation of entry.citations) {
        expect(used.has(citation.id), `${entry.id}: ${citation.id} is never cited`).toBe(true);
      }
    }
  });

  it("gives every citation a publication, a title, an https url and a read date", () => {
    const citations = allScaleCitations();
    expect(citations.length).toBeGreaterThan(0);
    for (const c of citations) {
      expect(c.publication.trim().length, c.id).toBeGreaterThan(0);
      expect(c.title.trim().length, c.id).toBeGreaterThan(0);
      expect(c.url.startsWith("https://"), `${c.id}: ${c.url}`).toBe(true);
      expect(/^\d{4}-\d{2}-\d{2}$/.test(c.retrieved), `${c.id}: ${c.retrieved}`).toBe(true);
      if (c.author !== null) expect(c.author.trim().length, c.id).toBeGreaterThan(0);
    }
  });

  it("carries a source for every statement that quotes a figure", () => {
    const withFigures = CRITIC_SCALES.flatMap((entry) =>
      entry.findings
        .filter((f) => /[0-9]/.test(f.statement))
        .map((f) => ({ entry, finding: f })),
    );
    // Vacuously green if the statements ever stop carrying figures, which is
    // the failure this whole file is guarding against.
    expect(withFigures.length).toBeGreaterThan(0);
    for (const { entry, finding } of withFigures) {
      const source = entry.citations.find((c) => c.id === finding.citationId);
      expect(source, `${entry.id}: ${finding.statement.slice(0, 40)}`).toBeDefined();
      expect(source!.url.startsWith("https://")).toBe(true);
    }
  });

  it("derives our own scale from the engine rather than restating it", () => {
    expect(OUR_SCALE.degreesAllowed).toBe(BIAS_SCALE_MAX - BIAS_SCALE_MIN + 1);
    expect(OUR_SCALE.scale).toContain(String(BIAS_SCALE_MIN));
    expect(OUR_SCALE.scale).toContain(String(BIAS_SCALE_MAX));
  });

  it("leaves degreesAllowed null wherever the published range does not fix it", () => {
    for (const entry of CRITIC_SCALES) {
      if (entry.degreesAllowed !== null) {
        expect(Number.isInteger(entry.degreesAllowed), entry.id).toBe(true);
        expect(entry.degreesAllowed, entry.id).toBeGreaterThan(1);
      }
    }
    // At least one entry must exercise each branch, or the rule is untested.
    expect(CRITIC_SCALES.some((e) => e.degreesAllowed === null)).toBe(true);
    expect(CRITIC_SCALES.some((e) => e.degreesAllowed !== null)).toBe(true);
  });
});
