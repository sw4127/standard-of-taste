/**
 * THE THRESHOLD TEST'S RESULT IN CHINESE, BRANCH BY BRANCH (bilingual Part 4; D1, N3).
 *
 * Every fixture the English result, card, creator translation, arc and limits
 * are held on, rendered by the Chinese templates and held to what the English is
 * held to, line for line: the same number of lines, the same number of
 * sentences, no number the English does not state and every figure it prints
 * kept, and the owner's Chinese rules. D1 stands on every line except the prompt
 * card's (suspended there, by name); the carve-out and the no-comparison rule
 * stand everywhere.
 */
import { describe, expect, it } from "vitest";
import { staircaseCardFixtures } from "@/content/staircase/fixtures";
import { resultLines, thresholdShareText, cooldownBody, cooldownTitle } from "@/content/staircase/copy";
import { arcClaims, thresholdSessions } from "@/content/vocabulary/fixtures";
import { arcLines } from "@/content/vocabulary/arc";
import { creatorLines } from "@/content/vocabulary/threshold";
import { cardSections, tagsFor, worthLine } from "@/content/card/copy";
import { promptCard } from "@/engine/prompt-card";
import { delicacyArcRefusal } from "@/content/vocabulary/arc";
import { DELICACY_ARC_FLOOR } from "@/content/delicacy/arc-floor";
import { thresholdClaim } from "@/engine/evidence";
import { knownLimits } from "@/engine/staircase-manifest";
import { carveOutBreaches } from "@/content/carve-out";
import { matches } from "@/content/register";
import { ABOUT_THE_PERSON_ZH, COMPARISON_ZH } from "./guards";
import { zhBanBreaches } from "./style";
import {
  arcLinesZh,
  cardSectionsZh,
  cooldownBodyZh,
  cooldownTitleZh,
  delicacyArcRefusalZh,
  tagsForZh,
  worthLineZh,
  creatorLinesZh,
  limitStatementZh,
  resultLinesZh,
  thresholdShareTextZh,
} from "./copy/threshold-lines";
import { quantityZh, quantityZhGlossed } from "./copy/across";
import { glossFirstCentsZh } from "./copy/threshold-lines";

const WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, twice: 2,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18,
  nineteen: 19, twenty: 20,
};
const numbers = (s: string) =>
  [...s.replace(new RegExp(`\\b(${Object.keys(WORDS).join("|")})\\b`, "gi"), (w) => String(WORDS[w.toLowerCase()])).matchAll(/\d+(?:\.\d+)?/g)]
    .map((m) => m[0]);
const digitsOf = (s: string) => [...s.matchAll(/\d+(?:\.\d+)?/g)].map((m) => m[0]);
const enEnds = (s: string) => s.replace(/\d\.\d/g, "0").match(/[.?!](?=\s|$)/g)?.length ?? 0;
const zhEnds = (s: string) => s.match(/[。？！]/g)?.length ?? 0;

/**
 * THE NUMBERS IN THE ENGLISH'S ORDER (red-team, bilingual Part 4). A set comparison let a
 * template swap "heard" and "missed" and stay green, which reverses the measurement. So the
 * Chinese numbers must appear in the order the English states them: every English figure
 * printed in digits, in sequence, with an English number word ("two-way") optional.
 */
type Tok = { n: string; word: boolean };
const tokens = (s: string): Tok[] =>
  [...s.matchAll(new RegExp(`\\b(${Object.keys(WORDS).join("|")})\\b|\\d+(?:\\.\\d+)?`, "gi"))].map((m) =>
    m[1] ? { n: String(WORDS[m[1].toLowerCase()]), word: true } : { n: m[0], word: false },
  );
function inOrder(en: string, zh: string): boolean {
  const want = tokens(en);
  let j = 0;
  for (const d of digitsOf(zh)) {
    while (j < want.length && want[j].n !== d) {
      if (!want[j].word) return false; // a digit the English printed was skipped or moved
      j++;
    }
    if (j === want.length) return false; // a number the English does not state, or out of order
    j++;
  }
  return want.slice(j).every((t) => t.word);
}

/**
 * DIRECTION WORDS SURVIVE (red-team, bilingual Part 4). On the inverted lossy axis the
 * numbers cannot say which way a result points; the words do. Each English direction word
 * requires its Chinese one, and a Chinese direction word needs its English one.
 */
const DIRECTIONS: Array<[RegExp, RegExp]> = [
  // "Below anything this session pinned down" is the gentler side, and Chinese says 更轻.
  [/gentl|below anything/i, /更轻|最轻/],
  [/harsh|loudest/i, /更重|最重/],
  [/\bcaught\b|\bcatch(es|ing)?\b|calling it|called it/i, /听出了|判断得出|仍然听得出|能听出|稳定听出/],
  // "You were guessing" is a claim about a rung; 随机猜对 ("chance") is not.
  [/were guessing/i, /你是在猜/],
  [/smaller flaw|smaller rung/i, /更小的瑕疵|更小的一级/],
  [/larger flaw/i, /更大的瑕疵/],
  [/closer to\s+zero/i, /近了/],
  [/further from\s+zero/i, /远了/],
];
function directions(en: string, zh: string): string[] {
  return DIRECTIONS.flatMap(([e, z]) => (e.test(en) !== z.test(zh) ? [`${e} vs ${z}`] : []));
}

/** Line for line: same count, same sentences, the numbers in order, the direction words kept. */
function parity(en: string[], zh: string[], where: string) {
  expect(zh.length, where).toBe(en.length);
  for (let i = 0; i < en.length; i++) {
    expect(inOrder(en[i], zh[i]), `${where} [${i}] numbers out of the English's order: ${en[i]} || ${zh[i]}`).toBe(true);
    expect(directions(en[i], zh[i]), `${where} [${i}] direction: ${en[i]} || ${zh[i]}`).toEqual([]);
    expect(zhEnds(zh[i]), `${where} [${i}] sentences: ${zh[i]}`).toBe(enEnds(en[i]));
    const all = numbers(en[i]);
    expect(numbers(zh[i]).filter((n) => !all.includes(n)), `${where} [${i}] new number: ${zh[i]}`).toEqual([]);
    expect(digitsOf(en[i]).filter((n) => !numbers(zh[i]).includes(n)), `${where} [${i}] dropped figure: ${zh[i]}`).toEqual([]);
  }
}

function rules(text: string, where: string, d1: boolean) {
  expect(zhBanBreaches(text), where).toEqual([]);
  expect(carveOutBreaches(text), where).toEqual([]);
  expect(matches(text, COMPARISON_ZH), where).toEqual([]);
  if (d1) expect(ABOUT_THE_PERSON_ZH.test(text), `${where}: a readout claims something about the person (D1)`).toBe(false);
}

const fixtures = staircaseCardFixtures();

describe("the Chinese Threshold result", () => {
  it("covers every outcome kind (a floor)", () => {
    const kinds = new Set(fixtures.map((f) => f.result.kind));
    for (const k of ["threshold", "below", "above", "inconclusive"]) expect(kinds.has(k as never), k).toBe(true);
  });

  for (const { surface, result } of fixtures) {
    it(`${surface}: the result lines, the share text`, () => {
      const zh = resultLinesZh(result);
      parity(resultLines(result), zh, surface);
      rules(zh.join("\n"), surface, true);
      const share = thresholdShareTextZh(result);
      rules(share, `${surface} share`, true);
      expect(numbers(share).filter((n) => !numbers(thresholdShareText(result)).includes(n))).toEqual([]);
    });
  }

  it("the prompt card, on every fixture and on all of them together (D1 suspended; the rest holds)", () => {
    const sets = [...fixtures.map((f) => [f.result]), fixtures.map((f) => f.result)];
    let rendered = 0;
    for (const results of sets) {
      const en = cardSections(results);
      const zh = cardSectionsZh(results);
      expect(zh.length).toBe(en.length);
      for (let i = 0; i < en.length; i++) {
        if (i < en.length - 1 || en[i].lines.length !== 1 || !/,|^[a-z]/.test(en[i].lines[0])) {
          parity(en[i].lines, zh[i].lines, `card ${en[i].heading}`);
        } else {
          // The paste line: tags, one per English tag.
          expect(zh[i].lines[0].split("，").length).toBe(en[i].lines[0].split(", ").length);
        }
        rules(zh[i].lines.join("\n"), `card ${en[i].heading}`, false);
        rendered++;
      }
    }
    expect(rendered).toBeGreaterThan(fixtures.length);
  });

  it("each card axis: its worth line and its tags, one Chinese tag per English tag", () => {
    const axes = promptCard(fixtures.map((f) => f.result)).axes.concat(...fixtures.map((f) => promptCard([f.result]).axes));
    const states = new Set(axes.map((a) => `${a.state}/${a.spend}`));
    expect(states.size).toBeGreaterThan(2);
    for (const a of axes) {
      const en = worthLine(a);
      const zh = worthLineZh(a);
      expect(zh === null, a.family).toBe(en === null);
      if (en !== null && zh !== null) parity([en], [zh], `${a.family}/${a.state}`);
      expect(tagsForZh(a).length, `${a.family}/${a.state}`).toBe(tagsFor(a).length);
    }
  });

  it("the Delicacy arc refusal, from the pool and from a pool whose families differ in size", () => {
    const floors = [DELICACY_ARC_FLOOR, { ...DELICACY_ARC_FLOOR, perFamilyItemsToMove: null, perFamilyTrials: null }];
    for (const f of floors) {
      parity([delicacyArcRefusal(f)], [delicacyArcRefusalZh(f)], "delicacy refusal");
      rules(delicacyArcRefusalZh(f), "delicacy refusal", true);
    }
  });

  it("the creator translation, on every session", () => {
    let n = 0;
    for (const r of thresholdSessions()) {
      const c = thresholdClaim(r);
      if (!c.ok) continue;
      parity(creatorLines(c.value), creatorLinesZh(c.value), `${r.family}/${r.kind}`);
      rules(creatorLinesZh(c.value).join("\n"), r.family, true);
      n++;
    }
    expect(n).toBeGreaterThan(10);
  });

  it("the arc, on every claim (all three instruments)", () => {
    for (const [name, claim] of Object.entries(arcClaims())) {
      parity(arcLines(claim), arcLinesZh(claim), name);
      rules(arcLinesZh(claim).join("\n"), name, true);
    }
  });

  it("the retest refusal", () => {
    for (const family of ["pitch-drift", "timing-smear", "lossy-artifact"]) {
      parity([cooldownTitle(family)], [cooldownTitleZh(family)], family);
    }
    for (const days of [1, 2, 6]) {
      parity([cooldownBody(days)], [cooldownBodyZh(days)], `${days} days`);
      rules(cooldownBodyZh(days), `${days} days`, true);
    }
  });

  it("every limit the pipeline measured, parsed rather than retyped, keeping its figures", () => {
    const KNOWN_LIMITS = knownLimits();
    expect(KNOWN_LIMITS.length).toBeGreaterThan(0);
    for (const l of KNOWN_LIMITS) {
      const zh = limitStatementZh(l);
      const dropped = digitsOf(l.statement).filter((n) => !numbers(zh).includes(n));
      expect(dropped, `${l.kind}: ${zh}`).toEqual([]);
      rules(zh, l.kind, true);
    }
  });
  it("glosses cents, and only cents, at first use", () => {
    expect(quantityZhGlossed(25, "cents of peak detune")).toBe(`${quantityZh(25, "cents of peak detune")}（cents）`);
    expect(quantityZhGlossed(96, "kbps")).toBe(quantityZh(96, "kbps"));
    expect(glossFirstCentsZh("你在 12.5 音分上听出了损伤。到了 3.1 音分，你是在猜。")).toBe(
      "你在 12.5 音分（cents）上听出了损伤。到了 3.1 音分，你是在猜。",
    );
    expect(glossFirstCentsZh("你在 48 kbps 上听出了损伤。")).toBe("你在 48 kbps 上听出了损伤。");
  });
});
