import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { SITE_NAV } from "@/content/site-nav";
import UnlessHere from "@/components/UnlessHere";
import { SHELL_MAIN, PROSE_MEASURE } from "@/content/shell";
import FluidField from "@/components/FluidField";
import { GYM_FIELD, FIELD_READING } from "@/content/instrument-accents";
import { localHref, type Locale } from "@/lib/locale";
import { tFor } from "@/lib/i18n";
import LEARN_ZH from "@/content/zh/copy/learn";

/**
 * Reading-room shell (2026-07-16 brief §3.C7 — serves C2/N1, voice per D5).
 * Server-rendered static prose: AI crawlers don't run JS, so every word here
 * lands in raw HTML (§3.C8). Same gold/dark system as the gym (design bar:
 * consistency).
 *
 * ONE SHELL, TWO LANGUAGES (bilingual Part 2). `learn/layout.tsx` renders it in
 * English and `zh/learn/layout.tsx` in Chinese; it moved here from the English
 * layout unchanged, so the two sections cannot grow different footers.
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
const HEADER_LINKS = SITE_NAV.filter((l) => l.href !== "/learn");

export default function LearnShell({ children, locale }: { children: React.ReactNode; locale: Locale }) {
  const t = tFor(locale, LEARN_ZH);
  return (
    <main className={SHELL_MAIN}>
      <FluidField colors={FLUID} intensity={FIELD_READING} scrim={false} vignette />
      <div className="relative z-10">
        <SiteHeader locale={locale} links={HEADER_LINKS} />
        <div className={PROSE_MEASURE}>{children}</div>
        <p className="mt-14 text-[11px] text-muted/70">
          <UnlessHere href={localHref(locale, "/learn")}>
            <Link href={localHref(locale, "/learn")} className="transition hover:text-white">
              {t("The library")}
            </Link>{" "}
            ·{" "}
          </UnlessHere>
          <Link href={localHref(locale, "/bias")} className="transition hover:text-white">
            {t("Take the Prestige Test")}
          </Link>{" "}
          ·{" "}
          <Link href={localHref(locale, "/legal")} className="transition hover:text-white">
            {t("Terms · Privacy")}
          </Link>
        </p>
      </div>
    </main>
  );
}
