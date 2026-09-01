/**
 * E14/S4 — THE RETEST HEARS THE SAME MUSIC (Track H, PM ruling RT-H4 a).
 *
 * PRE-REGISTERED:
 *
 *   (a) A RETEST REUSES THE RECORDING. Given a stored compression session, a new
 *       session starts on the same recording FOR EVERY SEED — not merely for
 *       the lucky half. The seed is the thing being overridden, so a test that
 *       tried one seed would pass half the time by accident.
 *   (b) THE FIRST SESSION IS UNCHANGED. With nothing stored, the choice is
 *       exactly `pickSourceForSeed`, so nobody's first sitting is affected.
 *   (c) A RETIRED RECORDING IS NOT HANDED BACK. `startSession` throws on one, so
 *       a browser holding a session recorded against a since-retired recording
 *       would be permanently broken. It must fall back instead.
 *   (d) FORGETTING THE BROWSER UN-PINS IT, with nothing extra to clear — the
 *       property that made deriving from the store the right design.
 *   (e) THE ARC ACTUALLY GAINS BY THIS. The refusal rate for a lossy retest is
 *       measured before and after, end to end through the store.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { materialForSession, pinnedMaterial } from "./session-material";
import { forgetThisBrowser } from "./forget-device";
import { readHistory, recordResult } from "./result-store";
import { POOL_VERSIONS } from "./result-recall";
import { eligibleSources } from "@/engine/staircase-pool";
import {
  answer,
  axisFor,
  isFinished,
  nextTrial,
  pickSourceForSeed,
  startSession,
} from "@/engine/staircase-session";
import { encodeResponses, replaySession } from "@/engine/staircase-replay";
import { thresholdArc } from "@/engine/arc";
import { observer as obs, pCorrect, rng } from "@/analytics/observer";
import { SLUG_BY_FAMILY, familyForSlug } from "@/app/threshold/families";

class MemoryStorage implements Storage {
  private map = new Map<string, string>();
  get length() {
    return this.map.size;
  }
  clear() {
    this.map.clear();
  }
  key(i: number) {
    return [...this.map.keys()][i] ?? null;
  }
  getItem(k: string) {
    return this.map.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.map.set(k, v);
  }
  removeItem(k: string) {
    this.map.delete(k);
  }
}

beforeEach(() => {
  vi.stubGlobal("localStorage", new MemoryStorage());
  vi.stubGlobal("sessionStorage", new MemoryStorage());
});
afterEach(() => vi.unstubAllGlobals());

const LOSSY = "lossy-artifact";
const PITCH = "pitch-drift";
const SOURCES = eligibleSources(LOSSY);

/** A finished session, written to the store exactly as the flow writes it. */
function record(family: string, sourceId: string | undefined, seed: number, at: number) {
  const axis = axisFor(family, sourceId);
  const o = obs(axis.magnitudes[axis.magnitudes.length >> 1], 0.35, 0.02);
  let s = startSession(family, seed, sourceId);
  const rand = rng(seed ^ 0x5bf03635);
  while (!isFinished(s)) {
    const t = nextTrial(s);
    s = answer(s, rand() < pCorrect(s.axis.magnitudes[t.levelIndex], o));
  }
  recordResult(
    "threshold",
    POOL_VERSIONS.threshold,
    { kind: "threshold", slug: SLUG_BY_FAMILY[family], seed, answers: encodeResponses(s), sourceId },
    at,
  );
}

describe("E14/S4 — a compression retest reuses the recording", () => {
  it("holds the recording across every seed, not just the lucky half", () => {
    record(LOSSY, SOURCES[0], 7919, 1_000);
    expect(pinnedMaterial(LOSSY)).toBe(SOURCES[0]);

    /*
     * EVERY SEED, because the seed is exactly what is being overridden. Trying
     * one seed would pass whenever that seed happened to pick the same
     * recording anyway — which is half the time, so the test would look solid
     * and prove nothing.
     */
    const clock = rng(20260901);
    let held = 0;
    const N = 500;
    for (let i = 0; i < N; i++) {
      const seed = Math.floor(clock() * 2147483647);
      if (materialForSession(LOSSY, seed) === SOURCES[0]) held++;
    }
    expect(held, "a retest still drifts onto another recording for some seeds").toBe(N);
  });

  it("leaves the first session exactly as it was", () => {
    const clock = rng(4242);
    for (let i = 0; i < 200; i++) {
      const seed = Math.floor(clock() * 2147483647);
      expect(materialForSession(LOSSY, seed)).toBe(pickSourceForSeed(LOSSY, seed));
    }
    expect(pinnedMaterial(LOSSY)).toBeUndefined();
  });

  it("pins nothing for a family that has no recording to pin", () => {
    record(PITCH, undefined, 7919, 1_000);
    expect(pinnedMaterial(PITCH)).toBeUndefined();
    expect(materialForSession(PITCH, 12345)).toBeUndefined();
  });

  /**
   * (c) The failure this would otherwise cause is permanent and silent to us:
   * `startSession` throws on a retired recording, so the machine would 500 for
   * that person on every attempt until they cleared their browser.
   */
  it("does not hand back a recording that has left the shipping pool", () => {
    // Written straight to the slot, because `record` cannot play a session on a
    // recording the engine refuses to start — which is the whole hazard.
    recordResult(
      "threshold",
      POOL_VERSIONS.threshold,
      { kind: "threshold", slug: SLUG_BY_FAMILY[LOSSY], seed: 7919, answers: "101", sourceId: "pb6" },
      1_000,
    );
    expect(readHistory("threshold", POOL_VERSIONS.threshold, SLUG_BY_FAMILY[LOSSY]).length).toBe(1);
    expect(eligibleSources(LOSSY).includes("pb6"), "pb6 is shipping again — this test needs a new example").toBe(
      false,
    );
    expect(pinnedMaterial(LOSSY), "a retired recording was handed back to startSession").toBeUndefined();
    // And the fallback is startable, which is the point of the fallback.
    expect(() => startSession(LOSSY, 7919, materialForSession(LOSSY, 7919))).not.toThrow();
  });

  it("un-pins when the browser is forgotten, with nothing extra to clear", () => {
    record(LOSSY, SOURCES[0], 7919, 1_000);
    expect(pinnedMaterial(LOSSY)).toBe(SOURCES[0]);
    forgetThisBrowser();
    expect(pinnedMaterial(LOSSY)).toBeUndefined();
  });
});

describe("E14/S4 — what the pin buys the arc, measured end to end", () => {
  it("turns a coin flip into a comparison", () => {
    const clock = rng(20260902);
    const seeds = Array.from({ length: 300 }, () => Math.floor(clock() * 2147483647));

    const recalled = () =>
      readHistory("threshold", POOL_VERSIONS.threshold, SLUG_BY_FAMILY[LOSSY]).map((e) => {
        if (e.payload.kind !== "threshold") throw new Error("wrong payload kind");
        return {
          at: e.savedAt,
          session: replaySession(
            familyForSlug(e.payload.slug)!,
            e.payload.seed,
            e.payload.answers,
            e.payload.sourceId,
          ),
        };
      });

    let refusedBefore = 0;
    let refusedAfter = 0;
    for (let i = 0; i + 1 < seeds.length; i += 2) {
      const [s1, s2] = [seeds[i], seeds[i + 1]];

      // BEFORE: both sittings choose from the seed, as the product used to.
      localStorage.clear();
      record(LOSSY, pickSourceForSeed(LOSSY, s1), s1, 1_000);
      record(LOSSY, pickSourceForSeed(LOSSY, s2), s2, 2_000);
      const before = thresholdArc(recalled());
      if (!before.ok && before.gap === "different-material") refusedBefore++;

      // AFTER: the second sitting goes through `materialForSession`.
      localStorage.clear();
      record(LOSSY, materialForSession(LOSSY, s1), s1, 1_000);
      record(LOSSY, materialForSession(LOSSY, s2), s2, 2_000);
      const after = thresholdArc(recalled());
      if (!after.ok && after.gap === "different-material") refusedAfter++;
    }

    const pairs = Math.floor(seeds.length / 2);
    console.log(
      `[E14/S4] compression retests refused as different material: ` +
        `${((100 * refusedBefore) / pairs).toFixed(0)}% before the pin, ` +
        `${((100 * refusedAfter) / pairs).toFixed(0)}% after`,
    );
    expect(refusedBefore, "the coin flip this slice exists to remove is no longer happening").toBeGreaterThan(0);
    expect(refusedAfter, "the pin does not actually make the sittings comparable").toBe(0);
  });
});
