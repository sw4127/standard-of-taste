"use client";

/**
 * THE COMBINED VIEW, ON EVERY RESULT SCREEN (E8/S8, RT-A(c)).
 *
 * IT RENDERS NOTHING UNTIL TWO INSTRUMENTS HAVE RUN, which is the whole reason
 * the PM allowed both halves of RT-A. The per-instrument paragraph is always
 * there; this appears only when there is something true that no single screen
 * could say — a second question answered, a replication, a gap in coverage.
 *
 * SERVER RENDERING IS THE HARD PART, and this component is mounted inside
 * server-rendered pages. `localStorage` does not exist there, so reading it
 * during render gives the server one answer and the browser another — a
 * hydration mismatch, and here a worse one than usual: the server would ship
 * markup describing sessions it cannot see. `useSyncExternalStore` exists for
 * exactly this and takes a separate server snapshot, so the two are allowed to
 * differ by design rather than by accident. Same reasoning, same hook, as the
 * retest cooldown in `ThresholdFlow`.
 *
 * THE SNAPSHOT IS A STRING, NOT THE DATA. `useSyncExternalStore` re-renders
 * forever unless the snapshot is referentially stable between calls, so it
 * cannot be the recalled results — a fresh object every call is an infinite
 * loop. The signature changes exactly when something was stored, and the
 * recompute hangs off it.
 */

import { useMemo, useSyncExternalStore } from "react";
import { readResult, slotSignature, subscribeResults, type StoredPayload } from "@/lib/result-store";
import ForgetThisBrowser from "./ForgetThisBrowser";
import { POOL_VERSIONS, recallBias, recallDelicacy, recallThreshold } from "@/lib/result-recall";
import { replicationCheck } from "@/engine/replication";
import type { ReplicationCheck } from "@/engine/replication";
import type { DegradationFamily } from "@/engine/delicacy";
import { SHARED_AXIS_FAMILIES } from "@/engine/evidence";
import { acrossLines, instrumentCount, thresholdRoster, type AcrossInput } from "@/content/vocabulary/across";
import { THRESHOLD_SLUGS, familyForSlug } from "@/app/threshold/families";

/**
 * A cheap, stable description of what is stored. Recomputing the whole dossier
 * on every snapshot call would be both slow and unstable; this asks the store
 * for a primitive per slot.
 *
 * IT USED TO SPELL THE KEYS OUT HERE and compare byte lengths, which was a
 * fourth copy of the key format and stopped being a sound change signal when a
 * slot became a capped list (see `slotSignature`).
 */
function signature(): string {
  return [
    slotSignature("bias"),
    slotSignature("delicacy"),
    ...THRESHOLD_SLUGS.map((s) => slotSignature("threshold", s)),
  ].join(".");
}

/** The server has no storage, and says so rather than guessing. */
function serverSignature(): string {
  return "";
}

function buildInput(): AcrossInput {
  const bias = recallBias()?.result ?? null;
  const delicacy = recallDelicacy()?.result ?? null;

  const thresholds = THRESHOLD_SLUGS.map((slug) => recallThreshold(slug)?.result ?? null).filter(
    (r): r is NonNullable<typeof r> => r !== null,
  );

  /*
   * Replications are computed here rather than stored, for the same reason the
   * store holds answers instead of results: a cached agreement count would go
   * stale the moment either engine changed, and would then contradict the very
   * numbers it claims to reconcile.
   */
  const replications: ReplicationCheck[] = [];
  if (delicacy) {
    for (const t of thresholds) {
      if (!SHARED_AXIS_FAMILIES.includes(t.family as DegradationFamily)) continue;
      const check = replicationCheck(t.family as DegradationFamily, delicacy, t);
      if (check.ok) replications.push(check.value);
    }
  }

  const measured = new Set(thresholds.map((t) => t.family));
  const unmeasured = THRESHOLD_SLUGS.map((s) => familyForSlug(s))
    .filter((f): f is string => f !== null)
    .filter((f) => !measured.has(f));

  return { bias, delicacy, thresholds, replications, unmeasured };
}

/**
 * ONLY ON YOUR OWN RESULT, NEVER ON SOMEBODY ELSE'S (E8/S8, found by rendering).
 *
 * All three result routes are SHARE TARGETS: `/bias/result`, `/delicacy/result`
 * and `/threshold/[slug]/result` recompute from a payload in the URL, and that
 * payload belongs to whoever posted the link. Without this check the page put
 * the VIEWER's stored sessions under the SHARER's number — and on the threshold
 * screen it rendered the contradiction in plain sight: a wide band reading "no
 * reading · somewhere between 8.8 and 100 cents" at the top, and "Pitch drift:
 * caught at 3.1 cents" in the roster underneath. Same family, two numbers, no
 * explanation, because they were two different people's sessions.
 *
 * So the block appears only when the result being displayed IS the one this
 * device recorded. The comparison is on the raw payload — the same bytes the
 * store holds and the URL carries — so it cannot be fooled by a recomputation
 * that happens to agree.
 */
function isOwnResult(own: StoredPayload): boolean {
  const stored =
    own.kind === "bias"
      ? readResult("bias", POOL_VERSIONS.bias)
      : own.kind === "delicacy"
        ? readResult("delicacy", POOL_VERSIONS.delicacy)
        : readResult("threshold", POOL_VERSIONS.threshold, own.slug);
  if (!stored) return false;
  return JSON.stringify(stored.payload) === JSON.stringify(own);
}

export default function AcrossSessions({ accent, own }: { accent: string; own: StoredPayload }) {
  const sig = useSyncExternalStore(subscribeResults, signature, serverSignature);
  // Keyed on the signature so it recomputes when — and only when — a session is
  // recorded, including one recorded in another tab.
  const input = useMemo(() => (sig === "" || !isOwnResult(own) ? null : buildInput()), [sig, own]);

  if (!input || instrumentCount(input) < 2) return null;
  const lines = acrossLines(input);
  if (lines.length === 0) return null;
  const roster = thresholdRoster(input);

  return (
    <section className="mt-7 w-full rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left">
      <p className="text-[0.65rem] font-bold tracking-[0.3em]" style={{ color: accent }}>
        ACROSS YOUR SESSIONS
      </p>
      <div className="mt-3 flex flex-col gap-3">
        {lines.map((line) => (
          <p key={line} className="text-sm leading-relaxed text-neutral-300">
            {line}
          </p>
        ))}
      </div>
      {roster.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-1.5 border-t border-white/10 pt-4">
          {roster.map((entry) => (
            <li key={entry} className="text-xs leading-relaxed text-muted">
              {entry}
            </li>
          ))}
        </ul>
      ) : null}
      {/*
        DEVICE-LOCAL, AND IT SAYS SO. Everything above is read from this
        browser, so a person on a second device sees nothing and must not be
        left wondering what happened to their sessions. Same standing as the
        retest cooldown, and the same honesty about what that buys (N3).
      */}
      <p className="mt-4 text-[0.65rem] leading-relaxed text-muted">
        Read from this browser only — there are no accounts, so another device starts empty.
      </p>
      {/* AND A WAY OUT, IN THE SAME PLACE AS THE ADMISSION (E13/S4, Track G3).
          This block is where the product shows what it remembers about you, so
          it is where ending that is offered. The privacy page carries the same
          control for anyone who has not got two instruments on file yet. */}
      <ForgetThisBrowser accent={accent} />
    </section>
  );
}
