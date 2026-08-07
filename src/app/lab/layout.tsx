import Link from "next/link";
import FluidField from "@/components/FluidField";

/**
 * The Lab shell (artifact pivot §4). Same gold/dark system, display face, and
 * tracked-caps voice as the reading room — the Lab is part of the gym, not a
 * bolted-on admin console (design bar: consistency).
 *
 * Wider container than /learn (max-w-5xl vs 2xl): this surface carries tables,
 * and squeezing a metric dictionary into prose width would force horizontal
 * scrolling on desktop, where there is no reason for it.
 */

const GOLD = "hsl(42 80% 62%)";
const FLUID = ["hsl(42 55% 48%)", "hsl(28 50% 44%)", "hsl(52 45% 46%)", "hsl(20 40% 40%)"];

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-5xl flex-col overflow-hidden px-6 py-12">
      <FluidField colors={FLUID} baseColor="#0B0A08" intensity={0.3} scrim={false} vignette />
      <div className="relative z-10">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-xs font-bold tracking-[0.4em]" style={{ color: GOLD }}>
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
          <Link href="/learn/methodology" className="transition hover:text-white">
            Methodology
          </Link>{" "}
          ·{" "}
          <Link href="/bias" className="transition hover:text-white">
            Take the Prestige Test
          </Link>
        </p>
      </div>
    </main>
  );
}
