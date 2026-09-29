/**
 * THE CHINESE FRONT DOOR'S ONE BUILT SENTENCE (bilingual Part 2, 2026-09-29).
 *
 * `landingLeadZh` writes the machine count as a Chinese numeral with its measure
 * word, so it is a template like `landingLead` and is proven the same way: it
 * says the count it is given, keeps the owner's rules, and names the four things
 * Hume's judge needs in the English's order.
 */
import { describe, expect, it } from "vitest";
import { landingLeadZh } from "./copy/landing";
import { zhBanBreaches } from "./style";
import { carveOutBreaches } from "@/content/carve-out";

describe("the Chinese lead paragraph", () => {
  it("says the machine count it is given, as a numeral with its measure word", () => {
    expect(landingLeadZh(4)).toContain("四台机器");
    expect(landingLeadZh(3)).toContain("三台机器");
    expect(landingLeadZh(2)).toContain("两台机器");
  });

  it("keeps the owner's rules and the carve-out", () => {
    expect(zhBanBreaches(landingLeadZh(4))).toEqual([]);
    expect(carveOutBreaches(landingLeadZh(4))).toEqual([]);
  });

  it("names the four clauses in the English's order: prestige, damage, its size, the critic", () => {
    const s = landingLeadZh(4);
    const at = ["名气", "损伤在哪里", "小到什么程度", "评论家"].map((w) => s.indexOf(w));
    expect(at.every((i) => i >= 0)).toBe(true);
    expect([...at].sort((a, b) => a - b)).toEqual(at);
  });
});
