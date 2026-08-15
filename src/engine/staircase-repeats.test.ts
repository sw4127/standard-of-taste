/**
 * HOW MANY DISTINCT CLIPS DOES ONE LEVEL NEED? (E4/S2, 2026-08-15)
 *
 * The render plan's cost is driven almost entirely by WINDOWS PER SOURCE, and
 * until now that number was going to be chosen by feel. It is measurable.
 *
 * THE PROBLEM IT SOLVES. A staircase revisits the levels near a listener's
 * threshold repeatedly — that is the whole point of the procedure, and it is why
 * the estimate converges. But if a level owns exactly one audio file, the
 * listener meets that same file every time they land there, and after the third
 * or fourth encounter they can recognise the CLIP instead of hearing the FLAW.
 * Performance then improves for a reason that has nothing to do with their ear,
 * and the retest arc — whose entire job is detecting whether the ear moved —
 * would report it as learning.
 *
 * So the requirement is concrete: a level must own at least as many distinct
 * renders as the number of times a session is likely to land on it. That number
 * comes out of the real staircase, not out of a guess.
 *
 * SIMULATED (N3): zero real responses.
 */
import { describe, expect, it } from "vitest";
import { observer as obs, runStaircaseSession, type Observer } from "@/analytics/observer";
import { DEFAULT_STAIRCASE, type StaircaseConfig } from "./staircase";

const PITCH = [3.1, 4.4, 6.3, 8.8, 12.5, 17.7, 25, 35.4, 50, 70.7, 100];
const TIMING = [12.5, 15.7, 19.8, 25, 31.5, 39.7, 50, 63, 79.4, 100];

const cfg = (levels: number[], overrides: Partial<StaircaseConfig> = {}): StaircaseConfig => ({
  ...DEFAULT_STAIRCASE,
  levels,
  startIndex: levels.length - 3,
  ...overrides,
});

const quantile = (v: number[], q: number) => {
  const s = [...v].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(q * s.length))];
};

/** Trials landing on the single most-visited level, per session. */
function peakRepeats(levels: number[], o: Observer, sessions: number, overrides: Partial<StaircaseConfig> = {}) {
  const config = cfg(levels, overrides);
  const peaks: number[] = [];
  for (let s = 1; s <= sessions; s++) {
    const { state } = runStaircaseSession(o, s * 7919, config);
    const counts = new Array<number>(levels.length).fill(0);
    for (const t of state.trials) counts[t.index]++;
    peaks.push(Math.max(...counts));
  }
  return peaks;
}

describe("E4/S2 — how many windows a level actually needs [SIMULATED]", () => {
  const SESSIONS = 2000;
  const CONDITIONS: Array<[string, number[], Observer]> = [
    ["pitch, sensitive", PITCH, obs(12, 0.35)],
    ["pitch, average", PITCH, obs(25, 0.35)],
    ["pitch, insensitive", PITCH, obs(50, 0.35)],
    ["pitch, shallow slope", PITCH, obs(25, 0.7)],
    ["timing, average", TIMING, obs(31.5, 0.35)],
    ["timing, sensitive", TIMING, obs(19.8, 0.35)],
  ];

  it("measures the repeat load a single level carries", () => {
    console.log(`\n[E4/S2] === TRIALS ON THE MOST-VISITED LEVEL [SIMULATED], ${SESSIONS} sessions ===`);
    console.log(`[E4/S2] A level needs at least this many DISTINCT renders, or the listener`);
    console.log(`[E4/S2] starts recognising the clip instead of hearing the flaw.`);
    console.log(`[E4/S2] ${"condition".padEnd(21)} ${"median".padStart(7)} ${"p90".padStart(5)} ${"p99".padStart(5)} ${"max".padStart(5)}`);
    const p90s: number[] = [];
    for (const [label, levels, o] of CONDITIONS) {
      const peaks = peakRepeats(levels, o, SESSIONS);
      p90s.push(quantile(peaks, 0.9));
      console.log(
        `[E4/S2] ${label.padEnd(21)} ${String(quantile(peaks, 0.5)).padStart(7)} ${String(quantile(peaks, 0.9)).padStart(5)} ` +
          `${String(quantile(peaks, 0.99)).padStart(5)} ${String(Math.max(...peaks)).padStart(5)}`,
      );
    }
    const worstP90 = Math.max(...p90s);
    console.log(`[E4/S2] worst p90 across conditions: ${worstP90} trials on one level`);
    // Sanity: a level is revisited enough that one clip per level is clearly
    // not enough. If this ever failed, the staircase would not be converging.
    expect(worstP90).toBeGreaterThan(3);
  });

  /**
   * The same measurement at the longer session RT-63 left open. If 20 reversals
   * is later chosen for the Gym, the repeat load — and therefore the render
   * budget — goes up with it. Pricing both now means that ruling does not
   * silently invalidate whatever E4 renders.
   */
  it("prices the repeat load at RT-63's longer session too", () => {
    const long = { stopAfterReversals: 20, useLastReversals: 16, maxTrials: 140 };
    console.log(`\n[E4/S2] === SAME, AT 20 REVERSALS (RT-63 option a) [SIMULATED] ===`);
    for (const [label, levels, o] of CONDITIONS.slice(0, 3)) {
      const short = peakRepeats(levels, o, 500);
      const longer = peakRepeats(levels, o, 500, long);
      console.log(
        `[E4/S2] ${label.padEnd(21)} 12 reversals p90 ${String(quantile(short, 0.9)).padStart(2)} → ` +
          `20 reversals p90 ${String(quantile(longer, 0.9)).padStart(2)}`,
      );
      expect(quantile(longer, 0.9)).toBeGreaterThanOrEqual(quantile(short, 0.9));
    }
  });
});
