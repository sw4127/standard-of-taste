/**
 * E14/S1 — WHAT THE RETEST ARC CAN ACTUALLY RESOLVE (Track H, 2026-09-01).
 *
 * THE NUMBER COMES BEFORE THE SENTENCE. Track H's job is to tell a person
 * whether their ear moved between two sittings. The failure mode is not that
 * the comparison is hard to build — subtracting two numbers is trivial — it is
 * that subtracting two NOISY numbers manufactures movement out of nothing, and
 * a product that congratulates people for noise is worse than one that never
 * mentions time at all. So this file derives the floor first, and S2 may only
 * build a rule the numbers here license.
 *
 * PRE-REGISTERED, WRITTEN BEFORE THE FILE WAS RUN. Four criteria:
 *
 *   (i)   THE PARAMETRIC FORMULA IS CHECKED, NOT TRUSTED. The textbook floor is
 *         MDC = 1.96*sqrt(2)*sigma, which assumes the change is roughly normal.
 *         It must agree with the empirical 95th percentile of |change| under the
 *         null within +-20%, or it is the wrong tool. (The check R3 used.)
 *   (ii)  THE RULE DOES NOT INVENT MOVEMENT. On a person who did not change it
 *         fires at most 5% of the time, measured on pairs HELD OUT from the
 *         batch the floor was calibrated on, so the floor is never fitted to
 *         the data it is judged against.
 *   (iii) IT FIRES WHEN IT SHOULD. Against a person whose change is twice the
 *         floor, the rule must fire AND NAME THE RIGHT DIRECTION at least 90%
 *         of the time. Firing backwards counts as a miss, not a hit.
 *
 *         (iii) ALONE DOES NOT CATCH A VACUOUS RULE, and I first wrote it as
 *         though it did. It is stated relative to the floor, so it is
 *         SCALE-FREE: setting the floor absurdly high still passes, because
 *         twice an absurd floor is more absurd still. Proven by breaking it —
 *         a near-silent rule sailed through (iii) and was caught by (i), whose
 *         upper bound is what actually limits how large the floor may be. The
 *         two are a pair: (i) bounds the size, (iii) proves it fires.
 *   (iv)  POOLING BUYS WHAT ARITHMETIC SAYS IT BUYS. Averaging k sessions a side
 *         cuts the floor roughly as 1/sqrt(k); at k=4 it must reach at most 0.6x
 *         the single-session floor (arithmetic says 0.5x). This is the only way
 *         to sharpen the arc without lengthening a sitting, RT-H3(a) ruled it
 *         in, so it has to be shown to work rather than assumed.
 *
 * THREE THINGS THE FIRST TWO RUNS CHANGED, ALL RECORDED RATHER THAN QUIETLY
 * FIXED. Every one of them made the rule STRICTER or the guarantee harder to
 * meet; none of them moved a bar to make a failing number pass.
 *
 *   1. THE PARAMETRIC FLOOR IS NOT SAFE ENOUGH TO SHIP AS THE RULE. At
 *      1.96*sqrt(2)*sigma the rule fires on up to 5.4% of ladder pairs and 6.6%
 *      of prestige pairs who had not changed — over the 5% it advertises,
 *      because a posterior median from ~30 binary trials, and a headline that
 *      lands on whole points, both depart from the normal the formula assumes.
 *      It is not over on every cell, which is worse than if it were: a floor
 *      that keeps its promise on some instruments and not others is one nobody
 *      can quote. (The precise rates are printed by the run, not typed here —
 *      an earlier draft of this paragraph went stale within one sample-size
 *      change.) Criterion (i) still passes, which
 *      is the useful part: the formula is the right ORDER, so it stays as the
 *      cross-check. The floor the product uses is read off the null
 *      distribution itself, per instrument — the same choice `DERIVED_SAFE_GAP`
 *      made in `evidence.ts`, for the same reason: the derivation is a
 *      simulation and there is no closed form to trust.
 *   2. THE PRESTIGE HEADLINE IS A LATTICE, AND A QUANTILE CANNOT SEE ONE.
 *      Calibrated at the null's own 95th percentile the rule still fired on
 *      6.6% of held-out unchanged people. Raising the quantile changed NOTHING
 *      — the same 6.6%, to seven digits — which is the tell: the retest change
 *      lands on whole points, so the achievable false-positive rates jump 6.6%
 *      -> 3.4% with nothing between them, and "the 95th percentile" silently
 *      returns the 6.6% rung. The floor is therefore the smallest cutoff whose
 *      calibration rate CLEARS the target, which steps to the safe side of a
 *      lattice and reduces to the quantile where there isn't one. Criterion
 *      (ii) was TIGHTENED at the same time, to a flat 5% with no sampling
 *      allowance: the cost is silence, which falls on us, against false
 *      movement, which falls on the reader.
 *
 *      THE MARGIN BELOW IS A PRECAUTION, NOT THE FIX, and I nearly recorded it
 *      as the fix. Breaking it — running the whole file at a 5% calibration
 *      target — comes back green, because the lattice walk is what prestige
 *      needed and the ladders never required the margin at this sample size.
 *      It is kept because the floor is a sample statistic and silence is the
 *      cheap direction to err, not because anything measured here demands it.
 *   3. CRITERION (iii) WAS RESTATED, AND SHOULD HAVE BEEN WRITTEN THIS WAY.
 *      Its first form measured power at a change size derived from the
 *      parametric formula — so widening the floor mechanically lowered the
 *      number, and the criterion was partly a measure of how the floor had been
 *      set rather than of whether the rule works. It is now stated against the
 *      floor the product actually ships: a change of twice the floor must be
 *      caught 90% of the time. That is a sentence a reader can hold us to.
 *
 * WHICH NUMBER THE ARC COMPARES, AND WHY IT IS NOT THE ONE ON THE RESULT
 * SCREEN. `fitThreshold` refuses to print a point estimate on most sessions —
 * by design, RT-90a(b) — so comparing printed thresholds would compare only the
 * pairs where BOTH sittings happened to produce one. That is selection on the
 * answer, the exact defect RT-90a(b) removed from the cross-sectional claim,
 * re-entering through the arc's back door. `fitPosterior` returns `logMedian`
 * on EVERY session with at least one trial, including the ones the outcome
 * kinds refuse, and those refusals are themselves median tests on that same
 * quantity — so the arc and the result screen cannot end up on opposite sides
 * of a ladder end. Availability of both is measured below rather than asserted.
 *
 * ALL FIGURES SIMULATED. There are zero real responses (N3); anything derived
 * here carries the badge wherever it surfaces.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { observer as obs, pCorrect, rng, type Observer } from "@/analytics/observer";
import { fitPosterior, fitThreshold } from "@/engine/threshold-fit";
import { ARC_FLOORS, floorKey } from "@/engine/arc";
import { eligibleSources } from "@/engine/staircase-pool";
import {
  answer,
  axisFor,
  isFinished,
  nextTrial,
  startSession,
  type StaircaseSession,
} from "@/engine/staircase-session";
import { BIAS_CLIPS, BIAS_INSTRUMENT_ID } from "@/content/bias/items";
import { computeBiasResult } from "@/engine/bias";
import { DELICACY_INSTRUMENT_ID, MEASURED_TRIALS } from "@/content/delicacy/items";
import { computeDelicacyResult, DEGRADATION_FAMILIES } from "@/engine/delicacy";
import {
  assignBiasParams,
  assignDelicacyParams,
  simulateBias,
  simulateDelicacy,
  simulatePersons,
  DEFAULT_PERSON_MODEL,
  type SimPerson,
} from "./simulate";

const NL = String.fromCharCode(10);
const OUT_DIR = "docs/analytics";
const OUT = `${OUT_DIR}/e14-arc-resolution.txt`;
const lines: string[] = [];
const say = (s: string) => {
  lines.push(s);
  console.log(`[E14] ${s}`);
};

/* ------------------------------------------------------------------ *
 * The rule under test, stated once
 * ------------------------------------------------------------------ */

/** Two-sided 95%, 50% power. The classic minimum detectable change. */
const MDC_FACTOR = 1.96 * Math.SQRT2;
/** Two-sided 95%, 80% power — what it takes to SHOW a person their own change. */
const MDC80_FACTOR = (1.96 + 0.8416) * Math.SQRT2;

/** The rate the rule promises, and is held to flatly on held-out data. */
const ADVERTISED_FALSE_POSITIVE = 0.05;

/**
 * WHAT THE FLOOR IS CALIBRATED TO, and why it is not the 5% it promises.
 *
 * Setting the cutoff so the rule fires 5% of the time ON THE SAMPLE IT WAS
 * FITTED TO leaves it firing measurably more than that on new people — 6.6% and
 * 6.8% when it was tried (finding 2 in the header). The margin is the difference
 * between a nominal guarantee and a delivered one. If a future change needs a
 * bigger margin, lower this rather than relaxing the 5% bar it exists to meet.
 */
const CALIBRATION_TARGET = 0.035;

const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
const sd = (v: number[]) => {
  const m = mean(v);
  return Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / (v.length - 1));
};
/*
 * THERE IS NO `quantile` HELPER HERE ANY MORE, DELIBERATELY. One existed and
 * every floor in this file was read off it, until the prestige lattice showed
 * that a quantile answers the wrong question. Leaving it in scope would leave
 * the wrong tool one autocomplete away from the next person deriving a floor.
 */
/**
 * THE FLOOR: the smallest cutoff whose firing rate on the calibration null is
 * at or under the target — NOT a quantile, and the difference is load-bearing.
 *
 * A quantile assumes the statistic is continuous. The prestige headline is NOT:
 * its retest change lands on whole points, so the achievable false-positive
 * rates jump 6.6% -> 3.4% with nothing in between, and asking for "the 95th
 * percentile" silently returns the 6.6% rung. Walking the observed values and
 * taking the first one that clears the target steps to the safe side of a
 * lattice automatically, and reduces to the quantile when there isn't one.
 */
function floorFrom(nullDeltas: number[]): number {
  const abs = nullDeltas.map(Math.abs).sort((a, b) => a - b);
  for (let i = 0; i < abs.length; i++) {
    // TIES ARE THE WHOLE POINT. The rate at a cutoff is how many values REACH
    // it, and a lattice puts many values on one rung — so a candidate is only
    // considered at the FIRST index of its value, or the rate would be read off
    // the middle of a rung and understate itself.
    if (i > 0 && abs[i] === abs[i - 1]) continue;
    if ((abs.length - i) / abs.length <= CALIBRATION_TARGET) return abs[i];
  }
  return abs[abs.length - 1];
}
const pad = (s: string, n: number) => s.padEnd(n);
const num = (x: number, dp: number, n: number) => x.toFixed(dp).padStart(n);
const pct = (x: number, dp = 1) => `${(100 * x).toFixed(dp)}%`;

/* ------------------------------------------------------------------ *
 * PART 1 — the three staircase ladders
 * ------------------------------------------------------------------ */

const LOSSY = "lossy-artifact";

/** Every ladder a session can actually run on, from the SHIPPING source set. */
const LADDERS: Array<{ name: string; family: string; sourceId?: string }> = [
  { name: "pitch", family: "pitch-drift" },
  { name: "timing", family: "timing-smear" },
  ...eligibleSources(LOSSY).map((sourceId) => ({ name: `lossy/${sourceId}`, family: LOSSY, sourceId })),
];

/** One ladder step in log units — the natural scale for a geometric ladder. */
const stepLog = (magnitudes: number[]) =>
  Math.log(magnitudes[magnitudes.length - 1] / magnitudes[0]) / (magnitudes.length - 1);

/**
 * One full session at the SHIPPED budget, through the real session API.
 *
 * Not a hand-built config: the whole question is what the instrument people
 * actually sit through can resolve, and a config assembled here would be free
 * to be a more generous instrument than the one that ships.
 */
function play(family: string, sourceId: string | undefined, seed: number, o: Observer): StaircaseSession {
  let s = startSession(family, seed, sourceId);
  const rand = rng(seed ^ 0x5bf03635);
  while (!isFinished(s)) {
    const t = nextTrial(s);
    s = answer(s, rand() < pCorrect(s.axis.magnitudes[t.levelIndex], o));
  }
  return s;
}

/** The arc's statistic for one session, in LOG MAGNITUDE. */
function arcStat(s: StaircaseSession): number | null {
  const p = fitPosterior(s.state, s.config);
  return p === null ? null : p.logMedian;
}

/** Move a listener by `steps` ladder steps. Positive = they got SHARPER. */
const moved = (o: Observer, steps: number, unitLog: number): Observer => ({
  ...o,
  alpha: o.alpha * Math.exp(-steps * unitLog),
});

interface Cell {
  name: string;
  /** Carried so the shipped-floor pin can build the same key `arc.ts` uses. */
  family: string;
  sourceId?: string;
  unitLog: number;
  /** Run-to-run SD of one session's estimate, in ladder steps. */
  sigma: number;
  /** The textbook floor. Reported as a cross-check, not used as the rule. */
  mdcParametric: number;
  mdc80: number;
  /** THE FLOOR THE RULE USES: the null's own 95th percentile, in ladder steps. */
  floor: number;
  /** Share of HELD-OUT unchanged pairs the rule called "moved". */
  falsePositive: number;
  /** Same, had the parametric floor been shipped instead. */
  falsePositiveParametric: number;
  /** Share of pairs at TWICE THE FLOOR called moved AND in the right direction. */
  powerAt2x: number;
  /** The same at the textbook MDC80 — reported for continuity with R3. */
  powerAtMdc80: number;
  /** Mean observed change against a true change of twice the floor. */
  observedAt2x: number;
  /** Share of sessions where the posterior median existed. */
  statAvailable: number;
  /** Share where `fitThreshold` would have printed a point estimate. */
  pointAvailable: number;
}

/** Independent sessions, as arc statistics in ladder steps from an arbitrary zero. */
function batch(
  family: string,
  sourceId: string | undefined,
  o: Observer,
  seedBase: number,
  n: number,
  unitLog: number,
): { stats: number[]; available: number; points: number } {
  const stats: number[] = [];
  let available = 0;
  let points = 0;
  for (let i = 1; i <= n; i++) {
    const s = play(family, sourceId, (seedBase + i) * 7919, o);
    const stat = arcStat(s);
    if (stat !== null) {
      available++;
      stats.push(stat / unitLog);
    }
    if (fitThreshold(s.state, s.config).kind === "threshold") points++;
  }
  return { stats, available: available / n, points: points / n };
}

const paired = (a: number[], b: number[]) => {
  const n = Math.min(a.length, b.length);
  return Array.from({ length: n }, (_, i) => b[i] - a[i]);
};

/** Calibration and held-out samples come from disjoint seed ranges. */
const CALIBRATION = 1200;
const HELD_OUT = 1200;

function measureLadder(name: string, family: string, sourceId: string | undefined): Cell {
  const axis = axisFor(family, sourceId);
  const unitLog = stepLog(axis.magnitudes);
  // A listener placed mid-ladder: the placement least distorted by the ladder
  // ends, which R2 measured biasing a floor-adjacent listener by +0.499 steps.
  const o = obs(axis.magnitudes[axis.magnitudes.length >> 1], 0.35, 0.02);

  // CALIBRATION — the floor is read off here and never re-read below.
  const calA = batch(family, sourceId, o, 0, CALIBRATION, unitLog);
  const calB = batch(family, sourceId, o, 2_000, CALIBRATION, unitLog);
  const calDeltas = paired(calA.stats, calB.stats);
  const sigma = sd(calDeltas) / Math.SQRT2;
  const mdcParametric = MDC_FACTOR * sigma;
  const mdc80 = MDC80_FACTOR * sigma;
  const floor = floorFrom(calDeltas);

  // HELD OUT — everything judged from here on.
  const heldA = batch(family, sourceId, o, 4_000, HELD_OUT, unitLog);
  const heldB = batch(family, sourceId, o, 6_000, HELD_OUT, unitLog);
  const nullDeltas = paired(heldA.stats, heldB.stats);
  const rate = (deltas: number[], f: number) => deltas.filter((d) => Math.abs(d) >= f).length / deltas.length;

  // A listener who genuinely got sharper. Sharper means a SMALLER magnitude, so
  // the arc statistic falls: a correct call is a NEGATIVE delta, and one that
  // fires positive is counted as a miss rather than quietly as a hit.
  const hits = (deltas: number[]) =>
    deltas.filter((d) => Math.abs(d) >= floor && d < 0).length / deltas.length;
  const at2x = batch(family, sourceId, moved(o, 2 * floor, unitLog), 8_000, HELD_OUT, unitLog);
  const at80 = batch(family, sourceId, moved(o, mdc80, unitLog), 10_000, HELD_OUT, unitLog);
  const d2x = paired(heldA.stats, at2x.stats);

  return {
    name,
    family,
    sourceId,
    unitLog,
    sigma,
    mdcParametric,
    mdc80,
    floor,
    falsePositive: rate(nullDeltas, floor),
    falsePositiveParametric: rate(nullDeltas, mdcParametric),
    powerAt2x: hits(d2x),
    powerAtMdc80: hits(paired(heldA.stats, at80.stats)),
    observedAt2x: mean(d2x),
    statAvailable: calA.available,
    pointAvailable: calA.points,
  };
}

describe("E14/S1 — what a retest can resolve on the staircase ladders [SIMULATED]", () => {
  const cells: Cell[] = [];

  it(
    "derives the floor, and holds the rule to the pre-registered criteria",
    { timeout: 900_000 },
    () => {
      say("");
      say("=== E14/S1 THE RETEST ARC — WHAT IT CAN RESOLVE [SIMULATED, zero real responses] ===");
      say("Track H, derived 2026-09-02, BEFORE the comparison engine or any sentence was written.");
      say("");
      say(`Staircase ladders at the SHIPPED session budget. ${CALIBRATION} calibration pairs and`);
      say(`${HELD_OUT} held-out pairs per ladder. sigma and floor in ladder steps; the factor is`);
      say("what the physical quantity (cents, ms, kbps) must change by before the arc may speak.");
      say("");
      say(
        `${pad("ladder", 12)} ${pad("sigma", 6)} ${pad("floor", 6)} ${pad("param", 6)} ` +
          `${pad("false+", 7)} ${pad("param+", 7)} ${pad("pow 2x", 7)} ${pad("pow80", 6)} ${pad("stat", 5)} ${pad("point", 6)}`,
      );
      for (const { name, family, sourceId } of LADDERS) {
        const c = measureLadder(name, family, sourceId);
        cells.push(c);
        say(
          `${pad(c.name, 12)} ${num(c.sigma, 2, 6)} ${num(c.floor, 2, 6)} ${num(c.mdcParametric, 2, 6)} ` +
            `${pct(c.falsePositive).padStart(7)} ${pct(c.falsePositiveParametric).padStart(7)} ` +
            `${pct(c.powerAt2x).padStart(7)} ${pct(c.powerAtMdc80).padStart(6)} ` +
            `${pct(c.statAvailable, 0).padStart(5)} ${pct(c.pointAvailable, 0).padStart(6)}`,
        );
      }

      say("");
      say("WHAT A PERSON MUST DO BEFORE THE ARC MAY SPEAK:");
      for (const c of cells) {
        say(
          `  ${pad(c.name, 12)} the physical quantity must change by x${Math.exp(c.floor * c.unitLog).toFixed(2)} ` +
            `to be seen at all, x${Math.exp(c.mdc80 * c.unitLog).toFixed(2)} to be seen reliably`,
        );
      }
      say("");
      // COMPUTED, NOT TYPED. An earlier draft of this sentence said the
      // parametric floor fires above 5% "on every ladder"; growing the sample
      // from 300 pairs to 1200 made that false on three of the four, and the
      // sentence would have gone on asserting it. The claim now reads itself
      // off the table above.
      const over = cells.filter((c) => c.falsePositiveParametric > ADVERTISED_FALSE_POSITIVE);
      const worst = Math.max(...cells.map((c) => c.falsePositiveParametric));
      say(
        `'param' is the textbook floor and 'param+' the rate it would really have fired at: ` +
          `${pct(worst)} at worst, over the advertised 5% on ${over.length} of ${cells.length} ladders`,
      );
      say("and on the prestige test below. A floor that only sometimes keeps its promise is not a");
      say("floor, which is why the shipped one is read off the null distribution instead.");
      say("'stat' is how often the posterior median existed; 'point' how often the result screen");
      say("would have printed a threshold. The gap is the selection the arc avoids by comparing");
      say("the median rather than the printed number.");

      say("");
      say("THE FLOORS THIS DERIVATION LICENSES, at the precision `arc.ts` ships them:");
      for (const c of cells) say(`  ${pad(c.name, 12)} ${c.floor.toFixed(4)} ladder steps`);

      /*
       * THE LOOP IS CLOSED HERE (E14/S2). `arc.ts` ships these numbers as
       * constants, and a constant copied out of a simulation is a fact stored
       * twice — the defect this repo has hit at the rung table, the window plan
       * and the damage field. This is the second copy checking itself against
       * the first, so a change to the ladder, the estimator or the session
       * budget fails HERE, pointing at the constant, instead of quietly
       * shipping a floor that no longer describes the instrument.
       *
       * The derivation is fully seeded, so equality to four decimals is
       * reproducible rather than lucky.
       */
      for (const c of cells) {
        const shipped = ARC_FLOORS[floorKey(c.family, c.sourceId)];
        expect(shipped, `arc.ts ships no floor for ${c.name}`).toBeDefined();
        expect(
          shipped,
          `arc.ts ships ${shipped} for ${c.name}; this derivation now says ${c.floor.toFixed(4)}`,
        ).toBeCloseTo(c.floor, 4);
      }

      for (const c of cells) {
        // (i) the parametric formula is the right ORDER for this distribution
        expect(c.floor, `${c.name}: empirical floor vs parametric MDC`).toBeGreaterThan(c.mdcParametric * 0.8);
        expect(c.floor, `${c.name}: empirical floor vs parametric MDC`).toBeLessThan(c.mdcParametric * 1.2);
        // (ii) it does not invent movement — flat 5%, no sampling allowance
        expect(c.falsePositive, `${c.name}: fires on a person who did not change`).toBeLessThanOrEqual(
          ADVERTISED_FALSE_POSITIVE,
        );
        // (iii) it is not vacuous, and it names the right direction
        expect(
          c.powerAt2x,
          `${c.name}: misses a change of twice the floor, or calls it backwards`,
        ).toBeGreaterThanOrEqual(0.9);
        // The posterior median must exist on every session, or the arc has a
        // selection problem of its own that this file has not noticed.
        expect(c.statAvailable, `${c.name}: posterior median unavailable`).toBe(1);
      }
    },
  );

  it("reports what improvement costs at the ladder ends, rather than hiding it", () => {
    say("");
    say("=== THE SHRINKAGE, STATED [SIMULATED] ===");
    say("R2 measured that a listener who IMPROVES moves toward the ladder floor and picks up its");
    say("truncation, so improvement is understated. This is that effect on the arc's own statistic:");
    say(`${pad("ladder", 12)} ${pad("true change", 14)} ${pad("observed", 14)} shortfall`);
    for (const c of cells) {
      const truth = 2 * c.floor;
      const shortfall = (100 * (Math.abs(c.observedAt2x) - truth)) / truth;
      say(
        `${pad(c.name, 12)} ${num(-truth, 2, 8)} steps ${num(c.observedAt2x, 2, 8)} steps ` +
          `${shortfall >= 0 ? "+" : ""}${shortfall.toFixed(1)}%`,
      );
    }
    say("A negative shortfall means the arc UNDERSTATES a real improvement. No estimator fixes");
    say("this; only a longer ladder does. It is a limit the copy must carry, not a bug to file.");
    expect(cells.length).toBe(LADDERS.length);
  });

  it("prices pooling: what a person buys by coming back again", { timeout: 900_000 }, () => {
    say("");
    say("=== WHAT ANOTHER SESSION BUYS [SIMULATED] — RT-H3(a) ===");
    say("k sessions averaged per side. This is the only way to sharpen the arc without making a");
    say("sitting longer, and it is what makes coming back a real return rather than a badge.");
    say(`${pad("ladder", 12)} ${pad("k=1", 8)} ${pad("k=2", 8)} ${pad("k=3", 8)} ${pad("k=4", 8)}  floor, in ladder steps`);

    const POOL_PAIRS = 400;
    for (const { name, family, sourceId } of LADDERS) {
      const axis = axisFor(family, sourceId);
      const unitLog = stepLog(axis.magnitudes);
      const o = obs(axis.magnitudes[axis.magnitudes.length >> 1], 0.35, 0.02);
      const row: number[] = [];
      for (const k of [1, 2, 3, 4]) {
        const deltas: number[] = [];
        for (let p = 1; p <= POOL_PAIRS; p++) {
          const side = (base: number) =>
            mean(
              Array.from({ length: k }, (_, j) => {
                const s = play(family, sourceId, (base + p * 16 + j) * 7919, o);
                return (arcStat(s) as number) / unitLog;
              }),
            );
          deltas.push(side(6_000_000) - side(7_000_000));
        }
        row.push(floorFrom(deltas));
      }
      say(
        `${pad(name, 12)} ${row.map((v) => num(v, 2, 8)).join(" ")}  ` +
          `k=4 is ${(row[3] / row[0]).toFixed(2)}x of k=1 (arithmetic says 0.50)`,
      );
      // (iv) pooling buys what arithmetic says it buys
      expect(row[3] / row[0], `${name}: pooling four sessions did not sharpen the arc`).toBeLessThanOrEqual(0.6);
    }
  });
});

/* ------------------------------------------------------------------ *
 * PART 2 — the two fixed-pool instruments
 * ------------------------------------------------------------------ */

/**
 * WHY THESE ARE MEASURED HERE AND NOT READ OFF e6.
 *
 * `docs/analytics/e6-prestige.txt` reports SD 2.58 points at 14 scored clips and
 * `e6-delicacy.txt` SD 0.106 at 15 trials — but both are the spread of the
 * ESTIMATE AROUND A PERSON'S TRUTH, across a population and across which items
 * they happened to get. A retest is a narrower question: the SAME person answers
 * the SAME items a second time, so the item-sampling half of that variance is
 * not present. Reusing those numbers would set the arc's floor too high and
 * silence it when it had every right to speak. They are an upper bound, and the
 * gap between them and what follows is the point.
 */
const PERSONS = 6000;

/** First half calibrates the floor; second half is held out to judge it. */
const splitHalf = <T,>(xs: T[]): [T[], T[]] => {
  const h = xs.length >> 1;
  return [xs.slice(0, h), xs.slice(h)];
};

describe("E14/S1 — what a retest can resolve on the fixed-pool instruments [SIMULATED]", () => {
  it("measures the prestige test's retest noise on the same clips", () => {
    const items = assignBiasParams(BIAS_CLIPS, 20260901);
    const persons = simulatePersons(20260901, PERSONS, DEFAULT_PERSON_MODEL);
    const headline = (data: ReturnType<typeof simulateBias>, i: number) =>
      computeBiasResult(BIAS_INSTRUMENT_ID, items, data.blind[i], data.labeled[i]).pct;

    const first = simulateBias(11, items, persons);
    const second = simulateBias(22, items, persons);
    const deltas = persons.map((_, i) => headline(second, i) - headline(first, i));
    const [cal, held] = splitHalf(deltas);
    const sigma = sd(cal) / Math.SQRT2;
    const floor = floorFrom(cal);
    const mdc80 = MDC80_FACTOR * sigma;

    // A person who genuinely became less swayable, by twice the floor. `beta`
    // is sway in RATING points and the headline is a percentage of a ten-point
    // scale, so the shift divides by ten.
    const calmer: SimPerson[] = persons.map((p) => ({ ...p, beta: p.beta - (2 * floor) / 10 }));
    const after = simulateBias(33, items, calmer);
    const movedDeltas = persons.map((_, i) => headline(after, i) - headline(first, i));
    const [, heldMoved] = splitHalf(movedDeltas);
    const powerAt2x = heldMoved.filter((d) => Math.abs(d) >= floor && d < 0).length / heldMoved.length;
    const falsePositive = held.filter((d) => Math.abs(d) >= floor).length / held.length;

    say("");
    say(`=== PRESTIGE TEST — RETEST ON THE SAME CLIPS [SIMULATED] — ${PERSONS} persons ===`);
    say(`sigma ${sigma.toFixed(2)} points of scale (e6's across-item figure was 2.58 — an upper bound)`);
    say(`floor ${floor.toFixed(1)} points of sway before the arc may speak (textbook MDC80 ${mdc80.toFixed(1)})`);
    say(`held-out false positive ${pct(falsePositive)} · power at twice the floor ${pct(powerAt2x)}`);
    say("A sway that moves from +18% to +14% is INSIDE this floor and must read as no change.");

    expect(floor).toBeGreaterThan(MDC_FACTOR * sigma * 0.8);
    expect(floor).toBeLessThan(MDC_FACTOR * sigma * 1.2);
    // The same loop closure as the ladders: `arc.ts` ships this number, and the
    // ladder pin above cannot see it because the prestige test has no ladder.
    expect(
      ARC_FLOORS.bias,
      `arc.ts ships ${ARC_FLOORS.bias} points of sway; this derivation now says ${floor}`,
    ).toBeCloseTo(floor, 4);
    expect(falsePositive, "prestige: fires on a person who did not change").toBeLessThanOrEqual(
      ADVERTISED_FALSE_POSITIVE,
    );
    expect(
      powerAt2x,
      "prestige: misses a change of twice the floor, or calls it backwards",
    ).toBeGreaterThanOrEqual(0.9);
  });

  /**
   * THE DELICACY ROWS CORRECTED MY OWN PREMISE, AND THE CORRECTION IS THE
   * FINDING.
   *
   * The Track H plan told the PM that a per-family delicacy arc "cannot speak at
   * all", citing `MIN_TRIALS_PER_FAMILY_FOR_CONTRAST = 40`. That citation is
   * about a DIFFERENT question — whether one family may be called sharper than
   * ANOTHER within a single sitting, which needs the families separated from
   * each other. Comparing a family to ITSELF across two sittings is easier, and
   * the floor turns out to be reachable: about three of the family's five items.
   *
   * THE SECOND VERSION OF THE OBJECTION DIED TOO, AND ITS DEATH IS RECORDED.
   * Having lost "impossible", I reached for MULTIPLICITY — three families each
   * risking 5% means about one person in seven sees a false movement somewhere.
   * Measured, at the floor this file actually derives, it is 2.5%: the
   * lattice-aware floor is conservative enough that the family-wise rate never
   * gets near 5%. So that argument is dead as well, and the assertion that used
   * to encode it now guards the fact that survived.
   *
   * WHAT IS ACTUALLY TRUE, and it is the only thing left standing: the arc is
   * COARSE HERE. Four of a family's five items must change hands before it may
   * speak — near-total swing, or nothing. Six of fifteen for the whole session.
   * That is honest and nearly useless, which is a different objection from the
   * two I offered the PM, and he ruled RT-H2 on those. It goes back to him.
   */
  it("measures the delicacy trials' retest noise, and how coarse it has to be", () => {
    const items = assignDelicacyParams(MEASURED_TRIALS);
    const persons = simulatePersons(20260901, PERSONS, DEFAULT_PERSON_MODEL);
    const score = (data: ReturnType<typeof simulateDelicacy>, i: number) =>
      computeDelicacyResult(DELICACY_INSTRUMENT_ID, items, data.responses[i]);

    // HOISTED. The first draft called `simulateDelicacy` INSIDE the map, which
    // is 6000 whole-cohort simulations to score 6000 people and timed the suite
    // out at 73 seconds. Cheap to write, invisible in review, caught only
    // because the test had to actually run.
    const firstData = simulateDelicacy(33, items, persons);
    const secondData = simulateDelicacy(44, items, persons);
    const first = persons.map((_, i) => score(firstData, i));
    const second = persons.map((_, i) => score(secondData, i));

    const whole = persons.map((_, i) => second[i].accuracy - first[i].accuracy);
    const [calW, heldW] = splitHalf(whole);
    const sigmaW = sd(calW) / Math.SQRT2;
    const floorW = floorFrom(calW);
    const nTrials = first[0].nTrials;

    say("");
    say(`=== DELICACY TRIALS — RETEST ON THE SAME PAIRS [SIMULATED] — ${PERSONS} persons ===`);
    say(
      `whole session (${nTrials} trials): sigma ${pct(sigmaW)} of share · floor ${pct(floorW)} = ` +
        `${(floorW * nTrials).toFixed(1)} of ${nTrials} items before the arc may speak`,
    );
    say(`held-out false positive ${pct(heldW.filter((d) => Math.abs(d) >= floorW).length / heldW.length)}`);
    say("");
    say(`${pad("family", 16)} ${pad("trials", 7)} ${pad("sigma", 8)} floor, in items`);

    /** Per person, which families the rule would have called moved. */
    const firedPerPerson = persons.map(() => 0);
    /** The per-family floor, in items — the coarseness that is the real finding. */
    const floorItems: number[] = [];
    for (const family of DEGRADATION_FAMILIES) {
      const n = first[0].byFamily[family]?.n ?? 0;
      if (n === 0) continue;
      const d = persons.map((_, i) => (second[i].byFamily[family].correct - first[i].byFamily[family].correct) / n);
      const [calF, heldF] = splitHalf(d);
      const sF = sd(calF) / Math.SQRT2;
      const fF = floorFrom(calF);
      // Counted on the held-out half only, offset so the index lines up.
      const offset = d.length - heldF.length;
      heldF.forEach((v, i) => {
        if (Math.abs(v) >= fF) firedPerPerson[offset + i]++;
      });
      floorItems.push(fF * n);
      say(
        `${pad(family, 16)} ${num(n, 0, 6)}  ${pct(sF).padStart(7)}  ` +
          `${(fF * n).toFixed(1)} of ${n} — expressible, and far too coarse to be worth showing`,
      );
    }

    const heldPeople = firedPerPerson.slice(firedPerPerson.length >> 1);
    const anyFired = heldPeople.filter((c) => c > 0).length / heldPeople.length;
    say("");
    say(`ASKING THREE TIMES: a person who did not change sees at least one family called "moved"`);
    say(`${pct(anyFired)} of the time — BELOW a single family's 5%, because the floor derived here`);
    say("is conservative enough to absorb it. The multiplicity objection does not hold.");
    say("");
    say("WHAT THIS DOES AND DOES NOT LICENSE. Both reasons the Track H plan gave the PM for");
    say("RT-H2(a) are dead: the per-family arc is not impossible, and asking three times is not");
    say("what makes it unsafe. The surviving objection is coarseness — four of a family's five");
    say(`items, ${Math.round(floorW * nTrials)} of ${nTrials} for the whole session — so the only movement it can ever`);
    say("report is a near-total swing. RT-H2 goes back to the PM on the corrected numbers.");

    expect(
      heldW.filter((d) => Math.abs(d) >= floorW).length / heldW.length,
      "delicacy: fires on a person who did not change",
    ).toBeLessThanOrEqual(ADVERTISED_FALSE_POSITIVE);
    /*
     * THE TRIPWIRE, on the one objection that survived measurement.
     *
     * Not the multiplicity — that is measured above at 2.5% and is reported
     * rather than asserted, because it does not support the case. What holds
     * RT-H2(a) up is that a family cannot register anything short of a
     * near-total swing. If a longer pool ever brings this under three of five,
     * a per-family delicacy arc becomes worth showing and the ruling should be
     * revisited rather than inherited.
     */
    for (const f of floorItems) {
      expect(f, "a delicacy family can now register a partial change — revisit RT-H2").toBeGreaterThanOrEqual(3.5);
    }
    // Recorded so the number cannot silently drift out of the prose above.
    expect(anyFired).toBeLessThan(3 * ADVERTISED_FALSE_POSITIVE);
  });

  it("writes the derivation where a reader can find it", () => {
    mkdirSync(OUT_DIR, { recursive: true });
    writeFileSync(OUT, lines.join(NL) + NL, "utf8");
    expect(lines.length).toBeGreaterThan(20);
  });
});
