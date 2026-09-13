/**
 * EVERY LINK ON THE TWO SURFACES A STRANGER OPENS (2026-09-13).
 *
 * `README.md` and `docs/index.html` are the repository's front doors — the
 * second is now served by GitHub Pages and both are going on a résumé. A dead
 * link on either is a cost paid by the one reader the project was built to
 * reach, and nothing was checking them: `published-text.test.ts` reads their
 * PROSE for stale quantities and never looks at an href.
 *
 * TWO KINDS, BOTH CHECKABLE WITHOUT A NETWORK. A relative link must name a path
 * that exists in this repository. A link into the deployed app must name a
 * route that exists under `src/app` — so deleting or renaming a route fails
 * here rather than on the reader's screen.
 *
 * WHAT IT CANNOT DO: reach the network. It cannot tell whether the deployment
 * is up, whether Pages is enabled, or whether an external URL still resolves.
 * Those are true of the world rather than of this repository, and a guard that
 * pretended otherwise would be flaky in the direction that gets guards deleted.
 */
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const NL = String.fromCharCode(10);
const QUOTE = String.fromCharCode(34);
const SURFACES = ["README.md", "docs/index.html"] as const;

/** The deployed app's origin, as these files spell it. */
const APP_ORIGIN = "https://vibe-check-app-sepia.vercel.app";

/**
 * Every link target in a file: HTML `href="…"` and Markdown `](…)`.
 *
 * SCANNED RATHER THAN PATTERN-MATCHED where the pattern would need escaping —
 * this repository has had three regexes hollowed out by a transport that eats
 * one level of backslashes, each reporting success by matching nothing.
 */
function linksIn(source: string): string[] {
  const out: string[] = [];
  const push = (opener: string, closer: string) => {
    let at = source.indexOf(opener);
    while (at !== -1) {
      const from = at + opener.length;
      const to = source.indexOf(closer, from);
      if (to === -1) break;
      const target = source.slice(from, to).trim();
      if (target.length > 0) out.push(target);
      at = source.indexOf(opener, to);
    }
  };
  push("href=" + QUOTE, QUOTE);
  push("](", ")");
  return out;
}

/** Does a Next.js App Router route exist for this path? */
function routeExists(path: string): boolean {
  const dir = path === "/" ? "src/app" : "src/app" + path;
  return existsSync(dir + "/page.tsx") || existsSync(dir + "/page.ts");
}

describe("the public surfaces have no dead links", () => {
  const all = SURFACES.map((path) => ({ path, links: linksIn(readFileSync(path, "utf8")) }));

  it("found links on both surfaces, so nothing below passes vacuously", () => {
    for (const { path, links } of all) {
      expect(links.length, `${path} yielded no links at all — the scanner is broken`).toBeGreaterThan(4);
    }
  });

  it("points every relative link at a path that exists", () => {
    const dead: string[] = [];
    for (const { path, links } of all) {
      for (const link of links) {
        if (link.startsWith("http") || link.startsWith("#") || link.startsWith("mailto:")) continue;
        const target = link.split("#")[0];
        if (target.length > 0 && !existsSync(target)) dead.push(`${path} -> ${link}`);
      }
    }
    expect(
      dead,
      "these links name a file that is not in the repository. They are on the two pages a " +
        "stranger opens first:" + NL + dead.join(NL),
    ).toEqual([]);
  });

  it("points every app link at a route that exists", () => {
    const dead: string[] = [];
    let checked = 0;
    for (const { path, links } of all) {
      for (const link of links) {
        if (!link.startsWith(APP_ORIGIN)) continue;
        checked += 1;
        const route = link.slice(APP_ORIGIN.length).split("#")[0].replace(/\/$/, "") || "/";
        if (!routeExists(route)) dead.push(`${path} -> ${route}`);
      }
    }
    expect(checked, "no link into the app was found, so this checked nothing").toBeGreaterThan(8);
    expect(
      dead,
      "these links point into the deployed app at routes this repository does not have. Renaming " +
        "a route breaks the page a recruiter opens:" + NL + dead.join(NL),
    ).toEqual([]);
  });
});
