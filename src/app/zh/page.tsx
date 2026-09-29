import type { Metadata } from "next";
import Home, { metadata as english } from "@/app/page";
import { tFor } from "@/lib/i18n";
import LANDING_ZH from "@/content/zh/copy/landing";
import READING_ZH from "@/content/zh/copy/reading";

/*
 * THE FRONT DOOR IN CHINESE (bilingual Part 2). The same page, `locale="zh"`;
 * its metadata is the English metadata looked up field by field, so a changed
 * English title fails `site-zh.test.tsx` as a miss rather than drifting.
 */
const t = tFor("zh", LANDING_ZH);
const og = english.openGraph as { title: string; description: string; siteName: string; type: "website" };

export const metadata: Metadata = {
  title: t(english.title as string),
  description: t(english.description as string),
  alternates: { canonical: "/zh", languages: { en: "/", "zh-Hans": "/zh" } },
  openGraph: {
    title: t(og.title),
    description: tFor("zh", READING_ZH)(og.description),
    siteName: t(og.siteName),
    type: og.type,
  },
};

export default function ZhHome() {
  return <Home locale="zh" />;
}
