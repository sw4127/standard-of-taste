/**
 * THE NOTES AS A READER MEETS THEM, ON THE RENDERED PAGES (2026-09-28).
 *
 * `blueprint.test.ts` pins `publicSource`, `publicCitation` and `caption` as
 * functions. None of that sees a page: a component that went back to a typed
 * fallback, or printed `s.note` whole, would pass it. This renders the site and
 * checks what is on the page.
 *
 * 1. /learn/why shows the Hume citation the owner split onto its own line, and
 *    labels BP-CA2-PUBLIC as the evidence it is, not "a position" (N3).
 * 2. /learn/why and /reading show the premises' published sources (RT-2 a).
 * 3. No note line that names anything internal reaches ANY rendered page.
 */
import { beforeAll, describe, expect, it, vi } from "vitest";
import { renderSite, textOf, type RenderedSite } from "@/test-utils/render-site";
import { BP_STATEMENTS, INTERNAL_REFERENCE } from "@/content/blueprint";

vi.mock("next/navigation", async (orig) => ({
  ...(await orig<typeof import("next/navigation")>()),
  useRouter: () => ({ push() {}, replace() {}, prefetch() {}, back() {}, forward() {}, refresh() {} }),
  usePathname: () => globalThis.__SITE_PATH ?? "/",
  useSearchParams: () => new URLSearchParams(),
}));

let site: RenderedSite;
const flat = (html: string) => textOf(html).replace(/\s+/g, " ");
const text = (route: string) => flat(site.pages.find((p) => p.route === route)!.html);

beforeAll(async () => {
  site = await renderSite();
}, 60_000);

describe("the blueprint's notes on the rendered pages", () => {
  it("renders both pages that show notes", () => {
    expect(site.pages.map((p) => p.route)).toEqual(expect.arrayContaining(["/learn/why", "/reading"]));
  });

  it("shows the Hume citation under the third assumption on /learn/why", () => {
    expect(text("/learn/why")).toContain(
      'A philosophical position (Hume, "Of the Standard of Taste", 1757), not an empirical claim.',
    );
  });

  it("labels no statement on /learn/why a position unless its note says so (N3)", () => {
    // The typed fallback this replaced printed it under BP-CA2-PUBLIC, an evidenced claim.
    expect(text("/learn/why")).not.toContain("A POSITION, NOT AN EMPIRICAL CLAIM");
    expect(text("/learn/why")).toContain("EVIDENCED, qualitatively.");
  });

  it.each(["/learn/why", "/reading"])("shows the premises' published sources on %s", (route) => {
    expect(text(route)).toContain("Knobloch & Zillmann (2002): participants put in a bad mood");
  });

  it("puts no internal note line on any page", () => {
    // Field names stripped, so a component that trims "Label: " before printing is still caught.
    const hidden = BP_STATEMENTS.flatMap((s) =>
      s.noteLines.filter((l) => INTERNAL_REFERENCE.test(l)).map((l) => l.replace(/^(Label|Kind): /, "")),
    );
    // A floor, so the check cannot pass by finding no lines to look for.
    expect(hidden.length).toBeGreaterThanOrEqual(8);
    const leaks = site.pages.flatMap((p) => {
      const t = flat(p.html);
      return hidden.filter((l) => t.includes(l)).map((l) => `${p.route}: "${l}"`);
    });
    expect(leaks).toEqual([]);
  });

  it.each(["/learn/why", "/reading"])("shows no internal reference anywhere in %s's text", (route) => {
    // Catches a leak in whatever form a renderer transforms it into, which the
    // raw-line check above cannot (red-team, 2026-09-28).
    expect(INTERNAL_REFERENCE.exec(text(route))?.[0] ?? null).toBeNull();
  });

  it("prints a line under every statement /learn/why quotes, so none is left unlabelled (N3)", () => {
    const html = site.pages.find((p) => p.route === "/learn/why")!.html;
    const quotes = [...html.matchAll(/<blockquote>([\s\S]*?)<\/blockquote>/g)].map((m) => m[1]);
    expect(quotes.length).toBeGreaterThanOrEqual(4);
    expect(quotes.filter((q) => !q.includes("<span")).map((q) => flat(q).slice(0, 60))).toEqual([]);
  });
});
