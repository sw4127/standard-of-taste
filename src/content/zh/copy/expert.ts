/**
 * 原始记录面板 · The raw-record panel in Chinese (bilingual Part 2; D1, N3, D6).
 *
 * Keys are the exact English in `src/content/vocabulary/expert.ts` and the few
 * strings `src/components/ExpertPanel.tsx` writes itself. Every word is about
 * the record, never a verdict. DRAFT: not yet through the owner's writing pass.
 */
import type { Dict } from "@/lib/i18n";

/** The Chinese of `brierNote`. */
export function brierNoteZh(brier: number, n: number, chance: number): string {
  return (
    `${n} 个回答的布里尔分数（Brier score）为 ${brier.toFixed(3)}；在二选一时一直说 50%，得分是 ${chance.toFixed(2)}。` +
    "分数越低越好，但只有对照上面的图，它才有意义：虚线对角线代表完美校准，单看分数，看不出你落在它的哪一侧。"
  );
}

const EXPERT: Dict = {
  // The panel.
  "THE RAW RECORD": "原始记录",
  show: "展开",
  hide: "收起",
  "Every number behind the result, and the answer key. No verdict, no interpretation — and it is read from this browser, so a link you share carries none of it.":
    "结果背后的每一个数字，以及答案。不作评判，也不作解释；这些内容只来自本浏览器，所以你分享的链接不会带上其中任何一项。",

  // Sections.
  "By flaw family": "按瑕疵类别",
  "By rung": "按梯级",
  "Did you know when you knew?": "你自报的把握准不准？",
  "Every pair, in the order you met them": "每一对，按你遇到的顺序",
  "The session": "本次测试",
  "Every rung · gentlest first": "每一级 · 从最轻的开始",
  "What the pipeline measured and could not fix": "处理流程测到但无法修正的地方",
  "Every clip": "每一段录音",
  "Controls · rated twice, labelled neither time": "对照组 · 打了两次分，两次都没有标签",
  "Every clip, in the order you heard them": "每一段录音，按你听到的顺序",
  "Every pair that counted · by the numbers above": "计入结果的每一对 · 编号见上表",

  // Columns.
  Family: "类别",
  Caught: "听出",
  Shown: "出现",
  Rung: "梯级",
  "#": "#",
  Original: "原版",
  "You picked": "你选的",
  "Flaw named": "说出的瑕疵",
  Said: "自报把握",
  Right: "答对",
  Where: "位置",
  Clip: "录音",
  Blind: "盲听",
  Labelled: "带标签",
  "Toward label": "向标签靠拢",
  "Room to move": "可移动的余地",
  Label: "标签",
  First: "第一次",
  Second: "第二次",
  Drift: "漂移",
  "You said": "你说的",
  Of: "共",
  Delivered: "实际",
  "Versus claim": "与自报相比",
  Work: "作品",
  "Your rating": "你的评分",
  "In the result": "是否计入",
  Pair: "配对",
  "In his ranking": "在他的排名里",
  "Positions apart": "相隔位数",
  "Your gap": "你的差距",

  // Stats.
  Trials: "试次",
  Outcome: "结果",
  "Caught at": "听出于",
  "Missed at": "漏掉于",
  "Fitted point": "拟合点",
  "95% interval": "95% 区间",
  "Before correction": "校正前",
  "After correction": "校正后",
  "Control drift": "对照组漂移",
  "Moved with label": "随标签移动",
  "At the scale edge": "在量表的端点",
  "Swapped items only": "只看换过标签的录音",
  "Clips counted": "计入的录音",
  "Set aside": "剔除",
  "Widely-spaced pairs": "相隔很远的配对",
  "Closely-spaced pairs": "挨得很近的配对",
  "Mean gap · widely spaced": "平均差距 · 相隔很远",
  "Mean gap · closely spaced": "平均差距 · 挨得很近",
  "Rating at random": "随机评分",

  // Values.
  "too few to say": "数量太少，无从判断",
  "not earned": "条件不足，未给出",
  caught: "听出",
  guessed: "靠猜",
  "in band": "区间内",
  true: "真实",
  fictional: "虚构",
  "—": "无",
  "set aside": "剔除",
  counted: "计入",
  "far apart": "相隔很远",
  bracketed: "挨在一起",
  "{n} pts": "{n} 个百分点",
  "{a} of {b}": "{b} 个中的 {a} 个",
  "rung {n}": "第 {n} 级",
  delivered: "实际",
  claimed: "自报",
  "Calibration: {points}": "校准：{points}",
  "claimed {c}%, delivered {d}%": "自报 {c}%，实际 {d}%",

  // Notes.
  "Timing rungs are shown by number: the pool stores them as a tempo fraction and the staircase measures milliseconds of drift, so quoting one as the other would be a guess.":
    "节拍（timing）的梯级只显示编号：曲库把它们存为速度比例，阶梯测试测的是毫秒级的漂移，用一个去报另一个只能是猜测。",
  "The two percentages agree because the pool carries as many acclaimed labels as dismissive ones, and a balanced set cancels re-listen drift outright. The correction is shown anyway: it is what would move if that balance ever changed.":
    "两个百分比一致，是因为曲库里褒扬的标签和贬低的标签一样多，这样平衡的一组录音能把重听带来的漂移完全抵消。校正仍然列出：一旦这种平衡改变，变化的就是这一项。",
  "The pairs below are your ratings as they fell; the averages are missing because too few pairs survived for either one to mean anything. Nothing has been hidden — the figure was never worked out.":
    "下面的配对是你的原始评分；平均数空着，因为留下的配对太少，哪个平均数都说明不了什么。这里没有隐藏任何东西，这个数字从来没有算过。",
  "The distance column is the whole of what was taken from the critic's list. Which of two works he placed higher was never read in, so no table here can be sorted into his order and no agreement figure can be recovered from it — not by this page, not by you, not later.":
    "距离这一列，就是从评论家的排名里取来的全部信息。两部作品中他把哪一部排得更高，从未读入，所以这里没有哪张表能按他的顺序排列，也无法从中还原出任何一致程度的数字：这个页面做不到，你做不到，以后也做不到。",
  "What follows is the end of your blind sitting. These six were rated before you knew what they were, and they cannot be again — a second attempt at this instrument would be rating music you have now been told about.":
    "再往下看，你的盲听就结束了。这六段是在你不知道它们是什么的时候打的分，以后不会再有这种机会：再做一次这项测试，你评的就是已经知道名字的音乐。",
  // An interval's two ends; the dash is banned in Chinese copy.
  "{lo} – {hi}": "{lo} 至 {hi}",
  // The Threshold Test's outcome kinds (`StaircaseResult["kind"]`), shown in the session table.
  threshold: "得出阈值",
  below: "低于阶梯最轻一级",
  above: "高于阶梯最重一级",
  inconclusive: "没有结论",
};

export default EXPERT;
