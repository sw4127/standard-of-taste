import { describe, expect, it } from "vitest";
import { creatorLines, familyTallies, namingLine, perFamilyRefusal, FLAW_IN_YOUR_WORK } from "./delicacy";
import {
  DELICACY_INSTRUMENT_ID,
  MEASURED_TRIALS,
} from "@/content/delicacy/items";
import {
  computeDelicacyResult,
  DEGRADATION_FAMILIES,
  type DelicacyConfidence,
  type DelicacyResponses,
} from "@/engine/delicacy";
import { delicacyResultSummary, flawLineText } from "@/content/delicacy/copy";
import { checkVoice, formatVoiceReport } from "@/content/voice";

function build(pick: (i: number, fam: string) => { ok: boolean; conf: DelicacyConfidence; flawRight: boolean }) {
  const responses: DelicacyResponses = {};
  MEASURED_TRIALS.forEach((t, i) => {
    const d = pick(i, t.family);
    const other = DEGRADATION_FAMILIES.find((f) => f !== t.family)!;
    responses[t.id] = {
      pickedSide: d.ok ? t.originalSide : t.originalSide === "a" ? "b" : "a",
      flawPick: d.flawRight ? t.family : other,
      confidence: d.conf,
    };
  });
  return computeDelicacyResult(DELICACY_INSTRUMENT_ID, MEASURED_TRIALS, responses);
}

const SESSIONS = {
  overconfident: build((i) => ({ ok: i % 15 < 8, conf: 95, flawRight: i % 3 !== 0 })),
  underconfident: build((i) => ({ ok: i % 15 !== 3 && i % 15 !== 9, conf: 50, flawRight: true })),
  uneven: build((i, fam) => {
    const ok = fam === "pitch-drift" ? true : fam === "timing-smear" ? i % 2 === 0 : i % 5 !== 0;
    return { ok, conf: ok ? 95 : 50, flawRight: ok && i % 4 !== 0 };
  }),
  /** Caught nothing — the flaw question was never asked. `flawEligible === 0`. */
  blank: build(() => ({ ok: false, conf: 50, flawRight: false })),
};

describe("the rendered deck", () => {
  it("prints every session", () => {
    for (const [name, r] of Object.entries(SESSIONS)) {
      console.log(`\n### ${name} — ${r.nCorrect}/${r.nTrials}, flaw ${r.flawCorrect}/${r.flawEligible}`);
      for (const line of creatorLines(r)) console.log(`    ${line}`);
      console.log(`    [NOT ON THE RESULT SCREEN — expert view only: ${familyTallies(r).map((t) => `${t.family} ${t.correct}/${t.n}`).join(", ")}]`);
    }
  });
});

/**
 * THE PRE-REGISTERED PROOF FOR THIS SLICE.
 *
 * The block shows three per-family counts side by side. It never states a
 * ranking, but three numbers in a column invite one, so the honest question is
 * not "is my sentence true" — counts are facts — but "how often does this
 * display LOOK like a ranking when there is nothing to rank". That is
 * measurable, and it is the number that justifies putting the refusal first.
 */
describe("MEASURED: how often equal ability still shows unequal counts", () => {
  function mulberry(seed: number) {
    let a = seed >>> 0;
    return () => {
      a += 0x6d2b79f5;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  it("re-derives the figure quoted in the module header", () => {
    const perFamily = Math.min(...DEGRADATION_FAMILIES.map((f) => SESSIONS.uneven.byFamily[f].n));
    expect(perFamily).toBe(5);

    const N = 60000;
    const rnd = mulberry(4242);
    const rates: Record<string, number> = {};
    for (const p of [0.6, 0.7, 0.8]) {
      let unequal = 0;
      for (let i = 0; i < N; i++) {
        const c = DEGRADATION_FAMILIES.map(() => {
          let k = 0;
          for (let t = 0; t < perFamily; t++) if (rnd() < p) k++;
          return k;
        });
        if (Math.max(...c) - Math.min(...c) >= 1) unequal++;
      }
      rates[`p=${p}`] = +((unequal / N) * 100).toFixed(1);
    }
    console.log(`\nTRUE NULL (identical ability on all three), ${perFamily} pairs each:`);
    for (const [k, v] of Object.entries(rates)) console.log(`   ${k}: counts differ ${v}% of the time`);

    // The header says "about nine times in ten". Hold it to that.
    for (const v of Object.values(rates)) expect(v).toBeGreaterThan(75);
    expect(Math.max(...Object.values(rates))).toBeGreaterThan(88);
  });
});

describe("the refusal is present and leads", () => {
  it("refuses the ranking on every session the shipped pool can produce", () => {
    for (const r of Object.values(SESSIONS)) {
      const refusal = perFamilyRefusal(r);
      expect(refusal).not.toBeNull();
      expect(refusal).toMatch(/will not break your result down/i);
    }
  });

  /**
   * …but a session that caught nothing gets ONE sentence. Its naming line is
   * already a refusal, and stacking a second one under it is boilerplate.
   */
  it("does not stack two refusals on a session that caught nothing", () => {
    expect(SESSIONS.blank.flawEligible).toBe(0);
    const lines = creatorLines(SESSIONS.blank);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatch(/never got far enough/i);
    // The scoring sessions still get both.
    expect(creatorLines(SESSIONS.uneven)).toHaveLength(2);
  });

  /**
   * THE COUNTS MUST NOT REACH THE RESULT SCREEN. `familyTallies` still exists
   * for the expert view, but nothing `creatorLines` emits may contain a
   * per-family tally — that is the whole point of the slice's pre-registered
   * condition firing.
   */
  it("leaks no per-family count into the result-screen copy", () => {
    for (const r of Object.values(SESSIONS)) {
      const joined = creatorLines(r).join(" ");
      for (const t of familyTallies(r)) {
        expect(joined).not.toContain(`${t.correct} of ${t.n}`);
        expect(joined).not.toContain(t.label);
      }
    }
    // …but they remain available to Track C.
    expect(familyTallies(SESSIONS.uneven)).toHaveLength(3);
  });

  it("never emits a per-family percentage", () => {
    for (const r of Object.values(SESSIONS)) {
      for (const t of familyTallies(r)) {
        expect(t.n).toBe(5);
        expect(`${t.correct} of ${t.n}`).not.toMatch(/%/);
      }
      expect(creatorLines(r).join(" ")).not.toMatch(/\d+\s*%/);
    }
  });
});

describe("naming line", () => {
  it("uses the eligible denominator, never the trial count", () => {
    const r = SESSIONS.overconfident;
    const line = namingLine(r)!;
    expect(line).toContain(`${r.flawCorrect} of the ${r.flawEligible} times`);
    expect(line).not.toContain(`of the ${r.nTrials} times`);
  });

  /** No data is not a score of zero (N3). */
  it("refuses a naming read when the question was never asked", () => {
    expect(SESSIONS.blank.flawEligible).toBe(0);
    const line = namingLine(SESSIONS.blank)!;
    expect(line).toMatch(/never got far enough/i);
    expect(line).not.toMatch(/\b0 of\b/);
  });

  /**
   * The count comes from the engine, not from `flawAccuracy * flawEligible`.
   * 13/15 is 0.8666…; a ratio round-trip is one rounding rule away from 12.
   */
  it("prints the engine's own count for every reachable score", () => {
    for (const r of Object.values(SESSIONS)) {
      if (r.flawEligible === 0) continue;
      expect(namingLine(r)!).toContain(`${r.flawCorrect} of the ${r.flawEligible} times`);
    }
  });

  it("is deterministic", () => {
    for (const r of Object.values(SESSIONS)) expect(creatorLines(r)).toEqual(creatorLines(r));
  });
});

describe("never restates what the screen already says", () => {
  it("shares no sentence with the existing delicacy copy", () => {
    for (const r of Object.values(SESSIONS)) {
      const existing = [delicacyResultSummary(r), flawLineText(r.flawCorrect, r.flawEligible)];
      for (const line of creatorLines(r)) expect(existing).not.toContain(line);
    }
  });

  /**
   * Calibration already has its own named block on the shipped page ("DID YOU
   * KNOW WHEN YOU KNEW?"). This layer must not open a second one.
   */
  it("says nothing about confidence or calibration", () => {
    for (const r of Object.values(SESSIONS)) {
      const joined = creatorLines(r).join(" ");
      expect(joined).not.toMatch(/calibrat|confiden|brier|sure on average/i);
    }
  });

  it("does not reuse the Threshold layer's long symptom sentences", async () => {
    const { FLAW_IN_A_GENERATION } = await import("./threshold");
    for (const family of DEGRADATION_FAMILIES) {
      expect(FLAW_IN_YOUR_WORK[family]).not.toBe(FLAW_IN_A_GENERATION[family]);
      expect(FLAW_IN_YOUR_WORK[family].length).toBeLessThan(FLAW_IN_A_GENERATION[family].length);
    }
  });
});

describe("D1 / N3 / voice", () => {
  it("passes the voice gate on every line of every session", () => {
    const strings = Object.entries(SESSIONS).flatMap(([name, r]) =>
      creatorLines(r).map((text, i) => ({
        surface: `vocabulary/delicacy/${name}/${i}`,
        text,
        intensity: "pointed" as const,
      })),
    );
    expect(formatVoiceReport(checkVoice(strings))).toBe("voice check: no violations");
  });

  it("makes no claim about the person and no comparison to anyone", () => {
    for (const r of Object.values(SESSIONS)) {
      const joined = creatorLines(r).join(" ");
      expect(joined).not.toMatch(/\byour ear is\b/i);
      expect(joined).not.toMatch(/\bmost (people|listeners)\b/i);
      expect(joined).not.toMatch(/\bpercentile\b/i);
      expect(joined).not.toMatch(/\byou will\b/i);
    }
  });
});
