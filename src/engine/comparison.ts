/**
 * HUME'S FIFTH CRITERION, FROM RATINGS ALREADY ON THE DEVICE (E16/S2, Track I).
 *
 * "By comparison alone do we fix the epithets of praise or blame." A judge with
 * narrow comparison compresses everything into one band and cannot assign
 * degrees; that is the criterion, and it is a performance fact about a sitting
 * rather than a claim about a person (D1, D2).
 *
 * PM RULING RT-H (b): BREADTH MEANS DEGREES USED. Not how much music someone
 * has heard — that needs an import and a taxonomy we would have to invent. It
 * is computed from the 0–10 blind ratings the Prestige Test already collects
 * and already stores, so this instrument adds no clip, no tap and no flow.
 *
 * ---------------------------------------------------------------------------
 * THE TWO NUMBERS, AND WHY THE SECOND ONE IS SHAPED THE WAY IT IS
 *
 * DEGREES USED counts the distinct rating values a person actually landed on,
 * out of the eleven the scale offers. Controls are INCLUDED: they are clips
 * that were heard and rated, and the question is how many degrees the listener
 * assigned, not how many the sway statistic scored.
 *
 * ORDER STABILITY counts pairs the listener ordered one way blind and the
 * other way labelled. The obvious version of that statistic would be worthless
 * here, because the labelled pass is exactly where a prestige label is pushing
 * ratings around — it would re-measure sway and call it instability. So a pair
 * is ELIGIBLE only when the labels offer no DIFFERENTIAL reason to reorder it:
 *
 *   - both items are controls (neither carries a label at all), or
 *   - both are scored items whose labels push the SAME way.
 *
 * A control against a scored item is excluded: one of them is being pushed and
 * the other is not, so a flip there has an obvious innocent explanation.
 *
 * THE APPROXIMATION IN THAT RULE, STATED RATHER THAN BURIED: two labels that
 * push the same way need not push equally hard. An acclaim blurb on one clip
 * may be more persuasive than an acclaim blurb on another, and this rule cannot
 * see that. It removes the first-order reason for a reversal, not every reason.
 *
 * AND A ONE-POINT FLIP IS NOT A CONTRADICTION. Ratings are coarse integers; a
 * 6-over-5 becoming 5-over-6 is wobble, and reporting it as a person
 * contradicting themselves would be the instrument over-reading its own
 * resolution. Only pairs the listener separated by at least ASSERTION_FLOOR
 * points blind are counted — pairs where they asserted an order rather than
 * merely produced one.
 *
 * TIES ARE COUNTED SEPARATELY AND ARE NOT REVERSALS. Someone who collapses two
 * clips onto the same value in the second pass has not reversed them, but has
 * not kept them apart either, and a statistic that silently folded ties into
 * "kept" would report a total collapse as perfect stability.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS MODULE MAY NEVER BE USED TO SAY (N3, and RT-H2's trap)
 *
 * Nothing here is a percentile, and nothing compares one person to another —
 * there is no cohort. Narrow degrees are NOT a verdict on someone's ear: if
 * the clips really are close in quality, a narrow spread is the correct answer,
 * and this instrument cannot tell those two cases apart. That limit belongs on
 * every surface that prints these numbers.
 */

import type { BiasItemSpec, BiasRatings } from "./bias";
import { BIAS_SCALE_MAX, BIAS_SCALE_MIN } from "./bias";
import type { MetricSpec } from "./metricMeta";

/** Degrees the rating scale offers, derived from the bounds it validates. */
export const DEGREES_AVAILABLE = BIAS_SCALE_MAX - BIAS_SCALE_MIN + 1;

/**
 * Points of blind separation below which a pair is treated as un-asserted.
 *
 * PROVISIONAL (N3): chosen by judgment, not from data — nobody has measured
 * this instrument's rating wobble because nobody has sat it twice. Two points
 * is the smallest gap that cannot be produced by a single step of hesitation on
 * an eleven-point scale. Revisit when there are real second sittings.
 */
export const ASSERTION_FLOOR = 2;

export interface ComparisonPairCounts {
  /** Pairs whose labels offer no differential reason to reorder them. */
  eligible: number;
  /** Of those, the pairs separated by at least ASSERTION_FLOOR points blind. */
  asserted: number;
  /** Asserted pairs still in the same strict order after the labelled pass. */
  kept: number;
  /** Asserted pairs that became equal. Not a reversal; not a keep. */
  tied: number;
  /** Asserted pairs whose strict order flipped. */
  reversed: number;
}

export interface ComparisonResult {
  /** Every clip rated, controls included. */
  itemCount: number;
  degreesAvailable: number;
  /** Distinct blind rating values used. */
  degreesUsed: number;
  lowestUsed: number;
  highestUsed: number;
  /** highestUsed − lowestUsed, in points. */
  span: number;
  pairs: ComparisonPairCounts;
  /**
   * reversed / asserted. NULL when nothing was asserted — which is the ordinary
   * outcome for a very compressed rater, and is a refusal rather than a zero.
   * Reporting 0% stability for someone who never separated anything would
   * describe the scale, not the listener.
   */
  reversedShare: number | null;
}

function assertRating(pass: string, id: string, value: number | undefined): asserts value is number {
  if (value === undefined) throw new Error(`comparison: missing ${pass} rating for "${id}"`);
  if (!Number.isInteger(value) || value < BIAS_SCALE_MIN || value > BIAS_SCALE_MAX) {
    throw new Error(
      `comparison: ${pass} rating for "${id}" must be an integer in [${BIAS_SCALE_MIN},${BIAS_SCALE_MAX}], got ${value}`,
    );
  }
}

/**
 * True when the labels give no differential reason for THIS pair to reorder.
 * Exported so a test can exercise the rule directly rather than inferring it
 * from a count, and so the reason lives in one place.
 */
export function pairIsEligible(a: BiasItemSpec, b: BiasItemSpec): boolean {
  if (a.isControl && b.isControl) return true;
  if (a.isControl || b.isControl) return false;
  return a.labelDirection === b.labelDirection;
}

/** Sign of a difference, as -1, 0 or 1. */
function order(x: number, y: number): number {
  return x === y ? 0 : x > y ? 1 : -1;
}

/**
 * The instrument. Throws on malformed input, exactly as `computeBiasResult`
 * does: a bad rating reaching here is a bug upstream, not a user error.
 */
export function computeComparisonResult(
  items: BiasItemSpec[],
  blind: BiasRatings,
  labeled: BiasRatings,
): ComparisonResult {
  if (items.length === 0) throw new Error("comparison: item list is empty");
  const ids = new Set(items.map((i) => i.id));
  if (ids.size !== items.length) throw new Error("comparison: duplicate item ids");
  for (const item of items) {
    assertRating("blind", item.id, blind[item.id]);
    assertRating("labeled", item.id, labeled[item.id]);
  }

  const blindValues = items.map((i) => blind[i.id]);
  const used = new Set(blindValues);

  const counts: ComparisonPairCounts = { eligible: 0, asserted: 0, kept: 0, tied: 0, reversed: 0 };
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (!pairIsEligible(items[i], items[j])) continue;
      counts.eligible++;

      const bi = blind[items[i].id];
      const bj = blind[items[j].id];
      if (Math.abs(bi - bj) < ASSERTION_FLOOR) continue;
      counts.asserted++;

      const after = order(labeled[items[i].id], labeled[items[j].id]);
      if (after === 0) counts.tied++;
      else if (after === order(bi, bj)) counts.kept++;
      else counts.reversed++;
    }
  }

  return {
    itemCount: items.length,
    degreesAvailable: DEGREES_AVAILABLE,
    degreesUsed: used.size,
    lowestUsed: Math.min(...blindValues),
    highestUsed: Math.max(...blindValues),
    span: Math.max(...blindValues) - Math.min(...blindValues),
    pairs: counts,
    reversedShare: counts.asserted > 0 ? counts.reversed / counts.asserted : null,
  };
}

/**
 * The metrics this module computes (RT-9c). Declared here so the formula and
 * the sentence describing it change together.
 */
export const COMPARISON_METRICS: MetricSpec[] = [
  {
    id: "degrees_used",
    label: "Degrees used",
    definition:
      "How many distinct points of the rating scale a listener actually landed on during the blind pass — Hume's comparison criterion, which holds that degrees of praise can only be assigned by someone who has weighed works against each other.",
    formula: "degreesUsed = |{ blind rating : every clip rated, controls included }|",
    unit: "count",
    owner: "instrument",
    target: null,
    caveat:
      "Bounded by the number of clips as well as by the scale, and a narrow spread may simply be the correct answer if the clips really are close in quality. The instrument cannot tell those two cases apart.",
  },
  {
    id: "rating_span",
    label: "Rating span",
    definition:
      "The distance between the highest and lowest blind rating, in points of the rating scale.",
    formula: "span = max(blind) − min(blind)",
    unit: "points",
    owner: "instrument",
    target: null,
  },
  {
    id: "order_reversals",
    label: "Order reversals",
    definition:
      "Pairs of clips a listener ordered one way blind and the opposite way on the labelled pass, counted only where the shown labels push both clips the same direction and so offer no differential reason to change one's mind.",
    formula:
      "reversed / asserted, over pairs with equal label direction (or both controls) separated by at least the assertion floor blind",
    unit: "proportion",
    owner: "instrument",
    target: null,
    caveat:
      "Two labels pushing the same way need not push equally hard, so this removes the first-order reason for a reversal rather than every reason. Null when no pair was separated far enough to count.",
  },
];
