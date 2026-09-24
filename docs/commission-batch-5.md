# Commission — batch 5, the surfaces a stranger reads first

**Hand this to Cowork verbatim, with the three files named below attached.**
Written by engineering (E20). Batch 5 is not like batches 1–4 and the difference is the point.

---

## Why this batch is different

Batches 1–4 came from `docs/copy-deck.md`: every sentence enumerated from the code that renders it,
each with an id, so an edit lands exactly. **These surfaces are not in that deck and should not be.**
They are long-form documents rather than assembled strings — a README, a standalone page, and the
three sentences at the top of the product — and batch 2 already measured what happens to the id
system on long-form prose: paragraphs are self-contained, adjacency stops mattering, and the ids buy
less than they cost.

So this batch is commissioned as **documents**, and what replaces the id system is the list of
load-bearing facts below.

**The other difference is who wrote them.** Every sentence in batches 1–4 was engineer-drafted and
most had sat for months. These three were written in the last two days, by the same engineer,
and two of them were written *after* the owner said the product was failing to communicate. They are
the least-tested copy in the project and the most-read.

---

## The message

> This is batch 5 of the copy commission for a listening-instrument product called **Standard of
> Taste**.
>
> **Read `docs/copy-commission.md` first** for the product, the voice, and the two rules that are not
> style: **D1**, never a claim about the person, only about what they did; **N3**, no cohort, no
> percentile, no comparison between people, because there are zero real respondents.
>
> **Your batch is three documents, attached. No deck, no ids — return edited prose.**
>
> 1. **`README.md`** — the repository's front door. A recruiter opens this first. It has a "Start
>    here" table routing readers by the time they have, a description of the instruments, and a
>    section on what the project refuses to claim.
> 2. **`docs/index.html`** — a standalone summary page, now published at
>    `sw4127.github.io/standard-of-taste`. Its prose is the `<p>` and `<li>` text; **leave the markup
>    and the CSS alone.**
> 3. **The product's first three sentences**, reproduced below. They are the top of the landing page
>    and the first thing any visitor reads.
>
> **The three sentences, verbatim** *(replaced 2026-09-23, blueprint Part 7: the reading became the
> product (BA-6), so the first and third sentences now introduce it. The explanation below this block
> describes the earlier pair and is kept as it was written; the new pair serve BP-INSIGHT and
> BP-UNMET in `docs/blueprint.md`. The third was rewritten 2026-09-24 by the Cowork copy return: it had
> said "your" month, and the month is an illustrative listener's.)*:
>
> > Your last month of listening holds a pattern you have probably never put into words.
> >
> > So does every algorithm that has ever recommended you a song. It just never tells you, because
> > what it knows about you is a row of numbers no person can read.
> >
> > Here a month of someone's listening is read back line by line, with the plays behind every
> > line. Keep what fits, reject what doesn't, and carry what is left into a prompt.
>
> **What these three are doing, so you can judge whether they do it.** The product measures what a
> listener's ears actually did — whether a famous name moved their ratings, how small a flaw they can
> still hear. The owner's insight is that the feeling of good music is the feeling of being
> understood, and that a recommender already has that understanding and never hands it over. The
> third sentence must keep the word *understanding* and must not promise more than the product has:
> it reports a number and a sentence about your own performance. **It does not tell you what music
> you like, and must never imply it does** — that instrument does not exist.
>
> **Do not read the source.** The three attached documents are yours to read as much as you like; it
> is the CODE that is closed. Your protocol from batch 1, still adopted.
>
> **Keep a log** of every moment you reach for source and stop.
>
> **The prediction, registered before you start:** batches 3 and 4 were given templates and the slot
> class collapsed to near zero. These documents have no slots at all, so the log should be about
> **audience and claim** — who a sentence is talking to, and whether it is allowed to say what it
> says. If it is about formatting or structure instead, the batch was mis-scoped and that is worth
> knowing.

---

## LOAD-BEARING — these must survive, and a test fails if they do not

This replaces the deck's id system. Everything not listed here is free prose.

**In `README.md`:**

- Six quantities, each stated in its own words: the Prestige clip count, how many carry a label, how
  many are drift controls, how many labels are swapped and out of how many, the scored Delicacy pair
  count, and the practice-trial count. **The numbers are derived from the code — do not change a
  digit**, and do not drop a sentence that carries one.
- The count of falsified-registry entries, and the clip count in the "Start here" table.
- **The audience disclosure.** The README names an audience — people making music with AI tools —
  and then says the claim is unvalidated, that one person has now been asked and said the premise
  does not hold for them. **That admission must stay, and must stay near the claim it qualifies.**
  It is the most important sentence in the document and the one most likely to be smoothed away.
- Every link. They are checked against the repository and the app's routes.

**In `docs/index.html`:**

- The Prestige clip count, in its own words.
- **Any sentence counting Hume's criteria must not understate them.** All five have instruments. A
  paragraph saying "three of the five" shipped for weeks and was caught the day before this batch.

**In the three sentences:**

- They pass a hazard gate screening five named failures: motive attribution, verdicts about the
  person, beige chrome, fabricated norms, and unmeasured audibility claims.
- The third must not promise words about a person's taste. That is an instrument this product has
  not built, and the front door already over-promises it if the sentence drifts.

## What this batch cannot give you

- **The rendered pages.** The README renders on GitHub, the summary page at the URL above, and the
  three sentences at the top of the deployed app. All three are public — read them there. This is
  the batch where that matters most, because two of the three are layouts as much as they are text.
- **Any evidence that the positioning is right.** The audience claim rests on a decision, not
  research. You are being asked to make the prose good, not to make the claim true.
