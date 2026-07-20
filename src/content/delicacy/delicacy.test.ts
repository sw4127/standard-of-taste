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

  it("passes every gate EXCEPT the ear pass at version 1 (the door's last lock)", () => {
    // The moment the version bumps, the only thing that may stand between the
    // pool and the door is the recorded PM ear pass. If this test starts
    // listing OTHER errors, the bump is blocked on engineering, not the PM.
    const atV1 = check(DELICACY_TRIALS, manifest, 1);
    const earOnly = atV1.every((e) => e.includes("ear pass"));
    expect(earOnly).toBe(true);
    // …and while earPass is unrecorded, v1 must in fact be blocked:
    if (manifest.pairs.some((p: { earPass: unknown }) => !p.earPass)) {
      expect(atV1.length).toBeGreaterThan(0);
    }
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

  it("original sides are exactly balanced 3/3 in the authored pool", () => {
    const a = DELICACY_TRIALS.filter((t) => t.originalSide === "a").length;
    expect(a).toBe(3);
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
    // d2 (lossy) ↔ d4 (pitch) puts pitch-drift at slots 1 and 2 adjacently.
    [swapped[1], swapped[3]] = [swapped[3], swapped[1]];
    expect(check(swapped).join("\n")).toMatch(/share family "pitch-drift" adjacently/);
  });

  it("a lopsided side balance is fatal", () => {
    const lopsided = clone(DELICACY_TRIALS).map((t: DelicacyTrialClip) => ({ ...t, originalSide: "a" as const }));
    expect(check(lopsided).join("\n")).toMatch(/original sides unbalanced: 6a\/0b/);
  });

  it("version 1 without a recorded ear pass is fatal — the door stays shut", () => {
    expect(check(DELICACY_TRIALS, manifest, 1).join("\n")).toMatch(/requires a recorded PM ear pass/);
  });

  it("version 1 WITH recorded PASS ear passes clears the gate", () => {
    const m = clone(manifest);
    for (const p of m.pairs) p.earPass = { by: "PM", date: "2026-07-19", verdict: "PASS" };
    expect(check(DELICACY_TRIALS, m, 1)).toEqual([]);
  });
});
