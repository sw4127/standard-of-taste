# Track V — the consistency close (2026-09-22 → 2026-09-23)

**What this track was.** A closing pass that added no feature. Its job was to find the places where
the product contradicts itself or describes something no longer true, fix them, and leave guards so
the same classes cannot come back. It ran as nine slices (S1–S9) plus this document (S10).

**State at close.** 2,309 tests in 194 files, green · `tsc --noEmit` clean · 9 commits,
`2781fa8` → `2696f67`, on top of `e0eda44` · pushed with this document (see the last section).

**PM rulings taken in this track.** RT-1 (2026-09-22) **(a)**: the front door keeps the header's
READING ROOM and drops the duplicate door. RT-2 (2026-09-22) **(a)**: the pre-pivot personality
product is retired; its routes redirect to the front door.

---

## 1. The (a)/(b)/(c) question, answered

**(b) — a guard existed and its needle was the wrong thing.**

- **The guard:** `src/content/instrument-state.test.ts`, "the secondary doors under the machines"
  (lines 292–327 at the start of the track). All four of its assertions were about
  `SECONDARY_DOORS`.
- **Why it could not see the defect:** the doors arrived on 2026-08-28 (`0929b66`) and the header nav
  on 2026-09-13 (`538111c`). Nothing read `HEADER_LINKS` (`src/app/page.tsx:160`) or `SiteHeader`,
  so the doubled door sat *between* two lists, each checked on its own terms.
- **A second weakness inside it:** the "every door resolves" check filtered on `startsWith("/learn/")`,
  which `"/learn"` does not satisfy. The doubled door, and `/music/quiz`, were never checked for a
  destination at all.
- **Not (c):** the set it asserted over was non-empty, and its length assertion was absolute.

**What replaced it.** `src/app/site-doors.test.tsx` renders every page that carries the header and
fails when header and body offer the same room. It checks *the same page*, not *the same viewport*.
Viewport co-visibility needs layout, which this suite does not have. Measured in a browser, the two
links shared a 1920×1080 viewport and were about 1,900 px apart at 375×812. The stricter property is
the one guarded, and the difference is stated here rather than implied away.

**The measurement warning in the brief was right, for a reason other than the one given.** The
"/lab links to / twenty-six times" false positive was not a per-row pattern. The probe resolved
in-page `#metric-*` anchors against the origin. With fragments treated as in-page, a header-vs-body
crawl of all 27 static routes found exactly **one** overlap: the known defect.

---

## 2. The sweep, class by class

| # | Class | Result | What now guards it |
|---|---|---|---|
| 1 | Duplicate and orphan doors | **Defects fixed.** The doubled `/learn` door (RT-1 a). A self-link: the reading room's footer offered "Reading room" on its own index. **0 dead links.** Orphans were all result or legacy pages. | `site-doors.test.tsx`; `site-links.test.tsx` (dead links, orphans and self-links over every rendered page; exact lists in both directions) |
| 2 | Anything that counts | **Defect fixed.** `/method`: "it has built **three** working instruments", present tense, while four were live. Three sibling counts derived. One left typed on purpose (a measured 84-minute comparison) so it fails when a fifth ships. **Found in S9:** the Prestige bridge's "Your **ten** ratings are saved" over a sixteen-clip pool, removed with the bridge box. | `site-counts.test.tsx`: 42 counts across 8 set nouns, each checked against the live set size |
| 3 | Stale claims | **Defects fixed.** Two write-up charts (`swapped-shift.svg`, `listen-shift.svg`) drawn for the 8-clip pool: "1500 item-ratings" where today's generator says 2,100. The Lab's audio measurements badged REAL (class 5). The root layout, manifest and error pages naming "Vibe Check" (S9). `/legal` clauses about the retired readings (S9). | `scripts/check-generated.mjs` in `.githooks/pre-push`; `scripts/charts-fresh.test.ts`; `site-terms.test.tsx` (inherited metadata) |
| 4 | D1 scope | **Gym clean on rendered pages. Two contradictions found:** (i) the card's verbatim "Everything else on this site describes only what you did" and `/legal`'s "It does not predict your personality" were false while the legacy quizzes were live, and **resolved by RT-2 a**; (ii) a D1 claim *inside the flagship*: the Prestige bridge said the quiz "tells you **which** kind of listener you are". Also the manifest's "Your music taste has been taking notes on you. Get read." | `site-d1.test.tsx`: rendered text, attributes and metadata; retired sentences as fixed specimens; **the gym's interactive screens read from source** |
| 5 | Badge integrity | **Defect fixed.** `/lab/instrument-health` badged audio measurements REAL, whose hover says "measured from real respondents", at n = 0. Every Lab badge was a typed literal. | `site-badges.test.tsx`: REAL only in the legend or on REAL panels (zero today); typed sources only in an exact list |
| 6 | Terminology drift | **Clean** for instrument names (104 occurrences, four registry names) and family names. **Found, not settled:** "sitting" and "session" name one thing; carried to the writing pass. | `site-terms.test.tsx`: rogue names, route-derived old names, engine slugs outside Lab table cells, inherited metadata |
| 7 | Citation integrity on `/method` | **Clean.** `claims.test.ts` opens 45 anchors across 19 files; a one-word drift and a missing file each fail it. | Existing guard, broken once and restored |
| 8 | Copy the copy system cannot see | **(i) Clean:** 96 templates, every one reached by a test except `themeForArchetypeLabel` (legacy, carried). **(ii) The largest finding of the track:** 693 of 1,135 rendered body sentences are in no deck and no commission; with page metadata, **720** at close. The whole Lab (six pages), the instrument start pages, the reading-room index and much of the front door have never been in front of a writer. | `template-reach.test.ts`; `site-deck-coverage.test.tsx`: an exact per-page ceiling, so new undecked prose fails and decked prose forces the ceiling down |
| 9 | Generated files edited by hand | **Clean.** Re-running every exporter produced no content diff in any deck, ledger or brief. The two stale artefacts were charts (class 3). | `check-generated.mjs` refuses a push when a committed artefact differs from its generator |

---

## 3. What this track learned, which should not be lost

1. **A guard proves what its needle reads, and three needles here read the wrong surface.** Page
   metadata but not the layout's. Rendered pages but not screens that exist only mid-session.
   `"what kind of"` but not `"which kind of"`. Each looked green over a live defect. The last two
   were found only because the product was *used*: the browser showed a "Vibe Check" title while a
   redirect streamed.
2. **The test renderer and the real server disagree about redirects.** Called directly, a
   redirecting page throws cleanly. Served by Next with a `loading.tsx` present, the same page
   streams a 200 and the old shell first. Only a browser saw it.
3. **The slice latch failed on the owner's own reply** because the reply contained Chinese. Claude
   Code sends hook payloads as UTF-8; Python on this machine read stdin as GBK; the parse failed and
   the hook exited 0 in silence, before clearing. Fixed in `.claude/hooks/` (untracked), with a
   ten-case regression. **`context-tracker.py` had been failing on every prompt the same way**, so
   the "measured context" figure the closing rules rely on did not exist.
4. **Three unmeasured numbers were written into guard comments in this track** (S2, S4, S6), and
   the run proved each wrong. A number in a guard is a claim like any other.

---

## 4. STILL UNVERIFIED — carried forward, not emptied

**Carried from E21 (`docs/handoff-2026-09-22.md`), all still true:**

- **The prompt card's copy has never been through a writing pass.** Twenty-nine strings,
  commissioned in `docs/commission-batch-6.md` and handed to nobody. The largest gap between what
  shipped and what a reader would call finished.
- **The clipboard success path has never been observed.** Automation profiles deny clipboard-write;
  only the fallback has been seen.
- **The flow's last screen was not walked.** Nobody has sat 26 audio trials and seen the card
  arrive.
- **The tag vocabulary is invented by engineering.** No prompt from the card has been pasted into a
  generator.
- **All band figures are simulated**, n = 0, under the same logistic the fitter assumes.
- **Band boundaries are equal in log magnitude**, a default rather than a claim.
- **The copy deck was regenerated wholesale and not read line by line.**
- **Batch 6 is handed to nobody**, and the card's strings are not in the deck.
- **Batches 4 (`/method`) and 5 (README, pitch page, front door) are written and unhanded.**
- **Track O is open and blocked on the owner:** sit all four instruments so one result exists
  badged REAL, n = 1. Two Tier 1 goals and all of Track P wait on it. **This pass does not close
  it.**
- Audio audibly playing, any event or `?ref=` reaching a sink, and `docs/index.html` rendered by
  anyone.

**Added by this track:**

- **751 → 720 rendered sentences are invisible to the copy system**, now held at a ceiling, not
  closed. Wiring the Lab, the instrument start pages and page metadata into the decks is unruled.
- **The guards read the same page, not the same viewport.** Nothing checks what a reader sees on
  one screen.
- **Screens that exist only mid-session are read from source for D1 alone.** A stale count on such a
  screen (like the bridge's "ten ratings") is still invisible to `site-counts`.
- **The Prestige bridge after its fix was verified by tests and source, not by sitting sixteen clips
  in a browser.**
- **The retired funnel's components and API routes remain in the codebase**
  (`/api/reading`, `/api/music-reading`, `/api/premium-hook`, `/api/checkout`, `/api/calibrate`,
  `/product-image`). Whether any spends money when called directly is **not checked**; flagged as a
  separate task.
- **Redirects drop the query string**, so a legacy link's `?ref=` is not counted.
- **The hook commands use relative paths** (`python .claude/hooks/...`). Run from another directory,
  Python exits 2, which blocks every tool call and prompt. Not changed from inside a session, because
  a failed fix locks the session out; safer applied from a terminal.
- **The context tracker now runs, and its figure is still suspect:** characters ÷ 4 against a fixed
  128,000-token window that does not match the model.
- **"Sitting" and "session" name one thing** on reader-facing pages; for the writing pass.
- **The new engineering copy** (the MEASURED badge and its legend sentence, the site description,
  the error line, the reworded preference refusal on `/method`) **has had no writing pass.**

---

## 5. Push

Pushed with this document, per the push cadence (once per task, before the session ends). The
pre-push hook runs the suite and `check-generated.mjs`; its result is recorded in the commit that
carries this file and in the session's reply.
