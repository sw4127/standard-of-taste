/**
 * E4/S5/S1 — prove the staircase Layer A gate can REJECT, and reject for the
 * right reason.
 *
 * Same argument as `validate.test.ts`: a gate never observed to reject is not
 * yet known to be a gate. These drive `gradeStaircaseClip` directly with
 * measurement-shaped rows, one per failure mode, plus the boundary either side
 * of every threshold — so a threshold cannot be moved, or an operator flipped,
 * without a test going red.
 *
 * WHY NOT END-TO-END AUDIO: the source cache is git-ignored (it holds the
 * downloaded recordings) and `public/audio/staircase` is too (RT-71b). A test
 * that skipped when they are absent would report green in CI while proving
 * nothing. The decision logic is pinned here; the measurement-to-decision
 * wiring is demonstrated by the real 198-row run pasted into the S2 reply.
 */

import { describe, expect, it } from "vitest";
import {
  gradeStaircaseClip,
  MAX_CLIPPED_FRACTION,
  MAX_FLAT_TOP_FRACTION,
  MAX_QUIET_FRACTION,
  MAX_SILENCE_SEC,
  MIN_CONFIDENT_BLOCK_FRACTION,
  MIN_CONFIDENT_PITCH_FRACTION,
  MIN_MEASURABLE_DRIFT_MS,
  MIN_MEASURABLE_PITCH_CENTS,
  STAIRCASE_MAGNITUDE_GATES,
} from "./staircasevalidate.mjs";
import { eligibleWindows, levelErrVerdict, lossyStepCollapses, trajectoryVerdict, MIN_LOSSY_LEVEL_RATIO } from "./staircasevalidate.mjs";
import { MAX_LEVEL_ERR_PCT, MIN_TRAJECTORY_R, MAX_TRAJECTORY_SLOPE_ERR_PCT } from "./staircaserender.mjs";
import { MIN_PITCH_CENTS } from "./validate.mjs";
import { STAIRCASE_LEVELS } from "./rungs.mjs";

/** Drop one key from a row, without binding an unused variable for it. */
function without<T extends object>(row: T, key: string): T {
  const copy = { ...row } as Record<string, unknown>;
  delete copy[key];
  return copy as T;
}

/** The gate table indexed by an arbitrary family name — the point of several
 *  tests below is that a family is ABSENT from it. */
const gateFor = (family: string) => (STAIRCASE_MAGNITUDE_GATES as Record<string, unknown>)[family];

/** A healthy PITCH clip — each test perturbs exactly one field. */
const pitch = {
  id: "pb1-w75-pitch-25",
  kind: "degraded" as const,
  sourceId: "pb1",
  startSec: 75,
  family: "pitch-drift",
  level: 25,
  sha256Match: true,
  preNormClippedFraction: 0,
  measuredValue: 23.8,
  confidentFraction: 1,
  // Pitch's detune IS recovered from the audio, so its evidence is
  // staircase-render's error gate against the ramp prediction.
  levelErrVerified: true,
  flatTopFraction: 0,
  longestSilenceSec: 0.4,
  quietFraction: 0.05,
};

/** A healthy TIMING clip. Note the deliberately hostile confidence: 0.30 would
 *  fail pitch's 0.80 and is entirely normal for a correlator on warped audio. */
const timing = {
  ...pitch,
  id: "pb6-w30-timing-25",
  sourceId: "pb6",
  startSec: 30,
  family: "timing-smear",
  measuredValue: 25,
  confidentFraction: 0.3,
  // Timing's magnitude label is the MODEL (RT-74a), so it carries separate
  // evidence that the drift actually rendered — staircase-render's trajectory
  // verdict. Pitch needs no equivalent: its cents figure IS a measurement of
  // the file.
  trajectoryVerified: true,
};

/** A healthy window REFERENCE — no family, no magnitude, fitness only. */
const reference = {
  id: "pb1-w75-ref",
  kind: "reference" as const,
  sourceId: "pb1",
  startSec: 75,
  sha256Match: true,
  preNormClippedFraction: 0,
  flatTopFraction: 0,
  longestSilenceSec: 0.4,
  quietFraction: 0.05,
};

describe("the healthy rows pass", () => {
  it.each([
    ["pitch", pitch, "cents-floor + fitness"],
    ["timing", timing, "ms-floor + fitness"],
    ["reference", reference, "fitness-only"],
  ])("%s", (_name, row, gatedOn) => {
    const r = gradeStaircaseClip(row);
    expect(r.reasons).toEqual([]);
    expect(r.verdict).toBe("PASS");
    expect(r.gatedOn).toBe(gatedOn);
  });
});

describe("integrity is established before anything is read", () => {
  it("a missing file is an ERROR, not a FLAG", () => {
    const r = gradeStaircaseClip({ ...pitch, fileMissing: true });
    expect(r.verdict).toBe("ERROR");
    expect(r.reasons[0]).toMatch(/audio missing/);
  });

  it("a hash mismatch is an ERROR — the clip may be fine, but nothing we know describes it", () => {
    const r = gradeStaircaseClip({ ...pitch, sha256Match: false });
    expect(r.verdict).toBe("ERROR");
    expect(r.reasons[0]).toMatch(/does not match the manifest/);
  });

  it("an UNCHECKED hash is an ERROR too — absence of a check is not a pass", () => {
    const r = gradeStaircaseClip(without(pitch, "sha256Match"));
    expect(r.verdict).toBe("ERROR");
    expect(r.reasons[0]).toMatch(/not checked/);
  });

  it("a hash mismatch suppresses every other verdict — one row, one reason", () => {
    // Deliberately also breaks dead air and quiet fraction. If integrity were
    // checked last, this would report three problems and bury the real one.
    const r = gradeStaircaseClip({ ...pitch, sha256Match: false, longestSilenceSec: 9, quietFraction: 0.9 });
    expect(r.reasons).toHaveLength(1);
    expect(r.reasons[0]).toMatch(/sha256/);
  });
});

describe("the pitch floor is the MEASURABILITY floor, not the fair-trial floor", () => {
  it("a staircase clip below the fixed assessment's 10-cent floor still passes", () => {
    // THE POINT OF THE WHOLE INSTRUMENT. The lowest shipping level is 3.1
    // cents; `validate.mjs` would reject it at MIN_PITCH_CENTS = 10. A
    // staircase converging downward toward a listener's threshold must be
    // allowed below the fair-trial floor (rungs.mjs).
    const r = gradeStaircaseClip({ ...pitch, level: 3.1, measuredValue: 3.02 });
    expect(r.verdict).toBe("PASS");
  });

  it("and the two floors are genuinely different numbers, so this test is not vacuous", () => {
    expect(MIN_MEASURABLE_PITCH_CENTS).toBe(3);
    expect(MIN_PITCH_CENTS).toBe(10);
    expect(MIN_MEASURABLE_PITCH_CENTS).toBeLessThan(MIN_PITCH_CENTS);
  });

  it("gates on MIN_MEASURABLE_PITCH_CENTS, not on MIN_PITCH_CENTS", () => {
    expect(STAIRCASE_MAGNITUDE_GATES["pitch-drift"].floor).toBe(MIN_MEASURABLE_PITCH_CENTS);
    expect(STAIRCASE_MAGNITUDE_GATES["pitch-drift"].floor).not.toBe(MIN_PITCH_CENTS);
  });

  it("below the ruler's own floor it FLAGS — we cannot say what was rendered", () => {
    const r = gradeStaircaseClip({ ...pitch, level: MIN_MEASURABLE_PITCH_CENTS - 0.01 });
    expect(r.verdict).toBe("FLAG");
    expect(r.reasons[0]).toMatch(/below the ruler's own floor/);
  });

  it("exactly AT the floor passes — the gate is >=, not >", () => {
    expect(gradeStaircaseClip({ ...pitch, level: MIN_MEASURABLE_PITCH_CENTS }).verdict).toBe("PASS");
  });
});

describe("the timing floor is the ruler's ordering limit", () => {
  it("below it, FLAG", () => {
    const r = gradeStaircaseClip({ ...timing, level: MIN_MEASURABLE_DRIFT_MS - 0.1 });
    expect(r.verdict).toBe("FLAG");
    expect(r.reasons[0]).toMatch(/below the ruler's own floor/);
  });

  it("exactly at it, PASS", () => {
    expect(gradeStaircaseClip({ ...timing, level: MIN_MEASURABLE_DRIFT_MS }).verdict).toBe("PASS");
  });

  it("sits just BELOW the shipping ladder's bottom rung — a guard, not a live gate", () => {
    // If this ever inverts, either the ladder was extended below the ruler or
    // the floor was raised into the ladder. Both need a decision, not a green
    // suite.
    const bottom = Math.min(...(STAIRCASE_LEVELS["timing-smear"].values as number[]));
    expect(MIN_MEASURABLE_DRIFT_MS).toBeLessThan(bottom);
    const pitchBottom = Math.min(...(STAIRCASE_LEVELS["pitch-drift"].values as number[]));
    expect(MIN_MEASURABLE_PITCH_CENTS).toBeLessThan(pitchBottom);
  });
});

describe("timing carries separate evidence that its magnitude is a fact about the AUDIO", () => {
  // The defect this closes: per RT-74a a timing clip's `measured.value` equals
  // its `level` by construction, so the magnitude floor restates the ladder
  // table and a clip whose warp never rendered would clear it.
  it("a clip whose drift trajectory did not verify FLAGS, even though its labelled magnitude is fine", () => {
    const r = gradeStaircaseClip({ ...timing, measuredValue: 25, trajectoryVerified: false });
    expect(r.verdict).toBe("FLAG");
    expect(r.reasons[0]).toMatch(/did not verify/);
  });

  it("a MISSING trajectory verdict is an ERROR, not a pass", () => {
    const r = gradeStaircaseClip(without(timing, "trajectoryVerified"));
    expect(r.verdict).toBe("ERROR");
    expect(r.reasons[0]).toMatch(/never established/);
  });

  it("pitch carries its OWN evidence field, sourced from a different gate", () => {
    // Both families' floors are checked on `level`, a ladder-table property, so
    // both need audio-level evidence — but from the gate that suits them:
    // pitch's detune error, timing's drift trajectory.
    expect(STAIRCASE_MAGNITUDE_GATES["pitch-drift"].evidenceField).toBe("levelErrVerified");
    expect(STAIRCASE_MAGNITUDE_GATES["timing-smear"].evidenceField).toBe("trajectoryVerified");
    expect(gradeStaircaseClip({ ...pitch, levelErrVerified: false }).verdict).toBe("FLAG");
    expect(gradeStaircaseClip(without(pitch, "levelErrVerified")).verdict).toBe("ERROR");
  });

  it("the magnitude floor alone would have passed a clip whose warp never rendered", () => {
    // Pins the reason this field exists. Same row, same label, opposite verdict.
    expect(gradeStaircaseClip({ ...timing, trajectoryVerified: true }).verdict).toBe("PASS");
    expect(gradeStaircaseClip({ ...timing, trajectoryVerified: false }).verdict).toBe("FLAG");
  });
});

describe("REGRESSION: the floor is in the PARAMETER domain, not the measurement domain", () => {
  // FOUND BY THE REAL 198-CLIP RUN (E4/S5/S2). The first version compared the
  // 3-cent floor against each clip's MEASURED p95 and flagged pitch level 3.1
  // on eight of nine windows. A ramp peaks at 0.95 of its parameter, so level
  // 3.1 PREDICTS 2.94 cents — under a 3-cent measurement floor by construction.
  it("level 3.1 measuring 2.70 cents PASSES — that is the ramp, not a defect", () => {
    const r = gradeStaircaseClip({ ...pitch, level: 3.1, measuredValue: 2.7 });
    expect(r.verdict).toBe("PASS");
  });

  it("every shipping pitch level predicts a measurement BELOW its own level", () => {
    // Pins the arithmetic that made the mismatch invisible: if this ever became
    // false the two domains would coincide and the bug would look fine.
    for (const level of STAIRCASE_LEVELS["pitch-drift"].values as number[]) {
      expect(level * 0.95).toBeLessThan(level);
    }
  });

  it("the floor is read off `level`, so a missing level cannot pass", () => {
    const r = gradeStaircaseClip(without(pitch, "level"));
    expect(r.verdict).toBe("FLAG");
    expect(r.reasons[0]).toMatch(/below the ruler's own floor/);
  });
});

describe("confidence is established before magnitude is believed", () => {
  it("an unmeasurable pitch clip FLAGS on confidence, not on its (large) magnitude", () => {
    const r = gradeStaircaseClip({ ...pitch, confidentFraction: MIN_CONFIDENT_PITCH_FRACTION - 0.01, measuredValue: 99 });
    expect(r.verdict).toBe("FLAG");
    expect(r.reasons).toHaveLength(1);
    expect(r.reasons[0]).toMatch(/unmeasurable/);
    expect(r.reasons[0]).toMatch(/frames matched/);
  });

  it("timing's confidence floor is far more permissive than pitch's, and deliberately so", () => {
    expect(MIN_CONFIDENT_BLOCK_FRACTION).toBeLessThan(MIN_CONFIDENT_PITCH_FRACTION);
    // The very same confidence that passes timing would fail pitch.
    expect(gradeStaircaseClip({ ...timing, confidentFraction: 0.3 }).verdict).toBe("PASS");
    expect(gradeStaircaseClip({ ...pitch, confidentFraction: 0.3 }).verdict).toBe("FLAG");
  });

  it("a correlator that never locked FLAGS", () => {
    const r = gradeStaircaseClip({ ...timing, confidentFraction: MIN_CONFIDENT_BLOCK_FRACTION - 0.01 });
    expect(r.verdict).toBe("FLAG");
    expect(r.reasons[0]).toMatch(/blocks aligned/);
  });

  it("exactly at each confidence floor, PASS", () => {
    expect(gradeStaircaseClip({ ...pitch, confidentFraction: MIN_CONFIDENT_PITCH_FRACTION }).verdict).toBe("PASS");
    expect(gradeStaircaseClip({ ...timing, confidentFraction: MIN_CONFIDENT_BLOCK_FRACTION }).verdict).toBe("PASS");
  });
});

describe("clipping is read, and its absence is not a zero", () => {
  it("an unmeasured figure is an ERROR", () => {
    const r = gradeStaircaseClip(without(pitch, "preNormClippedFraction"));
    expect(r.verdict).toBe("ERROR");
    expect(r.reasons[0]).toMatch(/never measured/);
  });

  it("an explicit null is an ERROR too", () => {
    expect(gradeStaircaseClip({ ...pitch, preNormClippedFraction: null }).verdict).toBe("ERROR");
  });

  it("a reference with no recorded clipping figure is an ERROR — the renderer only records it for degraded clips", () => {
    expect(gradeStaircaseClip(without(reference, "preNormClippedFraction")).verdict).toBe("ERROR");
  });

  it("over the threshold, FLAG", () => {
    const r = gradeStaircaseClip({ ...pitch, preNormClippedFraction: MAX_CLIPPED_FRACTION * 2 });
    expect(r.verdict).toBe("FLAG");
    expect(r.reasons[0]).toMatch(/clipping/);
  });

  it("exactly at the threshold, PASS", () => {
    expect(gradeStaircaseClip({ ...pitch, preNormClippedFraction: MAX_CLIPPED_FRACTION }).verdict).toBe("PASS");
  });
});

describe("the fitness gates — measured fresh, and never measured before this slice", () => {
  it.each([
    ["dead air", { longestSilenceSec: MAX_SILENCE_SEC + 0.01 }, /dead air/],
    ["quiet fraction", { quietFraction: MAX_QUIET_FRACTION + 0.001 }, /near-silent/],
    ["flat-topped crests", { flatTopFraction: MAX_FLAT_TOP_FRACTION + 0.0001 }, /flat-topped/],
  ])("%s FLAGS just over the line", (_name, patch, re) => {
    const r = gradeStaircaseClip({ ...pitch, ...patch });
    expect(r.verdict).toBe("FLAG");
    expect(r.reasons).toHaveLength(1);
    expect(r.reasons[0]).toMatch(re);
  });

  it.each([
    ["dead air", { longestSilenceSec: MAX_SILENCE_SEC }],
    ["quiet fraction", { quietFraction: MAX_QUIET_FRACTION }],
    ["flat-topped crests", { flatTopFraction: MAX_FLAT_TOP_FRACTION }],
  ])("%s passes exactly at the line", (_name, patch) => {
    expect(gradeStaircaseClip({ ...pitch, ...patch }).verdict).toBe("PASS");
  });

  it("the fitness gates apply to REFERENCES, which nothing had ever checked", () => {
    // A reference is the A side of all 21 trials in its window; if it fades to
    // silence, every one of them is unanswerable while each degraded clip is
    // individually flawless.
    const r = gradeStaircaseClip({ ...reference, longestSilenceSec: 4.2 });
    expect(r.verdict).toBe("FLAG");
    expect(r.reasons[0]).toMatch(/dead air/);
  });

  it("a row can FLAG for several independent reasons at once", () => {
    const r = gradeStaircaseClip({ ...pitch, longestSilenceSec: 9, quietFraction: 0.9, level: 0.1 });
    expect(r.reasons).toHaveLength(3);
  });
});

describe("a family with no gate cannot pass", () => {
  it("lossy now HAS a gate, pre-registered in E4/S4/S2 before any lossy audio existed", () => {
    expect(gateFor("lossy-artifact")).toBeDefined();
  });

  it("an unknown family ERRORs", () => {
    expect(gradeStaircaseClip({ ...pitch, family: "reverb-smear" }).verdict).toBe("ERROR");
  });

  it("but a REFERENCE has no family and is graded on fitness alone", () => {
    const r = gradeStaircaseClip(without(without({ ...pitch, kind: "reference" as const }, "family"), "level"));
    expect(r.verdict).toBe("PASS");
    expect(r.gatedOn).toBe("fitness-only");
  });
});

describe("the thresholds are imported, not restated", () => {
  it("every family the staircase renders has a gate", () => {
    // STAIRCASE_RENDER_FAMILIES is what `staircase-render` will produce; each
    // must be judgeable here or its clips ERROR on arrival.
    for (const family of ["pitch-drift", "timing-smear"]) {
      expect(gateFor(family)).toBeDefined();
    }
  });

  it("the confidence floors are the SAME objects validate.mjs uses", () => {
    expect(STAIRCASE_MAGNITUDE_GATES["pitch-drift"].minConfidentFraction).toBe(MIN_CONFIDENT_PITCH_FRACTION);
    expect(STAIRCASE_MAGNITUDE_GATES["timing-smear"].minConfidentFraction).toBe(MIN_CONFIDENT_BLOCK_FRACTION);
  });
});

describe("the evidence verdicts read staircase-render's own constants", () => {
  it("trajectoryVerdict applies r and slope exactly as that stage does", () => {
    expect(trajectoryVerdict({ trajectoryR: MIN_TRAJECTORY_R, trajectorySlope: 1 })).toBe(true);
    expect(trajectoryVerdict({ trajectoryR: MIN_TRAJECTORY_R - 0.001, trajectorySlope: 1 })).toBe(false);
    const edge = 1 + MAX_TRAJECTORY_SLOPE_ERR_PCT / 100;
    expect(trajectoryVerdict({ trajectoryR: 0.9, trajectorySlope: edge })).toBe(true);
    expect(trajectoryVerdict({ trajectoryR: 0.9, trajectorySlope: edge + 0.001 })).toBe(false);
  });

  it("levelErrVerdict applies the error gate symmetrically", () => {
    expect(levelErrVerdict({ errPct: MAX_LEVEL_ERR_PCT })).toBe(true);
    expect(levelErrVerdict({ errPct: -MAX_LEVEL_ERR_PCT })).toBe(true);
    expect(levelErrVerdict({ errPct: MAX_LEVEL_ERR_PCT + 0.1 })).toBe(false);
    expect(levelErrVerdict({ errPct: -(MAX_LEVEL_ERR_PCT + 0.1) })).toBe(false);
  });

  it("both return null when the figure is absent — the grader turns that into an ERROR", () => {
    expect(trajectoryVerdict({})).toBeNull();
    expect(trajectoryVerdict(undefined)).toBeNull();
    expect(levelErrVerdict({})).toBeNull();
  });
});

describe("eligibleWindows is the INTERSECTION, so E5 cannot use one list alone", () => {
  const manifest = {
    instanceWindows: {
      "pitch-drift": [
        { sourceId: "pb1", startSec: 30 },
        { sourceId: "pb1", startSec: 75 },
        { sourceId: "pb6", startSec: 30 },
      ],
      "timing-smear": [{ sourceId: "pb1", startSec: 30 }],
    },
    layerA: {
      excludedWindows: [
        { family: "pitch-drift", sourceId: "pb1", startSec: 75, reason: "clipping" },
        { family: "*", sourceId: "pb6", startSec: 30, reason: "the window REFERENCE did not pass" },
      ],
    },
  };

  it("drops a window Layer A excluded for that family", () => {
    const w = eligibleWindows(manifest, "pitch-drift");
    expect(w).not.toContainEqual({ sourceId: "pb1", startSec: 75 });
  });

  it("a REFERENCE failure ('*') drops the window for EVERY family", () => {
    expect(eligibleWindows(manifest, "pitch-drift")).not.toContainEqual({ sourceId: "pb6", startSec: 30 });
    expect(eligibleWindows(manifest, "timing-smear")).not.toContainEqual({ sourceId: "pb6", startSec: 30 });
  });

  it("keeps what both stages allow", () => {
    expect(eligibleWindows(manifest, "pitch-drift")).toEqual([{ sourceId: "pb1", startSec: 30 }]);
  });

  it("never returns a window the RENDERER excluded, even if Layer A is silent", () => {
    // The renderer's list is the starting set, so a window it dropped can never
    // reappear here — the intersection only ever removes.
    expect(eligibleWindows(manifest, "timing-smear")).toEqual([{ sourceId: "pb1", startSec: 30 }]);
  });

  it("a manifest with no Layer A block yet falls back to the renderer's list, not to everything", () => {
    const noLayerA = { instanceWindows: manifest.instanceWindows };
    expect(eligibleWindows(noLayerA, "timing-smear")).toEqual([{ sourceId: "pb1", startSec: 30 }]);
    expect(eligibleWindows({}, "timing-smear")).toEqual([]);
  });
});

/** A healthy LOSSY clip. Level is a BITRATE (RT-85a); the floor is measured. */
const lossy = {
  id: "pb1-w105-lossy-128",
  kind: "degraded" as const,
  sourceId: "pb1",
  startSec: 105,
  family: "lossy-artifact",
  level: 128,
  sha256Match: true,
  preNormClippedFraction: 0,
  lsdDb: 1.46,
  anchorRatio: 2.1,
  flatTopFraction: 0,
  longestSilenceSec: 0.4,
  quietFraction: 0.05,
};

describe("the lossy gate, PRE-REGISTERED before any lossy audio existed (E4/S4/S2)", () => {
  it("a healthy lossy clip passes, gated in kbps", () => {
    const r = gradeStaircaseClip(lossy);
    expect(r.verdict).toBe("PASS");
    expect(r.gatedOn).toBe("kbps-floor + fitness");
  });

  it("its floor is the window's own transparency anchor, not the level", () => {
    // The level is a bitrate, exact by construction, so it could never fail a
    // check. What is checked is the damage the clip actually did.
    expect(gateFor("lossy-artifact")).toHaveProperty("anchorFloorRatio", 1.0);
    expect(gateFor("lossy-artifact")).not.toHaveProperty("floor");
  });

  it("damage below the window's transparent round-trip FLAGS", () => {
    const r = gradeStaircaseClip({ ...lossy, anchorRatio: 0.99 });
    expect(r.verdict).toBe("FLAG");
    expect(r.reasons[0]).toMatch(/smaller than a manipulation known to be inaudible/);
  });

  it("exactly AT the anchor passes — that is the 320k rung, by construction", () => {
    // The anchor IS a 320 kbps round-trip and the ladder's gentlest rung IS
    // 320 kbps, so it measures exactly 1.0x. Non-binding there on purpose.
    expect(gradeStaircaseClip({ ...lossy, level: 320, anchorRatio: 1.0 }).verdict).toBe("PASS");
  });

  it("a MISSING anchor is an ERROR — there is no floor to check without one", () => {
    const r = gradeStaircaseClip(without(lossy, "anchorRatio"));
    expect(r.verdict).toBe("ERROR");
    expect(r.reasons[0]).toMatch(/no transparency anchor/);
  });

  it("its floor sits far below the fixed assessment's fair-trial 3.0x", () => {
    // Same relationship as pitch's staircase 3 against its fair-trial 10: a
    // staircase converging toward a threshold must be allowed below it.
    expect(gateFor("lossy-artifact")).toHaveProperty("anchorFloorRatio");
    expect((gateFor("lossy-artifact") as { anchorFloorRatio: number }).anchorFloorRatio).toBeLessThan(3.0);
  });

  it("has NO confidence check, because LSD has no confidence measure", () => {
    // A declared absence, not a skipped test.
    expect((gateFor("lossy-artifact") as { minConfidentFraction: number | null }).minConfidentFraction).toBeNull();
    // A lossy row carrying no confidentFraction at all still passes...
    expect(gradeStaircaseClip(without(lossy, "confidentFraction")).verdict).toBe("PASS");
    // ...while a PITCH row missing it does not. The absence is family-specific.
    expect(gradeStaircaseClip(without(pitch, "confidentFraction")).verdict).toBe("FLAG");
  });

  it("needs no evidence field — its floor already IS an audio measurement", () => {
    expect(gateFor("lossy-artifact")).not.toHaveProperty("evidenceField");
  });

  it("the fitness gates still apply to lossy", () => {
    expect(gradeStaircaseClip({ ...lossy, longestSilenceSec: 9 }).verdict).toBe("FLAG");
    expect(gradeStaircaseClip({ ...lossy, quietFraction: 0.9 }).verdict).toBe("FLAG");
  });
});

describe("lossyStepCollapses — the check RT-85a's measurement makes necessary", () => {
  // lossyLadderForSource thins the ladder against a curve measured on ONE
  // window. A fixed bitrate does 1.38x different damage across pb1's nine
  // windows, so two levels comfortably apart at @75s can collapse elsewhere.
  it("a well-separated ladder reports nothing", () => {
    const rows = [
      { level: 320, lsdDb: 0.43 },
      { level: 128, lsdDb: 1.94 },
      { level: 64, lsdDb: 6.88 },
      { level: 32, lsdDb: 12.39 },
    ];
    expect(lossyStepCollapses(rows)).toEqual([]);
  });

  it("adjacent levels too close in dB are reported, ordered by DAMAGE not bitrate", () => {
    const rows = [
      { level: 128, lsdDb: 1.5 },
      { level: 112, lsdDb: 1.6 }, // 1.067x — collapsed
      { level: 64, lsdDb: 6.0 },
    ];
    const c = lossyStepCollapses(rows);
    expect(c).toHaveLength(1);
    expect(c[0].from).toBe(128);
    expect(c[0].to).toBe(112);
    expect(c[0].ratio).toBeLessThan(MIN_LOSSY_LEVEL_RATIO);
  });

  it("exactly at MIN_LOSSY_LEVEL_RATIO is NOT a collapse", () => {
    const rows = [
      { level: 128, lsdDb: 1.0 },
      { level: 112, lsdDb: MIN_LOSSY_LEVEL_RATIO },
    ];
    expect(lossyStepCollapses(rows)).toEqual([]);
  });

  it("it sorts by damage, so input order does not matter — THE INVERTED AXIS", () => {
    const rows = [
      { level: 64, lsdDb: 6.0 },
      { level: 320, lsdDb: 0.5 },
      { level: 128, lsdDb: 1.9 },
    ];
    expect(lossyStepCollapses(rows)).toEqual(lossyStepCollapses([...rows].reverse()));
  });

  it("clips with no dB figure are excluded rather than treated as zero", () => {
    const rows = [{ level: 320, lsdDb: 0.5 }, { level: 128 }, { level: 64, lsdDb: 6.0 }];
    expect(lossyStepCollapses(rows)).toEqual([]);
  });
});
