/**
 * THE CHINESE PATTERNS THE GUARDS READ WITH (bilingual Part 2, 2026-09-29).
 *
 * Every rule this repository holds English copy to has a Chinese side, and the
 * Chinese side is only as strong as its patterns. They live here, in one file,
 * because a Chinese pattern typed into a guard elsewhere would be Chinese
 * outside the files `zh-style.test.ts` accounts for. These are refused or
 * parsed words, never rendered prose; the copy lives in `copy/`.
 *
 * WHAT THEY CANNOT DO: read meaning. A green run means none of THESE words
 * appears. Serves BA-3, BA-5, D1 and N3 on the Chinese surfaces.
 */

/** A blueprint note's label: 有依据（EVIDENCED），定性. */
export const ZH_LABEL = /(有依据|假设|推论)（(?:EVIDENCED|ASSUMED|INFERENCE)）(，定性)?/;
/** A blueprint note's field name, which a page does not repeat. */
export const ZH_NOTE_FIELD = /^(标注|性质)：/;
/** Punctuation that may follow a label before the citation. */
export const ZH_LABEL_TAIL = "[。，：]?";

/**
 * THE CARVE-OUT IN CHINESE (RT-Z10 a, RT-6 a, BA-5). The brief's list first:
 * 创伤、虐待、心理健康、抑郁、焦虑、治疗、心理咨询、自伤, then each English pattern's
 * Chinese counterpart in `src/content/carve-out.ts`, in the same order. 障碍 is
 * matched only as a clinical compound, because 无障碍 (accessibility) is not one.
 */
export const CARVE_OUT_ZH_PATTERNS: readonly RegExp[] = [
  /创伤/,
  /虐待|施虐|受虐/,
  /抑郁|焦虑|创伤后应激|多动症|自闭|孤独症|神经多样/,
  /心理健康|精神健康|心理疾病|精神疾病/,
  /你的(?:童年|失去|丧失)/,
  /悲痛|哀伤|丧亲|哀悼/,
  /未解决|未化解/,
  /治疗|疗愈|心理咨询|咨询师|心理医生|精神科|心理治疗/,
  /临床|心理障碍|精神障碍|进食障碍|睡眠障碍|药物|服药|自伤|自残|自杀|轻生/,
];
export const CARVE_OUT_ZH = new RegExp(CARVE_OUT_ZH_PATTERNS.map((p) => p.source).join("|"));

/** D1's needle in Chinese: phrasings that make a claim about the person (site-d1.test.tsx). */
export const ABOUT_THE_PERSON_ZH =
  /你是(?:什么|哪)(?:样|种|类)的?(?:人|听者)|(?:什么|哪)(?:样|种|类)的(?:人|听者)|你是谁|(?:说明|揭示|透露|反映|暴露)(?:了|出)?(?:你|关于你)|你的(?:性格|人格|个性|脾气|心理|灵魂|心情|情绪|身份|内心|本性)|你(?:往往|倾向于|骨子里)|内心深处|内向|外向|性格|人格/;

/** Words that name a feeling (BA-3). None may appear in a pattern sentence. */
export const FEELING_WORDS_ZH =
  /难过|伤心|悲伤|孤独|寂寞|孤单|快乐|开心|高兴|愤怒|生气|压力|紧张|受伤|心碎|哀悼|害怕|恐惧|喜悦|怀念|怀旧|忧郁|感觉|感到|感受|情绪|心情|不安|麻木|空虚|希望|绝望|平静|安慰|想念|爱上|恋爱|迷失|失落/;

/** Shapes that assert something about the reader's inner life (BA-3). */
export const ASSERTIONS_ZH: readonly RegExp[] = [
  /你(?:很|一定|肯定|显然|似乎|好像|想必)?(?:难过|孤独|快乐|愤怒|有压力|受伤|害怕|焦虑|悲伤|怀旧|不安|麻木|空虚|迷失|失落|心碎)/,
  /你(?:感到|觉得|感觉|需要|想要|想念)(?![^？]*？)/,
  /(?:这|那|它)(?:说明|意味着|表明|证明|揭示|告诉我们)了?你/,
  /你(?:显然|明显|肯定|一定|必然)/,
  /内心深处/,
];

/** Comparison with other people (N3): there is no population behind the reading. */
export const COMPARISON_ZH: readonly RegExp[] = [
  /百分位|分位数/,
  /前\s*\d+\s*%/,
  /(?:大多数|多数|许多|很多|少数)(?:听者|听众|人|读者|用户)/,
  /(?:比|高于|低于|优于|差于)(?:平均|大多数人|别人|其他人|多数人)/,
  /(?:与|和|跟)(?:他人|别人|其他人|大家|所有人)(?:相比|比)/,
  /同龄人|同类人群/,
  /(?:不寻常|典型|正常|普通|一般)的(?:听者|量)/,
  /超过了?\s*\d+\s*%\s*的/,
];

/**
 * DIRECTION WORDS SURVIVE (red-team, bilingual Part 4). On the inverted lossy axis the
 * numbers cannot say which way a result points; the words do. Each English direction word
 * requires its Chinese one. A pair marked `twoWay` is narrow enough that its Chinese word
 * also requires the English one, which catches a Chinese line that invents a direction;
 * the broad pairs ("caught" also means other things) are one-way. Read by
 * `src/test-utils/zh-parity.ts`, on the template tests and on the instrument dictionaries.
 */
export interface DirectionPair {
  en: RegExp;
  zh: RegExp;
  twoWay?: boolean;
}
export const DIRECTION_PAIRS_ZH: readonly DirectionPair[] = [
  // "Below anything this session pinned down" is the gentler side, and Chinese says 更轻.
  { en: /gentl|below anything/i, zh: /更轻|最轻/ },
  { en: /harsh|loudest/i, zh: /更重|最重/ },
  { en: /\bcaught\b|\bcatch(es|ing)?\b|calling it|before you called it/i, zh: /听出|判断得出|仍然听得出|认出/ },
  // "You were guessing" is a claim about a rung; 随机猜对 ("chance") is not.
  { en: /were guessing/i, zh: /你是在猜/, twoWay: true },
  { en: /smaller flaw|smaller rung/i, zh: /更小的瑕疵|更小的一级/, twoWay: true },
  { en: /larger flaw/i, zh: /更大的瑕疵/, twoWay: true },
  { en: /closer to\s+zero/i, zh: /靠近了|更接近零/ },
  { en: /further from\s+zero/i, zh: /远离了|离零更远/ },
  // The Prestige Test: which way the ratings moved relative to the names.
  { en: /toward the names/i, zh: /朝名字/, twoWay: true },
  { en: /against the names/i, zh: /逆着名字/, twoWay: true },
  // The debrief: which way each swapped clip moved, and the two passes' scale ends.
  { en: /toward the lie|toward a label/i, zh: /朝着谎言|朝一个不真实的标签/, twoWay: true },
  { en: /— against it/i, zh: /逆着它/, twoWay: true },
  { en: /— unmoved/i, zh: /，没有动。/, twoWay: true },
  { en: /moved with the label/i, zh: /顺着标签/, twoWay: true },
  { en: /^0 — (never again|not at all)$/, zh: /^0：(再也不|完全不)/, twoWay: true },
  { en: /^10 — (all-timer|right now)$/, zh: /^10：(永远的心头好|马上就想)$/, twoWay: true },
  // The Delicacy calibration verdict and the Brier score's direction (red-team, Part 4).
  { en: /claim more than your ears deliver/i, zh: /你说的比你的耳朵做到的多/, twoWay: true },
  { en: /ears deliver more than you claim/i, zh: /你的耳朵做到的比你说的多/, twoWay: true },
  { en: /lower is better/i, zh: /越低越好/ },
];

/**
 * THE NUMBERS A CHINESE LINE STATES, IN ORDER, WHETHER IN DIGITS OR IN CHINESE NUMERALS
 * (red-team, bilingual Part 4). A parity check that read only digits let 十次里有九次 become
 * 十次里有三次 with every test green. A bare 一 is skipped (Chinese uses it where English
 * writes "a"), a unit's prefix or an idiom is not a count (百分点, 千比特, 十分, 四重奏,
 * 百老汇, 几十年), and 一半 is a half. Read by `src/test-utils/zh-parity.ts`.
 */
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
export function zhNumeralsIn(s: string): string[] {
  const cleaned = s
    .replace(/百分(?=点|比|位)|千(?=比特|赫)|十分(?!之)|[三四五]重奏|百老汇|[几数]十年/g, " ")
    .replace(/一半/g, " 0.5 ");
  const out: string[] = [];
  for (const m of cleaned.matchAll(/\d+(?:\.\d+)?|[零〇一二两三四五六七八九十百千]+/g)) {
    if (/^\d/.test(m[0])) out.push(m[0]);
    else if (m[0] !== "一") out.push(String(zhNumber(m[0])));
  }
  return out;
}
