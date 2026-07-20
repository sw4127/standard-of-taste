# Delicacy Ear Pass — PM Handbook (S6 gate, 2026-07-19)

The ear pass is the **audibility gate** the objective pipeline cannot provide: every candidate
pair passed duration/loudness/true-peak/determinism checks, but only an ear can confirm the
degradation is *hearable, fair, and at roughly the intended difficulty*. Your verdicts are
recorded in `src/content/delicacy/manifest.json` (`earPass` per pair) and gate the pool-of-record
version bump — nothing ships on machine checks alone (N3).

## Setup (5 minutes)

- **Headphones, quiet room, one sitting.** The instrument assumes headphone listening
  ("headphones strongly advised" is in the flow copy); judge under the same conditions.
- Moderate, fixed volume — set it on the first clip and don't touch it again (loudness is
  normalized; if one side ever feels louder, that itself is a FLAG).
- Files: `public/audio/delicacy/d1-a.mp3 … d6-b.mp3` (or run the flow at `localhost:3000/delicacy`,
  which is now wired to these candidates).
- Have the answer key (below, or `node -e` from the manifest) **covered** for phase 1.

## Phase 1 — blind run (the real test, ~10 min)

Play each pair the way a user would: A in full, B in full, replay freely. For each pair write down:

1. **Pick:** which side is the original?
2. **Flaw:** which family (pitch drift / timing warble / crushed detail)?
3. **Confidence:** 95 / 70 / 50.
4. **Time-to-tell:** roughly when in the clip you first heard it (start / middle / only-by-the-end / never).

Do all six before opening the key. Don't skip pairs you find hard — "hard" is data.

## Phase 2 — informed listen (~10 min)

Open the key. For each pair, now knowing the answer, listen again and rate:

- **Audibility once known:** (a) obvious, (b) findable with effort, (c) barely there even when
  told, (d) cannot hear it at all.
- **Tells check:** is there any NON-musical giveaway (level jump, click, silence tail, different
  start/end point)? Any = FLAG regardless of your pick.
- **Window quality:** is the excerpt musically presentable (no dead air, no speech, no fade)?

## Verdicts (what I record per pair)

| Verdict | Meaning | Criterion |
|---|---|---|
| **PASS** | ships in pool v1 | You (or a motivated listener) could find it; no tells; window OK |
| **RETUNE** | right idea, wrong strength | m1 you can't hear even informed (phase 2 = d), or "subtle" that's actually obvious — I adjust magnitude params and re-render |
| **VETO** | pair unusable | Tell present, window bad, or degradation changes the music's character so much it's not a "flaw" anymore |

Decision rules, pre-registered so we don't rationalize afterwards:
- Phase 2 = (d) ⇒ **RETUNE** no matter what phase 1 said (an unfindable answer is an unfair item).
- Phase 2 = (a) on a magnitude-1 item ⇒ **RETUNE** (that slot is supposed to be the hard one).
- Any tell ⇒ **VETO** of that render (usually fixable — flag it and I fix the pipeline).
- Your phase-1 *miss* does NOT veto a pair by itself — one listener missing a fair item is signal
  about difficulty, not fairness. Pair it with phase 2: missed-but-(b) is a healthy hard item.

## What to send back

One line per pair is enough:

```
d1: PASS — caught it, pitch, 70; phase2 (b); heard it ~12s in
d4: RETUNE — never heard it blind; phase2 (d) even informed
d6: VETO — right channel clicks at the join, dead giveaway
```

Plus one overall note: session length felt OK / too long, and any pair whose MUSIC you'd reject
(boring window) independent of the science.

## Answer key (cover until phase 2)

Run: `node -e "const m=require('./src/content/delicacy/manifest.json');for(const p of m.pairs)console.log(p.id, 'original='+p.originalSide, p.family, 'm'+p.magnitude, JSON.stringify(p.params))"`
