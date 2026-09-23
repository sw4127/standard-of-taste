# PRD — Part 2: the feature breakdown, scored and ranked under three weightings

**Status: slice 2 of 4.** Part 1 is `docs/prd-1-use-cases.md`. Brief: `docs/task-prd.md`.

*[2026-09-23 — this part describes the product BEFORE the blueprint audit: the Prestige Test as flagship, the gym as the product, and the use-case numbers of the earlier inventory. The product of record is now the reading (BA-6, `docs/rt-answers-2026-09-23-audit.md`), and part 1 has been re-derived from `docs/blueprint.md` with new numbering. This part is revised next; until then, read it as the record of what was specified, not as the specification.]*

**What this is for.** Two audiences with opposite needs. A reviewer at a larger company has ten
minutes and wants to know which decisions here were hard. The owner wants a reusable method — which
features earned their build cost, so the next project can be scoped by the same reasoning rather than
by enthusiasm.

**The product is not being distributed and no outcome data will ever exist.** So features are not
scored on adoption, retention or revenue; there is none and there will be none. They are scored on
what they demonstrate and how fast that is visible. Anything else would be a column of zeroes
pretending to be analysis.

*[2026-09-23 — this scoring rule conflicts with BP-GOAL in `docs/blueprint.md`, which asks that a reviewer see why a real company would fund the product and how it would test that. Scoring features only on "what they demonstrate" is the justification N2 names as resume theater. The scores below are kept as computed; the next revision scores features against BP-GOAL. The direction behind this rule (d468c9e, 2026-09-13) cannot be recovered and is reopened (BA-2).]*

---

## The two axes

| Axis | Question it answers | Scored 1-5 |
|---|---|---|
| **CRAFT** | What did building this require, and what does it prove about the person who built it? | 5 = a decision most people would get wrong; 1 = competent assembly |
| **LEGIBILITY** | How fast can a reviewer who has never seen this tell that it is good? | 5 = visible in under a minute; 1 = needs the code read |

**Both are my judgment.** There is no measurement behind either column and there cannot be — nobody
has reviewed this artifact. The numbers are stated so the reasoning is arguable rather than implied,
which is the only honest use for a subjective score. **Disagree with a row and the ranking changes;
that is the point of showing three weightings rather than one.**

## The features

| Feature | CRAFT | LEGIBILITY | What it actually is |
|---|---|---|---|
| Falsified-hypotheses registry | 5 | 5 | 33 beliefs this project measured its way out of, each citing the file that killed it, build-gated so the list cannot be curated |
| The refusals on `/method` | 5 | 5 | Six things refused and what each cost, with the quoted source verified against the document on every run |
| Layer A clip validation | 5 | 2 | Every damaged clip measured against a 320 kbps transparency anchor by log-spectral distance and temporal drift. It replaced a human ear gate |
| Layer B psychometrics | 5 | 3 | CTT estimators, 2PL IRT, parameter recovery proving the estimators before they were trusted |
| The deterministic engine | 4 | 2 | Every number is a pure function over raw taps. Share URLs carry answers, never conclusions, and recompute on every request |
| The test-as-documentation discipline | 5 | 2 | 2115 tests, many of which exist to stop a document drifting from the code it describes |
| The vocabulary layer | 4 | 4 | Every result ends in sentences built from a within-person contrast, which is ground truth at n = 0 |
| The Prestige Test | 3 | 5 | Rate blind, rate labelled, two labels false. The gap is the number |
| The Threshold staircase | 4 | 3 | An adaptive staircase reporting in cents, milliseconds and kbps rather than a score |
| The retest arc | 4 | 3 | Change between sittings against a noise floor measured first, so most retests are honestly told nothing moved |
| The Lab | 3 | 4 | Metric dictionary, instrument health, recovery plots, and a page of what the instruments cannot do |
| The Delicacy Trials | 3 | 4 | Forced-choice pairs at calibrated damage, scored against chance |
| The Ranking Test | 3 | 3 | Six works a critic ranked, rated blind, reporting spread rather than agreement |
| The expert panel | 2 | 3 | Every number behind a result with no verdict attached |
| The copy-deck pipeline | 4 | 1 | Every user-visible string enumerated from source so a writing pass can be commissioned against templates |
| The shell and one name | 2 | 3 | One container width, one header, one product name, each guarded |

## The rankings

Three weightings. **The question is not which order is right — it is which features survive all
three**, because those are the ones that do not depend on who is reading.

**These five-line lists are computed from the table above, not chosen.** `prd-scoring.test.ts`
recomputes them on every run and fails if the document disagrees with its own numbers — which it did
on the first draft, in five of fifteen positions.

**50 / 50 — the balanced view**

1. Falsified-hypotheses registry · 2. The refusals on `/method` · 3. Layer B psychometrics ·
4. The Prestige Test · 5. The vocabulary layer

**70 CRAFT / 30 LEGIBILITY — an engineer reviewing**

1. Falsified-hypotheses registry · 2. The refusals on `/method` · 3. Layer B psychometrics ·
4. Layer A clip validation · 5. The test-as-documentation discipline

**30 CRAFT / 70 LEGIBILITY — a recruiter with ten minutes**

1. Falsified-hypotheses registry · 2. The refusals on `/method` · 3. The Prestige Test ·
4. The vocabulary layer · 5. The Delicacy Trials

## What survives all three

**The registry and the refusals are first under every weighting**, and nothing else is. They are the
two features that are simultaneously the hardest thing here and the fastest to see — a page of
things the project believed and disproved, and a page of things it refused and what each cost.

**Layer A and the copy-deck pipeline are the opposite case**: high craft, low legibility, invisible
without the code. They are the features most likely to be undersold, and the argument for keeping
them is not that a reviewer will notice — it is that the product would be less true without them.

**The Prestige Test is top five under both the balanced and the recruiter weighting, and absent
under the engineer's.** It is the most demonstrable feature and not the most difficult one — which is
exactly the asymmetry to know about before the next project gets scoped around whatever demos best.
I predicted it would appear only under the recruiter weighting and the arithmetic disagreed, which is
the kind of thing a scoring table is for.

## The reusable part, for the next project

1. **Score on what a feature proves and how fast that shows, not on projected outcomes** — especially
   when no outcome data will exist. A column of zeroes is not analysis.
2. **Rank under at least two weightings.** A feature that is first under one and tenth under another
   is a feature whose value depends on the audience, and that should be known before it is built.
3. **The features that survive every weighting are the ones to build first.** Here that is two, out
   of sixteen.
4. **A high-craft, low-legibility feature needs a surface that makes it visible**, or it is work
   nobody will ever credit. Layer A has no such surface; the registry is what Layer B got.
