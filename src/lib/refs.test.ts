import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { KNOWN_REFS, isKnownRef } from "./refs";

/**
 * E7/S12 — EVERY ENTRY TAG WE SHIP IS ONE WE WROTE DOWN.
 *
 * `cooldown` shipped on the Threshold flow's snack link with no record of what
 * it meant. The sweep below is what makes that impossible to repeat: a `ref=`
 * literal anywhere we ship must appear in `KNOWN_REFS`.
 *
 * The reason this matters is not tidiness. A mistyped tag does not fail — it
 * invents a channel. `?ref=hnn` produces real-looking traffic under a name
 * nobody recognises while Hacker News under-counts by the same amount, and
 * nothing anywhere goes red.
 */
const NL = String.fromCharCode(10);

/** Files we ship or publish — app code plus the launch kit that goes to channels. */
function shippedFiles(): { file: string; text: string }[] {
  return execSync('git ls-files "src" "docs/launch-post-kit.md"', { encoding: "utf8" })
    .trim()
    .split(NL)
    .filter(Boolean)
    .filter((f) => /\.(tsx?|md)$/.test(f))
    .filter((f) => !/\.test\.tsx?$/.test(f))
    // The registry itself names every value by definition.
    .filter((f) => f !== "src/lib/refs.ts")
    .map((file) => ({ file, text: readFileSync(file, "utf8") }));
}

describe("E7/S12 — the ?ref= registry covers what we ship", () => {
  it("every ref literal in the repo is a registered tag", () => {
    const unknown: string[] = [];
    for (const { file, text } of shippedFiles()) {
      for (const m of text.matchAll(/[?&]ref=([a-z0-9_-]+)/gi)) {
        const ref = m[1].toLowerCase();
        if (!isKnownRef(ref)) unknown.push(`${file}: ?ref=${ref}`);
      }
    }
    expect(
      unknown,
      "These entry tags are shipped but undocumented. A tag nobody wrote down is " +
        "indistinguishable from a typo, and a typo invents a channel instead of failing:" +
        NL + unknown.join(NL),
    ).toEqual([]);
  });

  it("finds tags at all, so a silent pass means something", () => {
    // The check above passes trivially if the pattern stops matching. This is
    // the tripwire — the same vacuity that let the claims sweep miss fifteen
    // files while reporting success.
    let found = 0;
    for (const { text } of shippedFiles()) found += [...text.matchAll(/[?&]ref=([a-z0-9_-]+)/gi)].length;
    expect(found, "the sweep found no ref tags at all — the pattern is broken").toBeGreaterThan(8);
  });

  it("would catch a plausible typo", () => {
    // Proven in both directions, on the failure that actually costs data: a tag
    // one character off a real channel.
    expect(isKnownRef("hn")).toBe(true);
    expect(isKnownRef("hnn")).toBe(false);
    expect(isKnownRef("cooldown")).toBe(true);
  });

  it("every registered tag says what it MEANS, not just that it exists", () => {
    // A registry of bare strings is a list of things nobody can interpret six
    // months later — which is the state `cooldown` was already in.
    for (const [ref, meaning] of Object.entries(KNOWN_REFS)) {
      expect(meaning.length, `${ref} has no description`).toBeGreaterThan(15);
    }
  });

  it("keeps the default the capture layer actually writes", () => {
    // `captureAttribution` falls back to "direct"; if that string ever changes,
    // the registry stops describing the largest bucket in the data.
    const analytics = readFileSync("src/lib/analytics.ts", "utf8");
    expect(analytics).toContain('sp.get("ref") ?? "direct"');
    expect(isKnownRef("direct")).toBe(true);
  });
});
