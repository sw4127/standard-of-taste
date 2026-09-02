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
  /**
   * FOR A PENDING PANEL: WHY IT IS NOT BUILT. Required, enforced at module load.
   *
   * The roadmap used to carry `plannedIn` alone — a slice name — and nothing
   * else. That reads as "coming soon", which is a promise, and three of the
   * slice names it carried ("S10", "S11", "S12") belonged to the artifact-pivot
   * plan and had not existed for weeks. A reader was being shown a schedule
   * that was not real, in place of a reason that was.
   *
   * So the reason is mandatory and the schedule is optional, which is the
   * correct way round: this product can always say why something is absent, and
   * can rarely say when it will arrive.
   */
  absent?: string;
  /**
   * Which slice builds it — ONLY where a live plan names one. Absent is the
   * normal case and means nobody has scheduled it, not that it is forgotten.
   */
  plannedIn?: string;
  /** Route, for panels that have their own page. Required once status is live. */
  href?: string;
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
    status: "live",
    href: "/lab/recovery",
  },
  {
    id: "instrument-health",
    title: "Instrument health",
    blurb:
      "Item difficulty and discrimination tables, characteristic curves, reliability, and the auto-flags that follow from them.",
    dataSource: "SIMULATED",
    metricIds: ["item_p_value", "item_discrimination", "alpha", "split_half"],
    status: "live",
    href: "/lab/instrument-health",
  },
  {
    id: "instrument-limits",
    title: "What this instrument cannot do",
    blurb:
      "Every limit the clip pipeline measured in the threshold ladders and could not fix — rungs that are not separable, levels whose damage varies by passage, and the bottom of what the rulers can read.",
    /**
     * NO BADGE. These are acoustic measurements of audio files; no respondents
     * are involved, so SIMULATED would be wrong and REAL would imply a cohort
     * that does not exist. Same reasoning as Layer A on instrument-health.
     */
    dataSource: null,
    metricIds: [],
    status: "live",
    href: "/lab/instrument-limits",
  },
  {
    id: "calibration-bias",
    title: "Calibration & bias distributions",
    blurb:
      "Brier scores, over- and under-confidence, and the distribution of prestige sway across respondents.",
    dataSource: "SIMULATED",
    metricIds: ["brier", "calibration_gap_pts", "sway_pct", "sway_raw_pct", "control_drift_pts", "sway_share"],
    status: "pending",
    absent:
      "A distribution is a fact about a group of people, and no group has been through this yet. " +
      "Simulating one would draw the model we assumed rather than anything measured — a shape " +
      "with no information in it, wearing the badge of a finding.",
  },
  {
    /**
     * SPLIT FROM `funnel-experiments` (E15/S2).
     *
     * One entry used to carry both subjects: "Entry through completion by
     * channel, AND every experiment with its hypothesis". That made the panel
     * unanswerable, because the blueprint rules opposite things about its two
     * halves — build the registry, never build the funnel. A panel that bundles
     * two decisions can only be half right.
     */
    id: "experiment-registry",
    title: "Falsified hypotheses",
    blurb:
      "Everything this project believed, tested, and had to abandon — with the measurement that killed it and where the derivation lives.",
    /**
     * NO BADGE. These are decisions and the evidence behind them, not
     * measurements of respondents — same reasoning as the instrument-limits
     * page. The individual findings carry their own provenance.
     */
    dataSource: null,
    metricIds: [],
    status: "pending",
    absent: "Being assembled from the record now.",
    plannedIn: "E15/S6–S7",
  },
  {
    id: "funnel-cohort",
    title: "Funnel & cohorts",
    blurb:
      "Entry through completion by channel, and what each cohort did after arriving.",
    dataSource: "SIMULATED",
    metricIds: ["sessions_completed"],
    status: "pending",
    /**
     * PM ruling RT-J, re-framed: he rejected "we have no data" as a poor
     * demonstration. So this reason states the ARITHMETIC of the absence rather
     * than apologising for it.
     *
     * IT POINTS AT THE SPECIFICATION, AND ONLY SINCE E15/S3 BUILT ONE. The S2
     * draft of this sentence already said "the specification it would implement
     * is below" — while that specification was still a slice away. A page
     * claiming something it did not have, on the surface whose entire argument
     * is that it does not do that. Caught by reading the built page, and the
     * rule it cost: a sentence citing something ships in the same slice as the
     * thing it cites, never one earlier.
     */
    absent:
      "A funnel is a set of ratios, and a ratio needs a denominator. This one has none: nobody " +
      "has been through the instrument, so every rate it could print would be zero divided by " +
      "zero. What it would measure, and how much traffic each step would need before its rate " +
      "could be published at all, is specified below.",
  },
  {
    id: "data-model",
    title: "Data model",
    blurb:
      "Everything this product stores about a person, every event it sends away, and the path from one tap to one statistic — with every key, cap and event read from the code that owns it.",
    /**
     * NO BADGE. A schema, not a measurement: no respondents are involved, so
     * SIMULATED would be wrong and REAL would imply a cohort that does not
     * exist. Same reasoning as the metric dictionary and instrument-limits.
     */
    dataSource: null,
    metricIds: [],
    status: "live",
    href: "/lab/data-model",
  },
];

/**
 * The panel contract, as ONE function rather than a loop body.
 *
 * Exported so the test can call THIS, on panels that do not exist. A test that
 * re-implements the predicate proves only that the test's copy works — the
 * guard-weaker-than-its-name failure, which this repo has paid for repeatedly.
 */
export function validatePanel(panel: LabPanel): void {
  for (const id of panel.metricIds) metric(id);
  if (panel.status === "live" && panel.id !== "metric-dictionary" && !panel.href) {
    throw new Error(`lab: live panel "${panel.id}" has no href — it would be unreachable`);
  }
  /*
   * AN UNBUILT PANEL MUST SAY WHY, HERE, WHERE IT CANNOT BE FORGOTTEN.
   *
   * The roadmap is a list of things this product does not have, published on
   * the page that argues it is honest about what it has. A row with no reason
   * beside it reads as "coming soon", which is a promise nobody made, and it is
   * the one thing on the Lab that could quietly become untrue by doing nothing.
   */
  if (panel.status === "pending" && !panel.absent?.trim()) {
    throw new Error(`lab: pending panel "${panel.id}" does not say why it is absent`);
  }
  if (panel.status === "live" && panel.absent) {
    throw new Error(`lab: live panel "${panel.id}" still carries an absence reason`);
  }
}

// Fail at module load, not at render: a bad reference should break the build
// and the test run, not produce a page with a hole in it.
for (const panel of LAB_PANELS) validatePanel(panel);

export const LIVE_PANELS = LAB_PANELS.filter((p) => p.status === "live");
export const PENDING_PANELS = LAB_PANELS.filter((p) => p.status === "pending");
