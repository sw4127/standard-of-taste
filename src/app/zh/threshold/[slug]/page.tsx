import type { Metadata } from "next";
import ThresholdPage, { thresholdFlowMetadata } from "@/app/threshold/[slug]/page";

// One Threshold Test in Chinese (bilingual Part 4): the same flow, which reads its language from the address.
export { generateStaticParams } from "@/app/threshold/[slug]/page";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  return thresholdFlowMetadata(params, "zh");
}

export default ThresholdPage;
