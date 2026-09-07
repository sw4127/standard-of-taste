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


## Standing auto-advance (owner-approved 2026-09-07) — IN FORCE

**Nothing above is amended away. What changes is who the loop reports to.**

Autumn recruitment has started and the project is past its internal deadline. The owner has ruled
that engineering **proceeds on its own recommendation** rather than stopping for a ruling between
slices. Section 2's per-reply stop and section 3's grant-by-phrase are superseded **while this
section says IN FORCE**.

### What is removed

The **round-trip**, and only the round-trip. A slice no longer ends by waiting.

### What is NOT removed

The seven-step loop still runs **per slice, in full**: north star · plan and alternative · build ·
prove with a real run · three hostile red-team findings, FIXED · confession · north star. The owner's
words: *"three red-team confession and north star were still needed for each slice, I just need you
to do them internally."*

**"Internally" is not "silently".** A discipline that leaves no trace is a discipline that decays,
and this project has watched exactly that happen to a rule that lived only in prose. So the loop's
artefacts move out of the chat and into **the commit message**, which is where the PM already
reviews the work and which survives the session:

```
North-star: <one line — what advantage this slice serves, or that it serves none>
Red-team: <finding, and what was done about it>
Red-team: <finding, and what was done about it>
Red-team: <finding, and what was done about it>
Confession: <what is stubbed, unverified, assumed, or knowingly left broken>
```

`.githooks/commit-msg` **refuses a commit touching `src/` or `scripts/` without them**. The hook
checks that they are present and non-trivial; it cannot check that they are honest, and nobody
should imagine otherwise. Its value is that skipping the loop now takes a deliberate act rather than
a lapse of attention — the same reason the latch exists.

An emergency may skip it with `Loop: n/a — <reason>` in the message. That line is logged forever and
is the first thing a reviewer will grep for.

### What still stops the work

Auto-advance is not a licence to decide everything. **Stop and ask** when:

1. **A one-way door** — money, a deletion, anything published or irreversible, a data-schema choice.
2. **A product or scope decision the code cannot settle** — what the product should DO, not how.
3. **A red-team finding rated SHIP-RISK or worse that cannot be fixed inside its own slice.**
4. **A premise behind an existing ruling turns out to be false.** This is not hypothetical: E19/S5
   found that a state the owner had ruled on was near-unreachable, and the ruling had been made on
   engineering's own incorrect description of it. Executing a ruling whose basis has collapsed is
   worse than pausing.

Everything else proceeds.

### How this is revoked

**Edit the word IN FORCE in this section's heading to SUSPENDED.** The machine guard reads this file
for it, so the document is the switch rather than a description of one. Do not disable the hook
instead: that would leave the rule and the enforcement disagreeing, which is the two-copies defect
this repository keeps paying for.

### Why the reply format changes too

A reply that still recites the full ceremony has moved the cost from round-trips to reading. Slice
replies now report: what shipped, the proof, and anything the owner must decide. The full loop is in
the commit. The `== DECISIONS NEEDED ==` block still ends every reply that has something in it, and
is omitted rather than padded when it does not.
