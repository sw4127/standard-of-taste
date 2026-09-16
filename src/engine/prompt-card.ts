/**
 * THE PROMPT CARD'S STRUCTURE, COMPUTED (E21/T-S2, Track T).
 *
 * WHAT THIS IS FOR. The product ends in a threshold in cents. That number is
 * EVIDENCE, and it has been standing in the position of the deliverable, which
 * is why a technically sound instrument is neither enjoyable to use nor
 * convincing to look at (MRD §4). The deliverable is a short readable card in
 * the vocabulary a text-to-music generator accepts. This module decides what
 * the card may SAY; `src/content/card/` decides how it is worded.
 *
 * THE MODEL IS NOWHERE IN THIS PATH, and that is the only reason anyone should
 * believe the card. Thresholds in, structure out, deterministically. If the
 * card is ever generated prose the product has lost its case.
 *
 * THREE RULES ARE STRUCTURAL HERE RATHER THAN EDITORIAL, because a rule that
 * lives in the wording is a rule one rewrite away from being gone:
 *
 *   1. ONLY WHAT WAS MEASURED APPEARS (PM ruling RT-Z12 (a), 2026-09-16). A
 *      sitting on one ladder produces a card about one axis, and the other two
 *      are ABSENT — not greyed out, not "not yet". Three axes with two blank is
 *      a completion meter, and the anti-clone clause refuses those by name; it
 *      is the shape the Taste Gem was killed for. Absence is the caller's to
 *      express by not passing a result.
 *   2. NO FINENESS CLAIM THE LADDER CANNOT SUPPORT. `CARD_BANDS` is measured,
 *      not chosen (`card-bands.test.ts`), and a family with one band gets a
 *      threshold and no comparison. The compression ladder is one band today.
 *   3. EVERY CLAIM NEEDS EVIDENCE IN THE SESSION. A spend/skip recommendation
 *      requires that the session actually resolved something — `band.heardAt`
 *      or `band.missedAt` present. An outcome kind alone is not enough: the
 *      estimator's job is to say what responses imply, and on a handful of
 *      answers "probably insensitive" is a legitimate thing for it to imply and
 *      an illegitimate thing for a card to tell somebody about themselves.
 */
import { bandFor, type Band } from "./card-bands";
import type { StaircaseResult } from "./staircase-session";

/**
 * What the card may say about one axis.
 *
 * `not-enough` is the default and the others have to be earned. That ordering
 * is deliberate: the failure this product is most exposed to is a flattering
 * sentence a session cannot support (N3), and a union whose fallback is a claim
 * makes that failure the cheap path.
 */
export type AxisState =
  /** A threshold, in the finest band the ladder supports. */
  | "fine"
  /** A threshold, in a coarser band. Only possible where CARD_BANDS > 1. */
  | "coarse"
  /** A threshold, on a ladder that supports no fineness comparison at all. */
  | "measured"
  /** Heard even the gentlest rung — finer than this instrument can show. */
  | "finer-than-measured"
  /** Missed even the harshest rung — outside what this instrument can show. */
  | "coarser-than-measured"
  /** The session could not say. The card says exactly that. */
  | "not-enough";

export interface CardAxis {
  family: string;
  /** Named for lossy: a threshold there is a fact about the material too (N3). */
  sourceId?: string;
  unit: string;
  state: AxisState;
  /** The threshold in the family's unit, when there is one. */
  threshold: number | null;
  /** The resolution band, when the ladder supports a comparison. */
  band: Band | null;
  /**
   * Whether descriptors on this axis are worth spending.
   *
   * `null` MEANS NO CLAIM, and is not the same as `false`. A one-band ladder
   * and a session that could not say both land here, and neither licenses
   * "do not bother with tuning tags" — which is advice, given wrongly, about
   * something the instrument never measured.
   */
  spend: boolean | null;
}

export interface PromptCard {
  /** In the order the caller passed them. Only measured families (rule 1). */
  axes: CardAxis[];
  /** True when at least one axis carries a threshold a reader could act on. */
  anyClaim: boolean;
}

/**
 * Did this session resolve anything at all?
 *
 * The band carries per-rung evidence on EVERY outcome kind, including the ones
 * the fitter refused to score — that is what it is for. So this asks the band,
 * not the kind.
 */
function hasEvidence(result: StaircaseResult): boolean {
  return result.band.heardAt !== null || result.band.missedAt !== null;
}

function axisFrom(result: StaircaseResult): CardAxis {
  const base = {
    family: result.family,
    sourceId: result.sourceId,
    unit: result.unit,
    threshold: null as number | null,
    band: null as Band | null,
    spend: null as boolean | null,
  };

  if (!hasEvidence(result)) return { ...base, state: "not-enough" };

  switch (result.kind) {
    case "threshold": {
      const band = bandFor(result.family, result.sourceId, result.label);
      if (band === null) return { ...base, state: "not-enough" };
      if (band.of === 1) {
        /*
         * A LADDER WITH ONE BAND HAS A THRESHOLD AND NO COMPARISON. The number
         * is real and is printed; "finely" and "less finely" are not available
         * on it, so `spend` stays null rather than defaulting either way.
         */
        return { ...base, state: "measured", threshold: result.label, band, spend: null };
      }
      const fine = band.index === 0;
      return {
        ...base,
        state: fine ? "fine" : "coarse",
        threshold: result.label,
        band,
        spend: fine,
      };
    }
    case "below":
      /*
       * They caught the gentlest manipulation this instrument can render. There
       * is no number — that is what `below` means — but there IS a demonstrated
       * performance, and refusing to mention it would be its own kind of
       * dishonesty. The card says what was done, never a threshold.
       */
      return { ...base, state: "finer-than-measured", spend: true };
    case "above":
      return { ...base, state: "coarser-than-measured", spend: false };
    default:
      return { ...base, state: "not-enough" };
  }
}

/**
 * The card, from whatever this device has actually measured.
 *
 * DUPLICATE FAMILIES COLLAPSE TO THE LAST ONE PASSED. A person can sit the
 * compression ladder on two different sources, and a card with two compression
 * rows would be describing the material rather than the ear.
 */
export function promptCard(results: readonly StaircaseResult[]): PromptCard {
  const byFamily = new Map<string, CardAxis>();
  for (const r of results) byFamily.set(r.family, axisFrom(r));
  const axes = [...byFamily.values()];
  return {
    axes,
    anyClaim: axes.some((a) => a.state !== "not-enough"),
  };
}
