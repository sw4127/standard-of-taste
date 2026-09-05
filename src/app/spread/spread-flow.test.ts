/**
 * TRACK N / S5 proof — the properties of the flow that a source scan can hold.
 *
 * A SOURCE SCAN IS THE WEAKEST GUARD CLASS and is used here deliberately, for
 * the two facts that were WRONG in the first build and were found only by
 * driving the rendered page. Both are stated as the rendered defect rather than
 * as a style rule, because a rule nobody can see fail gets edited away.
 *
 *   (a) INTERACTIVE CONTROLS ARE GATED WITH `disabled`, NEVER WITH
 *       `pointer-events-none`. The first version dimmed the rating scale with
 *       opacity and switched off pointer events. That looks identical and gates
 *       nothing: driving the page submitted a rating on clip one without
 *       answering the recognition question and without the listen gate arming,
 *       then advanced to clip two.
 *   (b) THE RATING SCALE WRAPS. At 375px, eleven buttons in eleven columns
 *       measured 27px wide; the Prestige Test's own scale measures 50px because
 *       it wraps onto two rows. I had assumed mine inherited that and it did
 *       not.
 *   (c) THE RECOGNITION QUESTION IS ASKED BEFORE THE RATING, which is the
 *       ordering the whole filter depends on.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const FLOW = readFileSync("src/app/spread/SpreadFlow.tsx", "utf8");
const BIAS = readFileSync("src/app/bias/BiasFlow.tsx", "utf8");

describe("(a) controls are gated by disabled, not by pointer-events", () => {
  it("never uses pointer-events-none in this flow", () => {
    expect(FLOW.includes("pointer-events-none")).toBe(false);
  });

  it("gates the rating scale on the recognition answer", () => {
    // Asserted in the rendered attribute form, not the bare identifier.
    expect(FLOW.includes("disabled={said === null}")).toBe(true);
  });

  it("gates the recognition question on the listen gate", () => {
    expect(FLOW.includes("disabled={!heard}")).toBe(true);
  });
});

describe("(b) the rating scale wraps rather than squeezing", () => {
  it("uses the same column count as the Prestige Test's scale", () => {
    // 375px: eleven columns gives 27px targets, six gives 51px.
    const cols = /grid-cols-(\d+) gap/.exec(FLOW.slice(FLOW.indexOf("How good is it?")));
    expect(cols).not.toBeNull();
    expect(cols![1]).toBe("6");
    expect(BIAS.includes("grid grid-cols-6")).toBe(true);
  });
});

describe("(c) the recognition question comes first", () => {
  it("renders the recognition block above the rating block", () => {
    const recognition = FLOW.indexOf("Had you heard this before?");
    const rating = FLOW.indexOf("How good is it?");
    expect(recognition).toBeGreaterThan(-1);
    expect(rating).toBeGreaterThan(-1);
    expect(recognition).toBeLessThan(rating);
  });

  it("clears the answer when the clip changes, so it is never carried over", () => {
    expect(FLOW.includes("setSaid(null)")).toBe(true);
    expect(FLOW.includes("setHeard(false)")).toBe(true);
  });
});

describe("the surface stores nothing, because persistence is unruled", () => {
  it("reads no result store and writes none", () => {
    for (const accessor of ["readResult", "readHistory", "recordResult", "localStorage"]) {
      expect(
        new RegExp(`(?<![A-Za-z0-9_$])${accessor}`).test(FLOW),
        `SpreadFlow touches ${accessor}; RT-G has never been ruled`,
      ).toBe(false);
    }
  });
});
