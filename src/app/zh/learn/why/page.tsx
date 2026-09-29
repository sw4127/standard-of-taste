import Page from "@/app/learn/why/page";
import { explainerMetadata } from "@/app/learn/Explainer";
import { learnPage } from "@/content/learn";

// /learn/why in Chinese (bilingual Part 2): the same page, `locale="zh"`.
export const metadata = explainerMetadata(learnPage("why")!, "zh");

export default function ZhWhyPage() {
  return <Page locale="zh" />;
}
