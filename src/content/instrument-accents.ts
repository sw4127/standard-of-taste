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
 * gold 42° · ice 190° · violet 276° · rose 339°. Nearest neighbours are 63°
 * apart.
 *
 * THAT FIGURE USED TO READ 86°, and it was true of three instruments. Rose
 * joined in E17/S5 and the sentence became false the same day — corrected here
 * rather than left to contradict the registry three lines below it, because a
 * value pinned in prose expires silently when the value changes. See
 * `SPREAD_ROSE` for why 63° was the best number available and what was refused
 * to get it.
 */

/** Freedom from prejudice — the Prestige Test. */
export const PRESTIGE_GOLD = "hsl(42 80% 62%)";

/** Delicacy of taste, fixed set — the Delicacy Trials. */
export const DELICACY_ICE = "hsl(190 75% 62%)";

/** Delicacy of taste, adaptive — the Threshold Test. */
export const THRESHOLD_VIOLET = "hsl(276 70% 70%)";

/**
 * Comparison against a critic's ranking — the Ranking Test (E17/S5).
 *
 * WHY ROSE, AND WHY THE SEPARATION GOT WORSE. Three hues at 42°, 190° and 276°
 * leave two gaps: 148° between gold and ice, and 126° between violet and gold.
 * The wider gap's midpoint is about 116° — green — which is the best available
 * number and is refused for the reason the Threshold Test already refused it:
 * GREEN READS AS PASS. This instrument issues no verdict either. It reports how
 * far apart a listener's ratings fell and says in the same breath that neither
 * number means agreement, so colouring it green would tell half its users they
 * did well at something nothing here is scoring.
 *
 * That leaves the violet-to-gold gap, midpoint about 339°. Rose asserts
 * nothing — it is not a pass, not a warning, not an error.
 *
 * THE HONEST COST, STATED RATHER THAN ROUNDED AWAY: nearest-neighbour
 * separation drops from 86° to 63° (violet 276 -> rose 339 -> gold 42). Four
 * distinguishable hues do not fit in the space three were given, and the docs
 * above claim 86° as the property that does the work. It no longer holds, and
 * `instrument-accents.test.ts` asserts the real figure rather than the old one.
 */
export const SPREAD_ROSE = "hsl(339 70% 68%)";

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
export const SPREAD_ROSE_GLOW = "hsl(339 75% 66% / 0.4)";

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
export const SPREAD_ROSE_SOFT = "hsl(339 70% 55% / 0.14)";

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

export const SPREAD_PALETTE: InstrumentPalette = {
  accent: SPREAD_ROSE,
  soft: SPREAD_ROSE_SOFT,
  glow: SPREAD_ROSE_GLOW,
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
 * does not change with the selection. Verified on the rendered page: choosing
 * Delicacy left the gradient at `rgb(190, 149, 55)` — PRESTIGE_FIELD's first
 * colour — which is how this was found. Since E10/S6a the floor paints
 * GYM_FIELD instead, so it is now neutral rather than gold; still unaffected
 * by the selection.
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

/**
 * The Ranking Test's field — analogous neighbours of rose, same construction as
 * the other three (E17/S7).
 */
export const SPREAD_FIELD = [
  "hsl(339 45% 45%)",
  "hsl(352 40% 42%)",
  "hsl(326 40% 42%)",
  "hsl(310 35% 38%)",
];

/** The near-black each instrument sits on, tinted a hair toward its own accent. */
export const THRESHOLD_BASE = "#0A070C";
export const SPREAD_BASE = "#0C0709";

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

/* ------------------------------------------------------- the gym itself */
/**
 * THE GYM HAS NO COLOUR OF ITS OWN (E10/S6a, PM ruling RT-AG:a + RT-AH:a).
 *
 * The front door, the reading room, the Lab and `/method` all painted the
 * PRESTIGE field — so four surfaces belonging to no instrument wore one
 * instrument's colour, and the front door in particular read as the Prestige
 * Test rather than as the gym.
 *
 * This was already ruled once. On 2026-08-08 the PM's user testing produced
 * the finding recorded in `DelicacyFlow`: "Gold now belongs to Prestige, ice to
 * Delicacy, and the gym itself is neutral — which is the only arrangement in
 * which two instruments can actually be peers." It was applied to the wordmark
 * text and to nothing else.
 *
 * WHY NOT A FOURTH BRAND HUE. The three accents are placed to be maximally
 * separable — 42°, 190°, 276°, nearest neighbours 86° apart — because hue
 * separation is the property that lets someone tell two results apart before
 * reading a word. A fourth hue must sit inside one of those gaps and would land
 * within ~43° of two accents, halving the separation the system exists to
 * protect. A brand colour would be bought by degrading what colour does here.
 * So the gym is achromatic: not a mood, the only remaining option.
 *
 * WHY IT IS ALSO THE RIGHT MESSAGE. The product's claim is that it says nothing
 * about you until you perform a task (D1 — about the performance, never the
 * person). The floor makes the same claim: the room has no colour until you
 * choose a machine and agree to be measured.
 *
 * WHY SLIGHTLY COOL RATHER THAN FLAT GREY. The gym's existing neutrals are
 * already faintly cool — the surface is `#08090d` and the wordmark
 * `rgba(244,245,248,0.72)`, both blue-leaning. At 6–10% saturation this reads
 * as light rather than as a colour, and matches chrome that already exists
 * instead of introducing a second kind of neutral.
 *
 * HOW DARK, DECIDED BY MEASUREMENT RATHER THAN BY EYE. The first draft of this
 * set peaked at 46% lightness. Composited at FIELD_CHOOSING over the page
 * surface, that puts `--muted` body copy at 4.07:1 — below WCAG AA's 4.5. The
 * set is scaled so the brightest blob is 36%, which measures 4.67:1 at the
 * centre of the brightest blob, the worst point on the page.
 *
 * For scale, the gold field this replaced measured **1.99:1** for the same text
 * at the same point, and had been shipping that way. Nobody had measured it.
 */
export const GYM_FIELD = [
  "hsl(225 10% 36%)",
  "hsl(215 8% 32%)",
  "hsl(235 8% 34%)",
  "hsl(210 6% 28%)",
];

/**
 * HOW LIT A SURFACE IS, BY WHAT HAPPENS ON IT (E10/S6a).
 *
 * These were five hand-tuned numbers — 0.6, 0.6, 0.35, 0.30, 0.28 — and the
 * pattern in them was real but undeclared: surfaces where you DO something are
 * lit, surfaces you READ are barely lit. 0.35 / 0.30 / 0.28 is one value with
 * drift on top, so it is now one value.
 *
 * Naming them is the same fix as the machine-card size variants (E10/S2): an
 * undeclared difference is indistinguishable from an accident, and the next
 * person cannot honour a rule nobody wrote down.
 */
/** Inside an instrument. The brightest the product gets. */
export const FIELD_MEASURING = 0.6;

/** The front door at rest — dimmer than a machine, so choosing one lights the
 *  room (RT-AH:a). Colour and light both arrive with the decision. */
export const FIELD_CHOOSING = 0.4;

/** Reading rooms: /learn, /lab, /method. The content is the figure; the field
 *  is barely there. */
export const FIELD_READING = 0.3;

/**
 * THE GYM'S OWN INK — for accents on surfaces that belong to no instrument
 * (E11/S7, PM ruling RT-AR:a).
 *
 * E10/S6a made the four gym-level surfaces achromatic and its own commit
 * message said "on the front door the only colour left is the three machine
 * cards themselves". That was not true, and checking it rather than trusting
 * it is the only reason this exists: eleven sites across five files still
 * painted the Prestige Test's gold — the secondary links under the machine
 * cards, the friend banner, every prose link and the FAQ heading in the
 * reading room, two eyebrows in the Lab and three headings on /method. The
 * ruling had been applied to the ambient fields and the wordmark, and not to
 * the text.
 *
 * DERIVED, NOT PICKED, on RT-AG's own argument: a surface belonging to no
 * instrument cannot wear one instrument's hue without making that instrument
 * the host, and a fourth hue must land within ~43 degrees of two of the three
 * accents. Achromatic is what is left.
 *
 * THE LIGHTNESS IS A MEASUREMENT, AND HUE'S JOB HAD TO MOVE INTO IT. The gold
 * it replaces measured 5.56:1 against the front door's worst backdrop while
 * `--muted` body copy measures 4.67:1 — a separation of 0.89, which means the
 * link was told apart from the paragraph around it almost entirely by BEING
 * GOLD. Remove the hue at the same lightness and the link stops looking like a
 * link. So the ink sits where the separation is carried by brightness instead:
 * 8.50:1 on the front door and 9.38:1 on the reading surfaces, a delta of 3.83
 * over body copy, and close to the 8.37:1 the gold HEADINGS already measured —
 * so the heading hierarchy is preserved exactly while the link gains the
 * contrast the hue used to supply.
 *
 * It stays under `--foreground` (13.48:1), which remains the brightest text.
 */
export const GYM_INK = "hsl(225 8% 78%)";

/** Hover and emphasis. Bright, still short of `--foreground`. */
export const GYM_INK_BRIGHT = "hsl(225 8% 90%)";
