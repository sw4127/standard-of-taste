/**
 * EVERY COPY TEMPLATE IS EXERCISED BY A TEST, DIRECTLY OR THROUGH ITS COMPOSER
 * (Track V/S8, class 8(i)).
 *
 * An instrument's whole reading layer was once invisible to a rendered-output
 * guard because no fixture ever produced it: copy a reader would see, that no
 * test had ever rendered, so no rule about copy could reach it. This is the one
 * class where SOURCE is the right surface — a template that never runs in a test
 * has no rendered output to read.
 *
 * Measured 2026-09-22: 96 string-returning exports in `src/content`. 83 are
 * named by a test. Twelve of the other thirteen are composed — `thresholdLine`
 * and four siblings into the staircase reading, `degreesLine` / `stabilityLine`
 * through `COMPARISON_EMISSION`, the family-count words through the front
 * door's doors and a reading-room constant — each reached through something a
 * test does exercise. ONE IS NOT: `themeForArchetypeLabel`, the legacy paid
 * report's, which no test renders. None is dead.
 *
 * THE RULE, therefore: a template is covered if a test names it, or if a
 * covered exported function or constant calls it. And it must have at least one
 * caller somewhere — code, test or script — or it is copy that can never render.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const walk = (d: string): string[] =>
  readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name).replace(/\\/g, "/")],
  );

const ALL = walk("src");
// Every test but this one: this file names its exceptions, and a guard that
// counts its own exception list as coverage exempts everything it lists.
// Comments are stripped: a test that MENTIONS a template in a docblock has not
// run it, and counting the mention would call it covered.
const TESTS = ALL.filter((f) => /\.test\.tsx?$/.test(f) && !f.endsWith("/template-reach.test.ts"))
  .map((f) => readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " "))
  .join("\n");
const CODE = ALL.filter((f) => /\.tsx?$/.test(f) && !/\.test\./.test(f));
const MODULES = CODE.filter((f) => f.startsWith("src/content/") && f.endsWith(".ts"));

interface Fn {
  file: string;
  name: string;
  body: string;
  /** Declared to return a string: the templates this file is about. */
  template: boolean;
}

/** Every exported function in src/content, with its body. */
function exported(): Fn[] {
  return MODULES.flatMap((file) => {
    const src = readFileSync(file, "utf8");
    const heads = [...src.matchAll(/export function (\w+)\([^)]*\)\s*(?::\s*([^{]+))?\{/g)];
    return heads.map((m) => {
      // The body ends at the function's own closing brace — the first `}` at
      // column 0 after its head. Slicing to the NEXT export instead swallowed
      // module-level constants and counted them as composers: false coverage.
      const start = (m.index ?? 0) + m[0].length;
      const end = src.indexOf("\n}", start);
      return {
        file,
        name: m[1],
        body: src.slice(start, end < 0 ? src.length : end),
        template: /^string\b/.test((m[2] ?? "").trim()),
      };
    });
  });
}

/**
 * Exported constants that hold functions — an emission spec, a panel object —
 * compose templates too: `COMPARISON_EMISSION` is how `degreesLine` renders.
 * They are composers only, never templates themselves.
 */
function exportedConsts(): Fn[] {
  return MODULES.flatMap((file) => {
    const src = readFileSync(file, "utf8");
    return [...src.matchAll(/export const (\w+)[^=\n]*=/g)].map((m) => {
      // Ends at the first `}` or `]` at column 0: the constant's own close.
      const start = (m.index ?? 0) + m[0].length;
      const close = src.slice(start).search(/\n[}\]]/);
      return { file, name: m[1], body: src.slice(start, close < 0 ? src.length : start + close), template: false };
    });
  });
}

const named = (name: string, text: string) => new RegExp(`\\b${name}\\b`).test(text);

/**
 * Reached by a path no exported composer shows, each with its reason. Exact in
 * both directions: an entry that becomes reachable, or stops existing, fails.
 */
const REACHED_OTHERWISE: Record<string, string> = {};

describe("every copy template in src/content can be reached by a test", () => {
  const fns = [...exported(), ...exportedConsts()];
  const all = fns.filter((f) => f.template);

  it("found the templates, so nothing below passes vacuously", () => {
    // Absolute floor, measured 2026-09-22: 96.
    expect(all.length).toBeGreaterThanOrEqual(90);
  });

  it("covers each one directly or through a covered function that calls it", () => {
    const key = (f: Fn) => `${f.file} ${f.name}`;
    const covered = new Set(fns.filter((f) => named(f.name, TESTS)).map(key));
    // Propagate down composition chains, across modules, until nothing changes.
    for (let changed = true; changed; ) {
      changed = false;
      for (const t of fns) {
        if (covered.has(key(t))) continue;
        if (fns.some((c) => c !== t && covered.has(key(c)) && new RegExp(`\\b${t.name}\\(`).test(c.body))) {
          covered.add(key(t));
          changed = true;
        }
      }
    }
    const unreached = all.filter((t) => !covered.has(key(t))).map(key);
    const listed = Object.keys(REACHED_OTHERWISE);
    expect(unreached.filter((u) => !listed.includes(u)), "templates no test ever produces — add a fixture").toEqual([]);
    expect(listed.filter((l) => !unreached.includes(l)), "listed but now reached, or gone — remove them").toEqual([]);
  });

  it("has no template that nothing calls — not code, not a test, not a script", () => {
    const callers = [...ALL.filter((f) => /\.tsx?$/.test(f)), ...walk("scripts")];
    const dead = all
      .filter((t) => {
        const own = readFileSync(t.file, "utf8").split(new RegExp(`\\b${t.name}\\b`)).length - 1;
        return own < 2 && !callers.some((f) => f !== t.file && named(t.name, readFileSync(f, "utf8")));
      })
      .map((t) => `${t.file} ${t.name}`);
    expect(dead, "copy that can never render — delete it or call it").toEqual([]);
  });
});
