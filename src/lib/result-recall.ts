/**
 * STORED ANSWERS -> ENGINE RESULTS (E8/S7, 2026-08-27).
 *
 * The counterpart to `result-store.ts`. That module holds raw payloads and
 * knows nothing about instruments; this one recomputes them through the same
 * engines and the same pools the share pages use, so a recalled session and a
 * shared link cannot describe the same answers differently.
 *
 * SEPARATE FILE ON PURPOSE. `result-store.ts` must stay importable from
 * anywhere — it touches only `localStorage` and JSON. This module pulls in
 * three item pools and the staircase replay machinery, and a component that
 * only wants to WRITE a payload should not drag all of that with it.
 *
 * EVERY RECOMPUTE CAN FAIL, AND FAILURE IS NULL. A payload can be well-formed
 * JSON and still be undecodable: a truncated CSV, a slug whose ladder no longer
 * exists, an answer string longer than the replay cap. The share routes treat
 * all of those as "no result" rather than as an error, and so does this — a
 * combined view is a convenience, and it must never take down a result screen
 * because of something in localStorage.
 */
import {
  BIAS_CLIPS,
  BIAS_INSTRUMENT_ID,
  BIAS_POOL_VERSION,
} from "@/content/bias/items";
import { computeBiasResult, decodeBiasRatings, type BiasResult } from "@/engine/bias";
import {
  DELICACY_INSTRUMENT_ID,
  DELICACY_POOL_VERSION,
  MEASURED_TRIALS,
} from "@/content/delicacy/items";
import { computeDelicacyResult, decodeDelicacyResponses, type DelicacyResult } from "@/engine/delicacy";
import { replaySession } from "@/engine/staircase-replay";
import { STAIRCASE_POOL_VERSION } from "@/engine/staircase-manifest";
import { sessionResult, type StaircaseResult } from "@/engine/staircase-session";
import { familyForSlug } from "@/app/threshold/families";
import { readResult, type StoredEntry } from "./result-store";

/** The pool version each instrument's stored answers must match. */
export const POOL_VERSIONS = {
  bias: BIAS_POOL_VERSION,
  delicacy: DELICACY_POOL_VERSION,
  /**
   * STRICTER THAN THE SHARE URL, ON PURPOSE. A threshold link carries only
   * (family, seed, answers) and replays them against whatever ladder the code
   * currently defines — so a re-rendered clip pool silently rescores an old
   * link. That hazard is inherent to a stateless URL somebody else is holding.
   * It is NOT inherent here: a locally stored session can carry the pool
   * version it was answered against, and drop itself when the pool moves. `0`
   * was the first draft and it was the lazy answer.
   *
   * It does not cover everything. The LADDER lives in `axisFor`, not in the
   * manifest, so a code change to the rungs still invalidates old answers
   * without moving this number. Recorded as a known limit rather than papered
   * over — this catches re-rendered clips, which is the change that actually
   * happens.
   */
  threshold: STAIRCASE_POOL_VERSION,
} as const;

export function recallBias(): { result: BiasResult; entry: StoredEntry } | null {
  const entry = readResult("bias", POOL_VERSIONS.bias);
  if (!entry || entry.payload.kind !== "bias") return null;
  try {
    const blind = decodeBiasRatings(BIAS_CLIPS, entry.payload.blind);
    const labeled = decodeBiasRatings(BIAS_CLIPS, entry.payload.labeled);
    if (!blind || !labeled) return null;
    return { result: computeBiasResult(BIAS_INSTRUMENT_ID, BIAS_CLIPS, blind, labeled), entry };
  } catch {
    return null;
  }
}

export function recallDelicacy(): { result: DelicacyResult; entry: StoredEntry } | null {
  const entry = readResult("delicacy", POOL_VERSIONS.delicacy);
  if (!entry || entry.payload.kind !== "delicacy") return null;
  try {
    const responses = decodeDelicacyResponses(MEASURED_TRIALS, entry.payload.picks);
    if (!responses) return null;
    return {
      result: computeDelicacyResult(DELICACY_INSTRUMENT_ID, MEASURED_TRIALS, responses),
      entry,
    };
  } catch {
    return null;
  }
}

export function recallThreshold(slug: string): { result: StaircaseResult; entry: StoredEntry } | null {
  const entry = readResult("threshold", POOL_VERSIONS.threshold, slug);
  if (!entry || entry.payload.kind !== "threshold") return null;
  /*
   * THE KEY AND THE PAYLOAD MUST AGREE. The slot is addressed by slug, and the
   * payload names its own slug; if a hand-edited entry puts timing answers in
   * the pitch slot, replaying them would report a timing threshold under a
   * pitch heading. Cheap to check, and the failure it prevents is a result
   * labelled as the wrong instrument.
   */
  if (entry.payload.slug !== slug) return null;
  const family = familyForSlug(entry.payload.slug);
  if (!family) return null;
  try {
    const session = replaySession(family, entry.payload.seed, entry.payload.answers, entry.payload.sourceId);
    return { result: sessionResult(session), entry };
  } catch {
    return null;
  }
}
