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
 * THE FLOWS ARE NOT YET IN. `/bias`, `/delicacy`, `/threshold` and `/spread`
 * are task screens whose controls were laid out for a narrow column, and
 * widening them without redesigning the controls would be a regression dressed
 * as consistency. They are listed here by name so that "not yet" is a recorded
 * decision with a roster rather than an omission nobody can see.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { SHELL_WIDTH } from "@/content/shell";

const NL = String.fromCharCode(10);

/** Flows still on the narrow column, by the file that sets their width. */
const NOT_YET_ON_THE_SHELL = [
  "src/app/bias/BiasFlow.tsx",
  "src/app/bias/result/page.tsx",
  "src/app/delicacy/DelicacyFlow.tsx",
  "src/app/delicacy/result/page.tsx",
  "src/app/threshold/page.tsx",
  "src/app/threshold/ThresholdFlow.tsx",
  "src/app/threshold/ThresholdResult.tsx",
  "src/app/spread/SpreadFlow.tsx",
  "src/app/quiz/page.tsx",
  "src/app/music/quiz/page.tsx",
  "src/app/music/result/page.tsx",
  "src/app/fan-verdict/page.tsx",
  "src/app/vs/page.tsx",
  "src/app/premium/preview/page.tsx",
  "src/app/premium/report/page.tsx",
  "src/app/error.tsx",
  /*
   * THE LEGACY MUSIC/WORLD-CUP FUNNEL. Superseded by the taste gym and kept
   * alive only so shared URLs do not 404 (CLAUDE.md, Legacy). Re-laying it out
   * would be work on a surface the project has concluded is dead.
   */
  "src/app/result/page.tsx",
  "src/app/result/loading.tsx",
  "src/app/music/result/loading.tsx",
];

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
      for (const tag of mainTags(readFileSync(path, "utf8"))) {
        const usesToken = tag.indexOf("SHELL_MAIN") !== -1 || tag.indexOf(SHELL_WIDTH) !== -1;
        if (!usesToken) wrong.push(`${path}${NL}      ${tag.slice(0, 110)}`);
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
