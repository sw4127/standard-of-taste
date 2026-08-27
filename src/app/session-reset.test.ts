import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * E10/S9 — EVERY FLOW CLASSIFIES ITS SESSION STATE, NOT JUST ONE.
 *
 * E10/S3 fixed this in the Threshold flow and its guard covered that file
 * alone, while the Prestige and Delicacy flows carried the identical latent
 * defect: accumulators initialised at MOUNT and never reset, correct only
 * because all three flows are forward-only and a session can start once per
 * mount. The day a result screen grows a "start again" button — the obvious
 * thing to add there — the second session inherits the first one's data.
 *
 * A guard scoped to one of three files is the shape this repository has now
 * shipped six defects past. So this replaces `threshold-session-reset.test.ts`
 * and covers all three.
 *
 * WHAT IT PROVES: that each flow's start handler clears every accumulator, and
 * that no piece of state exists in these components that nobody has classified.
 * WHAT IT CANNOT: that a restart works, because none of the flows can restart
 * in place today and this repository has no DOM renderer in its test
 * environment. The reset behaviour of the one accumulator that was extracted
 * into a module is proven in `switch-log.test.ts`.
 */

type Flow = {
  file: string;
  /** Everything the Start button does, sliced between these two anchors. */
  startAnchor: string;
  startEnd: string;
  /** Accumulates over a session -> declaration name mapped to its reset statement. */
  resetAtStart: Record<string, string>;
  /** Assigned its new value at start rather than cleared. */
  setAtStart: string[];
  /** Not per-session at all, with the reason it is exempt. */
  notPerSession: Record<string, string>;
};

const FLOWS: Flow[] = [
  {
    file: "src/app/bias/BiasFlow.tsx",
    startAnchor: 'track("bias_start"',
    startEnd: 'setPhase("blind")',
    resetAtStart: {
      // The measurement itself. A stale pair reports a sway this session did
      // not measure (N3).
      blind: "setBlind({})",
      labeled: "setLabeled({})",
      idx: "setIdx(0)",
      played: "setPlayed(false)",
      picked: "setPicked(null)",
      result: "setResult(null)",
      // D6 columns: per-clip heard milliseconds.
      listenMs: "listenMs.current = { blind: {}, labeled: {} }",
      // A pending beat-lock timeout would fire into the new session.
      timer: "clearTimeout(timer.current)",
    },
    setAtStart: ["phase"],
    notPerSession: {
      noted:
        "belongs to LockedTierButton, a separate component further down the same " +
        "file, with its own mount lifecycle — it records that this visitor tapped " +
        "the locked-tier button, not anything about the session's measurement. " +
        "Classified rather than hidden: narrowing the scan to the flow component " +
        "would make the sweep miss any future accumulator that a sub-component " +
        "happened to own, which is the failure this whole file is about.",
    },
  },
  {
    file: "src/app/delicacy/DelicacyFlow.tsx",
    startAnchor: 'track("delicacy_start"',
    startEnd: 'setPhase("practice")',
    resetAtStart: {
      responses: "setResponses({})",
      result: "setResult(null)",
      idx: "setIdx(0)",
      step: 'setStep("listen")',
      armedA: "setArmedA(false)",
      armedB: "setArmedB(false)",
      pickedSide: "setPickedSide(null)",
      flawPick: "setFlawPick(null)",
      confPick: "setConfPick(null)",
      practiceIdx: "setPracticeIdx(0)",
      practicePick: "setPracticePick(null)",
      switches: "switches.current = {}",
      listenMs: "listenMs.current = { a: {}, b: {} }",
      timer: "clearTimeout(timer.current)",
    },
    setAtStart: ["phase"],
    notPerSession: {},
  },
  {
    file: "src/app/threshold/ThresholdFlow.tsx",
    startAnchor: "const started = startSession(",
    startEnd: 'setPhase("trial")',
    resetAtStart: {
      // What the result and the share link recompute the threshold FROM.
      answers: 'setAnswers("")',
      // Declared as `logRef`; the handler calls through the unwrapped `log`.
      logRef: "log.reset()",
      armedA: "setArmedA(false)",
      armedB: "setArmedB(false)",
    },
    setAtStart: ["session", "phase"],
    notPerSession: {
      daysLeft:
        "the retest cooldown, read from localStorage through useSyncExternalStore; " +
        "it belongs to the device and the family, not to a session",
    },
  },
];

/** Both declaration forms: `const [x, setX] = useState(...)` and `const x = useRef(...)`. */
const DECL = /const\s+(?:\[\s*(\w+)[^\]]*\]|(\w+))\s*=\s*use(?:State|Ref|SyncExternalStore)\b/g;

for (const flow of FLOWS) {
  describe(`${flow.file} classifies all of its session state`, () => {
    const source = readFileSync(flow.file, "utf8");

    function startHandler(): string {
      const a = source.indexOf(flow.startAnchor);
      const b = source.indexOf(flow.startEnd, a);
      expect(a, `${flow.file}: start anchor "${flow.startAnchor}" is gone`).toBeGreaterThan(-1);
      expect(b, `${flow.file}: start end "${flow.startEnd}" no longer follows the anchor`).toBeGreaterThan(a);
      // The resets sit BEFORE the anchor in two of three flows, so take a
      // generous window backwards from it and forwards to the phase change.
      const from = Math.max(0, source.lastIndexOf("onClick={() => {", a));
      return source.slice(from, b + flow.startEnd.length);
    }

    it("every declaration is in exactly one list", () => {
      const declared = [...source.matchAll(DECL)].map((m) => m[1] ?? m[2]);
      expect(
        declared.length,
        `${flow.file}: found almost no state, so this proves nothing`,
      ).toBeGreaterThan(3);

      const classified = new Set([
        ...Object.keys(flow.resetAtStart),
        ...flow.setAtStart,
        ...Object.keys(flow.notPerSession),
      ]);
      const unclassified = declared.filter((d) => !classified.has(d));
      expect(
        unclassified,
        `${flow.file}: new state that nobody has decided about. If a session start should ` +
          "clear it, add it to resetAtStart AND reset it in the start handler. If not, say " +
          "why in notPerSession. An unclassified accumulator is how the second session " +
          "inherits the first one's data:\n" + unclassified.join("\n"),
      ).toEqual([]);

      // A list naming state that no longer exists is a guard that has quietly
      // stopped guarding.
      const set = new Set(declared);
      const stale = [...classified].filter((c) => !set.has(c));
      expect(stale, `${flow.file}: classified but no longer declared`).toEqual([]);
    });

    it("the start handler clears every accumulator", () => {
      const handler = startHandler();
      // The exact clearing statement, not merely a mention of the name — a
      // handler that READS a value would satisfy a name check while clearing
      // nothing.
      const missing = Object.entries(flow.resetAtStart)
        .filter(([, stmt]) => !handler.includes(stmt))
        .map(([name, stmt]) => `${name}: expected \`${stmt}\``);
      expect(
        missing,
        `${flow.file}: the Start button does not clear these, so a session started in ` +
          "place would inherit the previous session's data:\n" + missing.join("\n"),
      ).toEqual([]);
    });

    it("the start handler assigns the session's own identity", () => {
      const handler = startHandler();
      for (const name of flow.setAtStart) {
        /*
         * THE SETTER CALL, NOT THE BARE NAME. The first version checked for the
         * word "phase" and the Threshold flow passed on the phrase "forward-only
         * phase machine" inside a comment I had written in E10/S3 — a check
         * satisfied by prose is not a check.
         */
        const setter = `set${name[0].toUpperCase()}${name.slice(1)}(`;
        expect(
          handler.includes(setter),
          `${flow.file}: the start handler no longer calls ${setter}`,
        ).toBe(true);
      }
    });

    it("the sliced handler is a real region, not the whole file", () => {
      const handler = startHandler();
      expect(handler.length, `${flow.file}: handler slice looks empty`).toBeGreaterThan(80);
      expect(
        handler.length,
        `${flow.file}: handler slice swallowed the file, so every check above passes trivially`,
      ).toBeLessThan(source.length / 2);
    });
  });
}

describe("the reset discipline covers every flow, not a favourite one", () => {
  it("names all three instruments", () => {
    /*
     * The scope assertion for this file itself. E10/S3 guarded one flow and
     * left two carrying the same defect; if a fourth instrument ships, this
     * fails until someone decides what its session state is.
     */
    const files = FLOWS.map((f) => f.file).sort();
    expect(files).toEqual(
      [
        "src/app/bias/BiasFlow.tsx",
        "src/app/delicacy/DelicacyFlow.tsx",
        "src/app/threshold/ThresholdFlow.tsx",
      ].sort(),
    );
  });
});
