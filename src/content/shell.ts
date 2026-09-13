/**
 * ONE SHELL FOR THE WHOLE SITE (Phase 3, Track N, PM ruling RT-Z3 a).
 *
 * WHAT WAS MEASURED. At a 1280px viewport the site rendered three container
 * widths and two navigation models: `/` and every instrument flow were a
 * 512px column in the middle of a black field with no navigation at all, while
 * `/method` ran 768px and `/lab` 1024px, both with a header. More than half the
 * screen was empty on the page a visitor lands on. The Phase 3 blueprint calls
 * that the mechanism behind the owner's own instinct about the site, and it is
 * right: it does not read as restraint, it reads as responsive work that was
 * never finished, and a reader forms that verdict before reading a word.
 *
 * THE FRAME IS WIDE AND THE PROSE IS NOT, which is the distinction the first
 * attempt at this would get wrong. Making every page 1024px would set body text
 * across a 1024px measure, which is worse typography than the narrow column it
 * replaced. So the SHELL is one width everywhere — the header sits in the same
 * place on every route, and the page occupies the screen it was given — and
 * each surface constrains its own reading measure inside it.
 *
 * `SHELL_WIDTH` IS THE TOKEN A GUARD CAN SEE. `shell-width.test.ts` asserts
 * every `<main>` under `src/app` carries it, so a new route cannot quietly opt
 * out and reintroduce the fourth width.
 */

/** The one container width. Every `<main>` in the app uses it. */
export const SHELL_WIDTH = "max-w-5xl";

/** The full `<main>` class list for a standard reading or landing surface. */
export const SHELL_MAIN =
  `relative mx-auto flex min-h-dvh w-full ${SHELL_WIDTH} flex-col overflow-hidden px-6 py-12`;

/**
 * The reading measures for body prose INSIDE the shell.
 *
 * Named rather than inlined because the whole risk of widening the frame is
 * that somebody forgets to narrow the text — and that is not hypothetical: the
 * first version of this change widened `/method` and `/learn` to the shell and
 * left their paragraphs running the full 1024px, which is worse typography than
 * the narrow column it replaced. It was caught by looking at the rendered page,
 * a screen after the same mistake was caught in JSX.
 *
 * EACH SURFACE KEEPS THE MEASURE IT ALREADY HAD. The shell is what is shared —
 * the header sits in one place on every route and the page fills the screen it
 * was given. Line length is a property of the text, not of the frame.
 */
export const PROSE_MEASURE = "max-w-2xl";

/** `/method`'s measure, which was its container width before the shell. */
export const ARTICLE_MEASURE = "max-w-3xl";
