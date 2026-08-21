import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { thresholdShareQuery, thresholdResultPath, thresholdCardPath } from "./share-links";

const SHARE = { slug: "pitch", seed: 4242, answers: "1101" };
const LOSSY = { slug: "compression", seed: 7, answers: "10", sourceId: "pb4" };

describe("E6/S17 — the card and the page describe the SAME session", () => {
  it("builds both paths from one payload", () => {
    const q = thresholdShareQuery(SHARE);
    expect(thresholdResultPath(SHARE)).toContain(q);
    expect(thresholdCardPath("og", SHARE)).toContain(q);
    // The property that matters: strip the route and the two carry the same
    // payload character for character. A card that disagreed with its page
    // would be describing somebody else's session.
    expect(thresholdCardPath("square", SHARE).split("&").slice(2).join("&")).toBe(q);
  });

  it("carries the recording for source-locked families and omits it otherwise", () => {
    expect(thresholdShareQuery(LOSSY)).toContain("src=pb4");
    expect(thresholdShareQuery(SHARE)).not.toContain("src=");
  });

  it("encodes the seed as a string, so a 0 seed survives", () => {
    expect(thresholdShareQuery({ ...SHARE, seed: 0 })).toContain("s=0");
  });

  /**
   * THE REGRESSION THIS FILE EXISTS FOR. S16 built this URL twice — once in the
   * component, once in `generateMetadata` — in the slice immediately after a
   * three-slice sweep for exactly that defect. Both copies were correct on the
   * day they were written, which is true of every instance the sweep found.
   *
   * So the guard is not "are they equal today" but "is there more than one".
   */
  it("no surface hand-builds the threshold card URL", () => {
    const files = execSync('git ls-files "src/app/**/*.tsx" "src/app/**/*.ts"', { encoding: "utf8" })
      .trim()
      .split("\n")
      .filter(Boolean)
      // The route that SERVES the path documents it in its own header, which is
      // not a second builder. Everything else mentioning it is one.
      .filter(
        (f) =>
          !f.endsWith("share-links.ts") &&
          !f.endsWith(".test.ts") &&
          f !== "src/app/api/threshold-card/route.tsx",
      );
    const offenders = files.filter((f) => /\/api\/threshold-card\?/.test(readFileSync(f, "utf8")));
    expect(
      offenders,
      "these build the card URL by hand instead of calling thresholdCardPath: " + offenders.join(", "),
    ).toEqual([]);
  });
});
