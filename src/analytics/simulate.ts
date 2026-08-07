/**
 * Labeled-simulation response generator (artifact pivot §2, memo D6).
 *
 * WHY THIS EXISTS: the estimation pipeline (S2+) must be proven to recover
 * parameters it does not know. That is only possible against data whose true
 * parameters we set ourselves. This module is that source: it draws persons
 * and items from a KNOWN model and emits responses in the EXACT shapes the
 * production engines consume (`BiasRatings`, `DelicacyResponses`), so the
 * pipeline under test is the shipping pipeline, not a parallel one.
 *
 * HONESTY (N3, non-negotiable — pivot §2):
 * - Every dataset carries `dataSource: "SIMULATED"`. Anything that renders a
 *   number derived from one of these MUST surface that badge. No percentile
 *   from people who do not exist ever reaches a user.
 * - Simulated responses validate the ESTIMATOR, never the ITEMS. Recovering
 *   an item's difficulty here proves the math; it says nothing about whether
 *   a human can hear d4's pitch drift. Item audibility is Layer A's job
 *   (pivot §1); measured item difficulty waits for real N.
 * - The person-model defaults below are ASSUMED population parameters chosen
 *   to exercise the instruments across their full verdict range. They are not
 *   estimates of any real population and must never be quoted as such.
 *
 * MODEL CHOICES worth arguing with (all deliberate):
 * - Delicacy is 2PL-with-fixed-guessing: a 2AFC item floors at 50%, so the
 *   guessing parameter is FIXED at chance rather than estimated. Naming the
 *   flaw is a second, harder task with its own difficulty and a 1/3 floor.
 * - Confidence tracks the item's TRUE success probability for that person,
 *   not the realized outcome — felt confidence is about how hard the item
 *   felt, not about whether the coin landed. This is what makes miscalibration
 *   a recoverable person parameter rather than hindsight noise.
 * - Bias pull is applied toward the SHOWN label regardless of `labelIsTrue`:
 *   the sim assumes people cannot tell a swapped label from a true one, which
 *   is precisely the assumption the instrument itself rests on.
 * - The second pass is generated from the person's ROUNDED, CLAMPED first
 *   rating, then rounded and clamped again. This reproduces the scale-edge
 *   artifact (a 10 cannot move up) that `BiasResult.edgeCount` exists to
 *   disclose — a generator that skipped it would hide a real bias in the
 *   estimator.
 */

import {
  BIAS_SCALE_MAX,
  BIAS_SCALE_MIN,
  type BiasItemSpec,
  type BiasRatings,
} from "@/engine/bias";
import {
  DEGRADATION_FAMILIES,
  DELICACY_CONFIDENCE_LEVELS,
  type DegradationFamily,
  type DelicacyConfidence,
  type DelicacyItemSpec,
  type DelicacyResponses,
} from "@/engine/delicacy";

/** Provenance tag. Present on every dataset; the /lab badge reads it. */
export const SIMULATED = "SIMULATED" as const;

/** 2AFC floor — a person who cannot hear anything still wins half the time. */
export const GUESS_SIDE = 0.5;
/** Flaw-pick floor: all families offered on every trial (engine's FLAW_CHANCE). */
export const GUESS_FLAW = 1 / DEGRADATION_FAMILIES.length;

/** Per-item rating noise, in scale points — applied on BOTH passes. */
const RATING_NOISE_SD = 0.9;
/** Noise on the felt-confidence signal, in probability units. */
const CONF_NOISE_SD = 0.06;

// ---------------------------------------------------------------- randomness

/** mulberry32 — same generator as the clip pipeline. Same seed, same data, forever. */
function makeRng(seed: number) {
  let s = seed >>> 0;
  const unit = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    unit,
    /** Box-Muller standard normal (second deviate discarded — stream stays simple). */
    normal: () => {
      const u1 = Math.max(unit(), Number.EPSILON); // log(0) guard
      return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * unit());
    },
    pick: <T>(xs: readonly T[]): T => xs[Math.floor(unit() * xs.length)],
  };
}
type Rng = ReturnType<typeof makeRng>;

/**
 * Per-person stream seed. Each respondent draws from their OWN stream, so a
 * person's answers depend only on (seed, their index) — never on how many
 * items the pool happens to hold or how many people came before them. That
 * makes "same cohort, different item bank" and "n=50 is a prefix of n=1000"
 * true BY CONSTRUCTION rather than by luck of iteration order, which is what
 * S2's recovery-vs-sample-size proof leans on.
 */
const subSeed = (base: number, i: number) => (Math.imul(base ^ (i + 1), 0x9e3779b1) ^ (i << 16)) >>> 0;

const logistic = (x: number) => 1 / (1 + Math.exp(-x));
const clampRating = (x: number) =>
  Math.min(BIAS_SCALE_MAX, Math.max(BIAS_SCALE_MIN, Math.round(x)));

/**
 * Snap a felt probability to the nearest offered tap, using the MIDPOINTS of
 * DELICACY_CONFIDENCE_LEVELS so the cut points can never desync from the taps
 * the UI actually offers. Assumes that list is descending (asserted in tests).
 */
export function snapConfidence(p: number): DelicacyConfidence {
  const pct = p * 100;
  for (let i = 0; i < DELICACY_CONFIDENCE_LEVELS.length - 1; i++) {
    if (pct >= (DELICACY_CONFIDENCE_LEVELS[i] + DELICACY_CONFIDENCE_LEVELS[i + 1]) / 2) {
      return DELICACY_CONFIDENCE_LEVELS[i];
    }
  }
  return DELICACY_CONFIDENCE_LEVELS[DELICACY_CONFIDENCE_LEVELS.length - 1];
}

// -------------------------------------------------------------- person model

/** One simulated respondent's ground truth. This is what S2 must recover. */
export interface SimPerson {
  id: string;
  /** Discrimination ability, in logits. Higher = hears more. */
  theta: number;
  /** Label susceptibility, in rating points moved toward a shown label. Negative = contrarian. */
  beta: number;
  /** Over(+)/under(−) confidence, in probability units, added to felt probability. */
  confBias: number;
  /** Constant rating offset — some people simply rate everything higher. */
  leniency: number;
  /** Person-level second-pass drift, in points. What control items exist to measure. */
  drift: number;
}

/** Assumed population parameters — NOT estimates of any real population (N3). */
export interface PersonModel {
  /**
   * Population MEAN ability, in logits. Exists so a cohort can be genuinely
   * more or less able, not merely more or less spread out — the estimator
   * must be tested against a shifted population, since a real cohort will
   * never be centred on the item bank by luck.
   */
  thetaMean: number;
  thetaSd: number;
  betaMean: number;
  betaSd: number;
  confBiasMean: number;
  confBiasSd: number;
  leniencySd: number;
  driftMean: number;
  driftSd: number;
  /**
   * Correlation between ability (θ) and label susceptibility (β).
   *
   * THIS IS AN ASSUMPTION, NEVER A FINDING (N3). The product's central
   * hypothesis is that discriminating listeners resist prestige cues — i.e.
   * that this correlation is negative in real people. The default of 0 encodes
   * *no assumption either way*, which means any simulated plot of θ against β
   * will show r ≈ 0 BY CONSTRUCTION. Such a panel must never be read as
   * evidence about real listeners; that question is answerable only with real
   * responses. The parameter is exposed so the null is a visible choice rather
   * than an invisible accident, and so sensitivity to it can be tested.
   */
  thetaBetaCorrelation: number;
}

/**
 * Defaults chosen so a cohort spans all three bias verdicts and both
 * calibration directions — i.e. so the estimator is tested across its range,
 * not at a comfortable centre. Judgment, not measurement.
 */
export const DEFAULT_PERSON_MODEL: PersonModel = {
  thetaMean: 0.0,
  thetaSd: 1.0,
  betaMean: 0.8,
  betaSd: 0.7,
  confBiasMean: 0.05,
  confBiasSd: 0.12,
  leniencySd: 1.0,
  driftMean: 0.1,
  driftSd: 0.5,
  thetaBetaCorrelation: 0,
};

export function simulatePersons(
  seed: number,
  n: number,
  model: PersonModel = DEFAULT_PERSON_MODEL,
): SimPerson[] {
  if (!Number.isInteger(n) || n < 1) throw new Error(`simulate: nPersons must be a positive integer, got ${n}`);
  const rho = model.thetaBetaCorrelation;
  if (!(rho >= -1 && rho <= 1)) throw new Error(`simulate: thetaBetaCorrelation must be in [-1,1], got ${rho}`);
  return Array.from({ length: n }, (_, i) => {
    const rng = makeRng(subSeed(seed, i));
    // Bivariate normal by Cholesky: β leans on θ by exactly rho, and the
    // marginal SDs stay as specified regardless of rho.
    const zTheta = rng.normal();
    const zBeta = rho * zTheta + Math.sqrt(1 - rho * rho) * rng.normal();
    return {
      id: `p${String(i + 1).padStart(4, "0")}`,
      theta: model.thetaMean + zTheta * model.thetaSd,
      beta: model.betaMean + zBeta * model.betaSd,
      confBias: model.confBiasMean + rng.normal() * model.confBiasSd,
      leniency: rng.normal() * model.leniencySd,
      drift: model.driftMean + rng.normal() * model.driftSd,
    };
  });
}

// ------------------------------------------------------------------ delicacy

/** A delicacy trial with KNOWN item parameters. */
export interface SimDelicacyItem extends DelicacyItemSpec {
  /** Discrimination (logit slope). */
  a: number;
  /** Difficulty, in logits: θ at which P(correct) sits halfway above chance. */
  b: number;
  /** Difficulty of naming the flaw, given the side pick was right. */
  bFlaw: number;
}

export interface SimDelicacyDataset {
  dataSource: typeof SIMULATED;
  seed: number;
  items: SimDelicacyItem[];
  persons: SimPerson[];
  /** Parallel to `persons` — the exact shape `computeDelicacyResult` takes. */
  responses: DelicacyResponses[];
}

export function simulateDelicacy(
  seed: number,
  items: SimDelicacyItem[],
  persons: SimPerson[],
): SimDelicacyDataset {
  if (items.length === 0) throw new Error("simulate: delicacy item list is empty");
  const responses = persons.map((person, i) => {
    const rng = makeRng(subSeed(seed ^ 0x5eed_de1c, i));
    const out: DelicacyResponses = {};
    for (const item of items) {
      const pSide = GUESS_SIDE + (1 - GUESS_SIDE) * logistic(item.a * (person.theta - item.b));
      const correct = rng.unit() < pSide;
      const pickedSide = correct
        ? item.originalSide
        : item.originalSide === "a"
          ? "b"
          : "a";
      out[item.id] = {
        pickedSide,
        flawPick: simulateFlawPick(rng, item, person, correct),
        // Felt confidence tracks the item's true difficulty for this person,
        // shifted by their miscalibration — never by the realized outcome.
        confidence: snapConfidence(pSide + person.confBias + rng.normal() * CONF_NOISE_SD),
      };
    }
    return out;
  });
  return { dataSource: SIMULATED, seed, items, persons, responses };
}

function simulateFlawPick(
  rng: Rng,
  item: SimDelicacyItem,
  person: SimPerson,
  sidePickWasCorrect: boolean,
): DegradationFamily {
  // Picked the wrong side ⇒ the flaw judgment is about the ORIGINAL file, so
  // there is nothing to hear. Chance, and the engine scores it as unscoreable.
  if (!sidePickWasCorrect) return rng.pick(DEGRADATION_FAMILIES);
  const pFlaw = GUESS_FLAW + (1 - GUESS_FLAW) * logistic(item.a * (person.theta - item.bFlaw));
  if (rng.unit() < pFlaw) return item.family;
  return rng.pick(DEGRADATION_FAMILIES.filter((f) => f !== item.family));
}

// ---------------------------------------------------------------------- bias

/** A bias clip with a KNOWN population-mean rating. */
export interface SimBiasItem extends BiasItemSpec {
  /**
   * Population-mean blind rating, in scale points. ASSIGNED, not judged: the
   * simulation makes no claim about which real recording is better, and when
   * built from the live pool this value is drawn from the seeded stream
   * (see `assignBiasParams`).
   */
  trueQuality: number;
}

export interface SimBiasDataset {
  dataSource: typeof SIMULATED;
  seed: number;
  items: SimBiasItem[];
  persons: SimPerson[];
  /** Parallel to `persons` — the exact shapes `computeBiasResult` takes. */
  blind: BiasRatings[];
  labeled: BiasRatings[];
}

export function simulateBias(
  seed: number,
  items: SimBiasItem[],
  persons: SimPerson[],
): SimBiasDataset {
  if (items.length === 0) throw new Error("simulate: bias item list is empty");
  const blind: BiasRatings[] = [];
  const labeled: BiasRatings[] = [];
  for (const [i, person] of persons.entries()) {
    const rng = makeRng(subSeed(seed ^ 0x5eed_b1a5, i));
    const b: BiasRatings = {};
    const l: BiasRatings = {};
    for (const item of items) {
      b[item.id] = clampRating(item.trueQuality + person.leniency + rng.normal() * RATING_NOISE_SD);
      // Controls carry no label, so they receive drift and nothing else —
      // which is exactly what makes them a usable drift baseline.
      //
      // MEASURED CAVEAT (found by this simulator, S1 2026-08-07): that
      // baseline is biased TOWARD ZERO by the scale ceiling. With the live
      // pool the controls sit around 7.0, ~3.7% of their blind ratings land on
      // 10, and those can only move down — so a true mean drift of +0.094
      // measures as +0.068. Since the engine's RT-2a correction subtracts
      // controlDriftPts·(nUp−nDown)/n, an under-measured baseline means the
      // sway headline is UNDER-corrected. Carried to S7 as an instrument
      // finding; the simulator is what makes it visible at all.
      const pull = item.isControl ? 0 : person.beta * (item.labelDirection === "up" ? 1 : -1);
      l[item.id] = clampRating(b[item.id] + person.drift + pull + rng.normal() * RATING_NOISE_SD);
    }
    blind.push(b);
    labeled.push(l);
  }
  return { dataSource: SIMULATED, seed, items, persons, blind, labeled };
}

// ------------------------------------------------------------------- cohort

/**
 * ONE cohort, both instruments. This is the entry point callers should reach
 * for; the per-instrument functions exist for tests that need one in isolation.
 *
 * Why it exists: `simulatePersons` called twice with different seeds yields two
 * different populations whose ids nonetheless collide (`p0001` in both). Any
 * cross-instrument join — the Taste Index, the retest arc, every longitudinal
 * question in the pivot's §3 — would then silently merge strangers and report
 * the result as a correlation. Generating the person array exactly once makes
 * that class of bug unrepresentable.
 */
export interface SimCohort {
  dataSource: typeof SIMULATED;
  seed: number;
  persons: SimPerson[];
  delicacy: SimDelicacyDataset;
  bias: SimBiasDataset;
}

export function simulateCohort(
  seed: number,
  nPersons: number,
  pools: { delicacy: SimDelicacyItem[]; bias: SimBiasItem[] },
  model: PersonModel = DEFAULT_PERSON_MODEL,
): SimCohort {
  const persons = simulatePersons(seed, nPersons, model);
  return {
    dataSource: SIMULATED,
    seed,
    persons,
    delicacy: simulateDelicacy(seed, pools.delicacy, persons),
    bias: simulateBias(seed, pools.bias, persons),
  };
}

// ------------------------------------------- attaching parameters to a pool

/**
 * Difficulty assigned from AUTHORED magnitude (1 subtle … 3 obvious).
 * PROVISIONAL AND ASSIGNED, not measured — replacing this mapping with
 * estimates from real responses is the entire point of the pivot's §1
 * Layer B. Nothing user-facing may quote these as item difficulties.
 */
export const ASSIGNED_DIFFICULTY_BY_MAGNITUDE: Record<1 | 2 | 3, number> = { 1: 1.0, 2: 0.0, 3: -1.0 };
/** Naming the flaw is assumed harder than spotting that something is wrong. */
export const ASSIGNED_FLAW_PENALTY = 0.7;
/** Assigned discrimination — flat across items, so recovery has nothing to lean on. */
export const ASSIGNED_DISCRIMINATION = 1.0;

/**
 * A synthetic item BANK with parameters drawn from distributions.
 *
 * The real pool (`assignDelicacyParams`) is deliberately flat: 6 items, three
 * difficulty values, one discrimination. That is fine for proving the response
 * shapes, and USELESS for recovery — an estimator cannot be shown to recover a
 * discrimination that has no variance to recover, and a 6-item correlation is
 * noise. S2 estimates against this bank; the real pool stays the shape check.
 *
 * `magnitude` is derived from difficulty so the bank stays internally coherent
 * (a "subtle" item is a hard one); the simulation math never reads it.
 */
export function syntheticDelicacyItems(seed: number, n: number): SimDelicacyItem[] {
  if (!Number.isInteger(n) || n < 1) throw new Error(`simulate: item count must be a positive integer, got ${n}`);
  const rng = makeRng(seed ^ 0x5eed_bafe);
  return Array.from({ length: n }, (_, i) => {
    // Discrimination is lognormal: it must stay positive, and a negative slope
    // would mean "worse ears score better", which is a broken item, not a draw.
    const a = Math.min(2.5, Math.max(0.4, Math.exp(rng.normal() * 0.35)));
    const b = rng.normal() * 1.0;
    return {
      id: `syn${String(i + 1).padStart(3, "0")}`,
      family: DEGRADATION_FAMILIES[i % DEGRADATION_FAMILIES.length],
      magnitude: (b > 0.5 ? 1 : b < -0.5 ? 3 : 2) as 1 | 2 | 3,
      originalSide: rng.unit() < 0.5 ? "a" : "b",
      a,
      b,
      bFlaw: b + ASSIGNED_FLAW_PENALTY + rng.normal() * 0.2,
    };
  });
}

export function assignDelicacyParams(trials: DelicacyItemSpec[]): SimDelicacyItem[] {
  return trials.map((t) => {
    const b = ASSIGNED_DIFFICULTY_BY_MAGNITUDE[t.magnitude];
    return { ...t, a: ASSIGNED_DISCRIMINATION, b, bFlaw: b + ASSIGNED_FLAW_PENALTY };
  });
}

/**
 * Attach a known `trueQuality` to real bias clips. Values are drawn from the
 * seeded stream around `centre` — arbitrary but KNOWN, and deliberately not a
 * judgment about the recordings (the PM is out of the quality loop, pivot §1).
 */
export function assignBiasParams(
  clips: BiasItemSpec[],
  seed: number,
  centre = 6.0,
  spread = 1.2,
): SimBiasItem[] {
  const rng = makeRng(seed ^ 0x5eed_9a11);
  return clips.map((c) => ({ ...c, trueQuality: centre + rng.normal() * spread }));
}
