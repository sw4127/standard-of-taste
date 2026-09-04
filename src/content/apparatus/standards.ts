/**
 * THE APPARATUS THIS PRODUCT BORROWS (E16b/P1, Track P).
 *
 * WHY THIS EXISTS. Every psychometric figure this product publishes is
 * simulated and its cohort is zero, so it cannot appeal to data about people.
 * What it CAN show is that its rulers were not invented here — that the
 * loudness normalisation, the transparency anchor and the listening-test design
 * sit in a tradition with published standards, and that where this product
 * departs from them it says so. That argument is available at n = 0, and it is
 * the only kind that is.
 *
 * THE RULE THAT MAKES THIS SAFE, AND IT IS NARROWER THAN IT LOOKS. An entry
 * here may describe the MEASURING APPARATUS. It may never describe how well
 * people score. "Trained listeners detect about five cents" is a published
 * figure and a population statistic about human performance; printing it beside
 * a reader's threshold manufactures the norm this product refuses to have at
 * n = 0 (N3). A standard's scale, its scope, its method — those are facts about
 * the ruler and carry no claim about the ruled.
 *
 * IT DISTINGUISHES TWO KINDS OF CITATION, BECAUSE THEY ARE NOT EQUALLY STRONG.
 *
 *   in-repo   — the standard is a decision living in this repository. A test
 *               OPENS the implementing file and finds the passage, exactly as
 *               `claims.ts` does, and where the standard fixes a number that
 *               number is IMPORTED from the module that owns it rather than
 *               restated. This is the strong kind.
 *   external  — a published document. No test can open it, so the entry records
 *               the date a person did, and anything that could not be opened
 *               does not ship. This is the weak kind, and the page says so.
 *
 * `src/content/comparison/scales.ts` could only ever offer the weak kind. This
 * module offers both, and marks which is which.
 */

import manifest from "@/content/bias/manifest.json";

/** The loudness target every clip is normalised to, from the file that sets it. */
export const LOUDNESS_TARGET_LUFS: number = manifest.lufsTarget;

export type StandardBinding =
  | {
      kind: "in-repo";
      /** Repo-relative path, POSIX separators. Opened by test. */
      path: string;
      /** A passage that must appear in `path`, compared whitespace-collapsed. */
      anchor: string;
    }
  | {
      kind: "external";
      publisher: string;
      title: string;
      url: string;
      /** ISO date on which a person opened and read the document. */
      retrieved: string;
    };

export interface BorrowedStandard {
  id: string;
  /** The standard's name as its publisher writes it. */
  name: string;
  /** What it governs, in one line a non-specialist can follow. */
  what: string;
  /** What THIS product actually does with it. */
  howWeUseIt: string;
  /**
   * HOW MANY PLACES ITS SCALE OFFERS, in the standard's own terms.
   *
   * A phrase rather than a number, because MUSHRA's is CONTINUOUS and writing
   * "101" for it would convert a line into a hundred and one boxes — the same
   * false precision this product is arguing about. Present only where the
   * standard fixes a scale at all.
   */
  scaleLabel?: string;
  /**
   * Where we depart from it, or what it does NOT cover here. Optional, and the
   * absence of a departure is a claim in itself, so it is written only when
   * there is a real one.
   */
  departure?: string;
  binding: StandardBinding;
}

export const BORROWED_STANDARDS: BorrowedStandard[] = [
  {
    id: "ebu-r128",
    name: "EBU R 128",
    what: "The broadcast method for measuring perceived loudness, rather than peak level.",
    howWeUseIt:
      "Every clip is loudness-normalised with a two-pass R 128 measurement to one fixed target before it is ever played, so no clip can seem better simply for arriving louder than the one before it.",
    departure:
      "The target here is chosen for headphone listening rather than for broadcast delivery, and this file states the figure it actually uses rather than any figure the standard recommends.",
    binding: {
      kind: "in-repo",
      path: "scripts/clip-pipeline/index.mjs",
      anchor: "R128 loudnorm to target LUFS",
    },
  },
  {
    id: "transparency-anchor",
    name: "The transparent-encode anchor",
    what:
      "A reference point for how much measurable difference an encode can cost while remaining, by consensus, inaudible.",
    howWeUseIt:
      "Clip fitness is judged against a 320 kbps MP3 round-trip of the same recording rather than against a fixed number, because the same encode costs more spectral distance on dense material than on sparse material.",
    departure:
      "The anchor is a convention rather than a published standard, and it is a measurement of audio files: nobody has listened to confirm the clips it passes are transparent to any actual ear.",
    binding: {
      kind: "in-repo",
      path: "scripts/clip-pipeline/validate.mjs",
      anchor: "320 kbps MP3 round-trip",
    },
  },
  {
    id: "itu-bs1534",
    name: "ITU-R BS.1534-3 (MUSHRA)",
    what:
      "The international recommendation for subjective listening tests, using a hidden reference and anchors, with each sample rated on a continuous scale from 0 to 100. The same document places BS.1116 over small impairments and itself over intermediate quality.",
    howWeUseIt:
      "It is the tradition our trials sit in rather than a specification we claim to meet: a forced choice between two samples with a required listen, scored against chance.",
    scaleLabel: "a continuous scale from 0 to 100",
    departure:
      "Our pairs carry near-transparent damage, which by that document's own division is BS.1116's regime rather than MUSHRA's — so the familiar 0-to-100 scale is the wrong one to picture here, and we do not use it.",
    binding: {
      kind: "external",
      publisher: "International Telecommunication Union",
      title: "Recommendation ITU-R BS.1534-3",
      url: "https://www.itu.int/dms_pubrec/itu-r/rec/bs/R-REC-BS.1534-3-201510-I!!PDF-E.pdf",
      retrieved: "2026-09-04",
    },
  },
];

/** Entries whose citation a test can actually open. */
export function inRepoStandards(): BorrowedStandard[] {
  return BORROWED_STANDARDS.filter((s) => s.binding.kind === "in-repo");
}

/** Entries resting on a document only a person can open. */
export function externalStandards(): BorrowedStandard[] {
  return BORROWED_STANDARDS.filter((s) => s.binding.kind === "external");
}
