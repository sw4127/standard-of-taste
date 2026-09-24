/**
 * THE READING'S LINES — TEMPLATES ONLY (owner rulings BA-3, BA-10; blueprint Part 4).
 *
 * Every line has three parts, and each answers a different objection:
 *
 * (a) THE PATTERN, in words. It says only what the plays show — how many, when,
 *     which — and names no feeling (BA-3). It is the part a reader can check.
 * (b) THE RECEIPT: the count behind the pattern, computed from the plays, and
 *     the plays themselves. This is the reply to the Barnum objection
 *     (BP-ARG-OBJECTION, BP-ARG-REPLY): a line that points at specific plays is
 *     true of this listening and not of everyone.
 * (c) TWO OFFERED READINGS of what the pattern might mean, as questions, plus
 *     "neither". Two, because the same pattern can come from opposite feelings
 *     (BP-ARG-S1): late-night listening can be the one private hour or the
 *     thing that puts sleep off, and the plays cannot say which. The reader can.
 *
 * Each offer carries the words it would add to a prompt, so the reader's choice
 * changes what they carry out (BP-UNMET: check, argue with, carry into a prompt).
 *
 * WHY THE STRINGS ARE HERE AND NOT IN A COMPONENT: prose inside JSX is outside
 * the copy deck and outside every guard. These are held by `lines.test.ts`
 * (register, carve-out, no comparison) and exported by the deck script.
 * NOT YET THROUGH A WRITING PASS — listed in the handoff for one.
 */
import type { Fact } from "@/engine/reading/patterns";
import type { Cluster, Listener } from "./types";

export interface Offer {
  id: "a" | "b";
  question: string;
  /** What choosing this reading adds to the prompt. */
  words: string[];
}

/** What a kept line tells the generator: one direction, labelled, derived from the pattern. */
export interface Cue {
  label: string;
  text: string;
}

export interface ReadingLine {
  id: string;
  kind: Fact["kind"];
  /** (a) the pattern, in words. */
  pattern: string;
  /** (b) the count behind it, in words; the plays are `playIds`. */
  receipt: string;
  playIds: number[];
  /** (c) two offered readings, as questions. "Neither" is offered by the page. */
  offers: [Offer, Offer];
  /** The line's own contribution to the prompt, so rejecting it always changes the prompt. */
  cue: Cue;
  /** The sound this line is about: its tracks, and the cluster most of them share. */
  trackIds: string[];
  cluster: string;
}

export const NEITHER = "Neither";

const pct = (n: number, of: number) => `${Math.round((100 * n) / of)}%`;

/** "A, B and C". */
function list(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

type Lookup = { title: (id: string) => string; texture: (cluster: string) => string; clusterOf: (id: string) => string };

function lookup(l: Listener): Lookup {
  const byId = new Map(l.tracks.map((t) => [t.id, t]));
  const clusters = new Map<string, Cluster>(l.clusters.map((c) => [c.id, c]));
  return {
    title: (id) => byId.get(id)!.title,
    texture: (c) => clusters.get(c)!.sound.texture,
    clusterOf: (id) => byId.get(id)!.cluster,
  };
}

/** The cluster most of a line's tracks share (ties to the first-played). */
function mainCluster(trackIds: string[], k: Lookup): string {
  const n = new Map<string, number>();
  for (const id of trackIds) n.set(k.clusterOf(id), (n.get(k.clusterOf(id)) ?? 0) + 1);
  return [...n].sort((a, b) => b[1] - a[1])[0][0];
}

type Parts = Pick<ReadingLine, "pattern" | "receipt" | "offers" | "cue">;

function parts(f: Fact, k: Lookup): Parts {
  switch (f.kind) {
    case "repetition":
      if (f.direction === "high")
        return {
          pattern: `Three tracks took ${pct(f.topPlays, f.total)} of your ${f.total} plays: ${list(f.top.map((t) => k.title(t.trackId)))}.`,
          receipt: `${f.topPlays} of ${f.total} plays`,
          offers: [
            { id: "a", question: "Are these keeping something steady, so nothing new has to be chosen?", words: ["steady", "circling", "familiar"] },
            { id: "b", question: "Or are you still inside them, listening for something you have not found yet?", words: ["searching", "returning", "close"] },
          ],
          cue: { label: "Form", text: "a loop that circles back, made to be replayed" },
        };
      return {
        pattern: `You played ${f.distinct} different tracks, and the three you played most took ${pct(f.topPlays, f.total)} of your ${f.total} plays between them.`,
        receipt: `${f.topPlays} of ${f.total} plays, across ${f.distinct} tracks`,
        offers: [
          { id: "a", question: "Is variety the point right now, so that no one thing settles in?", words: ["wandering", "open", "moving"] },
          { id: "b", question: "Or has nothing caught hold yet?", words: ["drifting", "light", "passing"] },
        ],
        cue: { label: "Form", text: "through-composed, no section repeats for long" },
      };
    case "lateNight":
      if (f.direction === "high")
        return {
          pattern: `${pct(f.late, f.total)} of your plays started between 11 at night and 4 in the morning.`,
          receipt: `${f.late} of ${f.total} plays`,
          offers: [
            { id: "a", question: "Is late at night the one time that is yours?", words: ["late-night", "private", "unhurried"] },
            { id: "b", question: "Or is this the music that gets you to sleep, or puts it off?", words: ["drowsy", "low-lit", "slow"] },
          ],
          cue: { label: "Setting", text: "late at night, quiet enough for headphones" },
        };
      return {
        pattern: `${f.late} of your ${f.total} plays started between 11 at night and 4 in the morning.`,
        receipt: `${f.late} of ${f.total} plays`,
        offers: [
          { id: "a", question: "Is music part of how the day gets done?", words: ["daylight", "busy", "forward"] },
          { id: "b", question: "Or are the nights kept quiet on purpose?", words: ["clear", "awake", "open-air"] },
        ],
        cue: { label: "Setting", text: "daytime, on the move" },
      };
    case "newShare": {
      if (f.direction === "high") {
        const rising =
          f.rising && f.rising.lastWeekPlays >= 3
            ? ` In the last week you went back to ${k.title(f.rising.trackId)} ${f.rising.lastWeekPlays} times.`
            : "";
        return {
          pattern: `${pct(f.newPlays, f.total)} of your plays were tracks you first heard in these four weeks.${rising}`,
          receipt: `${f.newPlays} of ${f.total} plays`,
          offers: [
            { id: "a", question: "Are you looking for something you do not have a name for yet?", words: ["searching", "new", "unfamiliar"] },
            { id: "b", question: "Or has what you used to play stopped fitting?", words: ["changing", "shedding", "fresh"] },
          ],
          cue: { label: "Familiarity", text: "unfamiliar, nothing borrowed from the usual" },
        };
      }
      const known = f.total - f.newPlays;
      return {
        pattern: `${pct(known, f.total)} of your plays were tracks you already knew before these four weeks began.`,
        receipt: `${known} of ${f.total} plays`,
        offers: [
          { id: "a", question: "Is the familiar what you need right now?", words: ["familiar", "trusted", "worn-in"] },
          { id: "b", question: "Or is there no room at the moment for anything new?", words: ["full", "close", "sheltered"] },
        ],
        cue: { label: "Familiarity", text: "familiar shapes, nothing that surprises" },
      };
    }
    case "drift": {
      const from = k.texture(f.fromCluster);
      const to = k.texture(f.toCluster);
      return {
        pattern: `Music built on ${to} went from ${pct(f.to.week1, f.week1Total)} of your plays in week one to ${pct(f.to.week4, f.week4Total)} in week four. Music built on ${from} went from ${pct(f.from.week1, f.week1Total)} to ${pct(f.from.week4, f.week4Total)}.`,
        receipt: `${f.to.week1} of ${f.week1Total} plays in week one; ${f.to.week4} of ${f.week4Total} in week four`,
        offers: [
          // (3) "Is <a plural texture> somewhere..." did not parse. Since 2026-09-24 (Cowork copy return) the
          // listener is the subject and the sound takes "the", so a texture must carry no article of its
          // own: lines.test.ts holds every cluster to that.
          { id: "a", question: `Are you moving toward the ${to}?`, words: ["arriving", "turning", "new-found"] },
          { id: "b", question: `Or did the ${from} do something for you then that you need less now?`, words: ["after", "lighter", "moving on"] },
        ],
        cue: { label: "Arc", text: `starts near ${from} and ends on ${to}` },
      };
    }
    case "earlySkip": {
      if (f.direction === "high") {
        const kept = f.keptCluster
          ? ` Of the ones you let play longer, more were built on ${k.texture(f.keptCluster)} than on anything else.`
          : "";
        return {
          pattern: `You skipped ${f.skipped} of the ${f.tried} new tracks you tried within their first 30 seconds.${kept}`,
          receipt: `${f.skipped} of ${f.tried} first plays`,
          offers: [
            { id: "a", question: "Do you know within seconds what you are not looking for?", words: ["decisive", "sharp", "certain"] },
            { id: "b", question: "Or are you trying things on to see what still fits?", words: ["curious", "trying", "unfinished"] },
          ],
          cue: { label: "Intro", text: "gets to the point inside 30 seconds" },
        };
      }
      return {
        pattern: `Of the ${f.tried} new tracks you tried, you let ${f.tried - f.skipped} play past their first 30 seconds.`,
        receipt: `${f.tried - f.skipped} of ${f.tried} first plays`,
        offers: [
          { id: "a", question: "Are you giving new things time right now?", words: ["patient", "open", "unhurried"] },
          { id: "b", question: "Or were these chosen with care before you pressed play?", words: ["deliberate", "careful", "chosen"] },
        ],
        cue: { label: "Intro", text: "takes its time to arrive" },
      };
    }
  }
}

/** One fact, rendered as a line of the reading. */
export function readingLine(f: Fact, l: Listener): ReadingLine {
  const k = lookup(l);
  return {
    id: `${l.id}-${f.kind}`,
    kind: f.kind,
    ...parts(f, k),
    playIds: f.playIds,
    trackIds: f.trackIds,
    cluster: f.trackIds.length ? mainCluster(f.trackIds, k) : l.clusters[0].id,
  };
}
