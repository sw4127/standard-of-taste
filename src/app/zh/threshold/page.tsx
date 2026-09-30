import ThresholdIndex, { thresholdIndexMetadata } from "@/app/threshold/page";

// The Threshold Test's front door in Chinese (bilingual Part 4): the same page, `locale="zh"`.
export const metadata = thresholdIndexMetadata("zh");

export default function ZhThresholdIndex() {
  return <ThresholdIndex locale="zh" />;
}
