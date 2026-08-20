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
    const spanned = (band.heardIndex ?? 0) - (band.missedIndex ?? 0);
    const wide = spanned >= Math.ceil(band.rungs.length * 0.55);
    if (wide) {
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
    `with a 95% interval from ${quantity(result.ci95[0], unit)} to ${quantity(result.ci95[1], unit)}. ` +
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
