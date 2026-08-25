import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { readableOn, contrastRatio } from "@/lib/readable-on";
import { PRESTIGE_GOLD, DELICACY_ICE, THRESHOLD_VIOLET } from "@/content/instrument-accents";

/**
 * E7/S20 — THE INK ON A COLOURED BUTTON IS DERIVED, NOT ASSERTED.
 *
 * `readableOn` was written in E6/S19 because the delicacy result's primary call
 * to action rendered white on ice at 1.83:1 — the least readable thing on the
 * most important button. It picks ink from measured luminance.
 *
 * Eleven accent-backed buttons across the gym did not call it. They hardcoded
 * `text-black`, which happened to be right for all three accents — gold 11.96:1,
 * ice 11.47:1, violet 7.26:1 — and was right BY LUCK. The ink was not a function
 * of the background, so nothing connected them: change an accent and the ink
 * stays put. E7/S18 changed one.
 *
 * Two checks, because the hazard has two halves. That the ink is derived at all,
 * which is a source-level fact. And that whatever `readableOn` returns actually
 * clears the floor, which no amount of deriving guarantees — an accent at middling
 * luminance fails against both black and white, and the function has to return
 * something.
 */
const NL = String.fromCharCode(10);
const AAA = 7;

describe("E7/S20 — every accent-backed button derives its ink", () => {
  it("no gym surface hardcodes an ink class on a coloured background", () => {
    const files = execSync('git ls-files "src/app"', { encoding: "utf8" })
      .trim()
      .split(NL)
      .filter((f) => /\.tsx$/.test(f) && !/\.test\.tsx$/.test(f));
    const offenders: string[] = [];
    for (const file of files) {
      const lines = readFileSync(file, "utf8").split(NL);
      lines.forEach((line, i) => {
        if (!/\btext-(black|white)\b/.test(line)) return;
        // Only a problem when the very next line paints a background from a
        // colour token — a text-black on a plain surface is nobody's business.
        const next = lines[i + 1] ?? "";
        if (/background:\s*[A-Z_]{3,}/.test(next)) {
          offenders.push(`${file}:${i + 1}  ${line.trim().slice(0, 60)}`);
        }
      });
    }
    expect(
      offenders,
      "These buttons assert their ink instead of deriving it from the background. " +
        "Change the accent and the ink stays where it is:" + NL + offenders.join(NL),
    ).toEqual([]);
  });

  it("readableOn's choice clears the ENHANCED floor, not just the minimum", () => {
    // AA (4.5:1) is not a real bar here, and pinning it would be vacuous: black
    // clears it whenever luminance >= 0.175 and white whenever <= 0.183, so one
    // of the two ALWAYS works and the test could never fail. AAA (7:1) can fail
    // — both lose for anything in the middle — so that is the bar worth holding.
    const bad: string[] = [];
    const rows: string[] = [];
    for (const [name, accent] of [
      ["prestige gold", PRESTIGE_GOLD],
      ["delicacy ice", DELICACY_ICE],
      ["threshold violet", THRESHOLD_VIOLET],
    ] as const) {
      const ink = readableOn(accent);
      const ratio = contrastRatio(ink, accent);
      // null means a colour this checker cannot parse, which is itself a
      // failure: an unreadable accent and an unmeasurable one are the same risk.
      expect(ratio, `${name}: contrastRatio could not read ${ink} on ${accent}`).not.toBeNull();
      rows.push(`${name}: ${ink} on ${accent} = ${ratio!.toFixed(2)}:1`);
      if (ratio! < AAA) bad.push(rows[rows.length - 1]);
    }
    expect(
      bad,
      "An accent no longer clears 7:1 with the best ink available. Deriving the ink cannot " +
        "help once neither black nor white works — the ACCENT has to move:" + NL + rows.join(NL),
    ).toEqual([]);
  });

  it("would catch an accent that no ink can rescue", () => {
    // Proven downward, at the bar that can actually fail. A mid-luminance colour
    // loses against black and white alike.
    const impossible = "hsl(276 40% 47%)";
    const r = contrastRatio(readableOn(impossible), impossible);
    expect(r).not.toBeNull();
    expect(r!).toBeLessThan(AAA);
  });

  it("agrees with the defect that started all this", () => {
    // White on ice measured 1.83:1 on a live page in E6/S19. If this number
    // moves, either the accent changed or the meter did.
    expect(contrastRatio("#ffffff", DELICACY_ICE)!).toBeCloseTo(1.83, 1);
  });
});
