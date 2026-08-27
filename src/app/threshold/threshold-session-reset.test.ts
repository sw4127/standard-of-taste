import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * E10/S3 (Track F3) — EVERY PIECE OF SESSION STATE IS CLASSIFIED.
 *
 * `switch-log.test.ts` proves the log resets. This proves the component
 * actually resets it, and — the part that matters more — that nothing NEW can
 * quietly join the component's state without someone deciding whether a session
 * start should clear it.
 *
 * WHY THAT SECOND HALF EXISTS. This repository has now shipped four defects
 * past a guard that was checking part of the room, most recently in E10/S1,
 * where a sweep reported "clean" while four instances of the very thing it
 * named sat in two files it could not see. A test that pinned only today's
 * three accumulators would be the same mistake in advance: correct on the day
 * it was written and silently narrow forever after. So the list is checked
 * against the component, in both directions — an accumulator that stops being
 * reset fails, and a declaration that appears in neither list fails.
 *
 * WHAT IT CANNOT PROVE: that a restart actually works, because no flow can
 * restart in place today and there is no DOM renderer in this test
 * environment. It proves the reset is wired and complete. The behaviour of the
 * thing being reset is proven in `switch-log.test.ts`.
 */

const FLOW = "src/app/threshold/ThresholdFlow.tsx";
const source = readFileSync(FLOW, "utf8");

/**
 * The start handler: everything the Start button does, from building the
 * session to entering the trial phase. Sliced from the source rather than
 * matched by a comment sentinel, so a comment edit cannot silently empty it.
 */
const START_ANCHOR = "const started = startSession(";
const START_END = 'setPhase("trial")';

function startHandler(): string {
  const a = source.indexOf(START_ANCHOR);
  const b = source.indexOf(START_END, a);
  expect(a, `${FLOW} no longer starts a session the way this test expects`).toBeGreaterThan(-1);
  expect(b, `${FLOW} no longer enters the trial phase from the start handler`).toBeGreaterThan(a);
  return source.slice(a, b);
}

/**
 * State that ACCUMULATES over a session. A session start must clear each of
 * these, or the next session inherits the last one's data.
 */
const RESET_AT_START: Record<string, string> = {
  // What the result and the share link recompute the threshold from. A stale
  // prefix here reports a number the session did not measure (N3).
  answers: 'setAnswers("")',
  // The per-trial A/B switch count — a D6 column, wrong with no visible symptom.
  // The declaration is `logRef`; the handler calls through the unwrapped `log`.
  logRef: "log.reset()",
  // Per-trial in normal use (cleared by `pick`), but a restart mid-trial would
  // carry an armed gate into a fresh session's first trial.
  armedA: "setArmedA(false)",
  armedB: "setArmedB(false)",
};

/**
 * State that a session start ASSIGNS rather than clears — it is given the new
 * session's own value in the same handler.
 */
const SET_AT_START = ["session", "phase"];

/**
 * State that is not per-session at all, each with the reason it is exempt.
 */
const NOT_PER_SESSION: Record<string, string> = {
  daysLeft:
    "the retest cooldown, read from localStorage through useSyncExternalStore; " +
    "it belongs to the device and the family, not to a session",
};

describe("the threshold flow classifies all of its session state", () => {
  it("every declaration is in exactly one list", () => {
    /*
     * BOTH DECLARATION FORMS. The first version of this regex matched only
     * `const x = useRef(...)` and found two of the six — every `useState` in
     * the file is destructured, `const [phase, setPhase] = useState(...)`.
     * The count assertion below is what caught it, which is the only reason
     * this test is not currently passing while checking a third of the state.
     */
    const declared = [
      ...source.matchAll(
        /const\s+(?:\[\s*(\w+)[^\]]*\]|(\w+))\s*=\s*use(?:State|Ref|SyncExternalStore)\b/g,
      ),
    ].map((m) => m[1] ?? m[2]);
    expect(declared.length, "found almost no state in the flow, so this proves nothing").toBeGreaterThan(
      4,
    );

    const classified = new Set([
      ...Object.keys(RESET_AT_START),
      ...SET_AT_START,
      ...Object.keys(NOT_PER_SESSION),
    ]);
    const unclassified = declared.filter((d) => !classified.has(d));
    expect(
      unclassified,
      "These are new pieces of state in ThresholdFlow that no one has decided about. " +
        "If a session start should clear it, add it to RESET_AT_START and reset it in " +
        "the start handler. If not, say why in NOT_PER_SESSION. An unclassified " +
        "accumulator is how the second session inherits the first one's data:\n" +
        unclassified.join("\n"),
    ).toEqual([]);

    // And the other direction: a list naming state that no longer exists is a
    // guard that has quietly stopped guarding.
    const set = new Set(declared);
    const stale = [...classified].filter((c) => !set.has(c));
    expect(stale, `these are classified but no longer declared in ${FLOW}`).toEqual([]);
  });

  it("the start handler clears every accumulator", () => {
    const handler = startHandler();
    // The exact clearing statement, not merely a mention of the name — a
    // handler that READS `answers` would satisfy a name check while clearing
    // nothing.
    const missing = Object.entries(RESET_AT_START)
      .filter(([, stmt]) => !handler.includes(stmt))
      .map(([name, stmt]) => `${name}: expected \`${stmt}\` in the start handler`);
    expect(
      missing,
      "The Start button does not clear these, so a session started in place would " +
        "inherit the previous session's data:\n" + missing.join("\n"),
    ).toEqual([]);
  });

  it("the start handler assigns the session's own identity", () => {
    const handler = startHandler();
    for (const name of SET_AT_START) {
      expect(handler, `the start handler no longer sets ${name}`).toContain(name);
    }
  });

  it("the slice is a real region of the file, not an empty string", () => {
    // If either anchor moved, `slice` could return something tiny and every
    // `includes` above would fail loudly — but an anchor pair that overlapped
    // could also return nearly the whole file and make them all pass. Pin the
    // size to a sane region.
    const handler = startHandler();
    expect(handler.length).toBeGreaterThan(120);
    expect(handler.length).toBeLessThan(source.length / 2);
  });
});

describe("the switch count still reaches the data", () => {
  /**
   * E7/S14's rule, carried forward. `collected-not-dropped.test.ts` checks the
   * wire at both ends for both flows; this checks that the threshold flow banks
   * through the log rather than by hand, which is what makes the ordering true
   * by construction.
   */
  it("the flow banks through the log and sends the serialized series", () => {
    expect(source, "the flow no longer banks per trial").toMatch(/\blog\.bank\(\)/);
    expect(source, "the flow no longer observes the switch count").toMatch(/\blog\.observe\(/);
    expect(source, "the banked series no longer reaches a track payload").toMatch(
      /switches:\s*log\.serialize\(\)/,
    );
  });
});
