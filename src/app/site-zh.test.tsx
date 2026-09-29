/**
 * THE SITE IN TWO LANGUAGES, READ AS A READER RECEIVES IT (bilingual Part 2, 2026-09-29).
 *
 * The owner asked for one button that switches a page into Chinese and back,
 * a Chinese address a recruiter can send, and Chinese that holds to the same
 * rules as the English. Every check here reads RENDERED pages, because a
 * sentence assembled from data has no literal to grep (`render-site.tsx`).
 *
 * 1. THE ROUTE LIST IS THE FILE SYSTEM. `ZH_ROUTES` decides where the switch
 *    shows; it must name exactly the pages under `src/app/zh/`.
 * 2. EACH LANGUAGE STAYS ON ITS OWN PAGES. No Chinese on an English page but
 *    the switch's own label; no untranslated English on a Chinese page beyond
 *    what the brief keeps in English (names, units, IDs, the English a term
 *    carries in brackets, titles in 《》, a verbatim quote in 「」).
 * 3. EVERY CHINESE PAGE SAYS IT IS A TRANSLATION, from the one constant, and
 *    offers the way back.
 * 4. A CHINESE PAGE LINKS TO CHINESE PAGES wherever one exists.
 * 5. NO LOOKUP MISSES. A key whose English moved no longer finds its Chinese,
 *    and the page would fall back to English; the render records every miss.
 * 6. NUMBERS COME FROM SLOTS. A Chinese value carries the same `{slots}` as its
 *    English key and no digit its key lacks, so it cannot state a count the
 *    English does not.
 *
 * WHAT IT CANNOT DO: read a screen no static render reaches (a flow's later
 * steps); those strings are held by the source scan in `zh-style.test.ts` and
 * the literal check below. Serves BP-GOAL and BA-12; N3.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { attributeText, renderSite, textOf, type RenderedSite } from "@/test-utils/render-site";
import { ZH_ROUTES, chinesePath, hasChinese, localeOfPath } from "@/lib/locale";
import { ZH_TRANSLATION_NOTE } from "@/content/zh/style";
import { SWITCH_TO_ZH } from "@/content/zh/copy/chrome";

vi.mock("next/navigation", async (orig) => ({
  ...(await orig<typeof import("next/navigation")>()),
  useRouter: () => ({ push() {}, replace() {}, prefetch() {}, back() {}, forward() {}, refresh() {} }),
  usePathname: () => globalThis.__SITE_PATH ?? "/",
  useSearchParams: () => new URLSearchParams(),
}));

const CJK = /[　-〿一-鿿＀-￯]/;
const DICTIONARIES = import.meta.glob<{ default: Record<string, string> }>("../content/zh/copy/**/*.ts", { eager: true });
const ALL_KEYS = new Set(Object.values(DICTIONARIES).flatMap((m) => Object.keys(m.default ?? {})));

/**
 * English a Chinese page keeps, with the reason (the brief, Part 4: "share
 * images and link previews, audio, fictional names, and model and company
 * names ... stay in English"). A run of three or more lower-case English words
 * outside these is an untranslated sentence.
 */
function untranslated(text: string): string[] {
  const kept = text
    .replace(/（[^（）]*）/g, " ") // the English a term carries: 阈值（threshold）
    .replace(/《[^《》]*》/g, " ") // a title, kept in its language
    .replace(/「[^「」]*」/g, " "); // a verbatim quotation or a button label
  return [...kept.matchAll(/\b[a-z][a-z'’-]*(?:\s+[a-z][a-z'’-]*){2,}\b/g)].map((m) => m[0]);
}

function anchors(html: string): string[] {
  return [...html.matchAll(/<a\b[^>]*\bhref="([^"]*)"/g)].map((m) => m[1].replace(/&amp;/g, "&"));
}

let site: RenderedSite;
const misses = new Set<string>();

beforeAll(async () => {
  globalThis.__ZH_MISSES = misses;
  site = await renderSite();
}, 120_000);

const zhPages = () => site.pages.filter((p) => localeOfPath(p.route) === "zh");
const enPages = () => site.pages.filter((p) => localeOfPath(p.route) === "en");
const allText = (p: RenderedSite["pages"][number]) => [textOf(p.html), attributeText(p.html), ...p.meta].join("\n");

describe("the route list is the file system", () => {
  it("names exactly the pages under src/app/zh", () => {
    const files = Object.keys(import.meta.glob("./zh/**/page.tsx"))
      .map((k) => k.replace(/^\.\/zh/, "").replace(/\/?page\.tsx$/, "") || "/")
      .sort();
    expect([...ZH_ROUTES].sort()).toEqual(files);
  });

  it("rendered every Chinese page, and at least one (a floor, so an empty list cannot pass)", () => {
    expect(site.failed).toEqual([]);
    expect(zhPages().length).toBeGreaterThanOrEqual(ZH_ROUTES.filter((r) => !r.includes("[")).length);
    expect(zhPages().length).toBeGreaterThanOrEqual(1);
  });
});

describe("each language stays on its own pages", () => {
  it("no English page shows Chinese, except the switch's own label", () => {
    const hits = enPages().flatMap((p) =>
      allText(p)
        .split(SWITCH_TO_ZH)
        .join("")
        .split("\n")
        .filter((l) => CJK.test(l))
        .map((l) => `${p.route}: ${l.trim().slice(0, 60)}`),
    );
    expect(hits).toEqual([]);
  });

  it("no Chinese page shows an untranslated English sentence", () => {
    const hits = zhPages().flatMap((p) => untranslated(allText(p)).map((u) => `${p.route}: ${u}`));
    expect(hits).toEqual([]);
  });

  it("declares its language on the page (lang=zh-Hans)", () => {
    expect(zhPages().filter((p) => !p.html.includes('lang="zh-Hans"')).map((p) => p.route)).toEqual([]);
  });

  it("finds every sentence it looks up (no key whose English moved)", () => {
    expect([...misses]).toEqual([]);
  });
});

describe("every Chinese page says it is a translation and offers the way back", () => {
  it("carries the translation note from its one constant", () => {
    expect(zhPages().filter((p) => !textOf(p.html).includes(ZH_TRANSLATION_NOTE)).map((p) => p.route)).toEqual([]);
  });

  it("offers EN, linking to the English page", () => {
    const missing = zhPages().filter((p) => {
      const en = p.route.slice(3) || "/";
      return !new RegExp(`<a\\b[^>]*href="${en.replace(/[/]/g, "\\/")}"[^>]*>EN</a>`).test(p.html);
    });
    expect(missing.map((p) => p.route)).toEqual([]);
  });

  it("every English page with a Chinese counterpart offers the switch to it", () => {
    const missing = enPages()
      .filter((p) => hasChinese(p.route))
      .filter((p) => !p.html.includes(`href="${chinesePath(p.route)}"`) || !p.html.includes(`>${SWITCH_TO_ZH}</a>`));
    expect(missing.map((p) => p.route)).toEqual([]);
  });
});

describe("a Chinese page links to Chinese pages wherever they exist", () => {
  it("sends no internal link to an English page that has a Chinese counterpart, except the switch", () => {
    const hits = zhPages().flatMap((p) => {
      const back = p.route.slice(3) || "/";
      return anchors(p.html)
        .filter((h) => h.startsWith("/") && !h.startsWith("//") && localeOfPath(h) === "en" && h !== back && hasChinese(h))
        .map((h) => `${p.route} → ${h}`);
    });
    expect(hits).toEqual([]);
  });
});

describe("every dictionary entry keeps its English's numbers", () => {
  const entries = Object.entries(DICTIONARIES).flatMap(([file, m]) =>
    Object.entries(m.default ?? {}).map(([en, zh]) => ({ file, en, zh })),
  );
  const slots = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
  // English writes a month as a word and Chinese as a number (4 May 2021, 2021 年 5 月 4 日),
  // so the key's month names count as its digits.
  const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  const months = (s: string) =>
    s.replace(new RegExp(`\\b(${MONTHS.join("|")})\\b`, "gi"), (m) => String(MONTHS.indexOf(m.toLowerCase()) + 1));
  /*
   * NUMBER WORDS COUNT TOO (red-team, bilingual Part 2). The first version read
   * Arabic digits only, so 五个部门 could become 六个部门 and stay green. English
   * number words and Chinese numerals are both turned into numbers. A bare 一 is
   * skipped: Chinese uses it where English writes "a" (一次, 一眼, 一种).
   */
  const EN_WORDS: Record<string, number> = {
    zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    eleven: 11, twelve: 12, fifteen: 15, twenty: 20, thirty: 30, forty: 40, fifty: 50, hundred: 100,
    thousand: 1000, third: 3, fourth: 4, fifth: 5, sixth: 6, tenth: 10, twice: 2, double: 2, pair: 2, once: 1,
  };
  const enWords = (s: string) =>
    s.replace(new RegExp(`\\b(${Object.keys(EN_WORDS).join("|")})\\b`, "gi"), (m) => String(EN_WORDS[m.toLowerCase()]));
  const ZH_DIGIT: Record<string, number> = { 零: 0, 〇: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
  const ZH_UNIT: Record<string, number> = { 十: 10, 百: 100, 千: 1000 };
  function zhNumber(run: string): number {
    let total = 0;
    let digit = 0;
    for (const ch of run) {
      if (ch in ZH_DIGIT) digit = ZH_DIGIT[ch];
      else {
        total += (digit || 1) * ZH_UNIT[ch];
        digit = 0;
      }
    }
    return total + digit;
  }
  // 百分点, 百分比, 百分位 name a unit, and 十分 before anything but 之 means "very": neither is a count.
  const zhWords = (s: string) =>
    s
      .replace(/百分(?=点|比|位)/g, " ")
      .replace(/十分(?!之)/g, " ")
      .replace(/[零〇一二两三四五六七八九十百千]+/g, (run) => (run === "一" ? " " : ` ${zhNumber(run)} `));
  const digits = (s: string) =>
    [...zhWords(enWords(months(s))).replace(/\{\w+\}/g, "").matchAll(/\d+(?:[.,]\d+)*/g)].map((m) => m[0]);

  it("reads number words in both languages (planted)", () => {
    expect(digits("What five departments would ask")).toEqual(["5"]);
    expect(digits("六个部门会问什么")).toEqual(["6"]);
    expect(digits("二十五次")).toEqual(["25"]);
    expect(digits("一次，一眼")).toEqual([]);
  });

  it("reads the dictionaries (a floor)", () => {
    expect(entries.length).toBeGreaterThan(50);
  });

  it("carries exactly its key's slots", () => {
    expect(entries.filter((e) => slots(e.en).join() !== slots(e.zh).join()).map((e) => `${e.file}: ${e.en.slice(0, 50)}`)).toEqual([]);
  });

  it("states no digit its key does not", () => {
    const bad = entries.filter((e) => digits(e.zh).some((d) => !digits(e.en).includes(d)));
    expect(bad.map((e) => `${e.file}: ${e.en.slice(0, 50)} → ${digits(e.zh).join(",")}`)).toEqual([]);
  });
});

describe("every literal the source looks up has its Chinese", () => {
  function walk(dir: string, out: string[] = []): string[] {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path, out);
      else if (/\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name)) out.push(path);
    }
    return out;
  }
  it("finds each t(\"...\") literal in a dictionary", () => {
    const missing = walk("src").flatMap((f) =>
      [...readFileSync(f, "utf8").matchAll(/\bt\(\s*"((?:[^"\\]|\\.)*)"/g)]
        .map((m) => JSON.parse(`"${m[1]}"`) as string)
        .filter((k) => !ALL_KEYS.has(k))
        .map((k) => `${f.replace(/\\/g, "/")}: ${k.slice(0, 60)}`),
    );
    expect(missing).toEqual([]);
  });
});
