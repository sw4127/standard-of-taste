# Voice Spec — the Examiner (RT-4 deliverable, gates cohort recruiting)

Owner: PM. Applies to every user-facing string in the /bias flow, result page, share card, and debrief.
Once copy.ts passes this spec, the deck is LOCKED for the cohort (share-block copy may iterate after).

## The spec (3 lines)

1. **WHO:** The narrator is Hume's examiner — a wry, well-read critic running a modern lab; amused,
   precise, never cruel. Sounds like the person who found the key in the wine cask.
2. **TARGET:** We tease the *judgment*, never the *person*. Every barb must land on a measured datum
   (a number, a gap, a rating move) — never on identity, intelligence, taste-as-worth, or motive.
3. **INTENSITY by surface:** share/challenge (full tease) > verdict/debrief (pointed, the number does
   the punching) > instructions/onboarding (calm, clean, zero snark).

## Three litmus tests for any line
- **Debrief-proof:** could the examiner read it aloud on the debrief screen, true labels revealed, and
  still seem fair? (Kills "out of spite"-class lines — motive attribution fails this.)
- **Datum-anchored:** does the barb cite what was measured? ("Your ratings moved 31%" yes; "you're a
  snob" no.)
- **Ratings-not-you:** swap "you" → "your ratings" — if the sentence stops being true, it was aimed at
  the person, not the judgment. Rewrite.

## Audit of current strings (2026-07-11)

| Surface | Current | Verdict |
|---|---|---|
| swayed | "Label-driven." / "When the names walked in, your standards left with them." | **KEEP** — datum-anchored, debrief-proof, on-voice. |
| steady | "Steady ears." / "The reputations showed up. Your ratings barely looked up." | **KEEP.** |
| contrarian | "Contrarian." / "You heard the acclaim and docked points for it. Different bias — still a bias." | **KEEP, or sharpen (PM pick):** "Acclaim made your ratings drop. That's not immunity — the same lever, pulled the other way." |
| shareText | "My ratings moved +X% when the famous names showed up. Get your number:" | **KEEP** — first-person, datum-led, invites without begging. |
| BiasFlow share block | "…anyone who opens it sees your number recomputed, then gets dared to beat it." | **KEEP with one-word fix:** "beat" is ambiguous (lower is better here). → "…sees your number recomputed — then gets dared to do better blind." |
| Result page (recipient) | "Someone sent you their number?" | **UNIFY the dare motif, keep the softer register (recipient surface = mid intensity):** "Someone sent you their number? They're daring you." |

Ruling on the reported seam: the intensity *difference* between sender and recipient surfaces is
by-design (line 3); the actual defect was diction drift (dare/number motifs not shared). Fixed above.

## Banned moves (from incidents so far)
- Motive attribution ("out of spite", "to look smart") — fails debrief-proof.
- Person-verdicts ("you're basic", "you have no taste") — fails ratings-not-you.
- Neutral chrome in verdicts ("Your results are ready") — the examiner is never beige.
- Snark in instructions — the test must feel scrupulously fair *while measuring*, or the verdict
  reads as rigged when it lands.

---

## What is automated, and what is not (PM ruling RT-106a, 2026-08-21)

`src/content/voice.ts` is a **hazard gate**, not a voice pass. The distinction was
costing us: the standing rule said new copy must be "registered in the voice gate", and a
green run was being read — by the PM and by Claude Code alike — as "this copy is in
voice". It never meant that.

**What the gate decides** (five banned moves with surface forms, plus one structural check):

| Rule | Catches |
|---|---|
| `motive-attribution` | imputed intent — "because you wanted to", "trying to look clever" |
| `person-verdict` | identity or worth — "you have no ear", "your taste is bad" |
| `beige-chrome` | neutral chrome where a verdict belongs, on full/pointed surfaces |
| `fabricated-norm` | percentiles, "top N%", "better than N%", implied cohorts (N3) |
| `unmeasured-claim` | audibility overclaims — "anyone can hear", "proves your ears" |
| `datum-anchored` | a full-intensity line citing no measured quantity |

**What it cannot decide.** Register, rhythm, freshness, whether a line is dull, whether it
sounds like this product or like any product. Those have no surface form. A string reading
*"13 of 15. LITERALLY INSANE bestie no cap fr fr."* passes the gate, and so does
*"You got 13 of 15 correct. That is a fine result."* Both are asserted to pass in
`voice.test.ts` — deliberately, so the boundary is visible rather than rediscovered.

**Consequence for the workflow.** Registering a string proves it carries no named hazard.
It does not discharge the question of whether the copy is any good, and nothing in the
pipeline does. That question is unowned by design: the 2026-08-07 pivot deleted the PM
sign-off because a gate only the PM can discharge is debt, and re-adding one would rebuild
the debt. What replaces it is honesty about the gap — copy ships gated against hazards and
ungated against mediocrity, and a session producing user-facing prose should say so rather
than presenting a green suite as a verdict on the writing.
