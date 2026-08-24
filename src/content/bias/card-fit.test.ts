import { describe, it, expect } from "vitest";
import { VERDICT_COPY, biasCardSwayLine, biasCardCta } from "./copy";
import { EM_PER_CHAR_FIGURE, EM_PER_CHAR_PROSE, FIT_SAFETY } from "@/content/staircase/copy";

/**
 * E6/S27 — the bias card had no fit guard at all.
 *
 * E6/S26 measured it and found no overflow, which is why this is hardening
 * rather than a fix. But "measured once, by me, in a browser session that is
 * now closed" is not a guard, and the threshold card was equally fine right up
 * until a pool of lossy bands arrived with longer strings than anyone had
 * pictured.
 *
 * The bias card's exposure is real: `biasCardSwayLine` grows with the
 * denominator, and RT-103a has the PM growing the scored pool toward fourteen.
 * "moved with the label on 14 of 14 clips" is longer than anything measured
 * today, and it arrives with a change nobody would think of as a card change.
 */
const HERO_PX = 76; // src/app/api/bias-card/route.tsx, the verdict title
const BODY_PX = 30; // the sway line and the CTA
const USABLE = 1080 - 64 * 2; // card width minus its padding, at scale 1

/**
 * Prose and figures are measured with DIFFERENT constants, because they are
 * different widths. The first version of this file used the figure constant for
 * everything and failed the CTA — which measures 824px against an 876px target
 * and fits perfectly well. A guard that fails a working card sends somebody to
 * break it.
 */
const fitsProse = (text: string, size: number) =>
  text.length * EM_PER_CHAR_PROSE * size <= USABLE * FIT_SAFETY;
const fitsFigure = (text: string, size: number) =>
  text.length * EM_PER_CHAR_FIGURE * size <= USABLE * FIT_SAFETY;

describe("E6/S27 — every bias card line fits the card", () => {
  it("every verdict title fits at hero size", () => {
    const over = Object.entries(VERDICT_COPY)
      .filter(([, v]) => !fitsProse(v.title, HERO_PX))
      .map(([k, v]) => `${k}: "${v.title}"`);
    expect(over, over.join("; ")).toEqual([]);
  });

  it("the sway line fits at every denominator the pool could reach", () => {
    // Not just today's eight. RT-103a grows the scored pool toward fourteen,
    // and the widest sentence is the all-of-them case at the largest pool.
    const over: string[] = [];
    for (let movable = 1; movable <= 20; movable++) {
      const line = biasCardSwayLine(movable, movable);
      if (!fitsProse(line, BODY_PX)) over.push(`${movable}/${movable}: "${line}"`);
    }
    expect(
      over,
      "the sway line outgrows the card at these pool sizes — it is composed from a " +
        "count, so a pool change is a card change:\n" + over.join("\n"),
    ).toEqual([]);
  });

  it("the CTA fits with a realistic host", () => {
    expect(fitsProse(biasCardCta("vibe-check-app-sepia.vercel.app"), BODY_PX)).toBe(true);
  });

  it("would fail on a line that genuinely does not fit", () => {
    // Proven in both directions: a guard that cannot fail is the defect E6/S26
    // found in the delicacy card's own width check.
    expect(fitsProse("x".repeat(60), HERO_PX)).toBe(false);
    expect(fitsFigure("9".repeat(40), HERO_PX)).toBe(false);
  });
});
