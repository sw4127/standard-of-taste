import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ThresholdFlow from "../ThresholdFlow";
import { THRESHOLD_SLUGS, familyForSlug } from "../families";
import { FAMILY_BLURB, familyLabel } from "@/content/staircase/copy";

/** Three static pages, enumerated from the route table rather than listed. */
export function generateStaticParams() {
  return THRESHOLD_SLUGS.map((slug) => ({ slug }));
}

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const family = familyForSlug(slug);
  if (!family) return { title: "Not found — The Taste Gym" };
  const title = `${familyLabel(family)} — how small a flaw can you hear?`;
  const description = `An adaptive listening test that finds the smallest ${FAMILY_BLURB[family]} you can still catch, and reports it in physical units.`;
  return {
    title,
    description,
    alternates: { canonical: `/threshold/${slug}` },
    openGraph: { title, description, images: [{ url: "/opengraph-image", width: 1200, height: 630 }] },
  };
}

export default async function ThresholdPage({ params }: { params: Params }) {
  const { slug } = await params;
  const family = familyForSlug(slug);
  if (!family) notFound();
  return <ThresholdFlow family={family} />;
}
