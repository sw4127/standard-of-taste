import LabShell from "./LabShell";

/** The Lab's shell lives in LabShell, shared with `/zh/lab` (bilingual Part 2). */
export default function LabLayout({ children }: { children: React.ReactNode }) {
  return <LabShell locale="en">{children}</LabShell>;
}
