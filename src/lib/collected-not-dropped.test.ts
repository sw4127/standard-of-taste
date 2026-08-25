import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

/**
 * E7/S14 — DATA THAT IS COLLECTED MUST BE RECORDED.
 *
 * `AbCompare` counts how many times a listener switches between the two clips
 * — how hard they actually worked at the comparison. Both flows wired
 * `onSwitch`, both stored the count, and NEITHER ever sent it anywhere.
 *
 * The Threshold flow was worse than idle: it reset the counter to zero on every
 * answer, so by completion the ref held the last trial's number and nothing had
 * ever read even that. The Delicacy flow kept a full per-trial map and dropped
 * it on the floor at the end. Its own comment called the figure "a usability
 * signal (D6)".
 *
 * This is a quiet failure with no symptom. The UI works, the tests pass, the
 * events fire — and the dataset that is supposed to be the proprietary asset
 * (D6) is missing a column nobody notices is absent, for as long as the feature
 * exists. There is no screen that goes wrong.
 *
 * So the rule is checked in the source: a flow that COLLECTS a signal must
 * mention it in a `track` payload. Crude on purpose — it cannot prove the value
 * is correct, only that the wire is connected at both ends, which is exactly
 * the half that was missing.
 */
const FLOWS = [
  "src/app/threshold/ThresholdFlow.tsx",
  "src/app/delicacy/DelicacyFlow.tsx",
];

describe("E7/S14 — a flow that collects a signal also records it", () => {
  it("both flows still collect the switch count", () => {
    // The premise. If `onSwitch` is ever removed, the check below passes
    // vacuously and this says so instead.
    for (const file of FLOWS) {
      expect(readFileSync(file, "utf8"), `${file} no longer wires onSwitch`).toMatch(/onSwitch=/);
    }
  });

  it("the switch count reaches a track payload in both flows", () => {
    const missing: string[] = [];
    for (const file of FLOWS) {
      const text = readFileSync(file, "utf8");
      if (!/\bswitches:/.test(text)) missing.push(file);
    }
    expect(
      missing,
      "These flows count A/B switches and never send the number anywhere. It is a " +
        "column of the D6 dataset that goes missing with no symptom — the UI works, the " +
        "events fire, and the data is simply not there:\n" + missing.join("\n"),
    ).toEqual([]);
  });

  it("the threshold flow banks the count per trial instead of resetting it away", () => {
    // The specific defect: `switches.current = 0` ran on every answer with no
    // read in between. If the bank disappears, the reset is back to destroying
    // the measurement.
    const text = readFileSync(FLOWS[0], "utf8");
    const bankAt = text.indexOf("switchesPerTrial.current.push");
    const resetAt = text.indexOf("switches.current = 0");
    expect(bankAt, "the threshold flow no longer banks the per-trial count").toBeGreaterThan(-1);
    expect(
      bankAt,
      "the count is reset BEFORE it is banked, which is the original defect exactly",
    ).toBeLessThan(resetAt);
  });
});
