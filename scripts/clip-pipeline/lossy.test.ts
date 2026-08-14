/**
 * Solving a bitrate for a target magnitude (E2/S4c).
 *
 * The lossy ladder is stated in dB because a bitrate is a SETTING whose damage
 * depends on the material — so each source needs its own bitrate for the same
 * level. These fixtures are the real measured curves from five recordings
 * (`clip-pipeline curve --family lossy-artifact --source <id>`), which is what
 * makes the out-of-range cases below real rather than invented.
 */
import { describe, expect, it } from "vitest";
import { solveLossyBitrate, STAIRCASE_LEVELS } from "./rungs.mjs";

/** MEASURED: bitrate (kbps) -> LSD dB, five sources, 20s @75s. */
const CURVES: Record<string, { bitrateKbps: number; lsdDb: number }[]> = {
  pb1: [{ bitrateKbps: 320, lsdDb: 0.4 }, { bitrateKbps: 192, lsdDb: 0.7 }, { bitrateKbps: 128, lsdDb: 1.8 },
        { bitrateKbps: 96, lsdDb: 4.4 }, { bitrateKbps: 64, lsdDb: 6.8 }, { bitrateKbps: 32, lsdDb: 12.4 }],
  pb3: [{ bitrateKbps: 320, lsdDb: 0.9 }, { bitrateKbps: 192, lsdDb: 1.4 }, { bitrateKbps: 128, lsdDb: 1.0 },
        { bitrateKbps: 96, lsdDb: 1.3 }, { bitrateKbps: 64, lsdDb: 3.3 }, { bitrateKbps: 32, lsdDb: 12.2 }],
  pb4: [{ bitrateKbps: 320, lsdDb: 0.9 }, { bitrateKbps: 192, lsdDb: 1.0 }, { bitrateKbps: 128, lsdDb: 1.2 },
        { bitrateKbps: 96, lsdDb: 1.7 }, { bitrateKbps: 64, lsdDb: 6.2 }, { bitrateKbps: 32, lsdDb: 17.7 }],
  pb6: [{ bitrateKbps: 320, lsdDb: 0.6 }, { bitrateKbps: 192, lsdDb: 0.9 }, { bitrateKbps: 128, lsdDb: 1.0 },
        { bitrateKbps: 96, lsdDb: 0.9 }, { bitrateKbps: 64, lsdDb: 1.7 }, { bitrateKbps: 32, lsdDb: 9.9 }],
  pb8: [{ bitrateKbps: 320, lsdDb: 0.3 }, { bitrateKbps: 192, lsdDb: 0.5 }, { bitrateKbps: 128, lsdDb: 0.6 },
        { bitrateKbps: 96, lsdDb: 1.0 }, { bitrateKbps: 64, lsdDb: 11.2 }, { bitrateKbps: 32, lsdDb: 25.6 }],
};

const levels = (STAIRCASE_LEVELS["lossy-artifact"] as { values: number[] }).values;

describe("solveLossyBitrate", () => {
  it("recovers a bitrate that was measured exactly", () => {
    expect(solveLossyBitrate(4.4, CURVES.pb1)).toBe(96);
    expect(solveLossyBitrate(12.4, CURVES.pb1)).toBe(32);
  });

  it("interpolates between measured points, on the log-bitrate axis", () => {
    // Between 128k (1.8 dB) and 96k (4.4 dB) on pb1.
    const br = solveLossyBitrate(3.1, CURVES.pb1)!;
    expect(br).toBeGreaterThan(96);
    expect(br).toBeLessThan(128);
    // Halfway in dB should land at the geometric, not arithmetic, midpoint.
    expect(br).toBeCloseTo(Math.round(Math.sqrt(96 * 128)), 0);
  });

  /**
   * THE CASE THAT MUST NOT BE CLAMPED. pb3's own transparency floor is 0.9 dB,
   * so it cannot render the ladder's bottom levels at all. Returning the
   * nearest bitrate instead of null would render two different levels as the
   * same audio and report them as different magnitudes.
   */
  it("returns null below what a source can produce", () => {
    expect(solveLossyBitrate(0.5, CURVES.pb3)).toBeNull();
    expect(solveLossyBitrate(0.2, CURVES.pb8)).toBeNull();
  });

  it("returns null above what a source can produce", () => {
    // pb6 tops out at 9.9 dB even at 32k — the ladder's 9.5 fits, 12 does not.
    expect(solveLossyBitrate(12, CURVES.pb6)).toBeNull();
    expect(solveLossyBitrate(9.5, CURVES.pb6)).not.toBeNull();
  });

  it("gives a LOWER bitrate for a bigger target, on every source", () => {
    for (const [id, curve] of Object.entries(CURVES)) {
      const a = solveLossyBitrate(2.0, curve);
      const b = solveLossyBitrate(6.0, curve);
      if (a == null || b == null) continue;
      expect(b, `${id}: more damage must need a lower bitrate`).toBeLessThan(a);
    }
  });

  it("refuses a curve it cannot invert", () => {
    expect(() => solveLossyBitrate(1, [{ bitrateKbps: 128, lsdDb: 1 }])).toThrow(/two measured points/);
  });
});

describe("lossy ladder — availability is per-source, and that is recorded", () => {
  /**
   * The honest consequence of a material-dependent family: not every level
   * exists on every recording. This test does not demand full coverage — it
   * demands that the shortfall is REAL and known, so rendering skips levels
   * rather than silently substituting them.
   */
  it("the widest-range source covers most of the ladder", () => {
    const solved = levels.map((l) => solveLossyBitrate(l, CURVES.pb8));
    expect(solved.filter((x) => x != null).length).toBeGreaterThanOrEqual(levels.length - 2);
  });

  /**
   * MEASURED CORRECTION. This test first asserted that pb6 could NOT cover the
   * ladder, on the assumption that its transparency anchor sat above the bottom
   * levels. It failed: with the floor at 2.0 dB every one of these five sources
   * covers every level. The null-return is a real safety property — a source
   * with a narrower range must skip levels rather than clamp — but it is not
   * exercised by the recordings actually in the pool, and claiming otherwise
   * would have overstated a limitation.
   */
  it("all five measured sources cover the whole ladder", () => {
    for (const [id, curve] of Object.entries(CURVES)) {
      for (const l of levels) {
        expect(solveLossyBitrate(l, curve), `${id} cannot render level ${l} dB`).not.toBeNull();
      }
    }
  });

  it("a genuinely narrow source is refused, not clamped", () => {
    const narrow = [
      { bitrateKbps: 320, lsdDb: 0.5 },
      { bitrateKbps: 128, lsdDb: 1.1 },
      { bitrateKbps: 32, lsdDb: 2.2 },
    ];
    expect(solveLossyBitrate(9.5, narrow)).toBeNull();
    expect(solveLossyBitrate(2.0, narrow)).not.toBeNull();
  });

  /**
   * THE NON-MONOTONE REGION, and what the solver actually guarantees.
   *
   * pb6 reverses across 192k/128k/96k (0.9, 1.0, 0.9 dB) and pb3 across
   * 192k/128k (1.4, 1.0). The solver walks up from the DAMAGED end and stops at
   * the first reversal, so its answers stay inside a stretch where one dB value
   * means one bitrate. Everything above the break is refused.
   *
   * My first version of this test asserted that 0.95 dB on pb6 would be
   * refused. It is not, and should not be: the break is above 96k, so 0.95 sits
   * inside the invertible run and resolves uniquely to ~94 kbps. The code was
   * right and the expectation was wrong — the third time this session I have
   * asserted a number without computing it first.
   */
  it("only inverts inside the monotone run, and refuses above the reversal", () => {
    // pb6's run bottoms out at 0.9 dB (96k); the 0.6 dB it reaches at 320k is
    // on the far side of the reversal and is not reachable.
    expect(solveLossyBitrate(0.7, CURVES.pb6)).toBeNull();
    // pb3's run bottoms out at 1.0 dB (128k); 192k's 1.4 dB is past the break.
    expect(solveLossyBitrate(0.95, CURVES.pb3)).toBeNull();
    // ...and just inside the run still resolves.
    expect(solveLossyBitrate(0.95, CURVES.pb6)).not.toBeNull();
  });

  it("the ladder floor sits inside every source's invertible run", () => {
    for (const [id, curve] of Object.entries(CURVES)) {
      expect(solveLossyBitrate(Math.min(...levels), curve), `${id}`).not.toBeNull();
    }
  });

  it("every level is reachable on at least one source", () => {
    for (const l of levels) {
      const any = Object.values(CURVES).some((c) => solveLossyBitrate(l, c) != null);
      expect(any, `no source can render level ${l} dB`).toBe(true);
    }
  });
});
