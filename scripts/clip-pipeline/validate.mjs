/**
 * Layer A validation over the shipping pool (artifact pivot §1; PM rulings
 * RT-16a, RT-14a, 2026-08-07).
 *
 *   node scripts/clip-pipeline/index.mjs validate [--anchors] [--json]
 *
 * WHAT THIS ANSWERS, and what it does not. The spectral measure (spectral.mjs)
 * says how big a manipulation is in decibels. A decibel figure alone cannot say
 * whether anyone can HEAR it — no measure here models perception. So magnitude
 * is reported against two rendered controls, and every claim is a comparison
 * rather than an absolute:
 *
 *   FLOOR   (pipeline-noise): the source pushed through the identical trim and
 *           encode path with NO manipulation. Because `normRender` is bit-exact,
 *           this comes out at exactly 0.000 dB — the null path reproduces the
 *           file byte for byte. That is a real and useful result, but it is a
 *           narrow one: it establishes that the toolchain adds NO measurement
 *           noise, so any nonzero distance is wholly attributable to the
 *           manipulation. It is NOT an estimate of encoder noise, and it must
 *           not be described as one.
 *   ANCHOR  (transparent): a 320 kbps MP3 round-trip — the standard example of
 *           a manipulation that is real, measurable, and inaudible. It is the
 *           calibration point for "measurably different, yet nobody can hear
 *           it", which is exactly the claim a naive dB threshold would fumble.
 *
 * ANCHORS ARE PER SOURCE, not global (found by red-teaming the first run). LSD
 * depends on the material: a 320 kbps round-trip costs more distance on dense
 * orchestral texture than on sparse solo piano. The first version rendered one
 * anchor from pb1 and divided all six pairs by it, which silently compared five
 * of them against the wrong denominator. Each pair is now measured against a
 * transparent round-trip of ITS OWN source window.
 *
 * The defensible sentence this produces is: "this pair measures N times the
 * distance of a manipulation known to be transparent." That is an objective
 * statement, it required no ear, and it is honest about being a comparison
 * rather than an audibility proof (N3).
 *
 * RT-14a — written for the EXPANDED pool: nothing here assumes six pairs. It
 * iterates whatever the manifest holds, and the ladder rungs S6 adds flow
 * through unchanged.
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { decodeMono, normRender } from "./degrade.mjs";
import { clippingStats, logSpectralDistance, longestSilenceSec, quietFraction, temporalDrift, DEFAULT_SPECTRAL_OPTS } from "./spectral.mjs";

const require = createRequire(import.meta.url);
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const FFMPEG = process.env.FFMPEG_PATH || require("ffmpeg-static");
const BIAS_MANIFEST = join(ROOT, "src", "content", "bias", "manifest.json");
const DELICACY_MANIFEST = join(ROOT, "src", "content", "delicacy", "manifest.json");
const CACHE = join(HERE, ".cache");
const TMP = join(CACHE, "validate-tmp");
const OUT = join(ROOT, "public", "audio", "delicacy");

/** Analysis rate — must match what the spectral defaults assume. */
const SR = DEFAULT_SPECTRAL_OPTS.sampleRate;

const ff = (args) => execFileSync(FFMPEG, ["-v", "error", "-y", ...args]);

/**
 * Gate thresholds, expressed as MULTIPLES of the transparent anchor rather
 * than as absolute decibels. Absolute thresholds would silently encode an
 * audibility claim we have no standing to make; a ratio against a known-
 * transparent manipulation is a comparison we can defend.
 *
 * PROVISIONAL (N3): the multiplier is engineering judgment, not a measured
 * detection threshold. Real item difficulty comes from Layer B response data,
 * and when it arrives it OVERRIDES this. This gate exists to catch pairs that
 * are obviously too small to be a fair trial, not to predict who hears what.
 */
export const MIN_ANCHOR_RATIO = 3.0;
/**
 * Families whose manipulation is primarily TEMPORAL. For these, LSD is not a
 * magnitude — it is dominated by the two files falling out of step, which is
 * why d3 (magnitude 2) out-measured d6 (magnitude 3) on the first run. They are
 * gated on measured drift instead, and their dB figures are reported but
 * explicitly marked as not comparable with the spectral families.
 */
export const TEMPORAL_FAMILIES = new Set(["timing-smear"]);
/**
 * Floor for a temporal manipulation, in ms of peak-to-peak wander. This is a
 * FLOOR, not a difficulty threshold: it only asserts the warp is measurably
 * present at several times the 1 ms measurement resolution. How much drift a
 * listener can hear is not known here and is not guessed (N3) — Layer B
 * answers it with response data.
 */
export const MIN_TEMPORAL_DRIFT_MS = 5;
/**
 * A drift figure computed from mostly-unconfident blocks is not a measurement.
 * Time-warped audio genuinely correlates less well than aligned audio, so this
 * floor is deliberately permissive — it rejects "the correlator never locked",
 * not "the correlator found this hard".
 */
export const MIN_CONFIDENT_BLOCK_FRACTION = 0.25;
/** Clipping is an unfair tell: a click is audible without the degradation being. */
export const MAX_CLIPPED_FRACTION = 0.0005;
/**
 * Flat-topped waveform crests — clipping that survived loudness normalisation.
 *
 * The full-scale detector above CANNOT see this: our render path normalises
 * after the manipulation, so clipped audio arrives at −1.5 dBTP with no
 * full-scale samples. A deliberately clipped render measured 0.00% clipped and
 * PASSED the gate (RT-17a).
 *
 * MEASURED LIMITATION, and it is severe (RT-17a, 2026-08-08). This detector
 * works on raw PCM — a clipped-then-scaled signal reads ~49% — but it does NOT
 * survive our own render path. A deliberately clipped render (+30 dB on a
 * source peaking at 0.17) came out of loudnorm + mp3 reading 0.00% here and
 * 0.00% full-scale, while its LSD was 13 dB. Normalisation rescales the
 * plateaus and the codec rounds them off. Even relTol 0.1 recovered only
 * 0.004%.
 *
 * So this gate CANNOT be relied on to catch clipping in shipped audio, and no
 * claim that it does may be made. Clipping is caught where it is still visible:
 * pre-normalisation, in `degrade` (see its "no clipping (pre-loudnorm)" check).
 * This threshold is kept as a cheap backstop for the case where clipping is bad
 * enough to survive, not as the primary defence.
 *
 * Backstop threshold from measurement: all twelve files in the live pool read
 * exactly 0.0000%, so 0.1% is three orders of magnitude clear of legitimate
 * material.
 */
export const MAX_FLAT_TOP_FRACTION = 0.001;
/** Dead air makes a trial unanswerable. One-window margin per spectral.mjs. */
export const MAX_SILENCE_SEC = 1.5;
/**
 * Maximum share of the clip that may be near-silent IN TOTAL.
 *
 * Distinct from MAX_SILENCE_SEC, which caps the longest CONTIGUOUS run. A clip
 * can be a third silence in many short gaps and sail through that check — d2
 * did exactly this at 35% quiet with a longest run of 0.00s, and a listener
 * reported it as barely containing music. A trial needs enough sounding
 * material to judge, and a timing trial needs it most: a tempo warble is
 * inaudible during a rest.
 *
 * Threshold from the shipped pool: every item except d2 sits at or below 11%.
 * 20% separates them with margin rather than being fitted to d2.
 */
export const MAX_QUIET_FRACTION = 0.2;

/** Cut a source window to wav exactly as `degrade` does, so paths are comparable. */
function cutSource(cached, startSec, clipSec, outWav) {
  ff(["-ss", String(startSec), "-t", String(clipSec), "-i", cached, "-vn", "-ac", "2", "-ar", "44100", outWav]);
}

/**
 * Render the two controls from a real source window.
 *
 * Both go through the SAME trim + loudnorm + encode path the pool uses, so the
 * only difference between a control and a real pair is the manipulation itself.
 * A control rendered by a shortcut path would measure a different toolchain and
 * the comparison would be worthless.
 */
export function renderAnchors(sourceId, startSec, clipSec, tag = "anchor") {
  const bias = JSON.parse(readFileSync(BIAS_MANIFEST, "utf8"));
  const src = bias.items.find((i) => i.id === sourceId);
  if (!src?.source?.cachedFile) throw new Error(`validate: source ${sourceId} not downloaded`);
  mkdirSync(TMP, { recursive: true });

  const origWav = join(TMP, `${tag}-orig.wav`);
  cutSource(join(CACHE, src.source.cachedFile), startSec, clipSec, origWav);

  // FLOOR: identical input, identical path, no manipulation.
  const nullWav = join(TMP, `${tag}-null.wav`);
  ff(["-i", origWav, nullWav]);

  // ANCHOR: 320 kbps MP3 round-trip — measurable, and inaudible by consensus.
  const t320 = join(TMP, `${tag}-320.mp3`);
  const transparentWav = join(TMP, `${tag}-transparent.wav`);
  ff(["-i", origWav, "-codec:a", "libmp3lame", "-b:a", "320k", t320]);
  ff(["-i", t320, transparentWav]);

  normRender(origWav, `${tag}-ref`, TMP);
  normRender(nullWav, `${tag}-floor`, TMP);
  normRender(transparentWav, `${tag}-transparent`, TMP);

  const ref = decodeMono(join(TMP, `${tag}-ref.mp3`), SR);
  const floorLsd = logSpectralDistance(ref, decodeMono(join(TMP, `${tag}-floor.mp3`), SR)).lsdDb;
  const transparentLsd = logSpectralDistance(ref, decodeMono(join(TMP, `${tag}-transparent.mp3`), SR)).lsdDb;

  return {
    sourceId,
    window: { startSec, clipSec },
    /** Measurement floor contributed by our own toolchain. */
    pipelineNoiseLsdDb: floorLsd,
    /** Distance of a manipulation known to be perceptually transparent. */
    transparentLsdDb: transparentLsd,
    measuredAt: new Date().toISOString().slice(0, 10),
    note:
      "pipeline-noise = same trim/encode path, no manipulation. transparent = 320 kbps MP3 round-trip. " +
      "Neither is an audibility threshold; they are the floor and the calibration point a pair's magnitude is compared against.",
  };
}

/** Measure one shipped A/B pair. Pure measurement — no verdict here. */
export function measurePair(pair) {
  const aFile = join(OUT, `${pair.id}-a.mp3`);
  const bFile = join(OUT, `${pair.id}-b.mp3`);
  if (!existsSync(aFile) || !existsSync(bFile)) return { id: pair.id, error: "audio missing from public/" };

  const a = decodeMono(aFile, SR);
  const b = decodeMono(bFile, SR);
  const lsd = logSpectralDistance(a, b);
  const drift = temporalDrift(a, b);
  const clipA = clippingStats(a);
  const clipB = clippingStats(b);
  return {
    id: pair.id,
    family: pair.family,
    magnitude: pair.magnitude,
    lsdDb: lsd.lsdDb,
    // IQR, not peak-to-peak: peak-to-peak is a maximum of a noisy quantity and
    // one bad block fakes it (measured — d1 read 17 ms of "drift" from a single
    // outlier, and its IQR is 1 ms).
    driftIqrMs: drift.lagIqrMs,
    driftRangeMs: drift.lagRangeMs,
    driftConfidentFraction: drift.confidentFraction,
    driftCoherence: drift.coherence,
    perBandDb: lsd.perBandDb.map((x) => +x.toFixed(2)),
    framesCompared: lsd.framesCompared,
    /** Which band moved most — a family fingerprint, useful for S6/S7 triage. */
    peakBand: lsd.perBandDb.indexOf(Math.max(...lsd.perBandDb)),
    clippedFraction: Math.max(clipA.clippedFraction, clipB.clippedFraction),
    flatTopFraction: Math.max(clipA.flatTopFraction, clipB.flatTopFraction),
    longestSilenceSec: Math.max(longestSilenceSec(a, SR), longestSilenceSec(b, SR)),
    quietFraction: Math.max(quietFraction(a, SR), quietFraction(b, SR)),
  };
}

/** Apply the gates. Separated from measurement so thresholds can move without re-measuring. */
export function gradePair(m, anchors) {
  if (m.error) return { ...m, verdict: "ERROR", reasons: [m.error] };
  const ratio = m.lsdDb / anchors.transparentLsdDb;
  const temporal = TEMPORAL_FAMILIES.has(m.family);
  const reasons = [];

  // Each family is gated on the measure that actually describes it. Applying
  // the spectral gate to a temporal manipulation would pass items on a number
  // that means "the frames stopped lining up".
  if (temporal) {
    if (m.driftConfidentFraction < MIN_CONFIDENT_BLOCK_FRACTION) {
      reasons.push(`drift unmeasurable — only ${(m.driftConfidentFraction * 100).toFixed(0)}% of blocks aligned confidently`);
    } else if (!(m.driftIqrMs >= MIN_TEMPORAL_DRIFT_MS)) {
      reasons.push(`temporal drift IQR ${m.driftIqrMs} ms (need ≥${MIN_TEMPORAL_DRIFT_MS} ms)`);
    }
  } else if (!(ratio >= MIN_ANCHOR_RATIO)) {
    reasons.push(`magnitude ${ratio.toFixed(1)}x anchor (need ≥${MIN_ANCHOR_RATIO}x)`);
  }
  if (m.clippedFraction > MAX_CLIPPED_FRACTION) reasons.push(`clipping ${(m.clippedFraction * 100).toFixed(3)}%`);
  if (m.flatTopFraction > MAX_FLAT_TOP_FRACTION)
    reasons.push(`flat-topped crests ${(m.flatTopFraction * 100).toFixed(2)}% (clipping that survived loudness normalisation)`);
  if (m.longestSilenceSec > MAX_SILENCE_SEC) reasons.push(`dead air ${m.longestSilenceSec.toFixed(2)}s`);
  if (m.quietFraction > MAX_QUIET_FRACTION)
    reasons.push(`${(m.quietFraction * 100).toFixed(0)}% of the clip is near-silent (max ${MAX_QUIET_FRACTION * 100}%) — too little sounding material to judge`);
  return {
    ...m,
    anchorRatio: ratio,
    gatedOn: temporal ? "temporal-drift" : "spectral-anchor-ratio",
    verdict: reasons.length === 0 ? "PASS" : "FLAG",
    reasons,
  };
}

export async function validate(args) {
  const json = args.includes("--json");
  const manifest = JSON.parse(readFileSync(DELICACY_MANIFEST, "utf8"));
  const pairs = manifest.pairs ?? [];
  if (pairs.length === 0) throw new Error("validate: no pairs in the delicacy manifest");

  // One anchor per pair, from that pair's OWN source window — LSD is
  // material-dependent, so a single shared denominator would mis-scale every
  // pair drawn from different audio. Cached by source+window because the
  // expanded pool (RT-7b) will draw several rungs from one window.
  const anchorCache = new Map();
  const anchorFor = (p) => {
    const key = `${p.sourceId}@${p.window.startSec}+${p.window.clipSec}`;
    if (!anchorCache.has(key)) {
      anchorCache.set(key, renderAnchors(p.sourceId, p.window.startSec, p.window.clipSec, `a-${p.id}`));
    }
    return anchorCache.get(key);
  };

  const rows = pairs.map((p) => ({ ...gradePair(measurePair(p), anchorFor(p)), anchor: anchorFor(p) }));
  const anchors = [...anchorCache.values()];

  if (json) {
    console.log(JSON.stringify({ anchors, pairs: rows }, null, 2));
  } else {
    console.log(`Layer A validation — ${pairs.length} pair${pairs.length === 1 ? "" : "s"} · analysis ${SR} Hz`);
    const floors = anchors.map((a) => a.pipelineNoiseLsdDb);
    console.log(
      `  ANCHORS: one per source window (${anchors.length} rendered). ` +
        `pipeline-noise floor ${Math.min(...floors).toFixed(3)}–${Math.max(...floors).toFixed(3)} dB · ` +
        `transparent 320k round-trip ${Math.min(...anchors.map((a) => a.transparentLsdDb)).toFixed(3)}–` +
        `${Math.max(...anchors.map((a) => a.transparentLsdDb)).toFixed(3)} dB`,
    );
    console.log("  id   family          mag   LSD dB  ×anchor  driftIQR  conf%  gated on               verdict");
    for (const r of rows) {
      if (r.error) {
        console.log(`  ${r.id.padEnd(5)}${"—".padEnd(46)}ERROR  ${r.error}`);
        continue;
      }
      const temporal = r.gatedOn === "temporal-drift";
      console.log(
        `  ${r.id.padEnd(5)}${String(r.family).padEnd(16)}${String(r.magnitude).padEnd(6)}` +
          `${r.lsdDb.toFixed(2).padStart(6)}  ${(temporal ? "n/a" : r.anchorRatio.toFixed(1)).padStart(7)}  ` +
          `${(r.driftIqrMs + " ms").padStart(8)}  ${(r.driftConfidentFraction * 100).toFixed(0).padStart(4)}%  ` +
          `${r.gatedOn.padEnd(23)}${r.verdict}` +
          (r.reasons.length ? `  (${r.reasons.join("; ")})` : ""),
      );
    }
    console.log(
      `  NOTE  these are MAGNITUDES, not audibility. "×anchor" compares each pair against a\n` +
        `        320 kbps round-trip — a manipulation that is measurable and inaudible. A high\n` +
        `        ratio means "much bigger than something nobody can hear", not "N% will hear it".`,
    );
  }

  manifest.layerA = {
    analysisRateHz: SR,
    anchors,
    thresholds: { MIN_ANCHOR_RATIO, MIN_TEMPORAL_DRIFT_MS, MIN_CONFIDENT_BLOCK_FRACTION, MAX_CLIPPED_FRACTION, MAX_FLAT_TOP_FRACTION, MAX_SILENCE_SEC, MAX_QUIET_FRACTION },
    measuredAt: new Date().toISOString().slice(0, 10),
    note:
      "Magnitudes, NOT audibility. anchorRatio compares each pair against a 320 kbps round-trip of its OWN source window — " +
      "a manipulation that is measurable and inaudible. LSD is material-dependent, so ratios are comparable across pairs but raw dB are not.",
  };
  for (const p of pairs) {
    const r = rows.find((x) => x.id === p.id);
    if (!r || r.error) continue;
    p.layerA = {
      lsdDb: +r.lsdDb.toFixed(3),
      anchorTransparentLsdDb: +r.anchor.transparentLsdDb.toFixed(3),
      anchorRatio: +r.anchorRatio.toFixed(2),
      driftIqrMs: r.driftIqrMs,
      driftRangeMs: r.driftRangeMs,
      driftConfidentFraction: +r.driftConfidentFraction.toFixed(2),
      driftCoherence: +r.driftCoherence.toFixed(2),
      gatedOn: r.gatedOn,
      peakBand: r.peakBand,
      clippedFraction: +r.clippedFraction.toFixed(6),
      flatTopFraction: +r.flatTopFraction.toFixed(6),
      longestSilenceSec: +r.longestSilenceSec.toFixed(2),
      quietFraction: +r.quietFraction.toFixed(3),
      verdict: r.verdict,
      reasons: r.reasons,
      measuredAt: r.anchor.measuredAt,
    };
  }
  writeFileSync(DELICACY_MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  rmSync(TMP, { recursive: true, force: true });

  const flagged = rows.filter((r) => r.verdict !== "PASS");
  if (!json) console.log(`  manifest updated · ${rows.length - flagged.length}/${rows.length} PASS`);
  if (flagged.length > 0) {
    console.error(`validate: ${flagged.length} pair(s) did not pass Layer A`);
    process.exitCode = 1;
  }
}
