/**
 * THE CLAIM LEDGER for `/method` (E9/S2, Track E — blueprint E1, RT-159a).
 *
 * WHAT THIS IS. `/method` describes how this project is run, with the product
 * as its evidence, for readers who have never seen the repository. Its whole
 * proposition is that this project deletes claims it cannot support. A page
 * making thirty unchecked assertions about that would refute itself on sight.
 *
 * So the page does not contain prose that asserts things. It renders CLAIMS,
 * and every claim carries the document it rests on and a verbatim passage from
 * it. `claims.test.ts` opens each cited file and checks the passage is really
 * there. A source document that moves breaks the build, which is the moment the
 * page becomes wrong — not months later when someone happens to reread it.
 *
 * WHY INFERRED CLAIMS ALSO CARRY SOURCES. RT-159(a) approved this page ON
 * CONDITION that inference be marked wherever the PM's reasoning is being
 * reconstructed rather than quoted. Marking a sentence "inferred" is a
 * disclosure to the reader; it is NOT a licence to invent. An inference still
 * has to be drawn from something in the record, so `kind: "inferred"` changes
 * how the sentence is LABELLED on the page and changes nothing about whether
 * its evidence must exist.
 *
 * WHY THIS BINDS HARDEST HERE. The redirection blueprint's amendment records
 * that of eleven GitHub repositories cited in a research memo prepared for the
 * PM, four returned 404 and three were named with no owner at all — "a
 * repository name is a claim, not evidence". A method page is the most
 * tempting place in the product to cite something, so it is the one surface
 * where citations are machine-checked.
 *
 * AND A COUNT ON THIS PAGE IS A CITATION TOO (E15/S1). The arc finding stated
 * how many delicacy pairs would have to change hands as two typed words. The
 * anchors underneath it were machine-checked and the numbers in front of them
 * were not, which is the same class of unchecked claim this page exists to
 * refuse. They are now derived from the item pool.
 */

import { DELICACY_ARC_FLOOR } from "@/content/delicacy/arc-floor";
import { numberWord } from "@/content/vocabulary/numbers";
import { MACHINES } from "@/components/OtherMachines";

/**
 * HOW MANY INSTRUMENTS ARE LIVE, COUNTED RATHER THAN TYPED (Track V/S4).
 *
 * Four sentences on this page typed the number. One of them — "it has built
 * three working instruments" — had been false since the Ranking Test shipped
 * (E17), in the present tense, on the page whose whole claim is that it does not
 * say things the record cannot support. `site-counts.test.tsx` now reads the
 * rendered page and fails when a count of instruments disagrees with this.
 *
 * ONE IS LEFT TYPED ON PURPOSE: "longer than all four shipped instruments
 * together". That is a MEASURED comparison — eighty-four minutes against the
 * four sittings that existed — and deriving the number would silently extend it
 * to instruments nobody timed. Typed, it fails the count guard the day a fifth
 * ships, which forces somebody to re-do the arithmetic. That is the point.
 */
const LIVE_INSTRUMENTS = MACHINES.filter((m) => m.live).length;
import {
  PREFERENCE_SECONDS_PER_PAIR,
  PREFERENCE_SITTING_MINUTES,
  PREFERENCE_SITTING_PAIRS,
  PREFERENCE_SITTING_TRIALS,
} from "@/content/instrument-shape";
import { ARC_FLOORS, soloFloorFactor } from "@/engine/arc";

export type ClaimKind =
  /** The record says this. The page may show the passage. */
  | "quoted"
  /**
   * The record shows the evidence; the reading of it is mine. The page must
   * mark this visibly (RT-159a) — see the rendering slice.
   */
  | "inferred";

export interface ClaimSource {
  /** Repo-relative path, POSIX separators. Must be tracked by git. */
  path: string;
  /**
   * A passage that must appear in `path`. Compared with whitespace collapsed,
   * because every document here hard-wraps and a quotation that spans a line
   * break is still the same quotation.
   */
  anchor: string;
}

export interface MethodClaim {
  /** Stable; named in failures and used as the render key. */
  id: string;
  kind: ClaimKind;
  /** The sentence the page renders. */
  text: string;
  /** At least one. Several when the claim rests on a pattern across documents. */
  sources: ClaimSource[];
}

/**
 * A REFUSAL AND ITS PRICE (E9/S3 — blueprint E2).
 *
 * The page is organised around things this project refused, not around a count
 * of decisions made. A ruling ledger says "119 decisions" and proves nothing; a
 * list of work deleted for being untrue is checkable, and it is the only part
 * of the record a reader cannot get from a repository of any other project.
 *
 * EVERY REFUSAL STATES WHAT IT COST. A refusal with no price is not a decision,
 * it is a boast — and this page is the most tempting surface in the product on
 * which to write one. `claims.test.ts` requires the `price` field and rejects
 * the shapes that mean "nothing".
 */
export interface MethodRefusal {
  id: string;
  /** What was refused, as the page's heading for it. */
  what: string;
  /** The rule or conclusion it was refused under — "N3", "the D4 amendment". */
  rule: string;
  /** The refusal itself. */
  refusal: string;
  /** What it cost. Never "nothing". */
  price: string;
  kind: ClaimKind;
  sources: ClaimSource[];
}

/**
 * Seed entries (E9/S2). The refusals and the worst finding arrive in S3 and S4;
 * these four exist so the verifier is proved against real content rather than
 * an empty list, and because the operating-model section needs them anyway.
 */
export const METHOD_CLAIMS: MethodClaim[] = [
  {
    id: "n2-complexity-is-a-cost",
    kind: "quoted",
    text:
      "The guardrail this project runs on is not a preference for simplicity. It is written down as a cost: complexity is a cost, not a value — and either party may object by citing it.",
    sources: [
      {
        path: "restructuring_decision_memo_2026-07-11.md",
        anchor: "complexity is a cost, not a value",
      },
    ],
  },
  {
    id: "n3-honesty-rule",
    kind: "quoted",
    text:
      "The honesty rule is stated as a constraint on output, not an aspiration: no score, percentile, or claim the data can't support.",
    sources: [
      {
        path: "restructuring_decision_memo_2026-07-11.md",
        anchor: "no score, percentile, or claim the data can't support",
      },
    ],
  },
  {
    id: "slice-protocol-rationale",
    kind: "quoted",
    text:
      "Work is reviewed in the smallest increment that can be proved on its own, and the reason is written into the protocol: self-review honesty is inversely proportional to the amount of sunk work under review.",
    sources: [
      {
        path: "docs/slice-protocol.md",
        anchor:
          "Self-review honesty is inversely proportional to the amount of sunk work under review",
      },
    ],
  },
  {
    id: "asks-must-be-in-the-block",
    kind: "quoted",
    text:
      "Every request for a decision goes in one fixed block at the end of a reply, and anything outside it does not count: any ask NOT in this block is deemed not asked.",
    sources: [
      {
        path: "docs/redteam-protocol.md",
        anchor: "any ask NOT in this block is deemed not asked",
      },
    ],
  },
  {
    id: "protocols-defend-against-the-author",
    kind: "inferred",
    text:
      "Both protocols are aimed at the same weakness, and it is not incompetence — it is ownership. A reviewer goes soft on work they built, so the rules shrink what is under review and force the ask into a place it cannot be buried.",
    sources: [
      {
        path: "docs/slice-protocol.md",
        anchor: "Small slices keep the hostile reviewer hostile",
      },
      {
        path: "CLAUDE.md",
        anchor: "sunk work makes a reviewer soft (the N2 mechanism applied to yourself)",
      },
    ],
  },
  /**
   * REWRITTEN 2026-09-13 (Phase 3, Q2), AND THE DEFECT IS WORTH NAMING.
   *
   * This block used to open "the constitution names the owner's expertise as a
   * constraint" and then quote the words "they are newer to engineering". Every
   * test here passed: the quotation is real, the anchor resolved, the claim was
   * faithful to the document. It was still wrong on the page, because a
   * quotation about a DOCUMENT's instruction renders to a stranger as a
   * statement about a PERSON — and this is the page a reader uses to decide how
   * much to trust everything else on the site. The owner is an engineering
   * student; the sentence read as if he were not.
   *
   * The anchor is now the half of the constitution's sentence that carries the
   * INSTRUCTION rather than the characterisation. That is not a softer citation:
   * it is the part the claim is actually about, and the discarded half was never
   * doing any work except describing somebody.
   *
   * VERIFIED BY A TEST AND STILL WRONG is the general lesson, and it belongs
   * here rather than in a handoff — every guard on this page checks that a claim
   * is SUPPORTED, and none of them can check what it will be read as.
   */
  {
    id: "pm-is-not-an-engineer",
    kind: "quoted",
    text:
      "The constitution constrains how the engineer must write, not what the owner must know: explain tradeoffs in plain language and teach as you go. Every option put to them has to be legible without the jargon, or the ruling that comes back is a rubber stamp on a sentence nobody understood — so the rule is enforced against the writer, and a decision taken on an unread sentence is the failure it exists to prevent.",
    sources: [
      {
        path: "CLAUDE.md",
        anchor: "explain tradeoffs in plain language and teach as you go",
      },
    ],
  },
  {
    id: "defaults-must-be-reversible",
    kind: "quoted",
    text:
      "Each open question carries a default that applies if nobody answers, and the default is constrained rather than chosen: Defaults must be reversible choices, never one-way doors (pricing, data schema, deletions = no default, PM must answer). Silence can therefore only ever produce the undoable option.",
    sources: [
      {
        path: "docs/redteam-protocol.md",
        anchor: "Defaults must be reversible choices, never one-way doors",
      },
    ],
  },
  {
    id: "stale-gate-is-a-false-statement",
    kind: "quoted",
    text:
      "Two documents once described a quality gate that had been abolished months earlier, as though it were still owed. The rule that came out of it is stated as a matter of truth rather than tidiness: a gate nobody performs any more, written as a thing still to be done, is a false statement in the repository.",
    sources: [
      {
        path: "src/content/retired-gates.test.ts",
        anchor: "written as a thing still to be done, is a false statement in the",
      },
    ],
  },
  {
    id: "fix-the-class-not-the-instance",
    kind: "quoted",
    text:
      "The repair was not the two sentences. Fixing the two sentences leaves the class open, so the rule became a test that scans every document on every run, proved in both directions, because a guard that has only ever returned clean is not known to check anything.",
    sources: [
      {
        path: "src/content/retired-gates.test.ts",
        anchor: "Fixing the two sentences leaves the class open",
      },
    ],
  },
  {
    id: "published-text-must-match-the-code",
    kind: "quoted",
    text:
      "The same rule now binds the files this site publishes about itself. They described an instrument of eight clips long after it had grown to sixteen, so the quantities are derived from the shipped item pool instead of being retyped: change the pool without changing the sentence and this fails, naming both numbers.",
    sources: [
      {
        path: "src/content/published-text.test.ts",
        anchor: "change the pool without changing the sentence and this fails",
      },
    ],
  },
  {
    id: "recovery-before-fielding",
    kind: "quoted",
    text:
      "Before an estimator is trusted with real answers it is run on simulated ones generated from a known model, and required to recover the known parameters. The claim that buys is deliberately modest: I validated the estimator by parameter recovery before fielding it.",
    sources: [
      { path: "docs/artifact-pivot-2026-08-07.md", anchor: "recover the known parameters" },
      {
        path: "docs/artifact-pivot-2026-08-07.md",
        anchor: "I validated the estimator by parameter recovery before fielding it.",
      },
    ],
  },
  {
    id: "simulated-is-labelled",
    kind: "quoted",
    text:
      "Nothing simulated is allowed to pass as observed, anywhere it might be seen: in-app, in charts, in the write-up, in the repo. The badge is not small print. It is the reason the analytics pages are allowed to exist before a single person has taken a test.",
    sources: [
      {
        path: "docs/artifact-pivot-2026-08-07.md",
        anchor: "in-app, in charts, in the write-up, in the repo.",
      },
    ],
  },
  {
    id: "band-not-point",
    kind: "quoted",
    text:
      "Where a measurement is noisy the product must show the uncertainty rather than hide it behind a label: report the band, never the point, because a point estimate from a noisy measurement is a claim the measurement cannot support.",
    sources: [{ path: "src/engine/delicacy.ts", anchor: "report the band, never the point" }],
  },
];

/**
 * THE REFUSALS (E9/S3 — blueprint E2, in the order the blueprint names them).
 *
 * FOUR, AND FOUR IS THE FINAL NUMBER (RT-X:c, ruled 2026-08-27).
 *
 * The blueprint names five, the fifth being display advertising, declined on
 * measurement grounds. That ruling is recorded only in
 * `docs/redirection-blueprint-2026-08-26.md`, which is deliberately untracked
 * (RT-M:c), and the verifier refuses untracked sources for a reason that
 * applies here exactly: a citation only this machine can open reads as evidence
 * and is not one.
 *
 * Offered the choice of copying the ruling into a tracked file, the owner ruled
 * (c): leave it out entirely. The reason is worth keeping, because it governs
 * anything else that wants to move into this repository — the repository is a
 * portfolio artifact, and deliberation about how the product might make money
 * is not what it is for. Do not re-propose the advertising refusal, and do not
 * import blueprint material to support some future claim without asking again.
 */
export const METHOD_REFUSALS: MethodRefusal[] = [
  /**
   * THE SEVENTH REFUSAL (E21/S4, executing RT-3 (a); Track S's held line, now
   * released).
   *
   * TWO THINGS IN ONE ENTRY, ON PURPOSE. Track S had a line ready — that no
   * further instrument is added — and it was deliberately unpublished, because
   * RT-P1 had a mock for one awaiting approval and the line would have been
   * false the day it was approved. Publishing them separately now would give
   * the reader a restraint and, elsewhere, a reason, and the reason is the only
   * part worth having. A product that says it adds nothing more sounds
   * disciplined; one that says what the last candidate cost to evaluate is
   * making a checkable claim.
   *
   * WHOSE FAILURE THIS RECORDS. The instrument was sized against a session
   * length engineering put in a decisions block without deriving it, and the
   * derivation came back four times larger. That is on engineering, and the
   * entry says so — the page's own expertise rule refuses characterisations of
   * a person, and "approved on a bad number" is a fact about who computed the
   * number, not about who read it.
   *
   * EVERY FIGURE IS SLOTTED, not typed. `instrument-shape.ts` derives them from
   * the engine and `preference-kill-record.test.ts` pins the document to the
   * same functions, so this paragraph cannot quietly stop being true — which
   * matters more here than anywhere else on the page, because a refusal is the
   * one claim a reader cannot check by using the product.
   *
   * `inferred` for the reason the fifth and sixth carry it: the RULING is
   * tracked and cited, and the judgment that the arithmetic settles the
   * question is mine.
   */
  {
    id: "refusal-preference-instrument",
    what: "A fifth instrument, to turn preference into words",
    rule: "N3, and the arithmetic the proposal produced about itself",
    kind: "inferred",
    refusal:
      `The ${numberWord(LIVE_INSTRUMENTS)} instruments here each have a right answer — damage you can or cannot hear, a label's pull, a critic's gaps. None of them touches the thing listeners actually report, which is that they cannot say what they like. Another was specified for exactly that: you say what you prefer, then choose blind between two versions of the same passage differing in one respect, and the product is the moment your words and your ears disagree. It was approved, sized, and killed by the first slice that did its arithmetic. A preference has no right answer, so the only measurable thing is whether blind choices agree with each other — and that takes ` +
      `${numberWord(PREFERENCE_SITTING_TRIALS)} of them per dimension from a decisive listener. Three dimensions is ${numberWord(PREFERENCE_SITTING_PAIRS)} pairs; at ${numberWord(PREFERENCE_SECONDS_PER_PAIR)} seconds a pair, ${numberWord(PREFERENCE_SITTING_MINUTES)} minutes — longer than all four shipped instruments together. It had been sized against a figure a quarter that size, which engineering stated without deriving. Run against the numbers in its own specification, two of its four findings did not survive, the contradiction it existed to deliver among them. Nothing further is added to this product on easier terms than these: an instrument arrives with the arithmetic for its own sitting length, or it does not arrive.`,
    price:
      "The largest one on this page, and it is unpaid rather than accepted. Two findings came out of listening to people: that past listening predicts less than present taste, and that almost nobody can describe their own taste in words. This product serves the first and does nothing at all for the second, which is the one with somebody in front of it. The refusal does not say that instrument was a bad idea — it says this design could not be built at a length anyone would sit, and no better design has been found. Somebody else may well find one.",
    sources: [
      {
        path: "docs/rt-answers-2026-09-13.md",
        anchor:
          "an instrument killed by an argument leaves a paragraph, and one killed by arithmetic leaves a test that still runs",
      },
      {
        path: "src/engine/preference.ts",
        anchor: "must not be read as a plan",
      },
    ],
  },
  /**
   * THE SIXTH REFUSAL (E20, Track M closed, Track S published).
   *
   * WHY THE RECORDED REASON IS NOT THE REASON GIVEN HERE, which is the only
   * interesting thing about this entry. The Gem was put on hold over "two
   * visibly unlit facets" — two of Hume's five criteria had no instrument, so a
   * five-faceted visual would have shown two dark. That premise DIED on
   * 2026-09-02 when the fifth criterion shipped; all five have machines now and
   * nothing would be dark for a person who finished them.
   *
   * Executing a kill on a reason that has expired would have been the easy
   * path, and it would have put a false sentence on this page. The objection
   * that survives is different and larger: the darkness was never about which
   * instruments EXIST, it is about which ones the reader has DONE. A person who
   * has taken one instrument meets four dark facets and a thing to fill in,
   * which is a completion meter — and the anti-clone clause refuses those by
   * name rather than by argument.
   *
   * `inferred`, for the same reason as the composite index: the ruling gating
   * it is citable and tracked, and the JUDGMENT that the sentences landed well
   * enough to make a visual decoration is mine.
   */
  {
    id: "refusal-taste-gem",
    what: "The Taste Gem — a five-faceted picture of your result",
    rule: "the anti-clone clause, and the writing pass that made it unnecessary",
    kind: "inferred",
    refusal:
      `A visual was held back until the product's sentences had been through a writer, on the rule that if the sentences landed the picture was decoration. Three batches of them have now been written, applied and shipped, and every result screen ends in prose rather than in a unit. The picture would add no fact the sentences do not already carry. What it would add is five facets, most of them dark for most people — because a reader has usually taken one instrument, not ${numberWord(LIVE_INSTRUMENTS)} — and a shape with slots to fill in is a completion meter however carefully it is drawn. This product refuses those by name.`,
    price:
      "The one thing the product will never have is an image a person can post without reading a word. Every result here has to be read to be understood, which costs the share loop most of its reach and is the second time that trade has been made deliberately: the ranked verdict went the same way. What it buys is that nothing on a result screen can be understood as a score out of five.",
    sources: [
      {
        path: "docs/handoff-2026-09-01.md",
        anchor: "two visibly unlit facets",
      },
      {
        path: "docs/handoff-2026-09-04b.md",
        anchor: "Track M was always gated on the sentences having been read",
      },
    ],
  },
  /**
   * THE FIFTH REFUSAL (E20/S1, executing RT-I (a), ruled 2026-09-01).
   *
   * WHY IT IS `inferred` AND NOT `quoted`, which is the only interesting
   * decision in this entry. The RULING is on the tracked record and is cited
   * below; the DESIGN it killed is too. The REASONING -- that no weighting over
   * five incommensurable scales can be justified without respondents -- is not
   * in any tracked document. It lives in a working blueprint that is not in
   * this repository, so /method cannot cite it, and a claim citing nothing
   * verifiable is the one thing this page refuses to do. So it renders under
   * the inference label: the engineer's reading, not the record speaking.
   *
   * Marking it `quoted` would have been easy, invisible to every test here, and
   * exactly the failure RT-159a made this page conditional on.
   */
  {
    id: "refusal-composite-index",
    what: "The Taste Index — one number standing for a person's taste",
    rule: "N3, and the ruling on ranked tiers that it would have repeated",
    kind: "inferred",
    refusal:
      "The design that opened this phase ended at a single composite over five sub-scores. The five are a percentage of movement toward a label, a detection band, a threshold in cents, a count of distinguished works and a calibration score — five different units measuring five different things. Adding them requires deciding how much each is worth, and that weighting can only be argued from a population this product does not have: the cohort is zero. A number assembled from an unjustifiable weighting is not a summary of five measurements, it is a sixth claim resting on none of them. There is no Taste Index, and there will not be one.",
    price:
      "The product gave up the one thing it could have put on a share card and in a headline — a single figure a person could compare, remember and repeat. What ships instead is five readings in their own units, each meaningless outside its own context, on five screens nobody has to visit in order. That is a worse product to market and the only honest one available, and it is the same trade the six ranked tiers lost: a sharper claim given up, rather than kept in the hope nobody checked.",
    sources: [
      {
        path: "docs/artifact-pivot-2026-08-07.md",
        anchor: "five sub-scores + one composite, each traceable to a measured task",
      },
      {
        path: "docs/handoff-2026-09-01.md",
        anchor: "kill the composite Taste Index, publish sub-scores as a profile",
      },
      {
        path: "src/engine/delicacy.ts",
        anchor: "A tier name is a point estimate wearing an adjective.",
      },
    ],
  },
  {
    id: "refusal-ranked-tiers",
    what: "Six ranked verdict tiers on the Delicacy result",
    rule: "N3, applying RT-90a — report the band, never the point",
    kind: "quoted",
    refusal:
      "They shipped first, and then the measurement meant to justify them killed them. Asked how often the six tiers put a person in the right one at the shipping length: 30.5%. No coarser cut rescued it. A tier name is a point estimate wearing an adjective.",
    price:
      "The result screen lost the one line a person could repeat to a friend and got an interval instead — wider, duller, and true. Earning a ranked verdict honestly would land on ~42–45 trials = 21 min, which is the session 15 was chosen to avoid. The product kept the shorter session and gave up the sharper claim, rather than keeping both and hoping nobody checked.",
    sources: [
      {
        path: "src/engine/delicacy.ts",
        anchor: "put a person in the right one at the shipping length: 30.5%",
      },
      {
        path: "src/engine/delicacy.ts",
        anchor: "A tier name is a point estimate wearing an adjective.",
      },
      {
        path: "docs/handoff-2026-08-22.md",
        anchor: "~42–45 trials = 21 min, which is the session 15 was chosen to avoid",
      },
    ],
  },
  {
    id: "refusal-paid-tier",
    what: "The paid training arc — the entire business model",
    rule: "the D4 amendment",
    kind: "quoted",
    refusal:
      "The plan was to give the assessment away and charge for the training arc. It was withdrawn in one line — there is no paid tier, and no pricing question — because a paywall on the training loop would have put the honest deliverable, whether your ear actually moved, behind the wall.",
    price:
      "The project gave up its only means of showing that anyone would pay for this, at a point where monetization remains a goal but as proof of commercial viability, not income. It also created upkeep nobody budgeted for: six weeks after the ruling, three published sentences still promised the tier — on two reading-room pages and in the file the product serves to AI crawlers. Writing a rule down does not enforce it.",
    sources: [
      { path: "CLAUDE.md", anchor: "there is no paid tier, and no pricing question" },
      {
        path: "restructuring_decision_memo_2026-07-11.md",
        anchor: "Monetization remains a goal but as proof of commercial viability, not income.",
      },
      {
        path: "src/content/voice.test.ts",
        anchor: "The paid tier is the training arc — retests, progression",
      },
    ],
  },
  {
    id: "refusal-priced-consumer-product",
    what: "The $3.99 consumer product, and the funnel built to feed it",
    rule: "memo C1 — a conclusion of record rather than a rule",
    kind: "quoted",
    refusal:
      "Viral consumer distribution for a $3.99 impulse product is dead, concluded on twenty-nine visitors across a month, with the World Cup front door spreading to nobody at all.",
    price:
      "A quiz, a share-card pipeline, a paywall and a Merchant-of-Record payment adapter all became legacy in a single decision. And here is the part that is easiest to leave off a page like this: the paid product itself was never tested (4 paywall views). The verdict was reached on distribution evidence, and the pricing question it looks like it answers was never actually asked.",
    sources: [
      {
        path: "restructuring_decision_memo_2026-07-11.md",
        anchor: "Viral consumer distribution for a $3.99 impulse product is dead",
      },
      {
        path: "restructuring_decision_memo_2026-07-11.md",
        anchor: "The paid product itself was never tested (4 paywall views)",
      },
    ],
  },
  {
    id: "refusal-human-ear-check",
    what: "The human ear-check on every audio clip",
    rule: "a gate only one person can discharge is debt; artifact pivot §1",
    kind: "quoted",
    refusal:
      "Quality control was a person listening to each clip and approving it. It was abolished — The PM never judges a clip again — on the owner's own finding: Ear-passes by a non-musician = unstable labels = no value. The gate was not adding quality. It was adding a delay only one person could clear.",
    price:
      "The replacement has two layers, and the one the pivot itself calls the real gate — item difficulty and discrimination estimated from response data — has never run, because there are Zero real responses. What gates clips today is the acoustic layer alone: loudness, spectral distance, silence, clipping. It can measure how large a manipulation is. It cannot notice that a clip is bad in a way nobody thought to model.",
    sources: [
      { path: "docs/artifact-pivot-2026-08-07.md", anchor: "The PM never judges a clip again." },
      {
        path: "docs/artifact-pivot-2026-08-07.md",
        anchor: "Ear-passes by a non-musician = unstable labels = no value",
      },
      { path: "docs/artifact-pivot-2026-08-07.md", anchor: "estimated from response data" },
      { path: "docs/blueprint-vs-reality-2026-08-25.md", anchor: "Zero real responses" },
    ],
  },
];

/**
 * A REVERSAL, WHICH IS NOT A REFUSAL (E21/S5, Track U4 — RT-Z5 (2026-09-16) (b)).
 *
 * WHY IT IS A SEPARATE TYPE AND A SEPARATE SECTION. This page is organised
 * around constraints this project held. On 2026-09-16 it deliberately RELAXED
 * one — D1, the rule that the product describes what you did and never what you
 * are, and the rule the paid personality quiz was killed under. Filing that
 * among the refusals would be a false statement about the record: it would make
 * a page of seven refusals read as eight, and the eighth would be the one entry
 * that is not a refusal at all. The heading counts `METHOD_REFUSALS`, so a
 * reversal placed in that array would silently change a number the page states
 * about itself — the defect this page has already shipped once, when a typed
 * count of four sat above a list of six.
 *
 * A PAGE OF SEVEN REFUSALS THAT THEN ADMITS ONE REVERSAL IS MORE CREDIBLE THAN
 * A PAGE OF EIGHT REFUSALS. That is the argument for publishing it at all, and
 * it is the MRD's (§6.2). A project that only ever tightens is a project whose
 * rules were never tested against anything it wanted.
 *
 * THE SHAPE BORROWS THE REFUSAL'S DISCIPLINE AND ADDS ONE FIELD. A refusal
 * states what it cost. A reversal has to state what it cost AND what it bought,
 * because a relaxation with no stated gain is not a decision either — it is a
 * rule that was inconvenient.
 */
export interface MethodReversal {
  id: string;
  /** What was relaxed, as the page's heading for it. */
  what: string;
  /** The rule that was relaxed — "D1". */
  rule: string;
  /** The relaxation itself, and its boundary. */
  reversal: string;
  /** What the relaxation bought. Never "nothing". */
  bought: string;
  /** What it cost. Never "nothing". */
  price: string;
  kind: ClaimKind;
  sources: ClaimSource[];
}

export const METHOD_REVERSALS: MethodReversal[] = [
  {
    id: "reversal-d1-on-one-surface",
    what: "Speaking about the person, on one surface only",
    rule: "D1 — the product describes what you did, never what you are",
    kind: "quoted",
    reversal:
      "Every reading on this site is a statement about a performance. That was a rule rather than a habit: it is written into the constitution as D1, and it is why a five-tap personality verdict with no measurement behind it was killed rather than improved. On 2026-09-16 the owner relaxed it, against the engineering recommendation on file. The card that turns a measured threshold into words a person can use may speak to the reader about themselves — and D1 is suspended for the prompt card, and for nothing else. Every instrument readout on this site still says only what you did.",
    bought:
      "The one thing here anybody would keep. The measurement ends in a threshold in cents, the number is evidence, and it had been standing in the position of the deliverable — which is why a technically sound instrument was neither enjoyable to use nor convincing to look at. A sentence that is only about a performance cannot be the thing somebody leaves with.",
    price:
      "This project can no longer say that every sentence it shows is about performance. That was true, it was one of the plainest things the product could say about itself, and it is now false — the exception is real even though it is one surface wide. The constitution also gains an exception, which is complexity it did not have, and every surface built from here has to ask which side of it it falls on. The rule that survives is narrower and harder to hold: offer, do not assert.",
    sources: [
      {
        path: "CLAUDE.md",
        anchor: "D1 is suspended for the prompt card, and for nothing else",
      },
      {
        path: "docs/rt-answers-2026-09-16.md",
        anchor: "The card may speak about the person",
      },
    ],
  },
];

/**
 * One list for the verifier, so claims and refusals are held to the SAME rule.
 *
 * Two ledgers checked by two copies of the same logic is how the rung tables
 * came to disagree with each other. A refusal's verifiable text is everything
 * the reader sees of it, because that is what a quotation has to survive being
 * embedded in.
 */
export function verifiableEntries(): MethodClaim[] {
  return [
    ...METHOD_CLAIMS,
    ...METHOD_REFUSALS.map((r) => ({
      id: r.id,
      kind: r.kind,
      text: `${r.what} ${r.refusal} ${r.price}`,
      sources: r.sources,
    })),
    ...METHOD_FINDINGS.map((f) => ({
      id: f.id,
      kind: f.kind,
      text: `${f.finding} ${f.consequence}`,
      sources: f.sources,
    })),
    /*
     * The reversal joins the SAME list, for the reason the refusals did: two
     * ledgers checked by two copies of one rule is how the rung tables came to
     * disagree with each other. Its verifiable text is everything the reader
     * sees of it.
     */
    ...METHOD_REVERSALS.map((r) => ({
      id: r.id,
      kind: r.kind,
      text: `${r.what} ${r.reversal} ${r.bought} ${r.price}`,
      sources: r.sources,
    })),
  ];
}

/**
 * A FINDING AGAINST THE PROJECT ITSELF (E9/S4 — blueprint E3).
 *
 * The page carries the worst thing this project has found about how it works,
 * dated, with the rule it broke. Not as atonement — as the only evidence that
 * the review process described elsewhere on the page actually catches anything.
 * A method page whose every example flatters the method is a brochure.
 *
 * `consequence` is what it has cost SINCE, in the present tense, because a
 * finding written up and then left alone is the failure repeating itself.
 */
export interface MethodFinding {
  id: string;
  /** ISO date the finding was recorded. Must be traceable to a source. */
  date: string;
  /** The rule it broke. */
  rule: string;
  /** What happened. */
  finding: string;
  /** What it has cost since. */
  consequence: string;
  kind: ClaimKind;
  sources: ClaimSource[];
}

export const METHOD_FINDINGS: MethodFinding[] = [
  {
    /*
     * E14 (Track H). The arc is the product's headline promise — did your ear
     * move — and what the measurement says about it is unflattering enough that
     * it belongs on this page rather than only in a docstring.
     */
    id: "finding-arc-mostly-refuses",
    date: "2026-09-02",
    rule: "N3 — nothing the data cannot support",
    kind: "quoted",
    finding:
      `Before the retest arc was allowed to tell anyone their ear had moved, the size of change it can resolve was measured: the whole hazard here is that subtracting two noisy numbers manufactures progress. Simulating the same unchanged person through two sessions at the shipped length puts the floor on the pitch ladder at roughly ${(soloFloorFactor("pitch-drift") ?? 0).toFixed(1)} times — the threshold has to more than halve before the difference can be told from ordinary run-to-run wobble. On the prestige test it is ${numberWord(ARC_FLOORS.bias)} points of the scale. The delicacy trials cannot support an arc at all: ${numberWord(DELICACY_ARC_FLOOR.itemsToMove)} of their ${numberWord(DELICACY_ARC_FLOOR.trials)} pairs would have to change hands.`,
    consequence:
      "Most retests are therefore told, in as many words, that nothing changed the instrument could hear. That refusal is the ordinary output of this feature rather than its edge case, and the sentence names the floor in the reader's own units so it reads as a fact about the instrument rather than a verdict on them. The only thing that lowers the floor is returning: pooled across four sittings it falls to about two and a half times, which is the entire reward this product offers for coming back.",
    sources: [
      { path: "src/engine/arc.ts", anchor: "subtracting two noisy numbers manufactures" },
      { path: "docs/analytics/e14-arc-resolution.txt", anchor: "WHAT A PERSON MUST DO BEFORE THE ARC MAY SPEAK" },
    ],
  },
  {
    id: "finding-launch-avoidance",
    date: "2026-08-07",
    rule: "N2 — the anti-theater guardrail",
    kind: "quoted",
    finding:
      "A ruling had already been made: post the flagship instrument on its own, within one to two weeks, and do not let the second instrument gate it. The second instrument got built instead. The plan written that day says it without softening: Delicacy got built instead. That is the N2 launch-avoidance pattern, on the record. And directly above it, the diagnosis: Nothing is blocked by engineering. Everything is blocked by the launch not having happened.",
    consequence:
      "As of the revision date at the foot of this page, it still has not been posted. The product has had 29 real visitors, ever. There are Zero real responses, which is why every psychometric figure in the Lab is generated from a known model and badged as simulated — the dataset that was named as the project's proprietary asset does not exist. Building is the part that feels like progress, and it is the part that was never the constraint.",
    sources: [
      {
        path: "docs/endgame-plan-2026-08-07.md",
        anchor: "Delicacy got built instead. That is the N2 launch-avoidance pattern, on the record.",
      },
      {
        path: "docs/endgame-plan-2026-08-07.md",
        anchor:
          "Nothing is blocked by engineering. Everything is blocked by the launch not having happened.",
      },
      { path: "docs/blueprint-vs-reality-2026-08-25.md", anchor: "29 real visitors, ever" },
      { path: "docs/blueprint-vs-reality-2026-08-25.md", anchor: "Zero real responses" },
    ],
  },
  {
    id: "finding-avoidance-then-ratified",
    date: "2026-08-07",
    rule: "N2 — the same guardrail, applied to the response rather than the act",
    kind: "inferred",
    finding:
      "What happened next is the part that is harder to read, and this reading is mine rather than a recorded ruling. Within the same week the project adopted a direction that made the avoided thing optional: Resume value cannot be hostage to a launch the owner has no energy to run, and after it, The 2026-09-15 deadline is not a live constraint. That argument is sound on its own terms. It is also, in sequence, a project noticing that it was avoiding something and then removing the requirement to do it.",
    consequence:
      `I cannot tell from the record which of the two it was, and neither can a reader, so the page says so rather than choosing the flattering reading. The test that would settle it is not an argument: it is whether the instruments are ever put in front of strangers. Until they are, the honest description of this project is that it has built ${numberWord(LIVE_INSTRUMENTS)} working instruments and measured them against simulated respondents.`,
    sources: [
      {
        path: "docs/artifact-pivot-2026-08-07.md",
        anchor: "Resume value cannot be hostage to a launch the owner has no energy to run.",
      },
      {
        path: "docs/endgame-plan-2026-08-07.md",
        anchor: "The 2026-09-15 deadline is not a live constraint.",
      },
    ],
  },
];

/**
 * THE DATE THE PAGE'S PROSE WAS LAST CHECKED AGAINST REALITY.
 *
 * The launch-avoidance consequence used to open "Twenty days later", which was
 * true on the day it was written and started rotting the next morning. An
 * elapsed-time phrase has nothing to derive itself from, so it cannot be
 * guarded and cannot be trusted. The page renders this date instead and the
 * prose refers to it, which turns an arithmetic claim into a dated one.
 *
 * Bump it when the standing facts are re-checked — not when the styling moves.
 */
export const METHOD_AS_OF = "2026-08-27";

/**
 * THE READER ORDER (E9/S6 — blueprint E1: the page is for product-manager,
 * business-analyst and data-analyst readers, IN THAT ORDER).
 *
 * WHY THIS IS DATA AND NOT JUST THE ORDER OF THE JSX. Three things have to stay
 * true at once: the sections appear in the ruled order; every claim in the
 * ledger appears in exactly one of them; and no section quietly empties out.
 * None of those survives being a convention about how a file is typed. The
 * middle one matters most — a claim added to the ledger and never placed in a
 * section would verify perfectly and render nowhere, which is this repository's
 * most repeated near-miss: a permalink mount is not a flow mount.
 *
 * The three audiences are not three topics. They are three questions: how a
 * decision gets made and stays made · how a written requirement stays true ·
 * how a number earns the right to be shown.
 */
export interface MethodSection {
  id: "pm" | "ba" | "da";
  /** The heading. Names the question, not the job title. */
  heading: string;
  /** Who it is for, said plainly — the ordering is itself a claim about readers. */
  audience: string;
  lede: string;
  /** Claim ids from METHOD_CLAIMS, in reading order. */
  claims: string[];
}

export const METHOD_SECTIONS: MethodSection[] = [
  {
    id: "pm",
    heading: "How a decision gets made, and stays made",
    audience: "For a product manager",
    lede:
      "The project runs on a written constitution and two review protocols. What is unusual is not that they exist. It is that they constrain the engineer more than the owner, and that they are enforced by tests rather than by good intentions.",
    claims: [
      "pm-is-not-an-engineer",
      "asks-must-be-in-the-block",
      "defaults-must-be-reversible",
      "n2-complexity-is-a-cost",
      "slice-protocol-rationale",
      "protocols-defend-against-the-author",
    ],
  },
  {
    id: "ba",
    heading: "How a written requirement stays true",
    audience: "For a business analyst",
    lede:
      "Documentation drifting away from the system it describes is the normal condition of software, and it is usually filed under untidiness. Here it is a defect with a failing test attached — because a document describing a gate nobody performs sends the next reader to ask for a sign-off that cannot be given.",
    claims: [
      "stale-gate-is-a-false-statement",
      "fix-the-class-not-the-instance",
      "published-text-must-match-the-code",
    ],
  },
  {
    id: "da",
    heading: "How a number earns the right to be shown",
    audience: "For a data analyst",
    lede:
      "There are no real respondents yet. That single fact governs every figure on this site, and the interesting part is what it forbids rather than what it permits.",
    claims: ["n3-honesty-rule", "recovery-before-fielding", "simulated-is-labelled", "band-not-point"],
  },
];

/** Claims in reading order, resolved from the sections. Throws on an unknown id. */
export function sectionClaims(section: MethodSection): MethodClaim[] {
  return section.claims.map((id) => {
    const claim = METHOD_CLAIMS.find((c) => c.id === id);
    if (!claim) throw new Error(`METHOD_SECTIONS: section "${section.id}" names unknown claim "${id}"`);
    return claim;
  });
}
