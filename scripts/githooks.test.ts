/**
 * THE GATE THAT NOW CARRIES THE LOOP (E19/S6, owner ruling 2026-09-07).
 *
 * The owner removed the per-slice stop: engineering proceeds on its own
 * recommendation rather than waiting for a ruling between slices. The seven-step
 * loop was NOT removed — the ruling was that the red-team, the confession and
 * the north star still run, internally. So their record moved into the commit
 * message, and `.githooks/commit-msg` is the only thing keeping that record from
 * quietly becoming optional.
 *
 * WHICH MAKES IT THE SAME CLASS OF OBJECT AS `pre-push`: a guard that NOTHING
 * NOTICES IF IT DISAPPEARS. Deleting it makes every future commit pass. That is
 * why its existence is pinned here, in the same file-shaped way its neighbour is.
 *
 * WIRING, NOT BEHAVIOUR — and behaviour was proven the way the pre-push hook's
 * was: by running it. The commit that introduced this file touches `scripts/`,
 * so it was gated by the very hook it installs; a message missing the trailers
 * was refused, and the same commit went through once they were there.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel: string) => readFileSync(join(repoRoot, rel), "utf8");

describe("commit-msg hook wiring", () => {
  const hook = () => read(".githooks/commit-msg");

  it("requires every artefact the loop produces", () => {
    const src = hook();
    for (const trailer of ["North-star:", "Red-team:", "Confession:"]) {
      expect(src, `the hook no longer looks for ${trailer}`).toContain(trailer);
    }
    // Three findings, not one. A loop that accepts a single red-team line is a
    // loop that will get a single red-team line.
    expect(src).toMatch(/-ge 3/);
  });

  it("refuses rather than warns", () => {
    // A hook that prints a complaint and exits 0 is decoration. This is the
    // difference between a gate and a sign.
    expect(hook()).toMatch(/exit 1/);
  });

  it("is scoped to commits that touch code, so documentation is not made to recite", () => {
    const src = hook();
    expect(src).toMatch(/diff --cached --name-only/);
    expect(src).toMatch(/\^\(src\|scripts\)\//);
  });

  it("keeps the escape hatch visible in the log rather than pushing it to --no-verify", () => {
    // CLAUDE.md forbids --no-verify without approval, and a bypass leaves no
    // record at all. A hatch that must be written into the message does.
    expect(hook()).toContain("Loop: n/a");
  });

  it("is installed by the same mechanism as the push gate", () => {
    // `core.hooksPath` points at the committed directory, so both hooks run
    // without anyone copying a file into .git/hooks.
    expect(read("scripts/install-hooks.mjs")).toContain("core.hooksPath");
    expect(read("scripts/install-hooks.mjs")).toContain(".githooks");
  });
});

/**
 * PRE-COMMIT: THE LIST OF FILES RULED UNTRACKED (E21, PM ruling RT-AB3 a).
 *
 * WIRING, NOT BEHAVIOUR, same as the block above — the refusal itself was
 * proven by staging `docs/blueprint-phase-2.md` and watching the commit be
 * refused. What this pins is that the hook still exists, still refuses rather
 * than warns, and still names every file the owner ruled out of the repository.
 *
 * THE LIST IS THE POINT. A file leaves it only when the owner rules it in, and
 * that deletion is a visible act in a diff. A hook whose list quietly shrank
 * would be a hook that quietly stopped protecting something.
 */
describe("pre-commit hook wiring", () => {
  const hook = () => read(".githooks/pre-commit");

  it("names every file that is untracked by ruling", () => {
    /*
     * Typed here AND in the hook, deliberately — two copies with one meaning is
     * normally this repository's signature defect, and here it is the
     * mechanism: the whole purpose is that removing a file from the hook's list
     * is a deliberate act, so a second list that must be edited too makes it
     * twice as deliberate. The test names the ruling for each, which the hook
     * cannot.
     */
    const RULED_OUT = [
      // RT-M:c and RT-X:c — the planning documents, kept off a public repo.
      "docs/blueprint-phase-2.md",
      "docs/blueprint-phase-3.md",
      "docs/redirection-blueprint-2026-08-26.md",
      // Never ruled on at all, which is not the same as ruled in.
      "docs/experience-bank-2026-09-14.md",
      "docs/experience-bank-composed-2026-09-14.md",
      "docs/activation-2026-09-16-tracks-U-T.md",
      "docs/activation-2026-09-22-track-V-consistency.md",
    ];
    const text = hook();
    const missing = RULED_OUT.filter((f) => !text.includes(f));
    expect(
      missing,
      "the pre-commit hook no longer names these files, so staging one would be committed " +
        "silently and pushed to a PUBLIC repository:" + String.fromCharCode(10) + missing.join(String.fromCharCode(10)),
    ).toEqual([]);
  });

  it("refuses rather than warns", () => {
    expect(hook()).toContain("exit 1");
    expect(hook()).toContain("REFUSED");
  });

  it("looks at files being ADDED, not at every staged change", () => {
    // A tracked file being modified is ordinary work. Matching on that would
    // make the hook fire constantly and teach everyone to pass --no-verify.
    expect(hook()).toContain("--diff-filter=A");
  });

  it("keeps the escape hatch, and says so", () => {
    expect(hook()).toContain("--no-verify");
  });
});

/**
 * THE DOCUMENT IS THE SWITCH, so the document must still say what the machinery
 * reads. `.claude/hooks/slice-latch.py` decides whether to arm by looking for
 * this heading and whether it ends in IN FORCE — a machine-local file this test
 * cannot see, which is exactly why the half that IS in the repository is pinned.
 */
describe("the standing-advance ruling is recorded where it is read from", () => {
  it("names the section and its state in the protocol", () => {
    const protocol = read("docs/slice-protocol.md");
    const heading = protocol
      .split(String.fromCharCode(10))
      .find((line) => line.startsWith("## Standing auto-advance"));
    expect(heading, "the standing-advance section has gone from the protocol").toBeTruthy();
    expect(
      heading!.trim().endsWith("IN FORCE") || heading!.trim().endsWith("SUSPENDED"),
      `the heading must end in IN FORCE or SUSPENDED — it is the switch: "${heading}"`,
    ).toBe(true);
  });

  it("is carried in CLAUDE.md too, since that is the file a session reads for free", () => {
    expect(read("CLAUDE.md")).toContain("Standing auto-advance");
  });
});
