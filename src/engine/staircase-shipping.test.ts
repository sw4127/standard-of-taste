import { sessionInstances } from "./trial-instances";
import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { STAIRCASE_FAMILIES, ladderLevels, clipFor, referenceFor } from "./staircase-manifest";
import { eligibleSources, isSourceLocked } from "./staircase-pool";

/**
 * THE BUG THIS EXISTS TO PREVENT SHIPPED, AND NOTHING CAUGHT IT (RT-88a).
 *
 * `public/audio/staircase/` was git-ignored while the Gym was built on top of
 * it. Every test passed, the dev server played every clip, and the machine was
 * unusable on the deployed site because not one of its 400 files had ever left
 * the laptop it was rendered on. `staircase-manifest.test.ts` checks the same
 * files are ON DISK — which was true, on the one machine where it mattered
 * least. On disk and in the deploy are different facts, and only one of them is
 * what a stranger gets.
 *
 * So this asserts the set equality, in BOTH directions, against git rather than
 * the filesystem:
 *
 *   reachable ⊆ tracked   a session asks for a clip that was never deployed
 *   tracked ⊆ reachable   a re-render's `git add -A` sweeps files onto a public
 *                         CDN — including the 20 timing clips on pb1@120s and
 *                         pb6@75s whose drift trajectory the correlator could
 *                         not verify (RT-75a), which `clipFor` refuses to serve
 *                         precisely because their labels are not corroborated
 *
 * Both directions have already happened once. The first is RT-88a. The second
 * is the reason the directory stays ignored even now that its contents are
 * tracked — see the note in `.gitignore`.
 *
 * `includeRetired` is TRUE here on purpose: PM ruling RT-94a (b) ships pb6's
 * lossy ladder even though no session presents it, because `/lab/instrument-
 * limits` publishes that ladder as part of the measured record and a reader
 * shown a record they cannot check is being shown nothing.
 */
function reachableClips(): Set<string> {
  const files = new Set<string>();
  for (const family of STAIRCASE_FAMILIES) {
    for (const source of eligibleSources(family, true)) {
      const locked = isSourceLocked(family) ? source : undefined;
      // A pooled family's instances do not vary by source; walking it once per
      // source would be harmless but slow, and slow tests get deleted.
      if (!locked && source !== eligibleSources(family, true)[0]) continue;
      for (const instance of sessionInstances(family, locked)) {
        files.add(referenceFor(instance.sourceId, instance.startSec).file);
        for (const level of ladderLevels(family, locked)) {
          try {
            files.add(clipFor(family, instance.sourceId, instance.startSec, level).file);
          } catch {
            // This window has no render at this rung. `ladderLevels` is the
            // family's ladder, not this window's, and the two differ wherever
            // the renderer or Layer A dropped a rung.
          }
        }
      }
    }
  }
  return files;
}

function trackedClips(): Set<string> | null {
  try {
    const out = execFileSync("git", ["ls-files", "-z", "public/audio/staircase"], {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return new Set(
      out
        .split("\0")
        .filter(Boolean)
        .map((p) => p.slice(p.lastIndexOf("/") + 1)),
    );
  } catch {
    return null;
  }
}

describe("E6/S3 — the shipping pool is exactly what git carries (RT-88a)", () => {
  const tracked = trackedClips();
  const available = tracked !== null;

  it.skipIf(!available)("every clip a session or the Lab can reach is tracked by git", () => {
    const reachable = reachableClips();
    const missing = [...reachable].filter((f) => !tracked!.has(f)).sort();
    if (missing.length) {
      throw new Error(
        `${missing.length} reachable clip(s) are NOT tracked by git, so they will 404 in ` +
          `production exactly as RT-88a did — the deploy does not contain them.\n` +
          `First few: ${missing.slice(0, 5).join(", ")}\n` +
          `Fix: regenerate the reachable set and \`git add -f\` those paths. The directory ` +
          `is ignored on purpose; see the note in .gitignore for why, and for the chunked ` +
          `push the commit will need.`,
      );
    }
    expect(missing).toEqual([]);
  });

  it.skipIf(!available)("nothing unreachable has been swept into git", () => {
    const reachable = reachableClips();
    const extra = [...tracked!].filter((f) => !reachable.has(f)).sort();
    if (extra.length) {
      throw new Error(
        `${extra.length} tracked clip(s) are not reachable through the engine. There are TWO ` +
          `causes and they need opposite fixes, so read the list before acting.\n` +
          `First few: ${extra.slice(0, 5).join(", ")}\n\n` +
          `(1) A \`git add -A\` after a re-render swept files into a PUBLIC repo's permanent ` +
          `history and onto a CDN. Some of those are stimuli whose labelled magnitude the audio ` +
          `itself does not corroborate (RT-75a); publishing them is the failure, not the size. ` +
          `Fix: \`git rm --cached\` those paths — removing them from HISTORY, if it matters, is ` +
          `a separate and much larger job.\n\n` +
          `(2) \`reachableClips\` above no longer walks everything the product can reach — a new ` +
          `family, or a changed signature it silently skips. Then these files are FINE and the ` +
          `traversal is what is broken. A whole family going missing shows up here as a large, ` +
          `suspiciously uniform list; that is this check catching the other check, which is why ` +
          `both directions exist. Fix the traversal, not the repo.`,
      );
    }
    expect(extra).toEqual([]);
  });

  /**
   * A silent skip is how RT-88a survived a full test suite, so if git cannot be
   * reached the suite says which guarantee it just stopped providing.
   */
  it("says out loud when it cannot check", () => {
    if (!available) {
      console.log(
        "[E6/S3] SKIPPED — `git ls-files` is unavailable here (no git, or not a work tree). " +
          "Whether the staircase pool is actually in the deploy is UNVERIFIED on this machine.",
      );
    }
    expect(typeof available).toBe("boolean");
  });
});
