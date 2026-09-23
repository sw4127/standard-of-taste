# Rulings of record — 2026-09-23, the blueprint audit (BA-)

Fifth in the series, after `docs/rt-answers-2026-07-11.md`, `docs/rt-answers-2026-09-07.md`,
`docs/rt-answers-2026-09-13.md` and `docs/rt-answers-2026-09-16.md`. **Tracked on purpose**, for the
reason all four give: a ruling recorded only in an untracked file is one a fresh clone cannot see.

These twelve rulings were taken by the owner on 2026-09-23 at the close of the Cowork blueprint
audit, on the options it put. The audit settled the project's goal, insight and its argument,
demand, unmet demand, three challenged assumptions, a bridge and a business case as one canonical
text: `docs/blueprint.md`. Statement IDs (`BP-…`) below refer to it.

**Where this file and any earlier blueprint or ruling disagree, this file is authoritative.**

---

## 0. The ID namespace

**BA-** (blueprint audit) is new. It collides with no `RT-`, `RT-Z`, `RT-P` or `RT-O` id in the
series, which is why it was chosen: the `RT-Z` letters were exhausted before 2026-09-16 and several
were used twice (`docs/rt-answers-2026-09-16.md` §0).

## 1. The rulings

| ID | Ruling |
|---|---|
| **BA-1** | The goal, insight and argument, demand, unmet demand, three challenged assumptions, bridge and business case are settled. Their one canonical text is `docs/blueprint.md`, moved from the ledger (option a). |
| **BA-2** | The direction behind PRD part 2's scoring (d468c9e, 2026-09-13) cannot be recovered. Scoring features on "what building them proved" conflicts with BP-GOAL and is reopened. |
| **BA-3** | RT-7 (b) is reopened. No surface may assert a feeling. A reading names a pattern and offers what it might mean, because the same pattern can come from opposite feelings (BP-ARG-S1). |
| **BA-4** | D2 ("performance tasks, not self-report") governs instruments: what measures how well a person hears or judges. It does not govern the reading, which may start from listening behaviour. RT-H stands for the breadth instrument it refused and does not bind the reading. |
| **BA-5** | Trauma is not part of the settled set. The carve-out (RT-Z10 a, RT-6 a) holds on every surface, including anything a model writes. |
| **BA-6** | **The reading becomes the product.** It is the front door. The four instruments become the hearing section, reached from the prompt through BP-BRIDGE. D3 is amended: the flagship is the reading, not the Prestige Test. |
| **BA-7** | **The snack is retired.** Its questions ask people to describe their own taste, which BP-CA2 says they cannot. D1's suspension for `/music/quiz` and `/music/result` is withdrawn. |
| **BA-8** | The reading runs on **three illustrative listeners**, with fictional artists and tracks carrying authored sound descriptions, all labelled. No real artist, track or licensed metadata. |
| **BA-9** | The host company in the Company view has a **fictional name**. No real brand anywhere on a mock. |
| **BA-10** | **Templates only.** No model writes any part of the reading, the prompt, or any other sentence a visitor reads. |
| **BA-11** | The prompt ends in a **labelled mock creation screen** belonging to the fictional host. No audio is generated. |
| **BA-12** | The core is real and the surroundings are mock, labelled. The "I harness AI" pitch lives in the repository and on `/method`, not in the product. |

## 2. Where each ruling is carried out

Assignments, not a claim that each is finished: the handoff that closes this build says which
shipped.

| Ruling | Carried out in |
|---|---|
| BA-1 | `docs/blueprint.md`; `src/content/blueprint.ts`, `blueprint-copies.ts`, `blueprint.test.ts`; CLAUDE.md "Blueprint of record" |
| BA-2 | `docs/prd-2-features.md`, stamp under the scoring rule |
| BA-3 | CLAUDE.md, stamp beside the RT-7 (b) amendment |
| BA-4 | CLAUDE.md, stamp beside D2 in the pivot of record; memo §3 |
| BA-5 | the carve-out patterns (`src/app/site-d1.test.tsx`, `src/content/card/copy.test.ts`) |
| BA-6 | CLAUDE.md "D3 amendment"; memo §4 |
| BA-7 | CLAUDE.md, the second-surface amendment's withdrawal and the third-surface amendment; `/method`'s third reversal |
| BA-8 – BA-11 | `src/content/reading/`, `src/engine/reading/`, `/reading`, `/company` |
| BA-10 | CLAUDE.md, stamp beside "Result anchoring" |
| BA-12 | `/method`'s opener; `README.md` |

## 3. Earlier rulings these reopen or narrow

- **RT-7 (b), 2026-09-23** (the snack exempt from the offer register) — reopened by BA-3, and moot
  once BA-7 retired the snack.
- **RT-4 (c) / RT-5 (a), 2026-09-23** (the snack restored as a named D1 surface) — withdrawn by BA-7.
- **D3, memo §4** (the Prestige Test as flagship) — amended by BA-6.
- **D2, memo §3** — scoped by BA-4 to instruments.
- **RT-H, 2026-09-07** — stands for the breadth instrument it refused; does not bind the reading (BA-4).
- **MRD §11.4, R1–R4** (the pre-registered reading build) — superseded by the reading built under
  BA-6 and BA-8, from listening behaviour rather than from self-report.
