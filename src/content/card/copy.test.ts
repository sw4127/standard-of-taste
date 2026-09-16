/**
 * E21/T-S3 — WHAT THE CARD MAY SAY, HELD BY GUARDS RATHER THAN BY INTENT.
 *
 * D1 IS SUSPENDED ON THIS SURFACE AND NOWHERE ELSE (PM rulings RT-Z5 (b),
 * RT-Z9 (a), 2026-09-16). That makes this the only place in the product where
 * a sentence may speak to the reader about themselves, and therefore the only
 * place where the rules that replaced D1 have to be enforced rather than
 * assumed. Four of them, each with a planted specimen below:
 *
 *   1. NO CAUSAL PROMISE. The card does not claim it improves anybody's output.
 *   2. NO ASSERTION ABOUT TRAUMA, ABUSE OR MENTAL HEALTH (RT-Z10 a).
 *   3. NO COMPARISON BETWEEN PEOPLE (N3, untouched by RT-Z5).
 *   4. NO SENTENCE THAT COUNTS THE FAMILIES, because the card renders after a
 *      sitting that measured one and after one that measured three.
 *
 * EVERY RULE IS PROVED IN BOTH DIRECTIONS. A planted sentence is run through
 * the same function the real strings go through, so a rule that has only ever
 * returned "clean" is not trusted — the lesson this repository has re-learned
 * at the rung tables, the damage field, the retired gates, and twice in the
 * slices before this one.
 */
import { describe, expect, it } from "vitest";
import { observer, pCorrect, rng } from "@/analytics/observer";
import {
  answer,
  axisFor,
  isFinished,
  nextTrial,
  sessionResult,
  startSession,
  type StaircaseResult,
} from "@/engine/staircase-session";
import { eligibleSources } from "@/engine/staircase-pool";
import { promptCard } from "@/engine/prompt-card";
import { checkVoice, formatVoiceReport, type VoiceString } from "@/content/voice";
import { PROMPT_AXES } from "./axes";
import { CARD_CHROME, cardSections, pasteLine, separatesLine, tagsFor, worthLine } from "./copy";
import { CARD_STATEMENT } from "./statement";
import { familyLabel, thresholdCardFigure } from "@/content/staircase/copy";

type Placement = "inside" | "far-better" | "far-worse";

function play(family: string, sourceId: string | undefined, placement: Placement, seed: number): StaircaseResult {
  const axis = axisFor(family, sourceId);
  const mid = axis.magnitudes[axis.magnitudes.length >> 1];
  const alpha =
    placement === "inside"
      ? mid
      : placement === "far-better"
        ? axis.magnitudes[0] / 4
        : axis.magnitudes.at(-1)! * 4;
  const o = observer(alpha, 0.35, 0.02);
  let s = startSession(family, seed, sourceId);
  const rand = rng(seed ^ 0x5bf03635);
  while (!isFinished(s)) {
    const t = nextTrial(s);
    s = answer(s, rand() < pCorrect(s.axis.magnitudes[t.levelIndex], o));
  }
  return sessionResult(s);
}

const PITCH = "pitch-drift";
const TIMING = "timing-smear";
const LOSSY = "lossy-artifact";
const SOURCES = eligibleSources(LOSSY);
const PLACEMENTS: Placement[] = ["inside", "far-better", "far-worse"];

/** Every card this product can actually produce, from real sessions. */
function allCards() {
  const out: { name: string; card: ReturnType<typeof promptCard>; results: StaircaseResult[] }[] = [];
  let seed = 101;
  for (const p of PLACEMENTS) {
    for (const [name, results] of [
      [`pitch/${p}`, [play(PITCH, undefined, p, (seed += 2))]],
      [`timing/${p}`, [play(TIMING, undefined, p, (seed += 2))]],
      [`lossy/${p}`, [play(LOSSY, SOURCES[0], p, (seed += 2))]],
      [
        `three/${p}`,
        [
          play(PITCH, undefined, p, (seed += 2)),
          play(TIMING, undefined, p, (seed += 2)),
          play(LOSSY, SOURCES[1], p, (seed += 2)),
        ],
      ],
    ] as [string, StaircaseResult[]][]) {
      out.push({ name, card: promptCard(results), results });
    }
  }
  return out;
}

/**
 * Every rendered string of every card, with where it came from.
 *
 * THE PANEL'S CHROME IS IN HERE TOO (E21/T-S6). Its label and its three button
 * states are rendered to the same reader as the card's sentences, so they are
 * held to the same four rules. They lived in the component's JSX until T-S6,
 * where every one of these scans was blind to them.
 */
function allStrings(): { surface: string; text: string }[] {
  return [
    ...CARD_CHROME.map((text, i) => ({ surface: `card/chrome/${i}`, text })),
    { surface: "card/statement", text: CARD_STATEMENT },
    ...allCards().flatMap(({ name, results }) =>
      cardSections(results).flatMap((s, i) =>
        [s.heading, ...s.lines].map((text, j) => ({ surface: `card/${name}/${i}.${j}`, text })),
      ),
    ),
  ];
}

/* ------------------------------------------------------------------ *
 * The rules, each as a function, so a planted specimen runs the SAME one
 * ------------------------------------------------------------------ */

const CAUSAL = [
  /\bwill improve your\b/i,
  /\bmakes your (?:tracks|mixes|renders|music)\b/i,
  /\bfix your mix\b/i,
  /\bbetter renders\b/i,
  /\bwill catch them in your\b/i,
  /\b(?:better|improved) (?:results|output|prompts?)\b/i,
  /\bget more out of\b/i,
];
const CLINICAL = [
  /\b(?:trauma|traumatic|traumatis(?:ed|ing))\b/i,
  /\b(?:abuse|abused|abusive)\b/i,
  /\b(?:depress(?:ed|ion)|anxiety|anxious|ptsd|adhd|autis(?:m|tic)|neurodiverg(?:ent|ence))\b/i,
  /\byour (?:mental health|childhood|grief|loss)\b/i,
  /\bunresolved\b/i,
];
const COMPARISON = [
  /\bpercentile\b/i,
  /\btop \d+%/i,
  /\b(?:most|many|few) (?:listeners|people|readers|users)\b/i,
  /\b(?:better|worse) than (?:average|most|others)\b/i,
  /\bcompared (?:to|with) (?:others|everyone|most)\b/i,
  /\bcohort\b/i,
];
const COUNTING = /\b(?:the other two|all three|both axes|the remaining|your other)\b/i;

function breaches(text: string, patterns: RegExp[]): string[] {
  return patterns.filter((p) => p.test(text)).map((p) => String(p));
}

describe("the prompt card's copy", () => {
  const strings = allStrings();

  it("rendered a real corpus from real sessions", () => {
    expect(strings.length, "no card strings were produced, so every rule below is vacuous").toBeGreaterThan(40);
    const states = new Set(allCards().flatMap(({ card }) => card.axes.map((a) => a.state)));
    expect(
      states.size,
      `only ${states.size} axis state(s) were exercised: ${[...states].join(", ")}. A corpus that ` +
        "reaches one branch proves one branch.",
    ).toBeGreaterThanOrEqual(4);
  });

  it("promises nothing about the reader's own output", () => {
    const found = strings.flatMap((s) => breaches(s.text, CAUSAL).map((p) => `${s.surface}: ${p} in "${s.text}"`));
    expect(found, "the card claims it improves somebody's work, which is unmeasured (MRD §7)").toEqual([]);
    // Proved in the other direction: the rule catches the sentence it exists for.
    expect(breaches("Spend words on tuning and you will get better results.", CAUSAL)).not.toEqual([]);
    expect(breaches("This will improve your mixes within a week.", CAUSAL)).not.toEqual([]);
  });

  it("asserts nothing about trauma, abuse or mental health", () => {
    const found = strings.flatMap((s) => breaches(s.text, CLINICAL).map((p) => `${s.surface}: ${p} in "${s.text}"`));
    expect(found, "RT-Z10 (a): the one class where being wrong lands on a person").toEqual([]);
    expect(
      breaches("You chose the slower decay every time — you have unresolved loss.", CLINICAL),
      "the specimen the ruling names must be caught",
    ).not.toEqual([]);
    expect(breaches("This pattern is common in anxious listeners.", CLINICAL)).not.toEqual([]);
  });

  it("compares the reader to nobody", () => {
    const found = strings.flatMap((s) => breaches(s.text, COMPARISON).map((p) => `${s.surface}: ${p} in "${s.text}"`));
    expect(found, "N3 is untouched by RT-Z5: n = 0, and the card describes one ear").toEqual([]);
    expect(breaches("That puts you in the top 10% of listeners.", COMPARISON)).not.toEqual([]);
    expect(breaches("Most listeners cannot hear that.", COMPARISON)).not.toEqual([]);
  });

  it("counts no families, because it renders after one sitting and after three", () => {
    const found = strings.filter((s) => COUNTING.test(s.text));
    expect(
      found.map((s) => `${s.surface}: ${s.text}`),
      "a card that says 'the other two' is false after a sitting that measured three",
    ).toEqual([]);
    expect(COUNTING.test("Now go and measure the other two."), "the rule catches nothing").toBe(true);
  });

  it("passes the voice gate on every line of every card", () => {
    const voice: VoiceString[] = strings.map((s) => ({ surface: s.surface, text: s.text, intensity: "pointed" }));
    expect(formatVoiceReport(checkVoice(voice))).toBe("voice check: no violations");
  });

  /**
   * THE NOISE-FLOOR RULE, AT THE SENTENCE. An axis that resolved nothing gets a
   * line saying so and contributes no tag. The failure this refuses is not a
   * wrong number — it is a flattering sentence over a session that measured
   * nothing, which is the cheapest thing this product could do and the one that
   * would cost it everything.
   */
  it("says 'could not tell' rather than something kind, when nothing resolved", () => {
    const real = play(PITCH, undefined, "inside", 999);
    const blank: StaircaseResult = {
      ...real,
      band: { ...real.band, heardAt: null, missedAt: null, heardIndex: null, missedIndex: null },
    };
    const [axis] = promptCard([blank]).axes;
    expect(axis.state).toBe("not-enough");
    const line = separatesLine(axis, thresholdCardFigure(blank));
    expect(line.toLowerCase()).toContain("could not tell");
    expect(tagsFor(axis), "an axis that resolved nothing contributed a tag to the paste line").toEqual([]);
    /*
     * THE CARD MAY NOT ADVISE A TAG IT THEN WITHHOLDS. `tagsFor` returns
     * nothing for a `not-enough` axis, so a worth line ending "ask for <tag>"
     * would send the reader looking for a tag the paste line does not contain.
     * Found by reading the rendered card in this slice.
     */
    const worth = worthLine(axis)!;
    expect(worth, "advice was given about an axis that resolved nothing").toContain("Nothing to spend");
    for (const tag of [...PROMPT_AXES[axis.family].precise, PROMPT_AXES[axis.family].neutral]) {
      expect(
        worth.includes(tag),
        `the worth line recommends "${tag}" for an axis whose tags are withheld from the paste line`,
      ).toBe(false);
    }
  });

  it("offers rather than asserts: no sentence says what the reader IS", () => {
    const IDENTITY = /\byou (?:are|'re) (?:an? )?\w+/i;
    const found = strings.filter((s) => IDENTITY.test(s.text));
    expect(
      found.map((s) => `${s.surface}: ${s.text}`),
      "the register that survives RT-Z5 (b) is OFFER, DO NOT ASSERT. Every line names something the " +
        "reader DID; none of them says what they are.",
    ).toEqual([]);
    expect(IDENTITY.test("You are a careful listener."), "the rule catches nothing").toBe(true);
  });

  it("builds a paste line a reader could paste, from tags that exist", () => {
    const known = new Set(Object.values(PROMPT_AXES).flatMap((a) => [...a.precise, a.neutral]));
    for (const { name, card } of allCards()) {
      const paste = pasteLine(card);
      if (paste === "") continue;
      for (const tag of paste.split(", ")) {
        expect(known.has(tag), `${name}: the paste line contains "${tag}", which is in no axis vocabulary`).toBe(true);
      }
    }
  });

  /**
   * THE CARD AND THE SCREEN MAY NOT DESCRIBE ONE SITTING WITH TWO NUMBERS.
   *
   * Found by reading the rendered page: the card said "still calling it at 7.5
   * cents" directly above a headline reading "12.5 cents". Both were true — the
   * fitted threshold and the rung actually caught — and irreconcilable to
   * anybody looking at them together. `thresholdCardFigure` is the product's
   * one canonical figure, already shared by the screen and the share image, and
   * the card now takes it rather than formatting its own.
   */
  it("quotes the same figure the screen leads with", () => {
    let checked = 0;
    for (const { name, results } of allCards()) {
      const sections = cardSections(results);
      if (sections.length === 0) continue;
      const separates = sections[0].lines;
      for (const r of results) {
        const figure = thresholdCardFigure(r);
        if (figure === "no reading") continue;
        const line = separates.find((l) => l.toLowerCase().startsWith(familyLabel(r.family).toLowerCase()));
        if (!line || !/\d/.test(line)) continue;
        checked++;
        expect(
          line,
          `${name}: the card prints a number the screen does not. The screen leads with "${figure}" ` +
            `and the card says "${line}".`,
        ).toContain(figure);
      }
    }
    expect(checked, "no card line carried a number, so this checks nothing").toBeGreaterThan(2);
  });

  it("prints three real cards", () => {
    const show = ["pitch/inside", "three/inside", "lossy/far-worse"];
    for (const { name, results } of allCards()) {
      if (!show.includes(name)) continue;
      console.log(`[E21/T-S3] ${name}`);
      for (const s of cardSections(results)) {
        console.log(`  ${s.heading}`);
        for (const l of s.lines) console.log(`    ${l}`);
      }
    }
    expect(show.length).toBe(3);
  });
});
