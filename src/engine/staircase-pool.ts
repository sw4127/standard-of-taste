/**
 * WHICH RENDERED INSTANCES A FAMILY MAY ACTUALLY DRAW FROM (E4/S4/S4, 2026-08-19).
 *
 * Two stages independently disqualify windows, for reasons neither can see:
 *
 *   `staircase-render` records `instanceWindows` per family from ITS gates —
 *   the drift-trajectory check (RT-75a), which excluded timing on pb1@120s and
 *   pb6@75s because the correlator could not verify the rendered wander.
 *
 *   `staircase-validate` records `layerA.excludedWindows` from ITS gates —
 *   fitness (dead air, near-silence, clipping) and the family's measurability
 *   floor, none of which the renderer looks at.
 *
 * TWO LISTS WITH NO RULE FOR COMBINING THEM IS THE TWO-TABLES DEFECT, which
 * this repo has now hit at the rung table, the window plan, and the damage
 * field. So there is ONE function that takes the intersection, and it is the
 * only sanctioned way to ask. Reading `instanceWindows` directly is a bug.
 *
 * IT LIVES HERE, NOT IN THE PIPELINE, because the consumer is the Gym and the
 * manifest is the interface between them. The pipeline writes the file; the
 * engine reads it. Nothing in `src/` should import a build script.
 *
 * THE COUNT IS NOT NINE, and hardcoding it was a live defect until this file:
 * pitch draws from 9 windows, timing from 7, lossy from 24 across three sources
 * (pb1 9 + pb6 9 + pb4 6). `trial-instances.test.ts` asserted against a
 * hand-written nine-window list that included pb8@120s — a window that does not
 * exist, in a recording 110 s long.
 */

import manifest from "@/content/delicacy/staircase.json";
import type { TrialInstance } from "./trial-instances";

interface ExcludedWindow {
  family: string;
  sourceId: string;
  startSec: number;
}

const pool = manifest as unknown as {
  instanceWindows?: Record<string, TrialInstance[]>;
  excludedWindows?: ExcludedWindow[];
  layerA?: { excludedWindows?: ExcludedWindow[] };
};

const key = (sourceId: string, startSec: number) => `${sourceId}@${startSec}`;

/**
 * Every window a stage disqualified for this family.
 *
 * A Layer A exclusion recorded against family `"*"` blocks the window for EVERY
 * family: it means the window's REFERENCE failed, and the reference is the A
 * side of every trial drawn from that window, whatever the degradation is.
 */
function blockedFor(family: string): Set<string> {
  const blocked = new Set<string>();
  for (const e of pool.layerA?.excludedWindows ?? []) {
    if (e.family === family || e.family === "*") blocked.add(key(e.sourceId, e.startSec));
  }
  // The renderer's own exclusions are already subtracted from `instanceWindows`
  // — it builds that list from the windows that passed. They are read here too
  // so this function does not depend on that remaining true.
  for (const e of pool.excludedWindows ?? []) {
    if (e.family === family) blocked.add(key(e.sourceId, e.startSec));
  }
  return blocked;
}

/**
 * The windows a family may draw instances from, after BOTH stages.
 *
 * Throws on an empty result rather than returning `[]`. A family with no
 * eligible windows cannot be presented at all, and the failure a caller would
 * otherwise get is `pickInstance`'s "no instances rendered", several layers
 * away from the reason.
 */
export function eligibleWindows(family: string): TrialInstance[] {
  const declared = pool.instanceWindows?.[family];
  if (!declared) {
    throw new Error(
      `eligibleWindows: the staircase manifest declares no windows for "${family}" — it has not been rendered`,
    );
  }
  const blocked = blockedFor(family);
  const usable = declared.filter((w) => !blocked.has(key(w.sourceId, w.startSec)));
  if (!usable.length) {
    throw new Error(`eligibleWindows: every window rendered for "${family}" was disqualified — it cannot be presented`);
  }
  return usable.map((w) => ({ sourceId: w.sourceId, startSec: w.startSec }));
}

/**
 * SOURCES WHOSE LADDER CANNOT BE MEASURED HONESTLY IN A SESSION ANYONE WOULD SIT
 * THROUGH (PM ruling RT-92a a, 2026-08-20).
 *
 * pb6's lossy ladder spans 3.5x across 7 rungs — the narrowest in the pool,
 * because `MEASURED_LOSSY_FLOOR_KBPS` puts its gentlest rung at 112 kbps rather
 * than the 160-192 the other two reach. E5/S4 measured what that costs: at the
 * 16 reversals the lossy family ships, its fitted point is biased -0.67 ladder
 * steps, and the best cell it EVER reaches is +0.21 at a 32-minute session, for
 * 1.3 points of band per minute against pitch's 5.7. It is the worst use of a
 * person's time in the product and it cannot be made honest by spending more of
 * it.
 *
 * THE CLIPS ARE NOT DELETED and the manifest is untouched — this is a shipping
 * filter, not a re-render, so the decision reverses by deleting three lines. The
 * pipeline still validates all 198 lossy clips, and `staircase-manifest.test.ts`
 * still proves pb6's ladder is internally sound; it is the SESSION that cannot
 * use it.
 */
const RETIRED_SOURCES: Record<string, ReadonlySet<string>> = {
  "lossy-artifact": new Set(["pb6"]),
};

/**
 * The sources a family can run a session on. Lossy must lock to one (RT-65).
 *
 * `includeRetired` exists for the Lab and the pipeline, which describe the pool
 * as rendered rather than as shipped. Every product path takes the default.
 */
export function eligibleSources(family: string, includeRetired = false): string[] {
  const all = [...new Set(eligibleWindows(family).map((w) => w.sourceId))].sort();
  if (includeRetired) return all;
  const retired = RETIRED_SOURCES[family];
  const shipping = retired ? all.filter((s) => !retired.has(s)) : all;
  if (!shipping.length) {
    throw new Error(`eligibleSources: every source for "${family}" is retired — it cannot be presented`);
  }
  return shipping;
}

/** Whether a source is rendered and validated but withheld from sessions. */
export function isRetiredSource(family: string, sourceId: string): boolean {
  return RETIRED_SOURCES[family]?.has(sourceId) ?? false;
}

/**
 * FAMILIES WHOSE LEVELS MEAN NOTHING WITHOUT THE MATERIAL (PM ruling RT-65).
 *
 * A lossy level is a bitrate, and the damage a bitrate does depends entirely on
 * the recording — measured at up to 1.999x across the windows serving one level
 * (`layerA.knownLimits`). Pitch and timing have manipulation-intrinsic units: a
 * cent is a cent whatever it is played on.
 *
 * IT IS EXPORTED because this fact was being re-typed as `family !==
 * "lossy-artifact"` in every consumer that needed it, which is the two-tables
 * defect in its smallest form — the one that is invisible until the day a third
 * source-locked family exists and only three of the four sites learn about it.
 */
export const SOURCE_LOCKED_FAMILIES: ReadonlySet<string> = new Set(["lossy-artifact"]);

export function isSourceLocked(family: string): boolean {
  return SOURCE_LOCKED_FAMILIES.has(family);
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
  const all = eligibleWindows(family);
  if (!isSourceLocked(family)) return all;
  if (!lockedSourceId) throw new Error("sessionInstances: lossy sessions must name a source (RT-65)");
  const locked = all.filter((i) => i.sourceId === lockedSourceId);
  if (!locked.length) {
    throw new Error(
      `sessionInstances: no eligible windows for source "${lockedSourceId}" ` +
        `(have: ${eligibleSources(family).join(", ")})`,
    );
  }
  return locked;
}
