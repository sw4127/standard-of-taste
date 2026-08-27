import type { Metadata } from "next";
import Link from "next/link";
import { THRESHOLD_VIOLET, THRESHOLD_VIOLET_GLOW, THRESHOLD_FIELD, tint } from "@/content/instrument-accents";
import FluidField from "@/components/FluidField";
import { THRESHOLD_SLUGS, familyForSlug } from "./families";
import { FAMILY_BLURB, familyLabel, quantity } from "@/content/staircase/copy";
import { axisFor, sessionMinutes } from "@/engine/staircase-session";
import { isSourceLocked } from "@/engine/staircase-pool";

/**
 * PICK A FLAW (E5/S7).
 *
 * ONE FAMILY PER SESSION is a ruling, not a layout choice (RT-59a): the
 * staircase converges on one kind of damage at a time, and interleaving three
 * would mean three half-measured ladders instead of one measured one. So the
 * machine's front door is a choice of which flaw to chase tonight.
 *
 * EVERY NUMBER ON THIS PAGE IS DERIVED FROM THE ENGINE — the ladder's range,
 * the number of rungs, the session length. Written down, they would be three
 * more copies of facts that have already changed twice this month.
 */

export const metadata: Metadata = {
  title: "Find your threshold — The Taste Gym",
  description:
    "Three adaptive listening tests, one per kind of damage. Each finds the smallest flaw you can still catch and reports it in physical units — cents, milliseconds, kilobits per second.",
  alternates: { canonical: "/threshold" },
  openGraph: {
    title: "Find your threshold — The Taste Gym",
    description: "How small a flaw can you actually hear? Measured, in physical units.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

const ICE = THRESHOLD_VIOLET;
const FLUID = THRESHOLD_FIELD;
const BRAND = "rgba(244,245,248,0.72)";


export default function ThresholdIndex() {
  const machines = THRESHOLD_SLUGS.map((slug) => {
    const family = familyForSlug(slug)!;
    // Lossy locks to one recording, so its ladder differs per source; the index
    // shows the widest one it can actually present.
    const axis = isSourceLocked(family) ? axisFor(family, "pb1") : axisFor(family);
    return {
      slug,
      family,
      axis,
      minutes: sessionMinutes(family),
    };
  });

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center overflow-hidden px-6 py-12">
      <FluidField colors={FLUID} baseColor="#07090B" intensity={0.6} scrim={false} vignette />
      <div className="relative z-10">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-xs font-bold tracking-[0.4em]" style={{ color: BRAND }}>
            THE TASTE GYM
          </p>
          <Link href="/" className="text-[0.65rem] font-bold tracking-[0.3em] text-muted transition hover:text-white">
            THE GYM FLOOR
          </Link>
        </div>

        <h1 className="mt-7 font-display text-4xl font-semibold leading-[1.05] tracking-tight">
          How small a flaw can you hear?
        </h1>
        <p className="mt-5 text-base leading-relaxed text-muted">
          Three kinds of damage, one per session. Each test walks the flaw down until you stop being
          sure, and gives you the size where that happened —{" "}
          <span className="text-foreground">a physical quantity, not a score.</span>
        </p>

        <ul className="mt-7 flex flex-col gap-3">
          {machines.map(({ slug, family, axis, minutes }) => (
            <li key={slug}>
              <Link
                href={`/threshold/${slug}`}
                className="group flex flex-col rounded-2xl border p-5 transition duration-300 active:scale-[0.99]"
                style={{ borderColor: tint(ICE, 0.3), background: "rgba(255,255,255,0.03)" }}
              >
                <p className="font-display text-xl font-semibold">{familyLabel(family)}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-300">{FAMILY_BLURB[family]}</p>
                <p className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-muted">
                    ~{minutes} min · {axis.labels.length} rungs ·{" "}
                    {quantity(Math.min(...axis.labels), axis.unit)} to {quantity(Math.max(...axis.labels), axis.unit)}
                  </span>
                  <span
                    className="font-bold transition-transform group-hover:translate-x-0.5"
                    style={{ color: ICE }}
                  >
                    Start →
                  </span>
                </p>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-5 text-xs text-muted">
          Free · no sign-up · headphones required, not advised — laptop speakers cannot reproduce most
          of what this measures.
        </p>

        <p className="mt-8 text-sm text-muted">
          <Link href="/lab/instrument-limits" className="transition hover:text-white" style={{ color: ICE }}>
            What this instrument cannot do.
          </Link>{" "}
          Every limit we measured and could not fix.
        </p>
      </div>
    </main>
  );
}
