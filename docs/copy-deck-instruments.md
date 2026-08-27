# Shipped instrument copy — deck for a writing pass

**Generated, do not edit by hand.** `node scripts/export-instrument-deck.mjs > docs/copy-deck-instruments.md`

The four batches recorded as awaiting a writing pass since 2026-08-26. They had no brief and no deck, which is why nothing happened to them: a bullet in a handoff is not a queue. Every string below is live in the product today.

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

**Every reachable shape:**

```
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

**Prefix (styled number follows it):** `And on the ones you caught, you named the flaw`

**Suffix:** 1 → “time” · 2 → “times”

**Assembled, at every interesting count:**

```
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

**16 clips listed, of which 6 are the ones the standing note names.** Regenerate with `node scripts/export-instrument-deck.mjs > docs/copy-deck-instruments.md` after any change.
