/**
 * WHICH RECORDING A RETEST RUNS ON (E14/S4, Track H, PM ruling RT-H4 a).
 *
 * THE PROBLEM, MEASURED. The Compression machine locks each session to one
 * recording, and `pickSourceForSeed` chooses it from the session seed — which
 * `ThresholdFlow.newSeed()` takes from the clock. Two sittings a week apart
 * therefore land on the same music by coin flip: measured at 49% in
 * `arc.test.ts`. The other 51% cannot be compared at all, because a fixed
 * bitrate does up to 1.999x different damage across recordings (RT-85a), so the
 * difference between two sittings on different material is a fact about the
 * music. The retest arc had to refuse them, which made a third of the gym's
 * ladders unable to do the thing Track H exists for.
 *
 * THE FIX IS TO REMEMBER, NOT TO RANDOMISE BETTER. The recording this browser
 * was last measured on is already stored — it rides in the session payload,
 * because a kbps threshold is a fact about the material and the share link has
 * always had to carry it. So there is NO NEW KEY and no second source of truth:
 * this reads the same slot the result screen reads.
 *
 * That is not merely tidy. It means "forget this browser" un-pins the recording
 * for free, with nothing extra to remember to clear — the failure E13/S2 caught
 * in the cooldown, where a sweep of one key left somebody refused a retest
 * forever with the session behind the refusal deleted.
 *
 * IT FALLS BACK RATHER THAN THROWING. `startSession` refuses a retired source
 * outright (RT-92a took pb6 out of the pool because its ladder cannot be
 * measured honestly in a tolerable session). A browser holding a session
 * recorded against a since-retired recording would otherwise hand that id
 * straight back and break the machine for that person permanently. Eligibility
 * is checked against the shipping pool, not against the stored value.
 *
 * IT IS NOT AN ARC SURFACE, and deliberately reads `readResult` rather than
 * `readHistory`: this decides which clips to play, and shows nobody a past
 * result. The roadmap guard keyed on `readHistory` stays honest until a surface
 * actually displays an arc.
 */
import { readResult } from "./result-store";
import { POOL_VERSIONS } from "./result-recall";
import { eligibleSources, isSourceLocked } from "@/engine/staircase-pool";
import { pickSourceForSeed } from "@/engine/staircase-session";
import { SLUG_BY_FAMILY } from "@/app/threshold/families";

/**
 * The recording this device was last measured on for `family`, or `undefined`.
 *
 * `undefined` for every family that is not source-locked — pitch and timing
 * have no material to pin, because a cent is a cent whatever it is played on.
 */
export function pinnedMaterial(family: string): string | undefined {
  if (!isSourceLocked(family)) return undefined;
  const slug = SLUG_BY_FAMILY[family];
  if (!slug) return undefined;
  const last = readResult("threshold", POOL_VERSIONS.threshold, slug);
  if (!last || last.payload.kind !== "threshold") return undefined;
  const sourceId = last.payload.sourceId;
  if (!sourceId) return undefined;
  // The shipping pool is the authority, not the stored value.
  return eligibleSources(family).includes(sourceId) ? sourceId : undefined;
}

/**
 * The recording to start a session on: the one this browser used before, or a
 * fresh pick from the seed.
 *
 * ONE ENTRY POINT, so the flow never has to decide. A surface choosing between
 * "the pinned one" and "a new one" is the two-tables defect waiting to happen —
 * the second caller would get the choice subtly wrong and nothing would notice,
 * because both answers are valid recording ids.
 */
export function materialForSession(family: string, seed: number): string | undefined {
  return pinnedMaterial(family) ?? pickSourceForSeed(family, seed);
}
