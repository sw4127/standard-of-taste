import type { Metadata } from "next";
import Link from "next/link";
import GymStage from "./GymStage";
import GymFloor, { type Machine } from "./GymFloor";
import Track from "@/components/Track";
import { worldCup } from "@/content/world-cup";
import { DELICACY_LIVE } from "@/content/delicacy/items";
import { landingLead } from "@/content/landing";
import { PRESTIGE_GOLD, PRESTIGE_FIELD, DELICACY_ICE, DELICACY_FIELD, THRESHOLD_VIOLET, THRESHOLD_FIELD, THRESHOLD_BASE } from "@/content/instrument-accents";

/**
 * The taste-gym landing (RT-3c, memo §9.7 RESOLVED 2026-07-11): /bias is the
 * flagship, the music quiz demotes to a secondary door, the WC path is legacy
 * (route stays alive; only referred arrivals see a pointer to it). No
 * existing route or shared URL 404s — this page only changed its content.
 */

export const metadata: Metadata = {
  title: "The Taste Gym — do you hear the music, or the name?",
  description:
    "Your taste has a number. The Prestige Test measures how far a famous name can move your ratings. Sixteen clips, rated twice — the gap is your number.",
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
const GOLD = PRESTIGE_GOLD;
/** The delicacy instrument's own accent — each machine owns exactly one. */
const ICE = DELICACY_ICE;

/**
 * The machines as DATA. Each owns its accent, its ambient field and the
 * page surface the room takes when it is selected — so "the theme follows your
 * choice" is a property of this list rather than something a component
 * remembers to do.
 */
const MACHINES: Machine[] = [
  {
    id: "bias",
    href: "/bias",
    n: "01",
    accent: GOLD,
    field: PRESTIGE_FIELD,
    surface: "#0B0A08",
    title: "The Prestige Test",
    criterion: "Freedom from prejudice",
    blurb:
      "Rate sixteen clips blind, then again with the famous names attached — asked a different way, in a different order. Your number is the gap.",
    meta: "~8 min · 16 clips",
  },
  ...(DELICACY_LIVE
    ? [
        {
          id: "delicacy",
          href: "/delicacy",
          n: "02",
          accent: ICE,
          /*
           * RESOLVED IN E10/S8, ON THE PATTERN THE OTHER TWO ALREADY SET.
           *
           * This held a hand-written blue — `hsl(190 55% 45%) …` — different
           * from the field the Delicacy Trials themselves paint. While `field`
           * was dead (E10/S4b) that difference was invisible and was left
           * alone rather than tidied away, because tidying it would have
           * decided RT-AD by stealth.
           *
           * Wiring it makes the difference visible: selecting Delicacy would
           * show one blue and entering it another. Prestige and Threshold both
           * already point at their instrument's own field, and no reason was
           * ever recorded for delicacy being the exception — so it joins them.
           * The promise this feature makes is that the room shows you the
           * machine you picked, which only holds if it is the same colour.
           */
          field: DELICACY_FIELD,
          surface: "#070C0E",
          title: "The Delicacy Trials",
          criterion: "Delicacy of taste",
          blurb:
            "One clip of each pair has been quietly damaged. Practise first with the answers shown, then find it — and name what is wrong.",
          meta: "~10 min · 3 practice + 15 scored",
        } satisfies Machine,
      ]
    : []),
  /**
   * MACHINE 03 — the threshold staircase (E5/S7, PM ruling RT-59a).
   *
   * IT HAS ITS OWN ACCENT SINCE E7/S18 (RT-148). It used to share Delicacy's
   * ice on the argument that both measure the same Hume criterion — true about
   * the taxonomy, false about the experience: two different tests whose result
   * cards were indistinguishable at a glance.
   * What separates them is the deliverable — Delicacy asks a fixed set and
   * reports how many you caught; this one adapts and reports the SIZE of the
   * smallest flaw you can still hear.
   */
  {
    id: "threshold",
    href: "/threshold",
    n: "03",
    accent: THRESHOLD_VIOLET,
    field: THRESHOLD_FIELD,
    surface: THRESHOLD_BASE,
    title: "The Threshold Test",
    criterion: "Delicacy of taste · measured",
    blurb:
      "The damage gets smaller every time you catch it, and bigger every time you miss. It stops at the size where you stop being sure — and that size is your number.",
    meta: "14-26 min · a number in cents, ms or kbps",
  },
];

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
      <Track event="landing_view" props={{ variant: "gym" }} />
      <GymStage machines={MACHINES}>
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
          {landingLead(MACHINES.length)}{" "}
          <span className="text-foreground">You can be wrong, and that is the point.</span>
        </p>

        <GymFloor
          machines={MACHINES}
          locked={
            DELICACY_LIVE ? null : (
              <div className="rounded-2xl border border-dashed border-white/20 p-5">
                <p className="text-[0.65rem] font-bold tracking-[0.3em] text-muted">MACHINE 02 · LOCKED</p>
                <p className="mt-1.5 font-display text-xl font-semibold text-neutral-400">The Delicacy Trials</p>
                <p className="mt-1 text-sm text-muted">Opens when its item pool clears validation.</p>
              </div>
            )
          }
        />

        {/* Secondary doors — quiet rows, no bare underline/arrow links
            (PM 2026-07-17): the lead-in word carries the accent, hover lifts
            the whole line. */}
        <div className="mt-8 flex flex-col gap-2.5 text-sm">
          <Link href="/music/quiz" className="group text-muted transition-colors hover:text-white">
            <span className="font-semibold text-[hsl(42_45%_52%)] transition-colors group-hover:text-[hsl(42_80%_62%)]">
              Snack.
            </span>{" "}
            Five taps, a verdict, and no measurement behind it.
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
      </GymStage>
    </main>
  );
}

/**
 * One machine on the gym floor. Both instruments render through this, which is
 * the whole point: making them the same component is what stops one of them
 * quietly becoming the default.
 */
