import { describe, expect, it } from "vitest";
import {
  MIN_ASSERTED_PAIRS,
  MIN_TRIALS_PER_FAMILY_FOR_CONTRAST,
  SHARED_AXIS_FAMILIES,
  biasClaim,
  comparisonDegreesClaim,
  comparisonStabilityClaim,
  delicacyClaim,
  delicacyFamilyClaim,
  familyContrastClaim,
  sharedAxisClaim,
  thresholdClaim,
} from "./evidence";
import { DEGRADATION_FAMILIES, computeDelicacyResult, type DelicacyItemSpec } from "./delicacy";
import { MEASURED_TRIALS } from "@/content/delicacy/items";
import type { BiasItemSpec, BiasRatings, BiasResult } from "./bias";
import { BIAS_CLIPS } from "@/content/bias/items";
import { computeComparisonResult } from "./comparison";
import {
  answer,
  axisFor,
  isFinished,
  nextTrial,
  sessionResult,
  startSession,
  type StaircaseResult,
} from "./staircase-session";
import { eligibleSources } from "./staircase-pool";
import { observer, pCorrect, rng } from "@/analytics/observer";

/* ------------------------------------------------------------------ *
 * The derivation behind MIN_TRIALS_PER_FAMILY_FOR_CONTRAST
 * ------------------------------------------------------------------ */

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const draw = (rnd: () => number, ps: number[], n: number): number[] =>
  ps.map((p) => {
    let k = 0;
    for (let t = 0; t < n; t++) if (rnd() < p) k++;
    return k;
  });

/** The smallest gap whose false-positive rate stays <= 5% on the worst-case even ear. */
function safeGap(n: number, iterations: number): { gap: number; fp: number } | null {
  const nulls = [0.55, 0.65, 0.75, 0.85, 0.95];
  for (let gap = 1; gap <= n; gap++) {
    let worst = 0;
    for (const p of nulls) {
      const rnd = mulberry(1000 + n * 31 + gap);
      let hit = 0;
      for (let i = 0; i < iterations; i++) {
        const c = draw(rnd, [p, p, p], n);
        if (Math.max(...c) - Math.min(...c) >= gap) hit++;
      }
      worst = Math.max(worst, hit / iterations);
    }
    if (worst <= 0.05) return { gap, fp: worst };
  }
  return null;
}

/** How often that rule fires on a genuinely uneven ear, and names the right pair. */
function power(n: number, gap: number, iterations: number): { fired: number; rightPair: number } {
  const rnd = mulberry(77 + n);
  let fired = 0;
  let right = 0;
  for (let i = 0; i < iterations; i++) {
    const c = draw(rnd, [0.9, 0.75, 0.6], n);
    if (Math.max(...c) - Math.min(...c) >= gap) {
      fired++;
      if (c.indexOf(Math.max(...c)) === 0 && c.indexOf(Math.min(...c)) === 2) right++;
    }
  }
  return { fired: fired / iterations, rightPair: fired ? right / fired : 0 };
}

describe("MIN_TRIALS_PER_FAMILY_FOR_CONTRAST is re-derived, not asserted", () => {
  const ITER = 8000;

  /**
   * SIMULATED (N3). This is arithmetic about binomial counts, not a claim about
   * any listener. It exists so the constant in evidence.ts can be checked
   * rather than believed.
   */
  it("at the SHIPPED five trials a family, no usable rule exists", () => {
    const safe = safeGap(5, ITER);
    expect(safe).not.toBeNull();
    const { fired } = power(5, safe!.gap, ITER);
    // The only safe rule at n=5 demands a perfect-vs-nothing split.
    expect(safe!.gap).toBe(5);
    // And it essentially never fires, even on a clearly uneven ear.
    expect(fired).toBeLessThan(0.03);
  });

  it("the chosen floor is the first count where the rule catches more than it misses", () => {
    const safe = safeGap(MIN_TRIALS_PER_FAMILY_FOR_CONTRAST, ITER);
    expect(safe).not.toBeNull();
    expect(safe!.fp).toBeLessThanOrEqual(0.05);
    const { fired, rightPair } = power(MIN_TRIALS_PER_FAMILY_FOR_CONTRAST, safe!.gap, ITER);
    expect(fired).toBeGreaterThan(0.5);
    expect(rightPair).toBeGreaterThan(0.85);
  });

  it("and the count just below it does NOT clear that bar", () => {
    const n = 30;
    const safe = safeGap(n, ITER);
    expect(safe).not.toBeNull();
    expect(power(n, safe!.gap, ITER).fired).toBeLessThan(0.5);
  });
});

/* ------------------------------------------------------------------ *
 * The shipped pool, against that floor
 * ------------------------------------------------------------------ */

const perfect = (items: DelicacyItemSpec[]) =>
  computeDelicacyResult(
    "t",
    items,
    Object.fromEntries(
      items.map((i) => [i.id, { pickedSide: i.originalSide, flawPick: i.family, confidence: 95 as const }]),
    ),
  );

describe("familyContrastClaim — the refusal that ships", () => {
  it("refuses on the REAL shipped pool, which presents five trials a family", () => {
    const items: DelicacyItemSpec[] = MEASURED_TRIALS.map((t) => ({
      id: t.id,
      family: t.family,
      magnitude: t.magnitude,
      originalSide: t.originalSide,
    }));
    const result = perfect(items);
    for (const f of DEGRADATION_FAMILIES) expect(result.byFamily[f].n).toBe(5);
    expect(familyContrastClaim(result)).toEqual({ ok: false, gap: "contrast-below-noise" });
  });

  /**
   * THE BOUNDARY, both ways. The refusal is a function of the observed counts,
   * so growing the pool must change the answer with nothing else edited.
   */
  it("still refuses one trial short of the floor, and allows it exactly at the floor", () => {
    const build = (perFamily: number): DelicacyItemSpec[] =>
      DEGRADATION_FAMILIES.flatMap((family) =>
        Array.from({ length: perFamily }, (_, k) => ({
          id: `${family}-${k}`,
          family,
          magnitude: 2 as const,
          originalSide: (k % 2 === 0 ? "a" : "b") as "a" | "b",
        })),
      );
    const below = familyContrastClaim(perfect(build(MIN_TRIALS_PER_FAMILY_FOR_CONTRAST - 1)));
    expect(below).toEqual({ ok: false, gap: "contrast-below-noise" });
    const at = familyContrastClaim(perfect(build(MIN_TRIALS_PER_FAMILY_FOR_CONTRAST)));
    expect(at).toEqual({ ok: true, value: { perFamily: 40, requiredGap: 11 } });
    expect(at.ok).toBe(true);
  });

  it("refuses when only ONE family is short — the floor is the weakest family", () => {
    const items: DelicacyItemSpec[] = [
      ...Array.from({ length: MIN_TRIALS_PER_FAMILY_FOR_CONTRAST }, (_, k) => ({
        id: `p${k}`,
        family: "pitch-drift" as const,
        magnitude: 2 as const,
        originalSide: "a" as const,
      })),
      ...Array.from({ length: MIN_TRIALS_PER_FAMILY_FOR_CONTRAST }, (_, k) => ({
        id: `t${k}`,
        family: "timing-smear" as const,
        magnitude: 2 as const,
        originalSide: "a" as const,
      })),
      ...Array.from({ length: MIN_TRIALS_PER_FAMILY_FOR_CONTRAST - 1 }, (_, k) => ({
        id: `l${k}`,
        family: "lossy-artifact" as const,
        magnitude: 2 as const,
        originalSide: "a" as const,
      })),
    ];
    expect(familyContrastClaim(perfect(items))).toEqual({ ok: false, gap: "contrast-below-noise" });
  });
});

/* ------------------------------------------------------------------ *
 * Per-instrument floors
 * ------------------------------------------------------------------ */

describe("delicacyClaim / delicacyFamilyClaim", () => {
  const items: DelicacyItemSpec[] = [
    { id: "a", family: "pitch-drift", magnitude: 2, originalSide: "a" },
    { id: "b", family: "pitch-drift", magnitude: 3, originalSide: "b" },
  ];

  it("reports a session that scored trials", () => {
    const claim = delicacyClaim(perfect(items));
    expect(claim).toEqual({
      ok: true,
      value: { nTrials: 2, nCorrect: 2, accuracy: 1, flawAccuracy: 1, flawEligible: 2, flawCorrect: 2 },
    });
  });

  it("carries flawAccuracy as null rather than 0 when nothing was eligible (N3)", () => {
    // Every pick wrong -> no correct pick -> the flaw stat has no denominator.
    const wrong = computeDelicacyResult(
      "t",
      items,
      Object.fromEntries(
        items.map((i) => [
          i.id,
          { pickedSide: (i.originalSide === "a" ? "b" : "a") as "a" | "b", flawPick: i.family, confidence: 95 as const },
        ]),
      ),
    );
    const claim = delicacyClaim(wrong);
    expect(claim.ok).toBe(true);
    expect(claim.ok && claim.value.flawAccuracy).toBeNull();
    expect(claim.ok && claim.value.flawEligible).toBe(0);
  });

  it("names a family that was measured, and refuses one that was not", () => {
    const result = perfect(items);
    expect(delicacyFamilyClaim(result, "pitch-drift")).toEqual({
      ok: true,
      value: { family: "pitch-drift", n: 2, correct: 2 },
    });
    expect(delicacyFamilyClaim(result, "timing-smear")).toEqual({
      ok: false,
      gap: "family-not-measured",
    });
  });
});

describe("biasClaim", () => {
  /**
   * Typed as `BiasResult` WITHOUT a cast, on purpose. An `as unknown as` here
   * would let the engine's result shape change underneath this test without a
   * word from the compiler, which is the failure it is supposed to catch.
   */
  const base: Omit<BiasResult, "swayShare" | "movableCount" | "movedCount"> = {
    hash: "h",
    meanShiftPts: 4,
    rawPct: 8,
    pct: 7,
    adjustedMeanShiftPts: 3.5,
    controlDriftPts: 0.5,
    controlCount: 2,
    controlReceipts: [],
    verdict: "swayed",
    receipts: [],
    swappedIds: [],
    edgeCount: 0,
    swappedMeanShiftPts: null,
    swappedPct: null,
  };

  it("reports sway when at least one item could move", () => {
    const claim = biasClaim({ ...base, swayShare: 0.75, movableCount: 8, movedCount: 6 });
    expect(claim).toEqual({
      ok: true,
      value: { pct: 7, swayShare: 0.75, movableCount: 8, movedCount: 6 },
    });
  });

  it("refuses when every item sat at the edge of the scale", () => {
    expect(biasClaim({ ...base, swayShare: null, movableCount: 0, movedCount: 0 })).toEqual({
      ok: false,
      gap: "no-movable-items",
    });
  });
});

describe("thresholdClaim", () => {
  /**
   * REAL SESSIONS, not hand-written result objects — the same construction the
   * copy deck's fixtures use (`src/content/staircase/fixtures.ts`). A floor
   * tested against shapes I invented would only prove I can invent shapes; this
   * tests it against what the engine actually emits, including the outcome
   * kinds that are RARE (the fitter declines to interpolate on most timing and
   * lossy sessions) and the unstarted session nobody would think to write for.
   */
  function realResults(): StaircaseResult[] {
    const ladders: Array<{ family: string; sourceId?: string }> = [
      { family: "pitch-drift" },
      { family: "timing-smear" },
      ...eligibleSources("lossy-artifact").map((sourceId) => ({ family: "lossy-artifact", sourceId })),
    ];
    const out: StaircaseResult[] = [];
    for (const { family, sourceId } of ladders) {
      const axis = axisFor(family, sourceId);
      const mid = axis.magnitudes[axis.magnitudes.length >> 1];
      for (const alpha of [mid, axis.magnitudes[0] / 4, axis.magnitudes.at(-1)! * 4]) {
        for (const seed of [7919, 15838, 23757]) {
          const o = observer(alpha, 0.35, 0.02);
          let s = startSession(family, seed, sourceId);
          const rand = rng(seed ^ 0x5bf03635);
          while (!isFinished(s)) {
            const t = nextTrial(s);
            s = answer(s, rand() < pCorrect(s.axis.magnitudes[t.levelIndex], o));
          }
          out.push(sessionResult(s));
        }
      }
      // An abandoned session — the branch reachable only by walking away.
      out.push(sessionResult(startSession(family, 1, sourceId)));
    }
    return out;
  }

  const results = realResults();

  it("covers more than one outcome kind, so the branches below are exercised", () => {
    const kinds = new Set(results.map((r) => r.kind));
    expect(kinds.size).toBeGreaterThan(1);
    // The abandoned sessions must be in there, or the refusal is never tested.
    expect(results.some((r) => r.band.heardAt === null && r.band.missedAt === null)).toBe(true);
  });

  it("speaks whenever a rung was resolved, and never otherwise", () => {
    for (const result of results) {
      const claim = thresholdClaim(result);
      const resolved = result.band.heardAt !== null || result.band.missedAt !== null;
      expect(claim.ok).toBe(resolved);
      if (!claim.ok) expect(claim.gap).toBe("no-rung-resolved");
    }
  });

  it("offers a point estimate ONLY on a converged session", () => {
    for (const result of results) {
      const claim = thresholdClaim(result);
      if (!claim.ok) continue;
      if (result.kind === "threshold") {
        expect(claim.value.point).toBe(result.label);
        expect(claim.value.ci95).toEqual(result.ci95);
      } else {
        expect(claim.value.point).toBeNull();
        expect(claim.value.ci95).toBeNull();
      }
    }
  });

  /**
   * THE BLIND SPOT, ASSERTED (the pattern this repo already uses for the
   * speech-detector gate). A result page recomputes from `?r=<answers>` in the
   * URL, so a TRUNCATED answer string reaches `sessionResult` as an unfinished
   * session — and the engine's own docblock warns that a half-finished session
   * can read as a finding about the listener.
   *
   * MEASURED: across three families x two ear placements x four seeds, at 10,
   * 15, 20, 25, 30, 35, 40 and 50 answered trials, an unfinished session
   * resolved a band edge ZERO times out of 168. The posterior is never tight
   * enough for a rung to fall entirely outside it before the session ends.
   *
   * So the band floor already closes this door, and this test is what keeps it
   * closed: if `BAND_TAIL` is ever widened, an unfinished session starts
   * speaking and this fails rather than shipping a sentence built on 12 trials.
   */
  it("never speaks for an unfinished session, at any length", () => {
    for (const family of ["pitch-drift", "timing-smear"]) {
      for (const alpha of [axisFor(family).magnitudes[3], axisFor(family).magnitudes[0] / 4]) {
        for (const seed of [11, 22, 33, 44]) {
          for (const stopAfter of [10, 20, 30, 40, 50]) {
            let s = startSession(family, seed);
            const o = observer(alpha, 0.35, 0.02);
            const rand = rng(seed);
            for (let i = 0; i < stopAfter && !isFinished(s); i++) {
              const t = nextTrial(s);
              s = answer(s, rand() < pCorrect(s.axis.magnitudes[t.levelIndex], o));
            }
            if (isFinished(s)) continue;
            expect(thresholdClaim(sessionResult(s)).ok).toBe(false);
          }
        }
      }
    }
  });

  it("refuses a session that resolved no rung at all", () => {
    const empty = {
      family: "pitch-drift",
      unit: "cents of peak detune",
      direction: "up",
      trials: 3,
      gentlest: 3.1,
      harshest: 100,
      limits: [],
      cohortN: 0,
      kind: "inconclusive",
      reversalsUsed: 0,
      band: { rungs: [], heardAt: null, missedAt: null, heardIndex: null, missedIndex: null },
    } as unknown as StaircaseResult;
    expect(thresholdClaim(empty)).toEqual({ ok: false, gap: "no-rung-resolved" });
  });
});

describe("sharedAxisClaim", () => {
  it("admits the two families both instruments measure in the same quantity", () => {
    expect(sharedAxisClaim("pitch-drift").ok).toBe(true);
    expect(sharedAxisClaim("lossy-artifact").ok).toBe(true);
  });

  it("refuses timing, whose two instruments measure different quantities", () => {
    expect(sharedAxisClaim("timing-smear")).toEqual({ ok: false, gap: "no-shared-axis" });
  });

  it("never admits a family the delicacy pool does not contain", () => {
    for (const f of SHARED_AXIS_FAMILIES) expect(DEGRADATION_FAMILIES).toContain(f);
  });
});

describe("comparison — the floors under Hume's fifth criterion", () => {
  const wide: BiasRatings = Object.fromEntries(
    BIAS_CLIPS.map((c, i) => [c.id, [1, 8, 3, 10, 5, 0, 7, 2, 9, 4, 6, 1, 8, 3, 10, 5][i]]),
  );
  const compressed: BiasRatings = Object.fromEntries(
    BIAS_CLIPS.map((c, i) => [c.id, i % 2 === 0 ? 6 : 7]),
  );

  it("lets the degrees claim speak on the pool that actually ships", () => {
    const claim = comparisonDegreesClaim(computeComparisonResult(BIAS_CLIPS, wide, wide));
    expect(claim.ok).toBe(true);
    if (!claim.ok) return;
    expect(claim.value.degreesUsed).toBe(11);
    expect(claim.value.degreesIfIndifferent).toBeLessThan(claim.value.degreesAvailable);
  });

  it("refuses the degrees claim when there are fewer clips than degrees", () => {
    /* Eight clips on an eleven-point scale: "five of eleven" was never on offer. */
    const few = BIAS_CLIPS.slice(0, 8);
    expect(few.length).toBeLessThan(11);
    const ratings: BiasRatings = Object.fromEntries(few.map((c, i) => [c.id, i]));
    const claim = comparisonDegreesClaim(computeComparisonResult(few, ratings, ratings));
    expect(claim.ok).toBe(false);
    if (claim.ok) return;
    expect(claim.gap).toBe("too-few-clips-for-degrees");
  });

  it("REFUSES the stability claim for the compressed rater — on the real pool", () => {
    const result = computeComparisonResult(BIAS_CLIPS, compressed, compressed);
    // The reader whose degrees count is most striking is the one this refuses.
    expect(comparisonDegreesClaim(result).ok).toBe(true);
    expect(result.pairs.asserted).toBe(0);
    const claim = comparisonStabilityClaim(result);
    expect(claim.ok).toBe(false);
    if (claim.ok) return;
    expect(claim.gap).toBe("too-few-asserted-pairs");
  });

  it("lets the stability claim speak for a rater who separated things", () => {
    const claim = comparisonStabilityClaim(computeComparisonResult(BIAS_CLIPS, wide, wide));
    expect(claim.ok).toBe(true);
    if (!claim.ok) return;
    expect(claim.value.asserted).toBeGreaterThanOrEqual(MIN_ASSERTED_PAIRS);
    expect(claim.value.reversedShare).toBe(0);
  });

  it("sits exactly on the boundary: nine asserted pairs refused, ten allowed", () => {
    /*
     * Five items whose labels all push the same way, so every pair is eligible.
     * Ratings 0,2,4,6,8 separate all ten pairs; 0,1,4,6,8 leaves the first pair
     * one point apart, which the assertion floor drops, giving nine.
     */
    const five: BiasItemSpec[] = ["p1", "p2", "p3", "p4", "p5"].map((id) => ({
      id,
      labelDirection: "up",
      labelIsTrue: true,
    }));
    const rate = (v: number[]): BiasRatings =>
      Object.fromEntries(five.map((item, i) => [item.id, v[i]]));

    const ten = computeComparisonResult(five, rate([0, 2, 4, 6, 8]), rate([0, 2, 4, 6, 8]));
    const nine = computeComparisonResult(five, rate([0, 1, 4, 6, 8]), rate([0, 1, 4, 6, 8]));
    expect(ten.pairs.asserted).toBe(10);
    expect(nine.pairs.asserted).toBe(9);
    expect(MIN_ASSERTED_PAIRS).toBe(10);

    expect(comparisonStabilityClaim(ten).ok).toBe(true);
    const refused = comparisonStabilityClaim(nine);
    expect(refused.ok).toBe(false);
    if (refused.ok) return;
    expect(refused.gap).toBe("too-few-asserted-pairs");
  });
});
