"use client";

import { usePathname } from "next/navigation";

/**
 * RENDERS ITS CHILDREN EVERYWHERE EXCEPT ON THE PAGE THEY POINT AT (Track V/S2).
 *
 * The reading room's footer offers "Reading room" on every page under `/learn`,
 * which is the way back to the index from an article — and on the index itself
 * it was a door to the room the reader is standing in. A layout is shared by
 * every page beneath it and cannot know which one it is wrapping, so the one
 * piece that has to know asks the router. Still rendered on the server: the
 * pathname is known during SSR, so crawlers that run no JavaScript see the same
 * footer a reader does.
 *
 * `src/app/site-links.test.tsx` fails if any page links to itself again.
 */
export default function UnlessHere({ href, children }: { href: string; children: React.ReactNode }) {
  const here = (usePathname() ?? "").replace(/\/$/, "") || "/";
  return here === href ? null : <>{children}</>;
}
