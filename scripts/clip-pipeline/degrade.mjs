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
const SEGS = 10;
const XF = 0.03; // crossfade seconds at each join

export const FAMILIES = {
  "pitch-drift": { 1: 12, 2: 25, 3: 50 }, // peak detune reached by clip end, cents
  "timing-smear": { 1: 0.015, 2: 0.03, 3: 0.05 }, // max per-segment tempo deviation
  "lossy-artifact": { 1: "96k", 2: "64k", 3: "32k" }, // round-trip mp3 bitrate
};

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

/** Apply one degradation family to a WAV; returns the params actually used. */
function degradeWav(family, magnitude, seed, inWav, outWav, clipSec) {
  const rand = mulberry32(seed);
  if (family === "lossy-artifact") {
    const bitrate = FAMILIES[family][magnitude];
    const tmp = `${outWav}.roundtrip.mp3`;
    ff(["-i", inWav, "-codec:a", "libmp3lame", "-b:a", bitrate, tmp]);
    ff(["-i", tmp, outWav]);
    return { bitrate };
  }
  const L = clipSec / SEGS;
  if (family === "pitch-drift") {
    const peakCents = FAMILIES[family][magnitude];
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
    const dev = FAMILIES[family][magnitude];
    const raw = Array.from({ length: SEGS }, () => dev * (rand() * 2 - 1));
    const mean = raw.reduce((a, b) => a + b, 0) / SEGS;
    const e = raw.map((v) => v - mean); // mean-corrected: total duration is preserved
    // tempo=1/(1+e_k) stretches segment k by (1+e_k); Σe=0 ⇒ total is exact.
    const graph = segmented((k) => `,rubberband=tempo=${(1 / (1 + e[k])).toFixed(6)}`, L);
    ff(["-i", inWav, "-filter_complex", graph, "-map", "[out]", outWav]);
    return { maxDevPct: dev * 100, segmentDevPct: e.map((v) => +(v * 100).toFixed(2)) };
  }
  throw new Error(`unknown family "${family}" (know: ${Object.keys(FAMILIES).join(", ")})`);
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
  if (!FAMILIES[family]?.[magnitude]) throw new Error(`no ${family} magnitude ${magnitude}`);

  const bias = JSON.parse(readFileSync(BIAS_MANIFEST, "utf8"));
  const src = bias.items.find((i) => i.id === sourceId);
  if (!src?.source?.cachedFile) throw new Error(`source ${sourceId} not in bias manifest / not downloaded`);
  const cached = join(CACHE, src.source.cachedFile);

  mkdirSync(TMP, { recursive: true });
  const origWav = join(TMP, `${id}-orig.wav`);
  const degWav = join(TMP, `${id}-deg.wav`);
  // One cut feeds both sides — the pair is guaranteed the same source window.
  ff(["-ss", String(startSec), "-t", String(clipSec), "-i", cached, "-vn", "-ac", "2", "-ar", "44100", origWav]);
  const params = degradeWav(family, magnitude, seed, origWav, degWav, clipSec);
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
  degradeWav(family, magnitude, seed, origWav, degWav2, clipSec);
  const degCut2 = join(TMP, `${id}-deg2-cut.wav`);
  ff(["-i", degWav2, "-t", String(clipSec), degCut2]);
  normRender(degCut2, `${id}-redo`, TMP);
  const hashA = sha256File(join(OUT, `${id}-a.mp3`));
  const hashB = sha256File(join(OUT, `${id}-b.mp3`));
  const deterministic =
    sha256File(join(TMP, `${id}-redo.mp3`)) === sha256File(join(OUT, `${id}-${degradedSide}.mp3`)) &&
    sha256File(join(TMP, `${id}-redo.m4a`)) === sha256File(join(OUT, `${id}-${degradedSide}.m4a`));

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
  ];

  console.log(`degrade ${id}  (source ${sourceId} @${startSec}s, ${family} m${magnitude}, seed ${seed})`);
  console.log(`  original → side "${originalSide}" · params ${JSON.stringify(params)}`);
  for (const [name, detail, ok] of checks) console.log(`  ${ok ? "PASS" : "FAIL"}  ${name.padEnd(24)} ${detail}`);
  console.log(`  NOTE  audibility of the degradation is UNVERIFIED by these checks — the PM ear pass (S6) gates shipping`);

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
    files: allPass ? { a: `${id}-a.mp3`, b: `${id}-b.mp3`, aM4a: `${id}-a.m4a`, bM4a: `${id}-b.m4a` } : null,
    sha256: allPass ? { a: hashA, b: hashB } : null,
    earPass: null, // audibility is a PM ear judgment (S6 gate), never inferred from the checks above
    validation: { ...Object.fromEntries(checks.map(([n, d, ok]) => [n.replace(/[ ()]/g, "_"), { detail: d, pass: ok }])), validatedAt: new Date().toISOString().slice(0, 10) },
  });
  manifest.pairs.sort((x, y) => x.id.localeCompare(y.id));
  mkdirSync(dirname(DELICACY_MANIFEST), { recursive: true });
  writeFileSync(DELICACY_MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`  manifest: src/content/delicacy/manifest.json updated (${manifest.pairs.length} pair${manifest.pairs.length === 1 ? "" : "s"})`);

  if (!allPass) {
    console.error("degrade: VALIDATION FAILED — audio deleted from public/, failure recorded in manifest");
    process.exit(1);
  }
}
