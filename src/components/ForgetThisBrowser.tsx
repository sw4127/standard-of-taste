"use client";

/**
 * THE CLEAR CONTROL (E13/S4, Track G3, RT-G1 a).
 *
 * IT READS NOTHING. The obvious version tells you how many sessions are stored
 * before offering to delete them, and there are two reasons it does not. It
 * would need `localStorage` during render, which on a server-rendered page is
 * the hydration mismatch every other surface here uses `useSyncExternalStore`
 * to avoid — for a count nobody needs in order to decide. And a component that
 * reads the history would flip the predicate E13/S5 uses to hold the project
 * page's "retest arc" row to `planned`, which would make a public page claim a
 * feature this control is not.
 *
 * ASK, THEN ACT. Two taps, because the first one is destructive and
 * irreversible and there is no undo to offer. The sentence naming what goes is
 * on screen BEFORE the second tap, never after it.
 */

import { useState } from "react";
import { FORGET } from "@/content/forget";
import { forgetThisBrowser } from "@/lib/forget-device";

type Phase = "idle" | "asking" | "done";

export default function ForgetThisBrowser({ accent }: { accent?: string }) {
  const [phase, setPhase] = useState<Phase>("idle");

  if (phase === "done") {
    return (
      <p className="mt-4 text-xs leading-relaxed text-muted" role="status">
        {FORGET.done}
      </p>
    );
  }

  if (phase === "idle") {
    return (
      <button
        type="button"
        onClick={() => setPhase("asking")}
        className="mt-4 min-h-[44px] rounded-full border border-white/15 px-5 py-2.5 text-xs font-semibold text-muted transition hover:border-white/35 hover:text-white active:scale-[0.98]"
      >
        {FORGET.ask}
      </button>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-left">
      <p className="text-xs font-bold tracking-[0.25em]" style={accent ? { color: accent } : undefined}>
        {FORGET.heading.toUpperCase()}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-neutral-300">{FORGET.body}</p>
      <p className="mt-2 text-xs leading-relaxed text-muted">{FORGET.limit}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            forgetThisBrowser();
            setPhase("done");
          }}
          className="min-h-[44px] rounded-full border border-white/25 px-5 py-2.5 text-xs font-semibold text-white transition hover:border-white/50 active:scale-[0.98]"
        >
          {FORGET.confirm}
        </button>
        <button
          type="button"
          onClick={() => setPhase("idle")}
          className="min-h-[44px] rounded-full px-5 py-2.5 text-xs font-semibold text-muted transition hover:text-white active:scale-[0.98]"
        >
          {FORGET.cancel}
        </button>
      </div>
    </div>
  );
}
