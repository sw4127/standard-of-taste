/**
 * Delicacy Trials item pool — POOL-OF-RECORD CANDIDATES (still version 0).
 *
 * Six pairs from six distinct already-licensed sources (decision 4a: reuse
 * the bias manifest's cleared recordings, FRESH windows non-overlapping with
 * the bias excerpts so cross-instrument familiarity can't help detect the
 * degradation). Authored by `scripts/clip-pipeline degrade`; params, seeds,
 * validation reports and sha256s live in src/content/delicacy/manifest.json.
 *
 * GATES before DELICACY_POOL_VERSION bumps to 1 (the door flip — see
 * DELICACY_LIVE): (1) every pair's render validation passes — enforced by
 * delicacy.test.ts; (2) every pair carries a Layer A measurement with verdict
 * PASS (`node scripts/clip-pipeline/index.mjs validate`) — enforced by
 * gates.ts the moment the version is ≥1; (3) the PM voice pass on copy.ts
 * (PM ruling 2026-07-19: pending).
 *
 * THE PM EAR PASS IS RETIRED (artifact pivot §1, PM ruling RT-1a 2026-08-07).
 * Audibility is no longer gated by a human listener; the door turns on
 * measured manipulation magnitude against a known-transparent anchor, and item
 * DIFFICULTY stays explicitly uncalibrated until Layer B has real responses.
 *
 * VERSIONING (amends the S5a note): v≥1 pools are IMMUTABLE per version —
 * any item change bumps the version, and share payloads are positional
 * against it (contract in src/engine/delicacy.ts). v0 is the explicit dev
 * exception: mutable, and its share surface never exists in production
 * (SHARE_OPEN gate), so no live URL can silently rescore.
 */

import type { DegradationFamily, DelicacyItemSpec } from "@/engine/delicacy";

export const DELICACY_INSTRUMENT_ID = "delicacy-v1";

/** 0 = pre-ear-pass. The pool of record ships as 1. */
export const DELICACY_POOL_VERSION = 0;

/**
 * THE DOOR (D3 → live per PM ruling 2026-07-19, decision 1a): every surface
 * that gates on the delicacy tier reads this one flag — homepage machine
 * card, bias-debrief door, /delicacy robots, sitemap, prod share surface.
 * It flips exactly when the gates above clear and the version bumps.
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
  magnitude: 1 | 2 | 3,
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

const MANIP = "excerpt (trimmed + loudness-normalized; one side deliberately degraded)";

/**
 * Presentation order (positional — see versioning above). Contracts enforced
 * by delicacy.test.ts: families 2× each and never adjacent, magnitudes 2×
 * each, original sides balanced 3/3, no two adjacent pairs share a source
 * sound-world, six distinct source recordings.
 */
export const DELICACY_TRIALS: DelicacyTrialClip[] = [
  pair(
    "d1",
    "pitch-drift",
    1,
    "a",
    "J.S. Bach — Kimiko Ishizaka, piano (Open Goldberg Variations)",
    "CC0",
    `“Goldberg Variations — Variatio 13 a 2 Clav.” — J.S. Bach, perf. Kimiko Ishizaka · archive.org/details/The_Open_Goldberg_Variations-11823 · CC0 · ${MANIP}`,
  ),
  pair(
    "d2",
    "lossy-artifact",
    1,
    "b",
    "Komiku — The road we use to travel when we were kids",
    "CC0",
    `“The road we use to travel when we were kids” (Tale on the Late) — Komiku · archive.org/details/Komiku-TaleOnTheLate · CC0 · ${MANIP}`,
  ),
  pair(
    "d3",
    "timing-smear",
    2,
    "a",
    "Jason Shaw (Audionautix) — Folk Bed",
    "CC-BY 4.0",
    `“Folk Bed” — music by audionautix.com (Jason Shaw) · audionautix.com/creative-commons-music · CC-BY 4.0 · ${MANIP}`,
  ),
  pair(
    "d4",
    "pitch-drift",
    3,
    "b",
    "Chris Zabriskie — That Hopeful Future Is All I've Ever Known",
    "CC-BY 4.0",
    `“That Hopeful Future Is All I've Ever Known” (Music from Neptune Flux) — Chris Zabriskie · CC-BY 4.0 (teamopen.cc/chris) · ${MANIP}`,
  ),
  pair(
    "d5",
    "lossy-artifact",
    2,
    "b",
    "F. Chopin — Nocturne Op. 15 No. 3 (Musopen Complete Chopin project)",
    "CC0",
    `“Nocturne Op. 15 No. 3 in G minor” — F. Chopin, perf. Musopen Complete Chopin project · archive.org/details/musopen-chopin-complete-works-flac · CC0 · ${MANIP}`,
  ),
  pair(
    "d6",
    "timing-smear",
    3,
    "a",
    "Komiku — The Wind",
    "CC0",
    `“The Wind” (Tale on the Late) — Komiku · archive.org/details/Komiku-TaleOnTheLate · CC0 · ${MANIP}`,
  ),
];
