"use client";

/**
 * THE GYM'S THIRD MACHINE — an adaptive staircase, one family per session
 * (E5/S6, PM ruling RT-59a).
 *
 * WHAT IT DOES THAT THE OTHER TWO DO NOT. The Prestige Test and the Delicacy
 * Trials ask a fixed set of questions and report how many you got. This one
 * chooses each question from how the last ones went, walks down until you start
 * missing, and reports the PHYSICAL SIZE of the smallest flaw you can still
 * catch — cents of detune, milliseconds of drift, kilobits per second. That is
 * the deliverable of record (CLAUDE.md, D4 amendment): not a score.
 *
 * EVERY NUMBER ON THIS SCREEN COMES FROM `src/engine/staircase-session.ts`.
 * The component owns beats, audio and taps; it owns no arithmetic. It never
 * picks a window, never picks a level, never decides which side is damaged, and
 * never formats a threshold — those are `sessionInstances`, the staircase,
 * `degradedSideFor` and `src/content/staircase/copy.ts` respectively. A UI that
 * did any of them would be a second copy of a rule (E5/S1's whole subject).
 *
 * THE MIN-LISTEN GATE IS THE SAME ONE THE DELICACY TRIALS USE, for the same
 * reason: exposure has to be comparable across trials or the responses are not
 * comparable either. Same-moment A/B unlocks after it, per RT-34b.
 */

import { useCallback, useRef, useState } from "react";
import FluidField from "@/components/FluidField";
import ClipPlayer from "@/app/bias/ClipPlayer";
import AbCompare from "@/app/delicacy/AbCompare";
import { track } from "@/lib/analytics";
import {
  answer,
  isCorrectPick,
  isFinished,
  nextTrial,
  sessionMinutes,
  sessionResult,
  startSession,
  MIN_LISTEN_MS_PER_CLIP,
  type StaircaseSession,
} from "@/engine/staircase-session";
import { isSourceLocked } from "@/engine/staircase-pool";
import { FAMILY_BLURB, familyLabel } from "@/content/staircase/copy";
import ThresholdResult from "./ThresholdResult";

const ICE = "hsl(190 75% 62%)";
const ICE_GLOW = "hsl(190 80% 60% / 0.4)";
const FLUID = ["hsl(195 45% 40%)", "hsl(210 40% 36%)", "hsl(180 40% 38%)", "hsl(225 35% 34%)"];
const BASE = "#07090B";
const BRAND = "rgba(244,245,248,0.72)";

type Phase = "frame" | "trial" | "done";

/**
 * A seed the session can be replayed from — a single integer that survives a
 * share URL.
 *
 * IT IS CHOSEN IN THE CLICK HANDLER, and that is a bug fix rather than a style.
 * The first version seeded with `Date.now()` in a `useState` initialiser; Next
 * server-renders client components, so the server picked one seed and the
 * browser picked another and React threw a hydration mismatch into the console
 * on every load. Worse than the warning: the two seeds pick different
 * recordings, so the markup being replaced described a DIFFERENT session from
 * the one the user then took. Found by reading the rendered page's console.
 *
 * A `useEffect` would also have fixed it and was written first; it is a
 * cascading render for no reason. Nothing before the tap needs a seed, so
 * nothing before the tap gets one — which is why the frame no longer names the
 * recording and the trial header does instead.
 */
function newSeed(): number {
  return Math.floor(Date.now() % 2147483647);
}

export default function ThresholdFlow({ family }: { family: string }) {
  const [phase, setPhase] = useState<Phase>("frame");
  const [session, setSession] = useState<StaircaseSession | null>(null);
  const [armedA, setArmedA] = useState(false);
  const [armedB, setArmedB] = useState(false);
  const switches = useRef(0);

  // `nextTrial` is idempotent by construction (E5/S2), so calling it on every
  // render is safe — the visit counter only moves when an answer is recorded.
  const trial = session && !isFinished(session) ? nextTrial(session) : null;

  const pick = useCallback(
    (side: "a" | "b") => {
      if (!trial || !session) return;
      const correct = isCorrectPick(trial, side);
      const next = answer(session, correct);
      setSession(next);
      setArmedA(false);
      setArmedB(false);
      switches.current = 0;
      if (isFinished(next)) {
        const result = sessionResult(next);
        track("threshold_complete", {
          family,
          sourceId: result.sourceId ?? null,
          kind: result.kind,
          trials: result.trials,
        });
        setPhase("done");
      }
    },
    [family, session, trial],
  );

  const armed = armedA && armedB;

  /* ---------------------------------------------------------------- frame */
  if (phase === "frame") {
    return (
      <main className={SHELL + " justify-center"}>
        <FluidField colors={FLUID} baseColor={BASE} intensity={0.6} scrim={false} vignette />
        <div className="relative z-10">
          <p className="text-xs font-bold tracking-[0.4em]" style={{ color: BRAND }}>
            THE TASTE GYM
          </p>
          <h1 className="mt-6 font-display text-4xl font-semibold leading-tight">
            How small a flaw can you still hear?
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted">
            Every pair is the same twenty seconds of music twice, and one of them has been damaged —{" "}
            {FAMILY_BLURB[family]}. Pick the damaged one. Get it right twice and the damage gets{" "}
            <span className="text-foreground">smaller</span>; get it wrong and it gets bigger again.
          </p>
          <p className="mt-3 text-base leading-relaxed text-muted">
            The test walks down until it finds the size where you stop being sure. That size is your
            answer, and it is a real physical quantity — not a score out of ten.
          </p>
          {isSourceLocked(family) ? (
            <p className="mt-3 text-sm text-muted">
              This session locks to a single recording, named at the top of every trial and on your
              result. A bitrate does different damage to different music, so the number means nothing
              without the material it was measured on.
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => {
              const seed = newSeed();
              const started = startSession(family, seed);
              setSession(started);
              track("threshold_start", { family, sourceId: started.sourceId ?? null });
              setPhase("trial");
            }}
            className="mt-8 self-start rounded-full px-7 py-3.5 text-base font-bold text-black transition active:scale-[0.98]"
            style={{ background: ICE, boxShadow: `0 10px 30px ${ICE_GLOW}` }}
          >
            Start
          </button>
          <p className="mt-4 text-xs text-muted">
~{sessionMinutes(family)} minutes. No sign-up. Headphones strongly advised —
            laptop speakers cannot reproduce most of what this measures.
          </p>
        </div>
      </main>
    );
  }

  /* ---------------------------------------------------------------- done */
  if (session && (phase === "done" || !trial)) {
    return <ThresholdResult result={sessionResult(session)} />;
  }
  if (!trial || !session) return null;

  /* --------------------------------------------------------------- trial */
  return (
    <main className={SHELL}>
      <FluidField colors={FLUID} baseColor={BASE} intensity={0.6} scrim={false} vignette />
      <div className="relative z-10 flex flex-1 flex-col">
        <div className="flex items-center justify-between text-xs font-medium text-muted">
          <span className="tracking-[0.3em]">
            {familyLabel(family).toUpperCase()}
            {session.sourceId ? ` · ${session.sourceId}` : ""}
          </span>
          {/*
            THE TRIAL COUNT HAS NO DENOMINATOR ON PURPOSE. The session ends on
            reversals, not on a fixed number of questions, so "12 of 40" would
            be a number we do not have. Showing a made-up total to feel tidy is
            the sort of small lie N3 exists to stop.
          */}
          <span>trial {trial.trialNumber}</span>
        </div>

        <p className="mt-6 text-sm text-muted">
          One of these two has {FAMILY_BLURB[family]}. The other is untouched.
        </p>

        <ClipPlayer
          key={`${trial.trialNumber}-a`}
          src={trial.srcA}
          index={trial.trialNumber}
          label="A"
          caption="tap to listen"
          minListenMs={MIN_LISTEN_MS_PER_CLIP}
          onArmed={() => setArmedA(true)}
          onProgress={() => {}}
        />
        <ClipPlayer
          key={`${trial.trialNumber}-b`}
          src={trial.srcB}
          index={trial.trialNumber}
          label="B"
          caption="tap to listen"
          minListenMs={MIN_LISTEN_MS_PER_CLIP}
          onArmed={() => setArmedB(true)}
          onProgress={() => {}}
        />
        {armed ? (
          <AbCompare
            key={`${trial.trialNumber}-cmp`}
            srcA={trial.srcA}
            srcB={trial.srcB}
            onSwitch={(n) => {
              switches.current = n;
            }}
          />
        ) : null}

        <div className="mt-7">
          <p className="text-sm font-semibold">
            {armed ? "Which one is damaged?" : "Hear both all the way through first."}
          </p>
          <div className="mt-3 flex gap-3">
            {(["a", "b"] as const).map((side) => (
              <button
                key={side}
                type="button"
                disabled={!armed}
                onClick={() => pick(side)}
                aria-label={`${side.toUpperCase()} is the damaged one`}
                className="flex-1 rounded-2xl border border-white/15 py-4 text-base font-bold transition hover:border-white/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-35"
              >
                {side.toUpperCase()}
              </button>
            ))}
          </div>
          {/*
            The level is shown AFTER the pick is possible but never before it is
            answered — a listener who knows the trial is at 3.1 cents will hear
            3.1 cents. It is disclosed on the result screen instead.
          */}
          <p className="mt-4 text-xs text-muted">
            No feedback until the end — being told would teach you the clip rather than the flaw.
          </p>
        </div>
      </div>
    </main>
  );
}

const SHELL = "relative mx-auto flex min-h-dvh w-full max-w-lg flex-col overflow-hidden px-6 py-10";

