/**
 * ACROSS YOUR SESSIONS — the combined view (E8/S8, RT-A(c), 2026-08-27).
 *
 * THE PM'S CONSTRAINT WAS "DON'T MAKE USERS FEEL WE ARE BEING DUMB AND
 * REDUNDANT", so this layer earns its place by saying three things that are
 * only true once more than one instrument has been run, and are therefore
 * unsayable on any single result screen:
 *
 *   1. THE DOSSIER. Three instruments, three DIFFERENT questions — not three
 *      scores of one thing. Nothing is ranked against anything, because nothing
 *      here shares a scale.
 *   2. THE REPLICATION. Where two instruments measured the same family in the
 *      same physical unit, do they agree? See `src/engine/replication.ts` for
 *      why this is the only honest cross-instrument comparison available.
 *   3. COVERAGE. What has been measured and what has not — the return loop the
 *      blueprint asks for, with no leaderboard, streak, XP or points anywhere
 *      near it (the anti-clone clause).
 *
 * WHAT IT MAY NEVER SAY: that one family is a strength and another a blind
 * spot. That claim is refused at the source (`familyContrastClaim`) and the
 * refusal is measured, not stylistic — see `delicacy.ts`.
 *
 * Deterministic templates, no LLM (blueprint section 4). D1: about the
 * sessions, never about the person. N3: no cohort, no percentile.
 */
import type { BiasResult } from "@/engine/bias";
import type { DelicacyResult } from "@/engine/delicacy";
import type { StaircaseResult } from "@/engine/staircase-session";
import type { ReplicationCheck } from "@/engine/replication";
import { familyLabel, onSource, quantity, shortUnit } from "@/content/staircase/copy";
import { thresholdClaim } from "@/engine/evidence";

export interface AcrossInput {
  bias: BiasResult | null;
  delicacy: DelicacyResult | null;
  thresholds: StaircaseResult[];
  replications: ReplicationCheck[];
  /** Ladders the Gym offers that this device has no session for. */
  unmeasured: string[];
}

/** How many distinct instruments have produced a stored result. */
export function instrumentCount(input: AcrossInput): number {
  return (input.bias ? 1 : 0) + (input.delicacy ? 1 : 0) + (input.thresholds.length > 0 ? 1 : 0);
}

/**
 * THE DOSSIER — three questions, named as questions.
 *
 * Deliberately NOT "here are your three scores". The instruments do not measure
 * one underlying quantity, and a sentence that lists them like a report card
 * invites exactly the ranking the product refuses to make. Naming what each one
 * ASKED keeps them separate by construction.
 */
export function dossierLine(input: AcrossInput): string | null {
  const parts: string[] = [];
  if (input.bias) parts.push("whether a name changes what you hear");
  if (input.delicacy) parts.push("whether you can tell damage from clean and say what it is");
  if (input.thresholds.length > 0) parts.push("how small a flaw has to get before you lose it");
  if (parts.length < 2) return null;

  /*
   * SEMICOLONS, NOT "AND", and this was a real defect in the rendered deck. The
   * middle clause already contains an "and" — "tell damage from clean AND say
   * what it is" — so joining the list with "and" produced "…say what it is and
   * how small a flaw has to get", where the two conjunctions run together and
   * the reader cannot see where one question ends.
   *
   * The count is also read off `parts` rather than written out. The first draft
   * said "not three scores of one thing" on a session with TWO instruments.
   */
  const list = parts.join("; ");
  return (
    `You have answered ${parts.length} different questions about your ears: ${list}. They are not ` +
    `${parts.length} scores of one thing and they do not add up — each is measured in its own terms.`
  );
}

/**
 * THE REPLICATION — the sentence that makes a number worth believing.
 *
 * The agreement count is `agree` out of `agree + disagree`, and the trials the
 * band declined to predict are named separately rather than folded in. Folding
 * them in would let a band that predicts nothing report perfect agreement.
 */
export function replicationLine(check: ReplicationCheck): string {
  const tested = check.agree + check.disagree;
  const label = familyLabel(check.family).toLowerCase();
  const unit = shortUnit(check.unit);
  const material = check.crossMaterial
    ? " — and on different recordings, which is a harder test than either session alone"
    : "";

  if (check.disagree === 0) {
    return (
      `Two separate sessions measured your ${label} in ${unit}, by different methods, and they agreed ` +
      `on ${tested} of ${tested} checks${material}. That is the closest thing here to evidence that the ` +
      `number is real and not an afternoon.`
    );
  }

  if (check.agree === 0) {
    return (
      `Two separate sessions measured your ${label} in ${unit} and disagreed on all ${tested} checks` +
      `${material}. One of the two sittings is not describing your ear — which is worth more than a ` +
      `number that was never tested twice.`
    );
  }

  return (
    `Two separate sessions measured your ${label} in ${unit} and agreed on ${check.agree} of ${tested} ` +
    `checks${material}. Partial agreement is the ordinary result for two short sessions; a third would ` +
    `narrow it.`
  );
}

/**
 * COVERAGE — what is still unmeasured.
 *
 * THE RETENTION LOOP, and the only one the anti-clone clause permits: it points
 * at the next MEASUREMENT, not at a streak to protect or points to collect.
 */
export function coverageLine(input: AcrossInput): string | null {
  if (input.unmeasured.length === 0) {
    return `Every ladder the Gym can run has a session on this device. What moves the numbers now is time between sittings.`;
  }
  const names = input.unmeasured.map((f) => familyLabel(f).toLowerCase());
  const list =
    names.length === 1
      ? names[0]
      : names.length === 2
        ? `${names[0]} and ${names[1]}`
        : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
  return `Unmeasured on this device: ${list}. Nothing here says how you would do on ${names.length === 1 ? "it" : "them"}.`;
}

/**
 * The threshold numbers, listed WITHOUT being compared.
 *
 * Each is printed in its own unit and nothing sits between them — no ordering,
 * no "sharpest", no arrow. Two numbers in different units side by side is a
 * list, not a ranking, and the dossier line above has already said so.
 */
export function thresholdRoster(input: AcrossInput): string[] {
  return input.thresholds
    .map((t) => {
      /*
       * THROUGH THE CLAIM FLOOR, NOT STRAIGHT OFF THE BAND (E8/S8, caught by
       * reading the deck). The first version read `t.band.heardAt` directly and
       * printed "caught at X" for every session — including a WIDE band, whose
       * edges the per-instrument layer refuses to state as a finding because
       * they cover most of the ladder. The same session would then have been
       * hedged on its own result screen and stated flatly here, on a page that
       * can show both. One rule, one answer.
       */
      const claim = thresholdClaim(t);
      if (!claim.ok) return null;
      const say = claim.value;
      const label = familyLabel(t.family);
      if (say.wide || say.heardAt === null) return `${label}: not pinned down this session`;
      /*
       * LOSSY NAMES ITS RECORDING (RT-85a, N3). A bitrate threshold is a fact
       * about the material as well as the listener, and `onSource` is the one
       * function that decides when to say so — omitting it here would make this
       * the only surface in the product that states a kbps number bare.
       */
      return `${label}: caught at ${quantity(say.heardAt, t.unit)}${onSource(t)}`;
    })
    .filter((l): l is string => l !== null);
}

/** Everything this layer contributes, in reading order. Empty below two instruments. */
export function acrossLines(input: AcrossInput): string[] {
  if (instrumentCount(input) < 2) return [];
  const lines: string[] = [];
  const dossier = dossierLine(input);
  if (dossier) lines.push(dossier);
  for (const check of input.replications) lines.push(replicationLine(check));
  const coverage = coverageLine(input);
  if (coverage) lines.push(coverage);
  return lines;
}
