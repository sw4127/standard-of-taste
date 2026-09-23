/**
 * D1 STANDS EVERYWHERE THE AMENDMENT DID NOT SUSPEND IT (Track V/S5).
 *
 * D1 — the product describes what you did, never what you are — was suspended
 * on 2026-09-16 for ONE surface, the prompt card (RT-Z9 a), and left intact on
 * every other. Before this, exactly one page had a D1 guard (`/legal`), so the
 * boundary the amendment drew was held on the card's side and nowhere else.
 * This reads every rendered page and fails on a sentence that tells the reader
 * who they are.
 *
 * THE NEEDLE IS PHRASES THAT MAKE A CLAIM ABOUT THE PERSON, not pronouns. "You
 * rated the labelled take higher" is D1-clean and is most of this product;
 * "says about you", "who you are", "your personality" are not. Refusals that
 * name the forbidden thing in order to refuse it — "not a personality test",
 * "never reported as a fact about you" — are listed below with their reason,
 * exactly, both directions.
 *
 * THE LEGACY ROUTES ARE EXEMPT BY RULING, NOT BY OVERSIGHT. `/music/quiz`,
 * `/fan-verdict` and the World Cup quiz are the pre-pivot personality product,
 * kept alive so old shares do not 404 (RT-3c). They violate D1 by construction,
 * and they are the specimen that proves this needle bites on real rendered text:
 * the test REQUIRES them to trip it. If they are ever retired, that requirement
 * fails and this list must be revisited rather than quietly outliving them.
 *
 * WHAT IT CANNOT SEE: the card itself (it renders only with a payload — it is
 * guarded in `src/content/card/`), the instrument result screens (payload
 * pages), and any claim about the person phrased in words not listed here.
 * A green run means none of THESE phrasings renders, not that no page speaks
 * about the person.
 */
import { beforeAll, describe, expect, it, vi } from "vitest";
import { attributeText, renderSite, textOf, type RenderedSite } from "@/test-utils/render-site";

vi.mock("next/navigation", async (orig) => ({
  ...(await orig<typeof import("next/navigation")>()),
  useRouter: () => ({ push() {}, replace() {}, prefetch() {}, back() {}, forward() {}, refresh() {} }),
  usePathname: () => globalThis.__SITE_PATH ?? "/",
  useSearchParams: () => new URLSearchParams(),
}));

/** Phrasings that claim something about the person rather than the performance. */
const ABOUT_THE_PERSON =
  /\b(who you are|what kind of (person|listener) you are|the (kind|type|sort) of (person|listener)|says about you|reveals about you|your (personality|temperament|character|psyche|soul|mood|identity|inner \w+)|you are (a|an|the|someone|somebody) \w+ (person|listener|type|soul)|you tend to|deep down|introvert|extrovert|personality)\b/i;

/** The RT-Z10 carve-out holds on every surface, the card included. */
const CARVE_OUT = /\b(trauma|traumatic|abuse|abused|mental[- ]health|depress\w*|anxiety|grief|unresolved loss)\b/i;

/** The pre-pivot product, alive by RT-3c. Each must still trip the needle. */
const LEGACY_BY_RULING = ["/music/quiz", "/fan-verdict"];

/** Sentences that name the forbidden thing in order to refuse it. */
const REFUSALS: Record<string, string> = {
  "not a psychological assessment, not a personality test, not medical or mental-health advice":
    "/legal refusing D1's subject by name",
  "does not predict your personality, your mood or your character": "/legal refusing D1's subject by name",
  "why a five-tap personality verdict with no measurement behind it was killed": "/method recording why D1 exists",
  "Not a personality.": "the front door refusing D1's subject by name",
  "Don't abuse, reverse-engineer, or resell the service": "/legal terms of use — abuse of the service, not of a person",
};

interface Hit {
  route: string;
  sentence: string;
  rule: "D1" | "carve-out";
}

function scan(route: string, text: string): Hit[] {
  const hits: Hit[] = [];
  for (const sentence of text.replace(/\s+/g, " ").split(/(?<=[.!?])\s+/)) {
    if (ABOUT_THE_PERSON.test(sentence)) hits.push({ route, sentence, rule: "D1" });
    if (CARVE_OUT.test(sentence)) hits.push({ route, sentence, rule: "carve-out" });
  }
  return hits;
}

/**
 * A refusal exempts the WORDS it refuses with, not the sentence around them: a
 * sentence that refuses one claim and makes another ("not a personality test —
 * but it knows who you are") must still fail. So the listed fragment is cut out
 * and the rest is scanned again.
 */
const refused = (h: Hit) => {
  const fragment = Object.keys(REFUSALS).find((f) => h.sentence.includes(f));
  if (!fragment) return false;
  const rest = h.sentence.replace(fragment, " ");
  return !(h.rule === "D1" ? ABOUT_THE_PERSON : CARVE_OUT).test(rest);
};

let site: RenderedSite;
let hits: Hit[] = [];

beforeAll(async () => {
  site = await renderSite();
  // Body text, attribute text and metadata: all three are read by somebody.
  hits = site.pages.flatMap((p) =>
    scan(p.route, [textOf(p.html), attributeText(p.html), p.meta.join(".\n")].join("\n")),
  );
}, 60_000);

describe("no surface but the card speaks about the person (D1, as amended)", () => {
  it("read the site, so nothing below passes vacuously", () => {
    expect(site.failed).toEqual([]);
    expect(site.pages.length).toBeGreaterThanOrEqual(27);
    for (const route of LEGACY_BY_RULING) {
      expect(site.pages.map((p) => p.route), `${route} did not render`).toContain(route);
    }
  });

  it("the needle bites on real rendered text: every legacy route trips it", () => {
    for (const route of LEGACY_BY_RULING) {
      expect(
        hits.filter((h) => h.route === route && h.rule === "D1").length,
        `${route} no longer trips the D1 needle — retired, or the needle went blind`,
      ).toBeGreaterThan(0);
    }
  });

  it("finds no claim about the person outside the legacy routes", () => {
    const found = hits
      .filter((h) => h.rule === "D1" && !LEGACY_BY_RULING.includes(h.route) && !refused(h))
      .map((h) => `${h.route}: "${h.sentence.slice(0, 140)}"`);
    expect(found).toEqual([]);
  });

  it("asserts nothing about trauma, abuse or mental health anywhere (RT-Z10 a)", () => {
    const found = hits
      .filter((h) => h.rule === "carve-out" && !refused(h))
      .map((h) => `${h.route}: "${h.sentence.slice(0, 140)}"`);
    expect(found).toEqual([]);
  });

  it("reads metadata and attributes, not only body text", () => {
    // Absolute floor, measured 2026-09-22: most pages export a title/description.
    expect(site.pages.filter((p) => p.meta.length > 0).length).toBeGreaterThanOrEqual(15);
    expect(scan("/x", attributeText('<img alt="what your taste says about you">'))).toHaveLength(1);
  });

  it("exempts the refusing words, not the sentence around them", () => {
    const smuggled = scan(
      "/legal",
      "It does not predict your personality, your mood or your character, but it knows who you are.",
    );
    expect(smuggled.filter((h) => !refused(h))).toHaveLength(1);
  });

  it("lists no refusal whose sentence is gone", () => {
    const all = site.pages.map((p) => textOf(p.html).replace(/\s+/g, " ")).join("\n");
    expect(Object.keys(REFUSALS).filter((f) => !all.includes(f))).toEqual([]);
  });
});
