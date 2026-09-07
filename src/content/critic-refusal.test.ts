/**
 * ONE WORDING OF A CONSTITUTIONAL REFUSAL (E19/S14, PM ruling RT-X1 a).
 *
 * Cowork's batch-2 return found the same argument written four times in four
 * wordings. `/learn/comparison` is now the record and the others cite it. This
 * stops a fifth wording appearing — which is the actual risk, because nothing
 * about writing a new page reminds anyone that this sentence already exists
 * somewhere else.
 *
 * DERIVED FROM THE SOURCES, NOT FROM A LIST OF PAGES. A roster of "the pages
 * that make this argument" is exactly the artefact that cannot see the fifth
 * one. Every user-facing source is scanned; any that argues the contradiction
 * has to do it through the constant.
 *
 * NO REGEX ANYWHERE IN HERE. The transport eats one level of escaping, and this
 * session has now shipped two guards that quietly matched nothing for that
 * reason. Substring tests only.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CRITIC_CONTRADICTION } from "./critic-refusal";

const NL = String.fromCharCode(10);
const MODULE = "src/content/critic-refusal.ts";

function sourcesUnder(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = dir + "/" + name;
    if (statSync(path).isDirectory()) out.push(...sourcesUnder(path));
    else if (name.endsWith(".tsx") || (name.endsWith(".ts") && !name.endsWith(".test.ts"))) {
      out.push(path);
    }
  }
  return out;
}

/** Comments discuss the rule; only rendered prose states it. */
function stripComments(text: string): string {
  let out = "";
  let i = 0;
  while (i < text.length) {
    if (text[i] === "/" && text[i + 1] === "*") {
      const end = text.indexOf("*/", i + 2);
      i = end === -1 ? text.length : end + 2;
      continue;
    }
    out += text[i];
    i += 1;
  }
  return out.split(NL).filter((line) => !line.trim().startsWith("//")).join(NL);
}

const FILES = [...sourcesUnder("src/app"), ...sourcesUnder("src/components")].filter(
  (path) => path !== MODULE,
);

describe("the refusal to score you against a critic", () => {
  it("found sources to scan, so nothing below passes vacuously", () => {
    expect(FILES.length).toBeGreaterThan(20);
    expect(CRITIC_CONTRADICTION.length).toBeGreaterThan(60);
  });

  it("is rendered by more than one page, through the one constant", () => {
    const citing = FILES.filter((path) => readFileSync(path, "utf8").indexOf("CRITIC_CONTRADICTION") !== -1);
    expect(
      citing.length,
      "no page cites the canonical refusal, so the constant is dead and the argument is being " +
        "made some other way",
    ).toBeGreaterThan(2);
  });

  /**
   * THE DEFECT ITSELF. A page that argues the contradiction in its own words is
   * a fifth wording, and the reader who meets the softened one has been told
   * something the product does not mean.
   */
  it("is never argued in a page's own words", () => {
    const restated: string[] = [];
    for (const path of FILES) {
      const prose = stripComments(readFileSync(path, "utf8"));
      if (prose.indexOf("CRITIC_CONTRADICTION") !== -1) continue;
      const flat = prose.split(NL).join(" ").toLowerCase();
      // The argument is: rewarding agreement would contradict the product.
      const argues =
        flat.indexOf("contradict") !== -1 &&
        (flat.indexOf("agree") !== -1 || flat.indexOf("reward") !== -1);
      if (argues) restated.push(path);
    }
    expect(
      restated,
      "these pages make the critic-agreement argument in their own words instead of citing " +
        "CRITIC_CONTRADICTION. Four wordings were four chances for one to soften:" + NL +
        restated.join(NL),
    ).toEqual([]);
  });
});
