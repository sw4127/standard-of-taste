/**
 * PATTERN FACTS, COMPUTED FROM PLAYS AND NEVER TYPED (blueprint Part 4).
 *
 * Five things a month of plays can show without anybody describing their own
 * taste (BP-CA2): how much of it piles onto a few tracks, how much happens late
 * at night, how much is new (what the listener is reaching for now and starting
 * to reach for — BP-CA1), how the sound drifted from the first week to the
 * fourth, and how fast new tracks were abandoned.
 *
 * READS PLAYS AND THE TRACK POOL, NEVER THE HABITS. The habits made the plays;
 * a reading that peeked at them would be reading its own answer key.
 *
 * STRENGTH IS FOR CHOOSING, NEVER FOR SHOWING. Each fact carries a strength in
 * [0, 1] measured against a baseline inside the same listening — an even spread
 * over the tracks heard, an even spread over the clock, an even split of new and
 * known — so the three or four most distinctive can be picked. It is not a
 * comparison with other listeners, there is no population here to compare with,
 * and nothing renders it (N3).
 */
import type { Listener, Play } from "@/content/reading/types";
import { LATE_HOURS } from "./generate";

export type Direction = "high" | "low";

interface FactBase {
  strength: number;
  /** The plays this fact counted — what its receipt expands to. */
  playIds: number[];
  /** The tracks whose sound this fact is about, most-played first: they feed the prompt. */
  trackIds: string[];
}

export interface RepetitionFact extends FactBase {
  kind: "repetition";
  direction: Direction;
  total: number;
  distinct: number;
  /** The three most-played tracks and their plays. */
  top: { trackId: string; plays: number }[];
  topPlays: number;
}
export interface LateNightFact extends FactBase {
  kind: "lateNight";
  direction: Direction;
  total: number;
  late: number;
}
export interface NewShareFact extends FactBase {
  kind: "newShare";
  direction: Direction;
  total: number;
  newPlays: number;
  /** The new track played most in the last week: what the listener is starting to reach for. */
  rising: { trackId: string; lastWeekPlays: number } | null;
}
export interface DriftFact extends FactBase {
  kind: "drift";
  fromCluster: string;
  toCluster: string;
  week1Total: number;
  week4Total: number;
  /** Plays in each cluster, week one and week four. */
  from: { week1: number; week4: number };
  to: { week1: number; week4: number };
}
export interface EarlySkipFact extends FactBase {
  kind: "earlySkip";
  direction: Direction;
  tried: number;
  skipped: number;
  /** The cluster that kept more new tracks than any other, or null if none survived or two tie. */
  keptCluster: string | null;
}

export type Fact = RepetitionFact | LateNightFact | NewShareFact | DriftFact | EarlySkipFact;
export type FactKind = Fact["kind"];

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const WEEK1 = (p: Play) => p.day < 7;
const WEEK4 = (p: Play) => p.day >= 21;

function counts(plays: Play[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const p of plays) m.set(p.trackId, (m.get(p.trackId) ?? 0) + 1);
  return m;
}

/** Track ids by play count, descending; ties broken by id so the order is stable. */
function ranked(plays: Play[]): { trackId: string; plays: number }[] {
  return [...counts(plays)]
    .map(([trackId, n]) => ({ trackId, plays: n }))
    .sort((a, b) => b.plays - a.plays || a.trackId.localeCompare(b.trackId));
}

export function repetition(plays: Play[]): RepetitionFact {
  const r = ranked(plays);
  const top = r.slice(0, 3);
  const topIds = new Set(top.map((t) => t.trackId));
  const topPlays = top.reduce((a, t) => a + t.plays, 0);
  const share = topPlays / plays.length;
  const even = Math.min(1, 3 / r.length);
  const high = share >= 1.5 * even;
  const strength = high ? clamp((share - even) / (1 - even)) : clamp(0.5 * (r.length / 30) * (1 - share));
  return {
    kind: "repetition",
    direction: high ? "high" : "low",
    strength,
    total: plays.length,
    distinct: r.length,
    top,
    topPlays,
    playIds: plays.filter((p) => topIds.has(p.trackId)).map((p) => p.id),
    trackIds: top.map((t) => t.trackId),
  };
}

export function lateNight(plays: Play[]): LateNightFact {
  const lateHours: readonly number[] = LATE_HOURS;
  const latePlays = plays.filter((p) => lateHours.includes(p.hour));
  const share = latePlays.length / plays.length;
  const even = LATE_HOURS.length / 24;
  const high = share > even;
  return {
    kind: "lateNight",
    direction: high ? "high" : "low",
    strength: high ? clamp((share - even) / (1 - even)) : clamp((0.6 * (even - share)) / even),
    total: plays.length,
    late: latePlays.length,
    playIds: latePlays.map((p) => p.id),
    trackIds: ranked(high ? latePlays : plays.filter((p) => !lateHours.includes(p.hour))).slice(0, 3).map((t) => t.trackId),
  };
}

export function newShare(plays: Play[], l: Listener): NewShareFact {
  const isNew = new Set(l.tracks.filter((t) => !t.before).map((t) => t.id));
  const newPlays = plays.filter((p) => isNew.has(p.trackId));
  const share = newPlays.length / plays.length;
  const high = share > 0.5;
  const lastWeekNew = ranked(newPlays.filter(WEEK4));
  const rising = lastWeekNew.length ? { trackId: lastWeekNew[0].trackId, lastWeekPlays: lastWeekNew[0].plays } : null;
  return {
    kind: "newShare",
    direction: high ? "high" : "low",
    strength: high ? clamp((share - 0.5) * 2) : clamp(0.7 * (0.5 - share) * 2),
    total: plays.length,
    newPlays: newPlays.length,
    rising,
    // The receipt lists what it counts: new plays when most are new, known plays when most are known.
    playIds: (high ? newPlays : plays.filter((p) => !isNew.has(p.trackId))).map((p) => p.id),
    trackIds: (high ? ranked(newPlays) : ranked(plays.filter((p) => !isNew.has(p.trackId)))).slice(0, 3).map((t) => t.trackId),
  };
}

export function drift(plays: Play[], l: Listener): DriftFact {
  const clusterOf = new Map(l.tracks.map((t) => [t.id, t.cluster]));
  const w1 = plays.filter(WEEK1);
  const w4 = plays.filter(WEEK4);
  const inCluster = (ps: Play[], c: string) => ps.filter((p) => clusterOf.get(p.trackId) === c);
  const delta = l.clusters.map((c) => ({
    id: c.id,
    week1: inCluster(w1, c.id).length,
    week4: inCluster(w4, c.id).length,
    change: inCluster(w4, c.id).length / w4.length - inCluster(w1, c.id).length / w1.length,
  }));
  const byChange = [...delta].sort((a, b) => a.change - b.change || a.id.localeCompare(b.id));
  const from = byChange[0];
  const to = byChange[byChange.length - 1];
  return {
    kind: "drift",
    strength: clamp(1.5 * to.change),
    fromCluster: from.id,
    toCluster: to.id,
    week1Total: w1.length,
    week4Total: w4.length,
    from: { week1: from.week1, week4: from.week4 },
    to: { week1: to.week1, week4: to.week4 },
    // The receipt follows ONE sound across the month: the one reached for more by the end.
    playIds: [...inCluster(w1, to.id), ...inCluster(w4, to.id)].map((p) => p.id),
    trackIds: ranked(inCluster(w4, to.id)).slice(0, 3).map((t) => t.trackId),
  };
}

export function earlySkip(plays: Play[], l: Listener): EarlySkipFact {
  const isNew = new Set(l.tracks.filter((t) => !t.before).map((t) => t.id));
  const firsts = plays.filter((p) => p.first && isNew.has(p.trackId));
  const skipped = firsts.filter((p) => p.skippedEarly);
  const keptIds = new Set(firsts.filter((p) => !p.skippedEarly).map((p) => p.trackId));
  const share = firsts.length ? skipped.length / firsts.length : 0;
  const high = share > 0.5;
  const clusterOf = new Map(l.tracks.map((t) => [t.id, t.cluster]));
  // Counted by TRACKS kept, not plays of them, and null on a tie: the sentence
  // this feeds says one sound kept more new tracks than any other.
  const keptByCluster = [...counts([...keptIds].map((id, i) => ({ id: i, trackId: clusterOf.get(id)! }) as Play))]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const soleLeader = keptByCluster.length > 0 && (keptByCluster.length === 1 || keptByCluster[0][1] > keptByCluster[1][1]);
  const enough = firsts.length >= 4;
  return {
    kind: "earlySkip",
    direction: high ? "high" : "low",
    strength: !enough ? 0 : high ? clamp((share - 0.5) * 2) : clamp(0.4 * (0.5 - share) * 2),
    tried: firsts.length,
    skipped: skipped.length,
    keptCluster: soleLeader ? keptByCluster[0][0] : null,
    playIds: firsts.map((p) => p.id),
    trackIds: ranked(plays.filter((p) => keptIds.has(p.trackId))).slice(0, 3).map((t) => t.trackId),
  };
}

export function allFacts(plays: Play[], l: Listener): Fact[] {
  return [repetition(plays), lateNight(plays), newShare(plays, l), drift(plays, l), earlySkip(plays, l)];
}

/** The floor below which a fact is not distinctive enough to be a line, unless fewer than three clear it. */
export const STRENGTH_FLOOR = 0.25;
export const MIN_LINES = 3;
export const MAX_LINES = 4;

/** The three or four most distinctive facts, strongest first. */
export function pickFacts(facts: Fact[]): Fact[] {
  const sorted = [...facts].sort((a, b) => b.strength - a.strength || a.kind.localeCompare(b.kind));
  const clear = sorted.filter((f) => f.strength >= STRENGTH_FLOOR).slice(0, MAX_LINES);
  return clear.length >= MIN_LINES ? clear : sorted.slice(0, MIN_LINES);
}
