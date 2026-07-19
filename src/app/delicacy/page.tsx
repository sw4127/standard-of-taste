import type { Metadata } from "next";
import DelicacyFlow from "./DelicacyFlow";

/**
 * The Delicacy Trials (memo D2 Instrument 2, D3 second instrument).
 * UNLINKED + NOINDEX until the pool of record ships (S6): the current pool is
 * the dev placeholder (v0) whose audio is git-ignored, so in production the
 * clips 404 and the flow stays locked at the listen gate. The S5b door flip
 * and the robots flip both land with the real pool.
 */
export const metadata: Metadata = {
  title: "The Delicacy Trials — can you hear what's wrong?",
  description:
    "Six pairs of clips. In each, one is the original and one has been quietly damaged. Find the key in the wine.",
  robots: { index: false },
  alternates: { canonical: "/delicacy" },
};

export default function DelicacyPage() {
  return <DelicacyFlow />;
}
