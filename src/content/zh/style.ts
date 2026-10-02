/**
 * THE CHINESE PERMA-BANS, AS ONE LIST (bilingual track, Part 1, 2026-09-29).
 *
 * The source is the owner's brief of 2026-09-29 ("不是 is banned in every form;
 * no 而不是 contrast frames, 恰恰, dashes, ellipses or exclamation marks") and
 * §2–§3 of Cowork's draft guide, which stays untracked until the owner approves
 * it. Every Chinese string a visitor or a recruiter reads is scanned against
 * this list by `zh-style.test.ts`. Serves BP-GOAL; N3.
 *
 * 不是 COMES FIRST AND HAS NO EXEMPTION. It is the owner's permanent ban, in
 * every form: 不是, 并不是, 是不是, 不是……而是. A negation, where one is
 * needed, uses 并非, 没有, 无, 未, 不属于 or 谈不上, chosen by meaning.
 *
 * WHAT IT CANNOT DO: judge a verb. The substitution test (could 进行, 实现,
 * 提升 or 负责 replace it without changing the meaning?) is a reading, and a
 * green run means none of THESE strings appears, not that the Chinese is good.
 * The avoid-verbs are refused outright because the guide names them; a
 * sentence that needs one literally is rewritten, which the guide also asks.
 */

export interface ZhBan {
  pattern: RegExp;
  why: string;
}

export const ZH_BANS: readonly ZhBan[] = [
  // The owner's permanent ban. Every form contains the two characters.
  { pattern: /不是/, why: "不是 is banned in every form (owner); say what the thing is, or use 并非／没有／无／未／不属于／谈不上" },
  // The frame, not only its words: 并非X，而是Y rebuilds 不是X，而是Y with the
  // negation this file recommends, so 而是 itself is refused (red-team, Part 1).
  { pattern: /而非|而是|与其说[^。？]*不如说/, why: "a contrast frame of the 而不是 family; say what the thing is" },
  // 反而 ("contrary to expectation") states an expectation the English never does (red-team, Part 2).
  { pattern: /反而/, why: "反而 implies an expectation the source does not state; say what happened" },
  { pattern: /恰恰/, why: "恰恰 is a crutch (owner)" },
  { pattern: /[—―–]/, why: "no dashes: 破折号 carries an aside, and the professional register has none" },
  { pattern: /…|\.\.\.|。。。/, why: "no ellipses: nothing trails off" },
  { pattern: /[！!]/, why: "no exclamation marks" },
  { pattern: /值得注意的是|总而言之|综上所述|让我们|相信/, why: "official-account and AI register (guide §3)" },
  { pattern: /在[^。；]{0,24}的背景下/, why: "在……的背景下 is official-account register (guide §3)" },
  { pattern: /不仅[^。；]*而且/, why: "不仅……而且 is official-account register (guide §3)" },
  { pattern: /(^|[。；，：？\s])愿/, why: "a blessing opener, 愿…… (guide §3)" },
  { pattern: /显著|高效|深度|全方位|多维度|无缝|极致|沉浸式|底层逻辑|颗粒度|链路|闭环|抓手/, why: "an adjective with no anchor, or jargon as ornament (guide §3)" },
  // 也许是 and 或许是 are how an offer is phrased (BA-3) and must pass.
  { pattern: /滥觞|厚颜|遂|罢|(?<![也或])许是/, why: "classical register (guide §3)" },
  { pattern: /趣味/, why: "owner ruling 2026-09-29: 趣味 is the wrong sense of taste; musical taste is 品味" },
  // 商业模式 is the ordinary word for a business model, and no loan translation.
  { pattern: /杀掉|收据|(?<!商业)模式/, why: "a loan translation (guide §3): cut, 依据, 规律" },
  // The avoid-verbs (guide §2). Each fails the substitution test by construction.
  { pattern: /进行|开展|实现|提升|推动|助力|赋能|打造|构建|落地|深耕|聚焦|围绕|致力于|旨在|对齐/, why: "an empty verb (guide §2): it can be swapped for 进行 without changing the meaning; choose the verb last" },
  // Quotation: 「」 only, and only for a verbatim quote or a button label.
  { pattern: /[“”‘’"]/, why: "quote marks are 「」, used only for a verbatim quotation or a button label" },
  // The full-width bracket rule: Chinese prose takes （）, never ASCII. An ASCII
  // bracket that touches or encloses Chinese is prose; one inside a formula is
  // mathematics, and a rule that refused the formula would be switched off.
  { pattern: /[一-鿿，。；：？、][()]|[()][一-鿿，。；：？、]|\([^()]*[一-鿿][^()]*\)/, why: "brackets in Chinese are full-width （）" },
  { pattern: /\s（|（\s|\s）/, why: "no space inside or before a full-width bracket: 阈值（threshold）" },
  // Full-width punctuation beside Chinese.
  { pattern: /[一-鿿）」][,;:?](?!\/)|[,;:?][一-鿿（「]/, why: "punctuation beside Chinese is full-width: ，；：？" },
  { pattern: /[一-鿿）」]\.(?![0-9A-Za-z])|(?<![0-9A-Za-z])\.[一-鿿]/, why: "a Chinese sentence ends in 。" },
];

/** Every ban the text trips, as the reason (empty when it is clean). */
export function zhBanBreaches(text: string): string[] {
  return ZH_BANS.filter((b) => b.pattern.test(text)).map((b) => b.why);
}

/**
 * The note every Chinese page carries near the top (guide §4), from one place.
 * Rendered by the Chinese shell and the documents' headers; `zh-style.test.ts`
 * holds it to the guide's wording.
 */
export const ZH_TRANSLATION_NOTE = "本站以英文写成，中文为译本；如有出入，以英文原文为准。";

/** The documents' header line (brief Part 5). */
export const ZH_DOC_NOTE = "中文为译本，以英文原文为准";
