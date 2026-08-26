# Vocabulary copy deck — for a writing pass

**Generated, do not edit by hand.** `node scripts/export-copy-deck.mjs > docs/copy-deck-vocabulary.md`

Every sentence the vocabulary layer can render, enumerated from the same fixtures the voice gate uses (`src/content/vocabulary/fixtures.ts`), so this file and the shipped product cannot disagree.

## How to use this

The engineer who wrote these is the weaker writer of the two on this project; that is the reason the file exists. Rewrite freely **within the rules listed under each section** — those are not style preferences, they are measurement constraints, and several were bought with defects found by reading rendered output. If a rule seems to be what makes a sentence bad, say so and it gets re-examined; do not quietly drop it.

Two constraints apply everywhere. **D1:** every sentence is about the performance, never about the person. **N3:** no percentile, no cohort, no comparison to other people — there are zero real respondents, so any such claim is about people who do not exist.

---

## 1. Threshold result — “WHAT THIS MEANS IN A RENDER”

**Where it renders.** Renders on `/threshold/[slug]/result` and at the end of a Gym session, in a bordered panel BELOW the measurement paragraphs and ABOVE the no-cohort footnote.

**What the screen has already said.** The screen has already said: the band (“You caught the damage at 25 cents. At 8.8 cents you were guessing.”), the fitted point where one exists, the per-rung ladder, the material, and “Come back in a week and run it again.”

**This layer's job.** Say what this flaw IS in a track the reader made, and what their measured band implies gets past them.

**Rules this copy must keep:**

- Two sentences; ONE on a wide band (the screen has already refused twice — a third is noise).
- No comparative that inverts on the kbps ladder — say “gentler/harsher”, never “below 96 kbps”.
- No claim about the person, no prediction about their future (D1).
- Must not reuse `bandLine`'s phrases (“You caught the damage at”, “you were guessing”).

**12 sentences to review** — 25 concrete variants, 78 reachable renderings. Braces mark values the engine fills in; leave them as slots.

> Damage gentler than {cents} slipped past you on these clips. That is the range a render can drift inside without you flagging it.

  *As rendered:* “Damage gentler than 100 cents slipped past you on these clips. That is the range a render can drift inside without you flagging it.”  ·  “Damage gentler than 17.7 cents slipped past you on these clips. That is the range a render can drift inside without you flagging it.”

> Damage gentler than {ms} slipped past you on these clips. That is the range a render can drift inside without you flagging it.

  *As rendered:* “Damage gentler than 50 ms slipped past you on these clips. That is the range a render can drift inside without you flagging it.”

> Damage gentler than {kbps} slipped past you on these clips. That is the range a render can drift inside without you flagging it.

  *As rendered:* “Damage gentler than 96 kbps slipped past you on these clips. That is the range a render can drift inside without you flagging it.”

> In a render this is the lead that turns faintly sour on a long note — most often a vocal, a bowed string or a synth lead, where a slow slide reads as bad singing rather than bad audio.

> In a render this is the rubbery, unanchored feel — everything agreeing on the tempo but not quite on where the beat sits, so the groove never locks.

> In a render this is the underwater, brittle quality — cymbals turning to gauze, reverb tails breaking into grit, the whole thing sounding like a worse copy of itself.

> This session never settled on damage you catch reliably, so it cannot say what would get past you — only that {cents} did.

  *As rendered:* “This session never settled on damage you catch reliably, so it cannot say what would get past you — only that 100 cents did.”  ·  “This session never settled on damage you catch reliably, so it cannot say what would get past you — only that 35.4 cents did.”  · …and 1 more

> This session never settled on damage you catch reliably, so it cannot say what would get past you — only that {ms} did.

  *As rendered:* “This session never settled on damage you catch reliably, so it cannot say what would get past you — only that 100 ms did.”  ·  “This session never settled on damage you catch reliably, so it cannot say what would get past you — only that 19.8 ms did.”  · …and 2 more

> This session never settled on damage you catch reliably, so it cannot say what would get past you — only that {kbps} did.

  *As rendered:* “This session never settled on damage you catch reliably, so it cannot say what would get past you — only that 32 kbps did.”  ·  “This session never settled on damage you catch reliably, so it cannot say what would get past you — only that 48 kbps did.”  · …and 1 more

> This session pinned {ms} as damage you catch, but never found the level where you stop — so what gets past you is gentler than that, by an amount these clips did not settle.

  *As rendered:* “This session pinned 12.5 ms as damage you catch, but never found the level where you stop — so what gets past you is gentler than that, by an amount these clips did not settle.”  ·  “This session pinned 15.7 ms as damage you catch, but never found the level where you stop — so what gets past you is gentler than that, by an amount these clips did not settle.”

> This session pinned {kbps} as damage you catch, but never found the level where you stop — so what gets past you is gentler than that, by an amount these clips did not settle.

  *As rendered:* “This session pinned 160 kbps as damage you catch, but never found the level where you stop — so what gets past you is gentler than that, by an amount these clips did not settle.”  ·  “This session pinned 192 kbps as damage you catch, but never found the level where you stop — so what gets past you is gentler than that, by an amount these clips did not settle.”  · …and 1 more

> This session pinned {cents} as damage you catch, but never found the level where you stop — so what gets past you is gentler than that, by an amount these clips did not settle.

  *As rendered:* “This session pinned 3.1 cents as damage you catch, but never found the level where you stop — so what gets past you is gentler than that, by an amount these clips did not settle.”  ·  “This session pinned 6.3 cents as damage you catch, but never found the level where you stop — so what gets past you is gentler than that, by an amount these clips did not settle.”  · …and 1 more

---

## 2. Delicacy result — “WHAT THIS MEANS IN YOUR WORK”

**Where it renders.** Renders on `/delicacy/result` and in the flow's reveal, between the flaw line it interprets and the “DID YOU KNOW WHEN YOU KNEW?” calibration block.

**What the screen has already said.** The screen has already said: the score against chance, the detection band, “And on the ones you caught, you named the flaw 5 of 8 times”, and the whole calibration read.

**This layer's job.** Say why NAMING a flaw is the half that transfers, and why the result is not broken down per flaw.

**Rules this copy must keep:**

- The second sentence is a REFUSAL and the arithmetic forces it: at 5 pairs a family, an equally good ear looks uneven 88.7–92.8% of the time. It must not read as modesty or apology.
- A session that caught nothing gets ONE sentence, not two stacked refusals.
- Never a per-family count or percentage on this screen.
- Must say nothing about confidence or calibration — that block owns it.

**3 sentences to review** — 4 concrete variants, 5 reachable renderings. Braces mark values the engine fills in; leave them as slots.

> Naming is the half that transfers. Hearing that a render is wrong sends you back to generate again and hope; knowing WHICH of the three it is sends you to a control. You named it {n} of the {times} you were asked.

  *As rendered:* “Naming is the half that transfers. Hearing that a render is wrong sends you back to generate again and hope; knowing WHICH of the three it is sends you to a control. You named it 10 of the 10 times you were asked.”  ·  “Naming is the half that transfers. Hearing that a render is wrong sends you back to generate again and hope; knowing WHICH of the three it is sends you to a control. You named it 15 of the 15 times you were asked.”

> This session will not break your result down by flaw type, and the reason is arithmetic rather than modesty: at {pairs} of each, a listener equally good at all three comes out with uneven tallies about nine times in ten. Any split shown here would mostly be luck wearing a label.

  *As rendered:* “This session will not break your result down by flaw type, and the reason is arithmetic rather than modesty: at 5 pairs of each, a listener equally good at all three comes out with uneven tallies about nine times in ten. Any split shown here would mostly be luck wearing a label.”

> You never got far enough into a pair to be asked what was wrong with it, so this session says nothing about whether you can name a flaw — only about whether you spotted one.

---

## 3. Prestige result — “WHAT THIS MEANS IN YOUR WORK”

**Where it renders.** Renders on `/bias/result` and in the flow's debrief, under the verdict and above the share card.

**What the screen has already said.** The screen has already said: the signed percentage, “how far these ratings moved toward the labels”, the verdict pair (“Label-driven.” / “Steady ears.” / “Contrarian.”), and — in the flow — the receipt pill “You moved with the label on N of M clips that could move.”

**This layer's job.** Name where the same KIND of cue lives in the reader's own work, and mark the boundary of what was measured.

**Rules this copy must keep:**

- Carries NO counts — the receipt pill and the share card own those.
- The test measured a composer's name on a stranger's recording. It did NOT measure sunk cost, model provenance, or social commitment. Those may be NAMED as cues; it may never be claimed they moved anyone.
- A contrarian result must not be congratulated as unbiased.

**4 sentences to review** — 4 concrete variants, 6 reachable renderings. Braces mark values the engine fills in; leave them as slots.

> In your own work the label is rarely a composer's name. It is which model made it, how long you spent on the prompt, and whether this is the take you already told someone was the good one.

> That result is about these names, on this afternoon. The cue this test cannot put in front of you is your own effort — the hour in the prompt, the take you already shared — and nothing here has measured that one.

> This test played every clip unlabelled first, and that order is the part worth stealing: the cue has to be gone before the judgment, not argued away after it.

> Your ratings ran against the names rather than with them, and that is still a cue steering the judgment — it is only pointing the other way. The move is the same either way: decide before the label arrives, not after it.

---

## 4. Combined view — “ACROSS YOUR SESSIONS”

**Where it renders.** Renders on all three result screens, but ONLY when two or more instruments have been run on this device AND the result on screen is this device's own (never on somebody else's shared link).

**What the screen has already said.** Everything in sections 1–3, plus each instrument's own measurement copy.

**This layer's job.** Say the three things that are only true once more than one instrument has run: the dossier, the replication, the coverage.

**Rules this copy must keep:**

- Never ranks one family against another — no “strength”, “blind spot”, “sharpest”, “best”, “worst”.
- No leaderboard, streak, XP, points, rank or badge (the anti-clone clause).
- A band that predicted nothing must not earn agreement by staying silent.
- The roster lists thresholds in different units side by side — a LIST, never a ranking.
- No sentence here may also appear in sections 1–3; a test enforces it.

**13 sentences to review** — 13 concrete variants, 21 reachable renderings. Braces mark values the engine fills in; leave them as slots.

> Compression damage: caught at {kbps} on pb1

  *As rendered:* “Compression damage: caught at 160 kbps on pb1”

> Every ladder the Gym can run has a session on this device. What moves the numbers now is time between sittings.

> Pitch drift: caught at {cents}

  *As rendered:* “Pitch drift: caught at 3.1 cents”

> Timing smear: caught at {ms}

  *As rendered:* “Timing smear: caught at 31.5 ms”

> Two separate sessions measured your compression damage in kbps, by different methods, and they agreed on {n} of {n} checks — and on different recordings, which is a harder test than either session alone. That is the closest thing here to evidence that the number is real and not an afternoon.

  *As rendered:* “Two separate sessions measured your compression damage in kbps, by different methods, and they agreed on 5 of 5 checks — and on different recordings, which is a harder test than either session alone. That is the closest thing here to evidence that the number is real and not an afternoon.”

> Two separate sessions measured your pitch drift in cents, by different methods, and they agreed on {n} of {n} checks. That is the closest thing here to evidence that the number is real and not an afternoon.

  *As rendered:* “Two separate sessions measured your pitch drift in cents, by different methods, and they agreed on 5 of 5 checks. That is the closest thing here to evidence that the number is real and not an afternoon.”

> Unmeasured on this device: pitch drift and compression damage. Nothing here says how you would do on them.

> Unmeasured on this device: pitch drift, timing smear and compression damage. Nothing here says how you would do on them.

> Unmeasured on this device: timing smear and compression damage. Nothing here says how you would do on them.

> You have answered {n} different questions about your ears: whether a name changes what you hear; how small a flaw has to get before you lose it. They are not {n} scores of one thing and they do not add up — each is measured in its own terms.

  *As rendered:* “You have answered 2 different questions about your ears: whether a name changes what you hear; how small a flaw has to get before you lose it. They are not 2 scores of one thing and they do not add up — each is measured in its own terms.”

> You have answered {n} different questions about your ears: whether a name changes what you hear; whether you can tell damage from clean and say what it is. They are not {n} scores of one thing and they do not add up — each is measured in its own terms.

  *As rendered:* “You have answered 2 different questions about your ears: whether a name changes what you hear; whether you can tell damage from clean and say what it is. They are not 2 scores of one thing and they do not add up — each is measured in its own terms.”

> You have answered {n} different questions about your ears: whether you can tell damage from clean and say what it is; how small a flaw has to get before you lose it. They are not {n} scores of one thing and they do not add up — each is measured in its own terms.

  *As rendered:* “You have answered 2 different questions about your ears: whether you can tell damage from clean and say what it is; how small a flaw has to get before you lose it. They are not 2 scores of one thing and they do not add up — each is measured in its own terms.”

> You have answered {n} different questions about your ears: whether a name changes what you hear; whether you can tell damage from clean and say what it is; how small a flaw has to get before you lose it. They are not {n} scores of one thing and they do not add up — each is measured in its own terms.

  *As rendered:* “You have answered 3 different questions about your ears: whether a name changes what you hear; whether you can tell damage from clean and say what it is; how small a flaw has to get before you lose it. They are not 3 scores of one thing and they do not add up — each is measured in its own terms.”

---

**46 concrete sentences across four surfaces.**

Anything rewritten here must still pass `src/content/voice.test.ts`, which screens five named hazards — motive attribution, person-verdicts, beige chrome, fabricated norms, unmeasured audibility claims. A green run there does **not** mean the prose is good; it means no named hazard is present. Judging whether it is good is the point of this document.
