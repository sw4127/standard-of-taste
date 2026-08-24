import { describe, it, expect } from "vitest";
import { staircaseCardFixtures } from "./fixtures";
import { thresholdCardFigure, thresholdFigureFontSize, EM_PER_CHAR_FIGURE, FIT_SAFETY } from "./copy";

/**
 * E6/S25 — the hero figure must fit the card it is the hero of.
 *
 * Satori does not throw on a too-long line and does not wrap a flex row: it
 * clips, inside a PNG, silently. The card route returned 200 for every figure
 * while two of them — "48–128 kbps" at 979px and "64–160 kbps" at 983px —
 * rendered past the 920px of usable card. Nothing in the toolchain could have
 * said so, which is why the check is here rather than in a status code.
 *
 * `EM_PER_CHAR_FIGURE` was MEASURED in a real browser with the bundled font, not
 * assumed; these assertions are the rule built on it, applied to every figure
 * the instrument can actually produce.
 */
const USABLE = 920;
const MAX = 150;

function realFigures(): string[] {
  return [...new Set(staircaseCardFixtures().map((f) => thresholdCardFigure(f.result)))].sort();
}

describe("E6/S25 — every reachable card figure fits", () => {
  it("covers the whole instrument, not a sample", () => {
    const figures = realFigures();
    // Three families, four outcome kinds — if this collapses to a handful the
    // sweep has stopped sweeping and the fit check below means nothing.
    expect(figures.length).toBeGreaterThanOrEqual(8);
  });

  it("no figure is sized past the card at any reachable value", () => {
    const tooWide: string[] = [];
    for (const f of realFigures()) {
      const size = thresholdFigureFontSize(f, USABLE, MAX);
      const estimated = f.length * EM_PER_CHAR_FIGURE * size;
      if (estimated > USABLE) tooWide.push(`${f}: ${size}px -> ~${Math.round(estimated)}px of ${USABLE}`);
    }
    expect(tooWide, tooWide.join("; ")).toEqual([]);
  });

  it("would have failed on the character-count rule it replaced", () => {
    // Proven in both directions. The old rule is reconstructed here so the
    // regression is a fact in the suite rather than a claim in a commit
    // message: two lossy bands sized 150px and overflowed.
    const oldRule = (f: string) => (f.length > 12 ? 108 : 150);
    const overflowed = realFigures().filter((f) => f.length * EM_PER_CHAR_FIGURE * oldRule(f) > USABLE);
    expect(overflowed.length, "the old rule no longer overflows — check the pool has not changed").toBeGreaterThan(0);
  });

  /**
   * E6/S27 — the margin must not live entirely in EM_PER_CHAR_FIGURE.
   *
   * Before this, the sizing filled the box exactly: the widest figure estimated
   * 913.9px of 920, so the only slack was the constant being generous. If the
   * font's real metrics ever moved the wrong way, all three fit guards would
   * agree a clipped card was fine. Now every figure must leave real room.
   */
  it("leaves headroom, so one constant is not carrying the whole margin", () => {
    const thin: string[] = [];
    for (const f of realFigures()) {
      const size = thresholdFigureFontSize(f, USABLE, MAX);
      const estimated = f.length * EM_PER_CHAR_FIGURE * size;
      if (estimated > USABLE * FIT_SAFETY + 1) {
        thin.push(`${f}: ~${Math.round(estimated)}px, past the ${Math.round(USABLE * FIT_SAFETY)}px target`);
      }
    }
    expect(thin, thin.join("; ")).toEqual([]);
  });

  it("does not shrink the type when it does not have to", () => {
    // An over-cautious rule that made every figure tiny would also "fit". The
    // short ones must still get the full size.
    expect(thresholdFigureFontSize("100 ms", USABLE, MAX)).toBe(MAX);
    expect(thresholdFigureFontSize("32 kbps", USABLE, MAX)).toBe(MAX);
  });

  it("never returns a nonsense size", () => {
    expect(thresholdFigureFontSize("", USABLE, MAX)).toBe(MAX);
    expect(thresholdFigureFontSize("x".repeat(200), USABLE, MAX)).toBeGreaterThan(0);
  });
});
