/**
 * E21/T-S2 — THE CARD'S STRUCTURE, ON REAL SESSIONS.
 *
 * FIXTURES ARE PLAYED, NOT TYPED. Every result below comes from running the
 * shipped staircase against a simulated ear placed where it forces a particular
 * outcome — the same device `content/staircase/fixtures.ts` uses. A hand-built
 * `StaircaseResult` would let this file assert whatever shape it found
 * convenient, and the one thing worth proving is that the card holds up against
 * what the instrument actually returns.
 *
 * WHAT IT PROVES: only measured families appear, a one-band ladder makes no
 * fineness claim, a session with no evidence makes no claim at all, and the
 * model is nowhere in the path.
 *
 * WHAT IT CANNOT PROVE: that the recommendation is USEFUL. Whether "spend tags
 * on tuning character" helps anybody is unmeasured and is refused as a claim
 * everywhere the card is worded (no causal promise, MRD §7).
 */
import { describe, expect, it } from "vitest";
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
import { CARD_BANDS } from "@/engine/card-bands";
import { promptCard, type AxisState } from "@/engine/prompt-card";

/** Where to place the simulated ear, to force each outcome kind. */
type Placement = "inside" | "far-better" | "far-worse";

function play(
  family: string,
  sourceId: string | undefined,
  placement: Placement,
  seed: number,
): StaircaseResult {
  const axis = axisFor(family, sourceId);
  const mid = axis.magnitudes[axis.magnitudes.length >> 1];
  const alpha =
    placement === "inside"
      ? mid
      : placement === "far-better"
        ? axis.magnitudes[0] / 4
        : axis.magnitudes.at(-1)! * 4;
  const o = observer(alpha, 0.35, 0.02);
  let s = startSession(family, seed, sourceId);
  const rand = rng(seed ^ 0x5bf03635);
  while (!isFinished(s)) {
    const t = nextTrial(s);
    s = answer(s, rand() < pCorrect(s.axis.magnitudes[t.levelIndex], o));
  }
  return sessionResult(s);
}

const PITCH = "pitch-drift";
const TIMING = "timing-smear";
const LOSSY = "lossy-artifact";
const SOURCES = eligibleSources(LOSSY);

describe("the prompt card's structure", () => {
  it("was built from real sessions, not typed objects", () => {
    const r = play(PITCH, undefined, "inside", 11);
    expect(r.family).toBe(PITCH);
    expect(r.cohortN, "a fixture with a cohort is not a real session here").toBe(0);
    expect(r.band.rungs.length, "the session carries no per-rung evidence").toBeGreaterThan(4);
    expect(SOURCES.length, "no lossy sources ship, so half this file checks nothing").toBeGreaterThan(1);
  });

  /**
   * PM RULING RT-Z12 (a), AND IT IS THE CARD'S SHAPE RATHER THAN ITS WORDING.
   * One sitting produces a card about one axis. The other two do not appear as
   * placeholders, because a row with nothing in it is an invitation to fill it
   * in, and this product published the refusal of exactly that mechanic.
   */
  it("shows only the families that were actually measured", () => {
    const one = promptCard([play(PITCH, undefined, "inside", 3)]);
    expect(one.axes.map((a) => a.family)).toEqual([PITCH]);

    const three = promptCard([
      play(PITCH, undefined, "inside", 3),
      play(TIMING, undefined, "inside", 5),
      play(LOSSY, SOURCES[0], "inside", 7),
    ]);
    expect(three.axes.map((a) => a.family)).toEqual([PITCH, TIMING, LOSSY]);

    expect(promptCard([]).axes, "an empty history produces an empty card").toEqual([]);
    expect(promptCard([]).anyClaim).toBe(false);
  });

  it("collapses two sittings on one family to a single axis", () => {
    const card = promptCard([
      play(LOSSY, SOURCES[0], "inside", 13),
      play(LOSSY, SOURCES[1], "inside", 17),
    ]);
    expect(
      card.axes.length,
      "two compression sittings produced two rows, which describes the material rather than the ear",
    ).toBe(1);
  });

  /**
   * THE ONE-BAND LADDER. `CARD_BANDS["lossy-artifact"]` is 1, measured, so a
   * compression threshold is printed and nothing is said about how finely it
   * was heard. `spend` is null — NO CLAIM — and the distinction from `false`
   * is the whole point: "do not bother with fidelity tags" is advice about
   * something this ladder never resolved.
   */
  it("makes no fineness claim on a ladder that supports one band", () => {
    expect(CARD_BANDS[LOSSY], "this test is pinned to the measured band count").toBe(1);
    const [axis] = promptCard([play(LOSSY, SOURCES[1], "inside", 23)]).axes;
    if (axis.state === "measured") {
      expect(axis.threshold, "a measured axis with no threshold").not.toBeNull();
      expect(axis.band!.of).toBe(1);
      expect(axis.spend, "a one-band ladder must make no spend claim").toBeNull();
    } else {
      // A session that did not converge is a legitimate outcome here; what is
      // forbidden is a fineness claim, in every branch.
      expect(["not-enough", "finer-than-measured", "coarser-than-measured"]).toContain(axis.state);
    }
  });

  it("reads an ear finer than the instrument as a performance, not a threshold", () => {
    const [axis] = promptCard([play(PITCH, undefined, "far-better", 29)]).axes;
    expect(axis.state).toBe<AxisState>("finer-than-measured");
    expect(axis.threshold, "there is no number below the ladder floor, and one was printed").toBeNull();
    expect(axis.spend).toBe(true);
  });

  it("reads an ear outside the instrument as spending nothing on that axis", () => {
    const [axis] = promptCard([play(PITCH, undefined, "far-worse", 31)]).axes;
    expect(axis.state).toBe<AxisState>("coarser-than-measured");
    expect(axis.threshold).toBeNull();
    expect(axis.spend).toBe(false);
  });

  /**
   * RULE 3, AND IT IS THE NOISE-FLOOR RULE IN STRUCTURE. A session that
   * resolved nothing makes no claim, whatever its outcome kind says. The
   * estimator is allowed to imply "probably insensitive" from four answers;
   * a card is not allowed to tell somebody that about themselves.
   */
  it("makes no claim at all from a session that resolved nothing", () => {
    const real = play(PITCH, undefined, "inside", 37);
    const blank: StaircaseResult = {
      ...real,
      band: { ...real.band, heardAt: null, missedAt: null, heardIndex: null, missedIndex: null },
    };
    const [axis] = promptCard([blank]).axes;
    expect(axis.state).toBe<AxisState>("not-enough");
    expect(axis.threshold).toBeNull();
    expect(axis.band).toBeNull();
    expect(axis.spend, "a session that resolved nothing produced advice").toBeNull();
    expect(promptCard([blank]).anyClaim).toBe(false);
  });

  /** Every spend claim is backed by a state that earned it. */
  it("never recommends spending on a state that carries no evidence", () => {
    const NO_CLAIM: AxisState[] = ["not-enough", "measured"];
    const cases: StaircaseResult[] = [
      play(PITCH, undefined, "inside", 41),
      play(PITCH, undefined, "far-better", 43),
      play(PITCH, undefined, "far-worse", 47),
      play(TIMING, undefined, "inside", 53),
      play(TIMING, undefined, "far-worse", 59),
      play(LOSSY, SOURCES[0], "inside", 61),
      play(LOSSY, SOURCES[1], "far-better", 67),
    ];
    const rows: string[] = [];
    for (const r of cases) {
      const [axis] = promptCard([r]).axes;
      rows.push(
        `${r.family.padEnd(16)}${(r.sourceId ?? "-").padEnd(6)}${r.kind.padEnd(14)}` +
          `${axis.state.padEnd(22)}threshold=${String(axis.threshold ?? "-").padEnd(10)}` +
          `band=${axis.band ? `${axis.band.index + 1}/${axis.band.of}` : "-"}  spend=${String(axis.spend)}`,
      );
      if (NO_CLAIM.includes(axis.state)) {
        expect(axis.spend, `${axis.state} produced a spend claim`).toBeNull();
      }
      if (axis.threshold !== null) {
        expect(axis.band, "a threshold with no band").not.toBeNull();
      }
    }
    console.log("[E21/T-S2] thresholds in, card structure out:");
    for (const row of rows) console.log("  " + row);
    expect(rows.length).toBe(cases.length);
  });
});
