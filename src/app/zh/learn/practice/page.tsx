import Page from "@/app/learn/practice/page";
import { explainerMetadata } from "@/app/learn/Explainer";
import { learnPage } from "@/content/learn";

// /learn/practice in Chinese (bilingual Part 4): the same page, `locale="zh"`.
export const metadata = explainerMetadata(learnPage("practice")!, "zh");

export default function ZhPage() {
  return <Page locale="zh" />;
}
