/**
 * 解读的每一条，中文模板 · The reading's lines in Chinese (bilingual Part 2; BA-3, BA-10).
 *
 * The same three parts as `src/content/reading/lines.ts`, computed from the same
 * facts: (a) the pattern, which names no feeling; (b) the receipt, the count
 * behind it; (c) two offered readings, as questions ending in ？, each with the
 * words it adds to the prompt. Templates only: nothing here is written at run
 * time. Track titles are fictional and stay in English, in 《》 as Chinese sets
 * a work's title. Held by `zh/reading-lines.test.ts` to the register, the
 * carve-out and the no-comparison rule, on every branch.
 * DRAFT: not yet through the owner's writing pass.
 */
import type { Fact } from "@/engine/reading/patterns";
import type { Cluster, Listener } from "@/content/reading/types";
import type { ReadingLine } from "@/content/reading/lines";
import SOUND from "./reading-sound";

export const NEITHER_ZH = "都不对";

const pct = (n: number, of: number) => `${Math.round((100 * n) / of)}%`;
const title = (t: string) => `《${t}》`;

/** "《A》、《B》和《C》". */
function list(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join("、")}和${items[items.length - 1]}`;
}

/** A sound word in Chinese, or a loud failure: an English word on the Chinese page is a defect. */
function zh(en: string): string {
  const s = SOUND[en];
  if (s === undefined) throw new Error(`no Chinese for the sound word "${en}" in zh/copy/reading-sound.ts`);
  return s;
}

type Lookup = { title: (id: string) => string; texture: (cluster: string) => string; clusterOf: (id: string) => string };

function lookup(l: Listener): Lookup {
  const byId = new Map(l.tracks.map((t) => [t.id, t]));
  const clusters = new Map<string, Cluster>(l.clusters.map((c) => [c.id, c]));
  return {
    title: (id) => title(byId.get(id)!.title),
    texture: (c) => zh(clusters.get(c)!.sound.texture),
    clusterOf: (id) => byId.get(id)!.cluster,
  };
}

function mainCluster(trackIds: string[], k: Lookup): string {
  const n = new Map<string, number>();
  for (const id of trackIds) n.set(k.clusterOf(id), (n.get(k.clusterOf(id)) ?? 0) + 1);
  return [...n].sort((a, b) => b[1] - a[1])[0][0];
}

type Parts = Pick<ReadingLine, "pattern" | "receipt" | "offers" | "cue">;

function parts(f: Fact, k: Lookup): Parts {
  switch (f.kind) {
    case "repetition":
      if (f.direction === "high")
        return {
          pattern: `有三首歌占了你 ${f.total} 次播放中的 ${pct(f.topPlays, f.total)}：${list(f.top.map((t) => k.title(t.trackId)))}。`,
          receipt: `${f.total} 次播放中的 ${f.topPlays} 次`,
          offers: [
            { id: "a", question: "这几首歌是在让某样东西保持平稳，好让你不必再挑新的吗？", words: ["平稳", "回旋", "熟悉"] },
            { id: "b", question: "还是说，你还在这几首歌里面，听一样还没找到的东西？", words: ["寻找", "回返", "贴近"] },
          ],
          cue: { label: "曲式", text: "一段绕回原处的循环，为反复播放而写" },
        };
      return {
        pattern: `你听了 ${f.distinct} 首不同的歌，播放最多的三首合起来占了你 ${f.total} 次播放中的 ${pct(f.topPlays, f.total)}。`,
        receipt: `${f.total} 次播放中的 ${f.topPlays} 次，分布在 ${f.distinct} 首歌上`,
        offers: [
          { id: "a", question: "眼下图的就是多换几样，不让哪一样扎下根来吗？", words: ["游移", "开阔", "流动"] },
          { id: "b", question: "还是说，还没有哪一首抓住你？", words: ["漂流", "轻盈", "掠过"] },
        ],
        cue: { label: "曲式", text: "通谱体，没有哪一段重复很久" },
      };
    case "lateNight":
      if (f.direction === "high")
        return {
          pattern: `你有 ${pct(f.late, f.total)} 的播放开始于夜里 11 点到凌晨 4 点之间。`,
          receipt: `${f.total} 次播放中的 ${f.late} 次`,
          offers: [
            { id: "a", question: "深夜是只属于你的那段时间吗？", words: ["深夜", "私密", "从容"] },
            { id: "b", question: "还是说，这是陪你入睡、或者让你晚点睡的音乐？", words: ["困倦", "昏暗", "缓慢"] },
          ],
          cue: { label: "场景", text: "深夜，安静到适合戴耳机" },
        };
      return {
        pattern: `你的 ${f.total} 次播放中，有 ${f.late} 次开始于夜里 11 点到凌晨 4 点之间。`,
        receipt: `${f.total} 次播放中的 ${f.late} 次`,
        offers: [
          { id: "a", question: "音乐是你把一天过完的办法之一吗？", words: ["白昼", "忙碌", "向前"] },
          { id: "b", question: "还是说，夜晚是你有意留出来的安静？", words: ["清澈", "清醒", "户外"] },
        ],
        cue: { label: "场景", text: "白天，在路上" },
      };
    case "newShare": {
      if (f.direction === "high") {
        const rising =
          f.rising && f.rising.lastWeekPlays >= 3
            ? `最后一周，你回头听了${k.title(f.rising.trackId)} ${f.rising.lastWeekPlays} 次。`
            : "";
        return {
          pattern: `你有 ${pct(f.newPlays, f.total)} 的播放，是这四周里第一次听到的歌。${rising}`,
          receipt: `${f.total} 次播放中的 ${f.newPlays} 次`,
          offers: [
            { id: "a", question: "你在找一样还叫不出名字的东西吗？", words: ["寻找", "新", "陌生"] },
            { id: "b", question: "还是说，以前常听的那些已经不合身了？", words: ["变化", "蜕去", "新鲜"] },
          ],
          cue: { label: "熟悉度", text: "陌生，不借用惯常的东西" },
        };
      }
      const known = f.total - f.newPlays;
      return {
        pattern: `你有 ${pct(known, f.total)} 的播放，是这四周开始之前就已经熟悉的歌。`,
        receipt: `${f.total} 次播放中的 ${known} 次`,
        offers: [
          { id: "a", question: "眼下你需要的是熟悉的东西吗？", words: ["熟悉", "可靠", "磨合过的"] },
          { id: "b", question: "还是说，此刻腾不出地方给新的东西？", words: ["满", "贴近", "有遮蔽"] },
        ],
        cue: { label: "熟悉度", text: "熟悉的轮廓，没有意外" },
      };
    }
    case "drift": {
      const from = k.texture(f.fromCluster);
      const to = k.texture(f.toCluster);
      return {
        pattern: `以${to}为主的音乐，从第一周占你播放的 ${pct(f.to.week1, f.week1Total)}，变成第四周的 ${pct(f.to.week4, f.week4Total)}。以${from}为主的音乐，从 ${pct(f.from.week1, f.week1Total)} 变成 ${pct(f.from.week4, f.week4Total)}。`,
        receipt: `第一周 ${f.week1Total} 次播放中的 ${f.to.week1} 次；第四周 ${f.week4Total} 次中的 ${f.to.week4} 次`,
        offers: [
          { id: "a", question: `你在朝${to}走近吗？`, words: ["抵达", "转向", "新找到的"] },
          { id: "b", question: `还是说，${from}当时为你做的事，现在你没那么需要了？`, words: ["之后", "更轻", "往前走"] },
        ],
        cue: { label: "走向", text: `从${from}附近起，落在${to}上` },
      };
    }
    case "earlySkip": {
      if (f.direction === "high") {
        const kept = f.keptCluster ? `你让它们多放一会儿的那些歌里，以${k.texture(f.keptCluster)}为主的最多。` : "";
        return {
          pattern: `你试听的 ${f.tried} 首新歌里，有 ${f.skipped} 首在开头 30 秒内就被跳过。${kept}`,
          receipt: `${f.tried} 次首次播放中的 ${f.skipped} 次`,
          offers: [
            { id: "a", question: "你几秒钟之内就知道自己不要什么吗？", words: ["果断", "利落", "确定"] },
            { id: "b", question: "还是说，你在一样样试，看还有什么合身？", words: ["好奇", "尝试", "未完成"] },
          ],
          cue: { label: "开头", text: "30 秒内直奔主题" },
        };
      }
      return {
        pattern: `你试听的 ${f.tried} 首新歌里，有 ${f.tried - f.skipped} 首你让它放过了开头 30 秒。`,
        receipt: `${f.tried} 次首次播放中的 ${f.tried - f.skipped} 次`,
        offers: [
          { id: "a", question: "你眼下愿意给新东西一些时间吗？", words: ["耐心", "开放", "从容"] },
          { id: "b", question: "还是说，这些歌在你按下播放之前就已经仔细挑过？", words: ["审慎", "细心", "精选"] },
        ],
        cue: { label: "开头", text: "慢慢才进入" },
      };
    }
  }
}

/** One fact, rendered as a line of the Chinese reading. Same id, plays and cluster as the English. */
export function readingLineZh(f: Fact, l: Listener): ReadingLine {
  const k = lookup(l);
  return {
    id: `${l.id}-${f.kind}`,
    kind: f.kind,
    ...parts(f, k),
    playIds: f.playIds,
    trackIds: f.trackIds,
    cluster: f.trackIds.length ? mainCluster(f.trackIds, k) : l.clusters[0].id,
  };
}
