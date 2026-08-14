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
