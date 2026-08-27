# `/method` copy deck — for a writing pass

**Generated, do not edit by hand.** `node scripts/export-method-deck.mjs > docs/copy-deck-method.md`

Every sentence rendered on `/method`, enumerated from the same ledger the page renders, so this file and the live page cannot disagree. Read the page itself at `/method` alongside this — the deck gives you numbered handles for edits, not a substitute for seeing it.

## How to use this

The engineer who wrote these is the weaker writer of the two on this project; that is why the file exists. **But this deck is not like the vocabulary one, and the difference matters.** Much of this page is quotation: a claim marked QUOTED contains a passage that a test opens the cited document to verify, word for word. Change those words and the build fails — correctly, because the page would then be putting words in the record's mouth.

So every block below separates the two. The **LOAD-BEARING** lines are quotations and are fixed. Everything around them is mine and is free — and it is usually the weaker half, because it is the half that had to carry a quotation into a sentence without sounding like a citation.

If a locked passage is what makes a sentence bad, say so. The fix is either to re-frame the prose around it or to drop the claim — never to silently reword the quotation.

**Two constraints apply everywhere.**

- **RT-159(a):** wherever the page reconstructs the owner's reasoning rather than quoting a ruling, it must say so. Blocks marked INFERRED render under a visible label. Moving prose between a QUOTED and an INFERRED block changes what the page claims about its own evidence.
- **N3:** no percentile, no cohort, no comparison between people. There are zero real respondents, so any such claim is about people who do not exist.

**Standing facts on the page were last checked 2026-08-27.**

---

## 1. The page's own framing prose

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

## 2. The operating model, in the ruled reader order

Three sections, in the order the direction document fixes: product manager, business analyst, data analyst. Each section's heading and lede are free prose with no ledger entry — same status as §1.

### Section: For a product manager

**Heading and lede (free prose):**

```
How a decision gets made, and stays made
The project runs on a written constitution and two review protocols. What is unusual is not that they exist. It is that they constrain the engineer more than the owner, and that they are enforced by tests rather than by good intentions.
```

### 1. `pm-is-not-an-engineer`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** CLAUDE.md

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “they are newer to engineering, so explain tradeoffs in plain language”

Everything else in the block is the engineer's own connective prose and is free.

```
The constitution opens by naming the owner's expertise as a constraint on how work is presented to them: they are newer to engineering, so explain tradeoffs in plain language and teach as you go. Every option put to them has to be legible without the jargon, or the ruling that comes back is a rubber stamp on a sentence nobody understood.
```

### 2. `asks-must-be-in-the-block`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** docs/redteam-protocol.md

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “any ask NOT in this block is deemed not asked”

Everything else in the block is the engineer's own connective prose and is free.

```
Every request for a decision goes in one fixed block at the end of a reply, and anything outside it does not count: any ask NOT in this block is deemed not asked.
```

### 3. `defaults-must-be-reversible`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** docs/redteam-protocol.md

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “Defaults must be reversible choices, never one-way doors”

Everything else in the block is the engineer's own connective prose and is free.

```
Each open question carries a default that applies if nobody answers, and the default is constrained rather than chosen: Defaults must be reversible choices, never one-way doors (pricing, data schema, deletions = no default, PM must answer). Silence can therefore only ever produce the undoable option.
```

### 4. `n2-complexity-is-a-cost`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** restructuring_decision_memo_2026-07-11.md

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “complexity is a cost, not a value”

Everything else in the block is the engineer's own connective prose and is free.

```
The guardrail this project runs on is not a preference for simplicity. It is written down as a cost: complexity is a cost, not a value — and either party may object by citing it.
```

### 5. `slice-protocol-rationale`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** docs/slice-protocol.md

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “Self-review honesty is inversely proportional to the amount of sunk work under review”

Everything else in the block is the engineer's own connective prose and is free.

```
Work is reviewed in the smallest increment that can be proved on its own, and the reason is written into the protocol: self-review honesty is inversely proportional to the amount of sunk work under review.
```

### 6. `protocols-defend-against-the-author`

**Kind:** INFERRED — renders under a visible “Inference — the engineer’s reading, not a recorded ruling” label

**Cites:** docs/slice-protocol.md · CLAUDE.md

**No locked passage in this block** — all of it is the engineer's own prose and is free.

```
Both protocols are aimed at the same weakness, and it is not incompetence — it is ownership. A reviewer goes soft on work they built, so the rules shrink what is under review and force the ask into a place it cannot be buried.
```

---

### Section: For a business analyst

**Heading and lede (free prose):**

```
How a written requirement stays true
Documentation drifting away from the system it describes is the normal condition of software, and it is usually filed under untidiness. Here it is a defect with a failing test attached — because a document describing a gate nobody performs sends the next reader to ask for a sign-off that cannot be given.
```

### 7. `stale-gate-is-a-false-statement`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** src/content/retired-gates.test.ts

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “written as a thing still to be done, is a false statement in the”

Everything else in the block is the engineer's own connective prose and is free.

```
Two documents once described a quality gate that had been abolished months earlier, as though it were still owed. The rule that came out of it is stated as a matter of truth rather than tidiness: a gate nobody performs any more, written as a thing still to be done, is a false statement in the repository.
```

### 8. `fix-the-class-not-the-instance`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** src/content/retired-gates.test.ts

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “Fixing the two sentences leaves the class open”

Everything else in the block is the engineer's own connective prose and is free.

```
The repair was not the two sentences. Fixing the two sentences leaves the class open, so the rule became a test that scans every document on every run, proved in both directions, because a guard that has only ever returned clean is not known to check anything.
```

### 9. `published-text-must-match-the-code`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** src/content/published-text.test.ts

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “change the pool without changing the sentence and this fails”

Everything else in the block is the engineer's own connective prose and is free.

```
The same rule now binds the files this site publishes about itself. They described an instrument of eight clips long after it had grown to sixteen, so the quantities are derived from the shipped item pool instead of being retyped: change the pool without changing the sentence and this fails, naming both numbers.
```

---

### Section: For a data analyst

**Heading and lede (free prose):**

```
How a number earns the right to be shown
There are no real respondents yet. That single fact governs every figure on this site, and the interesting part is what it forbids rather than what it permits.
```

### 10. `n3-honesty-rule`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** restructuring_decision_memo_2026-07-11.md

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “no score, percentile, or claim the data can't support”

Everything else in the block is the engineer's own connective prose and is free.

```
The honesty rule is stated as a constraint on output, not an aspiration: no score, percentile, or claim the data can't support.
```

### 11. `recovery-before-fielding`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** docs/artifact-pivot-2026-08-07.md

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “recover the known parameters”
- “I validated the estimator by parameter recovery before fielding it”

Everything else in the block is the engineer's own connective prose and is free.

```
Before an estimator is trusted with real answers it is run on simulated ones generated from a known model, and required to recover the known parameters. The claim that buys is deliberately modest: I validated the estimator by parameter recovery before fielding it.
```

### 12. `simulated-is-labelled`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** docs/artifact-pivot-2026-08-07.md

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “in-app, in charts, in the write-up, in the repo”

Everything else in the block is the engineer's own connective prose and is free.

```
Nothing simulated is allowed to pass as observed, anywhere it might be seen: in-app, in charts, in the write-up, in the repo. The badge is not small print. It is the reason the analytics pages are allowed to exist before a single person has taken a test.
```

### 13. `band-not-point`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** src/engine/delicacy.ts

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “report the band, never the point”

Everything else in the block is the engineer's own connective prose and is free.

```
Where a measurement is noisy the product must show the uncertainty rather than hide it behind a label: report the band, never the point, because a point estimate from a noisy measurement is a claim the measurement cannot support.
```

---

## 3. The four refusals

Each renders as a heading, a small-caps rule line, the refusal, and a paragraph opening “What it cost.” The heading and the rule line are free; a test requires only that the price is substantial and does not say the refusal was free.

### 14. `refusal-ranked-tiers`

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

### 15. `refusal-paid-tier`

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

### 16. `refusal-priced-consumer-product`

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

### 17. `refusal-human-ear-check`

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

## 4. The finding against the project itself

Two blocks. The first is the record's own account; the second is my reading of what happened next, and renders under the inference label. **The distinction between them is the single most consequential thing on this page** — if a rewrite blurs which is which, it breaks the condition the page was approved under.

### 18. `finding-launch-avoidance`

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

### 19. `finding-avoidance-then-ratified`

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

**19 numbered blocks.** Regenerate with `node scripts/export-method-deck.mjs > docs/copy-deck-method.md` after any ledger change.
