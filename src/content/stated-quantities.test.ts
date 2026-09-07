/**
 * NO PAGE TYPES IN A QUANTITY A MODULE ALREADY EXPORTS (E19/S12).
 *
 * WHAT WENT WRONG. Cowork's batch-2 return, run with the repository closed,
 * found eleven quantities written into the reading room by hand — sixteen
 * clips, fourteen labels, two controls, two swaps, six pieces of music, forty
 * seconds, four minutes — describing instruments whose pools are versioned and
 * have already grown once. `/learn/comparison` slots the same clip count from
 * the pool while `/learn/prestige-bias-test` typed it, on the same site, about
 * the same test. The day the pool grows again, one page is right and the other
 * is silently wrong.
 *
 * Part 3's own preamble states the rule and nothing in Part 3 enforced it. This
 * is the enforcement, and it is the shape Cowork suggested: flag a bare numeral
 * or number-word in page prose that matches a value a module exports.
 *
 * SCOPED TO THE PAGES THAT DESCRIBE THE INSTRUMENT, for the reason the clip
 * length guard in `bias/claims.test.ts` already learned the hard way: a check
 * that cannot tell a duration from a length gets switched off by whoever it
 * wakes at 2am. A number in prose about something else is not this guard's
 * business.
 *
 * IT CANNOT CATCH EVERY SPELLING and does not pretend to. It catches the counts
 * this product actually states, in the two forms it states them — digits and
 * number-words — on the surfaces that describe the instruments those counts
 * belong to.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  BIAS_CLIP_COUNT,
  BIAS_CONTROL_COUNT,
  BIAS_LABELLED_COUNT,
  BIAS_SESSION_MINUTES,
  BIAS_SWAPPED_COUNT,
  SPREAD_CLIP_SECONDS,
  SPREAD_SESSION_MINUTES,
  SPREAD_WORK_COUNT,
} from "./instrument-shape";
import { ARC_FLOORS, soloFloorFactor } from "@/engine/arc";

const NL = String.fromCharCode(10);

const WORDS: Record<number, string> = {
  2: "two", 3: "three", 4: "four", 5: "five", 6: "six", 7: "seven", 8: "eight",
  9: "nine", 10: "ten", 12: "twelve", 14: "fourteen", 15: "fifteen", 16: "sixteen",
  18: "eighteen", 20: "twenty", 24: "twenty-four", 30: "thirty", 40: "forty",
  /*
   * A FRACTION SPELLED OUT, because /learn/practice wrote its pitch floor as
   * "three and a half times" and the first version of this guard could not see
   * it: the value is not an integer and "times" was not a noun it counted.
   * Mutation R typed that floor back in and passed. A guard that covers the
   * quantities it happens to have met is a guard that stops where the last
   * defect stopped.
   */
  3.5: "three and a half",
};

interface Quantity {
  readonly name: string;
  readonly value: number;
  /** The noun the page uses right after the number. */
  readonly nouns: readonly string[];
  readonly files: readonly string[];
}

/*
 * EVERY SURFACE THAT RENDERS COPY, NOT A LIST OF PAGES (E19/S15).
 *
 * The first roster named page COMPONENTS, and E19/S12 reported the job done on
 * that basis. It was not: the reading-room FAQ lives in `src/content/learn.ts`
 * and `/method`'s claims in `src/content/method/claims.ts`, both of which render
 * into those same pages, and every quantity survived in them untouched — the
 * clip count, the labels, the controls, the swaps, the chance figure, both clip
 * lengths and the pitch floor. A roster of files is a roster of the places
 * somebody thought to look, which is the defect this guard was written to catch,
 * one layer up.
 *
 * So the roster is derived: every .tsx under src/app and src/components, plus
 * every non-test .ts under src/content. Each quantity is checked against ALL of
 * them, because a page's copy can now live anywhere.
 */
function sourcesUnder(dir: string, ext: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = dir + "/" + name;
    if (statSync(path).isDirectory()) out.push(...sourcesUnder(path, ext));
    else if (name.endsWith(ext) && !name.endsWith(".test.ts") && !name.endsWith(".test.tsx")) {
      out.push(path);
    }
  }
  return out;
}

const SURFACES = [
  ...sourcesUnder("src/app", ".tsx"),
  ...sourcesUnder("src/components", ".tsx"),
  ...sourcesUnder("src/content", ".ts"),
];

const BIAS_PAGES = SURFACES;
const SPREAD_PAGES = SURFACES;
const PRACTICE_PAGES = SURFACES;

/** Rounded as the page prints it: the prose says "3.5 times", not 3.4878. */
const PITCH_FLOOR = Math.round((soloFloorFactor("pitch-drift") ?? 0) * 10) / 10;

const QUANTITIES: Quantity[] = [
  { name: "BIAS_CLIP_COUNT", value: BIAS_CLIP_COUNT, nouns: ["clips", "short clips"], files: BIAS_PAGES },
  { name: "BIAS_LABELLED_COUNT", value: BIAS_LABELLED_COUNT, nouns: ["labels"], files: BIAS_PAGES },
  { name: "BIAS_CONTROL_COUNT", value: BIAS_CONTROL_COUNT, nouns: ["controls"], files: BIAS_PAGES },
  { name: "BIAS_SWAPPED_COUNT", value: BIAS_SWAPPED_COUNT, nouns: ["swaps", "false labels"], files: BIAS_PAGES },
  { name: "BIAS_SESSION_MINUTES", value: BIAS_SESSION_MINUTES, nouns: ["minutes"], files: BIAS_PAGES },
  { name: "SPREAD_WORK_COUNT", value: SPREAD_WORK_COUNT, nouns: ["works", "pieces of music", "recordings"], files: SPREAD_PAGES },
  { name: "SPREAD_CLIP_SECONDS", value: SPREAD_CLIP_SECONDS, nouns: ["seconds"], files: SPREAD_PAGES },
  { name: "SPREAD_SESSION_MINUTES", value: SPREAD_SESSION_MINUTES, nouns: ["minutes"], files: SPREAD_PAGES },
  { name: "soloFloorFactor(pitch-drift)", value: PITCH_FLOOR, nouns: ["times"], files: PRACTICE_PAGES },
  { name: "ARC_FLOORS.bias", value: ARC_FLOORS.bias, nouns: ["points"], files: PRACTICE_PAGES },
];

/** Numerals and number-words for `n`, as a page might write them. */
function spellings(n: number): string[] {
  const out = [String(n)];
  if (WORDS[n]) out.push(WORDS[n]);
  return out;
}

/**
 * NO REGEX IN THIS FILE, AND THE FIRST VERSION HAD ONE.
 *
 * It built the pattern in a TEMPLATE LITERAL, and the transport these scripts
 * are written through eats one level of escaping — so the word boundary became
 * an actual backspace character and the whitespace class became the letter "s".
 * The guard matched nothing and reported success, and typing the clip count
 * back in passed it. That is the second time this session a check has been
 * vacuous for exactly this reason, so this one is written with no escape in it
 * at all.
 */
/**
 * COMMENTS ARE NOT CLAIMS. This project's page files carry long docblocks that
 * discuss the pool by number — "sixteen clips rated blind, then the SAME
 * sixteen" — and flagging those would bury the four sentences a reader
 * actually sees under prose only engineering reads. Stripped with a scanner
 * rather than a pattern, for the same reason nothing here uses one.
 */
function stripComments(text: string): string {
  let out = "";
  let i = 0;
  while (i < text.length) {
    if (text[i] === "/" && text[i + 1] === "*") {
      const end = text.indexOf("*/", i + 2);
      i = end === -1 ? text.length : end + 2;
      continue;
    }
    out += text[i];
    i += 1;
  }
  return out
    .split(NL)
    .filter((line) => !line.trim().startsWith("//"))
    .join(NL);
}

const collapse = (text: string) =>
  stripComments(text).split(NL).join(" ").split(" ").filter((word) => word.length > 0).join(" ");

const isWordChar = (ch: string) =>
  (ch >= "a" && ch <= "z") || (ch >= "0" && ch <= "9") || ch === "-";

/** The phrase, standing on its own rather than inside a longer word. */
function saysPlainly(haystack: string, phrase: string): string | null {
  const hay = haystack.toLowerCase();
  const needle = phrase.toLowerCase();
  let at = hay.indexOf(needle);
  while (at !== -1) {
    const before = at === 0 ? " " : hay[at - 1];
    const afterAt = at + needle.length;
    const after = afterAt >= hay.length ? " " : hay[afterAt];
    if (!isWordChar(before) && !isWordChar(after)) return haystack.slice(at, afterAt);
    at = hay.indexOf(needle, at + 1);
  }
  return null;
}

describe("stated quantities come from the modules that compute them", () => {
  it("has quantities and pages to check, so nothing below passes vacuously", () => {
    expect(QUANTITIES.length).toBeGreaterThan(5);
    for (const q of QUANTITIES) {
      expect(q.value, `${q.name} is not a real quantity`).toBeGreaterThan(0);
      for (const file of q.files) expect(readFileSync(file, "utf8").length).toBeGreaterThan(200);
    }
  });

  /**
   * The defect itself: the number and its noun, sitting next to each other in
   * prose, on a page that describes the instrument the number belongs to.
   */
  it("finds no count typed in beside the noun it counts", () => {
    const typed: string[] = [];
    for (const q of QUANTITIES) {
      for (const file of q.files) {
        const flat = collapse(readFileSync(file, "utf8"));
        for (const spelling of spellings(q.value)) {
          for (const noun of q.nouns) {
            const hit = saysPlainly(flat, spelling + " " + noun);
            if (hit !== null) typed.push(`${file}: "${hit}" — use ${q.name}`);
          }
        }
      }
    }
    expect(
      typed,
      "these pages state a quantity the modules already compute. When the pool grows they go " +
        "false while the pages that slot it stay true, which is how a page drifts away from the " +
        "instrument it describes:" + NL + typed.join(NL),
    ).toEqual([]);
  });
});
