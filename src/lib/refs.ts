/**
 * THE ENTRY-TAG REGISTRY (E7/S12).
 *
 * `?ref=` tags a visit with where it came from. `captureAttribution` reads it
 * once per session and stamps it on every event, so it is the only thing that
 * tells a bias_result arriving from Hacker News apart from one arriving from a
 * shared card. It is also completely unvalidated: `sp.get("ref") ?? "direct"`
 * takes any string at all.
 *
 * That is fine until a value is invented and nobody writes it down. `cooldown`
 * had been shipping on the Threshold flow's snack link with no record anywhere
 * of what it meant, which makes it indistinguishable in the data from a typo —
 * and a typo'd tag does not announce itself: it produces a brand-new channel
 * with plausible traffic, and the funnel it should have joined quietly
 * under-counts.
 *
 * So the values live here, one line each, and `refs.test.ts` sweeps the repo
 * for `ref=` literals and fails on anything absent from this list. Adding a tag
 * is one line; adding one BY ACCIDENT is now impossible.
 *
 * NOT AN ALLOWLIST AT RUNTIME. Nothing rejects an unknown `ref` from a real
 * URL — people paste links, strip params and invent their own, and dropping
 * their attribution on the floor would lose real traffic to tidiness. The
 * discipline is on what WE ship, which is the half we control.
 */

export const KNOWN_REFS: Readonly<Record<string, string>> = {
  /** No ?ref= on the entry URL. The default `captureAttribution` writes. */
  direct: "arrived with no tag — typed, bookmarked, or a stripped link",

  // --- outbound channels, docs/launch-post-kit.md -------------------------
  hn: "Hacker News — on comment links only; the story URL stays clean by HN etiquette",
  rs: "reddit r/samplesize",
  iib: "reddit r/InternetIsBeautiful",
  ltm: "reddit r/LetsTalkMusic",

  // --- internal hops, one instrument or surface to another ----------------
  card: "a shared result card's link back into the product",
  vs: "a head-to-head challenge link (/vs)",
  fan: "the World Cup fan-verdict page's funnel into the music quiz",
  cooldown:
    "the Threshold flow's post-session snack link into the music quiz — the " +
    "personality test offered as a parallel snack, never as a warm-up for the Gym",

  // --- excluded from counts ------------------------------------------------
  dev: "our own testing; excluded from the KPI counts (src/content/lab/metrics.ts)",
};

export type KnownRef = keyof typeof KNOWN_REFS;

export function isKnownRef(ref: string): boolean {
  return Object.prototype.hasOwnProperty.call(KNOWN_REFS, ref);
}
