/**
 * Gatekeeping tests for the Delicacy Trials pool (S6): the pool's shape and
 * provenance are contracts, not suggestions. Both directions are proven —
 * the real pool passes, and deliberately broken fixtures fail with named
 * errors (checkDelicacyPool is pure exactly so this file can do that).
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  DELICACY_LIVE,
  DELICACY_POOL_VERSION,
  DELICACY_TRIALS,
  MEASURED_TRIALS,
  PRACTICE_TRIALS,
  type DelicacyTrialClip,
} from "./items";
import { checkDelicacyPool, checkPracticeSplit } from "./gates";

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

  it("is LIVE at version 2, and every gate that opened it was measured", () => {
    // This assertion has now been through all four of its states, and the
    // history is the point:
    //   1. blocked pending a PM ear pass on every clip;
    //   2. blocked by Layer A FLAGs on 6 of 24 pairs;
    //   3. Layer A clear, blocked pending a PM voice pass on copy.ts;
    //   4. open — because the voice pass became code too (src/content/voice.ts).
    //   5. open at v2 — d2 re-sourced after `quietFraction` FLAGged it at 35.2%.
    //      The gate found, unprompted, the one clip the PM had found by ear, and
    //      the pool went red until it was replaced. That round trip is the whole
    //      argument for the pivot, and it is why this assertion is worth keeping.
    // At no point was a threshold lowered to get here. The pool was rebuilt
    // until the measurements passed, and the two human gates were replaced by
    // checks that can be run by anyone, repeatedly, without an opinion.
    expect(check(DELICACY_TRIALS, manifest, DELICACY_POOL_VERSION)).toEqual([]);
    expect(DELICACY_POOL_VERSION).toBe(2);
    expect(DELICACY_LIVE).toBe(true);
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

describe("practice / measured split (RT-37b) — the real split passes, and its shape is pinned", () => {
  const split = (
    practice: DelicacyTrialClip[] = PRACTICE_TRIALS,
    measured: DelicacyTrialClip[] = MEASURED_TRIALS,
    pool: DelicacyTrialClip[] = DELICACY_TRIALS,
  ) => checkPracticeSplit(pool, practice, measured);

  it("passes every structural invariant as shipped", () => {
    expect(split()).toEqual([]);
  });

  it("is a partition: 3 practice + 15 measured = the 18-trial pool, disjoint", () => {
    expect(PRACTICE_TRIALS).toHaveLength(3);
    expect(MEASURED_TRIALS).toHaveLength(15);
    const p = PRACTICE_TRIALS.map((t) => t.id);
    const m = MEASURED_TRIALS.map((t) => t.id);
    expect(p.filter((id) => m.includes(id))).toEqual([]);
    expect([...p, ...m].sort()).toEqual(DELICACY_TRIALS.map((t) => t.id).sort());
  });

  it("teaches one flaw family each, all on the strongest shipping rung", () => {
    expect(PRACTICE_TRIALS.map((t) => t.id)).toEqual(["d7", "d8", "d9"]);
    expect(PRACTICE_TRIALS.map((t) => t.family)).toEqual(["pitch-drift", "timing-smear", "lossy-artifact"]);
    expect(PRACTICE_TRIALS.map((t) => t.magnitude)).toEqual([4, 4, 4]);
  });

  it("PINS THE DECLARED ASYMMETRY: measured is family-balanced 5/5/5 but rung-skewed 6/6/3", () => {
    // The scored block is deliberately HARDER than the pool's factorial, because
    // practice takes three items off the top rung. Families stay balanced, which
    // is what any per-family reporting depends on. If either number moves, this
    // test fails and the gates.ts docblock has to be rewritten with it — that is
    // the point. No surface may call the scored block "the crossed factorial".
    const count = <K extends string | number>(keys: K[], of: (t: DelicacyTrialClip) => K) =>
      keys.map((k) => MEASURED_TRIALS.filter((t) => of(t) === k).length);
    expect(count(["pitch-drift", "timing-smear", "lossy-artifact"] as const, (t) => t.family)).toEqual([5, 5, 5]);
    expect(count([2, 3, 4], (t) => t.magnitude)).toEqual([6, 6, 3]);
  });
});

describe("practice / measured split — deliberately broken splits fail with named errors", () => {
  const split = (practice: DelicacyTrialClip[], measured: DelicacyTrialClip[], pool = DELICACY_TRIALS) =>
    checkPracticeSplit(pool, practice, measured).join("\n");
  const byId = (id: string) => DELICACY_TRIALS.find((t) => t.id === id)!;

  it("CONTAMINATION: an item in both sets is fatal", () => {
    expect(split(PRACTICE_TRIALS, [...MEASURED_TRIALS, byId("d7")])).toMatch(
      /practice and measured overlap on d7 — an item answered with the answer shown must never be scored/,
    );
  });

  it("ORPHAN: a pool trial presented nowhere is fatal", () => {
    expect(split(PRACTICE_TRIALS, MEASURED_TRIALS.filter((t) => t.id !== "d12"))).toMatch(
      /pool trials presented nowhere: d12/,
    );
  });

  it("a trial that is not in the pool is fatal", () => {
    const alien = { ...byId("d1"), id: "d99" };
    expect(split(PRACTICE_TRIALS, [...MEASURED_TRIALS, alien])).toMatch(
      /split contains trials that are not in the pool: d99/,
    );
  });

  it("practice missing a flaw family is fatal", () => {
    // Two pitch-drift practice items, no lossy-artifact: a newcomer never hears
    // the compression signature before being scored on it.
    const skewed = [byId("d7"), byId("d8"), { ...byId("d9"), family: "pitch-drift" as const }];
    const errs = split(skewed, MEASURED_TRIALS);
    expect(errs).toMatch(/practice has 2 "pitch-drift" trials \(contract: exactly 1\)/);
    expect(errs).toMatch(/practice has 0 "lossy-artifact" trials/);
  });

  it("practice drawn off a middle rung is fatal", () => {
    const weak = [{ ...byId("d7"), magnitude: 2 as const }, byId("d8"), byId("d9")];
    expect(split(weak, MEASURED_TRIALS)).toMatch(
      /practice trial d7 is rung 2, not the pool's strongest rung 4/,
    );
  });

  it("a family-unbalanced measured set is fatal", () => {
    expect(split(PRACTICE_TRIALS, MEASURED_TRIALS.filter((t) => t.id !== "d1"))).toMatch(
      /measured set is family-unbalanced \(pitch-drift=4, timing-smear=5, lossy-artifact=5\)/,
    );
  });

  it("depleting a rung OTHER than the strongest is fatal", () => {
    // A 3-item practice block taken off rung 2 keeps the families balanced and
    // the partition intact — every other gate passes. Only this one catches it.
    const rung2 = DELICACY_TRIALS.filter((t) => t.magnitude === 2).slice(0, 3);
    const rest = DELICACY_TRIALS.filter((t) => !rung2.some((p) => p.id === t.id));
    expect(split(rung2, rest)).toMatch(/rung 2 lost 3 trial\(s\) to practice — only the strongest rung \(4\) may be depleted/);
  });

  it("losing an entire intensity level from the scored block is fatal", () => {
    const noRung4 = MEASURED_TRIALS.filter((t) => t.magnitude !== 4);
    const practicePlus = [...PRACTICE_TRIALS, ...MEASURED_TRIALS.filter((t) => t.magnitude === 4)];
    expect(split(practicePlus, noRung4)).toMatch(/no measured trial at rung 4/);
  });
});
