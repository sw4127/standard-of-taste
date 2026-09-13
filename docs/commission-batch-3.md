# Commission — batch 3, the instrument copy

**Hand this to Cowork verbatim, with `docs/copy-commission.md` and `docs/copy-deck.md` attached.**
Written by engineering (E20/S6) so the PM does not have to compose it. Nothing here restates the
brief; it is the covering note that says which batch, under which protocol, and what changed since
batch 2.

---

## The message

> This is batch 3 of the copy commission for a listening-instrument product called the taste gym.
>
> **Read `docs/copy-commission.md` first.** It is the brief: what the product is, the two rules that
> are not style (D1, no claim about the person; N3, no cohort and no percentile, because there are
> zero real respondents), the voice, and how to hand the work back.
>
> **Your batch is `docs/copy-deck.md`, Part 2 — "The instrument copy". Find it by the `INS-` id
> prefix. 49 ids: 27 OPEN, 14 LOCKED, 8 PASSED.** It is the smaller copy around the instruments —
> the Prestige result's title, the delicacy flaw line, the creator vocabulary that names three kinds
> of audio damage, and the one-sentence refusal to score anyone against a critic.
>
> **Two states in this batch are not OPEN, and the reasons are not about taste.** The fourteen clip
> blurbs are **LOCKED**: a blurb is the Prestige Test's independent variable, the prestige cue whose
> effect the instrument measures, so editing one is a pool change that invalidates every stored
> response and every share link keyed to the pool version. The delicacy readout is **PASSED** —
> you wrote it in August under ruling RT-107a and it shipped. It is included for tone, and if it now
> reads worse than the rest, that is worth saying.
>
> **What changed since batch 2 is the thing your own return asked for.** You wrote: *"What Part 3
> needs instead is the thing Part 1 got: templates read from source, with real slots. Entries 1–4
> and 6 would all have been answered by that and by nothing else."* Part 2 now has it. Every one of
> the 49 blocks is the string as the source file writes it, with `${…}` marking the values the
> engine fills. **Leave every slot exactly as it is** — you may move one within a sentence, you may
> not turn it into words. Two of them are why this matters: `${FAMILY_LIST}` renders three flaw
> family names today, and `${countWordCapitalised(machineCount)}` said *three machines* last month
> and says *four* now.
>
> **Do not read the source.** No `.ts`, `.tsx` or script files — the documents attached to this
> message are yours to read as much as you like; it is the CODE that is closed. This is your own
> protocol from the batch-1 return and it is adopted.
>
> **Keep a log.** Every moment you reach for source and stop: the sentence id, and what you wanted
> to know. The batch ships either way. The log is the measurement.
>
> **The prediction, registered before you start and falsifiable by you.** Batch 2's log was seven
> slot questions and zero adjacency, which falsified the previous prediction. Batch 3 has been
> given real slots, so the prediction is: **the slot class collapses to near zero, and what remains
> is about ADJACENCY and NON-TEXT** — what a sentence sits next to, and what renders beside it that
> a deck of strings cannot show you. If the log is still dominated by slot questions, the fix did
> not work and that is the more useful result.
>
> **One known gap, stated rather than discovered.** Six strings in this batch are below the deck's
> 40-character id floor and carry no id — three front-door labels and three FAQ questions. Each is
> marked where it appears. If one of them is what is wrong, name it in prose.
>
> Return format is in the brief: one id, one line, only the sentences you changed. If a RULE is what
> makes a sentence bad, return the id with `RULE:` and say which constraint is doing the damage —
> that path produced two product changes in batch 1 and is not a formality.

---

## What changed since batch 2, and why it matters to this batch

Batch 2's return said the brief stands alone for prose and not for anything with a number in it.
This batch is the one with the numbers in it, so that gap was closed before commissioning rather
than logged again.

- **Part 2 is 49 of 49 source templates**, measured by `scripts/deck-source-trace.mjs`, which asks
  of every id whether a source string produces it. This morning nine ids showed a RENDERING with the
  slots filled in, four glued two source strings under one id, and three were in no source file at
  all.
- **Two of those three were dead copy.** The `NotBuiltYet` panel's component was deleted on
  2026-09-02 when the fifth criterion got an instrument. Its sentences stayed in the deck for eight
  days because that section was hand-typed into the exporter. Batch 3 would have bought a rewrite of
  two sentences that render nowhere and contradict a live page.
- **The generator now refuses to build** a block with no unique source string behind it, so the
  class cannot come back by the route it came the first time.
- **The readout's six score-branches are three templates**, each labelled with the scores that reach
  it, rather than six near-identical paragraphs to rewrite five times over.

## What this batch still cannot give you

- **Layout, order and non-text.** The deck names what renders alongside each surface where the
  exporter can compose it from the array the product runs, and states it by hand where it cannot.
  It is still a list of strings: no chart, no table, no spacing, no typography.
- **Part 3 and Part 4 are not fixed.** Part 4 (batch 4, the methodology page) has one hand-typed
  line and seven glued pairs. Part 3's copy lives inline in JSX, where the census cannot see it.
  Neither is in this batch, and neither claim is being hidden.
