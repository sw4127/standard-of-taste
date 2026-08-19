/**
 * WHAT E4 HAS TO RENDER, AND WHAT IT COSTS (E4/S2, 2026-08-15).
 *
 *   node scripts/clip-pipeline/index.mjs render-plan [--sources a,b,c]
 *     [--windows 30,75,120] [--json]
 *
 * The staircase steps through levels whose clips DO NOT EXIST. This enumerates
 * exactly which files have to be produced, as data rather than as a paragraph,
 * so the count and the megabytes are computed and not guessed — and so the plan
 * can be diffed when it changes.
 *
 * THE SHAPE OF A TRIAL is what drives the whole count. A trial is a same-moment
 * A/B: the listener hears the SAME musical moment clean and degraded, and says
 * which is which. So each (source, window) needs one clean REFERENCE render,
 * shared across all three families, plus one degraded render per level.
 *
 * WHY MORE THAN ONE WINDOW PER SOURCE. A staircase revisits the levels near a
 * listener's threshold many times in its ~38 trials — that is the entire point
 * of the procedure. If a level owns exactly one audio file, the listener meets
 * that same file six or eight times in a session and starts recognising the
 * CLIP rather than hearing the FLAW. The measurement would improve across the
 * session for a reason that has nothing to do with their ear, and the retest arc
 * would then report it as learning. Windows are how that is avoided, and they
 * multiply the render count directly.
 *
 * LOSSY IS PER SOURCE (PM ruling RT-65): its ladder is built from the bitrates
 * the encoder has and labelled with the damage measured on that material, so
 * its level COUNT differs per source and a session must stay on one source.
 *
 * COSTS ARE COMPUTED FROM MEASURED BYTES, not from a bitrate calculation — the
 * mean and max of the 36 delicacy clips already shipping at this duration and
 * encoder setting.
 */
import { STAIRCASE_LEVELS, lossyLadderForSource } from "./rungs.mjs";

/**
 * MEASURED from the shipped pool (`public/audio/delicacy`, 36 clips, 20 s,
 * libmp3lame -q:a 3 after two-pass loudnorm): mean 365,396 B, max 490,264 B.
 * The max is what a plan should be sized against; the mean is what it will
 * probably weigh.
 */
export const MEASURED_CLIP_BYTES = { mean: 365_396, max: 490_264 };

/**
 * ONE DELIVERY FORMAT, NOT TWO. The pipeline emits mp3 AND m4a for every clip,
 * and 18.3 MB of tracked, deployed .m4a is referenced by ZERO code paths —
 * `items.ts` builds every src as `.mp3` and nothing anywhere selects a format or
 * falls back. The only thing that mentions m4a is a test asserting the unused
 * files exist. E4 would have doubled that dead weight, so the plan prices ONE
 * format and the m4a emission should be dropped with it.
 */
export const FORMATS_PER_CLIP = 1;

/**
 * THE WINDOW PLAN OF RECORD (PM rulings RT-66a, RT-70a).
 *
 * pb1 and pb6 keep the approved 30/75/120 s. **pb8 does not have a 120 s
 * window** — the recording is 110.06 s long, so the approved plan asked for
 * audio that does not exist, and E4/S3 would have crashed 190 clips into a
 * 198-clip render. It gets 15/45/75 instead: three non-overlapping 20 s
 * windows inside the file, and it keeps 75 s, which is where its lossy curve
 * was measured.
 *
 * ONE TABLE, imported by the planner and the renderer both — the same
 * discipline rungs.mjs exists to enforce. `staircase-render` additionally
 * ffprobes every source and refuses to start if any window runs past the end,
 * so the class of defect that produced this ruling cannot recur silently.
 */
export const STAIRCASE_WINDOWS = {
  pb1: [30, 75, 120],
  pb6: [30, 75, 120],
  pb8: [15, 45, 75],
};

/**
 * Levels per family for one source. Pitch and timing are source-independent
 * (a cent is a cent); lossy is not, so it needs that source's measured curve.
 *
 * @param curves { [sourceId]: [{bitrateKbps, lsdDb}] } — may omit a source, in
 *   which case its lossy ladder is reported as unknown rather than assumed.
 */
/**
 * MEASURED by `solve-check`, 20 s @75 s — log-spectral distance in dB at each
 * legal MP3 bitrate. Only these three sources have dense curves.
 *
 * EXPORTED (E4/S3/S4) because the lossy window-deficit costing needs the same
 * ladders the planner uses, and a second copy of a measured table is how the
 * two rung tables came to disagree (rungs.mjs).
 */
export const MEASURED_LOSSY_CURVES = Object.fromEntries(
  Object.entries({
    pb1: [[320, 0.422], [256, 0.496], [192, 0.669], [160, 0.822], [128, 1.796], [112, 2.969], [96, 4.434],
          [80, 5.654], [64, 6.849], [48, 8.265], [40, 9.69], [32, 12.395]],
    pb6: [[320, 0.56], [256, 0.63], [192, 0.87], [160, 0.8], [128, 0.99], [112, 0.89], [96, 0.95],
          [80, 1.04], [64, 1.73], [56, 2.66], [48, 4.22], [40, 6.7], [32, 9.88]],
    pb8: [[320, 0.266], [256, 0.334], [192, 0.45], [128, 0.588], [96, 1.036], [80, 3.998], [64, 11.167],
          [56, 12.963], [48, 18.81], [32, 25.574]],
    /**
     * pb4 — Beethoven String Quartet Op. 18 No. 6 (E4/S4/S1, 2026-08-18).
     * MEASURED by `curve --family lossy-artifact --source pb4 --start 75`.
     *
     * ADDED BECAUSE pb8 CANNOT SERVE LOSSY (PM ruling RT-79a, option d). pb8 is
     * 110.06 s and holds four usable 20 s windows against the nine the family
     * needs; pb4 is 492.55 s and holds twenty-two. Lossy is per-source and a
     * session stays on one source (RT-65), so its source set does not have to
     * equal pitch and timing's — pb8 keeps its 66 rendered pitch/timing clips
     * and simply does not appear here.
     *
     * BETTER BEHAVED THAN THE SOURCE IT REPLACES: monotone across the whole
     * sweep with no saturation, where pb8 flattens at the bottom. Its
     * transparency anchor is 0.867 dB — the pool's HIGHEST, against pb8's
     * lowest at 0.266 — which is what `rungs.mjs` predicts for dense
     * orchestral texture, and a third material beside solo piano and ambient.
     */
    pb4: [[320, 0.87], [256, 0.9], [192, 1.02], [160, 1.06], [128, 1.24], [112, 1.34], [96, 1.71],
          [80, 2.86], [64, 6.18], [56, 8.39], [48, 12.16], [40, 14.69], [32, 17.74], [24, 19.67]],
  }).map(([k, v]) => [k, v.map(([bitrateKbps, lsdDb]) => ({ bitrateKbps, lsdDb }))]),
);

/**
 * HOW LONG EACH SOURCE ACTUALLY IS, and where its music starts.
 *
 * MEASURED, and recorded as data because the recordings themselves are
 * git-ignored — a test cannot re-probe them, so the numbers a window plan is
 * derived from have to be checkable without the audio. `durationSec` is
 * ffprobe; `leadInSec` is the first 0.5 s frame above −35 dBFS, the same rule
 * `analyze`'s window suggester uses.
 *
 * THIS TABLE EXISTS BECAUSE OF RT-70. A window plan was costed in megabytes and
 * never checked against how long the recordings are, and it asked pb8 for audio
 * starting 10 s past the end of the file. Durations are now a first-class input
 * to planning rather than something discovered when ffmpeg fails.
 */
export const SOURCE_EXTENTS = {
  pb1: { durationSec: 254.48, leadInSec: 0.5 },
  pb6: { durationSec: 219.3, leadInSec: 0 },
  pb4: { durationSec: 492.55, leadInSec: 0.5 },
};

/**
 * The tail fraction treated as possibly-fading, and therefore out of bounds.
 * Same 0.9 the window suggester in `index.mjs` has always used; named here so
 * the planner and the suggester cannot drift apart.
 */
export const NO_FADE_FRACTION = 0.9;

/**
 * Windows per source for the lossy family (PM ruling RT-77a as amended by
 * RT-79a; count confirmed by RT-84a).
 *
 * WHY NINE AND NOT THREE. A staircase revisits the levels near a listener's
 * threshold many times across its ~38 trials. Lossy sessions stay on ONE source
 * (RT-65), so every one of those trials draws from that source's windows alone
 * — at three windows a listener meets the same musical moment a dozen times and
 * begins recognising the CLIP rather than hearing the ARTIFACT. The measurement
 * would then improve across a session for a reason that has nothing to do with
 * their ear, and the retest arc would report it as learning.
 */
export const LOSSY_WINDOWS_PER_SOURCE = 9;

/**
 * Evenly-spaced, non-overlapping window starts for one source.
 *
 * Spread across the whole usable span rather than packed at the front: the
 * windows are meant to be different MUSIC, and nine consecutive 20 s slices off
 * the top of a movement are far more alike than nine spread through it.
 *
 * Throws rather than returning a short list. A source that cannot hold the
 * windows the family needs is a planning decision, not something for the
 * renderer to discover — which is exactly what pb8 turned out to be.
 */
export function lossyWindowsFor(sourceId, { count = LOSSY_WINDOWS_PER_SOURCE, clipSec = 20 } = {}) {
  const ext = SOURCE_EXTENTS[sourceId];
  if (!ext) throw new Error(`lossyWindowsFor: no measured extent for "${sourceId}" (have: ${Object.keys(SOURCE_EXTENTS).join(", ")})`);
  const lo = ext.leadInSec;
  const hi = ext.durationSec * NO_FADE_FRACTION - clipSec;
  if (hi <= lo) throw new Error(`lossyWindowsFor: ${sourceId} has no usable ${clipSec}s window at all`);
  const stride = (hi - lo) / (count - 1);
  if (stride < clipSec) {
    throw new Error(
      `lossyWindowsFor: ${sourceId} cannot hold ${count} non-overlapping ${clipSec}s windows in ` +
        `${(hi - lo + clipSec).toFixed(1)}s of usable audio (stride would be ${stride.toFixed(1)}s)`,
    );
  }
  return Array.from({ length: count }, (_, i) => Math.round(lo + i * stride));
}

/**
 * THE LOSSY WINDOW PLAN OF RECORD — the same discipline as STAIRCASE_WINDOWS.
 *
 * WRITTEN OUT RATHER THAN COMPUTED AT RENDER TIME, deliberately. A plan that
 * re-derives itself would silently change if a duration ever re-probed a
 * fraction differently, and the clip ids carry `startSec` in their filenames —
 * so a shifted window renames every file and orphans whatever response data was
 * recorded against the old name. `renderplan.test.ts` re-derives these from
 * SOURCE_EXTENTS and fails if they disagree, so the table cannot rot either.
 *
 * pb6 IS AT ITS LIMIT and this is worth knowing before anything is changed:
 * 197.4 s of usable audio against the 180 s nine windows need, a stride of
 * 22.2 s against a 20 s clip, and no lead-in silence to give back. Any increase
 * in the count, the clip length, or NO_FADE_FRACTION drops pb6 to eight.
 */
/**
 * THE GENTLEST BITRATE EACH SOURCE'S LOSSY LADDER MAY INCLUDE.
 *
 * MEASURED ACROSS ALL 27 RENDERED WINDOWS (E4/S4/S3, 2026-08-19), not inherited.
 * `lossyLadderForSource` thins a ladder against the curve measured at ONE window
 * (@75 s) and its steps were monotone there — but a fixed bitrate does up to
 * 1.38x different damage on other windows (RT-85a), and at the gentle end that
 * is enough to INVERT the ladder. Five of twenty-seven windows came back
 * non-monotone on the first render, every inversion at the top:
 *
 *     pb1@105s   192k 1.291 dB -> 160k 1.119 dB   (falls)
 *     pb1@157s   192k 1.309    -> 160k 1.159      (falls)
 *     pb4@1s     320k 1.529    -> 192k 1.006      (falls)
 *     pb4@53s    320k 1.246    -> 192k 0.846      (falls)
 *     pb4@106s   320k 1.426    -> 192k 0.997      (falls)
 *
 * `rungs.mjs` already knew the shape of this — "above ~128 kbps the differences
 * are small enough that the curve is NOT MONOTONE… two of five sources reverse
 * below 1.7 dB" — and set its NOMINAL range to start at 2.0 dB. The defect was
 * that `lossyLadderForSource` never applied that reasoning, and built down to
 * 0.42 dB.
 *
 * A FLAT 2.0 dB FLOOR WOULD HAVE BEEN THE WRONG FIX, and this is why the floor
 * is per-source and expressed in kbps: it costs far more range than the data
 * requires (pb1 12->7, pb4 10->6, pb6 7->5). Dropping only the levels that
 * actually invert keeps pb1 and pb4 at NINE levels each and pb6 untouched.
 *
 * WHAT IT COSTS, stated plainly (N3): the instrument can no longer report a
 * threshold gentler than these bitrates. A listener who only detects damage at
 * 320 kbps bottoms out, and the result must say "at or below 160 kbps on this
 * material" rather than inventing a level the ruler cannot order.
 */
export const MEASURED_LOSSY_FLOOR_KBPS = { pb1: 160, pb4: 192, pb6: 112 };

/**
 * The lossy levels one source actually renders — the ladder, floored.
 *
 * THE one place both the planner and the renderer ask, so a floor applied in
 * one and forgotten in the other cannot happen.
 */
export function lossyLevelsForSource(sourceId, { curves = MEASURED_LOSSY_CURVES } = {}) {
  const curve = curves[sourceId];
  if (!curve) throw new Error(`lossyLevelsForSource: no measured curve for "${sourceId}"`);
  const floor = MEASURED_LOSSY_FLOOR_KBPS[sourceId];
  if (floor === undefined) {
    throw new Error(
      `lossyLevelsForSource: no measured monotonicity floor for "${sourceId}" — render its windows and compute one ` +
        `before shipping levels whose damage ordering is unverified`,
    );
  }
  // Lower bitrate = more damage, so the floor is a CEILING on bitrate.
  return lossyLadderForSource(curve).filter((p) => p.bitrateKbps <= floor);
}

export const LOSSY_WINDOWS_DERIVED = {
  pb1: [1, 27, 53, 79, 105, 131, 157, 183, 209],
  pb6: [0, 22, 44, 67, 89, 111, 133, 155, 177],
  pb4: [1, 53, 106, 159, 212, 265, 318, 370, 423],
};

/**
 * WINDOWS DROPPED AFTER MEASUREMENT (PM ruling RT-86a, option a, 2026-08-19).
 *
 * The derivation above places windows before anything is rendered; it knows
 * durations and lead-in, and nothing else. These three were excluded once the
 * audio existed and Layer A had measured it: on each of them pb4's gentlest
 * levels (192k, 128k, and at @53s also 96k) measure LESS damage than that
 * window's own 320 kbps transparency anchor, and two of the three also invert
 * the ladder. A level whose damage is below a manipulation known to be
 * inaudible on that same material is not a trial.
 *
 * THEY ARE A COHERENT GROUP, not scattered noise: @1s, @53s and @106s are the
 * quiet opening of a Beethoven Adagio, where there is little high-frequency
 * content for a codec to discard, so the anchor and the damage converge.
 *
 * THE TRADE, and the PM ruled it explicitly: pb4 keeps its full 192k->32k
 * ladder on SIX windows rather than a truncated 80k->32k ladder on nine. Both
 * cost exactly 54 clips. Range won because 96-192 kbps is where most listeners'
 * thresholds sit, and a truncated ladder would bottom out on exactly those
 * people. The cost is real and is stated: pb4 serves six windows against pb1's
 * and pb6's nine, so a pb4 session repeats each musical moment more often.
 */
export const LOSSY_EXCLUDED_WINDOWS = {
  pb4: [1, 53, 106],
};

/** The windows a source actually renders: derived, minus what measurement removed. */
export const LOSSY_WINDOWS = Object.fromEntries(
  Object.entries(LOSSY_WINDOWS_DERIVED).map(([id, w]) => [
    id,
    w.filter((start) => !(LOSSY_EXCLUDED_WINDOWS[id] ?? []).includes(start)),
  ]),
);

export function levelsPerSource(sourceId, curves = {}) {
  const lossyCurve = curves[sourceId];
  return {
    "pitch-drift": STAIRCASE_LEVELS["pitch-drift"].values.length,
    "timing-smear": STAIRCASE_LEVELS["timing-smear"].values.length,
    "lossy-artifact": lossyCurve ? lossyLadderForSource(lossyCurve).length : null,
  };
}

/**
 * WINDOWS CAN DIFFER PER SOURCE, and they have to (E4/S3, PM ruling RT-70a).
 *
 * The plan was costed in megabytes and never checked against how long the
 * recordings actually are. pb8 is 110.06 s; the approved 120 s window would
 * have started 20 s of audio at a point 10 s past the end of the file. Two of
 * three sources are long enough and one is not, so one window list for all
 * sources cannot express the plan.
 *
 * @param windows either an array (the same windows for every source) or an
 *   object keyed by sourceId. A source missing from the object is an error
 *   rather than a source with no windows — silently rendering nothing for it is
 *   how a plan comes to disagree with what is on disk.
 */
export function windowsForSource(sourceId, windows) {
  if (Array.isArray(windows)) return windows;
  const w = windows?.[sourceId];
  if (!w?.length) {
    throw new Error(
      `renderPlan: no windows for source "${sourceId}" (have: ${Object.keys(windows ?? {}).join(", ") || "none"})`,
    );
  }
  return w;
}

/**
 * The full crossed design, as a list of files to produce.
 *
 * Returns `entries` (one row per file), plus the counts `refs`, `degraded` and
 * `clips`, and `unknownLossy` — the sources whose lossy ladder could not be
 * computed because no measured curve was supplied.
 *
 * (Written as prose, not as `@returns {a, b, c}`: braces there are read as a
 * TYPE by the checker, which inferred `any[]` and made every caller's field
 * access an error.)
 */
export function renderPlan({ sources, windows, curves = {} }) {
  if (!sources?.length) throw new Error("renderPlan: need at least one source");
  const anyWindows = Array.isArray(windows) ? windows.length : Object.keys(windows ?? {}).length;
  if (!anyWindows) throw new Error("renderPlan: need at least one window");
  const entries = [];
  const unknownLossy = [];

  for (const sourceId of sources) {
    const perFamily = levelsPerSource(sourceId, curves);
    if (perFamily["lossy-artifact"] === null) unknownLossy.push(sourceId);
    for (const startSec of windowsForSource(sourceId, windows)) {
      // One clean reference per window, shared by all three families. Rendering
      // one per family would triple the reference count for identical audio.
      entries.push({ sourceId, startSec, family: null, level: null, kind: "reference" });

      for (const family of ["pitch-drift", "timing-smear"]) {
        for (const level of STAIRCASE_LEVELS[family].values) {
          entries.push({ sourceId, startSec, family, level, kind: "degraded" });
        }
      }
      const ladder = curves[sourceId] ? lossyLadderForSource(curves[sourceId]) : [];
      for (const p of ladder) {
        entries.push({
          sourceId,
          startSec,
          family: "lossy-artifact",
          level: p.lsdDb,
          bitrateKbps: p.bitrateKbps,
          kind: "degraded",
        });
      }
    }
  }

  const refs = entries.filter((e) => e.kind === "reference").length;
  return { entries, refs, degraded: entries.length - refs, clips: entries.length, unknownLossy };
}

/** Megabytes on disk, from measured per-clip bytes. */
export function planCost(plan, { formats = FORMATS_PER_CLIP } = {}) {
  const files = plan.clips * formats;
  return {
    files,
    meanMB: (files * MEASURED_CLIP_BYTES.mean) / 1024 / 1024,
    maxMB: (files * MEASURED_CLIP_BYTES.max) / 1024 / 1024,
  };
}

export async function renderPlanCli(args = []) {
  const json = args.includes("--json");
  const opt = (name, dflt) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? args[i + 1] : dflt;
  };
  const sources = opt("sources", "pb1,pb6,pb8").split(",").map((s) => s.trim());
  // Default to the per-source plan of record; `--windows 30,75,120` still
  // overrides it uniformly, which is what the cost table below wants.
  const windowsArg = opt("windows", null);
  const windows = windowsArg ? windowsArg.split(",").map(Number) : STAIRCASE_WINDOWS;

  const CURVES = MEASURED_LOSSY_CURVES;
  const curves = CURVES;

  const plan = renderPlan({ sources, windows, curves });
  const cost = planCost(plan);

  if (json) {
    console.log(JSON.stringify({ sources, windows, plan, cost }, null, 2));
    return { plan, cost };
  }

  const totalWindows = sources.reduce((n, s) => n + windowsForSource(s, windows).length, 0);
  console.log(`E4 render plan — ${sources.length} sources, ${totalWindows} windows`);
  for (const sourceId of sources) {
    const per = levelsPerSource(sourceId, curves);
    const w = windowsForSource(sourceId, windows);
    console.log(
      `  ${sourceId.padEnd(5)} windows ${w.map((x) => `${x}s`).join("/").padEnd(14)} pitch ${String(per["pitch-drift"]).padStart(2)} · timing ${String(per["timing-smear"]).padStart(2)} · ` +
        `lossy ${per["lossy-artifact"] === null ? "?? (no measured curve)" : String(per["lossy-artifact"]).padStart(2)}`,
    );
  }
  console.log(`\n  ${plan.refs} references + ${plan.degraded} degraded = ${plan.clips} clips`);
  console.log(`  at ${FORMATS_PER_CLIP} delivery format: ${cost.files} files`);
  console.log(`  ${cost.meanMB.toFixed(1)} MB expected · ${cost.maxMB.toFixed(1)} MB worst case`);
  if (plan.unknownLossy.length) {
    console.log(`  NOTE ${plan.unknownLossy.join(", ")} have no measured curve — their lossy levels are NOT in this count.`);
  }

  console.log(`\n  --- what a bigger or smaller design costs (expected MB, one format) ---`);
  console.log(`   sources  windows   clips     MB`);
  // Only over the sources actually given: the first draft looped s = 2,3,4
  // against a three-source list, so `slice(0, 4)` silently returned three and
  // the 4-source rows printed the 3-source numbers. A cost table that invents
  // a row is worse than one that stops short.
  for (let s = 2; s <= sources.length; s++) {
    for (let w = 1; w <= 4; w++) {
      const p = renderPlan({
        sources: sources.slice(0, s),
        windows: Array.from({ length: w }, (_, i) => 30 + i * 45),
        curves,
      });
      console.log(
        `  ${String(s).padStart(8)} ${String(w).padStart(8)} ${String(p.clips).padStart(7)} ${planCost(p).meanMB.toFixed(1).padStart(6)}`,
      );
    }
  }
  return { plan, cost };
}
