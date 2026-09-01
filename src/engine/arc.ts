/**
 * DID YOUR EAR MOVE? (E14/S2, Track H, 2026-09-01.)
 *
 * The comparison the product has promised since the D4 amendment — "a loop that
 * moves it" — and the one it has never been able to make, because until E13 the
 * store kept a single session per instrument and overwrote it.
 *
 * IT DECIDES, IT DOES NOT PHRASE. No copy in this module, on the same rule as
 * `evidence.ts`: it returns a machine-readable decision and the vocabulary layer
 * writes the sentence. That keeps one floor behind every phrasing of the same
 * refusal, and keeps the floor testable without rendering anything.
 *
 * IT DOES NOT TOUCH THE STORE, DELIBERATELY. Everything in `src/engine/` is a
 * pure function of its arguments, and this must stay that way for a second
 * reason on top of the usual one: `docs/index.html`'s "Retest arc" row is held
 * to `planned` by a guard whose predicate is "something outside the store reads
 * the history". The moment an arc SURFACE ships that predicate must go true and
 * the row must move. Making the engine read the store would trip it while there
 * was still nothing on screen — a public page claiming a feature nobody can
 * reach. The store-to-engine bridge is a separate slice, exactly as
 * `result-recall.ts` is separate from `result-store.ts`.
 *
 * THE FLOOR IS MEASURED, NOT CHOSEN (`docs/analytics/e14-arc-resolution.txt`).
 * The whole hazard here is that subtracting two noisy numbers manufactures
 * progress. `ARC_FLOORS` is the size a change has to reach before this module
 * will call it movement, derived by simulating the same unchanged person twice
 * through the real session API and reading the answer off the null
 * distribution. `arc-resolution.test.ts` re-derives every value below and fails
 * if the shipped constant and the derivation disagree.
 *
 * A CHANGE UNDER THE FLOOR IS NOT A REFUSAL. `direction: null` is a successful
 * reading — both numbers, and the honest statement that the gap between them is
 * smaller than this instrument can hear (PM ruling RT-H1 a). Refusals are for
 * comparisons that cannot be made at all.
 */
import type { Claim, EvidenceGap } from "./evidence";
import type { BiasResult } from "./bias";
import { fitPosterior } from "./threshold-fit";
import { flipAxis, type StaircaseSession } from "./staircase-session";

const refuse = (gap: EvidenceGap): Claim<never> => ({ ok: false, gap });

/* ------------------------------------------------------------------ *
 * The measured floors
 * ------------------------------------------------------------------ */

/**
 * How far apart two sessions must be before this module calls it movement.
 *
 * LADDER KEYS ARE (family, source). A lossy threshold is a fact about the
 * recording as well as the listener (RT-85a), so each shipping recording gets
 * its own floor rather than sharing one that is true of neither.
 *
 * Units: ladder steps for the staircase, points of the ten-point scale for the
 * prestige sway. Both are the units their sessions are compared in, so nothing
 * here needs converting at the point of use — the conversion mistakes this repo
 * has paid for were all made at a boundary like that.
 *
 * DERIVED, 2026-09-01, and re-derived on every test run. Do not hand-edit: if
 * the instrument changes these change with it, and the derivation is what says
 * so.
 */
export const ARC_FLOORS: Readonly<Record<string, number>> = {
  "pitch-drift": 3.5963,
  "timing-smear": 3.9375,
  "lossy-artifact@pb1": 3.5395,
  "lossy-artifact@pb4": 3.5664,
  bias: 8.0,
};

/** The key a ladder's floor is stored under. One spelling, used by both sides. */
export function floorKey(family: string, sourceId?: string): string {
  return sourceId ? `${family}@${sourceId}` : family;
}

/* ------------------------------------------------------------------ *
 * What a reading is
 * ------------------------------------------------------------------ */

export interface ArcPoint {
  /** When the session was recorded, as the store wrote it. */
  at: number;
  /** Where the ear sat, in the instrument's own display unit. */
  value: number;
  /**
   * FALSE WHEN THE ESTIMATE SITS PAST THE END OF THE LADDER.
   *
   * `fitPosterior`'s prior deliberately reaches beyond the rungs, so a listener
   * outside the instrument's range is representable rather than being squeezed
   * into it — that is what lets the result screen say "more sensitive than
   * anything we can render" instead of inventing a number. The same honesty has
   * to survive into the arc: a sentence may use this point to say the ear
   * MOVED, and may not print it as a threshold.
   */
  withinRange: boolean;
}

export interface ArcReading {
  instrument: "threshold" | "bias";
  family?: string;
  sourceId?: string;
  /** The display unit of `ArcPoint.value` — cents, ms, kbps, points. */
  unit: string;
  earlier: ArcPoint;
  latest: ArcPoint;
  /** How far apart, in the units `floor` is stated in. Never negative. */
  distance: number;
  /** The measured floor this was judged against. */
  floor: number;
  /**
   * THE SAME TWO NUMBERS AS A MULTIPLE, for the copy layer — and the conversion
   * lives here because this module owns the axis.
   *
   * Ladder steps are the units the floor was derived in and they mean nothing
   * to a reader; "the flaw you can catch got four times smaller" does. Doing
   * that arithmetic in the copy layer would put a second copy of the ladder
   * geometry there, which is how this repo got "Measured in kbps (kbps)" and a
   * rung table that disagreed with itself.
   *
   * ABSENT ON THE PRESTIGE TEST, whose scale is additive: a sway of 0 has no
   * meaningful multiple, and offering one would invite "twice as biased".
   */
  distanceFactor?: number;
  floorFactor?: number;
  /**
   * WHICH WAY, RELATIVE TO THE INSTRUMENT'S IDEAL — and `null` far more often
   * than not.
   *
   * "closer" and "further" rather than "better" and "worse", because the two
   * instruments have different ideals and naming them is the copy layer's job:
   * the staircase's ideal is the smallest manipulation a person can catch, the
   * prestige test's is zero sway in either direction.
   *
   * `null` means the gap is under the floor — NOT that nothing happened, but
   * that nothing happened this instrument could hear.
   */
  direction: "closer" | "further" | null;
  /** How many sessions the reading rests on. Two, until pooling ships. */
  sessions: number;
}

/* ------------------------------------------------------------------ *
 * The staircase
 * ------------------------------------------------------------------ */

export interface ThresholdArcEntry {
  at: number;
  session: StaircaseSession;
}

/** One ladder step, in log units. The scale the floor is stated on. */
function stepLog(magnitudes: number[]): number {
  return Math.log(magnitudes[magnitudes.length - 1] / magnitudes[0]) / (magnitudes.length - 1);
}

/**
 * Whether the ear moved on one ladder, between the two most recent sessions.
 *
 * IN THE ORDER THE STORE KEPT THEM, not sorted by timestamp. `lastRecordedAt`
 * made the same choice for the cooldown and gave the reason: append order is
 * what actually happened, and sorting by a clock lets one future-dated entry —
 * from a corrected clock or a hand edit — rewrite which session counts as
 * "latest".
 */
export function thresholdArc(entries: readonly ThresholdArcEntry[]): Claim<ArcReading> {
  if (entries.length < 2) return refuse("too-few-sessions");
  const earlier = entries[entries.length - 2];
  const latest = entries[entries.length - 1];

  /*
   * HALF OF ALL LOSSY RETESTS LAND ON A DIFFERENT RECORDING, and comparing them
   * would be the headline error this instrument already knows about: a fixed
   * bitrate does up to 1.999x different damage across windows, so "64 kbps on
   * pb1" and "64 kbps on pb4" are not the same demand on an ear. The staircase
   * picks its recording from the session seed, so this is not a rare edge — it
   * is the ordinary outcome, and it has to be refused rather than averaged.
   *
   * A family mismatch cannot happen through the store, which keys threshold
   * slots by ladder slug. It is defended anyway: the alternative is a timing
   * threshold reported under a pitch heading, which is the failure
   * `result-recall` already guards the single-session path against.
   */
  if (earlier.session.family !== latest.session.family) return refuse("different-material");
  if (earlier.session.sourceId !== latest.session.sourceId) return refuse("different-material");

  const family = latest.session.family;
  const sourceId = latest.session.sourceId;
  const floor = ARC_FLOORS[floorKey(family, sourceId)];
  if (floor === undefined) return refuse("no-arc-floor");

  /*
   * THE LOG MEDIAN IS CARRIED, NOT RECOVERED FROM THE DISPLAY VALUE.
   *
   * The first version computed the display number, then took `log(flipAxis(…))`
   * of it again to do the arithmetic — a round trip out of log space and back
   * through an involution, to recover a number it had just thrown away. Nothing
   * measurable went wrong, and it was still the wrong shape: the comparison and
   * the printed value would have been free to drift apart the moment either
   * conversion grew a rounding step, and the bug would have surfaced as a
   * reading that disagreed with its own two numbers.
   */
  const point = (e: ThresholdArcEntry): { point: ArcPoint; logMedian: number } | null => {
    const posterior = fitPosterior(e.session.state, e.session.config);
    if (posterior === null) return null;
    const magnitudes = e.session.axis.magnitudes;
    return {
      logMedian: posterior.logMedian,
      point: {
        at: e.at,
        value: flipAxis(e.session.axis.direction, Math.exp(posterior.logMedian)),
        withinRange:
          posterior.logMedian >= Math.log(magnitudes[0]) &&
          posterior.logMedian <= Math.log(magnitudes[magnitudes.length - 1]),
      },
    };
  };

  const a = point(earlier);
  const b = point(latest);
  if (a === null || b === null) return refuse("no-scoreable-trials");

  // Compared in MAGNITUDE space, which is where the ladder is uniform and where
  // the floor was measured. Comparing the display values would make one step
  // mean different things at the two ends of an inverted axis.
  const unit = stepLog(latest.session.axis.magnitudes);
  const signed = (b.logMedian - a.logMedian) / unit;
  const distance = Math.abs(signed);

  return {
    ok: true,
    value: {
      instrument: "threshold",
      family,
      sourceId,
      unit: latest.session.axis.unit,
      earlier: a.point,
      latest: b.point,
      distance,
      floor,
      distanceFactor: Math.exp(distance * unit),
      floorFactor: Math.exp(floor * unit),
      // A SMALLER MAGNITUDE IS A SHARPER EAR on every ladder, including the
      // inverted one: less magnitude is less damage needed, which on lossy is a
      // HIGHER bitrate. That is exactly why the comparison is done here rather
      // than on the display numbers.
      direction: distance < floor ? null : signed < 0 ? "closer" : "further",
      sessions: 2,
    },
  };
}

/* ------------------------------------------------------------------ *
 * The prestige test
 * ------------------------------------------------------------------ */

export interface BiasArcEntry {
  at: number;
  result: BiasResult;
}

/**
 * Whether the label moves this person less than it used to.
 *
 * THE IDEAL IS ZERO, NOT A MINIMUM, and that changes the arithmetic. On a
 * ladder, less is better without limit. Here both signs are the flaw — the
 * instrument already reports a `contrarian` verdict for someone who marks a
 * labelled clip DOWN, and treating that as an improvement over being swayed
 * upward would be the product congratulating a different prejudice. So the
 * direction is decided on the DISTANCE FROM ZERO, not on the signed sway:
 * +18 to -18 has not improved, and this says so.
 *
 * THE FLOOR IS THE SIGNED ONE, USED ON A FOLDED QUANTITY, AND THAT IS
 * DELIBERATELY CONSERVATIVE. `|a| - |b|` cannot vary more than `a - b` does, so
 * judging it against the signed floor errs toward silence. Measured rather than
 * argued: `arc.test.ts` reports the folded rule's false-positive rate, which
 * comes in under the signed rule's own.
 */
export function biasArc(entries: readonly BiasArcEntry[]): Claim<ArcReading> {
  if (entries.length < 2) return refuse("too-few-sessions");
  const earlier = entries[entries.length - 2];
  const latest = entries[entries.length - 1];
  const floor = ARC_FLOORS.bias;

  const towardZero = Math.abs(latest.result.pct) - Math.abs(earlier.result.pct);
  const distance = Math.abs(towardZero);

  return {
    ok: true,
    value: {
      instrument: "bias",
      unit: "points of sway",
      earlier: { at: earlier.at, value: earlier.result.pct, withinRange: true },
      latest: { at: latest.at, value: latest.result.pct, withinRange: true },
      distance,
      floor,
      direction: distance < floor ? null : towardZero < 0 ? "closer" : "further",
      sessions: 2,
    },
  };
}

/* ------------------------------------------------------------------ *
 * The delicacy trials
 * ------------------------------------------------------------------ */

/**
 * THE DELICACY ARC IS REFUSED, AND THE REFUSAL IS A FINDING (PM ruling
 * RT-H2b a, 2026-09-01).
 *
 * A function that always refuses looks like a stub, so here is why it is not.
 * The Track H plan offered the PM two reasons for leaving delicacy out and
 * E14/S1 falsified BOTH: a per-family arc is expressible, and asking about
 * three families at once produces a false movement 2.5% of the time — under
 * one family's own 5%, not over it. What survived measurement is coarseness.
 * Four of a family's five items must change hands before anything may be said,
 * six of fifteen for the whole session, so the only movement this instrument
 * can ever report is a near-total swing.
 *
 * It is written as a refusing function rather than as an omission so that the
 * ruling is reachable from the code, and so a future surface asks and is told
 * no instead of quietly inventing its own answer. `arc-resolution.test.ts`
 * carries the tripwire: if a longer pool ever brings a family under three of
 * five items, that test fails and the ruling gets revisited rather than
 * inherited.
 */
export function delicacyArc(): Claim<never> {
  return refuse("arc-instrument-unsupported");
}
