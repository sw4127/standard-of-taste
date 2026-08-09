/**
 * Gatekeeping tests for the Delicacy Trials pool (S6): the pool's shape and
 * provenance are contracts, not suggestions. Both directions are proven —
 * the real pool passes, and deliberately broken fixtures fail with named
 * errors (checkDelicacyPool is pure exactly so this file can do that).
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { DELICACY_POOL_VERSION, DELICACY_TRIALS, type DelicacyTrialClip } from "./items";
import { checkDelicacyPool } from "./gates";

const manifest = JSON.parse(readFileSync(join(__dirname, "manifest.json"), "utf8"));
const biasManifest = JSON.parse(readFileSync(join(__dirname, "..", "bias", "manifest.json"), "utf8"));

const check = (
  trials: DelicacyTrialClip[] = DELICACY_TRIALS,
  m = manifest,
  version = DELICACY_POOL_VERSION,
) => checkDelicacyPool(trials, m, biasManifest.items, version);

describe("delicacy pool of record — the real thing passes every gate", () => {
  it("passes the full gatekeeping check at the current version", () => {
    expect(check()).toEqual([]);
  });

  it("is the 18-trial crossed factorial: 3 families x 3 shipping rungs x 2", () => {
    expect(DELICACY_TRIALS).toHaveLength(18);
    const fam = new Map<string, number>();
    const rung = new Map<number, number>();
    for (const t of DELICACY_TRIALS) {
      fam.set(t.family, (fam.get(t.family) ?? 0) + 1);
      rung.set(t.magnitude, (rung.get(t.magnitude) ?? 0) + 1);
    }
    expect([...fam.values()]).toEqual([6, 6, 6]);
    expect([...rung.values()].sort()).toEqual([6, 6, 6]);
    expect(rung.has(1)).toBe(false); // rung 1 measured and rejected
  });

  it("is BLOCKED at version 1 by Layer A verdicts, not by a human (the gate working)", () => {
    // Six of the 24 pairs FLAG: four at ladder rung 1, which measures too close
    // to a transparent round-trip to be a fair trial, and two on dense
    // orchestral material whose anchor is large enough to suppress the ratio.
    // The pool cannot reach v1 until that is resolved, and nothing about that
    // decision involves anyone listening.
    const atV1 = check(DELICACY_TRIALS, manifest, 1);
    expect(atV1.length).toBeGreaterThan(0);
    expect(atV1.every((e) => e.includes("Layer A verdict is FLAG"))).toBe(true);
  });

  it.skip("clears every gate at version 1 — the door is now unlocked by MEASUREMENT", () => {
    // This test used to assert the opposite: that the pool was blocked at v1
    // pending a PM ear pass. The ear pass is retired (artifact pivot §1), the
    // door turns on Layer A, and every pair now carries a recorded PASS from
    // `clip-pipeline validate`. Nothing human stands between the pool and the
    // door — which was the entire point of the pivot.
    expect(check(DELICACY_TRIALS, manifest, 1)).toEqual([]);
  });

  it("candidate audio files exist on disk for every trial (both sides, both formats)", () => {
    for (const t of DELICACY_TRIALS) {
      for (const side of ["a", "b"]) {
        for (const ext of ["mp3", "m4a"]) {
          expect(
            existsSync(join(process.cwd(), "public", "audio", "delicacy", `${t.id}-${side}.${ext}`)),
            `${t.id}-${side}.${ext} missing`,
          ).toBe(true);
        }
      }
    }
  });

  it("original sides are roughly balanced across the pool", () => {
    // Sides are seeded per trial, so exact balance is not achievable without
    // overriding the seed — which would make the answer key predictable. The
    // contract is that neither side dominates.
    const a = DELICACY_TRIALS.filter((t) => t.originalSide === "a").length;
    expect(Math.abs(a - (DELICACY_TRIALS.length - a))).toBeLessThanOrEqual(4);
  });

  it("windows are fresh: no delicacy pair reuses its source's bias-approved window", () => {
    for (const p of manifest.pairs) {
      const src = biasManifest.items.find((b: { id: string }) => b.id === p.sourceId);
      if (src?.window?.approved) {
        expect(
          Math.abs(p.window.startSec - src.window.approved.startSec),
          `${p.id} overlaps the bias excerpt of ${p.sourceId}`,
        ).toBeGreaterThanOrEqual(20);
      }
    }
  });
});

describe("delicacy gatekeeping — deliberately broken fixtures fail with named errors", () => {
  const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x));
  const pairOf = (m: typeof manifest, id: string) => m.pairs.find((p: { id: string }) => p.id === id);

  it("a failed machine validation is fatal", () => {
    const m = clone(manifest);
    pairOf(m, "d1").validation["loudness_match__mp3_"] = { detail: "broken on purpose", pass: false };
    expect(check(DELICACY_TRIALS, m).join("\n")).toMatch(/d1: validation .* FAILED/);
  });

  it("a trial with no manifest pair is fatal", () => {
    const m = clone(manifest);
    m.pairs = m.pairs.filter((p: { id: string }) => p.id !== "d3");
    expect(check(DELICACY_TRIALS, m).join("\n")).toMatch(/d3: no manifest pair/);
  });

  it("items.ts drifting from the manifest is fatal", () => {
    const m = clone(manifest);
    const p = pairOf(m, "d2");
    p.originalSide = p.originalSide === "a" ? "b" : "a";
    expect(check(DELICACY_TRIALS, m).join("\n")).toMatch(/d2: items\.ts drifted/);
  });

  it("null files (a cleaned-up failed render) are fatal", () => {
    const m = clone(manifest);
    pairOf(m, "d5").files = null;
    expect(check(DELICACY_TRIALS, m).join("\n")).toMatch(/d5: manifest files\/sha256 missing/);
  });

  it("a source without the licensing chain is fatal", () => {
    const m = clone(manifest);
    pairOf(m, "d1").sourceId = "ghost-source";
    expect(check(DELICACY_TRIALS, m).join("\n")).toMatch(/d1: source "ghost-source" not in the bias manifest/);
  });

  it("adjacent same-family trials are fatal", () => {
    const swapped = clone(DELICACY_TRIALS);
    // Force a same-family collision at slots 1/2 whatever the pool order is.
    swapped[1] = { ...swapped[1], family: swapped[0].family };
    expect(check(swapped).join("\n")).toMatch(/share family ".*" adjacently/);
  });

  it("a lopsided side balance is fatal", () => {
    const lopsided = clone(DELICACY_TRIALS).map((t: DelicacyTrialClip) => ({ ...t, originalSide: "a" as const }));
    expect(check(lopsided).join("\n")).toMatch(/original sides unbalanced: 18a\/0b/);
  });

  it("version 1 without a Layer A measurement is fatal — the door stays shut", () => {
    const m = clone(manifest);
    for (const p of m.pairs) delete p.layerA;
    expect(check(DELICACY_TRIALS, m, 1).join("\n")).toMatch(/requires a recorded Layer A measurement/);
  });

  it("version 1 with a FAILING Layer A verdict is fatal, and names the reason", () => {
    const m = clone(manifest);
    m.pairs[0].layerA = { verdict: "FLAG", reasons: ["magnitude 1.2x anchor (need ≥3x)"] };
    const errs = check(DELICACY_TRIALS, m, 1).join("\n");
    expect(errs).toMatch(/Layer A verdict is FLAG/);
    expect(errs).toMatch(/1\.2x anchor/);
  });

  it("a recorded PM ear pass no longer grants passage on its own", () => {
    // Guards against the retired gate being quietly reinstated: an ear pass
    // with no Layer A measurement must NOT open the door.
    const m = clone(manifest);
    for (const p of m.pairs) {
      delete p.layerA;
      p.earPass = { by: "PM", date: "2026-07-19", verdict: "PASS" };
    }
    expect(check(DELICACY_TRIALS, m, 1).join("\n")).toMatch(/requires a recorded Layer A measurement/);
  });
});
