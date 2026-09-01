/**
 * DID YOUR EAR MOVE — IN SENTENCES (E14/S3, Track H, 2026-09-01).
 *
 * DETERMINISTIC TEMPLATES, NEVER GENERATED PROSE. Same rule as every other
 * module in this directory and the blueprint's section 4: identical readings
 * must produce identical sentences. There is no LLM in this file and there must
 * not be one. Every branch below is a fixed string with numbers interpolated.
 *
 * THE REFUSAL IS THE MAIN CASE, NOT THE EDGE CASE. E14/S1 measured what these
 * instruments can resolve between two sittings, and the answer is that a pitch
 * threshold has to change by about three and a half times before anything may
 * be said. So `noChange` is the sentence most readers will get, most of the
 * time, and it is written as a statement about the INSTRUMENT rather than about
 * the person: "smaller than this ladder can see" — not "you did not improve",
 * which is a claim about a person that the data does not support (D1).
 *
 * IT NAMES THE FLOOR, AND THAT IS THE POINT (PM ruling RT-H1 a). A bare "no
 * change" invites the reader to conclude they failed. The floor in their own
 * units — "it would take about a 3.5x change" — tells them what would have had
 * to happen, which is the difference between a refusal and a shrug.
 *
 * IT DOES NOT PRINT A THRESHOLD, AND THAT IS NOT AN OVERSIGHT.
 *
 * The arc compares the posterior median, because that is the one statistic
 * every session has (see `arc.ts`). The RESULT SCREEN prints the band, and on
 * most sessions deliberately declines to print a point at all. If this layer
 * put "34 cents" beside a result screen reading "no reading — somewhere
 * between 8.8 and 100 cents", the page would contradict itself in plain sight.
 * E8/S8 shipped exactly that defect once — a wide band at the top and "caught
 * at 3.1 cents" in the roster underneath — and it was found by rendering the
 * page, not by reading the code. So the staircase sentences report the SIZE OF
 * THE CHANGE as a multiple and never an endpoint as a number.
 *
 * The prestige sentences DO name both numbers, and the asymmetry is deliberate:
 * there the compared statistic IS the printed headline, so the two surfaces
 * cannot disagree.
 *
 * D1 / N3. Every sentence is about two of this person's own sessions. There is
 * no cohort, no percentile, and no comparison with anybody else — an arc
 * compares one person to themselves, which is the only comparison this product
 * may make. Nothing here promises that practice will work.
 */
import type { ArcReading } from "@/engine/arc";
import type { Claim } from "@/engine/evidence";
import { familyLabel } from "@/content/staircase/copy";

/** "3.5x", "12x" — a multiple a reader can hold, never four decimal places. */
function times(factor: number): string {
  return factor >= 10 ? `${Math.round(factor)}x` : `${factor.toFixed(1)}x`;
}

/** Whole points of the sway scale, signed, as the result screen shows them. */
function sway(pct: number): string {
  const rounded = Math.round(pct);
  return `${rounded > 0 ? "+" : ""}${rounded}%`;
}

/* ------------------------------------------------------------------ *
 * The refusals
 * ------------------------------------------------------------------ */

/**
 * WHY THERE IS NO ARC HERE, said in the reader's terms.
 *
 * `too-few-sessions` is the one every first-time reader gets, and it is written
 * as the return loop the anti-clone clause permits: it points at the next
 * MEASUREMENT, not at a streak to protect or points to collect. No badge, no
 * progress bar, no "come back tomorrow" — just the true statement that one
 * session cannot answer this question and a second one can.
 */
export const ARC_REFUSAL: Record<string, string> = {
  "too-few-sessions":
    "One session cannot say whether your ear moved — there is nothing to compare it against. " +
    "A second sitting on this machine is what makes that sentence possible at all.",
  "different-material":
    "These two compression sessions ran on different recordings, so they are not comparable. A " +
    "fixed bitrate does up to twice as much damage to one recording as to another, which means " +
    "the difference between these two sittings would be a fact about the music rather than about you.",
  "arc-instrument-unsupported":
    "These trials are too short to show change over time. Your score would have to move by six of " +
    "the fifteen pairs — or four of a single flaw's five — before it meant anything, so this " +
    "machine reports where you are and leaves the question of movement to the threshold ladders.",
  "no-arc-floor":
    "Nobody has measured how much this machine's numbers wander between sittings, so there is no " +
    "honest line between a change and a coin flip here. Until there is, it says nothing.",
  "no-scoreable-trials":
    "One of these two sittings has no answers that can be scored, so there is no pair to compare.",
};

export function arcRefusal(gap: string): string {
  return ARC_REFUSAL[gap] ?? ARC_REFUSAL["no-arc-floor"];
}

/* ------------------------------------------------------------------ *
 * The readings
 * ------------------------------------------------------------------ */

/**
 * WHERE THE SESSIONS SIT ON THE LADDER, when one of them is off the end.
 *
 * `withinRange: false` means the fit put that sitting past the gentlest or
 * harshest rung the pipeline can render — the case the result screen answers
 * with a bound rather than a number. The size of a move measured from outside
 * the ladder is partly the prior's opinion, so the sentence keeps the direction
 * and drops the multiple. Direction survives because which SIDE the estimate
 * fell on is exactly what the outcome kinds are already willing to state.
 */
function offLadder(reading: ArcReading): boolean {
  return !reading.earlier.withinRange || !reading.latest.withinRange;
}

function thresholdLines(reading: ArcReading): string[] {
  const label = familyLabel(reading.family ?? "").toLowerCase();
  const floor = times(reading.floorFactor ?? 1);
  const moved = times(reading.distanceFactor ?? 1);

  if (reading.direction === null) {
    return [
      `Your two ${label} sittings are ${moved} apart, and that is inside what this ladder cannot ` +
        `tell from noise. It would take about ${floor} before a change here meant anything. This is ` +
        `not a report that you stood still — it is the instrument saying it cannot see a move this small.`,
    ];
  }

  const way =
    reading.direction === "closer"
      ? "you now catch a smaller flaw than you did"
      : "it now takes a larger flaw to reach you than it did";

  if (offLadder(reading)) {
    return [
      `Between these two ${label} sittings, ${way}. One of the two put you past the end of what this ` +
        `ladder can render, so the direction is solid and the size is not — it is at least ${floor}, ` +
        `which is the smallest move this machine can distinguish from noise.`,
    ];
  }

  return [
    `Between these two ${label} sittings, ${way} — a change of about ${moved}. This ladder cannot ` +
      `distinguish anything under ${floor} from ordinary run-to-run wobble, so a move this size is ` +
      `the instrument speaking rather than the dice.`,
  ];
}

function biasLines(reading: ArcReading): string[] {
  const before = sway(reading.earlier.value);
  const after = sway(reading.latest.value);
  const floor = Math.round(reading.floor);

  if (reading.direction === null) {
    return [
      `The label moved you ${before} last time and ${after} this time. That gap is inside the ` +
        `${floor} points this test wanders by on its own, so it is not a change anybody could stand ` +
        `behind — the same person, retested, moves this much without anything about them changing.`,
    ];
  }

  const moved = Math.round(reading.distance);

  if (reading.direction === "closer") {
    return [
      `The label moved you ${before} last time and ${after} this time — ${moved} points closer to ` +
        `zero, where zero means the name changed nothing. That is more than the ${floor} points ` +
        `this test wanders by on its own, so a name is doing less to what you hear than it was.`,
    ];
  }

  return [
    `The label moved you ${before} last time and ${after} this time — ${moved} points further from ` +
      `zero, and more than the ${floor} points this test wanders by on its own. A name is doing more ` +
      `to what you hear than it was. Both directions count: marking a labelled clip down is still ` +
      `the name deciding, not your ears.`,
  ];
}

/**
 * Everything this layer contributes for one instrument, in reading order.
 *
 * A REFUSAL IS ALWAYS A SENTENCE, never an empty array. The other vocabulary
 * modules can return nothing because something else on the screen is already
 * saying the important thing; here, silence would leave a person who came back
 * for a second session with no acknowledgement that they did.
 */
export function arcLines(claim: Claim<ArcReading>): string[] {
  if (!claim.ok) return [arcRefusal(claim.gap)];
  return claim.value.instrument === "bias" ? biasLines(claim.value) : thresholdLines(claim.value);
}
