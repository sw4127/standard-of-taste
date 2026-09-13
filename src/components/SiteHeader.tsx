import Link from "next/link";

/**
 * THE ONE HEADER (Phase 3, Track N2, PM ruling RT-Z3 a).
 *
 * It existed three times — in `/learn`, `/method` and `/lab`'s layouts, each a
 * hand-rolled copy of the same wordmark-and-links row — and not at all on the
 * front door, which is the page most visitors see first and the only one with
 * no way out of it. Three copies of one row is the defect this repository has
 * spent eleven sessions removing everywhere else.
 *
 * THE LINKS ARE PASSED IN, NOT DERIVED, and that is deliberate. Each surface
 * links to the places a reader of THAT surface wants next, and a header that
 * guessed would either link to the page you are standing on or need a table of
 * exceptions. The shape is shared; the destinations are the caller's.
 */

const BRAND = "rgba(244,245,248,0.72)";
const LINK =
  "whitespace-nowrap text-[0.65rem] font-bold tracking-[0.3em] text-muted transition hover:text-white";

export interface HeaderLink {
  href: string;
  /** Shown in tracked caps, matching the kicker's voice (PM 2026-07-17: no
   *  bare underline or arrow links — they read cheap). */
  label: string;
}

export default function SiteHeader({ links }: { links: readonly HeaderLink[] }) {
  return (
    /*
     * WRAPPING IS ALLOWED; BREAKING A WORDMARK IS NOT. The front door had no
     * links at all before this, so three of them at 375px wrapped the wordmark
     * across three lines and pushed the headline down a hundred pixels. Found
     * by looking at the phone viewport, not by reading the component.
     */
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
      <Link
        href="/"
        className="whitespace-nowrap text-xs font-bold tracking-[0.4em]"
        style={{ color: BRAND }}
      >
        STANDARD OF TASTE
      </Link>
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={LINK}>
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
