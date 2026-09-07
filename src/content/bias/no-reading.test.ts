/**
 * A REFUSED SITTING SHOWS NO NUMBER AND NO VERDICT (E19/S8, PM ruling RT-U1 a).
 *
 * WHAT WENT WRONG. `biasClaim` refuses when no rating had headroom to move —
 * every clip already at the end of the scale its own label pointed toward. The
 * vocabulary layer honoured that from the day it shipped and said nothing. The
 * RESULT SCREEN did not: it printed `pct` (0) and the verdict the engine
 * computes regardless ("Steady ears."), on the page, in the flow, on the share
 * card and in the OG title. A verdict about a measurement that could not have
 * produced any other number is the one claim this product may never make.
 *
 * AND EVERY TEST PASSED, before and after the fix, until this file. No fixture
 * reaches that screen, so the copy on it renders nowhere and is invisible to
 * the deck, the census and the hazard gate alike. The state is near-unreachable
 * — the pool is direction-balanced and a listener cannot see which way a label
 * points while rating blind — but the owner's ruling was that the product
 * should not be CAPABLE of showing a verdict it has refused, which is a
 * different question from how often it would.
 *
 * BEHAVIOUR FIRST, THEN SOURCE. The two composed strings are checked by calling
 * them. The three rendering surfaces are checked by reading them, which is
 * weaker and is the same compromise `layout-order.test.ts` documents: a JSX
 * branch cannot be proven by a unit test without a renderer this project does
 * not have.
 */
import { describe, expect, it } from "vitest";
import { biasResults } from "@/content/vocabulary/fixtures";
import { biasClaim } from "@/engine/evidence";
import { readFileSync } from "node:fs";
import { BIAS_NO_READING, biasHeadline, hasBiasReading, shareTextFor, titleFragmentFor } from "./copy";

const refused = () => {
  const found = Object.values(biasResults()).filter((r) => !biasClaim(r).ok);
  expect(found.length, "no fixture reaches the refusal, so nothing below is exercised").toBe(1);
  return found[0];
};

const read = () => Object.values(biasResults()).filter((r) => biasClaim(r).ok);

/** Any digit at all. A refusal that carries one has smuggled a measurement in. */
const hasDigit = (text: string) => /[0-9]/.test(text);

describe("a Prestige sitting the engine refused to read", () => {
  it("is recognised as refused", () => {
    expect(hasBiasReading(refused())).toBe(false);
    expect(read().length).toBeGreaterThan(1);
    for (const r of read()) expect(hasBiasReading(r)).toBe(true);
  });

  it("puts no number in the page title or the card's alt text", () => {
    const fragment = titleFragmentFor(refused());
    expect(hasDigit(fragment), `the title still carries a number: "${fragment}"`).toBe(false);
    expect(fragment).not.toContain("%");
    // And the ordinary path is untouched — a guard that suppressed everything
    // would pass the line above and destroy the product.
    for (const r of read()) expect(titleFragmentFor(r)).toContain("%");
  });

  it("puts no number in the share text", () => {
    const text = shareTextFor(refused());
    expect(hasDigit(text), `the share line still carries a number: "${text}"`).toBe(false);
    for (const r of read()) expect(shareTextFor(r)).toContain("%");
  });

  /**
   * RT-N1 as amended: a refusal names what happened and says honestly whether a
   * second attempt would change anything. This is the one refusal in the
   * product with a real remedy, so failing to name it would be the "invitation
   * the reader cannot act on" defect running in reverse.
   */
  it("says what happened and that a second sitting could fix it", () => {
    expect(BIAS_NO_READING.sub).toContain("scale");
    expect(
      BIAS_NO_READING.sub.toLowerCase(),
      "the refusal does not tell the reader that another sitting would have something to measure",
    ).toContain("would leave this something to measure");
  });

  it("never converts the failure into a compliment", () => {
    const words = ["well done", "impressive", "good ear", "you know", "congratulations", "nice"];
    const text = `${BIAS_NO_READING.title} ${BIAS_NO_READING.sub}`.toLowerCase();
    for (const word of words) expect(text, `the refusal flatters: "${word}"`).not.toContain(word);
  });

  /**
   * The three surfaces. Read rather than rendered — see the header. Each must
   * ASK before it prints, and asking is the whole fix.
   */
  /**
   * NO SURFACE MAY REACH THE RAW NUMBER, WHICH IS A STRONGER RULE THAN THE ONE
   * THIS REPLACED.
   *
   * The first version asked whether each file mentioned the gate somewhere. A
   * file that gated one thing and printed another passed it — proximity
   * mistaken for a relationship, the same defect twice in one session. Now the
   * decision lives in `biasHeadline`, whose refusal is a NULL rather than a
   * zero, so a surface has no number available to leak. What is checkable is
   * that none of them goes around it.
   *
   * ANALYTICS IS EXEMPT AND SAYS SO IN THE DATA. Recording the number is not
   * displaying it, and the event now carries `reading` beside `pct`, so a
   * refused sitting cannot be read as a real 0% in the funnel either.
   */
  it("leaves no surface holding the raw number", () => {
    const surfaces = [
      "src/app/bias/result/page.tsx",
      "src/app/bias/BiasFlow.tsx",
      "src/app/api/bias-card/route.tsx",
    ];
    let checked = 0;
    for (const path of surfaces) {
      const source = readFileSync(path, "utf8");
      expect(source, `${path} does not go through the one place that decides`).toContain("biasHeadline");
      const leaks = source
        .split(String.fromCharCode(10))
        .filter((line) => line.indexOf("result.pct") !== -1)
        .filter((line) => line.indexOf("//") === -1 && line.indexOf("props=") === -1 && line.indexOf("pct: result.pct") === -1);
      checked += 1;
      expect(leaks, `${path} still reaches result.pct in markup:`).toEqual([]);
    }
    expect(checked).toBe(surfaces.length);
  });

  /**
   * THE FUNCTION ITSELF, WHICH IS THE ONLY PART THAT CAN BE PROVEN RATHER THAN
   * READ. A null percentage is the fix: a caller cannot print a refusal as a
   * number when there is no number to print.
   */
  it("hands a refused sitting no percentage at all", () => {
    expect(biasHeadline(refused()).pct).toBeNull();
    expect(biasHeadline(refused()).title).toBe(BIAS_NO_READING.title);
    for (const r of read()) {
      expect(biasHeadline(r).pct, "an ordinary sitting lost its number").not.toBeNull();
      expect(biasHeadline(r).pct).toContain("%");
      expect(biasHeadline(r).title).not.toBe(BIAS_NO_READING.title);
    }
  });
});
