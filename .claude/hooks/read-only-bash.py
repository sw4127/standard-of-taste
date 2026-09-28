#!/usr/bin/env python3
"""
READ-ONLY BASH FOR THE RED-TEAM REVIEWER (2026-09-27, AI tooling brief Part 3).

The reviewer subagent (`.claude/agents/red-team-reviewer.md`) must never edit:
the main session fixes what it finds. Leaving Edit and Write out of its tool
list is half of that. Bash is the other half, because a shell writes files as
easily as it reads them, and a sentence in a prompt asking it not to is a rule
that holds until the day it does not.

THE SPLITTING IS THE LATCH'S; THE ALLOWLIST IS NARROWER, ON PURPOSE. The quote-
aware segmenter and the discard-redirect handling are imported from
`slice-latch.py`, which has been corrected four times against real transcripts.
The latch's ALLOWED list is not reused: it is "verification plus pushing what
was just committed", so it passes `git push` (a production deploy here),
`git branch -D`, `npx eslint --fix` and `sort -o`. The reviewer's red-team pass
fed those to the first version and every one was allowed (2026-09-28). A reviewer
needs to read a diff and some files; the list below is that and nothing else.

Command substitution, backticks and newlines are refused outright: the segmenter
does not look inside `$(...)`, and does not split on a newline.

Exit 2 denies, with the reason on stderr. Anything that is not a Bash call
passes: the reviewer has no other tool that writes.

MEASURED NOT TO DENY (2026-09-28). Attached through the subagent's frontmatter,
this hook did not deny a write: the reviewer, asked to probe it, wrote a file
through Bash. Whether the hook never ran, or ran and failed (a non-blocking
error lets the call through), that probe cannot tell; a frontmatter hook whose
whole command is `exit 2` would. So the reviewer no longer has Bash at all, and
its tool list is what makes it read-only. This file stays, tested, and stays
attached so that restoring Bash to the reviewer cannot happen without its guard;
nothing relies on it until a probe shows it denying.
"""
import sys

# A guard that writes a file every time it runs is not read-only, and the cache it
# wrote held this machine's absolute path in a public repository (2026-09-28).
sys.dont_write_bytecode = True

import importlib.util  # noqa: E402
import json  # noqa: E402
import os  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))

# What a reviewer reads with. No push, no branch, no fixer, no sort -o, no sed or
# awk (awk can write through system()), no build, no network.
REVIEWER_ALLOWED = (
    "git diff", "git show", "git log", "git status", "git rev-parse", "git blame",
    "cat ", "head ", "tail ", "grep ", "rg ", "ls", "wc ", "diff ", "stat ",
    "pwd", "basename", "dirname",
)

# The segmenter does not see inside these, so they are refused before it runs.
NEVER = ("$(", "`", "\n", "\r")


def latch():
    spec = importlib.util.spec_from_file_location("slice_latch", os.path.join(HERE, "slice-latch.py"))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def reviewer_read_only(cmd, module):
    """True only if every segment is a reviewer reader and nothing redirects or substitutes."""
    if any(token in cmd for token in NEVER):
        return False
    normalised = cmd
    for token in module.DISCARD_REDIRECTS:
        normalised = normalised.replace(token, " ")
    parts = module.segments(normalised)
    if not parts:
        return False
    for part in parts:
        if ">" in part or "<<" in part:
            return False
        if not part.startswith(REVIEWER_ALLOWED):
            return False
    return True


def main():
    try:
        sys.stderr.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass
    try:
        event = json.loads(sys.stdin.buffer.read().decode("utf-8-sig"))
    except ValueError as exc:
        # Unreadable is denied: this guard fails closed, like the latch.
        sys.stderr.write("read-only-bash: the tool call could not be read (" + str(exc)[:120] + "); denied.\n")
        sys.exit(2)
    if event.get("tool_name") != "Bash":
        sys.exit(0)
    cmd = (event.get("tool_input", {}) or {}).get("command", "")
    if reviewer_read_only(cmd, latch()):
        sys.exit(0)
    sys.stderr.write(
        "DENIED: the red-team reviewer is read-only, and this Bash command is not on its "
        "reading list in .claude/hooks/read-only-bash.py. Report the finding; the main "
        "session makes the fix.\n"
    )
    sys.exit(2)


if __name__ == "__main__":
    main()
