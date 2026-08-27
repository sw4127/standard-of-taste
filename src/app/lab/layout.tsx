import Link from "next/link";
import { MACHINES } from "@/components/OtherMachines";
import FluidField from "@/components/FluidField";
import { GYM_FIELD, FIELD_READING } from "@/content/instrument-accents";

/**
 * The Lab shell (artifact pivot §4). Same gold/dark system, display face, and
 * tracked-caps voice as the reading room — the Lab is part of the gym, not a
 * bolted-on admin console (design bar: consistency).
 *
 * Wider container than /learn (max-w-5xl vs 2xl): this surface carries tables,
 * and squeezing a metric dictionary into prose width would force horizontal
 * scrolling on desktop, where there is no reason for it.
 */

/**
 * BRAND CHROME IS NEUTRAL, NOT GOLD (PM user-testing, 2026-08-08).
 *
 * "THE TASTE GYM" used to render in the same gold as the Prestige Test's own
 * accent, so the brand read as that instrument and the Delicacy Trials looked
 * like a guest in someone else's house. Gold now belongs to Prestige, ice to
 * Delicacy, and the gym itself is neutral — which is the only arrangement in
 * which two instruments can actually be peers.
 */
const BRAND = "rgba(244,245,248,0.72)";
const FLUID = GYM_FIELD;

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-5xl flex-col overflow-hidden px-6 py-12">
      <FluidField colors={FLUID} intensity={FIELD_READING} scrim={false} vignette />
      <div className="relative z-10">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-xs font-bold tracking-[0.4em]" style={{ color: BRAND }}>
            THE TASTE GYM
          </p>
          <div className="flex items-baseline gap-4">
            {/* E9/S5, RT-U(a): /method is reachable from the two surfaces
                built to attract strangers. A page nothing points at is the
                kind that goes stale unnoticed. */}
            <Link
              href="/method"
              className="text-[0.65rem] font-bold tracking-[0.3em] text-muted transition hover:text-white"
            >
              THE METHOD
            </Link>
            <Link
              href="/"
              className="text-[0.65rem] font-bold tracking-[0.3em] text-muted transition hover:text-white"
            >
              THE GYM FLOOR
            </Link>
          </div>
        </div>
        {children}
        <p className="mt-14 text-[11px] text-muted/70">
          <Link href="/learn" className="transition hover:text-white">
            Reading room
          </Link>{" "}
          ·{" "}
          <Link href="/learn/methodology" className="transition hover:text-white">
            Methodology
          </Link>{" "}
          ·{" "}
          {/* E7/S24: this said "Take the Prestige Test" and named one of three.
              The Lab is a surface built to attract strangers, and it funnelled
              every one of them into a third of the product. */}
          {MACHINES.filter((m) => m.live).map((m, i) => (
            <span key={m.id}>
              {i > 0 ? " · " : ""}
              <Link href={m.href} className="transition hover:text-white" style={{ color: m.accent }}>
                {m.title}
              </Link>
            </span>
          ))}
        </p>
      </div>
    </main>
  );
}
