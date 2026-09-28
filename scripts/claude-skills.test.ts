/**
 * THE CLAUDE CODE SKILLS QUOTE THEIR RULES; THEY DO NOT RESTATE THEM
 * (2026-09-27, AI tooling brief Part 2).
 *
 * Each skill in `.claude/skills/` packages a procedure the sessions already
 * follow from prose: the red-team step, the session close, the blueprint check.
 * A skill that paraphrased its rule would be the tenth copy of a rule this
 * repository already watched drift nine times (the blueprint audit). So each
 * skill quotes, and this file holds every quote to its source:
 *
 *   - every blockquote in a SKILL.md is preceded by `<!-- source: path -->`;
 *   - the quote, whitespace-collapsed, is in that file, whitespace-collapsed,
 *     with a TypeScript comment's leading `*` stripped from each source line;
 *   - each skill quotes every source the brief names for it, so a skill cannot
 *     keep its frontmatter and drop the rule it exists to carry;
 *   - the frontmatter's `name` is the directory name, which is how Claude Code
 *     finds it.
 *
 * WHAT IT CANNOT CHECK: that the procedure around the quotes is sound. That is
 * judgment, reviewed like any other text. Serves BA-12 · N3.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS = join(repoRoot, ".claude", "skills");

/** The sources each skill must quote at least once (the brief's table). */
const REQUIRED: Record<string, string[]> = {
  "red-team-slice": ["CLAUDE.md", "docs/slice-protocol.md", "docs/redteam-protocol.md"],
  "close-session": ["CLAUDE.md", "docs/slice-protocol.md"],
  "blueprint-check": ["docs/blueprint.md", "src/content/blueprint.ts"],
};

const collapse = (s: string) => s.replace(/\s+/g, " ").trim();
const sourceText = (rel: string) =>
  collapse(
    readFileSync(join(repoRoot, rel), "utf8")
      .split(/\r?\n/)
      .map((l) => (/\.m?[jt]s$/.test(rel) ? l.replace(/^\s*(\*|\/\/)\s?/, "") : l))
      .join("\n"),
  );

interface Quote {
  source: string | null;
  text: string;
  line: number;
}

/** Every blockquote in a SKILL.md, with the source comment directly above it (or null). */
function quotes(md: string): Quote[] {
  const lines = md.split(/\r?\n/);
  const out: Quote[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith(">")) continue;
    const start = i;
    const body: string[] = [];
    while (i < lines.length && lines[i].startsWith(">")) body.push(lines[i++].replace(/^>\s?/, ""));
    const above = lines[start - 1] ?? "";
    const m = /^<!-- source: (\S+) -->$/.exec(above.trim());
    out.push({ source: m ? m[1] : null, text: collapse(body.join(" ")), line: start + 1 });
  }
  return out;
}

const skillDirs = () => (existsSync(SKILLS) ? readdirSync(SKILLS).filter((d) => existsSync(join(SKILLS, d, "SKILL.md"))) : []);

describe("Claude Code skills", () => {
  it("are exactly the three the brief names", () => {
    expect(skillDirs().sort()).toEqual(Object.keys(REQUIRED).sort());
  });

  for (const name of Object.keys(REQUIRED)) {
    describe(name, () => {
      const md = () => readFileSync(join(SKILLS, name, "SKILL.md"), "utf8");

      it("has frontmatter whose name is its directory and a real description", () => {
        const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(md())?.[1] ?? "";
        expect(/^name: (.+)$/m.exec(fm)?.[1]?.trim()).toBe(name);
        expect((/^description: (.+)$/m.exec(fm)?.[1] ?? "").length).toBeGreaterThan(80);
      });

      it("sources every quote and quotes each source verbatim", () => {
        const qs = quotes(md());
        expect(qs.length).toBeGreaterThanOrEqual(3);
        for (const q of qs) {
          expect(q.source, `SKILL.md line ${q.line} quotes with no <!-- source: --> above it`).not.toBeNull();
          // A fragment carries no rule: "the" is verbatim in every source there is.
          expect(q.text.length, `line ${q.line} is too short to be a rule`).toBeGreaterThanOrEqual(40);
          expect(existsSync(join(repoRoot, q.source!)), `${q.source} does not exist`).toBe(true);
          expect(sourceText(q.source!), `line ${q.line} is not verbatim in ${q.source}: "${q.text.slice(0, 80)}…"`).toContain(q.text);
        }
      });

      it("names no repository path that does not exist", () => {
        // A skill pointing at a file that is not there sends a session looking for it.
        const paths = [...md().matchAll(/`((?:\.claude|docs|src|scripts|packages)\/[^`<>*\s]+)`/g)].map((m) => m[1]);
        expect(paths.length).toBeGreaterThan(0);
        for (const p of paths) expect(existsSync(join(repoRoot, p)), `${name} names ${p}, which does not exist`).toBe(true);
      });

      it("quotes every source the brief names for it", () => {
        const cited = new Set(quotes(md()).map((q) => q.source));
        for (const src of REQUIRED[name]) expect(cited, `${name} never quotes ${src}`).toContain(src);
      });
    });
  }

  it("the quote reader finds an unsourced quote (its own control)", () => {
    const qs = quotes("text\n> a quote with nothing above\n");
    expect(qs).toEqual([{ source: null, text: "a quote with nothing above", line: 2 }]);
  });
});
