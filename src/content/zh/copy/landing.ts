/**
 * 首页 · The front door in Chinese (bilingual Part 2; BA-6, BP-INSIGHT, BP-UNMET, BP-BRIDGE).
 *
 * Keys are the exact English `src/app/page.tsx`, `src/content/landing.ts` and
 * `src/app/GymFloor.tsx` render. A count comes through a slot and is written in
 * digits in the Chinese, so no number is typed twice. The one sentence built
 * from a count of machines has its own function below, because Chinese writes
 * the count with a measure word. DRAFT: not yet through the owner's writing pass.
 */
import type { Dict } from "@/lib/i18n";

const ZH_NUMERALS = ["零", "一", "两", "三", "四", "五", "六", "七", "八", "九", "十"];

/** The Chinese of `landingLead(n)`: the count as a numeral with its measure word. */
export function landingLeadZh(machineCount: number): string {
  const n = ZH_NUMERALS[machineCount] ?? String(machineCount);
  return (
    `测的并非人格，也并非氛围。${n}台机器，各测一样休谟认为真正的评判者必须具备的东西：` +
    "名气能不能左右你的评分；没人告诉你损伤在哪里时，你的耳朵能不能抓到它；" +
    "损伤小到什么程度你就听不出了；你听出的差距，是否落在评论家当初听出的地方。"
  );
}

const LANDING: Dict = {
  // Metadata.
  "Standard of Taste — a month of listening, read back in words you can argue with": "鉴衡 · 论品味的标准",
  "A reading of a listener's recent plays: each line points at the plays behind it, offers what it might mean, and ends in a prompt you can carry into a music generator. Then find out which of its words you can actually hear.":
    "对一位听者近来播放记录的解读：每一条都指向背后的播放，提示它可能意味着什么，最后给出一段可以带进音乐生成工具的提示词。然后，看看其中哪些词你真的听得出来。",
  "Standard of Taste": "鉴衡",

  // The opening (src/content/landing.ts).
  "Your last month of listening holds a pattern you have probably never put into words.":
    "你过去一个月的收听里藏着一种规律（pattern），你多半从没把它说出来过。",
  "So does every algorithm that has ever recommended you a song. It just never tells you, because what it knows about you is a row of numbers no person can read.":
    "给你推荐过歌的每一个算法，也都握着这种规律。它只是从来不告诉你，因为它对你的了解，是一行没有人读得懂的数字。",
  "Here a month of someone's listening is read back line by line, with the plays behind every line. Keep what fits, reject what doesn't, and carry what is left into a prompt.":
    "一个人一个月的播放记录（plays），逐条读出，每条附上依据（receipt）。相符的留下，不符的删去，剩下的带进提示词（prompt）。",
  "Try it on a month that isn't yours.": "用别人的一个月试试。",
  "THE HEARING TESTS": "听辨测试（hearing tests）",
  "Then find out which words in a prompt you can actually hear.": "然后，看看提示词里哪些词你真的听得出来。",
  "You can be wrong, and that is the point.": "你可能会错，测试的意义就在这里。",
  "Something sounds wrong.": "听着有点不对劲。",
  // The English spells its count from the family list; a change there changes this key and fails as a miss.
  "Three kinds of damage, what each one is called, and which machine measures it.": "三类损伤：各叫什么，由哪台机器测量。",
  "Terms · Privacy": "条款 · 隐私",

  // The machines (src/app/page.tsx).
  "The Prestige Test": "名气偏差测试（Prestige Test）",
  "Freedom from prejudice": "不受成见左右",
  "Rate {count} clips blind, then again with the famous names attached — asked a different way, in a different order. Your number is the gap.":
    "先盲听给 {count} 段录音打分，再贴上有名的名字重打一遍，问法不同，顺序也不同。差距就是你的数字。",
  "~{minutes} min · {clips} clips": "约 {minutes} 分钟 · {clips} 段录音",
  "The Delicacy Trials": "细辨测试（Delicacy Trials）",
  "Delicacy of taste": "鉴赏力（delicacy of taste）",
  "One clip of each pair has been quietly damaged. Practise first with the answers shown, then find it — and name what is wrong.":
    "每一对录音里，有一段被悄悄损坏过。先看着答案练习，再自己把它找出来，并说出哪里出了问题。",
  "~10 min · 3 practice + 15 scored": "约 10 分钟 · 3 道练习加 15 道计分",
  "The Threshold Test": "阈值测试（Threshold Test）",
  "Delicacy of taste · measured": "鉴赏力 · 实测（MEASURED）",
  "The damage gets smaller every time you catch it, and bigger every time you miss. It stops at the size where you stop being sure — and that size is your number.":
    "你每抓到一次，损伤就变小一点；每漏掉一次，就变大一点。它停在你开始拿不准的那个大小上，那个大小就是你的数字。",
  "14-26 min · a number in cents, ms or kbps": "14 到 26 分钟 · 一个以音分（cents）、ms 或 kbps 计的数字",
  "The Ranking Test": "排序测试（Ranking Test）",
  "Comparison · heard": "比较 · 凭耳朵",
  "A critic ranked {count} works against each other. Rate them with your ears alone and find out whether your gaps fall where his did — agreeing with him is not the point, and is not measured.":
    "一位评论家给 {count} 部作品排过先后。只凭耳朵给它们打分，看你听出的差距是否落在他听出的地方；和他意见一致并非目的，也不会被测量。",
  "~{minutes} min · {works} works, {seconds} seconds each": "约 {minutes} 分钟 · {works} 部作品，每段 {seconds} 秒",

  // The floor (src/app/GymFloor.tsx).
  "MACHINE {n} · SELECTED": "机器 {n} · 已选中",
  "MACHINE {n} · OPEN": "机器 {n} · 可用",
  "Start {title}": "开始{title}",
  "Choose {title}": "选择{title}",
  "Tap again to start →": "再点一次开始 →",
  Choose: "选择",
  "Tap it again when you're ready. Nothing has started yet.": "准备好了就再点一次。现在什么都还没开始。",
  "Free · no sign-up · headphones help · pick one, the room follows": "免费 · 无须注册 · 戴耳机更好 · 选一台，房间跟着换颜色",
};

export default LANDING;
