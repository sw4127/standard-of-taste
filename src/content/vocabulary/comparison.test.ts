import { describe, expect, it } from "vitest";

import { BIAS_CLIPS } from "@/content/bias/items";
import type { BiasRatings } from "@/engine/bias";
import { computeComparisonResult } from "@/engine/comparison";
import { checkVoice, formatVoiceReport, type VoiceString } from "@/content/voice";
import {
  COMPARISON_BOUNDARY,
  comparisonLines,
  criticReferenceLines,
  ourScaleLine,
} from "./comparison";

const rate = (fn: (i: number) => number): BiasRatings =>
  Object.fromEntries(BIAS_CLIPS.map((c, i) => [c.id, fn(i)]));

const WIDE = [1, 8, 3, 10, 5, 0, 7, 2, 9, 4, 6, 1, 8, 3, 10, 5];
const SHUFFLED = [8, 1, 10, 3, 0, 5, 2, 7, 4, 9, 1, 6, 3, 8, 5, 10];

const compressed = rate((i) => (i % 2 === 0 ? 6 : 7));
const wide = rate((i) => WIDE[i]);
const shuffled = rate((i) => SHUFFLED[i]);

const READINGS = {
  compressed: computeComparisonResult(BIAS_CLIPS, compressed, compressed),
  steady: computeComparisonResult(BIAS_CLIPS, wide, wide),
  unstable: computeComparisonResult(BIAS_CLIPS, wide, shuffled),
};

describe("comparison copy", () => {
  it("always ends on the boundary, whatever the numbers were", () => {
    for (const [name, result] of Object.entries(READINGS)) {
      const lines = comparisonLines(result);
      expect(lines.length, name).toBeGreaterThan(0);
      expect(lines[lines.length - 1], name).toBe(COMPARISON_BOUNDARY);
    }
  });

  it("attaches the indifferent-rater figure to the count, in the same sentence", () => {
    const [degrees] = comparisonLines(READINGS.compressed);
    // The count and its reference point may never be separated: a count alone
    // reads as a mark out of eleven.
    expect(degrees).toContain("at random");
    expect(degrees).toMatch(/two of the eleven degrees/);
    expect(degrees).toContain("nine");
  });

  it("says WHY there is no second number, rather than leaving a blank", () => {
    const lines = comparisonLines(READINGS.compressed);
    expect(lines[1]).toContain("too close together");
    expect(lines[1]).toContain("ten pairs");
    // ...and it reports the count this sitting actually produced.
    expect(READINGS.compressed.pairs.asserted).toBe(0);
    expect(lines[1]).toContain("produced zero");
  });

  it("names both exclusions inside the stability sentence, not in a footnote", () => {
    const [, stability] = comparisonLines(READINGS.unstable);
    expect(stability).toContain("two points or more");
    expect(stability).toContain("pushed both clips the same way");
  });

  it("reads differently for a steady rater and an unstable one", () => {
    const steady = comparisonLines(READINGS.steady)[1];
    const unstable = comparisonLines(READINGS.unstable)[1];
    expect(steady).not.toBe(unstable);
    expect(steady).toContain("back in the same order");
    expect(unstable).toContain("the other way round");
  });

  it("composes the critic lines from the cited data rather than retyping them", () => {
    const lines = criticReferenceLines();
    expect(lines.length).toBeGreaterThan(0);
    for (const line of lines) expect(line.trim().length).toBeGreaterThan(0);
    // Every printed statement must appear, so a source edit reaches the copy.
    const joined = lines.join(" ");
    expect(joined).toContain("hundred and one places");
    expect(joined).toContain("A+ down to E−");
  });

  it("never spells a count as a bare digit where prose expects a word", () => {
    /* NOTHING MAY COUNT: the arity is computed, so it cannot go stale. */
    const [degrees] = comparisonLines(READINGS.steady);
    expect(degrees).toContain("sixteen clips");
    expect(degrees).not.toMatch(/\b16 clips\b/);
  });

  it("never opens a sentence with a lowercase word", () => {
    /*
     * The tie clause shipped as its own sentence beginning with a spelled-out
     * number: "...the second time. three more came out level". Every other test
     * in this file was green. Counts are spelled as words here, so any clause
     * promoted to a sentence hits this immediately.
     */
    const all = [
      ...Object.values(READINGS).flatMap(comparisonLines),
      ...criticReferenceLines(),
      ourScaleLine(),
    ];
    let openings = 0;
    for (const line of all) {
      for (const part of line.split(/(?<=[.!?])\s+/)) {
        if (part.trim().length === 0) continue;
        openings++;
        const first = part.trim()[0];
        expect(
          first === first.toUpperCase(),
          `sentence opens lowercase: "${part.slice(0, 48)}"`,
        ).toBe(true);
      }
    }
    // The split must actually have found sentences to look at.
    expect(openings).toBeGreaterThan(all.length);
  });

  it("does not restate the scale's own bounds as if they were a finding", () => {
    /* A listener who used the full width cannot be "below zero" or "above ten". */
    const [degrees] = comparisonLines(READINGS.steady);
    expect(READINGS.steady.span).toBe(READINGS.steady.degreesAvailable - 1);
    expect(degrees).not.toContain("nothing below zero");
    expect(degrees).not.toContain("nothing above ten");
    // A listener who did NOT use the full width still gets the real range.
    const narrow = computeComparisonResult(
      BIAS_CLIPS,
      rate((i) => 3 + (i % 4)),
      rate((i) => 3 + (i % 4)),
    );
    expect(comparisonLines(narrow)[0]).toContain("nothing below three");
  });

  it("says nothing twice inside one critic line", () => {
    for (const line of criticReferenceLines()) {
      const sentences = line
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim().toLowerCase())
        .filter((s) => s.length > 0);
      expect(sentences.length).toBeGreaterThan(1);
      expect(new Set(sentences).size, line.slice(0, 40)).toBe(sentences.length);
      // The duplication that actually shipped was a paraphrase, not an exact
      // repeat: the header restated the range the first finding gives.
      expect(line).not.toMatch(/0\.0 to 10\.0[\s\S]*0\.0 to 10\.0/);
      expect(line).not.toMatch(/A\+ down to E−[\s\S]*A\+ down to E−/);
    }
  });

  it("passes the voice gate on every line it can produce", () => {
    const strings: VoiceString[] = [];
    for (const [name, result] of Object.entries(READINGS)) {
      for (const text of comparisonLines(result)) {
        strings.push({ surface: `comparison/${name}`, text, intensity: "pointed" });
      }
    }
    for (const text of criticReferenceLines()) {
      strings.push({ surface: "comparison/critics", text, intensity: "calm" });
    }
    strings.push({ surface: "comparison/our-scale", text: ourScaleLine(), intensity: "calm" });

    expect(strings.length).toBeGreaterThan(0);
    expect(formatVoiceReport(checkVoice(strings))).toBe("voice check: no violations");
  });

  it("makes no claim about a cohort, a percentile or another person", () => {
    const all = [
      ...Object.values(READINGS).flatMap(comparisonLines),
      ...criticReferenceLines(),
      ourScaleLine(),
    ].join(" ");
    expect(all.length).toBeGreaterThan(0);
    expect(all).not.toMatch(/percentile/i);
    expect(all).not.toMatch(/\bother (?:listeners|people|users)\b/i);
    expect(all).not.toMatch(/\bmost (?:listeners|people|users)\b/i);
  });
});
