/**
 * WHAT THE SITE CALLS ITSELF, IN ONE PLACE (Track V/S9, 2026-09-23).
 *
 * Until this module the name lived in four places and three of them still said
 * "Vibe Check" two months after the pivot: the root layout's default title and
 * home-screen name, the web-app manifest, and the wordmark on both error pages.
 * The manifest's description also made the claim D1 exists to refuse — "Your
 * music taste has been taking notes on you. Get read." None was visible to a
 * guard that reads page metadata, which is where all of them had been looked
 * for. `site-terms.test.tsx` now reads these, and the four places read this.
 *
 * Naming is still an open question (memo §9.5). When it is settled, it is
 * settled here.
 */
export const SITE_NAME = "Standard of Taste";

/** The wordmark as the chrome renders it, in tracked capitals. */
export const SITE_WORDMARK = SITE_NAME.toUpperCase();

export const SITE_DESCRIPTION =
  "A taste gym: listening tasks where you can be wrong, each reporting what you did in its own units. Free, no account.";

/**
 * What an error page may promise. The old line — "your answers are safe in this
 * page's link" — was true of the retired quiz, whose answers lived in the URL,
 * and is not true of the gym, which keeps finished results in browser storage.
 */
export const ERROR_RECOVERY_LINE = "Results you finished are kept in this browser.";
