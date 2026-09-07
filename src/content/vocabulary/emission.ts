/**
 * WHAT RENDERS BESIDE WHAT, DECLARED ONCE (E19/S1).
 *
 * THE DEFECT THIS CLOSES. Each section of the copy deck states, in prose, the
 * order in which its sentences reach the screen — "then the two figures, then
 * the boundary, every time". Those sentences were hand-written in
 * `scripts/export-copy-deck.mjs`, three directories away from the assembler
 * they describe, and nothing connected the two. Reorder `spreadLines` and the
 * deck goes on describing the old order; no test fails; and the deck is about
 * to be handed to a writer with the repository CLOSED (PM ruling RT-S3 a), so
 * that prose is the only thing they can rely on. A brief that asserts something
 * unchecked about the product is the same class of claim N3 forbids the product
 * from making about a listener.
 *
 * THE FIX IS NOT A SECOND OPINION, IT IS ONE SOURCE. The obvious guard is a
 * parallel spec asserted to reproduce the assembler over the fixtures, and its
 * case is real: two implementations agreeing is stronger evidence than one
 * acting as its own witness, and it risks nothing already shipped. It was
 * rejected because the duplicate has to restate every branch condition, so it
 * becomes a second thing that can go stale, and it fails identically when
 * somebody edits both. Instead the assembler RUNS OFF the declaration, so the
 * order a reader gets and the order the deck prints are the same array.
 *
 * WHAT IS STILL PROSE, SAID PLAINLY. `says` and `when` are hand-written. They
 * can go stale against the code the way the old paragraph did — the difference
 * is that they now sit in the same object literal as the `produce` that
 * implements them, and `always` is machine-checked against the whole fixture
 * corpus, so the one claim that used to be pure assertion is no longer one.
 */

/**
 * A CONDITIONAL PART CANNOT BE DECLARED WITHOUT STATING ITS CONDITION.
 *
 * The union is doing real work: `always: false` demands `when`, so nobody can
 * add a part that sometimes fires and leave the deck saying nothing about when.
 */
export type EmissionPart<T> =
  | {
      readonly id: string;
      readonly says: string;
      readonly always: true;
      readonly produce: (input: T) => string[];
    }
  | {
      readonly id: string;
      readonly says: string;
      readonly always: false;
      readonly when: string;
      readonly produce: (input: T) => string[];
    };

export interface EmissionSpec<T> {
  /** The assembler this spec IS, named so the deck can name it. */
  readonly fn: string;
  /**
   * The module it lives in. Optional in the type, supplied by every real spec,
   * and it earns its place: THREE surfaces call their assembler `creatorLines`,
   * so a deck saying "`creatorLines` emits" three times tells a writer who
   * cannot open the repository nothing about which one they are reading.
   */
  readonly in?: string;
  readonly parts: ReadonlyArray<EmissionPart<T>>;
}

/**
 * The half the deck needs: order and description, no producers.
 *
 * Separate because the deck exporter collects every surface's spec into one
 * registry, and the inputs those specs take have nothing in common with each
 * other. Describing is type-free; producing is not.
 */
export interface DescribedPart {
  readonly id: string;
  readonly says: string;
  readonly always: boolean;
  readonly when?: string;
}

export interface DescribedSpec {
  readonly fn: string;
  readonly in?: string;
  readonly parts: ReadonlyArray<DescribedPart>;
}

/** The assembler. Order lives in the spec and nowhere else. */
export function emit<T>(spec: EmissionSpec<T>, input: T): string[] {
  const lines: string[] = [];
  for (const part of spec.parts) lines.push(...part.produce(input));
  return lines;
}

const TICK = "`";

/**
 * The deck's adjacency sentence, composed from the same array the product
 * runs. Reordering the parts reorders this, which is the whole point: the
 * document cannot describe an order the code does not have.
 *
 * ORDER AND CONDITION ARE SAID SEPARATELY, and the first version did not do
 * that. It hung each part's condition off the part — "(2) the two figures —
 * only when a reading was produced; (3) which way the gaps fell — only when a
 * reading was produced" — which repeats the clause once per part and reads like
 * a machine. This document goes to a WRITER, and shipping worse prose into it
 * than the hand-written line it replaced would be a strange way to fix a
 * document about prose. The list is the order; one clause afterwards groups the
 * conditions.
 */
function positions(list: number[]): string {
  const marks = list.map((n) => "(" + String(n) + ")");
  if (marks.length === 1) return marks[0];
  return marks.slice(0, -1).join(", ") + " and " + marks[marks.length - 1];
}

export function orderLine(spec: DescribedSpec): string {
  const listed = spec.parts.map((part, index) => "(" + String(index + 1) + ") " + part.says);

  /** Condition text -> the positions that carry it, in first-seen order. */
  const groups = new Map<string, number[]>();
  spec.parts.forEach((part, index) => {
    const key = part.always ? "every time" : (part.when as string);
    const seen = groups.get(key);
    if (seen) seen.push(index + 1);
    else groups.set(key, [index + 1]);
  });

  const clauses = [...groups.entries()].map(([when, at]) =>
    positions(at) + (at.length === 1 ? " renders " : " render ") + when,
  );
  const conditions =
    groups.size === 1 ? "All of them render " + [...groups.keys()][0] + "." : clauses.join("; ") + ".";

  const named = spec.in ? TICK + spec.fn + TICK + " in " + TICK + spec.in + TICK : TICK + spec.fn + TICK;
  return named + " emits, in this order: " + listed.join("; ") + ". " + conditions;
}
