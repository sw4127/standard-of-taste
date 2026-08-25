/**
 * LAYER A FOR THE PRESTIGE POOL — is this clip fit to put in front of a
 * listener? (E7/S4)
 *
 * The delicacy pool has had this since the artifact pivot (`validate`,
 * `staircase-validate`). The bias pool never did: its clips were gated by a
 * human listening to them, and when that gate was retired nothing replaced it.
 * Eleven clips have been shipping on a July ear-pass and a status code.
 *
 * DISTINCT FROM THE DELICACY VALIDATORS, which ask whether a clip IS the
 * magnitude it claims. A bias clip claims no magnitude — nothing is done to it.
 * This asks the only remaining question: is it audible, intact, the right
 * length, at the pool's loudness, and free of someone talking over it.
 *
 * EVERY GATE IS EITHER A MEASURED CONSTANT FROM `validate.mjs` OR CALIBRATED IN
 * `speech.test.ts`. Nothing here is a number somebody liked the look of.
 */

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { clippingStats, quietFraction, longestSilenceSec } from "./spectral.mjs";
import { MAX_CLIPPED_FRACTION, MAX_FLAT_TOP_FRACTION, MAX_QUIET_FRACTION, MAX_SILENCE_SEC } from "./validate.mjs";
import { speechRisk, SPEECH_RISK_GATE, windowStartVerdict } from "./speech.mjs";

const require = createRequire(import.meta.url);
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const MANIFEST = join(ROOT, "src", "content", "bias", "manifest.json");
const AUDIO = join(ROOT, "public", "audio", "bias");
const FFMPEG = process.env.FFMPEG_PATH || require("ffmpeg-static");
const FFPROBE = process.env.FFPROBE_PATH || require("@ffprobe-installer/ffprobe").path;
const SR = 22050;

/** Clip length, in seconds, and how far a render may miss it. */
export const TARGET_SEC = 20;
export const DURATION_TOLERANCE_SEC = 0.5;

/**
 * Loudness. The pipeline renders two-pass to -16 LUFS; the tolerance is what
 * that pass actually achieves, not an aspiration. A clip outside it is louder
 * or quieter than its neighbours, and in a test where people rate one clip
 * against another, LOUDER READS AS BETTER — a loudness outlier is a confound
 * wearing the costume of a preference.
 */
export const TARGET_LUFS = -16;
export const LUFS_TOLERANCE = 1;
export const MAX_TRUE_PEAK_DB = -1;

function decode(file) {
  const out = spawnSync(FFMPEG, ["-i", file, "-ac", "1", "-ar", String(SR), "-f", "s16le", "-v", "error", "pipe:1"], {
    maxBuffer: 1 << 30,
  });
  if (out.status !== 0) throw new Error(`decode failed: ${file}`);
  const raw = out.stdout;
  const n = Math.floor(raw.length / 2);
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) s[i] = raw.readInt16LE(i * 2) / 32768;
  return s;
}

/** Integrated loudness, true peak and range of a finished file. */
function loudness(file) {
  const r = spawnSync(
    FFMPEG,
    ["-i", file, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
    { encoding: "utf8" },
  );
  // Last brace pair, verified to carry input_i — see renderOne's note about
  // pb14's ID3 tags containing a literal "{".
  const s = r.stderr || "";
  const open = s.lastIndexOf("{");
  const close = s.lastIndexOf("}");
  let mm = null;
  if (open >= 0 && close > open) {
    try {
      mm = JSON.parse(s.slice(open, close + 1));
    } catch {
      mm = null;
    }
  }
  if (!mm || mm.input_i === undefined) return null;
  return { lufs: Number(mm.input_i), truePeakDb: Number(mm.input_tp), lra: Number(mm.input_lra) };
}

/**
 * `fileOverride` exists so the "can this gate still fail?" tests can push
 * synthetic audio through THIS function rather than a reimplementation of it.
 * A guard proven against a second copy of its own logic proves nothing.
 *
 * @param {{ id: string, source?: { downloadUrl?: string }, window?: { approved?: { startSec: number } | null } }} item
 * @param {string | null} [fileOverride] measure this path instead of the id's
 */
export function measureBiasClip(item, fileOverride = null) {
  const file = fileOverride || join(AUDIO, `${item.id}.mp3`);
  if (!existsSync(file)) return { id: item.id, fileMissing: true };
  const samples = decode(file);
  const durationSec = Number(
    execFileSync(FFPROBE, ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString().trim(),
  );
  const clip = clippingStats(samples);
  const loud = loudness(file);
  const startSec = item.window && item.window.approved ? item.window.approved.startSec : null;
  return {
    id: item.id,
    fileMissing: false,
    durationSec,
    lufs: loud ? loud.lufs : null,
    truePeakDb: loud ? loud.truePeakDb : null,
    lra: loud ? loud.lra : null,
    clippedFraction: clip.clippedFraction,
    flatTopFraction: clip.flatTopFraction,
    quietFraction: quietFraction(samples, SR),
    longestSilenceSec: longestSilenceSec(samples, SR),
    speechRisk: speechRisk(samples, SR),
    startSec,
    windowStart: startSec === null ? null : windowStartVerdict(item.source.downloadUrl, startSec),
  };
}

export function gradeBiasClip(m) {
  if (m.fileMissing) return { ...m, verdict: "ERROR", reasons: ["audio missing from public/audio/bias"] };
  const reasons = [];
  const need = (value, label) => {
    if (value === null || value === undefined) {
      reasons.push(`${label} was never measured — absent is not a pass`);
      return false;
    }
    return true;
  };

  if (need(m.durationSec, "duration") && Math.abs(m.durationSec - TARGET_SEC) > DURATION_TOLERANCE_SEC) {
    reasons.push(`duration ${m.durationSec.toFixed(2)}s is not ${TARGET_SEC}s +/- ${DURATION_TOLERANCE_SEC}`);
  }
  if (need(m.lufs, "loudness") && Math.abs(m.lufs - TARGET_LUFS) > LUFS_TOLERANCE) {
    reasons.push(`${m.lufs.toFixed(2)} LUFS is outside ${TARGET_LUFS} +/- ${LUFS_TOLERANCE} — louder reads as better`);
  }
  if (need(m.truePeakDb, "true peak") && m.truePeakDb > MAX_TRUE_PEAK_DB) {
    reasons.push(`true peak ${m.truePeakDb.toFixed(2)} dBTP exceeds ${MAX_TRUE_PEAK_DB}`);
  }
  if (need(m.clippedFraction, "clipping") && m.clippedFraction > MAX_CLIPPED_FRACTION) {
    reasons.push(`clipped fraction ${m.clippedFraction.toExponential(2)} exceeds ${MAX_CLIPPED_FRACTION}`);
  }
  if (need(m.flatTopFraction, "flat tops") && m.flatTopFraction > MAX_FLAT_TOP_FRACTION) {
    reasons.push(`flat-top fraction ${m.flatTopFraction.toExponential(2)} exceeds ${MAX_FLAT_TOP_FRACTION}`);
  }
  if (need(m.quietFraction, "quiet fraction") && m.quietFraction > MAX_QUIET_FRACTION) {
    reasons.push(`${(m.quietFraction * 100).toFixed(0)}% of the clip is near-silent (max ${MAX_QUIET_FRACTION * 100}%)`);
  }
  if (need(m.longestSilenceSec, "dead air") && m.longestSilenceSec > MAX_SILENCE_SEC) {
    reasons.push(`${m.longestSilenceSec.toFixed(2)}s of dead air (max ${MAX_SILENCE_SEC}s)`);
  }
  if (need(m.speechRisk, "speech risk") && m.speechRisk > SPEECH_RISK_GATE) {
    reasons.push(`speechRisk ${m.speechRisk.toFixed(3)} exceeds ${SPEECH_RISK_GATE} — this may be someone talking`);
  }
  if (m.windowStart && m.windowStart.gated && !m.windowStart.pass) {
    reasons.push(m.windowStart.reason);
  }
  return { ...m, verdict: reasons.length === 0 ? "PASS" : "FLAG", reasons };
}

export function biasValidate(args = []) {
  const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
  const onlyIdx = args.indexOf("--only");
  const only = onlyIdx >= 0 ? new Set(args[onlyIdx + 1].split(",")) : null;
  const rows = manifest.items
    .filter((i) => (only ? only.has(i.id) : true))
    .filter((i) => existsSync(join(AUDIO, `${i.id}.mp3`)))
    .map((i) => gradeBiasClip(measureBiasClip(i)));

  if (args.includes("--json-silent")) return rows;
  if (args.includes("--json")) {
    console.log(JSON.stringify(rows, null, 2));
    return rows;
  }
  const h = ["id", "sec", "LUFS", "dBTP", "LRA", "clip%", "quiet%", "dead", "speech", "start", "verdict"];
  const w = [6, 6, 7, 7, 6, 8, 7, 6, 7, 8, 8];
  console.log(h.map((s, i) => s.padStart(w[i])).join(""));
  for (const r of rows) {
    console.log(
      [
        r.id,
        r.durationSec.toFixed(2),
        r.lufs.toFixed(2),
        r.truePeakDb.toFixed(2),
        r.lra.toFixed(1),
        (r.clippedFraction * 100).toFixed(3),
        (r.quietFraction * 100).toFixed(1),
        r.longestSilenceSec.toFixed(2),
        r.speechRisk.toFixed(3),
        r.startSec === null ? "-" : String(r.startSec),
        r.verdict,
      ].map((s, i) => String(s).padStart(w[i])).join(""),
    );
    for (const why of r.reasons) console.log(`        ^ ${why}`);
  }
  const flagged = rows.filter((r) => r.verdict !== "PASS");
  console.log(`\n${rows.length} clips measured, ${flagged.length} flagged.`);
  return rows;
}
