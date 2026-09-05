/**
 * THE LEGAL PAGE DESCRIBES THE PRODUCT THAT EXISTS (E17).
 *
 * Its non-Privacy sections were written for the legacy funnel and carried as
 * deferred debt through five handoffs. Two of their claims were not stale but
 * FALSE, and both were on the page a reader opens precisely when they want to
 * know what they are agreeing to:
 *
 *   - a paid "full read", with all sales final. The D4 amendment says in terms
 *     that user-facing copy still promising a paid tier is a false claim and
 *     must be fixed on sight. This page was the last one.
 *   - a "personality-style reading". D1 is that the product evaluates taste and
 *     never predicts personality, mood or psychological states.
 *
 * Nothing held it to either ruling, which is why five handoffs went by. This
 * does. The needles are the CLAIMS, not the words: "no paid tier" has to be
 * sayable, so the check is for language that OFFERS one.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const PAGE = readFileSync("src/app/legal/page.tsx", "utf8");

/** Only the JSX a reader sees — comments explaining the fix are not claims. */
function rendered(): string {
  return PAGE.replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, " ")
    .replace(/^\s*\/\/.*$/gm, " ");
}

describe("the legal page offers no paid tier", () => {
  it("reads a real page, not an empty match", () => {
    expect(rendered().length).toBeGreaterThan(1500);
    expect(rendered()).toContain("Terms of use");
  });

  it("sells nothing", () => {
    const selling = [
      "all sales are final",
      "one-time digital purchase",
      "purchase record",
      "payment receipt",
      "merchant of record",
      "what you paid for",
      "the moment you pay",
    ];
    const found = selling.filter((s) => rendered().toLowerCase().includes(s));
    expect(found, "the legal page still describes a purchase").toEqual([]);
  });

  it("says the product is free where a reader would look for the price", () => {
    expect(rendered()).toMatch(/no paid tier/i);
  });
});

describe("the legal page claims no personality reading (D1)", () => {
  it("does not offer one", () => {
    const predicting = [
      "personality-style",
      "attachment style",
      "big five",
      "playful lens",
    ];
    const found = predicting.filter((s) => rendered().toLowerCase().includes(s));
    expect(found, "the legal page describes a personality product").toEqual([]);
  });

  it("says plainly that it is not a personality test", () => {
    expect(rendered()).toMatch(/not a personality test/i);
  });
});

describe("the legal page names the product that ships", () => {
  it("is branded the gym, not the legacy name", () => {
    // The football disclaimer is kept — /quiz and /fan-verdict are still routed
    // — but the page itself must not be branded as the old product.
    expect(rendered()).toContain("The Taste Gym");
    expect(rendered().includes("VIBE CHECK")).toBe(false);
  });
});
