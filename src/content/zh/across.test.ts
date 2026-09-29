/**
 * THE ACROSS-SESSIONS PANEL IN CHINESE, SCENARIO BY SCENARIO (bilingual Part 2; D1, N3).
 *
 * Every fixture scenario the English panel is tested on, rendered by the Chinese
 * templates: the same number of lines and roster entries as the English, the
 * English line's numbers, the same silence under two instruments, and the rules
 * (D1, the carve-out, no comparison with other people, the owner's Chinese rules).
 */
import { describe, expect, it } from "vitest";
import { acrossLines, instrumentCount, replicationLine, thresholdRoster } from "@/content/vocabulary/across";
import { acrossInputs } from "@/content/vocabulary/fixtures";
import { carveOutBreaches } from "@/content/carve-out";
import { matches } from "@/content/register";
import { ABOUT_THE_PERSON_ZH, COMPARISON_ZH } from "./guards";
import { zhBanBreaches } from "./style";
import { acrossLinesZh, quantityZh, replicationLineZh, thresholdRosterZh, unitZh } from "./copy/across";

const digits = (s: string) => [...s.matchAll(/\d+(?:\.\d+)?/g)].map((m) => m[0]).sort();

describe("the Chinese across-sessions panel", () => {
  const scenarios = Object.entries(acrossInputs());

  it("reads the English fixtures (a floor)", () => {
    expect(scenarios.length).toBeGreaterThanOrEqual(4);
  });

  for (const [name, input] of scenarios) {
    it(`${name}: the same parts as the English, the English numbers, and the rules`, () => {
      const en = acrossLines(input);
      const zh = acrossLinesZh(input, instrumentCount(input));
      expect(zh.length).toBe(en.length);
      for (let i = 0; i < en.length; i++) {
        // Every figure the English prints in digits is in the Chinese line.
        const enDigits = digits(en[i]);
        expect(enDigits.filter((d) => !digits(zh[i]).includes(d)), zh[i]).toEqual([]);
      }
      const roster = thresholdRosterZh(input);
      expect(roster.length).toBe(thresholdRoster(input).length);
      const all = [...zh, ...roster].join("\n");
      expect(zhBanBreaches(all)).toEqual([]);
      expect(carveOutBreaches(all)).toEqual([]);
      expect(ABOUT_THE_PERSON_ZH.test(all), "a readout claims something about the person (D1)").toBe(false);
      expect(matches(all, COMPARISON_ZH)).toEqual([]);
    });
  }

  it("writes all three replication outcomes, with the English line's numbers", () => {
    const base = { family: "pitch-drift" as const, unit: "cents of detune", trials: [], unpredicted: 0 };
    for (const [agree, disagree, crossMaterial] of [[4, 0, false], [0, 3, true], [2, 1, false]] as const) {
      const check = { ...base, agree, disagree, crossMaterial };
      const en = replicationLine(check);
      const zh = replicationLineZh(check);
      expect(digits(en).filter((d) => !digits(zh).includes(d)), zh).toEqual([]);
      expect(zh).toContain("音高漂移");
      expect(zh).toContain("音分");
      expect(zhBanBreaches(zh)).toEqual([]);
      expect(crossMaterial ? zh.includes("不同的录音") : !zh.includes("不同的录音")).toBe(true);
    }
    expect(unitZh("kbps of bitrate")).toBe("kbps");
  });

  it("names cents in Chinese and leaves ms and kbps as written", () => {
    expect(quantityZh(25, "cents of detune")).toBe("25 音分");
    expect(quantityZh(31.5, "ms of drift")).toBe("31.5 ms");
  });
});
