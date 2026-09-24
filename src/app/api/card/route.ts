/**
 * GET /api/card — RETIRED (2026-09-24). Every request is sent to the site's
 * default preview image, whatever its query string says.
 *
 * This route drew the retired World Cup and music share cards (BA-7, D4). Nothing
 * on the site had linked to it since, but it still printed its query string onto
 * a PNG under this domain: `archetype`, `player` and `v` (up to 240 characters)
 * verbatim, with "IF YOU STAN <player>" and, for `tier=paid`, "VIBE CHECK · THE
 * FULL READ", a paid tier that does not exist (D4). Anyone could mint an image
 * that says anything, signed with our host name, including the one class the
 * carve-out forbids on every surface (RT-Z10 a, BA-5).
 *
 * Why a redirect and not a 404: link previews of old posts still point here. A
 * redirect gives them the site's card instead of a broken image, and it cannot
 * be made to say anything. Temporary (307), so deleting the route later is not
 * fought by caches that were told this was permanent.
 *
 * STATIC, so it runs no code per request. A handler reading `request.url` is a
 * server function on every hit, which anyone can call in a loop against the
 * free tier; this one is rendered once at build time. The Location is relative,
 * which HTTP allows (RFC 9110 §10.2.2), so no host needs to be known.
 */
export const dynamic = "force-static";

export function GET(): Response {
  return new Response(null, { status: 307, headers: { Location: "/opengraph-image" } });
}
