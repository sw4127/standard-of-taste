/**
 * S2 proof, part 2: PARAMETER RECOVERY (artifact pivot §2).
 *
 * Pre-registered criterion: a recovery table at n = 50 / 200 / 1000 reporting
 * correlation and RMSE against known parameters, with RMSE strictly shrinking
 * as n grows. Every point is averaged over independent replications, because a
 * single cohort at n=50 can beat a single cohort at n=1000 on luck alone.
 */

import { describe, expect, it } from "vitest";
import { BIAS_CLIPS } from "@/content/bias/items";
import { assignBiasParams, simulatePersons, syntheticDelicacyItems } from "./simulate";
import { formatRecoveryTable, runRecovery, trueItemP, trueReliability } from "./recovery";
import { pCorrectSide } from "./simulate";

// The 40-item synthetic bank, NOT the live 6-item pool: recovery of a
// discrimination that has no variance is not a demonstration of anything.
const delicacyItems = syntheticDelicacyItems(77, 40);
const biasItems = assignBiasParams(BIAS_CLIPS, 7);
const SAMPLE_SIZES = [50, 200, 1000];
const REPS = 20;

const report = runRecovery({ seed: 4001, sampleSizes: SAMPLE_SIZES, reps: REPS, delicacyItems, biasItems });
const at = (n: number) => report.points.find((p) => p.n === n)!;

describe("recovery — truth helpers", () => {
  it("trueItemP averages the generating model over the actual cohort", () => {
    const persons = simulatePersons(5, 200);
    const truth = trueItemP(delicacyItems, persons);
    // Recomputed independently here from the same exported model function.
    const manual = delicacyItems.map(
      (item) => persons.reduce((s, p) => s + pCorrectSide(item, p.theta), 0) / persons.length,
    );
    truth.forEach((t, i) => expect(t).toBeCloseTo(manual[i], 12));
    // A 2AFC item can never sit below chance in expectation.
    for (const t of truth) expect(t).toBeGreaterThan(0.5);
  });

  it("trueReliability is a proportion and rises with test length", () => {
    const persons = simulatePersons(6, 500);
    const short = trueReliability(delicacyItems.slice(0, 6), persons);
    const long = trueReliability(delicacyItems, persons);
    expect(short).toBeGreaterThan(0);
    expect(long).toBeLessThan(1);
    expect(long).toBeGreaterThan(short); // more items, more signal — Spearman-Brown
  });
});

describe("recovery — the pre-registered S2 criterion", () => {
  it("prints the recovery table", () => {
    console.log(formatRecoveryTable(report));
  });

  it("item difficulty RMSE shrinks strictly with n", () => {
    const errs = SAMPLE_SIZES.map((n) => at(n).itemPRmse);
    for (let i = 1; i < errs.length; i++) expect(errs[i]).toBeLessThan(errs[i - 1]);
  });

  it("COHORT-level SAMPLING error shrinks strictly with n", () => {
    const errs = SAMPLE_SIZES.map((n) => at(n).meanBetaSe);
    for (let i = 1; i < errs.length; i++) expect(errs[i]).toBeLessThan(errs[i - 1]);
  });

  it("COHORT-level BIAS does NOT shrink with n — more people cannot fix it", () => {
    // Found while building this test: |mean β̂ − mean β| converged to a floor
    // of ~0.065 rather than to zero, because β̂ is attenuated, not noisy.
    // Splitting sampling error from systematic bias is the only honest way to
    // report it — and the conclusion matters for planning: recruitment buys
    // item statistics and cohort precision, and buys NOTHING against the
    // instrument's understatement of susceptibility. That needs a design fix.
    const biases = SAMPLE_SIZES.map((n) => at(n).meanBetaBias);
    console.log(`[rec] bias(β̄) across n=${SAMPLE_SIZES.join("/")}: ${biases.map((b) => b.toFixed(3)).join(" ")}`);
    const spread = Math.max(...biases) - Math.min(...biases);
    expect(spread).toBeLessThan(0.03);
    for (const b of biases) expect(b).toBeLessThan(0); // understates, consistently
  });

  it("PER-PERSON sway error stays flat in n — precision comes from test length", () => {
    // The pre-registered criterion said this should shrink with n. It should
    // not, and a version of this file that made it shrink would be measuring
    // something else. β is estimated from one person's own eight items; more
    // respondents cannot sharpen it. Asserting flatness locks the correct
    // reading in place so nobody "fixes" the table into a false claim.
    const errs = SAMPLE_SIZES.map((n) => at(n).betaRmse);
    const spread = Math.max(...errs) - Math.min(...errs);
    console.log(`[rec] per-person rmse(β) across n=${SAMPLE_SIZES.join("/")}: ${errs.map((e) => e.toFixed(3)).join(" ")} (spread ${spread.toFixed(3)})`);
    expect(spread).toBeLessThan(0.05);
  });

  it("person-parameter precision DOES improve with test length", () => {
    // The other half of the same point, shown on the delicacy side where the
    // bank length is free: θ is recovered better by a longer test at FIXED n.
    const short = runRecovery({
      seed: 909,
      sampleSizes: [400],
      reps: 10,
      delicacyItems: syntheticDelicacyItems(77, 10),
      biasItems,
    }).points[0];
    const long = runRecovery({
      seed: 909,
      sampleSizes: [400],
      reps: 10,
      delicacyItems: syntheticDelicacyItems(77, 60),
      biasItems,
    }).points[0];
    console.log(
      `[rec] r(θ) at fixed n=400: 10 trials → ${short.thetaCorrelation!.toFixed(3)}, ` +
        `60 trials → ${long.thetaCorrelation!.toFixed(3)}`,
    );
    expect(long.thetaCorrelation!).toBeGreaterThan(short.thetaCorrelation! + 0.1);
  });

  it("item difficulty is recovered accurately at n=1000", () => {
    expect(at(1000).itemPCorrelation!).toBeGreaterThan(0.98);
    expect(at(1000).itemPRmse).toBeLessThan(0.02);
  });

  it("discrimination ordering is recovered, up to the CTT↔IRT ceiling", () => {
    // Estimation converges (0.25 → 0.45 → 0.63 across n), but the correlation
    // is capped well below 1 by the statistic itself, not by sample size:
    // point-biserial is attenuated at extreme p-values, so two items with the
    // same `a` but different difficulty get different r_pbis. That ceiling is
    // the argument for S8 — IRT estimates `a` directly instead of through a
    // difficulty-contaminated proxy. Asserted as monotone improvement plus a
    // floor at the measured value, never as "discrimination is recovered".
    const rs = SAMPLE_SIZES.map((n) => at(n).discriminationCorrelation!);
    for (let i = 1; i < rs.length; i++) expect(rs[i]).toBeGreaterThan(rs[i - 1]);
    expect(at(1000).discriminationCorrelation!).toBeGreaterThan(0.55);
  });

  it("α estimates the model's true reliability", () => {
    const p = at(1000);
    expect(Math.abs(p.alpha! - p.trueReliability)).toBeLessThan(0.05);
  });

  it("person ability correlates with the score, capped by reliability", () => {
    // Not 1.0, and it should not be: a 40-item test measures θ with error.
    // The ceiling is √reliability, so exceeding it would mean a bug.
    const p = at(1000);
    expect(p.thetaCorrelation!).toBeGreaterThan(0.7);
    expect(p.thetaCorrelation!).toBeLessThanOrEqual(Math.sqrt(p.trueReliability) + 0.05);
  });

  it("every recovery report is stamped SIMULATED (N3)", () => {
    expect(report.dataSource).toBe("SIMULATED");
  });

  it("rejects a degenerate configuration", () => {
    expect(() => runRecovery({ seed: 1, sampleSizes: [10], reps: 0, delicacyItems, biasItems })).toThrow(/reps/);
  });
});

describe("recovery — the instrument's sway attenuation, measured", () => {
  it("MEASURES how much the prestige instrument understates susceptibility", () => {
    const p = at(1000);
    const attenuation = (1 - p.betaSlope!) * 100;
    console.log(
      `[rec] sway recovery: r = ${p.betaCorrelation!.toFixed(3)}, slope = ${p.betaSlope!.toFixed(3)} ` +
        `⇒ the instrument understates true susceptibility by ~${attenuation.toFixed(1)}%. [SIMULATED]`,
    );
    // The engine header claims the measured sway "UNDERSTATES the true effect"
    // and that copy may therefore say "at least". This is the first time that
    // claim has a number behind it. Direction is asserted; the magnitude is
    // model-dependent and must stay labelled as such.
    expect(p.betaSlope!).toBeLessThan(1);
    expect(p.betaSlope!).toBeGreaterThan(0.5);
    expect(p.betaCorrelation!).toBeGreaterThan(0.7);
  });
});
