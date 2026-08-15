/**
 * THE SIMULATED LISTENER for threshold instruments (R1/R2, 2026-08-15).
 *
 * Extracted from staircase.test.ts because a second file now needs it, and the
 * alternative — a copy — is the exact failure `scripts/clip-pipeline/rungs.mjs`
 * exists to document: two tables that agreed until one was edited, with nothing
 * downstream able to see the disagreement.
 *
 * WHY THIS IS NOT `simulate.ts`'s MODEL, and why they are deliberately not
 * merged. `simulate.ts` is 2PL-with-fixed-guessing on the IRT theta/b scale: a
 * person has an ability, an ITEM has a difficulty, and probability is a function
 * of their difference. That is the right model for a fixed pool of discrete
 * items and it is what the IRT and recovery pipelines are proven against.
 *
 * A staircase needs something else: probability as a function of a CONTINUOUS
 * PHYSICAL MAGNITUDE — cents, milliseconds, decibels — because the whole point
 * is to move along that axis and find where the listener stops hearing. There is
 * a mapping between the two scales, but forcing one module to serve both would
 * put a refactor of the proven IRT path inside a slice about staircase bias.
 * They are separate on purpose. Do not "unify" them without a reason better
 * than tidiness (N2).
 *
 * SIMULATED, always. There are zero real responses; anything computed from this
 * module carries the badge wherever it surfaces (N3).
 */
import {
  estimateThreshold,
  recordResponse,
  startStaircase,
  type StaircaseConfig,
  type StaircaseState,
} from "@/engine/staircase";
/**
 * Chance performance on a two-alternative task. Not a free parameter: someone
 * who hears nothing still gets half right, and any simulation that forgets this
 * makes every estimator look better than it is.
 */
export const GUESS = 0.5;

/**
 * Where 2-down/1-up converges: the level at which P(correct)^2 = 0.5, because
 * the rule descends only on two consecutive correct answers. That is exactly
 * 1/sqrt(2), and it is written as `Math.SQRT1_2` rather than typed out because
 * an earlier version used the ROUNDED pair 0.414/0.586 in a hand-solved
 * formula. Immaterial in size (~0.001 ladder steps) and precisely the "typed
 * numbers rot" pattern this repo keeps paying for.
 */
export const P_CONVERGE = Math.SQRT1_2;

/**
 * A simulated listener.
 *
 * `alpha` is their 75%-correct point in the family's physical unit; `beta` is
 * the slope in log units (smaller = sharper transition from guessing to
 * hearing).
 *
 * `lapse` is the ERROR RATE AT ASYMPTOTE — how often they get it wrong at a
 * level they can plainly hear, through a mis-click, a lapse of attention, or
 * thirty-eight trials of fatigue. Real listeners have one; textbook simulated
 * ones do not, and a staircase validated only against the textbook version has
 * been validated against a listener who does not exist.
 *
 * It enters as a CEILING on the curve, not as noise sprinkled on the answers:
 * P tops out at 1 - lapse however loud the manipulation gets. That matters to a
 * descending staircase, because the track can only be driven upward by errors,
 * and a listener who errs at the easy end supplies them forever.
 */
export interface Observer {
  alpha: number;
  beta: number;
  lapse: number;
}

/** Shorthand; `lapse` defaults to the textbook listener who never slips. */
export const observer = (alpha: number, beta: number, lapse = 0): Observer => ({ alpha, beta, lapse });

export const pCorrect = (x: number, o: Observer) =>
  GUESS + (1 - GUESS - o.lapse) / (1 + Math.exp(-(Math.log(x) - Math.log(o.alpha)) / o.beta));

/**
 * The level where this observer is correct `target` of the time — SOLVED
 * NUMERICALLY AGAINST `pCorrect` ITSELF rather than by a second, hand-derived
 * formula.
 *
 * There IS a closed form, even with a lapse term, and using it would be the
 * mistake described in this file's header. A target computed from an algebraic
 * re-derivation of the observer measures the agreement between two of my own
 * derivations. A target computed by inverting the observer function cannot
 * disagree with the observer. The closed form is still checked, once, as a test
 * — which is the right place for it.
 *
 * Bisection on log-level: `pCorrect` is strictly increasing in x, GUESS at the
 * bottom and 1 - lapse at the top, so the bracket is guaranteed to contain the
 * root whenever one exists.
 */
export function levelWhereP(target: number, o: Observer): number {
  if (target >= 1 - o.lapse) {
    throw new Error(
      `observer with lapse ${o.lapse} never reaches P=${target.toFixed(4)} — no threshold exists`,
    );
  }
  let lo = Math.log(o.alpha) - 50 * o.beta;
  let hi = Math.log(o.alpha) + 50 * o.beta;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (pCorrect(Math.exp(mid), o) < target) lo = mid;
    else hi = mid;
  }
  return Math.exp((lo + hi) / 2);
}

/**
 * TWO TRUTHS, and conflating them is how a lapse rate gets quietly excused.
 *
 * `procedureTarget` — the level this observer, lapses and all, is right 70.7%
 * of the time at. It is what the staircase is chasing, so measuring against it
 * asks "does the rule do its job".
 *
 * `claimTarget` — the same ear WITHOUT lapses. It is what the product prints on
 * the screen, because a mis-click is not deafness: a listener who hears 25-cent
 * drift and fat-fingers one trial in fifty still hears 25-cent drift, and a
 * threshold that says otherwise is wrong about the person (D4 deliverable, N3).
 *
 * They are the same number at lapse 0, which is why nobody had to choose before.
 */
export const procedureTarget = (o: Observer) => levelWhereP(P_CONVERGE, o);
export const claimTarget = (o: Observer) => levelWhereP(P_CONVERGE, { ...o, lapse: 0 });

/** Deterministic PRNG so a failing recovery run can be reproduced exactly. */
export function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** One complete staircase session against a simulated listener. */
export function runStaircaseSession(
  o: Observer,
  seed: number,
  config: StaircaseConfig,
): { outcome: ReturnType<typeof estimateThreshold>; state: StaircaseState } {
  const rand = rng(seed);
  let state = startStaircase(config);
  while (!state.finished) {
    state = recordResponse(state, rand() < pCorrect(config.levels[state.currentIndex], o), config);
  }
  return { outcome: estimateThreshold(state, config), state };
}

/**
 * The reversal average WITHOUT the ladder-end guard — the raw estimator.
 *
 * `estimateThreshold` deliberately refuses to print a number when the reversals
 * sit within half a step of a ladder end (N3). That refusal is a SELECTION on
 * the sessions that survive to be reported, and measuring its effect requires
 * the un-refused value to compare against. Only ever used for that measurement;
 * it is not an estimator anyone should ship.
 */
export function rawReversalMean(state: StaircaseState, config: StaircaseConfig): number | null {
  const used = state.reversalIndices.slice(-config.useLastReversals);
  if (used.length < 2) return null;
  const logs = used.map((i) => Math.log(config.levels[i]));
  return Math.exp(logs.reduce((a, b) => a + b, 0) / logs.length);
}
