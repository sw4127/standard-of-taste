/**
 * THE RANKING TEST'S READING IN CHINESE, BRANCH BY BRANCH (bilingual Part 2; D1, N3).
 *
 * Every state a real sitting can reach, and every direction of the result,
 * rendered by the Chinese templates and held to what the English ones are held
 * to: D1 stands here (an instrument readout says what the ratings did, never
 * who the person is), no comparison with other people, the carve-out, and the
 * owner's Chinese rules. And line for line, each Chinese line states the
 * numbers its English line states.
 */
import { describe, expect, it } from "vitest";
import { SPREAD_POOL } from "@/content/spread/ranking";
import { computeSpreadResult, type SpreadResult } from "@/engine/spread";
import { spreadLines } from "@/content/vocabulary/spread";
import { carveOutBreaches } from "@/content/carve-out";
import { matches } from "@/content/register";
import { ABOUT_THE_PERSON_ZH, COMPARISON_ZH } from "./guards";
import { zhBanBreaches } from "./style";
import { spreadLinesZh } from "./copy/spread-lines";
import { brierNoteZh } from "./copy/expert";

const ids = SPREAD_POOL.map((i) => i.id);
const rate = (values: number[]) => Object.fromEntries(ids.map((id, n) => [id, values[n]])) as Record<string, number>;
const VALUES = rate([9, 2, 7, 1, 8, 3]);

/** A sitting that refuses for want of close pairs, found by search rather than guessed. */
function closeRefusal(): SpreadResult {
  for (let mask = 1; mask < 1 << ids.length; mask++) {
    const recognised = ids.filter((_, i) => mask & (1 << i));
    const r = computeSpreadResult(VALUES, recognised);
    if (r.refusal === "too-few-close-pairs") return r;
  }
  throw new Error("no recognition pattern reaches too-few-close-pairs; the pool changed");
}

const STATES: Record<string, SpreadResult> = {
  "close pairs collapse": closeRefusal(),
  "nothing recognised": computeSpreadResult(VALUES),
  "one recognised, still readable": computeSpreadResult(VALUES, ["sp2"]),
  "one recognised, far pairs collapse": computeSpreadResult(VALUES, ["sp1"]),
  "everything recognised": computeSpreadResult(VALUES, ids),
  "every rating the same": computeSpreadResult(rate([6, 6, 6, 6, 6, 6])),
  "gaps wider where he did not separate": computeSpreadResult(rate([7, 7, 0, 7, 7, 7])),
  "gaps the same either way": computeSpreadResult(rate([0, 5, 0, 5, 5, 5])),
};

const WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
};
const numbers = (s: string) =>
  [...s.replace(/\b(one|two|three|four|five|six|seven|eight|nine|ten)\b/gi, (w) => String(WORDS[w.toLowerCase()])).matchAll(/\d+(?:\.\d+)?/g)]
    .map((m) => m[0])
    .sort();

describe("the Chinese Ranking reading", () => {
  it("reaches a refusal, a flat result and all three directions (a floor)", () => {
    const refusals = Object.values(STATES).map((r) => r.refusal);
    expect(refusals).toContain("too-few-rated-clips");
    expect(refusals.filter((r) => r === null).length).toBeGreaterThanOrEqual(4);
  });

  for (const [name, r] of Object.entries(STATES)) {
    it(`${name}: same lines as the English, same numbers, and the rules hold`, () => {
      const en = spreadLines(r);
      const zh = spreadLinesZh(r);
      expect(zh.length).toBe(en.length);
      for (let i = 0; i < en.length; i++) {
        // No number the English does not state (English words counted), and every figure
        // the English prints in digits (the means, the chance figure) kept.
        const enAll = numbers(en[i]);
        expect(numbers(zh[i]).filter((n) => !enAll.includes(n)), zh[i]).toEqual([]);
        const enDigits = [...en[i].matchAll(/\d+(?:\.\d+)?/g)].map((m) => m[0]);
        expect(enDigits.filter((n) => !numbers(zh[i]).includes(n)), zh[i]).toEqual([]);
      }
      // The result's own counts, which the English spells as words, are in the Chinese as digits.
      const text = zh.join("\n");
      if (r.refusal === null) {
        expect(text).toContain(`${r.far.count} 对`);
        expect(text).toContain(`${r.close.count} 对`);
      }
      if (r.excludedClipIds.length > 0) expect(text).toContain(`${r.excludedClipIds.length} 段`);
      const all = zh.join("\n");
      expect(zhBanBreaches(all)).toEqual([]);
      expect(carveOutBreaches(all)).toEqual([]);
      expect(ABOUT_THE_PERSON_ZH.test(all), "an instrument readout claims something about the person (D1)").toBe(false);
      expect(matches(all, COMPARISON_ZH)).toEqual([]);
    });
  }

  it("types no count as a Chinese numeral: every count comes from the result, as digits", () => {
    // The counts are clips (段) and pairs (对); a numeral before either unit is a count typed by
    // hand. 两 elsewhere is ordinary Chinese: 两个数字 "the two numbers", 两部作品 "the pair's two works".
    const typed = Object.values(STATES)
      .flatMap((r) => spreadLinesZh(r))
      .filter((l) => /[二两三四五六七八九十]\s*(段|对)/.test(l));
    expect(typed).toEqual([]);
  });

  it("writes the Brier note with its numbers and within the rules", () => {
    const note = brierNoteZh(0.187, 15, 0.25);
    expect(note).toContain("0.187");
    expect(note).toContain("15");
    expect(note).toContain("0.25");
    expect(zhBanBreaches(note)).toEqual([]);
  });
});
