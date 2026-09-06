# Copy commission — the brief for a writing pass

**Generated, do not edit by hand.** `node scripts/export-copy-decks.mjs` rewrites this.

This is the brief. The sentences themselves are in `docs/copy-deck.md`, which is a companion to this file and not a substitute for it.

## What is being asked

Rewrite the sentences a small web product shows its users. They were drafted by the engineer who built it, who is the weaker writer of the two tools on this project; that is the entire reason this document exists. **202 of 235 sentences are open to rewriting.** The rest are locked, for reasons given below that are about measurement rather than about taste.

You have no access to the repository or to a running copy of the product, so everything you need is here. Where that is not true, say so — a brief that assumes knowledge the writer does not have is a defective brief.

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
- **PASSED** (19) — already written, by you, in August 2026 under ruling RT-107a. Included for tone, not for rewriting. If it now reads worse than the rest, that is worth saying.

**Braces are slots, and they must survive.** `{n}`, `{f.unit}`, `{numberWord(DEGREES_AVAILABLE)}` — the product fills these at render time from the code that computed them. Typing the current value in is how a page starts lying about an instrument that has since changed. Move a slot within a sentence freely; do not resolve it.

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

## The batches, in order

Take these one at a time. The single pass that worked on this project covered one batch and went deep; a commission covering everything at once gets a shallow result.

| Order | Batch | Sentences | Open | Locked | Why it is where it is |
|---|---|---|---|---|---|
| 1 | The reading layer | 69 | 69 | 0 | The sentences each instrument says about a result. This is the product's actual voice: it is what a person reads at the moment they find out how they did, and it is the largest and least-written part of the whole thing. |
| 2 | The pages | 74 | 74 | 0 | The reading room, the terms page, and the frame a listener reads before the Ranking Test starts. Long-form prose rather than one-line readouts, and the place a sceptical reader goes to decide whether any of this is serious. |
| 3 | The instrument copy | 63 | 30 | 33 | Smaller batches around the instruments: the result title, the flaw line, the not-built-yet notice, the creator vocabulary. Includes the clip blurbs, which are LOCKED, and the one batch already written, which is PASSED and here only for tone. |
| 4 | The methodology page | 29 | 29 | 0 | The published account of how the instruments work. Mostly PART-LOCKED: it quotes cited documents word for word and a test verifies the quotations, so the writing to be done is the connective prose around them. |

Ids are prefixed by batch: `VOC-`, `PAGE-`, `INS-`, `MET-`. Find your batch in `docs/copy-deck.md` by that prefix.

## The voice

Hume's examiner: wry, well-read, amused, precise, never cruel. The barb lands on the measured datum, never on the person — which is D1 restated as a tone. The product is allowed to be funny about a number and is never allowed to be funny about a listener.

Two failure modes it has actually shipped, both worth watching for. **Beige chrome:** "Your results are ready." A result screen that sounds like a form submission has wasted the one moment the reader is paying attention. **Flattery in place of a measurement:** when an instrument cannot produce a number it must say so plainly and say why, and must not convert the failure into a compliment about the person.

