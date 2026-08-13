"use client";

/**
 * Same-moment A/B comparison (PM ruling RT-34b + user-testing, 2026-08-08).
 *
 * THE PROBLEM THIS SOLVES, in the PM's words after four real runs: "I could not
 * hear any difference between the played tracks."
 *
 * The likeliest cause was not that the manipulations are too small — Layer A
 * measures them at 3x to 94x a manipulation nobody can hear — but that the
 * player forbade the only strategy that works. Pausing restarted the clip,
 * starting B reset A to zero, and each side demanded eight seconds. So a
 * listener could hear A from 0-8s and then B from 0-8s, and could NEVER hear
 * second twelve of A against second twelve of B. For pitch-drift that is close
 * to fatal: the drift PEAKS AT CLIP END, so the most audible moment is the one
 * the listening pattern reaches last and can never compare directly.
 *
 * HOW IT WORKS: both files play at once, in sync, with one muted. Switching
 * swaps which is audible — instantly, at the same instant of the music, with no
 * reload gap and no restart. That is how every serious listening-comparison
 * tool works, and it is the thing the instrument was accidentally preventing.
 * The pair is duration-matched by the render pipeline, so the two are aligned
 * by construction rather than by hope.
 *
 * WHY IT APPEARS ONLY AFTER THE REQUIRED LISTEN (PM ruling RT-34b): the
 * min-listen gate is what makes exposure comparable across respondents, and
 * unlimited switching from the start would destroy that. Measurement first,
 * then comparison — two phases rather than one compromise.
 */

import { useEffect, useRef, useState } from "react";

const ICE = "hsl(190 75% 62%)";

export default function AbCompare({
  srcA,
  srcB,
  onSwitch,
}: {
  srcA: string;
  srcB: string;
  /** Reported for the dataset: how hard this listener actually worked (D6). */
  onSwitch?: (switches: number) => void;
}) {
  const aRef = useRef<HTMLAudioElement | null>(null);
  const bRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [side, setSide] = useState<"a" | "b">("a");
  const [switches, setSwitches] = useState(0);
  const [failed, setFailed] = useState(false);
  const [pos, setPos] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const a = new Audio(srcA);
    const b = new Audio(srcB);
    a.preload = "auto";
    b.preload = "auto";
    b.muted = true;
    aRef.current = a;
    bRef.current = b;
    const onMeta = () => setDuration(a.duration || 0);
    a.addEventListener("loadedmetadata", onMeta);
    // A cached file can already have metadata by the time the listener is
    // attached, in which case the event never fires and `duration` stays 0 —
    // which silently freezes the progress bar at 0% for the whole clip. Read
    // it directly as well; this is a race the listener alone cannot win.
    if (a.readyState >= HTMLMediaElement.HAVE_METADATA) onMeta();

    // BOTH sides must be loadable before the control offers itself. Half a
    // comparison is worse than none: the listener would switch to a side that
    // never loaded, hear nothing, and conclude their ears are at fault.
    const READY = HTMLMediaElement.HAVE_FUTURE_DATA;
    const check = () => setReady(a.readyState >= READY && b.readyState >= READY);
    a.addEventListener("canplay", check);
    b.addEventListener("canplay", check);
    check();
    return () => {
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("canplay", check);
      b.removeEventListener("canplay", check);
      a.pause();
      b.pause();
      aRef.current = null;
      bRef.current = null;
    };
  }, [srcA, srcB]);

  /**
   * Position readout only. NOTHING SEEKS IN HERE — and that is the whole point.
   *
   * The first version resynced B to A's clock on every frame it drifted more
   * than 20 ms. Seeking a media element at 60 Hz keeps it permanently
   * re-seeking and it never produces sound, and because only B was ever the
   * one being seeked, the symptom was exactly what user testing reported: "A is
   * successfully played every time, B was not". The two streams start together
   * and are resynced once per switch, which is the only moment alignment
   * actually has to be right.
   */
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = () => {
      const el = side === "a" ? aRef.current : bRef.current;
      if (el) setPos(el.currentTime);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, side]);

  const start = async () => {
    const a = aRef.current;
    const b = bRef.current;
    if (!a || !b) return;
    b.currentTime = a.currentTime;
    // play() REJECTS under a browser's autoplay policy, and the first version
    // used allSettled and then set playing = true regardless — so the control
    // would show "Stop" with live A/B toggles while nothing was sounding. A UI
    // that lies about whether audio is playing is worse than one that refuses:
    // the listener concludes they cannot hear a difference that was never
    // played. Both sides must actually start, or the control says so.
    const [ra, rb] = await Promise.allSettled([a.play(), b.play()]);
    if (ra.status === "rejected" || rb.status === "rejected") {
      a.pause();
      b.pause();
      setFailed(true);
      setPlaying(false);
      return;
    }
    setFailed(false);
    setPlaying(true);
  };

  const stop = () => {
    aRef.current?.pause();
    bRef.current?.pause();
    setPlaying(false);
  };

  const swap = () => {
    const a = aRef.current;
    const b = bRef.current;
    if (!a || !b) return;
    const next = side === "a" ? "b" : "a";
    const incoming = next === "a" ? a : b;
    const outgoing = next === "a" ? b : a;

    // Resync ONLY when the two have genuinely drifted. A seek costs the
    // element a moment of silence while it re-buffers, so seeking on every
    // switch would reintroduce the exact fault this control exists to fix.
    // Both streams started together, so drift is normally single-digit ms.
    const drift = Math.abs(incoming.currentTime - outgoing.currentTime);
    if (drift > 0.15) incoming.currentTime = outgoing.currentTime;

    // Mute the outgoing side only AFTER the incoming one is audible, so a
    // switch can never land on a moment of silence from both.
    incoming.muted = false;
    outgoing.muted = true;
    setSide(next);
    setSwitches((n) => {
      const v = n + 1;
      onSwitch?.(v);
      return v;
    });
  };

  const pct = duration > 0 ? (pos / duration) * 100 : 0;

  return (
    <div className="mt-5 rounded-2xl border p-4" style={{ borderColor: "hsl(190 60% 55% / 0.35)", background: "rgba(255,255,255,0.03)" }}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className="text-[0.65rem] font-bold tracking-[0.3em]" style={{ color: ICE }}>
          COMPARE — SAME MOMENT
        </p>
        <p className="text-[11px] text-muted">
          {!ready
            ? "loading both clips"
            : failed
            ? "playback blocked"
            : switches === 0
              ? "switch as often as you like"
              : `${switches} switch${switches === 1 ? "" : "es"}`}
        </p>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-muted">
        Both clips run together — switching swaps which one you hear, at the same instant of the
        music. This is how a difference this small is actually found.
      </p>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => (playing ? stop() : void start())}
          disabled={!ready}
          aria-label={playing ? "Stop comparing" : "Start comparing"}
          className="shrink-0 rounded-full px-4 py-2 text-sm font-bold text-black transition active:scale-[0.97] disabled:opacity-40"
          style={{ background: ICE }}
        >
          {playing ? "Stop" : ready ? "Compare" : "Loading"}
        </button>

        <div className="flex flex-1 overflow-hidden rounded-full border border-white/15">
          {(["a", "b"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => side !== s && swap()}
              disabled={!playing}
              aria-label={`Hear ${s.toUpperCase()}`}
              aria-pressed={side === s}
              className="flex-1 py-2 text-sm font-bold transition disabled:opacity-40"
              style={
                side === s
                  ? { background: ICE, color: "black" }
                  : { background: "transparent", color: "rgba(255,255,255,0.7)" }
              }
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {failed && (
        <p className="mt-3 text-xs leading-relaxed" style={{ color: "hsl(0 70% 72%)" }}>
          Your browser blocked playback. Tap Compare again — a direct tap usually clears it. Until
          both clips are actually sounding, this control will not pretend they are.
        </p>
      )}

      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: ICE }} />
      </div>
    </div>
  );
}
