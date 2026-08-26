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

import { sessionInstances } from "@/engine/trial-instances";
import Jump from "@/components/Jump";
import { readableOn } from "@/lib/readable-on";
import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { THRESHOLD_VIOLET, THRESHOLD_VIOLET_GLOW, THRESHOLD_FIELD, THRESHOLD_BASE } from "@/content/instrument-accents";
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
import {
  FAMILY_BLURB,
  familyLabel,
  cooldownTitle,
  cooldownBody,
  COOLDOWN_ALTERNATIVE,
  SNACK_LEAD,
  SNACK_LINE,
  SNACK_CTA,
} from "@/content/staircase/copy";
import {
  cooldownDaysLeft,
  recordCompletion,
  serverSnapshot,
  subscribeCooldown,
} from "@/lib/retest-cooldown";
import { recordResult } from "@/lib/result-store";
import { POOL_VERSIONS } from "@/lib/result-recall";
import ThresholdResult from "./ThresholdResult";
import { SLUG_BY_FAMILY } from "./families";

const ICE = THRESHOLD_VIOLET;
const ICE_GLOW = THRESHOLD_VIOLET_GLOW;
const FLUID = THRESHOLD_FIELD;
const BASE = THRESHOLD_BASE;
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
  /**
   * THE ANSWERS, AS THE SHARE PAYLOAD (E6/S16).
   *
   * The result screen shares a REPLAY LINK, not a number: `?s=<seed>&r=<0s and
   * 1s>`. That is the same design as /bias/result and the delicacy card — the
   * receiving page recomputes the threshold from the responses, so there is no
   * field anyone could edit to claim a threshold they did not measure.
   *
   * It is kept here rather than derived from the session because the session
   * holds the staircase's STATE, not its history; reconstructing the answer
   * string from state afterwards would be a second implementation of the replay
   * format, and the two would drift.
   */
  const [answers, setAnswers] = useState("");
  const [armedA, setArmedA] = useState(false);
  const [armedB, setArmedB] = useState(false);
  /**
   * Same-moment A/B switches. `switches` counts the CURRENT trial; the banked
   * per-trial series is what reaches the data (D6) — see the note in `pick`.
   */
  const switches = useRef(0);
  const switchesPerTrial = useRef<number[]>([]);

  /**
   * THE RETEST GATE (RT-89a).
   *
   * `localStorage` does not exist on the server, and this component IS server
   * rendered — the same fact that made `newSeed` a click-handler concern above.
   * Reading it during render gives the server one answer and the browser
   * another, which is a hydration mismatch; here it would also mean the server
   * shipping markup that offers a session the browser is about to refuse.
   *
   * `useSyncExternalStore` AND NOT A `useEffect`. The effect version was written
   * first and eslint's `react-hooks/set-state-in-effect` rejected it, correctly
   * and on the same grounds this file already gives for `newSeed`: it is a
   * cascading render. This hook exists precisely to read an external store with
   * a separate server answer, so it says what is meant instead of simulating it.
   *
   * The snapshot is one number: -1 not known, 0 ready, >0 days remaining. The
   * Start button waits for a real answer rather than rendering optimistically
   * and snatching it back.
   */
  const daysLeft = useSyncExternalStore(
    subscribeCooldown,
    () => cooldownDaysLeft(family),
    serverSnapshot,
  );
  const cooldownKnown = daysLeft >= 0;
  const blocked = daysLeft > 0;

  // `nextTrial` is idempotent by construction (E5/S2), so calling it on every
  // render is safe — the visit counter only moves when an answer is recorded.
  const trial = session && !isFinished(session) ? nextTrial(session) : null;

  const pick = useCallback(
    (side: "a" | "b") => {
      if (!trial || !session) return;
      const correct = isCorrectPick(trial, side);
      const next = answer(session, correct);
      setSession(next);
      /*
       * COMPUTED ONCE, USED TWICE (E8/S7). This was `setAnswers((a) => a + …)`,
       * which is fine on its own — but the completion branch below also needs
       * the finished string, and rebuilding it there left the replay payload
       * expressed in two places, one line apart, free to drift. State is queued
       * rather than applied, so the branch cannot simply read `answers`: it
       * would store a session missing its final trial, which replays to a
       * different threshold than the one on screen.
       */
      const nextAnswers = answers + (correct ? "1" : "0");
      setAnswers(nextAnswers);
      setArmedA(false);
      setArmedB(false);
      // BANKED, then reset (E7/S14). This used to reset straight to zero, so
      // the count of A/B switches was collected on every trial and thrown away
      // on every trial — by completion the ref held the last trial's number and
      // nothing had ever read it. Kept per trial rather than summed: a listener
      // who switched fifteen times on one pair and once on the rest is a
      // different observation from one who switched twice throughout, and a
      // total cannot tell them apart.
      switchesPerTrial.current.push(switches.current);
      switches.current = 0;
      if (isFinished(next)) {
        const result = sessionResult(next);
        // Stamped on COMPLETION, never on start: a session abandoned at trial
        // three measured nothing, and charging someone a week for it would be
        // the gate punishing them instead of protecting the number.
        recordCompletion(family, Date.now());
        // Same moment, same reason: only a FINISHED session is worth recalling.
        // Raw answers, never the computed threshold — see result-store.ts.
        recordResult(
          "threshold",
          POOL_VERSIONS.threshold,
          {
            kind: "threshold",
            slug: SLUG_BY_FAMILY[family],
            seed: session.seed,
            answers: nextAnswers,
            sourceId: session.sourceId,
          },
          Date.now(),
        );
        track("threshold_complete", {
          family,
          sourceId: result.sourceId ?? null,
          kind: result.kind,
          trials: result.trials,
          // How hard this listener actually worked at each comparison. Same
          // shape as delicacy's listen_a/listen_b: one figure per trial, in
          // trial order, so it lines up with `answers`.
          switches: switchesPerTrial.current.join(","),
        });
        setPhase("done");
      }
    },
    // `answers` joined this list in E8/S7, and eslint caught its absence rather
    // than me: reading state directly inside the callback without depending on
    // it pins the closure to whatever the string was when `pick` was last
    // rebuilt, so the stored payload would have been truncated to a stale
    // prefix — a session that replays to the wrong threshold. The functional
    // updater it replaced did not need the dependency; the direct read does.
    [answers, family, session, trial],
  );

  const armed = armedA && armedB;

  /* --------------------------------------------------------- frame, gated */
  /**
   * A BLOCKED FRAME IS A DIFFERENT SCREEN, NOT THE SAME SCREEN WITH A NOTICE.
   *
   * The first version kept the pitch — headline, both explanatory paragraphs —
   * and appended the refusal in a card below. Measured on the rendered page,
   * that left a 36px `h1` asking "How small a flaw can you still hear?" as the
   * focal point of a screen whose entire message was "not this week", with the
   * actual message at 18px inside a box. One focal point per screen is the
   * Design Quality Bar's first line, and that had two, of which the loud one
   * was wrong.
   *
   * The explanation of how the staircase works is written for someone about to
   * start. Someone being turned away does not need it.
   */
  if (phase === "frame" && blocked) {
    return (
      <main className={SHELL + " justify-center"}>
        <FluidField colors={FLUID} baseColor={BASE} intensity={0.6} scrim={false} vignette />
        <div className="relative z-10">
          <p className="text-xs font-bold tracking-[0.4em]" style={{ color: BRAND }}>
            THE TASTE GYM
          </p>
          <h1 className="mt-6 font-display text-4xl font-semibold leading-tight">
            {cooldownTitle(family)}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted">{cooldownBody(daysLeft)}</p>
          <Link
            href="/threshold"
            className="mt-8 inline-flex min-h-[44px] items-center self-start rounded-full px-7 py-3.5 text-base font-bold transition active:scale-[0.98]"
            style={{ color: readableOn(ICE), background: ICE, boxShadow: `0 10px 30px ${ICE_GLOW}` }}
          >
            {COOLDOWN_ALTERNATIVE}
          </Link>

          {/* THE SNACK, IN THE GAP THE GATE CREATES (PM direction 2026-08-22).
              A person told to come back in seven days has time and nothing to
              do with it. This is the one place in the product where a lighter,
              parallel thing is genuinely useful rather than an upsell — and it
              is quieter than the CTA above on purpose: the instrument is still
              the point. */}
          <div className="mt-10 border-t border-white/10 pt-6">
            <p className="text-sm font-semibold">{SNACK_LEAD}</p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{SNACK_LINE}</p>
            <Jump
              href="/music/quiz?ref=cooldown"
              className="mt-4"
              style={{ color: BRAND }}
            >
              {SNACK_CTA} &rarr;
            </Jump>
          </div>
        </div>
      </main>
    );
  }

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
            disabled={!cooldownKnown}
            onClick={() => {
              const seed = newSeed();
              const started = startSession(family, seed);
              setSession(started);
              track("threshold_start", { family, sourceId: started.sourceId ?? null });
              setPhase("trial");
            }}
            className="mt-8 self-start rounded-full px-7 py-3.5 text-base font-bold transition active:scale-[0.98] disabled:opacity-40"
            style={{ color: readableOn(ICE), background: ICE, boxShadow: `0 10px 30px ${ICE_GLOW}` }}
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
    return (
      <ThresholdResult
        result={sessionResult(session)}
        share={{ slug: SLUG_BY_FAMILY[family], seed: session.seed, answers, sourceId: session.sourceId }}
      />
    );
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
            accent={ICE}
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

