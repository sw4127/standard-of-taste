# Copy return — BATCH 2, the page copy (PAGE-)

Returned by Cowork, 2026-09-07, against the deck at `2a7d445`. 17 ids changed, 57 left alone,
2 `RULE:` entries. **Run with the repository closed**, per the protocol in the commission: only
`docs/copy-commission.md`, `docs/copy-deck.md` and `docs/copy-review-ledger.md` were opened. The log
in section 4 is the measurement.

**The covering note never arrived.** The commission was read from disk instead. If the note carried
anything beyond what is in the brief, it has not reached this pass.

---

## 1. The rewrites

### `/learn/comparison`

```
PAGE-LEARN-COMPARISON-02
> Read that carefully and it is not a claim about how much music you have heard. It is a claim about what breadth gives you — degrees. The judge who has weighed many works can say that one is a little better than another and a third is far worse; the judge who has not is left with liking and not-liking, which is not a scale but a switch.
```
*Why:* "one degree and a floor" undersells its own point and mildly miscounts — liking and not-liking
is two states, not one degree. "Not a scale but a switch" is the same idea in the shape the paragraph
has been building toward since the word *degrees*.

```
PAGE-LEARN-COMPARISON-04
> It reuses a test you have already taken. The Prestige Test asks you to rate {numberWord(CLIPS)} clips blind on a scale of {numberWord(DEGREES_AVAILABLE)} whole numbers, then rate them again with names attached. Those ratings are already on your device, so comparison costs no new clip and no new tap. Two things come out of them: how many of the {numberWord(DEGREES_AVAILABLE)} degrees you actually landed on, and how many pairs you ordered one way blind and the opposite way once the names were attached — counting only pairs where the labels pushed both clips the same direction, so a prestige label cannot be the explanation.
```
*Why:* "the other way round the second time" made the reader assemble two adverbials to find the
comparison. "The opposite way once the names were attached" names the moment instead of the ordinal.

### `/learn/delicacy`

```
PAGE-LEARN-DELICACY-03
> Most taste tests never leave opinion territory, which is why they can't measure delicacy at all. The Delicacy Trials are built the other way around: start from recordings in the public domain or under Creative Commons licenses, introduce controlled degradations — {flawFamilyList()} — and ask which version is the original and what, precisely, is wrong with the other. Every trial has a key at the bottom of the barrel: an objectively correct answer. Difficulty is tunable, so the trials can find the exact threshold where your ears give out, and the items can be calibrated with item-response theory once real responses accumulate.
```
*Why:* one word. "Calibratable" is the only manufactured adjective on the page, and it lands in the
sentence that is trying to sound like standard practice.

```
PAGE-LEARN-DELICACY-04
> In the gym, the Delicacy Trials are {DELICACY_LIVE ? "machine 02, and they are open" : "machine 02, visible and locked until their pool clears validation"} — built after the Prestige Test. And where prejudice is something to be caught in the act, delicacy is something Hume says training improves — which is what practice is for.
```
*Why:* "unlike prejudice, Hume insists delicacy improves" attaches the comparison to Hume rather than
to delicacy — a dangler in the last sentence of the page. The repair also earns the contrast: one
criterion is caught, the other is trained.

### `/learn/freedom-from-prejudice`

```
PAGE-LEARN-FREEDOMFROMPREJUDICE-06
> Freedom from prejudice is the first criterion the gym measures, but it is one of five. The others — delicacy, practice, comparison, and good sense — each have a machine of their own.
```
*Why, and read this one before applying it:* "built or planned" is a hedge, and it is the only hedge
of its kind in the reading room — this product says plainly elsewhere which doors are not there. From
the deck alone all four now appear to exist: delicacy and comparison are live instruments in the
brief's own list, practice is the retest arc, good sense is the calibration read. **If any of the four
still has no instrument, revert this and name that one rather than restoring the hedge** — which is
what the rest of the product would do.

### `/learn/good-sense`

```
PAGE-LEARN-GOODSENSE-03
> So the gym measures it. On performance items — trials with objectively right answers, like the Delicacy Trials — you attach a confidence level to each answer: 95%, 70%, or 50%. Plot claimed confidence against actual accuracy and you get a calibration curve; a Brier score summarizes how far you sit from the diagonal where confidence and reality agree. The result is Hume's most abstract criterion turned into arithmetic: a curve you can read, and one number for how far it sits from the line.
```
*Why:* "one of the most rigorous numbers in the building" is the product praising its own output, on a
page whose next paragraph is a house rule about not doing that — and with a cohort of zero, "rigorous"
is a word the evidence cannot pay for. The replacement says what the reader gets instead of how good
it is, and it hands the diagonal to the reader by name, which is the referent the expert panel's Brier
line also needs.

### `/learn/methodology`

```
PAGE-LEARN-METHODOLOGY-02
> 1. Performance over self-report. Every instrument is a task where you can be wrong. Questionnaires measure your self-image; tasks measure what you actually did. The prestige gap is computed from what your ratings did under false labels; delicacy from whether you found the planted flaw; good sense from whether your confidence matched your accuracy. Nothing asks you to describe your taste, because that answer was never evidence.
```
*Why:* "tasks measure you" is a claim about the person, three lines above the page that defines D1.
This is the paragraph that states the rule; it should be the paragraph that keeps it.

```
PAGE-LEARN-METHODOLOGY-06
> 5. The rulers were not invented here. Every figure above is simulated and the cohort is zero, so this product cannot argue from data about people. What it can show is where its measuring apparatus came from — which was published practice all along, uncredited until now.
```
*Why:* "it was already standing on published practice without telling anyone" makes the product the
subject of a slightly furtive sentence. The point is a credit, so give it as one.

```
PAGE-LEGAL-01
> Plain language, no tricks. Last updated {LAST_UPDATED}.
```
*Why:* a date written in by hand on the page a reader opens to find out what they are agreeing to.
It was correct on the day it shipped and is wrong on every day after the next edit. **Slot name
invented — see the log.**

```
PAGE-LEARN-METHODOLOGY-08
> The dataset behind this is self-generated and boring by design: anonymized response vectors — ratings, listen times, item-pool version — under a random session id. No accounts, no names, no ad-tech. It exists so the instruments can be calibrated honestly, and that's the whole job. The criteria these rules serve are in the reading room — start with freedom from prejudice — or skip the theory and take the Prestige Test.
```
*Why:* **this contradicts `/legal` and I do not know which page is right.** PAGE-LEGAL-08 says the
product stores "your raw answers in this browser's local storage — **never a computed score**, so
nothing here can be edited into a better result." This paragraph lists "computed scores" among what
the dataset holds. They may be two different stores — one the browser, one the analytics vector — but
a reader comparing them sees the product contradict itself about whether it keeps a score, and the
`/legal` claim is load-bearing: it is the reason nothing can be edited into a better result.

I have removed the phrase rather than reconciled it, because reconciling requires knowing which is
true. **If the analytics vector genuinely does carry a computed score, `/legal` is the page that has
to change, and it is the more serious edit of the two.**

### `/learn/practice`

```
PAGE-LEARN-PRACTICE-04
> That floor is high, and saying so is the point. Two sittings on the pitch ladder have to differ by roughly {PITCH_ARC_SOLO_FLOOR} before the arc will call it movement; on the prestige test the label's pull has to shift by {BIAS_ARC_FLOOR} points of the scale. Most retests are therefore told that nothing changed the instrument could hear — which is the honest answer, and the reason the sentence names what it would have taken instead of leaving you to guess. The delicacy trials get no arc at all: {numberWord(DELICACY_ARC_FLOOR.trials)} pairs cannot resolve a change smaller than {numberWord(DELICACY_ARC_FLOOR.itemsToMove)} of them, so that screen says so and points here.
```
*Why:* the same sentence slots its delicacy floor and writes its pitch and prestige floors in by hand
— "three and a half times", "eight points". The deck itself shows those values moving: the arc
template `VOC-RETEST-ARC-12` reads *"pulled the line above down from ${solo} to ${now}"*, so the floor
falls as sittings pool. The prose is scoped to two sittings and therefore still true today, but it is
a measured constant printed as a word in the one paragraph explaining that the constant is measured.
**Slot names invented — see the log.**

### `/learn/prestige-bias-test`

```
PAGE-LEARN-PRESTIGEBIASTEST-02
> The design is a within-subject experiment, about {SESSION_MINUTES} minutes long. You hear {numberWord(CLIPS)} short clips and rate each one blind — no artist, no context, just sound. Then you hear the same {numberWord(CLIPS)} clips again with names and reputations attached, and rate them again. Your score is computed from the gap between the two passes: the share of your rating movement that flowed toward the labels.
```
```
PAGE-LEARN-PRESTIGEBIASTEST-03
> Here is the part that makes it an instrument instead of a party trick: {numberWord(SWAPPED)} of the {numberWord(LABELLED)} labels are deliberately false. A modest work arrives wearing borrowed acclaim; a distinguished one arrives dressed down. If your ratings follow the labels even when the labels lie, the movement can't be explained by the music — only by the prestige. You serve as your own control, which is why the test needs no external ground truth about which clip is "objectively better."
```
```
PAGE-LEARN-PRESTIGEBIASTEST-04
> {numberWordLeading(CONTROLS)} of the {numberWord(CLIPS)} clips are controls: they carry no label in either pass. They measure how much your ratings drift on a plain second listen — memory, familiarity, fatigue — and that measured drift is corrected out of your headline number. The obvious objection to any re-rating design, "the second pass just tests memory," is thereby a published control rather than a caveat.
```
*Why, for all three:* this page writes in five quantities — sixteen, fourteen, two, two, eight minutes
— that `/learn/comparison` slots as `{numberWord(CLIPS)}` on the same site, describing the same test.
The pool has already grown once; when it grows again this page goes false while the other stays true.
The prose is unchanged apart from the numbers. **Slot names invented — see the log.**

```
PAGE-LEARN-PRESTIGEBIASTEST-05
> Every swap is confessed. The test ends with a mandatory debrief that names each false label, shows the true attribution, and shows exactly what your ratings did when the name was a lie. You cannot exit around it. An instrument built on deception owes you the disclosure — and the disclosure is the part worth staying for.
```
*Why:* "the disclosure is where most people actually learn something" is a claim about what most people
experience, on a product with zero respondents. It is small and it is the exact shape N3 exists to
refuse. The replacement makes the same case as an invitation rather than a finding.

### `/learn/ranking-test`

```
PAGE-LEARN-RANKINGTEST-04
> Both numbers are read against {BY_CHANCE} points, which is what rating at random produces — and it produces the same figure on both kinds of pair, because chance does not know which works a critic separated. That is the whole reference point. Two figures sitting together near it show no discrimination in this sitting; two that differ show some, on these clips.
```
*Why:* the draft scopes only its second half — *"has, in this sitting, on these clips"* — while the
first half says flatly that a reader *"has not discriminated"*. The unscoped clause is the one that
reads as a verdict, and it is the one about the reader who did worse. Both halves now carry the same
boundary, and the subject is the figures rather than the reader.

### `/spread`

```
PAGE-SPREAD-FRAME-02
> {numberWordLeading(WORKS)} pieces of music, {numberWord(CLIP_SECONDS)} seconds each. Rate what you hear, and nothing else. A published critic once ranked all of these against each other — some he placed far apart, some he bracketed together.
```
```
PAGE-SPREAD-FRAME-04
> About {SESSION_MINUTES} minutes of listening. Headphones help.
```
*Why:* the same defect, in the place this project has already been burned by it — a duration claim on
a channel surface. `/learn/ranking-test` slots `{numberWord(WORKS)}` two paragraphs of this same
instrument away. **Slot names invented — see the log.**

---

## 2. RULE

```
PAGE-LEARN-PRESTIGEBIASTEST-02
RULE: the deck's own rule against writing values in is stated for Part 3 and enforced nowhere in it.
```
Part 3's preamble says it plainly: *"Where a page imports its numbers from the modules that compute
them, that is deliberate and the slots must stay slots: typing the value in is how a page drifts away
from the instrument it describes."* Eleven quantities across five surfaces are typed in — the prestige
page's five, the practice page's two floors, `/spread`'s two, `/legal`'s date, and the ranking page's
"six recordings". The rule is written as though the drift risk were a writer resolving a slot. The
larger risk is the opposite one: a page that never had a slot to resolve.

This is the batch-1 finding in a new part, and the brief predicted it — *"Parts 2 to 4 are still keyed
to rendered sentences… the same collapse almost certainly exists there and has not been measured yet."*
It does. Suggest the exporter flag any bare numeral or number-word in Part 3 prose that matches a value
a module exports, the way the launch-kit claims test already does for channel copy.

```
PAGE-LEARN-COMPARISON-10
RULE: no rule is broken, but one argument is written four times and only one of them can be the record.
```
*Rewarding agreement with a critic would contradict the Prestige Test* appears in
PAGE-LEARN-COMPARISON-10, PAGE-LEARN-METHODOLOGY-07, PAGE-LEARN-RANKINGTEST-03 and
PAGE-SPREAD-FRAME-03, in four different phrasings. Across four pages that is defensible — a reader
meets one of them. But four wordings of one refusal is four chances to drift, and this is a refusal the
product treats as constitutional. I have not merged them, because merging is a structural change and
this is a writing pass. Worth a ruling on which is canonical.

---

## 3. Left alone, and why it is worth saying

Fifty-seven ids unchanged, and not from caution. `/legal` is the strongest surface in the deck and I
changed one date on it: *"Be normal"*, *"anything else that matters that much"*, and *"never a computed
score, so nothing here can be edited into a better result"* are all doing more work than a rewrite
would. In the reading room, *"the acclaim has already voted"*, *"prejudice doesn't announce itself to
the person having it"*, *"a claim of fine taste that can never be checked is just a claim"*, *"practice
that rehearses a bias into a habit"*, *"an improvement you can't measure is an improvement you can't
claim"* and *"not a badge or a streak, but a number that gets harder to argue with"* are better than
anything I would put in their place.

The eleven quantities are the batch's real defect, and they are a build problem wearing a copy problem's
clothes.

---

## 4. The log — every time I reached for source and stopped

Nine entries. **Registered prediction: the log would be dominated by adjacency and hold almost nothing
about slots. That is falsified.** Seven of nine are slot questions; none is adjacency.

| # | Id | What I wanted from source | Class | Did it change a sentence? |
|---|---|---|---|---|
| 1 | PRESTIGEBIASTEST-02/03/04 | The constant names for clip count, control count, swapped count, session length | slot | Yes — I invented four names |
| 2 | PRACTICE-04 | The constant names for the pitch solo floor and the bias floor | slot | Yes — invented two |
| 3 | SPREAD-FRAME-02/04 | The constant names for work count, clip seconds, session minutes | slot | Yes — invented three |
| 4 | LEGAL-01 | Whether a last-updated value exists to slot | slot | Yes — invented one |
| 5 | LEARN-FLAWS-01 | What `{f.plainUnit}` and `{machineLinks(f.machines)}` render as | slot | No — left the id unchanged |
| 6 | LEARN-DELICACY-04 | Which branch `{DELICACY_LIVE ? …}` currently takes | slot | No — rewrote around both |
| 7 | FREEDOMFROMPREJUDICE-06 | Which of the five criteria have instruments today | product fact | Yes — flagged, conditional |
| 8 | METHODOLOGY-08 vs LEGAL-08 | Whether the analytics vector carries a computed score | product fact | Yes — removed the phrase, flagged |
| 9 | COMPARISON-04 | Which block is the "1 further block filled from content modules", to avoid duplicating it | coverage | No |

**What the falsification means.** Adjacency did not surface because Part 3 is long-form prose:
paragraphs are self-contained, and the two cross-surface problems I did find — the four-fold agreement
argument, and the methodology/legal contradiction — were both findable from the deck alone. Adjacency
mattered in the reading layer because short lines stack inside one block; it matters much less here.

So the fix was built where it was needed. What Part 3 needs instead is the thing Part 1 got: templates
read from source, with real slots. Entries 1–4 and 6 would all have been answered by that and by
nothing else.

**Two entries the brief could close cheaply.** 5 and 9 are both *what is behind this abbreviation* —
`{f.plainUnit}` and *"1 further block"*. Naming the ids those blocks resolve to, rather than counting
them, would cost the exporter a line.

**Entry 8 is the one that would have changed a shipped page.** It is not a slot question and not an
adjacency question: it is two surfaces disagreeing about a fact, and the deck is the only artefact in
this project where both are visible at once. The deck found it. That is a point in the brief's favour
and the strongest one in this log.

---

## 5. Where the brief failed me

**1. The brief claims per-surface adjacency and non-text notes for every surface. It has them for Part 1
and none for Part 3.**

The commission now says: *"Each surface names what renders alongside its sentences, in order, and names
the non-text a reader sees that you cannot."* In the deck there are nine **What renders with it, in
order** blocks and all nine are in Part 1. Part 3's eleven surfaces have none. Non-text appears
nowhere: no surface names a chart, a table or a control, including the SVG calibration chart above
`VOC-EXPERT-PANEL-01` that you described last turn and that is still not in the deck.

This cost me little, for the reason in the log — but the brief now makes a global promise it keeps in
one part of four. Given that this brief's previous version was wrong in exactly this way, scoping the
claim is worth more than the claim: *Part 1 names what renders with each template; Parts 2–4 do not
yet.*

**2. Part 1's "What renders with it, in order" is very good, and it closed a question I raised in batch 1.**
The threshold block now answers the ambiguity I flagged and could not resolve — whether the "two
sentences" rule counted the flaw line — by saying which lines `creatorLines` emits, in order, and which
one drops on a wide band. That is the single most useful addition since batch 1, and it was cheap. It
is the argument for doing the same to Part 3.

**3. The protocol worked, and it cost the batch about one edit.**
Running closed produced a log I would not otherwise have kept, and the only substantive cost was
entry 5 — one id left unchanged that I could have improved in a minute with the repository open. Nine
questions across seventy-four sentences is a workable rate. The brief does stand alone for prose; it
does not yet stand alone for anything with a number in it.
