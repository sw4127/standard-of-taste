/**
 * THE READING PAGE'S COPY (blueprint Part 5; BA-6, BA-8, BA-11).
 *
 * Every sentence the `/reading` flow shows, outside the lines themselves, lives
 * here so the copy deck and the guards can read it: prose written into JSX is
 * outside both. NOT YET THROUGH A WRITING PASS — listed in the handoff.
 *
 * THE HOST IS FICTIONAL (BA-9). "Tessavox" was chosen after the brief's
 * starting name, Marrowtone, turned out to belong to a real corporation; the
 * search is recorded in `docs/reading-names-check-2026-09-23.md`.
 */
import { LISTENER_LABEL } from "./listeners";

export { LISTENER_LABEL };

export const HOST_NAME = "Tessavox";

export const READING_KICKER = "THE READING";
// serves BP-UNMET (docs/blueprint.md): readable, arguable.
export const READING_TITLE = "What a month of listening says, in words you can argue with.";

export const PICK_HEADING = "Pick a listener.";
export const PICK_LINE =
  "Each is four weeks of plays by someone who does not exist. Read one as if the plays were yours. " +
  "Every line below is computed from those plays, and every line shows the plays it counted.";

/** A listener card's one factual line: counts only, derived from the plays. */
export function listenerFacts(plays: number, tracks: number): string {
  return `${plays} plays · ${tracks} tracks · four weeks`;
}

export const READ_LEAD =
  "Each line names a pattern in the plays and offers two things it might mean. Keep a line or reject it; " +
  "pick the reading that fits, or neither.";

export const SHOW_PLAYS = "Show the plays";
export const HIDE_PLAYS = "Hide the plays";
export const OFFER_LEAD = "What might it mean?";
export const REJECT_LINE = "This isn't right";
export const REJECTED_NOTE = "Rejected. It is out of your prompt.";
export const RESTORE_LINE = "Put it back";
export const SKIPPED_MARK = "abandoned inside 30 s";
export const KEPT_MARK = "kept past 30 s";

export const TO_PROMPT = "Turn what you kept into a prompt";
export const OTHER_LISTENER = "Read another listener";

export const PROMPT_HEADING = "Your prompt";
export const PROMPT_NOTE =
  "Built only from the lines you kept and the readings you chose. Change either above and this changes.";
export const PROMPT_EMPTY =
  "You rejected every line, so there is nothing left to make a prompt from. Put one back.";
export const COPY_PROMPT = "Copy";
export const COPIED_PROMPT = "Copied";

/** BP-BRIDGE: what the hearing tests say about each family's words. */
export const BRIDGE_HEADING = "Which of these words can you hear?";
export const BRIDGE_CAN_HEAR = "you can hear this";
export const BRIDGE_MAY_NOT = "at your threshold you may not tell";
export const BRIDGE_TUNE = "Tune these with the hearing tests";
/** Where the marks above come from (device-local-disclosure.test.ts). */
export const BRIDGE_DEVICE_NOTE =
  "Any mark here is read from a Threshold sitting stored in this browser. There is no account; " +
  "on another device, or after clearing site data, the marks are gone.";
export const BRIDGE_LINE =
  "Tuning, timing and dynamics are the three things the hearing tests measure. " +
  "A word for a difference you cannot hear is a word the generator can ignore without you noticing.";

export const TO_CREATE = `Paste it into ${HOST_NAME}`;

export const CREATE_LABEL = `Illustrative. ${HOST_NAME} is a fictional company, and this is a mock of its creation screen.`;
export const CREATE_HEADING = "New track";
export const CREATE_FIELD = "Describe the track";
export const GENERATE = "Generate";
export const GENERATE_NOTE = "Illustrative. No audio is generated.";
export const BACK_TO_READING = "Back to the reading";

export const WHY_HEADING = "Why this works, and where it might not";
export const WHY_LEAD =
  "The reading rests on an argument. Here it is in full, each step labelled with what supports it.";

/**
 * What a link to the front door says when it is pasted somewhere: the homepage's
 * og:description and the default preview image (`src/app/opengraph-image.tsx`).
 * Moved here from `page.tsx`'s metadata, unchanged, so the two cannot drift.
 * LAST IN THE FILE on purpose: deck ids are numbered by position, and adding
 * it higher up renumbered ten ids a writing pass may already cite.
 */
export const READING_SHARE_LINE =
  "A reading of a listener's recent plays, in lines you can check, argue with, and carry into a prompt.";
