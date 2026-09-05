import { DELICACY_LIVE } from "@/content/delicacy/items";
import {
  PRESTIGE_GOLD,
  DELICACY_ICE,
  THRESHOLD_VIOLET,
  SPREAD_ROSE,
} from "@/content/instrument-accents";
import MachineCard, { type MachineRef } from "./MachineCard";

export type { MachineRef };

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
/**
 * E10/S2: the card itself now lives in `MachineCard`, because the `/learn`
 * index had hand-written a second copy of it. `MachineRef` moved with the card
 * (the card is what consumes the shape) and is re-exported above, so the four
 * modules importing it from here keep working.
 */
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
  {
    id: "spread",
    href: "/spread",
    title: "The Ranking Test",
    accent: SPREAD_ROSE,
    line: "Six works a critic ranked. Whether your gaps fall where his did — never whether you agree.",
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
        <MachineCard key={m.id} machine={m} size="reveal" onPick={onPick} />
      ))}
    </div>
  );
}
