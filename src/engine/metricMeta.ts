/**
 * Metric metadata types (PM ruling RT-9c / RT-12a, 2026-08-07).
 *
 * WHY THIS LIVES IN src/engine: a metric's definition and formula belong NEXT
 * TO the code that computes them. When they live in a separate dictionary file,
 * the two drift — the implementation changes, the prose does not, and the
 * dictionary keeps looking authoritative while describing something that is no
 * longer true. Declaring the metric in the same module as its arithmetic means
 * a developer changing the formula is looking straight at the sentence that
 * describes it.
 *
 * ZERO DEPENDENCIES BY CONTRACT: this file is imported by engine modules that
 * are extracted into the publishable `hume-taste-engine` package, which is
 * required to contain no `@/...` app imports. Anything added here must keep
 * that true, and this file must be copied into the package alongside them.
 *
 * These are plain data — a consumer of the published package gets a
 * self-documenting instrument, which is strictly better than an undocumented
 * one, so extraction CARRIES them rather than stripping them (RT-12a).
 */

/** Measurement scale of a metric's value. */
export type MetricUnit =
  | "proportion"
  | "percent"
  | "points"
  | "logits"
  | "correlation"
  | "count";

/**
 * Who is accountable for the number moving — the BI ownership column.
 *
 * There is deliberately no "product" owner yet: product metrics (completion,
 * share, return rate) require a fielded instrument, and declaring the category
 * while nothing fills it is scaffolding pretending to be structure.
 */
export type MetricOwner = "instrument" | "psychometrics" | "ops";

/**
 * A metric as DECLARED BESIDE its implementation.
 *
 * Note the absence of `computedIn`: a module cannot state its own path without
 * either hardcoding it (which can go stale on a move) or reading
 * `import.meta.url` (which bundlers rewrite). The aggregator attaches it once
 * per module instead, and a test asserts the file exists.
 */
export interface MetricSpec {
  /** Stable identifier. Referenced by lab panels; changing one is a breaking change. */
  id: string;
  label: string;
  /** Plain language. What does this number mean to someone who is not us? */
  definition: string;
  /** The formula as actually implemented, not an idealized version of it. */
  formula: string;
  unit: MetricUnit;
  owner: MetricOwner;
  /** A concrete acceptance band, or null when we have no honest target yet. */
  target: string | null;
  /** Said EVERY time the number is shown. Honesty policy lives in this field. */
  caveat?: string;
}

/** A metric once the aggregator has attached where it is computed. */
export interface MetricDefinition extends MetricSpec {
  computedIn: string;
}

/**
 * Stamp a module's specs with the module that computes them.
 *
 * Deliberately not clever: the path is written once per module rather than
 * sixteen times per metric, and its existence on disk is asserted by test. That
 * is as close to "cannot be wrong" as this gets without a codegen step.
 */
export function fromModule(computedIn: string, specs: MetricSpec[]): MetricDefinition[] {
  return specs.map((spec) => ({ ...spec, computedIn }));
}
