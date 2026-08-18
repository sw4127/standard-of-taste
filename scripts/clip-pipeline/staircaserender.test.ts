/**
 * The staircase renderer's SPEC (E4/S3).
 *
 * WHAT THIS CAN AND CANNOT CHECK, stated for the same reason validate.test.ts
 * states it: the source cache is git-ignored, so nothing here can render audio,
 * and a test that skipped silently when the cache is absent would report green
 * while proving nothing. The measured evidence that these levels render to the
 * magnitudes they claim is the `staircase-render` run itself, quoted in the
 * session record and recorded in src/content/delicacy/staircase.json.
 *
 * What IS checkable here is every property that does not need audio: the window
 * plan fits inside the recordings, the naming cannot be renumbered out from
 * under the response data, the seed is stable, the ramp prediction is derived
 * rather than copied, the timing ladder is feasible at every window's seed, and
 * the monotonicity check actually rejects a ladder that ties.
 */
import { describe, expect, it } from "vitest";
import {
  MAX_CROSS_WINDOW_RATIO,
  MAX_LEVEL_ERR_PCT,
  PITCH_RAMP_PEAK_FRACTION,
  STAIRCASE_RENDER_FAMILIES,
  clipId,
  crossWindowAgreement,
  ladderMonotone,
  nextCalibrationParam,
  refId,
  windowSeed,
} from "./staircaserender.mjs";
import { MIN_LOSSY_LEVEL_RATIO } from "./rungs.mjs";
import { STAIRCASE_WINDOWS, renderPlan, windowsForSource } from "./renderplan.mjs";
import { STAIRCASE_LEVELS, staircaseRender } from "./rungs.mjs";
import { SEGS, timingDeviations } from "./degrade.mjs";

/**
 * MEASURED by ffprobe, 2026-08-18, on the cached sources. Duplicated here as a
 * REGRESSION PIN rather than as a source of truth: the renderer probes the real
 * files at pre-flight, and this exists so that a window plan which does not fit
 * fails in the test suite too — not only in a seven-minute render.
 *
 * pb8's 110.06 s is the whole reason RT-70a exists.
 */
const SOURCE_DURATION_SEC: Record<string, number> = { pb1: 254.48, pb6: 219.3, pb8: 110.06 };
const CLIP_SEC = 20;

const plan = (args: { sources: string[]; windows: number[] | Record<string, number[]> }) => renderPlan(args);

describe("staircase window plan", () => {
  it.each(Object.keys(STAIRCASE_WINDOWS))("every %s window fits inside the recording", (sourceId) => {
    const dur = SOURCE_DURATION_SEC[sourceId];
    expect(dur, `no measured duration pinned for ${sourceId}`).toBeGreaterThan(0);
    for (const startSec of STAIRCASE_WINDOWS[sourceId as keyof typeof STAIRCASE_WINDOWS]) {
      expect(startSec + CLIP_SEC, `${sourceId}@${startSec}s runs past the end of a ${dur}s recording`).toBeLessThanOrEqual(dur);
    }
  });

  it("gives every source three non-overlapping windows", () => {
    for (const [sourceId, windows] of Object.entries(STAIRCASE_WINDOWS)) {
      expect(windows.length, sourceId).toBe(3);
      const sorted = [...windows].sort((a, b) => a - b);
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i] - sorted[i - 1], `${sourceId} windows ${sorted[i - 1]}/${sorted[i]} overlap`).toBeGreaterThanOrEqual(CLIP_SEC);
      }
    }
  });

  /**
   * pb8's lossy curve was measured at 75 s. Losing that window would mean the
   * per-source ladder E4/S4 renders was solved against material no clip uses.
   */
  it("keeps the 75s window on every source, where the lossy curves were measured", () => {
    for (const [sourceId, windows] of Object.entries(STAIRCASE_WINDOWS)) {
      expect(windows, sourceId).toContain(75);
    }
  });
});

describe("renderPlan — per-source windows", () => {
  it("accepts an object and crosses each source with its OWN windows", () => {
    const p = plan({ sources: ["pb1", "pb8"], windows: { pb1: [30, 75], pb8: [15] } });
    const windowsOf = (s: string) => [...new Set(p.entries.filter((e) => e.sourceId === s).map((e) => e.startSec))].sort((a, b) => a - b);
    expect(windowsOf("pb1")).toEqual([30, 75]);
    expect(windowsOf("pb8")).toEqual([15]);
    // 3 windows x (1 ref + 11 pitch + 10 timing); no curves, so no lossy.
    expect(p.clips).toBe(3 * 22);
    expect(p.refs).toBe(3);
  });

  it("still accepts a plain array, applied to every source", () => {
    expect(plan({ sources: ["pb1", "pb6"], windows: [30, 75, 120] }).refs).toBe(6);
  });

  /**
   * A source with no windows must be an error. Returning zero entries for it
   * would make the plan and the disk disagree without anything saying so —
   * the same class of silence RT-70 came out of.
   */
  it("refuses a source the window plan does not name", () => {
    expect(() => windowsForSource("pb9", STAIRCASE_WINDOWS)).toThrow(/no windows for source "pb9"/);
    expect(() => plan({ sources: ["pb9"], windows: STAIRCASE_WINDOWS })).toThrow(/pb9/);
  });

  it("plans exactly the 198 pitch/timing/reference clips E4/S3 renders", () => {
    const p = plan({ sources: Object.keys(STAIRCASE_WINDOWS), windows: STAIRCASE_WINDOWS });
    expect(p.refs).toBe(9);
    expect(p.clips).toBe(198);
    expect(p.entries.filter((e) => e.family === "pitch-drift")).toHaveLength(99);
    expect(p.entries.filter((e) => e.family === "timing-smear")).toHaveLength(90);
  });
});

describe("clip identity", () => {
  /**
   * THE PROPERTY THAT PROTECTS RESPONSE DATA. A filename keyed by level INDEX
   * silently re-points at a different manipulation the moment a level is
   * inserted — the failure rungs.mjs exists to end. The physical value cannot
   * do that.
   */
  it("names a clip by its physical level, not by an index", () => {
    expect(clipId("pb1", 75, "pitch-drift", 12.5)).toBe("pb1-w75-pitch-12.5");
    expect(clipId("pb8", 15, "timing-smear", 39.7)).toBe("pb8-w15-timing-39.7");
    expect(refId("pb6", 120)).toBe("pb6-w120-ref");
  });

  it("gives every clip in the full plan a unique id", () => {
    const ids = new Set<string>();
    for (const [sourceId, windows] of Object.entries(STAIRCASE_WINDOWS)) {
      for (const startSec of windows) {
        ids.add(refId(sourceId, startSec));
        for (const family of STAIRCASE_RENDER_FAMILIES) {
          for (const level of STAIRCASE_LEVELS[family as keyof typeof STAIRCASE_LEVELS].values) {
            ids.add(clipId(sourceId, startSec, family, level));
          }
        }
      }
    }
    expect(ids.size).toBe(198);
  });
});

describe("window seed", () => {
  it("is stable, and differs per window", () => {
    expect(windowSeed("pb1", 75)).toBe(windowSeed("pb1", 75));
    const seeds = Object.entries(STAIRCASE_WINDOWS).flatMap(([s, ws]) => ws.map((w) => windowSeed(s, w)));
    expect(new Set(seeds).size, "two windows share a seed — they would share a random walk").toBe(seeds.length);
  });

  /**
   * `driftMs` scales a seeded walk to hit the stated drift, so a flat draw
   * needs a big scale factor and trips the 25% per-segment ceiling. Checked
   * here as well as at pre-flight so a window plan that cannot render fails in
   * seconds rather than at clip 190 of 198.
   */
  it("renders every timing level at every window without exceeding the tempo ceiling", () => {
    for (const [sourceId, windows] of Object.entries(STAIRCASE_WINDOWS)) {
      for (const startSec of windows) {
        const seed = windowSeed(sourceId, startSec);
        for (const level of STAIRCASE_LEVELS["timing-smear"].values) {
          expect(() => timingDeviations({ mode: "driftMs", param: level, seed, clipSec: CLIP_SEC }),
            `${sourceId}@${startSec}s level ${level}`).not.toThrow();
        }
      }
    }
  });
});

describe("render mode", () => {
  /**
   * The reason the renderer never calls degradeWavParam positionally: that path
   * cannot pass driftMs, and the legacy mode spreads 5.3x across seeds.
   */
  it("carries driftMs for timing and nothing for pitch", () => {
    expect(staircaseRender("timing-smear", 25).opts).toEqual({ timingMode: "driftMs" });
    expect(staircaseRender("pitch-drift", 25).opts).toEqual({});
  });

  it("refuses lossy, which is per-source and belongs to E4/S4", () => {
    expect(() => staircaseRender("lossy-artifact", 2.0)).toThrow(/per-source/);
    expect(STAIRCASE_RENDER_FAMILIES).not.toContain("lossy-artifact");
  });
});

describe("pitch ramp prediction", () => {
  /**
   * DERIVED, not copied. Segment k carries param*(k+0.5)/SEGS, so the peak sits
   * at (SEGS-0.5)/SEGS of the requested value. Writing 0.95 here would be a
   * second copy of a constant that lives in degrade.mjs.
   */
  it("is (SEGS - 0.5) / SEGS", () => {
    expect(PITCH_RAMP_PEAK_FRACTION).toBeCloseTo((SEGS - 0.5) / SEGS, 12);
    expect(PITCH_RAMP_PEAK_FRACTION).toBeCloseTo(0.95, 12);
  });
});

describe("ladderMonotone", () => {
  const row = (value: number) => ({ measured: { value } }) as never;

  it("accepts a strictly increasing measured series", () => {
    expect(ladderMonotone([row(11.9), row(16.8), row(23.8)]).monotone).toBe(true);
  });

  /**
   * A TIE IS A FAILURE, not a rounding detail. Two levels the ruler cannot tell
   * apart are one level, and a staircase stepping between them reports a
   * precision it does not have (N3). This is exactly what the broken lossy
   * solver did — three levels, one audio file.
   */
  it("rejects a tie", () => {
    const r = ladderMonotone([row(11.9), row(16.8), row(16.8)]);
    expect(r.monotone).toBe(false);
    expect(r.breaks).toEqual([{ at: 2, prev: 16.8, value: 16.8 }]);
  });

  it("rejects an inversion and reports where", () => {
    const r = ladderMonotone([row(11.9), row(23.8), row(16.8)]);
    expect(r.monotone).toBe(false);
    expect(r.breaks).toHaveLength(1);
    expect(r.breaks[0].at).toBe(2);
  });
});

describe("crossWindowAgreement", () => {
  const clip = (sourceId: string, startSec: number, family: string, level: number, value: number) =>
    ({ kind: "degraded", sourceId, startSec, family, level, measured: { value } }) as never;

  /**
   * THE CHECK A PER-WINDOW LADDER CANNOT DO. `assignInstances` cycles a level's
   * windows within one session, so two files carrying the same label must carry
   * the same magnitude — otherwise the staircase's step size varies at random
   * between trials, which is the E2/S4b defect one level up.
   */
  it("compares the same level across the windows serving it", () => {
    const rows = crossWindowAgreement([
      clip("pb1", 75, "timing-smear", 50, 54),
      clip("pb6", 30, "timing-smear", 50, 44),
      clip("pb1", 75, "pitch-drift", 100, 95.16),
      clip("pb6", 30, "pitch-drift", 100, 95.18),
    ]);
    expect(rows).toHaveLength(2);
    const timing = rows.find((r) => r.family === "timing-smear")!;
    expect(timing.ratio).toBeCloseTo(54 / 44, 3);
    expect(timing.ratio).toBeGreaterThan(MAX_CROSS_WINDOW_RATIO);
    const pitch = rows.find((r) => r.family === "pitch-drift")!;
    expect(pitch.ratio).toBeLessThan(MAX_CROSS_WINDOW_RATIO);
  });

  /** A level served by one window has nothing to disagree with — not a pass. */
  it("says nothing about a level only one window serves", () => {
    expect(crossWindowAgreement([clip("pb1", 75, "timing-smear", 50, 54)])).toEqual([]);
  });

  it("ignores references, which have no measured magnitude", () => {
    const rows = crossWindowAgreement([
      { kind: "reference", sourceId: "pb1", startSec: 75 } as never,
      clip("pb1", 75, "timing-smear", 50, 54),
      clip("pb6", 30, "timing-smear", 50, 53),
    ]);
    expect(rows).toHaveLength(1);
  });
});

describe("calibration step rule", () => {
  it("steps proportionally toward the level", () => {
    // Measured high => ask for less, in the same ratio.
    expect(nextCalibrationParam(100, 130, 100)).toBeCloseTo(76.923, 3);
    expect(nextCalibrationParam(50, 44, 50)).toBeCloseTo(56.818, 3);
    // Already there => do not move.
    expect(nextCalibrationParam(25, 25, 25)).toBe(25);
  });

  /** A drift of zero carries no direction to step in; solving from it would
   *  divide by zero and silently produce Infinity as a render parameter. */
  it("refuses to solve from a zero or missing measurement", () => {
    expect(() => nextCalibrationParam(50, 0, 50)).toThrow(/cannot solve/);
    expect(() => nextCalibrationParam(50, NaN, 50)).toThrow(/cannot solve/);
  });

  /**
   * MEASURED, and the reason calibration ships opt-in rather than on (E4/S3/S2).
   * The step rule assumes measured drift rises with requested drift. On pb1@75
   * it does not: a dense sweep of the parameter falls three times as the
   * request rises, so the search has no root to converge on and oscillated
   * 15 -> 14 -> 11 -> 14 -> 11 -> 14 ms over six renders. Pinned here so the
   * assumption is visible at the step rule rather than only in a comment.
   */
  it("documents the assumption it rests on: measured drift rises with requested drift", () => {
    const sweep = [
      { requested: 64, measured: 77 },
      { requested: 68, measured: 64 },
      { requested: 72, measured: 91 },
      { requested: 76, measured: 90 },
      { requested: 80, measured: 95 },
      { requested: 84, measured: 83 },
      { requested: 88, measured: 102 },
      { requested: 92, measured: 126 },
    ];
    const falls = sweep.filter((s, i) => i > 0 && s.measured <= sweep[i - 1].measured).length;
    expect(falls, "if this ever reaches 0, re-run the sweep — the ruler may have been fixed").toBe(3);
  });
});

describe("the gates are the numbers they claim to be", () => {
  /**
   * Pre-registered before the first render, and deliberately NOT widened to fit
   * what timing produced. Pitch clears it at 6.6%; timing does not, and that is
   * the finding rather than a reason to move the line.
   */
  it("pins the labelling tolerance at the pre-registered 15%", () => {
    expect(MAX_LEVEL_ERR_PCT).toBe(15);
  });

  /**
   * Borrowed, not invented: adjacent levels must differ by at least this ratio
   * to be two levels, so two instances of ONE level must differ by less, or
   * they straddle a step.
   */
  it("ties cross-window agreement to the minimum ratio that separates two levels", () => {
    expect(MAX_CROSS_WINDOW_RATIO).toBe(MIN_LOSSY_LEVEL_RATIO);
  });
});
