/**
 * EVERY PLACE A BLUEPRINT STATEMENT APPEARS OUTSIDE `docs/blueprint.md`
 * (blueprint audit, 2026-09-23, change list A3).
 *
 * One row per copy. `blueprint.test.ts` holds each row to its mode:
 *
 * - `quoted` — the file, whitespace-collapsed, contains the statement's text.
 *   Hard-wrapping is the only difference allowed, plus the two a sentence
 *   needs to sit inside another one: a lower-case first letter and no closing
 *   full stop.
 * - `derived` — the file keeps its own wording, and the token `BP-<ID>` sits
 *   within five lines of `anchor` (a comment is enough), so every paraphrase
 *   names the statement it serves.
 * - `historical` — exempt from matching, for dated records only: a design
 *   mock, a reversal on `/method`. It must say why and when, and its anchor
 *   must still be in the file.
 *
 * A component that renders a statement from `blueprint.ts` is not a copy and
 * has no row: it cannot drift, because it holds no text.
 */
import type { BpId } from "./blueprint";

export type CopyMode = "quoted" | "derived" | "historical";

export interface BlueprintCopy {
  path: string;
  id: BpId;
  mode: CopyMode;
  /** derived: a string in the file the `BP-<ID>` token must sit within five lines of. */
  anchor?: string;
  /**
   * historical: why this copy is exempt, with its date (YYYY-MM-DD). A historical
   * row also carries an `anchor` that must still be in the file, so the row cannot
   * outlive the record it exempts.
   */
  reason?: string;
}

export const BLUEPRINT_COPIES: readonly BlueprintCopy[] = [
  // The recruiter-facing page (change list B9).
  { path: "docs/index.html", id: "BP-F1", mode: "quoted" },
  { path: "docs/index.html", id: "BP-F2", mode: "quoted" },
  { path: "docs/index.html", id: "BP-UNMET", mode: "quoted" },
  // Blueprint Part 8: the two public pages quote the insight, and the README the unmet demand.
  { path: "docs/index.html", id: "BP-INSIGHT", mode: "quoted" },
  { path: "README.md", id: "BP-INSIGHT", mode: "quoted" },
  { path: "README.md", id: "BP-UNMET", mode: "quoted" },
  // The repository's front page (change list B8).
  { path: "README.md", id: "BP-F1", mode: "quoted" },
  { path: "README.md", id: "BP-F2", mode: "quoted" },
  // /method's largest price, and its decks (change list B10).
  { path: "src/content/method/claims.ts", id: "BP-F1", mode: "quoted" },
  { path: "src/content/method/claims.ts", id: "BP-F2", mode: "quoted" },
  { path: "docs/copy-deck-method.md", id: "BP-F1", mode: "quoted" },
  { path: "docs/copy-deck.md", id: "BP-F1", mode: "quoted" },
  // The PRD and the MRD cite the interview findings.
  { path: "docs/prd-1-use-cases.md", id: "BP-F1", mode: "quoted" },
  { path: "docs/prd-1-use-cases.md", id: "BP-F2", mode: "quoted" },
  // Part 2 scores every feature against the goal's clauses (BA-2), so it quotes the goal.
  { path: "docs/prd-2-features.md", id: "BP-GOAL", mode: "quoted" },
  { path: "docs/mrd-prompt-card-2026-09-16.md", id: "BP-F1", mode: "quoted" },
  // The front door's paraphrase of what incumbents lack (change list C).
  { path: "src/content/landing.ts", id: "BP-UNMET", mode: "derived", anchor: "export const LANDING_ALGORITHM" },
  // The constitution's D3 amendment (BA-6) states the bridge verbatim and paraphrases the goal.
  { path: "CLAUDE.md", id: "BP-BRIDGE", mode: "quoted" },
  { path: "CLAUDE.md", id: "BP-GOAL", mode: "derived", anchor: "BP-GOAL asks that a reviewer can try the core" },
  { path: "CLAUDE.md", id: "BP-UNMET", mode: "derived", anchor: "A listener's recent plays are read into lines" },
  // The spec's stamp restating what replaced the thesis (change list B1).
  { path: "vibe_check_mvp_spec.md", id: "BP-INSIGHT", mode: "derived", anchor: "*[BLUEPRINT OF RECORD 2026-09-23" },
  // Blueprint Part 7: the front door, the reading, the Company view, /learn/why.
  { path: "src/content/landing.ts", id: "BP-INSIGHT", mode: "derived", anchor: "export const LANDING_HEADLINE" },
  { path: "src/content/landing.ts", id: "BP-UNMET", mode: "derived", anchor: "export const LANDING_READING_TURN" },
  { path: "src/content/reading/copy.ts", id: "BP-UNMET", mode: "derived", anchor: "export const READING_TITLE" },
  { path: "src/content/company/copy.ts", id: "BP-CA2", mode: "derived", anchor: "export const FIT_LINES" },
  { path: "src/content/learn.ts", id: "BP-ARG-WEAK", mode: "derived", anchor: 'q: "Where is the argument weakest?"' },
  { path: "docs/commission-batch-5.md", id: "BP-INSIGHT", mode: "derived", anchor: "The three sentences, verbatim" },
  // The writing commission quotes three statements, parsed from the blueprint by its exporter.
  { path: "docs/copy-commission.md", id: "BP-INSIGHT", mode: "quoted" },
  { path: "docs/copy-commission.md", id: "BP-UNMET", mode: "quoted" },
  { path: "docs/copy-commission.md", id: "BP-BRIDGE", mode: "quoted" },
  // Dated records.
  {
    path: "docs/preference-mock-2026-09-13.md",
    id: "BP-F1",
    mode: "historical",
    anchor: "Past listening predicts less than present and forming taste.",
    reason: "A design mock dated 2026-09-13, recording what was argued on that day.",
  },
  {
    path: "src/content/method/claims.ts",
    id: "BP-INSIGHT",
    mode: "historical",
    anchor: "reversal-d1-second-surface",
    reason:
      "The /method reversals of 2026-09-16 and 2026-09-23 record the owner's argument as it stood on each day; rewriting them would falsify the record.",
  },
];
