import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, sep } from "node:path";
import { describe, expect, it } from "vitest";
import { MACHINES } from "@/components/OtherMachines";
import {
  DELICACY_ICE,
  DELICACY_ICE_GLOW,
  PRESTIGE_GOLD,
  PRESTIGE_GOLD_GLOW,
  THRESHOLD_BASE,
  THRESHOLD_FIELD,
  THRESHOLD_VIOLET,
  THRESHOLD_VIOLET_GLOW,
  tint,
} from "@/content/instrument-accents";

/**
 * E10/S1 (Track F3) — `tint` ASSUMED ITS INPUT AND SAID NOTHING WHEN WRONG.
 *
 * The defect and the reasoning live in `instrument-accents.ts`. This file is
 * the guard, and it checks BOTH directions on purpose, because this repository
 * has now shipped four separate defects past a guard that was only ever asked
 * whether things were fine:
 *
 *   1. every accent that actually reaches `tint` at runtime survives it, and
 *   2. every colour shape that used to fail silently now throws.
 *
 * A guard that has only ever returned "clean" is not known to check anything.
 */

/** The tinted shape: the accent, with an alpha channel appended. */
const TINTED = /^hsl\(\s*[\d.]+\s+[\d.]+%\s+[\d.]+%\s+\/\s+0\.35\)$/;

describe("tint survives everything that actually reaches it", () => {
  /**
   * DERIVED, NOT TYPED OUT. `MACHINES` is the real runtime input set: both card
   * surfaces (`OtherMachines` and the `/learn` index) map over it and hand each
   * `accent` straight to `tint`. Listing the three colours by hand here would
   * be a fourth copy of the registry and a fourth thing to forget — whereas a
   * new instrument added to `MACHINES` is covered by this test the moment it is
   * added, whether or not anyone remembers this file exists.
   */
  it("tints every machine accent in the live registry", () => {
    expect(
      MACHINES.length,
      "the machine registry is empty, so this test proves nothing",
    ).toBeGreaterThan(0);
    for (const m of MACHINES) {
      expect(tint(m.accent), `${m.id} (${m.accent}) does not tint to a valid colour`).toMatch(
        TINTED,
      );
    }
  });

  it("tints each accent the registry exports by name", () => {
    for (const accent of [PRESTIGE_GOLD, DELICACY_ICE, THRESHOLD_VIOLET]) {
      expect(tint(accent), `${accent} does not tint to a valid colour`).toMatch(TINTED);
    }
  });

  it("appends alpha rather than replacing anything in the accent", () => {
    expect(tint("hsl(42 80% 62%)")).toBe("hsl(42 80% 62% / 0.35)");
    expect(tint("hsl(190 75% 62%)")).toBe("hsl(190 75% 62% / 0.35)");
    expect(tint("hsl(276 70% 70%)")).toBe("hsl(276 70% 70% / 0.35)");
  });

  /**
   * The cross-check. `MACHINES` can drift from the registry it imports from — a
   * card could be handed a literal instead of a named export, which is exactly
   * the leak this registry exists to prevent (E7/S18, E7/S21).
   */
  it("every machine accent IS one of the registry's named accents", () => {
    const named = new Set([PRESTIGE_GOLD, DELICACY_ICE, THRESHOLD_VIOLET]);
    for (const m of MACHINES) {
      expect(
        named.has(m.accent),
        `${m.id} carries ${m.accent}, which is not one of the registry's named accents`,
      ).toBe(true);
    }
  });
});

describe("tint refuses the shapes it used to corrupt", () => {
  /**
   * THE OTHER DIRECTION. Each of these is either a real value exported by this
   * codebase or a shape a future accent could plausibly take, and every one of
   * them produced A WRONG COLOUR WITH NO ERROR under the old regex.
   */
  const REFUSED: [string, string][] = [
    [
      THRESHOLD_BASE,
      "a hex colour this very registry exports — old behaviour: returned unchanged, border at full opacity",
    ],
    [
      PRESTIGE_GOLD_GLOW,
      "an accent that already carries alpha — old behaviour: 'hsl(... / 0.4 / 0.35)', invalid CSS, declaration dropped",
    ],
    [DELICACY_ICE_GLOW, "the same, in delicacy's hue"],
    [THRESHOLD_VIOLET_GLOW, "the same, in threshold's hue"],
    ["#ffcc55", "any hex accent"],
    ["rgb(255 204 85)", "an rgb accent"],
    ["var(--brand)", "a CSS custom property"],
    [
      "hsl(42, 80%, 62%)",
      "legacy comma hsl — it matched the old regex, and mixing comma syntax with a slash alpha is invalid CSS",
    ],
    ["", "an empty string, which the old regex returned still empty"],
  ];

  for (const [value, why] of REFUSED) {
    it(`throws on ${JSON.stringify(value)} — ${why}`, () => {
      expect(() => tint(value)).toThrow(/not a plain/);
    });
  }

  it("the ambient field colours still pass, so the throws above are not vacuous", () => {
    // If the shape check were written so that NOTHING matched, every test in
    // this describe block would still pass — by throwing on everything. These
    // must not throw.
    for (const c of THRESHOLD_FIELD) {
      expect(tint(c), `${c} should be a tintable accent shape`).toMatch(TINTED);
    }
  });
});

describe("the silent version cannot come back", () => {
  /**
   * THE OLD REGEX IS BANNED FROM `src/` WITH NO FILE EXCEPTED — including
   * `instrument-accents.ts`, which is why `tint` slices the string instead of
   * replacing into it, and including this file, which is why the needle below
   * is assembled from two halves rather than written out. An exception list is
   * precisely how the third copy survived: two files were known about, and the
   * one typed inline in a JSX `style` prop was not.
   */
  const NEEDLE = "replace(/" + "\\)$/";

  function tsFiles(dir: string, out: string[] = []): string[] {
    for (const entry of readdirSync(dir)) {
      const p = join(dir, entry);
      if (statSync(p).isDirectory()) tsFiles(p, out);
      else if (/\.tsx?$/.test(entry)) out.push(p);
    }
    return out;
  }

  const posix = (p: string) => p.split(sep).join("/");

  it("the needle detects the real defect, as it really was", () => {
    /*
     * NON-CIRCULAR ON PURPOSE. A self-test that builds its own sample by
     * concatenating the needle proves only that `includes` works. This reads
     * the three copies as they stood at b19f805, byte-for-byte, from a fixture
     * the sweep cannot see (it scans .ts/.tsx only). If the needle ever stops
     * matching the defect it was written for, this goes red — which is the
     * failure mode of every guard in this repository that only ever said
     * "clean".
     */
    const before = readFileSync("src/content/__fixtures__/tint-before-e10s1.txt", "utf8");
    expect(before, "the fixture is missing its sample").toContain("0.35");
    expect(
      before.includes(NEEDLE),
      "the needle no longer matches the line this guard exists to catch",
    ).toBe(true);
    // And it does not match a correct implementation.
    expect(`const t = (a: string) => a.slice(0, -1) + " / 0.35)";`.includes(NEEDLE)).toBe(false);
  });

  it("no file re-implements the tint regex", () => {
    const files = tsFiles("src");
    expect(files.length, "found no source files, so this sweep proves nothing").toBeGreaterThan(100);
    const offenders = files.filter((f) => readFileSync(f, "utf8").includes(NEEDLE)).map(posix);
    expect(
      offenders,
      "These files hand-roll the tint regex instead of importing tint() from " +
        "@/content/instrument-accents. It returns the wrong colour, without erroring, " +
        "for any accent that is not plain hsl():\n" + offenders.join("\n"),
    ).toEqual([]);
  });

  it("only the registry defines tint", () => {
    const definers = tsFiles("src")
      .filter((f) => /(?:function|const)\s+tint\b/.test(readFileSync(f, "utf8")))
      .map(posix);
    expect(definers).toEqual(["src/content/instrument-accents.ts"]);
  });
});
