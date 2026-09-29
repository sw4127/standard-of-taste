import type { Metadata } from "next";
import { Suspense } from "react";
import SiteHeader from "@/components/SiteHeader";
import FluidField from "@/components/FluidField";
import BlueprintArgument from "@/components/BlueprintArgument";
import ZhTerms from "@/components/ZhTerms";
import { SHELL_MAIN, PROSE_MEASURE } from "@/content/shell";
import { GYM_FIELD, GYM_INK_BRIGHT, FIELD_READING } from "@/content/instrument-accents";
import { READING_KICKER, READING_TITLE, WHY_HEADING, WHY_LEAD } from "@/content/reading/copy";
import { READING_STATEMENT } from "@/content/reading/statement";
import { READING_STATEMENT_ZH } from "@/content/zh/copy/statements";
import READING_ZH from "@/content/zh/copy/reading";
import { SITE_NAV } from "@/content/site-nav";
import { localHref, type Locale } from "@/lib/locale";
import { tFor } from "@/lib/i18n";
import ReadingFlow from "./ReadingFlow";

/**
 * THE READING — the product's flagship (D3 amendment, BA-6).
 *
 * A listener's recent plays, read into lines that can be checked against the
 * plays, argued with, and carried into a prompt (BP-INSIGHT, BP-UNMET). The
 * flow is client-side — picking a listener, rejecting lines, choosing readings —
 * and runs the same deterministic engine the tests run. This page is a server
 * component for one reason: the "why this works" section renders the argument
 * from `docs/blueprint.md`, which only the server can read.
 *
 * D1 IS SUSPENDED HERE, BY NAME (CLAUDE.md, "D1 amendment, third surface"), and
 * the page says so on itself in the amendment's own words (`READING_STATEMENT`).
 *
 * ONE VIEW, TWO LANGUAGES (bilingual Part 2). `/zh/reading` renders the Chinese
 * statement from the constitution's "zh rendering" stamp, and the constitution
 * names it as a D1 surface on a line marked pending the owner's approval;
 * `site-d1.test.tsx` fails if the offers render on a route that line omits.
 */

const TITLE = "The reading — Standard of Taste";
const DESCRIPTION =
  "Four weeks of an illustrative listener's plays, read into lines you can check against the plays, argue with, and carry into a prompt.";

export function readingMetadata(locale: Locale): Metadata {
  const t = tFor(locale, READING_ZH);
  return {
    title: t(TITLE),
    description: t(DESCRIPTION),
    alternates: {
      canonical: localHref(locale, "/reading"),
      languages: { en: "/reading", "zh-Hans": "/zh/reading" },
    },
  };
}

export default function ReadingView({ locale }: { locale: Locale }) {
  const t = tFor(locale, READING_ZH);
  return (
    <main className={SHELL_MAIN}>
      <FluidField colors={GYM_FIELD} intensity={FIELD_READING} scrim={false} vignette />
      <div className="relative z-10">
        <SiteHeader locale={locale} links={SITE_NAV.filter((l) => l.href !== "/reading")} />
        <div className={PROSE_MEASURE}>
          <p className="mt-10 text-[0.65rem] font-bold tracking-[0.3em] text-muted">{t(READING_KICKER)}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.05] tracking-tight">
            <ZhTerms>{t(READING_TITLE)}</ZhTerms>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            {locale === "zh" ? READING_STATEMENT_ZH : READING_STATEMENT}
          </p>

          <Suspense fallback={null}>
            <ReadingFlow />
          </Suspense>

          <section id="why" className="mt-16 border-t border-white/10 pt-8">
            <h2 className="font-display text-2xl font-semibold">{t(WHY_HEADING)}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{t(WHY_LEAD)}</p>
            <div className="mt-6">
              <BlueprintArgument accent={GYM_INK_BRIGHT} locale={locale} />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
