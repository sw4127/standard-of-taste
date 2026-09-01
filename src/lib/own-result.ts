/**
 * IS THE RESULT ON SCREEN THE ONE THIS DEVICE RECORDED? (E14/S5.)
 *
 * MOVED HERE FROM `AcrossSessions.tsx`, WHICH IS WHERE IT WAS DISCOVERED. All
 * three result routes are SHARE TARGETS: `/bias/result`, `/delicacy/result` and
 * `/threshold/[slug]/result` recompute from a payload in the URL, and that
 * payload belongs to whoever posted the link. Without this check a personal
 * panel puts the VIEWER's stored sessions under the SHARER's number — and on
 * the threshold screen E8/S8 rendered the contradiction in plain sight: a wide
 * band reading "no reading · somewhere between 8.8 and 100 cents" at the top,
 * and "Pitch drift: caught at 3.1 cents" underneath. Same family, two numbers,
 * no explanation, because they were two different people's sessions.
 *
 * It is shared rather than copied because E14/S5 added a SECOND panel with the
 * same obligation, and a second copy of a rule this subtle is how one of them
 * ends up subtly wrong with nothing to notice — the two-tables defect this repo
 * has now paid for at the rung table, the window plan and the damage field.
 *
 * THE COMPARISON IS ON THE RAW PAYLOAD — the same bytes the store holds and the
 * URL carries — so it cannot be fooled by a recomputation that happens to
 * agree.
 */
import { readResult, type StoredPayload } from "./result-store";
import { POOL_VERSIONS } from "./result-recall";

export function isOwnResult(own: StoredPayload): boolean {
  const stored =
    own.kind === "bias"
      ? readResult("bias", POOL_VERSIONS.bias)
      : own.kind === "delicacy"
        ? readResult("delicacy", POOL_VERSIONS.delicacy)
        : readResult("threshold", POOL_VERSIONS.threshold, own.slug);
  if (!stored) return false;
  return JSON.stringify(stored.payload) === JSON.stringify(own);
}
