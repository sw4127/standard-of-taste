/**
 * THE GLOSSARY AS DATA (bilingual track, Part 1, 2026-09-29).
 *
 * `docs/glossary-zh.md` is the one text; the owner approved its terms on
 * 2026-09-29. This file holds the same terms in the shape the guard needs, and
 * `zh-style.test.ts` fails if any `zh` or `en` here is missing from that table.
 * Serves BP-GOAL (a reviewer can read the core in a second language) and BA-12;
 * the guard is N3's.
 *
 * `en` is the English the reader sees in brackets at a term's first use on a
 * page: 阈值（threshold）. `firstUse: false` marks a term that is also an
 * everyday word, where brackets after every first 保留 would be noise; the
 * alternates are refused for those as for every other term.
 *
 * `alternates` are renderings the glossary did not choose. Each is refused on
 * every Chinese surface, whatever the page. They are engineering's list, not
 * the owner's, and each names the error it catches.
 */

export interface GlossaryTerm {
  /** The chosen Chinese. */
  zh: string;
  /** The English shown in brackets at first use. */
  en: string;
  /** Whether the first body occurrence on a page must read zh（en）. */
  firstUse: boolean;
  /** Renderings refused everywhere, each with the reason. */
  alternates: readonly (readonly [string, string])[];
}

const MT = "the machine-translation rendering";

export const GLOSSARY: readonly GlossaryTerm[] = [
  { zh: "论品味的标准", en: "Standard of Taste", firstUse: true, alternates: [["论趣味的标准", "the common published title, whose 趣味 the owner ruled wrong in sense"], ["品味标准", "a clipped form of the site name"]] },
  { zh: "《论品味的标准》", en: "Of the Standard of Taste", firstUse: true, alternates: [] },
  // Musical taste is 品味 in both senses, preference and discernment (owner, 2026-09-30); no bracket, since taste is an everyday word.
  { zh: "品味", en: "taste", firstUse: false, alternates: [["口味", "owner ruling 2026-09-30: musical taste is 品味 in every sense"], ["趣味", "owner ruling 2026-09-29: its sense is wrong here"], ["品位", "a homophone that means social standing"]] },
  { zh: "鉴赏力", en: "delicacy of taste", firstUse: true, alternates: [["敏锐度", MT]] },
  { zh: "解读", en: "the reading", firstUse: false, alternates: [["读解", "a rarer word for the same thing"], ["解析报告", "names a report, and the reading is a set of lines"]] },
  { zh: "示例听者", en: "illustrative listener", firstUse: false, alternates: [["虚拟听众", "听众 is an audience"], ["示例听众", "听众 is an audience"], ["虚构听者", "the glossary chose 示例"]] },
  { zh: "播放记录", en: "plays", firstUse: false, alternates: [["播放历史", MT], ["听歌记录", "a consumer-app phrase"], ["收听记录", "a radio phrase"]] },
  { zh: "规律", en: "pattern", firstUse: false, alternates: [["听歌模式", "the loan translation the guide refuses"], ["收听模式", "the loan translation the guide refuses"]] },
  { zh: "依据", en: "receipt", firstUse: false, alternates: [["收据", "the loan translation the guide refuses"], ["凭证", "an accounting word"]] },
  { zh: "只提示，不断言", en: "offer, do not assert", firstUse: false, alternates: [] },
  { zh: "提示", en: "offer", firstUse: false, alternates: [] },
  { zh: "保留", en: "keep", firstUse: false, alternates: [] },
  { zh: "删去", en: "reject", firstUse: false, alternates: [] },
  { zh: "提示词", en: "prompt", firstUse: false, alternates: [["提示语", "the glossary chose 提示词"], ["提示文本", MT]] },
  { zh: "创作界面", en: "creation screen", firstUse: false, alternates: [["生成界面", "names the machine, and the screen belongs to the person making music"], ["创作页面", "the glossary chose 界面"]] },
  { zh: "听辨测试", en: "hearing tests", firstUse: false, alternates: [["听力测试", "an audiology or language exam"]] },
  { zh: "名气偏差测试", en: "Prestige Test", firstUse: true, alternates: [["声望测试", MT], ["名望测试", MT], ["声望偏差测试", MT]] },
  { zh: "细辨测试", en: "Delicacy Trials", firstUse: true, alternates: [["精细度测试", MT], ["敏感度测试", MT], ["细腻度测试", MT]] },
  { zh: "阈值测试", en: "Threshold Test", firstUse: true, alternates: [["门槛测试", MT]] },
  { zh: "排序测试", en: "Ranking Test", firstUse: true, alternates: [["排名测试", "ranks people, and the test orders recordings"]] },
  { zh: "音高漂移", en: "pitch drift", firstUse: false, alternates: [["音调漂移", "the glossary chose 音高"]] },
  { zh: "节拍模糊", en: "timing smear", firstUse: false, alternates: [] },
  { zh: "压缩损伤", en: "compression damage", firstUse: false, alternates: [] },
  // Hume's criteria that have no bracket elsewhere, and the arc across sittings (bilingual Part 4).
  { zh: "不受偏见左右", en: "freedom from prejudice", firstUse: true, alternates: [["不受成见左右", "the glossary chose 偏见"]] },
  { zh: "良好的判断力", en: "good sense", firstUse: true, alternates: [] },
  { zh: "训练线", en: "arc", firstUse: false, alternates: [["这条线", "ambiguous: it reads as the noise floor the sentence just named"]] },
  { zh: "阈值", en: "threshold", firstUse: true, alternates: [["门槛值", MT], ["临界值", "a physics term"]] },
  { zh: "音分", en: "cents", firstUse: true, alternates: [["美分", "the currency, the classic machine-translation error"]] },
  { zh: "音准", en: "tuning", firstUse: true, alternates: [["调音", "the act of tuning an instrument"]] },
  { zh: "节拍", en: "timing", firstUse: true, alternates: [["时序", "a signal-processing term"]] },
  { zh: "保真度", en: "fidelity", firstUse: true, alternates: [["逼真度", MT], ["还原度", MT]] },
  { zh: "公司视角", en: "Company view", firstUse: false, alternates: [["公司视图", MT], ["企业视角", "the glossary chose 公司"]] },
  { zh: "商业论证", en: "business case", firstUse: true, alternates: [["商业案例", MT]] },
  { zh: "指标体系", en: "metric tree", firstUse: true, alternates: [["指标树", MT]] },
  { zh: "北极星指标", en: "north star", firstUse: true, alternates: [] },
  { zh: "护栏指标", en: "guardrail", firstUse: true, alternates: [["守护指标", MT]] },
  { zh: "终止条件", en: "kill criteria", firstUse: true, alternates: [["叫停标准", "the glossary chose 终止条件"], ["淘汰标准", MT]] },
  { zh: "规划假设", en: "planning assumption", firstUse: true, alternates: [] },
  { zh: "A/B 测试", en: "A/B test", firstUse: false, alternates: [["AB测试", "the glossary writes A/B 测试"]] },
  { zh: "每组", en: "per arm", firstUse: false, alternates: [["每臂", MT]] },
  { zh: "基线", en: "baseline", firstUse: true, alternates: [] },
  { zh: "最小可检测效应", en: "MDE", firstUse: true, alternates: [["最小可检测效果", "the glossary chose 效应"]] },
  { zh: "产品洞察", en: "insight", firstUse: true, alternates: [["洞见", "the glossary chose 产品洞察"]] },
  { zh: "未满足的需求", en: "unmet demand", firstUse: true, alternates: [["未被满足的需求", "the glossary chose 未满足的需求"]] },
  { zh: "需求", en: "demand", firstUse: false, alternates: [] },
  { zh: "被挑战的常识", en: "challenged assumption", firstUse: true, alternates: [["被挑战的假设", "the glossary chose 常识"]] },
  { zh: "有依据", en: "EVIDENCED", firstUse: true, alternates: [] },
  { zh: "假设", en: "ASSUMED", firstUse: false, alternates: [] },
  { zh: "推论", en: "INFERENCE", firstUse: true, alternates: [] },
  { zh: "模拟", en: "SIMULATED", firstUse: false, alternates: [] },
  { zh: "实测", en: "MEASURED", firstUse: true, alternates: [] },
  { zh: "真实", en: "REAL", firstUse: false, alternates: [] },
  { zh: "示意", en: "ILLUSTRATIVE", firstUse: false, alternates: [] },
  { zh: "裁定", en: "ruling", firstUse: false, alternates: [["裁决", "the glossary chose 裁定"], ["判决", "a court's word"]] },
  { zh: "项目章程", en: "constitution，即 CLAUDE.md", firstUse: true, alternates: [["宪法", "names a state's constitution"]] },
  { zh: "否决", en: "refusal", firstUse: false, alternates: [] },
  { zh: "改判", en: "reversal", firstUse: false, alternates: [["反转", "a plot twist"]] },
  { zh: "证伪记录", en: "falsified registry", firstUse: false, alternates: [["证伪登记", "the glossary chose 记录"]] },
  { zh: "红线条款", en: "carve-out", firstUse: true, alternates: [["例外条款", "the carve-out is a prohibition, and 例外 reads as a permission"]] },
  { zh: "巴纳姆效应", en: "Barnum effect", firstUse: true, alternates: [["巴南效应", "a variant transliteration"]] },
  { zh: "参数复原", en: "parameter recovery", firstUse: true, alternates: [["参数恢复", "the glossary chose 复原"]] },
  { zh: "项目反应理论", en: "IRT", firstUse: true, alternates: [["题目反应理论", "a variant rendering"]] },
  { zh: "实验室", en: "The Lab", firstUse: false, alternates: [] },
  { zh: "方法", en: "The Method", firstUse: false, alternates: [] },
  { zh: "资料室", en: "The Library", firstUse: false, alternates: [["阅览室", "the glossary chose 资料室"]] },
];
