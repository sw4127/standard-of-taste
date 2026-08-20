import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ThresholdResult from "../../ThresholdResult";
import { familyForSlug } from "../../families";
import { replaySession } from "@/engine/staircase-replay";
import { sessionResult } from "@/engine/staircase-session";

/**
 * A RESULT RECOMPUTED FROM RAW ANSWERS (E5/S6) — never from a number in the URL.
 *
 * `?s=<seed>&r=<0s and 1s>` and, for lossy, `&src=<recording>`. The threshold
 * is derived here, server-side, from the responses; there is no field anyone
 * could edit to claim a threshold they did not measure. Same design and same
 * reason as `/bias/result`.
 *
 * `noindex` because every URL is one person's session, not a page.
 */
export const metadata: Metadata = {
  title: "Your threshold — The Taste Gym",
  robots: { index: false, follow: false },
};

type Params = Promise<{ slug: string }>;
type Search = Promise<Record<string, string | string[] | undefined>>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function ThresholdResultPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { slug } = await params;
  const family = familyForSlug(slug);
  if (!family) notFound();

  const sp = await searchParams;
  const seed = Number(one(sp.s));
  const responses = one(sp.r) ?? "";
  const sourceId = one(sp.src);

  // The recompute is inside the try; the JSX is deliberately outside it. A
  // try/catch around JSX catches nothing useful — React renders later — and
  // would silently swallow a real render error as "bad link".
  let result;
  try {
    result = sessionResult(replaySession(family, seed, responses, sourceId));
  } catch {
    // A malformed link is a 404, not a half-rendered result. Rendering
    // something plausible from a broken payload is how a fabricated number
    // reaches a screen.
    notFound();
  }
  return <ThresholdResult result={result} />;
}
