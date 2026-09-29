import LearnShell from "./LearnShell";

/**
 * The library in English. The shell, its header and its footer live in
 * `LearnShell`, which `zh/learn/layout.tsx` renders in Chinese (bilingual Part 2).
 * The bare underline-and-arrow rule of 2026-07-17 (no bare underline or arrow
 * links; they read cheap) is kept there, with the footer it governs.
 */
export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return <LearnShell locale="en">{children}</LearnShell>;
}
