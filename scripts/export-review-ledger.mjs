/**
 * WHICH COPY HAS EVER BEEN THROUGH A WRITING PASS (E18/S11, PM ruling RT-Q3 a).
 *
 * WHAT THIS REPLACES, AND WHY IT WAS WRONG. E18/S9 put a NEW marker on the copy
 * deck, measured against a baseline seeded from the state before that session.
 * The effect was that 182 of 216 sentences rendered as "not new", which any
 * reader takes as "reviewed". Almost none of it has been reviewed. The error
 * underneath was mine and it was about people: I had assumed the PM performs the
 * writing pass, so "new since you last saw this" seemed like the useful
 * question. THE PASS IS COWORK'S -- `docs/handoff-2026-08-25.md` says "COPY
 * AWAITING A COWORK PASS", the one completed pass was Cowork's (RT-107a), and
 * the decks exist because the PM "rates the engineer the weaker writer and asked
 * for one artefact to hand to a stronger one". Cowork has seen none of this, so
 * a per-sentence "new" marker was noise built on a false premise.
 *
 * The honest question is per SURFACE and it is binary: has anyone ever written
 * this, or is it all still the engineer's first draft?
 *
 * SURFACES ARE READ OUT OF THE GENERATED DECKS, never typed here. A ledger with
 * a hand-written roster would go stale the first time a surface shipped, which
 * is precisely what happened to the vocabulary deck for a week.
 *
 * THE PASS RECORD IS TYPED, and it has to be: whether a commission happened is
 * a fact about the past that no file can derive. It is small, it cites the
 * document that proves it, and the guard is on the other side -- every surface
 * in the decks must appear in this ledger, so a new surface arrives marked
 * unreviewed by default rather than silently absent.
 *
 *   node scripts/export-review-ledger.mjs > docs/copy-review-ledger.md
 */
import { readFileSync } from "node:fs";

const NL = String.fromCharCode(10);

const DECKS = [
  { file: "docs/copy-deck-vocabulary.md", part: "1 · The vocabulary layer" },
  { file: "docs/copy-deck-instruments.md", part: "2 · The instrument copy" },
  { file: "docs/copy-deck-pages.md", part: "3 · The page copy" },
  { file: "docs/copy-deck-method.md", part: "4 · The /method page" },
];

/**
 * EVERY PASS THAT HAS ACTUALLY HAPPENED. One, at the time of writing.
 *
 * `surface` is matched against the deck headings. The delicacy readout has no
 * heading to match, because it is not enumerated by any deck -- see UNDECKED.
 */
const PASSES = [];

/**
 * COPY THAT HAS BEEN PASSED BUT APPEARS IN NO DECK.
 *
 * The gap runs both ways and this half is the more surprising one. The only
 * body of copy in this product that has ever been through a writer --
 * `src/content/delicacy/copy.ts`, the Delicacy result's detection readout -- is
 * enumerated by nothing. `FLAW_LINE_PREFIX` reaches the instrument deck; the
 * band lines, the calibration line, the provisional footnote and the summary do
 * not. So the decks describe the unreviewed copy and omit the reviewed copy,
 * which is exactly backwards, and it was found while building this ledger.
 */
const UNDECKED = [
  {
    what: "The Delicacy result's detection readout",
    where: "src/content/delicacy/copy.ts",
    pass: "Cowork, PM ruling RT-107a, returned 2026-08-22",
    brief: "docs/copy-brief-delicacy-readout.md",
    note:
      "Wired verbatim but for one factual fix at the 12-of-15 boundary. The module cites the " +
      "pass by name where it omits `margin`. Not enumerated by any deck, so a later edit to it " +
      "would go unreviewed and unnoticed.",
  },
];

/** Surface headings, read out of each generated deck. */
function surfacesOf(file) {
  const text = readFileSync(file, "utf8");
  return text
    .split(NL)
    .filter((line) => line.startsWith("## ") && line.indexOf("How to use") === -1)
    .map((line) => line.slice(3).trim());
}

const lines = [];
lines.push("# Copy review ledger — what has ever been through a writer");
lines.push("");
lines.push(
  "**Generated, do not edit by hand.** `node scripts/export-copy-decks.mjs` rewrites this and " +
    "every deck it reads.",
);
lines.push("");
lines.push(
  "The writing pass is **Cowork's**, not the PM's and not engineering's. The decks exist because " +
    "the engineer is the weaker writer of the two and one artefact was wanted to hand to the " +
    "stronger one. This ledger answers the only question that matters before commissioning a " +
    "pass: which of these surfaces has ever had one.",
);
lines.push("");

let total = 0;
let passed = 0;
const rows = [];
for (const deck of DECKS) {
  for (const surface of surfacesOf(deck.file)) {
    total += 1;
    const record = PASSES.find((p) => p.surface === surface);
    if (record) passed += 1;
    rows.push({ part: deck.part, surface, record });
  }
}

lines.push("## The state of it");
lines.push("");
lines.push(
  "**" + passed + " of " + total + " surfaces in the decks have been through a pass.** Everything " +
    "else below is the engineer's first draft, shipped and live.",
);
lines.push("");
lines.push("| Part | Surface | Pass |");
lines.push("|---|---|---|");
for (const row of rows) {
  const status = row.record
    ? row.record.pass + " (`" + row.record.brief + "`)"
    : "**never**";
  lines.push("| " + row.part + " | " + row.surface + " | " + status + " |");
}
lines.push("");

lines.push("## Passed, but in no deck");
lines.push("");
lines.push(
  "The gap runs both ways, and this half is the more surprising one: the only copy in this " +
    "product that has been through a writer is enumerated by nothing, so a later edit to it would " +
    "go unreviewed and unnoticed.",
);
lines.push("");
for (const item of UNDECKED) {
  lines.push("### " + item.what);
  lines.push("");
  lines.push("- **Lives in** `" + item.where + "`");
  lines.push("- **Pass** — " + item.pass + ", brief at `" + item.brief + "`");
  lines.push("- " + item.note);
  lines.push("");
}

process.stdout.write(lines.join(NL) + NL);
