import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createRequire } from "node:module";
// Pipeline modules are plain .mjs; the checker resolves them via allowJs.
import {
  gradeBiasClip,
  measureBiasClip,
  biasValidate,
  TARGET_LUFS,
  LUFS_TOLERANCE,
} from "./biasvalidate.mjs";

/**
 * E7/S4 — LAYER A OVER THE PRESTIGE POOL, AS A TEST RATHER THAN A COMMAND.
 *
 * The bias clips were gated by a human listening to them. That gate was retired
 * (artifact-pivot §1) and nothing replaced it, so eleven clips have been
 * shipping on a July ear-pass and an HTTP 200.
 *
 * THE GATE IS NOT HYPOTHETICAL: its first run over the pool FAILED pb12, whose
 * analyzer-chosen window sat across a 2.80-second pause in the Borodin andante
 * — 2.8s of dead air inside a 20-second clip, plus 19.8% near-silence. Nobody
 * would have found that by reading code or checking a status code, and nobody
 * was going to listen. The clip was re-windowed by sweeping every candidate and
 * ranking the survivors by the analyzer's own score.
 *
 * The last describe proves the gate can still FAIL, on audio built to fail it.
 * A guard that has been satisfied once and can no longer fire is the defect
 * E6/S26 found in the delicacy card's width check.
 */
const require = createRequire(import.meta.url);
const FFMPEG = process.env.FFMPEG_PATH || require("ffmpeg-static");

/** Synthesise a 20s clip with `silenceSec` of dead air in the middle. */
function syntheticClip(dir: string, name: string, opts: { silenceSec?: number; gainDb?: number } = {}): string {
  const out = join(dir, `${name}.mp3`);
  const sil = opts.silenceSec ?? 0;
  const toneSec = (20 - sil) / 2;
  const gain = opts.gainDb ?? 0;
  execFileSync(
    FFMPEG,
    [
      "-f", "lavfi", "-i", `sine=frequency=440:duration=${toneSec}`,
      "-f", "lavfi", "-i", `anullsrc=r=44100:cl=mono:d=${sil}`,
      "-f", "lavfi", "-i", `sine=frequency=660:duration=${toneSec}`,
      "-filter_complex", `[0:a][1:a][2:a]concat=n=3:v=0:a=1,volume=${gain}dB[a]`,
      "-map", "[a]", "-ar", "44100", "-codec:a", "libmp3lame", "-q:a", "3", "-v", "error", "-y", out,
    ],
    { stdio: "ignore" },
  );
  return out;
}

describe("E7/S4 — every clip in the pool is fit to put in front of a listener", () => {
  // Measured ONCE. Seventeen clips each need a full loudnorm pass, so running
  // the sweep per test is ~8s of ffmpeg per test and blows the default timeout.
  let cached: ReturnType<typeof gradeBiasClip>[] | null = null;
  const rows = () => (cached ??= biasValidate(["--json-silent"]) as ReturnType<typeof gradeBiasClip>[]);

  it("all of them pass Layer A", { timeout: 180_000 }, () => {
    const flagged = rows().filter((r) => r.verdict !== "PASS");
    expect(
      flagged.map((r) => `${r.id}: ${r.reasons.join("; ")}`),
      "a clip in the shipping pool is not fit to be rated",
    ).toEqual([]);
    expect(rows().length, "the validator found no clips at all").toBeGreaterThanOrEqual(16);
  });

  it("measures rather than assumes: no gate reads from an absent number", { timeout: 180_000 }, () => {
    for (const r of rows()) {
      for (const field of ["durationSec", "lufs", "truePeakDb", "clippedFraction", "quietFraction", "longestSilenceSec", "speechRisk"]) {
        expect(
          (r as unknown as Record<string, unknown>)[field],
          `${r.id}: ${field} is absent, and absent is not a pass`,
        ).not.toBeNull();
      }
    }
  });
});

describe("E7/S4 — the gate can still fail", () => {
  const dir = mkdtempSync(join(tmpdir(), "bias-layera-"));

  it("fails a clip with dead air in it — the pb12 defect, rebuilt", { timeout: 60_000 }, () => {
    const file = syntheticClip(dir, "deadair", { silenceSec: 3 });
    const graded = gradeBiasClip(
      measureBiasClipAt(file, "deadair"),
    );
    expect(graded.verdict).toBe("FLAG");
    expect(graded.reasons.join(" "), graded.reasons.join(" ")).toMatch(/dead air/);
  });

  it("fails a clip that is louder than the pool", { timeout: 60_000 }, () => {
    const file = syntheticClip(dir, "loud", { gainDb: 12 });
    const graded = gradeBiasClip(measureBiasClipAt(file, "loud"));
    expect(graded.verdict).toBe("FLAG");
    expect(graded.reasons.join(" ")).toMatch(/LUFS|true peak/);
  });

  it("states the loudness window it is enforcing", () => {
    expect(TARGET_LUFS).toBe(-16);
    expect(LUFS_TOLERANCE).toBe(1);
  });
});

/**
 * measureBiasClip reads from public/audio/bias by id. The synthetic clips live
 * in a temp dir, so this shim measures an arbitrary path through the same code
 * — deliberately reusing the real measurement rather than reimplementing it,
 * since a guard proven against a different measurement proves nothing.
 */
function measureBiasClipAt(file: string, id: string) {
  return measureBiasClip({ id, source: { downloadUrl: "" }, window: { approved: null } }, file);
}
