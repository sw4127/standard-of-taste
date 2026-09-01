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
   * The floor a SINGLE pair of sittings would have faced (E14/S6).
   *
   * Carried so the copy can say what coming back actually bought, in the same
   * units as the floor itself. Without it the reader is told the floor is 2.5x
   * with no way to see that it used to be 3.6x, and the one honest reward this
   * product offers for returning would be invisible on the screen that earned
   * it. Equal to `floorFactor` when nothing was pooled.
   */
  soloFloorFactor?: number;
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
  /** How many sittings the reading rests on, both windows together. */
  sessions: number;
  /**
   * How many sittings went into each side (E14/S6, RT-H3 a).
   *
   * The copy names these, because the return on coming back is precisely that
   * the floor above got smaller — and a reader told "your floor is 2.4x" with
   * no explanation of why it moved has been handed a number they cannot check.
   */
  pooled: { older: number; newer: number };
}

/* ------------------------------------------------------------------ *
 * Pooling — what a second sitting actually buys (E14/S6, RT-H3 a)
 * ------------------------------------------------------------------ */

/**
 * HOW MANY SITTINGS AN ARC MAY REST ON PER SIDE.
 *
 * Four read back, split in half, so at most two a side. Not a budget: it is
 * what a 7-day cooldown puts within a couple of months, and beyond it the
 * oldest sitting is describing an ear far enough in the past that averaging it
 * in is the thing H3 exists to prevent.
 */
export const MAX_POOLED = 2;

/**
 * RECENCY WEIGHT INSIDE ONE WINDOW — halving per sitting back.
 *
 * H3's requirement is that "an ear that has moved is not averaged with the ear
 * it used to be". Most of that is done by the WINDOW SPLIT below rather than by
 * this weight: an older sitting sits in the older window and cannot contaminate
 * the newer estimate at all, which is a stronger guarantee than down-weighting
 * it. The weight handles what the split cannot — a change that happens between
 * the two sittings inside one window.
 *
 * MEASURED, AND SMALLER THAN IT SOUNDS AT THIS WINDOW SIZE. Weights 1 and 0.5
 * give an effective sample of 1.80 rather than 2, which widens the floor by
 * 5.4%. Against that, on a change landing inside the newer window it moves the
 * pooled estimate two thirds of the way to the newer sitting instead of half —
 * measured on the same sittings both ways, that recovers 32% more of a real
 * change than an unweighted mean does.
 * `arc-pooling.test.ts` prices both directions on the same sittings — an
 * earlier draft of this comment asserted the benefit without measuring it,
 * which is the "should work" this project forbids.
 *
 * At a window of two it is close to a formality; it earns its place as the rule
 * H3 asked for, and it would matter more if `MAX_POOLED` ever grew.
 */
export const RECENCY_DECAY = 0.5;

export interface Pooled {
  /** Weighted mean, in whatever space the caller does its arithmetic in. */
  value: number;
  /** The newest timestamp in the window — what a reader would call "when". */
  at: number;
  /** (sum w)^2 / sum w^2. Two equally-weighted sittings give exactly 2. */
  nEff: number;
  count: number;
  withinRange: boolean;
}

/**
 * `points` oldest first. The last element is the newest and carries weight 1.
 *
 * `decay` is a parameter, not a constant read from module scope, ONLY so that
 * `arc-pooling.test.ts` can price the shipped value against an unweighted mean
 * on the same sittings. The docblock on `RECENCY_DECAY` used to assert a
 * benefit for the weight that nothing measured; a comparison you cannot run is
 * a claim, and this is what makes it runnable. Production never passes it.
 */
export function poolWindow(
  points: Array<{ at: number; value: number; withinRange: boolean }>,
  decay: number = RECENCY_DECAY,
): Pooled {
  const n = points.length;
  let sw = 0;
  let sw2 = 0;
  let acc = 0;
  for (let i = 0; i < n; i++) {
    const w = Math.pow(decay, n - 1 - i);
    sw += w;
    sw2 += w * w;
    acc += w * points[i].value;
  }
  return {
    value: acc / sw,
    at: points[n - 1].at,
    nEff: (sw * sw) / sw2,
    count: n,
    // A window is only "within range" if EVERY sitting in it is. One sitting
    // past the end of the ladder makes the pooled figure partly the prior's
    // opinion, and the copy has to know.
    withinRange: points.every((p) => p.withinRange),
  };
}

/**
 * WHAT POOLING DOES TO THE FLOOR, and it is arithmetic rather than a fudge.
 *
 * `ARC_FLOORS` was measured on one sitting against one sitting, where the
 * difference carries variance 2*sigma^2. With n_eff a side it carries
 * sigma^2*(1/a + 1/b), so the floor scales by the square root of the ratio.
 * At two clean sittings a side that is 1/sqrt(2) — the same 1/sqrt(k) E14/S1
 * measured directly, and slightly CONSERVATIVE against it: S1's simulation put
 * four-a-side pooling at 0.45x to 0.52x of the single floor where this formula
 * predicts 0.50x, so the formula never claims more than the simulation saw.
 *
 * This is the whole return on coming back. Not a badge — a smaller change
 * becoming visible.
 */
export function pooledFloor(base: number, nEffA: number, nEffB: number): number {
  return base * Math.sqrt((1 / nEffA + 1 / nEffB) / 2);
}

/**
 * Split a run of sittings into "then" and "now", newest last.
 *
 * The newer window gets the extra sitting when the count is odd, because the
 * question is where the ear is NOW and the recent half is the half being
 * asked about.
 */
function split<T>(all: readonly T[]): { older: T[]; newer: T[] } | null {
  const used = all.slice(Math.max(0, all.length - 2 * MAX_POOLED));
  if (used.length < 2) return null;
  const olderCount = Math.floor(used.length / 2);
  return { older: used.slice(0, olderCount), newer: used.slice(olderCount) };
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
  const windows = split(entries);
  if (!windows) return refuse("too-few-sessions");
  const earlier = windows.older[windows.older.length - 1];
  const latest = windows.newer[windows.newer.length - 1];

  /*
   * COMPARING TWO RECORDINGS WOULD BE THE HEADLINE ERROR THIS INSTRUMENT
   * ALREADY KNOWS ABOUT: a fixed bitrate does up to 1.999x different damage
   * across windows, so "64 kbps on pb1" and "64 kbps on pb4" are not the same
   * demand on an ear. It has to be refused rather than averaged.
   *
   * THIS WAS THE ORDINARY OUTCOME AND IS NOW THE EXCEPTION — a claim written in
   * this comment one slice before E14/S4 made it false, corrected here rather
   * than left to age. The staircase picked its recording from the session seed,
   * so two sittings matched by coin flip and 55% of pairs were refused,
   * measured end to end. `materialForSession` now reuses whatever this browser
   * was last measured on (RT-H4 a), and the same measurement reports 0%. The
   * refusal stays because it is still reachable: history recorded before the
   * pin shipped, and a browser whose stored session names a retired recording.
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

  /*
   * EVERY SITTING IN THE WINDOW MUST BE ON THE SAME MATERIAL, not just the two
   * that happen to be compared. Checking only the window edges would let a
   * pooled figure average a pb1 sitting into a pb4 one — the very error the
   * refusal above exists to prevent, smuggled in through the mean.
   */
  const all = [...windows.older, ...windows.newer];
  if (all.some((e) => e.session.family !== family || e.session.sourceId !== sourceId)) {
    return refuse("different-material");
  }

  const unit = stepLog(latest.session.axis.magnitudes);
  const asPoints = (window: ThresholdArcEntry[]) => {
    const out: Array<{ at: number; value: number; withinRange: boolean }> = [];
    for (const e of window) {
      const p = point(e);
      // Compared in MAGNITUDE space, which is where the ladder is uniform and
      // where the floor was measured. Pooling display values would average a
      // kbps figure arithmetically, which is not the axis it lives on.
      if (p) out.push({ at: p.point.at, value: p.logMedian, withinRange: p.point.withinRange });
    }
    return out;
  };

  const olderPoints = asPoints(windows.older);
  const newerPoints = asPoints(windows.newer);
  if (olderPoints.length === 0 || newerPoints.length === 0) return refuse("no-scoreable-trials");

  const pooledOlder = poolWindow(olderPoints);
  const pooledNewer = poolWindow(newerPoints);
  const floorHere = pooledFloor(floor, pooledOlder.nEff, pooledNewer.nEff);
  const signed = (pooledNewer.value - pooledOlder.value) / unit;
  const distance = Math.abs(signed);
  const display = (logMagnitude: number) =>
    flipAxis(latest.session.axis.direction, Math.exp(logMagnitude));

  return {
    ok: true,
    value: {
      instrument: "threshold",
      family,
      sourceId,
      unit: latest.session.axis.unit,
      earlier: { at: pooledOlder.at, value: display(pooledOlder.value), withinRange: pooledOlder.withinRange },
      latest: { at: pooledNewer.at, value: display(pooledNewer.value), withinRange: pooledNewer.withinRange },
      distance,
      floor: floorHere,
      distanceFactor: Math.exp(distance * unit),
      floorFactor: Math.exp(floorHere * unit),
      soloFloorFactor: Math.exp(floor * unit),
      pooled: { older: pooledOlder.count, newer: pooledNewer.count },
      // A SMALLER MAGNITUDE IS A SHARPER EAR on every ladder, including the
      // inverted one: less magnitude is less damage needed, which on lossy is a
      // HIGHER bitrate. That is exactly why the comparison is done here rather
      // than on the display numbers.
      direction: distance < floorHere ? null : signed < 0 ? "closer" : "further",
      sessions: pooledOlder.count + pooledNewer.count,
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
  const windows = split(entries);
  if (!windows) return refuse("too-few-sessions");

  const asPoints = (w: BiasArcEntry[]) =>
    w.map((e) => ({ at: e.at, value: e.result.pct, withinRange: true }));
  const older = poolWindow(asPoints(windows.older));
  const newer = poolWindow(asPoints(windows.newer));
  const floor = pooledFloor(ARC_FLOORS.bias, older.nEff, newer.nEff);

  /*
   * POOLED ON THE SIGNED SWAY, FOLDED ONLY AT THE END. Averaging |sway| would
   * make two sittings at +20 and -20 pool to 20 — a person with no consistent
   * pull reported as strongly pulled. The signed mean is 0, which is what those
   * two sittings actually say about them.
   */
  const towardZero = Math.abs(newer.value) - Math.abs(older.value);
  const distance = Math.abs(towardZero);

  return {
    ok: true,
    value: {
      instrument: "bias",
      unit: "points of sway",
      earlier: { at: older.at, value: older.value, withinRange: true },
      latest: { at: newer.at, value: newer.value, withinRange: true },
      distance,
      floor,
      direction: distance < floor ? null : towardZero < 0 ? "closer" : "further",
      sessions: older.count + newer.count,
      pooled: { older: older.count, newer: newer.count },
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
