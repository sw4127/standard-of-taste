import { describe, it, expect } from "vitest";
import { mkdirSync, writeFileSync } from "node:fs";
import { computeDelicacyResult, detectionBand } from "@/engine/delicacy";
import { BRIER_COIN_FLIP, MIN_BIN_N, binDisplayPct, computeCalibration } from "@/engine/calibration";
import { calibrationLine, detectionTitle, detectionBody, flawLineText } from "@/content/delicacy/copy";
import { MEASURED_TRIALS, DELICACY_INSTRUMENT_ID } from "@/content/delicacy/items";
import { DEGRADATION_FAMILIES } from "@/engine/delicacy";

/**
 * E7/S10 — THE REVEAL NOBODY HAD EVER SEEN.
 *
 * `DelicacyFlow`'s `phase === "done"` screen carries three blocks that exist on
 * no other surface: the calibration read ("DID YOU KNOW WHEN YOU KNEW?"), the
 * per-flaw line, and the per-pair disclosure. It is reachable only by finishing
 * eighteen trials behind an 8-second-per-clip listen gate, so nothing — no
 * test, no session, no person — had ever looked at what it says.
 *
 * The permalink at /delicacy/result is payload-driven and shows NONE of the
 * three, although the payload carries every number needed to recompute them.
 * The flow and the permalink describe the same session differently, which is
 * the defect shape the architecture note already warns about for cards.
 *
 * There is no React test environment here (no jsdom, no testing-library), and
 * adding one to look at one screen is a bigger change than the looking is
 * worth. So this exercises the exact COMPOSITION the reveal performs — the same
 * functions, in the same order, on the same inputs — across the whole reachable
 * score range and several confidence patterns, and writes the text out to be
 * read. Every defect this project has actually shipped in a reveal was a string
 * ("a coin flip calls 3"), not a pixel.
 */

type Pattern = { name: string; confidenceFor: (i: number, correct: boolean) => 95 | 70 | 50 };

/** Confidence patterns that exercise the calibration branches. */
const PATTERNS: Pattern[] = [
  { name: "always 95", confidenceFor: () => 95 },
  { name: "always 50", confidenceFor: () => 50 },
  { name: "rotating 95/70/50", confidenceFor: (i) => ([95, 70, 50] as const)[i % 3] },
  // NOT "well calibrated" — I labelled it that and was wrong. Being sure
  // exactly when you are right is DISCRIMINATION; calibration asks whether 95%
  // means 95%. At 8/15 this pattern averages 74% confidence against 53%
  // accuracy, so the engine reads it overconfident, correctly. Kept under an
  // accurate name because the distinction is the whole point of the block.
  { name: "perfect discrimination (95 when right, 50 when wrong)", confidenceFor: (_i, ok) => (ok ? 95 : 50) },
  { name: "inverted (50 when right, 95 when wrong)", confidenceFor: (_i, ok) => (ok ? 50 : 95) },
];

function sessionAt(nCorrect: number, pattern: Pattern) {
  const responses: Record<string, unknown> = {};
  MEASURED_TRIALS.forEach((t, i) => {
    const correct = i < nCorrect;
    responses[t.id] = {
      pickedSide: correct ? t.originalSide : t.originalSide === "a" ? "b" : "a",
      flawPick: correct ? t.family : DEGRADATION_FAMILIES[(DEGRADATION_FAMILIES.indexOf(t.family) + 1) % 3],
      confidence: pattern.confidenceFor(i, correct),
    };
  });
  const result = computeDelicacyResult(DELICACY_INSTRUMENT_ID, MEASURED_TRIALS, responses as never);
  const cal = computeCalibration(result.receipts.map((r) => ({ confidence: r.confidence, correct: r.correct })));
  return { result, cal };
}

/** Exactly the strings the reveal composes, in the order it composes them. */
function revealText(nCorrect: number, pattern: Pattern): string[] {
  const { result, cal } = sessionAt(nCorrect, pattern);
  const band = detectionBand(result.nCorrect, result.nTrials);
  const lines = [
    `${result.nCorrect}/${result.nTrials} originals identified`,
    detectionTitle(band),
    detectionBody(band),
  ];
  if (result.flawAccuracy !== null) {
    lines.push(flawLineText(result.flawCorrect, result.flawEligible));
  }
  lines.push(calibrationLine(cal));
  lines.push(
    `Brier score ${cal.brier.toFixed(3)} — pure coin-flip guessing scores ${BRIER_COIN_FLIP.toFixed(2)}; lower is better.`,
  );
  const showable = cal.bins.filter((b) => binDisplayPct(b) !== null);
  for (const b of showable) lines.push(`When you said ${b.confidencePct}%: right ${b.correct} of ${b.n}.`);
  if (showable.length === 0) lines.push("Per-level breakdowns need 3+ answers at a level.");
  return lines;
}

const N = MEASURED_TRIALS.length;

describe("E7/S10 — every line the reveal can print", () => {
  it("composes for every reachable score and confidence pattern", () => {
    const out: string[] = [];
    for (const pattern of PATTERNS) {
      out.push(`=== ${pattern.name} ===`);
      for (let k = 0; k <= N; k++) {
        out.push(`-- ${k}/${N}`);
        for (const line of revealText(k, pattern)) out.push(`   ${line}`);
      }
    }
    mkdirSync("docs/analytics", { recursive: true });
    writeFileSync(
      "docs/analytics/e7-delicacy-reveal.txt",
      [
        "E7/S10 DELICACY REVEAL — EVERY LINE IT CAN PRINT [SIMULATED inputs, real copy]",
        "The DelicacyFlow 'done' screen is reachable only by finishing 18 gated trials,",
        "so nothing had ever read what it says. This is its composition, exhaustively.",
        "",
        ...out,
      ].join("\n"),
    );
    expect(out.length).toBeGreaterThan(100);
  });

  it("never prints a flaw line with a zero denominator", () => {
    // "named the flaw 0 of 0 times" is the shape of the defect this project
    // keeps shipping: a sentence that is grammatical and meaningless.
    for (const pattern of PATTERNS) {
      for (let k = 0; k <= N; k++) {
        const { result } = sessionAt(k, pattern);
        if (result.flawAccuracy === null) continue;
        expect(result.flawEligible, `flaw line shown with denominator 0 at ${k}/${N}`).toBeGreaterThan(0);
        expect(result.flawCorrect).toBeLessThanOrEqual(result.flawEligible);
      }
    }
  });

  it("shows the flaw line only when something was caught", () => {
    const { result } = sessionAt(0, PATTERNS[0]);
    expect(result.flawAccuracy, "a session that caught nothing still offered a flaw accuracy").toBeNull();
  });

  it("never shows a confidence bin thinner than the stated minimum", () => {
    for (const pattern of PATTERNS) {
      for (let k = 0; k <= N; k++) {
        const { cal } = sessionAt(k, pattern);
        for (const b of cal.bins) {
          if (binDisplayPct(b) === null) continue;
          expect(b.n, `a bin with n=${b.n} was displayed (minimum is ${MIN_BIN_N})`).toBeGreaterThanOrEqual(MIN_BIN_N);
          expect(b.correct, `bin claims ${b.correct} correct of ${b.n}`).toBeLessThanOrEqual(b.n);
        }
      }
    }
  });

  it("reads confidence in both directions, on cases with only one answer", () => {
    // The calibration read is the whole point of the block; if it cannot tell
    // these apart it is decoration. Both cases are unambiguous by construction:
    // claiming 95% while scoring 3/15 is overconfident under any definition,
    // and claiming 50% while scoring 14/15 is underconfident under any.
    const sureAndWrong = sessionAt(3, PATTERNS[0]).cal; // always 95
    const unsureAndRight = sessionAt(14, PATTERNS[1]).cal; // always 50
    expect(sureAndWrong.direction, calibrationLine(sureAndWrong)).toBe("overconfident");
    expect(unsureAndRight.direction, calibrationLine(unsureAndRight)).toBe("underconfident");
  });

  it("separates DISCRIMINATION from CALIBRATION, which is the point of the block", () => {
    // Pinned because I got it wrong writing this file. Knowing exactly when you
    // are right (95 on every hit, 50 on every miss) still reads overconfident at
    // a middling score, because 95% has to MEAN 95%. If this ever flips to
    // "calibrated", the engine has started rewarding ranking instead of
    // accuracy and the copy above it becomes a false claim.
    const discriminating = sessionAt(8, PATTERNS[3]).cal;
    expect(Math.round(discriminating.meanConfidencePct), calibrationLine(discriminating)).toBe(74);
    expect(Math.round(discriminating.accuracyPct)).toBe(53);
    expect(discriminating.direction).toBe("overconfident");
  });

  it("the Brier score stays inside its own scale", () => {
    for (const pattern of PATTERNS) {
      for (let k = 0; k <= N; k++) {
        const { cal } = sessionAt(k, pattern);
        expect(cal.brier, `Brier ${cal.brier} out of range at ${k}/${N} (${pattern.name})`).toBeGreaterThanOrEqual(0);
        expect(cal.brier).toBeLessThanOrEqual(1);
      }
    }
  });
});
