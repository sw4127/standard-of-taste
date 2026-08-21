import { describe, it, expect } from "vitest";
import { readableOn, contrastRatio, parseColor, BRAND_ACCENT } from "./readable-on";

const ICE = "hsl(190 75% 62%)";
const GOLD = "hsl(42 80% 62%)";

/**
 * E6/S19 — the live failure this exists to fix, pinned as a number.
 *
 * "Share these ears" was measured on the rendered page at 1.83:1, white on
 * ice. WCAG AA wants 4.5:1 at 14px bold. These tests assert the FIX clears the
 * bar rather than merely changing the colour.
 */
describe("readableOn — the accents actually in the product", () => {
  it("reproduces the shipped failure so it cannot come back unnoticed", () => {
    expect(contrastRatio("#fff", ICE)!).toBeLessThan(2);
    expect(contrastRatio("#fff", GOLD)!).toBeLessThan(2);
  });

  it("chooses ink that clears AA on both accents", () => {
    for (const accent of [ICE, GOLD]) {
      const ink = readableOn(accent);
      expect(ink, `${accent} should take black ink`).toBe("#000");
      expect(contrastRatio(ink, accent)!, `${accent} contrast`).toBeGreaterThan(4.5);
    }
  });

  it("still picks white on a genuinely dark accent", () => {
    expect(readableOn("hsl(220 60% 22%)")).toBe("#fff");
    expect(readableOn("#101318")).toBe("#fff");
  });

  it("keeps the shipped behaviour for anything it cannot read", () => {
    // Silently recolouring an accent nobody measured is not an improvement.
    expect(readableOn("var(--accent)")).toBe("#fff");
    expect(readableOn("rebeccapurple")).toBe("#fff");
    expect(readableOn("")).toBe("#fff");
  });
});

describe("parseColor — the formats the product actually writes", () => {
  it("reads space-separated hsl, the form every accent uses", () => {
    expect(parseColor(ICE)).toEqual([85, 207, 231]);
  });

  it("reads comma-separated hsl too, which the card routes use", () => {
    expect(parseColor("hsl(190, 75%, 62%)")).toEqual([85, 207, 231]);
  });

  it("reads hex in both lengths and rgb", () => {
    expect(parseColor("#fff")).toEqual([255, 255, 255]);
    expect(parseColor("#08090b")).toEqual([8, 9, 11]);
    expect(parseColor("rgb(85, 207, 231)")).toEqual([85, 207, 231]);
  });

  it("handles a fully desaturated hsl without dividing by zero", () => {
    expect(parseColor("hsl(0 0% 50%)")).toEqual([128, 128, 128]);
  });

  it("returns null rather than a wrong colour", () => {
    expect(parseColor("var(--accent)")).toBeNull();
    expect(parseColor("chartreuse")).toBeNull();
  });
});

/**
 * E6/S22 — the mirrored accent must not drift from the stylesheet.
 *
 * `BRAND_ACCENT` duplicates `--accent` because a server component cannot read a
 * CSS custom property. Duplication is the exact defect this session removed
 * from the rung table, the coin's chance value, the launch kit, the confidence
 * level and the share-link format — so the copy is allowed only because this
 * test reads the real stylesheet and fails when they disagree.
 */
describe("E6/S22 — BRAND_ACCENT tracks globals.css", () => {
  it("matches the --accent declared in the stylesheet", async () => {
    const { readFileSync } = await import("node:fs");
    const css = readFileSync("src/app/globals.css", "utf8");
    const m = /--accent:\s*(#[0-9a-fA-F]{3,8})\s*;/.exec(css);
    expect(m, "--accent is no longer a hex literal in globals.css").toBeTruthy();
    expect(m![1].toLowerCase()).toBe(BRAND_ACCENT.toLowerCase());
  });

  it("the paid CTA's ink clears AA on it", () => {
    // 18px/700 is just under the 18.66px large-text threshold, so it needs 4.5.
    expect(contrastRatio("#fff", BRAND_ACCENT)!).toBeLessThan(4.5);
    expect(contrastRatio(readableOn(BRAND_ACCENT), BRAND_ACCENT)!).toBeGreaterThan(4.5);
  });
});
