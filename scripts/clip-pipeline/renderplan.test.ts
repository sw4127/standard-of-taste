/**
 * E4/S4/S1 — the lossy window plan, and the arithmetic under it.
 *
 * WHY THIS FILE EXISTS. RT-70: a window plan was costed in megabytes and never
 * checked against how long the recordings are, so it asked pb8 for audio
 * starting 10 s past the end of the file, and that was discovered 190 clips
 * into a 198-clip render. The fix was not "be careful" — it was to make source
 * durations a first-class input (`SOURCE_EXTENTS`) and the plan a derivation
 * that can be re-run.
 *
 * THE RECORDINGS ARE GIT-IGNORED, so nothing here can probe audio. That is
 * precisely why the measured extents are recorded as data: the derivation is
 * checkable in CI even though the material is not present.
 *
 * The one thing this cannot check is whether SOURCE_EXTENTS still matches the
 * files. `staircase-render`'s pre-flight ffprobes every source and refuses to
 * start if a window runs past the end, which is where that belongs — it is the
 * stage that has the audio.
 */

import { describe, expect, it } from "vitest";
import {
  LOSSY_WINDOWS,
  LOSSY_WINDOWS_PER_SOURCE,
  MEASURED_LOSSY_CURVES,
  NO_FADE_FRACTION,
  SOURCE_EXTENTS,
  STAIRCASE_WINDOWS,
  lossyWindowsFor,
} from "./renderplan.mjs";
import { lossyLadderForSource, MIN_LOSSY_LEVEL_RATIO } from "./rungs.mjs";

const CLIP_SEC = 20;
const LOSSY_SOURCES = Object.keys(LOSSY_WINDOWS);

describe("the lossy window table is the derivation, not a transcription of it", () => {
  it.each(LOSSY_SOURCES)("%s's recorded windows equal what lossyWindowsFor computes", (id) => {
    // This caught a real slip in the very first draft: pb4's seventh window was
    // written as 317 from a hand-computation that used lead-in 0 instead of 0.5.
    expect(LOSSY_WINDOWS[id as keyof typeof LOSSY_WINDOWS]).toEqual(lossyWindowsFor(id));
  });

  it.each(LOSSY_SOURCES)("%s gets exactly the agreed number of windows", (id) => {
    expect(LOSSY_WINDOWS[id as keyof typeof LOSSY_WINDOWS]).toHaveLength(LOSSY_WINDOWS_PER_SOURCE);
  });

  it("every lossy source has a measured extent, and vice versa", () => {
    expect(LOSSY_SOURCES.sort()).toEqual(Object.keys(SOURCE_EXTENTS).sort());
  });
});

describe("every window is inside real, non-fading audio", () => {
  it.each(LOSSY_SOURCES)("%s: no window starts before the music does", (id) => {
    const ext = SOURCE_EXTENTS[id as keyof typeof SOURCE_EXTENTS];
    for (const start of LOSSY_WINDOWS[id as keyof typeof LOSSY_WINDOWS]) {
      expect(start).toBeGreaterThanOrEqual(ext.leadInSec);
    }
  });

  it.each(LOSSY_SOURCES)("%s: no window runs into the fade region — THE RT-70 CHECK", (id) => {
    const ext = SOURCE_EXTENTS[id as keyof typeof SOURCE_EXTENTS];
    const limit = ext.durationSec * NO_FADE_FRACTION;
    for (const start of LOSSY_WINDOWS[id as keyof typeof LOSSY_WINDOWS]) {
      expect(start + CLIP_SEC).toBeLessThanOrEqual(limit);
    }
  });

  it.each(LOSSY_SOURCES)("%s: windows do not overlap, so instances are different material", (id) => {
    const w = LOSSY_WINDOWS[id as keyof typeof LOSSY_WINDOWS];
    for (let i = 1; i < w.length; i++) expect(w[i] - w[i - 1]).toBeGreaterThanOrEqual(CLIP_SEC);
  });

  it.each(LOSSY_SOURCES)("%s: windows are strictly increasing", (id) => {
    const w = LOSSY_WINDOWS[id as keyof typeof LOSSY_WINDOWS];
    expect([...w].sort((a, b) => a - b)).toEqual(w);
  });
});

describe("pb6 is at its limit, and the planner says so rather than silently truncating", () => {
  // 197.4s usable against the 180s nine windows need, no lead-in to give back.
  // Recorded as a test because the next person to raise a count or a clip
  // length needs this to fail, not to quietly produce eight windows.
  it("pb6 has the least headroom of the three", () => {
    const headroom = (id: string) => {
      const e = SOURCE_EXTENTS[id as keyof typeof SOURCE_EXTENTS];
      return e.durationSec * NO_FADE_FRACTION - e.leadInSec - LOSSY_WINDOWS_PER_SOURCE * CLIP_SEC;
    };
    expect(headroom("pb6")).toBeLessThan(headroom("pb1"));
    expect(headroom("pb6")).toBeLessThan(headroom("pb4"));
    expect(headroom("pb6")).toBeLessThan(20);
  });

  it("asking pb6 for a tenth window THROWS instead of returning nine", () => {
    expect(() => lossyWindowsFor("pb6", { count: 10 })).toThrow(/cannot hold 10 non-overlapping/);
  });

  it("asking for a longer clip throws too", () => {
    expect(() => lossyWindowsFor("pb6", { clipSec: 25 })).toThrow(/cannot hold/);
  });

  it("pb1 and pb4 still have room at ten", () => {
    expect(lossyWindowsFor("pb1", { count: 10 })).toHaveLength(10);
    expect(lossyWindowsFor("pb4", { count: 10 })).toHaveLength(10);
  });

  it("an unknown source throws rather than planning nothing", () => {
    expect(() => lossyWindowsFor("pb99")).toThrow(/no measured extent/);
  });
});

describe("pb4 replaces pb8 for lossy only (RT-79a d)", () => {
  it("pb8 is NOT a lossy source, and pb4 is", () => {
    expect(LOSSY_SOURCES).toContain("pb4");
    expect(LOSSY_SOURCES).not.toContain("pb8");
  });

  it("pb8 keeps its pitch/timing windows — nothing was thrown away", () => {
    expect(STAIRCASE_WINDOWS.pb8).toEqual([15, 45, 75]);
  });

  it("pb4 has a measured curve, because a lossy ladder cannot be built without one", () => {
    expect(MEASURED_LOSSY_CURVES.pb4.length).toBeGreaterThan(0);
  });

  it("pb4 yields a usable ladder — 10 levels, more than the source it replaces needed", () => {
    const ladder = lossyLadderForSource(MEASURED_LOSSY_CURVES.pb4);
    expect(ladder).toHaveLength(10);
    expect(ladder.length).toBeGreaterThan(lossyLadderForSource(MEASURED_LOSSY_CURVES.pb6).length);
  });

  it("pb4's ladder is strictly increasing in dB with distinguishable steps", () => {
    const ladder = lossyLadderForSource(MEASURED_LOSSY_CURVES.pb4);
    for (let i = 1; i < ladder.length; i++) {
      expect(ladder[i].lsdDb).toBeGreaterThan(ladder[i - 1].lsdDb);
      expect(ladder[i].lsdDb / ladder[i - 1].lsdDb).toBeGreaterThanOrEqual(MIN_LOSSY_LEVEL_RATIO);
    }
  });

  it("pb4's ladder descends in bitrate as it ascends in damage", () => {
    const ladder = lossyLadderForSource(MEASURED_LOSSY_CURVES.pb4);
    for (let i = 1; i < ladder.length; i++) {
      expect(ladder[i].bitrateKbps).toBeLessThan(ladder[i - 1].bitrateKbps);
    }
  });

  it("pb4's measured curve is monotone — it does NOT saturate the way pb8 does", () => {
    // The reason pb4 is a better lossy source than the one it replaces, not
    // merely a longer one.
    const c = MEASURED_LOSSY_CURVES.pb4;
    for (let i = 1; i < c.length; i++) expect(c[i].lsdDb).toBeGreaterThan(c[i - 1].lsdDb);
  });
});

describe("the plan's size, computed rather than guessed", () => {
  it("288 files across three sources", () => {
    const total = LOSSY_SOURCES.reduce((n, id) => {
      const levels = lossyLadderForSource(MEASURED_LOSSY_CURVES[id]).length;
      return n + LOSSY_WINDOWS_PER_SOURCE * (1 + levels); // one reference per window
    }, 0);
    expect(total).toBe(288);
  });
});
