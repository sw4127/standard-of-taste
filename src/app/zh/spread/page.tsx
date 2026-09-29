import SpreadPage, { spreadMetadata } from "@/app/spread/page";

// The Ranking Test in Chinese (bilingual Part 2): the same page, `locale="zh"`.
export const metadata = spreadMetadata("zh");

export default function ZhSpreadPage() {
  return <SpreadPage locale="zh" />;
}
