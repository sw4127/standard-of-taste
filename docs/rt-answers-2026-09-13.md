# Rulings of record — 2026-09-13 (E20)

Third in the series, after `docs/rt-answers-2026-07-11.md` and `docs/rt-answers-2026-09-07.md`.
**Tracked on purpose**, for the reason those two give: the Phase 2 and Phase 3 blueprints are
deliberately untracked, so **a ruling recorded only there is a ruling a fresh clone cannot see** —
and, as this session proved, a ruling only one machine can read is one a later session will re-open
and spend a second answer on. RT-I was ruled on 2026-09-01 and three subsequent handoffs carried it
as still awaiting an answer.

Everything in §1 and §2 is settled. §3 is what is still open, and it is short on purpose.

---

## 1. Rulings carried out of the untracked blueprints (Track Q1)

| Id | The question | Ruling | Where it stands |
|---|---|---|---|
| **RT-G** | Persistence: device-local, or a hosted store? | **(b) device-local** | Shipped. Track G done |
| **RT-H** | What does "breadth" mean for the Comparison instrument? | **CLOSED** — the question described an instrument the product had already refused | Full reasoning in `rt-answers-2026-09-07.md` |
| **RT-I** | Is the composite Taste Index built or killed? | **(a) killed**, ruled 2026-09-01 | Published 2026-09-13 as `/method`'s fifth refusal. See RT-I2 |
| **RT-J** | Does the Lab ship an empty funnel panel, or say why it is absent? | **Re-framed by the owner, not answered as put.** His words: *"saying we have no data is definitely a poor demonstration of what we built"* | The panel states the ARITHMETIC of the absence and points at its specification, rather than apologising for missing traffic |
| **RT-Z3** | One container width and one navigation model? | **(a) yes**, ruled 2026-09-13 | Track N closed. See the note under it — "one shell" turned out to mean one FRAME with two deliberate exceptions |
| **RT-Z4** | Is the falsified-hypotheses registry built? | **(a) build it** | Done. 33 entries live at `/lab/falsified` |
| **RT-Z1** | Does a real number ever appear on this site, and from whose ear? | **(b) the owner fields it on himself**, ruled 2026-09-13 | **Not done — it needs about 35 minutes of the owner's time.** Tracks O and P wait on it, and so do two Tier 1 goals in `docs/kpis.md` |

## 2. Rulings made on 2026-09-13, which existed only in commit messages until now

| Id | The question | Ruling |
|---|---|---|
| **RT-I2** | Does "publish the five sub-scores as a profile" mean a NEW surface? | **(a) no.** The five readings stay where they are measured; `/method`'s refusal carries the reason there is no combined number. A guard refuses any shipped string offering a combined or overall taste number |
| **RT-N1** | One name across the repository, the pitch page and the app | **(a) "Standard of Taste" everywhere.** 54 occurrences replaced; the gym metaphor is untouched, because it names a place rather than the product |
| **RT-P1** | Does the product add a preference instrument that turns taste into words? | **(a) mock it on paper first.** Written: `docs/preference-mock-2026-09-13.md`. **Awaiting the owner's judgment on the mock** |
| **RT-P2** | Keep leading with the AI-music-producer audience while the only datum points against it? | **(a) keep it, with the disclosure.** The README now records that one person who makes music with an AI tool has been asked and said the premise does not hold for them |
| **RT-P3** | The front door promises "words you can use", which only an unbuilt instrument delivers | **(a) narrow it — then amended the same day.** The narrowing dropped the word *understanding*, which is the value being sold. The direction flips instead: the recommender understands you and will not say; here you do the understanding |
| **RT-J1** | Does the delicacy share line survive N3? | **(a) keep it.** The product compares nobody; the line invites the reader to. Recorded beside the line in `delicacy/copy.ts`, because the writing pass called it the thinnest distinction in the deck |
| **RT-J2** | Build screenshots into the copy deck before batch 4? | **(a) ship batch 4 as it stands.** Deferred, not refused — the recommendation stands if a fifth deck batch is ever commissioned |
| **RT-Z6** | Can the Vercel retention window go under 30 days? | **Closed as moot.** It mattered when each deployment stored 154 MB of audio; `public/` is now 35 KB |
| **RT-Z7** | Rename the `vibe-check-app-sepia.vercel.app` deployment? | **(c) leave it.** Renaming breaks every share URL already posted, and nobody knows whether any are |

## 3. Still open

- **RT-Z2 — is a bounded, one-shot seeded cohort ruled in or out, permanently?** Phase 3 put it with
  NO DEFAULT because it touches a question the owner has closed. It was never asked in this session
  and remains the only Phase 3 decision with no answer. Ruling it OUT is a complete answer and costs
  two Lab badges.
- **RT-P1's second half** — whether the preference instrument gets built, and whether the shipped
  no-transfer ruling would have to be revisited to justify it. The mock exists so this can be
  decided by reading rather than by building.

## 4. What is deliberately NOT in this file

**The blueprints themselves.** Track Q3 asks whether to retire or bind them, and binding means
tracking, and tracking means publishing — this repository is public and those files contain strategy
and the owner's own assessment of the project. **That is an owner decision and a one-way door**, so
this file takes the RULINGS out of them, which is the part that has to survive, and leaves the
documents where they are.
