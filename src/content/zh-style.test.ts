/**
 * EVERY CHINESE STRING, HELD TO THE OWNER'S RULES (bilingual track, Part 1, 2026-09-29).
 *
 * The owner asked for a Chinese site written in their own register, with 不是
 * banned in every form, no contrast frames, no dashes, ellipses or exclamation
 * marks, and each technical term shown as 中文（English） at its first use on a
 * page. A rule that lives in a style guide is read once; this reads every
 * string, every run. Serves BP-GOAL and BA-12; N3.
 *
 * WHAT IS READ, and why it is all of it:
 *   1. every dictionary under `src/content/zh/copy/`, which is where every
 *      Chinese sentence the site renders must live;
 *   2. the note and the document header line in `zh/style.ts`;
 *   3. every Chinese document in the repository (`*.zh.md`, `*.zh.html`),
 *      line by line, markdown syntax removed;
 *   4. every rendered Chinese page (`/zh/...`), body text and metadata.
 * And it fails if a Chinese character appears in source ANYWHERE ELSE, because
 * a sentence typed straight into a component would be a surface no rule reads,
 * which is the defect the carve-out learned about from model text it could not
 * see.
 *
 * THE COUNT FLOOR. A guard over an empty corpus is green, and so is a guard
 * whose collector silently broke. `ZH_CORPUS_FLOOR` is the number of strings
 * this test last read; it fails if the corpus falls below it and fails if the
 * corpus grows more than ten per cent past it without the floor being raised,
 * so the number in this file is always close to the truth.
 *
 * WHAT IT CANNOT DO: judge a verb, or tell a good sentence from a bad one. A
 * green run means none of the listed failures appears.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { GLOSSARY } from "./zh/glossary";
import { ZH_BANS, ZH_DOC_NOTE, ZH_TRANSLATION_NOTE, zhBanBreaches } from "./zh/style";
import { attributeText, renderSite, textOf, type RenderedSite } from "@/test-utils/render-site";
import { renderReadingStates } from "@/test-utils/reading-states";

vi.mock("next/navigation", async (orig) => ({
  ...(await orig<typeof import("next/navigation")>()),
  useRouter: () => ({ push() {}, replace() {}, prefetch() {}, back() {}, forward() {}, refresh() {} }),
  usePathname: () => globalThis.__SITE_PATH ?? "/",
  useSearchParams: () => new URLSearchParams(globalThis.__SITE_SEARCH ?? ""),
}));

/** Strings last read. Raise it in the same commit that adds Chinese copy. */
// 2026-09-29: 2 in Part 1 (the two notes); 243 after Part 2's first slice (the chrome, the
// Company view, the D1 statements, the Chinese blueprint and one rendered page); 655 after
// the reading (its copy, its line templates read from source, the sound words, /zh/reading); 745
// after the front door (/zh); 1101 after /learn/why and the Ranking Test.
const ZH_CORPUS_FLOOR = 1101;

const CJK = /[　-〿一-鿿＀-￯]/;

// ---- the corpus ---------------------------------------------------------------------------------

/*
 * THE READ ZONE AND THE EXEMPT ZONE ARE ONE SET (red-team, Part 1). Chinese may
 * appear in source only in `zh/copy/**` (read here, at any depth, both as values
 * and as source literals), `zh/glossary.ts` (the alternates, which are refused,
 * not rendered), `zh/guards.ts` (the patterns the other guards refuse or parse
 * with, never rendered) and `zh/style.ts` (the two notes, read here). A module
 * anywhere else under `zh/` would have been exempt from the stray check and read
 * by nothing.
 */
const DICTIONARIES = import.meta.glob<{ default: Record<string, string> }>("./zh/copy/**/*.ts", { eager: true });
const MAY_HOLD_CHINESE = (f: string) =>
  f.startsWith("src/content/zh/copy/") ||
  ["src/content/zh/glossary.ts", "src/content/zh/guards.ts", "src/content/zh/style.ts"].includes(f);

/**
 * Every Chinese string literal in `zh/copy/**`, read from the SOURCE, so a
 * sentence in a template function or a named export is scanned even when no
 * test renders it. A template literal is split at its `${...}` slots.
 */
export function sourceLiterals(source: string): string[] {
  const out: string[] = [];
  for (const m of source.matchAll(/"((?:[^"\\\n]|\\.)*)"|'((?:[^'\\\n]|\\.)*)'|`((?:[^`\\]|\\.)*)`/g)) {
    const body = m[1] ?? m[2] ?? m[3] ?? "";
    for (const part of body.split(/\$\{[^}]*\}/)) if (CJK.test(part)) out.push(part);
  }
  return out;
}

function copySourceStrings(): ZhString[] {
  return walk("src/content/zh/copy")
    .filter((f) => /\.tsx?$/.test(f))
    .flatMap((f) => sourceLiterals(readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\/|(^|\s)\/\/.*$/gm, "$1")).map((text) => ({ where: `${f} (source)`, text })));
}

interface ZhString {
  where: string;
  text: string;
}

function dictionaryStrings(): ZhString[] {
  return Object.entries(DICTIONARIES).flatMap(([file, mod]) =>
    Object.entries(mod.default ?? {}).map(([key, text]) => ({ where: `${file} :: ${key.slice(0, 60)}`, text })),
  );
}

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".") || name === "Claude outputs") continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else out.push(path.replaceAll("\\", "/"));
  }
  return out;
}

/**
 * A Chinese document's lines, with the syntax a reader never sees removed:
 * link targets, inline code, HTML tags and table pipes. What is left is prose.
 */
export function documentProse(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) =>
      l
        .replace(/\]\([^)]*\)/g, "]")
        .replace(/`[^`]*`/g, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/^\s*(#+|[-*]|\d+\.|>)\s*/, "")
        .replace(/\|/g, " "),
    )
    .filter((l) => CJK.test(l));
}

const zhDocuments = () => walk(".").filter((f) => /\.zh\.(md|html)$/.test(f));

function documentStrings(): ZhString[] {
  return zhDocuments().flatMap((f) => documentProse(readFileSync(f, "utf8")).map((text) => ({ where: f, text })));
}

// ---- the rules ----------------------------------------------------------------------------------

/** Glossary alternates found in the text, as "alternate: reason". */
export function alternateBreaches(text: string): string[] {
  return GLOSSARY.flatMap((t) => t.alternates.filter(([alt]) => text.includes(alt)).map(([alt, why]) => `${alt}: ${why}`));
}

/**
 * The first body occurrence of each first-use term must read zh（en）.
 * Longer terms are found first and masked, so 阈值 inside 阈值测试 and 需求
 * inside 未满足的需求 are not mistaken for a first use of the shorter term.
 */
export function firstUseBreaches(body: string): string[] {
  let masked = body;
  const firstAt = new Map<string, number>();
  for (const term of [...GLOSSARY].sort((a, b) => b.zh.length - a.zh.length)) {
    let from = 0;
    for (;;) {
      const i = masked.indexOf(term.zh, from);
      if (i < 0) break;
      if (!firstAt.has(term.zh)) firstAt.set(term.zh, i);
      masked = masked.slice(0, i) + "\u0000".repeat(term.zh.length) + masked.slice(i + term.zh.length);
      from = i + term.zh.length;
    }
  }
  const out: string[] = [];
  for (const term of GLOSSARY) {
    const at = firstAt.get(term.zh);
    if (!term.firstUse || at === undefined) continue;
    const want = `${term.zh}（${term.en}）`;
    if (body.slice(at, at + want.length) !== want) out.push(`first ${term.zh} should read ${want}: …${body.slice(at, at + term.zh.length + 12)}`);
  }
  return out;
}

/**
 * A page's body: the header and navigation repeat on every page and are exempt.
 * So is a prompt the visitor carries out (a `<pre>` or `<textarea>`): it is text
 * for a music generator, and a bracketed English term inside it would be pasted
 * with it. The bans still read it.
 */
export function bodyOf(html: string): string {
  return textOf(
    html
      .replace(/<header\b[\s\S]*?<\/header>/g, " ")
      .replace(/<nav\b[\s\S]*?<\/nav>/g, " ")
      .replace(/<(pre|textarea)\b[\s\S]*?<\/\1>/g, " "),
  );
}

// ---- the specimens ------------------------------------------------------------------------------

/** One planted string per ban. Each must trip its own ban, or the ban is dead. */
const BANNED_SPECIMENS: readonly string[] = [
  "这条不是你的口味。",
  "并不是每个人都听得出。",
  "这是解读而非测量。",
  "这并非测量，而是解读。",
  "与其说是偏好，不如说是习惯。",
  "你的评分反而拉得更开。",
  "这恰恰说明问题。",
  "阈值——也就是最小可听差异。",
  "还有很多……",
  "试试看！",
  "值得注意的是，这里有模拟数据。",
  "在音乐生成普及的背景下，需求增长。",
  "它不仅便宜，而且快。",
  "愿你听得更准。",
  "显著改善了听感。",
  "此事遂成。",
  "每个人的音乐趣味不同。",
  "这张收据列出了播放。",
  "我们进行了测试。",
  "他说“这条不对”。",
  "阈值(threshold)",
  "阈值 （threshold）",
  "这条对,那条不对",
  "这条不对.",
  "每条附上依据（receipt）, 相符的留下。",
];

/** The guide's own worked examples (§6). They must pass every ban. */
const CLEAN_SPECIMENS: readonly string[] = [
  "一个人一个月的播放记录，逐条读出，每条附上依据（receipt）。相符的留下，不符的删去，剩下的带进提示词（prompt）。",
  "「这条不对」",
  "用别人的一个月试试。",
  ZH_TRANSLATION_NOTE,
  ZH_DOC_NOTE,
  // An offer is phrased this way (BA-3); the classical 许是 ban must not catch it.
  "也许是你在等房间安静下来？",
  "或许是习惯？",
];

// ---- the tests ----------------------------------------------------------------------------------

let site: RenderedSite;
let zhPages: RenderedSite["pages"] = [];

beforeAll(async () => {
  site = await renderSite();
  // The reading's later steps too, which no route-by-route render reaches (red-team, Part 2).
  const states = (await renderReadingStates()).filter((p) => p.route.startsWith("/zh/"));
  zhPages = [...site.pages.filter((p) => p.route === "/zh" || p.route.startsWith("/zh/")), ...states];
}, 180_000);

function corpus(): ZhString[] {
  return [
    ...dictionaryStrings(),
    ...copySourceStrings(),
    { where: "zh/style.ts :: ZH_TRANSLATION_NOTE", text: ZH_TRANSLATION_NOTE },
    { where: "zh/style.ts :: ZH_DOC_NOTE", text: ZH_DOC_NOTE },
    ...documentStrings(),
  ];
}

describe("the bans are alive (each planted specimen trips, each clean one passes)", () => {
  it("every ban has a specimen that trips it", () => {
    const dead = ZH_BANS.filter((b) => !BANNED_SPECIMENS.some((s) => b.pattern.test(s)));
    expect(dead.map((b) => b.why)).toEqual([]);
  });

  it("every banned specimen is caught", () => {
    expect(BANNED_SPECIMENS.filter((s) => zhBanBreaches(s).length === 0)).toEqual([]);
  });

  it("the guide's worked examples and the site's own notes pass", () => {
    expect(CLEAN_SPECIMENS.map((s) => [s, zhBanBreaches(s)]).filter(([, b]) => b.length)).toEqual([]);
  });

  it("不是 is caught in every form the owner named", () => {
    for (const s of ["不是", "并不是", "是不是", "不是这样，而是那样"]) expect(zhBanBreaches(s)).not.toEqual([]);
  });

  it("the first-use rule catches a bare first use and accepts the bilingual one", () => {
    expect(firstUseBreaches("你的阈值是十二音分。")).toHaveLength(2);
    expect(firstUseBreaches("你的阈值（threshold）是十二音分（cents）。之后的阈值不再加注。")).toEqual([]);
    // A longer term is not a first use of the shorter one inside it.
    expect(firstUseBreaches("阈值测试（Threshold Test）测出阈值（threshold）。")).toEqual([]);
    expect(firstUseBreaches("阈值测试（Threshold Test）测出阈值。")).toHaveLength(1);
  });

  it("an alternate rendering is caught", () => {
    expect(alternateBreaches("你的阈值是十二美分。")).not.toEqual([]);
    expect(alternateBreaches("你的阈值是十二音分。")).toEqual([]);
  });
});

describe("every Chinese string on the site and in the documents keeps the rules", () => {
  it("reads at least as many strings as it last read, and the floor is kept current", () => {
    const n = corpus().length + zhPages.length;
    expect(n, "the corpus shrank below the floor: a collector may have broken").toBeGreaterThanOrEqual(ZH_CORPUS_FLOOR);
    expect(ZH_CORPUS_FLOOR, `raise ZH_CORPUS_FLOOR to ${n}: the corpus grew past it`).toBeGreaterThanOrEqual(Math.floor(n * 0.9));
  });

  it("no perma-ban appears", () => {
    const hits = corpus().flatMap((s) => zhBanBreaches(s.text).map((why) => `${s.where}: ${s.text.slice(0, 40)} → ${why}`));
    expect(hits).toEqual([]);
  });

  it("no glossary term appears in a rendering the glossary did not choose", () => {
    const hits = corpus().flatMap((s) => alternateBreaches(s.text).map((a) => `${s.where}: ${a}`));
    expect(hits).toEqual([]);
  });

  it("every rendered Chinese page keeps the bans everywhere a reader looks, and writes each term bilingually at first use in its body", () => {
    expect(site.failed).toEqual([]);
    const hits = zhPages.flatMap((p) => {
      // Bans and alternates: header, navigation, attributes and metadata too.
      // attributeText joins with an English ".\n", which would read as a stray full stop.
      const all = [textOf(p.html), ...attributeText(p.html).split(".\n"), ...p.meta].join("\n");
      const chinese = all.split("\n").filter((l) => CJK.test(l)).join("\n");
      return [
        ...firstUseBreaches(bodyOf(p.html)).map((b) => `${p.route}: ${b}`),
        ...zhBanBreaches(chinese).map((b) => `${p.route}: ${b}`),
        ...alternateBreaches(all).map((b) => `${p.route}: ${b}`),
      ];
    });
    expect(hits).toEqual([]);
  });

  it("every Chinese document writes each term bilingually at first use", () => {
    const hits = zhDocuments().flatMap((f) =>
      firstUseBreaches(documentProse(readFileSync(f, "utf8")).join("\n")).map((b) => `${f}: ${b}`),
    );
    expect(hits).toEqual([]);
  });
});

describe("the glossary is the approved one, and Chinese lives only where it is read", () => {
  it("every term in the data appears in docs/glossary-zh.md", () => {
    const doc = readFileSync("docs/glossary-zh.md", "utf8");
    const missing = GLOSSARY.filter((t) => !doc.includes(t.zh) || !doc.includes(t.en)).map((t) => `${t.zh}（${t.en}）`);
    expect(missing).toEqual([]);
  });

  it("every first-use term's bilingual form is the one the glossary prints", () => {
    const doc = readFileSync("docs/glossary-zh.md", "utf8");
    const missing = GLOSSARY.filter((t) => t.firstUse && !doc.includes(`${t.zh}（${t.en}）`)).map((t) => t.zh);
    expect(missing).toEqual([]);
  });

  it("no Chinese character appears in source outside the files this test reads", () => {
    const stray = walk("src")
      .filter((f) => /\.(ts|tsx)$/.test(f) && !MAY_HOLD_CHINESE(f) && !/\.test\.tsx?$/.test(f))
      .filter((f) => CJK.test(readFileSync(f, "utf8")));
    expect(stray).toEqual([]);
  });
});
