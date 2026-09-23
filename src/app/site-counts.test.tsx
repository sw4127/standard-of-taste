/**
 * A RENDERED COUNT OF A PRODUCT SET MUST EQUAL THE SET (Track V/S4).
 *
 * "Nothing may count" is the standing rule and this repository has broken it
 * over and over: "Two machines" over three cards, "four refusals" over six, and
 * — found by this sweep on 2026-09-22 — "/method" saying the project "has built
 * three working instruments", in the present tense, for as long as four had been
 * live. Each was true the day it was typed and nothing tied it to the thing that
 * stopped it being true.
 *
 * WHAT THIS CHECKS. It reads every rendered page and finds each place a number
 * sits directly in front of a noun naming one of the product's own sets —
 * "sixteen clips", "four instruments", "six works", "seven refusals" — allowing
 * up to two words between ("all four shipped instruments", "sixteen short music
 * clips"). The number must equal the set's size NOW. So a typed count that is
 * correct today passes today and fails the day the set moves, which is the only
 * property a count guard needs: it triggers on the state of the product, not on
 * the wording of the sentence.
 *
 * WHAT IT CANNOT SEE, stated so nobody reads more into a green run:
 *  - sets whose noun is generic. "Pairs" means fifteen delicacy pairs on one
 *    page and four critic pairs on another; "rungs" differs per ladder. Neither
 *    is checked.
 *  - counts not adjacent to their noun: "one instrument, not four". Those were
 *    derived in source by this slice instead.
 *  - pages that need a payload to render (see `render-site.tsx`).
 *
 * THE EXCEPTIONS ARE EXACT IN BOTH DIRECTIONS. A sentence that uses one of these
 * nouns for something that is not the product's set — a critic's list of
 * twenty-one works, a two-alternative trial's two clips — is listed with its
 * reason, and an entry whose sentence no longer renders fails, so the list
 * cannot quietly grow into an off switch.
 */
import { beforeAll, describe, expect, it, vi } from "vitest";
import { renderSite, textOf, type RenderedSite } from "@/test-utils/render-site";
import { numberWord } from "@/content/vocabulary/numbers";
import { MACHINES } from "@/components/OtherMachines";
import {
  BIAS_CLIP_COUNT,
  BIAS_LABELLED_COUNT,
  SPREAD_WORK_COUNT,
} from "@/content/instrument-shape";
import { flawFamilyCount } from "@/content/flaw-families";
import { METHOD_REFUSALS } from "@/content/method/claims";
import { DEGREES_AVAILABLE } from "@/engine/comparison";

vi.mock("next/navigation", async (orig) => ({
  ...(await orig<typeof import("next/navigation")>()),
  useRouter: () => ({ push() {}, replace() {}, prefetch() {}, back() {}, forward() {}, refresh() {} }),
  usePathname: () => globalThis.__SITE_PATH ?? "/",
  useSearchParams: () => new URLSearchParams(),
}));

/**
 * Each noun a sentence can count, and every product set it can name. Some nouns
 * name more than one set — a "clip" is one of the Prestige pool, one of its
 * scored subset, one of the Ranking pool, or one of a trial's pair — so a count
 * passes if it is the size of ANY of them. That costs power (a stale "six clips"
 * about Prestige would pass as a Ranking figure) and it is the price of not
 * guessing which set a sentence meant. The stale figures this repository has
 * actually shipped — eight clips, ten clips, three instruments — are caught.
 */
const LIVE = () => MACHINES.filter((m) => m.live).length;
const NOUNS: { noun: string; sets: { name: string; size: () => number }[] }[] = [
  { noun: "instruments", sets: [{ name: "live instruments", size: LIVE }] },
  { noun: "machines", sets: [{ name: "live instruments", size: LIVE }] },
  {
    noun: "clips",
    sets: [
      { name: "Prestige clips", size: () => BIAS_CLIP_COUNT },
      { name: "Prestige scored clips", size: () => BIAS_LABELLED_COUNT },
      { name: "Ranking clips", size: () => SPREAD_WORK_COUNT },
      { name: "clips in a two-alternative trial", size: () => 2 },
    ],
  },
  { noun: "labels", sets: [{ name: "Prestige labels", size: () => BIAS_LABELLED_COUNT }] },
  {
    noun: "works",
    sets: [
      { name: "Ranking works", size: () => SPREAD_WORK_COUNT },
      { name: "works in a pair", size: () => 2 },
    ],
  },
  { noun: "kinds of damage", sets: [{ name: "flaw families", size: () => flawFamilyCount() }] },
  { noun: "refusals", sets: [{ name: "/method refusals", size: () => METHOD_REFUSALS.length }] },
  { noun: "degrees", sets: [{ name: "rating-scale degrees", size: () => DEGREES_AVAILABLE }] },
];

/**
 * Words that may sit between a number and its noun are adjectives ("all four
 * SHIPPED instruments"). A function word means the number belongs to something
 * else: "four pairs against four DRAWN FROM clips" counts pairs, not clips.
 */
const NOT_BETWEEN = new Set(
  "of from to in on at by with for and or than against drawn the a an per each are is were was".split(" "),
);

/**
 * Sentences that put one of those nouns after a number that is NOT the set's
 * size, on purpose. Keyed by a fragment of the rendered sentence.
 */
const NOT_THE_PRODUCT_SET: Record<string, string> = {
  "instrument of eight clips long after it had grown to sixteen":
    "/method quoting its own past defect: the eight is the stale figure it is about",
  "list of fifteen Chopin works": "/lab/falsified: a source considered and rejected, not the pool",
  "15 short piano works, all available": "/lab/falsified: the same rejected source, in digits",
  "ranked 21 Beethoven works for BBC Music Magazine": "/lab/falsified: the critic's own list",
  "20 rendered clips on two deliberately excluded windows": "/lab/falsified: threshold renders, not a pool",
  "twenty-one Beethoven works": "the critic's own list, of which six are played",
  "Two labels pushing the same way": "two labels in one reversal pair, not the pool",
  "Eleven of eleven degrees": "/lab/falsified quoting a rejected belief, in the scale's own units",
};

/**
 * Sentences whose count matches only a SECOND set of its noun — "two clips"
 * where the first reading of "clips" is the Prestige pool. The multi-set nouns
 * cost the guard power, so each such pass is pinned here rather than allowed
 * silently: a new "six clips" on a Prestige page is a new ambiguous pass, and
 * fails until somebody decides which set it means. Exact in both directions.
 */
const SECOND_SET_BY_DESIGN: Record<string, string> = {
  "You choose which of two clips is the untouched one": "a delicacy trial's pair",
  "correctly identified which of two clips was the unmodified original": "a delicacy trial's pair",
  "drawn from six clips that appear in several pairs": "the Ranking pool",
  "which of two works he ranked higher": "a Ranking pair",
};

/** Number words to values, built from the product's own speller so the two agree. */
const WORDS = new Map<string, number>(
  Array.from({ length: 100 }, (_, n) => [numberWord(n), n] as [string, number]),
);
const NUMBER = `(\\d+|${[...WORDS.keys()].sort((a, b) => b.length - a.length).join("|")})`;

interface Hit {
  route: string;
  sentence: string;
  said: number;
  noun: string;
  sizes: { name: string; size: number }[];
}

function countsIn(route: string, text: string): Hit[] {
  const hits: Hit[] = [];
  for (const line of text.split("\n")) {
    for (const sentence of line.split(/(?<=[.!?])\s+/)) {
      for (const { noun, sets } of NOUNS) {
        const re = new RegExp(`(?<![\\w-])${NUMBER}\\s+((?:[a-z]+\\s+){0,2}?)${noun}\\b`, "gi");
        for (const m of sentence.matchAll(re)) {
          if (m[2].split(/\s+/).some((w) => NOT_BETWEEN.has(w.toLowerCase()))) continue;
          const raw = m[1].toLowerCase();
          const said = /^\d+$/.test(raw) ? Number(raw) : (WORDS.get(raw) ?? NaN);
          hits.push({
            route,
            sentence: sentence.trim(),
            said,
            noun,
            sizes: sets.map((x) => ({ name: x.name, size: x.size() })),
          });
        }
      }
    }
  }
  return hits;
}

const agrees = (h: Hit) => h.sizes.some((x) => x.size === h.said);
/** Agrees, but only through a set other than the noun's first reading. */
const agreesSecondarily = (h: Hit) => agrees(h) && h.sizes[0].size !== h.said;

let site: RenderedSite;
let hits: Hit[] = [];

beforeAll(async () => {
  site = await renderSite();
  hits = site.pages.flatMap((p) => countsIn(p.route, textOf(p.html)));
}, 60_000);

const exempt = (h: Hit) => Object.keys(NOT_THE_PRODUCT_SET).some((f) => h.sentence.includes(f));

describe("every rendered count of a product set is the set's size", () => {
  it("read the site and found counts, so nothing below passes vacuously", () => {
    expect(site.failed).toEqual([]);
    expect(site.pages.length).toBeGreaterThanOrEqual(27);
    // Absolute floors, measured 2026-09-22: 42 counts across all 8 nouns.
    expect(hits.length).toBeGreaterThanOrEqual(40);
    expect(new Set(hits.map((h) => h.noun)).size).toBe(8);
  });

  it("finds no count that disagrees with the product", () => {
    const wrong = hits
      .filter((h) => !agrees(h) && !exempt(h))
      .map(
        (h) =>
          `${h.route}: says ${h.said} ${h.noun}; the product has ` +
          h.sizes.map((x) => `${x.size} ${x.name}`).join(" or ") +
          ` — "${h.sentence.slice(0, 110)}"`,
      );
    expect(wrong).toEqual([]);
  });

  it("passes a count through a second set only where that was decided", () => {
    const listed = Object.keys(SECOND_SET_BY_DESIGN);
    const found = hits.filter((h) => agreesSecondarily(h) && !exempt(h));
    const unlisted = found
      .filter((h) => !listed.some((f) => h.sentence.includes(f)))
      .map((h) => `${h.route}: "${h.sentence.slice(0, 110)}" counts ${h.said} ${h.noun}, which is not ${h.sizes[0].name}`);
    expect(unlisted, "decide which set these mean, then list them").toEqual([]);
    const stale = listed.filter((f) => !found.some((h) => h.sentence.includes(f)));
    expect(stale, "listed as second-set passes but no longer are — remove them").toEqual([]);
  });

  it("lists no exception whose sentence is gone", () => {
    const all = site.pages.map((p) => textOf(p.html).replace(/\s+/g, " ")).join("\n");
    const stale = Object.keys(NOT_THE_PRODUCT_SET).filter((f) => !all.includes(f));
    expect(stale, "these exceptions no longer render — remove them").toEqual([]);
  });

  it("would catch the defect it was written for (planted specimen)", () => {
    const planted = countsIn("/method", "It has built three working instruments and measured them.");
    expect(planted).toHaveLength(1);
    expect(planted[0].said).toBe(3);
    expect(agrees(planted[0])).toBe(false);
    // And the pool-growth defect: an eight-clip instrument described after it grew.
    const stale = countsIn("/learn", "You rate eight clips blind.");
    expect(stale.map(agrees)).toEqual([false]);
    // A function word between them means the number is not the noun's.
    expect(countsIn("/lab", "four pairs against four drawn from clips")).toEqual([]);
  });
});
