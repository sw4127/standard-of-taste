"use client";

import { usePathname } from "next/navigation";
import { localeOfPath, type Locale } from "./locale";

/**
 * The language of the page a client component is on, read from its address
 * (bilingual Part 2). The address is the only source of the language, so a
 * client component needs no provider and cannot disagree with the page.
 */
export function useLocale(): Locale {
  return localeOfPath(usePathname() ?? "/");
}
