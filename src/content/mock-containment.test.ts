/**
 * A MOCK OF AN UNBUILT FEATURE, IN A PUBLIC REPOSITORY (2026-09-13, RT-P1 a).
 *
 * `docs/preference-mock-2026-09-13.md` writes out the exact result screen a
 * preference instrument would show, so the owner can decide whether it is worth
 * building before anything is built. Every figure in it is invented for that
 * purpose.
 *
 * THE HAZARD IS SPECIFIC AND THIS PROJECT HAS ITS NAME. A page of plausible
 * numbers describing a feature that does not exist is the thing N3 exists to
 * forbid, sitting inside the repository that publishes a registry of its own
 * false claims. It is safe only while two things stay true: it says loudly that
 * it is a mock, and nothing a stranger reads points at it or repeats it.
 *
 * THE CHECK IS ON CONTAINMENT, NOT ON CONTENT. The mock may say anything it
 * likes about a feature nobody has built. What it may not do is escape.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";

const NL = String.fromCharCode(10);
const MOCK = "docs/preference-mock-2026-09-13.md";

/** Surfaces a stranger reads. The mock must appear in none of them. */
const PUBLIC_SURFACES = ["README.md", "docs/index.html", "public/llms.txt", "public/llms-full.txt"];

/**
 * Sentences invented for the mock. If one of these turns up in shipped copy,
 * an invented measurement has become a claim.
 */
const INVENTED = [
  "nine times out of twelve",
  "ten of twelve",
  "eleven of twelve",
  "tightly controlled dynamics",
];

function sourcesUnder(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = dir + "/" + name;
    if (statSync(path).isDirectory()) out.push(...sourcesUnder(path));
    else if (name.endsWith(".ts") || name.endsWith(".tsx")) out.push(path);
  }
  return out;
}

describe("the preference mock stays contained", () => {
  const mock = readFileSync(MOCK, "utf8");

  it("reads the mock, so the checks below are not checking an empty file", () => {
    expect(mock.length).toBeGreaterThan(3000);
    expect(INVENTED.length).toBeGreaterThan(2);
  });

  it("says at the top that the feature does not exist", () => {
    const head = mock.slice(0, 600);
    expect(
      head.indexOf("DOES NOT EXIST"),
      "the mock must declare itself a mock in its first lines, before anyone reads a number in it",
    ).toBeGreaterThan(-1);
    expect(
      head.toLowerCase().indexOf("invented"),
      "the mock must say its figures are invented, in the same breath",
    ).toBeGreaterThan(-1);
  });

  it("is linked from no surface a stranger reads", () => {
    const pointing = PUBLIC_SURFACES.filter(
      (path) => readFileSync(path, "utf8").indexOf("preference-mock") !== -1,
    );
    expect(
      pointing,
      "a public surface points at a mock of a feature that does not exist. A reader who follows " +
        "that link meets invented measurements on a site whose entire claim is that it does not " +
        "invent them:" + NL + pointing.join(NL),
    ).toEqual([]);
  });

  it("has none of its invented figures in shipped copy", () => {
    const leaked: string[] = [];
    for (const path of [...sourcesUnder("src"), ...PUBLIC_SURFACES]) {
      // This file's own needles are the rule, not a leak of it — the same
      // self-match that `one-name.test.ts` had to exclude.
      if (path === "src/content/mock-containment.test.ts") continue;
      const text = readFileSync(path, "utf8");
      for (const phrase of INVENTED) {
        if (text.indexOf(phrase) !== -1) leaked.push(`${path}  ("${phrase}")`);
      }
    }
    expect(
      leaked,
      "a sentence invented for the mock has appeared in shipped copy, which turns an illustration " +
        "into a claim:" + NL + leaked.join(NL),
    ).toEqual([]);
  });
});
