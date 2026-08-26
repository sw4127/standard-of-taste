import { describe, expect, it } from "vitest";
import { RUNG_VALUE, replicationCheck } from "./replication";
import { SHARED_AXIS_FAMILIES } from "./evidence";
import { DELICACY_INSTRUMENT_ID, MEASURED_TRIALS } from "@/content/delicacy/items";
import { computeDelicacyResult, type DelicacyResponses } from "./delicacy";
import {
  answer,
  axisFor,
  isFinished,
  nextTrial,
  sessionResult,
  startSession,
  type StaircaseResult,
} from "./staircase-session";
import { observer, pCorrect, rng } from "@/analytics/observer";

/**
 * The rung values are read from the manifest, so this asserts the MAPPING is
 * what the pipeline actually rendered rather than what I remember it being.
 * If a re-render moves a rung, this fails instead of the copy quietly shifting.
 */
describe("RUNG_VALUE comes from the manifest", () => {
  it("matches the shipped delicacy rungs, including the parsed bitrates", () => {
    expect(RUNG_VALUE["pitch-drift/2"]).toBe(25);
    expect(RUNG_VALUE["pitch-drift/3"]).toBe(50);
    expect(RUNG_VALUE["pitch-drift/4"]).toBe(100);
    expect(RUNG_VALUE["lossy-artifact/2"]).toBe(96);
    expect(RUNG_VALUE["lossy-artifact/3"]).toBe(64);
    expect(RUNG_VALUE["lossy-artifact/4"]).toBe(32);
  });

  /** Every shared-axis rung must land on a real staircase level, or the two
   *  instruments are not measuring the same thing after all. */
  it("every shared-axis rung is an actual level on that family's ladder", () => {
    for (const family of SHARED_AXIS_FAMILIES) {
      const axis = family === "lossy-artifact" ? axisFor(family, "pb1") : axisFor(family);
      for (const mag of [2, 3, 4]) {
        const value = RUNG_VALUE[`${family}/${mag}`];
        expect(axis.labels, `${family}/${mag}`).toContain(value);
      }
    }
  });
});

function delicacy(pick: (family: string, magnitude: number) => boolean) {
  const responses: DelicacyResponses = {};
  for (const t of MEASURED_TRIALS) {
    const ok = pick(t.family, t.magnitude);
    responses[t.id] = {
      pickedSide: ok ? t.originalSide : t.originalSide === "a" ? "b" : "a",
      flawPick: t.family,
      confidence: 70,
    };
  }
  return computeDelicacyResult(DELICACY_INSTRUMENT_ID, MEASURED_TRIALS, responses);
}

/**
 * `place` is a POSITION ON THE LADDER, not a raw alpha, and that is a fix.
 *
 * `observer` models a listener in MAGNITUDE space, which for lossy is 1/kbps —
 * roughly 0.006 to 0.03. The first version of this helper took an alpha and was
 * handed `150` as "sharp on kbps", which is a magnitude far past the ceiling:
 * it produced a listener who detects nothing, and the direction test failed for
 * a reason that had nothing to do with direction. Deriving the alpha from the
 * family's own magnitudes means no caller has to know which space it is in, or
 * which way the family runs.
 *
 *   place 0 = far sharper than the ladder's gentlest rung
 *   place 1 = far duller than its harshest
 */
function threshold(family: string, place: number, seed = 7919, sourceId?: string): StaircaseResult {
  const mags = axisFor(family, sourceId).magnitudes;
  const lo = Math.log(mags[0] / 4);
  const hi = Math.log(mags[mags.length - 1] * 4);
  const alpha = Math.exp(lo + (hi - lo) * place);
  const o = observer(alpha, 0.35, 0.02);
  let s = startSession(family, seed, sourceId);
  const rand = rng(seed ^ 0x5bf03635);
  while (!isFinished(s)) {
    const t = nextTrial(s);
    s = answer(s, rand() < pCorrect(s.axis.magnitudes[t.levelIndex], o));
  }
  return sessionResult(s);
}

describe("replicationCheck", () => {
  it("refuses a family the two instruments do not measure alike", () => {
    const d = delicacy(() => true);
    const t = threshold("timing-smear", 0.5);
    expect(replicationCheck("timing-smear", d, t)).toEqual({ ok: false, gap: "no-shared-axis" });
  });

  it("refuses when the threshold result is for a different family", () => {
    const d = delicacy(() => true);
    const t = threshold("pitch-drift", 0.5);
    expect(replicationCheck("lossy-artifact", d, t)).toEqual({ ok: false, gap: "no-shared-axis" });
  });

  /**
   * A LISTENER WHO CATCHES EVERYTHING IN BOTH SESSIONS AGREES WITH THEMSELVES.
   * The sharp observer's band sits at the gentle end, so every delicacy rung is
   * harsher than `heardAt` and predicted "catch" — and they caught them all.
   */
  it("reports full agreement for a listener sharp in both sittings", () => {
    const d = delicacy((f) => f === "pitch-drift");
    const t = threshold("pitch-drift", 0.0);
    const check = replicationCheck("pitch-drift", d, t);
    expect(check.ok).toBe(true);
    if (!check.ok) return;
    expect(check.value.disagree).toBe(0);
    expect(check.value.agree).toBeGreaterThan(0);
    expect(check.value.family).toBe("pitch-drift");
  });

  /**
   * THE INVERTED AXIS, WHICH IS WHERE A DIRECTION BUG WOULD SHOW. For lossy a
   * SMALLER number is harsher, so a check that compared magnitudes naively
   * would predict the exact opposite of the truth on every trial.
   */
  it("gets the lossy direction right rather than inverted", () => {
    const d = delicacy((f) => f === "lossy-artifact");
    const t = threshold("lossy-artifact", 0.0, 7919, "pb1");
    const check = replicationCheck("lossy-artifact", d, t);
    expect(check.ok).toBe(true);
    if (!check.ok) return;
    // A listener this sharp on kbps catches every delicacy rung, and the band
    // agrees. An inverted comparison would score all of these as disagreements.
    expect(check.value.agree).toBeGreaterThan(check.value.disagree);
    expect(check.value.crossMaterial).toBe(true);
  });

  it("counts disagreement when the two sittings tell different stories", () => {
    // Sharp on the staircase, but missed every delicacy pitch pair.
    const d = delicacy((f) => f !== "pitch-drift");
    const t = threshold("pitch-drift", 0.0);
    const check = replicationCheck("pitch-drift", d, t);
    expect(check.ok).toBe(true);
    if (!check.ok) return;
    expect(check.value.disagree).toBeGreaterThan(0);
    expect(check.value.agree).toBe(0);
  });

  /**
   * THE PROPERTY THAT KEEPS THIS HONEST: a band that predicts nothing cannot
   * earn agreement by staying silent. Unpredicted trials are counted apart and
   * the check refuses outright when nothing was predicted at all.
   */
  it("never scores an unpredicted trial as agreement", () => {
    const d = delicacy(() => true);
    for (const place of [0, 0.25, 0.5, 0.75, 1]) {
      const t = threshold("pitch-drift", place);
      const check = replicationCheck("pitch-drift", d, t);
      if (!check.ok) continue;
      const { agree, disagree, unpredicted, trials } = check.value;
      expect(agree + disagree + unpredicted).toBe(trials.length);
      expect(trials.filter((x) => x.predicted === null)).toHaveLength(unpredicted);
      expect(agree + disagree).toBeGreaterThan(0);
    }
  });

  it("refuses a session whose band resolved nothing", () => {
    const d = delicacy(() => true);
    const t = threshold("pitch-drift", 0.5);
    const blind: StaircaseResult = {
      ...t,
      band: { ...t.band, heardAt: null, missedAt: null, heardIndex: null, missedIndex: null },
    };
    expect(replicationCheck("pitch-drift", d, blind)).toEqual({ ok: false, gap: "no-rung-resolved" });
  });

  it("refuses when the delicacy session never presented the family", () => {
    const empty = computeDelicacyResult(
      DELICACY_INSTRUMENT_ID,
      MEASURED_TRIALS.filter((t) => t.family !== "pitch-drift").map((t) => ({
        id: t.id,
        family: t.family,
        magnitude: t.magnitude,
        originalSide: t.originalSide,
      })),
      Object.fromEntries(
        MEASURED_TRIALS.filter((t) => t.family !== "pitch-drift").map((t) => [
          t.id,
          { pickedSide: t.originalSide, flawPick: t.family, confidence: 70 as const },
        ]),
      ),
    );
    const t = threshold("pitch-drift", 0.5);
    expect(replicationCheck("pitch-drift", empty, t)).toEqual({
      ok: false,
      gap: "family-not-measured",
    });
  });
});
