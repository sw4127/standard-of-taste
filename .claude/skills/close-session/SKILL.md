---
name: close-session
description: How a session in this repository ends — deciding whether to close at all, running the fresh-clone suite, pushing, writing the dated handoff, emitting the activation prompt and the DECISIONS block. Use when the approved task queue is done, when the PM says to wrap up, or when one of CLAUDE.md's named close triggers applies.
---

# Close a session

Packages the closing rules in `CLAUDE.md` and the push rule in `docs/slice-protocol.md`.
Every quote is checked against its source by `scripts/claude-skills.test.ts`.

## First: should this session close at all?

<!-- source: CLAUDE.md -->
> **The rule is now: do not close while you are still the best agent for the next task.**

<!-- source: CLAUDE.md -->
> **Say why, out loud.** Every close names its trigger from the list.

The list is CLAUDE.md's "Valid reasons to close" (context genuinely near exhaustion, goal
drift, laziness, self-preference, a different frame, the PM says so). If none applies and
work remains, do not close: continue.

## Then, in this order

1. **The suite on a fresh clone.** `npm run test:fresh`. It clones HEAD, links
   `node_modules`, runs the suite and removes the clone. Paste the last lines.

<!-- source: scripts/fresh-clone-check.mjs -->
> Not wired into the pre-push hook: that hook says adding slower checks is a deliberate decision, and this roughly doubles a push. Run it at session close:

2. **Push.** Once per task, and always before the session ends. The pre-push hook runs the
   suite again; never bypass it.

<!-- source: docs/slice-protocol.md -->
> So **always push before the session ends**

3. **The handoff.** Write or refresh `docs/handoff-<YYYY-MM-DD>.md`:

<!-- source: CLAUDE.md -->
> 1. **Write/refresh `docs/handoff-<YYYY-MM-DD>.md`** — current state, what shipped, measured findings that must not be lost, open work in priority order, and every unanswered `== DECISIONS NEEDED ==` item carried forward.

<!-- source: CLAUDE.md -->
> **Proportionality.** A close triggered by 2–5 above may not need a fresh full-state document. Refresh the existing handoff and write the activation prompt; do not regenerate a state dump that has barely moved.

   Commit it by name (`git add docs/handoff-...md`), never `git add -A`: the working tree
   holds deliberately untracked files, and the repository is public.
4. **The activation prompt**, in a fenced block in the chat:

<!-- source: CLAUDE.md -->
> 2. **Emit the next session's ACTIVATION PROMPT in the chat, in a copy-paste code block.** The PM pastes it verbatim into a fresh session; it must stand alone.

<!-- source: CLAUDE.md -->
> Do not wait to be asked. A session that ends without an activation prompt is not finished.

5. **The DECISIONS block** ends the reply, in `docs/redteam-protocol.md`'s format, holding
   only what passes the bar:

<!-- source: docs/slice-protocol.md -->
> **An empty block is the normal case.** Omit it rather than filling it.

   Every option is written for the owner, not for engineering:

<!-- source: CLAUDE.md -->
> **The rule in force (RT-Z11 a):** explain every tradeoff in plain language, and say what the owner would SEE under each option.

Cites: BA-12 · BP-GOAL (a reviewer on a fresh clone gets what this session had) · N3.
