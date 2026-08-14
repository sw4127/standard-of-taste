/**
 * Delicacy degradation toolchain — S1 of the delicacy battery (memo D2
 * Instrument 2, §8.2 PD/CC-only, §9.4 offline pipeline; N3: every claim below
 * is a measured check, printed as a validation report).
 *
 *   node scripts/clip-pipeline/index.mjs degrade \
 *     --id <pairId> --source <biasManifestItemId> --start <sec> \
 *     --family <pitch-drift|timing-smear|lossy-artifact> --magnitude <1|2|3> \
 *     --seed <int> [--len <sec>]
 *
 * Emits an original/degraded pair (mp3+m4a, both two-pass R128 loudnormed to
 * the same target so loudness is never the tell), assigns which file is the
 * original to side "a" or "b" from the seed (URLs must not reveal the answer),
 * validates the pair, and records params + validation in
 * src/content/delicacy/manifest.json. Any FAILed check exits nonzero.
 *
 * pitch-drift / timing-smear are built segment-wise: each segment is cut with
 * a small source-overlap tail and rejoined with an equal-length crossfade, so
 * joins are POSITION-continuous in the source (no jumps, no duration loss) —
 * only pitch/tempo steps across them, which reads as drift/warble.
 * Magnitude = degradation intensity (1 subtle … 3 obvious); the mapping is a
 * PROVISIONAL engineering guess until the PM ear pass (S6) and, eventually,
 * IRT item stats (D6) calibrate it.
 */

import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { clippingStats } from "./spectral.mjs";
import { LADDER_FAMILIES, LADDER_RUNGS, paramForRung } from "./rungs.mjs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const FFMPEG = process.env.FFMPEG_PATH || require("ffmpeg-static");
const FFPROBE = process.env.FFPROBE_PATH || require("@ffprobe-installer/ffprobe").path;
const BIAS_MANIFEST = join(ROOT, "src", "content", "bias", "manifest.json");
const DELICACY_MANIFEST = join(ROOT, "src", "content", "delicacy", "manifest.json");
const CACHE = join(HERE, ".cache");
const TMP = join(CACHE, "degrade-tmp");
const OUT = join(ROOT, "public", "audio", "delicacy");
export const LUFS = -16; // matches the bias pool target
/**
 * EXPORTED (E2/S1) because the segment count defines the RAMP MODEL, and the
 * ramp model is what any pitch measurement has to be checked against: segment k
 * carries param*(k+0.5)/SEGS, so a rendered clip spans 5%..95% of its rung's
 * parameter rather than sitting at it. A checker that hardcodes 0.95 is a
 * second copy of this constant, and second copies of constants are how the two
 * rung tables came to disagree (rungs.mjs).
 */
export const SEGS = 10;
const XF = 0.03; // crossfade seconds at each join

/**
 * REMOVED 2026-08-13 (PM ruling RT-52a): a local `FAMILIES` rung table used to
 * live here and had gone stale against the widened ladder — its "magnitude 2"
 * was the ladder's rung 3. Rung labels are now resolved ONLY by
 * rungs.mjs::paramForRung, which the planner uses too. See rungs.mjs for the
 * full failure and why the table moved to its own module.
 */

/* Deterministic PRNG — same seed, same degradation, forever (D6: stored
 * responses stay interpretable against the exact audio that produced them). */
function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const sha256File = (f) => createHash("sha256").update(readFileSync(f)).digest("hex");
const ff = (args) => execFileSync(FFMPEG, ["-v", "error", "-y", ...args]);

/** Per-segment filtergraph: overlap tails + acrossfade keep joins position-continuous. */
function segmented(opFor, L) {
  const parts = [];
  for (let k = 0; k < SEGS; k++) {
    const end = (k + 1) * L + (k < SEGS - 1 ? XF : 0);
    parts.push(`[0:a]atrim=${(k * L).toFixed(3)}:${end.toFixed(3)},asetpts=PTS-STARTPTS${opFor(k)}[s${k}]`);
  }
  let prev = "s0";
  for (let k = 1; k < SEGS; k++) {
    const out = k === SEGS - 1 ? "out" : `x${k}`;
    parts.push(`[${prev}][s${k}]acrossfade=d=${XF}[${out}]`);
    prev = out;
  }
  return parts.join(";");
}

/**
 * Apply one degradation family at an EXPLICIT parameter value; returns the
 * params actually used.
 *
 * Parameterized by value rather than by the 1|2|3 magnitude label so the
 * strength ladder (S6) can render rungs the label set does not contain.
 * Renumbering the labels instead would have silently changed what existing
 * manifest entries mean — d1 records "magnitude 1", and that has to keep
 * meaning 12 cents.
 */
export function degradeWavParam(family, param, seed, inWav, outWav, clipSec) {
  const rand = mulberry32(seed);
  if (family === "lossy-artifact") {
    const bitrate = param;
    const tmp = `${outWav}.roundtrip.mp3`;
    ff(["-i", inWav, "-codec:a", "libmp3lame", "-b:a", bitrate, tmp]);
    ff(["-i", tmp, outWav]);
    return { bitrate };
  }
  const L = clipSec / SEGS;
  if (family === "pitch-drift") {
    const peakCents = param;
    const dir = rand() < 0.5 ? -1 : 1; // drifts flat or sharp, seeded
    const graph = segmented((k) => {
      const f = 2 ** ((dir * peakCents * (k + 0.5)) / SEGS / 1200);
      // rubberband=pitch is duration-EXACT; the asetrate/aresample/atempo
      // chain truncated ~12ms per segment at the atempo flush (measured).
      return `,rubberband=pitch=${f.toFixed(6)}`;
    }, L);
    ff(["-i", inWav, "-filter_complex", graph, "-map", "[out]", outWav]);
    return { peakCents, direction: dir > 0 ? "sharp" : "flat" };
  }
  if (family === "timing-smear") {
    const dev = param;
    const raw = Array.from({ length: SEGS }, () => dev * (rand() * 2 - 1));
    const mean = raw.reduce((a, b) => a + b, 0) / SEGS;
    const e = raw.map((v) => v - mean); // mean-corrected: total duration is preserved
    // tempo=1/(1+e_k) stretches segment k by (1+e_k); Σe=0 ⇒ total is exact.
    const graph = segmented((k) => `,rubberband=tempo=${(1 / (1 + e[k])).toFixed(6)}`, L);
    ff(["-i", inWav, "-filter_complex", graph, "-map", "[out]", outWav]);
    return { maxDevPct: dev * 100, segmentDevPct: e.map((v) => +(v * 100).toFixed(2)) };
  }
  throw new Error(`unknown family "${family}" (know: ${LADDER_FAMILIES.join(", ")})`);
}

/** Two-pass R128 loudnorm (same rationale as render's renderOne) → mp3+m4a. */
export function normRender(inWav, outBase, outDir) {
  mkdirSync(outDir, { recursive: true });
  const probe = spawnSync(FFMPEG, ["-i", inWav, "-af", `loudnorm=I=${LUFS}:TP=-1.5:LRA=11:print_format=json`, "-f", "null", "-"], { encoding: "utf8" });
  const m = (probe.stderr || "").match(/\{[\s\S]*\}/);
  if (!m) throw new Error(`loudnorm measure failed for ${outBase}`);
  const mm = JSON.parse(m[0]);
  const ln = `loudnorm=I=${LUFS}:TP=-1.5:LRA=11:measured_I=${mm.input_i}:measured_TP=${mm.input_tp}:measured_LRA=${mm.input_lra}:measured_thresh=${mm.input_thresh}:offset=${mm.target_offset}:linear=true`;
  // bitexact: no encoder version strings / timestamps, so re-renders hash equal.
  const common = ["-i", inWav, "-af", ln, "-ar", "44100", "-fflags", "+bitexact", "-flags:a", "+bitexact"];
  ff([...common, "-codec:a", "libmp3lame", "-q:a", "3", join(outDir, `${outBase}.mp3`)]);
  ff([...common, "-codec:a", "aac", "-b:a", "160k", join(outDir, `${outBase}.m4a`)]);
}

export function measureFinal(file) {
  const probe = spawnSync(FFMPEG, ["-i", file, "-af", "loudnorm=print_format=json", "-f", "null", "-"], { encoding: "utf8" });
  const mm = JSON.parse((probe.stderr || "").match(/\{[\s\S]*\}/)[0]);
  const dur = Number(execFileSync(FFPROBE, ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString().trim());
  return { lufs: Number(mm.input_i), truePeak: Number(mm.input_tp), durationSec: dur };
}

/**
 * Decode to mono PCM at `sr`. The rate is a PARAMETER, not a constant: Layer A
 * spectral analysis needs 44.1 kHz to see the lossy family's high-frequency
 * signature at all (see spectral.mjs DEFAULT_SPECTRAL_OPTS), while the older
 * pcmDiff check below is happy at 22.05 kHz.
 */
export function decodeMono(file, sr = 22050) {
  const out = spawnSync(FFMPEG, ["-i", file, "-ac", "1", "-ar", String(sr), "-f", "s16le", "-v", "error", "pipe:1"], { maxBuffer: 1 << 28 });
  if (out.status !== 0) throw new Error(`decode failed: ${out.stderr}`);
  const n = Math.floor(out.stdout.length / 2);
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) s[i] = out.stdout.readInt16LE(i * 2) / 32768;
  return s;
}

/** Relative RMS of the sample-wise difference (includes codec micro-misalignment). */
function pcmDiff(a, b) {
  const n = Math.min(a.length, b.length);
  let sa = 0, sd = 0;
  for (let i = 0; i < n; i++) {
    sa += a[i] * a[i];
    const d = a[i] - b[i];
    sd += d * d;
  }
  return Math.sqrt(sd / n) / Math.sqrt(sa / n);
}

function loadDelicacyManifest() {
  if (!existsSync(DELICACY_MANIFEST))
    return {
      instrument: "delicacy-v1",
      note: "Degraded-pair pool. `originalSide` is the trial's answer key — the repo being public means answers are technically discoverable (same standing as the bias swap labels in items.ts); disclosed on the methodology page, not defended against.",
      clipSeconds: 20,
      lufsTarget: LUFS,
      pairs: [],
    };
  return JSON.parse(readFileSync(DELICACY_MANIFEST, "utf8"));
}

/**
 * CLI wrapper: resolve the rung label to a parameter, then render.
 *
 * The resolution goes through rungs.mjs — the SAME call the planner makes — so
 * `degrade --magnitude 2` and the planner's rung 2 cannot drift apart again
 * (rungs.test.ts pins that). Before RT-52a they had, by a full rung.
 */
export async function degrade(args) {
  const opt = (name, dflt) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? args[i + 1] : dflt;
  };
  const id = opt("id"), sourceId = opt("source"), family = opt("family");
  const magnitude = Number(opt("magnitude")), seed = Number(opt("seed"));
  const startSec = Number(opt("start")), clipSec = Number(opt("len", "20"));
  if (!id || !sourceId || !family || !Number.isInteger(magnitude) || !Number.isInteger(seed) || !Number.isFinite(startSec))
    throw new Error("need --id --source --start --family --magnitude --seed");
  const param = paramForRung(family, magnitude); // throws on an unknown family or rung
  return renderPair({ id, sourceId, startSec, clipSec, family, magnitude, param, seed });
}

/**
 * Render and validate ONE degraded pair from an explicit parameter value.
 *
 * Extracted from `degrade` so pool expansion renders through the IDENTICAL
 * path — same cut, same degradation, same two-pass loudnorm, same validation
 * checks. A second render path would mean the expanded pool was made by code
 * nobody had verified.
 *
 * `magnitude` here is the LADDER RUNG (1..4), recorded for the manifest; the
 * actual degradation is driven by `param`, so the rung is a label rather than a
 * lookup key and cannot silently disagree with what was rendered.
 *
 * RT-54a: that freedom is the remaining way to write a mislabelled pair — hand
 * it rung 2 and rung 4's parameter and it renders exactly that. It WARNS rather
 * than throwing, deliberately: calibrating a new rung means rendering candidate
 * values that are not on the ladder yet, and a hard gate here would block the
 * ladder work itself. What SHIPS is already enforced elsewhere — rungs.test.ts
 * rejects any pair in the manifest whose recorded params disagree with its rung.
 * So: loud at render time, fatal at ship time.
 */
export async function renderPair({ id, sourceId, startSec, clipSec, family, magnitude, param, seed, quiet = false }) {
  const onLadder = LADDER_RUNGS[family]?.values ?? [];
  if (onLadder.length && String(onLadder[magnitude - 1]) !== String(param)) {
    console.warn(
      `\n  !! OFF-LADDER RENDER: ${id} is labelled ${family} rung ${magnitude}, whose ladder value is ` +
        `${onLadder[magnitude - 1]} — but param is ${param}.\n` +
        `     If you are calibrating a new rung, fine. If this is a pool pair, the label is a LIE and\n` +
        `     the pool gate will reject it (rungs.test.ts). Ladder: ${JSON.stringify(onLadder)}\n`,
    );
  }
  const bias = JSON.parse(readFileSync(BIAS_MANIFEST, "utf8"));
  const src = bias.items.find((i) => i.id === sourceId);
  if (!src?.source?.cachedFile) throw new Error(`source ${sourceId} not in bias manifest / not downloaded`);
  const cached = join(CACHE, src.source.cachedFile);

  mkdirSync(TMP, { recursive: true });
  const origWav = join(TMP, `${id}-orig.wav`);
  const degWav = join(TMP, `${id}-deg.wav`);
  // One cut feeds both sides — the pair is guaranteed the same source window.
  ff(["-ss", String(startSec), "-t", String(clipSec), "-i", cached, "-vn", "-ac", "2", "-ar", "44100", origWav]);
  const params = degradeWavParam(family, param, seed, origWav, degWav, clipSec);
  // Trim the degraded side to EXACTLY the original's length: filter-flush and
  // codec-round-trip residues leave it a few ms long, and a length straddling
  // an AAC frame boundary shows up as a ±100ms m4a duration mismatch (seen on
  // d6). Millisecond-scale tail trim; position continuity unaffected.
  const degCut = join(TMP, `${id}-deg-cut.wav`);
  ff(["-i", degWav, "-t", String(clipSec), degCut]);

  const originalSide = mulberry32(seed ^ 0x9e3779b9)() < 0.5 ? "a" : "b";
  const degradedSide = originalSide === "a" ? "b" : "a";
  normRender(origWav, `${id}-${originalSide}`, OUT);
  normRender(degCut, `${id}-${degradedSide}`, OUT);

  // ------------------------------------------------- validation (all measured)
  // Both delivery formats are validated: ClipPlayer may serve either, and an
  // unchecked m4a would mean Safari users hear audio no check ever touched.
  const A = measureFinal(join(OUT, `${id}-a.mp3`));
  const B = measureFinal(join(OUT, `${id}-b.mp3`));
  const A4 = measureFinal(join(OUT, `${id}-a.m4a`));
  const B4 = measureFinal(join(OUT, `${id}-b.m4a`));
  const diff = pcmDiff(decodeMono(join(OUT, `${id}-a.mp3`)), decodeMono(join(OUT, `${id}-b.mp3`)));
  // Determinism: rebuild the degraded side from scratch into TMP, compare hashes.
  const degWav2 = join(TMP, `${id}-deg2.wav`);
  degradeWavParam(family, param, seed, origWav, degWav2, clipSec);
  const degCut2 = join(TMP, `${id}-deg2-cut.wav`);
  ff(["-i", degWav2, "-t", String(clipSec), degCut2]);
  normRender(degCut2, `${id}-redo`, TMP);
  const hashA = sha256File(join(OUT, `${id}-a.mp3`));
  const hashB = sha256File(join(OUT, `${id}-b.mp3`));
  const deterministic =
    sha256File(join(TMP, `${id}-redo.mp3`)) === sha256File(join(OUT, `${id}-${degradedSide}.mp3`)) &&
    sha256File(join(TMP, `${id}-redo.m4a`)) === sha256File(join(OUT, `${id}-${degradedSide}.m4a`));

  // CLIPPING IS CHECKED HERE, BEFORE LOUDNESS NORMALISATION (RT-17a).
  // Measured 2026-08-08: a deliberately clipped render (+30 dB on a source
  // peaking at 0.17) came out of normRender + mp3 with 0.00% full-scale
  // samples AND 0.00% flat-topped crests, because loudnorm rescales the peaks
  // and the codec rounds the plateaus off. Its LSD was 13 dB — the distortion
  // was enormous and completely invisible to a post-hoc check on the shipped
  // file. The pre-normalisation waveform is the only place clipping can
  // honestly be caught, so it is caught here.
  const clipOrig = clippingStats(decodeMono(origWav, 44100));
  const clipDeg = clippingStats(decodeMono(degCut, 44100));
  const worstClip = Math.max(clipOrig.clippedFraction, clipDeg.clippedFraction);

  const pair = (x, y, fmt, u, tol, dp) =>
    [`a ${x.toFixed(dp)}  b ${y.toFixed(dp)} ${u}  Δ ${Math.abs(x - y).toFixed(dp)} (≤${tol}) [${fmt}]`, Math.abs(x - y) <= tol];
  const checks = [
    ["duration match (mp3)", ...pair(A.durationSec, B.durationSec, "mp3", "s", 0.05, 3)],
    ["duration match (m4a)", ...pair(A4.durationSec, B4.durationSec, "m4a", "s", 0.05, 3)],
    ["loudness match (mp3)", ...pair(A.lufs, B.lufs, "mp3", "LUFS", 0.5, 1)],
    ["loudness match (m4a)", ...pair(A4.lufs, B4.lufs, "m4a", "LUFS", 0.5, 1)],
    ["true peak (all 4)", `mp3 ${A.truePeak.toFixed(1)}/${B.truePeak.toFixed(1)}  m4a ${A4.truePeak.toFixed(1)}/${B4.truePeak.toFixed(1)} dBTP (≤ −1.0)`, [A, B, A4, B4].every((x) => x.truePeak <= -1)],
    ["distinct files", `rel-RMS diff ${diff.toFixed(3)} (≥0.020 floor; NOT a perceptual claim)`, diff >= 0.02],
    ["deterministic re-render", deterministic ? "sha256 identical" : "sha256 DIVERGED", deterministic],
    ["no clipping (pre-loudnorm)", `orig ${(clipOrig.clippedFraction * 100).toFixed(4)}%  degraded ${(clipDeg.clippedFraction * 100).toFixed(4)}% (≤0.0500%)`, worstClip <= 0.0005],
  ];

  const allPassPreview = checks.every((c) => c[2]);
  if (!quiet) {
    console.log(`degrade ${id}  (source ${sourceId} @${startSec}s, ${family} rung ${magnitude}, param ${param}, seed ${seed})`);
    console.log(`  original → side "${originalSide}" · params ${JSON.stringify(params)}`);
    for (const [name, detail, ok] of checks) console.log(`  ${ok ? "PASS" : "FAIL"}  ${name.padEnd(26)} ${detail}`);
    console.log(`  NOTE  these checks do not establish AUDIBILITY. Layer A magnitude against the`);
    console.log(`        transparency anchor is measured separately by \`clip-pipeline validate\`.`);
  } else {
    console.log(`  ${allPassPreview ? "ok  " : "FAIL"} ${id.padEnd(5)} ${sourceId.padEnd(5)} @${String(startSec).padStart(3)}s  ${family.padEnd(15)} rung ${magnitude}  side ${originalSide}`);
  }

  const allPass = checks.every((c) => c[2]);
  if (!allPass) {
    // A failed pair must not sit in the shipping directory looking wireable.
    for (const s of ["a", "b"]) for (const ext of ["mp3", "m4a"]) rmSync(join(OUT, `${id}-${s}.${ext}`), { force: true });
  }
  const manifest = loadDelicacyManifest();
  manifest.pairs = manifest.pairs.filter((p) => p.id !== id);
  manifest.pairs.push({
    // (sorted by id on save — re-rendering a pair must not reorder the manifest)
    id, sourceId, window: { startSec, clipSec }, family, magnitude, seed, params, originalSide,
    param,
    files: allPass ? { a: `${id}-a.mp3`, b: `${id}-b.mp3`, aM4a: `${id}-a.m4a`, bM4a: `${id}-b.m4a` } : null,
    sha256: allPass ? { a: hashA, b: hashB } : null,
    // The ear pass is RETIRED (artifact pivot §1). Audibility is not asserted
    // by anyone; Layer A measures magnitude against a transparency anchor.
    validation: { ...Object.fromEntries(checks.map(([n, d, ok]) => [n.replace(/[ ()]/g, "_"), { detail: d, pass: ok }])), validatedAt: new Date().toISOString().slice(0, 10) },
  });
  manifest.pairs.sort((x, y) => x.id.localeCompare(y.id));
  mkdirSync(dirname(DELICACY_MANIFEST), { recursive: true });
  writeFileSync(DELICACY_MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`  manifest: src/content/delicacy/manifest.json updated (${manifest.pairs.length} pair${manifest.pairs.length === 1 ? "" : "s"})`);

  if (!allPass) {
    console.error(`degrade ${id}: VALIDATION FAILED — audio deleted from public/, failure recorded in manifest`);
    process.exitCode = 1;
  }
  return allPass;
}
