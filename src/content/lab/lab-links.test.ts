/**
 * A LINK IS A CLAIM (E15/S8).
 *
 * E15/S4 shipped `href="/forget"` — a route that has never existed; the control
 * lives on `/legal`. It was written from memory, it type-checked, it built, and
 * every test passed. I found it by grepping the app tree on a hunch, which is
 * not a process.
 *
 * So the Lab's internal links are checked against the route tree. This is a
 * static check rather than a crawl: it reads the hrefs out of the page sources
 * and asserts each one corresponds to a directory under `src/app` holding a
 * `page.tsx`. That catches the whole class — a link to somewhere that is not a
 * page — without needing a server running in CI.
 *
 * FRAGMENTS ARE CHECKED FROM THE DATA, NOT FROM THE SOURCE TEXT. A `#metric-x`
 * pointing at a metric nobody defines lands silently at the top of the page —
 * broken to a reader, fine to any check that only looks at the path. Those
 * links are built at render time from the lineage rows, so the rows are what
 * gets checked; scanning source text for them found nothing at all, which is
 * how the first version of that test passed while guarding nothing.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { metricIds } from "./metrics";
import { LIVE_PANELS } from "./panels";
import { LINEAGE } from "./event-schema";

/** Every `href="/..."` literal in the Lab's pages. */
function labHrefs(): { file: string; href: string }[] {
  const out: { file: string; href: string }[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (entry.name !== "page.tsx" && entry.name !== "layout.tsx") continue;
      const src = readFileSync(full, "utf8");
      for (const m of src.matchAll(/href="(\/[^"]*)"/g)) {
        out.push({ file: full.replace(/\\/g, "/"), href: m[1] });
      }
    }
  };
  walk("src/app/lab");
  return out;
}

/** Does a path correspond to a real App Router page? */
function isRoute(path: string): boolean {
  if (path === "/") return existsSync("src/app/page.tsx");
  const dir = join("src/app", path.replace(/^\//, ""));
  return existsSync(join(dir, "page.tsx")) || existsSync(join(dir, "route.ts"));
}

describe("E15/S8 — every link the Lab prints goes somewhere", () => {
  it("finds hrefs at all, or this test is vacuous", () => {
    expect(labHrefs().length).toBeGreaterThan(4);
  });

  it("points every internal link at a page that exists", () => {
    const broken = labHrefs()
      .filter(({ href }) => !isRoute(href.split("#")[0] || "/"))
      .map(({ file, href }) => `${file} → ${href}`);
    expect(broken, "these links go nowhere — a link is a claim").toEqual([]);
  });

  /**
   * THE FIRST VERSION OF THIS TEST CHECKED NOTHING.
   *
   * It scanned source text for `#metric-` inside a literal `href="..."`. The
   * links it was written for are built at render time —
   * `` href={`/lab#metric-${row.metricId}`} `` — so the scan matched zero
   * strings and the test passed by having nothing to look at. Proven by
   * pointing one of those links at a metric that does not exist and watching it
   * stay green.
   *
   * It now checks the DATA those fragments are generated from, and asserts it
   * actually found some, because a vacuous guard is worse than no guard: it
   * occupies the space where a real one would go.
   */
  it("points every metric fragment at a metric that is defined", () => {
    const ids = new Set(metricIds());
    const targets = LINEAGE.map((r) => r.metricId).filter((id): id is string => id !== null);
    expect(targets.length, "no lineage row links to a metric — nothing was checked").toBeGreaterThan(0);
    const dangling = targets.filter((id) => !ids.has(id));
    expect(dangling, "these fragments land at the top of the page instead").toEqual([]);
    // The needle must see the thing it forbids.
    expect(ids.has("not_a_real_metric")).toBe(false);
  });

  it("gives every live panel a route that exists", () => {
    for (const p of LIVE_PANELS) {
      if (!p.href) continue;
      expect(isRoute(p.href), `${p.id} → ${p.href}`).toBe(true);
    }
  });
});
