/**
 * 名气偏差测试的结果，中文模板 · The Prestige Test's result in Chinese (bilingual Part 4; D1, N3).
 *
 * One function per English function, from the same result: the headline and the
 * share text (`src/content/bias/copy.ts`), the creator lines
 * (`src/content/vocabulary/bias.ts`), the comparison reading
 * (`src/content/vocabulary/comparison.ts`) and the control disclosure. Every
 * sentence is about what the ratings did (D1); no percentile and no cohort (N3).
 * Templates only (BA-10). Held by `zh/bias-lines.test.ts` on every fixture the
 * English is held on. DRAFT: not yet through the owner's writing pass.
 */
import type { BiasResult, BiasVerdict } from "@/engine/bias";
import type { ComparisonResult } from "@/engine/comparison";
import { ASSERTION_FLOOR } from "@/engine/comparison";
import { MIN_ASSERTED_PAIRS, comparisonDegreesClaim, comparisonStabilityClaim } from "@/engine/evidence";
import { hasBiasReading } from "@/content/bias/copy";
import { CRITIC_SCALES, OUR_SCALE } from "@/content/comparison/scales";
import { BIAS_SCALE_MAX, BIAS_SCALE_MIN } from "@/engine/bias";

const signed = (n: number) => `${n > 0 ? "+" : ""}${n}`;

/* ------------------------------------------------------------------ *
 * The headline and the share text (bias/copy.ts)
 * ------------------------------------------------------------------ */

export const VERDICT_COPY_ZH: Record<BiasVerdict, { title: string; sub: string }> = {
  swayed: { title: "被标签牵着走。", sub: "名字一进门，你的标准就跟着走了。" },
  steady: { title: "耳朵很稳。", sub: "名气来了。你的评分几乎没有抬头。" },
  contrarian: { title: "唱反调。", sub: "你听到了赞誉，然后为此扣了分。换了一种偏差，仍然是偏差。" },
};

export const BIAS_NO_READING_ZH = {
  title: "没有读数。",
  sub:
    "每一段录音都已经停在它的标签所指方向的量表尽头，所以没有哪个评分有移动的余地。" +
    "这是关于评分的事实，算不上结果：它并非零，是空缺。" +
    "盲听时更多地用上整个量表，这里才会有东西可测。",
};

export function biasHeadlineZh(result: BiasResult): { pct: string | null; title: string; sub: string } {
  if (!hasBiasReading(result)) return { pct: null, ...BIAS_NO_READING_ZH };
  return { pct: `${signed(result.pct)}%`, ...VERDICT_COPY_ZH[result.verdict] };
}

export function titleFragmentForZh(result: BiasResult): string {
  return hasBiasReading(result) ? `朝名字偏了 ${signed(result.pct)}%` : "没有读数";
}

export function shareTextForZh(result: BiasResult): string {
  return hasBiasReading(result)
    ? `名人的名字一出现，我的评分就偏了 ${signed(result.pct)}%。测出你的数字：`
    : "我给每段录音都打在量表的尽头，所以测试没有东西可测。测出你的数字：";
}

/* ------------------------------------------------------------------ *
 * The creator lines (vocabulary/bias.ts)
 * ------------------------------------------------------------------ */

export const CUE_IN_YOUR_WORK_ZH =
  "在你自己的作品里，标签很少是作曲家的名字。" +
  "它是哪个模型生成的、你在提示词（prompt）上花了多久，以及你是否已经跟别人说过，这一版就是好的那一版。";

export function whatToDoAboutItZh(verdict: BiasVerdict): string {
  if (verdict === "contrarian") {
    return "你的评分逆着名字走，没有顺着走，这仍然是名字在掌舵，只是方向相反。办法不变：在标签到来之前做决定，别等它来了之后。";
  }
  if (verdict === "steady") {
    return "这个结果关乎这些名字、这一次测试。上面那些线索，这项测试没法摆到你面前，所以这里没有测量过它们对你判断的影响。";
  }
  return "这项测试先把每段录音不带标签地放一遍，这个顺序值得借用：线索要在判断之前就拿走，别指望判断之后再把它辩掉。";
}

export function creatorLinesBiasZh(result: BiasResult): string[] {
  return hasBiasReading(result) ? [CUE_IN_YOUR_WORK_ZH, whatToDoAboutItZh(result.verdict)] : [];
}

/** The control disclosure in the debrief (`controlDisclosure`). */
export function controlDisclosureZh(controlCount: number, driftPts: number): string {
  return (
    `另有 ${controlCount} 段录音在任何一轮里都没有带过标签：它们是对照组。` +
    `它们测量你的评分在单纯重听时漂移了多少（记忆、熟悉感、疲劳），而这个漂移（你的是 ${signed(driftPts)} 分）` +
    `已经从你的主数字里校正掉了，所以「第二轮只是记忆」这件事是测出来的，并非假设。`
  );
}

/* ------------------------------------------------------------------ *
 * The comparison reading (vocabulary/comparison.ts)
 * ------------------------------------------------------------------ */

export const COMPARISON_BOUNDARY_ZH =
  "这些都没有说你的耳朵窄。" +
  "这些录音从来没有按质量拉开距离：如果它们真的挨得很近，那样听就是对的答案，而这项测试分不清这种情况和一个把什么都听成差不多的听者。";

export const COMPARISON_PANEL_ZH = {
  eyebrow: "比较 · 休谟的第五条标准",
  statLabel: "你用到的称赞分档",
  criticsEyebrow: "专业评论者怎样用他们自己的量表",
  // No brackets: the toggle follows a space, and a space before （ is refused.
  show: "展开",
  hide: "收起",
  criticsBlurb: "它并非目标，也并非给你的分数。两个公开发表的量表，以及它们的主人实际上怎样使用它们。",
} as const;

/** The panel's stat: "8 of 11" in English, 8 档（共 11 档） in Chinese; this is the part after the accent. */
export function degreesOfZh(available: number): string {
  return `档（共 ${available} 档）`;
}

export function degreesLineZh(say: {
  degreesUsed: number;
  degreesAvailable: number;
  degreesIfIndifferent: number;
  lowestUsed: number;
  highestUsed: number;
  itemCount: number;
}): string {
  const spread =
    say.degreesUsed === say.degreesAvailable
      ? `这个量表提供的全部 ${say.degreesAvailable} 档`
      : `其中 ${say.degreesUsed} 档（这个量表共提供 ${say.degreesAvailable} 档）`;
  const full = say.highestUsed - say.lowestUsed === say.degreesAvailable - 1;
  const range =
    say.lowestUsed === say.highestUsed
      ? `全都在 ${say.lowestUsed} 分`
      : full
        ? "最高分和最低分都用上了"
        : `没有低于 ${say.lowestUsed} 分的，也没有高于 ${say.highestUsed} 分的`;
  return (
    `你把 ${say.itemCount} 段录音放在了${spread}上，${range}。` +
    `一个随机打分的人，大约会用到 ${Math.round(say.degreesIfIndifferent)} 档。`
  );
}

export function stabilityLineZh(say: { asserted: number; kept: number; tied: number; reversed: number }): string {
  const scope =
    `在你拉开的 ${say.asserted} 对录音里（拉开 ${ASSERTION_FLOOR} 分或以上，` +
    `只计屏幕上的名字把两段往同一方向推的配对）`;
  if (say.reversed === 0) return `${scope}，你每一对都放回了同样的顺序。`;
  const ties = say.tied === 0 ? "" : `，另有 ${say.tied} 对变成了同分`;
  return `${scope}，有 ${say.reversed} 对在第二次被你颠倒了顺序${ties}。`;
}

const CRITIC_ZH: Record<string, string> = {
  Pitchfork: "Pitchfork",
  "Robert Christgau's Consumer Guide": "Robert Christgau 的 Consumer Guide",
};

const FINDING_ZH: Record<string, string> = {
  "The scale runs from 0.0 to 10.0 in tenths, which is a hundred and one places a record can land.":
    "这个量表从 0.0 到 10.0，精确到小数点后一位，一张唱片可以落在一百零一个位置上。",
  "Across more than 18,000 reviews published between January 1999 and January 2017, the mean score was 7.0.":
    "在 18,000 多篇评论里（发表于 1999 年一月至 2017 年一月），平均分是 7.0。",
  "Most of those scores lie between 6.4 and 7.8.": "这些分数大多落在 6.4 到 7.8 之间。",
  "Scores ending in .0 appear nearly twice as often as scores ending in .1 — the reviewers avoid the decimals their own scale offers them.":
    "以 .0 结尾的分数，出现得几乎两倍于以 .1 结尾的分数：评论者回避了自己的量表提供给他们的小数。",
  "The Consumer Guide's letter grades ran from A+ down to E−.": "Consumer Guide 的字母等级从 A+ 一路排到 E−。",
  "From 1990 he used fewer letter grades for records below B+, replacing the bottom of his own ladder with honourable mentions and the categories Choice Cuts, Neither and Duds.":
    "从 1990 年起，他给 B+ 以下的唱片用的字母等级变少了，把自己等级阶梯的底部换成了荣誉提名（honourable mentions），以及 Choice Cuts、Neither 和 Duds 这几个类别。",
};

/** A critic finding in Chinese, or a loud failure: an English finding on the Chinese page is a defect. */
function finding(statement: string): string {
  const zh = FINDING_ZH[statement];
  if (zh === undefined) throw new Error(`no Chinese for the critic finding "${statement.slice(0, 50)}"`);
  return zh;
}

export function criticReferenceLinesZh(): string[] {
  return CRITIC_SCALES.map((e) => `${CRITIC_ZH[e.critic] ?? e.critic}：${e.findings.map((f) => finding(f.statement)).join("")}`);
}

export function ourScaleLineZh(): string {
  return (
    `这项测试给你 ${OUR_SCALE.degreesAllowed} 档（${BIAS_SCALE_MIN} 到 ${BIAS_SCALE_MAX}，只取整数），只问你用了其中多少档。` +
    `它不问你用得对不对。并没有哪一档是对的。`
  );
}

export function comparisonRefusalZh(gap: string, result: ComparisonResult): string {
  if (gap === "too-few-asserted-pairs") {
    return (
      `你的评分挨得太近，第二个数字没有意义：它需要 ${MIN_ASSERTED_PAIRS} 对拉开 ${ASSERTION_FLOOR} 分或以上的配对，` +
      `这次测试只有 ${result.pairs.asserted} 对。` +
      `低于这个数，一段录音的晃动对答案的影响，比答案本身的变化还大，所以这里没有值得打印的东西。`
    );
  }
  return `这次测试的录音数少于量表的档数，所以用满分 ${result.degreesAvailable} 档来计数，等于拿你从未得到的空间来衡量你。`;
}

/** `comparisonLines`, in Chinese: the degrees, the stability, the boundary. */
export function comparisonLinesZh(result: ComparisonResult): string[] {
  const degrees = comparisonDegreesClaim(result);
  const stability = comparisonStabilityClaim(result);
  return [
    degrees.ok ? degreesLineZh(degrees.value) : comparisonRefusalZh(degrees.gap, result),
    stability.ok ? stabilityLineZh(stability.value) : comparisonRefusalZh(stability.gap, result),
    COMPARISON_BOUNDARY_ZH,
  ];
}
