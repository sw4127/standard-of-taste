/**
 * 排序测试的结果文字 · The Ranking Test's reading in Chinese (bilingual Part 2; D1, N3).
 *
 * One function per English function in `src/content/vocabulary/spread.ts`, each
 * branch for branch, in the same order `spreadLines` emits them. D1 stands here:
 * every sentence is about what the ratings did, never about the person. Counts
 * are written as digits from the result, never typed. Held by
 * `zh/spread-lines.test.ts` over every refusal and every direction.
 * DRAFT: not yet through the owner's writing pass.
 */
import type { SpreadResult } from "@/engine/spread";
import { MIN_PAIRS_PER_KIND, SPREAD_POOL } from "@/content/spread/ranking";

export const RECOGNITION_DISCLOSURE_ZH =
  "哪些录音你以前听过，由你自己说，这里照单全收，不做任何核实。认出的录音只会被剔除；你认出了什么，从来不进入结果。";

export const SPREAD_BOUNDARY_ZH =
  "两个数字都不代表你同意他，也不可能代表：这里只看同一对作品上你的两个评分差了多远，从不看你把哪一部排得更高。" +
  "偏爱他排得更低的作品，对你没有任何影响，因为他的先后顺序从未导入，也无法推算出来。" +
  `数字小也并非成绩差：${SPREAD_POOL.length} 部不同作品的 ${SPREAD_POOL.length} 段录音，并没有按质量拉开距离；` +
  "如果它们听起来确实接近，把它们评得接近才是准确的做法。";

export function recognitionLineZh(result: SpreadResult): string {
  const n = result.excludedClipIds.length;
  const left = result.usedClipIds.length;
  if (n === 0) return "你说这些都不熟悉，所以全部计入。" + RECOGNITION_DISCLOSURE_ZH;
  if (left === 0) return `这里的每一段你以前都听过，所以 ${n} 段全部剔除。` + RECOGNITION_DISCLOSURE_ZH;
  return (
    `你以前听过的 ${n} 段录音在计算之前已经剔除，下面的结果只基于另外 ${left} 段新录音。` +
    RECOGNITION_DISCLOSURE_ZH
  );
}

export function spreadRefusalZh(result: SpreadResult): string {
  const set = result.excludedClipIds.length;
  const left = result.usedClipIds.length;
  if (result.refusal === "too-few-rated-clips") {
    return (
      `这 ${set} 段你以前全都听过，所以这里没有可读的东西。这项测试只适用于你没听过的音乐：` +
      "对已经熟悉的东西，评分有一部分来自记忆，事后没有任何测量工具能把两者分开。" +
      "再做一次也解决不了，除非曲库里的音乐比现在多。曲库扩充之后再来。"
    );
  }
  const far = result.refusal === "too-few-far-pairs";
  const count = far ? result.far.count : result.close.count;
  const spacing = far ? "相隔很远" : "挨得很近";
  return (
    `这次没有数字。剔除你以前听过的 ${set} 段之后，剩下 ${left} 段录音，` +
    `只能组成 ${count} 对可用的、${spacing}的配对，而这里至少需要 ${MIN_PAIRS_PER_KIND} 对。` +
    "低于这个数量，一段录音的波动就比要测的东西还大。你换一种做法也改变不了这一点，只有曲库变大才行。"
  );
}

const points = (n: number) => n.toFixed(1);

export function figuresLineZh(result: SpreadResult): string {
  const far = result.far.meanGap;
  const close = result.close.meanGap;
  if (far === null || close === null) throw new Error("figuresLineZh: called on a refused reading");
  return (
    `在他排得相隔很远的 ${result.far.count} 对作品上，你给同一对里两部作品的评分平均相差 ${points(far)} 分。` +
    `在他排得挨在一起的 ${result.close.count} 对上，相差 ${points(close)} 分。` +
    `随机评分在两者上都会得到 ${points(result.spreadIfIndifferent)}，因为随机不知道评论家把哪些作品分开了。`
  );
}

export function directionLineZh(result: SpreadResult): string {
  const far = result.far.meanGap;
  const close = result.close.meanGap;
  if (far === null || close === null) throw new Error("directionLineZh: called on a refused reading");
  if (far === 0 && close === 0) {
    return "你给每一部都打了同样的分，所以没有差距可比，这里也没有可分析的东西。这本身就是一个回答，并非没能给出回答。";
  }
  const shape =
    far > close
      ? "在他判断拉开的地方，你的评分也拉得更开"
      : far < close
        ? "在他判断没有拉开的地方，你的评分拉得更开"
        : "两种情况下，你的评分拉开的幅度一样";
  return (
    `${shape}。这说明了什么，这项测试回答不了：一边 ${result.far.count} 对，一边 ${result.close.count} 对，` +
    "取自同一组录音，每段录音都出现在好几对里；也还没有人做过两次，看这些数字自己会漂移多少。" +
    "差距大到多少才算结果，没有一个诚实的标准，所以这里不给。"
  );
}

/** The Chinese of `spreadLines`: the same parts, in the same order. */
export function spreadLinesZh(result: SpreadResult): string[] {
  return [
    recognitionLineZh(result),
    ...(result.refusal ? [spreadRefusalZh(result)] : []),
    ...(result.refusal ? [] : [figuresLineZh(result), directionLineZh(result)]),
    SPREAD_BOUNDARY_ZH,
  ];
}
