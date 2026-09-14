# Rulings of record — 2026-09-13 (E20)

Third in the series, after `docs/rt-answers-2026-07-11.md` and `docs/rt-answers-2026-09-07.md`.
**Tracked on purpose**, for the reason those two give: the Phase 2 and Phase 3 blueprints are
deliberately untracked, so **a ruling recorded only there is a ruling a fresh clone cannot see** —
and, as this session proved, a ruling only one machine can read is one a later session will re-open
and spend a second answer on. RT-I was ruled on 2026-09-01 and three subsequent handoffs carried it
as still awaiting an answer.

Everything in §1 and §2 is settled. §3 is what is still open, and it is short on purpose.

---

## 1. Rulings carried out of the untracked blueprints (Track Q1)

| Id | The question | Ruling | Where it stands |
|---|---|---|---|
| **RT-G** | Persistence: device-local, or a hosted store? | **(b) device-local** | Shipped. Track G done |
| **RT-H** | What does "breadth" mean for the Comparison instrument? | **CLOSED** — the question described an instrument the product had already refused | Full reasoning in `rt-answers-2026-09-07.md` |
| **RT-I** | Is the composite Taste Index built or killed? | **(a) killed**, ruled 2026-09-01 | Published 2026-09-13 as `/method`'s fifth refusal. See RT-I2 |
| **RT-J** | Does the Lab ship an empty funnel panel, or say why it is absent? | **Re-framed by the owner, not answered as put.** His words: *"saying we have no data is definitely a poor demonstration of what we built"* | The panel states the ARITHMETIC of the absence and points at its specification, rather than apologising for missing traffic |
| **RT-Z3** | One container width and one navigation model? | **(a) yes**, ruled 2026-09-13 | Track N closed. See the note under it — "one shell" turned out to mean one FRAME with two deliberate exceptions |
| **RT-Z4** | Is the falsified-hypotheses registry built? | **(a) build it** | Done. 33 entries live at `/lab/falsified` |
| **RT-Z1** | Does a real number ever appear on this site, and from whose ear? | **(b) the owner fields it on himself**, ruled 2026-09-13 | **Not done — it needs about 35 minutes of the owner's time.** Tracks O and P wait on it, and so do two Tier 1 goals in `docs/kpis.md` |

## 2. Rulings made on 2026-09-13, which existed only in commit messages until now

| Id | The question | Ruling |
|---|---|---|
| **RT-I2** | Does "publish the five sub-scores as a profile" mean a NEW surface? | **(a) no.** The five readings stay where they are measured; `/method`'s refusal carries the reason there is no combined number. A guard refuses any shipped string offering a combined or overall taste number |
| **RT-N1** | One name across the repository, the pitch page and the app | **(a) "Standard of Taste" everywhere.** 54 occurrences replaced; the gym metaphor is untouched, because it names a place rather than the product |
| **RT-P1** | Does the product add a preference instrument that turns taste into words? | **(a) mock it on paper first.** Written: `docs/preference-mock-2026-09-13.md`. **Awaiting the owner's judgment on the mock** |
| **RT-P2** | Keep leading with the AI-music-producer audience while the only datum points against it? | **(a) keep it, with the disclosure.** The README now records that one person who makes music with an AI tool has been asked and said the premise does not hold for them |
| **RT-P3** | The front door promises "words you can use", which only an unbuilt instrument delivers | **(a) narrow it — then amended the same day.** The narrowing dropped the word *understanding*, which is the value being sold. The direction flips instead: the recommender understands you and will not say; here you do the understanding |
| **RT-J1** | Does the delicacy share line survive N3? | **(a) keep it.** The product compares nobody; the line invites the reader to. Recorded beside the line in `delicacy/copy.ts`, because the writing pass called it the thinnest distinction in the deck |
| **RT-J2** | Build screenshots into the copy deck before batch 4? | **(a) ship batch 4 as it stands.** Deferred, not refused — the recommendation stands if a fifth deck batch is ever commissioned |
| **RT-Z6** | Can the Vercel retention window go under 30 days? | **Closed as moot.** It mattered when each deployment stored 154 MB of audio; `public/` is now 35 KB |
| **RT-Z7** | Rename the `vibe-check-app-sepia.vercel.app` deployment? | **(c) leave it.** Renaming breaks every share URL already posted, and nobody knows whether any are |

## 3. RT-Z2 — ruled OUT, permanently, on the pipeline's own numbers

**The question:** is a bounded, one-shot seeded cohort ruled in or out — one deliberate ask to a
list of people the owner already knows, never repeated?

**The ruling (2026-09-13): (a) OUT. This document does not raise it again.**

**Why, and it is arithmetic rather than principle.** The only thing a seeded cohort buys that
Track O does not is **item parameters** — difficulty and discrimination estimated from real
responses instead of simulated ones. That is also the one thing a list of friends cannot deliver.
`src/analytics/recovery.ts` sweeps **n = 50 to n = 1000** and records, in its own words, that error
*"at n=50 from one seed can undercut error at n=1000 from another purely by luck"*. Fifty is the
noisy end of the study. A bounded personal ask plausibly returns a fraction of that, in the regime
where a single draw's luck dominates the estimate.

So (b) would flip the Lab's item statistics from `SIMULATED` to `REAL` over numbers that are noise.
**That is worse than the simulation, not better**, because `SIMULATED` is honest about what it is and
a `REAL` badge on twenty convenience-sampled friends is a claim about a population that does not
exist. It is the fabricated-norm hazard, arrived at by being helpful.

**What is NOT given up.** Track O is already ruled in and produces real responses at n = 1, honestly
labelled. n = 1 supports an arc and a calibration curve and does not pretend to support item
parameters. The difference between the two options was never "real data or none" — it was whether the
product would claim a cohort it could not have.

**What it costs, stated plainly:** two Lab badges stay `SIMULATED` permanently, and two Tier 1 goals
in `docs/kpis.md` that depend on item statistics stay blocked. Nothing on any live surface promised
otherwise — checked before ruling.

## 4. Still open

- ~~**RT-P1's second half** — whether the preference instrument gets built, and whether the shipped
  no-transfer ruling would have to be revisited to justify it. The mock exists so this can be
  decided by reading rather than by building.~~
  **CLOSED 2026-09-13 — see §6. It was decided by measuring rather than by reading, and the answer
  was no.** The original text is struck rather than deleted, because the sentence "the mock exists
  so this can be decided by reading" turned out to be the thing that was wrong: reading the mock
  could not have produced the finding that killed it.

## 5. What is deliberately NOT in this file

**The blueprints themselves.** Track Q3 asks whether to retire or bind them, and binding means
tracking, and tracking means publishing — this repository is public and those files contain strategy
and the owner's own assessment of the project. **That is an owner decision and a one-way door**, so
this file takes the RULINGS out of them, which is the part that has to survive, and leaves the
documents where they are.

---

## 6. RT-P1 closed — the preference instrument is killed, on its own arithmetic

Three rulings, made the same day the mock was written, in the order they were made.

| Id | The question | Ruling |
|---|---|---|
| **RT-P1 (second half)** | Does the preference instrument get built? | **Build it** — ruled on the option label alone. The owner's words: *"I don't know what that is"* |
| **RT-2** | Six dimensions cannot fit a five-minute sitting. Which shape ships? | **(a) three dimensions** — ruled on a sitting length of "~20 minutes" |
| **RT-3** | That figure was wrong. What now? | **(a) kill it, and publish why** |

**What happened between them, because the sequence is the whole lesson.** The instrument was
approved before anyone knew what it was, sized against a number nobody had derived, and killed by
the first slice that did the arithmetic. No audio was rendered. The cost of the whole detour was two
engine modules that now document the refusal.

### The arithmetic that killed it

A preference has no right answer, so the only thing measurable is whether a listener's blind choices
**agree with each other**. That is an exact two-sided sign test against a coin, and it has a floor: a
dimension needs **at least seven forced choices** before any result is possible, and a realistic
listener — one who picks their preferred side four times in five — needs **twenty-eight**. Three
dimensions is eighty-four pairs. At the pace this product already assumes for a clip somebody has to
judge, **the sitting is eighty-four minutes** — longer than all four shipped instruments together.

Two figures engineering had put in front of the owner were wrong, and both are recorded because the
ruling was taken on them:

- **"~20 minutes"** for three dimensions. The derived answer is eighty-four.
- **"roughly 20-fold"** for the saving from cutting six dimensions to three. The real saving is
  **2.3-fold**: cutting dimensions barely changes the cost of each one, it just means asking about
  fewer things.

### What the mock got wrong, measured against its own invented numbers

The mock was written to be judged before anything was built, which worked — but it was judged by
running its figures through the engine rather than by reading them. Of its four reported findings,
**two do not survive**. Its flagship sentence, the contradiction the entire instrument was proposed
to deliver, sits at **p = 0.146** and does not clear chance even before the correction for having
asked six questions at once. Only its Space finding survives.

### What is NOT given up

The transfer claim was already refused and stays refused. The four shipped instruments are
untouched. `src/engine/preference.ts` and `src/content/preference-shape.test.ts` stay in the
repository **as the documentation of this refusal**, not as groundwork — an instrument killed by an
argument leaves a paragraph, and one killed by arithmetic leaves a test that still runs.

### What it costs, stated plainly

The product still serves only the first of its two listener findings. **Almost nobody can describe
their own taste in words, and this product still does not help them**, which was the entire case for
building this and remains unanswered. Nothing here says the instrument was a bad idea; it says this
one could not be built at a length anybody would sit.

### RT-4 — the refusal stays on one page

*Kept inside §6 rather than given a section of its own, because it is a ruling about where the
refusal above is published and means nothing detached from it. It is a separate ruling all the same,
with its own id.*

**Asked after the seventh refusal shipped:** does `/learn`, the reading room, also carry a note about
the killed fifth instrument? A reader who wonders *why is there nothing here about what I actually
like* is browsing `/learn`, not `/method`.

**Ruled 2026-09-13: (a) leave it. `/method` is the page for refusals, and it is the only page that
carries this one.**

**Why, and it is not tidiness.** A claim written in two places is a claim that will eventually
disagree with itself, and this repository has paid for that specific failure more than once — the
reading room once described an instrument of eight clips long after it had grown to sixteen, which is
why quantities are now slotted from the pools rather than retyped. The refusal's numbers are slotted
and pinned by test in exactly one file. A second copy on `/learn` would be a second thing to keep
true, guarding a reader who is one click from the page that already says it.

**What it costs, stated plainly:** a reader who never opens `/method` will not learn that the
question was asked and answered. That is a real loss of reach, accepted rather than denied.

**This is recorded so it is not re-proposed.** Adding the note to `/learn` is an obvious, helpful-looking idea, and a future session that has not read this will have it. The answer is here.
