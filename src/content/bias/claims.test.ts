import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { BIAS_CLIPS } from "./items";
import { MIN_LISTEN_MS_PER_CLIP, REPLAY_FACTOR } from "@/engine/staircase-session";

/**
 * E6/S12 — EVERY HARDCODED CLAIM ABOUT THE PRESTIGE TEST, PINNED TO ITS SOURCE.
 *
 * WHY THIS EXISTS. The delicacy share card shipped for months telling everyone
 * "a coin flip calls 3" against a fifteen-trial pool. It was a literal in JSX,
 * hardcoded when the pool was six, and nothing caught it: not tsc, not the
 * suite, not the hazard gate — that gate reads the copy deck and a fragment in
 * a component is outside it. It survived because nobody reads a PNG.
 *
 * A sweep for the same species found the Prestige Test carrying the whole class
 * pre-staged. "ten clips" and "five minutes" are written out by hand in SEVEN
 * files, including the OG image and the JSON-LD an unfurl reads.
 *
 * THESE CLAIMS ARE ALL TRUE TODAY. The pool is ten clips and the session really
 * is 5.1 minutes, so this is prevention, not repair. What makes it urgent is
 * RT-103a: the PM has approved growing the scored pool toward fourteen, which
 * takes the session to 8.1 minutes and makes every sentence below false at
 * once. Without this test, that change ships green and the site starts lying in
 * seven places, three of which are images or metadata nobody looks at.
 *
 * The delicacy flow already learned this and computes its own duration
 * (`SESSION_MINUTES`, after it once claimed "~4 minutes" against an 18-trial
 * pool). Bias never did. Until every claim is computed, this test is what
 * stands between the pool growing and the copy lying.
 */

/** The same minutes model the Gym and E6/S6 use — imported, never retyped. */
function prestigeMinutes(nItems: number): number {
  return (nItems * 2 * (MIN_LISTEN_MS_PER_CLIP / 1000) * REPLAY_FACTOR) / 60;
}

const NUMBER_WORDS: Record<number, string> = {
  2: "two",
  10: "ten",
  14: "fourteen",
  5: "five",
  8: "eight",
};

/** Every tracked source file, read once. */
function userFacingSources(): { file: string; text: string }[] {
  const files = execSync('git ls-files "src/app/**/*.tsx" "src/app/**/*.ts"', { encoding: "utf8" })
    .trim()
    .split("\n")
    .filter(Boolean);
  return files.map((file) => ({ file, text: readFileSync(file, "utf8") }));
}

function filesContaining(pattern: RegExp): string[] {
  return userFacingSources()
    .filter((s) => pattern.test(s.text))
    .map((s) => s.file);
}

describe("E6/S12 — hardcoded Prestige Test claims still match the pool", () => {
  const nClips = BIAS_CLIPS.length;
  const nControls = BIAS_CLIPS.filter((c) => c.isControl).length;
  const minutes = Math.round(prestigeMinutes(nClips));

  it("the pool is still the size every surface says it is", () => {
    const word = NUMBER_WORDS[nClips];
    const claiming = filesContaining(/\b(ten|\d+) clips\b/i);
    expect(claiming.length, "no surface states the clip count at all").toBeGreaterThan(0);

    const wrong: string[] = [];
    for (const { file, text } of userFacingSources()) {
      for (const m of text.matchAll(/\b(ten|eleven|twelve|thirteen|fourteen|fifteen|\d+) clips\b/gi)) {
        const said = m[1].toLowerCase();
        const ok = said === word || said === String(nClips);
        if (!ok) wrong.push(`${file}: "${m[0]}" but the pool is ${nClips}`);
      }
    }
    expect(
      wrong,
      `The clip pool is ${nClips} (${word}) and these surfaces disagree. This is the ` +
        `"a coin flip calls 3" defect: a literal that was true when it was written.\n` +
        wrong.join("\n"),
    ).toEqual([]);
  });

  it("the stated duration still matches the pool and the listen gate", () => {
    const word = NUMBER_WORDS[minutes];
    const wrong: string[] = [];
    for (const { file, text } of userFacingSources()) {
      // "~5 min", "~5 minutes", "five minutes", "five-minute"
      for (const m of text.matchAll(/~\s*(\d+)\s*min|\b(five|ten|fifteen|twenty)[-\s]minutes?\b/gi)) {
        const digits = m[1];
        const spelled = m[2]?.toLowerCase();
        // The delicacy and threshold flows interpolate their own durations, so
        // only literal numbers are judged here.
        if (digits && Number(digits) !== minutes && /bias|prestige|opengraph|page\.tsx/.test(file)) {
          if (!/delicacy|threshold/i.test(file)) wrong.push(`${file}: "${m[0]}" but the session is ${minutes} min`);
        }
        if (spelled && spelled !== word && /bias|prestige|opengraph/.test(file)) {
          wrong.push(`${file}: "${m[0]}" but the session is ${minutes} min (${word})`);
        }
      }
    }
    expect(
      wrong,
      `The Prestige session is ${prestigeMinutes(nClips).toFixed(1)} min at ${nClips} clips.\n` +
        wrong.join("\n"),
    ).toEqual([]);
  });

  it("the control count is still what the debrief and the learn page promise", () => {
    const word = NUMBER_WORDS[nControls];
    const wrong: string[] = [];
    for (const { file, text } of userFacingSources()) {
      for (const m of text.matchAll(/\b(two|three|\d+)\s+(?:of the \w+ )?clips? (?:are|never)\b[^.\n]*/gi)) {
        const said = m[1].toLowerCase();
        if (!/control|label/i.test(m[0])) continue;
        if (said !== word && said !== String(nControls)) {
          wrong.push(`${file}: "${m[0].slice(0, 70)}" but there are ${nControls} controls`);
        }
      }
    }
    expect(wrong, `There are ${nControls} control clips.\n` + wrong.join("\n")).toEqual([]);
  });

  /**
   * The list of files carrying a hand-written claim, asserted so that ADDING a
   * new one is a deliberate act. A surface that starts stating the pool size
   * without anyone noticing is how the next "calls 3" gets written.
   */
  it("no NEW surface has started hand-writing the pool size", () => {
    const known = [
      "src/app/bias/BiasFlow.tsx",
      "src/app/bias/page.tsx",
      "src/app/bias/result/page.tsx",
      "src/app/learn/prestige-bias-test/page.tsx",
      "src/app/page.tsx",
    ];
    const found = filesContaining(/\b(ten|\d+) clips\b/i).sort();
    const unexpected = found.filter((f) => !known.includes(f));
    expect(
      unexpected,
      `New surfaces are hand-writing the clip count. Either compute it, or add ` +
        `the file here deliberately:\n` + unexpected.join("\n"),
    ).toEqual([]);
  });
});
