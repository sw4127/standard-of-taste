/**
 * NO SOURCE MODULE IS REACHABLE FROM NOTHING (2026-09-24).
 *
 * WHY. Two retired products — the World Cup and music quizzes, and the paid
 * report — had their pages turned into redirects in September, and the code
 * behind them stayed: 54 files and 372 tests, reachable from no page, route or
 * script, kept alive only by their own tests. Nothing noticed, because every
 * one of those tests passed. A handoff had to list the leftovers by hand.
 *
 * SO THIS READS THE IMPORT GRAPH. From every page, layout, API route and
 * metadata route under `src/app`, and from every build script under `scripts/`,
 * it follows imports into `src/`. Every non-test module must be reached, or be
 * named below as test infrastructure with its reason. The list is exact in both
 * directions: a listed module that becomes reachable, or stops existing, fails,
 * so the list cannot quietly grow a second graveyard.
 *
 * WHAT IT CANNOT SEE: a module reached only by `readFileSync` or by a string
 * built at runtime. None is known today.
 */
import { describe, expect, it } from "vitest";
import { appEntries, closure, isTest, walk } from "@/test-utils/import-graph";

/**
 * Modules that exist for tests, by design: registries a test reads, pattern
 * lists a scan applies, fixtures. Each is reached by tests and by nothing else.
 */
const TEST_INFRASTRUCTURE: Record<string, string> = {
  "src/content/blueprint-copies.ts": "the registry of blueprint copies that blueprint.test.ts holds to their modes",
  "src/content/carve-out.ts": "the carve-out patterns every site scan and template test applies (RT-Z10 a, BA-5)",
  "src/content/register.ts": "the offer register and no-comparison rule the reading's templates are tested against (BA-3)",
  "src/content/delicacy/gates.ts": "the Delicacy pool contract, proven both ways against the real pool and broken fixtures",
  "src/content/staircase/fixtures.ts": "staircase results the card and copy tests render",
  "src/lib/pixel-contrast.ts": "the contrast measurement the accent and card tests use",
  "src/lib/refs.ts": "the registry of shipped ?ref= entry tags, checked by refs.test.ts",
};

describe("every source module is reachable, or is named test infrastructure", () => {
  const scripts = walk("scripts").filter((f) => /\.(mjs|ts)$/.test(f) && !isTest(f));
  const entries = [...appEntries(), ...scripts];
  const reached = closure(entries);
  const modules = walk("src").filter((f) => /\.(tsx?|mjs)$/.test(f) && !isTest(f));

  it("walked a real graph (floors, so an empty walk cannot pass)", () => {
    // Measured 2026-09-24, after /api/checkout went: 57 app entries, 202 modules
    // reached from them. The floors catch an empty or broken walk, not a deletion.
    expect(appEntries().length).toBeGreaterThanOrEqual(40);
    expect(scripts.length).toBeGreaterThan(5);
    expect(reached.size).toBeGreaterThan(150);
  });

  it("reaches every non-test module from a page, a route or a build script", () => {
    const dead = modules.filter((f) => !reached.has(f) && !(f in TEST_INFRASTRUCTURE));
    expect(
      dead,
      "these modules are reachable from no page, route or script. Delete them with their tests, or, " +
        "if a test needs them by design, name them in TEST_INFRASTRUCTURE with the reason:",
    ).toEqual([]);
  });

  it("keeps the test-infrastructure list exact: every entry exists and is reached by nothing else", () => {
    const stale = Object.keys(TEST_INFRASTRUCTURE).filter((f) => !modules.includes(f) || reached.has(f));
    expect(stale, "these entries are gone or are now reachable; remove them from the list").toEqual([]);
  });
});
