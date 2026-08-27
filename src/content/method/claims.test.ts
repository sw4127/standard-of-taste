import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { METHOD_CLAIMS, METHOD_REFUSALS, verifiableEntries, type MethodClaim } from "./claims";

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
   */
  it("catches a citation to a real but untracked file", () => {
    const untracked = "docs/redirection-blueprint-2026-08-26.md";
    expect(existsSync(untracked), "specimen missing — pick another untracked doc").toBe(true);
    expect(tracked.has(untracked), "specimen is tracked now — the rule needs a new specimen").toBe(
      false,
    );
    expect(check({ ...real, sources: [{ path: untracked, anchor: "Redirection Blueprint" }] })).toContain(
      "unciteable-source",
    );
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
