/**
 * Manipulation-strength ladder (artifact pivot §1: "a manipulation-strength
 * ladder so each degradation type ships at 3–4 calibrated intensities";
 * PM ruling RT-18a — ladder only, pool expansion deferred).
 *
 *   node scripts/clip-pipeline/index.mjs ladder [--source pb1] [--start 75] [--len 20] [--seed 500]
 *
 * WHAT THIS ESTABLISHES: that turning a family's parameter up produces a
 * measurably bigger manipulation, monotonically, across four rungs. Without
 * that, "magnitude 3" is a label somebody typed, and the difficulty ladder the
 * instrument rests on is decoration.
 *
 * ONE SOURCE, ONE WINDOW, deliberately. The S5b run compared rungs across six
 * different recordings and the comparison was worthless: log-spectral distance
 * depends on the material, so d3 (magnitude 2, one recording) out-measured d6
 * (magnitude 3, another). Holding the audio fixed is the only way a rung-to-rung
 * comparison means anything.
 *
 * RUNG VALUES extend the existing set DOWNWARD — each family's three shipped
 * values become rungs 2–4 and a gentler rung 1 is added below them. Two reasons:
 * the shipped renders keep their meaning (renumbering would have made d1's
 * recorded "magnitude 1" refer to a different parameter), and the subtle end is
 * where a difficulty ladder needs resolution, since the acceptance band wants
 * items people sometimes get WRONG.
 *
 * HONESTY (N3): a rung's measured magnitude is not its difficulty. This shows
 * the parameter drives the measurement monotonically; which rung lands in the
 * 0.55–0.85 difficulty band is a Layer B question and needs responses.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { decodeMono, degradeWavParam, normRender } from "./degrade.mjs";
import { clippingStats, logSpectralDistance, temporalDrift, DEFAULT_SPECTRAL_OPTS } from "./spectral.mjs";
import { TEMPORAL_FAMILIES } from "./validate.mjs";
// The rung table lives in rungs.mjs — one source of truth (RT-52a).
import { LADDER_RUNGS } from "./rungs.mjs";

const require = createRequire(import.meta.url);
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const FFMPEG = process.env.FFMPEG_PATH || require("ffmpeg-static");
const BIAS_MANIFEST = join(ROOT, "src", "content", "bias", "manifest.json");
const REPORT = join(ROOT, "src", "content", "delicacy", "ladder.json");
const CACHE = join(HERE, ".cache");
const TMP = join(CACHE, "ladder-tmp");
const SR = DEFAULT_SPECTRAL_OPTS.sampleRate;

const ff = (args) => execFileSync(FFMPEG, ["-v", "error", "-y", ...args]);


export async function ladder(args) {
  const opt = (name, dflt) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? args[i + 1] : dflt;
  };
  const sourceId = opt("source", "pb1");
  const startSec = Number(opt("start", "75"));
  const clipSec = Number(opt("len", "20"));
  const seed = Number(opt("seed", "500"));

  const bias = JSON.parse(readFileSync(BIAS_MANIFEST, "utf8"));
  const src = bias.items.find((i) => i.id === sourceId);
  if (!src?.source?.cachedFile) throw new Error(`ladder: source ${sourceId} not downloaded`);

  mkdirSync(TMP, { recursive: true });
  const origWav = join(TMP, "orig.wav");
  ff(["-ss", String(startSec), "-t", String(clipSec), "-i", join(CACHE, src.source.cachedFile), "-vn", "-ac", "2", "-ar", "44100", origWav]);
  normRender(origWav, "ref", TMP);
  const ref = decodeMono(join(TMP, "ref.mp3"), SR);

  // The transparency anchor for THIS window — the same denominator validate
  // uses, so ladder ratios and pool ratios are on one scale.
  ff(["-i", origWav, "-codec:a", "libmp3lame", "-b:a", "320k", join(TMP, "t320.mp3")]);
  ff(["-i", join(TMP, "t320.mp3"), join(TMP, "transparent.wav")]);
  normRender(join(TMP, "transparent.wav"), "transparent", TMP);
  const anchorLsd = logSpectralDistance(ref, decodeMono(join(TMP, "transparent.mp3"), SR)).lsdDb;

  console.log(`Strength ladder — source ${sourceId} @${startSec}s, ${clipSec}s, seed ${seed}`);
  console.log(`  transparency anchor for this window: ${anchorLsd.toFixed(3)} dB`);

  const families = {};
  let failures = 0;

  for (const [family, spec] of Object.entries(LADDER_RUNGS)) {
    const temporal = TEMPORAL_FAMILIES.has(family);
    const rungs = [];

    for (let i = 0; i < spec.values.length; i++) {
      const param = spec.values[i];
      const tag = `${family}-r${i + 1}`;
      const degWav = join(TMP, `${tag}.wav`);
      const params = degradeWavParam(family, param, seed, origWav, degWav, clipSec);
      const cut = join(TMP, `${tag}-cut.wav`);
      ff(["-i", degWav, "-t", String(clipSec), cut]);

      // Clipping is checked pre-normalisation, where it is still visible
      // (RT-17a): loudnorm plus mp3 erases it from the shipped file.
      const preClip = clippingStats(decodeMono(cut, SR)).clippedFraction;

      normRender(cut, tag, TMP);
      const deg = decodeMono(join(TMP, `${tag}.mp3`), SR);
      const lsd = logSpectralDistance(ref, deg);
      const drift = temporalDrift(ref, deg);

      rungs.push({
        rung: i + 1,
        param,
        params,
        lsdDb: +lsd.lsdDb.toFixed(3),
        anchorRatio: +(lsd.lsdDb / anchorLsd).toFixed(2),
        driftIqrMs: drift.lagIqrMs,
        driftRangeMs: drift.lagRangeMs,
        driftConfidentFraction: +drift.confidentFraction.toFixed(2),
        peakBand: lsd.perBandDb.indexOf(Math.max(...lsd.perBandDb)),
        preNormClippedFraction: +preClip.toFixed(6),
      });
    }

    // BOTH measures are evaluated for every family, and both are reported —
    // including when the primary one fails. Reporting only whichever happened
    // to come out monotone would be choosing the answer after seeing the data.
    const monoOf = (key) => {
      const series = rungs.map((r) => r[key]);
      return { key, series, monotone: series.every((v, i) => i === 0 || v > series[i - 1]) };
    };
    const spectral = monoOf("lsdDb");
    const driftRange = monoOf("driftRangeMs");
    const driftIqr = monoOf("driftIqrMs");
    // PRIMARY TEMPORAL STATISTIC = IQR. I have now changed this twice and owe
    // the reasoning: I started on IQR, moved to peak-to-peak range on the
    // a-priori argument that a mean-corrected segment-wise warp is a random
    // walk whose natural magnitude is its excursion, and have moved back.
    // The deciding evidence is measured, not fitted: even with the improved
    // tracker, confident blocks fall to 71% at the top rung, and the blocks
    // that fail to align are disproportionately the EXTREME ones. Under that
    // selection, a maximum-based statistic is biased downward while a
    // quantile-based one is not. Both are computed and printed regardless, so
    // the disagreement between them stays visible rather than being resolved
    // silently in favour of whichever looks better.
    const drift = driftIqr;
    const primary = temporal ? drift : spectral;

    console.log(`
  ${family} — ${spec.unit}`);
    console.log("    rung  param     LSD dB  ×anchor  driftIQR  driftRange  conf%  peak band");
    for (const r of rungs) {
      console.log(
        `    ${String(r.rung).padEnd(6)}${String(r.param).padEnd(10)}${r.lsdDb.toFixed(2).padStart(6)}  ` +
          `${r.anchorRatio.toFixed(1).padStart(7)}  ${(r.driftIqrMs + " ms").padStart(8)}  ` +
          `${(r.driftRangeMs + " ms").padStart(10)}  ${(r.driftConfidentFraction * 100).toFixed(0).padStart(4)}%  ` +
          `${String(r.peakBand).padStart(9)}`,
      );
    }
    console.log(`    spectral (LSD dB):     ${spectral.monotone ? "MONOTONE" : "not monotone"} — ${spectral.series.join(" → ")}`);
    console.log(`    temporal (drift IQR):   ${driftIqr.monotone ? "MONOTONE" : "not monotone"} — ${driftIqr.series.join(" → ")} ms`);
    console.log(`    temporal (drift range): ${driftRange.monotone ? "MONOTONE" : "not monotone"} — ${driftRange.series.join(" → ")} ms  [max-statistic, biased by the confidence gate]`);

    // The ladder's claim is "the parameter drives a measurable magnitude,
    // monotonically". It is satisfied if EITHER measure holds, provided the
    // failure of the other is stated — which it is, above and in the report.
    const verified = primary.monotone || spectral.monotone;
    if (!verified) failures++;

    const conf = rungs.map((r) => r.driftConfidentFraction);
    const saturating = temporal && conf[conf.length - 1] < 0.7;
    if (saturating) {
      console.log(
        `    NOTE  the temporal tracker SATURATES on this family: confident blocks fall
` +
          `          ${conf.map((c) => (c * 100).toFixed(0) + "%").join(" → ")} across the rungs. Beyond roughly 0.03 deviation
` +
          `          the blocks with the largest excursions are precisely the ones that stop
` +
          `          aligning, so measured drift UNDER-reports the warp. The ladder is verified
` +
          `          here by LSD (within this fixed source); ms-of-warp is not trustworthy at
` +
          `          the top rungs until the tracker handles them.`,
      );
    }

    families[family] = {
      unit: spec.unit,
      primaryMeasure: primary.key,
      monotoneSpectral: spectral.monotone,
      monotoneTemporalIqr: driftIqr.monotone,
      monotoneTemporalRange: driftRange.monotone,
      verified,
      temporalTrackerSaturates: saturating,
      rungs,
    };
  }

  // ACCUMULATE across sources (PM ruling RT-30b/c, 2026-08-08). One source
  // gives a point estimate, and the planner's screen was wrong by up to 318%
  // using one. LSD depends on the material, so a family-rung's magnitude is a
  // RANGE, and the screen must plan against the conservative end of it rather
  // than against a number that happened to come from pb1.
  const runKey = `${sourceId}@${startSec}`;
  const prior = existsSync(REPORT) ? JSON.parse(readFileSync(REPORT, "utf8")) : { runs: {} };
  const runs = { ...(prior.runs ?? {}), [runKey]: { source: { id: sourceId, startSec, clipSec, seed }, transparentAnchorLsdDb: +anchorLsd.toFixed(3), families } };

  // Per family-rung: the min/max/mean LSD observed across every run so far.
  const magnitudeRange = {};
  for (const run of Object.values(runs)) {
    for (const [family, spec] of Object.entries(run.families)) {
      for (const r of spec.rungs) {
        const k = `${family}/${r.rung}`;
        (magnitudeRange[k] ??= { lsdDb: [] }).lsdDb.push(r.lsdDb);
      }
    }
  }
  for (const [k, v] of Object.entries(magnitudeRange)) {
    magnitudeRange[k] = {
      nSources: v.lsdDb.length,
      minLsdDb: +Math.min(...v.lsdDb).toFixed(3),
      maxLsdDb: +Math.max(...v.lsdDb).toFixed(3),
      meanLsdDb: +(v.lsdDb.reduce((a, b) => a + b, 0) / v.lsdDb.length).toFixed(3),
    };
  }

  const report = {
    measuredAt: new Date().toISOString().slice(0, 10),
    analysisRateHz: SR,
    note:
      "Four calibrated rungs per family, each run on ONE source window so rung-to-rung comparison is not confounded by material. " +
      "Runs ACCUMULATE across sources: magnitudeRange gives the min/max/mean LSD per family-rung, and the planner's screen uses the MIN " +
      "because a point estimate from a single source was wrong by up to 318%. A rung's measured magnitude is NOT its difficulty — " +
      "which rung falls in the acceptance band is a Layer B question requiring real responses.",
    magnitudeRange,
    runs,
  };
  writeFileSync(REPORT, JSON.stringify(report, null, 2) + "\n");
  rmSync(TMP, { recursive: true, force: true });

  console.log(`\n  report: src/content/delicacy/ladder.json`);
  if (failures > 0) {
    console.error(`ladder: ${failures} family/families show NO monotone measure — the parameter does not drive anything measurable`);
    process.exitCode = 1;
  }
}
