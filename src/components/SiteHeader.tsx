import Link from "next/link";
import LanguageSwitch from "./LanguageSwitch";
import { localHref, type Locale } from "@/lib/locale";
import { tFor } from "@/lib/i18n";
import CHROME, { ZH_SUBTITLE, ZH_TITLE } from "@/content/zh/copy/chrome";
import { ZH_TRANSLATION_NOTE } from "@/content/zh/style";

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
 *
 * IT RENDERS A REAL `<header>` AND `<nav>` (Track V/S1), and that is load-bearing
 * rather than semantic tidiness. The front door offered the reading room twice —
 * once here and once as a door under the machine cards — and nothing could see
 * it, because the doors had a guard and this row had none. `site-doors.test.tsx`
 * tells chrome from body by these two elements; a `<div>` here would make every
 * link on the page look like body and the guard would have nothing to compare.
 */

const BRAND = "rgba(244,245,248,0.72)";
const LINK =
  "whitespace-nowrap text-[0.65rem] font-bold tracking-[0.3em] text-muted transition hover:text-white";
// Chinese has no capitals to track: the same row, set a size up with less spacing.
const LINK_ZH = "whitespace-nowrap text-xs font-bold tracking-[0.15em] text-muted transition hover:text-white";

export interface HeaderLink {
  href: string;
  /** Shown in tracked caps, matching the kicker's voice (PM 2026-07-17: no
   *  bare underline or arrow links — they read cheap). */
  label: string;
}

/*
 * THE CHINESE HEADER (bilingual Part 2). The wordmark is the owner's main title
 * `ZH_TITLE` with `ZH_SUBTITLE` beneath it (docs/glossary-zh.md), the links go to the
 * Chinese pages where they exist, and under the row sits the one line every
 * Chinese page carries, from its one constant (`ZH_TRANSLATION_NOTE`): the site
 * was written in English, and the English governs.
 */
export default function SiteHeader({ links, locale = "en" }: { links: readonly HeaderLink[]; locale?: Locale }) {
  const t = tFor(locale, CHROME);
  return (
    <>
      {/*
       * WRAPPING IS ALLOWED; BREAKING A WORDMARK IS NOT. The front door had no
       * links at all before this, so three of them at 375px wrapped the wordmark
       * across three lines and pushed the headline down a hundred pixels. Found
       * by looking at the phone viewport, not by reading the component.
       */}
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        {locale === "zh" ? (
          <Link href={localHref(locale, "/")} className="flex flex-col whitespace-nowrap" style={{ color: BRAND }}>
            <span className="text-base font-bold tracking-[0.3em]">{ZH_TITLE}</span>
            <span className="text-[0.65rem] tracking-[0.2em] text-muted">{ZH_SUBTITLE}</span>
          </Link>
        ) : (
          <Link href="/" className="whitespace-nowrap text-xs font-bold tracking-[0.4em]" style={{ color: BRAND }}>
            STANDARD OF TASTE
          </Link>
        )}
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <nav aria-label={t("Site")} className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={localHref(locale, link.href)}
                className={locale === "zh" ? LINK_ZH : LINK}
              >
                {t(link.label)}
              </Link>
            ))}
          </nav>
          <LanguageSwitch />
        </div>
      </header>
      {locale === "zh" ? <p className="mt-3 text-[11px] leading-relaxed text-muted">{ZH_TRANSLATION_NOTE}</p> : null}
    </>
  );
}
