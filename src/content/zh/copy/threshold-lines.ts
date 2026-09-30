/**
 * 阈值测试的结果，中文模板 · The Threshold Test's result in Chinese (bilingual Part 4; D1, D4, N3).
 *
 * One function per English function, branch for branch, computed from the same
 * result: `src/content/staircase/copy.ts` (the band, the fitted point, the reach,
 * the evidence, the material, the next step, the refusal of a retest), the
 * creator translation (`src/content/vocabulary/threshold.ts`), the prompt card
 * (`src/content/card/copy.ts`), the arc across sittings
 * (`src/content/vocabulary/arc.ts`, shared by all three instruments) and the
 * pipeline's measured limits (`statement` on each limit, parsed rather than
 * retyped). Every sentence is about what the session measured (D1), except the
 * prompt card's, where D1 is suspended and the register is offer, do not assert.
 * No percentile and no cohort anywhere (N3). Templates only (BA-10).
 * Held by `zh/threshold-lines.test.ts` on every fixture the English is held on.
 * DRAFT: not yet through the owner's writing pass.
 */
import type { StaircaseResult, ThresholdBand } from "@/engine/staircase-session";
import type { ThresholdSay, Claim } from "@/engine/evidence";
import type { ArcReading } from "@/engine/arc";
import type { CardAxis, PromptCard } from "@/engine/prompt-card";
import type { DelicacyArcFloor } from "@/content/delicacy/arc-floor";
import type { KnownLimit } from "@/engine/staircase-manifest";
import { promptCard } from "@/engine/prompt-card";
import { CONFIDENCE_PCT } from "@/engine/confidence";
import { isWideBand } from "@/engine/evidence";
import { thresholdCardFigure } from "@/content/staircase/copy";
import { DELICACY_ARC_FLOOR } from "@/content/delicacy/arc-floor";
import { FAMILY_LABEL_ZH, onSourceZh, quantityZh } from "./across";

const label = (family: string) => FAMILY_LABEL_ZH[family] ?? family;

/* ------------------------------------------------------------------ *
 * The result screen (staircase/copy.ts)
 * ------------------------------------------------------------------ */

/**
 * What each family's damage is, for someone who has never met the word (`FAMILY_BLURB`).
 * A clause rather than the English noun phrase, so each Chinese sentence that
 * carries it introduces it with a colon: 被这样损坏过：….
 */
export const FAMILY_BLURB_ZH: Record<string, string> = {
  "pitch-drift": "整段音乐在二十秒里慢慢跑调",
  "timing-smear": "拍点离开网格，又回到网格上",
  "lossy-artifact": "低比特率在镲片和混响尾音上留下糊痕",
};

export function bandLineZh(band: ThresholdBand, unit: string, source: string): string {
  const heard = band.heardAt === null ? null : quantityZh(band.heardAt, unit);
  const missed = band.missedAt === null ? null : quantityZh(band.missedAt, unit);
  if (heard && missed) {
    if (isWideBand(band)) {
      const [lo, hi] = [band.missedAt!, band.heardAt!].sort((a, b) => a - b);
      return (
        `你的耳朵跟不上的地方，在 ${quantityZh(lo, unit)} 到 ${quantityZh(hi, unit)}${source}之间的某处；` +
        `这个答案很宽，几乎覆盖了这把阶梯能问到的整个范围。`
      );
    }
    return `你在 ${heard}${source}上听出了损伤。到了 ${missed}，你是在猜。`;
  }
  if (heard) {
    return `你在 ${heard}${source}上听出了损伤。你从哪一级开始听不出，还在更轻的地方，这次测试没能把它定下来。`;
  }
  if (missed) {
    return `到了 ${missed}${source}，你是在猜；这次测试也没有确认任何一级是你能稳定听出的。`;
  }
  return `这次测试分不开各级${source}：你的对与错在整把阶梯上分布得太均匀，说不出界线在哪里。`;
}

export function thresholdLineZh(result: StaircaseResult): string | null {
  if (result.kind !== "threshold") return null;
  const u = result.unit;
  return (
    `拟合出的阈值（threshold）为 ${quantityZh(result.label, u)}${onSourceZh(result)}，` +
    `${CONFIDENCE_PCT}% 区间从 ${quantityZh(result.ci95[0], u)} 到 ${quantityZh(result.ci95[1], u)}。` +
    `这个区间之所以宽，是因为 ${result.trials} 次二选一只能说明这么多。`
  );
}

export function reachLineZh(result: StaircaseResult): string | null {
  const u = result.unit;
  const src = onSourceZh(result);
  if (result.kind === "below") {
    return (
      `你的耳朵走过了这把阶梯的尽头。${quantityZh(result.boundLabel, u)}${src}是我们能做出的最轻的损伤，` +
      `而你仍然听得出；所以你真正的极限在比这更轻的某处，这项测试说不出在哪里。`
    );
  }
  if (result.kind === "above") {
    return (
      `${quantityZh(result.boundLabel, u)}${src}是这把阶梯上最重的损伤，你在这一级也没能分开这一对。` +
      `不管你的极限在哪里，它都在我们能做出的范围之外。`
    );
  }
  return null;
}

export function evidenceLineZh(band: ThresholdBand): string {
  const visited = band.rungs.filter((r) => r.shown > 0);
  const total = visited.reduce((a, r) => a + r.shown, 0);
  const hits = visited.reduce((a, r) => a + r.correct, 0);
  return (
    `共 ${total} 个试次，分布在阶梯的 ${visited.length} 级上，其中 ${hits} 个判断正确。` +
    `二选一时，随机猜对的机会是一半。`
  );
}

export const NO_COHORT_FOOTNOTE_ZH =
  "这里没有任何比较，在真实的人做过这项测试之前也不会有。" +
  "目前还没有人做过：这项测试背后的样本人群现在有 0 次测试，所以实验室（The Lab）里的每一条参照曲线" +
  "都由模型生成，并标为模拟（SIMULATED）。你刚才做的，是在你身上、对照物理量测出来的，它自己就站得住。";

export function materialLineZh(result: StaircaseResult): string | null {
  if (!result.sourceId) return null;
  const spread = result.limits.find((l) => l.kind === "damage-varies-by-window");
  if (!spread || spread.damageRatio === undefined) return null;
  return (
    `比特率本身是精确的，它造成的损伤却有轻有重。` +
    `在录音 ${result.sourceId} 上，同样的 ${spread.level} kbps 测得 ${spread.damageMinDb} 到 ${spread.damageMaxDb} dB 的损伤，` +
    `分布在这次测试取用的 ${spread.windows} 个段落里，相差 ${spread.damageRatio} 倍。` +
    `你的数字同时关乎你的耳朵和这段录音，所以要写明是哪段录音。`
  );
}

export function nextStepLineZh(result: StaircaseResult): string {
  if (result.band.heardAt !== null && result.band.missedAt !== null) {
    return (
      `一周后再来，再做一次。这一屏会把你的几次测试相互比较，` +
      `只有当差距超出这把阶梯能与噪声分开的程度，才称之为变化。`
    );
  }
  return (
    `一周后再来，再做一次。单独一次测试说不出你的耳朵有没有变化：` +
    `比较至少需要两次，之后每多一次，它就能看见更小的变化。`
  );
}

/** `resultLines`, in Chinese, in the same order. */
export function resultLinesZh(result: StaircaseResult): string[] {
  const src = onSourceZh(result);
  return [
    bandLineZh(result.band, result.unit, src),
    thresholdLineZh(result),
    reachLineZh(result),
    evidenceLineZh(result.band),
    materialLineZh(result),
    nextStepLineZh(result),
    NO_COHORT_FOOTNOTE_ZH,
  ].filter((l): l is string => l !== null);
}

/** The retest refusal (`cooldownTitle`, `cooldownBody`). */
export function cooldownTitleZh(family: string): string {
  return `你这周已经测过${label(family)}。`;
}

export function cooldownBodyZh(daysLeft: number): string {
  const when = daysLeft === 1 ? "明天" : `${daysLeft} 天后`;
  return (
    `现在再做一次，阶梯会找到更小的一级，原因在于你记住了这些录音，并非你听得更清楚。` +
    `${when}，这份记忆会淡去，数字就又代表你的耳朵了。`
  );
}

/** The figure the screen and the share card lead with, in Chinese: 至 for the range, 音分 for cents. */
export function thresholdCardFigureZh(result: StaircaseResult): string {
  const en = thresholdCardFigure(result);
  if (en === "no reading") return "没有读数";
  return en.replace("–", " 至 ").replace(/ cents$/, " 音分");
}

/** The line under the figure (`thresholdCardCaption`), in Chinese. Names the measurement; never ranks the person. */
export function thresholdCardCaptionZh(result: StaircaseResult): string {
  const flaw = label(result.family);
  const src = onSourceZh(result);
  if (result.kind === "inconclusive") return `${flaw}${src}：这次测试没有得出读数`;
  if (result.kind === "below") return `这项测试能做出的最轻的${flaw}${src}，我仍然听得出`;
  if (result.kind === "above") return `这项测试能做出的最重的${flaw}${src}，我也没听出`;
  return `我还能听出的最小的${flaw}${src}`;
}

/** The glossary's bracket for cents, as the first use of 音分 on a page carries it. */
export const CENTS_GLOSS = "（cents）";

/** The glossary's first-use form of a figure: "48 音分" becomes "48 音分（cents）"; other units pass through. */
export function glossCentsZh(figure: string): string {
  return figure.endsWith(" 音分") ? `${figure}${CENTS_GLOSS}` : figure;
}

/** The first " 音分" in a sentence, glossed; a sentence with none is returned unchanged. */
export function glossFirstCentsZh(line: string): string {
  const i = line.indexOf(" 音分");
  return i < 0 ? line : `${line.slice(0, i + 3)}${CENTS_GLOSS}${line.slice(i + 3)}`;
}

/** Whether a Chinese line uses the unit 音分. */
export const hasCentsZh = (line: string) => line.includes(" 音分");

/** What travels with a shared link (`thresholdShareText`), in Chinese. */
export function thresholdShareTextZh(result: StaircaseResult): string {
  if (result.kind === "inconclusive") {
    return `做了 ${result.trials} 个试次的${label(result.family)}阶梯，它还是没能读出我。你觉得你的耳朵会更好？`;
  }
  return `${thresholdCardFigureZh(result)}：${thresholdCardCaptionZh(result)}。实测，并非猜测。轮到你了。`;
}

/* ------------------------------------------------------------------ *
 * The creator translation (vocabulary/threshold.ts)
 * ------------------------------------------------------------------ */

export const FLAW_IN_A_GENERATION_ZH: Record<string, string> = {
  "pitch-drift":
    "在生成的曲子里，这是一个长音上悄悄变酸的主旋律，比如人声、拉奏的弦乐、合成器主音；" +
    "它滑得很慢，听起来像是演奏走了样，让人想不到是音频出了问题。",
  "timing-smear":
    "在生成的曲子里，这是那种松垮、没有着落的感觉：各声部的速度一致，拍点落在哪里却对不齐，律动始终锁不住。",
  "lossy-artifact":
    "在生成的曲子里，这是那种隔着水、发脆的质感：镲片变成一层纱，混响尾音碎成沙粒，整首听起来像是自己的一个劣质副本。",
};

export function whatGetsPastZh(say: ThresholdSay): string {
  const { heardAt, missedAt, unit } = say;
  if (heardAt !== null && missedAt !== null) {
    if (say.wide) return "";
    return (
      `在这些片段上，比 ${quantityZh(heardAt, unit)} 更轻的损伤从你耳边溜了过去。` +
      `一首生成的曲子可以在这个余量里偏移，而你听来依然干净。`
    );
  }
  if (heardAt !== null) {
    return (
      `这次测试确定你能听出 ${quantityZh(heardAt, unit)} 的损伤，却一直没找到你开始听不出的那一级；` +
      `所以溜过你耳边的，是比这更轻的损伤，轻多少，这些片段没有确定。`
    );
  }
  return (
    `这次测试没找到你能稳定听出的损伤级别，所以说不出什么会溜过你的耳朵，` +
    `只能说 ${quantityZh(missedAt!, unit)} 已经溜过去了。`
  );
}

/** `creatorLines`, in Chinese: the symptom always, the consequence only on a narrow band. */
export function creatorLinesZh(say: ThresholdSay): string[] {
  const symptom = FLAW_IN_A_GENERATION_ZH[say.family] ?? "";
  const consequence = say.wide ? "" : whatGetsPastZh(say);
  return [symptom, consequence].filter((l) => l !== "");
}

/* ------------------------------------------------------------------ *
 * The prompt card (card/copy.ts, card/axes.ts). D1 is suspended here.
 * ------------------------------------------------------------------ */

export const CARD_SEPARATES_ZH = "你的耳朵分得开什么";
export const CARD_WORTH_ZH = "这在提示词里值多少";
export const CARD_PASTE_ZH = "粘贴这一段";
export const CARD_KICKER_ZH = "你的提示词（prompt）卡片";
export const CARD_COPY_IDLE_ZH = "复制";
export const CARD_COPY_DONE_ZH = "已复制";
export const CARD_COPY_MANUAL_ZH = "已选中，请按复制";

/**
 * The axes in Chinese. The tags are Chinese because the reading's prompt on a
 * Chinese page is Chinese; whether a Chinese page should hand a music generator
 * English tags instead is in the owner's decisions block.
 */
export const PROMPT_AXES_ZH: Record<string, { axis: string; precise: readonly string[]; neutral: string }> = {
  "pitch-drift": {
    axis: "音准（tuning）特征与音高稳定性",
    precise: ["音准干净", "整段音高稳定"],
    neutral: "音高自然",
  },
  "timing-smear": {
    axis: "律动、节拍（timing）手感与紧凑度",
    precise: ["节拍紧凑", "律动贴合网格"],
    neutral: "律动自然",
  },
  "lossy-artifact": {
    axis: "混音风格、保真度（fidelity）与制作完成度",
    precise: ["高频通透", "混响尾音细节完整"],
    neutral: "干净的母带",
  },
};

export function separatesLineZh(axis: CardAxis, figure: string): string {
  const name = label(axis.family);
  switch (axis.state) {
    case "fine":
      return `${name}是你听得很细的东西。到了 ${figure}，你仍然判断得出。`;
    case "coarse":
      return `${name}要大到 ${figure}，你才判断得出。`;
    case "measured":
      return `${name}：你在 ${figure} 时判断得出。这把阶梯太短，说不出这算多细。`;
    case "finer-than-measured":
      return `${name}：你听出了这项测试能做出的最轻的版本。你的耳朵在它跟不到的更远处。`;
    case "coarser-than-measured":
      return `${name}：连最重的版本也从你耳边溜了过去。这是关于这一次测试的事实，算不上极限。`;
    default:
      return `${name}：这次测试说不出。它分辨出的东西太少，什么也说不了。`;
  }
}

export function worthLineZh(axis: CardAxis): string | null {
  const a = PROMPT_AXES_ZH[axis.family];
  if (!a) return null;
  if (axis.state === "not-enough") return `这次测试在${a.axis}上没有可花的字。它分辨出的东西不够，说不了什么。`;
  if (axis.spend === true) return `在${a.axis}上多花些字。它们有没有被照做，你听得出来。`;
  if (axis.spend === false) return `把字数花在别处。写「${a.neutral}」就够了，更细的要求你也核对不了。`;
  return `写「${a.neutral}」。这里没有任何东西说明，更细的要求值得花这些字。`;
}

export function tagsForZh(axis: CardAxis): string[] {
  const a = PROMPT_AXES_ZH[axis.family];
  if (!a || axis.state === "not-enough") return [];
  return axis.spend === true ? [...a.precise] : [a.neutral];
}

export function pasteLineZh(card: PromptCard): string {
  return card.axes.flatMap(tagsForZh).join("，");
}

/** `cardSections`, in Chinese, paired by family exactly as the English is. */
export function cardSectionsZh(
  results: readonly StaircaseResult[],
  { glossCents = false }: { glossCents?: boolean } = {},
): { heading: string; lines: string[] }[] {
  const card = promptCard(results);
  if (card.axes.length === 0) return [];
  // On the result screen the card is the page's first use of 音分, so the first cents figure is glossed.
  let glossed = !glossCents;
  const figures = new Map(
    results.map((r) => {
      const f = thresholdCardFigureZh(r);
      if (glossed || !f.endsWith(" 音分")) return [r.family, f] as const;
      glossed = true;
      return [r.family, glossCentsZh(f)] as const;
    }),
  );
  const worth = card.axes.map(worthLineZh).filter((l): l is string => l !== null);
  const paste = pasteLineZh(card);
  const out = [{ heading: CARD_SEPARATES_ZH, lines: card.axes.map((a) => separatesLineZh(a, figures.get(a.family) ?? "")) }];
  if (worth.length > 0) out.push({ heading: CARD_WORTH_ZH, lines: worth });
  if (paste.length > 0) out.push({ heading: CARD_PASTE_ZH, lines: [paste] });
  return out;
}

/* ------------------------------------------------------------------ *
 * The arc across sittings (vocabulary/arc.ts), for all three instruments
 * ------------------------------------------------------------------ */

const times = (factor: number) => (factor >= 10 ? `${Math.round(factor)} 倍` : `${factor.toFixed(1)} 倍`);
const sway = (pct: number) => {
  const r = Math.round(pct);
  return `${r > 0 ? "+" : ""}${r}%`;
};

export function delicacyArcRefusalZh(floor: DelicacyArcFloor): string {
  const clause =
    floor.perFamilyItemsToMove !== null && floor.perFamilyTrials !== null
      ? `，或者在单一瑕疵中变动 ${floor.perFamilyItemsToMove} 对（共 ${floor.perFamilyTrials} 对）`
      : "";
  return (
    `这些试次太少，显示不出随时间的变化。` +
    `你的得分要变动 ${floor.itemsToMove} 对（共 ${floor.trials} 对）${clause}，才有意义；` +
    `所以这项测试只报告你现在在哪里，变化的问题交给阈值阶梯。`
  );
}

export const ARC_REFUSAL_ZH: Record<string, string> = {
  "too-few-sessions":
    "一次测试说不出你的耳朵有没有变化，因为没有可以比较的对象。在本浏览器里再做一次，这句话才有可能说出来。",
  "different-material":
    "这两次压缩测试用的是不同的录音，所以无法比较。同样的比特率，对一段录音造成的损伤可能是另一段的两倍，" +
    "这意味着两次测试之间的差别会是关于音乐的事实，与你无关。",
  "arc-instrument-unsupported": delicacyArcRefusalZh(DELICACY_ARC_FLOOR),
  "no-arc-floor":
    "还没有人测量过这项测试的数字在前后测试之间会漂多少，所以这里分不清变化和抛硬币。在那之前，它什么也不说。",
  "no-scoreable-trials": "这两次测试里有一次没有可以计分的回答，所以没有可以比较的一对。",
};

function offLadder(reading: ArcReading): boolean {
  return !reading.earlier.withinRange || !reading.latest.withinRange;
}

function pooledLineZh(reading: ArcReading): string | null {
  const { pooled } = reading;
  const total = pooled.older + pooled.newer;
  if (total <= 2) return null;
  const solo = reading.soloFloorFactor;
  const now = reading.floorFactor;
  const gain =
    solo && now ? `正是这一点把上面那条线从 ${times(solo)} 降到了 ${times(now)}：` : "正是这一点把上面那条线往下拉：";
  return (
    `这建立在 ${total} 次测试上：之前 ${pooled.older} 次，之后 ${pooled.newer} 次。` +
    `${gain}平均值的起伏会随其中测试次数的平方根下降，所以你每回来一次，就能看见更小的真实变化。`
  );
}

function thresholdArcZh(reading: ArcReading): string[] {
  const name = label(reading.family ?? "");
  const floor = times(reading.floorFactor ?? 1);
  const moved = times(reading.distanceFactor ?? 1);
  if (reading.direction === null) {
    return [
      `你的几次${name}测试相差 ${moved}，这把阶梯分不清它和自身的噪声。` +
        `要差到约 ${floor}，这里的变化才有意义。` +
        `这句话并没有说你停在原地：它说的是，这么小的变化低于这项测试能看见的范围。`,
    ];
  }
  const way = reading.direction === "closer" ? "你现在能听出比以前更小的瑕疵" : "现在要更大的瑕疵才能被你听出";
  if (offLadder(reading)) {
    return [
      `在你的几次${name}测试里，${way}。` +
        `其中一次超出了这把阶梯能做出的范围，所以方向成立，大小说不准；` +
        `能说的只是，这次变化超过了 ${floor}，也就是这项测试能与噪声分开的最小变化。`,
    ];
  }
  return [
    `在你的几次${name}测试里，${way}，变化约为 ${moved}。` +
      `这把阶梯分不清小于 ${floor} 的变化和平常的起伏，所以这么大的变化，是测试本身在说话，并非运气。`,
  ];
}

function biasArcZh(reading: ArcReading): string[] {
  const before = sway(reading.earlier.value);
  const after = sway(reading.latest.value);
  const floor = Math.round(reading.floor);
  if (reading.direction === null) {
    return [
      `标签在之前让你偏了 ${before}，之后偏了 ${after}。` +
        `这个差距落在这项测试自身会漂动的 ${floor} 个百分点以内，所以谁也不能认定这是变化：` +
        `同一个人重测，什么都没变，也会差这么多。`,
    ];
  }
  const moved = Math.round(reading.distance);
  if (reading.direction === "closer") {
    return [
      `标签在之前让你偏了 ${before}，之后偏了 ${after}，靠近了 ${moved} 个百分点，更接近零，零代表名字什么也没改变。` +
        `这超过了这项测试自身会漂动的 ${floor} 个百分点，所以名字对你听到的东西，影响比以前小了。`,
    ];
  }
  return [
    `标签在之前让你偏了 ${before}，之后偏了 ${after}，远离了 ${moved} 个百分点，离零更远，` +
      `也超过了这项测试自身会漂动的 ${floor} 个百分点。` +
      `名字对你听到的东西，影响比以前大了。` +
      `两个方向都算数：把一段带标签的录音打低分，仍然是名字在做决定，并非你的耳朵。`,
  ];
}

/** `arcLines`, in Chinese: a refusal, or a reading plus what coming back bought. */
export function arcLinesZh(claim: Claim<ArcReading>): string[] {
  if (!claim.ok) return [ARC_REFUSAL_ZH[claim.gap] ?? ARC_REFUSAL_ZH["no-arc-floor"]];
  const reading = claim.value.instrument === "bias" ? biasArcZh(claim.value) : thresholdArcZh(claim.value);
  const pooled = pooledLineZh(claim.value);
  return pooled ? [...reading, pooled] : reading;
}

/* ------------------------------------------------------------------ *
 * The pipeline's measured limits (the `statement` on each limit)
 * ------------------------------------------------------------------ */

const N = String.raw`(\d+(?:\.\d+)?)`;
const SHAPES: { kind: string; en: RegExp; zh: (m: string[]) => string }[] = [
  {
    kind: "adjacent-levels-collapse",
    en: new RegExp(String.raw`^On (\S+), ${N} kbps and ${N} kbps measure ${N} and ${N} dB — ${N}x apart, below the ${N}x that makes two levels distinguishable\.`),
    zh: ([, win, a, b, da, db, r, need]) =>
      `在 ${win} 上，${a} kbps 和 ${b} kbps 测得 ${da} dB 与 ${db} dB，只相差 ${r} 倍，` +
      `低于让两级可以区分所需的 ${need} 倍。这里的阶梯方向没错，但这段素材上这两级分不开。`,
  },
  {
    kind: "damage-varies-by-window",
    en: new RegExp(String.raw`On (\S+), ${N} kbps measures ${N}-${N} dB \(${N}x\) across the ${N} windows serving it, the widest of this source's ${N} levels\.`),
    zh: ([, src, level, lo, hi, r, windows, levels]) =>
      `一个压缩级别是一个比特率，在每个段落上都精确一致，它造成的损伤却不一致。` +
      `在 ${src} 上，${level} kbps 在使用它的 ${windows} 个段落里测得 ${lo} 到 ${hi} dB（相差 ${r} 倍），` +
      `是这段录音 ${levels} 个级别里差距最大的。` +
      `报告成「${level} kbps（录音 ${src}）」的阈值，是关于这位听者加上这段素材的事实，单凭听者说明不了。`,
  },
  {
    kind: "cross-window-spread",
    en: new RegExp(String.raw`^The same level measures ${N}-${N} depending on which window serves it \(${N}x\), consuming ${N}% of the ${N}x the instrument allows\.`),
    zh: ([, lo, hi, r, used, allow]) =>
      `同一个级别，随使用的段落不同，测得 ${lo} 到 ${hi}（相差 ${r} 倍），用掉了这项测试允许的 ${allow} 倍中的 ${used}%。` +
      `在这个级别上报告的阈值，就带着这么大的段落间差异。`,
  },
  {
    kind: "predicted-below-floor",
    en: new RegExp(String.raw`peaking at ${N}% of its parameter, so it PREDICTS ${N} cents of peak detune — below the ${N}-cent parameter floor`),
    zh: ([, pct, predicted, floor]) =>
      `这个级别被做成一段斜坡，峰值为其参数的 ${pct}%，所以它预计的峰值失谐是 ${predicted} 音分，` +
      `低于测量音分所依照的 ${floor} 音分参数下限。这是这项测试能报告的最低处。`,
  },
];

/** A limit's statement in Chinese, from the numbers in the pipeline's own sentence. Throws on a shape it does not know. */
export function limitStatementZh(limit: Pick<KnownLimit, "kind" | "statement">): string {
  const shape = SHAPES.find((s) => s.kind === limit.kind);
  const m = shape?.en.exec(limit.statement);
  if (!shape || !m) throw new Error(`no Chinese shape for the ${limit.kind} statement: ${limit.statement.slice(0, 60)}`);
  return shape.zh([...m]);
}
