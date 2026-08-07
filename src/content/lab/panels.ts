/**
 * Panel registry — the Lab's structure as DATA (artifact pivot §4).
 *
 * Panels are declared here rather than being hand-assembled in JSX so that two
 * rules can be enforced by test instead of by vigilance:
 *   1. every panel declares a data source, which becomes a visible badge (N3);
 *   2. every metric a panel displays exists in the dictionary.
 *
 * A panel that renders a number nobody defined, or that quietly drops its
 * SIMULATED badge, is the exact failure the pivot's §2 was written to prevent.
 * Structural enforcement beats a code-review habit.
 *
 * PENDING panels are listed honestly and rendered as roadmap, never as empty
 * chrome pretending to be a product. A dashboard of hollow panels is precisely
 * the theater N2 bans.
 */

import type { DataSource } from "@/analytics/estimate";
import { metric } from "./metrics";

export interface LabPanel {
  id: string;
  title: string;
  /** One line: what question this panel answers. */
  blurb: string;
  /**
   * Provenance of the numbers shown. `null` ONLY for panels that display no
   * data at all (definitions, schemas) — those carry no badge because there is
   * nothing to attribute.
   */
  dataSource: DataSource | null;
  /** Dictionary ids this panel surfaces. Validated at module load. */
  metricIds: string[];
  status: "live" | "pending";
  /** For pending panels: which slice builds it. Keeps the roadmap checkable. */
  plannedIn?: string;
}

export const LAB_PANELS: LabPanel[] = [
  {
    id: "metric-dictionary",
    title: "Metric dictionary",
    blurb:
      "Every number this product computes, with its formula, owner, acceptance band, and the caveat that travels with it.",
    // Definitions, not measurements — nothing here is attributable to a cohort.
    dataSource: null,
    metricIds: [],
    status: "live",
  },
  {
    id: "parameter-recovery",
    title: "Parameter recovery",
    blurb:
      "Does the estimator return the parameters that generated the data? Known-vs-estimated, with error against sample size.",
    dataSource: "SIMULATED",
    metricIds: ["item_p_rmse", "theta_recovery_r", "mean_beta_bias"],
    status: "pending",
    plannedIn: "S4",
  },
  {
    id: "instrument-health",
    title: "Instrument health",
    blurb:
      "Item difficulty and discrimination tables, characteristic curves, reliability, and the auto-flags that follow from them.",
    dataSource: "SIMULATED",
    metricIds: ["item_p_value", "item_discrimination", "alpha", "split_half"],
    status: "pending",
    plannedIn: "S9",
  },
  {
    id: "calibration-bias",
    title: "Calibration & bias distributions",
    blurb:
      "Brier scores, over- and under-confidence, and the distribution of prestige sway across respondents.",
    dataSource: "SIMULATED",
    metricIds: ["brier", "calibration_gap_pts", "sway_pct", "sway_raw_pct", "control_drift_pts", "sway_share"],
    status: "pending",
    plannedIn: "S10",
  },
  {
    id: "funnel-experiments",
    title: "Funnel, cohorts & experiment registry",
    blurb:
      "Entry through completion by channel, and every experiment with its hypothesis, stopping rule, and decision recorded before it ran.",
    dataSource: "SIMULATED",
    metricIds: ["sessions_completed"],
    status: "pending",
    plannedIn: "S11",
  },
  {
    id: "data-model",
    title: "Data model",
    blurb: "Entity relationships, the event schema, and the pipeline from a tap to a statistic.",
    dataSource: null,
    metricIds: [],
    status: "pending",
    plannedIn: "S12",
  },
];

// Fail at module load, not at render: a bad reference should break the build
// and the test run, not produce a page with a hole in it.
for (const panel of LAB_PANELS) {
  for (const id of panel.metricIds) metric(id);
}

export const LIVE_PANELS = LAB_PANELS.filter((p) => p.status === "live");
export const PENDING_PANELS = LAB_PANELS.filter((p) => p.status === "pending");
