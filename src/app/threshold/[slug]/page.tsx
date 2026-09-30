import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ThresholdFlow from "../ThresholdFlow";
import { THRESHOLD_SLUGS, familyForSlug } from "../families";
import { FAMILY_BLURB, familyLabel } from "@/content/staircase/copy";
import { localHref, type Locale } from "@/lib/locale";
import { tFor } from "@/lib/i18n";
import THRESHOLD_ZH from "@/content/zh/copy/threshold";
import { FAMILY_BLURB_ZH } from "@/content/zh/copy/threshold-lines";
import { familyLabelZh } from "@/content/zh/copy/across";

/** Three static pages, enumerated from the route table rather than listed. */
export function generateStaticParams() {
  return THRESHOLD_SLUGS.map((slug) => ({ slug }));
}

type Params = Promise<{ slug: string }>;

/** In either language (bilingual Part 4); `/zh/threshold/[slug]` passes `locale="zh"`. */
export async function thresholdFlowMetadata(params: Params, locale: Locale): Promise<Metadata> {
  const { slug } = await params;
  const family = familyForSlug(slug);
  if (!family) return { title: "Not found — Standard of Taste" };
  const t = tFor(locale, THRESHOLD_ZH);
  const zh = locale === "zh";
  const title = t("{label} — how small a flaw can you hear?", { label: zh ? familyLabelZh(family) : familyLabel(family) });
  const description = t(
    "An adaptive listening test that finds the smallest {blurb} you can still catch, and reports it in physical units.",
    { blurb: zh ? FAMILY_BLURB_ZH[family] : FAMILY_BLURB[family] },
  );
  return {
    title,
    description,
    alternates: {
      canonical: localHref(locale, `/threshold/${slug}`),
      languages: { en: `/threshold/${slug}`, "zh-Hans": `/zh/threshold/${slug}` },
    },
    openGraph: { title, description, images: [{ url: "/opengraph-image", width: 1200, height: 630 }] },
  };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  return thresholdFlowMetadata(params, "en");
}

export default async function ThresholdPage({ params }: { params: Params }) {
  const { slug } = await params;
  const family = familyForSlug(slug);
  if (!family) notFound();
  return <ThresholdFlow family={family} />;
}
