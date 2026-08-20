import { describe, it, expect } from "vitest";
import { detectionBand } from "@/engine/delicacy";
import { detectionCardAnchor, detectionCardFigure } from "./copy";
/**
 * E6/S11 — the share card's two lines, at every reachable score.
 *
 * WHY A WIDTH TEST EXISTS AT ALL. The card is Satori-rendered to a PNG, so a
 * line that is too long does not throw, does not fail tsc, and does not fail
 * the suite — it silently wraps or clips in an image nobody on the team looks
 * at. The old tier titles bounded the width the layout was built for, and
 * "The key in the wine." was the longest of them; anything inside that has
 * already been proven to fit at this font size.
 *
 * The second test pins the defect this slice found: the card carried a JSX
 * literal reading "a coin flip calls 3" — hardcoded from the six-trial pool,
 * never updated when the scored set went to fifteen, and shipped on every card
 * anyone shared. The gate never saw it because a fragment in a component is a
 * fragment outside the gate.
 */
describe("E6/S11 — share card lines across every score", () => {
  it("stay inside the width the old verdict already fitted", () => {
    // "The key in the wine." was the longest tier title the layout carried.
    const OLD_LONGEST = "The key in the wine.".length;
    let widest = "";
    for (let k = 0; k <= 15; k++) {
      const f = detectionCardFigure(detectionBand(k, 15));
      if (f.length > widest.length) widest = f;
    }
    expect(widest.length, `widest figure "${widest}"`).toBeLessThanOrEqual(OLD_LONGEST);
  });
  it("never prints a coin calling a hardcoded 3", () => {
    for (let k = 0; k <= 15; k++) {
      expect(detectionCardAnchor(detectionBand(k, 15))).toContain("averages 7.5");
    }
  });
});
