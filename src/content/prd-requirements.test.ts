/**
 * EVERY REQUIREMENT CITES SOMETHING THAT EXISTS (E20, PRD part 3).
 *
 * WHY THIS IS THE CRITERION THAT MATTERS. A PRD normally precedes the build and
 * can only assert. This one follows a working product, so every functional
 * requirement can name the exported symbol that implements it — and a citation
 * is checkable where a description is not. Criterion 3 of `docs/task-prd.md`
 * exists for that reason, and without this test it would be a promise the
 * document makes about itself.
 *
 * IT CHECKS THE CITATION, NOT THE REQUIREMENT. Whether FR-2.3 describes the
 * delicacy band correctly is a judgment; whether `detectionBand` is exported
 * from `src/engine/delicacy.ts` is a fact. Only the fact is testable, and
 * pretending otherwise would be the document marking its own homework.
 *
 * THE PAIRS ARE READ FROM THE DOCUMENT, never typed here. A list of citations
 * maintained beside the PRD is a second copy that drifts — this repository has
 * paid for that at the rung table, the window plan and the damage field.
 */
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const NL = String.fromCharCode(10);
const TICK = String.fromCharCode(96);
const PRD = "docs/prd-3-requirements.md";

interface Citation {
  symbol: string;
  file: string;
}

/**
 * Every "`symbol` in `path`" pair the document makes, and every symbol named in
 * a "Computed by" row, which is where the instrument-level claims live.
 */
function citations(doc: string): Citation[] {
  const out: Citation[] = [];
  const code = new RegExp(TICK + "([A-Za-z_][A-Za-z0-9_]*)" + TICK, "g");
  const path = new RegExp(TICK + "(src/[A-Za-z0-9_/.-]+\\.ts)" + TICK);
  for (const line of doc.split(NL)) {
    const file = path.exec(line);
    if (!file) continue;
    for (const hit of line.matchAll(code)) {
      const symbol = hit[1];
      // Skip the path's own capture and obvious prose words in backticks.
      if (symbol.indexOf("/") !== -1 || symbol.indexOf(".") !== -1) continue;
      out.push({ symbol, file: file[1] });
    }
  }
  return out;
}

describe("the PRD cites only symbols that exist", () => {
  const doc = readFileSync(PRD, "utf8");
  const cited = citations(doc);

  it("found citations to check, so nothing below passes vacuously", () => {
    expect(cited.length, "the PRD names no symbol in any source file").toBeGreaterThan(8);
    const files = new Set(cited.map((c) => c.file));
    expect(files.size, "every citation points at one file — the parse is probably wrong").toBeGreaterThan(3);
  });

  it("points every citation at a file that exists", () => {
    const missing = [...new Set(cited.map((c) => c.file))].filter((f) => !existsSync(f));
    expect(
      missing,
      "the PRD cites these files and they are not in the repository:" + NL + missing.join(NL),
    ).toEqual([]);
  });

  it("names only symbols the cited file actually exports", () => {
    const wrong: string[] = [];
    for (const { symbol, file } of cited) {
      if (!existsSync(file)) continue;
      const source = readFileSync(file, "utf8");
      const exported =
        source.indexOf("export function " + symbol) !== -1 ||
        source.indexOf("export const " + symbol) !== -1 ||
        source.indexOf("export type " + symbol) !== -1 ||
        source.indexOf("export interface " + symbol) !== -1;
      if (!exported) wrong.push(`${symbol} is not exported from ${file}`);
    }
    expect(
      wrong,
      "a requirement cites a symbol its file does not export. The whole value of writing this PRD " +
        "after the build is that its claims can be checked instead of trusted:" + NL + wrong.join(NL),
    ).toEqual([]);
  });
});
