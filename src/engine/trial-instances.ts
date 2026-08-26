/**
 * WHICH RECORDING A TRIAL USES (E4/S2c, PM ruling RT-69, 2026-08-15).
 *
 * E4/S2 measured the thing this exists to fix: across 2000 simulated sessions,
 * the most-visited level carries a MEDIAN OF 12 TRIALS and a p90 of 16. That is
 * not a flaw in the staircase — parking near the threshold is why it converges —
 * but it means a level that owns one audio file gets that same file played a
 * dozen times to the same listener in one sitting.
 *
 * What goes wrong then is specific, and it is the arc's core claim: after the
 * third or fourth encounter the listener can recognise the CLIP rather than
 * hearing the FLAW. Their score improves for a reason that has nothing to do
 * with their ear, and the retest — whose entire job is detecting whether the ear
 * moved — reports it as movement (D4 amendment, N3).
 *
 * RENDERING MORE WINDOWS IS NECESSARY AND NOT SUFFICIENT. The approved plan
 * (RT-66) gives 9 instances: 3 sources x 3 windows. Picking among them at random
 * wastes most of that — with 9 instances and 12 draws, the expected number of
 * DISTINCT clips is only about 6.8, so a third of the budget is never heard and
 * some clip still lands four or five times. Cycling uses every instance before
 * repeating any, which is the whole difference between a 99 MB render that buys
 * validity and one that buys less than it looks like.
 *
 * DETERMINISTIC, like everything else in src/engine/. The instance is a pure
 * function of (level, how many times this level has already been shown, session
 * seed), so a session replays exactly from its responses and a share URL can
 * carry raw answers rather than conclusions.
 */

import { eligibleWindows, isSourceLocked } from "./staircase-pool";

/** One rendered (source, window) pair — a specific musical moment on disk. */
export interface TrialInstance {
  sourceId: string;
  startSec: number;
}

/**
 * A stable, well-mixed offset per (level, session). Without it every session
 * would start each level at instance 0, so the first trial a listener ever sees
 * at a given level is always the same recording — a pattern that survives
 * across the retest arc, which is exactly where it would do damage.
 */
function levelOffset(levelIndex: number, seed: number, n: number): number {
  let h = (seed ^ 0x9e3779b9) + Math.imul(levelIndex + 1, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 15), 0xc2b2ae35);
  h ^= h >>> 13;
  return ((h % n) + n) % n;
}

/**
 * The instance for the `visitCount`-th presentation of a level (0-based).
 *
 * ROUND-ROBIN, NOT RANDOM. The first `instances.length` visits to a level are
 * guaranteed distinct; only after every instance has been used does any repeat,
 * and then uniformly. That is the best any fixed budget can do, and it is a
 * property worth having deterministically rather than in expectation.
 */
export function pickInstance(
  levelIndex: number,
  visitCount: number,
  instances: TrialInstance[],
  seed: number,
): TrialInstance {
  if (!instances.length) throw new Error("pickInstance: no instances rendered for this family");
  const i = (levelOffset(levelIndex, seed, instances.length) + visitCount) % instances.length;
  return instances[i];
}

/**
 * Walk a whole session's level sequence and assign an instance to each trial.
 * Counting visits is the caller's job otherwise, and getting it wrong silently
 * degrades to random — so it is done here, once.
 */
export function assignInstances(
  levelSequence: number[],
  instances: TrialInstance[],
  seed: number,
): TrialInstance[] {
  const seen = new Map<number, number>();
  return levelSequence.map((levelIndex) => {
    const visit = seen.get(levelIndex) ?? 0;
    seen.set(levelIndex, visit + 1);
    return pickInstance(levelIndex, visit, instances, seed);
  });
}

/**
 * The instances a family may draw from.
 *
 * LOSSY IS SOURCE-LOCKED (PM ruling RT-65). Its ladder is built from the
 * bitrates the encoder has and labelled with the damage measured on that
 * material, so a level means something different on a different recording and a
 * session must stay on one source. Pitch and timing have manipulation-intrinsic
 * units — a cent is a cent — so they pool across every source and get three
 * times the variety for free.
 *
 * The practical consequence is uncomfortable and should not be smoothed over: a
 * lossy session draws from 3 instances against a repeat load of 12, so its
 * clips repeat about four times each where pitch and timing repeat once or
 * twice. Lossy needs more windows than the other two families to reach the same
 * validity, and the approved plan does not give it any.
 */
export function instancesForFamily(
  family: string,
  all: TrialInstance[],
  lockedSourceId?: string,
): TrialInstance[] {
  if (!isSourceLocked(family)) return all;
  if (!lockedSourceId) throw new Error("staircase pool: lossy sessions must name a source (RT-65)");
  const locked = all.filter((i) => i.sourceId === lockedSourceId);
  if (!locked.length) {
    // The available sources come from `all`, which this function already holds —
    // so the helpful message costs nothing and does not need a second parameter.
    const have = [...new Set(all.map((i) => i.sourceId))].sort().join(", ");
    throw new Error(`staircase pool: no eligible windows for source "${lockedSourceId}" (have: ${have})`);
  }
  return locked;
}

/**
 * The instances one SESSION may use — the pool, narrowed to a single source for
 * lossy.
 *
 * A lossy level is a bitrate, and the damage a bitrate does depends entirely on
 * the material (RT-85a), so a session that mixed sources would be stepping a
 * ladder whose rungs changed size underneath it.
 */
export function sessionInstances(family: string, lockedSourceId?: string): TrialInstance[] {
  // E7/S25: MOVED HERE FROM staircase-pool, and reduced to what it always was.
  // It used to repeat `instancesForFamily`'s filtering line for line — two
  // functions with one rule between them, and two tests pinning two different
  // error strings for the same condition, which is how you could tell.
  //
  // It lives on this side because the dependency already ran this way:
  // trial-instances imports from staircase-pool, so pool calling back would
  // have been a cycle. The composition is the only thing that was ever
  // specific to it.
  return instancesForFamily(family, eligibleWindows(family), lockedSourceId);
}
