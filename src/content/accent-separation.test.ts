import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { contrastRatio } from "@/lib/pixel-contrast";
import { PRESTIGE_GOLD, DELICACY_ICE, THRESHOLD_VIOLET } from "./instrument-accents";

/**
 * E7/S18 — EACH INSTRUMENT KEEPS ITS OWN COLOUR (RT-148).
 *
 * The colour is how somebody tells two results apart in a feed before reading a
 * word. Threshold used to share Delicacy's ice, so two different tests produced
 * cards that were indistinguishable at a glance.
 *
 * Two things are pinned. That the accents stay far enough apart in HUE to be
 * separable at thumbnail size — the property that actually does the work, and
 * one that survives no amount of good intentions if somebody nudges a value.
 * And that the threshold surfaces stop hardcoding the ice literal, since six
 * copy-pasted colour constants per instrument is what let this drift in the
 * first place.
 */
const NL = String.fromCharCode(10);
const hue = (c: string) => Number(/hsl\((\d+(?:\.\d+)?)/.exec(c)![1]);
const sep = (a: string, b: string) => {
  const d = Math.abs(hue(a) - hue(b));
  return Math.min(d, 360 - d);
};

describe("E7/S18 — three instruments, three accents", () => {
  it("no two accents sit close enough to confuse at thumbnail size", () => {
    const pairs: [string, string, string][] = [
      ["prestige/delicacy", PRESTIGE_GOLD, DELICACY_ICE],
      ["prestige/threshold", PRESTIGE_GOLD, THRESHOLD_VIOLET],
      ["delicacy/threshold", DELICACY_ICE, THRESHOLD_VIOLET],
    ];
    const tooClose = pairs
      .filter(([, a, b]) => sep(a, b) < 60)
      .map(([n, a, b]) => `${n}: ${sep(a, b).toFixed(0)}° apart (${a} vs ${b})`);
    expect(
      tooClose,
      "Two instruments wear near-identical colours, so their result cards read as the " +
        "same test:" + NL + tooClose.join(NL),
    ).toEqual([]);
  });

  it("every accent stays readable on its own near-black ground", () => {
    // An accent that fails contrast is not a brand decision, it is an unreadable
    // card. Measured against the darkest ground any instrument uses.
    const GROUND = { r: 0x07, g: 0x09, b: 0x0b };
    const rgbOf = (c: string) => {
      const [h, s, l] = /hsl\((\d+(?:\.\d+)?) (\d+)% (\d+)%/.exec(c)!.slice(1).map(Number);
      const k = (n: number) => (n + h / 30) % 12;
      const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
      const f = (n: number) => (l / 100 - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))) * 255;
      return { r: f(0), g: f(8), b: f(4) };
    };
    for (const [name, c] of [["gold", PRESTIGE_GOLD], ["ice", DELICACY_ICE], ["violet", THRESHOLD_VIOLET]] as const) {
      const ratio = contrastRatio(rgbOf(c), GROUND);
      expect(ratio, `${name} (${c}) measures ${ratio.toFixed(2)}:1 on #07090B`).toBeGreaterThan(4.5);
    }
  });

  it("no threshold surface hardcodes the delicacy blue any more", () => {
    const files = execSync('git ls-files "src/app/threshold" "src/app/api/threshold-card" "src/content/staircase"', {
      encoding: "utf8",
    })
      .trim()
      .split(NL)
      .filter((f) => /\.tsx?$/.test(f) && !/\.test\.tsx?$/.test(f));
    // THE RANGE, NOT THE EXACT HUE. The first version tested for hsl(190
    // literally and missed three files whose ambient FIELD was built from ice's
    // neighbours — 180, 195, 210, 225. A background is as much the instrument's
    // colour as its accent is, and it was still blue in a violet room.
    const iceFamily = /hsl\(\s*(1[7-9][0-9]|2[0-2][0-9])[\s,]/;
    // CODE ONLY. The first widened version flagged this repo's own comments
    // explaining the rule — a guard that fails on prose about itself is one
    // somebody switches off.
    const isComment = (l: string) => /^\s*(\/\/|\*|\/\*)/.test(l);
    const offenders = files.filter((f) =>
      readFileSync(f, "utf8").split(NL).some((l) => !isComment(l) && iceFamily.test(l)),
    );
    expect(
      offenders,
      "A threshold surface is painting itself Delicacy's blue:" + NL + offenders.join(NL),
    ).toEqual([]);
    expect(files.length, "the sweep found no threshold files").toBeGreaterThan(3);
  });
});
