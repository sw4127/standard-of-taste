import type { Metadata } from "next";
import DelicacyResultPage, { delicacyResultMetadata, type SearchParams } from "@/app/delicacy/result/page";

// A Delicacy result in Chinese (bilingual Part 4): rescored from the raw answers in the address, as the English is.
export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  return delicacyResultMetadata(searchParams, "zh");
}

export default async function ZhDelicacyResultPage({ searchParams }: { searchParams: SearchParams }) {
  return DelicacyResultPage({ searchParams, locale: "zh" });
}
