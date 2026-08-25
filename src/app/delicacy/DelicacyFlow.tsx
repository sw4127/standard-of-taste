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

import Jump from "@/components/Jump";
import { readableOn } from "@/lib/readable-on";
import { useEffect, useRef, useState } from "react";
import FluidField from "@/components/FluidField";
import { track } from "@/lib/analytics";
import {
  DEGRADATION_FAMILIES,
  computeDelicacyResult,
  encodeDelicacyResponses,
  type DelicacyConfidence,
  type DelicacyResponses,
  type DelicacyResult,
  type DegradationFamily,
  type PairSide, detectionBand } from "@/engine/delicacy";
import { computeCalibration } from "@/engine/calibration";
import {
  DELICACY_INSTRUMENT_ID,
  DELICACY_POOL_VERSION,
  DELICACY_TRIALS,
  MEASURED_TRIALS,
  PRACTICE_TRIALS,
  FLAW_LABELS,
  type DelicacyTrialClip,
} from "@/content/delicacy/items";
import ClipPlayer from "@/app/bias/ClipPlayer";
import AbCompare from "./AbCompare";
import { CalibrationBlock, FlawLine } from "./RevealBlocks";
import ShareButton from "@/app/result/ShareButton";
import DownloadButton from "@/app/result/DownloadButton";
import {
  MAGNITUDE_WORDS,
  PROVISIONAL_FOOTNOTE,
  shareText, detectionTitle, detectionBody } from "@/content/delicacy/copy";

/* One accent in play (design bar): delicacy ice — the cold, fine-grained room
 * of the gym, deliberately opposite the prestige gold. Same formula, new hue. */
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
const ICE = "hsl(190 75% 62%)";
const ICE_TINT = "hsl(190 70% 55% / 0.14)";
const ICE_GLOW = "hsl(190 80% 60% / 0.4)";
const FLUID = ["hsl(195 45% 40%)", "hsl(210 40% 36%)", "hsl(180 40% 38%)", "hsl(225 35% 34%)"];
const BASE = "#07090B"; // cold near-black

const BEAT_MS = 420;

type Phase = "frame" | "practice" | "trial" | "done";
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
  // Per-trial count of same-moment A/B switches — how hard this listener
  // actually worked at the comparison (D6, and a usability signal).
  const switches = useRef<Record<string, number>>({});
  const [practiceIdx, setPracticeIdx] = useState(0);
  const [practicePick, setPracticePick] = useState<PairSide | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // D6: per-trial heard milliseconds per side, captured continuously.
  const listenMs = useRef<{ a: Record<string, number>; b: Record<string, number> }>({ a: {}, b: {} });

  const trial: DelicacyTrialClip | undefined = MEASURED_TRIALS[idx];
  const total = MEASURED_TRIALS.length;
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
      const r = computeDelicacyResult(DELICACY_INSTRUMENT_ID, MEASURED_TRIALS, nextResponses);
      const cal = computeCalibration(r.receipts.map((rec) => ({ confidence: rec.confidence, correct: rec.correct })));
      setResult(r);
      track("delicacy_result", {
        pool: DELICACY_INSTRUMENT_ID,
        poolVersion: DELICACY_POOL_VERSION,
        hash: r.hash,
        picks: encodeDelicacyResponses(MEASURED_TRIALS, nextResponses),
        listen_a: MEASURED_TRIALS.map((t) => listenMs.current.a[t.id] ?? 0).join(","),
        listen_b: MEASURED_TRIALS.map((t) => listenMs.current.b[t.id] ?? 0).join(","),
        // E7/S14: collected since the flow was written and recorded nowhere.
        // Same shape and order as the listen series above, so a row of the D6
        // dataset can be read across: answers, exposure, effort.
        switches: MEASURED_TRIALS.map((t) => switches.current[t.id] ?? 0).join(","),
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
    <p className="text-xs font-bold tracking-[0.4em]" style={{ color: BRAND }}>
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
            <span className="text-foreground">Now you taste.</span> {PRACTICE_TRIALS.length} practice
            pairs with the answers shown, then {MEASURED_TRIALS.length} scored ones. In each, one clip
            is the original and one has been quietly damaged. Find the key in the wine.
          </p>
          <button
            type="button"
            onClick={() => {
              track("delicacy_start", {});
              setPhase("practice");
            }}
            className="mt-8 self-start rounded-full px-7 py-3.5 text-base font-bold transition active:scale-[0.98]"
            style={{ color: readableOn(ICE), background: ICE, boxShadow: `0 10px 30px ${ICE_GLOW}` }}
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
  // ---------------------------------------------------------------- practice
  // Three trials at the strongest rung, one per family, ANSWERED WITH FEEDBACK.
  // The point is not measurement — these items are excluded from the score —
  // it is that a newcomer hears what each flaw sounds like on its most obvious
  // example before being asked to find a subtle one. A listener who is told
  // nothing for eighteen trials cannot tell "I am bad at this" from "this is
  // broken", which is exactly what user testing reported.
  if (phase === "practice") {
    const p = PRACTICE_TRIALS[practiceIdx];
    if (!p) return null;
    const answered = practicePick !== null;
    const right = practicePick === p.originalSide;
    return (
      <main className={shell}>
        <FluidField colors={FLUID} baseColor={BASE} intensity={0.6} scrim={false} vignette />
        <div className="relative z-10 flex flex-1 flex-col">
          <div className="flex items-center justify-between text-xs font-medium text-muted">
            <span className="tracking-[0.3em]">PRACTICE — NOT SCORED</span>
            <span>
              {practiceIdx + 1} / {PRACTICE_TRIALS.length}
            </span>
          </div>

          <p className="mt-6 text-sm text-muted">
            These three are the <span className="text-foreground">loudest</span> examples of each
            kind of damage, and the answers are shown. Learn what to listen for.
          </p>
          <p className="mt-2 font-display text-lg font-semibold" style={{ color: ICE }}>
            {FLAW_LABELS[p.family].label} — {FLAW_LABELS[p.family].hint}
          </p>

          <ClipPlayer
            key={`${p.id}-pa`}
            src={p.srcA}
            index={practiceIdx}
            label={`Practice ${practiceIdx + 1} — A`}
            caption="tap to listen"
            minListenMs={MIN_LISTEN_MS_PER_CLIP}
            onArmed={() => {}}
            onProgress={() => {}}
          />
          <ClipPlayer
            key={`${p.id}-pb`}
            src={p.srcB}
            index={practiceIdx}
            label={`Practice ${practiceIdx + 1} — B`}
            caption="tap to listen"
            minListenMs={MIN_LISTEN_MS_PER_CLIP}
            onArmed={() => {}}
            onProgress={() => {}}
          />
          <AbCompare key={`${p.id}-pcmp`} srcA={p.srcA} srcB={p.srcB} />

          {!answered ? (
            <div className="mt-7">
              <p className="text-sm font-semibold">Which one is the original?</p>
              <div className="mt-3 flex gap-3">
                {(["a", "b"] as const).map((sideKey) => (
                  <button
                    key={sideKey}
                    type="button"
                    onClick={() => setPracticePick(sideKey)}
                    aria-label={`${sideKey.toUpperCase()} is the original`}
                    className="flex-1 rounded-2xl border border-white/15 py-4 text-base font-bold transition hover:border-white/40 active:scale-[0.98]"
                  >
                    {sideKey.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-7 rounded-2xl border p-5" style={{ borderColor: right ? "hsl(150 60% 50% / 0.45)" : "hsl(0 60% 60% / 0.4)", background: "rgba(255,255,255,0.03)" }}>
              <p className="font-display text-xl font-semibold">
                {right ? "That's it." : "Not this time."}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-neutral-300">
                <span className="text-foreground">{p.originalSide.toUpperCase()}</span> was the
                original. The damage in {p.originalSide === "a" ? "B" : "A"} was{" "}
                <span style={{ color: ICE }}>{FLAW_LABELS[p.family].label.toLowerCase()}</span> —{" "}
                {FLAW_LABELS[p.family].hint}. Go back and switch between them until you can hear it;
                that is the whole skill.
              </p>
              <button
                type="button"
                onClick={() => {
                  setPracticePick(null);
                  if (practiceIdx + 1 < PRACTICE_TRIALS.length) setPracticeIdx(practiceIdx + 1);
                  else setPhase("trial");
                }}
                className="mt-4 rounded-full px-6 py-3 text-sm font-bold transition active:scale-[0.98]"
                style={{ color: readableOn(ICE), background: ICE }}
              >
                {practiceIdx + 1 < PRACTICE_TRIALS.length
                  ? "Next practice pair"
                  : `Start the ${MEASURED_TRIALS.length} scored trials`}
              </button>
            </div>
          )}
        </div>
      </main>
    );
  }

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

          {/* The comparison tool, unlocked by the same gate as the pick.
              Exposure is controlled during the required listen; comparison is
              unlimited afterwards (PM ruling RT-34b). Before this existed a
              listener could never hear the same INSTANT of both clips, which
              is the only way a difference this small is found — and pitch
              drift peaks at clip end, the moment the old pattern reached last. */}
          {bothArmed && (
            <AbCompare
              key={`${trial.id}-cmp`}
              srcA={trial.srcA}
              srcB={trial.srcB}
              onSwitch={(n) => {
                switches.current[trial.id] = n;
              }}
            />
          )}

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
    const band = detectionBand(result.nCorrect, result.nTrials);
    // MEASURED_TRIALS, not the pool: practice trials are never answered into
    // `responses`, and the share payload is positional against the SCORED set.
    const p = encodeURIComponent(encodeDelicacyResponses(MEASURED_TRIALS, responses));
    const resultPath = `/delicacy/result?pv=${DELICACY_POOL_VERSION}&p=${p}`;
    const origin = typeof window === "undefined" ? "" : window.location.origin;
    const credits = [...new Set(DELICACY_TRIALS.map((t) => `${t.sourceCredit} — ${t.license} · ${t.attribution}`))];
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
            <p className="mt-3 text-sm text-muted">originals identified</p>
            <h1 className="mt-7 font-display text-4xl font-semibold">{detectionTitle(band)}</h1>
            <p className="mx-auto mt-3 max-w-sm text-left text-base leading-relaxed text-muted">
              {detectionBody(band)}
            </p>
            <FlawLine result={result} />
          </div>

          {/* Good sense. SHARED with the permalink (RevealBlocks) since RT-142a:
              two copies of one paragraph is how a flow and its page start
              describing the same session differently. */}
          <CalibrationBlock cal={cal} />

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
              <Jump href={resultPath} accent={ICE} className="text-muted">
                View your result page →
              </Jump>
            </div>
          </div>

          {/* One string, assembled in the copy deck so the voice gate sees the
              whole paragraph rather than the middle third (copy.ts). */}
          <p className="mt-6 text-xs leading-relaxed text-muted">{PROVISIONAL_FOOTNOTE}</p>

          {/* Attribution — CC credit is a legal requirement, PD listed anyway. */}
          <div className="mt-6 text-[0.65rem] leading-relaxed text-muted">
            <p className="font-bold tracking-[0.3em]">RECORDINGS</p>
            {credits.map((c) => (
              <p key={c}>{c}</p>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Jump href="/delicacy" accent={ICE} className="text-muted">
              Run it again →
            </Jump>
            <Jump href="/bias" accent={ICE} className="text-muted">
              The other machine: the Prestige Test →
            </Jump>
          </div>
        </div>
      </main>
    );
  }

  return null;
}
