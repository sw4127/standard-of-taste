import ReadingView, { readingMetadata } from "./ReadingView";

// The reading in English; `/zh/reading` renders the same view in Chinese (bilingual Part 2).
export const metadata = readingMetadata("en");

export default function ReadingPage() {
  return <ReadingView locale="en" />;
}
