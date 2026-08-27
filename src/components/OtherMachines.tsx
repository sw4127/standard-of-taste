import Link from "next/link";
import { DELICACY_LIVE } from "@/content/delicacy/items";
import { PRESTIGE_GOLD, DELICACY_ICE, THRESHOLD_VIOLET, tint } from "@/content/instrument-accents";

/**
 * THE OTHER TWO MACHINES, FROM ONE PLACE (E7/S23).
 *
 * The moment somebody finishes an instrument is the only moment they have
 * proved they will spend eight minutes on this product. Every reveal should
 * offer the other two — and before this, none of them offered both: the
 * Prestige reveal pointed at Delicacy, the Delicacy reveal pointed back at
 * Prestige, and the Threshold reveal pointed at neither. Whichever instrument
 * you finished, at least one of the others was invisible.
 *
 * WHY A COMPONENT AND NOT THREE MORE BLOCKS. The Prestige reveal hand-wrote
 * Delicacy's ice — `hsl(190 60% 55% / 0.35)` and `hsl(190 75% 62%)` — inside
 * `BiasFlow`. That is the same cross-instrument leak that left the Threshold
 * Test's A/B control painted in Delicacy's blue (E7/S21), and writing two more
 * of these by hand would have produced two more of it. Each machine's name and
 * colour now come from one registry, so a card can never describe an
 * instrument in the wrong instrument's colour.
 */
export interface MachineRef {
  id: string;
  href: string;
  title: string;
  accent: string;
  /** What it measures, in the user's words rather than Hume's. */
  line: string;
  live: boolean;
}

export const MACHINES: MachineRef[] = [
  {
    id: "bias",
    href: "/bias",
    title: "The Prestige Test",
    accent: PRESTIGE_GOLD,
    line: "How far a famous name moves what you hear.",
    live: true,
  },
  {
    id: "delicacy",
    href: "/delicacy",
    title: "The Delicacy Trials",
    accent: DELICACY_ICE,
    line: "One clip of each pair is quietly damaged. Find it, then name what is wrong.",
    live: DELICACY_LIVE,
  },
  {
    id: "threshold",
    href: "/threshold",
    title: "The Threshold Test",
    accent: THRESHOLD_VIOLET,
    line: "The smallest flaw you can still hear, in cents, milliseconds or kilobits.",
    live: true,
  },
];

export default function OtherMachines({
  from,
  onPick,
}: {
  /** The instrument the reader has just finished. */
  from: string;
  onPick?: (id: string) => void;
}) {
  const others = MACHINES.filter((m) => m.id !== from && m.live);
  if (others.length === 0) return null;

  return (
    <div className="mt-8 flex flex-col gap-3">
      <p className="text-[0.65rem] font-bold tracking-[0.3em] text-muted">THE OTHER MACHINES</p>
      {others.map((m) => (
        <Link
          key={m.id}
          href={m.href}
          onClick={() => onPick?.(m.id)}
          className="block rounded-2xl border p-5 transition hover:bg-white/[0.05]"
          style={{ borderColor: tint(m.accent), background: "rgba(255,255,255,0.03)" }}
        >
          <p className="font-display text-xl font-semibold" style={{ color: m.accent }}>
            {m.title}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted">{m.line}</p>
        </Link>
      ))}
    </div>
  );
}
