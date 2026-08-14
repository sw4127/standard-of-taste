/**
 * Point git at the COMMITTED hooks directory (RT-45a).
 *
 * Runs automatically from npm's `prepare` lifecycle, so a fresh clone gets the
 * pre-push gate on its first `npm install` rather than on someone remembering
 * a setup step. A gate that depends on being remembered is not a gate.
 *
 * WHY core.hooksPath RATHER THAN COPYING INTO .git/hooks. A copy means two
 * files with one meaning — the committed one everybody reads and reviews, and
 * the installed one that actually runs. They drift, and the drift is invisible
 * because nothing compares them. That is precisely the bug that shipped two
 * disagreeing rung tables (scripts/clip-pipeline/rungs.mjs). One file, pointed
 * at, cannot drift from itself.
 *
 * WHY NOT husky. It is a dependency, a postinstall, and a directory of
 * generated shims to do what one git config setting does.
 *
 * THIS MUST NEVER BREAK `npm install`. It exits 0 on every failure path: no
 * git binary, not a git repo (npm installing from a tarball), a permissions
 * error. A hook installer that can fail a dependency install is a worse
 * problem than the missing hook it was trying to fix.
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const HOOKS_DIR = ".githooks";

function main() {
  if (!existsSync(join(repoRoot, ".git"))) {
    // A tarball install or a vendored copy. Nothing to configure, not an error.
    return;
  }
  if (!existsSync(join(repoRoot, HOOKS_DIR, "pre-push"))) {
    console.warn(`install-hooks: ${HOOKS_DIR}/pre-push is missing — skipping.`);
    return;
  }

  const current = read(["config", "--local", "--get", "core.hooksPath"]);
  if (current === HOOKS_DIR) return; // already installed, stay quiet

  execFileSync("git", ["config", "--local", "core.hooksPath", HOOKS_DIR], {
    cwd: repoRoot,
    stdio: "ignore",
  });
  console.log(`install-hooks: core.hooksPath -> ${HOOKS_DIR} (pre-push runs the test suite).`);
}

/** git exits non-zero when a config key is simply unset; that is not a failure. */
function read(args) {
  try {
    return execFileSync("git", args, { cwd: repoRoot, encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

try {
  main();
} catch (err) {
  console.warn(`install-hooks: skipped (${err instanceof Error ? err.message : String(err)})`);
}
