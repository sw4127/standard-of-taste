# Architecture — The Taste Gym

A web instrument that **measures taste** against David Hume's *Of the Standard of Taste* (1757).
Three of Hume's five criteria have working instruments; two do not, and the product says so rather
than implying a door that is not there.

It is aimed at people making music with AI tools: the recurring problem is that a generation sounds
*wrong* in a way you cannot name, so you regenerate blind. Each instrument measures one kind of
damage and returns it in language and in physical units — cents, milliseconds, kilobits per second.

Decisions of record: `restructuring_decision_memo_2026-07-11.md` (D1–D6, N1–N3), then the **D4
amendment in `CLAUDE.md`** — *there is no paid tier*; the training arc is free and gated only by a
7-day per-family retest cooldown, which is a validity gate, not a revenue gate. Then
`docs/rt-answers-2026-07-11.md` and `docs/launch-checklist.md`. The published reasoning, including
the refusals and what they cost, is at `/method`.

## Design principles (load-bearing)

1. **The engine measures; nothing narrates it into existence.** Every displayed number is arithmetic
   over the user's raw taps, computed in pure TypeScript (`src/engine/`). Zero LLM calls anywhere in
   the instrument. The plain-language sentences are **deterministic templates**, not generated prose,
   so identical results produce identical sentences and share links still recompute. (D2/D6.)
2. **You are your own control.** Blind-vs-labeled re-rating needs no external ground truth, and the
   delicacy contrast compares a person against *themselves* across flaw families — ground truth from
   known stimulus parameters, so it needs no cohort. Some labels are deliberately false, so movement
   toward a *lie* is causally clean bias. A **mandatory debrief** discloses every swap with true
   attribution before anything is shared.
3. **Honesty as architecture (N3).** Share URLs carry *raw answers*, never conclusions — the result
   page and OG card **recompute** on every request, so a forged URL can only show what the engine
   would actually conclude. No percentiles exist until a cohort does. n = 0, so every figure derived
   from simulation is badged `SIMULATED` in the product itself. License proofs are enforced by the
   test suite, not by promises.
4. **No human gate that one person has to perform.** Item quality is decided by measurement
   (Layer A) and by item parameters (Layer B), both below. A gate only the owner can discharge is
   debt: it blocks the work and cannot be run by anyone else.
5. **State: none yet, and device-local when it arrives.** Results live in URLs; sessions are
   self-contained. Persistence was ruled on 2026-09-01 (RT-G) to be **device-local history — no
   accounts, no database, no recurring bill** — and it is *not built*. The 7-day cooldown already
   uses that mechanism. History that lives in one browser can vanish, and the product must say so
   wherever an arc is shown.

## System map

```
src/engine/            Pure deterministic instruments (no content, no I/O)
  bias.ts              Prestige math: signed sway toward labels, swapped-only
                       sub-stats, control-drift correction, swayShare over
                       movable items, strict share codec
  delicacy.ts          Forced-choice scoring + the three degradation families
  staircase*.ts        The adaptive staircase, its manifest, replay and fit
  calibration.ts       Brier score and the over/under-confidence gap
  expert.ts            The verdict-free record behind every result

src/analytics/         Simulation → CTT estimators → 2PL IRT → parameter
                       recovery → automatic item flags. Validated against
                       known parameters BEFORE fielding, which is the honest
                       order. No real responses exist yet.

src/content/bias/      The Prestige pool of record
  items.ts             sixteen short music clips: fourteen carry artist names,
                       two clips carry no label in either pass as drift
                       controls; POOL_VERSION (bump on ANY pool change)
  manifest.json        Sources, SHA-256s, license snapshots, windows
  licenses/            Captured license-proof pages (CI fails if one is missing)
src/content/delicacy/  Eighteen pairs: three practice trials with the answer
                       shown, then fifteen scored pairs
src/content/staircase/ Ladder rungs, families and their units
src/content/vocabulary/  The plain-language layer — templates only
src/content/flaw-families.ts  The three families, named for a creator

src/app/bias/          Hume frame → blind → bridge → labeled → reveal →
                       MANDATORY debrief (swap disclosure + attributions)
  ClipPlayer.tsx       One stimulus seam: real PD/CC audio, 5s min-listen
                       arming ring, media-clock heard-time
src/app/delicacy/      A/B comparison, two-tap machine choice, confidence
src/app/threshold/     The staircase, one family per session
src/app/learn/         The reading room, including /learn/flaws
src/app/lab/           Metric dictionary, instrument health, parameter recovery
src/app/method/        How it was decided, and what was killed

scripts/clip-pipeline/ Content ops: download (SHA-256) → license snapshot →
                       window suggestion → two-pass EBU R128 loudnorm render
                       to −16 LUFS + TASL → validate (Layer A)
packages/hume-taste-engine/  The engine + item schema as a standalone MIT
                             package. Public per RT-F.
```

## The measurement, precisely

**The Prestige Test.** For each item with label direction *d* (up = acclaimed, down = dismissed),
blind rating *b* and labeled rating *l* (0–10 integers, gated by ≥5s of actually-heard audio):

- **towardLabel** = (l − b) if d = up, (b − l) if d = down — movement *in the label's direction*.
- **Headline pct** = mean(towardLabel) / 10, as a signed %, then **corrected by control drift**:
  `adjusted = raw − meanControlDrift · (nUp − nDown) / nScored`. Never a full subtraction.
- **swappedPct** = the same mean over swapped items only — movement toward a *false* label cannot be
  legitimate updating, so this is the causally clean statistic, surfaced at the debrief.
- **swayShare** = fraction of *movable* items (blind rating not already at the scale edge in the
  label's direction) that moved toward the label — the consistency receipt, immune to edge artifacts.
- **edgeCount** is disclosed, not hidden: re-rating the same clips anchors people, so the measured
  sway *understates* the true effect, and the copy says so.

Verdict thresholds are ±15% and **provisional** — they are a reporting convention, not a norm.

**The Delicacy Trials.** Two recordings of one passage, one carrying a defect at a controlled
magnitude. Forced choice, objectively scoreable, then the flaw is named. Confidence is captured per
trial, which yields a calibration curve — Hume's "good sense" as arithmetic rather than assertion.

**The Threshold Test.** An adaptive staircase converging on the smallest defect of one family a
person still reliably detects, reported in physical units. Not a score. This is the deliverable of
record.

## Two-layer item validation, and no ear gate

Both layers replaced human judgment calls that one person had to make by ear and could not make
reliably (2026-08-08).

- **Layer A** — `scripts/clip-pipeline/` measures every damaged clip by log-spectral distance and
  temporal drift against a per-source *transparency anchor* (a 320 kbps round-trip: measurable,
  inaudible). A manipulation must exceed that anchor by a margin to be a fair trial. It also gates
  loudness delta, clipping, dead air and quiet fraction.
- **Layer B** — `src/analytics/` computes classical test theory (difficulty, corrected
  point-biserial discrimination, α/KR-20, split-half) and 2PL IRT with a fixed guessing floor,
  feeding automatic item flags: too easy → stronger rung, too hard → weaker, non-discriminating →
  retire.

`scripts/clip-pipeline/rungs.mjs` is the single source of truth for what "rung N" means per family.
It exists because that table once lived in two places, they silently disagreed, and two of three
families rendered a full rung stronger than their labels.

## What the reader is given

Every result ends in plain-language sentences built from a within-person contrast, and carries a
**verdict-free expert panel** underneath it — the session's own numbers and every trial inside it,
with no interpretation attached. The panel reads from the browser, so a shared link never carries it.

## Dataset (D6)

Every completion emits the full raw response vector — both rating passes, per-item listen durations,
pool id + POOL_VERSION, result hash — to the analytics sink. Raw-first means every future statistic
(IRT calibration, reliability, norms) is retroactively computable. **There are no real responses
yet.**

## Content pipeline & licensing

Audio is public-domain / Creative Commons only, with a paper trail per item: source URL + SHA-256, a
captured license-proof page, and a TASL attribution line rendered at the point of use. The test suite
refuses any non-placeholder item lacking its proofs. Item admission is decided by Layer A, not by
anyone listening — the owner ear-check that once gatekept the pool was abolished on 2026-08-08 and
replaced by measurement. `POOL_VERSION` rides every share URL and dataset event, so old links die
gracefully (redirect, never a wrong number) and stored responses stay interpretable.

## Testing

More than 2,000 tests: engine math including boundary and malformed input, the share codec, pool
contracts, license gates, the voice checks, and a set of guards that hold the public surfaces —
`README.md`, `docs/index.html`, this file and `public/llms*.txt` — to the code they describe.
`npm install` points git at `.githooks/`, so the suite runs before any push.

## Roadmap

1. **The retest arc** — Hume's *practice*. Needs the device-local store ruled in RT-G; compares a
   session against the same person's earlier sessions per family, in comparative sentences, with a
   movement smaller than measurement noise reported as *no change you could hear*.
2. **The Comparison instrument** — Hume's fifth. Needs "breadth" defined in units the product can
   defend before anything is built.
3. **Psychometrics against real responses** — the pipeline is written and validated by recovery; it
   waits on data, and every figure stays badged until that data exists.
