# Standard of Taste

**A measurement instrument for aesthetic judgment.** It gives you a number about your own taste that you can be *wrong* about — scored deterministically from what you did, not from what you said about yourself.

**→ [Try it](https://vibe-check-app-sepia.vercel.app)** · [The Lab](https://vibe-check-app-sepia.vercel.app/lab) (the analytics layer, public) · [Reading room](https://vibe-check-app-sepia.vercel.app/learn)

---

In 1757 David Hume argued that taste is not arbitrary, and named five things a real judge needs: freedom from prejudice, delicacy, good sense, comparison, and practice. He never got to measure any of it.

That's the project. Each criterion becomes a **performance task where you can be objectively wrong**, not a questionnaire. It predicts no personality, no mood, no psychological state. It measures whether a famous name moves your ratings, and whether your ears can find damage nobody pointed at.

## The instruments

| Hume's criterion | Instrument | Status |
|---|---|---|
| Freedom from prejudice | **The Prestige Test** — rate 10 clips blind, rate them again with artist names attached. Two carry no label at all, as drift controls; some labels are deliberately false. Your number is the gap. | **live** |
| Delicacy | **The Delicacy Trials** — 18 pairs of clips, one of each quietly damaged (pitch drift, timing smear, or lossy artifacts) at calibrated intensities. Find the original, then name the flaw. 3 practice with answers shown, 15 scored. | **live** |
| Good sense | **Confidence calibration** — every answer carries a claimed confidence; scored by Brier score and over/under-confidence gap. | computed |
| Comparison | Placement trials | not built |
| Practice | Retest arc | not built |

Both live instruments run on **public-domain and Creative Commons audio**, damaged by our own DSP. No licensed music, no copyrighted audio, no album art.

## The part that matters: it refuses to make things up

This is the design constraint the whole codebase is organised around, and the reason a lot of it looks the way it does.

- **The instrument has never been fielded. n = 0.** Nothing here is a percentile, a norm, or a comparison to other people, because there are no other people yet. Where a metric has no defensible target, [the metric dictionary](https://vibe-check-app-sepia.vercel.app/lab) prints *"no defensible target yet"* instead of inventing one.
- **Everything synthetic is badged `SIMULATED`** — in the app, on every chart, in the docs. Responses generated from a known model to validate the estimators are never displayed as if they came from people who don't exist.
- **The estimators were validated by parameter recovery before fielding**, which is the honest order: generate responses from *known* item and ability parameters, estimate as though they were unknown, and measure the error. [See it run](https://vibe-check-app-sepia.vercel.app/lab/recovery).
- **Item difficulty is explicitly uncalibrated** and said so on every surface that touches it. Difficulty is a property of response data, and there is no response data.
- **Zero LLM calls anywhere in the instrument.** Every displayed number is arithmetic over your raw taps, in pure TypeScript.

Findings get published even when they're unflattering. The delicacy pool's reliability under simulation is **α ≈ 0.49 against a 0.70 conventional floor** — Spearman-Brown puts that floor near 44 trials, roughly two and a half times the current length. That sits in the public metric dictionary, next to the metric it undermines, and the figure is pinned by a test against the live pool so it cannot quietly go stale.

## How it's built

**Deterministic scoring.** `src/engine/` computes every number — sway, control drift, accuracy, Brier score — as pure functions over raw ratings. Share URLs carry the *raw answers*, never the conclusion, and the result page and OG card **recompute on every request**. A forged URL can only ever show what the engine would actually conclude.

**Two-layer item validation, no human ear gate.**
- **Layer A** (`scripts/clip-pipeline/`) — objective acoustic measurement. Every damaged clip is measured by log-spectral distance and temporal drift against a per-source *transparency anchor* (a 320 kbps round-trip: measurable, inaudible). A manipulation has to exceed that anchor by a set margin to be a fair trial. Also gates loudness delta, clipping, dead air, and quiet fraction.
- **Layer B** (`src/analytics/`) — classical test theory (difficulty, corrected point-biserial discrimination, α/KR-20, split-half) and 2PL IRT with a fixed guessing floor, feeding automatic item flags: too easy → stronger rung, too hard → weaker, non-discriminating → retire.

Both layers replaced human judgment calls that one person had to make by ear and could not make reliably. Item parameters are the standard of evidence in psychometrics; an opinion is not.

**A calibrated damage ladder.** `scripts/clip-pipeline/rungs.mjs` is the single source of truth for what "rung N" means per degradation family, with the parameter units written down. It exists because that table once lived in two places, they silently disagreed, and two of three families rendered a full rung stronger than their labels — a bug no downstream check could catch, because every check compares audio to what was *rendered*, and the rung label is exactly what no measurement sees.

## Reading the code

| Start here | What's in it |
|---|---|
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Design principles, in more depth than this file |
| [`src/engine/`](src/engine) | The scoring engines — `bias.ts`, `delicacy.ts`, `calibration.ts` |
| [`src/analytics/`](src/analytics) | Simulation → CTT estimators → 2PL IRT → parameter recovery |
| [`scripts/clip-pipeline/`](scripts/clip-pipeline) | Audio toolchain: source, snapshot licences, render, measure, validate |
| [`src/app/lab/`](src/app/lab) | The Lab — metric dictionary, instrument health, recovery plots |
| [`docs/artifact-pivot-2026-08-07.md`](docs/artifact-pivot-2026-08-07.md) | Why the human quality gates were deleted and replaced with code |

The comments are unusually long on purpose. Where a decision looks strange, the file explains what went wrong to make it that way.

## Running it

```bash
npm install
npm run dev
```

```bash
npm test                                        # the suite (1,200+ tests)
node scripts/clip-pipeline/index.mjs validate    # Layer A over every shipped pair
```

`npm install` also points git at `.githooks/`, so the suite runs before any push.

Audio rendering needs `ffmpeg` (vendored via `ffmpeg-static`). Nothing requires an API key to run the instruments — the LLM is used only by legacy narrative routes, never by the measurement path.

## State of play

Deployed, and **never fielded**. Both live instruments work end to end; the analytics pipeline is validated against simulated data and waiting for real responses, which will flow through the identical code with only the data-source badge changing.

In progress: a per-flaw **sensitivity threshold in physical units** — cents of detune, % tempo deviation, kbps — via a deeper damage ladder and an adaptive staircase. That's the real deliverable. A score out of 15 tells you very little; *"you reliably hear pitch drift at 40 cents and miss it at 25"* tells you where your ear actually stops.

## Licensing

Code is this repository's own. All audio is public domain or Creative Commons. Prestige Test sources carry archived licence snapshots under [`src/content/bias/licenses/`](src/content/bias/licenses); delicacy sources carry per-item attribution and licence in [`src/content/delicacy/items.ts`](src/content/delicacy/items.ts). Both are enforced by the test suite rather than by promises. Clips are excerpted, loudness-normalised, and deliberately degraded on one side; attribution is shown in-app at the point of use.
