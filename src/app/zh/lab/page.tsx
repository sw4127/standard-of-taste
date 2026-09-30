import LabIndex, { labMetadata } from "@/app/lab/page";

// /lab in Chinese (bilingual Part 2): the same page, `locale="zh"`.
export const metadata = labMetadata("zh");

export default function ZhLabPage() {
  return <LabIndex locale="zh" />;
}
