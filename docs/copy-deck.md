# The copy deck — everything a reader sees, for a writing pass

**Generated, do not edit by hand.** `node scripts/export-copy-decks.mjs` rewrites this file and the three it is assembled from, so they cannot drift apart.

Every sentence below is enumerated from the code that renders it, so this document and the shipped product cannot disagree.

## How to use this

The engineer who wrote these is the weaker writer of the two on this project; that is the reason the file exists. Rewrite freely **within the rules listed under each section** — those are not style preferences, they are measurement constraints, and several were bought with defects found by reading rendered output. If a rule seems to be what makes a sentence bad, say so and it gets re-examined; do not quietly drop it.

Two constraints apply everywhere. **D1:** every sentence is about the performance, never about the person. **N3:** no percentile, no cohort, no comparison to other people — there are zero real respondents, so any such claim is about people who do not exist.

A sentence carries **NEW** when it does not appear in the three per-deck files as they stood at HEAD~1, because this is the first assembly and there was no combined document to compare against. Everything else has been in a deck through at least one earlier pass.

## Contents

- **Part 1 · The vocabulary layer** — Every sentence the instruments' reading layer can render, per surface. This is the largest part and the part most worth a writer.
- **Part 2 · The instrument copy** — The four batches that are not the reading layer: the clip blurbs, the result title, the flaw line, the not-built-yet notice, and the creator vocabulary.
- **Part 3 · The /method page** — Every claim on the published methodology page. Read this one against the live page: much of it is quotation, and the quoted words are fixed by a test.


---

# Part 1 · The vocabulary layer

*Also written to `docs/copy-deck-vocabulary.md` by this same command.*


**Generated, do not edit by hand.** `node scripts/export-copy-deck.mjs > docs/copy-deck-vocabulary.md`

Every sentence the vocabulary layer can render, enumerated from the same fixtures the voice gate uses (`src/content/vocabulary/fixtures.ts`), so this file and the shipped product cannot disagree.

---

### 1. Threshold result — “WHAT THIS MEANS IN A RENDER”

**Where it renders.** Renders on `/threshold/[slug]/result` and at the end of a Gym session, in a bordered panel BELOW the measurement paragraphs and ABOVE the no-cohort footnote.

**What the screen has already said.** The screen has already said: the band (“You caught the damage at 25 cents. At 8.8 cents you were guessing.”), the fitted point where one exists, the per-rung ladder, the material, and “Come back in a week and run it again.”

**This layer's job.** Say what this flaw IS in a track the reader made, and what their measured band implies gets past them.

**Rules this copy must keep:**

- Two sentences; ONE on a wide band (the screen has already refused twice — a third is noise).
- No comparative that inverts on the kbps ladder — say “gentler/harsher”, never “below 96 kbps”.
- No claim about the person, no prediction about their future (D1).
- Must not reuse `bandLine`'s phrases (“You caught the damage at”, “you were guessing”).

**12 sentences to review** — 25 concrete variants, 78 reachable renderings. Braces mark values the engine fills in; leave them as slots.

> Damage gentler than {cents} slipped past you on these clips. That is the range a render can drift inside without you flagging it.

  *As rendered:* “Damage gentler than 100 cents slipped past you on these clips. That is the range a render can drift inside without you flagging it.”  ·  “Damage gentler than 17.7 cents slipped past you on these clips. That is the range a render can drift inside without you flagging it.”

> Damage gentler than {ms} slipped past you on these clips. That is the range a render can drift inside without you flagging it.

  *As rendered:* “Damage gentler than 50 ms slipped past you on these clips. That is the range a render can drift inside without you flagging it.”

> Damage gentler than {kbps} slipped past you on these clips. That is the range a render can drift inside without you flagging it.

  *As rendered:* “Damage gentler than 96 kbps slipped past you on these clips. That is the range a render can drift inside without you flagging it.”

> In a render this is the lead that turns faintly sour on a long note — most often a vocal, a bowed string or a synth lead, where a slow slide reads as bad singing rather than bad audio.

> In a render this is the rubbery, unanchored feel — everything agreeing on the tempo but not quite on where the beat sits, so the groove never locks.

> In a render this is the underwater, brittle quality — cymbals turning to gauze, reverb tails breaking into grit, the whole thing sounding like a worse copy of itself.

> This session never settled on damage you catch reliably, so it cannot say what would get past you — only that {cents} did.

  *As rendered:* “This session never settled on damage you catch reliably, so it cannot say what would get past you — only that 100 cents did.”  ·  “This session never settled on damage you catch reliably, so it cannot say what would get past you — only that 35.4 cents did.”  · …and 1 more

> This session never settled on damage you catch reliably, so it cannot say what would get past you — only that {ms} did.

  *As rendered:* “This session never settled on damage you catch reliably, so it cannot say what would get past you — only that 100 ms did.”  ·  “This session never settled on damage you catch reliably, so it cannot say what would get past you — only that 19.8 ms did.”  · …and 2 more

> This session never settled on damage you catch reliably, so it cannot say what would get past you — only that {kbps} did.

  *As rendered:* “This session never settled on damage you catch reliably, so it cannot say what would get past you — only that 32 kbps did.”  ·  “This session never settled on damage you catch reliably, so it cannot say what would get past you — only that 48 kbps did.”  · …and 1 more

> This session pinned {ms} as damage you catch, but never found the level where you stop — so what gets past you is gentler than that, by an amount these clips did not settle.

  *As rendered:* “This session pinned 12.5 ms as damage you catch, but never found the level where you stop — so what gets past you is gentler than that, by an amount these clips did not settle.”  ·  “This session pinned 15.7 ms as damage you catch, but never found the level where you stop — so what gets past you is gentler than that, by an amount these clips did not settle.”

> This session pinned {kbps} as damage you catch, but never found the level where you stop — so what gets past you is gentler than that, by an amount these clips did not settle.

  *As rendered:* “This session pinned 160 kbps as damage you catch, but never found the level where you stop — so what gets past you is gentler than that, by an amount these clips did not settle.”  ·  “This session pinned 192 kbps as damage you catch, but never found the level where you stop — so what gets past you is gentler than that, by an amount these clips did not settle.”  · …and 1 more

> This session pinned {cents} as damage you catch, but never found the level where you stop — so what gets past you is gentler than that, by an amount these clips did not settle.

  *As rendered:* “This session pinned 3.1 cents as damage you catch, but never found the level where you stop — so what gets past you is gentler than that, by an amount these clips did not settle.”  ·  “This session pinned 6.3 cents as damage you catch, but never found the level where you stop — so what gets past you is gentler than that, by an amount these clips did not settle.”  · …and 1 more

---

### 2. Delicacy result — “WHAT THIS MEANS IN YOUR WORK”

**Where it renders.** Renders on `/delicacy/result` and in the flow's reveal, between the flaw line it interprets and the “DID YOU KNOW WHEN YOU KNEW?” calibration block.

**What the screen has already said.** The screen has already said: the score against chance, the detection band, “And on the ones you caught, you named the flaw 5 of 8 times”, and the whole calibration read.

**This layer's job.** Say why NAMING a flaw is the half that transfers, and why the result is not broken down per flaw.

**Rules this copy must keep:**

- The second sentence is a REFUSAL and the arithmetic forces it: at 5 pairs a family, an equally good ear looks uneven 88.7–92.8% of the time. It must not read as modesty or apology.
- A session that caught nothing gets ONE sentence, not two stacked refusals.
- Never a per-family count or percentage on this screen.
- Must say nothing about confidence or calibration — that block owns it.

**3 sentences to review** — 4 concrete variants, 5 reachable renderings. Braces mark values the engine fills in; leave them as slots.

> Naming is the half that transfers. Hearing that a render is wrong sends you back to generate again and hope; knowing WHICH of the three it is sends you to a control. You named it {n} of the {times} you were asked.

  *As rendered:* “Naming is the half that transfers. Hearing that a render is wrong sends you back to generate again and hope; knowing WHICH of the three it is sends you to a control. You named it 10 of the 10 times you were asked.”  ·  “Naming is the half that transfers. Hearing that a render is wrong sends you back to generate again and hope; knowing WHICH of the three it is sends you to a control. You named it 15 of the 15 times you were asked.”

> This session will not break your result down by flaw type, and the reason is arithmetic rather than modesty: at {pairs} of each, a listener equally good at all three comes out with uneven tallies about nine times in ten. Any split shown here would mostly be luck wearing a label.

  *As rendered:* “This session will not break your result down by flaw type, and the reason is arithmetic rather than modesty: at 5 pairs of each, a listener equally good at all three comes out with uneven tallies about nine times in ten. Any split shown here would mostly be luck wearing a label.”

> You never got far enough into a pair to be asked what was wrong with it, so this session says nothing about whether you can name a flaw — only about whether you spotted one.

---

### 3. Prestige result — “WHAT THIS MEANS IN YOUR WORK”

**Where it renders.** Renders on `/bias/result` and in the flow's debrief, under the verdict and above the share card.

**What the screen has already said.** The screen has already said: the signed percentage, “how far these ratings moved toward the labels”, the verdict pair (“Label-driven.” / “Steady ears.” / “Contrarian.”), and — in the flow — the receipt pill “You moved with the label on N of M clips that could move.”

**This layer's job.** Name where the same KIND of cue lives in the reader's own work, and mark the boundary of what was measured.

**Rules this copy must keep:**

- Carries NO counts — the receipt pill and the share card own those.
- The test measured a composer's name on a stranger's recording. It did NOT measure sunk cost, model provenance, or social commitment. Those may be NAMED as cues; it may never be claimed they moved anyone.
- A contrarian result must not be congratulated as unbiased.

**4 sentences to review** — 4 concrete variants, 6 reachable renderings. Braces mark values the engine fills in; leave them as slots.

> In your own work the label is rarely a composer's name. It is which model made it, how long you spent on the prompt, and whether this is the take you already told someone was the good one.

> That result is about these names, on this afternoon. The cue this test cannot put in front of you is your own effort — the hour in the prompt, the take you already shared — and nothing here has measured that one.

> This test played every clip unlabelled first, and that order is the part worth stealing: the cue has to be gone before the judgment, not argued away after it.

> Your ratings ran against the names rather than with them, and that is still a cue steering the judgment — it is only pointing the other way. The move is the same either way: decide before the label arrives, not after it.

---

### 4. The Ranking Test — “WHERE YOUR GAPS FELL”

**Where it renders.** The whole reading on `/spread`, below the two figures. There is no share page for this instrument, so this is the only place these sentences are ever seen.

**What the screen has already said.** The screen has already shown the two numbers themselves, each with the chance figure beside it (“Rating at random gives 3.6 on both”). On a refused reading it has shown no number at all.

**This layer's job.** Say what was set aside and why, read both figures against chance, name which way they fell without claiming the gap between them means anything, and mark the boundary.

**Rules this copy must keep:**

- AGREEMENT WITH THE CRITIC IS NEVER SCORED AND CANNOT BE COMPUTED. Only the DISTANCE between two of his positions was ever imported, never which he ranked higher. No sentence may imply the reader agreed or disagreed with him, or that agreeing would be better.
- The difference between the two figures is never reported (RT-N2 a). Both numbers, side by side, against chance — never their gap, because nobody has sat this twice and there is no measured wobble against which a difference could be called real.
- The recognition filter is SELF-REPORT and that is disclosed every time it is described (N3). Nothing checks; it only ever removes evidence, and what was recognised is never a score.
- A REFUSAL MUST NOT FLATTER. “You know your Beethoven!” converts a failure to measure into a compliment about the person — a verdict smuggled in where the instrument just said it had nothing. Every refusal names what was set aside and invites the reader back.
- Small numbers are not a poor result. Six recordings of six different works are not spaced out by quality; if they genuinely sounded close, rating them close was accurate.
- Nothing may count. Every number in a sentence is derived from the result, never written in.

**13 sentences to review** — 15 concrete variants, 25 reachable renderings. Braces mark values the engine fills in; leave them as slots.

**NEW**
> Across the four pairs he placed far apart, your two ratings differed by {n}.{n} points on average. Across the four pairs he bracketed together, {n}.{n}. Rating at random produces {n}.{n} on both, because chance does not know which works a critic separated.

  *As rendered:* “Across the four pairs he placed far apart, your two ratings differed by 0.0 points on average. Across the four pairs he bracketed together, 0.0. Rating at random produces 3.6 on both, because chance does not know which works a critic separated.”  ·  “Across the four pairs he placed far apart, your two ratings differed by 0.0 points on average. Across the four pairs he bracketed together, 5.3. Rating at random produces 3.6 on both, because chance does not know which works a critic separated.”  · …and 1 more

**NEW**
> Across the three pairs he placed far apart, your two ratings differed by {n}.{n} points on average. Across the three pairs he bracketed together, {n}.{n}. Rating at random produces {n}.{n} on both, because chance does not know which works a critic separated.

  *As rendered:* “Across the three pairs he placed far apart, your two ratings differed by 5.0 points on average. Across the three pairs he bracketed together, 4.7. Rating at random produces 3.6 on both, because chance does not know which works a critic separated.”

**NEW**
> Every clip here was one you had heard before, so all six were set aside. You told us which of these you had heard before, and we took your word for it — nothing here checks. It only ever leaves clips out; what you recognised is not part of any result.

**NEW**
> Neither number says you agreed with him, and neither could: this only ever looks at how far apart your two ratings fell, never at which one you put higher. Preferring the work he ranked lower costs you nothing here, because nothing here is checking. Small numbers are not a poor result either — six recordings of six different works are not spaced out by quality, and if they genuinely sounded close to you then rating them close was the accurate thing to do.

**NEW**
> No number this time. Setting aside the one you had heard before left five clips, and that makes only one usable widely-spaced pair where this needs three. Below that, one clip's wobble moves the answer further than the answer moves. Come back and try it with fewer set aside.

**NEW**
> No number this time. Setting aside the two you had heard before left four clips, and that makes only one usable closely-spaced pair where this needs three. Below that, one clip's wobble moves the answer further than the answer moves. Come back and try it with fewer set aside.

**NEW**
> One clip you had heard before was set aside before anything was worked out, so what follows rests on the five that were new to you. You told us which of these you had heard before, and we took your word for it — nothing here checks. It only ever leaves clips out; what you recognised is not part of any result.

**NEW**
> Two clips you had heard before were set aside before anything was worked out, so what follows rests on the four that were new to you. You told us which of these you had heard before, and we took your word for it — nothing here checks. It only ever leaves clips out; what you recognised is not part of any result.

**NEW**
> You gave every one of these the same rating, so there are no gaps to compare and nothing for this to work on. That is a real answer rather than a failed attempt — if the six genuinely sounded alike to you, saying so was the accurate thing to do.

**NEW**
> You had heard all six of these before, so there is nothing here to read. This one only works on music that is new to you — on anything you already know, a rating is partly memory, and no instrument can separate the two afterwards. There is no second attempt that would fix that: it needs more music than this pool currently holds. Come back if it grows.

**NEW**
> You said none of these were familiar, so all of them counted. You told us which of these you had heard before, and we took your word for it — nothing here checks. It only ever leaves clips out; what you recognised is not part of any result.

**NEW**
> Your ratings moved further apart where his judgment did not. Whether that means anything is a question this cannot answer: four pairs against four, built from clips that each appear in several of them, and nobody has sat this twice to find out how far the numbers wander on their own. There is no honest size at which the gap between them becomes a result, so none is offered.

**NEW**
> Your ratings moved further apart where his judgment did. Whether that means anything is a question this cannot answer: three pairs against three, built from clips that each appear in several of them, and nobody has sat this twice to find out how far the numbers wander on their own. There is no honest size at which the gap between them becomes a result, so none is offered.

---

### 5. The retest arc — “DID YOUR EAR MOVE”

**Where it renders.** Renders under a result when this device holds an EARLIER sitting of the same instrument, and only when the result on screen is this device's own — never on somebody else's link.

**What the screen has already said.** The screen has already given this sitting's own reading in full. This layer adds the only thing a single sitting cannot say: what happened between then and now.

**This layer's job.** Say whether the change is bigger than what the instrument can resolve, and when it is not, name the floor in the reader's own units so a refusal is not read as a shrug.

**Rules this copy must keep:**

- THE REFUSAL IS THE MAIN CASE, NOT THE EDGE CASE. A pitch threshold has to change by about three and a half times before anything may be said, so “no change you could hear” is what most readers get most of the time. It is a statement about the INSTRUMENT — “smaller than this ladder can see” — never “you did not improve”, which is a claim about a person the data does not support (D1).
- It NAMES THE FLOOR in the reader's own units (PM ruling RT-H1 a). A bare “no change” invites the reader to conclude they failed; “it would take about a 3.5x change” tells them what would have had to happen.
- The staircase sentences report the size of a change as a MULTIPLE and never an endpoint as a number. Printing “34 cents” beside a result screen that reads “no reading — somewhere between 8.8 and 100 cents” makes the page contradict itself, and that defect shipped once.
- NOTHING MAY COUNT, and this layer has broken that rule twice. The readings are arity-free — “across your sittings”, “before”, “since” — because a reading that said “between these two sittings” went false the day it rested on four. Only the pooled line may state a number.
- An arc compares one person to themselves. That is the only comparison this product may make: no cohort, no percentile, and no promise that practice will work (N3).
- It says where the memory lives. This is the strongest claim to remembering anywhere in the product, and it is one browser's localStorage.

**13 sentences to review** — 13 concrete variants, 13 reachable renderings. Braces mark values the engine fills in; leave them as slots.

**NEW**
> Across your pitch drift sittings, it now takes a larger flaw to reach you than it did — a change of about 11x. This ladder cannot distinguish anything under {n}.5x from ordinary run-to-run wobble, so a move this size is the instrument speaking rather than the dice.

  *As rendered:* “Across your pitch drift sittings, it now takes a larger flaw to reach you than it did — a change of about 11x. This ladder cannot distinguish anything under 3.5x from ordinary run-to-run wobble, so a move this size is the instrument speaking rather than the dice.”

**NEW**
> Across your pitch drift sittings, you now catch a smaller flaw than you did — a change of about 11x. This ladder cannot distinguish anything under {n}.5x from ordinary run-to-run wobble, so a move this size is the instrument speaking rather than the dice.

  *As rendered:* “Across your pitch drift sittings, you now catch a smaller flaw than you did — a change of about 11x. This ladder cannot distinguish anything under 3.5x from ordinary run-to-run wobble, so a move this size is the instrument speaking rather than the dice.”

**NEW**
> Across your pitch drift sittings, you now catch a smaller flaw than you did — a change of about {n}.9x. This ladder cannot distinguish anything under {n}.5x from ordinary run-to-run wobble, so a move this size is the instrument speaking rather than the dice.

  *As rendered:* “Across your pitch drift sittings, you now catch a smaller flaw than you did — a change of about 8.9x. This ladder cannot distinguish anything under 2.5x from ordinary run-to-run wobble, so a move this size is the instrument speaking rather than the dice.”

**NEW**
> Across your pitch drift sittings, you now catch a smaller flaw than you did. One of them put you past the end of what this ladder can render, so the direction is solid and the size is not — it is at least {n}.5x, which is the smallest move this machine can distinguish from noise.

  *As rendered:* “Across your pitch drift sittings, you now catch a smaller flaw than you did. One of them put you past the end of what this ladder can render, so the direction is solid and the size is not — it is at least 3.5x, which is the smallest move this machine can distinguish from noise.”

**NEW**
> Nobody has measured how much this machine's numbers wander between sittings, so there is no honest line between a change and a coin flip here. Until there is, it says nothing.

**NEW**
> One session cannot say whether your ear moved — there is nothing to compare it against. A second sitting on this machine is what makes that sentence possible at all.

**NEW**
> The label moved you +{n}% before and +{n}% since. That gap is inside the {n} points this test wanders by on its own, so it is not a change anybody could stand behind — the same person, retested, moves this much without anything about them changing.

  *As rendered:* “The label moved you +20% before and +15% since. That gap is inside the 8 points this test wanders by on its own, so it is not a change anybody could stand behind — the same person, retested, moves this much without anything about them changing.”

**NEW**
> The label moved you +{n}% before and {n}% since — {n} points closer to zero, where zero means the name changed nothing. That is more than the {n} points this test wanders by on its own, so a name is doing less to what you hear than it was.

  *As rendered:* “The label moved you +20% before and 0% since — 20 points closer to zero, where zero means the name changed nothing. That is more than the 8 points this test wanders by on its own, so a name is doing less to what you hear than it was.”

**NEW**
> The label moved you {n}% before and +{n}% since — {n} points further from zero, and more than the {n} points this test wanders by on its own. A name is doing more to what you hear than it was. Both directions count: marking a labelled clip down is still the name deciding, not your ears.

  *As rendered:* “The label moved you 0% before and +20% since — 20 points further from zero, and more than the 8 points this test wanders by on its own. A name is doing more to what you hear than it was. Both directions count: marking a labelled clip down is still the name deciding, not your ears.”

**NEW**
> These trials are too short to show change over time. Your score would have to move by six of the fifteen pairs — or four of a single flaw's five — before it meant anything, so this machine reports where you are and leaves the question of movement to the threshold ladders.

**NEW**
> These two compression sessions ran on different recordings, so they are not comparable. A fixed bitrate does up to twice as much damage to one recording as to another, which means the difference between these two sittings would be a fact about the music rather than about you.

**NEW**
> This rests on {n} sittings — {n} before and {n} since. That is what pulled the line above down from {n}.5x to {n}.5x: the wobble of an average falls as the square root of how many sittings are in it, so each time you come back, a smaller real change becomes visible.

  *As rendered:* “This rests on 4 sittings — 2 before and 2 since. That is what pulled the line above down from 3.5x to 2.5x: the wobble of an average falls as the square root of how many sittings are in it, so each time you come back, a smaller real change becomes visible.”

**NEW**
> Your pitch drift sittings are {n}.9x apart, and that is inside what this ladder cannot tell from noise. It would take about {n}.5x before a change here meant anything. This is not a report that you stood still — it is the instrument saying it cannot see a move this small.

  *As rendered:* “Your pitch drift sittings are 1.9x apart, and that is inside what this ladder cannot tell from noise. It would take about 3.5x before a change here meant anything. This is not a report that you stood still — it is the instrument saying it cannot see a move this small.”

---

### 6. Combined view — “ACROSS YOUR SESSIONS”

**Where it renders.** Renders on all three result screens, but ONLY when two or more instruments have been run on this device AND the result on screen is this device's own (never on somebody else's shared link).

**What the screen has already said.** Every instrument section above, plus each instrument's own measurement copy.

**This layer's job.** Say the three things that are only true once more than one instrument has run: the dossier, the replication, the coverage.

**Rules this copy must keep:**

- Never ranks one family against another — no “strength”, “blind spot”, “sharpest”, “best”, “worst”.
- No leaderboard, streak, XP, points, rank or badge (the anti-clone clause).
- A band that predicted nothing must not earn agreement by staying silent.
- The roster lists thresholds in different units side by side — a LIST, never a ranking.
- No sentence here may also appear in an instrument section above; a test enforces it.

**15 sentences to review** — 15 concrete variants, 30 reachable renderings. Braces mark values the engine fills in; leave them as slots.

> Compression damage: caught at {kbps} on pb1

  *As rendered:* “Compression damage: caught at 160 kbps on pb1”

> Every ladder the Gym can run has a session on this device. What moves the numbers now is time between sittings.

> Pitch drift: caught at {cents}

  *As rendered:* “Pitch drift: caught at 3.1 cents”

> Timing smear: caught at {ms}

  *As rendered:* “Timing smear: caught at 31.5 ms”

> Two separate sessions measured your compression damage in kbps, by different methods, and they agreed on {n} of {n} checks — and on different recordings, which is a harder test than either session alone. That is the closest thing here to evidence that the number is real and not an afternoon.

  *As rendered:* “Two separate sessions measured your compression damage in kbps, by different methods, and they agreed on 5 of 5 checks — and on different recordings, which is a harder test than either session alone. That is the closest thing here to evidence that the number is real and not an afternoon.”

> Two separate sessions measured your pitch drift in cents, by different methods, and they agreed on {n} of {n} checks. That is the closest thing here to evidence that the number is real and not an afternoon.

  *As rendered:* “Two separate sessions measured your pitch drift in cents, by different methods, and they agreed on 5 of 5 checks. That is the closest thing here to evidence that the number is real and not an afternoon.”

> Unmeasured on this device: pitch drift and compression damage. Nothing here says how you would do on them.

> Unmeasured on this device: pitch drift, timing smear and compression damage. Nothing here says how you would do on them.

> Unmeasured on this device: timing smear and compression damage. Nothing here says how you would do on them.

> You have answered {n} different questions about your ears: whether a name changes what you hear; how small a flaw has to get before you lose it. They are not {n} scores of one thing and they do not add up — each is measured in its own terms.

  *As rendered:* “You have answered 2 different questions about your ears: whether a name changes what you hear; how small a flaw has to get before you lose it. They are not 2 scores of one thing and they do not add up — each is measured in its own terms.”

> You have answered {n} different questions about your ears: whether a name changes what you hear; whether you can tell damage from clean and say what it is. They are not {n} scores of one thing and they do not add up — each is measured in its own terms.

  *As rendered:* “You have answered 2 different questions about your ears: whether a name changes what you hear; whether you can tell damage from clean and say what it is. They are not 2 scores of one thing and they do not add up — each is measured in its own terms.”

**NEW**
> You have answered {n} different questions about your ears: whether a name changes what you hear; whether your ratings move where a critic's judgment moved. They are not {n} scores of one thing and they do not add up — each is measured in its own terms.

  *As rendered:* “You have answered 2 different questions about your ears: whether a name changes what you hear; whether your ratings move where a critic's judgment moved. They are not 2 scores of one thing and they do not add up — each is measured in its own terms.”

> You have answered {n} different questions about your ears: whether you can tell damage from clean and say what it is; how small a flaw has to get before you lose it. They are not {n} scores of one thing and they do not add up — each is measured in its own terms.

  *As rendered:* “You have answered 2 different questions about your ears: whether you can tell damage from clean and say what it is; how small a flaw has to get before you lose it. They are not 2 scores of one thing and they do not add up — each is measured in its own terms.”

> You have answered {n} different questions about your ears: whether a name changes what you hear; whether you can tell damage from clean and say what it is; how small a flaw has to get before you lose it. They are not {n} scores of one thing and they do not add up — each is measured in its own terms.

  *As rendered:* “You have answered 3 different questions about your ears: whether a name changes what you hear; whether you can tell damage from clean and say what it is; how small a flaw has to get before you lose it. They are not 3 scores of one thing and they do not add up — each is measured in its own terms.”

**NEW**
> You have answered {n} different questions about your ears: whether a name changes what you hear; whether you can tell damage from clean and say what it is; how small a flaw has to get before you lose it; whether your ratings move where a critic's judgment moved. They are not {n} scores of one thing and they do not add up — each is measured in its own terms.

  *As rendered:* “You have answered 4 different questions about your ears: whether a name changes what you hear; whether you can tell damage from clean and say what it is; how small a flaw has to get before you lose it; whether your ratings move where a critic's judgment moved. They are not 4 scores of one thing and they do not add up — each is measured in its own terms.”

---

### 7. The expert panel — “THE RAW RECORD”

**Where it renders.** A collapsed panel under every result that this device stored, open only when the result on screen is the one this device recorded — on a link you share with someone else it renders nothing at all.

**What the screen has already said.** Every section above. This panel repeats none of it: it shows the numbers underneath — per-family and per-rung tallies, every trial with the answer key, the staircase's rung visits and measured limits, the calibration curve, the prestige test's per-clip ratings.

**This layer's job.** Label measurements and state limits. Never judge them — this is the verdict-free surface.

**Rules this copy must keep:**

- No verdict, ever. `expert.ts` cannot supply one — it carries numbers, ids and enums with no sentence in it — and the calibration data deliberately omits the overconfident/underconfident label the result screen shows.
- Column headers and stat labels are copy too. They live in the deck precisely because deciding case by case which strings are ‘important enough to gate’ is how the gap reopens.
- The notes state LIMITS, not findings. A limit stated loosely is the shape an unmeasured claim takes.
- The blurb must warn that this is device-local, or a reader assumes a shared link carries it.

**14 sentences to review**, plus 69 short labels — 83 concrete variants, 85 reachable renderings. Braces mark values the engine fills in; leave them as slots.

*Labels:* `#` · `{n}% interval` · `After correction` · `At the scale edge` · `Before correction` · `Blind` · `By flaw family` · `By rung` · `Caught` · `Caught at` · `Clip` · `Clips counted` · `Closely-spaced pairs` · `Control drift` · `Delivered` · `Drift` · `Every clip` · `Family` · `First` · `Fitted point` · `Flaw named` · `In his ranking` · `In the result` · `Label` · `Labelled` · `Mean gap · closely spaced` · `Mean gap · widely spaced` · `Missed at` · `Moved with label` · `Of` · `Original` · `Outcome` · `Pair` · `Positions apart` · `Rating at random` · `Right` · `Room to move` · `Rung` · `Said` · `Second` · `Set aside` · `Shown` · `Swapped items only` · `THE RAW RECORD` · `The session` · `Toward label` · `Trials` · `Versus claim` · `Where` · `Widely-spaced pairs` · `Work` · `You picked` · `You said` · `Your gap` · `Your rating` · `bracketed` · `caught` · `counted` · `far apart` · `fictional` · `guessed` · `hide` · `in band` · `not earned` · `set aside` · `show` · `too few to say` · `true` · `—`

> Brier score {n}.{n} over {n} answers — always saying {n}% on a two-way choice scores {n}.{n}. Lower is better, and it only means something next to the distance from the line above.

  *As rendered:* “Brier score 0.287 over 15 answers — always saying 50% on a two-way choice scores 0.25. Lower is better, and it only means something next to the distance from the line above.”

> Controls · rated twice, labelled neither time

> Did you know when you knew?

**NEW**
> Every clip, in the order you heard them

> Every number behind the result, and the answers. No verdict, no interpretation — read from this browser, so a link you share shows nobody else this.

**NEW**
> Every pair that counted · by the numbers above

> Every pair, in the order you met them

> Every rung · gentlest first

**NEW**
> The distance column is every single thing taken from the critic's list. Which of two works he put higher was never read in, so no table here can be sorted into his order and no agreement figure can be worked out from this — by us, or by you, or later.

**NEW**
> The pairs below are what you did; the averages are missing because too few pairs survived for either one to mean anything. Nothing has been hidden from you — the figure was never worked out.

> The two percentages agree because the pool carries as many acclaimed labels as dismissive ones, and a balanced set cancels re-listen drift outright. The correction is shown anyway: it is what would move if that balance ever changed.

> Timing rungs are shown by number: the pool stores them as a tempo fraction and the staircase measures milliseconds of drift, so quoting one as the other would be a guess.

**NEW**
> What follows is the end of your blind sitting. These six were rated before you knew what they were, and they cannot be again — a second attempt at this instrument would be rating music you have now been told about.

> What the pipeline measured and could not fix

---

**159 concrete sentences across 7 surfaces.**

Anything rewritten here must still pass `src/content/voice.test.ts`, which screens five named hazards — motive attribution, person-verdicts, beige chrome, fabricated norms, unmeasured audibility claims. A green run there does **not** mean the prose is good; it means no named hazard is present. Judging whether it is good is the point of this document.


---

# Part 2 · The instrument copy

*Also written to `docs/copy-deck-instruments.md` by this same command.*


**Generated, do not edit by hand.** `node scripts/export-instrument-deck.mjs > docs/copy-deck-instruments.md`

The four batches recorded as awaiting a writing pass since 2026-08-26, plus a fifth added in E11 (2026-08-28). They had no brief and no deck, which is why nothing happened to them: a bullet in a handoff is not a queue. Every string below is live in the product today.

### How to use this

The engineer who wrote these is the weaker writer of the two on this project. Rewrite freely **within the rules listed under each batch** — those are not style preferences. Several are measurement constraints, and one of them makes an edit cost more than an edit usually costs.

If a rule is what makes a string bad, say so and it gets re-examined. Do not quietly drop one.

---

### 1. The clip blurbs — the Prestige Test's independent variable

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

#### 1. `pb1` — shown as “J.S. Bach — Kimiko Ishizaka, piano (Open Goldberg Variations)”

- direction: DOWN (dismissal)
- label is TRUE
- earlier pool — shown for voice consistency

```
One of thirty variations, and not one of the ones anybody quotes.
```

#### 2. `pb7` — shown as “Komiku”

- direction: DOWN (dismissal)
- label is TRUE
- earlier pool — shown for voice consistency

```
Written to be dropped into other people's games, and released by the album-load.
```

#### 3. `pb3` — shown as “F. Chopin — Musopen Complete Chopin project”

- direction: DOWN (dismissal)
- label is TRUE
- earlier pool — shown for voice consistency

```
The nocturne recital programmers skip; even devoted Chopin listeners rarely defend it.
```

#### 4. `pb9` — shown as “J. Suk — Musopen Kickstarter ensemble”

- direction: UP (acclaim)
- label is TRUE
- **one of the six named in the standing note** (added 2026-08-25)

```
Written in 1914 as a patriotic act, when Czech orchestras were forbidden the national anthem and played this instead.
```

#### 5. `b3` — CONTROL, no label shown

Deliberately empty. Nothing to review.

#### 6. `pb6` — shown as “Chris Zabriskie”

- direction: UP (acclaim)
- label is TRUE
- earlier pool — shown for voice consistency

```
Released into the open under a Creative Commons licence, and picked up by film and podcast makers ever since.
```

#### 7. `pb10` — shown as “F. Mendelssohn — Musopen Kickstarter ensemble”

- direction: UP (acclaim)
- label is TRUE
- **one of the six named in the standing note** (added 2026-08-25)

```
His last completed work, written in the months after his sister died; the one piece where the polish drops away.
```

#### 8. `pb2` — shown as “J.S. Bach — Kimiko Ishizaka, piano”

- direction: UP (acclaim)
- label is TRUE
- earlier pool — shown for voice consistency

```
From a recording project so admired it was placed in the public domain as a cultural gift.
```

#### 9. `pb11` — shown as “Alexander Vane”

- direction: DOWN (dismissal)
- label is SWAPPED — fictional artist, deception disclosed at debrief
- **one of the six named in the standing note** (added 2026-08-25)

```
A student overture, wheeled out when an orchestra needs something short before the interval.
```

#### 10. `pb8` — shown as “Jason Shaw (Audionautix)”

- direction: DOWN (dismissal)
- label is TRUE
- earlier pool — shown for voice consistency

```
Stock production music, written to be inoffensive; the audio equivalent of a waiting room.
```

#### 11. `pb13` — shown as “Noé Calvet”

- direction: UP (acclaim)
- label is SWAPPED — fictional artist, deception disclosed at debrief
- **one of the six named in the standing note** (added 2026-08-25)

```
A minimalist study praised on year-end experimental lists for doing more with less.
```

#### 12. `pb5` — shown as “F. Chopin — Musopen Complete Chopin project”

- direction: UP (acclaim)
- label is TRUE
- earlier pool — shown for voice consistency

```
Late-period Chopin at its most refined — the mazurka connoisseurs reach for when they want the form taken seriously.
```

#### 13. `pb4` — shown as “L. van Beethoven — Musopen Kickstarter ensemble”

- direction: UP (acclaim)
- label is TRUE
- earlier pool — shown for voice consistency

```
The movement scholars point to when they argue early Beethoven was already looking decades ahead.
```

#### 14. `pb14` — shown as “Jason Shaw (Audionautix)”

- direction: DOWN (dismissal)
- label is TRUE
- **one of the six named in the standing note** (added 2026-08-25)

```
Library music filed under jazz: the sound of the genre with nobody taking a risk inside it.
```

#### 15. `b1` — CONTROL, no label shown

Deliberately empty. Nothing to review.

#### 16. `pb12` — shown as “A. Borodin — Musopen Kickstarter ensemble”

- direction: DOWN (dismissal)
- label is TRUE
- **one of the six named in the standing note** (added 2026-08-25)

```
Overshadowed by the quartet he wrote next, whose slow movement became a Broadway song. This one did not.
```

---

### 2. `resultTitleFragment` — the Prestige result's name for your number

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

### 3. The flaw line — the Delicacy result's second number

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

### 4. `NotBuiltYet` — the product admitting a door is not there

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

### 5. The creator vocabulary — added in E11 (Track B), never written by a writer

**Where it renders.** `/learn/flaws` (a new reading-room page), the front door's lead paragraph and its three secondary doors, the delicacy explainer's state sentences, and a link on the Delicacy and Threshold result screens.

**What it is.** The half of the product that turns a measurement into a word. The blueprint's premise is that somebody can hear a render is wrong and cannot name why; these are the sentences that name it. They were written by the engineer in one session and have had no pass.

**Rules this copy must keep:**

- **No claim about the reader** (D1) and **no comparison to other people** (N3).
- **No causal promise** that training here improves anybody's own output — it is unmeasured. A guard refuses five phrasings of it; it cannot refuse a sixth.
- **Nothing may count.** Several of these strings are shown after sessions that measured different numbers of families, and one of them sits under a machine list that has changed length twice. Arity in a reused sentence is how “pick either” survived under three cards.
- **Three families, and the limits sentence is load-bearing.** Three named flaws read as “the flaws” without it.
- The unit names (`cents of peak detune`, `ms of drift IQR`) are the pipeline's own labels. They are the weakest lines here and the engineer flagged them; they are also the honest name of the measured quantity, so a friendlier synonym would add a second vocabulary rather than replace one.

#### 5.1 The flaw families — symptom and mechanism (`/learn/flaws`)

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

#### 5.2 The page's two claim-bearing sentences

```
intro:  You can hear that a render is wrong and have no word for it. That is the gap this page closes: three kinds of damage the gym can measure, what each one sounds like, and the machines that find how small a dose of it you can still catch.

limits: These three are what the pipeline can render as a controlled dose with a right answer at the bottom of it. They are not a list of everything that can go wrong with a piece of audio. A render can fail in ways nothing here measures, and this page would rather be short than pretend otherwise.
```

#### 5.3 The page's questions

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

#### 5.4 The front door

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

#### 5.5 The route from a result to the reference

One string, shown on both the Delicacy and Threshold results. It must stay true after a session that measured one family and after a session that measured three.

```
What each flaw is called, and what it sounds like
```

#### 5.6 The delicacy explainer, now that the machine is open

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

**16 clips listed, of which 6 are the ones the standing note names.** Regenerate with `node scripts/export-instrument-deck.mjs > docs/copy-deck-instruments.md` after any change.


---

# Part 3 · The /method page

*Also written to `docs/copy-deck-method.md` by this same command.*


**Generated, do not edit by hand.** `node scripts/export-method-deck.mjs > docs/copy-deck-method.md`

Every sentence rendered on `/method`, enumerated from the same ledger the page renders, so this file and the live page cannot disagree. Read the page itself at `/method` alongside this — the deck gives you numbered handles for edits, not a substitute for seeing it.

### How to use this

The engineer who wrote these is the weaker writer of the two on this project; that is why the file exists. **But this deck is not like the vocabulary one, and the difference matters.** Much of this page is quotation: a claim marked QUOTED contains a passage that a test opens the cited document to verify, word for word. Change those words and the build fails — correctly, because the page would then be putting words in the record's mouth.

So every block below separates the two. The **LOAD-BEARING** lines are quotations and are fixed. Everything around them is mine and is free — and it is usually the weaker half, because it is the half that had to carry a quotation into a sentence without sounding like a citation.

If a locked passage is what makes a sentence bad, say so. The fix is either to re-frame the prose around it or to drop the claim — never to silently reword the quotation.

**Two constraints apply everywhere.**

- **RT-159(a):** wherever the page reconstructs the owner's reasoning rather than quoting a ruling, it must say so. Blocks marked INFERRED render under a visible label. Moving prose between a QUOTED and an INFERRED block changes what the page claims about its own evidence.
- **N3:** no percentile, no cohort, no comparison between people. There are zero real respondents, so any such claim is about people who do not exist.

**Standing facts on the page were last checked 2026-08-27.**

---

### 1. The page's own framing prose

**This is the only prose on the page with no ledger entry behind it, and therefore the only part with nothing verifying it.** It is framing rather than claim, but that is my judgment and worth your eye. It is also entirely free to rewrite.

**Kicker + headline, top of page:**

```
THE HOUSE RULES · HOW THIS IS RUN
What this project refused, and what each refusal cost.
```

**Two opening paragraphs:**

```
The instruments on this site are the visible part. The part worth reading about is the operating model that produced them — a written constitution, two review protocols, and a decision record that has repeatedly deleted finished work for being untrue rather than for being broken.

Any project can list what it built. This page lists what it refused, because a refusal is the only decision with a verifiable cost attached, and because a page of things that went well is a brochure. Each block below names the document it comes from. Those documents are in the repository, and a test opens every one of them on every run to check the quoted passage is still there — if a source is reworded, this page fails the build instead of quietly becoming false.
```

**Closing line:**

```
Standing facts on this page last checked 2026-08-27. The instruments themselves are in the reading room; the measurements behind them are in the Lab, including a page listing what the instruments cannot do.
```

---

### 2. The operating model, in the ruled reader order

Three sections, in the order the direction document fixes: product manager, business analyst, data analyst. Each section's heading and lede are free prose with no ledger entry — same status as §1.

#### Section: For a product manager

**Heading and lede (free prose):**

```
How a decision gets made, and stays made
The project runs on a written constitution and two review protocols. What is unusual is not that they exist. It is that they constrain the engineer more than the owner, and that they are enforced by tests rather than by good intentions.
```

#### 1. `pm-is-not-an-engineer`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** CLAUDE.md

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “they are newer to engineering, so explain tradeoffs in plain language”

Everything else in the block is the engineer's own connective prose and is free.

```
The constitution opens by naming the owner's expertise as a constraint on how work is presented to them: they are newer to engineering, so explain tradeoffs in plain language and teach as you go. Every option put to them has to be legible without the jargon, or the ruling that comes back is a rubber stamp on a sentence nobody understood.
```

#### 2. `asks-must-be-in-the-block`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** docs/redteam-protocol.md

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “any ask NOT in this block is deemed not asked”

Everything else in the block is the engineer's own connective prose and is free.

```
Every request for a decision goes in one fixed block at the end of a reply, and anything outside it does not count: any ask NOT in this block is deemed not asked.
```

#### 3. `defaults-must-be-reversible`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** docs/redteam-protocol.md

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “Defaults must be reversible choices, never one-way doors”

Everything else in the block is the engineer's own connective prose and is free.

```
Each open question carries a default that applies if nobody answers, and the default is constrained rather than chosen: Defaults must be reversible choices, never one-way doors (pricing, data schema, deletions = no default, PM must answer). Silence can therefore only ever produce the undoable option.
```

#### 4. `n2-complexity-is-a-cost`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** restructuring_decision_memo_2026-07-11.md

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “complexity is a cost, not a value”

Everything else in the block is the engineer's own connective prose and is free.

```
The guardrail this project runs on is not a preference for simplicity. It is written down as a cost: complexity is a cost, not a value — and either party may object by citing it.
```

#### 5. `slice-protocol-rationale`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** docs/slice-protocol.md

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “Self-review honesty is inversely proportional to the amount of sunk work under review”

Everything else in the block is the engineer's own connective prose and is free.

```
Work is reviewed in the smallest increment that can be proved on its own, and the reason is written into the protocol: self-review honesty is inversely proportional to the amount of sunk work under review.
```

#### 6. `protocols-defend-against-the-author`

**Kind:** INFERRED — renders under a visible “Inference — the engineer’s reading, not a recorded ruling” label

**Cites:** docs/slice-protocol.md · CLAUDE.md

**No locked passage in this block** — all of it is the engineer's own prose and is free.

```
Both protocols are aimed at the same weakness, and it is not incompetence — it is ownership. A reviewer goes soft on work they built, so the rules shrink what is under review and force the ask into a place it cannot be buried.
```

---

#### Section: For a business analyst

**Heading and lede (free prose):**

```
How a written requirement stays true
Documentation drifting away from the system it describes is the normal condition of software, and it is usually filed under untidiness. Here it is a defect with a failing test attached — because a document describing a gate nobody performs sends the next reader to ask for a sign-off that cannot be given.
```

#### 7. `stale-gate-is-a-false-statement`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** src/content/retired-gates.test.ts

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “written as a thing still to be done, is a false statement in the”

Everything else in the block is the engineer's own connective prose and is free.

```
Two documents once described a quality gate that had been abolished months earlier, as though it were still owed. The rule that came out of it is stated as a matter of truth rather than tidiness: a gate nobody performs any more, written as a thing still to be done, is a false statement in the repository.
```

#### 8. `fix-the-class-not-the-instance`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** src/content/retired-gates.test.ts

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “Fixing the two sentences leaves the class open”

Everything else in the block is the engineer's own connective prose and is free.

```
The repair was not the two sentences. Fixing the two sentences leaves the class open, so the rule became a test that scans every document on every run, proved in both directions, because a guard that has only ever returned clean is not known to check anything.
```

#### 9. `published-text-must-match-the-code`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** src/content/published-text.test.ts

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “change the pool without changing the sentence and this fails”

Everything else in the block is the engineer's own connective prose and is free.

```
The same rule now binds the files this site publishes about itself. They described an instrument of eight clips long after it had grown to sixteen, so the quantities are derived from the shipped item pool instead of being retyped: change the pool without changing the sentence and this fails, naming both numbers.
```

---

#### Section: For a data analyst

**Heading and lede (free prose):**

```
How a number earns the right to be shown
There are no real respondents yet. That single fact governs every figure on this site, and the interesting part is what it forbids rather than what it permits.
```

#### 10. `n3-honesty-rule`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** restructuring_decision_memo_2026-07-11.md

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “no score, percentile, or claim the data can't support”

Everything else in the block is the engineer's own connective prose and is free.

```
The honesty rule is stated as a constraint on output, not an aspiration: no score, percentile, or claim the data can't support.
```

#### 11. `recovery-before-fielding`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** docs/artifact-pivot-2026-08-07.md

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “recover the known parameters”
- “I validated the estimator by parameter recovery before fielding it”

Everything else in the block is the engineer's own connective prose and is free.

```
Before an estimator is trusted with real answers it is run on simulated ones generated from a known model, and required to recover the known parameters. The claim that buys is deliberately modest: I validated the estimator by parameter recovery before fielding it.
```

#### 12. `simulated-is-labelled`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** docs/artifact-pivot-2026-08-07.md

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “in-app, in charts, in the write-up, in the repo”

Everything else in the block is the engineer's own connective prose and is free.

```
Nothing simulated is allowed to pass as observed, anywhere it might be seen: in-app, in charts, in the write-up, in the repo. The badge is not small print. It is the reason the analytics pages are allowed to exist before a single person has taken a test.
```

#### 13. `band-not-point`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** src/engine/delicacy.ts

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “report the band, never the point”

Everything else in the block is the engineer's own connective prose and is free.

```
Where a measurement is noisy the product must show the uncertainty rather than hide it behind a label: report the band, never the point, because a point estimate from a noisy measurement is a claim the measurement cannot support.
```

---

### 3. The four refusals

Each renders as a heading, a small-caps rule line, the refusal, and a paragraph opening “What it cost.” The heading and the rule line are free; a test requires only that the price is substantial and does not say the refusal was free.

#### 14. `refusal-ranked-tiers`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** src/engine/delicacy.ts · docs/handoff-2026-08-22.md

**Heading on screen (free prose):** Six ranked verdict tiers on the Delicacy result

**Rule line on screen (free prose):** Refused under N3, applying RT-90a — report the band, never the point

**Second paragraph opens:** “What it cost. …”

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “put a person in the right one at the shipping length: 30.5%”
- “A tier name is a point estimate wearing an adjective”
- “~42–45 trials = 21 min, which is the session 15 was chosen to avoid”

Everything else in the block is the engineer's own connective prose and is free.

```
They shipped first, and then the measurement meant to justify them killed them. Asked how often the six tiers put a person in the right one at the shipping length: 30.5%. No coarser cut rescued it. A tier name is a point estimate wearing an adjective. The result screen lost the one line a person could repeat to a friend and got an interval instead — wider, duller, and true. Earning a ranked verdict honestly would land on ~42–45 trials = 21 min, which is the session 15 was chosen to avoid. The product kept the shorter session and gave up the sharper claim, rather than keeping both and hoping nobody checked.
```

#### 15. `refusal-paid-tier`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** CLAUDE.md · restructuring_decision_memo_2026-07-11.md · src/content/voice.test.ts

**Heading on screen (free prose):** The paid training arc — the entire business model

**Rule line on screen (free prose):** Refused under the D4 amendment

**Second paragraph opens:** “What it cost. …”

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “there is no paid tier, and no pricing question”
- “Monetization remains a goal but as proof of commercial viability, not income”

Everything else in the block is the engineer's own connective prose and is free.

```
The plan was to give the assessment away and charge for the training arc. It was withdrawn in one line — there is no paid tier, and no pricing question — because a paywall on the training loop would have put the honest deliverable, whether your ear actually moved, behind the wall. The project gave up its only means of showing that anyone would pay for this, at a point where monetization remains a goal but as proof of commercial viability, not income. It also created upkeep nobody budgeted for: six weeks after the ruling, three published sentences still promised the tier — on two reading-room pages and in the file the product serves to AI crawlers. Writing a rule down does not enforce it.
```

#### 16. `refusal-priced-consumer-product`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** restructuring_decision_memo_2026-07-11.md

**Heading on screen (free prose):** The $3.99 consumer product, and the funnel built to feed it

**Rule line on screen (free prose):** Refused under memo C1 — a conclusion of record rather than a rule

**Second paragraph opens:** “What it cost. …”

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “Viral consumer distribution for a $3.99 impulse product is dead”
- “The paid product itself was never tested (4 paywall views)”

Everything else in the block is the engineer's own connective prose and is free.

```
Viral consumer distribution for a $3.99 impulse product is dead, concluded on twenty-nine visitors across a month, with the World Cup front door spreading to nobody at all. A quiz, a share-card pipeline, a paywall and a Merchant-of-Record payment adapter all became legacy in a single decision. And here is the part that is easiest to leave off a page like this: the paid product itself was never tested (4 paywall views). The verdict was reached on distribution evidence, and the pricing question it looks like it answers was never actually asked.
```

#### 17. `refusal-human-ear-check`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** docs/artifact-pivot-2026-08-07.md · docs/blueprint-vs-reality-2026-08-25.md

**Heading on screen (free prose):** The human ear-check on every audio clip

**Rule line on screen (free prose):** Refused under a gate only one person can discharge is debt; artifact pivot §1

**Second paragraph opens:** “What it cost. …”

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “The PM never judges a clip again”
- “Ear-passes by a non-musician = unstable labels = no value”
- “estimated from response data”
- “Zero real responses”

Everything else in the block is the engineer's own connective prose and is free.

```
Quality control was a person listening to each clip and approving it. It was abolished — The PM never judges a clip again — on the owner's own finding: Ear-passes by a non-musician = unstable labels = no value. The gate was not adding quality. It was adding a delay only one person could clear. The replacement has two layers, and the one the pivot itself calls the real gate — item difficulty and discrimination estimated from response data — has never run, because there are Zero real responses. What gates clips today is the acoustic layer alone: loudness, spectral distance, silence, clipping. It can measure how large a manipulation is. It cannot notice that a clip is bad in a way nobody thought to model.
```

---

### 4. The finding against the project itself

Two blocks. The first is the record's own account; the second is my reading of what happened next, and renders under the inference label. **The distinction between them is the single most consequential thing on this page** — if a rewrite blurs which is which, it breaks the condition the page was approved under.

#### 18. `finding-arc-mostly-refuses`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** src/engine/arc.ts · docs/analytics/e14-arc-resolution.txt

**Date line on screen (free prose):** 2026-09-02 · broke N3 — nothing the data cannot support

**Second paragraph opens:** “Since then. …”

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “subtracting two noisy numbers manufactures”

Everything else in the block is the engineer's own connective prose and is free.

```
**NEW**
Before the retest arc was allowed to tell anyone their ear had moved, the size of change it can resolve was measured: the whole hazard here is that subtracting two noisy numbers manufactures progress. Simulating the same unchanged person through two sessions at the shipped length puts the floor on the pitch ladder at roughly three and a half times — the threshold has to more than halve before the difference can be told from ordinary run-to-run wobble. On the prestige test it is eight points of the scale. The delicacy trials cannot support an arc at all: six of their fifteen pairs would have to change hands. Most retests are therefore told, in as many words, that nothing changed the instrument could hear. That refusal is the ordinary output of this feature rather than its edge case, and the sentence names the floor in the reader's own units so it reads as a fact about the instrument rather than a verdict on them. The only thing that lowers the floor is returning: pooled across four sittings it falls to about two and a half times, which is the entire reward this product offers for coming back.
```

#### 19. `finding-launch-avoidance`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** docs/endgame-plan-2026-08-07.md · docs/blueprint-vs-reality-2026-08-25.md

**Date line on screen (free prose):** 2026-08-07 · broke N2 — the anti-theater guardrail

**Second paragraph opens:** “Since then. …”

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “Delicacy got built instead. That is the N2 launch-avoidance pattern, on the record”
- “Nothing is blocked by engineering. Everything is blocked by the launch not having happened”
- “29 real visitors, ever”
- “Zero real responses”

Everything else in the block is the engineer's own connective prose and is free.

```
A ruling had already been made: post the flagship instrument on its own, within one to two weeks, and do not let the second instrument gate it. The second instrument got built instead. The plan written that day says it without softening: Delicacy got built instead. That is the N2 launch-avoidance pattern, on the record. And directly above it, the diagnosis: Nothing is blocked by engineering. Everything is blocked by the launch not having happened. As of the revision date at the foot of this page, it still has not been posted. The product has had 29 real visitors, ever. There are Zero real responses, which is why every psychometric figure in the Lab is generated from a known model and badged as simulated — the dataset that was named as the project's proprietary asset does not exist. Building is the part that feels like progress, and it is the part that was never the constraint.
```

#### 20. `finding-avoidance-then-ratified`

**Kind:** INFERRED — renders under a visible “Inference — the engineer’s reading, not a recorded ruling” label

**Cites:** docs/artifact-pivot-2026-08-07.md · docs/endgame-plan-2026-08-07.md

**Date line on screen (free prose):** 2026-08-07 · broke N2 — the same guardrail, applied to the response rather than the act

**Second paragraph opens:** “Since then. …”

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “Resume value cannot be hostage to a launch the owner has no energy to run”
- “The 2026-09-15 deadline is not a live constraint”

Everything else in the block is the engineer's own connective prose and is free.

```
What happened next is the part that is harder to read, and this reading is mine rather than a recorded ruling. Within the same week the project adopted a direction that made the avoided thing optional: Resume value cannot be hostage to a launch the owner has no energy to run, and after it, The 2026-09-15 deadline is not a live constraint. That argument is sound on its own terms. It is also, in sequence, a project noticing that it was avoiding something and then removing the requirement to do it. I cannot tell from the record which of the two it was, and neither can a reader, so the page says so rather than choosing the flattering reading. The test that would settle it is not an argument: it is whether the instruments are ever put in front of strangers. Until they are, the honest description of this project is that it has built three working instruments and measured them against simulated respondents.
```

---

**20 numbered blocks.** Regenerate with `node scripts/export-method-deck.mjs > docs/copy-deck-method.md` after any ledger change.


---

**34 of the 142 sentences here are new.** They are the ones that do not appear in the three per-deck files as they stood at HEAD~1, because this is the first assembly and there was no combined document to compare against.

