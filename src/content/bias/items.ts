/**
 * Prestige-Bias Test item pool — POOL OF RECORD (v2 wired 2026-07-12;
 * v4 adds the two unlabeled control items b3/b1, PM ruling RT-1a 2026-07-19).
 *
 * Authority chain: docs/bias-pool-candidates.md (items + blurb drafts) →
 * docs/bias-pool-gatekeeping.md (per-item checks) → src/content/bias/
 * manifest.json (sources, SHA-256s, license snapshots, PM rulings, windows)
 * → this file. Audio rendered by scripts/clip-pipeline (20s excerpts,
 * EBU R128 two-pass to −16 LUFS, mp3 + m4a).
 *
 * PM ear pass of record: manifest.pmEarPass (no veto, 2026-07-12); pb4/pb8
 * joined after that pass and await the same check. pb6 is PROVISIONAL
 * (professional reviewer pending) — swapping it bumps BIAS_POOL_VERSION.
 *
 * Swap items (labelIsTrue: false) show a FICTIONAL artist + framing — the
 * sanctioned deception (memo §3), confessed with true attribution on the
 * mandatory debrief. Fictional names must never be real artists (checklist
 * §B); the current names are engineer drafts pending the PM C.1 pass.
 *
 * Array order = presentation order (genre-interleaved so no two adjacent
 * clips share a sound-world). DO NOT reorder, add, remove, or re-render
 * without bumping BIAS_POOL_VERSION — share URLs and the D6 dataset key on
 * the item order of the version that produced them.
 */

import type { BiasItemSpec } from "@/engine/bias";

export const BIAS_INSTRUMENT_ID = "prestige-bias-v1";

/**
 * Pool version (RT-7b). BUMP THIS ON ANY POOL CHANGE — items added, removed,
 * reordered, relabeled, re-windowed, or re-rendered. It rides in every share
 * URL and every bias_result event, so stored responses and old links are
 * permanently interpretable against the exact pool that produced them (D6).
 * Old-version URLs die gracefully (redirect to /bias), never lie.
 */
export const BIAS_POOL_VERSION = 7; // v7: swap fiction reverts to the PM-checked name (RT-141b; E7/S9)

/** One playable, labelable clip. Extends the engine spec with presentation. */
export interface BiasClip extends BiasItemSpec {
  /** Static file under /public — PD/CC audio only (memo §8.2). */
  audioSrc: string;
  /** Truthful attribution (revealed at debrief). */
  trueArtist: string;
  /** What the labeled pass shows. Equals the truth when labelIsTrue. */
  shownArtist: string;
  /** One-line acclaim (direction "up") or dismissal (direction "down"). */
  shownBlurb: string;
  /** License of the recording, e.g. "Public Domain" | "CC-BY 4.0". */
  license: string;
  /** Required credit line for CC works; TASL + excerpt notice. */
  attribution: string;
}

export const BIAS_CLIPS: BiasClip[] = [
  {
    id: "pb1",
    audioSrc: "/audio/bias/pb1.mp3",
    trueArtist: "J.S. Bach — Kimiko Ishizaka, piano (Open Goldberg Variations)",
    shownArtist: "J.S. Bach — Kimiko Ishizaka, piano (Open Goldberg Variations)",
    shownBlurb: "One of thirty variations, and not one of the ones anybody quotes.",
    license: "CC0",
    attribution:
      "“Goldberg Variations — Variatio 13 a 2 Clav.” — J.S. Bach, perf. Kimiko Ishizaka · archive.org/details/The_Open_Goldberg_Variations-11823 · CC0 · excerpt (trimmed + loudness-normalized)",
    labelDirection: "down",
    // RT-139(a), E7/S8: WAS the down-swap. Recast truthful because the delicacy
    // trials credit this exact recording — "Goldberg Variations — Variatio 13 a
    // 2 Clav." — J.S. Bach — Kimiko Ishizaka — by name, as CC0 attribution. A
    // deception is only defensible if it is confessed where we say it is, and
    // this one was discoverable on another instrument.
    labelIsTrue: true,
  },
  {
    id: "pb7",
    audioSrc: "/audio/bias/pb7.mp3",
    trueArtist: "Komiku",
    shownArtist: "Komiku",
    shownBlurb: "Written to be dropped into other people's games, and released by the album-load.",
    license: "CC0",
    attribution:
      "“The road we use to travel when we were kids” (Tale on the Late) — Komiku · archive.org/details/Komiku-TaleOnTheLate · CC0 · excerpt (trimmed + loudness-normalized)",
    labelDirection: "down",
    // RT-139(a), E7/S8: WAS the up-swap. The delicacy trials credit this exact
    // recording by title too — which the first version of the anonymity guard
    // MISSED, because it compared artist names and "Komiku" is six characters
    // against a filter that kept names longer than six. Two of three exposures
    // were found; this one was invisible until the guard compared work titles.
    labelIsTrue: true,
  },
  {
    id: "pb3",
    audioSrc: "/audio/bias/pb3.mp3",
    trueArtist: "F. Chopin — Musopen Complete Chopin project",
    shownArtist: "F. Chopin — Musopen Complete Chopin project",
    shownBlurb: "The nocturne recital programmers skip; even devoted Chopin listeners rarely defend it.",
    license: "CC0",
    attribution:
      "“Nocturne Op. 15 No. 3 in G minor” — F. Chopin, perf. Musopen Complete Chopin project · archive.org/details/musopen-chopin-complete-works-flac · CC0 · excerpt (trimmed + loudness-normalized)",
    labelDirection: "down",
    labelIsTrue: true,
  },
  {
    id: "pb9",
    audioSrc: "/audio/bias/pb9.mp3",
    trueArtist: "J. Suk — Musopen Kickstarter ensemble",
    shownArtist: "J. Suk — Musopen Kickstarter ensemble",
    shownBlurb: "Written in 1914 as a patriotic act, when Czech orchestras were forbidden the national anthem and played this instead.",
    license: "Public Domain (Musopen Kickstarter release)",
    attribution:
      "“Meditation on the Old Czech Chorale ‘St Wenceslas’, Op. 35a” — J. Suk, perf. Musopen Kickstarter ensemble · archive.org/details/MusopenCollectionAsFlac · Public Domain · excerpt (trimmed + loudness-normalized)",
    labelDirection: "up",
    labelIsTrue: true,
  },
  {
    // CONTROL (v1.1, instrument-defenses §hardening): rated in both passes,
    // labeled in neither — measures pure re-exposure drift. shownArtist/
    // shownBlurb are intentionally empty (nothing is ever shown); the UI
    // renders a neutral no-label frame instead. Clip: backup B3, PM
    // ear-confirmed 2026-07-12 (own start 7s). labelDirection is ignored by
    // the engine for controls.
    id: "b3",
    isControl: true,
    audioSrc: "/audio/bias/b3.mp3",
    trueArtist: "Komiku",
    shownArtist: "",
    shownBlurb: "",
    license: "CC0",
    attribution:
      "“The Wind” (Tale on the Late) — Komiku · archive.org/details/Komiku-TaleOnTheLate · CC0 · excerpt (trimmed + loudness-normalized)",
    labelDirection: "up",
    labelIsTrue: true,
  },
  {
    id: "pb6",
    audioSrc: "/audio/bias/pb6.mp3",
    trueArtist: "Chris Zabriskie",
    shownArtist: "Chris Zabriskie",
    shownBlurb: "Released into the open under a Creative Commons licence, and picked up by film and podcast makers ever since.",
    license: "CC-BY 4.0",
    attribution:
      "“That Hopeful Future Is All I've Ever Known” (Music from Neptune Flux) — Chris Zabriskie · CC-BY 4.0 (teamopen.cc/chris) · excerpt (trimmed + loudness-normalized)",
    labelDirection: "up",
    // RT-139(a), E7/S8: WAS an up-swap shown as "Alexander Vane". Recast
    // truthful for the same reason as pb1, and more sharply — pb6 is CC-BY 4.0,
    // so the delicacy trials are LEGALLY OBLIGED to credit Chris Zabriskie by
    // name. The deception could not survive a licence we must honour.
    labelIsTrue: true,
  },
  {
    id: "pb10",
    audioSrc: "/audio/bias/pb10.mp3",
    trueArtist: "F. Mendelssohn — Musopen Kickstarter ensemble",
    shownArtist: "F. Mendelssohn — Musopen Kickstarter ensemble",
    shownBlurb: "His last completed work, written in the months after his sister died; the one piece where the polish drops away.",
    license: "Public Domain (Musopen Kickstarter release)",
    attribution:
      "“String Quartet No. 6 in F minor, Op. 80 — III. Adagio” — F. Mendelssohn, perf. Musopen Kickstarter ensemble · archive.org/details/MusopenCollectionAsFlac · Public Domain · excerpt (trimmed + loudness-normalized)",
    labelDirection: "up",
    labelIsTrue: true,
  },
  {
    id: "pb2",
    audioSrc: "/audio/bias/pb2.mp3",
    trueArtist: "J.S. Bach — Kimiko Ishizaka, piano",
    shownArtist: "J.S. Bach — Kimiko Ishizaka, piano",
    shownBlurb: "From a recording project so admired it was placed in the public domain as a cultural gift.",
    license: "CC0",
    attribution:
      "“Well-Tempered Clavier Bk 1 — Prelude No. 12 in F minor, BWV 857” — J.S. Bach, perf. Kimiko Ishizaka · archive.org/details/bach-well-tempered-clavier-book-1 · CC0 · excerpt (trimmed + loudness-normalized)",
    labelDirection: "up",
    labelIsTrue: true,
  },
  {
    id: "pb11",
    audioSrc: "/audio/bias/pb11.mp3",
    trueArtist: "J. Brahms — Musopen Kickstarter ensemble",
    shownArtist: "Alexander Vane",
    shownBlurb: "A student overture, wheeled out when an orchestra needs something short before the interval.",
    license: "Public Domain (Musopen Kickstarter release)",
    attribution:
      "“Tragic Overture, Op. 81” — J. Brahms, perf. Musopen Kickstarter ensemble · archive.org/details/MusopenCollectionAsFlac · Public Domain · excerpt (trimmed + loudness-normalized)",
    labelDirection: "down",
    // DOWN-SWAP (RT-139a, E7/S8): dismissive fiction on a strong work — the
    // role pb1 used to carry. Moved here because pb11 is used by NO other
    // instrument: the staircase renders from pb1/pb6/pb8 and the delicacy pool
    // from pb3/pb8, so nothing else can credit this recording and give the game
    // away. The name is "Alexander Vane" — PM-approved 2026-07-12 and free
    // again now that pb6 is truthfully labelled (RT-141 b). An already-checked
    // fiction beat a fresh invention because checklist §B's "never a real
    // artist" rule is not something an engineer discharges by liking the sound
    // of a name.
    labelIsTrue: false,
  },
  {
    id: "pb8",
    audioSrc: "/audio/bias/pb8.mp3",
    trueArtist: "Jason Shaw (Audionautix)",
    shownArtist: "Jason Shaw (Audionautix)",
    shownBlurb: "Stock production music, written to be inoffensive; the audio equivalent of a waiting room.",
    license: "CC-BY 4.0",
    attribution:
      "“Folk Bed” — music by audionautix.com (Jason Shaw) · audionautix.com/creative-commons-music · CC-BY 4.0 · excerpt (trimmed + loudness-normalized)",
    labelDirection: "down",
    labelIsTrue: true,
  },
  {
    id: "pb13",
    audioSrc: "/audio/bias/pb13.mp3",
    trueArtist: "Monplaisir",
    shownArtist: "Noé Calvet",
    shownBlurb: "A minimalist study praised on year-end experimental lists for doing more with less.",
    license: "CC0",
    attribution:
      "“Il y a un bout de ciel bleu” (Rosée) — Monplaisir · archive.org/details/Monplaisir-Rose · CC0 · excerpt (trimmed + loudness-normalized)",
    labelDirection: "up",
    // UP-SWAP (RT-139a, E7/S8): acclaim fiction on a modest work — the role pb7
    // used to carry, moved here because no other instrument credits this
    // recording. The fictional name and the blurb are the ones the PM approved
    // on 2026-07-12, deliberately unchanged: what moved is the recording they
    // are attached to, not the deception itself.
    labelIsTrue: false,
  },
  {
    id: "pb5",
    audioSrc: "/audio/bias/pb5.mp3",
    trueArtist: "F. Chopin — Musopen Complete Chopin project",
    shownArtist: "F. Chopin — Musopen Complete Chopin project",
    shownBlurb: "Late-period Chopin at its most refined — the mazurka connoisseurs reach for when they want the form taken seriously.",
    license: "CC0",
    attribution:
      "“Mazurka in A minor, Op. 59 No. 1” — F. Chopin, perf. Musopen Complete Chopin project · archive.org/details/musopen-chopin-complete-works-flac · CC0 · excerpt (trimmed + loudness-normalized)",
    labelDirection: "up",
    labelIsTrue: true,
  },
  {
    id: "pb4",
    audioSrc: "/audio/bias/pb4.mp3",
    trueArtist: "L. van Beethoven — Musopen Kickstarter ensemble",
    shownArtist: "L. van Beethoven — Musopen Kickstarter ensemble",
    shownBlurb: "The movement scholars point to when they argue early Beethoven was already looking decades ahead.",
    license: "Public Domain (Musopen Kickstarter release)",
    attribution:
      "“String Quartet Op. 18 No. 6 — IV. La Malinconia (Adagio)” — L. van Beethoven, perf. Musopen Kickstarter ensemble · archive.org/details/MusopenCollectionAsFlac · Public Domain · excerpt (trimmed + loudness-normalized)",
    labelDirection: "up",
    labelIsTrue: true,
  },
  {
    id: "pb14",
    audioSrc: "/audio/bias/pb14.mp3",
    trueArtist: "Jason Shaw (Audionautix)",
    shownArtist: "Jason Shaw (Audionautix)",
    shownBlurb: "Library music filed under jazz: the sound of the genre with nobody taking a risk inside it.",
    license: "CC-BY 4.0",
    attribution:
      "“Closer To Jazz” — music by audionautix.com (Jason Shaw) · audionautix.com/creative-commons-music · CC-BY 4.0 · excerpt (trimmed + loudness-normalized)",
    labelDirection: "down",
    labelIsTrue: true,
  },
  {
    // CONTROL (v1.1): see b3 above. Clip: backup B1, previewed in the PM ear
    // pass of 2026-07-12 (no veto). Piano control balances b3's modern
    // instrumental so the drift baseline samples both of the pool's
    // sound-worlds.
    id: "b1",
    isControl: true,
    audioSrc: "/audio/bias/b1.mp3",
    trueArtist: "J.S. Bach — Kimiko Ishizaka, piano",
    shownArtist: "",
    shownBlurb: "",
    license: "CC0",
    attribution:
      "“Well-Tempered Clavier Bk 1 — Prelude No. 4 in C-sharp minor, BWV 849” — J.S. Bach, perf. Kimiko Ishizaka · archive.org/details/bach-well-tempered-clavier-book-1 · CC0 · excerpt (trimmed + loudness-normalized)",
    labelDirection: "up",
    labelIsTrue: true,
  },
  {
    id: "pb12",
    audioSrc: "/audio/bias/pb12.mp3",
    trueArtist: "A. Borodin — Musopen Kickstarter ensemble",
    shownArtist: "A. Borodin — Musopen Kickstarter ensemble",
    shownBlurb: "Overshadowed by the quartet he wrote next, whose slow movement became a Broadway song. This one did not.",
    license: "Public Domain (Musopen Kickstarter release)",
    attribution:
      "“String Quartet No. 1 in A major — II. Andante con moto” — A. Borodin, perf. Musopen Kickstarter ensemble · archive.org/details/MusopenCollectionAsFlac · Public Domain · excerpt (trimmed + loudness-normalized)",
    labelDirection: "down",
    labelIsTrue: true,
  },
];
