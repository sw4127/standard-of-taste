import Page from "@/app/learn/prestige-bias-test/page";
import { explainerMetadata } from "@/app/learn/Explainer";
import { learnPage } from "@/content/learn";

// /learn/prestige-bias-test in Chinese (bilingual Part 4): the same page, `locale="zh"`.
export const metadata = explainerMetadata(learnPage("prestige-bias-test")!, "zh");

export default function ZhPage() {
  return <Page locale="zh" />;
}
