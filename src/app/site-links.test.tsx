/**
 * EVERY DOOR LEADS SOMEWHERE, EVERY ROOM HAS A DOOR, NO DOOR LEADS BACK TO
 * ITSELF (Track V/S2).
 *
 * `site-doors.test.tsx` holds one property of one kind of page: header against
 * body. This holds the mirror images across the whole site, read from RENDERED
 * pages rather than from href literals in source, because a link assembled from
 * data (the secondary doors, the Lab's panels, the reading room's index) has no
 * literal to grep.
 *
 *  - DEAD: an internal link to a path no route serves.
 *  - ORPHAN: a route no rendered page links to. Some are orphans BY DESIGN — a
 *    result page is reached by finishing an instrument or by a share link, and
 *    the legacy quiz routes were demoted off the front door (RT-3c) but must not
 *    404 for old shares. Those are listed below WITH their reason, and the list
 *    is exact in both directions: a route that gains a door, or stops existing,
 *    fails here until the list says so. An allow-list that only grows is how a
 *    guard goes vacuous one entry at a time.
 *  - SELF: a page linking to the page it is. Found on 2026-09-22: the reading
 *    room's footer offered "Reading room" on the reading room's own index. The
 *    one exception is the wordmark on the front door.
 *
 * WHAT IT CANNOT SEE: pages that need a payload to render (they redirect with
 * none — listed, and required to KEEP redirecting so the list cannot rot), and
 * the dynamic `[slug]` routes, whose inbound doors are counted but whose own
 * links are not rendered here.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it, vi } from "vitest";
import {
  ALL_LAYOUT_KEYS,
  SECTION_LAYOUT_KEYS,
  renderSite,
  type RenderedSite,
} from "@/test-utils/render-site";

vi.mock("next/navigation", async (orig) => ({
  ...(await orig<typeof import("next/navigation")>()),
  useRouter: () => ({ push() {}, replace() {}, prefetch() {}, back() {}, forward() {}, refresh() {} }),
  usePathname: () => globalThis.__SITE_PATH ?? "/",
  useSearchParams: () => new URLSearchParams(),
}));

/** Pages that redirect when rendered without a payload. Each must still redirect. */
const NEEDS_A_PAYLOAD: Record<string, string> = {
  "/bias/result": "the Prestige result; the payload is the share code",
  "/delicacy/result": "the Delicacy result; the payload is the share code",
  "/music/result": "legacy quiz result (RT-3c)",
  "/result": "legacy World Cup result (RT-3c)",
  "/premium/report": "legacy paid report; redirects to its preview when unpaid",
  "/vs": "legacy head-to-head; needs two archetypes",
};

/** Routes no rendered page links to, on purpose. Exact: see the header. */
const ORPHAN_BY_DESIGN: Record<string, string> = {
  "/bias/result": "reached by finishing the Prestige Test, or by a share link",
  "/delicacy/result": "reached by finishing the Delicacy Trials, or by a share link",
  "/music/result": "legacy; reached by finishing the music quiz",
  "/result": "legacy; reached by finishing the World Cup quiz",
  "/premium/preview": "legacy paywall, reached from the legacy result",
  "/quiz": "legacy; only a referred ?from= arrival is pointed at it (page.tsx)",
  "/vs": "legacy head-to-head, reached from a shared legacy result",
  "/fan-verdict": "legacy World Cup page, reached by its own share links",
};

interface Anchor {
  href: string;
  text: string;
}
interface Rendered {
  route: string;
  anchors: Anchor[];
}

const ANCHOR = /<a\b[^>]*?\bhref="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g;
const textOf = (html: string) => html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

/** The path a link leads to, or null if it is in-page, external, or not a page. */
function pathOf(href: string, from: string): { path: string; bare: boolean } | null {
  if (href.startsWith("#") || /^(mailto|tel):/.test(href)) return null;
  const u = new URL(href.replace(/&amp;/g, "&"), `https://x.test${from}`);
  if (u.origin !== "https://x.test") return null;
  return { path: u.pathname.replace(/\/$/, "") || "/", bare: !u.search && !u.hash };
}

/** Every route the App Router serves, static and dynamic, as matchers. */
function routeMatchers(dir = "src/app", prefix = ""): RegExp[] {
  const out: RegExp[] = [];
  if (existsSync(join(dir, "page.tsx")) || existsSync(join(dir, "route.ts"))) {
    out.push(new RegExp(`^${prefix || "/"}$`));
  }
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const seg = e.name.startsWith("[") ? "[^/]+" : e.name.replace(/[.*+?^${}()|\\]/g, "\\$&");
    out.push(...routeMatchers(join(dir, e.name), `${prefix}/${seg}`));
  }
  return out;
}

let site: RenderedSite;
let rendered: Rendered[] = [];

beforeAll(async () => {
  site = await renderSite();
  rendered = site.pages.map((p) => ({
    route: p.route,
    anchors: [...p.html.matchAll(ANCHOR)].map((m) => ({ href: m[1], text: textOf(m[2]) })),
  }));
}, 60_000);

describe("the site's doors, read from rendered pages", () => {
  it("rendered the site, so nothing below passes vacuously", () => {
    expect(site.failed).toEqual([]);
    // Absolute floors, measured 2026-09-22: 27 pages render with 252 links
    // between them, and 6 redirect. A floor is a tripwire, not a count.
    expect(rendered.length).toBeGreaterThanOrEqual(27);
    expect(rendered.flatMap((r) => r.anchors).length).toBeGreaterThanOrEqual(200);
    expect([...site.redirected].sort()).toEqual(Object.keys(NEEDS_A_PAYLOAD).sort());
  });

  /**
   * ONLY SECTION LAYOUTS ARE WRAPPED. A layout nested deeper would add links
   * (a footer, a sub-nav) that `render` never draws, and every check here would
   * pass without having seen them. So the assumption is asserted.
   */
  it("wraps every layout that can add a link", () => {
    expect(
      ALL_LAYOUT_KEYS.filter((k) => !SECTION_LAYOUT_KEYS.includes(k)).sort(),
      "a layout this test does not render",
    ).toEqual(["../app/layout.tsx"]);
    // The root layout is the one exemption: it renders <html> and no links.
    expect(readFileSync("src/app/layout.tsx", "utf8")).not.toMatch(/href=|<Link/);
  });

  it("links to no path that no route serves", () => {
    const routes = routeMatchers();
    const dead = rendered.flatMap((r) =>
      r.anchors
        .map((a) => pathOf(a.href, r.route))
        .filter((p): p is { path: string; bare: boolean } => p !== null)
        .filter((p) => !routes.some((m) => m.test(p.path)))
        .map((p) => `${r.route} -> ${p.path}`),
    );
    expect(dead).toEqual([]);
  });

  it("leaves no route without a door, except the ones listed with a reason", () => {
    const inbound = new Set(
      rendered.flatMap((r) =>
        r.anchors
          .map((a) => pathOf(a.href, r.route)?.path)
          .filter((p): p is string => !!p && p !== r.route),
      ),
    );
    const orphans = new Set(site.staticRoutes.filter((r) => !inbound.has(r)));
    const listed = new Set(Object.keys(ORPHAN_BY_DESIGN));
    expect(
      [...orphans].filter((r) => !listed.has(r)),
      "routes no rendered page links to — give them a door, or list them with a reason",
    ).toEqual([]);
    expect(
      [...listed].filter((r) => !orphans.has(r)),
      "listed as orphans but no longer are (they gained a door or stopped existing) — take them off",
    ).toEqual([]);
  });

  it("has no page linking to itself, except the front door's wordmark", () => {
    const self = rendered.flatMap((r) =>
      r.anchors
        .filter((a) => {
          const p = pathOf(a.href, r.route);
          return p?.bare && p.path === r.route;
        })
        .filter((a) => !(r.route === "/" && a.text === "STANDARD OF TASTE"))
        .map((a) => `${r.route} links to itself as "${a.text}"`),
    );
    expect(self).toEqual([]);
  });
});
