/**
 * 页眉、导航与语言按钮 · The chrome every page shares (bilingual Part 2).
 *
 * Keys are the English the chrome renders; values are the Chinese. Held to the
 * owner's rules by `zh-style.test.ts`. The header and navigation are exempt from
 * the first-use rule (docs/glossary-zh.md), because they repeat on every page.
 */
import type { Dict } from "@/lib/i18n";

/** The switch's label on an English page, in Chinese, which is the one Chinese an English page shows. */
export const SWITCH_TO_ZH = "中文";

/** The site's main title and subtitle (owner, 2026-09-29). */
export const ZH_TITLE = "鉴衡";
export const ZH_SUBTITLE = "论品味的标准";

const CHROME: Dict = {
  // Navigation (src/content/site-nav.ts).
  "THE READING": "解读",
  "THE HEARING TESTS": "听辨测试",
  "THE COMPANY VIEW": "公司视角",
  "THE LIBRARY": "资料室",
  "THE LAB": "实验室",
  "THE METHOD": "方法",
  Site: "网站导航",
  // The switch on a Chinese page.
  "Read this page in English": "切换到英文原文",
};

export default CHROME;
