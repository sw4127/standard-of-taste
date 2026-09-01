/**
 * E14/S2 — THE RETEST COMPARISON, PROVEN THROUGH THE PATH THE PRODUCT USES.
 *
 * PRE-REGISTERED, WRITTEN BEFORE `arc.ts` WAS FINISHED:
 *
 *   (a) THE END-TO-END RATE IS THE ONE THAT COUNTS. E14/S1 measured the floor
 *       against sessions held in memory. The product will hold ANSWERS in
 *       localStorage and rebuild the sessions from them, so the false-positive
 *       rate is re-measured with every step in between — `recordResult` ->
 *       `readHistory` -> `replaySession` -> `thresholdArc`. It must still come
 *       in at or under 5% on a person who did not change, and catch a change of
 *       twice the floor at least 90% of the time.
 *   (b) THE COMPARISON REFUSES WHAT IT CANNOT COMPARE: a single session, two
 *       lossy sessions recorded on different recordings, an unknown ladder, and
 *       the delicacy instrument (RT-H2b a).
 *   (c) THE DIRECTION IS RIGHT. A listener who genuinely sharpened reads
 *       "closer"; one who genuinely dulled reads "further". A rule that fires
 *       at the correct RATE while naming the wrong direction is worthless, and
 *       (a) counts a backwards call as a miss for exactly that reason.
 *   (d) THE PRESTIGE ARC'S FOLDED RULE IS NOT LOOSER THAN THE SIGNED FLOOR IT
 *       BORROWS. Measured, not argued.
 *   (e) AN ESTIMATE PAST THE END OF THE LADDER IS FLAGGED, so no sentence can
 *       print it as a threshold.
 *
 * SIMULATED LISTENERS THROUGHOUT (N3). Fewer replicates than S1 because every
 * pair here pays for a JSON round trip and a full replay; this file is checking
 * that the plumbing does not change the answer, not re-deriving it.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ARC_FLOORS,
  biasArc,
  delicacyArc,
  floorKey,
  thresholdArc,
  type ThresholdArcEntry,
} from "./arc";
import * as arcModule from "./arc";
import { observer as obs, pCorrect, rng, type Observer } from "@/analytics/observer";
import { answer, axisFor, isFinished, nextTrial, pickSourceForSeed, startSession } from "./staircase-session";
import { encodeResponses, replaySession } from "./staircase-replay";
import { computeBiasResult, type BiasResult } from "./bias";
import { BIAS_CLIPS, BIAS_INSTRUMENT_ID } from "@/content/bias/items";
import { assignBiasParams, simulateBias, simulatePersons, DEFAULT_PERSON_MODEL } from "@/analytics/simulate";
import { eligibleSources } from "./staircase-pool";
import { readHistory, recordResult } from "@/lib/result-store";
import { POOL_VERSIONS } from "@/lib/result-recall";
import { SLUG_BY_FAMILY, familyForSlug } from "@/app/threshold/families";

/** A real Storage, for the reason `result-store.test.ts` gives at length. */
class MemoryStorage implements Storage {
  private map = new Map<string, string>();
  get length() {
    return this.map.size;
  }
  clear() {
    this.map.clear();
  }
  key(i: number) {
    return [...this.map.keys()][i] ?? null;
  }
  getItem(k: string) {
    return this.map.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.map.set(k, v);
  }
  removeItem(k: string) {
    this.map.delete(k);
  }
}

beforeEach(() => vi.stubGlobal("localStorage", new MemoryStorage()));
afterEach(() => vi.unstubAllGlobals());

const PITCH = "pitch-drift";
const LOSSY = "lossy-artifact";
const stepLog = (m: number[]) => Math.log(m[m.length - 1] / m[0]) / (m.length - 1);

/** One session against a simulated listener, through the real session API. */
function play(family: string, sourceId: string | undefined, seed: number, o: Observer) {
  let s = startSession(family, seed, sourceId);
  const rand = rng(seed ^ 0x5bf03635);
  while (!isFinished(s)) {
    const t = nextTrial(s);
    s = answer(s, rand() < pCorrect(s.axis.magnitudes[t.levelIndex], o));
  }
  return s;
}

/**
 * A session, WRITTEN TO THE STORE AND READ BACK, exactly as the product will.
 *
 * The point of going the long way round: the payload is answers, not a result,
 * so anything the codec or the replay does differently from the live session
 * shows up here rather than on somebody's screen.
 */
function recordAndRecall(
  family: string,
  sourceId: string | undefined,
  seed: number,
  o: Observer,
  at: number,
): void {
  const live = play(family, sourceId, seed, o);
  recordResult(
    "threshold",
    POOL_VERSIONS.threshold,
    { kind: "threshold", slug: SLUG_BY_FAMILY[family], seed, answers: encodeResponses(live), sourceId },
    at,
  );
}

function recalled(family: string): ThresholdArcEntry[] {
  const slug = SLUG_BY_FAMILY[family];
  return readHistory("threshold", POOL_VERSIONS.threshold, slug).map((e) => {
    if (e.payload.kind !== "threshold") throw new Error("arc.test: wrong payload kind in slot");
    return {
      at: e.savedAt,
      session: replaySession(familyForSlug(e.payload.slug)!, e.payload.seed, e.payload.answers, e.payload.sourceId),
    };
  });
}

/** Move a listener by `steps` ladder steps. Positive = sharper. */
const moved = (o: Observer, steps: number, unitLog: number): Observer => ({
  ...o,
  alpha: o.alpha * Math.exp(-steps * unitLog),
});

describe("E14/S2 — the arc decides the same thing after a round trip through the store", () => {
  const PAIRS = 400;

  /**
   * The ladders with a derived floor and a single recording per session. Lossy
   * is exercised in its own block, because half its pairs are refused by
   * construction and mixing that into a rate would understate both numbers.
   */
  const LADDERS = [PITCH, "timing-smear"];

  it("does not invent movement, and catches a real one", { timeout: 900_000 }, () => {
    for (const family of LADDERS) {
      const axis = axisFor(family);
      const unitLog = stepLog(axis.magnitudes);
      const o = obs(axis.magnitudes[axis.magnitudes.length >> 1], 0.35, 0.02);
      const floor = ARC_FLOORS[floorKey(family)];

      let fired = 0;
      let unreadable = 0;
      for (let p = 1; p <= PAIRS; p++) {
        localStorage.clear();
        recordAndRecall(family, undefined, (20_000 + p) * 7919, o, 1_000 + p);
        recordAndRecall(family, undefined, (40_000 + p) * 7919, o, 2_000 + p);
        const claim = thresholdArc(recalled(family));
        if (!claim.ok) {
          unreadable++;
          continue;
        }
        if (claim.value.direction !== null) fired++;
      }
      const falsePositive = fired / (PAIRS - unreadable);

      let caught = 0;
      for (let p = 1; p <= PAIRS; p++) {
        localStorage.clear();
        recordAndRecall(family, undefined, (20_000 + p) * 7919, o, 1_000 + p);
        recordAndRecall(family, undefined, (60_000 + p) * 7919, moved(o, 2 * floor, unitLog), 2_000 + p);
        const claim = thresholdArc(recalled(family));
        if (claim.ok && claim.value.direction === "closer") caught++;
      }
      const power = caught / PAIRS;

      console.log(
        `[E14/S2] ${family.padEnd(13)} floor ${floor.toFixed(2)} steps · ` +
          `false movement ${(100 * falsePositive).toFixed(1)}% · ` +
          `catches twice the floor ${(100 * power).toFixed(1)}% · ` +
          `${unreadable} unreadable of ${PAIRS}`,
      );

      // (a) the end-to-end rate, through the store and the codec
      expect(falsePositive, `${family}: the arc invents movement after a round trip`).toBeLessThanOrEqual(0.05);
      // (c) and it names the right direction — a backwards call is not counted
      expect(power, `${family}: misses a real change, or calls it backwards`).toBeGreaterThanOrEqual(0.9);
      expect(unreadable, `${family}: sessions came back unreadable from the store`).toBe(0);
    }
  });

  it("calls a listener who genuinely dulled 'further', not 'closer'", () => {
    const axis = axisFor(PITCH);
    const unitLog = stepLog(axis.magnitudes);
    const o = obs(axis.magnitudes[axis.magnitudes.length >> 1], 0.35, 0.02);
    const floor = ARC_FLOORS[floorKey(PITCH)];

    let further = 0;
    const N = 200;
    for (let p = 1; p <= N; p++) {
      localStorage.clear();
      recordAndRecall(PITCH, undefined, (20_000 + p) * 7919, o, 1_000 + p);
      // NEGATIVE steps: the same listener, worse.
      recordAndRecall(PITCH, undefined, (80_000 + p) * 7919, moved(o, -2 * floor, unitLog), 2_000 + p);
      const claim = thresholdArc(recalled(PITCH));
      if (claim.ok && claim.value.direction === "further") further++;
    }
    console.log(`[E14/S2] a listener who dulled by twice the floor reads "further" ${((100 * further) / N).toFixed(1)}%`);
    expect(further / N, "an ear that got worse is not being reported as worse").toBeGreaterThanOrEqual(0.9);
  });
});

describe("E14/S2 — what the arc refuses", () => {
  it("refuses a single session — there is nothing to compare it to", () => {
    localStorage.clear();
    const axis = axisFor(PITCH);
    recordAndRecall(PITCH, undefined, 7919, obs(axis.magnitudes[5], 0.35, 0.02), 1_000);
    const claim = thresholdArc(recalled(PITCH));
    expect(claim.ok).toBe(false);
    if (!claim.ok) expect(claim.gap).toBe("too-few-sessions");
  });

  it("refuses two lossy sessions recorded on different recordings", () => {
    const sources = eligibleSources(LOSSY);
    expect(sources.length, "this test needs at least two shipping recordings").toBeGreaterThanOrEqual(2);
    localStorage.clear();
    const axis = axisFor(LOSSY, sources[0]);
    const o = obs(axis.magnitudes[axis.magnitudes.length >> 1], 0.35, 0.02);
    recordAndRecall(LOSSY, sources[0], 7919, o, 1_000);
    recordAndRecall(LOSSY, sources[1], 15_838, o, 2_000);
    const claim = thresholdArc(recalled(LOSSY));
    expect(claim.ok).toBe(false);
    if (!claim.ok) expect(claim.gap).toBe("different-material");
  });

  it("compares two lossy sessions that DID land on the same recording", () => {
    const sources = eligibleSources(LOSSY);
    localStorage.clear();
    const axis = axisFor(LOSSY, sources[0]);
    const o = obs(axis.magnitudes[axis.magnitudes.length >> 1], 0.35, 0.02);
    recordAndRecall(LOSSY, sources[0], 7919, o, 1_000);
    recordAndRecall(LOSSY, sources[0], 15_838, o, 2_000);
    const claim = thresholdArc(recalled(LOSSY));
    expect(claim.ok).toBe(true);
    if (claim.ok) {
      expect(claim.value.sourceId).toBe(sources[0]);
      expect(claim.value.floor).toBe(ARC_FLOORS[floorKey(LOSSY, sources[0])]);
      // kbps, not the internal magnitude — the unit a reader would be shown.
      expect(claim.value.unit).toContain("kbps");
    }
  });

  /**
   * HOW OFTEN THE LOSSY ARC IS REFUSED IN ORDINARY USE, reported rather than
   * assumed. The staircase picks its recording from the session seed, so two
   * lossy sittings land on the same material only by luck — this is the share
   * of people who will be told the comparison cannot be made.
   */
  it("reports how often a lossy retest lands on a different recording", () => {
    /*
     * SEEDED THE WAY THE PRODUCT SEEDS, and asked through the product's own
     * function. The first version of this test did neither: it reimplemented
     * `pickSourceForSeed`'s arithmetic inline — a second copy of a fact, which
     * is the defect this repo keeps paying for — and drew its two seeds 20000
     * apart, so both always had the same parity and it reported that a lossy
     * retest lands on the same recording 100% of the time. It does not.
     *
     * `ThresholdFlow.newSeed()` is `Date.now() % 2147483647`, so the seed is a
     * millisecond clock reading. Two sittings at least a cooldown apart are
     * independent in its low bits, which is what this draws.
     */
    const sources = eligibleSources(LOSSY);
    const clock = rng(20260901);
    const aSeed = () => Math.floor(clock() * 2147483647);
    let same = 0;
    const N = 2000;
    for (let p = 1; p <= N; p++) {
      if (pickSourceForSeed(LOSSY, aSeed()) === pickSourceForSeed(LOSSY, aSeed())) same++;
    }
    const rate = same / N;
    console.log(
      `[E14/S2] ${sources.length} shipping recordings · a lossy retest lands on the SAME one ` +
        `${(100 * rate).toFixed(0)}% of the time; the rest are refused as different material`,
    );
    // The claim in `arc.ts` is that this is an ORDINARY outcome, not an edge
    // case. Both bounds, so the test notices either kind of drift.
    expect(rate, "a lossy retest almost always matches — arc.ts overstates the refusal").toBeLessThan(0.75);
    expect(rate, "a lossy retest almost never matches — the arc is useless there").toBeGreaterThan(0.25);
  });

  it("refuses a ladder it has no derived floor for", () => {
    const axis = axisFor(PITCH);
    const o = obs(axis.magnitudes[5], 0.35, 0.02);
    const entries: ThresholdArcEntry[] = [
      { at: 1, session: { ...play(PITCH, undefined, 7919, o), family: "invented-family" } },
      { at: 2, session: { ...play(PITCH, undefined, 15_838, o), family: "invented-family" } },
    ];
    const claim = thresholdArc(entries);
    expect(claim.ok).toBe(false);
    if (!claim.ok) expect(claim.gap).toBe("no-arc-floor");
  });

  it("refuses the delicacy instrument, and says which refusal it is", () => {
    const claim = delicacyArc();
    expect(claim.ok).toBe(false);
    if (!claim.ok) expect(claim.gap).toBe("arc-instrument-unsupported");
  });

  /**
   * The same pin `result-store.ts` carries, for the same reason: this module
   * decides whether somebody improved, which is precisely where a "best ever"
   * accessor would be tempting, and the anti-clone clause forbids it.
   */
  it("exposes no way to ask for a best, a maximum or a personal record", () => {
    const banned = new Set(["best", "max", "maximum", "top", "peak", "highest", "greatest", "personal", "streak"]);
    const words = (name: string): string[] => {
      const out: string[] = [];
      let current = "";
      for (const ch of name) {
        if (ch >= "A" && ch <= "Z" && current !== "") {
          out.push(current.toLowerCase());
          current = "";
        }
        current += ch;
      }
      if (current !== "") out.push(current.toLowerCase());
      return out;
    };
    const offenders = Object.keys(arcModule).filter((n) => words(n).some((w) => banned.has(w)));
    expect(offenders, `arc exports a superlative accessor: ${offenders.join(", ")}`).toEqual([]);
  });
});

describe("E14/S2 — an estimate past the end of the ladder is flagged, never printed as a threshold", () => {
  it("marks a listener outside the ladder's reach", () => {
    const axis = axisFor(PITCH);
    // Far more sensitive than the gentlest rung the pipeline can render, which
    // is the case `fitThreshold` answers with "below" rather than a number.
    const keen = obs(axis.magnitudes[0] / 8, 0.35, 0);
    localStorage.clear();
    recordAndRecall(PITCH, undefined, 7919, keen, 1_000);
    recordAndRecall(PITCH, undefined, 15_838, keen, 2_000);
    const claim = thresholdArc(recalled(PITCH));
    expect(claim.ok).toBe(true);
    if (claim.ok) {
      expect(
        claim.value.earlier.withinRange && claim.value.latest.withinRange,
        "a listener past the ladder floor is being reported as if measured on it",
      ).toBe(false);
    }
  });
});

describe("E14/S2 — the prestige arc folds the sway before judging it", () => {
  /**
   * A REAL SESSION, BUILT FROM INTEGER RATINGS — because that is the only kind
   * this instrument accepts, and my first draft of this helper did not know it.
   * `computeBiasResult` threw on a rating of 3.2, which is the same fact E14/S1
   * found from the other end: the headline lands on a LATTICE because the
   * ratings underneath it are whole numbers. A helper free to produce any sway
   * it liked would have been testing an instrument that does not exist.
   *
   * `shiftFor` is a whole number of rating points moved toward each scored
   * clip's label; controls never move, so they stay a usable drift baseline.
   * The resulting sway is read back off the engine rather than assumed.
   */
  const biasWith = (shiftFor: (index: number) => number): BiasResult => {
    const blind: Record<string, number> = {};
    const labeled: Record<string, number> = {};
    let scored = 0;
    for (const item of BIAS_CLIPS) {
      blind[item.id] = 5;
      const s = item.isControl ? 0 : shiftFor(scored++);
      const toward = item.labelDirection === "up" ? s : -s;
      labeled[item.id] = Math.max(0, Math.min(10, 5 + toward));
    }
    return computeBiasResult(BIAS_INSTRUMENT_ID, BIAS_CLIPS, blind, labeled);
  };

  it("does not call a sign flip an improvement", () => {
    const a = biasWith(() => 2);
    const b = biasWith(() => -2);
    const claim = biasArc([
      { at: 1, result: a },
      { at: 2, result: b },
    ]);
    expect(claim.ok).toBe(true);
    if (claim.ok) {
      console.log(
        `[E14/S2] sway ${a.pct.toFixed(1)} -> ${b.pct.toFixed(1)} reads direction=${String(claim.value.direction)}`,
      );
      // The SIGNED change is several times the floor — the exact size is
      // printed above rather than typed here, because a number written into a
      // comment goes stale the first time the pool or the shift changes. The
      // distance from ZERO has not moved at all, and that is what the arc must
      // answer.
      expect(claim.value.direction, "a sign flip is being reported as improvement").not.toBe("closer");
    }
  });

  it("calls a genuine reduction in sway 'closer'", () => {
    const before = biasWith(() => 2);
    const after = biasWith(() => 0);
    const claim = biasArc([
      { at: 1, result: before },
      { at: 2, result: after },
    ]);
    expect(claim.ok).toBe(true);
    if (claim.ok) {
      console.log(
        `[E14/S2] sway ${before.pct.toFixed(1)} -> ${after.pct.toFixed(1)} reads "${String(claim.value.direction)}"`,
      );
      expect(claim.value.direction).toBe("closer");
    }
  });

  it("stays silent inside the floor", () => {
    // Half the scored clips move two points, half one — a real change on this
    // lattice that still lands under the eight-point floor.
    const before = biasWith(() => 2);
    const after = biasWith((i) => (i % 2 === 0 ? 2 : 1));
    const claim = biasArc([
      { at: 1, result: before },
      { at: 2, result: after },
    ]);
    expect(claim.ok).toBe(true);
    if (claim.ok) {
      console.log(
        `[E14/S2] sway ${before.pct.toFixed(1)} -> ${after.pct.toFixed(1)} is inside the ` +
          `${claim.value.floor}-point floor and reads as no change`,
      );
      expect(claim.value.direction).toBeNull();
      expect(claim.value.distance).toBeLessThan(claim.value.floor);
    }
  });

  it("refuses a single prestige session", () => {
    const claim = biasArc([{ at: 1, result: biasWith(() => 1) }]);
    expect(claim.ok).toBe(false);
    if (!claim.ok) expect(claim.gap).toBe("too-few-sessions");
  });

  /**
   * CRITERION (d), MEASURED — and it very nearly was not.
   *
   * `biasArc` judges a FOLDED quantity, |sway now| - |sway before|, against a
   * floor E14/S1 derived for the SIGNED change. I argued that this is
   * conservative (`|a| - |b|` cannot vary more than `a - b` does) and then
   * shipped three hand-built cases, which is exactly the "should work" this
   * project forbids: an argument is not a measurement, and the pre-registration
   * said this rate would be measured. It is measured here, against the same
   * simulated cohort answering the same clips twice.
   */
  it("keeps the prestige floor's promise on the folded quantity it is used for", () => {
    const items = assignBiasParams(BIAS_CLIPS, 20260901);
    const persons = simulatePersons(20260901, 4000, DEFAULT_PERSON_MODEL);
    const first = simulateBias(11, items, persons);
    const second = simulateBias(22, items, persons);

    let firedFolded = 0;
    let firedSigned = 0;
    for (let i = 0; i < persons.length; i++) {
      const a = computeBiasResult(BIAS_INSTRUMENT_ID, items, first.blind[i], first.labeled[i]);
      const b = computeBiasResult(BIAS_INSTRUMENT_ID, items, second.blind[i], second.labeled[i]);
      const claim = biasArc([
        { at: 1, result: a },
        { at: 2, result: b },
      ]);
      if (claim.ok && claim.value.direction !== null) firedFolded++;
      if (Math.abs(b.pct - a.pct) >= ARC_FLOORS.bias) firedSigned++;
    }
    const folded = firedFolded / persons.length;
    const signed = firedSigned / persons.length;
    console.log(
      `[E14/S2] prestige, ${persons.length} unchanged people retested: the folded rule the product ` +
        `ships fires ${(100 * folded).toFixed(1)}%, the signed rule the floor was derived for ` +
        `${(100 * signed).toFixed(1)}%`,
    );
    expect(folded, "the folded prestige rule invents movement").toBeLessThanOrEqual(0.05);
    expect(folded, "folding is not the conservative direction after all").toBeLessThanOrEqual(signed);
  });
});
