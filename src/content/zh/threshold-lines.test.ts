/**
 * THE THRESHOLD TEST'S RESULT IN CHINESE, BRANCH BY BRANCH (bilingual Part 4; D1, N3).
 *
 * Every fixture the English result, card, creator translation, arc and limits
 * are held on, rendered by the Chinese templates and held to what the English is
 * held to, line for line: the same number of lines, the same number of
 * sentences, no number the English does not state and every figure it prints
 * kept, and the owner's Chinese rules. D1 stands on every line except the prompt
 * card's (suspended there, by name); the carve-out and the no-comparison rule
 * stand everywhere.
 */
import { describe, expect, it } from "vitest";
import { staircaseCardFixtures } from "@/content/staircase/fixtures";
import { resultLines, thresholdShareText, cooldownBody, cooldownTitle } from "@/content/staircase/copy";
import { arcClaims, thresholdSessions } from "@/content/vocabulary/fixtures";
import { arcLines } from "@/content/vocabulary/arc";
import { creatorLines } from "@/content/vocabulary/threshold";
import { cardSections, tagsFor, worthLine } from "@/content/card/copy";
import { promptCard } from "@/engine/prompt-card";
import { delicacyArcRefusal } from "@/content/vocabulary/arc";
import { DELICACY_ARC_FLOOR } from "@/content/delicacy/arc-floor";
import { thresholdClaim } from "@/engine/evidence";
import { knownLimits } from "@/engine/staircase-manifest";
import { carveOutBreaches } from "@/content/carve-out";
import { matches } from "@/content/register";
import { ABOUT_THE_PERSON_ZH, COMPARISON_ZH } from "./guards";
import { zhBanBreaches } from "./style";
import {
  arcLinesZh,
  cardSectionsZh,
  cooldownBodyZh,
  cooldownTitleZh,
  delicacyArcRefusalZh,
  tagsForZh,
  worthLineZh,
  creatorLinesZh,
  limitStatementZh,
  resultLinesZh,
  thresholdShareTextZh,
} from "./copy/threshold-lines";
import { quantityZh, quantityZhGlossed } from "./copy/across";
import { glossFirstCentsZh } from "./copy/threshold-lines";
import { zhNumeralsIn } from "./guards";
import { digitsOf, numbers, parity } from "@/test-utils/zh-parity";

function rules(text: string, where: string, d1: boolean) {
  expect(zhBanBreaches(text), where).toEqual([]);
  expect(carveOutBreaches(text), where).toEqual([]);
  expect(matches(text, COMPARISON_ZH), where).toEqual([]);
  if (d1) expect(ABOUT_THE_PERSON_ZH.test(text), `${where}: a readout claims something about the person (D1)`).toBe(false);
}

const fixtures = staircaseCardFixtures();

describe("the Chinese Threshold result", () => {
  it("covers every outcome kind (a floor)", () => {
    const kinds = new Set(fixtures.map((f) => f.result.kind));
    for (const k of ["threshold", "below", "above", "inconclusive"]) expect(kinds.has(k as never), k).toBe(true);
  });

  for (const { surface, result } of fixtures) {
    it(`${surface}: the result lines, the share text`, () => {
      const zh = resultLinesZh(result);
      parity(resultLines(result), zh, surface);
      rules(zh.join("\n"), surface, true);
      const share = thresholdShareTextZh(result);
      rules(share, `${surface} share`, true);
      expect(numbers(share).filter((n) => !numbers(thresholdShareText(result)).includes(n))).toEqual([]);
    });
  }

  it("the prompt card, on every fixture and on all of them together (D1 suspended; the rest holds)", () => {
    const sets = [...fixtures.map((f) => [f.result]), fixtures.map((f) => f.result)];
    let rendered = 0;
    for (const results of sets) {
      const en = cardSections(results);
      const zh = cardSectionsZh(results);
      expect(zh.length).toBe(en.length);
      for (let i = 0; i < en.length; i++) {
        if (i < en.length - 1 || en[i].lines.length !== 1 || !/,|^[a-z]/.test(en[i].lines[0])) {
          parity(en[i].lines, zh[i].lines, `card ${en[i].heading}`);
        } else {
          // The paste line: tags, one per English tag.
          expect(zh[i].lines[0].split("，").length).toBe(en[i].lines[0].split(", ").length);
        }
        rules(zh[i].lines.join("\n"), `card ${en[i].heading}`, false);
        rendered++;
      }
    }
    expect(rendered).toBeGreaterThan(fixtures.length);
  });

  it("each card axis: its worth line and its tags, one Chinese tag per English tag", () => {
    const axes = promptCard(fixtures.map((f) => f.result)).axes.concat(...fixtures.map((f) => promptCard([f.result]).axes));
    const states = new Set(axes.map((a) => `${a.state}/${a.spend}`));
    expect(states.size).toBeGreaterThan(2);
    for (const a of axes) {
      const en = worthLine(a);
      const zh = worthLineZh(a);
      expect(zh === null, a.family).toBe(en === null);
      if (en !== null && zh !== null) parity([en], [zh], `${a.family}/${a.state}`);
      expect(tagsForZh(a).length, `${a.family}/${a.state}`).toBe(tagsFor(a).length);
    }
  });

  it("the Delicacy arc refusal, from the pool and from a pool whose families differ in size", () => {
    const floors = [DELICACY_ARC_FLOOR, { ...DELICACY_ARC_FLOOR, perFamilyItemsToMove: null, perFamilyTrials: null }];
    for (const f of floors) {
      parity([delicacyArcRefusal(f)], [delicacyArcRefusalZh(f)], "delicacy refusal");
      rules(delicacyArcRefusalZh(f), "delicacy refusal", true);
    }
  });

  it("the creator translation, on every session", () => {
    let n = 0;
    for (const r of thresholdSessions()) {
      const c = thresholdClaim(r);
      if (!c.ok) continue;
      parity(creatorLines(c.value), creatorLinesZh(c.value), `${r.family}/${r.kind}`);
      rules(creatorLinesZh(c.value).join("\n"), r.family, true);
      n++;
    }
    expect(n).toBeGreaterThan(10);
  });

  it("the arc, on every claim (all three instruments)", () => {
    for (const [name, claim] of Object.entries(arcClaims())) {
      parity(arcLines(claim), arcLinesZh(claim), name);
      rules(arcLinesZh(claim).join("\n"), name, true);
    }
  });

  it("the retest refusal", () => {
    for (const family of ["pitch-drift", "timing-smear", "lossy-artifact"]) {
      parity([cooldownTitle(family)], [cooldownTitleZh(family)], family);
    }
    for (const days of [1, 2, 6]) {
      parity([cooldownBody(days)], [cooldownBodyZh(days)], `${days} days`);
      rules(cooldownBodyZh(days), `${days} days`, true);
    }
  });

  it("every limit the pipeline measured, parsed rather than retyped, keeping its figures", () => {
    const KNOWN_LIMITS = knownLimits();
    expect(KNOWN_LIMITS.length).toBeGreaterThan(0);
    for (const l of KNOWN_LIMITS) {
      const zh = limitStatementZh(l);
      const dropped = digitsOf(l.statement).filter((n) => !numbers(zh).includes(n));
      expect(dropped, `${l.kind}: ${zh}`).toEqual([]);
      rules(zh, l.kind, true);
    }
  });
  it("glosses cents, and only cents, at first use", () => {
    expect(quantityZhGlossed(25, "cents of peak detune")).toBe(`${quantityZh(25, "cents of peak detune")}（cents）`);
    expect(quantityZhGlossed(96, "kbps")).toBe(quantityZh(96, "kbps"));
    expect(glossFirstCentsZh("你在 12.5 音分上听出了损伤。到了 3.1 音分，你是在猜。")).toBe(
      "你在 12.5 音分（cents）上听出了损伤。到了 3.1 音分，你是在猜。",
    );
    expect(glossFirstCentsZh("你在 48 kbps 上听出了损伤。")).toBe("你在 48 kbps 上听出了损伤。");
  });
  it("reads Chinese numerals as numbers, in order, skipping the article and the idioms (planted)", () => {
    expect(zhNumeralsIn("大约十次里有九次")).toEqual(["10", "9"]);
    expect(zhNumeralsIn("一百零一个位置，二十五次")).toEqual(["101", "25"]);
    expect(zhNumeralsIn("一次，一眼，十分重要，三个百分点")).toEqual(["3"]);
    expect(zhNumeralsIn("相当于先送了你一半分，共 15 对")).toEqual(["0.5", "15"]);
  });
});
