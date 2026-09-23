/**
 * THE SITE'S NAVIGATION, IN ONE ORDER (blueprint Part 7; BA-6).
 *
 * The reading first, because it is the product (D3 amendment); then the
 * existing reading room, lab and method. Layouts pass this to `SiteHeader`,
 * filtering out the page they are on.
 */
import type { HeaderLink } from "@/components/SiteHeader";

export const SITE_NAV: readonly HeaderLink[] = [
  { href: "/reading", label: "THE READING" },
  { href: "/learn", label: "READING ROOM" },
  { href: "/lab", label: "THE LAB" },
  { href: "/method", label: "THE METHOD" },
];
