/**
 * SPOKEN-VOICE HAZARD — two gates and one honest blind spot (E7/S3).
 *
 * WHY. On 2026-07-12 the PM listened to pb4's 30-second cut, heard an announcer
 * reading credits, and vetoed it; the clip was re-windowed to 120s and shipped.
 * The artifact pivot (§1) then abolished the PM's ear as a gate. E7/S2 added
 * FOUR more items from that same Musopen Kickstarter collection, so the hazard
 * outlived its gatekeeper. A gate only a human can discharge is debt.
 *
 * WHAT WAS TRIED AND FAILED — recorded so nobody pays for it twice. Six features
 * were measured against real speech (a PD LibriVox excerpt normalised to pool
 * loudness), the eleven shipped clips, and graded mixtures of the two:
 *
 *   syllabic modulation share, broadband       speech 0.179 vs music 0.243  FAILS
 *   syllabic modulation share, 300-3400 Hz     speech 0.170 vs music 0.226  FAILS
 *   per-band syllabic share (Scheirer-Slaney)  speech 0.203 vs music 0.248  FAILS
 *   low-energy frame fraction, broadband       speech 0.431 vs music 0.360  1.20x
 *   low-energy frame fraction, voice band      speech 0.478 vs music 0.473  1.01x
 *   zero-crossing-rate variance                speech 1.141 vs music 0.638  1.79x
 *
 * Only the last separates. A within-track anomaly framing was then tried and
 * ALSO failed: on pb4's source, the window the PM vetoed ranks FOURTH by
 * anomaly, below three windows containing no speech at all.
 *
 * WHAT SHIPS. Two gates, each scoped to what the numbers actually support.
 */

/** Envelope/ZCR frame rate, Hz — 20 ms frames, 10 ms hop. */
export const FRAME_HZ = 100;

/**
 * GATE 1 — SPEECH RISK. Coefficient of variation of the zero-crossing rate.
 *
 * Speech alternates voiced segments (low ZCR) with fricatives and stops (high
 * ZCR) several times a second; sustained music does not. It is the one feature
 * of the six that separated, and the separation is real but NARROW, so the
 * threshold is placed for the case it can actually carry.
 */
export function speechRisk(samples, sampleRate) {
  const hop = Math.round(sampleRate / FRAME_HZ);
  const win = hop * 2;
  const n = Math.floor((samples.length - win) / hop);
  if (n < 8) return null;
  const z = new Float64Array(n);
  for (let f = 0; f < n; f++) {
    let c = 0;
    for (let i = f * hop + 1; i < f * hop + win; i++) if (samples[i - 1] < 0 !== samples[i] < 0) c++;
    z[f] = c / win;
  }
  const mean = z.reduce((a, b) => a + b, 0) / n;
  if (mean === 0) return null;
  return Math.sqrt(z.reduce((a, b) => a + (b - mean) ** 2, 0) / n) / mean;
}

/**
 * The threshold, READ OFF THE MEASUREMENT, not chosen.
 *
 *   loudest clean material measured  0.709  (pb11, Brahms Tragic Overture)
 *   quietest pure speech measured    1.141  (LibriVox at pool loudness)
 *
 * 0.90 sits 27% above the one and 21% below the other. It catches an excerpt
 * that is LARGELY SOMEONE TALKING — a credits track pulled in by mistake, a
 * spoken-word file mis-catalogued as music, an interview take.
 *
 * IT DOES NOT CATCH A SHORT ANNOUNCEMENT OVER BUSY MUSIC, and no threshold on
 * this feature can. Five seconds of credits mixed into pb8 moves it from 0.651
 * to 0.651 — pb8's own noisiness already dominates — while clean pb11 sits at
 * 0.709, ABOVE the mixed case. The classes overlap. That is why gate 2 exists.
 */
export const SPEECH_RISK_GATE = 0.9;

/**
 * GATE 2 — THE WINDOW MAY NOT START IN THE HEAD OF THE TRACK.
 *
 * The hazard is not "speech somewhere in the world", it is a specific, narrow,
 * DOCUMENTED thing: Musopen Kickstarter recordings carry spoken credits, and
 * they carry them at the beginning. So the gate is positional, deterministic,
 * and has no classifier in it to be wrong.
 *
 * IT CLASSIFIES OUR ONE LABELLED CASE CORRECTLY, which is more than the
 * detector managed: pb4's vetoed window starts at 30s and FAILS this; pb4's
 * shipped window starts at 120s and PASSES.
 *
 * Scoped to the collections where the hazard is documented. Modern CC releases
 * (Zabriskie, Komiku, Monplaisir, Audionautix) have no announcements and ship
 * windows at 0-9s; applying this to them would be superstition, not a gate.
 */
export const SPOKEN_INTRO_SOURCES = /MusopenCollectionAsFlac/;
export const MIN_START_SEC_WITH_SPOKEN_INTRO = 60;

export function windowStartVerdict(downloadUrl, startSec) {
  if (!SPOKEN_INTRO_SOURCES.test(String(downloadUrl))) return { gated: false, pass: true };
  return {
    gated: true,
    pass: startSec >= MIN_START_SEC_WITH_SPOKEN_INTRO,
    reason:
      startSec >= MIN_START_SEC_WITH_SPOKEN_INTRO
        ? null
        : `window starts at ${startSec}s; this collection carries spoken credits in its head, so windows must start at or after ${MIN_START_SEC_WITH_SPOKEN_INTRO}s (pb4's vetoed cut started at 30s)`,
  };
}
