import { readFileSync } from "node:fs";
import { describe, it, expect, afterEach } from "vitest";
import {
  COOLDOWN_DAYS,
  COOLDOWN_MS,
  COOLDOWN_UNKNOWN,
  LEGACY_KEY_PREFIX,
  cooldownDaysLeft,
  cooldownFrom,
  cooldownFor,
  readLastCompleted,
  serverSnapshot,
  subscribeCooldown,
} from "./retest-cooldown";
import { recordResult } from "./result-store";
import { POOL_VERSIONS } from "./result-recall";

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 7, 21, 12, 0, 0);

/**
 * E13/S2 — THE GATE NO LONGER HAS A WRITER OF ITS OWN, so these helpers finish
 * a session the way the flow does: one call, to the session store. If the
 * cooldown could still be set independently of a recorded session, the two
 * records could disagree, which is the defect this slice removes.
 */
const g0 = globalThis as { localStorage?: unknown };

function mountStore(seed?: Record<string, string>): Map<string, string> {
  const map = new Map<string, string>(Object.entries(seed ?? {}));
  g0.localStorage = {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
  };
  return map;
}

function finishPitch(at: number, poolVersion = POOL_VERSIONS.threshold): void {
  recordResult(
    "threshold",
    poolVersion,
    { kind: "threshold", slug: "pitch", seed: 1, answers: "1010" },
    at,
  );
}

describe("RT-89a — the retest cooldown decides", () => {
  it("lets a first-ever session through", () => {
    expect(cooldownFrom(null, NOW)).toEqual({ blocked: false, readyAt: null, daysLeft: 0 });
  });

  it("blocks a retest taken minutes later", () => {
    const state = cooldownFrom(NOW - 60_000, NOW);
    expect(state.blocked).toBe(true);
    expect(state.daysLeft).toBe(COOLDOWN_DAYS);
  });

  it("counts down whole days, rounding UP so it never promises early", () => {
    // 3.2 days left must read as 4, not 3: a user told "in 3 days" who returns
    // in 3 days and is refused again has been lied to by a rounding mode.
    const state = cooldownFrom(NOW - (COOLDOWN_MS - 3.2 * DAY), NOW);
    expect(state.daysLeft).toBe(4);
  });

  it("never says zero days while still blocked", () => {
    const state = cooldownFrom(NOW - (COOLDOWN_MS - 60_000), NOW);
    expect(state.blocked).toBe(true);
    expect(state.daysLeft).toBe(1);
  });

  it("opens exactly at the boundary, not a millisecond after", () => {
    expect(cooldownFrom(NOW - COOLDOWN_MS, NOW).blocked).toBe(false);
    expect(cooldownFrom(NOW - COOLDOWN_MS + 1, NOW).blocked).toBe(true);
  });

  /**
   * THE LOCKOUT CASE. A future timestamp is what a corrected clock, a restored
   * backup, or a hand-typed value leaves behind. If it counted as a completion
   * the cooldown would never expire and the user could never take the test
   * again, with nothing on screen explaining why. It fails open on purpose.
   */
  it("fails open on a timestamp from the future rather than locking forever", () => {
    expect(cooldownFrom(NOW + 400 * DAY, NOW).blocked).toBe(false);
  });

  it("fails open on garbage rather than throwing", () => {
    expect(cooldownFrom(Number.NaN, NOW).blocked).toBe(false);
    expect(cooldownFrom(Number.POSITIVE_INFINITY, NOW).blocked).toBe(false);
  });
});

/**
 * The storage half. `localStorage` does not exist in this environment, which is
 * the same condition as server rendering — so these prove the SSR path cannot
 * throw, which is the bug that would white-screen the Gym rather than skip a
 * gate.
 */
describe("RT-89a — storage never takes the page down with it", () => {
  const g = globalThis as { localStorage?: unknown };
  afterEach(() => {
    delete g.localStorage;
  });

  it("reads null and records silently when there is no localStorage at all", () => {
    expect(typeof localStorage).toBe("undefined");
    expect(readLastCompleted("pitch-drift")).toBeNull();
    expect(() => finishPitch(NOW)).not.toThrow();
    expect(cooldownFor("pitch-drift", NOW).blocked).toBe(false);
  });

  it("survives a localStorage that throws on every access (Safari private mode)", () => {
    g.localStorage = {
      getItem() {
        throw new Error("SecurityError: The operation is insecure.");
      },
      setItem() {
        throw new Error("QuotaExceededError");
      },
    };
    expect(readLastCompleted("pitch-drift")).toBeNull();
    expect(() => finishPitch(NOW)).not.toThrow();
    expect(cooldownFor("pitch-drift", NOW).blocked).toBe(false);
  });

  it("round-trips a completion, and keeps families separate", () => {
    mountStore();
    finishPitch(NOW);
    expect(readLastCompleted("pitch-drift")).toBe(NOW);

    // The D4 amendment says PER FAMILY: finishing pitch must not cost the user
    // their timing session, which is a different instrument on different audio.
    expect(cooldownFor("pitch-drift", NOW).blocked).toBe(true);
    expect(cooldownFor("timing-smear", NOW).blocked).toBe(false);
    expect(cooldownFor("lossy-artifact", NOW).blocked).toBe(false);

    expect(cooldownFor("pitch-drift", NOW + COOLDOWN_MS).blocked).toBe(false);
  });

  it("ignores a stored value that is not a number", () => {
    g.localStorage = {
      getItem: () => "next tuesday",
      setItem: () => {},
    };
    expect(readLastCompleted("pitch-drift")).toBeNull();
    expect(cooldownFor("pitch-drift", NOW).blocked).toBe(false);
  });
});

/* ------------------------------------------------------------------ *
 * E13/S2 — the gate reads the session store
 * ------------------------------------------------------------------ */

describe("the cooldown is derived from the session history, not a key of its own", () => {
  const g = globalThis as { localStorage?: unknown };
  afterEach(() => {
    delete g.localStorage;
  });

  it("blocks on a session finished two days ago and opens after eight", () => {
    mountStore();
    finishPitch(NOW - 2 * DAY);
    expect(cooldownFor("pitch-drift", NOW).blocked).toBe(true);
    expect(cooldownFor("pitch-drift", NOW).daysLeft).toBe(5);

    mountStore();
    finishPitch(NOW - 8 * DAY);
    expect(cooldownFor("pitch-drift", NOW).blocked).toBe(false);
  });

  it("takes the most recent session when several are on file", () => {
    mountStore();
    finishPitch(NOW - 30 * DAY);
    finishPitch(NOW - 20 * DAY);
    finishPitch(NOW - DAY);
    expect(readLastCompleted("pitch-drift")).toBe(NOW - DAY);
    expect(cooldownFor("pitch-drift", NOW).blocked).toBe(true);
  });

  /**
   * THE REGRESSION THIS SLICE EXISTS TO AVOID, WRITTEN BEFORE THE CODE.
   *
   * Every other read of the session store drops sessions recorded against a
   * different pool version, and rightly: positional answer tokens scored
   * against a reordered pool answer different questions. Reuse that gated read
   * here and a routine re-render of the clips unblocks EVERY cooldown on the
   * planet the moment it deploys — a validity gate failing open because an
   * unrelated number moved, silently, with nothing on screen to notice.
   *
   * The answers stop being scoreable. The fact that this person sat through a
   * session two days ago does not.
   */
  it("still blocks when the session was answered against a different pool", () => {
    mountStore();
    finishPitch(NOW - 2 * DAY, POOL_VERSIONS.threshold + 1);
    expect(readLastCompleted("pitch-drift")).toBe(NOW - 2 * DAY);
    expect(cooldownFor("pitch-drift", NOW).blocked).toBe(true);
  });

  it("still honours the retired key on a browser that predates the store", () => {
    // E5/S5 shipped this gate; E8/S7 shipped the store. A session finished in
    // between left a cooldown with no session behind it.
    mountStore({ [LEGACY_KEY_PREFIX + "pitch-drift"]: String(NOW - DAY) });
    expect(readLastCompleted("pitch-drift")).toBe(NOW - DAY);
    expect(cooldownFor("pitch-drift", NOW).blocked).toBe(true);
  });

  it("prefers the session store when both records exist", () => {
    mountStore({ [LEGACY_KEY_PREFIX + "pitch-drift"]: String(NOW - 300 * DAY) });
    finishPitch(NOW - DAY);
    expect(readLastCompleted("pitch-drift")).toBe(NOW - DAY);
    expect(cooldownFor("pitch-drift", NOW).blocked).toBe(true);
  });

  it("keeps the ladders apart when reading from the store", () => {
    mountStore();
    finishPitch(NOW - DAY);
    expect(cooldownFor("pitch-drift", NOW).blocked).toBe(true);
    expect(cooldownFor("timing-smear", NOW).blocked).toBe(false);
    expect(cooldownFor("lossy-artifact", NOW).blocked).toBe(false);
  });

  /**
   * ONE MECHANISM MEANS ONE WRITER. Asserted against the source because there
   * is no other way to prove a module does NOT do something: a behavioural test
   * can only show that the writes it looked for are absent.
   */
  it("writes nothing at all — no form of storage mutation appears in the module", () => {
    const source = readFileSync("src/lib/retest-cooldown.ts", "utf8");
    /*
     * EVERY SPELLING, not just the obvious one. The first version of this
     * checked for `setItem` alone, which a write done as `localStorage[k] = v`
     * walks straight past — a needle narrower than the rule it claims to
     * enforce is the failure this repository keeps finding in its own guards.
     */
    const mutations = ["setItem", "removeItem", ".clear()", "localStorage["];
    const found = mutations.filter((m) => source.includes(m));
    expect(found, `retest-cooldown.ts must not write storage; found: ${found.join(", ")}`).toEqual([]);
  });

  it("is the only thing the threshold flow records on completion", () => {
    const flow = readFileSync("src/app/threshold/ThresholdFlow.tsx", "utf8");
    expect(flow.includes("recordCompletion")).toBe(false);
    // Braced form, not the bare identifier: `recordResult` is a substring of
    // any longer name built from it.
    const calls = flow.split("recordResult(").length - 1;
    expect(calls, "the flow should record exactly one session per completion").toBe(1);
  });
});

/**
 * THE SNAPSHOT CONTRACT. `useSyncExternalStore` re-renders forever if the
 * snapshot is not referentially stable, and the three states have to stay
 * distinguishable as one number or the UI cannot tell "server, don't know yet"
 * from "ready" — the difference between disabling the Start button for a frame
 * and offering a session that is about to be refused.
 */
describe("RT-89a — the store snapshot React consumes", () => {
  const g = globalThis as { localStorage?: unknown };
  afterEach(() => {
    delete g.localStorage;
  });

  it("keeps 'unknown' distinct from 'ready'", () => {
    expect(serverSnapshot()).toBe(COOLDOWN_UNKNOWN);
    expect(COOLDOWN_UNKNOWN).toBeLessThan(0);
    expect(cooldownFrom(null, NOW).daysLeft).toBe(0);
    expect(serverSnapshot()).not.toBe(0);
  });

  /**
   * ANCHORED TO THE REAL CLOCK, because `cooldownDaysLeft` reads it. The first
   * version of this test seeded the store from a hardcoded NOW and asserted 6;
   * it passed or failed depending on what day it ran, which is a test that
   * measures the calendar. One day ago must leave six, whenever "now" is.
   */
  it("returns a stable primitive across repeated reads, not a fresh object", () => {
    const key = "gym.lastCompleted.pitch-drift";
    const store = new Map<string, string>([[key, String(Date.now() - DAY)]]);
    g.localStorage = { getItem: (k: string) => store.get(k) ?? null, setItem: () => {} };
    const a = cooldownDaysLeft("pitch-drift");
    const b = cooldownDaysLeft("pitch-drift");
    expect(a).toBe(b);
    expect(Object.is(a, b)).toBe(true);
    expect(a).toBe(COOLDOWN_DAYS - 1);
  });

  it("subscribes to cross-tab writes and unsubscribes cleanly", () => {
    const added: string[] = [];
    const removed: string[] = [];
    const w = globalThis as unknown as {
      window?: { addEventListener: unknown; removeEventListener: unknown };
    };
    w.window = {
      addEventListener: (e: string) => added.push(e),
      removeEventListener: (e: string) => removed.push(e),
    };
    const unsubscribe = subscribeCooldown(() => {});
    expect(added).toEqual(["storage"]);
    unsubscribe();
    expect(removed).toEqual(["storage"]);
    delete w.window;
  });

  it("subscribing on the server is a no-op that does not throw", () => {
    expect(typeof window).toBe("undefined");
    const unsubscribe = subscribeCooldown(() => {});
    expect(() => unsubscribe()).not.toThrow();
  });
});
