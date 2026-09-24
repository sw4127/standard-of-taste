/** Small shared helpers for URLs (used by the result page + OG metadata). */

/**
 * Absolute origin, for server-side fetch and OG image URLs.
 *
 * Order matters for the share loop (§16): OG-image URLs MUST resolve to a
 * public, stable host or social-unfurl bots get a blank preview.
 *  1. NEXT_PUBLIC_BASE_URL — explicit override (a custom domain, or the
 *     project's .vercel.app alias). Always wins.
 *  2. VERCEL_PROJECT_PRODUCTION_URL — Vercel's STABLE production alias (e.g.
 *     vibe-check-app-sepia.vercel.app). Public and unchanging across deploys.
 *  3. VERCEL_URL — the per-deploy URL. Last resort: it changes every deploy
 *     AND is behind deployment protection (returns 401 to unfurl bots), so
 *     cards shared from here render no preview. Avoid relying on it.
 */
export function baseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL &&
      `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
    (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
    "http://localhost:3000";
  const trimmed = raw.replace(/\/+$/, "");
  // Tolerate a scheme-less value (common Vercel misconfig: setting
  // NEXT_PUBLIC_BASE_URL to "host.vercel.app" without https://). Scheme-less
  // origins produce RELATIVE OG-image URLs (social unfurl → doubled host →
  // broken preview) and invalid Stripe success/cancel URLs. Force a scheme.
  return /^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
}
