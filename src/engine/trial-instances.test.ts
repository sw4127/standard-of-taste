/**
 * DOES CYCLING ACTUALLY BUY ANYTHING? (E4/S2c, 2026-08-15)
 *
 * The claim behind RT-69 is that picking recordings at random wastes most of the
 * approved 99 MB render budget, and that cycling does not. That is a measurable
 * claim, so it is measured here against the REAL staircase rather than argued
 * from the birthday problem.
 *
 * The quantity that matters is the worst repeat count: how many times does one
 * listener hear the SAME recording at the SAME level in a single session. That
 * is the number at which recognising the clip starts to substitute for hearing
 * the flaw.
 *
 * SIMULATED (N3): zero real responses.
 */
import { describe, expect, it } from "vitest";
import { observer as obs, rng, runStaircaseSession, type Observer } from "@/analytics/observer";
import { DEFAULT_STAIRCASE, type StaircaseConfig } from "./staircase";
import { assignInstances, instancesForFamily, pickInstance, sessionInstances, type TrialInstance } from "./trial-instances";
import { eligibleSources, eligibleWindows, isRetiredSource } from "./staircase-pool";

const PITCH = [3.1, 4.4, 6.3, 8.8, 12.5, 17.7, 25, 35.4, 50, 70.7, 100];

/** The approved render plan (RT-66a): 3 sources x 3 windows = 9 instances. */
/**
 * THE REAL POOL, from the manifest (E4/S4/S4).
 *
 * This was a hand-written list of "pb1, pb6, pb8 x 30, 75, 120" — nine windows,
 * one of which (pb8@120s) DOES NOT EXIST: pb8 is 110.06 s long. It also assumed
 * every family draws from the same nine, which is false in both directions —
 * timing draws from 7 after RT-75a excluded two windows, and lossy from 24
 * across a different source set entirely.
 */
const PLANNED: TrialInstance[] = eligibleWindows("pitch-drift");

const cfg = (levels: number[]): StaircaseConfig => ({
  ...DEFAULT_STAIRCASE,
  levels,
  startIndex: levels.length - 3,
});

const key = (i: TrialInstance) => `${i.sourceId}@${i.startSec}`;
const quantile = (v: number[], q: number) => {
  const s = [...v].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(q * s.length))];
};

/** Worst (level, instance) repeat count in one session. */
function worstRepeat(levelSequence: number[], chosen: TrialInstance[]) {
  const counts = new Map<string, number>();
  let worst = 0;
  levelSequence.forEach((lvl, t) => {
    const k = `${lvl}|${key(chosen[t])}`;
    const n = (counts.get(k) ?? 0) + 1;
    counts.set(k, n);
    if (n > worst) worst = n;
  });
  return worst;
}

function sessionLevels(o: Observer, seed: number) {
  const { state } = runStaircaseSession(o, seed, cfg(PITCH));
  return state.trials.map((t) => t.index);
}

describe("trial instances — cycling beats random, measured [SIMULATED]", () => {
  const SESSIONS = 2000;

  it("uses every rendered window before repeating any", () => {
    // The load-bearing guarantee: with 9 instances, the first 9 visits to a
    // level are 9 different recordings.
    const seen = Array.from({ length: PLANNED.length }, (_, v) => key(pickInstance(4, v, PLANNED, 12345)));
    expect(new Set(seen).size).toBe(PLANNED.length);
    // ...and the tenth wraps to the first, uniformly rather than randomly.
    expect(key(pickInstance(4, PLANNED.length, PLANNED, 12345))).toBe(seen[0]);
  });

  it("does not start every level, or every session, on the same recording", () => {
    const firstPerLevel = PITCH.map((_, lvl) => key(pickInstance(lvl, 0, PLANNED, 999)));
    expect(new Set(firstPerLevel).size, "levels all start on one window").toBeGreaterThan(1);
    const firstPerSession = [1, 2, 3, 4, 5, 6, 7, 8].map((s) => key(pickInstance(4, 0, PLANNED, s)));
    expect(new Set(firstPerSession).size, "sessions all start on one window").toBeGreaterThan(1);
  });

  it("MEASURES what cycling is worth against random selection", () => {
    const cycled: number[] = [];
    const random: number[] = [];
    for (let s = 1; s <= SESSIONS; s++) {
      const levels = sessionLevels(obs(25, 0.35), s * 7919);
      cycled.push(worstRepeat(levels, assignInstances(levels, PLANNED, s)));
      // The alternative RT-69 was weighed against: pick uniformly at random.
      const rand = rng(s * 104729);
      random.push(worstRepeat(levels, levels.map(() => PLANNED[Math.floor(rand() * PLANNED.length)])));
    }
    const row = (label: string, v: number[]) =>
      `[E4/S2c] ${label.padEnd(9)} median ${quantile(v, 0.5)} · p90 ${quantile(v, 0.9)} · p99 ${quantile(v, 0.99)} · max ${Math.max(...v)}`;
    console.log(`\n[E4/S2c] === WORST SAME-CLIP-SAME-LEVEL REPEATS PER SESSION [SIMULATED] ===`);
    console.log(`[E4/S2c] ${PLANNED.length} instances (RT-66a: 3 sources x 3 windows), ${SESSIONS} sessions`);
    console.log(row("cycled", cycled));
    console.log(row("random", random));
    const distinct = (v: TrialInstance[]) => new Set(v.map(key)).size;
    const levels0 = sessionLevels(obs(25, 0.35), 7919);
    console.log(
      `[E4/S2c] distinct windows used in one session — cycled ${distinct(assignInstances(levels0, PLANNED, 1))}/${PLANNED.length}`,
    );

    // The claim RT-69 was approved on: random wastes the budget, cycling does not.
    expect(quantile(cycled, 0.9)).toBeLessThan(quantile(random, 0.9));
    expect(Math.max(...cycled)).toBeLessThan(Math.max(...random));
  });

  it("is a pure function of the answers — the same session replays identically", () => {
    const levels = sessionLevels(obs(25, 0.35), 4242);
    expect(assignInstances(levels, PLANNED, 77)).toEqual(assignInstances(levels, PLANNED, 77));
  });
});

describe("trial instances — lossy is source-locked (RT-65)", () => {
  it("restricts a lossy session to one source's windows", () => {
    const locked = instancesForFamily("lossy-artifact", PLANNED, "pb6");
    expect(locked).toHaveLength(3);
    expect(new Set(locked.map((i) => i.sourceId))).toEqual(new Set(["pb6"]));
  });

  it("lets pitch and timing pool every source", () => {
    for (const family of ["pitch-drift", "timing-smear"]) {
      expect(instancesForFamily(family, PLANNED)).toHaveLength(9);
    }
  });

  it("refuses a lossy session that names no source, rather than picking one", () => {
    expect(() => instancesForFamily("lossy-artifact", PLANNED)).toThrow(/must name a source/);
    expect(() => instancesForFamily("lossy-artifact", PLANNED, "pb99")).toThrow(/no eligible windows/);
  });

  /**
   * THE UNCOMFORTABLE NUMBER, asserted so it cannot be forgotten between here
   * and E5. Lossy draws from 3 instances against a repeat load of 12, so its
   * clips repeat roughly four times each where pitch and timing repeat once or
   * twice. The approved render plan does not fix this; more windows on the
   * lossy source would.
   */
  it("records what source-locking now costs — which RT-84a mostly bought back", () => {
    // THIS TEST USED TO ASSERT lossy got a THIRD of the variety, because lossy
    // locked to one source's THREE windows against a pooled nine. RT-84a gave
    // every lossy source NINE windows of its own, so pb6 now matches the pooled
    // families exactly and only pb4 — which lost three windows to RT-86a — is
    // worse. The old claim is false and is replaced by the measurement.
    const levels = sessionLevels(obs(25, 0.35), 7919);
    const pooled = worstRepeat(levels, assignInstances(levels, instancesForFamily("pitch-drift", PLANNED), 1));
    const pb6 = worstRepeat(levels, assignInstances(levels, sessionInstances("lossy-artifact", "pb6"), 1));
    const pb4 = worstRepeat(levels, assignInstances(levels, sessionInstances("lossy-artifact", "pb4"), 1));
    console.log(`[E4/S4/S4] worst repeat — pooled ${pooled}, lossy pb6 (9 windows) ${pb6}, lossy pb4 (6 windows) ${pb4}`);
    // pb6 has as many windows as the pooled families, so it is no worse.
    expect(pb6).toBeLessThanOrEqual(pooled);
    // pb4 has six, and pays for it. This is the cost RT-86a accepted in
    // exchange for keeping pb4's full 192k->32k ladder.
    expect(pb4).toBeGreaterThanOrEqual(pooled);
  });
});


describe("the instance pool comes from the manifest, not from a hand-written list", () => {
  it("each family has its own window count — nine is not shared", () => {
    expect(eligibleWindows("pitch-drift")).toHaveLength(9);
    expect(eligibleWindows("timing-smear")).toHaveLength(7);
    expect(eligibleWindows("lossy-artifact")).toHaveLength(24);
  });

  it("never offers pb8@120s — a window in a recording 110s long", () => {
    for (const family of ["pitch-drift", "timing-smear", "lossy-artifact"]) {
      for (const w of eligibleWindows(family)) {
        expect(`${w.sourceId}@${w.startSec}`).not.toBe("pb8@120");
      }
    }
  });

  it("never offers a window RT-75a excluded from timing", () => {
    const keys = eligibleWindows("timing-smear").map((w) => `${w.sourceId}@${w.startSec}`);
    expect(keys).not.toContain("pb1@120");
    expect(keys).not.toContain("pb6@75");
    // ...which pitch, measured separately, still keeps.
    expect(eligibleWindows("pitch-drift").map((w) => `${w.sourceId}@${w.startSec}`)).toContain("pb1@120");
  });

  it("lossy runs on a different source set — pb4 in, pb8 out, pb6 retired", () => {
    // The POOL still holds three (pb8 never served lossy, RT-79a d)...
    expect(eligibleSources("lossy-artifact", true)).toEqual(["pb1", "pb4", "pb6"]);
    // ...but only two can be presented: pb6's 3.5x ladder cannot be measured
    // honestly at any tolerable session length (RT-92a, E5/S4).
    expect(eligibleSources("lossy-artifact")).toEqual(["pb1", "pb4"]);
    expect(eligibleSources("pitch-drift")).toEqual(["pb1", "pb6", "pb8"]);
    // Retirement is per FAMILY: pb6 still carries a third of pitch's windows.
    expect(isRetiredSource("lossy-artifact", "pb6")).toBe(true);
    expect(isRetiredSource("pitch-drift", "pb6")).toBe(false);
  });

  it("a lossy session must lock to a source, and gets only that source", () => {
    expect(() => sessionInstances("lossy-artifact")).toThrow(/must name a source/);
    expect(sessionInstances("lossy-artifact", "pb4")).toHaveLength(6);
    for (const i of sessionInstances("lossy-artifact", "pb4")) expect(i.sourceId).toBe("pb4");
  });

  it("a source with no eligible windows throws rather than returning nothing", () => {
    expect(() => sessionInstances("lossy-artifact", "pb8")).toThrow(/no eligible windows/);
  });

  it("an unrendered family throws", () => {
    expect(() => eligibleWindows("reverb-smear")).toThrow(/has not been rendered/);
  });
});
