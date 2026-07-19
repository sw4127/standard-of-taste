/**
 * Delicacy Trials item pool — DEV PLACEHOLDER POOL (pool version 0).
 *
 * These six pairs are the S1 toolchain PROOF artifacts: every pair is the
 * same 20-second window of the same recording (b2, Chopin Mazurka Op. 68
 * No. 2 — CC0) under different degradations. That is deliberate for flow
 * development and USELESS as an instrument (a real session must vary the
 * material). The pool of record is authored at S6 behind the gatekeeping
 * tests + the PM ear pass, and bumps DELICACY_POOL_VERSION to 1.
 *
 * The proof audio is git-ignored (reproducible via scripts/clip-pipeline
 * degrade, same seeds/params in src/content/delicacy/manifest.json), so this
 * pool only plays on a machine that has run the S1 sweep. In production the
 * clips 404 and ClipPlayer's load-failure state keeps the flow locked —
 * /delicacy stays unlinked and noindex until the real pool ships.
 *
 * DO NOT reorder/edit without bumping DELICACY_POOL_VERSION: share payloads
 * are positional (see the versioning contract in src/engine/delicacy.ts).
 */

import type { DegradationFamily, DelicacyItemSpec } from "@/engine/delicacy";

export const DELICACY_INSTRUMENT_ID = "delicacy-v1";

/** 0 = dev placeholder pool. The S6 pool of record starts at 1. */
export const DELICACY_POOL_VERSION = 0;

/**
 * THE DOOR (D3 → live per PM ruling 2026-07-19, decision 1a): every surface
 * that gates on the delicacy tier reads this one flag — homepage machine
 * card, bias-debrief door, /delicacy robots, sitemap. It flips exactly when
 * S6 ships the pool of record and bumps the version; until then the tier
 * stays visible-and-locked and the route stays unlinked + noindex.
 */
export const DELICACY_LIVE = DELICACY_POOL_VERSION > 0;

/** One playable trial pair. Extends the engine spec with presentation. */
export interface DelicacyTrialClip extends DelicacyItemSpec {
  /** Static files under /public — PD/CC audio only (memo §8.2). */
  srcA: string;
  srcB: string;
  /** Truthful credit for the source work (revealed at S5b, N3). */
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

const B2_CREDIT = "F. Chopin — Mazurka in A minor, Op. 68 No. 2 (Musopen Complete Chopin project)";
const B2_ATTR =
  "“Mazurka in A minor, Op. 68 No. 2” — F. Chopin, perf. Musopen Complete Chopin project · archive.org/details/musopen-chopin-complete-works-flac · CC0 · excerpt (trimmed + loudness-normalized; one side deliberately degraded)";

const pair = (
  id: string,
  family: DegradationFamily,
  magnitude: 1 | 2 | 3,
  originalSide: "a" | "b",
): DelicacyTrialClip => ({
  id,
  family,
  magnitude,
  originalSide,
  srcA: `/audio/delicacy/${id}-a.mp3`,
  srcB: `/audio/delicacy/${id}-b.mp3`,
  sourceCredit: B2_CREDIT,
  license: "CC0",
  attribution: B2_ATTR,
});

/**
 * Presentation order (positional — see header). Families interleaved, no two
 * adjacent trials share one; magnitudes 2× each. originalSide comes from the
 * S1 manifest (seeded) and is imbalanced here (4 a / 2 b) — acceptable for a
 * dev pool, and a named S6 gatekeeping requirement for the pool of record.
 */
export const DELICACY_TRIALS: DelicacyTrialClip[] = [
  pair("proof-pd1", "pitch-drift", 1, "a"),
  pair("proof-ts2", "timing-smear", 2, "a"),
  pair("proof-la3", "lossy-artifact", 3, "b"),
  pair("proof-pd3", "pitch-drift", 3, "b"),
  pair("proof-ts1", "timing-smear", 1, "a"),
  pair("proof-la2", "lossy-artifact", 2, "a"),
];
