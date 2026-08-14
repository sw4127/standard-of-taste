/**
 * Measure the SHIPPED pool in each family's own physical unit (E2/S1).
 *
 *   node scripts/clip-pipeline/index.mjs sweep [--family <name>] [--json]
 *
 * WHY THIS EXISTS. The evidence that the cents ruler works on real audio — the
 * six-clip table in docs/handoff-2026-08-14b.md — was produced by a throwaway
 * script that no longer exists. A measurement nobody can re-run is a claim, not
 * a result, and this project's whole position is that its numbers are checkable.
 *
 * WHAT IT IS NOT. `validate` decides PASS/FLAG; this decides nothing. It exists
 * to show the relationship between a rung's PARAMETER and its MEASURED
 * magnitude, which is the question the ladder re-spacing turns on. Keeping the
 * two apart means the spacing work cannot quietly become a way of moving gates.
 *
 * THE RAMP MODEL, and why the prediction column is honest. pitch-drift and
 * timing-smear are rendered segment-wise: segment k of SEGS carries
 * param*(k+0.5)/SEGS, so a clip SPANS 5%..95% of its rung rather than sitting
 * at it. The predicted peak is therefore param*(SEGS-0.5)/SEGS, derived from
 * the renderer's own exported constant rather than a copied 0.95. A measured
 * value near the prediction says the ruler and the renderer agree; it is not an
 * independent ground truth, and pitch.test.ts carries that separately against
 * synthesised signals whose detune is known exactly.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { measurePair } from "./validate.mjs";
import { SEGS } from "./degrade.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DELICACY_MANIFEST = join(ROOT, "src", "content", "delicacy", "manifest.json");

/** Peak of the segment ramp, as a fraction of the rung parameter. */
export const RAMP_PEAK_FRACTION = (SEGS - 0.5) / SEGS;

/**
 * Each family's headline number, in the unit that family is actually gated in.
 * `predict` returns null where no ramp model applies (lossy is a whole-file
 * re-encode, not a segment ramp, so there is nothing to predict).
 *
 * PARAM KEYS ARE EXACT, NOT A FALLBACK CHAIN. The first version of this read
 * `p.params?.maxDeviation ?? p.params?.deviation` for timing-smear — both
 * wrong, the real key is `maxDevPct` — and it printed "undefined" in the param
 * column rather than failing. `rungs.test.ts` already carries a fallback chain
 * of exactly this shape (`peakCents ?? cents ?? maxCents`) and it is on the
 * open-work list for the same reason: a chain of guesses cannot tell "the key
 * was renamed" from "the value is absent", so it degrades silently instead of
 * saying so. `paramFor` throws.
 */
const FAMILY_VIEW = {
  "pitch-drift": {
    unit: "cents",
    paramKey: "peakCents",
    measured: (m) => m.pitchP95Cents,
    extra: (m) => `median ${m.pitchMedianCents}  range ${m.pitchRangeCents}  conf ${(m.pitchConfidentFraction * 100).toFixed(0)}%`,
    predict: (param) => param * RAMP_PEAK_FRACTION,
  },
  "timing-smear": {
    unit: "ms drift",
    paramKey: "maxDevPct",
    measured: (m) => m.driftIqrMs,
    extra: (m) => `range ${m.driftRangeMs} ms  conf ${(m.driftConfidentFraction * 100).toFixed(0)}%`,
    // Segment deviations are drawn randomly and mean-corrected, so the peak is
    // not a fixed fraction of maxDevPct the way the pitch ramp is. Predicting
    // one would be inventing a model. S3 measures the relationship instead.
    predict: () => null,
  },
  "lossy-artifact": {
    unit: "dB LSD",
    paramKey: "bitrate",
    measured: (m) => m.lsdDb,
    extra: (m) => `x anchor is per-source; see validate`,
    predict: () => null,
  },
};

/** Exact key, or a loud failure. See the note on FAMILY_VIEW. */
function paramFor(pair, view) {
  const v = pair.params?.[view.paramKey];
  if (v === undefined || v === null) {
    throw new Error(
      `sweep: ${pair.id} (${pair.family}) has no params.${view.paramKey} — the manifest key was renamed, or this pair was never rendered with a recorded parameter`,
    );
  }
  return v;
}

export async function sweep(args = []) {
  const json = args.includes("--json");
  const fIdx = args.indexOf("--family");
  const only = fIdx >= 0 ? args[fIdx + 1] : null;
  if (only && !FAMILY_VIEW[only]) {
    throw new Error(`unknown family "${only}" (know: ${Object.keys(FAMILY_VIEW).join(", ")})`);
  }

  const manifest = JSON.parse(readFileSync(DELICACY_MANIFEST, "utf8"));
  const pairs = (manifest.pairs ?? []).filter((p) => (only ? p.family === only : true));
  if (pairs.length === 0) throw new Error(`sweep: no pairs${only ? ` for family "${only}"` : ""}`);

  const rows = [];
  for (const p of pairs) {
    const view = FAMILY_VIEW[p.family];
    if (!view) continue;
    const m = measurePair(p);
    if (m.error) {
      rows.push({ id: p.id, family: p.family, error: m.error });
      continue;
    }
    const param = paramFor(p, view);
    const measured = view.measured(m);
    const predicted = view.predict(param);
    rows.push({
      id: p.id,
      family: p.family,
      rung: p.magnitude,
      param,
      unit: view.unit,
      measured,
      predicted,
      error: null,
      err: predicted == null || measured == null ? null : +(measured - predicted).toFixed(2),
      extra: view.extra(m),
    });
  }

  if (json) {
    console.log(JSON.stringify({ rampPeakFraction: RAMP_PEAK_FRACTION, segments: SEGS, rows }, null, 2));
    return;
  }

  const byFamily = new Map();
  for (const r of rows) {
    if (!byFamily.has(r.family)) byFamily.set(r.family, []);
    byFamily.get(r.family).push(r);
  }
  for (const [family, fRows] of byFamily) {
    const view = FAMILY_VIEW[family];
    console.log(`\n${family} — measured in ${view.unit}`);
    if (view.predict(1) != null) {
      console.log(
        `  ramp model: segment k of ${SEGS} carries param*(k+0.5)/${SEGS}, so a clip spans ` +
          `${((1 / (2 * SEGS)) * 100).toFixed(0)}%..${(RAMP_PEAK_FRACTION * 100).toFixed(0)}% of its rung`,
      );
    }
    console.log("  id     rung   param   predicted   measured      err   detail");
    // Sort by RUNG, not by param: lossy parameters are strings ("96k"), and
    // subtracting them yields NaN, which left the table in manifest order while
    // looking sorted. Rung is the ladder's own ordering and is always numeric.
    for (const r of fRows.sort((a, b) => a.rung - b.rung || a.id.localeCompare(b.id))) {
      if (r.error) {
        console.log(`  ${r.id.padEnd(6)} ERROR  ${r.error}`);
        continue;
      }
      console.log(
        `  ${r.id.padEnd(6)} ${String(r.rung).padStart(4)}   ${String(r.param).padStart(5)}   ` +
          `${(r.predicted == null ? "—" : r.predicted.toFixed(1)).padStart(9)}   ` +
          `${(r.measured == null ? "—" : Number(r.measured).toFixed(1)).padStart(8)}   ` +
          `${(r.err == null ? "—" : (r.err >= 0 ? "+" : "") + r.err.toFixed(1)).padStart(6)}   ${r.extra}`,
      );
    }
  }
  console.log(
    `\n  NOTE  MAGNITUDES, not audibility. The "predicted" column checks the ruler against the\n` +
      `        RENDERER's ramp model — the two agreeing is consistency, not ground truth. Ground\n` +
      `        truth for the cents ruler is pitch.test.ts, against synthesised known detunes.`,
  );
}
