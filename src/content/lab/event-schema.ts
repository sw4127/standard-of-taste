/**
 * THE EVENT SCHEMA, AND THE PATH FROM A TAP TO A STATISTIC (E15/S5, Track J1).
 *
 * THE SURFACES ARE DECLARED; THE EVENTS ARE NOT. Every event on the page comes
 * from `KNOWN_EVENTS`, which is the registry the code is held to in both
 * directions — an event emitted but unregistered fails, and an event registered
 * but emitted nowhere fails too. Listing forty-odd names again here would be a
 * third copy of that list, and `docs/ANALYTICS.md` has already demonstrated
 * where that ends: it documented 23 of 42 events while reading as complete.
 *
 * So a surface claims events by PREFIX or by name, and the check below is
 * EXHAUSTIVE IN BOTH DIRECTIONS: every registered event must be claimed by
 * exactly one surface. Add an event to the code and the build fails until the
 * page has somewhere to put it. Claim one twice and the build fails too, since
 * an event counted under two headings is double-counted.
 *
 * WHY EXACTLY ONE RATHER THAN FIRST-MATCH-WINS. First-match resolves ambiguity
 * silently by array order, which means a reordering could move an event between
 * headings with nothing failing. Refusing ambiguity outright is a weaker
 * convenience and a much stronger guarantee.
 *
 * THE LINEAGE IS THE HALF THAT ACTUALLY ANSWERS THE QUESTION. A list of events
 * says what is recorded; it does not say how a tap becomes a number a person
 * reads. Each row below follows one action all the way through — what you did,
 * which event marks it, where the answer is kept, which function scores it, and
 * which entry in the metric dictionary it ends up as. Every one of those five
 * is checked against the module that owns it.
 */

import { KNOWN_EVENTS } from "@/lib/events";
import { metric } from "./metrics";

/* ------------------------------------------------------------------ *
 * The surfaces
 * ------------------------------------------------------------------ */

export interface EventSurface {
  id: string;
  title: string;
  /** What this group of events is for. */
  blurb: string;
  /** Events whose name begins with any of these belong here. */
  prefixes?: string[];
  /** Events claimed by name, for those that share no prefix. */
  events?: string[];
}

export const EVENT_SURFACES: EventSurface[] = [
  {
    id: "site",
    title: "Site-wide",
    blurb: "Fires anywhere, including inside the gym.",
    events: ["landing_view", "client_error"],
  },
  {
    id: "prestige",
    title: "The Prestige Test",
    blurb:
      "The flagship instrument, and the only path whose every step already emits — which is why the funnel specification is written against it.",
    prefixes: ["bias_"],
    events: ["gym_machine_tap"],
  },
  {
    id: "delicacy",
    title: "The Delicacy Trials",
    blurb: "Same-moment A/B trials, each committed by a confidence tap.",
    prefixes: ["delicacy_"],
  },
  {
    id: "threshold",
    title: "The Threshold Test",
    blurb: "The adaptive staircase, which reports a sensitivity in physical units.",
    prefixes: ["threshold_"],
  },
  {
    id: "legacy",
    title: "The legacy funnel",
    blurb:
      "The music-taste quiz and its paywall, from before the taste-gym pivot. Kept emitting so the historical record stays readable rather than becoming a gap.",
    prefixes: ["quiz_", "fakedoor_"],
    events: [
      "result_view",
      "premise_view",
      "sharpen_read",
      "paywall_view",
      "checkout_start",
      "purchase",
      "paid_calibration",
    ],
  },
  {
    id: "world-cup",
    title: "The World Cup verdict",
    blurb: "The player-match card and its head-to-head comparison, also pre-pivot.",
    prefixes: ["fan_verdict_"],
    events: ["vs_view", "share_vs"],
  },
  {
    id: "share",
    title: "Share primitives",
    blurb: "Fired by the share buttons themselves, whichever surface they sit on.",
    events: ["share_native", "share_challenge", "share_download"],
  },
];

/** Every surface that claims this event. More than one is a defect. */
function claimants(event: string): EventSurface[] {
  return EVENT_SURFACES.filter(
    (s) =>
      (s.events?.includes(event) ?? false) ||
      (s.prefixes?.some((p) => event.startsWith(p)) ?? false),
  );
}

/** The events on one surface, in the registry's own order. */
export function eventsFor(surface: EventSurface): string[] {
  return Object.keys(KNOWN_EVENTS).filter((e) => claimants(e).includes(surface));
}

/** What the registry says fires this event. Never re-described here. */
export function eventTrigger(event: string): string {
  return KNOWN_EVENTS[event];
}

export const EVENT_COUNT = Object.keys(KNOWN_EVENTS).length;

/**
 * THE EVENTS THAT CARRY YOUR ACTUAL ANSWERS, not merely the fact that something
 * happened (E15/S5).
 *
 * WHY THIS IS DECLARED RATHER THAN DESCRIBED. The first draft of this page said
 * usage events "carry no answers and no result — only that something
 * happened". That is false, and it was false directly above a list in which
 * `bias_result` describes itself as "the interim D6 record, carrying the raw
 * ratings". A privacy claim, wrong, on the page whose entire job is to be right
 * about what is stored — found by reading the built page against its own table.
 *
 * It is not a leak and it is not being fixed by removing it: the self-generated
 * response dataset is the asset this project is deliberately building (memo
 * D6). What was wrong was the sentence, so the page now says which events carry
 * answers and marks them, and `event-schema.test.ts` reads the actual `track()`
 * call sites in BOTH directions — a declared event whose payload has no answers
 * fails, and an undeclared event whose payload has some fails too.
 */
export const ANSWER_CARRYING_EVENTS: string[] = ["bias_result", "delicacy_result"];

/** Payload keys that mean "this is what the person actually answered". */
export const ANSWER_PAYLOAD_KEYS = ["blind", "labeled", "picks", "answers", "responses"];

export function carriesAnswers(event: string): boolean {
  return ANSWER_CARRYING_EVENTS.includes(event);
}

// Exhaustive in both directions — see the docblock.
for (const event of Object.keys(KNOWN_EVENTS)) {
  const owners = claimants(event);
  if (owners.length === 0) {
    throw new Error(`event-schema: "${event}" is registered but belongs to no surface on the page`);
  }
  if (owners.length > 1) {
    throw new Error(
      `event-schema: "${event}" is claimed by ${owners.map((o) => o.id).join(" and ")} — ` +
        "an event counted under two headings is counted twice",
    );
  }
}
for (const surface of EVENT_SURFACES) {
  for (const event of surface.events ?? []) {
    if (!(event in KNOWN_EVENTS)) {
      throw new Error(`event-schema: "${surface.id}" claims "${event}", which nothing emits`);
    }
  }
}
for (const event of ANSWER_CARRYING_EVENTS) {
  if (!(event in KNOWN_EVENTS)) {
    throw new Error(`event-schema: "${event}" is marked as carrying answers but nothing emits it`);
  }
}

/* ------------------------------------------------------------------ *
 * From a tap to a statistic
 * ------------------------------------------------------------------ */

export interface LineageRow {
  /** What the person did, in their words. */
  action: string;
  /** The event that marks it. Must be registered. */
  event: string;
  /** Where the raw answer is kept — a key from the data model above. */
  storedAs: string;
  /** The function that turns answers into a number. */
  computedIn: string;
  /**
   * The dictionary entry it ends up as, or null where the output is not an
   * instrument statistic at all. Null REQUIRES `terminalNote`.
   */
  metricId: string | null;
  /** Required when `metricId` is null: what it produces instead, and why. */
  terminalNote?: string;
}

export const LINEAGE: LineageRow[] = [
  {
    action: "You rate a clip out of ten, having been told nothing about it.",
    event: "bias_blind_complete",
    storedAs: "gym.result.bias → payload.blind",
    computedIn: "src/engine/bias.ts",
    metricId: "sway_pct",
  },
  {
    action: "You rate the same clips again, this time with a name attached.",
    event: "bias_labeled_complete",
    storedAs: "gym.result.bias → payload.labeled",
    computedIn: "src/engine/bias.ts",
    metricId: "sway_share",
  },
  {
    action: "You choose which of two clips is the untouched one.",
    event: "delicacy_trial_complete",
    storedAs: "gym.result.delicacy → payload.picks",
    computedIn: "src/engine/delicacy.ts",
    metricId: "delicacy_accuracy",
  },
  {
    /*
     * THE SAME TAP, A SECOND STATISTIC. Worth showing rather than deduping:
     * one action feeding two independent measurements is the ordinary shape of
     * this kind of instrument, and a reader who assumes one event means one
     * number will misread every funnel they ever see.
     */
    action: "…and, in the same tap, how sure you were.",
    event: "delicacy_trial_complete",
    storedAs: "gym.result.delicacy → payload.picks",
    computedIn: "src/engine/calibration.ts",
    metricId: "brier",
  },
  {
    action: "You say whether you could hear the flaw, forty to eighty times.",
    event: "threshold_complete",
    storedAs: "gym.result.threshold.<ladder> → payload.answers, payload.seed",
    computedIn: "src/engine/threshold-fit.ts",
    metricId: null,
    terminalNote:
      "This one ends outside the dictionary, and deliberately. It produces a sensitivity in " +
      "physical units — cents of detune, milliseconds of smear, kbps — which is a fact about one " +
      "person on one evening, not a statistic describing the instrument. The dictionary holds the " +
      "second kind. On most sittings it declines to print a single number at all and reports a " +
      "band instead, because a point estimate from a noisy measurement is a claim the measurement " +
      "cannot support.",
  },
];

for (const row of LINEAGE) {
  if (!(row.event in KNOWN_EVENTS)) {
    throw new Error(`event-schema: lineage row "${row.action}" names unknown event "${row.event}"`);
  }
  if (row.metricId !== null) {
    metric(row.metricId); // throws on an unknown id
    if (row.terminalNote) {
      throw new Error(
        `event-schema: "${row.action}" ends at a real metric AND explains why it does not`,
      );
    }
  } else if (!row.terminalNote?.trim()) {
    throw new Error(
      `event-schema: "${row.action}" ends nowhere in the dictionary and does not say why`,
    );
  }
}
