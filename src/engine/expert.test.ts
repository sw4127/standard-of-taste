import { describe, expect, it } from "vitest";
import { biasExpert, delicacyExpert, spreadExpert, thresholdExpert } from "./expert";
import { SHARED_AXIS_FAMILIES } from "./evidence";
import { RUNG_VALUE } from "./replication";
import { DELICACY_INSTRUMENT_ID, MEASURED_TRIALS } from "@/content/delicacy/items";
import {
  computeDelicacyResult,
  DELICACY_CONFIDENCE_LEVELS,
  type DelicacyConfidence,
  type DelicacyResponses,
} from "./delicacy";
import { BRIER_COIN_FLIP, MIN_BIN_N } from "./calibration";
import { BIAS_CLIPS, BIAS_INSTRUMENT_ID } from "@/content/bias/items";
import { BIAS_SCALE_MAX, BIAS_SCALE_MIN, computeBiasResult } from "./bias";
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
import { computeSpreadResult } from "./spread";
import { SPREAD_POOL, TANNER_RANKING } from "@/content/spread/ranking";
import { observer, pCorrect, rng } from "@/analytics/observer";

/* ------------------------------------------------------------------ *
 * Real sessions through the real engines
 * ------------------------------------------------------------------ */

function thresholdFor(family: string, place: number, seed = 7919, sourceId?: string): StaircaseResult {
  const mags = axisFor(family, sourceId).magnitudes;
  const lo = Math.log(mags[0] / 4);
  const hi = Math.log(mags[mags.length - 1] * 4);
  const o = observer(Math.exp(lo + (hi - lo) * place), 0.35, 0.02);
  let s = startSession(family, seed, sourceId);
  const rand = rng(seed ^ 0x5bf03635);
  while (!isFinished(s)) {
    const t = nextTrial(s);
    s = answer(s, rand() < pCorrect(s.axis.magnitudes[t.levelIndex], o));
  }
  return sessionResult(s);
}

/**
 * THE POOL IS A STRICT 3-CYCLE — pitch, timing, lossy, repeating — so any
 * fixture keyed on `i % 3` ALIASES onto it exactly. The first draft used
 * `i % 3 !== 0` and produced "pitch-drift 0/5": every wrong answer landed on
 * one family, and a test that looked like it covered a mixed session actually
 * covered a degenerate one. Found by reading the printed payload.
 *
 * The mask below is written out so the spread is visible rather than emergent,
 * and `the fixture is not degenerate` below asserts it stays that way.
 */
const MIXED = [false, true, true, true, false, true, true, false, true, true, true, false, true, true, false];

function delicacyFor(pick: (i: number) => boolean, conf?: (i: number) => DelicacyConfidence) {
  const responses: DelicacyResponses = {};
  MEASURED_TRIALS.forEach((t, i) => {
    const ok = pick(i);
    responses[t.id] = {
      pickedSide: ok ? t.originalSide : t.originalSide === "a" ? "b" : "a",
      flawPick: t.family,
      confidence: conf ? conf(i) : ([95, 70, 50] as const)[i % 3],
    };
  });
  return computeDelicacyResult(DELICACY_INSTRUMENT_ID, MEASURED_TRIALS, responses);
}

/**
 * `controlDrift` is not decoration. The first fixture left controls unmoved, so
 * `rawPct` and `pct` came out identical (20 and 20) and the test asserting that
 * BOTH numbers travel would have passed if one were copied into the other. The
 * whole point of carrying the pre-correction number is that the correction is
 * visible, so the fixture has to make it visible.
 */
function biasFor(shift: number, controlDrift = 0) {
  const blind: Record<string, number> = {};
  const labeled: Record<string, number> = {};
  for (const item of BIAS_CLIPS) {
    blind[item.id] = 5;
    const toward = item.isControl ? controlDrift : item.labelDirection === "up" ? shift : -shift;
    labeled[item.id] = Math.max(BIAS_SCALE_MIN, Math.min(BIAS_SCALE_MAX, 5 + toward));
  }
  return computeBiasResult(BIAS_INSTRUMENT_ID, BIAS_CLIPS, blind, labeled);
}

const DELICACY = delicacyFor((i) => MIXED[i]);
const BIAS = biasFor(2, 1);
const THRESHOLDS = [
  thresholdFor("pitch-drift", 0.4),
  thresholdFor("timing-smear", 0.6),
  thresholdFor("lossy-artifact", 0.3, 7919, eligibleSources("lossy-artifact")[0]),
];

/**
 * TWO RANKING-TEST SITTINGS, AND THE SECOND ONE IS THE INTERESTING ONE.
 *
 * `SPREAD` is a full sitting with nothing set aside. `SPREAD_REFUSED` sets
 * aside `sp1`, which sits in three of the four widely-spaced pairs, so the
 * reading is refused for want of them — the case where both means are null and
 * the per-pair observations are the only thing the panel has to show.
 */
const spreadRatings = (values: number[]): Record<string, number> =>
  Object.fromEntries(SPREAD_POOL.map((item, i) => [item.id, values[i]]));

const SPREAD = computeSpreadResult(spreadRatings([9, 2, 7, 1, 8, 3]));
const SPREAD_REFUSED = computeSpreadResult(spreadRatings([9, 2, 7, 1, 8, 3]), ["sp1"]);

describe("the fixtures are not degenerate", () => {
  /**
   * A guard against the aliasing defect above recurring: every family must show
   * BOTH a hit and a miss, or the payload tests are weaker than they read.
   */
  it("every delicacy family has both a hit and a miss", () => {
    const d = delicacyExpert(DELICACY);
    for (const f of d.perFamily) {
      expect(f.correct, `${f.family} all wrong`).toBeGreaterThan(0);
      expect(f.correct, `${f.family} all right`).toBeLessThan(f.n);
    }
  });

  /**
   * THE CONTROL CORRECTION IS INERT ON THE SHIPPED POOL, AND THAT IS BY DESIGN.
   *
   * The first version of this test asserted `rawPct !== pct` on a fixture with
   * real control drift, and failed. The fixture was fine; the expectation was
   * wrong. RT-2a subtracts `d̄·(nUp − nDown)/n` — only the residual that the
   * direction balance leaves behind — and the pool ships SEVEN up-labelled and
   * SEVEN down-labelled scored items, so `nUp − nDown` is 0 and the correction
   * is exactly zero for ANY drift. Measured across drift −3 … +3: pct stayed 20.
   *
   * That is the mechanism succeeding, not failing: a balanced set cancels
   * uniform re-listen drift outright. It is pinned here because it is invisible
   * from the copy — the expert panel will show both numbers and they will agree
   * — and because the day someone adds a 15th scored item, this test says what
   * broke and why.
   */
  it("the correction is zero because the pool's label directions are balanced", () => {
    const scored = BIAS_CLIPS.filter((i) => !i.isControl);
    const up = scored.filter((i) => i.labelDirection === "up").length;
    expect(up).toBe(scored.length - up);
    expect(BIAS.controlDriftPts).not.toBe(0);
    expect(BIAS.adjustedMeanShiftPts).toBe(BIAS.meanShiftPts);
    expect(BIAS.rawPct).toBe(BIAS.pct);
  });
});

describe("the payload, printed", () => {
  it("prints one of each", () => {
    const d = delicacyExpert(DELICACY);
    console.log("\n=== DELICACY");
    console.log(`  ${d.nCorrect}/${d.nTrials}  flaw ${d.flawCorrect}/${d.flawEligible}`);
    console.log(`  perFamily: ${d.perFamily.map((f) => `${f.family} ${f.correct}/${f.n}`).join(", ")}`);
    console.log(`  perMagnitude: ${d.perMagnitude.map((m) => `rung${m.magnitude} ${m.correct}/${m.n}`).join(", ")}`);
    for (const t of d.trials.slice(0, 4)) {
      console.log(
        `   #${t.index} ${t.id} ${t.family}@${t.magnitude}` +
          `${t.value === null ? "" : ` (${t.value} ${t.unit})`}` +
          ` original=${t.originalSide} picked=${t.pickedSide} ${t.correct ? "HIT" : "MISS"}` +
          ` flaw=${t.flawPick}/${t.flawCorrect} conf=${t.confidence}`,
      );
    }
    console.log(`   …${d.trials.length - 4} more`);

    const t0 = thresholdExpert(THRESHOLDS[0]);
    console.log("\n=== THRESHOLD");
    console.log(`  ${t0.family} kind=${t0.kind} trials=${t0.trials} point=${t0.point} ci=${JSON.stringify(t0.ci95)}`);
    console.log(`  band heardAt=${t0.heardAt} missedAt=${t0.missedAt}  limits=${t0.limits.length}`);
    console.log(
      `  rungs: ${t0.rungs.map((r) => `${r.label}:${r.correct}/${r.shown}${r.isHeard ? "^" : r.isMissed ? "v" : r.inBand ? "-" : ""}`).join(" ")}`,
    );

    const b = biasExpert(BIAS);
    console.log("\n=== PRESTIGE");
    console.log(`  rawPct=${b.rawPct} pct=${b.pct} drift=${b.controlDriftPts} swappedPct=${b.swappedPct}`);
    console.log(`  moved ${b.movedCount}/${b.movableCount}  edge=${b.edgeCount}  controls=${b.controls.length}`);
    for (const i of b.items.slice(0, 3)) {
      console.log(`   ${i.id} blind=${i.blind} labeled=${i.labeled} toward=${i.towardLabel} headroom=${i.headroom} labelIsTrue=${i.labelIsTrue}`);
    }
  });
});

/* ------------------------------------------------------------------ *
 * THE VERDICT-FREE GUARANTEE
 * ------------------------------------------------------------------ */

describe("no verdict can travel in this payload", () => {
  const payloads = () => [
    JSON.stringify(delicacyExpert(DELICACY)),
    JSON.stringify(biasExpert(BIAS)),
    JSON.stringify(spreadExpert(SPREAD)),
    JSON.stringify(spreadExpert(SPREAD_REFUSED)),
    ...THRESHOLDS.map((t) => JSON.stringify(thresholdExpert(t))),
  ];

  /**
   * The blueprint's word for this view is VERDICT-FREE. Enforced against the
   * serialised payload rather than against a field list, so a verdict cannot
   * arrive later inside something that was not thought of as a verdict.
   */
  it("carries none of the verdict vocabulary the product uses elsewhere", () => {
    const banned =
      /label-driven|steady ears|contrarian|strength|blind spot|sharpest|weakest|\bpass\b|\bfail\b|percentile|above average/i;
    for (const p of payloads()) expect(p).not.toMatch(banned);
  });

  /**
   * A stronger version of the same rule: the payload has no PROSE at all. Every
   * string in it is an id, a family key, or a unit — nothing a reader would
   * mistake for a sentence — so the component owns every word on the screen.
   */
  it("contains no sentence-shaped string", () => {
    const strings: string[] = [];
    const walk = (v: unknown) => {
      if (typeof v === "string") strings.push(v);
      else if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === "object") Object.values(v).forEach(walk);
    };
    walk(delicacyExpert(DELICACY));
    walk(biasExpert(BIAS));
    walk(spreadExpert(SPREAD));
    expect(strings.length).toBeGreaterThan(10);
    for (const s of strings) {
      expect(s, s).not.toMatch(/\s(is|are|was|were|you|your)\s/i);
      expect(s, s).not.toMatch(/[.!?]\s/);
    }
  });

  /**
   * The staircase is the exception and it is a deliberate one: `limits` carries
   * `statement`, a sentence written by the PIPELINE that measured the limit
   * (RT-85a). It is already rendered on /lab/instrument-limits. It is evidence,
   * not a verdict, and it must stay attributable to the measurement rather than
   * be paraphrased here.
   */
  it("passes the staircase's measured limit statements through untouched", () => {
    const withLimits = THRESHOLDS.map(thresholdExpert).filter((t) => t.limits.length > 0);
    for (const t of withLimits) {
      for (const l of t.limits) {
        expect(typeof l.statement).toBe("string");
        expect(l.statement.length).toBeGreaterThan(10);
      }
    }
    // And they are the pipeline's own words, not re-written here.
    for (const t of THRESHOLDS.map(thresholdExpert)) {
      expect(t.limits).toEqual(THRESHOLDS.find((x) => x.family === t.family && x.sourceId === t.sourceId)!.limits);
    }
  });

  it("badges the absent cohort on every instrument (N3)", () => {
    expect(delicacyExpert(DELICACY).cohortN).toBe(0);
    expect(biasExpert(BIAS).cohortN).toBe(0);
    expect(spreadExpert(SPREAD).cohortN).toBe(0);
    for (const t of THRESHOLDS) expect(thresholdExpert(t).cohortN).toBe(0);
  });
});

/* ------------------------------------------------------------------ *
 * The Ranking Test (E18/S1)
 * ------------------------------------------------------------------ */

describe("the ranking test's raw record cannot leak the critic's order", () => {
  /**
   * THE INSTRUMENT'S CENTRAL GUARANTEE, CHECKED AT THE SURFACE MOST LIKELY TO
   * BREAK IT. `spread.ts` argues that agreement is uncomputable because only
   * |Δposition| was ever imported. An expert view is where that argument gets
   * tested for real: it is the one surface whose whole job is to show MORE, and
   * a `position` field added to a receipt "so the table can sort" would hand
   * back the ordering the engine spent a docblock refusing to import.
   *
   * ASSERTED ON THE SERIALISED PAYLOAD rather than on a field list, so it also
   * catches a position arriving inside something not thought of as a position.
   * The scan is proven to have found something first: a run that matched
   * nothing would pass this test while checking nothing at all.
   */
  it("carries distances and no positions", () => {
    const flat = JSON.stringify(spreadExpert(SPREAD));
    expect(flat.includes('"distance"')).toBe(true);
    expect(flat.includes('"position"')).toBe(false);
    expect(flat.includes('"rank"')).toBe(false);

    // Every position in the pool, as a bare number, must be absent from the
    // payload's own numeric fields. Ratings and gaps share that value space, so
    // this checks the FIELDS rather than the bytes.
    const e = spreadExpert(SPREAD);
    const positions = SPREAD_POOL.map((i) => i.position);
    expect(positions.length).toBe(6);
    for (const p of e.pairs) {
      expect(Object.keys(p).sort()).toEqual(["a", "b", "distance", "gap", "kind"]);
    }
    for (const c of e.clips) {
      expect(Object.keys(c).sort()).toEqual(["id", "rating", "setAside"]);
    }
    // And the ranking itself never travels.
    expect(TANNER_RANKING.length).toBe(21);
    for (const w of TANNER_RANKING) expect(flat.includes(w.work)).toBe(false);
  });

  /**
   * A DISTANCE IS SYMMETRIC AND THE GAPS AGREE WITH THE MEANS. If the receipts
   * were built in a second pass over the pairs they could drift from the figure
   * on screen; they are built from the same array, and this is what says so.
   */
  it("averages to exactly the means the reveal prints", () => {
    const e = spreadExpert(SPREAD);
    const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
    const far = e.pairs.filter((p) => p.kind === "far").map((p) => p.gap);
    const close = e.pairs.filter((p) => p.kind === "close").map((p) => p.gap);
    expect(far).toHaveLength(e.farCount);
    expect(close).toHaveLength(e.closeCount);
    expect(mean(far)).toBeCloseTo(e.farMeanGap!, 10);
    expect(mean(close)).toBeCloseTo(e.closeMeanGap!, 10);
    for (const p of e.pairs) expect(p.distance).toBeGreaterThan(0);
  });

  /**
   * THE REFUSAL WITHHOLDS THE STATISTIC AND KEEPS THE OBSERVATIONS. Suppressing
   * the pairs as well would leave the panel blank in exactly the case a reader
   * most wants to see what happened, and a per-pair gap is not a statistic — it
   * is one thing the person did.
   */
  it("keeps the pairs when it refuses the means", () => {
    const e = spreadExpert(SPREAD_REFUSED);
    expect(e.refusal).toBe("too-few-far-pairs");
    expect(e.farMeanGap).toBeNull();
    expect(e.closeMeanGap).toBeNull();
    expect(e.pairs.length).toBeGreaterThan(0);
    // The set-aside clip is shown, with its rating, and belongs to no pair.
    const aside = e.clips.filter((c) => c.setAside);
    expect(aside.map((c) => c.id)).toEqual(["sp1"]);
    expect(aside[0].rating).toBe(9);
    expect(e.pairs.some((p) => p.a === "sp1" || p.b === "sp1")).toBe(false);
    expect(e.clips).toHaveLength(SPREAD_POOL.length);
  });

  /**
   * THE PANEL RESOLVES AN ID TO A WORK TITLE, AND ITS LOOKUP FALLS BACK TO THE
   * ID. That fallback is correct defensive code and a silent failure if it ever
   * fires: a reader would see "sp3" in a table headed Work and have no idea
   * anything was wrong. The condition for it never firing is that every id in
   * the payload names a pool item, which is checked here rather than trusted —
   * the payload's ids come from the pool, but through two different maps.
   */
  it("names only clips the pool can resolve to a work", () => {
    const known = new Set(SPREAD_POOL.map((i) => i.id));
    expect(known.size).toBe(6);
    for (const r of [SPREAD, SPREAD_REFUSED]) {
      const e = spreadExpert(r);
      expect(e.clips.length).toBeGreaterThan(0);
      for (const c of e.clips) expect(known.has(c.id), c.id).toBe(true);
      expect(e.pairs.length).toBeGreaterThan(0);
      for (const p of e.pairs) {
        expect(known.has(p.a), p.a).toBe(true);
        expect(known.has(p.b), p.b).toBe(true);
      }
      // And every pool item has a title to resolve TO.
      for (const item of SPREAD_POOL) expect(item.work.length).toBeGreaterThan(3);
    }
  });

  it("prints a ranking-test payload for reading", () => {
    for (const [name, r] of [["FULL", SPREAD], ["REFUSED", SPREAD_REFUSED]] as const) {
      const e = spreadExpert(r);
      console.log(`
=== RANKING TEST · ${name}`);
      console.log(
        `  rated=${e.ratedCount} setAside=${e.setAsideCount} far=${e.farCount} close=${e.closeCount} ` +
          `refusal=${e.refusal} chance=${e.ifIndifferent.toFixed(2)}`,
      );
      console.log(`  farMean=${e.farMeanGap} closeMean=${e.closeMeanGap}`);
      console.log(`  clips: ${e.clips.map((c) => `${c.id}=${c.rating}${c.setAside ? "*" : ""}`).join(" ")}`);
      for (const p of e.pairs) {
        console.log(`   ${p.a}-${p.b} ${p.kind} distance=${p.distance} gap=${p.gap}`);
      }
    }
  });
});

/* ------------------------------------------------------------------ *
 * The answer key (RT-O a)
 * ------------------------------------------------------------------ */

describe("the answer key is present and correct", () => {
  /**
   * `originalSide` is DERIVED from the receipt rather than looked up in the
   * pool, so a replayed share payload and a live session cannot disagree about
   * it. This checks the derivation against the pool it was not allowed to read.
   */
  it("derives originalSide to match the shipped pool on every trial", () => {
    const d = delicacyExpert(DELICACY);
    expect(d.trials).toHaveLength(MEASURED_TRIALS.length);
    d.trials.forEach((t, i) => {
      expect(t.originalSide, t.id).toBe(MEASURED_TRIALS[i].originalSide);
      expect(t.id).toBe(MEASURED_TRIALS[i].id);
      expect(t.index).toBe(i + 1);
    });
  });

  it("holds for a session that got everything wrong, not just a mixed one", () => {
    const wrong = delicacyExpert(delicacyFor(() => false));
    expect(wrong.nCorrect).toBe(0);
    wrong.trials.forEach((t, i) => {
      expect(t.originalSide).toBe(MEASURED_TRIALS[i].originalSide);
      expect(t.pickedSide).not.toBe(t.originalSide);
    });
  });

  it("discloses which prestige labels were fictional", () => {
    const b = biasExpert(BIAS);
    const swapped = b.items.filter((i) => !i.labelIsTrue).map((i) => i.id).sort();
    expect(swapped).toEqual([...BIAS.swappedIds].sort());
    expect(swapped.length).toBeGreaterThan(0);
  });
});

describe("the calibration curve", () => {
  it("carries one point per confidence level the trials offer", () => {
    const c = delicacyExpert(DELICACY).calibration;
    expect(c.points.map((p) => p.claimedPct)).toEqual([...DELICACY_CONFIDENCE_LEVELS]);
    expect(c.n).toBe(DELICACY.nTrials);
    expect(c.brierChance).toBe(BRIER_COIN_FLIP);
  });

  it("derives observedPct from that bin's own counts", () => {
    for (const p of delicacyExpert(DELICACY).calibration.points) {
      if (p.observedPct === null) continue;
      expect(p.observedPct).toBeCloseTo((p.correct / p.n) * 100, 6);
    }
  });

  /**
   * A bin standing on fewer than MIN_BIN_N answers has no rate (N3). It must
   * come back null rather than as a number the chart would then plot — a point
   * at 0% reads as "you got none right", not as "there is nothing to say".
   */
  it("suppresses a bin below the floor instead of reporting a rate", () => {
    const thin = delicacyFor(() => true, (i) => (i < 12 ? 95 : i < 14 ? 70 : 50));
    const pts = delicacyExpert(thin).calibration.points;
    const byLevel = Object.fromEntries(pts.map((p) => [p.claimedPct, p]));
    expect(byLevel[95].n).toBeGreaterThanOrEqual(MIN_BIN_N);
    expect(byLevel[95].observedPct).not.toBeNull();
    expect(byLevel[70].n).toBeLessThan(MIN_BIN_N);
    expect(byLevel[70].observedPct).toBeNull();
    expect(byLevel[50].observedPct).toBeNull();
  });

  /**
   * THE VERDICT STAYS OUT. `CalibrationResult.direction` classifies the person
   * as overconfident / underconfident / calibrated, which `CalibrationBlock`
   * renders on the result screen and a verdict-free view may not carry.
   */
  it("carries no direction verdict", () => {
    const c = delicacyExpert(DELICACY).calibration as unknown as Record<string, unknown>;
    expect(c.direction).toBeUndefined();
    expect(JSON.stringify(c)).not.toMatch(/overconfident|underconfident|calibrated/i);
  });
});

/* ------------------------------------------------------------------ *
 * Units
 * ------------------------------------------------------------------ */

describe("physical values only where the unit is established", () => {
  it("quotes pitch and compression rungs, and refuses timing", () => {
    const d = delicacyExpert(DELICACY);
    for (const t of d.trials) {
      if (SHARED_AXIS_FAMILIES.includes(t.family)) {
        expect(t.value, t.id).toBe(RUNG_VALUE[`${t.family}/${t.magnitude}`]);
        expect(t.unit, t.id).toMatch(/^(cents|kbps)$/);
      } else {
        // Timing is stored as a tempo fraction and the staircase axis is ms of
        // drift IQR; printing one as the other is a guess wearing a unit.
        expect(t.value, t.id).toBeNull();
        expect(t.unit, t.id).toBeNull();
      }
    }
    expect(d.trials.some((t) => t.value !== null)).toBe(true);
    expect(d.trials.some((t) => t.value === null)).toBe(true);
  });
});

/* ------------------------------------------------------------------ *
 * Tallies and rungs
 * ------------------------------------------------------------------ */

describe("tallies agree with the engine they came from", () => {
  it("per-family and per-magnitude sum to the trial count", () => {
    const d = delicacyExpert(DELICACY);
    expect(d.perFamily.reduce((a, f) => a + f.n, 0)).toBe(d.nTrials);
    expect(d.perMagnitude.reduce((a, m) => a + m.n, 0)).toBe(d.nTrials);
    expect(d.perFamily.reduce((a, f) => a + f.correct, 0)).toBe(d.nCorrect);
    // Families the pool never presented are omitted, not reported as 0 of 0.
    for (const f of d.perFamily) expect(f.n).toBeGreaterThan(0);
  });

  it("marks exactly the band edges the engine marked, and no rung twice", () => {
    for (const result of THRESHOLDS) {
      const t = thresholdExpert(result);
      expect(t.rungs).toHaveLength(result.band.rungs.length);
      expect(t.rungs.filter((r) => r.isHeard).length).toBeLessThanOrEqual(1);
      expect(t.rungs.filter((r) => r.isMissed).length).toBeLessThanOrEqual(1);
      for (const r of t.rungs) expect(r.isHeard && r.isMissed).toBe(false);
      const heard = t.rungs.find((r) => r.isHeard);
      if (heard) expect(heard.label).toBe(result.band.heardAt);
      const missed = t.rungs.find((r) => r.isMissed);
      if (missed) expect(missed.label).toBe(result.band.missedAt);
    }
  });

  it("reports the fitted point only when the fitter earned one", () => {
    for (const result of THRESHOLDS) {
      const t = thresholdExpert(result);
      if (result.kind === "threshold") {
        expect(t.point).not.toBeNull();
        expect(t.ci95).not.toBeNull();
      } else {
        expect(t.point).toBeNull();
        expect(t.ci95).toBeNull();
      }
    }
  });

  /** The correction has to be visible, not implied — both numbers travel. */
  it("carries the prestige number before AND after the control correction", () => {
    const b = biasExpert(BIAS);
    expect(b.rawPct).toBe(BIAS.rawPct);
    expect(b.pct).toBe(BIAS.pct);
    expect(b.controls.length).toBe(BIAS.controlCount);
    expect(b.movedCount).toBeLessThanOrEqual(b.movableCount);
  });
});
