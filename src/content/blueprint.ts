/**
 * THE BLUEPRINT, READ FROM ITS ONE CANONICAL TEXT (blueprint audit, 2026-09-23).
 *
 * `docs/blueprint.md` holds the project's goal, insight, demand, unmet demand,
 * challenged assumptions, bridge and business case, with the insight's
 * argument, once. Every component that shows one of them renders it from here,
 * so no sentence of the blueprint is ever retyped into a component: retyping is
 * how the nine earlier copies drifted until two of them made different claims.
 *
 * THE FORMAT IS THE FILE'S OWN. Between the two markers, each statement is one
 * line `**BP-ID** · text`; the italic line under it carries its label (or its
 * kind) and its sources, and is not part of the quoted text.
 *
 * SERVER-ONLY. It reads the file with `fs`, so a client component must receive
 * the strings as props. Every page that uses it is prerendered, so the read
 * happens at build, where the repository is present.
 */
import { readFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";

export const BLUEPRINT_PATH = "docs/blueprint.md";
export const BEGIN_MARKER = "<!-- BLUEPRINT:BEGIN";
export const END_MARKER = "<!-- BLUEPRINT:END -->";

export type BpId = `BP-${string}`;

/** The label N3 requires a reader to see beside each premise. */
export type BpLabel = "EVIDENCED" | "ASSUMED" | "INFERENCE";

export interface BpStatement {
  id: BpId;
  text: string;
  /** The italic line under the statement, asterisks removed; "" when there is none. */
  note: string;
  /** The first of EVIDENCED / ASSUMED / INFERENCE the note names, or null (a ruling, a position). */
  label: BpLabel | null;
}

export interface Blueprint {
  statements: BpStatement[];
  BP: Record<BpId, string>;
}

const LINE = /^\*\*(BP-[A-Z0-9-]+)\*\* · (.+)$/;

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
    const next = lines[i + 1] ?? "";
    const note = /^\*[^*]/.test(next) ? next.replace(/^\*|\*$/g, "").trim() : "";
    const label = (/\b(EVIDENCED|ASSUMED|INFERENCE)\b/.exec(note)?.[1] ?? null) as BpLabel | null;
    statements.push({ id: m[1] as BpId, text: m[2].trim(), note, label });
  }
  const BP = Object.fromEntries(statements.map((s) => [s.id, s.text])) as Record<BpId, string>;
  return { statements, BP };
}

export function loadBlueprint(path = BLUEPRINT_PATH): Blueprint {
  return parseBlueprint(readFileSync(isAbsolute(path) ? path : join(process.cwd(), path), "utf8"));
}

const LOADED = loadBlueprint();

export const BP_STATEMENTS: readonly BpStatement[] = LOADED.statements;
export const BP: Record<BpId, string> = LOADED.BP;

/** One statement, or a loud failure: a missing ID must break the page, not render blank. */
export function bp(id: BpId): BpStatement {
  const s = BP_STATEMENTS.find((x) => x.id === id);
  if (!s) throw new Error(`${id} is not in ${BLUEPRINT_PATH}`);
  return s;
}

/** The argument in order, each premise with its label (N3: the reader sees which is which). */
export const BP_ARG_ORDER = ["BP-ARG-P1", "BP-ARG-P2", "BP-ARG-S1", "BP-ARG-P3", "BP-ARG-P4", "BP-ARG-C"] as const;
export const BP_ARG = BP_ARG_ORDER.map((id) => bp(id));

/** The objection, the reply and the objection held open, with their sources. */
export const BP_ARG_DEFENCE = (["BP-ARG-OBJECTION", "BP-ARG-REPLY", "BP-ARG-OPEN"] as const).map((id) => bp(id));

/**
 * The note as a reader may see it: a published citation, or nothing. A note that
 * points inside this repository ("spec §20.B", "MRD M8", another BP- ID) is a
 * cross-reference for the people maintaining it, and on a page it reads as noise.
 */
export function publicSource(s: BpStatement): string | null {
  if (!s.note || /\bBP-[A-Z]|\bspec §|\bMRD\b|\bRT-\d/.test(s.note)) return null;
  return s.note;
}
