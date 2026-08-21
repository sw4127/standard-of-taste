/**
 * Delicacy Trials instrument math (memo D2, Instrument 2) — content-free,
 * like the rest of src/engine. The user hears an original/degraded pair,
 * picks which side is the original, and names the flaw in the other; this
 * module turns those picks into the measured result. Nothing here narrates
 * and nothing here guesses: every number is arithmetic over the user's own
 * answers scored against the pool's answer key (the §6 principle).
 *
 * Honesty notes (memo N3), load-bearing for the copy that surfaces these:
 * - Accuracy MUST be anchored against chance (2AFC → 50%): 3/6 is a coin
 *   flip, not "50% delicate". DELICACY_CHANCE / FLAW_CHANCE exist for copy.
 * - `magnitude` (1 subtle … 3 obvious) is a PROVISIONAL difficulty proxy set
 *   by authoring judgment; real item difficulty comes from IRT once the
 *   response dataset accumulates (D6). Copy must not claim calibrated
 *   difficulty before then.
 * - Flaw identification is only scored on trials where the user picked the
 *   original correctly: if you mistook the degraded file for the original,
 *   your "what's wrong with the other one" judgment is about the wrong file,
 *   and counting it either way would be noise dressed as measurement.
 * - No percentiles, no norms — session-local numbers only until a cohort
 *   exists (memo §7 cold start).
 * - UNLIKE bias, this instrument has an answer key, and the key is public
 *   (manifest in an open repo). A share URL with a perfect score is therefore
 *   craftable without ever listening. Recomputation still guarantees the
 *   shown result follows from the encoded picks — but NOT that a human ear
 *   produced them. Share/methodology copy must not claim otherwise; framing
 *   is "a measured session", same trust class as any self-run test.
 */

import { fnv1a } from "./hash";
import type { MetricSpec } from "./metricMeta";
import { CONFIDENCE_Z } from "./confidence";

/** The degradation families the toolchain can author (clip-pipeline degrade). */
export const DEGRADATION_FAMILIES = ["pitch-drift", "timing-smear", "lossy-artifact"] as const;
export type DegradationFamily = (typeof DEGRADATION_FAMILIES)[number];

export type PairSide = "a" | "b";
/**
 * Ladder rung: 1 gentlest … 4 strongest.
 *
 * Four, not three, since the S6 strength ladder (2026-08-07) verified a fourth
 * calibrated rung per family and pool expansion shipped it. The value is a
 * LABEL for the rung — the actual degradation parameter lives in the manifest,
 * so a rung can never silently disagree with what was rendered.
 */
export type DelicacyMagnitude = 1 | 2 | 3 | 4;

/** 2AFC chance rate — copy anchors accuracy against this (N3). */
export const DELICACY_CHANCE = 0.5;
/**
 * Chance rate for the flaw pick. Holds ONLY while the UI offers all families
 * as options on every trial (it must — trimming options per trial would leak
 * information about the answer).
 */
export const FLAW_CHANCE = 1 / DEGRADATION_FAMILIES.length;

/**
 * Confidence taps (memo §3, format kept from §28's 95/70/50): attached to
 * performance items ONLY, and confidence NEVER weights scoring — the memo is
 * explicit that it exists solely to be compared against accuracy later
 * (calibration/Brier, which operationalizes Hume's "good sense" as a
 * computed number). Any code path that lets confidence alter accuracy or a
 * verdict is a bug by decision, not by taste.
 *
 * Deliberately NOT unified with weighted.ts's SPLIT_PCTS despite the equal
 * values: those are answer-blend WEIGHTS — the one semantics the memo forbids
 * confidence to ever have. Keeping the constants separate keeps the ban
 * visible; a shared constant would invite exactly the wrong refactor.
 */
export const DELICACY_CONFIDENCE_LEVELS = [95, 70, 50] as const;
export type DelicacyConfidence = (typeof DELICACY_CONFIDENCE_LEVELS)[number];

/** Codec digit ↔ level, DERIVED so encode/decode can never desync. Leading
 *  digits must stay pairwise distinct (delicacy.test.ts asserts it). */
const CONFIDENCE_BY_DIGIT: Record<string, DelicacyConfidence> = Object.fromEntries(
  DELICACY_CONFIDENCE_LEVELS.map((c) => [String(c)[0], c]),
);

/** What the engine needs to know about one trial. Content supplies the rest. */
export interface DelicacyItemSpec {
  id: string;
  /** The degradation actually applied — the flaw pick's answer key. */
  family: DegradationFamily;
  magnitude: DelicacyMagnitude;
  /** Which presented side is the ORIGINAL (seeded at render) — the pick's answer key. */
  originalSide: PairSide;
}

/** One trial's raw answer. Correctness is NEVER stored — always recomputed. */
export interface DelicacyResponse {
  /** The side the user judged to be the original. */
  pickedSide: PairSide;
  /** The family the user believes degrades the other side. */
  flawPick: DegradationFamily;
  /**
   * Claimed % probability that the SIDE PICK is right — explicitly not about
   * the flaw pick (one tap, one referent; the S5a prompt copy must ask
   * "how sure are you that's the original?"). Feeds calibration (S4) only.
   */
  confidence: DelicacyConfidence;
}

/** itemId -> response. */
export type DelicacyResponses = Record<string, DelicacyResponse>;

/** Per-trial receipt — the reveal screen's "you said / it was" line. */
export interface DelicacyReceipt {
  id: string;
  family: DegradationFamily;
  magnitude: DelicacyMagnitude;
  pickedSide: PairSide;
  correct: boolean;
  flawPick: DegradationFamily;
  /** null when the pick was wrong — flaw judgment about the wrong file is unscoreable. */
  flawCorrect: boolean | null;
  /** Carried for the calibration computation (S4) — never used in scoring here. */
  confidence: DelicacyConfidence;
}

interface Tally {
  n: number;
  correct: number;
}

/** The fully computed, deterministic result. UI/card render this verbatim. */
export interface DelicacyResult {
  /** Stable hash of (instrument id + all responses) — the cache key. */
  hash: string;
  nTrials: number;
  nCorrect: number;
  /** Proportion in [0,1]. Copy anchors it against DELICACY_CHANCE. */
  accuracy: number;
  /** Trials/correct split by authored intensity (magnitudes absent from the pool tally n=0). */
  byMagnitude: Record<DelicacyMagnitude, Tally>;
  /** Trials/correct split by degradation family (families absent from the pool tally n=0). */
  byFamily: Record<DegradationFamily, Tally>;
  /** Trials where the pick was correct — the flaw stat's only denominator. */
  flawEligible: number;
  flawCorrect: number;
  /** null when flawEligible is 0 (no data is not 0% — N3). */
  flawAccuracy: number | null;
  receipts: DelicacyReceipt[];
}

/**
 * Compact CSV of responses in item order — the stateless share-URL payload.
 * One `<side><flawIndex><confDigit>` token per trial (e.g. "a09,b25,a17"),
 * flawIndex into DEGRADATION_FAMILIES, confDigit the leading digit of the
 * 95/70/50 level. The share page and card RECOMPUTE the result from
 * these raw picks against the pool's answer key, so a forged URL can only
 * ever show what the engine would actually conclude from those picks (N3;
 * but see the answer-key honesty note in the header).
 *
 * VERSIONING CONTRACT (load-bearing): tokens are POSITIONAL — their meaning
 * is the item order of the exact pool version that produced them. Any page
 * that decodes this payload MUST first gate on the pool version carried in
 * the URL (like /bias/result) and hard-reject mismatches; decoding against
 * a reordered pool would silently score different answers.
 */
export function encodeDelicacyResponses(items: DelicacyItemSpec[], responses: DelicacyResponses): string {
  return items
    .map((item) => {
      const r = responses[item.id];
      if (!r) throw new Error(`delicacy: cannot encode — missing response for "${item.id}"`);
      return `${r.pickedSide}${DEGRADATION_FAMILIES.indexOf(r.flawPick)}${String(r.confidence)[0]}`;
    })
    .join(",");
}

/** Strict inverse of encodeDelicacyResponses. Returns null on ANY malformation. */
export function decodeDelicacyResponses(
  items: DelicacyItemSpec[],
  csv: string | undefined,
): DelicacyResponses | null {
  if (typeof csv !== "string") return null;
  const parts = csv.split(",");
  if (parts.length !== items.length) return null;
  const out: DelicacyResponses = {};
  for (let i = 0; i < items.length; i++) {
    const m = /^([ab])([0-9])([0-9])$/.exec(parts[i]);
    if (!m) return null;
    const flaw = DEGRADATION_FAMILIES[Number(m[2])];
    if (flaw === undefined) return null;
    const confidence = CONFIDENCE_BY_DIGIT[m[3]];
    if (confidence === undefined) return null;
    out[items[i].id] = { pickedSide: m[1] as PairSide, flawPick: flaw, confidence };
  }
  return out;
}

/** Canonical string of all responses — item ids sorted, instrument id included. */
export function canonicalDelicacyInput(
  instrumentId: string,
  items: DelicacyItemSpec[],
  responses: DelicacyResponses,
): string {
  // Confidence is part of the canonical raw data (D6: two sessions with the
  // same picks but different confidence are DIFFERENT observations).
  const parts = items
    .map((item) => {
      const r = responses[item.id];
      return `${item.id}=${r.pickedSide}>${r.flawPick}@${r.confidence}`;
    })
    .sort();
  return `${instrumentId}|${parts.join("&")}`;
}

/**
 * The instrument. Throws on malformed input (missing/unknown ids, invalid
 * sides or families, empty item list) — the UI must never let those reach
 * here, and a throw is a bug upstream, not a user error.
 */
export function computeDelicacyResult(
  instrumentId: string,
  items: DelicacyItemSpec[],
  responses: DelicacyResponses,
): DelicacyResult {
  if (items.length === 0) throw new Error("delicacy: item list is empty");
  const ids = new Set(items.map((i) => i.id));
  if (ids.size !== items.length) throw new Error("delicacy: duplicate item ids");
  for (const key of Object.keys(responses)) {
    if (!ids.has(key)) throw new Error(`delicacy: response for unknown item "${key}"`);
  }
  for (const item of items) {
    const r = responses[item.id];
    if (!r) throw new Error(`delicacy: missing response for "${item.id}"`);
    if (r.pickedSide !== "a" && r.pickedSide !== "b") {
      throw new Error(`delicacy: pickedSide for "${item.id}" must be "a" or "b", got ${JSON.stringify(r.pickedSide)}`);
    }
    if (!DEGRADATION_FAMILIES.includes(r.flawPick)) {
      throw new Error(`delicacy: flawPick for "${item.id}" is not a known family: ${JSON.stringify(r.flawPick)}`);
    }
    if (!(DELICACY_CONFIDENCE_LEVELS as readonly number[]).includes(r.confidence)) {
      throw new Error(
        `delicacy: confidence for "${item.id}" must be one of ${DELICACY_CONFIDENCE_LEVELS.join("/")}, got ${JSON.stringify(r.confidence)}`,
      );
    }
  }

  const receipts: DelicacyReceipt[] = items.map((item) => {
    const r = responses[item.id];
    const correct = r.pickedSide === item.originalSide;
    return {
      id: item.id,
      family: item.family,
      magnitude: item.magnitude,
      pickedSide: r.pickedSide,
      correct,
      flawPick: r.flawPick,
      flawCorrect: correct ? r.flawPick === item.family : null,
      confidence: r.confidence,
    };
  });

  const tally = (): Tally => ({ n: 0, correct: 0 });
  const byMagnitude: Record<DelicacyMagnitude, Tally> = { 1: tally(), 2: tally(), 3: tally(), 4: tally() };
  const byFamily = Object.fromEntries(DEGRADATION_FAMILIES.map((f) => [f, tally()])) as Record<
    DegradationFamily,
    Tally
  >;
  for (const r of receipts) {
    byMagnitude[r.magnitude].n++;
    byFamily[r.family].n++;
    if (r.correct) {
      byMagnitude[r.magnitude].correct++;
      byFamily[r.family].correct++;
    }
  }

  const nCorrect = receipts.filter((r) => r.correct).length;
  const flawEligible = receipts.filter((r) => r.flawCorrect !== null).length;
  const flawCorrectCount = receipts.filter((r) => r.flawCorrect === true).length;

  return {
    hash: fnv1a(canonicalDelicacyInput(instrumentId, items, responses)),
    nTrials: items.length,
    nCorrect,
    accuracy: nCorrect / items.length,
    byMagnitude,
    byFamily,
    flawEligible,
    flawCorrect: flawCorrectCount,
    flawAccuracy: flawEligible > 0 ? flawCorrectCount / flawEligible : null,
    receipts,
  };
}

/**
 * The metrics this module computes (RT-9c). Declared beside the arithmetic so
 * the two change together; the Lab's dictionary aggregates rather than restates.
 */
export const DELICACY_METRICS: MetricSpec[] = [
  {
    id: "delicacy_accuracy",
    label: "Delicacy accuracy",
    definition:
      "Share of trials where the respondent correctly identified which of two clips was the unmodified original.",
    formula: "accuracy = (correct side picks) / (trials)",
    unit: "proportion",
    owner: "instrument",
    target: "above 0.50 chance",
    caveat: "Two-alternative forced choice: 50% is a coin flip, not a middling score.",
  },
  {
    id: "flaw_accuracy",
    label: "Flaw-identification accuracy",
    definition:
      "Share of correctly-identified trials where the respondent also named the right degradation family.",
    formula: "accuracy = (correct flaw picks) / (trials where the side pick was correct)",
    unit: "proportion",
    owner: "instrument",
    target: "above 0.33 chance",
    caveat:
      "Scored only on trials where the side pick was right — judging the flaw in the wrong file is unscoreable, not wrong.",
  },
];

/**
 * THE DETECTION BAND — what a delicacy session can honestly say it measured
 * (E6/S8; PM ruling RT-105a b, applying RT-90a's band-not-point rule).
 *
 * WHY THIS REPLACED A TIER NAME. E6/S8 measured how often the six shipped
 * tiers put a person in the right one at the shipping length: 30.5%. Coarser
 * cuts do not rescue it — two bands reach 70.2% against the 89.3% the Prestige
 * verdict manages. There is no granularity at which fifteen trials support a
 * ranked verdict, and RT-90a already ruled the general case for the staircase:
 * report the band, never the point, because a point estimate from a noisy
 * measurement is a claim the measurement cannot support. A tier name is a point
 * estimate wearing an adjective.
 *
 * TWO CORRECTIONS, BOTH NECESSARY, NEITHER COSMETIC:
 *
 * 1. GUESSING. A two-way choice hands out 50% for free, so raw accuracy of 73%
 *    is not "hears 73% of flaws" — it is mostly the coin. The detection rate is
 *    d = 2p - 1: the share of pairs where hearing, rather than luck, did the
 *    work. Eleven of fifteen is 73% correct and 47% detected. Printing the
 *    first as if it were the second is the hoax this function exists to avoid.
 *
 * 2. THE INTERVAL IS WILSON, NOT NORMAL. The textbook p +/- z*sqrt(p(1-p)/n)
 *    is badly wrong at n = 15 and catastrophically wrong near the ends: at 15
 *    of 15 it has zero width, which would print "you detected 100% of flaws,
 *    give or take nothing" from fifteen coin flips. Wilson keeps a sensible
 *    width at the boundaries, which is exactly where a short session lands its
 *    luckiest and unluckiest users.
 *
 * `excludesChance` is the one categorical claim that survives: whether the
 * whole interval sits above zero detection. That is a statement about THIS
 * session, not a rank against other people, and it is the only line here that
 * says something binary.
 */
export interface DetectionBand {
  nCorrect: number;
  nTrials: number;
  /** Share correct, including the pairs luck handed over. */
  accuracy: number;
  /** Guessing-corrected point estimate, d = 2p - 1, clipped at 0. */
  rate: number;
  /** Lower and upper bounds of d at 95%, clipped to [0, 1]. */
  lo: number;
  hi: number;
  /** Whether the interval clears zero detection — i.e. beat the coin. */
  excludesChance: boolean;
}

/**
 * The shared level, not a second copy of it (E6/S14). This was `1.96` written
 * out here while the copy deck typed "95% confidence" by hand — two statements
 * of one decision, only one of which anyone would remember to change.
 */
const WILSON_Z = CONFIDENCE_Z;

export function detectionBand(nCorrect: number, nTrials: number): DetectionBand {
  if (!Number.isInteger(nTrials) || nTrials <= 0) {
    throw new Error(`detectionBand: nTrials must be a positive integer, got ${nTrials}`);
  }
  if (!Number.isInteger(nCorrect) || nCorrect < 0 || nCorrect > nTrials) {
    throw new Error(`detectionBand: nCorrect ${nCorrect} out of range for ${nTrials} trials`);
  }

  const n = nTrials;
  const p = nCorrect / n;
  const z2 = WILSON_Z * WILSON_Z;
  const denom = 1 + z2 / n;
  const centre = (p + z2 / (2 * n)) / denom;
  const half = (WILSON_Z / denom) * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n));

  // Bounds on the CORRECT-share first, then mapped through d = 2p - 1. The map
  // is monotone, so the interval maps to an interval and the order is kept.
  const pLo = Math.max(0, centre - half);
  const pHi = Math.min(1, centre + half);
  const toRate = (x: number) => Math.max(0, Math.min(1, 2 * x - 1));

  return {
    nCorrect,
    nTrials,
    accuracy: p,
    rate: toRate(p),
    lo: toRate(pLo),
    hi: toRate(pHi),
    // Strictly above chance: pLo must clear 0.5 outright. Equality is not
    // evidence, and at these sample sizes it is the common case.
    excludesChance: pLo > 0.5,
  };
}
