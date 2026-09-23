/**
 * EVERY FICTIONAL NAME WAS CHECKED BEFORE IT SHIPPED (BA-8, BA-9).
 *
 * The check itself is a web search and cannot run in a test. What can: every
 * artist and track name in the listeners file must appear in the record of the
 * check, so a name added later without being searched fails the build instead
 * of reaching a page.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { LISTENERS } from "./listeners";

const RECORD = "docs/reading-names-check-2026-09-23.md";

describe("the fictional names were checked", () => {
  const record = readFileSync(RECORD, "utf8").replace(/\s+/g, " ");
  const clear = record.slice(record.indexOf("## Checked clear"), record.indexOf("**Partial overlaps"));

  it("read a real record (a floor)", () => {
    expect(clear.length).toBeGreaterThan(1500);
  });

  it("lists every artist and track name as checked clear", () => {
    const names = new Set(LISTENERS.flatMap((l) => l.tracks.flatMap((t) => [t.title, t.artist])));
    expect(names.size).toBeGreaterThanOrEqual(100);
    expect([...names].filter((n) => !clear.includes(n))).toEqual([]);
  });
});
