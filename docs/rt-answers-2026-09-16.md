# Rulings of record — 2026-09-16 (E21)

Fourth in the series, after `docs/rt-answers-2026-07-11.md`, `docs/rt-answers-2026-09-07.md` and
`docs/rt-answers-2026-09-13.md`. **Tracked on purpose**, for the reason all three give: a ruling
recorded only in an untracked file is a ruling a fresh clone cannot see, and a ruling only one
machine can read is one a later session re-opens and spends a second answer on.

These six rulings redirect the product. They were taken against
`docs/mrd-prompt-card-2026-09-16.md`, which is tracked by RT-Z6 (2026-09-16) below and is the
document they are about. **Where this file and any blueprint disagree, this file is authoritative.**

---

## 0. The ID namespace, and why these rulings are date-qualified

**Read this before citing an `RT-Z` id anywhere.** The `RT-Z` letters were exhausted before this
session and several have already been used twice for unrelated questions. Grepping a bare `RT-Z8`
returns two different decisions, and neither is wrong — they were issued by sessions that could not
see each other's blocks.

| Letter | Earlier use | Use in this file |
|---|---|---|
| **RT-Z2** | "delete previews", ruled (a) — `docs/handoff-2026-09-10.md` · **and** the bounded seeded cohort, ruled OUT permanently — `docs/rt-answers-2026-09-13.md` §3 | not reused |
| **RT-Z5** | none found | the readable output may speak about the person |
| **RT-Z6** | the Vercel retention window, closed as moot — `docs/rt-answers-2026-09-13.md` | track the MRD, every market claim labelled |
| **RT-Z7** | rename the `vibe-check-app-sepia` deployment, ruled (c) — `rt-answers-2026-09-13.md` · **and** "leave the dead entries", ruled (a) — `handoff-2026-09-10.md` | the card sits beside the threshold readout |
| **RT-Z8** | "move the audio", ruled (a) — `docs/handoff-2026-09-10.md` | generic wording, no generator named |
| **RT-Z9** | "accept the CDN dependency", ruled (a) — `docs/handoff-2026-09-10.md` | the scope of the D1 relaxation |
| **RT-Z10** | none found | the trauma / abuse / mental-health carve-out |

`RT-Z3` and `RT-Z4` also appear in `docs/handoff-2026-09-10.md` with no question stated beside them,
so the same hazard extends to those letters; no claim is made here about whether they were the same
questions ruled on 2026-09-13.

**The ids issued by the owner are not renamed.** He ruled under these letters and his own notes say
so. What changes is that they are **date-qualified from here on** — written `RT-Z9 (2026-09-16)`
wherever ambiguity is possible — and that this table exists so a reader who greps a letter finds
both answers instead of the wrong one. The convention for future rulings is the same: qualify by
date, and check this section before issuing a letter.

---

## 1. The six rulings

| Id | The question | Ruling |
|---|---|---|
| **RT-Z5 (2026-09-16)** | May the product's readable output speak about the PERSON, or only about the performance? | **(b) it may speak about the person.** Engineering's recommendation on file was (a); the owner overrode it deliberately |
| **RT-Z6 (2026-09-16)** | Does the MRD become a tracked, public document? | **(a) yes, tracked, with every market claim carrying EVIDENCED or ASSUMED** |
| **RT-Z7 (2026-09-16)** | Does the prompt card replace the threshold readout or sit beside it? | **(b) beside it.** Ordering still carries the diagnosis: card above, number below, expert view unchanged |
| **RT-Z8 (2026-09-16)** | Is any text-to-music generator named on the surfaces? | **(a) no. Generic wording everywhere** |
| **RT-Z9 (2026-09-16)** | Is D1 suspended for the card alone, or relaxed product-wide? | **(a) the card alone.** The instrument readouts keep D1 intact |
| **RT-Z10 (2026-09-16)** | Does the no-trauma / abuse / mental-health carve-out stand? | **(a) it stands** |

---

## 2. RT-Z5 (b) — the readable output speaks about the person

**What was asked.** The product ends in a threshold in cents. The number is *evidence*, and it has
been standing in the position of the *deliverable* — which is why a technically sound instrument is
neither enjoyable to use nor convincing to look at. The proposed fix is a short human-readable card,
assembled deterministically from what the listener actually discriminated. The question was whether
that card may say anything about the reader, or must stay, as every other surface does, on what the
reader did.

**The ruling: (b).** The card may speak about the person — experiences, what they have lived with,
what they reach for.

**Why this is not a small ruling.** It repeals part of **D1**, which is the spine of this
constitution: the product evaluates and cultivates taste and *never predicts personality, mood, or
psychological states*. D1 is why the $3.99 personality quiz was killed, and the live product
currently mocks that quiz in its own copy — *five taps, a verdict, and no measurement behind it*. A
repeal of that size is not taken silently, which is what RT-Z9 and the amendment exist for.

**What survives the ruling.** MRD §6.3: the constraint is no longer *stay off the person*, it is
**offer, do not assert**. The difference is the difference between these two sentences:

- ✗ *You have unresolved loss.*
- ✓ *You chose the take with the slower decay every time — the one that lets the room finish speaking.*

The second still speaks to the person, claims nothing the session cannot support, and is the better
sentence anyway.

## 3. RT-Z6 (a) — the MRD is tracked, and every market claim is labelled

**The ruling: (a).** `docs/mrd-prompt-card-2026-09-16.md` joins the repository. **The repository is
public, so tracking it publishes it**, and that is the intent: the position the document takes is
itself part of what the repository is for.

**The condition is load-bearing, not decoration.** A repository whose public page publishes its own
refusals cannot absorb a file full of unsupported market claims. The PRD already solved this — every
use case in `docs/prd-1-use-cases.md` carries **EVIDENCED** or **ASSUMED**, and
`src/content/prd-coverage.test.ts` checks that the document's stated ratio matches the labels in its
tables. The MRD is held to the same rule by a guard of its own.

**Measured at the time of the ruling, and it is the reason the guard is not optional.** The MRD's
header claimed **"4 EVIDENCED, 7 ASSUMED"**. The document contained three `Status:` lines carrying
one EVIDENCED and four ASSUMED mentions between them, and two whole sections of market claims — §1.4
and §2 — carried no label at all. The count in the header of the document about honest labelling was
false. Tracking it unchanged would have published that.

## 4. RT-Z7 (b) — the card sits beside the threshold readout

**The ruling: (b).** Both are shown. The card does not replace the number.

**Why.** With no real user flow to optimise, a reader arriving at this product should see everything
it can do; that is right for the audience this product actually has. **The ordering still carries
the diagnosis** — card above, number below, expert view unchanged. Both are shown; only one of them
is the deliverable.

## 5. RT-Z8 (a) — generic wording, no generator named

**The ruling: (a).** No text-to-music generator is named on any surface.

**Why.** The card is text, and text is the integration. Naming a tool dates the surface the moment
that tool changes its interface, and buys nothing the generic wording does not already buy.

## 6. RT-Z9 (a) — D1 is suspended for the card ALONE

**The ruling: (a).** D1 stands, unchanged, for every instrument readout. It is suspended for one
named surface: the prompt card.

**What the reader sees under this ruling.** The Prestige, Delicacy, Threshold and Ranking result
screens keep saying only what the reader did — *you rated the labelled take 1.4 points higher*.
Exactly one surface is allowed a sentence about the person, and **that surface says so on itself**.

**Why the scoped form rather than a product-wide relaxation, in one sentence:** a card that speaks
about the person is only interesting because the measurement under it does not. Relax D1 everywhere
and the card becomes one more piece of software telling somebody who they are, which is the product
this one was pivoted away from.

**What it costs, stated rather than glossed.** The constitution gains an exception, and an exception
is more complex than a clean rule — every future surface now has to ask which side of it it is on.
The product can also no longer say that every sentence it shows is about performance. That is a real
loss and it goes on `/method` as a **reversal**, not as an eighth refusal.

**This ruling requires the amendment in MRD §6.1 to be recorded in the constitution before any card
copy is written.** The constitution is append-only: the old D1 is stamped and kept, never deleted.

## 7. RT-Z10 (a) — the carve-out stands

**The ruling: (a).** With D1 relaxed on the card, the card still makes **no assertion about trauma,
abuse, or mental health.**

**On what grounds, since D1 no longer supplies them here.** Not squeamishness and not D1: that is
the one class where being wrong lands on a person rather than on a number. Everything else the
ruling opens — memory, attention, what someone reaches for, what they sit still for — is fair, and
is the interesting part anyway.

**It does not disappear by omission.** It was put explicitly and ruled explicitly, and the templates
are guarded against it in the same way the no-causal-promise rule is guarded today.

---

## 8. What these rulings do NOT relax

- **N3 holds everywhere and is not touched by RT-Z5.** No percentile, no cohort, no comparison
  between people. n = 0. Everything simulated stays badged.
- **The anti-clone clause is unchanged.** No leaderboard, streak, XP, points or badge.
- **No generated prose.** The card is assembled from templates by the deterministic engine. The
  model never writes an assessment; if the card is ever generated prose, the product has lost the
  only reason anyone should believe it.
- **No causal promise.** The card does not claim it improves anybody's output. A guard already
  refuses five phrasings of that on `/learn/flaws`, and it is extended to cover the card.
- **D1 on the instrument readouts.** Per RT-Z9 (a), unchanged and unrelaxed there.
