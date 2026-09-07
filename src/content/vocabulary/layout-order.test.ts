/**
 * THE ADJACENCY CLAIMS A COMPONENT OWNS (E19/S4).
 *
 * Seven deck sections compose their order sentence from the array the product
 * runs. Two cannot — the borrowed apparatus and the expert panel are laid out
 * in JSX — so their paragraphs stay hand-written, and hand-written prose about
 * order is the defect this track exists to remove. This pins the order the
 * prose describes, so a reorder fails the build and somebody has to look at the
 * paragraph.
 *
 * WHAT THIS DOES NOT DO, SAID PLAINLY. It cannot tell that the prose describes
 * the pinned order CORRECTLY. Three claims in the shipped deck were false and
 * only reading found them: the apparatus block's route, "a section per
 * instrument" when the panel renders one, and "directly beneath" a chart that
 * has a table under it. A pin stops the order drifting; it does not make a
 * sentence true.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { LAYOUT_ORDERS } from "./layout-order";
import { MEASURED_TRIALS } from "@/content/delicacy/items";
import { DELICACY_CONFIDENCE_LEVELS } from "@/engine/delicacy";
import { MIN_BIN_N } from "@/engine/calibration";

const SCRIPT = "scripts/export-copy-deck.mjs";
const NL = String.fromCharCode(10);

/** The body of one function, so a file defining many can be checked per region. */
function region(source: string, within: string | undefined): string {
  if (!within) return source;
  const at = source.indexOf(within);
  expect(at, `${within} is not in this file any more`).toBeGreaterThan(-1);
  const rest = source.slice(at + within.length);
  const ends = rest.indexOf("\nfunction ");
  return ends === -1 ? rest : rest.slice(0, ends);
}

describe("layout order the deck describes but cannot compose", () => {
  it("pins something, so this file is not an empty ceremony", () => {
    const entries = Object.values(LAYOUT_ORDERS).flat();
    expect(entries.length).toBeGreaterThan(1);
    for (const entry of entries) expect(entry.symbols.length).toBeGreaterThan(1);
  });

  it("finds every pinned symbol where it is claimed to be", () => {
    for (const [key, entries] of Object.entries(LAYOUT_ORDERS)) {
      for (const entry of entries) {
        const scope = region(readFileSync(entry.file, "utf8"), entry.within);
        for (const symbol of entry.symbols) {
          expect(
            scope.indexOf(symbol),
            `${key}: the deck describes "${entry.claim}", but ${symbol} is no longer in ` +
              `${entry.file}${entry.within ? ` inside ${entry.within}` : ""}`,
          ).toBeGreaterThan(-1);
        }
      }
    }
  });

  it("renders them in the order the deck describes", () => {
    for (const [key, entries] of Object.entries(LAYOUT_ORDERS)) {
      for (const entry of entries) {
        const scope = region(readFileSync(entry.file, "utf8"), entry.within);
        const at = entry.symbols.map((symbol) => scope.indexOf(symbol));
        const sorted = [...at].sort((a, b) => a - b);
        expect(
          at,
          `${key}: ${entry.file} no longer renders these in the order the deck describes — ` +
            `"${entry.claim}". The paragraph in the deck is now wrong and must be rewritten, ` +
            "not just reordered here",
        ).toEqual(sorted);
      }
    }
  });

  /**
   * A SECTION MAY NOT DESCRIBE AN ORDER THAT NOTHING CHECKS.
   *
   * Scanned as text for the reason `deck-coverage.test.ts` gives: importing the
   * exporter runs its whole pipeline. The exporter refuses at generation time
   * too; this fails at test time, which is where somebody adding a section will
   * meet it first.
   */
  it("leaves no deck section with a hand-written order and no pin", () => {
    const source = readFileSync(SCRIPT, "utf8");
    const sections = source.split('key: "').slice(1);
    expect(sections.length).toBeGreaterThan(7);
    const loose: string[] = [];
    for (const chunk of sections) {
      const key = chunk.split('"')[0];
      const body = chunk.split("\n  },")[0];
      const composed = body.indexOf("note:") !== -1;
      const hand = body.indexOf("alongside:") !== -1;
      const pinned = Object.keys(LAYOUT_ORDERS).includes(key);
      const declared = body.indexOf("orderUnbound:") !== -1;
      if (hand && !pinned && !declared) loose.push(key);
      if (!hand && !composed) loose.push(key);
    }
    expect(
      loose,
      "these sections describe what renders beside them with nothing checking it — give each an " +
        "emission spec, a layout-order pin, or an orderUnbound reason:",
    ).toEqual([]);
  });

  /**
   * THE ROUTE A SECTION CLAIMS TO RENDER ON, DERIVED FROM THE FILE THAT RENDERS
   * IT — the one prose-to-code binding available here, and the guard that would
   * have caught the error that started this slice.
   *
   * The apparatus section said "Renders on `/method`" for as long as it has
   * existed. It renders on `/learn/methodology`; `/method` is a different page
   * about how the project is run. A writer with the repository closed would
   * have gone to the wrong page to check their own copy.
   */
  it("names the route its own file serves", () => {
    const source = readFileSync(SCRIPT, "utf8");
    let checked = 0;
    for (const [key, entries] of Object.entries(LAYOUT_ORDERS)) {
      for (const entry of entries) {
        if (!entry.file.startsWith("src/app/")) continue;
        const route = "/" + entry.file.slice("src/app/".length).replace("/page.tsx", "");
        /*
         * THE `where:` FIELD, NOT THE WHOLE SECTION, AND THE FIRST VERSION OF
         * THIS TEST TOOK THE WHOLE SECTION. Reverting the route to `/method`
         * passed it, because the adjacency paragraph further down still named
         * the right route somewhere. A guard that accepts the truth appearing
         * ANYWHERE nearby does not check the sentence that misleads: "Where it
         * renders" is the line a writer acts on.
         */
        const chunk = source.split(`key: "${key}"`)[1].split(NL + "  },")[0];
        const where = chunk.split("where:")[1];
        expect(where, `${key} has no "where it renders" line to check`).toBeTruthy();
        const stated = where.split("already:")[0];
        checked += 1;
        expect(
          stated.indexOf(route),
          `${key} renders from ${entry.file}, so it serves ${route}, and its "Where it renders" ` +
            "line does not say so",
        ).toBeGreaterThan(-1);
      }
    }
    expect(checked, "no routed section was checked, so this test proves nothing").toBeGreaterThan(0);
  });

  /**
   * THE PREMISE UNDER THE BRIER SENTENCE'S "chart above".
   *
   * `brierNote` tells the reader to read the score against the chart. The chart
   * renders only where some confidence bin has enough answers to plot, so a
   * session with every bin below `MIN_BIN_N` would print a sentence pointing at
   * nothing. It cannot happen — the scored trials divided among the confidence
   * levels always leave one bin at or above the floor — and that is arithmetic
   * about two constants, not a fact about copy, so it is pinned here rather
   * than assumed. Shorten the session or add confidence levels and this fails
   * before the dangling reference ships.
   */
  it("guarantees the calibration chart the Brier sentence points at", () => {
    const fullest = Math.ceil(MEASURED_TRIALS.length / DELICACY_CONFIDENCE_LEVELS.length);
    expect(
      fullest,
      `${MEASURED_TRIALS.length} scored trials over ${DELICACY_CONFIDENCE_LEVELS.length} ` +
        "confidence levels can now leave every bin too thin to plot, so the Brier sentence would " +
        "refer to a chart that is not on screen",
    ).toBeGreaterThanOrEqual(MIN_BIN_N);
  });
});
