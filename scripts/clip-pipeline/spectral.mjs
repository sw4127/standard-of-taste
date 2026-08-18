/**
 * Layer A spectral measurement (artifact pivot §1 — "spectral-distance
 * magnitude of the manipulation ... without anyone listening").
 *
 * WHAT THIS REPLACES: the PM ear pass. The old gate asked a non-musician
 * whether a degradation was audible; unstable labels made the answer worthless
 * (pivot §0.1). This measures HOW BIG the manipulation is, objectively and
 * reproducibly. It does NOT measure audibility — nothing here knows what a
 * human can hear. Audibility is inferred, in S5b, by comparison against a
 * control manipulation that is known to be transparent.
 *
 * THE MEASURE: log-spectral distance (LSD), the standard objective distance
 * between two audio signals. Both files are cut into overlapping frames,
 * each frame is transformed and collapsed into log-spaced band energies in dB,
 * and the distance is the RMS difference of those dB values across every band
 * and frame. Units are decibels, which is the point: "these two files differ
 * by 4.2 dB averaged across the spectrum" is a sentence with meaning, unlike a
 * unitless similarity score.
 *
 * HONEST LIMITS (N3), because a number this convenient invites over-claiming:
 * - LSD conflates spectral and TEMPORAL difference. A timing-smeared file is
 *   misaligned against its original, and misalignment registers as spectral
 *   distance. For a magnitude measure that is acceptable — the manipulation is
 *   genuinely there — but LSD must never be read as "how much the tone colour
 *   changed" for the timing family.
 * - It is unweighted by perception. No equal-loudness contour, no masking
 *   model. A 3 dB difference in a band nobody can hear counts the same as
 *   3 dB where the ear is most sensitive. This is exactly why the control
 *   anchor exists rather than a fixed "audible above X dB" threshold.
 * - Both sides of our pairs are mp3-encoded, so every measurement includes
 *   codec noise on both files. The pipeline-noise control quantifies that
 *   floor so it can be subtracted from the interpretation, not the number.
 */

/**
 * In-place iterative radix-2 Cooley-Tukey FFT.
 *
 * Hand-rolled rather than imported: this is one well-understood function, and
 * the alternative is a dependency in a pipeline whose whole value is that its
 * numbers are inspectable. Correctness is asserted against closed-form cases
 * (a pure sinusoid must land in exactly one bin; Parseval's theorem must hold)
 * rather than assumed.
 *
 * @param {Float64Array} re real part, length must be a power of two
 * @param {Float64Array} im imaginary part, same length
 */
export function fft(re, im) {
  const n = re.length;
  if (n !== im.length) throw new Error("fft: re/im length mismatch");
  if (n < 2 || (n & (n - 1)) !== 0) throw new Error(`fft: length must be a power of two, got ${n}`);

  // Bit-reversal permutation.
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }

  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wRe = Math.cos(ang);
    const wIm = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let curRe = 1;
      let curIm = 0;
      for (let k = 0; k < len / 2; k++) {
        const uRe = re[i + k];
        const uIm = im[i + k];
        const vRe = re[i + k + len / 2] * curRe - im[i + k + len / 2] * curIm;
        const vIm = re[i + k + len / 2] * curIm + im[i + k + len / 2] * curRe;
        re[i + k] = uRe + vRe;
        im[i + k] = uIm + vIm;
        re[i + k + len / 2] = uRe - vRe;
        im[i + k + len / 2] = uIm - vIm;
        const nextRe = curRe * wRe - curIm * wIm;
        curIm = curRe * wIm + curIm * wRe;
        curRe = nextRe;
      }
    }
  }
}

/** Periodic Hann window — the standard choice for overlap-add analysis. */
export function hann(n) {
  const w = new Float64Array(n);
  for (let i = 0; i < n; i++) w[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / n));
  return w;
}

export const DEFAULT_SPECTRAL_OPTS = {
  /**
   * 44.1 kHz, NOT the 22.05 kHz the rest of the pipeline uses for analysis.
   *
   * Found while red-teaming S5a: low-bitrate MP3 encoding does most of its
   * audible damage ABOVE 10 kHz — it lowpasses hard (roughly 11 kHz at 64k,
   * lower still at 32k) and that brickwall is the single most characteristic
   * artifact of the `lossy-artifact` family. Decoding at 22.05 kHz puts
   * Nyquist at 11 kHz and an fMax of 10 kHz would have hidden almost all of
   * it. We would have measured the lossy family with its own signature cut
   * off, and reported the resulting small number as evidence.
   *
   * CALLERS MUST DECODE AT THIS RATE. The band edges are computed from
   * `sampleRate`, so passing 44.1 kHz audio while claiming 22.05 kHz silently
   * mismaps every band.
   */
  sampleRate: 44100,
  /** 2048 at 44.1 kHz keeps frequency resolution (~21 Hz/bin) comparable. */
  frameSize: 2048,
  hop: 1024,
  nBands: 24,
  fMin: 50,
  /** Comfortably above the MP3 lowpass knees this has to be able to see. */
  fMax: 16000,
  /**
   * Frames quieter than this (dBFS, RMS) are skipped on BOTH signals. Silence
   * has no meaningful spectrum, and a pair of near-silent frames would
   * otherwise contribute a large dB difference between two floors of numerical
   * noise — inflating the distance with something nobody could hear.
   */
  silenceFloorDb: -60,
};

/** Log-spaced band edges in Hz, as FFT bin indices. */
function bandEdges({ sampleRate, frameSize, nBands, fMin, fMax }) {
  const binOf = (hz) => Math.round((hz / sampleRate) * frameSize);
  const edges = [];
  for (let i = 0; i <= nBands; i++) {
    const hz = fMin * Math.pow(fMax / fMin, i / nBands);
    edges.push(Math.min(frameSize / 2, Math.max(1, binOf(hz))));
  }
  return edges;
}

/**
 * Short-time log band energies.
 * @returns {{ frames: Float64Array[], rmsDb: number[] }} one dB vector per frame
 */
export function logBandSpectrogram(samples, opts = {}) {
  const o = { ...DEFAULT_SPECTRAL_OPTS, ...opts };
  const { frameSize, hop, nBands } = o;
  const win = hann(frameSize);
  const edges = bandEdges(o);
  const frames = [];
  const rmsDb = [];

  for (let start = 0; start + frameSize <= samples.length; start += hop) {
    const re = new Float64Array(frameSize);
    const im = new Float64Array(frameSize);
    let sumSq = 0;
    for (let i = 0; i < frameSize; i++) {
      const s = samples[start + i];
      sumSq += s * s;
      re[i] = s * win[i];
    }
    rmsDb.push(10 * Math.log10(sumSq / frameSize + 1e-20));
    fft(re, im);

    const bands = new Float64Array(nBands);
    for (let b = 0; b < nBands; b++) {
      let energy = 0;
      const lo = edges[b];
      const hi = Math.max(edges[b + 1], lo + 1);
      for (let k = lo; k < hi; k++) energy += re[k] * re[k] + im[k] * im[k];
      // +1e-12 keeps log finite in true digital silence without materially
      // shifting any real measurement.
      bands[b] = 10 * Math.log10(energy / (hi - lo) + 1e-12);
    }
    frames.push(bands);
  }
  return { frames, rmsDb };
}

/**
 * Log-spectral distance between two signals, in dB.
 *
 * Symmetric by construction (it is an RMS of differences), which is asserted by
 * test — an asymmetric "distance" would make "how far is A from B" depend on
 * argument order, and every downstream ratio would inherit the ambiguity.
 *
 * @returns {{ lsdDb: number, perBandDb: number[], framesCompared: number, framesSkipped: number }}
 */
export function logSpectralDistance(a, b, opts = {}) {
  const o = { ...DEFAULT_SPECTRAL_OPTS, ...opts };
  const A = logBandSpectrogram(a, o);
  const B = logBandSpectrogram(b, o);
  const nFrames = Math.min(A.frames.length, B.frames.length);
  if (nFrames === 0) throw new Error("lsd: signals too short for a single analysis frame");

  const perBandSum = new Float64Array(o.nBands);
  let total = 0;
  let compared = 0;
  let skipped = 0;

  for (let f = 0; f < nFrames; f++) {
    // Skip only when BOTH frames are silent: a frame silent on one side and
    // not the other is a real difference and must be counted.
    if (A.rmsDb[f] < o.silenceFloorDb && B.rmsDb[f] < o.silenceFloorDb) {
      skipped++;
      continue;
    }
    for (let band = 0; band < o.nBands; band++) {
      const d = A.frames[f][band] - B.frames[f][band];
      perBandSum[band] += d * d;
      total += d * d;
    }
    compared++;
  }
  if (compared === 0) throw new Error("lsd: every frame was below the silence floor on both signals");

  return {
    lsdDb: Math.sqrt(total / (compared * o.nBands)),
    perBandDb: Array.from(perBandSum, (s) => Math.sqrt(s / compared)),
    framesCompared: compared,
    framesSkipped: skipped,
  };
}

/**
 * Clipping detection. Clipping is an unfair tell — a listener can hear the
 * click without hearing the degradation we intended — so it has to be caught.
 *
 * TWO detectors, because the obvious one is not enough (found by RT-17a):
 *
 *  1. `clippedFraction` — samples at or beyond full scale. This is what most
 *     tools report, and it MISSES the way clipping actually reaches our files.
 *     Our render path applies EBU R128 loudness normalisation after the
 *     manipulation, so a hard-clipped waveform is rescaled to −1.5 dBTP before
 *     it is ever measured: the distortion survives, the full-scale samples do
 *     not. A deliberately clipped test render measured 0.00% by this detector
 *     and PASSED the gate.
 *
 *  2. `flatTopFraction` — samples belonging to a run of `flatRun` or more
 *     consecutive samples within `relTol` of the signal's OWN peak. Clipping
 *     flattens waveform crests, and flattening is preserved by any later gain
 *     change. Level-independent, which is precisely the property detector 1
 *     lacks. Real music crests are curved and cross the near-peak region in
 *     roughly a sample, so an unclipped signal scores about zero here.
 */
export function clippingStats(samples, threshold = 0.999, { flatRun = 4, relTol = 1e-3 } = {}) {
  let peak = 0;
  let clipped = 0;
  for (const s of samples) {
    const v = Math.abs(s);
    if (v > peak) peak = v;
    if (v >= threshold) clipped++;
  }

  const nearPeak = peak * (1 - relTol);
  let flat = 0;
  let run = 0;
  for (let i = 0; i <= samples.length; i++) {
    const near = i < samples.length && Math.abs(samples[i]) >= nearPeak;
    if (near) {
      run++;
    } else {
      if (run >= flatRun) flat += run;
      run = 0;
    }
  }

  return {
    peak,
    clippedSamples: clipped,
    clippedFraction: clipped / samples.length,
    flatTopSamples: flat,
    flatTopFraction: flat / samples.length,
  };
}

/**
 * Longest run of near-silence, in seconds. A dead passage makes a trial
 * unanswerable regardless of how large the manipulation measures, because the
 * listener has nothing to compare during it.
 *
 * QUANTIZATION, and its direction (measured: a planted 400 ms gap reports as
 * 350 ms at the default 50 ms window). Windows straddling the edge of a gap
 * contain some signal and are not counted, so this UNDER-reports by up to one
 * window. That is the unsafe direction for a reject-dead-air gate, so any
 * threshold built on it must carry a one-window margin rather than treating
 * the figure as exact.
 */
/**
 * TOTAL near-silent time, as a fraction of the clip — measured RELATIVE to the
 * clip's own peak, not against an absolute floor.
 *
 * WHY THIS EXISTS SEPARATELY FROM longestSilenceSec (found by PM user-testing,
 * 2026-08-08): "no dead air" was implemented as "no long silence", and those are
 * not the same requirement. Trial d2 — a Beethoven adagio full of rests — is 35%
 * near-silent spread across many short gaps, so its LONGEST run is 0.00s and the
 * dead-air gate passed it. A listener reported it as barely containing music.
 * For a TIMING trial that is disqualifying: you cannot hear a tempo warble
 * during a rest.
 *
 * Relative to peak rather than absolute dBFS because every clip is loudness-
 * normalised, so what matters is how much of THIS clip is quiet compared with
 * itself.
 */
export function quietFraction(samples, sampleRate, relFloor = 0.06, windowMs = 50) {
  const win = Math.max(1, Math.round((windowMs / 1000) * sampleRate));
  const n = Math.floor(samples.length / win);
  if (n === 0) return 0;
  const rms = [];
  let peak = 0;
  for (let i = 0; i < n; i++) {
    let sumSq = 0;
    for (let k = 0; k < win; k++) sumSq += samples[i * win + k] ** 2;
    const r = Math.sqrt(sumSq / win);
    rms.push(r);
    if (r > peak) peak = r;
  }
  if (peak === 0) return 1;
  return rms.filter((r) => r < peak * relFloor).length / n;
}

export function longestSilenceSec(samples, sampleRate, floorDb = -60, windowMs = 50) {
  const win = Math.max(1, Math.round((windowMs / 1000) * sampleRate));
  const floor = Math.pow(10, floorDb / 10);
  let longest = 0;
  let run = 0;
  for (let start = 0; start + win <= samples.length; start += win) {
    let sumSq = 0;
    for (let i = 0; i < win; i++) sumSq += samples[start + i] * samples[start + i];
    if (sumSq / win < floor) {
      run++;
      if (run > longest) longest = run;
    } else {
      run = 0;
    }
  }
  return (longest * win) / sampleRate;
}

/**
 * Temporal drift between two signals, in milliseconds (S5b red-team fix).
 *
 * WHY THIS EXISTS: log-spectral distance is the wrong instrument for the
 * timing-smear family. That manipulation stretches segments, so the two files
 * progressively fall out of step — and LSD compares frame k of A against frame
 * k of B, which after a few seconds means comparing unrelated moments of music.
 * The result is a large number driven by misalignment rather than by any
 * spectral change. Measured on the live pool: d3 (timing, magnitude 2) scored
 * 22.1x the transparency anchor, the biggest figure in the pool, while its
 * magnitude-3 sibling scored 10.6x — an inversion that says the measure, not
 * the audio, was misbehaving.
 *
 * This measures the misalignment directly and honestly: how far, in ms, the
 * two signals slip apart over the clip. For a spectrally-degraded but
 * time-aligned pair it reads ~0; for a time-warped pair it reads the warp.
 *
 * METHOD: cross-correlate short-time ENERGY ENVELOPES rather than raw samples.
 * Sample-domain search over +/-50 ms would be ~10^9 operations per pair; the
 * envelope carries the rhythmic information that alignment depends on and
 * makes the search cheap. Resolution is the envelope hop (1 ms by default),
 * which is far finer than the drift being measured.
 */
export function temporalDrift(a, b, opts = {}) {
  const {
    sampleRate = DEFAULT_SPECTRAL_OPTS.sampleRate,
    envelopeMs = 1,
    // 200 ms, not 500 (S6 saturation fix). A block is itself stretched by the
    // warp being measured: at 5% deviation a 500 ms block contains 25 ms of
    // internal stretch, comparable to the lag being estimated, so no single
    // lag aligns it and the correlation peak collapses. Confident blocks fell
    // 100% -> 56% across the timing ladder and measured drift UNDER-reported
    // the warp. A 200 ms block carries ~10 ms of internal stretch instead.
    blockMs = 200,
    /**
     * WIDENED 60 -> 250 ms (E2/S3, 2026-08-14). This is a CEILING on what can
     * be reported, and the ladder had already grown past it.
     *
     * MEASURED, with the true answer known. The renderer draws segment
     * deviations from a seeded PRNG and mean-corrects them, so at a FIXED SEED
     * the drift trajectory is exactly proportional to the parameter — which
     * makes any departure from linearity attributable to the measure rather
     * than the audio. Sweeping one window at seed 500, expected drift is about
     * 2000 x param ms:
     *
     *     param   expected   @60ms    @250-300ms
     *     0.01          20      19            19
     *     0.02          40      30            37
     *     0.03          60      29  <-- DOWN  61
     *     0.05         100      40            90
     *     0.1          200      85           103
     *
     * At 60 ms the series INVERTED twice (0.02 -> 0.03 fell from 30 to 29 ms)
     * and the top shipping rung was under-reported by roughly 60%. Confidence
     * looked like it was collapsing with strength — 100% down to 49% — and most
     * of that was this too: at 250 ms the same rungs read 97%, 94%, 76%.
     *
     * This does NOT flip any pool verdict — 18/18 still PASS. Confidence rose
     * on every timing pair, and drift rose on five of six:
     *
     *     d2  25->28   d14 19->21   d5  34->38   d17 37->42   d8  46->67
     *     d11 21->14   <-- FELL
     *
     * d11 falling is not a regression and the exception is worth keeping in
     * view: a narrow window makes blocks lock onto whatever spurious peak lies
     * inside it, and scattered lags inflate the IQR. Its confidence rose
     * (96% -> 97%) while its drift fell, which is what "the old number was
     * partly noise" looks like. A wider search does not only find more drift;
     * it also stops inventing some.
     *
     * The remaining decline at 0.1 (76%) is real. Time-warped audio genuinely
     * correlates less well, which is the honest difference between this family
     * and pitch drift — there the apparent blindness was an artifact of using
     * an envelope correlator on a duration-exact manipulation; here the
     * misalignment IS the manipulation.
     */
    maxLagMs = 250,
    minScore = 0.9,
    /**
     * Half-width of the local search around the previous confident lag. Drift
     * is continuous, so once alignment is established the next block's lag is
     * nearby; searching globally every time invites jumps to spurious peaks in
     * periodic material. Falls back to the full +/-maxLagMs search whenever
     * the track is lost.
     */
    trackWindowMs = 15,
    /**
     * Blocks quieter than this (relative to the loudest block) carry no onset
     * to align and are SKIPPED, not scored. Correlating near-silence against
     * near-silence is 0/0 — it produces a degenerate score that reads as "did
     * not align" when the truth is "there was nothing here to align". With the
     * shorter blocks this matters: an identical pair reported only 38%
     * confident because the gaps between onsets were being counted as failures.
     */
    silenceRel = 0.05,
  } = opts;
  const step = Math.max(1, Math.round((envelopeMs / 1000) * sampleRate));

  const envelope = (x) => {
    const n = Math.floor(x.length / step);
    const e = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      let s = 0;
      for (let k = 0; k < step; k++) s += x[i * step + k] * x[i * step + k];
      e[i] = Math.sqrt(s / step);
    }
    return e;
  };

  const ea = envelope(a);
  const eb = envelope(b);
  const block = Math.round(blockMs / envelopeMs);
  const maxLag = Math.round(maxLagMs / envelopeMs);
  const lags = [];
  const scores = [];

  const trackWindow = Math.round(trackWindowMs / envelopeMs);
  let tracked = null; // last confident lag, in envelope samples
  const loudest = Math.max(...ea, ...eb) || 1;
  const quietFloor = loudest * silenceRel;
  let skipped = 0;

  for (let start = maxLag; start + block + maxLag <= Math.min(ea.length, eb.length); start += block) {
    // Local search while the track holds, global search to (re)acquire it.
    const lo = tracked === null ? -maxLag : Math.max(-maxLag, tracked - trackWindow);
    const hi = tracked === null ? maxLag : Math.min(maxLag, tracked + trackWindow);
    // Nothing to align in this block on either side — skip rather than score.
    let peakA = 0;
    let peakB = 0;
    for (let i = 0; i < block; i++) {
      if (ea[start + i] > peakA) peakA = ea[start + i];
      if (eb[start + i] > peakB) peakB = eb[start + i];
    }
    if (peakA < quietFloor && peakB < quietFloor) {
      skipped++;
      continue;
    }

    let bestLag = 0;
    let bestScore = -Infinity;
    for (let lag = lo; lag <= hi; lag++) {
      let dot = 0, na = 0, nb = 0;
      for (let i = 0; i < block; i++) {
        const va = ea[start + i];
        const vb = eb[start + i + lag];
        dot += va * vb;
        na += va * va;
        nb += vb * vb;
      }
      // Normalized correlation: amplitude differences must not decide the lag.
      const score = dot / (Math.sqrt(na * nb) + 1e-12);
      if (score > bestScore) {
        bestScore = score;
        bestLag = lag;
      }
    }
    // A block that never locked must not seed the next block's search, or one
    // bad estimate drags the whole trajectory after it.
    tracked = bestScore >= minScore ? bestLag : null;
    lags.push(bestLag * envelopeMs);
    scores.push(bestScore);
  }

  if (lags.length === 0) throw new Error("temporalDrift: signals too short for a single block");

  // CONFIDENCE GATE (S5b red-team). A block whose best correlation is weak has
  // not located an alignment — it has picked the least-bad of several equally
  // poor options, and its "lag" is noise. Including such blocks let a single
  // bad one fake 17 ms of drift on d1, and pure incoherence fake 84 ms on d4,
  // while the genuinely time-warped pairs showed smooth trajectories. Only
  // confident blocks contribute to the reported drift.
  const keep = lags.filter((_, i) => scores[i] >= minScore);
  const confidentFraction = keep.length / lags.length;

  // Robust spread over confident blocks. The interquartile range is reported
  // alongside peak-to-peak because peak-to-peak is a maximum of a noisy
  // quantity, and maxima of noise grow with however many blocks you measured.
  const sorted = [...keep].sort((x, y) => x - y);
  const q = (f) => (sorted.length === 0 ? 0 : sorted[Math.min(sorted.length - 1, Math.floor(f * sorted.length))]);
  const consecutive = keep.slice(1).map((l, i) => Math.abs(l - keep[i]));
  const meanStep = consecutive.length ? consecutive.reduce((a, b) => a + b, 0) / consecutive.length : 0;

  return {
    lagsMs: lags,
    scores,
    /** Blocks with no onset on either side — excluded from the denominator. */
    silentBlocks: skipped,
    confidentFraction,
    /** Largest absolute slip among CONFIDENT blocks. */
    maxAbsLagMs: keep.length ? Math.max(...keep.map(Math.abs)) : 0,
    rmsLagMs: keep.length ? Math.sqrt(keep.reduce((s, l) => s + l * l, 0) / keep.length) : 0,
    /** Peak-to-peak wander over confident blocks. Sensitive to outliers. */
    lagRangeMs: keep.length ? Math.max(...keep) - Math.min(...keep) : 0,
    /** Interquartile range — the outlier-resistant magnitude. Gate on this. */
    lagIqrMs: q(0.75) - q(0.25),
    /**
     * Smoothness: spread divided by mean block-to-block step. A real warp
     * wanders gradually (steps small relative to spread); incoherent noise
     * steps as far as it spreads. Reported as a diagnostic, not gated on.
     */
    coherence: meanStep > 0 ? (q(0.75) - q(0.25)) / meanStep : 0,
  };
}

/**
 * The frequency of each log-spaced band edge, in Hz (E2/S2).
 *
 * `bandEdges` above returns FFT bin indices, which is what the spectrogram
 * needs and useless for saying where a band sits. Exported so a per-band result
 * can be reported in hertz instead of as "band 20", which means nothing to a
 * reader and cannot appear in a threshold.
 */
export function bandEdgeHz(opts = {}) {
  const { nBands, fMin, fMax } = { ...DEFAULT_SPECTRAL_OPTS, ...opts };
  return Array.from({ length: nBands + 1 }, (_, i) => fMin * Math.pow(fMax / fMin, i / nBands));
}

/**
 * Where a codec's lowpass brickwall sits, in Hz (E2/S2).
 *
 * WHY THIS IS THE LOSSY FAMILY'S PHYSICAL UNIT. Low-bitrate MP3 does most of
 * its characteristic damage by simply DISCARDING the top of the spectrum —
 * roughly 11 kHz at 64 kbps, lower still at 32. "The top 6 kHz is gone" is a
 * fact about the audio that a listener could in principle be tested against;
 * "25.6 dB of log-spectral distance" is not.
 *
 * METHOD: walk down from the top band and find the lowest band from which every
 * band above it has lost more than `lostDb`. Requiring the loss to hold all the
 * way up is what makes this a BRICKWALL detector rather than a "find the
 * noisiest band" detector — a single damaged band in the middle is not a knee.
 *
 * WHY THE TOP BAND IS EXCLUDED BY DEFAULT — measured, not assumed (E2/S2). The
 * first version walked from the literal top band and produced a knee that went
 * BACKWARDS: 9894 Hz at 96 kbps, 7780 at 64, then null at 48 and 32, as though
 * the most damaged files had no lowpass at all. The cause is that the top band
 * (12.6–16 kHz) measures 11.7–13.7 dB at EVERY bitrate, including the ones that
 * discard everything above 5 kHz. Our own reference is an mp3 render with
 * little energy up there, so both signals sit near their floor and the
 * difference saturates — the band cannot report a loss because there was almost
 * nothing to lose. Starting one band down makes the reading monotone
 * (9894 / 7780 / 4811 / below 2339 across 96k / 64k / 48k / 32k).
 *
 * WHAT IT STILL CANNOT DO (N3): distinguish "the top was cut" from "everything
 * was wrecked". At 32 kbps the damage is not confined to the top — bands down
 * at 2.3 kHz measure 25–30 dB — so the returned figure is the bottom of a
 * contiguous damaged run, not necessarily a codec lowpass. Read it as "above
 * here, the signal is gone", nothing more.
 *
 * Returns null when no such run exists, which is the honest answer for a
 * manipulation that is not a lowpass at all.
 */
export function lowpassKneeHz(perBandDb, opts = {}) {
  const { lostDb = 12, ignoreTopBands = 1 } = opts;
  const edges = bandEdgeHz(opts);
  let knee = null;
  for (let i = perBandDb.length - 1 - ignoreTopBands; i >= 0; i--) {
    if (perBandDb[i] > lostDb) knee = edges[i];
    else break;
  }
  return knee;
}

/**
 * Detune between two signals, in CENTS (E1, 2026-08-14).
 *
 * WHY THIS EXISTS. Layer A measures the pitch-drift family with log-spectral
 * distance and reports "x anchor" — a generic, unitless spectral distance. Two
 * problems, both fatal for the threshold instrument.
 *
 * FIRST, IT COMPRESSES. Across the shipping ladder the parameter quadruples
 * (25 -> 100 cents) while the measure moves from ~3-4x its anchor to ~5-7x.
 * Enough to prove monotonicity across three rungs; nowhere near enough to
 * separate twelve, which is what an adaptive staircase needs.
 *
 * SECOND, IT IS NOT THE UNIT WE OWE THE USER. The deliverable of record is a
 * per-flaw sensitivity threshold in PHYSICAL units (CLAUDE.md, D4 amendment):
 * "you hear drift at 40 cents and miss it at 25". A ruler graduated in
 * anchor-ratios cannot express that sentence, so a conversion would have to be
 * invented somewhere — and invented numbers are exactly what N3 forbids.
 *
 * ON THE "CONFIDENCE COLLAPSE" THIS SLICE WAS CALLED IN TO FIX. `temporalDrift`
 * reports 19-66% confident blocks on the top pitch-drift rung against 91-99%
 * lower down, which was recorded as "the drift measure goes blind above ~100
 * cents". That diagnosis was wrong, and the correction matters more than the
 * original note. Pitch drift is rendered with `rubberband=pitch`, which is
 * duration-EXACT — there is no misalignment to go blind to, and the reported
 * drift stays at 2-3 ms exactly as it should. What falls is the ENVELOPE
 * correlation, because a semitone of rubberband shift smears transients and
 * changes the envelope's shape. That number is a validity signal for the
 * timing family and a side effect of the manipulation for this one. Measuring
 * pitch in the pitch domain sidesteps the question instead of papering it over.
 *
 * METHOD. A shift of c cents is a TRANSLATION of the spectrum along a
 * log-frequency axis — that is what "cents" means. So: resample each frame's
 * magnitude spectrum onto a grid of constant cents-per-bin, cross-correlate the
 * two, and read the peak's position. Parabolic interpolation about the peak
 * gives resolution finer than the grid, because the estimate pools every
 * partial in the frame rather than tracking one.
 *
 * SIGN: positive means `b` is SHARPER than `a`.
 *
 * LIMITS, stated (N3). This measures a global spectral translation. Two files
 * that differ by anything other than a shift — a different take, a different
 * mix — are out of scope; it is for measuring OUR manipulations against OUR
 * originals. Frames with no confident peak are excluded and counted, never
 * silently averaged in.
 */
export function pitchShiftCents(a, b, opts = {}) {
  const {
    sampleRate = DEFAULT_SPECTRAL_OPTS.sampleRate,
    /** 8192 @ 44.1 kHz = ~186 ms, ~5.4 Hz/bin — fine enough to resolve partials. */
    frameSize = 8192,
    hop = 4096,
    /** Above the pool's fundamentals, below the mp3 lowpass knees. */
    fMin = 120,
    fMax = 6000,
    /** Grid resolution; sub-bin precision comes from the parabolic fit. */
    centsPerBin = 5,
    /** Widest shift searched. A semitone is 100 — this leaves headroom. */
    maxCents = 400,
    /** Frames whose correlation peak is weaker than this do not count. */
    minScore = 0.5,
    silenceFloorDb = DEFAULT_SPECTRAL_OPTS.silenceFloorDb,
  } = opts;

  const nBins = Math.floor((1200 * Math.log2(fMax / fMin)) / centsPerBin);
  const maxLag = Math.round(maxCents / centsPerBin);
  const win = hann(frameSize);
  const half = frameSize / 2;

  /** One frame's magnitude spectrum, resampled onto the constant-cents grid. */
  const logFreqProfile = (samples, start) => {
    const re = new Float64Array(frameSize);
    const im = new Float64Array(frameSize);
    let sumSq = 0;
    for (let i = 0; i < frameSize; i++) {
      const s = samples[start + i];
      sumSq += s * s;
      re[i] = s * win[i];
    }
    if (20 * Math.log10(Math.sqrt(sumSq / frameSize) + 1e-12) < silenceFloorDb) return null;
    fft(re, im);

    const prof = new Float64Array(nBins);
    for (let k = 0; k < nBins; k++) {
      const hz = fMin * Math.pow(2, (k * centsPerBin) / 1200);
      const bin = (hz / sampleRate) * frameSize;
      const i0 = Math.floor(bin);
      if (i0 < 1 || i0 + 1 >= half) continue;
      const frac = bin - i0;
      const m0 = Math.hypot(re[i0], im[i0]);
      const m1 = Math.hypot(re[i0 + 1], im[i0 + 1]);
      // Log magnitude: quiet partials keep contributing instead of letting the
      // loudest one decide the whole correlation.
      prof[k] = Math.log10(m0 * (1 - frac) + m1 * frac + 1e-9);
    }
    // Mean-subtract so the correlation reads SHAPE, not overall level.
    let mean = 0;
    for (let k = 0; k < nBins; k++) mean += prof[k];
    mean /= nBins;
    for (let k = 0; k < nBins; k++) prof[k] -= mean;
    return prof;
  };

  const cents = [];
  const scores = [];
  let silentFrames = 0;

  for (let start = 0; start + frameSize <= Math.min(a.length, b.length); start += hop) {
    const pa = logFreqProfile(a, start);
    const pb = logFreqProfile(b, start);
    if (!pa || !pb) {
      silentFrames++;
      continue;
    }

    let bestLag = 0;
    let bestScore = -Infinity;
    const corr = new Float64Array(2 * maxLag + 1);
    for (let lag = -maxLag; lag <= maxLag; lag++) {
      const lo = Math.max(0, -lag);
      const hi = Math.min(nBins, nBins - lag);
      let dot = 0, na = 0, nb = 0;
      for (let k = lo; k < hi; k++) {
        const va = pa[k];
        const vb = pb[k + lag];
        dot += va * vb;
        na += va * va;
        nb += vb * vb;
      }
      const score = dot / (Math.sqrt(na * nb) + 1e-12);
      corr[lag + maxLag] = score;
      if (score > bestScore) {
        bestScore = score;
        bestLag = lag;
      }
    }
    scores.push(bestScore);
    if (bestScore < minScore) continue;

    const i = bestLag + maxLag;
    let sub = 0;
    if (i > 0 && i < corr.length - 1) {
      const y0 = corr[i - 1], y1 = corr[i], y2 = corr[i + 1];
      const denom = y0 - 2 * y1 + y2;
      if (denom !== 0) sub = Math.max(-1, Math.min(1, (0.5 * (y0 - y2)) / denom));
    }
    cents.push((bestLag + sub) * centsPerBin);
  }

  const confidentFraction = scores.length ? cents.length / scores.length : 0;
  const sorted = [...cents].sort((x, y) => x - y);
  const pct = (f) =>
    sorted.length === 0 ? 0 : sorted[Math.min(sorted.length - 1, Math.floor(f * (sorted.length - 1)))];
  const absSorted = cents.map(Math.abs).sort((x, y) => x - y);

  return {
    /** Per-frame estimates in presentation order — the drift trajectory. */
    centsPerFrame: cents,
    scores,
    silentFrames,
    confidentFraction,
    /** Typical detune across the clip. */
    medianCents: pct(0.5),
    /**
     * The DEPTH of the drift. The renderer ramps segment-wise to a peak, so a
     * clip's headline magnitude is its extreme, not its middle. p95 rather than
     * max, because a maximum over many frames is a maximum of noise and grows
     * with however many frames you happened to measure.
     */
    p95AbsCents: absSorted.length
      ? absSorted[Math.min(absSorted.length - 1, Math.floor(0.95 * (absSorted.length - 1)))]
      : 0,
    maxAbsCents: absSorted.length ? absSorted[absSorted.length - 1] : 0,
    /** Span from flattest to sharpest — how far the pitch actually travels. */
    rangeCents: cents.length ? Math.max(...cents) - Math.min(...cents) : 0,
  };
}

/** Pearson correlation and least-squares slope of y on x. */
export function fitLine(x, y) {
  const n = x.length;
  if (n < 3) return { n, r: NaN, slope: NaN };
  const mx = x.reduce((a, b) => a + b, 0) / n;
  const my = y.reduce((a, b) => a + b, 0) / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx;
    const dy = y[i] - my;
    sxy += dx * dy;
    sxx += dx * dx;
    syy += dy * dy;
  }
  if (!(sxx > 0) || !(syy > 0)) return { n, r: NaN, slope: NaN };
  return { n, r: sxy / Math.sqrt(sxx * syy), slope: sxy / sxx };
}

/**
 * Block geometry for reading temporalDrift's per-block LAG SERIES (not just its
 * IQR). Exported because a caller that wants the series must compute each
 * block's centre time from the same numbers the scan used — the loop starts at
 * `maxLagMs` into the envelope and advances one block at a time — and a second
 * copy of these values would misalign the trajectory silently.
 */
export const TRAJECTORY_OPTS = { blockMs: 200, maxLagMs: 250 };

/** Centre time, in seconds, of block `b` under TRAJECTORY_OPTS. */
export function blockCentreSec(b, opts = TRAJECTORY_OPTS) {
  return (opts.maxLagMs + b * opts.blockMs + opts.blockMs / 2) / 1000;
}
