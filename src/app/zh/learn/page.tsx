import LearnIndex, { learnIndexMetadata } from "@/app/learn/page";

// The library's index in Chinese (bilingual Part 4): the same page, `locale="zh"`.
export const metadata = learnIndexMetadata("zh");

export default function ZhLearnIndex() {
  return <LearnIndex locale="zh" />;
}
