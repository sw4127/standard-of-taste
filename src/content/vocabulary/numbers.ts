/**
 * SPELLED-OUT COUNTS, SO A DERIVED NUMBER CAN STILL SOUND LIKE PROSE (E15/S1).
 *
 * WHY THIS EXISTS AT ALL. The delicacy refusal shipped "six of the fifteen
 * pairs" as a typed literal — two counts about the item pool, written by hand,
 * with nothing tying them to the pool that produced them. Grow the pool and
 * both sentences go quietly false, on `/method` and `/learn/practice` as well
 * as in the refusal itself. That is NOTHING MAY COUNT, which this project has
 * now fixed three times in `arc.ts` alone.
 *
 * The fix is to compute the counts. But the deck writes counts as words, not
 * digits, and swapping to "6 of the 15 pairs" would be a VOICE change made as
 * a side effect of an engineering fix — the copy decks are awaiting the PM's
 * writing pass, and changing register underneath that is not mine to do. So
 * the number is derived and then spelled, and the sentence reads exactly as it
 * did while no longer being a claim about a pool nobody checked.
 *
 * IT DEGRADES TO DIGITS RATHER THAN GUESSING. Above ninety-nine the word form
 * gets long enough to hurt the sentence more than it helps, and no count in
 * this product is near it; past that bound it returns the numeral, which is
 * ugly and true rather than absent or wrong. Anything not a non-negative
 * integer is a programming error and throws, because a silent "NaN pairs" on a
 * public page is the failure mode this module was written to prevent.
 */

const ONES = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
] as const;

const TENS = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
] as const;

/** Beyond this the numeral reads better than the word. */
export const NUMBER_WORD_MAX = 99;

/**
 * `numberWord(15)` -> "fifteen"; `numberWord(21)` -> "twenty-one";
 * `numberWord(140)` -> "140".
 */
export function numberWord(n: number): string {
  if (!Number.isInteger(n) || n < 0) {
    throw new Error(`numberWord: expected a non-negative integer, got ${String(n)}`);
  }
  if (n > NUMBER_WORD_MAX) return String(n);
  if (n < ONES.length) return ONES[n];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return ones === 0 ? TENS[tens] : `${TENS[tens]}-${ONES[ones]}`;
}
