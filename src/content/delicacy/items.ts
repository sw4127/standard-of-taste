/**
 * Delicacy Trials item pool — 18 trials (PM rulings RT-24a / RT-25a, 2026-08-07).
 *
 * WHY 24. Three independent measurements said six was too short for any of the
 * psychometrics to work: Cronbach's alpha 0.25 against a 0.70 floor; the §1
 * discrimination floor unreachable (0 of 6 items could clear it, because a 2AFC
 * guessing floor attenuates every item-total correlation); and 2PL parameters
 * not identified, with 3 of 6 items pinning at the a = 4 bound. Spearman-Brown
 * puts alpha = 0.70 near 42 trials — 24 does NOT reach the conventional
 * reliability floor and no surface may claim it does. It is the point where the
 * instrument becomes analysable without a session nobody finishes.
 *
 * THE DESIGN is a crossed factorial: 3 degradation families x 3 shipping ladder
 * rungs, each cell twice, each replicate on a DIFFERENT source recording so a
 * family-by-rung effect can never be confounded with one piece of music.
 *
 * LADDER RUNG 1 DOES NOT SHIP. S6 verified the ladder was monotone, but monotone
 * is not sufficient: all four rung-1 items measured 1.5-2.9x the transparency
 * anchor, under the 3x fair-trial floor. An item barely distinguishable from a
 * manipulation nobody can hear is not a trial, whatever its rung number says. Windows were chosen MECHANICALLY
 * (fixed offsets, skipping anything overlapping the same source's bias
 * excerpt) — the PM is out of the clip-judging loop by design, and a curated
 * window list would smuggle taste back in.
 *
 * Generated from src/content/delicacy/manifest.json by
 * `node scripts/clip-pipeline/index.mjs expand --render`; params, seeds,
 * sha256s and Layer A measurements live there.
 *
 * THE PM EAR PASS IS RETIRED (artifact pivot §1). Audibility is not gated by a
 * human listener; the door turns on measured manipulation magnitude against a
 * known-transparent anchor, and item DIFFICULTY stays explicitly uncalibrated
 * until Layer B has real responses.
 *
 * VERSIONING: v>=1 pools are IMMUTABLE per version — any item change bumps the
 * version, and share payloads are positional against it (contract in
 * src/engine/delicacy.ts). v0 is the explicit dev exception: mutable, and its
 * share surface never exists in production, so no live URL can silently rescore.
 */

import type { DegradationFamily, DelicacyItemSpec } from "@/engine/delicacy";

export const DELICACY_INSTRUMENT_ID = "delicacy-v1";

/**
 * 0 = not live. 17 of 18 pairs pass Layer A; d10 (pitch-drift rung 2) measures
 * 2.6x the transparency anchor against a 3x floor.
 *
 * The diagnosis is a parameter, not a source: pitch-drift rung 2 (12 cents)
 * measures 1.31-1.50 dB and lands at 2.6-3.3x wherever it is placed, while
 * rung 3 reaches 3.2-4.1x and rung 4 reaches 4.7-5.0x. Its lower rungs are
 * marginal everywhere. Widening pitch-drift's parameter ladder is a product
 * decision (it changes what ships) and is with the PM — see RT-27.
 */
export const DELICACY_POOL_VERSION = 0;

/**
 * THE DOOR (D3): every surface that gates on the delicacy tier reads this one
 * flag — homepage machine card, bias-debrief door, /delicacy robots, sitemap,
 * prod share surface. It flips exactly when the gates above clear.
 */
export const DELICACY_LIVE = DELICACY_POOL_VERSION > 0;

/** One playable trial pair. Extends the engine spec with presentation. */
export interface DelicacyTrialClip extends DelicacyItemSpec {
  /** Static files under /public — PD/CC audio only (memo §8.2). */
  srcA: string;
  srcB: string;
  /** Truthful credit for the source work (revealed post-answer, N3). */
  sourceCredit: string;
  license: string;
  /** TASL + excerpt/manipulation notice (CC requirement; PD listed anyway). */
  attribution: string;
}

/**
 * User-facing names for the degradation families — the flaw-pick options.
 * ALL THREE are offered on every trial (FLAW_CHANCE in the engine depends on
 * it; trimming options would leak the answer).
 */
export const FLAW_LABELS: Record<DegradationFamily, { label: string; hint: string }> = {
  "pitch-drift": { label: "The pitch drifts", hint: "it slides out of tune as it goes" },
  "timing-smear": { label: "The timing warbles", hint: "it rushes and drags in slow waves" },
  "lossy-artifact": { label: "The detail is crushed", hint: "compression smear — swishy, airless highs" },
};

const pair = (
  id: string,
  family: DegradationFamily,
  magnitude: 1 | 2 | 3 | 4,
  originalSide: "a" | "b",
  sourceCredit: string,
  license: string,
  attribution: string,
): DelicacyTrialClip => ({
  id,
  family,
  magnitude,
  originalSide,
  srcA: `/audio/delicacy/${id}-a.mp3`,
  srcB: `/audio/delicacy/${id}-b.mp3`,
  sourceCredit,
  license,
  attribution,
});

/**
 * Presentation order (positional — see versioning above). Contracts enforced
 * by gates.ts: 18 trials, each family 6x, each shipping rung 6x, every
 * family-rung cell exactly 2x on different lead artists, no two adjacent
 * trials sharing a family, sides roughly balanced.
 */
export const DELICACY_TRIALS: DelicacyTrialClip[] = [
  pair(
    "d1",
    "pitch-drift",
    2,
    "a",
    "J.S. Bach — Kimiko Ishizaka",
    "CC0",
    "“Goldberg Variations — Variatio 13 a 2 Clav.” — J.S. Bach — Kimiko Ishizaka · https://archive.org/details/The_Open_Goldberg_Variations-11823 · CC0 · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d2",
    "timing-smear",
    2,
    "b",
    "L. van Beethoven — Musopen Kickstarter ensemble (per item page)",
    "Public Domain (Musopen Kickstarter PD release; PD-mark licenseurl on item)",
    "“String Quartet Op. 18 No. 6 — IV. La Malinconia (Adagio)” — L. van Beethoven — Musopen Kickstarter ensemble (per item page) · https://archive.org/details/MusopenCollectionAsFlac · Public Domain (Musopen Kickstarter PD release; PD-mark licenseurl on item) · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d3",
    "lossy-artifact",
    2,
    "b",
    "Jason Shaw",
    "CC-BY 4.0",
    "“Folk Bed” — Jason Shaw · https://audionautix.com/free-music/acoustic · CC-BY 4.0 · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d4",
    "pitch-drift",
    3,
    "b",
    "F. Chopin — Musopen Complete Chopin project (performer per item page — record exact name from snapshot for TASL)",
    "PD or CC0 (verify on piece page; CC-BY-SA -> engineer flag)",
    "“Nocturne Op. 15 No. 3 in G minor” — F. Chopin — Musopen Complete Chopin project (performer per item page — record exact name from snapshot for TASL) · https://archive.org/details/musopen-chopin-complete-works-flac · PD or CC0 (verify on piece page; CC-BY-SA -> engineer flag) · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d5",
    "timing-smear",
    3,
    "a",
    "Komiku",
    "CC0",
    "“The road we use to travel when we were kids (Tale on the Late)” — Komiku · https://archive.org/details/Komiku-TaleOnTheLate · CC0 · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d6",
    "lossy-artifact",
    3,
    "a",
    "J.S. Bach — Kimiko Ishizaka",
    "CC0",
    "“WTC Book 1 — Prelude No. 4 in C-sharp minor, BWV 849 (backup)” — J.S. Bach — Kimiko Ishizaka · https://archive.org/details/bach-well-tempered-clavier-book-1 · CC0 · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d7",
    "pitch-drift",
    4,
    "b",
    "Chris Zabriskie",
    "CC-BY 4.0",
    "“That Hopeful Future Is All I've Ever Known (Music from Neptune Flux)” — Chris Zabriskie · https://archive.org/details/Music_from_Neptune_Flux-21899 · CC-BY 4.0 · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d8",
    "timing-smear",
    4,
    "a",
    "J.S. Bach — Kimiko Ishizaka",
    "CC0 (VERIFIED 2026-07-11 on archive.org item)",
    "“WTC Book 1 — Prelude No. 12 in F minor, BWV 857” — J.S. Bach — Kimiko Ishizaka · https://archive.org/details/bach-well-tempered-clavier-book-1 · CC0 (VERIFIED 2026-07-11 on archive.org item) · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d9",
    "lossy-artifact",
    4,
    "b",
    "F. Chopin — Musopen Complete Chopin project (performer per item page — record exact name for TASL)",
    "CC0 (machine-readable licenseurl on item, verified 2026-07-12)",
    "“Mazurka in A minor, Op. 68 No. 2 (backup)” — F. Chopin — Musopen Complete Chopin project (performer per item page — record exact name for TASL) · https://archive.org/details/musopen-chopin-complete-works-flac · CC0 (machine-readable licenseurl on item, verified 2026-07-12) · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d10",
    "pitch-drift",
    2,
    "a",
    "Komiku",
    "CC0",
    "“The Wind (Tale on the Late)” — Komiku · https://archive.org/details/Komiku-TaleOnTheLate · CC0 · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d11",
    "timing-smear",
    2,
    "a",
    "Chris Zabriskie",
    "CC-BY 4.0",
    "“That Hopeful Future Is All I've Ever Known (Music from Neptune Flux)” — Chris Zabriskie · https://archive.org/details/Music_from_Neptune_Flux-21899 · CC-BY 4.0 · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d12",
    "lossy-artifact",
    2,
    "b",
    "J.S. Bach — Kimiko Ishizaka",
    "CC0 (VERIFIED 2026-07-11 on archive.org item)",
    "“WTC Book 1 — Prelude No. 12 in F minor, BWV 857” — J.S. Bach — Kimiko Ishizaka · https://archive.org/details/bach-well-tempered-clavier-book-1 · CC0 (VERIFIED 2026-07-11 on archive.org item) · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d13",
    "pitch-drift",
    4,
    "a",
    "F. Chopin — Musopen Complete Chopin project (performer per item page — record exact name from snapshot for TASL)",
    "PD or CC0 (verify on piece page; CC-BY-SA -> engineer flag)",
    "“Nocturne Op. 15 No. 3 in G minor” — F. Chopin — Musopen Complete Chopin project (performer per item page — record exact name from snapshot for TASL) · https://archive.org/details/musopen-chopin-complete-works-flac · PD or CC0 (verify on piece page; CC-BY-SA -> engineer flag) · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d14",
    "timing-smear",
    3,
    "a",
    "L. van Beethoven — Musopen Kickstarter ensemble (per item page)",
    "Public Domain (Musopen Kickstarter PD release; PD-mark licenseurl on item)",
    "“String Quartet Op. 18 No. 6 — IV. La Malinconia (Adagio)” — L. van Beethoven — Musopen Kickstarter ensemble (per item page) · https://archive.org/details/MusopenCollectionAsFlac · Public Domain (Musopen Kickstarter PD release; PD-mark licenseurl on item) · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d15",
    "lossy-artifact",
    3,
    "b",
    "Jason Shaw",
    "CC-BY 4.0",
    "“Folk Bed” — Jason Shaw · https://audionautix.com/free-music/acoustic · CC-BY 4.0 · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d16",
    "pitch-drift",
    3,
    "b",
    "J.S. Bach — Kimiko Ishizaka",
    "CC0",
    "“Goldberg Variations — Variatio 13 a 2 Clav.” — J.S. Bach — Kimiko Ishizaka · https://archive.org/details/The_Open_Goldberg_Variations-11823 · CC0 · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d17",
    "timing-smear",
    4,
    "a",
    "Komiku",
    "CC0",
    "“The road we use to travel when we were kids (Tale on the Late)” — Komiku · https://archive.org/details/Komiku-TaleOnTheLate · CC0 · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d18",
    "lossy-artifact",
    4,
    "a",
    "J.S. Bach — Kimiko Ishizaka",
    "CC0",
    "“WTC Book 1 — Prelude No. 4 in C-sharp minor, BWV 849 (backup)” — J.S. Bach — Kimiko Ishizaka · https://archive.org/details/bach-well-tempered-clavier-book-1 · CC0 · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
];
