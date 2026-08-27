import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ThresholdResult from "../../ThresholdResult";
import { familyForSlug } from "../../families";
import { replaySession } from "@/engine/staircase-replay";
import { sessionResult } from "@/engine/staircase-session";
import { thresholdCardFigure, thresholdCardCaption } from "@/content/staircase/copy";
import { baseUrl } from "@/lib/site";
import { thresholdCardPath } from "../../share-links";

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
/**
 * NOINDEX, BUT AN UNFURL (E6/S16).
 *
 * Every URL here is one person's session, so it must not be indexed — but it
 * WILL be pasted into a chat, and until now that pasted link showed the site's
 * default image. The unfurl now carries the threshold card, which is generated
 * from the same raw answers this page recomputes from: the picture and the page
 * cannot disagree, because neither is given a number to trust.
 *
 * A malformed payload falls back to the plain title rather than a card. The
 * card route would 400 on it, and an unfurl pointing at a 400 is a broken
 * preview on somebody else's screen.
 */
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}): Promise<Metadata> {
  const base: Metadata = {
    title: "Your threshold — The Taste Gym",
    robots: { index: false, follow: false },
  };
  const { slug } = await params;
  const family = familyForSlug(slug);
  if (!family) return base;

  const sp = await searchParams;
  const seed = Number(one(sp.s));
  const responses = one(sp.r) ?? "";
  const sourceId = one(sp.src);
  let result;
  try {
    result = sessionResult(replaySession(family, seed, responses, sourceId));
  } catch {
    return base;
  }

  const og = `${baseUrl()}${thresholdCardPath("og", { slug, seed, answers: responses, sourceId })}`;
  const title = `${thresholdCardFigure(result)} — The Taste Gym`;
  const description = thresholdCardCaption(result);
  return {
    ...base,
    title,
    description,
    openGraph: { title, description, images: [{ url: og, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: [og] },
  };
}

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
  // NO SHARE BLOCK HERE, deliberately. This page is how you read SOMEBODY
  // ELSE'S session; a share button on it would offer a stranger's number as
  // your own. The block belongs to the flow, where the session was actually
  // taken.
  //
  // `identity` IS PASSED, AND IT IS NOT THE SHARE BLOCK (E8/C2). Those two got
  // conflated: E8/S8 keyed the personal panels off `share`, so withholding the
  // share affordance also silenced `AcrossSessions` here — for everyone,
  // including the person whose session it is. E8/S12 saw that and mis-read it
  // as the ownership check working. It was not; the panels were never reachable
  // on this route at all.
  //
  // They are different questions. "Should this page offer a share button?" is
  // answered NO on a page that may be showing a stranger's number. "Is this the
  // viewer's own session?" is answered in the browser, by comparing this payload
  // to what the device recorded — which is exactly what the panels do.
  return (
    <ThresholdResult
      result={result}
      identity={{ kind: "threshold", slug, seed, answers: responses, ...(sourceId ? { sourceId } : {}) }}
    />
  );
}
