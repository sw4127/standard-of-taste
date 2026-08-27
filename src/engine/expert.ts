/**
 * THE RAW RECORD BEHIND EACH RESULT (E8/C1, Track C, RT-E(a)).
 *
 * WHAT THIS IS FOR. Every instrument computes far more than it shows: the
 * delicacy trials know which pair fooled you and how sure you were; the
 * staircase knows how many trials landed on every rung and what the pipeline
 * measured and could not fix; the prestige test knows each clip's blind rating,
 * its labelled rating, and how much room there was to move. Almost none of it
 * reaches a screen. The expert view exists because a standardised score is the
 * thing an expert reader distrusts, and the evidence is the thing that earns
 * their attention instead (blueprint section 3.3).
 *
 * IT RETURNS DATA, NOT COPY, AND THAT IS THE VERDICT-FREE GUARANTEE. There is
 * not a sentence in this module — no labels, no headings, no phrasing. Numbers,
 * ids and enums only, with the component supplying every word. A payload that
 * cannot carry a sentence cannot carry a verdict, so "verdict-free" is a
 * property of the shape rather than a promise about the prose, and
 * `expert.test.ts` holds the whole serialised payload to it.
 *
 * IT CONTAINS THE ANSWER KEY, DELIBERATELY (PM ruling RT-O(a), 2026-08-27).
 * `originalSide` on a delicacy trial and `labelIsTrue` on a prestige item are
 * exactly what the instrument conceals while it is running. The result routes
 * are share targets, which is why `/delicacy/result` has always withheld the
 * per-pair disclosure — a posted link would hand the next person the answers.
 * Since E8/S8 the surfaces can tell whether a result belongs to the viewer, so
 * the rule's actual reason is addressed by that gate rather than by keeping the
 * data out of reach. THE GATE IS THE PROTECTION NOW: any caller that renders
 * this must be behind `isOwnResult`, and a caller that is not has published the
 * answer key.
 *
 * PHYSICAL VALUES ONLY WHERE THEY ARE VERIFIED. A delicacy rung is reported in
 * a real unit for pitch (cents) and lossy (kbps), because those were confirmed
 * against the staircase ladders in E8/S8. Timing is `null`: the manifest stores
 * it as a tempo FRACTION (0.015 = 1.5%) while the staircase axis is
 * milliseconds of drift IQR, and printing one as the other is the guess wearing
 * a unit that `replication.ts` refuses for the same reason.
 */
import type { BiasResult } from "./bias";
import type {
  DegradationFamily,
  DelicacyMagnitude,
  DelicacyResult,
  PairSide,
} from "./delicacy";
import type { StaircaseResult } from "./staircase-session";
import type { KnownLimit } from "./staircase-manifest";
import { RUNG_VALUE } from "./replication";
import { BRIER_COIN_FLIP, binDisplayPct, computeCalibration } from "./calibration";
import { SHARED_AXIS_FAMILIES } from "./evidence";

/** The unit a shared-axis family's rung is quoted in. Null where unverified. */
const RUNG_UNIT: Partial<Record<DegradationFamily, string>> = {
  "pitch-drift": "cents",
  "lossy-artifact": "kbps",
};

/* ------------------------------------------------------------------ *
 * Delicacy
 * ------------------------------------------------------------------ */

export interface DelicacyTrialRecord {
  /** 1-based presentation order, as the taker met it. */
  index: number;
  id: string;
  family: DegradationFamily;
  magnitude: DelicacyMagnitude;
  /** The rung in a real unit, or null where the unit is not established. */
  value: number | null;
  unit: string | null;
  /** THE ANSWER KEY (RT-O a). Which side was untouched. */
  originalSide: PairSide;
  pickedSide: PairSide;
  correct: boolean;
  flawPick: DegradationFamily;
  /** null when the pick was wrong — a flaw judgment about the wrong file. */
  flawCorrect: boolean | null;
  confidence: number;
}

export interface CalibrationPoint {
  /** What was claimed, in %. One of the confidence levels the trials offer. */
  claimedPct: number;
  n: number;
  correct: number;
  /**
   * What was actually delivered, in % — NULL when the bin holds fewer than
   * `MIN_BIN_N` answers. Read through `binDisplayPct`, never off `actualPct`,
   * because a bin standing on two trials is not a rate (N3).
   */
  observedPct: number | null;
}

export interface CalibrationCurve {
  points: CalibrationPoint[];
  /** Mean squared error of claim vs outcome. Lower is better. */
  brier: number;
  /** What always guessing 50% on a two-way choice scores — the honesty anchor. */
  brierChance: number;
  n: number;
}

export interface DelicacyExpert {
  nTrials: number;
  nCorrect: number;
  flawEligible: number;
  flawCorrect: number;
  perFamily: Array<{ family: DegradationFamily; n: number; correct: number }>;
  perMagnitude: Array<{ magnitude: DelicacyMagnitude; n: number; correct: number }>;
  trials: DelicacyTrialRecord[];
  /**
   * The reliability data, WITHOUT the direction verdict.
   *
   * `CalibrationResult.direction` is "overconfident" / "underconfident" /
   * "calibrated" — a classification of the person, which is exactly what a
   * verdict-free view may not carry and what `CalibrationBlock` already renders
   * on the result screen. The points and the Brier score are measurements; the
   * label on them is not, so only the measurements travel here.
   */
  calibration: CalibrationCurve;
  cohortN: 0;
}

export function delicacyExpert(result: DelicacyResult): DelicacyExpert {
  const trials: DelicacyTrialRecord[] = result.receipts.map((r, i) => {
    const shared = SHARED_AXIS_FAMILIES.includes(r.family);
    const value = shared ? (RUNG_VALUE[`${r.family}/${r.magnitude}`] ?? null) : null;
    return {
      index: i + 1,
      id: r.id,
      family: r.family,
      magnitude: r.magnitude,
      value,
      unit: value === null ? null : (RUNG_UNIT[r.family] ?? null),
      /*
       * DERIVED, NOT LOOKED UP. The receipt records what was picked and whether
       * that was right, so the original side follows without reaching back into
       * the pool — which keeps this function pure in `result` and means a
       * replayed share payload and a live session cannot disagree about the
       * answer key.
       */
      originalSide: r.correct ? r.pickedSide : r.pickedSide === "a" ? "b" : "a",
      pickedSide: r.pickedSide,
      correct: r.correct,
      flawPick: r.flawPick,
      flawCorrect: r.flawCorrect,
      confidence: r.confidence,
    };
  });

  const families = Object.entries(result.byFamily)
    .filter(([, t]) => t.n > 0)
    .map(([family, t]) => ({ family: family as DegradationFamily, n: t.n, correct: t.correct }));

  const magnitudes = Object.entries(result.byMagnitude)
    .filter(([, t]) => t.n > 0)
    .map(([m, t]) => ({ magnitude: Number(m) as DelicacyMagnitude, n: t.n, correct: t.correct }));

  const cal = computeCalibration(
    result.receipts.map((r) => ({ confidence: r.confidence, correct: r.correct })),
  );

  return {
    nTrials: result.nTrials,
    nCorrect: result.nCorrect,
    flawEligible: result.flawEligible,
    flawCorrect: result.flawCorrect,
    perFamily: families,
    perMagnitude: magnitudes,
    trials,
    calibration: {
      points: cal.bins.map((b) => ({
        claimedPct: b.confidencePct,
        n: b.n,
        correct: b.correct,
        observedPct: binDisplayPct(b),
      })),
      brier: cal.brier,
      brierChance: BRIER_COIN_FLIP,
      n: cal.n,
    },
    cohortN: 0,
  };
}

/* ------------------------------------------------------------------ *
 * Threshold
 * ------------------------------------------------------------------ */

export interface ThresholdRungRecord {
  label: number;
  shown: number;
  correct: number;
  /** The band edges, so a reader can see where the two marked rungs sit. */
  isHeard: boolean;
  isMissed: boolean;
  /** Inside the band: bracketed by the two edges, never visited as an edge. */
  inBand: boolean;
}

export interface ThresholdExpert {
  family: string;
  unit: string;
  sourceId?: string;
  kind: StaircaseResult["kind"];
  trials: number;
  /** Present only when the fitter earned a point; null on most sessions. */
  point: number | null;
  ci95: [number, number] | null;
  heardAt: number | null;
  missedAt: number | null;
  rungs: ThresholdRungRecord[];
  /** What the pipeline measured about this ladder and could not fix. */
  limits: KnownLimit[];
  cohortN: 0;
}

export function thresholdExpert(result: StaircaseResult): ThresholdExpert {
  const { rungs, heardIndex, missedIndex } = result.band;
  return {
    family: result.family,
    unit: result.unit,
    sourceId: result.sourceId,
    kind: result.kind,
    trials: result.trials,
    point: result.kind === "threshold" ? result.label : null,
    ci95: result.kind === "threshold" ? result.ci95 : null,
    heardAt: result.band.heardAt,
    missedAt: result.band.missedAt,
    rungs: rungs.map((r, i) => ({
      label: r.label,
      shown: r.shown,
      correct: r.correct,
      isHeard: i === heardIndex,
      isMissed: i === missedIndex,
      inBand: missedIndex !== null && heardIndex !== null && i > missedIndex && i < heardIndex,
    })),
    limits: result.limits,
    cohortN: 0,
  };
}

/* ------------------------------------------------------------------ *
 * Prestige
 * ------------------------------------------------------------------ */

export interface BiasItemRecord {
  id: string;
  blind: number;
  labeled: number;
  shift: number;
  /** Signed toward the label: + swayed with it, - resisted it. */
  towardLabel: number;
  /** Points that were available to move; 0 means the rating was at the edge. */
  headroom: number;
  /** THE ANSWER KEY (RT-O a). False = the shown attribution was fictional. */
  labelIsTrue: boolean;
}

export interface BiasControlRecord {
  id: string;
  first: number;
  second: number;
  drift: number;
}

export interface BiasExpert {
  /** Before the control correction — the number the verdict is NOT computed from. */
  rawPct: number;
  /** After it. Both are shown so the correction is visible rather than implied. */
  pct: number;
  controlDriftPts: number | null;
  movedCount: number;
  movableCount: number;
  edgeCount: number;
  /** Swapped items only — the causally clean subset. Null without swaps. */
  swappedPct: number | null;
  items: BiasItemRecord[];
  controls: BiasControlRecord[];
  cohortN: 0;
}

export function biasExpert(result: BiasResult): BiasExpert {
  return {
    rawPct: result.rawPct,
    pct: result.pct,
    controlDriftPts: result.controlDriftPts,
    movedCount: result.movedCount,
    movableCount: result.movableCount,
    edgeCount: result.edgeCount,
    swappedPct: result.swappedPct,
    items: result.receipts.map((r) => ({
      id: r.id,
      blind: r.blind,
      labeled: r.labeled,
      shift: r.shift,
      towardLabel: r.towardLabel,
      headroom: r.headroom,
      labelIsTrue: r.labelIsTrue,
    })),
    controls: result.controlReceipts.map((c) => ({
      id: c.id,
      first: c.first,
      second: c.second,
      drift: c.drift,
    })),
    cohortN: 0,
  };
}
