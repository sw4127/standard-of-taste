/**
 * STORED ANSWERS -> AN ARC READING (E14/S5, Track H).
 *
 * The counterpart to `arc.ts`, which is a pure function of the sessions it is
 * handed and deliberately touches no storage. This is the module that goes to
 * the store, and it is the FIRST thing outside `result-store.ts` to call
 * `readHistory` — which is exactly what `published-text.test.ts` watches for.
 * That guard holds `docs/index.html`'s "Retest arc" row to `planned` until
 * something reads the history, and this slice is the moment it must flip. The
 * suite will insist; do not route around it.
 *
 * SAME SHAPE AND SAME REASONS AS `result-recall.ts`, one question further on.
 * That module answers "what did this person score last time"; this one answers
 * "did it move". Both recompute from raw answers through the same engines the
 * share pages use, so a recalled session and a shared link cannot describe the
 * same answers differently.
 *
 * EVERY RECOMPUTE CAN FAIL, AND A FAILURE IS DROPPED, NOT THROWN. A stored
 * payload can be well-formed JSON and still be undecodable — a truncated
 * answer string, a ladder that no longer exists, a hand edit. `result-recall`
 * treats those as "no result" rather than as an error, and so does this: an arc
 * is an addition to a result screen and must never take one down.
 *
 * DROPPING IS NOT THE SAME AS IGNORING, though. A dropped session does not
 * leave a hole in the middle of a comparison — `arc.ts` reads the last two of
 * whatever it is handed, so a corrupt session between two good ones means the
 * two good ones are compared, which is the honest answer and not a silent
 * splice of unrelated sittings. What is lost is only that the corrupt sitting
 * is not the one on screen.
 */
import { readHistory, type StoredEntry } from "./result-store";
import { POOL_VERSIONS } from "./result-recall";
import { replaySession } from "@/engine/staircase-replay";
import { computeBiasResult } from "@/engine/bias";
import { BIAS_CLIPS, BIAS_INSTRUMENT_ID } from "@/content/bias/items";
import { decodeBiasRatings } from "@/engine/bias";
import {
  biasArc,
  delicacyArc,
  thresholdArc,
  type ArcReading,
  type BiasArcEntry,
  type ThresholdArcEntry,
} from "@/engine/arc";
import type { Claim } from "@/engine/evidence";
import { familyForSlug } from "@/app/threshold/families";

/**
 * How many stored sittings an arc reads.
 *
 * Two is all `arc.ts` compares today. The cap exists anyway because replaying a
 * staircase session is real work — a grid posterior per sitting — and a slot
 * holds up to twenty-four. Taking the tail rather than the head keeps this a
 * question about the RECENT past, which is the only kind an arc may ask.
 */
const READ_BACK = 4;

function recent(entries: StoredEntry[]): StoredEntry[] {
  return entries.slice(Math.max(0, entries.length - READ_BACK));
}

export function recallThresholdArc(slug: string): Claim<ArcReading> {
  const family = familyForSlug(slug);
  if (!family) return thresholdArc([]);
  const entries: ThresholdArcEntry[] = [];
  for (const e of recent(readHistory("threshold", POOL_VERSIONS.threshold, slug))) {
    if (e.payload.kind !== "threshold") continue;
    // The key and the payload must agree, for the reason `result-recall` gives:
    // timing answers in the pitch slot would be replayed under a pitch heading.
    if (e.payload.slug !== slug) continue;
    try {
      entries.push({
        at: e.savedAt,
        session: replaySession(family, e.payload.seed, e.payload.answers, e.payload.sourceId),
      });
    } catch {
      /* undecodable sitting — dropped, never fatal */
    }
  }
  return thresholdArc(entries);
}

export function recallBiasArc(): Claim<ArcReading> {
  const entries: BiasArcEntry[] = [];
  for (const e of recent(readHistory("bias", POOL_VERSIONS.bias))) {
    if (e.payload.kind !== "bias") continue;
    try {
      const blind = decodeBiasRatings(BIAS_CLIPS, e.payload.blind);
      const labeled = decodeBiasRatings(BIAS_CLIPS, e.payload.labeled);
      if (!blind || !labeled) continue;
      entries.push({
        at: e.savedAt,
        result: computeBiasResult(BIAS_INSTRUMENT_ID, BIAS_CLIPS, blind, labeled),
      });
    } catch {
      /* undecodable sitting — dropped, never fatal */
    }
  }
  return biasArc(entries);
}

/**
 * The delicacy trials, which refuse (PM ruling RT-H2b a).
 *
 * Routed through here rather than short-circuited at the surface so that the
 * refusal comes from the same place every other answer does. A surface that
 * knew delicacy was unsupported would be a second copy of the ruling.
 */
export function recallDelicacyArc(): Claim<ArcReading> {
  return delicacyArc();
}
