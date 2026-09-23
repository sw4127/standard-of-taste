import type { DataSource } from "@/analytics/estimate";
import { PRESTIGE_GOLD, tint } from "@/content/instrument-accents";

/**
 * Data-provenance badge (artifact pivot §2/§4 — N3 made visible).
 *
 * Every panel showing numbers carries one. The point is that a reader can never
 * mistake a number generated from a model for a number measured from people.
 *
 * COLOUR DISCIPLINE (design bar: one accent in play): this does NOT introduce a
 * second hue. REAL is the brand gold — solid, filled, the earned state.
 * SIMULATED is neutral and DASHED; the dashed border does the semantic work
 * that a red/amber would otherwise do, and reads as provisional at a glance
 * without fighting the accent. MIXED is gold but dashed: partly earned.
 */

/**
 * A lighter gold for the badge's own text, so small type on a gold edge stays
 * legible. Local on purpose (E10/S4a): it is used by this file alone, and a
 * shade with one caller belongs beside its caller — the registry holds the
 * colours instruments are IDENTIFIED by, not every derived tone in the product.
 */
const GOLD_INK = "hsl(42 80% 72%)";

/**
 * WHAT A NUMBER WAS MEASURED FROM, which is wider than who answered.
 *
 * `DataSource` describes RESPONSES — generated, real, or both. MEASURED is the
 * one badge that is not about responses at all: a figure taken off the shipped
 * audio files by the render pipeline. It exists because, until Track V/S7, the
 * Lab badged those figures REAL, and the REAL badge's own note says "measured
 * from real respondents" — on a page of a product with zero respondents, whose
 * legend says no real cohort exists. The audio figures are real. They are not
 * about people, and a badge that implies they are is the N3 failure it was
 * built to prevent.
 */
export type BadgeSource = DataSource | "MEASURED";

const STYLES: Record<BadgeSource, { className: string; style?: React.CSSProperties; note: string }> = {
  MEASURED: {
    className: "border-solid border-white/35 text-neutral-300",
    note: "measured off the shipped audio files — no people involved",
  },
  SIMULATED: {
    className: "border-dashed border-white/35 text-muted",
    note: "generated from a known model — not measured from people",
  },
  MIXED: {
    className: "border-dashed",
    style: { borderColor: tint(PRESTIGE_GOLD, 0.55), color: GOLD_INK },
    note: "combines model-generated and measured responses",
  },
  REAL: {
    className: "border-solid",
    style: { borderColor: PRESTIGE_GOLD, color: GOLD_INK },
    note: "measured from real respondents",
  },
};

export default function SourceBadge({ source, className = "" }: { source: BadgeSource; className?: string }) {
  const s = STYLES[source];
  return (
    <span
      // `title` carries the explanation to anyone who hovers; the visible word
      // carries it to everyone else. Neither is optional.
      title={s.note}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.6rem] font-bold tracking-[0.18em] ${s.className} ${className}`}
      style={s.style}
    >
      {source}
    </span>
  );
}

export { STYLES as SOURCE_BADGE_STYLES };
