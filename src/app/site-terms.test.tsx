/**
 * ONE INSTRUMENT, ONE NAME — AND NO ENGINE SLUG WHERE A READER EXPECTS A WORD
 * (Track V/S6).
 *
 * Terminology drift is one concept wearing two names in two places. Swept on
 * 2026-09-22 across every rendered page, body and metadata:
 *
 *  - the instruments render under exactly four proper names, each the registry's
 *    title: "The Prestige Test", "The Delicacy Trials", "The Threshold Test",
 *    "The Ranking Test". CLEAN. The routes (`/bias`, `/spread`, a reading-room
 *    slug `prestige-bias-test`) carry older names, and a writer reading a URL
 *    is exactly how "the Prestige-Bias Test" or "the Spread Test" comes back.
 *  - the flaw families render only through `FAMILY_LABEL` (a guard in
 *    `flaw-families.test.ts` already refuses hand-typed family names). The
 *    engine slugs `pitch-drift`, `timing-smear`, `lossy-artifact` render only on
 *    the Lab, where the item table names the pipeline's own ids on purpose
 *    (recorded in `flaw-families.ts`). CLEAN.
 *  - the prompt card's vocabulary (`card/axes.ts`) is words to PASTE, not names
 *    for the flaws; the card names each flaw through `familyLabel`, the same
 *    function the reading room uses. No second name. CLEAN.
 *
 * NOT GUARDED, AND SAID SO: "sitting" and "session" name the same thing on
 * reader-facing pages. Both are plain English, the choice is a writer's, and it
 * is carried to the writing pass rather than settled by a regex.
 */
import { beforeAll, describe, expect, it, vi } from "vitest";
import { renderSite, textOf, type RenderedSite } from "@/test-utils/render-site";
import { MACHINES } from "@/components/OtherMachines";
import { DEGRADATION_FAMILIES } from "@/engine/delicacy";

vi.mock("next/navigation", async (orig) => ({
  ...(await orig<typeof import("next/navigation")>()),
  useRouter: () => ({ push() {}, replace() {}, prefetch() {}, back() {}, forward() {}, refresh() {} }),
  usePathname: () => globalThis.__SITE_PATH ?? "/",
  useSearchParams: () => new URLSearchParams(),
}));

/** The registry's names, without the article: "Prestige Test". */
const CANONICAL = new Set(MACHINES.map((m) => m.title.replace(/^The /, "")));

/** A capitalised name shaped like an instrument's. */
const INSTRUMENT_NAME = /\b([A-Z][a-z]+(?:[- ][A-Z][a-z]+)?) (Test|Trials|Battery|Instrument|Staircase)\b/g;

let site: RenderedSite;
let names: { route: string; name: string }[] = [];

beforeAll(async () => {
  site = await renderSite();
  names = site.pages.flatMap((p) =>
    [...[textOf(p.html), ...p.meta].join("\n").matchAll(INSTRUMENT_NAME)].map((m) => ({
      route: p.route,
      // The article is not part of the name: "The Prestige Test" -> "Prestige Test".
      name: m[0].replace(/^The /, ""),
    })),
  );
}, 60_000);

describe("each instrument has one name, and it is the registry's", () => {
  it("read the site and found the names, so nothing below passes vacuously", () => {
    expect(site.failed).toEqual([]);
    // Absolute floors, measured 2026-09-22: 104 instrument names across the site.
    expect(names.length).toBeGreaterThanOrEqual(80);
    expect(new Set(names.map((n) => n.name)).size).toBeGreaterThanOrEqual(4);
    expect(CANONICAL.size).toBe(4);
  });

  it("renders no instrument under a name the registry does not give it", () => {
    const rogue = names
      .filter((n) => !CANONICAL.has(n.name))
      .map((n) => `${n.route}: "${n.name}"`);
    expect([...new Set(rogue)]).toEqual([]);
  });

  /**
   * THE OLD NAMES LIVE IN THE URLS, in any case. `/bias`, `/spread` and the
   * reading-room slug `prestige-bias-test` are what a writer sees in an address
   * bar, and the capitalised-name check above cannot see "the spread test"
   * typed in lower case. Route-derived names are computed from the registry, so
   * a renamed route brings its own old name with it.
   */
  it("renders none of the names the URLs still carry", () => {
    const fromRoutes = MACHINES.map((m) => m.href.replace(/^\//, ""))
      .filter((slug) => ![...CANONICAL].some((c) => c.toLowerCase().startsWith(slug)))
      .map((slug) => `${slug} test`);
    // Absolute: the routes whose slug is not their instrument's name, today.
    expect([...fromRoutes].sort()).toEqual(["bias test", "spread test"]);
    const OLD = [...fromRoutes, "prestige-bias test", "prestige bias test", "delicacy battery"];
    const found = site.pages.flatMap((p) => {
      const text = [textOf(p.html), ...p.meta].join("\n").toLowerCase();
      return OLD.filter((o) => text.includes(o)).map((o) => `${p.route}: "${o}"`);
    });
    expect(found).toEqual([]);
  });

  it("names every live instrument somewhere, by its registry name", () => {
    const seen = new Set(names.map((n) => n.name));
    const unnamed = MACHINES.filter((m) => m.live)
      .map((m) => m.title.replace(/^The /, ""))
      .filter((t) => !seen.has(t));
    expect(unnamed).toEqual([]);
  });
});

describe("no engine slug reaches a reader outside the Lab", () => {
  it("renders the family ids only in the Lab's table cells, where they name the pipeline's ids", () => {
    // Not `\b`: rendered text runs inline elements together ("pitch-driftTHE
    // LAB" when a slug sits against a link), and `\b` sees no boundary there.
    // A mutation found that; the slugs are lower case, so refuse only a
    // lower-case continuation.
    const slug = new RegExp(`(?<![a-z0-9-])(${DEGRADATION_FAMILIES.join("|")})(?![a-z0-9-])`);
    const CELL = /<td\b[\s\S]*?<\/td>/g;
    // The exemption is for TABLE CELLS on the Lab, not for the Lab: a slug in
    // Lab prose is a missing label like anywhere else.
    const outsideCells = (p: { route: string; html: string }) =>
      p.route.startsWith("/lab") ? p.html.replace(CELL, " ") : p.html;
    const leaks = site.pages
      .filter((p) => slug.test([textOf(outsideCells(p)), ...p.meta].join("\n")))
      .map((p) => p.route);
    expect(leaks).toEqual([]);
    // And the Lab's cells really do carry them, so the exemption is not for nothing.
    const cells = site.pages
      .filter((p) => p.route.startsWith("/lab"))
      .flatMap((p) => p.html.match(CELL) ?? []);
    expect(cells.some((c) => slug.test(c))).toBe(true);
  });
});
