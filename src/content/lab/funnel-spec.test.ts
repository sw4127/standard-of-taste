/**
 * E15/S3 proof. PRE-REGISTERED, written before the section rendered:
 *
 *   (a) EVERY STEP RESOLVES IN THE LIVE EVENT REGISTRY, and a step naming a
 *       dead event fails at module load rather than rendering as a zero.
 *   (b) THE STEP DESCRIPTIONS ARE THE REGISTRY'S OWN. Nothing in the spec
 *       re-describes an event; `docs/ANALYTICS.md` drifted from the emitted set
 *       by nineteen events while reading as complete, and a second copy here
 *       would be free to do the same.
 *   (c) THE SAMPLE SIZE IS THE TEXTBOOK ONE. "385 for plus-or-minus five points
 *       at 95%" is the most widely cited sample size there is, so it is checked
 *       against that rather than against my own arithmetic.
 *   (d) THE ORDER IS A REAL ORDER. A funnel whose steps can be permuted without
 *       failing anything is a list, not a funnel.
 */
import { describe, expect, it } from "vitest";
import { KNOWN_EVENTS } from "@/lib/events";
import { FUNNEL_SPEC, sessionsForPrecision, stepTrigger } from "./funnel-spec";

describe("E15/S3 — the funnel specification", () => {
  it("names only events the code actually emits", () => {
    expect(FUNNEL_SPEC.length).toBeGreaterThan(3);
    for (const step of FUNNEL_SPEC) {
      expect(step.event in KNOWN_EVENTS, `${step.label} → ${step.event}`).toBe(true);
    }
  });

  it("takes each step's description FROM the registry rather than restating it", () => {
    for (const step of FUNNEL_SPEC) {
      expect(stepTrigger(step)).toBe(KNOWN_EVENTS[step.event]);
      // The label is the reader's word for the step; it must not be a second
      // copy of the registry's sentence, or the two can disagree.
      expect(step.label).not.toBe(KNOWN_EVENTS[step.event]);
      expect(step.label.length).toBeLessThan(40);
    }
  });

  it("uses each event at most once — a step counted twice is not a funnel", () => {
    const events = FUNNEL_SPEC.map((s) => s.event);
    expect(new Set(events).size).toBe(events.length);
  });

  /**
   * THE ORDER IS THE CLAIM. These events fire in this sequence in the flow, and
   * the page prints them as a descent. Pinned by naming the first and last and
   * asserting the two passes are in the order a person meets them — permuting
   * the array must fail something.
   */
  it("descends in the order a person meets the product", () => {
    const at = (event: string) => FUNNEL_SPEC.findIndex((s) => s.event === event);
    expect(at("landing_view")).toBe(0);
    expect(at("bias_share")).toBe(FUNNEL_SPEC.length - 1);
    expect(at("bias_frame_view")).toBeLessThan(at("bias_start"));
    expect(at("bias_blind_complete")).toBeLessThan(at("bias_labeled_complete"));
    expect(at("bias_labeled_complete")).toBeLessThan(at("bias_result"));
    expect(at("bias_result")).toBeLessThan(at("bias_debrief_view"));
  });

  it("returns the textbook sample size for a proportion at 95%", () => {
    // The canonical survey figure: n = 385 for ±5 points at 95% confidence,
    // worst case p = 0.5. If this ever stops being 385 the formula changed.
    expect(sessionsForPrecision(5)).toBe(385);
    // ±10 points: 96.04 before rounding up.
    expect(sessionsForPrecision(10)).toBe(97);
    // ±3 points is quoted as 1067 (rounded) or 1068 (rounded up); this rounds
    // up, because a fraction of a respondent cannot be recruited.
    expect(sessionsForPrecision(3)).toBe(1068);
  });

  it("gets tighter as the interval narrows, and refuses a nonsense width", () => {
    expect(sessionsForPrecision(1)).toBeGreaterThan(sessionsForPrecision(5));
    expect(() => sessionsForPrecision(0)).toThrow(/half-width/);
    expect(() => sessionsForPrecision(-5)).toThrow(/half-width/);
    expect(() => sessionsForPrecision(100)).toThrow(/half-width/);
  });
});
