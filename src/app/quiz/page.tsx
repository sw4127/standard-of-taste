import { redirect } from "next/navigation";

/**
 * RETIRED — PM ruling RT-2 (2026-09-22) a.
 *
 * This route served the pre-pivot personality product, kept alive after the
 * 2026-07-11 pivot so old shared links would not 404 (RT-3c). It spoke to the
 * reader about who they are, which made two shipped statements false about the
 * site: the prompt card's "Everything else on this site describes only what you
 * did", and /legal's "It does not predict your personality". The owner retired
 * it rather than narrow those sentences.
 *
 * An old link still resolves: it lands on the gym. The page's code is in git
 * history (before this commit) if the ruling is ever reversed.
 * `src/app/site-links.test.tsx` requires this route to keep redirecting to "/".
 */
export default function Retired(): never {
  redirect("/");
}
