/**
 * S3 proof (artifact pivot §4, N3). The pre-registered criterion: a test fails
 * if any panel lacks a source badge or displays a metric id absent from the
 * dictionary.
 *
 * These are contract tests, not coverage theater. The failure they exist to
 * catch is a future panel that renders numbers with no provenance — which is
 * the one mistake on this surface that turns an honest artifact into a
 * dishonest one.
 */

import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { METRICS, metric, metricIds } from "./metrics";
import { LAB_PANELS, LIVE_PANELS, PENDING_PANELS } from "./panels";

const SOURCES = ["SIMULATED", "REAL", "MIXED"];

describe("lab — metric dictionary integrity", () => {
  it("ids are unique and machine-safe (they are referenced by panels)", () => {
    const ids = metricIds();
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z][a-z0-9_]*$/);
  });

  it("every metric carries a definition, a formula, and a unit", () => {
    for (const m of METRICS) {
      expect(m.label.length, m.id).toBeGreaterThan(0);
      expect(m.definition.length, m.id).toBeGreaterThan(20);
      expect(m.formula.length, m.id).toBeGreaterThan(0);
      expect(m.unit.length, m.id).toBeGreaterThan(0);
    }
  });

  it("`computedIn` points at a module that ACTUALLY EXISTS", () => {
    // A dictionary that drifts from the code is worse than none: it looks
    // authoritative while lying about where a number comes from.
    for (const m of METRICS) {
      expect(existsSync(m.computedIn), `${m.id} → ${m.computedIn}`).toBe(true);
    }
  });

  it("target is either a concrete band or an EXPLICIT null (never invented)", () => {
    for (const m of METRICS) {
      expect(m.target === null || m.target.length > 0, m.id).toBe(true);
    }
    // At least one metric must honestly admit it has no target, or the field
    // is decorative and someone has been making numbers up.
    expect(METRICS.some((m) => m.target === null)).toBe(true);
  });

  it("metric() throws on an unknown id rather than returning undefined", () => {
    expect(() => metric("not_a_real_metric")).toThrow(/unknown metric id/);
    expect(metric("alpha").label).toContain("Reliability");
  });

  it("every metric that can mislead carries a caveat (N3)", () => {
    // Named explicitly: these are the numbers where a naive reading is wrong.
    for (const id of ["item_p_value", "brier", "sway_pct", "alpha", "delicacy_accuracy"]) {
      expect(metric(id).caveat, id).toBeTruthy();
    }
  });
});

describe("lab — panel contract", () => {
  it("panel ids are unique", () => {
    const ids = LAB_PANELS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("EVERY metric a panel displays exists in the dictionary", () => {
    for (const panel of LAB_PANELS) {
      for (const id of panel.metricIds) {
        expect(() => metric(id), `${panel.id} → ${id}`).not.toThrow();
      }
    }
  });

  it("EVERY panel that shows data declares a valid source badge", () => {
    for (const panel of LAB_PANELS) {
      if (panel.metricIds.length > 0) {
        expect(panel.dataSource, `${panel.id} shows metrics but declares no data source`).not.toBeNull();
        expect(SOURCES, panel.id).toContain(panel.dataSource);
      }
    }
  });

  it("a panel with a null source shows NO metrics (nothing to attribute)", () => {
    // The inverse of the rule above: null is reserved for definitions and
    // schemas. It must never become an escape hatch for unbadged numbers.
    for (const panel of LAB_PANELS) {
      if (panel.dataSource === null) expect(panel.metricIds, panel.id).toHaveLength(0);
    }
  });

  it("pending panels name the slice that builds them; live panels do not pretend", () => {
    for (const p of PENDING_PANELS) expect(p.plannedIn, p.id).toMatch(/^S\d+$/);
    expect(LIVE_PANELS.length).toBeGreaterThan(0);
    expect(LIVE_PANELS.every((p) => p.plannedIn === undefined)).toBe(true);
  });

  it("no panel is silently dropped from the registry", () => {
    expect(LIVE_PANELS.length + PENDING_PANELS.length).toBe(LAB_PANELS.length);
  });

  it("the S3 shell ships exactly one live panel (no empty chrome — N2)", () => {
    expect(LIVE_PANELS.map((p) => p.id)).toEqual(["metric-dictionary"]);
  });
});
