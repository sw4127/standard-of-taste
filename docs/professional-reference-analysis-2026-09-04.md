# Can the professional reference point be extended to the rest of the product?

**Written 2026-09-04 at the close of Track I (E16), at the PM's request.** Track I shipped a
reference point borrowed from professional music criticism — what Pitchfork and Robert Christgau
actually do with their own rating scales — because their catalogue can never be played here but
their *scales* can be quoted freely. The PM asked whether that move generalises to the other
instruments or to the product as a whole, and said to queue it as a track if it is substantial.

**It generalises, it is substantial, and it should be a track. Recommended name: TRACK P.**

---

## 1. The rule that makes it safe, and it is narrower than it looks

The critic-scale reference is not "here is what experts score, compare yourself". It is **a fact
about the ruler, never about the ruled.** Pitchfork's scale offers a hundred and one places to put a
record; across more than 18,000 reviews the mean was 7.0. That is a statement about an
*institution's use of its own instrument* — it says nothing about any reader, ranks nobody, and
cannot become a percentile by accident.

**That distinction is the whole licence, and crossing it breaks N3 immediately.** "Trained listeners
detect pitch differences of about five cents" is a published figure and it is a *population
statistic about people's performance*. Printing it beside a reader's threshold makes it a norm — a
cohort comparison wearing a citation — and this product has spent four sessions refusing exactly
that with n = 0. **So the test for every candidate below is: does the citation describe the
measuring apparatus, or does it describe how well people score?** Only the first kind may ship.

A second rule, inherited from Track I: **anything that cannot be opened does not ship.** Rolling
Stone's own account of its star ratings was wanted for the critic panel and is absent because the
page answered with a payment wall.

---

## 2. Instrument by instrument

### 2a. The Threshold Test — the strongest case, and the cheapest

It already reports in physical units (cents, milliseconds, kbps), which is precisely where published
professional practice lives.

**The product already stands on two professional standards and tells the reader neither.**

- `scripts/clip-pipeline` normalises every clip with **EBU R128** loudness measurement, recorded in
  `src/content/bias/items.ts` and visible nowhere a reader can see it.
- `scripts/clip-pipeline/validate.mjs` uses a **320 kbps MP3 round-trip as its transparency anchor**
  — its own docblock calls it "the standard example of" transparency — and that reasoning is
  likewise invisible.

Those are not new citations to source. They are decisions already made, already load-bearing, and
already written down internally. **Surfacing them is the cheapest credibility this product has left
lying around**, and it is a fact about the apparatus, so it passes §1 cleanly.

### 2b. The Delicacy Trials — a real standard, and a real difference from it

**ITU-R BS.1534 (MUSHRA)** and **ITU-R BS.1116** are the recommendations governing subjective
listening tests. Verified by opening the ITU's own published recommendation. The useful part is not
that we match them — it is that we *differ*, in a way we can defend:

- **BS.1534 (MUSHRA) is for intermediate quality; BS.1116 is for very small impairments.** Our
  delicacy pairs sit at near-transparent damage, so the applicable regime is BS.1116, not the
  MUSHRA scale most people have heard of. Saying so is a sharper credential than claiming
  compliance with either.
- **MUSHRA rates each sample on a 1–100 scale.** Pitchfork offers 101 places. The professional
  audio standard and the professional music critic independently chose about a hundred degrees, and
  this product offers eleven and asks only how many you used. **That is the Track I argument
  arriving from a completely different discipline**, and it is the single most interesting sentence
  in this analysis.
- Our `AbCompare` presents a forced choice between two samples with a required listen. Where that
  departs from the recommendation's design, the departure is a limit to publish, not to hide.

### 2c. The Prestige Test — possible, and the most dangerous

There is a large published literature on blind-versus-labelled judgment. **Most of it is off-limits
under §1**: an effect size from a wine study is a population statistic about people, and printing it
beside a reader's sway percentage manufactures the norm this product refuses to have.

What *is* safe is the same shape as Track I: **what the critical institutions do about the problem.**
Whether reviews are conducted blind, whether scores are revised, whether a publication discloses
promotional relationships — these are facts about editorial apparatus. Sourcing them is real
research with an uncertain yield, and this is the strand most likely to come back empty.

### 2d. Good sense (calibration) — plausible, unverified

Brier scoring came from weather forecasting, and operational forecast verification is a published
professional practice with published standards. **I have not opened a source for this**, so it is
listed as a candidate, not a plan. The §1 line is thin here: "forecasters are well calibrated" is a
claim about people's performance and would not pass; "forecast verification uses this scoring rule
and reports it this way" is about the apparatus and would.

### 2e. The retest arc (practice) — already conformant, never stated

The arc refuses to call a change real unless it exceeds a measured noise floor. That is
test–retest reliability practice, and the product implements it without ever naming the tradition
it is implementing.

---

## 3. What this would cost

Track I's comparable work was three slices: source the citations and bind each figure to the page it
came from (S1), write the sentences through the deck (S4), and put them on a surface (S6/S7). The
sourcing is the expensive part and it is the part that can fail — S1 lost Rolling Stone to a
paywall, and the whole audio half of Track I died at the sourcing stage.

Rough shape, in risk order — **the certain work first, because §2a needs no external sourcing at
all**:

| Slice | Work | Can it fail? |
|---|---|---|
| P1 | Surface the two standards the pipeline already uses (EBU R128, the 320 kbps anchor) | No — already in the repo |
| P2 | The ITU recommendations, opened and bound, with our differences stated | Low — the ITU publishes its own PDFs |
| P3 | The cross-domain degrees sentence (MUSHRA's 100, Pitchfork's 101, our eleven) | No — rests on P2 |
| P4 | Calibration and prestige strands, each gated on opening a source first | **Yes — most likely to return empty** |
| P5 | A reading-room page collecting the apparatus this product borrows from | No |

**Five slices, one of which is a genuine gamble.** That is a track, not an addendum to another one.

---

## 4. Recommendation

**Build P1–P3 as Track P; put P4 behind the same pass/fail discipline Track I used** — open the
source before writing anything that depends on it, and record the failure on `/lab/falsified` if it
does not hold up.

The reason to want this is not decoration. The product's credibility problem is that every
psychometric figure it publishes is simulated and its cohort is zero, so it cannot appeal to data
about people. **What it can do is show that its rulers were not invented here** — that the loudness
normalisation, the transparency anchor, the listening-test design and the eleven-point scale all sit
in a tradition with published standards, and that where this product departs from them it says so.
That is an argument available at n = 0, and it is the only kind that is.

**One honest caution against my own recommendation:** the product already carries a great deal of
methodological prose, and a reader who wanted a number about their ear is not obviously helped by
learning which ITU recommendation the trials resemble. §2a and the degrees sentence in §2b earn
their place because they are short and surprising. If Track P grows past that into a survey of
standards, it has become the resume theatre N2 forbids, and it should be cut back to the two
paragraphs that actually change what a reader believes.
