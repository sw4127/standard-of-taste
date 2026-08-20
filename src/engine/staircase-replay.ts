/**
 * REPLAYING A SESSION FROM ITS RAW ANSWERS (E5/S6).
 *
 * The whole engine is a pure function of (family, source, seed, answers), which
 * is a property the rest of `src/engine/` has and this module is what cashes it
 * in: a result can be reconstructed exactly from a short string, so a URL can
 * carry the RESPONSES rather than the CONCLUSION.
 *
 * WHY THAT MATTERS AND IS NOT MERELY TIDY. `/bias/result` already works this
 * way, for the reason spelled out there: a link that carries a verdict can be
 * edited into any verdict you like, and a link that carries the raw answers
 * recomputes to exactly one. Nobody can hand-craft a threshold they did not
 * measure. It also means the result screen is reachable for inspection without
 * sitting through fifty-two trials, which is the difference between a screen
 * that has been LOOKED AT and one that merely compiles.
 *
 * THE CODEC IS DELIBERATELY DUMB: one character per trial, `1` right and `0`
 * wrong, in order. It is short enough for a URL at 80 trials, it is readable in
 * a bug report, and it cannot silently mean something else after a refactor the
 * way a bit-packed integer can.
 */

import { answer, isFinished, startSession, type StaircaseSession } from "./staircase-session";

export const MAX_REPLAY_LENGTH = 200;

export function encodeResponses(session: StaircaseSession): string {
  return session.state.trials.map((t) => (t.correct ? "1" : "0")).join("");
}

/**
 * Rebuild a session. Throws on anything malformed rather than returning a
 * partial one — a truncated replay would render a real-looking result from
 * fewer answers than were given.
 */
export function replaySession(family: string, seed: number, responses: string, sourceId?: string): StaircaseSession {
  if (!Number.isInteger(seed) || seed < 0) throw new Error(`replaySession: seed must be a non-negative integer`);
  if (responses.length > MAX_REPLAY_LENGTH) {
    throw new Error(`replaySession: ${responses.length} responses exceeds the ${MAX_REPLAY_LENGTH} cap`);
  }
  if (!/^[01]*$/.test(responses)) throw new Error(`replaySession: responses must be 0s and 1s`);

  let session = startSession(family, seed, sourceId);
  for (const ch of responses) {
    if (isFinished(session)) {
      // More answers than the session could have asked for. Silently ignoring
      // them would mean two different strings render the same result, which is
      // exactly the ambiguity the raw-response design exists to remove.
      throw new Error("replaySession: more responses than this session has trials");
    }
    session = answer(session, ch === "1");
  }
  return session;
}
