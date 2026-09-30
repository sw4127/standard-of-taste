/**
 * THE PRESTIGE TEST'S RESULT IN CHINESE, BRANCH BY BRANCH (bilingual Part 4; D1, N3).
 *
 * Every fixture the English headline, share text, creator lines, comparison
 * reading and control disclosure are held on, rendered by the Chinese templates
 * and held line for line to the English: the same lines, the same sentences, the
 * numbers in the English's order, the direction words kept. D1 stands on every
 * line (an instrument readout); the carve-out and the no-comparison rule too.
 */
import { describe, expect, it } from "vitest";
import { biasResults, comparisonResults } from "@/content/vocabulary/fixtures";
import { biasHeadline, controlDisclosure, shareTextFor, titleFragmentFor } from "@/content/bias/copy";
import { creatorLines } from "@/content/vocabulary/bias";
import { comparisonLines, criticReferenceLines, ourScaleLine } from "@/content/vocabulary/comparison";
import { carveOutBreaches } from "@/content/carve-out";
import { matches } from "@/content/register";
import { ABOUT_THE_PERSON_ZH, COMPARISON_ZH } from "./guards";
import { zhBanBreaches } from "./style";
import { parity } from "@/test-utils/zh-parity";
import {
  biasHeadlineZh,
  comparisonLinesZh,
  controlDisclosureZh,
  creatorLinesBiasZh,
  degreesOfZh,
  criticReferenceLinesZh,
  ourScaleLineZh,
  shareTextForZh,
  titleFragmentForZh,
} from "./copy/bias-lines";

function rules(text: string, where: string) {
  expect(zhBanBreaches(text), where).toEqual([]);
  expect(carveOutBreaches(text), where).toEqual([]);
  expect(matches(text, COMPARISON_ZH), where).toEqual([]);
  expect(ABOUT_THE_PERSON_ZH.test(text), `${where}: a readout claims something about the person (D1)`).toBe(false);
}

describe("the Chinese Prestige result", () => {
  const results = Object.entries(biasResults());

  it("covers a reading and a refusal, and all three verdicts (a floor)", () => {
    const verdicts = new Set(results.map(([, r]) => r.verdict));
    expect(verdicts.size).toBe(3);
    expect(results.some(([, r]) => biasHeadline(r).pct === null)).toBe(true);
  });

  for (const [name, r] of results) {
    it(`${name}: headline, fragment, share text, creator lines`, () => {
      const en = biasHeadline(r);
      const zh = biasHeadlineZh(r);
      expect(zh.pct).toBe(en.pct);
      parity([en.title, en.sub, titleFragmentFor(r), shareTextFor(r)], [zh.title, zh.sub, titleFragmentForZh(r), shareTextForZh(r)], name);
      parity(creatorLines(r), creatorLinesBiasZh(r), `${name} creator`);
      rules([zh.title, zh.sub, titleFragmentForZh(r), shareTextForZh(r), ...creatorLinesBiasZh(r)].join("\n"), name);
      if (r.controlDriftPts !== null) {
        parity([controlDisclosure(r.controlCount, r.controlDriftPts)], [controlDisclosureZh(r.controlCount, r.controlDriftPts)], `${name} controls`);
      }
    });
  }

  it("the control disclosure at one clip, at a drift of one point, and signed", () => {
    for (const [c, d] of [[1, 1], [2, -3], [2, 0]] as const) {
      parity([controlDisclosure(c, d)], [controlDisclosureZh(c, d)], `controls ${c}/${d}`);
      rules(controlDisclosureZh(c, d), `controls ${c}/${d}`);
    }
  });

  for (const [name, r] of Object.entries(comparisonResults())) {
    it(`comparison ${name}: the degrees, the stability, the boundary`, () => {
      parity(comparisonLines(r), comparisonLinesZh(r), name);
      rules(comparisonLinesZh(r).join("\n"), name);
    });
  }

  it("the critics' scales and this one", () => {
    parity(criticReferenceLines(), criticReferenceLinesZh(), "critics");
    parity([ourScaleLine()], [ourScaleLineZh()], "our scale");
    rules([...criticReferenceLinesZh(), ourScaleLineZh()].join("\n"), "scales");
  });
  it("the panel's stat names its total after the count, as the English does", () => {
    expect(degreesOfZh(11)).toContain("11");
    expect(degreesOfZh(11)).not.toMatch(/[—–]/);
  });
});
