import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { SHELL_MAIN, PROSE_MEASURE } from "@/content/shell";
import FluidField from "@/components/FluidField";
import { GYM_FIELD, FIELD_READING } from "@/content/instrument-accents";

/**
 * Reading-room shell (2026-07-16 brief §3.C7 — serves C2/N1, voice per D5).
 * Server-rendered static prose: AI crawlers don't run JS, so every word here
 * lands in raw HTML (§3.C8). Same gold/dark system as the gym (design bar:
 * consistency).
 */

/**
 * BRAND CHROME IS NEUTRAL, NOT GOLD (PM user-testing, 2026-08-08).
 *
 * "STANDARD OF TASTE" used to render in the same gold as the Prestige Test's own
 * accent, so the brand read as that instrument and the Delicacy Trials looked
 * like a guest in someone else's house. Gold now belongs to Prestige, ice to
 * Delicacy, and the gym itself is neutral — which is the only arrangement in
 * which two instruments can actually be peers.
 */
// The neutral chrome colour this paragraph is about now lives in SiteHeader.
const FLUID = GYM_FIELD;

const HEADER_LINKS = [
  { href: "/method", label: "THE METHOD" },
  { href: "/", label: "THE GYM FLOOR" },
] as const;

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className={SHELL_MAIN}>
      <FluidField colors={FLUID} intensity={FIELD_READING} scrim={false} vignette />
      <div className="relative z-10">
        <SiteHeader links={HEADER_LINKS} />
        <div className={PROSE_MEASURE}>{children}</div>
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
