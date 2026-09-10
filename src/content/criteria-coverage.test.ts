/**
 * EVERY ONE OF HUME'S FIVE CRITERIA HAS AN INSTRUMENT, AND THE PAGE THAT SAYS
 * SO IS HELD TO IT (E19/S16, PM ruling RT-Y1 a).
 *
 * `/learn/freedom-from-prejudice` tells a reader that the other four criteria
 * "each have a machine of their own". Until E19/S11 it hedged — "built or
 * planned" — and the writing pass asked for the hedge to come out ONLY if the
 * condition held, saying: if any still has no instrument, name that one instead.
 *
 * I CHECKED THAT BY READING FOUR PAGES AND A ROSTER, and confessed at the time
 * that nothing tested it. This is that test. It is also what closed RT-H: the
 * Comparison instrument was not pending, it had shipped, and the blueprint
 * question asking for "defensible units of breadth" described a design the
 * product had already refused on measurement grounds (D2 — breadth-as-exposure
 * is what a listener was exposed to, not something they can be wrong about).
 *
 * THE MAPPING IS DECLARED AND THEN CHECKED. Naming the symbol that implements
 * each criterion is a judgement — no machine announces which of Hume's five it
 * serves — so the judgement is written down where it can be argued with, and
 * the EXISTENCE of what it names is verified. Delete the comparison reading and
 * this fails with the sentence that would have become false.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { learnPage } from "./learn";

const NL = String.fromCharCode(10);

interface Criterion {
  /** The reading-room page that explains it. */
  readonly slug: string;
  /** A symbol that implements it, and where it must be found. */
  readonly implementedBy: string;
  readonly file: string;
}

const CRITERIA: Criterion[] = [
  {
    slug: "freedom-from-prejudice",
    implementedBy: "computeBiasResult",
    file: "src/engine/bias.ts",
  },
  { slug: "delicacy", implementedBy: "computeDelicacyResult", file: "src/engine/delicacy.ts" },
  { slug: "practice", implementedBy: "arcLines", file: "src/content/vocabulary/arc.ts" },
  { slug: "comparison", implementedBy: "comparisonLines", file: "src/content/vocabulary/comparison.ts" },
  { slug: "good-sense", implementedBy: "computeCalibration", file: "src/engine/calibration.ts" },
];

function sourcesUnder(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = dir + "/" + name;
    if (statSync(path).isDirectory()) out.push(...sourcesUnder(path));
    else if (name.endsWith(".tsx")) out.push(path);
  }
  return out;
}

describe("Hume's five criteria", () => {
  it("all five have a reading-room page", () => {
    for (const c of CRITERIA) {
      expect(learnPage(c.slug), `no page explains ${c.slug}`).toBeTruthy();
    }
    expect(CRITERIA.length).toBe(5);
  });

  it("all five have something that implements them", () => {
    const missing: string[] = [];
    for (const c of CRITERIA) {
      const source = readFileSync(c.file, "utf8");
      if (source.indexOf("export function " + c.implementedBy) === -1 &&
          source.indexOf("export const " + c.implementedBy) === -1) {
        missing.push(`${c.slug}: ${c.implementedBy} is not exported from ${c.file}`);
      }
    }
    expect(
      missing,
      "/learn/freedom-from-prejudice tells a reader the other four criteria each have a machine " +
        "of their own. These do not, so that sentence is now false and must name the missing one:" +
        NL + missing.join(NL),
    ).toEqual([]);
  });

  /**
   * The product built a component for admitting a door is not there. While no
   * criterion needs it, the unhedged sentence is true; the day one does, that
   * sentence has to change with it. This is the tripwire on that pairing.
   *
   * IT HAS CHECKED NOTHING SINCE cd79c6b (noted E20/S2). `NotBuiltYet` was
   * deleted there, so `uses` is empty, so the condition below is false whatever
   * the page says -- a guard that reports success by checking nothing, which is
   * the failure mode this repository has now found three times. The pairing
   * check is KEPT, because re-adding the component is exactly when it must
   * fire, and the emptiness is now ASSERTED rather than assumed: a
   * reintroduction has to come past a red test and say why, since it means a
   * criterion lost its instrument and that is not a silent event.
   */
  it("advertises no missing instrument while claiming all five exist", () => {
    const uses = sourcesUnder("src/app")
      .concat(sourcesUnder("src/components"))
      .filter((path) => readFileSync(path, "utf8").indexOf("<NotBuiltYet") !== -1);
    const page = readFileSync("src/app/learn/freedom-from-prejudice/page.tsx", "utf8");
    const claimsAll = page.indexOf("each have a machine of their own") !== -1;
    expect(
      uses.length > 0 && claimsAll,
      "a surface renders the not-built-yet notice while /learn/freedom-from-prejudice claims all " +
        `five criteria have machines: ${uses.join(", ")}`,
    ).toBe(false);
    expect(
      uses,
      "the not-built-yet notice is back. That means a criterion no longer has an instrument, so " +
        "/learn/freedom-from-prejudice, the README, the llms files and docs/index.html all need " +
        "their claim changed with it -- and the copy deck needs the section E20/S2 deleted as " +
        "dead. Update this test deliberately, not to make it green.",
    ).toEqual([]);
  });
});
