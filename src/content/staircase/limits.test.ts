/**
 * E5/S7 — the Lab's limits page has a section for every limit the pipeline can
 * emit, and the Lab registry knows the page exists.
 *
 * WHY THIS IS THE TEST THAT MATTERS. RT-85a accepted the kbps label ON CONDITION
 * that the damage variation be stated in public. A limit kind with no section
 * would fall into the page's "other measured limits" bucket — visible, but
 * unexplained — and a limit dropped entirely would break the condition silently.
 * The manifest is the source of truth for what exists; this asserts the page
 * keeps up with it.
 */

import { describe, expect, it } from "vitest";
import { knownLimits } from "@/engine/staircase-manifest";
import { LAB_PANELS, LIVE_PANELS } from "@/content/lab/panels";
import { LIMIT_KIND_COPY, LIMIT_KIND_ORDER, RETIRED_SOURCE_NOTE } from "./limits";

describe("E5/S7 — every measured limit is explained", () => {
  it("every kind in the manifest has a section on the page", () => {
    const kinds = [...new Set(knownLimits().map((l) => l.kind))].sort();
    console.log(`[E5/S7] limit kinds in the pool: ${kinds.join(", ")}`);
    for (const kind of kinds) {
      expect(LIMIT_KIND_COPY[kind], `no section explains "${kind}"`).toBeTruthy();
      expect(LIMIT_KIND_ORDER, `"${kind}" has copy but no place in the reading order`).toContain(kind);
    }
    expect(knownLimits()).toHaveLength(9);
  });

  it("the reading order and the copy table agree", () => {
    expect([...LIMIT_KIND_ORDER].sort()).toEqual(Object.keys(LIMIT_KIND_COPY).sort());
  });

  it("the retirement note names the source and its measured reason", () => {
    expect(RETIRED_SOURCE_NOTE).toContain("pb6");
    expect(RETIRED_SOURCE_NOTE).toMatch(/3\.5x/);
    expect(RETIRED_SOURCE_NOTE).toMatch(/0\.67 ladder steps/);
  });
});

describe("E5/S7 — the Lab registry", () => {
  it("lists the limits panel as live, with a route", () => {
    const panel = LAB_PANELS.find((p) => p.id === "instrument-limits");
    expect(panel).toBeTruthy();
    expect(panel!.status).toBe("live");
    expect(panel!.href).toBe("/lab/instrument-limits");
    // No badge: acoustic measurements, no respondents to attribute them to.
    expect(panel!.dataSource).toBeNull();
    expect(LIVE_PANELS.map((p) => p.id)).toContain("instrument-limits");
  });
});
