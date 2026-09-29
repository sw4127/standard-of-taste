"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LOCALE_STORAGE_KEY, shouldSendToChinese } from "@/lib/locale";

/**
 * THE CHOICE HOLDS AS THE VISITOR MOVES AROUND (bilingual Part 2; the owner's brief).
 *
 * Links on a Chinese page already go to Chinese pages. This covers the other
 * road in: a visitor who chose Chinese and later arrives at an English address
 * from outside the site (a bookmark, a typed URL, a link from elsewhere) is sent
 * to its Chinese page, where one exists. It runs once, when the document loads,
 * and never on Back, a reload, or a link followed from one of this site's pages
 * (`shouldSendToChinese`), so the English stays one click away beside the
 * translation. Only the switch writes the choice.
 *
 * Renders nothing. Storage read inside try/catch: blocked storage means no
 * memory, never a broken page.
 */
export default function LocalePreference() {
  const router = useRouter();
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    } catch {
      return;
    }
    const entry = performance.getEntriesByType?.("navigation")[0] as PerformanceNavigationTiming | undefined;
    const target = shouldSendToChinese({
      path: window.location.pathname,
      stored,
      navigation: entry?.type,
      referrer: document.referrer,
      origin: window.location.origin,
    });
    if (target) router.replace(target + window.location.search + window.location.hash);
    // Once per document load, by design: a client-side move inside the site is the visitor's own choice.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
