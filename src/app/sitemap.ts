import type { MetadataRoute } from "next";
import { baseUrl } from "@/lib/site";
import { LEARN_PAGES } from "@/content/learn";
import { DELICACY_LIVE } from "@/content/delicacy/items";

/**
 * sitemap.xml (2026-07-16 brief §3.B4 — serves C2/N1). Stable, canonical
 * content pages only: result/share pages are parameterized permutations and
 * stay out; crawlers reach them through real shared links.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = baseUrl();
  const page = (
    path: string,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "monthly",
  ) => ({ url: `${base}${path}`, priority, changeFrequency });

  return [
    page("/", 1, "weekly"),
    page("/bias", 0.9, "weekly"),
    // The second machine enters the map only when its pool of record is live.
    ...(DELICACY_LIVE ? [page("/delicacy", 0.9, "weekly")] : []),
    /**
     * THE THRESHOLD TEST WAS NEVER IN THIS MAP (found E17/S7, while adding the
     * Ranking Test). Two of the four live machines were unlisted — one of them
     * since it shipped — so a crawler was told about half the product. Each
     * machine is now added by hand and `sitemap.test.ts` checks the list
     * against the roster, because a hand-maintained list is exactly what let
     * one fall out unnoticed.
     */
    page("/threshold", 0.9, "weekly"),
    page("/spread", 0.9, "weekly"),
    page("/learn", 0.8),
    ...LEARN_PAGES.map((p) => page(`/learn/${p.slug}`, 0.7)),
    // The Lab is a public artifact surface, not an admin console — it is meant
    // to be found and read (pivot §4).
    page("/lab", 0.8, "weekly"),
    // E9/S5, RT-U(a). Same standing as /lab: a public artifact surface meant to
    // be found and read, not an internal note.
    page("/method", 0.8),
    page("/music/quiz", 0.4),
    page("/quiz", 0.3, "yearly"),
    page("/fan-verdict", 0.3, "yearly"),
    page("/legal", 0.1, "yearly"),
  ];
}
