/**
 * NO PAGE OFFERS ONE ROOM TWICE (Track V/S1, PM ruling RT-1 (2026-09-22) a).
 *
 * THE DEFECT. The front door linked to the reading room from its header nav
 * ("READING ROOM") and again from a secondary door under the machine cards
 * ("Reading room. Hume's five criteria…"). The doors predate the header by
 * sixteen days; the header was added without revisiting them.
 *
 * WHY NOTHING SAW IT. `instrument-state.test.ts` guarded the doors and nothing
 * guarded the header. Each list was checked on its own terms and the property
 * that broke lives BETWEEN them — which is the "four refusals over six" shape:
 * every guard inspected the entries and none read what sat beside them.
 *
 * WHAT THIS CHECKS, AND WHAT IT DOES NOT. The property the owner named is "two
 * doors to the same room IN ONE VIEWPORT". Viewport co-visibility needs layout,
 * and this suite has no layout engine. Measured in a browser it also depends on
 * the screen: the two links shared a 1920x1080 viewport and were ~1,900 px apart
 * at 375x812. What IS checkable on rendered markup is stricter and, I think,
 * the real defect: ON ONE PAGE, THE CHROME AND THE BODY MUST NOT BOTH OFFER A
 * DOOR TO THE SAME ROOM. A phone reader who scrolls still meets it twice.
 *
 * Chrome is what `SiteHeader` renders inside `<header>`. Inside the header, the
 * wordmark and a "home" nav item may both reach `/` — a wordmark is identity,
 * not a door (engineering's call, reported in the Track V close).
 *
 * THE MEASUREMENT BEHIND IT: a crawl of all 27 static routes, header links
 * against body links, found exactly one overlap on the site — `/` → `/learn`.
 * An earlier probe reported /lab linking to `/` twenty-six times; that was the
 * probe resolving `#metric-*` fragments against the origin. Fragments are
 * in-page and are skipped here for that reason.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

// The gym floor calls `useRouter`, which needs a mounted App Router. Only its
// markup is read here, so a router that does nothing is enough.
vi.mock("next/navigation", async (orig) => ({
  ...(await orig<typeof import("next/navigation")>()),
  useRouter: () => ({ push() {}, replace() {}, prefetch() {}, back() {}, forward() {}, refresh() {} }),
}));

import Home from "./page";
import LearnLayout from "./learn/layout";
import LearnIndex from "./learn/page";
import LabLayout from "./lab/layout";
import LabIndex from "./lab/page";
import MethodLayout from "./method/layout";
import MethodPage from "./method/page";

interface Surface {
  path: string;
  html: string;
}

/** Every surface that renders `SiteHeader`, rendered whole — layout and page. */
async function surfaces(): Promise<Surface[]> {
  return [
    { path: "/", html: renderToStaticMarkup(<Home />) },
    { path: "/learn", html: renderToStaticMarkup(<LearnLayout><LearnIndex /></LearnLayout>) },
    { path: "/lab", html: renderToStaticMarkup(<LabLayout><LabIndex /></LabLayout>) },
    { path: "/method", html: renderToStaticMarkup(<MethodLayout><MethodPage /></MethodLayout>) },
  ];
}

const HREF = /<a\b[^>]*\bhref="([^"]*)"/g;

/** The room an href leads to: a path, or null for an in-page fragment or an external link. */
function room(href: string, from: string): string | null {
  if (href.startsWith("#")) return null;
  const u = new URL(href.replace(/&amp;/g, "&"), `https://x.test${from}`);
  if (u.origin !== "https://x.test") return null;
  return u.pathname.replace(/\/$/, "") || "/";
}

function rooms(html: string, from: string): string[] {
  return [...html.matchAll(HREF)].map((m) => room(m[1], from)).filter((r): r is string => r !== null);
}

/** How many `<header>` elements a page rendered. The split below assumes one. */
const headerCount = (html: string) => html.split("<header").length - 1;

/** Split a rendered page into its `<header>` and everything else. */
function split(s: Surface): { chrome: string[]; body: string[] } {
  const open = s.html.indexOf("<header");
  const close = s.html.indexOf("</header>");
  if (open < 0 || close < open) return { chrome: [], body: rooms(s.html, s.path) };
  const chromeHtml = s.html.slice(open, close);
  const bodyHtml = s.html.slice(0, open) + s.html.slice(close);
  return { chrome: rooms(chromeHtml, s.path), body: rooms(bodyHtml, s.path) };
}

/** Rooms offered by both the chrome and the body of one page. */
function doubledRooms(s: Surface): string[] {
  const { chrome, body } = split(s);
  // The wordmark is chrome, so a body link to `/` beside it counts as a double.
  const offeredByChrome = new Set(chrome);
  return [...new Set(body.filter((r) => offeredByChrome.has(r)))];
}

/** Every non-test source file under `dir` that renders `<SiteHeader`. */
function headerConsumers(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...headerConsumers(full));
    else if (/\.tsx$/.test(e.name) && !/\.test\.tsx$/.test(e.name) && readFileSync(full, "utf8").includes("<SiteHeader")) {
      out.push(full.replace(/\\/g, "/"));
    }
  }
  return out;
}

describe("no page offers the same room from its chrome and its body", () => {
  /**
   * THE SURFACE LIST BELOW IS HAND-WRITTEN, SO IT IS CHECKED AGAINST THE SOURCE.
   * A fifth page adopting the header would otherwise be unguarded in silence —
   * the sitemap's "list of what somebody remembered" defect, one file over.
   */
  it("covers every file that renders the site header", () => {
    expect(headerConsumers("src").sort()).toEqual([
      "src/app/company/page.tsx",
      "src/app/lab/layout.tsx",
      "src/app/learn/layout.tsx",
      "src/app/method/layout.tsx",
      "src/app/page.tsx",
      "src/app/reading/page.tsx",
    ]);
  });

  /**
   * THE SPLIT READS THE FIRST `<header>` AS THE CHROME. A page body that ever
   * renders a `<header>` of its own would silently move links across the line,
   * so the assumption is asserted rather than trusted.
   */
  it("renders exactly one header per surface", async () => {
    for (const s of await surfaces()) {
      expect(headerCount(s.html), `${s.path} renders ${headerCount(s.html)} <header> elements`).toBe(1);
    }
  });

  /**
   * INSIDE THE HEADER, ONLY THE WORDMARK MAY SHARE A ROOM WITH A NAV ITEM. The
   * wordmark exemption is for identity, not a licence for the nav to list one
   * room twice.
   */
  it("lists no room twice inside the header, beyond the wordmark", async () => {
    for (const s of await surfaces()) {
      const [wordmark, ...nav] = split(s).chrome;
      expect(wordmark, `${s.path}: the header's first link is not the wordmark`).toBe("/");
      expect(new Set(nav).size, `${s.path} nav repeats a room: ${nav.join(", ")}`).toBe(nav.length);
    }
  });

  it("rendered every header surface, each with a header and a real body", async () => {
    const all = await surfaces();
    // ABSOLUTE floors, not relative to anything this file computes.
    expect(all.length).toBe(4);
    for (const s of all) {
      const { chrome, body } = split(s);
      expect(chrome.length, `${s.path} rendered no header links — the guard below would pass vacuously`).toBeGreaterThanOrEqual(2);
      expect(body.length, `${s.path} rendered almost no body links`).toBeGreaterThanOrEqual(2);
    }
  });

  it("finds no room offered twice", async () => {
    const doubled = (await surfaces())
      .map((s) => ({ path: s.path, rooms: doubledRooms(s) }))
      .filter((d) => d.rooms.length > 0)
      .map((d) => `${d.path} offers ${d.rooms.join(", ")} from both its header and its body`);
    expect(doubled).toEqual([]);
  });

  it("would catch the defect it was written for (planted specimen)", () => {
    const planted: Surface = {
      path: "/",
      html:
        '<header><a href="/">W</a><nav><a href="/learn">READING ROOM</a></nav></header>' +
        '<section><a href="/learn/flaws">x</a><a href="/learn">Reading room.</a><a href="#frag">f</a></section>',
    };
    expect(doubledRooms(planted)).toEqual(["/learn"]);
  });
});
