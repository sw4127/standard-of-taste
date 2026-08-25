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

const ICE = "hsl(190 75% 62%)";

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

/** Good sense — whole-session numbers lead; bins only when they stand (S4 ruling). */
export function CalibrationBlock({ cal }: { cal: CalibrationResult }) {
  const showableBins = cal.bins.filter((b) => binDisplayPct(b) !== null);
  return (
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
  );
}
