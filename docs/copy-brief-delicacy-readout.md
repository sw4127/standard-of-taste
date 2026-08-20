# Copy brief — the delicacy detection readout

**Status:** out for a Cowork pass (PM ruling RT-107a, 2026-08-21). Claude Code drafted the
strings below; the PM rates CC's prose the weaker of the two tools, and the hazard gate
cannot judge register (RT-106a). Structure and numbers are settled and must not move.
Sentences are open.

**Where it goes:** the result screen of the Delicacy Trials, replacing six ranked verdict
tiers ("Sharp ears.", "The key in the wine.", "The village.").

**Why it is being replaced:** E6/S8 measured those six tiers placing a person in the right
one **30.5% of the time** at the shipping session length. No coarser cut rescues it — two
bands reach 70.2% against the 89.3% the Prestige Test's verdict manages. RT-90a already
ruled the general case for the staircase: report the band, never the point. A tier name is
a point estimate wearing an adjective.

---

## The one thing a reader must leave understanding

A two-way choice hands out half the score for free. **11 of 15 is 73% correct and 47%
detected**, and almost nobody knows that unprompted. Everything else is secondary.

The second thing, if there is room: fifteen pairs is a short session, so the answer is a
wide range rather than a number. **It takes 12 of 15 to clear chance at 95%.**

---

## Hard constraints

**Every number is computed at render time. None may be invented, rounded differently, or
dropped.** Available variables:

| Variable | Meaning | Example (13/15) |
|---|---|---|
| `nCorrect` | pairs called correctly | 13 |
| `nTrials` | pairs in the scored session | 15 |
| `chance` | expected score from guessing, `nTrials/2` — **can be fractional** | 7.5 |
| `margin` | `nCorrect − chance` — **can be fractional** | 5.5 |
| `lo`, `hi` | 95% interval on the guessing-corrected detection rate | 24%, 93% |
| `need` | smallest score that clears chance at this length | 12 |

**Do not** state a percentage without saying which percentage it is (correct vs detected —
confusing these is the whole problem). **Do not** compare the reader to other people: nobody
has taken this, so any percentile or cohort claim is a claim about people who do not exist.
**Do not** rank the person; describe the measurement. **Do not** promise a flaw is audible.

**Three traps already hit, all found by reading rendered output:**
1. `chance` is **7.5**, not 8. "A coin flip *calls* 7.5" is nonsense — a coin averages a
   fraction, it cannot call one. Same for `margin` ("5.5 above").
2. At 0–3 correct the interval **collapses to a point at 0%**. "Runs between 0% and 0%"
   is true and reads like a rendering bug.
3. `nTrials` is a variable. Do not write "fifteen" — the session length has already moved
   once and will again.

**It must read well at all 16 scores, 0 through 15**, not just the examples. Branch A covers
12–15, branch B covers 8–11, branch C covers 0–7.

---

## Voice

Hume's examiner: wry, well-read, amused, precise, never cruel. The barb lands on the
measured datum, never on the person. Full spec: `docs/voice-spec.md`.

PM's stated style (2026-08-21): *"plenty of word description and numbers combined with each
other"* — prose and figures woven, not a stat block with a caption. And: *"do not make it a
hoax for user or make them confused."*

---

## Current draft — replace the sentences, keep the job each one does

**TITLE** (one line, identical at every score; describes the measurement, does not rank)

> `{nCorrect} of {nTrials}. What that narrows it to.`

**BRANCH A — the interval clears chance** (scores 12–15)

> A coin flip averages `{chance}` of `{nTrials}`, so `{nCorrect}` sits `{margin}` above what
> luck alone returns. Take out the pairs you would have guessed right anyway and what is
> left — the flaws you actually heard — falls somewhere between `{lo}` and `{hi}` of them.
> A wide window, because `{nTrials}` pairs is `{nTrials}` pairs. But all of it sits above
> zero, and that is the part a coin cannot do.

**BRANCH B — ahead of chance, but not provably** (scores 8–11)

> A coin flip averages `{chance}` of `{nTrials}`, so `{nCorrect}` sits `{margin}` above what
> luck alone returns — and `{margin}` is not enough. Take out the pairs you would have
> guessed right anyway and the range that fits runs between `{lo}` and `{hi}`, which still
> touches zero. On `{nTrials}` pairs it takes `{need}` to pull clear of the coin outright.
> You may well hear more than nothing; `{nTrials}` pairs cannot say so.

**BRANCH C — at or under chance** (scores 0–7)

> A coin flip averages `{chance}` of `{nTrials}`. You called `{nCorrect}`, at or under what
> luck alone returns, so nothing is left once the lucky guesses come out — the range that
> fits runs between `{lo}` and `{hi}`. These `{nTrials}` pairs found nothing that separates
> your ear from a coin, which is a statement about `{nTrials}` pairs, and not yet one about
> your ear.
>
> *(when the interval collapses, scores 0–3, that middle clause becomes: "there is no range
> left to draw: it sits flat at `{hi}`")*

---

## What each branch has to accomplish

- **A** — the reader beat the coin; say so, and say how wide the answer still is.
- **B** — the hardest one. The reader is ahead and it means nothing yet. It must not read
  as a consolation prize or as a failure, and it must leave them wanting the longer session.
- **C** — honest without cruelty. The session found nothing; that is a fact about fifteen
  pairs, not a verdict on the person, and the last clause must carry that weight.

Return three branches plus a title. I wire them verbatim.
