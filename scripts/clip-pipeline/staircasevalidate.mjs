/**
 * LAYER A OVER THE STAIRCASE POOL (E4/S5, 2026-08-18).
 *
 *   node scripts/clip-pipeline/index.mjs staircase-validate [--json]
 *
 * `staircase-render` referenced this stage in its own closing output for a
 * whole session before it existed. 198 clips shipped with their MAGNITUDE
 * verified and their FITNESS never looked at.
 *
 * THE TWO QUESTIONS ARE NOT THE SAME, and keeping them apart is the point of
 * having two stages. `staircase-render` asks "is this file the magnitude its
 * filename claims" — the property the reported threshold is denominated in.
 * This asks "is this file fit to put in front of a listener at all". A clip can
 * measure exactly 25.0 cents of detune and still be unanswerable because it
 * fades to silence, or because 40% of it is rests, or because it clicks. Every
 * one of those produces a confident threshold that is a fact about the CLIP
 * rather than about the ear (N3), and the magnitude check cannot see any of
 * them.
 *
 * ONE DELIBERATE DIFFERENCE FROM `validate.mjs`, and it is the whole reason
 * this is a separate grader rather than a call into that one: the pitch floor.
 * The fixed assessment gates at MIN_PITCH_CENTS (10) — a FAIR-TRIAL floor, "is
 * this big enough to be worth asking anybody". A staircase converging downward
 * toward a listener's threshold MUST be allowed below that, because finding
 * where someone stops hearing is the entire instrument. It gates at
 * MIN_MEASURABLE_PITCH_CENTS (3) instead — "can we still say what we rendered"
 * — which `rungs.mjs` measured and records the reasoning for. Every other
 * threshold is IMPORTED from `validate.mjs` rather than restated, because two
 * copies of a threshold is how two rung tables came to disagree.
 *
 * WHAT IS RE-MEASURED AND WHAT IS READ. Fitness is measured fresh from the
 * shipped file, because nothing has ever measured it. Magnitude is READ from
 * the manifest, because `staircase-render` measured the identical file with the
 * identical ruler at the identical analysis rate, and a second copy of that
 * number would be a second table of truth with no rule for which one wins. What
 * makes reading safe is the integrity check: every file is hashed on disk
 * against the manifest first, so every figure below is provably about THIS
 * file. A hash mismatch is an ERROR, not a FLAG — the clip may be perfect, but
 * nothing we know about it is known to describe it.
 */

import {
  MAX_CLIPPED_FRACTION,
  MAX_FLAT_TOP_FRACTION,
  MAX_QUIET_FRACTION,
  MAX_SILENCE_SEC,
  MIN_CONFIDENT_BLOCK_FRACTION,
  MIN_CONFIDENT_PITCH_FRACTION,
} from "./validate.mjs";
import { MIN_MEASURABLE_PITCH_CENTS } from "./rungs.mjs";

export {
  MAX_CLIPPED_FRACTION,
  MAX_FLAT_TOP_FRACTION,
  MAX_QUIET_FRACTION,
  MAX_SILENCE_SEC,
  MIN_CONFIDENT_BLOCK_FRACTION,
  MIN_CONFIDENT_PITCH_FRACTION,
  MIN_MEASURABLE_PITCH_CENTS,
};

/**
 * Lowest drift whose rendered magnitude the timing ruler can still ORDER, in
 * ms. The exact twin of MIN_MEASURABLE_PITCH_CENTS, and measured the same way.
 *
 * FROM THE MEASUREMENT ALREADY IN `rungs.mjs`, not chosen here: `temporalDrift`
 * resolves 1 ms (its envelope hop), and below ~12 ms that quantisation is a
 * large share of the value — targets of 4.4 / 6.3 / 8.8 ms came back as
 * 6 / 8 / 8, which is a TIE and an INVERSION in three levels. 12.5 is the
 * lowest level the ruler was observed to order, and it measured 13.
 *
 * SET JUST BELOW THE LADDER'S BOTTOM, on purpose. This is not a gate the
 * current ladder can fail — the lowest level shipping is 12.5. It is the guard
 * that fires the day somebody extends the ladder downward to chase a listener
 * who is better than the instrument, which is exactly the pressure a staircase
 * puts on its own floor. A floor that only exists once it has been breached is
 * not a floor.
 *
 * NOT A DIFFICULTY THRESHOLD (N3). It says nothing about what anyone can hear;
 * it says what we can still stand behind having rendered.
 */
export const MIN_MEASURABLE_DRIFT_MS = 12;

/**
 * The magnitude gate per family: which floor the measurement must clear, and
 * how confident the ruler had to be before its number is believed at all.
 *
 * A TABLE RATHER THAN A CHAIN OF `if`s, so a family with no entry is a visible
 * hole instead of an unhandled branch falling through to PASS. The lossy family
 * deliberately has NO entry yet: `staircase-render` refuses to render it (it is
 * per-source, E4/S4), so no lossy staircase clip exists to grade, and inventing
 * its gate now would mean pre-registering a threshold against zero
 * observations. When E4/S4 renders them, the missing entry makes every one of
 * them ERROR rather than silently PASS.
 */
export const STAIRCASE_MAGNITUDE_GATES = {
  "pitch-drift": {
    floor: MIN_MEASURABLE_PITCH_CENTS,
    unit: "cents",
    minConfidentFraction: MIN_CONFIDENT_PITCH_FRACTION,
    /** A pitch shift is duration-exact, so its frames SHOULD match. */
    confidenceLabel: "frames matched",
  },
  "timing-smear": {
    floor: MIN_MEASURABLE_DRIFT_MS,
    unit: "ms",
    minConfidentFraction: MIN_CONFIDENT_BLOCK_FRACTION,
    /**
     * Warped audio genuinely correlates less well than aligned audio, so this
     * floor is permissive by design — it rejects "the correlator never locked",
     * not "the correlator found this hard" (validate.mjs).
     */
    confidenceLabel: "blocks aligned",
    /**
     * TIMING'S MAGNITUDE FLOOR ABOVE IS NEARLY VACUOUS, AND SAYING SO IS THE
     * POINT OF THIS FIELD.
     *
     * Per RT-74a the label is the MODEL: `measured.value` equals `level`
     * exactly, computed from (seed, param, clipSec) without the audio ever
     * being consulted. So `value >= floor` tests a property of the LADDER
     * TABLE, not of the file. A timing clip whose warp silently failed to
     * render would still carry value = level = 25 and clear it. Pitch has no
     * such problem — its cents figure is recovered FROM the rendered audio, so
     * its floor is a real measurement of a real file.
     *
     * The evidence that a timing clip's drift actually rendered is
     * `staircase-render`'s trajectory gate (r >= MIN_TRAJECTORY_R, slope within
     * MAX_TRAJECTORY_SLOPE_ERR_PCT of 1) — neither satisfiable by construction.
     * Layer A does NOT re-derive that threshold, for the same reason it does
     * not re-measure clipping: a second copy is a second table of truth. It
     * reads the verdict, and refuses to bless a clip whose verdict is missing.
     */
    evidenceField: "trajectoryVerified",
    evidenceLabel: "drift trajectory (staircase-render's r/slope gate)",
  },
};

/**
 * Grade ONE staircase entry — a degraded clip or a window reference.
 *
 * Pure: takes a measurement-shaped row and returns a verdict. Separated from
 * the measuring so thresholds can move without re-decoding 198 files, and so
 * every rejection path can be driven directly by a test rather than waiting for
 * real audio to go wrong — the gap `validate.test.ts` was written to close, and
 * the reason a gate never observed to reject is not yet known to be a gate.
 *
 * REFERENCES ARE GRADED TOO, and nothing had ever looked at them. A reference
 * is the "A" side of every trial in its window: if it holds two seconds of dead
 * air, all 21 trials drawn from that window are unanswerable, while the 21
 * degraded clips are each individually flawless.
 *
 * @param m {{
 *   id: string, kind: "reference"|"degraded", sourceId?: string, startSec?: number,
 *   family?: string, level?: number,
 *   fileMissing?: boolean, sha256Match?: boolean,
 *   preNormClippedFraction?: number|null,
 *   measuredValue?: number|null, confidentFraction?: number|null,
 *   trajectoryVerified?: boolean|null,
 *   flatTopFraction: number, longestSilenceSec: number, quietFraction: number,
 * }}
 * @returns the row plus `verdict` ("PASS" | "FLAG" | "ERROR"), `gatedOn`, `reasons`.
 */
export function gradeStaircaseClip(m) {
  const err = (reason) => ({ ...m, verdict: "ERROR", gatedOn: "n/a", reasons: [reason] });

  // INTEGRITY FIRST. Everything after this point is either read from the
  // manifest or measured from the file, and those are only statements about the
  // same subject if the file is the one the manifest describes.
  if (m.fileMissing) return err("audio missing from public/audio/staircase");
  if (m.sha256Match === false) {
    return err("sha256 on disk does not match the manifest — the recorded measurements describe a different file");
  }
  if (m.sha256Match !== true) return err("sha256 not checked — cannot attribute any measurement to this file");

  const reasons = [];
  const degraded = m.kind === "degraded";
  const gate = degraded ? STAIRCASE_MAGNITUDE_GATES[m.family] : null;
  if (degraded && !gate) {
    return err(`no Layer A magnitude gate defined for family "${m.family}" — a clip nothing can judge must not pass`);
  }

  // MAGNITUDE — read from the manifest, gated in the family's own physical
  // unit. Confidence is established BEFORE magnitude, the same order
  // `validate.mjs` uses: a value computed from frames that never matched is not
  // a small measurement, it is not a measurement.
  if (gate) {
    // EVIDENCE THE MAGNITUDE IS A FACT ABOUT THE AUDIO, where the family's own
    // headline figure is not one (timing — see the gate table). Absent is an
    // ERROR and false is a FLAG: "nobody established it" and "it was
    // established and failed" are different states, and neither is a pass.
    if (gate.evidenceField) {
      const evidence = m[gate.evidenceField];
      if (evidence === undefined || evidence === null) {
        return err(
          `${gate.evidenceLabel} was never established for this clip — its magnitude label comes from the model, ` +
            `not from the audio (RT-74a), so nothing here can vouch for the file`,
        );
      }
      if (evidence !== true) {
        reasons.push(
          `${gate.evidenceLabel} did not verify — the labelled magnitude is the model's, and the audio does not corroborate it`,
        );
      }
    }
    if (!(m.confidentFraction >= gate.minConfidentFraction)) {
      reasons.push(
        `magnitude unmeasurable — only ${((m.confidentFraction ?? 0) * 100).toFixed(0)}% of ${gate.confidenceLabel} ` +
          `(need >=${(gate.minConfidentFraction * 100).toFixed(0)}%)`,
      );
    } else if (!(m.measuredValue >= gate.floor)) {
      reasons.push(
        `magnitude ${m.measuredValue ?? "unknown"} ${gate.unit} is below the ruler's own floor of ` +
          `${gate.floor} ${gate.unit} — we cannot stand behind what was rendered`,
      );
    }
  }

  // CLIPPING IS READ, NEVER RE-MEASURED (RT-17a). Our render path normalises
  // after the manipulation, so clipped audio arrives at -1.5 dBTP with no
  // full-scale samples: a deliberately clipped render measured 0.0000% on the
  // shipped file while its LSD was 13 dB. The pre-normalisation waveform is the
  // only place it is visible, and only the renderer ever saw that.
  //
  // AN ABSENT FIGURE IS AN ERROR, NOT A PASS. "Nobody measured it" and "it
  // measured zero" are the two things this gate exists to keep apart, and the
  // staircase renderer records the figure for degraded clips only — so a
  // reference reaching this line without one is a real hole, and it says so
  // instead of scoring 0.
  if (m.preNormClippedFraction === null || m.preNormClippedFraction === undefined) {
    return err(
      "pre-normalisation clipping was never measured for this clip — it cannot be established after loudnorm (RT-17a)",
    );
  }
  if (m.preNormClippedFraction > MAX_CLIPPED_FRACTION) {
    reasons.push(
      `clipping ${(m.preNormClippedFraction * 100).toFixed(4)}% pre-loudnorm ` +
        `(max ${(MAX_CLIPPED_FRACTION * 100).toFixed(4)}%) — a click is audible without the degradation being`,
    );
  }

  // FITNESS — measured fresh from the shipped file, because nothing ever has.
  if (m.flatTopFraction > MAX_FLAT_TOP_FRACTION) {
    reasons.push(
      `flat-topped crests ${(m.flatTopFraction * 100).toFixed(2)}% (clipping that survived loudness normalisation)`,
    );
  }
  if (m.longestSilenceSec > MAX_SILENCE_SEC) {
    reasons.push(`dead air ${m.longestSilenceSec.toFixed(2)}s (max ${MAX_SILENCE_SEC}s) — the trial is unanswerable across it`);
  }
  if (m.quietFraction > MAX_QUIET_FRACTION) {
    reasons.push(
      `${(m.quietFraction * 100).toFixed(0)}% of the clip is near-silent (max ${MAX_QUIET_FRACTION * 100}%) — ` +
        `too little sounding material to judge`,
    );
  }

  return {
    ...m,
    gatedOn: gate ? `${gate.unit}-floor + fitness` : "fitness-only",
    verdict: reasons.length === 0 ? "PASS" : "FLAG",
    reasons,
  };
}
