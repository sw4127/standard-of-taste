/**
 * The cents ruler, proven by PARAMETER RECOVERY (E1, 2026-08-14).
 *
 * Same standard `src/analytics/` holds its estimators to, and for the same
 * reason: a measuring instrument that has only ever been pointed at unknowns
 * has not been shown to measure anything. Here the truth is available exactly —
 * a harmonic complex synthesised at f0, and the same complex at f0 * 2^(c/1200)
 * — so "does it return c" is a question with a right answer.
 *
 * Synthetic rather than rendered audio on purpose: it isolates the RULER. If
 * these ran against ffmpeg output, a failure could be the measurement or the
 * renderer, and the whole point of E1 is to establish a trustworthy ruler
 * BEFORE using it to judge a ladder.
 */
import { describe, expect, it } from "vitest";
import { pitchShiftCents } from "./spectral.mjs";

const SR = 44100;

/**
 * A harmonic complex — the spectral shape real pitched instruments have, and
 * the case that matters: the estimator pools partials, so a single sine would
 * flatter it.
 */
function tone(f0: number, seconds: number, harmonics = 12): Float64Array {
  const n = Math.round(SR * seconds);
  const x = new Float64Array(n);
  for (let h = 1; h <= harmonics; h++) {
    const amp = 1 / h; // ~ -6 dB/octave, a natural-ish rolloff
    const phase = (h * 0.7) % (2 * Math.PI); // fixed, so the test is deterministic
    for (let i = 0; i < n; i++) x[i] += amp * Math.sin((2 * Math.PI * f0 * h * i) / SR + phase);
  }
  let peak = 0;
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(x[i]));
  for (let i = 0; i < n; i++) x[i] /= peak;
  return x;
}

const shifted = (f0: number, cents: number, seconds = 1.5) =>
  tone(f0 * Math.pow(2, cents / 1200), seconds);

describe("pitchShiftCents — recovers a KNOWN detune", () => {
  /**
   * The range the threshold instrument has to cover. The bottom of this list is
   * far below anything currently shipping (rung 2 is 25 cents) because a
   * staircase converges DOWNWARD toward a listener's threshold, and a ruler
   * that only works where the current ladder sits would stop working exactly
   * where the interesting answers are.
   */
  const LEVELS = [0, 3, 5, 8, 12, 18, 25, 35, 50, 70, 100, 150, 200];

  it.each(LEVELS)("recovers %i cents", (truth) => {
    const a = tone(220, 1.5);
    const b = shifted(220, truth);
    const r = pitchShiftCents(a, b, { sampleRate: SR });
    expect(r.confidentFraction).toBeGreaterThan(0.9);
    expect(Math.abs(r.medianCents - truth)).toBeLessThan(2);
  });

  it("recovers a shift DOWNWARD with the right sign", () => {
    const r = pitchShiftCents(tone(220, 1.5), shifted(220, -50), { sampleRate: SR });
    expect(r.medianCents).toBeLessThan(0);
    expect(Math.abs(r.medianCents + 50)).toBeLessThan(2);
  });

  it("reads ~0 on an identical pair", () => {
    const a = tone(220, 1.5);
    const r = pitchShiftCents(a, a, { sampleRate: SR });
    expect(Math.abs(r.medianCents)).toBeLessThan(1);
    expect(r.confidentFraction).toBe(1);
  });

  /**
   * THE PROPERTY A STAIRCASE ACTUALLY DEPENDS ON. Monotone is not sufficient —
   * log-spectral distance was already monotone across three rungs. A staircase
   * needs adjacent levels to be SEPARABLE, so the ruler must resolve steps far
   * smaller than the ones currently shipping.
   */
  it("separates levels 3 cents apart — strictly monotone, no ties", () => {
    const a = tone(220, 1.5);
    const measured = [12, 15, 18, 21, 24, 27, 30].map(
      (c) => pitchShiftCents(a, shifted(220, c), { sampleRate: SR }).medianCents,
    );
    for (let i = 1; i < measured.length; i++) {
      expect(measured[i], `${measured[i]} must exceed ${measured[i - 1]}`).toBeGreaterThan(measured[i - 1]);
    }
  });

  it("works across the register, not just at 220 Hz", () => {
    for (const f0 of [110, 220, 440, 880]) {
      const r = pitchShiftCents(tone(f0, 1.5), shifted(f0, 40), { sampleRate: SR });
      expect(Math.abs(r.medianCents - 40), `f0=${f0} measured ${r.medianCents}`).toBeLessThan(3);
    }
  });

  /**
   * The old ruler's failure mode, checked directly: LSD conflates spectral and
   * temporal difference, so a pitch measure must NOT move when only timing
   * changes. A tone that starts 20 ms later is the same pitch.
   */
  it("does not mistake a timing offset for a detune", () => {
    const a = tone(220, 1.5);
    const delayed = new Float64Array(a.length);
    const off = Math.round(0.02 * SR);
    for (let i = off; i < a.length; i++) delayed[i] = a[i - off];
    const r = pitchShiftCents(a, delayed, { sampleRate: SR });
    expect(Math.abs(r.medianCents)).toBeLessThan(2);
  });
});
