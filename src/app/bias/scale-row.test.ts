/**
 * THE RATING SCALE IS ONE ROW ON A DESKTOP (Phase 3, Track N).
 *
 * MEASURED IN A BROWSER BEFORE THE CHANGE: eleven points wrapped 6 + 5 into two
 * rows inside a 512px column at a 1280px viewport. A wrapped scale is not a
 * smaller scale, it is a different instrument to look at — the ends stop being
 * the ends, 5 sits directly under 0, and the eye reads a grid where the task
 * needs a line. After the flow joined the site shell: one row, eleven buttons,
 * 83px each. On a phone it still wraps, which is right.
 *
 * WHY A SOURCE CHECK AND WHAT IT CANNOT DO. It cannot see a rendered row; only
 * a browser can, and that is where this was verified. What it CAN do is pin the
 * relationship that made the row possible — the desktop column count must equal
 * the number of points on the scale. Add a twelfth point and this fails, which
 * is the moment somebody would otherwise ship a 6 + 6 grid and not notice.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BIAS_SCALE_MAX } from "@/engine/bias";

/**
 * BOTH FLOWS THAT USE THE ELEVEN-POINT SCALE. The Ranking Test renders the same
 * scale from the same constant and had the same wrap — measured at 576px, 6 + 5
 * — so it gets the same fix and the same check. A guard written for one of two
 * identical screens is half a guard.
 */
const FLOWS = ["src/app/bias/BiasFlow.tsx", "src/app/spread/SpreadFlow.tsx"];

describe.each(FLOWS)("the eleven-point rating scale in %s", (FLOW) => {
  const source = readFileSync(FLOW, "utf8");
  const points = BIAS_SCALE_MAX + 1;

  it("reads the flow and a real scale length", () => {
    expect(source.length).toBeGreaterThan(1000);
    expect(points).toBeGreaterThan(5);
  });

  it("gives the desktop grid one column per point on the scale", () => {
    expect(
      source.indexOf(`lg:grid-cols-${points}`),
      `the scale has ${points} points, so the desktop grid needs lg:grid-cols-${points} to put them ` +
        "on one row. Without it they wrap, and a wrapped scale reads as a grid rather than a line — " +
        "the ends stop being the ends.",
    ).toBeGreaterThan(-1);
  });

  it("still wraps on a phone, where one row cannot fit", () => {
    expect(
      source.indexOf("grid-cols-6 gap-1.5 lg:grid-cols-"),
      "the narrow-viewport column count is gone. Eleven 83px buttons do not fit across a 375px " +
        "phone; the wrap there is correct and must survive.",
    ).toBeGreaterThan(-1);
  });
});
