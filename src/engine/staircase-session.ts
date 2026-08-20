/**
 * ONE STAIRCASE SESSION, END TO END (E5/S2, 2026-08-20).
 *
 * The pieces have existed since E3: a staircase that chooses the next level, a
 * fitter that turns responses into a threshold, a pool that says which windows
 * are legal, and a reader that names the files. Nothing joined them, so the only
 * things that had ever run a session were tests — each with its own hand-built
 * config, and one of them with a window list containing `pb8@120s`, a moment
 * 10 s past the end of the recording. This is the join, and it is the ONLY way
 * a surface should start a session.
 *
 * THE INVERTED AXIS IS HANDLED HERE, ONCE.
 *
 *   `startStaircase` treats `levels[0]` as the gentlest rung, and `fitThreshold`
 *   refuses to print anything below it. Lossy's labels run the other way — 192
 *   kbps is nearly transparent, 32 kbps is brutal — so handing the estimator a
 *   ladder in kbps order makes `levels[0]` the CEILING. Every session would then
 *   come back "below the floor": not a crash, not a wrong-looking number, just a
 *   quiet, plausible refusal on the entire family.
 *
 *   The fix is a single involution. The estimator is fed MAGNITUDES that rise
 *   with difficulty (`1 / kbps` for lossy, the label itself for pitch and
 *   timing); results come back through the same function. It is exact, not
 *   approximate: log is a homomorphism, so `exp(mean(log(1/x))) = 1 /
 *   exp(mean(log x))` — the geometric centre of the inverses IS the inverse of
 *   the geometric centre, which is what makes the fit's log-space arithmetic
 *   survive the trip unchanged.
 *
 *   WHAT IS *NOT* INVERTED: the four outcome kinds. "below" always means "more
 *   sensitive than the gentlest thing we can render" — for lossy that lands at a
 *   HIGHER bitrate than the ladder's top, and the copy has to say so, but the
 *   kind itself is about the instrument's reach and stays honest as written.
 *
 * WHY NOT FIT ON MEASURED dB INSTEAD, which would be the obvious alternative:
 * because RT-85a ruled against it with numbers. A fixed bitrate does up to
 * 1.999x different damage across the windows serving it (pb4 @ 96 kbps, 1.431 to
 * 2.86 dB), so a dB axis would change its own rung sizes underneath the listener
 * mid-session. kbps is exact by construction; the damage spread is a KNOWN LIMIT
 * that gets stated (it rides along on every result below), not fitted away.
 *
 * DETERMINISTIC, like the rest of src/engine/. Given (family, source, seed) the
 * entire session — which window each trial draws, which side the damaged clip
 * sits on — is a pure function of the answers so far, so a session replays
 * exactly and a share URL can carry raw responses rather than conclusions.
 */

import {
  DEFAULT_STAIRCASE,
  recordResponse,
  startStaircase,
  type StaircaseConfig,
  type StaircaseState,
} from "./staircase";
import { fitPosterior, fitThreshold } from "./threshold-fit";
import {
  clipFor,
  familyUnit,
  knownLimits,
  ladderDirection,
  ladderLevels,
  referenceFor,
  type KnownLimit,
  type LadderDirection,
  type StaircaseClip,
  type StaircaseReference,
} from "./staircase-manifest";
import { eligibleSources, isRetiredSource, isSourceLocked, sessionInstances } from "./staircase-pool";
import { pickInstance, type TrialInstance } from "./trial-instances";

/**
 * Label <-> magnitude, and it is its own inverse for both directions.
 *
 * One function rather than a `toMagnitude`/`toLabel` pair, because a pair is two
 * places for the direction test to live and this repo has now been bitten three
 * times by a fact stored twice.
 */
export function flipAxis(direction: LadderDirection, value: number): number {
  if (direction === "up") return value;
  if (!(value > 0)) throw new Error(`flipAxis: an inverted axis has no value for ${value}`);
  return 1 / value;
}

export interface StaircaseAxis {
  family: string;
  /** Present only for source-locked families (lossy). */
  sourceId?: string;
  /** The family's physical unit, as the pipeline recorded it. */
  unit: string;
  direction: LadderDirection;
  /** Ladder labels, GENTLEST FIRST, in the family's own unit. */
  labels: number[];
  /** The same rungs as ascending difficulty — what the estimator is given. */
  magnitudes: number[];
}

export function axisFor(family: string, sourceId?: string): StaircaseAxis {
  const direction = ladderDirection(family);
  const labels = ladderLevels(family, sourceId);
  return {
    family,
    sourceId: isSourceLocked(family) ? sourceId : undefined,
    unit: familyUnit(family),
    direction,
    labels,
    magnitudes: labels.map((l) => flipAxis(direction, l)),
  };
}

/**
 * `levels.length - 3` is the start used by every measurement this instrument
 * rests on (staircase.test.ts, threshold-fit.test.ts, staircase-criterion.test.ts).
 * Deriving it from the ladder rather than writing a number keeps a 7-rung lossy
 * ladder and an 11-rung pitch ladder starting in the same PLACE — two rungs
 * below the most obvious one, audible enough to teach the task without wasting
 * trials at the top.
 */
export const START_FROM_TOP = 3;

/**
 * HOW LONG A SESSION RUNS, PER FAMILY — priced in the user's minutes (PM
 * direction, 2026-08-20: value the time users put in as a RATE of progress, not
 * as a flat budget).
 *
 * WHAT WAS WRONG WITH ONE BUDGET FOR EVERYONE. `stopAfterReversals: 12` charges
 * every ladder ~40 trials, about 20 minutes of listening. Measured over 900
 * simulated sessions per cell — median trials, the share of sessions producing
 * a two-sided band, and the bias of the fitted point in ladder steps:
 *
 *   ladder      rev  trials  min  band%  pts of band per minute   bias
 *   pitch         4      15    8    44%                    5.7   -0.86
 *   pitch         8      27   14    77%                    5.6   -0.13
 *   pitch        12      40   20    90%                    4.5   -0.07
 *   pitch        20      63   32    96%                    3.0   -0.10
 *   timing       12      40   20    64%                    3.1   -0.17
 *   timing       16      52   26    78%                    3.0   -0.05
 *   lossy/pb1    16      52   26    51%                    1.9   +0.19
 *   lossy/pb4    16      52   26    70%                    2.6   -0.09
 *   lossy/pb6    20      64   32    48%                    1.5   +0.21
 *
 * Two things fall out. Pitch is being OVERCHARGED — it buys its 77% band in 14
 * minutes and then spends six more for thirteen points. Lossy is being
 * UNDERCHARGED — its curve is still climbing steeply at 20 minutes. And short
 * sessions are not merely coarse, they are WRONG: pitch at 4 reversals is off
 * by -0.86 ladder steps, timing at 6 by -1.65. Cheap and biased is the worst
 * cell in the table, so the rate cannot be maximised on its own.
 *
 * THE SELECTION RULE, stated before the numbers were read off it: take the
 * SMALLEST budget whose bias is within 0.2 ladder steps, among those within 10%
 * of that family's peak information-per-minute. Applied, it gives 8 / 12 / 16
 * below — and it drops pb6, which has no budget meeting the bias bar at all and
 * whose best rate is a third of pitch's.
 *
 * A WIDTH-BASED STOPPING RULE WAS BUILT FIRST AND MEASURED WORSE. Stopping when
 * the posterior stops narrowing sounds like the principled version of this, and
 * it lost to a fixed budget on four of five ladders: a single flat window fired
 * spuriously (pitch fell to 83% band while taking LONGER), and requiring two
 * flat windows in a row never fired at all, running every session to the
 * 80-trial ceiling. The reversal count is already an information criterion —
 * reversals only accumulate when the staircase is oscillating near threshold —
 * and it is a better one than the width of an interval measured every 8 trials.
 */
interface FamilyBudget {
  /** Reversals the session stops after — the measured budget. */
  reversals: number;
  /**
   * Median trials that budget actually takes, MEASURED over 900 simulated
   * sessions per family (E5/S4). It cannot be derived — how many trials a
   * reversal costs depends on the ladder and the listener — so it is stored,
   * and `staircase-session.test.ts` re-measures it against this value rather
   * than trusting it to stay true.
   */
  medianTrials: number;
}

const FAMILY_BUDGET: Record<string, FamilyBudget> = {
  "pitch-drift": { reversals: 8, medianTrials: 27 },
  "timing-smear": { reversals: 12, medianTrials: 40 },
  "lossy-artifact": { reversals: 16, medianTrials: 52 },
};

/** Ceiling so a session that never converges still ends. ~40 min of listening. */
export const MAX_GYM_TRIALS = 80;

/**
 * WHAT A TRIAL COSTS A PERSON, in one place.
 *
 * Two clips, each gated at a minimum listen, times a factor for the taps and
 * replays a real session adds on top. The factor and the gate are the same ones
 * `DelicacyFlow` derived its own estimate from; they live here because the
 * session budget above was CHOSEN by information-per-minute, so the minutes are
 * part of the budget's justification rather than a display detail.
 */
export const MIN_LISTEN_MS_PER_CLIP = 8000;
export const CLIPS_PER_TRIAL = 2;
/** Real sessions run longer than the forced-listening floor. Measured 2026-08-08. */
export const REPLAY_FACTOR = 1.9;

function budgetFor(family: string): FamilyBudget {
  const b = FAMILY_BUDGET[family];
  if (!b) throw new Error(`staircase: no measured session budget for family "${family}"`);
  return b;
}

export function reversalsFor(family: string): number {
  return budgetFor(family).reversals;
}

export function medianTrialsFor(family: string): number {
  return budgetFor(family).medianTrials;
}

/**
 * How long this family's session takes, in minutes.
 *
 * THE ONE DEFINITION. This number was written down three times — as
 * `ESTIMATED_MINUTES` in the flow, as a `MEDIAN_TRIALS` lookup plus its own
 * arithmetic on the picker, and in the budget docstring here. Three copies of a
 * fact is the defect this repo has hit at the rung table, the window plan and
 * the damage field; it is not less of one because the fact is a duration.
 */
export function sessionMinutes(family: string): number {
  const seconds = medianTrialsFor(family) * CLIPS_PER_TRIAL * (MIN_LISTEN_MS_PER_CLIP / 1000) * REPLAY_FACTOR;
  return Math.round(seconds / 60);
}

export function configFor(axis: StaircaseAxis): StaircaseConfig {
  if (axis.magnitudes.length < START_FROM_TOP + 1) {
    throw new Error(
      `configFor: "${axis.family}" has only ${axis.magnitudes.length} rungs — too few to start ${START_FROM_TOP} from the top`,
    );
  }
  return {
    ...DEFAULT_STAIRCASE,
    levels: axis.magnitudes,
    startIndex: axis.magnitudes.length - START_FROM_TOP,
    stopAfterReversals: reversalsFor(axis.family),
    maxTrials: MAX_GYM_TRIALS,
  };
}

export interface StaircaseSession {
  family: string;
  sourceId?: string;
  seed: number;
  axis: StaircaseAxis;
  config: StaircaseConfig;
  /** The windows this session may draw from — from `sessionInstances`, always. */
  instances: TrialInstance[];
  state: StaircaseState;
  /** levelIndex -> presentations ALREADY ANSWERED at that level. */
  visits: Readonly<Record<number, number>>;
}

/**
 * Whether the session is over.
 *
 * A one-line accessor on purpose: it is the seam every surface asks through, so
 * that "when does a session end" has one answer. A width-based stopping rule
 * lived behind it briefly and was measured worse than the reversal budget
 * (see `REVERSALS_BY_FAMILY`); the seam is kept because the UI should not be
 * reaching into `state` to find out, and because the next thing to try lands
 * here rather than in five components.
 */
export function isFinished(session: StaircaseSession): boolean {
  return session.state.finished;
}

/**
 * Which recording a lossy session runs on, for a given seed.
 *
 * Deterministic so a session is reproducible from its seed alone, and exposed
 * so the surface can NAME the source before the session starts. A lossy
 * threshold is a fact about the listener and the material together (RT-85a);
 * a surface that picked silently would be hiding half the claim.
 */
export function pickSourceForSeed(family: string, seed: number): string | undefined {
  if (!isSourceLocked(family)) return undefined;
  const sources = eligibleSources(family);
  return sources[Math.abs(seed) % sources.length];
}

/** Guard so a retired source cannot be reached by passing it in by hand. */
function assertShippable(family: string, sourceId?: string) {
  if (sourceId && isRetiredSource(family, sourceId)) {
    throw new Error(
      `startSession: "${sourceId}" is retired from ${family} — its ladder cannot be measured honestly ` +
        `in a session of any tolerable length (RT-92a)`,
    );
  }
}

export function startSession(family: string, seed: number, sourceId?: string): StaircaseSession {
  assertShippable(family, sourceId);
  const locked = isSourceLocked(family) ? (sourceId ?? pickSourceForSeed(family, seed)) : undefined;
  const axis = axisFor(family, locked);
  const config = configFor(axis);
  return {
    family,
    sourceId: locked,
    seed,
    axis,
    config,
    // The ONLY sanctioned source of windows. Never a hand-written list.
    instances: sessionInstances(family, locked),
    state: startStaircase(config),
    visits: {},
  };
}

export interface StaircaseTrialPresentation {
  /** 1-based, for display and for the side hash. */
  trialNumber: number;
  levelIndex: number;
  /** The rung in the family's own unit — 96 kbps, 25 cents, 31.5 ms. */
  label: number;
  unit: string;
  instance: TrialInstance;
  reference: StaircaseReference;
  degraded: StaircaseClip;
  /** Which of the two players holds the DAMAGED clip. */
  degradedSide: "a" | "b";
  srcA: string;
  srcB: string;
}

/**
 * Which side the damaged clip sits on.
 *
 * Hashed from (seed, trial) rather than alternated: an alternating pattern is
 * learnable within a dozen trials, and a listener who learns it stops answering
 * with their ears. Hashed rather than drawn from a running PRNG so that the
 * assignment for trial 20 does not depend on how many times React re-rendered
 * trial 19.
 */
function sideHash(seed: number, trialNumber: number): number {
  let h = (seed ^ 0x27d4eb2f) + Math.imul(trialNumber + 1, 0x165667b1);
  h = Math.imul(h ^ (h >>> 15), 0x2545f491);
  h ^= h >>> 13;
  return h >>> 0;
}

export function degradedSideFor(seed: number, trialNumber: number): "a" | "b" {
  return sideHash(seed, trialNumber) & 1 ? "b" : "a";
}

/**
 * The trial to present now. Idempotent: calling it twice without an answer in
 * between returns the same clips, because the visit count only moves on `answer`.
 * A React surface will call this on every render.
 */
export function nextTrial(session: StaircaseSession): StaircaseTrialPresentation {
  if (isFinished(session)) throw new Error("nextTrial: this session has finished");
  const levelIndex = session.state.currentIndex;
  const label = session.axis.labels[levelIndex];
  const visit = session.visits[levelIndex] ?? 0;
  const instance = pickInstance(levelIndex, visit, session.instances, session.seed);
  const reference = referenceFor(instance.sourceId, instance.startSec);
  const degraded = clipFor(session.family, instance.sourceId, instance.startSec, label);
  const trialNumber = session.state.trials.length + 1;
  const degradedSide = degradedSideFor(session.seed, trialNumber);
  return {
    trialNumber,
    levelIndex,
    label,
    unit: session.axis.unit,
    instance,
    reference,
    degraded,
    degradedSide,
    srcA: degradedSide === "a" ? degraded.url : reference.url,
    srcB: degradedSide === "a" ? reference.url : degraded.url,
  };
}

/** Fold one answer in. Pure: returns a new session, never mutates. */
export function answer(session: StaircaseSession, correct: boolean): StaircaseSession {
  if (isFinished(session)) return session;
  const levelIndex = session.state.currentIndex;
  const state = recordResponse(session.state, correct, session.config);
  const next: StaircaseSession = {
    ...session,
    state,
    visits: { ...session.visits, [levelIndex]: (session.visits[levelIndex] ?? 0) + 1 },
  };

  return next;
}

/** True when the listener picked the player holding the damaged clip. */
export function isCorrectPick(trial: StaircaseTrialPresentation, picked: "a" | "b"): boolean {
  return picked === trial.degradedSide;
}

export interface BandRung {
  /** The rung in the family's own unit. */
  label: number;
  /** How many trials this session actually spent here. */
  shown: number;
  correct: number;
}

/**
 * WHAT THE SESSION CAN SAY WITHOUT INTERPOLATING (PM ruling RT-90a b, E5/S3).
 *
 * THE PROBLEM IT SOLVES. At the ~20-minute session length, `fitThreshold`
 * declines to print a point estimate on 68% of timing sessions and 91-95% of
 * lossy ones, because ~39 two-alternative trials buy about x4.5 of uncertainty
 * and those ladders are only 3.5x to 6x wide. The refusal is CORRECT — you
 * cannot resolve a ladder to finer than its own width in that many trials.
 *
 * BUT REPORTING ONLY THE SURVIVORS IS WORSE THAN REPORTING NOTHING, and E5/S2
 * measured why: refusing per session selects on having produced a narrow
 * posterior, and that selection is correlated with the answer. pb4's survivors
 * came back 0.54 ladder steps too sensitive, against 0.04-0.11 for the same
 * ladder at a length where it never refuses. A selected few getting a
 * flattering number, with nothing on screen to distinguish them, is exactly the
 * failure N3 exists to prevent.
 *
 * THE MOVE IS TO STOP SELECTING. The interval was never the contested part —
 * R4 measured its coverage at 94-100% while the POINT was what it argued
 * about. So every session reports its interval, quantised outward to the rungs
 * the pipeline can actually render, and only the interpolated point is
 * withheld. There is no per-session decision left to select on.
 *
 * WHAT A READER GETS: two rungs and the evidence behind them — "you caught the
 * damage at 64 kbps; at 160 kbps you were guessing" — in physical units, at the
 * resolution the instrument genuinely has. Coarser than a number, and true.
 */
export interface ThresholdBand {
  /** Every rung, gentlest first, with what this listener did at each. */
  rungs: BandRung[];
  /**
   * The gentlest manipulation the session can say was reliably heard, in the
   * family's unit. `null` when even the harshest rung was not — the ear is
   * outside what the instrument can show.
   */
  heardAt: number | null;
  /** The largest manipulation the session can say was MISSED. */
  missedAt: number | null;
  heardIndex: number | null;
  missedIndex: number | null;
}

/**
 * The band, for any session — including one the fitter refused to score.
 *
 * `heardAt` is the gentlest rung sitting entirely above the posterior interval,
 * `missedAt` the harshest sitting entirely below it. The true threshold lies
 * between them by construction, so the pair inherits the interval's coverage
 * rather than needing a coverage argument of its own; quantising outward to
 * rungs can only ever widen it.
 */
/**
 * THE TAIL THE BAND IS DRAWN AT, and it is not the fitter's 95%.
 *
 * MEASURED (E5/S3, 600 sessions x 3 listener placements x 5 ladders). At the
 * 95% interval the band is so wide that on pb6 — a 3.5x ladder — NO rung falls
 * outside it in 79% of sessions, so the band says nothing at all. That is the
 * ladder-width problem again, one level up.
 *
 * The pre-registered criterion is what licenses moving it: the band must
 * BRACKET THE TRUE THRESHOLD at least 90% of the time. Quantising outward to
 * whole rungs adds coverage back, because a rung is only named if it lies
 * entirely outside the interval. The table in staircase-session.test.ts is the
 * evidence; the value below is whatever cleared that bar with the most rungs
 * actually named.
 */
export const BAND_TAIL = 0.1;

export function sessionBand(session: StaircaseSession, tail = BAND_TAIL): ThresholdBand {
  const { axis, state, config } = session;
  const shown = new Array<number>(axis.labels.length).fill(0);
  const correct = new Array<number>(axis.labels.length).fill(0);
  for (const t of state.trials) {
    shown[t.index]++;
    if (t.correct) correct[t.index]++;
  }
  const rungs: BandRung[] = axis.labels.map((label, i) => ({ label, shown: shown[i], correct: correct[i] }));

  const posterior = isFinished(session) ? fitPosterior(state, config, tail) : null;
  let heardIndex: number | null = null;
  let missedIndex: number | null = null;
  if (posterior) {
    for (let i = 0; i < config.levels.length; i++) {
      const logLevel = Math.log(config.levels[i]);
      // The gentlest rung entirely above the interval — the first one found,
      // since the ladder is ascending in difficulty-magnitude.
      if (heardIndex === null && logLevel >= posterior.logHi) heardIndex = i;
      // The harshest rung entirely below it — keep overwriting, so the last
      // one that qualifies wins.
      if (logLevel <= posterior.logLo) missedIndex = i;
    }
  }
  return {
    rungs,
    heardIndex,
    missedIndex,
    heardAt: heardIndex === null ? null : axis.labels[heardIndex],
    missedAt: missedIndex === null ? null : axis.labels[missedIndex],
  };
}

interface ResultBase {
  family: string;
  /** Named for lossy. A threshold there is a fact about the material too (N3). */
  sourceId?: string;
  unit: string;
  direction: LadderDirection;
  trials: number;
  /**
   * The ladder's reach, in the family's own unit — what the instrument could
   * have rendered. `gentlest` is the smallest manipulation, whichever way the
   * numbers run.
   */
  gentlest: number;
  harshest: number;
  /** What the pipeline measured and could not fix (RT-85a's condition). */
  limits: KnownLimit[];
  /**
   * ALWAYS PRESENT, on every outcome kind (PM ruling RT-90a b). This is what a
   * reader is shown when the fitter declines to interpolate, and it carries the
   * per-rung evidence even when it does not.
   */
  band: ThresholdBand;
  /**
   * N3, structurally. There are ZERO real responses; nothing here is a
   * percentile, a norm, or a comparison to anybody.
   */
  cohortN: 0;
}

export type StaircaseResult =
  | (ResultBase & { kind: "threshold"; label: number; ci95: [number, number]; reversalsUsed: number })
  /** More sensitive than the gentlest rung we can render. Not a number. */
  | (ResultBase & { kind: "below"; boundLabel: number })
  /** Missed it even at the harshest rung we can render. Not a number. */
  | (ResultBase & { kind: "above"; boundLabel: number })
  | (ResultBase & { kind: "inconclusive"; reversalsUsed: number });

/**
 * AN UNFINISHED SESSION MAKES NO CLAIM, and this belongs here rather than in the
 * estimator (E5/S2, 2026-08-20).
 *
 * MEASURED: `fitThreshold` on one to six coin-flip answers returns `"above"` —
 * a couple of wrong answers near the top push the posterior median past the
 * ceiling before anything has constrained it, and "above the ceiling" reads as
 * a finding about the listener. It is a real hazard and it is NOT the
 * estimator's to fix: the estimator's job is to say what the responses imply,
 * and on three responses that genuinely is "probably insensitive". The rule
 * that a PRODUCT may not report a half-finished session is a property of the
 * surface, so it is enforced at the surface's own boundary.
 */
export function sessionResult(session: StaircaseSession): StaircaseResult {
  const { axis, state, config } = session;
  const flip = (m: number) => flipAxis(axis.direction, m);
  const outcome = isFinished(session)
    ? fitThreshold(state, config)
    : ({
        kind: "inconclusive",
        reversalsUsed: Math.min(state.reversalIndices.length, config.useLastReversals),
        trials: state.trials.length,
      } as const);
  const base: ResultBase = {
    family: session.family,
    sourceId: session.sourceId,
    unit: axis.unit,
    direction: axis.direction,
    trials: outcome.trials,
    gentlest: axis.labels[0],
    harshest: axis.labels[axis.labels.length - 1],
    limits: knownLimits(session.family, session.sourceId),
    band: sessionBand(session),
    cohortN: 0,
  };

  switch (outcome.kind) {
    case "threshold": {
      // The interval's ENDS SWAP on an inverted axis: the magnitude the listener
      // is least sensitive to maps to the highest bitrate. Sorting rather than
      // hand-ordering, so neither direction needs a special case.
      const ends = outcome.ci95.map(flip).sort((a, b) => a - b) as [number, number];
      return { ...base, kind: "threshold", label: flip(outcome.threshold), ci95: ends, reversalsUsed: outcome.reversalsUsed };
    }
    case "below":
      return { ...base, kind: "below", boundLabel: flip(outcome.bound) };
    case "above":
      return { ...base, kind: "above", boundLabel: flip(outcome.bound) };
    case "inconclusive":
      return { ...base, kind: "inconclusive", reversalsUsed: outcome.reversalsUsed };
  }
}
