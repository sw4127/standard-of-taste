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

**What renders with it, in order.** `creatorLines` in `threshold.ts` emits, in this order: (1) what this flaw sounds like in a track the reader made; (2) what their measured band implies gets past them. (1) renders every time; (2) renders only on a band narrow enough to name a limit. The consequence is dropped on a wide band rather than hedged, because the screen above has already refused twice and a third refusal is noise.

**Rules this copy must keep:**

- Two sentences; ONE on a wide band (the screen has already refused twice — a third is noise).
- No comparative that inverts on the kbps ladder — say “gentler/harsher”, never “below 96 kbps”.
- No claim about the person, no prediction about their future (D1).
- Must not reuse `bandLine`'s phrases (“You caught the damage at”, “you were guessing”).

**6 templates to review** — they render 25 distinct sentences across 78 reachable renderings. Each block below is the TEMPLATE, read from the source file, with `${…}` marking its real slots; the italic lines under it are examples of how it renders. Rewrite the template. Leave every slot exactly as it is — a slot is a value the engine computes, and resolving one freezes a number or a name that is supposed to move.

> Damage gentler than ${quantity(heardAt, unit)} slipped past you on these clips. That is the margin a render can wander inside while still sounding clean to you.

  *As rendered:* “Damage gentler than 100 cents slipped past you on these clips. That is the margin a render can wander inside while still sounding clean to you.”  ·  “Damage gentler than 17.7 cents slipped past you on these clips. That is the margin a render can wander inside while still sounding clean to you.”  · …and 2 more

> In a render this is the lead that turns faintly sour over a long note — a vocal, a bowed string, a synth lead — where the slide is slow enough to read as a bad performance rather than bad audio.

> In a render this is the rubbery, unanchored feel — everything agreeing on the tempo but not quite on where the beat sits, so the groove never locks.

> In a render this is the underwater, brittle quality — cymbals turning to gauze, reverb tails breaking into grit, the whole thing sounding like a worse copy of itself.

> This session never found a level of damage you catch reliably, so it cannot say what would slip past you — only that ${quantity(missedAt!, unit)} already did.

  *As rendered:* “This session never found a level of damage you catch reliably, so it cannot say what would slip past you — only that 100 cents already did.”  ·  “This session never found a level of damage you catch reliably, so it cannot say what would slip past you — only that 100 ms already did.”  · …and 8 more

> This session pinned ${quantity(heardAt, unit)} as damage you catch, but never found the level where you stop catching it — so what gets past you is gentler than that, by some amount these clips never established.

  *As rendered:* “This session pinned 12.5 ms as damage you catch, but never found the level where you stop catching it — so what gets past you is gentler than that, by some amount these clips never established.”  ·  “This session pinned 15.7 ms as damage you catch, but never found the level where you stop catching it — so what gets past you is gentler than that, by some amount these clips never established.”  · …and 6 more

---

## 2. Delicacy result — “WHAT THIS MEANS IN YOUR WORK”

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

> Naming is the half that transfers. Hearing that a render is wrong sends you back to generate again and hope; hearing which of the three it is sends you to a control that fixes it. You named it ${flawCorrect} of the ${flawEligible} times you were asked.

  *As rendered:* “Naming is the half that transfers. Hearing that a render is wrong sends you back to generate again and hope; hearing which of the three it is sends you to a control that fixes it. You named it 10 of the 10 times you were asked.”  ·  “Naming is the half that transfers. Hearing that a render is wrong sends you back to generate again and hope; hearing which of the three it is sends you to a control that fixes it. You named it 15 of the 15 times you were asked.”

> The naming question only comes after a pair you called correctly, and this session never reached one — so it says nothing about whether you can name a flaw, only about whether you spotted one.

> This session will not break your result down by flaw type, and the reason is arithmetic rather than modesty: at ${per} pairs of each, a listener equally good at all three comes out with uneven tallies about nine times in ten. Any split shown here would mostly be luck wearing a label.

  *As rendered:* “This session will not break your result down by flaw type, and the reason is arithmetic rather than modesty: at 5 pairs of each, a listener equally good at all three comes out with uneven tallies about nine times in ten. Any split shown here would mostly be luck wearing a label.”

> leads and vocals going quietly sour

> the brittle, underwater sheen of a bad export

> the groove never quite locking

---

## 3. Prestige result — “WHAT THIS MEANS IN YOUR WORK”

**Where it renders.** Renders on `/bias/result` and in the flow's debrief, under the verdict and above the share card.

**What the screen has already said.** The screen has already said: the signed percentage, “how far these ratings moved toward the labels”, the verdict pair (“Label-driven.” / “Steady ears.” / “Contrarian.”), and — in the flow — the receipt pill “You moved with the label on N of M clips that could move.”

**This layer's job.** Name where the same KIND of cue lives in the reader's own work, and mark the boundary of what was measured.

**What renders with it, in order.** `creatorLines` in `bias.ts` emits, in this order: (1) the cues this test could not put in front of the reader (`CUE_IN_YOUR_WORK`); (2) the verdict-branched boundary, which refers back to the line above as "the cues above". All of them render only when some rating had headroom to move. The two render together or not at all, and the second refers back to the first, so a rewrite that drops the cue list leaves the boundary pointing at nothing.

**Rules this copy must keep:**

- Carries NO counts — the receipt pill and the share card own those.
- The test measured a composer's name on a stranger's recording. It did NOT measure sunk cost, model provenance, or social commitment. Those may be NAMED as cues; it may never be claimed they moved anyone.
- A contrarian result must not be congratulated as unbiased.

**4 templates to review** — they render 4 distinct sentences across 6 reachable renderings. Each block below is the TEMPLATE, read from the source file, with `${…}` marking its real slots; the italic lines under it are examples of how it renders. Rewrite the template. Leave every slot exactly as it is — a slot is a value the engine computes, and resolving one freezes a number or a name that is supposed to move.

> In your own work the label is rarely a composer's name. It is which model made it, how long you spent on the prompt, and whether this is the take you already told someone was the good one.

> That result is about these names, on this afternoon. The cues above are the ones this test could not put in front of you, so nothing here has measured what they do to your judgment.

> This test played every clip unlabelled first, and that order is the part worth stealing: the cue has to be gone before the judgment, not argued away after it.

> Your ratings ran against the names rather than with them, which is still the name doing the steering — only in reverse. The remedy does not change: decide before the label arrives, not after it.

---

## 4. The Ranking Test — “WHERE YOUR GAPS FELL”

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

> Across the ${numberWord(result.far.count)} pairs he placed far apart, your two ratings differed by ${points(far)} points on average. Across the ${numberWord(result.close.count)} pairs he bracketed together, ${points(close)}. Rating at random produces ${points(result.spreadIfIndifferent)} on both, because chance does not know which works a critic separated.

  *As rendered:* “Across the four pairs he placed far apart, your two ratings differed by 0.0 points on average. Across the four pairs he bracketed together, 0.0. Rating at random produces 3.6 on both, because chance does not know which works a critic separated.”  ·  “Across the four pairs he placed far apart, your two ratings differed by 0.0 points on average. Across the four pairs he bracketed together, 5.3. Rating at random produces 3.6 on both, because chance does not know which works a critic separated.”  · …and 2 more

> Neither number says you agreed with him, and neither could: this looks only at how far apart your two ratings fell, never at which one you placed higher. Preferring the work he ranked lower costs you nothing, because agreement was never imported and cannot be worked out. Small numbers are not a poor result either — ${numberWord(SPREAD_POOL.length)} recordings of ${numberWord(SPREAD_POOL.length)} different works are not spaced out by quality, and if they genuinely sounded close, rating them close was the accurate thing to do.

  *As rendered:* “Neither number says you agreed with him, and neither could: this looks only at how far apart your two ratings fell, never at which one you placed higher. Preferring the work he ranked lower costs you nothing, because agreement was never imported and cannot be worked out. Small numbers are not a poor result either — six recordings of six different works are not spaced out by quality, and if they genuinely sounded close, rating them close was the accurate thing to do.”

> No number this time. Setting aside the ${numberWord(set)} you had heard before left ${numberWord(left)} ${left === 1 ? "clip" : "clips"}, and ${count === 1 ? "that makes" : "those make"} only ${numberWord(count)} usable ${spacing} ${count === 1 ? "pair" : "pairs"} where this needs ${need}. Under that count, one clip's wobble is larger than the thing being measured. Nothing you do differently changes that; the pool would have to grow.

  *As rendered:* “No number this time. Setting aside the one you had heard before left five clips, and that makes only one usable widely-spaced pair where this needs three. Under that count, one clip's wobble is larger than the thing being measured. Nothing you do differently changes that; the pool would have to grow.”  ·  “No number this time. Setting aside the two you had heard before left four clips, and that makes only one usable closely-spaced pair where this needs three. Under that count, one clip's wobble is larger than the thing being measured. Nothing you do differently changes that; the pool would have to grow.”

> ${numberWordLeading(n)} ${n === 1 ? "clip" : "clips"} you had heard before ${n === 1 ? "was" : "were"} set aside before anything was worked out, so what follows rests on the ${numberWord(left)} that ${left === 1 ? "was" : "were"} new to you. ${RECOGNITION_DISCLOSURE}

  *As rendered:* “One clip you had heard before was set aside before anything was worked out, so what follows rests on the five that were new to you. You said which of these you had heard before, and that was taken at face value — nothing here verifies it. Recognition only ever removes clips; what you recognised is never part of a result.”  ·  “Two clips you had heard before were set aside before anything was worked out, so what follows rests on the four that were new to you. You said which of these you had heard before, and that was taken at face value — nothing here verifies it. Recognition only ever removes clips; what you recognised is never part of a result.”

> You gave every one of these the same rating, so there are no gaps to compare and nothing here to work on. That is an answer, not a failure to produce one.

> You had heard all ${numberWord(set)} of these before, so there is nothing here to read. This one only works on music that is new to you — on anything you already know, a rating is partly memory, and no instrument can separate the two afterwards. There is no second attempt that would fix that: it needs more music than this pool currently holds. Come back if it grows.

  *As rendered:* “You had heard all six of these before, so there is nothing here to read. This one only works on music that is new to you — on anything you already know, a rating is partly memory, and no instrument can separate the two afterwards. There is no second attempt that would fix that: it needs more music than this pool currently holds. Come back if it grows.”

> You had heard every clip here before, so all ${numberWord(n)} were set aside. ${RECOGNITION_DISCLOSURE}

  *As rendered:* “You had heard every clip here before, so all six were set aside. You said which of these you had heard before, and that was taken at face value — nothing here verifies it. Recognition only ever removes clips; what you recognised is never part of a result.”

> You said none of these were familiar, so all of them counted. ${RECOGNITION_DISCLOSURE}

  *As rendered:* “You said none of these were familiar, so all of them counted. You said which of these you had heard before, and that was taken at face value — nothing here verifies it. Recognition only ever removes clips; what you recognised is never part of a result.”

> ${shape}. Whether that means anything is a question this cannot answer: ${numberWord(result.far.count)} pairs against ${numberWord(result.close.count)}, drawn from a set of clips that each appear in several pairs, and nobody has sat this twice to find out how far these numbers wander on their own. There is no honest size at which the gap between them becomes a result, so none is offered.

  *As rendered:* “Your ratings moved further apart where his judgment did not. Whether that means anything is a question this cannot answer: four pairs against four, drawn from a set of clips that each appear in several pairs, and nobody has sat this twice to find out how far these numbers wander on their own. There is no honest size at which the gap between them becomes a result, so none is offered.”  ·  “Your ratings moved further apart where his judgment did. Whether that means anything is a question this cannot answer: three pairs against three, drawn from a set of clips that each appear in several pairs, and nobody has sat this twice to find out how far these numbers wander on their own. There is no honest size at which the gap between them becomes a result, so none is offered.”

---

## 5. The retest arc — “DID YOUR EAR MOVE”

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

> Across your ${label} sittings, ${way} — a change of about ${moved}. This ladder cannot distinguish anything under ${floor} from ordinary run-to-run wobble, so a move this size is the instrument speaking rather than the dice.

  *As rendered:* “Across your pitch drift sittings, it now takes a larger flaw to reach you than it did — a change of about 11x. This ladder cannot distinguish anything under 3.5x from ordinary run-to-run wobble, so a move this size is the instrument speaking rather than the dice.”  ·  “Across your pitch drift sittings, you now catch a smaller flaw than you did — a change of about 11x. This ladder cannot distinguish anything under 3.5x from ordinary run-to-run wobble, so a move this size is the instrument speaking rather than the dice.”  · …and 2 more

> Across your ${label} sittings, ${way}. One sitting ran past the end of what this ladder can render, so the direction holds but the size does not — all that can be said is that the move cleared ${floor}, the smallest change this machine can tell from noise.

  *As rendered:* “Across your pitch drift sittings, you now catch a smaller flaw than you did. One sitting ran past the end of what this ladder can render, so the direction holds but the size does not — all that can be said is that the move cleared 3.5x, the smallest change this machine can tell from noise.”

> Nobody has measured how much this machine's numbers wander between sittings, so there is no honest line between a change and a coin flip here. Until there is, it says nothing.

> One of these two sittings has no answers that can be scored, so there is no pair to compare.

> One sitting cannot say whether your ear moved — there is nothing to compare it against. A second one in this browser is what makes that sentence possible at all.

> Read from this browser only — there are no accounts and nothing on a server, so another device has no history to compare and starts over.

> The label moved you ${before} before and ${after} since. That gap is inside the ${floor} points this test wanders by on its own, so it is not a change anybody could stand behind — the same person, retested, moves this much without anything about them changing.

  *As rendered:* “The label moved you +20% before and +15% since. That gap is inside the 8 points this test wanders by on its own, so it is not a change anybody could stand behind — the same person, retested, moves this much without anything about them changing.”

> The label moved you ${before} before and ${after} since — ${moved} points closer to zero, where zero means the name changed nothing. That is more than the ${floor} points this test wanders by on its own, so a name is doing less to what you hear than it was.

  *As rendered:* “The label moved you +20% before and 0% since — 20 points closer to zero, where zero means the name changed nothing. That is more than the 8 points this test wanders by on its own, so a name is doing less to what you hear than it was.”

> The label moved you ${before} before and ${after} since — ${moved} points further from zero, and more than the ${floor} points this test wanders by on its own. A name is doing more to what you hear than it was. Both directions count: marking a labelled clip down is still the name deciding, not your ears.

  *As rendered:* “The label moved you 0% before and +20% since — 20 points further from zero, and more than the 8 points this test wanders by on its own. A name is doing more to what you hear than it was. Both directions count: marking a labelled clip down is still the name deciding, not your ears.”

> These trials are too short to show change over time. Your score would have to move by ${numberWord(floor.itemsToMove)} of the ${numberWord(floor.trials)} pairs${clause} before it meant anything, so this machine reports where you are and leaves the question of movement to the threshold ladders.

  *As rendered:* “These trials are too short to show change over time. Your score would have to move by six of the fifteen pairs — or four of a single flaw's five — before it meant anything, so this machine reports where you are and leaves the question of movement to the threshold ladders.”

> These two compression sessions ran on different recordings, so they are not comparable. A fixed bitrate does up to twice as much damage to one recording as to another, which means the difference between these two sittings would be a fact about the music rather than about you.

> This rests on ${total} sittings — ${pooled.older} before and ${pooled.newer} since.${gain} the wobble of an average falls as the square root of how many sittings are in it, so each time you come back, a smaller real change becomes visible.

  *As rendered:* “This rests on 4 sittings — 2 before and 2 since. That is what pulled the line above down from 3.5x to 2.5x: the wobble of an average falls as the square root of how many sittings are in it, so each time you come back, a smaller real change becomes visible.”

> Your ${label} sittings are ${moved} apart, which this ladder cannot tell from its own noise. It would take about ${floor} before a change here meant anything. That is not a report that you stood still — it is the instrument saying a move this small is beneath what it can see.

  *As rendered:* “Your pitch drift sittings are 1.9x apart, which this ladder cannot tell from its own noise. It would take about 3.5x before a change here meant anything. That is not a report that you stood still — it is the instrument saying a move this small is beneath what it can see.”

---

## 6. Comparison — “DEGREES OF PRAISE”

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

> None of that says your ear is narrow. These clips were never spaced out by quality — if they really do sit close together, hearing them that way is the right answer, and this instrument cannot tell that apart from a listener who hears everything as much the same.

> Not a target, and not a score you are being given. Two published scales, and what their owners actually did with them.

> ${scope}, you put every one of them back in the same order.

  *As rendered:* “Of the thirty-four pairs you separated by two points or more, counting only pairs where the names on screen pushed both clips the same way, you put every one of them back in the same order.”

> ${scope}, you put ${numberWord(say.reversed)} of them the other way round the second time${ties}.

  *As rendered:* “Of the thirty-four pairs you separated by two points or more, counting only pairs where the names on screen pushed both clips the same way, you put fourteen of them the other way round the second time, and two more came out level.”

> Pitchfork: The scale runs from 0.0 to 10.0 in tenths, which is a hundred and one places a record can land. Across more than 18,000 reviews published between January 1999 and January 2017, the mean score was 7.0. Most of those scores lie between 6.4 and 7.8. Scores ending in .0 appear nearly twice as often as scores ending in .1 — the reviewers avoid the decimals their own scale offers them.

> Robert Christgau's Consumer Guide: The Consumer Guide's letter grades ran from A+ down to E−. From 1990 he used fewer letter grades for records below B+, replacing the bottom of his own ladder with honourable mentions and the categories Choice Cuts, Neither and Duds.

> This one gives you ${numberWord(OUR_SCALE.degreesAllowed)} — ${OUR_SCALE.scale} — and asks only how many of them you used. Not whether you used the right ones. There is no right one.

  *As rendered:* “This one gives you eleven — 0 to 10, whole numbers only — and asks only how many of them you used. Not whether you used the right ones. There is no right one.”

> This sitting had fewer clips than the scale has degrees, so a count out of ${numberWord(result.degreesAvailable)} would be measuring you against room you were never given.

  *As rendered:* “This sitting had fewer clips than the scale has degrees, so a count out of eleven would be measuring you against room you were never given.”

> WHAT THE PROFESSIONALS DO WITH THEIR OWN SCALES

> You put ${numberWord(say.itemCount)} clips on ${spread}, with ${range}. Someone rating the same clips at random would have landed on about ${numberWord(Math.round(say.degreesIfIndifferent))}.

  *As rendered:* “You put sixteen clips on all eleven of the degrees this scale offers, with the top and the bottom both in play. Someone rating the same clips at random would have landed on about nine.”  ·  “You put sixteen clips on two of the eleven degrees this scale offers, with nothing below five and nothing above six. Someone rating the same clips at random would have landed on about nine.”

> Your ratings sat too close together for this second number to mean anything: it needs ${numberWord(MIN_ASSERTED_PAIRS)} pairs separated by ${numberWord(ASSERTION_FLOOR)} points or more, and this sitting produced ${numberWord(result.pairs.asserted)}. Below that, one clip's wobble moves the answer further than the answer moves, so there is nothing here worth printing.

  *As rendered:* “Your ratings sat too close together for this second number to mean anything: it needs ten pairs separated by two points or more, and this sitting produced one. Below that, one clip's wobble moves the answer further than the answer moves, so there is nothing here worth printing.”  ·  “Your ratings sat too close together for this second number to mean anything: it needs ten pairs separated by two points or more, and this sitting produced zero. Below that, one clip's wobble moves the answer further than the answer moves, so there is nothing here worth printing.”

---

## 7. The borrowed apparatus — WHERE THE RULERS CAME FROM

**Where it renders.** Renders on `/method`, as the section explaining which published standards this product's measurements are built on.

**What the screen has already said.** The page has already described what each instrument does. This layer says whose rulers it borrowed to do it.

**This layer's job.** Show that the loudness normalisation, the transparency anchor and the listening-test design sit in a tradition with published standards — and say where this product departs from them.

**What renders with it, in order.** `apparatusLines` emits one entry per borrowed standard, then the citation-strength line, then the degrees-convergence line where it applies. They sit inside `/method`, beneath the page prose that describes the instruments themselves.

**Rules this copy must keep:**

- A CITATION MAY DESCRIBE THE MEASURING APPARATUS. It may NEVER describe how well people score. This is the rule the whole section runs on: quoting a standard's method is allowed, quoting anybody's results about listeners is not.
- Every standard named is one somebody opened. The descriptions live in `src/content/apparatus/standards.ts` beside the URL and the date; edit them there.
- Where this product departs from a standard, the departure is stated rather than glossed.
- It is short on purpose. The product already carries a great deal of methodological prose, and a reader who wanted a number about their ear is not helped by a survey of standards.

**5 templates to review** — they render 5 distinct sentences across 5 reachable renderings. Each block below is the TEMPLATE, read from the source file, with `${…}` marking its real slots; the italic lines under it are examples of how it renders. Rewrite the template. Leave every slot exactly as it is — a slot is a value the engine computes, and resolving one freezes a number or a name that is supposed to move.

> EBU R 128 — The broadcast method for measuring perceived loudness, rather than peak level. Every clip is loudness-normalised with a two-pass R 128 measurement to one fixed target before it is ever played, so no clip can seem better simply for arriving louder than the one before it. The target here is chosen for headphone listening rather than for broadcast delivery, and this file states the figure it actually uses rather than any figure the standard recommends.

> ${mushra.name} puts a sample anywhere on ${mushra.scaleLabel}. ${pitchfork.critic} offers ${pitchfork.degreesAllowed} places to put a record. Two very different attempts at the same problem, both landing near a hundred degrees. This one offers ${numberWord(OUR_SCALE.degreesAllowed)}, and asks only how many of them you used.

  *As rendered:* “ITU-R BS.1534-3 (MUSHRA) puts a sample anywhere on a continuous scale from 0 to 100. Pitchfork offers 101 places to put a record. Two very different attempts at the same problem, both landing near a hundred degrees. This one offers eleven, and asks only how many of them you used.”

> ITU-R BS.1534-3 (MUSHRA) — The international recommendation for subjective listening tests, using a hidden reference and anchors, with each sample rated on a continuous scale from 0 to 100. The same document places BS.1116 over small impairments and itself over intermediate quality. It is the tradition our trials sit in rather than a specification we claim to meet: a forced choice between two samples with a required listen, scored against chance. Our pairs carry near-transparent damage, which by that document's own division is BS.1116's regime rather than MUSHRA's — so the familiar 0-to-100 scale is the wrong one to picture here, and we do not use it.

> The transparent-encode anchor — A reference point for how much measurable difference an encode can cost while remaining, by consensus, inaudible. Clip fitness is judged against a 320 kbps MP3 round-trip of the same recording rather than against a fixed number, because the same encode costs more spectral distance on dense material than on sparse material. The anchor is a convention rather than a published standard, and it is a measurement of audio files: nobody has listened to confirm the clips it passes are transparent to any actual ear.

> ${inRepo} of these are decisions living in this repository, so a test opens the file that implements them and fails the build if the passage has moved. The other ${external} rests on a document no test can open, and carries the date a person opened it instead. Those are not the same strength of claim, and this page will not pretend otherwise.

  *As rendered:* “Two of these are decisions living in this repository, so a test opens the file that implements them and fails the build if the passage has moved. The other one rests on a document no test can open, and carries the date a person opened it instead. Those are not the same strength of claim, and this page will not pretend otherwise.”

---

## 8. Combined view — “ACROSS YOUR SESSIONS”

**Where it renders.** Renders on all three result screens, but ONLY when two or more instruments have been run on this device AND the result on screen is this device's own (never on somebody else's shared link).

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

> ${label}: caught at ${quantity(say.heardAt, t.unit)}${onSource(t)}

  *As rendered:* “Compression damage: caught at 160 kbps on pb1”  ·  “Pitch drift: caught at 3.1 cents”  · …and 1 more

> Every ladder the Gym can run has a session on this device. What moves the numbers now is time between sittings.

> Two separate sessions measured your ${label} in ${unit}, by different methods, and they agreed on ${tested} of ${tested} checks${material}. That is the closest thing here to evidence that the number is real and not an afternoon.

  *As rendered:* “Two separate sessions measured your compression damage in kbps, by different methods, and they agreed on 5 of 5 checks — and on different recordings, which is a harder test than either session alone. That is the closest thing here to evidence that the number is real and not an afternoon.”  ·  “Two separate sessions measured your pitch drift in cents, by different methods, and they agreed on 5 of 5 checks. That is the closest thing here to evidence that the number is real and not an afternoon.”

> Two separate sessions measured your ${label} in ${unit} and agreed on ${check.agree} of ${tested} checks${material}. Partial agreement is the ordinary result for two short sessions; a third would narrow it.

  *As rendered:* “Two separate sessions measured your pitch drift in cents and agreed on 2 of 3 checks — and on different recordings, which is a harder test than either session alone. Partial agreement is the ordinary result for two short sessions; a third would narrow it.”  ·  “Two separate sessions measured your pitch drift in cents and agreed on 2 of 3 checks. Partial agreement is the ordinary result for two short sessions; a third would narrow it.”

> Two separate sessions measured your ${label} in ${unit} and disagreed on all ${tested} checks${material}. One of the two sittings is not describing your ear — which is worth more than a number that was never tested twice.

  *As rendered:* “Two separate sessions measured your pitch drift in cents and disagreed on all 3 checks. One of the two sittings is not describing your ear — which is worth more than a number that was never tested twice.”

> Unmeasured on this device: ${list}. Nothing here says how you would do on ${names.length === 1 ? "it" : "them"}.

  *As rendered:* “Unmeasured on this device: pitch drift and compression damage. Nothing here says how you would do on them.”  ·  “Unmeasured on this device: pitch drift, timing smear and compression damage. Nothing here says how you would do on them.”  · …and 1 more

> You have answered ${parts.length} different questions about your ears: ${list}. They are not ${parts.length} scores of one thing and they do not add up — each is measured in its own terms.

  *As rendered:* “You have answered 2 different questions about your ears: whether a name changes what you hear; how small a flaw has to get before you lose it. They are not 2 scores of one thing and they do not add up — each is measured in its own terms.”  ·  “You have answered 2 different questions about your ears: whether a name changes what you hear; whether you can tell damage from clean and say what it is. They are not 2 scores of one thing and they do not add up — each is measured in its own terms.”  · …and 4 more

---

## 9. The expert panel — “THE RAW RECORD”

**Where it renders.** A collapsed panel under every result that this device stored, open only when the result on screen is the one this device recorded — on a link you share with someone else it renders nothing at all.

**What the screen has already said.** Every section above. This panel repeats none of it: it shows the numbers underneath — per-family and per-rung tallies, every trial with the answer key, the staircase's rung visits and measured limits, the calibration curve, the prestige test's per-clip ratings.

**This layer's job.** Label measurements and state limits. Never judge them — this is the verdict-free surface.

**What renders with it, in order.** The panel emits its blurb, then a section per instrument. The Brier sentence renders directly beneath the calibration chart it refers to.

**Not text, and not in this deck.** An SVG CALIBRATION CHART renders immediately above the Brier sentence: claimed confidence on the x axis, delivered accuracy on the y, with a DASHED DIAGONAL for perfect calibration. "The line above" is that diagonal, and a reader of this deck cannot see it. Every result surface also carries tables of numbers this deck does not reproduce.

**Rules this copy must keep:**

- No verdict, ever. `expert.ts` cannot supply one — it carries numbers, ids and enums with no sentence in it — and the calibration data deliberately omits the overconfident/underconfident label the result screen shows.
- Column headers and stat labels are copy too. They live in the deck precisely because deciding case by case which strings are ‘important enough to gate’ is how the gap reopens.
- The notes state LIMITS, not findings. A limit stated loosely is the shape an unmeasured claim takes.
- The blurb must warn that this is device-local, or a reader assumes a shared link carries it.

**14 templates to review**, plus 69 short labels — they render 83 distinct sentences across 85 reachable renderings. Each block below is the TEMPLATE, read from the source file, with `${…}` marking its real slots; the italic lines under it are examples of how it renders. Rewrite the template. Leave every slot exactly as it is — a slot is a value the engine computes, and resolving one freezes a number or a name that is supposed to move.

*Labels:* `#` · `95% interval` · `After correction` · `At the scale edge` · `Before correction` · `Blind` · `By flaw family` · `By rung` · `Caught` · `Caught at` · `Clip` · `Clips counted` · `Closely-spaced pairs` · `Control drift` · `Delivered` · `Drift` · `Every clip` · `Family` · `First` · `Fitted point` · `Flaw named` · `In his ranking` · `In the result` · `Label` · `Labelled` · `Mean gap · closely spaced` · `Mean gap · widely spaced` · `Missed at` · `Moved with label` · `Of` · `Original` · `Outcome` · `Pair` · `Positions apart` · `Rating at random` · `Right` · `Room to move` · `Rung` · `Said` · `Second` · `Set aside` · `Shown` · `Swapped items only` · `THE RAW RECORD` · `The session` · `Toward label` · `Trials` · `Versus claim` · `Where` · `Widely-spaced pairs` · `Work` · `You picked` · `You said` · `Your gap` · `Your rating` · `bracketed` · `caught` · `counted` · `far apart` · `fictional` · `guessed` · `hide` · `in band` · `not earned` · `set aside` · `show` · `too few to say` · `true` · `—`

> Brier score ${brier.toFixed(3)} over ${n} answers — always saying 50% on a two-way choice scores ${chance.toFixed(2)}. Lower is better, but it only means something read against the chart above: the dashed diagonal is perfect calibration, and the score alone cannot tell you which side of it you sat on.

  *As rendered:* “Brier score 0.287 over 15 answers — always saying 50% on a two-way choice scores 0.25. Lower is better, but it only means something read against the chart above: the dashed diagonal is perfect calibration, and the score alone cannot tell you which side of it you sat on.”

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

**190 concrete sentences across 9 surfaces.**

Anything rewritten here must still pass `src/content/voice.test.ts`, which screens five named hazards — motive attribution, person-verdicts, beige chrome, fabricated norms, unmeasured audibility claims. A green run there does **not** mean the prose is good; it means no named hazard is present. Judging whether it is good is the point of this document.
