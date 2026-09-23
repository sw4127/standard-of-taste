# PRD — Part 4: screen specifications

**Status: slice 4 of 4. The PRD is complete with this file.**
Parts 1–3: `docs/prd-1-use-cases.md`, `docs/prd-2-features.md`, `docs/prd-3-requirements.md`.

*[2026-09-23 — this part describes the product BEFORE the blueprint audit: the Prestige Test as flagship, the gym as the product, and the use-case numbers of the earlier inventory. The product of record is now the reading (BA-6, `docs/rt-answers-2026-09-23-audit.md`), and part 1 has been re-derived from `docs/blueprint.md` with new numbering. This part is revised next; until then, read it as the record of what was specified, not as the specification.]*

## Why this is measurements and not pictures, stated first

A PRD normally carries wireframes. **This one carries measured geometry instead, and the substitution
is a limitation rather than a preference.** The repository has no headless browser; adding one is a
~300 MB development dependency for a single documentation artifact, which is not a trade this project
would make for a picture.

What is below was read from the running application's DOM at two viewports, so it is exact where a
wireframe would be approximate — a wireframe proposes a layout, and these numbers are the layout. It
cannot show colour, weight, rhythm or whether a screen *feels* finished.

**If images are wanted, the capture list is at the end.** It names every screen and viewport, so
producing them is fifteen minutes of somebody's time rather than a judgment call.

---

## The shell — every reading surface

One container width and one header across `/`, `/learn`, `/method`, `/lab` and `/legal`, guarded by
`src/app/shell-width.test.ts`.

| | Measured |
|---|---|
| Container at 1280 px | **1024 px** (`SHELL_WIDTH`, `max-w-5xl`) |
| Container at 375 px | full width, 24 px gutters |
| Header | wordmark left, links right, wrapping to a second line on a phone without breaking the wordmark |
| Reading measure inside the frame | `/learn` 672 px · `/method` 768 px · `/lab` full |

**The frame is shared and the measure is not.** Widening body text to 1024 px was tried and reverted:
it is worse typography than the narrow column it replaced.

## S-1 · The front door `/`

| | 1280 × 820 | 375 × 812 |
|---|---|---|
| Container | 1024 px | 375 px |
| Headline | 3 lines | 4 lines |
| Machine cards | 4 across, one row | 1 across |
| First card's top edge | 583 px | **797 px** |
| Interactive elements | 4 machine cards, 8 links | same |

**Three beats above the cards:** the feeling, the algorithm that already has it, and what this product
does with it. **The phone fold is tight and is recorded rather than rounded** — at 797 px of an 812 px
viewport a phone visitor sees the message and the top edge of one card.

## S-2 · An instrument flow — `/bias`, the Prestige Test

Five screens: intro, blind pass, bridge, labelled pass, debrief.

| | 1280 px | 375 px |
|---|---|---|
| Container | 1024 px | 375 px |
| Rating scale | **11 buttons, one row, 83 px each** | 11 buttons, two rows of 6 + 5, 51 px each |

**The scale's row count is the specification, not a detail.** A wrapped scale reads as a grid rather
than a line — the ends stop being the ends and 5 sits under 0. One row from `lg` up, six columns
below, guarded by `src/app/bias/scale-row.test.ts` against the scale's own length.

**States per rating screen:** locked before the clip has played · armed after it · selected · the
progress bar across both passes. Rating is impossible until the clip has been heard.

## S-3 · The other instruments

| Screen | Container | Controls | Why it is not the shell |
|---|---|---|---|
| `/delicacy` | 512 px | two-way choice, then three-way flaw naming | Nothing wraps; the width would stretch a focused task |
| `/threshold` | 512 px | two-way choice per rung | Same |
| `/spread` rating | 1024 px | the 11-point scale | Same defect as S-2, same fix |
| `/spread` intro and close | 576 px | prose | Prose screens; the measure is the point |

## S-4 · A result screen

Narrow by decision — a reading, where line length matters more than width.

**Order, top to bottom:** the headline number · the verdict pair · the plain-language reading · the
creator lines · the calibration block · the retest arc when a second sitting exists · the expert
panel · the share card. Every block below the number may refuse: where a session cannot support a
reading, the screen says so and shows the arithmetic.

## S-5 · `/lab`

| | Measured |
|---|---|
| Container | 1024 px |
| Panels | 4 |
| Data-source badges | 7, every one reading `SIMULATED` |

**Every figure on this surface is badged, and none of them says `REAL`.** That is the screen's whole
argument: the pipeline is validated against data whose truth is known, and it says so on every panel
rather than in a footnote.

## S-6 · `/method`

| | Measured |
|---|---|
| Container | 1024 px, 768 px reading measure |
| Sections | 5 |
| Refusals | **6**, each headed "Refused under …" |
| Inference labels | 4 |

**The inference label is the page's binding condition.** Where the page reconstructs reasoning rather
than quoting a ruling, it says so in the reader's path — not in a footer. Pinned by
`src/app/method/inference-mark.test.ts`.

---

## The capture list, if images are wanted

Six screens, two viewports each — 1280 × 820 and 375 × 812.

1. `/` — the front door, scrolled to top
2. `/bias` — a rating screen mid-pass, after a clip has played, one value selected
3. `/bias/result` — a completed result with the expert panel open
4. `/lab` — panels and badges visible
5. `/method` — one refusal and one inference label in frame
6. `/learn/flaws` — the three flaw families

**Where they belong:** the README, above "Start here". Not in this document — a PRD carrying twelve
images is a PDF pretending to be a specification, and the README is where a reviewer decides whether
to keep reading.
