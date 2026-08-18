/**
 * E4/S5/S3 — the SHIPPED staircase pool, guarded in CI.
 *
 * `staircase-validate` is the stage that judges the pool; this is what stops
 * its verdict rotting. The 198 audio files are git-ignored (RT-71b) so no test
 * can re-measure them, but `src/content/delicacy/staircase.json` IS committed —
 * and it now records a Layer A verdict per clip, the thresholds those verdicts
 * were reached under, and the instrument's computed limits. All of that is
 * checkable without a single sample of audio.
 *
 * WHAT THIS CATCHES, and it is the failure this project keeps having: a
 * constant edited in code while the manifest still carries verdicts reached
 * under the OLD value. The recorded thresholds are compared against the live
 * ones, so moving a floor without re-running goes red instead of silently
 * leaving 198 stale verdicts in place. RT-60a shipped 19 clips the manifest did
 * not describe; this is the same class, one layer up.
 *
 * WHAT IT CANNOT CATCH, stated so nobody reads it as more than it is: whether
 * the audio on disk is still the audio that was measured. Only
 * `staircase-validate` can answer that, because only it can hash the files.
 */

import { describe, expect, it } from "vitest";
import manifest from "../../src/content/delicacy/staircase.json";
import {
  computeKnownLimits,
  eligibleWindows,
  MAX_CLIPPED_FRACTION,
  MAX_FLAT_TOP_FRACTION,
  MAX_QUIET_FRACTION,
  MAX_SILENCE_SEC,
  MIN_CONFIDENT_BLOCK_FRACTION,
  MIN_CONFIDENT_PITCH_FRACTION,
  MIN_MEASURABLE_DRIFT_MS,
  MIN_MEASURABLE_PITCH_CENTS,
} from "./staircasevalidate.mjs";
import { STAIRCASE_RENDER_FAMILIES } from "./staircaserender.mjs";

type Entry = {
  id: string;
  kind: string;
  sourceId: string;
  startSec: number;
  family?: string;
  level?: number;
  layerA?: { verdict: string; reasons: string[]; longestSilenceSec: number; quietFraction: number; preNormClippedFraction: number | null };
};

const m = manifest as unknown as {
  references: Entry[];
  clips: Entry[];
  excludedWindows: { family: string; sourceId: string; startSec: number }[];
  instanceWindows: Record<string, { sourceId: string; startSec: number }[]>;
  crossWindowSpread: { family: string; level: number; n: number; ratio: number }[];
  layerA?: {
    thresholds: Record<string, number>;
    counts: { total: number; pass: number; flag: number; error: number };
    knownLimits: { family: string; level: number; kind: string; statement: string }[];
    excludedWindows: { family: string; sourceId: string; startSec: number }[];
    anchors: { sourceId: string; transparentLsdDb: number; pipelineNoiseLsdDb: number }[];
  };
};
const entries = [...m.references, ...m.clips];

describe("Layer A has actually been run over the shipped pool", () => {
  it("the manifest carries a Layer A block", () => {
    expect(m.layerA).toBeDefined();
  });

  it("every reference and every clip has a verdict — no entry is unjudged", () => {
    const unjudged = entries.filter((e) => !e.layerA?.verdict);
    expect(unjudged.map((e) => e.id)).toEqual([]);
    expect(entries).toHaveLength(198);
  });

  it("the recorded counts agree with the recorded verdicts", () => {
    const tally = (v: string) => entries.filter((e) => e.layerA?.verdict === v).length;
    expect(m.layerA!.counts).toEqual({
      total: entries.length,
      pass: tally("PASS"),
      flag: tally("FLAG"),
      error: tally("ERROR"),
    });
  });

  it("nothing in the pool is unjudgeable", () => {
    // An ERROR means Layer A could not attribute a measurement to a file at
    // all — a hash mismatch, a missing figure, a family with no gate. None of
    // those may ship.
    const errored = entries.filter((e) => e.layerA?.verdict === "ERROR");
    expect(errored.map((e) => `${e.id}: ${e.layerA?.reasons.join("; ")}`)).toEqual([]);
  });
});

describe("every FLAG is a window the renderer had ALREADY excluded", () => {
  // The standing rule (RT-78a, applied to this stage in E4/S5/S2): a recorded
  // exclusion is a known state, a NEW failure is a regression. If this goes red
  // the pool has acquired a failure nobody has ruled on.
  const excluded = new Set(m.excludedWindows.map((e) => `${e.family}/${e.sourceId}@${e.startSec}`));

  it("no clip FLAGs outside an already-excluded window", () => {
    const surprises = entries
      .filter((e) => e.layerA?.verdict === "FLAG")
      .filter((e) => !excluded.has(`${e.family}/${e.sourceId}@${e.startSec}`));
    expect(surprises.map((e) => `${e.id}: ${e.layerA?.reasons.join("; ")}`)).toEqual([]);
  });

  it("no REFERENCE flags — a reference is the A side of every trial in its window", () => {
    const badRefs = m.references.filter((e) => e.layerA?.verdict !== "PASS");
    expect(badRefs.map((e) => e.id)).toEqual([]);
  });

  it("the two known-excluded windows still account for exactly the flagged clips", () => {
    const flagged = entries.filter((e) => e.layerA?.verdict === "FLAG");
    expect(flagged).toHaveLength(16);
    const byWindow = new Map<string, number>();
    for (const e of flagged) {
      const k = `${e.sourceId}@${e.startSec}`;
      byWindow.set(k, (byWindow.get(k) ?? 0) + 1);
    }
    expect(Object.fromEntries(byWindow)).toEqual({ "pb1@120": 10, "pb6@75": 6 });
  });
});

describe("the verdicts were reached under the thresholds the code still holds", () => {
  // THE STALENESS GUARD. A floor moved in code while the manifest keeps
  // verdicts reached under the old one is 198 numbers that quietly mean
  // something else.
  it.each([
    ["MIN_MEASURABLE_PITCH_CENTS", MIN_MEASURABLE_PITCH_CENTS],
    ["MIN_MEASURABLE_DRIFT_MS", MIN_MEASURABLE_DRIFT_MS],
    ["MIN_CONFIDENT_PITCH_FRACTION", MIN_CONFIDENT_PITCH_FRACTION],
    ["MIN_CONFIDENT_BLOCK_FRACTION", MIN_CONFIDENT_BLOCK_FRACTION],
    ["MAX_CLIPPED_FRACTION", MAX_CLIPPED_FRACTION],
    ["MAX_FLAT_TOP_FRACTION", MAX_FLAT_TOP_FRACTION],
    ["MAX_SILENCE_SEC", MAX_SILENCE_SEC],
    ["MAX_QUIET_FRACTION", MAX_QUIET_FRACTION],
  ])("%s in the manifest matches the live constant", (name, live) => {
    expect(m.layerA!.thresholds[name as string]).toBe(live);
  });

  it("one transparency anchor was rendered per window", () => {
    expect(m.layerA!.anchors).toHaveLength(9);
    // The pipeline-noise floor is bit-exact by construction (normRender is), so
    // any nonzero value means the toolchain started adding measurement noise.
    for (const a of m.layerA!.anchors) expect(a.pipelineNoiseLsdDb).toBe(0);
  });
});

describe("the measured fitness margins, pinned", () => {
  // Not thresholds — OBSERVATIONS, pinned so a re-render that quietly degrades
  // the material shows up as a diff rather than as a still-green suite.
  it("worst dead air in the pool is far under the gate", () => {
    const worst = Math.max(...entries.map((e) => e.layerA!.longestSilenceSec));
    expect(worst).toBeLessThanOrEqual(0.1);
    expect(worst).toBeLessThan(MAX_SILENCE_SEC);
  });

  it("worst quiet fraction in the pool is far under the gate", () => {
    const worst = Math.max(...entries.map((e) => e.layerA!.quietFraction));
    expect(worst).toBeLessThanOrEqual(0.12);
    expect(worst).toBeLessThan(MAX_QUIET_FRACTION);
  });

  it("pb8 is the only source carrying pre-loudnorm clipping, and it is orders under the gate", () => {
    // Surfaced by RT-81a: measuring the REFERENCES revealed a trace of clipping
    // in pb8's source recording that pb1 and pb6 do not have. Recorded because
    // it is a real property of that material, not because it is a problem.
    const clipped = entries.filter((e) => (e.layerA!.preNormClippedFraction ?? 0) > 0);
    expect([...new Set(clipped.map((e) => e.sourceId))]).toEqual(["pb8"]);
    const worst = Math.max(...clipped.map((e) => e.layerA!.preNormClippedFraction!));
    expect(worst).toBeLessThan(MAX_CLIPPED_FRACTION);
    expect(worst).toBeLessThan(0.0002);
  });
});

describe("the instrument's known limits are stated, not hidden (RT-76a, RT-82a)", () => {
  it("the recorded limits are what the current data computes", () => {
    expect(m.layerA!.knownLimits).toEqual(computeKnownLimits(m));
  });

  it("pitch level 3.1 is named, by BOTH of its limits", () => {
    const kinds = m
      .layerA!.knownLimits.filter((l) => l.family === "pitch-drift" && l.level === 3.1)
      .map((l) => l.kind)
      .sort();
    expect(kinds).toEqual(["cross-window-spread", "predicted-below-floor"]);
  });

  it("every limit carries a statement a reader could act on", () => {
    for (const l of m.layerA!.knownLimits) expect(l.statement.length).toBeGreaterThan(80);
  });

  it("no OTHER level is a known limit — the disclosure stays specific", () => {
    // A limits list that names half the ladder tells a reader nothing.
    expect([...new Set(m.layerA!.knownLimits.map((l) => l.level))]).toEqual([3.1]);
  });
});

describe("eligibleWindows is what E5 must call", () => {
  it("returns a usable pool for both rendered families", () => {
    for (const family of STAIRCASE_RENDER_FAMILIES) {
      expect(eligibleWindows(m, family).length).toBeGreaterThan(0);
    }
  });

  it("pitch keeps nine windows and timing seven — and it is NOT nine for both", () => {
    // `trial-instances.test.ts` still hardcodes nine. This is the fact that
    // makes that wrong, asserted where it can be seen.
    expect(eligibleWindows(m, "pitch-drift")).toHaveLength(9);
    expect(eligibleWindows(m, "timing-smear")).toHaveLength(7);
  });

  it("never returns a window either stage excluded", () => {
    const blocked = new Set([
      ...m.excludedWindows.map((e) => `${e.family}/${e.sourceId}@${e.startSec}`),
      ...(m.layerA!.excludedWindows ?? []).map((e) => `${e.family}/${e.sourceId}@${e.startSec}`),
    ]);
    for (const family of STAIRCASE_RENDER_FAMILIES) {
      for (const w of eligibleWindows(m, family)) {
        expect(blocked.has(`${family}/${w.sourceId}@${w.startSec}`)).toBe(false);
      }
    }
  });
});
