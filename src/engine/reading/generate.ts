/**
 * FOUR WEEKS OF PLAYS, FROM HABITS (blueprint Part 4; BA-8).
 *
 * Deterministic: a listener's seed fixes every play, so the reading a reviewer
 * sees is the reading every reviewer sees, and a test can recompute it.
 *
 * ONE RANDOM STREAM PER DECISION, which keeps the habits separable. The hour of a
 * play, whether it reaches for something new, which sound, which track, and
 * whether a first listen is abandoned each draw from their own stream, so
 * changing the late-night habit moves the hours and nothing else.
 * `patterns.test.ts` checks exactly that: a habit changes the receipts it should,
 * and only those.
 *
 * WHAT THE STREAMS ACTUALLY BUY, measured rather than assumed. Today every
 * decision consumes the same number of draws whichever way it goes, so even one
 * shared stream would keep the habits apart — a first draft of this comment said
 * otherwise and was wrong. The streams protect against the edit that breaks it:
 * a draw that happens only sometimes (extra randomness on late-night plays, say).
 * On one stream that would shift every later decision; on separate streams it
 * shifts only its own. The mutation that proves the test sees it is a
 * late-night-only draw on the pick stream, which moves repetition, new-track
 * share and skips, and fails.
 */
import type { Listener, Play, Track } from "@/content/reading/types";

export const DAYS = 28;
export const LATE_HOURS = [23, 0, 1, 2, 3] as const;

/** mulberry32: small, fast, and the same on every machine. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function stream(seed: number, name: string): () => number {
  let h = seed >>> 0;
  for (const c of name) h = Math.imul(h ^ c.charCodeAt(0), 2654435761) >>> 0;
  return mulberry32(h);
}

function weighted<T>(items: T[], weights: number[], r: number): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let x = r * total;
  for (let i = 0; i < items.length; i++) {
    x -= weights[i];
    if (x < 0) return items[i];
  }
  return items[items.length - 1];
}

export function generatePlays(l: Listener): Play[] {
  const h = l.habits;
  const rand = {
    count: stream(h.seed, "count"),
    hour: stream(h.seed, "hour"),
    newness: stream(h.seed, "newness"),
    cluster: stream(h.seed, "cluster"),
    pick: stream(h.seed, "pick"),
    skip: stream(h.seed, "skip"),
  };
  const clusterIds = l.clusters.map((c) => c.id);
  const heard = new Set<string>();
  const plays: Play[] = [];

  for (let day = 0; day < DAYS; day++) {
    const n = Math.max(1, Math.round(h.playsPerDay * (0.7 + 0.6 * rand.count())));
    const t = Math.min(day / 7, 3) / 3; // week 1 -> 0, week 4 -> 1
    const clusterWeights = clusterIds.map((c) => h.drift.from[c] * (1 - t) + h.drift.to[c] * t);

    for (let i = 0; i < n; i++) {
      const late = rand.hour() < h.lateNight;
      const hour = late ? LATE_HOURS[Math.floor(rand.hour() * LATE_HOURS.length)] : 8 + Math.floor(rand.hour() * 15);
      const minute = Math.floor(rand.hour() * 60);

      const wantNew = rand.newness() < h.newAppetite;
      const available = (tr: Track) => (wantNew ? !tr.before && (tr.introDay ?? 0) <= day : tr.before);
      const cluster = weighted(clusterIds, clusterWeights, rand.cluster());
      let candidates = l.tracks.filter((tr) => tr.cluster === cluster && available(tr));
      if (candidates.length === 0) candidates = l.tracks.filter((tr) => tr.cluster === cluster && tr.before);
      if (candidates.length === 0) candidates = l.tracks.filter((tr) => tr.before);
      const track = weighted(candidates, candidates.map((_, k) => 1 / Math.pow(k + 1, h.repeat)), rand.pick());

      const first = !heard.has(track.id);
      heard.add(track.id);
      const skippedEarly = first && !track.before ? rand.skip() < h.skipNew : false;
      plays.push({ id: plays.length, day, hour, minute, trackId: track.id, first, skippedEarly });
    }
  }
  return plays;
}
