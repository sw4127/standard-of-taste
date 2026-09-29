/**
 * THE CHINESE READING HOLDS THE ENGLISH READING'S RULES, BRANCH BY BRANCH
 * (bilingual Part 2, 2026-09-29; BA-3, BA-5, BA-10, N3).
 *
 * `reading/lines.test.ts` holds the English templates to the register (a pattern
 * names no feeling; an offer is a question), the carve-out and the no-comparison
 * rule, on every branch, forced with synthetic facts. This does the same for the
 * Chinese templates, and adds the one check a translation needs: on every real
 * listener, each Chinese line states exactly the numbers its English line
 * states, so the Chinese reading cannot count anything differently.
 */
import { describe, expect, it } from "vitest";
import { carveOutBreaches } from "@/content/carve-out";
import { offerBreachesZh, patternBreachesZh } from "@/content/register";
import type { Fact } from "@/engine/reading/patterns";
import { LISTENERS } from "@/content/reading/listeners";
import { readingFor } from "@/content/reading/reading";
import { buildPrompt, EMPTY_STATE, type ReaderState } from "@/content/reading/prompt";
import type { ReadingLine } from "@/content/reading/lines";
import type { Listener } from "@/content/reading/types";
import { readingLineZh } from "./copy/reading-lines";
import { readingLine } from "@/content/reading/lines";
import SOUND from "./copy/reading-sound";
import { zhBanBreaches } from "./style";

function everyBranch(l: Listener): ReadingLine[] {
  const [a, b, c] = l.tracks.filter((t) => t.before).map((t) => t.id);
  const newIds = l.tracks.filter((t) => !t.before).map((t) => t.id);
  const base = { strength: 1, playIds: [1, 2], trackIds: [a, b] };
  const facts: Fact[] = [];
  for (const direction of ["high", "low"] as const) {
    facts.push({ ...base, kind: "repetition", direction, total: 100, distinct: 20, top: [a, b, c].map((trackId) => ({ trackId, plays: 10 })), topPlays: 30 });
    facts.push({ ...base, kind: "lateNight", direction, total: 100, late: 40 });
    for (const rising of [null, { trackId: newIds[0], lastWeekPlays: 5 }])
      facts.push({ ...base, kind: "newShare", direction, total: 100, newPlays: 60, rising });
    for (const keptCluster of [null, l.clusters[1].id])
      facts.push({ ...base, kind: "earlySkip", direction, tried: 10, skipped: 6, keptCluster });
  }
  facts.push({ ...base, kind: "drift", fromCluster: l.clusters[0].id, toCluster: l.clusters[1].id, week1Total: 50, week4Total: 50, from: { week1: 30, week4: 10 }, to: { week1: 10, week4: 30 } });
  return facts.map((f) => readingLineZh(f, l));
}

const branches = LISTENERS.flatMap(everyBranch);
const numbers = (s: string) => [...s.matchAll(/\d+/g)].map((m) => m[0]).sort();

describe("every Chinese template holds the register, the carve-out and the no-comparison rule", () => {
  it("reached every branch on every listener (a floor)", () => {
    expect(branches.length).toBe(LISTENERS.length * 13);
  });

  it("names no feeling in a pattern or a cue, and asserts nothing about the reader (BA-3)", () => {
    const hits = branches.flatMap((l) => [l.pattern, l.cue.text].flatMap((s) => patternBreachesZh(s).map((b) => `${l.id}: ${s} → ${b}`)));
    expect(hits).toEqual([]);
  });

  it("offers exactly two readings, each a question ending in the full-width question mark", () => {
    for (const l of branches) expect(l.offers.map((o) => o.id)).toEqual(["a", "b"]);
    const hits = branches.flatMap((l) => l.offers.flatMap((o) => offerBreachesZh(o.question).map((b) => `${l.id}: ${o.question} → ${b}`)));
    expect(hits).toEqual([]);
  });

  it("says nothing about trauma, abuse or mental health, in any sentence or prompt word (RT-Z10 a)", () => {
    const all = branches.flatMap((l) => [l.pattern, l.receipt, l.cue.label, l.cue.text, ...l.offers.flatMap((o) => [o.question, ...o.words])]);
    expect(all.filter((s) => carveOutBreaches(s).length > 0)).toEqual([]);
  });

  it("keeps the owner's Chinese rules in every sentence", () => {
    const all = branches.flatMap((l) => [l.pattern, l.receipt, l.cue.text, ...l.offers.map((o) => o.question)]);
    expect(all.flatMap((s) => zhBanBreaches(s).map((b) => `${s} → ${b}`))).toEqual([]);
  });
});

/*
 * THE NUMBERS, IN ORDER (red-team, bilingual Part 2). Chinese puts the whole
 * before the part (「200 次播放中的 74 次」 for "74 of 200 plays"), so the digits
 * of a Chinese sentence are the English sentence's digits in a stated order. The
 * first version compared them sorted, and a swapped pair passed. Each template's
 * order is stated here, per kind and direction, as positions in the English.
 */
const ORDER: Record<string, { pattern: number[]; receipt: number[] }> = {
  "repetition:high": { pattern: [1, 0], receipt: [1, 0] },
  "repetition:low": { pattern: [0, 2, 1], receipt: [1, 0, 2] },
  "lateNight:high": { pattern: [0, 1, 2], receipt: [1, 0] },
  "lateNight:low": { pattern: [1, 0, 2, 3], receipt: [1, 0] },
  "newShare:high": { pattern: [0, 1], receipt: [1, 0] },
  "newShare:low": { pattern: [0], receipt: [1, 0] },
  "drift:": { pattern: [0, 1, 2, 3], receipt: [1, 0, 3, 2] },
  "earlySkip:high": { pattern: [1, 0, 2], receipt: [1, 0] },
  "earlySkip:low": { pattern: [0, 1, 2], receipt: [1, 0] },
};
const digitsOf = (s: string) => [...s.matchAll(/\d+/g)].map((m) => m[0]);

/** Every branch with every number different inside a sentence, so a swap is visible. */
function distinctBranches(l: Listener): { en: ReadingLine; zh: ReadingLine; key: string }[] {
  const [a, b, c] = l.tracks.filter((t) => t.before).map((t) => t.id);
  const newIds = l.tracks.filter((t) => !t.before).map((t) => t.id);
  const base = { strength: 1, playIds: [1, 2], trackIds: [a, b] };
  const facts: Fact[] = [];
  for (const direction of ["high", "low"] as const) {
    facts.push({ ...base, kind: "repetition", direction, total: 200, distinct: 23, top: [a, b, c].map((trackId) => ({ trackId, plays: 25 })), topPlays: 74 });
    facts.push({ ...base, kind: "lateNight", direction, total: 200, late: 46 });
    facts.push({ ...base, kind: "newShare", direction, total: 200, newPlays: 118, rising: { trackId: newIds[0], lastWeekPlays: 5 } });
    facts.push({ ...base, kind: "earlySkip", direction, tried: 17, skipped: 6, keptCluster: null });
  }
  facts.push({ ...base, kind: "drift", fromCluster: l.clusters[0].id, toCluster: l.clusters[1].id, week1Total: 50, week4Total: 80, from: { week1: 30, week4: 24 }, to: { week1: 10, week4: 40 } });
  return facts.map((f) => ({
    en: readingLine(f, l),
    zh: readingLineZh(f, l),
    key: `${f.kind}:${"direction" in f ? f.direction : ""}`,
  }));
}

describe("the Chinese reading counts exactly what the English reading counts", () => {
  it("states every number in its stated place, on every branch, with every number distinct", () => {
    const wrong: string[] = [];
    for (const l of LISTENERS) {
      for (const { en, zh, key } of distinctBranches(l)) {
        for (const part of ["pattern", "receipt"] as const) {
          const e = digitsOf(en[part]);
          expect(new Set(e).size, `${key} ${part}: make the synthetic numbers distinct`).toBe(e.length);
          const want = ORDER[key][part].map((i) => e[i]);
          if (want.join() !== digitsOf(zh[part]).join()) wrong.push(`${l.name} ${key} ${part}: ${zh[part]} (want ${want.join(",")})`);
        }
      }
    }
    expect(wrong).toEqual([]);
  });

  for (const l of LISTENERS) {
    it(`${l.name}: same lines, same plays, and the numbers in their stated places`, () => {
      const en = readingFor(l, "en").lines;
      const zh = readingFor(l, "zh").lines;
      expect(zh.map((x) => [x.id, x.kind, x.playIds.join()])).toEqual(en.map((x) => [x.id, x.kind, x.playIds.join()]));
      // Same multiset on the real readings too (the order is held above, branch by branch).
      for (let i = 0; i < en.length; i++) {
        expect(numbers(zh[i].receipt), en[i].receipt).toEqual(numbers(en[i].receipt));
        expect(numbers(zh[i].pattern), en[i].pattern).toEqual(numbers(en[i].pattern));
      }
    });
  }
});

describe("the Chinese prompt", () => {
  it("has a Chinese word for every sound word the listeners use", () => {
    const words = LISTENERS.flatMap((l) => l.clusters.flatMap((c) => [...Object.values(c.sound), ...Object.values(c.family)]));
    expect(words.filter((w) => !(w in SOUND))).toEqual([]);
  });

  it("is written in Chinese, keeps the rules, and changes when a line is rejected", () => {
    for (const l of LISTENERS) {
      const r = readingFor(l, "zh");
      const all: ReaderState = { rejected: [], chosen: Object.fromEntries(r.lines.map((x) => [x.id, "a" as const])) };
      const p = buildPrompt(r, all, "zh");
      expect(p.text).toMatch(/^风格：/);
      // Only tempo units and nothing else in English: no three lower-case English words in a row.
      expect(p.text.match(/\b[a-z]+(?:\s+[a-z]+){2,}\b/g)).toBeNull();
      expect(zhBanBreaches(p.text)).toEqual([]);
      expect(carveOutBreaches(p.text)).toEqual([]);
      const fewer = buildPrompt(r, { ...all, rejected: [r.lines[0].id] }, "zh");
      expect(fewer.text).not.toBe(p.text);
      expect(buildPrompt(r, EMPTY_STATE, "zh").text.length).toBeGreaterThan(0);
    }
  });
});
