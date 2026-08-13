import type { Metadata } from "next";
import Link from "next/link";
import FluidField from "@/components/FluidField";
import Track from "@/components/Track";
import { worldCup } from "@/content/world-cup";
import { DELICACY_LIVE, DELICACY_TRIALS } from "@/content/delicacy/items";

/**
 * The taste-gym landing (RT-3c, memo §9.7 RESOLVED 2026-07-11): /bias is the
 * flagship, the music quiz demotes to a secondary door, the WC path is legacy
 * (route stays alive; only referred arrivals see a pointer to it). No
 * existing route or shared URL 404s — this page only changed its content.
 */

export const metadata: Metadata = {
  title: "The Taste Gym — do you hear the music, or the name?",
  description:
    "Your taste has a number. The Prestige Test measures how far a famous name can move your ratings. Ten clips, rated twice — the gap is your number.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "The Taste Gym — do you hear the music, or the name?",
    description:
      "Your taste has a number. The Prestige Test measures how far a famous name can move your ratings.",
    siteName: "The Taste Gym",
    type: "website",
  },
};

/**
 * BRAND CHROME IS NEUTRAL, NOT GOLD (PM user-testing, 2026-08-08).
 *
 * "THE TASTE GYM" used to render in the same gold as the Prestige Test's own
 * accent, so the brand read as that instrument and the Delicacy Trials looked
 * like a guest in someone else's house. Gold now belongs to Prestige, ice to
 * Delicacy, and the gym itself is neutral — which is the only arrangement in
 * which two instruments can actually be peers.
 */
const BRAND = "rgba(244,245,248,0.72)";
const GOLD = "hsl(42 80% 62%)";
/** The delicacy instrument's own accent — each machine owns exactly one. */
const ICE = "hsl(190 75% 62%)";
const GOLD_GLOW = "hsl(42 80% 60% / 0.45)";
const FLUID = ["hsl(42 55% 48%)", "hsl(28 50% 44%)", "hsl(52 45% 46%)", "hsl(20 40% 40%)"];

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  // Legacy WC share links land here with ?from=<archetypeId> — greet them and
  // point at the game they were actually sent (Track 5: legacy, not featured).
  const sp = await searchParams;
  const fromId = typeof sp.from === "string" ? sp.from : undefined;
  const friendArchetype = fromId
    ? worldCup.archetypes.centroids.find((c) => c.id === fromId)?.label
    : undefined;

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center overflow-hidden px-6 py-12">
      <FluidField colors={FLUID} baseColor="#0B0A08" intensity={0.6} scrim={false} vignette />
      <Track event="landing_view" props={{ variant: "gym" }} />
      <div className="relative z-10">
        <p className="text-xs font-bold tracking-[0.4em]" style={{ color: BRAND }}>
          THE TASTE GYM
        </p>

        {friendArchetype ? (
          <p className="mt-5 inline-block rounded-full border border-white/10 px-4 py-1.5 text-sm text-muted">
            Your friend is <span className="font-semibold" style={{ color: GOLD }}>{friendArchetype}</span> on
            the pitch — that game lives{" "}
            <Link href="/quiz" className="underline underline-offset-4" style={{ color: GOLD }}>
              here
            </Link>
            . The gym is what&apos;s new.
          </p>
        ) : null}

        <h1 className="mt-7 font-display text-5xl font-semibold leading-[1.02] tracking-tight">
          Your taste has a number.
        </h1>
        <p className="mt-5 text-base leading-relaxed text-muted">
          Not a personality. Not a vibe. Two machines, each measuring one thing Hume said a real
          judge needs — whether a famous name can move your ratings, and whether your ears can
          catch damage when nobody tells you where it is.{" "}
          <span className="text-foreground">You can be wrong, and that is the point.</span>
        </p>

        {/* THE GYM FLOOR — two machines, genuinely parallel (PM user-test
            2026-08-08). This used to be a big gold "Take the Prestige Test"
            button followed by a "floor" where machine 01 was a NON-CLICKABLE
            div and machine 02 was a link. They looked like siblings and
            behaved differently: one was a label, the other a door, and the
            gold CTA above had already pre-picked the winner. Both are now the
            same component, the same size, the same weight — each carrying only
            its own instrument's accent, and each its own door. */}
        <div className="mt-9 grid gap-3 sm:grid-cols-2">
          <MachineCard
            href="/bias"
            n="01"
            accent={GOLD}
            title="The Prestige Test"
            criterion="Freedom from prejudice"
            blurb="Rate ten clips blind, then rate them again with the famous names attached. Your number is the gap."
            meta="~5 min · 10 clips"
          />
          {DELICACY_LIVE ? (
            <MachineCard
              href="/delicacy"
              n="02"
              accent={ICE}
              title="The Delicacy Trials"
              criterion="Delicacy of taste"
              blurb="One clip of each pair has been quietly damaged. Find which — and name what is wrong with it."
              meta={`~10 min · ${DELICACY_TRIALS.length} pairs`}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-white/20 p-5">
              <p className="text-[0.65rem] font-bold tracking-[0.3em] text-muted">MACHINE 02 · LOCKED</p>
              <p className="mt-1.5 font-display text-xl font-semibold text-neutral-400">The Delicacy Trials</p>
              <p className="mt-1 text-sm text-muted">Opens when its item pool clears validation.</p>
            </div>
          )}
        </div>
        <p className="mt-4 text-xs text-muted">Free · no sign-up · headphones help · start with either</p>

        {/* Secondary doors — quiet rows, no bare underline/arrow links
            (PM 2026-07-17): the lead-in word carries the accent, hover lifts
            the whole line. */}
        <div className="mt-8 flex flex-col gap-2.5 text-sm">
          <Link href="/music/quiz" className="group text-muted transition-colors hover:text-white">
            <span className="font-semibold text-[hsl(42_45%_52%)] transition-colors group-hover:text-[hsl(42_80%_62%)]">
              Warm-up.
            </span>{" "}
            The original music-taste read.
          </Link>
          {/* The library (§3.C7) — crawlable path into the explainers (D5). */}
          <Link href="/learn" className="group text-muted transition-colors hover:text-white">
            <span className="font-semibold text-[hsl(42_45%_52%)] transition-colors group-hover:text-[hsl(42_80%_62%)]">
              Reading room.
            </span>{" "}
            Hume&apos;s five criteria, and how we measure them.
          </Link>
        </div>

        <p className="mt-8 text-[11px] text-muted/70">
          <Link href="/legal" className="transition hover:text-white">
            Terms · Privacy
          </Link>
        </p>
      </div>
    </main>
  );
}

/**
 * One machine on the gym floor. Both instruments render through this, which is
 * the whole point: making them the same component is what stops one of them
 * quietly becoming the default.
 */
function MachineCard({
  href,
  n,
  accent,
  title,
  criterion,
  blurb,
  meta,
}: {
  href: string;
  n: string;
  accent: string;
  title: string;
  criterion: string;
  blurb: string;
  meta: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border p-5 transition hover:bg-white/[0.06] active:scale-[0.99]"
      style={{ borderColor: `${accent.slice(0, -1)} / 0.35)`, background: "rgba(255,255,255,0.03)" }}
    >
      <p className="text-[0.65rem] font-bold tracking-[0.3em]" style={{ color: accent }}>
        MACHINE {n} · OPEN
      </p>
      <p className="mt-1.5 font-display text-xl font-semibold">{title}</p>
      <p className="mt-0.5 text-xs font-semibold tracking-wide text-muted">{criterion}</p>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-300">{blurb}</p>
      <p className="mt-4 flex items-center justify-between text-xs">
        <span className="text-muted">{meta}</span>
        <span className="font-bold transition-transform group-hover:translate-x-0.5" style={{ color: accent }}>
          Start &rarr;
        </span>
      </p>
    </Link>
  );
}
