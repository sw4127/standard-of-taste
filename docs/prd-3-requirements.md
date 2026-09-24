# PRD — Part 3: functional requirements and non-goals

**Status: part 3 of 4, revised against the blueprint on 2026-09-23.** Part 1 is
`docs/prd-1-use-cases.md` (the use cases, UC-1 to UC-15); part 2 is `docs/prd-2-features.md`;
part 4 is `docs/prd-4-screens.md`. Brief: `docs/task-prd.md`.

**This is the part engineering and QA read.** Every requirement names the exported symbol that
implements it, so a reader can check the claim instead of trusting it: `prd-requirements.test.ts`
opens each file and fails if a cited symbol is not exported. That is criterion 3 of the brief, and it
is the reason a PRD written *after* the build is worth more than one written before.

**It tells engineering what, never how.** Architecture, module boundaries and tooling belong to the
engineering design document; `ARCHITECTURE.md` is the closest thing that exists.

**The order follows part 1.** The reading is the product (BA-6), so its requirements come first,
FR-1 to FR-10. The hearing section follows, FR-11 to FR-18. `prd-numbering.test.ts` fails if the
first requirement stops serving the core, or if any use case in part 1 has no requirement.

---

# The reading

## FR-1 · The lines, computed from plays

| | |
|---|---|
| **Serves** | UC-1 (EVIDENCED), UC-2 (ASSUMED), UC-4 (EVIDENCED) |
| **Computed by** | `allFacts`, `pickFacts`, `STRENGTH_FLOOR`, `MIN_LINES`, `MAX_LINES` in `src/engine/reading/patterns.ts` |
| **Assembled by** | `readingFor` in `src/content/reading/reading.ts` |
| **Plays from** | `generatePlays`, `DAYS` in `src/engine/reading/generate.ts` |

- **FR-1.1** A reading is computed from four weeks of a listener's plays and the pool of tracks they
  come from. It never reads the habits that generated the plays, because a reading that did would be
  reading its own answer key.
- **FR-1.2** Five patterns can become lines: how much listening piles onto a few tracks, how much
  happens late at night, how much is new, how the sound drifted from week one to week four, and how
  fast new tracks were abandoned. The last three are what the listener is reaching for now (UC-4,
  BP-CA1).
- **FR-1.3** Each pattern has a strength, measured against a baseline inside the same listening: an
  even spread over the tracks heard, over the clock, or between new and known. **Strength decides
  which lines are shown and is never displayed.** It is not a comparison with other listeners;
  there are none (N3).
- **FR-1.4** A reading shows three or four lines: every pattern whose strength reaches the floor,
  strongest first, up to four. If fewer than three reach it, the three strongest.
- **FR-1.5** The same listener always produces the same plays and the same lines, so a reviewer can
  check a receipt and a test can recompute it.

**QA boundaries.** Fewer than three patterns reach the floor · fewer than four first listens, so the
abandonment pattern has no strength · two sounds tie for the most new tracks kept, so no sound is
named · a listener whose plays cover fewer than three distinct tracks.

## FR-2 · Receipts

| | |
|---|---|
| **Serves** | UC-2 (ASSUMED) |
| **Implemented by** | `readingLine` in `src/content/reading/lines.ts` |

- **FR-2.1** Every line carries a receipt: the count behind the pattern, in words, and the plays
  that produced it.
- **FR-2.2** The plays open under the line on request ("Show the plays"), each marked kept or
  abandoned inside 30 seconds where that is what the line counts.
- **FR-2.3** A receipt lists exactly the plays its pattern counted, never a sample. This is the
  reply to the Barnum objection (BP-ARG-REPLY): a line that points at specific plays is true of this
  listening and not of everyone.

## FR-3 · Arguing with a line: the register

| | |
|---|---|
| **Serves** | UC-3 (ASSUMED) |
| **Implemented by** | `patternBreaches`, `offerBreaches`, `FEELING_WORDS` in `src/content/register.ts` |
| **Carve-out** | `carveOutBreaches`, `CARVE_OUT_PATTERNS` in `src/content/carve-out.ts` |
| **Third choice** | `NEITHER` in `src/content/reading/lines.ts` |

- **FR-3.1** Every line has three parts: the pattern, its receipt, and two offered readings of what
  it might mean.
- **FR-3.2** **The pattern names no feeling.** It says what the plays show: how many, when, which.
- **FR-3.3** Each offered reading is a question. There are two because the same pattern can come
  from opposite feelings (BP-ARG-S1), and "Neither" is always the third choice. The reader supplies
  the feeling; the product never asserts one (BA-3).
- **FR-3.4** Any line can be rejected and put back.
- **FR-3.5** No template, offer or prompt word asserts anything about trauma, abuse or mental
  health (the carve-out, RT-Z10 a, BA-5).
- **FR-3.6** No line compares the listener with anyone: no percentile, no "most listeners" (N3).

**QA boundaries.** `lines.test.ts` runs every check over every line on all three listeners, and
proves each check bites with planted specimens · a pattern sentence containing a feeling word · an offer that does not end in a question
mark · every combination of choices on every listener, checked against the carve-out.

## FR-4 · The prompt

| | |
|---|---|
| **Serves** | UC-5 (ASSUMED) |
| **Computed by** | `buildPrompt`, `EMPTY_STATE`, `FAMILY_LABEL` in `src/content/reading/prompt.ts` |

- **FR-4.1** The prompt is built only from what survived the argument. A rejected line contributes
  nothing.
- **FR-4.2** Each kept line contributes the sound of its tracks and one direction of its own, so
  **rejecting any line changes the prompt.** The first build broke this: two lines about the same
  sound could be rejected without the prompt moving.
- **FR-4.3** A chosen reading contributes its words to the prompt's mood. "Neither", or no choice
  yet, contributes none.
- **FR-4.4** The sound is grouped by the three flaw families the hearing tests measure: tuning,
  timing and fidelity (BP-BRIDGE; fidelity, not dynamic range, since 2026-09-24: the third family is
  codec damage in kbps).
- **FR-4.5** The prompt uses generic generator vocabulary and names no generator (RT-Z8 a).
- **FR-4.6** If every line is rejected, the prompt is empty and the screen says so, rather than
  showing a blank box.
- **FR-4.7** The prompt can be copied. Without clipboard permission it stays selectable text.

**QA boundaries.** Every line rejected · no reading chosen · every reading "neither" · (a) and (b)
chosen on the same line in turn, which must give different prompts.

## FR-5 · The reader's choices, kept for one tab

| | |
|---|---|
| **Serves** | UC-3 (ASSUMED) |
| **Implemented by** | `loadState`, `saveState`, `READING_STATE_KEY` in `src/content/reading/state.ts` |

- **FR-5.1** Rejections and choices are kept in the tab's session storage, so a reader who follows
  the bridge to a hearing test and comes back finds their argument where they left it. Nothing
  outlives the tab.
- **FR-5.2** Stored state is validated when read; anything malformed is dropped rather than trusted.
- **FR-5.3** Where storage is unavailable (a private window, blocked site data), the page still
  works and starts empty.
- **FR-5.4** Each step has its own address (`?l=…&step=prompt`, `&step=create`), so the browser's
  Back button walks back through the flow instead of leaving it.

**QA boundaries.** A hard reload on the prompt step · a stored value that is not valid JSON · storage
that throws on every call.

## FR-6 · The bridge to the hearing section

| | |
|---|---|
| **Serves** | UC-6 (ASSUMED) |
| **Computed by** | `promptCard` in `src/engine/prompt-card.ts` |
| **Recalled by** | `recallThreshold` in `src/lib/result-recall.ts` |

- **FR-6.1** Each flaw family's prompt words are marked "you can hear this" or "at your threshold
  you may not tell" **only from a Threshold sitting stored on this device.**
- **FR-6.2** With no stored sitting, or a stored sitting that cannot be read, no mark is shown. No
  mark means no claim, never a default claim.
- **FR-6.3** The screen says the marks come from this browser and vanish on another device, and it
  links to the Threshold test.

## FR-7 · The mock creation screen

| | |
|---|---|
| **Serves** | UC-5 (ASSUMED) |
| **Implemented by** | `CREATE_LABEL`, `GENERATE_NOTE`, `HOST_NAME` in `src/content/reading/copy.ts` |

- **FR-7.1** The prompt arrives in the creation field of a fictional streaming host, Tessavox.
- **FR-7.2** The screen is labelled as an illustrative mock of a fictional company, and "Generate"
  generates nothing and says so (BA-11).
- **FR-7.3** The host, every artist and every track are fictional, and each name was checked
  against real ones before it shipped (`docs/reading-names-check-2026-09-23.md`; BA-8, BA-9).

## FR-8 · The listeners and the front door

| | |
|---|---|
| **Serves** | UC-14 (ASSUMED), UC-15 (ASSUMED) |
| **Implemented by** | `LISTENERS`, `LISTENER_LABEL` in `src/content/reading/listeners.ts` |
| **Statement** | `READING_STATEMENT` in `src/content/reading/statement.ts` |

- **FR-8.1** Three illustrative listeners, each shown as a card on `/` and on the reading's picker,
  each carrying the listener label.
- **FR-8.2** The first thing a visitor can act on in the body of `/` is a listener card, and the
  creation screen is **at most three taps** from `/`, at phone and desktop widths. Measured in
  part 4.
- **FR-8.3** `/reading` states on the page what it does, in the words of CLAUDE.md's third-surface
  amendment, verbatim; `statement.test.ts` fails the build on any other wording.

## FR-9 · The Company view

| | |
|---|---|
| **Serves** | UC-13 (ASSUMED) |
| **Computed by** | `perArm`, `PLAN`, `ASSUMPTIONS` in `src/content/company/plan.ts` |
| **Implemented by** | `COMPANY_LABEL`, `NORTH_STAR`, `GUARDRAILS`, `KILL_LINES`, `STAKEHOLDERS` in `src/content/company/copy.ts` |

- **FR-9.1** `/company` is labelled at the top as illustrative: a fictional company, nothing
  measured.
- **FR-9.2** It states a metric tree: one north-star metric, supporting metrics and guardrails, each
  with its definition and its reason.
- **FR-9.3** The test's sample size is **computed** from stated planning assumptions, each with its
  reason, and shown at other baselines too, so no single guess carries the plan. It is never typed.
- **FR-9.4** It states the result that would kill the feature.
- **FR-9.5** Each stakeholder note answers the question its department would ask; where an answer
  rests on an outside event, it cites the source and its date.

## FR-10 · The argument

| | |
|---|---|
| **Serves** | UC-12 (ASSUMED) |
| **Rendered from** | `BP_ARG`, `BP_ARG_DEFENCE` in `src/content/blueprint.ts` |

- **FR-10.1** The argument is rendered from `docs/blueprint.md`, on `/reading` and at `/learn/why`,
  never copied into a page, so it cannot drift from the canonical text.
- **FR-10.2** Each premise and inference shows what supports it: evidenced, assumed, or inferred.
- **FR-10.3** On both pages the strongest objection is stated with its reply, and the one objection
  with no full answer is held open (BP-ARG-OPEN). `/learn/why` also names the weakest step
  (BP-ARG-WEAK); on `/reading` it shows only as the one premise labelled assumed.

---

# The hearing section

The four tests are unchanged by the blueprint build (D3 amendment). They are reached from the
prompt through the bridge (FR-6) and from the hearing section of `/`.

## FR-11 · The Prestige Test: freedom from prejudice

| | |
|---|---|
| **Serves** | UC-8 (ASSUMED) |
| **Computed by** | `computeBiasResult`, `BIAS_SCALE_MIN`, `BIAS_SCALE_MAX` in `src/engine/bias.ts` |

- **FR-11.1** A sitting presents every clip twice: once with no artist attached, once with one. The
  labelled pass asks a differently worded question, so a remembered number does not answer it.
- **FR-11.2** Ratings are integers on a fixed scale. `BIAS_SCALE_MIN` and `BIAS_SCALE_MAX` are the
  only definition of its ends; no surface may state them independently.
- **FR-11.3** A fixed number of clips carry no label in either pass. Their movement between passes
  is drift (memory, regression, fatigue) and is subtracted from the labelled movement.
- **FR-11.4** Some labels are false. Every deception is disclosed on a debrief the sitting cannot
  skip.
- **FR-11.5** The verdict is a signed percentage. A negative result means ratings moved away from
  the labels; it is a different outcome, not a worse one. Thresholds: `BIAS_SWAYED_AT`,
  `BIAS_CONTRARIAN_AT`.
- **FR-11.6** Where no rating had room to move toward its label, the engine refuses a reading and no
  surface may print a verdict. The screen says so.

**QA boundaries.** Every clip at the top of the scale when blind · every clip at the bottom · zero
movement · only control clips moved · a signed result of exactly zero.

## FR-12 · The Delicacy Trials: delicacy of taste

| | |
|---|---|
| **Serves** | UC-6 (ASSUMED) |
| **Computed by** | `computeDelicacyResult`, `detectionBand` in `src/engine/delicacy.ts` |

- **FR-12.1** Each trial is two renderings of one passage, one carrying damage at a calibrated size.
  The listener picks the original, then names the flaw.
- **FR-12.2** Practice trials show the answer. Scored trials do not, and the two counts are separate.
- **FR-12.3** A two-way choice gives half the score away by chance. The result reports a detection
  band corrected for chance (`DELICACY_CHANCE`) and **never a rank**. Six ranked tiers were built
  and removed after placing listeners correctly 30.5% of the time.
- **FR-12.4** Naming the flaw is scored against `FLAW_CHANCE`, one over the number of families, not
  against a coin.
- **FR-12.5** Where a session cannot support a per-family split, the screen says so and shows the
  arithmetic. It may not invent a breakdown.

**QA boundaries.** 0 of 15 · 15 of 15 · exactly at chance · 1 of 1 caught, where singular and plural
share one sentence · a session that caught nothing, so the naming question was never reached.

## FR-13 · The Threshold staircase: delicacy, measured

| | |
|---|---|
| **Serves** | UC-6 (ASSUMED) |
| **Computed by** | `startStaircase`, `recordResponse`, `estimateThreshold` in `src/engine/staircase.ts` |

- **FR-13.1** Damage decreases after a correct answer and increases after a wrong one, converging on
  the smallest level the listener still catches.
- **FR-13.2** The result is reported in physical units (cents, milliseconds, kbps) and **never as a
  score**.
- **FR-13.3** Where the run never established both a caught level and a missed level, the result
  says which half is missing rather than interpolating one.
- **FR-13.4** A result stored on the device feeds the bridge marks on the reading's prompt (FR-6).

**QA boundaries.** Every answer correct · every answer wrong · a reversal at the first rung · a run
stopped at either end of the ladder.

## FR-14 · The Ranking Test: comparison, heard

| | |
|---|---|
| **Serves** | UC-9 (ASSUMED) |
| **Computed by** | `computeSpreadResult` in `src/engine/spread.ts` |

- **FR-14.1** Works a published critic ranked are rated blind, with no ranking shown.
- **FR-14.2** The result reports how far apart the listener's ratings fell on pairs the critic
  separated, beside the same figure on pairs he grouped together.
- **FR-14.3** **Agreement with the critic is never scored and cannot be computed.** Only the
  distance between his positions was imported, never their order. A product measuring how far a
  famous name moves a listener cannot also give credit for agreeing with a famous critic. That
  refusal has exactly one wording, in `src/content/critic-refusal.ts`, and a test refuses a second.

## FR-15 · Confidence calibration: good sense

| | |
|---|---|
| **Serves** | UC-6 (ASSUMED), as a second reading of the Delicacy responses |
| **Computed by** | `computeCalibration`, `BRIER_COIN_FLIP`, `MIN_BIN_N` in `src/engine/calibration.ts` |

- **FR-15.1** Every scored Delicacy answer carries a claimed confidence from a fixed set,
  `DELICACY_CONFIDENCE_LEVELS`.
- **FR-15.2** Scored by Brier against `BRIER_COIN_FLIP`, and by the gap between claimed and delivered
  accuracy.
- **FR-15.3** A bin with fewer than `MIN_BIN_N` observations is not displayed as a rate. The floor is
  a constant, not a judgment made per screen.

## FR-16 · The retest arc: practice

| | |
|---|---|
| **Serves** | UC-10 (ASSUMED) |
| **Computed by** | `ARC_FLOORS` in `src/engine/arc.ts` |

- **FR-16.1** A second sitting on the same device is compared with the first.
- **FR-16.2** A difference smaller than the test's own run-to-run wobble is reported as **no
  change**, not as progress. The floor is measured before the comparison is written.
- **FR-16.3** "No change you could hear" must be reachable and must render correctly. Most retests
  produce it, and it is the honest answer rather than a failure state.

## FR-17 · Every result, and every flaw, in words

| | |
|---|---|
| **Serves** | UC-7 (EVIDENCED), UC-11 (ASSUMED) |
| **Implemented by** | `src/content/vocabulary/`, enumerated in `docs/copy-deck.md` |
| **Reading room** | `LEARN_PAGES`, `learnPage` in `src/content/learn.ts` |

- **FR-17.1** Every hearing result ends in sentences, not units, built from fixed templates.
  Identical results produce identical sentences.
- **FR-17.2** Comparative statements are within one person: the reader's sharpest flaw family
  against their dullest. That is ground truth from known stimulus settings and needs no cohort.
- **FR-17.3** `/learn/flaws` says what each flaw family is called and what it sounds like, and
  `/learn` says what each of Hume's criteria means and which test measures it.

## FR-18 · Sharing and persistence

| | |
|---|---|
| **Serves** | UC-6 (ASSUMED), UC-8 (ASSUMED), UC-10 (ASSUMED) |
| **Share codec** | `encodeBiasRatings`, `decodeBiasRatings` in `src/engine/bias.ts` |
| **Share codec, Delicacy** | `encodeDelicacyResponses`, `decodeDelicacyResponses` in `src/engine/delicacy.ts` |

- **FR-18.1** A share address carries the raw answers, never the conclusion, and every surface
  recomputes from them. A forged address can only display what the engine would genuinely conclude.
- **FR-18.2** Results are stored on the device that produced them. There are no accounts.
- **FR-18.3** The expert panel is read from local storage, so a shared link carries none of it.
- **FR-18.4** A person can clear what the device holds, from a control they can find.

---

## Non-goals

Assembled from the seven refusals on `/method`, the falsified registry and the blueprint rulings
(BA-1 to BA-12), not argued fresh here.

| Not built | Why, in one line |
|---|---|
| A model writing any sentence a visitor reads | Templates only (BA-10); `src/app/no-model-text.test.ts` fails the build if a page reaches a model client |
| A reading of a real listener's account | The prototype is never distributed (BP-GOAL); the reading runs on three illustrative listeners (BA-8) |
| A real artist, track or brand on any mock | Every name is fictional and checked (BA-8, BA-9) |
| Generated audio | The creation screen is a labelled mock (BA-11) |
| A sentence telling the reader what they feel | The same pattern can come from opposite feelings (BA-3, BP-ARG-S1) |
| Questions asking people to describe their own taste | Almost nobody can (BP-CA2); the snack that asked them was retired (BA-7) |
| A composite Taste Index | Five incommensurable units need a weighting nobody can justify at n = 0 |
| A five-facet picture of the result | Most facets dark for most readers is a completion meter |
| Ranked verdict tiers | Measured at 30.5% correct placement, and removed |
| A paid tier | Withdrawn; charging for the training loop would wall off the one honest question |
| A human ear check on clips | Replaced by acoustic measurement, because an opinion is not item evidence |
| Any score of agreement with a critic | Cannot be computed from what was imported, and contradicts FR-11 |
| A seeded cohort | A friends-sized sample sits below the noisy end of the pipeline's own recovery sweep |
| Track recommendation | Needs a licensed catalogue the audio rule forbids |
| A fifth instrument, to turn preference into words | Costed at 84 pairs and 84 minutes, and killed (RT-3 a); `/method`'s seventh refusal |

## Constraints that bind every requirement

- **D1, scoped.** Every hearing result is about the performance, never the person. D1 is suspended
  by name on `/reading` only (CLAUDE.md, "D1 amendment, third surface"), and there BA-3's register
  governs instead: a line names a pattern and offers what it might mean.
- **BA-10.** No model writes any sentence a visitor reads.
- **N3.** No cohort, no percentile, no comparison between people. Zero respondents.
- **BP-GOAL.** Never distributed. Every simulated user, metric and stakeholder is labelled on the
  screen that shows it.
- **The anti-clone clause** (CLAUDE.md, D4 amendment). Never a leaderboard, XP, streaks, or points.
- **Audio.** Public-domain or Creative Commons only, damaged by this project's own signal processing,
  with licence proof and a source hash enforced by test.
- **No transfer claim.** Whether any of this improves what a person makes is unmeasured, and is not
  claimed.
