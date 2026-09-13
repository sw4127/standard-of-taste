/**
 * THE COVERING NOTE MAY NOT DRIFT FROM THE DECK IT COMMISSIONS (E20/S6).
 *
 * WHY THIS EXISTS. `docs/commission-batch-3.md` is hand-written prose -- it has
 * to be, because it is a message to a person -- and it states counts: 49 ids,
 * 27 of them open, 14 locked blurbs, 8 already written. Those are exactly the
 * numbers this whole session was spent proving the deck can no longer be wrong
 * about, restated in a file nothing regenerates. A note that tells a writer
 * their batch is 27 sentences when it is 31 sends them looking for four that
 * are not there, and the note is read BEFORE the deck.
 *
 * It pins what the note CLAIMS, not what it says. The prose is free.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const NL = String.fromCharCode(10);
const DECK = "docs/copy-deck.md";

/**
 * The notes, and the part of the deck each one commissions.
 *
 * PARAMETERISED RATHER THAN COPIED (E20/S4). Batch 4's note states its own
 * counts and needed the same pin; duplicating the file would have put two
 * copies of one rule in the test whose subject is a document disagreeing with
 * the thing it describes.
 */
const NOTES = [
  { note: "docs/commission-batch-3.md", part: "2", prefix: "INS" },
  { note: "docs/commission-batch-4.md", part: "4", prefix: "MET" },
];

/** The states of every id in one part, counted from the deck itself. */
function statesIn(part: string, prefix: string): Map<string, number> {
  const body = readFileSync(DECK, "utf8")
    .split(NL + "# Part ")
    .find((section) => section.startsWith(part + " "));
  expect(body, `no Part ${part} in the copy deck, so this test checks nothing`).toBeTruthy();
  const marked = new RegExp("^`(" + prefix + "-[A-Z0-9-]+)` · (.+)$");
  const tally = new Map<string, number>();
  for (const raw of (body as string).split(NL)) {
    const hit = marked.exec(raw.trim());
    if (!hit || hit[2].startsWith("another rendering")) continue;
    tally.set(hit[2], (tally.get(hit[2]) || 0) + 1);
  }
  return tally;
}

describe.each(NOTES)("$note agrees with the deck", ({ note: path, part, prefix }) => {
  const states = statesIn(part, prefix);
  const note = readFileSync(path, "utf8");
  const total = [...states.values()].reduce((a, b) => a + b, 0);

  /*
   * VACUITY, WITHOUT PINNING ONE PART'S STATE SET. The first version asserted
   * the states were exactly LOCKED/OPEN/PASSED, which is Part 2's set -- so
   * Part 4, which is OPEN and PART-LOCKED, failed a test about whether the
   * COUNT was real. The check that matters is that ids were found and that
   * every state read out of the deck is one the brief explains; a state this
   * does not know is a deck change nobody told the writer about.
   */
  const KNOWN_STATES = ["OPEN", "PART-LOCKED", "LOCKED", "PASSED"];

  it("counted a real deck, so nothing below passes vacuously", () => {
    expect(total, `${path} commissions Part ${part}, and no ids were found in it`).toBeGreaterThan(20);
    expect(
      [...states.keys()].filter((state) => KNOWN_STATES.indexOf(state) === -1),
      "the deck carries a lock state the brief does not explain:",
    ).toEqual([]);
  });

  it("states the batch size the deck actually has", () => {
    expect(
      note.indexOf(`${total} ids:`),
      `the note does not say "${total} ids:". The deck's Part ${part} holds ${total} ids and the ` +
        "note is " +
        "read before the deck, so a writer would go looking for a batch that is not there.",
    ).toBeGreaterThan(-1);
  });

  it("states each lock state's count the deck actually has", () => {
    const wrong: string[] = [];
    for (const [state, n] of states) {
      if (note.indexOf(`${n} ${state}`) === -1) wrong.push(`${n} ${state}`);
    }
    expect(
      wrong,
      "the note's per-state counts disagree with the deck. Expected to find each of these phrases " +
        "in it, and did not:",
    ).toEqual([]);
  });

  it("does not promise a paid tier, like every other surface (D4 amendment)", () => {
    expect(/paid tier|costs? money|subscription/i.test(note.replace(/no paid tier/gi, ""))).toBe(false);
  });
});
