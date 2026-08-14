/**
 * The lowpass-knee detector (E2/S2).
 *
 * Written after the first version read BACKWARDS on real audio — a higher knee
 * for a gentler bitrate, then null for the two most damaged files. The fixtures
 * below are the measured per-band vectors from that run, so the regression is
 * pinned against the data that exposed it rather than against a tidied-up
 * invention.
 */
import { describe, expect, it } from "vitest";
import { bandEdgeHz, lowpassKneeHz } from "./spectral.mjs";

/** Real per-band distances, source pb1 @75s, 20s window. Top 8 bands shown. */
const MEASURED = {
  "96k": [0.7, 0.6, 1.0, 1.0, 1.1, 4.8, 15.7, 13.7],
  "64k": [0.9, 0.9, 2.7, 6.3, 11.7, 18.7, 19.7, 13.6],
  "48k": [2.0, 6.9, 14.9, 15.8, 16.9, 18.4, 17.7, 11.9],
  "32k": [25.8, 30.7, 24.1, 17.4, 17.2, 17.7, 16.8, 11.7],
};

/** Pad the measured tail back out to a full 24-band vector. */
const full = (tail: number[]) => [...Array(24 - tail.length).fill(0), ...tail];

describe("lowpassKneeHz", () => {
  it("band edges span the configured range", () => {
    const e = bandEdgeHz();
    expect(e).toHaveLength(25);
    expect(e[0]).toBeCloseTo(50, 5);
    expect(e[24]).toBeCloseTo(16000, 5);
  });

  /**
   * THE REGRESSION. Lower bitrate must never report a HIGHER knee — the codec
   * throws away more, not less. The first version violated this on real data.
   */
  it("the knee falls monotonically as the bitrate falls", () => {
    const knees = ["96k", "64k", "48k", "32k"].map((k) =>
      lowpassKneeHz(full(MEASURED[k as keyof typeof MEASURED])),
    );
    expect(knees.every((k) => k != null)).toBe(true);
    for (let i = 1; i < knees.length; i++) {
      expect(knees[i]!, `${knees[i]} must not exceed ${knees[i - 1]}`).toBeLessThan(knees[i - 1]!);
    }
  });

  /**
   * Values taken from the CLI run, not from hand arithmetic. The first draft of
   * this test asserted 4811 Hz for 48k because that is what I got counting band
   * indices on paper; the walk actually reaches 3783, and the test failed. The
   * expectation was wrong, not the code — which is the useful direction for a
   * test to fail, and a reminder that a number nobody executed is a guess.
   */
  it("reproduces the measured knees", () => {
    expect(Math.round(lowpassKneeHz(full(MEASURED["96k"]))!)).toBe(9894);
    expect(Math.round(lowpassKneeHz(full(MEASURED["64k"]))!)).toBe(7780);
    expect(Math.round(lowpassKneeHz(full(MEASURED["48k"]))!)).toBe(3783);
  });

  /**
   * The exact defect, pinned: with the saturating top band included, the two
   * most damaged files report NO knee at all.
   */
  it("including the saturating top band is what broke it", () => {
    expect(lowpassKneeHz(full(MEASURED["48k"]), { ignoreTopBands: 0 })).toBeNull();
    expect(lowpassKneeHz(full(MEASURED["32k"]), { ignoreTopBands: 0 })).toBeNull();
  });

  it("reports no knee for a manipulation that is not a lowpass", () => {
    expect(lowpassKneeHz(new Array(24).fill(0.5))).toBeNull();
  });

  it("a single damaged band in the middle is not a knee", () => {
    const v = new Array(24).fill(0.5);
    v[12] = 40;
    expect(lowpassKneeHz(v)).toBeNull();
  });
});
