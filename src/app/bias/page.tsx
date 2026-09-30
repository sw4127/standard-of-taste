import type { Metadata } from "next";
import { numberWord } from "@/content/vocabulary/numbers";
import { BIAS_CLIP_COUNT, BIAS_SESSION_MINUTES } from "@/content/instrument-shape";
import BiasFlow from "./BiasFlow";
import JsonLd from "@/components/JsonLd";
import { baseUrl } from "@/lib/site";
import { localHref, type Locale } from "@/lib/locale";
import { tFor } from "@/lib/i18n";
import BIAS_ZH from "@/content/zh/copy/bias";

/**
 * The Prestige-Bias Test (memo D2 Instrument 1, D3 v1 flagship).
 * Naming is provisional — "gym" product naming is open per memo §9.5.
 */
/*
 * ONE PAGE, TWO LANGUAGES (bilingual Part 4). `/zh/bias` renders this page with `locale="zh"`;
 * the flow reads its language from the address. English counts are words, Chinese counts digits.
 */
export function biasMetadata(locale: Locale): Metadata {
  const t = tFor(locale, BIAS_ZH);
  const n = locale === "zh" ? BIAS_CLIP_COUNT : numberWord(BIAS_CLIP_COUNT);
  const description = t(
    "Rate {n} clips with just your ears. Rate them again with the names attached. The gap is your number.",
    { n },
  );
  return {
  title: t("The Prestige Test — do you hear the music, or the name?"),
  description,
  alternates: { canonical: localHref(locale, "/bias"), languages: { en: "/bias", "zh-Hans": "/zh/bias" } },
  openGraph: {
    title: t("The Prestige Test — do you hear the music, or the name?"),
    description,
    // No `images`: `./opengraph-image.tsx` is this page's own card (the site's
    // default is the reading's since BA-6), and the file convention supplies it.
  },
  };
}

export const metadata = biasMetadata("en");

export default function BiasPage({ locale = "en" }: { locale?: Locale }) {
  const t = tFor(locale, BIAS_ZH);
  const zh = locale === "zh";
  return (
    <>
      <BiasFlow />
      {/* §3.B5 — WebApplication schema on the instrument itself (GEO only). */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: t("The Prestige Test"),
          url: `${baseUrl()}${localHref(locale, "/bias")}`,
          ...(zh ? { inLanguage: "zh-Hans" } : {}),
          applicationCategory: "EntertainmentApplication",
          operatingSystem: "Web",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          description: zh
            ? t(
                "An {minutes}-minute within-subject test of prestige bias in music taste: {n} clips rated blind, then labeled — some labels deliberately swapped and disclosed in a mandatory debrief, two clips never labeled (drift controls). The blind-vs-labeled gap, corrected by the control drift, is the measured result.",
                { minutes: BIAS_SESSION_MINUTES, n: BIAS_CLIP_COUNT },
              )
            : `An ${numberWord(BIAS_SESSION_MINUTES)}-minute within-subject test of prestige bias in music taste: ${numberWord(BIAS_CLIP_COUNT)} clips rated blind, then labeled — some labels deliberately swapped and disclosed in a mandatory debrief, two clips never labeled (drift controls). The blind-vs-labeled gap, corrected by the control drift, is the measured result.`,
          isPartOf: { "@type": "WebSite", name: t("Standard of Taste"), url: baseUrl() },
        }}
      />
    </>
  );
}
