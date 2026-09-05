"use client";

/**
 * THE RANKING TEST — the flow (E17/S5, Track N).
 *
 * A RETURN-VISIT INSTRUMENT IN THE GYM, AND THE FLOOR IS UNTOUCHED (PM rulings
 * RT-I2 a and RT-136). The front door is still the Prestige Test's fixed set at
 * about eight minutes with no account. This is a fourth machine someone chooses
 * after that, and it costs four minutes of listening on its own — six clips at
 * forty seconds, because a twenty-second excerpt cannot carry a critic's
 * verdict on a forty-minute work.
 *
 * THE ORDER OF THE TWO TAPS IS NOT COSMETIC. "Heard this before?" is asked
 * BEFORE the rating, every time. Asked afterwards, a listener who has just
 * given something a 3 has an obvious motive to say they did not recognise it,
 * and a listener who gave a 9 has the opposite one — the answer would be
 * contaminated by the rating it is supposed to filter. Asked first, it is a
 * question about the clip rather than about the number.
 *
 * NOTHING IS STORED AND NOTHING IS SHARED YET. The result lives in component
 * state for the length of the sitting. That is a deliberate stopping point for
 * this slice, not an oversight: persistence is RT-G, which has never been
 * ruled, and inventing a store here would be answering it by accident.
 */

import { useState } from "react";
import Link from "next/link";
import ClipPlayer from "../bias/ClipPlayer";
import OtherMachines from "@/components/OtherMachines";
import { SPREAD_PALETTE } from "@/content/instrument-accents";
import { SPREAD_POOL } from "@/content/spread/ranking";
import { BIAS_SCALE_MAX } from "@/engine/bias";
import { computeSpreadResult, type SpreadResult } from "@/engine/spread";
import { RECOGNITION_DISCLOSURE, spreadLines } from "@/content/vocabulary/spread";

const { accent, soft, glow } = SPREAD_PALETTE;

/** Long clips, so the listen gate is longer than the Prestige Test's. */
const MIN_LISTEN_MS = 12_000;

type Phase = "frame" | "rate" | "reveal";

export default function SpreadFlow() {
  const [phase, setPhase] = useState<Phase>("frame");
  const [idx, setIdx] = useState(0);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [recognised, setRecognised] = useState<string[]>([]);
  const [heard, setHeard] = useState(false);
  const [said, setSaid] = useState<boolean | null>(null);
  const [result, setResult] = useState<SpreadResult | null>(null);

  const clip = SPREAD_POOL[idx];
  const last = idx === SPREAD_POOL.length - 1;

  function rate(value: number) {
    const next = { ...ratings, [clip.id]: value };
    setRatings(next);
    if (last) {
      setResult(computeSpreadResult(next, recognised));
      setPhase("reveal");
      return;
    }
    setIdx(idx + 1);
    setHeard(false);
    setSaid(null);
  }

  function answerRecognition(value: boolean) {
    setSaid(value);
    setRecognised(value ? [...recognised, clip.id] : recognised.filter((id) => id !== clip.id));
  }

  if (phase === "frame") {
    return (
      <main className="mx-auto max-w-xl px-5 py-14">
        <p className="text-xs uppercase tracking-[0.2em]" style={{ color: accent }}>
          The Ranking Test
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight">
          A critic ranked these works. Do your gaps fall where his did?
        </h1>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
          <p>
            Six pieces of music, forty seconds each. Rate what you hear, and nothing else. A
            published critic once ranked all of these against each other — some he placed far
            apart, some he bracketed together.
          </p>
          <p>
            What comes out is two numbers: how far apart your ratings fell on the pairs he
            separated, and how far apart they fell on the pairs he did not.{" "}
            <strong className="text-fg">
              Agreeing with him is not the point and is not measured.
            </strong>{" "}
            Nothing here can even see which of two works he ranked higher.
          </p>
          <p>{RECOGNITION_DISCLOSURE}</p>
          <p className="text-xs">About four minutes of listening. Headphones help.</p>
        </div>
        <button
          type="button"
          onClick={() => setPhase("rate")}
          className="mt-8 w-full rounded-2xl py-4 text-sm font-bold transition active:scale-[0.98]"
          style={{ background: soft, color: accent, boxShadow: `0 0 0 1.5px ${accent}` }}
        >
          Start listening
        </button>
      </main>
    );
  }

  if (phase === "rate") {
    return (
      <main className="mx-auto max-w-xl px-5 py-10">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          Clip {idx + 1} of {SPREAD_POOL.length}
        </p>
        <ClipPlayer
          key={clip.id}
          src={`/audio/spread/${clip.id}.mp3`}
          index={idx}
          label={`Clip ${idx + 1}`}
          caption="Listen, then say whether you know it — and only then rate it."
          minListenMs={MIN_LISTEN_MS}
          onArmed={() => setHeard(true)}
          onProgress={() => {}}
          palette={SPREAD_PALETTE}
        />

        {/*
          ASKED BEFORE THE RATING, ALWAYS. See the module docblock: after a
          rating, the answer is contaminated by the rating it is meant to filter.
        */}
        <div className="mt-8">
          <p className="text-sm font-semibold">Had you heard this before?</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {[
              { value: true, label: "Yes, I know it" },
              { value: false, label: "No, it is new" },
            ].map((option) => (
              <button
                key={String(option.value)}
                type="button"
                disabled={!heard}
                onClick={() => answerRecognition(option.value)}
                className="h-12 rounded-xl border text-sm font-semibold transition active:scale-95 disabled:opacity-40"
                style={
                  said === option.value
                    ? { borderColor: "transparent", background: soft, color: accent, boxShadow: `0 0 0 1.5px ${accent}` }
                    : { borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.02)" }
                }
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[0.65rem] text-muted">
            Saying yes leaves the clip out of the result. It is never counted against you.
          </p>
        </div>

        {/*
          GATED BY THE `disabled` ATTRIBUTE (E17/S5, found by driving the page).
          The first version dimmed this block with opacity and switched off
          pointer events in CSS. That looks identical and gates nothing: a
          keyboard user tabs straight into it, and a programmatic click goes
          through untouched. Driving the rendered flow submitted a rating on
          clip one WITHOUT answering the recognition question and WITHOUT the
          listen gate arming, then advanced to clip two.

          That defeats the ordering the module docblock argues for — the whole
          reason the recognition question comes first is that an answer given
          after a rating is contaminated by it.

          The CSS property is named in `spread-flow.test.ts`, not here, because
          a comment quoting the thing a text guard forbids reproduces it.
        */}
        <div className={said === null ? "mt-8 opacity-40" : "mt-8"}>
          <p className="text-sm font-semibold">How good is it?</p>
          {/*
            SIX COLUMNS, NOT ELEVEN — the eleven buttons wrap onto two rows.
            Measured at 375px: `grid-cols-11` gave 27px-wide targets, and the
            Prestige Test's own scale gives 50px from `grid-cols-6`. I had
            assumed mine was inherited from that flow and it was not; it was a
            regression I introduced, found by measuring both rather than by
            reasoning about one.
          */}
          <div className="mt-3 grid grid-cols-6 gap-1.5">
            {Array.from({ length: BIAS_SCALE_MAX + 1 }, (_, v) => (
              <button
                key={v}
                type="button"
                disabled={said === null}
                onClick={() => rate(v)}
                aria-label={`Rate ${v}`}
                className="h-12 rounded-xl border text-sm font-bold transition active:scale-95 disabled:cursor-not-allowed"
                style={{ borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.02)" }}
              >
                {v}
              </button>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[0.65rem] text-muted">
            <span>Nothing there</span>
            <span>As good as this gets</span>
          </div>
        </div>
      </main>
    );
  }

  if (!result) return null;
  return (
    <main className="mx-auto max-w-xl px-5 py-14">
      <p className="text-xs uppercase tracking-[0.2em]" style={{ color: accent }}>
        The Ranking Test
      </p>
      <h1 className="mt-3 text-3xl font-bold leading-tight">Where your gaps fell</h1>

      {result.refusal === null ? (
        <div className="mt-8 grid grid-cols-2 gap-4">
          <Figure
            value={result.far.meanGap}
            caption="across works he placed far apart"
            baseline={result.spreadIfIndifferent}
          />
          <Figure
            value={result.close.meanGap}
            caption="across works he bracketed together"
            baseline={result.spreadIfIndifferent}
          />
        </div>
      ) : null}

      {/*
        ONE COMPOSER FOR THE WHOLE READING (E17/S6). The reveal used to append
        the boundary itself, beside the recognition lines — the deck's own
        ordering reproduced by hand on the page, which is how a fix that lives
        in a function stops reaching its callers.
      */}
      <div className="mt-8 space-y-4 text-sm leading-relaxed text-muted">
        {spreadLines(result).map((line) => (
          <p key={line.slice(0, 32)}>{line}</p>
        ))}
      </div>

      <div className="mt-10">
        <OtherMachines from="spread" />
      </div>
      <p className="mt-8 text-xs text-muted">
        <Link href="/learn/methodology" className="underline">
          How this is measured
        </Link>
      </p>
    </main>
  );
}

/**
 * A number never appears without the chance baseline beside it. The engine
 * refuses to produce a mean it cannot support; this makes sure the one it does
 * produce is not readable as a mark out of ten.
 */
function Figure({
  value,
  caption,
  baseline,
}: {
  value: number | null;
  caption: string;
  baseline: number;
}) {
  if (value === null) return null;
  return (
    <div
      className="rounded-2xl border p-5"
      style={{ borderColor: "rgba(255,255,255,0.1)", boxShadow: `0 12px 40px ${glow}` }}
    >
      <p className="text-4xl font-bold tabular-nums" style={{ color: accent }}>
        {value.toFixed(1)}
      </p>
      <p className="mt-2 text-xs leading-snug text-muted">{caption}</p>
      <p className="mt-3 text-[0.65rem] text-muted">
        Rating at random gives {baseline.toFixed(1)} on both.
      </p>
    </div>
  );
}
