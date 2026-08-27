import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { METHOD_FINDINGS, METHOD_REFUSALS } from "@/content/method/claims";

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

/** Every ledger the page maps over, and the loop variable it binds. */
const RENDERED = [
  { collection: "METHOD_REFUSALS", binding: "r", entries: METHOD_REFUSALS.length },
  { collection: "METHOD_FINDINGS", binding: "f", entries: METHOD_FINDINGS.length },
];

describe("the /method page marks every inference it renders", () => {
  it("renders both ledgers, and each is non-empty", () => {
    for (const { collection, entries } of RENDERED) {
      expect(source.includes(`${collection}.map(`), `${PAGE} does not render ${collection}`).toBe(
        true,
      );
      expect(entries, `${collection} is empty, so the page shows nothing`).toBeGreaterThan(0);
    }
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
    for (const { binding } of RENDERED) {
      const mark = source.indexOf(`${binding}.kind === "inferred" ? <InferenceMark />`);
      const prose = source.indexOf(`{${binding}.${binding === "r" ? "refusal" : "finding"}}`);
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
