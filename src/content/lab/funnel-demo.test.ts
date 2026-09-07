/**
 * THE DEMONSTRATION DEMONSTRATES THIS PRODUCT'S FUNNEL (E19/S17).
 *
 * A recovery table on invented event names would be a statistics exercise
 * wearing the Lab's badge. These pin the two things that make it a
 * demonstration of THIS analysis: the steps are the published specification's
 * own events, and the estimator recovers the answer key well enough that the
 * page's claims about it are true.
 *
 * THE PAGE'S NUMBERS ARE COMPUTED AT RENDER, so a drift here is a drift on the
 * page. That is the point of keeping the rates in a module.
 */
import { describe, expect, it } from "vitest";
import { FUNNEL_SPEC } from "./funnel-spec";
import { simulateFunnel } from "@/analytics/funnel";
import { DEMO_ARRIVALS, DEMO_REPLICATIONS, DEMO_SEED, DEMO_STEPS, demoRecovery } from "./funnel-demo";

describe("the Lab's funnel demonstration", () => {
  it("runs on the specification's real events, not invented ones", () => {
    expect(DEMO_STEPS.length).toBe(FUNNEL_SPEC.length);
    expect(DEMO_STEPS.length).toBeGreaterThan(3);
    for (const [i, step] of DEMO_STEPS.entries()) {
      expect(step.event, "the demo drifted from the published funnel").toBe(FUNNEL_SPEC[i].event);
    }
  });

  it("chooses rates that span the range, so the demonstration is not easy", () => {
    const rates = DEMO_STEPS.map((s) => s.passThrough);
    expect(Math.min(...rates)).toBeLessThan(0.55);
    expect(Math.max(...rates)).toBeGreaterThan(0.85);
    // A proportion is at its noisiest near a half; the demo must include one.
    expect(rates.some((r) => Math.abs(r - 0.5) < 0.06)).toBe(true);
  });

  it("recovers every rate, which is what the page claims", () => {
    const rows = demoRecovery();
    expect(rows.length).toBe(FUNNEL_SPEC.length);
    for (const row of rows) {
      expect(row.usable, `${row.event} lost its denominator`).toBe(DEMO_REPLICATIONS);
      expect(
        Math.abs(row.biasPoints),
        `${row.event} recovered ${row.estimated.toFixed(4)} against a truth of ${row.truth}`,
      ).toBeLessThan(0.5);
    }
  });

  /**
   * The claim in the page's last paragraph, and the one worth failing over: an
   * interval that does not cover the truth at its stated rate is decoration.
   */
  it("covers the truth about as often as ninety-five per cent claims", () => {
    for (const row of demoRecovery()) {
      expect(row.coverage, `${row.event} covered ${(row.coverage * 100).toFixed(1)}%`).toBeGreaterThan(0.88);
      expect(row.coverage, `${row.event} covered ${(row.coverage * 100).toFixed(1)}%`).toBeLessThan(0.99);
    }
  });

  /**
   * THE DEMONSTRATION MUST INCLUDE A THIN STEP, AND THIS WAS FOUND BY READING
   * THE RENDERED PAGE (E19/S18).
   *
   * The unit tests exercised four steps; the page renders all eight, because
   * the demo is bound to the published specification. Down eight steps the
   * denominator falls from thousands to low hundreds, and interval coverage
   * slips from 95 to about 92 — which the page's copy originally did not admit,
   * claiming a flat ninety-five.
   *
   * That slip is the most useful thing in the table: it is the arithmetic
   * reason the panel is not built, happening in front of the reader. So it is
   * pinned. A demonstration whose every step had thousands of observations
   * would be a demonstration of the easy case.
   */
  it("runs deep enough that the last step is thin, which is the point", () => {
    const counts = simulateFunnel(DEMO_STEPS, DEMO_ARRIVALS, DEMO_SEED);
    const last = counts[counts.length - 1];
    expect(last, "the funnel no longer reaches a thin step").toBeLessThan(DEMO_ARRIVALS / 10);
    expect(last, "the last step lost its denominator entirely").toBeGreaterThan(30);
  });

  it("states an arrivals count the page can print", () => {
    expect(DEMO_ARRIVALS).toBeGreaterThan(1000);
    expect(DEMO_REPLICATIONS).toBeGreaterThan(99);
  });
});
