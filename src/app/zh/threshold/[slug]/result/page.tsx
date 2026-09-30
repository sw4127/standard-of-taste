import type { Metadata } from "next";
import ThresholdResultPage, { thresholdResultMetadata, type Params, type Search } from "@/app/threshold/[slug]/result/page";

// A Threshold result in Chinese (bilingual Part 4): recomputed from the same raw answers, never from a number in the URL.
export async function generateMetadata({ params, searchParams }: { params: Params; searchParams: Search }): Promise<Metadata> {
  return thresholdResultMetadata(params, searchParams, "zh");
}

export default ThresholdResultPage;
