/**
 * EVERY LIVE MACHINE IS IN THE SITEMAP (E17/S7).
 *
 * Found while adding the fourth machine: `/threshold` had never been in the
 * map. Two of four live instruments were unlisted, one of them since the day it
 * shipped, so every crawler was being told about half the product — and nothing
 * anywhere noticed, because the map is a hand-written array and a hand-written
 * array is a list of what somebody remembered.
 *
 * Derived from `MACHINES`, so a fifth machine fails this the day it ships
 * rather than the day somebody happens to read the file.
 */
import { describe, expect, it } from "vitest";
import sitemap from "./sitemap";
import { MACHINES } from "@/components/OtherMachines";

const paths = () => sitemap().map((e) => new URL(e.url).pathname.replace(/\/$/, "") || "/");

describe("the sitemap lists the product that shipped", () => {
  it("finds the machines before asserting anything about them", () => {
    expect(MACHINES.filter((m) => m.live).length).toBeGreaterThan(0);
    expect(paths().length).toBeGreaterThan(5);
  });

  it("contains every live machine's route", () => {
    const listed = new Set(paths());
    const missing = MACHINES.filter((m) => m.live)
      .filter((m) => !listed.has(m.href))
      .map((m) => `${m.title} (${m.href})`);
    expect(
      missing,
      "live machines absent from the sitemap — a crawler is being told about a smaller product",
    ).toEqual([]);
  });

  it("lists no route twice", () => {
    const all = paths();
    expect(new Set(all).size).toBe(all.length);
  });

  it("gives every entry an absolute url", () => {
    for (const entry of sitemap()) {
      expect(() => new URL(entry.url)).not.toThrow();
      expect(entry.url.startsWith("http")).toBe(true);
    }
  });
});
