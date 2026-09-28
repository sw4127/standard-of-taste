/**
 * THE CLAUDE CODE HOOKS, UNDER THE SUITE (2026-09-27, AI tooling brief Part 1).
 *
 * Until today the slice latch and the context tracker existed on one machine and
 * nowhere in the record: `.claude/hooks/` was untracked and their wiring lived in
 * the git-ignored `settings.local.json`. A guard that exists only on one machine
 * cannot be reviewed, cannot be cloned, and stops existing the day that machine
 * does. They are tracked now, and this file holds three things in place:
 *
 *   1. the hooks' own regression suite (`test_hook_encoding.py`) runs and passes,
 *      so `npm test` and the pre-push gate run it, not only a person remembering;
 *   2. the tracked `.claude/settings.json` wires exactly the tracked hooks, by a
 *      path that does not depend on the shell's working directory, and carries no
 *      permissions (those are one person's grants and stay local);
 *   3. nothing tracked under `.claude/` names this machine. The repository is
 *      public, and the first draft of the encoding test carried an @-path into
 *      the owner's home directory.
 *
 * PYTHON IS REQUIRED, NOT OPTIONAL. The hooks are Python, so a machine without it
 * has no hooks; skipping here would report green for a guard that cannot run.
 * Serves BA-12 (the agent workflow is in the repository) · N3.
 */
import { describe, expect, it } from "vitest";
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { homedir, userInfo } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel: string) => readFileSync(join(repoRoot, rel), "utf8");
const tracked = (prefix: string) =>
  execFileSync("git", ["ls-files", "--", prefix], { cwd: repoRoot, encoding: "utf8" })
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

function python(): string {
  for (const exe of ["python", "python3"]) {
    const probe = spawnSync(exe, ["--version"], { encoding: "utf8" });
    if (probe.status === 0) return exe;
  }
  throw new Error("No python on PATH: the Claude Code hooks are Python and cannot run here.");
}

type Hook = { type: string; command: string };
type Settings = { hooks?: Record<string, { matcher: string; hooks: Hook[] }[]>; permissions?: unknown };
const settings = () => JSON.parse(read(".claude/settings.json")) as Settings;
const commands = () =>
  Object.values(settings().hooks ?? {}).flatMap((groups) => groups.flatMap((g) => g.hooks.map((h) => h.command)));

describe("Claude Code hooks", () => {
  it("their own regression suite passes", () => {
    const run = spawnSync(python(), [".claude/hooks/test_hook_encoding.py"], {
      cwd: repoRoot,
      encoding: "utf8",
      timeout: 60_000,
    });
    const out = (run.stdout ?? "") + (run.stderr ?? "");
    expect(out, "the hook suite printed no FAIL lines").not.toMatch(/^FAIL /m);
    expect(out).toMatch(/^0 failed$/m);
    expect(run.status, out.slice(-600)).toBe(0);
    // Fifteen cases today. A suite that silently shrank to one would still say
    // "0 failed", so the count of PASS lines is held as a floor.
    expect(out.match(/^PASS /gm)?.length ?? 0).toBeGreaterThanOrEqual(15);
  }, 60_000);

  it("settings.json wires only tracked hooks, from the project root, and grants nothing", () => {
    const files = tracked(".claude/hooks/");
    const cmds = commands();
    expect(cmds.length).toBeGreaterThan(0);
    for (const cmd of cmds) {
      const m = cmd.match(/^python "\$CLAUDE_PROJECT_DIR\/(\.claude\/hooks\/[\w.-]+\.py)"$/);
      expect(m, `not a project-rooted python hook: ${cmd}`).not.toBeNull();
      expect(files, `${m![1]} is wired but not tracked`).toContain(m![1]);
    }
    // Every tracked hook script is wired by settings.json. Two named exceptions: the
    // test file, and the reviewer's read-only guard, which is ATTACHED through the
    // subagent's frontmatter and was measured NOT to fire there (2026-09-28). Counting
    // frontmatter as wiring would call that hook running; the exception says it is not.
    const ATTACHED_NOT_PROVEN = [".claude/hooks/read-only-bash.py"];
    const wired = new Set(cmds.map((c) => c.match(/(\.claude\/hooks\/[\w.-]+\.py)/)![1]));
    for (const f of files.filter((f) => f.endsWith(".py") && !f.includes("/test_"))) {
      if (ATTACHED_NOT_PROVEN.includes(f)) continue;
      expect(wired, `${f} is tracked but nothing runs it`).toContain(f);
    }
    for (const f of ATTACHED_NOT_PROVEN) {
      expect(read(".claude/agents/red-team-reviewer.md"), `${f} is excepted as attached, but nothing attaches it`).toContain(f);
      expect(read(f), `${f} is excepted as unproven, and must say so itself`).toContain("MEASURED NOT TO FIRE");
    }
    expect(settings().permissions, "permissions belong in settings.local.json").toBeUndefined();
  });

  it("the latch sees every tool that can write a file", () => {
    const pre = settings().hooks?.PreToolUse ?? [];
    const matcher = pre.find((g) => g.hooks.some((h) => h.command.includes("slice-latch.py")))?.matcher ?? "";
    for (const tool of ["Edit", "Write", "NotebookEdit", "MultiEdit", "Bash"]) {
      expect(matcher.split("|"), `PreToolUse no longer shows ${tool} to the latch`).toContain(tool);
    }
    const post = settings().hooks?.PostToolUse ?? [];
    expect(post.some((g) => g.matcher === "Bash" && g.hooks.some((h) => h.command.includes("slice-latch.py")))).toBe(true);
  });

  it("nothing tracked under .claude/ names this machine", () => {
    // Generic home-directory shapes, plus WHOEVER RUNS THIS: their login name and
    // home directory, read at run time rather than typed here, so the guard does
    // not itself publish the name it exists to keep out.
    const generic = /[A-Za-z]:\\\\?Users\\\\?|\/Users\/[a-z]|\/home\/[a-z]|AppData/;
    const local = [userInfo().username, homedir()].filter((s) => s.length >= 3).map((s) => s.toLowerCase());
    for (const f of tracked(".claude/")) {
      const text = read(f);
      const hit = text.match(generic)?.[0] ?? local.find((s) => text.toLowerCase().includes(s));
      expect(hit, `${f} names a machine path or login: ${hit}`).toBeUndefined();
    }
  });
});
