import type { Metadata } from "next";
import DelicacyFlow from "./DelicacyFlow";
import { DELICACY_TRIALS, DELICACY_LIVE } from "@/content/delicacy/items";

/**
 * The Delicacy Trials (memo D2 Instrument 2, D3 second instrument).
 * Every door surface gates on DELICACY_LIVE (items.ts): until the S6 pool of
 * record ships, the pool is the dev placeholder (v0) whose audio is
 * git-ignored — in production the clips 404 and the flow stays locked at the
 * listen gate — so the route is unlinked + noindex. The version bump at S6
 * flips indexing, the sitemap, and both door cards at once.
 */
export const metadata: Metadata = {
  title: "The Delicacy Trials — can you hear what's wrong?",
  description:
    `${DELICACY_TRIALS.length} pairs of clips. In each, one is the original and one has been quietly damaged. Find the key in the wine.`,
  robots: DELICACY_LIVE ? undefined : { index: false },
  alternates: { canonical: "/delicacy" },
};

export default function DelicacyPage() {
  return <DelicacyFlow />;
}
