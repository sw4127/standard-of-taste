/**
 * THE PRODUCT HAS ONE NAME (PM ruling RT-N1 a, 2026-09-13).
 *
 * IT HAD THREE. The repository, the README and the published summary page said
 * "Standard of Taste"; the app itself said "The Taste Gym", including in the
 * browser-tab title of the summary page. Nothing checked, so nothing said —
 * and it stopped being harmless the day the owner put the repository URL on a
 * résumé, because a reader clicking a link labelled one thing arrived at
 * something calling itself another.
 *
 * WHY A GUARD AND NOT A SWEEP. The sweep is the easy half and it is done. What
 * a sweep cannot do is stop the next page, share card or metadata block being
 * written with the old name by someone reading an old file for an example —
 * which is exactly how it spread to fifty-four places the first time.
 *
 * THE RECORD IS NOT SWEPT, and must not be. Handoffs, decision memos and the
 * falsified registry describe what was true when they were written; rewriting
 * them to match today is the dishonesty this project refuses everywhere else.
 * They are outside the roster rather than exempted inside it.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";

const NL = String.fromCharCode(10);

/** The name that was retired, in the two casings it shipped in. */
const RETIRED = ["The Taste Gym", "THE TASTE GYM"];

/** The name it was replaced by, asserted present so this is not one-sided. */
const CURRENT = "Standard of Taste";

/** Everything a stranger can read, derived rather than listed. */
function userFacing(): string[] {
  const out: string[] = ["docs/index.html", "README.md", "public/llms.txt", "public/llms-full.txt"];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const path = dir + "/" + name;
      if (statSync(path).isDirectory()) walk(path);
      else if (name.endsWith(".ts") || name.endsWith(".tsx")) out.push(path);
    }
  };
  walk("src");
  return out;
}

describe("the product has one name", () => {
  const files = userFacing();

  it("reads a real corpus, so nothing below passes vacuously", () => {
    expect(files.length).toBeGreaterThan(100);
    const carrying = files.filter((p) => readFileSync(p, "utf8").indexOf(CURRENT) !== -1);
    expect(
      carrying.length,
      `no file says "${CURRENT}" — either the roster is wrong or the rename did not happen`,
    ).toBeGreaterThan(10);
  });

  /*
   * COMMENTS ARE NOT USER-FACING, and stripping them is the rule rather than a
   * convenience. `legal-updated.ts` carries a docblock explaining that the
   * fingerprint moved because the product was renamed — it has to name the old
   * name to say that, and a guard that forbade it would be forbidding the
   * project from recording its own history in the place a maintainer reads.
   * That is the same reason the handoffs and the falsified registry are outside
   * the roster entirely.
   */
  const withoutComments = (source: string) => {
    let out = "";
    let i = 0;
    while (i < source.length) {
      if (source[i] === "/" && source[i + 1] === "*") {
        const end = source.indexOf("*/", i + 2);
        i = end === -1 ? source.length : end + 2;
        continue;
      }
      out += source[i];
      i += 1;
    }
    return out
      .split(NL)
      .filter((line) => !line.trim().startsWith("//"))
      .join(NL);
  };

  it("uses the retired name nowhere a reader can reach", () => {
    const found: string[] = [];
    for (const path of files) {
      // This file's own needles are the rule, not a use of it.
      if (path === "src/content/one-name.test.ts") continue;
      const text = withoutComments(readFileSync(path, "utf8"));
      for (const name of RETIRED) {
        if (text.indexOf(name) !== -1) found.push(`${path}  ("${name}")`);
      }
    }
    expect(
      found,
      `the product is called "${CURRENT}" (RT-N1 a). These still carry the retired name, so a ` +
        "reader arriving from the repository or a résumé meets a second one:" + NL + found.join(NL),
    ).toEqual([]);
  });
});
