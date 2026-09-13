# Commission — batch 4, the methodology page

**Hand this to Cowork verbatim, with `docs/copy-commission.md` and `docs/copy-deck.md` attached.**
Written by engineering (E20/S4). Nothing here restates the brief; it is the covering note that says
which batch, under which protocol, and what changed since batch 3.

---

## The message

> This is batch 4, the last batch, of the copy commission for a listening-instrument product called
> the taste gym.
>
> **Read `docs/copy-commission.md` first.** It is the brief: what the product is, the two rules that
> are not style (D1, no claim about the person; N3, no cohort and no percentile, because there are
> zero real respondents), the voice, and how to hand the work back.
>
> **Your batch is `docs/copy-deck.md`, Part 4 — "The /method page". Find it by the `MET-` id
> prefix. 36 ids: 4 OPEN and 32 PART-LOCKED.** It is one page: the published account of how this
> project is run, told as what it refused and what each refusal cost.
>
> **This batch is mostly PART-LOCKED, and that is the whole character of it.** A PART-LOCKED block
> contains a passage quoted from a cited document, and a test opens that document on every run to
> check the words are still there. The prose around the quotation is yours; the quotation is not.
> Each block now names its verified words **per field**, so you can see exactly which string in it
> is carrying them — that was fixed for this commission, because until now the list sat above two
> editable strings without saying which one it applied to.
>
> **The writing to be done is therefore connective prose**, and it is the hardest kind: a sentence
> that has to carry a quotation without sounding like a citation. The engineer's own note in the
> deck says this is usually the weaker half, and that is the half you have.
>
> **If a locked passage is what makes a sentence bad, say so.** The fix is to re-frame the prose
> around it or to drop the claim — never to silently reword the quotation. That path is real: it
> has produced product changes twice in this commission.
>
> **One distinction on this page is more consequential than any sentence.** Blocks marked QUOTED
> present the record speaking. Blocks marked INFERRED are the engineer's reconstruction of the
> owner's reasoning and render under a visible label. The page was approved on the condition that
> the difference stays visible. A rewrite that blurs which is which breaks that condition, whatever
> it does for the prose.
>
> **Do not read the source.** No `.ts`, `.tsx` or script files — the documents attached to this
> message are yours; it is the CODE that is closed. This is your own protocol from batch 1.
>
> **Keep a log.** Every moment you reach for source and stop: the id, and what you wanted to know.
>
> **The prediction, registered before you start.** Batch 2's log was seven slot questions and zero
> adjacency. Batch 3 was given real slots first, and so was this one. So: **the slot class should
> be near zero in both, and what remains here should be about the QUOTED/INFERRED boundary** — which
> words you may touch — rather than about what a string is. If this log is full of slot questions
> again, the fix did not work.
>
> Return format is in the brief: one id, one line, only the sentences you changed.

---

## What changed since batch 3, and why it matters to this batch

- **Part 4 is 36 of 36 source templates**, measured by `scripts/deck-source-trace.mjs`. A day ago it
  was 18 of 29: one line was in no source file, three the tool could not see, and seven blocks glued
  two source strings under one id.
- **The page's own framing prose left the component.** The kicker, headline, both opening paragraphs
  and the closing line were written into JSX and hand-typed a second time into the exporter, which
  had already drifted — the deck printed the closing line with its date resolved. They now live in
  `src/content/method/prose.ts`, which the page renders and the voice gate reads. Those five strings
  had never been through the voice gate at all.
- **The seven glued pairs are fourteen ids.** A refusal is a `refusal` field and a `price` field; a
  finding is a `finding` and a `consequence`. They read as one paragraph on screen, so the joined
  form is still shown — but as a rendering, not as a third editable string.
- **A test refuses any regression.** No id'd line in Parts 2 or 4 may be a rendering, a glued pair or
  a hand-typed line, and the id counts are pinned so a lost handle cannot pass silently.

## What this batch still cannot give you

- **The page itself.** Read `/method` alongside the deck. The deck gives numbered handles; it is not
  a substitute for seeing the page, and the order blocks appear in is fixed by a direction document
  rather than by the deck.
- **Part 3 was commissioned without this fix** and could not get it: its copy is written inline in
  JSX, which the extractor cannot parse. Batch 2's return is in `docs/copy-return-PAGE-2026-09-07.md`
  and its log is the evidence for what that cost.
