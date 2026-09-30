/**
 * EVERY STRING THE PRESTIGE FLOW LOOKS UP BY VALUE HAS ITS CHINESE (bilingual Part 4).
 *
 * The label blurbs, the licences and the two passes' questions are looked up by
 * their English value on screens that render only mid-sitting, so neither the miss
 * recorder (server renders) nor the literal scan (`t("...")`) reads them. The
 * blurbs are the stimulus: an English blurb on a Chinese labelled pass would give a
 * Chinese sitting a label it cannot read. Serves D2, N3 and BA-12.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BIAS_CLIPS } from "@/content/bias/items";
import BIAS_ZH from "@/content/zh/copy/bias";
import { BIAS_POOL_VERSION } from "@/content/bias/items";
import { restorable } from "./BiasFlow";

describe("the Prestige flow's lookups by value", () => {
  it("every label blurb a listener reads has its Chinese", () => {
    const blurbs = BIAS_CLIPS.filter((c) => !c.isControl).map((c) => c.shownBlurb);
    expect(blurbs.length).toBeGreaterThan(10);
    expect(blurbs.filter((b) => BIAS_ZH[b] === undefined)).toEqual([]);
  });

  it("every licence in the credits has its Chinese", () => {
    const licences = [...new Set(BIAS_CLIPS.map((c) => c.license))];
    expect(licences.filter((l) => BIAS_ZH[l] === undefined)).toEqual([]);
  });

  it("both passes' questions and scale ends have their Chinese", () => {
    const src = readFileSync("src/app/bias/BiasFlow.tsx", "utf8");
    const block = src.slice(src.indexOf("const PASS_QUESTION = {"), src.indexOf("} as const;"));
    const strings = [...block.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    expect(strings.length).toBe(6);
    expect(strings.filter((s) => BIAS_ZH[s] === undefined)).toEqual([]);
  });
  it("every artist line, shown or true, has its Chinese: the name on the label is the cue", () => {
    const lines = [...new Set(BIAS_CLIPS.flatMap((c) => (c.isControl ? [c.trueArtist] : [c.shownArtist, c.trueArtist])))];
    expect(lines.filter((l) => BIAS_ZH[l] === undefined)).toEqual([]);
  });

  /*
   * ONE SITTING, ONE LANGUAGE (red-team, bilingual Part 4). A blind pass saved on /bias used
   * to resume on /zh/bias and be differenced against a Chinese labelled pass.
   */
  it("a saved blind pass resumes only in the language it was taken in", () => {
    const blind = Object.fromEntries(BIAS_CLIPS.map((c) => [c.id, 5]));
    const saved = { poolVersion: BIAS_POOL_VERSION, blind, listen: { blind: {}, labeled: {} } };
    expect(restorable({ ...saved, locale: "en" }, "en")).toBe(true);
    expect(restorable({ ...saved, locale: "en" }, "zh")).toBe(false);
    expect(restorable({ ...saved, locale: "zh" }, "en")).toBe(false);
    expect(restorable({ ...saved, locale: "zh" }, "zh")).toBe(true);
    // Saved before this change: those were English.
    expect(restorable(saved, "en")).toBe(true);
    expect(restorable(saved, "zh")).toBe(false);
  });
});
