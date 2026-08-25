import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { BIAS_CLIPS } from "@/content/bias/items";

/**
 * E7/S7 — THE STAIRCASE MUST NOT SPOIL THE PRESTIGE TEST.
 *
 * FOUND BY LOOKING AT A RENDERED CARD. The threshold share card reads "the
 * smallest compression damage on pb4 I can still hear" — it prints a raw
 * database id to a public audience, which is plainly a copy defect and the
 * obvious thing to go and fix.
 *
 * IT IS A TRAP. The staircase draws its degradation sources from the BIAS pool
 * — pb1, pb6 and pb8 — and two of those are SWAP items. pb1 is shown in the
 * Prestige Test as "M. Novak — home piano sessions" and is really Bach played
 * by Kimiko Ishizaka; pb6 is shown as "Alexander Vane" and is really Chris
 * Zabriskie. Those names are the sanctioned deception (memo §3), and the
 * product's promise is that they are confessed on the mandatory debrief and
 * nowhere else.
 *
 * So "tidying" the jargon by naming the source honestly would print the answer
 * to the Prestige Test on a card designed to be posted publicly. The ugly id
 * is, by accident, the thing protecting the deception.
 *
 * This file does not fix the jargon — how to describe a recording without
 * identifying it is a product decision. It makes the trap impossible to fall
 * into silently, which is the part engineering owns.
 */

/** Sources the staircase actually renders against, from the render plan. */
const STAIRCASE_SOURCE_IDS = ["pb1", "pb6", "pb8"] as const;

const NL = String.fromCharCode(10);

/**
 * The surfaces this test POLICES: what the staircase and threshold print.
 * Deliberately NOT the delicacy deck — see the known-exposure pin below, which
 * records a conflict engineering cannot resolve on its own.
 */
function staircaseSurfaces(): { file: string; text: string }[] {
  return execSync('git ls-files "src/content/staircase" "src/app/threshold" "src/app/api/threshold-card"', {
    encoding: "utf8",
  })
    .trim()
    .split(NL)
    .filter(Boolean)
    .filter((f) => /\.tsx?$/.test(f))
    .filter((f) => !/\.test\.tsx?$/.test(f))
    .map((file) => ({ file, text: readFileSync(file, "utf8") }));
}

/** The distinctive names that would identify a concealed recording. */
function identifyingNames(trueArtist: string): string[] {
  return trueArtist
    .split(/[—,()]/)
    .map((p) => p.trim())
    .filter((p) => p.length > 6);
}

describe("E7/S7 — a staircase source never reveals a swapped artist", () => {
  const swaps = BIAS_CLIPS.filter((c) => !c.isControl && !c.labelIsTrue);

  it("the premise still holds: staircase sources overlap the bias swaps", () => {
    // If this goes empty the hazard is gone and this file can be deleted — but
    // deliberately, not by decaying into a test that passes because it stopped
    // checking anything.
    const overlap = swaps.filter((c) => (STAIRCASE_SOURCE_IDS as readonly string[]).includes(c.id));
    expect(
      overlap.map((c) => c.id),
      "no staircase source is a bias swap any more — read this file's docblock before deleting it",
    ).not.toEqual([]);
  });

  it("no staircase or threshold surface names a swapped item's true artist", () => {
    const leaked: string[] = [];
    for (const clip of swaps) {
      for (const { file, text } of staircaseSurfaces()) {
        for (const needle of identifyingNames(clip.trueArtist)) {
          if (text.includes(needle)) leaked.push(`${file} names "${needle}" (truly behind ${clip.id})`);
        }
      }
    }
    expect(
      leaked,
      "A swapped item's true artist reached a staircase surface. The deception is only " +
        "defensible because it is confessed in exactly one place:" + NL + leaked.join(NL),
    ).toEqual([]);
  });

  /**
   * THE EXPOSURE THAT ALREADY EXISTS, PINNED RATHER THAN HIDDEN.
   *
   * The delicacy trials are built from the same source recordings and credit
   * them truthfully (`DelicacyFlow` renders every `sourceCredit`). So a user who
   * takes the Delicacy Trials reads "Chris Zabriskie", then meets the same
   * recording in the Prestige Test labelled "Alexander Vane".
   *
   * THIS IS NOT SIMPLY A BUG TO FIX. pb6 is CC-BY 4.0 and attribution is a
   * LEGAL obligation — the credit cannot be dropped. The conflict is between a
   * licence we must honour and a deception the instrument depends on; resolving
   * it is a product decision (RT-139), not an engineering one. What engineering
   * owns is making sure the exposure cannot GROW without anyone noticing.
   */
  it("the known delicacy exposure is exactly the two items already known", () => {
    const delicacy = readFileSync("src/content/delicacy/items.ts", "utf8");
    const exposed = swaps
      .filter((c) => identifyingNames(c.trueArtist).some((n) => delicacy.includes(n)))
      .map((c) => c.id)
      .sort();
    expect(
      exposed,
      "The set of swapped items whose true artist is credited on the delicacy surface has " +
        "CHANGED. Growing it makes the Prestige Test's deception discoverable in more places; " +
        "shrinking it may mean the conflict was resolved and this pin should be updated on purpose.",
    ).toEqual(["pb1", "pb6"]);
  });

  it("the source is still referred to by id, not by name, wherever it is printed", () => {
    // Pinning the CURRENT state, not endorsing it. `onSource` interpolates the
    // raw id; that is a live copy defect awaiting a ruling on how to describe a
    // recording without identifying it. If someone replaces it with a name
    // lookup, this fails and sends them to the docblock above first.
    const copy = readFileSync("src/content/staircase/copy.ts", "utf8");
    expect(
      copy.includes("` on ${result.sourceId}`"),
      "onSource no longer prints the raw id. That may be the right fix — but if it now prints " +
        "a NAME, check it is not a swapped item's true artist before shipping it.",
    ).toBe(true);
  });
});
