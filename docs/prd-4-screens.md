# PRD — Part 4: screen specifications

**Status: part 4 of 4, re-measured against the blueprint build on 2026-09-23.** Part 1 is
`docs/prd-1-use-cases.md` (the use cases), part 2 `docs/prd-2-features.md` (the features, scored),
part 3 `docs/prd-3-requirements.md` (the requirements). The screens below follow part 3's order:
the reading first, the hearing section after.

## How this was measured

**Measured geometry, with pictures beside it.** Every number below was read from the running
application's DOM on a **production build** (`next build`, then `next start`) at two viewports,
**1280 × 820** and **375 × 812**. The flow was walked with element clicks, counting taps, in a
browser holding no stored results and no stored reading choices. A picture proposes a layout; these numbers are the layout. They
cannot show colour, weight or whether a screen *feels* finished, which is what the pictures are
for.

**The pictures** were captured in the blueprint build's rendered run, the same day, with device
emulation over the DevTools protocol. `prd-complete.test.ts` fails if any picture linked here is
missing from the repository.

| Step | Phone, 375 px | Desktop |
|---|---|---|
| Front door | [phone-0](assets/reading-run-2026-09-23/phone-0-front-door.jpg) | [desktop-0](assets/reading-run-2026-09-23/desktop-0-front-door.jpg) |
| The reading | [phone-2](assets/reading-run-2026-09-23/phone-2-reading.jpg) | [desktop-2](assets/reading-run-2026-09-23/desktop-2-reading.jpg) |
| The prompt, before arguing | [phone-3](assets/reading-run-2026-09-23/phone-3-prompt-before.jpg) | [desktop-3](assets/reading-run-2026-09-23/desktop-3-prompt-before.jpg) |
| The prompt, after arguing | [phone-4](assets/reading-run-2026-09-23/phone-4-prompt-after.jpg) | [desktop-4](assets/reading-run-2026-09-23/desktop-4-prompt-after.jpg) |
| The creation mock | [phone-5](assets/reading-run-2026-09-23/phone-5-create.jpg) | [desktop-5](assets/reading-run-2026-09-23/desktop-5-create.jpg) |
| The Company view | [phone](assets/reading-run-2026-09-23/phone-company.jpg) | [desktop](assets/reading-run-2026-09-23/desktop-company.jpg) |
| Why this exists | [phone](assets/reading-run-2026-09-23/phone-learnwhy.jpg) | [desktop](assets/reading-run-2026-09-23/desktop-learnwhy.jpg) |

---

## The shell, on every page

| | Measured |
|---|---|
| Container at 1280 px | **1024 px** (`max-w-5xl`), guarded by `src/app/shell-width.test.ts` |
| Container at 375 px | full width, 24 px gutters |
| Reading column on `/reading` and `/company` | 672 px at 1280; 327 px at 375 |
| No horizontal scroll | on every screen below, at both widths |

**The frame is shared and the reading column is not.** Widening body text to 1024 px was tried
and reverted: it is worse typography than the narrow column it replaced.

# The reading

## S-1 · The front door `/`

| | 1280 × 820 | 375 × 812 |
|---|---|---|
| Headline | 4 lines | 5 lines |
| Listener cards | 3, one per row | 3, one per row |
| First card's top edge | 542 px | **684 px** |
| Hearing section | 4 test cards in one row, then the flaws link | 4 test cards, one per row |

**The first thing a visitor can act on in the body is a listener card** (FR-8.2), and at both
widths it is above the fold. On a phone it starts at 684 px of an 812 px screen: the headline, the
turn to the reading and the top of one card. The header carries the Company view, the reading
room, the Lab and the method; the page's own sections carry the reading and the hearing tests.

## S-2 · The reading `/reading?l=…`

One tap from the front door. Measured on the first listener, Mira.

| | 1280 × 820 | 375 × 812 |
|---|---|---|
| Lines | 4 | 4 |
| First line's top edge | 465 px | 700 px |
| Line width | 672 px | 327 px |

**Each line, top to bottom:** the pattern · the receipt · "Show the plays" · the two offered
readings and "Neither" · "This isn't right".

**States per line:** kept (the default) · rejected, which replaces the offers with "Rejected. It is
out of your prompt." and "Put it back" · a reading chosen · plays shown or hidden. The page's
statement of what it does sits under the title, above the first line (FR-8.3).

## S-3 · The prompt `&step=prompt`

Two taps from the front door.

| | 1280 × 820 | 375 × 812 |
|---|---|---|
| Prompt, nothing argued yet | 10 lines, in a block | 10 lines, 327 px wide, wrapping rather than scrolling sideways |
| Bridge marks, fresh browser | 0 | 0 |
| Actions | Copy · "Tune these with the hearing tests" · "Paste it into Tessavox" | same |

**No mark is the specified state for a fresh browser** (FR-6.2): marks come only from a Threshold
sitting stored on the device. A "Mood" line appears only once a reading is chosen (FR-4.3), and a
rejected line's own line disappears (FR-4.2).

## S-4 · The creation mock `&step=create`

Three taps from the front door, **at both widths**. FR-8.2's limit is three.

| | 1280 × 820 | 375 × 812 |
|---|---|---|
| The illustrative label's top edge | 305 px | 492 px |
| The prompt | in the host's text field, 10 lines | same |
| "Generate" | 696 px from the top, disabled | **902 px, below the fold**, disabled |

**The phone fold is recorded rather than rounded.** On a phone the label that says this is a mock
is on the first screen, and "Generate" with its note, "No audio is generated", is one scroll below
it: the page's title and statement take the first 492 px, and the mock itself is 454 px tall.

## S-5 · The Company view `/company`

| | 1280 × 820 | 375 × 812 |
|---|---|---|
| Container, then column | 1024 px, then 672 px | full width |
| The illustrative label's top edge | 105 px | 147 px |
| Sections | The business case · What it would measure · How it would test it · What five departments would ask | same |

**The sample size is printed from the computation, never typed** (FR-9.3): 6,510 visitors per arm
at the planned baseline, 3,841 at 10%, 8,394 at 30%. `prd-complete.test.ts` recomputes all three.

# The hearing section

**Not re-measured on 2026-09-23.** The blueprint build did not change these screens (D3 amendment).
The figures are from the measurement of 2026-09-13, and the two that matter are held by tests
rather than by that date.

## S-6 · An instrument flow — `/bias`, the Prestige Test

Five screens: intro, blind pass, bridge, labelled pass, debrief.

| | 1280 px | 375 px |
|---|---|---|
| Container | 1024 px | 375 px |
| Rating scale | **11 buttons, one row, 83 px each** | 11 buttons, two rows of 6 + 5, 51 px each |

**The scale's row count is the specification, not a detail.** A wrapped scale reads as a grid rather
than a line: the ends stop being the ends and 5 sits under 0. One row from `lg` up, six columns
below, guarded by `src/app/bias/scale-row.test.ts` against the scale's own length.

**States per rating screen:** locked before the clip has played · armed after it · selected · the
progress bar across both passes. Rating is impossible until the clip has been heard.

## S-7 · The other tests

| Screen | Container | Controls | Why it is not the shell |
|---|---|---|---|
| `/delicacy` | 512 px | two-way choice, then three-way flaw naming | Nothing wraps; the width would stretch a focused task |
| `/threshold` | 512 px | two-way choice per rung | Same |
| `/spread` rating | 1024 px | the 11-point scale | Same defect as S-6, same fix |
| `/spread` intro and close | 576 px | prose | Prose screens; the measure is the point |

## S-8 · A hearing result

Narrow by decision: it is read, and line length matters more than width.

**Order, top to bottom:** the headline number · the verdict pair · the plain-language reading · the
creator lines · the calibration block · the retest arc when a second sitting exists · the expert
panel · the share card. Every block below the number may refuse: where a session cannot support a
reading, the screen says so and shows the arithmetic.

# The surroundings

## S-9 · `/lab`

| | Measured, 2026-09-23 |
|---|---|
| Container | 1024 px |
| Sections | 4: Panels · Metric dictionary · Not built yet · The funnel, specified |
| Panel pages linked | 5 |
| Data-source badges | a legend of the four kinds, then **3 more, every one `SIMULATED`**: two in Panels, one on the funnel |

**No panel says `REAL`.** The pipeline is validated against data whose truth is known, and each
panel says so. The one `REAL` badge on the page is the legend's key; `site-badges.test.tsx` fails
if a panel carries one. The earlier version of this part read "4 panels, 7 badges, every one
SIMULATED": it counted sections as panels and the legend as badges.

## S-10 · `/method`

| | Measured, 2026-09-23 |
|---|---|
| Container | 1024 px, 768 px reading measure |
| Sections | 6, including "Seven refusals" and "Three reversals" |
| Refusals | **7**, each headed "Refused under …" |

**The inference label is the page's binding condition.** Where the page reconstructs reasoning rather
than quoting a ruling, it says so in the reader's path, not in a footer. Pinned by
`src/app/method/inference-mark.test.ts`.

---

## Pictures still missing

The rendered run captured the reading and the Company view. **The hearing section, `/lab` and
`/method` have no pictures yet.** If they are wanted: `/bias` mid-pass with one value selected,
`/bias/result` with the expert panel open, `/lab` with its badges, `/method` with one refusal and
one inference label in frame, at the same two viewports. They belong in the README, not in this
document.
