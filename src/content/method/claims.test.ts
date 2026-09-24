import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  METHOD_CLAIMS,
  METHOD_FINDINGS,
  METHOD_SECTIONS,
  METHOD_REFUSALS,
  METHOD_REVERSALS,
  verifiableEntries,
  sectionClaims,
  type MethodClaim,
} from "./claims";

/**
 * THE CITATION VERIFIER (E9/S2).
 *
 * Every claim on `/method` names a document and a passage inside it. This opens
 * the document and checks the passage is there. If a source is edited, moved or
 * deleted, the build fails naming the claim that just became unsupported.
 *
 * WHAT "VERBATIM" MEANS HERE, precisely, so nobody over-reads it: the anchor and
 * the file are compared with runs of whitespace collapsed to one space. Every
 * document in this repository hard-wraps at ~100 columns, and a quotation that
 * happens to straddle a line break is the same quotation. Nothing else is
 * normalised — case, punctuation and wording must match exactly.
 *
 * WHAT IT CANNOT DO. It proves the passage EXISTS in the file. It cannot prove
 * the claim is a fair reading of it, and it cannot prove the source document is
 * itself true. Those are what `kind: "inferred"` and the page's visible marking
 * are for. A green run here means "the evidence is where the page says it is",
 * and nothing stronger.
 */

/**
 * The comparison unit: whitespace collapsed and markdown emphasis removed.
 * Nothing else is touched, and no WORD is ever changed.
 *
 * THE EMPHASIS STRIP WAS FORCED BY A REAL SPECIMEN (E9/S2). The line-break test
 * quoted CLAUDE.md's "Close only when you have a named, specific reason", which
 * the file writes as `**named,` / `specific reason**` — the quotation straddles
 * both a line break AND a pair of bold markers. Requiring the asterisks in the
 * anchor would couple every citation to the source's FORMATTING: re-bolding a
 * sentence without changing a word would break the build, and the repair
 * someone reaches for at that point is a shorter, weaker anchor.
 *
 * Only `*` and backticks are removed — the two markers these documents use for
 * emphasis. `_` is left alone deliberately: it appears inside identifiers, and
 * stripping it would silently fuse words.
 */
function flat(s: string): string {
  return s
    .replace(/[*`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Sources must be TRACKED, not merely present on this machine.
 *
 * `docs/redirection-blueprint-2026-08-26.md` is the direction of record and is
 * deliberately untracked (RT-M:c). Several commit messages already cite it by
 * filename, and on a clone those citations point at a file the repository does
 * not contain. `/method` is a public page whose entire premise is that a
 * stranger can check its sources, so a citation only this machine can resolve
 * is worse than no citation: it reads as evidence and cannot be opened.
 */
const tracked = new Set(
  execFileSync("git", ["ls-files"], { encoding: "utf8" })
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean),
);

describe("the /method claim ledger", () => {
  it("is a real ledger, not an empty one", () => {
    expect(METHOD_CLAIMS.length).toBeGreaterThan(3);
    // Both branches must exist, or the inferred-marking machinery is untested.
    expect(METHOD_CLAIMS.some((c) => c.kind === "quoted")).toBe(true);
    expect(METHOD_CLAIMS.some((c) => c.kind === "inferred")).toBe(true);
  });

  /**
   * EVERY REFUSAL STATES WHAT IT COST (E9/S3 — blueprint E2).
   *
   * A page listing things a project refused, with no cost attached to any of
   * them, is not a record of judgment — it is a list of things the author is
   * pleased about. The blueprint asks for refusals AND THEIR PRICE, and the
   * failure mode is not forgetting the field: it is filling it with a denial.
   * So the shapes that mean "nothing" are rejected by name.
   */
  it("attaches a real price to every refusal", () => {
    expect(METHOD_REFUSALS.length).toBeGreaterThan(3);
    const nothing = /^(?:\s*)(?:none|nothing|no cost|n\/?a)\b/i;
    for (const r of METHOD_REFUSALS) {
      expect(r.rule.trim().length, `${r.id} names no rule`).toBeGreaterThan(0);
      expect(r.price.trim().length, `${r.id} states no price`).toBeGreaterThan(40);
      expect(nothing.test(r.price), `${r.id} claims the refusal was free`).toBe(false);
    }
  });

  /**
   * A REVERSAL IS NOT A REFUSAL, AND THE PAGE MAY NOT COUNT IT AS ONE (E21/S5).
   *
   * The refusals heading renders `METHOD_REFUSALS.length` as a word. That was
   * itself a fix: the number had been TYPED, said four above a list of six, and
   * stayed wrong for two working sessions because every guard here inspected
   * the entries and none read the heading. Slotting it fixed the drift and
   * created a new way to be wrong — an entry pushed into that array now changes
   * a number the page states about itself, silently and correctly.
   *
   * A relaxation filed among the refusals would do exactly that: seven refusals
   * would become eight, and the eighth would be the one entry on the page that
   * is not a refusal. So the two ledgers are held disjoint by id AND by the
   * text a reader actually sees, and the count is asserted against the refusals
   * alone.
   */
  it("keeps reversals out of the refusals, by id and by rendered text", () => {
    expect(METHOD_REVERSALS.length, "there is no reversal, so this checks nothing").toBeGreaterThan(0);
    expect(METHOD_REFUSALS.length, "there are no refusals, so this checks nothing").toBeGreaterThan(3);
    const refusalIds = new Set(METHOD_REFUSALS.map((r) => r.id));
    const both = METHOD_REVERSALS.filter((r) => refusalIds.has(r.id));
    expect(both.map((r) => r.id), "a reversal shares an id with a refusal").toEqual([]);
    const refusalText = METHOD_REFUSALS.map((r) => `${r.what} ${r.refusal}`).join(" ");
    const smuggled = METHOD_REVERSALS.filter((r) => refusalText.includes(r.what));
    expect(
      smuggled.map((r) => r.id),
      "a reversal's heading appears inside the refusals. Whatever array it is declared in, the " +
        "reader meets it as a refusal, and the page's count of its own refusals becomes a false " +
        "statement about the record:",
    ).toEqual([]);
  });

  /**
   * BOTH HALVES OR NEITHER. A refusal states what it cost; a reversal has to
   * state what it cost AND what it bought, because a relaxation with no stated
   * gain is not a decision — it is a rule that turned out to be inconvenient.
   * The shapes that mean "nothing" are refused by name, as they are for the
   * refusals' price.
   */
  it("attaches a real price and a real gain to every reversal", () => {
    const nothing = /^(?:\s*)(?:none|nothing|no cost|n\/?a)\b/i;
    for (const r of METHOD_REVERSALS) {
      expect(r.rule.trim().length, `${r.id} names no rule`).toBeGreaterThan(0);
      expect(r.price.trim().length, `${r.id} states no price`).toBeGreaterThan(40);
      expect(r.bought.trim().length, `${r.id} states no gain`).toBeGreaterThan(40);
      expect(nothing.test(r.price), `${r.id} claims the reversal was free`).toBe(false);
      expect(nothing.test(r.bought), `${r.id} claims the reversal bought nothing`).toBe(false);
    }
  });

  /**
   * THE FINDING AGAINST THE PROJECT MUST BE DATED, AND THE DATE MUST BE REAL
   * (E9/S4 — blueprint E3 asks for the worst finding "dated, with the rule it
   * broke").
   *
   * A date typed into a page is the easiest thing on it to get wrong and the
   * hardest to notice, because nothing else moves when it drifts. So the date
   * has to be traceable: it must appear in the path or the text of one of the
   * documents the finding cites. `docs/endgame-plan-2026-08-07.md` carries it
   * in its filename, which is what makes the claim checkable at all.
   */
  it("dates every finding against something in the record", () => {
    expect(METHOD_FINDINGS.length).toBeGreaterThan(0);
    for (const f of METHOD_FINDINGS) {
      expect(f.date, `${f.id} has a malformed date`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(f.rule.trim().length, `${f.id} names no rule`).toBeGreaterThan(0);
      expect(f.consequence.trim().length, `${f.id} states no consequence`).toBeGreaterThan(40);
      const traceable = f.sources.some(
        (s) => s.path.includes(f.date) || (existsSync(s.path) && readFileSync(s.path, "utf8").includes(f.date)),
      );
      expect(
        traceable,
        `${f.id} is dated ${f.date}, but no document it cites carries that date in its name ` +
          "or its text. A date nothing anchors is the one number on this page that can rot silently.",
      ).toBe(true);
    }
  });

  /**
   * THE HARDEST SENTENCE ON THE PAGE MUST BE MARKED AS MINE (RT-159a).
   *
   * The finding about launch avoidance is quoted from the record. The reading
   * of what happened NEXT — that the project may have removed the requirement
   * it was avoiding — is a reconstruction of the owner's reasoning, which is
   * precisely what RT-159(a) required be marked. If that entry were ever
   * relabelled "quoted", the page would present my inference as the record's
   * own words, on the one claim where the difference matters most.
   */
  it("keeps the reading of the avoidance marked as inference, not record", () => {
    const reading = METHOD_FINDINGS.find((f) => f.id === "finding-avoidance-then-ratified");
    expect(reading, "the inferred reading of the worst finding is gone").toBeDefined();
    expect(reading!.kind).toBe("inferred");
    // ...and the record's own account of the event stays quoted, or the page
    // would be offering an opinion where it has evidence.
    expect(METHOD_FINDINGS.find((f) => f.id === "finding-launch-avoidance")?.kind).toBe("quoted");
  });

  /**
   * NO CLAIM VERIFIES PERFECTLY AND RENDERS NOWHERE (E9/S6).
   *
   * The page shows claims through sections. A claim added to the ledger and
   * never placed in one would pass every check above — real source, real
   * passage, real quotation — and appear to nobody. That is this repository's
   * most repeated near-miss in a new costume: a permalink mount is not a flow
   * mount, and a verified claim is not a rendered one.
   *
   * The reader order is also pinned, because it is a ruled decision (blueprint
   * E1: product manager, business analyst, data analyst, in that order) and
   * nothing else would notice it being shuffled.
   */
  it("places every claim in exactly one section, and no section is empty", () => {
    const placed = METHOD_SECTIONS.flatMap((s) => s.claims);
    const duplicated = placed.filter((id, i) => placed.indexOf(id) !== i);
    expect(duplicated, `these claims appear in more than one section: ${duplicated}`).toEqual([]);

    const orphaned = METHOD_CLAIMS.map((c) => c.id).filter((id) => !placed.includes(id));
    expect(
      orphaned,
      "These claims are in the ledger, fully verified, and render on no page:\n" +
        orphaned.join("\n"),
    ).toEqual([]);

    for (const s of METHOD_SECTIONS) {
      expect(s.claims.length, `section "${s.id}" is empty`).toBeGreaterThan(0);
      expect(s.lede.trim().length, `section "${s.id}" has no lede`).toBeGreaterThan(40);
      // Resolving throws on an unknown id — call it so a typo fails here.
      expect(sectionClaims(s).length).toBe(s.claims.length);
    }
  });

  it("keeps the sections in the ruled reader order", () => {
    expect(METHOD_SECTIONS.map((s) => s.id)).toEqual(["pm", "ba", "da"]);
  });

  it("gives every claim a unique id and at least one source", () => {
    const ids = verifiableEntries().map((c) => c.id);
    expect(new Set(ids).size, `duplicate ids: ${ids.join(", ")}`).toBe(ids.length);
    for (const c of verifiableEntries()) {
      expect(c.sources.length, `${c.id} cites nothing`).toBeGreaterThan(0);
      expect(c.text.trim().length, `${c.id} has no text`).toBeGreaterThan(0);
    }
  });

  it("cites only files the repository actually contains", () => {
    const bad = verifiableEntries().flatMap((c) =>
      c.sources
        .filter((s) => !existsSync(s.path) || !tracked.has(s.path))
        .map((s) => `${c.id} -> ${s.path} (${existsSync(s.path) ? "untracked" : "missing"})`),
    );
    expect(
      bad,
      "A reader who clones this repository cannot open these, so the page would cite " +
        "evidence that does not travel with it:\n" + bad.join("\n"),
    ).toEqual([]);
  });

  /**
   * "QUOTED" MUST MEAN THE READER SEES THE QUOTATION (E9/S2, found red-teaming
   * this file).
   *
   * Everything else here verifies the SOURCE end of the citation: the passage
   * is in the document. Nothing checked the PAGE end. A claim could be labelled
   * quoted, cite a real passage, and render a sentence that paraphrased it
   * loosely — or misquoted it — and the whole suite would stay green while the
   * page showed a stranger something the record does not say. That is the exact
   * failure this ledger exists to prevent, one step further along.
   *
   * So a quoted claim must carry its own quotation in the sentence it renders.
   * Inferred claims are exempt by design: their text is a reading of the
   * evidence, which is what the visible marking tells the reader.
   *
   * Case-insensitive, because a quotation legitimately gets lower-cased when it
   * is folded into the middle of a sentence. No WORD may differ.
   */
  it("makes a quoted claim actually contain its quotation", () => {
    const bad = verifiableEntries().filter((c) => c.kind === "quoted").filter(
      (c) =>
        !c.sources.some((s) => flat(c.text).toLowerCase().includes(flat(s.anchor).toLowerCase())),
    );
    expect(
      bad.map((c) => `${c.id}\n      renders: "${flat(c.text)}"\n      cites:   "${flat(c.sources[0].anchor)}"`),
      "These are labelled quoted, but the sentence the reader sees does not contain the " +
        "passage that was verified. Either quote it, or mark the claim inferred:",
    ).toEqual([]);
  });

  it("finds every cited passage in the file it names", () => {
    const cache = new Map<string, string>();
    const read = (p: string) => {
      if (!cache.has(p)) cache.set(p, flat(readFileSync(p, "utf8")));
      return cache.get(p)!;
    };
    const missing: string[] = [];
    for (const c of verifiableEntries()) {
      for (const s of c.sources) {
        if (!existsSync(s.path)) continue; // reported by the check above
        if (!read(s.path).includes(flat(s.anchor))) {
          missing.push(`${c.id}\n      in ${s.path}\n      wanted: "${flat(s.anchor)}"`);
        }
      }
    }
    expect(
      missing,
      "These passages are no longer in the documents the page cites. Either the source " +
        "was reworded — update the anchor deliberately — or the claim is now unsupported " +
        "and must come off the page:\n" + missing.join("\n"),
    ).toEqual([]);
  });
});

/**
 * PROVEN IN BOTH DIRECTIONS. A verifier that has only ever returned "clean" is
 * not known to check anything — the rule this repository has re-learned at the
 * rung tables, the damage field, the retired gates, and twice already in this
 * session. The specimens run through the SAME functions the real check uses.
 */
describe("the verifier catches what it exists to catch", () => {
  const check = (claim: MethodClaim): string[] => {
    const out: string[] = [];
    for (const s of claim.sources) {
      if (!existsSync(s.path) || !tracked.has(s.path)) out.push("unciteable-source");
      else if (!flat(readFileSync(s.path, "utf8")).includes(flat(s.anchor)))
        out.push("anchor-not-found");
    }
    return out;
  };

  const real = METHOD_CLAIMS[0];

  it("passes a claim whose passage is really there", () => {
    expect(check(real)).toEqual([]);
  });

  it("catches a passage that has drifted by one word", () => {
    const drifted = {
      ...real,
      sources: [{ ...real.sources[0], anchor: real.sources[0].anchor.replace(/\bcost\b/, "price") }],
    };
    expect(check(drifted)).toContain("anchor-not-found");
  });

  it("catches a citation to a file that is not in the repository", () => {
    expect(
      check({ ...real, sources: [{ path: "docs/no-such-document.md", anchor: "anything" }] }),
    ).toContain("unciteable-source");
  });

  /**
   * The specimen that motivated the tracked-file rule: a real, correct,
   * readable document that exists on this machine and is not in the repository.
   *
   * WRITTEN BY THE TEST, NOT BORROWED (2026-09-24). The first specimen was
   * docs/redirection-blueprint-2026-08-26.md, a document untracked on purpose —
   * so it exists only on the owner's machine, and on a fresh clone this test
   * failed for everybody else, a reviewer running the suite included. The
   * pre-push gate never saw it, because it runs where the file is.
   */
  it("catches a citation to a real but untracked file", () => {
    const dir = mkdtempSync(join(tmpdir(), "claims-specimen-"));
    const untracked = join(dir, "redirection-blueprint.md").split("\\").join("/");
    try {
      writeFileSync(untracked, "# Redirection Blueprint\n\nA real document, correct and readable, not in the repository.\n");
      expect(existsSync(untracked)).toBe(true);
      expect(tracked.has(untracked)).toBe(false);
      const found = check({ ...real, sources: [{ path: untracked, anchor: "Redirection Blueprint" }] });
      expect(found).toContain("unciteable-source");
      // The anchor IS in the file: what the rule catches is where it lives, not what it says.
      expect(flat(readFileSync(untracked, "utf8")).includes(flat("Redirection Blueprint"))).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("reads across a line break, because the documents hard-wrap", () => {
    // A passage from CLAUDE.md that is split by a newline in the file itself.
    const wrapped = {
      ...real,
      sources: [
        {
          path: "CLAUDE.md",
          anchor: "Close only when you have a named,\nspecific reason",
        },
      ],
    };
    expect(check(wrapped)).toEqual([]);
  });
});

/**
 * THE PAGE DESCRIBES THE WORK, NEVER THE PEOPLE (Phase 3, Q2, 2026-09-13).
 *
 * `/method` shipped a block quoting the constitution's words "they are newer to
 * engineering" for two weeks. Every guard in this file passed it — the
 * quotation was real, the anchor resolved, the claim was faithful. It was still
 * wrong on the page, because a quotation about a DOCUMENT's instruction reads
 * to a stranger as a verdict on a PERSON, on the page a reader uses to decide
 * how much to trust everything else here.
 *
 * THE GENERAL RULE CANNOT BE TESTED and pretending otherwise would be worse
 * than this. What is testable is the specific characterisation that shipped,
 * and the ones nearest to it. A phrase list is a weak guard; it is the same
 * shape as the paid-tier one, and it exists so that putting this back takes a
 * deliberate act rather than a careless quotation.
 */
/**
 * AND THE CONSTITUTION'S OWN CHARACTERISATION IS WITHDRAWN, NOT JUST HIDDEN
 * (E21, PM ruling RT-Z11 (a)).
 *
 * The describe below stops the PAGE printing somebody's level of expertise. It
 * was passing while `CLAUDE.md` — tracked, public, and the document the page
 * cites most — still carried the sentence in its Roles section. A rule that
 * only suppresses the rendering of a claim the repository still makes is a
 * rule about display, and this project's own finding is that a repository
 * disagreeing with itself is a defect a reader can find.
 *
 * So the constitution carries a dated withdrawal, kept beside the original
 * rather than replacing it (the file is append-only), and the withdrawal has
 * to state the rule that replaced it. Removing the stamp fails here.
 */
describe("the constitution withdraws the characterisation it recorded", () => {
  const constitution = readFileSync("CLAUDE.md", "utf8");

  it("read a real constitution", () => {
    expect(constitution.length, "CLAUDE.md is missing or empty").toBeGreaterThan(10000);
    expect(
      constitution.indexOf("## Roles"),
      "CLAUDE.md has no Roles section, so this checks nothing",
    ).toBeGreaterThan(-1);
  });

  it("stamps the clause and states the rule that replaced it", () => {
    const roles = constitution.slice(
      constitution.indexOf("## Roles"),
      constitution.indexOf("## What we're building"),
    );
    expect(roles.length, "the Roles section is empty").toBeGreaterThan(200);
    expect(
      roles,
      "the Roles clause naming someone's level of expertise carries no withdrawal. The original stays " +
        "— this file is append-only — but a reader meeting it unqualified is told a characterisation " +
        "the product refuses to print anywhere else.",
    ).toContain("RT-Z11 (a)");
    expect(
      roles,
      "the withdrawal does not say what rule replaced it. A repeal with no replacement leaves the " +
        "next session guessing at what is actually in force.",
    ).toContain("The rule in force");
    expect(
      roles.toLowerCase(),
      "the replacement rule does not say it binds the engineer, which is the whole substance of the " +
        "ruling: the constraint is on how the writer writes, not on what the reader knows.",
    ).toContain("enforced against the engineer");
  });
});

describe("the method page characterises no one", () => {
  const CHARACTERISATIONS = [
    "newer to engineering",
    "not an engineer",
    "is not technical",
    "non-technical",
    "lacks the background",
  ];

  it("names no person's level of expertise", () => {
    const rendered = [
      ...METHOD_CLAIMS.map((c) => c.text),
      ...METHOD_REFUSALS.flatMap((r) => [r.what, r.refusal, r.price]),
      ...METHOD_FINDINGS.flatMap((f) => [f.finding, f.consequence]),
      // E21/S5: the reversal is a new surface on this page and the rule is
      // about the PAGE, not about one array. A guard scoped to the ledgers that
      // existed when it was written stops covering the page the moment the page
      // grows — which is how two whole modules came to sit outside the copy
      // census in E18.
      ...METHOD_REVERSALS.flatMap((r) => [r.what, r.reversal, r.bought, r.price]),
    ];
    expect(rendered.length, "the ledger is empty, so this checks nothing").toBeGreaterThan(10);
    const found: string[] = [];
    for (const text of rendered) {
      const flat = text.toLowerCase();
      for (const phrase of CHARACTERISATIONS) {
        if (flat.indexOf(phrase) !== -1) found.push(`"${phrase}" in: ${text.slice(0, 72)}`);
      }
    }
    expect(
      found,
      "this page states someone's level of expertise. Even as a faithful quotation it renders as a " +
        "verdict on a person, on the page a reader uses to weigh everything else on the site. Quote " +
        "the instruction, not the characterisation:",
    ).toEqual([]);
  });
});

