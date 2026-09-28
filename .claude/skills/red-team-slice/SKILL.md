---
name: red-team-slice
description: The red-team, fix and confession step that closes every slice in this repository, before its commit. Use after a slice is built and proven and before `git commit`, whenever the diff touches src/, scripts/, packages/ or .claude/, or when asked to red-team, confess, or write the commit trailers.
---

# Red-team a slice

Packages a procedure every session here already follows from prose. The rule lives in
`CLAUDE.md` and `docs/slice-protocol.md`; this file quotes it and adds only the order of
work. Every quote below is checked against its source by `scripts/claude-skills.test.ts`,
so if one stops matching, the rule moved and this skill must follow it.

## The rule, quoted

<!-- source: CLAUDE.md -->
> 5. **RED-TEAM YOURSELF:** as a hostile reviewer who assumes this is lazy and mediocre, list the 3 worst things about what you just built, then fix them.

<!-- source: CLAUDE.md -->
> 6. **CONFESSION:** list everything stubbed, mocked, hardcoded, skipped, or NOT verified. Hidden shortcuts are worse than admitted ones.

<!-- source: docs/slice-protocol.md -->
> 1. **Three red-team findings, hostile, and FIXED inside their own slice.** Not two. Not deferred to a later slice. If a finding cannot be fixed in its slice and is SHIP-RISK or worse, the work stops — that is already in "What still stops the work" and auto-advance does not touch it.

<!-- source: docs/slice-protocol.md -->
> 5. **The mutation, actually run**, for any guard the slice adds. A guard that has never failed has not been tested, and three guards in this repository passed their own mutations before being repaired.

<!-- source: docs/slice-protocol.md -->
> So: the three findings and the confession appear in the **reply text** as well as the commit message, in every slice, granted or not.

<!-- source: docs/redteam-protocol.md -->
> - Anything red-teamed but NOT decision-relevant goes in the prose, not the block.

## The order of work

1. **Read the diff, not your memory of it.** `git diff --cached --stat`, then the full
   staged diff. A finding about code you did not re-read is a guess.
2. **Get an independent pass.** Write the change where the reviewer can read it
   (`git diff --cached > .git/red-team.diff`, or `git show <sha>` for one commit), then
   dispatch the `red-team-reviewer` subagent (`.claude/agents/red-team-reviewer.md`). It
   has Read, Grep and Glob only and returns three findings; it never edits. Its findings
   are candidates: check each against the code before accepting it.
3. **Find the three worst,** yours and the reviewer's together, ranked by what a hostile
   reviewer would lead with. A finding must name a concrete failure (input, state, wrong
   output), not a mood. "Could be cleaner" is not a finding. A compliment is not a finding.
4. **Fix all three inside this slice**, then re-run the proof. A fix that was not re-proven
   is a fourth thing to confess.
5. **Run the mutation for every guard the slice added or changed.** Break the thing the
   guard protects, run the guard, paste the red result, restore, paste the green.
6. **Confess.** What is stubbed, hardcoded, assumed, skipped or not verified. If the slice
   is riskier than the last one and the confession is shorter, say so: that is the
   laziness signal the closing rules name.
7. **Write it twice.** In the reply, and as commit trailers:

<!-- source: docs/slice-protocol.md -->
> Red-team: <finding, and what was done about it>

   Mark a finding the reviewer raised as `Red-team: (subagent) ...`, and record the skill
   itself as a `Skill: red-team-slice` line.
8. **Decisions block.** Only a one-way door, a product decision the code cannot settle, an
   unfixable SHIP-RISK, or a collapsed premise. Everything else is engineering's call and
   goes in the prose.

Cites: D2/N3 (proof, not self-report) · BA-12 (the workflow is in the repository).
