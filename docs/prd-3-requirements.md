# PRD — Part 3: functional requirements and non-goals

**Status: slice 3 of 4.** Parts 1 and 2: `docs/prd-1-use-cases.md`, `docs/prd-2-features.md`.
Brief: `docs/task-prd.md`.

**This is the part engineering and QA read.** Every requirement names the exported symbol that
implements it, so a reader can check the claim instead of trusting it — `prd-requirements.test.ts`
opens each file and fails if a cited symbol is not exported. That is criterion 3 of the brief, and it
is the whole reason a PRD written *after* the build is worth more than one written before.

**It tells engineering what, never how.** Architecture, module boundaries and tooling belong to the
engineering design document; `ARCHITECTURE.md` is the closest thing that exists.

---

## FR-1 · The Prestige Test — freedom from prejudice

| | |
|---|---|
| **Serves** | UC-1 (EVIDENCED) |
| **Computed by** | `computeBiasResult` in `src/engine/bias.ts` |

- **FR-1.1** A sitting presents every clip twice: once with no artist attached, once with one. The
  labelled pass asks a differently-worded question, because a remembered number would otherwise
  answer the question in front of the rater.
- **FR-1.2** Ratings are integers on a fixed scale. `BIAS_SCALE_MIN` and `BIAS_SCALE_MAX` are the
  only definition of its ends; no surface may state them independently.
- **FR-1.3** A fixed number of clips carry no label in either pass. Their movement between passes is
  drift — memory, regression, fatigue — and is subtracted from the labelled movement.
- **FR-1.4** Some labels are false. Every deception is disclosed on a debrief the sitting cannot
  skip.
- **FR-1.5** The verdict is a signed percentage. A negative result means ratings moved AWAY from the
  labels and is a different outcome, not a worse one. Thresholds: `BIAS_SWAYED_AT`,
  `BIAS_CONTRARIAN_AT`.
- **FR-1.6** Where no rating had room to move toward its label, the engine REFUSES a reading and no
  surface may print a verdict. The screen says so.

**QA boundaries.** Every clip at the scale's ceiling blind · every clip at its floor · zero movement ·
only control clips moved · a signed result of exactly zero.

## FR-2 · The Delicacy Trials — delicacy of taste

| | |
|---|---|
| **Serves** | UC-2 (ASSUMED) |
| **Computed by** | `computeDelicacyResult`, `detectionBand` in `src/engine/delicacy.ts` |

- **FR-2.1** Each trial is two renderings of one passage, one carrying damage at a calibrated
  magnitude. The listener picks the original, then names the flaw.
- **FR-2.2** Practice trials show the answer. Scored trials do not, and the two counts are separate.
- **FR-2.3** A two-way choice hands out half the score for free. The result reports a detection band
  corrected for chance — `DELICACY_CHANCE` — and **never a rank**. Six ranked tiers were built and
  killed at 30.5% correct placement.
- **FR-2.4** Naming the flaw is scored against `FLAW_CHANCE`, the reciprocal of the family count, not
  against a coin.
- **FR-2.5** Where the session cannot support a per-family split, the screen says so and shows the
  arithmetic. It may not invent a breakdown.

**QA boundaries.** 0 of 15 · 15 of 15 · exactly at chance · 1 of 1 caught, where singular and plural
share one sentence · a session that caught nothing, so the naming question was never reached.

## FR-3 · The Threshold staircase — delicacy, measured

| | |
|---|---|
| **Serves** | UC-3 (ASSUMED) |
| **Computed by** | `startStaircase`, `recordResponse`, `estimateThreshold` in `src/engine/staircase.ts` |

- **FR-3.1** Damage decreases after a correct answer and increases after a wrong one, converging on
  the smallest level the listener still catches.
- **FR-3.2** The result is reported in physical units — cents, milliseconds, kbps — and **never as a
  score**.
- **FR-3.3** Where the run never established both a caught level and a missed level, the result says
  which half is missing rather than interpolating one.

**QA boundaries.** Every answer correct · every answer wrong · a reversal at the first rung · a run
censored at either end of the ladder.

## FR-4 · The Ranking Test — comparison, heard

| | |
|---|---|
| **Serves** | UC-4 (ASSUMED) |
| **Computed by** | `computeSpreadResult` in `src/engine/spread.ts` |

- **FR-4.1** Works a published critic ranked are rated blind, with no ranking shown.
- **FR-4.2** The result reports how far apart the listener's ratings fell on pairs the critic
  separated, beside the same figure on pairs he bracketed together.
- **FR-4.3** **Agreement with the critic is never scored and cannot be computed.** Only the distance
  between his positions was imported, never their order. A product measuring how far a famous name
  moves a listener cannot also give credit for agreeing with a famous critic — that refusal has
  exactly one wording, in `src/content/critic-refusal.ts`, and a test refuses a second.

## FR-5 · Confidence calibration — good sense

| | |
|---|---|
| **Serves** | UC-1 and UC-2, as a second reading over the same responses |
| **Computed by** | `computeCalibration` in `src/engine/calibration.ts` |

- **FR-5.1** Every scored answer carries a claimed confidence from a fixed set,
  `DELICACY_CONFIDENCE_LEVELS`.
- **FR-5.2** Scored by Brier against `BRIER_COIN_FLIP`, and by the gap between claimed and delivered
  accuracy.
- **FR-5.3** A bin with fewer than `MIN_BIN_N` observations is not displayed as a rate. The floor is
  a constant, not a judgment made per screen.

## FR-6 · The retest arc — practice

| | |
|---|---|
| **Serves** | UC-5 (EVIDENCED) |
| **Computed by** | `src/engine/arc.ts`, floors in `ARC_FLOORS` |

- **FR-6.1** A second sitting on the same device is compared against the first.
- **FR-6.2** A difference smaller than the instrument's own run-to-run wobble is reported as **no
  change**, not as progress. The floor is measured before the comparison is written.
- **FR-6.3** "No change you could hear" must be reachable and must render correctly. Most retests
  produce it, and that is the honest answer rather than a failure state.

## FR-7 · Every result, in language

| | |
|---|---|
| **Serves** | UC-8 (EVIDENCED) |
| **Implemented by** | `src/content/vocabulary/`, enumerated in `docs/copy-deck.md` |

- **FR-7.1** Every result ends in sentences, not units, generated from deterministic templates.
  Identical results produce identical sentences.
- **FR-7.2** **No language model is involved in any displayed number or verdict.** A model may write
  prose about a pre-computed profile and may never classify.
- **FR-7.3** Comparative statements are within-person — the reader's sharpest flaw family against
  their dullest — which is ground truth from known stimulus parameters and needs no cohort.

## FR-8 · Sharing and persistence

- **FR-8.1** A share URL carries the raw answers, never the conclusion, and every surface recomputes
  from them. A forged URL can only display what the engine would genuinely conclude.
  `encodeBiasRatings` and `decodeBiasRatings`; `encodeDelicacyResponses` and
  `decodeDelicacyResponses`.
- **FR-8.2** Results are stored on the device that produced them. There are no accounts.
- **FR-8.3** The expert panel is read from local storage, so a shared link carries none of it.
- **FR-8.4** A person can clear what the device holds, from a control they can find.

---

## Non-goals

Assembled from the six refusals on `/method` and the falsified registry, not argued fresh here.

| Not built | Why, in one line |
|---|---|
| A composite Taste Index | Five incommensurable units need a weighting nobody can justify at n = 0 |
| A five-facet visual of the result | Most facets dark for most readers is a completion meter |
| Ranked verdict tiers | Measured at 30.5% correct placement, and deleted |
| A paid tier | Withdrawn; charging for the training loop would wall off the one honest question |
| A human ear gate on clips | Replaced by acoustic measurement, because an opinion is not item evidence |
| Any score of agreement with a critic | Cannot be computed from what was imported, and contradicts FR-1 |
| A seeded cohort | A friends-sized sample sits below the noisy end of the pipeline's own recovery sweep |
| Track recommendation | Needs a licensed catalogue the audio rule forbids |
| A sixth instrument | Hume's five have machines. **Held open pending RT-P1**, which may add a preference instrument |

## Constraints that bind every requirement

- **D1** — every sentence is about the performance, never the person.
- **N3** — no cohort, no percentile, no comparison between people. Zero respondents.
- **The anti-clone clause** — never a leaderboard, XP, streaks, points or badges.
- **Audio** — public-domain or Creative Commons only, damaged by this project's own signal
  processing, with licence proof and a source hash enforced by test.
- **No transfer claim** — whether any of this improves what a person makes is unmeasured, and is not
  claimed.
