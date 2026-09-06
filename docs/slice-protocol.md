# Slice Protocol (standing rule, owner-approved 2026-07-19 — amends the RT-1a task loop)

Problem: the 7-step loop ran per *function*, so hostile self-review happened once, at the end,
against sunk work — where it is weakest. The loop now runs per SLICE.

## Definitions
- **Slice:** the smallest independently provable increment — one capability, provable by its own
  test or real output, without the slices after it existing. Heuristic ceiling: ~150 LOC excl. tests;
  if it can't be proven alone, it's two slices.
- **Slice plan:** numbered S1..Sn in the session plan, each with a PRE-REGISTERED proof criterion
  ("S2 is done when X test passes / Y output renders for 3 diverse inputs") written BEFORE building.

## Session rhythm
1. Plan reply: slice plan (S1..Sn, proof criteria, D#/N# citation per slice). WAIT for PM approval.
2. Then ONE SLICE PER REPLY: build S_k → PROVE S_k (paste the real run) → RED-TEAM S_k (3 worst
   things, hostile, fix them) → CONFESS S_k → STOP: "S_k complete — continue to S_{k+1}?"
3. PM may grant **auto-advance**: "continue through S_n, stopping only if a red-team finding is
   SHIP-RISK or worse." Absent that grant, every slice stops.

## Anti-gaming rules
- No retroactive slicing: declaring slice boundaries after the code exists is a protocol violation —
  confess it as such.
- No deferred review: S_k's red-team happens in S_k's reply, never batched at the end.
- If more than one slice ships in a reply, the CONFESSION must open with the violation.
- The == DECISIONS NEEDED == block (redteam-protocol.md) appears at every stop, empty or not.

## Rationale (for future sessions questioning the overhead)
Self-review honesty is inversely proportional to the amount of sunk work under review (N2's
mechanism applied to code review). Small slices keep the hostile reviewer hostile. The overhead is
the point: it buys review quality with round-trips, which the PM has explicitly chosen to spend.

## Machine enforcement (owner-approved 2026-09-06, PM ruling RT-O5 a — appended, nothing above is amended)

This protocol was broken on 2026-09-05 (session E18): five slices shipped in one reply with the
red-team batched at the end, which is the exact failure the document was written to kill.

**The cause was not judgment. It was that this file is optional to read.** CLAUDE.md's RT-1a loop is
in the system prompt for free and says the 7-step loop runs per *task*; the amendment making it run
per *slice* lives here, in a file the session was told to read fourth and never opened. A rule that
can be skipped will eventually be skipped, and writing it down in one more place cannot fix a
failure whose mechanism is that the writing went unread.

So it is enforced by `.claude/hooks/slice-latch.py` rather than by memory:

- **HEAD moving arms a latch.** File-modifying tools are then denied until the PM replies — Edit,
  Write, a Bash heredoc, `git add`, a second commit. Read-only verification and `git push` still
  pass, because proving and pushing the slice you just committed is not advancing to the next one.
  It watches HEAD rather than the command text, and that is not a detail: the first version armed
  when a command *contained* the words naming a commit, so a test script holding those words in a
  list armed it with nothing committed — and then denied the edit that would have fixed it, because
  the fix's own explanation has to name the phrase it triggers on. A guard that matches text cannot
  be repaired through itself.
- The PM replying **clears it**. That is the stop in §2, enforced instead of remembered.
- The **auto-advance grant in §3 is honoured**: a message granting it disarms the latch until the
  next message.
- Every message puts §Session rhythm — **read from this file, never a copy** — into the session's
  context, so the rule cannot go unread again. If this file moves or its heading changes, the hook
  says loudly that the guard is degraded rather than quietly quoting nothing.

The hook is untracked (`.claude/` is not published) and wired in `.claude/settings.local.json`,
which is gitignored. **It therefore protects this machine only.** A session on another machine has
this paragraph and nothing else — which is the situation that produced the violation, so treat the
paragraph as the weaker half.
