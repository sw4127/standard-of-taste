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
