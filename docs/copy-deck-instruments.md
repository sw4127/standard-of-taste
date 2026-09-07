# Shipped instrument copy — deck for a writing pass

**Generated, do not edit by hand.** `node scripts/export-instrument-deck.mjs > docs/copy-deck-instruments.md`

The four batches recorded as awaiting a writing pass since 2026-08-26, plus a fifth added in E11 (2026-08-28). They had no brief and no deck, which is why nothing happened to them: a bullet in a handoff is not a queue. Every string below is live in the product today.

## How to use this

The engineer who wrote these is the weaker writer of the two on this project. Rewrite freely **within the rules listed under each batch** — those are not style preferences. Several are measurement constraints, and one of them makes an edit cost more than an edit usually costs.

If a rule is what makes a string bad, say so and it gets re-examined. Do not quietly drop one.

---

## 1. The clip blurbs — the Prestige Test's independent variable

**Where they render.** Under each clip in the LABELLED pass of `/bias`, beside the artist name.

**What they are.** Not description. A blurb is the prestige cue whose effect the instrument measures — the whole test is how far a rating moves when this sentence appears. A blurb that reads like marketing, or like a lie, weakens the measurement it is supposed to create.

**Rules this copy must keep:**

- **One sentence.** It is read between two ratings, under a clip the person has already heard blind.
- **Direction is fixed per item.** `up` must read as genuine acclaim; `down` as genuine dismissal. Reversing one changes what the instrument measures for that item.
- **Two of the fourteen are deliberately FALSE** (`swapped` below) — the sanctioned deception. Those blurbs travel with the FICTIONAL artist shown, never the true one, and every swap is confessed on the mandatory debrief. The fictional names are separately flagged as engineer drafts pending your C.1 pass.
- **Nothing a reader can falsify in ten seconds.** A caught lie ends the measurement for that session — they stop rating the sound and start rating the test.
- **No claim about the listener** (D1) and no comparison to other people (N3). These are about the work.

**EDITING A BLURB IS A POOL CHANGE.** `BIAS_POOL_VERSION` is 7 today, and it must be bumped for any relabelling. It rides in every share URL and every stored response, so old links stay interpretable against the exact pool that produced them. Rewrites are welcome; they are just not free, and they should arrive together rather than one at a time.

**The two control clips carry no label and no blurb at all** — they are shown unlabelled in both passes to measure plain re-listening drift. They are listed here only so the count makes sense.

### 1. `pb1` — shown as “J.S. Bach — Kimiko Ishizaka, piano (Open Goldberg Variations)”

- direction: DOWN (dismissal)
- label is TRUE
- earlier pool — shown for voice consistency

```
One of thirty variations, and not one of the ones anybody quotes.
```

### 2. `pb7` — shown as “Komiku”

- direction: DOWN (dismissal)
- label is TRUE
- earlier pool — shown for voice consistency

```
Written to be dropped into other people's games, and released by the album-load.
```

### 3. `pb3` — shown as “F. Chopin — Musopen Complete Chopin project”

- direction: DOWN (dismissal)
- label is TRUE
- earlier pool — shown for voice consistency

```
The nocturne recital programmers skip; even devoted Chopin listeners rarely defend it.
```

### 4. `pb9` — shown as “J. Suk — Musopen Kickstarter ensemble”

- direction: UP (acclaim)
- label is TRUE
- **one of the six named in the standing note** (added 2026-08-25)

```
Written in 1914 as a patriotic act, when Czech orchestras were forbidden the national anthem and played this instead.
```

### 5. `b3` — CONTROL, no label shown

Deliberately empty. Nothing to review.

### 6. `pb6` — shown as “Chris Zabriskie”

- direction: UP (acclaim)
- label is TRUE
- earlier pool — shown for voice consistency

```
Released into the open under a Creative Commons licence, and picked up by film and podcast makers ever since.
```

### 7. `pb10` — shown as “F. Mendelssohn — Musopen Kickstarter ensemble”

- direction: UP (acclaim)
- label is TRUE
- **one of the six named in the standing note** (added 2026-08-25)

```
His last completed work, written in the months after his sister died; the one piece where the polish drops away.
```

### 8. `pb2` — shown as “J.S. Bach — Kimiko Ishizaka, piano”

- direction: UP (acclaim)
- label is TRUE
- earlier pool — shown for voice consistency

```
From a recording project so admired it was placed in the public domain as a cultural gift.
```

### 9. `pb11` — shown as “Alexander Vane”

- direction: DOWN (dismissal)
- label is SWAPPED — fictional artist, deception disclosed at debrief
- **one of the six named in the standing note** (added 2026-08-25)

```
A student overture, wheeled out when an orchestra needs something short before the interval.
```

### 10. `pb8` — shown as “Jason Shaw (Audionautix)”

- direction: DOWN (dismissal)
- label is TRUE
- earlier pool — shown for voice consistency

```
Stock production music, written to be inoffensive; the audio equivalent of a waiting room.
```

### 11. `pb13` — shown as “Noé Calvet”

- direction: UP (acclaim)
- label is SWAPPED — fictional artist, deception disclosed at debrief
- **one of the six named in the standing note** (added 2026-08-25)

```
A minimalist study praised on year-end experimental lists for doing more with less.
```

### 12. `pb5` — shown as “F. Chopin — Musopen Complete Chopin project”

- direction: UP (acclaim)
- label is TRUE
- earlier pool — shown for voice consistency

```
Late-period Chopin at its most refined — the mazurka connoisseurs reach for when they want the form taken seriously.
```

### 13. `pb4` — shown as “L. van Beethoven — Musopen Kickstarter ensemble”

- direction: UP (acclaim)
- label is TRUE
- earlier pool — shown for voice consistency

```
The movement scholars point to when they argue early Beethoven was already looking decades ahead.
```

### 14. `pb14` — shown as “Jason Shaw (Audionautix)”

- direction: DOWN (dismissal)
- label is TRUE
- **one of the six named in the standing note** (added 2026-08-25)

```
Library music filed under jazz: the sound of the genre with nobody taking a risk inside it.
```

### 15. `b1` — CONTROL, no label shown

Deliberately empty. Nothing to review.

### 16. `pb12` — shown as “A. Borodin — Musopen Kickstarter ensemble”

- direction: DOWN (dismissal)
- label is TRUE
- **one of the six named in the standing note** (added 2026-08-25)

```
Overshadowed by the quartet he wrote next, whose slow movement became a Broadway song. This one did not.
```

---

## 2. `resultTitleFragment` — the Prestige result's name for your number

**Where it renders.** The browser tab title on `/bias/result` (as “… — The Prestige Test”), and the alt text of the share card image. It is the sentence that shows up in a bookmark, a shared link preview, and a screen reader.

**What the screen has already said.** Nothing — this is the title. The verdict copy and the number sit below it.

**Rules this copy must keep:**

- The sign matters and must survive: a negative number means ratings moved AWAY from the labels, which is a different result, not a worse one.
- Zero is a real outcome and must not read as a failure or an error.
- No claim about the person (D1); no percentile or cohort (N3).
- It has to make sense with no context at all, because a tab title arrives with none.

**The sentence** — the sign and the number come from the engine:

```
<signed percentage> toward the labels — the whole title, as a bookmark shows it
```

**Every reachable shape** (renderings of the sentence above, not separate strings):

```renders
pct = -31 → -31% toward the labels
pct =  -1 → -1% toward the labels
pct =   0 → 0% toward the labels
pct =   1 → +1% toward the labels
pct =  31 → +31% toward the labels
```

---

## 3. The flaw line — the Delicacy result's second number

**Where it renders.** On `/delicacy/result` and in the flow's reveal, directly under the detection band, with the count styled as a figure inside the sentence.

**What the screen has already said.** The score against chance and the detection band — how many damaged clips were caught, and how much of that a coin would have managed.

**Its job.** Report the SECOND thing measured: of the pairs where the damage was caught, how often the flaw was also named correctly. Catching and naming are different skills and the screen is reporting the harder one.

**Rules this copy must keep:**

- Singular and plural must both read (it once said “1 of 1 times”, found only by composing every reachable score and reading them).
- The denominator is the pairs CAUGHT, not all pairs — the sentence must not imply otherwise.
- Zero must read as a fact, not a rebuke.
- The number keeps its own styling in the flow, so the prefix and the suffix are separate strings and must work with a figure set between them.

**The two editable strings** — a styled figure is set between them:

```
prefix → And on the ones you caught, you named the flaw
suffix, 1 → time
suffix, 2 → times
```

**Assembled, at every interesting count:**

```renders
1 of 1 → And on the ones you caught, you named the flaw 1 of 1 time.
3 of 5 → And on the ones you caught, you named the flaw 3 of 5 times.
5 of 8 → And on the ones you caught, you named the flaw 5 of 8 times.
0 of 4 → And on the ones you caught, you named the flaw 0 of 4 times.
```

---

## 4. `NotBuiltYet` — the product admitting a door is not there

**Where it renders.** A dashed-border panel at the foot of two reading-room articles — `/learn/comparison` and `/learn/practice` — whose criteria have no instrument behind them.

**What the screen has already said.** A full article explaining the criterion, which is exactly why the panel is needed: a reader who arrived searching for that criterion would otherwise leave believing they had missed a door.

**Rules this copy must keep:**

- **Planned, never promised.** Neither instrument has been started and no date has been decided, so “coming soon” is a claim nobody has earned.
- It must read as a fact, not an apology or an excuse.
- The blocker clause differs per criterion and is passed in — it must stay true of that criterion.
- It is the one place the product tells a reader something is missing; it should not be the one place the writing goes limp.

**The template, with both blockers filled in:**

```
NOT BUILT YET

There is no instrument for comparison in the gym today. It is in the plan and not in the product — it needs no new audio, so what it waits on is a decision rather than a build. When it exists it will be measured the same way as the rest, and until then this page is an explanation rather than a door.

There is no instrument for practice in the gym today. It is in the plan and not in the product — it needs the product to remember you between sessions, and today it does not. When it exists it will be measured the same way as the rest, and until then this page is an explanation rather than a door.

The criteria that do have machines →
```

---

## 5. The creator vocabulary — added in E11 (Track B), never written by a writer

**Where it renders.** `/learn/flaws` (a new reading-room page), the front door's lead paragraph and its three secondary doors, the delicacy explainer's state sentences, and a link on the Delicacy and Threshold result screens.

**What it is.** The half of the product that turns a measurement into a word. The blueprint's premise is that somebody can hear a render is wrong and cannot name why; these are the sentences that name it. They were written by the engineer in one session and have had no pass.

**Rules this copy must keep:**

- **No claim about the reader** (D1) and **no comparison to other people** (N3).
- **No causal promise** that training here improves anybody's own output — it is unmeasured. A guard refuses five phrasings of it; it cannot refuse a sixth.
- **Nothing may count.** Several of these strings are shown after sessions that measured different numbers of families, and one of them sits under a machine list that has changed length twice. Arity in a reused sentence is how “pick either” survived under three cards.
- **Three families, and the limits sentence is load-bearing.** Three named flaws read as “the flaws” without it.
- The unit names (`cents of peak detune`, `ms of drift IQR`) are the pipeline's own labels. They are the weakest lines here and the engineer flagged them; they are also the honest name of the measured quantity, so a friendlier synonym would add a second vocabulary rather than replace one.

### 5.1 The flaw families — symptom and mechanism (`/learn/flaws`)

The symptom is deliberately the complaint a person makes BEFORE they have the word; the mechanism is what is physically true. The gap between them is the vocabulary.

**Pitch drift** — measured in cents

```
symptom:   It sounds sour or slightly seasick, and nothing you can point at is off-key.
mechanism: The whole take slides out of tune while it plays. It starts where it should and ends somewhere else, so no single note is wrong — the drift is.
```

**Timing smear** — measured in ms

```
symptom:   It feels rubbery and unanchored. The groove will not lock, however hard the drums are pushed.
mechanism: The beat wanders off the grid and back again in slow waves. No individual hit is late enough to notice on its own; the pattern of them is.
```

**Compression damage** — measured in kbps

```
symptom:   It sounds cheap, underwater or brittle — like a good idea saved one too many times.
mechanism: Low-bitrate compression throws away quiet detail. Cymbals turn grainy and reverb tails go swishy and airless, while the loud middle survives intact.
```

### 5.2 The page's two claim-bearing sentences

```
intro:  You can hear that a render is wrong and have no word for it. That is the gap this page closes: three kinds of damage the gym can measure, what each one sounds like, and the machines that find how small a dose of it you can still catch.

limits: These three are what the pipeline can render as a controlled dose with a right answer at the bottom of it. They are not a list of everything that can go wrong with a piece of audio. A render can fail in ways nothing here measures, and this page would rather be short than pretend otherwise.
```

### 5.3 The page's questions

```
Q: Can you tell me which flaw is wrecking my track?
A: No. Nothing here listens to your files, and there is nowhere to upload one. What this gives you is the vocabulary — three kinds of damage, what each sounds like, and the machine that measures how small a dose of it your own ears still catch.
```

```
Q: Why only three?
A: Because three is what the clip pipeline can render as a controlled dose with an objectively correct answer behind it: pitch drift, timing smear and compression damage. Other things go wrong in a mix. They are absent because we cannot measure them yet, not because they do not matter.
```

```
Q: If I catch these in the trials, will I catch them in my own work?
A: Unmeasured, so it is not claimed. The instruments report what you caught in these trials, on these recordings, in physical units. Whether that transfers to your own sessions is a question no data here answers.
```

### 5.4 The front door

The lead is shown with the machine count interpolated; three is what ships. The hint sits under the cards, and the three doors are the quiet rows beneath it.

```
lead:  Not a personality. Not a vibe. Four machines, each measuring one thing Hume said a real judge needs — whether a famous name can move your ratings, whether your ears can catch damage when nobody tells you where it is, how small that damage can get before you lose it, and whether your ratings move at all where a critic's judgment moved.

hint:  Free · no sign-up · headphones help · pick one, the room follows
```

```
/learn/flaws
Something sounds wrong. Three kinds of damage, what each one is called, and which machine measures it.
```

```
/learn
Reading room. Hume's five criteria, and how we measure them.
```

```
/music/quiz
Snack. Five taps, a verdict, and no measurement behind it.
```

### 5.5 The route from a result to the reference

One string, shown on both the Delicacy and Threshold results. It must stay true after a session that measured one family and after a session that measured three.

```
What each flaw is called, and what it sounds like
```

### 5.6 The delicacy explainer, now that the machine is open

These read the live flag and have a second form for the locked state, which is not shown here because it is not what ships.

```
index card: Machine 02: can your ears find the key in the wine?
```

```
Q: What is the key-in-the-wine story?
A: Hume retells it from Don Quixote: two of Sancho's kinsmen judged a wine good but for a faint taste of leather and iron. They were ridiculed — until the hogshead was emptied and an old key on a leathern thong was found at the bottom. Their perception was real and verifiable; that is delicacy.
```

```
Q: How do the Delicacy Trials work?
A: Public-domain and Creative-Commons recordings are altered with controlled degradations — pitch drift, timing smear and compression damage — and you identify the original and name the flaw. Unlike a taste quiz, answers are objectively right or wrong, difficulty is tunable, and items can be calibrated with item-response theory.
```

```
Q: Where do the Delicacy Trials sit in the gym?
A: They are machine 02, and they are open. The battery was built after the Prestige Test, on the principle that a gym has equipment you can see before you are ready for it — and now you are.
```

---

## 6. The Delicacy detection readout — THE ONE BATCH A WRITER HAS ALREADY SEEN

**Where it renders.** The Delicacy Trials result screen and the flow's reveal: the heading, the body beneath it, the provisional footnote, and the share line.

**This section is not like the others.** Cowork rewrote this copy under PM ruling RT-107a and it shipped on 2026-08-22, wired verbatim but for one factual fix at the 12-of-15 boundary. The brief is at `docs/copy-brief-delicacy-readout.md`. It is printed here because it was enumerated by NO deck until E18/S12 — so the decks described every unreviewed surface and omitted the one reviewed one, and a later edit to it would have gone unnoticed.

**Rules this copy must keep:**

- The one thing a reader must leave understanding: a two-way choice hands out half the score for free. Correct and detected are different percentages and confusing them is the whole problem.
- `chance` is a fraction and may be fractional on screen. A coin over fifteen trials averages 7.5, and it cannot CALL that — "a coin flip calls 7.5" is nonsense and shipped once.
- Report the band, never the point (RT-90a). Six ranked tiers were retired at 30.5% accuracy.
- Session length is a variable. Never write the number of trials as a word.
- No paid tier may be promised anywhere in it. The D4 amendment names this batch's phase line as its first casualty; the live line now refuses the claim outright.

**The constants, verbatim:**

```
phase line: Nothing here costs money, and no paid tier is coming. The training arc will gate on a seven-day gap between retests, because a retake the same day measures your memory, not your ears.
```

```
provisional footnote (the whole assembled paragraph): Provisional read — you're early. Nothing here costs money, and no paid tier is coming. The training arc will gate on a seven-day gap between retests, because a retake the same day measures your memory, not your ears. Difficulty labels are authored, not yet norm-calibrated.
```

**The band, at every branch a reader can reach** — 12 of 15 is the smallest score that clears chance.

```
15 of 15 — 15 of 15. Now subtract the guessing.
A two-way choice is generous: guess every pair blind and the long-run average is 7.5 of 15, half the paper handed over before you hear anything. You returned 15 — 7.5 beyond what that generosity covers, and past the 12 it takes to clear the coin at 95% confidence. Subtract the pairs luck would have handed you anyway and what remains, flaws actually detected rather than merely called, lands somewhere between 59% and 100%. That window is embarrassingly wide, and wide for an honest reason: 15 pairs is 15 pairs. But every value inside it sits above zero, and staying above zero is the one thing a coin cannot arrange.
```

```
13 of 15 — 13 of 15. Now subtract the guessing.
A two-way choice is generous: guess every pair blind and the long-run average is 7.5 of 15, half the paper handed over before you hear anything. You returned 13 — 5.5 beyond what that generosity covers, and past the 12 it takes to clear the coin at 95% confidence. Subtract the pairs luck would have handed you anyway and what remains, flaws actually detected rather than merely called, lands somewhere between 24% and 93%. That window is embarrassingly wide, and wide for an honest reason: 15 pairs is 15 pairs. But every value inside it sits above zero, and staying above zero is the one thing a coin cannot arrange.
```

```
11 of 15 — 11 of 15. Now subtract the guessing.
A two-way choice is generous: guess every pair blind and the long-run average is 7.5 of 15, half the paper handed over before you hear anything. You returned 11 — 3.5 beyond what that generosity covers, and 3.5 is not a margin anyone can defend. Subtract the pairs luck would have handed you anyway and the range that still fits your session runs from 0% to 78% detected, touching zero at the bottom. On 15 pairs it takes 12 to pull clear of the coin at 95% confidence. So the honest reading is not that you heard nothing — it is that a session this short cannot tell you apart from a lucky afternoon. A longer one can.
```

```
8 of 15 — 8 of 15. Now subtract the guessing.
A two-way choice is generous: guess every pair blind and the long-run average is 7.5 of 15, half the paper handed over before you hear anything. You returned 8 — 0.5 beyond what that generosity covers, and 0.5 is not a margin anyone can defend. Subtract the pairs luck would have handed you anyway and the range that still fits your session runs from 0% to 50% detected, touching zero at the bottom. On 15 pairs it takes 12 to pull clear of the coin at 95% confidence. So the honest reading is not that you heard nothing — it is that a session this short cannot tell you apart from a lucky afternoon. A longer one can.
```

```
4 of 15 — 4 of 15. Now subtract the guessing.
A two-way choice is generous: guess every pair blind and the long-run average is 7.5 of 15, half the paper handed over before you hear anything. You returned 4, at or beneath what that generosity alone returns, so once the lucky guesses come out there is nothing left to credit: the range that fits runs from 0% to 4% detected. Clearing the coin at 95% confidence would have taken 12 of 15. What these 15 pairs found is nothing that separates your ear from chance — which is a sentence about 15 pairs, and not yet a sentence about your ear.
```

```
0 of 15 — 0 of 15. Now subtract the guessing.
A two-way choice is generous: guess every pair blind and the long-run average is 7.5 of 15, half the paper handed over before you hear anything. You returned 0, at or beneath what that generosity alone returns, so once the lucky guesses come out there is nothing left to credit: there is no range left to draw, it sits flat at 0% detected. Clearing the coin at 95% confidence would have taken 12 of 15. What these 15 pairs found is nothing that separates your ear from chance — which is a sentence about 15 pairs, and not yet a sentence about your ear.
```

**The summary line, and the share line:**

```
all: 15 of 15 originals — a coin flip averages 7.5
```

```
some: 10 of 15 originals — a coin flip averages 7.5
```

```
none: 0 of 15 originals — a coin flip averages 7.5
```

```
share at 13/15: I called 13 of 15 originals in the Delicacy Trials — a coin flip averages 7.5. Think your ears are better?
```

```
share at 8/15: I called 8 of 15 originals in the Delicacy Trials — a coin flip averages 7.5. Think your ears are better?
```

---

## 7. `CRITIC_CONTRADICTION` — why no instrument scores you against a critic

**Where it renders.** Three pages: `/learn/comparison`, which is its home; `/learn/methodology`, beside the degrees-convergence line; and `/learn/ranking-test`, after the mechanism paragraph. The `/spread` frame states the refusal without the reason and does not render this.

**What the screen has already said.** On each page, that agreement with the critic is not scored. This is the sentence that says WHY.

**Its job.** Carry a constitutional refusal in one wording. The Prestige Test measures how far a famous name moves a listener; a second instrument rewarding agreement with a famous critic would contradict it on the same site.

**Rules this copy must keep:**

- It renders on three pages, so it may not depend on any one page's surrounding sentence.
- It is the reason, not the mechanism. Each page keeps its own prose about what was imported.
- No second wording may be introduced anywhere; `critic-refusal.test.ts` refuses one.
- This was FOUR wordings until E19/S14, found by a writing pass reading all four at once.

```
Rewarding you for agreeing with a prestigious critic would have this product contradict itself on the same screen.
```

---

**16 clips listed, of which 6 are the ones the standing note names.** Regenerate with `node scripts/export-instrument-deck.mjs > docs/copy-deck-instruments.md` after any change.
