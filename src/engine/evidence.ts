/**
 * WHAT MAY BE SAID — the single place that decides whether there is enough
 * evidence for a claim, for every instrument (E8/S1, 2026-08-26).
 *
 * WHY THIS EXISTS AND WHY IT IS ONE FILE. The vocabulary layer turns measured
 * numbers into sentences, and a sentence is the point at which an instrument
 * stops hedging. Every surface that writes one needs the same question answered
 * — "is there enough here to say anything?" — and answering it separately in
 * each surface is the two-tables defect this repo has now hit three times. So
 * the floors live here, beside each other, where they can be compared and where
 * a new surface cannot quietly invent a laxer one.
 *
 * IT RETURNS A DECISION, NOT A STRING. No copy in this module: `ok: false`
 * carries a machine-readable `gap` naming what is missing, and the copy layer
 * (E8/S2 onward) decides how to say it. That keeps the floor testable without
 * rendering, and keeps the same floor behind every phrasing of the refusal.
 *
 * THE REFUSALS ARE THE PRODUCT HERE. `familyContrastClaim` never returns `ok`
 * at the shipped pool size, and that is a finding rather than a stub — see its
 * docblock for the measurement. A floor that only ever says yes is not a floor.
 */
import type { BiasResult } from "./bias";
import type { ComparisonResult } from "./comparison";
import type { DegradationFamily, DelicacyResult } from "./delicacy";
import { DEGRADATION_FAMILIES } from "./delicacy";
import type { StaircaseResult } from "./staircase-session";

/** Why a claim was refused. Machine-readable; the copy layer phrases it. */
export type EvidenceGap =
  /** The staircase resolved no rung either way — nothing in physical units. */
  | "no-rung-resolved"
  /** This family was never presented in the session being asked about. */
  | "family-not-measured"
  /** The session scored no trials at all. */
  | "no-scoreable-trials"
  /** Every item sat at the edge of the scale, so movement was impossible. */
  | "no-movable-items"
  /** The comparison needs more trials per family than the pool presents. */
  | "contrast-below-noise"
  /** The two instruments do not measure this family in the same quantity. */
  | "no-shared-axis"
  /* --- the retest arc (E14/S2, Track H). Same vocabulary on purpose: a new
     surface must not be able to invent a laxer refusal of its own. --- */
  /** Fewer than two comparable sessions on this device. */
  | "too-few-sessions"
  /** Two sessions that are not measuring the same thing — usually a lossy
      retest that landed on a different recording, which is the ORDINARY
      outcome there rather than an edge case. */
  | "different-material"
  /** No floor has been derived for this ladder, so no change may be called. */
  | "no-arc-floor"
  /** This instrument is too coarse to show change at the shipped length
      (delicacy, PM ruling RT-H2b a). */
  | "arc-instrument-unsupported"
  /* --- comparison, Hume's fifth criterion (E16/S3, Track I). --- */
  /** Fewer clips than the scale has degrees, so "n of eleven" would be false. */
  | "too-few-clips-for-degrees"
  /** Too few pairs were separated far enough for a share to mean anything. */
  | "too-few-asserted-pairs";

export type Claim<T> = { ok: true; value: T } | { ok: false; gap: EvidenceGap };

const refuse = (gap: EvidenceGap): Claim<never> => ({ ok: false, gap });

/* ------------------------------------------------------------------ *
 * The staircase
 * ------------------------------------------------------------------ */

export interface ThresholdSay {
  family: string;
  unit: string;
  sourceId?: string;
  trials: number;
  /** The gentlest rung reliably heard, in the family's unit. */
  heardAt: number | null;
  /** The harshest rung demonstrably missed. */
  missedAt: number | null;
  /**
   * The interpolated point estimate — `null` on most sessions BY DESIGN.
   * `fitThreshold` declines to interpolate on 68% of timing sessions and 91-95%
   * of lossy ones, and RT-90a(b) reports the band regardless rather than
   * selecting on having produced a narrow posterior. A sentence layer that
   * required this field would inherit exactly the selection bias that ruling
   * removed, so it is optional and the band is what is always there.
   */
  point: number | null;
  ci95: [number, number] | null;
  /**
   * Whether the band covers so much of the ladder that naming its edges as a
   * finding would overstate it. See `isWideBand`.
   */
  wide: boolean;
}

/**
 * HOW WIDE IS TOO WIDE — ONE RULE, USED BY EVERY LAYER THAT WRITES A SENTENCE.
 *
 * `bandLine` discovered this first: a band spanning most of the ladder is a
 * real result and a weak one, and rendering its edges as a plain statement
 * reads as a finding rather than as a shrug. The threshold was inline there,
 * and the creator-translation layer then wrote its own sentence off the same
 * band with no hedge at all — "Damage gentler than 100 cents slipped past you"
 * for a session that had bracketed seven rungs of eleven.
 *
 * Two layers phrasing the same band from two different notions of "wide" is the
 * two-tables defect. So the rule lives here, beside the other floors, and both
 * copy modules ask it rather than deciding for themselves.
 */
export const WIDE_BAND_FRACTION = 0.55;

export function isWideBand(band: {
  heardIndex: number | null;
  missedIndex: number | null;
  rungs: readonly unknown[];
}): boolean {
  if (band.heardIndex === null || band.missedIndex === null) return false;
  return band.heardIndex - band.missedIndex >= Math.ceil(band.rungs.length * WIDE_BAND_FRACTION);
}

/**
 * A staircase session may speak when it resolved at least one rung.
 *
 * The band is the floor, not the point estimate. A session that named neither a
 * rung heard nor a rung missed has located the listener nowhere on the ladder,
 * and every sentence writable from it would be about the instrument rather than
 * the ear.
 */
export function thresholdClaim(result: StaircaseResult): Claim<ThresholdSay> {
  const { heardAt, missedAt } = result.band;
  if (heardAt === null && missedAt === null) return refuse("no-rung-resolved");
  return {
    ok: true,
    value: {
      family: result.family,
      unit: result.unit,
      sourceId: result.sourceId,
      trials: result.trials,
      heardAt,
      missedAt,
      point: result.kind === "threshold" ? result.label : null,
      ci95: result.kind === "threshold" ? result.ci95 : null,
      wide: isWideBand(result.band),
    },
  };
}

/* ------------------------------------------------------------------ *
 * Delicacy
 * ------------------------------------------------------------------ */

export interface DelicacySay {
  nTrials: number;
  nCorrect: number;
  accuracy: number;
  /** null when no pick was correct — no data is not 0% (N3). */
  flawAccuracy: number | null;
  flawEligible: number;
  /**
   * The COUNT, carried rather than recoverable from `flawAccuracy * flawEligible`.
   * Copy needs the integer, and reconstructing it from a ratio is a
   * floating-point round trip that can land a whole answer off.
   */
  flawCorrect: number;
}

export function delicacyClaim(result: DelicacyResult): Claim<DelicacySay> {
  if (result.nTrials === 0) return refuse("no-scoreable-trials");
  const { nTrials, nCorrect, accuracy, flawAccuracy, flawEligible, flawCorrect } = result;
  return { ok: true, value: { nTrials, nCorrect, accuracy, flawAccuracy, flawEligible, flawCorrect } };
}

/**
 * A COUNT, and deliberately not a rate.
 *
 * Five trials support "you caught four of the five pitch pairs". They do not
 * support "you are 80% accurate on pitch", because the second invites
 * comparison against another family's percentage and the first does not. The
 * shape of this return value is the guardrail.
 */
export interface FamilySay {
  family: DegradationFamily;
  n: number;
  correct: number;
}

export function delicacyFamilyClaim(
  result: DelicacyResult,
  family: DegradationFamily,
): Claim<FamilySay> {
  const tally = result.byFamily[family];
  if (!tally || tally.n === 0) return refuse("family-not-measured");
  return { ok: true, value: { family, n: tally.n, correct: tally.correct } };
}

/**
 * HOW MANY TRIALS A FAMILY NEEDS BEFORE ONE MAY BE CALLED SHARPER THAN ANOTHER.
 *
 * MEASURED, not chosen (`evidence.test.ts` re-derives it). For each candidate
 * trial count: the smallest correct-count gap whose false-positive rate stays
 * under 5% against the WORST-CASE even ear — a listener with identical true
 * sensitivity on all three families, scanned over true rates 0.55 to 0.95 —
 * and then that rule's power against a genuinely uneven ear at 0.90/0.75/0.60.
 *
 *     n/family    safe gap    worst-case FP    power on .90/.75/.60
 *            5           5           0.55%                    0.7%
 *           15           7           4.25%                   20.9%
 *           30          10           3.46%                   46.1%
 *           40          11           4.75%                   68.1%
 *           60          14           3.45%                   85.3%
 *
 * The shipped pool presents FIVE scored trials per family (18 pairs, 3 of them
 * practice). At five, the only rule that is safe fires on a genuinely uneven
 * ear 0.7% of the time — one listener in 143 — so the feature would be silent
 * for very nearly everyone and would still be wrong for one in twenty of the
 * few it spoke to.
 *
 * 40 is the first count where the rule catches more listeners than it misses
 * (68.1%) while naming the right pair 93.1% of the time. Reaching it means 120
 * scored trials against the 15 that ship: an eight-fold longer session, which
 * is a product decision and not one this module may make quietly.
 *
 * WHAT THIS IS NOT. It is not a claim that people's ears are even. It is a
 * statement about what fifteen trials can resolve. The cross-instrument
 * replication check (`sharedAxisClaim`) is the honest comparison available at
 * the session lengths we actually run, because it compares a family to ITSELF.
 */
export const MIN_TRIALS_PER_FAMILY_FOR_CONTRAST = 40;

/**
 * The safe gap AT THE COUNTS THAT WERE ACTUALLY MEASURED, and nowhere else.
 *
 * A permission slip with no rule attached is a trap: a caller told "you may
 * compare now" will invent its own threshold, which is the two-tables defect
 * arriving by a different door. So the claim hands back the gap — and it is a
 * lookup rather than a formula, because the derivation is a simulation and I
 * have no closed form for it. A trial count absent from this table has not been
 * measured, so the comparison is refused there too. Extending the pool means
 * extending this table from a fresh derivation, not interpolating it.
 */
const DERIVED_SAFE_GAP: Readonly<Record<number, number>> = { 40: 11, 60: 14 };

/**
 * Whether this session may name a sharpest and a dullest family, and by how
 * much they must differ before it may.
 *
 * Written as a function of the observed trial counts rather than as a constant
 * `false`, so that growing the pool changes the answer and nothing else has to
 * be remembered. At the shipped pool it always refuses.
 */
export function familyContrastClaim(
  result: DelicacyResult,
): Claim<{ perFamily: number; requiredGap: number }> {
  const counts = DEGRADATION_FAMILIES.map((f) => result.byFamily[f]?.n ?? 0);
  const least = Math.min(...counts);
  if (least < MIN_TRIALS_PER_FAMILY_FOR_CONTRAST) return refuse("contrast-below-noise");
  const requiredGap = DERIVED_SAFE_GAP[least];
  if (requiredGap === undefined) return refuse("contrast-below-noise");
  return { ok: true, value: { perFamily: least, requiredGap } };
}

/* ------------------------------------------------------------------ *
 * Prestige
 * ------------------------------------------------------------------ */

export interface BiasSay {
  /** Drift-corrected signed shift toward the label, in % of the scale. */
  pct: number;
  /** Share of MOVABLE items that moved toward the label. */
  swayShare: number;
  movableCount: number;
  /** The numerator itself — see `movedCount` on BiasResult. */
  movedCount: number;
}

/**
 * A sway claim needs at least one item that COULD have moved.
 *
 * A listener who rated every clip at the top of the scale on the blind pass has
 * no headroom to move into, and reporting "0% swayed" would describe the scale
 * rather than the person.
 */
export function biasClaim(result: BiasResult): Claim<BiasSay> {
  if (result.movableCount === 0 || result.swayShare === null) return refuse("no-movable-items");
  return {
    ok: true,
    value: {
      pct: result.pct,
      swayShare: result.swayShare,
      movableCount: result.movableCount,
      movedCount: result.movedCount,
    },
  };
}

/* ------------------------------------------------------------------ *
 * Across instruments
 * ------------------------------------------------------------------ */

/**
 * THE FAMILIES BOTH INSTRUMENTS MEASURE IN THE SAME QUANTITY.
 *
 * Read off the shipped manifests, not assumed. Delicacy presents fixed rungs;
 * the staircase walks a ladder. For two families those are the same physical
 * quantity at the same values, so two independent sessions can be checked
 * against each other with no common scale, no cohort and no norms:
 *
 *     pitch-drift      delicacy 25 / 50 / 100 cents  = staircase levels 25, 50, 100
 *     lossy-artifact   delicacy 96 / 64 / 32 kbps    = staircase levels 96, 64, 32
 *
 * TIMING IS EXCLUDED, and the reason is not squeamishness. Delicacy's timing
 * rungs are a percentage of tempo deviation (`maxDevPct` 1.5 / 3 / 5); the
 * staircase's axis is milliseconds of drift IQR. Those are different
 * quantities, and the conversion between them depends on the clip's tempo and
 * on the shape of the drift trajectory. Until that conversion is measured, a
 * timing comparison would be a guess wearing a unit.
 */
export const SHARED_AXIS_FAMILIES: readonly DegradationFamily[] = ["pitch-drift", "lossy-artifact"];

export function sharedAxisClaim(family: DegradationFamily): Claim<{ family: DegradationFamily }> {
  if (!SHARED_AXIS_FAMILIES.includes(family)) return refuse("no-shared-axis");
  return { ok: true, value: { family } };
}

/* ------------------------------------------------------------------ *
 * Comparison — Hume's fifth criterion (E16/S3, Track I)
 * ------------------------------------------------------------------ */

export interface ComparisonDegreesSay {
  degreesUsed: number;
  degreesAvailable: number;
  /** What an indifferent rater would produce. The reference point (E16/S2). */
  degreesIfIndifferent: number;
  lowestUsed: number;
  highestUsed: number;
  span: number;
  itemCount: number;
}

/**
 * A degrees claim needs at least as many clips as the scale has degrees.
 *
 * Below that the ceiling is the CLIP COUNT rather than the scale, so "you used
 * five of eleven" is simply false — five of eight was the most that was ever
 * on offer. The honest alternative would be to report a ceiling that changes
 * with the pool, which makes the same sentence mean different things in
 * different sessions. Refusing is the smaller lie.
 */
export function comparisonDegreesClaim(result: ComparisonResult): Claim<ComparisonDegreesSay> {
  if (result.itemCount < result.degreesAvailable) return refuse("too-few-clips-for-degrees");
  return {
    ok: true,
    value: {
      degreesUsed: result.degreesUsed,
      degreesAvailable: result.degreesAvailable,
      degreesIfIndifferent: result.degreesIfIndifferent,
      lowestUsed: result.lowestUsed,
      highestUsed: result.highestUsed,
      span: result.span,
      itemCount: result.itemCount,
    },
  };
}

/**
 * How many asserted pairs a stability share needs before it means anything.
 *
 * PROVISIONAL (N3), but not a bare constant: the rule is that ONE pair must not
 * be able to move the reported figure by more than ten percentage points, and
 * ten pairs is what that requires. With three asserted pairs a share of 0.33 and
 * a share of 0.67 differ by a single clip's wobble, and no sentence should rest
 * on that.
 */
export const MIN_ASSERTED_PAIRS = 10;

export interface ComparisonStabilitySay {
  asserted: number;
  kept: number;
  tied: number;
  reversed: number;
  reversedShare: number;
}

/**
 * THE REFUSAL THAT FIRES FOR THE MOST INTERESTING READER, AND MUST.
 *
 * A listener who put every clip within a point of every other asserts almost no
 * orders, so there is nothing to be stable about. That reader is exactly the one
 * whose degrees count is most striking — and the temptation is to say something
 * about their consistency anyway. There is nothing there to say. The degrees
 * claim above still speaks; this one does not.
 */
export function comparisonStabilityClaim(
  result: ComparisonResult,
): Claim<ComparisonStabilitySay> {
  const { asserted, kept, tied, reversed } = result.pairs;
  if (asserted < MIN_ASSERTED_PAIRS || result.reversedShare === null) {
    return refuse("too-few-asserted-pairs");
  }
  return { ok: true, value: { asserted, kept, tied, reversed, reversedShare: result.reversedShare } };
}
