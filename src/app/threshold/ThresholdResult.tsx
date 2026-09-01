"use client";

/**
 * THE RESULT SCREEN (E5/S6).
 *
 * THE FOCAL POINT IS THE BAND, not a score and not a tier — two rungs in a
 * physical unit, with the ladder drawn underneath so a person can see where
 * those two sit among everything they were actually asked. The design bar wants
 * one clear focal point and a reveal rather than a form submit; the reveal here
 * is a number nobody has ever been given about their own ears.
 *
 * IT RENDERS ALL FOUR OUTCOME KINDS FROM ONE PATH. `resultLines` already
 * decides what can honestly be said for each; this component lays those out and
 * draws the ladder. There is no `if (kind === ...)` branch controlling copy —
 * that was the point of putting the copy in `src/content/staircase/copy.ts` and
 * running it through the voice gate.
 *
 * EVERY NUMBER IS BADGED SIMULATED-ADJACENT BY OMISSION: there is no cohort,
 * no percentile, no comparison. The footnote says so in words, and
 * `NO_COHORT_FOOTNOTE` is the last thing on the screen rather than the first
 * thing cut.
 */

import Link from "next/link";
import FluidField from "@/components/FluidField";
import {
  familyLabel,
  NO_COHORT_FOOTNOTE,
  quantity,
  resultLines,
  shortUnit,
  thresholdCardFigure,
  thresholdShareText,
  THRESHOLD_SHARE_LABEL,
  THRESHOLD_STORY_LABEL,
} from "@/content/staircase/copy";
import ShareButton from "@/app/result/ShareButton";
import { thresholdCardPath, thresholdResultPath, type ThresholdShare } from "./share-links";
import { THRESHOLD_VIOLET, THRESHOLD_VIOLET_GLOW, THRESHOLD_FIELD, THRESHOLD_BASE } from "@/content/instrument-accents";
import DownloadButton from "@/app/result/DownloadButton";
import OtherMachines from "@/components/OtherMachines";
import { baseUrl } from "@/lib/site";
import type { StaircaseResult } from "@/engine/staircase-session";
import { thresholdClaim } from "@/engine/evidence";
import { creatorLines } from "@/content/vocabulary/threshold";
import Jump from "@/components/Jump";
import { FLAWS_HREF, FLAWS_INVITE } from "@/content/flaw-families";
import AcrossSessions from "@/components/AcrossSessions";
import AcrossTime from "@/components/AcrossTime";
import ExpertPanel from "@/components/ExpertPanel";
import type { StoredPayload } from "@/lib/result-store";

const ICE = THRESHOLD_VIOLET;

const ICE_GLOW = THRESHOLD_VIOLET_GLOW;
// E7/S23: these were still Delicacy's blues. E7/S18 moved the accent and the
// flow's field but missed this file, and the accent guard could not see it —
// it looked for hsl(190 exactly, and an ambient field is built from the
// accent's NEIGHBOURS, which are 180-225. The guard now checks the range.
const FLUID = THRESHOLD_FIELD;
const BRAND = "rgba(244,245,248,0.72)";

export default function ThresholdResult({
  result,
  share,
  identity,
}: {
  result: StaircaseResult;
  share?: ThresholdShare;
  /**
   * WHO THIS SESSION BELONGS TO — separate from `share` ON PURPOSE (E8/C2).
   *
   * `share` answers "may this page offer a share button and a card?", which the
   * permalink answers NO, because it may be showing a stranger's number.
   * `identity` answers "which session is on screen?", which the personal panels
   * compare against this device's storage to decide whether to speak.
   *
   * E8/S8 keyed the panels off `share` and conflated the two, so withholding
   * the share affordance also silenced `AcrossSessions` on the permalink — for
   * everyone, the owner included. E8/S12 saw that and mis-read it as the
   * ownership check working correctly; it was not, the panels were never
   * reachable on that route at all. The flow passes both; the permalink passes
   * only this.
   */
  identity?: StoredPayload;
}) {
  /*
   * Either source yields the same comparison, so the components never learn
   * which route they are on.
   */
  const own: StoredPayload | undefined =
    identity ??
    (share
      ? {
          kind: "threshold",
          slug: share.slug,
          seed: share.seed,
          answers: share.answers,
          ...(share.sourceId ? { sourceId: share.sourceId } : {}),
        }
      : undefined);
  const lines = resultLines(result);
  const [headline, ...rest] = lines;
  // Partitioned BY IDENTITY, not by position. `resultLines` happens to put the
  // footnote last today; a test that relied on that would pass until somebody
  // reordered the array, and the failure would be a missing footnote nobody
  // notices rather than an error.
  const footnote = rest.find((l) => l === NO_COHORT_FOOTNOTE) ?? null;
  const body = rest.filter((l) => l !== NO_COHORT_FOOTNOTE);
  const unit = shortUnit(result.unit);

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col overflow-hidden px-6 py-10">
      <FluidField colors={FLUID} intensity={0.6} scrim={false} vignette />
      <div className="relative z-10">
        <p className="text-xs font-bold tracking-[0.4em]" style={{ color: BRAND }}>
          THE TASTE GYM
        </p>

        <div className="mt-6 flex items-baseline justify-between gap-3">
          <p className="text-[0.65rem] font-bold tracking-[0.3em]" style={{ color: ICE }}>
            {familyLabel(result.family).toUpperCase()}
            {result.sourceId ? ` · ${result.sourceId}` : ""}
          </p>
          {/*
            NOT A `SourceBadge`, AND THE FIRST VERSION WAS. It rendered
            SIMULATED beside a result measured from the person reading it, which
            is false in the direction that quietly discredits the one honest
            number on the page. `SourceBadge` describes the provenance of COHORT
            data in the Lab; a personal session has no cohort at all, and the
            accurate thing to print is exactly that. Caught by reading the
            rendered page.
          */}
          <span
            className="shrink-0 rounded-full border border-dashed border-white/35 px-2.5 py-1 font-mono text-[0.6rem] font-bold tracking-[0.18em] text-muted"
            title="Measured from your session. No cohort exists to compare it against."
          >
            YOUR SESSION · COHORT n = {result.cohortN}
          </span>
        </div>

        {/*
          THE REVEAL (RT-102a, ruled 2026-08-21).
          
          The Design Quality Bar asks the result screen to feel like a reveal
          rather than a form submit, and the PM ruled this deck not-done against
          it. The diagnosis was concrete rather than a matter of taste: both
          sibling instruments lead with their number — the delicacy trials at
          text-7xl, the prestige test with its signed percentage — while the
          FLAGSHIP, whose whole deliverable is "a per-flaw threshold in physical
          units", opened with a sentence and left the number inside it.
          
          So the figure leads, at the size its siblings use, in the accent they
          use. It is the same string the share card shows, from the same gated
          function, so the screen and the card cannot describe the session
          differently.
          
          It is allowed to WRAP, which the card is not: a screen can afford two
          lines and "6.3–17.7 cents" breaking after the range reads fine. That
          is why this uses a plain size and the card computes one.
        */}
        <p
          className="mt-5 font-display text-5xl font-semibold leading-[1.05] tracking-tight"
          style={{ color: ICE, textShadow: `0 0 60px ${ICE_GLOW}` }}
        >
          {thresholdCardFigure(result)}
        </p>

        <h1 className="mt-4 font-display text-2xl font-semibold leading-snug tracking-tight">
          {headline}
        </h1>

        <Ladder result={result} unit={unit} />

        <div className="mt-8 space-y-4">
          {body.map((line) => (
            <p key={line} className="text-sm leading-relaxed text-muted">
              {line}
            </p>
          ))}
        </div>

        <InRender result={result} />

        {/* Only when this page is showing THIS device's own session — see
            AcrossSessions. Without `share` there is no payload to compare, so
            there is nothing to claim ownership of. */}
        {own ? <AcrossTime accent={ICE} own={own} /> : null}
        {own ? <AcrossSessions accent={ICE} own={own} /> : null}

        {own && own.kind === "threshold" ? (
          <ExpertPanel accent={ICE} instrument={{ kind: "threshold", slug: own.slug }} own={own} />
        ) : null}

        {/*
          THE NO-COHORT FOOTNOTE STAYS LAST, which is why the translation panel
          is spliced in ABOVE it rather than appended after `resultLines`.
          Appending was the first version, and reading the rendered page showed
          why it was wrong: the footnote closes the screen — "measured on you,
          against physics, and stands on its own" — and the panel then started
          the conversation up again underneath the sign-off.
        */}
        {footnote ? <p className="mt-4 text-sm leading-relaxed text-muted">{footnote}</p> : null}

        {share ? (
          <div className="mt-9">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thresholdCardPath("square", share)}
              alt={`Threshold card: ${thresholdCardFigure(result)}`}
              className="w-full max-w-xs rounded-2xl border border-white/10"
            />
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <ShareButton
                url={`${baseUrl()}${thresholdResultPath(share)}`}
                text={thresholdShareText(result)}
                label={THRESHOLD_SHARE_LABEL}
                event="threshold_share"
                primary
                accent={ICE}
              />
              <DownloadButton
                url={thresholdCardPath("story", share)}
                label={THRESHOLD_STORY_LABEL}
                filename={`threshold-${share.slug}-story.png`}
              />
            </div>
          </div>
        ) : null}

        <div className="mt-9 flex flex-col gap-2.5 text-sm">
          <Link href="/lab/instrument-limits" className="group text-muted transition-colors hover:text-white">
            <span className="font-semibold transition-colors" style={{ color: ICE }}>
              What this instrument cannot do.
            </span>{" "}
            Every limit we measured and could not fix.
          </Link>

        </div>

        {/* E7/S23: this reveal used to offer a link called "The other machines"
            that went to the gym floor and named neither of them. Whoever
            finished the longest instrument in the product got the vaguest
            onward door. */}
        <OtherMachines from="threshold" />
      </div>
    </main>
  );
}

/**
 * WHAT THIS MEANS IN A RENDER — the creator translation (E8/S3).
 *
 * PLACED AFTER THE MEASUREMENT, DELIBERATELY. The reading order on this screen
 * is figure -> headline -> ladder -> what was measured -> what it means for your
 * own work. Putting the translation first would make the instrument sound like
 * it was reasoning backwards from a conclusion; putting it last lets the number
 * land on its own, which is the reveal the design bar asks for.
 *
 * IT CAN RENDER NOTHING, AND THAT IS A REAL STATE. `thresholdClaim` refuses when
 * the session resolved no rung at all, and a screen that always finds something
 * encouraging to say is exactly the failure N3 exists to prevent. When the claim
 * is refused this component returns null and the screen simply ends after the
 * measurement — no apology, no filler panel.
 *
 * ONE ACCENT, still. The panel borrows the Ladder's card treatment rather than
 * introducing a second visual language; the only colour is the eyebrow, in the
 * same violet the figure already uses.
 */
function InRender({ result }: { result: StaircaseResult }) {
  const claim = thresholdClaim(result);
  if (!claim.ok) return null;
  const lines = creatorLines(claim.value);
  if (lines.length === 0) return null;

  return (
    <section className="mt-7 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-[0.6rem] font-bold tracking-[0.25em]" style={{ color: ICE }}>
        WHAT THIS MEANS IN A RENDER
      </p>
      <div className="mt-3 space-y-3">
        {lines.map((line) => (
          <p key={line} className="text-sm leading-relaxed text-neutral-300">
            {line}
          </p>
        ))}
      </div>
      {/* E11/S5: this block names a flaw in the reader's own work and, until
          now, offered nowhere to go with it. One family is measured per
          session here; the reference covers all three. */}
      <Jump href={FLAWS_HREF} accent={ICE} className="mt-2">
        {FLAWS_INVITE}
      </Jump>
    </section>
  );
}

/**
 * THE LADDER, drawn.
 *
 * Every rung the pipeline can render, in difficulty order, with how many trials
 * landed on each and how many of those were right. The two band edges are
 * marked. This is the evidence behind the headline, on the same screen as the
 * headline — the alternative is a number with a "trust us" attached.
 *
 * Rungs the session never visited are drawn faint rather than hidden: the shape
 * of where a staircase spent its time IS the measurement, and hiding the unused
 * ends would make every session look thorough.
 */
function Ladder({ result, unit }: { result: StaircaseResult; unit: string }) {
  const { rungs, heardIndex, missedIndex } = result.band;
  const busiest = Math.max(1, ...rungs.map((r) => r.shown));

  return (
    <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-[0.6rem] font-bold tracking-[0.25em] text-muted">
        THE LADDER · GENTLEST FIRST · {unit.toUpperCase()}
      </p>
      <ul className="mt-3 flex flex-col gap-1.5">
        {rungs.map((rung, i) => {
          const isHeard = i === heardIndex;
          const isMissed = i === missedIndex;
          const inBand =
            missedIndex !== null && heardIndex !== null && i > missedIndex && i < heardIndex;
          const share = rung.shown / busiest;
          return (
            <li key={rung.label} className="flex items-center gap-2.5 text-xs">
              <span
                className="w-16 shrink-0 text-right font-mono tabular-nums"
                style={{ color: isHeard || isMissed ? ICE : rung.shown ? undefined : "rgba(255,255,255,0.3)" }}
              >
                {quantity(rung.label, result.unit).replace(` ${unit}`, "")}
              </span>
              <span className="relative h-3 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                <span
                  className="absolute inset-y-0 left-0 rounded-full transition-all"
                  style={{
                    width: `${Math.max(rung.shown ? 4 : 0, share * 100)}%`,
                    background: isHeard || isMissed ? ICE : inBand ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.16)",
                  }}
                />
              </span>
              <span className="w-16 shrink-0 font-mono tabular-nums text-muted">
                {rung.shown ? `${rung.correct}/${rung.shown}` : "—"}
              </span>
              <span className="w-14 shrink-0 text-[0.6rem] font-bold tracking-wider" style={{ color: ICE }}>
                {isHeard ? "CAUGHT" : isMissed ? "GUESSED" : ""}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-[0.65rem] leading-relaxed text-muted">
        Right / shown, per rung. A staircase spends most of its trials near your limit, so the busy
        rows are where the answer is and the faint ones are rungs you were never asked about.{" "}
        {/*
          THE MARKED ROWS ARE NOT CONCLUSIONS FROM THE ROW BESIDE THEM. In the
          first render the 160 kbps row read "0/1  GUESSED", which invites a
          reader to think one trial decided it. The two marks come from the fit
          over the WHOLE session; a boundary row can legitimately hold a single
          trial. Saying so is cheaper than moving the labels somewhere less
          scannable.
        */}
        <span className="text-neutral-300">
          The two marked rungs come from the whole session, not from the count beside them — a
          boundary row can hold a single trial and still be the boundary.
        </span>
      </p>
    </div>
  );
}
