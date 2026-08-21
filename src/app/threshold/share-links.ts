/**
 * ONE DEFINITION OF THE THRESHOLD SHARE PAYLOAD (E6/S17, PM ruling RT-118a a).
 *
 * WHY THIS FILE EXISTS, AND IT IS NOT A FLATTERING REASON. E6/S12 through S14
 * were a sweep for exactly one defect: a fact written down in two places that
 * agreed on the day they were written. It found the card's hardcoded "calls 3",
 * two surfaces disagreeing about whether a coin calls 7.5 or 8, a launch kit a
 * minute out of step with the site, and 1.96 typed out three times beside the
 * words "95% confidence".
 *
 * Then S16 built the share link twice — once in `ThresholdResult` for the card
 * and permalink, once in `generateMetadata` for the unfurl — in the slice
 * immediately after. Both were correct. So was every instance the sweep found,
 * on the day it was written.
 *
 * THE FORMAT IS LOAD-BEARING. `?s=<seed>&r=<0s and 1s>&src=<recording>` is what
 * makes a shared threshold unforgeable: the receiving page recomputes from the
 * responses rather than trusting a number. Two builders that drift means a card
 * and the page it sits on could describe different sessions, which is the one
 * thing this design exists to prevent.
 */

export interface ThresholdShare {
  slug: string;
  seed: number;
  /** The answers, in order, as "1" for correct and "0" for wrong. */
  answers: string;
  /** Lossy only: a threshold there is a fact about the material too. */
  sourceId?: string;
}

export type CardFormat = "story" | "square" | "og";

/** The payload, exactly once. Every URL below is built from this. */
export function thresholdShareQuery(share: ThresholdShare): string {
  const q = new URLSearchParams({ s: String(share.seed), r: share.answers });
  if (share.sourceId) q.set("src", share.sourceId);
  return q.toString();
}

/** The page a shared link opens. Recomputes the threshold from the answers. */
export function thresholdResultPath(share: ThresholdShare): string {
  return `/threshold/${share.slug}/result?${thresholdShareQuery(share)}`;
}

/** The card image for that same session, in one of three crops. */
export function thresholdCardPath(format: CardFormat, share: ThresholdShare): string {
  return `/api/threshold-card?format=${format}&slug=${share.slug}&${thresholdShareQuery(share)}`;
}
