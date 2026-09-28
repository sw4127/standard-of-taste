/**
 * ONE SUBAGENT, AND IT CANNOT EDIT (2026-09-27, AI tooling brief Part 3).
 *
 * `.claude/agents/red-team-reviewer.md` reviews a staged diff and returns three
 * findings; the main session fixes them. Its value depends on one property: it
 * never edits, so a finding cannot quietly become a fix nobody reviewed. That
 * property lives in two places, and this file holds both:
 *
 *   - its tool list is exactly Read, Grep and Glob: no Edit, no Write, no Bash.
 *     Claude Code enforces the list, which is why it carries the guarantee;
 *   - NOT the frontmatter hook. The first version had Bash behind
 *     `.claude/hooks/read-only-bash.py` (the latch's allowlist). Probed on
 *     2026-09-28, the reviewer wrote a file through Bash: the hook did not deny
 *     it (whether it ran at all, that probe cannot tell). The hook stays attached against Bash returning, and the
 *     agent file says it is unproven; this test pins that Bash is absent.
 *
 * It also holds the directory to that one agent. Three generic definitions
 * (debugger, implementation-agent, performance-optimizer) sat here unused, two
 * of them with Edit, and were archived out of the repository on 2026-09-27.
 * Serves BA-12 · N2 (nothing here for show).
 */
import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const AGENTS = join(repoRoot, ".claude", "agents");
const agent = () => readFileSync(join(AGENTS, "red-team-reviewer.md"), "utf8");
const frontmatter = () => /^---\r?\n([\s\S]*?)\r?\n---/.exec(agent())?.[1] ?? "";

describe("the red-team reviewer subagent", () => {
  it("is the only agent definition", () => {
    expect(readdirSync(AGENTS).sort()).toEqual(["red-team-reviewer.md"]);
    expect(existsSync(join(repoRoot, ".claude", "commands")), "the unused commands directory is back").toBe(false);
  });

  it("is named for its file and says what it returns", () => {
    expect(/^name: (.+)$/m.exec(frontmatter())?.[1]?.trim()).toBe("red-team-reviewer");
    expect(/^description: (.+)$/m.exec(frontmatter())?.[1]).toMatch(/read-only/i);
    expect(agent()).toMatch(/Exactly three findings/);
  });

  it("has exactly Read, Grep and Glob: nothing that edits or runs a shell", () => {
    const tools = (/^tools: (.+)$/m.exec(frontmatter())?.[1] ?? "").split(",").map((t) => t.trim());
    expect(tools.sort()).toEqual(["Glob", "Grep", "Read"]);
  });

  it("reads the change from the file the caller writes, and says why it has no shell", () => {
    expect(agent()).toContain(".git/red-team.diff");
    expect(agent()).toMatch(/Why there is no Bash \(measured 2026-09-28\)/);
  });

  it("keeps the read-only guard attached in case Bash returns", () => {
    const fm = frontmatter();
    expect(fm).toMatch(/PreToolUse:\s*\n\s*- matcher: "Bash"/);
    expect(fm).toContain('command: python "$CLAUDE_PROJECT_DIR/.claude/hooks/read-only-bash.py"');
    // The guard imports the latch's segmenter, and keeps its own narrower list.
    const guard = readFileSync(join(repoRoot, ".claude/hooks/read-only-bash.py"), "utf8");
    expect(guard).toMatch(/reviewer_read_only\(cmd, latch\(\)\)/);
    expect(guard).toContain("sys.dont_write_bytecode = True");
  });
});
