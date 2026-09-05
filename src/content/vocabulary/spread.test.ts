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
  recognitionLine,
  recognitionLines,
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
