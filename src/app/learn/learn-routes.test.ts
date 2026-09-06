/**
 * EVERY READING-ROOM PAGE HAS A ROUTE, AND NO EXPLAINER OPENS LOWERCASE (E17).
 *
 * Both guards exist because adding one page tripped both, and the whole suite
 * stayed green through it.
 *
 * (a) A ROUTE FOR EVERY ENTRY. `LEARN_PAGES` drives the /learn index, the
 *     FAQPage structured data AND `sitemap.ts`, which emits `/learn/<slug>` for
 *     every entry. Adding an entry without a `page.tsx` therefore advertises a
 *     404 to crawlers and puts a dead card on the index — and nothing noticed:
 *     the content tests passed, the published-text tests passed, and the page
 *     returned 404 in a browser. The existing route guards check links found in
 *     the Lab and the README, neither of which reaches this.
 *
 * (b) NO SENTENCE OPENS WITH A LOWERCASE NUMBER WORD. This defect has now
 *     happened four times in this repository. `numberWordLeading` was written
 *     and placed beside `numberWord` specifically because "the fourth caller
 *     will not remember" — and the fourth caller did not. The rendered page
 *     read "six of those works are played here".
 *
 *     Checked on the JSX source rather than the DOM, because a test that needs
 *     a running server is a test nobody runs. The needle is a paragraph opening
 *     with an interpolation of the plain helper, which is the exact shape of
 *     the mistake.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { LEARN_PAGES } from "@/content/learn";

describe("(a) every reading-room page is actually routed", () => {
  it("finds the pages before asserting anything about them", () => {
    expect(LEARN_PAGES.length).toBeGreaterThan(5);
  });

  it("has a page.tsx for every slug", () => {
    const missing = LEARN_PAGES.filter((p) => !existsSync(`src/app/learn/${p.slug}/page.tsx`)).map(
      (p) => `/learn/${p.slug}`,
    );
    expect(
      missing,
      "these are indexed, sitemapped and carded but return 404",
    ).toEqual([]);
  });

  it("has no routed explainer that the registry does not know about", () => {
    const slugs = new Set(LEARN_PAGES.map((p) => p.slug));
    const orphans = readdirSync("src/app/learn", { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .filter((name) => existsSync(`src/app/learn/${name}/page.tsx`))
      .filter((name) => !slugs.has(name));
    expect(orphans, "routed explainers absent from LEARN_PAGES").toEqual([]);
  });
});

describe("(b) no explainer opens a sentence with a lowercase number word", () => {
  const pages = () =>
    LEARN_PAGES.map((p) => `src/app/learn/${p.slug}/page.tsx`)
      .filter((f) => existsSync(f))
      .map((f) => ({ file: f, src: readFileSync(f, "utf8") }));

  it("reads real files", () => {
    expect(pages().length).toBeGreaterThan(5);
  });

  it("uses the leading-capital helper where a paragraph starts with a count", () => {
    // `<p>` (or a line break after it) immediately followed by an
    // interpolation of the plain helper — the shape that rendered lowercase.
    const hazard = /<p>\s*\{numberWord\(/;
    const offenders = pages()
      .filter(({ src }) => hazard.test(src))
      .map(({ file }) => `${file} — opens a paragraph with numberWord(); use numberWordLeading()`);
    expect(offenders).toEqual([]);
  });
});
