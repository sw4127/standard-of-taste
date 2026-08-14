/**
 * THE LADDER — the single source of truth for "what does rung N mean".
 *
 * WHY THIS FILE EXISTS (RT-52a, 2026-08-13). It used to live in two places. The
 * planner read `LADDER_RUNGS` in ladder.mjs; the single-pair CLI read a separate
 * `FAMILIES` table in degrade.mjs that had never been updated when the ladder was
 * widened. They disagreed:
 *
 *     shipped ladder    timing-smear  rung 1  0.0075   rung 2  0.015   rung 3  0.03
 *     stale CLI table   timing-smear      —   (none)   rung 1  0.015   rung 2  0.03
 *
 * So `degrade --family timing-smear --magnitude 2` rendered the ladder's RUNG 3 —
 * double the intended strength — and wrote "magnitude 2" into the manifest beside
 * it. Nothing downstream could catch that: every check verifies the audio against
 * what was rendered, and the rung label is exactly the thing no measurement sees.
 * It was caught by hand, while re-rendering d2 for pool v2, which is not a control.
 *
 * MEASURED SCOPE: 6 of the 9 shared rung labels disagreed, not one.
 *
 *     family          rung  stale CLI  ladder
 *     pitch-drift     1-3   12/25/50   12/25/50   agree
 *     timing-smear    1-3   .015/.03/.05  .0075/.015/.03   OFF BY ONE RUNG
 *     lossy-artifact  1-3   96k/64k/32k   128k/96k/64k     OFF BY ONE RUNG
 *
 * Pitch-drift escaped by accident: its ladder was widened by APPENDING 100 at the
 * top, so indices 1-3 kept their meaning, while timing-smear and lossy-artifact
 * were widened by PREPENDING a gentler rung, which shifted every index by one.
 * Two of three families would have rendered a full rung too strong under a label
 * saying otherwise — and the label is what item difficulty is analysed against.
 *
 * The fix is structural rather than a corrected duplicate: one table, imported by
 * everything that needs it, and a test (rungs.test.ts) that pins the CLI and the
 * planner to the same value for every family and rung. It lives in its own module
 * because ladder.mjs already imports degrade.mjs, so putting the table in either
 * one makes the import cycle.
 *
 * UNITS DIFFER PER FAMILY and are stated so a reader never has to guess what "25"
 * means. Rungs 2-4 ship; rung 1 is measured and deliberately not shipped (it lands
 * under the 3x fair-trial floor — see items.ts).
 *
 * HONESTY (N3): a rung's parameter drives its measured MAGNITUDE monotonically,
 * which is what ladder.mjs proves. It does not establish difficulty. Which rung
 * lands in the acceptance band is a Layer B question and needs real responses.
 */

export const LADDER_RUNGS = {
  // WIDENED 2026-08-07 (PM ruling RT-27a). Layer A measured the old shipping
  // rungs as marginal: 12 cents landed at 2.6-3.3x the transparency anchor
  // against a 3x fair-trial floor, wherever it was placed. Each shipping step
  // is doubled. 100 cents is a semitone of drift accumulated ACROSS a 20s
  // clip — still a drift, not a wrong note, which is why the ladder stops
  // there rather than at the 200 cents originally proposed.
  "pitch-drift": { unit: "cents of peak detune", values: [12, 25, 50, 100] },
  "timing-smear": { unit: "max per-segment tempo deviation", values: [0.0075, 0.015, 0.03, 0.05] },
  "lossy-artifact": { unit: "mp3 round-trip bitrate", values: ["128k", "96k", "64k", "32k"] },
};

/** Rungs that ship in the pool. Rung 1 is measured and rejected (items.ts). */
export const SHIPPING_RUNGS = [2, 3, 4];

/**
 * THE STAIRCASE LADDER — dense levels for the adaptive threshold instrument
 * (E2/S4, 2026-08-14). Separate from LADDER_RUNGS above, on purpose.
 *
 * WHY NOT JUST WIDEN LADDER_RUNGS. Because rung NUMBERS are load-bearing: the
 * shipped pool records `magnitude: 3` and the manifest records the parameter
 * beside it, so inserting levels renumbers every existing item and makes d4's
 * recorded magnitude refer to a different manipulation. That is precisely the
 * failure this file was created to end, and doing it deliberately would not be
 * an improvement on doing it by accident.
 *
 * So the staircase is keyed by PHYSICAL VALUE, not by index. A staircase does
 * not need "rung N" — it needs an ordered list of parameters to step through,
 * and a trial is identified by the parameter it was rendered at. LADDER_RUNGS
 * keeps its meaning and the shipping pool is untouched.
 *
 * SPACING: a constant ratio of sqrt(2), i.e. every second level doubles.
 * Constant-ratio spacing is what a staircase wants — a step should mean the
 * same thing wherever it lands — and sqrt(2) has the property that the ladder
 * PASSES THROUGH the values already shipping (12.5 ~ the old rung 1's 12, then
 * 25, 50, 100), so the existing renders remain interpretable on the new scale
 * rather than becoming orphans.
 */
export const STAIRCASE_LEVELS = {
  /**
   * 3.1 -> 100 cents, 11 levels, ratio sqrt(2). MEASURED, source pb1 @75s
   * (`clip-pipeline curve --family pitch-drift`): the cents ruler recovers the
   * rendered peak across this entire span, against a ramp prediction of
   * 0.95 x param —
   *
   *     param     3    4    6    8   11   15   21   29   40   55   76  105  145  200
   *     measured 2.7  3.9  5.2  7.8 10.3 14.6 20.0 28.0 38.6 52.2 72.2 100.1 138.2 190.1
   *     predicted 2.9  3.8  5.7  7.6 10.5 14.3 20.0 27.6 38.0 52.3 72.2  99.8 137.8 190.0
   *
   * THE BOTTOM IS SET BY MEASURABILITY, NOT BY TASTE. At 2 cents the ruler
   * reads 1.4 against a predicted 1.9 — a 26% under-read, where every level
   * from 3 upward lands within a few percent. So 3.1 is the lowest level whose
   * rendered magnitude we can still stand behind, and nothing below it ships
   * whatever a staircase might want to ask.
   *
   * THE TOP IS SET BY MEANING, and the constraint is inherited rather than new:
   * 100 cents is a semitone accumulated ACROSS a 20s clip — still a drift, not
   * a wrong note (see LADDER_RUNGS above). The ruler is happy to 200 and the
   * ladder deliberately is not.
   */
  "pitch-drift": [3.1, 4.4, 6.3, 8.8, 12.5, 17.7, 25, 35.4, 50, 70.7, 100],
  // lossy-artifact and timing-smear are NOT here yet, and their absence is
  // deliberate rather than pending tidy-up. Each needs a problem solved first
  // that pitch did not have:
  //   lossy   — the anchor ratio divides by a per-source number that spans 5.6x
  //             across the pool, so two clips with near-identical damage report
  //             3.5x and 8.9x. Spacing a ladder on that scale would encode the
  //             denominator's noise into the rungs. It also SATURATES below
  //             32k (32k and 24k measure 12.39 and 12.40 dB), so the room is
  //             upward, between 320k and 128k.
  //   timing  — the parameter is a BOUND on a seeded random draw, not a
  //             determinant like the pitch ramp, so two clips at the same level
  //             can differ materially. A staircase whose step size varies at
  //             random is stepping in noise.
};

/**
 * Lowest detune whose rendered magnitude the cents ruler can still stand
 * behind, in cents. Measured (above), not chosen.
 *
 * DISTINCT FROM validate.mjs's MIN_PITCH_CENTS, and the difference matters.
 * That one is a FAIR-TRIAL floor for the fixed assessment — "is this big enough
 * to be worth asking anybody" — and sits at 10. This one is a MEASURABILITY
 * floor: "can we say what we rendered". A staircase converging downward toward
 * a listener's threshold must be allowed below the fair-trial floor, because
 * finding where someone stops hearing is the entire point; it must never go
 * below this one, because there we would be reporting a number we cannot back.
 */
export const MIN_MEASURABLE_PITCH_CENTS = 3;

/** The degradation families the pipeline knows how to render. */
export const LADDER_FAMILIES = Object.keys(LADDER_RUNGS);

/**
 * Resolve a rung label to its parameter. THE one conversion — the CLI, the
 * planner and the ladder runner all come through here, so a rung cannot mean
 * two things again. Throws rather than returning undefined: a silent miss here
 * is the failure mode this module was created to end.
 */
export function paramForRung(family, rung) {
  const spec = LADDER_RUNGS[family];
  if (!spec) throw new Error(`unknown family "${family}" (know: ${LADDER_FAMILIES.join(", ")})`);
  if (!Number.isInteger(rung) || rung < 1 || rung > spec.values.length)
    throw new Error(`no ${family} rung ${rung} (ladder has rungs 1-${spec.values.length})`);
  return spec.values[rung - 1];
}
