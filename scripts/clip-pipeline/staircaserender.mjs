/**
 * RENDER THE STAIRCASE LADDERS (E4/S3, 2026-08-18).
 *
 *   node scripts/clip-pipeline/index.mjs staircase-render
 *     [--sources pb1,pb6,pb8] [--only pb1@75,pb6@30] [--families pitch-drift,timing-smear]
 *     [--len 20] [--force] [--recalibrate] [--json]
 *
 * The staircase steps through levels whose audio did not exist. This produces
 * it, MEASURES each file as it is written, and refuses to report success on a
 * ladder whose measured magnitudes do not increase.
 *
 * WHY MEASURE AT RENDER TIME AT ALL, given Layer A re-measures afterwards. Two
 * different questions. Layer A asks "is this clip fit to put in front of
 * somebody" — gates on clipping, dead air, floors. This asks "is this file the
 * magnitude its own filename claims", which is the property the threshold is
 * reported in (D4 amendment: a per-flaw sensitivity threshold in physical
 * units). A level mislabelled by 30% produces a confident threshold that is
 * wrong by 30%, and nothing downstream can see it — the exact failure class
 * rungs.mjs was created to end, one layer up.
 *
 * One measurement genuinely CANNOT be deferred to Layer A: clipping is checked
 * on the pre-normalisation waveform, because loudnorm plus mp3 erases it from
 * the shipped file (RT-17a — a deliberately clipped render measured 0.00% after
 * the render path, with an LSD of 13 dB). So the renderer records it, and
 * Layer A reads what the renderer saw rather than pretending it can find it.
 *
 * EVERY RENDER GOES THROUGH `staircaseRender(family, level)`. Calling
 * `degradeWavParam` positionally cannot pass `timingMode`, so timing would
 * render under the legacy `maxDevPct` meaning where the same parameter spreads
 * 5.3x across seeds and rung ranges overlap completely (E2/S4b). That failure
 * is loud rather than silent — the units are disjoint, so every level trips the
 * 25% ceiling and throws — but a correctness property resting on an exception
 * three call-layers down is not a design, and the ladder table already knows
 * the mode.
 *
 * ONE SEED PER WINDOW, NOT PER CLIP. Within a window the seed is constant, so a
 * family's ladder varies in MAGNITUDE ONLY — the same discipline `curve` and
 * `ladder` use, and the reason their measured tables mean anything. Across
 * windows it varies, so a listener meeting nine windows does not meet the same
 * random walk nine times, and pitch does not drift the same direction every
 * time. It is derived from (sourceId, startSec) rather than stored, so a clip
 * can always be re-derived from its own name.
 */

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { decodeMono, degradeWavParam, normRender, timingDeviations, SEGS, LUFS } from "./degrade.mjs";
import { STAIRCASE_LEVELS, staircaseRender } from "./rungs.mjs";
import { STAIRCASE_WINDOWS, windowsForSource } from "./renderplan.mjs";
import {
  clippingStats,
  logSpectralDistance,
  pitchShiftCents,
  temporalDrift,
  DEFAULT_SPECTRAL_OPTS,
} from "./spectral.mjs";

const require = createRequire(import.meta.url);
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const FFMPEG = process.env.FFMPEG_PATH || require("ffmpeg-static");
const FFPROBE = process.env.FFPROBE_PATH || require("@ffprobe-installer/ffprobe").path;
const BIAS_MANIFEST = join(ROOT, "src", "content", "bias", "manifest.json");
const CACHE = join(HERE, ".cache");
const TMP = join(CACHE, "staircase-tmp");

/** Where the staircase pool lives. Separate from the fixed pool: different
 *  instrument, different naming, and E4 multiplies the file count by an order
 *  of magnitude — mixing them would make the fixed pool impossible to audit. */
export const STAIRCASE_OUT = join(ROOT, "public", "audio", "staircase");
export const STAIRCASE_MANIFEST = join(ROOT, "src", "content", "delicacy", "staircase.json");

const SR = DEFAULT_SPECTRAL_OPTS.sampleRate;
const ff = (args) => execFileSync(FFMPEG, ["-v", "error", "-y", ...args]);
const sha256File = (f) => createHash("sha256").update(readFileSync(f)).digest("hex");

/** Families this stage renders. Lossy is per-source and is E4/S4's problem —
 *  `staircaseRender` throws for it by design rather than guessing a bitrate. */
export const STAIRCASE_RENDER_FAMILIES = ["pitch-drift", "timing-smear"];

/**
 * The peak of the pitch ramp as a fraction of the requested parameter.
 *
 * Segment k carries `param * (k + 0.5) / SEGS`, so the last segment sits at
 * `(SEGS - 0.5) / SEGS` of it — 0.95 at ten segments. DERIVED from SEGS rather
 * than written as 0.95, because a hardcoded 0.95 is a second copy of a constant
 * and second copies of constants are how two rung tables came to disagree.
 */
export const PITCH_RAMP_PEAK_FRACTION = (SEGS - 0.5) / SEGS;

/**
 * A stable seed per (source, window). FNV-1a over the window's own name, so it
 * is re-derivable from a filename and stable across machines and runs.
 */
export function windowSeed(sourceId, startSec) {
  let h = 0x811c9dc5;
  for (const ch of `${sourceId}@${startSec}`) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) % 100000;
}

/** Family tag used in filenames — short, and stable independent of level INDEX. */
const FAMILY_TAG = { "pitch-drift": "pitch", "timing-smear": "timing", "lossy-artifact": "lossy" };

/**
 * A clip's id, and therefore its filename.
 *
 * KEYED BY PHYSICAL VALUE, NOT BY LEVEL INDEX — the same choice STAIRCASE_LEVELS
 * makes and for the same reason. Inserting a level renumbers every index, and a
 * file called `...-pitch-4.mp3` would then silently refer to a different
 * manipulation than the response data recorded against it. `...-pitch-12.5.mp3`
 * cannot drift: the name states the cents.
 */
export function clipId(sourceId, startSec, family, level) {
  return `${sourceId}-w${startSec}-${FAMILY_TAG[family]}-${level}`;
}
export function refId(sourceId, startSec) {
  return `${sourceId}-w${startSec}-ref`;
}
const fileFor = (id) => `st-${id}.mp3`;

/** Source duration in seconds, from ffprobe. */
function durationSec(file) {
  const out = execFileSync(FFPROBE, ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]);
  return Number(out.toString().trim());
}

/**
 * PRE-FLIGHT — every reason this run could fail, found before any ffmpeg runs.
 *
 * This exists because of what it catches. The approved 3x3 plan asked pb8 for a
 * window starting at 120 s; pb8 is 110.06 s long. Costed in megabytes, never
 * checked against the recordings, it would have crashed 190 clips into a
 * 198-clip render — after roughly six minutes of work, with a half-populated
 * directory and no record of which clips had been verified.
 *
 * It reports ALL problems rather than the first, because fixing them one crash
 * at a time is how a seven-minute job becomes an afternoon.
 *
 * @returns [{ sourceId, startSec, seed, cached, sourceDurationSec }]
 */
export function preflight({ sources, windows, clipSec, families }) {
  const bias = JSON.parse(readFileSync(BIAS_MANIFEST, "utf8"));
  const problems = [];
  const plan = [];

  for (const sourceId of sources) {
    const item = bias.items.find((i) => i.id === sourceId);
    if (!item?.source?.cachedFile) {
      problems.push(`${sourceId}: not in the bias manifest, or not downloaded (run \`clip-pipeline download\`)`);
      continue;
    }
    const cached = join(CACHE, item.source.cachedFile);
    if (!existsSync(cached)) {
      problems.push(`${sourceId}: cached file missing — ${cached}`);
      continue;
    }
    const dur = durationSec(cached);

    for (const startSec of windowsForSource(sourceId, windows)) {
      // THE CHECK THAT WOULD HAVE CAUGHT RT-70. A window must fit inside the
      // recording, end included.
      if (startSec + clipSec > dur) {
        problems.push(
          `${sourceId}@${startSec}s: window runs to ${startSec + clipSec}s but ${sourceId} is only ${dur.toFixed(2)}s long`,
        );
        continue;
      }
      const seed = windowSeed(sourceId, startSec);

      // `driftMs` scales a seeded random walk to hit the stated drift, so a
      // flat draw needs a large scale factor and can exceed the 25% per-segment
      // ceiling. Pure arithmetic — checking every level costs microseconds and
      // saves a render dying at its last clip.
      if (families.includes("timing-smear")) {
        for (const level of STAIRCASE_LEVELS["timing-smear"].values) {
          try {
            timingDeviations({ mode: "driftMs", param: level, seed, clipSec });
          } catch (e) {
            problems.push(`${sourceId}@${startSec}s timing level ${level}: ${e.message}`);
          }
        }
      }
      plan.push({ sourceId, startSec, seed, cached, sourceDurationSec: +dur.toFixed(2) });
    }
  }

  if (problems.length) {
    throw new Error(`staircase-render pre-flight failed (${problems.length}):\n  - ${problems.join("\n  - ")}`);
  }
  return plan;
}

/**
 * Measure one rendered clip against its window's reference.
 *
 * Each family is measured in ITS OWN physical unit, because that is the unit
 * the threshold gets reported in. LSD is recorded for both but is a magnitude
 * only for the spectral families — on a temporal manipulation it mostly
 * measures the two files falling out of step (validate.mjs, TEMPORAL_FAMILIES).
 */
export function measureClip(family, level, ref, deg) {
  const lsd = logSpectralDistance(ref, deg);
  const base = { lsdDb: +lsd.lsdDb.toFixed(3), framesCompared: lsd.framesCompared };

  if (family === "pitch-drift") {
    const p = pitchShiftCents(ref, deg);
    const predicted = level * PITCH_RAMP_PEAK_FRACTION;
    return {
      ...base,
      unit: STAIRCASE_LEVELS[family].unit,
      value: +p.p95AbsCents.toFixed(2),
      predicted: +predicted.toFixed(2),
      errPct: +(((p.p95AbsCents - predicted) / predicted) * 100).toFixed(1),
      confidentFraction: +p.confidentFraction.toFixed(3),
      medianCents: +p.medianCents.toFixed(2),
      rangeCents: +p.rangeCents.toFixed(2),
    };
  }
  if (family === "timing-smear") {
    const d = temporalDrift(ref, deg);
    // The level IS the target IQR in driftMs mode — no ramp, so predicted is
    // the level itself rather than a fraction of it.
    return {
      ...base,
      unit: STAIRCASE_LEVELS[family].unit,
      value: d.lagIqrMs,
      predicted: level,
      errPct: +(((d.lagIqrMs - level) / level) * 100).toFixed(1),
      confidentFraction: +d.confidentFraction.toFixed(3),
      driftRangeMs: d.lagRangeMs,
      coherence: +d.coherence.toFixed(3),
    };
  }
  throw new Error(`measureClip: no measure defined for family "${family}"`);
}

/**
 * CALIBRATION — solving the render parameter so the MEASURED magnitude is the
 * level (E4/S3/S2, PM ruling RT-72a).
 *
 * WHY TIMING NEEDS THIS AND PITCH DOES NOT. A cent is a cent: the pitch ruler
 * recovers its ladder to within 6.6% on pb1@75 and 5.8% on pb6@30, and the two
 * windows agree with each other to 1.04x. Timing does not behave that way.
 * `driftMs` mode guarantees the MODELLED trajectory IQR exactly, but what
 * `temporalDrift` recovers from the rendered audio carries a per-window offset
 * — measured, pb1@75 runs +12.5% and pb6@30 runs −12.8%, so the same "level 50"
 * is 54 ms on one and 44 ms on the other (1.23x apart).
 *
 * A SINGLE PER-WINDOW MULTIPLIER IS NOT ENOUGH, and this was checked before
 * being built rather than assumed. Dividing each window's ladder by its own
 * mean ratio leaves:
 *
 *     pb6@30   -8% +2% -1% +1% +2% -2% +1%  0% +4% +1%   (would pass)
 *     pb1@75   +7% +2% -6% -15% +2% +10% -4% -7% -4% +16%   (would NOT)
 *
 * pb1@75 has real level-to-level scatter, not just an offset. So the parameter
 * is solved PER LEVEL, per window.
 *
 * IT IS OFF BY DEFAULT, AND THE REASON IS MEASURED (E4/S3/S2, 2026-08-18).
 * Built, run, and then found not to converge — because measured drift is NOT a
 * smooth function of the requested drift. A dense sweep of the render parameter
 * with the model held exact:
 *
 *     pb1@75   requested   64    68    72    76    80    84    88    92
 *              measured    77    64    91    90    95    83   102   126
 *              ratio     1.20  0.94  1.26  1.18  1.19  0.99  1.16  1.37
 *
 *     pb6@30   requested   64    68    72    76    80    84    88    92
 *              measured    56    59    68    71    71    74    80    80
 *              ratio     0.88  0.87  0.94  0.93  0.89  0.88  0.91  0.87
 *
 * pb6@30 is a clean ~0.88 scale with small scatter — calibration would work
 * there. pb1@75 swings 0.94 to 1.37 and FALLS three times as the parameter
 * rises. A root-find on that has no root to find: the search oscillated
 * 15 -> 14 -> 11 -> 14 -> 11 -> 14 ms across six renders at level 12.5.
 *
 * AND THE DEVIATION CANNOT BE THE RENDER. `timingDeviations` computes the
 * per-segment stretches from (seed, param, clipSec) ALONE — it never looks at
 * the audio — and rubberband applies the same stretch factors whatever the
 * material. The drift trajectory is fixed by those factors. So a deviation
 * that differs between two recordings can only have entered through the
 * MEASUREMENT, which is the one material-dependent component in the chain.
 *
 * WHICH MAKES CALIBRATING THE WRONG FIX, not merely an ineffective one: it
 * would deliberately render clips away from the magnitude the model guarantees,
 * in order to satisfy a ruler that is itself the thing in error (N3). The code
 * stays, opt-in, because it is the right answer IF the render turns out to be
 * unfaithful — which nothing has yet tested independently. That test is the
 * next slice, and it decides whether this is promoted or deleted.
 *
 * THE SEARCH is proportional: `param x (level / measured)`. Deterministic
 * throughout, so a solved parameter is stable and gets stored — a re-render
 * costs one render, not the search.
 */

/**
 * How close a solved level has to land, in percent.
 *
 * WHY 5 AND NOT THE GATE'S 15. The gate is the maximum tolerable error on ONE
 * clip; this has to leave room for two clips at the same level to disagree with
 * each other. Two windows both landing within 5% can differ by at most
 * 1.05/0.95 = 1.105x, which clears MAX_CROSS_WINDOW_RATIO. Solving only to the
 * gate's 15% would let two instances sit 1.35x apart while every clip
 * individually "passed".
 *
 * REACHABLE: `temporalDrift` resolves 1 ms, so at the bottom level (12.5 ms)
 * the achievable grid is 12 or 13 — 4% away at worst.
 */
export const TIMING_CALIBRATION_TOL_PCT = 5;

/** Give up after this many renders per level, and keep the closest attempt. */
export const MAX_CALIBRATION_ITERATIONS = 6;

/**
 * The next parameter to try. Pure, so the step rule is testable without ffmpeg.
 *
 * Proportional rather than secant: at a fixed seed the modelled trajectory is
 * exactly proportional to the parameter, so the response is close to linear
 * through the origin and a ratio step is both correct and self-damping. A
 * secant step would chase the 1 ms quantisation.
 */
export function nextCalibrationParam(param, measured, level) {
  if (!(measured > 0)) throw new Error(`nextCalibrationParam: measured drift was ${measured} — cannot solve from it`);
  return param * (level / measured);
}

/** Render + measure every clip for ONE (source, window). */
function renderWindow({ sourceId, startSec, seed, cached, clipSec, families, force, calibrate, recalibrate, prior, priorCalibration, log }) {
  mkdirSync(TMP, { recursive: true });
  mkdirSync(STAIRCASE_OUT, { recursive: true });

  const rid = refId(sourceId, startSec);
  const refFile = join(STAIRCASE_OUT, fileFor(rid));
  const origWav = join(TMP, `${rid}-orig.wav`);

  // A clip is reused only when the manifest entry and the file on disk still
  // agree. `--recalibrate` additionally invalidates every CALIBRATED clip: the
  // solved parameter is about to change, so the audio on disk was rendered from
  // a parameter this run no longer believes in.
  const reusable = (id, family) => {
    if (force) return null;
    if (calibrate && recalibrate && family === "timing-smear") return null;
    const p = prior.get(id);
    const f = join(STAIRCASE_OUT, fileFor(id));
    if (!p || !existsSync(f)) return null;
    return p.sha256 === sha256File(f) ? p : null;
  };

  // The reference. Re-cut only when we actually have to render something from
  // it — the cut is half a second, but nine of them for a fully-cached run is
  // five seconds of nothing.
  const reusedRef = reusable(rid);
  let refEntry = reusedRef;
  let cutDone = false;
  const ensureCut = () => {
    if (cutDone) return;
    ff(["-ss", String(startSec), "-t", String(clipSec), "-i", cached, "-vn", "-ac", "2", "-ar", "44100", origWav]);
    cutDone = true;
  };
  if (!refEntry) {
    ensureCut();
    normRender(origWav, `st-${rid}`, STAIRCASE_OUT);
    refEntry = {
      id: rid,
      kind: "reference",
      sourceId,
      startSec,
      clipSec,
      seed,
      file: fileFor(rid),
      bytes: statSync(refFile).size,
      sha256: sha256File(refFile),
    };
    log(`  rendered  ${rid}`);
  } else {
    log(`  cached    ${rid}`);
  }

  const ref = decodeMono(refFile, SR);
  const clips = [];

  for (const family of families) {
    for (const level of STAIRCASE_LEVELS[family].values) {
      const id = clipId(sourceId, startSec, family, level);
      const outFile = join(STAIRCASE_OUT, fileFor(id));
      const reused = reusable(id, family);
      if (reused) {
        clips.push(reused);
        log(`  cached    ${id}`);
        continue;
      }

      ensureCut();
      // THE ONE CALL. `staircaseRender` supplies the render mode from the
      // ladder table and rejects a level that is not on the ladder; nothing
      // here restates either.
      const { param: nominal, opts } = staircaseRender(family, level);

      // Render once at a given parameter into TMP and measure it. Used by the
      // calibration search; the winning parameter is rendered again into the
      // output directory below, so a search attempt can never become a shipped
      // clip by accident.
      const tryParam = (p, tag) => {
        const w = join(TMP, `${id}-${tag}.wav`);
        const cut = join(TMP, `${id}-${tag}-cut.wav`);
        degradeWavParam(family, p, seed, origWav, w, clipSec, opts);
        ff(["-i", w, "-t", String(clipSec), cut]);
        normRender(cut, `probe-${id}`, TMP);
        const m = measureClip(family, level, ref, decodeMono(join(TMP, `probe-${id}.mp3`), SR));
        rmSync(w, { force: true });
        rmSync(cut, { force: true });
        return m;
      };

      // PITCH IS NOT CALIBRATED. Its ruler already recovers the ladder within
      // 6.6% and its windows agree to 1.04x — a search would spend renders
      // chasing the measurement's own noise.
      let param = nominal;
      let calibration = null;
      if (family === "timing-smear" && calibrate) {
        const stored = priorCalibration.get(`${sourceId}@${startSec}/${family}/${level}`);
        if (stored && !recalibrate) {
          param = stored.param;
          calibration = { ...stored, reused: true };
        } else {
          let p = nominal;
          let best = null;
          const history = [];
          for (let iter = 1; iter <= MAX_CALIBRATION_ITERATIONS; iter++) {
            let m;
            try {
              m = tryParam(p, `cal${iter}`);
            } catch (e) {
              // The 25% per-segment ceiling. A parameter the renderer refuses
              // is a dead end, not a crash — keep the closest legal attempt.
              history.push({ param: +p.toFixed(4), error: e.message });
              break;
            }
            history.push({ param: +p.toFixed(4), measured: m.value, errPct: m.errPct });
            if (!best || Math.abs(m.errPct) < Math.abs(best.errPct)) best = { param: p, ...m };
            if (Math.abs(m.errPct) <= TIMING_CALIBRATION_TOL_PCT) break;
            p = nextCalibrationParam(p, m.value, level);
          }
          if (!best) throw new Error(`staircase-render: could not render ${id} at any parameter — ${JSON.stringify(history)}`);
          param = best.param;
          calibration = {
            nominal,
            param: +param.toFixed(4),
            iterations: history.length,
            achievedErrPct: best.errPct,
            withinTolerance: Math.abs(best.errPct) <= TIMING_CALIBRATION_TOL_PCT,
            history,
          };
        }
      }

      const degWav = join(TMP, `${id}-deg.wav`);
      const params = degradeWavParam(family, param, seed, origWav, degWav, clipSec, opts);

      // Trim to exactly the reference's length: filter-flush residues leave the
      // degraded side a few ms long (same fix as renderPair).
      const degCut = join(TMP, `${id}-cut.wav`);
      ff(["-i", degWav, "-t", String(clipSec), degCut]);

      // PRE-NORMALISATION, where clipping is still visible at all (RT-17a).
      const preClip = clippingStats(decodeMono(degCut, 44100)).clippedFraction;

      normRender(degCut, `st-${id}`, STAIRCASE_OUT);
      const measured = measureClip(family, level, ref, decodeMono(outFile, SR));

      clips.push({
        id,
        kind: "degraded",
        sourceId,
        startSec,
        clipSec,
        family,
        level,
        seed,
        // The parameter actually rendered. Equal to the level for pitch;
        // SOLVED for timing, so `level` states the magnitude and this states
        // how it was reached (same split as lossyLadderForSource).
        renderParam: +param.toFixed(4),
        ...(calibration ? { calibration } : {}),
        params,
        refId: rid,
        file: fileFor(id),
        bytes: statSync(outFile).size,
        sha256: sha256File(outFile),
        preNormClippedFraction: +preClip.toFixed(6),
        measured,
      });
      rmSync(degWav, { force: true });
      rmSync(degCut, { force: true });
      log(
        `  rendered  ${id.padEnd(24)} ${String(measured.value).padStart(7)} ${measured.unit.startsWith("cents") ? "cents" : "ms"}` +
          ` (want ${measured.predicted}, ${measured.errPct >= 0 ? "+" : ""}${measured.errPct}%)` +
          (calibration
            ? calibration.reused
              ? `  [solved ${calibration.param}, stored]`
              : `  [solved ${nominal} → ${calibration.param} in ${calibration.iterations}]`
            : ""),
      );
    }
  }

  rmSync(origWav, { force: true });
  return { reference: refEntry, clips };
}

/**
 * How far a clip's MEASURED magnitude may sit from the level it is labelled
 * with, in percent.
 *
 * WHY THERE IS A GATE HERE AT ALL. The manifest carries both `level` (what was
 * asked for) and `measured.value` (what came out). If those can disagree by an
 * arbitrary amount, then whichever field a downstream reader picks up decides
 * the threshold the product prints, and one of the two is wrong. The staircase
 * reports a number in cents and milliseconds (D4 amendment); a level mislabelled
 * by 30% produces a confident threshold wrong by 30%, and nothing after this
 * point can see it.
 *
 * 15% IS PRE-REGISTERED, not fitted. It was written down before the first
 * render. Pitch clears it with room — worst 6.6% on pb1@75, 5.8% on pb6@30.
 * Timing does NOT clear it, and the gate is deliberately left where it is
 * rather than widened to whatever timing happened to produce: pb1@75 measures
 * +30% at the top level while pb6@30 measures −12% throughout, so a tolerance
 * loose enough to pass both would be admitting that "level 50" means 44 ms on
 * one recording and 54 ms on another (see crossWindowAgreement).
 */
export const MAX_LEVEL_ERR_PCT = 15;

/**
 * How far the SAME level may vary across the windows that serve it.
 *
 * THE CHECK WITHIN A WINDOW IS NOT THE CHECK THAT MATTERS. `assignInstances`
 * cycles a level's instances across every rendered window, so in one session
 * "level 50" is served by pb1@75 on one trial and pb6@30 on the next. If those
 * two files carry different magnitudes, the staircase's step size varies at
 * random between trials — which is precisely the defect `driftMs` mode was
 * introduced to fix at the seed level (E2/S4b), reappearing one level up. Each
 * window's ladder can be perfectly monotone and the pooled instrument still be
 * broken; nothing before this looked for it.
 *
 * 1.15 IS BORROWED, ON PURPOSE, from MIN_LOSSY_LEVEL_RATIO. That constant says
 * adjacent levels must differ by at least 1.15x to be two distinguishable
 * levels. It follows that two instances of the SAME level must differ by less
 * than that, or they straddle a step and the ladder overlaps itself.
 */
export const MAX_CROSS_WINDOW_RATIO = 1.15;

/**
 * Do the windows serving each level agree on what that level measures?
 *
 * @returns one row per (family, level) present in more than one window.
 */
export function crossWindowAgreement(clips) {
  const byLevel = new Map();
  for (const c of clips) {
    if (c.kind !== "degraded" || !c.measured) continue;
    const key = `${c.family}/${c.level}`;
    if (!byLevel.has(key)) byLevel.set(key, []);
    byLevel.get(key).push(c);
  }
  const rows = [];
  for (const [key, group] of byLevel) {
    if (group.length < 2) continue;
    const { family, level } = group[0];
    const values = group.map((c) => c.measured.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    rows.push({
      key,
      family,
      level,
      n: group.length,
      min,
      max,
      ratio: +(max / min).toFixed(3),
      windows: group.map((c) => ({ window: `${c.sourceId}@${c.startSec}s`, value: c.measured.value })),
    });
  }
  return rows.sort((a, b) => a.family.localeCompare(b.family) || a.level - b.level);
}

/**
 * Is a ladder's MEASURED series strictly increasing?
 *
 * This is the property the whole instrument rests on, and it is checked on what
 * came out rather than on what was asked for. A ladder whose measured
 * magnitudes tie or invert cannot support a threshold: the staircase would step
 * between two levels the ruler cannot tell apart and report a precision it does
 * not have (N3).
 */
export function ladderMonotone(rows) {
  const series = rows.map((r) => r.measured.value);
  const breaks = [];
  for (let i = 1; i < series.length; i++) {
    if (!(series[i] > series[i - 1])) breaks.push({ at: i, prev: series[i - 1], value: series[i] });
  }
  return { series, monotone: breaks.length === 0, breaks };
}

export async function staircaseRenderCli(args = []) {
  const json = args.includes("--json");
  const force = args.includes("--force");
  // Solved timing parameters are stored and reused: the search costs several
  // renders per level and the answer is deterministic, so re-rendering a window
  // should not re-derive it. `--recalibrate` throws the stored answers away,
  // which is what a change to the ladder, the seed rule or the measure requires.
  const recalibrate = args.includes("--recalibrate");
  // OFF BY DEFAULT — see the calibration block below for the measurement that
  // put it there. `--calibrate` opts in.
  const calibrate = args.includes("--calibrate");
  const opt = (name, dflt) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? args[i + 1] : dflt;
  };
  const clipSec = Number(opt("len", "20"));
  const families = opt("families", STAIRCASE_RENDER_FAMILIES.join(",")).split(",").map((s) => s.trim());
  for (const f of families) {
    if (!STAIRCASE_RENDER_FAMILIES.includes(f)) {
      throw new Error(`staircase-render: cannot render "${f}" here (know: ${STAIRCASE_RENDER_FAMILIES.join(", ")})`);
    }
  }

  let sources = opt("sources", Object.keys(STAIRCASE_WINDOWS).join(",")).split(",").map((s) => s.trim());
  let windows = STAIRCASE_WINDOWS;

  // --only pb1@75,pb6@30 — a subset of windows, for proving one before running
  // all nine. Expressed as (source, window) pairs rather than two independent
  // filters, so `--only pb8@120` names a window that does not exist and says so
  // instead of quietly rendering something else.
  const only = opt("only", null);
  if (only) {
    const picked = {};
    for (const spec of only.split(",").map((s) => s.trim())) {
      const [src, w] = spec.split("@");
      if (!src || w === undefined) throw new Error(`staircase-render: --only wants source@startSec, got "${spec}"`);
      (picked[src] ??= []).push(Number(w));
    }
    windows = picked;
    sources = Object.keys(picked);
  }

  const log = json ? () => {} : (s) => console.log(s);
  const startedAt = Date.now();

  if (!json) {
    console.log(`Staircase render — families ${families.join(", ")} · ${clipSec}s clips · ${LUFS} LUFS`);
  }
  const targets = preflight({ sources, windows, clipSec, families });
  if (!json) {
    for (const t of targets) {
      console.log(`  window ${t.sourceId}@${t.startSec}s  seed ${t.seed}  (source ${t.sourceDurationSec}s)`);
    }
    console.log("");
  }

  // Prior entries, so a partial run resumes instead of restarting.
  const priorManifest = existsSync(STAIRCASE_MANIFEST)
    ? JSON.parse(readFileSync(STAIRCASE_MANIFEST, "utf8"))
    : { references: [], clips: [] };
  const prior = new Map([...(priorManifest.references ?? []), ...(priorManifest.clips ?? [])].map((e) => [e.id, e]));
  // Solved parameters, keyed by window/family/level. Read back off the clips
  // themselves rather than kept in a parallel table — one place for a fact.
  const priorCalibration = new Map(
    (priorManifest.clips ?? [])
      .filter((c) => c.calibration && c.renderParam !== undefined)
      .map((c) => [
        `${c.sourceId}@${c.startSec}/${c.family}/${c.level}`,
        { nominal: c.calibration.nominal, param: c.renderParam, iterations: c.calibration.iterations, achievedErrPct: c.calibration.achievedErrPct, withinTolerance: c.calibration.withinTolerance, history: c.calibration.history },
      ]),
  );

  const references = [];
  const clips = [];
  for (const t of targets) {
    log(`${t.sourceId}@${t.startSec}s:`);
    const r = renderWindow({ ...t, clipSec, families, force, calibrate, recalibrate, prior, priorCalibration, log });
    references.push(r.reference);
    clips.push(...r.clips);
    log("");
  }

  // Merge: entries this run did not touch stay, so `--only` does not delete the
  // rest of the pool from the manifest.
  const touched = new Set([...references, ...clips].map((e) => e.id));
  const mergedRefs = [...(priorManifest.references ?? []).filter((e) => !touched.has(e.id)), ...references];
  const mergedClips = [...(priorManifest.clips ?? []).filter((e) => !touched.has(e.id)), ...clips];
  mergedRefs.sort((a, b) => a.id.localeCompare(b.id));
  mergedClips.sort((a, b) => a.id.localeCompare(b.id));

  // Monotonicity, per (source, window, family) — the ladder a single session
  // actually walks. Checking a family pooled across windows would let one
  // window's inversion hide inside another's spread.
  const ladders = [];
  for (const t of targets) {
    for (const family of families) {
      const rows = mergedClips
        .filter((c) => c.sourceId === t.sourceId && c.startSec === t.startSec && c.family === family)
        .sort((a, b) => a.level - b.level);
      ladders.push({ sourceId: t.sourceId, startSec: t.startSec, family, n: rows.length, ...ladderMonotone(rows), rows });
    }
  }

  const manifest = {
    instrument: "delicacy-staircase",
    poolVersion: 1,
    clipSeconds: clipSec,
    lufsTarget: LUFS,
    analysisRateHz: SR,
    renderedAt: new Date().toISOString().slice(0, 10),
    windows: STAIRCASE_WINDOWS,
    note:
      "Adaptive-staircase clip pool. Each degraded clip is measured against its window's reference IN THE FAMILY'S OWN " +
      "PHYSICAL UNIT (cents of peak detune / ms of drift IQR) and labelled with what was measured, not with what was " +
      "requested — the threshold this instrument reports is in those units (D4 amendment). `preNormClippedFraction` is " +
      "recorded here because clipping is only visible before loudness normalisation (RT-17a). Measured magnitude is NOT " +
      "difficulty: which level a listener stops hearing is what the staircase is for (N3).",
    references: mergedRefs,
    clips: mergedClips,
  };
  mkdirSync(dirname(STAIRCASE_MANIFEST), { recursive: true });
  writeFileSync(STAIRCASE_MANIFEST, JSON.stringify(manifest, null, 2) + "\n");

  const bytes = [...mergedRefs, ...mergedClips].reduce((n, e) => n + (e.bytes ?? 0), 0);
  const elapsedSec = (Date.now() - startedAt) / 1000;
  const failed = ladders.filter((l) => !l.monotone);
  const mislabelled = mergedClips.filter((c) => c.measured && Math.abs(c.measured.errPct) > MAX_LEVEL_ERR_PCT);
  const agreement = crossWindowAgreement(mergedClips);
  const disagreeing = agreement.filter((r) => r.ratio > MAX_CROSS_WINDOW_RATIO);

  if (json) {
    console.log(
      JSON.stringify(
        { ladders, agreement, mislabelled: mislabelled.map((c) => c.id), manifestPath: STAIRCASE_MANIFEST, bytes, elapsedSec },
        null,
        2,
      ),
    );
  } else {
    for (const l of ladders) {
      const unit = l.rows[0]?.measured.unit ?? "";
      console.log(`  ${l.sourceId}@${l.startSec}s ${l.family} — ${unit}`);
      console.log("    level    measured   predicted   err%   conf%   LSD dB   clip%");
      for (const r of l.rows) {
        const m = r.measured;
        console.log(
          `    ${String(r.level).padEnd(9)}${String(m.value).padStart(8)}${String(m.predicted).padStart(12)}` +
            `${(m.errPct >= 0 ? "+" : "") + m.errPct}%`.padStart(8) +
            `${(m.confidentFraction * 100).toFixed(0)}%`.padStart(8) +
            `${m.lsdDb.toFixed(2)}`.padStart(9) +
            `${(r.preNormClippedFraction * 100).toFixed(4)}`.padStart(9),
        );
      }
      console.log(
        `    strictly increasing: ${l.monotone ? "YES" : `NO — ${l.breaks.map((b) => `${b.prev}→${b.value}`).join(", ")}`}` +
          `   worst |err| ${Math.max(...l.rows.map((r) => Math.abs(r.measured.errPct))).toFixed(1)}%\n`,
      );
    }
    // DO THE WINDOWS AGREE ON WHAT A LEVEL IS? The per-window ladders above can
    // each be flawless while this fails, and this is the one the pooled
    // instrument depends on.
    if (agreement.length) {
      const worst = new Map();
      for (const r of agreement) {
        const cur = worst.get(r.family);
        if (!cur || r.ratio > cur.ratio) worst.set(r.family, r);
      }
      console.log(`  cross-window agreement — the same level, measured on every window serving it`);
      console.log(`    family          levels  worst spread                              max ratio`);
      for (const [family, r] of worst) {
        console.log(
          `    ${family.padEnd(16)}${String(agreement.filter((x) => x.family === family).length).padStart(5)}   ` +
            `level ${String(r.level).padEnd(6)} ${r.windows.map((w) => `${w.window} ${w.value}`).join(" vs ")}`.padEnd(42) +
            `${r.ratio.toFixed(2)}x ${r.ratio > MAX_CROSS_WINDOW_RATIO ? `FAIL (>${MAX_CROSS_WINDOW_RATIO})` : "ok"}`,
        );
      }
      console.log("");
    } else {
      console.log(`  cross-window agreement: not checkable — only one window per level is rendered so far\n`);
    }

    console.log(
      `  ${mergedRefs.length} references + ${mergedClips.length} degraded = ${mergedRefs.length + mergedClips.length} clips` +
        ` · ${(bytes / 1024 / 1024).toFixed(1)} MB on disk · ${elapsedSec.toFixed(1)}s`,
    );
    console.log(`  manifest: src/content/delicacy/staircase.json`);
    console.log(
      `  NOTE  these are MAGNITUDES, not audibility, and not Layer A. Fitness to put in front of a\n` +
        `        listener (dead air, quiet fraction, clipping, floors) is \`clip-pipeline staircase-validate\`.`,
    );
  }

  // THREE SEPARATE FAILURES, REPORTED SEPARATELY. They are not degrees of one
  // problem: a ladder can be monotone and mislabelled, or well-labelled per
  // window and inconsistent across them. Collapsing them into one "FAILED"
  // would hide which property is actually broken.
  if (failed.length) {
    console.error(
      `staircase-render: ${failed.length} ladder(s) NOT strictly increasing — ` +
        failed.map((l) => `${l.sourceId}@${l.startSec}s/${l.family}`).join(", "),
    );
    process.exitCode = 1;
  }
  if (mislabelled.length) {
    console.error(
      `staircase-render: ${mislabelled.length} clip(s) measure more than ${MAX_LEVEL_ERR_PCT}% from the level they are labelled with — ` +
        mislabelled
          .slice(0, 6)
          .map((c) => `${c.id} (${c.measured.errPct > 0 ? "+" : ""}${c.measured.errPct}%)`)
          .join(", ") +
        (mislabelled.length > 6 ? `, +${mislabelled.length - 6} more` : ""),
    );
    process.exitCode = 1;
  }
  if (disagreeing.length) {
    console.error(
      `staircase-render: ${disagreeing.length} level(s) measure more than ${MAX_CROSS_WINDOW_RATIO}x apart across the windows serving them — ` +
        disagreeing.slice(0, 6).map((r) => `${r.key} ${r.ratio}x`).join(", ") +
        (disagreeing.length > 6 ? `, +${disagreeing.length - 6} more` : "") +
        `\n  A level that means two different magnitudes is not one level: assignInstances cycles these files` +
        `\n  within a single session, so the staircase's step size would vary at random between trials.`,
    );
    process.exitCode = 1;
  }
  return { ladders, agreement, manifest };
}
