/**
 * RT-52a: pin the CLI and the planner to ONE meaning of "rung N".
 *
 * The bug: degrade.mjs carried its own rung table that had gone stale when the
 * ladder was widened. `degrade --family timing-smear --magnitude 2` rendered
 * 0.03 — the ladder's rung 3, double the intended strength — and then wrote
 * "magnitude 2" into the manifest next to it. No downstream check could catch
 * that. Every validation compares the audio to what was actually rendered, and
 * the rung LABEL is precisely the thing no measurement can see. It surfaced only
 * because a human happened to compare two files by hand while re-rendering d2.
 *
 * These tests are the control that was missing. They fail if the two tables ever
 * diverge again, and they pin the shipped pool to the ladder, so a rung's meaning
 * cannot be changed without the pool of record failing loudly.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  LADDER_FAMILIES,
  LADDER_RUNGS as RUNGS_UNTYPED,
  SHIPPING_RUNGS,
  paramForRung,
} from "./rungs.mjs";

// rungs.mjs is plain JS, so its literal type has no string index signature.
const LADDER_RUNGS = RUNGS_UNTYPED as Record<string, { unit: string; values: (number | string)[] }>;

const plan = JSON.parse(
  readFileSync(join(process.cwd(), "scripts", "clip-pipeline", "expansion-plan.json"), "utf8"),
) as { plan?: PlanRow[] } | PlanRow[];
type PlanRow = { id: string; family: string; rung: number; param: number | string };
const planRows: PlanRow[] = Array.isArray(plan) ? plan : (plan.plan ?? []);

describe("the ladder is the only definition of a rung", () => {
  it("covers every family the renderer knows, with 4 rungs each", () => {
    expect(LADDER_FAMILIES.sort()).toEqual(["lossy-artifact", "pitch-drift", "timing-smear"]);
    for (const f of LADDER_FAMILIES) expect(LADDER_RUNGS[f].values).toHaveLength(4);
  });

  it("every rung has a stated unit — nobody should have to guess what 25 means", () => {
    for (const f of LADDER_FAMILIES) expect(LADDER_RUNGS[f].unit).toBeTruthy();
  });

  it("THE REGRESSION: paramForRung matches the planner's param for every family x rung", () => {
    // This is the assertion that would have failed before the fix. The old CLI
    // table's timing-smear rung 2 was 0.03; the planner's is 0.015.
    for (const row of planRows) {
      expect(paramForRung(row.family, row.rung), `${row.id} (${row.family} rung ${row.rung})`).toBe(row.param);
    }
    expect(planRows.length).toBeGreaterThan(0); // guard against a silently empty plan
  });

  it("pins the exact shipped values, so widening the ladder is a deliberate act", () => {
    expect(LADDER_RUNGS["timing-smear"].values).toEqual([0.0075, 0.015, 0.03, 0.05]);
    expect(LADDER_RUNGS["pitch-drift"].values).toEqual([12, 25, 50, 100]);
    expect(LADDER_RUNGS["lossy-artifact"].values).toEqual(["128k", "96k", "64k", "32k"]);
    // The specific value the stale table got wrong.
    expect(paramForRung("timing-smear", 2)).toBe(0.015);
    expect(paramForRung("timing-smear", 2)).not.toBe(0.03);
  });

  it("rung 1 exists and does not ship (measured under the 3x fair-trial floor)", () => {
    expect(SHIPPING_RUNGS).toEqual([2, 3, 4]);
    for (const f of LADDER_FAMILIES) expect(paramForRung(f, 1)).toBeDefined();
    expect(planRows.some((r) => r.rung === 1)).toBe(false);
  });

  it("numeric ladders increase monotonically — a higher rung is never gentler", () => {
    for (const f of ["pitch-drift", "timing-smear"]) {
      const v = LADDER_RUNGS[f].values as number[];
      for (let i = 1; i < v.length; i++) expect(v[i]).toBeGreaterThan(v[i - 1]);
    }
    // Lossy runs the other way: a LOWER bitrate is a bigger manipulation.
    const kbps = (LADDER_RUNGS["lossy-artifact"].values as string[]).map((s) => parseInt(s, 10));
    for (let i = 1; i < kbps.length; i++) expect(kbps[i]).toBeLessThan(kbps[i - 1]);
  });

  it("refuses unknown families and out-of-range rungs instead of returning undefined", () => {
    expect(() => paramForRung("reverb-wash", 2)).toThrow(/unknown family/);
    expect(() => paramForRung("timing-smear", 0)).toThrow(/rungs 1-4/);
    expect(() => paramForRung("timing-smear", 5)).toThrow(/rungs 1-4/);
    expect(() => paramForRung("timing-smear", 2.5)).toThrow(/rungs 1-4/);
  });
});

describe("the shipped pool agrees with the ladder", () => {
  const manifest = JSON.parse(
    readFileSync(join(process.cwd(), "src", "content", "delicacy", "manifest.json"), "utf8"),
  ) as { pairs: { id: string; family: string; magnitude: number; params: Record<string, unknown> }[] };

  it("every rendered pair's recorded params match its labelled rung", () => {
    for (const p of manifest.pairs) {
      const expected = paramForRung(p.family, p.magnitude);
      const actual =
        p.family === "timing-smear"
          ? (p.params.maxDevPct as number) / 100 // recorded as a percentage
          : p.family === "pitch-drift"
            ? (p.params.peakCents ?? p.params.cents ?? p.params.maxCents)
            : p.params.bitrate;
      expect(actual, `${p.id} (${p.family} rung ${p.magnitude})`).toBe(expected);
    }
  });
});
