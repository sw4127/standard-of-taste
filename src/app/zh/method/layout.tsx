import MethodShell from "@/app/method/MethodShell";

/** /method in Chinese (bilingual Part 2): the English shell, `locale="zh"`. */
export default function ZhMethodLayout({ children }: { children: React.ReactNode }) {
  return <MethodShell locale="zh">{children}</MethodShell>;
}
