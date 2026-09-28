"""
REGRESSION: A PROMPT CONTAINING CHINESE LEFT THE SLICE LATCH ARMED (2026-09-23).

Run:  python .claude/hooks/test_hook_encoding.py        (exit 0 = all pass)

WHAT HAPPENED, from the session transcript (7e752a51, 2026-09-23T04:25:41Z).
The PM replied to a stopped slice with a message quoting a Chinese sentence.
Claude Code pipes the hook payload as UTF-8; Python on this machine reads stdin
in the Windows locale encoding (cp936 / GBK). The Chinese bytes decoded to
garbage, `json.load` raised, and `slice-latch.py` caught it and exited 0 in
silence -- before `drop(latch)`. No `hook_success` for the latch was recorded
for that prompt, while every other prompt in the transcript has one. The latch
stayed armed, and the next Write was denied as "the PM has not replied since",
directly after the PM had replied.

`context-tracker.py` failed on the same payload (JSONDecodeError) and on every
other prompt too (reading the UTF-8 transcript as GBK) -- non-blocking errors
nobody saw.

Each case runs the real hook as a subprocess, with UTF-8 bytes on stdin exactly
as Claude Code sends them, and TMP/TEMP pointed at a fresh directory so no real
session's state is touched.
"""
import json
import os
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
LATCH_HOOK = os.path.join(HERE, "slice-latch.py")
TRACKER_HOOK = os.path.join(HERE, "context-tracker.py")
SESSION = "regression-encoding-0001"

# NO INHERITED GIT ENVIRONMENT (2026-09-28). This suite runs inside `npm test`, and
# the pre-push hook runs `npm test` with GIT_DIR (and friends) exported by git. Every
# `git` this file spawns, directly in make_repo or through the hooks under test,
# then targeted the REAL repository instead of its throwaway one: `git init` in a
# temp directory re-initialised the real repository as bare (core.bare = true),
# breaking every checkout, and the push was blocked. Dropped here, once, before any
# subprocess starts, so no case can reach the repository that is running it.
for _key in [k for k in os.environ if k.startswith("GIT_")]:
    del os.environ[_key]

# THE SHAPE OF THE PM'S REPLY, NOT ITS TEXT. The observed prompt carried an
# @-attachment path from the owner's machine and a quoted sentence from a private
# document; this repository is public, so neither is reproduced. What made it a
# specimen is kept: an @-attachment, a ruling, and Chinese whose UTF-8 bytes do not
# survive a GBK decode (checked by case_specimen_is_a_specimen, so a replacement
# that happened to decode cleanly would fail loudly rather than test nothing).
REAL_PROMPT = (
    '@"docs/example-attachment.md" '
    "RT-2: a, continue to S9. Also, a note I was handed: "
    '"请继续下一步，并把这段中文引用原样保留，不要改写。" which is wrong.'
)


def run(hook, payload, tmp, raw=None):
    env = dict(os.environ, TMP=tmp, TEMP=tmp, TMPDIR=tmp)
    # FORCE THE GBK STDIN THIS MACHINE HAS, rather than inherit whatever the
    # runner's locale is. On a UTF-8 machine the unfixed hook would read the
    # payload correctly and every case here would pass having tested nothing.
    env["PYTHONIOENCODING"] = "gbk"
    env.pop("PYTHONUTF8", None)
    data = raw if raw is not None else json.dumps(payload, ensure_ascii=False).encode("utf-8")
    return subprocess.run(
        [sys.executable, "-X", "utf8=0", hook], input=data, capture_output=True, env=env, cwd=REPO, timeout=30
    )


def latch_path(tmp):
    return os.path.join(tmp, "claude-slice-latch-" + SESSION)


def advance_path(tmp):
    return os.path.join(tmp, "claude-slice-advance-" + SESSION)


def prompt_event(text):
    return {
        "hook_event_name": "UserPromptSubmit",
        "session_id": SESSION,
        "cwd": REPO,
        "prompt": text,
        "transcript_path": "",
    }


FAILURES = []


def check(name, ok, detail=""):
    print(("PASS  " if ok else "FAIL  ") + name + ("" if ok else "  -- " + detail))
    if not ok:
        FAILURES.append(name)


def case_specimen_is_a_specimen():
    """The prompt must actually break GBK decoding, or the cases below prove nothing."""
    try:
        json.loads(json.dumps(prompt_event(REAL_PROMPT), ensure_ascii=False).encode("utf-8").decode("gbk"))
        broken = False
    except ValueError:
        broken = True
    check("the specimen prompt really is unreadable when decoded as GBK", broken)


def case_unreadable_reply_still_clears():
    """Recovered from the raw bytes: the PM speaking clears the latch whatever the text."""
    tmp = tempfile.mkdtemp(prefix="latch-")
    with open(latch_path(tmp), "w", encoding="utf-8") as f:
        f.write(SESSION)
    raw = ('{"hook_event_name": "UserPromptSubmit", "session_id": "%s", "prompt": "\xff' % SESSION).encode("latin-1")
    done = run(LATCH_HOOK, None, tmp, raw=raw)
    check(
        "an unparseable PM reply still clears the latch, and says so",
        not os.path.exists(latch_path(tmp)) and done.returncode == 1,
        "latch %s, exit %d" % (os.path.exists(latch_path(tmp)), done.returncode),
    )


def case_unreadable_write_denied_while_armed():
    tmp = tempfile.mkdtemp(prefix="latch-")
    with open(latch_path(tmp), "w", encoding="utf-8") as f:
        f.write(SESSION)
    raw = ('{"hook_event_name": "PreToolUse", "session_id": "%s", "tool_name": "Write", "x": "\xff' % SESSION).encode("latin-1")
    done = run(LATCH_HOOK, None, tmp, raw=raw)
    check("an unparseable tool call while armed is denied, not let through", done.returncode == 2, "exit %d" % done.returncode)


def case_real_sequence():
    """The observed sequence: armed latch, then the PM's Chinese-bearing reply."""
    tmp = tempfile.mkdtemp(prefix="latch-")
    with open(latch_path(tmp), "w", encoding="utf-8") as f:
        f.write(SESSION)
    done = run(LATCH_HOOK, prompt_event(REAL_PROMPT), tmp)
    check(
        "the PM's reply (Chinese + @-attachment) clears an armed latch",
        not os.path.exists(latch_path(tmp)),
        "latch still armed; exit %d; stderr %r" % (done.returncode, done.stderr[-200:]),
    )


def case_ascii_control():
    tmp = tempfile.mkdtemp(prefix="latch-")
    with open(latch_path(tmp), "w", encoding="utf-8") as f:
        f.write(SESSION)
    run(LATCH_HOOK, prompt_event("RT-2: a, continue to S9"), tmp)
    check("an ASCII reply clears an armed latch (control)", not os.path.exists(latch_path(tmp)))


def case_grant_in_chinese_prompt():
    tmp = tempfile.mkdtemp(prefix="latch-")
    run(LATCH_HOOK, prompt_event("auto-advance granted。继续。"), tmp)
    check("an auto-advance grant inside a Chinese prompt is honoured", os.path.exists(advance_path(tmp)))


def case_output_is_utf8():
    """The rule it prints contains an em dash; it reached the transcript as '��'."""
    tmp = tempfile.mkdtemp(prefix="latch-")
    done = run(LATCH_HOOK, prompt_event("hello"), tmp)
    try:
        text = done.stdout.decode("utf-8")
        ok = "\u2014" in text
    except UnicodeDecodeError:
        ok = False
    check("the printed rule reaches Claude Code as UTF-8 (em dash intact)", ok, repr(done.stdout[:80]))


def case_unreadable_payload_is_loud():
    """An unparseable payload must not exit 0 in silence -- that is what hid this bug."""
    tmp = tempfile.mkdtemp(prefix="latch-")
    done = run(LATCH_HOOK, None, tmp, raw=b'{"hook_event_name": "UserPromptSubmit", "prompt": ')
    check(
        "an unreadable payload fails loudly instead of exiting 0 in silence",
        done.returncode != 0 and b"LATCH" in done.stderr.upper(),
        "exit %d, stderr %r" % (done.returncode, done.stderr[:120]),
    )


def case_tracker_reads_utf8():
    tmp = tempfile.mkdtemp(prefix="tracker-")
    transcript = os.path.join(tmp, "t.jsonl")
    with open(transcript, "w", encoding="utf-8") as f:
        f.write(json.dumps({"type": "user", "message": {"content": REAL_PROMPT}}, ensure_ascii=False) + "\n")
    event = prompt_event(REAL_PROMPT)
    event["transcript_path"] = transcript
    done = run(TRACKER_HOOK, event, tmp)
    check(
        "context-tracker survives the same prompt and a UTF-8 transcript",
        done.returncode == 0,
        "exit %d, stderr %r" % (done.returncode, done.stderr[-160:]),
    )


def make_repo(state):
    """
    A throwaway git repository whose protocol file carries the standing heading
    in the given state ("IN FORCE", "SUSPENDED", or None for no heading), so a
    case never depends on what the real repository's switch says today.
    """
    root = tempfile.mkdtemp(prefix="repo-")
    os.makedirs(os.path.join(root, "docs"))
    with open(os.path.join(REPO, "docs", "slice-protocol.md"), encoding="utf-8") as f:
        text = f.read()
    lines = text.splitlines()
    out = []
    for line in lines:
        if line.startswith("## Standing auto-advance"):
            if state is None:
                continue
            line = "## Standing auto-advance (owner-approved 2026-09-07) — " + state
        out.append(line)
    with open(os.path.join(root, "docs", "slice-protocol.md"), "w", encoding="utf-8") as f:
        f.write(chr(10).join(out))
    run_git = lambda *a: subprocess.run(["git", *a], cwd=root, capture_output=True, check=True)
    run_git("init", "-q")
    run_git("-c", "user.email=t@t", "-c", "user.name=t", "commit", "-q", "--allow-empty", "-m", "x")
    return root


def commit_event(root):
    return {"hook_event_name": "PostToolUse", "session_id": SESSION, "cwd": root,
            "tool_name": "Bash", "tool_input": {"command": "git commit -m x"}}


def seed_head(tmp):
    """The previous HEAD, as the PostToolUse branch recorded it before the commit."""
    with open(os.path.join(tmp, "claude-slice-head-" + SESSION), "w", encoding="utf-8") as f:
        f.write("0" * 40)


def case_standing_in_force_does_not_stop():
    """RT-3 (2026-09-23) a: the owner's standing ruling is honoured without being repeated."""
    tmp, root = tempfile.mkdtemp(prefix="latch-"), make_repo("IN FORCE")
    seed_head(tmp)
    done = run(LATCH_HOOK, commit_event(root), tmp)
    check("standing auto-advance IN FORCE: a commit does not arm the latch",
          done.returncode == 0 and not os.path.exists(latch_path(tmp)),
          "exit %d, latch %s" % (done.returncode, os.path.exists(latch_path(tmp))))


def case_standing_suspended_stops():
    tmp, root = tempfile.mkdtemp(prefix="latch-"), make_repo("SUSPENDED")
    seed_head(tmp)
    done = run(LATCH_HOOK, commit_event(root), tmp)
    check("standing auto-advance SUSPENDED: a commit arms the latch",
          done.returncode == 2 and os.path.exists(latch_path(tmp)), "exit %d" % done.returncode)


def case_missing_switch_fails_safe():
    """Unreadable rule -> behave as before the ruling (stop), and say so loudly."""
    tmp, root = tempfile.mkdtemp(prefix="latch-"), make_repo(None)
    seed_head(tmp)
    done = run(LATCH_HOOK, commit_event(root), tmp)
    check("a missing standing heading arms the latch and says the guard is degraded",
          done.returncode == 2 and os.path.exists(latch_path(tmp)) and b"DEGRADED" in done.stderr,
          "exit %d, stderr %r" % (done.returncode, done.stderr[:120]))


def case_reminder_matches_the_switch():
    """The per-message reminder must not say STOP while the ruling says no stop."""
    ok = True
    for state, want in (("IN FORCE", "no stop between"), ("SUSPENDED", "STOP.")):
        tmp, root = tempfile.mkdtemp(prefix="latch-"), make_repo(state)
        with open(os.path.join(tmp, "claude-slice-seen-" + SESSION), "w") as f:
            f.write("1")
        ev = prompt_event("hello")
        ev["cwd"] = root
        out = run(LATCH_HOOK, ev, tmp).stdout.decode("utf-8", "replace")
        ok = ok and want in out
    check("the reminder says what the switch says (no STOP while IN FORCE)", ok)


def case_end_to_end():
    """
    The whole observed sequence through every branch the fix touched: a commit
    moves HEAD and arms the latch, a Write is denied, the PM's Chinese-bearing
    reply clears it, and the same Write then passes.
    """
    # Run where the standing switch is SUSPENDED: that is the state in which the
    # observed sequence armed (a per-message grant had lapsed), and since RT-3 a an
    # IN FORCE switch would correctly not arm at all.
    tmp, root = tempfile.mkdtemp(prefix="latch-"), make_repo("SUSPENDED")
    seed_head(tmp)
    armed = run(LATCH_HOOK, commit_event(root), tmp)
    write = {"hook_event_name": "PreToolUse", "session_id": SESSION, "cwd": root,
             "tool_name": "Write", "tool_input": {"file_path": "x"}}
    denied = run(LATCH_HOOK, write, tmp)
    run(LATCH_HOOK, prompt_event(REAL_PROMPT), tmp)
    allowed = run(LATCH_HOOK, write, tmp)
    check(
        "end to end: HEAD moves -> armed -> Write denied -> PM replies in Chinese -> Write allowed",
        armed.returncode == 2 and denied.returncode == 2 and allowed.returncode == 0,
        "arm %d, deny %d, after reply %d" % (armed.returncode, denied.returncode, allowed.returncode),
    )


def case_edit_denied_until_disarmed():
    """
    THE LATCH'S WHOLE JOB, ON A FILE EDIT (2026-09-27, brief Part 1).

    The end-to-end case proves a Write. This one proves the Edit tool, which is
    how most slices change a file, and the two Bash branches beside it: a
    read-only verifier passes while armed, a command that writes does not. Then
    the PM speaks and the same Edit goes through.
    """
    tmp = tempfile.mkdtemp(prefix="latch-")
    with open(latch_path(tmp), "w", encoding="utf-8") as f:
        f.write(SESSION)
    def tool(name, tool_input):
        return {"hook_event_name": "PreToolUse", "session_id": SESSION, "cwd": REPO,
                "tool_name": name, "tool_input": tool_input}
    edit = tool("Edit", {"file_path": "src/x.ts", "old_string": "a", "new_string": "b"})
    armed_edit = run(LATCH_HOOK, edit, tmp).returncode
    armed_read = run(LATCH_HOOK, tool("Bash", {"command": "git diff --stat 2>&1 | tail -3"}), tmp).returncode
    armed_write = run(LATCH_HOOK, tool("Bash", {"command": "echo x > src/x.ts"}), tmp).returncode
    run(LATCH_HOOK, prompt_event("RT-1: a"), tmp)
    disarmed_edit = run(LATCH_HOOK, edit, tmp).returncode
    check(
        "armed: Edit denied, read-only Bash allowed, writing Bash denied; disarmed: Edit allowed",
        (armed_edit, armed_read, armed_write, disarmed_edit) == (2, 0, 2, 0),
        "edit %d, read %d, write %d, after reply %d" % (armed_edit, armed_read, armed_write, disarmed_edit),
    )


READONLY_HOOK = os.path.join(HERE, "read-only-bash.py")


def case_reviewer_bash_is_read_only():
    """
    THE RED-TEAM REVIEWER CANNOT WRITE (2026-09-27, brief Part 3).

    read-only-bash.py guards the reviewer subagent's Bash with the latch's own
    allowlist. Reading a diff passes; a redirect, a commit, a sed -i and an
    unreadable payload are denied; a tool that is not Bash is not its business.
    """
    tmp = tempfile.mkdtemp(prefix="ro-")
    def bash(cmd):
        return run(READONLY_HOOK, {"hook_event_name": "PreToolUse", "tool_name": "Bash",
                                   "tool_input": {"command": cmd}}, tmp).returncode
    got = (
        bash("git diff --cached 2>&1 | head -200"),
        bash("git show HEAD --stat"),
        bash("echo planted > src/x.ts"),
        bash("git commit -qam fix"),
        bash("sed -i s/a/b/ src/x.ts"),
        run(READONLY_HOOK, None, tmp, raw=b'{"tool_name": "Bash", ').returncode,
        run(READONLY_HOOK, {"tool_name": "Read", "tool_input": {"file_path": "x"}}, tmp).returncode,
    )
    check(
        "reviewer Bash: reads pass; redirect, commit, sed -i and garbage denied; Read untouched",
        got == (0, 0, 2, 2, 2, 2, 0),
        repr(got),
    )
    # THE SIX THE REVIEWER'S OWN RED-TEAM GOT THROUGH THE FIRST VERSION (2026-09-28):
    # the latch's list passes a push and a branch delete, and the segmenter does not
    # look inside $(...) or split on a newline.
    bypasses = ["git push origin main", "git branch -D main", "npx eslint --fix src",
                "sort -o src/x.ts src/x.ts", "cat $(touch pwned)", "cat `touch pwned`",
                "cat a" + chr(10) + "touch pwned"]
    # Each specimen starts with a reader the list allows, so it is the substitution or
    # the newline that is refused. "echo $(...)" was denied for starting with echo and
    # survived the mutation that deleted the substitution rule.
    through = [c for c in bypasses if bash(c) != 2]
    check("reviewer Bash: push, branch -D, eslint --fix, sort -o, $(...), backticks and a newline are denied",
          not through, repr(through))
    cache = os.path.join(HERE, "__pycache__")
    check("the reviewer guard writes no bytecode cache (it held this machine's path)",
          not os.path.exists(cache), cache)


if __name__ == "__main__":
    case_specimen_is_a_specimen()
    case_end_to_end()
    case_edit_denied_until_disarmed()
    case_standing_in_force_does_not_stop()
    case_standing_suspended_stops()
    case_missing_switch_fails_safe()
    case_reminder_matches_the_switch()
    case_real_sequence()
    case_ascii_control()
    case_grant_in_chinese_prompt()
    case_output_is_utf8()
    case_unreadable_payload_is_loud()
    case_unreadable_reply_still_clears()
    case_unreadable_write_denied_while_armed()
    case_tracker_reads_utf8()
    case_reviewer_bash_is_read_only()
    print("\n%d failed" % len(FAILURES))
    sys.exit(1 if FAILURES else 0)
