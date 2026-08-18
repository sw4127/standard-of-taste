/**
 * IS THE TIMING RENDER FAITHFUL, OR IS THE RULER WRONG? (E4/S3/S3, PM ruling
 * RT-74a, 2026-08-18)
 *
 *   node scripts/clip-pipeline/index.mjs timing-fidelity [--sources pb1,pb6] [--json]
 *
 * THE QUESTION THIS SETTLES. `timingDeviations` guarantees the modelled drift
 * trajectory EXACTLY: it rescales a seeded walk so the trajectory's IQR equals
 * the requested milliseconds, and it computes that from (seed, param, clipSec)
 * alone — it never looks at the audio. `temporalDrift` then measures the
 * rendered clip and disagrees, by a factor that depends on the RECORDING:
 * 0.87x on pb6@30, up to 1.37x on pb1@75, non-monotone in the parameter.
 *
 * One of the two is wrong, and the answer decides what a clip gets LABELLED
 * with — which is the number the product prints as a listener's threshold
 * (D4 amendment, N3). Calibration was built for the case where the render is
 * at fault; it is off pending this.
 *
 * TWO TESTS, and the first is the decisive one because NO ESTIMATOR IS INVOLVED.
 *
 *   1. STRETCH FIDELITY. Push a real window through `rubberband=tempo=T` at
 *      known factors and ffprobe the output duration. Expected is input/T. This
 *      is a stopwatch, not a correlator: if durations come out exact, then the
 *      per-segment stretches the model prescribes are the stretches the audio
 *      receives, the drift trajectory IS the model, and every material-dependent
 *      deviation belongs to the measurement. Run on more than one recording,
 *      because the claim under test is specifically about material dependence.
 *
 *   2. TRAJECTORY SHAPE. On the real rendered clips, compare `temporalDrift`'s
 *      per-block lag series against the trajectory the recorded segment
 *      deviations predict. Correlation says whether the correlator is tracking
 *      the right wander at all; the regression slope says whether it is
 *      tracking it at the right size. Corroborating rather than decisive — a
 *      slope away from 1 is consistent with either explanation on its own, and
 *      only means something once test 1 has fixed the render's status.
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { decodeMono, predictedTrajectoryMs } from "./degrade.mjs";
import { TRAJECTORY_OPTS, blockCentreSec, fitLine, temporalDrift, DEFAULT_SPECTRAL_OPTS } from "./spectral.mjs";
import { STAIRCASE_MANIFEST, STAIRCASE_OUT } from "./staircaserender.mjs";

const require = createRequire(import.meta.url);
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const FFMPEG = process.env.FFMPEG_PATH || require("ffmpeg-static");
const FFPROBE = process.env.FFPROBE_PATH || require("@ffprobe-installer/ffprobe").path;
const BIAS_MANIFEST = join(ROOT, "src", "content", "bias", "manifest.json");
const CACHE = join(HERE, ".cache");
const TMP = join(CACHE, "fidelity-tmp");
const SR = DEFAULT_SPECTRAL_OPTS.sampleRate;

const ff = (args) => execFileSync(FFMPEG, ["-v", "error", "-y", ...args]);
const probeDuration = (f) =>
  Number(execFileSync(FFPROBE, ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim());

/**
 * How far a realized stretch may sit from the requested one, in percent.
 *
 * This is a DURATION measured by ffprobe against arithmetic — there is no
 * estimator in the path and no material dependence available to it, so the
 * tolerance is about encoder frame quantisation, not about hearing. An mp3
 * frame at 44.1 kHz is 1152 samples ~ 26 ms; over a 20 s clip that is 0.13%.
 * 1% leaves nearly an order of magnitude of headroom and would still catch a
 * stretch that is wrong by anything the drift measurement could notice.
 */
export const MAX_STRETCH_ERR_PCT = 1;

/** Tempo factors to probe. Spans the range the staircase's segments actually
 *  use: the ladder's worst per-segment deviation across all nine windows is
 *  10.9%, so 0.85-1.18 covers it with margin on both sides. */
export const STRETCH_FACTORS = [0.85, 0.9, 0.95, 1.0, 1.05, 1.1, 1.18];

/**
 * TEST 1 — does rubberband realise the stretch it is asked for?
 *
 * Deliberately measured on the ENCODED output, the same path a clip travels,
 * rather than on the filter graph in isolation: what matters is the duration of
 * the file a listener receives.
 */
export function stretchFidelity(origWav, factors = STRETCH_FACTORS) {
  const inSec = probeDuration(origWav);
  return factors.map((tempo) => {
    const out = join(TMP, `stretch-${String(tempo).replace(".", "_")}.wav`);
    ff(["-i", origWav, "-filter:a", `rubberband=tempo=${tempo.toFixed(6)}`, out]);
    const actual = probeDuration(out);
    const expected = inSec / tempo;
    rmSync(out, { force: true });
    return { tempo, expectedSec: +expected.toFixed(4), actualSec: +actual.toFixed(4), errPct: +(((actual - expected) / expected) * 100).toFixed(3) };
  });
}

/** TEST 2 — does the measured lag series follow the predicted trajectory? */
export function trajectoryAgreement(clip) {
  const refFile = join(STAIRCASE_OUT, `st-${clip.refId}.mp3`);
  const degFile = join(STAIRCASE_OUT, clip.file);
  if (!existsSync(refFile) || !existsSync(degFile)) return null;

  const d = temporalDrift(decodeMono(refFile, SR), decodeMono(degFile, SR), TRAJECTORY_OPTS);
  const times = d.lagsMs.map((_, b) => blockCentreSec(b));
  const predicted = predictedTrajectoryMs(clip.params.segmentDevPct, clip.clipSec, times);

  // Confident blocks only — the same population the reported IQR is built from.
  const keep = d.lagsMs.map((l, i) => ({ l, p: predicted[i], ok: d.scores[i] >= 0.9 })).filter((r) => r.ok);
  const fit = fitLine(keep.map((r) => r.p), keep.map((r) => r.l));
  return { ...fit, confidentFraction: d.confidentFraction, measuredIqrMs: d.lagIqrMs, level: clip.level };
}

export async function timingFidelity(args = []) {
  const json = args.includes("--json");
  const opt = (name, dflt) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? args[i + 1] : dflt;
  };
  const sources = opt("sources", "pb1,pb6").split(",").map((s) => s.trim());
  const startSec = Number(opt("start", "75"));
  const clipSec = Number(opt("len", "20"));

  mkdirSync(TMP, { recursive: true });
  const bias = JSON.parse(readFileSync(BIAS_MANIFEST, "utf8"));

  const stretch = [];
  for (const sourceId of sources) {
    const item = bias.items.find((i) => i.id === sourceId);
    if (!item?.source?.cachedFile) throw new Error(`timing-fidelity: ${sourceId} not downloaded`);
    // pb8 has no 75 s window under RT-70a's plan; probe whatever fits.
    const cached = join(CACHE, item.source.cachedFile);
    const start = Math.min(startSec, Math.max(0, probeDuration(cached) - clipSec - 1));
    const origWav = join(TMP, `${sourceId}-orig.wav`);
    ff(["-ss", String(start), "-t", String(clipSec), "-i", cached, "-vn", "-ac", "2", "-ar", "44100", origWav]);
    stretch.push({ sourceId, startSec: start, rows: stretchFidelity(origWav) });
    rmSync(origWav, { force: true });
  }

  const worstStretch = Math.max(...stretch.flatMap((s) => s.rows.map((r) => Math.abs(r.errPct))));

  // Test 2 over every timing clip already rendered.
  const manifest = existsSync(STAIRCASE_MANIFEST) ? JSON.parse(readFileSync(STAIRCASE_MANIFEST, "utf8")) : { clips: [] };
  const timing = (manifest.clips ?? []).filter((c) => c.family === "timing-smear" && c.params?.segmentDevPct);
  const byWindow = new Map();
  for (const c of timing) {
    const key = `${c.sourceId}@${c.startSec}s`;
    const a = trajectoryAgreement(c);
    if (!a) continue;
    if (!byWindow.has(key)) byWindow.set(key, []);
    byWindow.get(key).push(a);
  }

  if (json) {
    console.log(JSON.stringify({ stretch, worstStretch, trajectories: Object.fromEntries(byWindow) }, null, 2));
  } else {
    console.log(`Timing render fidelity — is the render faithful, or is the ruler wrong? (RT-74a)\n`);
    console.log(`TEST 1 — rubberband stretch fidelity. ffprobe duration vs arithmetic. No estimator.`);
    for (const s of stretch) {
      console.log(`\n  ${s.sourceId}@${s.startSec}s`);
      console.log(`    tempo   expected s   actual s      err%`);
      for (const r of s.rows) {
        console.log(
          `    ${r.tempo.toFixed(2).padStart(5)}${r.expectedSec.toFixed(4).padStart(13)}${r.actualSec.toFixed(4).padStart(11)}` +
            `${(r.errPct >= 0 ? "+" : "") + r.errPct.toFixed(3)}%`.padStart(11),
        );
      }
    }
    console.log(
      `\n  worst |err| across ${stretch.length} recordings: ${worstStretch.toFixed(3)}% ` +
        `(tolerance ${MAX_STRETCH_ERR_PCT}%) — ${worstStretch <= MAX_STRETCH_ERR_PCT ? "RENDER IS FAITHFUL" : "RENDER IS NOT FAITHFUL"}`,
    );

    console.log(`\n\nTEST 2 — does the measured lag series follow the predicted trajectory?`);
    console.log(`  r = shape agreement · slope = size agreement (1.00 would mean the ruler is unbiased)\n`);
    console.log(`  window        levels   mean r   min r   mean slope   slope range`);
    for (const [key, rows] of byWindow) {
      const rs = rows.map((r) => r.r).filter(Number.isFinite);
      const sl = rows.map((r) => r.slope).filter(Number.isFinite);
      const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
      console.log(
        `  ${key.padEnd(14)}${String(rows.length).padStart(6)}${mean(rs).toFixed(3).padStart(9)}` +
          `${Math.min(...rs).toFixed(3).padStart(8)}${mean(sl).toFixed(3).padStart(13)}   ` +
          `${Math.min(...sl).toFixed(2)}-${Math.max(...sl).toFixed(2)}`,
      );
    }
    console.log(
      `\n  READ THIS WITH TEST 1, not alone. A slope away from 1.00 is consistent with an unfaithful\n` +
        `  render OR a biased ruler; test 1 is what separates them, because it has no estimator in it.`,
    );
  }

  rmSync(TMP, { recursive: true, force: true });
  if (worstStretch > MAX_STRETCH_ERR_PCT) process.exitCode = 1;
  return { stretch, worstStretch, byWindow };
}
