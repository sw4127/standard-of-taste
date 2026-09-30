import MethodShell from "./MethodShell";

/** /method in English; the shell lives in `MethodShell`, which `zh/method/layout.tsx` renders in Chinese. */
export default function MethodLayout({ children }: { children: React.ReactNode }) {
  return <MethodShell locale="en">{children}</MethodShell>;
}
