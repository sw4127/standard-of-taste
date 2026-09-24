# PRD — Part 2: the feature breakdown, scored against the goal and ranked three ways

**Status: part 2 of 4, revised against the blueprint on 2026-09-23.** Part 1 is
`docs/prd-1-use-cases.md` (the use cases, UC-1 to UC-15). Parts 3 and 4 are
`docs/prd-3-requirements.md` and `docs/prd-4-screens.md`. Brief: `docs/task-prd.md`.

**What this is for.** Two audiences. A reviewer at a larger company has ten minutes and wants to
know which features the product depends on and which are furniture. The owner wants a reusable
method: score features against the goal, so the next project can be scoped by the same reasoning
rather than by enthusiasm.

---

## What the features are scored against

The goal, verbatim from `docs/blueprint.md`:

> **BP-GOAL** · A prototype that is never distributed, in which a reviewer can, within minutes, try the core as its intended user and see why a real company would fund it and how it would test that, with every simulated user, metric and stakeholder labelled as illustrative.

It has three clauses. The first two are things a feature can do more or less of, so they are the
two axes. The third is pass or fail, so it is a gate, below the rankings.

| Axis | The clause it scores | 5 means | 1 means |
|---|---|---|---|
| **TRY** | "try the core as its intended user", within minutes | the reviewer cannot try the core without it | the core's own steps never lead to it |
| **FUND** | "see why a real company would fund it and how it would test that" | it is the business case or the test plan | it has no bearing on either |

**The levels between, so a score can be argued with rather than just disagreed with:**

- **TRY 4** — on the core's path from `/` to the creation screen; the core finishes without it, but
  weaker. **TRY 3** — visible on that path, not needed to finish it. **TRY 2** — linked from one of
  the core's own steps, for a reason that step names.
- **FUND 4** — BP-BUSINESS names it as how the reading creates value for the host: recent
  listening, a readable and arguable reading, a prompt for the host's own creation tools.
  **FUND 3** — it answers a risk a funder would raise: harm, legality, whether the reading is
  generic. **FUND 2** — a funder would read it only as evidence that the team is careful.

**Both columns are my judgment.** No reviewer has used this product and none will, because BP-GOAL
rules out distribution. The scores are written down so the reasoning can be argued with rather than
implied. **Disagree with a row and the ranking changes;** that is why there are three weightings
rather than one.

## The features

"Serves" names the use cases from part 1 that the feature exists for, or **none**.

| Feature | TRY | FUND | Serves | What it is |
|---|---|---|---|---|
| The reading's lines, with receipts | 5 | 4 | UC-1, UC-2 | Three or four lines computed from four weeks of plays. Each says what the plays show and opens onto the plays that produced it |
| Arguing with a line: two readings, neither, or reject | 5 | 4 | UC-3 | Each line offers two readings of what it might mean, as questions, plus "neither"; any line can be rejected. The reader supplies the feeling (BP-ARG-S1) |
| The prompt, recomposed from what was kept | 5 | 4 | UC-5 | A prompt built only from the lines that survived and the readings chosen. Rejecting a line always changes it |
| Three illustrative listeners | 5 | 2 | UC-14 | Fictional listeners with seeded plays, so a reviewer has something to read without connecting an account. Labelled on every card |
| Reading what is new, not what is old | 4 | 4 | UC-4 | Lines about the share of new tracks and the drift from week one to week four: what the listener is reaching for now (BP-CA1) |
| The mock creation screen | 4 | 4 | UC-5 | The prompt pasted into the fictional host's creation screen. Labelled; no audio is generated |
| The front door, three taps from the creation screen | 4 | 2 | UC-14, UC-15 | `/` leads with the three listener cards. Three taps from `/` to the creation screen at phone and desktop widths, measured on a production build (part 4) |
| The argument, on the reading and at `/learn/why` | 3 | 3 | UC-12 | The insight as premises and a conclusion, each labelled with what supports it, its weakest step marked, rendered from `docs/blueprint.md` |
| The register and the carve-out, held by test | 3 | 3 | UC-1, UC-3 | No line names a feeling as fact; offers are questions; nothing about trauma, abuse or mental health. Every template is checked with planted specimens |
| The bridge marks on the prompt | 3 | 2 | UC-6 | The prompt's sound words grouped by the three flaw families, marked by what a stored hearing test says the reader can hear |
| The business case and its metric tree | 1 | 5 | UC-13 | `/company`: why a fictional streaming host would build the reading; one north-star metric, two supporting metrics, three guardrails. Labelled illustrative |
| The A/B test, sized, with its kill lines | 1 | 5 | UC-13 | The test at the host's creation entry, its sample size computed from stated planning assumptions, and the result that would kill the feature |
| The five stakeholder notes | 1 | 3 | UC-13 | What personalization, trust and safety, legal and licensing, growth and label partnerships would each ask, and the answer |
| The Threshold staircase | 2 | 1 | UC-6 | An adaptive staircase reporting the smallest flaw a listener still hears, in cents, milliseconds and kbps. The bridge links to it |
| The Delicacy Trials | 1 | 1 | UC-6 | Forced-choice pairs at calibrated damage, scored against chance |
| The Prestige Test | 1 | 1 | UC-8 | Rate blind, rate labelled, two labels false. The gap is the number |
| The Ranking Test | 1 | 1 | UC-9 | Six works a critic ranked, rated blind, reporting spread rather than agreement |
| The retest arc | 1 | 1 | UC-10 | Change between sittings, against a noise floor measured first |
| The flaw vocabulary | 1 | 1 | UC-7 | `/learn/flaws`: what each flaw family is called and sounds like |
| The pages on Hume's criteria | 1 | 1 | UC-11 | `/learn`: what each of Hume's five criteria means and which test measures it |
| The falsified-hypotheses registry | 1 | 2 | none | Beliefs this project measured its way out of, each citing the file that killed it |
| The refusals and reversals on `/method` | 1 | 2 | none | Seven things refused and three reversals, each with what it cost |
| The psychometrics pipeline | 1 | 1 | none | Clip validation against a transparency anchor, CTT estimators, 2PL IRT and parameter recovery |

## The rankings

Three weightings. **The question is not which order is right but which features survive all
three**, because those do not depend on who is reading.

**These lists are computed from the table above, not chosen.** `prd-scoring.test.ts` recomputes them
on every run and fails if the document disagrees with its own numbers. **Ties are broken
alphabetically, and two ties decide what the lists look like.** The first three places are one
three-way tie under every weighting, so their order says nothing: arguing with a line does not
outrank the lines. And under the second weighting, "Reading what is new" and "The mock creation
screen" both score 4.0 for fifth, and the alphabet picks.

**50 / 50 — the balanced view**

1. Arguing with a line: two readings, neither, or reject · 2. The prompt, recomposed from what was kept ·
3. The reading's lines, with receipts · 4. Reading what is new, not what is old · 5. The mock creation screen

**70 TRY / 30 FUND — a reviewer trying the product**

1. Arguing with a line: two readings, neither, or reject · 2. The prompt, recomposed from what was kept ·
3. The reading's lines, with receipts · 4. Three illustrative listeners · 5. Reading what is new, not what is old

**30 TRY / 70 FUND — a reviewer judging the business case**

1. Arguing with a line: two readings, neither, or reject · 2. The prompt, recomposed from what was kept ·
3. The reading's lines, with receipts · 4. Reading what is new, not what is old · 5. The mock creation screen

## What survives all three

**The three parts of the core come first under every weighting:** the lines with their receipts,
arguing with a line, and the prompt. BP-UNMET names exactly these three: check, argue with,
carry into a prompt. They survive because they are the only features that score high on both
clauses. A reviewer trying the product meets them, and the business case rests on them.

**The business case is not in the top five, even under the weighting built for it.** The Company
view's two scored features each score 5 on FUND and 1 on TRY, and land sixth and seventh at 30 / 70. That is what BA-12 intends: the
core is real and the surroundings are mock. A labelled mock of a company can support the core; it
cannot replace it. If `/company` were ranked first, the prototype would be a pitch deck.

**The hearing section scores low on both axes.** It is reached from the prompt through one link
(BP-BRIDGE), and the business case never mentions it. That matches part 1, where the one person
asked said the problem it addresses is not theirs. **This ranking does not recommend removing it**;
it records that the product does not depend on it.

## What the earlier version ranked, and why it was replaced

The earlier version of this part (commit `d468c9e`, 2026-09-13) scored features on **CRAFT**, what
building them proved, and **LEGIBILITY**, how fast a reviewer could see it. Under that rule, the
falsified-hypotheses registry and the refusals on `/method` came first under every weighting. **Under
this rule they score 1.5 under the balanced weighting, near the bottom.**

The owner reopened that rule (**BA-2**, `docs/rt-answers-2026-09-23-audit.md`). The direction behind
it cannot be recovered, and scoring features on what building them proved conflicts with BP-GOAL,
which asks what a reviewer can try and what a funder can see. N2 calls that justification resume
theatre. Nothing about the registry or the refusals changed. What changed is the question they were
scored against, and that alone moved them from first to last.

## Gate: everything simulated is labelled

BP-GOAL's third clause is pass or fail. Every simulated user, metric and stakeholder carries a label
on the screen that shows it. Part 3 cites each label's constant, and its test checks that the
constant exists.

| What is simulated | Where it shows | Its label |
|---|---|---|
| The three listeners and their plays | `/`, `/reading` | the listener label on every card and reading |
| The host and its creation screen | `/reading`, the last step | the creation label, and the note under "Generate" |
| The metrics, test plan and stakeholder notes | `/company` | the company label at the top of the page |
| Every figure in the Lab | `/lab` | a badge saying where it came from: SIMULATED, MEASURED, MIXED, or REAL, which nothing earns yet (`site-badges.test.tsx`) |

## The reusable part, for the next project

1. **Score features against the goal's own clauses, and write the goal down first.** The earlier
   version scored against something else, and the list followed the rule more than the scores.
   Changing the rule moved the first-placed features to the bottom without a single score of theirs
   changing.
2. **Rank under at least two weightings.** A feature that is first under one and tenth under another
   depends on the audience, and that should be known before it is built.
3. **The features that survive every weighting are the core.** Here that is three, out of
   twenty-three, and they are the three BP-UNMET names.
4. **Turn a pass-or-fail clause into a gate, not an axis.** "Labelled as illustrative" cannot be
   done a little. Scoring it would let a well-scored feature carry an unlabelled mock.
