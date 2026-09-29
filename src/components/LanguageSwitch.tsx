"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LOCALE_STORAGE_KEY, counterpart, localeOfPath, type Locale } from "@/lib/locale";
import { tr } from "@/lib/i18n";
import CHROME, { SWITCH_TO_ZH } from "@/content/zh/copy/chrome";

/**
 * THE ONE LANGUAGE BUTTON (bilingual Part 2; the owner's brief).
 *
 * `SWITCH_TO_ZH` on an English page, EN on a Chinese one. It is a real link to the
 * other page's address, so it works with scripts off and a crawler can follow
 * it; the click also stores the choice, so the next English address this
 * visitor opens sends them to its Chinese page (`LocalePreference`). Storage is
 * wrapped in try/catch: in a private window or with site data blocked the
 * button still switches this page, and only the memory is lost.
 *
 * IT RENDERS NOTHING where the other language has no page yet, rather than
 * linking to a 404. `ZH_ROUTES` says where that is.
 */
export default function LanguageSwitch() {
  const path = usePathname() ?? "/";
  const router = useRouter();
  const here: Locale = localeOfPath(path);
  const target = counterpart(path);
  if (!target) return null;
  const to: Locale = here === "zh" ? "en" : "zh";
  /*
   * IN PLACE MEANS THE SAME STEP. The reading keeps its listener and step in the
   * query (`?l=mira&step=create`), which `usePathname` does not carry, so the
   * plain href would drop a visitor mid-reading back at the picker. The click
   * reads the query and hash as they are now; the href without them is what a
   * crawler or a visitor without scripts follows.
   */
  const remember = (e: React.MouseEvent<HTMLAnchorElement>) => {
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, to);
    } catch {
      // Storage blocked: the link still switches this page.
    }
    const extra = window.location.search + window.location.hash;
    if (extra && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
      e.preventDefault();
      router.push(target + extra);
    }
  };
  return (
    <Link
      href={target}
      onClick={remember}
      hrefLang={to === "zh" ? "zh-Hans" : "en"}
      lang={to === "zh" ? "zh-Hans" : "en"}
      aria-label={to === "zh" ? "Read this page in Chinese" : tr("zh", CHROME, "Read this page in English")}
      className="whitespace-nowrap rounded-full border border-white/25 px-3 py-1 text-[0.7rem] font-bold tracking-[0.12em] text-neutral-200 transition hover:border-white/60 hover:text-white"
    >
      {to === "zh" ? SWITCH_TO_ZH : "EN"}
    </Link>
  );
}
