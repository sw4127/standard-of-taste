/**
 * ONE CONTAINER WIDTH, AND NO ROUTE MAY OPT OUT (Phase 3, Track N, RT-Z3 a).
 *
 * WHAT WAS MEASURED, at 1280px: `/` and every instrument flow rendered a 512px
 * column in the middle of a black field with no navigation, `/method` ran 768px
 * and `/lab` 1024px. Three widths, two navigation models, and more than half
 * the screen empty on the page a visitor lands on. The Phase 3 blueprint names
 * that as the mechanism behind the owner's own instinct about the site.
 *
 * THE GUARD IS ON THE SHELL, NOT ON THE MEASURE. Body text keeps each surface's
 * own line length inside the frame — widening the paragraphs to 1024px was the
 * first version of this change and it was worse than what it replaced. What
 * must not vary is the FRAME: where the header sits and how much screen the
 * page occupies.
 *
 * THE REMAINING NARROW SCREENS ARE A DECISION, NOT A BACKLOG (revised at the
 * close of Track N).
 *
 * Two flows took the shell because they had a MEASURED defect: the Prestige
 * Test and the Ranking Test both render an eleven-point scale that wrapped 6 + 5
 * into two rows, and a wrapped scale reads as a grid rather than a line — the
 * ends stop being the ends. Both are one row from `lg` up now.
 *
 * The Delicacy Trials and the Threshold staircase were measured and LEFT. Their
 * controls are a two-way and a three-way choice; there is nothing to unwrap,
 * and widening a two-button task to 1024px would stretch a focused screen for
 * symmetry. "Apply the shell everywhere" was the ruling; applying it where it
 * makes a screen worse would be following the words past the reason.
 *
 * The result screens are narrow for the same reason and are listed with the
 * flows. Each entry below says which case it is.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { SHELL_WIDTH } from "@/content/shell";

const NL = String.fromCharCode(10);

/** Flows still on the narrow column, by the file that sets their width. */
const NOT_YET_ON_THE_SHELL = [
  // MEASURED AND LEFT: a two-way choice and a three-way choice. Nothing wraps,
  // and the width would stretch a focused task rather than fix anything.
  // RESULT SCREENS: a reading, not a task. Their line length is the thing that
  // matters and it is already right; the shell would widen the prose.
  "src/app/bias/result/page.tsx",
  "src/app/delicacy/DelicacyFlow.tsx",
  "src/app/delicacy/result/page.tsx",
  "src/app/threshold/page.tsx",
  "src/app/threshold/ThresholdFlow.tsx",
  "src/app/threshold/ThresholdResult.tsx",
  "src/app/error.tsx",
  /*
   * THE SNACK, restored 2026-09-23 (RT-4 (c)) exactly as it was laid out, which
   * predates the shell. Re-laying it out is design work nobody has ruled.
   */
  "src/app/music/quiz/page.tsx",
  "src/app/music/result/page.tsx",
  "src/app/music/result/loading.tsx",
];

/**
 * FILES WHERE SOME SCREENS TOOK THE SHELL AND OTHERS DELIBERATELY DID NOT.
 *
 * `SpreadFlow` renders three `<main>`s — an intro, the rating screen, and a
 * closing screen. Only the rating screen had the defect (an eleven-point scale
 * wrapping to two rows), and widening the two prose screens to 1024px would
 * repeat the mistake this track already made once on `/method`: a frame widened
 * without its measure narrowed.
 *
 * So a per-FILE exemption is the wrong granularity, and pretending otherwise
 * would mean either hiding a real adoption or forcing two screens to change for
 * symmetry. A mixed file must still prove its adoption is real — at least one
 * `<main>` carrying the token — so it cannot quietly revert to all-narrow and
 * keep sitting in a list that says it is partly done.
 */
const MIXED = ["src/app/spread/SpreadFlow.tsx"];

/** Every .tsx under src/app, derived — a typed roster is a roster of guesses. */
function routeFiles(dir = "src/app"): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = dir + "/" + name;
    if (statSync(path).isDirectory()) out.push(...routeFiles(path));
    else if (name.endsWith(".tsx")) out.push(path);
  }
  return out;
}

/** The `<main …>` opening tags in a file, with their class attribute text. */
function mainTags(source: string): string[] {
  const out: string[] = [];
  let at = source.indexOf("<main");
  while (at !== -1) {
    const end = source.indexOf(">", at);
    if (end === -1) break;
    out.push(source.slice(at, end));
    at = source.indexOf("<main", end);
  }
  return out;
}

/**
 * DOES THIS `<main>` USE THE SHELL, DIRECTLY OR THROUGH ONE LOCAL NAME?
 *
 * The first version demanded the token inside the tag, and `BiasFlow` failed it
 * five times while being perfectly correct: the flow assigns
 * `const shell = `${SHELL_MAIN} py-10`` once and every screen renders
 * `className={shell}`. Naming a shared value before using it five times is
 * better code, not an evasion, and a guard that forbids it teaches people to
 * paste the token instead — which is how one width becomes four.
 *
 * ONE HOP, DELIBERATELY. The identifier must be assigned from SHELL_MAIN in the
 * SAME file, so the check still reads one file and cannot be satisfied by an
 * indirection it never sees.
 */
function usesShell(tag: string, source: string): boolean {
  /*
   * THREE SPELLINGS, AND THE THIRD COST A RED RUN. A tag can carry the composed
   * class (`SHELL_MAIN`), the token's VALUE (`max-w-5xl`), or the token's
   * IDENTIFIER inside a template literal — which is what a screen that needs the
   * width but not the rest of the shell writes. The identifier only counts when
   * the file imports it from the shell module, so a same-named local cannot
   * satisfy this by accident.
   */
  const importsToken =
    source.indexOf("SHELL_WIDTH") !== -1 && source.indexOf('from "@/content/shell"') !== -1;
  if (tag.indexOf("SHELL_MAIN") !== -1 || tag.indexOf(SHELL_WIDTH) !== -1) return true;
  if (importsToken && tag.indexOf("SHELL_WIDTH") !== -1) return true;
  for (const name of tag.match(/[A-Za-z_$][A-Za-z0-9_$]*/g) || []) {
    if (source.indexOf("const " + name + " =") === -1) continue;
    const at = source.indexOf("const " + name + " =");
    const decl = source.slice(at, source.indexOf(";", at) + 1);
    if (decl.indexOf("SHELL_MAIN") !== -1 || decl.indexOf(SHELL_WIDTH) !== -1) return true;
  }
  return false;
}

describe("the site has one container width", () => {
  const files = routeFiles();
  const withMain = files.filter((path) => readFileSync(path, "utf8").indexOf("<main") !== -1);

  it("found routes and a token, so nothing below passes vacuously", () => {
    expect(files.length).toBeGreaterThan(20);
    expect(withMain.length).toBeGreaterThan(5);
    expect(SHELL_WIDTH.length).toBeGreaterThan(4);
  });

  it("gives every shell-adopting route the one width", () => {
    const wrong: string[] = [];
    for (const path of withMain) {
      // GymStage only MENTIONS <main> in a docblock; it renders no container.
      if (path === "src/app/GymStage.tsx") continue;
      if (NOT_YET_ON_THE_SHELL.indexOf(path) !== -1) continue;
      const source = readFileSync(path, "utf8");
      if (MIXED.indexOf(path) !== -1) continue;
      for (const tag of mainTags(source)) {
        if (usesShell(tag, source)) continue;
        wrong.push(`${path}${NL}      ${tag.slice(0, 110)}`);
      }
    }
    expect(
      wrong,
      "these routes set their own container width instead of the shell's. A fourth width is how " +
        "the site came to render three of them with two navigation models:" + NL + wrong.join(NL),
    ).toEqual([]);
  });

  /*
   * THE EXEMPTION LIST MUST DESCRIBE REALITY. A path that no longer exists, or
   * one that has since adopted the shell, is an exemption protecting nothing —
   * and the next person reads it as "these are deliberately narrow" when it may
   * only mean "nobody deleted the line".
   */
  it("keeps every mixed file genuinely mixed", () => {
    expect(MIXED.length, "no mixed files, so this checks nothing").toBeGreaterThan(0);
    const broken: string[] = [];
    for (const path of MIXED) {
      const source = readFileSync(path, "utf8");
      const tags = mainTags(source);
      if (tags.length < 2) broken.push(`${path} — renders ${tags.length} main(s), so it is not mixed`);
      else if (!tags.some((tag) => usesShell(tag, source))) {
        broken.push(`${path} — no screen uses the shell any more, so it is simply narrow`);
      }
    }
    expect(
      broken,
      "these files are listed as partly on the shell and are not:" + NL + broken.join(NL),
    ).toEqual([]);
  });

  it("exempts only files that exist and are still narrow", () => {
    const stale: string[] = [];
    for (const path of NOT_YET_ON_THE_SHELL) {
      let source: string;
      try {
        source = readFileSync(path, "utf8");
      } catch {
        stale.push(`${path} — no such file`);
        continue;
      }
      if (source.indexOf("<main") === -1) stale.push(`${path} — renders no <main>`);
      else if (source.indexOf("SHELL_MAIN") !== -1) stale.push(`${path} — already on the shell`);
    }
    expect(
      stale,
      "these exemptions no longer describe anything. Remove them:" + NL + stale.join(NL),
    ).toEqual([]);
  });
});
