import Link from "next/link";
import { tint } from "@/content/instrument-accents";

/**
 * ONE CARD FOR AN INSTRUMENT, WRITTEN ONCE (E10/S2, Track F3).
 *
 * This markup existed twice: in `OtherMachines` (the block offering the other
 * two machines after a reveal) and hand-written again in the `/learn` index.
 * Same anchor, same radius, same padding, same border derived from the
 * machine's accent, same display title in the accent, same muted line beneath.
 *
 * WHY THAT MATTERED, given both copies rendered correctly. The registry in
 * `OtherMachines` exists because instrument colours had been copy-pasted across
 * six files apiece and had already drifted — the Threshold Test's own A/B
 * control rendered in the Delicacy Trials' blue for a whole slice (E7/S21).
 * Hand-writing the card that READS the registry reintroduces the same hazard
 * one level up: the `/learn` copy carried its own inline tint expression, so
 * when `tint` was fixed in E10/S1 there was a third site that had to be found
 * before the fix was real. It was found. The next one might not be.
 *
 * WHY A SIZE VARIANT RATHER THAN ONE SIZE. The two surfaces genuinely differ:
 * the reading room lists all three machines in a column of many cards, and a
 * reveal offers exactly two at the end of a session someone just spent eight
 * minutes on. `text-lg` there and `text-xl` here was not drift, it was density
 * — but it was UNDECLARED density, indistinguishable from drift by anyone
 * reading the two files. Naming the variants makes the difference a decision
 * instead of an accident, and makes a third, unnamed size impossible to add by
 * accident.
 *
 * The rendered markup is byte-identical to what both surfaces emitted before
 * this component existed, `text-left` included. That class is inert in this
 * document (measured: it computes to `left`, against the reveal's inherited
 * `start`, and `<html lang="en">` carries no `dir`, so the two lay out
 * identically) — but "inert" is a reason to remove it in a slice about
 * removing it, not to quietly change a page during a refactor whose whole
 * claim is that nothing changed.
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

/**
 * `index` — the reading room's list of everything. `reveal` — the two machines
 * offered at the end of a finished session.
 */
export type MachineCardSize = "index" | "reveal";

const TITLE_SIZE: Record<MachineCardSize, string> = {
  index: "text-lg",
  reveal: "text-xl",
};

/** The index list inherited `text-left`; the reveal never had it. See above. */
const ANCHOR_EXTRA: Record<MachineCardSize, string> = {
  index: " text-left",
  reveal: "",
};

export default function MachineCard({
  machine,
  size,
  onPick,
}: {
  machine: MachineRef;
  size: MachineCardSize;
  onPick?: (id: string) => void;
}) {
  return (
    <Link
      href={machine.href}
      /*
       * THE CONDITIONAL IS LOAD-BEARING, NOT TIDINESS. `OtherMachines` wrote
       * `onClick={() => onPick?.(m.id)}` — an inline function, always created.
       * That is safe there because every caller is a client component. It is
       * NOT safe here: `/learn` is a server component, `Link` is a client
       * component, and a server component may not hand a function across that
       * boundary. Written the unconditional way, this card renders on a reveal
       * and throws on the reading room. `undefined` crosses fine.
       */
      onClick={onPick ? () => onPick(machine.id) : undefined}
      className={`block rounded-2xl border p-5${ANCHOR_EXTRA[size]} transition hover:bg-white/[0.05]`}
      style={{ borderColor: tint(machine.accent), background: "rgba(255,255,255,0.03)" }}
    >
      <p className={`font-display ${TITLE_SIZE[size]} font-semibold`} style={{ color: machine.accent }}>
        {machine.title}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-muted">{machine.line}</p>
    </Link>
  );
}
