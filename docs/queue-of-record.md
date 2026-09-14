# The queue of record — every track from Phase 2 and Phase 3, and where it stands

**This file is TRACKED. The blueprints it draws from are not.**

`docs/blueprint-phase-2.md` and `docs/blueprint-phase-3.md` hold the plans this project is executing
and neither is in the repository — they are working files on one machine. That is Phase 3's own
finding ③, in its own words: *"a document whose claims nothing holds to the code — and its largest
instance is now the planning file itself."* A queue a fresh clone cannot see is not a queue, and a
queue only one session can read is lost the moment that session ends.

So this is the carry-forward, and the rule for it is simple: **a track leaves this file only when it
is done or when the owner kills it.** Nothing drops out because a session forgot it.

Created 2026-09-13 at the owner's instruction, after a session that added several directions at once
and risked burying what was already planned.

---

## Phase 2

| Track | What it is | Status |
|---|---|---|
| **G** — persistence | Device-local store for results | **done** |
| **H** — the retest arc | Hume's *practice*: second sitting against a measured noise floor | **done** |
| **I** — the Comparison instrument | The Ranking Test | **done** (RT-H closed, `criteria-coverage.test.ts` pins all five criteria) |
| **J** — the Lab panels | Data model, instrument health, falsified registry | **done** (became Phase 3's R1/R2) |
| **K** — the composite Taste Index | Build or kill | **done** — killed (RT-I a) and published as `/method`'s fifth refusal |
| **L** — the public surfaces | README, ARCHITECTURE, llms files | **done** |
| **M** — the Taste Gem | A five-facet visual of the result | **done — killed and published** 2026-09-13 as `/method`'s sixth refusal. **Phase 2 is now complete.** Note the recorded reason ("two visibly unlit facets") had expired; the surviving objection is that most facets are dark for most READERS, which is a completion meter |

## Phase 3

| Track | What it is | Status |
|---|---|---|
| **N** — one shell | One container width, one navigation model | **DONE, and it did not mean what it sounded like.** `/`, `/learn`, `/method`, `/lab`, `/legal` took the shell. The Prestige and Ranking flows took it because their eleven-point scale wrapped 6 + 5 into two rows — a measured defect. Delicacy and Threshold were measured and LEFT: a two-way and a three-way choice have nothing to unwrap, and widening them would stretch a focused task for symmetry. Result screens stay narrow because line length is what matters on a reading. Each exemption now carries its reason in `shell-width.test.ts` |
| **O** — the first real number | The owner sits all four instruments; one real result on the front door, badged REAL, n = 1 | **OPEN, and blocked on the owner.** RT-Z1 ruled (b). ~35 minutes. Nothing else in the project is waiting on a decision — only on this |
| **P** — the arc | Retest after the 7-day cooldown; publish whether the ear moved, against its noise floor | **OPEN**, blocked by O and then by seven days |
| **Q** — governance debt | Q1 rulings into a tracked file · Q2 the expertise line · Q3 bind the untracked blueprints | **Q1 and Q2 done.** Every settled ruling from both blueprints, plus the nine made on 2026-09-13, is in `docs/rt-answers-2026-09-13.md` — tracked. **Q3 is an owner decision and a one-way door**: binding means tracking means publishing, and this repository is public while those files hold strategy and the owner's own assessment |
| **R** — the closing surface | Falsified registry, data-model page, Lab honesty | **done** — 33 entries live at `/lab/falsified` |
| **S** — the kill list, published | State the kills on the page, not in a document | **PARTLY DONE.** The Taste Index and the Taste Gem are both published as refusals. **"No sixth instrument" is deliberately NOT published** — RT-P1 queued a mock for a possible fifth instrument on 2026-09-13, so publishing that line would make `/method` false the day it is approved. It waits on RT-P1 |

---

## Opened during the 2026-09-13 session, and not in either blueprint

| | What it is | Status |
|---|---|---|
| **RT-P1 (a)** | The preference instrument, mocked on paper before building | **Mock written** (`docs/preference-mock-2026-09-13.md`). Awaiting the owner's judgment on whether it is worth building |
| **RT-P2 (a)** | Keep the AI-music-producer positioning, with the disclosure | Done, and the disclosure now records a **negative** first datum |
| **RT-P3 (a)** | Narrow the front door's promise to what ships | Done, then amended the same day to keep the word *understanding* |
| **batch 5** | A writing pass on the README, the pitch page and the three front-door sentences | **OPEN, note written** (`docs/commission-batch-5.md`), not yet handed over. Commissioned as documents rather than deck ids — these are long-form prose, not assembled strings |
| **the PRD** | A product requirements document for a reviewer at a larger company. Brief: `docs/task-prd.md` | **Part 1 of 4 done** — `docs/prd-1-use-cases.md`, the use-case inventory, 17 cases labelled 3 EVIDENCED / 14 ASSUMED, every one of 35 routes accounted for. **OPEN:** part 2 functional requirements, part 3 non-goals and constraints, part 4 wireframes |
| **five conversations** | Ask people who generate audio whether the flaw vocabulary is a problem they have | **OPEN, owner's to run.** The audience claim rests on a positioning decision and one negative data point |

## Owner actions, carried

- **GitHub Support** — the ticket is submitted; the reply has not been read. What to look for: confirmation
  that cached views of the pre-rewrite history are purged. **That sentence is what releases the four
  backup refs** (one branch, three tags). Until then: never `git push --force --mirror origin`.
- **GitHub Pages** — enabled, live at `sw4127.github.io/standard-of-taste`.
- **The engine package** — recommended CUT, not done, and not to be done without a fresh ruling.
- **RT-Z2** — ruled OUT permanently 2026-09-13: a seeded cohort buys item parameters, and a friends-sized sample sits below the noisy end of the pipeline's own recovery sweep. Two Lab badges stay SIMULATED and two Tier 1 goals stay blocked; the reasoning is in `docs/rt-answers-2026-09-13.md` §3.
- **RT-Z6** — closed as moot: the retention window mattered when each deployment stored 154 MB of
  audio, and `public/` is now 35 KB.
