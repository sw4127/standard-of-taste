/**
 * WHAT THE GYM SAYS WHEN THE SESSION ENDS (E5/S5, 2026-08-20).
 *
 * ONE SENTENCE HAS TO CARRY THE WHOLE PRODUCT: a per-flaw sensitivity threshold
 * in physical units (CLAUDE.md, D4 amendment). Not a score, not a tier, not a
 * comparison to people who do not exist.
 *
 * FOUR OUTCOMES, AND THE THREE THAT ARE NOT A NUMBER ARE NOT FAILURES. E5/S2
 * measured that at any session length a person will sit through, the fitted
 * point is available on 84% of pitch sessions and 23-30% of lossy ones. If
 * "threshold" were the only outcome with copy written for it, most people would
 * meet a shrug. So every outcome leads with the BAND — the two rungs the session
 * can actually stand behind — and the fitted point is an extra line when the
 * ladder earned one.
 *
 * THE AXIS IS INVERTED FOR LOSSY AND THE COPY HAS TO SURVIVE IT. "You heard it
 * at 48 kbps and missed it at 160" is correct; the smaller number is the harder
 * trial. Every sentence here is built from `heardAt` / `missedAt` rather than
 * from "lower" and "higher", so no phrasing depends on which way the numbers
 * run.
 *
 * LOSSY NAMES ITS SOURCE, ALWAYS (RT-85a, N3). A bitrate threshold is a fact
 * about the listener AND the material — the same 96 kbps does 1.431 to 2.86 dB
 * of damage depending on the window. A line that said "you hear damage at 96
 * kbps" full stop would be claiming something the instrument cannot support.
 *
 * WHAT IT MAY NEVER SAY: a percentile, a cohort comparison, a claim that a
 * degradation is audible, or a verdict about the person. `src/content/voice.ts`
 * enforces all four, and every string below is registered in its test.
 */

import type { StaircaseResult, ThresholdBand } from "@/engine/staircase-session";
import { CONFIDENCE_PCT } from "@/engine/confidence";
import { isWideBand } from "@/engine/evidence";

/**
 * The short unit, DERIVED from the pipeline's own label rather than kept in a
 * second table — "cents of peak detune" -> "cents", "ms of drift IQR" -> "ms",
 * "kbps" -> "kbps". A second table is how the rung tables came to disagree.
 */
export function shortUnit(unit: string): string {
  return unit.split(" ")[0];
}

/** Human-readable family names. The only per-family strings in the module. */
export const FAMILY_LABEL: Record<string, string> = {
  "pitch-drift": "Pitch drift",
  "timing-smear": "Timing smear",
  "lossy-artifact": "Compression damage",
};

/** What the manipulation actually is, for someone who has never met the word. */
export const FAMILY_BLURB: Record<string, string> = {
  "pitch-drift": "the whole track sliding slowly out of tune across twenty seconds",
  "timing-smear": "the beat wandering off the grid and back again",
  "lossy-artifact": "the smear a low bitrate leaves on cymbals and reverb tails",
};

export function familyLabel(family: string): string {
  return FAMILY_LABEL[family] ?? family;
}

/** Numbers a person can read: 3 significant figures, no trailing noise. */
function fmt(value: number): string {
  if (value >= 100) return String(Math.round(value));
  if (value >= 10) return value.toFixed(value % 1 === 0 ? 0 : 1);
  return value.toFixed(value % 1 === 0 ? 0 : 1);
}

/** "48 kbps", "31.5 ms", "25 cents". */
export function quantity(value: number, unit: string): string {
  return `${fmt(value)} ${shortUnit(unit)}`;
}

/**
 * "on pb1" — appended wherever a lossy number appears alone.
 *
 * Empty for pitch and timing, whose units are manipulation-intrinsic: a cent is
 * a cent whatever it is played on.
 */
export function onSource(result: Pick<StaircaseResult, "sourceId">): string {
  return result.sourceId ? ` on ${result.sourceId}` : "";
}

/**
 * THE HEADLINE: the two rungs, in the family's own unit.
 *
 * Four shapes, because a band can be open at either end and the honest sentence
 * is different each time. None of them is an apology — an open end is a real
 * statement about where the instrument stopped being able to follow.
 */
export function bandLine(band: ThresholdBand, unit: string, source: string): string {
  const heard = band.heardAt === null ? null : quantity(band.heardAt, unit);
  const missed = band.missedAt === null ? null : quantity(band.missedAt, unit);

  if (heard && missed) {
    /**
     * HOW WIDE IS WIDE. A band spanning most of the ladder is a real result and
     * a weak one, and the first draft of this line did not say so — it rendered
     * "You caught the damage at 100 cents. At 8.8 cents you were guessing." for
     * a session that had bracketed nearly the entire range, which reads as a
     * finding rather than as a shrug. Six rungs of an eleven-rung ladder is over
     * half the range it can express; past that the honest word is "somewhere".
     */
    // The rule itself now lives in `@/engine/evidence` (`WIDE_BAND_FRACTION`),
    // because the creator-translation layer writes its own sentence off this
    // same band and the two must not disagree about what "wide" means.
    if (isWideBand(band)) {
      /**
       * ASCENDING BY NUMBER, not by difficulty. "Between X and Y" is read as a
       * numeric range by everyone, and on the inverted lossy axis the harder
       * rung is the LARGER number — so ordering by difficulty rendered
       * "somewhere between 160 kbps and 64 kbps", which is backwards as English
       * even though it was right as physics. The narrow sentence above does not
       * have this problem: it names each rung with what happened at it.
       */
      const [lo, hi] = [band.missedAt!, band.heardAt!].sort((a, b) => a - b);
      return (
        `Somewhere between ${quantity(lo, unit)} and ${quantity(hi, unit)}${source} is where your ear gives ` +
        `out — and that is a wide answer, covering most of the range this ladder can ask about.`
      );
    }
    return `You caught the damage at ${heard}${source}. At ${missed} you were guessing.`;
  }
  if (heard) {
    /**
     * ONE-SIDED, HEARD. This used to say "the gentlest rung this test can
     * render", which was simply FALSE: `heardAt` is the gentlest rung above the
     * interval, not the bottom of the ladder — it rendered "64 kbps on pb1 —
     * the gentlest rung this test can render" when pb1's gentlest is 160. Found
     * by reading the generated deck, which is why the deck is generated.
     */
    return (
      `You caught the damage at ${heard}${source}. Where you stop catching it is below anything this ` +
      `session managed to pin down.`
    );
  }
  if (missed) {
    return `At ${missed}${source} you were guessing, and this session never confirmed a rung you reliably catch.`;
  }
  return `This session could not separate the rungs${source}: your hits and misses landed too evenly across the ladder to say where the line is.`;
}

/**
 * The fitted point, when the ladder earned one — an EXTRA line, never the
 * headline. Its interval is printed with it because the interval is the part
 * R4 measured as honest; a bare number would be the part it argued about.
 */
export function thresholdLine(result: StaircaseResult): string | null {
  if (result.kind !== "threshold") return null;
  const unit = result.unit;
  return (
    `Fitted to a threshold of ${quantity(result.label, unit)}${onSource(result)}, ` +
    `with a ${CONFIDENCE_PCT}% interval from ${quantity(result.ci95[0], unit)} to ${quantity(result.ci95[1], unit)}. ` +
    `That interval is wide because ${result.trials} two-way choices is what it is worth.`
  );
}

/**
 * The line that explains an outcome the ladder could not contain.
 *
 * `below` and `above` are about the INSTRUMENT'S REACH, not about the person,
 * and the copy has to land that way round or it becomes a verdict.
 */
export function reachLine(result: StaircaseResult): string | null {
  const unit = result.unit;
  const src = onSource(result);
  if (result.kind === "below") {
    return (
      `Your ear went past the end of this ladder. ${quantity(result.boundLabel, unit)}${src} is the gentlest ` +
      `damage we can render, and you were still catching it — so your real limit is somewhere below that, ` +
      `and this instrument cannot tell you where.`
    );
  }
  if (result.kind === "above") {
    return (
      `You did not separate the pair at ${quantity(result.boundLabel, unit)}${src}, which is the loudest ` +
      `damage on this ladder. Whatever your limit is, it sits past the far end of what we can render.`
    );
  }
  return null;
}

/**
 * The per-rung evidence, as a sentence. This is the part that makes the band
 * checkable rather than asserted: it is the raw count behind the two rungs.
 */
export function evidenceLine(band: ThresholdBand, unit: string): string {
  const visited = band.rungs.filter((r) => r.shown > 0);
  const total = visited.reduce((a, r) => a + r.shown, 0);
  const hits = visited.reduce((a, r) => a + r.correct, 0);
  return (
    `${total} trials across ${visited.length} rungs of the ladder, ${hits} of them called correctly. ` +
    `Chance on a two-way choice is half.`
  );
}

/**
 * WHAT THIS NUMBER IS NOT (N3). Printed with every result, not folded away
 * behind a link, because with zero real sessions the absence of a cohort is the
 * single most important thing about the number on screen.
 */
/**
 * The same honesty as `NO_COHORT_FOOTNOTE`, at card length (E6/S15).
 *
 * The footnote is four sentences because a result screen has room to explain
 * why there is no percentile. A card has room for a chip. Both say the same
 * thing and neither leaves the absence for the reader to fill in, which is the
 * failure mode N3 is actually about: a card with no comparison on it reads as
 * a comparison the reader has not been shown.
 */
export const NO_COHORT_BADGE = "no percentile — cohort n = 0";

export const NO_COHORT_FOOTNOTE =
  "There is no comparison here and there is not going to be one until real people have taken this. " +
  "Nobody has: the cohort behind this instrument currently has 0 sessions in it, so every reference " +
  "curve in the Lab is generated from a model and labelled SIMULATED. What you just did was measured " +
  "on you, against physics, and stands on its own.";

/**
 * The material caveat, for lossy only — RT-85a accepted the kbps label ON
 * CONDITION that the damage variation behind it be stated.
 */
export function materialLine(result: StaircaseResult): string | null {
  if (!result.sourceId) return null;
  const spread = result.limits.find((l) => l.kind === "damage-varies-by-window");
  if (!spread || spread.damageRatio === undefined) return null;
  return (
    `A bitrate is exact, but what it destroys is not. On ${result.sourceId}, the same ${spread.level} kbps ` +
    `measures ${spread.damageMinDb} to ${spread.damageMaxDb} dB of damage across the ${spread.windows} passages ` +
    `this session drew from — a spread of ${spread.damageRatio}x. Your number is about your ear and this ` +
    `recording together, which is why the recording is named.`
  );
}

/** What a person can do next. Never a promise about what it will do to them. */
export function nextStepLine(result: StaircaseResult): string {
  const unit = shortUnit(result.unit);
  if (result.band.heardAt !== null && result.band.missedAt !== null) {
    return `Come back in a week and run it again. If the rung you catch moves, that is your ear moving, in ${unit}.`;
  }
  return `Come back in a week and run it again — a second session narrows the range, because it is more trials on the same ear.`;
}

/** Everything the result screen says, assembled in reading order. */
export function resultLines(result: StaircaseResult): string[] {
  const src = onSource(result);
  return [
    bandLine(result.band, result.unit, src),
    thresholdLine(result),
    reachLine(result),
    evidenceLine(result.band, result.unit),
    materialLine(result),
    nextStepLine(result),
    NO_COHORT_FOOTNOTE,
  ].filter((l): l is string => l !== null);
}

/**
 * WHAT THE GYM SAYS WHEN IT REFUSES A RETEST (RT-89a, D4 amendment).
 *
 * The refusal and the reason arrive together. A gate that says only "not yet"
 * reads as withholding, and this one is not withholding anything — there is no
 * paid tier and never was (D4 amendment, RT-44a). It is refusing to hand back a
 * number it already knows is contaminated, which is the honest thing a
 * measuring instrument does (N3).
 *
 * It also does not scold. The user did the right thing by coming back; they
 * just came back early, and the second line tells them what the wait buys
 * rather than what they did wrong.
 */
export function cooldownTitle(family: string): string {
  return `You measured your ${familyLabel(family).toLowerCase()} this week.`;
}

export function cooldownBody(daysLeft: number): string {
  const when = daysLeft === 1 ? "Tomorrow" : `In ${daysLeft} days`;
  return (
    `Run it again now and the staircase will find a smaller rung — not because you hear better, ` +
    `but because you remember the recordings. ${when} that memory has faded and the number means ` +
    `your ear again.`
  );
}

/**
 * The way out of the gate. It lives here and not in the JSX because a fragment
 * in a component is a fragment outside the voice gate — the exact hole that
 * swallowed the lines either side of PROVISIONAL_FOOTNOTE.
 *
 * It offers the other two instruments rather than a countdown to this one: the
 * cooldown is per family, so there is always something to measure today, and a
 * gate that only says "wait" wastes a visit that could have produced a number.
 */
export const COOLDOWN_ALTERNATIVE = "Measure a different flaw instead";

/**
 * WHERE THE GATE'S MEMORY LIVES, SAID ON THE SCREEN THAT USES IT (E13/S3,
 * Track G2, RT-G b).
 *
 * The refusal above opens with "You measured your pitch drift this week" — the
 * product asserting it remembers this person — and until now nothing on that
 * screen said WHERE that memory is kept or that it dies with the browser. Two
 * people are wronged by the silence in opposite directions: the one who
 * measured on their phone and is now refused on their laptop for no stated
 * reason, and the one who assumes we have a file on them. Neither is true, and
 * both are answered by one sentence.
 *
 * It also has to say this WITHOUT reading as an invitation to clear storage and
 * dodge the wait. So it states the fact and not the workaround: the reason to
 * wait is in `cooldownBody` and it is about the number, not about us.
 */
export const COOLDOWN_DEVICE_NOTE =
  "Remembered in this browser only — no account, nothing on a server. Another device, or cleared " +
  "browsing data, and the gym has never met you.";

/**
 * THE THRESHOLD SHARE CARD (E6/S15, PM ruling RT-108a a).
 *
 * The Gym's flagship instrument had no share affordance at all, while the two
 * fixed-form tests both had one. That is backwards: a per-flaw threshold in
 * physical units is the most distinctive thing this product makes, and
 * CLAUDE.md's north star names the shareable stat card as what carries it.
 *
 * A CARD IS A FIGURE AND A CAPTION, so the long `bandLine` prose does not go on
 * it — that sentence has four shapes and up to thirty words. What travels is
 * the band as a numeral with its unit, plus one line naming what it is. The
 * card is deliberately a STAT, the same ruling RT-111a made for delicacy.
 *
 * IT MUST NEVER PRINT A NUMBER FOR A SESSION THAT PRODUCED NONE. An
 * inconclusive session has no figure, and the card says so rather than
 * borrowing the nearest rung — the anti-clone clause bans scores and ranks, and
 * a fabricated figure would be worse than either.
 */
export function thresholdCardFigure(result: StaircaseResult): string {
  const u = shortUnit(result.unit);
  if (result.kind === "inconclusive") return "no reading";
  // `below` and `above` put the LADDER'S BOUND on the card, not a comparison
  // against it. See the caption for why.
  if (result.kind === "below" || result.kind === "above") {
    return `${fmt(result.boundLabel)} ${u}`;
  }
  const { heardAt, missedAt } = result.band;
  if (heardAt !== null && missedAt !== null) {
    // ASCENDING BY NUMBER, for the reason `bandLine` gives at length: on the
    // inverted lossy axis the harder rung is the LARGER number, so ordering by
    // difficulty renders "160-64 kbps", which is right as physics and backwards
    // as English.
    const [lo, hi] = [heardAt, missedAt].sort((a, b) => a - b);
    return `${fmt(lo)}–${fmt(hi)} ${u}`;
  }
  if (heardAt !== null) return `${fmt(heardAt)} ${u}`;
  if (missedAt !== null) return `${fmt(missedAt)} ${u}`;
  return "no reading";
}

/**
 * One line under the figure. Names the measurement; never ranks the person.
 *
 * IT CARRIES THE DIRECTION IN WORDS, NOT IN A COMPARISON, and that is what
 * makes it safe on the inverted lossy axis. The first version wrote "under 160
 * kbps" for a `below` result — meaning the listener heard damage even at the
 * gentlest rung, which on that ladder is the HIGHEST bitrate. "Under 160" reads
 * as more damage, i.e. the opposite of what happened. The handoff's standing
 * warning is that any new consumer reading magnitudes must reckon with
 * `flipAxis`; a card is a consumer reading magnitudes, and I did not.
 *
 * "Gentlest" and "loudest" are true on both axes because they describe the
 * ladder rather than the number, which is the same move `reachLine` makes.
 */
export function thresholdCardCaption(result: StaircaseResult): string {
  const flaw = familyLabel(result.family).toLowerCase();
  const src = onSource(result);
  if (result.kind === "inconclusive") return `${flaw}${src} — the session ended without a reading`;
  if (result.kind === "below") {
    return `the gentlest ${flaw}${src} this test can render — and I still heard it`;
  }
  if (result.kind === "above") {
    return `the loudest ${flaw}${src} this test can render — and I missed it`;
  }
  return `the smallest ${flaw}${src} I can still hear`;
}

/**
 * THE SHARE BLOCK'S OWN STRINGS (E6/S16).
 *
 * They live in the deck rather than the component for the reason the delicacy
 * card taught us the hard way: a fragment in JSX is a fragment the hazard gate
 * never reads, and that is where "a coin flip calls 3" survived for months.
 */
export const THRESHOLD_SHARE_LABEL = "Share this number";
export const THRESHOLD_STORY_LABEL = "Story card";

/**
 * What travels with the link. It states the measurement and never ranks the
 * person, and it carries no cohort claim — there is no cohort (N3).
 */
export function thresholdShareText(result: StaircaseResult): string {
  const flaw = familyLabel(result.family).toLowerCase();
  if (result.kind === "inconclusive") {
    // THE TRIAL COUNT IS NOT DECORATION. The hazard gate rejected the first
    // version of this line for citing no measured quantity, at full share
    // intensity — correctly: a share that says only "it did not work" is a
    // claim about the instrument with nothing behind it. The count is what was
    // actually spent, and it is the honest thing an inconclusive session has.
    return `${result.trials} trials of the ${flaw} staircase and it still could not read me. Think your ears do better?`;
  }
  return `${thresholdCardFigure(result)} — ${thresholdCardCaption(result)}. Measured, not guessed. Your turn.`;
}

/**
 * THE SNACK, BESIDE THE INSTRUMENT (PM direction, 2026-08-22).
 *
 * The legacy music read is a SIDE PRODUCT and it stays (PM ruling RT-125a). The
 * PM's framing is that it should read as a snack sitting PARALLEL to the Gym —
 * not a warm-up for it, and not a paywall bolted to the end of it.
 *
 * The homepage called it "Warm-up", which makes it a lesser thing you do first,
 * and `/fan-verdict` funnels into it as an upsell. Only `BiasFlow` had it right
 * already: "a shorter, sillier one next door".
 *
 * IT OWNS THAT IT MEASURES NOTHING, and that is the whole trick. Next to an
 * instrument that reports cents of detune with an interval, a taste read that
 * quietly implied the same rigour would be the dishonest kind of fun. Saying
 * out loud that there is no measurement behind it is what makes it safe to
 * enjoy — and it is the only framing that does not spend the Gym's credibility
 * to sell the snack (N3).
 *
 * PLACED IN THE COOLDOWN GAP because that is the one pause the product creates
 * on purpose: a person told to come back in seven days has time and nothing to
 * do with it.
 */
export const SNACK_LEAD = "Something lighter while you wait.";

export const SNACK_LINE =
  "Five taps on what you actually listen to, and a verdict with no measurement behind it. " +
  "No clips, no ears, no interval — the opposite of this, on purpose.";

export const SNACK_CTA = "Take the five-tap one";

/**
 * HOW BIG THE CARD'S HERO FIGURE CAN BE (E6/S25).
 *
 * THE BUG THIS FIXES SHIPPED IN E6/S15 AND I VERIFIED THAT CARD BY HTTP 200.
 * The size was chosen by CHARACTER COUNT — `figure.length > 12 ? 108 : 150` —
 * and "48–128 kbps" is eleven characters, so it took the 150px treatment and
 * rendered 979px wide inside 920px of usable card. So did "64–160 kbps" at
 * 983px. Two of the eleven figures the instrument can actually produce, both
 * lossy bands, clipped on every share.
 *
 * Characters are not width. A digit is roughly twice a full stop, and the
 * lossy bands are almost all digits.
 *
 * SATORI CANNOT MEASURE TEXT, so the width is estimated. `EM_PER_CHAR_FIGURE` is not a
 * guess: Fraunces 900 was measured in a real browser across every figure this
 * instrument produces, and the worst case came out at 0.593 em per character
 * ("48–128 kbps"). 0.62 is that worst case with headroom, which is the right
 * side to err on — an over-estimate shrinks the type slightly, an
 * under-estimate clips the number the whole card exists to show.
 *
 * E7/S15 — RE-MEASURED, AND THE CODE NOW MATCHES THE PARAGRAPH ABOVE.
 *
 * That paragraph said 0.62 twice. The constant said 0.6, and `git log -S` says
 * it was never anything else — so the file justified 4.6% of headroom while
 * shipping 1.2%.
 *
 * `em-metrics.test.ts` settles it by rendering through the real Satori with the
 * real bundled font and reading the LAID-OUT width off the pixels. It
 * reproduces the original browser measurement to three decimals ("48–128
 * kbps" = 0.5936 against the 0.593 recorded above), which is good evidence for
 * both. It also finds six governed figures ABOVE 0.6, worst "100 ms" at 0.6183
 * — percent signs, spaces and short strings all push the per-character
 * average up, and the delicacy band figures are full of them.
 *
 * NOTHING WAS CLIPPING. Every one still fits, because FIT_SAFETY was carrying
 * the margin exactly as it was designed to. But "64–160 kbps" rendered 840px
 * against an 846px target — the model was accurate there by luck, not by
 * cover. 0.62 restores the cover the paragraph always claimed, and the sweep
 * fails if a future figure exceeds it.
 */
export const EM_PER_CHAR_FIGURE = 0.62;

/**
 * PROSE IS NARROWER THAN FIGURES, AND ONE CONSTANT FOR BOTH IS WRONG (E6/S27).
 *
 * Measured in the same browser session as the figure constant, with the same
 * bundled Fraunces: a digit-heavy figure runs 0.594 em per character, and
 * lowercase prose runs 0.467-0.509. Using the figure constant on prose
 * over-estimates by about 30%.
 *
 * That is not academic. The bias card's CTA — the real production host plus
 * "/bias — get your number" — measures 824px against an 876px target and FITS.
 * Judged with the figure constant it estimates 1004px and reads as an
 * overflow. The first version of the bias fit guard failed on exactly that, and
 * a guard that fails a working card is worse than no guard: someone goes and
 * "fixes" something that was never broken.
 *
 * 0.52 is the measured prose worst case (0.509), rounded up a hair and no
 * further — see the note on FIT_SAFETY for why the constants deliberately do
 * NOT carry margin of their own.
 */
export const EM_PER_CHAR_PROSE = 0.52;

/**
 * EXPLICIT HEADROOM, so the whole margin does not rest on one constant
 * (E6/S27, my call on RT-133a).
 *
 * The PM asked whether to pin `EM_PER_CHAR_FIGURE` to the bundled font with a hash. I
 * decided against it: a hash is a bump-the-number ritual, and it catches a font
 * SWAP but not a font UPDATE that keeps the filename. It also treats the wrong
 * risk as the risk.
 *
 * The actual fragility is that after E6/S25 the sizing filled the box exactly.
 * "48–128 kbps" came out at 134px, estimating 913.9px of 920 — so every bit of
 * slack was `EM_PER_CHAR_FIGURE` being generous (0.62 assumed against 0.593 measured).
 * A single constant carried the entire margin, and if the font's metrics ever
 * moved even slightly the wrong way, three guards would agree that a clipped
 * card was fine.
 *
 * Targeting 92% of the box costs a few points of type size and buys margin that
 * survives a font whose real metrics differ from the measurement. That is worth
 * more than knowing the font file is byte-identical, because it protects
 * against the change we would NOT think to re-measure.
 *
 * MARGIN LIVES HERE AND ONLY HERE. The first version padded the em constants
 * too — 0.62 against a measured 0.594, 0.55 against 0.509 — and then applied
 * this factor on top. Stacking margins made the guard reject the bias card's
 * CTA, which measures 824px against an 876px target and fits perfectly well. A
 * guard that fails a working card sends somebody to break it, which is the same
 * class of harm as a guard that cannot fail, arrived at from the other side.
 * The constants now state what was MEASURED; this factor is the only cushion.
 */
export const FIT_SAFETY = 0.92;

export function thresholdFigureFontSize(figure: string, usablePx: number, maxPx: number): number {
  if (figure.length === 0) return maxPx;
  const target = usablePx * FIT_SAFETY;
  return Math.min(maxPx, Math.floor(target / (figure.length * EM_PER_CHAR_FIGURE)));
}
