import type { Metadata } from "next";
import { numberWord, numberWordLeading } from "@/content/vocabulary/numbers";
import { SPREAD_CLIP_SECONDS, SPREAD_WORK_COUNT } from "@/content/instrument-shape";
import SpreadFlow from "./SpreadFlow";
import JsonLd from "@/components/JsonLd";
import { baseUrl } from "@/lib/site";
import { localHref, type Locale } from "@/lib/locale";
import { tFor } from "@/lib/i18n";
import SPREAD_ZH from "@/content/zh/copy/spread";

/**
 * The Ranking Test — Track N's return-visit instrument (PM ruling RT-I2 a).
 * The Floor keeps its short fixed set with no account (RT-136); this is a
 * fourth machine chosen from the gym, not a second front door.
 *
 * `/zh/spread` renders this page with `locale="zh"` (bilingual Part 2); its
 * metadata and structured data are the English looked up in the test's dictionary.
 */
const TITLE = "The Ranking Test — do your gaps fall where a critic's did?";

export function spreadMetadata(locale: Locale): Metadata {
  const t = tFor(locale, SPREAD_ZH);
  return {
    title: t(TITLE),
    description: t(
      `${numberWordLeading(SPREAD_WORK_COUNT)} works a published critic ranked against each other, ${numberWord(SPREAD_CLIP_SECONDS)} seconds each. Two numbers: how far apart your ratings fell on the pairs he separated, and on the pairs he did not. Agreement is never scored.`,
    ),
    alternates: { canonical: localHref(locale, "/spread"), languages: { en: "/spread", "zh-Hans": "/zh/spread" } },
    openGraph: {
      title: t(TITLE),
      description: t(
        `${numberWordLeading(SPREAD_WORK_COUNT)} works a published critic ranked against each other. Whether your ratings move where his judgment moved — never whether you agree with him.`,
      ),
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
  };
}

export const metadata = spreadMetadata("en");

export default function SpreadPage({ locale = "en" }: { locale?: Locale }) {
  const t = tFor(locale, SPREAD_ZH);
  return (
    <>
      <SpreadFlow />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: t("The Ranking Test"),
          url: `${baseUrl()}${localHref(locale, "/spread")}`,
          ...(locale === "zh" ? { inLanguage: "zh-Hans" } : {}),
          applicationCategory: "EntertainmentApplication",
          operatingSystem: "Web",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          description: t(
            "Six Beethoven works from a published critic's ranked list, played as forty-second excerpts and rated blind. Reports the mean gap between ratings across pairs the critic placed ten or more positions apart, beside the same figure across pairs he placed within three, both read against what an indifferent rater produces. Agreement with the critic is never scored and cannot be computed: only the distance between his positions is used, never their order.",
          ),
          isPartOf: { "@type": "WebSite", name: t("Standard of Taste"), url: baseUrl() },
        }}
      />
    </>
  );
}
