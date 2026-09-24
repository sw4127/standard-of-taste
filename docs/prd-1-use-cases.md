# PRD — Standard of Taste · Part 1: the use-case inventory

**Status: part 1 of 4, re-derived from the blueprint on 2026-09-23.** `docs/prd-2-features.md`
has been revised against it. `docs/prd-3-requirements.md` and `docs/prd-4-screens.md` describe the
product as it stood before the blueprint audit and are stamped to say so; they are revised next.
Brief and definition of done: `docs/task-prd.md`.

**Derived from the blueprint, then checked against the routes.** The first version of this part
walked the routes in `src/app` and wrote a use case for each, so it described what had been built
rather than what the blueprint asked for. This version starts from `docs/blueprint.md`: every use
case below names the BP statement it serves. Then the routes are walked — 38 render a page — and
every one is placed: as serving a use case, as serving **no** BP statement (listed, not hidden), or
as out of scope with a reason.

*The use-case numbers below replace the earlier inventory's. Part 2 cites these; parts 3 and 4 still cite the earlier numbers until they are revised. `prd-numbering.test.ts` checks that every number cited exists here.*

---

## How to read the labels

Every use case carries one, and the ratio is stated rather than buried.

- **EVIDENCED** — its direct basis is an evidenced BP statement: one of the two listener-interview
  findings (BP-F1, BP-F2) or the premise built on them (BP-CA2). Evidenced *qualitatively*: the
  interviews establish what listeners reported, not a measured effect.
- **ASSUMED** — it rests on an assumed statement (BP-DEMAND above all: nobody has been observed
  wanting any of this), an inference, or a philosophical position.

**The count: 3 EVIDENCED, 12 ASSUMED.** It is what a product with zero fielded users looks like when
it is honest. The interviews behind the evidenced three were conducted for a Columbia Business
School engagement with Tidal and produced two findings: that past listening predicts less than
present and forming taste, and that **almost nobody can describe their own taste in words**.

**One datum points the other way, and it is recorded because it is the only primary research on
the hearing section's audience.** Asked on 2026-09-13 whether sound quality is a problem when
generating music with an AI tool, the owner — the one person who makes music that way and has been
asked — said it is not. n = 1, unblinded, and the respondent owns the outcome. It is evidence
against UC-6, and it is not ignored.

**Relabelled in this revision, with the reason.** The earlier inventory marked the Prestige Test and
the retest arc EVIDENCED. The Prestige Test's basis was BP-F2 (people cannot describe their taste),
but what it serves in the blueprint is BP-CA3, which is a philosophical position, not evidence. The
retest arc's basis was BP-F1, which is about taste changing, not about an ear improving. Both are
ASSUMED here.

---

## The core: the reading — BP-INSIGHT, BP-UNMET, BP-DEMAND, BP-CA1, BP-CA2

| # | Use case | Route | Label | Serves |
|---|---|---|---|---|
| **UC-1** | Get words for what my recent listening shows, because I could not have described it myself | `/reading` | **EVIDENCED** | BP-INSIGHT, BP-CA2 (BP-F2) |
| **UC-2** | Check each line against the plays that produced it | `/reading` (the receipts) | **ASSUMED** | BP-ARG-REPLY, BP-UNMET |
| **UC-3** | Argue with a line: reject it, or choose which of two readings fits, or neither | `/reading` | **ASSUMED** | BP-UNMET, BP-ARG-S1 |
| **UC-4** | See what I am reaching for now and starting to reach for, not my all-time favourites | `/reading` (new vs known, the drift line) | **EVIDENCED** | BP-CA1 (BP-F1) |
| **UC-5** | Carry what survives into a prompt for music about my own life | `/reading` (the prompt and the mock creation screen) | **ASSUMED** | BP-DEMAND, BP-UNMET |

## The bridge: the hearing section — BP-BRIDGE, BP-CA3

| # | Use case | Route | Label | Serves |
|---|---|---|---|---|
| **UC-6** | Find out which of my prompt's words I can actually hear | `/threshold`, `/threshold/[slug]`, `/threshold/[slug]/result`, `/delicacy`, `/delicacy/result` | **ASSUMED** | BP-BRIDGE. The one datum above points against it |
| **UC-7** | Learn what a flaw is called and what it sounds like, so I have a word for it | `/learn/flaws` | **EVIDENCED** | BP-BRIDGE, BP-CA2 (BP-F2) |
| **UC-8** | Find out whether a famous name moves my judgment | `/bias`, `/bias/result` | **ASSUMED** | BP-CA3: bad judgment comes from defects that can be removed, prejudice among them |
| **UC-9** | Find out whether my ratings spread where a critic's did, without being scored against the critic | `/spread` | **ASSUMED** | BP-CA3 |
| **UC-10** | Find out whether my ear moved between two sittings | the retest arc, on the hearing results | **ASSUMED** | BP-CA3 (practice) |
| **UC-11** | Read what each of Hume's criteria means and how it is measured | `/learn`, `/learn/freedom-from-prejudice`, `/learn/delicacy`, `/learn/good-sense`, `/learn/comparison`, `/learn/practice`, `/learn/prestige-bias-test`, `/learn/ranking-test` | **ASSUMED** | BP-CA3 |

## The argument and the business case — BP-ARG, BP-GOAL, BP-BUSINESS

| # | Use case | Route | Label | Serves |
|---|---|---|---|---|
| **UC-12** | Read the argument the reading rests on, with its weakest step marked | `/learn/why` | **ASSUMED** | BP-ARG, BP-ARG-WEAK |
| **UC-13** | See why a company would fund the reading and how it would test that | `/company` | **ASSUMED** | BP-BUSINESS, BP-GOAL |
| **UC-14** | Try the core as its intended user within minutes | `/` | **ASSUMED** | BP-GOAL |
| **UC-15** | Understand the product without using it | `/` | **ASSUMED** | BP-GOAL, BP-INSIGHT |

## Routes that serve no BP statement

Listed rather than hidden. They are the project's credibility and its obligations, not its core, and
the blueprint does not ask for them. Each stays for the reason given.

| Routes | Why they stay |
|---|---|
| `/method` | How the product was built and what was refused (BA-12 puts the account of building with an AI engineer here, not in the product) |
| `/lab`, `/lab/recovery`, `/lab/instrument-health`, `/lab/falsified`, `/lab/instrument-limits`, `/lab/data-model` | The analytics pipeline validated against simulated data, the measured limits, the falsified hypotheses and what is stored (N3, D6) |
| `/learn/methodology` | How the hearing tests score, for a reader deciding whether to trust a number (N3) |
| `/legal` | Terms and privacy |

## Out of scope, with reasons

| Routes | Why |
|---|---|
| `/quiz`, `/result`, `/music/quiz`, `/music/result`, `/fan-verdict`, `/vs` | The legacy World-Cup funnel, and the music snack: retired 2026-09-23 (BA-7); the snack's routes redirect to the reading, the rest to the front door. Kept alive only so shared URLs do not 404 (`CLAUDE.md`, Legacy) |
| `/premium/preview`, `/premium/report` | The paid tier, withdrawn by the D4 amendment. There is no paid tier and none is coming |

**That is 38 routes: 21 serving a use case, 9 serving no BP statement, 8 out of scope.**

---

## What this part establishes for the rest of the PRD

1. **The core is the reading, and its demand is assumed.** UC-1 and UC-4 rest on the interview
   findings; everything that says people *want* the reading rests on BP-DEMAND, which nothing
   supports yet. Parts 2 to 4, revised, should specify UC-1 to UC-5 first.
2. **The hearing section is reached through an assumed bridge, with a negative datum.** UC-6 is
   the only reason the instruments sit behind the reading, and the one person asked said the
   problem it addresses is not theirs.
3. **A route that serves no BP statement is named as one.** Nine do. They stay for stated reasons;
   none of them is presented as the product.
