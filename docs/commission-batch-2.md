# Commission — batch 2, the pages

**Hand this to Cowork verbatim, with `docs/copy-commission.md` and `docs/copy-deck.md` attached.**
Written by engineering (E19/S10) so the PM does not have to compose it. Nothing here restates the
brief; it is the covering note that says which batch, under which protocol, and what changed since
batch 1.

---

## The message

> This is batch 2 of the copy commission for a listening-instrument product called the taste gym.
>
> **Read `docs/copy-commission.md` first.** It is the brief and it stands alone: what the product is,
> the two rules that are not style (D1, no claim about the person; N3, no cohort and no percentile
> because there are zero real respondents), the voice, and how to hand the work back. Everything you
> need about the sentences is in it.
>
> **Your batch is `docs/copy-deck.md`, Part 3 — "The page copy". Find it by the `PAGE-` id prefix.
> 74 sentences, all OPEN, none locked.** It is the reading room (nine `/learn` pages), the terms
> page, and the frame a listener reads before the Ranking Test starts. Long-form prose rather than
> one-line readouts, and the place a sceptical reader goes to decide whether any of this is serious —
> which makes it the batch where a bad sentence costs the most credibility.
>
> **Do not read the source.** No `.ts`, `.tsx` or script files — the two documents attached to this
> message are yours to read as much as you like; it is the CODE that is closed. This is your own
> protocol from the batch-1 return, and it is
> adopted: you refused to say whether the brief stands alone, because you had read the source modules
> before batch 1 and could not separate *this deck is sufficient* from *I already know what it leaves
> out*. Three of your twenty-four edits came from adjacency learned in source. Reading the deck again
> you would find those three from memory and credit the deck — a contaminated measurement, which is
> the failure this product refuses everywhere else.
>
> **Keep a log instead.** Every moment you reach for source and stop: the sentence id, and what you
> wanted to know. The batch ships either way. The log is the by-product and it is the actual
> measurement: if it is short and cosmetic, the brief stands alone; if it holds one item that would
> have changed a sentence, it does not.
>
> **The prediction, registered before you start and falsifiable by you:** the log will be dominated
> by ADJACENCY — what a sentence sits next to — and contain almost nothing about slots or coverage.
> A log full of slot questions falsifies it, and that would be the more useful result.
>
> Return format is in the brief: one id, one line, only the sentences you changed. If a RULE is what
> makes a sentence bad, return the id with `RULE:` and say which constraint is doing the damage —
> that path produced two product changes last time and is not a formality.

---

## What changed since batch 1, and why it matters to this batch

Batch 1 was returned against a deck with three defects in it. All three are fixed, and the fixes are
the reason this batch can be commissioned honestly.

- **Every section now states what renders alongside its sentences, in order.** For seven of the nine
  reading-layer surfaces that sentence is **composed from the array the product actually runs**, so
  it cannot describe an order the code does not have. For the two laid out in JSX it stays
  hand-written and the order is pinned by a test. This was your highest-value ask from the batch-1
  return.
- **Three claims in the deck were false and are corrected.** A block said it rendered on `/method`
  when it renders on `/learn/methodology` — a writer with the repository closed would have opened the
  wrong page to check their own copy. The expert panel was said to emit "a section per instrument"
  when it renders exactly one. The Brier sentence was said to sit "directly beneath" a chart that has
  a table under it. Three more were true but overstated adjacency and now name what is in between.
- **The deck no longer miscounts itself.** It gave a separate editable id to each *rendering* of a
  template, so one sentence appeared as six. It now mints **one id per template**; a further
  rendering carries the id it belongs to and says so. 223 editable sentences, from 236.

**Your `PAGE-` ids are unchanged by all of that**, verified by diff. So are `VOC-`, which is what
makes batch 1's applied return still valid.

## What this batch cannot tell you, stated in advance

The page deck is **scraped from the `.tsx` files that render it**, so unlike Part 1 it is keyed to
what a reader sees rather than to source templates. Two consequences:

- `{numberWord(CLIPS)}` and similar braces in these blocks are **real expressions in the page**, not
  an artefact. Leave them exactly as they are; you may move one within a sentence, you may not turn
  it into words.
- These pages carry **headings, links, lists and layout** the deck flattens into a sequence of
  blocks. Where a sentence seems to depend on something you cannot see, that is a real gap in the
  brief — log it, because that is exactly what the log is for.
