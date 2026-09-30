/**
 * EVERY STRING THE DELICACY FLOW LOOKS UP BY VALUE HAS ITS CHINESE (bilingual Part 4).
 *
 * The flaw labels a listener picks between, the confidence hints and the damage sizes
 * render only mid-sitting or on the reveal, so neither the miss recorder (server
 * renders) nor the literal scan (`t("...")`) reads them. A missing one would put an
 * English answer option on a Chinese trial. Serves D2, N3 and BA-12.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DEGRADATION_FAMILIES } from "@/engine/delicacy";
import { FLAWS_INVITE } from "@/content/flaw-families";
import DELICACY_ZH from "@/content/zh/copy/delicacy";
import { FLAW_LABELS_ZH, MAGNITUDE_WORDS_ZH } from "@/content/zh/copy/delicacy-lines";
import { FAMILY_LABEL_ZH, FLAW_FAMILY_LIST_ZH } from "@/content/zh/copy/across";

describe("the Delicacy flow's lookups by value", () => {
  it("every flaw a listener can pick has a Chinese label and hint", () => {
    expect(DEGRADATION_FAMILIES.filter((f) => !FLAW_LABELS_ZH[f]?.label || !FLAW_LABELS_ZH[f]?.hint)).toEqual([]);
  });

  it("every damage size has its Chinese", () => {
    expect([1, 2, 3, 4].filter((m) => !MAGNITUDE_WORDS_ZH[m as 1 | 2 | 3 | 4])).toEqual([]);
  });

  it("every confidence hint and the reference invite have their Chinese", () => {
    const src = readFileSync("src/app/delicacy/DelicacyFlow.tsx", "utf8");
    const block = src.slice(src.indexOf("const CONFIDENCE_TAPS"), src.indexOf("];", src.indexOf("const CONFIDENCE_TAPS")));
    const hints = [...block.matchAll(/hint: "([^"]+)"/g)].map((m) => m[1]);
    expect(hints.length).toBe(3);
    expect([...hints, FLAWS_INVITE].filter((h) => DELICACY_ZH[h] === undefined)).toEqual([]);
  });
  // The library's list of families follows the engine, as flawFamilyList() does (red-team, Part 4).
  it("the Chinese list of families names every family the engine has, once each", () => {
    const parts = FLAW_FAMILY_LIST_ZH.split(/、|和/);
    expect(parts).toEqual(DEGRADATION_FAMILIES.map((f) => FAMILY_LABEL_ZH[f]));
  });
});
