import Page from "@/app/learn/good-sense/page";
import { explainerMetadata } from "@/app/learn/Explainer";
import { learnPage } from "@/content/learn";

// /learn/good-sense in Chinese (bilingual Part 4): the same page, `locale="zh"`.
export const metadata = explainerMetadata(learnPage("good-sense")!, "zh");

export default function ZhPage() {
  return <Page locale="zh" />;
}
