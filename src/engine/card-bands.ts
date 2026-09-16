/**
 * HOW FINELY A LADDER CAN SAY SOMEBODY DISCRIMINATES (E21/T-S1, Track T).
 *
 * THE CARD'S ONE NON-GENERIC CLAIM is *how finely you discriminate on this
 * axis* — which tags are worth spending and which are wasted. Every prompt
 * guide in the world can list descriptors; none of them can say that. But the
 * claim is a COMPARISON: "finely" only means anything against "less finely",
 * and a boundary between them is a distinction the instrument has to be able to
 * make. A band narrower than the session's own noise is a fact about the
 * random number generator.
 *
 * SO THE NUMBER CAME FIRST. `src/analytics/card-bands.test.ts` simulates
 * listeners across each shipped ladder and measures, for each candidate number
 * of bands, two things: whether the band a session REPORTS is the band the
 * listener is actually in, and whether two sittings by the same listener land
 * in the same band. `CARD_BANDS` below is the largest band count that clears
 * both bars, and that test recomputes it on every run and fails if this file
 * disagrees. The numbers are in `docs/analytics/e21-card-bands.txt`.
 *
 * ONE BAND IS A PERMITTED ANSWER, and the card has to be built for it. A ladder
 * that supports one band cannot support any fineness claim at all: the card
 * prints the threshold and says nothing about how fine it is. That is not a
 * failure of the instrument — it is the honest reading of a short sitting, and
 * the alternative is a flattering sentence the session cannot support (N3).
 *
 * ALL FIGURES SIMULATED. There are zero real responses.
 */
import { ladderLevels } from "./staircase-manifest";

/**
 * The bar both agreement rates must clear, pre-registered before the
 * measurement was run.
 *
 * WHY 80% AND NOT HIGHER. The card makes a per-axis claim a reader will act on
 * once — which tags to spend. At 80% agreement, four readers in five are told
 * something their own repeat sitting would confirm. Below that the claim is
 * closer to a coin than a measurement; far above it, every ladder collapses to
 * one band and the card can say nothing at all. It is a product bar, stated
 * here so that moving it is a visible act rather than a tuning knob.
 */
export const CARD_BAND_AGREEMENT_FLOOR = 0.8;

/** Band counts considered. Above five, a band is narrower than a ladder rung. */
export const CARD_BAND_CANDIDATES = [1, 2, 3, 4, 5] as const;

/**
 * THE MEASURED RESULT, per family: how many resolution bands the shipped
 * ladders support. Derived, not chosen — `card-bands.test.ts` fails if these
 * do not match what it measures.
 *
 * The lossy family runs on two source ladders with different ranges, and takes
 * the SMALLER of their band counts. A claim that holds on one source and not
 * the other is a claim the reader cannot be told which half they got.
 */
export const CARD_BANDS: Record<string, number> = {
  "pitch-drift": 2,
  "timing-smear": 2,
  /*
   * ONE. The compression ladder supports no fineness claim at all, and this is
   * the entry most likely to be "corrected" by somebody who assumes it is a
   * placeholder. It is not: `pb1` produces a point estimate for a small share
   * of listeners drawn across its range, so the sittings where two visits BOTH
   * produce one are too few to establish that a two-band claim would hold.
   * The card therefore prints a compression threshold and says nothing about
   * how finely it was heard.
   */
  "lossy-artifact": 1,
};

/** Human names for the bands, by band count. Index 0 is the FINEST. */
const BAND_NAMES: Record<number, readonly string[]> = {
  1: ["measured"],
  2: ["fine", "coarse"],
  3: ["fine", "moderate", "coarse"],
  4: ["fine", "moderately fine", "moderately coarse", "coarse"],
  5: ["very fine", "fine", "moderate", "coarse", "very coarse"],
};

export interface Band {
  /** 0 is the finest band. */
  index: number;
  /** How many bands this ladder supports. */
  of: number;
  /** "fine", "coarse", … or "measured" when the ladder supports only one. */
  name: string;
}

/**
 * The band a threshold falls in, on the ladder it was measured on.
 *
 * LOG SCALE, because every ladder here is geometric — one step is a constant
 * ratio — and equal bands in raw magnitude would put nine of eleven pitch rungs
 * in the bottom band.
 *
 * Returns `null` when the family has no ladder, rather than guessing: a caller
 * with a threshold for a family this product does not measure has a bug, and a
 * fabricated band would hide it.
 */
export function bandFor(family: string, sourceId: string | undefined, value: number): Band | null {
  const of = CARD_BANDS[family];
  if (!of) return null;
  let levels: number[];
  try {
    levels = ladderLevels(family, sourceId);
  } catch {
    return null;
  }
  if (levels.length < 2 || !Number.isFinite(value) || value <= 0) return null;
  const lo = Math.min(...levels);
  const hi = Math.max(...levels);
  const span = Math.log(hi) - Math.log(lo);
  if (span <= 0) return null;
  const t = (Math.log(value) - Math.log(lo)) / span;
  /*
   * CLAMPED, because `fitThreshold` may return a point estimate slightly
   * outside the rung range — the posterior is continuous and the ladder is not.
   * Clamping is right here and would be wrong in the fit: a threshold half a
   * step past the floor is genuinely at the floor for the purpose of saying how
   * finely somebody hears, and is genuinely NOT a measured rung for the purpose
   * of printing a number.
   */
  const index = Math.min(of - 1, Math.max(0, Math.floor(t * of)));
  return { index, of, name: BAND_NAMES[of][index] };
}
