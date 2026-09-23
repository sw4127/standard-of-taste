# Commission — batch 6, the prompt card

**Hand this to Cowork verbatim.** Written by engineering (E21), after the card shipped.
PM ruling RT-AB1 (a), 2026-09-22.

---

## Why this batch exists, and why it is urgent rather than tidy

The other five batches were written against copy that had sat for weeks or months. **This
surface was built and shipped in a single session on 2026-09-16, by one engineer, in six
slices, and every string in it was written in the same afternoon as the code underneath it.**
It is the newest copy in the product and it is on the screen that the whole product now ends
in.

It is *gate-clean* — it passes the voice gate and four dedicated rules — and the voice gate's
own docblock says what that is worth: *"It cannot tell you a line is DULL… 'on-voice but flat'
has no surface form, and no amount of regex will find it."* Two lines engineering would not
defend in review are named at the bottom of this file.

## Why it is a document rather than deck ids

The card's strings are assembled templates with slots, so they *look* like deck material. They
are not in `docs/copy-deck.md`, because the deck's machinery is wired to the vocabulary layer
(`src/content/vocabulary/`) and the card is a new module outside it. Wiring it in is real work
and nobody has ruled on it. So this batch is commissioned as a document, like batch 5, and the
strings are reproduced below with the file and export name that renders each one, which is what
lets an edit land exactly.

---

## The message

> This is batch 6 of the copy commission for a listening-instrument product called **Standard
> of Taste**.
>
> **Read `docs/copy-commission.md` first** for the product and the voice. **Read its D1
> paragraph twice**, because it changed on 2026-09-16 and this batch is the reason: D1 —
> *every sentence is about the performance, never the person* — now has **one exception, one
> surface wide, and your batch is that surface.**
>
> ### What this surface is
>
> The product measures how small an audio flaw a listener can hear and reports a threshold in
> physical units — cents of detune, milliseconds of timing drift, kbps of compression damage.
> That number turned out to be the wrong thing to end on. It is *evidence*; nobody would keep
> it. The **prompt card** is what the product ends in now: a short block that turns the
> measurement into words the reader can paste into a text-to-music generator, assembled
> deterministically from what they actually discriminated. It sits **above** the number on the
> result screen, and the number stays below it so a reader can check any sentence against it.
>
> ### The rule that replaced D1 here, and it is narrower than "anything goes"
>
> **OFFER, DO NOT ASSERT.**
>
> - ✗ *You have unresolved loss.*
> - ✓ *You chose the take with the slower decay every time — the one that lets the room finish
>   speaking.*
>
> The second still speaks to the person, and claims nothing the session cannot support. That
> is the target register for this batch. Every line should name something the reader **did**,
> in the unit it was measured in, and may then offer what it might be worth to them.
>
> ### Four rules that are tests, not preferences
>
> A rewrite that trips one of these fails the build with your sentence quoted back, so it is
> worth knowing them before you write rather than after:
>
> 1. **No causal promise.** The card never claims it improves anybody's output. That is
>    unmeasured. No "better results", no "will improve your mixes".
> 2. **No assertion about trauma, abuse or mental health.** Not squeamishness — that is the one
>    class where being wrong lands on a person rather than on a number.
> 3. **No comparison between people.** No percentile, no cohort, no "most listeners". There are
>    **zero** real respondents; the card describes one ear and says so.
> 4. **Nothing may count.** The card renders after a sitting that measured **one** flaw family
>    and after one that measured **three**, so "the other two", "all three" and "both" are
>    false half the time.
>
> ### Three measured facts you must not write around
>
> These look like hedging and are findings. Copy that removes them makes the product lie:
>
> - **The compression ladder supports ONE resolution band.** It can report a threshold and
>   cannot say how *finely* it was heard. Pitch and timing support two. Any sentence implying a
>   fineness comparison on compression is false.
> - **"Not enough to tell" is the card's COMMON output, not its edge case.** Across listeners
>   spread over a ladder's full range, a usable threshold comes back in 80% of pitch sittings,
>   **30%** of timing, and **16%** on one compression source. Many readers will meet a card that
>   declines to say anything about the family they just sat. That refusal needs to read as a
>   fact about the instrument, not as a verdict on them.
> - **A listener can be finer than the instrument.** If they caught the gentlest version the
>   ladder can make, there is no number — but there is a real performance, and saying nothing
>   would be its own dishonesty.
>
> ### What to return
>
> Edited prose for the strings below, keyed by their export names. **Keep every `${…}` slot
> exactly where it is** — those are the measured quantities, and a slot moved into a sentence
> that no longer fits it is how this project once printed a family name as a literal.
>
> **The one sentence you may not simply rewrite** is `CARD_STATEMENT`. It lives in the
> constitution (`CLAUDE.md`, "D1 amendment") and a test fails the build if the card renders
> anything else. Propose a better one and engineering will amend the constitution; do not treat
> it as loose copy.

---

## The strings — 29, plus one constitutionally bound

### `src/content/card/copy.ts` — the three headings

| Export | Current |
|---|---|
| `CARD_SEPARATES` | What your ear separates |
| `CARD_WORTH` | What that is worth in a prompt |
| `CARD_PASTE` | Paste this |

### `separatesLine` — one per outcome, six branches

`${figure}` is the screen's own figure, e.g. "12.5 cents", "63 ms", "96 kbps".
`${family}` is the flaw's name, e.g. "Pitch drift".

| Branch | Current |
|---|---|
| fine | `${family}` is something you hear finely. You were still calling it at `${figure}`. |
| coarse | `${family}` had to move as far as `${figure}` before you called it. |
| measured (one-band ladder) | `${family}`: you were calling it at `${figure}`. This ladder is too short to say how fine that is. |
| finer than the instrument | `${family}`: you caught the gentlest version this instrument can make. Your ear is somewhere past where it can follow. |
| coarser than the instrument | `${family}`: even the harshest version went past you. That is a fact about this sitting, not a limit. |
| nothing resolved | `${family}`: this sitting could not tell. Not enough of it resolved to say anything. |

### `worthLine` — one per recommendation, four branches

`${axis}` is the prompt axis, `${neutral}` the fallback tag — both in the table below.

| Branch | Current |
|---|---|
| worth spending | Spend words on `${axis}`. You will hear whether they were obeyed. |
| not worth spending | Spend your words elsewhere. Ask for `${neutral}` and leave it there — a finer request is one you could not check. |
| no fineness claim available | Ask for `${neutral}`. Nothing here says a finer request would be worth the words. |
| nothing resolved | Nothing to spend on `${axis}` from this sitting. It did not resolve enough to say. |

### `src/content/card/axes.ts` — the vocabulary, 12 strings

The **precise/neutral split is load-bearing, not stylistic**: a descriptor is only worth
spending where the reader could hear whether it was obeyed, so a coarse axis gets *one* tag
asking for the ordinary thing rather than a smaller version of the same request.

| Family | Axis name | Precise tags | Neutral tag |
|---|---|---|---|
| pitch drift | tuning character and pitch stability | clean intonation · stable pitch across the take | natural tuning |
| timing smear | groove, timing feel and tightness | tight timing · the groove locked to the grid | natural timing |
| compression damage | mix aesthetic, fidelity and production polish | open high end · detail intact in the reverb tails | clean master |

**No generator is ever named** on this surface (PM ruling RT-Z8 a). Generic words only, so the
card does not age when the tools change.

### `CARD_CHROME` — the panel's four labels

| Export | Current |
|---|---|
| `CARD_KICKER` | Your prompt card |
| `CARD_COPY_IDLE` | Copy |
| `CARD_COPY_DONE` | Copied |
| `CARD_COPY_MANUAL` | Selected — press copy |

`CARD_COPY_MANUAL` is the label **a large share of readers will actually see**: the clipboard
API refuses whenever the browser tab is unfocused, and the card then selects the text instead.
It was the string least likely to be reviewed and is worth more attention than its length
suggests.

### `src/content/card/statement.ts` — bound to the constitution

> This card speaks to you about what the reading might mean for you. Everything else in the
> gym describes only what you did.

*(Narrowed from "on this site" on 2026-09-23, when the snack became a second surface that may
speak about the reader — CLAUDE.md, "D1 amendment, second surface". It is still bound to the
constitution: change the amendment, not this.)*

---

## Engineering's own view, so you are not guessing at what we already dislike

- **"That is a fact about this sitting, not a limit"** — defensive, and explains nothing. It is
  trying to stop a reader feeling judged and instead sounds like it is apologising.
- **"Nothing here says a finer request would be worth the words"** — a double negative doing
  the work a plain sentence should do.
- The whole set was written in one slice by the engineer who wrote the code under it, which is
  the worst position from which to judge whether a sentence lands.

## What this batch is NOT

Not the layout. The card's position — above the number, expert view below — is a ruling
(RT-Z7 b) and not open. Not the figures: every number is slotted from the engine and a rewrite
must not resolve one into literal text.
