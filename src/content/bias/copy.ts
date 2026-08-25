/**
 * Prestige-Bias verdict copy — shared by the flow, the share page, and the
 * card so the voice can never drift between surfaces. PM owns these words.
 *
 * VOICE-LOCKED FOR THE COHORT (2026-07-12): audited against
 * docs/voice-spec.md (the Examiner — tease the judgment, never the person;
 * every barb datum-anchored; intensity share > verdict/debrief > onboarding).
 * Contrarian line: PM ruled KEEP over the offered sharpen. Do not edit
 * cohort-visible strings here without a PM ruling; share-block copy may
 * iterate post-cohort (RT-4 scope).
 */
import type { BiasVerdict } from "@/engine/bias";

export const VERDICT_COPY: Record<BiasVerdict, { title: string; sub: string }> = {
  swayed: { title: "Label-driven.", sub: "When the names walked in, your standards left with them." },
  steady: { title: "Steady ears.", sub: "The reputations showed up. Your ratings barely looked up." },
  contrarian: { title: "Contrarian.", sub: "You heard the acclaim and docked points for it. Different bias — still a bias." },
};

/** The one-line share text next to the permalink. */
/**
 * E7/S6 — HOW A RESULT DESCRIBES ITSELF IN A TITLE AND AN ALT ATTRIBUTE.
 *
 * FOUND BY LOOKING AT THE RENDERED PAGE, which had never been done. The result
 * page's <title> was built inline as `${pct}% label-driven`, on every result,
 * whatever the verdict. But "Label-driven." IS the name of the SWAYED verdict
 * (see VERDICT_COPY above), so a steady session unfurled into Slack, iMessage
 * and Twitter as "+10% label-driven" while the page it linked to said "Steady
 * ears." — two verdicts for one session, on the most public surface we have.
 *
 * Worse at the other end: a contrarian result rendered as "-20% label-driven",
 * which states the opposite of what the person did. They resisted the label.
 *
 * The same string was also the card's `alt` text, so a screen reader announced
 * the wrong verdict too.
 *
 * The fix is to describe the MEASUREMENT rather than assert a verdict the
 * number may not carry — the page body already says "how far these ratings
 * moved toward the labels", and a signed percentage toward something reads
 * correctly in both directions. Verdict names stay where the verdict is
 * actually computed.
 */
export function resultTitleFragment(pct: number): string {
  return `${pct > 0 ? "+" : ""}${pct}% toward the labels`;
}

export function shareText(pct: number): string {
  return `My ratings moved ${pct > 0 ? "+" : ""}${pct}% when the famous names showed up. Get your number:`;
}

/**
 * THE SHARE CARD'S TWO REMAINING STRINGS (E6/S13, sweep RT-114a).
 *
 * The bias card came through the sweep CLEAN of the defect that had the
 * delicacy card telling everyone "a coin flip calls 3": every number on it —
 * the headline percentage, the sway count, the denominator — is derived from
 * `computeBiasResult`, so none of it can go stale when the pool changes.
 *
 * What it did carry was these two, composed in the route rather than the deck
 * and therefore invisible to the hazard gate. That is the same structural gap
 * the delicacy defect lived in, and the same one `PROVISIONAL_FOOTNOTE` was
 * moved here to close: a fragment in a component is a fragment nothing checks.
 * No bug today. The point is that there could not have been one and nobody
 * would have known.
 */
export function biasCardSwayLine(movedCount: number, movableCount: number): string {
  return `moved with the label on ${movedCount} of ${movableCount} clips`;
}

export function biasCardCta(host: string): string {
  return `${host}/bias — get your number`;
}
