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
  "pitch-drift": {
    unit: "cents of peak detune",
    ratio: Math.SQRT2,
    values: [3.1, 4.4, 6.3, 8.8, 12.5, 17.7, 25, 35.4, 50, 70.7, 100],
  },

  /**
   * 12.5 -> 100 ms of drift IQR, 10 levels, ratio 2^(1/3) (E2/S4b).
   *
   * THE PARAMETER MEANS SOMETHING DIFFERENT HERE than it does in LADDER_RUNGS,
   * and that is the point of the slice. There the value is `maxDevPct`, a BOUND
   * on ten random draws — so the realized drift is whatever the walk happens to
   * do. Measured across 40 seeds, the same parameter produces a 5.3x spread at
   * every setting, and the ranges OVERLAP COMPLETELY:
   *
   *     maxDevPct 0.0075  ->   4.9 ..  26.1 ms
   *     maxDevPct 0.015   ->   9.8 ..  52.1 ms
   *     maxDevPct 0.03    ->  19.6 .. 104.2 ms
   *     maxDevPct 0.05    ->  32.7 .. 173.7 ms
   *
   * A "rung 2" clip can drift further than a "rung 4" one. That is survivable
   * for a fixed assessment and disqualifying for a staircase, whose entire
   * output is a threshold expressed in step sizes. These levels are rendered in
   * `driftMs` mode instead, where the seeded draw sets the SHAPE of the wander
   * and is then rescaled so the stated drift comes out exact (spread 1.0000x).
   *
   * RENDERED AND MEASURED, source pb1 @75s, seed 500:
   *
   *     level    12.5 15.7 19.8   25 31.5 39.7   50   63 79.4  100
   *     measured   13   17   21   25   33   40   51   67   76   97   ms
   *
   * Strictly increasing, no ties, every level within 8% of its target.
   *
   * THE BOTTOM IS QUANTISATION, NOT TASTE. `temporalDrift` resolves 1 ms (its
   * envelope hop), so below ~12 ms the error is a large share of the value:
   * targets of 4.4 / 6.3 / 8.8 ms measured 6 / 8 / 8 — a tie and an inversion.
   *
   * THE TOP IS THE CORRELATOR. 100 ms measures 97 at 91% confidence; 141
   * measures 127 at 80%; 200 measures 102 at 72% — inverted. Even at the
   * widened 250 ms search window the measure gives out past ~140 ms.
   *
   * RATIO 2^(1/3) RATHER THAN sqrt(2) because the reliable span is 8x here
   * against pitch's 32x, and sqrt(2) would fit only 7 levels into it. Finer
   * steps inside a range we can measure beat wider steps that leave it.
   */
  "timing-smear": {
    unit: "ms of drift IQR",
    ratio: Math.cbrt(2),
    renderMode: "driftMs",
    values: [12.5, 15.7, 19.8, 25, 31.5, 39.7, 50, 63, 79.4, 100],
  },

  /**
   * 0.9 -> 9.5 dB of log-spectral distance, 10 levels, ratio ~1.3 (E2/S4c).
   *
   * THE LEVELS ARE IN dB, NOT kbps, AND THAT IS THE WHOLE POINT. Pitch and
   * timing have manipulation-intrinsic units: 25 cents is 25 cents whatever the
   * music, 30 ms of drift is 30 ms. Lossy does not. A bitrate is a SETTING, and
   * how much damage it does depends entirely on the material — so a "threshold
   * in kbps" would not be a property of the listener, which is the only thing
   * the instrument is trying to report.
   *
   * MEASURED ACROSS FIVE SOURCES (pb1 Bach piano, pb3 Chopin piano, pb4
   * Beethoven quartet, pb6 Zabriskie ambient, pb8 Shaw acoustic), same bitrates
   * from each. Spread = max/min across sources; lower is more material-independent:
   *
   *     bitrate    LSD dB spread    x anchor spread
   *     320k             3.26            1.00   (ratio is 1.0 here by construction)
   *     192k             3.08            1.44
   *     128k             3.05            3.87
   *     96k              4.68            7.01
   *     64k              6.47           13.52
   *     32k              2.59            6.80
   *
   * The anchor ratio was introduced to make LSD comparable across recordings.
   * It does the opposite everywhere below 192k — roughly 2x WORSE than the raw
   * dB it normalises. The reason is that anchor and damage are not
   * proportional: pb8 has the pool's LOWEST transparency anchor (0.266 dB) and
   * its HIGHEST 32k damage (25.6 dB), so dividing compounds the variance
   * instead of cancelling it. That is where d18's famous 94x came from.
   *
   * WHAT THE ANCHOR IS STILL GOOD FOR: a per-source transparency FLOOR. "This
   * manipulation is bigger than one known to be inaudible on this same
   * material" is a sound statement. It is a validity check, not a scale, and
   * conflating the two is the defect.
   *
   * SO THE LADDER IS DEFINED IN THE MEASURE, AND THE BITRATE IS SOLVED PER
   * SOURCE (see solveLossyBitrate). Same move as timing's driftMs: the level
   * states the magnitude, and the render parameter is derived to hit it.
   *
   * RANGE, AND IT IS NARROW — narrower than either other family, for three
   * measured reasons that stack:
   *
   *   CEILING, saturation. The family stops responding below 32 kbps: 32k and
   *   24k measure 12.39 and 12.40 dB on pb1. And the usable ceiling is the
   *   LOWEST maximum across sources, since a level no source can reach is not a
   *   level — pb6 tops out at 9.9 dB even at 32k.
   *
   *   FLOOR, measurement noise. Above ~128 kbps the differences are small
   *   enough that the curve is NOT MONOTONE. Measured, and it is the reason the
   *   floor is 2.0 and not the 0.9 this ladder was first drafted with:
   *
   *       pb6   320k 0.6 -> 192k 0.9 -> 128k 1.0 -> 96k 0.9   (falls)
   *       pb3   320k 0.9 -> 192k 1.4 -> 128k 1.0              (falls)
   *
   *   Two of five sources reverse below 1.7 dB. A staircase level down there
   *   would not reliably differ from the level above it.
   *
   *   WIDTH, material. Even inside the usable band, the same bitrate spans
   *   2.6-6.5x in dB across these five recordings, which is why the level is
   *   stated in dB and the bitrate solved per source rather than fixed.
   *
   * The result is 8 levels over 4.75x, against pitch's 11 over 32x. That is an
   * honest description of the family, not a placeholder to be widened later:
   * lossy has less room between "inaudible" and "saturated" than a pitch or
   * tempo manipulation does, and pretending otherwise would put levels where
   * the measure cannot tell them apart.
   */
  "lossy-artifact": {
    unit: "dB log-spectral distance",
    ratio: 1.249,
    renderMode: "solvedBitrate",
    values: [2.0, 2.5, 3.1, 3.9, 4.9, 6.1, 7.6, 9.5],
  },
};

/**
 * HOW TO RENDER ONE STAIRCASE LEVEL (E4/S0, 2026-08-15).
 *
 * THE PROBLEM. `degradeWavParam` defaults `timingMode` to `maxDevPct`, and it
 * has to: the shipped pool was rendered under that meaning and live share URLs
 * score against that exact audio. But the staircase ladder is in MILLISECONDS
 * and must render in `driftMs`, where the level determines the magnitude
 * instead of merely bounding a random draw (E2/S4b — the legacy mode spreads
 * 5.3x across seeds, with rung ranges overlapping completely).
 *
 * So every staircase render depends on a caller remembering to pass a flag, and
 * `ladder.mjs` calls `degradeWavParam` POSITIONALLY and structurally cannot.
 *
 * MEASURED, and it corrects the handoff's premise: this failure is LOUD, not
 * silent. A staircase level rendered in legacy mode asks for a per-segment tempo
 * deviation of hundreds of percent and trips the 25% ceiling (staircase.test.ts
 * proves it for all ten levels). The units are disjoint by construction and that
 * is what saves it.
 *
 * It is still wrong to leave a correctness property resting on an exception
 * thrown three call-layers down. The mode is a fact about the FAMILY, it is
 * already recorded in the table above, and the fix is the same one this module
 * exists for: read it from the one table rather than restate it at each call
 * site. A level that is not on the ladder is rejected here rather than rendered
 * into a file whose name claims otherwise.
 *
 * @returns { param, opts } to spread into `degradeWavParam`.
 */
export function staircaseRender(family, level) {
  const spec = STAIRCASE_LEVELS[family];
  if (!spec) {
    throw new Error(`staircaseRender: unknown family "${family}" (know: ${Object.keys(STAIRCASE_LEVELS).join(", ")})`);
  }
  if (!spec.values.some((v) => v === level)) {
    throw new Error(
      `staircaseRender: ${level} is not a ${family} level (${spec.unit}) — have ${spec.values.join(", ")}`,
    );
  }
  if (family === "lossy-artifact") {
    // A dB target is not a render parameter. The bitrate that reaches it
    // depends on the material, so it has to be solved against THAT source's
    // measured curve, and a level no source can reach must be skipped rather
    // than clamped (see solveLossyBitrate).
    throw new Error(
      `staircaseRender: lossy-artifact levels are in ${spec.unit} and must be solved per source — call solveLossyBitrate(${level}, curve) and render the bitrate it returns`,
    );
  }
  return { param: level, opts: spec.renderMode ? { timingMode: spec.renderMode } : {} };
}

/**
 * The bitrate that hits a target LSD on ONE source (E2/S4c).
 *
 * IT IS NOT SAFE TO ASSUME THE CURVE IS MONOTONE. The first version of this
 * said so in its own comment and simply sorted by dB — which, on a curve that
 * reverses, silently pairs one dB value with two different bitrates and returns
 * whichever the sort happened to put first. Measured: pb6 runs 0.6 / 0.9 / 1.0 /
 * 0.9 dB across 320k / 192k / 128k / 96k, and pb3 reverses too. Above ~128 kbps
 * the differences are inside the measurement noise.
 *
 * So the solver takes the LONGEST MONOTONE RUN, walking down from the lowest
 * bitrate (where the signal is unambiguous) and stopping at the first reversal.
 * Anything above that point is not a region we can invert, and a target landing
 * there returns null rather than a confident-looking wrong bitrate.
 *
 * Interpolation is in log(bitrate) against dB — that is the axis on which the
 * measured curve is closest to straight, and interpolating on the wrong one
 * would bias every solved value in the same direction.
 *
 * Returns null when the target is outside the invertible region. Callers must
 * SKIP that level for that source rather than clamp to the nearest: clamping
 * would render two different levels as the same audio and report them as
 * different magnitudes.
 *
 * @param curve [{ bitrateKbps, lsdDb }] measured for this source, any order.
 */
export function solveLossyBitrate(targetLsdDb, curve) {
  if (curve.length < 2) throw new Error("solveLossyBitrate: need at least two measured points");
  // Ascending bitrate = descending damage. Keep the run that stays monotone.
  const byBitrate = [...curve].sort((a, b) => a.bitrateKbps - b.bitrateKbps);
  const run = [byBitrate[0]];
  for (let i = 1; i < byBitrate.length; i++) {
    if (byBitrate[i].lsdDb >= run[run.length - 1].lsdDb) break; // reversal
    run.push(byBitrate[i]);
  }
  if (run.length < 2) return null;

  const pts = [...run].sort((a, b) => a.lsdDb - b.lsdDb);
  const lo = pts[0];
  const hi = pts[pts.length - 1];
  if (targetLsdDb < lo.lsdDb || targetLsdDb > hi.lsdDb) return null;

  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    if (targetLsdDb <= b.lsdDb) {
      if (b.lsdDb === a.lsdDb) return b.bitrateKbps; // saturated segment
      const t = (targetLsdDb - a.lsdDb) / (b.lsdDb - a.lsdDb);
      const logBr = Math.log(a.bitrateKbps) + t * (Math.log(b.bitrateKbps) - Math.log(a.bitrateKbps));
      return Math.round(Math.exp(logBr));
    }
  }
  return null;
}

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
