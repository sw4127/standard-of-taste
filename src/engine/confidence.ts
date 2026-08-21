/**
 * ONE CONFIDENCE LEVEL, FOR EVERY INTERVAL THIS PRODUCT PRINTS (E6/S14).
 *
 * WHY THIS FILE EXISTS. The number 1.96 was written out three times — in
 * `staircase.ts` for the threshold interval, in `delicacy.ts` for the Wilson
 * band, and implicitly a fourth time as the words "95% confidence" typed by
 * hand into two copy decks. Four copies of one decision, and only the two in
 * code would move if anyone changed it. The prose would keep saying 95% while
 * the arithmetic said something else, and nothing would fail.
 *
 * That is the same defect as the delicacy card's "a coin flip calls 3": a
 * number that was true when it was typed, in a place nothing checks against the
 * thing it describes. It has now shipped in this repo at the rung table, the
 * window plan, the damage field, the card, and here.
 *
 * SO THE LEVEL IS THE SOURCE AND THE MULTIPLIER IS DERIVED FROM IT — not the
 * other way round. A reader of the result screen is told a percentage; the z is
 * an implementation detail of delivering it. Deriving z from the level means
 * changing the level changes both the interval and the sentence, together.
 */

/** The confidence level every published interval uses, as a percentage. */
export const CONFIDENCE_PCT = 95;

/**
 * The two-sided normal quantile for `CONFIDENCE_PCT`, computed rather than
 * looked up, so the pair cannot drift.
 *
 * Acklam's inverse-normal approximation. Accurate to ~1.15e-9 across the whole
 * range, which is eleven digits better than anything this product reports and
 * cheap enough to run at module load. The alternative — a table of z values
 * beside a table of percentages — is exactly the two-tables defect this file
 * was created to remove.
 */
function normalQuantile(p: number): number {
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
  const pLow = 0.02425;
  let q: number, r: number;
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p <= 1 - pLow) {
    q = p - 0.5;
    r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }
  q = Math.sqrt(-2 * Math.log(1 - p));
  return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
}

/** The multiplier a two-sided `CONFIDENCE_PCT` interval needs. 1.959964 at 95. */
export const CONFIDENCE_Z = normalQuantile(1 - (1 - CONFIDENCE_PCT / 100) / 2);

/** The level as it appears in a sentence, so no deck types the number itself. */
export const CONFIDENCE_LABEL = `${CONFIDENCE_PCT}% confidence`;
