/**
 * THE OFFER REGISTER AND THE NO-COMPARISON RULE BITE IN CHINESE (bilingual Part 2, 2026-09-29).
 *
 * `register.ts` holds the reading's two rules (BA-3: a pattern sentence names no
 * feeling and asserts nothing; an offer is a question) and N3's (no comparison
 * with other people). The Chinese patterns in `zh/guards.ts` are only as good as
 * what they catch, so every pattern has a planted specimen that must trip it,
 * and the sentences the Chinese reading is built from must pass.
 */
import { describe, expect, it } from "vitest";
import { offerBreachesZh, patternBreachesZh } from "./register";
import { ASSERTIONS_ZH, COMPARISON_ZH } from "./zh/guards";

const FEELING_SPECIMENS = ["你深夜听歌，是因为孤独。", "这些歌里有一种怀旧的情绪。", "你近来心情低落。"];

const ASSERTION_SPECIMENS = [
  "你很难过。",
  "你需要安静。",
  "这说明你还没走出来。",
  "你显然在找什么。",
  "内心深处，你在等。",
];

const COMPARISON_SPECIMENS = [
  "你排在第 90 百分位。",
  "你在前 5% 的听者里。",
  "大多数听者不会这样听。",
  "你听得比别人多。",
  "与其他人相比，你更常跳过。",
  "你的同龄人很少这样。",
  "这对一般的听者来说很少见。",
  "超过 80% 的人都这样。",
];

/** Sentences the Chinese reading's templates produce. They must pass. */
const CLEAN_PATTERNS = [
  "你有 38% 的播放发生在夜里 11 点到凌晨 4 点之间。",
  "有三首歌占了你 120 次播放中的 44%。",
];
const CLEAN_OFFERS = ["深夜是只属于你的那段时间吗？", "还是说，这是陪你入睡、或者让你晚点睡的音乐？"];

describe("the register holds in Chinese", () => {
  it("a pattern sentence that names a feeling fails", () => {
    expect(FEELING_SPECIMENS.filter((s) => patternBreachesZh(s).length === 0)).toEqual([]);
  });

  it("every assertion pattern has a specimen that trips it", () => {
    expect(ASSERTIONS_ZH.filter((p) => !ASSERTION_SPECIMENS.some((s) => p.test(s))).map(String)).toEqual([]);
    expect(ASSERTION_SPECIMENS.filter((s) => patternBreachesZh(s).length === 0)).toEqual([]);
  });

  it("every comparison pattern has a specimen that trips it, in a pattern and in an offer", () => {
    expect(COMPARISON_ZH.filter((p) => !COMPARISON_SPECIMENS.some((s) => p.test(s))).map(String)).toEqual([]);
    expect(COMPARISON_SPECIMENS.filter((s) => patternBreachesZh(s).length === 0)).toEqual([]);
    expect(COMPARISON_SPECIMENS.filter((s) => offerBreachesZh(`${s}吗？`).length === 0)).toEqual([]);
  });

  it("an offer must be a question, ending in the full-width question mark", () => {
    expect(offerBreachesZh("深夜是只属于你的那段时间。")).toContain("is not a question");
    expect(offerBreachesZh("深夜是只属于你的那段时间吗?")).toContain("is not a question");
  });

  it("the sentences the reading is built from pass", () => {
    expect(CLEAN_PATTERNS.flatMap(patternBreachesZh)).toEqual([]);
    expect(CLEAN_OFFERS.flatMap(offerBreachesZh)).toEqual([]);
  });

  it("an offer may name a feeling, because a question hands it to the reader", () => {
    expect(offerBreachesZh("这会让你想念某个人吗？")).toEqual([]);
  });
});
