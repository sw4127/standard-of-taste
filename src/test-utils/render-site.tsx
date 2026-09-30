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
/*
 * THE CHINESE SECTIONS (bilingual Part 2). A page under `/zh/learn/...` is drawn
 * inside `zh/learn/layout.tsx` and then `zh/layout.tsx`, the way the English
 * page is drawn inside `learn/layout.tsx`, so the Chinese header and footer are
 * read by every guard that reads the English ones.
 */
const ZH_SECTIONS = import.meta.glob<{ default: ComponentType<{ children: React.ReactNode }> }>(
  "../app/zh/*/layout.tsx",
);
/** Every layout below the root, so a caller can assert none is left unrendered. */
export const ALL_LAYOUT_KEYS = Object.keys(import.meta.glob("../app/**/layout.tsx"));
export const SECTION_LAYOUT_KEYS = [...Object.keys(LAYOUTS), ...Object.keys(ZH_SECTIONS)];

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
  /** Where each redirecting page sends the reader, read from Next's redirect digest. */
  redirectTo: Record<string, string>;
  failed: string[];
  staticRoutes: string[];
}

declare global {
  var __SITE_PATH: string | undefined;
  /** The query `useSearchParams` returns, for tests that render a flow's later steps. */
  var __SITE_SEARCH: string | undefined;
}

async function render(
  route: string,
  key: string,
  dynamic: { params?: Record<string, string>; search?: Record<string, string> } = {},
): Promise<{ html: string; meta: string[] }> {
  globalThis.__SITE_PATH = route;
  const mod = (await PAGES[key]()) as {
    default: unknown;
    metadata?: unknown;
    generateMetadata?: (p: object) => Promise<unknown>;
  };
  const Page = mod.default as (p: object) => unknown;
  const props = { searchParams: Promise.resolve(dynamic.search ?? {}), params: Promise.resolve(dynamic.params ?? {}) };
  // Server components may be async and must be awaited; client components use
  // hooks and must be rendered as elements, not called.
  let el: ReactElement =
    Page.constructor.name === "AsyncFunction"
      ? ((await Page(props)) as ReactElement)
      : createElement(Page as ComponentType<object>, props);
  const zhSection = `../app/zh/${route.split("/")[2]}/layout.tsx`;
  if (route.startsWith("/zh/") && ZH_SECTIONS[zhSection]) {
    el = createElement((await ZH_SECTIONS[zhSection]()).default, null, el);
  }
  const section = `../app/${route.split("/")[1]}/layout.tsx`;
  if (route !== "/" && LAYOUTS[section]) {
    el = createElement((await LAYOUTS[section]()).default, null, el);
  }
  const html = renderToStaticMarkup(el);
  // Only strings a reader sees: `canonical` and the like are paths, not prose.
  const metadata = mod.generateMetadata ? await mod.generateMetadata(props) : mod.metadata;
  const meta = stringsIn(metadata).filter((t) => /\s/.test(t));
  return { html, meta };
}

/**
 * A DYNAMIC ROUTE AT GIVEN PARAMS AND QUERY, e.g. a Threshold result at
 * `/zh/threshold/pitch/result?s=…&r=…` (bilingual Part 4). `renderSite` skips every
 * `[slug]` route, so an instrument's result screen was read by no rendered-page
 * guard in either language. `pattern` is the route as its file names it.
 */
export async function renderDynamic(
  pattern: string,
  params: Record<string, string>,
  search: Record<string, string> = {},
): Promise<RenderedPage> {
  const key = Object.keys(PAGES).find((k) => routeOf(k) === pattern);
  if (!key) throw new Error(`no page for ${pattern}`);
  const path = pattern.replace(/\[(\w+)\]/g, (_, n: string) => params[n]);
  const q = new URLSearchParams(search).toString();
  return { route: q ? `${path}?${q}` : path, ...(await render(path, key, { params, search })) };
}

let cached: Promise<RenderedSite> | null = null;

/**
 * A PAGE AT A GIVEN QUERY, e.g. the reading at `?l=mira&step=prompt` (bilingual
 * Part 2, red-team). `renderSite` draws each route once with no query, so a flow's
 * later steps (a listener's lines, the prompt, the creation screen) were never
 * read by any guard. A test that mocks `useSearchParams` to read
 * `globalThis.__SITE_SEARCH` can render them here. Kept apart from `renderSite`,
 * so the site-wide counts and ceilings keep meaning one render per route.
 */
export async function renderState(route: string, search: string): Promise<RenderedPage> {
  const key = Object.keys(PAGES).find((k) => routeOf(k) === route);
  if (!key) throw new Error(`no page for ${route}`);
  globalThis.__SITE_SEARCH = search;
  try {
    return { route: `${route}?${search}`, ...(await render(route, key)) };
  } finally {
    globalThis.__SITE_SEARCH = undefined;
  }
}

/** Render every static page once per test file. */
export function renderSite(): Promise<RenderedSite> {
  cached ??= (async () => {
    const site: RenderedSite = { pages: [], redirected: [], redirectTo: {}, failed: [], staticRoutes: [] };
    for (const key of Object.keys(PAGES)) {
      const route = routeOf(key);
      if (route.includes("[")) continue;
      site.staticRoutes.push(route);
      try {
        site.pages.push({ route, ...(await render(route, key)) });
      } catch (e) {
        if (String(e).includes("NEXT_REDIRECT")) {
          site.redirected.push(route);
          // The digest is "NEXT_REDIRECT;<type>;<url>;<status>;".
          const digest = String((e as { digest?: string }).digest ?? "");
          site.redirectTo[route] = digest.split(";")[2] ?? "";
        }
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
