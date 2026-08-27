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

/** Every `.ts`/`.tsx` under `src/`. Module scope: three sweeps below use it. */
function tsFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) tsFiles(p, out);
    else if (/\.tsx?$/.test(entry)) out.push(p);
  }
  return out;
}

const posix = (p: string) => p.split(sep).join("/");

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
   * E10/S2b. The four alphas that were already in the codebase when S1 decided
   * one baked-in value was enough. Each is a real call site.
   */
  it("carries every alpha the product actually uses", () => {
    expect(tint(PRESTIGE_GOLD)).toBe("hsl(42 80% 62% / 0.35)"); // GymFloor, unselected edge
    expect(tint(PRESTIGE_GOLD, 0.1)).toBe("hsl(42 80% 62% / 0.1)"); // GymFloor, selected fill
    expect(tint(PRESTIGE_GOLD, 0.25)).toBe("hsl(42 80% 62% / 0.25)"); // GymFloor, selected glow
    expect(tint(THRESHOLD_VIOLET, 0.3)).toBe("hsl(276 70% 70% / 0.3)"); // /threshold family cards
  });

  it("refuses an alpha outside 0..1", () => {
    // 35 instead of 0.35 renders fully opaque in every browser, silently —
    // the same failure family as an unsupported colour shape.
    for (const bad of [0, -0.5, 1.5, 35, Number.NaN]) {
      expect(() => tint(PRESTIGE_GOLD, bad), `alpha ${bad} was accepted`).toThrow(/alpha/);
    }
    // And the legitimate edges are not refused.
    expect(tint(PRESTIGE_GOLD, 1)).toBe("hsl(42 80% 62% / 1)");
    expect(tint(PRESTIGE_GOLD, 0.01)).toBe("hsl(42 80% 62% / 0.01)");
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
    // And it does not match the correct implementation — read from the real
    // registry rather than from a sample string, so this cannot drift from it.
    expect(readFileSync("src/content/instrument-accents.ts", "utf8").includes(NEEDLE)).toBe(false);
  });

  /**
   * THE SWEEP ABOVE WAS TOO NARROW, AND SAID "CLEAN" ANYWAY (E10/S2b).
   *
   * S1's needle was the old REGEX form. Two files were appending an alpha to
   * an accent with `slice(0, -1)` instead — four sites, at 0.35, 0.10, 0.25 and
   * 0.3 — and the sweep could not see any of them while reporting no
   * offenders. S1's red-team predicted this hole in words and shipped without
   * closing it; S2's guard work found it by accident.
   *
   * So the rule is stated by what it PRODUCES rather than by how it is spelled:
   * building an `hsl(... / a)` string by string surgery is the sanctioned job
   * of exactly one function, in exactly one file. This is an equality
   * assertion, not an exception list — if `instrument-accents.ts` ever stops
   * being the place that does it, this fails too.
   */
  /*
   * Matches an alpha appended to a sliced colour, whether the alpha is a
   * literal (`/ 0.35)`, how all four offenders were written) or an
   * interpolation (`/ ${alpha})`, how the registry itself is written). The
   * narrower literal-only version was tried first and reported ZERO builders
   * including the sanctioned one — a sweep that finds nothing anywhere is the
   * exact failure this test exists to stop being.
   */
  const APPEND = /slice\(\s*0\s*,\s*-1\s*\)[^\n]*\/\s*(?:[\d.]+|\$\{[^}]+\})\)/;

  it("the alpha-append needle matches the four sites S1's needle could not see", () => {
    const before = readFileSync("src/content/__fixtures__/alpha-append-before-e10s2b.txt", "utf8");
    const hits = before.split("\n").filter((l) => APPEND.test(l));
    expect(
      hits.length,
      "the needle no longer matches the alpha-appends this guard exists to catch:\n" + before,
    ).toBe(4);
    // It does not fire on an ordinary array slice — `across.ts` has one.
    expect(APPEND.test(`\${names.slice(0, -1).join(", ")} and \${names.at(-1)}`)).toBe(false);
  });

  it("exactly one file builds a colour by string surgery", () => {
    const files = tsFiles("src");
    expect(files.length, "found no source files, so this sweep proves nothing").toBeGreaterThan(100);
    const builders = files.filter((f) => APPEND.test(readFileSync(f, "utf8"))).map(posix);
    expect(
      builders,
      "These files append an alpha to a colour by hand instead of calling tint(). " +
        "Hand any of them a hex accent and the result is not a colour, with no error " +
        "anywhere — which is the defect E10/S1 was supposed to have ended:\n" +
        builders.join("\n"),
    ).toEqual(["src/content/instrument-accents.ts"]);
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

describe("the registry's values are declared in exactly one place", () => {
  /**
   * E10/S4a — THE DEFECT RT-AB WAS RULED ON.
   *
   * `hsl(42 80% 62%)` was re-typed as a local `const GOLD` in thirteen files
   * and `hsl(190 75% 62%)` as `const ICE` in four, while this registry existed
   * for the sole purpose of holding them once. Nothing was visibly wrong; the
   * hazard is that changing a colour here changes one file in twenty and the
   * other nineteen quietly keep the old one. That has already happened in this
   * repository twice — the Threshold Test's main control rendered in the
   * Delicacy Trials' blue for a slice (E7/S21), and `PRESTIGE_GOLD_GLOW` held
   * a value no page had ever rendered until E10/S4a corrected it.
   *
   * The allow-list below has exactly two entries and is asserted by EQUALITY,
   * not by exclusion: a third file holding a registry value fails, and so does
   * either of these two ceasing to. Both sit beside the definition and are
   * about the values themselves rather than about painting anything with them.
   *
   * THE HOLE, STATED: a new hardcoded accent added INSIDE
   * `instrument-accents.test.ts` would not be caught. That is the price of
   * letting the exact-output tests keep their literal arguments, which they
   * need — `expect(tint(PRESTIGE_GOLD))` compared against a string built from
   * `PRESTIGE_GOLD` would assert nothing.
   */
  const OWNED = [PRESTIGE_GOLD, DELICACY_ICE, THRESHOLD_VIOLET, PRESTIGE_GOLD_GLOW, DELICACY_ICE_GLOW, THRESHOLD_VIOLET_GLOW];

  const ALLOWED = [
    // Exact-output tests, which need literal arguments to assert anything.
    "src/content/instrument-accents.test.ts",
    // The definitions themselves.
    "src/content/instrument-accents.ts",
    /*
     * Contrast regression pins. Every assertion in that file is tied to these
     * exact colours — the 1.83:1 a shipped page measured, the ink that clears
     * AA on them. Importing the registry there would silently re-point them at
     * a new accent and the file would keep passing under a heading claiming it
     * tests the product's accents. It holds literals AND asserts they still
     * equal the registry, so drift fails there with an instruction instead of
     * failing here with a demand to delete the pin.
     */
    "src/lib/readable-on.test.ts",
  ].sort();

  it("the values it owns are distinct, so this test cannot pass by collision", () => {
    expect(new Set(OWNED).size).toBe(OWNED.length);
  });

  it("no other file re-types a colour the registry owns", () => {
    const files = tsFiles("src");
    expect(files.length, "found no source files, so this sweep proves nothing").toBeGreaterThan(100);
    const holders = files
      .filter((f) => {
        const text = readFileSync(f, "utf8");
        // The QUOTED literal — prose mentioning a colour in a comment uses
        // backticks and is not a declaration of it.
        return OWNED.some((v) => text.includes(`"${v}"`));
      })
      .map(posix)
      .sort();
    expect(
      holders,
      "These files re-type a colour that @/content/instrument-accents already " +
        "owns. Import the named constant instead — otherwise changing the accent " +
        "there changes some of the product and not the rest:\n" + holders.join("\n"),
    ).toEqual(ALLOWED);
  });
});
