/**
 * 细辨测试的结果，中文模板 · The Delicacy Trials' result in Chinese (bilingual Part 4; D1, N3).
 *
 * One function per English function, from the same result: the detection title
 * and body, the calibration line, the flaw line and the share text
 * (`src/content/delicacy/copy.ts`), and the creator lines
 * (`src/content/vocabulary/delicacy.ts`). Every sentence is about what the
 * session measured (D1); no percentile and no cohort (N3). Templates only
 * (BA-10). Held by `zh/delicacy-lines.test.ts` on every fixture the English is
 * held on. DRAFT: not yet through the owner's writing pass.
 */
import { DEGRADATION_FAMILIES, type DelicacyResult, type DegradationFamily, type DetectionBand } from "@/engine/delicacy";
import type { CalibrationResult } from "@/engine/calibration";
import { CONFIDENCE_PCT } from "@/engine/confidence";
import { chanceCall, minToClearChance } from "@/content/delicacy/copy";
import { delicacyClaim, familyContrastClaim } from "@/engine/evidence";

const pct = (x: number) => `${Math.round(x * 100)}%`;
const CONF = `${CONFIDENCE_PCT}% 置信度`;

/** The three flaws as a listener picks between them (`FLAW_LABELS`). 节奏, not the glossary's 节拍: a button label cannot carry a bracket. */
export const FLAW_LABELS_ZH: Record<DegradationFamily, { label: string; hint: string }> = {
  "pitch-drift": { label: "音高在漂移", hint: "越往后越跑调" },
  "timing-smear": { label: "节奏在晃动", hint: "一阵阵地抢拍、拖拍" },
  "lossy-artifact": { label: "细节被压扁了", hint: "压缩留下的糊痕：高频发虚、不透气" },
};

/** How big each damage was (`MAGNITUDE_WORDS`). */
export const MAGNITUDE_WORDS_ZH: Record<1 | 2 | 3 | 4, string> = { 1: "最轻微", 2: "细微", 3: "中等", 4: "明显" };

export function detectionTitleZh(band: DetectionBand): string {
  return `${band.nCorrect} 对（共 ${band.nTrials} 对）。现在把猜中的减掉。`;
}

export function detectionBodyZh(band: DetectionBand): string {
  const chance = chanceCall(band.nTrials);
  const margin = band.nCorrect - band.nTrials / 2;
  const need = minToClearChance(band.nTrials);
  const n = band.nTrials;
  const generosity = `二选一是很宽松的：每一对都盲猜，长期平均能答对 ${chance} 对（共 ${n} 对），相当于还没听就先送了你一半分。`;

  if (band.excludesChance) {
    const clearance = band.nCorrect > (need ?? 0) ? "也超过了" : "也正好达到";
    return (
      `${generosity}你答对了 ${band.nCorrect} 对，比那份宽松所能覆盖的多出 ${margin} 对，` +
      `${clearance} ${need} 对，这是在 ${CONF}下胜过抛硬币所需的数目。` +
      `把运气本来就会送你的那些对减掉，剩下的，也就是真正听出、不单是碰巧说中的瑕疵，落在 ${pct(band.lo)} 到 ${pct(band.hi)} 之间的某处。` +
      `这个区间宽得让人难为情，宽的理由却很诚实：${n} 对就是 ${n} 对。` +
      `但区间里的每一个值都高于零，而保持在零以上，正是抛硬币做不到的一件事。`
    );
  }

  if (margin > 0) {
    return (
      `${generosity}你答对了 ${band.nCorrect} 对，比那份宽松所能覆盖的多出 ${margin} 对，而多出 ${margin} 对，谁也辩护不了。` +
      `把运气本来就会送你的那些对减掉，仍然符合你这次测试的听出比例在 ${pct(band.lo)} 到 ${pct(band.hi)} 之间，下端碰到零。` +
      `在 ${n} 对里，要答对 ${need} 对，才能在 ${CONF}下胜过抛硬币。` +
      `所以诚实的读法并没有说你什么都没听到：它说的是，这么短的测试分不清你和一个运气好的下午。` +
      `更长的测试分得清。`
    );
  }

  const range =
    band.lo === band.hi
      ? `已经画不出范围了，它平平地落在 ${pct(band.hi)} 听出`
      : `符合的范围是 ${pct(band.lo)} 到 ${pct(band.hi)} 听出`;
  return (
    `${generosity}你答对了 ${band.nCorrect} 对，不超过那份宽松本身就会给的数目，所以把碰巧猜中的去掉后，没有什么可以记在你名下：${range}。` +
    `要在 ${CONF}下胜过抛硬币，需要答对 ${need} 对（共 ${n} 对）。` +
    `这 ${n} 对找到的，是没有任何东西能把你的耳朵和随机区分开；这是关于 ${n} 对的一句话，还算不上关于你耳朵的一句话。`
  );
}

export function calibrationLineZh(cal: CalibrationResult): string {
  const gap = Math.round(cal.gapPct);
  const se = Math.round(cal.gapSePct);
  const said = `平均自报 ${Math.round(cal.meanConfidencePct)}% 有把握，实际答对 ${Math.round(cal.accuracyPct)}%`;
  if (Math.abs(cal.gapPct) < cal.gapSePct) {
    return `${said}，差距 ${gap > 0 ? "+" : ""}${gap} 个百分点，落在 ±${se} 的噪声以内（共 ${cal.n} 个试次）。分不出高下。`;
  }
  const label =
    cal.direction === "overconfident"
      ? "你说的比你的耳朵做到的多。"
      : cal.direction === "underconfident"
        ? "你的耳朵做到的比你说的多。"
        : "说的和做到的一致。";
  return `${said}。${label}`;
}

/** The flaw line: the prefix, then the count, as the component lays them out. */
export const FLAW_LINE_PREFIX_ZH = "听出是一种本事，说出名字是另一种。在你听出的那些配对里，你说对瑕疵的次数是";
export function flawCountZh(correct: number, eligible: number): string {
  return `${correct} 次（共 ${eligible} 次）`;
}
export function flawLineTextZh(correct: number, eligible: number): string {
  return `${FLAW_LINE_PREFIX_ZH} ${flawCountZh(correct, eligible)}。`;
}

export function shareTextDelicacyZh(nCorrect: number, nTrials: number): string {
  return `我在细辨测试里认出了 ${nCorrect} 段原版（共 ${nTrials} 对），抛硬币平均能认出 ${chanceCall(nTrials)} 段。你觉得你的耳朵更好？`;
}

export const PROVISIONAL_FOOTNOTE_ZH =
  "暂定读数：你来得早。" +
  "这里的一切都不收费，也不会有付费版。训练会在重测之间设七天间隔，因为同一天重测测的是你的记忆，并非你的耳朵。" +
  "难度标签是人工标注的，还没有按常模校准。";

/* ------------------------------------------------------------------ *
 * The creator lines (vocabulary/delicacy.ts)
 * ------------------------------------------------------------------ */

export const FLAW_IN_YOUR_WORK_ZH: Record<DegradationFamily, string> = {
  "pitch-drift": "主旋律和人声悄悄变酸",
  "timing-smear": "律动始终锁不住",
  "lossy-artifact": "导出得不好时那种发脆、像隔着水的光泽",
};

export function namingLineZh(result: DelicacyResult): string | null {
  const claim = delicacyClaim(result);
  if (!claim.ok) return null;
  const { flawEligible, flawAccuracy, flawCorrect } = claim.value;
  if (flawEligible === 0 || flawAccuracy === null) {
    return "只有在你判断对了一对之后，才会问你瑕疵的名字，而这次测试一次也没走到那一步；所以它说不出你能不能说出瑕疵的名字，只能说你有没有发现瑕疵。";
  }
  return (
    `说出名字是能迁移的那一半。` +
    `听出一首生成的曲子不对劲，你只能回去重新生成、碰运气；听出是三种里的哪一种，你就知道该去调哪个控件。` +
    `你说对了 ${flawCorrect} 次，共被问到 ${flawEligible} 次。`
  );
}

export function perFamilyRefusalZh(result: DelicacyResult): string | null {
  if (familyContrastClaim(result).ok) return null;
  const counts = DEGRADATION_FAMILIES.map((f) => result.byFamily[f]?.n ?? 0);
  const per = Math.min(...counts);
  if (per === 0) return null;
  return (
    `这次测试不会按瑕疵类型拆分你的结果，原因是算术，与谦虚无关：每种只有 ${per} 对时，` +
    `一个三种都同样擅长的听者，大约九成的情况下会得到不均匀的计数。` +
    `这里给出的任何拆分，大多只是贴着标签的运气。`
  );
}

/** `creatorLines`, in Chinese: the naming line, then the refusal to split, when it applies. */
export function creatorLinesDelicacyZh(result: DelicacyResult): string[] {
  const naming = namingLineZh(result);
  const refusal = result.flawEligible === 0 ? null : perFamilyRefusalZh(result);
  return [naming, refusal].filter((l): l is string => l !== null);
}
