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
import type { BiasResult, BiasVerdict } from "@/engine/bias";
import { biasClaim } from "@/engine/evidence";

export const VERDICT_COPY: Record<BiasVerdict, { title: string; sub: string }> = {
  swayed: { title: "Label-driven.", sub: "When the names walked in, your standards left with them." },
  steady: { title: "Steady ears.", sub: "The reputations showed up. Your ratings barely looked up." },
  contrarian: { title: "Contrarian.", sub: "You heard the acclaim and docked points for it. Different bias — still a bias." },
};

/**
 * WHEN THE ENGINE HAS REFUSED TO READ THE SITTING (E19/S8, PM ruling RT-U1 a).
 *
 * `biasClaim` refuses when no rating had headroom: every clip was already at
 * the end of the scale its own label pointed toward, so nothing could have
 * moved. The vocabulary layer honoured that refusal from the day it shipped and
 * said nothing. The RESULT SCREEN did not — it printed `pct` (0) and the
 * verdict the engine computes anyway ("Steady ears."), which is a verdict about
 * a measurement that could not have produced any other number. That is the one
 * claim this product may never make (D1, N3): a reading the instrument has
 * declared it cannot support.
 *
 * IT IS NEAR-UNREACHABLE AND IT IS STILL WRONG. The pool is direction-balanced,
 * and a listener cannot see which way a clip's label points while rating blind,
 * so nobody can aim at this state — `emission.test.ts` pins the half of that
 * which is checkable. The owner ruled the product should not be CAPABLE of
 * showing a verdict it has refused, which is a different question from how
 * often it would.
 *
 * THE SECOND ATTEMPT IS NAMED, because RT-N1 as amended requires a refusal to
 * say honestly whether coming back would help. Here it would: this is the one
 * refusal in the product with a real remedy, and it costs nothing to say so.
 */
export const BIAS_NO_READING = {
  title: "No reading.",
  sub:
    "Every clip was already sitting at the end of the scale its label pointed toward, so no rating " +
    "had anywhere to move. That is a fact about the ratings rather than a result — not a zero, an " +
    "absence. A sitting that uses more of the scale blind would leave this something to measure.",
};

/**
 * THE HEADLINE, DECIDED ONCE (E19/S8).
 *
 * The first version of this fix put the same `reading ? ... : ...` branch in
 * three JSX files, and the test that checked it could only READ them — which
 * meant asserting that a file mentioning `reading ?` somewhere had gated the
 * right thing. That is proximity mistaken for a relationship, the defect this
 * session has now shipped twice and caught twice by mutation.
 *
 * So the decision moves here, where it can be called and proven, and the three
 * surfaces stop touching `result.pct` at all. `pct` is NULL rather than "0%"
 * when the engine has refused: a caller cannot accidentally print a refusal as
 * a number, because there is no number to print.
 */
export function biasHeadline(result: BiasResult): {
  pct: string | null;
  title: string;
  sub: string;
} {
  if (!hasBiasReading(result)) {
    return { pct: null, title: BIAS_NO_READING.title, sub: BIAS_NO_READING.sub };
  }
  const verdict = VERDICT_COPY[result.verdict];
  return {
    pct: `${result.pct > 0 ? "+" : ""}${result.pct}%`,
    title: verdict.title,
    sub: verdict.sub,
  };
}

/** Whether the engine will stand behind a number for this sitting at all. */
export function hasBiasReading(result: BiasResult): boolean {
  return biasClaim(result).ok;
}

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
 * THE SAME TWO STRINGS FOR A SITTING WITH NO READING.
 *
 * Separate functions rather than a branch inside the two above, because those
 * take a `pct` and the whole point is that a `pct` is the wrong input here:
 * anything that accepts one can be called with 0 and will answer as though 0
 * were a measurement. Taking the RESULT makes the refusal unskippable.
 */
export function titleFragmentFor(result: BiasResult): string {
  return hasBiasReading(result) ? resultTitleFragment(result.pct) : "no reading";
}

export function shareTextFor(result: BiasResult): string {
  return hasBiasReading(result)
    ? shareText(result.pct)
    : "I rated every clip at the end of the scale, so the test had nothing to measure. Get your number:";
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
