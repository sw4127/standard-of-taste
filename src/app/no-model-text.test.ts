/**
 * NO ROUTE RENDERS TEXT A MODEL WROTE (owner ruling BA-10, 2026-09-23).
 *
 * Templates only: no model writes any part of the reading, the prompt, or any
 * other sentence a visitor reads. Until this ruling the snack's verdict was
 * model-written, and on 2026-09-23 it rendered "headphones are cheaper than
 * therapy" — a sentence under the mental-health carve-out that no template
 * guard could see, because no template contained it.
 *
 * SO THIS READS THE IMPORT GRAPH, NOT A LIST. From every page, layout and API
 * route under `src/app`, it follows every import into `src/` and fails if any
 * reachable module imports a model SDK or calls a model provider's API. A list
 * of forbidden files would pass the day somebody wrote a new narrator under a
 * new name; the graph cannot.
 *
 * It also holds `package.json` free of a model SDK, so the dependency cannot
 * return quietly in a lockfile update.
 *
 * WHAT IT CANNOT SEE: a model reached from outside `src/` (a script, a build
 * step) whose output is then committed as a template. A template is a sentence
 * somebody chose to ship; where they got it is on them.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import { describe, expect, it } from "vitest";

/** Packages that are model clients. */
const MODEL_SDKS = [
  "@anthropic-ai/sdk",
  "openai",
  "@google/generative-ai",
  "@google/genai",
  "@mistralai/mistralai",
  "cohere-ai",
  "ai",
  "@ai-sdk/anthropic",
  "@ai-sdk/openai",
];
/** A raw call to a provider, without an SDK. */
const MODEL_HOSTS = /api\.anthropic\.com|api\.openai\.com|generativelanguage\.googleapis\.com|api\.mistral\.ai|api\.cohere\.(ai|com)/;

const IMPORT = /(?:import|export)\s[^'"]*?from\s*["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)|require\(\s*["']([^"']+)["']\s*\)/g;

const posix = (p: string) => p.replace(/\\/g, "/");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [posix(p)];
  });
}

/** A specifier inside src/, resolved to a file, or null (a package, or not found). */
function resolve(from: string, spec: string): string | null {
  let base: string;
  if (spec.startsWith("@/")) base = join("src", spec.slice(2));
  else if (spec.startsWith(".")) base = join(dirname(from), spec);
  else return null;
  base = posix(normalize(base));
  for (const cand of [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`]) {
    if (existsSync(cand) && statSync(cand).isFile()) return cand;
  }
  return null;
}

function specifiers(file: string): string[] {
  const src = readFileSync(file, "utf8");
  return [...src.matchAll(IMPORT)].map((m) => m[1] ?? m[2] ?? m[3]);
}

/** Why a single file is a model client, or null. */
function modelUse(file: string): string | null {
  const sdk = specifiers(file).find((s) => MODEL_SDKS.some((p) => s === p || s.startsWith(`${p}/`)));
  if (sdk) return `imports ${sdk}`;
  if (MODEL_HOSTS.test(readFileSync(file, "utf8"))) return "calls a model provider's API";
  return null;
}

/** Every entry point a visitor's request can reach. */
function entries(): string[] {
  return walk("src/app").filter(
    (f) => /\/(page|layout|route|template|loading|error|not-found|default)\.tsx?$/.test(f) && !f.includes(".test."),
  );
}

/** The first chain from an entry to a model client, or null. */
function chainToModel(entry: string, use = modelUse): string[] | null {
  const seen = new Set<string>();
  const stack: string[][] = [[entry]];
  while (stack.length) {
    const path = stack.pop()!;
    const file = path[path.length - 1];
    if (seen.has(file)) continue;
    seen.add(file);
    const why = use(file);
    if (why) return [...path, why];
    for (const spec of specifiers(file)) {
      const next = resolve(file, spec);
      if (next && !seen.has(next)) stack.push([...path, next]);
    }
  }
  return null;
}

describe("no page or API route reaches a model (BA-10)", () => {
  const all = entries();

  it("found the site's entry points (a floor, so an empty walk cannot pass)", () => {
    // Measured 2026-09-23 after the model routes were deleted: 40 entries.
    expect(all.length).toBeGreaterThanOrEqual(35);
    expect(all.some((f) => f.endsWith("/api/card/route.tsx"))).toBe(true);
  });

  it("follows imports through the graph, not just the entry file", () => {
    // A synthetic client two hops from a real page: the walker must find it.
    const planted = chainToModel("src/app/lab/data-model/page.tsx", (f) =>
      f === "src/lib/events.ts" ? "planted for this test" : modelUse(f),
    );
    expect(planted, "the walker did not reach src/lib/events.ts (two hops) from /lab/data-model").not.toBeNull();
    expect(planted!.length, "the chain skipped the middle hop").toBeGreaterThanOrEqual(4);
  });

  it("reaches no module that imports a model SDK or calls a provider", () => {
    const found = all.flatMap((e) => {
      const chain = chainToModel(e);
      return chain ? [chain.join(" -> ")] : [];
    });
    expect(found).toEqual([]);
  });

  it("imports no model SDK anywhere in src/, reachable or not", () => {
    const found = walk("src")
      .filter((f) => /\.(ts|tsx|mjs|js)$/.test(f) && !/\.test\.tsx?$/.test(f))
      .flatMap((f) => (modelUse(f) ? [`${f}: ${modelUse(f)}`] : []));
    expect(found).toEqual([]);
  });

  it("does not depend on a model SDK", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));
    const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
    expect(deps.filter((d) => MODEL_SDKS.includes(d))).toEqual([]);
  });
});
