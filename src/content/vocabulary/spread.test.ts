/**
 * TRACK N / S4 proof. PRE-REGISTERED before the sentences were written:
 *
 *   (a) A LISTENER WHO RECOGNISED EVERYTHING GETS A REFUSAL, and it names how
 *       many were set aside, says what was needed, and invites them back
 *       (PM ruling RT-N1 a).
 *   (b) THE REFUSAL NEVER FLATTERS. No sentence congratulates a reader for
 *       recognising things — that converts a failure to measure into a verdict
 *       about the person, which is the whole thing this instrument refuses.
 *   (c) THE FILTER IS DISCLOSED AS SELF-REPORT every time it is described, and
 *       is never described as a measurement of the listener.
 *   (d) NO REFUSAL CARRIES A NUMBER THAT COULD READ AS A SCORE.
 *   (e) THE SENTENCES RENDER for every reachable state of the engine, and none
 *       of them opens with a digit or a lowercase count.
 */
import { describe, expect, it } from "vitest";
import { SPREAD_POOL } from "@/content/spread/ranking";
import { computeSpreadResult, type SpreadResult } from "@/engine/spread";
import {
  RECOGNITION_DISCLOSURE,
  SPREAD_BOUNDARY,
  directionLine,
  figuresLine,
  recognitionLine,
  recognitionLines,
  spreadLines,
  spreadRefusal,
} from "./spread";

const ids = SPREAD_POOL.map((i) => i.id);
const rate = (values: number[]) =>
  Object.fromEntries(ids.map((id, n) => [id, values[n]])) as Record<string, number>;
const VALUES = rate([9, 2, 7, 1, 8, 3]);

/** Every state of the filter a real sitting can reach. */
const states: Record<string, SpreadResult> = {
  "nothing recognised": computeSpreadResult(VALUES),
  "one recognised, still readable": computeSpreadResult(VALUES, ["sp2"]),
  "one recognised, far pairs collapse": computeSpreadResult(VALUES, ["sp1"]),
  "everything recognised": computeSpreadResult(VALUES, ids),
};

describe("(a) recognising everything produces a refusal, not a number", () => {
  it("refuses, names what was set aside, and invites the reader back", () => {
    const r = states["everything recognised"];
    expect(r.refusal).toBe("too-few-rated-clips");
    const text = spreadRefusal(r);
    expect(text).toContain("six"); // all of them, spelled
    expect(text.toLowerCase()).toContain("come back");
    expect(text).toMatch(/nothing here to read/i);
  });

  it("refuses when the far pairs collapse, saying what it needed", () => {
    const r = states["one recognised, far pairs collapse"];
    expect(r.refusal).toBe("too-few-far-pairs");
    const text = spreadRefusal(r);
    expect(text).toMatch(/no number/i);
    expect(text).toContain("three"); // MIN_PAIRS_PER_KIND, spelled
    expect(text.toLowerCase()).toContain("come back");
  });

  it("puts the refusal in the reading, so the screen is never just blank", () => {
    for (const [name, r] of Object.entries(states)) {
      const lines = recognitionLines(r);
      expect(lines.length, name).toBeGreaterThan(0);
      expect(lines.length === 2, name).toBe(r.refusal !== null);
    }
  });
});

describe("(b) the refusal never flatters", () => {
  it("says nothing congratulatory to a reader who recognised everything", () => {
    // The warm, obvious, wrong sentence is "you know your Beethoven!" — it
    // turns a failure to measure into a compliment about the person.
    const flattering =
      /well done|nice work|impressive|good ear|you know your|clearly know|expert|connoisseur|congratulat/i;
    for (const [name, r] of Object.entries(states)) {
      for (const line of recognitionLines(r)) {
        expect(flattering.test(line), `${name}: ${line}`).toBe(false);
      }
    }
  });

  it("never treats recognition as something the listener did well or badly", () => {
    const verdict = /score|scored|rank|ranked|percentile|better than|worse than|average listener/i;
    for (const [name, r] of Object.entries(states)) {
      for (const line of recognitionLines(r)) {
        expect(verdict.test(line), `${name}: ${line}`).toBe(false);
      }
    }
  });
});

describe("(c) the filter is disclosed as self-report, never as a measurement", () => {
  it("carries the disclosure wherever the filter is described", () => {
    for (const [name, r] of Object.entries(states)) {
      if (r.refusal === "too-few-rated-clips") continue; // no clips counted at all
      expect(recognitionLine(r), name).toContain(RECOGNITION_DISCLOSURE);
    }
  });

  it("says plainly that nothing was checked", () => {
    expect(RECOGNITION_DISCLOSURE).toMatch(/took your word|nothing here checks/i);
    expect(RECOGNITION_DISCLOSURE).toMatch(/not part of any result/i);
  });

  it("states that agreement is not what is being looked at", () => {
    expect(SPREAD_BOUNDARY).toMatch(/never at which one you put higher/i);
    expect(SPREAD_BOUNDARY).toMatch(/costs you nothing/i);
  });
});

describe("(d) no refusal carries a number that could read as a score", () => {
  it("spells its counts as words, so nothing looks like a mark", () => {
    for (const [name, r] of Object.entries(states)) {
      if (!r.refusal) continue;
      const text = spreadRefusal(r);
      expect(/\d/.test(text), `${name}: ${text}`).toBe(false);
    }
  });

  it("prints no mean gap anywhere in a refused reading", () => {
    for (const [name, r] of Object.entries(states)) {
      if (!r.refusal) continue;
      expect(r.far.meanGap, name).toBeNull();
      expect(r.close.meanGap, name).toBeNull();
    }
  });
});

describe("(f) the reading states two numbers and refuses their difference", () => {
  const readable = computeSpreadResult(VALUES);

  it("prints both figures and the chance baseline", () => {
    const text = figuresLine(readable);
    expect(text).toContain(readable.far.meanGap!.toFixed(1));
    expect(text).toContain(readable.close.meanGap!.toFixed(1));
    expect(text).toContain(readable.spreadIfIndifferent.toFixed(1));
  });

  it("never prints the difference between the two numbers", () => {
    // 4.0 and 4.8 on this input; 0.8 must appear nowhere.
    const far = readable.far.meanGap!;
    const close = readable.close.meanGap!;
    const gap = Math.abs(far - close).toFixed(1);
    for (const line of spreadLines(readable)) {
      expect(line.includes(` ${gap} `), `line prints the difference: ${line}`).toBe(false);
    }
  });

  it("attaches the refusal to the direction, in the same sentence", () => {
    // Not a caveat further down that a reader can skip: the sentence that
    // names which number is larger has to carry the limit itself.
    const text = directionLine(readable);
    expect(text).toMatch(/moved further apart|moved the same amount/);
    expect(text).toMatch(/cannot answer|no honest size/i);
  });

  it("offers no threshold at which the difference becomes a result", () => {
    const banned =
      /significant|meaningful difference|clearly better|you discriminate|proves|demonstrates|strong evidence/i;
    for (const line of spreadLines(readable)) {
      expect(banned.test(line), line).toBe(false);
    }
  });

  it("names the direction correctly for a reader whose gaps fall the other way", () => {
    // sp3 alone at the bottom sits in three of the four CLOSE pairs.
    const other = computeSpreadResult(rate([7, 7, 0, 7, 7, 7]));
    expect(other.close.meanGap!).toBeGreaterThan(other.far.meanGap!);
    expect(directionLine(other)).toContain("where his judgment did not");
  });

  it("gives the flat rater a sentence about what actually happened", () => {
    // The even-handed template said "moved the same amount either way" for
    // someone who moved nothing — a symmetry where the fact is a standstill.
    const flat = computeSpreadResult(rate([6, 6, 6, 6, 6, 6]));
    expect(flat.far.meanGap).toBe(0);
    expect(flat.close.meanGap).toBe(0);
    const text = directionLine(flat);
    expect(text).toContain("same rating");
    expect(text).not.toContain("the same amount either way");
    expect(text).toMatch(/real answer rather than a failed attempt/);
  });

  it("keeps the even-handed sentence for a reader who moved but moved equally", () => {
    // sp1 and sp3 both at 0 makes both means equal and non-zero, so the
    // flat-rater branch must NOT swallow this case.
    const even = computeSpreadResult(rate([0, 5, 0, 5, 5, 5]));
    expect(even.far.meanGap).toBe(even.close.meanGap);
    expect(even.far.meanGap).toBeGreaterThan(0);
    expect(directionLine(even)).toContain("the same amount either way");
  });

  it("says a small number is not a poor result, every time", () => {
    // The likeliest misreading of any figure this product prints.
    expect(SPREAD_BOUNDARY).toMatch(/not a poor result/i);
    expect(SPREAD_BOUNDARY).toMatch(/not spaced out by quality/i);
    for (const [name, r] of Object.entries(states)) {
      expect(spreadLines(r).some((l) => /not a poor result/i.test(l)), name).toBe(true);
    }
  });

  it("composes nothing numeric on a refused reading", () => {
    const refused = computeSpreadResult(VALUES, ids);
    expect(() => figuresLine(refused)).toThrow(/refused reading/);
    expect(() => directionLine(refused)).toThrow(/refused reading/);
    expect(spreadLines(refused)).toEqual([
      ...recognitionLines(refused),
      SPREAD_BOUNDARY,
    ]);
  });

  it("always ends with the limit, readable or not", () => {
    for (const [name, r] of Object.entries(states)) {
      const lines = spreadLines(r);
      expect(lines[lines.length - 1], name).toBe(SPREAD_BOUNDARY);
    }
  });
});

describe("(e) the sentences render, and read as sentences", () => {
  it("opens every line with a capital, not a digit or a lowercase count", () => {
    // The lowercase-sentence defect has happened three times in this repo.
    for (const [name, r] of Object.entries(states)) {
      for (const line of recognitionLines(r)) {
        expect(line.length, name).toBeGreaterThan(40);
        expect(/^[A-Z]/.test(line), `${name}: ${line.slice(0, 40)}`).toBe(true);
      }
    }
  });

  it("ends every line as a sentence", () => {
    for (const [name, r] of Object.entries(states)) {
      for (const line of recognitionLines(r)) {
        expect(/[.!?]$/.test(line), `${name}: ...${line.slice(-40)}`).toBe(true);
      }
    }
  });

  it("never pairs a singular count with a plural noun, or the reverse", () => {
    // NOTHING MAY COUNT. The first draft rendered "only one usable
    // closely-spaced pairs" in two of five states, and every guard was green.
    // Found by printing the copy and reading it.
    // "work"/"works" is deliberately NOT in these lists. "This one only works
    // on music that is new to you" is a verb, and including the noun sense
    // fired the guard on correct copy — a guard with a false positive is a
    // guard the next person weakens rather than reads.
    const singularThenPlural =
      /\bone\s+(?:\w+[- ]){0,3}(?:pairs|clips|values|points|degrees)\b/i;
    const pluralThenSingular =
      /\b(?:two|three|four|five|six|seven|eight|nine|ten)\s+(?:\w+[- ]){0,3}(?:pair|clip|value|point|degree)\b/i;
    for (const [name, r] of Object.entries(states)) {
      for (const line of recognitionLines(r)) {
        expect(singularThenPlural.test(line), `${name}: ${line}`).toBe(false);
        expect(pluralThenSingular.test(line), `${name}: ${line}`).toBe(false);
      }
    }
  });

  it("never promises a reading it is about to refuse", () => {
    // "what follows rests on the zero that were new to you" — the sentence the
    // all-recognised case produced, immediately above a refusal.
    for (const [name, r] of Object.entries(states)) {
      if (r.usedClipIds.length > 0) continue;
      const line = recognitionLine(r);
      expect(line.toLowerCase().includes("what follows"), `${name}: ${line}`).toBe(false);
      expect(/\bthe zero\b/i.test(line), `${name}: ${line}`).toBe(false);
    }
  });

  it("agrees with itself on singular and plural", () => {
    const one = recognitionLine(computeSpreadResult(VALUES, ["sp2"]));
    expect(one).toMatch(/One clip you had heard before was set aside/);
    const two = recognitionLine(computeSpreadResult(VALUES, ["sp2", "sp3"]));
    expect(two).toMatch(/Two clips you had heard before were set aside/);
  });

  it("says all of them counted when nothing was recognised", () => {
    const r = states["nothing recognised"];
    expect(r.excludedClipIds).toEqual([]);
    expect(recognitionLine(r)).toMatch(/none of these were familiar/i);
    expect(recognitionLines(r).length).toBe(1);
  });
});
