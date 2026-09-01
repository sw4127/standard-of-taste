/**
 * HOW MANY PAIRS WOULD HAVE TO CHANGE HANDS — DERIVED, NEVER TYPED (E15/S1).
 *
 * WHAT WENT WRONG. PM ruling RT-H2b(a) leaves the delicacy trials without a
 * retest arc because the instrument is too coarse to show change, and three
 * SEPARATE surfaces explain that in prose: the refusal a person reads under
 * their result, the `/method` finding, and `/learn/practice`. All three shipped
 * the same two counts — "six of the fifteen pairs", "four of a single flaw's
 * five" — as typed literals, with nothing relating them to the pool. Grow the
 * pool by three items and every one of those sentences becomes false while the
 * suite stays green. That is the NOTHING MAY COUNT trap, in the file where it
 * had already been fixed three times wearing a different costume.
 *
 * THE FIX IS ONE DERIVATION AND THREE RENDERINGS. The engine holds the two
 * SHARES (`DELICACY_ARC_FLOOR_SHARE`, `DELICACY_ARC_FAMILY_FLOOR_SHARE`),
 * because a share is what the simulation actually measured and it survives the
 * pool changing. This module multiplies them by whatever the pool currently
 * holds. Nothing downstream may re-derive; there is one place to be wrong.
 *
 * ROUNDED THE WAY THE DERIVATION PRINTS IT. `arc-resolution.test.ts` reports
 * the floor as `Math.round(share * n)` and the analytics document on file says
 * "6.0 of 15", so rounding to nearest is what the published number already
 * means. Rounding up instead would silently make every sentence overstate what
 * a person must do, which is the wrong direction for a refusal.
 *
 * THE PER-FAMILY CLAUSE IS OPTIONAL, AND THAT IS DELIBERATE. It says "a single
 * flaw's five", which is only sayable if every family HAS five — true today,
 * enforced by `gates.ts`, and not a property this module may assume on behalf
 * of a future pool. If the families ever differ in size, `perFamily` is null
 * and the sentence that quotes it drops the clause rather than picking one
 * family's number and calling it every family's.
 */

import { DELICACY_ARC_FAMILY_FLOOR_SHARE, DELICACY_ARC_FLOOR_SHARE } from "@/engine/arc";
import { DEGRADATION_FAMILIES } from "@/engine/delicacy";
import { MEASURED_TRIALS } from "./items";

export interface DelicacyArcFloor {
  /** Scored trials in a whole sitting. */
  trials: number;
  /** How many of them must change hands before the arc could speak. */
  itemsToMove: number;
  /**
   * Scored trials in ONE flaw family, or null when the families are not all
   * the same size — in which case no single sentence can describe them.
   */
  perFamilyTrials: number | null;
  /** The same floor within one family, or null for the same reason. */
  perFamilyItemsToMove: number | null;
}

function computeFloor(): DelicacyArcFloor {
  const trials = MEASURED_TRIALS.length;
  const counts = DEGRADATION_FAMILIES.map(
    (family) => MEASURED_TRIALS.filter((t) => t.family === family).length,
  );
  const uniform = counts.length > 0 && counts.every((c) => c === counts[0]);
  const perFamilyTrials = uniform ? counts[0] : null;

  return {
    trials,
    itemsToMove: Math.round(DELICACY_ARC_FLOOR_SHARE * trials),
    perFamilyTrials,
    perFamilyItemsToMove:
      perFamilyTrials === null
        ? null
        : Math.round(DELICACY_ARC_FAMILY_FLOOR_SHARE * perFamilyTrials),
  };
}

/** The live pool's floor. One object, read by every surface that states it. */
export const DELICACY_ARC_FLOOR: DelicacyArcFloor = computeFloor();
