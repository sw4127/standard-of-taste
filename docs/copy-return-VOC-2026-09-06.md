# Copy return — BATCH 1, the reading layer (VOC-)

Returned by Cowork, 2026-09-06. Worked from `docs/copy-commission.md` and the snapshot of
`docs/copy-deck.md` dated 2026-09-06. Ids unchanged, nothing renumbered, no sentence merged or split.

**Read section 0 before applying any of this.** Several ids in the deck are the same string in the
code, and applying them one at a time will silently overwrite work.

---

## 0. Apply-time warning: ids in this deck are renderings, not sentences

Where two or more ids share one template, the rewrite is given once under each id and marked
`[SHARED — apply once]`. Applying them separately means the last one wins and the others are lost.

| Deck ids | One string in | What varies between them |
|---|---|---|
| VOC-THRESHOLD-RESULT-01 / -02 / -03 | `whatGetsPast`, two-sided branch | the unit only |
| VOC-THRESHOLD-RESULT-07 / -08 / -09 | `whatGetsPast`, missed-only branch | the unit only |
| VOC-THRESHOLD-RESULT-10 / -11 / -12 | `whatGetsPast`, heard-only branch | the unit only |
| VOC-RANKING-TEST-01 / -02 | `figuresLine` | the pair count word |
| VOC-RANKING-TEST-05 / -06 | `spreadRefusal`, general branch | far/close, and the counts |
| VOC-RANKING-TEST-07 / -08 | `recognitionLine`, partial branch | one/two, and singular/plural |
| VOC-RANKING-TEST-12 / -13 | `directionLine` | the `shape` clause |
| VOC-RETEST-ARC-01 / -02 / -03 | `thresholdLines`, in-range branch | the `way` clause and the values |
| VOC-COMBINED-VIEW-05 / -06 / -07 | `coverageLine`, unmeasured branch | the family list |
| VOC-COMBINED-VIEW-08 … -13 | `dossierLine` | which question fragments are in the list |
| VOC-COMBINED-VIEW-03 / -04 | `replicationLine`, agreed branch | the cross-material clause |

Separately, **`RECOGNITION_DISCLOSURE` is one exported constant** rendered as the tail of
VOC-RANKING-TEST-03, -07, -08 and -11. It is rewritten once below, under its own heading.

---

## 1. The rewrites

### Threshold result

```
VOC-THRESHOLD-RESULT-01   [SHARED with -02, -03 — apply once]
> Damage gentler than {quantity(heardAt, unit)} slipped past you on these clips. That is the margin a render can wander inside while still sounding clean to you.
```
```
VOC-THRESHOLD-RESULT-02   [SHARED — same string as -01]
> Damage gentler than {quantity(heardAt, unit)} slipped past you on these clips. That is the margin a render can wander inside while still sounding clean to you.
```
```
VOC-THRESHOLD-RESULT-03   [SHARED — same string as -01]
> Damage gentler than {quantity(heardAt, unit)} slipped past you on these clips. That is the margin a render can wander inside while still sounding clean to you.
```
*Why:* "the range" had no antecedent — the sentence before it names a threshold, not a range. "Margin"
is the thing that was actually measured, and ending on "sounding clean to you" puts the reader back in
their own work, which is this layer's job. Kept at two sentences and kept the `gentler than` construction,
which is what stops the kbps ladder inverting.

```
VOC-THRESHOLD-RESULT-04
> In a render this is the lead that turns faintly sour over a long note — a vocal, a bowed string, a synth lead — where the slide is slow enough to read as a bad performance rather than bad audio.
```
*Why:* the draft's "reads as bad singing" only holds for the vocal case, and it lists three instruments.
"A bad performance" covers all three and keeps the point, which is the good one in the sentence.
**-05 and -06 are left alone; they are the best-written lines in the batch.**

```
VOC-THRESHOLD-RESULT-07   [SHARED with -08, -09 — apply once]
> This session never found a level of damage you catch reliably, so it cannot say what would slip past you — only that {quantity(missedAt, unit)} already did.
```
```
VOC-THRESHOLD-RESULT-08   [SHARED — same string as -07]
> This session never found a level of damage you catch reliably, so it cannot say what would slip past you — only that {quantity(missedAt, unit)} already did.
```
```
VOC-THRESHOLD-RESULT-09   [SHARED — same string as -07]
> This session never found a level of damage you catch reliably, so it cannot say what would slip past you — only that {quantity(missedAt, unit)} already did.
```
*Why:* "never settled on damage you catch" is doing two jobs badly. "Already did" closes the loop on
"slip past you" so the trailing clause has something to attach to. Still one sentence.

```
VOC-THRESHOLD-RESULT-10   [SHARED with -11, -12 — apply once]
> This session pinned {quantity(heardAt, unit)} as damage you catch, but never found the level where you stop catching it — so what gets past you is gentler than that, by some amount these clips never established.
```
```
VOC-THRESHOLD-RESULT-11   [SHARED — same string as -10]
> This session pinned {quantity(heardAt, unit)} as damage you catch, but never found the level where you stop catching it — so what gets past you is gentler than that, by some amount these clips never established.
```
```
VOC-THRESHOLD-RESULT-12   [SHARED — same string as -10]
> This session pinned {quantity(heardAt, unit)} as damage you catch, but never found the level where you stop catching it — so what gets past you is gentler than that, by some amount these clips never established.
```
*Why:* "the level where you stop" left the verb hanging — stop what. "By an amount these clips did not
settle" reads as though an amount were the thing being settled. One sentence, as before.

### Delicacy result

```
VOC-DELICACY-RESULT-01
> Naming is the half that transfers. Hearing that a render is wrong sends you back to generate again and hope; hearing which of the three it is sends you to a control that fixes it. You named it {flawCorrect} of the {flawEligible} times you were asked.
```
*Why:* "Hearing… / knowing…" broke a parallel that "Hearing… / hearing…" completes, and the contrast is
the whole point of the sentence. "A control that fixes it" is the concrete half of the promise. Dropped
the shouting capitals on WHICH — the parallel now carries the emphasis without them.

```
VOC-DELICACY-RESULT-03
> The naming question only comes after a pair you called correctly, and this session never reached one — so it says nothing about whether you can name a flaw, only about whether you spotted one.
```
*Why:* "never got far enough into a pair" hides the mechanism, and a reader who has just been told
nothing about naming will want to know why. Stating the gate plainly is less awkward than talking around
it, and it stays a statement about the session. Still one sentence, per the rule.
**-02 is left alone. "Luck wearing a label" is the best phrase in the batch.**

### Prestige result

```
VOC-PRESTIGE-RESULT-02
> That result is about these names, on this afternoon. The cues above are the ones this test could not put in front of you, so nothing here has measured what they do to your judgment.
```
*Why:* this renders directly beneath -01, and both listed the same two examples — the hour in the prompt,
the take you already shared. The reader met them one sentence ago. Pointing back at them is shorter and
keeps the boundary exactly where the rule puts it.

```
VOC-PRESTIGE-RESULT-04
> Your ratings ran against the names rather than with them, which is still the name doing the steering — only in reverse. The remedy does not change: decide before the label arrives, not after it.
```
*Why:* "the other way… either way" collided in consecutive clauses. "Still the name doing the steering"
also matches the arc copy's "still the name deciding, not your ears", so the product says one thing in one
voice. Not congratulated.
**-01 and -03 are left alone.**

### The Ranking Test

```
RECOGNITION_DISCLOSURE   [one constant — tail of VOC-RANKING-TEST-03, -07, -08, -11]
> You said which of these you had heard before, and that was taken at face value — nothing here verifies it. Recognition only ever removes clips; what you recognised is never part of a result.
```
*Why:* "we took your word for it" is the only first-person plural anywhere in the reading layer, which
otherwise speaks as "this session", "this test", "this ladder". The instrument should not acquire a staff
in one sentence. "Nothing here verifies it" also frees up "nothing here checks" — see -04 below, which
was repeating it on the same screen.

```
VOC-RANKING-TEST-03
> You had heard every clip here before, so all {numberWord(n)} were set aside. [+ RECOGNITION_DISCLOSURE]
```
*Why:* front-loads the reader's action rather than the clips'. **`{numberWord(n)}` is a real slot the deck
renders as the literal word "six" — see section 3.**

```
VOC-RANKING-TEST-04
> Neither number says you agreed with him, and neither could: this looks only at how far apart your two ratings fell, never at which one you placed higher. Preferring the work he ranked lower costs you nothing, because agreement was never imported and cannot be worked out. Small numbers are not a poor result either — {numberWord(POOL_SIZE)} recordings of {numberWord(POOL_SIZE)} different works are not spaced out by quality, and if they genuinely sounded close, rating them close was the accurate thing to do.
```
*Why:* "because nothing here is checking" was the third appearance of that phrase on one screen — the
disclosure says it, and this said it twice more. Replacing it with *agreement was never imported and
cannot be worked out* states the actual reason and matches the expert panel's line on the same fact.
**The two hardcoded "six"es are a rule violation, not a style choice — see RULE below.**

```
VOC-RANKING-TEST-05   [SHARED with -06 — apply once]
> No number this time. Setting aside the {numberWord(set)} you had heard before left {numberWord(left)} clips, and that makes only {numberWord(count)} usable {spacing} pair where this needs {need}. Under that count, one clip's wobble is larger than the thing being measured. Come back to it when fewer of them are familiar.
```
```
VOC-RANKING-TEST-06   [SHARED — same string as -05]
> No number this time. Setting aside the {numberWord(set)} you had heard before left {numberWord(left)} clips, and that makes only {numberWord(count)} usable {spacing} pair where this needs {need}. Under that count, one clip's wobble is larger than the thing being measured. Come back to it when fewer of them are familiar.
```
*Why:* "one clip's wobble moves the answer further than the answer moves" is a good idea tangled in a
repeated noun. "Larger than the thing being measured" is the same claim, readable once. See RULE below on
the closing invitation, which I have kept but do not think survives scrutiny.

```
VOC-RANKING-TEST-09
> You gave every one of these the same rating, so there are no gaps to compare and nothing here to work on. That is an answer, not a failure to produce one.
```
*Why:* the draft's second half — *if the six genuinely sounded alike to you, saying so was the accurate
thing to do* — is already in `SPREAD_BOUNDARY`, which renders on this same screen every time. The reader
was getting the argument twice in three sentences. Cutting it here leaves the boundary line to carry it and
gives this refusal a hard ending instead of a soft one.

```
VOC-RANKING-TEST-12   [SHARED with -13 — apply once]
> {shape}. Whether that means anything is a question this cannot answer: {numberWord(far.count)} pairs against {numberWord(close.count)}, drawn from a set of clips that each appear in several pairs, and nobody has sat this twice to find out how far these numbers wander on their own. There is no honest size at which the gap between them becomes a result, so none is offered.
```
```
VOC-RANKING-TEST-13   [SHARED — same string as -12]
> {shape}. Whether that means anything is a question this cannot answer: {numberWord(far.count)} pairs against {numberWord(close.count)}, drawn from a set of clips that each appear in several pairs, and nobody has sat this twice to find out how far these numbers wander on their own. There is no honest size at which the gap between them becomes a result, so none is offered.
```
*Why:* "clips that each appear in several of them" pointed back at "pairs" across an intervening noun.
Naming the pairs again costs one word and removes the stumble. **`{shape}` is a real slot with three
values, one of which the deck never shows — see section 3.**
**-01, -02, -07, -08, -10, -11 are left alone.**

### The retest arc

```
VOC-RETEST-ARC-04
> Across your {label} sittings, {way}. One sitting ran past the end of what this ladder can render, so the direction holds but the size does not — all that can be said is that the move cleared {floor}, the smallest change this machine can tell from noise.
```
*Why:* "it is at least 3.5x, which is the smallest move this machine can distinguish from noise" reads as
though the finding were the floor itself. "The move cleared {floor}" says the same thing as an event rather
than a quantity, which is what actually happened. Keeps the multiple, states no endpoint.

```
VOC-RETEST-ARC-06
> One sitting cannot say whether your ear moved — there is nothing to compare it against. A second one in this browser is what makes that sentence possible at all.
```
*Why:* two words. "Session" is the arc's own term for the thing it will not compare, and every other line
in this surface says "sittings"; and the rule requires this layer to say where the memory lives, which
"this machine" does not — a phone and a laptop are one machine to nobody. `ARC_DEVICE_NOTE` already says
"browser"; this now agrees with it.

```
VOC-RETEST-ARC-13
> Your {label} sittings are {moved} apart, which this ladder cannot tell from its own noise. It would take about {floor} before a change here meant anything. That is not a report that you stood still — it is the instrument saying a move this small is beneath what it can see.
```
*Why:* "inside what this ladder cannot tell from noise" inverts twice in six words. The last clause is the
one the rule cares about most — the refusal must land as a fact about the instrument — so it now ends on
the instrument's limit rather than on the reader's stillness.
**-01, -02, -03, -05, -07, -08, -09, -10, -11, -12 are left alone. -05 and -11 are as good as anything here.**

### Combined view

No changes. This surface is the strongest in the batch: "real and not an afternoon", "they do not add up
— each is measured in its own terms", and the four question fragments are all doing their job. One defect
that is not a copy problem is noted in section 3.

### The expert panel

```
VOC-EXPERT-PANEL-04
> Every number behind the result, and the answer key. No verdict, no interpretation — and it is read from this browser, so a link you share carries none of it.
```
*Why:* "the answers" is what a reader supplies; "the answer key" is what this panel shows, and the section
description says so. "Carries none of it" states the consequence from the shared link's side, which is
where the reader's mistaken assumption actually sits.

```
VOC-EXPERT-PANEL-06
> The distance column is the whole of what was taken from the critic's list. Which of two works he placed higher was never read in, so no table here can be sorted into his order and no agreement figure can be recovered from it — not by this page, not by you, not later.
```
*Why:* the triple at the end is the best thing in the sentence and "by us, or by you, or later" was not
parallel. "Not by this page" also removes the second and last "us" in the reading layer.

```
VOC-EXPERT-PANEL-07
> The pairs below are your ratings as they fell; the averages are missing because too few pairs survived for either one to mean anything. Nothing has been hidden — the figure was never worked out.
```
*Why:* "what you did" is vaguer than the panel it introduces. Dropped "from you" as redundant after
"hidden". The closing clause is untouched; it is the whole reason the sentence exists.
**-01, -02, -03, -05, -08, -09, -10, -11 and all 69 labels are left alone. "In the order you met them" is very good.**

---

## 2. RULE — constraints I did not break, and think are wrong

```
VOC-RANKING-TEST-04
RULE: this sentence breaks the section's own "Nothing may count" rule, and it is the only place in
the batch that does.
```
The rule reads *"Nothing may count. Every number in a sentence is derived from the result, never written
in."* `SPREAD_BOUNDARY` writes in **six**, twice — "six recordings of six different works". It is a literal
in `spread.ts`, not a slot.

That is not pedantry, because VOC-RANKING-TEST-10 promises the opposite on an adjacent screen: *"it needs
more music than this pool currently holds. Come back if it grows."* The moment the pool grows, one refusal
invites the reader back for a larger pool while the boundary line still tells them there are six. I have
written the rewrite with `{numberWord(POOL_SIZE)}` in both positions on the assumption that a constant
exists or can; if it genuinely cannot be derived, the honest fix is to cut the count rather than freeze it —
*"recordings of six different works"* can become *"these are recordings of different works, not a graded
set"* and lose nothing.

```
VOC-RANKING-TEST-05
RULE: "every refusal names what was set aside and invites the reader back" produces an invitation the
reader cannot act on, and the batch already contradicts it once.
```
The closing line — mine included, because I kept the rule — is *"Come back to it when fewer of them are
familiar."* A reader cannot un-hear music. The only way to satisfy the invitation is to wait for a bigger
pool, which is exactly what VOC-RANKING-TEST-10 says plainly and refuses to dress up: *"There is no second
attempt that would fix that."*

So the rule is already applied inconsistently, and the inconsistent half is the honest one. My suggestion
is to narrow the rule to *names what was set aside, and says whether a second attempt would change
anything* — which lets -10 keep its flat refusal, and lets -05/-06 end on something true, e.g. *"Nothing
you do differently changes that; the pool would have to grow."* I have not written that in, because it
weakens a refusal the rule currently asks to be encouraging, and that is your call and not mine.

```
VOC-THRESHOLD-RESULT-01
RULE: "Two sentences; ONE on a wide band" cannot be checked from the deck, and I may have kept it by
accident.
```
The layer emits the flaw line and the consequence line. Read one way, that is the two sentences, and each
must be a single sentence — in which case the shipped draft of -01/-02/-03 already breaks the rule, because
it is two. Read the other way, the rule counts emitted strings and the internal punctuation is free. I
preserved each sentence's existing count exactly so that whichever reading is right, nothing changed. If
the first reading is the intended one, -01/-02/-03 need cutting to one sentence and I would rather do that
knowingly than have it noticed later.

---

## 3. Where the brief failed me

The brief says everything needed is in it. That is not true, and the gaps are not small ones — four of the
five below are invisible from the deck and obvious from the source.

**1. The braces in the deck are not the product's slots. They are a diff artifact, and rule 2 of the
commission is unfollowable as written.**

`arc.ts` renders:
`Across your ${label} sittings, ${way} — a change of about ${moved}. This ladder cannot distinguish anything under ${floor} from…`

The deck renders that as VOC-RETEST-ARC-01:
`Across your pitch drift sittings, it now takes a larger flaw to reach you than it did — a change of about 11x. This ladder cannot distinguish anything under {n}.5x from…`

Four slots. **One is braced, and wrongly** — `${floor}` is the whole of `3.5x`, but the deck splits the
decimal and marks only the integer, so `{n}.5x` implies a `.5` that is fixed and is not. The other three
are printed as literals: the family name, an entire alternating clause, and a multiple. A writer obeying
"keep every brace intact, never resolve one" would have shipped "pitch drift" and "11x" into a template
that renders for three families and any multiple.

The exporter appears to brace whatever differs between fixture renderings, which means **a slot with only
one fixture is indistinguishable from a literal.** Suggested fix: brace from the template's own `${…}`
positions at export time, not by diffing outputs.

**2. "69 sentences" is not true, and it changes the shape of the commission.**

The 69 ids are reachable renderings. They collapse onto roughly forty distinct strings — the table in
section 0 lists eleven collapses covering twenty-four ids. This matters twice: it makes "one id, one
sentence back" impossible to honour for those ids, and it means a pass that returns different prose for
VOC-THRESHOLD-RESULT-01 and -02 cannot be applied at all. I would put the count of *strings* in the batch
table alongside the count of renderings.

**3. Live sentences are missing from the deck.** The ledger says E18/S12 existed to stop exactly this, so
these are worth chasing:

- `whatGetsPast`, wide-band branch — *"The range this session bracketed covers most of what the ladder can ask, so it does not pin down where that starts for you."* The threshold section's rules discuss the wide-band case at length; the sentence itself is not in the deck.
- `ARC_DEVICE_NOTE` — *"Read from this browser only — there are no accounts and nothing on a server…"* The arc's rules require a sentence saying where the memory lives. It exists, and is not enumerated.
- `ARC_REFUSAL["no-scoreable-trials"]` — *"One of these two sittings has no answers that can be scored…"*
- `replicationLine`, both disagreement branches. The `agree === 0` one is a strong sentence — *"One of the two sittings is not describing your ear — which is worth more than a number that was never tested twice"* — and no writer has seen it.
- `directionLine`'s third `shape`: *"Your ratings moved the same amount either way."*
- `pooledLine`'s fallback clause: *" That is what pulls the line above down:"*
- `thresholdRoster`'s other branch: *"{label}: not pinned down this session"*
- `FLAW_IN_YOUR_WORK` — three strings in `delicacy.ts` ("leads and vocals going quietly sour", and two more) that appear in no deck at all.

**4. Three ids carry more than one sentence**, which contradicts "one id, one sentence back":
VOC-COMBINED-VIEW-02 holds the coverage line plus two roster lines; VOC-EXPERT-PANEL-02 and -05 hold two
and three headers respectively. They need splitting, or the rule needs an exception written into it.

**5. Things I had to guess, and one I refused to.**

- **VOC-EXPERT-PANEL-01 says "the distance from the line above" and I cannot tell what that line is.** The section's "what the screen has already said" does not name it. I left the id unchanged rather than rewrite around a referent I would be inventing — it is the one sentence in the batch I think is broken and did not touch.
- **What co-renders.** The brief gives "what the screen has already said", which is upstream context, but not what appears *in the same block*. Three of my edits — PRESTIGE-02, RANKING-04, RANKING-09 — exist only because I read the assembly functions and found sentences repeating each other on one screen. A writer with only the deck would not have caught any of them. A "renders alongside" line per surface would fix this and is the single highest-value addition to the brief.
- **VOC-COMBINED-VIEW-01 renders "Compression damage: caught at 160 kbps on pb1".** If `pb1` is what a reader sees, that is a raw clip id on a result screen and a defect — but it is a data question, not a copy one, so I have not guessed at a replacement.
- **The Delicacy naming line says "which of the three it is".** I assumed the screen has already named the three flaw families. If it has not, the phrase is a dangling reference and should be "which of the three flaws".

**6. A note on the framing.** The brief opens by saying the writer has no repository access. This pass did
have it, and every finding in this section except the last came from reading source rather than the deck.
If future commissions are meant to be answerable from the brief alone, then defects 1–4 have to be fixed in
the exporter first, because they are undetectable from the deck. If they are not, the brief should say so
and point at the files — which would be cheaper, and would have made this pass faster.
