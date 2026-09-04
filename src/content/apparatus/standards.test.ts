import { readFileSync, existsSync } from "node:fs";
import { describe, expect, it } from "vitest";

import manifest from "@/content/bias/manifest.json";
import {
  BORROWED_STANDARDS,
  LOUDNESS_TARGET_LUFS,
  externalStandards,
  inRepoStandards,
} from "./standards";

const collapse = (s: string) => s.replace(/\s+/g, " ").trim();

/**
 * The in-repo half of this registry is checkable in a way `scales.ts` never
 * could be, and these guards are the reason the distinction is worth drawing.
 * Every scan asserts it found something first: a guard that matches nothing
 * passes by having nothing to look at.
 */
describe("borrowed apparatus", () => {
  it("OPENS every in-repo citation and finds the passage really there", () => {
    const inRepo = inRepoStandards();
    expect(inRepo.length, "no in-repo entries — the strong half is empty").toBeGreaterThan(0);
    for (const entry of inRepo) {
      if (entry.binding.kind !== "in-repo") continue;
      const { path, anchor } = entry.binding;
      expect(existsSync(path), `${entry.id} → ${path}`).toBe(true);
      const body = collapse(readFileSync(path, "utf8"));
      expect(
        body.includes(collapse(anchor)),
        `${entry.id}: "${anchor}" is not in ${path}`,
      ).toBe(true);
    }
  });

  it("imports the loudness figure rather than restating it", () => {
    // A second copy of this number is a page telling a reader one target while
    // the pipeline normalises to another.
    expect(LOUDNESS_TARGET_LUFS).toBe(manifest.lufsTarget);
    expect(Number.isFinite(LOUDNESS_TARGET_LUFS)).toBe(true);
    // ...and no entry may hard-write it into prose.
    for (const entry of BORROWED_STANDARDS) {
      const prose = `${entry.what} ${entry.howWeUseIt} ${entry.departure ?? ""}`;
      expect(
        prose.includes(String(LOUDNESS_TARGET_LUFS)),
        `${entry.id} hand-writes the loudness target`,
      ).toBe(false);
    }
  });

  it("gives every external citation a publisher, an https url and a read date", () => {
    const external = externalStandards();
    expect(external.length, "no external entries — the weak-kind branch is untested").toBeGreaterThan(0);
    for (const entry of external) {
      if (entry.binding.kind !== "external") continue;
      const { publisher, title, url, retrieved } = entry.binding;
      expect(publisher.trim().length, entry.id).toBeGreaterThan(0);
      expect(title.trim().length, entry.id).toBeGreaterThan(0);
      expect(url.startsWith("https://"), `${entry.id}: ${url}`).toBe(true);
      expect(/^\d{4}-\d{2}-\d{2}$/.test(retrieved), `${entry.id}: ${retrieved}`).toBe(true);
    }
  });

  it("exercises both kinds of citation, so neither branch is theoretical", () => {
    expect(inRepoStandards().length + externalStandards().length).toBe(BORROWED_STANDARDS.length);
    expect(inRepoStandards().length).toBeGreaterThan(0);
    expect(externalStandards().length).toBeGreaterThan(0);
  });

  it("says what each standard is, what we do with it, and where we differ", () => {
    const ids = BORROWED_STANDARDS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const entry of BORROWED_STANDARDS) {
      expect(entry.name.trim().length, entry.id).toBeGreaterThan(0);
      expect(entry.what.length, `${entry.id} does not say what it governs`).toBeGreaterThan(30);
      expect(entry.howWeUseIt.length, `${entry.id} does not say how we use it`).toBeGreaterThan(40);
    }
    // A registry of borrowed credibility with no departures stated would be a
    // claim of compliance nobody audited.
    const withDeparture = BORROWED_STANDARDS.filter((s) => s.departure);
    expect(withDeparture.length, "no entry states a departure").toBeGreaterThan(0);
  });

  it("claims nothing about how well people score", () => {
    /*
     * The N3 line for this whole track. An entry may describe the apparatus;
     * a figure about human performance would be a cohort norm wearing a
     * citation. Scans the prose for the shapes that claim one.
     */
    const prose = BORROWED_STANDARDS.map(
      (s) => `${s.what} ${s.howWeUseIt} ${s.departure ?? ""}`,
    ).join(" ");
    expect(prose.length).toBeGreaterThan(0);
    expect(prose).not.toMatch(/\blisteners? (?:can|detect|hear|score|average)\b/i);
    expect(prose).not.toMatch(/\btrained (?:listeners|ears)\b/i);
    expect(prose).not.toMatch(/\bpercentile|\bon average\b|\bmost people\b/i);
  });
});
