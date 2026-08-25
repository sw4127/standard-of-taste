/**
 * ONE ACCENT PER INSTRUMENT, DEFINED ONCE (E7/S18, PM ruling RT-148).
 *
 * Each machine owns a colour, and the colour is how someone tells two results
 * apart in a feed before they read a word of either. That only works if the
 * colours are actually distinct and if each value lives in one place — the
 * literals were previously copy-pasted across six files per instrument, which
 * is the drift hazard this codebase keeps paying for.
 *
 * WHY THRESHOLD IS NO LONGER ICE. It shared Delicacy's blue on the argument
 * that both measure the same Hume criterion. That is true about the taxonomy
 * and false about the experience: they are different tests with different
 * deliverables, and someone who has taken both could not tell their two cards
 * apart at a glance. The PM called it: "the threshold test is using the same
 * blue as the delicacy trials which makes no logical sense."
 *
 * WHY VIOLET AND NOT GREEN. Green was the first proposal and it was wrong on
 * the PM's own test — what does an average person catch in a feed? Green reads
 * as *pass*. The Threshold Test does not issue a verdict; it reports a size
 * ("You caught the damage at 100 cents. At 8.8 cents you were guessing"), and
 * the same card shape carries an excellent ear and a poor one. Colouring that
 * green tells half of its users they did well, which is a claim the instrument
 * has never made — the same defect as the share title that announced
 * "label-driven" over a steady result (E7/S6). Violet asserts nothing.
 *
 * Amber was rejected for a duller reason: at thumbnail size it is not reliably
 * separable from Prestige's gold.
 *
 * Hue separation, which is the property that actually does the work:
 * gold 42° · ice 190° · violet 276°. Nearest neighbours are 86° apart.
 */

/** Freedom from prejudice — the Prestige Test. */
export const PRESTIGE_GOLD = "hsl(42 80% 62%)";

/** Delicacy of taste, fixed set — the Delicacy Trials. */
export const DELICACY_ICE = "hsl(190 75% 62%)";

/** Delicacy of taste, adaptive — the Threshold Test. */
export const THRESHOLD_VIOLET = "hsl(276 70% 70%)";

/** Glow variants, for the soft halo behind a hero figure. */
export const PRESTIGE_GOLD_GLOW = "hsl(42 85% 60% / 0.4)";
export const DELICACY_ICE_GLOW = "hsl(190 80% 60% / 0.4)";
export const THRESHOLD_VIOLET_GLOW = "hsl(276 75% 68% / 0.4)";

/**
 * The ambient field behind each instrument — analogous neighbours of its own
 * accent, never a second accent (design bar: one accent in play per screen).
 */
export const THRESHOLD_FIELD = [
  "hsl(276 45% 44%)",
  "hsl(290 40% 40%)",
  "hsl(262 40% 42%)",
  "hsl(300 35% 38%)",
];

/** The near-black each instrument sits on, tinted a hair toward its own accent. */
export const THRESHOLD_BASE = "#0A070C";
