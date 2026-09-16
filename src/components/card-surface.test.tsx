/**
 * NOTHING REACHES THE CARD'S SURFACE WITHOUT GOING THROUGH THE SCANS
 * (E21/T-S6, Track T).
 *
 * THE GAP THIS CLOSES. `copy.test.ts` holds the card's four rules — no causal
 * promise, no clinical assertion, no comparison between people, no counting of
 * families — against the strings `content/card/copy.ts` produces. It cannot see
 * a sentence typed into the component's JSX, and that is not hypothetical:
 * `landingLead` was moved out of JSX in E11/S2 for this reason, the method
 * page's framing paragraphs followed in E20/S1, and two paid-tier promises
 * shipped in the reading room through the same hole.
 *
 * SO THIS WORKS FROM THE RENDERED MARKUP, NOT FROM THE SOURCE. It renders the
 * panel, subtracts everything the content modules account for — the computed
 * card lines, the registered chrome, the constitution's disclosure — and
 * requires the remainder to be empty. Any new prose typed into the component
 * shows up as a leftover, whatever it says.
 *
 * WHY SUBTRACTION RATHER THAN A PATTERN. A pattern has to guess what bad prose
 * looks like. Subtraction does not care: it asks whether every word on screen
 * came from somewhere the scans can read, which is the property that actually
 * matters and the one a regex cannot express.
 */
import { renderToStaticMarkup } from "react-dom/server";
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
import PromptCardPanel from "./PromptCardPanel";
import { cardSections, CARD_CHROME } from "@/content/card/copy";
import { CARD_STATEMENT } from "@/content/card/statement";

/*
 * FOUR ARGUMENTS, AND THE FIRST VERSION CALLED IT WITH THREE.
 *
 * `play("pitch-drift", 7, 3)` type-checks as nothing and runs as everything:
 * `sourceId` took 7, `seed` took 3 and `rung` took `undefined`, so the observer
 * was built at `magnitudes[undefined]` and the whole fixture was a degenerate
 * session. Every assertion in this file passed against it, because vitest does
 * not typecheck and the subtraction it performs is just as happy to subtract
 * nonsense from nonsense. `tsc` found it; the green run did not.
 */
function play(family: string, sourceId: string | undefined, seed: number, rung: number): StaircaseResult {
  const axis = axisFor(family, sourceId);
  const o = observer(axis.magnitudes[rung], 0.35, 0.02);
  let s = startSession(family, seed, sourceId);
  const rand = rng(seed ^ 0x5bf03635);
  while (!isFinished(s)) {
    const t = nextTrial(s);
    s = answer(s, rand() < pCorrect(s.axis.magnitudes[t.levelIndex], o));
  }
  return sessionResult(s);
}

const SOURCES = eligibleSources("lossy-artifact");

/**
 * NOTHING MAY COUNT, AND THAT IS WHY BOTH ARE HERE. The card renders after a
 * sitting that measured ONE family and after one that measured THREE. A surface
 * verified only against one of those is verified against half its own range —
 * the defect `FLAWS_INVITE` already carries a guard for, on a sentence that said
 * "the other two".
 */
const HISTORIES: [string, StaircaseResult[]][] = [
  ["one family", [play("pitch-drift", undefined, 7, 3)]],
  [
    "three families",
    [
      play("pitch-drift", undefined, 7, 3),
      play("timing-smear", undefined, 11, 4),
      play("lossy-artifact", SOURCES[0], 13, 4),
    ],
  ],
];

const strip = (html: string) =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");

describe("every word on the card's surface came from a module the scans read", () => {
  it("rendered both histories, and they differ", () => {
    const [one, three] = HISTORIES.map(([, results]) => renderToStaticMarkup(<PromptCardPanel accent="#fff" results={results} />));
    expect(one.length, "the one-family card rendered nothing").toBeGreaterThan(400);
    expect(three.length, "the three-family card rendered nothing").toBeGreaterThan(400);
    expect(
      three.length,
      "both histories rendered the same markup, so one of them is not being read",
    ).not.toBe(one.length);
  });

  it.each(HISTORIES)("leaves nothing unaccounted for after %s", (_name, results) => {
    const html = renderToStaticMarkup(<PromptCardPanel accent="#fff" results={results} />);
    const accounted = [
      ...cardSections(results).flatMap((s) => [s.heading, ...s.lines]),
      ...CARD_CHROME,
      CARD_STATEMENT,
    ];
    /*
     * THE COUNT FLOOR. With an empty `accounted` list the subtraction below
     * removes nothing and the leftovers are the whole card — which fails
     * loudly. The danger is the opposite: an `accounted` list that has silently
     * become the entire rendered text, leaving nothing to check. So the corpus
     * is asserted to be real first.
     */
    expect(accounted.length, "nothing was accounted for, so this subtraction checks nothing").toBeGreaterThan(5);

    let text = strip(html);
    for (const known of accounted) text = text.split(known).join("");
    const leftovers = text
      .split("")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    expect(
      leftovers,
      "these words are on the card's surface and came from no module the card's rules can read. " +
        "Prose typed into a component is invisible to the voice gate and to all four of the rules " +
        "this surface is held to:" + "\n" + leftovers.join("\n"),
    ).toEqual([]);
  });

  /**
   * THE NOISE-FLOOR RULE, AT THE SURFACE. A history that resolved nothing
   * produces a card that SAYS so — it does not produce a kind sentence, and it
   * does not produce an empty box inviting the reader to fill it in.
   */
  it("renders 'could not tell' rather than a shell, when nothing resolved", () => {
    const real = play("pitch-drift", undefined, 7, 3);
    const blank: StaircaseResult = {
      ...real,
      band: { ...real.band, heardAt: null, missedAt: null, heardIndex: null, missedIndex: null },
    };
    const html = renderToStaticMarkup(<PromptCardPanel accent="#fff" results={[blank]} />);
    const text = strip(html).replace(//g, " ");
    expect(text.toLowerCase(), "the card said nothing about a sitting that resolved nothing").toContain(
      "could not tell",
    );
    expect(text, "a sitting that resolved nothing produced a paste line").not.toContain("Paste this");
  });
});
