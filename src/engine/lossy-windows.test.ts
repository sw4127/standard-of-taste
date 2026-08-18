/**
 * THE LOSSY WINDOW DEFICIT, COSTED (E4/S3/S4, 2026-08-18).
 *
 * THE PROBLEM, stated by `instancesForFamily` and asserted by
 * `trial-instances.test.ts` so it could not be forgotten: pitch and timing POOL
 * their windows across every source, because a cent is a cent and a millisecond
 * is a millisecond. Lossy cannot. Its ladder is built from the bitrates the
 * encoder has on THAT material and labelled with the damage measured there
 * (PM ruling RT-65a), so a level means something different on a different
 * recording and a session must stay on one source.
 *
 * The consequence is a budget the approved plan does not fund: a lossy session
 * draws from the 3 windows of ONE source, against a repeat load that E4/S2
 * measured at a median of 12 trials on the most-visited level. Pitch and timing
 * meet that load with 9 windows; lossy meets it with 3.
 *
 * Nobody had costed the fix. This does, in the two currencies that matter — how
 * often a listener meets the same file, and what buying it down costs in
 * megabytes and render minutes.
 *
 * WHAT A REPEAT COSTS, so the table below can be read: after the third or fourth
 * encounter with one clip a listener can recognise the RECORDING rather than
 * hearing the FLAW. Their accuracy then improves for a reason that has nothing
 * to do with their ear, and the retest arc — whose whole job is detecting
 * whether the ear moved — reports it as movement (D4 amendment, N3).
 *
 * SIMULATED (N3): zero real responses. The repeat load comes from the real
 * staircase driven by a simulated listener.
 */
import { describe, expect, it } from "vitest";
import { observer as obs, runStaircaseSession, type Observer } from "@/analytics/observer";
import { DEFAULT_STAIRCASE, type StaircaseConfig } from "./staircase";
import { assignInstances, type TrialInstance } from "./trial-instances";
import { MEASURED_CLIP_BYTES } from "../../scripts/clip-pipeline/renderplan.mjs";
import { MEASURED_LOSSY_CURVES } from "../../scripts/clip-pipeline/renderplan.mjs";
import { lossyLadderForSource } from "../../scripts/clip-pipeline/rungs.mjs";

/** Measured: 198 clips in 227.5 s on the render machine (E4/S3). */
const SECONDS_PER_CLIP = 227.5 / 198;

const SESSIONS = 2000;
const WINDOW_COUNTS = [3, 6, 9, 12];

const quantile = (v: number[], q: number) => {
  const s = [...v].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(q * s.length))];
};

const windows = (n: number): TrialInstance[] =>
  Array.from({ length: n }, (_, i) => ({ sourceId: "pb1", startSec: 30 + i * 25 }));

/**
 * Worst number of times ONE session meets the same clip at the same level.
 *
 * This is the quantity that matters, not the number of trials on a level: nine
 * trials spread over nine files is not a repeat problem and nine on one file is.
 */
function worstRepeat(levels: number[], o: Observer, instanceCount: number, cfg: StaircaseConfig) {
  const worst: number[] = [];
  for (let s = 1; s <= SESSIONS; s++) {
    const { state } = runStaircaseSession(o, s * 7919, cfg);
    const seq = state.trials.map((t) => t.index);
    const picked = assignInstances(seq, windows(instanceCount), s * 7919);
    const counts = new Map<string, number>();
    for (let i = 0; i < seq.length; i++) {
      const k = `${seq[i]}/${picked[i].sourceId}@${picked[i].startSec}`;
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    worst.push(Math.max(...counts.values()));
  }
  return worst;
}

describe("E4/S3/S4 — what fixing the lossy window deficit costs [SIMULATED]", () => {
  it("prices more windows against the repeats they buy down", { timeout: 240_000 }, () => {
    // Lossy ladders are per source and their LENGTHS differ, which changes both
    // the staircase's behaviour and the render cost. All three are priced.
    const ladders = Object.fromEntries(
      Object.entries(MEASURED_LOSSY_CURVES).map(([id, curve]) => [id, lossyLadderForSource(curve).map((p: { lsdDb: number }) => p.lsdDb)]),
    ) as Record<string, number[]>;

    console.log(`\n[E4/S4] === THE LOSSY WINDOW DEFICIT, COSTED [SIMULATED] ===`);
    console.log(`[E4/S4] Lossy is source-locked (RT-65a), so a session draws from ONE source's windows.`);
    console.log(`[E4/S4] Pitch and timing pool across all sources and get 9; lossy gets 3.`);
    console.log(`[E4/S4] measured lossy ladders: ${Object.entries(ladders).map(([k, v]) => `${k} ${v.length} levels`).join(" · ")}`);

    const rows: Array<{ sourceId: string; nWindows: number; median: number; p90: number; max: number; addedClips: number; addedMB: number; addedMin: number }> = [];

    for (const [sourceId, levels] of Object.entries(ladders)) {
      const cfg: StaircaseConfig = { ...DEFAULT_STAIRCASE, levels, startIndex: Math.max(0, levels.length - 3) };
      // A listener whose threshold sits mid-ladder — the case that parks longest.
      const o = obs(levels[Math.floor(levels.length / 2)], 0.35);
      for (const n of WINDOW_COUNTS) {
        const w = worstRepeat(levels, o, n, cfg);
        // Marginal cost of going from the funded 3 windows to n, on THIS source:
        // each extra window needs one reference plus that source's lossy levels.
        const extra = Math.max(0, n - 3);
        const addedClips = extra * (1 + levels.length);
        rows.push({
          sourceId,
          nWindows: n,
          median: quantile(w, 0.5),
          p90: quantile(w, 0.9),
          max: Math.max(...w),
          addedClips,
          addedMB: (addedClips * MEASURED_CLIP_BYTES.mean) / 1024 / 1024,
          addedMin: (addedClips * SECONDS_PER_CLIP) / 60,
        });
      }
    }

    console.log(`\n[E4/S4] worst same-clip-same-level repeats in ONE session, and what the windows cost`);
    console.log(`[E4/S4] ${"source".padEnd(7)}${"windows".padStart(8)}${"median".padStart(8)}${"p90".padStart(6)}${"max".padStart(6)}` +
      `${"+clips".padStart(8)}${"+MB".padStart(7)}${"+min".padStart(7)}`);
    for (const r of rows) {
      console.log(
        `[E4/S4] ${r.sourceId.padEnd(7)}${String(r.nWindows).padStart(8)}${String(r.median).padStart(8)}${String(r.p90).padStart(6)}` +
          `${String(r.max).padStart(6)}${String(r.addedClips).padStart(8)}${r.addedMB.toFixed(1).padStart(7)}${r.addedMin.toFixed(1).padStart(7)}`,
      );
    }

    // The baseline the fix is measured against: pitch and timing, pooled.
    const pitchLevels = [3.1, 4.4, 6.3, 8.8, 12.5, 17.7, 25, 35.4, 50, 70.7, 100];
    const pitchCfg: StaircaseConfig = { ...DEFAULT_STAIRCASE, levels: pitchLevels, startIndex: pitchLevels.length - 3 };
    const pooled = worstRepeat(pitchLevels, obs(25, 0.35), 9, pitchCfg);
    console.log(
      `\n[E4/S4] BASELINE — pitch pooled over 9 windows: median ${quantile(pooled, 0.5)} · p90 ${quantile(pooled, 0.9)} · max ${Math.max(...pooled)}`,
    );
    console.log(`[E4/S4] Timing draws from 7 after RT-75a excluded pb1@120s and pb6@75s.`);

    // The claim this test exists to support: three windows is materially worse
    // than the pooled baseline, and it is buyable. Asserted rather than only
    // printed, so a change to the staircase that alters the repeat load fails
    // here instead of quietly making the costing stale.
    const at3 = rows.filter((r) => r.nWindows === 3);
    const at9 = rows.filter((r) => r.nWindows === 9);
    expect(Math.max(...at3.map((r) => r.p90))).toBeGreaterThan(quantile(pooled, 0.9));
    expect(Math.max(...at9.map((r) => r.p90))).toBeLessThanOrEqual(Math.max(...at3.map((r) => r.p90)));
    for (const r of rows) expect(r.addedClips).toBeGreaterThanOrEqual(0);
  });
});
