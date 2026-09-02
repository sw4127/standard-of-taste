/**
 * THE REGISTRY OF FALSIFIED HYPOTHESES (E15/S6, Track J2).
 *
 * WHY THIS REPLACED AN EXPERIMENT REGISTRY. The Lab was planned with a panel of
 * running experiments, each with its hypothesis and stopping rule recorded
 * before it ran. There are no running experiments — there is no traffic to run
 * them on — so that panel would have been a form with nothing in it.
 *
 * There is, however, a real record of things this project believed, tested, and
 * had to abandon, kept in the handoff documents since 2026-08-18 under the
 * heading "FALSIFIED — do not re-derive". A registry of dead hypotheses is a
 * stronger artifact than a registry of live ones: an experiment in flight
 * proves an intention, and a killed belief proves the intention was carried
 * out on something that mattered enough to hurt.
 *
 * THE INCLUSION RULE IS DECLARED, AND ENFORCED, BECAUSE CHOOSING WHICH
 * FALSIFICATIONS TO PUBLISH WOULD BE THE SELECTION BIAS THIS PRODUCT MEASURES.
 * Every belief recorded under that heading in any handoff is here — not the
 * interesting ones, not the flattering ones, all of them. `falsified.test.ts`
 * parses those sections out of `docs/` and fails if the registry is missing
 * one, so the day someone quietly drops an embarrassing entry, the build stops.
 * That guard is the entire reason this file can be trusted.
 *
 * EVERY ENTRY CARRIES A CITATION AND THE CITATION IS OPENED. Same rule as
 * `/method`: the anchor must really appear in the file it names, checked with
 * whitespace collapsed because every document here hard-wraps. The redirection
 * blueprint records why this binds hardest on pages like this one — of eleven
 * repositories cited in a memo prepared for the PM, four returned 404. A
 * citation is a claim, not evidence.
 */

export interface FalsifiedSource {
  /** Repo-relative path, POSIX separators. */
  path: string;
  /** A passage that must appear in `path`, compared whitespace-collapsed. */
  anchor: string;
}

export interface FalsifiedEntry {
  id: string;
  /**
   * HOW IT DIED, AND THE DISTINCTION IS NOT DECORATIVE.
   *
   * "measured" — a run produced a number that contradicted the belief. Those
   * must state the number, enforced by test.
   *
   * "derived" — the belief was shown to be impossible or vacuous by argument,
   * with nothing left to measure. "Information per minute is constant by
   * construction" is the clearest case: every length scores identically, so
   * there is no figure to quote and demanding one would only invite a fake.
   *
   * The distinction exists because a guard that required a number everywhere
   * would have made me manufacture one — which is the failure this whole page
   * is about, committed on the page itself.
   */
  kind: "measured" | "derived";
  /**
   * The hypothesis AS IT WAS BELIEVED, verbatim from the record. More than one
   * where the same belief was recorded twice in different words — deduplicating
   * by rewriting them into one sentence would break the completeness guard,
   * which matches on these strings.
   */
  beliefs: string[];
  /** When it died. */
  date: string;
  /** What the measurement actually showed. Must contain the number. */
  killedBy: string;
  /** What shipped instead, or what the project stopped doing. */
  consequence: string;
  sources: FalsifiedSource[];
  /** A test that keeps it dead, where one exists. Existence is asserted. */
  guard?: string;
}

export const FALSIFIED: FalsifiedEntry[] = [
  /* ---------------------------------------------- the audio pipeline */
  {
    id: "timing-multiplier",
    beliefs: ["A single per-window multiplier will absorb the timing offset."],
    date: "2026-08-18",
    kind: "measured",
    killedBy:
      "One window would have calibrated cleanly (residual −8% to +4%); another would not (−15% to +16%). Checked before anything was built on it.",
    consequence: "No global correction. Each window is measured on its own terms.",
    sources: [
      {
        path: "docs/handoff-2026-08-18.md",
        anchor: "pb6@30 would calibrate",
      },
    ],
  },
  {
    id: "per-level-calibration",
    beliefs: ["Per-level calibration converges."],
    date: "2026-08-18",
    kind: "measured",
    killedBy:
      "It has no root to find. At one level the search oscillated 15 → 14 → 11 → 14 → 11 → 14 ms over six renders, and a dense sweep showed measured drift FALLING three times as the requested drift rose.",
    consequence: "Calibration is off by default; its precondition is false.",
    sources: [
      {
        path: "docs/handoff-2026-08-18.md",
        anchor: "It has no root to find",
      },
    ],
  },
  {
    id: "timing-ladder-8pct",
    beliefs: ["rungs.mjs's timing ladder renders within 8%."],
    date: "2026-08-18",
    kind: "measured",
    killedBy:
      "That was a property of one random seed, not of the ladder. Across five seeds on a single window the spread is 0.72–1.30x.",
    consequence:
      "A tolerance measured on one seed is not a tolerance. Every ladder claim is now checked across seeds.",
    sources: [
      {
        path: "docs/handoff-2026-08-18.md",
        anchor: "Across five seeds on one window the spread is",
      },
    ],
  },
  {
    id: "fading-windows",
    beliefs: ["pb8@75s and pb6@75s may be fading out."],
    date: "2026-08-18",
    kind: "measured",
    killedBy:
      // NO BARE COUNT OF CLIPS HERE. An existing guard caught the first draft,
      // which named a number of them: on this page that is a frozen historical
      // figure nothing can recompute, and a reader cannot tell it apart from a
      // claim about today's pool. It adds nothing the measurement does not.
      //
      // The guard reads the FILE, not the rendered strings, so quoting the
      // offending phrase in this comment tripped it a second time. Correctly:
      // it cannot tell a comment from content, and it should not have to.
      "Both measure dead air 0.00s and quiet fraction 0.0%, across their reference and every clip rendered from them. One does end at 86% of its recording and is still clean; the other sits at 43% and was never near the end.",
    consequence: "The suspicion was wrong; the real fault was in the correlator.",
    sources: [
      {
        path: "docs/handoff-2026-08-18b.md",
        anchor: "was never near the end; its problem is purely the correlator",
      },
    ],
  },
  {
    id: "pitch-floor-units",
    beliefs: [
      "Pitch level 3.1 fails the measurability floor on 8 of 9 windows.",
      "The 3-cent pitch floor applies to the measured p95.",
    ],
    date: "2026-08-20",
    kind: "measured",
    killedBy:
      "My own gate's unit mismatch, caught by the real run. The floor is a parameter-domain quantity; a ramp peaks at 0.95 of its parameter, so level 3.1 predicts 2.94 cents — under a 3-cent measurement floor by construction. Eight of nine windows were flagged by arithmetic, not by anything in the audio.",
    consequence:
      "Floors are checked on the level rather than the measurement, and both families carry an evidence field read from the gate that interrogates the audio.",
    sources: [
      {
        path: "docs/handoff-2026-08-20.md",
        anchor: "that was a unit mismatch, not a finding",
      },
      {
        path: "docs/handoff-2026-08-18b.md",
        anchor: "THE UNIT MISMATCH",
      },
    ],
  },
  {
    id: "lossy-step-collapse",
    beliefs: ["lossyStepCollapses is superseded by the monotonicity floor."],
    date: "2026-08-20",
    kind: "measured",
    killedBy:
      "Monotone means increasing; the level ratio means increasing ENOUGH to be two levels. 4 of 174 adjacent steps rise by less than 1.15x, the worst by 1.053x.",
    consequence: "Wired into the measured limits and reported rather than gated.",
    sources: [
      {
        path: "docs/handoff-2026-08-20.md",
        anchor: "4 of 174 adjacent steps rise",
      },
    ],
  },
  {
    id: "lossy-variety",
    beliefs: ["Lossy gets a third of the variety the other families do."],
    date: "2026-08-20",
    kind: "measured",
    killedBy:
      "True only while the family was locked to one recording's 3 windows. Once every source got 9 of its own, the worst repeat fell to 2 — matching the pooled families exactly, with only one recording still worse at 3.",
    consequence: "The complaint was about a configuration, not about the family.",
    sources: [
      {
        path: "docs/handoff-2026-08-20.md",
        anchor: "worst repeat pooled 2",
      },
    ],
  },
  {
    id: "pb4-best-behaved",
    beliefs: ["pb4 is the best-behaved lossy source."],
    date: "2026-08-20",
    kind: "measured",
    killedBy:
      "True of 1 of its curves and false of the source: across all 9 of its windows it is the WORST at the gentle end, not the best.",
    consequence: "One window's curve does not describe a recording. Sources are judged across windows.",
    sources: [
      {
        path: "docs/handoff-2026-08-20.md",
        anchor: "One window's curve does not describe a source",
      },
    ],
  },

  /* ------------------------------------------------- the staircase */
  {
    /*
     * RECORDED INLINE RATHER THAN AS A LIST ITEM, which is exactly why this
     * entry nearly did not exist: E15/S6's parser only saw the numbered
     * sections and reported the registry complete without it. Found by reading
     * the source document rather than by trusting the guard, and the guard was
     * widened in S7 rather than the omission being left as a known edge.
     */
    id: "step-size-over-slope",
    beliefs: ["The bias tracks step-size-over-slope."],
    date: "2026-08-15",
    kind: "derived",
    killedBy:
      "It was pattern-matching: two terms happened to move while a third held still. A fine ladder is still biased, so the ratio explains nothing.",
    consequence: "The bias was decomposed properly instead, which is what found the real term.",
    sources: [
      {
        path: "docs/handoff-2026-08-15b.md",
        anchor: "the hypothesis that the bias tracks step-size-over-slope",
      },
    ],
  },
  {
    id: "ladder-end-censoring",
    beliefs: ["The N3 ladder-end guard's censoring caused the timing bias."],
    date: "2026-08-15",
    kind: "measured",
    killedBy:
      "The guard is innocent — its contribution is at most 0.021. The cause is a different term worth +0.499: a listener sitting near the ladder's 12.5 ms floor, where truncation shoves the reversal mean up.",
    consequence:
      "The guard was kept. Blaming it would have removed a protection and left the bias in place.",
    sources: [
      {
        path: "docs/handoff-2026-08-15b.md",
        anchor: "the N3 ladder-end guard's censoring caused",
      },
    ],
  },
  {
    id: "width-stopping-rule",
    beliefs: ["A width-based stopping rule is the principled version of a session budget."],
    date: "2026-08-20",
    kind: "measured",
    killedBy:
      "Built, measured, deleted. One flat window fired spuriously — the estimate tightened while the session took LONGER — and two flat windows in a row never fired at all, running every session to the 80-trial ceiling.",
    consequence:
      "The reversal count is already an information criterion, and it beat interval width sampled every eight trials. The width rule was removed.",
    sources: [
      {
        path: "docs/handoff-2026-08-20b.md",
        anchor: "Built, measured,",
      },
    ],
  },
  {
    id: "answer-rate-fix",
    beliefs: ["The inconclusive guard and the slope prior can be fixed to raise the answer rate."],
    date: "2026-08-20",
    kind: "measured",
    killedBy:
      "It looked excellent — answer rates of 76–100% — and a pre-registered coverage assertion caught it: a genuinely shallow listener dropped to 80.8% coverage against a 90% floor. The interval had started lying.",
    consequence:
      "Both changes fully reverted. Coverage and answer rate trade off monotonically, and only the original setting clears the bar.",
    sources: [
      {
        path: "docs/handoff-2026-08-20b.md",
        anchor: "dropped to 80.8% coverage against a 90% floor",
      },
    ],
  },
  {
    id: "reversed-ladder",
    beliefs: ["Reversing the ladder makes the staircase run away to the wrong end."],
    date: "2026-08-20",
    kind: "measured",
    killedBy:
      "It does not. Reversing turns 2-down/1-up into an effective 2-up/1-down, which still converges — onto a different point on the curve.",
    consequence:
      "The sampler was fine and the damage was entirely at the report, where the two bounds swap and the sentence a person reads comes out exactly inverted. The bug was in the wrong place from the start.",
    sources: [
      {
        path: "docs/handoff-2026-08-20b.md",
        anchor: "the damage is entirely at the report",
      },
    ],
  },
  {
    id: "clipfor-lookup",
    beliefs: ["clipFor only needs to be a file lookup."],
    date: "2026-08-20",
    kind: "measured",
    killedBy:
      "20 rendered clips on two deliberately excluded windows were freely reachable, silently undoing the exclusion.",
    consequence: "A lookup that can reach an excluded item is not a lookup, it is a hole.",
    sources: [
      {
        path: "docs/handoff-2026-08-20b.md",
        anchor: "silently undoing the exclusion",
      },
    ],
  },

  /* -------------------------------------------- the prestige test */
  {
    id: "eighth-clip",
    beliefs: ["The 8th prestige clip makes the test worse."],
    date: "2026-08-22",
    kind: "measured",
    killedBy:
      "An artifact of redrawing item parameters per length. Under a nested design it is 89.1% → 89.2% — flat.",
    consequence: "A finding that disappears when the design is fixed was never a finding.",
    sources: [
      {
        path: "docs/handoff-2026-08-22.md",
        anchor: "Artifact of redrawing item parameters per",
      },
    ],
  },
  {
    id: "drift-precision-floor",
    beliefs: ["Per-person drift sets the prestige precision floor."],
    date: "2026-08-22",
    kind: "measured",
    killedBy:
      "Drift on and drift off are identical to 2 decimal places. The headline measures shift toward the label, and the pool's up/down balance cancels drift out entirely.",
    consequence: "Kept as a regression test rather than deleted, so the cancellation stays true.",
    sources: [
      {
        path: "docs/handoff-2026-08-22.md",
        anchor: "identical to",
      },
    ],
  },
  {
    id: "information-per-minute",
    beliefs: ["Information per minute is the right criterion for a fixed-form test."],
    date: "2026-08-22",
    kind: "derived",
    killedBy: "It is constant by construction — every length scores identically.",
    consequence:
      "Length was derived from the CLAIM the test needs to support instead, which is what produced the shipped 14-clip pool.",
    sources: [
      {
        path: "docs/handoff-2026-08-22.md",
        anchor: "It is constant by",
      },
    ],
  },
  {
    id: "six-ranked-tiers",
    beliefs: ["Fifteen delicacy trials can support a tiered verdict."],
    date: "2026-08-22",
    kind: "measured",
    killedBy:
      "No non-degenerate band count clears the bar. Six tiers place a person in the right band 30.5% of the time; even the coarsest real split, two bands, reaches only 70.2% against the prestige verdict's 89.3%.",
    consequence:
      "No tier name is printed. The instrument reports a detection band and refuses the rank — the same ruling the staircase already carried.",
    sources: [
      {
        path: "docs/analytics/e6-delicacy-tiers.txt",
        anchor: "NO NON-DEGENERATE BAND COUNT CLEARS",
      },
    ],
  },

  /* ------------------------------------------ measurement of the UI */
  {
    id: "vs-contrast",
    beliefs: ["The /vs question renders at 1.11:1."],
    date: "2026-08-22",
    kind: "measured",
    killedBy:
      "The 1.11:1 came from my own probe, which read the flat background colour alone — but the field behind that text is painted as a gradient, so the probe was measuring a colour that is never on screen. The page was fine all along.",
    consequence:
      "Contrast is measured from rendered pixels rather than from CSS. Measure the instrument before believing the measurement.",
    sources: [
      {
        path: "docs/handoff-2026-08-22.md",
        anchor: "paints its light field as a",
      },
      {
        path: "docs/analytics/e7-card-contrast.txt",
        anchor: "MEASURED FROM RENDERED PIXELS",
      },
    ],
  },
  {
    id: "bias-card-overflow",
    beliefs: [
      "The bias card overflows.",
      "The bias card overflows / +20% breaks the width model.",
    ],
    date: "2026-08-22",
    kind: "measured",
    killedBy:
      "Measured: it does not, and neither does the delicacy card. Its hero is a fixed font size and never consults the width model at all. Only the threshold card overflowed, because its hero is 150px against their 76px.",
    consequence: "The fix went to the card that was actually broken.",
    sources: [
      {
        path: "docs/handoff-2026-08-26.md",
        anchor: "The bias hero is a FIXED font size and",
      },
    ],
  },
  {
    id: "green-accent",
    beliefs: ["Green is the right third accent."],
    date: "2026-08-26",
    kind: "derived",
    killedBy:
      "It reads as a pass mark, and the Threshold Test issues no verdict at all — so the colour would have announced a judgment the instrument refuses to make.",
    consequence: "The third instrument took a colour that carries no verdict.",
    sources: [
      {
        path: "docs/handoff-2026-08-26.md",
        anchor: "and the Threshold Test issues no verdict",
      },
    ],
  },

  /* ------------------------------------------------ the speech gate */
  {
    id: "speech-detector",
    beliefs: [
      "A speech detector can gate this.",
      "An absolute speech-detection threshold is viable.",
    ],
    date: "2026-08-25",
    kind: "measured",
    killedBy:
      "Six features measured against real audio; five inverted or overlapped. Only one separates at all, and it cannot catch a short announcement over busy music — a clean orchestral clip measures 0.709 against a 0.673 mixture, so the classes overlap and no threshold divides them.",
    consequence:
      "The gate that ships is positional rather than acoustic, and its blind spot is asserted as a passing test rather than hoped away.",
    sources: [
      {
        path: "docs/analytics/e7-speech-gate.txt",
        anchor: "The classes overlap; no threshold on this feature separates them",
      },
      {
        path: "docs/handoff-2026-08-26.md",
        anchor: "Six features measured against real audio",
      },
    ],
    guard: "scripts/clip-pipeline/speech.test.ts",
  },
  {
    id: "within-track-anomaly",
    beliefs: [
      "A within-track anomaly score finds the announcer.",
      "A within-track anomaly finds the announcer.",
    ],
    date: "2026-08-25",
    kind: "measured",
    killedBy:
      "The one window known to contain an announcer ranks 4th of 24, below three windows containing no speech at all.",
    consequence: "Ranking by strangeness does not find speech. Recorded so nobody pays for it twice.",
    sources: [
      {
        path: "docs/analytics/e7-speech-gate.txt",
        anchor: "within-track anomaly ranking",
      },
      {
        path: "docs/handoff-2026-08-25.md",
        anchor: "below three windows containing no speech",
      },
    ],
    guard: "scripts/clip-pipeline/speech.test.ts",
  },
  {
    id: "name-the-recording",
    beliefs: ["The obvious fix to the on pb4 jargon is to name the recording."],
    date: "2026-08-25",
    kind: "derived",
    killedBy:
      "It would have printed the Prestige Test's answers on a public share card.",
    consequence:
      "The jargon was removed a different way. The obvious fix to a copy problem can be a disclosure problem.",
    sources: [
      {
        path: "docs/handoff-2026-08-25.md",
        anchor: "would have printed the",
      },
    ],
  },

  /* ------------------------------------------------- the retest arc */
  {
    id: "delicacy-arc-impossible",
    beliefs: ["A per-family delicacy arc is impossible."],
    date: "2026-09-02",
    kind: "measured",
    killedBy:
      "It is expressible. The objection cited a floor of 40 trials per family, which answers a DIFFERENT question — whether one flaw may be called sharper than another within a single sitting. Comparing a family against itself across two sittings is easier, and the floor is reachable at about four of the family's five items.",
    consequence:
      "The ruling that kept delicacy out of the retest arc was re-taken on the corrected numbers, and it survived for a third reason: coarseness. Both of the reasons originally given for it were false.",
    sources: [
      {
        path: "docs/analytics/e14-arc-resolution.txt",
        anchor: "the per-family arc is not impossible",
      },
    ],
    guard: "src/analytics/arc-resolution.test.ts",
  },
  {
    id: "delicacy-arc-multiplicity",
    beliefs: ["Asking three flaw families at once is what makes a delicacy arc unsafe."],
    date: "2026-09-02",
    kind: "measured",
    killedBy:
      "Measured at the floor actually derived, a person who did not change sees at least one family called moved 2.5% of the time — BELOW a single family's own 5%, not above it.",
    consequence:
      "The multiplicity argument is dead and is reported rather than asserted, because it does not support the case it was raised for.",
    sources: [
      {
        path: "docs/analytics/e14-arc-resolution.txt",
        anchor: "The multiplicity objection does not hold",
      },
    ],
    guard: "src/analytics/arc-resolution.test.ts",
  },
];
