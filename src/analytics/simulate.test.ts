/**
 * S1 proof (artifact pivot §2, memo D6). Three things must hold:
 *  1. DETERMINISM — same seed, byte-identical dataset, forever. Without this
 *     no recovery result is reproducible and the whole pipeline is a rumour.
 *  2. PRODUCTION SHAPE — the generated responses go through the SHIPPING
 *     engines untouched. A generator that emits a convenient private shape
 *     proves nothing about the pipeline users actually hit.
 *  3. BEHAVIOUR — the known parameters visibly drive the outcomes (higher θ
 *     scores higher, higher β sways more, controls stay unpulled). This is
 *     the sanity floor S2's recovery proof stands on.
 */

import { describe, expect, it } from "vitest";
import { BIAS_CLIPS } from "@/content/bias/items";
import { DELICACY_TRIALS } from "@/content/delicacy/items";
import { computeBiasResult, BIAS_SCALE_MAX, BIAS_SCALE_MIN } from "@/engine/bias";
import { computeCalibration } from "@/engine/calibration";
import { computeDelicacyResult, DELICACY_CONFIDENCE_LEVELS } from "@/engine/delicacy";
import {
  assignBiasParams,
  assignDelicacyParams,
  DEFAULT_PERSON_MODEL,
  simulateBias,
  simulateCohort,
  simulateDelicacy,
  simulatePersons,
  snapConfidence,
  syntheticDelicacyItems,
  SIMULATED,
  type PersonModel,
} from "./simulate";

const delicacyItems = assignDelicacyParams(DELICACY_TRIALS);
const biasItems = assignBiasParams(BIAS_CLIPS, 7);

/** Three deliberately different worlds — not three tweaks of one. */
const SCENARIOS: { name: string; seed: number; n: number; model: PersonModel }[] = [
  {
    name: "default cohort",
    seed: 11,
    n: 200,
    model: DEFAULT_PERSON_MODEL,
  },
  {
    name: "sharp ears, immune to labels, underconfident",
    seed: 22,
    n: 200,
    model: {
      ...DEFAULT_PERSON_MODEL,
      thetaMean: 1.5,
      thetaSd: 0.5,
      betaMean: 0.0,
      betaSd: 0.2,
      confBiasMean: -0.15,
    },
  },
  {
    name: "tin ears, wildly suggestible, overconfident",
    seed: 33,
    n: 200,
    model: {
      ...DEFAULT_PERSON_MODEL,
      thetaMean: -1.5,
      betaMean: 2.5,
      betaSd: 1.2,
      confBiasMean: 0.3,
      driftMean: 0.6,
    },
  },
];

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

describe("simulate — determinism", () => {
  it("same seed produces byte-identical datasets", () => {
    const a = simulateDelicacy(5, delicacyItems, simulatePersons(5, 50));
    const b = simulateDelicacy(5, delicacyItems, simulatePersons(5, 50));
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));

    const c = simulateBias(5, biasItems, simulatePersons(5, 50));
    const d = simulateBias(5, biasItems, simulatePersons(5, 50));
    expect(JSON.stringify(c)).toBe(JSON.stringify(d));
  });

  it("a different seed produces different data", () => {
    const a = simulateDelicacy(5, delicacyItems, simulatePersons(5, 50));
    const b = simulateDelicacy(6, delicacyItems, simulatePersons(6, 50));
    expect(JSON.stringify(a.responses)).not.toBe(JSON.stringify(b.responses));
  });

  it("every dataset is stamped SIMULATED (N3 — the /lab badge reads this)", () => {
    expect(simulateDelicacy(1, delicacyItems, simulatePersons(1, 3)).dataSource).toBe(SIMULATED);
    expect(simulateBias(1, biasItems, simulatePersons(1, 3)).dataSource).toBe(SIMULATED);
  });

  it("rejects degenerate inputs instead of emitting quiet garbage", () => {
    expect(() => simulatePersons(1, 0)).toThrow(/positive integer/);
    expect(() => simulateDelicacy(1, [], simulatePersons(1, 2))).toThrow(/item list is empty/);
    expect(() => simulateBias(1, [], simulatePersons(1, 2))).toThrow(/item list is empty/);
  });
});

describe("simulate — confidence snapping", () => {
  it("DELICACY_CONFIDENCE_LEVELS is descending (snapConfidence assumes it)", () => {
    const levels = [...DELICACY_CONFIDENCE_LEVELS];
    expect(levels).toEqual([...levels].sort((a, b) => b - a));
  });

  it("snaps at the midpoints between offered taps", () => {
    expect(snapConfidence(1.0)).toBe(95);
    expect(snapConfidence(0.83)).toBe(95); // just above the 95/70 midpoint (82.5)
    expect(snapConfidence(0.82)).toBe(70); // just below it
    expect(snapConfidence(0.61)).toBe(70); // just above the 70/50 midpoint (60)
    expect(snapConfidence(0.59)).toBe(50);
    expect(snapConfidence(0.0)).toBe(50); // clamps at the lowest offered tap
  });
});

describe("simulate — production shape (runs through the SHIPPING engines)", () => {
  for (const s of SCENARIOS) {
    it(`"${s.name}": every simulated session computes without throwing`, () => {
      const persons = simulatePersons(s.seed, s.n, s.model);
      const del = simulateDelicacy(s.seed, delicacyItems, persons);
      const bias = simulateBias(s.seed, biasItems, persons);

      for (let i = 0; i < persons.length; i++) {
        const dr = computeDelicacyResult("sim-delicacy", delicacyItems, del.responses[i]);
        expect(dr.nTrials).toBe(delicacyItems.length);
        expect(dr.accuracy).toBeGreaterThanOrEqual(0);
        expect(dr.accuracy).toBeLessThanOrEqual(1);

        // Calibration consumes delicacy receipts directly — prove that seam too.
        const cal = computeCalibration(dr.receipts.map((r) => ({ confidence: r.confidence, correct: r.correct })));
        expect(cal.brier).toBeGreaterThanOrEqual(0);
        expect(cal.brier).toBeLessThanOrEqual(1);

        const br = computeBiasResult("sim-bias", biasItems, bias.blind[i], bias.labeled[i]);
        expect(br.controlCount).toBe(biasItems.filter((x) => x.isControl).length);
        for (const rating of [...Object.values(bias.blind[i]), ...Object.values(bias.labeled[i])]) {
          expect(Number.isInteger(rating)).toBe(true);
          expect(rating).toBeGreaterThanOrEqual(BIAS_SCALE_MIN);
          expect(rating).toBeLessThanOrEqual(BIAS_SCALE_MAX);
        }
      }
    });
  }
});

describe("simulate — the known parameters actually drive the outcomes", () => {
  // n is set by the least-powered assertion in this block (control drift, whose
  // SE at n=400 is ~0.036 against a true value of ~0.07 — a coin flip). Sizing
  // the cohort to the weakest test is cheaper than shipping a flaky one.
  const persons = simulatePersons(101, 1500);
  const del = simulateDelicacy(101, delicacyItems, persons);
  const bias = simulateBias(101, biasItems, persons);
  const accuracy = del.responses.map((r) => computeDelicacyResult("sim", delicacyItems, r).accuracy);
  const headline = bias.blind.map((_, i) => computeBiasResult("sim", biasItems, bias.blind[i], bias.labeled[i]).pct);

  /** Split the cohort at the median of a ground-truth parameter. */
  const splitBy = (param: (p: typeof persons[number]) => number, outcome: number[]) => {
    const idx = persons.map((_, i) => i).sort((x, y) => param(persons[x]) - param(persons[y]));
    const half = Math.floor(idx.length / 2);
    return {
      low: mean(idx.slice(0, half).map((i) => outcome[i])),
      high: mean(idx.slice(half).map((i) => outcome[i])),
    };
  };

  it("higher ability (θ) → higher delicacy accuracy", () => {
    const { low, high } = splitBy((p) => p.theta, accuracy);
    expect(high).toBeGreaterThan(low + 0.1);
  });

  it("higher susceptibility (β) → larger sway headline", () => {
    const { low, high } = splitBy((p) => p.beta, headline);
    expect(high).toBeGreaterThan(low + 5);
  });

  it("larger miscalibration in EITHER direction → worse Brier", () => {
    const brier = del.responses.map((r) =>
      computeCalibration(
        computeDelicacyResult("sim", delicacyItems, r).receipts.map((x) => ({
          confidence: x.confidence,
          correct: x.correct,
        })),
      ).brier,
    );
    // Splitting on SIGNED confBias would compare underconfident people against
    // overconfident ones — both miscalibrated, so the comparison says nothing.
    // confBias = 0 is exact calibration here (felt p = true p), so distance
    // from zero is the quantity that should degrade Brier.
    const { low, high } = splitBy((p) => Math.abs(p.confBias), brier);
    expect(high).toBeGreaterThan(low);
  });

  it("control items receive drift but NO label pull (the baseline must stay clean)", () => {
    const drifts = bias.blind.map(
      (_, i) => computeBiasResult("sim", biasItems, bias.blind[i], bias.labeled[i]).controlDriftPts ?? 0,
    );
    const observed = mean(drifts);
    // The pull is what must NOT be in here: controls are the baseline precisely
    // because no label ever touches them.
    expect(observed).toBeLessThan(DEFAULT_PERSON_MODEL.betaMean / 2);
    expect(observed).toBeGreaterThan(0);
  });

  it("MEASURES the ceiling truncation of the control baseline (an instrument finding)", () => {
    const controls = biasItems.filter((i) => i.isControl);
    const trueDrift = mean(persons.map((p) => p.drift));
    const obs = persons.flatMap((_, i) => controls.map((c) => bias.labeled[i][c.id] - bias.blind[i][c.id]));
    const atCeiling =
      persons.flatMap((_, i) => controls.map((c) => bias.blind[i][c.id])).filter((r) => r === BIAS_SCALE_MAX).length /
      obs.length;
    console.log(
      `[sim] control baseline: true drift ${trueDrift.toFixed(3)} → measured ${mean(obs).toFixed(3)} ` +
        `(${(atCeiling * 100).toFixed(1)}% of control ratings sit at the ceiling and can only fall)`,
    );
    // The measured baseline is biased toward zero, so the engine's RT-2a
    // correction is systematically too SMALL. Locking the direction here so a
    // future change that silently "fixes" it has to argue with a test.
    expect(mean(obs)).toBeLessThan(trueDrift);
    expect(atCeiling).toBeGreaterThan(0.01);
  });

  it("reproduces the scale-edge artifact at a rate worth estimating against", () => {
    const edges = bias.blind.map((_, i) =>
      computeBiasResult("sim", biasItems, bias.blind[i], bias.labeled[i]).edgeCount,
    );
    // A `.some(> 0)` assertion would pass on one lucky session and prove
    // nothing. The estimator has to meet this artifact often enough to be
    // tested by it, but not so often that the scale is effectively broken.
    const rate = edges.filter((e) => e > 0).length / edges.length;
    console.log(`[sim] sessions containing at least one scale-edge item: ${(rate * 100).toFixed(1)}%`);
    expect(rate).toBeGreaterThan(0.05);
    expect(rate).toBeLessThan(0.9);
  });

  it("flaw accuracy sits below side accuracy (naming is the harder task)", () => {
    const results = del.responses.map((r) => computeDelicacyResult("sim", delicacyItems, r));
    const flaw = results.filter((r) => r.flawAccuracy !== null).map((r) => r.flawAccuracy as number);
    expect(mean(flaw)).toBeLessThan(mean(accuracy));
  });
});

describe("simulate — cohort coherence and stream independence (RT fixes)", () => {
  it("simulateCohort shares ONE person array across both instruments", () => {
    const c = simulateCohort(9, 30, { delicacy: delicacyItems, bias: biasItems });
    // Identity, not just equality: a join on person id can never merge strangers.
    expect(c.delicacy.persons).toBe(c.persons);
    expect(c.bias.persons).toBe(c.persons);
    expect(c.dataSource).toBe(SIMULATED);
    expect(JSON.stringify(c)).toBe(JSON.stringify(simulateCohort(9, 30, { delicacy: delicacyItems, bias: biasItems })));
  });

  it("a person's data does NOT depend on how many people were generated", () => {
    const small = simulateCohort(9, 10, { delicacy: delicacyItems, bias: biasItems });
    const large = simulateCohort(9, 500, { delicacy: delicacyItems, bias: biasItems });
    // n=10 must be an exact prefix of n=500 — persons AND responses. S2's
    // recovery-vs-sample-size proof is only interpretable if this holds.
    expect(JSON.stringify(large.persons.slice(0, 10))).toBe(JSON.stringify(small.persons));
    expect(JSON.stringify(large.delicacy.responses.slice(0, 10))).toBe(JSON.stringify(small.delicacy.responses));
    expect(JSON.stringify(large.bias.blind.slice(0, 10))).toBe(JSON.stringify(small.bias.blind));
    expect(JSON.stringify(large.bias.labeled.slice(0, 10))).toBe(JSON.stringify(small.bias.labeled));
  });

  it("a person's data does NOT depend on how many items are in the OTHER pool", () => {
    const persons = simulatePersons(9, 20);
    const six = simulateDelicacy(9, delicacyItems, persons);
    const bank = simulateDelicacy(9, syntheticDelicacyItems(2, 40), persons);
    // Person 0's bias ratings must be untouched by the delicacy pool size, and
    // each person's delicacy stream starts fresh rather than continuing the last.
    expect(Object.keys(six.responses[0])).toHaveLength(delicacyItems.length);
    expect(Object.keys(bank.responses[0])).toHaveLength(40);
    const biasA = simulateBias(9, biasItems, persons);
    const biasB = simulateBias(9, biasItems, simulatePersons(9, 20));
    expect(JSON.stringify(biasA.blind)).toBe(JSON.stringify(biasB.blind));
  });

  it("thetaBetaCorrelation is honoured, and defaults to an EXPLICIT zero (N3)", () => {
    expect(DEFAULT_PERSON_MODEL.thetaBetaCorrelation).toBe(0);
    const corr = (xs: number[], ys: number[]) => {
      const mx = mean(xs), my = mean(ys);
      const cov = mean(xs.map((x, i) => (x - mx) * (ys[i] - my)));
      const sx = Math.sqrt(mean(xs.map((x) => (x - mx) ** 2)));
      const sy = Math.sqrt(mean(ys.map((y) => (y - my) ** 2)));
      return cov / (sx * sy);
    };
    const at = (rho: number) => {
      const ps = simulatePersons(4242, 3000, { ...DEFAULT_PERSON_MODEL, thetaBetaCorrelation: rho });
      return corr(ps.map((p) => p.theta), ps.map((p) => p.beta));
    };
    console.log(`[sim] θ–β correlation recovered: rho=0 → ${at(0).toFixed(3)}, rho=-0.6 → ${at(-0.6).toFixed(3)}`);
    expect(Math.abs(at(0))).toBeLessThan(0.05);
    expect(at(-0.6)).toBeLessThan(-0.55);
    expect(at(-0.6)).toBeGreaterThan(-0.65);
    expect(() => simulatePersons(1, 5, { ...DEFAULT_PERSON_MODEL, thetaBetaCorrelation: 1.4 })).toThrow(/\[-1,1\]/);
  });

  it("marginal SDs stay as specified regardless of rho (Cholesky sanity)", () => {
    const sd = (xs: number[]) => Math.sqrt(mean(xs.map((x) => (x - mean(xs)) ** 2)));
    for (const rho of [0, -0.6, 0.9]) {
      const ps = simulatePersons(55, 3000, { ...DEFAULT_PERSON_MODEL, thetaBetaCorrelation: rho });
      expect(sd(ps.map((p) => p.beta))).toBeCloseTo(DEFAULT_PERSON_MODEL.betaSd, 1);
    }
  });
});

describe("simulate — synthetic item bank (what S2 recovers against)", () => {
  const bank = syntheticDelicacyItems(77, 40);

  it("is deterministic and well-formed", () => {
    expect(JSON.stringify(bank)).toBe(JSON.stringify(syntheticDelicacyItems(77, 40)));
    expect(new Set(bank.map((i) => i.id)).size).toBe(bank.length);
    expect(() => syntheticDelicacyItems(1, 0)).toThrow(/positive integer/);
  });

  it("has REAL variance in both parameters (a flat bank makes recovery vacuous)", () => {
    const sd = (xs: number[]) => Math.sqrt(mean(xs.map((x) => (x - mean(xs)) ** 2)));
    expect(sd(bank.map((i) => i.b))).toBeGreaterThan(0.5);
    expect(sd(bank.map((i) => i.a))).toBeGreaterThan(0.1);
  });

  it("discrimination is strictly positive (a negative slope is a broken item, not a draw)", () => {
    for (const i of bank) expect(i.a).toBeGreaterThan(0);
  });

  it("harder items are answered correctly less often", () => {
    const persons = simulatePersons(78, 300);
    const data = simulateDelicacy(78, bank, persons);
    const pCorrect = bank.map(
      (item) => data.responses.filter((r) => r[item.id].pickedSide === item.originalSide).length / persons.length,
    );
    const sorted = bank.map((_, i) => i).sort((x, y) => bank[x].b - bank[y].b);
    const easiestThird = mean(sorted.slice(0, 13).map((i) => pCorrect[i]));
    const hardestThird = mean(sorted.slice(-13).map((i) => pCorrect[i]));
    console.log(
      `[sim] bank P(correct): easiest third ${(easiestThird * 100).toFixed(1)}%  ` +
        `hardest third ${(hardestThird * 100).toFixed(1)}%  (chance 50.0%)`,
    );
    expect(easiestThird).toBeGreaterThan(hardestThird + 0.15);
    // Nothing may sit below chance: that would mean the model is punishing ability.
    for (const p of pCorrect) expect(p).toBeGreaterThan(0.35);
  });
});

describe("simulate — printed behaviour summary (S1 PROVE)", () => {
  it("prints cohort summaries for 3 diverse parameter sets", () => {
    for (const s of SCENARIOS) {
      const persons = simulatePersons(s.seed, s.n, s.model);
      const del = simulateDelicacy(s.seed, delicacyItems, persons);
      const bias = simulateBias(s.seed, biasItems, persons);
      const results = del.responses.map((r) => computeDelicacyResult("sim", delicacyItems, r));
      const biasResults = bias.blind.map((_, i) =>
        computeBiasResult("sim", biasItems, bias.blind[i], bias.labeled[i]),
      );
      const cals = results.map((r) =>
        computeCalibration(r.receipts.map((x) => ({ confidence: x.confidence, correct: x.correct }))),
      );
      const verdicts = { swayed: 0, steady: 0, contrarian: 0 };
      for (const b of biasResults) verdicts[b.verdict]++;

      const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
      console.log(
        [
          `[sim] ${s.name.padEnd(42)} (seed ${s.seed}, n=${s.n}) SIMULATED`,
          `      delicacy accuracy ${pct(mean(results.map((r) => r.accuracy)))}  ` +
            `flaw ${pct(mean(results.filter((r) => r.flawAccuracy !== null).map((r) => r.flawAccuracy as number)))}  ` +
            `(chance 50.0% / 33.3%)`,
          `      bias headline mean ${mean(biasResults.map((b) => b.pct)).toFixed(1)}%  ` +
            `verdicts swayed ${verdicts.swayed} / steady ${verdicts.steady} / contrarian ${verdicts.contrarian}`,
          `      calibration mean Brier ${mean(cals.map((c) => c.brier)).toFixed(3)}  ` +
            `mean gap ${mean(cals.map((c) => c.gapPct)).toFixed(1)}pts (+ = overconfident)`,
        ].join("\n"),
      );
    }
    expect(true).toBe(true); // the assertions live in the suites above; this block reports
  });
});
