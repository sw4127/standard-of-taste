/**
 * WHICH LANGUAGE A PAGE IS IN, AND WHERE ITS COUNTERPART LIVES (bilingual Part 2, 2026-09-29).
 *
 * A Chinese page has its own address under `/zh`, so a recruiter can send a
 * Chinese link (the owner's brief). The language is a property of the URL and
 * nothing else: a page never guesses from the browser, and a stored preference
 * only ever sends a visitor to an address that exists (`LocalePreference`).
 * Serves BP-GOAL (a reviewer tries the core within minutes, now in a second
 * language) and BA-12.
 *
 * `ZH_ROUTES` IS THE LIST OF PAGES THAT HAVE A CHINESE COUNTERPART. The switch
 * shows only where one exists, and a Chinese page links to Chinese pages only
 * where they exist. `site-zh.test.tsx` fails if the list and `src/app/zh/`
 * disagree, in either direction.
 */

export type Locale = "en" | "zh";

export const ZH_PREFIX = "/zh";

/**
 * The key the switch writes, read and written only inside try/catch. It sits in
 * the `gym.` namespace that "forget this browser" sweeps (`forget-device.ts`), so
 * the promise on /legal, that the button clears everything this browser holds,
 * stays true of the language choice too.
 */
export const LOCALE_STORAGE_KEY = "gym.locale";

/** Routes with a Chinese page, as English paths. `[slug]` stands for any one segment. */
export const ZH_ROUTES: readonly string[] = ["/", "/company", "/lab", "/learn/why", "/method", "/reading", "/spread"];

export function localeOfPath(path: string): Locale {
  return path === ZH_PREFIX || path.startsWith(`${ZH_PREFIX}/`) || path.startsWith(`${ZH_PREFIX}#`) || path.startsWith(`${ZH_PREFIX}?`)
    ? "zh"
    : "en";
}

/** Split a href into its path and the `?query#hash` tail. */
function split(href: string): [string, string] {
  const i = href.search(/[?#]/);
  return i < 0 ? [href, ""] : [href.slice(0, i), href.slice(i)];
}

/** "/zh/reading" → "/reading", "/zh" → "/". English paths pass through. */
export function englishPath(href: string): string {
  const [path, tail] = split(href);
  if (localeOfPath(path) === "en") return href;
  return (path.slice(ZH_PREFIX.length) || "/") + tail;
}

/** "/reading" → "/zh/reading", "/" → "/zh", "/#hearing" → "/zh#hearing". */
export function chinesePath(href: string): string {
  const [path, tail] = split(englishPath(href));
  return (path === "/" ? ZH_PREFIX : ZH_PREFIX + path) + tail;
}

/** Whether an English path has a Chinese page. */
export function hasChinese(href: string): boolean {
  const [path] = split(englishPath(href));
  const segs = path.split("/");
  return ZH_ROUTES.some((r) => {
    const rs = r.split("/");
    return rs.length === segs.length && rs.every((s, i) => s === "[slug]" || s === segs[i]);
  });
}

/**
 * A link as a page in `locale` should print it: on a Chinese page, an internal
 * link goes to the Chinese counterpart where one exists, and to the English
 * page where none does yet. External links and English pages pass through.
 */
export function localHref(locale: Locale, href: string): string {
  if (locale === "en" || !href.startsWith("/") || href.startsWith("//") || href.startsWith("/api/")) return href;
  return hasChinese(href) ? chinesePath(href) : href;
}

/**
 * WHETHER A STORED CHOICE OF CHINESE SHOULD MOVE THIS VISITOR (bilingual Part 2).
 *
 * Only on arrival from outside the site: a bookmark, a typed address, a link
 * from elsewhere. Never on Back or Forward, and never when the visitor came from
 * one of this site's own pages, because then they followed a link to the English
 * on purpose, and the note on every Chinese page tells them the English governs.
 * The first version redirected on every path change, so Back from a Chinese page
 * bounced straight back to it, and a new tab opened on EN did the same (red-team,
 * 2026-09-29).
 */
export function shouldSendToChinese(a: {
  path: string;
  stored: string | null;
  navigation: string | undefined;
  referrer: string;
  origin: string;
}): string | null {
  if (a.stored !== "zh" || localeOfPath(a.path) !== "en") return null;
  if (a.navigation === "back_forward" || a.navigation === "reload") return null;
  if (a.referrer && a.referrer.startsWith(a.origin + "/")) return null;
  return counterpart(a.path);
}

/** The address of the same page in the other language, or null when it has none. */
export function counterpart(href: string): string | null {
  const [path] = split(href);
  if (localeOfPath(path) === "zh") return englishPath(href);
  return hasChinese(href) ? chinesePath(href) : null;
}
