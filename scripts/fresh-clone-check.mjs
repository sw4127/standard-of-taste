// Run the test suite in a FRESH CLONE of HEAD — what a reviewer who clones this
// repository gets, rather than what this working copy happens to hold.
//
// WHY (2026-09-24). The pre-push gate runs the suite in the working copy, where
// deliberately untracked documents sit beside the tracked ones. One test borrowed
// such a document as its specimen, so the suite was green here and red on every
// fresh clone, and no gate could see it. A fresh clone on this machine also gets
// Windows line endings (core.autocrlf=true), which one PRD guard did not survive.
//
// WHAT IT DOES: clones HEAD into the system temp directory, links this
// repository's node_modules into it (a junction on Windows, so nothing is
// installed or downloaded), runs `vitest run`, and removes the clone. The link is
// removed FIRST and on its own, so the clean-up can never follow it into the real
// node_modules.
//
// Not wired into the pre-push hook: that hook says adding slower checks is a
// deliberate decision, and this roughly doubles a push. Run it at session close:
//   npm run test:fresh
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, lstatSync, mkdtempSync, rmSync, symlinkSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const repo = resolve(".");
const modules = join(repo, "node_modules");
if (!existsSync(modules)) {
  console.error("fresh-clone-check: node_modules is missing here; run npm install first.");
  process.exit(1);
}

const dir = mkdtempSync(join(tmpdir(), "fresh-clone-"));
const clone = join(dir, "repo");
const link = join(clone, "node_modules");
let status = 1;
try {
  execFileSync("git", ["clone", "--quiet", repo, clone], { stdio: "inherit" });
  symlinkSync(modules, link, "junction");
  console.log(`fresh-clone-check: running the suite in ${clone}`);
  const run = spawnSync("npx", ["--no-install", "vitest", "run"], { cwd: clone, stdio: "inherit", shell: true });
  status = run.status ?? 1;
} finally {
  // The link goes first, alone: never recurse through it.
  if (existsSync(link) && lstatSync(link).isSymbolicLink()) unlinkSync(link);
  if (!existsSync(link)) rmSync(dir, { recursive: true, force: true });
  else console.error(`fresh-clone-check: left ${dir} in place; its node_modules link could not be removed safely.`);
}
console.log(status === 0 ? "fresh-clone-check: green on a fresh clone." : "fresh-clone-check: RED on a fresh clone.");
process.exit(status);
