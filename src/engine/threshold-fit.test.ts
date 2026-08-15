/**
 * R4 — HEAD TO HEAD: does fitting beat averaging? (2026-08-15)
 *
 * PRE-REGISTERED CRITERION, written in the session plan before this estimator
 * existed. The fit must beat the reversal average on BIAS, RMSE and CI COVERAGE,
 * in ALL SIX conditions, at lapse 0, 2% and 6%, without raising trial counts.
 * The last is automatic — this is post-hoc arithmetic over the same responses,
 * so the staircase and the session length are untouched.
 *
 * If nothing clears that bar, the honest output is a documented residual bias
 * printed next to every threshold, not a quiet pass.
 *
 * AND A CONDITION THE PLAN DID NOT CONTAIN, added because sharing the model
 * between simulator and estimator flatters the estimator: a MISSPECIFIED
 * listener, whose curve is not the shape the fit assumes. Every recovery number
 * elsewhere in this repo is well-specified. A fit that only works when it
 * already knows the answer is not evidence about real ears.
 *
 * SIMULATED throughout; zero real responses (N3).
 */
import { describe, expect, it } from "vitest";
import {
  claimTarget,
  observer as obs,
  rng,
  runStaircaseSession,
  type Observer,
} from "@/analytics/observer";
import { DEFAULT_STAIRCASE, estimateThreshold, recordResponse, startStaircase, type StaircaseConfig } from "./staircase";
import { fitThreshold, levelAtP, psychometric, P_CONVERGE_2DOWN1UP } from "./threshold-fit";

const PITCH = [3.1, 4.4, 6.3, 8.8, 12.5, 17.7, 25, 35.4, 50, 70.7, 100];
const TIMING = [12.5, 15.7, 19.8, 25, 31.5, 39.7, 50, 63, 79.4, 100];

const stepUnit = (levels: number[]) => Math.pow(levels[levels.length - 1] / levels[0], 1 / (levels.length - 1));
const cfg = (levels: number[], overrides: Partial<StaircaseConfig> = {}): StaircaseConfig => ({
  ...DEFAULT_STAIRCASE,
  levels,
  startIndex: levels.length - 3,
  ...overrides,
});

const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
const sd = (v: number[]) => {
  const m = mean(v);
  return Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / (v.length - 1));
};

const CONDITIONS: Array<[string, number[], Observer]> = [
  ["pitch, sensitive", PITCH, obs(12, 0.35)],
  ["pitch, average", PITCH, obs(25, 0.35)],
  ["pitch, insensitive", PITCH, obs(50, 0.35)],
  ["pitch, shallow slope", PITCH, obs(25, 0.7)],
  ["timing, average", TIMING, obs(31.5, 0.35)],
  ["timing, sensitive", TIMING, obs(19.8, 0.35)],
];

/** Run both estimators over the SAME sessions, so the comparison is paired. */
function compare(levels: number[], o: Observer, sessions: number, overrides: Partial<StaircaseConfig> = {}) {
  const config = cfg(levels, overrides);
  const unit = Math.log(stepUnit(levels));
  const truth = Math.log(claimTarget(o));
  const old = { errors: [] as number[], covered: 0, dropped: 0 };
  const neu = { errors: [] as number[], covered: 0, dropped: 0 };
  for (let s = 1; s <= sessions; s++) {
    const { state } = runStaircaseSession(o, s * 7919, config);
    for (const [acc, outcome] of [
      [old, estimateThreshold(state, config)],
      [neu, fitThreshold(state, config)],
    ] as const) {
      if (outcome.kind !== "threshold") {
        acc.dropped++;
        continue;
      }
      acc.errors.push((Math.log(outcome.threshold) - truth) / unit);
      if (Math.log(outcome.ci95[0]) <= truth && truth <= Math.log(outcome.ci95[1])) acc.covered++;
    }
  }
  const stats = (a: typeof old) => ({
    bias: mean(a.errors),
    /** The arc's gate (R3): a constant bias cancels in a retest, sigma does not. */
    sigma: sd(a.errors),
    rmse: Math.sqrt(mean(a.errors.map((e) => e * e))),
    coverage: a.covered / a.errors.length,
    dropped: a.dropped,
  });
  return { old: stats(old), fit: stats(neu) };
}

/** Two-sided 95%, 80% power, from R3's derivation. */
const MDC80_FACTOR = (1.96 + 0.8416) * Math.SQRT2;

describe("R4 — the fit against the reversal average [SIMULATED]", () => {
  const SESSIONS = 1000;

  it("wins the interval and the ladder end, and does NOT win precision — scored honestly", () => {
    console.log(`\n[R4] === REVERSAL AVERAGE vs CURVE FIT [SIMULATED] — ${SESSIONS} sessions per cell ===`);
    console.log(`[R4] bias/RMSE in ladder steps, vs the lapse-free 70.7% level (what we print).`);
    console.log(
      `[R4] ${"condition".padEnd(21)} ${"λ".padStart(3)}  ${"bias old→fit".padStart(16)}  ` +
        `${"RMSE old→fit".padStart(15)}  ${"coverage old→fit".padStart(18)}`,
    );
    const failures: string[] = [];
    for (const [label, levels, o] of CONDITIONS) {
      for (const lapse of [0, 0.02, 0.06]) {
        const r = compare(levels, { ...o, lapse }, SESSIONS);
        const sg = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(2)}`;
        console.log(
          `[R4] ${label.padEnd(21)} ${`${(lapse * 100).toFixed(0)}%`.padStart(3)}  ` +
            `${`${sg(r.old.bias)} → ${sg(r.fit.bias)}`.padStart(16)}  ` +
            `${`${r.old.rmse.toFixed(2)} → ${r.fit.rmse.toFixed(2)}`.padStart(15)}  ` +
            `${`${(r.old.coverage * 100).toFixed(0)}% → ${(r.fit.coverage * 100).toFixed(0)}%`.padStart(18)}`,
        );
        const tag = `${label} @λ${lapse}`;
        if (Math.abs(r.fit.bias) >= Math.abs(r.old.bias)) failures.push(`${tag}: bias not improved`);
        if (r.fit.rmse >= r.old.rmse) failures.push(`${tag}: RMSE not improved`);
        if (r.fit.coverage <= r.old.coverage) failures.push(`${tag}: coverage not improved`);
      }
    }
    /**
     * THE PRE-REGISTERED CRITERION IS NOT MET, and this records it rather than
     * softening it. The plan required the fit to beat the reversal average on
     * bias, RMSE and coverage in all 18 cells — 54 cell-metrics — and it wins
     * 37 of them. Every miss is on bias or RMSE; coverage improves everywhere.
     *
     * WHY, because "it just didn't" is not a finding. The staircase spends its
     * ~38 trials inside a two-to-three level band, which constrains the curve
     * only locally: the SLOPE is close to unidentified, and integrating over a
     * nuisance parameter you cannot pin costs about as much variance as
     * curve-fitting saves. The reversal average never estimates the slope at
     * all — it reports where the track sat, which is near the 70.7% point
     * whatever the slope — so it is robust by declining to model. On a
     * well-run staircase it is a hard baseline, and it should be said plainly
     * that it was not beaten on precision.
     *
     * What the fit does buy is in the two assertions below, and the interval is
     * the one that was an N3 violation rather than a preference.
     */
    console.log(
      `[R4] PRE-REGISTERED CRITERION: NOT MET — ${failures.length}/54 cell-metrics missed ` +
        `(all on bias or RMSE; coverage improved in 18/18).`,
    );
    for (const f of failures) console.log(`[R4]   MISS: ${f}`);

    console.log(`\n[R4] === WHAT IT MEANS FOR THE ARC (R3's gate is sigma, not RMSE) ===`);
    console.log(`[R4] ${"condition".padEnd(21)} ${"sigma old→fit".padStart(15)}   detectable change old→fit`);
    for (const [label, levels, o] of CONDITIONS) {
      const r = compare(levels, { ...o, lapse: 0.02 }, SESSIONS);
      const det = (s: number) => Math.pow(stepUnit(levels), MDC80_FACTOR * s);
      console.log(
        `[R4] ${label.padEnd(21)} ${`${r.old.sigma.toFixed(2)} → ${r.fit.sigma.toFixed(2)}`.padStart(15)}   ` +
          `x${det(r.old.sigma).toFixed(2)} → x${det(r.fit.sigma).toFixed(2)}`,
      );
    }

    /**
     * ASSERTED WIN 1 — the interval, in every single cell. This is the N3
     * blocker: a 95% interval covering 49% is a false statement printed beside
     * every result, and E5 is the surface that would print it.
     */
    const coverageMisses = failures.filter((f) => f.includes("coverage"));
    expect(coverageMisses, "coverage must improve in every cell — the N3 blocker").toEqual([]);

    /**
     * ASSERTED WIN 2 — the ladder-end blow-up is gone. R2 measured term B at
     * +0.499 steps for a floor-adjacent listener: the reversal average CANNOT
     * report a level the ladder does not contain, so it piles up against the
     * end. The fit's grid extends past both ends and can. This is the largest
     * single bias term R2 found and it is the one that does NOT cancel in a
     * retest, because a listener who improves moves toward the floor.
     */
    for (const lapse of [0, 0.02, 0.06]) {
      const r = compare(TIMING, obs(19.8, 0.35, lapse), SESSIONS);
      expect(
        Math.abs(r.fit.bias),
        `floor-adjacent listener @λ${lapse}: the fit must escape ladder-end truncation`,
      ).toBeLessThan(Math.abs(r.old.bias));
    }

    /**
     * ASSERTED WIN 3, the weakest and stated as such — DO NO HARM. The fit is
     * not allowed to buy its interval with precision. The band was set after
     * measuring (worst observed cost +0.09 steps) and is a regression guard on
     * a measured fact, not a criterion the design was steered toward.
     */
    for (const [label, levels, o] of CONDITIONS) {
      for (const lapse of [0, 0.02, 0.06]) {
        const r = compare(levels, { ...o, lapse }, SESSIONS);
        expect(r.fit.rmse, `${label} @λ${lapse}: fit must not cost precision`).toBeLessThan(r.old.rmse + 0.15);
      }
    }
  });

  it("produces an interval that actually covers, which is the N3 blocker", () => {
    console.log(`\n[R4] === CI95 COVERAGE, the fit [SIMULATED] ===`);
    const worst: number[] = [];
    for (const [label, levels, o] of CONDITIONS) {
      const cells = [0, 0.02, 0.06].map((lapse) => compare(levels, { ...o, lapse }, SESSIONS).fit.coverage);
      worst.push(Math.min(...cells));
      console.log(`[R4] ${label.padEnd(21)} ${cells.map((c) => `${(c * 100).toFixed(1)}%`.padStart(8)).join(" ")}`);
    }
    const low = Math.min(...worst);
    console.log(`[R4] worst coverage anywhere: ${(low * 100).toFixed(1)}% (nominal 95%, was 49.3% before)`);
    /**
     * The bar is "not a false statement", not "exactly 95". A Bayesian interval
     * carries no frequentist coverage guarantee, so the honest requirement is
     * that it be close enough that printing 95 is not a lie — and, since the
     * failure that matters is OVER-claiming precision, that it does not
     * under-cover badly.
     */
    expect(low, "the printed interval must not be a false statement (N3)").toBeGreaterThan(0.9);
  });
});

describe("R4 — the fit on a listener it has the wrong model for [SIMULATED]", () => {
  /**
   * A MISSPECIFIED OBSERVER. The estimator assumes a logistic in log-magnitude.
   * This listener is a WEIBULL — the other standard psychometric shape, and a
   * genuinely different one: asymmetric, with a sharper knee and a longer tail
   * toward the easy end. No real ear is exactly either.
   *
   * The threshold being recovered is defined the same way for both — the level
   * where a lapse-free listener is correct 70.7% of the time — so the two are
   * commensurable even though the curves are not.
   */
  const weibull = (x: number, scale: number, shape: number, lapse: number) =>
    0.5 + (0.5 - lapse) * (1 - Math.exp(-Math.pow(x / scale, shape)));

  const weibullTarget = (scale: number, shape: number) => {
    let lo = Math.log(scale) - 20;
    let hi = Math.log(scale) + 20;
    for (let i = 0; i < 200; i++) {
      const mid = (lo + hi) / 2;
      if (weibull(Math.exp(mid), scale, shape, 0) < P_CONVERGE_2DOWN1UP) lo = mid;
      else hi = mid;
    }
    return Math.exp((lo + hi) / 2);
  };

  it("degrades gracefully rather than collapsing", () => {
    console.log(`\n[R4] === MISSPECIFIED LISTENER (Weibull generator, logistic fit) [SIMULATED] ===`);
    console.log(`[R4] ${"scale/shape/λ".padEnd(18)} ${"bias old→fit".padStart(16)} ${"RMSE old→fit".padStart(15)} ${"coverage".padStart(10)}`);
    for (const [scale, shape, lapse] of [
      [25, 2.0, 0],
      [25, 3.5, 0.02],
      [40, 1.5, 0.06],
    ] as Array<[number, number, number]>) {
      const config = cfg(PITCH);
      const unit = Math.log(stepUnit(PITCH));
      const truth = Math.log(weibullTarget(scale, shape));
      const oldErr: number[] = [];
      const fitErr: number[] = [];
      let covered = 0;
      for (let s = 1; s <= 1000; s++) {
        const rand = rng(s * 7919);
        let state = startStaircase(config);
        while (!state.finished) {
          state = recordResponse(state, rand() < weibull(PITCH[state.currentIndex], scale, shape, lapse), config);
        }
        const a = estimateThreshold(state, config);
        const b = fitThreshold(state, config);
        if (a.kind === "threshold") oldErr.push((Math.log(a.threshold) - truth) / unit);
        if (b.kind === "threshold") {
          fitErr.push((Math.log(b.threshold) - truth) / unit);
          if (Math.log(b.ci95[0]) <= truth && truth <= Math.log(b.ci95[1])) covered++;
        }
      }
      const rmse = (v: number[]) => Math.sqrt(mean(v.map((e) => e * e)));
      const sg = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(2)}`;
      console.log(
        `[R4] ${`${scale}/${shape}/${(lapse * 100).toFixed(0)}%`.padEnd(18)} ` +
          `${`${sg(mean(oldErr))} → ${sg(mean(fitErr))}`.padStart(16)} ` +
          `${`${rmse(oldErr).toFixed(2)} → ${rmse(fitErr).toFixed(2)}`.padStart(15)} ` +
          `${`${((covered / fitErr.length) * 100).toFixed(0)}%`.padStart(10)}`,
      );
      // The bar under misspecification is much lower on purpose: not "wins",
      // but "does not become worse than the thing it replaces".
      expect(rmse(fitErr), `Weibull ${scale}/${shape}: fit must not be worse than the average`).toBeLessThan(
        rmse(oldErr) + 0.15,
      );
    }
  });
});

describe("R4 — the fit keeps the honesty the average had (N3)", () => {
  const config = cfg(PITCH);

  it("still reports a BOUND when the listener never misses at the floor", () => {
    let s = startStaircase(config);
    while (!s.finished) s = recordResponse(s, true, config);
    const out = fitThreshold(s, config);
    expect(out.kind).toBe("below");
    if (out.kind === "below") expect(out.bound).toBe(PITCH[0]);
  });

  it("still reports a BOUND when the listener is at chance at the strongest level", () => {
    let s = startStaircase(config);
    while (!s.finished) s = recordResponse(s, false, config);
    const out = fitThreshold(s, config);
    expect(out.kind).toBe("above");
    if (out.kind === "above") expect(out.bound).toBe(PITCH[PITCH.length - 1]);
  });

  it("says inconclusive rather than reporting the prior from two trials", () => {
    let s = startStaircase(config);
    s = recordResponse(s, true, config);
    s = recordResponse(s, true, config);
    expect(fitThreshold(s, config).kind).toBe("inconclusive");
  });

  it("is a pure function of the responses — the same answers give the same number", () => {
    const answers = [true, true, false, true, true, true, false, false, true, true, false, true];
    const play = () => answers.reduce((s, a) => recordResponse(s, a, config), startStaircase(config));
    expect(fitThreshold(play(), config)).toEqual(fitThreshold(play(), config));
  });

  it("agrees with the model it fits: levelAtP inverts psychometric", () => {
    for (const [alpha, beta, lapse] of [
      [25, 0.35, 0],
      [12, 0.7, 0.06],
      [50, 0.2, 0.02],
    ]) {
      const x = levelAtP(P_CONVERGE_2DOWN1UP, alpha, beta, lapse);
      expect(psychometric(x, alpha, beta, lapse)).toBeCloseTo(P_CONVERGE_2DOWN1UP, 9);
    }
  });

  /**
   * The grid derives alpha from the threshold by an exact closed form rather
   * than bisecting for it. If that algebra were wrong, every cell would be
   * mislabelled and the estimator would be confidently reporting the wrong
   * quantity — the failure mode with no symptom. So it is checked against the
   * bisection it replaced.
   */
  it("the grid's threshold-to-alpha algebra matches the numeric inverse", () => {
    const F = (P_CONVERGE_2DOWN1UP - 0.5) / 0.5;
    const factor = (1 - F) / F;
    expect(factor, "the factor is exactly sqrt(2) for a 2AFC 70.7% target").toBeCloseTo(Math.SQRT2, 12);
    for (const t of [3.1, 12.5, 40, 100]) {
      for (const beta of [0.1, 0.35, 0.7, 1.5]) {
        const alpha = t * Math.pow(factor, beta);
        expect(levelAtP(P_CONVERGE_2DOWN1UP, alpha, beta, 0)).toBeCloseTo(t, 8);
      }
    }
  });
});
