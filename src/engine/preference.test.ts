import { describe, expect, it } from "vitest";
import {
  PREFERENCE_ALPHA,
  PREFERENCE_DIMENSIONS,
  PREFERENCE_MAX_TRIALS,
  PREFERENCE_METRICS,
  computePreferenceResult,
  minimumTrialsForDetection,
  trialsForPower,
  twoSidedSignP,
  type PreferenceTrial,
} from "./preference";

/** Build `count` trials on one dimension, `toward` of them favouring `pole`. */
function run(dimension: string, pole: string, other: string, toward: number, count: number) {
  const trials: PreferenceTrial[] = [];
  for (let i = 0; i < count; i++) trials.push({ dimension, chose: i < toward ? pole : other });
  return trials;
}

describe("preference — the exact sign test", () => {
  it("gives the hand-computable two-sided p for a 12-choice run", () => {
    // 2 * (C(12,11) + C(12,12)) / 2^12 = 26/4096
    expect(twoSidedSignP(11, 12)).toBeCloseTo(26 / 4096, 12);
    // 2 * (66 + 12 + 1) / 4096 = 158/4096
    expect(twoSidedSignP(10, 12)).toBeCloseTo(158 / 4096, 12);
    // 2 * (220 + 66 + 12 + 1) / 4096 = 598/4096
    expect(twoSidedSignP(9, 12)).toBeCloseTo(598 / 4096, 12);
  });

  it("is symmetric, and caps the even split at 1 rather than exceeding it", () => {
    expect(twoSidedSignP(9, 12)).toBe(twoSidedSignP(3, 12));
    expect(twoSidedSignP(6, 12)).toBe(1);
  });

  it("returns 1 for no evidence at all, not 0", () => {
    expect(twoSidedSignP(0, 0)).toBe(1);
  });

  it("refuses counts it cannot evaluate exactly, rather than losing precision quietly", () => {
    const over = PREFERENCE_MAX_TRIALS + 1;
    expect(() => twoSidedSignP(over, over)).toThrow(/exact-arithmetic bound/);
    expect(() => twoSidedSignP(5, 3)).toThrow(/not a valid count/);
    expect(() => twoSidedSignP(1.5, 3)).toThrow(/integers/);
  });
});

describe("preference — the detection floor", () => {
  it("is 6 choices alone, 7 across three dimensions, 8 across six", () => {
    expect(minimumTrialsForDetection(1)).toBe(6);
    expect(minimumTrialsForDetection(3)).toBe(7);
    expect(minimumTrialsForDetection(6)).toBe(8);
  });

  it("is exactly the n whose UNANIMOUS run first clears the Holm threshold", () => {
    for (const m of [1, 2, 3, 4, 6]) {
      const floor = minimumTrialsForDetection(m) as number;
      expect(twoSidedSignP(floor, floor)).toBeLessThanOrEqual(PREFERENCE_ALPHA / m);
      expect(twoSidedSignP(floor - 1, floor - 1)).toBeGreaterThan(PREFERENCE_ALPHA / m);
    }
  });

  it("condemns the mock's shape: 12 pairs over 6 dimensions is 2 each, half the floor", () => {
    const perDimension = 12 / PREFERENCE_DIMENSIONS.length;
    expect(perDimension).toBeLessThan(minimumTrialsForDetection(PREFERENCE_DIMENSIONS.length) as number);
  });
});

describe("preference — the power calculation that sizes the clip pool", () => {
  it("needs exactly the floor from a listener who never wavers", () => {
    for (const m of [1, 3, 6]) {
      expect(trialsForPower(1, m)).toBe(minimumTrialsForDetection(m));
    }
  });

  it("needs FIVE TIMES the floor from a real 75%-of-the-time listener", () => {
    // This is the number that sizes the clip pool, and the reason the mock's
    // twelve pairs are not a small miss but a different order of magnitude.
    const floor = minimumTrialsForDetection(6) as number;
    expect(floor).toBe(8);
    expect(trialsForPower(0.75, 6)).toBe(47);
  });

  it("keeps the arithmetic exact right up to the bound it advertises", () => {
    // The bound's whole justification. If either quantity crosses 2^53 the
    // p-values go quietly wrong, which is the failure this refuses to have.
    const n = PREFERENCE_MAX_TRIALS;
    let central = 1;
    for (let i = 1; i <= Math.floor(n / 2); i++) central = (central * (n - Math.floor(n / 2) + i)) / i;
    expect(Math.round(central)).toBeLessThan(Number.MAX_SAFE_INTEGER);
    expect(Math.pow(2, n - 1)).toBeLessThan(Number.MAX_SAFE_INTEGER);
    expect(twoSidedSignP(n, n)).toBe(2 / Math.pow(2, n));
  });

  it("returns null for a weak preference rather than a reassuring number", () => {
    expect(trialsForPower(0.55, 6)).toBeNull();
  });

  it("never asks for fewer choices as the preference gets weaker", () => {
    const at90 = trialsForPower(0.9, 6) as number;
    const at80 = trialsForPower(0.8, 6) as number;
    expect(at80).toBeGreaterThanOrEqual(at90);
  });

  it("rejects a rate that is not a preference at all", () => {
    expect(() => trialsForPower(0.5, 6)).toThrow(/must lie/);
  });
});

describe("preference — the instrument, on the mock's own invented numbers", () => {
  // docs/preference-mock-2026-09-13.md, verbatim: space 11/12 close, warmth
  // 10/12 warm, dynamics 9/12 controlled against a stated "open", tempo 7/12.
  const trials = [
    ...run("dynamics", "controlled", "open", 9, 12),
    ...run("space", "close", "spacious", 11, 12),
    ...run("saturation", "warm", "clean", 10, 12),
    ...run("tempo", "faster", "slower", 7, 12),
  ];
  const claims = [
    { dimension: "dynamics", pole: "open" },
    { dimension: "space", pole: "close" },
    { dimension: "saturation", pole: "warm" },
  ];
  const result = computePreferenceResult(trials, claims);
  const of = (id: string) => result.dimensions.find((d) => d.dimension === id)!;

  it("is powered — twelve choices clears the four-dimension floor of eight", () => {
    expect(result.trialFloor).toBe(8);
    expect(result.powered).toBe(true);
  });

  it("keeps only Space, the one claim that survives the multiplicity correction", () => {
    expect(of("space").verdict).toBe("consistent");
    expect(of("space").agreement).toBe("agrees");
    expect(result.words).toEqual(["close"]);
  });

  it("REFUSES the mock's flagship contradiction: 9 of 12 does not clear chance", () => {
    expect(of("dynamics").p).toBeGreaterThan(PREFERENCE_ALPHA);
    expect(of("dynamics").verdict).toBe("indeterminate");
    expect(of("dynamics").agreement).toBe("undetermined");
    expect(result.contradictions).toEqual([]);
  });

  it("refuses the mock's 'settled' warmth too — 10 of 12 clears 0.05 but not Holm", () => {
    expect(of("saturation").p).toBeLessThan(PREFERENCE_ALPHA);
    expect(of("saturation").verdict).toBe("indeterminate");
    expect(result.agreements).toEqual(["space"]);
  });

  it("agrees with the mock about tempo, which is the one thing it got right", () => {
    expect(of("tempo").verdict).toBe("indeterminate");
    expect(result.words).not.toContain("faster");
  });

  it("reports the dimensions in declared order, not in the order trials arrived", () => {
    expect(result.dimensions.map((d) => d.dimension)).toEqual([
      "dynamics",
      "space",
      "saturation",
      "tempo",
    ]);
  });
});

describe("preference — underpowered is not the same as nothing found", () => {
  const short = computePreferenceResult([
    ...run("dynamics", "controlled", "open", 4, 4),
    ...run("space", "close", "spacious", 4, 4),
    ...run("saturation", "warm", "clean", 4, 4),
    ...run("tempo", "faster", "slower", 4, 4),
    ...run("brightness", "bright", "dark", 4, 4),
    ...run("width", "wide", "narrow", 4, 4),
  ]);

  it("calls a unanimous run below the floor UNDERPOWERED, never indeterminate", () => {
    expect(short.trialFloor).toBe(8);
    expect(short.powered).toBe(false);
    for (const d of short.dimensions) expect(d.verdict).toBe("underpowered");
  });

  it("offers no words from a sitting that could not have found any", () => {
    expect(short.words).toEqual([]);
  });

  it("holds the floor even where Holm's LAST step would have let it through", () => {
    // The case a mutation test found, and the reason the floor is checked
    // before the threshold rather than instead of it. Five dimensions reject
    // at 10/10, so the sixth is compared against the final, laxest step of
    // alpha/1 = 0.05 — and its 6/6 run reaches p = 0.031, which clears it. By
    // arithmetic it is a finding; by the floor of 8 the sitting was never long
    // enough to have earned one, and the floor wins.
    const mixed = computePreferenceResult([
      ...run("dynamics", "controlled", "open", 10, 10),
      ...run("space", "close", "spacious", 10, 10),
      ...run("saturation", "warm", "clean", 10, 10),
      ...run("brightness", "bright", "dark", 10, 10),
      ...run("width", "wide", "narrow", 10, 10),
      ...run("tempo", "faster", "slower", 6, 6),
    ]);
    const tempo = mixed.dimensions.find((d) => d.dimension === "tempo")!;
    expect(mixed.trialFloor).toBe(8);
    expect(tempo.trials).toBe(6);
    expect(tempo.p).toBeLessThanOrEqual(tempo.threshold as number);
    expect(tempo.verdict).toBe("underpowered");
    expect(mixed.words).not.toContain("faster");
    expect(mixed.powered).toBe(false);
  });

  it("applies no threshold at all to a dimension Holm never reached", () => {
    const stopped = computePreferenceResult([
      ...run("dynamics", "controlled", "open", 10, 10),
      ...run("space", "close", "spacious", 6, 10),
      ...run("saturation", "warm", "clean", 6, 10),
    ]);
    const space = stopped.dimensions.find((d) => d.dimension === "space")!;
    expect(space.threshold).toBeNull();
    expect(space.verdict).toBe("indeterminate");
  });

  it("separates the two: the same listener at the floor produces findings", () => {
    const long = computePreferenceResult([
      ...run("dynamics", "controlled", "open", 8, 8),
      ...run("space", "close", "spacious", 8, 8),
      ...run("saturation", "warm", "clean", 8, 8),
      ...run("tempo", "faster", "slower", 8, 8),
      ...run("brightness", "bright", "dark", 8, 8),
      ...run("width", "wide", "narrow", 8, 8),
    ]);
    expect(long.powered).toBe(true);
    expect(long.dimensions.every((d) => d.verdict === "consistent")).toBe(true);
    expect(long.words).toEqual(["tightly controlled", "bright", "close", "warm", "faster", "wide"]);
  });
});

describe("preference — self-report is never scored (D2)", () => {
  const trials = [
    ...run("space", "close", "spacious", 12, 12),
    ...run("tempo", "faster", "slower", 7, 12),
  ];

  it("produces identical numbers with the claims removed", () => {
    const withClaims = computePreferenceResult(trials, [
      { dimension: "space", pole: "spacious" },
      { dimension: "tempo", pole: "faster" },
    ]);
    const without = computePreferenceResult(trials, []);
    const strip = (r: ReturnType<typeof computePreferenceResult>) =>
      r.dimensions.map(({ claimed, agreement, ...rest }) => rest);
    expect(strip(withClaims)).toEqual(strip(without));
    expect(withClaims.words).toEqual(without.words);
  });

  it("labels a contradiction only where the blind choices actually found one", () => {
    const r = computePreferenceResult(trials, [
      { dimension: "space", pole: "spacious" },
      { dimension: "tempo", pole: "faster" },
    ]);
    expect(r.contradictions).toEqual(["space"]);
    // Tempo was claimed and the leaning agrees with the claim by count alone —
    // but it never cleared the threshold, so it is undetermined, not "agrees".
    expect(r.dimensions.find((d) => d.dimension === "tempo")!.agreement).toBe("undetermined");
  });

  it("says no-claim where nothing was stated, which is not the same as undetermined", () => {
    const r = computePreferenceResult(trials, []);
    for (const d of r.dimensions) expect(d.agreement).toBe("no-claim");
  });
});

describe("preference — Holm stops, and malformed input throws", () => {
  it("fails every larger p once one fails, even one that would clear its own step", () => {
    // dynamics 8/8 (p = 0.0078), space 7/8 (p = 0.0703), saturation 8/8.
    // Sorted: 0.0078, 0.0078, 0.0703. Steps: 0.0167, 0.025, 0.05. The third
    // fails at 0.05, so nothing after it could pass — and nothing does.
    const r = computePreferenceResult([
      ...run("dynamics", "controlled", "open", 8, 8),
      ...run("space", "close", "spacious", 7, 8),
      ...run("saturation", "warm", "clean", 8, 8),
    ]);
    expect(r.dimensions.find((d) => d.dimension === "space")!.verdict).toBe("indeterminate");
    expect(r.words).toEqual(["tightly controlled", "warm"]);
  });

  it("calls an exact tie no leaning at all", () => {
    const r = computePreferenceResult(run("tempo", "faster", "slower", 5, 10));
    expect(r.dimensions[0].leaning).toBeNull();
    expect(r.words).toEqual([]);
  });

  it("throws rather than silently dropping evidence", () => {
    expect(() => computePreferenceResult([])).toThrow(/no trials/);
    expect(() => computePreferenceResult([{ dimension: "vibes", chose: "good" }])).toThrow(
      /unknown dimension/,
    );
    expect(() => computePreferenceResult([{ dimension: "tempo", chose: "loud" }])).toThrow(
      /not a pole/,
    );
    expect(() =>
      computePreferenceResult(run("tempo", "faster", "slower", 6, 8), [
        { dimension: "tempo", pole: "faster" },
        { dimension: "tempo", pole: "slower" },
      ]),
    ).toThrow(/two claims/);
  });
});

describe("preference — declared metrics", () => {
  it("declares ids, formulas and honesty caveats beside the arithmetic", () => {
    expect(PREFERENCE_METRICS.length).toBeGreaterThan(0);
    for (const m of PREFERENCE_METRICS) {
      expect(m.id).toMatch(/^[a-z_]+$/);
      expect(m.formula.length).toBeGreaterThan(10);
      expect(m.target).toBeNull();
      expect(m.caveat && m.caveat.length).toBeGreaterThan(40);
    }
  });

  it("gives every dimension two distinct poles with a word and a statement", () => {
    const ids = new Set<string>();
    for (const d of PREFERENCE_DIMENSIONS) {
      expect(d.poles[0].id).not.toBe(d.poles[1].id);
      for (const p of d.poles) {
        expect(p.word.length).toBeGreaterThan(2);
        expect(p.statement.startsWith("I like music that")).toBe(true);
        ids.add(p.id);
      }
    }
    expect(ids.size).toBe(PREFERENCE_DIMENSIONS.length * 2);
  });
});
