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
