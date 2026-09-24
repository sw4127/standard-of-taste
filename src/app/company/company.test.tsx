/**
 * EVERY NUMBER ON THE COMPANY VIEW IS AN ASSUMPTION, DERIVED FROM ONE, OR A
 * CITATION (blueprint Part 6; N3).
 *
 * The page plans a test for a company that does not exist, so any number on it
 * that is not declared as a planning assumption, computed from one, or part of
 * a cited source's date is a number somebody made up and presented as a fact.
 * This renders the page and holds every numeral on it to that list.
 *
 * WHAT IT CANNOT SEE: a made-up number that happens to equal a registered one.
 * A stray "2" passes, because 2 is the lift the test is sized for; a stray "7"
 * fails. It checks that every numeral has a registered source, not that each
 * occurrence is the one registered.
 */
import { readFileSync } from "node:fs";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { renderSite, textOf, type RenderedPage } from "@/test-utils/render-site";
import { ASSUMPTIONS, BASELINE, FORMULA, MIN_LIFT, PLAN, fmt, pctText } from "@/content/company/plan";
import { ACCESS_NOW, COMPANY_LABEL, HOST_NAME, SPOTIFY_AI, STAKEHOLDERS } from "@/content/company/copy";
import { carveOutBreaches } from "@/content/carve-out";

vi.mock("next/navigation", async (orig) => ({
  ...(await orig<typeof import("next/navigation")>()),
  useRouter: () => ({ push() {}, replace() {}, prefetch() {}, back() {}, forward() {}, refresh() {} }),
  usePathname: () => globalThis.__SITE_PATH ?? "/",
  useSearchParams: () => new URLSearchParams(),
}));

let page: RenderedPage;
let text: string;
beforeAll(async () => {
  page = (await renderSite()).pages.find((p) => p.route === "/company")!;
  text = textOf(page.html).replace(/\s+/g, " ");
}, 60_000);

/** Numerals a reader meets, with IDs like BP-CA2, BA-10, RT-Z10 and D1 removed first. */
function numerals(t: string): string[] {
  const stripped = t
    .replace(/\b(?:BP|BA|RT)-[A-Z0-9-]+\b/g, " ")
    .replace(/\bD\d\b/g, " ")
    .replace(/[₀-₉]/g, " ");
  return [...stripped.matchAll(/\d[\d,]*(?:\.\d+)?%?/g)].map((m) => m[0]);
}

/** Everything a numeral may be: an assumption as shown, a derivation, or part of a citation. */
function allowed(): Set<string> {
  const derived = [
    fmt(PLAN.perArm),
    ...PLAN.others.flatMap((o) => [fmt(o.perArm), pctText(o.baseline), pctText(o.baseline + MIN_LIFT.value)]),
    pctText(BASELINE.value + MIN_LIFT.value),
    `${Math.round((1 - ASSUMPTIONS.find((a) => a.id === "alpha")!.value) * 100)}%`, // the interval's level, from alpha
  ];
  const shown = ASSUMPTIONS.flatMap((a) => numerals(a.shown));
  const cited = [ACCESS_NOW, SPOTIFY_AI].flatMap((s) => numerals(`${s.what} ${s.date}`));
  return new Set([...derived.flatMap(numerals), ...shown, ...cited]);
}

describe("the company view", () => {
  it("rendered, labelled at the top, and names the fictional host", () => {
    expect(page, "/company did not render").toBeTruthy();
    // Substantive, not merely present: an empty label is found at index 0 of anything.
    expect(COMPANY_LABEL).toMatch(/^Illustrative\. .{20,}/);
    expect(text.indexOf(COMPANY_LABEL)).toBeGreaterThan(-1);
    expect(text.indexOf(COMPANY_LABEL)).toBeLessThan(text.indexOf("The business case"));
    expect(text).toContain(HOST_NAME);
  });

  it("finds numbers to check (a floor, so a blind extractor cannot pass)", () => {
    expect(numerals(text).length).toBeGreaterThanOrEqual(12);
  });

  it("prints no number that is not an assumption, derived from one, or a cited date or count", () => {
    const ok = allowed();
    // The formula's constants (the 1 in 1 - p, the 2 in 2p) are the formula's, so the
    // formula is cut out rather than its digits allowed everywhere on the page.
    expect(text).toContain(FORMULA);
    const rest = text.split(FORMULA).join(" ");
    expect([...new Set(numerals(rest))].filter((n) => !ok.has(n))).toEqual([]);
  });

  it("labels every assumption as one, and gives each a reason", () => {
    // A word boundary, so the "PLANNING ASSUMPTIONS" heading is not counted as a label.
    expect((text.match(/PLANNING ASSUMPTION\b/g) ?? []).length).toBe(ASSUMPTIONS.length);
    for (const a of ASSUMPTIONS) expect(a.reason.length, a.id).toBeGreaterThan(60);
  });

  it("computes the sample size from the formula it shows", () => {
    // Worked by hand: p1 = 0.20, p2 = 0.22, two-sided 5%, 80% power.
    expect(PLAN.perArm).toBeGreaterThan(6400);
    expect(PLAN.perArm).toBeLessThan(6600);
    expect(text).toContain(`${fmt(PLAN.perArm)} visitors per arm`);
  });

  it("has five stakeholder notes, each citing what it serves, and cites both outside sources", () => {
    expect(STAKEHOLDERS.map((s) => s.team)).toEqual([
      "Personalization", "Trust & safety", "Legal & licensing", "Growth", "Label partnerships",
    ]);
    for (const s of STAKEHOLDERS) expect(s.cites).toMatch(/\b(?:BP|BA|RT)-/);
    expect(text).toContain("19 May 2021");
    expect(text).toContain("16 October 2025");
  });

  it("renders no statement ID: they stay in the code (RT-1 a, 2026-09-24)", () => {
    expect(text.match(/\b(?:BP|BA|RT)-[A-Z0-9]+/g) ?? []).toEqual([]);
    // The honesty labels the IDs used to sit beside are still on the page (N3).
    expect(text).toContain("ASSUMED");
    expect(text).toContain("assumed, not shown");
  });

  it("names the host only as fictional and the host was checked (docs/reading-names-check-2026-09-23.md)", () => {
    const record = readFileSync("docs/reading-names-check-2026-09-23.md", "utf8");
    expect(record).toMatch(/\*\*The host:\*\* Tessavox/);
    expect(COMPANY_LABEL).toMatch(/fictional/);
  });

  it("says nothing about trauma, abuse or mental health, beyond the one refusal that names them", () => {
    const REFUSAL = "nothing on any surface asserts anything about trauma, abuse or mental health";
    expect(text).toContain(REFUSAL);
    expect(carveOutBreaches(text.split(REFUSAL).join(" "))).toEqual([]);
  });
});
