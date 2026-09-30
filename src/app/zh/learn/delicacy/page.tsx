import Page from "@/app/learn/delicacy/page";
import { explainerMetadata } from "@/app/learn/Explainer";
import { learnPage } from "@/content/learn";

// /learn/delicacy in Chinese (bilingual Part 4): the same page, `locale="zh"`.
export const metadata = explainerMetadata(learnPage("delicacy")!, "zh");

export default function ZhPage() {
  return <Page locale="zh" />;
}
