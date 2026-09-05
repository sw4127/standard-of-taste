import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, sep } from "node:path";
import { describe, expect, it } from "vitest";
import { MACHINES } from "@/components/OtherMachines";
import { contrastRatio, parseColor } from "@/lib/readable-on";
import {
  DELICACY_FIELD,
  DELICACY_ICE,
  DELICACY_ICE_GLOW,
  DELICACY_PALETTE,
  FIELD_CHOOSING,
  FIELD_MEASURING,
  FIELD_READING,
  GYM_FIELD,
  PRESTIGE_FIELD,
  PRESTIGE_GOLD,
  PRESTIGE_GOLD_GLOW,
  PRESTIGE_PALETTE,
  THRESHOLD_PALETTE,
  THRESHOLD_BASE,
  THRESHOLD_FIELD,
  THRESHOLD_VIOLET,
  THRESHOLD_VIOLET_GLOW,
  SPREAD_ROSE,
  GYM_INK,
  GYM_INK_BRIGHT,
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
    const named = new Set([PRESTIGE_GOLD, DELICACY_ICE, THRESHOLD_VIOLET, SPREAD_ROSE]);
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

describe("the ambient fields are declared once too", () => {
  /**
   * E10/S4b — THE ARRAY VERSION OF THE SAME DEFECT.
   *
   * The gold field was re-typed verbatim in seven files and the delicacy field
   * in two, while `THRESHOLD_FIELD` sat in the registry doing the job properly
   * for the one instrument that had bothered. The sweep in S4a matched single
   * quoted colours and so could not see any of it — a four-element array is
   * seven quoted colours in a row, and no one of them is a registry value.
   *
   * So this checks the FIRST COLOUR of each field, which is what a copy of the
   * array necessarily carries and what a legitimately different field would
   * not.
   */
  const FIELDS: [string, readonly string[]][] = [
    ["PRESTIGE_FIELD", PRESTIGE_FIELD],
    ["DELICACY_FIELD", DELICACY_FIELD],
    ["THRESHOLD_FIELD", THRESHOLD_FIELD],
  ];

  it("each field has four analogous colours and they are all tintable accents", () => {
    for (const [name, field] of FIELDS) {
      expect(field.length, `${name} is not four colours`).toBe(4);
      for (const c of field) expect(tint(c), `${name} holds ${c}`).toMatch(TINTED);
    }
  });

  it("the three fields are distinct, so this cannot pass by collision", () => {
    const heads = FIELDS.map(([, f]) => f[0]);
    expect(new Set(heads).size).toBe(3);
  });

  it("no file re-types a field the registry owns", () => {
    const files = tsFiles("src");
    expect(files.length, "found no source files, so this sweep proves nothing").toBeGreaterThan(100);
    const offenders: string[] = [];
    for (const f of files) {
      if (posix(f).startsWith("src/content/instrument-accents")) continue;
      const text = readFileSync(f, "utf8");
      for (const [name, field] of FIELDS) {
        // The array literal's opening: `["<first colour>",` — prose and single
        // uses of the colour elsewhere do not match this shape.
        if (text.includes(`["${field[0]}",`)) offenders.push(`${posix(f)} re-types ${name}`);
      }
    }
    expect(
      offenders,
      "These files re-type an ambient field the registry already owns. Import the " +
        "named constant — otherwise changing an instrument's ambience changes some " +
        "of its surfaces and not the rest:\n" + offenders.join("\n"),
    ).toEqual([]);
  });

  /**
   * `Machine.field` IS LIVE NOW (E10/S8, RT-AH:a) — and the pin that was
   * guarding its deadness was scoped to the wrong file.
   *
   * The E10/S4b version asserted that `GymFloor` reads `.field` zero times, on
   * the reasoning that the floor owned the selection so the floor would be
   * where a wiring appeared. The wiring appeared in `GymStage` instead — the
   * state had to move UP to reach the background — so that guard stayed green
   * through the exact change it existed to catch. Fifth instance in this
   * repository of a guard watching part of the room, and the first one I wrote
   * myself and then walked past.
   *
   * So it is replaced by a check of the BEHAVIOUR rather than of a file: every
   * machine carries a field, the stage hands the chosen machine's field to the
   * background, and the resting state is the gym's own.
   */
  it("every machine's field is its own instrument's field", () => {
    /*
     * RT-AD, resolved. The home page used to carry a hand-written delicacy blue
     * that differed from the one the Delicacy Trials paint. Invisible while
     * `field` was dead; a visible inconsistency the moment it was wired, since
     * the whole promise is that the room shows you the machine you picked.
     */
    const home = readFileSync("src/app/page.tsx", "utf8");
    for (const [machine, field] of [
      ["bias", "PRESTIGE_FIELD"],
      ["delicacy", "DELICACY_FIELD"],
      ["threshold", "THRESHOLD_FIELD"],
    ]) {
      expect(
        home,
        `the ${machine} machine no longer takes ${field}; the floor would light in a ` +
          `colour the instrument does not use`,
      ).toContain(`field: ${field},`);
    }
    expect(
      home.includes(`["hsl(`),
      "a machine's field is hand-written again instead of naming a registry field",
    ).toBe(false);
  });

  it("the stage lights the room from the chosen machine, and rests on the gym's own", () => {
    const stage = readFileSync("src/app/GymStage.tsx", "utf8");
    // The read that E10/S4b's guard was looking for in the wrong file.
    expect(stage, "the stage no longer reads the chosen machine's field").toMatch(
      /chosen\s*\?\s*chosen\.field\s*:\s*GYM_FIELD/,
    );
    expect(stage, "the stage no longer brightens on selection").toMatch(
      /chosen\s*\?\s*FIELD_MEASURING\s*:\s*FIELD_CHOOSING/,
    );
  });

  it("nothing else renders a floor without a stage to light", () => {
    // `useMachineSelection` throws outside a stage, so this is belt-and-braces
    // — but a second floor somewhere would be a second room with no lighting.
    // Assembled, so this file does not match its own sweep — the same trap
    // E10/S1 and E10/S2 both fell into.
    const FLOOR = "<" + "GymFloor";
    const STAGE = "<" + "GymStage";
    const floors = tsFiles("src")
      .filter((f) => readFileSync(f, "utf8").includes(FLOOR))
      .map(posix);
    expect(floors).toEqual(["src/app/page.tsx"]);

    const home = readFileSync("src/app/page.tsx", "utf8");
    const stageAt = home.indexOf(STAGE);
    const floorAt = home.indexOf(FLOOR);
    const closeAt = home.indexOf("</" + "GymStage>");
    expect(stageAt, "the home page renders no stage").toBeGreaterThan(-1);
    expect(closeAt, "the stage is never closed").toBeGreaterThan(floorAt);
    expect(
      floorAt > stageAt && floorAt < closeAt,
      "the floor is not inside the stage, so choosing a machine lights nothing",
    ).toBe(true);
  });
});

describe("every instrument's controls wear that instrument's colour", () => {
  /**
   * E10/S5 (RT-AE:a) — THE CONTROL PEOPLE LOOK AT MOST WAS THE WRONG COLOUR.
   *
   * `ClipPlayer` hardcoded gold and took no colour from its caller, while being
   * rendered by the Delicacy Trials and the Threshold Test. Measured before the
   * fix: the ring stroke on `/delicacy` and on `/threshold/pitch` was
   * `hsl(42 80% 62%)` — Prestige's gold, on a blue screen and a violet one.
   * Exactly the leak E7/S21 fixed for `AbCompare` and missed here.
   *
   * THE PRIMARY GUARD IS THE COMPILER: `palette` is a required prop, so a call
   * site that forgets does not build. What a type cannot check is whether a
   * flow passes the RIGHT palette — `<ClipPlayer palette={PRESTIGE_PALETTE}>`
   * inside `DelicacyFlow` type-checks perfectly and is the original bug typed
   * out longhand. That is what this checks.
   */
  const FLOWS: [string, string][] = [
    ["src/app/bias/BiasFlow.tsx", "PRESTIGE_PALETTE"],
    ["src/app/delicacy/DelicacyFlow.tsx", "DELICACY_PALETTE"],
    ["src/app/threshold/ThresholdFlow.tsx", "THRESHOLD_PALETTE"],
  ];

  const ALL_PALETTES = ["PRESTIGE_PALETTE", "DELICACY_PALETTE", "THRESHOLD_PALETTE"];

  it("the three palettes carry three different accents", () => {
    const accents = [PRESTIGE_PALETTE, DELICACY_PALETTE, THRESHOLD_PALETTE].map((p) => p.accent);
    expect(new Set(accents).size, "two instruments share an accent").toBe(3);
    for (const p of [PRESTIGE_PALETTE, DELICACY_PALETTE, THRESHOLD_PALETTE]) {
      expect(tint(p.accent), `${p.accent} is not a tintable accent`).toMatch(TINTED);
      expect(p.soft, "soft is not a 14% fill").toMatch(/\/ 0\.14\)$/);
      expect(p.glow, "glow carries no alpha").toMatch(/\/ 0\.\d+\)$/);
    }
  });

  it("each flow renders clip players, and only in its own palette", () => {
    for (const [file, own] of FLOWS) {
      const text = readFileSync(file, "utf8");
      const players = [...text.matchAll(/<ClipPlayer\b/g)].length;
      expect(players, `${file} renders no ClipPlayer, so this proves nothing`).toBeGreaterThan(0);

      const passes = [...text.matchAll(/palette=\{(\w+)\}/g)].map((m) => m[1]);
      expect(
        passes.length,
        `${file} renders ${players} clip players but passes ${passes.length} palettes`,
      ).toBe(players);

      const foreign = passes.filter((p) => p !== own);
      expect(
        foreign,
        `${file} passes ${foreign.join(", ")} to a control on an instrument whose palette ` +
          `is ${own}. This type-checks and is precisely the defect RT-AE:a fixed: a control ` +
          `wearing another instrument's colour.`,
      ).toEqual([]);
    }
  });

  it("no flow imports a palette belonging to another instrument", () => {
    for (const [file, own] of FLOWS) {
      const text = readFileSync(file, "utf8");
      const others = ALL_PALETTES.filter((p) => p !== own && text.includes(p));
      expect(
        others,
        `${file} imports ${others.join(", ")}. Even unused, that is the next accidental ` +
          `cross-instrument paint waiting to happen.`,
      ).toEqual([]);
    }
  });

  it("ClipPlayer holds no colour of its own", () => {
    const text = readFileSync("src/app/bias/ClipPlayer.tsx", "utf8");
    expect(
      text.includes("PRESTIGE_GOLD"),
      "ClipPlayer references Prestige's colour again. It is rendered by all three " +
        "instruments; any colour it names itself is wrong on two of them.",
    ).toBe(false);
    expect(text, "ClipPlayer no longer takes a palette").toMatch(/palette: InstrumentPalette;/);
  });
});

describe("the gym's own surfaces stay readable", () => {
  /**
   * E10/S6a — THE FRONT DOOR HAD BEEN SHIPPING AT 1.99:1.
   *
   * The gold field it used to paint put `--muted` body copy at 1.99:1 against
   * WCAG AA's 4.5, measured at the centre of the brightest blob. Nobody had
   * measured it, because nothing measured it. This is that missing measurement,
   * turned into a test.
   *
   * WHAT "WORST POINT" MEANS: the field is radial blobs that fall off to
   * transparent, over the page surface, at the layer's opacity. The darkest
   * text sits on the brightest blob's centre in the worst case, so that is what
   * is checked. Real text elsewhere on the page has more contrast, not less.
   *
   * This cannot see the vignette (which only darkens, so it helps) nor where
   * text actually falls relative to a blob. It is a floor, not a survey.
   */
  const SURFACE = "#08090d"; // RouteBackground's --app-bg for every gym route
  const MUTED = "#8b91a3"; // --muted, the lightest-on-dark body copy in play
  const AA = 4.5;

  /** Composite an opaque colour over another at `alpha`, as the browser does. */
  function over(fg: string, alpha: number, bg: string): string {
    const f = parseColor(fg);
    const b = parseColor(bg);
    if (!f || !b) throw new Error(`unparseable colour: ${fg} / ${bg}`);
    const mix = f.map((c, i) => Math.round(alpha * c + (1 - alpha) * b[i]));
    return `#${mix.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
  }

  it("the contrast meter agrees with known pairs before it is trusted", () => {
    // A meter that has never been checked is not a meter (E9 finding 5).
    expect(contrastRatio("#fff", "#000")).toBeCloseTo(21, 1);
    expect(contrastRatio("#000", "#fff")).toBeCloseTo(21, 1);
    expect(contrastRatio("#fff", "#fff")).toBeCloseTo(1, 2);
    expect(contrastRatio("#767676", "#fff")!).toBeCloseTo(4.54, 1);
  });

  it("the compositor agrees with a hand-worked case", () => {
    // 50% of white over black is mid grey; 0% leaves the ground untouched.
    expect(over("#ffffff", 0.5, "#000000")).toBe("#808080");
    expect(over("#ffffff", 0, "#000000")).toBe("#000000");
    expect(over("#ffffff", 1, "#000000")).toBe("#ffffff");
  });

  const brightest = (field: string[]) =>
    field.reduce((a, b) => {
      const la = parseColor(a)!.reduce((s, c) => s + c, 0);
      const lb = parseColor(b)!.reduce((s, c) => s + c, 0);
      return lb > la ? b : a;
    });

  it("muted body copy clears AA at the worst point of every gym surface", () => {
    const cases: [string, number][] = [
      ["the front door", FIELD_CHOOSING],
      ["the reading surfaces (/learn, /lab, /method)", FIELD_READING],
    ];
    for (const [where, intensity] of cases) {
      const backdrop = over(brightest(GYM_FIELD), intensity, SURFACE);
      const r = contrastRatio(MUTED, backdrop)!;
      expect(
        r,
        `${where}: --muted body copy measures ${r.toFixed(2)}:1 over ${backdrop}, ` +
          `below WCAG AA's ${AA}. Darken GYM_FIELD or lighten --muted. The gold field ` +
          `this replaced measured 1.99:1 and shipped that way because nothing checked.`,
      ).toBeGreaterThanOrEqual(AA);
    }
  });

  it("the check is not vacuous — the field it replaced still fails it", () => {
    /*
     * The other direction. If `over` or `brightest` silently returned the page
     * surface, every ratio above would pass and this file would be decoration.
     * The gold field at the brightness it actually shipped must still fail.
     */
    const oldBackdrop = over(brightest(PRESTIGE_FIELD), 0.6, SURFACE);
    const r = contrastRatio(MUTED, oldBackdrop)!;
    expect(r, "the pre-E10/S6a front door should measure far below AA").toBeLessThan(2.5);
  });

  it("the gym field carries no instrument's hue", () => {
    // Achromatic by rule, not by taste: any real chroma either belongs to an
    // instrument or crowds the 86-degree separation between the three accents.
    for (const c of GYM_FIELD) {
      const sat = Number(c.match(/hsl\(\s*[\d.]+\s+([\d.]+)%/)![1]);
      expect(sat, `${c} is saturated enough to read as a colour`).toBeLessThanOrEqual(12);
    }
  });

  it("the tiers stay ordered: measuring is brightest, reading is dimmest", () => {
    expect(FIELD_MEASURING).toBeGreaterThan(FIELD_CHOOSING);
    expect(FIELD_CHOOSING).toBeGreaterThan(FIELD_READING);
  });
});

describe("the gym's ink belongs to no instrument (E11/S7, RT-AR:a)", () => {
  const SURFACE = "#08090d";
  const MUTED = "#8b91a3";
  const FOREGROUND = "#f4f5f8";
  const AA = 4.5;

  function over(fg: string, alpha: number, bg: string): string {
    const f = parseColor(fg);
    const b = parseColor(bg);
    if (!f || !b) throw new Error(`unparseable colour: ${fg} / ${bg}`);
    const mix = f.map((c, i) => Math.round(alpha * c + (1 - alpha) * b[i]));
    return `#${mix.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
  }
  const brightest = (field: string[]) =>
    field.reduce((a, b) =>
      parseColor(b)!.reduce((x, c) => x + c, 0) > parseColor(a)!.reduce((x, c) => x + c, 0) ? b : a,
    );

  it("the meter agrees with known pairs before it is trusted", () => {
    expect(contrastRatio("#fff", "#000")).toBeCloseTo(21, 1);
    expect(contrastRatio("#000", "#fff")).toBeCloseTo(21, 1);
    expect(contrastRatio("#fff", "#fff")).toBeCloseTo(1, 2);
    expect(contrastRatio("#767676", "#fff")!).toBeCloseTo(4.54, 1);
  });

  const backdrops: [string, number][] = [
    ["the front door", FIELD_CHOOSING],
    ["the reading surfaces", FIELD_READING],
  ];

  it("carries no hue, by the same rule as the field", () => {
    for (const c of [GYM_INK, GYM_INK_BRIGHT]) {
      const sat = Number(c.match(/hsl\(\s*[\d.]+\s+([\d.]+)%/)![1]);
      expect(sat, `${c} is saturated enough to read as a colour`).toBeLessThanOrEqual(12);
    }
  });

  it("clears AA on every gym surface", () => {
    for (const [where, intensity] of backdrops) {
      const bg = over(brightest(GYM_FIELD), intensity, SURFACE);
      for (const ink of [GYM_INK, GYM_INK_BRIGHT]) {
        const r = contrastRatio(ink, bg)!;
        expect(r, `${where}: ${ink} measures ${r.toFixed(2)}:1 over ${bg}`).toBeGreaterThanOrEqual(AA);
      }
    }
  });

  /**
   * THE POINT OF THE WHOLE SLICE, MEASURED.
   *
   * The gold this replaces measured 5.56:1 on the front door while `--muted`
   * body copy measures 4.67:1 — a separation of 0.89. The link was told apart
   * from the paragraph around it almost entirely by BEING GOLD. Remove the hue
   * at that lightness and a link stops looking like one, so the separation has
   * to be carried by brightness instead. Three is a real step; 0.89 is not.
   */
  it("separates a link from body copy by brightness, not by hue", () => {
    for (const [where, intensity] of backdrops) {
      const bg = over(brightest(GYM_FIELD), intensity, SURFACE);
      const delta = contrastRatio(GYM_INK, bg)! - contrastRatio(MUTED, bg)!;
      expect(
        delta,
        `${where}: the ink is only ${delta.toFixed(2)} clear of body copy. Without a hue to ` +
          "carry the difference, a link at this brightness does not read as a link.",
      ).toBeGreaterThanOrEqual(3);
    }
  });

  it("stays under the foreground, which is still the brightest text", () => {
    for (const [, intensity] of backdrops) {
      const bg = over(brightest(GYM_FIELD), intensity, SURFACE);
      expect(contrastRatio(GYM_INK_BRIGHT, bg)!).toBeLessThan(contrastRatio(FOREGROUND, bg)!);
      expect(contrastRatio(GYM_INK, bg)!).toBeLessThan(contrastRatio(GYM_INK_BRIGHT, bg)!);
    }
  });

  /**
   * NOT VACUOUS. The gold it replaced must still fail the separation rule, or
   * this file is decoration — the same shape of check E10/S6a needed on the
   * field it replaced.
   */
  /**
   * THE RULING, AS A SWEEP — because it was already ruled once and half-applied.
   *
   * RT-AG made the gym neutral on 2026-08-27, E10/S6a implemented it, and its
   * commit said "on the front door the only colour left is the three machine
   * cards themselves". Eleven sites across five files still painted gold. The
   * difference between a ruling and a rule is whether something fails when it
   * is broken, so: no gym-level surface may name an instrument hue, with one
   * stated exception that is checked rather than waved through.
   */
  it("no gym-level surface paints an instrument's colour", () => {
    const GYM_SURFACES = [
      "src/app/page.tsx",
      "src/app/GymFloor.tsx",
      "src/app/learn/page.tsx",
      "src/app/learn/Explainer.tsx",
      "src/app/lab/page.tsx",
      "src/app/method/page.tsx",
    ];
    const HUES = ["hsl(42", "hsl(42_", "hsl(190", "hsl(190_", "hsl(276", "hsl(276_"];
    const offenders: string[] = [];
    for (const file of GYM_SURFACES) {
      readFileSync(file, "utf8")
        .split(String.fromCharCode(10))
        .forEach((line, i) => {
          if (!HUES.some((h) => line.includes(h))) return;
          const t = line.trim();
          /*
           * A COMMENT PAINTS NOTHING. `page.tsx` explains, in prose, the
           * hand-written blue that E10/S8 deleted — quoting a colour in order
           * to say it is gone is the opposite of the defect this looks for.
           * Keyed on the line being a comment, which is a syntactic fact, and
           * not on the file it happens to sit in: an exception list is how the
           * third copy of `tint` survived E10/S1.
           */
          if (t.startsWith("*") || t.startsWith("//") || t.startsWith("/*")) return;
          /*
           * THE ONE REAL EXEMPTION, AND IT IS NARROW. `page.tsx` declares the
           * three MACHINE CARDS, which must wear their instruments' colours —
           * that is the whole point of the front door. Keyed to what the line
           * DOES (assigning a card's accent, field or surface) rather than to
           * the file it sits in.
           */
          if (["accent:", "field:", "surface:"].some((k) => t.startsWith(k))) return;
          offenders.push(`${file}:${i + 1}: ${t.slice(0, 100)}`);
        });
    }
    expect(
      offenders,
      "these gym-level lines paint an instrument's hue on a surface that belongs to no " +
        "instrument (RT-AG, RT-AR):" + String.fromCharCode(10) + offenders.join(String.fromCharCode(10)),
    ).toEqual([]);
  });

  it("the gold it replaced still fails the rule it was replaced for", () => {
    const bg = over(brightest(GYM_FIELD), FIELD_CHOOSING, SURFACE);
    const oldDelta = contrastRatio("hsl(42 45% 52%)", bg)! - contrastRatio(MUTED, bg)!;
    expect(oldDelta, "the pre-E11/S7 link colour should sit far too close to body copy").toBeLessThan(1.5);
  });
});
