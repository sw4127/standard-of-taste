/**
 * E5/S5 — the Gym's result deck, rendered.
 *
 * PRE-REGISTERED CRITERIA (session plan, 2026-08-20). S5 is done when:
 *   1. all FOUR outcome kinds render, on real sessions, and are pasted;
 *   2. every lossy line that carries a number also carries the recording's name
 *      (RT-85a, N3) — checked mechanically, not by reading;
 *   3. no result omits the zero-cohort footnote;
 *   4. the voice gate passes over the whole generated deck (voice.test.ts).
 */

import { describe, expect, it } from "vitest";
import { checkVoice, formatVoiceReport, type VoiceString } from "../voice";
import { staircaseCopyFixtures } from "./fixtures";
import { NO_COHORT_FOOTNOTE, familyLabel, quantity, shortUnit } from "./copy";

describe("E5/S5 — the deck renders", () => {
  const fixtures = staircaseCopyFixtures();

  it("all four outcome kinds appear, across every shipping ladder", () => {
    const kinds = new Set(fixtures.map((f) => f.kind));
    console.log(
      `[E5/S5] ${fixtures.length} distinct result shapes · kinds: ${[...kinds].sort().join(", ")}`,
    );
    expect([...kinds].sort()).toEqual(["above", "below", "inconclusive", "threshold"]);
    // Every ladder must be represented, or a family has no copy at all.
    for (const family of ["pitch-drift", "timing-smear", "lossy-artifact"]) {
      expect(fixtures.some((f) => f.family === family), `${family} has no rendered copy`).toBe(true);
    }
  });

  it("PASTES the deck", () => {
    const out: string[] = [];
    for (const f of fixtures) {
      out.push(`\n--- ${f.surface}  [${familyLabel(f.family)}] ---`);
      for (const l of f.lines) out.push(`    ${l}`);
    }
    console.log(out.join("\n"));
    expect(out.length).toBeGreaterThan(40);
  });

  /**
   * CRITERION 2, and it is the one N3 hangs on. A kbps number without the
   * recording beside it is a claim about the listener alone, which the pipeline
   * measured as false: the same 96 kbps does 1.431 to 2.86 dB depending on the
   * passage. Checked by scanning for the unit and requiring the source name in
   * the same sentence, so a new line cannot quietly skip it.
   */
  it("every lossy sentence with a bitrate in it names the recording", () => {
    const lossy = fixtures.filter((f) => f.sourceId);
    expect(lossy.length).toBeGreaterThan(0);
    for (const f of lossy) {
      for (const line of f.lines) {
        for (const sentence of line.split(/(?<=\.)\s+/)) {
          if (!/\d+(\.\d+)?\s*kbps/.test(sentence)) continue;
          expect(
            sentence.includes(f.sourceId!),
            `${f.surface}: a bitrate with no recording named — "${sentence}"`,
          ).toBe(true);
        }
      }
    }
  });

  it("pitch and timing never invent a recording name", () => {
    for (const f of fixtures.filter((f) => !f.sourceId)) {
      for (const line of f.lines) expect(line).not.toMatch(/\bon pb\d/);
    }
  });

  it("every result carries the zero-cohort footnote", () => {
    for (const f of fixtures) {
      expect(f.lines, `${f.surface} dropped the footnote`).toContain(NO_COHORT_FOOTNOTE);
    }
    expect(NO_COHORT_FOOTNOTE).toMatch(/0 sessions/);
    expect(NO_COHORT_FOOTNOTE).toMatch(/SIMULATED/);
  });

  it("the deck passes the voice gate on its own", () => {
    const strings: VoiceString[] = fixtures.flatMap((f) =>
      f.lines.map((text, i) => ({
        surface: `${f.surface}/${i}`,
        text,
        intensity: i === 0 ? ("pointed" as const) : ("calm" as const),
      })),
    );
    const violations = checkVoice(strings);
    if (violations.length) console.log(formatVoiceReport(violations));
    expect(violations).toEqual([]);
  });
});

describe("E5/S5 — the units come from the pipeline", () => {
  it("shortens the measurement label without keeping a second table", () => {
    expect(shortUnit("cents of peak detune")).toBe("cents");
    expect(shortUnit("ms of drift IQR")).toBe("ms");
    expect(shortUnit("kbps")).toBe("kbps");
  });

  it("formats quantities a person can read", () => {
    expect(quantity(31.5, "ms of drift IQR")).toBe("31.5 ms");
    expect(quantity(25, "cents of peak detune")).toBe("25 cents");
    expect(quantity(128, "kbps")).toBe("128 kbps");
    expect(quantity(3.1, "cents of peak detune")).toBe("3.1 cents");
  });
});
