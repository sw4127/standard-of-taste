/**
 * THE SITE'S NAVIGATION, IN ONE ORDER (blueprint Part 7; BA-6).
 *
 * The reading first, because it is the product (D3 amendment); then the
 * hearing section, reached through BP-BRIDGE; then the Company view (BA-9); then
 * the library, the lab and the method. "HEARING" became "THE HEARING TESTS" and
 * "READING ROOM" became "THE LIBRARY" on 2026-09-24 (Cowork copy return, part C):
 * two items said "reading" and meant different things. Layouts pass this to `SiteHeader`,
 * filtering out the page they are on.
 */
import type { HeaderLink } from "@/components/SiteHeader";

export const SITE_NAV: readonly HeaderLink[] = [
  { href: "/reading", label: "THE READING" },
  // The four instruments, unchanged, as the front door's hearing section (D3 amendment).
  { href: "/#hearing", label: "THE HEARING TESTS" },
  { href: "/company", label: "THE COMPANY VIEW" },
  { href: "/learn", label: "THE LIBRARY" },
  { href: "/lab", label: "THE LAB" },
  { href: "/method", label: "THE METHOD" },
];
