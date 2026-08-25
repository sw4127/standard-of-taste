import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { BIAS_CLIPS } from "@/content/bias/items";

/**
 * E7/S7-S8 — A DECEPTION MUST BE CONFESSED WHERE WE SAY IT IS, AND NOWHERE ELSE.
 *
 * FOUND BY LOOKING AT A RENDERED CARD. The threshold share card reads "the
 * smallest compression damage on pb4 I can still hear" — a raw database id
 * printed to a public audience. The obvious fix is to name the recording, and
 * that fix was a trap: the staircase renders from pb1, pb6 and pb8, and pb1 and
 * pb6 were SWAP items whose true artists the Prestige Test conceals.
 *
 * Writing that guard surfaced something worse, which nobody had looked for. The
 * delicacy trials use the same recordings and credit them IN FULL — "Goldberg
 * Variations — Variatio 13 a 2 Clav." — J.S. Bach — Kimiko Ishizaka, and "That
 * Hopeful Future Is All I've Ever Known" — Chris Zabriskie. Not the same artist:
 * the same works, named. So anyone who took the Delicacy Trials had already been
 * told the answer to two of the Prestige Test's three deceptions. And pb6 is
 * CC-BY 4.0, so that credit is a LEGAL obligation — the exposure could not be
 * closed by staying quieter.
 *
 * RT-139(a) resolved it by moving the deception instead of the credit: pb1 and
 * pb6 are truthfully labelled now, and pb11 (Brahms, used by no other
 * instrument) carries the down-swap.
 *
 * THIS FILE IS THE INVARIANT THAT KEEPS IT RESOLVED. The conflict was invisible
 * because nothing related the two pools; anyone adding a delicacy pair or a
 * staircase source from a swapped item would reopen it in one line, and the
 * suite would stay green.
 */

/** Sources the staircase renders against, from its render plan. */
const STAIRCASE_SOURCE_IDS = ["pb1", "pb6", "pb8"] as const;

const NL = String.fromCharCode(10);

/**
 * WHAT IDENTIFIES A RECORDING IS ITS WORK TITLE, NOT ITS ARTIST.
 *
 * The first version of this compared artist names and was wrong in both
 * directions at once. It FALSELY flagged pb11, because "Musopen Kickstarter
 * ensemble" is a performer shared by dozens of unrelated recordings — two
 * different works looked like one. And it SILENTLY SKIPPED pb7, because its
 * artist is "Komiku", six characters, and the filter kept only names longer
 * than six. The check that was supposed to protect the deception was not
 * looking at one of the two items still carrying it.
 *
 * The quoted title in the TASL attribution is the precise signal: the same
 * title in two decks means the same recording, which is the thing that gives
 * the game away. `titlesOf` returns every quoted span so a missing one is
 * visible rather than silently empty.
 */
function titlesOf(attribution: string): string[] {
  return [...attribution.matchAll(/[“"]([^”"]{6,})[”"]/g)].map((m) => m[1].trim());
}

function filesUnder(...dirs: string[]): { file: string; text: string }[] {
  return execSync(`git ls-files ${dirs.map((d) => `"${d}"`).join(" ")}`, { encoding: "utf8" })
    .trim()
    .split(NL)
    .filter(Boolean)
    .filter((f) => /\.tsx?$/.test(f))
    .filter((f) => !/\.test\.tsx?$/.test(f))
    .map((file) => ({ file, text: readFileSync(file, "utf8") }));
}

describe("E7/S8 — no other instrument can give away a swapped item", () => {
  const swaps = BIAS_CLIPS.filter((c) => !c.isControl && !c.labelIsTrue);

  it("every swapped item yields a usable title, or the checks below see nothing", () => {
    // The failure mode this replaces: an artist-name comparison that skipped
    // pb7 entirely because "Komiku" is six characters long.
    for (const clip of swaps) {
      expect(titlesOf(clip.attribution).length, `${clip.id}: no quoted title in its attribution`).toBeGreaterThan(0);
    }
  });

  it("there is still a deception to protect", () => {
    // If this empties, the Prestige Test has stopped deceiving anyone and the
    // whole file is moot — but that must be a decision, not a silent decay into
    // a suite of checks that pass because they check nothing.
    expect(swaps.map((c) => c.id).length, "the pool has no swapped labels at all").toBeGreaterThan(0);
  });

  it("no swapped item is a staircase source", () => {
    const clash = swaps.filter((c) => (STAIRCASE_SOURCE_IDS as readonly string[]).includes(c.id));
    expect(
      clash.map((c) => c.id),
      "A swapped item is a staircase source. The threshold surfaces name their source, so " +
        "the Prestige Test's answer becomes reachable from another instrument.",
    ).toEqual([]);
  });

  it("no swapped item's recording is credited by the delicacy trials", () => {
    // The delicacy deck credits its sources truthfully and MUST — several are
    // CC-BY, where attribution is a licence condition rather than a courtesy.
    // So the constraint has to run the other way: the deception moves, the
    // credit never does.
    const delicacy = readFileSync("src/content/delicacy/items.ts", "utf8");
    const exposed: string[] = [];
    for (const clip of swaps) {
      for (const needle of titlesOf(clip.attribution)) {
        if (delicacy.includes(needle)) exposed.push(`${clip.id}: delicacy credits "${needle}"`);
      }
    }
    expect(
      exposed,
      "A swapped item's true artist is credited on the delicacy surface. Do not fix this by " +
        "removing the credit — CC-BY makes it a legal obligation. Move the deception to an item " +
        "no other instrument uses, as RT-139(a) did:" + NL + exposed.join(NL),
    ).toEqual([]);
  });

  it("no staircase or threshold surface names a swapped item's true artist", () => {
    const leaked: string[] = [];
    for (const clip of swaps) {
      for (const { file, text } of filesUnder("src/content/staircase", "src/app/threshold", "src/app/api/threshold-card")) {
        for (const needle of [...titlesOf(clip.attribution), clip.trueArtist]) {
          if (text.includes(needle)) leaked.push(`${file} names "${needle}" (truly behind ${clip.id})`);
        }
      }
    }
    expect(leaked, "A swapped item's true artist reached a staircase surface:" + NL + leaked.join(NL)).toEqual([]);
  });

  it("would catch the exposure that actually happened", () => {
    // Proven against the real historical case rather than a hypothetical: pb1
    // and pb6 WERE swaps, and the delicacy deck credits both recordings by
    // name. If this check could not see that, it could not have found the bug
    // it was written for.
    const delicacy = readFileSync("src/content/delicacy/items.ts", "utf8");
    for (const id of ["pb1", "pb6"]) {
      const clip = BIAS_CLIPS.find((c) => c.id === id);
      expect(clip, `${id} left the pool`).toBeDefined();
      const seen = titlesOf(clip!.attribution).some((n) => delicacy.includes(n));
      expect(seen, `${id}'s recording is no longer credited by delicacy — the historical case is gone`).toBe(true);
      expect(clip!.labelIsTrue, `${id} is a swap again, which is exactly what RT-139(a) forbade`).toBe(true);
    }
  });

  it("the threshold copy still prints the raw source id (RT-140 c)", () => {
    // Pinned as CURRENT-state-not-endorsed. The PM ruled to leave the id until
    // the deception had moved; it now has, so naming a source is safe again and
    // RT-140 can be revisited. Anyone doing that should read this file first.
    const copy = readFileSync("src/content/staircase/copy.ts", "utf8");
    expect(
      copy.includes("` on ${result.sourceId}`"),
      "onSource no longer prints the raw id. That is now SAFE (RT-139a moved the deception off " +
        "pb1/pb6), but check the checks above still pass before shipping a name.",
    ).toBe(true);
  });
});
