/**
 * THE COPY FOR FORGETTING THIS BROWSER (E13/S4, Track G3, RT-G1 a).
 *
 * It lives here rather than in the component for the reason `staircase/copy.ts`
 * gives about the cooldown: a fragment written in JSX is a fragment outside the
 * voice gate, which is how two card lines shipped unchecked. Registered in the
 * deck under the `forget` surface prefix.
 *
 * IT SAYS WHAT GOES BEFORE IT GOES. A destructive control that explains itself
 * only afterwards is a trap, and this one is deliberately not a single-tap
 * action: the button asks, the sentence answers, and the second tap does it.
 *
 * IT ALSO SAYS WHAT IT CANNOT REACH. Clearing a browser does not recall a usage
 * event already sent, and claiming otherwise would be exactly the unsupportable
 * promise N3 exists to refuse. The limit sits in the same block as the offer,
 * not in a footnote somebody scrolls past.
 */

export const FORGET = {
  heading: "Forget this browser",

  /**
   * Names every family the sweep removes, in the order a person would think of
   * them. A guard checks that this sentence still names each one — a control
   * that quietly grew a fourth thing to delete would be taking something the
   * person never agreed to lose.
   */
  body:
    "This removes everything the gym has kept in this browser: the sessions you have finished and " +
    "the answers behind them, the seven-day retest gate that goes with them, and the in-flight " +
    "state of anything open right now.",

  limit:
    "It cannot undo usage events already sent to our analytics, and it changes nothing in any " +
    "other browser — there was never an account to change.",

  ask: "Forget this browser",
  confirm: "Yes, forget it",
  cancel: "Keep it",

  /**
   * Past tense and specific. "Done" would leave a person wondering what was
   * done; this says what is now true.
   */
  done: "Cleared. Nothing measured on this browser is left, and the gym has never met you.",
} as const;
