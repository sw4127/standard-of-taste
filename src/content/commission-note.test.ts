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
const NOTE = "docs/commission-batch-3.md";
const DECK = "docs/copy-deck.md";

/** The states of every id in Part 2, counted from the deck itself. */
function statesInPartTwo(): Map<string, number> {
  const body = readFileSync(DECK, "utf8")
    .split(NL + "# Part ")
    .find((part) => part.startsWith("2 "));
  expect(body, "no Part 2 in the copy deck, so this test checks nothing").toBeTruthy();
  const tally = new Map<string, number>();
  for (const raw of (body as string).split(NL)) {
    const marked = /^`(INS-[A-Z0-9-]+)` · (.+)$/.exec(raw.trim());
    if (!marked || marked[2].startsWith("another rendering")) continue;
    tally.set(marked[2], (tally.get(marked[2]) || 0) + 1);
  }
  return tally;
}

describe("the batch-3 commission note agrees with the deck", () => {
  const states = statesInPartTwo();
  const note = readFileSync(NOTE, "utf8");
  const total = [...states.values()].reduce((a, b) => a + b, 0);

  it("counted a real deck, so nothing below passes vacuously", () => {
    expect(total).toBeGreaterThan(40);
    expect([...states.keys()].sort()).toEqual(["LOCKED", "OPEN", "PASSED"]);
  });

  it("states the batch size the deck actually has", () => {
    expect(
      note.indexOf(`${total} ids:`),
      `the note does not say "${total} ids:". The deck's Part 2 holds ${total} ids and the note is ` +
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
