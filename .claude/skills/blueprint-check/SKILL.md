---
name: blueprint-check
description: Check a piece of copy, a page, a document or a proposal against docs/blueprint.md by BP-ID — every statement of the goal, insight, demand, unmet demand, challenged assumptions, bridge, business case or interview findings must quote the blueprint verbatim or be a registered derived line, and every proposal must cite the BP statement it serves. Use before committing copy that states any founding idea, when writing a proposal, or when asked whether something matches the blueprint.
---

# Check against the blueprint

Packages the blueprint rule of record. Every quote is checked against its source by
`scripts/claude-skills.test.ts`.

## The rule, quoted

<!-- source: docs/blueprint.md -->
> Every other statement of them quotes this file by ID, verbatim, or is registered as a derived line that names the ID it serves.

<!-- source: CLAUDE.md -->
> **Standing rule, added to the list above:** every proposal cites the BP statement it serves, alongside the D#/N#. A proposal that serves no BP statement says so.

<!-- source: src/content/blueprint.ts -->
> THE FORMAT IS THE FILE'S OWN. Between the two markers, each statement is one line `**BP-ID** · text`; the italic lines under it carry its label (or its kind), its sources and its cross-references, and are not part of the quoted text. Each italic line is judged on its own for the page (`publicSource`), so a published citation shares no line with a cross-reference (owner-approved 2026-09-28).

<!-- source: src/content/blueprint-copies.ts -->
> - `derived` — the file keeps its own wording, and the token `BP-<ID>` sits within five lines of `anchor` (a comment is enough), so every paraphrase names the statement it serves.

## Procedure

1. **Mark every founding sentence** in the target: any sentence that states what the
   product is for, what it believes, who wants it, what is missing elsewhere, an assumption
   it rejects, the bridge, the business case, or an interview finding.
2. **Fetch each statement from the record, never from memory.** Retyping from memory is how
   nine copies drifted until two made different claims. Read the statement's line from
   `docs/blueprint.md` between the `BLUEPRINT:BEGIN` and `BLUEPRINT:END` markers; the
   italic note under it is not part of the text.
3. **Classify each marked sentence:**
   - **quoted** — whitespace-collapsed, it contains the statement's text exactly (a
     lower-case first letter and a dropped final full stop are the only allowances);
   - **derived** — its own wording, with a `BP-<ID>` token within five lines, AND a row in
     `src/content/blueprint-copies.ts` if it lives in a checked file;
   - **drift** — paraphrase with no ID, or a quote that differs by a word. Fix it: quote the
     statement, or register it as derived.
   - **unsourced** — a founding claim that no BP statement makes. It is either a new
     premise (the owner's to add to the blueprint, via DECISIONS) or it comes out.
4. **For a proposal**, check it names the BP-ID it serves and the D#/N# beside it; if it
   serves none, it must say so.
5. **Run the guard:** `npx vitest run src/content/blueprint.test.ts`. The skill's reading is
   judgment; the test is the record. Both must agree.
6. **Report** one row per marked sentence: sentence · BP-ID · quoted / derived / drift /
   unsourced · the fix.

Cites: the Blueprint of record (CLAUDE.md, 2026-09-23) · N3 · BA-12.
