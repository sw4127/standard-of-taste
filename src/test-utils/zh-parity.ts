/**
 * A CHINESE LINE SAYS WHAT ITS ENGLISH LINE SAYS, AS FAR AS A MACHINE CAN TELL (bilingual Part 4).
 *
 * Shared by every template test that holds a Chinese template to its English one
 * (the Threshold Test's, the Prestige Test's, the Delicacy Trials'): the same number
 * of lines, the same number of sentences, the numbers in the English's order, and
 * the direction words (gentler/harsher, caught/guessing, toward/against) kept.
 * It cannot read meaning; the owner's writing pass does that.
 */
import { expect } from "vitest";
import { DIRECTION_PAIRS_ZH, zhNumeralsIn } from "@/content/zh/guards";

/** Chinese sentence ends: the full stop, question mark and exclamation mark, full width. */
const ZH_ENDS = /[\u3002\uff1f\uff01]/g;

export const WORDS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, twice: 2,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18,
  nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
  // Read since the Chinese numerals are (red-team, Part 4): a half, an ordinal, both.
  half: 0.5, second: 2, both: 2,
};
const TENS = "twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety";
const UNITS = "one|two|three|four|five|six|seven|eight|nine";
/** An English number word, compounds first ("thirty-four" is 34, not 30 and 4). */
const WORD_SOURCE = `\\b(?:(${TENS})-(${UNITS})|(${Object.keys(WORDS).join("|")}))\\b`;
function wordValue(m: readonly (string | undefined)[]): number {
  return m[1] ? WORDS[m[1].toLowerCase()] + WORDS[m[2]!.toLowerCase()] : WORDS[m[3]!.toLowerCase()];
}
export const numbers = (s: string) =>
  [...s.replace(new RegExp(WORD_SOURCE, "gi"), (...m: string[]) => String(wordValue(m))).matchAll(/\d+(?:\.\d+)?/g)].map(
    (m) => m[0],
  );
export const digitsOf = (s: string) => [...s.matchAll(/\d+(?:\.\d+)?/g)].map((m) => m[0]);
export const enEnds = (s: string) => s.replace(/\d\.\d/g, "0").match(/[.?!](?=\s|$)/g)?.length ?? 0;
export const zhEnds = (s: string) => s.match(ZH_ENDS)?.length ?? 0;

/**
 * THE NUMBERS IN THE ENGLISH'S ORDER (red-team, bilingual Part 4). A set comparison let a
 * template swap "heard" and "missed" and stay green, which reverses the measurement. So the
 * Chinese numbers must appear in the order the English states them: every English figure
 * printed in digits, in sequence, with an English number word ("two-way") optional.
 */
type Tok = { n: string; word: boolean };
const tokens = (s: string): Tok[] =>
  [...s.replace(/\ba hundred and one\b/gi, "101").matchAll(new RegExp(`${WORD_SOURCE}|\\d+(?:\\.\\d+)?`, "gi"))].map((m) =>
    m[1] || m[3] ? { n: String(wordValue(m)), word: true } : { n: m[0], word: false },
  );
export function inOrder(en: string, zh: string): boolean {
  const want = tokens(en);
  // Digits and Chinese numerals both (red-team, Part 4): "nine times in ten" in Chinese is two numbers.
  const got = zhNumeralsIn(zh);
  // Backtracking, because a number word may or may not be the one a Chinese digit stands for:
  // "one skill ... 1 of 1" must not spend a digit on "one" (bilingual Part 4).
  const match = (i: number, j: number): boolean => {
    if (i === got.length) return want.slice(j).every((t) => t.word); // every printed digit kept
    if (j === want.length) return false; // a number the English does not state, or out of order
    if (want[j].n === got[i] && match(i + 1, j + 1)) return true;
    return want[j].word && match(i, j + 1); // a digit the English printed cannot be skipped
  };
  return match(0, 0);
}

export function directions(en: string, zh: string): string[] {
  return DIRECTION_PAIRS_ZH.flatMap((p) => {
    const e = p.en.test(en);
    const z = p.zh.test(zh);
    return (e && !z) || (p.twoWay && z && !e) ? [`${p.en} vs ${p.zh}`] : [];
  });
}

/** Line for line: same count, same sentences, the numbers in order, the direction words kept. */
export function parity(en: string[], zh: string[], where: string) {
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

