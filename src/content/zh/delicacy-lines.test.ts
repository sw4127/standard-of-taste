/**
 * THE DELICACY TRIALS' RESULT IN CHINESE, BRANCH BY BRANCH (bilingual Part 4; D1, N3).
 *
 * Every detection band a session of this length can produce (every score from zero
 * to all), every calibration direction, the flaw line, the share text and the
 * creator lines, held line for line to the English: the same lines, the same
 * sentences, the numbers in the English's order, the direction words kept. D1
 * stands on every line; the carve-out and the no-comparison rule too.
 */
import { describe, expect, it } from "vitest";
import { detectionBand } from "@/engine/delicacy";
import { computeCalibration } from "@/engine/calibration";
import { MEASURED_TRIALS } from "@/content/delicacy/items";
import { calibrationLine, detectionBody, detectionTitle, flawLineText, shareText, PROVISIONAL_FOOTNOTE } from "@/content/delicacy/copy";
import { creatorLines } from "@/content/vocabulary/delicacy";
import { delicacyResults } from "@/content/vocabulary/fixtures";
import { carveOutBreaches } from "@/content/carve-out";
import { matches } from "@/content/register";
import { ABOUT_THE_PERSON_ZH, COMPARISON_ZH } from "./guards";
import { zhBanBreaches } from "./style";
import { parity } from "@/test-utils/zh-parity";
import {
  PROVISIONAL_FOOTNOTE_ZH,
  calibrationLineZh,
  creatorLinesDelicacyZh,
  detectionBodyZh,
  detectionTitleZh,
  flawLineTextZh,
  shareTextDelicacyZh,
} from "./copy/delicacy-lines";

function rules(text: string, where: string) {
  expect(zhBanBreaches(text), where).toEqual([]);
  expect(carveOutBreaches(text), where).toEqual([]);
  expect(matches(text, COMPARISON_ZH), where).toEqual([]);
  expect(ABOUT_THE_PERSON_ZH.test(text), `${where}: a readout claims something about the person (D1)`).toBe(false);
}

const N = MEASURED_TRIALS.length;

describe("the Chinese Delicacy result", () => {
  it("every score from zero to all: the title, the body, the share text", () => {
    const branches = new Set<string>();
    for (let k = 0; k <= N; k++) {
      const band = detectionBand(k, N);
      branches.add(band.excludesChance ? "clear" : k - N / 2 > 0 ? "margin" : band.lo === band.hi ? "flat" : "range");
      parity([detectionTitle(band), detectionBody(band), shareText(k, N)], [detectionTitleZh(band), detectionBodyZh(band), shareTextDelicacyZh(k, N)], `${k}/${N}`);
      rules([detectionTitleZh(band), detectionBodyZh(band), shareTextDelicacyZh(k, N)].join("\n"), `${k}/${N}`);
    }
    expect(branches.size).toBeGreaterThanOrEqual(3);
  });

  it("the calibration line in every direction, and inside the noise", () => {
    const cases = ([
      [95, 95, 95, 95, 95, 95],
      [50, 50, 50, 50, 50, 50],
      [70, 70, 70, 70, 70, 70],
    ] as Array<Array<50 | 70 | 95>>).flatMap((confs) =>
      [0, 2, 4, 6].map((right) => computeCalibration(confs.map((c, i) => ({ confidence: c, correct: i < right })))),
    );
    const dirs = new Set(cases.map((c) => (Math.abs(c.gapPct) < c.gapSePct ? "close" : c.direction)));
    expect(dirs.size).toBeGreaterThanOrEqual(3);
    for (const c of cases) {
      parity([calibrationLine(c)], [calibrationLineZh(c)], `calibration ${c.direction}`);
      rules(calibrationLineZh(c), "calibration");
    }
  });

  it("the flaw line and the footnote", () => {
    for (const [c, e] of [[1, 1], [3, 7], [0, 4]]) parity([flawLineText(c, e)], [flawLineTextZh(c, e)], `flaw ${c}/${e}`);
    parity([PROVISIONAL_FOOTNOTE], [PROVISIONAL_FOOTNOTE_ZH], "footnote");
    rules(PROVISIONAL_FOOTNOTE_ZH, "footnote");
  });

  for (const [name, r] of Object.entries(delicacyResults())) {
    it(`${name}: the creator lines`, () => {
      parity(creatorLines(r), creatorLinesDelicacyZh(r), name);
      rules(creatorLinesDelicacyZh(r).join("\n"), name);
    });
  }
});
