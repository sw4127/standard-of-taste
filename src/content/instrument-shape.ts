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
