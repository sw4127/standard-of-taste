/**
 * THE /method PAGE'S OWN FRAMING PROSE (E20/S1).
 *
 * WHY IT MOVED OUT OF JSX. Two reasons, and both are defects it was already
 * causing.
 *
 * THE COPY DECK HAND-TYPED IT. `export-method-deck.mjs` carried a second copy
 * of these five strings so the deck could show them, which means the deck could
 * drift from the page and nothing would say so -- and it HAD drifted: the deck
 * printed the closing line with the date resolved, so the census reported it as
 * a sentence in no source file at all. A writer rewriting it would have been
 * rewriting the exporter's copy, not the page's.
 *
 * IT WAS OUTSIDE THE VOICE GATE. `voice.test.ts` registers the method page's
 * claims, refusals, findings and section ledes. It never saw the headline, the
 * two opening paragraphs or the closing line, because prose written into a
 * component is prose outside the deck -- the same gap `landingLead` was moved
 * out of JSX to close in E11/S2, and the same one that let two paid-tier
 * promises ship in the reading room.
 *
 * MARKUP IS DATA HERE, NOT MARKUP. One paragraph italicises a word and the
 * closing line carries two links. Both are expressed as a plain sentence plus
 * the word or label to find inside it, so the STRING stays one string a writer
 * can rewrite and a gate can read. The page does the splitting.
 */

/** A paragraph, optionally italicising one word where it appears. */
export interface MethodParagraph {
  text: string;
  /** A word inside `text`, rendered emphasised. Must appear exactly once. */
  emphasis?: string;
}

/** A link the page draws inside a sentence, found by its own label. */
export interface ProseLink {
  /** The visible words. Must appear exactly once in the sentence. */
  label: string;
  href: string;
}

export const METHOD_KICKER = "THE HOUSE RULES · HOW THIS IS RUN";

export const METHOD_HEADLINE = "What this project refused, and what each refusal cost.";

export const METHOD_LEDE: MethodParagraph[] = [
  {
    text:
      "The instruments on this site are the visible part. The part worth reading about is the " +
      "operating model that produced them — a written constitution, two review protocols, and a " +
      "decision record that has repeatedly deleted finished work for being untrue rather than for " +
      "being broken.",
  },
  {
    text:
      "Any project can list what it built. This page lists what it refused, because a refusal is " +
      "the only decision with a verifiable cost attached, and because a page of things that went " +
      "well is a brochure. Each block below names the document it comes from. Those documents are " +
      "in the repository, and a test opens every one of them on every run to check the quoted " +
      "passage is still there — if a source is reworded, this page fails the build instead of " +
      "quietly becoming false.",
    emphasis: "refused",
  },
];

export const METHOD_CLOSING_LINKS: ProseLink[] = [
  { label: "reading room", href: "/learn" },
  { label: "the Lab", href: "/lab" },
];

/**
 * The closing line. `asOf` is a slot: the date is a standing fact with its own
 * constant, and a deck that printed it resolved invited a writer to freeze it.
 */
export function methodClosing(asOf: string): string {
  return (
    `Standing facts on this page last checked ${asOf}. The instruments themselves are in the ` +
    "reading room; the measurements behind them are in the Lab, including a page listing what the " +
    "instruments cannot do."
  );
}
