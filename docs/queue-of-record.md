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
| **M** — the Taste Gem | A five-facet visual of the result | **OPEN.** Gated on "build only if the sentences failed". Three copy batches have now landed, so under its own condition it should be **killed and published** like the Index was. Not done. |

## Phase 3

| Track | What it is | Status |
|---|---|---|
| **N** — one shell | One container width, one navigation model | **PARTLY DONE.** `/`, `/learn`, `/method`, `/lab`, `/legal` and the Prestige flow are on the shell. **Three instrument flows and four result screens are not** — they are listed by name in `src/app/shell-width.test.ts`, which fails if that list goes stale |
| **O** — the first real number | The owner sits all four instruments; one real result on the front door, badged REAL, n = 1 | **OPEN, and blocked on the owner.** RT-Z1 ruled (b). ~35 minutes. Nothing else in the project is waiting on a decision — only on this |
| **P** — the arc | Retest after the 7-day cooldown; publish whether the ear moved, against its noise floor | **OPEN**, blocked by O and then by seven days |
| **Q** — governance debt | Q1 rulings into a tracked file · Q2 the expertise line · Q3 bind the untracked blueprints | **Q2 done.** Q1 and Q3 are *this file*, partly: the queue is now tracked. The individual **rulings** still live in untracked blueprints and in handoffs |
| **R** — the closing surface | Falsified registry, data-model page, Lab honesty | **done** — 33 entries live at `/lab/falsified` |
| **S** — the kill list, published | State the kills on the page, not in a document | **PARTLY DONE.** The Taste Index is published as a refusal. **The Taste Gem and "no sixth instrument" are not** |

---

## Opened during the 2026-09-13 session, and not in either blueprint

| | What it is | Status |
|---|---|---|
| **RT-P1 (a)** | The preference instrument, mocked on paper before building | **Mock written** (`docs/preference-mock-2026-09-13.md`). Awaiting the owner's judgment on whether it is worth building |
| **RT-P2 (a)** | Keep the AI-music-producer positioning, with the disclosure | Done, and the disclosure now records a **negative** first datum |
| **RT-P3 (a)** | Narrow the front door's promise to what ships | Done, then amended the same day to keep the word *understanding* |
| **batch 5** | A writing pass on the README, the pitch page and the three front-door sentences | **OPEN.** These are the highest-traffic copy in the project and the only surfaces never sent to a writer |
| **the PRD** | A product requirements document for a reviewer at a larger company — use cases, functional requirements, audiences, non-goals. Brief: `docs/task-prd.md` | **OPEN, queued 2026-09-13.** Multi-session. Wireframes wait on Track N |
| **five conversations** | Ask people who generate audio whether the flaw vocabulary is a problem they have | **OPEN, owner's to run.** The audience claim rests on a positioning decision and one negative data point |

## Owner actions, carried

- **GitHub Support** — the ticket is submitted; the reply has not been read. What to look for: confirmation
  that cached views of the pre-rewrite history are purged. **That sentence is what releases the four
  backup refs** (one branch, three tags). Until then: never `git push --force --mirror origin`.
- **GitHub Pages** — enabled, live at `sw4127.github.io/standard-of-taste`.
- **The engine package** — recommended CUT, not done, and not to be done without a fresh ruling.
- **RT-Z6** — closed as moot: the retention window mattered when each deployment stored 154 MB of
  audio, and `public/` is now 35 KB.
