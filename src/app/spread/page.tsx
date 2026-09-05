import type { Metadata } from "next";
import SpreadFlow from "./SpreadFlow";
import JsonLd from "@/components/JsonLd";
import { baseUrl } from "@/lib/site";

/**
 * The Ranking Test — Track N's return-visit instrument (PM ruling RT-I2 a).
 * The Floor keeps its short fixed set with no account (RT-136); this is a
 * fourth machine chosen from the gym, not a second front door.
 */
export const metadata: Metadata = {
  title: "The Ranking Test — do your gaps fall where a critic's did?",
  description:
    "Six works a published critic ranked against each other, forty seconds each. Two numbers: how far apart your ratings fell on the pairs he separated, and on the pairs he did not. Agreement is never scored.",
  alternates: { canonical: "/spread" },
  openGraph: {
    title: "The Ranking Test — do your gaps fall where a critic's did?",
    description:
      "Six works a published critic ranked against each other. Whether your ratings move where his judgment moved — never whether you agree with him.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

export default function SpreadPage() {
  return (
    <>
      <SpreadFlow />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "The Ranking Test",
          url: `${baseUrl()}/spread`,
          applicationCategory: "EntertainmentApplication",
          operatingSystem: "Web",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          description:
            "Six Beethoven works from a published critic's ranked list, played as forty-second excerpts and rated blind. Reports the mean gap between ratings across pairs the critic placed ten or more positions apart, beside the same figure across pairs he placed within three, both read against what an indifferent rater produces. Agreement with the critic is never scored and cannot be computed: only the distance between his positions is used, never their order.",
          isPartOf: { "@type": "WebSite", name: "The Taste Gym", url: baseUrl() },
        }}
      />
    </>
  );
}
