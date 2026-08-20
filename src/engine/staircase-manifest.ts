/**
 * READING THE STAIRCASE POOL — ladders, clip files, and the limits that travel
 * with them (E5/S1, 2026-08-20).
 *
 * WHAT THIS IS FOR. `staircase-pool.ts` answers "which musical MOMENTS may this
 * family use". Nothing yet answers "which FILE is the 96 kbps clip of pb1@53s,
 * and what is the ladder it sits on". A session needs both, and until this file
 * existed the only way to get the second was to hand-write it — which is how
 * `trial-instances.test.ts` came to assert against a window in a recording that
 * is 110 s long.
 *
 * THE AXIS IS DERIVED, NOT TRANSCRIBED, and that is the whole point of the
 * awkward-looking `ladderDirection`.
 *
 *   Pitch and timing get HARDER as the number goes up: 100 cents of drift is
 *   more audible than 12.5. Lossy is INVERTED — 32 kbps is brutal and 192 kbps
 *   is nearly transparent — so its ladder runs downward, and every consumer
 *   that assumes "up" is silently wrong on a third of the instrument.
 *
 *   The renderer knows this as `FAMILY_AXIS` in `staircaserender.mjs`. Nothing
 *   in `src/` may import a build script (the architecture rule E4/S4/S4 set),
 *   so the choice was to COPY the constant here or to DERIVE it. Copying is the
 *   two-tables defect this repo has now hit at the rung table, the window plan
 *   and the damage field. So it is derived: rank-correlate each ladder's
 *   labels against the damage actually measured on those clips, and take the
 *   sign. If a future render flips a family's direction, this follows it; a
 *   copied constant would not, and would fail silently in the direction that
 *   flatters the listener.
 *
 * WHAT IT REFUSES TO DO. Nothing here averages, fits, or decides anything about
 * a person. It is a typed reader over a generated file, and every lookup that
 * misses throws with the key it was given rather than returning `undefined` for
 * a caller to render as "NaN kbps".
 */

import manifest from "@/content/delicacy/staircase.json";
import { eligibleWindows, isSourceLocked } from "./staircase-pool";

/** Where the rendered pool is served from. Git-ignored until E5 commits it. */
export const STAIRCASE_AUDIO_BASE = "/audio/staircase";

interface RawMeasured {
  unit: string;
  /** Log-spectral distance from this window's reference — the damage, in dB. */
  lsdDb: number;
  value: number;
}

interface RawClip {
  id: string;
  sourceId: string;
  startSec: number;
  family: string;
  level: number;
  file: string;
  measured: RawMeasured;
}

interface RawReference {
  id: string;
  sourceId: string;
  startSec: number;
  file: string;
}

export interface KnownLimit {
  family: string;
  sourceId?: string;
  window?: string;
  level?: number;
  kind: string;
  /** The limit in one sentence, written by the pipeline that measured it. */
  statement: string;
  ratio?: number;
  damageRatio?: number;
  damageMinDb?: number;
  damageMaxDb?: number;
  windows?: number;
}

const pool = manifest as unknown as {
  poolVersion: number;
  clipSeconds: number;
  renderedAt: string;
  instanceWindows: Record<string, unknown[]>;
  clips: RawClip[];
  references: RawReference[];
  layerA: { knownLimits?: KnownLimit[] };
};

export const STAIRCASE_POOL_VERSION = pool.poolVersion;
export const STAIRCASE_CLIP_SECONDS = pool.clipSeconds;
export const STAIRCASE_RENDERED_AT = pool.renderedAt;

/** Every family the pool was rendered for. */
export const STAIRCASE_FAMILIES: readonly string[] = Object.keys(pool.instanceWindows);

export interface StaircaseClip {
  id: string;
  family: string;
  sourceId: string;
  startSec: number;
  /** The label in the family's own unit: cents, ms, or kbps. */
  level: number;
  file: string;
  url: string;
  /** Measured damage against this window's own reference, in dB. */
  damageDb: number;
}

export interface StaircaseReference {
  id: string;
  sourceId: string;
  startSec: number;
  file: string;
  url: string;
}

/**
 * Levels are floats out of JSON (3.1, 70.7). Both the key and the lookup come
 * from the same file, so `===` would in fact work — but a caller who computes a
 * level rather than reading one would get a miss that looks like a missing
 * clip. Fixed precision costs nothing and removes the class.
 */
const lvl = (level: number) => level.toFixed(4);
const clipKey = (family: string, sourceId: string, startSec: number, level: number) =>
  `${family}|${sourceId}@${startSec}|${lvl(level)}`;
const refKey = (sourceId: string, startSec: number) => `${sourceId}@${startSec}`;

/** Lossy ladders differ per source; pitch and timing share one across all. */
const POOLED = "*";
const groupOf = (family: string, sourceId: string) => (isSourceLocked(family) ? sourceId : POOLED);
const groupKey = (family: string, sourceId: string) => `${family}|${groupOf(family, sourceId)}`;

const toUrl = (file: string) => `${STAIRCASE_AUDIO_BASE}/${file}`;

const clipIndex = new Map<string, StaircaseClip>();
const refIndex = new Map<string, StaircaseReference>();
/** LADDER group -> level -> damages measured for that level, across its windows. */
const damageByGroup = new Map<string, Map<number, number[]>>();
/**
 * `family|sourceId` -> the same, and it is a SEPARATE index on purpose.
 *
 * Pitch and timing share one ladder across three recordings, so their group is
 * pooled — which means a direction derived from the group would average three
 * sources together and could survive one of them being inverted. The direction
 * is a property of the manipulation, so every source must show it independently
 * or the render is inconsistent. That check needs the un-pooled view.
 */
const damageBySource = new Map<string, Map<number, number[]>>();
const unitByFamily = new Map<string, string>();

function push(index: Map<string, Map<number, number[]>>, key: string, level: number, dB: number) {
  let levels = index.get(key);
  if (!levels) index.set(key, (levels = new Map()));
  const at = levels.get(level);
  if (at) at.push(dB);
  else levels.set(level, [dB]);
}

for (const c of pool.clips) {
  const clip: StaircaseClip = {
    id: c.id,
    family: c.family,
    sourceId: c.sourceId,
    startSec: c.startSec,
    level: c.level,
    file: c.file,
    url: toUrl(c.file),
    damageDb: c.measured.lsdDb,
  };
  clipIndex.set(clipKey(c.family, c.sourceId, c.startSec, c.level), clip);
  unitByFamily.set(c.family, c.measured.unit);

  push(damageByGroup, groupKey(c.family, c.sourceId), c.level, c.measured.lsdDb);
  push(damageBySource, `${c.family}|${c.sourceId}`, c.level, c.measured.lsdDb);
}

for (const r of pool.references) {
  refIndex.set(refKey(r.sourceId, r.startSec), {
    id: r.id,
    sourceId: r.sourceId,
    startSec: r.startSec,
    file: r.file,
    url: toUrl(r.file),
  });
}

const median = (xs: number[]): number => {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

/**
 * Does damage rise or fall as the label rises? Positive = rises.
 *
 * Kendall-style concordance over every pair of levels rather than a comparison
 * of the two ends. The ends are exactly where this pool is known to misbehave:
 * five lossy ladders came back non-monotone and every inversion was at the
 * gentlest end (`MEASURED_LOSSY_FLOOR_KBPS`). A sign taken from all pairs
 * survives a few local inversions; a sign taken from the endpoints does not.
 *
 * Exported so the check can be proven in BOTH directions — a rule that has only
 * ever returned the right answer on the one pool we have is not known to be a
 * rule at all.
 */
export function damageDirectionSign(damageByAscendingLevel: readonly number[]): number {
  const d = damageByAscendingLevel;
  let sign = 0;
  for (let i = 0; i < d.length; i++) {
    for (let j = i + 1; j < d.length; j++) sign += Math.sign(d[j] - d[i]);
  }
  return sign;
}

function directionOfGroup(levels: Map<number, number[]>): number {
  const ls = [...levels.keys()].sort((a, b) => a - b);
  return damageDirectionSign(ls.map((l) => median(levels.get(l)!)));
}

export type LadderDirection = "up" | "down";

const directionCache = new Map<string, LadderDirection>();

/**
 * Which way the family's ladder runs — `"up"` when a bigger number means more
 * damage, `"down"` when it means less (lossy: kbps).
 *
 * EVERY SOURCE MUST AGREE, not every ladder group. They cannot disagree for a
 * real reason: the direction is a property of the manipulation, not of the
 * recording. A disagreement means the render is inconsistent, and a session
 * built on it would step its ladder the wrong way for one source only — which
 * is precisely the failure that would never show up in a pooled average.
 */
export function ladderDirection(family: string): LadderDirection {
  const cached = directionCache.get(family);
  if (cached) return cached;

  const groups = [...damageBySource.entries()].filter(([k]) => k.startsWith(`${family}|`));
  if (!groups.length) throw new Error(`ladderDirection: no clips rendered for family "${family}"`);

  const signs = groups.map(([k, levels]) => ({ group: k, sign: directionOfGroup(levels) }));
  const flat = signs.filter((s) => s.sign === 0);
  if (flat.length) {
    throw new Error(
      `ladderDirection: "${flat[0].group}" shows no relationship between level and measured damage — ` +
        `its ladder cannot be ordered`,
    );
  }
  const up = signs.filter((s) => s.sign > 0);
  if (up.length && up.length !== signs.length) {
    throw new Error(
      `ladderDirection: family "${family}" disagrees with itself — ` +
        signs.map((s) => `${s.group} ${s.sign > 0 ? "up" : "down"}`).join(", "),
    );
  }
  const direction: LadderDirection = up.length ? "up" : "down";
  directionCache.set(family, direction);
  return direction;
}

/** The family's physical unit, as the pipeline recorded it on the clips. */
export function familyUnit(family: string): string {
  const unit = unitByFamily.get(family);
  if (!unit) throw new Error(`familyUnit: no clips rendered for family "${family}"`);
  return unit;
}

/**
 * The ladder, ordered GENTLEST FIRST — index 0 is the smallest manipulation the
 * pipeline can render, whichever way the labels run.
 *
 * That ordering is not cosmetic. `startStaircase` treats index 0 as the floor
 * and `fitThreshold` refuses to print a number below `levels[0]`; hand either
 * of them a lossy ladder in numeric order and every session returns "below the
 * floor" — a wrong answer that looks entirely plausible.
 */
export function ladderLevels(family: string, sourceId?: string): number[] {
  if (isSourceLocked(family) && !sourceId) {
    throw new Error(`ladderLevels: "${family}" is source-locked — its ladder differs per source (RT-65)`);
  }
  const key = `${family}|${isSourceLocked(family) ? sourceId : POOLED}`;
  const levels = damageByGroup.get(key);
  if (!levels) throw new Error(`ladderLevels: no clips rendered for "${key}"`);
  const ordered = [...levels.keys()].sort((a, b) => a - b);
  return ladderDirection(family) === "up" ? ordered : ordered.reverse();
}

/**
 * Windows a family may present, as a lookup. Lazy because it costs an
 * `eligibleWindows` call, and cached because `clipFor` runs per trial.
 */
const eligibleCache = new Map<string, Set<string>>();
function eligibleKeys(family: string): Set<string> {
  let set = eligibleCache.get(family);
  if (!set) {
    set = new Set(eligibleWindows(family).map((w) => refKey(w.sourceId, w.startSec)));
    eligibleCache.set(family, set);
  }
  return set;
}

/**
 * The degraded clip for one (window, level), or a throw naming the key.
 *
 * IT REFUSES DISQUALIFIED WINDOWS, and that is not paranoia — the pool contains
 * 20 rendered timing clips on `pb1@120s` and `pb6@75s`, whose drift trajectory
 * the correlator could not verify (RT-75a). They are on disk, they are in the
 * manifest, and they are perfectly ordinary to look up by accident. A reader
 * that hands one back has quietly undone the exclusion, and the only symptom
 * would be a threshold measured partly on audio whose labelled magnitude the
 * audio itself does not corroborate.
 */
export function clipFor(family: string, sourceId: string, startSec: number, level: number): StaircaseClip {
  if (!eligibleKeys(family).has(refKey(sourceId, startSec))) {
    throw new Error(
      `clipFor: ${sourceId}@${startSec}s is not an eligible window for ${family} — ` +
        `it was disqualified by the renderer's or Layer A's gates, so no trial may use it`,
    );
  }
  const clip = clipIndex.get(clipKey(family, sourceId, startSec, level));
  if (!clip) {
    throw new Error(
      `clipFor: nothing rendered for ${family} at ${sourceId}@${startSec}s level ${level} — ` +
        `the ladder for this source is [${ladderLevels(family, sourceId).join(", ")}]`,
    );
  }
  return clip;
}

/** The undamaged clip for a window — the A side of every trial drawn from it. */
export function referenceFor(sourceId: string, startSec: number): StaircaseReference {
  const ref = refIndex.get(refKey(sourceId, startSec));
  if (!ref) throw new Error(`referenceFor: no reference rendered for ${sourceId}@${startSec}s`);
  return ref;
}

/**
 * What the pipeline measured and could not fix, in its own words.
 *
 * RT-85a accepted the kbps label ON CONDITION that the damage variation behind
 * it be stated rather than hidden, so these are a shipping obligation and not
 * an appendix.
 */
export function knownLimits(family?: string, sourceId?: string): KnownLimit[] {
  const all = pool.layerA.knownLimits ?? [];
  return all.filter(
    (l) => (!family || l.family === family) && (!sourceId || l.sourceId === sourceId),
  );
}
