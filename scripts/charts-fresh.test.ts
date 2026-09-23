/**
 * THE CHARTS THE WRITE-UP EMBEDS ARE WHAT THEIR GENERATORS DRAW TODAY (Track V/S3).
 *
 * Found stale on 2026-09-22: `swapped-shift.svg` and `listen-shift.svg` were last
 * rendered for an eight-clip Prestige pool, and the pool has fourteen. Nothing
 * failed, because nothing re-ran them. They take half a second to draw, so they
 * are held here on every run; the copy decks, which take twenty, are held by
 * `scripts/check-generated.mjs` in the pre-push hook.
 *
 * Every tracked chart is a SYNTHETIC demo render (N3: n = 0 real respondents),
 * so `--demo` is the command that produced it, not a stand-in for one.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CHARTS, isSynthetic } from "./check-generated.mjs";

const lf = (s: string) => s.replace(/\r\n/g, "\n");

describe("the tracked charts are fresh", () => {
  it("lists every chart the repository tracks", () => {
    const tracked = execFileSync("git", ["ls-files", "docs/assets/*.svg"], { encoding: "utf8" })
      .split(/\r?\n/)
      .filter(Boolean)
      .sort();
    // Absolute floor: four were tracked on 2026-09-22.
    expect(tracked.length).toBeGreaterThanOrEqual(4);
    expect(CHARTS.map((c) => c.out).sort()).toEqual(tracked);
  });

  it("knows a synthetic render from a real one", () => {
    // n = 0 today, so every tracked chart must carry the watermark. The day a
    // real render lands, this is the line to change, deliberately.
    for (const { out } of CHARTS) expect(isSynthetic(readFileSync(out, "utf8")), out).toBe(true);
    expect(isSynthetic("<svg><text>n = 212</text></svg>")).toBe(false);
  });

  it.each(CHARTS)("$out is what $script draws today", ({ script, out }) => {
    // A REAL render cannot be redrawn from the repository and must never be
    // "fixed" into a synthetic one (N3). Until one exists, every chart is demo.
    if (!isSynthetic(readFileSync(out, "utf8"))) return;
    const tmp = join(mkdtempSync(join(tmpdir(), "chart-")), "chart.svg");
    execFileSync("node", [script, "--demo", "--out", tmp], { stdio: "ignore" });
    const fresh = lf(readFileSync(tmp, "utf8"));
    expect(fresh.length).toBeGreaterThan(500);
    expect(
      lf(readFileSync(out, "utf8")) === fresh,
      `${out} is stale. Run: node ${script} --demo --out ${out}`,
    ).toBe(true);
  });
});
