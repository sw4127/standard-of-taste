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
 * EXEMPT BY NAME, AND ONLY BY NAME (2026-09-23). The routes are read from the
 * constitution's last "Named routes" line, not listed here. The snack —
 * `/music/quiz` and `/music/result` — was named there, then retired for good
 * (BA-7) and its suspension withdrawn; its premise question joins the retired
 * World Cup sentence and the removed Prestige bridge's as FIXED SPECIMENS.
 *
 * ONE OF THEM IS WHY THE NEEDLE GREW (Track V/S9). The Prestige Test's bridge
 * screen — between the blind and labelled passes, inside the flagship — pointed
 * at the quiz saying it "tells you which kind of listener you are". The needle
 * matched "what kind of…" and "the kind of…" and would not have caught "which".
 * That screen also never renders in a static render, which is why no rendered
 * check saw it; the source scan at the end of this file now reads the gym's
 * interactive screens for exactly that reason.
 *
 * WHAT IT CANNOT SEE: the card itself (it renders only with a payload — it is
 * guarded in `src/content/card/`), the instrument result screens (payload
 * pages), and any claim about the person phrased in words not listed here.
 * A green run means none of THESE phrasings renders, not that no page speaks
 * about the person.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { attributeText, renderSite, textOf, type RenderedSite } from "@/test-utils/render-site";
// The RT-Z10 carve-out holds on every surface, the card included — one list (BA-5).
import { CARVE_OUT } from "@/content/carve-out";

vi.mock("next/navigation", async (orig) => ({
  ...(await orig<typeof import("next/navigation")>()),
  useRouter: () => ({ push() {}, replace() {}, prefetch() {}, back() {}, forward() {}, refresh() {} }),
  usePathname: () => globalThis.__SITE_PATH ?? "/",
  useSearchParams: () => new URLSearchParams(),
}));

/** Phrasings that claim something about the person rather than the performance. */
const ABOUT_THE_PERSON =
  /\b(who you are|(what|which) (kind|type|sort) of (person|listener) you are|the (kind|type|sort) of (person|listener)|says about you|reveals about you|your (personality|temperament|character|psyche|soul|mood|identity|inner \w+)|you are (a|an|the|someone|somebody) \w+ (person|listener|type|soul)|you tend to|deep down|introvert|extrovert|personality)\b/i;


/** What retired surfaces rendered, verbatim. Each must still trip the needle. */
const RETIRED_SPECIMENS = [
  "I'll tell you what being their fan says about you.",
  // The snack's premise question, rendered until it was retired for good (BA-7, 2026-09-23).
  "Does your music taste actually say something about who you are?",
  "There's a shorter, sillier one next door — five taps on what you actually listen to, and it tells you which kind of listener you are.",
];

/**
 * THE SURFACES WHERE D1 IS SUSPENDED, READ FROM THE CONSTITUTION (2026-09-23).
 *
 * The second-surface amendment says suspension is "by name, never by category".
 * This makes that sentence hold: the routes are parsed out of the amendment in
 * CLAUDE.md, so a person-claim is allowed ONLY on a route the constitution
 * names, and naming a new one means amending the constitution, not this file.
 * (The prompt card is not a route of its own; it renders on payload pages this
 * test cannot reach, and its copy is guarded in `src/content/card/`.)
 */
function namedSurfaces(): string[] | null {
  const text = readFileSync("CLAUDE.md", "utf8");
  // ONLY a "Named routes" line is the list. The first version read every
  // backticked route in the section and picked up "/method", where the second
  // reversal is published: prose that MENTIONS a route is not a ruling that
  // NAMES one — the category-reading the amendment forbids.
  // THE LAST ONE (2026-09-23, BA-7). The constitution is append-only, so a later
  // amendment that withdraws or names routes adds its own line and the newest
  // governs — the rule `card/statement.test.ts` already reads the card's
  // sentence by.
  const lines = text.split(String.fromCharCode(10)).filter((l) => l.startsWith("**Named routes**"));
  if (lines.length === 0) return null;
  return [...new Set([...lines[lines.length - 1].matchAll(/`(\/[a-z0-9/-]+)`/g)].map((m) => m[1]))];
}
const NAMED_OR_NULL = namedSurfaces();
const NAMED = NAMED_OR_NULL ?? [];

/** Sentences that name the forbidden thing in order to refuse it. */
const REFUSALS: Record<string, string> = {
  "not a psychological assessment, not a personality test, not medical or mental-health advice":
    "/legal refusing D1's subject by name",
  "do not predict your personality, your mood or your character": "/legal refusing D1's subject by name, for the instruments",
  "why a five-tap personality verdict with no measurement behind it was killed": "/method recording why D1 exists",
  "Not a personality.": "the front door refusing D1's subject by name",
  "Don't abuse, reverse-engineer, or resell the service": "/legal terms of use — abuse of the service, not of a person",
  "nothing on any surface asserts anything about trauma, abuse or mental health":
    "/method's second and third reversals stating the RT-Z10 carve-out, not breaking it",
  "neither says anything about trauma, abuse or mental health": "/legal stating the RT-Z10 carve-out",
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
    // Measured 2026-09-23 after the legacy routes retired: 23 pages render.
    expect(site.pages.length).toBeGreaterThanOrEqual(23);
  });

  it("reads the named surfaces from the constitution, and each is a real, rendered route", () => {
    expect(NAMED_OR_NULL, 'no "Named routes" line in CLAUDE.md, so the list was never read').not.toBeNull();
    // Absolute, as ruled on 2026-09-23: the snack's suspension withdrawn (BA-7),
    // the reading named (BA-6, D1 amendment, third surface).
    expect([...NAMED].sort()).toEqual(["/reading"]);
    for (const r of NAMED) expect(site.pages.map((p) => p.route)).toContain(r);
  });

  /**
   * THE TERMS PAGE STATES THE BOUNDARY, SO IT MUST STATE THE ONE THAT EXISTS.
   * On 2026-09-23 /legal said "It does not predict your personality" in the
   * morning (true once the snack was retired) and would have gone on saying it
   * after the snack returned. While the constitution names a person-speaking
   * route, /legal must name it too — and must still refuse for the instruments.
   */
  it("keeps /legal's statement of the boundary in step with the named surfaces", () => {
    const legal = textOf(site.pages.find((p) => p.route === "/legal")!.html).replace(/\s+/g, " ");
    expect(legal, "/legal still describes the retired snack").not.toMatch(/snack/i);
    if (NAMED.includes("/reading")) expect(legal, "/legal does not name the reading as a surface that speaks about you").toMatch(/the prompt card and the reading/);
    expect(legal).toMatch(/instruments in the gym do not predict your personality/);
    expect(legal).not.toMatch(/It does not predict your personality/);
  });

  it("the needle bites on what the retired surfaces actually said", () => {
    for (const sentence of RETIRED_SPECIMENS) {
      expect(scan("/retired", sentence).filter((h) => h.rule === "D1"), sentence).toHaveLength(1);
    }
  });

  it("finds no claim about the person on any rendered page the constitution does not name", () => {
    const found = hits
      .filter((h) => h.rule === "D1" && !NAMED.includes(h.route) && !refused(h))
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

  /**
   * THE SCREENS A STATIC RENDER NEVER REACHES, READ FROM SOURCE (Track V/S9).
   *
   * The instruments are client flows; their mid-session screens — the Prestige
   * bridge between passes, the Threshold cooldown — exist only in React state.
   * The bridge carried a D1 claim ("which kind of listener you are") and nothing
   * above could see it. So the gym's flows and every shared component are read
   * as source, comments stripped, with the same needle. Source is the right
   * surface here for the reason 8(i) gives: copy that never renders statically
   * has no rendered output to read.
   */
  it("finds no claim about the person in the gym's interactive screens, read from source", () => {
    const walk = (d: string): string[] =>
      readdirSync(d, { withFileTypes: true }).flatMap((e) =>
        e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name).replace(/\\/g, "/")],
      );
    const files = [
      ...["bias", "delicacy", "threshold", "spread"].flatMap((d) => walk(`src/app/${d}`)),
      ...walk("src/components"),
    ].filter((f) => f.endsWith(".tsx") && !f.includes(".test."));
    // Absolute floor, measured 2026-09-23: 36 files.
    expect(files.length).toBeGreaterThanOrEqual(30);
    // A component that speaks about the person is exempt ONLY if every file that
    // imports it lives under a named surface's route directory — derived, not
    // listed. None today: `ResearchPanel` was the case until the snack retired (BA-7).
    const namedDirs = NAMED.map((r) => `src/app${r}/`);
    const everything = walk("src").filter((f) => /\.tsx?$/.test(f) && !f.includes(".test."));
    const onlyOnNamedSurfaces = (f: string) => {
      const name = f.split("/").pop()!.replace(/\.tsx$/, "");
      const importers = everything.filter(
        (g) => g !== f && new RegExp(`from "[^"]*/${name}"`).test(readFileSync(g, "utf8")),
      );
      return importers.length > 0 && importers.every((g) => namedDirs.some((d) => g.startsWith(d)));
    };
    const found = files.filter((f) => !onlyOnNamedSurfaces(f)).flatMap((f) => {
      const src = readFileSync(f, "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, " ")
        .replace(/^\s*\/\/.*$/gm, " ");
      return scan(f, src)
        .filter((h) => h.rule === "D1" && !refused(h))
        .map((h) => `${f}: "${h.sentence.trim().slice(0, 120)}"`);
    });
    expect(found).toEqual([]);
  });

  it("lists no refusal whose sentence is gone", () => {
    const all = site.pages.map((p) => textOf(p.html).replace(/\s+/g, " ")).join("\n");
    expect(Object.keys(REFUSALS).filter((f) => !all.includes(f))).toEqual([]);
  });
});
