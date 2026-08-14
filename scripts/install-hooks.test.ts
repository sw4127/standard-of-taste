/**
 * The gate that guards the gate (RT-45a).
 *
 * The pre-push hook is the only thing standing between a red tree and a PUBLIC
 * remote, and it is unusual among our checks in that NOTHING NOTICES IF IT
 * DISAPPEARS. A deleted test file makes the suite smaller and quieter; a
 * deleted hook makes the suite optional again, silently, and the next person to
 * push finds out nothing. So the hook's own existence is pinned here.
 *
 * This checks WIRING, not behaviour — that the hook exists, runs the suite, and
 * is actually installed by `prepare`. Behaviour was proven the only way it can
 * be: by pushing a green tree and a red tree at a throwaway local remote and
 * watching one go through and the other get refused.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel: string) => readFileSync(join(repoRoot, rel), "utf8");

/**
 * Drop block and line comments so a check can assert on what the code DOES.
 * Crude — it does not understand comment markers inside string literals — and
 * that is fine for asserting the absence of an API call in a 60-line script.
 */
const stripComments = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

describe("pre-push hook wiring", () => {
  it("the hook exists and runs the test suite", () => {
    const hook = read(".githooks/pre-push");
    expect(hook).toMatch(/vitest run/);
    // Must fail the push on a red suite. If this exit is ever removed the hook
    // still "runs the tests" and stops meaning anything.
    expect(hook).toMatch(/exit 1/);
  });

  it("never reaches the network for a package", () => {
    expect(read(".githooks/pre-push")).toMatch(/npx --no-install/);
  });

  it("npm's prepare lifecycle installs it, so a fresh clone is covered", () => {
    const pkg = JSON.parse(read("package.json")) as { scripts: Record<string, string> };
    expect(pkg.scripts.prepare).toBe("node scripts/install-hooks.mjs");
  });

  it("installs by pointing git at the committed file, never by copying it", () => {
    const installer = read("scripts/install-hooks.mjs");
    expect(installer).toMatch(/core\.hooksPath/);
    // A copy into .git/hooks would give one meaning two files, which is how the
    // two rung tables came to disagree (scripts/clip-pipeline/rungs.mjs).
    //
    // Asserted against CODE, not the file text: the first version of this
    // matched the installer's own comment explaining why it does not copy, and
    // failed. Prose that describes a banned move is not the banned move.
    expect(stripComments(installer)).not.toMatch(/copyFileSync|writeFileSync|\.git[/\\]hooks/);
  });
});
