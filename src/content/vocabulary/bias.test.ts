import { describe, expect, it } from "vitest";
import { CUE_IN_YOUR_WORK, creatorLines, whatToDoAboutIt } from "./bias";
import {
  BIAS_SCALE_MAX,
  BIAS_SCALE_MIN,
  computeBiasResult,
  type BiasResult,
  type BiasVerdict,
} from "@/engine/bias";
import { BIAS_CLIPS, BIAS_INSTRUMENT_ID } from "@/content/bias/items";
import { VERDICT_COPY } from "@/content/bias/copy";
import { checkVoice, formatVoiceReport } from "@/content/voice";
import { biasClaim } from "@/engine/evidence";

/**
 * REAL SESSIONS through the real engine. `computeBiasResult` takes two rating
 * passes; these drive it with rating patterns chosen to land on each verdict,
 * rather than hand-writing `BiasResult` objects the engine would never emit.
 */
function session(blindAt: number, shiftToward: number): BiasResult {
  const blind: Record<string, number> = {};
  const labelled: Record<string, number> = {};
  for (const item of BIAS_CLIPS) {
    blind[item.id] = blindAt;
    /*
     * SIGNED TOWARD THE LABEL, NOT RAW. `labelDirection` decides which way
     * "toward" points — an acclaimed attribution pushes up, a dismissive one
     * pushes down — so a fixture that always added a positive shift would land
     * half the items moving AWAY from their label and produce a verdict that
     * had nothing to do with the intent. Controls carry no label at all and
     * only ever drift.
     */
    const toward = item.isControl ? 0 : item.labelDirection === "up" ? shiftToward : -shiftToward;
    labelled[item.id] = Math.max(BIAS_SCALE_MIN, Math.min(BIAS_SCALE_MAX, blindAt + toward));
  }
  return computeBiasResult(BIAS_INSTRUMENT_ID, BIAS_CLIPS, blind, labelled);
}

/**
 * A session with NO movable item, which is harder to build than it looks.
 *
 * The first attempt pinned every blind rating at 10 and asserted
 * `movableCount === 0`. It came back 7. Headroom is measured TOWARD THE LABEL:
 * an "up" item at the ceiling has none, but a "down" item at the ceiling has
 * nine points of room to fall. So the edge has to be chosen per item, from that
 * item's own label direction — which is the same asymmetry the copy is written
 * to survive, caught here by the fixture rather than by a reader.
 *
 * AND THE EDGE IS `BIAS_SCALE_MIN`, WHICH IS 0 AND NOT 1. The second attempt
 * hardcoded 1 as the floor and still came back with 7 movable items — the seven
 * "down" clips, each sitting one point above a floor I had guessed wrong. The
 * constants are exported; nothing here may spell them out.
 */
function pinned(): BiasResult {
  const blind: Record<string, number> = {};
  const labelled: Record<string, number> = {};
  for (const item of BIAS_CLIPS) {
    const edge = item.isControl ? 5 : item.labelDirection === "up" ? BIAS_SCALE_MAX : BIAS_SCALE_MIN;
    blind[item.id] = edge;
    labelled[item.id] = edge;
  }
  return computeBiasResult(BIAS_INSTRUMENT_ID, BIAS_CLIPS, blind, labelled);
}

const SESSIONS: Record<string, BiasResult> = {
  swayed: session(5, 2),
  steady: session(5, 0),
  contrarian: session(5, -2),
  /** Every rating pinned at the edge ITS OWN label points at — see `pinned`. */
  noHeadroom: pinned(),
};

describe("the rendered deck", () => {
  it("prints every session with its verdict", () => {
    for (const [name, r] of Object.entries(SESSIONS)) {
      const lines = creatorLines(r);
      console.log(
        `\n### ${name} — verdict=${r.verdict} pct=${r.pct} moved=${r.movedCount}/${r.movableCount} edge=${r.edgeCount}`,
      );
      if (lines.length === 0) console.log("    (refused — no movable items)");
      for (const line of lines) console.log(`    ${line}`);
    }
  });
});

describe("the engine's own numbers, not a ratio round trip", () => {
  /**
   * `movedCount` was added to `BiasResult` in E8/S6 because THREE surfaces were
   * reconstructing it as `Math.round(swayShare * movableCount)`. This holds the
   * numerator to the definition of the share it came from.
   */
  it("movedCount is exactly swayShare x movableCount for every session", () => {
    for (const r of Object.values(SESSIONS)) {
      if (r.swayShare === null) {
        expect(r.movableCount).toBe(0);
        expect(r.movedCount).toBe(0);
        continue;
      }
      expect(r.movedCount).toBe(Math.round(r.swayShare * r.movableCount));
      expect(r.movedCount).toBeLessThanOrEqual(r.movableCount);
    }
  });

  /**
   * The translation layer must not restate the receipt the flow's pill and the
   * share card already carry, so it carries no counts at all. The first draft
   * did, and nothing in the repo would have flagged it — the pill is JSX, not a
   * deck string, so the sentence-collision tests could not see it.
   */
  it("carries no per-clip counts — that is the measurement layer's job", () => {
    for (const [name, r] of Object.entries(SESSIONS)) {
      const joined = creatorLines(r).join(" ");
      expect(joined, name).not.toMatch(/\d+ of \d+/);
      expect(joined, name).not.toMatch(/clips that could move/i);
      if (r.movableCount > 0) expect(joined, name).not.toContain(String(r.movableCount));
    }
  });
});

describe("the refusal floor", () => {
  it("says nothing when no rating had room to move", () => {
    const r = SESSIONS.noHeadroom;
    expect(r.movableCount).toBe(0);
    expect(biasClaim(r).ok).toBe(false);
    expect(creatorLines(r)).toEqual([]);
  });
});

describe("D1 — the boundary around what was NOT measured", () => {
  /**
   * The whole hazard of this file. The test measured a composer's name on a
   * stranger's recording. It did not measure sunk cost, model provenance, or
   * social commitment — so the copy may NAME those cues and must not claim they
   * move the reader.
   */
  it("names the creator's cues without asserting they moved anyone", () => {
    expect(CUE_IN_YOUR_WORK).toMatch(/which model made it/i);
    expect(CUE_IN_YOUR_WORK).toMatch(/how long you spent/i);
    // It describes the world ("the label IS…"), never the person's response.
    expect(CUE_IN_YOUR_WORK).not.toMatch(/\byou (moved|were swayed|will)\b/i);
  });

  it("the steady branch explicitly disclaims the untested cue", () => {
    expect(whatToDoAboutIt("steady")).toMatch(/nothing here has measured that one/i);
    expect(whatToDoAboutIt("steady")).toMatch(/your own effort/i);
  });

  it("makes no claim about the person and no promise about the future", () => {
    for (const r of Object.values(SESSIONS)) {
      const joined = creatorLines(r).join(" ");
      expect(joined).not.toMatch(/\byou are\b|\byou're\b/i);
      expect(joined).not.toMatch(/\byou will\b/i);
      expect(joined).not.toMatch(/\bimprove\b/i);
      expect(joined).not.toMatch(/\bpercentile\b/i);
    }
  });
});

describe("never restates what the screen already says", () => {
  it("shares no sentence with VERDICT_COPY", () => {
    const existing = new Set(Object.values(VERDICT_COPY).flatMap((v) => [v.title, v.sub]));
    for (const r of Object.values(SESSIONS)) {
      for (const line of creatorLines(r)) expect(existing.has(line)).toBe(false);
    }
  });

  it("does not re-announce the headline percentage", () => {
    for (const r of Object.values(SESSIONS)) {
      const joined = creatorLines(r).join(" ");
      expect(joined).not.toContain(`${r.pct}%`);
      expect(joined).not.toMatch(/toward the labels/i);
    }
  });
});

describe("verdict branching", () => {
  it("gives each verdict a distinct sentence", () => {
    const seen = new Set<string>();
    for (const v of ["swayed", "steady", "contrarian"] as BiasVerdict[]) seen.add(whatToDoAboutIt(v));
    expect(seen.size).toBe(3);
  });

  /** "Different bias — still a bias" is the verdict copy's own stance; the
   *  translation must not quietly congratulate a contrarian for resisting. */
  it("does not call a contrarian session unbiased", () => {
    expect(whatToDoAboutIt("contrarian")).toMatch(/still a cue/i);
  });
});

describe("voice", () => {
  it("passes the gate on every line of every session", () => {
    const strings = Object.entries(SESSIONS).flatMap(([name, r]) =>
      creatorLines(r).map((text, i) => ({
        surface: `vocabulary/bias/${name}/${i}`,
        text,
        intensity: "pointed" as const,
      })),
    );
    expect(formatVoiceReport(checkVoice(strings))).toBe("voice check: no violations");
  });
});
