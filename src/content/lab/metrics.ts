/**
 * The metric dictionary — the Lab's semantic layer (artifact pivot §4).
 *
 * THIS FILE NO LONGER DEFINES METRICS (PM ruling RT-9c, 2026-08-07). Every
 * definition now lives in the module that computes it, so a developer changing
 * a formula is looking directly at the sentence describing it. This file only
 * AGGREGATES those declarations and stamps each with its source module.
 *
 * The previous arrangement — sixteen definitions in one file, far from the
 * arithmetic — is exactly how a dictionary goes stale while still looking
 * authoritative. That risk was raised as RT-9 and the PM chose to remove it
 * structurally rather than to watch for it.
 *
 * WHAT IS STILL HAND-WRITTEN, AND WHY (N3):
 * - `sessions_completed` is computed by a `.mjs` analysis script, which cannot
 *   export a typed spec. It is declared below and marked as such. This is the
 *   one place the drift risk survives, and it is named rather than hidden.
 * - The `computedIn` path per module. A module cannot state its own path
 *   without hardcoding it or reading `import.meta.url` (which bundlers
 *   rewrite), so it is written once per module here — six strings instead of
 *   sixteen — and lab.test.ts asserts every one of them exists on disk.
 *
 * RULES ENFORCED BY TEST (src/content/lab/lab.test.ts): unique ids, real
 * `computedIn` paths, explicit-null targets, panel references that resolve, and
 * that the aggregate really is sourced from the computing modules.
 */

import { BIAS_METRICS } from "@/engine/bias";
import { CALIBRATION_METRICS } from "@/engine/calibration";
import { COMPARISON_METRICS } from "@/engine/comparison";
import { DELICACY_METRICS } from "@/engine/delicacy";
import { SPREAD_METRICS } from "@/engine/spread";
import { fromModule, type MetricSpec } from "@/engine/metricMeta";
import { ESTIMATE_METRICS } from "@/analytics/estimate";
import { RECOVERY_METRICS } from "@/analytics/recovery";

export type { MetricDefinition, MetricOwner, MetricSpec, MetricUnit } from "@/engine/metricMeta";
export { fromModule } from "@/engine/metricMeta";

/**
 * Ops metrics: declared here because their source is an analysis script, not a
 * typed module. Kept visibly separate so "hand-written" is a property of a
 * named exception rather than an invisible default.
 */
const OPS_METRICS: MetricSpec[] = [
  {
    id: "sessions_completed",
    label: "Completed sessions",
    definition:
      "Sessions that reached the result screen. The denominator under every cohort statistic.",
    formula: "count(bias_result events), excluding ?ref=dev traffic",
    unit: "count",
    owner: "ops",
    target: "≥ 300 for defensible provisional norms; ≥ 100 for meaningful charts",
    caveat: "Currently 0 — the instrument has never been fielded.",
  },
];

export const METRICS = [
  ...fromModule("src/engine/bias.ts", BIAS_METRICS),
  ...fromModule("src/engine/comparison.ts", COMPARISON_METRICS),
  ...fromModule("src/engine/delicacy.ts", DELICACY_METRICS),
  ...fromModule("src/engine/spread.ts", SPREAD_METRICS),
  ...fromModule("src/engine/calibration.ts", CALIBRATION_METRICS),
  ...fromModule("src/analytics/estimate.ts", ESTIMATE_METRICS),
  ...fromModule("src/analytics/recovery.ts", RECOVERY_METRICS),
  ...fromModule("scripts/analysis/kpi-status.mjs", OPS_METRICS),
];

const byId = new Map(METRICS.map((m) => [m.id, m]));

// Duplicate ids across modules would silently shadow one another in the map,
// so the collision is caught at module load rather than at whichever render
// happened to want the loser.
if (byId.size !== METRICS.length) {
  const seen = new Set<string>();
  const dupes = METRICS.map((m) => m.id).filter((id) => (seen.has(id) ? true : (seen.add(id), false)));
  throw new Error(`lab: duplicate metric ids across modules: ${[...new Set(dupes)].join(", ")}`);
}

/** Throws on an unknown id: a panel referencing a nonexistent metric is a bug. */
export function metric(id: string) {
  const m = byId.get(id);
  if (!m) throw new Error(`lab: unknown metric id "${id}" (not in the dictionary)`);
  return m;
}

export function metricIds(): string[] {
  return METRICS.map((m) => m.id);
}
