/**
 * Delicacy pool gatekeeping (S6, memo N3/D6) — the checks that make the pool
 * a CONTRACT rather than a vibe. Pure function so the test suite can prove
 * both directions: the real pool passes, and deliberately broken fixtures
 * fail with named errors. Mirrors the bias gatekeeping intent
 * (src/content/bias/bias.test.ts) with the delicacy-specific shape.
 *
 * Enforced here (pool shape):
 *  - exactly 6 trials, unique ids, audio under /audio/delicacy/
 *  - each degradation family exactly 2×, each magnitude exactly 2×
 *  - no two ADJACENT trials share a family (answer-pattern monotony) or a
 *    leading source artist (sound-world monotony)
 *  - original sides balanced (|a − b| ≤ 2; the authored pool hits 3/3)
 *  - six distinct source recordings (cross-trial familiarity control)
 * Enforced against the manifest (provenance):
 *  - every trial has a manifest pair whose family/magnitude/originalSide
 *    MATCH (items.ts can never drift from what was actually rendered)
 *  - machine validation all-PASS, files + sha256 recorded, params recorded
 *  - the source is a bias-manifest item with a license snapshot + proof URL
 *    + source sha256 (the licensing chain of record)
 * Enforced once the pool version is ≥ 1 (the door):
 *  - every pair carries a recorded PM ear pass with verdict PASS
 *    (docs/ear-pass-delicacy.md — audibility never ships on machine checks)
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
  earPass: { verdict: string } | null;
  validation: Record<string, { pass?: boolean } | string>;
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

  if (trials.length !== 6) err(`pool must be exactly 6 trials, got ${trials.length}`);
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
  for (const [f, n] of famCount) if (n !== 2) err(`family "${f}" appears ${n}× (contract: exactly 2)`);
  for (const [m, n] of magCount) if (n !== 2) err(`magnitude ${m} appears ${n}× (contract: exactly 2)`);

  for (let i = 1; i < trials.length; i++) {
    if (trials[i].family === trials[i - 1].family)
      err(`trials ${i}/${i + 1} share family "${trials[i].family}" adjacently`);
    if (leadArtist(trials[i].sourceCredit) === leadArtist(trials[i - 1].sourceCredit))
      err(`trials ${i}/${i + 1} share source artist "${leadArtist(trials[i].sourceCredit)}" adjacently`);
  }

  const a = trials.filter((t) => t.originalSide === "a").length;
  if (Math.abs(a - (trials.length - a)) > 2) err(`original sides unbalanced: ${a}a/${trials.length - a}b`);
  if (new Set(trials.map((t) => t.sourceCredit)).size !== trials.length)
    err("source recordings are not all distinct");

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
    if (poolVersion >= 1 && p.earPass?.verdict !== "PASS")
      err(`${t.id}: pool v${poolVersion} requires a recorded PM ear pass with verdict PASS (docs/ear-pass-delicacy.md)`);
  }

  return errors;
}
