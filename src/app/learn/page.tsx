import type { Metadata } from "next";
import Link from "next/link";
import { MACHINES } from "@/components/OtherMachines";
import MachineCard from "@/components/MachineCard";
import JsonLd from "@/components/JsonLd";
import { baseUrl } from "@/lib/site";
import { LEARN_PAGES } from "@/content/learn";
import { hasChinese, localHref, type Locale } from "@/lib/locale";
import { rich, tFor } from "@/lib/i18n";
import LEARN_ZH from "@/content/zh/copy/learn";

/**
 * Reading-room index (brief §3.C7). The gym's library: one card per
 * explainer, all server-rendered (§3.C8).
 */

/** In either language (bilingual Part 4); `/zh/learn` passes `locale="zh"`. */
export function learnIndexMetadata(locale: Locale): Metadata {
  const t = tFor(locale, LEARN_ZH);
  return {
    title: t("The Library — Standard of Taste"),
    description: t(
      "How the Taste Gym measures taste: Hume's five criteria, the Prestige Test, the Delicacy Trials, and the methodology — stated plainly, including what we refuse to claim.",
    ),
    alternates: { canonical: localHref(locale, "/learn"), languages: { en: "/learn", "zh-Hans": "/zh/learn" } },
    openGraph: {
      title: t("The Library — Standard of Taste"),
      description: t("Hume's five criteria of taste, and the instruments that turn them into measured numbers."),
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
  };
}

export const metadata = learnIndexMetadata("en");


export default function LearnIndex({ locale = "en" }: { locale?: Locale }) {
  const t = tFor(locale, LEARN_ZH);
  const zh = locale === "zh";
  const base = baseUrl();
  // A Chinese reader is listed only the pages that exist in Chinese; the rest follow as they land.
  const pages = zh ? LEARN_PAGES.filter((p) => hasChinese(`/learn/${p.slug}`)) : LEARN_PAGES;
  return (
    <div>
      <p className="mt-10 text-[0.65rem] font-bold tracking-[0.3em] text-muted">{t("THE LIBRARY")}</p>
      <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.05] tracking-tight">
        {t("The gym has a library.")}
      </h1>
      <p className="mt-5 text-[15px] leading-relaxed text-neutral-300">
        {rich(
          t(
            "In 1757 David Hume wrote {em} and named the five things a true judge needs: delicacy, practice, comparison, freedom from prejudice, and good sense. He never got to measure any of them. We built the machines. These pages explain each criterion, the instrument that operationalizes it, and the methodology — including the claims we deliberately refuse to make.",
          ),
          { em: <em>{t("Of the Standard of Taste")}</em> },
        )}
      </p>

      <div className="mt-9 flex flex-col gap-3">
        {pages.map((p) => (
          <Link
            key={p.slug}
            href={localHref(locale, `/learn/${p.slug}`)}
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/25"
          >
            <p className="font-display text-lg font-semibold transition-colors group-hover:text-[hsl(225_8%_90%)]">
              {t(p.title)}
            </p>
            <p className="mt-0.5 text-sm text-muted">{t(p.teaser)}</p>
          </Link>
        ))}
      </div>

      {/* E7/S24: this was a single gold button into the Prestige Test. The
          reading room is the product's search-facing surface, so every stranger
          who arrived by search was funnelled into one of three instruments. */}
      <p className="mt-10 text-sm text-muted">{t("Enough reading — the machines are through here.")}</p>
      <div className="mt-4 flex flex-col gap-3">
        {MACHINES.filter((m) => m.live).map((m) => (
          <MachineCard key={m.id} machine={m} size="index" locale={locale} />
        ))}
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: t("The Library — Standard of Taste"),
          url: `${base}${localHref(locale, "/learn")}`,
          ...(zh ? { inLanguage: "zh-Hans" } : {}),
          hasPart: pages.map((p) => ({
            "@type": "Article",
            headline: t(p.title),
            url: `${base}${localHref(locale, `/learn/${p.slug}`)}`,
          })),
        }}
      />
    </div>
  );
}
