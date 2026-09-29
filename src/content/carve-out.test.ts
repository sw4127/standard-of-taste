/**
 * THE CARVE-OUT'S LIST BITES ON WHAT IT MUST, AND NOT ON WHAT THE SITE SAYS
 * ABOUT ITSELF (RT-Z10 a, BA-5; change list D3).
 *
 * The positives are planted specimens, one per pattern, and the first is the
 * sentence the snack's model actually rendered on 2026-09-23 — the reason the
 * therapy terms were added. The negatives are sentences the site renders today
 * in which a broad pattern would fire on the product talking about its own
 * engineering; each is a reason a pattern was narrowed.
 */
import { describe, expect, it } from "vitest";
import { CARVE_OUT, CARVE_OUT_PATTERNS, carveOutBreaches } from "./carve-out";

const MUST_TRIP = [
  "You don't hate people — you hate the noise they make, and you've learned that headphones are cheaper than therapy.",
  "You chose the slower decay every time — you have unresolved loss.",
  "This pattern is common in anxious listeners.",
  "Late nights like these can be a sign of depression.",
  "A therapist would call this avoidance.",
  "It reads like grief.",
  "Something from your childhood is in here.",
  "The pattern looks traumatic.",
  "Songs about abuse, on repeat.",
  "Clinically, this is rumination.",
  "Worth asking about your mental health.",
];

const MUST_PASS = [
  "Your result is a measured number, not a diagnosis.",
  "And directly above it, the diagnosis: Nothing is blocked by engineering.",
  "You played the same three tracks on most nights after midnight.",
  "Is this music for staying in a feeling, or for getting out of one?",
];

describe("the carve-out list", () => {
  it("is one list, and a real one", () => {
    expect(CARVE_OUT_PATTERNS.length).toBeGreaterThanOrEqual(8);
  });

  it("trips on every planted specimen, the snack's own sentence first", () => {
    const missed = MUST_TRIP.filter((s) => carveOutBreaches(s).length === 0);
    expect(missed).toEqual([]);
    // The combined expression the site scanner uses agrees with the list.
    expect(MUST_TRIP.filter((s) => !CARVE_OUT.test(s))).toEqual([]);
  });

  it("does not fire on the site describing its own engineering, or on an offer", () => {
    expect(MUST_PASS.filter((s) => carveOutBreaches(s).length > 0)).toEqual([]);
    expect(MUST_PASS.filter((s) => CARVE_OUT.test(s))).toEqual([]);
  });

  it("catches therapy specifically, which neither older list did", () => {
    expect(carveOutBreaches("cheaper than therapy").length).toBe(1);
  });
});

/*
 * THE CHINESE HALF (bilingual Part 2, 2026-09-29). One specimen per Chinese
 * pattern, the brief's own words first, and the negatives a broad pattern would
 * wrongly catch: 无障碍 (accessibility) and a pattern sentence about late plays.
 */
const MUST_TRIP_ZH = [
  "这种听法像是创伤留下的痕迹。",
  "反复听关于虐待的歌。",
  "深夜这样听，可能是抑郁的信号。",
  "值得问问你的心理健康。",
  "这里面有你的童年。",
  "这读起来像悲痛。",
  "一段未解决的往事。",
  "耳机比心理咨询便宜。",
  "从临床上看，这是反刍。",
];
const MUST_PASS_ZH = [
  "页面提供无障碍说明。",
  "你有 38% 的播放发生在夜里 11 点到凌晨 4 点之间。",
  "深夜是只属于你的那段时间吗？",
];

describe("the carve-out list, in Chinese", () => {
  it("trips on every Chinese specimen, one per pattern", () => {
    expect(MUST_TRIP_ZH.filter((s) => carveOutBreaches(s).length === 0)).toEqual([]);
    expect(MUST_TRIP_ZH.filter((s) => !CARVE_OUT.test(s))).toEqual([]);
  });

  it("does not fire on accessibility, a pattern sentence or an offer", () => {
    expect(MUST_PASS_ZH.filter((s) => carveOutBreaches(s).length > 0)).toEqual([]);
  });
});
