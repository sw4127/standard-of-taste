/**
 * THE EXPERT PANEL'S WORDS (E8/C4, Track C).
 *
 * WHY THIS FILE EXISTS AT ALL. `ExpertPanel.tsx` was written with its headings,
 * column names and notes inline, which is precisely the structural gap this
 * repo has shipped defects through twice: the delicacy card told everyone "a
 * coin flip calls 3" for months, and the bias card's two lines sat outside every
 * check — both because a fragment in a component is a fragment nothing reads.
 * The hazard gate reads DECKS. Prose that is not in one is prose nobody screens.
 *
 * SO EVERYTHING COHORT-VISIBLE IS HERE, including the column headers. A header
 * cannot plausibly carry motive attribution — but deciding case by case which
 * strings are "important enough to gate" is how the gap reopens, and the whole
 * set costs one object.
 *
 * IT NAMES, IT DOES NOT JUDGE. This is the verdict-free surface: every string
 * below labels a measurement or states a limit. Nothing here tells a reader
 * whether their number is good, and `expert.ts` cannot supply that opinion
 * either — see its header.
 */

export const EXPERT_PANEL = {
  eyebrow: "THE RAW RECORD",
  show: "show",
  hide: "hide",
  /**
   * The summary under the disclosure. It has to do three jobs in one sentence:
   * say what is inside, promise no interpretation, and warn that this is
   * device-local so nobody assumes a shared link carries it.
   */
  blurb:
    "Every number behind the result, and the answers. No verdict, no interpretation — read from " +
    "this browser, so a link you share shows nobody else this.",
} as const;

export const EXPERT_SECTIONS = {
  delicacyByFamily: "By flaw family",
  delicacyByRung: "By rung",
  delicacyCalibration: "Did you know when you knew?",
  delicacyTrials: "Every pair, in the order you met them",
  thresholdSession: "The session",
  thresholdRungs: "Every rung · gentlest first",
  thresholdLimits: "What the pipeline measured and could not fix",
  biasSession: "The session",
  biasItems: "Every clip",
  biasControls: "Controls · rated twice, labelled neither time",
} as const;

export const EXPERT_COLUMNS = {
  family: "Family",
  caught: "Caught",
  shown: "Shown",
  rung: "Rung",
  index: "#",
  original: "Original",
  youPicked: "You picked",
  flawNamed: "Flaw named",
  said: "Said",
  right: "Right",
  where: "Where",
  clip: "Clip",
  blind: "Blind",
  labelled: "Labelled",
  towardLabel: "Toward label",
  roomToMove: "Room to move",
  label: "Label",
  first: "First",
  second: "Second",
  drift: "Drift",
  youSaid: "You said",
  of: "Of",
  delivered: "Delivered",
  versusClaim: "Versus claim",
} as const;

export const EXPERT_STATS = {
  trials: "Trials",
  outcome: "Outcome",
  caughtAt: "Caught at",
  missedAt: "Missed at",
  fittedPoint: "Fitted point",
  interval: "95% interval",
  beforeCorrection: "Before correction",
  afterCorrection: "After correction",
  controlDrift: "Control drift",
  movedWithLabel: "Moved with label",
  atScaleEdge: "At the scale edge",
  swappedOnly: "Swapped items only",
} as const;

/** Cell values that are words rather than numbers. */
export const EXPERT_VALUES = {
  tooFewToSay: "too few to say",
  notEarned: "not earned",
  caught: "caught",
  guessed: "guessed",
  inBand: "in band",
  trueLabel: "true",
  fictionalLabel: "fictional",
  none: "—",
} as const;

/**
 * THE NOTES — the only real sentences on this surface, and each states a LIMIT
 * rather than a finding. They are the reason this file is gated: a limit stated
 * loosely is the shape an unmeasured claim takes.
 */
export const EXPERT_NOTES = {
  /** Why one of three families shows a rung number instead of a unit. */
  timingRungs:
    "Timing rungs are shown by number: the pool stores them as a tempo fraction and the staircase " +
    "measures milliseconds of drift, so quoting one as the other would be a guess.",
  /**
   * Why the two prestige percentages agree. Measured, not asserted — the pool
   * ships as many acclaimed labels as dismissive ones, so RT-2a's correction
   * term is identically zero at this balance (src/engine/expert.test.ts).
   */
  balancedPool:
    "The two percentages agree because the pool carries as many acclaimed labels as dismissive " +
    "ones, and a balanced set cancels re-listen drift outright. The correction is shown anyway: " +
    "it is what would move if that balance ever changed.",
} as const;

/** The Brier line, which needs both numbers and therefore cannot be a constant. */
export function brierNote(brier: number, n: number, chance: number): string {
  return (
    `Brier score ${brier.toFixed(3)} over ${n} answers — always saying 50% on a two-way choice ` +
    `scores ${chance.toFixed(2)}. Lower is better, and it only means something next to the ` +
    `distance from the line above.`
  );
}

/** Every fixed string on the panel, for the hazard gate to sweep. */
export function expertStrings(): Array<{ key: string; text: string }> {
  const out: Array<{ key: string; text: string }> = [];
  const add = (prefix: string, obj: Record<string, string>) => {
    for (const [k, v] of Object.entries(obj)) out.push({ key: `${prefix}/${k}`, text: v });
  };
  add("panel", EXPERT_PANEL);
  add("section", EXPERT_SECTIONS);
  add("column", EXPERT_COLUMNS);
  add("stat", EXPERT_STATS);
  add("value", EXPERT_VALUES);
  add("note", EXPERT_NOTES);
  return out;
}
