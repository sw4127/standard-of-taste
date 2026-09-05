/**
 * WINDOW SELECTION, EXTRACTED (E17/S2) — which stretch of a recording to play.
 *
 * Lifted verbatim from `index.mjs` for the same reason as `renderclip.mjs`:
 * that file is a CLI and importing it runs its dispatch, so Track N could not
 * reuse this without copying it. Behaviour is unchanged.
 *
 * Both pools want the same thing from a window and want it for the same reason
 * — a stretch that is audible, dynamic and has phrases in it, rather than a
 * fade, an introduction, or a held chord. A clip that opens on a lead-in is not
 * a fair thing to ask anyone to rate.
 */

import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const FFMPEG = process.env.FFMPEG_PATH || require("ffmpeg-static");

/** Analysis sample rate — mono s16le. */
export const SR = 22050;

/** Decode to mono s16le PCM for pure-Node analysis (no stderr parsing). */
export function decodePcm(file) {
  const out = spawnSync(
    FFMPEG,
    ["-i", file, "-ac", "1", "-ar", String(SR), "-f", "s16le", "-v", "error", "pipe:1"],
    { maxBuffer: 1 << 30 },
  );
  if (out.status !== 0) throw new Error(`ffmpeg decode failed: ${out.stderr}`);
  const raw = out.stdout;
  const n = Math.floor(raw.length / 2);
  const samples = new Float32Array(n);
  for (let i = 0; i < n; i++) samples[i] = raw.readInt16LE(i * 2) / 32768;
  return samples;
}

/**
 * Window scoring: 0.5s frames -> RMS series. A candidate window must start
 * after the lead-in silence and end before the final 10% (no fades), and is
 * scored by mean energy + RMS variance + onset density (jumps > 6dB between
 * frames ~ phrase onsets). Top-2 non-overlapping windows win.
 */
/**
 * `count` (E17/S2) defaults to 2, which is what the bias pipeline has always
 * taken. Track N asks for more because its chooser walks the ranked list until
 * Layer A accepts one: the top-scoring window is the most energetic, which is
 * not the same as usable — on this pool it landed inside a 4.3-second gap
 * between two Diabelli variations, and on another it was 32% near-silent.
 */
export function suggestWindows(samples, clipSec, count = 2) {
  const frame = Math.floor(SR * 0.5);
  const frames = Math.floor(samples.length / frame);
  const rms = [];
  for (let f = 0; f < frames; f++) {
    let acc = 0;
    for (let i = f * frame; i < (f + 1) * frame; i++) acc += samples[i] * samples[i];
    rms.push(Math.sqrt(acc / frame));
  }
  const db = rms.map((v) => 20 * Math.log10(v + 1e-9));
  const totalSec = frames * 0.5;
  // Lead-in silence: first frame above -35 dBFS.
  let startFrame = db.findIndex((v) => v > -35);
  if (startFrame < 0) startFrame = 0;
  const lastAllowedSec = totalSec * 0.9 - clipSec;
  const winFrames = clipSec * 2;
  const candidates = [];
  for (let s = startFrame; s * 0.5 <= lastAllowedSec; s++) {
    const seg = db.slice(s, s + winFrames);
    if (seg.length < winFrames) break;
    const mean = seg.reduce((a, b) => a + b, 0) / seg.length;
    const variance = seg.reduce((a, b) => a + (b - mean) ** 2, 0) / seg.length;
    let onsets = 0;
    for (let i = 1; i < seg.length; i++) if (seg[i] - seg[i - 1] > 6) onsets++;
    // Weighted score: audible (mean), dynamic (variance), phrase-y (onsets).
    const score = mean * 0.4 + Math.sqrt(variance) * 6 + onsets * 3;
    candidates.push({ startSec: s * 0.5, score: Math.round(score * 10) / 10, onsets });
  }
  candidates.sort((a, b) => b.score - a.score);
  const picked = [];
  for (const c of candidates) {
    if (picked.every((p) => Math.abs(p.startSec - c.startSec) >= clipSec / 2)) picked.push(c);
    if (picked.length === count) break;
  }
  return picked.map((p) => ({
    startSec: p.startSec,
    endSec: p.startSec + clipSec,
    score: p.score,
    onsets: p.onsets,
  }));
}
