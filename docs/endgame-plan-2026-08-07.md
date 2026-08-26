# Endgame Plan — 5.5 weeks to 09-15 (dated 2026-08-07)

> **SUPERSEDED IN PART — read this first (added 2026-08-26).**
> `docs/artifact-pivot-2026-08-07.md` explicitly supersedes this document's SCHEDULE and its
> launch-dependent KPI path. The status table below was true on 2026-08-07 and several rows are now
> false in ways that mislead:
>
> - **"PM ear pass" and "PM voice pass" are not outstanding — they were ABOLISHED.** Replacing a human
>   quality gate with measurement is the pivot's central move (§1). Nothing in this product waits on
>   the owner listening to a clip.
> - **The Delicacy Trials are LIVE**, not "S1–S6 built".
> - **The 2026-09-15 deadline is not a live constraint.** The pivot removed marketing/launch as a
>   dependency on purpose (§0.2).
>
> For current state use `docs/handoff-2026-08-26.md`; for planning use
> `docs/blueprint-vs-reality-2026-08-25.md`. Kept unedited below as history.


## Status against the KPI framework (docs/kpis.md)

| Gate | State |
|---|---|
| Instrument 1 (Prestige) live in prod | ✅ shipped, control-corrected, launch assets written |
| Instrument 2 (Delicacy) | 🟡 S1–S6 built; 3 locks left (PM ear pass · PM voice pass · flip slice) |
| Engine repo public | 🟡 approved, flip not executed |
| Write-up published | ❌ page built, not posted; charts need N |
| Psychometrics on real data | ❌ **blocked on N** |
| Interview narratives ×3 | ❌ not started |
| **Tier 2: N ≥ 300 completed sessions** | ❌ **N = 0 — the launch has never run** |

## The one honest finding

**Nothing is blocked by engineering. Everything is blocked by the launch not having happened.**
Three sessions ago the ruling was "post the Prestige Test alone, within 1–2 weeks; delicacy does not
gate the launch." Delicacy got built instead. That is the N2 launch-avoidance pattern, on the record.
With 5.5 weeks left and IRT/calibration analysis needing ~2 weeks of accumulated data, **the posting
window closes around 09-01.** Every week unposted now costs a Tier-1 gate later.

## Schedule (PM acts in bold)

- **Week of 08-07:** triage the local dev issue (prod is verified live — this does not gate posting).
  **POST the Prestige Test on HN (Tue–Thu, 8–10am ET) per docs/launch-post-kit.md**, hold the thread
  3h. 24–48h later: r/samplesize, then r/InternetIsBeautiful. Engine repo flip goes public the same
  day (the post links it).
- **Week of 08-14:** delicacy ear pass + voice pass + flip slice → second beat post ("new machine
  opens") to the same channels; first KPI read on N.
- **Week of 08-21 → 08-31:** monitor N; if N < 100 by 08-24, execute the fallback below. Draft the
  three interview narratives (they do not need N — they need the design decisions, which exist).
- **Week of 09-01 → 09-15:** psychometrics on real data → charts auto-slot into the write-up →
  publish; OSF/SSRN preprint of the methodology; rehearse narratives once against a rubric.

## Fallback if N stays low (N3-honest, decided in advance)
Report the real N with confidence intervals and label norms provisional — a rigorously analyzed n=60
with honest error bars is a *stronger* interview artifact than a padded 300. Supplement with a
recruited calibration cohort (classmates, one course-adjacent ask). Never fabricate or extrapolate.

## Standing rule for the remaining 5.5 weeks
No new instruments, no parking-lot items, no scope additions. Only: launch, data, analysis, write-up,
repo, narratives. Anything else queues behind 09-15.
