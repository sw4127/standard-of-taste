/**
 * THE COMPANY VIEW'S NUMBERS: EVERY ONE A PLANNING ASSUMPTION, OR DERIVED FROM ONE
 * (blueprint Part 6; BP-GOAL, BP-BUSINESS; N3).
 *
 * BP-GOAL asks that a reviewer see why a real company would fund the reading
 * and how it would test that. A test plan needs numbers before any data
 * exists, and a number that looks like a result is exactly what N3 forbids. So
 * every input here is declared once, labelled a PLANNING ASSUMPTION, and given
 * its reason; everything else on the page is computed from them, with the
 * formula shown. `company.test.ts` reads the rendered page and fails on any
 * number that is neither.
 *
 * NOTHING HERE WAS MEASURED. The host is fictional (BA-9), and so is its
 * traffic.
 */
import { Z_95 } from "@/analytics/funnel";

/** z for 80% power, one-sided (the standard normal's 0.80 quantile). */
export const Z_POWER_80 = 0.841621;

export interface Assumption {
  id: string;
  label: string;
  value: number;
  /** How the value is written on the page. */
  shown: string;
  reason: string;
}

export const BASELINE: Assumption = {
  id: "baseline",
  label: "Creation starts per visitor at the creation entry, with the plain prompt box",
  value: 0.2,
  shown: "20%",
  reason:
    "We found no published rate, so nothing measured stands behind it. It is a round number chosen to make the arithmetic visible, and the sample size is shown for two others beside it.",
};

export const MIN_LIFT: Assumption = {
  id: "min-lift",
  label: "The smallest lift worth detecting",
  value: 0.02,
  shown: "2 percentage points",
  reason:
    "The reading adds screens before creation, and screens cost attention and maintenance. The assumption is that a lift smaller than a tenth of the baseline would not pay for them, so the test is sized to see one that size and not smaller.",
};

export const ALPHA: Assumption = {
  id: "alpha",
  label: "False-positive rate, two-sided",
  value: 0.05,
  shown: "5%",
  reason: "Convention, kept because a reviewer can check it at a glance; nothing about this feature argues for another.",
};

export const POWER: Assumption = {
  id: "power",
  label: "Power",
  value: 0.8,
  shown: "80%",
  reason: "Convention: a one-in-five chance of missing a real lift of the minimum size is the usual trade against run length.",
};

export const ASSUMPTIONS: readonly Assumption[] = [BASELINE, MIN_LIFT, ALPHA, POWER];

/** Other baselines the sample size is shown for, so no single guess carries the plan. */
export const OTHER_BASELINES: readonly number[] = [0.1, 0.3];

/**
 * Visitors per arm to detect a lift of `lift` over `p1`, two-sided alpha 0.05 at
 * 80% power: n = (z_a * sqrt(2 p(1-p)) + z_b * sqrt(p1(1-p1) + p2(1-p2)))^2 / lift^2,
 * where p is the mean of the two rates.
 */
export function perArm(p1: number, lift: number): number {
  const p2 = p1 + lift;
  const pBar = (p1 + p2) / 2;
  const a = Z_95 * Math.sqrt(2 * pBar * (1 - pBar));
  const b = Z_POWER_80 * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2));
  return Math.ceil(((a + b) * (a + b)) / (lift * lift));
}

export const FORMULA =
  "n per arm = (z₁₋α/₂ · √(2·p̄(1−p̄)) + z₁₋β · √(p₁(1−p₁) + p₂(1−p₂)))² ÷ (p₂ − p₁)²";

/** The planned test, derived. */
export const PLAN = {
  perArm: perArm(BASELINE.value, MIN_LIFT.value),
  others: OTHER_BASELINES.map((p) => ({ baseline: p, perArm: perArm(p, MIN_LIFT.value) })),
};

/** Grouped thousands, as the page prints them. */
export const fmt = (n: number) => n.toLocaleString("en-US");
export const pctText = (p: number) => `${Math.round(p * 100)}%`;
