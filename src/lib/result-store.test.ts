import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  STORE_VERSION,
  forgetResult,
  readResult,
  recordResult,
  type StoredPayload,
} from "./result-store";
import { recallBias, recallDelicacy, recallThreshold, POOL_VERSIONS } from "./result-recall";
import { BIAS_CLIPS, BIAS_INSTRUMENT_ID } from "@/content/bias/items";
import {
  BIAS_SCALE_MAX,
  BIAS_SCALE_MIN,
  computeBiasResult,
  encodeBiasRatings,
} from "@/engine/bias";
import { DELICACY_INSTRUMENT_ID, MEASURED_TRIALS } from "@/content/delicacy/items";
import {
  computeDelicacyResult,
  encodeDelicacyResponses,
  type DelicacyResponses,
} from "@/engine/delicacy";
import { answer, isFinished, nextTrial, sessionResult, startSession } from "@/engine/staircase-session";
import { observer, pCorrect, rng } from "@/analytics/observer";

/**
 * A REAL `localStorage`, not a mock of the parts I happen to use. A stub that
 * only implements getItem/setItem cannot reproduce the behaviour this module
 * exists to survive — a throwing accessor — and a test against my own stub
 * would prove only that I can write a stub.
 */
class MemoryStorage implements Storage {
  private map = new Map<string, string>();
  throwOnAccess = false;
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
    if (this.throwOnAccess) throw new DOMException("blocked", "SecurityError");
    return this.map.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    if (this.throwOnAccess) throw new DOMException("blocked", "SecurityError");
    this.map.set(k, v);
  }
  removeItem(k: string) {
    if (this.throwOnAccess) throw new DOMException("blocked", "SecurityError");
    this.map.delete(k);
  }
}

let store: MemoryStorage;

beforeEach(() => {
  store = new MemoryStorage();
  vi.stubGlobal("localStorage", store);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/* ------------------------------------------------------------------ *
 * Real sessions, through the real engines
 * ------------------------------------------------------------------ */

function biasSession(shift: number) {
  const blind: Record<string, number> = {};
  const labeled: Record<string, number> = {};
  for (const item of BIAS_CLIPS) {
    blind[item.id] = 5;
    const toward = item.isControl ? 0 : item.labelDirection === "up" ? shift : -shift;
    labeled[item.id] = Math.max(BIAS_SCALE_MIN, Math.min(BIAS_SCALE_MAX, 5 + toward));
  }
  return {
    payload: {
      kind: "bias" as const,
      blind: encodeBiasRatings(BIAS_CLIPS, blind),
      labeled: encodeBiasRatings(BIAS_CLIPS, labeled),
    },
    live: computeBiasResult(BIAS_INSTRUMENT_ID, BIAS_CLIPS, blind, labeled),
  };
}

function delicacySession(everyNthWrong: number) {
  const responses: DelicacyResponses = {};
  MEASURED_TRIALS.forEach((t, i) => {
    const ok = i % everyNthWrong !== 0;
    responses[t.id] = {
      pickedSide: ok ? t.originalSide : t.originalSide === "a" ? "b" : "a",
      flawPick: t.family,
      confidence: 70,
    };
  });
  return {
    payload: { kind: "delicacy" as const, picks: encodeDelicacyResponses(MEASURED_TRIALS, responses) },
    live: computeDelicacyResult(DELICACY_INSTRUMENT_ID, MEASURED_TRIALS, responses),
  };
}

function thresholdSession(slug: string, family: string, seed: number, alpha: number) {
  const o = observer(alpha, 0.35, 0.02);
  let s = startSession(family, seed);
  const rand = rng(seed ^ 0x5bf03635);
  let answers = "";
  while (!isFinished(s)) {
    const t = nextTrial(s);
    const ok = rand() < pCorrect(s.axis.magnitudes[t.levelIndex], o);
    answers += ok ? "1" : "0";
    s = answer(s, ok);
  }
  return {
    payload: { kind: "threshold" as const, slug, seed, answers },
    live: sessionResult(s),
  };
}

/* ------------------------------------------------------------------ *
 * The round trip
 * ------------------------------------------------------------------ */

describe("store -> read -> recompute", () => {
  it("recalls a prestige session identical to the live one", () => {
    const { payload, live } = biasSession(2);
    recordResult("bias", POOL_VERSIONS.bias, payload, 1000);
    const recalled = recallBias();
    expect(recalled).not.toBeNull();
    expect(recalled!.result).toEqual(live);
    expect(recalled!.entry.savedAt).toBe(1000);
  });

  it("recalls a delicacy session identical to the live one", () => {
    const { payload, live } = delicacySession(3);
    recordResult("delicacy", POOL_VERSIONS.delicacy, payload, 2000);
    expect(recallDelicacy()!.result).toEqual(live);
  });

  it("recalls a threshold session identical to the live one", () => {
    const { payload, live } = thresholdSession("pitch", "pitch-drift", 7919, 20);
    recordResult("threshold", POOL_VERSIONS.threshold, payload, 3000);
    expect(recallThreshold("pitch")!.result).toEqual(live);
  });

  /** Threshold is stored per ladder, so two families coexist. */
  it("keeps threshold ladders in separate slots", () => {
    const pitch = thresholdSession("pitch", "pitch-drift", 7919, 20);
    const timing = thresholdSession("timing", "timing-smear", 15838, 40);
    recordResult("threshold", POOL_VERSIONS.threshold, pitch.payload, 1);
    recordResult("threshold", POOL_VERSIONS.threshold, timing.payload, 2);
    expect(recallThreshold("pitch")!.result).toEqual(pitch.live);
    expect(recallThreshold("timing")!.result).toEqual(timing.live);
  });

  it("last session wins for one instrument — no history to cherry-pick", () => {
    const weak = biasSession(0);
    const strong = biasSession(2);
    recordResult("bias", POOL_VERSIONS.bias, strong.payload, 1);
    recordResult("bias", POOL_VERSIONS.bias, weak.payload, 2);
    expect(recallBias()!.result).toEqual(weak.live);
  });
});

/* ------------------------------------------------------------------ *
 * Tampering
 * ------------------------------------------------------------------ */

describe("a tampered payload yields the engine's real answer, or nothing", () => {
  /**
   * THE PROPERTY THAT MATTERS. Nothing stored is a RESULT, so editing storage
   * cannot manufacture a better one — it can only change which answers you
   * claim to have given, and those get scored honestly (N3).
   */
  it("editing the answers changes the answers, not the verdict machinery", () => {
    const { payload } = biasSession(2);
    recordResult("bias", POOL_VERSIONS.bias, payload, 1);
    const honest = recallBias()!.result;
    expect(honest.verdict).toBe("swayed");

    // Rewrite the labeled pass so no rating moved at all.
    const flat = biasSession(0);
    recordResult("bias", POOL_VERSIONS.bias, flat.payload, 2);
    const tampered = recallBias()!.result;
    // The engine scored the NEW answers; it did not accept a claimed verdict.
    expect(tampered.verdict).toBe("steady");
    expect(tampered.pct).toBe(0);
    expect(tampered).toEqual(flat.live);
  });

  it("a hand-written verdict field is ignored entirely", () => {
    const { payload, live } = biasSession(0);
    recordResult("bias", POOL_VERSIONS.bias, payload, 1);
    // Smuggle a result into the envelope the way someone would try to.
    const raw = JSON.parse(localStorage.getItem("gym.result.bias")!);
    raw.payload.verdict = "swayed";
    raw.payload.pct = 99;
    raw.result = { pct: 99, verdict: "swayed" };
    localStorage.setItem("gym.result.bias", JSON.stringify(raw));

    const recalled = recallBias()!;
    expect(recalled.result).toEqual(live);
    expect(recalled.result.pct).toBe(0);
    expect(recalled.result.verdict).toBe("steady");
  });

  it.each([
    ["not json at all", "{{{"],
    ["json but not an object", '"hello"'],
    ["null", "null"],
    ["empty envelope", "{}"],
    ["wrong payload kind", JSON.stringify({ v: STORE_VERSION, poolVersion: 7, savedAt: 1, payload: { kind: "nope" } })],
    ["missing savedAt", JSON.stringify({ v: STORE_VERSION, poolVersion: 7, payload: { kind: "bias", blind: "a", labeled: "b" } })],
    ["savedAt is a string", JSON.stringify({ v: STORE_VERSION, poolVersion: 7, savedAt: "soon", payload: { kind: "bias", blind: "a", labeled: "b" } })],
  ])("returns null for %s", (_label, raw) => {
    localStorage.setItem("gym.result.bias", raw);
    expect(readResult("bias", 7)).toBeNull();
    expect(recallBias()).toBeNull();
  });

  it("returns null when the payload decodes to nothing", () => {
    recordResult("bias", POOL_VERSIONS.bias, { kind: "bias", blind: "1,2", labeled: "3,4" }, 1);
    // Well-formed envelope, well-formed JSON, ratings that do not match the pool.
    expect(readResult("bias", POOL_VERSIONS.bias)).not.toBeNull();
    expect(recallBias()).toBeNull();
  });

  it("refuses a threshold payload whose ladder no longer exists", () => {
    const payload: StoredPayload = { kind: "threshold", slug: "harpsichord", seed: 1, answers: "1010" };
    recordResult("threshold", POOL_VERSIONS.threshold, payload, 1);
    expect(recallThreshold("harpsichord")).toBeNull();
  });

  it("refuses answers longer than the replay cap rather than throwing", () => {
    const payload: StoredPayload = { kind: "threshold", slug: "pitch", seed: 1, answers: "1".repeat(5000) };
    recordResult("threshold", POOL_VERSIONS.threshold, payload, 1);
    expect(() => recallThreshold("pitch")).not.toThrow();
    expect(recallThreshold("pitch")).toBeNull();
  });
});

/* ------------------------------------------------------------------ *
 * Versioning and hostile environments
 * ------------------------------------------------------------------ */

describe("version gates", () => {
  it("drops an entry recorded against a different pool version", () => {
    const { payload } = delicacySession(3);
    recordResult("delicacy", POOL_VERSIONS.delicacy - 1, payload, 1);
    expect(readResult("delicacy", POOL_VERSIONS.delicacy)).toBeNull();
    expect(recallDelicacy()).toBeNull();
  });

  it("drops an entry written by a different envelope version", () => {
    const { payload } = biasSession(2);
    recordResult("bias", POOL_VERSIONS.bias, payload, 1);
    const raw = JSON.parse(localStorage.getItem("gym.result.bias")!);
    raw.v = STORE_VERSION + 1;
    localStorage.setItem("gym.result.bias", JSON.stringify(raw));
    expect(readResult("bias", POOL_VERSIONS.bias)).toBeNull();
  });
});

describe("storage that is absent or hostile", () => {
  it("reads null and writes nothing when localStorage is undefined (the server)", () => {
    vi.unstubAllGlobals();
    vi.stubGlobal("localStorage", undefined);
    expect(readResult("bias", 7)).toBeNull();
    expect(() => recordResult("bias", 7, { kind: "delicacy", picks: "x" }, 1)).not.toThrow();
    expect(recallBias()).toBeNull();
  });

  /** Safari private browsing throws on ACCESS, not on write. */
  it("survives a throwing accessor without taking the page down", () => {
    store.throwOnAccess = true;
    expect(() => readResult("bias", 7)).not.toThrow();
    expect(readResult("bias", 7)).toBeNull();
    expect(() => recordResult("bias", 7, { kind: "delicacy", picks: "x" }, 1)).not.toThrow();
    expect(() => forgetResult("bias")).not.toThrow();
    expect(() => recallBias()).not.toThrow();
  });
});

describe("forgetting", () => {
  it("removes one instrument and leaves the others", () => {
    recordResult("bias", POOL_VERSIONS.bias, biasSession(2).payload, 1);
    recordResult("delicacy", POOL_VERSIONS.delicacy, delicacySession(3).payload, 1);
    forgetResult("bias");
    expect(recallBias()).toBeNull();
    expect(recallDelicacy()).not.toBeNull();
  });
});
