# Blueprint vs Built — 2026-08-25

**For the planning conversation, not for engineering.** `docs/handoff-2026-08-25.md` is the
engineering state; this is the map from what the plan promised to what exists, so a new direction can
be placed against reality. Published as a readable page for the same purpose.

## Hume's five criteria — the plan's spine, a little over half built

| Criterion | Instrument | State |
|---|---|---|
| Freedom from prejudice | The Prestige Test | **live** — 16 clips, control-corrected |
| Delicacy of taste | The Delicacy Trials | **live** — 15 scored pairs, guessing-corrected band |
| Delicacy, measured | The Threshold Test | **live** — adaptive, reports cents / ms / kbps |
| Good sense | Confidence calibration | **computed, not surfaced** — real arithmetic, but a paragraph inside the Delicacy reveal rather than its own score |
| Comparison | Placement trials | **not started** — no route, no code |
| Practice | The retest arc | **not started** — the 7-day cooldown exists, but that is the lock, not the room |

Nothing compares one session to another, so the plan's stated deliverable — *does your ear actually
move* — is not answerable by the product today. The **Taste Index** (five sub-scores + composite)
cannot be assembled.

## The three surfaces

| Surface | Promised | Built |
|---|---|---|
| Floor | assessment, free, no account | **yes** |
| Gym | training arc, free, **account required**, 7-day cooldown | **no arc, no account** |
| Lab | six panels | **three of six** |

**The biggest divergence:** memo §8.1 retired the "no database" rule *because progression requires
accounts and persistent results*, and nothing was built in its place. The cooldown is device-local
(`localStorage`), so it is not a gate; and there is no Gym for it to gate. **Floor and Gym are
currently the same surface.**

Lab panels: metric dictionary ✓ · instrument health ✓ · parameter recovery ✓ (an extra, and the most
credible page on the site) · funnel & cohort ✗ · experiment registry ✗ · data model page ✗.
The three missing are the three a PM/BA/DA reader looks for first.

## Closed by ruling — reopening any is a deliberate act

- **No paid tier**, and no pricing question (D4 amendment). A paywall on the training loop would put
  the honest deliverable behind the wall.
- **No points, streaks, XP or leaderboards** — refused by clause, not debated.
- **No human judging audio** — the PM ear-check was abolished and replaced by measurement (pivot §1).
- **Launch is not a dependency** — marketing optional by design (pivot §0.2).
- **No percentiles until a real cohort exists** — everything simulated is labelled (N3).

Two bear on any commercial direction: **no revenue model by decision**, and **no engagement mechanics
by clause**. Note the paid-tier ruling is narrower than it reads — it forbids charging for the
training loop, not every model.

## Genuinely open

1. **How anyone arrives.** 29 visitors ever. Cards, `/learn`, and a launch kit all exist, unpointed.
2. **Whether the product remembers you.** Accounts sanctioned, never built. Progression, cohorts,
   percentiles and the retest arc all wait on this one decision.
3. **Who it is for.** The AI-music-creator wedge (pivot §5) has no code at all.
4. **How it pays for itself.** Unanswered rather than closed.
5. **What the composite index actually is.** Promised, never specified.

## Constraints any plan must survive

- **Zero real responses.** Every psychometric figure is simulated from a known model and badged.
  The pipeline is validated by parameter recovery; the dataset intended as the asset does not exist.
- **29 real visitors, ever.** Projections from that are fiction; "what would have to be true, and the
  cheapest test for it" is not.
- **Honesty is a hard constraint.** It has already deleted features — six ranked tiers went when they
  placed people correctly only 30.5% of the time, replaced by a wide, unflattering band.

## One engineering observation (input, not direction)

`/learn` and `/lab` — the two surfaces built to attract strangers — both link to the Prestige Test and
nowhere else. The top of the funnel currently leaks into one third of the product. Cheap to fix, and
worth knowing before anyone reasons about traffic.
