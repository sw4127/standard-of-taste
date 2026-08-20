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
import { familyLabel, quantity, resultLines, shortUnit } from "@/content/staircase/copy";
import type { StaircaseResult } from "@/engine/staircase-session";

const ICE = "hsl(190 75% 62%)";
const FLUID = ["hsl(195 45% 40%)", "hsl(210 40% 36%)", "hsl(180 40% 38%)", "hsl(225 35% 34%)"];
const BASE = "#07090B";
const BRAND = "rgba(244,245,248,0.72)";

export default function ThresholdResult({ result }: { result: StaircaseResult }) {
  const lines = resultLines(result);
  const [headline, ...rest] = lines;
  const unit = shortUnit(result.unit);

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col overflow-hidden px-6 py-10">
      <FluidField colors={FLUID} baseColor={BASE} intensity={0.6} scrim={false} vignette />
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

        <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight">
          {headline}
        </h1>

        <Ladder result={result} unit={unit} />

        <div className="mt-8 space-y-4">
          {rest.map((line) => (
            <p key={line} className="text-sm leading-relaxed text-muted">
              {line}
            </p>
          ))}
        </div>

        <div className="mt-9 flex flex-col gap-2.5 text-sm">
          <Link href="/lab/instrument-limits" className="group text-muted transition-colors hover:text-white">
            <span className="font-semibold transition-colors" style={{ color: ICE }}>
              What this instrument cannot do.
            </span>{" "}
            Every limit we measured and could not fix.
          </Link>
          <Link href="/" className="group text-muted transition-colors hover:text-white">
            <span className="font-semibold transition-colors" style={{ color: ICE }}>
              The gym.
            </span>{" "}
            The other machines.
          </Link>
        </div>
      </div>
    </main>
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
