import Link from "next/link";
import FluidField from "@/components/FluidField";
import { GYM_FIELD, FIELD_READING } from "@/content/instrument-accents";

/**
 * The `/method` shell (E9/S5, Track E — approved RT-158a / RT-159a).
 *
 * SAME SYSTEM AS THE READING ROOM, deliberately. This page is read, not taken,
 * so it belongs to the same surface family as /learn and /lab: identical brand
 * chrome, identical field, identical footer voice. A page about how the project
 * keeps itself consistent would be a poor place to invent a fourth look.
 *
 * WIDER THAN /learn (3xl vs 2xl) AND NARROWER THAN /lab (5xl). The reading room
 * is running prose at prose measure; the Lab carries tables. This page carries
 * prose with quoted passages set apart from it, which needs more room than a
 * paragraph and less than a metric dictionary.
 *
 * BRAND CHROME STAYS NEUTRAL (PM user-testing 2026-08-08): gold belongs to the
 * Prestige Test, ice to Delicacy, violet to the Threshold Test, and the gym
 * itself is neutral. /method is not an instrument and takes no instrument's
 * colour.
 */
const BRAND = "rgba(244,245,248,0.72)";
const FLUID = GYM_FIELD;

export default function MethodLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-3xl flex-col overflow-hidden px-6 py-12">
      <FluidField colors={FLUID} baseColor="#0B0A08" intensity={FIELD_READING} scrim={false} vignette />
      <div className="relative z-10">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-xs font-bold tracking-[0.4em]" style={{ color: BRAND }}>
            THE TASTE GYM
          </p>
          <Link
            href="/"
            className="text-[0.65rem] font-bold tracking-[0.3em] text-muted transition hover:text-white"
          >
            THE GYM FLOOR
          </Link>
        </div>
        {children}
        <p className="mt-14 text-[11px] text-muted/70">
          <Link href="/learn" className="transition hover:text-white">
            Reading room
          </Link>{" "}
          ·{" "}
          <Link href="/lab" className="transition hover:text-white">
            The Lab
          </Link>{" "}
          ·{" "}
          <Link href="/legal" className="transition hover:text-white">
            Terms · Privacy
          </Link>
        </p>
      </div>
    </main>
  );
}
