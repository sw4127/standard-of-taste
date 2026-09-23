/// <reference types="vite/client" />
/**
 * EVERY STATIC PAGE OF THE SITE, RENDERED THE WAY A READER RECEIVES IT (Track V).
 *
 * Shared by the site-wide guards (`site-links`, `site-counts`), which must read
 * rendered output rather than source: a sentence assembled from data has no
 * literal to grep, and it has beaten grep four times in this repository.
 *
 * Each page is rendered inside its section layout, so headers and footers are
 * part of what is read. A test file using this MUST mock `next/navigation`
 * itself (vi.mock is hoisted per file) and read the path from
 * `globalThis.__SITE_PATH`, which `renderSite` sets before each page.
 *
 * WHAT IT CANNOT RENDER: pages that redirect without a payload (reported in
 * `redirected`, never silently dropped) and dynamic `[slug]` routes.
 */
import { createElement, type ComponentType, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const PAGES = import.meta.glob<{ default: ComponentType<object> }>("../app/**/page.tsx");
const LAYOUTS = import.meta.glob<{ default: ComponentType<{ children: React.ReactNode }> }>(
  "../app/*/layout.tsx",
);
/** Every layout below the root, so a caller can assert none is left unrendered. */
export const ALL_LAYOUT_KEYS = Object.keys(import.meta.glob("../app/**/layout.tsx"));
export const SECTION_LAYOUT_KEYS = Object.keys(LAYOUTS);

const routeOf = (key: string) => key.replace(/^\.\.\/app/, "").replace(/\/?page\.tsx$/, "") || "/";

export interface RenderedPage {
  route: string;
  html: string;
}

export interface RenderedSite {
  pages: RenderedPage[];
  redirected: string[];
  failed: string[];
  staticRoutes: string[];
}

declare global {
  var __SITE_PATH: string | undefined;
}

async function render(route: string, key: string): Promise<string> {
  globalThis.__SITE_PATH = route;
  const Page = (await PAGES[key]()).default as unknown as (p: object) => unknown;
  const props = { searchParams: Promise.resolve({}), params: Promise.resolve({}) };
  // Server components may be async and must be awaited; client components use
  // hooks and must be rendered as elements, not called.
  let el: ReactElement =
    Page.constructor.name === "AsyncFunction"
      ? ((await Page(props)) as ReactElement)
      : createElement(Page as ComponentType<object>, props);
  const section = `../app/${route.split("/")[1]}/layout.tsx`;
  if (route !== "/" && LAYOUTS[section]) {
    el = createElement((await LAYOUTS[section]()).default, null, el);
  }
  return renderToStaticMarkup(el);
}

let cached: Promise<RenderedSite> | null = null;

/** Render every static page once per test file. */
export function renderSite(): Promise<RenderedSite> {
  cached ??= (async () => {
    const site: RenderedSite = { pages: [], redirected: [], failed: [], staticRoutes: [] };
    for (const key of Object.keys(PAGES)) {
      const route = routeOf(key);
      if (route.includes("[")) continue;
      site.staticRoutes.push(route);
      try {
        site.pages.push({ route, html: await render(route, key) });
      } catch (e) {
        if (String(e).includes("NEXT_REDIRECT")) site.redirected.push(route);
        else site.failed.push(`${route}: ${String(e).slice(0, 120)}`);
      }
    }
    return site;
  })();
  return cached;
}

const ENTITIES: Record<string, string> = { "&#x27;": "'", "&quot;": '"', "&amp;": "&", "&lt;": "<", "&gt;": ">", "&nbsp;": " " };

/** A page's text as a reader meets it: tags gone, entities decoded, whitespace collapsed. */
export function textOf(html: string): string {
  return html
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/g, " ")
    .replace(/<\/?(p|li|h\d|dt|dd|td|th|div|section|figcaption|summary|blockquote|br|header|nav|footer|main|article)\b[^>]*>/g, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&#x27;|&quot;|&amp;|&lt;|&gt;|&nbsp;/g, (m) => ENTITIES[m])
    .replace(/[ \t]+/g, " ");
}
