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

import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BIAS_METRICS } from "@/engine/bias";
import { CALIBRATION_METRICS } from "@/engine/calibration";
import { DELICACY_METRICS } from "@/engine/delicacy";
import { ESTIMATE_METRICS } from "@/analytics/estimate";
import { RECOVERY_METRICS } from "@/analytics/recovery";
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

describe("lab — metrics are SOURCED from the modules that compute them (RT-9c)", () => {
  it("every module's declared metrics appear in the dictionary, stamped with that module", () => {
    const cases = [
      ["src/engine/bias.ts", BIAS_METRICS],
      ["src/engine/delicacy.ts", DELICACY_METRICS],
      ["src/engine/calibration.ts", CALIBRATION_METRICS],
      ["src/analytics/estimate.ts", ESTIMATE_METRICS],
      ["src/analytics/recovery.ts", RECOVERY_METRICS],
    ] as const;
    for (const [path, specs] of cases) {
      for (const spec of specs) {
        const m = metric(spec.id);
        expect(m.computedIn, spec.id).toBe(path);
        // The aggregator must pass definitions through untouched — if it ever
        // starts rewriting them, the module is no longer the source of truth.
        expect(m.formula, spec.id).toBe(spec.formula);
        expect(m.definition, spec.id).toBe(spec.definition);
        expect(m.caveat, spec.id).toBe(spec.caveat);
      }
    }
  });

  it("only the ops metric is hand-written in the lab (the named exception)", () => {
    const handWritten = METRICS.filter((m) => m.computedIn.endsWith(".mjs"));
    expect(handWritten.map((m) => m.id)).toEqual(["sessions_completed"]);
  });

  it("the module declarations account for EVERY metric — none is orphaned here", () => {
    const sourced = [
      ...BIAS_METRICS,
      ...DELICACY_METRICS,
      ...CALIBRATION_METRICS,
      ...ESTIMATE_METRICS,
      ...RECOVERY_METRICS,
    ].map((m) => m.id);
    const inDictionary = METRICS.filter((m) => !m.computedIn.endsWith(".mjs")).map((m) => m.id);
    expect(inDictionary.sort()).toEqual(sourced.sort());
  });

  it("the acceptance band in the dictionary tracks the CONSTANTS the gate reads", async () => {
    // The §1 band is enforced by ACCEPT_* in estimate.ts. If someone changes a
    // threshold and not the prose, these disagree — which is the whole failure
    // mode RT-9c was raised about, now caught rather than watched for.
    const { ACCEPT_P_MIN, ACCEPT_P_MAX, ACCEPT_DISCRIMINATION_MIN } = await import("@/analytics/estimate");
    expect(metric("item_p_value").target).toContain(String(ACCEPT_P_MIN));
    expect(metric("item_p_value").target).toContain(String(ACCEPT_P_MAX));
    expect(metric("item_discrimination").target).toContain(String(ACCEPT_DISCRIMINATION_MIN));
  });
});

describe("lab — extracted engine package stays in sync", () => {
  // The package copies are required to be byte-identical to the app modules
  // apart from a 2-line banner (docs/engine-extraction-checklist.md). Adding
  // metric declarations to the engine touched both; this guards the invariant
  // instead of relying on remembering it.
  const cases = [
    ["src/engine/bias.ts", "packages/hume-taste-engine/src/bias.ts"],
    ["src/engine/metricMeta.ts", "packages/hume-taste-engine/src/metricMeta.ts"],
  ] as const;

  for (const [appPath, pkgPath] of cases) {
    it(`${pkgPath} matches ${appPath} after its banner`, () => {
      const app = readFileSync(appPath, "utf8");
      const pkg = readFileSync(pkgPath, "utf8");
      const lines = pkg.split("\n");
      expect(lines[0]).toContain("EXTRACTED COPY");
      expect(lines.slice(2).join("\n")).toBe(app);
    });
  }

  it("the package imports nothing from the app (it must compile standalone)", () => {
    for (const [, pkgPath] of cases) {
      const body = readFileSync(pkgPath, "utf8")
        .split("\n")
        .filter((l) => /^\s*(import|export)\b.*\bfrom\b/.test(l));
      for (const line of body) expect(line, pkgPath).not.toMatch(/from\s+["']@\//);
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

  it("every live panel is REACHABLE (the dictionary lives on the index itself)", () => {
    // A live panel with no route is a claim with nothing behind it. panels.ts
    // throws at module load if this is violated; asserted here too so the
    // failure names the rule rather than surfacing as an import error.
    for (const p of LIVE_PANELS) {
      if (p.id === "metric-dictionary") continue;
      expect(p.href, `${p.id} is live but has no href`).toMatch(/^\/lab\//);
    }
  });

  it("no panel is both live and roadmapped", () => {
    for (const p of LIVE_PANELS) expect(p.plannedIn, p.id).toBeUndefined();
    for (const p of PENDING_PANELS) expect(p.href, p.id).toBeUndefined();
  });
});
