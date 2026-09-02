"use client";

/**
 * Prestige-Bias Test flow (memo D2 Instrument 1 · D3 flagship · D5 narration).
 *
 * Five beats: Hume frame → blind pass → bridge → labeled pass → reveal →
 * MANDATORY debrief (memo §3 — the swapped labels are disclosed before the
 * user leaves; there is no path around it). All numbers come from
 * src/engine/bias (deterministic; §6 principle) — nothing here classifies.
 *
 * Placeholder audio: while the pool is placeholder (PM authors real PD/CC
 * clips per §8.2), clips synthesize a WebAudio triad per index — clearly
 * badged, zero asset files. Real clips will render an <audio> element on the
 * same seam (ClipPlayer).
 */

import Jump from "@/components/Jump";
import OtherMachines from "@/components/OtherMachines";
import { readableOn } from "@/lib/readable-on";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import FluidField from "@/components/FluidField";
import { track } from "@/lib/analytics";
import {
  computeBiasResult,
  encodeBiasRatings,
  BIAS_SCALE_MAX,
  type BiasRatings,
  type BiasResult,
} from "@/engine/bias";
import { BIAS_CLIPS, BIAS_INSTRUMENT_ID, BIAS_POOL_VERSION, type BiasClip } from "@/content/bias/items";
import { DELICACY_LIVE } from "@/content/delicacy/items";
import { VERDICT_COPY, shareText } from "@/content/bias/copy";
import { creatorLines as biasCreatorLines } from "@/content/vocabulary/bias";
import ComparisonReading from "@/components/ComparisonReading";
import AcrossSessions from "@/components/AcrossSessions";
import ExpertPanel from "@/components/ExpertPanel";
import { recordResult } from "@/lib/result-store";
import { POOL_VERSIONS } from "@/lib/result-recall";
import ShareButton from "@/app/result/ShareButton";
import DownloadButton from "@/app/result/DownloadButton";
import ClipPlayer, { isPlaceholderSrc } from "./ClipPlayer";
import { PRESTIGE_GOLD, PRESTIGE_GOLD_SOFT, PRESTIGE_GOLD_GLOW, PRESTIGE_FIELD, PRESTIGE_PALETTE } from "@/content/instrument-accents";

/* One accent in play (design bar): prestige gold. */
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
const GOLD_DIM = "hsl(42 45% 50%)";
const GOLD_TINT = PRESTIGE_GOLD_SOFT;
const GOLD_GLOW = PRESTIGE_GOLD_GLOW;
const FLUID = PRESTIGE_FIELD;

const RATE_BEAT_MS = 420;

/**
 * RECALL DEFENCES (PM ruling RT-38b, after user testing 2026-08-08).
 *
 * The report was blunt and correct: "the prestige test now feels like a test of
 * only short-term memory." It was. Sixteen clips rated blind, then the SAME sixteen in
 * the SAME order asked the SAME question — a careful person simply reproduces
 * their first answer, and the instrument measures recall rather than the pull
 * of a famous name. The engine already conceded this direction ("re-rating
 * anchors people on their first answer, so measured sway UNDERSTATES the true
 * effect") but understated how bad it is: for a deliberate respondent the
 * number can collapse toward zero, which is why the test felt pointless.
 *
 * Two defences, and they attack DIFFERENT KINDS of recall.
 *
 * (1) POSITIONAL recall — "this is the third clip again, I said 7". The labeled
 *     pass is rotated by half the pool, so a clip never appears in the position
 *     it held before and the running order carries no information about what
 *     you already answered.
 *
 *     A CORRECTION TO AN EARLIER CLAIM, kept because getting this wrong once is
 *     instructive: rotating does NOT increase the elapsed distance between a
 *     clip's two ratings. With two sequential passes that distance is already
 *     uniformly n — clip i is rated at trial i and again at trial n+i. Rotating
 *     makes it UNEVEN (5 to 15 trials here) and therefore shorter for half the
 *     pool. It buys unpredictability, not time. The only levers for real time
 *     are more clips or an interference task between the passes, and neither is
 *     in this change.
 *
 * (2) NUMERIC recall — reproducing the digit itself. The blind pass asks how
 *     good the recording is; the labeled pass asks how much you want to hear
 *     the rest of it. There is no longer a remembered number that answers the
 *     question in front of you. This is the defence doing most of the work.
 *
 * WHY (2) DOES NOT BREAK THE SCORE, and where it strains. Differencing two
 * passes assumes they measure the same thing on the same scale. Changing the
 * framing introduces a shift — but a shift applied to EVERY item, which is
 * exactly what the control items exist to measure: they are rated in both
 * passes and labeled in neither, so their drift now absorbs the framing change
 * along with memory and regression, and the engine's RT-2a residual correction
 * removes what survives the up/down balance.
 *
 * THE HONEST COST: this makes the controls more load-bearing than they were,
 * and there are only two of them. If the framing change alters how people USE
 * the scale (its spread, not just its centre) rather than merely shifting it,
 * two controls cannot capture that and the correction will be incomplete. That
 * is a real limitation of this design and it is the first thing to check when
 * real responses arrive.
 */
const PASS_QUESTION = {
  blind: {
    prompt: "How good is this recording?",
    low: "0 — never again",
    high: "10 — all-timer",
  },
  labeled: {
    prompt: "Knowing what it is — how much do you want to hear the rest?",
    low: "0 — not at all",
    high: "10 — right now",
  },
} as const;

/**
 * Presentation order for the labeled pass: rotated by half the pool. Ratings
 * are keyed by clip id, so the engine, the canonical hash and the share codec
 * are all unaffected by what order a respondent happened to see.
 */
/**
 * SESSION PERSISTENCE (RT-40a enabler, 2026-08-08).
 *
 * The blind pass lives in React state, so navigating away — or a stray refresh
 * — used to destroy a completed pass silently. That was already a latent bug;
 * it becomes a blocker the moment the bridge offers somewhere to go. Ratings
 * are keyed by clip id and the pool version rides along, so a restore against a
 * changed pool is refused rather than silently rescored.
 *
 * sessionStorage, not localStorage: this is one sitting, not a saved profile.
 * It clears with the tab, which is the right lifetime for an unfinished test.
 */
const SESSION_KEY = "bias-session-v1";

type Saved = {
  poolVersion: number;
  blind: BiasRatings;
  listen: { blind: Record<string, number>; labeled: Record<string, number> };
};

function saveSession(blind: BiasRatings, listen: Saved["listen"]) {
  try {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ poolVersion: BIAS_POOL_VERSION, blind, listen } satisfies Saved),
    );
  } catch {
    // Private browsing or a full quota — the flow still works, it just cannot
    // survive a departure. Never break the test to save the test.
  }
}

function loadSession(): Saved | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Saved;
    // A pool change makes stored ratings uninterpretable — positional payloads
    // and item ids both move. Refuse rather than restore something wrong.
    if (parsed.poolVersion !== BIAS_POOL_VERSION) return null;
    if (!parsed.blind || Object.keys(parsed.blind).length !== BIAS_CLIPS.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

const LABELED_ORDER = BIAS_CLIPS.map(
  (_, i, arr) => arr[(i + Math.floor(arr.length / 2)) % arr.length],
);

type Phase = "frame" | "blind" | "bridge" | "labeled" | "reveal" | "debrief";

export default function BiasFlow() {
  const [phase, setPhase] = useState<Phase>("frame");
  const [idx, setIdx] = useState(0);
  const [blind, setBlind] = useState<BiasRatings>({});
  const [labeled, setLabeled] = useState<BiasRatings>({});
  const [played, setPlayed] = useState(false); // current clip+pass is ARMED (min-listen met, RT-2b)
  const [picked, setPicked] = useState<number | null>(null); // beat-lock visual
  const [result, setResult] = useState<BiasResult | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // D6/RT-5: per-item heard milliseconds, both passes, captured at rate time.
  const listenMs = useRef<{ blind: Record<string, number>; labeled: Record<string, number> }>({
    blind: {},
    labeled: {},
  });

  const pass = phase === "blind" ? "blind" : "labeled";
  const clip: BiasClip | undefined = (pass === "blind" ? BIAS_CLIPS : LABELED_ORDER)[idx];
  const total = BIAS_CLIPS.length;
  const question = PASS_QUESTION[pass];

  // Restore a blind pass abandoned by navigation or a refresh.
  //
  // Deferred rather than set synchronously in the effect: setting state during
  // the effect body cascades an extra render pass, and the restore cannot be a
  // lazy state initializer either — this component server-renders, and reading
  // sessionStorage during render would hydrate to a different phase than the
  // server produced. A microtask lands after paint, so the frame screen shows
  // for an instant and is replaced, which reads as the session being found.
  useEffect(() => {
    const saved = loadSession();
    if (!saved) return;
    queueMicrotask(() => {
      setBlind(saved.blind);
      listenMs.current = saved.listen;
      setIdx(0);
      setPhase("bridge");
      track("bias_session_restored", {});
    });
  }, []);

  useEffect(() => {
    track("bias_frame_view", {});
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function rate(value: number) {
    if (!clip || !played || picked !== null) return;
    setPicked(value);
    const nextRatings = pass === "blind" ? { ...blind, [clip.id]: value } : { ...labeled, [clip.id]: value };
    if (pass === "blind") setBlind(nextRatings);
    else setLabeled(nextRatings);

    timer.current = setTimeout(() => {
      setPicked(null);
      setPlayed(false);
      if (idx < total - 1) {
        setIdx(idx + 1);
        return;
      }
      if (pass === "blind") {
        track("bias_blind_complete", {});
        saveSession(nextRatings, listenMs.current);
        setIdx(0);
        setPhase("bridge");
        return;
      }
      // Labeled pass done → compute the verdict (deterministic, in code).
      const r = computeBiasResult(BIAS_INSTRUMENT_ID, BIAS_CLIPS, blind, nextRatings);
      setResult(r);
      // Both raw passes, never the verdict — see result-store.ts (E8/S7).
      recordResult(
        "bias",
        POOL_VERSIONS.bias,
        {
          kind: "bias",
          blind: encodeBiasRatings(BIAS_CLIPS, blind),
          labeled: encodeBiasRatings(BIAS_CLIPS, nextRatings),
        },
        Date.now(),
      );
      track("bias_labeled_complete", { pct: r.pct, verdict: r.verdict });
      try {
        sessionStorage.removeItem(SESSION_KEY);
      } catch {
        /* nothing to clean up if storage was never available */
      }
      // D6 interim dataset (PM-approved): the anonymized response vector goes
      // to the analytics sink until the §8.1 store exists. No PII — ratings,
      // hash, pool version only.
      track("bias_result", {
        pool: BIAS_INSTRUMENT_ID,
        poolVersion: BIAS_POOL_VERSION,
        hash: r.hash,
        blind: BIAS_CLIPS.map((c) => blind[c.id]).join(","),
        labeled: BIAS_CLIPS.map((c) => nextRatings[c.id]).join(","),
        listen_b: BIAS_CLIPS.map((c) => listenMs.current.blind[c.id] ?? 0).join(","),
        listen_l: BIAS_CLIPS.map((c) => listenMs.current.labeled[c.id] ?? 0).join(","),
        pct: r.pct,
        rawPct: r.rawPct,
        controlDrift: r.controlDriftPts,
        swappedPct: r.swappedPct,
        swayShare: r.swayShare,
        edges: r.edgeCount,
        verdict: r.verdict,
      });
      setPhase("reveal");
    }, RATE_BEAT_MS);
  }

  const shell = "relative mx-auto flex min-h-dvh w-full max-w-lg flex-col overflow-hidden px-6 py-10";
  const kicker = (
    <p className="text-xs font-bold tracking-[0.4em]" style={{ color: BRAND }}>
      THE TASTE GYM
    </p>
  );

  /* ---------------------------------------------------------------- frame */
  if (phase === "frame") {
    return (
      <main className={`${shell} justify-center`}>
        <FluidField colors={FLUID} intensity={0.6} scrim={false} vignette />
        <div className="relative z-10">
          {kicker}
          <h1 className="mt-6 font-display text-4xl font-semibold leading-tight">
            Do you hear the music — or the name on it?
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted">
            In 1757, David Hume pointed out that reputation gets to a judgment before the ears do —
            a famous name can make a mediocre thing sound profound. He called it prejudice.
          </p>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Sixteen clips. You rate them twice: once with nothing but your ears, once with the names and
            the acclaim attached. <span className="text-foreground">The gap is your number.</span>
          </p>
          <button
            type="button"
            onClick={() => {
              /*
               * A SESSION'S DATA BEGINS WHEN THE SESSION DOES (E10/S9).
               *
               * Same reasoning as the Threshold flow's start handler (E10/S3),
               * extended here because leaving two of three flows unprotected
               * was the same "guard watching part of the room" this session
               * keeps finding. Every accumulator below is initialised at MOUNT
               * and nothing resets it, which is correct only because this flow
               * is forward-only and a session can start once per mount. The day
               * a result screen grows a "start again" button, the second
               * session inherits the first one's ratings — and `blind` and
               * `labeled` ARE the measurement, so a stale pair reports a sway
               * the session did not measure (N3).
               *
               * `session-reset.test.ts` holds this block to the component's
               * state, so a new accumulator cannot be added without being
               * classified.
               */
              if (timer.current) clearTimeout(timer.current);
              setIdx(0);
              setBlind({});
              setLabeled({});
              setPlayed(false);
              setPicked(null);
              setResult(null);
              listenMs.current = { blind: {}, labeled: {} };
              track("bias_start", {});
              setPhase("blind");
            }}
            className="mt-8 self-start rounded-full px-7 py-3.5 text-base font-bold transition active:scale-[0.98]"
            style={{ color: readableOn(GOLD), background: GOLD, boxShadow: `0 10px 30px ${GOLD_GLOW}` }}
          >
            Start the blind pass
          </button>
          <p className="mt-4 text-xs text-muted">~8 minutes. No sign-up. Headphones help.</p>
          {/* THE CREDIBILITY CHECK (E7/S24). Only the Threshold frame offered
              one, so on the two instruments people actually start with there
              was no way to ask "should I trust this before I give it eight
              minutes" without leaving the product. */}
          <p className="mt-6 text-sm text-muted">
            <Jump href="/lab/instrument-health" accent={GOLD}>
              How this is measured.
            </Jump>{" "}
            Item behaviour, reliability, and what the numbers can carry.
          </p>

        </div>
      </main>
    );
  }

  /* --------------------------------------------------------------- bridge */
  /**
   * THE BRIDGE, offered as a treat (PM ruling RT-40a + brief, 2026-08-08).
   *
   * Two jobs at once. Rotating the labeled pass bought unpredictability but NOT
   * elapsed time — with two sequential passes a clip's two ratings are always n
   * trials apart, and the only levers for real time are more clips or something
   * between the passes. This is that something.
   *
   * The PM's brief is the design, and it is a constraint rather than a mood
   * note: "make it feel like a treat and lift their mood, like a candle at
   * dinner or a snack on a flight." So it is OFFERED, never required; it is
   * skippable in one tap with no penalty framing; and the copy does not mention
   * that it is doing the instrument a favour. A diversion a respondent resents
   * is worse than no diversion — it adds time and costs goodwill.
   *
   * The blind pass is saved to sessionStorage before anyone can leave, so the
   * detour cannot cost a completed pass.
   */
  if (phase === "bridge") {
    return (
      <main className={`${shell} justify-center`}>
        <FluidField colors={FLUID} intensity={0.68} scrim={false} vignette />
        <div className="relative z-10">
          {kicker}
          <h1 className="mt-6 font-display text-4xl font-semibold leading-tight">Round two.</h1>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Same sixteen clips — this time the names and the reputations come attached, and the question
            changes. A couple stay blank on purpose. Rate what you hear.
          </p>

          <div
            className="mt-7 rounded-2xl border p-5"
            style={{ borderColor: "hsl(42 60% 55% / 0.3)", background: "rgba(255,255,255,0.03)" }}
          >
            <p className="text-[0.65rem] font-bold tracking-[0.3em]" style={{ color: GOLD }}>
              WHILE YOU&rsquo;RE HERE
            </p>
            <p className="mt-2 text-sm leading-relaxed text-neutral-300">
              There&rsquo;s a shorter, sillier one next door — five taps on what you actually listen
              to, and it tells you which kind of listener you are. No scoring, no ears required.
              Your ten ratings are saved; come back whenever.
            </p>
            <Link
              href="/music/quiz"
              onClick={() => track("bias_bridge_diversion", {})}
              className="mt-4 inline-block rounded-full border px-5 py-2.5 text-sm font-bold transition hover:bg-white/[0.06]"
              style={{ borderColor: GOLD, color: GOLD }}
            >
              Take the five-tap one &rarr;
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setPhase("labeled")}
            className="mt-8 rounded-full px-7 py-3.5 text-base font-bold transition active:scale-[0.98]"
            style={{ color: readableOn(GOLD), background: GOLD, boxShadow: `0 10px 30px ${GOLD_GLOW}` }}
          >
            Start the labeled pass
          </button>
          <p className="mt-3 text-xs text-muted">Or carry straight on — nothing is lost either way.</p>
        </div>
      </main>
    );
  }

  /* ------------------------------------------------------- rating passes */
  if (phase === "blind" || phase === "labeled") {
    if (!clip) return null;
    // Two facts, two signals (PM ruling 2026-07-19): the caption carries the
    // arming state; the ring carries clip progress. Neither implies the other.
    const caption = isPlaceholderSrc(clip.audioSrc)
      ? "placeholder tone — real clips pending"
      : played
        ? "you can rate now — the clip plays on"
        : "tap to listen · rating unlocks at the notch";
    return (
      <main className={shell}>
        <FluidField colors={FLUID} intensity={0.6} scrim={false} vignette />
        <div className="relative z-10 flex flex-1 flex-col">
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-medium text-muted">
              <span className="tracking-[0.3em]">{pass === "blind" ? "BLIND PASS" : "LABELED PASS"}</span>
              <span>
                {idx + 1} / {total}
              </span>
            </div>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${(((pass === "labeled" ? total : 0) + idx + 1) / (total * 2)) * 100}%`,
                  background: GOLD,
                  boxShadow: `0 0 8px ${GOLD}`,
                }}
              />
            </div>
          </div>

          {pass === "blind" ? (
            <p className="text-sm text-muted">No names. No context. Just — how good is this?</p>
          ) : clip.isControl ? (
            // Control item (v1.1): no label exists for this clip, and saying
            // anything fancier would itself be a label. Neutral frame only.
            <div className="rounded-2xl border border-white/10 p-4" style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="text-[0.65rem] font-bold tracking-[0.3em] text-muted">NO LABEL ON THIS ONE</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                Nothing attached. Just — how good is this, on a second listen?
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border p-4" style={{ borderColor: "hsl(42 60% 55% / 0.35)", background: "rgba(255,255,255,0.03)" }}>
              <p className="text-[0.65rem] font-bold tracking-[0.3em] text-muted">THE LABEL SAYS</p>
              <p className="mt-1.5 font-display text-xl font-semibold" style={{ color: GOLD }}>
                {clip.shownArtist}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{clip.shownBlurb}</p>
            </div>
          )}

          {/* Player — key resets internal state per clip AND per pass. */}
          <ClipPlayer
            palette={PRESTIGE_PALETTE}
            key={`${pass}-${clip.id}`}
            src={clip.audioSrc}
            index={idx}
            caption={caption}
            onArmed={() => setPlayed(true)}
            onProgress={(ms) => {
              listenMs.current[pass][clip.id] = ms;
            }}
          />

          {/* The question is asked OUT LOUD, and it differs between passes so
              there is no remembered number that answers it (RT-38b). */}
          <p
            className={`mt-7 text-sm font-semibold transition-opacity duration-500 ${
              played ? "opacity-100" : "opacity-40"
            }`}
          >
            {question.prompt}
          </p>

          {/* 0–10 scale — unlock is a visible state change, not a fade-blink */}
          <div
            className={`mt-3 transition-all duration-500 ease-out ${
              played ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-1.5 opacity-35"
            }`}
          >
            <div className="grid grid-cols-6 gap-1.5">
              {Array.from({ length: BIAS_SCALE_MAX + 1 }, (_, v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => rate(v)}
                  aria-label={`Rate ${v}`}
                  className="h-12 rounded-xl border text-sm font-bold transition active:scale-95"
                  style={
                    picked === v
                      ? { borderColor: "transparent", background: GOLD_TINT, color: GOLD, boxShadow: `0 0 0 1.5px ${GOLD}, 0 8px 24px ${GOLD_GLOW}` }
                      : { borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.02)" }
                  }
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[0.65rem] text-muted">
              <span>{question.low}</span>
              <span>{question.high}</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* --------------------------------------------------------------- reveal */
  if (phase === "reveal" && result) {
    const v = VERDICT_COPY[result.verdict];
    return (
      <main className={`${shell} justify-center text-center`}>
        <FluidField colors={FLUID} intensity={0.78} scrim={false} vignette />
        <div className="relative z-10 flex flex-col items-center">
          <p className="text-xs font-bold tracking-[0.4em] text-muted">YOUR NUMBER</p>
          <p className="mt-4 font-display text-8xl font-semibold leading-none" style={{ color: GOLD, textShadow: `0 0 60px ${GOLD_GLOW}` }}>
            {result.pct > 0 ? "+" : ""}
            {result.pct}%
          </p>
          <p className="mt-3 text-sm text-muted">
            how far your ratings moved toward the labels
            {result.controlDriftPts !== null ? " — corrected for your own re-listen drift" : ""}
          </p>
          <h1 className="mt-8 font-display text-4xl font-semibold">{v.title}</h1>
          <p className="mt-2 max-w-sm text-base leading-relaxed text-muted">{v.sub}</p>
          {result.swayShare !== null ? (
            <p className="mt-5 rounded-full border border-white/10 px-4 py-1.5 text-sm text-muted">
              You moved with the label on{" "}
              <span className="font-semibold" style={{ color: GOLD }}>
                {result.movedCount} of {result.movableCount}
              </span>{" "}
              clips that could move.
            </p>
          ) : null}
          {biasCreatorLines(result).length > 0 ? (
            <section className="mt-7 w-full rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left">
              <p className="text-[0.65rem] font-bold tracking-[0.3em]" style={{ color: GOLD }}>
                WHAT THIS MEANS IN YOUR WORK
              </p>
              <div className="mt-3 flex flex-col gap-3">
                {biasCreatorLines(result).map((line) => (
                  <p key={line} className="text-sm leading-relaxed text-neutral-300">
                    {line}
                  </p>
                ))}
              </div>
            </section>
          ) : null}
          {/*
            Same omission, same reason, as the delicacy reveal (E8/S12): mounted
            on /bias/result in E8/S8 and missed on the screen a person actually
            finishes on. `own` is the pair of raw passes this session recorded.
          */}
          {/*
            Mounted here AND on /bias/result from the same component, so the
            E8/S12 omission cannot repeat: the creator block was written for the
            share page and missed on the screen people actually finish on.
          */}
          <ComparisonReading accent={GOLD} blind={blind} labeled={labeled} />
          <AcrossSessions
            accent={GOLD}
            own={{
              kind: "bias",
              blind: encodeBiasRatings(BIAS_CLIPS, blind),
              labeled: encodeBiasRatings(BIAS_CLIPS, labeled),
            }}
          />
          <ExpertPanel
            accent={GOLD}
            instrument={{ kind: "bias" }}
            own={{
              kind: "bias",
              blind: encodeBiasRatings(BIAS_CLIPS, blind),
              labeled: encodeBiasRatings(BIAS_CLIPS, labeled),
            }}
          />
          {result.edgeCount > 0 ? (
            <p className="mt-3 text-xs text-muted">
              {result.edgeCount} clip{result.edgeCount > 1 ? "s were" : " was"} already at the edge of the scale blind — your real sway may run higher.
            </p>
          ) : null}
          <p className="mt-6 text-xs text-muted">
            Provisional read — you&apos;re early. Percentiles arrive when the cohort does, not before.
          </p>
          <button
            type="button"
            onClick={() => {
              track("bias_debrief_view", {});
              setPhase("debrief");
            }}
            className="mt-8 rounded-full px-7 py-3.5 text-base font-bold transition active:scale-[0.98]"
            style={{ color: readableOn(GOLD), background: GOLD, boxShadow: `0 10px 30px ${GOLD_GLOW}` }}
          >
            One more thing — about those names
          </button>
        </div>
      </main>
    );
  }

  /* -------------------------------------------------------------- debrief */
  if (phase === "debrief" && result) {
    const swapped = BIAS_CLIPS.filter((c) => !c.labelIsTrue);
    const labeledCount = BIAS_CLIPS.filter((c) => !c.isControl).length;
    const receiptFor = (id: string) => result.receipts.find((r) => r.id === id);
    // Stateless permalink: raw passes in the URL; /bias/result recomputes.
    const b = encodeURIComponent(encodeBiasRatings(BIAS_CLIPS, blind));
    const l = encodeURIComponent(encodeBiasRatings(BIAS_CLIPS, labeled));
    const resultPath = `/bias/result?pv=${BIAS_POOL_VERSION}&b=${b}&l=${l}`;
    const origin = typeof window === "undefined" ? "" : window.location.origin;
    return (
      <main className={shell}>
        <FluidField colors={FLUID} intensity={0.55} scrim={false} vignette />
        <div className="relative z-10">
          {kicker}
          <h1 className="mt-6 font-display text-4xl font-semibold leading-tight">
            Some of those names were lies.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted">
            {`${swapped.length} of the ${labeledCount} labels were deliberately swapped — it's the only clean way to measure prestige, and you deserve to know which ones. Here's what your ratings did when the name in the room was false:`}
          </p>

          <div className="mt-6 flex flex-col gap-3">
            {swapped.map((c) => {
              const r = receiptFor(c.id);
              const clipNo = BIAS_CLIPS.findIndex((x) => x.id === c.id) + 1;
              return (
                <div key={c.id} className="rounded-2xl border p-4" style={{ borderColor: "hsl(42 60% 55% / 0.3)", background: "rgba(255,255,255,0.03)" }}>
                  <p className="text-[0.65rem] font-bold tracking-[0.3em] text-muted">CLIP {clipNo} — SWAPPED</p>
                  <p className="mt-1.5 text-sm leading-relaxed">
                    We said <span className="font-semibold" style={{ color: GOLD }}>{c.shownArtist}</span>.
                    {" "}It&apos;s actually <span className="font-semibold">{c.trueArtist}</span>.
                  </p>
                  {r ? (
                    <p className="mt-1 text-sm text-muted">
                      You went {r.blind} → {r.labeled}
                      {r.towardLabel > 0 ? " — toward the lie." : r.towardLabel < 0 ? " — against it." : " — unmoved."}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>

          {result.swappedPct !== null ? (
            <p className="mt-5 text-base leading-relaxed">
              On just those clips, your ratings moved{" "}
              <span className="font-display text-xl font-semibold" style={{ color: GOLD }}>
                {result.swappedPct > 0 ? "+" : ""}
                {result.swappedPct}%
              </span>{" "}
              toward a label that wasn&apos;t true.
              {result.swappedPct <= 0 ? " You didn't take the bait." : " That movement can't be explained by better information — there wasn't any."}
            </p>
          ) : null}

          {/* Controls disclosure (v1.1, N3: no silent machinery) */}
          {result.controlDriftPts !== null ? (
            <p className="mt-5 text-sm leading-relaxed text-muted">
              {`And ${result.controlCount === 1 ? "one clip" : `${result.controlCount} clips`} never carried a label in either pass — those are controls. They measure how much your ratings drift on a plain second listen (memory, familiarity, fatigue), and that drift — yours ran ${result.controlDriftPts > 0 ? "+" : ""}${result.controlDriftPts} point${Math.abs(result.controlDriftPts) === 1 ? "" : "s"} — is corrected out of your headline number, so "the second pass is just memory" is measured, not assumed.`}
            </p>
          ) : null}

          {/* Full receipts — every clip, controls included */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <p className="text-[0.65rem] font-bold tracking-[0.3em] text-muted">FULL RECEIPTS</p>
            <div className="mt-2 flex flex-col gap-1 text-sm text-muted">
              {BIAS_CLIPS.map((c, i) => {
                const r = result.receipts.find((x) => x.id === c.id);
                const ctrl = result.controlReceipts.find((x) => x.id === c.id);
                return (
                  <p key={c.id}>
                    Clip {i + 1}: {r ? `${r.blind} → ${r.labeled}` : `${ctrl?.first} → ${ctrl?.second}`}
                    {ctrl ? " (control — never labeled)" : r && !r.labelIsTrue ? " (swapped)" : ""}
                  </p>
                );
              })}
            </div>
          </div>

          {/* Share — the debrief is behind you; now the number travels. */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <p className="text-[0.65rem] font-bold tracking-[0.3em] text-muted">YOUR NUMBER, PORTABLE</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {"The link carries only your ratings — anyone who opens it sees your number recomputed — then gets dared to do better blind."}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <ShareButton
                url={`${origin}${resultPath}`}
                text={shareText(result.pct)}
                label="Share your number"
                event="bias_share"
                primary
                accent={GOLD}
              />
              <DownloadButton
                url={`/api/bias-card?format=story&pv=${BIAS_POOL_VERSION}&b=${b}&l=${l}`}
                label="Story card"
                filename="prestige-test-story.png"
              />
              <Jump href={resultPath} accent={GOLD} className="text-muted">
                View your result page →
              </Jump>
            </div>
          </div>

          {/* THE OTHER MACHINES (E7/S23). Was a hand-written Delicacy card
              that hardcoded Delicacy's ice inside this file and claimed "Six
              pairs" against a fifteen-pair pool. Both problems came from the
              same cause: one instrument describing another in its own words.
              D3's visible-and-locked door is kept for the case where Delicacy
              is not live. */}
          <OtherMachines from="bias" onPick={(to) => track("gym_machine_tap", { from: "bias", to })} />
          {!DELICACY_LIVE ? (
            <div className="mt-3 rounded-2xl border border-dashed border-white/20 p-5">
              <p className="text-[0.65rem] font-bold tracking-[0.3em] text-muted">NEXT MACHINE · LOCKED</p>
              <p className="mt-2 font-display text-xl font-semibold">Delicacy Trials</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                One clip of each pair has been quietly damaged. Prestige tested your prejudice —
                this one tests whether your ears can actually tell. In the gym soon.
              </p>
              <LockedTierButton />
            </div>
          ) : null}

          {/* Attribution — CC credit is a legal requirement, PD listed anyway. */}
          <div className="mt-8 text-[0.65rem] leading-relaxed text-muted">
            <p className="font-bold tracking-[0.3em]">RECORDINGS</p>
            {BIAS_CLIPS.map((c) => (
              <p key={c.id}>
                {c.trueArtist} — {c.license}
                {c.attribution ? ` · ${c.attribution}` : ""}
              </p>
            ))}
          </div>

          <Jump href="/bias" accent={GOLD} className="mt-8 text-muted">
            Run it again →
          </Jump>
        </div>
      </main>
    );
  }

  return null;
}

/** Demand signal for the locked tier — no fake signup, no email, no DB. */
function LockedTierButton() {
  const [noted, setNoted] = useState(false);
  return (
    <button
      type="button"
      disabled={noted}
      onClick={() => {
        track("bias_locked_tier_tap", {});
        setNoted(true);
      }}
      className="mt-3 rounded-full border px-5 py-2 text-sm font-bold transition active:scale-[0.98] disabled:opacity-70"
      style={{ borderColor: GOLD_DIM, color: GOLD }}
    >
      {noted ? "Noted. You're on the record." : "I want this →"}
    </button>
  );
}
