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
  { path: "docs/mrd-prompt-card-2026-09-16.md", id: "BP-F1", mode: "quoted" },
  // The front door's paraphrase of what incumbents lack (change list C).
  { path: "src/content/landing.ts", id: "BP-UNMET", mode: "derived", anchor: "export const LANDING_ALGORITHM" },
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
