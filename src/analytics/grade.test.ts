/**
 * S7 proof: the Layer B auto-flag (artifact pivot §1).
 *
 * Proven in BOTH directions on items whose true parameters are known — an
 * item built to be too easy must come back TOO_EASY, and one built to
 * discriminate must come back ACCEPT. Simulation is what makes that possible:
 * with real data nobody knows which verdict was correct.
 */

import { describe, expect, it } from "vitest";
import {
  ACCEPT_DISCRIMINATION_MIN,
  ACCEPT_P_MAX,
  ACCEPT_P_MIN,
  MIN_N_TO_GRADE,
  MIN_RELIABILITY_TO_JUDGE_DISCRIMINATION,
  estimateReliability,
  delicacyMatrix,
  estimateItems,
  gradeItem,
  gradeItems,
  type ItemStats,
} from "./estimate";
import { simulateDelicacy, simulatePersons, syntheticDelicacyItems } from "./simulate";

const stats = (over: Partial<ItemStats> = {}): ItemStats => ({
  id: "i1",
  n: 500,
  pValue: 0.7,
  discrimination: 0.4,
  discriminationCorrected: 0.4,
  ...over,
});

describe("Layer B auto-flag — verdicts", () => {
  it("accepts an item inside the band that discriminates", () => {
    const g = gradeItem(stats());
    expect(g.verdict).toBe("ACCEPT");
    expect(g.action).toBe("keep");
    expect(g.reasons).toEqual([]);
  });

  it("flags a too-easy item and says which way to move the ladder", () => {
    const g = gradeItem(stats({ pValue: ACCEPT_P_MAX + 0.05 }));
    expect(g.verdict).toBe("TOO_EASY");
    expect(g.action).toMatch(/increase degradation/);
  });

  it("flags a too-hard item and says which way to move the ladder", () => {
    const g = gradeItem(stats({ pValue: ACCEPT_P_MIN - 0.05 }));
    expect(g.verdict).toBe("TOO_HARD");
    expect(g.action).toMatch(/decrease degradation/);
  });

  it("retires a non-discriminating item even when its difficulty is perfect", () => {
    // The ordering that matters: an item bang in the middle of the band which
    // separates nobody is dead weight, and difficulty must not rescue it.
    const g = gradeItem(stats({ pValue: 0.7, discrimination: ACCEPT_DISCRIMINATION_MIN - 0.01, discriminationCorrected: ACCEPT_DISCRIMINATION_MIN - 0.01 }));
    expect(g.verdict).toBe("RETIRE");
  });

  it("retires an item with undefined discrimination (everyone answered alike)", () => {
    const g = gradeItem(stats({ discrimination: null, discriminationCorrected: null }));
    expect(g.verdict).toBe("RETIRE");
    expect(g.reasons.join()).toMatch(/undefined/);
  });

  it("band edges are inclusive — an item ON the boundary is accepted", () => {
    expect(gradeItem(stats({ pValue: ACCEPT_P_MIN })).verdict).toBe("ACCEPT");
    expect(gradeItem(stats({ pValue: ACCEPT_P_MAX })).verdict).toBe("ACCEPT");
    expect(gradeItem(stats({ discrimination: ACCEPT_DISCRIMINATION_MIN, discriminationCorrected: ACCEPT_DISCRIMINATION_MIN })).verdict).toBe("ACCEPT");
  });
});

describe("Layer B auto-flag — it stays SILENT without evidence (N3)", () => {
  it("an unfielded item is PENDING, never ACCEPT", () => {
    // The single most important property. The live pool has n = 0, and a gate
    // that reported ACCEPT there would be manufacturing a verdict out of
    // nothing — precisely the fabrication the pivot replaced the ear pass to
    // avoid.
    const g = gradeItem(stats({ n: 0, pValue: 0, discrimination: null, discriminationCorrected: null }));
    expect(g.verdict).toBe("PENDING");
    expect(g.pValue).toBeNull();
    expect(g.pStandardError).toBeNull();
    expect(g.action).toMatch(/collect responses/);
  });

  it("stays PENDING right up to the evidence threshold", () => {
    expect(gradeItem(stats({ n: MIN_N_TO_GRADE - 1 })).verdict).toBe("PENDING");
    expect(gradeItem(stats({ n: MIN_N_TO_GRADE })).verdict).toBe("ACCEPT");
  });

  it("PENDING outranks every other fault — an unfielded item is not RETIRED", () => {
    // A bad-looking statistic on 5 responses is noise, and retiring an item on
    // it would destroy a good item permanently.
    const g = gradeItem(stats({ n: 5, pValue: 0.99, discrimination: 0.01, discriminationCorrected: 0.01 }));
    expect(g.verdict).toBe("PENDING");
  });

  it("reports the standard error so a verdict can be read with its precision", () => {
    const g = gradeItem(stats({ n: 100, pValue: 0.7 }));
    expect(g.pStandardError!).toBeCloseTo(Math.sqrt((0.7 * 0.3) / 100), 12);
  });
});

describe("Layer B auto-flag — recovers verdicts from KNOWN item parameters", () => {
  /** Build a bank with one item deliberately at each pathology. */
  const bank = syntheticDelicacyItems(300, 40);
  const doctored = bank.map((item, i) => {
    if (i === 0) return { ...item, a: 1.2, b: -3 };   // far too easy (but not literally everyone)
    if (i === 1) return { ...item, a: 1.2, b: 3.5 };  // far too hard
    if (i === 2) return { ...item, a: 0.001 };       // separates nobody
    return item;
  });

  const persons = simulatePersons(301, 800);
  const data = simulateDelicacy(301, doctored, persons);
  const matrix = delicacyMatrix("SIMULATED", doctored, data.responses);
  const reliability = estimateReliability(matrix).alpha;
  const report = gradeItems(estimateItems(matrix), reliability);
  const by = (i: number) => report.grades[i];

  it("catches the item built to be too easy", () => {
    console.log(
      `[grade] planted-easy item: p = ${by(0).pValue!.toFixed(2)} → ${by(0).verdict} (${by(0).action})`,
    );
    expect(by(0).verdict).toBe("TOO_EASY");
  });

  it("catches the item built to be too hard", () => {
    console.log(
      `[grade] planted-hard item: p = ${by(1).pValue!.toFixed(2)} → ${by(1).verdict} (${by(1).action})`,
    );
    expect(by(1).verdict).toBe("TOO_HARD");
  });

  it("reports the reliability the discrimination verdicts rest on", () => {
    console.log(`[grade] bank of ${doctored.length} items, alpha = ${reliability!.toFixed(3)} (floor to judge discrimination: ${MIN_RELIABILITY_TO_JUDGE_DISCRIMINATION})`);
    expect(reliability!).toBeGreaterThan(MIN_RELIABILITY_TO_JUDGE_DISCRIMINATION);
  });

  it("catches the item built to discriminate nobody", () => {
    console.log(
      `[grade] planted-flat item: discrimination = ${by(2).discrimination?.toFixed(2)} → ${by(2).verdict}`,
    );
    expect(by(2).verdict).toBe("RETIRE");
  });

  it("the attenuation correction stops the floor condemning healthy items (RT-21a)", () => {
    const healthy = report.grades.slice(3);
    const accepted = healthy.filter((g) => g.verdict === "ACCEPT").length;
    console.log(
      `[grade] summary over ${report.grades.length} items: ` +
        Object.entries(report.summary)
          .filter(([, v]) => v > 0)
          .map(([k, v]) => `${k}=${v}`)
          .join(" "),
    );
    // Before the correction this same bank graded ACCEPT=9 RETIRE=24 and the
    // report carried a warning that the §1 floor of 0.20 was unreachable. The
    // raw point-biserial was being dragged down by the unreliability of the
    // rest-score it is measured against, not by the items.
    const raw = report.grades.filter((g) => g.discrimination !== null);
    const lifted = raw.filter((g) => g.discriminationCorrected! > g.discrimination!).length;
    console.log(
      `[grade] attenuation correction lifted ${lifted}/${raw.length} items; ` +
        `ACCEPT ${report.summary.ACCEPT}, RETIRE ${report.summary.RETIRE} (was 9 / 24 uncorrected)`,
    );
    expect(accepted).toBeGreaterThan(0);
    expect(lifted).toBe(raw.length); // the correction can only raise a positive r
    expect(report.summary.ACCEPT).toBeGreaterThan(report.summary.RETIRE);
    // …and with the correction in place, the "threshold is unreachable"
    // warning must no longer fire on a healthy bank.
    expect(report.warning).toBeNull();
  });

  it("still WARNS when the retire rate is implausible for other reasons", () => {
    const dire = gradeItems(
      {
        dataSource: "SIMULATED",
        nPersons: 500,
        items: Array.from({ length: 10 }, (_, i) =>
          stats({ id: `d${i}`, discrimination: 0.05, discriminationCorrected: 0.05 }),
        ),
      },
      0.8,
    );
    expect(dire.summary.RETIRE).toBe(10);
    expect(dire.warning).toContain("unreachable for a test of this length");
  });

  it("stays silent when the retire rate is plausible", () => {
    const clean = gradeItems(
      { dataSource: "SIMULATED", nPersons: 500, items: [stats({ id: "a" }), stats({ id: "b" })] },
      0.8,
    );
    expect(clean.summary.ACCEPT).toBe(2);
    expect(clean.warning).toBeNull();
  });

  it("propagates the data source into the grade report (N3)", () => {
    expect(report.dataSource).toBe("SIMULATED");
    expect(report.summary.ACCEPT + report.summary.TOO_EASY + report.summary.TOO_HARD + report.summary.RETIRE + report.summary.PENDING).toBe(
      report.grades.length,
    );
  });
});
