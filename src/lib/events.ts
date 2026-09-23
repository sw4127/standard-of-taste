/**
 * THE EVENT REGISTRY (E7/S13).
 *
 * `docs/ANALYTICS.md` calls itself the event dictionary and documents 23 of the
 * 42 events the code actually emits. Every Delicacy and Threshold event was
 * missing, along with all three instruments' share events — including
 * `threshold_share`, which the handoff flagged as "never verified firing".
 *
 * It was never one event's problem. Nothing related the emitted set to the
 * documented one, so the dictionary could fall behind by nineteen events while
 * reading as complete. An event that fires but is not written down is worse
 * than one that does not fire: it arrives in the data, gets counted, and nobody
 * can say what it meant.
 *
 * Each entry says WHEN it fires and where from. `events.test.ts` asserts the
 * relationship in BOTH directions — an event emitted but unregistered fails,
 * and an event registered but emitted nowhere fails too, because a dictionary
 * full of events that no longer exist is how you end up analysing a funnel step
 * that was deleted.
 */

export const KNOWN_EVENTS: Readonly<Record<string, string>> = {
  // --- site-wide ------------------------------------------------------------
  landing_view: "the homepage mounts",
  client_error: "a route error boundary catches — site-wide, including the gym",

  // --- Prestige Test (the flagship, and the D6 dataset) ----------------------
  bias_frame_view: "the Hume frame is shown on /bias",
  bias_start: "the blind pass begins",
  bias_session_restored: "an interrupted session is resumed from its saved ratings",
  bias_blind_complete: "the final blind rating is given and the pass ends",
  bias_labeled_complete: "the final labelled rating is given; the verdict is computed",
  bias_result: "the verdict is computed — the interim D6 record, carrying the raw ratings",
  bias_debrief_view: "the mandatory debrief is shown, disclosing the swapped labels",
  bias_share: "the share control is used on the reveal",
  bias_result_view: "/bias/result renders — the taker's own return or someone else's link",
  bias_locked_tier_tap: "a locked instrument is tapped from the gym floor",
  gym_machine_tap: "a reveal's onward card to another instrument is taken, carrying from and to",

  // --- Delicacy Trials ------------------------------------------------------
  delicacy_frame_view: "the Delicacy frame is shown",
  delicacy_start: "the practice trials are begun",
  delicacy_trial_complete: "one scored trial is committed by the confidence tap",
  delicacy_result: "all trials answered; the score is computed and banked",
  delicacy_share: "the share control is used on the reveal",
  delicacy_result_view: "/delicacy/result renders",

  // --- Threshold staircase --------------------------------------------------
  threshold_start: "a staircase session begins, carrying its family and source",
  threshold_complete: "the staircase converges and reports a threshold",
  threshold_share: "the share control is used on the threshold result",

  // --- Ranking Test (Track N) -----------------------------------------------
  spread_start: "the Ranking Test's frame is dismissed and listening begins",
  spread_complete: "all six works are rated and the two spreads are computed",

  // --- legacy funnel. Its pages were retired (RT-2 (2026-09-22) a); these are
  // still fired by components and API routes that remain in the codebase. -----
  sharpen_read: "the free-text sharpening step is used",
  checkout_start: "the unlock button starts a hosted checkout",
  purchase: "a purchase is confirmed on return",
  paid_calibration: "the paid report's calibration section renders",
  fakedoor_compat_click: "the compatibility fake-door is clicked (demand probe, ships nothing)",
  fakedoor_date_click: "the date-night fake-door is clicked (demand probe, ships nothing)",

  // --- share primitives, fired by the shared buttons themselves -------------
  share_download: "a card image is downloaded",
};

export function isKnownEvent(name: string): boolean {
  return Object.prototype.hasOwnProperty.call(KNOWN_EVENTS, name);
}
