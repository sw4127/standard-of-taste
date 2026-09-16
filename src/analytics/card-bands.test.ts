/**
 * E21/T-S1 — WHAT A LADDER CAN ACTUALLY SAY ABOUT HOW FINELY SOMEBODY HEARS.
 *
 * THE NUMBER COMES BEFORE THE SENTENCE. Track T's deliverable is a card that
 * tells a person which prompt descriptors are worth spending on each axis, and
 * that recommendation rests entirely on a comparison — this axis is one you
 * discriminate FINELY, that one you do not. A comparison needs a boundary, and
 * a boundary the instrument cannot resolve is a coin toss wearing a unit. So
 * this file derives how many bands each shipped ladder supports, and T-S2 may
 * only build a card the numbers here license.
 *
 * PRE-REGISTERED, WRITTEN BEFORE THE FILE WAS RUN. Four criteria:
 *
 *   (i)   BAND AGREEMENT. Simulating listeners spread across a ladder's range,
 *         the band the SESSION reports must be the band the listener is truly
 *         in, at least 80% of the time. This is the card being right.
 *   (ii)  REPEAT AGREEMENT. Two independent sittings by the SAME listener must
 *         land in the same band at least 80% of the time. This is the card not
 *         contradicting itself, and it is the bar that matters to a reader who
 *         comes back — the product's own retest loop would otherwise tell them
 *         their ear moved when only the seed did.
 *   (iii) THE CHOSEN COUNT IS THE LARGEST k CLEARING BOTH. Not the k that reads
 *         best. One band is a permitted answer and means the card makes no
 *         fineness claim for that family at all.
 *   (iv)  THE VACUITY CHECK. k = 1 must score 100% on both, because with one
 *         band every session trivially agrees with every other. If it does not,
 *         the harness is broken and every number below it is noise. This is the
 *         count-floor of this measurement: three guards in this repository have
 *         passed by measuring nothing, and a simulation that silently produced
 *         no sessions would otherwise report a perfect score.
 *
 * WHAT THIS DELIBERATELY DOES NOT MEASURE: whether a band boundary falls
 * anywhere a listener would care about. Equal bands in log magnitude are a
 * defensible default and nothing more — the ladder's range is the instrument's
 * range, not a statement about which detunings matter musically. If a future
 * session wants perceptually-placed boundaries it needs listeners, not this.
 *
 * ALL FIGURES SIMULATED (N3). There are zero real responses; anything derived
 * here carries the badge wherever it surfaces.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { observer as obs, claimTarget, pCorrect, rng, type Observer } from "@/analytics/observer";
import { fitThreshold } from "@/engine/threshold-fit";
import { eligibleSources } from "@/engine/staircase-pool";
import {
  answer,
  axisFor,
  isFinished,
  nextTrial,
  startSession,
  type StaircaseSession,
} from "@/engine/staircase-session";
import {
  CARD_BANDS,
  CARD_BAND_AGREEMENT_FLOOR,
  CARD_BAND_CANDIDATES,
  bandFor,
  bandIndexIn,
} from "@/engine/card-bands";
import { ladderDirection, ladderLevels } from "@/engine/staircase-manifest";

const NL = String.fromCharCode(10);
const OUT_DIR = "docs/analytics";
const OUT = `${OUT_DIR}/e21-card-bands.txt`;
const lines: string[] = [];
const say = (s: string) => {
  lines.push(s);
  console.log(`[E21] ${s}`);
};

/** The simulated listener's curve. Same shape the arc measurement used. */
const BETA = 0.35;
const LAPSE = 0.02;

/** Listeners per ladder. Each sits twice, so this is half the session count. */
const LISTENERS = 400;

/**
 * SAMPLE FLOORS, AND AN HONEST NOTE ABOUT WHAT THEY ARE CURRENTLY DOING.
 *
 * THE HAZARD IS REAL. `lossy/pb1` produces a point estimate in a small share of
 * sittings, so the pairs where BOTH visits produce one are a handful — three,
 * on this run — and it scores 100% repeat agreement at three bands on those
 * three pairs. A rate computed on a sample that size is not a measurement, and
 * reading it as one is how a card ends up telling somebody their compression
 * hearing is fine on the evidence of three coin flips.
 *
 * THEY CHANGE NOTHING ON THE LADDERS THAT SHIP, AND I FIRST WROTE THAT THEY
 * DID. Measured by deleting them: every band count they exclude is already
 * excluded by the rate bars — pb1's three-pair 100% sits beside 77.0% band
 * agreement, which fails on its own. So this is a floor against a hazard the
 * current numbers happen not to trigger, not a fix for an outcome it changed,
 * and the difference matters because the first version of this comment claimed
 * the credit.
 *
 * IT IS KEPT ANYWAY, AND IT IS EXERCISED. A ladder that gets longer, an
 * agreement bar that moves, or a source whose refusal rate improves would all
 * put a small sample within reach of passing both rates. `chooseBandCount` is
 * a pure function for exactly this reason: the case that cannot be produced
 * from the shipped ladders is constructed directly in the test below, so the
 * floor is proved to bind rather than assumed to.
 *
 * 100 sittings and 50 pairs are the smallest samples on which an 80% bar means
 * anything at all.
 */
const MIN_AGREE_N = 100;
const MIN_REPEAT_N = 50;

const LOSSY = "lossy-artifact";

/** Every ladder a session can actually run on, from the SHIPPING source set. */
const LADDERS: Array<{ name: string; family: string; sourceId?: string }> = [
  { name: "pitch", family: "pitch-drift" },
  { name: "timing", family: "timing-smear" },
  ...eligibleSources(LOSSY).map((sourceId) => ({ name: `lossy/${sourceId}`, family: LOSSY, sourceId })),
];

/**
 * A listener whose TRUE threshold — the number the product would print for a
 * perfect measurement — is `t`.
 *
 * `claimTarget` is linear in alpha, so one evaluation at alpha = 1 gives the
 * scale factor. Inverting the observer rather than assuming a closed form is
 * the convention `observer.ts` sets and the reason its own docblock gives: a
 * target computed by inverting the observer cannot disagree with the observer.
 */
const UNIT_AT_ALPHA_1 = claimTarget(obs(1, BETA, 0));
const listenerAt = (t: number): Observer => obs(t / UNIT_AT_ALPHA_1, BETA, LAPSE);

/** One full session at the SHIPPED budget, through the real session API. */
function play(family: string, sourceId: string | undefined, seed: number, o: Observer): StaircaseSession {
  let s = startSession(family, seed, sourceId);
  const rand = rng(seed ^ 0x2f1b3d5f);
  while (!isFinished(s)) {
    const t = nextTrial(s);
    s = answer(s, rand() < pCorrect(s.axis.magnitudes[t.levelIndex], o));
  }
  return s;
}

/** The point estimate a session would print, or null when it refuses one. */
function reported(s: StaircaseSession): number | null {
  const outcome = fitThreshold(s.state, s.config);
  return outcome.kind === "threshold" ? outcome.threshold : null;
}

/** Band index on a fixed k, independent of the shipped CARD_BANDS. */
function bandOn(k: number, lo: number, hi: number, value: number): number {
  const t = (Math.log(value) - Math.log(lo)) / (Math.log(hi) - Math.log(lo));
  return Math.min(k - 1, Math.max(0, Math.floor(t * k)));
}

interface Score {
  agree: number;
  agreeN: number;
  repeat: number;
  repeatN: number;
}

interface Sitting {
  /** True threshold, in the family's unit. */
  truth: number;
  a: number | null;
  b: number | null;
}

interface LadderResult {
  name: string;
  family: string;
  rungs: number;
  lo: number;
  hi: number;
  /** Share of sittings that produced a point estimate at all. */
  pointRate: number;
  /** Per candidate k: the two rates and the samples they were computed on. */
  scores: Map<number, Score>;
  chosen: number;
}

function measure(ladder: { name: string; family: string; sourceId?: string }): LadderResult {
  const axis = axisFor(ladder.family, ladder.sourceId);
  const lo = Math.min(...axis.magnitudes);
  const hi = Math.max(...axis.magnitudes);
  const logLo = Math.log(lo);
  const span = Math.log(hi) - logLo;

  const sittings: Sitting[] = [];
  let points = 0;
  for (let i = 0; i < LISTENERS; i++) {
    /*
     * LOG-UNIFORM ACROSS THE LADDER, and drawn on a fixed grid rather than at
     * random. The question is what the ladder can resolve ACROSS ITS RANGE, and
     * a random draw would leave the answer depending on how many listeners
     * happened to land near a boundary — which is exactly the quantity being
     * measured. A grid makes the boundary cases a fixed, reproducible share.
     */
    const truth = Math.exp(logLo + (span * (i + 0.5)) / LISTENERS);
    const o = listenerAt(truth);
    const a = reported(play(ladder.family, ladder.sourceId, (i + 1) * 7919, o));
    const b = reported(play(ladder.family, ladder.sourceId, (i + 1) * 7919 + 104_729, o));
    if (a !== null) points++;
    if (b !== null) points++;
    sittings.push({ truth, a, b });
  }

  const scores = new Map<number, Score>();
  for (const k of CARD_BAND_CANDIDATES) {
    let agreeN = 0;
    let agreeHit = 0;
    let repeatN = 0;
    let repeatHit = 0;
    for (const s of sittings) {
      const trueBand = bandOn(k, lo, hi, s.truth);
      for (const v of [s.a, s.b]) {
        if (v === null) continue;
        agreeN++;
        if (bandOn(k, lo, hi, v) === trueBand) agreeHit++;
      }
      if (s.a !== null && s.b !== null) {
        repeatN++;
        if (bandOn(k, lo, hi, s.a) === bandOn(k, lo, hi, s.b)) repeatHit++;
      }
    }
    scores.set(k, {
      agree: agreeN === 0 ? 0 : agreeHit / agreeN,
      agreeN,
      repeat: repeatN === 0 ? 0 : repeatHit / repeatN,
      repeatN,
    });
  }

  const chosen = chooseBandCount(scores);

  return {
    name: ladder.name,
    family: ladder.family,
    rungs: axis.magnitudes.length,
    lo,
    hi,
    pointRate: points / (2 * LISTENERS),
    scores,
    chosen,
  };
}

/**
 * The largest band count both rates clear on a large enough sample.
 *
 * PURE, AND SEPARATE FROM THE SIMULATION, so the sample floors can be shown to
 * bind on a case the shipped ladders cannot currently produce. A rule that is
 * only ever exercised by data which never triggers it is a rule nobody has
 * tested.
 */
export function chooseBandCount(scores: Map<number, Score>): number {
  let chosen = 1;
  for (const k of CARD_BAND_CANDIDATES) {
    const s = scores.get(k);
    if (!s) continue;
    if (k > 1 && (s.agreeN < MIN_AGREE_N || s.repeatN < MIN_REPEAT_N)) continue;
    if (s.agree >= CARD_BAND_AGREEMENT_FLOOR && s.repeat >= CARD_BAND_AGREEMENT_FLOOR) chosen = k;
  }
  return chosen;
}

const pct = (x: number, dp = 1) => `${(100 * x).toFixed(dp)}%`;
const pad = (s: string, n: number) => s.padEnd(n);

describe("how many resolution bands the shipped ladders support", () => {
  const results = LADDERS.map(measure);

  /** Per family, the smallest band count across its source ladders. */
  const byFamily = new Map<string, number>();
  for (const r of results) {
    const prev = byFamily.get(r.family);
    byFamily.set(r.family, prev === undefined ? r.chosen : Math.min(prev, r.chosen));
  }

  it("ran real sessions, and enough of them", () => {
    expect(results.length, "no ladders were measured, so this file checks nothing").toBeGreaterThanOrEqual(3);
    for (const r of results) {
      expect(r.rungs, `${r.name} has no ladder`).toBeGreaterThan(4);
      /*
       * THE COUNT FLOOR. A simulation that refuses every session would score
       * zero and look like a hard ladder; one that runs no sessions at all
       * would score nothing and pass every rate check vacuously. The bands
       * below are only meaningful if enough sittings produced a point estimate
       * to compute a rate on.
       *
       * NOT A BAR ON THE REFUSAL RATE ITSELF. The first run set one at 50% and
       * it failed two ladders — which was the guard mistaking a FINDING for a
       * defect. A ladder that refuses most listeners drawn across its whole
       * range is telling the truth about itself, and the card is built for
       * exactly that answer. The rate is reported below, loudly, instead.
       */
      expect(
        r.scores.get(1)!.agreeN,
        `${r.name}: only ${r.scores.get(1)!.agreeN} sittings produced a point estimate, which is too ` +
          "few to compute an agreement rate on. Everything below would be noise wearing a percentage.",
      ).toBeGreaterThanOrEqual(MIN_AGREE_N);
    }
  });

  it("scores 100% at one band, or the harness is broken", () => {
    for (const r of results) {
      const one = r.scores.get(1)!;
      expect(
        one.agree,
        `${r.name}: with a single band every session must agree with the truth trivially. ` +
          "Anything else means the sittings are empty or the band function is wrong, and every " +
          "other number in this file is then noise.",
      ).toBe(1);
      expect(one.repeat, `${r.name}: single-band repeat agreement is not 1`).toBe(1);
    }
  });

  it("ships the band count the measurement licenses, and no more", () => {
    for (const [family, measured] of byFamily) {
      expect(
        CARD_BANDS[family],
        `CARD_BANDS["${family}"] is ${CARD_BANDS[family]}, and the measurement supports ${measured}. ` +
          "The constant is derived, not chosen: update it to what was measured, or change the " +
          "instrument until the measurement supports more.",
      ).toBe(measured);
    }
    expect(
      Object.keys(CARD_BANDS).sort(),
      "CARD_BANDS names families the ladders do not measure, or misses one they do",
    ).toEqual([...byFamily.keys()].sort());
  });

  it("agrees with bandFor, which is what the card actually calls", () => {
    for (const r of results) {
      const of = CARD_BANDS[r.family];
      const finest = bandFor(r.family, r.name.startsWith("lossy/") ? r.name.slice(6) : undefined, r.lo);
      const coarsest = bandFor(r.family, r.name.startsWith("lossy/") ? r.name.slice(6) : undefined, r.hi);
      expect(finest, `${r.name}: bandFor returned nothing at the ladder floor`).not.toBeNull();
      expect(finest!.index, `${r.name}: the ladder floor is not in the finest band`).toBe(0);
      expect(coarsest!.index, `${r.name}: the ladder ceiling is not in the coarsest band`).toBe(of - 1);
    }
  });

  /**
   * THE SAMPLE FLOOR BINDS — proved on a case the shipped ladders cannot
   * currently produce, because the run above measured that they do not produce
   * one. Without this, the floor is untested code justified by a story.
   *
   * THE SAMPLES BELOW ARE ABSOLUTE NUMBERS, NOT `MIN_REPEAT_N - 1`, AND THE
   * FIRST VERSION WAS THE LATTER. Written relative to the constant, the case
   * moves whenever the constant does: setting `MIN_REPEAT_N = 0` made the
   * "too small" sample -1 pairs, which is still below the floor, so the test
   * passed with the floor switched off entirely. That is precisely the
   * scale-free vacuity `arc-resolution.test.ts` records catching in its own
   * criterion (iii), and it was reproduced here one file later. THREE pairs is
   * the number `lossy/pb1` actually produced, so the specimen is the real
   * hazard rather than an expression.
   */
  it("refuses a perfect score on a sample too small to mean anything", () => {
    const enough = { agree: 1, agreeN: 400, repeat: 1, repeatN: 400 };
    const perfectOnThreePairs = new Map<number, Score>([
      [1, enough],
      [2, { agree: 1, agreeN: 400, repeat: 1, repeatN: 3 }],
    ]);
    expect(
      chooseBandCount(perfectOnThreePairs),
      "a two-band claim scoring 100% on three pairs was accepted. That is the shape the floor " +
        "exists to refuse, and it is the sample `lossy/pb1` really produces.",
    ).toBe(1);

    const perfectOnManyPairs = new Map<number, Score>([[1, enough], [2, enough]]);
    expect(
      chooseBandCount(perfectOnManyPairs),
      "the same scores on a large sample must be accepted, or the floor is refusing on something " +
        "other than the sample size",
    ).toBe(2);

    const thinSittings = new Map<number, Score>([
      [1, enough],
      [2, { agree: 1, agreeN: 9, repeat: 1, repeatN: 400 }],
    ]);
    expect(chooseBandCount(thinSittings), "the sitting floor does not bind").toBe(1);
  });

  /**
   * THE DOWN LADDER, PROVED DIRECTLY, BECAUSE NO SHIPPED LADDER EXERCISES IT.
   *
   * `bandFor` orders bands by SENSITIVITY rather than by the size of the
   * number, and on the compression ladder those point opposite ways: rungs are
   * bitrates, 192 kbps is the gentlest damage and 32 kbps the harshest, so the
   * listener who only catches it at 32 has the coarser ear and the smaller
   * number. The first version of the function took the smallest level as the
   * fine end and would have called that ear fine.
   *
   * IT CANNOT BE CAUGHT THROUGH `bandFor` TODAY: `CARD_BANDS["lossy-artifact"]`
   * is 1, so every compression index is 0 whichever way the ladder is read. A
   * defect that only surfaces when a measurement IMPROVES is the worst kind to
   * leave in, so the pure index function is exercised at two bands directly.
   */
  it("puts the finest ear in band 0 on a ladder that runs downward", () => {
    const source = LADDERS.find((l) => l.sourceId)!.sourceId!;
    const levels = ladderLevels(LOSSY, source);
    expect(ladderDirection(LOSSY), "the compression ladder no longer runs downward").toBe("down");
    const gentlest = Math.max(...levels);
    const harshest = Math.min(...levels);
    expect(
      bandIndexIn(levels, "down", 2, gentlest),
      "heard the damage at the HIGHEST bitrate — the gentlest thing on the ladder — and was not " +
        "placed in the finest band",
    ).toBe(0);
    expect(
      bandIndexIn(levels, "down", 2, harshest),
      "only caught it at the lowest bitrate and was not placed in the coarsest band",
    ).toBe(1);

    // The up ladders must be unaffected: fewer cents IS the finer ear.
    const pitch = ladderLevels("pitch-drift", undefined);
    expect(bandIndexIn(pitch, "up", 2, Math.min(...pitch))).toBe(0);
    expect(bandIndexIn(pitch, "up", 2, Math.max(...pitch))).toBe(1);
  });

  it("writes the measurement", () => {
    say("E21/T-S1 — RESOLUTION BANDS PER LADDER");
    say("ALL FIGURES SIMULATED. Zero real responses (N3).");
    say("");
    say(`Listeners per ladder: ${LISTENERS}, each sitting twice, log-uniform across the ladder.`);
    say(`Bar: band agreement AND repeat agreement both >= ${pct(CARD_BAND_AGREEMENT_FLOOR, 0)}.`);
    say("band agreement = the session's band is the listener's true band.");
    say("repeat agreement = two sittings by the same listener land in the same band.");
    say("");
    for (const r of results) {
      say(`${r.name}  (${r.rungs} rungs, ${r.lo} .. ${r.hi})   point estimate in ${pct(r.pointRate)} of sittings`);
      say(`  ${pad("bands", 8)}${pad("agreement", 12)}${pad("n", 8)}${pad("repeat", 10)}${pad("pairs", 8)}`);
      for (const k of CARD_BAND_CANDIDATES) {
        const s = r.scores.get(k)!;
        const thin = k > 1 && (s.agreeN < MIN_AGREE_N || s.repeatN < MIN_REPEAT_N);
        const ok = s.agree >= CARD_BAND_AGREEMENT_FLOOR && s.repeat >= CARD_BAND_AGREEMENT_FLOOR;
        const mark = thin ? "  sample too small" : ok ? "  ok" : "";
        say(
          `  ${pad(String(k), 8)}${pad(pct(s.agree), 12)}${pad(String(s.agreeN), 8)}` +
            `${pad(pct(s.repeat), 10)}${pad(String(s.repeatN), 8)}${mark}`,
        );
      }
      say(`  -> ${r.chosen} band${r.chosen === 1 ? "" : "s"}`);
      say("");
    }
    say("PER FAMILY (the smaller count wins where a family has two source ladders):");
    for (const [family, k] of byFamily) {
      say(`  ${pad(family, 18)}${k} band${k === 1 ? "" : "s"}`);
    }
    say("");
    say("THE REFUSAL RATE IS THE OTHER FINDING, and it is not a defect. Across listeners");
    say("drawn uniformly over a ladder's whole range, these ladders decline to print a");
    say("threshold for a large share of them — a listener at the very floor or ceiling");
    say("cannot be bracketed, and the instrument says so rather than guessing:");
    for (const r of results) {
      say(`  ${pad(r.name, 12)}point estimate in ${pct(r.pointRate)} of sittings`);
    }
    say("So the card's commonest output on the thinner ladders is \"not enough to tell\",");
    say("and it must be built for that rather than treating it as an edge case.");
    say("");
    say("WHAT THIS LICENSES. A family with one band gets no fineness claim on the card:");
    say("the threshold is printed and nothing is said about how fine it is. A family with");
    say("two gets one comparison, and that is the whole of what the card may assert about");
    say("how finely this listener discriminates on that axis.");
    mkdirSync(OUT_DIR, { recursive: true });
    writeFileSync(OUT, lines.join(NL) + NL, "utf8");
    expect(lines.length).toBeGreaterThan(20);
  });
});
