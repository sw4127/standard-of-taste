/**
 * RT-17a: prove the Layer A gate can REJECT.
 *
 * Every one of the six live pairs passes, so the reject paths had never fired
 * on real data — and a gate never observed to reject is not yet known to be a
 * gate. These drive `gradePair` directly with measurement-shaped inputs, one
 * per failure mode, plus the boundary cases either side of each threshold.
 *
 * WHY NOT END-TO-END AUDIO: rendering a deliberately-bad pair needs the source
 * cache, which is git-ignored (it holds the downloaded recordings). A test that
 * silently skips when the cache is absent would be worse than none — it would
 * report green in CI while proving nothing. The decision logic is pinned here;
 * the measurement-to-decision wiring is demonstrated by running `validate`
 * against a real near-null render, pasted into the S6 slice reply.
 */

import { describe, expect, it } from "vitest";
import {
  gradePair,
  MAX_CLIPPED_FRACTION,
  MAX_QUIET_FRACTION,
  MAX_SILENCE_SEC,
  MIN_ANCHOR_RATIO,
  MIN_CONFIDENT_BLOCK_FRACTION,
  MAX_FLAT_TOP_FRACTION,
  MIN_TEMPORAL_DRIFT_MS,
  TEMPORAL_FAMILIES,
} from "./validate.mjs";

const anchors = { transparentLsdDb: 0.5, pipelineNoiseLsdDb: 0 };

/** A healthy spectral measurement — each test perturbs exactly one field. */
const healthy = {
  id: "x1",
  family: "lossy-artifact",
  magnitude: 2,
  lsdDb: 4.0, // 8x the 0.5 anchor
  perBandDb: [],
  framesCompared: 400,
  peakBand: 21,
  driftIqrMs: 0,
  driftRangeMs: 0,
  driftConfidentFraction: 1,
  driftCoherence: 0,
  clippedFraction: 0,
  flatTopFraction: 0,
  longestSilenceSec: 0,
  quietFraction: 0,
};

/** A healthy temporal measurement. */
const healthyTemporal = { ...healthy, id: "t1", family: "timing-smear", driftIqrMs: 20, driftConfidentFraction: 0.5 };

describe("Layer A gate — it passes what it should", () => {
  it("accepts a healthy spectral pair", () => {
    const r = gradePair(healthy, anchors);
    expect(r.verdict).toBe("PASS");
    expect(r.reasons).toEqual([]);
    expect(r.gatedOn).toBe("spectral-anchor-ratio");
  });

  it("accepts a healthy temporal pair, gated on drift not on dB", () => {
    const r = gradePair(healthyTemporal, anchors);
    expect(r.verdict).toBe("PASS");
    expect(r.gatedOn).toBe("temporal-drift");
  });

  it("knows which families are temporal", () => {
    expect(TEMPORAL_FAMILIES.has("timing-smear")).toBe(true);
    expect(TEMPORAL_FAMILIES.has("lossy-artifact")).toBe(false);
    expect(TEMPORAL_FAMILIES.has("pitch-drift")).toBe(false);
  });
});

describe("Layer A gate — it REJECTS what it should (RT-17a)", () => {
  it("flags a manipulation too small against its anchor", () => {
    // The failure mode that matters most: a pair barely different from a
    // transparent round-trip is not a fair trial, however clean it looks.
    const r = gradePair({ ...healthy, lsdDb: anchors.transparentLsdDb * 1.2 }, anchors);
    expect(r.verdict).toBe("FLAG");
    expect(r.reasons.join()).toMatch(/1\.2x anchor/);
  });

  it("flags clipping — an unfair tell", () => {
    const r = gradePair({ ...healthy, clippedFraction: MAX_CLIPPED_FRACTION * 10 }, anchors);
    expect(r.verdict).toBe("FLAG");
    expect(r.reasons.join()).toMatch(/clipping/);
  });

  it("flags flat-topped crests — clipping that survived normalisation (RT-17a)", () => {
    // The hole this closes: a deliberately clipped render measured 0.00% by
    // the full-scale detector and PASSED, because loudness normalisation runs
    // after the manipulation and rescales the peaks below full scale.
    const r = gradePair({ ...healthy, clippedFraction: 0, flatTopFraction: 0.49 }, anchors);
    expect(r.verdict).toBe("FLAG");
    expect(r.reasons.join()).toMatch(/flat-topped crests/);
  });

  it("flags a clip that is mostly silence in short gaps (PM user-test finding)", () => {
    // The hole: dead air was capped as a longest CONTIGUOUS run, so d2 — 35%
    // near-silent across many short rests, longest run 0.00s — passed, and a
    // listener reported it as barely containing music.
    const r = gradePair({ ...healthy, longestSilenceSec: 0, quietFraction: 0.35 }, anchors);
    expect(r.verdict).toBe("FLAG");
    expect(r.reasons.join()).toMatch(/near-silent/);
    expect(gradePair({ ...healthy, quietFraction: MAX_QUIET_FRACTION }, anchors).verdict).toBe("PASS");
  });

  it("flags dead air — an unanswerable trial", () => {
    const r = gradePair({ ...healthy, longestSilenceSec: MAX_SILENCE_SEC + 0.5 }, anchors);
    expect(r.verdict).toBe("FLAG");
    expect(r.reasons.join()).toMatch(/dead air/);
  });

  it("flags a temporal pair whose warp is too small", () => {
    const r = gradePair({ ...healthyTemporal, driftIqrMs: MIN_TEMPORAL_DRIFT_MS - 1 }, anchors);
    expect(r.verdict).toBe("FLAG");
    expect(r.reasons.join()).toMatch(/temporal drift IQR/);
  });

  it("flags a temporal pair whose drift could not be measured at all", () => {
    // Distinct from "too small": the correlator never locked, so there is no
    // number to judge. Reporting UNMEASURABLE beats reporting a lag.
    const r = gradePair(
      { ...healthyTemporal, driftIqrMs: 40, driftConfidentFraction: MIN_CONFIDENT_BLOCK_FRACTION - 0.05 },
      anchors,
    );
    expect(r.verdict).toBe("FLAG");
    expect(r.reasons.join()).toMatch(/unmeasurable/);
  });

  it("reports EVERY reason, not just the first", () => {
    const r = gradePair(
      { ...healthy, lsdDb: 0.5, clippedFraction: 0.01, flatTopFraction: 0.4, longestSilenceSec: 5 },
      anchors,
    );
    expect(r.verdict).toBe("FLAG");
    expect(r.reasons).toHaveLength(4);
  });

  it("propagates a measurement error as ERROR, never as a pass", () => {
    const r = gradePair({ id: "gone", error: "audio missing from public/" }, anchors);
    expect(r.verdict).toBe("ERROR");
    expect(r.reasons).toEqual(["audio missing from public/"]);
  });
});

describe("Layer A gate — behaviour AT the thresholds", () => {
  it("the anchor ratio boundary is inclusive on the passing side", () => {
    const exact = anchors.transparentLsdDb * MIN_ANCHOR_RATIO;
    expect(gradePair({ ...healthy, lsdDb: exact }, anchors).verdict).toBe("PASS");
    expect(gradePair({ ...healthy, lsdDb: exact * 0.999 }, anchors).verdict).toBe("FLAG");
  });

  it("the drift boundary is inclusive on the passing side", () => {
    expect(gradePair({ ...healthyTemporal, driftIqrMs: MIN_TEMPORAL_DRIFT_MS }, anchors).verdict).toBe("PASS");
    expect(gradePair({ ...healthyTemporal, driftIqrMs: MIN_TEMPORAL_DRIFT_MS - 1 }, anchors).verdict).toBe("FLAG");
  });

  it("clipping and silence boundaries reject only when EXCEEDED", () => {
    expect(gradePair({ ...healthy, clippedFraction: MAX_CLIPPED_FRACTION }, anchors).verdict).toBe("PASS");
    expect(gradePair({ ...healthy, flatTopFraction: MAX_FLAT_TOP_FRACTION }, anchors).verdict).toBe("PASS");
    expect(gradePair({ ...healthy, longestSilenceSec: MAX_SILENCE_SEC }, anchors).verdict).toBe("PASS");
  });

  it("a NaN measurement cannot slip through as a pass", () => {
    // Guards the comparison style: `!(x >= t)` rejects NaN, whereas `x < t`
    // would silently pass it.
    expect(gradePair({ ...healthy, lsdDb: NaN }, anchors).verdict).toBe("FLAG");
    expect(gradePair({ ...healthyTemporal, driftIqrMs: NaN }, anchors).verdict).toBe("FLAG");
  });
});
