import { describe, expect, it } from "vitest";
import { creatorLines, flawInAGeneration, whatGetsPast } from "./threshold";
import { thresholdClaim, type ThresholdSay } from "@/engine/evidence";
import {
  answer,
  axisFor,
  isFinished,
  nextTrial,
  sessionResult,
  startSession,
  type StaircaseResult,
} from "@/engine/staircase-session";
import { eligibleSources } from "@/engine/staircase-pool";
import { observer, pCorrect, rng } from "@/analytics/observer";
import { NO_COHORT_FOOTNOTE, resultLines } from "@/content/staircase/copy";
import { checkVoice, formatVoiceReport } from "@/content/voice";

/**
 * REAL SESSIONS, not hand-written result objects — same construction as the
 * copy deck's fixtures. Sentences written against shapes I invented would only
 * prove I can invent shapes.
 */
function sessions(): Array<{ tag: string; result: StaircaseResult }> {
  const ladders: Array<{ family: string; sourceId?: string }> = [
    { family: "pitch-drift" },
    { family: "timing-smear" },
    ...eligibleSources("lossy-artifact").map((sourceId) => ({ family: "lossy-artifact", sourceId })),
  ];
  const out: Array<{ tag: string; result: StaircaseResult }> = [];
  for (const { family, sourceId } of ladders) {
    const axis = axisFor(family, sourceId);
    const mid = axis.magnitudes[axis.magnitudes.length >> 1];
    const places: Array<[string, number]> = [
      ["inside", mid],
      ["far-better", axis.magnitudes[0] / 4],
      ["far-worse", axis.magnitudes.at(-1)! * 4],
    ];
    for (const [place, alpha] of places) {
      for (const seed of [7919, 15838, 23757]) {
        const o = observer(alpha, 0.35, 0.02);
        let s = startSession(family, seed, sourceId);
        const rand = rng(seed ^ 0x5bf03635);
        while (!isFinished(s)) {
          const t = nextTrial(s);
          s = answer(s, rand() < pCorrect(s.axis.magnitudes[t.levelIndex], o));
        }
        const result = sessionResult(s);
        const tag = `${family}${sourceId ? `/${sourceId}` : ""}/${place}/${result.kind}`;
        if (!out.some((x) => x.tag === tag)) out.push({ tag, result });
      }
    }
  }
  return out;
}

const rendered = sessions()
  .map(({ tag, result }) => ({ tag, result, claim: thresholdClaim(result) }))
  .filter((x) => x.claim.ok)
  .map((x) => ({
    tag: x.tag,
    result: x.result,
    say: (x.claim as { ok: true; value: ThresholdSay }).value,
    lines: creatorLines((x.claim as { ok: true; value: ThresholdSay }).value),
  }));

describe("creatorLines — rendered for every family and outcome kind", () => {
  it("prints the deck", () => {
    for (const r of rendered) {
      const band = `heardAt=${r.say.heardAt ?? "-"} missedAt=${r.say.missedAt ?? "-"}`;
      console.log(`\n--- ${r.tag}  [${band}]`);
      for (const line of r.lines) console.log(`    ${line}`);
    }
    console.log(`\nTOTAL RENDERINGS: ${rendered.length}`);
  });

  it("covers all three families and more than one outcome kind", () => {
    expect(new Set(rendered.map((r) => r.result.family)).size).toBe(3);
    expect(new Set(rendered.map((r) => r.result.kind)).size).toBeGreaterThan(1);
  });

  it("covers every band shape the claim floor lets through", () => {
    const shape = (s: ThresholdSay) =>
      s.heardAt !== null && s.missedAt !== null ? "both" : s.heardAt !== null ? "heard" : "missed";
    expect(new Set(rendered.map((r) => shape(r.say))).size).toBeGreaterThanOrEqual(2);
  });

  /**
   * Two sentences normally; ONE on a wide band, where the screen has already
   * refused twice and a third refusal is noise (E8/S3, found by reading the
   * rendered page). Never zero, and never an empty string.
   */
  it("renders two sentences, or one on a wide band, never empty", () => {
    for (const r of rendered) {
      expect(r.lines).toHaveLength(r.say.wide ? 1 : 2);
      for (const line of r.lines) expect(line.trim().length).toBeGreaterThan(0);
    }
    expect(rendered.some((r) => r.say.wide)).toBe(true);
    expect(rendered.some((r) => !r.say.wide)).toBe(true);
  });

  it("a wide band keeps the vocabulary and drops the third refusal", () => {
    for (const r of rendered.filter((x) => x.say.wide)) {
      expect(r.lines).toHaveLength(1);
      expect(r.lines[0]).toBe(flawInAGeneration(r.say.family));
    }
  });

  it("is deterministic — identical input, identical output", () => {
    for (const r of rendered) expect(creatorLines(r.say)).toEqual(r.lines);
  });
});

describe("the translation never restates the measurement", () => {
  /**
   * THE NON-REDUNDANCY GUARANTEE, seeded here and enforced across all three
   * instruments in E8/S8. The PM's constraint was that the two layers must not
   * make the reader feel talked down to by repetition, so it is a test rather
   * than a promise: no sentence this module emits may also appear in
   * `resultLines`, which is what the same screen already says.
   */
  it("shares no sentence with resultLines on the same session", () => {
    for (const r of rendered) {
      const existing = new Set(resultLines(r.result));
      for (const line of r.lines) expect(existing.has(line)).toBe(false);
    }
  });

  /**
   * A weaker but sharper check: the two layers must not both be built from the
   * same phrase. `bandLine` owns "You caught the damage at X" and "you were
   * guessing"; this module must not reach for either.
   */
  it("does not borrow the measurement layer's signature phrases", () => {
    for (const r of rendered) {
      const joined = r.lines.join(" ");
      expect(joined).not.toMatch(/you caught the damage at/i);
      expect(joined).not.toMatch(/you were guessing/i);
    }
  });
});

/**
 * THE CONTRACT THE RESULT SCREEN'S SPLICE DEPENDS ON (E8/S3).
 *
 * `ThresholdResult` renders the measurement lines, then the translation panel,
 * then the no-cohort footnote — because appending the panel after `resultLines`
 * put it BELOW the sign-off, which was found by reading the rendered page. The
 * component partitions by identity rather than by index, so a reorder cannot
 * silently drop the footnote; this asserts the other half, that the footnote is
 * genuinely the closing line and not something that belongs mid-body.
 *
 * Deliberately NOT a source-shape guard. This repo has been bitten twice by
 * tests that matched the exact markup someone happened to write.
 */
describe("the screen's splice contract", () => {
  it("keeps NO_COHORT_FOOTNOTE last in resultLines for every outcome kind", () => {
    for (const r of rendered) {
      const lines = resultLines(r.result);
      expect(lines).toContain(NO_COHORT_FOOTNOTE);
      expect(lines[lines.length - 1]).toBe(NO_COHORT_FOOTNOTE);
      expect(lines.filter((l) => l === NO_COHORT_FOOTNOTE)).toHaveLength(1);
    }
  });
});

describe("D1 / N3 / voice", () => {
  it("passes the voice gate on every rendering", () => {
    const strings = rendered.flatMap((r) =>
      r.lines.map((text, i) => ({
        surface: `vocabulary/threshold/${r.tag}/${i}`,
        text,
        intensity: "pointed" as const,
      })),
    );
    const violations = checkVoice(strings);
    expect(formatVoiceReport(violations)).toBe("voice check: no violations");
  });

  it("makes no claim about the person, and no promise about the future", () => {
    for (const r of rendered) {
      const joined = r.lines.join(" ");
      expect(joined).not.toMatch(/\byou will\b/i);
      expect(joined).not.toMatch(/\byour ear is\b/i);
      expect(joined).not.toMatch(/\b(better|worse) than\b/i);
      expect(joined).not.toMatch(/\bimprove\b/i);
    }
  });

  /**
   * THE DIRECTION TRAP, asserted. Lossy runs on an inverted axis, so any
   * comparative written as "below"/"under" would be backwards for it. Every
   * comparative in this module is gentler/harsher, which is true on both axes.
   */
  it("never uses a numeric comparative that inverts on the lossy ladder", () => {
    for (const r of rendered) {
      const joined = r.lines.join(" ");
      expect(joined).not.toMatch(/\b(below|under|less than|more than|above)\s+\d/i);
    }
  });
});

describe("whatGetsPast — the three band shapes, directly", () => {
  const base: ThresholdSay = {
    family: "pitch-drift",
    unit: "cents of peak detune",
    trials: 40,
    heardAt: 25,
    missedAt: 8.8,
    point: null,
    ci95: null,
    wide: false,
  };

  it("bracketed: names the range that slipped past", () => {
    expect(whatGetsPast(base)).toContain("gentler than 25 cents");
  });

  /**
   * The two situations that both produce `missedAt === null` must render the
   * SAME honest sentence, because the band cannot tell them apart. A sharp ear
   * near the gentle end and a wide interval mid-ladder are indistinguishable
   * here, and claiming the flattering one was the defect this test now holds shut.
   */
  it("heard only: pins one edge and refuses to guess the other", () => {
    const sharp = whatGetsPast({ ...base, heardAt: 4.4, missedAt: null });
    const midLadder = whatGetsPast({ ...base, heardAt: 25, missedAt: null });
    for (const s of [sharp, midLadder]) {
      expect(s).toContain("never found the level where you stop");
      expect(s).not.toMatch(/nothing .* gentle enough/i);
    }
    expect(midLadder).toContain("25 cents");
  });

  it("missed only: refuses to say what gets past", () => {
    const s = whatGetsPast({ ...base, heardAt: null });
    expect(s).toContain("cannot say what would get past");
    expect(s).toContain("8.8 cents");
  });

  it("renders the inverted lossy unit without a backwards comparative", () => {
    const s = whatGetsPast({
      ...base,
      family: "lossy-artifact",
      unit: "kbps",
      heardAt: 96,
      missedAt: 160,
    });
    expect(s).toContain("gentler than 96 kbps");
  });

  /**
   * THE WIDE-BAND HEDGE. Same band edges, same everything, one flag — and the
   * sentence must stop claiming a range. This is what keeps a near-vacuous
   * session from reading like a precise finding.
   */
  it("wide band: refuses to name a range at all", () => {
    const narrow = whatGetsPast({ ...base, wide: false });
    const wide = whatGetsPast({ ...base, wide: true });
    expect(narrow).toContain("gentler than 25 cents");
    expect(wide).not.toContain("25 cents");
    expect(wide).toContain("does not pin down");
  });

  it("has a symptom line for every family the gym can run", () => {
    for (const family of ["pitch-drift", "timing-smear", "lossy-artifact"]) {
      expect(flawInAGeneration(family).length).toBeGreaterThan(40);
    }
  });
});
