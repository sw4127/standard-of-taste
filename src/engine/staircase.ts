/**
 * Adaptive staircase — the threshold instrument's engine (E3, 2026-08-15).
 *
 * WHAT IT IS FOR. The fixed assessment reports "12 of 15", which tells a person
 * almost nothing they can act on. The deliverable of record is a PER-FLAW
 * SENSITIVITY THRESHOLD IN PHYSICAL UNITS (CLAUDE.md, D4 amendment): "you
 * reliably hear pitch drift at 40 cents and miss it at 25". Getting there means
 * choosing each trial's difficulty from how the previous ones went, converging
 * on the level where the listener is right some fixed fraction of the time.
 *
 * THE RULE: 2-down / 1-up. Two consecutive correct answers make the next trial
 * HARDER (a smaller manipulation); one wrong answer makes it easier. That rule
 * converges on the level where P(correct) = 0.707, which is the standard choice
 * for a two-alternative task — high enough above the 50% guessing floor to be
 * informative, low enough to reach quickly.
 *
 * EVERYTHING IS INDEXED INTO A GEOMETRIC LADDER. The ladders in
 * scripts/clip-pipeline/rungs.mjs are constant-ratio by construction, so moving
 * one index is the same proportional change wherever it happens. That is what
 * makes "one step" a meaningful unit, and it is why the threshold is averaged
 * in LOG space below — an arithmetic mean of geometric levels would be pulled
 * toward the loud end.
 *
 * HONESTY, and it is the part most likely to be quietly dropped (N3):
 *
 *   A STAIRCASE THAT HITS THE END OF ITS LADDER HAS NOT MEASURED A THRESHOLD.
 *   If someone answers correctly at the gentlest level the pipeline can render,
 *   their threshold is somewhere below it and we do not know where. That is a
 *   BOUND, not a number, and `estimateThreshold` returns it as one. Reporting
 *   the floor as though it were the answer would systematically flatter the
 *   best listeners, which is exactly the direction that would go unnoticed.
 *
 * ZERO randomness lives here. The engine is a pure function of the response
 * history, so a session can be replayed exactly from its answers — the same
 * property the rest of src/engine/ has, and the reason share URLs can carry raw
 * responses rather than conclusions.
 */

/** Ascending magnitudes in a family's physical unit (cents, ms, dB). */
export interface StaircaseConfig {
  levels: number[];
  /** Where the first trial sits. Mid-to-high: obvious enough to teach the task. */
  startIndex: number;
  /** Levels moved per step BEFORE the first reversal — big steps close distance fast. */
  bigStep: number;
  /** Levels moved per step after the first reversal. */
  step: number;
  /** Consecutive correct answers required to make the task harder. 2 = 70.7%. */
  downRule: number;
  /** Stop once this many reversals have happened. Even number: they pair up. */
  stopAfterReversals: number;
  /** Hard ceiling so a session cannot run forever if it never converges. */
  maxTrials: number;
  /** Reversals averaged for the estimate. The early ones are still descending. */
  useLastReversals: number;
}

export const DEFAULT_STAIRCASE: Omit<StaircaseConfig, "levels" | "startIndex"> = {
  bigStep: 2,
  step: 1,
  downRule: 2,
  /**
   * 12, not 8. MEASURED (staircase.test.ts): at 8 reversals the recovery RMSE
   * was 1.05-1.59 ladder steps — on the pitch ladder a step is sqrt(2), so a
   * typical estimate was off by a factor of ~1.6, which is not a threshold
   * anybody should act on. Reversals are what the estimate averages over, and
   * they are the cheapest precision available.
   */
  stopAfterReversals: 12,
  maxTrials: 70,
  /** Early reversals are still descending toward the threshold; drop them. */
  useLastReversals: 8,
};

export interface StaircaseTrial {
  index: number;
  correct: boolean;
}

export interface StaircaseState {
  trials: StaircaseTrial[];
  /** Ladder indices at which the direction changed. */
  reversalIndices: number[];
  currentIndex: number;
  consecutiveCorrect: number;
  /** null until the first move; "down" = toward a smaller manipulation. */
  lastDirection: "up" | "down" | null;
  /** Trials that wanted to go past an end of the ladder and could not. */
  floorHits: number;
  ceilingHits: number;
  finished: boolean;
}

export function startStaircase(config: StaircaseConfig): StaircaseState {
  if (config.levels.length < 2) throw new Error("staircase: need at least two levels");
  if (config.startIndex < 0 || config.startIndex >= config.levels.length) {
    throw new Error(`staircase: startIndex ${config.startIndex} outside 0..${config.levels.length - 1}`);
  }
  return {
    trials: [],
    reversalIndices: [],
    currentIndex: config.startIndex,
    consecutiveCorrect: 0,
    lastDirection: null,
    floorHits: 0,
    ceilingHits: 0,
    finished: false,
  };
}

/** The magnitude to present next, in the family's physical unit. */
export function currentLevel(state: StaircaseState, config: StaircaseConfig): number {
  return config.levels[state.currentIndex];
}

/**
 * Fold one answer into the run. Pure: returns a new state, never mutates.
 *
 * Step size shrinks after the first reversal — big steps to get near the
 * threshold, small steps to resolve it. Running the whole session at the small
 * step wastes trials walking; running it all at the big step never resolves.
 */
export function recordResponse(
  state: StaircaseState,
  correct: boolean,
  config: StaircaseConfig,
): StaircaseState {
  if (state.finished) return state;

  const trials = [...state.trials, { index: state.currentIndex, correct }];
  const consecutiveCorrect = correct ? state.consecutiveCorrect + 1 : 0;

  let direction: "up" | "down" | null = null;
  if (!correct) direction = "up"; // missed it — make it easier
  else if (consecutiveCorrect >= config.downRule) direction = "down"; // make it harder

  let { currentIndex, floorHits, ceilingHits, lastDirection } = state;
  const reversalIndices = [...state.reversalIndices];

  if (direction) {
    // A reversal is a change of direction, so it cannot be detected on the
    // first move — there is nothing yet to have reversed from.
    if (lastDirection && direction !== lastDirection) reversalIndices.push(currentIndex);
    const stepSize = reversalIndices.length === 0 ? config.bigStep : config.step;
    const wanted = direction === "down" ? currentIndex - stepSize : currentIndex + stepSize;
    const clamped = Math.max(0, Math.min(config.levels.length - 1, wanted));
    if (wanted < 0) floorHits++;
    if (wanted > config.levels.length - 1) ceilingHits++;
    currentIndex = clamped;
    lastDirection = direction;
  }

  return {
    trials,
    reversalIndices,
    currentIndex,
    consecutiveCorrect: direction === "down" ? 0 : consecutiveCorrect,
    lastDirection,
    floorHits,
    ceilingHits,
    finished:
      reversalIndices.length >= config.stopAfterReversals || trials.length >= config.maxTrials,
  };
}

export type ThresholdOutcome =
  /** Converged: `threshold` is a number in the family's unit. */
  | { kind: "threshold"; threshold: number; ci95: [number, number]; reversalsUsed: number; trials: number }
  /** Never missed at the gentlest level — the answer is below the ladder. */
  | { kind: "below"; bound: number; trials: number }
  /** Never right even at the strongest — the answer is above the ladder. */
  | { kind: "above"; bound: number; trials: number }
  /** Stopped before enough reversals to say anything. */
  | { kind: "inconclusive"; reversalsUsed: number; trials: number };

/**
 * SUPERSEDED FOR PRODUCT SURFACES by `fitThreshold` in ./threshold-fit.ts
 * (R4, 2026-08-15). Retained because it is the baseline every recovery
 * comparison is scored against, and because it is a genuinely hard baseline —
 * it was NOT beaten on precision. Do not wire this into a surface.
 *
 * THE REASON IT LOST, in one line: this interval covers the truth 49-72% of the
 * time while printing 95% (measured, staircase-criterion.test.ts). A 95%
 * interval that covers 60% is a false statement beside every result (N3).
 * `fitThreshold` covers 94-100%, and 94-98% even when the psychometric model is
 * wrong. It also escapes the ladder-end truncation this estimator cannot: a
 * reversal average can never report a level the ladder does not contain, which
 * R2 measured at +0.499 steps of bias for a floor-adjacent listener.
 *
 * ---
 *
 * The threshold, or an honest statement that there isn't one.
 *
 * Averaged in LOG space because the ladder is geometric: the midpoint of 25 and
 * 50 cents is 35.4, not 37.5, and using the arithmetic mean would bias every
 * threshold upward — toward saying people hear worse than they do.
 *
 * The confidence interval is the standard error of those log-levels, which
 * describes the SPREAD OF THE REVERSALS ONLY. It is not a population interval
 * and there is no cohort to draw one from (N3).
 */
export function estimateThreshold(state: StaircaseState, config: StaircaseConfig): ThresholdOutcome {
  const trials = state.trials.length;
  const floor = config.levels[0];
  const top = config.levels[config.levels.length - 1];

  /**
   * DEGENERATE RUNS, handled before anything is averaged. A listener who never
   * misses never changes direction, so they produce NO reversals at all — and
   * an ordering that checks the reversal count first answers "inconclusive" for
   * the one case we can actually be certain about. `floorHits` counts the times
   * the staircase tried to step below the ladder and could not, which is the
   * direct evidence that the answer lies past the end.
   */
  const pinnedLow = state.trials.filter((t) => t.index === 0);
  const pinnedHigh = state.trials.filter((t) => t.index === config.levels.length - 1);
  if (state.reversalIndices.length < 2) {
    if (state.floorHits > 0 && pinnedLow.filter((t) => t.correct).length > pinnedLow.length / 2) {
      return { kind: "below", bound: floor, trials };
    }
    if (state.ceilingHits > 0 && pinnedHigh.filter((t) => !t.correct).length > pinnedHigh.length / 2) {
      return { kind: "above", bound: top, trials };
    }
  }

  const used = state.reversalIndices.slice(-config.useLastReversals);
  if (used.length < 2) return { kind: "inconclusive", reversalsUsed: used.length, trials };

  const logs = used.map((i) => Math.log(config.levels[i]));
  const mean = logs.reduce((a, b) => a + b, 0) / logs.length;

  /**
   * LADDER-END CASES. A ladder cannot resolve past its own ends: if the
   * reversals average to within half a step of the floor, "their threshold is
   * the floor" and "their threshold is somewhere below it" produce the same
   * data, and only one of those is a number we may print.
   *
   * MEASURED, and this is the second version of this check. The first asked
   * whether every trial at the floor was correct — which sounds equivalent and
   * is not: on a simulated listener whose true threshold sat well BELOW the
   * ladder, one unlucky miss out of twenty floor trials flipped it, and it
   * reported a confident number in 65 of 100 sessions. A guard against
   * over-claiming that fails two thirds of the time is worse than none, because
   * its presence is what stops anyone looking. Proximity to the end is the
   * property that actually matters, so it is what gets tested.
   */
  const halfStep = 0.5 * Math.abs(Math.log(config.levels[1] / config.levels[0]));
  if (mean <= Math.log(floor) + halfStep) return { kind: "below", bound: floor, trials };
  if (mean >= Math.log(top) - halfStep) return { kind: "above", bound: top, trials };

  const variance = logs.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, logs.length - 1);
  const se = Math.sqrt(variance / logs.length);
  return {
    kind: "threshold",
    threshold: Math.exp(mean),
    ci95: [Math.exp(mean - 1.96 * se), Math.exp(mean + 1.96 * se)],
    reversalsUsed: used.length,
    trials,
  };
}
