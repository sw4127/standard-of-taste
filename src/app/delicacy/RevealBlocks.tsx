/**
 * The reveal blocks shared by the FLOW and the PERMALINK (E7/S10b, RT-142a).
 *
 * These lived inline in `DelicacyFlow`'s done screen, which meant two things:
 * they were unreachable without finishing eighteen gated trials, and a person
 * who shared their permalink and came back saw LESS than they had seen — their
 * own calibration read simply disappeared. The payload carries every number
 * needed to recompute them, so the omission was accidental rather than chosen.
 *
 * WHAT IS DELIBERATELY NOT HERE: the per-pair disclosure ("Pair 3: the original
 * was A, the flaw was pitch drift"). That is the ANSWER KEY. The result page's
 * own docblock has said from the start that it belongs to the taker's own run
 * and not to the share target, and it is right — a shared link that lists which
 * side was degraded hands the instrument's answers to the next person before
 * they have heard anything. It stays in the flow only.
 */
import type { DelicacyResult } from "@/engine/delicacy";
import { BRIER_COIN_FLIP, binDisplayPct, type CalibrationResult } from "@/engine/calibration";
import { calibrationLine, FLAW_LINE_PREFIX, flawTimesLabel } from "@/content/delicacy/copy";
import { creatorLines } from "@/content/vocabulary/delicacy";
import Jump from "@/components/Jump";
import { FLAWS_HREF, FLAWS_INVITE } from "@/content/flaw-families";
import { DELICACY_ICE } from "@/content/instrument-accents";

const ICE = DELICACY_ICE;

/** "And on the ones you caught, you named the flaw 3 of 5 times." */
export function FlawLine({ result }: { result: DelicacyResult }) {
  if (result.flawAccuracy === null) return null;
  return (
    <p className="mt-5 inline-block rounded-full border border-white/10 px-4 py-1.5 text-sm text-muted">
      {FLAW_LINE_PREFIX}{" "}
      <span className="font-semibold" style={{ color: ICE }}>
        {result.flawCorrect} of {result.flawEligible}
      </span>{" "}
      {flawTimesLabel(result.flawEligible)}.
    </p>
  );
}

/**
 * THE CREATOR TRANSLATION (E8/S5).
 *
 * Sits between the flaw line it interprets and the calibration block, because
 * the reading order is score -> what the score means against chance -> how often
 * you named the flaw -> WHAT NAMING BUYS YOU -> whether you knew when you knew.
 *
 * ITS SECOND SENTENCE IS A REFUSAL, and that is the substance rather than a
 * caveat: at five pairs a family the per-flaw split is noise 88.7-92.8% of the
 * time (measured, `src/content/vocabulary/delicacy.test.ts`), so the block says
 * why it will not break the result down instead of breaking it down with a
 * disclaimer underneath.
 *
 * ACCENT EYEBROW, where the measurement blocks on this page use a muted one.
 * That is the system, not a one-off: across both instruments the translation
 * layer wears the instrument's accent and the measurement blocks do not, so a
 * reader can tell "what we measured" from "what it means for you" at a glance.
 *
 * `text-left` explicitly. The permalink centres its whole column, and prose of
 * this length centred is unreadable — `detectionBody` already opts out the same
 * way, for the same reason.
 */
export function InYourWork({ result }: { result: DelicacyResult }) {
  const lines = creatorLines(result);
  if (lines.length === 0) return null;
  return (
    <section className="mt-8 w-full rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left">
      <p className="text-[0.65rem] font-bold tracking-[0.3em]" style={{ color: ICE }}>
        WHAT THIS MEANS IN YOUR WORK
      </p>
      <div className="mt-3 flex flex-col gap-3">
        {lines.map((line) => (
          <p key={line} className="text-sm leading-relaxed text-neutral-300">
            {line}
          </p>
        ))}
      </div>
      {/* E11/S5: all three families are scored here, so the reference is the
          long form of what this block says in a clause each. */}
      <Jump href={FLAWS_HREF} accent={ICE} className="mt-2">
        {FLAWS_INVITE}
      </Jump>
    </section>
  );
}

/** Good sense — whole-session numbers lead; bins only when they stand (S4 ruling). */
export function CalibrationBlock({ cal }: { cal: CalibrationResult }) {
  const showableBins = cal.bins.filter((b) => binDisplayPct(b) !== null);
  return (
    /*
     * `text-left` added E8/S5. Both surfaces that mount this block centre their
     * column, so every paragraph in here — the calibration verdict, the Brier
     * sentence, the per-level bins — was rendering centred. `detectionBody` opts
     * out the same way a few lines up, for the same reason: centred multi-line
     * prose is hard to read and the Design Quality Bar counts it under craft.
     * Found because the new translation block sits directly above this one and
     * the two alignments disagreed on screen.
     */
    <div className="mt-8 w-full rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left">
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
  );
}
