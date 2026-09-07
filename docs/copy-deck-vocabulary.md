# Vocabulary copy deck — for a writing pass

**Generated, do not edit by hand.** `node scripts/export-copy-deck.mjs > docs/copy-deck-vocabulary.md`

Every sentence the vocabulary layer can render, enumerated from the same fixtures the voice gate uses (`src/content/vocabulary/fixtures.ts`), so this file and the shipped product cannot disagree.

## How to use this

The engineer who wrote these is the weaker writer of the two on this project; that is the reason the file exists. Rewrite freely **within the rules listed under each section** — those are not style preferences, they are measurement constraints, and several were bought with defects found by reading rendered output. If a rule seems to be what makes a sentence bad, say so and it gets re-examined; do not quietly drop it.

Two constraints apply everywhere. **D1:** every sentence is about the performance, never about the person. **N3:** no percentile, no cohort, no comparison to other people — there are zero real respondents, so any such claim is about people who do not exist.

---

## 1. Threshold result — “WHAT THIS MEANS IN A RENDER”

**Where it renders.** Renders on `/threshold/[slug]/result` and at the end of a Gym session, in a bordered panel BELOW the measurement paragraphs and ABOVE the no-cohort footnote.

**What the screen has already said.** The screen has already said: the band (“You caught the damage at 25 cents. At 8.8 cents you were guessing.”), the fitted point where one exists, the per-rung ladder, the material, and “Come back in a week and run it again.”

**This layer's job.** Say what this flaw IS in a track the reader made, and what their measured band implies gets past them.

**Rules this copy must keep:**

- Two sentences; ONE on a wide band (the screen has already refused twice — a third is noise).
- No comparative that inverts on the kbps ladder — say “gentler/harsher”, never “below 96 kbps”.
- No claim about the person, no prediction about their future (D1).
- Must not reuse `bandLine`'s phrases (“You caught the damage at”, “you were guessing”).

**12 sentences to review** — 25 concrete variants, 78 reachable renderings. Braces mark values the engine fills in; leave them as slots.

> Damage gentler than {cents} slipped past you on these clips. That is the margin a render can wander inside while still sounding clean to you.

  *As rendered:* “Damage gentler than 100 cents slipped past you on these clips. That is the margin a render can wander inside while still sounding clean to you.”  ·  “Damage gentler than 17.7 cents slipped past you on these clips. That is the margin a render can wander inside while still sounding clean to you.”

> Damage gentler than {ms} slipped past you on these clips. That is the margin a render can wander inside while still sounding clean to you.

  *As rendered:* “Damage gentler than 50 ms slipped past you on these clips. That is the margin a render can wander inside while still sounding clean to you.”

> Damage gentler than {kbps} slipped past you on these clips. That is the margin a render can wander inside while still sounding clean to you.

  *As rendered:* “Damage gentler than 96 kbps slipped past you on these clips. That is the margin a render can wander inside while still sounding clean to you.”

> In a render this is the lead that turns faintly sour over a long note — a vocal, a bowed string, a synth lead — where the slide is slow enough to read as a bad performance rather than bad audio.

> In a render this is the rubbery, unanchored feel — everything agreeing on the tempo but not quite on where the beat sits, so the groove never locks.

> In a render this is the underwater, brittle quality — cymbals turning to gauze, reverb tails breaking into grit, the whole thing sounding like a worse copy of itself.

> This session never found a level of damage you catch reliably, so it cannot say what would slip past you — only that {cents} already did.

  *As rendered:* “This session never found a level of damage you catch reliably, so it cannot say what would slip past you — only that 100 cents already did.”  ·  “This session never found a level of damage you catch reliably, so it cannot say what would slip past you — only that 35.4 cents already did.”  · …and 1 more

> This session never found a level of damage you catch reliably, so it cannot say what would slip past you — only that {ms} already did.

  *As rendered:* “This session never found a level of damage you catch reliably, so it cannot say what would slip past you — only that 100 ms already did.”  ·  “This session never found a level of damage you catch reliably, so it cannot say what would slip past you — only that 19.8 ms already did.”  · …and 2 more

> This session never found a level of damage you catch reliably, so it cannot say what would slip past you — only that {kbps} already did.

  *As rendered:* “This session never found a level of damage you catch reliably, so it cannot say what would slip past you — only that 32 kbps already did.”  ·  “This session never found a level of damage you catch reliably, so it cannot say what would slip past you — only that 48 kbps already did.”  · …and 1 more

> This session pinned {ms} as damage you catch, but never found the level where you stop catching it — so what gets past you is gentler than that, by some amount these clips never established.

  *As rendered:* “This session pinned 12.5 ms as damage you catch, but never found the level where you stop catching it — so what gets past you is gentler than that, by some amount these clips never established.”  ·  “This session pinned 15.7 ms as damage you catch, but never found the level where you stop catching it — so what gets past you is gentler than that, by some amount these clips never established.”

> This session pinned {kbps} as damage you catch, but never found the level where you stop catching it — so what gets past you is gentler than that, by some amount these clips never established.

  *As rendered:* “This session pinned 160 kbps as damage you catch, but never found the level where you stop catching it — so what gets past you is gentler than that, by some amount these clips never established.”  ·  “This session pinned 192 kbps as damage you catch, but never found the level where you stop catching it — so what gets past you is gentler than that, by some amount these clips never established.”  · …and 1 more

> This session pinned {cents} as damage you catch, but never found the level where you stop catching it — so what gets past you is gentler than that, by some amount these clips never established.

  *As rendered:* “This session pinned 3.1 cents as damage you catch, but never found the level where you stop catching it — so what gets past you is gentler than that, by some amount these clips never established.”  ·  “This session pinned 6.3 cents as damage you catch, but never found the level where you stop catching it — so what gets past you is gentler than that, by some amount these clips never established.”  · …and 1 more

---

## 2. Delicacy result — “WHAT THIS MEANS IN YOUR WORK”

**Where it renders.** Renders on `/delicacy/result` and in the flow's reveal, between the flaw line it interprets and the “DID YOU KNOW WHEN YOU KNEW?” calibration block.

**What the screen has already said.** The screen has already said: the score against chance, the detection band, “And on the ones you caught, you named the flaw 5 of 8 times”, and the whole calibration read.

**This layer's job.** Say why NAMING a flaw is the half that transfers, and why the result is not broken down per flaw.

**Rules this copy must keep:**

- The second sentence is a REFUSAL and the arithmetic forces it: at 5 pairs a family, an equally good ear looks uneven 88.7–92.8% of the time. It must not read as modesty or apology.
- A session that caught nothing gets ONE sentence, not two stacked refusals.
- Never a per-family count or percentage on this screen.
- Must say nothing about confidence or calibration — that block owns it.

**3 sentences to review** — 4 concrete variants, 5 reachable renderings. Braces mark values the engine fills in; leave them as slots.

> Naming is the half that transfers. Hearing that a render is wrong sends you back to generate again and hope; hearing which of the three it is sends you to a control that fixes it. You named it {n} of the {times} you were asked.

  *As rendered:* “Naming is the half that transfers. Hearing that a render is wrong sends you back to generate again and hope; hearing which of the three it is sends you to a control that fixes it. You named it 10 of the 10 times you were asked.”  ·  “Naming is the half that transfers. Hearing that a render is wrong sends you back to generate again and hope; hearing which of the three it is sends you to a control that fixes it. You named it 15 of the 15 times you were asked.”

> The naming question only comes after a pair you called correctly, and this session never reached one — so it says nothing about whether you can name a flaw, only about whether you spotted one.

> This session will not break your result down by flaw type, and the reason is arithmetic rather than modesty: at {pairs} of each, a listener equally good at all three comes out with uneven tallies about nine times in ten. Any split shown here would mostly be luck wearing a label.

  *As rendered:* “This session will not break your result down by flaw type, and the reason is arithmetic rather than modesty: at 5 pairs of each, a listener equally good at all three comes out with uneven tallies about nine times in ten. Any split shown here would mostly be luck wearing a label.”

---

## 3. Prestige result — “WHAT THIS MEANS IN YOUR WORK”

**Where it renders.** Renders on `/bias/result` and in the flow's debrief, under the verdict and above the share card.

**What the screen has already said.** The screen has already said: the signed percentage, “how far these ratings moved toward the labels”, the verdict pair (“Label-driven.” / “Steady ears.” / “Contrarian.”), and — in the flow — the receipt pill “You moved with the label on N of M clips that could move.”

**This layer's job.** Name where the same KIND of cue lives in the reader's own work, and mark the boundary of what was measured.

**Rules this copy must keep:**

- Carries NO counts — the receipt pill and the share card own those.
- The test measured a composer's name on a stranger's recording. It did NOT measure sunk cost, model provenance, or social commitment. Those may be NAMED as cues; it may never be claimed they moved anyone.
- A contrarian result must not be congratulated as unbiased.

**4 sentences to review** — 4 concrete variants, 6 reachable renderings. Braces mark values the engine fills in; leave them as slots.

> In your own work the label is rarely a composer's name. It is which model made it, how long you spent on the prompt, and whether this is the take you already told someone was the good one.

> That result is about these names, on this afternoon. The cues above are the ones this test could not put in front of you, so nothing here has measured what they do to your judgment.

> This test played every clip unlabelled first, and that order is the part worth stealing: the cue has to be gone before the judgment, not argued away after it.

> Your ratings ran against the names rather than with them, which is still the name doing the steering — only in reverse. The remedy does not change: decide before the label arrives, not after it.

---

## 4. The Ranking Test — “WHERE YOUR GAPS FELL”

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

> Across the four pairs he placed far apart, your two ratings differed by {n}.{n} points on average. Across the four pairs he bracketed together, {n}.{n}. Rating at random produces {n}.{n} on both, because chance does not know which works a critic separated.

  *As rendered:* “Across the four pairs he placed far apart, your two ratings differed by 0.0 points on average. Across the four pairs he bracketed together, 0.0. Rating at random produces 3.6 on both, because chance does not know which works a critic separated.”  ·  “Across the four pairs he placed far apart, your two ratings differed by 0.0 points on average. Across the four pairs he bracketed together, 5.3. Rating at random produces 3.6 on both, because chance does not know which works a critic separated.”  · …and 1 more

> Across the three pairs he placed far apart, your two ratings differed by {n}.{n} points on average. Across the three pairs he bracketed together, {n}.{n}. Rating at random produces {n}.{n} on both, because chance does not know which works a critic separated.

  *As rendered:* “Across the three pairs he placed far apart, your two ratings differed by 5.0 points on average. Across the three pairs he bracketed together, 4.7. Rating at random produces 3.6 on both, because chance does not know which works a critic separated.”

> Neither number says you agreed with him, and neither could: this looks only at how far apart your two ratings fell, never at which one you placed higher. Preferring the work he ranked lower costs you nothing, because agreement was never imported and cannot be worked out. Small numbers are not a poor result either — six recordings of six different works are not spaced out by quality, and if they genuinely sounded close, rating them close was the accurate thing to do.

> No number this time. Setting aside the one you had heard before left five clips, and that makes only one usable widely-spaced pair where this needs three. Under that count, one clip's wobble is larger than the thing being measured. Nothing you do differently changes that; the pool would have to grow.

> No number this time. Setting aside the two you had heard before left four clips, and that makes only one usable closely-spaced pair where this needs three. Under that count, one clip's wobble is larger than the thing being measured. Nothing you do differently changes that; the pool would have to grow.

> One clip you had heard before was set aside before anything was worked out, so what follows rests on the five that were new to you. You said which of these you had heard before, and that was taken at face value — nothing here verifies it. Recognition only ever removes clips; what you recognised is never part of a result.

> Two clips you had heard before were set aside before anything was worked out, so what follows rests on the four that were new to you. You said which of these you had heard before, and that was taken at face value — nothing here verifies it. Recognition only ever removes clips; what you recognised is never part of a result.

> You gave every one of these the same rating, so there are no gaps to compare and nothing here to work on. That is an answer, not a failure to produce one.

> You had heard all six of these before, so there is nothing here to read. This one only works on music that is new to you — on anything you already know, a rating is partly memory, and no instrument can separate the two afterwards. There is no second attempt that would fix that: it needs more music than this pool currently holds. Come back if it grows.

> You had heard every clip here before, so all six were set aside. You said which of these you had heard before, and that was taken at face value — nothing here verifies it. Recognition only ever removes clips; what you recognised is never part of a result.

> You said none of these were familiar, so all of them counted. You said which of these you had heard before, and that was taken at face value — nothing here verifies it. Recognition only ever removes clips; what you recognised is never part of a result.

> Your ratings moved further apart where his judgment did not. Whether that means anything is a question this cannot answer: four pairs against four, drawn from a set of clips that each appear in several pairs, and nobody has sat this twice to find out how far these numbers wander on their own. There is no honest size at which the gap between them becomes a result, so none is offered.

> Your ratings moved further apart where his judgment did. Whether that means anything is a question this cannot answer: three pairs against three, drawn from a set of clips that each appear in several pairs, and nobody has sat this twice to find out how far these numbers wander on their own. There is no honest size at which the gap between them becomes a result, so none is offered.

---

## 5. The retest arc — “DID YOUR EAR MOVE”

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

**14 sentences to review** — 14 concrete variants, 14 reachable renderings. Braces mark values the engine fills in; leave them as slots.

> Across your pitch drift sittings, it now takes a larger flaw to reach you than it did — a change of about 11x. This ladder cannot distinguish anything under {n}.5x from ordinary run-to-run wobble, so a move this size is the instrument speaking rather than the dice.

  *As rendered:* “Across your pitch drift sittings, it now takes a larger flaw to reach you than it did — a change of about 11x. This ladder cannot distinguish anything under 3.5x from ordinary run-to-run wobble, so a move this size is the instrument speaking rather than the dice.”

> Across your pitch drift sittings, you now catch a smaller flaw than you did — a change of about 11x. This ladder cannot distinguish anything under {n}.5x from ordinary run-to-run wobble, so a move this size is the instrument speaking rather than the dice.

  *As rendered:* “Across your pitch drift sittings, you now catch a smaller flaw than you did — a change of about 11x. This ladder cannot distinguish anything under 3.5x from ordinary run-to-run wobble, so a move this size is the instrument speaking rather than the dice.”

> Across your pitch drift sittings, you now catch a smaller flaw than you did — a change of about {n}.9x. This ladder cannot distinguish anything under {n}.5x from ordinary run-to-run wobble, so a move this size is the instrument speaking rather than the dice.

  *As rendered:* “Across your pitch drift sittings, you now catch a smaller flaw than you did — a change of about 8.9x. This ladder cannot distinguish anything under 2.5x from ordinary run-to-run wobble, so a move this size is the instrument speaking rather than the dice.”

> Across your pitch drift sittings, you now catch a smaller flaw than you did. One sitting ran past the end of what this ladder can render, so the direction holds but the size does not — all that can be said is that the move cleared {n}.5x, the smallest change this machine can tell from noise.

  *As rendered:* “Across your pitch drift sittings, you now catch a smaller flaw than you did. One sitting ran past the end of what this ladder can render, so the direction holds but the size does not — all that can be said is that the move cleared 3.5x, the smallest change this machine can tell from noise.”

> Across your timing smear sittings, you now catch a smaller flaw than you did — a change of about {n}.4x. This ladder cannot distinguish anything under {n}.5x from ordinary run-to-run wobble, so a move this size is the instrument speaking rather than the dice.

  *As rendered:* “Across your timing smear sittings, you now catch a smaller flaw than you did — a change of about 7.4x. This ladder cannot distinguish anything under 2.5x from ordinary run-to-run wobble, so a move this size is the instrument speaking rather than the dice.”

> Nobody has measured how much this machine's numbers wander between sittings, so there is no honest line between a change and a coin flip here. Until there is, it says nothing.

> One sitting cannot say whether your ear moved — there is nothing to compare it against. A second one in this browser is what makes that sentence possible at all.

> The label moved you +{n}% before and +{n}% since. That gap is inside the {n} points this test wanders by on its own, so it is not a change anybody could stand behind — the same person, retested, moves this much without anything about them changing.

  *As rendered:* “The label moved you +20% before and +15% since. That gap is inside the 8 points this test wanders by on its own, so it is not a change anybody could stand behind — the same person, retested, moves this much without anything about them changing.”

> The label moved you +{n}% before and {n}% since — {n} points closer to zero, where zero means the name changed nothing. That is more than the {n} points this test wanders by on its own, so a name is doing less to what you hear than it was.

  *As rendered:* “The label moved you +20% before and 0% since — 20 points closer to zero, where zero means the name changed nothing. That is more than the 8 points this test wanders by on its own, so a name is doing less to what you hear than it was.”

> The label moved you {n}% before and +{n}% since — {n} points further from zero, and more than the {n} points this test wanders by on its own. A name is doing more to what you hear than it was. Both directions count: marking a labelled clip down is still the name deciding, not your ears.

  *As rendered:* “The label moved you 0% before and +20% since — 20 points further from zero, and more than the 8 points this test wanders by on its own. A name is doing more to what you hear than it was. Both directions count: marking a labelled clip down is still the name deciding, not your ears.”

> These trials are too short to show change over time. Your score would have to move by six of the fifteen pairs — or four of a single flaw's five — before it meant anything, so this machine reports where you are and leaves the question of movement to the threshold ladders.

> These two compression sessions ran on different recordings, so they are not comparable. A fixed bitrate does up to twice as much damage to one recording as to another, which means the difference between these two sittings would be a fact about the music rather than about you.

> This rests on {n} sittings — {n} before and {n} since. That is what pulled the line above down from {n}.5x to {n}.5x: the wobble of an average falls as the square root of how many sittings are in it, so each time you come back, a smaller real change becomes visible.

  *As rendered:* “This rests on 4 sittings — 2 before and 2 since. That is what pulled the line above down from 3.5x to 2.5x: the wobble of an average falls as the square root of how many sittings are in it, so each time you come back, a smaller real change becomes visible.”

> Your pitch drift sittings are {n}.9x apart, which this ladder cannot tell from its own noise. It would take about {n}.5x before a change here meant anything. That is not a report that you stood still — it is the instrument saying a move this small is beneath what it can see.

  *As rendered:* “Your pitch drift sittings are 1.9x apart, which this ladder cannot tell from its own noise. It would take about 3.5x before a change here meant anything. That is not a report that you stood still — it is the instrument saying a move this small is beneath what it can see.”

---

## 6. Combined view — “ACROSS YOUR SESSIONS”

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

> You have answered {n} different questions about your ears: whether a name changes what you hear; whether your ratings move where a critic's judgment moved. They are not {n} scores of one thing and they do not add up — each is measured in its own terms.

  *As rendered:* “You have answered 2 different questions about your ears: whether a name changes what you hear; whether your ratings move where a critic's judgment moved. They are not 2 scores of one thing and they do not add up — each is measured in its own terms.”

> You have answered {n} different questions about your ears: whether you can tell damage from clean and say what it is; how small a flaw has to get before you lose it. They are not {n} scores of one thing and they do not add up — each is measured in its own terms.

  *As rendered:* “You have answered 2 different questions about your ears: whether you can tell damage from clean and say what it is; how small a flaw has to get before you lose it. They are not 2 scores of one thing and they do not add up — each is measured in its own terms.”

> You have answered {n} different questions about your ears: whether a name changes what you hear; whether you can tell damage from clean and say what it is; how small a flaw has to get before you lose it. They are not {n} scores of one thing and they do not add up — each is measured in its own terms.

  *As rendered:* “You have answered 3 different questions about your ears: whether a name changes what you hear; whether you can tell damage from clean and say what it is; how small a flaw has to get before you lose it. They are not 3 scores of one thing and they do not add up — each is measured in its own terms.”

> You have answered {n} different questions about your ears: whether a name changes what you hear; whether you can tell damage from clean and say what it is; how small a flaw has to get before you lose it; whether your ratings move where a critic's judgment moved. They are not {n} scores of one thing and they do not add up — each is measured in its own terms.

  *As rendered:* “You have answered 4 different questions about your ears: whether a name changes what you hear; whether you can tell damage from clean and say what it is; how small a flaw has to get before you lose it; whether your ratings move where a critic's judgment moved. They are not 4 scores of one thing and they do not add up — each is measured in its own terms.”

---

## 7. The expert panel — “THE RAW RECORD”

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

> Every clip, in the order you heard them

> Every number behind the result, and the answer key. No verdict, no interpretation — and it is read from this browser, so a link you share carries none of it.

> Every pair that counted · by the numbers above

> Every pair, in the order you met them

> Every rung · gentlest first

> The distance column is the whole of what was taken from the critic's list. Which of two works he placed higher was never read in, so no table here can be sorted into his order and no agreement figure can be recovered from it — not by this page, not by you, not later.

> The pairs below are your ratings as they fell; the averages are missing because too few pairs survived for either one to mean anything. Nothing has been hidden — the figure was never worked out.

> The two percentages agree because the pool carries as many acclaimed labels as dismissive ones, and a balanced set cancels re-listen drift outright. The correction is shown anyway: it is what would move if that balance ever changed.

> Timing rungs are shown by number: the pool stores them as a tempo fraction and the staircase measures milliseconds of drift, so quoting one as the other would be a guess.

> What follows is the end of your blind sitting. These six were rated before you knew what they were, and they cannot be again — a second attempt at this instrument would be rating music you have now been told about.

> What the pipeline measured and could not fix

---

**160 concrete sentences across 7 surfaces.**

Anything rewritten here must still pass `src/content/voice.test.ts`, which screens five named hazards — motive attribution, person-verdicts, beige chrome, fabricated norms, unmeasured audibility claims. A green run there does **not** mean the prose is good; it means no named hazard is present. Judging whether it is good is the point of this document.
