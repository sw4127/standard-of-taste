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

/**
 * Glow variants, for the soft halo behind a hero figure.
 *
 * PRESTIGE_GOLD_GLOW WAS WRONG, AND NOTHING NOTICED BECAUSE NOTHING USED IT
 * (corrected E10/S4a). It read `hsl(42 85% 60% / 0.4)`. Three files —
 * `BiasFlow`, `ClipPlayer` and the Prestige result page — each declared their
 * own `GOLD_GLOW` of `hsl(42 80% 60% / 0.45)`, agreeing with one another and
 * disagreeing with this file, and not one of them imported this export. So the
 * single source of truth held a value that had never been rendered.
 *
 * Corrected TOWARD WHAT SHIPS, not away from it. The three live copies are the
 * colour that has actually been on screen and looked at; this export's value
 * was never a decision anyone made, it was a copy made approximately. Changing
 * the pages to match this line would have repainted a glow nobody asked to
 * change, on the strength of a constant no page had ever read.
 */
export const PRESTIGE_GOLD_GLOW = "hsl(42 80% 60% / 0.45)";
export const DELICACY_ICE_GLOW = "hsl(190 80% 60% / 0.4)";
export const THRESHOLD_VIOLET_GLOW = "hsl(276 75% 68% / 0.4)";

/**
 * The soft fill behind a selected control — the instrument's hue at 14%.
 *
 * `hsl(H 70% 55% / 0.14)` was ALREADY the convention and nobody had said so:
 * `BiasFlow` and `ClipPlayer` both carried `hsl(42 70% 55% / 0.14)` and
 * `DelicacyFlow` carried `hsl(190 70% 55% / 0.14)` — the same saturation, the
 * same lightness, the same alpha, three files apart, differing only in hue.
 * Threshold had none because its controls had never been given one, which is
 * part of why `ClipPlayer` still wore gold there.
 *
 * NOT `tint(accent, 0.14)`. That would be the accent's own 80%/62% at low
 * alpha, which is a paler, colder fill than the one that ships. This is a
 * deliberately duller, darker tone and it is what has been on screen.
 */
export const PRESTIGE_GOLD_SOFT = "hsl(42 70% 55% / 0.14)";
export const DELICACY_ICE_SOFT = "hsl(190 70% 55% / 0.14)";
export const THRESHOLD_VIOLET_SOFT = "hsl(276 70% 55% / 0.14)";

/**
 * AN INSTRUMENT'S THREE-COLOUR KIT, PASSED AS ONE THING (E10/S5, RT-AE:a).
 *
 * `ClipPlayer` — the play button and progress ring, the control a person looks
 * at most during a test — hardcoded gold and accepted no colour from its
 * caller. It is rendered by the Delicacy Trials and the Threshold Test, so two
 * of three instruments ran their central control in a third instrument's
 * colour. Measured before this change: the ring stroke on `/threshold/pitch`
 * and on `/delicacy` was `hsl(42 80% 62%)`, on violet and blue screens.
 *
 * That is the defect E7/S21 fixed for `AbCompare` and missed here.
 *
 * GROUPED RATHER THAN THREE PROPS. `DelicacyFlow` renders four clip players; at
 * three colour props each that is twelve chances to pass two and forget the
 * third, and a half-coloured control is the same drift in a new place. One
 * object cannot be got half right — and the prop is REQUIRED, so the compiler
 * refuses a call site that forgets, which is a better guard than any test.
 */
export interface InstrumentPalette {
  /** The line, the ring, the text. */
  accent: string;
  /** The fill behind a selected control. */
  soft: string;
  /** The halo. */
  glow: string;
}

export const PRESTIGE_PALETTE: InstrumentPalette = {
  accent: PRESTIGE_GOLD,
  soft: PRESTIGE_GOLD_SOFT,
  glow: PRESTIGE_GOLD_GLOW,
};

export const DELICACY_PALETTE: InstrumentPalette = {
  accent: DELICACY_ICE,
  soft: DELICACY_ICE_SOFT,
  glow: DELICACY_ICE_GLOW,
};

export const THRESHOLD_PALETTE: InstrumentPalette = {
  accent: THRESHOLD_VIOLET,
  soft: THRESHOLD_VIOLET_SOFT,
  glow: THRESHOLD_VIOLET_GLOW,
};

/**
 * The ambient field behind each instrument — analogous neighbours of its own
 * accent, never a second accent (design bar: one accent in play per screen).
 *
 * ONLY THRESHOLD'S LIVED HERE UNTIL E10/S4b. The gold field was re-typed
 * verbatim in SEVEN places (both Prestige surfaces, the Lab, the reading room,
 * `/method`, and twice on the home page) and the delicacy field in two. The
 * registry held one instrument's field and the other two were loose, which is
 * the same defect as the accents themselves and for the same reason: whoever
 * changes gold's ambience will change one file of seven.
 */
export const PRESTIGE_FIELD = [
  "hsl(42 55% 48%)",
  "hsl(28 50% 44%)",
  "hsl(52 45% 46%)",
  "hsl(20 40% 40%)",
];

/**
 * The field the Delicacy instrument actually paints — its flow and its result
 * page (E10/S4b).
 *
 * A SECOND, DIFFERENT DELICACY FIELD EXISTS ON THE HOME PAGE AND RENDERS
 * NOTHING. `Machine.field` in `GymFloor` is documented as "ambient field
 * colours while this machine is selected" and is populated for all three
 * machines — and it is never read. Selecting a machine sets `--app-bg` from
 * `Machine.surface`; the floor's ambience comes from the page-level array and
 * stays gold throughout. Verified on the rendered page: choosing Delicacy
 * leaves the gradient at `rgb(190, 149, 55)`, which is PRESTIGE_FIELD's first
 * colour.
 *
 * So the home page's delicacy array is not a divergence in what the product
 * looks like. It is dead data, and pointing it here would quietly erase the
 * evidence of what the floor was once meant to do. Left alone for a ruling —
 * see RT-AD.
 */
export const DELICACY_FIELD = [
  "hsl(195 45% 40%)",
  "hsl(210 40% 36%)",
  "hsl(180 40% 38%)",
  "hsl(225 35% 34%)",
];

export const THRESHOLD_FIELD = [
  "hsl(276 45% 44%)",
  "hsl(290 40% 40%)",
  "hsl(262 40% 42%)",
  "hsl(300 35% 38%)",
];

/** The near-black each instrument sits on, tinted a hair toward its own accent. */
export const THRESHOLD_BASE = "#0A070C";

/* ------------------------------------------------------------------ tint */
/**
 * A FAINT EDGE IN A MACHINE'S OWN HUE — ONE IMPLEMENTATION (E10/S1, Track F3).
 *
 * This line existed three times: in `OtherMachines`, in `AbCompare`, and typed
 * inline in the `/learn` index. All three replaced a trailing `)` with
 * ` / 0.35)`, and all three fail SILENTLY on any accent that is not plain
 * `hsl(H S% L%)`:
 *
 * (The old line is reproduced verbatim in `__fixtures__/tint-before-e10s1.txt`
 * rather than here, because the guard test forbids that exact byte sequence
 * anywhere in a `.ts`/`.tsx` file under `src/` — with no file excepted, this
 * one included. The fixture is what proves the guard actually detects it.)
 *
 *   - a hex accent (`#0A070C`, which this very file exports as THRESHOLD_BASE)
 *     does not match, so the regex returns the string untouched and the border
 *     renders at FULL opacity instead of 35%. Nothing errors. Nothing logs.
 *   - an accent that already carries alpha (`hsl(42 85% 60% / 0.4)` — the
 *     _GLOW constants above are exactly that shape) becomes
 *     `hsl(42 85% 60% / 0.4 / 0.35)`, which is not a colour. The browser drops
 *     the declaration and the border falls back to whatever it inherited.
 *
 * Neither failure has a symptom. The page renders, the build passes, the tests
 * pass, and a border is quietly the wrong colour — which is the same class of
 * defect as the cross-instrument colour leak this registry was created to end
 * (E7/S18, E7/S21).
 *
 * SO IT THROWS. The alternative — widening the function to handle hex and rgb
 * and alpha — is more code in service of inputs that do not exist, and it
 * would keep the failure quiet. Every value that reaches `tint` is a
 * compile-time constant from this file, and `instrument-accents.test.ts` runs
 * `tint` over the whole live registry, so an unsupported accent fails the suite
 * before it can reach a page. A throw here cannot surprise a user without the
 * build going red first.
 *
 * NOT A TRAILING-PAREN REPLACE INTERNALLY EITHER. The shape is validated by
 * the time we get here, so the slice is exact — and it lets the guard test
 * forbid that regex ANYWHERE in `src/`, with no file excepted, rather than
 * excepting the one file that is allowed to keep it.
 */
/**
 * THE ALPHA IS A PARAMETER, AND S1 GOT THAT WRONG (corrected in E10/S2b).
 *
 * S1 shipped `tint` with 0.35 baked in, on a YAGNI argument: all three call
 * sites it consolidated wanted a card edge. That argument was made by looking
 * at the three copies it was fixing and not at the codebase, which already
 * contained four MORE hand-rolled alpha-appends at 0.35, 0.10, 0.25 and 0.3 —
 * in `GymFloor` and `/threshold` — written with `slice(0, -1)` instead of a
 * regex, so S1's guard could not see them and S1's commit message claimed a
 * consolidation it had not finished.
 *
 * The lesson, recorded because it is the fourth time this shape has cost this
 * repository something: a guard proves what its needle describes, not what its
 * name says. "No file re-implements the tint regex" was true. "tint exists
 * once" was not, and the two are easy to confuse when you wrote both.
 */
const CARD_EDGE_ALPHA = 0.35;

/** Plain, alpha-free, space-separated `hsl()` — the only shape an accent takes. */
const PLAIN_HSL = /^hsl\(\s*[\d.]+\s+[\d.]+%\s+[\d.]+%\s*\)$/;

export function tint(accent: string, alpha: number = CARD_EDGE_ALPHA): string {
  if (!PLAIN_HSL.test(accent)) {
    throw new Error(
      `tint() received ${JSON.stringify(accent)}, which is not a plain ` +
        `hsl(H S% L%) accent. Tinting it would silently produce either a ` +
        `full-opacity border (no match) or invalid CSS (double alpha). Add ` +
        `the accent to instrument-accents.ts in the supported shape, or ` +
        `widen tint() deliberately and extend its test.`,
    );
  }
  if (!(alpha > 0 && alpha <= 1)) {
    // A caller who passes 35 instead of 0.35 gets a fully opaque colour from
    // every browser, silently. Same failure family as the one above.
    throw new Error(`tint() received alpha ${alpha}; it must be greater than 0 and at most 1.`);
  }
  return `${accent.slice(0, -1)} / ${alpha})`;
}
