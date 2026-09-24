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

  /*
   * The creation mock's opening position is decided by `createScrollTop`, whose
   * cases are unit-tested; this holds the component to it, so the tested rule
   * cannot be bypassed by a scroll written inline (PRD part 4, S-4).
   */
  it("opens the creation mock where createScrollTop says, and scrolls it nowhere else", () => {
    // Comment lines dropped: the one above the effect names `window.scrollTo(...)` as a warning.
    const mock = src
      .slice(src.indexOf("function CreateMock"))
      .split(/\r?\n/)
      .filter((l) => !l.trim().startsWith("//"))
      .join("\n");
    expect(mock).toContain("createScrollTop({");
    expect(mock.match(/window\.scrollTo\(/g) ?? []).toHaveLength(1);
    expect(mock).toContain("window.scrollTo({ top });");
  });
});
