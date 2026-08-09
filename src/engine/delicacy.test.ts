import { describe, expect, it } from "vitest";
import {
  DEGRADATION_FAMILIES,
  DELICACY_CHANCE,
  DELICACY_CONFIDENCE_LEVELS,
  FLAW_CHANCE,
  computeDelicacyResult,
  decodeDelicacyResponses,
  encodeDelicacyResponses,
  type DelicacyConfidence,
  type DelicacyItemSpec,
  type DelicacyResponses,
} from "./delicacy";

/**
 * Six-trial pool mirroring the approved session shape (PM ruling 2026-07-19:
 * 6 trials), magnitudes and families fully crossed, original sides mixed.
 */
const POOL: DelicacyItemSpec[] = [
  { id: "d1", family: "pitch-drift", magnitude: 1, originalSide: "a" },
  { id: "d2", family: "timing-smear", magnitude: 1, originalSide: "b" },
  { id: "d3", family: "lossy-artifact", magnitude: 2, originalSide: "a" },
  { id: "d4", family: "pitch-drift", magnitude: 2, originalSide: "b" },
  { id: "d5", family: "timing-smear", magnitude: 3, originalSide: "a" },
  { id: "d6", family: "lossy-artifact", magnitude: 3, originalSide: "b" },
];

const respond = (
  entries: Array<[string, "a" | "b", (typeof DEGRADATION_FAMILIES)[number], DelicacyConfidence]>,
): DelicacyResponses =>
  Object.fromEntries(
    entries.map(([id, pickedSide, flawPick, confidence]) => [id, { pickedSide, flawPick, confidence }]),
  );

describe("computeDelicacyResult — worked examples (hand-computed)", () => {
  /**
   * WORKED EXAMPLE 1 — the perfect run.
   * Every pick matches originalSide, every flawPick matches family.
   * By hand: nCorrect = 6/6 → accuracy 1. All 6 picks correct → flawEligible 6,
   * all flaw picks right → flawAccuracy 1. Each magnitude has exactly 2 trials
   * (d1/d2, d3/d4, d5/d6), each family exactly 2 (pd: d1/d4, ts: d2/d5,
   * la: d3/d6) — all fully correct. Confidence varies but must not matter.
   */
  it("perfect run: accuracy 1, flawAccuracy 1, every split fully correct", () => {
    const responses = respond([
      ["d1", "a", "pitch-drift", 95],
      ["d2", "b", "timing-smear", 70],
      ["d3", "a", "lossy-artifact", 50],
      ["d4", "b", "pitch-drift", 95],
      ["d5", "a", "timing-smear", 70],
      ["d6", "b", "lossy-artifact", 50],
    ]);
    const r = computeDelicacyResult("delicacy-v1", POOL, responses);
    expect(r.nTrials).toBe(6);
    expect(r.nCorrect).toBe(6);
    expect(r.accuracy).toBe(1);
    expect(r.flawEligible).toBe(6);
    expect(r.flawCorrect).toBe(6);
    expect(r.flawAccuracy).toBe(1);
    // Rung 4 exists since the S6 ladder; a pool using only rungs 1-3 tallies it at zero.
    expect(r.byMagnitude).toEqual({ 1: { n: 2, correct: 2 }, 2: { n: 2, correct: 2 }, 3: { n: 2, correct: 2 }, 4: { n: 0, correct: 0 } });
    expect(r.byFamily).toEqual({
      "pitch-drift": { n: 2, correct: 2 },
      "timing-smear": { n: 2, correct: 2 },
      "lossy-artifact": { n: 2, correct: 2 },
    });
  });

  /**
   * WORKED EXAMPLE 2 — every pick on the wrong side.
   * By hand: nCorrect 0 → accuracy 0. No correct picks → flawEligible 0, and
   * flawAccuracy must be null (no data is not 0% — N3), with every receipt's
   * flawCorrect null even where the flawPick HAPPENED to name the right family
   * (d1 below names pitch-drift, which is d1's true family).
   */
  it("all-wrong picks: accuracy 0, flaw stats null (not zero)", () => {
    const responses = respond([
      ["d1", "b", "pitch-drift", 95],
      ["d2", "a", "timing-smear", 95],
      ["d3", "b", "pitch-drift", 95],
      ["d4", "a", "lossy-artifact", 95],
      ["d5", "b", "lossy-artifact", 95],
      ["d6", "a", "timing-smear", 95],
    ]);
    const r = computeDelicacyResult("delicacy-v1", POOL, responses);
    expect(r.nCorrect).toBe(0);
    expect(r.accuracy).toBe(0);
    expect(r.flawEligible).toBe(0);
    expect(r.flawCorrect).toBe(0);
    expect(r.flawAccuracy).toBeNull();
    expect(r.receipts.every((rec) => rec.flawCorrect === null)).toBe(true);
  });

  /**
   * WORKED EXAMPLE 3 — the mixed run.
   * Picks: d1 ✓, d2 ✓, d3 ✓, d4 ✓, d5 ✗ (picked b, original a),
   * d6 ✗ (picked a, original b) → nCorrect 4, accuracy 4/6 = 0.6666….
   * Flaw picks on the 4 eligible: d1 pitch-drift ✓, d2 lossy-artifact ✗,
   * d3 lossy-artifact ✓, d4 timing-smear ✗ → flawEligible 4, flawCorrect 2,
   * flawAccuracy 0.5.
   * byMagnitude: m1 = d1✓ d2✓ → {2,2}; m2 = d3✓ d4✓ → {2,2};
   * m3 = d5✗ d6✗ → {2,0}.
   * byFamily: pd = d1✓ d4✓ → {2,2}; ts = d2✓ d5✗ → {2,1};
   * la = d3✓ d6✗ → {2,1}.
   */
  it("mixed run: accuracy 4/6, flawAccuracy 2/4, splits as hand-computed", () => {
    const responses = respond([
      ["d1", "a", "pitch-drift", 95],
      ["d2", "b", "lossy-artifact", 70],
      ["d3", "a", "lossy-artifact", 50],
      ["d4", "b", "timing-smear", 50],
      ["d5", "b", "pitch-drift", 70],
      ["d6", "a", "timing-smear", 95],
    ]);
    const r = computeDelicacyResult("delicacy-v1", POOL, responses);
    expect(r.nCorrect).toBe(4);
    expect(r.accuracy).toBeCloseTo(4 / 6, 12);
    expect(r.flawEligible).toBe(4);
    expect(r.flawCorrect).toBe(2);
    expect(r.flawAccuracy).toBe(0.5);
    expect(r.byMagnitude).toEqual({ 1: { n: 2, correct: 2 }, 2: { n: 2, correct: 2 }, 3: { n: 2, correct: 0 }, 4: { n: 0, correct: 0 } });
    expect(r.byFamily).toEqual({
      "pitch-drift": { n: 2, correct: 2 },
      "timing-smear": { n: 2, correct: 1 },
      "lossy-artifact": { n: 2, correct: 1 },
    });
    const d5 = r.receipts.find((rec) => rec.id === "d5")!;
    expect(d5.correct).toBe(false);
    expect(d5.flawCorrect).toBeNull();
  });

  it("hash is stable for identical input and differs when any pick changes", () => {
    const responses = respond([
      ["d1", "a", "pitch-drift", 95],
      ["d2", "b", "timing-smear", 70],
      ["d3", "a", "lossy-artifact", 50],
      ["d4", "b", "pitch-drift", 95],
      ["d5", "a", "timing-smear", 70],
      ["d6", "b", "lossy-artifact", 50],
    ]);
    const r1 = computeDelicacyResult("delicacy-v1", POOL, responses);
    const r2 = computeDelicacyResult("delicacy-v1", POOL, responses);
    expect(r1.hash).toBe(r2.hash);
    const changed = {
      ...responses,
      d1: { pickedSide: "b" as const, flawPick: "pitch-drift" as const, confidence: 95 as const },
    };
    expect(computeDelicacyResult("delicacy-v1", POOL, changed).hash).not.toBe(r1.hash);
  });

  it("chance constants anchor the copy: 2AFC 0.5, flaw 1/families", () => {
    expect(DELICACY_CHANCE).toBe(0.5);
    expect(FLAW_CHANCE).toBeCloseTo(1 / DEGRADATION_FAMILIES.length, 12);
  });
});

describe("confidence taps (S3) — never weight scoring, always ride the raw data", () => {
  const picks: Array<[string, "a" | "b", (typeof DEGRADATION_FAMILIES)[number]]> = [
    ["d1", "a", "pitch-drift"],
    ["d2", "b", "lossy-artifact"],
    ["d3", "a", "lossy-artifact"],
    ["d4", "b", "timing-smear"],
    ["d5", "b", "pitch-drift"],
    ["d6", "a", "timing-smear"],
  ];
  const withConfidence = (confs: DelicacyConfidence[]): DelicacyResponses =>
    respond(picks.map(([id, s, f], i) => [id, s, f, confs[i]]));

  /**
   * PRE-REGISTERED S3 PROOF: identical picks under EVERY confidence
   * permutation must produce identical scoring — accuracy, tallies, flaw
   * stats, receipts' correctness — with only the hash and the receipts'
   * confidence field differing (different raw observations, D6).
   */
  it("scoring is invariant under any assignment of confidence values", () => {
    const base = computeDelicacyResult("delicacy-v1", POOL, withConfidence([95, 95, 95, 95, 95, 95]));
    const assignments: DelicacyConfidence[][] = [
      [50, 50, 50, 50, 50, 50],
      [95, 70, 50, 95, 70, 50],
      [50, 70, 95, 50, 70, 95],
      [70, 70, 70, 70, 70, 70],
    ];
    for (const confs of assignments) {
      const r = computeDelicacyResult("delicacy-v1", POOL, withConfidence(confs));
      expect(r.nCorrect).toBe(base.nCorrect);
      expect(r.accuracy).toBe(base.accuracy);
      expect(r.byMagnitude).toEqual(base.byMagnitude);
      expect(r.byFamily).toEqual(base.byFamily);
      expect(r.flawEligible).toBe(base.flawEligible);
      expect(r.flawCorrect).toBe(base.flawCorrect);
      expect(r.flawAccuracy).toBe(base.flawAccuracy);
      expect(r.receipts.map((rec) => rec.correct)).toEqual(base.receipts.map((rec) => rec.correct));
      expect(r.receipts.map((rec) => rec.flawCorrect)).toEqual(base.receipts.map((rec) => rec.flawCorrect));
      // Different confidence IS different raw data — the hash must say so.
      expect(r.hash).not.toBe(base.hash);
    }
  });

  it("receipts carry confidence verbatim for the calibration step (S4)", () => {
    const r = computeDelicacyResult("delicacy-v1", POOL, withConfidence([95, 70, 50, 50, 70, 95]));
    expect(r.receipts.map((rec) => rec.confidence)).toEqual([95, 70, 50, 50, 70, 95]);
  });

  it("rejects a confidence level outside 95/70/50", () => {
    const bad = withConfidence([95, 70, 50, 50, 70, 95]);
    bad.d1 = { ...bad.d1, confidence: 80 as never };
    expect(() => computeDelicacyResult("delicacy-v1", POOL, bad)).toThrow(/confidence.*95\/70\/50.*80/);
  });

  it("levels constant matches the §28 convention", () => {
    expect(DELICACY_CONFIDENCE_LEVELS).toEqual([95, 70, 50]);
  });

  /**
   * The codec writes one leading digit per level; two levels sharing a digit
   * (e.g. 95 and 90) would make encode ambiguous and decode lossy. Guard the
   * precondition here so a future levels change fails loudly.
   */
  it("confidence levels have pairwise-distinct leading digits (codec precondition)", () => {
    const digits = DELICACY_CONFIDENCE_LEVELS.map((c) => String(c)[0]);
    expect(new Set(digits).size).toBe(digits.length);
  });
});

describe("computeDelicacyResult — input contract (throws are upstream bugs)", () => {
  const okResponses = respond([
    ["d1", "a", "pitch-drift", 95],
    ["d2", "b", "timing-smear", 70],
    ["d3", "a", "lossy-artifact", 50],
    ["d4", "b", "pitch-drift", 95],
    ["d5", "a", "timing-smear", 70],
    ["d6", "b", "lossy-artifact", 50],
  ]);

  it("rejects an empty pool", () => {
    expect(() => computeDelicacyResult("delicacy-v1", [], {})).toThrow(/empty/);
  });

  it("rejects duplicate item ids", () => {
    expect(() => computeDelicacyResult("delicacy-v1", [POOL[0], POOL[0]], okResponses)).toThrow(/duplicate/);
  });

  it("rejects a response for an unknown item", () => {
    const extra = {
      ...okResponses,
      ghost: { pickedSide: "a" as const, flawPick: "pitch-drift" as const, confidence: 95 as const },
    };
    expect(() => computeDelicacyResult("delicacy-v1", POOL, extra)).toThrow(/unknown item "ghost"/);
  });

  it("rejects a missing response", () => {
    const { d6: _drop, ...partial } = okResponses;
    expect(() => computeDelicacyResult("delicacy-v1", POOL, partial)).toThrow(/missing response for "d6"/);
  });

  it("rejects an invalid side and an invalid family", () => {
    const badSide = {
      ...okResponses,
      d1: { pickedSide: "c" as never, flawPick: "pitch-drift" as const, confidence: 95 as const },
    };
    expect(() => computeDelicacyResult("delicacy-v1", POOL, badSide)).toThrow(/pickedSide/);
    const badFlaw = {
      ...okResponses,
      d1: { pickedSide: "a" as const, flawPick: "reverb" as never, confidence: 95 as const },
    };
    expect(() => computeDelicacyResult("delicacy-v1", POOL, badFlaw)).toThrow(/flawPick/);
  });
});

describe("share codec — strict round-trip", () => {
  const responses = respond([
    ["d1", "a", "pitch-drift", 95],
    ["d2", "b", "lossy-artifact", 50],
    ["d3", "a", "lossy-artifact", 50],
    ["d4", "b", "timing-smear", 70],
    ["d5", "b", "pitch-drift", 95],
    ["d6", "a", "timing-smear", 70],
  ]);

  it("round-trips (confidence included) and the decoded result matches", () => {
    const csv = encodeDelicacyResponses(POOL, responses);
    expect(csv).toBe("a09,b25,a25,b17,b09,a17");
    const decoded = decodeDelicacyResponses(POOL, csv);
    expect(decoded).toEqual(responses);
    expect(computeDelicacyResult("delicacy-v1", POOL, decoded!).hash).toBe(
      computeDelicacyResult("delicacy-v1", POOL, responses).hash,
    );
  });

  it("throws a named error when encoding an incomplete response set", () => {
    const { d6: _drop, ...partial } = responses;
    expect(() => encodeDelicacyResponses(POOL, partial)).toThrow(/missing response for "d6"/);
  });

  /**
   * TRIPWIRE (versioning contract): tokens are positional, so decoding the
   * same payload against a reordered pool assigns picks to DIFFERENT items.
   * This is exactly why every consuming page must gate on pool version before
   * decoding — if this test ever "goes green" under reordering, the contract
   * comment in delicacy.ts is stale and the S5 gate is load-bearing no more.
   */
  it("reordering the pool changes what a payload means (version gate is mandatory)", () => {
    const csv = encodeDelicacyResponses(POOL, responses);
    const reordered = [...POOL].reverse();
    const decoded = decodeDelicacyResponses(reordered, csv);
    expect(decoded).not.toBeNull();
    expect(decoded).not.toEqual(responses); // same payload, different meaning
    expect(decoded!.d1).toEqual(responses.d6); // d1 now receives d6's token
  });

  it("returns null on any malformation (never throws, never guesses)", () => {
    for (const bad of [
      undefined, // absent param
      "", // empty
      "a09,b25,a25,b17,b09", // too short
      "a09,b25,a25,b17,b09,a17,a09", // too long
      "a09,b25,a25,b17,b09,c17", // bad side
      "a09,b25,a25,b17,b09,a97", // flaw index 9 has no family (regex passes, lookup fails)
      "a09,b25,a25,b17,b09,a18", // invalid confidence digit
      "a09,b25,a25,b17,b09,A17", // uppercase
      "a09,b25,a25,b17,b09,a17,", // trailing separator
      "a09;b25;a25;b17;b09;a17", // wrong separator
      "a09,b25,a25,b17,b09,a1", // truncated token (S2-era format, no confidence)
      "a0,b2,a2,b1,b0,a1", // the whole pre-confidence payload shape
    ]) {
      expect(decodeDelicacyResponses(POOL, bad as string | undefined)).toBeNull();
    }
  });

  it("rejects an in-range-looking token whose flaw index has no family", () => {
    // side ok, conf digit ok, but flaw index 9 → DEGRADATION_FAMILIES[9] is undefined
    expect(decodeDelicacyResponses(POOL, "a99,b25,a25,b17,b09,a17")).toBeNull();
  });
});
