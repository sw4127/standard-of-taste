/**
 * Dense parameter sweep for ONE family from ONE source window (E2/S2).
 *
 *   node scripts/clip-pipeline/index.mjs curve --family lossy-artifact \
 *     [--values 320k,256k,...] [--source pb1] [--start 75] [--len 20] [--json]
 *
 * WHY THIS EXISTS RATHER THAN `ladder`. `ladder` renders exactly the rungs in
 * `LADDER_RUNGS` and answers "does the parameter drive the measure, monotonically"
 * — a yes/no about the ladder we already have. Re-spacing needs the other
 * question: what is the SHAPE of magnitude against parameter, densely enough to
 * choose new rungs from. So this takes an arbitrary value list and renders it.
 *
 * It deliberately does not write `ladder.json` or touch the manifest. It
 * measures and prints. Anything that changes the shipping ladder has to be a
 * deliberate edit to rungs.mjs, not a side effect of running a diagnostic.
 *
 * ONE SOURCE, ONE WINDOW — the same discipline `ladder` documents. Log-spectral
 * distance is material-dependent, so comparing rungs rendered from different
 * recordings is worthless: the shipped pool has lossy rung 4 measuring 25.6 dB
 * on one recording and 15.0 dB on another. Holding the audio fixed is the only
 * way the curve means anything.
 */
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { decodeMono, degradeWavParam, normRender } from "./degrade.mjs";
import {
  clippingStats,
  logSpectralDistance,
  lowpassKneeHz,
  pitchShiftCents,
  temporalDrift,
  DEFAULT_SPECTRAL_OPTS,
} from "./spectral.mjs";
import { LADDER_RUNGS } from "./rungs.mjs";

const require = createRequire(import.meta.url);
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const FFMPEG = process.env.FFMPEG_PATH || require("ffmpeg-static");
const BIAS_MANIFEST = join(ROOT, "src", "content", "bias", "manifest.json");
const CACHE = join(HERE, ".cache");
const TMP = join(CACHE, "curve-tmp");
const SR = DEFAULT_SPECTRAL_OPTS.sampleRate;

const ff = (args) => execFileSync(FFMPEG, ["-v", "error", "-y", ...args]);

/** Dense defaults per family — wider and finer than the shipping ladder. */
const DEFAULT_VALUES = {
  "lossy-artifact": ["320k", "256k", "192k", "160k", "128k", "112k", "96k", "80k", "64k", "56k", "48k", "40k", "32k", "24k"],
  "pitch-drift": [3, 5, 8, 12, 18, 25, 35, 50, 70, 100, 140, 200],
  "timing-smear": [0.002, 0.003, 0.005, 0.0075, 0.01, 0.015, 0.02, 0.03, 0.04, 0.05, 0.07, 0.1],
};

export async function curve(args = []) {
  const json = args.includes("--json");
  const opt = (name, dflt) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? args[i + 1] : dflt;
  };
  const family = opt("family", null);
  if (!family || !LADDER_RUNGS[family]) {
    throw new Error(`curve: --family must be one of ${Object.keys(LADDER_RUNGS).join(", ")}`);
  }
  const sourceId = opt("source", "pb1");
  const startSec = Number(opt("start", "75"));
  const clipSec = Number(opt("len", "20"));
  const seed = Number(opt("seed", "500"));
  const raw = opt("values", null);
  const values = raw
    ? raw.split(",").map((v) => (family === "lossy-artifact" ? v.trim() : Number(v)))
    : DEFAULT_VALUES[family];

  const bias = JSON.parse(readFileSync(BIAS_MANIFEST, "utf8"));
  const src = bias.items.find((i) => i.id === sourceId);
  if (!src?.source?.cachedFile) throw new Error(`curve: source ${sourceId} not downloaded`);
  const cached = join(CACHE, src.source.cachedFile);
  if (!existsSync(cached)) throw new Error(`curve: cached file missing for ${sourceId}`);

  mkdirSync(TMP, { recursive: true });
  const origWav = join(TMP, "orig.wav");
  ff(["-ss", String(startSec), "-t", String(clipSec), "-i", cached, "-vn", "-ac", "2", "-ar", "44100", origWav]);
  normRender(origWav, "ref", TMP);
  const ref = decodeMono(join(TMP, "ref.mp3"), SR);

  // Same transparency anchor validate uses, so ratios are on one scale.
  ff(["-i", origWav, "-codec:a", "libmp3lame", "-b:a", "320k", join(TMP, "t320.mp3")]);
  ff(["-i", join(TMP, "t320.mp3"), join(TMP, "transparent.wav")]);
  normRender(join(TMP, "transparent.wav"), "transparent", TMP);
  const anchorMeasure = logSpectralDistance(ref, decodeMono(join(TMP, "transparent.mp3"), SR));
  const anchorLsd = anchorMeasure.lsdDb;
  const anchorKnee = lowpassKneeHz(anchorMeasure.perBandDb);

  const rows = [];
  for (const param of values) {
    const tag = `${family}-${String(param).replace(/[^\w]/g, "_")}`;
    const degWav = join(TMP, `${tag}.wav`);
    degradeWavParam(family, param, seed, origWav, degWav, clipSec);
    const cut = join(TMP, `${tag}-cut.wav`);
    ff(["-i", degWav, "-t", String(clipSec), cut]);
    const preClip = clippingStats(decodeMono(cut, SR)).clippedFraction;
    normRender(cut, tag, TMP);
    const deg = decodeMono(join(TMP, `${tag}.mp3`), SR);

    const lsd = logSpectralDistance(ref, deg);
    // Full-band LSD is the number under suspicion, so the diagnostic measures
    // the SAME distance with the codec's own brickwall excluded. If the curve
    // is well-behaved below the knee and explodes only above it, the explosion
    // is the measure's scale rather than the manipulation's size.
    const lsdBelow10k = logSpectralDistance(ref, deg, { fMax: 10000 }).lsdDb;
    const knee = lowpassKneeHz(lsd.perBandDb);
    const pitch = family === "pitch-drift" ? pitchShiftCents(ref, deg) : null;
    const drift = family === "timing-smear" ? temporalDrift(ref, deg) : null;

    rows.push({
      param,
      lsdDb: +lsd.lsdDb.toFixed(3),
      anchorRatio: +(lsd.lsdDb / anchorLsd).toFixed(2),
      lsdBelow10kDb: +lsdBelow10k.toFixed(3),
      ratioBelow10k: +(lsdBelow10k / anchorLsd).toFixed(2),
      kneeHz: knee == null ? null : Math.round(knee),
      peakBand: lsd.perBandDb.indexOf(Math.max(...lsd.perBandDb)),
      perBandDb: lsd.perBandDb.map((x) => +x.toFixed(2)),
      pitchP95Cents: pitch ? +pitch.p95AbsCents.toFixed(2) : null,
      driftIqrMs: drift ? drift.lagIqrMs : null,
      driftConfidentFraction: drift ? +drift.confidentFraction.toFixed(2) : null,
      preNormClippedFraction: +preClip.toFixed(6),
    });
  }

  rmSync(TMP, { recursive: true, force: true });

  if (json) {
    console.log(JSON.stringify({ family, sourceId, startSec, clipSec, seed, anchorLsd, anchorKnee, rows }, null, 2));
    return;
  }

  console.log(`Parameter curve — ${family} · source ${sourceId} @${startSec}s, ${clipSec}s, seed ${seed}`);
  console.log(
    `  transparency anchor for this window: ${anchorLsd.toFixed(3)} dB` +
      (anchorKnee == null ? " · no lowpass knee (as expected at 320k)" : ` · knee ${Math.round(anchorKnee)} Hz`),
  );
  const shipping = new Set(LADDER_RUNGS[family].values.map(String));
  console.log("  param      LSD dB  ×anchor   <10kHz  ×anch     knee Hz   step×   shipping");
  let prev = null;
  for (const r of rows) {
    const step = prev == null ? null : r.lsdDb / prev;
    prev = r.lsdDb;
    console.log(
      `  ${String(r.param).padEnd(9)}${r.lsdDb.toFixed(2).padStart(7)}  ${r.anchorRatio.toFixed(1).padStart(7)}  ` +
        `${r.lsdBelow10kDb.toFixed(2).padStart(7)}  ${r.ratioBelow10k.toFixed(1).padStart(5)}  ` +
        `${(r.kneeHz == null ? "—" : String(r.kneeHz)).padStart(10)}  ` +
        `${(step == null ? "—" : step.toFixed(2) + "x").padStart(6)}   ${shipping.has(String(r.param)) ? "SHIPS" : ""}`,
    );
  }
  console.log(
    `\n  NOTE  MAGNITUDES, not audibility (N3). "step×" is each row's full-band LSD over the\n` +
      `        previous row's — an evenly-spaced ladder wants that roughly constant.`,
  );
}
