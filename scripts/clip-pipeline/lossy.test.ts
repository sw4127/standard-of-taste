/**
 * THE PER-SOURCE LOSSY LADDER (E4/S1b, PM ruling RT-65, 2026-08-15).
 *
 * This file used to test `solveLossyBitrate` — "what bitrate hits this target
 * dB" — with twenty green assertions driven entirely from fixture curves. They
 * proved the interpolation arithmetic and could not see either of the defects
 * that `solve-check` found the moment it rendered actual audio:
 *
 *   1. the solver returned bitrates MP3 does not have, and LAME snapped them
 *      silently, so three "levels" came out as one file;
 *   2. its monotone run broke on a tie at the bottom of the curve, which is
 *      exactly where the family saturates, so a good source was reported as
 *      unrenderable.
 *
 * That is the shape of false confidence this repo keeps paying for, so the
 * lesson is built into the tests below: THE FIXTURE CURVES NOW INCLUDE THE REAL
 * MEASURED SATURATION TIE, and there is a test whose only job is to fail if the
 * bitrate-collapse defect ever returns.
 *
 * The question is no longer "what bitrate hits this dB". The ladder is built
 * FROM the bitrates the encoder actually has, and each level is labelled with
 * the damage measured there.
 */
import { describe, expect, it } from "vitest";
import {
  LEGAL_MP3_BITRATES_KBPS,
  MIN_LOSSY_LEVEL_RATIO,
  STAIRCASE_LEVELS,
  lossyLadderForSource,
} from "./rungs.mjs";

type Point = { bitrateKbps: number; lsdDb: number };

/**
 * MEASURED, `clip-pipeline solve-check`, 20s @75s. pb6 is the full dense curve
 * as measured — including the 24k/32k SATURATION TIE that broke the old solver.
 * A fixture that quietly omitted it would have made the fix untestable.
 */
const CURVES: Record<string, Point[]> = {
  pb6: [
    { bitrateKbps: 320, lsdDb: 0.56 }, { bitrateKbps: 256, lsdDb: 0.63 }, { bitrateKbps: 192, lsdDb: 0.87 },
    { bitrateKbps: 160, lsdDb: 0.8 }, { bitrateKbps: 128, lsdDb: 0.99 }, { bitrateKbps: 112, lsdDb: 0.89 },
    { bitrateKbps: 96, lsdDb: 0.95 }, { bitrateKbps: 80, lsdDb: 1.04 }, { bitrateKbps: 64, lsdDb: 1.73 },
    { bitrateKbps: 56, lsdDb: 2.66 }, { bitrateKbps: 48, lsdDb: 4.22 }, { bitrateKbps: 40, lsdDb: 6.7 },
    { bitrateKbps: 32, lsdDb: 9.88 }, { bitrateKbps: 24, lsdDb: 9.88 },
  ],
  /** Coarser historical curves, kept because they exercise different shapes. */
  pb1: [{ bitrateKbps: 320, lsdDb: 0.4 }, { bitrateKbps: 192, lsdDb: 0.7 }, { bitrateKbps: 128, lsdDb: 1.8 },
        { bitrateKbps: 96, lsdDb: 4.4 }, { bitrateKbps: 64, lsdDb: 6.8 }, { bitrateKbps: 32, lsdDb: 12.4 }],
  pb3: [{ bitrateKbps: 320, lsdDb: 0.9 }, { bitrateKbps: 192, lsdDb: 1.4 }, { bitrateKbps: 128, lsdDb: 1.0 },
        { bitrateKbps: 96, lsdDb: 1.3 }, { bitrateKbps: 64, lsdDb: 3.3 }, { bitrateKbps: 32, lsdDb: 12.2 }],
  pb4: [{ bitrateKbps: 320, lsdDb: 0.9 }, { bitrateKbps: 192, lsdDb: 1.0 }, { bitrateKbps: 128, lsdDb: 1.2 },
        { bitrateKbps: 96, lsdDb: 1.7 }, { bitrateKbps: 64, lsdDb: 6.2 }, { bitrateKbps: 32, lsdDb: 17.7 }],
  pb8: [{ bitrateKbps: 320, lsdDb: 0.3 }, { bitrateKbps: 192, lsdDb: 0.5 }, { bitrateKbps: 128, lsdDb: 0.6 },
        { bitrateKbps: 96, lsdDb: 1.0 }, { bitrateKbps: 64, lsdDb: 11.2 }, { bitrateKbps: 32, lsdDb: 25.6 }],
};

describe("lossyLadderForSource — every level is a bitrate the encoder actually has", () => {
  /**
   * THE REGRESSION TEST FOR THE DEFECT THAT CAUSED ALL THIS. On pb8, levels
   * 3.9, 4.9 and 6.1 were solved to 80k, 78k and 75k — all three of which LAME
   * encodes at 80k, so they rendered the same file under three magnitudes. A
   * ladder built from the legal set cannot express that, and this asserts it.
   */
  it("never puts two levels on the same bitrate", () => {
    for (const [id, curve] of Object.entries(CURVES)) {
      const ladder = lossyLadderForSource(curve);
      const rates = ladder.map((p) => p.bitrateKbps);
      expect(new Set(rates).size, `${id}: duplicate bitrate in ladder`).toBe(rates.length);
    }
  });

  it("only ever names a bitrate MP3 CBR can produce at 44.1 kHz", () => {
    for (const [id, curve] of Object.entries(CURVES)) {
      for (const p of lossyLadderForSource(curve)) {
        expect(LEGAL_MP3_BITRATES_KBPS, `${id}: ${p.bitrateKbps}k is not encodable`).toContain(p.bitrateKbps);
      }
    }
  });

  it("ignores an illegal bitrate in the curve rather than laundering it into the ladder", () => {
    const withJunk: Point[] = [...CURVES.pb1, { bitrateKbps: 103, lsdDb: 3.0 }, { bitrateKbps: 77, lsdDb: 5.5 }];
    for (const p of lossyLadderForSource(withJunk)) {
      expect(LEGAL_MP3_BITRATES_KBPS).toContain(p.bitrateKbps);
    }
  });
});

describe("lossyLadderForSource — the saturation tie no longer destroys a source", () => {
  /**
   * pb6 measured 24k=9.88 and 32k=9.88. The old run-builder walked up from the
   * lowest bitrate and broke on that first tie, leaving a run of length 1, so
   * EVERY level returned null and pb6 was written off. It was never the source.
   */
  it("recovers pb6, which the old solver reported as unable to render anything", () => {
    const ladder = lossyLadderForSource(CURVES.pb6);
    expect(ladder.length).toBeGreaterThanOrEqual(6);
    expect(ladder[0].lsdDb).toBeLessThan(1.2);
    expect(ladder[ladder.length - 1].lsdDb).toBeCloseTo(9.88, 2);
  });

  it("starts the run at the HIGHEST bitrate among tied maxima — the cheaper twin is the same audio for more bits", () => {
    const top = lossyLadderForSource(CURVES.pb6).at(-1)!;
    expect(top.lsdDb).toBeCloseTo(9.88, 2);
    expect(top.bitrateKbps, "24k and 32k both measure 9.88; 32k is the informative edge").toBe(32);
  });

  it("still stops at a real reversal, which is the noise floor and not a tie", () => {
    // pb6 rises again at 128k (0.99 after 112k's 0.89). Nothing at or above
    // that point may appear.
    const rates = lossyLadderForSource(CURVES.pb6).map((p) => p.bitrateKbps);
    expect(Math.max(...rates)).toBeLessThanOrEqual(112);
  });
});

describe("lossyLadderForSource — levels a listener could actually tell apart", () => {
  it("thins neighbours that differ by less than the minimum ratio", () => {
    for (const [id, curve] of Object.entries(CURVES)) {
      const ladder = lossyLadderForSource(curve);
      for (let i = 1; i < ladder.length; i++) {
        expect(
          ladder[i].lsdDb / ladder[i - 1].lsdDb,
          `${id}: levels ${ladder[i - 1].lsdDb} and ${ladder[i].lsdDb} dB are not distinguishable`,
        ).toBeGreaterThanOrEqual(MIN_LOSSY_LEVEL_RATIO);
      }
    }
  });

  it("is strictly increasing in damage, which a staircase requires", () => {
    for (const [id, curve] of Object.entries(CURVES)) {
      const ladder = lossyLadderForSource(curve);
      for (let i = 1; i < ladder.length; i++) {
        expect(ladder[i].lsdDb, `${id}`).toBeGreaterThan(ladder[i - 1].lsdDb);
      }
      // ...and damage falls as bitrate rises, which is the physics.
      for (let i = 1; i < ladder.length; i++) {
        expect(ladder[i].bitrateKbps, `${id}`).toBeLessThan(ladder[i - 1].bitrateKbps);
      }
    }
  });

  it("returns an empty ladder rather than a one-rung fiction", () => {
    expect(lossyLadderForSource([{ bitrateKbps: 128, lsdDb: 1 }])).toEqual([]);
    // A curve with no monotone region at all: damage rises with bitrate.
    expect(lossyLadderForSource([
      { bitrateKbps: 32, lsdDb: 1 }, { bitrateKbps: 64, lsdDb: 2 }, { bitrateKbps: 128, lsdDb: 3 },
    ])).toEqual([]);
  });
});

describe("lossy ladder — what the NOMINAL levels are still for", () => {
  const spec = STAIRCASE_LEVELS["lossy-artifact"] as { perSource?: boolean; values: number[] };

  it("is marked per-source, so nobody renders the nominal values by mistake", () => {
    expect(spec.perSource).toBe(true);
  });

  /**
   * The nominal range still has a job: deciding which sources can carry a
   * session. A source whose measured ladder does not overlap it cannot host one.
   *
   * Asserted on pb6 ONLY, because it is the one fixture measured at every legal
   * bitrate — see the sparsity finding below.
   */
  it("a densely-measured source covers the nominal range comfortably", () => {
    const lo = Math.min(...spec.values);
    const hi = Math.max(...spec.values);
    const inRange = lossyLadderForSource(CURVES.pb6).filter((p) => p.lsdDb >= lo * 0.5 && p.lsdDb <= hi * 1.5);
    expect(inRange.length).toBeGreaterThanOrEqual(5);
  });

  /**
   * A CONSTRAINT ON E4, found by this test failing rather than by planning it.
   *
   * The ladder can only contain bitrates the curve was MEASURED at, so a coarse
   * curve yields a gappy ladder. pb8's historical fixture jumps 96k=1.0 dB
   * straight to 64k=11.2 dB, and the 80k/56k/48k/40k points that would fill that
   * eleven-fold hole were simply never measured. Its ladder therefore has two
   * levels inside the nominal range where pb6's has six.
   *
   * So: EVERY SOURCE MUST HAVE A DENSE CURVE — all fourteen legal bitrates —
   * before a ladder is built from it. The first version of the test above
   * demanded three in-range levels from every fixture and failed on pb8, and the
   * tempting fix was to lower the bar to two. This is the finding instead.
   */
  it("records that a sparse curve yields a gappy ladder — dense curves are required", () => {
    const dense = lossyLadderForSource(CURVES.pb6);
    const sparse = lossyLadderForSource(CURVES.pb8);
    const biggestJump = (l: Point[]) =>
      Math.max(...l.slice(1).map((p, i) => p.lsdDb / l[i].lsdDb));
    console.log(
      `[E4/S1b] pb6 (14 bitrates measured): ${dense.length} levels, biggest gap x${biggestJump(dense).toFixed(1)}`,
    );
    console.log(
      `[E4/S1b] pb8 ( 6 bitrates measured): ${sparse.length} levels, biggest gap x${biggestJump(sparse).toFixed(1)}`,
    );
    expect(biggestJump(sparse)).toBeGreaterThan(biggestJump(dense) * 3);
  });

  it("prints each fixture source's measured ladder [the E4/S1b evidence]", () => {
    for (const [id, curve] of Object.entries(CURVES)) {
      const ladder = lossyLadderForSource(curve);
      const span = ladder.length ? ladder[ladder.length - 1].lsdDb / ladder[0].lsdDb : 0;
      console.log(
        `[E4/S1b] ${id.padEnd(4)} ${String(ladder.length).padStart(2)} levels, span x${span.toFixed(1).padStart(5)}  ` +
          ladder.map((p) => `${p.bitrateKbps}k=${p.lsdDb.toFixed(2)}`).join("  "),
      );
    }
  });
});
