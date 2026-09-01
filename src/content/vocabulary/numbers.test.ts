/**
 * E15/S1 — the speller that lets a derived count keep the deck's voice.
 *
 * PRE-REGISTERED: every count this product could plausibly print must come out
 * as the word a person would write; the boundaries (nineteen/twenty, ninety-
 * nine/one hundred) must be right, since off-by-one there is the classic
 * failure of a table-driven speller; and a value that is not a count must throw
 * rather than reach a public page as "NaN pairs".
 */
import { describe, expect, it } from "vitest";
import { NUMBER_WORD_MAX, numberWord } from "./numbers";

describe("numberWord", () => {
  it("spells the counts this product actually prints", () => {
    expect(numberWord(0)).toBe("zero");
    expect(numberWord(4)).toBe("four");
    expect(numberWord(5)).toBe("five");
    expect(numberWord(6)).toBe("six");
    expect(numberWord(15)).toBe("fifteen");
    expect(numberWord(18)).toBe("eighteen");
  });

  it("gets the teens-to-twenties boundary right, where table spellers break", () => {
    expect(numberWord(19)).toBe("nineteen");
    expect(numberWord(20)).toBe("twenty");
    expect(numberWord(21)).toBe("twenty-one");
    expect(numberWord(30)).toBe("thirty");
    expect(numberWord(42)).toBe("forty-two");
    expect(numberWord(99)).toBe("ninety-nine");
  });

  it("falls back to the numeral rather than to a wrong word", () => {
    expect(numberWord(NUMBER_WORD_MAX)).toBe("ninety-nine");
    expect(numberWord(NUMBER_WORD_MAX + 1)).toBe("100");
    expect(numberWord(1234)).toBe("1234");
  });

  it("throws on anything that is not a count, rather than printing it", () => {
    expect(() => numberWord(-1)).toThrow(/non-negative integer/);
    expect(() => numberWord(2.5)).toThrow(/non-negative integer/);
    expect(() => numberWord(Number.NaN)).toThrow(/non-negative integer/);
  });
});
