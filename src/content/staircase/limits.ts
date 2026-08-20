/**
 * EXPLAINING EACH KIND OF MEASURED LIMIT (E5/S7).
 *
 * The `statement` on each limit is written by the pipeline that measured it and
 * is rendered verbatim — precise, and written for someone who already knows what
 * a log-spectral distance is. These blurbs are the other half: one paragraph per
 * KIND, for a reader meeting the idea for the first time.
 *
 * THEY LIVE HERE RATHER THAN IN THE PAGE for two reasons. They are cohort-facing
 * copy, so they belong under the voice gate like every other deck in
 * `src/content/`; and the page needs a test proving that every kind the manifest
 * can emit has a section, which means the table has to be importable.
 */

export interface LimitKindCopy {
  title: string;
  blurb: string;
}

export const LIMIT_KIND_COPY: Record<string, LimitKindCopy> = {
  "damage-varies-by-window": {
    title: "A bitrate is exact; what it destroys is not",
    blurb:
      "A compression level is labelled in kbps because a bitrate is the same number on every passage. The damage it does is not. These are the widest spreads measured across the passages serving one level — which is why a compression threshold is always reported with the recording it was measured on.",
  },
  "adjacent-levels-collapse": {
    title: "Two rungs that are not really two",
    blurb:
      "The ladder is built so each rung is a fixed proportion harder than the last, and a rung has to be at least 1.15x its neighbour to count as a separate step. On these passages a pair of neighbours came out closer than that. The ladder still runs in the right direction here — the two rungs are simply not distinguishable from each other on this material.",
  },
  "cross-window-spread": {
    title: "The same rung, measured differently by different passages",
    blurb:
      "Pitch and timing rungs are labelled with the manipulation itself, so they should measure the same wherever they are applied. These are the levels where they did not, to within the allowance the instrument gives.",
  },
  "predicted-below-floor": {
    title: "Below what the ruler can read",
    blurb:
      "Each family is measured with an analysis routine that has its own noise floor. A rung whose predicted magnitude sits under that floor is still reported, and it is the bottom of what this instrument can honestly resolve.",
  },
};

/** Reading order: widest consequence first. */
export const LIMIT_KIND_ORDER = [
  "damage-varies-by-window",
  "adjacent-levels-collapse",
  "cross-window-spread",
  "predicted-below-floor",
];

/**
 * WHY ONE RECORDING IS RENDERED AND NEVER PRESENTED (PM ruling RT-92a).
 *
 * Cohort-facing, so it lives with the rest of the deck rather than in the page.
 */
export const RETIRED_SOURCE_NOTE =
  "One recording is rendered, validated, and deliberately withheld. pb6 serves the pitch and timing " +
  "families, but its compression ladder spans only 3.5x across seven rungs — the narrowest in the " +
  "pool. Simulated sessions put its fitted threshold 0.67 ladder steps off at the session length " +
  "compression uses, and the best it ever reaches, at roughly 32 minutes of listening, is a third of " +
  "the information per minute that pitch delivers. It is the worst use of a listener's time in the " +
  "product, and no amount of extra time fixes it. The clips stay in the pool; the sessions do not " +
  "use them.";
