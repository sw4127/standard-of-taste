# MOCK — the preference instrument's output, written before anything is built

**THIS DESCRIBES A FEATURE THAT DOES NOT EXIST.** Nothing in this file is shipped, reachable, or
linked from any public surface. Every number in it is **invented for the purpose of being judged**,
and none of it may be quoted anywhere as a measurement. It exists to answer one question, cheaply,
before a line of code: *would a person spend five minutes to receive this?*

Written 2026-09-13 under PM ruling RT-P1 (a).

---

## The argument this is testing

The project rests on two user findings, both from listener interviews. It serves the first well and
the second not at all:

> Past listening predicts less than present and forming taste.
> **Almost nobody can describe their own taste in words.**

Four instruments turn **damage** into language — pitch drift, timing smear, compression. None turns
**preference** into language. The owner's objection, 2026-09-13: a person using a generation tool is
not worried about codec artifacts; they are worried that they cannot say what they want. That is the
second finding, unserved, and it is the one with a customer in front of it.

---

## What the person does

**Five minutes, no account.**

1. **They say what they like.** Six forced choices between two short statements — *"I like music that
   feels open and unforced"* against *"I like music that feels tight and controlled"*. This is
   self-report, and it is the only self-report in the product. It is not scored. **It is the thing
   the test is about to contradict.**
2. **They listen to twelve pairs.** Each pair is one passage, rendered twice, differing on exactly
   one dimension. Same performance, same notes, same arrangement. They pick which one they would
   rather hear more of. There is no right answer — but there is a *consistent* answer, and
   consistency is what gets measured.
3. **The engine compares the two.** Where blind choices agree with the description, it says so and
   stops. Where they disagree, that is the result.

**The dimensions are the ones this project's own pipeline can already render**, which is why this is
feasible at all: brightness, dynamic range, tempo, reverb space, saturation, stereo width. The same
toolchain that renders the damage ladder renders these.

---

## The output, verbatim as a person would read it

> ### You described yourself twice, and the two descriptions disagree.
>
> You said you like music that sounds **open and unforced**. Blind, you chose the tighter, more
> heavily compressed take **nine times out of twelve** — and you were quickest on exactly those
> choices, which is what preferring something usually looks like.
>
> That is not a correction. It is the more useful of the two descriptions, because it is the one your
> ears produced when nothing was labelled.
>
> **Where your choices and your words agreed**
>
> - **Warmth** — you said warm, you chose warm, ten of twelve. Settled.
> - **Space** — you said close and intimate, you chose it eleven of twelve. The strongest thing this
>   session found about you.
>
> **Where they disagreed**
>
> - **Dynamics** — you said open; you chose controlled, nine of twelve.
>
> **Where it found nothing**
>
> - **Tempo** — seven of twelve is what a coin does. Either you do not have a preference here, or
>   twelve pairs were not enough to find it. This session cannot tell those apart, and says so
>   rather than picking the flattering one.
>
> ### In words a generation tool will take
>
> **warm · close · tightly controlled dynamics · no strong tempo preference**
>
> Those four are what your ears chose, not what you said. If you have been asking for *open* and
> *airy* and disliking what comes back, that gap is the most likely reason.
>
> ### What this cannot tell you, and it is a lot
>
> Every pair you heard was **the same performance, re-rendered**. Nothing changed in the melody, the
> arrangement, the structure or the words. So this says nothing about whether you like a strong
> bridge, a chorus that lifts, a long intro, or a particular feeling — and a version of this page
> that claimed otherwise would be inventing.
>
> It also cannot tell you whether asking for those four words improves anything you make. Nobody has
> measured that. It reports what you chose, on these twelve pairs, this evening.

---

## What the owner is being asked to judge

**Would you spend five minutes to receive that?** Not "is it clever" — would you.

Three specific things worth a yes or no:

1. **Is the contradiction the hook?** The design bets everything on one moment: *you said open, you
   chose controlled*. If that lands, the product has a reason to exist for someone who does not care
   about codec artifacts. If it reads as a parlour trick, it does not.
2. **Are four production words enough?** The honest ceiling is *warm, close, controlled, no tempo
   preference*. It is real, it is earned, and it is nothing like "you like songs with great
   bridges". Is the honest version worth having?
3. **Would you take the gym afterwards?** This was proposed as the thing that comes BEFORE the tests,
   to earn the right to ask. Does receiving the above make you more willing to spend eight minutes on
   the Prestige Test — or less, because you already got what you came for?

## What it would cost, stated before anyone is excited

- **A fifth instrument**, which the Phase 3 kill list currently refuses ("no new instrument — a sixth
  would be scope, not ambition"). That ruling would have to be revisited.
- **A new clip pool**: twelve pairs, six dimensions, rendered and validated through Layer A like
  every other pool. Weeks, not days.
- **One self-report step**, in a product whose constitution refuses self-report (D2). The defence is
  that it is not scored and exists only to be contradicted — but that is an argument, and it needs a
  ruling rather than my confidence.
- **The transfer claim stays refused.** The output above deliberately stops short of "ask for these
  and your tracks will improve", because nothing measures that. If the product is only worth building
  WITH that promise, it should not be built.

## The cheapest thing that is not this

Putting a real result on the front door — Track O, already approved, thirty-five minutes of the
owner's time — also fixes "no value before the ask", without a new instrument or a revisited ruling.
It is a different fix for the same complaint, and it is orders of magnitude cheaper. **These are not
alternatives to each other; the question is whether the second one is enough.**
