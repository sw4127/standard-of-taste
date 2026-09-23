import { redirect } from "next/navigation";

/**
 * RETIRED — owner ruling BA-7 (2026-09-23, `docs/rt-answers-2026-09-23-audit.md`).
 *
 * The five-tap snack asked people to describe their own taste, which the
 * blueprint's second challenged assumption (BP-CA2) says almost nobody can do,
 * and its reading was written by a language model, which BA-10 ends. The owner
 * retired it and made the reading — built from listening, not self-report —
 * the product. D1's suspension for this route is withdrawn (CLAUDE.md).
 *
 * An old shared link still resolves. The page's code is in git history
 * (before this commit). `src/app/site-links.test.tsx` holds the redirect.
 */
export default function Retired(): never {
  redirect("/");
}
