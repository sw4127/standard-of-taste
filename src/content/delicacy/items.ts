/**
 * Delicacy Trials item pool — 18 trials (PM rulings RT-24a / RT-25a, 2026-08-07).
 *
 * WHY 24. Three independent measurements said six was too short for any of the
 * psychometrics to work: Cronbach's alpha 0.25 against a 0.70 floor; the §1
 * discrimination floor unreachable (0 of 6 items could clear it, because a 2AFC
 * guessing floor attenuates every item-total correlation); and 2PL parameters
 * not identified, with 3 of 6 items pinning at the a = 4 bound. Spearman-Brown
 * puts alpha = 0.70 near 42 trials — 24 does NOT reach the conventional
 * reliability floor and no surface may claim it does. It is the point where the
 * instrument becomes analysable without a session nobody finishes.
 *
 * THE DESIGN is a crossed factorial: 3 degradation families x 3 shipping ladder
 * rungs, each cell twice, each replicate on a DIFFERENT source recording so a
 * family-by-rung effect can never be confounded with one piece of music.
 *
 * LADDER RUNG 1 DOES NOT SHIP. S6 verified the ladder was monotone, but monotone
 * is not sufficient: every rung-1 item measured under the 3x fair-trial floor.
 * An item barely distinguishable from a manipulation nobody can hear is not a
 * trial, whatever its rung number says.
 *
 * PITCH-DRIFT'S LADDER WAS WIDENED to 25/50/100 cents (PM ruling RT-27a) after
 * Layer A measured its old shipping rungs as marginal wherever they were
 * placed. 100 cents is a semitone accumulated ACROSS a 20s clip — a drift, not
 * a wrong note. Windows were chosen MECHANICALLY
 * (fixed offsets, skipping anything overlapping the same source's bias
 * excerpt) — the PM is out of the clip-judging loop by design, and a curated
 * window list would smuggle taste back in.
 *
 * Generated from src/content/delicacy/manifest.json by
 * `node scripts/clip-pipeline/index.mjs expand --render`; params, seeds,
 * sha256s and Layer A measurements live there.
 *
 * THE PM EAR PASS IS RETIRED (artifact pivot §1). Audibility is not gated by a
 * human listener; the door turns on measured manipulation magnitude against a
 * known-transparent anchor, and item DIFFICULTY stays explicitly uncalibrated
 * until Layer B has real responses.
 *
 * VERSIONING: v>=1 pools are IMMUTABLE per version — any item change bumps the
 * version, and share payloads are positional against it (contract in
 * src/engine/delicacy.ts). v0 is the explicit dev exception: mutable, and its
 * share surface never exists in production, so no live URL can silently rescore.
 */

import type { DegradationFamily, DelicacyItemSpec } from "@/engine/delicacy";

export const DELICACY_INSTRUMENT_ID = "delicacy-v1";

/**
 * 1 = LIVE. Every gate is now measured, and none of them is a person.
 *
 *  - render validation: 18/18 pass (duration, loudness, true peak, determinism,
 *    pre-normalisation clipping);
 *  - Layer A magnitude: 18/18 pass, at 3.1x-94x each pair's own transparency
 *    anchor;
 *  - voice: every cohort-visible string passes src/content/voice.ts, which
 *    implements docs/voice-spec.md's litmus tests and banned-moves list. That
 *    check replaced the PM voice pass on 2026-08-08, for the same reason Layer A
 *    replaced the PM ear pass — a gate only one person can discharge, and
 *    cannot reliably perform, is debt rather than quality control.
 *
 * What is still NOT established, and is stated everywhere it matters: item
 * DIFFICULTY. Layer B needs real responses and there are none. Nothing here
 * claims a calibrated difficulty, a norm, or a percentile.
 */
export const DELICACY_POOL_VERSION = 2;

/**
 * v2 (2026-08-13) — d2 re-sourced. ONE item changed; everything else is
 * byte-identical to v1.
 *
 * WHY. The PM heard almost nothing on d2 during user testing, and Layer A later
 * measured why: 35.2% of the clip was near-silent, against a 20% ceiling. (The
 * original dead-air check missed it because it measured the LONGEST CONTIGUOUS
 * run of silence; a clip that is quiet in many short gaps passes that test and
 * still gives a listener almost nothing to compare. `quietFraction` was added
 * after the PM's report and, on the next validate, flagged the exact clip they
 * had flagged by ear — which is the pivot working as designed.)
 *
 * The source itself was the problem, not the window: Beethoven's "La
 * Malinconia" adagio is structurally full of rests, so another window on the
 * same recording is a coin flip on the same failure (PM ruling RT-51a).
 *
 * THE REPLACEMENT WAS CHOSEN BY RULE, NOT BY EAR — no one listened to anything:
 *   1. exclude the flagged artist, and exclude d11's artist (this cell's two
 *      replicates must sit on different artists);
 *   2. minimise the candidate artist's existing timing-smear load, because the
 *      crossed factorial exists so a family-by-rung effect is not confounded
 *      with one piece of music;
 *   3. tie-break on lowest overall pool load, then bias-manifest order;
 *   4. take the first window offset in [20,45,70,95,120] that clears the
 *      source's own bias excerpt by 20s, is unused, and fits the recording.
 * Jason Shaw won on load and was eliminated by ARITHMETIC — pb8 runs 110.1s and
 * every legal offset overflows it. Chopin/pb3 @ 70s is what the rule returned.
 *
 * The seed stays 8028: it belongs to the pair SLOT, so the degradation strength
 * (timing-smear rung 2, param 0.015) and `originalSide: "b"` are unchanged, and
 * the pool's side balance does not move. Only sourceId and startSec differ.
 *
 * v1 share links die on the version gate — free, because n = 0 and nothing has
 * ever been deployed.
 */

/**
 * THE DOOR (D3): every surface that gates on the delicacy tier reads this one
 * flag — homepage machine card, bias-debrief door, /delicacy robots, sitemap,
 * prod share surface. It flips exactly when the gates above clear.
 */
export const DELICACY_LIVE = DELICACY_POOL_VERSION > 0;

/** One playable trial pair. Extends the engine spec with presentation. */
export interface DelicacyTrialClip extends DelicacyItemSpec {
  /** Static files under /public — PD/CC audio only (memo §8.2). */
  srcA: string;
  srcB: string;
  /** Truthful credit for the source work (revealed post-answer, N3). */
  sourceCredit: string;
  license: string;
  /** TASL + excerpt/manipulation notice (CC requirement; PD listed anyway). */
  attribution: string;
}

/**
 * User-facing names for the degradation families — the flaw-pick options.
 * ALL THREE are offered on every trial (FLAW_CHANCE in the engine depends on
 * it; trimming options would leak the answer).
 */
export const FLAW_LABELS: Record<DegradationFamily, { label: string; hint: string }> = {
  "pitch-drift": { label: "The pitch drifts", hint: "it slides out of tune as it goes" },
  "timing-smear": { label: "The timing warbles", hint: "it rushes and drags in slow waves" },
  "lossy-artifact": { label: "The detail is crushed", hint: "compression smear — swishy, airless highs" },
};

const pair = (
  id: string,
  family: DegradationFamily,
  magnitude: 1 | 2 | 3 | 4,
  originalSide: "a" | "b",
  sourceCredit: string,
  license: string,
  attribution: string,
): DelicacyTrialClip => ({
  id,
  family,
  magnitude,
  originalSide,
  srcA: `/audio/delicacy/${id}-a.mp3`,
  srcB: `/audio/delicacy/${id}-b.mp3`,
  sourceCredit,
  license,
  attribution,
});

/**
 * Presentation order (positional — see versioning above). Contracts enforced
 * by gates.ts: 18 trials, each family 6x, each shipping rung 6x, every
 * family-rung cell exactly 2x on different lead artists, no two adjacent
 * trials sharing a family, sides roughly balanced.
 */
export const DELICACY_TRIALS: DelicacyTrialClip[] = [
  pair(
    "d1",
    "pitch-drift",
    2,
    "a",
    "J.S. Bach — Kimiko Ishizaka",
    "CC0",
    "“Goldberg Variations — Variatio 13 a 2 Clav.” — J.S. Bach — Kimiko Ishizaka · https://archive.org/details/The_Open_Goldberg_Variations-11823 · CC0 · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d2",
    "timing-smear",
    2,
    "b",
    "F. Chopin — Musopen Complete Chopin project (performer per item page — record exact name from snapshot for TASL)",
    "PD or CC0 (verify on piece page; CC-BY-SA -> engineer flag)",
    "“Nocturne Op. 15 No. 3 in G minor” — F. Chopin — Musopen Complete Chopin project (performer per item page — record exact name from snapshot for TASL) · https://archive.org/details/musopen-chopin-complete-works-flac · PD or CC0 (verify on piece page; CC-BY-SA -> engineer flag) · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d3",
    "lossy-artifact",
    2,
    "b",
    "Jason Shaw",
    "CC-BY 4.0",
    "“Folk Bed” — Jason Shaw · https://audionautix.com/free-music/acoustic · CC-BY 4.0 · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d4",
    "pitch-drift",
    3,
    "b",
    "F. Chopin — Musopen Complete Chopin project (performer per item page — record exact name from snapshot for TASL)",
    "PD or CC0 (verify on piece page; CC-BY-SA -> engineer flag)",
    "“Nocturne Op. 15 No. 3 in G minor” — F. Chopin — Musopen Complete Chopin project (performer per item page — record exact name from snapshot for TASL) · https://archive.org/details/musopen-chopin-complete-works-flac · PD or CC0 (verify on piece page; CC-BY-SA -> engineer flag) · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d5",
    "timing-smear",
    3,
    "a",
    "Komiku",
    "CC0",
    "“The road we use to travel when we were kids (Tale on the Late)” — Komiku · https://archive.org/details/Komiku-TaleOnTheLate · CC0 · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d6",
    "lossy-artifact",
    3,
    "a",
    "J.S. Bach — Kimiko Ishizaka",
    "CC0",
    "“WTC Book 1 — Prelude No. 4 in C-sharp minor, BWV 849 (backup)” — J.S. Bach — Kimiko Ishizaka · https://archive.org/details/bach-well-tempered-clavier-book-1 · CC0 · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d7",
    "pitch-drift",
    4,
    "b",
    "Chris Zabriskie",
    "CC-BY 4.0",
    "“That Hopeful Future Is All I've Ever Known (Music from Neptune Flux)” — Chris Zabriskie · https://archive.org/details/Music_from_Neptune_Flux-21899 · CC-BY 4.0 · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d8",
    "timing-smear",
    4,
    "a",
    "J.S. Bach — Kimiko Ishizaka",
    "CC0 (VERIFIED 2026-07-11 on archive.org item)",
    "“WTC Book 1 — Prelude No. 12 in F minor, BWV 857” — J.S. Bach — Kimiko Ishizaka · https://archive.org/details/bach-well-tempered-clavier-book-1 · CC0 (VERIFIED 2026-07-11 on archive.org item) · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d9",
    "lossy-artifact",
    4,
    "b",
    "F. Chopin — Musopen Complete Chopin project (performer per item page — record exact name for TASL)",
    "CC0 (machine-readable licenseurl on item, verified 2026-07-12)",
    "“Mazurka in A minor, Op. 68 No. 2 (backup)” — F. Chopin — Musopen Complete Chopin project (performer per item page — record exact name for TASL) · https://archive.org/details/musopen-chopin-complete-works-flac · CC0 (machine-readable licenseurl on item, verified 2026-07-12) · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d10",
    "pitch-drift",
    2,
    "a",
    "Komiku",
    "CC0",
    "“The Wind (Tale on the Late)” — Komiku · https://archive.org/details/Komiku-TaleOnTheLate · CC0 · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d11",
    "timing-smear",
    2,
    "a",
    "Chris Zabriskie",
    "CC-BY 4.0",
    "“That Hopeful Future Is All I've Ever Known (Music from Neptune Flux)” — Chris Zabriskie · https://archive.org/details/Music_from_Neptune_Flux-21899 · CC-BY 4.0 · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d12",
    "lossy-artifact",
    2,
    "b",
    "J.S. Bach — Kimiko Ishizaka",
    "CC0 (VERIFIED 2026-07-11 on archive.org item)",
    "“WTC Book 1 — Prelude No. 12 in F minor, BWV 857” — J.S. Bach — Kimiko Ishizaka · https://archive.org/details/bach-well-tempered-clavier-book-1 · CC0 (VERIFIED 2026-07-11 on archive.org item) · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d13",
    "pitch-drift",
    4,
    "a",
    "F. Chopin — Musopen Complete Chopin project (performer per item page — record exact name from snapshot for TASL)",
    "PD or CC0 (verify on piece page; CC-BY-SA -> engineer flag)",
    "“Nocturne Op. 15 No. 3 in G minor” — F. Chopin — Musopen Complete Chopin project (performer per item page — record exact name from snapshot for TASL) · https://archive.org/details/musopen-chopin-complete-works-flac · PD or CC0 (verify on piece page; CC-BY-SA -> engineer flag) · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d14",
    "timing-smear",
    3,
    "a",
    "L. van Beethoven — Musopen Kickstarter ensemble (per item page)",
    "Public Domain (Musopen Kickstarter PD release; PD-mark licenseurl on item)",
    "“String Quartet Op. 18 No. 6 — IV. La Malinconia (Adagio)” — L. van Beethoven — Musopen Kickstarter ensemble (per item page) · https://archive.org/details/MusopenCollectionAsFlac · Public Domain (Musopen Kickstarter PD release; PD-mark licenseurl on item) · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d15",
    "lossy-artifact",
    3,
    "b",
    "F. Chopin — Musopen Complete Chopin project (performer per item page — record exact name for TASL)",
    "CC0 (machine-readable licenseurl on item, verified 2026-07-12)",
    "“Mazurka in A minor, Op. 59 No. 1” — F. Chopin — Musopen Complete Chopin project (performer per item page — record exact name for TASL) · https://archive.org/details/musopen-chopin-complete-works-flac · CC0 (machine-readable licenseurl on item, verified 2026-07-12) · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d16",
    "pitch-drift",
    3,
    "b",
    "J.S. Bach — Kimiko Ishizaka",
    "CC0",
    "“Goldberg Variations — Variatio 13 a 2 Clav.” — J.S. Bach — Kimiko Ishizaka · https://archive.org/details/The_Open_Goldberg_Variations-11823 · CC0 · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d17",
    "timing-smear",
    4,
    "a",
    "Komiku",
    "CC0",
    "“The road we use to travel when we were kids (Tale on the Late)” — Komiku · https://archive.org/details/Komiku-TaleOnTheLate · CC0 · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
  pair(
    "d18",
    "lossy-artifact",
    4,
    "a",
    "Jason Shaw",
    "CC-BY 4.0",
    "“Folk Bed” — Jason Shaw · https://audionautix.com/free-music/acoustic · CC-BY 4.0 · excerpt (trimmed + loudness-normalized; one side deliberately degraded)",
  ),
];

/**
 * PRACTICE / MEASURED SPLIT (PM ruling RT-35a, after user testing, 2026-08-08).
 *
 * A listener reported hearing nothing across four runs and, crucially, having no
 * way to tell whether that meant "I am bad at this" or "this is broken". An
 * assessment with no feedback cannot distinguish those for the person taking it,
 * and the PM's steer is that the product has to visibly help someone get better
 * at hearing this — not merely score them.
 *
 * So the session opens with three PRACTICE trials, answered with immediate
 * feedback, before any measured trial. They are the strongest rung, one per
 * degradation family, so a newcomer hears each flaw's signature on its most
 * obvious example before being asked to find a subtle one.
 *
 * TWO RULES THAT MAKE THIS HONEST:
 *  1. Practice items are EXCLUDED from the measured set. Answering an item with
 *     the answer revealed and then scoring it would be contamination, and the
 *     score would be worthless in exactly the direction that flatters us.
 *  2. Feedback exists ONLY in practice. Learning across the measured block
 *     would make later items easier than earlier ones and break the assumption
 *     every item statistic rests on.
 *
 * Selection is by RUNG, not by anyone's opinion of which clips are clearest —
 * the pipeline picks, as everywhere else.
 */
const STRONGEST_RUNG = 4;

export const PRACTICE_TRIALS: DelicacyTrialClip[] = (() => {
  const seen = new Set<DegradationFamily>();
  return DELICACY_TRIALS.filter((t) => {
    if (t.magnitude !== STRONGEST_RUNG || seen.has(t.family)) return false;
    seen.add(t.family);
    return true;
  });
})();

/** The scored session. Never includes a practice item. */
export const MEASURED_TRIALS: DelicacyTrialClip[] = DELICACY_TRIALS.filter(
  (t) => !PRACTICE_TRIALS.some((p) => p.id === t.id),
);
