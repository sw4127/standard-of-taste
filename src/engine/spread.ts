/**
 * TRACK N — DO YOUR GAPS VARY WHERE A CRITIC'S RANKINGS VARY? (E17/S3)
 *
 * A published critic ranked twenty-one works against each other. This
 * instrument plays some of them and asks a listener to rate what they hear,
 * then reports two numbers: how far apart their ratings fell across pairs the
 * critic placed FAR apart, and how far apart they fell across pairs the critic
 * bracketed CLOSE together.
 *
 * ---------------------------------------------------------------------------
 * AGREEMENT WITH THE CRITIC IS NEVER SCORED, AND HERE IS WHY THAT IS STRUCTURAL
 *
 * Nobody is ever wrong for preferring the work the critic placed lower. That is
 * not a policy this module follows; it is a fact about what this module can
 * see. Every input it takes from the ranking is |Δposition| — a distance — and
 * a distance cannot say which of two works the critic ranked higher. There is
 * no expression in this file that could be rearranged into an agreement score,
 * because the sign was never imported.
 *
 * That matters more than a comment can carry. An agreement score would make
 * this a test of whether your taste matches a critic's, which is a ranking of
 * people against an authority and exactly what the product refuses (D1, N3).
 * The question here is only whether a listener DISCRIMINATES — whether their
 * ratings move at all where a professional's judgment moved.
 *
 * ---------------------------------------------------------------------------
 * TWO NUMBERS, NOT THEIR DIFFERENCE (PM ruling RT-N2 a)
 *
 * The obvious headline is farSpread − closeSpread, and it is not reported.
 * With four pairs against four pairs and nobody having ever sat this
 * instrument, there is no measured wobble to say how much of a difference is
 * real. Printing one number invites a reader to treat its size as meaningful;
 * printing two invites the comparison without asserting that the gap between
 * them is anything. **This module does not export the difference**, and a test
 * asserts no field of the result is it — because the first thing a later caller
 * would otherwise do is subtract.
 *
 * ---------------------------------------------------------------------------
 * THE NULL MODEL, AND IT IS THE WHOLE READING
 *
 * Someone rating at random produces the SAME expected spread on both kinds of
 * pair, because chance does not know which works a critic separated. So the
 * reference point is not zero and it is not the ceiling — it is
 * `spreadIfIndifferent` on both numbers at once. A reader whose two figures sit
 * together near it has not discriminated; a reader whose far figure sits above
 * their close figure has. Without that anchor, "3.4 and 2.9" means nothing.
 *
 * It is arithmetic, not a norm: no cohort, no percentile, nobody's data (N3).
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS MODULE MAY NEVER BE USED TO SAY
 *
 * A flat pair of numbers is NOT a verdict on someone's ear. The critic's
 * ranking is one writer's opinion, the clips are forty-second excerpts of works
 * up to forty minutes long, and the recordings differ in brightness for reasons
 * no ranking caused. A listener who does not discriminate here may be hearing
 * the excerpts accurately and declining to agree. The instrument cannot tell
 * those cases apart, and the surface must say so.
 */

import type { MetricSpec } from "@/content/lab/metrics";
import { BIAS_SCALE_MAX, BIAS_SCALE_MIN } from "./bias";
import {
  MIN_PAIRS_PER_KIND,
  SPREAD_POOL,
  spreadPairs,
  type SpreadItem,
} from "@/content/spread/ranking";

/** Points on the rating scale — the same eleven every instrument here uses. */
export const SPREAD_DEGREES = BIAS_SCALE_MAX - BIAS_SCALE_MIN + 1;

/** clipId -> integer rating in [BIAS_SCALE_MIN, BIAS_SCALE_MAX]. */
export type SpreadRatings = Record<string, number>;

/**
 * Mean |difference| between two independent uniform ratings on a D-point
 * scale: (D² − 1) / (3D). At eleven points that is about 3.64.
 *
 * This is what BOTH numbers come out at when a listener is not discriminating,
 * which is why it anchors the reading rather than decorating it. Cross-checked
 * against a Monte Carlo draw in the tests rather than trusted as algebra.
 */
export function spreadIfIndifferent(degrees: number = SPREAD_DEGREES): number {
  return (degrees * degrees - 1) / (3 * degrees);
}

/** Why a reading could not be produced. Never a zero dressed as an answer. */
export type SpreadRefusal =
  | "too-few-far-pairs"
  | "too-few-close-pairs"
  | "too-few-rated-clips";

export interface SpreadPairStat {
  /** Pairs of this kind that survived the recognition filter. */
  count: number;
  /** Mean |rating difference| across them. Null when count is 0. */
  meanGap: number | null;
}

export interface SpreadResult {
  /** Clips rated and kept — recognised ones are excluded before anything. */
  usedClipIds: string[];
  /**
   * Clips the listener said they had heard before. SELF-REPORT, and a FILTER
   * rather than a measurement: it only ever removes evidence (RT-N1 a). It is
   * never scored, never reported as a number about the listener, and the
   * surface discloses that the product simply took their word for it.
   */
  excludedClipIds: string[];
  far: SpreadPairStat;
  close: SpreadPairStat;
  /** The chance baseline both numbers are read against. */
  spreadIfIndifferent: number;
  /**
   * Null when a reading was produced. Otherwise the reason, so the surface can
   * say what happened instead of printing a figure it cannot support.
   */
  refusal: SpreadRefusal | null;
}

function assertRating(id: string, value: number | undefined): asserts value is number {
  if (value === undefined) throw new Error(`spread: missing rating for "${id}"`);
  if (!Number.isInteger(value) || value < BIAS_SCALE_MIN || value > BIAS_SCALE_MAX) {
    throw new Error(
      `spread: rating for "${id}" must be an integer in [${BIAS_SCALE_MIN},${BIAS_SCALE_MAX}], got ${value}`,
    );
  }
}

const mean = (xs: number[]): number | null =>
  xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;

/**
 * The instrument. Throws on malformed input, exactly as the other engines do:
 * a bad rating reaching here is a bug upstream, not a user error.
 *
 * `recognised` is applied FIRST and removes the clip entirely, so every pair it
 * belonged to disappears. Excluding a rating rather than a clip would leave
 * half-pairs behind and quietly change what the two numbers are averaged over.
 */
export function computeSpreadResult(
  ratings: SpreadRatings,
  recognised: readonly string[] = [],
  pool: readonly SpreadItem[] = SPREAD_POOL,
): SpreadResult {
  const excluded = new Set(recognised);
  const kept = pool.filter((item) => !excluded.has(item.id));
  for (const item of kept) assertRating(item.id, ratings[item.id]);

  const usable = spreadPairs(kept);
  const gaps = (kind: "far" | "close") =>
    usable
      .filter((p) => p.kind === kind)
      .map((p) => Math.abs(ratings[p.a.id] - ratings[p.b.id]));

  const farGaps = gaps("far");
  const closeGaps = gaps("close");

  // Order matters only for which reason is reported first; all are refusals.
  let refusal: SpreadRefusal | null = null;
  if (kept.length < 2) refusal = "too-few-rated-clips";
  else if (farGaps.length < MIN_PAIRS_PER_KIND) refusal = "too-few-far-pairs";
  else if (closeGaps.length < MIN_PAIRS_PER_KIND) refusal = "too-few-close-pairs";

  /**
   * A REFUSED READING CARRIES NO PRINTABLE NUMBER, and this is deliberate
   * rather than tidy. The first version computed both means and set `refusal`
   * beside them, which left a real number sitting in `far.meanGap` averaged
   * over two pairs — and every surface would then be one forgotten `if` away
   * from printing a figure the engine had just declared unsupportable. Making
   * it structurally absent is the only version that does not depend on every
   * caller remembering. The COUNTS stay, because a surface has to be able to
   * say how much evidence was left (RT-N1 a).
   */
  const far: SpreadPairStat = {
    count: farGaps.length,
    meanGap: refusal ? null : mean(farGaps),
  };
  const close: SpreadPairStat = {
    count: closeGaps.length,
    meanGap: refusal ? null : mean(closeGaps),
  };

  return {
    usedClipIds: kept.map((i) => i.id),
    excludedClipIds: pool.filter((i) => excluded.has(i.id)).map((i) => i.id),
    far,
    close,
    spreadIfIndifferent: spreadIfIndifferent(),
    refusal,
  };
}

/**
 * The metrics this module computes. Declared here so the formula and the
 * sentence describing it change together.
 */
export const SPREAD_METRICS: MetricSpec[] = [
  {
    id: "spread_far_pairs",
    label: "Your spread across works the critic separated",
    definition:
      "The average distance between your two ratings, across pairs of works a published critic placed at least ten positions apart in his own ranking.",
    formula: "mean |rating(a) − rating(b)| over pairs with |Δposition| ≥ 10",
    unit: "points",
    owner: "instrument",
    target: null,
    caveat:
      "Read it beside the close-pairs figure and beside the indifferent-rater figure; alone it says nothing. It measures whether your ratings moved, never whether they moved the same way the critic's did — agreement is not scored and cannot be computed from what this instrument stores. Three further limits travel with it: a forty-second excerpt cannot carry a critic's verdict on a work up to forty minutes long, so the clip is longer than this product's others and that is a mitigation rather than a fix; clips the listener says they already knew are removed on their word alone, unverified; and the difference between the two figures is never reported, because four pairs against four drawn from clips that appear in several pairs each, with nobody having sat the instrument twice, leaves no measured wobble against which a difference could be called real.",
  },
  {
    id: "spread_close_pairs",
    label: "Your spread across works the critic bracketed together",
    definition:
      "The average distance between your two ratings, across pairs of works the same critic placed within three positions of each other.",
    formula: "mean |rating(a) − rating(b)| over pairs with |Δposition| ≤ 3",
    unit: "points",
    owner: "instrument",
    target: null,
    caveat:
      "The recordings in this pool differ in where their spectrum ends by 10,002 Hz, for reasons no ranking caused — one source is a 128 kbps mp3 that stops at 8,624 Hz. Measured, that difference is larger across these pairs (6,498 Hz mean) than across the separated ones (3,758 Hz), so the confound works against finding a difference rather than for it. It cannot be removed without destroying the recordings; its direction is guarded instead.",
  },
  {
    id: "spread_if_indifferent",
    label: "What an indifferent rater would produce",
    definition:
      "The average distance between two ratings chosen at random on this scale. Chance does not know which works a critic separated, so it produces this same figure on both kinds of pair — which is what makes it the reference point for both.",
    formula: "(D² − 1) / (3D) for a D-point scale",
    unit: "points",
    owner: "instrument",
    target: null,
    caveat:
      "Arithmetic, not a norm. It is what chance produces, not what anybody scored — there is no cohort and this is not a percentile.",
  },
];
