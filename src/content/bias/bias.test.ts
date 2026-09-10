/**
 * Design-constraint tests for the Prestige-Bias item pool (mirrors the
 * world-cup design.test.ts pattern): the pool's psychometric shape is a
 * contract, not a suggestion. If the PM re-authors items, these must still
 * pass — or the change is a decision, not an accident.
 */
import { existsSync, readFileSync } from "node:fs";
import { audioDiskPath, isPinnedAudio } from "@/content/audio-host";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { BIAS_CLIPS, BIAS_POOL_VERSION } from "./items";

/** The sway contract below governs SCORED items; controls have their own. */
const SCORED = BIAS_CLIPS.filter((c) => !c.isControl);
const CONTROLS = BIAS_CLIPS.filter((c) => c.isControl);

describe("prestige-bias item pool design constraints", () => {
  it("has at least 8 scored items with unique ids", () => {
    expect(SCORED.length).toBeGreaterThanOrEqual(8);
    expect(new Set(BIAS_CLIPS.map((c) => c.id)).size).toBe(BIAS_CLIPS.length);
  });

  it("has 2–3 swapped labels (the debrief must have something to disclose)", () => {
    const swapped = SCORED.filter((c) => !c.labelIsTrue);
    expect(swapped.length).toBeGreaterThanOrEqual(2);
    expect(swapped.length).toBeLessThanOrEqual(3);
  });

  it("balances label directions so sway ≠ generic second-pass drift", () => {
    const up = SCORED.filter((c) => c.labelDirection === "up").length;
    const down = SCORED.length - up;
    expect(Math.abs(up - down)).toBeLessThanOrEqual(2);
  });

  it("swaps exist in both directions", () => {
    const swapped = SCORED.filter((c) => !c.labelIsTrue);
    expect(swapped.some((c) => c.labelDirection === "up")).toBe(true);
    expect(swapped.some((c) => c.labelDirection === "down")).toBe(true);
  });

  it("truthful items show the true artist; swapped items must not", () => {
    for (const c of SCORED) {
      if (c.labelIsTrue) expect(c.shownArtist).toBe(c.trueArtist);
      else expect(c.shownArtist).not.toBe(c.trueArtist);
    }
  });

  // v1.1 controls (instrument-defenses §hardening, PM RT-1a 2026-07-19).
  it("has 1–2 control items — rated twice, labeled never", () => {
    expect(CONTROLS.length).toBeGreaterThanOrEqual(1);
    expect(CONTROLS.length).toBeLessThanOrEqual(2);
  });

  it("controls show nothing: empty shown fields, nothing false to confess", () => {
    for (const c of CONTROLS) {
      expect(c.shownArtist).toBe("");
      expect(c.shownBlurb).toBe("");
      // labelIsTrue must be true so no swap machinery can ever pick one up.
      expect(c.labelIsTrue).toBe(true);
    }
  });

  it("controls sit apart from each other (drift sampled at distinct positions)", () => {
    const positions = BIAS_CLIPS.map((c, i) => (c.isControl ? i : -1)).filter((i) => i >= 0);
    for (let i = 1; i < positions.length; i++) {
      expect(positions[i] - positions[i - 1]).toBeGreaterThan(1);
    }
  });

  it("every clip carries license + attribution fields (CC credit is a legal requirement)", () => {
    for (const c of BIAS_CLIPS) {
      expect(c.license.length).toBeGreaterThan(0);
      // The rule is that the clip is served by this project's own pinned audio,
      // not that its path starts with a prefix (E19/S22). The prefix described
      // where the files used to live.
      expect(isPinnedAudio(c.audioSrc), c.audioSrc).toBe(true);
      expect(c.audioSrc).toContain("/bias/");
    }
  });

  it("pool version is a positive integer (RT-7b: rides every share URL + dataset event)", () => {
    expect(Number.isInteger(BIAS_POOL_VERSION)).toBe(true);
    expect(BIAS_POOL_VERSION).toBeGreaterThanOrEqual(1);
  });

  /**
   * THE RULE IS UNCHANGED — the audio a listener will request must exist — and
   * only its ADDRESS moved (E19/S22). The clips are served from a pinned commit
   * rather than from this deployment, so the file is looked up by its
   * repository path instead of under `public/`. Checking `public/` would keep
   * passing right up until the files leave it, and then pass forever while
   * every clip 404s.
   */
  it("every REAL (non-placeholder) audioSrc exists in the repository", () => {
    let checked = 0;
    for (const c of BIAS_CLIPS) {
      if (c.audioSrc.includes("PLACEHOLDER")) continue;
      const rel = audioDiskPath(c.audioSrc);
      expect(rel, `${c.id} is not served by the pinned audio host: ${c.audioSrc}`).not.toBeNull();
      checked += 1;
      expect(
        existsSync(join(process.cwd(), rel as string)),
        `missing audio file for ${c.id}: ${rel}`,
      ).toBe(true);
    }
    expect(checked, "no real clips were checked, so this passes vacuously").toBeGreaterThan(5);
  });

  // rt-answers §Content-ops item 4: "fail CI if any item lacks a license
  // snapshot or proof URL". This is that gate — it arms itself the moment an
  // item stops being a placeholder.
  it("every REAL item has a license snapshot + proof URL + source hash in the manifest", () => {
    interface ManifestItem {
      id: string;
      license: { proofPageUrl: string | null; snapshotFile: string | null; confirmedAt: string | null };
      source: { sha256: string | null };
    }
    const manifest = JSON.parse(
      readFileSync(join(process.cwd(), "src", "content", "bias", "manifest.json"), "utf8"),
    ) as { items: ManifestItem[] };
    for (const c of BIAS_CLIPS) {
      if (c.audioSrc.includes("PLACEHOLDER")) continue;
      const entry = manifest.items.find((i) => i.id === c.id);
      expect(entry, `no manifest entry for real item ${c.id}`).toBeDefined();
      expect(entry!.license.proofPageUrl, `${c.id}: license proof URL missing`).toBeTruthy();
      expect(entry!.license.snapshotFile, `${c.id}: license snapshot missing (run clip-pipeline snapshot)`).toBeTruthy();
      expect(
        entry!.license.snapshotFile && existsSync(join(process.cwd(), "src", "content", "bias", "licenses", entry!.license.snapshotFile)),
        `${c.id}: snapshot file not on disk`,
      ).toBe(true);
      expect(entry!.source.sha256, `${c.id}: source sha256 missing (run clip-pipeline download)`).toBeTruthy();
    }
  });
});
