/**
 * THE ENCODER, EXTRACTED (E17/S2) — one trim-and-normalise path for every pool.
 *
 * This function was inside `index.mjs`, which is a CLI: importing that file
 * runs its argument dispatch. Track N needs to render through this exact code
 * and could not import it, and the tempting alternative — a second copy with a
 * different output directory — would have duplicated the two-pass loudnorm and
 * the brace-parsing fix below, so that the next correction to either reached
 * one pool and not the other.
 *
 * It matters more here than duplication usually does. Every clip this product
 * plays is rated against other clips, and LOUDER READS AS BETTER. Two pools
 * encoded by two copies of "the same" path is a loudness confound waiting for
 * the copies to drift.
 *
 * Behaviour is unchanged from the version that shipped the bias pool: same
 * two-pass loudnorm, same 44.1 kHz, same libmp3lame -q:a 3.
 */

import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const FFMPEG = process.env.FFMPEG_PATH || require("ffmpeg-static");
const FFPROBE = process.env.FFPROBE_PATH || require("@ffprobe-installer/ffprobe").path;

/**
 * Trim `lenSec` from `startSec`, loudness-normalise to `lufs`, write an mp3.
 *
 * @param {string} input      source audio on disk
 * @param {number} startSec   window start
 * @param {number} lenSec     window length
 * @param {string} outBase    filename stem, no extension
 * @param {number} lufs       integrated loudness target
 * @param {string} outDir     directory to write into
 */
export function renderClip(input, startSec, lenSec, outBase, lufs, outDir) {
  mkdirSync(outDir, { recursive: true });
  // TWO-PASS loudnorm: single-pass drops to linear fallback on short dynamic
  // excerpts (classical!) and missed target by up to 2.6 LU. Pass 1 measures,
  // pass 2 applies with measured_* + linear=true → accurate integrated target.
  const cut = ["-ss", String(startSec), "-t", String(lenSec), "-i", input, "-vn"];
  const probeOut = spawnSync(
    FFMPEG,
    [...cut, "-af", `loudnorm=I=${lufs}:TP=-1.5:LRA=11:print_format=json`, "-f", "null", "-"],
    { encoding: "utf8" },
  );
  // ANCHOR ON THE LAST OBJECT, NOT THE FIRST BRACE (E7/S4). Matching the first
  // "{" to the last "}" works only while no source has a brace in its metadata.
  // pb14 (Audionautix) does: ffmpeg prints its ID3 tags, and
  // `id3v2_priv.AverageLevel` contains a literal "{" byte, so the match spanned
  // from that tag to the real JSON's close and parsed as garbage. loudnorm
  // prints its object last with no nested objects, so the last brace pair IS
  // the measurement — and it is verified to carry input_i rather than trusted.
  const stderr = probeOut.stderr || "";
  const open = stderr.lastIndexOf("{");
  const close = stderr.lastIndexOf("}");
  let mm = null;
  if (open >= 0 && close > open) {
    try {
      mm = JSON.parse(stderr.slice(open, close + 1));
    } catch {
      mm = null;
    }
  }
  if (!mm || mm.input_i === undefined) throw new Error(`loudnorm measure failed for ${outBase}`);
  const ln =
    `loudnorm=I=${lufs}:TP=-1.5:LRA=11:measured_I=${mm.input_i}:measured_TP=${mm.input_tp}` +
    `:measured_LRA=${mm.input_lra}:measured_thresh=${mm.input_thresh}` +
    `:offset=${mm.target_offset}:linear=true`;
  // -vn: sources often embed cover art as a video stream, which containers
  // reject — we render audio only.
  // MP3 ONLY since RT-67: the m4a beside every mp3 was referenced by no code
  // path (see normRender in degrade.mjs for the full reasoning).
  const common = [...cut, "-af", ln, "-ar", "44100", "-v", "error", "-y"];
  execFileSync(FFMPEG, [...common, "-codec:a", "libmp3lame", "-q:a", "3", join(outDir, `${outBase}.mp3`)]);
  const probe = execFileSync(FFPROBE, [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "csv=p=0",
    join(outDir, `${outBase}.mp3`),
  ])
    .toString()
    .trim();
  return { mp3: `${outBase}.mp3`, durationSec: Number(probe) };
}
