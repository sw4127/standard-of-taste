/**
 * THE PIN CONTAINS THE AUDIO IT PROMISES (E19/S21, PM ruling RT-Z8 a).
 *
 * The instrument's clips are now served from a CDN reading a fixed commit of
 * the public repository, which took 154 MB out of every deployment. It also
 * moved the failure mode: a clip that is not in the PINNED COMMIT does not 404
 * at build time or in any test that looks at the working tree — it 404s in a
 * listener's browser, and the player holds the rating gate closed on a load
 * failure, so the session stops.
 *
 * SO THE PIN IS CHECKED AGAINST GIT, NOT AGAINST THE NETWORK. `git cat-file`
 * answers "is this path in that commit's tree" offline, deterministically, and
 * without asking jsDelivr anything. A network check would be slower, flaky, and
 * would pass or fail for reasons that have nothing to do with the repository.
 *
 * WHAT THIS CANNOT CHECK, and it is the important limit: whether the pinned
 * commit has been PUSHED. jsDelivr reads GitHub, not this working copy, so a
 * pin to a local-only commit passes every test here and serves nothing. The
 * ancestry check below is the closest available proxy — a commit that is an
 * ancestor of HEAD and older than the working tree is one that has had the
 * chance to be pushed — and it is a proxy, not a proof.
 */
import { execSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { AUDIO_PIN, AUDIO_REPO, AUDIO_ROOT, audioUrl } from "./audio-host";
import manifest from "@/content/delicacy/staircase.json";

const pool = manifest as unknown as {
  instanceWindows: Record<string, { sourceId: string; startSec: number }[]>;
  clips: { family: string; sourceId: string; startSec: number; file: string }[];
  references: { sourceId: string; startSec: number; file: string }[];
};

/**
 * The pinned tree, read ONCE.
 *
 * The first version called `git cat-file -e` per file: 420 subprocesses and 22
 * seconds, in a suite people run constantly. One `ls-tree` is the same answer
 * for the cost of one process, and a guard nobody wants to wait for is a guard
 * somebody eventually skips.
 */
function pinnedFiles(): Set<string> {
  const out = execSync(`git ls-tree -r --name-only ${AUDIO_PIN} -- ${AUDIO_ROOT}/staircase`, {
    encoding: "utf8",
    maxBuffer: 8 * 1024 * 1024,
  });
  return new Set(out.split(NL).filter(Boolean).map((p) => p.split("/").pop() as string));
}

const NL = String.fromCharCode(10);

/** `family|sourceId|startSec` for every window the rotation can select. */
function liveWindows(): Set<string> {
  const keys = new Set<string>();
  for (const [family, windows] of Object.entries(pool.instanceWindows)) {
    for (const w of windows) keys.add(`${family}|${w.sourceId}|${w.startSec}`);
  }
  return keys;
}

describe("the pinned audio commit", () => {
  it("is a real commit in this history", () => {
    expect(AUDIO_PIN, "the pin must be a full 40-character sha, not an abbreviation").toHaveLength(40);
    const type = execSync(`git cat-file -t ${AUDIO_PIN}`, { encoding: "utf8" }).trim();
    expect(type, "the pin does not name a commit").toBe("commit");
  });

  /**
   * A pin newer than HEAD, or on another branch, is a pin this checkout cannot
   * vouch for. This is the proxy for "has it been pushed" — see the header.
   */
  it("is an ancestor of what is checked out", () => {
    let ancestor = true;
    try {
      execSync(`git merge-base --is-ancestor ${AUDIO_PIN} HEAD`, { stdio: "ignore" });
    } catch {
      ancestor = false;
    }
    expect(
      ancestor,
      "the pinned commit is not an ancestor of HEAD, so this checkout cannot confirm the CDN " +
        "can see it. jsDelivr reads GitHub, not this machine.",
    ).toBe(true);
  });

  it("builds a URL against that commit, for the right repository", () => {
    const url = audioUrl("staircase/st-pb1-w1-lossy-112.mp3");
    expect(url).toContain(`/gh/${AUDIO_REPO}@${AUDIO_PIN}/`);
    expect(url).toContain(`/${AUDIO_ROOT}/staircase/`);
    expect(url.startsWith("https://"), url).toBe(true);
    // A leading slash in the caller's path must not produce a double slash.
    expect(audioUrl("/staircase/x.mp3")).toBe(audioUrl("staircase/x.mp3"));
  });

  /**
   * THE ONE THAT MATTERS. Every clip the ladder can serve must be in the tree
   * the CDN is reading.
   */
  it("contains every staircase clip the rotation can serve", () => {
    /*
     * SCOPED TO REACHABILITY, exactly as `staircase-audio-shipped.test.ts` is,
     * and for the reason that test documents: the manifest names 420 files and
     * 400 are tracked, the 20 being leftover renders for two windows that are
     * not in `instanceWindows` and cannot be selected. Failing on those would
     * be a guard crying about clips no listener can reach, which is how a guard
     * gets switched off. If either window is ever promoted, THAT test fails
     * first and names the same files.
     */
    const live = liveWindows();
    const pinned = pinnedFiles();
    expect(pinned.size, "the pinned commit has no staircase audio at all").toBeGreaterThan(100);

    const reachable = pool.clips.filter((c) => live.has(`${c.family}|${c.sourceId}|${c.startSec}`));
    const refs = pool.references.filter((r) =>
      [...live].some((k) => k.endsWith(`|${r.sourceId}|${r.startSec}`)),
    );
    const files = [...new Set([...reachable, ...refs].map((c) => c.file.split("/").pop() as string))];
    expect(files.length, "nothing is reachable, so this passes vacuously").toBeGreaterThan(100);

    const absent = files.filter((f) => !pinned.has(f));
    expect(
      absent.slice(0, 12),
      `${absent.length} of ${files.length} serveable clips are NOT in the pinned commit. They ` +
        "will 404 in every browser while existing perfectly on this machine:",
    ).toEqual([]);
  });
});
