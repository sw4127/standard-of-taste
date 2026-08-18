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

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  cutSource,
  renderAnchors,
  MAX_CLIPPED_FRACTION,
  MAX_FLAT_TOP_FRACTION,
  MAX_QUIET_FRACTION,
  MAX_SILENCE_SEC,
  MIN_CONFIDENT_BLOCK_FRACTION,
  MIN_CONFIDENT_PITCH_FRACTION,
  TMP,
} from "./validate.mjs";
import { MIN_MEASURABLE_PITCH_CENTS } from "./rungs.mjs";
import { decodeMono } from "./degrade.mjs";
import { clippingStats, longestSilenceSec, quietFraction, DEFAULT_SPECTRAL_OPTS } from "./spectral.mjs";
import {
  STAIRCASE_MANIFEST,
  STAIRCASE_OUT,
  MIN_TRAJECTORY_R,
  MAX_LEVEL_ERR_PCT,
  MAX_TRAJECTORY_SLOPE_ERR_PCT,
} from "./staircaserender.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const BIAS_MANIFEST = join(ROOT, "src", "content", "bias", "manifest.json");
const CACHE = join(HERE, ".cache");

/** Analysis rate. The same one `staircase-render` measured at, so the figures
 *  read from the manifest and the ones measured here describe one signal. */
const SR = DEFAULT_SPECTRAL_OPTS.sampleRate;

/** The rate the renderer measured pre-loudnorm clipping at (`degCut`, 44100).
 *  References are measured at the same rate or the two are not comparable. */
const PRE_NORM_SR = 44100;

const sha256File = (f) => createHash("sha256").update(readFileSync(f)).digest("hex");

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
/**
 * THE FLOORS ARE IN THE PARAMETER DOMAIN, NOT THE MEASUREMENT DOMAIN.
 *
 * FOUND BY RUNNING THIS OVER THE REAL POOL (E4/S5/S2) — the first version
 * compared `MIN_MEASURABLE_PITCH_CENTS` against each clip's MEASURED p95 and
 * flagged pitch level 3.1 on eight of nine windows. That was a unit mismatch,
 * not a finding. `rungs.mjs` measured the floor in the parameter domain — its
 * table reads `param 3 -> measured 2.7, predicted 2.9`, and its prose says "3.1
 * is the lowest LEVEL whose rendered magnitude we can still stand behind".
 * Because a ramp peaks at PITCH_RAMP_PEAK_FRACTION (0.95) of its parameter,
 * level 3.1 PREDICTS 2.94 cents — already under a 3-cent measurement floor by
 * construction. Every one of those eight clips sat within 8.4% of its own
 * prediction; the ruler was behaving and the comparison was wrong.
 *
 * So the floor is checked against `level`. Which makes it a property of the
 * LADDER TABLE rather than of the audio — precisely the vacuity that had to be
 * fixed for timing — so both families now also carry an EVIDENCE field, read
 * from whichever of `staircase-render`'s gates actually interrogates the file.
 */
export const STAIRCASE_MAGNITUDE_GATES = {
  "pitch-drift": {
    floor: MIN_MEASURABLE_PITCH_CENTS,
    unit: "cents",
    minConfidentFraction: MIN_CONFIDENT_PITCH_FRACTION,
    /** A pitch shift is duration-exact, so its frames SHOULD match. */
    confidenceLabel: "frames matched",
    /**
     * Pitch's headline figure IS recovered from the rendered audio, so unlike
     * timing it has a real error term: `staircase-render` gates |errPct| at
     * MAX_LEVEL_ERR_PCT against the ramp prediction. Read, not re-derived.
     */
    evidenceField: "levelErrVerified",
    evidenceLabel: `measured detune within ${MAX_LEVEL_ERR_PCT}% of the ramp prediction (staircase-render's error gate)`,
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
 *   trajectoryVerified?: boolean|null, levelErrVerified?: boolean|null,
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
    } else if (!(m.level >= gate.floor)) {
      // THE LEVEL, NOT THE MEASUREMENT — see the gate table. The floor was
      // measured in the parameter domain, and a ramp peaks below its parameter.
      reasons.push(
        `level ${m.level ?? "unknown"} ${gate.unit} is below the ruler's own floor of ` +
          `${gate.floor} ${gate.unit} — we cannot stand behind what was rendered there`,
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

/**
 * Did `staircase-render`'s trajectory gate verify this timing clip?
 *
 * READS the recorded r and slope and applies the SAME constants that stage
 * gates on, imported from it. Not a second threshold: if `MIN_TRAJECTORY_R`
 * moves, both stages move together. Returns null when the figures are absent,
 * which `gradeStaircaseClip` turns into an ERROR rather than a pass.
 */
/**
 * Did `staircase-render`'s ERROR gate verify this pitch clip — is the detune
 * recovered from the audio within MAX_LEVEL_ERR_PCT of the ramp prediction?
 *
 * Same contract as `trajectoryVerdict`: reads that stage's own constant, so the
 * two cannot drift apart. Null when the figure is absent, which the grader
 * turns into an ERROR rather than a pass.
 */
export function levelErrVerdict(measured) {
  if (measured?.errPct === undefined || measured?.errPct === null) return null;
  return Math.abs(measured.errPct) <= MAX_LEVEL_ERR_PCT;
}

export function trajectoryVerdict(measured) {
  if (measured?.trajectoryR === undefined || measured?.trajectorySlope === undefined) return null;
  return (
    measured.trajectoryR >= MIN_TRAJECTORY_R &&
    Math.abs(measured.trajectorySlope - 1) * 100 <= MAX_TRAJECTORY_SLOPE_ERR_PCT
  );
}

/**
 * Measure ONE staircase entry into the shape `gradeStaircaseClip` grades.
 *
 * WHAT IS MEASURED HERE AND WHAT IS READ, restated because the split is the
 * design: fitness (flat tops, dead air, quiet fraction) is measured fresh from
 * the shipped file because nothing ever has; magnitude is READ from the
 * manifest because the renderer measured this identical file with the identical
 * ruler at the identical rate. The sha256 check is what makes reading safe.
 *
 * @param refClipping {(entry) => number|null} supplies the pre-loudnorm
 *   clipping figure for a REFERENCE, which the renderer never recorded.
 */
export function measureStaircaseClip(entry, { refClipping } = {}) {
  const file = join(STAIRCASE_OUT, entry.file);
  const base = {
    id: entry.id,
    kind: entry.kind,
    sourceId: entry.sourceId,
    startSec: entry.startSec,
    family: entry.family,
    level: entry.level,
  };
  if (!existsSync(file)) {
    return { ...base, fileMissing: true, flatTopFraction: 0, longestSilenceSec: 0, quietFraction: 0 };
  }

  const sha256Match = sha256File(file) === entry.sha256;
  const samples = decodeMono(file, SR);
  const clip = clippingStats(samples);

  return {
    ...base,
    sha256Match,
    // Degraded clips carry the renderer's pre-loudnorm figure. References do
    // not — the renderer records it only for degraded clips — so it is measured
    // here from the source window, cut by the identical command (RT-81a).
    preNormClippedFraction: entry.kind === "degraded" ? entry.preNormClippedFraction : refClipping?.(entry),
    measuredValue: entry.measured?.value,
    confidentFraction: entry.measured?.confidentFraction,
    trajectoryVerified: entry.family === "timing-smear" ? trajectoryVerdict(entry.measured) : undefined,
    levelErrVerified: entry.family === "pitch-drift" ? levelErrVerdict(entry.measured) : undefined,
    // Reported, never gated, and the reason is measured: `rungs.mjs` found the
    // anchor ratio roughly 2x WORSE than raw dB as a cross-material scale below
    // 192 kbps, because anchor and damage are not proportional. It survives as
    // a per-source transparency FLOOR — "bigger than something known inaudible
    // on this same material" — which is a validity check, not a scale.
    lsdDb: entry.measured?.lsdDb ?? null,
    flatTopFraction: clip.flatTopFraction,
    longestSilenceSec: longestSilenceSec(samples, SR),
    quietFraction: quietFraction(samples, SR),
  };
}

/**
 * Which windows a family may still draw instances from, AFTER Layer A.
 *
 * THE INTERSECTION, and it exists so E5 cannot forget to take it. The renderer
 * records `instanceWindows` per family from ITS gates (the trajectory check,
 * RT-75a); this stage can disqualify a window for reasons the renderer never
 * looked at — a reference that fades out, a clip that clicks. Two lists with no
 * rule for combining them is the two-tables defect, so there is one function
 * and it is the only sanctioned way to ask.
 *
 * A reference failure is recorded against family "*", because the reference is
 * the A side of EVERY trial drawn from its window.
 */
export function eligibleWindows(manifest, family) {
  const fromRender = (manifest.instanceWindows?.[family] ?? []).map((w) => `${w.sourceId}@${w.startSec}`);
  const blocked = new Set(
    (manifest.layerA?.excludedWindows ?? [])
      .filter((e) => e.family === family || e.family === "*")
      .map((e) => `${e.sourceId}@${e.startSec}`),
  );
  return fromRender
    .filter((w) => !blocked.has(w))
    .map((w) => ({ sourceId: w.split("@")[0], startSec: Number(w.split("@")[1]) }));
}

export async function staircaseValidate(args = []) {
  const json = args.includes("--json");
  const noAnchors = args.includes("--no-anchors");
  if (!existsSync(STAIRCASE_MANIFEST)) throw new Error(`staircase-validate: no manifest at ${STAIRCASE_MANIFEST}`);
  const manifest = JSON.parse(readFileSync(STAIRCASE_MANIFEST, "utf8"));
  const entries = [...(manifest.references ?? []), ...(manifest.clips ?? [])];
  if (entries.length === 0) throw new Error("staircase-validate: the manifest describes no clips");

  const log = json ? () => {} : (s) => console.log(s);
  const startedAt = Date.now();

  // PRE-LOUDNORM CLIPPING FOR THE REFERENCES (PM ruling RT-81a, option a).
  // Cut each window from its cached source with `validate.mjs`'s own cutSource
  // — the identical ffmpeg invocation the renderer used — and measure the raw
  // waveform. Cached per window: nine cuts, not nine per family.
  const bias = JSON.parse(readFileSync(BIAS_MANIFEST, "utf8"));
  const refClipCache = new Map();
  mkdirSync(TMP, { recursive: true });
  const refClipping = (entry) => {
    const key = `${entry.sourceId}@${entry.startSec}+${entry.clipSec}`;
    if (refClipCache.has(key)) return refClipCache.get(key);
    const src = bias.items.find((i) => i.id === entry.sourceId);
    const cached = src?.source?.cachedFile ? join(CACHE, src.source.cachedFile) : null;
    // A MISSING SOURCE IS NOT A ZERO. Return null and let the grader ERROR —
    // "we could not measure it" must never render as "it measured clean".
    if (!cached || !existsSync(cached)) {
      refClipCache.set(key, null);
      return null;
    }
    const wav = join(TMP, `refclip-${entry.id}.wav`);
    cutSource(cached, entry.startSec, entry.clipSec, wav);
    const v = clippingStats(decodeMono(wav, PRE_NORM_SR)).clippedFraction;
    rmSync(wav, { force: true });
    refClipCache.set(key, v);
    return v;
  };

  log(`Layer A over the staircase pool — ${entries.length} clips · analysis ${SR} Hz`);
  log(
    `  pitch floor ${MIN_MEASURABLE_PITCH_CENTS} cents (MEASURABILITY, not the assessment's fair-trial 10)` +
      ` · timing floor ${MIN_MEASURABLE_DRIFT_MS} ms`,
  );

  const rows = entries.map((e) => gradeStaircaseClip(measureStaircaseClip(e, { refClipping })));

  // ONE TRANSPARENCY ANCHOR PER WINDOW. Not a gate for these families — see
  // measureStaircaseClip — but the manifest has carried an `lsdDb` per clip
  // since the render with no denominator anywhere, and LSD is material-
  // dependent, so the raw dB are not comparable across recordings without it.
  // E4/S4's lossy family needs exactly this figure as its transparency floor.
  const anchors = [];
  if (!noAnchors) {
    const windows = [...new Set(entries.map((e) => `${e.sourceId}@${e.startSec}+${e.clipSec}`))].sort();
    log(`  rendering ${windows.length} transparency anchors (320 kbps round-trip per window)...`);
    for (const w of windows) {
      const [sourceId, rest] = w.split("@");
      const [startSec, clipSec] = rest.split("+").map(Number);
      anchors.push(renderAnchors(sourceId, startSec, clipSec, `sa-${sourceId}-${startSec}`));
    }
  }
  const anchorFor = (r) => anchors.find((a) => a.sourceId === r.sourceId && a.window.startSec === r.startSec);

  if (json) {
    console.log(JSON.stringify({ anchors, rows }, null, 2));
  } else {
    const byWindow = new Map();
    for (const r of rows) {
      const k = `${r.sourceId}@${r.startSec}s`;
      if (!byWindow.has(k)) byWindow.set(k, []);
      byWindow.get(k).push(r);
    }
    const order = (x, y) =>
      x.kind === y.kind
        ? String(x.family).localeCompare(String(y.family)) || (x.level ?? 0) - (y.level ?? 0)
        : x.kind === "reference"
          ? -1
          : 1;
    for (const [w, group] of [...byWindow.entries()].sort()) {
      const a = anchorFor(group[0]);
      console.log(
        `\n  ${w}` +
          (a
            ? `   transparency anchor ${a.transparentLsdDb.toFixed(3)} dB · pipeline noise ${a.pipelineNoiseLsdDb.toFixed(3)} dB`
            : ""),
      );
      console.log("    clip                         kind   magnitude          conf%    clip%   dead-air   quiet%   xanchor  verdict");
      for (const r of group.sort(order)) {
        const gate = r.family ? STAIRCASE_MAGNITUDE_GATES[r.family] : null;
        const mag = gate && r.measuredValue !== undefined ? `${r.measuredValue} ${gate.unit}` : "-";
        const ratio = a && r.lsdDb != null ? (r.lsdDb / a.transparentLsdDb).toFixed(1) + "x" : "-";
        console.log(
          `    ${r.id.padEnd(28)} ${(r.kind === "reference" ? "ref" : "deg").padEnd(6)}` +
            `${mag.padStart(10)}   ${(r.confidentFraction != null ? (r.confidentFraction * 100).toFixed(0) + "%" : "-").padStart(6)}` +
            `${(r.preNormClippedFraction != null ? (r.preNormClippedFraction * 100).toFixed(4) : "-").padStart(9)}` +
            `${(r.longestSilenceSec.toFixed(2) + "s").padStart(11)}` +
            `${((r.quietFraction * 100).toFixed(1) + "%").padStart(9)}` +
            `${ratio.padStart(9)}   ${r.verdict}` +
            (r.reasons.length ? `  (${r.reasons.join("; ")})` : ""),
        );
      }
    }
  }

  const flagged = rows.filter((r) => r.verdict === "FLAG");
  const errored = rows.filter((r) => r.verdict === "ERROR");

  // Windows this stage disqualifies, for `eligibleWindows` to intersect with
  // the renderer's list. A window is blocked for a family if any clip of that
  // family in it failed; a REFERENCE failure blocks the window for EVERY family
  // ("*"), because the reference is the A side of every trial drawn from it.
  const layerAExcluded = [];
  const bad = [...flagged, ...errored];
  for (const w of [...new Set(bad.map((r) => `${r.sourceId}@${r.startSec}`))].sort()) {
    const [sourceId, startSec] = [w.split("@")[0], Number(w.split("@")[1])];
    const here = bad.filter((r) => r.sourceId === sourceId && r.startSec === startSec);
    for (const family of [...new Set(here.map((r) => (r.kind === "reference" ? "*" : r.family)))]) {
      const members = here.filter((r) => (r.kind === "reference" ? "*" : r.family) === family);
      layerAExcluded.push({
        family,
        sourceId,
        startSec,
        failingClips: members.length,
        reason:
          family === "*"
            ? `the window REFERENCE did not pass Layer A — it is the A side of every trial here: ${members[0].reasons.join("; ")}`
            : members[0].reasons.join("; "),
      });
    }
  }

  manifest.layerA = {
    analysisRateHz: SR,
    measuredAt: new Date().toISOString().slice(0, 10),
    thresholds: {
      MIN_MEASURABLE_PITCH_CENTS,
      MIN_MEASURABLE_DRIFT_MS,
      MIN_CONFIDENT_PITCH_FRACTION,
      MIN_CONFIDENT_BLOCK_FRACTION,
      MAX_CLIPPED_FRACTION,
      MAX_FLAT_TOP_FRACTION,
      MAX_SILENCE_SEC,
      MAX_QUIET_FRACTION,
    },
    anchors,
    excludedWindows: layerAExcluded,
    counts: {
      total: rows.length,
      pass: rows.length - flagged.length - errored.length,
      flag: flagged.length,
      error: errored.length,
    },
    note:
      "FITNESS to put in front of a listener — dead air, near-silence, clipping, and the floor below which the family's " +
      "own ruler cannot say what was rendered. NOT audibility and NOT difficulty (N3). Magnitude is READ from each clip's " +
      "render-time measurement, which is safe because every file was hashed against the manifest first; fitness is measured " +
      "fresh from the shipped file. The pitch floor here is MIN_MEASURABLE_PITCH_CENTS (3), deliberately below the fixed " +
      "assessment's fair-trial MIN_PITCH_CENTS (10): a staircase converging toward a listener's threshold must be allowed " +
      "below it. Reference clipping is measured from the source window (RT-81a); the renderer records it for degraded clips only.",
  };
  const byId = new Map(rows.map((r) => [r.id, r]));
  for (const e of entries) {
    const r = byId.get(e.id);
    if (!r) continue;
    e.layerA = {
      verdict: r.verdict,
      reasons: r.reasons,
      preNormClippedFraction: r.preNormClippedFraction ?? null,
      flatTopFraction: +r.flatTopFraction.toFixed(6),
      longestSilenceSec: +r.longestSilenceSec.toFixed(2),
      quietFraction: +r.quietFraction.toFixed(3),
      ...(r.trajectoryVerified !== undefined ? { trajectoryVerified: r.trajectoryVerified } : {}),
      ...(r.levelErrVerified !== undefined ? { levelErrVerified: r.levelErrVerified } : {}),
      gatedOn: r.gatedOn,
      measuredAt: manifest.layerA.measuredAt,
    };
  }
  writeFileSync(STAIRCASE_MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  rmSync(TMP, { recursive: true, force: true });

  if (!json) {
    console.log(
      `\n  ${rows.length - flagged.length - errored.length}/${rows.length} PASS · ${flagged.length} FLAG · ${errored.length} ERROR` +
        ` · ${((Date.now() - startedAt) / 1000).toFixed(1)}s`,
    );
    console.log(`  manifest updated: src/content/delicacy/staircase.json`);
    console.log(
      `  NOTE  fitness, NOT audibility and NOT difficulty. "xanchor" compares a clip's spectral distance\n` +
        `        against a 320 kbps round-trip of ITS OWN window — measurable and inaudible. It is REPORTED\n` +
        `        and not gated here: rungs.mjs measured the ratio to be a worse cross-material scale than raw dB.`,
    );
  }

  // ONLY *NEW* FAILURES FAIL THE RUN — the same rule PM ruling RT-78a set for
  // `staircase-render`, applied here for the same reason. The 16 timing clips
  // on pb1@120s and pb6@75s are a RECORDED state: the renderer already
  // excluded both windows from the timing pool and the manifest says so. A
  // stage that can never return success stops being read, which is exactly how
  // a real new failure gets missed.
  //
  // Note this is a genuinely independent confirmation rather than an echo:
  // Layer A recomputes the verdict from the stored r and slope per clip and
  // arrives at the same 10 and 6.
  const priorExcluded = new Set(
    (manifest.excludedWindows ?? []).map((e) => `${e.family}/${e.sourceId}@${e.startSec}`),
  );
  const isKnown = (r) => r.family && priorExcluded.has(`${r.family}/${r.sourceId}@${r.startSec}`);
  const newFlags = flagged.filter((r) => !isKnown(r));
  const knownFlags = flagged.filter(isKnown);

  if (knownFlags.length && !json) {
    console.log(
      `  NOTE  ${knownFlags.length} clip(s) FLAG in window(s) the renderer had ALREADY excluded (RT-75a): ` +
        [...new Set(knownFlags.map((r) => `${r.family} ${r.sourceId}@${r.startSec}s`))].join(", ") +
        `\n        Layer A reached that verdict independently, from the stored trajectory figures.`,
    );
  }

  if (errored.length) {
    console.error(
      `staircase-validate: ${errored.length} clip(s) could not be judged — ` +
        errored.slice(0, 6).map((r) => `${r.id} (${r.reasons[0]})`).join("; ") +
        (errored.length > 6 ? `, +${errored.length - 6} more` : ""),
    );
    process.exitCode = 1;
  }
  if (newFlags.length) {
    console.error(
      `staircase-validate: ${newFlags.length} NEWLY failing clip(s) did not pass Layer A — ` +
        newFlags.slice(0, 6).map((r) => `${r.id} (${r.reasons.join("; ")})`).join("; ") +
        (newFlags.length > 6 ? `, +${newFlags.length - 6} more` : ""),
    );
    process.exitCode = 1;
  }
  return { rows, anchors, layerAExcluded, newFlags, knownFlags };
}
