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
