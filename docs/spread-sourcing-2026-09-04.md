# Track N sourcing — what exists, and what only looked like it did

**Written 2026-09-04, before any of Track N was built.** Track I's audio half died at exactly this
step, so the pass/fail here was **pre-registered before the search began**: public-domain or CC-BY
recordings for six works from Michael Tanner's ranked twenty-one Beethoven masterpieces, yielding at
least three pairs ten or more list positions apart and at least three pairs within three.

**Result: PASS.** Six works cleared, giving four far pairs and four close pairs — both above the
floor of three. The pool of record is `src/content/spread/manifest.json`; the pair structure is
computed rather than asserted, in `src/content/spread/ranking.test.ts`.

This document exists for the other half of the record. Most of what turned up looked usable and was
not, and the reasons are reusable.

---

## 1. The rule everything was tested against

`docs/bias-pool-gatekeeping.md` §A: **the RECORDING** must be public domain, CC0, or CC-BY — not
NonCommercial (we trim), not NoDerivatives (we trim and loudness-normalise), and CC-BY-SA only with
engineer sign-off. Its own warning is the one that did the work here: *a PD composition is not a PD
recording; a modern performance of Beethoven is copyrighted.*

Beethoven's music has been out of copyright for a very long time. **Almost nothing that follows was
rejected over the music.** Every rejection below is about a performance.

---

## 2. What cleared

| Position | Work | Performer | Licence |
|---|---|---|---|
| 4 | Eroica Variations, Op. 35 | Ivan Ilić | CC BY 3.0 |
| 9 | Piano Concerto No. 5, 'Emperor' | Ursula Oppens · DuPage Symphony Orchestra · Barbara Schubert | public domain (dedicated) |
| 12 | Violin Concerto | US Marine Chamber Orchestra | public domain |
| 14 | Piano Sonata No. 29, 'Hammerklavier' (III) | Eric Xi Xin Liang | CC BY 4.0 |
| 15 | Diabelli Variations | Marvin Wolfthal | CC0 1.0 |
| 19 | Symphony No. 3, 'Eroica' | Czech National Symphony Orchestra (Musopen) | public domain |

Four of these are self-published by the performer, one is a US Government work, and one is a
commissioned public-domain recording this repository already draws on for the Prestige pool. That
pattern is the finding: **the freely licensed classical recordings that survive scrutiny are the ones
somebody deliberately gave away**, not the ones an uploader tagged.

---

## 3. What was rejected, and why it matters

### 3a. A complete symphony cycle, tagged public domain, that is not

A Beethoven cycle conducted by Frédéric Chaslin with the Jerusalem Symphony Orchestra sits on
archive.org under a Public Domain Mark. It would have been ideal — all nine symphonies, one
conductor, one orchestra, so the only thing varying across the pool would be the work.

It is a **2012–13 performance by a living conductor, uploaded by a third party**, and the item's own
description mentions the tracks having been taken down elsewhere. A Public Domain Mark applied by
someone who does not hold the right is not a licence. Rejected.

### 3b. Every historical transfer, on a rule rather than a hunch

Stokowski's 1927 Symphony No. 7, Schnabel's c.1935 Hammerklavier and Op. 111, Serkin and Walter's
1941 Emperor, Toscanini's 1934 and 1940 Missa solemnis, a 1937 *An die ferne Geliebte* — all carry
public-domain tags on archive.org, and all cover works on the ranking.

**US sound recordings published between 1926 and 1946 get 100 years from publication**, so as of 2026
only recordings published *before 1926* are in the public domain there. Not one of these clears it.
The earliest, at 1927, misses by a year. One item states its reasoning outright — that works
published before 1978 got 75 years — which is a rule about printed works and not about recordings.

This is the largest single category of false positive, and it would have been the easiest to accept:
the tags are machine-readable and they say the right word.

### 3c. Even if the licences had held, the sound would have decided the ratings

Worth recording separately, because it is a measurement objection rather than a legal one. A pool
mixing 1927 Victor shellac with a 2011 digital orchestra makes **recording era** the loudest acoustic
variable in the room. This product already has an instrument for that — the Delicacy Trials measure
sensitivity to bandwidth and codec damage. A listener rating the shellac lower would be demonstrating
delicacy while we reported it as something else entirely.

### 3d. Canada-hosted "public domain" is not public domain here

IMSLP marks a large body of recordings **"Public Domain — Non-PD US"**: free where the site is
hosted, still restricted in the United States. Most complete performances of the famous works are in
this category, including nearly every Emperor and Hammerklavier on the site.

**This is the trap that nearly got through.** A first scan matched the licence *prefix* and counted
`Creative Commons Zero` as clean. The full value was `Creative Commons Zero 1.0 - Non-PD US`, on a
1953 Deutsche Grammophon recording. The guard in `ranking.test.ts` therefore matches **exact allowed
values** rather than blocking known-bad substrings: the failure mode was a good prefix with a bad
suffix, and a blocklist has to guess the suffix in advance.

### 3e. Arrangements and machine performances are not performances of the work

A substantial share of the freely licensed Beethoven audio on IMSLP is recorder-ensemble
arrangements, brass and accordion transcriptions, synthesizer renderings, and playback from notation
software. These are properly licensed and genuinely free; they are simply not the work as scored, and
a rating of one is not a rating of the other.

---

## 4. Two process failures during this search, recorded because they nearly changed the answer

1. **A page summary said "no" while listing the thing it was asked for.** Asked whether the Violin
   Concerto page had any qualifying recording, a summary answered *No* and then enumerated
   "Public Domain (dedicated) — US Marine Band recording" in the same reply. That recording is in the
   final pool. Two further summaries reported no qualifying recordings for Symphony No. 5 and No. 7
   where the raw pages did contain public-domain-dedicated entries — for scores, as it turned out, but
   the summaries could not be relied on either way. **Every licence in the pool was read off the page
   itself.**

2. **A structural parser produced a confident false negative.** After proximity matching attributed a
   licence table to the wrong upload, the scan was rewritten to split the page into upload blocks —
   correctly, and it still missed the Hammerklavier entry, because that file is an M4A whose duration
   IMSLP does not display and the parser keyed on a duration. It was found by reading the page by
   hand. Had it stayed missing, the pool would have had five works and **two** close pairs, and this
   document would have recorded a failure that was not true.

The general form of both: **the tool that summarises and the tool that parses fail in opposite
directions, and neither announces it.** The pass/fail was pre-registered so that it could not be
decided by whichever scan ran last.

---

## 5. Limits that ship as disclosure, not as footnotes

- **A forty-second excerpt cannot carry a critic's verdict on a forty-minute work.** The clip length
  is 40s rather than the 20s used elsewhere in this product. That is a mitigation, not a solution.
- **Several of these works are famous enough that recognition contaminates a blind rating.** Handled
  by a one-tap "heard this before" filter, computed on unrecognised clips only, disclosed as
  self-report — a filter, never a measurement.
- **Six works, six productions.** Three solo piano, two concertos, one orchestral; two recorded live.
  Production differences are real and are not caused by the ranking. The guard asserts only that the
  confound is not *aligned* with the statistic — cross-forces pairs fall on both sides of the
  far/close split — which is weaker than removing it, and is stated as such.
- **Agreement with the critic is never scored**, and the module makes it uncomputable rather than
  merely unused: the pool exposes the distance between two list positions and never which of the two
  the critic placed higher.
