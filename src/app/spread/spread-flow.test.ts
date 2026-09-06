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
 *   (d) THE SITTING IS RECORDED, AND ONLY THE ANSWERS ARE (E18/S2). This
 *       replaced a guard that asserted the flow stores NOTHING, on a premise
 *       that was already false — see the block itself.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const FLOW = readFileSync("src/app/spread/SpreadFlow.tsx", "utf8");
const BIAS = readFileSync("src/app/bias/BiasFlow.tsx", "utf8");

/**
 * THE FLOW WITH ITS COMMENTS TAKEN OUT, for the scans that forbid a token.
 *
 * WRITTEN BECAUSE THE FIRST VERSION OF (d) FAILED ON ITS OWN EXPLANATION. The
 * docblock beside the write says "`recordResult` is the single localStorage
 * write in this codebase" — and the guard forbidding `localStorage` in this
 * file read that sentence and failed. It is the third time in two sessions that
 * a comment describing a rule has reproduced the thing the rule forbids, and
 * the established answer so far has been to keep the word out of the prose.
 * That answer makes the code harder to read to keep a weak scan happy. Stripping
 * comments is the fix that lets both say what they mean.
 *
 * PROVEN TO HAVE STRIPPED SOMETHING, below. A regex that quietly matched
 * nothing would leave every scan built on it passing while checking the whole
 * file, comments included — the failure mode of every scan whose needle has
 * gone stale.
 */
const CODE = FLOW.replace(/[/][*][\s\S]*?[*][/]/g, "").replace(/[/][/].*/g, "");

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

/**
 * (d) THE SITTING IS RECORDED, AND ONLY THE ANSWERS ARE (E18/S2, RT-O2 a).
 *
 * THIS GUARD USED TO ASSERT THE OPPOSITE, and it is the reason the defect
 * lasted. It read "the surface stores nothing, because persistence is unruled"
 * and failed the build if `SpreadFlow` so much as mentioned `recordResult`,
 * with the message "RT-G has never been ruled" — a premise that had been false
 * for four days when it was written. A guard can pin a mistaken belief in place
 * just as firmly as it pins a correct one, and this one made the belief look
 * deliberate to everyone who read it afterwards.
 *
 * What is worth guarding is not whether the flow stores, but WHAT it stores.
 */
describe("(d) the sitting is recorded, and only the answers are", () => {
  it("strips comments before scanning, and the strip does something", () => {
    expect(CODE.length).toBeLessThan(FLOW.length - 2000);
    expect(CODE.includes("recordResult(")).toBe(true);
    expect(CODE.includes("THE SITTING, ONTO THIS DEVICE")).toBe(false);
  });

  it("writes through the store rather than reaching for the browser itself", () => {
    expect(CODE.includes("recordResult(")).toBe(true);
    /*
     * The single-write rule: every persisted byte in this product goes through
     * `result-store.ts`, which is what lets the namespace sweep in
     * `forgetThisBrowser` promise that it reached everything.
     */
    for (const store of ["localStorage", "sessionStorage", "document.cookie", "indexedDB"]) {
      expect(
        new RegExp(`(?<![A-Za-z0-9_$])${store}`).test(CODE),
        `SpreadFlow reaches ${store} directly instead of going through the store`,
      ).toBe(false);
    }
  });

  /**
   * THE ARGUMENTS, NOT JUST THE FUNCTION NAMES — and this is a hole this guard
   * had until it was reverse-tested.
   *
   * The first version asserted that `encodeSpreadRecognised` appears in the
   * write. Replacing the argument with `[]` — so the sitting stored the ratings
   * and forgot which clips the person had asked to set aside — left all eleven
   * tests green. That defect is worse than not storing at all: the recalled
   * reading would be computed over clips the listener excluded, so the panel
   * would show a DIFFERENT result from the one they were given, with nothing on
   * screen to say so.
   *
   * There is no DOM environment in this suite, so a scan is the tool available
   * and it has to describe the defect rather than the shape. Pinning the state
   * variables is what makes it able to see that one.
   */
  it("stores the raw answers, both of them, and no computed figure", () => {
    const call = CODE.slice(CODE.indexOf("recordResult("), CODE.indexOf("recordResult(") + 400);
    expect(call.includes("encodeSpreadRatings(ratings)")).toBe(true);
    expect(call.includes("encodeSpreadRecognised(recognised)")).toBe(true);
    // …and the call site hands `remember` the sitting's own state, not a stub.
    expect(CODE.includes("remember(next, recognised)")).toBe(true);
    for (const computed of ["meanGap", "farMeanGap", "spreadIfIndifferent", "refusal", "count"]) {
      expect(call.includes(computed), `the stored payload carries ${computed}`).toBe(false);
    }
  });

  it("records before the reveal is shown, not after", () => {
    const write = CODE.indexOf("remember(next, recognised)");
    const reveal = CODE.indexOf('setPhase("reveal")');
    expect(write).toBeGreaterThan(-1);
    expect(reveal).toBeGreaterThan(-1);
    expect(write).toBeLessThan(reveal);
  });

  /**
   * THE POOL VERSION RIDES ALONG, which is what lets a stored sitting be
   * dropped rather than misread when the six clips are re-windowed. A literal
   * here instead would decode last month's answers against a reordered pool.
   */
  it("stamps the sitting with the pool version rather than a literal", () => {
    expect(CODE.includes("SPREAD_POOL_VERSION")).toBe(true);
    expect(/poolVersion:\s*\d/.test(CODE)).toBe(false);
  });
});
