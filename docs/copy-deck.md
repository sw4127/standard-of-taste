# The copy deck — everything a reader sees, for a writing pass

**Generated, do not edit by hand.** `node scripts/export-copy-decks.mjs` rewrites this file and the three it is assembled from, so they cannot drift apart.

Every sentence below is enumerated from the code that renders it, so this document and the shipped product cannot disagree.

## How to use this

The engineer who wrote these is the weaker writer of the two on this project; that is the reason the file exists. Rewrite freely **within the rules listed under each section** — those are not style preferences, they are measurement constraints, and several were bought with defects found by reading rendered output. If a rule seems to be what makes a sentence bad, say so and it gets re-examined; do not quietly drop it.

Two constraints apply everywhere. **D1:** every sentence is about the performance, never about the person. **N3:** no percentile, no cohort, no comparison to other people — there are zero real respondents, so any such claim is about people who do not exist.

**Every sentence carries an id and a state.** Return edits keyed on the id — `VOC-THRESHOLD-RESULT-01` — and nothing has to be matched by eye. The state says what may be changed: **OPEN** is free within the section rules; **LOCKED** must not be touched at all; **PART-LOCKED** means the prose is free but the quoted words listed in that section must survive verbatim, because a test verifies them against the document they came from; **PASSED** has already been through a writer and is here for context rather than for rewriting.

**Which of these surfaces has ever been through a writer is in `docs/copy-review-ledger.md`.** Read that first: it is the only honest answer to "what is left to do", and today it says none of them.

## Contents

- **Part 1 · The vocabulary layer** — Every sentence the instruments' reading layer can render, per surface. This is the largest part and the part most worth a writer.
- **Part 2 · The instrument copy** — The four batches that are not the reading layer: the clip blurbs, the result title, the flaw line, the not-built-yet notice, and the creator vocabulary.
- **Part 3 · The page copy** — Every paragraph a reader meets in the reading room, on /legal, and in the Ranking Test's frame. This copy lives inline in the components, so it is a reading surface here and edits land in the .tsx files named under each section.
- **Part 4 · The /method page** — Every claim on the published methodology page. Read this one against the live page: much of it is quotation, and the quoted words are fixed by a test.


---

# Part 1 · The vocabulary layer

*Also written to `docs/copy-deck-vocabulary.md` by this same command.*


**Generated, do not edit by hand.** `node scripts/export-copy-deck.mjs > docs/copy-deck-vocabulary.md`

Every sentence the vocabulary layer can render, enumerated from the same fixtures the voice gate uses (`src/content/vocabulary/fixtures.ts`), so this file and the shipped product cannot disagree.

---

### 1. Threshold result — “WHAT THIS MEANS IN A RENDER”

**Where it renders.** Renders on `/threshold/[slug]/result` and at the end of a Gym session, in a bordered panel BELOW the measurement paragraphs and ABOVE the no-cohort footnote. Not adjacent to that footnote: the retest arc, the combined view and the expert panel are all between them when the reader has earned any of the three.

**What the screen has already said.** The screen has already said: the band (“You caught the damage at 25 cents. At 8.8 cents you were guessing.”), the fitted point where one exists, the per-rung ladder, the material, and “Come back in a week and run it again.”

**This layer's job.** Say what this flaw IS in a track the reader made, and what their measured band implies gets past them.

**What renders with it, in order.** `creatorLines` in `threshold.ts` emits, in this order: (1) what this flaw sounds like in a track the reader made; (2) what their measured band implies gets past them. (1) renders every time; (2) renders only on a band narrow enough to name a limit. The consequence is dropped on a wide band rather than hedged, because the screen above has already refused twice and a third refusal is noise.

**Rules this copy must keep:**

- Two sentences; ONE on a wide band (the screen has already refused twice — a third is noise).
- No comparative that inverts on the kbps ladder — say “gentler/harsher”, never “below 96 kbps”.
- No claim about the person, no prediction about their future (D1).
- Must not reuse `bandLine`'s phrases (“You caught the damage at”, “you were guessing”).

**6 templates to review** — they render 25 distinct sentences across 78 reachable renderings. Each block below is the TEMPLATE, read from the source file, with `${…}` marking its real slots; the italic lines under it are examples of how it renders. Rewrite the template. Leave every slot exactly as it is — a slot is a value the engine computes, and resolving one freezes a number or a name that is supposed to move.

`VOC-THRESHOLD-RESULT-01` · OPEN
> Damage gentler than ${quantity(heardAt, unit)} slipped past you on these clips. That is the margin a render can wander inside while still sounding clean to you.

  *As rendered:* “Damage gentler than 100 cents slipped past you on these clips. That is the margin a render can wander inside while still sounding clean to you.”  ·  “Damage gentler than 17.7 cents slipped past you on these clips. That is the margin a render can wander inside while still sounding clean to you.”  · …and 2 more

`VOC-THRESHOLD-RESULT-02` · OPEN
> In a render this is the lead that turns faintly sour over a long note — a vocal, a bowed string, a synth lead — where the slide is slow enough to read as a bad performance rather than bad audio.

`VOC-THRESHOLD-RESULT-03` · OPEN
> In a render this is the rubbery, unanchored feel — everything agreeing on the tempo but not quite on where the beat sits, so the groove never locks.

`VOC-THRESHOLD-RESULT-04` · OPEN
> In a render this is the underwater, brittle quality — cymbals turning to gauze, reverb tails breaking into grit, the whole thing sounding like a worse copy of itself.

`VOC-THRESHOLD-RESULT-05` · OPEN
> This session never found a level of damage you catch reliably, so it cannot say what would slip past you — only that ${quantity(missedAt!, unit)} already did.

  *As rendered:* “This session never found a level of damage you catch reliably, so it cannot say what would slip past you — only that 100 cents already did.”  ·  “This session never found a level of damage you catch reliably, so it cannot say what would slip past you — only that 100 ms already did.”  · …and 8 more

`VOC-THRESHOLD-RESULT-06` · OPEN
> This session pinned ${quantity(heardAt, unit)} as damage you catch, but never found the level where you stop catching it — so what gets past you is gentler than that, by some amount these clips never established.

  *As rendered:* “This session pinned 12.5 ms as damage you catch, but never found the level where you stop catching it — so what gets past you is gentler than that, by some amount these clips never established.”  ·  “This session pinned 15.7 ms as damage you catch, but never found the level where you stop catching it — so what gets past you is gentler than that, by some amount these clips never established.”  · …and 6 more

---

### 2. Delicacy result — “WHAT THIS MEANS IN YOUR WORK”

**Where it renders.** Renders on `/delicacy/result` and in the flow's reveal, between the flaw line it interprets and the “DID YOU KNOW WHEN YOU KNEW?” calibration block.

**What the screen has already said.** The screen has already said: the score against chance, the detection band, “And on the ones you caught, you named the flaw 5 of 8 times”, and the whole calibration read.

**This layer's job.** Say why NAMING a flaw is the half that transfers, and why the result is not broken down per flaw.

**What renders with it, in order.** `creatorLines` in `delicacy.ts` emits, in this order: (1) why naming a flaw is the half that transfers, or that the session never reached the question; (2) why the result is not broken down per flaw family. (1) renders every time; (2) renders only when a split was possible to ask for. On a session that caught nothing, the FIRST line is itself a refusal — it says the naming question was never reached — and it carries the screen alone. Two refusals stacked at the bottom of an already-empty result is boilerplate.

**Rules this copy must keep:**

- The second sentence is a REFUSAL and the arithmetic forces it: at 5 pairs a family, an equally good ear looks uneven 88.7–92.8% of the time. It must not read as modesty or apology.
- A session that caught nothing gets ONE sentence, not two stacked refusals.
- Never a per-family count or percentage on this screen.
- Must say nothing about confidence or calibration — that block owns it.

**6 templates to review** — they render 7 distinct sentences across 8 reachable renderings. Each block below is the TEMPLATE, read from the source file, with `${…}` marking its real slots; the italic lines under it are examples of how it renders. Rewrite the template. Leave every slot exactly as it is — a slot is a value the engine computes, and resolving one freezes a number or a name that is supposed to move.

`VOC-DELICACY-RESULT-01` · OPEN
> Naming is the half that transfers. Hearing that a render is wrong sends you back to generate again and hope; hearing which of the three it is sends you to a control that fixes it. You named it ${flawCorrect} of the ${flawEligible} times you were asked.

  *As rendered:* “Naming is the half that transfers. Hearing that a render is wrong sends you back to generate again and hope; hearing which of the three it is sends you to a control that fixes it. You named it 10 of the 10 times you were asked.”  ·  “Naming is the half that transfers. Hearing that a render is wrong sends you back to generate again and hope; hearing which of the three it is sends you to a control that fixes it. You named it 15 of the 15 times you were asked.”

`VOC-DELICACY-RESULT-02` · OPEN
> The naming question only comes after a pair you called correctly, and this session never reached one — so it says nothing about whether you can name a flaw, only about whether you spotted one.

`VOC-DELICACY-RESULT-03` · OPEN
> This session will not break your result down by flaw type, and the reason is arithmetic rather than modesty: at ${per} pairs of each, a listener equally good at all three comes out with uneven tallies about nine times in ten. Any split shown here would mostly be luck wearing a label.

  *As rendered:* “This session will not break your result down by flaw type, and the reason is arithmetic rather than modesty: at 5 pairs of each, a listener equally good at all three comes out with uneven tallies about nine times in ten. Any split shown here would mostly be luck wearing a label.”

> leads and vocals going quietly sour

`VOC-DELICACY-RESULT-04` · OPEN
> the brittle, underwater sheen of a bad export

> the groove never quite locking

---

### 3. Prestige result — “WHAT THIS MEANS IN YOUR WORK”

**Where it renders.** Renders on `/bias/result` and in the flow's debrief, directly under the verdict. It is above the share card but nowhere near it: the degrees-of-praise reading, the retest arc, the combined view and the expert panel sit between this block and the card.

**What the screen has already said.** The screen has already said: the signed percentage, “how far these ratings moved toward the labels”, the verdict pair (“Label-driven.” / “Steady ears.” / “Contrarian.”), and — in the flow — the receipt pill “You moved with the label on N of M clips that could move.”

**This layer's job.** Name where the same KIND of cue lives in the reader's own work, and mark the boundary of what was measured.

**What renders with it, in order.** `creatorLines` in `bias.ts` emits, in this order: (1) the cues this test could not put in front of the reader (`CUE_IN_YOUR_WORK`); (2) the verdict-branched boundary, which refers back to the line above as "the cues above". All of them render only when some rating had headroom to move. The two render together or not at all, and the second refers back to the first, so a rewrite that drops the cue list leaves the boundary pointing at nothing.

**Rules this copy must keep:**

- Carries NO counts — the receipt pill and the share card own those.
- The test measured a composer's name on a stranger's recording. It did NOT measure sunk cost, model provenance, or social commitment. Those may be NAMED as cues; it may never be claimed they moved anyone.
- A contrarian result must not be congratulated as unbiased.

**4 templates to review** — they render 4 distinct sentences across 6 reachable renderings. Each block below is the TEMPLATE, read from the source file, with `${…}` marking its real slots; the italic lines under it are examples of how it renders. Rewrite the template. Leave every slot exactly as it is — a slot is a value the engine computes, and resolving one freezes a number or a name that is supposed to move.

`VOC-PRESTIGE-RESULT-01` · OPEN
> In your own work the label is rarely a composer's name. It is which model made it, how long you spent on the prompt, and whether this is the take you already told someone was the good one.

`VOC-PRESTIGE-RESULT-02` · OPEN
> That result is about these names, on this afternoon. The cues above are the ones this test could not put in front of you, so nothing here has measured what they do to your judgment.

`VOC-PRESTIGE-RESULT-03` · OPEN
> This test played every clip unlabelled first, and that order is the part worth stealing: the cue has to be gone before the judgment, not argued away after it.

`VOC-PRESTIGE-RESULT-04` · OPEN
> Your ratings ran against the names rather than with them, which is still the name doing the steering — only in reverse. The remedy does not change: decide before the label arrives, not after it.

---

### 4. The Ranking Test — “WHERE YOUR GAPS FELL”

**Where it renders.** The whole reading on `/spread`, below the two figures. There is no share page for this instrument, so this is the only place these sentences are ever seen.

**What the screen has already said.** The screen has already shown the two numbers themselves, each with the chance figure beside it (“Rating at random gives 3.6 on both”). On a refused reading it has shown no number at all.

**This layer's job.** Say what was set aside and why, read both figures against chance, name which way they fell without claiming the gap between them means anything, and mark the boundary.

**What renders with it, in order.** `spreadLines` in `spread.ts` emits, in this order: (1) what was set aside, and on a refused reading why that leaves too little; (2) the two figures, each against the chance figure; (3) which way the gaps fell, with the refusal to size the difference attached; (4) the limit on what this instrument can say (`SPREAD_BOUNDARY`). (1) and (4) render every time; (2) and (3) render only when a reading was produced. The boundary is always the last thing a reader sees, so anything it already says does not need saying above it.

**Rules this copy must keep:**

- AGREEMENT WITH THE CRITIC IS NEVER SCORED AND CANNOT BE COMPUTED. Only the DISTANCE between two of his positions was ever imported, never which he ranked higher. No sentence may imply the reader agreed or disagreed with him, or that agreeing would be better.
- The difference between the two figures is never reported (RT-N2 a). Both numbers, side by side, against chance — never their gap, because nobody has sat this twice and there is no measured wobble against which a difference could be called real.
- The recognition filter is SELF-REPORT and that is disclosed every time it is described (N3). Nothing checks; it only ever removes evidence, and what was recognised is never a score.
- A REFUSAL MUST NOT FLATTER. “You know your Beethoven!” converts a failure to measure into a compliment about the person — a verdict smuggled in where the instrument just said it had nothing. Every refusal names what was set aside and invites the reader back.
- Small numbers are not a poor result. Six recordings of six different works are not spaced out by quality; if they genuinely sounded close, rating them close was accurate.
- Nothing may count. Every number in a sentence is derived from the result, never written in.

**9 templates to review** — they render 15 distinct sentences across 25 reachable renderings. Each block below is the TEMPLATE, read from the source file, with `${…}` marking its real slots; the italic lines under it are examples of how it renders. Rewrite the template. Leave every slot exactly as it is — a slot is a value the engine computes, and resolving one freezes a number or a name that is supposed to move.

`VOC-RANKING-TEST-01` · OPEN
> Across the ${numberWord(result.far.count)} pairs he placed far apart, your two ratings differed by ${points(far)} points on average. Across the ${numberWord(result.close.count)} pairs he bracketed together, ${points(close)}. Rating at random produces ${points(result.spreadIfIndifferent)} on both, because chance does not know which works a critic separated.

  *As rendered:* “Across the four pairs he placed far apart, your two ratings differed by 0.0 points on average. Across the four pairs he bracketed together, 0.0. Rating at random produces 3.6 on both, because chance does not know which works a critic separated.”  ·  “Across the four pairs he placed far apart, your two ratings differed by 0.0 points on average. Across the four pairs he bracketed together, 5.3. Rating at random produces 3.6 on both, because chance does not know which works a critic separated.”  · …and 2 more

`VOC-RANKING-TEST-02` · OPEN
> Neither number says you agreed with him, and neither could: this looks only at how far apart your two ratings fell, never at which one you placed higher. Preferring the work he ranked lower costs you nothing, because agreement was never imported and cannot be worked out. Small numbers are not a poor result either — ${numberWord(SPREAD_POOL.length)} recordings of ${numberWord(SPREAD_POOL.length)} different works are not spaced out by quality, and if they genuinely sounded close, rating them close was the accurate thing to do.

  *As rendered:* “Neither number says you agreed with him, and neither could: this looks only at how far apart your two ratings fell, never at which one you placed higher. Preferring the work he ranked lower costs you nothing, because agreement was never imported and cannot be worked out. Small numbers are not a poor result either — six recordings of six different works are not spaced out by quality, and if they genuinely sounded close, rating them close was the accurate thing to do.”

`VOC-RANKING-TEST-03` · OPEN
> No number this time. Setting aside the ${numberWord(set)} you had heard before left ${numberWord(left)} ${left === 1 ? "clip" : "clips"}, and ${count === 1 ? "that makes" : "those make"} only ${numberWord(count)} usable ${spacing} ${count === 1 ? "pair" : "pairs"} where this needs ${need}. Under that count, one clip's wobble is larger than the thing being measured. Nothing you do differently changes that; the pool would have to grow.

  *As rendered:* “No number this time. Setting aside the one you had heard before left five clips, and that makes only one usable widely-spaced pair where this needs three. Under that count, one clip's wobble is larger than the thing being measured. Nothing you do differently changes that; the pool would have to grow.”  ·  “No number this time. Setting aside the two you had heard before left four clips, and that makes only one usable closely-spaced pair where this needs three. Under that count, one clip's wobble is larger than the thing being measured. Nothing you do differently changes that; the pool would have to grow.”

`VOC-RANKING-TEST-04` · OPEN
> ${numberWordLeading(n)} ${n === 1 ? "clip" : "clips"} you had heard before ${n === 1 ? "was" : "were"} set aside before anything was worked out, so what follows rests on the ${numberWord(left)} that ${left === 1 ? "was" : "were"} new to you. ${RECOGNITION_DISCLOSURE}

  *As rendered:* “One clip you had heard before was set aside before anything was worked out, so what follows rests on the five that were new to you. You said which of these you had heard before, and that was taken at face value — nothing here verifies it. Recognition only ever removes clips; what you recognised is never part of a result.”  ·  “Two clips you had heard before were set aside before anything was worked out, so what follows rests on the four that were new to you. You said which of these you had heard before, and that was taken at face value — nothing here verifies it. Recognition only ever removes clips; what you recognised is never part of a result.”

`VOC-RANKING-TEST-05` · OPEN
> You gave every one of these the same rating, so there are no gaps to compare and nothing here to work on. That is an answer, not a failure to produce one.

`VOC-RANKING-TEST-06` · OPEN
> You had heard all ${numberWord(set)} of these before, so there is nothing here to read. This one only works on music that is new to you — on anything you already know, a rating is partly memory, and no instrument can separate the two afterwards. There is no second attempt that would fix that: it needs more music than this pool currently holds. Come back if it grows.

  *As rendered:* “You had heard all six of these before, so there is nothing here to read. This one only works on music that is new to you — on anything you already know, a rating is partly memory, and no instrument can separate the two afterwards. There is no second attempt that would fix that: it needs more music than this pool currently holds. Come back if it grows.”

`VOC-RANKING-TEST-07` · OPEN
> You had heard every clip here before, so all ${numberWord(n)} were set aside. ${RECOGNITION_DISCLOSURE}

  *As rendered:* “You had heard every clip here before, so all six were set aside. You said which of these you had heard before, and that was taken at face value — nothing here verifies it. Recognition only ever removes clips; what you recognised is never part of a result.”

`VOC-RANKING-TEST-08` · OPEN
> You said none of these were familiar, so all of them counted. ${RECOGNITION_DISCLOSURE}

  *As rendered:* “You said none of these were familiar, so all of them counted. You said which of these you had heard before, and that was taken at face value — nothing here verifies it. Recognition only ever removes clips; what you recognised is never part of a result.”

`VOC-RANKING-TEST-09` · OPEN
> ${shape}. Whether that means anything is a question this cannot answer: ${numberWord(result.far.count)} pairs against ${numberWord(result.close.count)}, drawn from a set of clips that each appear in several pairs, and nobody has sat this twice to find out how far these numbers wander on their own. There is no honest size at which the gap between them becomes a result, so none is offered.

  *As rendered:* “Your ratings moved further apart where his judgment did not. Whether that means anything is a question this cannot answer: four pairs against four, drawn from a set of clips that each appear in several pairs, and nobody has sat this twice to find out how far these numbers wander on their own. There is no honest size at which the gap between them becomes a result, so none is offered.”  ·  “Your ratings moved further apart where his judgment did. Whether that means anything is a question this cannot answer: three pairs against three, drawn from a set of clips that each appear in several pairs, and nobody has sat this twice to find out how far these numbers wander on their own. There is no honest size at which the gap between them becomes a result, so none is offered.”

---

### 5. The retest arc — “DID YOUR EAR MOVE”

**Where it renders.** Renders under a result when this device holds an EARLIER sitting of the same instrument, and only when the result on screen is this device's own — never on somebody else's link.

**What the screen has already said.** The screen has already given this sitting's own reading in full. This layer adds the only thing a single sitting cannot say: what happened between then and now.

**This layer's job.** Say whether the change is bigger than what the instrument can resolve, and when it is not, name the floor in the reader's own units so a refusal is not read as a shrug.

**What renders with it, in order.** `arcLines` in `arc.ts` emits, in this order: (1) why there is nothing to compare yet, naming the floor in the reader's own units; (2) whether the change is bigger than what this instrument can resolve; (3) what coming back a further time buys, stated as the only number this layer may count. (1) renders only when there is not enough to compare; (2) renders only when there is enough to compare; (3) renders only when the sitting count supports it. The refusal is the MAIN case, not the edge case, so it is first in the list rather than last. A separate constant, `ARC_DEVICE_NOTE`, is rendered under this whole block by the component — it is not part of the emission and nothing here binds its position.

**Rules this copy must keep:**

- THE REFUSAL IS THE MAIN CASE, NOT THE EDGE CASE. A pitch threshold has to change by about three and a half times before anything may be said, so “no change you could hear” is what most readers get most of the time. It is a statement about the INSTRUMENT — “smaller than this ladder can see” — never “you did not improve”, which is a claim about a person the data does not support (D1).
- It NAMES THE FLOOR in the reader's own units (PM ruling RT-H1 a). A bare “no change” invites the reader to conclude they failed; “it would take about a 3.5x change” tells them what would have had to happen.
- The staircase sentences report the size of a change as a MULTIPLE and never an endpoint as a number. Printing “34 cents” beside a result screen that reads “no reading — somewhere between 8.8 and 100 cents” makes the page contradict itself, and that defect shipped once.
- NOTHING MAY COUNT, and this layer has broken that rule twice. The readings are arity-free — “across your sittings”, “before”, “since” — because a reading that said “between these two sittings” went false the day it rested on four. Only the pooled line may state a number.
- An arc compares one person to themselves. That is the only comparison this product may make: no cohort, no percentile, and no promise that practice will work (N3).
- It says where the memory lives. This is the strongest claim to remembering anywhere in the product, and it is one browser's localStorage.

**13 templates to review** — they render 16 distinct sentences across 20 reachable renderings. Each block below is the TEMPLATE, read from the source file, with `${…}` marking its real slots; the italic lines under it are examples of how it renders. Rewrite the template. Leave every slot exactly as it is — a slot is a value the engine computes, and resolving one freezes a number or a name that is supposed to move.

`VOC-RETEST-ARC-01` · OPEN
> Across your ${label} sittings, ${way} — a change of about ${moved}. This ladder cannot distinguish anything under ${floor} from ordinary run-to-run wobble, so a move this size is the instrument speaking rather than the dice.

  *As rendered:* “Across your pitch drift sittings, it now takes a larger flaw to reach you than it did — a change of about 11x. This ladder cannot distinguish anything under 3.5x from ordinary run-to-run wobble, so a move this size is the instrument speaking rather than the dice.”  ·  “Across your pitch drift sittings, you now catch a smaller flaw than you did — a change of about 11x. This ladder cannot distinguish anything under 3.5x from ordinary run-to-run wobble, so a move this size is the instrument speaking rather than the dice.”  · …and 2 more

`VOC-RETEST-ARC-02` · OPEN
> Across your ${label} sittings, ${way}. One sitting ran past the end of what this ladder can render, so the direction holds but the size does not — all that can be said is that the move cleared ${floor}, the smallest change this machine can tell from noise.

  *As rendered:* “Across your pitch drift sittings, you now catch a smaller flaw than you did. One sitting ran past the end of what this ladder can render, so the direction holds but the size does not — all that can be said is that the move cleared 3.5x, the smallest change this machine can tell from noise.”

`VOC-RETEST-ARC-03` · OPEN
> Nobody has measured how much this machine's numbers wander between sittings, so there is no honest line between a change and a coin flip here. Until there is, it says nothing.

`VOC-RETEST-ARC-04` · OPEN
> One of these two sittings has no answers that can be scored, so there is no pair to compare.

`VOC-RETEST-ARC-05` · OPEN
> One sitting cannot say whether your ear moved — there is nothing to compare it against. A second one in this browser is what makes that sentence possible at all.

`VOC-RETEST-ARC-06` · OPEN
> Read from this browser only — there are no accounts and nothing on a server, so another device has no history to compare and starts over.

`VOC-RETEST-ARC-07` · OPEN
> The label moved you ${before} before and ${after} since. That gap is inside the ${floor} points this test wanders by on its own, so it is not a change anybody could stand behind — the same person, retested, moves this much without anything about them changing.

  *As rendered:* “The label moved you +20% before and +15% since. That gap is inside the 8 points this test wanders by on its own, so it is not a change anybody could stand behind — the same person, retested, moves this much without anything about them changing.”

`VOC-RETEST-ARC-08` · OPEN
> The label moved you ${before} before and ${after} since — ${moved} points closer to zero, where zero means the name changed nothing. That is more than the ${floor} points this test wanders by on its own, so a name is doing less to what you hear than it was.

  *As rendered:* “The label moved you +20% before and 0% since — 20 points closer to zero, where zero means the name changed nothing. That is more than the 8 points this test wanders by on its own, so a name is doing less to what you hear than it was.”

`VOC-RETEST-ARC-09` · OPEN
> The label moved you ${before} before and ${after} since — ${moved} points further from zero, and more than the ${floor} points this test wanders by on its own. A name is doing more to what you hear than it was. Both directions count: marking a labelled clip down is still the name deciding, not your ears.

  *As rendered:* “The label moved you 0% before and +20% since — 20 points further from zero, and more than the 8 points this test wanders by on its own. A name is doing more to what you hear than it was. Both directions count: marking a labelled clip down is still the name deciding, not your ears.”

`VOC-RETEST-ARC-10` · OPEN
> These trials are too short to show change over time. Your score would have to move by ${numberWord(floor.itemsToMove)} of the ${numberWord(floor.trials)} pairs${clause} before it meant anything, so this machine reports where you are and leaves the question of movement to the threshold ladders.

  *As rendered:* “These trials are too short to show change over time. Your score would have to move by six of the fifteen pairs — or four of a single flaw's five — before it meant anything, so this machine reports where you are and leaves the question of movement to the threshold ladders.”

`VOC-RETEST-ARC-11` · OPEN
> These two compression sessions ran on different recordings, so they are not comparable. A fixed bitrate does up to twice as much damage to one recording as to another, which means the difference between these two sittings would be a fact about the music rather than about you.

`VOC-RETEST-ARC-12` · OPEN
> This rests on ${total} sittings — ${pooled.older} before and ${pooled.newer} since.${gain} the wobble of an average falls as the square root of how many sittings are in it, so each time you come back, a smaller real change becomes visible.

  *As rendered:* “This rests on 4 sittings — 2 before and 2 since. That is what pulled the line above down from 3.5x to 2.5x: the wobble of an average falls as the square root of how many sittings are in it, so each time you come back, a smaller real change becomes visible.”

`VOC-RETEST-ARC-13` · OPEN
> Your ${label} sittings are ${moved} apart, which this ladder cannot tell from its own noise. It would take about ${floor} before a change here meant anything. That is not a report that you stood still — it is the instrument saying a move this small is beneath what it can see.

  *As rendered:* “Your pitch drift sittings are 1.9x apart, which this ladder cannot tell from its own noise. It would take about 3.5x before a change here meant anything. That is not a report that you stood still — it is the instrument saying a move this small is beneath what it can see.”

---

### 6. Comparison — “DEGREES OF PRAISE”

**Where it renders.** Renders under the Prestige result, on both the flow's debrief and the share page. It is computed from the Prestige Test's own ratings — no new clip, no new tap.

**What the screen has already said.** The screen has already given the prestige verdict and its percentage. This layer adds a different question about the same ratings: how much of the scale the listener used, and whether they put the same clips in the same order twice.

**This layer's job.** Report a spread and a stability without either reading as a mark out of eleven, and mark the boundary that says a narrow spread may simply be correct.

**What renders with it, in order.** `comparisonLines` in `comparison.ts` emits, in this order: (1) how much of the eleven-point scale the listener used, or why that cannot be said; (2) whether the same clips landed in the same order twice, or why that cannot be said; (3) the limit — that a narrow spread may simply be the correct answer (`COMPARISON_BOUNDARY`). All of them render every time. A reader always sees three sentences: each of the first two slots emits either its reading or the refusal standing in for it, never nothing. The critic-scale lines and the our-scale line render beside this block as a reference panel, laid out by the component rather than emitted here, so nothing binds their position.

**Rules this copy must keep:**

- A DEGREES COUNT INVITES A VERDICT AND MUST NOT BE ONE. “You used five of eleven” reads as a grade unless the chance figure is in the same breath: rating at random lands on about nine distinct values, so eleven is not an achievement and five is not a failure.
- A NARROW SPREAD MAY BE THE CORRECT ANSWER. If the clips really are close in quality, compressing them is right, and this instrument cannot tell that case from a narrow ear. `COMPARISON_BOUNDARY` says so and is appended unconditionally — it is not a footnote.
- Nobody is ranked. There is no cohort. The only outside reference is what professional critics do with their OWN scales, and that is a reference point, never a target.
- THE CRITIC SENTENCES ARE NOT WRITTEN HERE. They are composed from `src/content/comparison/scales.ts`, where each is bound to the page it came from and the date somebody opened it. Edit the field in that file, never a copy of it.
- Refusals name what was missing and print no number — the same rule the other instruments keep.

**12 templates to review**, plus 3 short labels — they render 17 distinct sentences across 24 reachable renderings. Each block below is the TEMPLATE, read from the source file, with `${…}` marking its real slots; the italic lines under it are examples of how it renders. Rewrite the template. Leave every slot exactly as it is — a slot is a value the engine computes, and resolving one freezes a number or a name that is supposed to move.

*Labels:* `(close)` · `(read it)` · `degrees of praise you used`

> COMPARISON · HUME'S FIFTH CRITERION

`VOC-COMPARISON-01` · OPEN
> None of that says your ear is narrow. These clips were never spaced out by quality — if they really do sit close together, hearing them that way is the right answer, and this instrument cannot tell that apart from a listener who hears everything as much the same.

`VOC-COMPARISON-02` · OPEN
> Not a target, and not a score you are being given. Two published scales, and what their owners actually did with them.

`VOC-COMPARISON-03` · OPEN
> ${scope}, you put every one of them back in the same order.

  *As rendered:* “Of the thirty-four pairs you separated by two points or more, counting only pairs where the names on screen pushed both clips the same way, you put every one of them back in the same order.”

`VOC-COMPARISON-04` · OPEN
> ${scope}, you put ${numberWord(say.reversed)} of them the other way round the second time${ties}.

  *As rendered:* “Of the thirty-four pairs you separated by two points or more, counting only pairs where the names on screen pushed both clips the same way, you put fourteen of them the other way round the second time, and two more came out level.”

`VOC-COMPARISON-05` · OPEN
> Pitchfork: The scale runs from 0.0 to 10.0 in tenths, which is a hundred and one places a record can land. Across more than 18,000 reviews published between January 1999 and January 2017, the mean score was 7.0. Most of those scores lie between 6.4 and 7.8. Scores ending in .0 appear nearly twice as often as scores ending in .1 — the reviewers avoid the decimals their own scale offers them.

`VOC-COMPARISON-06` · OPEN
> Robert Christgau's Consumer Guide: The Consumer Guide's letter grades ran from A+ down to E−. From 1990 he used fewer letter grades for records below B+, replacing the bottom of his own ladder with honourable mentions and the categories Choice Cuts, Neither and Duds.

`VOC-COMPARISON-07` · OPEN
> This one gives you ${numberWord(OUR_SCALE.degreesAllowed)} — ${OUR_SCALE.scale} — and asks only how many of them you used. Not whether you used the right ones. There is no right one.

  *As rendered:* “This one gives you eleven — 0 to 10, whole numbers only — and asks only how many of them you used. Not whether you used the right ones. There is no right one.”

`VOC-COMPARISON-08` · OPEN
> This sitting had fewer clips than the scale has degrees, so a count out of ${numberWord(result.degreesAvailable)} would be measuring you against room you were never given.

  *As rendered:* “This sitting had fewer clips than the scale has degrees, so a count out of eleven would be measuring you against room you were never given.”

`VOC-COMPARISON-09` · OPEN
> WHAT THE PROFESSIONALS DO WITH THEIR OWN SCALES

`VOC-COMPARISON-10` · OPEN
> You put ${numberWord(say.itemCount)} clips on ${spread}, with ${range}. Someone rating the same clips at random would have landed on about ${numberWord(Math.round(say.degreesIfIndifferent))}.

  *As rendered:* “You put sixteen clips on all eleven of the degrees this scale offers, with the top and the bottom both in play. Someone rating the same clips at random would have landed on about nine.”  ·  “You put sixteen clips on two of the eleven degrees this scale offers, with nothing below five and nothing above six. Someone rating the same clips at random would have landed on about nine.”

`VOC-COMPARISON-11` · OPEN
> Your ratings sat too close together for this second number to mean anything: it needs ${numberWord(MIN_ASSERTED_PAIRS)} pairs separated by ${numberWord(ASSERTION_FLOOR)} points or more, and this sitting produced ${numberWord(result.pairs.asserted)}. Below that, one clip's wobble moves the answer further than the answer moves, so there is nothing here worth printing.

  *As rendered:* “Your ratings sat too close together for this second number to mean anything: it needs ten pairs separated by two points or more, and this sitting produced one. Below that, one clip's wobble moves the answer further than the answer moves, so there is nothing here worth printing.”  ·  “Your ratings sat too close together for this second number to mean anything: it needs ten pairs separated by two points or more, and this sitting produced zero. Below that, one clip's wobble moves the answer further than the answer moves, so there is nothing here worth printing.”

---

### 7. The borrowed apparatus — WHERE THE RULERS CAME FROM

**Where it renders.** Renders on `/learn/methodology`, as the section explaining which published standards this product's measurements are built on. NOT on `/method`, which is a different page about how the project is run — the deck said `/method` until E19/S4 and it was simply wrong.

**What the screen has already said.** The page has already described what each instrument does. This layer says whose rulers it borrowed to do it.

**This layer's job.** Show that the loudness normalisation, the transparency anchor and the listening-test design sit in a tradition with published standards — and say where this product departs from them.

**What renders with it, in order.** `apparatusLines` emits one entry per borrowed standard, then the citation-strength line, then the degrees-convergence line where it applies. They sit inside `/learn/methodology`, beneath the page prose that describes the instruments themselves. This order is laid out in the page rather than emitted as an array, so it is pinned by a test rather than composed from one.

**Rules this copy must keep:**

- A CITATION MAY DESCRIBE THE MEASURING APPARATUS. It may NEVER describe how well people score. This is the rule the whole section runs on: quoting a standard's method is allowed, quoting anybody's results about listeners is not.
- Every standard named is one somebody opened. The descriptions live in `src/content/apparatus/standards.ts` beside the URL and the date; edit them there.
- Where this product departs from a standard, the departure is stated rather than glossed.
- It is short on purpose. The product already carries a great deal of methodological prose, and a reader who wanted a number about their ear is not helped by a survey of standards.

**5 templates to review** — they render 5 distinct sentences across 5 reachable renderings. Each block below is the TEMPLATE, read from the source file, with `${…}` marking its real slots; the italic lines under it are examples of how it renders. Rewrite the template. Leave every slot exactly as it is — a slot is a value the engine computes, and resolving one freezes a number or a name that is supposed to move.

`VOC-BORROWED-APPARATUS-01` · OPEN
> EBU R 128 — The broadcast method for measuring perceived loudness, rather than peak level. Every clip is loudness-normalised with a two-pass R 128 measurement to one fixed target before it is ever played, so no clip can seem better simply for arriving louder than the one before it. The target here is chosen for headphone listening rather than for broadcast delivery, and this file states the figure it actually uses rather than any figure the standard recommends.

`VOC-BORROWED-APPARATUS-02` · OPEN
> ${mushra.name} puts a sample anywhere on ${mushra.scaleLabel}. ${pitchfork.critic} offers ${pitchfork.degreesAllowed} places to put a record. Two very different attempts at the same problem, both landing near a hundred degrees. This one offers ${numberWord(OUR_SCALE.degreesAllowed)}, and asks only how many of them you used.

  *As rendered:* “ITU-R BS.1534-3 (MUSHRA) puts a sample anywhere on a continuous scale from 0 to 100. Pitchfork offers 101 places to put a record. Two very different attempts at the same problem, both landing near a hundred degrees. This one offers eleven, and asks only how many of them you used.”

`VOC-BORROWED-APPARATUS-03` · OPEN
> ITU-R BS.1534-3 (MUSHRA) — The international recommendation for subjective listening tests, using a hidden reference and anchors, with each sample rated on a continuous scale from 0 to 100. The same document places BS.1116 over small impairments and itself over intermediate quality. It is the tradition our trials sit in rather than a specification we claim to meet: a forced choice between two samples with a required listen, scored against chance. Our pairs carry near-transparent damage, which by that document's own division is BS.1116's regime rather than MUSHRA's — so the familiar 0-to-100 scale is the wrong one to picture here, and we do not use it.

`VOC-BORROWED-APPARATUS-04` · OPEN
> The transparent-encode anchor — A reference point for how much measurable difference an encode can cost while remaining, by consensus, inaudible. Clip fitness is judged against a 320 kbps MP3 round-trip of the same recording rather than against a fixed number, because the same encode costs more spectral distance on dense material than on sparse material. The anchor is a convention rather than a published standard, and it is a measurement of audio files: nobody has listened to confirm the clips it passes are transparent to any actual ear.

`VOC-BORROWED-APPARATUS-05` · OPEN
> ${inRepo} of these are decisions living in this repository, so a test opens the file that implements them and fails the build if the passage has moved. The other ${external} rests on a document no test can open, and carries the date a person opened it instead. Those are not the same strength of claim, and this page will not pretend otherwise.

  *As rendered:* “Two of these are decisions living in this repository, so a test opens the file that implements them and fails the build if the passage has moved. The other one rests on a document no test can open, and carries the date a person opened it instead. Those are not the same strength of claim, and this page will not pretend otherwise.”

---

### 8. Combined view — “ACROSS YOUR SESSIONS”

**Where it renders.** Renders on the result surface of all FOUR instruments — the Prestige, Delicacy and Threshold result pages and the Ranking Test's reading — but ONLY when two or more instruments have been run on this device AND the result on screen is this device's own (never on somebody else's shared link). It said "all three result screens" until E19/S7, which was written before the Ranking Test existed and had quietly become the description of a bug: the layer counted that instrument and named it, and its screen was the one place the block never appeared.

**What the screen has already said.** Every instrument section above, plus each instrument's own measurement copy.

**This layer's job.** Say the three things that are only true once more than one instrument has run: the dossier, the replication, the coverage.

**What renders with it, in order.** `acrossLines` in `across.ts` emits, in this order: (1) what the instruments run so far add up to; (2) one line per family two instruments both measured, saying whether they agreed; (3) the roster of thresholds measured so far, as a list and never a ranking. (1) renders only when there is something to add up; (2) renders once per replication check, so none at all is the common case; (3) renders only when a threshold has been measured. Any one of the three may be the only line on screen, so no sentence here may depend on another having been said. Under fewer than two instruments the whole block is silent.

**Rules this copy must keep:**

- Never ranks one family against another — no “strength”, “blind spot”, “sharpest”, “best”, “worst”.
- No leaderboard, streak, XP, points, rank or badge (the anti-clone clause).
- A band that predicted nothing must not earn agreement by staying silent.
- The roster lists thresholds in different units side by side — a LIST, never a ranking.
- No sentence here may also appear in an instrument section above; a test enforces it.

**7 templates to review** — they render 18 distinct sentences across 34 reachable renderings. Each block below is the TEMPLATE, read from the source file, with `${…}` marking its real slots; the italic lines under it are examples of how it renders. Rewrite the template. Leave every slot exactly as it is — a slot is a value the engine computes, and resolving one freezes a number or a name that is supposed to move.

`VOC-COMBINED-VIEW-01` · OPEN
> ${label}: caught at ${quantity(say.heardAt, t.unit)}${onSource(t)}

  *As rendered:* “Compression damage: caught at 160 kbps on pb1”  ·  “Pitch drift: caught at 3.1 cents”  · …and 1 more

`VOC-COMBINED-VIEW-02` · OPEN
> Every ladder the Gym can run has a session on this device. What moves the numbers now is time between sittings.

`VOC-COMBINED-VIEW-03` · OPEN
> Two separate sessions measured your ${label} in ${unit}, by different methods, and they agreed on ${tested} of ${tested} checks${material}. That is the closest thing here to evidence that the number is real and not an afternoon.

  *As rendered:* “Two separate sessions measured your compression damage in kbps, by different methods, and they agreed on 5 of 5 checks — and on different recordings, which is a harder test than either session alone. That is the closest thing here to evidence that the number is real and not an afternoon.”  ·  “Two separate sessions measured your pitch drift in cents, by different methods, and they agreed on 5 of 5 checks. That is the closest thing here to evidence that the number is real and not an afternoon.”

`VOC-COMBINED-VIEW-04` · OPEN
> Two separate sessions measured your ${label} in ${unit} and agreed on ${check.agree} of ${tested} checks${material}. Partial agreement is the ordinary result for two short sessions; a third would narrow it.

  *As rendered:* “Two separate sessions measured your pitch drift in cents and agreed on 2 of 3 checks — and on different recordings, which is a harder test than either session alone. Partial agreement is the ordinary result for two short sessions; a third would narrow it.”  ·  “Two separate sessions measured your pitch drift in cents and agreed on 2 of 3 checks. Partial agreement is the ordinary result for two short sessions; a third would narrow it.”

`VOC-COMBINED-VIEW-05` · OPEN
> Two separate sessions measured your ${label} in ${unit} and disagreed on all ${tested} checks${material}. One of the two sittings is not describing your ear — which is worth more than a number that was never tested twice.

  *As rendered:* “Two separate sessions measured your pitch drift in cents and disagreed on all 3 checks. One of the two sittings is not describing your ear — which is worth more than a number that was never tested twice.”

`VOC-COMBINED-VIEW-06` · OPEN
> Unmeasured on this device: ${list}. Nothing here says how you would do on ${names.length === 1 ? "it" : "them"}.

  *As rendered:* “Unmeasured on this device: pitch drift and compression damage. Nothing here says how you would do on them.”  ·  “Unmeasured on this device: pitch drift, timing smear and compression damage. Nothing here says how you would do on them.”  · …and 1 more

`VOC-COMBINED-VIEW-07` · OPEN
> You have answered ${parts.length} different questions about your ears: ${list}. They are not ${parts.length} scores of one thing and they do not add up — each is measured in its own terms.

  *As rendered:* “You have answered 2 different questions about your ears: whether a name changes what you hear; how small a flaw has to get before you lose it. They are not 2 scores of one thing and they do not add up — each is measured in its own terms.”  ·  “You have answered 2 different questions about your ears: whether a name changes what you hear; whether you can tell damage from clean and say what it is. They are not 2 scores of one thing and they do not add up — each is measured in its own terms.”  · …and 4 more

---

### 9. The expert panel — “THE RAW RECORD”

**Where it renders.** A collapsed panel under every result that this device stored, open only when the result on screen is the one this device recorded — on a link you share with someone else it renders nothing at all.

**What the screen has already said.** Every section above. This panel repeats none of it: it shows the numbers underneath — per-family and per-rung tallies, every trial with the answer key, the staircase's rung visits and measured limits, the calibration curve, the prestige test's per-clip ratings.

**This layer's job.** Label measurements and state limits. Never judge them — this is the verdict-free surface.

**What renders with it, in order.** The panel emits its blurb in the collapsed summary, then the body of the ONE instrument whose result is on screen — not a section per instrument, which is what this line said until E19/S4. Inside the calibration block the order is chart, then the claimed-versus-delivered table, then the Brier sentence: the table sits between the sentence and the chart it refers to. Laid out in the component, so it is pinned by a test rather than composed from an array.

**Not text, and not in this deck.** An SVG CALIBRATION CHART renders above the Brier sentence, with a table between them: claimed confidence on the x axis, delivered accuracy on the y, with a DASHED DIAGONAL for perfect calibration. "The line above" is that diagonal, and a reader of this deck cannot see it. Every result surface also carries tables of numbers this deck does not reproduce.

**Rules this copy must keep:**

- No verdict, ever. `expert.ts` cannot supply one — it carries numbers, ids and enums with no sentence in it — and the calibration data deliberately omits the overconfident/underconfident label the result screen shows.
- Column headers and stat labels are copy too. They live in the deck precisely because deciding case by case which strings are ‘important enough to gate’ is how the gap reopens.
- The notes state LIMITS, not findings. A limit stated loosely is the shape an unmeasured claim takes.
- The blurb must warn that this is device-local, or a reader assumes a shared link carries it.

**14 templates to review**, plus 69 short labels — they render 83 distinct sentences across 85 reachable renderings. Each block below is the TEMPLATE, read from the source file, with `${…}` marking its real slots; the italic lines under it are examples of how it renders. Rewrite the template. Leave every slot exactly as it is — a slot is a value the engine computes, and resolving one freezes a number or a name that is supposed to move.

*Labels:* `#` · `95% interval` · `After correction` · `At the scale edge` · `Before correction` · `Blind` · `By flaw family` · `By rung` · `Caught` · `Caught at` · `Clip` · `Clips counted` · `Closely-spaced pairs` · `Control drift` · `Delivered` · `Drift` · `Every clip` · `Family` · `First` · `Fitted point` · `Flaw named` · `In his ranking` · `In the result` · `Label` · `Labelled` · `Mean gap · closely spaced` · `Mean gap · widely spaced` · `Missed at` · `Moved with label` · `Of` · `Original` · `Outcome` · `Pair` · `Positions apart` · `Rating at random` · `Right` · `Room to move` · `Rung` · `Said` · `Second` · `Set aside` · `Shown` · `Swapped items only` · `THE RAW RECORD` · `The session` · `Toward label` · `Trials` · `Versus claim` · `Where` · `Widely-spaced pairs` · `Work` · `You picked` · `You said` · `Your gap` · `Your rating` · `bracketed` · `caught` · `counted` · `far apart` · `fictional` · `guessed` · `hide` · `in band` · `not earned` · `set aside` · `show` · `too few to say` · `true` · `—`

`VOC-EXPERT-PANEL-01` · OPEN
> Brier score ${brier.toFixed(3)} over ${n} answers — always saying 50% on a two-way choice scores ${chance.toFixed(2)}. Lower is better, but it only means something read against the chart above: the dashed diagonal is perfect calibration, and the score alone cannot tell you which side of it you sat on.

  *As rendered:* “Brier score 0.287 over 15 answers — always saying 50% on a two-way choice scores 0.25. Lower is better, but it only means something read against the chart above: the dashed diagonal is perfect calibration, and the score alone cannot tell you which side of it you sat on.”

`VOC-EXPERT-PANEL-02` · OPEN
> Controls · rated twice, labelled neither time

> Did you know when you knew?

`VOC-EXPERT-PANEL-03` · OPEN
> Every clip, in the order you heard them

`VOC-EXPERT-PANEL-04` · OPEN
> Every number behind the result, and the answer key. No verdict, no interpretation — and it is read from this browser, so a link you share carries none of it.

`VOC-EXPERT-PANEL-05` · OPEN
> Every pair that counted · by the numbers above

> Every pair, in the order you met them

> Every rung · gentlest first

`VOC-EXPERT-PANEL-06` · OPEN
> The distance column is the whole of what was taken from the critic's list. Which of two works he placed higher was never read in, so no table here can be sorted into his order and no agreement figure can be recovered from it — not by this page, not by you, not later.

`VOC-EXPERT-PANEL-07` · OPEN
> The pairs below are your ratings as they fell; the averages are missing because too few pairs survived for either one to mean anything. Nothing has been hidden — the figure was never worked out.

`VOC-EXPERT-PANEL-08` · OPEN
> The two percentages agree because the pool carries as many acclaimed labels as dismissive ones, and a balanced set cancels re-listen drift outright. The correction is shown anyway: it is what would move if that balance ever changed.

`VOC-EXPERT-PANEL-09` · OPEN
> Timing rungs are shown by number: the pool stores them as a tempo fraction and the staircase measures milliseconds of drift, so quoting one as the other would be a guess.

`VOC-EXPERT-PANEL-10` · OPEN
> What follows is the end of your blind sitting. These six were rated before you knew what they were, and they cannot be again — a second attempt at this instrument would be rating music you have now been told about.

`VOC-EXPERT-PANEL-11` · OPEN
> What the pipeline measured and could not fix

---

**190 concrete sentences across 9 surfaces.**

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
`INS-CLIP-BLURBS-01` · LOCKED
One of thirty variations, and not one of the ones anybody quotes.
```

#### 2. `pb7` — shown as “Komiku”

- direction: DOWN (dismissal)
- label is TRUE
- earlier pool — shown for voice consistency

```
`INS-CLIP-BLURBS-02` · LOCKED
Written to be dropped into other people's games, and released by the album-load.
```

#### 3. `pb3` — shown as “F. Chopin — Musopen Complete Chopin project”

- direction: DOWN (dismissal)
- label is TRUE
- earlier pool — shown for voice consistency

```
`INS-CLIP-BLURBS-03` · LOCKED
The nocturne recital programmers skip; even devoted Chopin listeners rarely defend it.
```

#### 4. `pb9` — shown as “J. Suk — Musopen Kickstarter ensemble”

- direction: UP (acclaim)
- label is TRUE
- **one of the six named in the standing note** (added 2026-08-25)

```
`INS-CLIP-BLURBS-04` · LOCKED
Written in 1914 as a patriotic act, when Czech orchestras were forbidden the national anthem and played this instead.
```

#### 5. `b3` — CONTROL, no label shown

Deliberately empty. Nothing to review.

#### 6. `pb6` — shown as “Chris Zabriskie”

- direction: UP (acclaim)
- label is TRUE
- earlier pool — shown for voice consistency

```
`INS-CLIP-BLURBS-05` · LOCKED
Released into the open under a Creative Commons licence, and picked up by film and podcast makers ever since.
```

#### 7. `pb10` — shown as “F. Mendelssohn — Musopen Kickstarter ensemble”

- direction: UP (acclaim)
- label is TRUE
- **one of the six named in the standing note** (added 2026-08-25)

```
`INS-CLIP-BLURBS-06` · LOCKED
His last completed work, written in the months after his sister died; the one piece where the polish drops away.
```

#### 8. `pb2` — shown as “J.S. Bach — Kimiko Ishizaka, piano”

- direction: UP (acclaim)
- label is TRUE
- earlier pool — shown for voice consistency

```
`INS-CLIP-BLURBS-07` · LOCKED
From a recording project so admired it was placed in the public domain as a cultural gift.
```

#### 9. `pb11` — shown as “Alexander Vane”

- direction: DOWN (dismissal)
- label is SWAPPED — fictional artist, deception disclosed at debrief
- **one of the six named in the standing note** (added 2026-08-25)

```
`INS-CLIP-BLURBS-08` · LOCKED
A student overture, wheeled out when an orchestra needs something short before the interval.
```

#### 10. `pb8` — shown as “Jason Shaw (Audionautix)”

- direction: DOWN (dismissal)
- label is TRUE
- earlier pool — shown for voice consistency

```
`INS-CLIP-BLURBS-09` · LOCKED
Stock production music, written to be inoffensive; the audio equivalent of a waiting room.
```

#### 11. `pb13` — shown as “Noé Calvet”

- direction: UP (acclaim)
- label is SWAPPED — fictional artist, deception disclosed at debrief
- **one of the six named in the standing note** (added 2026-08-25)

```
`INS-CLIP-BLURBS-10` · LOCKED
A minimalist study praised on year-end experimental lists for doing more with less.
```

#### 12. `pb5` — shown as “F. Chopin — Musopen Complete Chopin project”

- direction: UP (acclaim)
- label is TRUE
- earlier pool — shown for voice consistency

```
`INS-CLIP-BLURBS-11` · LOCKED
Late-period Chopin at its most refined — the mazurka connoisseurs reach for when they want the form taken seriously.
```

#### 13. `pb4` — shown as “L. van Beethoven — Musopen Kickstarter ensemble”

- direction: UP (acclaim)
- label is TRUE
- earlier pool — shown for voice consistency

```
`INS-CLIP-BLURBS-12` · LOCKED
The movement scholars point to when they argue early Beethoven was already looking decades ahead.
```

#### 14. `pb14` — shown as “Jason Shaw (Audionautix)”

- direction: DOWN (dismissal)
- label is TRUE
- **one of the six named in the standing note** (added 2026-08-25)

```
`INS-CLIP-BLURBS-13` · LOCKED
Library music filed under jazz: the sound of the genre with nobody taking a risk inside it.
```

#### 15. `b1` — CONTROL, no label shown

Deliberately empty. Nothing to review.

#### 16. `pb12` — shown as “A. Borodin — Musopen Kickstarter ensemble”

- direction: DOWN (dismissal)
- label is TRUE
- **one of the six named in the standing note** (added 2026-08-25)

```
`INS-CLIP-BLURBS-14` · LOCKED
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

**The sentence** — the sign and the number come from the engine:

```
`INS-RESULTTITLEFRAGMENT-01` · OPEN
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

### 3. The flaw line — the Delicacy result's second number

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
`INS-FLAW-LINE-01` · OPEN
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

### 4. The creator vocabulary — added in E11 (Track B), never written by a writer

**Where it renders.** `/learn/flaws` (a new reading-room page), the front door's lead paragraph and its three secondary doors, the delicacy explainer's state sentences, and a link on the Delicacy and Threshold result screens.

**What it is.** The half of the product that turns a measurement into a word. The blueprint's premise is that somebody can hear a render is wrong and cannot name why; these are the sentences that name it. They were written by the engineer in one session and have had no pass.

**Rules this copy must keep:**

- **No claim about the reader** (D1) and **no comparison to other people** (N3).
- **No causal promise** that training here improves anybody's own output — it is unmeasured. A guard refuses five phrasings of it; it cannot refuse a sixth.
- **Nothing may count.** Several of these strings are shown after sessions that measured different numbers of families, and one of them sits under a machine list that has changed length twice. Arity in a reused sentence is how “pick either” survived under three cards.
- **Three families, and the limits sentence is load-bearing.** Three named flaws read as “the flaws” without it.
- The unit names (`cents of peak detune`, `ms of drift IQR`) are the pipeline's own labels. They are the weakest lines here and the engineer flagged them; they are also the honest name of the measured quantity, so a friendlier synonym would add a second vocabulary rather than replace one.

#### 4.1 The flaw families — symptom and mechanism (`/learn/flaws`)

The symptom is deliberately the complaint a person makes BEFORE they have the word; the mechanism is what is physically true. The gap between them is the vocabulary.

**Pitch drift** — measured in cents

```
`INS-CREATOR-VOCABULARY-01` · OPEN
symptom:   It sounds sour or slightly seasick, and nothing you can point at is off-key.
`INS-CREATOR-VOCABULARY-02` · OPEN
mechanism: The whole take slides out of tune while it plays. It starts where it should and ends somewhere else, so no single note is wrong — the drift is.
```

**Timing smear** — measured in ms

```
`INS-CREATOR-VOCABULARY-03` · OPEN
symptom:   It feels rubbery and unanchored. The groove will not lock, however hard the drums are pushed.
`INS-CREATOR-VOCABULARY-04` · OPEN
mechanism: The beat wanders off the grid and back again in slow waves. No individual hit is late enough to notice on its own; the pattern of them is.
```

**Compression damage** — measured in kbps

```
`INS-CREATOR-VOCABULARY-05` · OPEN
symptom:   It sounds cheap, underwater or brittle — like a good idea saved one too many times.
`INS-CREATOR-VOCABULARY-06` · OPEN
mechanism: Low-bitrate compression throws away quiet detail. Cymbals turn grainy and reverb tails go swishy and airless, while the loud middle survives intact.
```

#### 4.2 The page's two claim-bearing sentences

```
`INS-CREATOR-VOCABULARY-07` · OPEN
intro:  You can hear that a render is wrong and have no word for it. That is the gap this page closes: three kinds of damage the gym can measure, what each one sounds like, and the machines that find how small a dose of it you can still catch.

`INS-CREATOR-VOCABULARY-08` · OPEN
limits: These three are what the pipeline can render as a controlled dose with a right answer at the bottom of it. They are not a list of everything that can go wrong with a piece of audio. A render can fail in ways nothing here measures, and this page would rather be short than pretend otherwise.
```

#### 4.3 The page's questions

```
`INS-CREATOR-VOCABULARY-09` · OPEN
Q: Can you tell me which flaw is wrecking my track?
`INS-CREATOR-VOCABULARY-10` · OPEN
A: No. Nothing here listens to your files, and there is nowhere to upload one. What this gives you is the vocabulary — three kinds of damage, what each sounds like, and the machine that measures how small a dose of it your own ears still catch.
```

```
Q: Why only three?
`INS-CREATOR-VOCABULARY-11` · OPEN
A: Because three is what the clip pipeline can render as a controlled dose with an objectively correct answer behind it: pitch drift, timing smear and compression damage. Other things go wrong in a mix. They are absent because we cannot measure them yet, not because they do not matter.
```

```
`INS-CREATOR-VOCABULARY-12` · OPEN
Q: If I catch these in the trials, will I catch them in my own work?
`INS-CREATOR-VOCABULARY-13` · OPEN
A: Unmeasured, so it is not claimed. The instruments report what you caught in these trials, on these recordings, in physical units. Whether that transfers to your own sessions is a question no data here answers.
```

#### 4.4 The front door

The lead is shown with the machine count interpolated; four is what ships today. The hint sits under the cards, and the three doors are the quiet rows beneath it.

```
`INS-CREATOR-VOCABULARY-14` · OPEN
lead:  Not a personality. Not a vibe. Four machines, each measuring one thing Hume said a real judge needs — whether a famous name can move your ratings, whether your ears can catch damage when nobody tells you where it is, how small that damage can get before you lose it, and whether your ratings move at all where a critic's judgment moved.

`INS-CREATOR-VOCABULARY-15` · OPEN
hint:  Free · no sign-up · headphones help · pick one, the room follows
```

```
/learn/flaws
`INS-CREATOR-VOCABULARY-16` · OPEN
Something sounds wrong. Three kinds of damage, what each one is called, and which machine measures it.
```

```
/learn
`INS-CREATOR-VOCABULARY-17` · OPEN
Reading room. Hume's five criteria, and how we measure them.
```

```
/music/quiz
`INS-CREATOR-VOCABULARY-18` · OPEN
Snack. Five taps, a verdict, and no measurement behind it.
```

#### 4.5 The route from a result to the reference

One string, shown on both the Delicacy and Threshold results. It must stay true after a session that measured one family and after a session that measured three.

```
`INS-CREATOR-VOCABULARY-19` · OPEN
What each flaw is called, and what it sounds like
```

#### 4.6 The delicacy explainer, now that the machine is open

These read the live flag and have a second form for the locked state, which is not shown here because it is not what ships.

```
`INS-CREATOR-VOCABULARY-20` · OPEN
index card: Machine 02: can your ears find the key in the wine?
```

```
Q: What is the key-in-the-wine story?
`INS-CREATOR-VOCABULARY-21` · OPEN
A: Hume retells it from Don Quixote: two of Sancho's kinsmen judged a wine good but for a faint taste of leather and iron. They were ridiculed — until the hogshead was emptied and an old key on a leathern thong was found at the bottom. Their perception was real and verifiable; that is delicacy.
```

```
Q: How do the Delicacy Trials work?
`INS-CREATOR-VOCABULARY-22` · OPEN
A: Public-domain and Creative-Commons recordings are altered with controlled degradations — pitch drift, timing smear and compression damage — and you identify the original and name the flaw. Unlike a taste quiz, answers are objectively right or wrong, difficulty is tunable, and items can be calibrated with item-response theory.
```

```
`INS-CREATOR-VOCABULARY-23` · OPEN
Q: Where do the Delicacy Trials sit in the gym?
`INS-CREATOR-VOCABULARY-24` · OPEN
A: They are machine 02, and they are open. The battery was built after the Prestige Test, on the principle that a gym has equipment you can see before you are ready for it — and now you are.
```

---

### 5. The Delicacy detection readout — THE ONE BATCH A WRITER HAS ALREADY SEEN

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
`INS-DELICACY-DETECTION-01` · PASSED
phase line: Nothing here costs money, and no paid tier is coming. The training arc will gate on a seven-day gap between retests, because a retake the same day measures your memory, not your ears.
```

```
`INS-DELICACY-DETECTION-02` · PASSED
provisional footnote (the whole assembled paragraph): Provisional read — you're early. Nothing here costs money, and no paid tier is coming. The training arc will gate on a seven-day gap between retests, because a retake the same day measures your memory, not your ears. Difficulty labels are authored, not yet norm-calibrated.
```

**The band, at every branch a reader can reach** — 12 of 15 is the smallest score that clears chance.

```
`INS-DELICACY-DETECTION-03` · PASSED
15 of 15 — 15 of 15. Now subtract the guessing.
`INS-DELICACY-DETECTION-04` · PASSED
A two-way choice is generous: guess every pair blind and the long-run average is 7.5 of 15, half the paper handed over before you hear anything. You returned 15 — 7.5 beyond what that generosity covers, and past the 12 it takes to clear the coin at 95% confidence. Subtract the pairs luck would have handed you anyway and what remains, flaws actually detected rather than merely called, lands somewhere between 59% and 100%. That window is embarrassingly wide, and wide for an honest reason: 15 pairs is 15 pairs. But every value inside it sits above zero, and staying above zero is the one thing a coin cannot arrange.
```

```
`INS-DELICACY-DETECTION-03` · another rendering of the same template — edit it once, above
13 of 15 — 13 of 15. Now subtract the guessing.
`INS-DELICACY-DETECTION-04` · another rendering of the same template — edit it once, above
A two-way choice is generous: guess every pair blind and the long-run average is 7.5 of 15, half the paper handed over before you hear anything. You returned 13 — 5.5 beyond what that generosity covers, and past the 12 it takes to clear the coin at 95% confidence. Subtract the pairs luck would have handed you anyway and what remains, flaws actually detected rather than merely called, lands somewhere between 24% and 93%. That window is embarrassingly wide, and wide for an honest reason: 15 pairs is 15 pairs. But every value inside it sits above zero, and staying above zero is the one thing a coin cannot arrange.
```

```
`INS-DELICACY-DETECTION-03` · another rendering of the same template — edit it once, above
11 of 15 — 11 of 15. Now subtract the guessing.
`INS-DELICACY-DETECTION-05` · PASSED
A two-way choice is generous: guess every pair blind and the long-run average is 7.5 of 15, half the paper handed over before you hear anything. You returned 11 — 3.5 beyond what that generosity covers, and 3.5 is not a margin anyone can defend. Subtract the pairs luck would have handed you anyway and the range that still fits your session runs from 0% to 78% detected, touching zero at the bottom. On 15 pairs it takes 12 to pull clear of the coin at 95% confidence. So the honest reading is not that you heard nothing — it is that a session this short cannot tell you apart from a lucky afternoon. A longer one can.
```

```
`INS-DELICACY-DETECTION-03` · another rendering of the same template — edit it once, above
8 of 15 — 8 of 15. Now subtract the guessing.
`INS-DELICACY-DETECTION-05` · another rendering of the same template — edit it once, above
A two-way choice is generous: guess every pair blind and the long-run average is 7.5 of 15, half the paper handed over before you hear anything. You returned 8 — 0.5 beyond what that generosity covers, and 0.5 is not a margin anyone can defend. Subtract the pairs luck would have handed you anyway and the range that still fits your session runs from 0% to 50% detected, touching zero at the bottom. On 15 pairs it takes 12 to pull clear of the coin at 95% confidence. So the honest reading is not that you heard nothing — it is that a session this short cannot tell you apart from a lucky afternoon. A longer one can.
```

```
`INS-DELICACY-DETECTION-03` · another rendering of the same template — edit it once, above
4 of 15 — 4 of 15. Now subtract the guessing.
`INS-DELICACY-DETECTION-06` · PASSED
A two-way choice is generous: guess every pair blind and the long-run average is 7.5 of 15, half the paper handed over before you hear anything. You returned 4, at or beneath what that generosity alone returns, so once the lucky guesses come out there is nothing left to credit: the range that fits runs from 0% to 4% detected. Clearing the coin at 95% confidence would have taken 12 of 15. What these 15 pairs found is nothing that separates your ear from chance — which is a sentence about 15 pairs, and not yet a sentence about your ear.
```

```
`INS-DELICACY-DETECTION-03` · another rendering of the same template — edit it once, above
0 of 15 — 0 of 15. Now subtract the guessing.
`INS-DELICACY-DETECTION-06` · another rendering of the same template — edit it once, above
A two-way choice is generous: guess every pair blind and the long-run average is 7.5 of 15, half the paper handed over before you hear anything. You returned 0, at or beneath what that generosity alone returns, so once the lucky guesses come out there is nothing left to credit: there is no range left to draw, it sits flat at 0% detected. Clearing the coin at 95% confidence would have taken 12 of 15. What these 15 pairs found is nothing that separates your ear from chance — which is a sentence about 15 pairs, and not yet a sentence about your ear.
```

**The summary line, and the share line:**

```
`INS-DELICACY-DETECTION-07` · PASSED
all: 15 of 15 originals — a coin flip averages 7.5
```

```
`INS-DELICACY-DETECTION-07` · another rendering of the same template — edit it once, above
some: 10 of 15 originals — a coin flip averages 7.5
```

```
`INS-DELICACY-DETECTION-07` · another rendering of the same template — edit it once, above
none: 0 of 15 originals — a coin flip averages 7.5
```

```
`INS-DELICACY-DETECTION-08` · PASSED
share at 13/15: I called 13 of 15 originals in the Delicacy Trials — a coin flip averages 7.5. Think your ears are better?
```

```
`INS-DELICACY-DETECTION-08` · another rendering of the same template — edit it once, above
share at 8/15: I called 8 of 15 originals in the Delicacy Trials — a coin flip averages 7.5. Think your ears are better?
```

---

### 6. `CRITIC_CONTRADICTION` — why no instrument scores you against a critic

**Where it renders.** Three pages: `/learn/comparison`, which is its home; `/learn/methodology`, beside the degrees-convergence line; and `/learn/ranking-test`, after the mechanism paragraph. The `/spread` frame states the refusal without the reason and does not render this.

**What the screen has already said.** On each page, that agreement with the critic is not scored. This is the sentence that says WHY.

**Its job.** Carry a constitutional refusal in one wording. The Prestige Test measures how far a famous name moves a listener; a second instrument rewarding agreement with a famous critic would contradict it on the same site.

**Rules this copy must keep:**

- It renders on three pages, so it may not depend on any one page's surrounding sentence.
- It is the reason, not the mechanism. Each page keeps its own prose about what was imported.
- No second wording may be introduced anywhere; `critic-refusal.test.ts` refuses one.
- This was FOUR wordings until E19/S14, found by a writing pass reading all four at once.

```
`INS-CRITICCONTRADICTION-01` · OPEN
Rewarding you for agreeing with a prestigious critic would have this product contradict itself on the same screen.
```

---

**16 clips listed, of which 6 are the ones the standing note names.** Regenerate with `node scripts/export-instrument-deck.mjs > docs/copy-deck-instruments.md` after any change.


---

# Part 3 · The page copy

*Also written to `docs/copy-deck-pages.md` by this same command.*


**Generated, do not edit by hand.** `node scripts/export-page-deck.mjs > docs/copy-deck-pages.md`

Every paragraph, heading and caption a reader meets on these pages, pulled from the components that render them. Surfaces are found on disk, so a new page appears here the day it ships.

### How to use this

**This deck is a READING surface, not an editing one, and the other three are both.** They enumerate strings that live in content modules, so an edit lands in one place. This copy sits inline in the page components, so an edit has to be made in the `.tsx` file named under each section. Moving it into modules is real work and was deliberately not done first, because it would have stood between you and this document.

**It is a source scan, so it can drift from what renders.** Braces mark a value the page computes rather than words on screen. Where a page imports its numbers from the modules that compute them, that is deliberate and the slots must stay slots: typing the value in is how a page drifts away from the instrument it describes.

**One rule is not negotiable, and it is on `/legal`.** It may not promise a paid tier and may not describe the product as a personality reading. Both were live false claims until 2026-09-05, on the page a reader opens to find out what they are agreeing to.

---

### `/learn/comparison`

**Edits land in** `src/app/learn/comparison/page.tsx`.

> HUME'S CRITERIA · COMPARISON

`PAGE-LEARN-COMPARISON-01` · OPEN
> Hume's test case is a pairing nobody now remembers was ever a contest: John Ogilby, a workmanlike seventeenth-century versifier, against John Milton. His point was uncomfortable: a person acquainted with no better poetry might genuinely admire Ogilby — and the admiration would be sincere, felt, and wrong in a way the admirer has no way to detect. By comparison alone, he argued, do we learn to assign degrees of praise; whoever has seen only one kind of beauty cannot rank any.

`PAGE-LEARN-COMPARISON-02` · OPEN
> Read that carefully and it is not a claim about how much music you have heard. It is a claim about what breadth gives you — degrees. The judge who has weighed many works can say that one is a little better than another and a third is far worse; the judge who has not is left with liking and not-liking, which is not a scale but a floor.

`PAGE-LEARN-COMPARISON-03` · OPEN
> This page used to promise something else, and the correction is worth stating rather than hiding. It described an optional import of your streaming history and said that breadth was a fact about your listening rather than a skill anyone could test. That version needed a catalogue we would have had to license and a taxonomy we would have had to invent, and it measured what you had been exposed to rather than what you could do with it. The version that shipped measures the thing Hume actually named.

`PAGE-LEARN-COMPARISON-04` · OPEN
> It reuses a test you have already taken. The Prestige Test asks you to rate {numberWord(CLIPS)} clips blind on a scale of {numberWord(DEGREES_AVAILABLE)} whole numbers, then rate them again with names attached. Those ratings are already on your device, so comparison costs no new clip and no new tap. Two things come out of them: how many of the {numberWord(DEGREES_AVAILABLE)} degrees you actually landed on, and how many pairs you ordered one way blind and the opposite way once the names were time — counting only pairs where the labels pushed both clips the same direction, so a prestige label cannot be the explanation.

`PAGE-LEARN-COMPARISON-05` · OPEN
> Neither number is a mark out of anything. The count is read against what an indifferent rater would produce rather than against the top of the scale, because rating {numberWord(CLIPS)} clips at random already lands on about {numberWord(BY_CHANCE)} distinct values — the ceiling is reachable by accident, and a reader measuring themselves against it is measuring themselves against nothing.

`PAGE-LEARN-COMPARISON-06` · OPEN
> What the professionals do with their own scales

`PAGE-LEARN-COMPARISON-07` · OPEN
> Assigning degrees is not an eighteenth-century abstraction; it is the daily work of music criticism, and its central embarrassment is how few degrees anyone uses. These are quoted as a reference point and never as a target — nobody here is scored against a critic, for a reason given below.

`PAGE-LEARN-COMPARISON-08` · OPEN
> Ours is {OUR_SCALE.scale} — {numberWord(DEGREES_AVAILABLE)} places to put a clip. The instrument asks only how many of them you used — not whether you used the right ones, because on this question there is no right one.

`PAGE-LEARN-COMPARISON-09` · OPEN
> Why it never scores you against a critic

`PAGE-LEARN-COMPARISON-10` · OPEN
> The obvious version of this instrument compares your ranking with a famous reviewer's and tells you how close you got. It is not built, and it is not going to be. The Prestige Test exists to measure how far a prestigious name moves your judgment. {CRITIC_CONTRADICTION} So critics here set the spread and never the answer, and the instrument never says a reader is wrong.

`PAGE-LEARN-COMPARISON-11` · OPEN
> The honest limit, last, because it matters more than anything above it: these clips were never spaced out by quality. They were chosen for licence clarity and for genre spread, so nobody knows how far apart they truly sit. If they really are close together, hearing them that way is the correct answer — and this instrument cannot tell that apart from a listener who hears everything as much the same. It reports what you did with the scale. It does not grade your ear.

`PAGE-LEARN-COMPARISON-12` · OPEN
> The measurements themselves, with their formulas and their caveats, are published in the Lab.

*1 further block on this page is filled entirely from content modules, so the words are reviewed in the earlier parts rather than here.*

---

### `/learn/delicacy`

**Edits land in** `src/app/learn/delicacy/page.tsx`.

> HUME'S CRITERIA · DELICACY

`PAGE-LEARN-DELICACY-01` · OPEN
> Hume anchors delicacy in a story he borrows from Don Quixote. Two of Sancho's kinsmen are asked to judge a hogshead of wine. One tastes leather in it; the other tastes iron. The company ridicules them — the wine is excellent, everyone else agrees. Then the hogshead is drained, and at the bottom lies an old key on a leathern thong.

`PAGE-LEARN-DELICACY-02` · OPEN
> The point of the story is not that the kinsmen had refined opinions. It's that their perception was verifiable. There was a fact at the bottom of the barrel, and their palates found it while everyone else's missed it. Delicacy, in Hume's account, is exactly this: the capacity to register fine ingredients in a composition that most perceivers never notice — and the key in the wine is what separates delicacy from pretension. A claim of fine taste that can never be checked is just a claim.

`PAGE-LEARN-DELICACY-03` · OPEN
> Most taste tests never leave opinion territory, which is why they can't measure delicacy at all. The Delicacy Trials are built the other way around: start from recordings in the public domain or under Creative Commons licenses, introduce controlled degradations — {flawFamilyList()} — and ask which version is the original and what, precisely, is wrong with the other. Every trial has a key at the bottom of the barrel: an objectively correct answer. Difficulty is tunable, so the trials can find the exact threshold where your ears give out, and the items can be calibrated with item-response theory as real response data accumulates.

`PAGE-LEARN-DELICACY-04` · OPEN
> In the gym, the Delicacy Trials are {DELICACY_LIVE ? "machine 02, and they are open" : "machine 02, visible and locked until their pool clears validation"} — built after the Prestige Test. And where prejudice is something to be caught in the act, delicacy is something Hume says training improves — which is what practice is for.

---

### `/learn/flaws`

**Edits land in** `src/app/learn/flaws/page.tsx`.

> REFERENCE · WHAT THE GYM CAN MEASURE

`PAGE-LEARN-FLAWS-01` · OPEN
> Measured in {f.unit} by {machineLinks(f.machines)}. {f.plainUnit}

*5 further blocks on this page are filled entirely from content modules, so the words are reviewed in the earlier parts rather than here.*

---

### `/learn/freedom-from-prejudice`

**Edits land in** `src/app/learn/freedom-from-prejudice/page.tsx`.

`PAGE-LEARN-FREEDOMFROMPREJUDICE-01` · OPEN
> HUME'S CRITERIA · FREEDOM FROM PREJUDICE

`PAGE-LEARN-FREEDOMFROMPREJUDICE-02` · OPEN
> Of Hume's five criteria, this is the one about contamination. A judge, he argued, must keep the mind "free from all prejudice" and let nothing into the verdict except the object itself — not the author's reputation, not the fashion of the moment, not loyalty, not rivalry. The judgment should belong to the work, and works don't have names until someone attaches one.

`PAGE-LEARN-FREEDOMFROMPREJUDICE-03` · OPEN
> Hume was blunt about how rarely anyone manages this. Reputation arrives before the art does; by the time you press play on an acclaimed record, the acclaim has already voted. The striking thing is that in 1757 he described what is now a replicated experimental finding: attach a prestigious label to a work and evaluations move, even when the label is false. Wine tastes better wearing an expensive price tag; the same manuscript reads worse under an unknown byline.

`PAGE-LEARN-FREEDOMFROMPREJUDICE-04` · OPEN
> Most people, asked whether they judge music by the name on it, say no. That answer is worthless — not because people lie, but because prejudice doesn't announce itself to the person having it. The only honest way to know is to be caught in the act.

`PAGE-LEARN-FREEDOMFROMPREJUDICE-05` · OPEN
> That is the entire design brief of the Prestige Test: same clips, rated blind and then labeled, with some labels deliberately swapped. When your rating follows a false name, prejudice is the only suspect left in the room. The gap between your two passes is Hume's criterion turned into a number — and because you are your own control, the number never depends on anyone's opinion of what the "right" rating was.

`PAGE-LEARN-FREEDOMFROMPREJUDICE-06` · OPEN
> Freedom from prejudice is the first criterion the gym measures, but it is one of five. The others — delicacy, practice, comparison, and good sense — each have a machine of their own.

---

### `/learn/good-sense`

**Edits land in** `src/app/learn/good-sense/page.tsx`.

> HUME'S CRITERIA · GOOD SENSE

`PAGE-LEARN-GOODSENSE-01` · OPEN
> Good sense is Hume's supervising faculty — reason, standing behind perception and checking its work. The other criteria can all misfire without it: delicate ears with no judgment about when to trust themselves, practice that rehearses a bias into a habit, breadth that collects exposure without weighing it. Good sense is the part of a judge that knows when their own verdict is reliable and when it isn't.

`PAGE-LEARN-GOODSENSE-02` · OPEN
> That sounds unmeasurable — a faculty about faculties. It isn't. Decision science has a precise, boring name for it: calibration. A judge is well calibrated when their confidence matches their accuracy — when the answers they'd stake 95% on are right about 95% of the time, and the coin-flip feelings are right about half the time. Overconfidence and underconfidence are both failures of exactly the thing Hume was pointing at: knowing the reliability of your own judgment.

`PAGE-LEARN-GOODSENSE-03` · OPEN
> So the gym measures it. On performance items — trials with objectively right answers, like the Delicacy Trials — you attach a confidence level to each answer: 95%, 70%, or 50%. Plot claimed confidence against actual accuracy and you get a calibration curve; a Brier score summarizes how far you sit from the diagonal where confidence and reality agree. The result is Hume's most abstract criterion turned into arithmetic: a curve you can read, and one number for how far it sits from the line.

`PAGE-LEARN-GOODSENSE-04` · OPEN
> One honesty note, because it's the house rule: confidence input never inflates or weights your scores — it's measured against your accuracy, never blended into it. A confident wrong answer costs you calibration; it cannot buy you points. The gym opens with the Prestige Test; the full measurement rules live in the methodology.

---

### `/learn/methodology`

**Edits land in** `src/app/learn/methodology/page.tsx`.

> THE HOUSE RULES · METHODOLOGY

`PAGE-LEARN-METHODOLOGY-01` · OPEN
> Hume closed his essay with a job description: strong sense, delicate sentiment, improved by practice, perfected by comparison, cleared of prejudice — that is a true judge. The Taste Gym's methodology is that sentence turned into engineering constraints.

`PAGE-LEARN-METHODOLOGY-02` · OPEN
> 1. Performance over self-report. Every instrument is a task where you can be wrong. Questionnaires measure your self-image; tasks measure what you actually did. The prestige gap is computed from what your ratings did under false labels; delicacy from whether you found the planted flaw; good sense from whether your confidence matched your accuracy. Nothing asks you to describe your taste, because that answer was never evidence.

`PAGE-LEARN-METHODOLOGY-03` · OPEN
> 2. The user is their own control. Wherever possible the design is within-subject: your labeled ratings are compared to your blind ratings, your retest to your baseline. This removes the need for an external ground truth about which music is good — the instrument never has to take a side in that argument to measure your movement within it. The Prestige Test additionally carries unlabeled control clips, rated in both passes and labeled in neither: they measure each user's plain second-pass drift (memory, familiarity, regression), and the headline score subtracts the residual that drift would leave in it.

`PAGE-LEARN-METHODOLOGY-04` · OPEN
> 3. Deterministic scoring, in code. Every number is computed by a scoring engine whose rules are fixed and inspectable — same responses, same score, every time. No language model classifies you, no black box guesses. Where an AI writes narrative around a result, it narrates a number that was already computed and cannot change it.

`PAGE-LEARN-METHODOLOGY-05` · OPEN
> 4. No number the data can't back. Until a real calibration cohort exists, results carry a provisional label and no percentile appears anywhere in the product. As sessions accumulate, the psychometrics are standard and open about their assumptions: item-response theory for item difficulty and discrimination, signal-detection analysis for the trials, calibration curves and Brier scores for confidence, reliability checks before any norm is published — always with its N attached.

`PAGE-LEARN-METHODOLOGY-06` · OPEN
> 5. The rulers were not invented here. Every figure above is simulated and the cohort is zero, so this product cannot argue from data about people. What it can show is where its measuring apparatus came from — which was published practice all along, uncredited until now.

`PAGE-LEARN-METHODOLOGY-07` · OPEN
> {degreesConvergenceLine()} That last number is the comparison reading, and it is the only place in this product where a professional's scale appears beside your own. It is a reference point and never a target: agreement with a critic is not scored here, because the Prestige Test measures being moved by a prestigious name. {CRITIC_CONTRADICTION}

`PAGE-LEARN-METHODOLOGY-08` · OPEN
> The analytics dataset behind this — a different store from the one on your device — is self-generated and boring by design: anonymized response vectors under a random session id, carrying ratings, listen times, item-pool version and the scores computed from them. No accounts, no names, no ad-tech. Your browser keeps only your raw answers, never a score; the two are separate on purpose, and the terms say which is which. It exists so the instruments can be calibrated honestly, and that's the whole job. The criteria these rules serve are in the reading room — start with freedom from prejudice — or skip the theory and take the Prestige Test.

*2 further blocks on this page are filled entirely from content modules, so the words are reviewed in the earlier parts rather than here.*

---

### `/learn/practice`

**Edits land in** `src/app/learn/practice/page.tsx`.

> HUME'S CRITERIA · PRACTICE

`PAGE-LEARN-PRACTICE-01` · OPEN
> Practice is the criterion that makes this product a gym rather than a mirror. Hume is unambiguous: nothing improves the faculty of judging more than practice in a particular art — the repeated, attentive survey of works of one kind. Taste, in his account, is not an endowment you check once and frame. It's a capacity that sharpens with reps and dulls with neglect.

`PAGE-LEARN-PRACTICE-02` · OPEN
> He even describes the beginner's condition: confront a work for the first time and the sentiment it produces is obscure and confused — you can tell you feel something, but not which parts of the work are doing it, or how well. Only repeated encounters let a judge resolve that blur into discrimination: this voicing, that transition, this specific flaw. Anyone who has learned to hear the difference between a good and a great recording of the same piece has lived this.

`PAGE-LEARN-PRACTICE-03` · OPEN
> The gym takes the claim literally, with the same honesty rule as everything else: an improvement you can't measure is an improvement you can't claim. Sit a threshold ladder twice in the same browser and the result screen compares the two — against a noise floor we measured first, so that a difference smaller than the instrument's own run-to-run wobble is reported as no change rather than as progress.

`PAGE-LEARN-PRACTICE-04` · OPEN
> That floor is high, and saying so is the point. Two sittings on the pitch ladder have to differ by roughly {PITCH_FLOOR_TIMES} times before the arc will call it movement; on the prestige test the label's pull has to shift by {numberWord(BIAS_FLOOR_POINTS)} points of the scale. Most retests are therefore told that nothing changed the instrument could hear — which is the honest answer, and the reason the sentence names what it would have taken instead of leaving you to guess. The delicacy trials get no arc at all: {numberWord(DELICACY_ARC_FLOOR.trials)} pairs cannot resolve a change smaller than {numberWord(DELICACY_ARC_FLOOR.itemsToMove)} of them, so that screen says so and points here.

`PAGE-LEARN-PRACTICE-05` · OPEN
> What a second sitting genuinely buys is precision. The wobble of an average falls as the square root of the number of sittings, so the more often you come back, the smaller a real change has to be before this can see it. That is the whole return: not a badge or a streak, but a number that gets harder to argue with.

`PAGE-LEARN-PRACTICE-06` · OPEN
> Practice alone isn't sufficient, though. Hume pairs it with breadth — you can rehearse one narrow corner of music forever and stay a provincial judge. That failure mode belongs to comparison, and knowing whether to trust your own sharpening judgment belongs to good sense. The gym starts where prejudice is caught in the act: the Prestige Test.

---

### `/learn/prestige-bias-test`

**Edits land in** `src/app/learn/prestige-bias-test/page.tsx`.

> MACHINE 01 · THE FLAGSHIP

`PAGE-LEARN-PRESTIGEBIASTEST-01` · OPEN
> The Prestige Test measures one thing: how far a famous name can move your ratings. Not whether you like the right music — whether the label in the room changes what your ears report.

`PAGE-LEARN-PRESTIGEBIASTEST-02` · OPEN
> The design is a within-subject experiment, about {BIAS_SESSION_MINUTES} minutes long. You hear {numberWord(BIAS_CLIP_COUNT)} short clips and rate each one blind — no artist, no context, just sound. Then you hear the same {numberWord(BIAS_CLIP_COUNT)} clips again with names and reputations attached, and rate them again. Your score is computed from the gap between the two passes: the share of your rating movement that flowed toward the labels.

`PAGE-LEARN-PRESTIGEBIASTEST-03` · OPEN
> Here is the part that makes it an instrument instead of a party trick: {numberWord(BIAS_SWAPPED_COUNT)} of the {numberWord(BIAS_LABELLED_COUNT)} labels are deliberately false. A modest work arrives wearing borrowed acclaim; a distinguished one arrives dressed down. If your ratings follow the labels even when the labels lie, the movement can't be explained by the music — only by the prestige. You serve as your own control, which is why the test needs no external ground truth about which clip is "objectively better."

`PAGE-LEARN-PRESTIGEBIASTEST-04` · OPEN
> {numberWordLeading(BIAS_CONTROL_COUNT)} of the {numberWord(BIAS_CLIP_COUNT)} clips are controls: they carry no label in either pass. They measure how much your ratings drift on a plain second listen — memory, familiarity, fatigue — and that measured drift is corrected out of your headline number. The obvious objection to any re-rating design, "the second pass just tests memory," is thereby a published control rather than a caveat.

`PAGE-LEARN-PRESTIGEBIASTEST-05` · OPEN
> Every swap is confessed. The test ends with a mandatory debrief that names each false label, shows the true attribution, and shows exactly what your ratings did when the name was a lie. You cannot exit around it. An instrument built on deception owes you the disclosure — and the disclosure is the part worth staying for.

`PAGE-LEARN-PRESTIGEBIASTEST-06` · OPEN
> Your result is a measured number, not a diagnosis. And until enough real sessions exist to compute honest norms, it is labeled provisional — no invented percentiles, no "better than 73% of listeners." The philosophy behind the design is Hume's criterion of freedom from prejudice; the measurement principles are laid out in the methodology.

---

### `/learn/ranking-test`

**Edits land in** `src/app/learn/ranking-test/page.tsx`.

> THE INSTRUMENTS · THE RANKING TEST

`PAGE-LEARN-RANKINGTEST-01` · OPEN
> A critic once put twenty-one Beethoven works in order. Michael Tanner did it for BBC Music Magazine, and like every such list it is one person's opinion published under his own name — which is exactly what makes it usable here. It is not a correct answer. It is a second set of gaps to compare yours against.

`PAGE-LEARN-RANKINGTEST-02` · OPEN
> {numberWordLeading(WORKS)} of those works are played here, {numberWord(SPREAD_CLIP_SECONDS)} seconds each, with nothing attached: no composer date, no movement title, no hint of where he placed them. You rate what you hear. Afterwards the instrument reports how far apart your two ratings fell across the {numberWord(FAR)} pairs he separated by ten positions or more, and the same figure across the {numberWord(CLOSE)} pairs he placed within three of each other.

`PAGE-LEARN-RANKINGTEST-03` · OPEN
> Agreeing with him is not measured, and the instrument could not measure it if it tried. The only thing taken from the ranking is the distance between two positions. Which of the two he put higher was never imported, so there is no stored number from which your agreement could be worked out afterwards — not by us, not later, not by accident. Preferring the work he ranked lower costs you nothing. {CRITIC_CONTRADICTION}

`PAGE-LEARN-RANKINGTEST-04` · OPEN
> Both numbers are read against {BY_CHANCE} points, which is what rating at random produces — and it produces the same figure on both kinds of pair, because chance does not know which works a critic separated. That is the whole reference point. Two figures sitting together near it show no discrimination in this sitting; two that differ show some, on these clips.

`PAGE-LEARN-RANKINGTEST-05` · OPEN
> The two numbers are never combined, and the difference between them is never reported. They rest on {numberWord(FAR)} pairs and {numberWord(CLOSE)} pairs, built from clips that appear in several pairs apiece, and nobody has sat this instrument twice — so how far the figures wander on their own has never been measured. There is no honest size at which the gap between them becomes a result. Offering one would be inventing the threshold, which is the failure this product spends its existence refusing.

`PAGE-LEARN-RANKINGTEST-06` · OPEN
> If you already know the music, say so before you rate it. Half of any critic's list is famous, and recognising a work means part of your rating is memory of a reputation rather than the last {numberWord(SPREAD_CLIP_SECONDS)} seconds. Those clips are removed before anything is computed. It is taken on your word — nothing checks — and what you recognised is never reported as a fact about you. Recognise enough and you get no number at all, plus a plain statement of why, because the instrument needs at least {numberWord(MIN_PAIRS_PER_KIND)} usable pairs of each kind and will not print a figure it cannot support.

`PAGE-LEARN-RANKINGTEST-07` · OPEN
> Two limits are published rather than hidden. A forty-second excerpt cannot carry a critic's verdict on a work that runs forty minutes; {numberWord(SPREAD_CLIP_SECONDS)} seconds is longer than anything else here and is still a mitigation rather than a fix. And these {numberWord(WORKS)} recordings differ in brightness by about ten kilohertz for reasons no ranking caused — one source is a 128 kbps mp3 whose sound stops at 8,624 Hz. Measured, that difference is larger across the pairs he bracketed together than across the ones he separated, so it makes a difference harder to find rather than easier. Both figures, and what they were measured against, are on the Lab.

`PAGE-LEARN-RANKINGTEST-08` · OPEN
> Your answers stay in the browser you gave them in, like every other result here — the ratings and which clips you said you already knew, never the two figures, which are worked out again each time they are read. Underneath the result is the raw record: what you gave each of the six, which works they actually were, and the gap you left on every pair that counted. It is the only place the six are named, and reading it is the end of your blind sitting.

---

### `/legal`

**Edits land in** `src/app/legal/page.tsx`.

> THE TASTE GYM

`PAGE-LEGAL-01` · OPEN
> Plain language, no tricks. Last updated {LEGAL_LAST_UPDATED}.

> What this is

`PAGE-LEGAL-02` · OPEN
> The Taste Gym measures how you hear music. Each instrument is a listening task with answers you can get objectively wrong, and every number is computed by a deterministic engine in code — no machine-learning model and no language model classifies you. It is not a psychological assessment, not a personality test, not medical or mental-health advice, and not a diagnosis of anything. It does not predict your personality, your mood or your character, and it never claims to. Older readings still reachable here — the music and football quizzes — are entertainment and were never measurements.

> Terms of use

`PAGE-LEGAL-03` · OPEN
> Everything here is free. There is no paid tier, no subscription and nothing to buy. The only gate is a seven-day wait before repeating an instrument, and that exists because a retest taken sooner measures your memory of the clips rather than your ear.

`PAGE-LEGAL-04` · OPEN
> Don't use any result here to make decisions about employment, credit, insurance, housing, or anything else that matters that much. It measures how you heard a handful of short clips on one afternoon.

`PAGE-LEGAL-05` · OPEN
> Footballer names appear only to describe public playing styles. The Taste Gym is not affiliated with, endorsed by, or connected to FIFA, any club, league, or player.

`PAGE-LEGAL-06` · OPEN
> Don't abuse, reverse-engineer, or resell the service. Be normal.

> Not directed at children under 13.

`PAGE-LEGAL-07` · OPEN
> No accounts, no user database. There is nothing to sign up for and no record of you on a server. Everything the gym knows about you is in the browser you are reading this in.

`PAGE-LEGAL-08` · OPEN
> Your sessions are stored on your device. When you finish an instrument we keep your raw answers in this browser's local storage — never a computed score, so nothing here can be edited into a better result. It is what lets a later session say whether your ear moved, and it is why the seven-day retest gate knows you. Switch device or clear your browsing data and it is gone; there is no copy anywhere else.

`PAGE-LEGAL-09` · OPEN
> Quiz answers in the older music and football readings live in the page URL, so a link you share carries them and nothing else does.

`PAGE-LEGAL-10` · OPEN
> Artist names you type into the older music reading are sent to our AI provider (Anthropic) solely to write that reading. No instrument in the gym sends anything to a language model: every measured result is computed here, in code.

`PAGE-LEGAL-11` · OPEN
> We collect anonymised usage events (page views, session completion, shares) through Vercel Web Analytics and PostHog, to see whether the product works. No advertising trackers, no selling data.

`PAGE-LEGAL-12` · OPEN
> Want anything else gone? There is no server-side record of you to delete, but the button below clears everything this browser holds, and you can contact us ({support ? support : "through the address on the repository"}) with any question about it.

*4 further blocks on this page are filled entirely from content modules, so the words are reviewed in the earlier parts rather than here.*

---

### `/spread (the frame and the hero captions)`

**Edits land in** `src/app/spread/SpreadFlow.tsx`.

> The Ranking Test

`PAGE-SPREAD-FRAME-01` · OPEN
> **A critic ranked these works. Do your gaps fall where his did?**

`PAGE-SPREAD-FRAME-02` · OPEN
> {numberWordLeading(SPREAD_WORK_COUNT)} pieces of music, {numberWord(SPREAD_CLIP_SECONDS)} seconds each. Rate what you hear, and nothing else. A published critic once ranked all of these against each other — some he placed far apart, some he bracketed together.

`PAGE-SPREAD-FRAME-03` · OPEN
> What comes out is two numbers: how far apart your ratings fell on the pairs he separated, and how far apart they fell on the pairs he did not. Agreeing with him is not the point and is not measured. Nothing here can even see which of two works he ranked higher.

`PAGE-SPREAD-FRAME-04` · OPEN
> About {numberWord(SPREAD_SESSION_MINUTES)} minutes of listening. Headphones help.

`PAGE-SPREAD-FRAME-05` · OPEN
> Listen, then say whether you know it — and only then rate it.

> Had you heard this before?

`PAGE-SPREAD-FRAME-06` · OPEN
> Saying yes leaves the clip out of the result. It is never counted against you.

> How good is it?

> The Ranking Test

> **Where your gaps fell**

> across works he placed far apart

> across works he bracketed together

> How this is measured

`PAGE-SPREAD-FRAME-07` · OPEN
> Rating at random gives {baseline.toFixed(1)} on both.

*5 further blocks on this page are filled entirely from content modules, so the words are reviewed in the earlier parts rather than here.*

---

**94 blocks, roughly 4244 words, across 11 surfaces.**


---

# Part 4 · The /method page

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
`MET-PAGES-OWN-01` · OPEN
What this project refused, and what each refusal cost.
```

**Two opening paragraphs:**

```
`MET-PAGES-OWN-02` · OPEN
The instruments on this site are the visible part. The part worth reading about is the operating model that produced them — a written constitution, two review protocols, and a decision record that has repeatedly deleted finished work for being untrue rather than for being broken.

`MET-PAGES-OWN-03` · OPEN
Any project can list what it built. This page lists what it refused, because a refusal is the only decision with a verifiable cost attached, and because a page of things that went well is a brochure. Each block below names the document it comes from. Those documents are in the repository, and a test opens every one of them on every run to check the quoted passage is still there — if a source is reworded, this page fails the build instead of quietly becoming false.
```

**Closing line:**

```
`MET-PAGES-OWN-04` · OPEN
Standing facts on this page last checked 2026-08-27. The instruments themselves are in the reading room; the measurements behind them are in the Lab, including a page listing what the instruments cannot do.
```

---

### 2. The operating model, in the ruled reader order

Three sections, in the order the direction document fixes: product manager, business analyst, data analyst. Each section's heading and lede are free prose with no ledger entry — same status as §1.

#### Section: For a product manager

**Heading and lede (free prose):**

```
`MET-OPERATING-MODEL-01` · PART-LOCKED
How a decision gets made, and stays made
`MET-OPERATING-MODEL-02` · PART-LOCKED
The project runs on a written constitution and two review protocols. What is unusual is not that they exist. It is that they constrain the engineer more than the owner, and that they are enforced by tests rather than by good intentions.
```

#### 1. `pm-is-not-an-engineer`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** CLAUDE.md

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “they are newer to engineering, so explain tradeoffs in plain language”

Everything else in the block is the engineer's own connective prose and is free.

```
`MET-OPERATING-MODEL-03` · PART-LOCKED
The constitution opens by naming the owner's expertise as a constraint on how work is presented to them: they are newer to engineering, so explain tradeoffs in plain language and teach as you go. Every option put to them has to be legible without the jargon, or the ruling that comes back is a rubber stamp on a sentence nobody understood.
```

#### 2. `asks-must-be-in-the-block`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** docs/redteam-protocol.md

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “any ask NOT in this block is deemed not asked”

Everything else in the block is the engineer's own connective prose and is free.

```
`MET-OPERATING-MODEL-04` · PART-LOCKED
Every request for a decision goes in one fixed block at the end of a reply, and anything outside it does not count: any ask NOT in this block is deemed not asked.
```

#### 3. `defaults-must-be-reversible`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** docs/redteam-protocol.md

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “Defaults must be reversible choices, never one-way doors”

Everything else in the block is the engineer's own connective prose and is free.

```
`MET-OPERATING-MODEL-05` · PART-LOCKED
Each open question carries a default that applies if nobody answers, and the default is constrained rather than chosen: Defaults must be reversible choices, never one-way doors (pricing, data schema, deletions = no default, PM must answer). Silence can therefore only ever produce the undoable option.
```

#### 4. `n2-complexity-is-a-cost`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** restructuring_decision_memo_2026-07-11.md

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “complexity is a cost, not a value”

Everything else in the block is the engineer's own connective prose and is free.

```
`MET-OPERATING-MODEL-06` · PART-LOCKED
The guardrail this project runs on is not a preference for simplicity. It is written down as a cost: complexity is a cost, not a value — and either party may object by citing it.
```

#### 5. `slice-protocol-rationale`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** docs/slice-protocol.md

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “Self-review honesty is inversely proportional to the amount of sunk work under review”

Everything else in the block is the engineer's own connective prose and is free.

```
`MET-OPERATING-MODEL-07` · PART-LOCKED
Work is reviewed in the smallest increment that can be proved on its own, and the reason is written into the protocol: self-review honesty is inversely proportional to the amount of sunk work under review.
```

#### 6. `protocols-defend-against-the-author`

**Kind:** INFERRED — renders under a visible “Inference — the engineer’s reading, not a recorded ruling” label

**Cites:** docs/slice-protocol.md · CLAUDE.md

**No locked passage in this block** — all of it is the engineer's own prose and is free.

```
`MET-OPERATING-MODEL-08` · PART-LOCKED
Both protocols are aimed at the same weakness, and it is not incompetence — it is ownership. A reviewer goes soft on work they built, so the rules shrink what is under review and force the ask into a place it cannot be buried.
```

---

#### Section: For a business analyst

**Heading and lede (free prose):**

```
How a written requirement stays true
`MET-OPERATING-MODEL-09` · PART-LOCKED
Documentation drifting away from the system it describes is the normal condition of software, and it is usually filed under untidiness. Here it is a defect with a failing test attached — because a document describing a gate nobody performs sends the next reader to ask for a sign-off that cannot be given.
```

#### 7. `stale-gate-is-a-false-statement`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** src/content/retired-gates.test.ts

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “written as a thing still to be done, is a false statement in the”

Everything else in the block is the engineer's own connective prose and is free.

```
`MET-OPERATING-MODEL-10` · PART-LOCKED
Two documents once described a quality gate that had been abolished months earlier, as though it were still owed. The rule that came out of it is stated as a matter of truth rather than tidiness: a gate nobody performs any more, written as a thing still to be done, is a false statement in the repository.
```

#### 8. `fix-the-class-not-the-instance`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** src/content/retired-gates.test.ts

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “Fixing the two sentences leaves the class open”

Everything else in the block is the engineer's own connective prose and is free.

```
`MET-OPERATING-MODEL-11` · PART-LOCKED
The repair was not the two sentences. Fixing the two sentences leaves the class open, so the rule became a test that scans every document on every run, proved in both directions, because a guard that has only ever returned clean is not known to check anything.
```

#### 9. `published-text-must-match-the-code`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** src/content/published-text.test.ts

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “change the pool without changing the sentence and this fails”

Everything else in the block is the engineer's own connective prose and is free.

```
`MET-OPERATING-MODEL-12` · PART-LOCKED
The same rule now binds the files this site publishes about itself. They described an instrument of eight clips long after it had grown to sixteen, so the quantities are derived from the shipped item pool instead of being retyped: change the pool without changing the sentence and this fails, naming both numbers.
```

---

#### Section: For a data analyst

**Heading and lede (free prose):**

```
`MET-OPERATING-MODEL-13` · PART-LOCKED
How a number earns the right to be shown
`MET-OPERATING-MODEL-14` · PART-LOCKED
There are no real respondents yet. That single fact governs every figure on this site, and the interesting part is what it forbids rather than what it permits.
```

#### 10. `n3-honesty-rule`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** restructuring_decision_memo_2026-07-11.md

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “no score, percentile, or claim the data can't support”

Everything else in the block is the engineer's own connective prose and is free.

```
`MET-OPERATING-MODEL-15` · PART-LOCKED
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
`MET-OPERATING-MODEL-16` · PART-LOCKED
Before an estimator is trusted with real answers it is run on simulated ones generated from a known model, and required to recover the known parameters. The claim that buys is deliberately modest: I validated the estimator by parameter recovery before fielding it.
```

#### 12. `simulated-is-labelled`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** docs/artifact-pivot-2026-08-07.md

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “in-app, in charts, in the write-up, in the repo”

Everything else in the block is the engineer's own connective prose and is free.

```
`MET-OPERATING-MODEL-17` · PART-LOCKED
Nothing simulated is allowed to pass as observed, anywhere it might be seen: in-app, in charts, in the write-up, in the repo. The badge is not small print. It is the reason the analytics pages are allowed to exist before a single person has taken a test.
```

#### 13. `band-not-point`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** src/engine/delicacy.ts

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “report the band, never the point”

Everything else in the block is the engineer's own connective prose and is free.

```
`MET-OPERATING-MODEL-18` · PART-LOCKED
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
`MET-FOUR-REFUSALS-01` · PART-LOCKED
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
`MET-FOUR-REFUSALS-02` · PART-LOCKED
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
`MET-FOUR-REFUSALS-03` · PART-LOCKED
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
`MET-FOUR-REFUSALS-04` · PART-LOCKED
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
`MET-FINDING-AGAINST-01` · PART-LOCKED
Before the retest arc was allowed to tell anyone their ear had moved, the size of change it can resolve was measured: the whole hazard here is that subtracting two noisy numbers manufactures progress. Simulating the same unchanged person through two sessions at the shipped length puts the floor on the pitch ladder at roughly 3.5 times — the threshold has to more than halve before the difference can be told from ordinary run-to-run wobble. On the prestige test it is eight points of the scale. The delicacy trials cannot support an arc at all: six of their fifteen pairs would have to change hands. Most retests are therefore told, in as many words, that nothing changed the instrument could hear. That refusal is the ordinary output of this feature rather than its edge case, and the sentence names the floor in the reader's own units so it reads as a fact about the instrument rather than a verdict on them. The only thing that lowers the floor is returning: pooled across four sittings it falls to about two and a half times, which is the entire reward this product offers for coming back.
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
`MET-FINDING-AGAINST-02` · PART-LOCKED
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
`MET-FINDING-AGAINST-03` · PART-LOCKED
What happened next is the part that is harder to read, and this reading is mine rather than a recorded ruling. Within the same week the project adopted a direction that made the avoided thing optional: Resume value cannot be hostage to a launch the owner has no energy to run, and after it, The 2026-09-15 deadline is not a live constraint. That argument is sound on its own terms. It is also, in sequence, a project noticing that it was avoiding something and then removing the requirement to do it. I cannot tell from the record which of the two it was, and neither can a reader, so the page says so rather than choosing the flattering reading. The test that would settle it is not an argument: it is whether the instruments are ever put in front of strangers. Until they are, the honest description of this project is that it has built three working instruments and measured them against simulated respondents.
```

---

**20 numbered blocks.** Regenerate with `node scripts/export-method-deck.mjs > docs/copy-deck-method.md` after any ledger change.


---

**222 sentences, each with an id.** 11 further lines are additional RENDERINGS of sentences already listed — they carry the id they belong to and are not separate strings to edit. Which surfaces have ever been through a writer is in `docs/copy-review-ledger.md`.

