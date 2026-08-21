/**
 * EVERY LINE THE GYM CAN SAY, GENERATED FROM REAL SESSIONS (E5/S5, 2026-08-20).
 *
 * WHY THIS IS NOT A LIST OF EXAMPLE STRINGS. The voice gate can only check copy
 * it is handed, and the delicacy deck learned this the hard way: fragments that
 * lived in JSX sat outside the gate entirely until someone noticed. The Gym's
 * result copy is worse in that respect, because it is ASSEMBLED — four outcome
 * kinds, three families, a band that can be open at either end, a source name
 * that appears only for lossy. Hand-writing fixtures would mean the gate checks
 * the shapes somebody remembered.
 *
 * So the fixtures are produced by driving the actual session engine with
 * simulated listeners placed to force each outcome, and reading the copy off
 * the results. If a new outcome shape appears, it appears here too.
 *
 * SIMULATED (N3) — this is a copy fixture, never a source of numbers for a
 * surface. It lives in `src/content/` because it is part of the deck's own
 * test surface, and it imports only the engine.
 */

import { observer, pCorrect, rng } from "@/analytics/observer";
import {
  answer,
  axisFor,
  isFinished,
  nextTrial,
  sessionResult,
  startSession,
  type StaircaseResult,
} from "@/engine/staircase-session";
import { eligibleSources } from "@/engine/staircase-pool";
import { resultLines } from "./copy";

/** Where to place the simulated ear, to force each outcome kind. */
type Placement = "inside" | "far-better" | "far-worse";

const PLACEMENTS: Placement[] = ["inside", "far-better", "far-worse"];

function resultFor(family: string, sourceId: string | undefined, placement: Placement, seed: number): StaircaseResult {
  const axis = axisFor(family, sourceId);
  const mid = axis.magnitudes[axis.magnitudes.length >> 1];
  const alpha =
    placement === "inside" ? mid : placement === "far-better" ? axis.magnitudes[0] / 4 : axis.magnitudes.at(-1)! * 4;
  const o = observer(alpha, 0.35, 0.02);
  let s = startSession(family, seed, sourceId);
  const rand = rng(seed ^ 0x5bf03635);
  while (!isFinished(s)) {
    const t = nextTrial(s);
    s = answer(s, rand() < pCorrect(s.axis.magnitudes[t.levelIndex], o));
  }
  return sessionResult(s);
}

export interface StaircaseCopyFixture {
  surface: string;
  family: string;
  sourceId?: string;
  kind: StaircaseResult["kind"];
  lines: string[];
}

/**
 * One fixture per (ladder x placement), plus a deliberate unstarted session so
 * the "could not separate the rungs" branch is exercised — it is reachable in
 * production only through an abandoned session, which is precisely the branch
 * nobody would think to write copy for.
 */
export function staircaseCopyFixtures(): StaircaseCopyFixture[] {
  const out: StaircaseCopyFixture[] = [];
  const ladders: Array<{ family: string; sourceId?: string }> = [
    { family: "pitch-drift" },
    { family: "timing-smear" },
    ...eligibleSources("lossy-artifact").map((sourceId) => ({ family: "lossy-artifact", sourceId })),
  ];

  for (const { family, sourceId } of ladders) {
    for (const placement of PLACEMENTS) {
      // A few seeds, because on the narrow ladders "inside" does not always
      // produce the same outcome kind and the deck must cover what it produces.
      for (const seed of [7919, 15838, 23757]) {
        const result = resultFor(family, sourceId, placement, seed);
        const tag = `${family}${sourceId ? `/${sourceId}` : ""}/${placement}/${result.kind}`;
        if (out.some((f) => f.surface === `staircase/${tag}`)) continue;
        out.push({
          surface: `staircase/${tag}`,
          family,
          sourceId,
          kind: result.kind,
          lines: resultLines(result),
        });
      }
    }
    const empty = sessionResult(startSession(family, 1, sourceId));
    const tag = `${family}${sourceId ? `/${sourceId}` : ""}/unstarted/${empty.kind}`;
    if (!out.some((f) => f.surface === `staircase/${tag}`)) {
      out.push({ surface: `staircase/${tag}`, family, sourceId, kind: empty.kind, lines: resultLines(empty) });
    }
  }
  return out;
}

export interface StaircaseCardFixture {
  surface: string;
  result: StaircaseResult;
}

/**
 * The same ladders and placements as `staircaseCopyFixtures`, but carrying the
 * RESULT rather than the rendered lines — the share card needs the object, not
 * the deck's prose (E6/S15).
 *
 * It exists as its own function rather than a field on the copy fixture because
 * the two consumers want different things and a fixture that carried both would
 * make every result-deck test drag a card's worth of unused state through it.
 * The generation is shared, so the two can never cover different sessions.
 */
export function staircaseCardFixtures(): StaircaseCardFixture[] {
  const out: StaircaseCardFixture[] = [];
  const ladders: Array<{ family: string; sourceId?: string }> = [
    { family: "pitch-drift" },
    { family: "timing-smear" },
    ...eligibleSources("lossy-artifact").map((sourceId) => ({ family: "lossy-artifact", sourceId })),
  ];

  for (const { family, sourceId } of ladders) {
    for (const placement of PLACEMENTS) {
      for (const seed of [7919, 15838, 23757]) {
        const result = resultFor(family, sourceId, placement, seed);
        const surface = `staircase/${family}${sourceId ? `/${sourceId}` : ""}/${placement}/${result.kind}`;
        if (out.some((f) => f.surface === surface)) continue;
        out.push({ surface, result });
      }
    }
    // The abandoned session, which is the only way `inconclusive` reaches a
    // real card and therefore the branch that must never print a number.
    const empty = sessionResult(startSession(family, 1, sourceId));
    const surface = `staircase/${family}${sourceId ? `/${sourceId}` : ""}/unstarted/${empty.kind}`;
    if (!out.some((f) => f.surface === surface)) out.push({ surface, result: empty });
  }
  return out;
}
