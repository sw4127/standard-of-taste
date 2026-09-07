# Copy commission — the brief for a writing pass

**Generated, do not edit by hand.** `node scripts/export-copy-decks.mjs` rewrites this.

This is the brief. The sentences themselves are in `docs/copy-deck.md`, which is a companion to this file and not a substitute for it.

## What is being asked

Rewrite the sentences a small web product shows its users. They were drafted by the engineer who built it, who is the weaker writer of the two tools on this project; that is the entire reason this document exists. **202 of 224 sentences are open to rewriting.** The rest are locked, for reasons given below that are about measurement rather than about taste.

**Everything about the sentences is here. What this deck cannot carry is listed per surface.** That is a smaller promise than the one this brief used to make, and it is the true one: an exporter that enumerates strings will never contain a chart, a table or a layout, however good its adjacency data gets. Each surface names what renders alongside its sentences, in order, and names the non-text a reader sees that you cannot. Where that still leaves you guessing, say so — a brief that assumes knowledge the writer does not have is a defective brief, and this one has been wrong once already.

## What the product is

It is a **taste gym**: a set of listening instruments that measure something about a person's ear and report it honestly. It does not predict personality, mood, or psychological state, and it never has. Every instrument is a performance task where the listener can be wrong — not a questionnaire about themselves.

Four instruments are live:

- **The Prestige Test** — rate short music clips blind, then rate the same clips again with artist names attached. Some of those names are false. Your number is how far your ratings moved toward the labels.
- **The Delicacy Trials** — pairs of clips, one of each quietly damaged. Find the original, then name the flaw. It reports a detection band, never a rank.
- **The Threshold Test** — an adaptive staircase that hunts the smallest damage you can still reliably hear, and reports it in physical units: cents of detune, milliseconds, kbps.
- **The Ranking Test** — six works a published critic once ranked, rated blind. It reports how far apart your ratings fell on the pairs he separated beside the same figure on the pairs he bracketed together. Agreeing with him is not measured and cannot be.

All audio is public-domain or Creative Commons, damaged by the product's own signal processing. Nothing costs money and no paid tier is coming. There are no accounts: results live in the browser that produced them.

## The two rules that are not style

**D1 — every sentence is about the performance, never about the person.** "Your ratings moved 20% toward the labels" is allowed. "You are easily swayed" is not, and the difference is not politeness: the instrument measured a set of ratings on one evening, and a claim about the person is a claim the measurement cannot support.

**N3 — no cohort, no percentile, no comparison between people.** There are **zero** real respondents. Every psychometric figure the product publishes is simulated and labelled as such. So "better than most listeners" is not an exaggeration, it is a statement about people who do not exist.

One more, narrower and absolute: **no leaderboard, no streak, no XP, no points, no badge.** This is a standing product rule, not a preference.

## What the four states mean

Every sentence in the deck carries an id and one of these:

- **OPEN** (177) — rewrite freely, within the rules listed under its section.
- **PART-LOCKED** (25) — the prose is yours, but the block contains quoted words from a cited document, listed under LOAD-BEARING in that section. A test verifies them character for character; change one and the build fails, correctly, because the page would be putting words in the record's mouth.
- **LOCKED** (14) — do not touch. These are the Prestige Test's clip blurbs, and they are not copy: they are the **independent variable**. The test measures how much a listener's rating moves when a blurb is attached. Editing one changes the experiment, invalidates every response already recorded against it, and breaks every share link keyed to the pool version.
- **PASSED** (8) — already written, by you, in August 2026 under ruling RT-107a. Included for tone, not for rewriting. If it now reads worse than the rest, that is worth saying.

**In Part 1 you are rewriting TEMPLATES, not sentences.** Each block is the string as it is written in the source file, and `${...}` marks a value the engine computes. The italic lines beneath are examples of how that template renders — they are there to show you what the slots become, and they are not separate sentences to edit.

**Leave every slot exactly as it is.** Resolving one freezes a value that is supposed to move: `${label}` is a flaw family and that template renders for three of them, `${floor}` is a whole multiple like 3.5x, `${way}` is an entire alternating clause. You may move a slot within a sentence; you may not turn it into words.

**This is a correction, and it is worth knowing why.** The first version of this brief told a writer that the braces in the deck were the product's slots. They were not — they came from a regex over rendered numbers, so a family name and a whole clause were printed as though they were literals, and a writer following the instruction exactly would have shipped "pitch drift" into a template that renders for three families. The deck now reads the templates from source. If a slot still looks wrong, say so rather than working around it.

**Parts 2 to 4 are still keyed to rendered sentences**, not templates. The same collapse almost certainly exists there and has not been measured yet, so treat repeated-looking sentences in those parts with suspicion and say so if you find a set that must be one string.

## How to hand the work back

For each sentence you changed, and only those:

```
VOC-THRESHOLD-RESULT-01
> the rewritten sentence, on one line
```

If a rule is what makes a sentence bad — and that happens — do not quietly drop the rule. Return the id with `RULE:` and say which constraint is doing the damage:

```
VOC-THRESHOLD-RESULT-02
RULE: the no-second-person constraint makes this unreadable; suggest allowing it here because…
```

**Work from one snapshot of the deck.** The ids are positional within their surface, so they renumber if sentences are inserted. That is fine across a single commission and wrong across two, so do not ask for a regenerated deck mid-pass.

**Do not** renumber, reorder, merge or split sentences. One id, one sentence back.

## Batch 2 runs with the repository closed

**This is Cowork's protocol, not the engineer's, and it exists because Cowork refused to answer a question it could not answer honestly.** Asked whether this brief now stands alone, it declined: it had read the source modules before batch 1 and cannot un-know them, so it cannot separate *this deck is sufficient* from *I already know what it leaves out*. Three of its twenty-four edits came from adjacency learned in source; reading the deck again it would find those three from memory and credit the deck. A contaminated measurement — the same failure this product refuses everywhere else.

So: **do not open the repository.** Keep a log instead — every moment you reach for source and stop, with the id and what you wanted to know. The batch ships either way; the log is the by-product and it is the actual measurement. If it is short and cosmetic, the brief stands alone. If it holds one item that would have changed a sentence, it does not.

**The prediction, registered before the batch and falsifiable by it:** the log will be dominated by ADJACENCY and contain almost nothing about slots or coverage. Four fixes since batch 1 were all about what a string IS; what remains is what a string sits NEXT TO. A log full of slot questions falsifies it, and that would be the more useful result.

## The batches, in order

Take these one at a time. The single pass that worked on this project covered one batch and went deep; a commission covering everything at once gets a shallow result.

| Order | Batch | Sentences | Open | Locked | Why it is where it is |
|---|---|---|---|---|---|
| 1 | The reading layer | 70 | 70 | 0 | The sentences each instrument says about a result. This is the product's actual voice: it is what a person reads at the moment they find out how they did, and it is the largest and least-written part of the whole thing. |
| 2 | The pages | 74 | 74 | 0 | The reading room, the terms page, and the frame a listener reads before the Ranking Test starts. Long-form prose rather than one-line readouts, and the place a sceptical reader goes to decide whether any of this is serious. |
| 3 | The instrument copy | 51 | 29 | 22 | Smaller batches around the instruments: the result title, the flaw line, the not-built-yet notice, the creator vocabulary. Includes the clip blurbs, which are LOCKED, and the one batch already written, which is PASSED and here only for tone. |
| 4 | The methodology page | 29 | 29 | 0 | The published account of how the instruments work. Mostly PART-LOCKED: it quotes cited documents word for word and a test verifies the quotations, so the writing to be done is the connective prose around them. |

Ids are prefixed by batch: `VOC-`, `PAGE-`, `INS-`, `MET-`. Find your batch in `docs/copy-deck.md` by that prefix.

## The voice

Hume's examiner: wry, well-read, amused, precise, never cruel. The barb lands on the measured datum, never on the person — which is D1 restated as a tone. The product is allowed to be funny about a number and is never allowed to be funny about a listener.

Two failure modes it has actually shipped, both worth watching for. **Beige chrome:** "Your results are ready." A result screen that sounds like a form submission has wasted the one moment the reader is paying attention. **Flattery in place of a measurement:** when an instrument cannot produce a number it must say so plainly and say why, and must not convert the failure into a compliment about the person.

