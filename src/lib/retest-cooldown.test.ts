import { describe, it, expect, afterEach } from "vitest";
import {
  COOLDOWN_DAYS,
  COOLDOWN_MS,
  COOLDOWN_UNKNOWN,
  cooldownDaysLeft,
  cooldownFrom,
  cooldownFor,
  readLastCompleted,
  recordCompletion,
  serverSnapshot,
  subscribeCooldown,
} from "./retest-cooldown";

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 7, 21, 12, 0, 0);

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
    expect(() => recordCompletion("pitch-drift", NOW)).not.toThrow();
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
    expect(() => recordCompletion("pitch-drift", NOW)).not.toThrow();
    expect(cooldownFor("pitch-drift", NOW).blocked).toBe(false);
  });

  it("round-trips a completion, and keeps families separate", () => {
    const store = new Map<string, string>();
    g.localStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    };
    recordCompletion("pitch-drift", NOW);
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
