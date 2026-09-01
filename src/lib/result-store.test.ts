import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  HISTORY_CAP,
  STORE_VERSION,
  forgetResult,
  readHistory,
  readResult,
  slotSignature,
  recordResult,
  type StoredPayload,
} from "./result-store";
import * as resultStore from "./result-store";
import { recallBias, recallDelicacy, recallThreshold, POOL_VERSIONS } from "./result-recall";
import { BIAS_CLIPS, BIAS_INSTRUMENT_ID } from "@/content/bias/items";
import {
  BIAS_SCALE_MAX,
  BIAS_SCALE_MIN,
  computeBiasResult,
  decodeBiasRatings,
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

  /**
   * RENAMED IN E13/S1, and the rename is the point. It used to read "last
   * session wins — no history to cherry-pick", which was a claim about the
   * SHAPE of the store. There is a history now, so that name would have been a
   * false statement about scope on a test that still passed. What the test
   * actually pins is unchanged and is the property that matters: the session
   * recalled is the most recent one, never the flattering one.
   */
  it("recalls the latest session even when an earlier one scored better", () => {
    const weak = biasSession(0);
    const strong = biasSession(2);
    recordResult("bias", POOL_VERSIONS.bias, strong.payload, 1);
    recordResult("bias", POOL_VERSIONS.bias, weak.payload, 2);
    expect(recallBias()!.result).toEqual(weak.live);
    // And the better one is still on file — kept, but never preferred.
    expect(readHistory("bias", POOL_VERSIONS.bias).map((e) => e.savedAt)).toEqual([1, 2]);
  });
});

/* ------------------------------------------------------------------ *
 * The history itself (E13/S1, RT-G b)
 * ------------------------------------------------------------------ */

describe("a slot keeps a chronological history", () => {
  it("reads back two sessions, oldest first, both recomputable", () => {
    const first = biasSession(0);
    const second = biasSession(3);
    recordResult("bias", POOL_VERSIONS.bias, first.payload, 1000);
    recordResult("bias", POOL_VERSIONS.bias, second.payload, 2000);

    const history = readHistory("bias", POOL_VERSIONS.bias);
    expect(history).toHaveLength(2);
    expect(history.map((e) => e.savedAt)).toEqual([1000, 2000]);
    expect(history[0].payload).toEqual(first.payload);
    expect(history[1].payload).toEqual(second.payload);
    // Both are real sessions, not just bytes: each scores to its live result.
    expect(
      computeBiasResult(
        BIAS_INSTRUMENT_ID,
        BIAS_CLIPS,
        decodeBiasRatings(BIAS_CLIPS, (history[0].payload as { blind: string }).blind)!,
        decodeBiasRatings(BIAS_CLIPS, (history[0].payload as { labeled: string }).labeled)!,
      ),
    ).toEqual(first.live);
  });

  it("keeps each threshold ladder's history separate", () => {
    const p1 = thresholdSession("pitch", "pitch-drift", 7919, 20);
    const p2 = thresholdSession("pitch", "pitch-drift", 104729, 30);
    const t1 = thresholdSession("timing", "timing-smear", 15838, 40);
    recordResult("threshold", POOL_VERSIONS.threshold, p1.payload, 1);
    recordResult("threshold", POOL_VERSIONS.threshold, t1.payload, 2);
    recordResult("threshold", POOL_VERSIONS.threshold, p2.payload, 3);
    expect(readHistory("threshold", POOL_VERSIONS.threshold, "pitch")).toHaveLength(2);
    expect(readHistory("threshold", POOL_VERSIONS.threshold, "timing")).toHaveLength(1);
    expect(recallThreshold("pitch")!.result).toEqual(p2.live);
  });

  it("evicts the oldest and only the oldest at the cap", () => {
    for (let i = 1; i <= HISTORY_CAP + 1; i += 1) {
      recordResult("bias", POOL_VERSIONS.bias, biasSession(i % 4).payload, i);
    }
    const savedAt = readHistory("bias", POOL_VERSIONS.bias).map((e) => e.savedAt);
    expect(savedAt).toHaveLength(HISTORY_CAP);
    // Contiguous, newest at the end, and session 1 is the one that went.
    expect(savedAt[0]).toBe(2);
    expect(savedAt[savedAt.length - 1]).toBe(HISTORY_CAP + 1);
    expect(savedAt).toEqual(savedAt.map((_, i) => i + 2));
  });

  it("returns only the sessions answered against the pool asked for", () => {
    recordResult("bias", POOL_VERSIONS.bias - 1, biasSession(1).payload, 1);
    recordResult("bias", POOL_VERSIONS.bias, biasSession(2).payload, 2);
    recordResult("bias", POOL_VERSIONS.bias - 1, biasSession(3).payload, 3);
    expect(readHistory("bias", POOL_VERSIONS.bias).map((e) => e.savedAt)).toEqual([2]);
    expect(readResult("bias", POOL_VERSIONS.bias)!.savedAt).toBe(2);
    // The others are not returned, but they are not destroyed either: a rolled
    // back deploy gets them back.
    expect(readHistory("bias", POOL_VERSIONS.bias - 1).map((e) => e.savedAt)).toEqual([1, 3]);
  });

  it("drops one corrupt session without losing its neighbours", () => {
    recordResult("bias", POOL_VERSIONS.bias, biasSession(1).payload, 1);
    recordResult("bias", POOL_VERSIONS.bias, biasSession(2).payload, 2);
    const raw = JSON.parse(localStorage.getItem("gym.result.bias")!);
    raw.sessions.splice(1, 0, { poolVersion: POOL_VERSIONS.bias, savedAt: "corrupt" });
    localStorage.setItem("gym.result.bias", JSON.stringify(raw));
    expect(readHistory("bias", POOL_VERSIONS.bias).map((e) => e.savedAt)).toEqual([1, 2]);
  });

  /**
   * THE ANTI-CHERRY-PICK PROPERTY, AS A GUARD RATHER THAN A COMMENT.
   *
   * RT-90a(b) removed "your best result" from this product because choosing
   * which of your own measurements to report is selection on the answer. The
   * store now holds the raw material for exactly that mistake, so the rule is
   * pinned here: this module may expose no accessor named for a superlative.
   * It cannot stop someone writing `Math.max` over `readHistory` elsewhere —
   * it stops the store itself from offering it as a convenience.
   */
  /**
   * THE CROSS-TAB SIGNAL, PINNED AT THE EXACT POINT IT USED TO GO SILENT.
   *
   * `AcrossSessions` compared byte lengths. At the cap, appending a session
   * evicts the oldest, and for the prestige test — whose payloads are all
   * sixteen single digits and whose timestamps are all thirteen digits — the
   * envelope is the same size afterwards. 3716 bytes before, 3716 after. A tab
   * open in another window would have kept rendering evicted sessions.
   */
  it("changes its signature when a session is appended AT the cap", () => {
    for (let i = 1; i <= HISTORY_CAP; i += 1) {
      recordResult("bias", POOL_VERSIONS.bias, biasSession(2).payload, 1756000000000 + i);
    }
    const before = slotSignature("bias");
    const bytesBefore = localStorage.getItem("gym.result.bias")!.length;

    recordResult("bias", POOL_VERSIONS.bias, biasSession(2).payload, 1756000000000 + HISTORY_CAP + 1);
    const after = slotSignature("bias");
    const bytesAfter = localStorage.getItem("gym.result.bias")!.length;

    // The trap: the raw size genuinely does not move.
    expect(bytesAfter).toBe(bytesBefore);
    expect(after).not.toBe(before);
  });

  it("signs an absent slot differently from an empty one", () => {
    expect(slotSignature("bias")).toBe("-");
    localStorage.setItem("gym.result.bias", JSON.stringify({ v: STORE_VERSION, sessions: [] }));
    expect(slotSignature("bias")).not.toBe("-");
  });

  it("exposes no way to ask for a best, a maximum or a personal record", () => {
    /*
     * WORD MEMBERSHIP, NOT SUBSTRING. A substring test flagged `recordResult`
     * on "record" — the same class of error as the guard that matched
     * "ExpertPanelX", read backwards: a needle that fires on a fragment tells
     * you nothing about the identifier it fired on. Names are split on their
     * camelCase boundaries and the WORDS are compared.
     */
    const banned = new Set(["best", "max", "maximum", "top", "peak", "highest", "greatest", "personal"]);
    const words = (name: string): string[] => {
      const out: string[] = [];
      let current = "";
      for (const ch of name) {
        if (ch >= "A" && ch <= "Z" && current !== "") {
          out.push(current.toLowerCase());
          current = "";
        }
        current += ch;
      }
      if (current !== "") out.push(current.toLowerCase());
      return out;
    };
    const offenders = Object.keys(resultStore).filter((name) =>
      words(name).some((w) => banned.has(w)),
    );
    expect(offenders, `result-store exports a superlative accessor: ${offenders.join(", ")}`).toEqual(
      [],
    );
  });
});

/* ------------------------------------------------------------------ *
 * The v1 slot that is already sitting in somebody's browser
 * ------------------------------------------------------------------ */

describe("a v1 envelope is migrated, never discarded", () => {
  /** Byte-for-byte what E8/S7 wrote: one entry at the top level, `v: 1`. */
  function writeV1(payload: StoredPayload, poolVersion: number, savedAt: number) {
    localStorage.setItem(
      "gym.result.bias",
      JSON.stringify({ v: 1, poolVersion, savedAt, payload }),
    );
  }

  it("reads as a history of one, and still recomputes", () => {
    const { payload, live } = biasSession(2);
    writeV1(payload, POOL_VERSIONS.bias, 500);
    expect(readHistory("bias", POOL_VERSIONS.bias)).toHaveLength(1);
    expect(readResult("bias", POOL_VERSIONS.bias)!.savedAt).toBe(500);
    expect(recallBias()!.result).toEqual(live);
  });

  /*
   * BOTH HALVES IN ONE TEST, because the negative half alone is worthless: an
   * assertion that a v1 envelope reads back as nothing ALSO passes when the
   * migration has been deleted entirely. Found by deleting it — the break
   * harness took down two v1 tests and left this one green.
   */
  it("is still pool-version gated, and does read when the pool matches", () => {
    writeV1(biasSession(2).payload, POOL_VERSIONS.bias - 1, 500);
    expect(readHistory("bias", POOL_VERSIONS.bias)).toEqual([]);
    expect(readHistory("bias", POOL_VERSIONS.bias - 1)).toHaveLength(1);
  });

  it("keeps the old session when the next one is recorded", () => {
    writeV1(biasSession(2).payload, POOL_VERSIONS.bias, 500);
    recordResult("bias", POOL_VERSIONS.bias, biasSession(0).payload, 900);
    expect(readHistory("bias", POOL_VERSIONS.bias).map((e) => e.savedAt)).toEqual([500, 900]);
    // And it is written back in the new shape, not left half-migrated.
    expect(JSON.parse(localStorage.getItem("gym.result.bias")!).v).toBe(STORE_VERSION);
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
    // (E13/S1: reaches one level deeper now that a slot holds a list.)
    const raw = JSON.parse(localStorage.getItem("gym.result.bias")!);
    raw.sessions[0].payload.verdict = "swayed";
    raw.sessions[0].payload.pct = 99;
    raw.sessions[0].result = { pct: 99, verdict: "swayed" };
    raw.result = { pct: 99, verdict: "swayed" };
    localStorage.setItem("gym.result.bias", JSON.stringify(raw));

    const recalled = recallBias()!;
    expect(recalled.result).toEqual(live);
    expect(recalled.result.pct).toBe(0);
    expect(recalled.result.verdict).toBe("steady");
  });

  /**
   * E13/S1 — THESE WERE ABOUT TO GO QUIETLY BLIND.
   *
   * Three of these cases used to be SESSION-level malformations: an envelope
   * with a bad `payload` hanging off it. The moment a slot became `{v, sessions}`
   * those same bytes stopped reaching the payload checks at all — they now fail
   * one step earlier, at "this envelope has no sessions list", and would have
   * kept passing under labels claiming to test something they no longer touched.
   * Split deliberately: envelope shape below, session shape in its own block,
   * each malformation wrapped in a VALID envelope so it has to be rejected on
   * its own merits.
   */
  it.each([
    ["not json at all", "{{{"],
    ["json but not an object", '"hello"'],
    ["null", "null"],
    ["empty envelope", "{}"],
    ["a future envelope version", JSON.stringify({ v: STORE_VERSION + 1, sessions: [] })],
    ["sessions is not an array", JSON.stringify({ v: STORE_VERSION, sessions: { kind: "bias" } })],
    ["sessions is missing", JSON.stringify({ v: STORE_VERSION })],
  ])("returns null for %s", (_label, raw) => {
    localStorage.setItem("gym.result.bias", raw);
    expect(readResult("bias", 7)).toBeNull();
    expect(readHistory("bias", 7)).toEqual([]);
    expect(recallBias()).toBeNull();
  });

  it.each([
    ["wrong payload kind", { poolVersion: 7, savedAt: 1, payload: { kind: "nope" } }],
    ["no payload at all", { poolVersion: 7, savedAt: 1 }],
    ["missing savedAt", { poolVersion: 7, payload: { kind: "bias", blind: "a", labeled: "b" } }],
    ["savedAt is a string", { poolVersion: 7, savedAt: "soon", payload: { kind: "bias", blind: "a", labeled: "b" } }],
    ["missing poolVersion", { savedAt: 1, payload: { kind: "bias", blind: "a", labeled: "b" } }],
    ["bias ratings are not strings", { poolVersion: 7, savedAt: 1, payload: { kind: "bias", blind: 1, labeled: 2 } }],
    ["threshold seed is fractional", { poolVersion: 7, savedAt: 1, payload: { kind: "threshold", slug: "pitch", seed: 1.5, answers: "1" } }],
  ])("drops a session that is %s, inside a valid envelope", (_label, session) => {
    localStorage.setItem("gym.result.bias", JSON.stringify({ v: STORE_VERSION, sessions: [session] }));
    expect(readResult("bias", 7)).toBeNull();
    expect(readHistory("bias", 7)).toEqual([]);
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
