"use client";

/**
 * SINCE LAST TIME — the retest arc, on your own result screen (E14/S5, Track H).
 *
 * The question Hume's *practice* criterion asks and this product has never been
 * able to answer: did your ear move. Everything behind it exists — the floors
 * measured in E14/S1, the comparison in S2, the sentences in S3, the recording
 * pin in S4 — and none of it was reachable by a person until this file.
 *
 * IT IS A SEPARATE PANEL FROM `AcrossSessions`, ON PURPOSE. That one answers
 * "what else has this device measured", across instruments, at one moment. This
 * one answers "what has this instrument measured, twice", across time. Folding
 * them together would put two different questions under one heading, which is
 * the thing `dossierLine` already refuses to do with three instruments.
 *
 * IT ALMOST ALWAYS SAYS "NO CHANGE YOU COULD HEAR", and that is the product
 * working rather than failing. A pitch threshold has to change by about three
 * and a half times before this instrument may call it movement (E14/S1). The
 * copy says so in the reader's own units, per PM ruling RT-H1 (a), because a
 * bare "no change" reads as a verdict on the person and the floor reads as a
 * fact about the instrument.
 *
 * SERVER RENDERING IS THE HARD PART, and the reasoning is `AcrossSessions`'s,
 * unchanged: `localStorage` does not exist on the server, so reading it during
 * render gives the server one answer and the browser another.
 * `useSyncExternalStore` takes a separate server snapshot so the two are
 * allowed to differ by design rather than by accident, and the snapshot is a
 * STRING because a fresh object every call is an infinite re-render.
 *
 * ONLY ON YOUR OWN RESULT, NEVER ON SOMEBODY ELSE'S. All three result routes
 * are share targets; see `isOwnResult` for the contradiction that shipped once
 * when a personal panel forgot this.
 */

import { useMemo, useSyncExternalStore } from "react";
import { slotSignature, subscribeResults, type StoredPayload } from "@/lib/result-store";
import { isOwnResult } from "@/lib/own-result";
import { recallBiasArc, recallDelicacyArc, recallThresholdArc } from "@/lib/arc-recall";
import { arcLines, ARC_DEVICE_NOTE } from "@/content/vocabulary/arc";
import type { Claim } from "@/engine/evidence";
import type { ArcReading } from "@/engine/arc";

/**
 * Only the slot this screen is about.
 *
 * `AcrossSessions` signs every slot because it reads every slot. This panel
 * compares one instrument with itself, so a session recorded on a DIFFERENT
 * machine must not make it recompute — the answer would be identical and the
 * work wasted.
 */
function signatureFor(own: StoredPayload): () => string {
  return () =>
    own.kind === "threshold" ? slotSignature("threshold", own.slug) : slotSignature(own.kind);
}

const serverSignature = () => "";

function claimFor(own: StoredPayload): Claim<ArcReading> {
  if (own.kind === "threshold") return recallThresholdArc(own.slug);
  if (own.kind === "bias") return recallBiasArc();
  return recallDelicacyArc();
}

export default function AcrossTime({ accent, own }: { accent: string; own: StoredPayload }) {
  const sig = useSyncExternalStore(subscribeResults, signatureFor(own), serverSignature);
  const claim = useMemo(
    () => (sig === "" || !isOwnResult(own) ? null : claimFor(own)),
    [sig, own],
  );

  if (!claim) return null;
  const lines = arcLines(claim);
  if (lines.length === 0) return null;

  /*
   * THE DELICACY TRIALS GET A LINE, NOT A PANEL (PM ruling RT-H2b a).
   *
   * The ruling was specific: this instrument is too coarse to show change — six
   * of fifteen pairs would have to change hands — so it says so and points at
   * the ladders, rather than shipping a panel whose only possible output is a
   * refusal. A panel that never says anything else trains people to skip
   * refusals everywhere else in the product, which is the opposite of what the
   * refusals are for.
   */
  if (!claim.ok && claim.gap === "arc-instrument-unsupported") {
    return (
      <p className="mt-6 w-full text-left text-xs leading-relaxed text-muted">{lines[0]}</p>
    );
  }

  return (
    <section className="mt-7 w-full rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left">
      <p className="text-[0.65rem] font-bold tracking-[0.3em]" style={{ color: accent }}>
        SINCE LAST TIME
      </p>
      <div className="mt-3 flex flex-col gap-3">
        {lines.map((line) => (
          <p key={line} className="text-sm leading-relaxed text-neutral-300">
            {line}
          </p>
        ))}
      </div>
      {/*
        DEVICE-LOCAL, AND IT SAYS SO. This panel is the product asserting it
        remembers a session you took weeks ago, which is the strongest such
        claim anywhere in it — so the limit is stated in the same place, not in
        a footnote on another page (RT-G b, and the disclosure guard).
      */}
      <p className="mt-4 text-[0.65rem] leading-relaxed text-muted">{ARC_DEVICE_NOTE}</p>
    </section>
  );
}
