/**
 * EVERY CLIP THE LADDER CAN SERVE IS ACTUALLY IN THE DEPLOYMENT (E19/S20).
 *
 * WHAT MAKES THIS POSSIBLE. `public/audio/staircase/` is GITIGNORED — the
 * .gitignore comment describes the chunked force-add that got 400 files onto
 * the remote — so every shipped clip is in the repository because somebody
 * remembered to add it past the ignore rule. Nothing checks that they did.
 *
 * WHAT IT WOULD COST. A clip that is named by the manifest and not tracked in
 * git exists on the machine that rendered it and 404s in production. The
 * ClipPlayer keeps the rating gate locked when audio fails to load, so a
 * listener routed to that rung does not get a degraded session — they get a
 * stuck one, on a live instrument, with nothing in the build to say why.
 *
 * IT IS NOT HYPOTHETICAL. The manifest names 420 files and 400 are tracked.
 * The 20 are two whole timing ladders, `pb1@120` and `pb6@75`, and they are
 * safe TODAY only because neither window is in `instanceWindows` — the
 * rotation cannot reach them. They are leftovers from windows that were
 * dropped. Promote either window back and production breaks with no warning,
 * which is exactly the failure this pins.
 *
 * SO THE CHECK IS SCOPED TO REACHABILITY, not to the whole manifest: a clip
 * must be tracked if and only if the rotation can serve it. Deleting the dead
 * renders would also close it, and is a separate decision about the pool.
 */
import { execSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import manifest from "@/content/delicacy/staircase.json";

interface RawClip {
  family: string;
  sourceId: string;
  startSec: number;
  file: string;
}

const pool = manifest as unknown as {
  instanceWindows: Record<string, { sourceId: string; startSec: number }[]>;
  clips: RawClip[];
  references: { sourceId: string; startSec: number; file: string }[];
};

const base = (path: string) => path.split("/").pop() ?? path;

/** Files the repository will actually deploy. */
function trackedAudio(): Set<string> {
  const out = execSync("git ls-files public/audio/staircase", { encoding: "utf8" });
  return new Set(out.split("\n").filter(Boolean).map(base));
}

/** `family|sourceId|startSec` for every window the rotation can select. */
function liveWindows(): Set<string> {
  const keys = new Set<string>();
  for (const [family, windows] of Object.entries(pool.instanceWindows)) {
    for (const w of windows) keys.add(`${family}|${w.sourceId}|${w.startSec}`);
  }
  return keys;
}

describe("staircase audio that the ladder can serve", () => {
  const tracked = trackedAudio();
  const live = liveWindows();

  it("found a manifest and a tracked pool, so nothing below is vacuous", () => {
    expect(pool.clips.length).toBeGreaterThan(100);
    expect(tracked.size).toBeGreaterThan(100);
    expect(live.size).toBeGreaterThan(3);
  });

  it("ships every clip whose window is in the rotation", () => {
    const reachable = pool.clips.filter((c) =>
      live.has(`${c.family}|${c.sourceId}|${c.startSec}`),
    );
    expect(reachable.length, "no clip is reachable, so this checks nothing").toBeGreaterThan(100);
    const absent = reachable.map((c) => base(c.file)).filter((f) => !tracked.has(f));
    expect(
      [...new Set(absent)],
      "these clips are in the rotation and NOT tracked in git. public/audio/staircase is " +
        "gitignored, so they exist only on the machine that rendered them: in production they " +
        "404, and the player holds the rating gate closed on a load failure:",
    ).toEqual([]);
  });

  it("ships every reference clip a comparison needs", () => {
    const refs = pool.references.filter((r) =>
      [...live].some((k) => k.endsWith(`|${r.sourceId}|${r.startSec}`)),
    );
    expect(refs.length).toBeGreaterThan(0);
    const absent = refs.map((r) => base(r.file)).filter((f) => !tracked.has(f));
    expect([...new Set(absent)], "reference clips missing from the deployment:").toEqual([]);
  });

  /**
   * The other direction, and the reason the storage bill was worth chasing: a
   * tracked file no window can reach is weight in every deployment forever.
   * Reported rather than failed — deleting pool audio is a decision about the
   * instrument, not a lint.
   */
  it("reports tracked audio the rotation can never serve", () => {
    const reachable = new Set(
      pool.clips
        .filter((c) => live.has(`${c.family}|${c.sourceId}|${c.startSec}`))
        .map((c) => base(c.file)),
    );
    for (const r of pool.references) reachable.add(base(r.file));
    const dead = [...tracked].filter((f) => !reachable.has(f));
    // Today: none. If this ever grows, it is shipped weight nobody can hear.
    expect(dead, `tracked but unreachable: ${dead.length} files`).toEqual([]);
  });
});
