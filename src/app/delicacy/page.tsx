import type { Metadata } from "next";
import DelicacyFlow from "./DelicacyFlow";
import { DELICACY_TRIALS, DELICACY_LIVE } from "@/content/delicacy/items";
import { localHref, type Locale } from "@/lib/locale";
import { tFor } from "@/lib/i18n";
import DELICACY_ZH from "@/content/zh/copy/delicacy";

/**
 * The Delicacy Trials (memo D2 Instrument 2, D3 second instrument).
 * Every door surface gates on DELICACY_LIVE (items.ts): until the S6 pool of
 * record ships, the pool is the dev placeholder (v0) whose audio is
 * git-ignored — in production the clips 404 and the flow stays locked at the
 * listen gate — so the route is unlinked + noindex. The version bump at S6
 * flips indexing, the sitemap, and both door cards at once.
 */
/** In either language (bilingual Part 4); `/zh/delicacy` passes `locale="zh"`. The flow reads the address. */
export function delicacyMetadata(locale: Locale): Metadata {
  const t = tFor(locale, DELICACY_ZH);
  return {
    title: t("The Delicacy Trials — can you hear what's wrong?"),
    description: t(
      "{n} pairs of clips. In each, one is the original and one has been quietly damaged. Find the key in the wine.",
      { n: DELICACY_TRIALS.length },
    ),
    robots: DELICACY_LIVE ? undefined : { index: false },
    alternates: { canonical: localHref(locale, "/delicacy"), languages: { en: "/delicacy", "zh-Hans": "/zh/delicacy" } },
  };
}

export const metadata = delicacyMetadata("en");

export default function DelicacyPage() {
  return <DelicacyFlow />;
}
