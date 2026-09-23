/**
 * THE PRD ACCOUNTS FOR EVERY ROUTE, OR SAYS WHY NOT (E20, PRD part 1).
 *
 * Criterion 1 of `docs/task-prd.md`: every route under `src/app` appears as at
 * least one use case, or is explicitly listed as out of scope with a reason. A
 * PRD that quietly omits a route is the document failing at the one thing it is
 * for — telling engineering, QA and support what the product does.
 *
 * THE ROUTE LIST IS WALKED, NEVER TYPED. A roster of routes typed into a
 * document is a roster of the routes somebody remembered; this repository has
 * paid for that three times, most recently when a guard's file list was page
 * components only and twenty-three stated quantities sat outside it.
 *
 * WHAT IT CANNOT CHECK: whether a use case is well written, whether its label
 * is honest, or whether anyone wants it. It checks coverage. The EVIDENCED /
 * ASSUMED split is a judgment and is defended in the document, not here.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";

const NL = String.fromCharCode(10);
const PRD = "docs/prd-1-use-cases.md";

/** Directories under src/app that are not user-facing routes. */
const NOT_ROUTES = ["api", "icons"];

function routes(dir = "src/app", prefix = ""): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = dir + "/" + name;
    if (statSync(path).isDirectory()) {
      if (NOT_ROUTES.indexOf(name) !== -1) continue;
      out.push(...routes(path, prefix + "/" + name));
    } else if (name === "page.tsx") {
      out.push(prefix || "/");
    }
  }
  return out;
}

describe("the PRD covers every route", () => {
  const prd = readFileSync(PRD, "utf8");
  const all = routes();

  it("walked a real route tree and read a real document", () => {
    expect(all.length, "no routes found, so this checks nothing").toBeGreaterThan(20);
    expect(prd.length).toBeGreaterThan(3000);
  });

  it("names every route, as a use case or as out of scope", () => {
    const missing = all.filter((route) => prd.indexOf("`" + route + "`") === -1);
    expect(
      missing,
      "these routes render a page and the PRD does not mention them. A document that silently omits " +
        "a route is failing at the one job it has — saying what the product does:" + NL +
        missing.join(NL),
    ).toEqual([]);
  });

  it("states its evidenced-to-assumed ratio rather than burying it", () => {
    /*
     * COUNTED IN TABLE ROWS ONLY. The first version matched the whole document
     * and counted the LEGEND — the paragraph that defines what EVIDENCED and
     * ASSUMED mean — so it read 4 and 15 where the tables hold 3 and 14, and
     * reported the document's summary as wrong when the summary was right. A
     * guard that miscounts is worse than none: it teaches the next person that
     * the document is unreliable.
     */
    const rows = prd.split(NL).filter((line) => line.startsWith("|"));
    const evidenced = rows.filter((line) => line.indexOf("**EVIDENCED**") !== -1).length;
    const assumed = rows.filter((line) => line.indexOf("**ASSUMED**") !== -1).length;
    expect(evidenced, "no use case is labelled EVIDENCED").toBeGreaterThan(0);
    expect(assumed, "no use case is labelled ASSUMED").toBeGreaterThan(0);
    // The count in the prose must match the labels in the tables.
    expect(
      prd.indexOf(`${wordFor(evidenced)} EVIDENCED, ${assumed} ASSUMED`) !== -1 ||
        prd.indexOf(`${evidenced} EVIDENCED, ${assumed} ASSUMED`) !== -1,
      `the document labels ${evidenced} use cases EVIDENCED and ${assumed} ASSUMED, and its summary ` +
        "does not say so. The ratio is the most useful line in the document and the easiest to let " +
        "drift once cases are added.",
    ).toBe(true);
  });
});

/** Small words only — the summary spells the evidenced count. */
/**
 * DERIVED FROM THE BLUEPRINT, AND THE COUNT DERIVED FROM THE WALK (blueprint Part 8).
 *
 * The first version of this PRD walked the routes and wrote a use case for
 * each, so it described what was built rather than what the blueprint asked
 * for. The re-derivation makes two promises and these hold them: every use case
 * names the BP statement it serves, and the sentence that counts the routes is
 * computed here from the walk and the document's own sections — a route serving
 * a use case, serving no BP statement, or out of scope, each exactly once.
 */
describe("the PRD is derived from the blueprint", () => {
  const prd = readFileSync(PRD, "utf8");
  const all = routes();
  const sections = prd.split(NL + "## ").slice(1);
  const routesIn = (text: string) => [...text.matchAll(/`(\/[^`\s]*)`/g)].map((m) => m[1]).filter((r) => all.includes(r));
  const bucket = (pred: (heading: string) => boolean) =>
    new Set(sections.filter((sec) => pred(sec.split(NL)[0])).flatMap((sec) => routesIn(sec)));
  const noBp = bucket((h) => /serve no BP statement/.test(h));
  const outOfScope = bucket((h) => /^Out of scope/.test(h));
  const useCase = bucket((h) => !/serve no BP statement|^Out of scope|^How to read|^What this part/.test(h));

  it("names a BP statement in every use case", () => {
    const rows = prd.split(NL).filter((l) => l.startsWith("| **UC-"));
    expect(rows.length, "no use-case rows found").toBeGreaterThanOrEqual(10);
    expect(rows.filter((r) => !/\bBP-[A-Z]/.test(r)).map((r) => r.slice(0, 60))).toEqual([]);
  });

  it("places every route in exactly one bucket", () => {
    const placed = all.map((r) => [r, [useCase.has(r), noBp.has(r), outOfScope.has(r)].filter(Boolean).length] as const);
    expect(placed.filter(([, n]) => n !== 1).map(([r, n]) => `${r} in ${n} buckets`)).toEqual([]);
  });

  it("states the route count the walk finds, bucket by bucket", () => {
    const sentence = `That is ${all.length} routes: ${useCase.size} serving a use case, ${noBp.size} serving no BP statement, ${outOfScope.size} out of scope.`;
    expect(prd, `the count sentence should read: ${sentence}`).toContain(sentence);
  });
});

function wordFor(n: number): string {
  return ["zero", "one", "two", "three", "four", "five", "six", "seven"][n] ?? String(n);
}
