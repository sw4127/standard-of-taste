/**
 * THE FUNNEL PANEL, SPECIFIED RATHER THAN DRAWN (E15/S3).
 *
 * WHY THIS EXISTS. PM ruling RT-J offered two options — ship an empty funnel
 * panel, or say plainly that it waits on traffic. He rejected the second as a
 * poor demonstration: he wants the Lab to show the work without him having to
 * explain it, and "we have no data" shows nothing. Both options were wrong in
 * the same way. An empty chart claims data exists; an apology claims nothing
 * exists to say.
 *
 * There is a third thing, and it is the ordinary product of this job: the
 * SPECIFICATION. What the steps are, where each one's number would come from,
 * and how much traffic it would take before any of them could be published as a
 * rate. None of that needs a single respondent, all of it is checkable, and it
 * is the part a reader of this page is actually assessing.
 *
 * IT IS NOT THE PANEL. Nothing here renders a rate, a count, or a chart. J3
 * stays unbuilt (blueprint §2, Track J), and this is the reason it is unbuilt,
 * written as work instead of as an excuse.
 *
 * THE STEPS CARRY EVENT NAMES, NOT DESCRIPTIONS. Each step names an event and
 * the page prints what `KNOWN_EVENTS` says fires it. A specification that
 * described its own steps would be a second copy of the event dictionary, free
 * to drift from the one the code emits — and `docs/ANALYTICS.md` already did
 * exactly that once, documenting 23 of 42 events while reading as complete.
 * Every name below is resolved at module load, so deleting an event breaks the
 * build rather than leaving a step that measures nothing.
 */

import { KNOWN_EVENTS } from "@/lib/events";

export interface FunnelStep {
  /** The event this step is counted from. Must exist in `KNOWN_EVENTS`. */
  event: string;
  /** What the step means to a reader, in the product's own terms. */
  label: string;
  /**
   * WHY THIS STEP IS NOT A CLEAN DENOMINATOR (PM ruling RT-J5 b).
   *
   * A funnel is drawn as a descent, which asserts that everyone at step k
   * passed through step k−1. That is false for the first step here — a shared
   * link opens the instrument directly — so the ratio could exceed 100% and a
   * reader would be looking at a chart that lies about its own shape.
   *
   * The ruled fix keeps the step, because the homepage-to-instrument drop is
   * a real thing worth having, and states the limit beside it. That is the
   * job of this page rather than a blemish on it.
   */
  caveat?: string;
}

/**
 * The Prestige Test, entry to share. The flagship instrument (memo D3), and the
 * only path through the product that has all of its events already emitting.
 */
export const FUNNEL_SPEC: FunnelStep[] = [
  {
    event: "landing_view",
    label: "Arrives",
    caveat:
      "Not a denominator. A shared link opens the instrument directly, so someone can reach the " +
      "next step without ever passing through this one — which means this ratio can exceed one. " +
      "The descent proper begins below it.",
  },
  { event: "bias_frame_view", label: "Reaches the instrument" },
  { event: "bias_start", label: "Begins rating" },
  { event: "bias_blind_complete", label: "Finishes the blind pass" },
  { event: "bias_labeled_complete", label: "Finishes the labelled pass" },
  { event: "bias_result", label: "Gets a verdict" },
  { event: "bias_debrief_view", label: "Reads the debrief" },
  { event: "bias_share", label: "Shares it" },
];

/**
 * `z` for a two-sided 95% interval. Written to seven places rather than as
 * 1.96, because the sample sizes below are quoted as exact integers and a
 * two-digit constant would put them a unit off the textbook figures for no
 * reason a reader could see.
 */
const Z_95 = 1.959964;

/**
 * HOW MANY OBSERVATIONS ONE STEP'S RATE NEEDS before it can be published.
 *
 * The normal-approximation interval for a proportion, at the WORST CASE p =
 * 0.5, where a rate's variance is largest — so the answer holds whatever the
 * real rate turns out to be, which matters when nobody knows what it is:
 *
 *     n = z^2 * p(1-p) / h^2 ,  p = 0.5
 *
 * `halfWidthPts` is the plus-or-minus, in percentage points. Rounded UP, since
 * a fractional respondent does not exist and rounding down would publish an
 * interval slightly wider than the one advertised.
 *
 * THIS IS A PRECISION QUESTION, NOT A POWER QUESTION, and that is deliberate.
 * Power asks how big a difference between two arms could be detected; there are
 * no arms, and there is no experiment. What actually gates this panel is
 * cruder: a rate nobody can estimate cannot be printed at all.
 */
export function sessionsForPrecision(halfWidthPts: number): number {
  if (!(halfWidthPts > 0) || halfWidthPts >= 100) {
    throw new Error(`funnel-spec: half-width must be in (0, 100) points, got ${halfWidthPts}`);
  }
  const h = halfWidthPts / 100;
  return Math.ceil((Z_95 * Z_95 * 0.25) / (h * h));
}

/**
 * Fails the build if a step names an event nothing emits — see the docblock.
 * A funnel step measuring an event that no longer fires is not a smaller
 * funnel; it is a zero that looks like a finding.
 */
for (const step of FUNNEL_SPEC) {
  if (!(step.event in KNOWN_EVENTS)) {
    throw new Error(`funnel-spec: step "${step.label}" names unknown event "${step.event}"`);
  }
}

/** What the event registry says fires this step. Never re-described here. */
export function stepTrigger(step: FunnelStep): string {
  return KNOWN_EVENTS[step.event];
}
