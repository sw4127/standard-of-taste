/**
 * DOES THE SOLVED BITRATE ACTUALLY HIT THE TARGET dB? (E4/S1, 2026-08-15)
 *
 *   node scripts/clip-pipeline/index.mjs solve-check [--sources pb1,pb6,pb8]
 *     [--start 75] [--len 20] [--json]
 *
 * WHY THIS EXISTS. The lossy ladder is stated in dB of log-spectral distance
 * rather than in kbps, because a bitrate is a SETTING and how much damage it
 * does depends entirely on the material — so a "threshold in kbps" would not be
 * a property of the listener, which is the only thing the instrument reports.
 * `solveLossyBitrate` inverts each source's own measured curve to find the
 * bitrate that reaches a level.
 *
 * IT HAS NEVER BEEN RUN AGAINST A RENDER. Every existing test drives it from a
 * fixture object of hand-typed curve points (lossy.test.ts). Those prove the
 * INTERPOLATION ARITHMETIC and the refusals, and nothing at all about whether
 * the bitrate it returns produces the damage it promises. Between the solver and
 * the audio sit two things a fixture cannot see: the interpolation assumes the
 * curve is straight in log(bitrate)-against-dB between measured points, and the
 * encoder only accepts the bitrates it accepts.
 *
 * So this measures a source's curve exactly the way `curve` does, solves every
 * staircase level against it, RENDERS at the solved bitrate through the same
 * loudnorm-and-mp3 path the pool uses, measures what actually came out, and
 * reports the miss in dB and in ladder steps.
 *
 * THE UNIT THAT MATTERS IS LADDER STEPS. The lossy ladder's ratio is 1.249, so
 * a miss of one step means a clip rendered for level 4 is really level 3 or 5 —
 * and the staircase would be stepping through a ladder whose rungs are not where
 * it thinks. Missing by 0.2 dB is meaningless without knowing that.
 *
 * It measures and prints. It does not write the manifest or edit the ladder.
 *
 * WHAT IT FOUND, first run, sources pb1/pb6/pb8 @75s 20s. The answer is NO:
 * mean miss 0.742 ladder steps, worst 2.957, on a ladder whose ratio is 1.249.
 *
 *     pb1   target 2.5 -> solved 118k -> achieved 2.969
 *           target 3.1 -> solved 110k -> achieved 2.969   <- same audio
 *     pb8   target 3.9 -> solved  80k -> achieved 3.998
 *           target 4.9 -> solved  78k -> achieved 3.998
 *           target 6.1 -> solved  75k -> achieved 3.998   <- three levels, one clip
 *     pb6   every level "not invertible"
 *
 * Identical achieved dB from different solved bitrates is the tell, and a direct
 * probe confirmed it: 118k and 110k both ENCODE at 112k, and 80/78/75/74k all
 * encode at 80k, because MP3 CBR has fourteen legal bitrates and LAME snaps
 * silently. The full diagnosis and the second, separate defect behind pb6 are
 * recorded beside `solveLossyBitrate` in rungs.mjs.
 *
 * One residual NOT explained: on pb8, 88k and 85k produced different damage
 * (3.156 vs 3.998) although the probe reports both snapping to 80k. Something
 * about that boundary is not understood, and it is written down rather than
 * smoothed over.
 */
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { decodeMono, degradeWavParam, normRender } from "./degrade.mjs";
import { logSpectralDistance, DEFAULT_SPECTRAL_OPTS } from "./spectral.mjs";
import { STAIRCASE_LEVELS, lossyLadderForSource } from "./rungs.mjs";

const require = createRequire(import.meta.url);
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const FFMPEG = process.env.FFMPEG_PATH || require("ffmpeg-static");
const BIAS_MANIFEST = join(ROOT, "src", "content", "bias", "manifest.json");
const CACHE = join(HERE, ".cache");
const TMP = join(CACHE, "solvecheck-tmp");
const SR = DEFAULT_SPECTRAL_OPTS.sampleRate;

const ff = (args) => execFileSync(FFMPEG, ["-v", "error", "-y", ...args]);

/**
 * The bitrates the curve is measured at — the same dense list `curve` sweeps.
 * The solver interpolates BETWEEN these, so a level almost never lands on one,
 * which is exactly the property under test.
 */
const CURVE_BITRATES = ["320k", "256k", "192k", "160k", "128k", "112k", "96k", "80k", "64k", "56k", "48k", "40k", "32k", "24k"];

export async function solveCheck(args = []) {
  const json = args.includes("--json");
  const opt = (name, dflt) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? args[i + 1] : dflt;
  };
  const sources = opt("sources", "pb1,pb6,pb8").split(",").map((s) => s.trim());
  const startSec = Number(opt("start", "75"));
  const clipSec = Number(opt("len", "20"));
  const spec = STAIRCASE_LEVELS["lossy-artifact"];

  const bias = JSON.parse(readFileSync(BIAS_MANIFEST, "utf8"));
  const report = [];

  for (const sourceId of sources) {
    const src = bias.items.find((i) => i.id === sourceId);
    if (!src?.source?.cachedFile) throw new Error(`solve-check: source ${sourceId} not downloaded`);
    const cached = join(CACHE, src.source.cachedFile);
    if (!existsSync(cached)) throw new Error(`solve-check: cached file missing for ${sourceId}`);

    mkdirSync(TMP, { recursive: true });
    const origWav = join(TMP, "orig.wav");
    ff(["-ss", String(startSec), "-t", String(clipSec), "-i", cached, "-vn", "-ac", "2", "-ar", "44100", origWav]);
    normRender(origWav, "ref", TMP);
    const ref = decodeMono(join(TMP, "ref.mp3"), SR);

    /** Render at one bitrate through the pool's own path and measure the damage. */
    const measure = (bitrate, tag) => {
      const degWav = join(TMP, `${tag}.wav`);
      degradeWavParam("lossy-artifact", bitrate, 500, origWav, degWav, clipSec);
      const cut = join(TMP, `${tag}-cut.wav`);
      ff(["-i", degWav, "-t", String(clipSec), cut]);
      normRender(cut, tag, TMP);
      return logSpectralDistance(ref, decodeMono(join(TMP, `${tag}.mp3`), SR)).lsdDb;
    };

    // The curve, measured exactly as `curve` measures it.
    const curve = CURVE_BITRATES.map((b) => ({
      bitrateKbps: Number(b.replace("k", "")),
      lsdDb: measure(b, `curve-${b}`),
    }));

    /**
     * The ladder this source can actually carry, built from the bitrates the
     * encoder has, each labelled with the damage measured there.
     */
    const ladder = lossyLadderForSource(curve);

    /**
     * THE CHECK THAT IS LEFT once levels are labelled by measurement: does
     * rendering at a ladder bitrate REPRODUCE the damage the ladder recorded?
     * "The level is whatever we measured" is only honest if measuring again
     * gives the same answer — otherwise the label is a snapshot of one lucky
     * encode rather than a property of the clip. This re-renders from scratch
     * through the same path and compares.
     */
    const rows = ladder.map((p) => {
      const again = measure(`${p.bitrateKbps}k`, `verify-${p.bitrateKbps}`);
      return {
        bitrateKbps: p.bitrateKbps,
        recordedDb: +p.lsdDb.toFixed(3),
        reRenderedDb: +again.toFixed(3),
        driftDb: +(again - p.lsdDb).toFixed(4),
      };
    });
    report.push({ sourceId, curve, ladder, rows });
    rmSync(TMP, { recursive: true, force: true });
  }

  if (json) {
    console.log(JSON.stringify({ startSec, clipSec, levels: spec.values, report }, null, 2));
    return report;
  }

  console.log(`Per-source lossy ladder — build, RE-RENDER, confirm. @${startSec}s, ${clipSec}s window.`);
  console.log(`Nominal range (planning only, never rendered): ${spec.values.join(", ")} ${spec.unit}.`);
  const drifts = [];
  for (const { sourceId, ladder, rows } of report) {
    const span = ladder.length ? ladder[ladder.length - 1].lsdDb / ladder[0].lsdDb : 0;
    console.log(`\n  ${sourceId} — ${ladder.length} levels, span x${span.toFixed(1)}`);
    if (!ladder.length) {
      console.log(`    no usable ladder from this source's curve`);
      continue;
    }
    console.log(`    bitrate   ladder says dB   re-rendered dB   drift dB`);
    for (const r of rows) {
      drifts.push(Math.abs(r.driftDb));
      console.log(
        `    ${`${r.bitrateKbps}k`.padStart(7)}   ${r.recordedDb.toFixed(3).padStart(14)}   ` +
          `${r.reRenderedDb.toFixed(3).padStart(14)}   ${((r.driftDb >= 0 ? "+" : "") + r.driftDb.toFixed(4)).padStart(8)}`,
      );
    }
  }
  const worst = Math.max(...drifts);
  console.log(`\n  ${drifts.length} levels re-rendered across ${report.length} sources.`);
  console.log(`  |drift| worst ${worst.toFixed(4)} dB — the label is reproducible if this is ~0.`);
  console.log(
    `\n  NOTE  Levels are now labelled with the damage MEASURED at a bitrate the encoder\n` +
      `        actually has (PM ruling RT-65), so there is no "miss" left to report. What\n` +
      `        remains checkable is whether the label reproduces — a level that means\n` +
      `        something different on a second encode is not a level (N3).`,
  );
  return report;
}
