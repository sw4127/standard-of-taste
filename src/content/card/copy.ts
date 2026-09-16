/**
 * THE PROMPT CARD'S SENTENCES — ASSEMBLED, NEVER GENERATED (E21/T-S3, Track T).
 *
 * THE REGISTER, AND IT IS THE ONLY EDITORIAL RULE HERE: **OFFER, DO NOT
 * ASSERT** (MRD §6.3, PM ruling RT-Z5 (2026-09-16) (b)).
 *
 *   ✗ "You have unresolved loss."
 *   ✓ "You chose the take with the slower decay every time."
 *
 * The second still speaks to the person — which D1 forbade everywhere until
 * 2026-09-16 and now permits on this one surface — and it claims nothing the
 * session cannot support. Every sentence below names something the reader DID,
 * in the unit it was measured in, and offers what it might be worth. None of
 * them tells anybody who they are.
 *
 * WHAT THE GUARDS HOLD, so that this docblock is not the only thing keeping it
 * true (`copy.test.ts`):
 *
 *   - NO CAUSAL PROMISE. The card never claims it improves anybody's output.
 *     That is unmeasured, a guard already refuses five phrasings of it on
 *     `/learn/flaws`, and this is the sixth surface it covers (MRD §7).
 *   - NO ASSERTION ABOUT TRAUMA, ABUSE OR MENTAL HEALTH (PM ruling RT-Z10 (a)).
 *     Not on D1 grounds, which are suspended here, but because that is the one
 *     class where being wrong lands on a person rather than on a number.
 *   - NO COMPARISON BETWEEN PEOPLE. N3 is untouched by RT-Z5: no percentile, no
 *     cohort, no "most listeners". There are zero real respondents and the card
 *     describes one ear.
 *   - NO SENTENCE THAT COUNTS THE FAMILIES. A card renders after a sitting that
 *     measured one and after three, so "the other two" is false half the time —
 *     the defect `FLAWS_INVITE` already carries a guard for.
 *
 * NOT YET THROUGH A WRITING PASS. New strings by engineering, gate-clean rather
 * than good. Commission them before this ships anywhere that matters.
 */
import type { CardAxis, PromptCard } from "@/engine/prompt-card";
import { PROMPT_AXES } from "./axes";
import { familyLabel, quantity } from "@/content/staircase/copy";

/** The card's three headings. Slots, so a writer can move them as a set. */
export const CARD_SEPARATES = "What your ear separates";
export const CARD_WORTH = "What that is worth in a prompt";
export const CARD_PASTE = "Paste this";

/**
 * One line per axis for the first section: what was measured, in its own unit.
 *
 * THE NUMBER IS THE SUBJECT, not decoration around a compliment. A reader who
 * disagrees with the sentence can check it against the threshold printed below
 * the card, which is the entire reason the card sits ABOVE the readout rather
 * than instead of it (RT-Z7 b).
 */
export function separatesLine(axis: CardAxis): string {
  const name = familyLabel(axis.family).toLowerCase();
  switch (axis.state) {
    case "fine":
      return `${cap(name)} is something you hear finely. You were still calling it at ${quantity(axis.threshold!, axis.unit)}.`;
    case "coarse":
      return `${cap(name)} had to move as far as ${quantity(axis.threshold!, axis.unit)} before you called it.`;
    case "measured":
      return `${cap(name)}: you were calling it at ${quantity(axis.threshold!, axis.unit)}. This ladder is too short to say how fine that is.`;
    case "finer-than-measured":
      return `${cap(name)}: you caught the gentlest version this instrument can make. Your ear is somewhere past where it can follow.`;
    case "coarser-than-measured":
      return `${cap(name)}: even the harshest version went past you. That is a fact about this sitting, not a limit.`;
    default:
      return `${cap(name)}: this sitting could not tell. Not enough of it resolved to say anything.`;
  }
}

/**
 * One line per axis for the second section: what the reading is worth.
 *
 * `spend === null` IS NOT `false`. A ladder that resolved no fineness, and a
 * sitting that resolved nothing, both land there, and neither licenses "do not
 * bother" — which is advice, given confidently, about something nobody
 * measured.
 */
export function worthLine(axis: CardAxis): string | null {
  const a = PROMPT_AXES[axis.family];
  if (!a) return null;
  /*
   * `not-enough` IS SPLIT OUT FROM THE REST OF `spend === null`, AND READING
   * THE RENDERED CARD IS WHAT FOUND IT. Both branches used to end "ask for
   * <neutral tag>" — so an axis that resolved NOTHING was told to spend a tag,
   * while `tagsFor` correctly left that same tag out of the paste line. The
   * card advised something it then declined to give, which is worse than either
   * choice on its own: it reads as a bug to anyone following it.
   */
  if (axis.state === "not-enough") {
    return `Nothing to spend on ${a.axis} from this sitting. It did not resolve enough to say.`;
  }
  if (axis.spend === true) {
    return `Spend words on ${a.axis}. You will hear whether they were obeyed.`;
  }
  if (axis.spend === false) {
    /*
     * "Spend THEM elsewhere" had no antecedent when this was the card's first
     * line, which it is after any single-family sitting. Found by reading the
     * rendered card, not the template.
     */
    return `Spend your words elsewhere. Ask for ${a.neutral} and leave it there — a finer request is one you could not check.`;
  }
  return `Ask for ${a.neutral}. Nothing here says a finer request would be worth the words.`;
}

/** The tags for one axis, or none where the card has nothing to offer. */
export function tagsFor(axis: CardAxis): string[] {
  const a = PROMPT_AXES[axis.family];
  if (!a) return [];
  if (axis.state === "not-enough") return [];
  return axis.spend === true ? [...a.precise] : [a.neutral];
}

/** The paste line: the tags, comma-separated, in the card's own order. */
export function pasteLine(card: PromptCard): string {
  return card.axes.flatMap(tagsFor).join(", ");
}

/**
 * THE WHOLE CARD, as lines a surface can render without knowing any of this.
 *
 * Returns an empty array when nothing was measured at all, rather than a
 * cheerful shell. A card with no reading in it is not a card.
 */
export interface CardSection {
  heading: string;
  lines: string[];
}

export function cardSections(card: PromptCard): CardSection[] {
  if (card.axes.length === 0) return [];
  const worth = card.axes.map(worthLine).filter((l): l is string => l !== null);
  const paste = pasteLine(card);
  const out: CardSection[] = [
    { heading: CARD_SEPARATES, lines: card.axes.map(separatesLine) },
  ];
  if (worth.length > 0) out.push({ heading: CARD_WORTH, lines: worth });
  if (paste.length > 0) out.push({ heading: CARD_PASTE, lines: [paste] });
  return out;
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
