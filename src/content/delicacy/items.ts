/**
 * Delicacy Trials item pool — 24 trials (PM rulings RT-7b / RT-24a, 2026-08-07).
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
 * THE DESIGN is a crossed factorial: 3 degradation families x 4 ladder rungs,
 * each cell twice, each replicate on a DIFFERENT source recording so a
 * family-by-rung effect can never be confounded with one piece of music. The
 * rungs are the values S6 verified monotone. Windows were chosen MECHANICALLY
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
 * 0 = not live. Six of the 24 pairs currently FLAG on Layer A: four at ladder
 * rung 1, which measures too close to a transparent round-trip to be a fair
 * trial, and two on dense orchestral material whose transparency anchor is
 * large enough to suppress the ratio. The pool of record ships as 1 once that
 * is resolved — the gate is doing its job, and shipping around it would make
 * the gate decorative.
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
 * by gates.ts: 24 trials, each family 8x, each ladder rung 6x, every
 * family-rung cell exactly 2x on different lead artists, no two adjacent
 * trials sharing a family, sides roughly balanced.
 */
export const DELICACY_TRIALS: DelicacyTrialClip[] = [
  pair(
    "d1",
    "pitch-drift",
    1,
    "a",
    "J.S. Bach — Kimiko Ishizaka",
    "CC0",
    "“Goldberg Variations — Variatio 13 a 2 Clav.” — J.S. Bach — Kimiko Ishizaka · https://archive.org/details/The_Open_Goldberg_Variations-11823 · CC0 · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d2",
    "timing-smear",
    1,
    "a",
    "Komiku",
    "CC0",
    "“The road we use to travel when we were kids (Tale on the Late)” — Komiku · https://archive.org/details/Komiku-TaleOnTheLate · CC0 · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d3",
    "pitch-drift",
    2,
    "b",
    "F. Chopin — Musopen Complete Chopin project (performer per item page — record exact name from snapshot for TASL)",
    "PD or CC0 (verify on piece page; CC-BY-SA -> engineer flag)",
    "“Nocturne Op. 15 No. 3 in G minor” — F. Chopin — Musopen Complete Chopin project (performer per item page — record exact name from snapshot for TASL) · https://archive.org/details/musopen-chopin-complete-works-flac · PD or CC0 (verify on piece page; CC-BY-SA -> engineer flag) · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d4",
    "timing-smear",
    2,
    "a",
    "J.S. Bach — Kimiko Ishizaka",
    "CC0 (VERIFIED 2026-07-11 on archive.org item)",
    "“WTC Book 1 — Prelude No. 12 in F minor, BWV 857” — J.S. Bach — Kimiko Ishizaka · https://archive.org/details/bach-well-tempered-clavier-book-1 · CC0 (VERIFIED 2026-07-11 on archive.org item) · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d5",
    "pitch-drift",
    3,
    "b",
    "Chris Zabriskie",
    "CC-BY 4.0",
    "“That Hopeful Future Is All I've Ever Known (Music from Neptune Flux)” — Chris Zabriskie · https://archive.org/details/Music_from_Neptune_Flux-21899 · CC-BY 4.0 · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d6",
    "timing-smear",
    3,
    "b",
    "F. Chopin — Musopen Complete Chopin project (performer per item page — record exact name for TASL)",
    "CC0 (machine-readable licenseurl on item, verified 2026-07-12)",
    "“Mazurka in A minor, Op. 59 No. 1” — F. Chopin — Musopen Complete Chopin project (performer per item page — record exact name for TASL) · https://archive.org/details/musopen-chopin-complete-works-flac · CC0 (machine-readable licenseurl on item, verified 2026-07-12) · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d7",
    "pitch-drift",
    4,
    "b",
    "L. van Beethoven — Musopen Kickstarter ensemble (per item page)",
    "Public Domain (Musopen Kickstarter PD release; PD-mark licenseurl on item)",
    "“String Quartet Op. 18 No. 6 — IV. La Malinconia (Adagio)” — L. van Beethoven — Musopen Kickstarter ensemble (per item page) · https://archive.org/details/MusopenCollectionAsFlac · Public Domain (Musopen Kickstarter PD release; PD-mark licenseurl on item) · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d8",
    "timing-smear",
    4,
    "a",
    "Jason Shaw",
    "CC-BY 4.0",
    "“Folk Bed” — Jason Shaw · https://audionautix.com/free-music/acoustic · CC-BY 4.0 · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d9",
    "lossy-artifact",
    1,
    "b",
    "J.S. Bach — Kimiko Ishizaka",
    "CC0",
    "“WTC Book 1 — Prelude No. 4 in C-sharp minor, BWV 849 (backup)” — J.S. Bach — Kimiko Ishizaka · https://archive.org/details/bach-well-tempered-clavier-book-1 · CC0 · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d10",
    "pitch-drift",
    1,
    "a",
    "F. Chopin — Musopen Complete Chopin project (performer per item page — record exact name from snapshot for TASL)",
    "PD or CC0 (verify on piece page; CC-BY-SA -> engineer flag)",
    "“Nocturne Op. 15 No. 3 in G minor” — F. Chopin — Musopen Complete Chopin project (performer per item page — record exact name from snapshot for TASL) · https://archive.org/details/musopen-chopin-complete-works-flac · PD or CC0 (verify on piece page; CC-BY-SA -> engineer flag) · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d11",
    "lossy-artifact",
    3,
    "b",
    "Komiku",
    "CC0",
    "“The Wind (Tale on the Late)” — Komiku · https://archive.org/details/Komiku-TaleOnTheLate · CC0 · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d12",
    "pitch-drift",
    2,
    "a",
    "Chris Zabriskie",
    "CC-BY 4.0",
    "“That Hopeful Future Is All I've Ever Known (Music from Neptune Flux)” — Chris Zabriskie · https://archive.org/details/Music_from_Neptune_Flux-21899 · CC-BY 4.0 · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d13",
    "lossy-artifact",
    2,
    "a",
    "F. Chopin — Musopen Complete Chopin project (performer per item page — record exact name for TASL)",
    "CC0 (machine-readable licenseurl on item, verified 2026-07-12)",
    "“Mazurka in A minor, Op. 68 No. 2 (backup)” — F. Chopin — Musopen Complete Chopin project (performer per item page — record exact name for TASL) · https://archive.org/details/musopen-chopin-complete-works-flac · CC0 (machine-readable licenseurl on item, verified 2026-07-12) · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d14",
    "pitch-drift",
    3,
    "a",
    "L. van Beethoven — Musopen Kickstarter ensemble (per item page)",
    "Public Domain (Musopen Kickstarter PD release; PD-mark licenseurl on item)",
    "“String Quartet Op. 18 No. 6 — IV. La Malinconia (Adagio)” — L. van Beethoven — Musopen Kickstarter ensemble (per item page) · https://archive.org/details/MusopenCollectionAsFlac · Public Domain (Musopen Kickstarter PD release; PD-mark licenseurl on item) · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d15",
    "lossy-artifact",
    4,
    "a",
    "J.S. Bach — Kimiko Ishizaka",
    "CC0",
    "“Goldberg Variations — Variatio 13 a 2 Clav.” — J.S. Bach — Kimiko Ishizaka · https://archive.org/details/The_Open_Goldberg_Variations-11823 · CC0 · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d16",
    "pitch-drift",
    4,
    "b",
    "Komiku",
    "CC0",
    "“The road we use to travel when we were kids (Tale on the Late)” — Komiku · https://archive.org/details/Komiku-TaleOnTheLate · CC0 · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d17",
    "timing-smear",
    1,
    "b",
    "J.S. Bach — Kimiko Ishizaka",
    "CC0 (VERIFIED 2026-07-11 on archive.org item)",
    "“WTC Book 1 — Prelude No. 12 in F minor, BWV 857” — J.S. Bach — Kimiko Ishizaka · https://archive.org/details/bach-well-tempered-clavier-book-1 · CC0 (VERIFIED 2026-07-11 on archive.org item) · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d18",
    "lossy-artifact",
    1,
    "b",
    "F. Chopin — Musopen Complete Chopin project (performer per item page — record exact name for TASL)",
    "CC0 (machine-readable licenseurl on item, verified 2026-07-12)",
    "“Mazurka in A minor, Op. 68 No. 2 (backup)” — F. Chopin — Musopen Complete Chopin project (performer per item page — record exact name for TASL) · https://archive.org/details/musopen-chopin-complete-works-flac · CC0 (machine-readable licenseurl on item, verified 2026-07-12) · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d19",
    "timing-smear",
    3,
    "b",
    "Jason Shaw",
    "CC-BY 4.0",
    "“Folk Bed” — Jason Shaw · https://audionautix.com/free-music/acoustic · CC-BY 4.0 · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d20",
    "lossy-artifact",
    2,
    "a",
    "Komiku",
    "CC0",
    "“The Wind (Tale on the Late)” — Komiku · https://archive.org/details/Komiku-TaleOnTheLate · CC0 · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d21",
    "timing-smear",
    2,
    "a",
    "F. Chopin — Musopen Complete Chopin project (performer per item page — record exact name for TASL)",
    "CC0 (machine-readable licenseurl on item, verified 2026-07-12)",
    "“Mazurka in A minor, Op. 59 No. 1” — F. Chopin — Musopen Complete Chopin project (performer per item page — record exact name for TASL) · https://archive.org/details/musopen-chopin-complete-works-flac · CC0 (machine-readable licenseurl on item, verified 2026-07-12) · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d22",
    "lossy-artifact",
    3,
    "b",
    "J.S. Bach — Kimiko Ishizaka",
    "CC0",
    "“Goldberg Variations — Variatio 13 a 2 Clav.” — J.S. Bach — Kimiko Ishizaka · https://archive.org/details/The_Open_Goldberg_Variations-11823 · CC0 · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d23",
    "timing-smear",
    4,
    "a",
    "J.S. Bach — Kimiko Ishizaka",
    "CC0",
    "“WTC Book 1 — Prelude No. 4 in C-sharp minor, BWV 849 (backup)” — J.S. Bach — Kimiko Ishizaka · https://archive.org/details/bach-well-tempered-clavier-book-1 · CC0 · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d24",
    "lossy-artifact",
    4,
    "a",
    "F. Chopin — Musopen Complete Chopin project (performer per item page — record exact name from snapshot for TASL)",
    "PD or CC0 (verify on piece page; CC-BY-SA -> engineer flag)",
    "“Nocturne Op. 15 No. 3 in G minor” — F. Chopin — Musopen Complete Chopin project (performer per item page — record exact name from snapshot for TASL) · https://archive.org/details/musopen-chopin-complete-works-flac · PD or CC0 (verify on piece page; CC-BY-SA -> engineer flag) · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
];
