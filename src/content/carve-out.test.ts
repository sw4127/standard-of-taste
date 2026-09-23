/**
 * THE CARVE-OUT'S LIST BITES ON WHAT IT MUST, AND NOT ON WHAT THE SITE SAYS
 * ABOUT ITSELF (RT-Z10 a, BA-5; change list D3).
 *
 * The positives are planted specimens, one per pattern, and the first is the
 * sentence the snack's model actually rendered on 2026-09-23 — the reason the
 * therapy terms were added. The negatives are sentences the site renders today
 * in which a broad pattern would fire on the product talking about its own
 * engineering; each is a reason a pattern was narrowed.
 */
import { describe, expect, it } from "vitest";
import { CARVE_OUT, CARVE_OUT_PATTERNS, carveOutBreaches } from "./carve-out";

const MUST_TRIP = [
  "You don't hate people — you hate the noise they make, and you've learned that headphones are cheaper than therapy.",
  "You chose the slower decay every time — you have unresolved loss.",
  "This pattern is common in anxious listeners.",
  "Late nights like these can be a sign of depression.",
  "A therapist would call this avoidance.",
  "It reads like grief.",
  "Something from your childhood is in here.",
  "The pattern looks traumatic.",
  "Songs about abuse, on repeat.",
  "Clinically, this is rumination.",
  "Worth asking about your mental health.",
];

const MUST_PASS = [
  "Your result is a measured number, not a diagnosis.",
  "And directly above it, the diagnosis: Nothing is blocked by engineering.",
  "You played the same three tracks on most nights after midnight.",
  "Is this music for staying in a feeling, or for getting out of one?",
];

describe("the carve-out list", () => {
  it("is one list, and a real one", () => {
    expect(CARVE_OUT_PATTERNS.length).toBeGreaterThanOrEqual(8);
  });

  it("trips on every planted specimen, the snack's own sentence first", () => {
    const missed = MUST_TRIP.filter((s) => carveOutBreaches(s).length === 0);
    expect(missed).toEqual([]);
    // The combined expression the site scanner uses agrees with the list.
    expect(MUST_TRIP.filter((s) => !CARVE_OUT.test(s))).toEqual([]);
  });

  it("does not fire on the site describing its own engineering, or on an offer", () => {
    expect(MUST_PASS.filter((s) => carveOutBreaches(s).length > 0)).toEqual([]);
    expect(MUST_PASS.filter((s) => CARVE_OUT.test(s))).toEqual([]);
  });

  it("catches therapy specifically, which neither older list did", () => {
    expect(carveOutBreaches("cheaper than therapy").length).toBe(1);
  });
});
