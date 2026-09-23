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
  /**
   * The strings in the page's `metadata` export — title, description, Open
   * Graph text. A reader meets them in a search result or a link preview before
   * the page, so they are a surface, and `renderToStaticMarkup` never draws them.
   */
  meta: string[];
}

/** Every string inside a metadata object, however nested. */
function stringsIn(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(stringsIn);
  if (value && typeof value === "object") return Object.values(value).flatMap(stringsIn);
  return [];
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

async function render(route: string, key: string): Promise<{ html: string; meta: string[] }> {
  globalThis.__SITE_PATH = route;
  const mod = (await PAGES[key]()) as { default: unknown; metadata?: unknown };
  const Page = mod.default as (p: object) => unknown;
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
  const html = renderToStaticMarkup(el);
  // Only strings a reader sees: `canonical` and the like are paths, not prose.
  const meta = stringsIn(mod.metadata).filter((t) => /\s/.test(t));
  return { html, meta };
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
        site.pages.push({ route, ...(await render(route, key)) });
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

/** Text a reader meets in attributes: image descriptions, labels, tooltips. */
export function attributeText(html: string): string {
  return [...html.matchAll(/\b(?:alt|aria-label|title|placeholder)="([^"]+)"/g)]
    .map((m) => m[1].replace(/&#x27;|&quot;|&amp;|&lt;|&gt;|&nbsp;/g, (x) => ENTITIES[x]))
    .join(".\n");
}

/** A page's text as a reader meets it: tags gone, entities decoded, whitespace collapsed. */
export function textOf(html: string): string {
  return html
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/g, " ")
    .replace(/<\/?(p|li|h\d|dt|dd|td|th|div|section|figcaption|summary|blockquote|br|header|nav|footer|main|article)\b[^>]*>/g, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&#x27;|&quot;|&amp;|&lt;|&gt;|&nbsp;/g, (m) => ENTITIES[m])
    .replace(/[ \t]+/g, " ");
}
