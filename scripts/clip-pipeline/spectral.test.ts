/**
 * S5a proof (artifact pivot §1 Layer A).
 *
 * The measure is verified against SYNTHETIC signals whose spectra are known in
 * closed form, not against our audio files. That ordering matters: if the FFT
 * were subtly wrong, measuring real clips would produce plausible-looking
 * numbers and nothing would ever catch it. Here a wrong FFT fails immediately,
 * because a pure sinusoid has exactly one right answer.
 */

import { describe, expect, it } from "vitest";
// Plain Node ESM module; `allowJs` in tsconfig types it by inference.
import { clippingStats, fft, hann, logBandSpectrogram, logSpectralDistance, longestSilenceSec } from "./spectral.mjs";

const SR = 44100; // must match DEFAULT_SPECTRAL_OPTS.sampleRate — band edges derive from it
const N = 4096;

/** A pure sinusoid at `hz`, `sec` long. */
function sine(hz: number, sec = 1, amp = 0.5, sr = SR): Float32Array {
  const out = new Float32Array(Math.round(sec * sr));
  for (let i = 0; i < out.length; i++) out[i] = amp * Math.sin((2 * Math.PI * hz * i) / sr);
  return out;
}

/** Deterministic pseudo-random noise — reproducible across runs. */
function noise(sec = 1, amp = 0.1, seed = 12345, sr = SR): Float32Array {
  let s = seed >>> 0;
  const out = new Float32Array(Math.round(sec * sr));
  for (let i = 0; i < out.length; i++) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    out[i] = ((s / 4294967296) * 2 - 1) * amp;
  }
  return out;
}

const mix = (a: Float32Array, b: Float32Array): Float32Array => {
  const out = new Float32Array(a.length);
  for (let i = 0; i < a.length; i++) out[i] = a[i] + (b[i] ?? 0);
  return out;
};

/** One-pole lowpass — attenuates high bands, leaves low ones intact. */
function lowpass(x: Float32Array, alpha: number): Float32Array {
  const out = new Float32Array(x.length);
  let prev = 0;
  for (let i = 0; i < x.length; i++) {
    prev = prev + alpha * (x[i] - prev);
    out[i] = prev;
  }
  return out;
}

describe("spectral — FFT correctness (closed-form cases)", () => {
  it("a pure sinusoid on a bin centre lands in exactly that bin", () => {
    // Frequency chosen so an integer number of periods fits the window: no
    // leakage, so the answer is a single bin and anything else is a bug.
    const bin = 32;
    const re = new Float64Array(N);
    const im = new Float64Array(N);
    for (let i = 0; i < N; i++) re[i] = Math.cos((2 * Math.PI * bin * i) / N);
    fft(re, im);

    const mag = Array.from({ length: N / 2 }, (_, k) => Math.hypot(re[k], im[k]));
    const peak = mag.indexOf(Math.max(...mag));
    expect(peak).toBe(bin);
    // Everything off-peak must be numerically negligible against the peak.
    const offPeak = mag.filter((_, k) => Math.abs(k - bin) > 1);
    expect(Math.max(...offPeak) / mag[bin]).toBeLessThan(1e-9);
  });

  it("satisfies Parseval's theorem (energy is conserved)", () => {
    const x = noise(N / SR, 0.4, 999);
    const re = Float64Array.from(x.slice(0, N));
    const im = new Float64Array(N);
    const timeEnergy = Array.from(re).reduce((s, v) => s + v * v, 0);
    fft(re, im);
    let freqEnergy = 0;
    for (let k = 0; k < N; k++) freqEnergy += re[k] * re[k] + im[k] * im[k];
    expect(freqEnergy / N).toBeCloseTo(timeEnergy, 6);
  });

  it("rejects non-power-of-two and mismatched inputs instead of returning garbage", () => {
    expect(() => fft(new Float64Array(100), new Float64Array(100))).toThrow(/power of two/);
    expect(() => fft(new Float64Array(8), new Float64Array(4))).toThrow(/length mismatch/);
  });

  it("hann window is periodic, symmetric, and peaks at 1", () => {
    const w = hann(8);
    expect(w[0]).toBeCloseTo(0, 12);
    expect(Math.max(...w)).toBeCloseTo(1, 12);
    for (let i = 1; i < 4; i++) expect(w[i]).toBeCloseTo(w[8 - i], 12);
  });
});

describe("spectral — the spectrogram puts energy where it belongs", () => {
  it("a low tone loads low bands; a high tone loads high bands", () => {
    const low = logBandSpectrogram(sine(200), { sampleRate: SR });
    const high = logBandSpectrogram(sine(6000), { sampleRate: SR });
    const peakBand = (s: { frames: Float64Array[] }) => {
      const f = s.frames[Math.floor(s.frames.length / 2)];
      return Array.from(f).indexOf(Math.max(...Array.from(f)));
    };
    const lowPeak = peakBand(low);
    const highPeak = peakBand(high);
    console.log(`[spec] peak band — 200 Hz tone: ${lowPeak}, 6000 Hz tone: ${highPeak} (of 24)`);
    expect(lowPeak).toBeLessThan(8);
    expect(highPeak).toBeGreaterThan(16);
  });
});

describe("spectral — log-spectral distance", () => {
  const base = mix(sine(440, 2, 0.4), noise(2, 0.05, 7));

  it("a signal is at zero distance from itself", () => {
    const r = logSpectralDistance(base, base, { sampleRate: SR });
    expect(r.lsdDb).toBeCloseTo(0, 12);
    expect(r.framesCompared).toBeGreaterThan(50);
  });

  it("is symmetric — distance cannot depend on argument order", () => {
    const other = lowpass(base, 0.3);
    const ab = logSpectralDistance(base, other, { sampleRate: SR }).lsdDb;
    const ba = logSpectralDistance(other, base, { sampleRate: SR }).lsdDb;
    expect(ab).toBeCloseTo(ba, 12);
  });

  it("grows monotonically with the amount of degradation", () => {
    // Progressively heavier lowpass = progressively bigger manipulation. This
    // is the property the whole strength ladder (S6) depends on.
    const alphas = [0.9, 0.6, 0.3, 0.1, 0.03];
    const d = alphas.map((a) => logSpectralDistance(base, lowpass(base, a), { sampleRate: SR }).lsdDb);
    console.log(`[spec] LSD vs lowpass severity: ${d.map((x) => x.toFixed(2)).join(" → ")} dB`);
    for (let i = 1; i < d.length; i++) expect(d[i]).toBeGreaterThan(d[i - 1]);
  });

  it("grows monotonically with added noise", () => {
    const amps = [0.001, 0.01, 0.05, 0.2];
    const d = amps.map((a) => logSpectralDistance(base, mix(base, noise(2, a, 31)), { sampleRate: SR }).lsdDb);
    console.log(`[spec] LSD vs added noise: ${d.map((x) => x.toFixed(2)).join(" → ")} dB`);
    for (let i = 1; i < d.length; i++) expect(d[i]).toBeGreaterThan(d[i - 1]);
  });

  it("localizes the difference to the bands that actually changed", () => {
    // Lowpassing leaves low bands alone and guts the top — so the per-band
    // profile must rise with frequency. A measure that smeared the difference
    // evenly would pass the monotonicity tests above and still be useless for
    // diagnosing WHICH family a manipulation belongs to.
    const r = logSpectralDistance(base, lowpass(base, 0.2), { sampleRate: SR });
    const lowThird = r.perBandDb.slice(0, 8).reduce((a: number, b: number) => a + b, 0) / 8;
    const highThird = r.perBandDb.slice(-8).reduce((a: number, b: number) => a + b, 0) / 8;
    console.log(`[spec] per-band LSD — low third ${lowThird.toFixed(2)} dB, high third ${highThird.toFixed(2)} dB`);
    expect(highThird).toBeGreaterThan(lowThird * 2);
  });

  it("is deterministic", () => {
    const other = lowpass(base, 0.4);
    expect(logSpectralDistance(base, other, { sampleRate: SR }).lsdDb).toBe(logSpectralDistance(base, other, { sampleRate: SR }).lsdDb);
  });

  it("skips frames that are silent on BOTH sides, but not one-sided silence", () => {
    // A tone for the first second, digital silence for the second. Both
    // signals share the gap, so the gap's frames carry no information and must
    // be skipped — while the tone's frames are still compared.
    const withTail = (seed: number) => {
      const s = mix(sine(440, 2, 0.4), noise(2, 0.02, seed));
      s.fill(0, SR); // silence the second half on BOTH signals
      return s;
    };
    const both = logSpectralDistance(withTail(1), withTail(2), { sampleRate: SR });
    expect(both.framesSkipped).toBeGreaterThan(20);
    expect(both.framesCompared).toBeGreaterThan(20);

    // One side real audio, the other digital silence: a genuine difference
    // that must be COUNTED, not skipped away.
    const oneSided = logSpectralDistance(base.slice(0, SR), new Float32Array(SR), { sampleRate: SR });
    expect(oneSided.framesSkipped).toBe(0);
    expect(oneSided.lsdDb).toBeGreaterThan(10);
  });

  it("throws rather than returning a number it cannot justify", () => {
    expect(() => logSpectralDistance(new Float32Array(10), new Float32Array(10), { sampleRate: SR })).toThrow(/too short/);
    const dead = new Float32Array(SR);
    expect(() => logSpectralDistance(dead, dead, { sampleRate: SR, silenceFloorDb: -10 })).toThrow(/silence floor/);
  });
});

describe("spectral — the lossy family is actually visible (RT fix)", () => {
  it("sees a brickwall lowpass ABOVE 10 kHz, where MP3 damage lives", () => {
    // The bug this pins: with the old 22.05 kHz / fMax 10 kHz defaults,
    // Nyquist sat at 11 kHz and the characteristic low-bitrate MP3 lowpass
    // was almost entirely outside the measured range. The family whose
    // signature is a high-frequency brickwall would have measured as nearly
    // unchanged, and that small number would have been reported as evidence.
    // Length is an exact multiple of the transform block, so every sample gets
    // processed. (First attempt left a tail of untouched zeros, which compared
    // digital silence against real audio and produced a uniform 64 dB
    // "difference" in every band — the measure was right, the fixture was not.)
    const BLOCK = 1 << 14;
    const wide = mix(sine(800, (BLOCK * 4) / SR, 0.3), noise((BLOCK * 4) / SR, 0.25, 77));
    // Zero everything above ~13 kHz via a spectral brickwall, the way a codec does.
    const brickwalled = (() => {
      const n = BLOCK;
      const out = new Float32Array(wide.length);
      for (let off = 0; off + n <= wide.length; off += n) {
        const re = new Float64Array(n);
        const im = new Float64Array(n);
        for (let i = 0; i < n; i++) re[i] = wide[off + i];
        fft(re, im);
        const cut = Math.round((13000 / SR) * n);
        for (let k = cut; k <= n - cut; k++) {
          re[k] = 0;
          im[k] = 0;
        }
        // Inverse via conjugation: conj → FFT → conj → scale.
        for (let k = 0; k < n; k++) im[k] = -im[k];
        fft(re, im);
        for (let i = 0; i < n; i++) out[off + i] = re[i] / n;
      }
      return out;
    })();

    const r = logSpectralDistance(wide, brickwalled, { sampleRate: SR });
    // Bands are log-spaced from 50 Hz to 16 kHz, so "the top four" spans
    // 6.1–16 kHz and three of them sit BELOW a 13 kHz cutoff. Averaging them
    // dilutes a real effect into a small one — assert against the bands that
    // actually straddle the cutoff instead.
    const nBands = r.perBandDb.length;
    const loHz = (i: number) => 50 * Math.pow(16000 / 50, i / nBands);
    // The 13 kHz cutoff falls INSIDE the top band (12.6–16 kHz), so no band
    // sits wholly above it. The right assertion is on the straddling band.
    const straddling = r.perBandDb[nBands - 1];
    const everythingBelow = Math.max(...r.perBandDb.slice(0, nBands - 1));
    console.log(
      `[spec] 13 kHz brickwall — top band (${loHz(nBands - 1).toFixed(0)}–16000 Hz) ${straddling.toFixed(2)} dB; ` +
        `worst of all lower bands ${everythingBelow.toFixed(2)} dB`,
    );
    // The damage shows up, and ONLY where it happened.
    expect(straddling).toBeGreaterThan(5);
    expect(straddling).toBeGreaterThan(everythingBelow * 50);

    // The regression this test exists for: under the old fMax of 10 kHz, the
    // affected band is not measured at all, and a manipulation that deletes
    // everything above 13 kHz reports as essentially no difference.
    const blind = logSpectralDistance(wide, brickwalled, { sampleRate: SR, fMax: 10000 });
    console.log(`[spec]   same pair measured with the OLD fMax=10000: ${blind.lsdDb.toFixed(3)} dB (vs ${r.lsdDb.toFixed(3)} dB)`);
    expect(blind.lsdDb).toBeLessThan(0.1);
    expect(r.lsdDb).toBeGreaterThan(blind.lsdDb * 10);
  });
});

describe("spectral — artifact detectors (unfair tells)", () => {
  it("detects even a HANDFUL of clipped samples, not just gross clipping", () => {
    // The extreme case below proves nothing about sensitivity: a gate that
    // only fires at 49% clipping would miss the clicks that actually leak a
    // tell to a listener.
    const nearly = sine(440, 0.5, 0.98);
    expect(clippingStats(nearly).clippedSamples).toBe(0);
    const withFive = Float32Array.from(nearly);
    for (let i = 0; i < 5; i++) withFive[1000 + i * 37] = 1.0;
    const r = clippingStats(withFive);
    console.log(`[spec] planted 5 clipped samples → detected ${r.clippedSamples}`);
    expect(r.clippedSamples).toBe(5);
  });

  it("clipping is detected and quantified", () => {
    const clean = sine(440, 0.5, 0.5);
    expect(clippingStats(clean).clippedSamples).toBe(0);
    const hot = sine(440, 0.5, 1.4).map((v) => Math.max(-1, Math.min(1, v))) as Float32Array;
    const r = clippingStats(hot);
    console.log(`[spec] clipped fraction on a hot signal: ${(r.clippedFraction * 100).toFixed(1)}%`);
    expect(r.clippedSamples).toBeGreaterThan(0);
    expect(r.peak).toBeCloseTo(1, 6);
  });

  it("a dead passage is found and measured in seconds", () => {
    const withGap = sine(440, 2, 0.5);
    withGap.fill(0, SR / 2, SR / 2 + Math.round(0.4 * SR)); // 400 ms of silence
    const gap = longestSilenceSec(withGap, SR);
    console.log(`[spec] longest silence found: ${gap.toFixed(2)}s (planted 0.40s)`);
    expect(gap).toBeGreaterThan(0.3);
    expect(gap).toBeLessThan(0.5);
    expect(longestSilenceSec(sine(440, 2, 0.5), SR)).toBeLessThan(0.1);
  });
});
