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
import { SPREAD_POOL_VERSION } from "@/content/spread/ranking";
import {
  computeSpreadResult,
  decodeSpreadRatings,
  decodeSpreadRecognised,
  type SpreadResult,
} from "@/engine/spread";
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
  /**
   * The Ranking Test's pool version, which the pool's own docblock already
   * required to ride on every stored response — it was written that way in E17
   * against a store the instrument was not yet allowed to use.
   */
  spread: SPREAD_POOL_VERSION,
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

/**
 * BOTH STRINGS MUST DECODE, AND A HALF-DECODED SITTING IS NO SITTING (E18/S2).
 *
 * `computeSpreadResult` THROWS on a missing or out-of-range rating, by design —
 * a bad rating reaching the engine is a bug upstream, not a user error. That
 * contract is right for a live flow and wrong for a value read out of
 * localStorage, where a truncated string is an ordinary thing to find. So the
 * decoders reject first and the recompute is wrapped, and every failure is the
 * same null the other three recalls return: no result, never an error thrown at
 * a result screen over something in storage.
 *
 * The recognition mask is decoded to ids and passed back through the same
 * filter the sitting used, so a recalled reading and the reveal that produced
 * it cannot disagree about which clips counted.
 *
 * A NOTE FOR WHOEVER BUILDS AN ARC OVER THIS SLOT: DO NOT. The store keeps a
 * history for every instrument, and the retest arc exists because a staircase
 * sitting a week later measures the same ear again. This instrument is not like
 * that. It only works on music that is NEW to the listener, so a second sitting
 * is contaminated permanently rather than for seven days — there is no waiting
 * period that restores it, which is also why a cooldown would be the wrong tool
 * and none is applied. Comparing two Ranking Test sittings would report a
 * movement in the ear that is a movement in familiarity. `readResult` — the
 * latest, which is what the panel asks for — is the only sound read here.
 */
export function recallSpread(): { result: SpreadResult; entry: StoredEntry } | null {
  const entry = readResult("spread", POOL_VERSIONS.spread);
  if (!entry || entry.payload.kind !== "spread") return null;
  try {
    const ratings = decodeSpreadRatings(entry.payload.ratings);
    const recognised = decodeSpreadRecognised(entry.payload.recognised);
    if (!ratings || !recognised) return null;
    return { result: computeSpreadResult(ratings, recognised), entry };
  } catch {
    return null;
  }
}
