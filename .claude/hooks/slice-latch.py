#!/usr/bin/env python3
"""
THE SLICE LATCH — a mechanical stop between slices (E18/S6, PM ruling RT-O5 a).

WHAT WENT WRONG THAT THIS EXISTS FOR. Session E18 shipped five slices in one
reply with the red-team batched at the end, which is the exact failure
docs/slice-protocol.md was written on 2026-07-19 to kill. The cause was not
judgment: the protocol amends CLAUDE.md's RT-1a loop from per-TASK to per-SLICE,
CLAUDE.md is in the system prompt for free, and the amendment lives in a file the
session was told to read and did not open. A rule that is optional to read is a
rule that eventually goes unread.

WHY A HOOK AND NOT A PARAGRAPH. The obvious fix is to write the rhythm down in
one more place. That is what already existed and failed. More prose raises the
amount of text and not the probability any of it is read, so it is the one
intervention that cannot fix an unread-rule failure. A denied tool call needs no
reader.

HOW IT WORKS. Three events, one script:

  PostToolUse   a `git commit` ARMS the latch. The slice is over; the only thing
                left is the reply.
  PreToolUse    while armed, anything that could modify a file is DENIED, with
                the protocol's own words quoted back. Read-only verification and
                `git push` still pass, because proving and pushing the slice you
                just committed is not advancing to the next one.
  UserPromptSubmit  the PM speaking CLEARS the latch. That is the stop the
                protocol asks for, enforced rather than remembered.

THE AUTO-ADVANCE GRANT IS HONOURED (protocol section 3). If the PM's message
grants it, the latch does not arm at all until the next message. The protocol
gives the PM that power and a guard that ignored it would be overriding them.

DENY-BY-DEFAULT, NOT A LIST OF FORBIDDEN THINGS. This session's own habit is to
edit files through Bash heredocs rather than the Edit tool, so a denylist of
mutating commands would have to anticipate every spelling of a write and would
be wrong the first time it did not. An allowlist of read-only verifiers is wrong
in the safe direction: the cost of a false deny is one message, and the cost of
a false allow is the defect this exists to stop.

THE QUOTED RULE IS READ FROM THE PROTOCOL FILE, never retyped here. A copy is
free to drift from the document it claims to enforce, and this repo has paid for
two-copies defects at the rung table, the window plan and the damage field.
"""
import json
import os
import re
import subprocess
import sys
import tempfile

PROTOCOL = "docs/slice-protocol.md"

# A DEGRADED QUOTE MUST BE LOUD, NOT POLITE. If the protocol cannot be read, the
# rule stops being injected and the latch stops quoting anything -- and a quiet
# apology in that position reads like normal output, so the mechanism would
# report success while enforcing nothing.
LOUD = "!! SLICE PROTOCOL COULD NOT BE READ -- THIS GUARD IS DEGRADED: "

# Read-only verification, plus pushing what was just committed. Anything not
# matched here is denied while the latch is armed.
ALLOWED = (
    "git status", "git log", "git diff", "git show", "git ls-remote",
    "git rev-parse", "git branch", "git check-ignore", "git push",
    "npx vitest", "npx tsc", "npx eslint", "npx next build", "npx next lint",
    "npm test", "npm run test",
    "cat ", "head ", "tail ", "grep ", "rg ", "ls", "wc ", "echo ", "printf ",
    "sed ", "cut ", "tr ", "sort", "uniq", "awk ", "curl -s",
    "true", "pwd", "date", "stat ", "diff ", "basename", "dirname",
)

# REDIRECTIONS THAT DISCARD OUTPUT RATHER THAN WRITING A FILE.
#
# THIS LIST EXISTS BECAUSE THE FIRST LIVE COMMAND AFTER WIRING WAS REFUSED.
# `npx vitest run --reporter=dot 2>&1 | tail -4` -- the single most common
# verification shape in this project -- was denied, because `&` is a segment
# separator, so `2>&1` split into a fragment containing `>` and the redirect
# rule killed it. Thirty-one synthetic cases had passed; every one of them was a
# clean one-liner I had written FOR the test rather than one taken from the
# transcript. A guard that refuses the work it is supposed to permit gets
# switched off, and then it guards nothing.
#
# Stripped BEFORE segmenting, because these tokens contain the separators. Only
# these exact forms: `foo 2>err.txt` still writes a file and is still denied.
# Longest first, so `2>/dev/null` is consumed before `>/dev/null` can match
# inside it.
DISCARD_REDIRECTS = (
    "2>&1", "&>/dev/null", "&> /dev/null",
    "2>/dev/null", "2> /dev/null", ">/dev/null", "> /dev/null",
)

# ALLOWED READERS THAT CAN STILL WRITE, and the flag that turns each one.
# `curl -s -o src/x.ts URL` writes a file; `sed -i` edits in place. Everything
# else that writes is caught by not being in ALLOWED at all.
FLAG_TRAPS = (
    ("curl", (" -o ", " --output")),
    ("sed", (" -i ", " -i.", " --in-place")),
)
#
# SCOPED TO curl, AFTER THE FIRST VERSION WAS WORSE THAN THE HOLE IT CLOSED.
# That version applied the flags to every segment and listed " -i " and " -o "
# among them, which denies `grep -i` and `grep -o` -- two of the most ordinary
# read-only commands there are. It also listed " -delete" and " -exec" for
# `find`, which is redundant: `find` is not in ALLOWED at all, so every `find`
# fails the prefix check first. `sed -i` is caught the same way, because only
# `sed -n` is allowlisted. A guard that denies what it should permit gets turned
# off, and then it guards nothing.


# Tools that write, whatever they are pointed at.
WRITERS = ("Edit", "Write", "NotebookEdit", "MultiEdit")


def head(cwd):
    """
    The current commit, or None if git cannot answer.

    THE LATCH ARMS ON THIS MOVING, NOT ON THE COMMAND TEXT, and that is the fix
    for the defect that stopped the session twice. The first version armed when
    the Bash command CONTAINED "git commit" -- so a regression script holding
    that string in a LIST OF TEST CASES armed the latch with no commit made and
    HEAD unchanged. It is the same failure this repo already paid for in E17: a
    thing that describes a defect reproduces it, now inside the guard written to
    stop that class of thing.

    Asking git what HEAD is cannot be fooled by a mention, and it catches a
    commit however it was spelled -- an alias, --amend, a script, a hook.
    """
    try:
        done = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            cwd=cwd or None,
            capture_output=True,
            text=True,
            timeout=5,
        )
    except (OSError, subprocess.SubprocessError):
        return None
    if done.returncode != 0:
        return None
    return done.stdout.strip() or None


def state(session_id, kind):
    return os.path.join(tempfile.gettempdir(), "claude-slice-" + kind + "-" + str(session_id))


def touch(path, note="1"):
    with open(path, "w", encoding="utf-8") as handle:
        handle.write(note)


def whose(path):
    """Which session armed this latch, so a deny can be diagnosed."""
    try:
        with open(path, encoding="utf-8") as handle:
            return handle.read().strip()
    except OSError:
        return "unknown"


def session_note(session_id):
    """
    A MISSING session_id COLLAPSES EVERY SESSION ONTO ONE LATCH, so one session
    committing would deny another. The tempting fix is to do nothing when it is
    absent -- which turns this into a guard that silently stops guarding, the
    failure this repo keeps finding. It arms anyway and records whose latch it
    is, so a surprising deny is a diagnosable one rather than a mystery.
    """
    if session_id == "nosession":
        return "nosession (the payload carried no session_id, so this latch is shared)"
    return str(session_id)


def drop(path):
    try:
        os.remove(path)
    except OSError:
        pass


def segments(cmd):
    """
    Split a shell command on ; | & && || -- RESPECTING QUOTES.

    The first version did not, and it denied `grep -E "FAIL|Tests "`: the pipe
    inside the quoted regex split the command, leaving a fragment `Tests "` that
    matched no allowlist entry. One of twenty-six real commands from the
    transcript, refused for punctuation inside a string.

    A separator inside single or double quotes is a character, not a separator.
    No regex, because the transport this file is written through eats one level
    of backslash escaping.
    """
    out, buf, i, quote = [], "", 0, ""
    while i < len(cmd):
        ch = cmd[i]
        if quote:
            buf += ch
            # A BACKSLASH-ESCAPED QUOTE IS NOT THE CLOSING QUOTE. Without this
            # the scanner closed early on an escaped quote, fell out of step,
            # and let a pipe inside a string act as a separator -- which is how
            # it denied the command I was using to verify its own fix.
            if ch == chr(92) and i + 1 < len(cmd):
                buf += cmd[i + 1]
                i += 2
                continue
            if ch == quote:
                quote = ""
            i += 1
            continue
        if ch in ("'", '"'):
            quote = ch
            buf += ch
            i += 1
            continue
        if cmd[i:i + 2] in ("&&", "||"):
            out.append(buf)
            buf = ""
            i += 2
            continue
        if ch in ";|&":
            out.append(buf)
            buf = ""
            i += 1
            continue
        buf += ch
        i += 1
    out.append(buf)
    return [s.strip() for s in out if s.strip()]


def read_only(cmd):
    """True only if EVERY segment is an allowed verifier and none redirects."""
    normalised = cmd
    for token in DISCARD_REDIRECTS:
        normalised = normalised.replace(token, " ")
    parts = segments(normalised)
    if not parts:
        return False
    for part in parts:
        if ">" in part or "<<" in part:
            return False
        padded = " " + part + " "
        # `-o /dev/null` is the health check this session actually uses after a
        # change; it discards the body rather than writing a file.
        if "-o /dev/null" not in part:
            for prefix, flags in FLAG_TRAPS:
                if part.startswith(prefix) and any(flag in padded for flag in flags):
                    return False
        if not part.startswith(ALLOWED):
            return False
    return True


def rhythm(cwd):
    """The protocol's own Session rhythm section, read from the file."""
    path = os.path.join(cwd or os.getcwd(), PROTOCOL)
    try:
        with open(path, encoding="utf-8") as handle:
            text = handle.read()
    except OSError:
        return LOUD + "docs/slice-protocol.md could not be opened at " + path
    start = text.find("## Session rhythm")
    if start < 0:
        return LOUD + "docs/slice-protocol.md has no '## Session rhythm' heading."
    end = text.find("## ", start + 3)
    block = text[start:end if end > 0 else len(text)].strip()
    # A HEADING THAT SURVIVES WHILE ITS BODY DOES NOT would quote an empty rule
    # and this whole mechanism would go on reporting success. The real block is
    # ~500 characters; anything near-empty is a failure, said out loud.
    if len(block) < 200:
        return LOUD + "the Session rhythm section is " + str(len(block)) + " characters, which cannot be the rule."
    return block


def read_event():
    """
    THE PAYLOAD IS UTF-8 BYTES, AND THIS MACHINE'S LOCALE IS GBK (2026-09-23).

    `json.load(sys.stdin)` decodes stdin in the Windows locale encoding. A PM
    reply quoting a Chinese sentence decoded to garbage, the parse raised, and
    the old handler exited 0 in silence -- BEFORE `drop(latch)`. The latch stayed
    armed, and the next edit was denied as "the PM has not replied since",
    straight after the PM had replied. Whether a given Chinese string survives
    the wrong decoding is luck of the byte alignment, which is why it was rare.

    So the bytes are read and decoded as UTF-8 explicitly, and a payload that
    still cannot be read FAILS LOUDLY: a guard that exits 0 on input it did not
    understand looks exactly like a guard that ran. Regression:
    `.claude/hooks/test_hook_encoding.py`.
    """
    raw = sys.stdin.buffer.read()
    try:
        return json.loads(raw.decode("utf-8-sig"))
    except ValueError as exc:
        why = type(exc).__name__ + ": " + str(exc)[:160]
    """
    EVEN AN UNREADABLE PAYLOAD STILL SAYS WHO SPOKE. The event name and the
    session id are ASCII, so they survive any decoding. Recovering them keeps the
    two outcomes that matter from depending on the prompt's text: the PM
    replying still clears the latch, and an armed latch still denies a write
    instead of failing open.
    """
    text = raw.decode("latin-1")
    name = re.search(r'"hook_event_name"\s*:\s*"([A-Za-z]+)"', text)
    session = re.search(r'"session_id"\s*:\s*"([A-Za-z0-9_-]+)"', text)
    name = name.group(1) if name else ""
    session = session.group(1) if session else "nosession"
    latch = state(session, "latch")
    if name == "UserPromptSubmit":
        drop(latch)
        drop(state(session, "advance"))
        sys.stderr.write(
            LOUD + "the PM's message could not be parsed (" + why + "). The latch was "
            "cleared anyway, because the PM speaking is the whole of that rule; an "
            "auto-advance grant in it could not be read and was NOT honoured.\n"
        )
        sys.exit(1)
    if name == "PreToolUse" and os.path.exists(latch):
        sys.stderr.write(
            LOUD + "an unreadable tool call arrived while the latch is armed (" + why
            + "); denied rather than let through unread.\n"
        )
        sys.exit(2)
    sys.stderr.write(
        LOUD + "the hook payload could not be read (" + why + "); event "
        + (name or "unknown") + " was not processed.\n"
    )
    sys.exit(1)


def standing(cwd):
    """
    WHETHER THE OWNER'S STANDING AUTO-ADVANCE IS IN FORCE, READ FROM THE DOCUMENT.

    The 2026-09-07 ruling put the switch in `docs/slice-protocol.md`: the heading
    "## Standing auto-advance ... IN FORCE" supersedes the per-message grant, and
    changing it to SUSPENDED restores the per-slice stop everywhere at once.
    CLAUDE.md and `scripts/githooks.test.ts` both said this hook read that heading.
    Until 2026-09-23 (PM ruling RT-3 (2026-09-23) a) it did not: it disarmed only
    on the literal words "auto-advance" in a message, so the owner had to repeat a
    ruling they had already made, and a session stopped after a commit the ruling
    said should not stop it.

    UNREADABLE MEANS NOT IN FORCE. If the document or the heading is missing, the
    latch behaves as it did before the ruling -- it stops -- and says so loudly.
    A guard that fails open when it cannot read its own rule is the failure this
    repository keeps finding.

    Returns (in_force, note). The note is empty when the heading was read cleanly.
    """
    path = os.path.join(cwd or os.getcwd(), PROTOCOL)
    try:
        with open(path, encoding="utf-8") as handle:
            lines = handle.read().splitlines()
    except OSError:
        return False, LOUD + "docs/slice-protocol.md could not be opened; standing auto-advance treated as SUSPENDED."
    heading = next((l.strip() for l in lines if l.startswith("## Standing auto-advance")), None)
    if heading is None:
        return False, LOUD + "the '## Standing auto-advance' heading is missing; treated as SUSPENDED."
    if heading.endswith("IN FORCE"):
        return True, ""
    if heading.endswith("SUSPENDED"):
        return False, ""
    return False, LOUD + "the standing auto-advance heading ends in neither IN FORCE nor SUSPENDED: " + heading


def main():
    # What this prints goes back to Claude Code as UTF-8; the locale default
    # turned every em dash in the quoted rule into mojibake.
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8")
        except (AttributeError, ValueError):
            pass
    try:
        event = read_event()
    except OSError:
        sys.stderr.write(LOUD + "the hook payload could not be read from stdin.\n")
        sys.exit(1)

    name = event.get("hook_event_name", "")
    session = event.get("session_id", "nosession")
    cwd = event.get("cwd", "")
    latch = state(session, "latch")
    advance = state(session, "advance")

    if name == "UserPromptSubmit":
        # The PM has spoken. That IS the stop the protocol asks for.
        drop(latch)
        prompt = (event.get("prompt", "") or "").lower()
        if "auto-advance" in prompt or "continue through s" in prompt:
            touch(advance)
        else:
            drop(advance)

        """
        THE OTHER HALF, AND THE ONE THAT ADDRESSES THE ACTUAL CAUSE.

        The latch stops a session advancing; it does nothing about a session
        that never learned the rule. E18 did not break the protocol on purpose.
        It read CLAUDE.md, which was in the system prompt for free and says the
        7-step loop runs per TASK, and it never opened
        docs/slice-protocol.md -- the file that amends that same loop to run per
        SLICE. A rule that is optional to read is a rule that eventually goes
        unread, and no amount of writing it down in more places changes that.

        So the rule is put into context rather than left to be fetched. Read
        from the protocol file every time, never a copy: a paraphrase here would
        be free to drift from the document it claims to be quoting.

        FULL ON THE FIRST MESSAGE, ONE LINE AFTERWARDS. The full block once is
        enough to be read; the one-liner every turn is what survives a context
        compaction, which would otherwise quietly discard the only copy.
        """
        seen = state(session, "seen")
        nl = chr(10)
        # WITHOUT A SESSION ID THE "seen" MARKER IS SHARED, so every session
        # after the first would silently lose the full rule -- the failure this
        # exists to prevent, caused by the thing preventing it. Unknown session:
        # always print in full.
        in_force, note = standing(cwd)
        if note:
            sys.stderr.write(note + nl)
        if os.path.exists(seen) and session != "nosession":
            if in_force:
                print(
                    "SLICE PROTOCOL: standing auto-advance IN FORCE — no stop between "
                    "slices, and per slice still: build, prove from a real run, three "
                    "red-team findings FIXED, confess, north star, the mutation run — "
                    "in the reply AND the commit. (docs/slice-protocol.md)"
                )
            else:
                print(
                    "SLICE PROTOCOL: one slice per reply — build, prove, red-team, "
                    "confess, STOP. (docs/slice-protocol.md)"
                )
        else:
            touch(seen)
            print(
                "SLICE PROTOCOL — in force this session, and machine-enforced."
                + nl + nl
                + rhythm(cwd)
                + nl + nl
                + (
                    "Standing auto-advance is IN FORCE (docs/slice-protocol.md): a "
                    "commit does not stop the session. Everything in 'What auto-advance "
                    "does NOT excuse' is still owed per slice, in the reply and the "
                    "commit. Changing the heading to SUSPENDED restores the latch."
                    if in_force
                    else "A `git commit` arms a latch that DENIES file-modifying tools "
                    "until the PM replies, so the stop in step 2 is not something you "
                    "have to remember. Read-only verification and `git push` still "
                    "pass. The PM's auto-advance grant in step 3 disarms it."
                )
            )
        sys.exit(0)

    if name == "PostToolUse":
        if event.get("tool_name") != "Bash":
            sys.exit(0)
        """
        ARMED BY HEAD MOVING, NOT BY WHAT THE COMMAND SAID.

        This branch used to arm when the command text contained the two words
        naming a commit. That armed on a MENTION: a regression script holding
        those words in a list of test cases armed the latch with nothing
        committed and HEAD unchanged, and then the latch denied the edit that
        would have fixed it -- because the fix's own explanation has to name the
        phrase it triggers on. A guard that matches text cannot be repaired
        through itself. Asking git what HEAD is cannot be fooled by a mention,
        and it also catches a commit made through an alias, an --amend, or a
        script that never spells it out.

        THE FIRST CALL RECORDS AND DOES NOT ARM. There is nothing to compare
        against yet, and treating an unknown previous value as movement would
        arm on the session's first command.
        """
        mark = state(session, "head")
        now = head(cwd)
        before = None
        if os.path.exists(mark):
            with open(mark, encoding="utf-8") as handle:
                before = handle.read().strip() or None
        if now is None:
            # Not a repository, or git is unreachable. Nothing can be committed
            # in the first case; in the second the latch is blind, and blind is
            # said out loud rather than passed off as quiet.
            if before is not None:
                print(
                    LOUD + "git could not be asked for HEAD, so a commit "
                    "cannot be detected and the latch will not arm.",
                    file=sys.stderr,
                )
                sys.exit(2)
            sys.exit(0)
        touch(mark, now)
        if before is None or now == before:
            sys.exit(0)
        if os.path.exists(advance):
            sys.exit(0)
        in_force, note = standing(cwd)
        if in_force:
            sys.exit(0)
        if note:
            sys.stderr.write(note + chr(10))
        touch(latch, session_note(session))
        sys.stderr.write(
            "SLICE COMMITTED — the latch is armed.\n\n"
            + rhythm(cwd)
            + "\n\nFile-modifying tools are denied until the PM replies. What is left "
            "in this slice is the reply: paste the proof, the red-team and the "
            "confession, then stop and ask whether to continue.\n"
        )
        sys.exit(2)

    if name == "PreToolUse":
        if not os.path.exists(latch):
            sys.exit(0)
        tool = event.get("tool_name", "")
        if tool == "Bash":
            cmd = (event.get("tool_input", {}) or {}).get("command", "")
            if read_only(cmd):
                sys.exit(0)
            reason = "this Bash command is not read-only verification"
        elif tool in WRITERS:
            reason = tool + " modifies files"
        else:
            sys.exit(0)
        sys.stderr.write(
            "DENIED BY THE SLICE LATCH — a slice was committed by session "
            + whose(latch)
            + " and the PM has not replied since, so " + reason + ".\n\n"
            + rhythm(cwd)
            + "\n\nStop. Report this slice and ask whether to continue. If the work "
            "genuinely cannot wait, say so in the reply and let the PM unlatch it "
            "by answering.\n"
        )
        sys.exit(2)

    sys.exit(0)


if __name__ == "__main__":
    main()
