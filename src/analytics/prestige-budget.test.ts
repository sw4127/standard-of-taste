/**
 * E6/S6 — WHAT FIVE MINUTES OF THE PRESTIGE TEST BUYS [SIMULATED].
 *
 * E5/S4 priced the staircase by information per minute and the pricing changed
 * the product: pitch gave six minutes back and delivered more per minute than
 * before. The Prestige Test (10 clips, ~5 min) had never had the question asked
 * of it. This asks it.
 *
 * THE CRITERION IS DERIVED FROM THE CLAIM, NOT INVENTED — the R3 discipline.
 * Abstract "information per minute" is the wrong gate here and would have
 * flattered us: for a FIXED-FORM test, Fisher information is additive in items
 * and so are minutes, so information-per-minute is constant by construction and
 * every length scores the same. A number that cannot come out wrong is useless.
 *
 * What the test actually says to a person is a VERDICT — swayed at >= +15% of
 * scale, contrarian at <= -15% (`BIAS_SWAYED_AT`). So the question is:
 *
 *   How often does the test put someone on the correct side of its own line?
 *
 * That is derived entirely from a constant already on the result screen, and it
 * cannot be met by moving the goalposts.
 *
 * ================================ THE ANSWER ================================
 *
 * The POOL is the binding constraint, not the session length. Precision follows
 * SD = 11.0 / sqrt(n) percentage points cleanly (residuals within 0.4 across
 * n = 2..8) and is STILL FALLING when the pool runs out. The 8th and last
 * scored clip is among the most valuable in the set: -0.47 SD and +1.4pp of
 * verdict agreement, bought for 30 seconds.
 *
 * So five minutes is not too long. If anything the instrument is under-fed, and
 * the way to improve it is more scored clips, not a shorter session:
 *
 *      SD 3.5 pts needs ~10 scored ->  6.0 min
 *      SD 3.0 pts needs ~14 scored ->  7.8 min
 *      SD 2.5 pts needs ~19 scored -> 10.9 min
 *
 * E7/S5 RE-MEASURED AT THE GROWN POOL (RT-103a, 14 scored + 2 controls). The
 * projections above were extrapolations from a curve that ended at 8; the pool
 * now reaches 14, so they are replaced by measurements:
 *
 *      n= 8 scored  5.1 min  SD 3.65  agree 89.2%  near-line 72.8%
 *      n=14 scored  8.1 min  SD 2.58  agree 92.7%  near-line 80.0%
 *
 * BETTER THAN THE EXTRAPOLATION PREDICTED. 11.02/sqrt(14) forecast SD 2.94; the
 * measurement is 2.58, and the fitted constant over the longer curve is 10.30
 * rather than 11.02. The old projections are kept above rather than edited,
 * because the gap between a forecast and its outcome is the useful part.
 *
 * At the shipping length, verdict agreement is ~89% overall but only ~73% for
 * people whose true position sits within 5 points of a line. That second number
 * is the honest one to hold this instrument to, and no length in reach fixes
 * it: a threshold verdict on a continuous quantity is coin-flippy near the
 * threshold however good the estimate is.
 *
 * ============================== WHAT WAS WRONG ==============================
 *
 * Two measurement designs produced clean, plausible, WRONG tables before this
 * one. Both are pinned by assertions below so they cannot come back.
 *
 *   1. Redrawing item parameters per length. n=7 and n=8 then shared no items
 *      at all, and the table said the 8th clip made the instrument worse. That
 *      was the seed talking.
 *   2. A "random subset" shuffle built on `Array.sort` with an inconsistent
 *      comparator. The draws came out near-identical and the curve rose with n,
 *      which a standard error does not do.
 *
 * And one explanation was falsified outright: the apparent plateau was blamed
 * on per-person second-pass drift setting a precision floor. Drift ON and drift
 * OFF are identical to two decimals — see the second test.
 *
 * EVERYTHING HERE IS SIMULATED (N3). There are zero real responses. This
 * measures the ESTIMATOR against a known truth, which is all a simulation can
 * honestly do.
 */

import { describe, it, expect } from "vitest";
import { writeFileSync, mkdirSync } from "node:fs";
import { BIAS_CLIPS } from "@/content/bias/items";
import { BIAS_SWAYED_AT, BIAS_CONTRARIAN_AT, computeBiasResult } from "@/engine/bias";
import { assignBiasParams, simulateBias, simulatePersons, DEFAULT_PERSON_MODEL } from "./simulate";
import { MIN_LISTEN_MS_PER_CLIP, REPLAY_FACTOR } from "@/engine/staircase-session";

const NL = String.fromCharCode(10);
const OUT_DIR = "docs/analytics";

/**
 * The SAME minutes model the Gym is priced with, not a second one.
 *
 * A Prestige item is heard TWICE — blind, then labelled — so an n-item test is
 * 2n listens, where the staircase's n-trial session is 2n clips. Identical
 * arithmetic, identical constants, imported rather than retyped: the rule that
 * made `sessionMinutes` the one definition of session length (E5/S7).
 */
function prestigeMinutes(nItems: number): number {
  return (nItems * 2 * (MIN_LISTEN_MS_PER_CLIP / 1000) * REPLAY_FACTOR) / 60;
}

function verdictOf(pct: number): "swayed" | "neutral" | "contrarian" {
  if (pct >= BIAS_SWAYED_AT) return "swayed";
  if (pct <= BIAS_CONTRARIAN_AT) return "contrarian";
  return "neutral";
}

/** mulberry32 + Fisher-Yates — a real shuffle, for the reason in the header. */
function shuffled(xs: string[], seed: number): string[] {
  let s = seed >>> 0;
  const unit = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(unit() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Cell {
  nItems: number;
  minutes: number;
  /** Mean signed error of the headline, in percentage points of scale. */
  bias: number;
  /** SD of that error — the run-to-run precision of the headline. */
  sd: number;
  /** Share of people placed in their true verdict bucket. */
  agree: number;
  /** Same, restricted to people whose truth is within 5 points of a line. */
  agreeNearLine: number;
}

/**
 * One cell. Item parameters are drawn for the WHOLE pool and then sliced, never
 * redrawn per length — see failure (1) in the header.
 *
 * The controls are always carried. They are not optional length: the RT-2a
 * drift correction is computed from them, so dropping them would make this a
 * different instrument reporting a different number.
 */
function measure(
  nScored: number,
  nPersons: number,
  seed: number,
  driftSd = DEFAULT_PERSON_MODEL.driftSd,
  pick?: string[],
): Cell {
  const allScored = BIAS_CLIPS.filter((c) => !c.isControl);
  const controls = BIAS_CLIPS.filter((c) => c.isControl);
  const pool = assignBiasParams([...allScored, ...controls], seed);
  const chosen = pick ? allScored.filter((c) => pick.includes(c.id)) : allScored.slice(0, nScored);
  const keep = new Set([...chosen, ...controls].map((c) => c.id));
  const items = pool.filter((p) => keep.has(p.id));
  const persons = simulatePersons(seed, nPersons, { ...DEFAULT_PERSON_MODEL, driftSd });
  const data = simulateBias(seed, items, persons);

  const errors: number[] = [];
  let agreed = 0;
  let near = 0;
  let nearAgreed = 0;

  for (const [i, person] of persons.entries()) {
    const result = computeBiasResult("e6", items, data.blind[i], data.labeled[i]);
    // The person's TRUE headline: beta points of sway on a 0-10 scale, as a
    // signed percentage of that scale. This is what the estimator is chasing.
    const truePct = person.beta * 10;
    errors.push(result.pct - truePct);
    const right = verdictOf(result.pct) === verdictOf(truePct);
    if (right) agreed++;
    const dist = Math.min(Math.abs(truePct - BIAS_SWAYED_AT), Math.abs(truePct - BIAS_CONTRARIAN_AT));
    if (dist <= 5) {
      near++;
      if (right) nearAgreed++;
    }
  }

  const mean = errors.reduce((a, b) => a + b, 0) / errors.length;
  const variance = errors.reduce((a, b) => a + (b - mean) ** 2, 0) / (errors.length - 1);
  return {
    nItems: items.length,
    minutes: prestigeMinutes(items.length),
    bias: mean,
    sd: Math.sqrt(variance),
    agree: agreed / persons.length,
    agreeNearLine: near ? nearAgreed / near : Number.NaN,
  };
}

const SCORED = BIAS_CLIPS.filter((c) => !c.isControl).map((c) => c.id);

describe("E6/S6 — minutes in, verdict accuracy out [SIMULATED]", () => {
  it("prices the test by length, averaging item identity away", { timeout: 180_000 }, () => {
    const rows: Array<{ n: number; sd: number; agree: number; near: number; minutes: number }> = [];
    for (let n = 2; n <= SCORED.length; n++) {
      const DRAWS = 16;
      let sd = 0;
      let agree = 0;
      let near = 0;
      let minutes = 0;
      for (let d = 0; d < DRAWS; d++) {
        const cell = measure(
          n,
          1200,
          20260821 + d * 7919,
          DEFAULT_PERSON_MODEL.driftSd,
          shuffled(SCORED, 20260821 + d * 7919 + n).slice(0, n),
        );
        sd += cell.sd;
        agree += cell.agree;
        near += cell.agreeNearLine;
        minutes = cell.minutes;
      }
      rows.push({ n, sd: sd / DRAWS, agree: agree / DRAWS, near: near / DRAWS, minutes });
    }

    // SD = k / sqrt(n), FITTED rather than assumed.
    const ks = rows.map((r) => r.sd * Math.sqrt(r.n));
    const k = ks.reduce((a, b) => a + b, 0) / ks.length;

    mkdirSync(OUT_DIR, { recursive: true });
    writeFileSync(
      `${OUT_DIR}/e6-prestige.txt`,
      [
        "E6/S6 PRESTIGE TEST — LENGTH vs PRECISION [SIMULATED, zero real responses]",
        "16 random subsets x 1200 simulated persons per length; 2 controls always carried.",
        "",
        ...rows.map(
          (r) =>
            `n=${String(r.n).padStart(2)} scored (+2 ctrl)  ${r.minutes.toFixed(1).padStart(4)} min` +
            `  SD ${r.sd.toFixed(2).padStart(5)} pts` +
            `  verdict-agree ${(r.agree * 100).toFixed(1).padStart(5)}%` +
            `  near-line ${(r.near * 100).toFixed(1).padStart(5)}%` +
            `  1/sqrt(n) fit ${(k / Math.sqrt(r.n)).toFixed(2)}`,
        ),
        "",
        `fitted SD = ${k.toFixed(2)} / sqrt(n) percentage points of scale`,
        ...[3.5, 3.0, 2.5].map((t) => {
          const n = (k / t) ** 2;
          return `  to reach SD ${t.toFixed(1)}: ${n.toFixed(1)} scored clips -> ${prestigeMinutes(n + 2).toFixed(1)} min`;
        }),
      ].join(NL),
    );

    // ---- the conclusions, pinned ----

    // Precision must improve monotonically once item identity is averaged out.
    // A curve that rises means the measurement is broken (failure 2).
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].sd, `SD rose from n=${rows[i - 1].n} to n=${rows[i].n}`).toBeLessThanOrEqual(
        rows[i - 1].sd + 0.02,
      );
    }

    // THE HEADLINE: still descending when the pool runs out, so the POOL is the
    // constraint and the session length is not the problem.
    //
    // E7/S5 — REWRITTEN, BECAUSE THE OLD FORM COULD NOT SURVIVE ITS OWN
    // PREDICTION. It asserted `last.sd < prev.sd - 0.2`: an ABSOLUTE decrement
    // at the tail of a 1/sqrt(n) curve, calibrated when the pool ended at 8 and
    // the final step was -0.47. Every step since n=9 is smaller than 0.2 —
    // -0.09, -0.15, -0.18, -0.12, -0.16 — not because the instrument stopped
    // improving but because 1/sqrt(n) flattens BY CONSTRUCTION. Growing the
    // pool to 14 (RT-103a) turned it red while precision was still improving.
    // That is the same species as E6's own falsified finding 3: a criterion
    // that is constant or shrinking by construction is not a measurement.
    //
    // The relative form is the one that means something. Going n-1 -> n, the
    // law predicts SD falls by sqrt((n-1)/n) — 3.6% at n=14. Measured: 5.8%.
    // Still beating its own model at the end of the pool, which is exactly what
    // "the pool is the constraint" claims.
    const last = rows[rows.length - 1];
    const prev = rows[rows.length - 2];
    const predictedRatio = Math.sqrt((last.n - 1) / last.n);
    expect(
      last.sd / prev.sd,
      `SD is no longer falling at least as fast as 1/sqrt(n) at the end of the pool ` +
        `(n=${last.n}: measured ratio ${(last.sd / prev.sd).toFixed(4)}, law predicts ${predictedRatio.toFixed(4)}). ` +
        `If this fails, the instrument has finally been fed enough and the finding needs revisiting.`,
    ).toBeLessThanOrEqual(predictedRatio);
    expect(last.agree).toBeGreaterThan(prev.agree);

    // The 1/sqrt(n) law, checked rather than claimed in prose.
    //
    // E7/S8 — RELATIVE, NOT ABSOLUTE, for the second time in this file. The
    // tolerance was 0.5 POINTS across a curve that runs from SD 7.6 down to
    // 2.6, so it was a 7% test at one end and a 19% test at the other — it
    // measured different things depending where you stood. Recasting the pool
    // (RT-139a) reshuffled the simulated draws and pushed n=4 to a residual of
    // 0.550, tripping it by five hundredths while the shipping length moved by
    // 0.01 points.
    //
    // Measured across the whole curve, the residuals are 0.6%-9.6% of SD, worst
    // at n=4 where a single item's difficulty still dominates and the law is
    // expected to fit worst. 15% is comfortably outside that and still small
    // enough to catch a curve that stops being 1/sqrt(n) at all.
    const MAX_RELATIVE_RESIDUAL = 0.15;
    for (const r of rows) {
      const residual = Math.abs(r.sd - k / Math.sqrt(r.n)) / r.sd;
      expect(
        residual,
        `1/sqrt(n) fit broke at n=${r.n}: SD ${r.sd.toFixed(2)} vs fit ${(k / Math.sqrt(r.n)).toFixed(2)} ` +
          `(${(residual * 100).toFixed(1)}% off)`,
      ).toBeLessThan(MAX_RELATIVE_RESIDUAL);
    }

    // Near-line agreement is the number this instrument should be judged on and
    // it is far worse than the headline. Pinned so it cannot quietly drift up
    // into a claim nobody earned.
    expect(last.near).toBeLessThan(0.8);
    expect(last.near).toBeLessThan(last.agree);
  });

  /**
   * A FALSIFIED EXPLANATION, KEPT AS A REGRESSION.
   *
   * The plateau in the earlier prefix-ordered table was blamed on per-person
   * second-pass drift setting a precision floor. It is not: `pct` measures
   * shift TOWARD the label, and with the pool's up/down labels near-balanced a
   * constant per-person drift cancels before the RT-2a correction even applies.
   *
   * Kept because it is now load-bearing: if a future pool loses its label
   * balance these two curves separate, and this test failing is how someone
   * finds out.
   */
  it("drift does not set the precision floor — the label balance cancels it", { timeout: 120_000 }, () => {
    const sdAt = (driftSd: number) => {
      const reps = Array.from({ length: 8 }, (_, r) =>
        measure(SCORED.length, 1200, 20260821 + r * 7919, driftSd),
      );
      return reps.reduce((a, c) => a + c.sd, 0) / reps.length;
    };
    expect(Math.abs(sdAt(DEFAULT_PERSON_MODEL.driftSd) - sdAt(0))).toBeLessThan(0.05);
  });
});
