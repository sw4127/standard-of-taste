/**
 * ADJACENCY THAT LIVES IN A COMPONENT, NOT IN AN ASSEMBLER (E19/S4).
 *
 * Seven deck sections declare their order in an emission spec and the deck
 * composes the sentence from it. Two cannot: the borrowed-apparatus block and
 * the expert panel are laid out by JSX, so there is no array to print. Their
 * adjacency paragraphs stay hand-written — and hand-written was the defect.
 *
 * SO THE ORDER THE PROSE DESCRIBES IS PINNED HERE INSTEAD. Each entry names a
 * file, optionally a function inside it, and the symbols that must appear in
 * that order. Reorder the JSX and the build fails, which forces somebody to
 * look at the paragraph. That is weaker than composing the sentence from the
 * code and it is stated as weaker: the prose could still describe the pinned
 * order wrongly, and only reading catches that.
 *
 * READING IS WHAT CAUGHT IT. Three claims in the shipped deck were false, and
 * no guard could have found any of them:
 *   - the apparatus block was said to render on `/method`. It renders on
 *     `/learn/methodology`; `/method` is a different page about the project.
 *   - the expert panel was said to emit "a section per instrument". It renders
 *     exactly ONE instrument's body, chosen by `instrument.kind`.
 *   - the Brier sentence was said to sit "directly beneath" the calibration
 *     chart. A table of claimed-versus-delivered rows sits between them.
 */

export interface LayoutOrder {
  /** Repository-relative file whose source carries the order. */
  readonly file: string;
  /** Restrict the search to this function's body, when the file defines many. */
  readonly within?: string;
  /** Substrings that must occur in this order. */
  readonly symbols: readonly string[];
  /** What the ordering claim is, in the words the deck uses. */
  readonly claim: string;
}

export const LAYOUT_ORDERS: Record<string, readonly LayoutOrder[]> = {
  apparatus: [
    {
      file: "src/app/learn/methodology/page.tsx",
      symbols: ["apparatusLines(", "citationStrengthLine(", "degreesConvergenceLine("],
      claim: "one entry per borrowed standard, then citation strength, then the degrees convergence",
    },
  ],
  expert: [
    {
      file: "src/components/ExpertPanel.tsx",
      symbols: ["{PANEL.blurb}", "{body}"],
      claim: "the blurb sits in the summary, above the one instrument body the panel renders",
    },
    {
      file: "src/components/ExpertPanel.tsx",
      within: "function CalibrationCurveChart",
      symbols: ["<svg", "<Table", "brierNote("],
      claim: "the chart, then the claimed-versus-delivered table, then the Brier sentence",
    },
  ],
};
