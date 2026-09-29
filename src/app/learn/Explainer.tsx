import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { baseUrl } from "@/lib/site";
import type { LearnPage } from "@/content/learn";
import { GYM_INK } from "@/content/instrument-accents";
import ZhTerms from "@/components/ZhTerms";
import { chinesePath, hasChinese, localHref, type Locale } from "@/lib/locale";
import { tFor } from "@/lib/i18n";
import LEARN_ZH from "@/content/zh/copy/learn";

/**
 * Shared explainer scaffold (brief §3.C7): renders the registry entry's
 * title + visible FAQ and emits Article / BreadcrumbList / FAQPage JSON-LD
 * (§3.B5 — GEO only; SERP expectation zero). Body prose comes in as children
 * so each page stays hand-written (D5: Hume narrates, no template mush).
 */

/* The reading room belongs to no instrument (RT-AG, RT-AR:a). */
const INK = GYM_INK;

/**
 * Per-page <head> metadata derived from the same registry entry. In Chinese
 * (bilingual Part 2) each field is the entry's English looked up in the library's
 * dictionary, so an English edit fails as a miss rather than drifting.
 */
export function explainerMetadata(page: LearnPage, locale: Locale = "en"): Metadata {
  const t = tFor(locale, LEARN_ZH);
  const path = `/learn/${page.slug}`;
  return {
    title: t(page.metaTitle),
    description: t(page.description),
    // A page with a Chinese version names the pair in both languages; a one-way
    // pair is ignored by search engines (red-team, bilingual Part 2).
    alternates: hasChinese(path)
      ? { canonical: localHref(locale, path), languages: { en: path, "zh-Hans": chinesePath(path) } }
      : { canonical: path },
    // images set EXPLICITLY: a page-level openGraph block without them
    // suppresses the root opengraph-image default on nested segments
    // (verified in prod 2026-07-17 — og:image came back empty).
    openGraph: {
      title: t(page.metaTitle),
      description: t(page.description),
      type: "article",
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
  };
}

export default function Explainer({
  page,
  kicker,
  children,
  locale = "en",
}: {
  page: LearnPage;
  /** Small label above the H1, e.g. "HUME'S CRITERIA · 04". */
  kicker: string;
  children: React.ReactNode;
  locale?: Locale;
}) {
  const t = tFor(locale, LEARN_ZH);
  const base = baseUrl();
  const url = `${base}${localHref(locale, `/learn/${page.slug}`)}`;
  const site = t("Standard of Taste");

  return (
    <article>
      <p className="mt-10 text-[0.65rem] font-bold tracking-[0.3em] text-muted">{t(kicker)}</p>
      <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.05] tracking-tight">
        <ZhTerms>{t(page.title)}</ZhTerms>
      </h1>

      {/* Prose links carry the accent colour instead of a bare underline
          (PM 2026-07-17); the underline appears only as hover feedback. */}
      <div className="mt-7 space-y-5 text-[15px] leading-relaxed text-neutral-300 [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-neutral-200 [&_strong]:font-semibold [&_strong]:text-white [&_a]:font-medium [&_a]:text-[hsl(225_8%_78%)] [&_a]:transition-colors [&_a:hover]:text-[hsl(225_8%_90%)] [&_a:hover]:underline [&_a:hover]:underline-offset-4">
        {children}
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold" style={{ color: INK }}>
          {t("Questions, answered straight")}
        </h2>
        <dl className="mt-5 space-y-6">
          {page.faq.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold text-white">{t(f.q)}</dt>
              <dd className="mt-1.5 text-[15px] leading-relaxed text-neutral-300">{t(f.a)}</dd>
            </div>
          ))}
        </dl>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: t(page.title),
          description: t(page.description),
          url,
          ...(locale === "zh" ? { inLanguage: "zh-Hans" } : {}),
          author: { "@type": "Organization", name: site },
          isPartOf: { "@type": "WebSite", name: site, url: base },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: site, item: locale === "en" ? base : `${base}${localHref(locale, "/")}` },
            { "@type": "ListItem", position: 2, name: t("The library"), item: `${base}${localHref(locale, "/learn")}` },
            { "@type": "ListItem", position: 3, name: t(page.title), item: url },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: page.faq.map((f) => ({
            "@type": "Question",
            name: t(f.q),
            acceptedAnswer: { "@type": "Answer", text: t(f.a) },
          })),
        }}
      />
    </article>
  );
}
