/**
 * THE QUANTITIES EVERY SURFACE MAY STATE, DERIVED ONCE (E19/S12).
 *
 * WHAT WENT WRONG. Cowork's batch-2 return found eleven quantities typed into
 * the reading room by hand — the clip count, the label count, the controls, the
 * swaps, the session length, the works in the Ranking pool, the clip seconds —
 * on pages describing instruments whose pools are already versioned and have
 * already grown once. `/learn/comparison` slots the SAME clip count as
 * `{numberWord(CLIPS)}` while describing the same test. The day the pool grows
 * again, one page is right and the other is silently wrong.
 *
 * It also found the rule stating this, in Part 3's own preamble, enforced
 * nowhere in Part 3: *"the slots must stay slots: typing the value in is how a
 * page drifts away from the instrument it describes."* The rule was written as
 * though the risk were a writer resolving a slot. The larger risk is the
 * opposite one — a page that never had a slot to resolve.
 *
 * NO COUNT APPEARS IN THIS FILE, INCLUDING IN ITS COMMENTS. `claims.test.ts`
 * caught the first draft of this docblock spelling the pool out while
 * explaining why spelling the pool out is a defect. It was right: a comment
 * that states a count goes stale exactly like copy does, and this is the one
 * file where that would be embarrassing.
 *
 * DERIVED FROM THE POOLS AND THE MANIFESTS, not restated here. The one figure
 * that cannot be derived is wall-clock session length, and it says so in its
 * own comment rather than pretending to a formula that would have to be
 * reverse-engineered from the answer.
 */
import biasManifest from "@/content/bias/manifest.json";
import spreadManifest from "@/content/spread/manifest.json";
import { BIAS_CLIPS } from "@/content/bias/items";
import { SPREAD_POOL } from "@/content/spread/ranking";
import { degreesIfIndifferent } from "@/engine/comparison";
import {
  PREFERENCE_SHIPPED_DIMENSION_IDS,
  TAKES_PER_PAIR,
  planSitting,
} from "@/engine/preference";

/* ---------------------------------------------------------------- Prestige */

/** Every clip a listener hears, controls included. */
export const BIAS_CLIP_COUNT = BIAS_CLIPS.length;

/** Rated in both passes and never labelled — the drift controls. */
export const BIAS_CONTROL_COUNT = BIAS_CLIPS.filter((clip) => clip.isControl).length;

/** Clips that carry a label in the second pass. */
export const BIAS_LABELLED_COUNT = BIAS_CLIP_COUNT - BIAS_CONTROL_COUNT;

/**
 * Labels that are deliberately false — the sanctioned deception (memo §3).
 * Counted from the pool rather than stated, because it is the number the whole
 * instrument's claim to be an experiment rests on.
 */
export const BIAS_SWAPPED_COUNT = BIAS_CLIPS.filter(
  (clip) => !clip.isControl && !clip.labelIsTrue,
).length;

/** Seconds of audio per clip, from the manifest the pipeline rendered against. */
export const BIAS_CLIP_SECONDS: number = biasManifest.clipSeconds;

/**
 * WALL-CLOCK MINUTES, AND THIS ONE IS AN ESTIMATE RATHER THAN A DERIVATION.
 *
 * The audio alone is `BIAS_CLIP_COUNT * 2 * BIAS_CLIP_SECONDS`, which is longer
 * than this figure at the current pool, and the session runs shorter because
 * a listener rates before a clip ends. There is no measured distribution of how
 * long people actually take, and inventing a formula that happens to land on
 * the number already in the copy would be reverse-engineering an answer, which
 * is the shape of claim N3 exists to refuse.
 *
 * So it is a judgement, in ONE place, and every surface reads it here. That is
 * the part that was actually broken: not that the figure was estimated, but
 * that it was estimated separately on each page.
 */
export const BIAS_SESSION_MINUTES = 8;

/**
 * Distinct rating values an indifferent rater lands on, which is the reference
 * the degrees count is read against. Derived so no surface can invite the
 * comparison against the top of the scale instead.
 */
export const BIAS_DEGREES_BY_CHANCE = Math.round(degreesIfIndifferent(BIAS_CLIP_COUNT));

/* ------------------------------------------------------------ Ranking Test */

/** Works in the Ranking Test pool. */
export const SPREAD_WORK_COUNT = SPREAD_POOL.length;

/** Seconds of audio per work, from the manifest. */
export const SPREAD_CLIP_SECONDS: number = spreadManifest.clipSeconds;

/**
 * Derived, unlike its prestige counterpart: this instrument plays each work
 * once, so the listening time IS the session length to the nearest minute.
 */
export const SPREAD_SESSION_MINUTES = Math.round(
  (SPREAD_WORK_COUNT * SPREAD_CLIP_SECONDS) / 60,
);

/* --------------------------------------------------- Preference (UNBUILT) */

/**
 * NOTHING BELOW IS REACHABLE BY A USER, AND NO SURFACE MAY STATE IT YET.
 *
 * The preference instrument has no pool, no flow and no route. These constants
 * exist so that the decision about whether to build it is taken against derived
 * arithmetic instead of against a figure somebody estimated in a chat message —
 * which is exactly what happened, and is why this block exists at all.
 */

/** Dimensions a listener is asked about, per the ruling that sized the sitting. */
export const PREFERENCE_DIMENSION_COUNT = PREFERENCE_SHIPPED_DIMENSION_IDS.length;

/**
 * NULL WHEN THE DESIGN RATE IS UNDETECTABLE, AND THAT IS NOT AN ERROR HERE.
 *
 * The first draft threw at module load. That is the right severity for the
 * instrument and the wrong place for it: this module is imported by the reading
 * room and the landing page, so lowering the design rate to something faint
 * would have taken the whole site down over a feature nobody can reach. A
 * failure's blast radius should match what failed.
 *
 * So it is null here and a TEST holds the invariant instead: an undetectable
 * design rate fails CI, not `/learn`.
 */
const PREFERENCE_PLAN = planSitting(PREFERENCE_DIMENSION_COUNT);

/** Forced choices per dimension. Null when the sitting has no detectable size. */
export const PREFERENCE_TRIALS_PER_DIMENSION = PREFERENCE_PLAN?.trialsPerDimension ?? null;

/** Pairs a listener hears end to end. */
export const PREFERENCE_PAIR_COUNT = PREFERENCE_PLAN?.pairs ?? null;

/**
 * SECONDS PER PAIR — AN ESTIMATE PROPAGATED FROM ANOTHER ESTIMATE, WHICH IS
 * THE WEAKEST NUMBER ANYWHERE IN THIS FILE AND IS LABELLED SO ON PURPOSE.
 *
 * Nobody has sat this instrument, so there is no pace to measure. The nearest
 * shipped fact is the Prestige Test's pace — and that is not a fact either:
 * `BIAS_SESSION_MINUTES` says in its own comment that it is a judgement, made
 * once, because no distribution of how long people take has ever been
 * collected. Dividing a judgement by a real clip count and multiplying by the
 * takes in a pair produces a number with a derivation and no measurement under
 * it. Calling that "derived" without this paragraph would be the exact move N3
 * forbids: arithmetic borrowing the authority of data.
 *
 * WHAT IT IS GOOD FOR ANYWAY. It is good enough to tell 84 minutes from 20,
 * which is the decision it exists to inform, and no sharper than that. Nothing
 * that needs a real pace may use it.
 *
 * THE DIRECTION OF THE ERROR IS CHOSEN. A forced A-or-B choice is probably
 * faster than the absolute rating the Prestige pace comes from, so this likely
 * OVERSTATES the sitting. That is deliberate: a product that promises a shorter
 * sitting than it delivers has lied to a reader, and one that promises a longer
 * one has only been pessimistic.
 */
export const PREFERENCE_SECONDS_PER_PAIR =
  Math.round((BIAS_SESSION_MINUTES * 60) / BIAS_CLIP_COUNT) * TAKES_PER_PAIR;

/** Wall-clock minutes. Null when the sitting has no detectable size. */
export const PREFERENCE_SESSION_MINUTES =
  PREFERENCE_PAIR_COUNT === null
    ? null
    : Math.round((PREFERENCE_PAIR_COUNT * PREFERENCE_SECONDS_PER_PAIR) / 60);

/**
 * THE SAME THREE FIGURES, FROZEN, FOR PROSE THAT CANNOT TOLERATE A NULL.
 *
 * The nullable exports above exist so that a faint design rate fails CI instead
 * of white-screening the site. `/method`'s seventh refusal then needed to STATE
 * them — and a page that renders `numberWord(null)` throws at module load,
 * which is the identical white screen arriving by a different door. Casting the
 * null away at the call site would have reintroduced the hazard while looking
 * like a type annotation, which is how that class of bug usually travels.
 *
 * So the published refusal reads these, and they cannot be null. The frozen
 * values are the ones the instrument was killed on — historical facts now,
 * since nothing will re-size a killed instrument — and the fallback applies
 * only in the null case that CI already refuses. `preference-kill-record.test.ts`
 * asserts the derived and the frozen values still agree, so a drift shows up as
 * a red test rather than as a page quietly printing the wrong century's number.
 */
export const PREFERENCE_SITTING_TRIALS = PREFERENCE_TRIALS_PER_DIMENSION ?? 28;
export const PREFERENCE_SITTING_PAIRS = PREFERENCE_PAIR_COUNT ?? 84;
export const PREFERENCE_SITTING_MINUTES = PREFERENCE_SESSION_MINUTES ?? 84;
