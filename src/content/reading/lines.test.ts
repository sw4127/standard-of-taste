/**
 * THE READING'S LINES HOLD TO THEIR RECEIPTS AND THEIR REGISTER (blueprint Part 4).
 *
 * 1. Every listener gets at least three lines, and the three readings differ.
 * 2. Every receipt equals a count recomputed here from the plays, by code that
 *    shares nothing with the engine but the play records.
 * 3. Every template — both directions of every fact, with and without its
 *    optional clause — passes the offer register (BA-3), the carve-out
 *    (RT-Z10 a) and the no-comparison rule (N3). Each check is proved by a
 *    planted specimen, so a check that stopped matching would fail here first.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { carveOutBreaches } from "@/content/carve-out";
import { COMPARISON, matches, offerBreaches, patternBreaches } from "@/content/register";
import type { Fact } from "@/engine/reading/patterns";
import { LISTENERS, LISTENER_LABEL } from "./listeners";
import { NEITHER, readingLine, type ReadingLine } from "./lines";
import { readingFor } from "./reading";
import type { Listener, Play } from "./types";

const readings = LISTENERS.map(readingFor);
const LATE = new Set([23, 0, 1, 2, 3]);

/** Every sentence a line can show, with what it is. */
function sentences(line: ReadingLine): { what: "pattern" | "receipt" | "offer"; text: string }[] {
  return [
    { what: "pattern", text: line.pattern },
    { what: "pattern", text: line.cue.text },
    { what: "receipt", text: line.receipt },
    ...line.offers.map((o) => ({ what: "offer" as const, text: o.question })),
  ];
}

/** Every template branch, forced with synthetic facts on a real listener's tracks. */
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
  return facts.map((f) => readingLine(f, l));
}

describe("every listener gets a reading", () => {
  it("labels every listener as simulated, in data", () => {
    expect(LISTENERS).toHaveLength(3);
    for (const l of LISTENERS) expect(l.dataSource).toBe("SIMULATED");
    expect(LISTENER_LABEL).toBe("Illustrative listener. Fictional artists and plays.");
  });

  it("gives each at least three lines", () => {
    for (const r of readings) expect(r.lines.length, r.listener.name).toBeGreaterThanOrEqual(3);
  });

  it("reads the three listeners differently", () => {
    const shape = (r: (typeof readings)[number]) => r.lines.map((l) => `${l.kind}:${l.pattern}`).join("|");
    expect(new Set(readings.map(shape)).size).toBe(3);
    // Not just different numbers: the set of patterns picked differs for every pair.
    const kinds = readings.map((r) => r.lines.map((l) => l.kind).sort().join(","));
    expect(new Set(kinds).size).toBe(3);
  });

  it("never lets the pattern engine read the habits it is meant to discover", () => {
    const src = readFileSync("src/engine/reading/patterns.ts", "utf8").replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "");
    expect(src).not.toMatch(/\.habits\b/);
  });
});

describe("every receipt equals a recomputation from the plays", () => {
  for (const r of readings) {
    const { listener: l, plays } = r;
    const clusterOf = new Map(l.tracks.map((t) => [t.id, t.cluster]));
    const isNew = new Set(l.tracks.filter((t) => !t.before).map((t) => t.id));
    const count = (ps: Play[]) => {
      const m = new Map<string, number>();
      ps.forEach((p) => m.set(p.trackId, (m.get(p.trackId) ?? 0) + 1));
      return m;
    };

    for (const line of r.lines) {
      it(`${l.name} · ${line.kind}`, () => {
        const ids = (ps: Play[]) => ps.map((p) => p.id).sort((x, y) => x - y);
        const got = [...line.playIds].sort((x, y) => x - y);
        let expected: string;
        if (line.kind === "repetition") {
          const top = [...count(plays)].sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0])).slice(0, 3);
          const n = top.reduce((s, t) => s + t[1], 0);
          expected = line.receipt.includes("across")
            ? `${n} of ${plays.length} plays, across ${count(plays).size} tracks`
            : `${n} of ${plays.length} plays`;
          expect(got).toEqual(ids(plays.filter((p) => top.some((t) => t[0] === p.trackId))));
        } else if (line.kind === "lateNight") {
          const late = plays.filter((p) => LATE.has(p.hour));
          expected = `${late.length} of ${plays.length} plays`;
          expect(got).toEqual(ids(late));
        } else if (line.kind === "newShare") {
          const nw = plays.filter((p) => isNew.has(p.trackId));
          const known = plays.filter((p) => !isNew.has(p.trackId));
          const lowDir = line.pattern.includes("already knew");
          expected = lowDir ? `${known.length} of ${plays.length} plays` : `${nw.length} of ${plays.length} plays`;
          // The receipt expands to exactly the plays it counts.
          expect(got).toEqual(ids(lowDir ? known : nw));
        } else if (line.kind === "drift") {
          const w1 = plays.filter((p) => p.day < 7);
          const w4 = plays.filter((p) => p.day >= 21);
          const share = (ps: Play[], c: string) => ps.filter((p) => clusterOf.get(p.trackId) === c).length / ps.length;
          const change = l.clusters.map((c) => ({ c: c.id, d: share(w4, c.id) - share(w1, c.id) })).sort((x, y) => x.d - y.d);
          const to = change[change.length - 1].c;
          const t1 = w1.filter((p) => clusterOf.get(p.trackId) === to);
          const t4 = w4.filter((p) => clusterOf.get(p.trackId) === to);
          expected = `${t1.length} of ${w1.length} plays in week one; ${t4.length} of ${w4.length} in week four`;
          expect(got).toEqual(ids([...t1, ...t4]));
        } else {
          const firsts = plays.filter((p) => p.first && isNew.has(p.trackId));
          const skipped = firsts.filter((p) => p.skippedEarly).length;
          expected = line.pattern.startsWith("You abandoned")
            ? `${skipped} of ${firsts.length} first plays`
            : `${firsts.length - skipped} of ${firsts.length} first plays`;
          expect(got).toEqual(ids(firsts));
        }
        expect(line.receipt).toBe(expected);
        // Found by reading the rendered lines: a receipt of "261 of 294" once listed 33 plays.
        const stated = line.receipt.match(/\d+/g)!.map(Number);
        // Drift lists its sound's plays in both weeks; the skip receipt lists every
        // first play it is "of", each marked kept or abandoned, so both halves show.
        const listed = line.kind === "drift" ? stated[0] + stated[2] : line.kind === "earlySkip" ? stated[1] : stated[0];
        expect(line.playIds.length, "the receipt lists a different number of plays than it states").toBe(listed);
        // The pattern's first number is the receipt's, as a count or a share.
        const [n, of] = line.receipt.match(/\d+/g)!.map(Number);
        expect(line.pattern.includes(`${Math.round((100 * n) / of)}%`) || line.pattern.includes(`${n}`)).toBe(true);
      });
    }
  }
});

describe("every template holds the register, the carve-out and the no-comparison rule", () => {
  const all = [...readings.flatMap((r) => r.lines), ...LISTENERS.flatMap(everyBranch)];

  it("reached every branch (a floor, so an empty corpus cannot pass)", () => {
    // 3 listeners x 13 forced branches, plus the real lines.
    expect(all.length).toBeGreaterThanOrEqual(39 + 9);
    expect(new Set(all.map((l) => l.pattern.replace(/\d+%?/g, "#"))).size).toBeGreaterThanOrEqual(12);
  });

  it("names no feeling in a pattern, and asserts nothing about the reader anywhere (BA-3)", () => {
    const found = all.flatMap((l) => [
      ...patternBreaches(l.pattern).map((b) => `${l.id} pattern: ${b} :: ${l.pattern}`),
      ...l.offers.flatMap((o) => offerBreaches(o.question).map((b) => `${l.id} offer: ${b} :: ${o.question}`)),
      ...patternBreaches(l.cue.text).map((b) => `${l.id} cue: ${b} :: ${l.cue.text}`),
    ]);
    expect(found).toEqual([]);
  });

  it("offers exactly two readings per line, and the page offers neither", () => {
    for (const l of all) expect(l.offers.map((o) => o.id)).toEqual(["a", "b"]);
    expect(NEITHER).toBe("Neither");
  });

  it("says nothing about trauma, abuse or mental health, in any sentence or prompt word (RT-Z10 a)", () => {
    const found = all.flatMap((l) => [
      ...sentences(l).flatMap((s) => carveOutBreaches(s.text).map((b) => `${l.id}: ${b} :: ${s.text}`)),
      ...l.offers.flatMap((o) => o.words.flatMap((w) => carveOutBreaches(w).map((b) => `${l.id} word "${w}": ${b}`))),
    ]);
    expect(found).toEqual([]);
  });

  it("compares the listener with nobody (N3)", () => {
    const found = all.flatMap((l) => sentences(l).flatMap((s) => matches(s.text, COMPARISON).map((b) => `${l.id}: ${b}`)));
    expect(found).toEqual([]);
  });

  it("proves each check bites, with planted specimens", () => {
    expect(patternBreaches("You played these late, which shows you are lonely.")).not.toEqual([]);
    expect(patternBreaches("Your mood shifted in week three.")).not.toEqual([]);
    expect(offerBreaches("You are searching for something.")).not.toEqual([]);
    expect(offerBreaches("You feel it most at night")).not.toEqual([]);
    // The apostrophe in this pattern is escaped in source (register.ts); this proves it still matches.
    expect(offerBreaches("You're lonely, and that is why.")).not.toEqual([]);
    expect(offerBreaches("Is this music for staying in a feeling, or for getting out of one?")).toEqual([]);
    expect(matches("You repeat more than most listeners.", COMPARISON)).not.toEqual([]);
    expect(carveOutBreaches("Headphones are cheaper than therapy.")).not.toEqual([]);
  });
});
