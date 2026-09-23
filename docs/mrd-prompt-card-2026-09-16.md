# MRD — the readable output · Standard of Taste · 2026-09-16

**Status: RULED 2026-09-16, awaiting the amendment in §6.1. TO BE TRACKED** per RT-Z6(a) — this is a
public document, deliberately, because the position taken here is part of what the repository is for.
It contains market claims, and a repository whose public page publishes its refusals cannot absorb a
file full of unsupported ones. The PRD already solved that: every use case there carries **EVIDENCED**
or **ASSUMED**. The same labels are used below and they are load-bearing — **6 EVIDENCED, 11 ASSUMED**.
A reader is entitled to see which is which, and the ratio is the point rather than an embarrassment.
**The count is not typed.** `src/content/mrd-labels.test.ts` recounts the labels on every run and
fails the build if this sentence and the claims below it disagree, if a claim loses its label, or
if a new section of the position arrives carrying none.

**Rulings of record, 2026-09-16.** RT-Z5 **(b)** — the readable output speaks about the person; §6 is
rewritten to the ruling and now specifies the amendment it requires. RT-Z6 **(a)** — tracked, labelled.
RT-Z7 **(b)** — the card sits beside the threshold readout, not instead of it. RT-Z8 **(a)** — generic
text, no tool named.

**What this is.** The document the repository does not have. There is a constitution, a four-part PRD,
a method page, a falsified-hypotheses registry and 78 design documents — and nothing that says who
this is for and why they would want it. A reader can currently see that the project is rigorous and
cannot see what it is *for*.

**What this is not.** A plan, a schedule, or a growth proposal. No dates appear in it. Nothing in it
asks for users to be recruited.

---

## 1 · The position

**How a claim is marked.** A **claim** here is an assertion about the world outside this repository —
the market, the tools, or the people who use them. Every one of them is numbered and labelled in
place, so a reader never has to work out which sentences are load-bearing. Labels were assigned in
E21 by reading the document; where a label is arguable, the argument is written underneath it.

### 1.1 The insight

**M1 · ASSUMED — Taste is legible, and nothing in the software people use treats it that way.**

Recommender systems model taste as a point in a space nobody can read — a neighbourhood of users, a
vector, a set of weights. That representation is excellent at predicting the next play and useless
for every other purpose a person might have for knowing their own taste. **M2 · ASSUMED — There is no
software artifact about your taste that a human can read, disagree with, or argue about.**

*Why M1 and M2 are ASSUMED.* No study is cited. The claim is checkable against any consumer music
product, and it has never been put to a user of this one.

### 1.2 The assumption being challenged

**M3 · ASSUMED — That taste is your history. It is not; it is your current discrimination and your
intent.**

**M4 · ASSUMED — Every deployed system infers taste from what you have already consumed.** That
inference is backward-looking by construction and it fails in the one situation that now matters
commercially: a person sitting in front of a generator, trying to make something that **does not
exist yet**. Past consumption cannot tell a model what you are reaching for. **M5 · ASSUMED — What
you can currently hear, and what you are trying to make, are different quantities from what you have
already played, and only the first two are any use at the moment of creation.**

*Why M3, M4 and M5 are ASSUMED, and M5 is the load-bearing premise of this whole document.* If it is
wrong — if history is a sufficient proxy for creative intent — the product has no reason to exist and
the existing recommender stack already covers the ground.

### 1.3 The unmet demand

**M6 · EVIDENCED — People cannot describe the sound they want, and the tools they now use require
exactly that.**

This is the only part of the position with outside evidence, and it is stronger than expected.

**M7 · EVIDENCED — Text-to-music generators take prose as their interface.** A Suno style prompt in
2026 is 8–15 comma-separated tags across genre, mood, vocal character, instrumentation and
production, and it accepts qualitative production language directly — *lo-fi tape hiss*, *warm analog
production*, *gated reverb drums*, *dry and close-mic*. The interface is words, and the words are
about timbre, timing and mix.

**M8 · EVIDENCED — The published prompt guides converge on the same two failure modes:**

- **Over-vagueness.** People type *rock* where the tool needs *indie rock, garage rock*.
- **Naming an artist does not work.** Guides tell users they must instead **decompose the sonic
  fingerprint** into descriptors.

**That second line is this project's thesis restated by somebody else.** The documented number-one
obstacle to using the most widely used AI music tool is that people can only name artists and cannot
decompose what they actually respond to. *People cannot describe their taste* is not a hunch here.
It is the stated user failure of the adjacent product category, which is what M6 rests on.

**M9 · ASSUMED — Somebody would pay attention to a measurement-derived fix for that failure.**

*Why the split.* M6, M7 and M8 are EVIDENCED: the interface and the two documented failure modes are
checkable against the published guides of the adjacent product category, and M6 is their
restatement. M9 is ASSUMED and nothing in this document supports it — it has never been put to a user
of this one.

### 1.4 The correction to the demand claim, because it is narrower than it looks

**M10 · EVIDENCED — The market is not empty. It is saturated with generic help.** There are prompt
guides, 100+ prompt libraries, style-tag encyclopedias. What none of them is, is **derived from what
*you* can actually hear.** Every existing aid is a list that is the same for everybody.

So the wedge is not *nobody helps people write prompts*. It is: **M11 · ASSUMED — all existing help
is generic, and the only non-generic input — what this person demonstrably discriminates — is not
being collected by anyone.** That is narrower, defensible, and it is the sentence to defend in an
interview.

*Why M11 is ASSUMED where M10 is not.* M10 says a corpus of generic aids exists, which anyone can go
and look at. M11 is a claim about everything that does **not** exist — a negative universal — and no
survey of the field has been done here.

---

## 2 · Who it is for

**M12 · ASSUMED — The person sitting in front of a generator with an intention and no vocabulary.**
Concretely: someone making music with AI tools for a game, a video or a film cue, who can hear that a
render is wrong and regenerates blind because they cannot name what is wrong.

**M13 · EVIDENCED — One data point exists and it is unfavourable.** The one person actually asked
said the premise does not hold for them. It is recorded in the README and it stays recorded. *One
conversation is not research, and a disconfirming one is not a refutation either — it is a single
observation pointing the wrong way, and it is on the record precisely so it cannot be forgotten.*

---

## 3 · The job to be done

> *I can hear that this render is wrong. I do not have the words. Give me the words, in a form I can
> paste into the box I am already looking at.*

Note what the job is **not**: it is not *tell me who I am*. See §6.

*[SUPERSEDED IN PART 2026-09-23 — see §11. This job statement narrowed the product to damage
vocabulary and left out the owner's thesis; §11 restores it. Kept verbatim per the keep-intact rule.]*

---

## 4 · The deliverable — the prompt card

**The product currently ends in a number in cents. Nobody wants a number in cents.** The number is
evidence. It has been mistaken for the deliverable for three months, and that single confusion is why
the prototype is neither fun to try nor convincing to look at: **it is a well-built measuring
apparatus whose readout nobody would keep.**

The deliverable is a short, human-readable text block, generated deterministically from what the
listener actually discriminated, written in the vocabulary a generator accepts, and designed to be
copied.

**RT-Z7(b): the card does not replace the threshold readout, it sits above it.** The reasoning on file
is that with no real user flow to optimise, a reader arriving at this product should see everything it
can do. That is right for the audience this product actually has. **The ordering still carries the
diagnosis**: the card first, the number below it, the expert view unchanged. Both are shown; only one
of them is the deliverable.

### 4.1 The mapping, which already exists and has never been used

The three flaw families the gym measures are, almost exactly, three of the five axes a Suno prompt
carries. This is not a stretch; it is a coincidence the project has been sitting on.

| Measured here | In physical units | The prompt axis it speaks to |
|---|---|---|
| Pitch drift | cents of detune | tuning character, pitch stability |
| Timing smear | ms / % tempo deviation | groove, timing feel, tightness |
| Compression damage | kbps | mix aesthetic, fidelity, production polish |

And the threshold adds the thing no generic prompt guide can have: **how finely this person
discriminates on each axis — which tells them which tags are worth spending, and which are wasted.**

### 4.2 Worked example — **ILLUSTRATIVE, the figures below are invented for shape**

> **What your ear separates.** Tuning, finely — you held the distinction down to a small fraction of a
> semitone. Timing, less so; the takes had to drift a long way before you called it. Compression,
> reliably at moderate damage.
>
> **What that is worth in a prompt.** Spend tags on tuning character and pitch stability; you will hear
> whether the generator obeyed. Do not spend tags on micro-timing feel — at your current threshold you
> would not be able to tell whether it worked. Mix fidelity is worth one tag, not three.
>
> **Paste this:** `clean intonation, stable pitch across the take, natural timing, warm analog
> production, moderate compression`

**Every sentence in that card is about the performance.** None of it is about the person. It is
evocative without being diagnostic, and that is the craft target.

### 4.3 What makes it the right shape

- **It is the only artifact in the product anyone would want to keep.**
- It has a use outside the product, which nothing else here has.
- It is shareable without being a leaderboard, a streak, a rank or a score — so it does not touch the
  anti-clone clause.
- It is generated by templates from a deterministic engine, which is the discipline already in place.
- **It requires no fifth instrument.** See §5.

---

## 5 · Why the three months are the moat, not a sunk cost

Nothing built is discarded. This is the list, because the fear that three months is being written off
is the reason this section exists.

| Already built | What it becomes |
|---|---|
| Four instruments | The measurement layer. The card is their readout |
| Thresholds in physical units | The one non-generic input no prompt guide can have |
| The creator vocabulary (three families, symptom + mechanism) | The card's word list, already written and already reviewed |
| Templates-not-generated-prose | The card is assembled, not hallucinated — which is why it can be trusted |
| The deterministic engine | Computes the card; the model never writes a verdict |
| Seven published refusals · `/method` | The reason to believe the card is not flattery |
| The noise-floor rule | Stops the card claiming a discrimination the session cannot support |
| Device-local history | The card can change as the ear changes |

**The instruments were never the product. They were the input to a product that was never built.**

---

## 6 · The constitutional collision — RULED (b), and what the ruling requires

**RT-Z5 is ruled (b): the readable output may speak about the person** — experiences, emotion, what
the reader has lived with. The recommendation on file was (a) and it was overridden deliberately,
which is the correct way for a product decision to go when the decision-maker disagrees with the
engineering recommendation.

**That ruling repeals part of D1, and D1 is the spine of this constitution.** It is why the $3.99
personality quiz was killed and it is what the live product currently mocks in its own copy — *five
taps, a verdict, and no measurement behind it*. A repeal of that size cannot be taken silently. Three
things follow from it, and none of them is optional.

### 6.1 The amendment, which must be recorded before any card copy is written

**Proposed text, which is my reading of (b) rather than the ruling itself — correct it if the scope is
wrong.** The cleanest form of (b) is a *scoped* relaxation rather than a global repeal:

> **D1 stands, unchanged, for every instrument readout.** The Prestige, Delicacy, Threshold and
> Ranking results remain statements about performance and nothing else; relaxing D1 there would
> collapse the measurement claim the whole product rests on.
>
> **D1 is suspended for one named surface: the prompt card.** On that surface the product speaks to
> the reader about what the reading might mean for them. The surface says so on itself.

A scoped suspension is better than a blanket repeal for a reason that is not squeamishness: **the
instruments have to stay clean or the card has nothing to stand on.** A card that speaks about the
person is only interesting because the measurement under it does not.

The constitution is append-only. The old D1 is stamped and kept, not deleted.

### 6.2 The price, which goes on `/method`

The product can no longer say that every sentence it shows is about performance. That is a real loss
and it belongs on the refusals page — **as the first entry of a different kind: not a feature refused,
but a constraint deliberately relaxed, with what it bought and what it cost.** A page of seven
refusals that then admits one reversal is more credible than a page of eight refusals, and this
project has already established that it keeps reversals visible rather than deleting them.

### 6.3 The one line I am still holding, and it is narrow

*Hint* is the word in the original ambition and it is the right one. **There is a difference between a
product that offers a reading and a product that asserts a diagnosis**, and it is the difference
between these two sentences:

- ✗ *You have unresolved loss.*
- ✓ *You chose the take with the slower decay every time — the one that lets the room finish speaking.*

The second still speaks to the person. It is warmer than the first, it is more affecting, and it
claims nothing the session cannot support. **(b) is fully served by the second form**, so the design
constraint that survives the ruling is not *stay off the person* — it is **offer, do not assert.**

The narrow carve-out I would keep, and it is the only one: **no assertion about trauma, abuse, or
mental health.** Not on D1 grounds, which are now suspended here, but because that is the one class
where being wrong lands on somebody. Everything else the ruling opens — memory, attention, what
someone reaches for, what they sit still for — is fair, and is the interesting part anyway.

*If you want that carve-out gone too, rule it explicitly. It should not disappear by omission.*

## 7 · What this refuses, added to the seven already published

- **No causal promise.** The card does not claim it improves anybody's output. That is unmeasured, a
  guard already refuses five phrasings of it, and this is the sixth.
- **On the instrument readouts: no inference about the person.** D1, unchanged and unrelaxed there.
- **On the card: offer, never assert**, and no assertion about trauma, abuse or mental health (§6.3).
- **No leaderboard, streak, XP, points or badge.** The anti-clone clause, unchanged.
- **No comparison between people.** N3, unchanged. The card describes one ear and says so.
- **No generated prose.** Templates, assembled deterministically, as everywhere else.

---

## 8 · How this would be judged, by controllability

**Tier 1 — controllable gates.** Binary, and entirely within reach.
- [ ] A card renders from a real sitting, with every sentence traceable to a measured quantity.
- [ ] A card exists that a reader could paste into a generator without editing.
- [ ] The no-causal-promise guard covers the card's templates.
- [ ] RT-Z5 ruled and the ruling published on `/method` with its price.

**Tier 2 — evidence thresholds.** Honest magnitudes, reachable without recruiting anyone.
- The card survives the author's own use: pasted into a generator, and the result is judged against
  what the card predicted would be audible. **n = 1, labelled n = 1.**
- Every claim in the card fails the build if the quantity behind it moves.

**Tier 3 — external signals.** **Deliberately not pursued.** No distribution question is reopened
here. If anybody ever uses it, that is weather.

---

## 9 · Out of scope

- A fifth instrument. The four measure enough; the failure was never measurement.
- Accounts, a hosted database, or any privacy surface.
- Integration with any generator's API. **The card is text. Text is the integration**, and per
  RT-Z8(a) no generator is named on the page, so the card does not age when the tools change.
- Any claim that this makes better music.

---

## 10 · == DECISIONS NEEDED ==

```
ALL FOUR OPENING DECISIONS ARE RULED (2026-09-16), recorded here and to be copied into
docs/rt-answers-*.md, which is tracked, because a ruling only a local file can see is a
ruling a fresh clone cannot.

[RT-Z5] RULED (b) — the readable output speaks about the person.
        Recommendation on file was (a); overridden deliberately by the owner.
        REQUIRES: the scoped amendment in section 6.1, the /method entry in 6.2.
        The amendment text in 6.1 is engineering's reading of (b) and needs confirming.

[RT-Z6] RULED (a) — tracked, every market claim carrying EVIDENCED or ASSUMED.
        Rationale on file: the position taken here is itself the portfolio evidence.

[RT-Z7] RULED (b) — the card sits beside the threshold readout, not instead of it.
        Rationale on file: with no real user flow, a reader should see every feature.
        Engineering note: ordering still matters — card above, number below.

[RT-Z8] RULED (a) — generic text, no generator named.

STILL OPEN:

[RT-Z9] Is the section 6.1 scope right — D1 suspended for the card ALONE, or relaxed
        product-wide?
        Severity: BLOCKER for Track T   Serves: D1, RT-Z5(b)
        (a) card only; instrument readouts keep D1 intact   <- recommendation
        (b) product-wide
        NO DEFAULT. This is the one-way door inside a ruling already taken.

[RT-Z10] Does the trauma / abuse / mental-health carve-out in section 6.3 stand?
        Severity: SHIP-RISK   Serves: section 6.3
        (a) it stands — the card offers, and stays off that class   <- recommendation
        (b) removed
        Default if silent: (a). It should not disappear by omission.
== END DECISIONS ==
```

---

## 11 · Revision (2026-09-23) — the insight this document left out

**Why this section exists.** This MRD was written by engineering on 2026-09-16 and it narrowed the
product to one job: turn measured damage into prompt vocabulary (§3, *"not tell me who I am"*). The
owner's thesis — stated in the product spec, `vibe_check_mvp_spec.md` §9, and restated by the owner
on 2026-09-23 — is wider, and the prompt card built on this document carries only its narrow half.
The owner's rulings of 2026-09-23 (RT-4 c, RT-5 a, RT-6 a) restored the snack as a second surface
that may speak about the reader and commissioned a reading built from the thesis. This section
states that thesis as a position, with the same labels as the rest of the document.

### 11.1 The insight: taste carries feeling

**M14 · EVIDENCED — Music preferences carry real but modest, probabilistic cues about emotional
state and personality.** The spec cites Rentfrow & Gosling (2003) and Rentfrow, Goldberg & Levitin
(2011), and keeps the caveat in writing: effects are *real but modest*, samples skew Western,
replication is imperfect. *EVIDENCED because it rests on published work anyone can read; the
citations were not re-read for this revision, and that is recorded rather than implied away.*

**M15 · ASSUMED — Recent taste reads current state; durable taste reads the stable self.** The
spec's timescale split (P4). It is the owner's "what is going on lately in their life", and it is
also why the product does not claim that only present taste matters: the split is the claim.

**M16 · ASSUMED — The gap between what a person's taste reveals and what they consciously know is
where new insight lives.** The spec's P3. It is the reason a reading is worth having: it says
something the reader did not already have words for.

### 11.2 The demand, restated with the feeling layer

**M17 · ASSUMED — People want a readable account of what their taste has been saying about them —
one they can argue with — and a way to turn it into music about their own life.** This joins M2 (no
readable, arguable artifact about taste exists) to the owner's ambition. The job, restated: *tell me
what my taste has been saying lately, in words I can argue with, and give me a prompt for music
about it.*

### 11.3 The constraints the reading inherits

- **Offer, do not assert** (RT-Z5 b; MRD §6.3), and **no assertion about trauma, abuse or mental
  health** (RT-Z10 a, reaffirmed by RT-6 a on 2026-09-23).
- **Suspension is by name.** The reading is not covered by the snack's amendment; it is named in the
  constitution when it ships.
- **N3.** A reading is not a measurement and does not present itself as one; the instruments'
  thresholds may feed it, and are cited in their own units when they do.

### 11.4 The build, pre-registered — each slice with its proof, before any code

| # | Slice | Done when |
|---|---|---|
| R1 | **The state questions.** A few taps on what the reader has been reaching for lately (the LATELY lane), deterministic, no model. | Every answer path maps to a state reading; a test enumerates them. |
| R2 | **The reading, assembled.** Templates join the state lane, the stable lane, and any instrument thresholds the reader has, in the offer register. The engine computes; templates render. | Rendered for at least three contrasting answer sets; the register and carve-out checks pass on every template, each proved by a planted specimen. |
| R3 | **The prompt.** The reading ends in a prompt for music about what it described, in generic generator vocabulary (RT-Z8 a). | Every reading produces a prompt; no generator is named. |
| R4 | **The surface, named.** A route, named in the constitution's "Named routes" line, with its on-surface statement. | `site-d1.test.tsx` reads the new route from the constitution; the reading's statement is derived from it. |

**Two questions only the owner can settle, recorded rather than guessed:** whether the reading
draws on the snack's answers, the instruments, or both; and whether "discussing" the reading means a
conversation with a model — which today's rule, *the model never writes an assessment*, would have
to be amended to allow.

