import type { Metadata } from "next";
import BiasResultPage, { biasResultMetadata, type SearchParams } from "@/app/bias/result/page";

// A Prestige result in Chinese (bilingual Part 4): recomputed from the raw ratings in the address, as the English is.
export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  return biasResultMetadata(searchParams, "zh");
}

export default async function ZhBiasResultPage({ searchParams }: { searchParams: SearchParams }) {
  return BiasResultPage({ searchParams, locale: "zh" });
}
