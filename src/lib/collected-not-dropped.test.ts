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
    /*
     * THE ORIGINAL DEFECT: `switches.current = 0` ran on every answer with no
     * read in between, so every trial's count was collected and destroyed.
     *
     * This used to be checked by finding the two statements in the source and
     * asserting the bank appeared before the reset — the best available check
     * while both lived inline in the component. E10/S3 moved the accumulator
     * into `switch-log.ts`, where `bank()` does both in one call, so the
     * ordering is now true BY CONSTRUCTION and is proven behaviourally in
     * `switch-log.test.ts` ("banks the trial in progress and starts the next at
     * zero", "an unobserved trial banks zero rather than repeating the last
     * count"). That is strictly stronger than a statement-order check, which
     * could pass while the values were wrong.
     *
     * What is left for THIS file to check is the half the unit test cannot see:
     * that the flow still routes through the log rather than going back to
     * hand-rolled refs.
     */
    const text = readFileSync(FLOWS[0], "utf8");
    expect(text, "the threshold flow no longer banks the per-trial count").toMatch(
      /\blog\.bank\(\)/,
    );
    expect(
      text,
      "the threshold flow has gone back to hand-rolled switch refs; the bank/reset " +
        "ordering is no longer guaranteed by construction",
    ).not.toMatch(/switches\.current\s*=\s*0/);
  });
});
