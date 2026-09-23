/**
 * THE READING FLOW'S EFFECTS RETURN NOTHING (blueprint Part 5).
 *
 * Found on the first rendered run, not by any test: `useEffect(() =>
 * window.scrollTo(...))` returns what `scrollTo` returns, React takes a returned
 * value as the effect's cleanup, and in the browser pane that value was not
 * undefined — the creation screen crashed into the error page. Every effect in
 * the flow must have a block body.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("the reading flow's effects", () => {
  const src = readFileSync("src/app/reading/ReadingFlow.tsx", "utf8");

  it("has effects to check (a floor)", () => {
    expect((src.match(/useEffect\(/g) ?? []).length).toBeGreaterThanOrEqual(4);
  });

  it("gives every effect a block body, so nothing is returned as a cleanup", () => {
    expect(src.match(/useEffect\(\(\)\s*=>\s*[^{\s]/g) ?? []).toEqual([]);
  });
});
