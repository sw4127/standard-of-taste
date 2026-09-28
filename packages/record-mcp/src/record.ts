/**
 * THE PROJECT RECORD, READ FROM ITS FILES (2026-09-28, AI tooling brief Part 4).
 *
 * The four tools the record server exposes, as plain functions. The server
 * (`server.ts`) only wires them to the protocol, so everything here is testable
 * without a client.
 *
 * THE JOB THIS REPLACES: sessions reading files and quoting from memory, which is
 * how the blueprint's copies drifted until two of them made different claims. A
 * tool that returns the file's own text cannot paraphrase.
 *
 * NOTHING IS PARSED A SECOND WAY. The blueprint is read by `parseBlueprint`, the
 * same function the site renders from, imported from `blueprint-parse.ts`, which
 * runs nothing on import. A second parser here would be one more copy free to drift.
 *
 * EVERY CALL READS THE FILE. Nothing is cached or imported as data, so an edit to
 * the record during a session reaches the next call. The falsified registry is a
 * TypeScript module and it too is read as text: importing it froze it at server
 * start and handed back a re-serialised object instead of the file's words
 * (red-team subagent, 2026-09-28).
 *
 * READ-ONLY, NO NETWORK, NOTHING OUTSIDE THE REPOSITORY. Every file read goes
 * through `readRecord`, which refuses an absolute path, a `..` escape and a
 * symlink that resolves outside the root. The one subprocess is `git log`, read
 * only, for the suite count the slice loop records in commit messages. The network
 * is refused at run time by `no-network.mjs`, preloaded wherever the server runs.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, realpathSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { parseBlueprint, BLUEPRINT_PATH } from "../../../src/content/blueprint-parse.ts";

export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

/** A repository-relative path, refused if it would leave the root by any route. */
export function inside(root: string, rel: string): string {
  if (isAbsolute(rel)) throw new Error(`refused: ${rel} is absolute; the record server reads repository paths only`);
  const full = resolve(root, rel);
  const back = relative(root, full);
  if (back === ".." || back.startsWith(".." + sep) || isAbsolute(back)) throw new Error(`refused: ${rel} is outside the repository`);
  // A symlink inside the tree can point anywhere; resolve it before trusting it.
  const real = realpathSync(full);
  const realRoot = realpathSync(root);
  if (real !== realRoot && !real.startsWith(realRoot + sep)) throw new Error(`refused: ${rel} resolves outside the repository`);
  return real;
}

export function readRecord(root: string, rel: string): string {
  return readFileSync(inside(root, rel), "utf8");
}

/* ------------------------------------------------------------------ blueprint */

export interface BlueprintResult {
  id: string;
  text: string;
  note: string;
  file: string;
}

/** One statement, verbatim, or a loud failure naming the IDs that exist. */
export function blueprint(root: string, id: string): BlueprintResult {
  const { statements } = parseBlueprint(readRecord(root, BLUEPRINT_PATH));
  const s = statements.find((x) => x.id === id.trim().toUpperCase());
  if (!s) throw new Error(`${id} is not in ${BLUEPRINT_PATH}. IDs: ${statements.map((x) => x.id).join(", ")}`);
  return { id: s.id, text: s.text, note: s.note, file: BLUEPRINT_PATH };
}

/* -------------------------------------------------------------------- rulings */

export interface Ruling {
  ids: string[];
  date: string | null;
  text: string;
  file: string;
  line: number;
}

const RULING_ID = /\b(?:RT-[A-Z]{0,2}\d*[a-z]?|BA-\d+|PM-\d+[a-z]?)\b/g;
const DATE = /\b(20\d\d-\d\d-\d\d)\b/;

/**
 * Whether a record's ID answers a query. Exact, except that a query with no option
 * letter also finds the ruling's lettered forms: "RT-59" finds "RT-59a", because
 * CLAUDE.md cites most rulings with the option chosen (red-team subagent). "RT-1"
 * still does not find "RT-10".
 */
export function answers(id: string, query: string): boolean {
  if (id.toUpperCase() === query.toUpperCase()) return true;
  return /\d$/.test(query) && id.length === query.length + 1 && id.toUpperCase().startsWith(query.toUpperCase()) && /[a-z]$/.test(id);
}

/**
 * THE RECORDS OF A RULINGS FILE, EACH ITS OWN VERBATIM LINES.
 *
 * The files use three shapes: a table row (`| **RT-G** | ... |`), a bullet or
 * paragraph (`- **RT-1: (a).** ...`, continued on wrapped lines), and a heading
 * with the paragraphs under it. A record is a table row on its own, or a run of
 * non-blank lines. Its text is those lines joined by "\n", exactly as in the file.
 */
export function records(source: string): { text: string; line: number }[] {
  const lines = source.split(/\r?\n/);
  const out: { text: string; line: number }[] = [];
  let buf: string[] = [];
  let start = 0;
  const flush = () => {
    if (buf.length) out.push({ text: buf.join("\n"), line: start + 1 });
    buf = [];
  };
  lines.forEach((l, i) => {
    const row = l.startsWith("|");
    const bullet = /^\s*[-*] /.test(l) || /^#{1,6} /.test(l);
    if (l.trim() === "" || row || bullet) flush();
    if (l.trim() === "") return;
    if (row) {
      out.push({ text: l, line: i + 1 });
      return;
    }
    if (!buf.length) start = i;
    buf.push(l);
  });
  flush();
  return out;
}

export const RULING_FILES = (root: string) => [
  ...readdirSync(inside(root, "docs"))
    .filter((f) => /^rt-answers-.*\.md$/.test(f))
    .sort()
    .map((f) => `docs/${f}`),
  "CLAUDE.md",
];

/**
 * Rulings matching the query: by ID when the query is one (exact, so "RT-1" is
 * not RT-10), otherwise by case-insensitive text. Newest file first. The date is
 * the first date in the record, else the date in the file name, else null.
 */
export function rulings(root: string, query: string, limit = 12): Ruling[] {
  const q = query.trim();
  if (!q) throw new Error("rulings needs a query: a ruling ID (RT-4, BA-10, RT-Z10) or words to search for");
  const byId = /^(?:RT-[A-Z]{0,2}\d*[a-z]?|BA-\d+|PM-\d+[a-z]?)$/i.test(q);
  const hits: Ruling[] = [];
  for (const file of RULING_FILES(root).reverse()) {
    const fileDate = DATE.exec(file)?.[1] ?? null;
    for (const r of records(readRecord(root, file))) {
      const ids = [...new Set(r.text.match(RULING_ID) ?? [])];
      const match = byId ? ids.some((id) => answers(id, q)) : r.text.toLowerCase().includes(q.toLowerCase());
      if (!match) continue;
      hits.push({ ids, date: DATE.exec(r.text)?.[1] ?? fileDate, text: r.text, file, line: r.line });
    }
  }
  return hits.slice(0, limit);
}

/* ------------------------------------------------------------------ falsified */

export const FALSIFIED_PATH = "src/content/lab/falsified.ts";

export interface FalsifiedRecord {
  id: string;
  /** The entry's object literal, exactly as the file writes it. */
  text: string;
  file: string;
  line: number;
}

/**
 * The registry's entries as the file writes them. Each entry in `FALSIFIED` is an
 * object literal opening on a line that is exactly "  {" and closing on "  },",
 * with its `id` on a line of its own. A file that stops having that shape yields a
 * count the test compares with the module's own array, so the reader cannot quietly
 * lose entries.
 */
export function falsified(root: string, id?: string): FalsifiedRecord[] {
  const lines = readRecord(root, FALSIFIED_PATH).split(/\r?\n/);
  const from = lines.findIndex((l) => l.startsWith("export const FALSIFIED"));
  if (from < 0) throw new Error(`${FALSIFIED_PATH} no longer declares FALSIFIED`);
  const all: FalsifiedRecord[] = [];
  for (let i = from + 1; i < lines.length && lines[i] !== "];"; i++) {
    if (lines[i] !== "  {") continue;
    const start = i;
    while (i < lines.length && lines[i] !== "  }," && lines[i] !== "  }") i++;
    const block = lines.slice(start, i + 1);
    const entryId = block.map((l) => /^ {4}id: "([^"]+)",?$/.exec(l)?.[1]).find(Boolean);
    if (!entryId) throw new Error(`${FALSIFIED_PATH}:${start + 1}: an entry with no id line`);
    all.push({ id: entryId, text: block.join("\n"), file: FALSIFIED_PATH, line: start + 1 });
  }
  if (!id) return all;
  const hit = all.filter((e) => e.id === id.trim());
  if (!hit.length) throw new Error(`${id} is not in ${FALSIFIED_PATH}. IDs: ${all.map((e) => e.id).join(", ")}`);
  return hit;
}

/* --------------------------------------------------------------- suite status */

export interface SuiteStatus {
  tests: number;
  files: number | null;
  line: string;
  commit: string;
  date: string;
  refresh: string;
  freshClone: string;
}

/**
 * The last suite count recorded in a commit message. The slice loop writes a
 * `Suite: <n> green, <m> files` line into every code commit; this reads the newest
 * one, with its commit, so the answer says where it came from and how old it is.
 */
export function suiteStatus(root: string): SuiteStatus {
  // No inherited GIT_* variable may point this at another repository: under
  // `git push` the pre-push hook exports GIT_DIR, and a test in this suite once
  // re-initialised the real repository through exactly that (2cd8506).
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith("GIT_"))) as NodeJS.ProcessEnv;
  const log = execFileSync("git", ["log", "-n", "200", "--format=%x1e%h%x1f%cs%x1f%B"], {
    cwd: inside(root, "."),
    encoding: "utf8",
    env,
  });
  for (const entry of log.split("\x1e").slice(1)) {
    const [commit, date, body] = entry.split("\x1f");
    const line = body.split(/\r?\n/).find((l) => /^Suite: [\d,]+ green/.test(l));
    if (!line) continue;
    const m = /^Suite: ([\d,]+) green(?:, (\d+) files)?/.exec(line)!;
    return {
      tests: Number(m[1].replace(/,/g, "")),
      files: m[2] ? Number(m[2]) : null,
      line,
      commit,
      date,
      refresh: "npm test",
      freshClone: "npm run test:fresh",
    };
  }
  throw new Error("no commit in the last 200 records a 'Suite: <n> green' line; run npm test");
}

