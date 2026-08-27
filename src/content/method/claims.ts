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
 */

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
    id: "finding-launch-avoidance",
    date: "2026-08-07",
    rule: "N2 — the anti-theater guardrail",
    kind: "quoted",
    finding:
      "A ruling had already been made: post the flagship instrument on its own, within one to two weeks, and do not let the second instrument gate it. The second instrument got built instead. The plan written that day says it without softening: Delicacy got built instead. That is the N2 launch-avoidance pattern, on the record. And directly above it, the diagnosis: Nothing is blocked by engineering. Everything is blocked by the launch not having happened.",
    consequence:
      "Twenty days later, at the time this page was written, it still has not been posted. The product has had 29 real visitors, ever. There are Zero real responses, which is why every psychometric figure in the Lab is generated from a known model and badged as simulated — the dataset that was named as the project's proprietary asset does not exist. Building is the part that feels like progress, and it is the part that was never the constraint.",
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
      "I cannot tell from the record which of the two it was, and neither can a reader, so the page says so rather than choosing the flattering reading. The test that would settle it is not an argument: it is whether the instruments are ever put in front of strangers. Until they are, the honest description of this project is that it has built three working instruments and measured them against simulated respondents.",
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
