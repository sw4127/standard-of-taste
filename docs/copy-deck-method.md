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

**What renders that this deck cannot show you.** The second paragraph italicises one word, and the closing line carries two links. Both are found by searching the sentence for the word or the label, so they are part of the string rather than markup around it: the emphasised word is “refused” and the link labels are “reading room” and “the Lab”. Rewriting a sentence without them renders a paragraph with no italic and a closing line with no links, and no test can tell that from an intended change.

**Kicker, top of page:**

> THE HOUSE RULES · HOW THIS IS RUN

**Headline:**

> What this project refused, and what each refusal cost.

**Two opening paragraphs:**

> The instruments on this site are the visible part. The part worth reading about is the operating model that produced them — a written constitution, two review protocols, and a decision record that has repeatedly deleted finished work for being untrue rather than for being broken.

> Any project can list what it built. This page lists what it refused, because a refusal is the only decision with a verifiable cost attached, and because a page of things that went well is a brochure. Each block below names the document it comes from. Those documents are in the repository, and a test opens every one of them on every run to check the quoted passage is still there — if a source is reworded, this page fails the build instead of quietly becoming false.

**Closing line.** The date is a slot -- it is a standing fact with its own constant, and resolving it here is what made this line untraceable to source:

> Standing facts on this page last checked ${asOf}. The instruments themselves are in the reading room; the measurements behind them are in the Lab, including a page listing what the instruments cannot do.

  *As rendered:* “Standing facts on this page last checked 2026-08-27. The instruments themselves are in the reading room; the measurements behind them are in the Lab, including a page listing what the instruments cannot do.”

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

- “explain tradeoffs in plain language and teach as you go”

Everything else in the block is the engineer's own connective prose and is free.

```
The constitution constrains how the engineer must write, not what the owner must know: explain tradeoffs in plain language and teach as you go. Every option put to them has to be legible without the jargon, or the ruling that comes back is a rubber stamp on a sentence nobody understood — so the rule is enforced against the writer, and a decision taken on an unread sentence is the failure it exists to prevent.
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

## 3. The seven refusals

Each renders as a heading, a small-caps rule line, the refusal, and a paragraph opening “What it cost.” The heading and the rule line are free; a test requires only that the price is substantial and does not say the refusal was free.

### 14. `refusal-preference-instrument`

**Kind:** INFERRED — renders under a visible “Inference — the engineer’s reading, not a recorded ruling” label

**Cites:** docs/rt-answers-2026-09-13.md · src/engine/preference.ts

**Heading on screen (free prose):** A fifth instrument, to turn preference into words

**Rule line on screen (free prose):** Refused under N3, and the arithmetic the proposal produced about itself

**Second paragraph opens:** “What it cost. …”

**No locked passage in this block** — all of it is the engineer's own prose and is free.

*The `refusal` field, free prose with no verified passage in it:*

> The ${numberWord(LIVE_INSTRUMENTS)} instruments here each have a right answer — damage you can or cannot hear, a label's pull, a critic's gaps. None of them touches the thing listeners actually report, which is that they cannot say what they like. Another was specified for exactly that: you say what you prefer, then choose blind between two versions of the same passage differing in one respect, and the product is the moment your words and your ears disagree. It was approved, sized, and killed by the first slice that did its arithmetic. A preference has no right answer, so the only measurable thing is whether blind choices agree with each other — and that takes ${numberWord(PREFERENCE_SITTING_TRIALS)} of them per dimension from a decisive listener. Three dimensions is ${numberWord(PREFERENCE_SITTING_PAIRS)} pairs; at ${numberWord(PREFERENCE_SECONDS_PER_PAIR)} seconds a pair, ${numberWord(PREFERENCE_SITTING_MINUTES)} minutes — longer than all four shipped instruments together. It had been sized against a figure a quarter that size, which engineering stated without deriving. Run against the numbers in its own specification, two of its four findings did not survive, the contradiction it existed to deliver among them. Nothing further is added to this product on easier terms than these: an instrument arrives with the arithmetic for its own sitting length, or it does not arrive.

  *As rendered:* “The four instruments here each have a right answer — damage you can or cannot hear, a label's pull, a critic's gaps. None of them touches the thing listeners actually report, which is that they cannot say what they like. Another was specified for exactly that: you say what you prefer, then choose blind between two versions of the same passage differing in one respect, and the product is the moment your words and your ears disagree. It was approved, sized, and killed by the first slice that did its arithmetic. A preference has no right answer, so the only measurable thing is whether blind choices agree with each other — and that takes twenty-eight of them per dimension from a decisive listener. Three dimensions is eighty-four pairs; at sixty seconds a pair, eighty-four minutes — longer than all four shipped instruments together. It had been sized against a figure a quarter that size, which engineering stated without deriving. Run against the numbers in its own specification, two of its four findings did not survive, the contradiction it existed to deliver among them. Nothing further is added to this product on easier terms than these: an instrument arrives with the arithmetic for its own sitting length, or it does not arrive.”

*The `price` field, free prose with no verified passage in it:*

> The largest one on this page, and it is unpaid rather than accepted. Two findings came out of listening to people: that past listening predicts less than present and forming taste, and that almost nobody can describe their own taste in words. This product serves the first and does nothing at all for the second, which is the one with somebody in front of it. The refusal does not say that instrument was a bad idea — it says this design could not be built at a length anyone would sit, and no better design has been found. Somebody else may well find one.

*The two together, which is how the page reads:*

```renders
The four instruments here each have a right answer — damage you can or cannot hear, a label's pull, a critic's gaps. None of them touches the thing listeners actually report, which is that they cannot say what they like. Another was specified for exactly that: you say what you prefer, then choose blind between two versions of the same passage differing in one respect, and the product is the moment your words and your ears disagree. It was approved, sized, and killed by the first slice that did its arithmetic. A preference has no right answer, so the only measurable thing is whether blind choices agree with each other — and that takes twenty-eight of them per dimension from a decisive listener. Three dimensions is eighty-four pairs; at sixty seconds a pair, eighty-four minutes — longer than all four shipped instruments together. It had been sized against a figure a quarter that size, which engineering stated without deriving. Run against the numbers in its own specification, two of its four findings did not survive, the contradiction it existed to deliver among them. Nothing further is added to this product on easier terms than these: an instrument arrives with the arithmetic for its own sitting length, or it does not arrive. The largest one on this page, and it is unpaid rather than accepted. Two findings came out of listening to people: that past listening predicts less than present and forming taste, and that almost nobody can describe their own taste in words. This product serves the first and does nothing at all for the second, which is the one with somebody in front of it. The refusal does not say that instrument was a bad idea — it says this design could not be built at a length anyone would sit, and no better design has been found. Somebody else may well find one.
```

### 15. `refusal-taste-gem`

**Kind:** INFERRED — renders under a visible “Inference — the engineer’s reading, not a recorded ruling” label

**Cites:** docs/handoff-2026-09-01.md · docs/handoff-2026-09-04b.md

**Heading on screen (free prose):** The Taste Gem — a five-faceted picture of your result

**Rule line on screen (free prose):** Refused under the anti-clone clause, and the writing pass that made it unnecessary

**Second paragraph opens:** “What it cost. …”

**No locked passage in this block** — all of it is the engineer's own prose and is free.

*The `refusal` field, free prose with no verified passage in it:*

> A visual was held back until the product's sentences had been through a writer, on the rule that if the sentences landed the picture was decoration. Three batches of them have now been written, applied and shipped, and every result screen ends in prose rather than in a unit. The picture would add no fact the sentences do not already carry. What it would add is five facets, most of them dark for most people — because a reader has usually taken one instrument, not ${numberWord(LIVE_INSTRUMENTS)} — and a shape with slots to fill in is a completion meter however carefully it is drawn. This product refuses those by name.

  *As rendered:* “A visual was held back until the product's sentences had been through a writer, on the rule that if the sentences landed the picture was decoration. Three batches of them have now been written, applied and shipped, and every result screen ends in prose rather than in a unit. The picture would add no fact the sentences do not already carry. What it would add is five facets, most of them dark for most people — because a reader has usually taken one instrument, not four — and a shape with slots to fill in is a completion meter however carefully it is drawn. This product refuses those by name.”

*The `price` field, free prose with no verified passage in it:*

> The one thing the product will never have is an image a person can post without reading a word. Every result here has to be read to be understood, which costs the share loop most of its reach and is the second time that trade has been made deliberately: the ranked verdict went the same way. What it buys is that nothing on a result screen can be understood as a score out of five.

*The two together, which is how the page reads:*

```renders
A visual was held back until the product's sentences had been through a writer, on the rule that if the sentences landed the picture was decoration. Three batches of them have now been written, applied and shipped, and every result screen ends in prose rather than in a unit. The picture would add no fact the sentences do not already carry. What it would add is five facets, most of them dark for most people — because a reader has usually taken one instrument, not four — and a shape with slots to fill in is a completion meter however carefully it is drawn. This product refuses those by name. The one thing the product will never have is an image a person can post without reading a word. Every result here has to be read to be understood, which costs the share loop most of its reach and is the second time that trade has been made deliberately: the ranked verdict went the same way. What it buys is that nothing on a result screen can be understood as a score out of five.
```

### 16. `refusal-composite-index`

**Kind:** INFERRED — renders under a visible “Inference — the engineer’s reading, not a recorded ruling” label

**Cites:** docs/artifact-pivot-2026-08-07.md · docs/handoff-2026-09-01.md · src/engine/delicacy.ts

**Heading on screen (free prose):** The Taste Index — one number standing for a person's taste

**Rule line on screen (free prose):** Refused under N3, and the ruling on ranked tiers that it would have repeated

**Second paragraph opens:** “What it cost. …”

**No locked passage in this block** — all of it is the engineer's own prose and is free.

*The `refusal` field, free prose with no verified passage in it:*

> The design that opened this phase ended at a single composite over five sub-scores. The five are a percentage of movement toward a label, a detection band, a threshold in cents, a count of distinguished works and a calibration score — five different units measuring five different things. Adding them requires deciding how much each is worth, and that weighting can only be argued from a population this product does not have: the cohort is zero. A number assembled from an unjustifiable weighting is not a summary of five measurements, it is a sixth claim resting on none of them. There is no Taste Index, and there will not be one.

*The `price` field, free prose with no verified passage in it:*

> The product gave up the one thing it could have put on a share card and in a headline — a single figure a person could compare, remember and repeat. What ships instead is five readings in their own units, each meaningless outside its own context, on five screens nobody has to visit in order. That is a worse product to market and the only honest one available, and it is the same trade the six ranked tiers lost: a sharper claim given up, rather than kept in the hope nobody checked.

*The two together, which is how the page reads:*

```renders
The design that opened this phase ended at a single composite over five sub-scores. The five are a percentage of movement toward a label, a detection band, a threshold in cents, a count of distinguished works and a calibration score — five different units measuring five different things. Adding them requires deciding how much each is worth, and that weighting can only be argued from a population this product does not have: the cohort is zero. A number assembled from an unjustifiable weighting is not a summary of five measurements, it is a sixth claim resting on none of them. There is no Taste Index, and there will not be one. The product gave up the one thing it could have put on a share card and in a headline — a single figure a person could compare, remember and repeat. What ships instead is five readings in their own units, each meaningless outside its own context, on five screens nobody has to visit in order. That is a worse product to market and the only honest one available, and it is the same trade the six ranked tiers lost: a sharper claim given up, rather than kept in the hope nobody checked.
```

### 17. `refusal-ranked-tiers`

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

*The `refusal` field, which carries the verified words “put a person in the right one at the shipping length: 30.5%” and “A tier name is a point estimate wearing an adjective”:*

> They shipped first, and then the measurement meant to justify them killed them. Asked how often the six tiers put a person in the right one at the shipping length: 30.5%. No coarser cut rescued it. A tier name is a point estimate wearing an adjective.

*The `price` field, which carries the verified words “~42–45 trials = 21 min, which is the session 15 was chosen to avoid”:*

> The result screen lost the one line a person could repeat to a friend and got an interval instead — wider, duller, and true. Earning a ranked verdict honestly would land on ~42–45 trials = 21 min, which is the session 15 was chosen to avoid. The product kept the shorter session and gave up the sharper claim, rather than keeping both and hoping nobody checked.

*The two together, which is how the page reads:*

```renders
They shipped first, and then the measurement meant to justify them killed them. Asked how often the six tiers put a person in the right one at the shipping length: 30.5%. No coarser cut rescued it. A tier name is a point estimate wearing an adjective. The result screen lost the one line a person could repeat to a friend and got an interval instead — wider, duller, and true. Earning a ranked verdict honestly would land on ~42–45 trials = 21 min, which is the session 15 was chosen to avoid. The product kept the shorter session and gave up the sharper claim, rather than keeping both and hoping nobody checked.
```

### 18. `refusal-paid-tier`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** CLAUDE.md · restructuring_decision_memo_2026-07-11.md · src/content/voice.test.ts

**Heading on screen (free prose):** The paid training arc — the entire business model

**Rule line on screen (free prose):** Refused under the D4 amendment

**Second paragraph opens:** “What it cost. …”

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “there is no paid tier, and no pricing question”
- “Monetization remains a goal but as proof of commercial viability, not income”

Everything else in the block is the engineer's own connective prose and is free.

*The `refusal` field, which carries the verified words “there is no paid tier, and no pricing question”:*

> The plan was to give the assessment away and charge for the training arc. It was withdrawn in one line — there is no paid tier, and no pricing question — because a paywall on the training loop would have put the honest deliverable, whether your ear actually moved, behind the wall.

*The `price` field, which carries the verified words “Monetization remains a goal but as proof of commercial viability, not income”:*

> The project gave up its only means of showing that anyone would pay for this, at a point where monetization remains a goal but as proof of commercial viability, not income. It also created upkeep nobody budgeted for: six weeks after the ruling, three published sentences still promised the tier — on two reading-room pages and in the file the product serves to AI crawlers. Writing a rule down does not enforce it.

*The two together, which is how the page reads:*

```renders
The plan was to give the assessment away and charge for the training arc. It was withdrawn in one line — there is no paid tier, and no pricing question — because a paywall on the training loop would have put the honest deliverable, whether your ear actually moved, behind the wall. The project gave up its only means of showing that anyone would pay for this, at a point where monetization remains a goal but as proof of commercial viability, not income. It also created upkeep nobody budgeted for: six weeks after the ruling, three published sentences still promised the tier — on two reading-room pages and in the file the product serves to AI crawlers. Writing a rule down does not enforce it.
```

### 19. `refusal-priced-consumer-product`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** restructuring_decision_memo_2026-07-11.md

**Heading on screen (free prose):** The $3.99 consumer product, and the funnel built to feed it

**Rule line on screen (free prose):** Refused under memo C1 — a conclusion of record rather than a rule

**Second paragraph opens:** “What it cost. …”

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “Viral consumer distribution for a $3.99 impulse product is dead”
- “The paid product itself was never tested (4 paywall views)”

Everything else in the block is the engineer's own connective prose and is free.

*The `refusal` field, which carries the verified words “Viral consumer distribution for a $3.99 impulse product is dead”:*

> Viral consumer distribution for a $3.99 impulse product is dead, concluded on twenty-nine visitors across a month, with the World Cup front door spreading to nobody at all.

*The `price` field, which carries the verified words “The paid product itself was never tested (4 paywall views)”:*

> A quiz, a share-card pipeline, a paywall and a Merchant-of-Record payment adapter all became legacy in a single decision. And here is the part that is easiest to leave off a page like this: the paid product itself was never tested (4 paywall views). The verdict was reached on distribution evidence, and the pricing question it looks like it answers was never actually asked.

*The two together, which is how the page reads:*

```renders
Viral consumer distribution for a $3.99 impulse product is dead, concluded on twenty-nine visitors across a month, with the World Cup front door spreading to nobody at all. A quiz, a share-card pipeline, a paywall and a Merchant-of-Record payment adapter all became legacy in a single decision. And here is the part that is easiest to leave off a page like this: the paid product itself was never tested (4 paywall views). The verdict was reached on distribution evidence, and the pricing question it looks like it answers was never actually asked.
```

### 20. `refusal-human-ear-check`

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

*The `refusal` field, which carries the verified words “The PM never judges a clip again” and “Ear-passes by a non-musician = unstable labels = no value”:*

> Quality control was a person listening to each clip and approving it. It was abolished — The PM never judges a clip again — on the owner's own finding: Ear-passes by a non-musician = unstable labels = no value. The gate was not adding quality. It was adding a delay only one person could clear.

*The `price` field, which carries the verified words “estimated from response data” and “Zero real responses”:*

> The replacement has two layers, and the one the pivot itself calls the real gate — item difficulty and discrimination estimated from response data — has never run, because there are Zero real responses. What gates clips today is the acoustic layer alone: loudness, spectral distance, silence, clipping. It can measure how large a manipulation is. It cannot notice that a clip is bad in a way nobody thought to model.

*The two together, which is how the page reads:*

```renders
Quality control was a person listening to each clip and approving it. It was abolished — The PM never judges a clip again — on the owner's own finding: Ear-passes by a non-musician = unstable labels = no value. The gate was not adding quality. It was adding a delay only one person could clear. The replacement has two layers, and the one the pivot itself calls the real gate — item difficulty and discrimination estimated from response data — has never run, because there are Zero real responses. What gates clips today is the acoustic layer alone: loudness, spectral distance, silence, clipping. It can measure how large a manipulation is. It cannot notice that a clip is bad in a way nobody thought to model.
```

---

## 4. The three reversals

Not a refusal. A constraint this project held and then deliberately relaxed. Three blocks rather than two: the reversal, what it bought, and what it cost — a relaxation with no stated gain is not a decision either, so both halves are required and a test refuses the shapes that mean nothing.

### 21. `reversal-d1-on-one-surface`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** CLAUDE.md · docs/rt-answers-2026-09-16.md

**Heading on screen (free prose):** Speaking about the person, on one surface only

**Rule line on screen (free prose):** Relaxed: D1 — the product describes what you did, never what you are

**Second paragraph opens:** “What it bought. …”

**Third paragraph opens:** “What it cost. …”

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “D1 is suspended for the prompt card, and for nothing else”

Everything else in the block is the engineer's own connective prose and is free.

*The `reversal` field, which carries the verified words “D1 is suspended for the prompt card, and for nothing else”:*

> Every reading on this site is a statement about a performance. That was a rule rather than a habit: it is written into the constitution as D1, and it is why a five-tap personality verdict with no measurement behind it was killed rather than improved. On 2026-09-16 the owner relaxed it, against the engineering recommendation on file. The card that turns a measured threshold into words a person can use may speak to the reader about themselves. The amendment's own wording was that D1 is suspended for the prompt card, and for nothing else; a second named surface followed a week later, recorded below. Every instrument readout on this site still says only what you did.

*The `bought` field, free prose with no verified passage in it:*

> The one thing here anybody would keep. The measurement ends in a threshold in cents, the number is evidence, and it had been standing in the position of the deliverable — which is why a technically sound instrument was neither enjoyable to use nor convincing to look at. A sentence that is only about a performance cannot be the thing somebody leaves with.

*The `price` field, free prose with no verified passage in it:*

> This project can no longer say that every sentence it shows is about performance. That was true, it was one of the plainest things the product could say about itself, and it is now false — the exception is real even though it is one surface wide. The constitution also gains an exception, which is complexity it did not have, and every surface built from here has to ask which side of it it falls on. The rule that survives is narrower and harder to hold: offer, do not assert.

*The two together, which is how the page reads:*

```renders
Every reading on this site is a statement about a performance. That was a rule rather than a habit: it is written into the constitution as D1, and it is why a five-tap personality verdict with no measurement behind it was killed rather than improved. On 2026-09-16 the owner relaxed it, against the engineering recommendation on file. The card that turns a measured threshold into words a person can use may speak to the reader about themselves. The amendment's own wording was that D1 is suspended for the prompt card, and for nothing else; a second named surface followed a week later, recorded below. Every instrument readout on this site still says only what you did. The one thing here anybody would keep. The measurement ends in a threshold in cents, the number is evidence, and it had been standing in the position of the deliverable — which is why a technically sound instrument was neither enjoyable to use nor convincing to look at. A sentence that is only about a performance cannot be the thing somebody leaves with. This project can no longer say that every sentence it shows is about performance. That was true, it was one of the plainest things the product could say about itself, and it is now false — the exception is real even though it is one surface wide. The constitution also gains an exception, which is complexity it did not have, and every surface built from here has to ask which side of it it falls on. The rule that survives is narrower and harder to hold: offer, do not assert.
```

### 22. `reversal-d1-second-surface`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** CLAUDE.md

**Heading on screen (free prose):** A second surface that speaks about the person: the snack

**Rule line on screen (free prose):** Relaxed: D1 — the product describes what you did, never what you are

**Second paragraph opens:** “What it bought. …”

**Third paragraph opens:** “What it cost. …”

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “It extends the 2026-09-16 suspension to”

Everything else in the block is the engineer's own connective prose and is free.

*The `reversal` field, which carries the verified words “It extends the 2026-09-16 suspension to”:*

> On the morning of 2026-09-23 the five-tap music snack was retired so that two sentences on this site would be true. The same day the owner restored it, on the argument that it was the part of the product carrying the product's own thesis — that taste carries cues about feeling, and that the gap between what a person's taste reveals and what they know about themselves is where insight lives. The constitution records the decision in one line: it extends the 2026-09-16 suspension to one more named surface. A reading built from that thesis later is not covered until it, too, is named.

*The `bought` field, free prose with no verified passage in it:*

> The part of the product people could enjoy, and the half of its thesis the instruments never reached. The instruments test whether a listener can hear; the snack is where the product speaks to what a listener might be going through — as a playful verdict that says at its own door there is no measurement behind it.

*The `price` field, free prose with no verified passage in it:*

> The pivot concluded the five-tap verdict dead, and the reversal above names it as the reason D1 exists. It is back, beside the instruments. The line between a reading about the person and a measurement of a performance is now held only by naming surfaces one at a time, and the card's own disclosure had to narrow from "on this site" to "in the gym". One line did not move: nothing on any surface asserts anything about trauma, abuse or mental health.

*The two together, which is how the page reads:*

```renders
On the morning of 2026-09-23 the five-tap music snack was retired so that two sentences on this site would be true. The same day the owner restored it, on the argument that it was the part of the product carrying the product's own thesis — that taste carries cues about feeling, and that the gap between what a person's taste reveals and what they know about themselves is where insight lives. The constitution records the decision in one line: it extends the 2026-09-16 suspension to one more named surface. A reading built from that thesis later is not covered until it, too, is named. The part of the product people could enjoy, and the half of its thesis the instruments never reached. The instruments test whether a listener can hear; the snack is where the product speaks to what a listener might be going through — as a playful verdict that says at its own door there is no measurement behind it. The pivot concluded the five-tap verdict dead, and the reversal above names it as the reason D1 exists. It is back, beside the instruments. The line between a reading about the person and a measurement of a performance is now held only by naming surfaces one at a time, and the card's own disclosure had to narrow from "on this site" to "in the gym". One line did not move: nothing on any surface asserts anything about trauma, abuse or mental health.
```

### 23. `reversal-snack-retired-reading-flagship`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** docs/rt-answers-2026-09-23-audit.md

**Heading on screen (free prose):** The snack retired again, and the reading made the product

**Rule line on screen (free prose):** Relaxed: D1 and D3 — the product describes what you did, and the Prestige Test was the flagship

**Second paragraph opens:** “What it bought. …”

**Third paragraph opens:** “What it cost. …”

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “No surface may assert a feeling”

Everything else in the block is the engineer's own connective prose and is free.

*The `reversal` field, which carries the verified words “No surface may assert a feeling”:*

> Hours after the snack came back, on 2026-09-23, the owner retired it for good and withdrew its exemption from D1. Its questions asked people to describe their own taste, which is the one thing the interviews behind this project found almost nobody can do, and its verdict was written by a language model. The same ruling moved the flagship: the Prestige Test is no longer the front door. A reading of a listener's recent plays is, and the four instruments become the hearing section behind it. The ruling adds the rule the reading is built under: no surface may assert a feeling. And nothing on any surface asserts anything about trauma, abuse or mental health.

*The `bought` field, free prose with no verified passage in it:*

> A front door that shows the idea the project was started for: a listener's recent taste read into lines that can be checked against the plays, argued with, and carried into a prompt. And no sentence on this site is generated by a model when a visitor arrives any more, so every one of them is a fixed template a test can read.

*The `price` field, free prose with no verified passage in it:*

> The snack was the one part of the product a person could enjoy without headphones, and it is gone. The reading that replaces it at the door runs on three illustrative listeners, so the first thing a visitor meets is simulated plays, labelled as such, where it used to be a measurement of the visitor. And the reversal above now records a decision that lasted less than a day.

*The two together, which is how the page reads:*

```renders
Hours after the snack came back, on 2026-09-23, the owner retired it for good and withdrew its exemption from D1. Its questions asked people to describe their own taste, which is the one thing the interviews behind this project found almost nobody can do, and its verdict was written by a language model. The same ruling moved the flagship: the Prestige Test is no longer the front door. A reading of a listener's recent plays is, and the four instruments become the hearing section behind it. The ruling adds the rule the reading is built under: no surface may assert a feeling. And nothing on any surface asserts anything about trauma, abuse or mental health. A front door that shows the idea the project was started for: a listener's recent taste read into lines that can be checked against the plays, argued with, and carried into a prompt. And no sentence on this site is generated by a model when a visitor arrives any more, so every one of them is a fixed template a test can read. The snack was the one part of the product a person could enjoy without headphones, and it is gone. The reading that replaces it at the door runs on three illustrative listeners, so the first thing a visitor meets is simulated plays, labelled as such, where it used to be a measurement of the visitor. And the reversal above now records a decision that lasted less than a day.
```

---

## 5. The finding against the project itself

Two blocks. The first is the record's own account; the second is my reading of what happened next, and renders under the inference label. **The distinction between them is the single most consequential thing on this page** — if a rewrite blurs which is which, it breaks the condition the page was approved under.

### 24. `finding-arc-mostly-refuses`

**Kind:** QUOTED — the page presents this as the record speaking

**Cites:** src/engine/arc.ts · docs/analytics/e14-arc-resolution.txt

**Date line on screen (free prose):** 2026-09-02 · broke N3 — nothing the data cannot support

**Second paragraph opens:** “Since then. …”

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “subtracting two noisy numbers manufactures”

Everything else in the block is the engineer's own connective prose and is free.

*The `finding` field, which carries the verified words “subtracting two noisy numbers manufactures”:*

> Before the retest arc was allowed to tell anyone their ear had moved, the size of change it can resolve was measured: the whole hazard here is that subtracting two noisy numbers manufactures progress. Simulating the same unchanged person through two sessions at the shipped length puts the floor on the pitch ladder at roughly ${(soloFloorFactor("pitch-drift") ?? 0).toFixed(1)} times — the threshold has to more than halve before the difference can be told from ordinary run-to-run wobble. On the prestige test it is ${numberWord(ARC_FLOORS.bias)} points of the scale. The delicacy trials cannot support an arc at all: ${numberWord(DELICACY_ARC_FLOOR.itemsToMove)} of their ${numberWord(DELICACY_ARC_FLOOR.trials)} pairs would have to change hands.

  *As rendered:* “Before the retest arc was allowed to tell anyone their ear had moved, the size of change it can resolve was measured: the whole hazard here is that subtracting two noisy numbers manufactures progress. Simulating the same unchanged person through two sessions at the shipped length puts the floor on the pitch ladder at roughly 3.5 times — the threshold has to more than halve before the difference can be told from ordinary run-to-run wobble. On the prestige test it is eight points of the scale. The delicacy trials cannot support an arc at all: six of their fifteen pairs would have to change hands.”

*The `consequence` field, free prose with no verified passage in it:*

> Most retests are therefore told, in as many words, that nothing changed the instrument could hear. That refusal is the ordinary output of this feature rather than its edge case, and the sentence names the floor in the reader's own units so it reads as a fact about the instrument rather than a verdict on them. The only thing that lowers the floor is returning: pooled across four sittings it falls to about two and a half times, which is the entire reward this product offers for coming back.

*The two together, which is how the page reads:*

```renders
Before the retest arc was allowed to tell anyone their ear had moved, the size of change it can resolve was measured: the whole hazard here is that subtracting two noisy numbers manufactures progress. Simulating the same unchanged person through two sessions at the shipped length puts the floor on the pitch ladder at roughly 3.5 times — the threshold has to more than halve before the difference can be told from ordinary run-to-run wobble. On the prestige test it is eight points of the scale. The delicacy trials cannot support an arc at all: six of their fifteen pairs would have to change hands. Most retests are therefore told, in as many words, that nothing changed the instrument could hear. That refusal is the ordinary output of this feature rather than its edge case, and the sentence names the floor in the reader's own units so it reads as a fact about the instrument rather than a verdict on them. The only thing that lowers the floor is returning: pooled across four sittings it falls to about two and a half times, which is the entire reward this product offers for coming back.
```

### 25. `finding-launch-avoidance`

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

*The `finding` field, which carries the verified words “Delicacy got built instead. That is the N2 launch-avoidance pattern, on the record” and “Nothing is blocked by engineering. Everything is blocked by the launch not having happened”:*

> A ruling had already been made: post the flagship instrument on its own, within one to two weeks, and do not let the second instrument gate it. The second instrument got built instead. The plan written that day says it without softening: Delicacy got built instead. That is the N2 launch-avoidance pattern, on the record. And directly above it, the diagnosis: Nothing is blocked by engineering. Everything is blocked by the launch not having happened.

*The `consequence` field, which carries the verified words “29 real visitors, ever” and “Zero real responses”:*

> As of the revision date at the foot of this page, it still has not been posted. The product has had 29 real visitors, ever. There are Zero real responses, which is why every psychometric figure in the Lab is generated from a known model and badged as simulated — the dataset that was named as the project's proprietary asset does not exist. Building is the part that feels like progress, and it is the part that was never the constraint.

*The two together, which is how the page reads:*

```renders
A ruling had already been made: post the flagship instrument on its own, within one to two weeks, and do not let the second instrument gate it. The second instrument got built instead. The plan written that day says it without softening: Delicacy got built instead. That is the N2 launch-avoidance pattern, on the record. And directly above it, the diagnosis: Nothing is blocked by engineering. Everything is blocked by the launch not having happened. As of the revision date at the foot of this page, it still has not been posted. The product has had 29 real visitors, ever. There are Zero real responses, which is why every psychometric figure in the Lab is generated from a known model and badged as simulated — the dataset that was named as the project's proprietary asset does not exist. Building is the part that feels like progress, and it is the part that was never the constraint.
```

### 26. `finding-avoidance-then-ratified`

**Kind:** INFERRED — renders under a visible “Inference — the engineer’s reading, not a recorded ruling” label

**Cites:** docs/artifact-pivot-2026-08-07.md · docs/endgame-plan-2026-08-07.md

**Date line on screen (free prose):** 2026-08-07 · broke N2 — the same guardrail, applied to the response rather than the act

**Second paragraph opens:** “Since then. …”

**LOAD-BEARING — these exact words are verified against the cited file and a test fails if they change:**

- “Resume value cannot be hostage to a launch the owner has no energy to run”
- “The 2026-09-15 deadline is not a live constraint”

Everything else in the block is the engineer's own connective prose and is free.

*The `finding` field, which carries the verified words “Resume value cannot be hostage to a launch the owner has no energy to run” and “The 2026-09-15 deadline is not a live constraint”:*

> What happened next is the part that is harder to read, and this reading is mine rather than a recorded ruling. Within the same week the project adopted a direction that made the avoided thing optional: Resume value cannot be hostage to a launch the owner has no energy to run, and after it, The 2026-09-15 deadline is not a live constraint. That argument is sound on its own terms. It is also, in sequence, a project noticing that it was avoiding something and then removing the requirement to do it.

*The `consequence` field, free prose with no verified passage in it:*

> I cannot tell from the record which of the two it was, and neither can a reader, so the page says so rather than choosing the flattering reading. The test that would settle it is not an argument: it is whether the instruments are ever put in front of strangers. Until they are, the honest description of this project is that it has built ${numberWord(LIVE_INSTRUMENTS)} working instruments and measured them against simulated respondents.

  *As rendered:* “I cannot tell from the record which of the two it was, and neither can a reader, so the page says so rather than choosing the flattering reading. The test that would settle it is not an argument: it is whether the instruments are ever put in front of strangers. Until they are, the honest description of this project is that it has built four working instruments and measured them against simulated respondents.”

*The two together, which is how the page reads:*

```renders
What happened next is the part that is harder to read, and this reading is mine rather than a recorded ruling. Within the same week the project adopted a direction that made the avoided thing optional: Resume value cannot be hostage to a launch the owner has no energy to run, and after it, The 2026-09-15 deadline is not a live constraint. That argument is sound on its own terms. It is also, in sequence, a project noticing that it was avoiding something and then removing the requirement to do it. I cannot tell from the record which of the two it was, and neither can a reader, so the page says so rather than choosing the flattering reading. The test that would settle it is not an argument: it is whether the instruments are ever put in front of strangers. Until they are, the honest description of this project is that it has built four working instruments and measured them against simulated respondents.
```

---

**26 numbered blocks.** Regenerate with `node scripts/export-method-deck.mjs > docs/copy-deck-method.md` after any ledger change.
