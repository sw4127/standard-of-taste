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
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { LANDING_OPENER, LANDING_ALGORITHM, LANDING_TURN } from "./landing";

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

/**
 * BATCH 5 QUOTES THE PRODUCT'S FIRST THREE SENTENCES (E20).
 *
 * It has to: they are not in the copy deck, so the covering note carries them
 * verbatim or the writer cannot see what they are editing. That makes the note
 * a SECOND COPY of the most-read copy in the product, and this session has
 * already watched two commission notes go stale the moment the thing they
 * described moved — batch 3's and batch 4's counts, both in the same week.
 *
 * So the quotations are pinned to the constants rather than trusted. A sentence
 * rewritten in `landing.ts` without the note following it fails here, before
 * the note is handed to anyone.
 */
import {
  CARD_CHROME,
  CARD_PASTE,
  CARD_SEPARATES,
  CARD_WORTH,
  separatesLine,
  worthLine,
} from "@/content/card/copy";
import { CARD_STATEMENT } from "@/content/card/statement";
import { PROMPT_AXES } from "@/content/card/axes";
import type { CardAxis } from "@/engine/prompt-card";

describe("the batch-5 note quotes the product's actual first sentences", () => {
  const raw = readFileSync("docs/commission-batch-5.md", "utf8");
  /*
   * MARKDOWN WRAPS A QUOTATION ACROSS LINES AND PREFIXES EACH WITH "> ". The
   * first version compared the constant against the raw file and failed on
   * formatting rather than on content — which would have taught the next person
   * that this guard cries wolf. The comparison is on the TEXT: blockquote
   * markers gone, whitespace collapsed.
   */
  const note = raw
    .split(NL)
    // NESTED: the note quotes the sentences INSIDE the message blockquote, so
    // lines begin "> > ". Stripping one level left a stray marker mid-sentence.
    .map((line) => line.replace(/^(>\s*)+/, ""))
    .join(" ")
    .replace(/\s+/g, " ");

  it("read a real note, so nothing below passes vacuously", () => {
    expect(raw.length).toBeGreaterThan(3000);
  });

  it("quotes each of the three exactly as the product renders it", () => {
    const wrong: string[] = [];
    for (const [name, text] of [
      ["LANDING_OPENER", LANDING_OPENER],
      ["LANDING_ALGORITHM", LANDING_ALGORITHM],
      ["LANDING_TURN", LANDING_TURN],
    ] as const) {
      if (note.indexOf(text) === -1) wrong.push(`${name}: ${text.slice(0, 70)}`);
    }
    expect(
      wrong,
      "the note quotes the front door's sentences and these no longer match what the product " +
        "renders. A writer would be editing a sentence that is not on screen:" + NL + wrong.join(NL),
    ).toEqual([]);
  });

  it("names the three surfaces it commissions, and they exist", () => {
    for (const path of ["README.md", "docs/index.html"]) {
      expect(raw.indexOf(path), `the note does not name ${path}`).toBeGreaterThan(-1);
      expect(existsSync(path), `${path} does not exist`).toBe(true);
    }
  });
});


/**
 * BATCH 6 QUOTES THE PROMPT CARD, WHICH IS NOT IN THE DECK EITHER (E21).
 *
 * Same hazard as batch 5 and nine times the surface: the card's strings live in
 * `src/content/card/` and not in `docs/copy-deck.md`, so the covering note
 * carries them verbatim or the writer cannot see what they are editing. That
 * makes the note a second copy of the newest copy in the product — and this
 * repository has already watched two commission notes go stale in the week they
 * were written.
 *
 * THE TEMPLATED LINES ARE PINNED BY THEIR FIXED FRAGMENTS, not whole. A branch
 * like "You were still calling it at ${figure}" cannot be compared verbatim
 * against a note that shows the slot, so the line is rendered from a real
 * session and split on the values that went in; what is left is the wording,
 * and every piece of it must be in the note. A rewrite in `copy.ts` that the
 * note does not follow fails here, before anybody is handed it.
 */
describe("the batch-6 note quotes the prompt card as the product renders it", () => {
  const raw = readFileSync("docs/commission-batch-6.md", "utf8");
  const note = raw
    .split(NL)
    .map((line) => line.replace(/^(>\s*)+/, ""))
    .join(" ")
    .replace(/\s+/g, " ");

  it("read a real note, so nothing below passes vacuously", () => {
    expect(raw.length).toBeGreaterThan(4000);
  });

  it("quotes every fixed string the card renders", () => {
    const fixed: [string, string][] = [
      ["CARD_SEPARATES", CARD_SEPARATES],
      ["CARD_WORTH", CARD_WORTH],
      ["CARD_PASTE", CARD_PASTE],
      ["CARD_STATEMENT", CARD_STATEMENT],
      ...CARD_CHROME.map((t, i) => [`CARD_CHROME[${i}]`, t] as [string, string]),
      ...Object.entries(PROMPT_AXES).flatMap(([family, a]) => [
        [`${family}.axis`, a.axis] as [string, string],
        [`${family}.neutral`, a.neutral] as [string, string],
        ...a.precise.map((t, i) => [`${family}.precise[${i}]`, t] as [string, string]),
      ]),
    ];
    expect(fixed.length, "nothing was collected, so this checks nothing").toBeGreaterThan(15);
    const wrong = fixed.filter(([, text]) => note.indexOf(text) === -1).map(([name, text]) => `${name}: ${text}`);
    expect(
      wrong,
      "the note quotes the card's strings and these no longer match what it renders. A writer " +
        "would be editing a sentence that is not on screen:" + NL + wrong.join(NL),
    ).toEqual([]);
  });

  it("quotes the wording of every templated branch", () => {
    /*
     * Rendered from a real session, then split on the values that were slotted
     * in. What survives is the wording the writer is being asked to edit.
     */
    const FIGURE = "12.5 cents";
    const axes: CardAxis[] = (["fine", "coarse", "measured", "finer-than-measured", "coarser-than-measured", "not-enough"] as const).map(
      (state) => ({
        family: "pitch-drift",
        unit: "cents of peak detune",
        state,
        threshold: state === "fine" || state === "coarse" || state === "measured" ? 12.5 : null,
        band: null,
        spend: state === "fine" ? true : state === "coarse" ? false : null,
      }),
    );
    const rendered = [
      ...axes.map((a) => separatesLine(a, FIGURE)),
      ...axes.map((a) => worthLine(a)).filter((l): l is string => l !== null),
    ];
    expect(rendered.length, "no branches were rendered").toBeGreaterThan(9);

    const SLOTS = [FIGURE, "Pitch drift", PROMPT_AXES["pitch-drift"].axis, PROMPT_AXES["pitch-drift"].neutral];
    const missing: string[] = [];
    for (const line of rendered) {
      let rest = line;
      for (const slot of SLOTS) rest = rest.split(slot).join("\u0000");
      for (const fragment of rest.split("\u0000").map((f) => f.trim()).filter((f) => f.length > 12)) {
        if (note.indexOf(fragment) === -1) missing.push(fragment);
      }
    }
    expect(
      missing,
      "these fragments of the card's templated lines are not in the note, so the note describes " +
        "wording the card no longer uses:" + NL + missing.join(NL),
    ).toEqual([]);
  });

  it("names the modules it commissions, and they exist", () => {
    for (const path of ["src/content/card/copy.ts", "src/content/card/axes.ts", "src/content/card/statement.ts"]) {
      expect(raw.indexOf(path), `the note does not name ${path}`).toBeGreaterThan(-1);
      expect(existsSync(path), `${path} does not exist`).toBe(true);
    }
  });
});
