import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { SITE_NAV } from "@/content/site-nav";
import { SHELL_MAIN } from "@/content/shell";
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
 * "STANDARD OF TASTE" used to render in the same gold as the Prestige Test's own
 * accent, so the brand read as that instrument and the Delicacy Trials looked
 * like a guest in someone else's house. Gold now belongs to Prestige, ice to
 * Delicacy, and the gym itself is neutral — which is the only arrangement in
 * which two instruments can actually be peers.
 */
// The neutral chrome colour this paragraph is about now lives in SiteHeader.
const FLUID = GYM_FIELD;

// The shared nav, minus this section (blueprint Part 7).
const HEADER_LINKS = SITE_NAV.filter((l) => l.href !== "/lab");

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className={SHELL_MAIN}>
      <FluidField colors={FLUID} intensity={FIELD_READING} scrim={false} vignette />
      <div className="relative z-10">
        <SiteHeader links={HEADER_LINKS} />
        {children}
        <p className="mt-14 text-[11px] text-muted/70">
          {/* "Reading room" went to the shared header (blueprint Part 7); a footer
              link to the same room would offer it twice (site-doors.test.tsx). */}
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
