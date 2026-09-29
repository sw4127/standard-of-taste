import LearnShell from "@/app/learn/LearnShell";

/** The library in Chinese (bilingual Part 2): the English shell, `locale="zh"`. */
export default function ZhLearnLayout({ children }: { children: React.ReactNode }) {
  return <LearnShell locale="zh">{children}</LearnShell>;
}
