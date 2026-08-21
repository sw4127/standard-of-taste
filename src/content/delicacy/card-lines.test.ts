import { describe, it, expect } from "vitest";
import { detectionBand } from "@/engine/delicacy";
import { detectionCardAnchor, detectionCardFigure } from "./copy";
import { EM_PER_CHAR } from "@/content/staircase/copy";
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
  /**
   * REWRITTEN IN E6/S26, because the version it replaces could not have caught
   * the bug it was written to prevent.
   *
   * It compared CHARACTER COUNT against the length of "The key in the wine." —
   * the longest retired tier title. That is the exact rule E6/S25 disproved on
   * the threshold card, where "48–128 kbps" is eleven characters and rendered
   * 979px into 920px of card. Characters are not width; a digit is roughly
   * twice a full stop, and these figures are almost all digits and percent
   * signs.
   *
   * Measured outcome: the delicacy card does NOT overflow. Its hero sits at
   * 76px against the threshold card's 150px, and the widest figure
   * ("59%–100% detected") comes to 720px inside 952px of usable card. So this
   * is a guard replacement, not a bug fix — the old guard simply could not have
   * told us either way.
   */
  it("no figure is wider than the card at the size the card renders it", () => {
    const HERO_PX = 76; // src/app/api/delicacy-card/route.tsx
    const USABLE = 1080 - 64 * 2; // card width minus its padding, at scale 1
    const tooWide: string[] = [];
    for (let k = 0; k <= 15; k++) {
      const f = detectionCardFigure(detectionBand(k, 15));
      const estimated = f.length * EM_PER_CHAR * HERO_PX;
      if (estimated > USABLE) tooWide.push(`${f}: ~${Math.round(estimated)}px of ${USABLE}`);
    }
    expect(tooWide, tooWide.join("; ")).toEqual([]);
  });

  it("has headroom, so a slightly longer unit does not silently clip", () => {
    // The estimate says ~20 characters fit at this size. The widest figure is
    // 17, which is thin cover: two more digits would put it at the edge. Pinned
    // so that a future unit string lands as a failing test rather than a
    // clipped PNG nobody opens.
    const HERO_PX = 76;
    const USABLE = 1080 - 64 * 2;
    const maxChars = Math.floor(USABLE / (EM_PER_CHAR * HERO_PX));
    let widest = 0;
    for (let k = 0; k <= 15; k++) widest = Math.max(widest, detectionCardFigure(detectionBand(k, 15)).length);
    expect(maxChars, `fits ${maxChars} chars, widest figure is ${widest}`).toBeGreaterThan(widest);
  });
  it("never prints a coin calling a hardcoded 3", () => {
    for (let k = 0; k <= 15; k++) {
      expect(detectionCardAnchor(detectionBand(k, 15))).toContain("averages 7.5");
    }
  });
});
