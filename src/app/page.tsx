import { numberWord } from "@/content/vocabulary/numbers";
import {
  BIAS_CLIP_COUNT,
  BIAS_SESSION_MINUTES,
  SPREAD_CLIP_SECONDS,
  SPREAD_SESSION_MINUTES,
  SPREAD_WORK_COUNT,
} from "@/content/instrument-shape";
import type { Metadata } from "next";
import Link from "next/link";
import GymStage from "./GymStage";
import GymFloor, { type Machine } from "./GymFloor";
import Track from "@/components/Track";
import SiteHeader from "@/components/SiteHeader";
import ZhTerms from "@/components/ZhTerms";
import { SITE_NAV } from "@/content/site-nav";
import { SHELL_MAIN, PROSE_MEASURE } from "@/content/shell";
import { DELICACY_LIVE } from "@/content/delicacy/items";
import {
  landingLead,
  LANDING_HEADLINE,
  LANDING_ALGORITHM,
  LANDING_READING_TURN,
  LANDING_CARDS_LEAD,
  HEARING_KICKER,
  HEARING_HEADING,
  SECONDARY_DOORS,
} from "@/content/landing";
import ListenerCards from "@/components/ListenerCards";
import { LISTENERS } from "@/content/reading/listeners";
import { readingFor } from "@/content/reading/reading";
import { READING_SHARE_LINE } from "@/content/reading/copy";
import { bpIn } from "@/content/blueprint";
import { tFor, type Slots } from "@/lib/i18n";
import type { Locale } from "@/lib/locale";
import LANDING_ZH, { landingLeadZh } from "@/content/zh/copy/landing";
import { PRESTIGE_GOLD, PRESTIGE_FIELD, DELICACY_ICE, DELICACY_FIELD, THRESHOLD_VIOLET, THRESHOLD_FIELD, THRESHOLD_BASE, SPREAD_ROSE, SPREAD_FIELD, SPREAD_BASE } from "@/content/instrument-accents";

/**
 * The taste-gym landing (RT-3c, memo §9.7 RESOLVED 2026-07-11): /bias is the
 * flagship, the music quiz demotes to a secondary door, the WC path is legacy
 * (route stays alive; only referred arrivals see a pointer to it). No
 * existing route or shared URL 404s — this page only changed its content.
 */

// Blueprint Part 7 (BA-6): the reading is the front door; the Prestige Test is in the hearing section.
export const metadata: Metadata = {
  title: "Standard of Taste — a month of listening, read back in words you can argue with",
  description:
    "A reading of a listener's recent plays: each line points at the plays behind it, offers what it might mean, and ends in a prompt you can carry into a music generator. Then find out which of its words you can actually hear.",
  alternates: { canonical: "/", languages: { en: "/", "zh-Hans": "/zh" } },
  openGraph: {
    title: "Standard of Taste — a month of listening, read back in words you can argue with",
    description: READING_SHARE_LINE,
    siteName: "Standard of Taste",
    type: "website",
  },
};

/**
 * BRAND CHROME IS NEUTRAL, NOT GOLD (PM user-testing, 2026-08-08).
 *
 * "STANDARD OF TASTE" used to render in the same gold as the Prestige Test's own
 * accent, so the brand read as that instrument and the Delicacy Trials looked
 * like a guest in someone else's house. Gold now belongs to Prestige, ice to
 * Delicacy, and the gym itself is neutral — which is the only arrangement in
 * which two instruments can actually be peers.
 */
// The neutral chrome colour this paragraph is about now lives in SiteHeader.
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
    // Templates with slots since bilingual Part 2: `machinesIn` fills them in the page's language.
    blurb:
      "Rate {count} clips blind, then again with the famous names attached — asked a different way, in a different order. Your number is the gap.",
    meta: "~{minutes} min · {clips} clips",
    slots: { count: BIAS_CLIP_COUNT, minutes: BIAS_SESSION_MINUTES, clips: BIAS_CLIP_COUNT },
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
  /**
   * MACHINE 04 — the Ranking Test (E17, Track N).
   *
   * THIS LIST IS NOT `MACHINES` FROM THE REGISTRY, and that is why it went
   * stale. The floor needs an ambient field, a page surface, a criterion and a
   * duration that the shared roster does not carry, so it keeps its own richer
   * shape — but for two commits the front door offered three machines while
   * four were live, on the most-visited page in the product.
   * `instrument-state.test.ts` now checks these ids against the roster.
   */
  {
    id: "spread",
    href: "/spread",
    n: "04",
    accent: SPREAD_ROSE,
    field: SPREAD_FIELD,
    surface: SPREAD_BASE,
    title: "The Ranking Test",
    criterion: "Comparison · heard",
    blurb:
      "A critic ranked {count} works against each other. Rate them with your ears alone and find out whether your gaps fall where his did — agreeing with him is not the point, and is not measured.",
    meta: "~{minutes} min · {works} works, {seconds} seconds each",
    slots: { count: SPREAD_WORK_COUNT, minutes: SPREAD_SESSION_MINUTES, works: SPREAD_WORK_COUNT, seconds: SPREAD_CLIP_SECONDS },
  },
];

/**
 * THE MACHINES IN THE PAGE'S LANGUAGE (bilingual Part 2). Each text field is an
 * English template; `count` is written as a word in English prose ("sixteen
 * clips") and every other slot, and every slot in Chinese, as a digit. The
 * English this produces is what the page rendered before the change.
 */
function machinesIn(locale: Locale): Machine[] {
  const t = tFor(locale, LANDING_ZH);
  return MACHINES.map((m) => {
    const s = m.slots ?? {};
    const words: Slots = locale === "en" && "count" in s ? { ...s, count: numberWord(s.count) } : s;
    return { ...m, title: t(m.title), criterion: t(m.criterion), blurb: t(m.blurb, words), meta: t(m.meta, s) };
  });
}

// The shared nav. On the front door the reading's door is the listener cards
// themselves, so the nav skips it rather than offer one room twice (RT-1 a,
// site-doors.test.tsx); the hearing link is this page's own section.
const HEADER_LINKS = SITE_NAV.filter((l) => l.href !== "/reading" && l.href !== "/#hearing");

/*
 * The `?from=<archetype>` greeting that pointed referred World Cup arrivals at
 * /quiz went with that game: PM ruling RT-2 (2026-09-22) a. A legacy link still
 * lands here; it is simply greeted by the gym.
 */
export default function Home({ locale = "en" }: { locale?: Locale }) {
  // `/zh` renders this same page in Chinese (bilingual Part 2); English is the default.
  const t = tFor(locale, LANDING_ZH);
  const machines = machinesIn(locale);
  return (
    <main className={`${SHELL_MAIN} justify-center`}>
      <Track event="landing_view" props={{ variant: "gym" }} />
      <GymStage machines={machines}>
      <div className="relative z-10">
        <SiteHeader locale={locale} links={HEADER_LINKS} />

        <h1 className={`mt-7 ${PROSE_MEASURE} font-display text-[2rem] font-semibold leading-[1.06] tracking-tight sm:text-5xl sm:leading-[1.02]`}>
          <ZhTerms>{t(LANDING_HEADLINE)}</ZhTerms>
        </h1>
        <p className={`mt-5 ${PROSE_MEASURE} text-lg leading-relaxed text-muted`}>
          {t(LANDING_ALGORITHM)}
        </p>
        <p className={`mt-4 ${PROSE_MEASURE} font-display text-xl leading-snug sm:text-2xl`}>
          <ZhTerms>{t(LANDING_READING_TURN)}</ZhTerms>
        </p>

        {/* THE PRIMARY ACTION: the reading (D3 amendment, BA-6). */}
        <p className={`mt-8 text-[0.65rem] font-bold tracking-[0.3em] text-muted`}>{locale === "en" ? LANDING_CARDS_LEAD.toUpperCase() : t(LANDING_CARDS_LEAD)}</p>
        <div className={`mt-3 ${PROSE_MEASURE}`}>
          <ListenerCards locale={locale} readings={LISTENERS.map((l) => readingFor(l, locale))} />
        </div>

        {/* THE HEARING SECTION: the four instruments, unchanged, reached through BP-BRIDGE. */}
        <section id="hearing" className="mt-16 scroll-mt-8 border-t border-white/10 pt-10">
          <p className="text-[0.65rem] font-bold tracking-[0.3em] text-muted">{t(HEARING_KICKER)}</p>
          <h2 className={`mt-2 ${PROSE_MEASURE} font-display text-2xl font-semibold leading-tight sm:text-3xl`}>
            <ZhTerms>{t(HEARING_HEADING)}</ZhTerms>
          </h2>
          <p className={`mt-3 ${PROSE_MEASURE} text-base leading-relaxed text-neutral-300`}>{bpIn(locale, "BP-BRIDGE").text}</p>
          <p className={`mt-4 ${PROSE_MEASURE} text-base leading-relaxed text-muted`}>
            {locale === "zh" ? landingLeadZh(machines.length) : landingLead(machines.length)}
            {locale === "zh" ? "" : " "}
            <span className="text-foreground">{t("You can be wrong, and that is the point.")}</span>
          </p>

        <GymFloor
          machines={machines}
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
            the whole line. They are DATA (E11/S4): two of them had been
            ungated JSX prose on the busiest page in the product since the gym
            opened, which is exactly how the lead paragraph above went on
            saying "Two machines" over three cards. None of them may point
            where the header already does (site-doors.test.tsx). */}
        <div className="mt-8 flex flex-col gap-2.5 text-sm">
          {SECONDARY_DOORS.map((d) => (
            <Link
              key={d.href}
              href={d.href}
              className="group text-muted transition-colors hover:text-white"
            >
              <span className="font-semibold text-[hsl(225_8%_78%)] transition-colors group-hover:text-[hsl(225_8%_90%)]">
                {t(d.label)}
              </span>
              {locale === "en" ? " " : ""}
              {t(d.line)}
            </Link>
          ))}
        </div>

        </section>

        <p className="mt-8 text-[11px] text-muted/70">
          <Link href="/legal" className="transition hover:text-white">
            {t("Terms · Privacy")}
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
