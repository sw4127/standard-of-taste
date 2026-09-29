import ReadingView, { readingMetadata } from "@/app/reading/ReadingView";

// The reading in Chinese (bilingual Part 2). The English is at `/reading`.
export const metadata = readingMetadata("zh");

export default function ZhReadingPage() {
  return <ReadingView locale="zh" />;
}
