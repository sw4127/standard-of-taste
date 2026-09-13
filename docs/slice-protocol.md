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

### What "auto-advance" does NOT excuse (owner-approved amendment 2026-09-12)

**Appended, nothing above is amended away.** The owner granted auto-advance and asked for this in
the same breath, and the reason is worth recording in their words: the fear is that *"in the future
you will forget procedures for individual slices like confession, red-team etc when I say auto
advance"*. That fear is correct. It is the same mechanism the closing rules already name — **self-
preference, goal drift and laziness** — and removing the round-trip removes the one moment that
used to expose all three.

**Auto-advance removes the WAIT. It removes nothing else.** Per slice, every time, whether or not a
grant is in force:

1. **Three red-team findings, hostile, and FIXED inside their own slice.** Not two. Not deferred to
   a later slice. If a finding cannot be fixed in its slice and is SHIP-RISK or worse, the work
   stops — that is already in "What still stops the work" and auto-advance does not touch it.
2. **A confession naming what is stubbed, hardcoded, assumed or unverified.** A confession that
   gets shorter while the work gets riskier is the laziness signal, stated in the closing rules.
3. **A north star, including the answer "this serves none" when that is the truth.**
4. **Proof from a real run**, pasted — not "should work", not a description of a run.
5. **The mutation, actually run**, for any guard the slice adds. A guard that has never failed has
   not been tested, and three guards in this repository passed their own mutations before being
   repaired.

**They go in BOTH places, and that is the amendment's substance.** The 2026-09-07 ruling put the
loop's artefacts in the commit message, on the reasoning that the PM reviews the diff. Measured on
2026-09-10: the PM asked *"where is the red-team part I asked for each slice"* after two slices had
shipped with complete red-teams in their commit messages. The commit is where the record survives;
**the reply is where the PM actually reads**. A record nobody opens is the same failure as a rule
nobody reads, which is what the machine enforcement section exists for. So: the three findings and
the confession appear in the **reply text** as well as the commit message, in every slice, granted
or not.

**Why this is a rule and not a reminder.** The three failures it guards against do not announce
themselves. Self-preference feels like judgment; goal drift feels like momentum; laziness feels
like efficiency. The countermeasure cannot be "remember to be honest" — it has to be an artefact
that is missing in a way somebody notices. Three findings and a confession, visible in the reply,
are that artefact: their absence is obvious at a glance, and their *thinning* is the earliest
signal the closing rules tell this session to watch for in itself.

**What the PM should do with it.** If a slice's reply arrives with fewer than three findings, with
findings that are compliments, or with a confession of "nothing" — say so and stop the session.
That reply is evidence about the session's honesty, not about the slice's quality.

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

> **AMENDED 2026-09-12 — see "What auto-advance does NOT excuse" above.** The sentence "the full
> loop is in the commit" was measured and found wrong in the half that matters: two slices shipped
> with complete red-teams in their commit messages and the PM asked where the red-team was. The
> commit is where the record SURVIVES; the reply is where it is READ. The three findings and the
> confession now go in both. What this section still gets right, and what the amendment keeps, is
> that a reply must not recite ceremony — three real findings and a confession are not ceremony,
> and the north star, the plan-and-alternative and the slice bookkeeping stay in the commit.


### What may appear in the decisions block (owner-approved amendment 2026-09-07, same day)

**Why this was needed within hours of the auto-advance ruling.** Auto-advance was granted and the
work still stopped every reply, because the session kept ending with `== DECISIONS NEEDED ==` items
marked BLOCKER that were not blockers: *"commission batch 2 now?"* (a sequencing call with an obvious
answer), *"these two strings are under the length floor"* (a pure engineering trade-off that
`docs/redteam-protocol.md` and the standing notes already say must never appear there). The owner
asked why there were so many, and the honest answer is that the block was being used as a checkpoint
— a way to hand back a decision rather than carry it. That is the round-trip the ruling removed,
wearing the costume of diligence.

**The bar. An item goes in the block only if it is one of these:**

1. **A one-way door** — money, a recurring cost, a deletion, anything published or irreversible, a
   data-schema choice.
2. **A product decision the code cannot settle** — what the product should DO or SAY to a person,
   where two answers are both defensible and the owner's taste is the deciding input.
3. **A SHIP-RISK or worse finding that cannot be fixed inside its own slice.**
4. **A premise behind an existing ruling has turned out to be false**, so the ruling needs remaking
   on the corrected facts.

**Everything else is engineering's to decide, and deciding it is the job.** Sequencing, guard design,
test strategy, refactor shape, what to name a thing, whether a heuristic is good enough, which of two
defensible implementations to use — these are chosen, done, and reported in the commit, not asked
about. If the choice is close, pick one, say in one line which and why, and move on.

**Severity is not a mood.** BLOCKER means the critical path genuinely stops without an answer. A
question with a sensible default is at most POLISH, and a question with an obvious answer is not a
question. Padding the block with POLISH items to look thorough teaches the owner to skim it, which
costs exactly the attention the real items need.

**An empty block is the normal case.** Omit it rather than filling it. A reply that ends without one
means engineering found nothing that only the owner can decide, which on most slices is the truth.


### Push cadence: once per TASK, not once per slice (owner-approved 2026-09-08)

**Why this is a rule and not a preference.** Every push to `main` is a production deployment, and
every deployment stores a full copy of the built site — including **154 MB of tracked instrument
audio**, which cannot be reduced because the lossy ladder's rungs ARE specific bitrates and
re-encoding them changes the instrument rather than compressing an asset. The Vercel free tier
allows 10 GB of deployment storage, so the ceiling arrives at roughly **sixty pushes**. E19 made
about thirty-four commits in two days, pushing after each one, and hit 100% of the quota.

**The rule.** Commit per slice, as before. **Push when a TASK is done**, not when a slice is.

**What is unchanged, so nothing is traded away for this:**
- The full suite still runs on every slice, before every commit.
- The pre-push hook still refuses a red tree; batching pushes does not batch that gate.
- The PM still sees every slice, because the latch stops the session at each one regardless.

**What is genuinely lost, stated plainly:** work sits on one machine for longer. So **always push
before the session ends**, and push immediately after any slice whose loss would be expensive to
reproduce — a long measurement, a migration, anything whose value is in the doing rather than the
diff.

#### What was rejected, and why it is worth knowing

A Vercel `ignoreCommand` skipping builds for documentation-only commits was approved and then NOT
built. Two reasons, measured:

1. **It buys almost nothing.** Of E19's thirty-four commits, **five** touched no production file.
   That is a 15% saving against the ~70% this cadence change buys.
2. **It is unsafe in exactly the case this amendment creates.** Vercel's documented pattern is
   `git diff --quiet HEAD^ HEAD ./`, which inspects only the LAST commit. Once a push carries
   several commits, a documentation-only commit at the tip skips the build for the whole push — and
   every source change in it silently never reaches production. There is no error; the site simply
   goes stale. A 15% saving is not worth a failure mode whose symptom is "the deploy looked fine".

The earlier framing of the same ruling — *"only main-branch pushes deploy"* — was also a non-fix,
and it was engineering's error: this project pushes exclusively to `main`, so every push already was
one. It is recorded here because the owner approved it on that framing.
