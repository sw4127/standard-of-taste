import Page from "@/app/learn/freedom-from-prejudice/page";
import { explainerMetadata } from "@/app/learn/Explainer";
import { learnPage } from "@/content/learn";

// /learn/freedom-from-prejudice in Chinese (bilingual Part 4): the same page, `locale="zh"`.
export const metadata = explainerMetadata(learnPage("freedom-from-prejudice")!, "zh");

export default function ZhPage() {
  return <Page locale="zh" />;
}
