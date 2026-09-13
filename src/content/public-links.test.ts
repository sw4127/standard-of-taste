/**
 * EVERY LINK ON THE TWO SURFACES A STRANGER OPENS (2026-09-13).
 *
 * `README.md` and `docs/index.html` are the repository's front doors — the
 * second is now served by GitHub Pages and both are going on a résumé. A dead
 * link on either is a cost paid by the one reader the project was built to
 * reach, and nothing was checking them: `published-text.test.ts` reads their
 * PROSE for stale quantities and never looks at an href.
 *
 * TWO KINDS, BOTH CHECKABLE WITHOUT A NETWORK. A relative link must name a path
 * that exists in this repository. A link into the deployed app must name a
 * route that exists under `src/app` — so deleting or renaming a route fails
 * here rather than on the reader's screen.
 *
 * WHAT IT CANNOT DO: reach the network. It cannot tell whether the deployment
 * is up, whether Pages is enabled, or whether an external URL still resolves.
 * Those are true of the world rather than of this repository, and a guard that
 * pretended otherwise would be flaky in the direction that gets guards deleted.
 */
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const NL = String.fromCharCode(10);
const QUOTE = String.fromCharCode(34);
const SURFACES = ["README.md", "docs/index.html"] as const;

/** The deployed app's origin, as these files spell it. */
const APP_ORIGIN = "https://vibe-check-app-sepia.vercel.app";

/**
 * Every link target in a file: HTML `href="…"` and Markdown `](…)`.
 *
 * SCANNED RATHER THAN PATTERN-MATCHED where the pattern would need escaping —
 * this repository has had three regexes hollowed out by a transport that eats
 * one level of backslashes, each reporting success by matching nothing.
 */
function linksIn(source: string): string[] {
  const out: string[] = [];
  const push = (opener: string, closer: string) => {
    let at = source.indexOf(opener);
    while (at !== -1) {
      const from = at + opener.length;
      const to = source.indexOf(closer, from);
      if (to === -1) break;
      const target = source.slice(from, to).trim();
      if (target.length > 0) out.push(target);
      at = source.indexOf(opener, to);
    }
  };
  push("href=" + QUOTE, QUOTE);
  push("](", ")");
  return out;
}

/** Does a Next.js App Router route exist for this path? */
function routeExists(path: string): boolean {
  const dir = path === "/" ? "src/app" : "src/app" + path;
  return existsSync(dir + "/page.tsx") || existsSync(dir + "/page.ts");
}

describe("the public surfaces have no dead links", () => {
  const all = SURFACES.map((path) => ({ path, links: linksIn(readFileSync(path, "utf8")) }));

  it("found links on both surfaces, so nothing below passes vacuously", () => {
    for (const { path, links } of all) {
      expect(links.length, `${path} yielded no links at all — the scanner is broken`).toBeGreaterThan(4);
    }
  });

  it("points every relative link at a path that exists", () => {
    const dead: string[] = [];
    for (const { path, links } of all) {
      for (const link of links) {
        if (link.startsWith("http") || link.startsWith("#") || link.startsWith("mailto:")) continue;
        const target = link.split("#")[0];
        if (target.length > 0 && !existsSync(target)) dead.push(`${path} -> ${link}`);
      }
    }
    expect(
      dead,
      "these links name a file that is not in the repository. They are on the two pages a " +
        "stranger opens first:" + NL + dead.join(NL),
    ).toEqual([]);
  });

  it("points every app link at a route that exists", () => {
    const dead: string[] = [];
    let checked = 0;
    for (const { path, links } of all) {
      for (const link of links) {
        if (!link.startsWith(APP_ORIGIN)) continue;
        checked += 1;
        const route = link.slice(APP_ORIGIN.length).split("#")[0].replace(/\/$/, "") || "/";
        if (!routeExists(route)) dead.push(`${path} -> ${route}`);
      }
    }
    expect(checked, "no link into the app was found, so this checked nothing").toBeGreaterThan(8);
    expect(
      dead,
      "these links point into the deployed app at routes this repository does not have. Renaming " +
        "a route breaks the page a recruiter opens:" + NL + dead.join(NL),
    ).toEqual([]);
  });
});

/**
 * THE WEAKEST CLAIM ON THE README CARRIES ITS STATUS (2026-09-13).
 *
 * "Who it's for — people making music with AI tools" was stated as established
 * fact. It is not one. `docs/redirection-blueprint-2026-08-26.md` §2 records how
 * it was decided: "a positioning change with zero engine build" — the
 * instruments already existed, and the audience was fitted to them afterwards
 * by mapping each flaw family onto a plausible failure mode of generated audio.
 * That mapping is an argument. No AI music producer has been interviewed. The
 * two findings this project genuinely rests on came from listener interviews
 * and are about listeners.
 *
 * N3 IS NOT ONLY ABOUT PERCENTILES. A page that refuses to invent a norm and
 * then asserts an unresearched audience as fact is honest in the expensive
 * place and careless in the cheap one — and it is the claim a product manager
 * reading this will test first.
 *
 * SO THE STATUS IS PINNED, NOT THE WORDING. What must survive is that the
 * README says the audience is unvalidated and says so near the claim itself.
 */
describe("the README states what its audience claim rests on", () => {
  const readme = readFileSync("README.md", "utf8");

  it("makes the claim at all, so the check below is not vacuous", () => {
    expect(readme).toContain("Who it's for");
  });

  /*
   * THE RULE, NOT THE SENTENCE — AND IT BROKE WITHIN HOURS (2026-09-13).
   *
   * The first version pinned the literal words "No AI music producer has been
   * interviewed". Then one was asked: the owner, who uses Suno, and who
   * reported that sound quality is not a problem he has. The sentence became
   * obsolete because the WORLD changed, not because the rule did — and a needle
   * pinned to prose fails at exactly the moment the prose is being corrected
   * toward the truth.
   *
   * What must survive is that the README marks the audience claim as
   * unvalidated: either nobody has been asked, or what was found points against
   * it. A phrase list is a weak way to check that and it is the honest one
   * available; the alternative is asserting that a paragraph "sounds
   * appropriately uncertain", which no test can do.
   */
  const ADMISSIONS = [
    "has been interviewed",
    "has now been asked",
    "points against",
    "weak evidence",
    "the open question",
  ];

  it("marks the audience claim as unvalidated, in whatever words", () => {
    const admits = ADMISSIONS.some((phrase) => readme.indexOf(phrase) !== -1);
    expect(
      admits,
      "the README names an audience without saying the claim is unresearched. It was decided as a " +
        "positioning change with no engine build, and the two user findings this project rests on " +
        "are about listeners. Stating it as fact is the same class of invention N3 forbids in a " +
        "percentile, on the page most likely to be read by someone who will test it.",
    ).toBe(true);
  });

  it("keeps the admission near the claim, not in a footer", () => {
    const claim = readme.indexOf("Who it's for");
    const admission = Math.min(
      ...ADMISSIONS.map((phrase) => readme.indexOf(phrase)).filter((at) => at > -1),
    );
    expect(claim).toBeGreaterThan(-1);
    expect(Number.isFinite(admission), "no admission phrase found at all").toBe(true);
    expect(admission).toBeGreaterThan(claim);
    expect(
      admission - claim,
      "the admission has drifted far from the claim it qualifies. A caveat a reader meets three " +
        "screens later is a caveat most readers never meet.",
    ).toBeLessThan(1600);
  });
});
