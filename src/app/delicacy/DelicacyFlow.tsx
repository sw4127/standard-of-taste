"use client";

/**
 * Delicacy Trials flow (memo D2 Instrument 2 · D3 "built second" · D5
 * narration — Sancho's kinsmen and the key in the wine).
 *
 * Beats: Hume frame → every trial in the pool → completion. Trial counts and
 * the session estimate are DERIVED from DELICACY_TRIALS, never written down:
 * the pool went 6 → 24 → 18 in a day and every hardcoded "six" became a lie.
 * Each trial: hear BOTH sides (each arms at min-listen) → pick the original →
 * name the flaw (all three families offered every trial — FLAW_CHANCE depends
 * on it) → confidence tap, phrased about the SIDE PICK only (the S3 pinned
 * referent). All numbers come from src/engine/delicacy + calibration
 * (deterministic; §6 principle) — nothing here classifies.
 *
 * Data (D6, interim analytics sink like bias_result): raw picks CSV, per-side
 * listen ms, pool version, hash. Pool v0 = dev placeholder (same source work
 * under every degradation) — analysis excludes pv0.
 */

import { useEffect, useRef, useState } from "react";
import FluidField from "@/components/FluidField";
import { track } from "@/lib/analytics";
import {
  DEGRADATION_FAMILIES,
  DELICACY_CHANCE,
  computeDelicacyResult,
  encodeDelicacyResponses,
  type DelicacyConfidence,
  type DelicacyResponses,
  type DelicacyResult,
  type DegradationFamily,
  type PairSide,
} from "@/engine/delicacy";
import { BRIER_COIN_FLIP, binDisplayPct, computeCalibration } from "@/engine/calibration";
import {
  DELICACY_INSTRUMENT_ID,
  DELICACY_POOL_VERSION,
  DELICACY_TRIALS,
  FLAW_LABELS,
  type DelicacyTrialClip,
} from "@/content/delicacy/items";
import ClipPlayer from "@/app/bias/ClipPlayer";
import ShareButton from "@/app/result/ShareButton";
import DownloadButton from "@/app/result/DownloadButton";
import {
  CALIBRATION_PHASE_LINE,
  MAGNITUDE_WORDS,
  calibrationLine,
  delicacyVerdict,
  shareText,
} from "@/content/delicacy/copy";

/* One accent in play (design bar): delicacy ice — the cold, fine-grained room
 * of the gym, deliberately opposite the prestige gold. Same formula, new hue. */
const ICE = "hsl(190 75% 62%)";
const ICE_TINT = "hsl(190 70% 55% / 0.14)";
const ICE_GLOW = "hsl(190 80% 60% / 0.4)";
const FLUID = ["hsl(195 45% 40%)", "hsl(210 40% 36%)", "hsl(180 40% 38%)", "hsl(225 35% 34%)"];
const BASE = "#07090B"; // cold near-black

const BEAT_MS = 420;

type Phase = "frame" | "trial" | "done";
type TrialStep = "listen" | "flaw" | "confidence";

const CONFIDENCE_TAPS: Array<{ value: DelicacyConfidence; label: string; hint: string }> = [
  { value: 95, label: "95%", hint: "certain" },
  { value: 70, label: "70%", hint: "fairly sure" },
  { value: 50, label: "50%", hint: "honestly guessing" },
];

/**
 * Minimum listening per clip. Delicacy degradations are time-extended (a pitch
 * ramp peaks at clip END), so a shorter gate could unlock a pick the listener
 * has had no real chance to hear.
 */
const MIN_LISTEN_MS_PER_CLIP = 8000;

/**
 * Honest session estimate, DERIVED. Two clips per trial at the min-listen gate
 * is the floor nobody can go below; real sessions run longer because of taps
 * and replays, so the floor is multiplied rather than quoted raw. Written down
 * as a number once (it said "~4 minutes" against an 18-trial pool, which was
 * a floor of 4.8 minutes of forced listening alone).
 */
const SESSION_MINUTES = Math.ceil(
  (DELICACY_TRIALS.length * 2 * (MIN_LISTEN_MS_PER_CLIP / 1000) * 1.9) / 60,
);

export default function DelicacyFlow() {
  const [phase, setPhase] = useState<Phase>("frame");
  const [idx, setIdx] = useState(0);
  const [step, setStep] = useState<TrialStep>("listen");
  const [armedA, setArmedA] = useState(false);
  const [armedB, setArmedB] = useState(false);
  const [pickedSide, setPickedSide] = useState<PairSide | null>(null);
  const [flawPick, setFlawPick] = useState<DegradationFamily | null>(null);
  const [confPick, setConfPick] = useState<DelicacyConfidence | null>(null); // beat-lock visual
  const [responses, setResponses] = useState<DelicacyResponses>({});
  const [result, setResult] = useState<DelicacyResult | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // D6: per-trial heard milliseconds per side, captured continuously.
  const listenMs = useRef<{ a: Record<string, number>; b: Record<string, number> }>({ a: {}, b: {} });

  const trial: DelicacyTrialClip | undefined = DELICACY_TRIALS[idx];
  const total = DELICACY_TRIALS.length;
  const bothArmed = armedA && armedB;

  useEffect(() => {
    track("delicacy_frame_view", {});
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  // Picks stay editable until the confidence tap COMMITS the trial (one
  // commit point) — a misclicked side must not corrupt a trial's data.
  function pickSide(side: PairSide) {
    if (!bothArmed || confPick !== null) return;
    setPickedSide(side);
    if (step === "listen") setStep("flaw");
  }

  function pickFlaw(family: DegradationFamily) {
    if (confPick !== null) return;
    setFlawPick(family);
    if (step !== "confidence") setStep("confidence");
  }

  function pickConfidence(value: DelicacyConfidence) {
    if (!trial || !pickedSide || !flawPick || confPick !== null) return;
    setConfPick(value);
    const nextResponses: DelicacyResponses = {
      ...responses,
      [trial.id]: { pickedSide, flawPick, confidence: value },
    };
    setResponses(nextResponses);
    track("delicacy_trial_complete", {
      trial: idx + 1,
      listenA: listenMs.current.a[trial.id] ?? 0,
      listenB: listenMs.current.b[trial.id] ?? 0,
    });

    timer.current = setTimeout(() => {
      setPickedSide(null);
      setFlawPick(null);
      setConfPick(null);
      setArmedA(false);
      setArmedB(false);
      setStep("listen");
      if (idx < total - 1) {
        setIdx(idx + 1);
        return;
      }
      // All trials answered → compute (deterministic, in code) and bank (D6).
      const r = computeDelicacyResult(DELICACY_INSTRUMENT_ID, DELICACY_TRIALS, nextResponses);
      const cal = computeCalibration(r.receipts.map((rec) => ({ confidence: rec.confidence, correct: rec.correct })));
      setResult(r);
      track("delicacy_result", {
        pool: DELICACY_INSTRUMENT_ID,
        poolVersion: DELICACY_POOL_VERSION,
        hash: r.hash,
        picks: encodeDelicacyResponses(DELICACY_TRIALS, nextResponses),
        listen_a: DELICACY_TRIALS.map((t) => listenMs.current.a[t.id] ?? 0).join(","),
        listen_b: DELICACY_TRIALS.map((t) => listenMs.current.b[t.id] ?? 0).join(","),
        nCorrect: r.nCorrect,
        accuracy: r.accuracy,
        flawEligible: r.flawEligible,
        flawCorrect: r.flawCorrect,
        brier: cal.brier,
        gapPct: cal.gapPct,
        gapSePct: cal.gapSePct,
        direction: cal.direction,
      });
      setPhase("done");
    }, BEAT_MS);
  }

  const shell = "relative mx-auto flex min-h-dvh w-full max-w-lg flex-col overflow-hidden px-6 py-10";
  const kicker = (
    <p className="text-xs font-bold tracking-[0.4em]" style={{ color: ICE }}>
      THE TASTE GYM
    </p>
  );

  /* ---------------------------------------------------------------- frame */
  if (phase === "frame") {
    return (
      <main className={`${shell} justify-center`}>
        <FluidField colors={FLUID} baseColor={BASE} intensity={0.6} scrim={false} vignette />
        <div className="relative z-10">
          {kicker}
          <h1 className="mt-6 font-display text-4xl font-semibold leading-tight">
            Two of Sancho&apos;s kinsmen tasted the wine.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted">
            One said it was good — except for a faint taste of leather. The other agreed — except
            for the iron. The village laughed at both. Then the barrel ran dry, and at the bottom:
            an old key on a leather thong.
          </p>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Hume&apos;s point: delicacy of taste is real, physical, and checkable.{" "}
            <span className="text-foreground">Now you taste.</span> {DELICACY_TRIALS.length} pairs of
            clips — in each, one is the original and one has been quietly damaged. Find the key in
            the wine.
          </p>
          <button
            type="button"
            onClick={() => {
              track("delicacy_start", {});
              setPhase("trial");
            }}
            className="mt-8 self-start rounded-full px-7 py-3.5 text-base font-bold text-black transition active:scale-[0.98]"
            style={{ background: ICE, boxShadow: `0 10px 30px ${ICE_GLOW}` }}
          >
            Start the trials
          </button>
          <p className="mt-4 text-xs text-muted">
            ~{SESSION_MINUTES} minutes. No sign-up. Headphones strongly advised.
          </p>
        </div>
      </main>
    );
  }

  /* ---------------------------------------------------------------- trial */
  if (phase === "trial") {
    if (!trial) return null;
    const caption = (armed: boolean) =>
      armed ? "heard enough — it plays on" : "tap to listen · unlocks at the notch";
    return (
      <main className={shell}>
        <FluidField colors={FLUID} baseColor={BASE} intensity={0.6} scrim={false} vignette />
        <div className="relative z-10 flex flex-1 flex-col">
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs font-medium text-muted">
              <span className="tracking-[0.3em]">DELICACY TRIALS</span>
              <span>
                {idx + 1} / {total}
              </span>
            </div>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${((idx + 1) / total) * 100}%`, background: ICE, boxShadow: `0 0 8px ${ICE}` }}
              />
            </div>
          </div>

          <p className="text-sm text-muted">
            One of these is the original. The other has something wrong with it. Listen to both.
          </p>

          <ClipPlayer
            key={`${trial.id}-a`}
            src={trial.srcA}
            index={idx}
            label={`Pair ${idx + 1} — A`}
            caption={caption(armedA)}
            minListenMs={MIN_LISTEN_MS_PER_CLIP}
            onArmed={() => setArmedA(true)}
            onProgress={(ms) => {
              listenMs.current.a[trial.id] = ms;
            }}
          />
          <ClipPlayer
            key={`${trial.id}-b`}
            src={trial.srcB}
            index={idx}
            label={`Pair ${idx + 1} — B`}
            caption={caption(armedB)}
            minListenMs={MIN_LISTEN_MS_PER_CLIP}
            onArmed={() => setArmedB(true)}
            onProgress={(ms) => {
              listenMs.current.b[trial.id] = ms;
            }}
          />

          {/* Q1 — the pick. Unlock is a visible state change. */}
          <div
            className={`mt-7 transition-all duration-500 ease-out ${
              bothArmed ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-1.5 opacity-35"
            }`}
          >
            <p className="text-[0.65rem] font-bold tracking-[0.3em] text-muted">WHICH IS THE ORIGINAL?</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(["a", "b"] as const).map((side) => (
                <button
                  key={side}
                  type="button"
                  onClick={() => pickSide(side)}
                  aria-label={`${side.toUpperCase()} is the original`}
                  className="h-14 rounded-xl border text-base font-bold uppercase transition active:scale-95"
                  style={
                    pickedSide === side
                      ? { borderColor: "transparent", background: ICE_TINT, color: ICE, boxShadow: `0 0 0 1.5px ${ICE}, 0 8px 24px ${ICE_GLOW}` }
                      : { borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.02)" }
                  }
                >
                  {side}
                </button>
              ))}
            </div>
          </div>

          {/* Q2 — the flaw. All three families, every trial. */}
          {step !== "listen" && pickedSide ? (
            <div className="mt-6">
              <p className="text-[0.65rem] font-bold tracking-[0.3em] text-muted">
                WHAT&apos;S WRONG WITH {pickedSide === "a" ? "B" : "A"}?
              </p>
              <div className="mt-2 flex flex-col gap-2">
                {DEGRADATION_FAMILIES.map((family) => (
                  <button
                    key={family}
                    type="button"
                    onClick={() => pickFlaw(family)}
                    aria-label={FLAW_LABELS[family].label}
                    className="rounded-xl border px-4 py-3 text-left transition active:scale-[0.99]"
                    style={
                      flawPick === family
                        ? { borderColor: "transparent", background: ICE_TINT, boxShadow: `0 0 0 1.5px ${ICE}` }
                        : { borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.02)" }
                    }
                  >
                    <span className="text-sm font-bold" style={flawPick === family ? { color: ICE } : undefined}>
                      {FLAW_LABELS[family].label}
                    </span>
                    <span className="ml-2 text-xs text-muted">{FLAW_LABELS[family].hint}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Q3 — confidence, about the SIDE PICK only (pinned referent). */}
          {step === "confidence" && pickedSide ? (
            <div className="mt-6">
              <p className="text-[0.65rem] font-bold tracking-[0.3em] text-muted">
                HOW SURE ARE YOU {pickedSide.toUpperCase()} IS THE ORIGINAL?
              </p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {CONFIDENCE_TAPS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => pickConfidence(c.value)}
                    aria-label={`${c.label} — ${c.hint}`}
                    className="rounded-xl border px-2 py-3 transition active:scale-95"
                    style={
                      confPick === c.value
                        ? { borderColor: "transparent", background: ICE_TINT, boxShadow: `0 0 0 1.5px ${ICE}, 0 8px 24px ${ICE_GLOW}` }
                        : { borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.02)" }
                    }
                  >
                    <span className="block text-base font-bold" style={confPick === c.value ? { color: ICE } : undefined}>
                      {c.label}
                    </span>
                    <span className="mt-0.5 block text-[0.65rem] text-muted">{c.hint}</span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[0.65rem] text-muted">
                Honesty pays here — your confidence is scored against your accuracy at the end.
              </p>
            </div>
          ) : null}
        </div>
      </main>
    );
  }

  /* --------------------------------------------------------------- reveal */
  if (phase === "done" && result) {
    const cal = computeCalibration(result.receipts.map((r) => ({ confidence: r.confidence, correct: r.correct })));
    const v = delicacyVerdict(result.nCorrect, result.nTrials);
    const p = encodeURIComponent(encodeDelicacyResponses(DELICACY_TRIALS, responses));
    const resultPath = `/delicacy/result?pv=${DELICACY_POOL_VERSION}&p=${p}`;
    const origin = typeof window === "undefined" ? "" : window.location.origin;
    const credits = [...new Set(DELICACY_TRIALS.map((t) => `${t.sourceCredit} — ${t.license} · ${t.attribution}`))];
    const showableBins = cal.bins.filter((b) => binDisplayPct(b) !== null);
    return (
      <main className={shell}>
        <FluidField colors={FLUID} baseColor={BASE} intensity={0.72} scrim={false} vignette />
        <div className="relative z-10">
          <div className="text-center">
            <p className="text-xs font-bold tracking-[0.4em] text-muted">YOUR EARS, MEASURED</p>
            <p className="mt-4 font-display text-8xl font-semibold leading-none" style={{ color: ICE, textShadow: `0 0 60px ${ICE_GLOW}` }}>
              {result.nCorrect}
              <span className="text-5xl text-muted">/{result.nTrials}</span>
            </p>
            <p className="mt-3 text-sm text-muted">
              originals identified — a coin flip calls {Math.round(result.nTrials * DELICACY_CHANCE)}
            </p>
            <h1 className="mt-7 font-display text-4xl font-semibold">{v.title}</h1>
            <p className="mx-auto mt-2 max-w-sm text-base leading-relaxed text-muted">{v.sub}</p>
            {result.flawAccuracy !== null ? (
              <p className="mt-5 inline-block rounded-full border border-white/10 px-4 py-1.5 text-sm text-muted">
                And on the ones you caught, you named the flaw{" "}
                <span className="font-semibold" style={{ color: ICE }}>
                  {result.flawCorrect} of {result.flawEligible}
                </span>{" "}
                times.
              </p>
            ) : null}
          </div>

          {/* Good sense — whole-session numbers lead; bins only when they stand (S4 ruling) */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <p className="text-[0.65rem] font-bold tracking-[0.3em] text-muted">DID YOU KNOW WHEN YOU KNEW?</p>
            <p className="mt-2 text-sm leading-relaxed">{calibrationLine(cal)}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Brier score {cal.brier.toFixed(3)} — pure coin-flip guessing scores {BRIER_COIN_FLIP.toFixed(2)}; lower is better,
              but only next to the direction above.
            </p>
            {showableBins.length > 0 ? (
              <div className="mt-3 flex flex-col gap-1 text-xs text-muted">
                {showableBins.map((b) => (
                  <p key={b.confidencePct}>
                    When you said {b.confidencePct}%: right {b.correct} of {b.n}.
                  </p>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-muted">
                Per-level breakdowns need 3+ answers at a level. The whole-session
                read above is the honest number.
              </p>
            )}
          </div>

          {/* The reveal — every pair, full disclosure (N3) */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <p className="text-[0.65rem] font-bold tracking-[0.3em] text-muted">WHAT WAS ACTUALLY WRONG</p>
            <div className="mt-3 flex flex-col gap-3">
              {result.receipts.map((r, i) => (
                <div key={r.id} className="border-b border-white/5 pb-3 text-sm last:border-b-0 last:pb-0">
                  <p>
                    <span className="font-semibold" style={{ color: r.correct ? ICE : undefined }}>
                      Pair {i + 1}: {r.correct ? "caught it" : "fooled you"}
                    </span>
                    <span className="text-muted">
                      {" "}
                      — the original was {DELICACY_TRIALS.find((t) => t.id === r.id)!.originalSide.toUpperCase()}, you picked {r.pickedSide.toUpperCase()} at {r.confidence}%.
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    The flaw: {FLAW_LABELS[r.family].label.toLowerCase()} ({MAGNITUDE_WORDS[r.magnitude]})
                    {r.flawCorrect !== null ? (r.flawCorrect ? " — you named it." : ` — you said "${FLAW_LABELS[r.flawPick].label.toLowerCase()}".`) : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Share — the number travels (see the engine's answer-key honesty note) */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <p className="text-[0.65rem] font-bold tracking-[0.3em] text-muted">YOUR EARS, PORTABLE</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              The link carries only your answers — anyone who opens it sees your session rescored, then gets
              dared to beat it.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <ShareButton
                url={`${origin}${resultPath}`}
                text={shareText(result.nCorrect, result.nTrials)}
                label="Share your ears"
                event="delicacy_share"
                primary
                accent={ICE}
              />
              <DownloadButton
                url={`/api/delicacy-card?format=story&pv=${DELICACY_POOL_VERSION}&p=${p}`}
                label="Story card"
                filename="delicacy-trials-story.png"
              />
              <a href={resultPath} className="text-sm text-muted underline underline-offset-4 transition hover:text-white">
                View your result page →
              </a>
            </div>
          </div>

          <p className="mt-6 text-xs leading-relaxed text-muted">
            Provisional read — you&apos;re early. {CALIBRATION_PHASE_LINE} Difficulty labels are authored, not yet
            norm-calibrated.
          </p>

          {/* Attribution — CC credit is a legal requirement, PD listed anyway. */}
          <div className="mt-6 text-[0.65rem] leading-relaxed text-muted">
            <p className="font-bold tracking-[0.3em]">RECORDINGS</p>
            {credits.map((c) => (
              <p key={c}>{c}</p>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <a href="/delicacy" className="text-sm text-muted underline underline-offset-4 transition hover:text-white">
              Run it again →
            </a>
            <a href="/bias" className="text-sm text-muted underline underline-offset-4 transition hover:text-white">
              The other machine: the Prestige Test →
            </a>
          </div>
        </div>
      </main>
    );
  }

  return null;
}
