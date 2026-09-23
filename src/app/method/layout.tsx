import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { SITE_NAV } from "@/content/site-nav";
import { SHELL_MAIN, ARTICLE_MEASURE } from "@/content/shell";
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
// The neutral chrome colour this paragraph is about now lives in SiteHeader.
const FLUID = GYM_FIELD;

// The shared nav, minus this section (blueprint Part 7).
const HEADER_LINKS = SITE_NAV.filter((l) => l.href !== "/method");

export default function MethodLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className={SHELL_MAIN}>
      <FluidField colors={FLUID} intensity={FIELD_READING} scrim={false} vignette />
      <div className="relative z-10">
        <SiteHeader links={HEADER_LINKS} />
        <div className={ARTICLE_MEASURE}>{children}</div>
        {/* Reading room and the Lab moved to the shared header (blueprint Part 7). */}
        <p className="mt-14 text-[11px] text-muted/70">
          <Link href="/legal" className="transition hover:text-white">
            Terms · Privacy
          </Link>
        </p>
      </div>
    </main>
  );
}
