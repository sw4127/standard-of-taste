/**
 * URL SLUGS FOR THE THREE MACHINES (E5/S6, 2026-08-20).
 *
 * The engine's family ids are `pitch-drift`, `timing-smear`, `lossy-artifact` —
 * accurate, and not what anybody wants in a URL or a share link. The mapping
 * lives here, in ONE place, and is exhaustive over the pool's own family list
 * rather than hand-listed: a family rendered but not routed would otherwise be
 * unreachable with nothing saying so.
 */

import { STAIRCASE_FAMILIES } from "@/engine/staircase-manifest";

export const FAMILY_BY_SLUG: Record<string, string> = {
  pitch: "pitch-drift",
  timing: "timing-smear",
  compression: "lossy-artifact",
};

export const SLUG_BY_FAMILY: Record<string, string> = Object.fromEntries(
  Object.entries(FAMILY_BY_SLUG).map(([slug, family]) => [family, slug]),
);

// Fail at module load, not at render: an unrouted family should break the build
// and the test run, not produce a 404 nobody notices.
for (const family of STAIRCASE_FAMILIES) {
  if (!SLUG_BY_FAMILY[family]) throw new Error(`threshold: family "${family}" is rendered but has no route slug`);
}

export const THRESHOLD_SLUGS = Object.keys(FAMILY_BY_SLUG);

export function familyForSlug(slug: string): string | null {
  return FAMILY_BY_SLUG[slug] ?? null;
}
