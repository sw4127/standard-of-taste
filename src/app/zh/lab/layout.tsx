import LabShell from "@/app/lab/LabShell";

/** /lab in Chinese (bilingual Part 2): the English shell, `locale="zh"`. */
export default function ZhLabLayout({ children }: { children: React.ReactNode }) {
  return <LabShell locale="zh">{children}</LabShell>;
}
