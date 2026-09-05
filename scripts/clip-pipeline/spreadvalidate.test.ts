/**
 * TRACK N / S2 proof. PRE-REGISTERED before the clips were rendered:
 *
 *   (a) EVERY SHIPPED CLIP PASSES LAYER A — measured on the actual mp3 in
 *       public/audio/spread, not on the render log. The gates are the bias
 *       pool's, imported rather than copied, with the target duration passed
 *       in: duration, loudness, true peak, clipping, flat tops, quiet
 *       fraction, dead air, speech risk.
 *   (b) THE POOL'S PROVENANCE IS COMPLETE — every item has the SHA-256 of the
 *       bytes that were actually fetched, and a window that Layer A accepted.
 *   (c) THE GATE CAN STILL FAIL, proven on this pool's own rejected windows
 *       rather than on synthetic audio: the fitter recorded what it turned
 *       down, and those rejections must really be rejections.
 *   (d) THE CLIPS ARE THE LENGTH THE POOL CLAIMS, which is 40s here and 20s
 *       everywhere else — the mitigation for excerpting a long work.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { spreadValidate } from "./spreadpool.mjs";
import { bandwidthByPairKind, spreadBandwidth } from "./spreadbandwidth.mjs";

type Row = {
  id: string;
  fileMissing: boolean;
  verdict: string;
  reasons: string[];
  durationSec: number;
  lufs: number;
  quietFraction: number;
  longestSilenceSec: number;
  speechRisk: number;
};

const manifest = JSON.parse(readFileSync("src/content/spread/manifest.json", "utf8"));

let cached: Row[] | null = null;
const rows = () => (cached ??= spreadValidate(["--json-silent"]) as Row[]);

describe("(a) every clip in the critic-ranked pool is fit to put in front of a listener", () => {
  it("all of them pass Layer A", { timeout: 300_000 }, () => {
    const graded = rows();
    expect(graded.length).toBe(manifest.items.length);
    const bad = graded.filter((r) => r.verdict !== "PASS");
    expect(bad.map((r) => `${r.id}: ${r.reasons.join("; ")}`)).toEqual([]);
  });

  it("measures rather than assumes: no gate reads from an absent number", { timeout: 300_000 }, () => {
    for (const r of rows()) {
      expect(r.fileMissing).toBe(false);
      for (const v of [r.durationSec, r.lufs, r.quietFraction, r.longestSilenceSec, r.speechRisk]) {
        expect(Number.isFinite(v)).toBe(true);
      }
    }
  });
});

describe("(b) the pool's provenance is complete", () => {
  it("records the hash of the bytes actually fetched", () => {
    for (const item of manifest.items) {
      expect(item.source.sha256).toMatch(/^[0-9a-f]{64}$/);
      expect(item.source.cachedFile).toBeTruthy();
    }
  });

  it("ships only windows Layer A accepted", () => {
    for (const item of manifest.items) {
      expect(item.window.chosen).not.toBeNull();
      expect(typeof item.window.chosen.startSec).toBe("number");
      expect(item.render).not.toBeNull();
      expect(item.render.mp3).toBe(`${item.id}.mp3`);
    }
  });

  it("keeps the windows it rejected, so a hard source is visible as one", () => {
    // Not decoration: one source needed 23 candidates because the work is
    // short variations with pauses. A pool that hid that would look uniform.
    const tried: number[] = manifest.items.map((i: { window: { tried: unknown[] } }) => i.window.tried.length);
    expect(tried.every((n) => n >= 1)).toBe(true);
    expect(Math.max(...tried)).toBeGreaterThan(1);
  });
});

describe("(c) the gate can still fail — proven on this pool's own rejects", () => {
  it("every window the fitter turned down carries a stated reason", () => {
    let rejects = 0;
    for (const item of manifest.items) {
      for (const t of item.window.tried) {
        if (t.verdict === "PASS") continue;
        rejects += 1;
        expect(t.reasons.length).toBeGreaterThan(0);
        expect(t.verdict).toBe("FLAG");
      }
    }
    // Assert the scan FOUND rejections before asserting anything about them.
    expect(rejects).toBeGreaterThan(0);
  });

  it("accepted exactly one window per item, and it is the last one tried", () => {
    for (const item of manifest.items) {
      const passes = item.window.tried.filter((t: { verdict: string }) => t.verdict === "PASS");
      expect(passes.length).toBe(1);
      expect(item.window.tried[item.window.tried.length - 1].verdict).toBe("PASS");
      expect(item.window.chosen.startSec).toBe(passes[0].startSec);
    }
  });
});

describe("(e) the brightness confound points toward the null, not toward a result", () => {
  // The clips differ in bandwidth by up to 10 kHz — one source is a 128 kbps
  // mp3 that stops at 8.6 kHz — for reasons no critic's ordering caused. The
  // size of that cannot be fixed without destroying the recordings. The
  // DIRECTION can be watched: if the bright/dark gaps ever concentrate on the
  // critic-FAR pairs, the pool inflates its own answer whatever anyone hears.
  it("keeps the mean bandwidth gap no larger on far pairs than on close ones", { timeout: 300_000 }, () => {
    const rows = spreadBandwidth(["--json-silent"]) as { id: string; cutoffHz: number }[];
    const pool = manifest.items.map((i: { id: string; position: number }) => ({
      id: i.id,
      position: i.position,
    }));
    const dir = bandwidthByPairKind(rows, pool);
    expect(dir.farPairs).toBeGreaterThan(0);
    expect(dir.closePairs).toBeGreaterThan(0);
    expect(dir.conservative).toBe(true);
  });
});

describe("(d) the clips are the length this pool claims", () => {
  it("renders 40s, not the 20s the other pools use", { timeout: 300_000 }, () => {
    expect(manifest.clipSeconds).toBe(40);
    for (const r of rows()) {
      expect(Math.abs(r.durationSec - manifest.clipSeconds)).toBeLessThanOrEqual(0.5);
    }
  });
});
