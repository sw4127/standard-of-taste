# Eval: can a model write the reading's lines under its own rules?

**Generated, do not edit by hand.** `node scripts/eval-reading-lines/run.mjs score`

**Drafter:** claude-opus-5-5 via Claude Code subagent (general-purpose), no tools used. **Date:** 2026-09-28. **N:** 66 lines in 18 drafts: 33 from brief v1, 33 from brief v2, across the three illustrative listeners.

**How it was run.** Each drafter got one listener's brief (`scripts/eval-reading-lines/briefs/`): the facts with their true counts, and the reading's rules in prose. It never saw the templates or the checks, and used no tools (checked in each subagent's transcript). Its reply is saved unedited in `drafts/`. Brief v2 is v1 plus one rule, the voice the product's own lines use: address the reader as “you”, never by name, no pronouns. The drafts were written by Claude Code subagents inside the owner's plan, not by a pinned API call: a re-run will not reproduce them word for word, and no temperature or model snapshot was fixed. Nothing here is rendered on the site (BA-10).

**What the checks cannot see.** They are the product's own pattern lists, applied sentence by sentence as `src/content/reading/lines.test.ts` applies them to the templates. A line that asserts a feeling, or makes a clinical claim, in words those lists do not name passes. Quantities written as words (“half”, “one in five”) are not checked. A pass means none of the listed shapes appeared, not that the line is good.

| Check | Brief v1 | Brief v2 | All |
|---|---|---|---|
| Offer register (BA-3) | 33 of 33 | 33 of 33 | 66 of 66 (100%) |
| Carve-out (RT-Z10 a) | 33 of 33 | 33 of 33 | 66 of 66 (100%) |
| No comparison (N3) | 33 of 33 | 33 of 33 | 66 of 66 (100%) |
| Receipt arithmetic | 33 of 33 | 33 of 33 | 66 of 66 (100%) |
| **All four** | **33 of 33** | **33 of 33** | **66 of 66 (100%; 95% interval 94–100%)** |

The control: the product's own template lines pass all four checks (`harness.test.ts`), so the scorer is not stricter than the product.

## Offer register (BA-3): 0 failing lines

None.

## Carve-out (RT-Z10 a): 0 failing lines

None.

## No comparison (N3): 0 failing lines

None.

## Receipt arithmetic: 0 failing lines

None.

## What the four checks cannot see, counted

Plain pattern counts (`voiceCounts` in `harness.ts`, tested there). The product's own lines address the reader as “you” or impersonally, never by name and never with a pronoun.

| Count | Brief v1 | Brief v2 |
|---|---|---|
| Offers address the reader as “you” | 10 of 33 | 32 of 33 |
| Offers name the listener in the third person | 19 of 33 | 0 of 33 |
| A gendered pronoun for a listener whose pronouns were never given | 5 of 33 | 0 of 33 |

Facts where two drafts wrote the same pattern word for word: **0 of 11**.

## What this says, and does not say, about BA-10 (the engineer's reading)

Scored as the product scores its templates, 66 of 66 drafted lines pass all four checks (95% interval 94–100%). No line failed a check. With brief v1, which named the listener and did not say how to address the reader, 19 of 33 lines named the listener in the third person and 5 used a pronoun nobody gave. With brief v2, which states that one rule, the counts were 0 and 0 of 33. Stating the rule removed both, so they measured the brief, not a limit of the model. No two drafts wrote the same pattern for any of the 11 facts. A template shows the same words every time; a drafted line is new on each run, so what a person was shown can only be checked afterwards if every shown line is stored. BA-10 is recorded as a ruling (“Templates only”), not as a measured claim, so this eval can neither confirm nor overturn it. What it cannot measure is meaning, and meaning is what the one recorded incident was about: the retired snack's model-written line “headphones are cheaper than therapy” (`src/content/carve-out.ts`), which no guard of the day could see. The pattern lists catch that phrasing now; they would not catch the next one written in other words. With 66 lines from one model and no pinned settings, the evidence supports this much and no more: under rules stated in prose, this model's lines did not trip the product's own checks. Whether to revisit BA-10 is the owner's call, and would need a fixed model and settings, a stored copy of every line shown, and a way to judge meaning that these checks do not have.

