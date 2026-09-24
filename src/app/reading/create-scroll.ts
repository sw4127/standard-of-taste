/**
 * WHERE THE CREATION MOCK OPENS (PRD part 4, S-4; BP-GOAL).
 *
 * Measured 2026-09-23 on a production build: at 375 × 812 the mock opened with
 * the page's title and statement filling the first 492 px, so "Generate" and
 * its note — "No audio is generated" — sat at 902 px, below the fold. The last
 * of the three taps landed on a screen whose point was off it.
 *
 * The rule: if everything down to the note already fits on the first screen,
 * open at the top, as before (every desktop width measured). Otherwise open
 * with the mock's label a small margin from the top. The label comes first in
 * the mock, so the screen that says this is a mock of a fictional company is
 * still the first thing seen (BP-GOAL, third clause).
 *
 * Positions are page coordinates (a rect's top plus the scroll offset), so the
 * answer does not depend on where the previous step left the page.
 */

/** Space left above the mock's label when the page scrolls to it. */
export const CREATE_SCROLL_MARGIN = 16;

export function createScrollTop(p: { labelTop: number; noteBottom: number; viewport: number }): number {
  if (p.noteBottom <= p.viewport) return 0;
  return Math.max(0, p.labelTop - CREATE_SCROLL_MARGIN);
}
