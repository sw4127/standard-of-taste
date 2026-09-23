/**
 * THE READING'S DATA SHAPES (blueprint Part 4; BA-8).
 *
 * A listener is authored habits plus a pool of fictional tracks. The plays are
 * never authored: `src/engine/reading/generate.ts` turns habits into four weeks
 * of plays with a seeded generator, and every sentence of the reading is
 * computed from those plays. Habits exist only to drive the generator; the
 * pattern engine never reads them.
 */

/** The three measured flaw families (BP-BRIDGE): what a listener can hear decides which words are worth spending. */
export type FlawFamily = "tuning" | "timing" | "compression";
export const FLAW_FAMILIES: readonly FlawFamily[] = ["tuning", "timing", "compression"];

/** The prompt axes a generator's text box responds to (MRD §4.1). */
export interface SoundWords {
  tempo: string;
  texture: string;
  voice: string;
  production: string;
}

/** A sound cluster: tracks that share a sound. Its texture doubles as its name in a sentence. */
export interface Cluster {
  id: string;
  sound: SoundWords;
  /** The words for this cluster's sound in each flaw family, for the bridge. */
  family: Record<FlawFamily, string>;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  cluster: string;
  /** Heard before the four weeks began. A track that is not is new inside the window. */
  before: boolean;
  /** New tracks only: the first day (0–27) it can be played. */
  introDay?: number;
}

export interface Habits {
  seed: number;
  /** Mean plays a day. */
  playsPerDay: number;
  /** Chance a play starts between 23:00 and 03:59. */
  lateNight: number;
  /** How hard plays pile onto a cluster's first few tracks (a Zipf exponent). */
  repeat: number;
  /** Chance a play reaches for a track first heard inside the window. */
  newAppetite: number;
  /** Chance the first play of a new track is abandoned inside 30 seconds. */
  skipNew: number;
  /** Share of plays each cluster gets in week one, and in week four. */
  drift: { from: Record<string, number>; to: Record<string, number> };
}

export interface Listener {
  id: string;
  name: string;
  /** Provenance, carried as data so the badge cannot be typed (site-badges.test.tsx). */
  dataSource: "SIMULATED";
  clusters: Cluster[];
  tracks: Track[];
  habits: Habits;
}

export interface Play {
  id: number;
  day: number;
  hour: number;
  minute: number;
  trackId: string;
  /** The first play of this track inside the window. */
  first: boolean;
  /** Abandoned inside its first 30 seconds. Only a new track's first play can be. */
  skippedEarly: boolean;
}
