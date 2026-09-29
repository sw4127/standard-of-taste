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
 * line `**BP-ID** · text`; the italic lines under it carry its label (or its
 * kind), its sources and its cross-references, and are not part of the quoted
 * text. Each italic line is judged on its own for the page (`publicSource`), so
 * a published citation shares no line with a cross-reference (owner-approved
 * 2026-09-28).
 *
 * SERVER-ONLY. It reads the file with `fs`, so a client component must receive
 * the strings as props. Every page that uses it is prerendered, so the read
 * happens at build, where the repository is present.
 */
import { readFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";

export {
  BLUEPRINT_PATH,
  BEGIN_MARKER,
  END_MARKER,
  parseBlueprint,
  type Blueprint,
  type BpId,
  type BpLabel,
  type BpStatement,
} from "./blueprint-parse";
import { BLUEPRINT_PATH, parseBlueprint, type Blueprint, type BpId, type BpStatement } from "./blueprint-parse";

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
 * Every citation form this repository uses for itself, and no published source uses.
 * Widened 2026-09-28 after the red-team subagent showed the old pattern let through
 * every lettered ruling series but none (`\bRT-\d` missed RT-Z10, RT-H, RT-AV), owner
 * rulings (BA-3), the memo's decisions and guardrails (D2, N3), memo sections, argument
 * steps (P1, S1), repository paths and PM rulings. A session/slice ID (E7/S8) is caught
 * by its slice half; a separate alternative for it survived its own mutation and was cut.
 */
export const INTERNAL_REFERENCE =
  /\bBP-[A-Z]|\bspec §|\bMRD\b|\bRT-[A-Z0-9]|\bBA-\d|\b[DNPS]\d\b|\bmemo §|\bdocs\/|\bPM-\d/;

/**
 * The note as a reader may see it: its published lines, or nothing. A line that
 * points inside this repository ("spec §20.B", "MRD M8", another BP- ID) is a
 * cross-reference for the people maintaining it, and on a page it reads as noise.
 * The judgment is per LINE and fails closed: a line mixing a citation with a
 * cross-reference is dropped whole, so a citation reaches the page only when the
 * blueprint gives it a line of its own. A stamp ("[AMENDED 2026-…]", the form
 * every amendment in this repository takes) is a record for maintainers and is
 * never shown, whether or not it names an ID.
 */
export function publicSource(s: BpStatement): string | null {
  const shown = s.noteLines.filter((l) => l && !l.startsWith("[") && !INTERNAL_REFERENCE.test(l));
  return shown.length ? shown.join(" ") : null;
}

/**
 * The public note without the words a page already shows beside it: a leading
 * field name ("Label: ", "Kind: ") and a leading bare label ("EVIDENCED. ").
 * "EVIDENCED, qualitatively." keeps its label, because the qualifier is the point.
 */
export function publicCitation(s: BpStatement): string | null {
  const bare = (publicSource(s) ?? "")
    .replace(/^(Label|Kind): /, "")
    .replace(/^(EVIDENCED|ASSUMED|INFERENCE)\.\s*/, "")
    .trim();
  return bare ? bare.charAt(0).toUpperCase() + bare.slice(1) : null;
}

/** The one line a page prints under a statement: its label, its citation, both, or nothing. */
export function caption(s: BpStatement): string | null {
  const citation = publicCitation(s);
  if (!citation) return s.labelText;
  if (!s.labelText || citation.includes(s.labelText)) return citation;
  return `${s.labelText} · ${citation}`;
}

/*
 * THE CHINESE BLUEPRINT (bilingual Parts 2–3, 2026-09-29).
 *
 * `docs/blueprint.zh.md` carries the same markers and IDs, one Chinese line per
 * statement, and its header records the English file's sha256 (`blueprint-zh.test.ts`
 * fails when the English changes and the Chinese does not). Chinese pages render
 * statements from here, as English pages render them from the English file, so a
 * Chinese page holds no statement text of its own either.
 *
 * Its notes word the label in Chinese (`ZH_LABEL` in zh/guards.ts), and keep the sources in
 * their original language; the caption rules below are the English ones in that
 * wording. DRAFT until the owner's writing pass rules on it.
 */
import { ZH_LABEL, ZH_LABEL_TAIL, ZH_NOTE_FIELD } from "./zh/guards";

export const BLUEPRINT_ZH_PATH = "docs/blueprint.zh.md";

const LOADED_ZH = loadBlueprint(BLUEPRINT_ZH_PATH);
export const BP_STATEMENTS_ZH: readonly BpStatement[] = LOADED_ZH.statements;

/** One Chinese statement, or a loud failure, as `bp`. */
export function bpZh(id: BpId): BpStatement {
  const s = BP_STATEMENTS_ZH.find((x) => x.id === id);
  if (!s) throw new Error(`${id} is not in ${BLUEPRINT_ZH_PATH}`);
  return s;
}

export const BP_ARG_ZH = BP_ARG_ORDER.map((id) => bpZh(id));
export const BP_ARG_DEFENCE_ZH = (["BP-ARG-OBJECTION", "BP-ARG-REPLY", "BP-ARG-OPEN"] as const).map((id) => bpZh(id));

const LABEL_ZH = ZH_LABEL;

export function labelTextZh(s: BpStatement): string | null {
  return LABEL_ZH.exec(s.note)?.[0] ?? null;
}

/** `publicCitation`, for a Chinese note: its published lines, less the field name and the label. */
export function publicCitationZh(s: BpStatement): string | null {
  const bare = (publicSource(s) ?? "")
    .replace(ZH_NOTE_FIELD, "")
    .replace(new RegExp(`^${LABEL_ZH.source}${ZH_LABEL_TAIL}`), "")
    .trim();
  return bare || null;
}

/** `caption`, for a Chinese statement. */
export function captionZh(s: BpStatement): string | null {
  const label = labelTextZh(s);
  const citation = publicCitationZh(s);
  if (!citation) return label;
  if (!label || citation.includes(label)) return citation;
  return `${label} · ${citation}`;
}

/** The statement in `locale`, for components that render either. */
export function bpIn(locale: "en" | "zh", id: BpId): { text: string; caption: string | null; label: string | null } {
  if (locale === "zh") {
    const s = bpZh(id);
    return { text: s.text, caption: captionZh(s), label: labelTextZh(s) };
  }
  const s = bp(id);
  return { text: s.text, caption: caption(s), label: s.labelText };
}
