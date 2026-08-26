/**
 * DOES THE MEASUREMENT REPLICATE? (E8/S8, 2026-08-27)
 *
 * THE ONE HONEST CROSS-INSTRUMENT CHECK THIS PRODUCT CAN MAKE, and it took a
 * measurement to find it. The obvious cross-instrument feature — "pitch is your
 * strength, compression your blind spot" — is not available: the families are
 * measured in incommensurable units (cents, ms, kbps), and the one shared
 * physical measure we already record (log-spectral distance) is dominated by
 * material noise, moving less across an entire pitch ladder than it does
 * between two recordings at the same rung. Any ranking built on it would say
 * the same thing about everybody.
 *
 * BUT TWO OF THE THREE FAMILIES ARE MEASURED BY BOTH INSTRUMENTS IN THE SAME
 * QUANTITY AT THE SAME VALUES (see `SHARED_AXIS_FAMILIES`):
 *
 *     pitch-drift      delicacy rungs 25 / 50 / 100 cents = staircase levels
 *     lossy-artifact   delicacy rungs 96 / 64 / 32 kbps   = staircase levels
 *
 * So a person who has run both has been measured TWICE on the same physical
 * axis, by two different procedures, on different recordings. Asking whether
 * those two agree needs no common scale, no cohort and no norms — it is the
 * question that makes a number worth believing, and it is the thing no quiz can
 * offer because no quiz measures the same thing twice.
 *
 * TIMING IS EXCLUDED and this is not squeamishness: delicacy varies tempo by a
 * PERCENTAGE and the staircase reports milliseconds of drift IQR. Different
 * quantities. The conversion depends on the clip's tempo and the shape of the
 * drift, and until it is measured a timing comparison would be a guess wearing
 * a unit.
 *
 * WHAT "AGREE" MEANS HERE, precisely. The staircase band says which rungs a
 * listener reliably catches and which they demonstrably miss. For each delicacy
 * trial in the same family, at a known physical value, the band therefore makes
 * a prediction — or declines to. Trials inside the band get NO prediction and
 * are counted separately rather than scored as either outcome; a band that
 * brackets the whole ladder predicts nothing, and must not be able to earn
 * agreement by saying nothing.
 */
import manifest from "@/content/delicacy/manifest.json";
import type { DegradationFamily, DelicacyResult } from "./delicacy";
import type { StaircaseResult } from "./staircase-session";
import { SHARED_AXIS_FAMILIES, type Claim } from "./evidence";

/**
 * family+magnitude -> the physical value of that delicacy rung.
 *
 * READ FROM THE MANIFEST, never retyped. The manifest is what the renderer
 * actually produced, and a hand-written copy of these nine numbers is exactly
 * the two-tables defect that has bitten the rung table, the window plan and the
 * damage field in this repo already.
 *
 * `param` arrives as a number for pitch and timing and as a bitrate STRING for
 * lossy ("96k"), because that is what ffmpeg was handed. Parsed once, here.
 */
const pairs = manifest as unknown as {
  pairs: Array<{ family: string; magnitude: number; param: number | string }>;
};

function physicalValue(param: number | string): number | null {
  if (typeof param === "number") return Number.isFinite(param) ? param : null;
  const m = /^(\d+(?:\.\d+)?)k?$/i.exec(param.trim());
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

export const RUNG_VALUE: Record<string, number> = (() => {
  const out: Record<string, number> = {};
  for (const p of pairs.pairs) {
    const v = physicalValue(p.param);
    if (v === null) continue;
    out[`${p.family}/${p.magnitude}`] = v;
  }
  return out;
})();

export type Prediction = "catch" | "miss";

export interface ReplicationTrial {
  /** The delicacy rung's physical value, in the family's own unit. */
  value: number;
  /** What the listener actually did on that delicacy trial. */
  caught: boolean;
  /** What the staircase band implies — null when the band is silent there. */
  predicted: Prediction | null;
}

export interface ReplicationCheck {
  family: DegradationFamily;
  unit: string;
  trials: ReplicationTrial[];
  agree: number;
  disagree: number;
  /** Trials the band made no prediction about. Never counted as agreement. */
  unpredicted: number;
  /**
   * True when the two instruments drew on different recordings, which they
   * always do for lossy. A bitrate threshold is a fact about the material as
   * well as the listener (RT-85a), so agreement across material is STRONGER
   * evidence and disagreement is weaker — it may be the recording, not the ear.
   */
  crossMaterial: boolean;
}

/**
 * Which way is harsher on this ladder.
 *
 * `direction: "up"` means a bigger number is more damage (cents, ms);
 * `"down"` means a smaller number is (kbps). Every comparison below goes
 * through this, so no call site has to remember which family inverts — the bug
 * that produced "somewhere between 160 kbps and 64 kbps" in the copy layer.
 */
function harsherThan(a: number, b: number, direction: "up" | "down"): boolean {
  return direction === "up" ? a >= b : a <= b;
}

/**
 * Compare one family's two measurements.
 *
 * Refuses when the family has no shared axis, when either instrument has no
 * data for it, or when the band resolved nothing — in which case there is no
 * prediction to test and the honest answer is silence, not a score of zero.
 */
export function replicationCheck(
  family: DegradationFamily,
  delicacy: DelicacyResult,
  threshold: StaircaseResult,
): Claim<ReplicationCheck> {
  if (!SHARED_AXIS_FAMILIES.includes(family)) return { ok: false, gap: "no-shared-axis" };
  if (threshold.family !== family) return { ok: false, gap: "no-shared-axis" };

  const { heardAt, missedAt } = threshold.band;
  if (heardAt === null && missedAt === null) return { ok: false, gap: "no-rung-resolved" };

  const receipts = delicacy.receipts.filter((r) => r.family === family);
  if (receipts.length === 0) return { ok: false, gap: "family-not-measured" };

  const trials: ReplicationTrial[] = [];
  for (const r of receipts) {
    const value = RUNG_VALUE[`${family}/${r.magnitude}`];
    if (value === undefined) continue;
    let predicted: Prediction | null = null;
    if (heardAt !== null && harsherThan(value, heardAt, threshold.direction)) predicted = "catch";
    else if (missedAt !== null && harsherThan(missedAt, value, threshold.direction)) predicted = "miss";
    trials.push({ value, caught: r.correct, predicted });
  }
  if (trials.length === 0) return { ok: false, gap: "family-not-measured" };

  let agree = 0;
  let disagree = 0;
  let unpredicted = 0;
  for (const t of trials) {
    if (t.predicted === null) unpredicted++;
    else if ((t.predicted === "catch") === t.caught) agree++;
    else disagree++;
  }
  if (agree + disagree === 0) return { ok: false, gap: "no-rung-resolved" };

  return {
    ok: true,
    value: {
      family,
      unit: threshold.unit,
      trials,
      agree,
      disagree,
      unpredicted,
      crossMaterial: family === "lossy-artifact",
    },
  };
}
