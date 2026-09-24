/**
 * THREE ILLUSTRATIVE LISTENERS (owner ruling BA-8, 2026-09-23).
 *
 * The reading needs recent listening to read, and the prototype has no real
 * listener to read it from (BP-GOAL: never distributed). So it runs on three
 * people who do not exist, labelled on every surface. Their artists and tracks
 * are fictional and every name was checked against real artists, tracks and
 * companies by web search on 2026-09-23; the queries, the six collisions found
 * and their replacements are in `docs/reading-names-check-2026-09-23.md`.
 *
 * WHAT IS AUTHORED HERE: each listener's HABITS and the SOUND of their tracks.
 * What is not: the plays, which a seeded generator makes from the habits
 * (`src/engine/reading/generate.ts`), and every sentence of the reading, which
 * the pattern engine computes from the plays. Nothing below says what a
 * listener's pattern IS; the habits only make one likely.
 *
 * THE SOUND WORDS feed the prompt (RT-Z8 a: generic generator vocabulary, no
 * generator named). The FAMILY words are the same sound described in the three
 * flaw families the hearing tests measure, so the prompt can group them for
 * BP-BRIDGE.
 */
import type { Cluster, Listener, Track } from "./types";

export const LISTENER_LABEL = "Illustrative listener. Fictional artists and plays.";

/** A cluster's tracks: artists alternate; the last `intros.length` titles are new, first playable on those days. */
function pool(listener: string, cluster: string, artists: [string, string], titles: string[], intros: number[]): Track[] {
  const firstNew = titles.length - intros.length;
  return titles.map((title, i) => ({
    id: `${listener}-${cluster}-${i + 1}`,
    title,
    artist: artists[i % 2],
    cluster,
    before: i < firstNew,
    ...(i >= firstNew ? { introDay: intros[i - firstNew] } : {}),
  }));
}

/* ------------------------------------------------------------------ Mira */

const MIRA_CLUSTERS: Cluster[] = [
  {
    id: "hush",
    sound: {
      tempo: "slow, around 70 bpm",
      texture: "sparse piano and room hiss",
      voice: "no vocals",
      production: "close-miked and dry",
    },
    family: { tuning: "a felt piano, a little out of tune", timing: "rubato, off the grid", compression: "clean and close, room hiss left in" },
  },
  {
    id: "haze",
    sound: {
      tempo: "mid-tempo on half-time drums",
      texture: "washed-out synth pads",
      voice: "a low, breathy vocal",
      production: "tape-saturated",
    },
    family: { tuning: "warbling, detuned pads", timing: "lazy, behind-the-beat drums", compression: "tape-worn, soft top end" },
  },
  {
    id: "pulse",
    sound: {
      tempo: "a steady 120 bpm",
      texture: "clean electric guitar arpeggios",
      voice: "a bright, doubled vocal",
      production: "polished and wide",
    },
    family: { tuning: "a pitch-corrected vocal", timing: "tight to the grid", compression: "glossy, fully polished" },
  },
];

const MIRA: Listener = {
  id: "mira",
  name: "Mira",
  dataSource: "SIMULATED",
  clusters: MIRA_CLUSTERS,
  tracks: [
    ...pool("mira", "hush", ["Anneke Vosstrand", "The Quillmere Room"], [
      "Tallowfen", "Ostrelle, Late", "The Quillmere Stair", "Hush for Varrow", "Lampwick Sonata", "Fennish Glass",
      "Orrinwick Window", "Candlewane", "Stillmoor", "Low Tide at Essany", "Mothlamp Etude", "Wintel Hours",
    ], [5, 16]),
    ...pool("mira", "haze", ["Halcyrne", "Dovetail Sistrum"], [
      "Velvetine Drift", "Harrowglass", "Soft Machinery of Ule", "Brume Parade", "Pellucine", "Ambergild",
      "Amberlane Tapes", "Quietus Carnival", "Halcyrne Blue", "Dovetail Hymn", "Sistrum Weather", "Loam and Neon",
    ], [2, 8, 12, 17, 21]),
    ...pool("mira", "pulse", ["Kestrelline", "Ondo Varrick"], [
      "Kestrel Signal", "Bright Varrick", "Signal Orchard", "Tessellate Summer", "Ondo Ondo", "Glassrunner",
    ], [10]),
  ],
  habits: {
    seed: 7101,
    playsPerDay: 11,
    lateNight: 0.55,
    repeat: 1.7,
    newAppetite: 0.12,
    skipNew: 0.3,
    drift: { from: { hush: 0.6, haze: 0.3, pulse: 0.1 }, to: { hush: 0.35, haze: 0.55, pulse: 0.1 } },
  },
};

/* ------------------------------------------------------------------- Teo */

const TEO_CLUSTERS: Cluster[] = [
  {
    id: "groove",
    sound: {
      tempo: "a loose 100 bpm swing",
      texture: "live bass and brushed drums",
      voice: "a dry, conversational vocal",
      production: "roomy, barely processed",
    },
    family: { tuning: "horns that sit a little sharp", timing: "a loose swing", compression: "a live-room recording, unpolished" },
  },
  {
    id: "bright",
    sound: {
      tempo: "fast, around 140 bpm",
      texture: "chopped vocal samples and bright synths",
      voice: "pitched-up vocal chops",
      production: "loud and glossy",
    },
    family: { tuning: "hard-tuned vocals", timing: "quantised, machine-tight", compression: "crisp, digital, bright top end" },
  },
  {
    id: "drone",
    sound: {
      tempo: "no fixed pulse",
      texture: "long bowed strings and drones",
      voice: "no vocals",
      production: "a cavernous reverb",
    },
    family: { tuning: "pure-interval drones", timing: "free time", compression: "pristine, full detail" },
  },
];

const TEO: Listener = {
  id: "teo",
  name: "Teo",
  dataSource: "SIMULATED",
  clusters: TEO_CLUSTERS,
  tracks: [
    ...pool("teo", "groove", ["Ottrel Five", "Juniper Qell Trio"], [
      "Ottrel Stroll", "Qellway Shuffle", "Tamarind Dispatch", "Brambleknot Hop", "Quorra Walk",
      "Upright in Vell", "Sunday at Merrow Yard", "Hobnail Bounce", "Tinbird Lope", "Porch at Oduvell",
    ], [1, 4, 9, 15, 22]),
    ...pool("teo", "bright", ["Zorbelle", "Tesserine"], [
      "Zorbelle Candy", "Tesserine Rush", "Glimmerjack", "Hyperdew", "Neon Quokka", "Sugarwire",
      "Blink Harbour", "Zestrine", "Chromafroth", "Pop Vesuvia", "Ultravine", "Kilowisp",
    ], [0, 2, 5, 7, 10, 13, 16, 19, 24]),
    ...pool("teo", "drone", ["Hollowvane Consort", "Aurelle Stasis"], [
      "Hollowvane I", "Hollowvane II", "Aurelle's Long Room", "Stasis for Nine Strings", "Umbercall",
      "Tidewell", "The Slow Anvil", "Ferrocanticle",
    ], [3, 11, 20]),
  ],
  habits: {
    seed: 7202,
    playsPerDay: 14,
    lateNight: 0.05,
    repeat: 0.5,
    newAppetite: 0.7,
    skipNew: 0.7,
    drift: { from: { groove: 0.5, bright: 0.2, drone: 0.3 }, to: { groove: 0.35, bright: 0.55, drone: 0.1 } },
  },
};

/* ------------------------------------------------------------------- Lin */

const LIN_CLUSTERS: Cluster[] = [
  {
    id: "wall",
    sound: {
      tempo: "fast and driving, around 160 bpm",
      texture: "distorted guitars in a wall of sound",
      voice: "a shouted, double-tracked vocal",
      production: "dense and loud",
    },
    family: { tuning: "drop-tuned guitars", timing: "tight, pushed drums", compression: "gritty, lo-fi edges" },
  },
  {
    id: "acoustic",
    sound: {
      tempo: "slow, around 80 bpm",
      texture: "fingerpicked nylon guitar",
      voice: "a quiet, close vocal",
      production: "intimate and dry",
    },
    family: { tuning: "open tunings, a little loose", timing: "human, slightly uneven", compression: "warm and analog, a little hiss" },
  },
  {
    id: "choir",
    sound: {
      tempo: "a slow swell",
      texture: "layered voices and organ",
      voice: "choral harmony",
      production: "a church-hall reverb",
    },
    family: { tuning: "pure, stacked harmony", timing: "free, paced by breath", compression: "clean and airy, every breath audible" },
  },
];

const LIN: Listener = {
  id: "lin",
  name: "Lin",
  dataSource: "SIMULATED",
  clusters: LIN_CLUSTERS,
  tracks: [
    ...pool("lin", "wall", ["Gravelhymn", "Cinder Parish"], [
      "Cindergrist", "Parish of Static", "Kilnroar", "Blackwick Engine", "Teeth of Harrowmere",
      "Stormvellar", "Fuse Sermon", "Ironvelt", "Gravelhymn Theme", "Rustcantor",
    ], [6]),
    ...pool("lin", "acoustic", ["Fennow Hollis", "Tamsel & Rye"], [
      "Fennow Letter", "Tamsel Lullaby", "Rye at Tessmoor", "Small Hands of Brenn", "Linenvale Road",
      "Ashgrove Quill", "Thimblewort", "Quiet Engine of Wellsby", "Morrowleaf", "Pinewhistle Air",
      "Candlefern", "Sparrowgilt",
    ], [8, 10, 12, 14, 16, 18, 20, 22, 24]),
    ...pool("lin", "choir", ["The Orvelle Singers", "Chapelmoss"], [
      "Orvelle Magnificat", "Chapelmoss Evening", "Seven Candles for Aune", "Organ at Tullowmere",
      "Stonevell Canticle", "Brevellan Hymn", "Lumen Tarry", "Quire of Ashvel",
    ], [9, 19]),
  ],
  habits: {
    seed: 7303,
    playsPerDay: 9,
    lateNight: 0.2,
    repeat: 1.1,
    newAppetite: 0.3,
    skipNew: 0.2,
    drift: { from: { wall: 0.65, acoustic: 0.15, choir: 0.2 }, to: { wall: 0.15, acoustic: 0.6, choir: 0.25 } },
  },
};

export const LISTENERS: readonly Listener[] = [MIRA, TEO, LIN];

export function listener(id: string): Listener | undefined {
  return LISTENERS.find((l) => l.id === id);
}
