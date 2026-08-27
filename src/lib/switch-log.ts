/**
 * THE PER-TRIAL A/B SWITCH COUNT (E10/S3, Track F3).
 *
 * `AbCompare` reports how many times a listener flipped between the two clips
 * — how hard they actually worked at a comparison. The Threshold flow banks one
 * figure per trial and sends the series with `threshold_complete`, so it lines
 * up with the answer string trial-for-trial. Kept per trial rather than summed
 * because a listener who flipped fifteen times on one pair and once on the rest
 * is a different observation from one who flipped twice throughout, and a total
 * cannot tell them apart (E7/S14).
 *
 * WHY THIS IS A MODULE AND NOT TWO `useRef`s.
 *
 * It was two refs — `switches` for the trial in progress, `switchesPerTrial`
 * for the banked series — initialised at MOUNT. Nothing resets them when a
 * session starts, because today a session can only start once per mount: all
 * three flows are forward-only phase machines with no in-place restart. So the
 * defect is latent, and the standing entry for it says exactly that: "not
 * proven to reset on an in-place session restart".
 *
 * The reason to fix a latent defect rather than note it: the day someone adds
 * a "start again" button — the obvious thing to add to a result screen — the
 * second session inherits the first session's trials, and the symptom is a
 * dataset column that is quietly wrong for the people who took the test twice.
 * There is no screen that goes wrong. It is the same shape as the defect this
 * counter already had once, where the figure was collected on every trial and
 * discarded on every trial while every test stayed green.
 *
 * Making it a module means the reset is provable in node — this repository has
 * no DOM renderer in its test environment, so a behaviour left inside the
 * component can only ever be checked by reading its source. `bank()` also
 * makes the bank-before-reset ordering true by construction rather than by a
 * source-text check that the two statements appear in the right order.
 */
export interface SwitchLog {
  /** The count for the trial in progress, as `AbCompare` reports it. */
  observe(n: number): void;
  /** Bank the trial in progress and begin the next one at zero. */
  bank(): void;
  /** The banked series, in trial order, as the analytics payload wants it. */
  serialize(): string;
  /** The banked series itself. */
  banked(): readonly number[];
  /** Forget everything. A session's data begins when the session does. */
  reset(): void;
}

export function createSwitchLog(): SwitchLog {
  let current = 0;
  let perTrial: number[] = [];

  return {
    observe(n) {
      current = n;
    },
    bank() {
      perTrial.push(current);
      current = 0;
    },
    serialize() {
      return perTrial.join(",");
    },
    banked() {
      return perTrial;
    },
    reset() {
      current = 0;
      perTrial = [];
    },
  };
}
