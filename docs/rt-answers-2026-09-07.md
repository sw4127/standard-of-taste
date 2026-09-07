# Rulings of record — 2026-09-07 (E19)

Companion to `docs/rt-answers-2026-07-11.md`. **Tracked on purpose:** the Phase 2 blueprint
(`docs/blueprint-phase-2.md`) is deliberately untracked, so a ruling recorded only there is a ruling
a fresh clone cannot see. Everything below is settled; nothing here is awaiting an answer.

---

## RT-H — CLOSED. The question described an instrument that had already been refused.

**The question, as it stood since Phase 2 was written:** *"What does breadth mean for the Comparison
instrument, in defensible units?"* — carried as a BLOCKER on Track I for roughly a month.

**The ruling (owner, 2026-09-07): close it. Track I is done.**

**Why, and this is the part worth keeping.** Track I scoped Comparison as *"breadth of what someone
has actually heard, scoreable from catalogue metadata"*. That design was not deferred — it was
**refused, built against, and the refusal published**. `/learn/comparison` says so in shipped copy:

> This page used to promise something else… It described an optional import of your streaming history
> and said that breadth was a fact about your listening rather than a skill anyone could test. That
> version needed a catalogue we would have had to license and a taxonomy we would have had to invent,
> **and it measured what you had been exposed to rather than what you could do with it.**

That last clause is the reason, and it is **D2**: an instrument must be a performance task where the
listener can be **wrong**. Breadth-as-exposure is not — it is a fact about someone's history, which
is the self-report side of the line the memo draws. RT-H asked for defensible units for a quantity
the project's own guardrail forbids measuring that way, which is why nobody could answer it.

**What shipped instead** measures the thing Hume actually named: how many degrees of the eleven-point
scale a listener used, and whether they ordered the same clips the same way twice. It is computed
from the Prestige Test's own ratings — no new clip, no new tap — and it renders under the Prestige
result on both the flow and the share page.

**Verified at closure, not asserted:**
- `comparisonLines` is live and `ComparisonReading` mounts on `/bias/result` and in the flow.
- `NotBuiltYet` — the component this product built for admitting a door is not there — has **zero
  usages**. No criterion advertises an absence.
- Track I's three items: **I1** is this question, void; **I2** shipped; **I3**'s "no instrument yet"
  notice no longer exists, because `/learn/comparison` is a full page.

**`docs/blueprint-phase-2.md` is stale on this track** and is untracked, so it is not corrected here.
Read this file first where the two disagree.

**If a breadth instrument is ever wanted**, it is NEW work and not this track. The honest framing is
*"is there a performance task that measures range, where the listener can be wrong?"* — not *"what
are the units of breadth?"*, which is the question that could not be answered.

---

## What now enforces the claim this closed

`/learn/freedom-from-prejudice` says the other four criteria "each have a machine of their own". That
sentence lost its hedge — *"built or planned"* — in E19/S11, on the writing pass's condition that it
come out **only** if the condition held. At the time it was checked by reading four pages and a
roster, and confessed as untested.

`src/content/criteria-coverage.test.ts` tests it now: each of the five criteria is mapped to the
symbol that implements it, the mapping is verified, and the unhedged sentence may not stand on a
product that is anywhere rendering the not-built notice. Removing the comparison reading fails it
with the sentence that would have become false.

---

## Also ruled this session

- **RT-T1..T9, RT-U1..U3, RT-V2, RT-V3, RT-W1, RT-W2, RT-X1** — all discharged in E19; see the commit
  messages, which carry the north star, the red-team findings and the confession per slice under the
  standing auto-advance amendment (`docs/slice-protocol.md`).
- **RT-J's amendment (2026-09-06):** the Lab says plainly why the funnel & cohort panel is absent AND
  must still carry an analytics demonstration for a recruiter reader, because traffic will not arrive
  before the applications do. Folded into Track J, not yet built.

## Still open, carried forward

- **RT-I** — the composite Taste Index: build or kill. Recommendation on file is to kill it and
  publish the five sub-scores as a profile.
- **RT-J** — the empty Lab panel, plus the demonstration above.
- **Track M** — the Taste Gem, gated behind the copy pass by RT-N5.
