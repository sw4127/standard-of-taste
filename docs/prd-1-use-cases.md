# PRD — Standard of Taste · Part 1: the use-case inventory

**Status: part 1 of 4 — the PRD is complete.** The other three: `docs/prd-2-features.md` (what each feature proves and how fast a reviewer sees it), `docs/prd-3-requirements.md` (functional requirements, each citing the symbol that implements it), `docs/prd-4-screens.md` (measured screen specifications). Brief and definition of done: `docs/task-prd.md`. This part answers *what
tasks can a person complete here* and labels each by the evidence behind it. Functional
requirements, non-goals and wireframes are parts 2 to 4.

**Derived, not recalled.** The route list is walked from `src/app`; 35 routes render a page. Every
one appears below or is listed as out of scope with a reason, which is criterion 1 of the brief.

---

## How to read the labels

Every use case carries one, and the ratio is stated rather than buried.

- **EVIDENCED** — traceable to something real: one of the two Tidal listener findings, a measured
  result, or a behaviour somebody has actually performed.
- **ASSUMED** — a plausible task nobody has confirmed anyone wants.

**The count: 3 EVIDENCED, 14 ASSUMED.** That ratio is the most useful sentence in this document and
it is not flattering. It is what a product with zero fielded users looks like when it is honest. The
three evidenced ones rest on interviews conducted for a Columbia Business School engagement with
Tidal, which produced two findings: that past listening predicts less than present and forming
taste, and that **almost nobody can describe their own taste in words**.

**One datum points the other way and is recorded here because it is the only primary research this
product has on its stated audience.** Asked on 2026-09-13 whether sound quality is a problem he has
when generating music with an AI tool, the owner — the one person who makes music this way and has
been asked — said it is not. n = 1, unblinded, and the respondent owns the outcome. It is evidence
against UC-2 and UC-3 and it is not ignored.

---

## The instruments — what a person actually does

| # | Use case | Route | Label | Rests on |
|---|---|---|---|---|
| **UC-1** | Find out whether a famous name moves my judgment, by rating clips blind and then labelled | `/bias` → `/bias/result` | **EVIDENCED** | Finding 2: people cannot describe their own taste. This measures a gap between two of a person's own judgments and hands back a number they could not have self-reported |
| **UC-2** | Find out how small an audio flaw I can still hear | `/delicacy` → `/delicacy/result` | **ASSUMED** | The flaw families map onto failure modes of generated audio. The mapping is an argument; no one in that audience has confirmed it, and the one asked said no |
| **UC-3** | Get that as a threshold in physical units, not a score | `/threshold`, `/threshold/[slug]`, `/threshold/[slug]/result` | **ASSUMED** | Same as UC-2. It is the product's stated deliverable of record and its demand is unmeasured |
| **UC-4** | Find out whether my judgments spread the way a critic's did, without being scored against him | `/spread` | **ASSUMED** | Derived from Hume's *comparison*, not from a user asking for it |
| **UC-5** | Find out whether my ear moved between two sittings | the retest arc, on all result screens | **EVIDENCED** | Finding 1: present and forming taste matters more than listening history. This is the only instrument that measures change rather than state |
| **UC-6** | See every number behind my result, with no verdict attached | the expert panel, on all result screens | **ASSUMED** | Built on the engineer's diagnosis that experts reject standardised scores. Plausible, unconfirmed |
| **UC-7** | Share a result without it carrying my session's private detail | `/bias/result`, `/delicacy/result` share paths | **ASSUMED** | The share loop has never run; the funnel it was built for was measured at 29 visitors and concluded dead |

## Understanding what the product measured

| # | Use case | Route | Label | Rests on |
|---|---|---|---|---|
| **UC-8** | Learn what a flaw is called and what it sounds like, so I have a word for it | `/learn/flaws` | **EVIDENCED** | Finding 2, directly. It is the one surface built to turn an inarticulate complaint into vocabulary |
| **UC-9** | Read what each of Hume's five criteria means and how it is measured | `/learn`, `/learn/freedom-from-prejudice`, `/learn/delicacy`, `/learn/good-sense`, `/learn/comparison`, `/learn/practice`, `/learn/prestige-bias-test`, `/learn/ranking-test` | **ASSUMED** | A reading room nobody has been observed using |
| **UC-10** | Check how the instruments work before trusting a number | `/learn/methodology` | **ASSUMED** | |
| **UC-11** | Find out what the instruments cannot do | `/lab/instrument-limits` | **ASSUMED** | |

## Assessing the project rather than using it

These are the recruiter's and the reviewer's tasks. They are ASSUMED in the same sense as the rest —
no reviewer has been observed — but they are the use cases the artifact was reorganised around.

| # | Use case | Route | Label |
|---|---|---|---|
| **UC-12** | Judge how this project is run, and what it refused | `/method` | **ASSUMED** |
| **UC-13** | Check the analytics pipeline against data whose truth is known | `/lab`, `/lab/recovery`, `/lab/instrument-health` | **ASSUMED** |
| **UC-14** | Read what the project believed and then disproved | `/lab/falsified` | **ASSUMED** |
| **UC-15** | Find out what is stored about me and clear it | `/lab/data-model`, `/legal` | **ASSUMED** |
| **UC-16** | Understand the product in under a minute without using it | `/` | **ASSUMED** |
| **UC-17** | Read the code that computes a claim I have just read | the repository | **ASSUMED** |

## Out of scope, with reasons

| Routes | Why |
|---|---|
| `/quiz`, `/result`, `/music/quiz`, `/music/result`, `/fan-verdict`, `/vs` | The legacy World-Cup and music-taste funnel. Superseded by the taste gym; kept alive only so shared URLs do not 404 (`CLAUDE.md`, Legacy). No use case is specified for them and none should be |
| `/premium/preview`, `/premium/report` | The paid tier, withdrawn by the D4 amendment. There is no paid tier and none is coming |

**That is 35 routes: 27 carrying use cases, 8 out of scope.**

---

## What this part establishes for the rest of the PRD

1. **The product has one evidenced core and a large assumed periphery.** UC-1, UC-5 and UC-8 are the
   three with something real behind them, and all three serve the same finding: people cannot say
   what their taste is. Parts 2 to 4 should specify those first.
2. **The audience question is unresolved and visible.** UC-2 and UC-3 are the deliverable of record
   and carry a negative datum. A PRD cannot fix that; it can refuse to hide it.
3. **The legacy routes are a liability in any document that lists them without a reason.** They are
   listed with one.
