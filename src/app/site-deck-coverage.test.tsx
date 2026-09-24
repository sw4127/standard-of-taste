/**
 * RENDERED COPY THE COPY SYSTEM CANNOT SEE, COUNTED PER PAGE AND HELD THERE
 * (Track V/S8, class 8(ii)).
 *
 * A surface that renders is not the same as a surface the copy system can see.
 * E21 shipped /method's first reversal and it sat in no deck for six days —
 * invisible to the copy deck, the review ledger, and any writer handed either.
 *
 * MEASURED 2026-09-22, rendered pages against every `docs/copy-deck*.md` and
 * `docs/commission-batch-*.md`: of 1,135 rendered body sentences of six words
 * or more, 693 are in neither. Counting each page's metadata too — the title
 * and description a link preview shows, which no deck carries anywhere — the
 * ceilings below total 751. The whole Lab (six pages, 526 with metadata), the
 * instrument start pages (/bias, /delicacy, /threshold), most of the
 * reading-room index and much of the front door have never been in front of a
 * writer. (2026-09-23: 720, after the legacy routes retired — 26 of their
 * sentences left with them — and five event descriptions left /lab/data-model.
 * 2026-09-24: the map below sums to 758 — it had reached 762 through Blueprint
 * Part 7's measured rises, which this total was not updated for — after the
 * legacy funnel's group and its two payment events left /lab/data-model.)
 * That is recorded here as a CEILING per page, not fixed: wiring those
 * surfaces into the deck machinery is unruled work, the same work batch 6
 * names for the card.
 *
 * WHAT THE CEILING BUYS. A new block of prose on any page — the next reversal on
 * /method, a new Lab panel — raises that page's count and fails here until
 * somebody either puts it in a deck or raises the ceiling on purpose, in a diff
 * someone reads. A page that gets decked fails too, until the ceiling comes
 * down: the ratchet is exact, so it cannot drift loose.
 *
 * THE MATCH IS SLOT-TOLERANT. Decks show templates with `${slots}`; pages show
 * them filled. A sentence counts as seen if at least 60% of its five-word runs
 * occur in a deck or a commission. Measured on the census: that reads /method
 * as 164 of 169 seen, which is right — it is the most-decked page there is.
 *
 * THE 60% IS NOT ON A CLIFF, and that was measured rather than assumed. Of the
 * body sentences, 634 match 0% of their five-word runs and 418 match 100%; only
 * 22 sit between 40% and 70%. The ratchet can still move by one when one of
 * those 22 is reworded, and the message says which way.
 */
import { readdirSync, readFileSync } from "node:fs";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { renderSite, textOf, type RenderedSite } from "@/test-utils/render-site";

vi.mock("next/navigation", async (orig) => ({
  ...(await orig<typeof import("next/navigation")>()),
  useRouter: () => ({ push() {}, replace() {}, prefetch() {}, back() {}, forward() {}, refresh() {} }),
  usePathname: () => globalThis.__SITE_PATH ?? "/",
  useSearchParams: () => new URLSearchParams(),
}));

/** Sentences no deck or commission can see, per page, as measured on 2026-09-22. */
const INVISIBLE: Record<string, number> = {
  // BLUEPRINT PART 7 (2026-09-23), measured, not chosen. Every page with the
  // shared header went up by one: the header gained THE READING, HEARING and
  // THE COMPANY VIEW, and each page drops its own label, so no one deck line
  // matches every page's header even though every label is in the reading deck.
  // The reading, the Company view and /legal came DOWN (21 -> 4, 64 -> 10,
  // 7 -> 2) when their copy was decked in docs/copy-deck-reading.md.
  "/learn/why": 9,
  "/": 13, // +1 2026-09-23: the nav gained THE COMPANY VIEW (blueprint Part 6)
  "/bias": 7,
  "/delicacy": 10,
  "/threshold": 12,
  "/spread": 5,
  "/lab": 164,
  // 103 -> 98 -> 102, 2026-09-23: twelve retired events left the page, then
  // the snack's five came back with it (RT-4 c).
  // 102 -> 94 on 2026-09-23: the snack and fake-door event rows retired (BA-7);
  // 94 -> 98 the same day: the reading's tab-scoped entity (blueprint Part 5).
  // 99 -> 95 on 2026-09-24: the legacy funnel group (checkout_start, purchase)
  // left with the paid-tier components that fired them.
  "/lab/data-model": 95,
  "/lab/falsified": 161,
  "/lab/instrument-health": 24,
  "/lab/instrument-limits": 46,
  "/lab/recovery": 33,
  "/learn": 22,
  "/learn/comparison": 21,
  "/learn/delicacy": 5,
  "/learn/flaws": 10,
  "/learn/freedom-from-prejudice": 11,
  "/learn/good-sense": 12,
  "/learn/methodology": 16,
  "/learn/practice": 10,
  "/learn/prestige-bias-test": 18,
  "/learn/ranking-test": 30,
  // 2 -> 7 on 2026-09-23: the reading named as a surface, its generated plays, and
  // its session storage (blueprint Part 5). Part 7 decks /legal's new copy.
  "/legal": 2,
  "/method": 8,
  // Measured 2026-09-23 when the reading shipped (blueprint Part 5): its copy and
  // the argument rendered from docs/blueprint.md are in no deck yet. Part 7 decks
  // them and lowers this.
  "/reading": 4, // +1: the nav gained THE COMPANY VIEW
  // The Company view (blueprint Part 6), measured when it shipped; Part 7 decks it.
  // 10 -> 11 on 2026-09-24, measured: HEARING and READING ROOM became THE HEARING
  // TESTS and THE LIBRARY (Cowork copy return, part C). Link texts reach the
  // matcher run together ("THE READINGTHE HEARING TESTS..."), and the old run
  // split into five words, under the six-word floor; the new one is eight, so
  // /company's header now counts, as every other page's already did.
  "/company": 11,
};

const words = (s: string) =>
  s
    .toLowerCase()
    .replace(/\$\{[^}]*\}/g, " ")
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
const grams = (w: string[], n = 5) =>
  w.length < n ? [] : w.slice(0, w.length - n + 1).map((_, i) => w.slice(i, i + n).join(" "));

const SEEN = new Set(
  grams(
    words(
      readdirSync("docs")
        .filter((f) => /^(copy-deck.*|commission-batch-\d+)\.md$/.test(f))
        .map((f) => readFileSync(`docs/${f}`, "utf8"))
        .join("\n"),
    ),
  ),
);

/**
 * The page's sentences AND its metadata: the title and description a link
 * preview shows are copy a reader meets before the page, and no deck carries
 * them either.
 */
const sentences = (html: string, meta: string[]) => [
  ...new Set(
    [textOf(html), ...meta]
      .join("\n")
      .split("\n")
      .flatMap((l) => l.split(/(?<=[.!?])\s+/))
      .map((s) => s.trim())
      .filter((s) => words(s).length >= 6),
  ),
];

const seen = (s: string) => {
  const g = grams(words(s));
  return g.length > 0 && g.filter((x) => SEEN.has(x)).length / g.length >= 0.6;
};

let site: RenderedSite;
let counts: Record<string, { total: number; invisible: number }> = {};

beforeAll(async () => {
  site = await renderSite();
  counts = Object.fromEntries(
    site.pages.map((p) => {
      const all = sentences(p.html, p.meta);
      return [p.route, { total: all.length, invisible: all.filter((s) => !seen(s)).length }];
    }),
  );
}, 60_000);

describe("rendered copy the copy system cannot see is held at its measured ceiling", () => {
  it("read the pages and the decks, so nothing below passes vacuously", () => {
    expect(site.failed).toEqual([]);
    // Absolute floors, measured 2026-09-22: 1,135 body sentences before metadata.
    expect(Object.values(counts).reduce((n, c) => n + c.total, 0)).toBeGreaterThanOrEqual(1000);
    expect(SEEN.size).toBeGreaterThanOrEqual(20_000);
    // And the matcher can tell: the most-decked page reads as mostly seen.
    expect(counts["/method"].invisible).toBeLessThan(counts["/method"].total / 10);
  });

  it("classifies every rendered page, and lists no page that does not render", () => {
    const rendered = Object.keys(counts).sort();
    expect(rendered).toEqual(Object.keys(INVISIBLE).sort());
  });

  it("adds no invisible copy to any page, and lowers the ceiling when copy is decked", () => {
    const moved = Object.entries(INVISIBLE)
      .filter(([route, ceiling]) => counts[route] && counts[route].invisible !== ceiling)
      .map(([route, ceiling]) =>
        counts[route].invisible > ceiling
          ? `${route}: ${counts[route].invisible} invisible sentences, ceiling ${ceiling} — put the new copy in a deck, or raise the ceiling on purpose`
          : `${route}: ${counts[route].invisible} invisible, ceiling ${ceiling} — copy was decked or removed; lower the ceiling to hold the gain`,
      );
    expect(moved).toEqual([]);
  });
});
