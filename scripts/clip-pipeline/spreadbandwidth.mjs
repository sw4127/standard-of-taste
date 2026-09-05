/**
 * WHERE EACH CLIP'S SPECTRUM ENDS, AND WHETHER AN ENCODER ENDED IT (E17/S2).
 *
 *   node scripts/clip-pipeline/index.mjs spread-bandwidth [--json]
 *
 * WHY THIS EXISTS. Four of this pool's six sources were already lossy when
 * fetched (IMSLP serves mp3 and m4a) and two were FLAC, and every clip is then
 * re-encoded to mp3 by the shared render path. That raised the possibility that
 * a listener rating these clips would be hearing codec generation rather than
 * music — the confound the shellac candidates were rejected for, in a milder
 * form, and one this product has a whole other instrument for measuring.
 *
 * THE FIRST VERSION OF THIS FILE ASSUMED THE ANSWER. It reported a cutoff per
 * clip beside a "lossy generations" count and averaged the cutoffs by source
 * format, which invites the reader to conclude the format caused the
 * difference. The measurement does not support that, and the shape of the
 * spectra says it is mostly false: the lossy-sourced clips are not the narrow
 * ones. A framing that asserts a cause is an assertion even when every number
 * beside it is correct (N3).
 *
 * So this reports two things instead of one:
 *
 *   cutoff — the highest frequency still above the floor, and
 *   cliff  — how abruptly the spectrum ends there.
 *
 * A lossy encoder low-passes: energy falls off a wall, tens of decibels within
 * a kilohertz or two. Music and rooms roll off gradually. The cliff figure is
 * what distinguishes "an encoder stopped here" from "there was never anything
 * up there", and without it the cutoff alone is not evidence of either.
 *
 * What these numbers license is a comparison between our own clips. They are
 * not a claim about what anybody can hear.
 */

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { fft, hann } from "./spectral.mjs";

const require = createRequire(import.meta.url);
const FFMPEG = process.env.FFMPEG_PATH || require("ffmpeg-static");
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const MANIFEST = join(ROOT, "src", "content", "spread", "manifest.json");
const AUDIO = join(ROOT, "public", "audio", "spread");

/** Full-rate decode — the analysis rate used elsewhere caps at 11 kHz. */
const SR = 44100;
const N = 4096;

/** A drop this steep across CLIFF_SPAN_HZ is an encoder, not a room. */
export const CLIFF_DB = 20;
export const CLIFF_SPAN_HZ = 2000;

function decodeFull(file) {
  const out = spawnSync(
    FFMPEG,
    ["-i", file, "-ac", "1", "-ar", String(SR), "-f", "s16le", "-v", "error", "pipe:1"],
    { maxBuffer: 1 << 30 },
  );
  if (out.status !== 0) throw new Error(`decode failed: ${file}`);
  const raw = out.stdout;
  const n = Math.floor(raw.length / 2);
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) s[i] = raw.readInt16LE(i * 2) / 32768;
  return s;
}

/** Mean power spectrum over the whole clip, in dB relative to its own peak. */
export function meanSpectrumDb(samples) {
  const w = hann(N);
  const bins = new Float64Array(N / 2);
  let frames = 0;
  for (let off = 0; off + N <= samples.length; off += N) {
    const re = new Float64Array(N);
    const im = new Float64Array(N);
    for (let i = 0; i < N; i++) re[i] = samples[off + i] * w[i];
    fft(re, im);
    for (let k = 0; k < N / 2; k++) bins[k] += re[k] * re[k] + im[k] * im[k];
    frames++;
  }
  if (!frames) throw new Error("clip too short to analyse");
  const peak = Math.max(...bins);
  return Array.from(bins, (v) => 10 * Math.log10(v / peak + 1e-30));
}

const binAt = (hz) => Math.round((hz * N) / SR);

/** Highest frequency above `floorDb` relative to the loudest band. */
export function measureClip(samples, floorDb = -70) {
  const db = meanSpectrumDb(samples);
  let cutoffHz = 0;
  for (let k = db.length - 1; k >= 0; k--) {
    if (db[k] > floorDb) {
      cutoffHz = Math.round((k * SR) / N);
      break;
    }
  }
  // How far the spectrum falls across the span ENDING at the cutoff, versus
  // the span before it. An encoder wall drops far more than the music leading
  // up to it; a gradual rolloff drops about the same.
  const before = db[Math.max(0, binAt(cutoffHz - 2 * CLIFF_SPAN_HZ))];
  const at = db[Math.max(0, binAt(cutoffHz - CLIFF_SPAN_HZ))];
  const after = db[Math.min(db.length - 1, binAt(cutoffHz + CLIFF_SPAN_HZ))];
  const dropAfter = at - after;
  const dropBefore = before - at;
  return {
    cutoffHz,
    dropAfterDb: Number(dropAfter.toFixed(1)),
    dropBeforeDb: Number(dropBefore.toFixed(1)),
    encoderCliff: dropAfter >= CLIFF_DB && dropAfter > dropBefore,
  };
}

/**
 * DOES THE BANDWIDTH DIFFERENCE PUSH THE INSTRUMENT'S ANSWER?
 *
 * The clips differ in brightness for reasons no critic's ordering caused —
 * one source is a 128 kbps mp3 that stops at 8.6 kHz, another runs to 17.8.
 * A listener whose ratings partly track brightness would produce rating gaps
 * that have nothing to do with the ranking.
 *
 * What decides whether that is fatal is not the size of the difference but its
 * DIRECTION. The instrument reports the spread on critic-far pairs beside the
 * spread on critic-close pairs. If the bright/dark differences were
 * concentrated on the FAR pairs, the pool would manufacture its own positive
 * result — the far spread would come out larger whatever anyone heard. If they
 * are concentrated on the CLOSE pairs, the bias runs toward the null: it makes
 * the instrument harder to satisfy, not easier.
 *
 * Measured on the shipped pool, the mean bandwidth gap is LARGER across close
 * pairs than across far pairs, so the confound is real, large, and pointing the
 * conservative way. `spreadvalidate.test.ts` guards the direction rather than
 * the size, because the size is a property of the recordings and cannot be
 * fixed without destroying them.
 */
export function bandwidthByPairKind(rows, pool) {
  const cutoff = new Map(rows.map((r) => [r.id, r.cutoffHz]));
  const gaps = { far: [], close: [] };
  for (let i = 0; i < pool.length; i += 1) {
    for (let j = i + 1; j < pool.length; j += 1) {
      const d = Math.abs(pool[i].position - pool[j].position);
      const gap = Math.abs(cutoff.get(pool[i].id) - cutoff.get(pool[j].id));
      if (d >= 10) gaps.far.push(gap);
      else if (d <= 3) gaps.close.push(gap);
    }
  }
  const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
  return {
    farPairs: gaps.far.length,
    closePairs: gaps.close.length,
    meanFarGapHz: Math.round(mean(gaps.far)),
    meanCloseGapHz: Math.round(mean(gaps.close)),
    /** True when the confound points toward the null rather than a result. */
    conservative: mean(gaps.close) >= mean(gaps.far),
  };
}

export function spreadBandwidth(args = []) {
  const m = JSON.parse(readFileSync(MANIFEST, "utf8"));
  const rows = m.items.map((item) => {
    const sourceExt = (item.source.cachedFile || "").split(".").pop();
    return {
      id: item.id,
      sourceExt,
      losslessSource: sourceExt === "flac" || sourceExt === "wav",
      ...measureClip(decodeFull(join(AUDIO, `${item.id}.mp3`))),
    };
  });

  if (args.includes("--json-silent")) return rows;
  if (args.includes("--json")) {
    console.log(JSON.stringify(rows, null, 2));
    return rows;
  }
  console.log("    id  source     cutoff   drop-before   drop-after   ends in a cliff");
  for (const r of rows) {
    console.log(
      `${r.id.padStart(6)}${r.sourceExt.padStart(8)}${(r.cutoffHz + " Hz").padStart(11)}` +
        `${(r.dropBeforeDb + " dB").padStart(14)}${(r.dropAfterDb + " dB").padStart(13)}` +
        `${(r.encoderCliff ? "yes" : "no").padStart(19)}`,
    );
  }
  const cliffs = rows.filter((r) => r.encoderCliff);
  const lossySourced = rows.filter((r) => !r.losslessSource);
  console.log(
    `\n${cliffs.length} of ${rows.length} clips end in an encoder-shaped cliff` +
      ` (${cliffs.map((r) => r.id).join(", ") || "none"}).` +
      `\n${lossySourced.filter((r) => r.encoderCliff).length} of those ${lossySourced.length} came from a lossy source,` +
      ` so source format does not explain which clips are narrow.`,
  );
  const pool = m.items.map((i) => ({ id: i.id, position: i.position }));
  const dir = bandwidthByPairKind(rows, pool);
  console.log(
    `\nmean bandwidth gap: ${dir.meanFarGapHz} Hz across ${dir.farPairs} critic-far pairs,` +
      ` ${dir.meanCloseGapHz} Hz across ${dir.closePairs} critic-close pairs` +
      `\nthe confound points ${dir.conservative ? "TOWARD THE NULL — it makes a difference harder to find, not easier" : "TOWARD A RESULT — the pool would inflate its own answer"}.`,
  );
  return rows;
}
