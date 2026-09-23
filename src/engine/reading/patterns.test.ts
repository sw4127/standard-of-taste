/**
 * A HABIT MOVES THE RECEIPTS IT SHOULD, AND ONLY THOSE (blueprint Part 4).
 *
 * If changing how late someone listens also changed how much they repeat, the
 * reading's lines would not be separate observations — they would be one draw
 * of a random number, described five ways. The generator gives each decision
 * its own random stream precisely so this holds; this is the check that it does.
 *
 * Each case changes ONE habit of a real listener and states which facts may
 * move. The primary fact must move; every fact outside the set must be
 * byte-identical.
 */
import { describe, expect, it } from "vitest";
import { LISTENERS } from "@/content/reading/listeners";
import type { Habits, Listener } from "@/content/reading/types";
import { generatePlays } from "./generate";
import { allFacts, pickFacts, STRENGTH_FLOOR, type FactKind } from "./patterns";

/**
 * A fact's RECEIPT: its counts and the plays it counted. `trackIds` is left out
 * on purpose — it lists which tracks feed the prompt, and which late-night
 * tracks top the list legitimately depends on which tracks were picked. The
 * count of late-night plays, and the plays themselves, must not.
 */
const facts = (l: Listener) =>
  Object.fromEntries(
    allFacts(generatePlays(l), l).map((f) => {
      // JSON.stringify drops an undefined field, which removes trackIds from the comparison.
      return [f.kind, JSON.stringify({ ...f, trackIds: undefined })];
    }),
  );
const withHabit = (l: Listener, h: Partial<Habits>): Listener => ({ ...l, habits: { ...l.habits, ...h } });

const CASES: { listener: string; habit: Partial<Habits>; primary: FactKind; mayMove: FactKind[] }[] = [
  // Hours come from their own stream: nothing else can move.
  { listener: "mira", habit: { lateNight: 0.1 }, primary: "lateNight", mayMove: ["lateNight"] },
  // The abandon draw touches only first plays of new tracks.
  { listener: "teo", habit: { skipNew: 0.1 }, primary: "earlySkip", mayMove: ["earlySkip"] },
  // Which track is picked: repetition moves, and so may which new tracks get a first play.
  { listener: "lin", habit: { repeat: 0.2 }, primary: "repetition", mayMove: ["repetition", "earlySkip", "newShare"] },
  // Which sound is reached for: the drift moves, and every track-level count may follow.
  { listener: "lin", habit: { drift: { from: { wall: 0.2, acoustic: 0.6, choir: 0.2 }, to: { wall: 0.2, acoustic: 0.6, choir: 0.2 } } }, primary: "drift", mayMove: ["drift", "repetition", "newShare", "earlySkip"] },
];

describe("a habit moves only the receipts it should", () => {
  for (const c of CASES) {
    it(`${c.listener}: ${Object.keys(c.habit).join(",")} -> ${c.primary}`, () => {
      const l = LISTENERS.find((x) => x.id === c.listener)!;
      const before = facts(l);
      const after = facts(withHabit(l, c.habit));
      expect(after[c.primary], `${c.primary} did not move, so the habit is not reaching the plays`).not.toBe(before[c.primary]);
      const kinds = Object.keys(before) as FactKind[];
      const leaked = kinds.filter((k) => !c.mayMove.includes(k) && after[k] !== before[k]);
      expect(leaked, "these facts moved although the habit has nothing to do with them").toEqual([]);
    });
  }

  it("is deterministic: the same listener gives the same plays", () => {
    for (const l of LISTENERS) expect(JSON.stringify(generatePlays(l))).toBe(JSON.stringify(generatePlays(l)));
  });

  it("generates four weeks of plays for each listener", () => {
    for (const l of LISTENERS) {
      const p = generatePlays(l);
      expect(Math.min(...p.map((x) => x.day))).toBe(0);
      expect(Math.max(...p.map((x) => x.day))).toBe(27);
      expect(p.length).toBeGreaterThan(150);
    }
  });

  it("picks three or four facts, strongest first, never a sub-floor fact when enough clear it", () => {
    for (const l of LISTENERS) {
      const picked = pickFacts(allFacts(generatePlays(l), l));
      expect(picked.length).toBeGreaterThanOrEqual(3);
      expect(picked.length).toBeLessThanOrEqual(4);
      for (let i = 1; i < picked.length; i++) expect(picked[i - 1].strength).toBeGreaterThanOrEqual(picked[i].strength);
      if (picked.length === 4) expect(picked.every((f) => f.strength >= STRENGTH_FLOOR)).toBe(true);
    }
  });
});
