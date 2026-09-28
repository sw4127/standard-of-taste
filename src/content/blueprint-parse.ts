/**
 * THE BLUEPRINT PARSER, WITH NOTHING THAT RUNS ON IMPORT (2026-09-28).
 *
 * Split out of `blueprint.ts`, which reads docs/blueprint.md and resolves the
 * argument's IDs the moment it is imported. That is right for the site (a missing
 * ID must break the build) and wrong for the project-record MCP server, which must
 * re-read the file on every call and must not go down entirely because one ID is
 * missing when it starts. `blueprint.ts` re-exports everything here, so every
 * existing import is unchanged and there is still one parser.
 */
export const BLUEPRINT_PATH = "docs/blueprint.md";
export const BEGIN_MARKER = "<!-- BLUEPRINT:BEGIN";
export const END_MARKER = "<!-- BLUEPRINT:END -->";

export type BpId = `BP-${string}`;

/** The label N3 requires a reader to see beside each premise. */
export type BpLabel = "EVIDENCED" | "ASSUMED" | "INFERENCE";

export interface BpStatement {
  id: BpId;
  text: string;
  /** The italic lines under the statement, asterisks removed, one entry per line. */
  noteLines: string[];
  /** `noteLines` joined by a space; "" when there is none. */
  note: string;
  /** The first of EVIDENCED / ASSUMED / INFERENCE the note names, or null (a ruling, a position). */
  label: BpLabel | null;
  /**
   * The label as the note words it, qualifier included ("EVIDENCED, qualitatively"),
   * or null. What a reader sees: a bare "EVIDENCED" beside a premise resting on
   * interviews reads as the same standard as one resting on a journal (N3).
   */
  labelText: string | null;
}

export interface Blueprint {
  statements: BpStatement[];
  BP: Record<BpId, string>;
}

const LINE = /^\*\*(BP-[A-Z0-9-]+)\*\* · (.+)$/;
/** An italic line: opens and closes on one asterisk. A markdown bullet ("* item") is not one. */
const NOTE_LINE = /^\*[^*\s].*\*$/;
const LABEL_TEXT = /\b(EVIDENCED|ASSUMED|INFERENCE)(, [a-z]+(?=[.;:)]))?/;

/** Pure: the statements between the markers of a blueprint file's text. */
export function parseBlueprint(source: string): Blueprint {
  const lines = source.split(/\r?\n/);
  const begin = lines.findIndex((l) => l.startsWith(BEGIN_MARKER));
  const end = lines.findIndex((l) => l.startsWith(END_MARKER));
  const statements: BpStatement[] = [];
  if (begin < 0 || end < begin) return { statements, BP: {} };
  for (let i = begin + 1; i < end; i++) {
    const m = LINE.exec(lines[i]);
    if (!m) continue;
    const noteLines: string[] = [];
    for (let j = i + 1; j < end && NOTE_LINE.test(lines[j]); j++) {
      noteLines.push(lines[j].replace(/^\*|\*$/g, "").trim());
    }
    const note = noteLines.join(" ");
    const found = LABEL_TEXT.exec(note);
    const label = (found?.[1] ?? null) as BpLabel | null;
    statements.push({ id: m[1] as BpId, text: m[2].trim(), noteLines, note, label, labelText: found?.[0] ?? null });
  }
  const BP = Object.fromEntries(statements.map((s) => [s.id, s.text])) as Record<BpId, string>;
  return { statements, BP };
}
