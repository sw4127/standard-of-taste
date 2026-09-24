import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/content/site";

/**
 * §23.F (PWA-light) — installable app-feel (Add to Home Screen), zero store cut,
 * no review. Next auto-links this at /manifest.webmanifest. Icons are PNGs
 * drawn by Satori (see app/icons/[size] and lib/icon). No service worker by
 * decision: nothing on the site needs to work offline or send a push.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    // Retired "Vibe Check" name and a D1 claim ("taking notes on you. Get
    // read.") until Track V/S9; one source now, `src/content/site.ts`.
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#08090d",
    theme_color: "#08090d",
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
