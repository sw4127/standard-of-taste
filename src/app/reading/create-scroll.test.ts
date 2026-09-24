/**
 * THE CREATION MOCK OPENS WITH "GENERATE" ON SCREEN (PRD part 4, S-4).
 *
 * The cases are the measured ones (production build, 2026-09-23), in page
 * coordinates: the label's top and the note's bottom with the page at the top.
 * At 1280 wide the label sits at 305 and the note ends at 764; at 375 wide the
 * label sits at 492 and the note ends at 970 (read as 494 on screen after the
 * page scrolled 476). The rendered run in the same commit checks the browser
 * does what this function says, at all three viewports below.
 */
import { describe, expect, it } from "vitest";
import { CREATE_SCROLL_MARGIN, createScrollTop } from "./create-scroll";

describe("where the creation mock opens", () => {
  it("stays at the top when everything down to the note fits (desktop, 1280 x 820)", () => {
    expect(createScrollTop({ labelTop: 305, noteBottom: 764, viewport: 820 })).toBe(0);
  });

  it("scrolls on a shorter desktop window, where the note ends below the fold (1280 x 720)", () => {
    expect(createScrollTop({ labelTop: 305, noteBottom: 764, viewport: 720 })).toBe(289);
  });

  it("scrolls to the mock's label when the note is below the fold (phone, 375 x 812)", () => {
    const top = createScrollTop({ labelTop: 492, noteBottom: 970, viewport: 812 });
    expect(top).toBe(492 - CREATE_SCROLL_MARGIN);
    // And the note is then on screen.
    expect(970 - top).toBeLessThanOrEqual(812);
  });

  it("never scrolls to a negative position", () => {
    expect(createScrollTop({ labelTop: 4, noteBottom: 2000, viewport: 600 })).toBe(0);
  });

  it("treats a note ending exactly at the fold as fitting", () => {
    expect(createScrollTop({ labelTop: 300, noteBottom: 812, viewport: 812 })).toBe(0);
  });
});
