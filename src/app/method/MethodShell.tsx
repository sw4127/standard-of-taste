import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { SITE_NAV } from "@/content/site-nav";
import { SHELL_MAIN, ARTICLE_MEASURE } from "@/content/shell";
import FluidField from "@/components/FluidField";
import { GYM_FIELD, FIELD_READING } from "@/content/instrument-accents";
import { localHref, type Locale } from "@/lib/locale";
import { tFor } from "@/lib/i18n";
import METHOD_ZH from "@/content/zh/copy/method";

/**
 * /method's shell, in either language (bilingual Part 2). It moved here from the
 * English layout unchanged, so `/method` and `/zh/method` cannot grow different
 * chrome. The neutral brand colour lives in SiteHeader.
 */
const FLUID = GYM_FIELD;

// The shared nav, minus this section (blueprint Part 7).
const HEADER_LINKS = SITE_NAV.filter((l) => l.href !== "/method");

export default function MethodShell({ children, locale }: { children: React.ReactNode; locale: Locale }) {
  const t = tFor(locale, METHOD_ZH);
  return (
    <main className={SHELL_MAIN}>
      <FluidField colors={FLUID} intensity={FIELD_READING} scrim={false} vignette />
      <div className="relative z-10">
        <SiteHeader locale={locale} links={HEADER_LINKS} />
        <div className={ARTICLE_MEASURE}>{children}</div>
        {/* Reading room and the Lab moved to the shared header (blueprint Part 7). */}
        <p className="mt-14 text-[11px] text-muted/70">
          <Link href={localHref(locale, "/legal")} className="transition hover:text-white">
            {t("Terms · Privacy")}
          </Link>
        </p>
      </div>
    </main>
  );
}
