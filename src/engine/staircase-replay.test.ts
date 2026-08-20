/**
 * E5/S6 — a result recomputed from raw answers.
 *
 * The property under test is the one the share surface rests on: a URL carries
 * RESPONSES, and exactly one result can come out of them. If a replay could
 * diverge from the session it encodes, the link would be a claim rather than a
 * recomputation — and a claim in a URL is a claim anyone can edit.
 */

import { describe, expect, it } from "vitest";
import { observer, pCorrect, rng } from "@/analytics/observer";
import { answer, isFinished, nextTrial, sessionResult, startSession } from "./staircase-session";
import { MAX_REPLAY_LENGTH, encodeResponses, replaySession } from "./staircase-replay";
import { eligibleSources } from "./staircase-pool";
import { familyForSlug, THRESHOLD_SLUGS } from "@/app/threshold/families";

const LADDERS: Array<[string, string | undefined]> = [
  ["pitch-drift", undefined],
  ["timing-smear", undefined],
  ...eligibleSources("lossy-artifact").map((s) => ["lossy-artifact", s] as [string, string]),
];

describe("E5/S6 — replay is exact", () => {
  it("a replayed session reproduces the original result, on every ladder", () => {
    for (const [family, sourceId] of LADDERS) {
      for (const seed of [7919, 15838, 23757]) {
        const axis = startSession(family, seed, sourceId).axis;
        const o = observer(axis.magnitudes[axis.magnitudes.length >> 1], 0.35, 0.02);
        let live = startSession(family, seed, sourceId);
        const rand = rng(seed ^ 0x5bf03635);
        while (!isFinished(live)) {
          const t = nextTrial(live);
          live = answer(live, rand() < pCorrect(live.axis.magnitudes[t.levelIndex], o));
        }
        const replayed = replaySession(family, seed, encodeResponses(live), sourceId);
        expect(sessionResult(replayed)).toEqual(sessionResult(live));
        // ...including which recording each trial drew, not just the number.
        expect(replayed.state.trials).toEqual(live.state.trials);
        expect(replayed.instances).toEqual(live.instances);
      }
    }
  });

  it("refuses anything malformed rather than rendering a partial result", () => {
    expect(() => replaySession("pitch-drift", -1, "11")).toThrow(/non-negative/);
    expect(() => replaySession("pitch-drift", 1.5, "11")).toThrow(/non-negative/);
    expect(() => replaySession("pitch-drift", 1, "1x1")).toThrow(/0s and 1s/);
    expect(() => replaySession("pitch-drift", 1, "1".repeat(MAX_REPLAY_LENGTH + 1))).toThrow(/exceeds/);
    // A retired source cannot be reached through a hand-edited link either.
    expect(() => replaySession("lossy-artifact", 1, "11", "pb6")).toThrow(/retired/);
  });

  /**
   * MORE ANSWERS THAN TRIALS. Silently ignoring the overflow would mean two
   * different strings render the same result, which is exactly the ambiguity
   * carrying raw responses is supposed to remove.
   */
  it("refuses more responses than the session has trials", () => {
    expect(() => replaySession("pitch-drift", 1, "1".repeat(MAX_REPLAY_LENGTH))).toThrow(/more responses/);
  });

  it("an empty response string is a session that has not started", () => {
    const s = replaySession("pitch-drift", 1, "");
    expect(s.state.trials).toHaveLength(0);
    expect(sessionResult(s).kind).toBe("inconclusive");
  });
});

describe("E5/S6 — the route table", () => {
  it("maps every slug to a real family and back", () => {
    for (const slug of THRESHOLD_SLUGS) {
      const family = familyForSlug(slug);
      expect(family).toBeTruthy();
      expect(LADDERS.some(([f]) => f === family)).toBe(true);
    }
    expect(THRESHOLD_SLUGS).toHaveLength(3);
    expect(familyForSlug("nope")).toBeNull();
    expect(familyForSlug("compression")).toBe("lossy-artifact");
  });
});
