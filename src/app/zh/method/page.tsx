import MethodPage, { methodMetadata } from "@/app/method/page";

// /method in Chinese (bilingual Part 2): the same page, `locale="zh"`.
export const metadata = methodMetadata("zh");

export default function ZhMethodPage() {
  return <MethodPage locale="zh" />;
}
