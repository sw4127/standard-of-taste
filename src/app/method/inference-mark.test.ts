import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { METHOD_CLAIMS, METHOD_FINDINGS, METHOD_REFUSALS } from "@/content/method/claims";

/**
 * THE INFERENCE MARKING CANNOT BE DROPPED (E9/S5 — RT-159a's condition).
 *
 * `/method` was approved ON CONDITION that inference be marked wherever the
 * owner's reasoning is reconstructed rather than quoted. `claims.test.ts`
 * already pins the DATA side: the entry that carries the hardest reading on the
 * page must keep `kind: "inferred"`. Nothing pinned the PAGE side. A refactor
 * that dropped one conditional would leave the field intact, the suite green,
 * and an inference rendered to a stranger as if it came from the record.
 *
 * That is the same shape as every other near-miss in this repository: the guard
 * looking at part of the room. So this checks the other part.
 *
 * WHAT IT ACTUALLY PROVES, stated plainly: that the page's source renders the
 * mark conditionally for every ledger it lists, and that the collections it
 * lists are the collections that exist. It is a source-text check — it cannot
 * prove the mark is visible, legible, or positioned before the passage it
 * qualifies. Those were verified by reading the rendered DOM (E9/S5: one mark,
 * at paragraph index 1 of the inferred block, ahead of the passage) and there
 * is no automated substitute for it here.
 */

const PAGE = "src/app/method/page.tsx";
const source = readFileSync(PAGE, "utf8");

/**
 * Every collection the page maps over, the loop variable it binds, and the
 * field that holds its prose.
 *
 * THIS LIST WENT STALE WITHIN ONE SLICE (E9/S6). It named two collections; the
 * page then grew a third — the claims, rendered through the sections — and the
 * guard would have passed while an inferred claim in that list rendered
 * unmarked. That is the identical failure this file was written to catch, in
 * the file written to catch it. The `covers every collection the page renders`
 * test below now holds the list to the page, so it cannot silently fall behind
 * again.
 */
const RENDERED = [
  { collection: "METHOD_SECTIONS", mapExpr: "sectionClaims(section).map(", binding: "c", prose: "text", entries: METHOD_CLAIMS.length },
  { collection: "METHOD_REFUSALS", mapExpr: "METHOD_REFUSALS.map(", binding: "r", prose: "refusal", entries: METHOD_REFUSALS.length },
  { collection: "METHOD_FINDINGS", mapExpr: "METHOD_FINDINGS.map(", binding: "f", prose: "finding", entries: METHOD_FINDINGS.length },
];

describe("the /method page marks every inference it renders", () => {
  it("renders every ledger, and each is non-empty", () => {
    for (const { collection, mapExpr, entries } of RENDERED) {
      expect(source.includes(mapExpr), `${PAGE} does not render ${collection}`).toBe(true);
      expect(entries, `${collection} is empty, so the page shows nothing`).toBeGreaterThan(0);
    }
  });

  /**
   * THE LIST ABOVE MUST NOT FALL BEHIND THE PAGE. Every `.map(` in the page is
   * either one this file knows about, or a plain array literal that carries no
   * ledger entries (the source-path list inside `Sources`). A new ledger
   * rendered without being added here fails, rather than passing unchecked.
   */
  it("covers every collection the page renders", () => {
    /**
     * Maps that carry no ledger entry, each allowed for a stated reason. Both
     * were found by this test on its first run, which is the point of it.
     */
    const NON_LEDGER = [
      // The section wrappers. The CLAIMS inside them come from
      // `sectionClaims(section).map(`, which is in RENDERED and carries the mark.
      "METHOD_SECTIONS.map(",
      // Inside <Sources>: de-duplicating the cited paths, then listing them.
      // Both are strings, not ledger entries.
      "Set(sources.map(",
      "paths.map(",
    ];
    const known = [...RENDERED.map((r) => r.mapExpr), ...NON_LEDGER];
    const maps = [...source.matchAll(/[\w.()]+\.map\(/g)].map((m) => m[0]);
    const unknown = [...new Set(maps)].filter((m) => !known.includes(m));
    expect(
      unknown,
      `${PAGE} maps over something this guard does not know about. If it renders ledger ` +
        "entries, add it to RENDERED so its inferred entries must be marked:\n" + unknown.join("\n"),
    ).toEqual([]);
  });

  it("guards each rendered ledger with the inference mark", () => {
    for (const { collection, binding } of RENDERED) {
      const guard = `${binding}.kind === "inferred" ? <InferenceMark />`;
      expect(
        source.includes(guard),
        `${PAGE} maps over ${collection} but has no "${guard}". An inferred entry in that ` +
          "list would render as though the record said it, which is the one condition this " +
          "page was approved under (RT-159a).",
      ).toBe(true);
    }
  });

  /**
   * The mark must sit BEFORE the passage. On the first render it was placed
   * after the prose, so a reader absorbed the inference as record and was told
   * afterwards — a disclosure that arrives late is not a disclosure. Checked by
   * position in the source, which is document order for this markup.
   */
  it("places the mark ahead of the passage it qualifies, not after it", () => {
    for (const { binding, prose: proseField } of RENDERED) {
      const mark = source.indexOf(`${binding}.kind === "inferred" ? <InferenceMark />`);
      const prose = source.indexOf(`{${binding}.${proseField}}`);
      expect(mark, `no mark found for "${binding}"`).toBeGreaterThan(-1);
      expect(prose, `no passage found for "${binding}"`).toBeGreaterThan(-1);
      expect(mark, `the mark for "${binding}" renders after the passage it qualifies`).toBeLessThan(
        prose,
      );
    }
  });

  /**
   * The label names a ROLE, not a person (RT-V:a — the page carries no byline).
   * "My reading" on an unsigned page leaves the reader guessing whose reading
   * it is, which is exactly the ambiguity the mark exists to remove.
   */
  it("attributes the inference to a role rather than an unnamed 'my'", () => {
    const label = source.match(/Inference[^<]*/)?.[0] ?? "";
    expect(label.length, "the inference label is gone").toBeGreaterThan(10);
    expect(/\bmy\b/i.test(label), `the label says "my" on a page with no byline: ${label}`).toBe(
      false,
    );
  });
});
