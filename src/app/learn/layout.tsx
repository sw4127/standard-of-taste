import Link from "next/link";
import FluidField from "@/components/FluidField";

/**
 * Reading-room shell (2026-07-16 brief §3.C7 — serves C2/N1, voice per D5).
 * Server-rendered static prose: AI crawlers don't run JS, so every word here
 * lands in raw HTML (§3.C8). Same gold/dark system as the gym (design bar:
 * consistency).
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
const GOLD = "hsl(42 80% 62%)";
const FLUID = ["hsl(42 55% 48%)", "hsl(28 50% 44%)", "hsl(52 45% 46%)", "hsl(20 40% 40%)"];

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-2xl flex-col overflow-hidden px-6 py-12">
      <FluidField colors={FLUID} baseColor="#0B0A08" intensity={0.35} scrim={false} vignette />
      <div className="relative z-10">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-xs font-bold tracking-[0.4em]" style={{ color: BRAND }}>
            THE TASTE GYM
          </p>
          {/* Nav = the same tracked-caps voice as the kicker (PM 2026-07-17:
              no bare underline/arrow links — they read cheap). */}
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
          <Link href="/bias" className="transition hover:text-white">
            Take the Prestige Test
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
