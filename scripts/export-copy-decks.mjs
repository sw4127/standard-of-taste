/**
 * ONE DOCUMENT FOR THE WRITING PASS (E18/S9, PM rulings RT-P4 a / RT-P5 a).
 *
 * WHY THIS EXISTS. The copy that needs a writer's eye is spread across three
 * generated decks, each with its own command, and the PM has to know which
 * three and run each. This assembles them into `docs/copy-deck.md` and marks
 * what is NEW, so the reading order is a document rather than a directory.
 *
 * IT DRIVES THE THREE EXPORTERS RATHER THAN REPLACING THEM, and that was the
 * argued choice. Each of them carries instrument-specific rules in its header
 * that a merged generator would either duplicate or lose -- the /method deck's
 * LOAD-BEARING/QUOTED distinction, where changing a quoted word correctly fails
 * the build, and the instrument deck's warning that editing a clip blurb is a
 * POOL CHANGE requiring a BIAS_POOL_VERSION bump because every share URL is
 * keyed to it. Assembling their output keeps all three intact.
 *
 * ONE COMMAND WRITES ALL FOUR FILES (RT-P5 a). The per-deck files stay, because
 * each exporter's header names its own output and the decks are referenced by
 * name; what must not happen is the combined document drifting from them, and
 * regenerating everything together is what prevents that.
 *
 * THE PER-SENTENCE "NEW" MARKER WAS REMOVED IN E18/S11, and it deserves a
 * paragraph because it was wrong rather than merely unnecessary. It compared
 * each sentence against the previously committed document, which made 182 of
 * 216 render as "not new" -- read by anyone as "reviewed". Almost none of it is.
 * The error underneath was about people: the writing pass is COWORK'S, not the
 * PM's, and Cowork has seen none of this, so "new since you last saw it" was a
 * question about a reader who does not exist. `docs/copy-review-ledger.md`
 * answers the real one, per surface, and today it reads none.
 *
 * NO BACKSLASH ESCAPES IN THIS FILE. The transport these scripts are written
 * through eats one level of escaping, which has produced a real newline inside a
 * string literal three times in one session. Newlines come from NL.
 *
 *   node scripts/export-copy-decks.mjs
 */
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const NL = String.fromCharCode(10);

const DECKS = [
  {
    file: "docs/copy-deck-vocabulary.md",
    script: "scripts/export-copy-deck.mjs",
    title: "The vocabulary layer",
    blurb:
      "Every sentence the instruments' reading layer can render, per surface. This is the " +
      "largest part and the part most worth a writer.",
  },
  {
    file: "docs/copy-deck-instruments.md",
    script: "scripts/export-instrument-deck.mjs",
    title: "The instrument copy",
    blurb:
      "The four batches that are not the reading layer: the clip blurbs, the result title, the " +
      "flaw line, the not-built-yet notice, and the creator vocabulary.",
  },
  {
    file: "docs/copy-deck-pages.md",
    script: "scripts/export-page-deck.mjs",
    title: "The page copy",
    blurb:
      "Every paragraph a reader meets in the reading room, on /legal, and in the Ranking Test's " +
      "frame. This copy lives inline in the components, so it is a reading surface here and edits " +
      "land in the .tsx files named under each section.",
  },
  {
    file: "docs/copy-deck-method.md",
    script: "scripts/export-method-deck.mjs",
    title: "The /method page",
    blurb:
      "Every claim on the published methodology page. Read this one against the live page: much " +
      "of it is quotation, and the quoted words are fixed by a test.",
  },
];

/**
 * IS THIS LINE COPY SOMEBODY WOULD REWRITE?
 *
 * ONLY TWO THINGS QUALIFY: a quoted sentence (the decks emit product copy as a
 * blockquote) and a line inside a fenced block (where the /method deck puts the
 * page's own paragraphs and the instrument deck puts every reachable shape).
 *
 * THE FIRST VERSION ASKED THE QUESTION BACKWARDS -- it excluded headings, rule
 * bullets and bold labels and took everything else. That counted 177
 * "sentences" when the document holds 69 quoted ones; the other hundred-odd
 * were the DECK'S OWN scaffolding: this file's header, each deck's preamble,
 * the "Where it renders" bodies. Reporting "34 of 177" told the reader there
 * was three times more to review than there is, and a NEW marker on the
 * explanation of a section is noise sitting exactly where signal should be.
 * Found by counting what the predicate had actually matched instead of trusting
 * the number it produced.
 */
function reviewable(line, insideFence) {
  const t = line.trim();
  if (t.length < 40) return false;
  if (insideFence) return true;
  return t.startsWith(">");
}

const out = [];
let considered = 0;

/**
 * PARAGRAPHS THE ASSEMBLED DOCUMENT HAS ALREADY SAID.
 *
 * Each per-deck file opens with its own preamble, and two of those paragraphs
 * are shared verbatim -- the one about who wrote these sentences and the one
 * naming D1 and N3. Concatenated, the reader met them four and three times
 * respectively, in a document whose only job is to be read.
 *
 * MATCHED ON THE EXACT TEXT, so a deck whose preamble diverges keeps it. That
 * matters: the /method deck's preamble explains the LOAD-BEARING/QUOTED split,
 * which is deck-specific and must survive, and the instrument deck's warns that
 * editing a clip blurb is a pool change.
 */
const said = new Set();

out.push("# The copy deck — everything a reader sees, for a writing pass");
out.push("");
out.push(
  "**Generated, do not edit by hand.** `node scripts/export-copy-decks.mjs` rewrites this file " +
    "and the three it is assembled from, so they cannot drift apart.",
);
out.push("");
out.push(
  "Every sentence below is enumerated from the code that renders it, so this document and the " +
    "shipped product cannot disagree.",
);
out.push("");
out.push("## How to use this");
out.push("");
out.push(
  "The engineer who wrote these is the weaker writer of the two on this project; that is the " +
    "reason the file exists. Rewrite freely **within the rules listed under each section** — those " +
    "are not style preferences, they are measurement constraints, and several were bought with " +
    "defects found by reading rendered output. If a rule seems to be what makes a sentence bad, " +
    "say so and it gets re-examined; do not quietly drop it.",
);
out.push("");
out.push(
  "Two constraints apply everywhere. **D1:** every sentence is about the performance, never about " +
    "the person. **N3:** no percentile, no cohort, no comparison to other people — there are zero " +
    "real respondents, so any such claim is about people who do not exist.",
);
out.push("");
out.push(
  "**Which of these surfaces has ever been through a writer is in " +
    "`docs/copy-review-ledger.md`.** Read that first: it is the only honest answer to \"what is " +
    "left to do\", and today it says none of them.",
);
out.push("");
for (const line of out) {
  if (line.trim().length > 80) said.add(line.trim());
}

out.push("## Contents");
out.push("");
DECKS.forEach((deck, i) => {
  out.push("- **Part " + (i + 1) + " · " + deck.title + "** — " + deck.blurb);
});
out.push("");

DECKS.forEach((deck, i) => {
  const generated = execSync("node " + deck.script, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  writeFileSync(deck.file, generated);

  out.push("");
  out.push("---");
  out.push("");
  out.push("# Part " + (i + 1) + " · " + deck.title);
  out.push("");
  out.push("*Also written to `" + deck.file + "` by this same command.*");
  out.push("");

  const part = [];
  let fenced = false;
  for (const line of generated.split(NL)) {
    if (line.trim().startsWith("```")) fenced = !fenced;
    // The per-deck file's own title; the part heading above replaces it.
    if (line.startsWith("# ")) continue;
    if (said.has(line.trim())) continue;
    if (reviewable(line, fenced)) {
      considered += 1;
    }
    // Demote the per-deck headings so the assembled document nests correctly.
    part.push(line.startsWith("#") ? "#" + line : line);
  }

  /*
   * A HEADING WHOSE BODY WAS ALL DUPLICATE IS NOW AN EMPTY HEADING, which reads
   * as a section that lost its content rather than one that never had any.
   *
   * THE FIRST VERSION OF THIS LEFT ONE STANDING and I found it by reading the
   * assembled file rather than by trusting the loop. It only treated a
   * following HEADING as emptiness, and the vocabulary deck's preamble is
   * followed by a horizontal rule -- so "### How to use this" survived above a
   * blank line and a `---`, which is precisely the "lost its content" shape the
   * paragraph above says it prevents.
   */
  const emptyAfter = (line) => line.startsWith("#") || line.trim() === "---";
  for (let i = 0; i < part.length; i += 1) {
    if (!part[i].startsWith("#")) continue;
    let j = i + 1;
    while (j < part.length && part[j].trim() === "") j += 1;
    if (j >= part.length || emptyAfter(part[j])) {
      part.splice(i, j - i);
      i -= 1;
    }
  }
  out.push(...part);
});

out.push("");
out.push("---");
out.push("");
out.push(
  "**" + considered + " sentences.** Which surfaces have ever been through a writer is in " +
    "`docs/copy-review-ledger.md`; today, none of them have.",
);
out.push("");

writeFileSync("docs/copy-deck.md", out.join(NL) + NL);

/*
 * `--reviewed` STAMPS THE PASS AS DONE, and it is the only thing that moves the
 * baseline. It records the sentences as they stand now, so the next run marks
 * exactly what arrived afterwards.
 */
/*
 * THE LEDGER IS WRITTEN LAST, because it reads the decks this run just wrote.
 * Generated by the same command so it cannot describe a set of surfaces that no
 * longer exists.
 */
writeFileSync("docs/copy-review-ledger.md", execSync("node scripts/export-review-ledger.mjs", {
  encoding: "utf8",
  maxBuffer: 8 * 1024 * 1024,
}));

process.stderr.write(
  "wrote docs/copy-deck.md, " + DECKS.length + " per-deck files and the review ledger; " +
    considered + " sentences" + NL,
);
