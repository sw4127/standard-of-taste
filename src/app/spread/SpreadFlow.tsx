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
 * THIS BROWSER REMEMBERS THE SITTING, AND NOTHING IS SHARED (E18/S2, PM ruling
 * RT-O2 a). What is written is the ANSWERS — the ratings and the recognition
 * flags — through the same store the other three instruments use, and every
 * figure is recomputed from them on read. No result is stored, so this device
 * cannot start reporting a number the current engine would not produce.
 *
 * IT SHIPPED STORING NOTHING, AND THE REASON GIVEN WAS FALSE. The docblock here
 * said persistence was RT-G and unruled. RT-G had been ruled (b) four days
 * earlier and Track G had built the store; the gap was real and its stated
 * reason was not. Recorded rather than quietly replaced, because a comment that
 * silently corrects itself teaches nobody what went wrong.
 *
 * THERE IS STILL NO SHARE URL, and that is not an oversight either. The other
 * three result screens are share targets, which is why they need an ownership
 * gate at all; this reveal is reached only by finishing the sitting.
 */

import { useState } from "react";
import { track } from "@/lib/analytics";
import Link from "next/link";
import ClipPlayer from "../bias/ClipPlayer";
import OtherMachines from "@/components/OtherMachines";
import AcrossSessions from "@/components/AcrossSessions";
import ExpertPanel from "@/components/ExpertPanel";
import { SPREAD_PALETTE } from "@/content/instrument-accents";

import { BIAS_SCALE_MAX } from "@/engine/bias";
import {
  computeSpreadResult,
  encodeSpreadRatings,
  encodeSpreadRecognised,
  type SpreadResult,
} from "@/engine/spread";
import { recordResult } from "@/lib/result-store";
import { SPREAD_POOL, SPREAD_POOL_VERSION } from "@/content/spread/ranking";
import { RECOGNITION_DISCLOSURE, spreadLines } from "@/content/vocabulary/spread";
import { numberWord, numberWordLeading } from "@/content/vocabulary/numbers";
import {
  SPREAD_CLIP_SECONDS,
  SPREAD_SESSION_MINUTES,
  SPREAD_WORK_COUNT,
} from "@/content/instrument-shape";

const { accent, soft, glow } = SPREAD_PALETTE;

/** Long clips, so the listen gate is longer than the Prestige Test's. */
const MIN_LISTEN_MS = 12_000;

type Phase = "frame" | "rate" | "reveal";

/**
 * THE SITTING, ONTO THIS DEVICE (E18/S2, PM ruling RT-O2 a).
 *
 * CALLED BEFORE THE REVEAL RENDERS, and that ordering is load-bearing: the
 * expert panel reads the store rather than its props, and asks whether what it
 * finds there is the sitting on screen. Recording after the phase change would
 * leave the panel looking at an empty slot on the render that matters.
 *
 * ANSWERS ONLY. `recordResult` is the single `localStorage` write in this
 * codebase, and what goes into it is the ratings and the recognition flags.
 * Nothing computed goes near it, so this device can never report a figure the
 * current engine would not produce.
 *
 * AT MODULE SCOPE BECAUSE `Date.now()` IS IMPURE. Inside the component the
 * React compiler rejects the call outright — it cannot see that `rate` only
 * ever runs from a tap — and the alternatives were to thread a clock through
 * the component or to bury the write in a `setTimeout` the way the prestige
 * flow happens to. Hoisting it is the one that does not make the write
 * conditional on a timer nobody needs.
 */
function remember(ratings: Record<string, number>, recognised: readonly string[]): void {
  recordResult(
    "spread",
    SPREAD_POOL_VERSION,
    {
      kind: "spread",
      ratings: encodeSpreadRatings(ratings),
      recognised: encodeSpreadRecognised(recognised),
    },
    Date.now(),
  );
}

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
      const done = computeSpreadResult(next, recognised);
      setResult(done);
      // Before the reveal renders — see `remember` below.
      remember(next, recognised);
      /*
       * THE ONLY RECORD ANYONE BUT THIS BROWSER HAS. The write above stays on
       * the device and reaches nobody, so without these two events the
       * instrument is invisible in the funnel — an analyst would see people
       * leave the gym floor and never arrive anywhere. No rating and no clip id
       * is sent: the counts and the refusal reason are what make the funnel
       * readable, and they say nothing about which works anyone preferred.
       */
      track("spread_complete", {
        rated: done.usedClipIds.length,
        recognised: done.excludedClipIds.length,
        farPairs: done.far.count,
        closePairs: done.close.count,
        refusal: done.refusal,
      });
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
            {numberWordLeading(SPREAD_WORK_COUNT)} pieces of music, {numberWord(SPREAD_CLIP_SECONDS)} seconds
            each. Rate what you hear, and nothing else. A
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
          <p className="text-xs">
            About {numberWord(SPREAD_SESSION_MINUTES)} minutes of listening. Headphones help.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            track("spread_start", { works: SPREAD_POOL.length });
            setPhase("rate");
          }}
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

      {/*
        THE COMBINED VIEW, WHICH THIS INSTRUMENT WAS COUNTED BY AND NEVER
        CARRIED (E19/S7).

        `acrossLines` counts the Ranking Test as one of the instruments a device
        can hold, and `dossierLine` names the question it asked — so a listener
        who ran this and one other saw the combined view on the OTHER
        instrument's screen, naming this one, and never on this one. The layer
        was taught about the Ranking Test in E17 and the mount was never added.
        Nothing failed, because a block that is absent renders nothing.

        The gate is the block's own: it stays silent under two instruments, so
        somebody who has only sat this sees no change.
      */}
      <AcrossSessions
        accent={accent}
        own={{
          kind: "spread",
          ratings: encodeSpreadRatings(ratings),
          recognised: encodeSpreadRecognised(recognised),
        }}
      />

      {/*
        THE RAW RECORD, UNDER THE READING AND ABOVE THE EXITS (E18/S3). It reads
        the store rather than this component's state, and renders only when what
        it finds there is the sitting on screen — the same ownership rule the
        other three use, through the same function. Here that gate is nearly
        always satisfied, because there is no share link that could put somebody
        else's sitting on this page; it costs nothing to keep the rule uniform,
        and a share link is the kind of thing that gets added later.
      */}
      <ExpertPanel
        accent={accent}
        instrument={{ kind: "spread" }}
        own={{
          kind: "spread",
          ratings: encodeSpreadRatings(ratings),
          recognised: encodeSpreadRecognised(recognised),
        }}
      />

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
