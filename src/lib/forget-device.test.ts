import { readFileSync, readdirSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PERSISTENT_PREFIX, forgetThisBrowser } from "./forget-device";
import { recordResult, readHistory, readResult } from "./result-store";
import { POOL_VERSIONS } from "./result-recall";
import { LEGACY_KEY_PREFIX, cooldownFor } from "./retest-cooldown";
import { FORGET } from "@/content/forget";

/**
 * E13/S4 (Track G3, PM ruling RT-G1 a) — "FORGET THIS BROWSER" HAS TO ACTUALLY
 * FORGET THE BROWSER.
 *
 * The interesting failure is not that it deletes too little of what it names.
 * It is that the product keeps state in more than one shape, and a control that
 * cleared the shape its author was thinking about would leave a person told
 * they had been forgotten while something about them remained. Two specific
 * traps are pinned below:
 *
 *  - THE RETIRED COOLDOWN KEYS. Flagged in E13/S2's red-team before this file
 *    existed. The gate falls back to `gym.lastCompleted.*` when the session
 *    store has nothing, so clearing only `gym.result.*` would leave somebody
 *    still refused a retest with the session behind that refusal deleted.
 *  - REMOVING WHILE WALKING. Deleting from `localStorage` inside a loop over
 *    its own indices reindexes it underneath and silently skips every other
 *    key, which passes any test that stores fewer than three things.
 */

class MemoryStorage implements Storage {
  private map = new Map<string, string>();
  throwOnAccess = false;
  get length() {
    return this.map.size;
  }
  clear() {
    if (this.throwOnAccess) throw new DOMException("blocked", "SecurityError");
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
  keys(): string[] {
    return [...this.map.keys()];
  }
}

let local: MemoryStorage;
let session: MemoryStorage;
const NOW = Date.UTC(2026, 8, 1, 12, 0, 0);
const DAY = 24 * 60 * 60 * 1000;

beforeEach(() => {
  local = new MemoryStorage();
  session = new MemoryStorage();
  vi.stubGlobal("localStorage", local);
  vi.stubGlobal("sessionStorage", session);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function finish(slug: string, at: number) {
  recordResult(
    "threshold",
    POOL_VERSIONS.threshold,
    { kind: "threshold", slug, seed: 1, answers: "1010" },
    at,
  );
}

describe("forgetting this browser", () => {
  it("removes the measured sessions", () => {
    recordResult("bias", POOL_VERSIONS.bias, { kind: "bias", blind: "5", labeled: "5" }, NOW);
    finish("pitch", NOW);
    expect(readResult("bias", POOL_VERSIONS.bias)).not.toBeNull();

    forgetThisBrowser();

    expect(readResult("bias", POOL_VERSIONS.bias)).toBeNull();
    expect(readHistory("threshold", POOL_VERSIONS.threshold, "pitch")).toEqual([]);
  });

  /** RT-G1 (a). A "forget me" that kept the gate would be keeping something. */
  it("opens the retest gate, because the session behind it is gone", () => {
    finish("pitch", NOW - DAY);
    expect(cooldownFor("pitch-drift", NOW).blocked).toBe(true);

    forgetThisBrowser();

    expect(cooldownFor("pitch-drift", NOW).blocked).toBe(false);
  });

  /**
   * THE TRAP E13/S2 LEFT BEHIND, PINNED. The gate reads a retired key when the
   * store is empty — which is exactly the state clearing produces. Sweep only
   * `gym.result.*` and this person is refused a retest forever, with nothing on
   * screen able to explain why.
   */
  it("removes the retired cooldown keys too, not just the sessions", () => {
    local.setItem(LEGACY_KEY_PREFIX + "pitch-drift", String(NOW - DAY));
    expect(cooldownFor("pitch-drift", NOW).blocked).toBe(true);

    forgetThisBrowser();

    expect(local.getItem(LEGACY_KEY_PREFIX + "pitch-drift")).toBeNull();
    expect(cooldownFor("pitch-drift", NOW).blocked).toBe(false);
  });

  /**
   * REMOVING WHILE WALKING SKIPS EVERY OTHER KEY. Six is the smallest count
   * that makes the bug unambiguous; with two, a broken sweep still looks right
   * half the time.
   */
  it("removes every key, not every other one", () => {
    for (const slug of ["pitch", "timing", "compression"]) finish(slug, NOW);
    recordResult("bias", POOL_VERSIONS.bias, { kind: "bias", blind: "5", labeled: "5" }, NOW);
    recordResult("delicacy", POOL_VERSIONS.delicacy, { kind: "delicacy", picks: "a" }, NOW);
    local.setItem(LEGACY_KEY_PREFIX + "pitch-drift", String(NOW));
    expect(local.keys().length).toBe(6);

    const outcome = forgetThisBrowser();

    expect(outcome.removed).toBe(6);
    expect(local.keys()).toEqual([]);
  });

  it("leaves storage that is not ours alone", () => {
    local.setItem("someone-elses-key", "keep me");
    finish("pitch", NOW);
    forgetThisBrowser();
    expect(local.getItem("someone-elses-key")).toBe("keep me");
  });

  it("clears the in-flight session state as well", () => {
    session.setItem("vc_sid", "abc");
    const outcome = forgetThisBrowser();
    expect(outcome.clearedSession).toBe(true);
    expect(session.getItem("vc_sid")).toBeNull();
  });

  it("does not throw where storage throws on access", () => {
    local.throwOnAccess = true;
    session.throwOnAccess = true;
    expect(() => forgetThisBrowser()).not.toThrow();
  });

  it("does not throw on the server, where neither store exists", () => {
    vi.unstubAllGlobals();
    vi.stubGlobal("localStorage", undefined);
    vi.stubGlobal("sessionStorage", undefined);
    expect(() => forgetThisBrowser()).not.toThrow();
    expect(forgetThisBrowser()).toEqual({ removed: 0, clearedSession: false });
  });
});

describe("the control's copy names everything it takes", () => {
  /**
   * A CONTROL THAT QUIETLY GREW A FOURTH THING TO DELETE would be taking
   * something the person never agreed to lose. Every family the sweep reaches
   * has to appear in the sentence shown before the second tap.
   */
  it.each([
    ["the finished sessions", ["sessions"]],
    ["the answers behind them", ["answers"]],
    ["the retest gate", ["retest"]],
    ["the in-flight session state", ["in-flight"]],
  ])("names %s", (_label, words) => {
    const body = FORGET.body.toLowerCase();
    expect(words.some((w) => body.includes(w)), `FORGET.body must name ${words.join("/")}`).toBe(true);
  });

  /** N3: it must not claim to undo what has already left the browser. */
  it("refuses to claim it can recall what analytics already received", () => {
    expect(FORGET.limit.toLowerCase()).toContain("analytics");
    expect(FORGET.limit.toLowerCase()).toContain("cannot");
  });

  it("says what goes BEFORE the destructive tap, not after it", () => {
    const source = readFileSync("src/components/ForgetThisBrowser.tsx", "utf8");
    const bodyAt = source.indexOf("{FORGET.body}");
    const confirmAt = source.indexOf("{FORGET.confirm}");
    expect(bodyAt).toBeGreaterThan(-1);
    expect(confirmAt).toBeGreaterThan(-1);
    expect(bodyAt).toBeLessThan(confirmAt);
  });

  /**
   * IT MUST NOT READ THE HISTORY. E13/S5 holds the project page's "retest arc"
   * row to `planned` with the predicate "no result surface reads the history",
   * so a convenience count here would make a public page claim a feature this
   * control is not.
   */
  it("reads nothing, so it cannot flip the roadmap predicate", () => {
    const source = readFileSync("src/components/ForgetThisBrowser.tsx", "utf8");
    for (const fn of ["readHistory(", "readResult(", "recallBias(", "recallThreshold("]) {
      expect(source.includes(fn), `the clear control must not call ${fn}`).toBe(false);
    }
  });
});

describe("the namespace sweep is enough to be called forgetting", () => {
  /**
   * THE SWEEP IS ONLY HONEST IF EVERYTHING PERSISTENT IS INSIDE IT. This is the
   * assertion the module's comment leans on rather than restating: there is
   * exactly ONE `localStorage` write in the product, it is the session store,
   * and its key is built from a prefix inside the swept namespace. A second
   * writer anywhere else would make "forget this browser" a false promise the
   * moment it landed.
   */
  it("finds no localStorage writer outside the session store", () => {
    const writers: string[] = [];
    for (const root of ["src"]) {
      for (const entry of readdirSync(root, { recursive: true, encoding: "utf8" })) {
        if (typeof entry !== "string") continue;
        if (!entry.endsWith(".ts") && !entry.endsWith(".tsx")) continue;
        if (entry.includes(".test.")) continue;
        const file = root + "/" + entry.split(String.fromCharCode(92)).join("/");
        const source = readFileSync(file, "utf8");
        const mutates =
          source.includes("localStorage.setItem") || source.includes("localStorage[");
        if (mutates) writers.push(file);
      }
    }
    expect(
      writers,
      "Only the session store may persist to localStorage, or the namespace sweep in " +
        "forget-device.ts stops being a complete answer. Found: " +
        writers.join(", "),
    ).toEqual(["src/lib/result-store.ts"]);
  });

  it("sweeps the namespace both known writers use", () => {
    expect("gym.result.".startsWith(PERSISTENT_PREFIX)).toBe(true);
    expect(LEGACY_KEY_PREFIX.startsWith(PERSISTENT_PREFIX)).toBe(true);
  });
});
