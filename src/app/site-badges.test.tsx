/**
 * A PROVENANCE BADGE SAYS WHERE ITS NUMBER CAME FROM, AND NOTHING ELSE DECIDES IT
 * (Track V/S7).
 *
 * FOUND ON 2026-09-22. `/lab/instrument-health` badged its Layer A table REAL.
 * The REAL badge's own hover note reads "measured from real respondents". The
 * product has zero respondents, the Lab's legend says so a screen away ("no real
 * cohort exists"), and Track O's whole premise is that the FIRST result badged
 * REAL has not happened yet. Layer A is real — measured off the shipped audio —
 * and it is about no person at all. It now carries MEASURED.
 *
 * WHY IT SURVIVED: every badge in the Lab was a string literal typed on the page.
 * `estimate.ts` carries `dataSource` through every result precisely so the badge
 * cannot be lost downstream, and the pages ignored it and typed the word.
 *
 * TWO CHECKS, ONE ON STATE AND ONE ON SOURCE:
 *  - rendered: a REAL badge appears only in the legend, plus once per panel whose
 *    registry entry is REAL — zero of them today;
 *  - source: a badge's source is read from data, except in an exact list of
 *    places where the provenance is a property of the page itself. "Typed" is a
 *    property of source, so this is the one check here that reads it.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { renderSite, type RenderedSite } from "@/test-utils/render-site";
import { SOURCE_BADGE_STYLES } from "@/components/lab/SourceBadge";
import { LAB_PANELS } from "@/content/lab/panels";

vi.mock("next/navigation", async (orig) => ({
  ...(await orig<typeof import("next/navigation")>()),
  useRouter: () => ({ push() {}, replace() {}, prefetch() {}, back() {}, forward() {}, refresh() {} }),
  usePathname: () => globalThis.__SITE_PATH ?? "/",
  useSearchParams: () => new URLSearchParams(),
}));

/** How many rendered badges of `kind` a page carries, found by the note it hovers. */
const badges = (html: string, kind: keyof typeof SOURCE_BADGE_STYLES) =>
  html.split(`title="${SOURCE_BADGE_STYLES[kind].note.replace(/'/g, "&#x27;")}"`).length - 1;

/** Typed badge sources that are allowed, each with the reason it is not data. */
const TYPED_BY_DESIGN: Record<string, string> = {
  "src/app/lab/page.tsx SIMULATED": "the legend: one of each badge, defining them",
  "src/app/lab/page.tsx REAL": "the legend",
  "src/app/lab/page.tsx MIXED": "the legend",
  "src/app/lab/page.tsx MEASURED": "the legend",
  "src/app/lab/instrument-health/page.tsx MEASURED":
    "Layer A is read from the audio manifest on this same page; the provenance is the page's own",
};

function typedBadges(dir = "src"): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...typedBadges(full));
    else if (/\.tsx$/.test(e.name) && !/\.test\.tsx$/.test(e.name)) {
      // Any attribute order: `<SourceBadge className="x" source="REAL" />` is
      // as typed as the same badge with `source` first.
      for (const m of readFileSync(full, "utf8").matchAll(/<SourceBadge\b[^>]*?\bsource="([A-Z]+)"/g)) {
        out.push(`${full.replace(/\\/g, "/")} ${m[1]}`);
      }
    }
  }
  return out;
}

let site: RenderedSite;
beforeAll(async () => {
  site = await renderSite();
}, 60_000);

describe("provenance badges", () => {
  it("found the badges, so nothing below passes vacuously", () => {
    expect(site.failed).toEqual([]);
    const all = site.pages.reduce((n, p) => n + badges(p.html, "SIMULATED") + badges(p.html, "MEASURED"), 0);
    // Absolute floor, measured 2026-09-22 after this slice: 5 SIMULATED + 2 MEASURED.
    expect(all).toBeGreaterThanOrEqual(6);
  });

  it("shows REAL only in the legend and on panels whose data is real", () => {
    // The legend's REAL badge is the live positive: if the note this counts by
    // is ever reworded, the count below would go to zero and pass in silence.
    const lab = site.pages.find((p) => p.route === "/lab")!;
    expect(badges(lab.html, "REAL"), "cannot find the legend's REAL badge — the counter is blind").toBe(1);
    const realPanels = LAB_PANELS.filter((p) => p.dataSource === "REAL").length;
    const wrong = site.pages
      .map((p) => ({
        route: p.route,
        real: badges(p.html, "REAL"),
        allowed: p.route === "/lab" ? 1 + realPanels : 0,
      }))
      .filter((x) => x.real > x.allowed)
      .map((x) => `${x.route} shows ${x.real} REAL badge(s); its data allows ${x.allowed}`);
    expect(wrong).toEqual([]);
  });

  it("badges the audio measurements as MEASURED, not as anything about people", () => {
    const health = site.pages.find((p) => p.route === "/lab/instrument-health")!;
    expect(badges(health.html, "MEASURED")).toBe(1);
  });

  it("reads each badge's source from data, except where listed with a reason", () => {
    const typed = typedBadges();
    const listed = Object.keys(TYPED_BY_DESIGN);
    expect(typed.filter((t) => !listed.includes(t)), "typed badge sources — read them from the data").toEqual([]);
    expect(listed.filter((l) => !typed.includes(l)), "listed but no longer typed — remove them").toEqual([]);
  });
});
