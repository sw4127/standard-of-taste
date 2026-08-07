# Artifact Pivot — analytics-first, PM out of the quality loop (of record, 2026-08-07)

Owner-approved direction. Supersedes: the PM ear-pass gates, the launch-dependent KPI path
(docs/endgame-plan-2026-08-07.md schedule), and the "delicacy needs a PM verdict per clip" model.
Unchanged: D1 (evaluate/cultivate taste, no psych prediction), D2 (performance tasks), N3 (honesty).

## 0. The three problems this solves
1. **Wrong gatekeeper.** Ear-passes by a non-musician = unstable labels = no value (PM's own finding).
2. **Marketing dependency.** Resume value cannot be hostage to a launch the owner has no energy to run.
3. **Thin artifact.** "A quiz that works" is not a portfolio piece. A *measured instrument with a
   visible analytics layer* is.

## 1. Kill the human ear gate — replace with computable item validation (D2/D6, N3)
The PM never judges a clip again. Item quality becomes a pipeline, not an opinion:

**Layer A — objective acoustic checks (deterministic, automated):**
integrated loudness (LUFS) delta between pair members ≤ threshold · silence/clipping detection ·
duration bounds · spectral-distance magnitude of the manipulation (quantifies "how big is the
difference" without anyone listening) · a manipulation-strength ladder so each degradation type
ships at 3–4 calibrated intensities.

**Layer B — statistical calibration (the real gate):**
each item's difficulty (P(correct)) and discrimination (point-biserial with total score) are
*estimated from response data*. Acceptance band: difficulty 0.55–0.85, discrimination ≥ 0.20.
Items outside the band auto-flag: too-easy → increase degradation one rung; too-hard → decrease;
non-discriminating → retire. Same logic calibrates the prestige pool (swap items that move nobody
are dead weight; that's now a computed verdict, not a taste judgment).

**PM's remaining role:** approve these *rules* once. Not clips. This is strictly more defensible than
an expert ear — item parameters are the standard of evidence in psychometrics.

## 2. Data policy — labeled synthetic now, real whenever (N3, non-negotiable)
- A simulation module generates responses from a **known** ability/bias/item model.
- The production pipeline runs on those responses and must **recover the known parameters**
  (recovery plots, RMSE of estimates, calibration curves). This validates the pipeline without users.
- Everything synthetic is labeled **SIMULATED** in-app, in charts, in the write-up, in the repo.
  Never a percentile presented to a user as if it came from people who don't exist.
- Real responses, when they arrive, flow through the identical pipeline; the only change is the
  data-source badge. Interview line: *"I validated the estimator by parameter recovery before
  fielding it."*

## 3. Complete Hume's five criteria (the "finish what Hume said" ask)
| Criterion | Instrument | Status / plan |
|---|---|---|
| Freedom from prejudice | Prestige Test | live (control-corrected) |
| Delicacy | Discrimination trials | built; regrade under §1 auto-calibration |
| Good sense | Confidence calibration (95/70/50 → Brier, over/under-confidence) | computed; surface as its own score |
| **Comparison** | **Placement trials** — identify era/tradition/instrumentation of a clip from choices; objectively scoreable from catalog metadata, **zero audio authoring, zero ear judgments** | NEW, small build |
| **Practice** | **Retest arc** — return after ≥7 days via a resume code, re-take, see change in each score; improvement tracked per criterion | NEW, needs the light persistent store (memo §8.1) |
Result: a **Taste Index** = five sub-scores + one composite, each traceable to a measured task.

## 4. The Lab — the actual resume artifact (`/lab`, public, in-app)
A live analytics surface that demonstrates PM/BA/DA/BI skills *visibly*, not in prose:
- **KPI tree & metric dictionary** — every metric defined, formula shown, owner, target (BI semantic-layer signature).
- **Instrument health** — item difficulty/discrimination tables, IRT curves, reliability
  (split-half / alpha), item auto-flags from §1 (DA/stats signature).
- **Calibration & bias distributions** — Brier scores, over/under-confidence, sway distributions.
- **Funnel & cohort view** — entry → completion → share → return, by channel and cohort (PM signature).
- **Experiment registry** — pre-registered hypotheses, variants, stopping rules, results, decisions
  (PM/DA signature; run the first experiment on synthetic traffic and label it a dry run).
- **Data model page** — ERD + event schema + pipeline diagram (DA/BI signature).
- Every panel carries a data-source badge: SIMULATED / REAL / MIXED.

## 5. AI-music-creator wedge — both audiences, one honest claim (N1 brand, no D1 amendment)
Framing: delicacy trials are **artifact-detection training** — the exact skill needed to judge
AI-generated audio (compression smear, timing wobble, tonal drift are precisely what generators
produce). Ship: a creator-facing landing page + a "Producer's Ear" preset of the delicacy battery +
a results panel phrased in production vocabulary. Claim allowed: *"measure and train the ear you
evaluate your generations with."* Claim forbidden: any promise that a score improves prompt output.
No tool-operation teaching (D1 intact).

## 6. Non-goals
Launch/marketing campaigns (optional, never a dependency) · pricing/paid tier · new audio
manipulation research · anything requiring the PM to judge music.
