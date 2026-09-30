/**
 * EVERY CONSTANT THE THRESHOLD SCREENS LOOK UP HAS ITS CHINESE (red-team, bilingual Part 4).
 *
 * The miss recorder only hears lookups a server render makes, and the literal scan
 * in `site-zh.test.tsx` only reads `t("...")`. A lookup keyed on an English
 * constant, `t(COOLDOWN_DEVICE_NOTE)`, on a screen that renders only in the
 * browser (the retest refusal, the share block after a sitting, the panels read
 * from local storage) was read by neither: reword the English constant and the
 * Chinese page shows the English, with every test green. This finds each such
 * lookup in the source and checks its value is a key of the dictionary it goes
 * through. Serves N3 (a Chinese page says what the English says) and BA-12.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import * as STAIRCASE from "@/content/staircase/copy";
import * as ARC from "@/content/vocabulary/arc";
import * as FLAWS from "@/content/flaw-families";
import THRESHOLD_ZH from "@/content/zh/copy/threshold";
import EXPERT_ZH from "@/content/zh/copy/expert";
import { staircaseCardFixtures } from "@/content/staircase/fixtures";

/** The files whose `t(...)` goes through THRESHOLD_ZH. */
const FILES = [
  "src/app/threshold/ThresholdFlow.tsx",
  "src/app/threshold/ThresholdResult.tsx",
  "src/components/AcrossTime.tsx",
  "src/app/result/ShareButton.tsx",
  "src/app/result/DownloadButton.tsx",
  "src/app/delicacy/AbCompare.tsx",
];

const EXPORTS: Record<string, unknown> = { ...STAIRCASE, ...ARC, ...FLAWS };

describe("the Threshold screens' constant lookups", () => {
  const found = FILES.flatMap((f) =>
    [...readFileSync(f, "utf8").matchAll(/\bt\(([A-Z][A-Z0-9_]+)\)/g)].map((m) => ({ file: f, name: m[1] })),
  );

  it("finds the lookups (a floor, so an empty scan cannot pass)", () => {
    expect(found.length).toBeGreaterThanOrEqual(7);
  });

  it("each one is an exported English string with a Chinese key", () => {
    const bad = found.filter(({ name }) => {
      const v = EXPORTS[name];
      return typeof v !== "string" || THRESHOLD_ZH[v] === undefined;
    });
    expect(bad.map((b) => `${b.file}: t(${b.name})`)).toEqual([]);
  });

  it("the expert panel names every outcome a sitting can end in", () => {
    const kinds = new Set(staircaseCardFixtures().map((f) => f.result.kind));
    expect(kinds.size).toBe(4);
    expect([...kinds].filter((k) => EXPERT_ZH[k] === undefined)).toEqual([]);
  });
});
