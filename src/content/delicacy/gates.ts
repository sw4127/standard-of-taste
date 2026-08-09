/**
 * Delicacy pool gatekeeping (S6, memo N3/D6) — the checks that make the pool
 * a CONTRACT rather than a vibe. Pure function so the test suite can prove
 * both directions: the real pool passes, and deliberately broken fixtures
 * fail with named errors. Mirrors the bias gatekeeping intent
 * (src/content/bias/bias.test.ts) with the delicacy-specific shape.
 *
 * Enforced here (pool shape) — the 24-trial CROSSED FACTORIAL (RT-24a):
 *  - exactly 24 trials, unique ids, audio under /audio/delicacy/
 *  - 3 degradation families × 8, 4 ladder rungs × 6
 *  - every family×rung cell exactly 2×, and its two replicates on DIFFERENT
 *    lead artists — otherwise a family-by-rung effect is confounded with one
 *    piece of music, which is the confound that made the S5b cross-source
 *    comparison worthless
 *  - no two ADJACENT trials share a family (answer-pattern monotony)
 *  - original sides roughly balanced (|a − b| ≤ 4 over 24 trials)
 *  - at least 6 distinct source recordings, and no single ARTIST carrying more
 *    than a third of the pool (cross-trial familiarity control). A third, not a
 *    quarter: the licensed catalogue is 11 recordings across 6 artists, three
 *    of them Bach and three Chopin, so a quarter-cap is arithmetically
 *    impossible at 24 trials. The bound is what the catalogue supports, and it
 *    is stated rather than quietly loosened until the pool fits.
 * Enforced against the manifest (provenance):
 *  - every trial has a manifest pair whose family/magnitude/originalSide
 *    MATCH (items.ts can never drift from what was actually rendered)
 *  - machine validation all-PASS, files + sha256 recorded, params recorded
 *  - the source is a bias-manifest item with a license snapshot + proof URL
 *    + source sha256 (the licensing chain of record)
 * Enforced once the pool version is ≥ 1 (the door):
 *  - every pair carries a recorded Layer A measurement with verdict PASS
 *    (artifact pivot §1; PM ruling RT-1a 2026-08-07)
 *
 * THE PM EAR PASS IS RETIRED (artifact pivot §1, 2026-08-07). It used to gate
 * this door: no pair shipped without a human confirming the degradation was
 * audible. It is gone because ear-passes by a non-musician produced unstable
 * labels — the PM's own finding — and an unstable gate is worse than a
 * measured one. Item quality is now a computed verdict:
 *
 *   Layer A (here): the manipulation is objectively large — measured against a
 *     320 kbps round-trip of the item's own source, which is a manipulation
 *     that is real, measurable, and inaudible. Plus clipping and dead-air
 *     checks. This is what gates SHIPPING.
 *   Layer B (src/analytics/estimate.ts gradeItems): difficulty and
 *     discrimination estimated from real responses, auto-flagging items to
 *     retire or move a rung. This gates RETENTION, and is silent at n = 0.
 *
 * What Layer A does NOT establish is audibility — no measure here models
 * perception. The honest claim is "this manipulation is N times the magnitude
 * of one nobody can hear", and difficulty stays UNCALIBRATED until Layer B has
 * responses (PM ruling RT-1a: the door flips on Layer A alone, with difficulty
 * labelled uncalibrated).
 */

import type { DelicacyTrialClip } from "./items";

interface ManifestPair {
  id: string;
  sourceId: string;
  family: string;
  magnitude: number;
  originalSide: string;
  params?: Record<string, unknown>;
  files: Record<string, string> | null;
  sha256: Record<string, string> | null;
  /** RETIRED 2026-08-07 — kept in the type so old manifests still parse. */
  earPass?: { verdict: string } | null;
  validation: Record<string, { pass?: boolean } | string>;
  layerA?: { verdict?: string; anchorRatio?: number; reasons?: string[] } | null;
}
interface DelicacyManifest {
  pairs: ManifestPair[];
}
interface BiasManifestItem {
  id: string;
  source?: { sha256?: string };
  license?: { proofPageUrl?: string; snapshotFile?: string };
}

const leadArtist = (credit: string) => credit.split(" — ")[0].trim();

export function checkDelicacyPool(
  trials: DelicacyTrialClip[],
  manifest: DelicacyManifest,
  biasItems: BiasManifestItem[],
  poolVersion: number,
): string[] {
  const errors: string[] = [];
  const err = (msg: string) => errors.push(msg);

  const EXPECTED = 24;
  if (trials.length !== EXPECTED) err(`pool must be exactly ${EXPECTED} trials, got ${trials.length}`);
  if (new Set(trials.map((t) => t.id)).size !== trials.length) err("duplicate trial ids");

  const famCount = new Map<string, number>();
  const magCount = new Map<number, number>();
  for (const t of trials) {
    famCount.set(t.family, (famCount.get(t.family) ?? 0) + 1);
    magCount.set(t.magnitude, (magCount.get(t.magnitude) ?? 0) + 1);
    if (!t.srcA.startsWith("/audio/delicacy/") || !t.srcB.startsWith("/audio/delicacy/"))
      err(`${t.id}: audio must live under /audio/delicacy/`);
    if (!t.license || !t.attribution) err(`${t.id}: license/attribution missing (CC credit is a legal requirement)`);
  }
  const perFamily = EXPECTED / 3;
  const perRung = EXPECTED / 4;
  for (const [f, n] of famCount) if (n !== perFamily) err(`family "${f}" appears ${n}× (contract: exactly ${perFamily})`);
  for (const [m, n] of magCount) if (n !== perRung) err(`rung ${m} appears ${n}× (contract: exactly ${perRung})`);

  // The factorial itself: each cell twice, on different artists.
  const cells = new Map<string, DelicacyTrialClip[]>();
  for (const t of trials) {
    const k = `${t.family}/${t.magnitude}`;
    cells.set(k, [...(cells.get(k) ?? []), t]);
  }
  for (const [k, ts] of cells) {
    if (ts.length !== 2) err(`cell ${k} appears ${ts.length}× (contract: exactly 2)`);
    else if (leadArtist(ts[0].sourceCredit) === leadArtist(ts[1].sourceCredit))
      err(`cell ${k} is replicated on the SAME artist (${leadArtist(ts[0].sourceCredit)}) — the replicate cannot control for material`);
  }

  for (let i = 1; i < trials.length; i++) {
    if (trials[i].family === trials[i - 1].family)
      err(`trials ${i}/${i + 1} share family "${trials[i].family}" adjacently`);
  }

  const a = trials.filter((t) => t.originalSide === "a").length;
  if (Math.abs(a - (trials.length - a)) > 4) err(`original sides unbalanced: ${a}a/${trials.length - a}b`);

  // At 24 trials from a licensed catalogue of 11 recordings, "all distinct" is
  // impossible; what matters is that no one sound-world dominates.
  const credits = new Map<string, number>();
  const artists = new Map<string, number>();
  for (const t of trials) {
    credits.set(t.sourceCredit, (credits.get(t.sourceCredit) ?? 0) + 1);
    const a2 = leadArtist(t.sourceCredit);
    artists.set(a2, (artists.get(a2) ?? 0) + 1);
  }
  if (credits.size < 6) err(`only ${credits.size} distinct source recordings (contract: ≥ 6)`);
  const artistCap = Math.ceil(trials.length / 3);
  for (const [c, n] of artists)
    if (n > artistCap) err(`artist "${c}" carries ${n}/${trials.length} trials (contract: ≤ ${artistCap})`);

  for (const t of trials) {
    const p = manifest.pairs.find((x) => x.id === t.id);
    if (!p) {
      err(`${t.id}: no manifest pair (never rendered?)`);
      continue;
    }
    if (p.family !== t.family || p.magnitude !== t.magnitude || p.originalSide !== t.originalSide)
      err(`${t.id}: items.ts drifted from the manifest (family/magnitude/originalSide mismatch)`);
    if (!p.files || !p.sha256) err(`${t.id}: manifest files/sha256 missing (failed render must not ship)`);
    if (!p.params || Object.keys(p.params).length === 0) err(`${t.id}: degradation params not recorded`);
    for (const [name, v] of Object.entries(p.validation)) {
      if (typeof v === "object" && v !== null && v.pass === false) err(`${t.id}: validation "${name}" FAILED`);
    }
    const src = biasItems.find((b) => b.id === p.sourceId);
    if (!src) err(`${t.id}: source "${p.sourceId}" not in the bias manifest`);
    else {
      if (!src.license?.snapshotFile) err(`${t.id}: source "${p.sourceId}" has no license snapshot`);
      if (!src.license?.proofPageUrl) err(`${t.id}: source "${p.sourceId}" has no license proof URL`);
      if (!src.source?.sha256) err(`${t.id}: source "${p.sourceId}" has no source sha256`);
    }
    if (poolVersion >= 1) {
      // The door now turns on measurement, not on a listener.
      if (!p.layerA) {
        err(`${t.id}: pool v${poolVersion} requires a recorded Layer A measurement — run \`clip-pipeline validate\``);
      } else if (p.layerA.verdict !== "PASS") {
        err(`${t.id}: Layer A verdict is ${p.layerA.verdict}${p.layerA.reasons?.length ? ` (${p.layerA.reasons.join("; ")})` : ""}`);
      }
    }
  }

  return errors;
}
