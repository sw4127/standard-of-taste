import { describe, expect, it } from "vitest";
import { createSwitchLog } from "@/lib/switch-log";

/**
 * E10/S3 (Track F3) — the behaviour that used to live inside a component and
 * could therefore only be checked by reading its source.
 *
 * Two things are proven here that `collected-not-dropped.test.ts` could only
 * approximate by looking for statements in the right order:
 *   1. banking happens BEFORE the reset, so no trial's count is destroyed, and
 *   2. `reset()` really empties the log, which is what an in-place session
 *      restart needs and what nothing previously called.
 */
describe("the switch log keeps one figure per trial", () => {
  it("banks the trial in progress and starts the next at zero", () => {
    const log = createSwitchLog();
    log.observe(3);
    log.bank();
    log.bank(); // a trial with no switching at all
    log.observe(7);
    log.bank();
    expect(log.banked()).toEqual([3, 0, 7]);
    expect(log.serialize()).toBe("3,0,7");
  });

  it("keeps the series rather than a total, so two listeners stay distinguishable", () => {
    // The E7/S14 reason for the shape, stated as a test: fifteen switches on
    // one pair and one on the rest, versus a steady two throughout. Same sum
    // in the first four trials; different observation.
    const spiky = createSwitchLog();
    for (const n of [15, 1, 1, 1]) {
      spiky.observe(n);
      spiky.bank();
    }
    const steady = createSwitchLog();
    for (const n of [4, 4, 5, 5]) {
      steady.observe(n);
      steady.bank();
    }
    const sum = (l: readonly number[]) => l.reduce((a, b) => a + b, 0);
    expect(sum(spiky.banked())).toBe(sum(steady.banked()));
    expect(spiky.serialize()).not.toBe(steady.serialize());
  });

  it("an unobserved trial banks zero rather than repeating the last count", () => {
    const log = createSwitchLog();
    log.observe(9);
    log.bank();
    log.bank();
    expect(log.serialize()).toBe("9,0");
  });

  it("serializes empty before any trial is banked", () => {
    expect(createSwitchLog().serialize()).toBe("");
  });
});

describe("a session's data begins when the session does", () => {
  it("reset() empties the banked series", () => {
    const log = createSwitchLog();
    for (const n of [4, 2, 6]) {
      log.observe(n);
      log.bank();
    }
    expect(log.serialize()).toBe("4,2,6");
    log.reset();
    expect(log.banked()).toEqual([]);
    expect(log.serialize()).toBe("");
  });

  it("reset() also drops the trial in progress", () => {
    // The half this would be easiest to miss: a restart mid-trial must not
    // carry the abandoned trial's count into the first trial of the next
    // session.
    const log = createSwitchLog();
    log.observe(11); // observed, never banked
    log.reset();
    log.bank();
    expect(log.serialize()).toBe("0");
  });

  it("a second session records only its own trials", () => {
    /*
     * THE DEFECT, AS A TEST. Before E10/S3 the accumulators were initialised
     * at mount and never reset, so a session started in place inherited the
     * previous session's series. Today no flow can restart in place — this is
     * what stops that from being true the day one can.
     */
    const log = createSwitchLog();
    for (const n of [5, 5, 5]) {
      log.observe(n);
      log.bank();
    }
    log.reset(); // <- what the Start button now does
    for (const n of [1, 2]) {
      log.observe(n);
      log.bank();
    }
    expect(log.serialize()).toBe("1,2");
    expect(log.banked()).toHaveLength(2);
  });

  it("banked() does not expose the internal array to mutation by reference", () => {
    // `banked()` returns the live array. Reset must replace it, not clear it in
    // place, or a caller holding the old reference sees the new session's data
    // appear in it. This pins the choice.
    const log = createSwitchLog();
    log.observe(1);
    log.bank();
    const held = log.banked();
    log.reset();
    log.observe(2);
    log.bank();
    expect(held).toEqual([1]);
    expect(log.banked()).toEqual([2]);
  });
});
