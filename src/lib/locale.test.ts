/**
 * THE ADDRESSES OF THE TWO LANGUAGES, AND WHEN A STORED CHOICE MOVES SOMEBODY
 * (bilingual Part 2, 2026-09-29).
 *
 * Nothing else imports these helpers into a test: render-site never renders the
 * root layout, so the redirect's decision is pure and tested here, case by case,
 * including the Back button the first version got wrong. Serves BP-GOAL; N3 (the
 * /legal sentence describing this must be true of it).
 */
import { describe, expect, it } from "vitest";
import { ZH_ROUTES, chinesePath, counterpart, englishPath, hasChinese, localHref, localeOfPath, shouldSendToChinese } from "./locale";

const some = ZH_ROUTES.find((r) => r !== "/" && !r.includes("[")) ?? "/company";

describe("which language an address is in", () => {
  it("reads /zh and everything under it as Chinese, and nothing that merely starts with the letters", () => {
    expect(localeOfPath("/zh")).toBe("zh");
    expect(localeOfPath("/zh/company")).toBe("zh");
    expect(localeOfPath("/zh?x=1")).toBe("zh");
    expect(localeOfPath("/zh#h")).toBe("zh");
    expect(localeOfPath("/zhong")).toBe("en");
    expect(localeOfPath("/")).toBe("en");
  });

  it("maps each address to its counterpart and back, keeping the query and the hash", () => {
    expect(chinesePath("/")).toBe("/zh");
    expect(chinesePath("/#hearing")).toBe("/zh#hearing");
    expect(chinesePath("/company?ref=hn#a")).toBe("/zh/company?ref=hn#a");
    expect(englishPath("/zh")).toBe("/");
    expect(englishPath("/zh/company?ref=hn#a")).toBe("/company?ref=hn#a");
    expect(englishPath(chinesePath("/learn/why"))).toBe("/learn/why");
  });

  it("offers a counterpart only where one exists", () => {
    expect(hasChinese(some)).toBe(true);
    expect(counterpart(some)).toBe(chinesePath(some));
    expect(counterpart(chinesePath(some))).toBe(some);
    expect(counterpart("/no-such-page")).toBeNull();
  });

  it("localises internal links on a Chinese page only, and leaves external and API links alone", () => {
    expect(localHref("en", some)).toBe(some);
    expect(localHref("zh", some)).toBe(chinesePath(some));
    expect(localHref("zh", "/no-such-page")).toBe("/no-such-page");
    expect(localHref("zh", "https://example.com/")).toBe("https://example.com/");
    expect(localHref("zh", "/api/bias-card")).toBe("/api/bias-card");
  });
});

describe("when a stored choice of Chinese moves a visitor", () => {
  const base = { path: some, stored: "zh", navigation: "navigate", referrer: "", origin: "https://example.test" };

  it("moves a visitor who arrives from outside the site", () => {
    expect(shouldSendToChinese(base)).toBe(chinesePath(some));
    expect(shouldSendToChinese({ ...base, referrer: "https://news.example/item" })).toBe(chinesePath(some));
  });

  it("never on Back or Forward, or a reload", () => {
    expect(shouldSendToChinese({ ...base, navigation: "back_forward" })).toBeNull();
    expect(shouldSendToChinese({ ...base, navigation: "reload" })).toBeNull();
  });

  it("never when the visitor followed a link from this site, so the English stays beside the translation", () => {
    expect(shouldSendToChinese({ ...base, referrer: "https://example.test/zh/company" })).toBeNull();
  });

  it("never without a stored choice, on a Chinese page, or where no Chinese page exists", () => {
    expect(shouldSendToChinese({ ...base, stored: null })).toBeNull();
    expect(shouldSendToChinese({ ...base, stored: "en" })).toBeNull();
    expect(shouldSendToChinese({ ...base, path: chinesePath(some) })).toBeNull();
    expect(shouldSendToChinese({ ...base, path: "/no-such-page" })).toBeNull();
  });
});
