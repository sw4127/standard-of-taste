/**
 * THE IMPORT GRAPH, READ FROM SOURCE — one walker for every guard that needs it.
 *
 * Two guards read it: `no-model-text.test.ts` (no page reaches a model client)
 * and `no-dead-modules.test.ts` (no source module is reachable from nothing).
 * The walker lived inside the first until 2026-09-24; the second needed the same
 * resolution rules, and two copies of a resolver are two answers to "what does
 * this import point at".
 *
 * WHAT COUNTS AS AN ENTRY. A request can reach a module through a page, layout
 * or API route — and through Next's metadata routes, which are files too:
 * `opengraph-image`, `icon`, `apple-icon`, `sitemap`, `robots`, `manifest`, and
 * `global-error`. The first version of the walker matched only the first group,
 * so a model called from the share image would not have been seen.
 *
 * WHAT IT CANNOT SEE: an import built from a string at runtime, or a file read
 * with `readFileSync` rather than imported. Both exist in this repository
 * (the blueprint is read from disk); neither is a module edge.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, normalize } from "node:path";

const IMPORT =
  /(?:import|export)\s[^'"]*?from\s*["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)|require\(\s*["']([^"']+)["']\s*\)|import\s+["']([^"']+)["']/g;

export const posix = (p: string) => p.split("\\").join("/");

export function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [posix(p)];
  });
}

/** A specifier inside src/, resolved to a file, or null (a package, or not found). */
export function resolve(from: string, spec: string): string | null {
  let base: string;
  if (spec.startsWith("@/")) base = join("src", spec.slice(2));
  else if (spec.startsWith(".")) base = join(dirname(from), spec);
  else return null;
  base = posix(normalize(base));
  for (const cand of [base, `${base}.ts`, `${base}.tsx`, `${base}.mjs`, `${base}/index.ts`, `${base}/index.tsx`]) {
    if (existsSync(cand) && statSync(cand).isFile()) return cand;
  }
  return null;
}

/** Every module specifier a file names: static, dynamic, require, and side-effect imports. */
export function specifiers(file: string): string[] {
  const src = readFileSync(file, "utf8");
  return [...src.matchAll(IMPORT)].map((m) => m[1] ?? m[2] ?? m[3] ?? m[4]);
}

export const isTest = (f: string) => /\.test\.(tsx?|mjs)$/.test(f) || f.includes("/test-utils/");

/** Next's route and metadata file names: every file a request can start from. */
const ROUTE_FILE =
  /\/(page|layout|route|template|loading|error|global-error|not-found|default|opengraph-image|twitter-image|icon|apple-icon|sitemap|robots|manifest)\.tsx?$/;

/** Every entry point a visitor's request can reach. */
export function appEntries(): string[] {
  return walk("src/app").filter((f) => ROUTE_FILE.test(f) && !isTest(f));
}

/** Every module reachable from `starts` by following imports inside src/. */
export function closure(starts: readonly string[]): Set<string> {
  const seen = new Set<string>();
  const stack = [...starts];
  while (stack.length) {
    const file = stack.pop()!;
    if (seen.has(file)) continue;
    seen.add(file);
    for (const spec of specifiers(file)) {
      const next = resolve(file, spec);
      if (next && !seen.has(next)) stack.push(next);
    }
  }
  return seen;
}
