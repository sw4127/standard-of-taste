/**
 * THE COMMISSION BRIEF (E18/S13, PM ruling RT-Q3 a).
 *
 * WHAT IT IS FOR. `docs/copy-deck.md` holds the sentences; it is raw material,
 * not a commission. The one writing pass this project has ever completed
 * (Cowork, RT-107a) worked because somebody wrote a BRIEF: where it goes, why it
 * is being replaced, the one thing a reader must leave understanding, the hard
 * constraints, the variables available, and the traps already hit. This is that,
 * for the remaining twenty-seven surfaces.
 *
 * IT MUST STAND ALONE. The writer has no repository, no running product and no
 * memory of this project. Anything it needs to know has to be in it -- what the
 * product is, who the reader is, which rules are measurement constraints rather
 * than taste, and how to hand work back.
 *
 * THE COUNTS ARE GENERATED, THE ARGUMENT IS WRITTEN. Batch sizes and surface
 * totals come from the decks, because a brief that says "159 sentences" after
 * the number moves is the stale-document defect this session has now fixed four
 * times. The reasoning is prose and is meant to be.
 *
 *   node scripts/export-commission.mjs > docs/copy-commission.md
 */
import { readFileSync } from "node:fs";

const NL = String.fromCharCode(10);
const TAG = "` · ";

const deck = readFileSync("docs/copy-deck.md", "utf8");

/** Every id tag in the assembled deck, with its state. */
const tags = deck
  .split(NL)
  .filter((line) => line.startsWith("`") && line.indexOf(TAG) !== -1)
  .map((line) => ({
    id: line.slice(1, line.indexOf(TAG)),
    state: line.slice(line.indexOf(TAG) + TAG.length).trim(),
  }));

const countOf = (prefix, state) =>
  tags.filter((t) => t.id.startsWith(prefix) && (state === undefined || t.state === state)).length;

const BATCHES = [
  {
    prefix: "VOC-",
    name: "The reading layer",
    why:
      "The sentences each instrument says about a result. This is the product's actual voice: it " +
      "is what a person reads at the moment they find out how they did, and it is the largest " +
      "and least-written part of the whole thing.",
  },
  {
    prefix: "PAGE-",
    name: "The pages",
    why:
      "The reading room, the terms page, and the frame a listener reads before the Ranking Test " +
      "starts. Long-form prose rather than one-line readouts, and the place a sceptical reader " +
      "goes to decide whether any of this is serious.",
  },
  {
    prefix: "INS-",
    name: "The instrument copy",
    why:
      "Smaller batches around the instruments: the result title, the flaw line, the not-built-yet " +
      "notice, the creator vocabulary. Includes the clip blurbs, which are LOCKED, and the one " +
      "batch already written, which is PASSED and here only for tone.",
  },
  {
    prefix: "MET-",
    name: "The methodology page",
    why:
      "The published account of how the instruments work. Mostly PART-LOCKED: it quotes cited " +
      "documents word for word and a test verifies the quotations, so the writing to be done is " +
      "the connective prose around them.",
  },
];

const w = [];
const p = (s = "") => w.push(s);

p("# Copy commission — the brief for a writing pass");
p();
p("**Generated, do not edit by hand.** `node scripts/export-copy-decks.mjs` rewrites this.");
p();
p(
  "This is the brief. The sentences themselves are in `docs/copy-deck.md`, which is a companion " +
    "to this file and not a substitute for it.",
);
p();

p("## What is being asked");
p();
p(
  "Rewrite the sentences a small web product shows its users. They were drafted by the engineer " +
    "who built it, who is the weaker writer of the two tools on this project; that is the entire " +
    "reason this document exists. **" +
    tags.filter((t) => t.state === "OPEN" || t.state === "PART-LOCKED").length +
    " of " +
    tags.length +
    " sentences are open to rewriting.** The rest are locked, for reasons given below that are " +
    "about measurement rather than about taste.",
);
p();
p(
  "You have no access to the repository or to a running copy of the product, so everything you " +
    "need is here. Where that is not true, say so — a brief that assumes knowledge the writer " +
    "does not have is a defective brief.",
);
p();

p("## What the product is");
p();
p(
  "It is a **taste gym**: a set of listening instruments that measure something about a person's " +
    "ear and report it honestly. It does not predict personality, mood, or psychological state, " +
    "and it never has. Every instrument is a performance task where the listener can be wrong — " +
    "not a questionnaire about themselves.",
);
p();
p("Four instruments are live:");
p();
p(
  "- **The Prestige Test** — rate short music clips blind, then rate the same clips again with " +
    "artist names attached. Some of those names are false. Your number is how far your ratings " +
    "moved toward the labels.",
);
p(
  "- **The Delicacy Trials** — pairs of clips, one of each quietly damaged. Find the original, " +
    "then name the flaw. It reports a detection band, never a rank.",
);
p(
  "- **The Threshold Test** — an adaptive staircase that hunts the smallest damage you can still " +
    "reliably hear, and reports it in physical units: cents of detune, milliseconds, kbps.",
);
p(
  "- **The Ranking Test** — six works a published critic once ranked, rated blind. It reports how " +
    "far apart your ratings fell on the pairs he separated beside the same figure on the pairs he " +
    "bracketed together. Agreeing with him is not measured and cannot be.",
);
p();
p(
  "All audio is public-domain or Creative Commons, damaged by the product's own signal " +
    "processing. Nothing costs money and no paid tier is coming. There are no accounts: results " +
    "live in the browser that produced them.",
);
p();

p("## The two rules that are not style");
p();
p(
  "**D1 — every sentence is about the performance, never about the person.** \"Your ratings moved " +
    "20% toward the labels\" is allowed. \"You are easily swayed\" is not, and the difference is " +
    "not politeness: the instrument measured a set of ratings on one evening, and a claim about " +
    "the person is a claim the measurement cannot support.",
);
p();
p(
  "**N3 — no cohort, no percentile, no comparison between people.** There are **zero** real " +
    "respondents. Every psychometric figure the product publishes is simulated and labelled as " +
    "such. So \"better than most listeners\" is not an exaggeration, it is a statement about " +
    "people who do not exist.",
);
p();
p(
  "One more, narrower and absolute: **no leaderboard, no streak, no XP, no points, no badge.** " +
    "This is a standing product rule, not a preference.",
);
p();

p("## What the four states mean");
p();
p("Every sentence in the deck carries an id and one of these:");
p();
p(
  "- **OPEN** (" + tags.filter((t) => t.state === "OPEN").length +
    ") — rewrite freely, within the rules listed under its section.",
);
p(
  "- **PART-LOCKED** (" + tags.filter((t) => t.state === "PART-LOCKED").length +
    ") — the prose is yours, but the block contains quoted words from a cited document, listed " +
    "under LOAD-BEARING in that section. A test verifies them character for character; change one " +
    "and the build fails, correctly, because the page would be putting words in the record's mouth.",
);
p(
  "- **LOCKED** (" + tags.filter((t) => t.state === "LOCKED").length +
    ") — do not touch. These are the Prestige Test's clip blurbs, and they are not copy: they are " +
    "the **independent variable**. The test measures how much a listener's rating moves when a " +
    "blurb is attached. Editing one changes the experiment, invalidates every response already " +
    "recorded against it, and breaks every share link keyed to the pool version.",
);
p(
  "- **PASSED** (" + tags.filter((t) => t.state === "PASSED").length +
    ") — already written, by you, in August 2026 under ruling RT-107a. Included for tone, not for " +
    "rewriting. If it now reads worse than the rest, that is worth saying.",
);
p();
p(
  "**In Part 1 you are rewriting TEMPLATES, not sentences.** Each block is the string as it is " +
    "written in the source file, and `${...}` marks a value the engine computes. The italic lines " +
    "beneath are examples of how that template renders — they are there to show you what the " +
    "slots become, and they are not separate sentences to edit.",
);
p();
p(
  "**Leave every slot exactly as it is.** Resolving one freezes a value that is supposed to move: " +
    "`${label}` is a flaw family and that template renders for three of them, `${floor}` is a " +
    "whole multiple like 3.5x, `${way}` is an entire alternating clause. You may move a slot " +
    "within a sentence; you may not turn it into words.",
);
p();
p(
  "**This is a correction, and it is worth knowing why.** The first version of this brief told a " +
    "writer that the braces in the deck were the product's slots. They were not — they came from " +
    "a regex over rendered numbers, so a family name and a whole clause were printed as though " +
    "they were literals, and a writer following the instruction exactly would have shipped " +
    "\"pitch drift\" into a template that renders for three families. The deck now reads the " +
    "templates from source. If a slot still looks wrong, say so rather than working around it.",
);
p();
p(
  "**Parts 2 to 4 are still keyed to rendered sentences**, not templates. The same collapse " +
    "almost certainly exists there and has not been measured yet, so treat repeated-looking " +
    "sentences in those parts with suspicion and say so if you find a set that must be one string.",
);
p();

p("## How to hand the work back");
p();
p("For each sentence you changed, and only those:");
p();
p("```");
p(tags[0] ? tags[0].id : "VOC-EXAMPLE-01");
p("> the rewritten sentence, on one line");
p("```");
p();
p(
  "If a rule is what makes a sentence bad — and that happens — do not quietly drop the rule. " +
    "Return the id with `RULE:` and say which constraint is doing the damage:",
);
p();
p("```");
p(tags[1] ? tags[1].id : "VOC-EXAMPLE-02");
p("RULE: the no-second-person constraint makes this unreadable; suggest allowing it here because…");
p("```");
p();
p(
  "**Work from one snapshot of the deck.** The ids are positional within their surface, so they " +
    "renumber if sentences are inserted. That is fine across a single commission and wrong across " +
    "two, so do not ask for a regenerated deck mid-pass.",
);
p();
p("**Do not** renumber, reorder, merge or split sentences. One id, one sentence back.");
p();

p("## The batches, in order");
p();
p(
  "Take these one at a time. The single pass that worked on this project covered one batch and " +
    "went deep; a commission covering everything at once gets a shallow result.",
);
p();
p("| Order | Batch | Sentences | Open | Locked | Why it is where it is |");
p("|---|---|---|---|---|---|");
BATCHES.forEach((batch, i) => {
  p(
    "| " + (i + 1) + " | " + batch.name +
      " | " + countOf(batch.prefix) +
      " | " + (countOf(batch.prefix, "OPEN") + countOf(batch.prefix, "PART-LOCKED")) +
      " | " + (countOf(batch.prefix, "LOCKED") + countOf(batch.prefix, "PASSED")) +
      " | " + batch.why + " |",
  );
});
p();
p(
  "Ids are prefixed by batch: " +
    BATCHES.map((b) => "`" + b.prefix + "`").join(", ") +
    ". Find your batch in `docs/copy-deck.md` by that prefix.",
);
p();

p("## The voice");
p();
p(
  "Hume's examiner: wry, well-read, amused, precise, never cruel. The barb lands on the measured " +
    "datum, never on the person — which is D1 restated as a tone. The product is allowed to be " +
    "funny about a number and is never allowed to be funny about a listener.",
);
p();
p(
  "Two failure modes it has actually shipped, both worth watching for. **Beige chrome:** \"Your " +
    "results are ready.\" A result screen that sounds like a form submission has wasted the one " +
    "moment the reader is paying attention. **Flattery in place of a measurement:** when an " +
    "instrument cannot produce a number it must say so plainly and say why, and must not convert " +
    "the failure into a compliment about the person.",
);
p();

process.stdout.write(w.join(NL) + NL);
