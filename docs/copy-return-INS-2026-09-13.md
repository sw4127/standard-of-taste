# Copy return — batch 3, Part 2 · The instrument copy (INS-)

Written against `docs/copy-commission.md` and `docs/copy-deck.md` Part 2, one snapshot, repository closed.
**14 of the 27 OPEN ids changed. 13 left alone.** The 14 LOCKED blurbs were not touched and no slot was resolved.

---

## A disclosure that has to come first, because it contaminates the measurement

**I have seen this product rendered, in this session, three days ago.** Not the source — the live
deployment. I opened `/`, `/bias`, `/lab` and `/method` in a browser, walked the first screen of the
Prestige Test, and measured the layout. That was a different commission and it happened before this
one arrived, but it is knowledge the deck did not give me, and **the question this batch exists to
answer is whether the deck stands alone.**

Three returns below are affected, and they are marked **[SAW IT]** where they appear:

- `INS-RESULTTITLEFRAGMENT-01` — I know the flow says *names*, because I read the page, not the deck.
- `INS-CREATOR-VOCABULARY-14` and `-15` — I know how the lead and the hint sit on the front door.

**Discount those three when scoring the log.** The other eleven came from the deck alone. This is the
same refusal as batch 1: a measurement I cannot clean, reported rather than quietly kept.

---

## The changes

```
INS-RESULTTITLEFRAGMENT-01
> ${pct > 0 ? "+" : ""}${pct}% toward the names
```
**[SAW IT]** The product calls them *names* to the listener and *labels* in the title — the one surface
that arrives with no context is the one using the word the listener was never taught. One thing, one word.

```
INS-FLAW-LINE-01
> Catching is one skill and naming is another. Of the pairs you caught, you named the flaw
```
The deck says this line reports the harder of two skills; the reader was never told there were two. Also
retires the `And` opener, which read as an afterthought under a band that had just done the arithmetic.

```
INS-CREATOR-VOCABULARY-02
> The whole take slides out of tune while it plays. It starts where it should and ends somewhere else, so what is wrong is never a note — it is a slope.
```
The symptom above it already says *nothing you can point at is off-key*; the mechanism said the same
thing again in different words. `-04` keeps the no-single-instance construction, which is cleaner there.

```
INS-CREATOR-VOCABULARY-03
> It feels rubbery and unanchored. The groove will not lock, however much you nudge the drums.
```
*However hard the drums are pushed* is not a thing anyone does. Nudging is, and it is this audience's verb.

```
INS-CREATOR-VOCABULARY-04
> The beat wanders off the grid and back again in slow waves. No single hit is late enough to notice on its own; all of them together are.
```
*The pattern of them is* was the clumsiest clause in the set.

```
INS-CREATOR-VOCABULARY-07
> You can hear that a render is wrong and have no word for it. This page is the word: three kinds of damage the gym can measure, what each one sounds like, and the machines that find how small a dose you can still catch.
```
*That is the gap this page closes* is a page talking about itself. **This page is the word** does the same
work and is the sentence the page is actually for. Dropped a dangling `of it`.

```
INS-CREATOR-VOCABULARY-08
> These three are what the pipeline can render as a controlled dose with a right answer behind it. They are not a list of everything that can go wrong with a piece of audio. A render can fail in ways nothing here measures, and this page would rather be short than pretend otherwise.
```
Only the first clause moved: *at the bottom of it* → *behind it*. See the wording note below. **The last
sentence is the best line on the page and is untouched.**

```
INS-CREATOR-VOCABULARY-10
> No. Nothing here listens to your files, and there is nowhere to upload one. What you get is the vocabulary, and nothing else: the names, and how small a dose of each one your own ears still catch.
```
It repeated `-07`'s three-item list almost verbatim, two screens apart on one page. The list belongs to the
intro; the FAQ answer should be shorter and blunter than the thing it is answering. *And nothing else* is
the honest half.

```
INS-CREATOR-VOCABULARY-11
> Because three is what the clip pipeline can render as a controlled dose with a right answer behind it: ${FAMILY_LIST}. Plenty of other things go wrong in a mix; they are absent because we cannot measure them yet, not because they do not matter.
```
See the wording note. *Other things go wrong in a mix* was flat where it needed to concede something.

```
INS-CREATOR-VOCABULARY-14
> Not a personality. Not a vibe. ${countWordCapitalised(machineCount)} machines, each measuring one thing Hume said a real judge needs: whether a famous name can move your ratings, whether your ears can catch damage when nobody tells you where it is, how small that damage can get before you lose it, and whether the gaps you hear fall where a critic's did.
```
**[SAW IT]** **This is the most important change in the batch and it is not a style edit.** The sentence uses
**move** twice, for opposite things. In the first item a famous name *moves your ratings* and that is the
failure the instrument is built to catch. In the fourth, *your ratings move where a critic's judgment moved*
— same verb, and now it reads as following him, on the front door, directly above the card for the one
machine that refuses to score agreement. The replacement names the contrast the Ranking Test actually
reports, and takes the collided verb out of the second half. Also `—` → `:`, because the four items are an
enumeration and the dash was doing a colon's job.

```
INS-CREATOR-VOCABULARY-21
> Hume retells it from Don Quixote: two of Sancho's kinsmen were asked to judge a hogshead of wine. One found a faint taste of leather, the other of iron, and both were laughed at — until the cask was drained and an old key on a leathern thong was found at the bottom. Their perception was real and verifiable, and that is delicacy.
```
**Factual.** In the essay the two kinsmen report *different* faults — one leather, one iron — and the key on
its leathern thong vindicates both independently. The shipped version merges them into one verdict, which
loses the reason the anecdote is evidence at all. **I am changing this from memory of the text and it should
be checked against the essay before it ships** — a name is a claim, not evidence, and that applies to me.

```
INS-CREATOR-VOCABULARY-22
> Public-domain and Creative-Commons recordings are damaged on purpose, by a known amount — ${FAMILY_LIST} — and you pick the original and name the flaw. Unlike a taste quiz, the answers are right or wrong, the difficulty is tunable, and the items can be calibrated with item-response theory.
```
*Altered with controlled degradations* is the pipeline describing itself. *Damaged on purpose, by a known
amount* is the same fact in words the reader already has. **`can be calibrated` is left as a hedge on
purpose** — with zero respondents it is the true tense.

```
INS-CREATOR-VOCABULARY-24
> They are machine 02, and the door is open. They were built after the Prestige Test, on the principle that a gym leaves its equipment in plain view long before anyone is ready for it. This one is no longer roped off.
```
**D1.** The shipped line ends *— and now you are*, which is a claim that this reader is ready, made by a
screen that has measured nothing about them. It is the friendliest sentence in the batch and it is the only
one that breaks the rule the batch is built on. Also retires *battery*.

```
INS-CRITICCONTRADICTION-01
> A product that measures how far a famous name moves your ratings cannot also give you credit for agreeing with a famous critic.
```
**Two things.** *On the same screen* is false: this renders on three reading-room pages and the Prestige
Test's screen is not one of them, so the contradiction it names is across the site, not on a screen. And the
old wording leads with *Rewarding you*, putting the reader in the sentence's subject position for a refusal
that is about the product. The new one is self-contained, which it has to be — it renders under three
different paragraphs and may lean on none of them. *Credit* rather than *points*, so it does not put a
forbidden word in the product's mouth even in refusal.

---

## A RULE return, because this one is a rule and not a sentence

```
INS-CREATOR-VOCABULARY-11
RULE: "Nothing may count" is enforced for machines and not for families, and this sentence is where it shows.
```

`${countWordCapitalised(machineCount)}` exists because *three machines* went stale and became *four*. The
family count has no such slot: **three** is typed as a word in `-07`, `-08`, `-11` and `-16`, and in `-11` it
is typed in the same sentence as `${FAMILY_LIST}`, which would render four names the day a fourth family
ships while the word beside it still says three.

**This is the machine-count failure one level down, and it is already written.** The families are a shorter
list than the machines were and they have moved less, which is why it has not bitten yet — that is luck, not
design, and `-08` exists precisely because three named flaws read as *the flaws*.

**I have not resolved it**, because a family-count slot is a product change and not a copy edit, and because
the fix may be the opposite one: freeze the count deliberately, state in `-08` that the number is fixed by
what the pipeline can dose rather than by what exists, and let a fourth family be a deliberate edit to four
strings rather than a silent render. **Either is defensible. Typing it four times and hoping is not.**

---

## One wording, used twice — flag rather than decide

`-08` and `-11` now share **a controlled dose with a right answer behind it**, and they are both on
`/learn/flaws`. Before this pass the same claim appeared three times in three wordings: *a right answer at
the bottom of it* (`-08`), *an objectively correct answer behind it* (`-11`), *answers are objectively right
or wrong* (`-22`). **This project has already paid once for one refusal existing in four wordings.** One
wording is the safer failure, so that is what I did, and `-22` is left in its own words because it is on a
different page and is describing the trials rather than defending the count.

**If the echo reads badly on the rendered page, `-11` is the one to vary, not `-08`** — `-08` is
load-bearing and `-11` is an FAQ answer.

---

## The six strings under the id floor

Checked, and **none of them is what is wrong.** Recorded so the absence is a finding rather than a silence.

*Something sounds wrong.* is the best of the three front-door labels — it is the complaint before the word,
which is exactly the page it opens. *Snack.* is the funniest honest thing on the site and it earns
`-18`. *Reading room.* is plain and should stay plain. *Why only three?* and *How do the Delicacy Trials
work?* are the questions a reader would actually type. *What is the key-in-the-wine story?* only works
because `-20` plants the phrase one card earlier; it would be opaque alone, and it is not alone.

---

## The PASSED batch, since you asked

**It does not read worse than the rest. It reads longer, and that is the thing worth saying.**
`INS-DELICACY-DETECTION-04/05/06` are eighty-to-a-hundred-word paragraphs on a result screen, and they are
the only place in the product that explains its own statistics at length. They are good. They also set a
register nothing else in Part 2 meets, so a reader arriving at the Delicacy result from anywhere else meets
a different product for one screen. That is a layout and sequencing judgment, not a copy defect, and it is
not mine to make.

**One tension I will name and not resolve:** `-08`, the share line, ends *Think your ears are better?* N3
forbids the product comparing people. A share line does not compare anyone — it invites the reader to. The
distinction is real and it is also the thinnest one in the deck, and it is worth a ruling rather than a
habit, because it is the single sentence in this batch most likely to be quoted back at the project.

---

## The log — every moment I reached for source and stopped

**The prediction was registered as: the slot class collapses to near zero, and what remains is adjacency and
non-text. It holds, with one correction that matters.**

| # | Id | What I wanted to know | Class |
|---|---|---|---|
| 1 | `INS-CREATOR-VOCABULARY-01`–`06` | Whether symptom and mechanism render as two adjacent paragraphs under one flaw heading, or split across columns, tabs or an accordion. **If they are not adjacent, the repetition I removed from `-02` was never a repetition** | NON-TEXT |
| 2 | `INS-CRITICCONTRADICTION-01` | The sentence immediately above it on each of the three pages. My rewrite uses *a famous name*; if `/learn/comparison`'s own paragraph already says that, I have written an echo into the one string guarded for having exactly one wording | ADJACENCY |
| 3 | `INS-CREATOR-VOCABULARY-14` | How the four-item list breaks on the rendered page — one grey block, or four lines. It governs whether the fourth item can carry a subordinate clause | NON-TEXT |
| 4 | `INS-FLAW-LINE-01` | Whether the styled figure sits inline mid-sentence or is set on its own, and whether the assembled line wraps. I lengthened the prefix by a sentence and cannot see what that costs | NON-TEXT |
| 5 | `INS-CREATOR-VOCABULARY-19` | What sits directly above it on the **Threshold** result specifically. The deck says *shown on both* and prints the context of neither | ADJACENCY |
| 6 | `INS-CREATOR-VOCABULARY-24` | Whether the locked-state twin still exists, and whether it mirrors the clause I cut. A pair of sentences can drift apart when only one of them is in the deck | COVERAGE |
| 7 | `INS-RESULTTITLEFRAGMENT-01` | Whether any other surface says *labels*, so the change is one word in one place rather than half of a split | ADJACENCY |
| 8 | `INS-FLAW-LINE-01` | Whether the prefix string truly ends where the deck says it ends, or carries a trailing space the figure depends on | SLOT |

**One slot question in forty-nine ids, and it is about a space.** Batch 2's log was seven slot questions and
zero adjacency. **The fix worked.** `${FAMILY_LIST}` and `${countWordCapitalised(machineCount)}` produced no
questions at all — they were labelled, they were rendered, and I could see what they became.

**The correction: non-text is now the larger half, not adjacency.** Four of the eight are questions about
layout, sequence and rendering — things the brief already says an exporter will never carry, however good its
adjacency data gets. **So the deck has reached its ceiling, and the next increment is not a better deck.**

Entry 1 is the one that could have changed a sentence. Everything else would have confirmed or embarrassed
a choice already made.

---

## The one recommendation

**A screenshot per surface, beside the strings.** Not a description of what renders alongside — the frame
itself. The brief's per-surface *what this deck cannot carry* notes are honest and they are prose about
pictures, which is the shape of the problem rather than the fix. Four of my eight log entries would have
been answered by one image each, and entry 1 would have been answered before I made the edit rather than
after.

It is also the cheapest thing on this list: the product renders, and a writer who can see the page stops
asking the deck to be a page.
