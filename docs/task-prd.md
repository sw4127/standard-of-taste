# TASK — the PRD

**Queued 2026-09-13 at the owner's instruction, not started.** He is right that it does not fit in
the session that queued it.

**A bullet in a handoff is not a queue.** Four copy batches sat unactioned for weeks in this project
because each new handoff copied the line forward and nobody could tell what "do the copy" meant.
This file is the fix: it says what the document is, who it is for, what makes it done, and where its
raw material already exists.

---

## What it is, and the inversion that makes ours unusual

A PRD describes how customers will interact with a product, specifying the functionality needed to
fulfil a comprehensive set of use cases — every task a customer will complete. It is more detailed
and more formal than a prototype, and it has several audiences at once: engineering, QA, customer
service, sales, product marketing. Each translates it into a plan for their own group. It tells
engineering **what** to build and never **how**; the how belongs in a separate engineering design
document.

**Normally a PRD precedes the build. Ours follows it**, because what exists is a high-fidelity
prototype — a working artifact that corresponds closely to the intended product. That inversion is
the document's single biggest advantage and it should be used deliberately: **every use case can
cite the code that implements it and the test that keeps it true.** A speculative PRD asserts; this
one can point. Nobody reviewing it has to take a word on trust.

## The integrity rule, which is not optional

A PRD normally states user needs. **This product has zero users, and its audience claim rests on a
positioning decision plus one negative data point** — the owner, who uses Suno and reports that
sound quality is not a problem he has. See the README's "Who it's for" and
`docs/preference-mock-2026-09-13.md`.

So **every use case carries one of two labels**:

- **EVIDENCED** — traceable to something real: the two Tidal listener findings, a measured result, a
  shipped behaviour somebody has used.
- **ASSUMED** — a plausible task nobody has confirmed anyone wants.

A PRD that hides which is which would be the most sugar-coated document in this repository, on a
project whose entire differentiator is refusing to do that. Done honestly, the labelling is the
thing a reviewer remembers: most PRDs cannot tell you which of their use cases are guesses.

## Audiences, and what each needs from it

| Audience | What it must give them |
|---|---|
| **Engineering** | Functional requirements precise enough to build from without asking — the frustration named in the brief is a PRD too high-level to act on. For each instrument: inputs, states, transitions, failure modes, what is computed and by which engine function |
| **QA** | Acceptance criteria per use case, and the boundary cases this project has already found the hard way — 0 of 15, 1 of 1, a control clip at the edge of the scale, a session that catches nothing |
| **Customer service** | What the product refuses to say and why, so a complaint about a missing verdict is answerable |
| **Sales / product marketing** | The positioning, the audience claim WITH its status, and what may never be promised: no percentile, no cohort, no leaderboard, no transfer claim |

## Where the raw material already is

Nothing here needs inventing. It needs assembling.

- **Use cases** — the routes under `src/app` are the task list: `/bias`, `/delicacy`, `/threshold`,
  `/spread`, each with a flow, a result and a share path; plus `/learn`, `/lab`, `/method`, `/legal`.
- **Functional behaviour** — `src/engine/` holds every computation as a pure function, and each has
  tests naming its boundary cases.
- **What the product refuses** — `/method`'s five refusals and `/lab/falsified`'s 33 entries. A PRD
  section on non-goals can be assembled from these rather than argued.
- **Copy and states** — `docs/copy-deck.md` enumerates every sentence any surface can render, by id.
- **Constraints** — `CLAUDE.md` (D1-D6, N1-N3), and the anti-clone clause: never a leaderboard, XP,
  streaks or points.

## Wireframes

The product renders, so screenshots serve where a wireframe would. **Capture them after Track N
finishes** — three instrument flows and four result screens are still on the old narrow column, and
images taken now would document a layout that is mid-change. See `docs/queue-of-record.md`.

## Not in scope

- **The engineering design document.** Architecture, module boundaries, language and tooling choices,
  staffing. `ARCHITECTURE.md` is the closest thing that exists and is a separate artifact.
- **Anything that requires a user study.** The labels above handle the gap; inventing research to
  fill it is the one thing this document may not do.

## Done when

1. Every route under `src/app` appears as at least one use case, or is explicitly listed as out of
   scope with a reason.
2. Every use case carries EVIDENCED or ASSUMED, and the ratio is stated in the summary rather than
   buried.
3. Every functional requirement cites the engine function or content module that implements it.
4. The non-goals section is assembled from the five refusals and the falsified registry.
5. A reviewer who has never seen the product can say what it does, who it is for, what it refuses,
   and which parts of that are guesses.

## Size

Multi-session. Suggested slices: (1) the use-case inventory, derived from the routes and labelled;
(2) functional requirements per instrument, with citations; (3) non-goals, constraints and the
audience section; (4) wireframes and assembly.
