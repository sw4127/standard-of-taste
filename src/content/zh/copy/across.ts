/**
 * 跨测试汇总 · The across-sessions panel in Chinese (bilingual Part 2; D1, N3).
 *
 * One function per English function in `src/content/vocabulary/across.ts`,
 * branch for branch, in the same order `acrossLines` emits them, and the copy
 * of the forget control (`src/content/forget.ts`). Every sentence is about what
 * the instruments measured, never about the person (D1), and nothing adds the
 * instruments up into one score. DRAFT: not yet through the owner's writing pass.
 */
import type { Dict } from "@/lib/i18n";
import type { AcrossInput } from "@/content/vocabulary/across";
import type { ReplicationCheck } from "@/engine/replication";
import type { StaircaseResult } from "@/engine/staircase-session";
import { quantity, shortUnit } from "@/content/staircase/copy";
import { DEGRADATION_FAMILIES, type DegradationFamily } from "@/engine/delicacy";
import { thresholdClaim } from "@/engine/evidence";

/** The Threshold Test's three families (`FAMILY_LABEL` in staircase/copy.ts). */
export const FAMILY_LABEL_ZH: Record<DegradationFamily, string> = {
  "pitch-drift": "音高漂移",
  "timing-smear": "节拍模糊",
  "lossy-artifact": "压缩损伤",
};
/** A family's Chinese name from an untyped family string (a URL slug's family, a stored result). */
export const familyLabelZh = (family: string) => FAMILY_LABEL_ZH[family as DegradationFamily] ?? family;
const label = familyLabelZh;

/**
 * The families as one list, from the engine's own list in its order, as `flawFamilyList` builds
 * the English: a family added or removed there changes this too (red-team, bilingual Part 4).
 */
const LABELS_IN_ORDER = DEGRADATION_FAMILIES.map((f) => FAMILY_LABEL_ZH[f]);
export const FLAW_FAMILY_LIST_ZH =
  LABELS_IN_ORDER.length <= 1
    ? LABELS_IN_ORDER.join("")
    : `${LABELS_IN_ORDER.slice(0, -1).join("、")}和${LABELS_IN_ORDER[LABELS_IN_ORDER.length - 1]}`;

/** A unit as Chinese names it: 音分 for cents; ms and kbps stay as written. */
export function unitZh(unit: string): string {
  const u = shortUnit(unit);
  return u === "cents" ? "音分" : u;
}
/** `quantity`, with the unit in Chinese. */
export function quantityZh(value: number, unit: string): string {
  return quantity(value, unit).replace(/ cents$/, " 音分");
}
/** `quantityZh`, with the glossary's first-use bracket on cents: 25 音分（cents）. */
export function quantityZhGlossed(value: number, unit: string): string {
  return shortUnit(unit) === "cents" ? `${quantityZh(value, unit)}（cents）` : quantityZh(value, unit);
}
/** `onSource`, in Chinese: the recording a lossy number was measured on. */
export function onSourceZh(result: Pick<StaircaseResult, "sourceId">): string {
  return result.sourceId ? `（录音 ${result.sourceId}）` : "";
}

export function dossierLineZh(input: AcrossInput): string | null {
  const parts: string[] = [];
  if (input.bias) parts.push("一个名字会不会改变你听到的东西");
  if (input.delicacy) parts.push("你能不能分辨损坏的和完好的，并说出损坏是什么");
  if (input.thresholds.length > 0) parts.push("瑕疵要小到什么程度你才听不出");
  if (input.spread) parts.push("你的评分是否在评论家判断拉开的地方拉开");
  if (parts.length < 2) return null;
  return (
    `关于你的耳朵，你已经回答了 ${parts.length} 个不同的问题：${parts.join("；")}。` +
    `它们并非同一件事的 ${parts.length} 个分数，也不能相加：每一个都用各自的尺度测量。`
  );
}

export function replicationLineZh(check: ReplicationCheck): string {
  const tested = check.agree + check.disagree;
  const what = `你的${label(check.family)}（单位：${unitZh(check.unit)}）`;
  const material = check.crossMaterial ? "，而且用的是不同的录音，这比任何一次单独测试都更难" : "";
  if (check.disagree === 0) {
    return (
      `两次独立的测试用不同的方法测了${what}，${tested} 项检查全部一致${material}。` +
      "在这里，这是最接近证据的结果：这个数字确有其事，并非某个下午的偶然。"
    );
  }
  if (check.agree === 0) {
    return (
      `两次独立的测试测了${what}，${tested} 项检查全部不一致${material}。` +
      "两次之中有一次没有如实描述你的耳朵；知道这一点，比拿着一个从未复测的数字更有价值。"
    );
  }
  return (
    `两次独立的测试测了${what}，${tested} 项检查中有 ${check.agree} 项一致${material}。` +
    "两次短测试部分一致是常见的结果；再做第三次，范围会收窄。"
  );
}

export function coverageLineZh(input: AcrossInput): string | null {
  if (input.unmeasured.length === 0) {
    return "本站能运行的每一条阶梯，在这台设备上都有测试记录。现在能让数字变化的，是两次测试之间相隔的时间。";
  }
  const names = input.unmeasured.map(label);
  const list = names.length === 1 ? names[0] : `${names.slice(0, -1).join("、")}和${names[names.length - 1]}`;
  return `这台设备上还没测过：${list}。你在${names.length === 1 ? "这一项" : "这些项目"}上会有怎样的表现，这里什么也说不出。`;
}

export function thresholdRosterZh(input: AcrossInput): string[] {
  return input.thresholds
    .map((t) => {
      const claim = thresholdClaim(t);
      if (!claim.ok) return null;
      const say = claim.value;
      if (say.wide || say.heardAt === null) return `${label(t.family)}：本次没有定下来`;
      return `${label(t.family)}：听出于 ${quantityZh(say.heardAt, t.unit)}${onSourceZh(t)}`;
    })
    .filter((l): l is string => l !== null);
}

/** The Chinese of `acrossLines`: the same parts, the same silence under two instruments. */
export function acrossLinesZh(input: AcrossInput, count: number): string[] {
  if (count < 2) return [];
  const dossier = dossierLineZh(input);
  const coverage = coverageLineZh(input);
  return [...(dossier ? [dossier] : []), ...input.replications.map(replicationLineZh), ...(coverage ? [coverage] : [])];
}

const ACROSS: Dict = {
  "ACROSS YOUR SESSIONS": "跨测试汇总",
  "Read from this browser only — there are no accounts, so another device starts empty.":
    "数据只来自本浏览器：本站没有账户，换一台设备就从空白开始。",
  // The forget control (src/content/forget.ts).
  "Forget this browser": "让本浏览器忘掉一切",
  "This removes everything the gym has kept in this browser: the sessions you have finished and the answers behind them, the seven-day retest gate that goes with them, the language you chose, and the in-flight state of anything open right now.":
    "这会删去本站在本浏览器里保存的一切：你完成的测试及其作答、与之相关的七天重测限制、你选择的语言，以及当前打开的页面里尚未完成的进度。",
  "It cannot undo usage events already sent to our analytics, and it changes nothing in any other browser — there was never an account to change.":
    "它无法撤回已经发送到我们统计工具的使用事件，也不会改变任何其他浏览器里的东西：本来就没有账户可改。",
  "Yes, forget it": "确定，全部删去",
  "Keep it": "保留",
  "Cleared. Nothing measured on this browser is left, and the gym has never met you.":
    "已清除。本浏览器上测得的一切都已删去，对本站来说，你从未来过。",
};

export default ACROSS;
