/**
 * THE THREE FLAW FAMILIES, AS PROMPT AXES (E21/T-S3, Track T).
 *
 * WHY THIS MAPPING IS THE WHOLE IDEA. The three families this product measures
 * are, nearly exactly, three of the axes a text-to-music prompt carries. That
 * is not a stretch — it is a coincidence the project sat on for three months
 * while the instruments ended in a number nobody wanted (MRD §4.1).
 *
 *   pitch drift        (cents)      -> tuning character, pitch stability
 *   timing smear       (ms)         -> groove, timing feel, tightness
 *   compression damage (kbps)       -> mix aesthetic, fidelity, production polish
 *
 * NO GENERATOR IS NAMED (PM ruling RT-Z8 (2026-09-16) (a)). Every word here is
 * generic, so the card does not age when the tools change their interfaces, and
 * the product is not making a claim about somebody else's software. The MRD
 * cites one by name because an EVIDENCED claim has to say what it rests on;
 * that is a document, and this is a surface.
 *
 * PRECISE VERSUS NEUTRAL, WHICH IS THE PART THAT NEEDS THE MEASUREMENT. A
 * descriptor is only worth spending where the reader could hear whether it was
 * obeyed. So each axis carries two lists: `precise` for a reader whose ear
 * resolved that axis finely, and `neutral` — one tag, asking for the ordinary
 * thing — for one whose did not. Asking for micro-timing you cannot hear is not
 * a smaller version of the same request; it is a wasted tag.
 *
 * NOT YET THROUGH A WRITING PASS. These are new strings written by engineering.
 * They are registered in the voice gate, so they cannot carry a NAMED hazard,
 * and that is not the same as being good. `docs/copy-review-ledger.md` is where
 * this surface gets commissioned.
 */

export interface PromptAxis {
  /** The prompt axes this flaw family speaks to, as a reader would name them. */
  axis: string;
  /** Tags worth spending when the reader can hear whether they were obeyed. */
  precise: readonly string[];
  /** One tag, asking for the ordinary thing, when they cannot. */
  neutral: string;
}

export const PROMPT_AXES: Record<string, PromptAxis> = {
  "pitch-drift": {
    axis: "tuning character and pitch stability",
    precise: ["clean intonation", "stable pitch across the take"],
    neutral: "natural tuning",
  },
  "timing-smear": {
    axis: "groove, timing feel and tightness",
    precise: ["tight timing", "the groove locked to the grid"],
    neutral: "natural timing",
  },
  "lossy-artifact": {
    axis: "mix aesthetic, fidelity and production polish",
    precise: ["open high end", "detail intact in the reverb tails"],
    neutral: "clean master",
  },
};
