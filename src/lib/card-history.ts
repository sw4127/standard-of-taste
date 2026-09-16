/**
 * EVERYTHING THIS DEVICE HAS MEASURED, FOR THE PROMPT CARD (E21/T-S4, Track T).
 *
 * THE CARD IS THE ONLY SURFACE THAT READS ACROSS LADDERS. Every other reading
 * in this product is about the sitting in front of you. The card is about an
 * EAR, and an ear is measured one family per sitting — so a person who has sat
 * pitch and timing has two axes, and the card is the one place those meet.
 *
 * DEVICE-LOCAL, LIKE EVERYTHING ELSE HERE. There is no account and no server;
 * this reads the same `localStorage` slots the result screens already recall
 * from, through the same `recallThreshold` they use, so a card can never
 * disagree with the threshold screen it sits above.
 *
 * ORDERED BY THE SLUG ROSTER, NOT BY WHEN A SITTING HAPPENED. The card's axes
 * would otherwise reshuffle when somebody retook one ladder, which reads as new
 * information and is not. `THRESHOLD_SLUGS` is the product's own order.
 *
 * ONLY WHAT WAS MEASURED (PM ruling RT-Z12 (a)). A slot with nothing in it
 * contributes nothing — no placeholder, no "not yet". The absence is silent,
 * because three axes with two blank is a completion meter and this product
 * published the refusal of that mechanic.
 */
import type { StaircaseResult } from "@/engine/staircase-session";
import { SLUG_BY_FAMILY, THRESHOLD_SLUGS } from "@/app/threshold/families";
import { recallThreshold } from "./result-recall";

/**
 * Every threshold sitting this device holds, newest per ladder.
 *
 * `current` is optional and takes precedence over the stored entry for its own
 * family: the result screen is showing a session that may not be in storage yet
 * (a permalink, or a flow mid-write), and the card above it must describe the
 * session on screen rather than a stale one from the same ladder.
 */
export function cardHistory(current?: StaircaseResult): StaircaseResult[] {
  const out: StaircaseResult[] = [];
  for (const slug of THRESHOLD_SLUGS) {
    const recalled = recallThreshold(slug)?.result ?? null;
    if (recalled && (!current || recalled.family !== current.family)) out.push(recalled);
  }
  if (current) {
    /*
     * INSERTED IN ROSTER POSITION rather than appended. Appending would put the
     * session you just finished last, under two older ones, on the screen that
     * exists to show it to you.
     */
    const at = out.findIndex((r) => rosterIndex(r) > rosterIndex(current));
    if (at === -1) out.push(current);
    else out.splice(at, 0, current);
  }
  return out;
}

/**
 * Position in the product's own roster, for stable ordering.
 *
 * KEYED ON FAMILY, NOT ON A SLUG FIELD. `StaircaseResult` carries the engine's
 * family id and no slug — the slug is a routing concern — and the first version
 * of this read `result.slug`, which is `undefined` on every result and put
 * every axis at the same index. TypeScript did not catch it because the field
 * simply is not there to be wrong about.
 */
function rosterIndex(result: StaircaseResult): number {
  const i = THRESHOLD_SLUGS.findIndex((s) => s === SLUG_BY_FAMILY[result.family]);
  return i === -1 ? THRESHOLD_SLUGS.length : i;
}
