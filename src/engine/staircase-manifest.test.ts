/**
 * E5/S1 — the staircase manifest reader, proven against the pool of record.
 *
 * PRE-REGISTERED CRITERIA (session plan, 2026-08-20). S1 is done when:
 *   1. ladder sizes are pitch 11 · timing 10 · lossy pb1 9 / pb4 9 / pb6 7;
 *   2. every (eligible window x level) pair resolves to a clip AND a reference —
 *      367 pairs, computed here rather than quoted;
 *   3. a lookup that misses THROWS, naming the key, instead of returning undefined;
 *   4. the derived axis is pitch up · timing up · lossy DOWN.
 *
 * (4) is the one that matters. It is asserted here so the derivation is pinned,
 * but the constant is not the source of truth — the measured damage is. If the
 * pool is re-rendered and a family's direction genuinely changes, this test
 * fails loudly rather than the Gym stepping its ladder backwards in silence.
 */

import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { eligibleSources, eligibleWindows, sessionInstances } from "./staircase-pool";
import {
  STAIRCASE_FAMILIES,
  STAIRCASE_POOL_VERSION,
  clipFor,
  damageDirectionSign,
  familyUnit,
  knownLimits,
  ladderDirection,
  ladderLevels,
  referenceFor,
} from "./staircase-manifest";

const LOSSY = "lossy-artifact";

describe("E5/S1 — ladders", () => {
  it("the pool of record has the three families at version 1", () => {
    expect(STAIRCASE_POOL_VERSION).toBe(1);
    expect([...STAIRCASE_FAMILIES].sort()).toEqual(["lossy-artifact", "pitch-drift", "timing-smear"]);
  });

  it("ladder sizes match the render", () => {
    expect(ladderLevels("pitch-drift")).toHaveLength(11);
    expect(ladderLevels("timing-smear")).toHaveLength(10);
    expect(ladderLevels(LOSSY, "pb1")).toHaveLength(9);
    expect(ladderLevels(LOSSY, "pb4")).toHaveLength(9);
    expect(ladderLevels(LOSSY, "pb6")).toHaveLength(7);
  });

  /**
   * THE INVERTED AXIS, which is the defect this whole module exists to stop.
   * `startStaircase` treats index 0 as the gentlest rung; a lossy ladder in
   * numeric order would put 32 kbps there — the harshest clip in the pool.
   */
  it("the axis is derived from measured damage: pitch up, timing up, lossy DOWN", () => {
    expect(ladderDirection("pitch-drift")).toBe("up");
    expect(ladderDirection("timing-smear")).toBe("up");
    expect(ladderDirection(LOSSY)).toBe("down");
  });

  it("every ladder runs gentlest-first, and lossy's labels therefore descend", () => {
    expect(ladderLevels("pitch-drift")[0]).toBe(3.1);
    expect(ladderLevels("pitch-drift").at(-1)).toBe(100);
    expect(ladderLevels("timing-smear")[0]).toBe(12.5);
    expect(ladderLevels("timing-smear").at(-1)).toBe(100);
    expect(ladderLevels(LOSSY, "pb1")).toEqual([160, 128, 112, 96, 80, 64, 48, 40, 32]);
    expect(ladderLevels(LOSSY, "pb4")).toEqual([192, 128, 96, 80, 64, 56, 48, 40, 32]);
    expect(ladderLevels(LOSSY, "pb6")).toEqual([112, 80, 64, 56, 48, 40, 32]);
  });

  it("the gentlest rung really is the least damaged one, on every ladder", () => {
    const rows: string[] = [];
    for (const family of STAIRCASE_FAMILIES) {
      const sources = ladderDirectionSources(family);
      for (const sourceId of sources) {
        const levels = ladderLevels(family, sourceId);
        const windows = sessionInstances(family, sourceId === "*" ? undefined : sourceId);
        const damageAt = (level: number) =>
          median(windows.map((w) => clipFor(family, w.sourceId, w.startSec, level).damageDb));
        const gentlest = damageAt(levels[0]);
        const harshest = damageAt(levels[levels.length - 1]);
        rows.push(
          `[E5/S1] ${family.padEnd(14)} ${sourceId.padEnd(4)} ` +
            `${String(levels[0]).padStart(5)} -> ${gentlest.toFixed(2)} dB   ` +
            `${String(levels[levels.length - 1]).padStart(5)} -> ${harshest.toFixed(2)} dB`,
        );
        expect(harshest, `${family}/${sourceId}: ladder ends are not ordered by damage`).toBeGreaterThan(
          gentlest,
        );
      }
    }
    console.log(rows.join("\n"));
  });

  it("a source-locked family refuses to hand out a pooled ladder (RT-65)", () => {
    expect(() => ladderLevels(LOSSY)).toThrow(/source-locked/);
  });

  it("units come from the render, not from this file", () => {
    expect(familyUnit(LOSSY)).toBe("kbps");
    expect(familyUnit("pitch-drift")).toContain("cents");
    expect(familyUnit("timing-smear")).toContain("ms");
  });
});

describe("E5/S1 — coverage", () => {
  /**
   * CRITERION 2, and the count is COMPUTED. Writing "367" as the expected value
   * would assert that this file and the manifest agree about a number, which is
   * not the property anyone cares about; what matters is that no window a
   * session can actually be handed has a hole in its ladder.
   */
  it("every eligible window has a clip at every level of its ladder, and a reference", () => {
    let pairs = 0;
    const counts: Record<string, number> = {};
    for (const family of STAIRCASE_FAMILIES) {
      for (const w of eligibleWindows(family)) {
        referenceFor(w.sourceId, w.startSec); // throws if missing
        for (const level of ladderLevels(family, w.sourceId)) {
          const clip = clipFor(family, w.sourceId, w.startSec, level);
          expect(clip.url).toMatch(/^\/audio\/staircase\/st-.+\.mp3$/);
          expect(Number.isFinite(clip.damageDb)).toBe(true);
          pairs++;
          counts[family] = (counts[family] ?? 0) + 1;
        }
      }
    }
    console.log(`[E5/S1] window x level pairs covered: ${JSON.stringify(counts)} = ${pairs} total`);
    // 9x11 pitch + 7x10 timing + (9x9 + 6x9 + 9x7) lossy.
    expect(counts["pitch-drift"]).toBe(9 * 11);
    expect(counts["timing-smear"]).toBe(7 * 10);
    expect(counts[LOSSY]).toBe(9 * 9 + 6 * 9 + 9 * 7);
    expect(pairs).toBe(367);
  });

  it("every lossy source can run a session and every session stays on one source", () => {
    for (const sourceId of eligibleSources(LOSSY, true)) {
      const windows = sessionInstances(LOSSY, sourceId);
      expect(windows.length).toBeGreaterThan(0);
      expect(new Set(windows.map((w) => w.sourceId))).toEqual(new Set([sourceId]));
    }
    // The pool holds three; pb6 is rendered and validated but retired from
    // sessions (RT-92a) — this file describes the POOL, not what ships.
    expect(eligibleSources(LOSSY, true)).toEqual(["pb1", "pb4", "pb6"]);
    expect(eligibleSources(LOSSY)).toEqual(["pb1", "pb4"]);
  });
});

describe("E5/S1 — misses throw, naming the key", () => {
  it("a level that is not on this source's ladder", () => {
    // 160 kbps exists on pb1 and does NOT exist on pb6 — a real cross-source
    // mistake, not a made-up one.
    expect(() => clipFor(LOSSY, "pb6", 0, 160)).toThrow(/pb6@0s level 160/);
    expect(() => clipFor(LOSSY, "pb6", 0, 160)).toThrow(/112, 80, 64/);
  });

  /**
   * FOUND BY THIS TEST FAILING, and the first draft of the reader was wrong.
   * These 20 clips exist on disk and in the manifest; only `eligibleWindows`
   * knew they were disqualified, and `clipFor` was happy to serve them.
   */
  it("a window the gates disqualified, even though its clips were rendered", () => {
    expect(() => clipFor("timing-smear", "pb1", 120, 100)).toThrow(/not an eligible window/);
    expect(() => clipFor("timing-smear", "pb6", 75, 50)).toThrow(/pb6@75s/);
    // ...and the same window is fine for a family it was not excluded from.
    expect(clipFor("pitch-drift", "pb1", 120, 100).level).toBe(100);
  });

  it("a window in a recording that is too short to contain it", () => {
    // pb8 is 110.06 s. The hand-written list this module replaces contained
    // pb8@120s, and nothing caught it.
    expect(() => referenceFor("pb8", 120)).toThrow(/pb8@120s/);
  });

  it("a family nobody rendered", () => {
    expect(() => ladderLevels("stereo-collapse")).toThrow(/no clips rendered/);
    expect(() => ladderDirection("stereo-collapse")).toThrow(/no clips rendered/);
  });
});

describe("E5/S1 — known limits are readable (RT-85a's condition)", () => {
  it("all nine are exposed, and every one carries a statement", () => {
    const all = knownLimits();
    expect(all).toHaveLength(9);
    for (const l of all) {
      expect(l.statement.length).toBeGreaterThan(40);
      expect(l.kind).toBeTruthy();
    }
    console.log(`[E5/S1] knownLimits: ${all.map((l) => `${l.family}/${l.sourceId ?? "-"}/${l.kind}`).join(" · ")}`);
  });

  it("filters by family and source", () => {
    expect(knownLimits("pitch-drift")).toHaveLength(2);
    expect(knownLimits(LOSSY)).toHaveLength(7);
    expect(knownLimits(LOSSY, "pb4")).toHaveLength(3);
    expect(knownLimits(LOSSY, "pb1").every((l) => l.sourceId === "pb1")).toBe(true);
  });

  it("every lossy source that can be picked for a session has its damage spread stated", () => {
    for (const sourceId of eligibleSources(LOSSY, true)) {
      const spread = knownLimits(LOSSY, sourceId).filter((l) => l.kind === "damage-varies-by-window");
      expect(spread.length, `no damage-spread limit for ${sourceId}`).toBeGreaterThan(0);
      expect(spread[0].damageRatio).toBeGreaterThan(1);
    }
  });
});

describe("E5/S1 — the direction rule, proven both ways", () => {
  it("rises, falls, and is flat", () => {
    expect(damageDirectionSign([1, 2, 3, 4])).toBeGreaterThan(0);
    expect(damageDirectionSign([4, 3, 2, 1])).toBeLessThan(0);
    expect(damageDirectionSign([2, 2, 2, 2])).toBe(0);
  });

  /**
   * THE SHAPE THE POOL ACTUALLY HAS. pb1's real medians in ascending kbps order
   * — note 40 kbps sitting below 32 and the near-tie at the gentle end, which is
   * why five ladders came back non-monotone. A rule that compared only the two
   * ends would still get this right; a rule that demanded monotonicity would
   * reject a ladder we ship. Concordance does neither.
   */
  it("survives the local inversions this pool really has", () => {
    const pb1Ascending = [12.39, 9.92, 8.52, 5.94, 3.9, 3.14, 2.34, 1.8, 1.02];
    expect(damageDirectionSign(pb1Ascending)).toBeLessThan(0);
    // One inversion planted at the gentle end must not flip the verdict.
    const withInversion = [...pb1Ascending];
    [withInversion[7], withInversion[8]] = [withInversion[8], withInversion[7]];
    expect(damageDirectionSign(withInversion)).toBeLessThan(0);
  });
});

/**
 * THE URLS ARE ONLY AS TRUE AS THE DISK. Every lookup above proves the manifest
 * is internally consistent; none of it proves a file exists.
 *
 * ITS OLD JUSTIFICATION WAS FALSIFIED BY RT-88a, and the correction is the
 * point. This check used to be the only one of its kind, excused as soft
 * because "`public/audio/staircase` is git-ignored (RT-71b), so this cannot be
 * a hard requirement in CI". That was true and it was not enough: the pool was
 * present on disk on the one machine that ran this test, absent from every
 * deploy, and this test passed the whole time. On disk and in the deploy are
 * different facts.
 *
 * The pool is tracked now (RT-94a b), so `present` should be true everywhere —
 * and the deploy-side guarantee is asserted separately, against git rather than
 * the filesystem, in `staircase-shipping.test.ts`. Keep this one anyway: it is
 * the check that a working tree is intact, which is a different failure from a
 * deploy that is missing files. Skipping silently is what made it worthless, so
 * the skip stays loud.
 */
describe("E5/S1 — every URL resolves to a file that exists", () => {
  const dir = join(process.cwd(), "public", "audio", "staircase");
  const present = existsSync(dir);

  it.skipIf(!present)("all 367 clips and their references are on disk", () => {
    const missing: string[] = [];
    let checked = 0;
    for (const family of STAIRCASE_FAMILIES) {
      for (const w of eligibleWindows(family)) {
        const ref = referenceFor(w.sourceId, w.startSec);
        if (!existsSync(join(dir, ref.file))) missing.push(ref.file);
        checked++;
        for (const level of ladderLevels(family, w.sourceId)) {
          const clip = clipFor(family, w.sourceId, w.startSec, level);
          if (!existsSync(join(dir, clip.file))) missing.push(clip.file);
          checked++;
        }
      }
    }
    console.log(`[E5/S1] on-disk check: ${checked} files referenced, ${missing.length} missing`);
    expect(missing).toEqual([]);
  });

  it("says so out loud when the pool is not present", () => {
    if (!present) {
      console.log(
        `[E5/S1] SKIPPED the on-disk check — ${dir} is absent (git-ignored, RT-71b). ` +
          `The URLs in this manifest are UNVERIFIED on this machine.`,
      );
    }
    expect(typeof present).toBe("boolean");
  });
});

/** Which ladder groups a family has: one pooled, or one per lossy source. */
function ladderDirectionSources(family: string): string[] {
  return family === LOSSY ? eligibleSources(family, true) : ["*"];
}

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
