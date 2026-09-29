/**
 * 排序测试 · The Ranking Test's screens in Chinese (bilingual Part 2; D1, N3).
 *
 * Keys are the exact English `src/app/spread/SpreadFlow.tsx`, `page.tsx`,
 * `src/components/OtherMachines.tsx` and `src/app/bias/ClipPlayer.tsx` render.
 * Counts arrive through slots. The reading's own sentences are templates in
 * `spread-lines.ts`. DRAFT: not yet through the owner's writing pass.
 */
import type { Dict } from "@/lib/i18n";

const SPREAD: Dict = {
  // Page metadata and structured data (src/app/spread/page.tsx).
  "The Ranking Test — do your gaps fall where a critic's did?": "排序测试：你的评分差距，是否落在评论家拉开的地方？",
  "Six works a published critic ranked against each other, forty seconds each. Two numbers: how far apart your ratings fell on the pairs he separated, and on the pairs he did not. Agreement is never scored.":
    "一位发表过评论的评论家给六部作品排过先后，每段 40 秒。两个数字：在他分开的配对上，你的评分相差多远；在他没有分开的配对上，又相差多远。是否同意他，从不计分。",
  "Six works a published critic ranked against each other. Whether your ratings move where his judgment moved — never whether you agree with him.":
    "一位发表过评论的评论家给六部作品排过先后。看你的评分是否在他判断拉开的地方拉开，从不看你是否同意他。",
  "The Ranking Test": "排序测试（Ranking Test）",
  "Standard of Taste": "鉴衡",
  "Six Beethoven works from a published critic's ranked list, played as forty-second excerpts and rated blind. Reports the mean gap between ratings across pairs the critic placed ten or more positions apart, beside the same figure across pairs he placed within three, both read against what an indifferent rater produces. Agreement with the critic is never scored and cannot be computed: only the distance between his positions is used, never their order.":
    "从一位发表过评论的评论家的排名中选出六部贝多芬作品，各截取 40 秒，盲听打分。报告评论家排名相隔 10 位以上的配对上的平均差距，并列出相隔 3 位以内的配对上的同一数字，两者都与随手乱打分的人会得出的数字对照。是否同意评论家，从不计分，也算不出来：这里只用他排名之间的距离，从不用先后顺序。",

  // The frame.
  "A critic ranked these works. Do your gaps fall where his did?": "一位评论家给这些作品排过先后。你的评分差距，会落在他拉开的地方吗？",
  "{count} pieces of music, {seconds} seconds each. Rate what you hear, and nothing else. A published critic once ranked all of these against each other — some he placed far apart, some he bracketed together.":
    "{count} 段音乐，每段 {seconds} 秒。只给你听到的东西打分。一位发表过评论的评论家，曾把这些作品彼此排过先后：有的相隔很远，有的挨在一起。",
  "What comes out is two numbers: how far apart your ratings fell on the pairs he separated, and how far apart they fell on the pairs he did not. {strong} Nothing here can even see which of two works he ranked higher.":
    "结果是两个数字：在他分开的配对上，你的评分相差多远；在他没有分开的配对上，又相差多远。{strong}这里甚至看不到他把两部作品中的哪一部排得更高。",
  "Agreeing with him is not the point and is not measured.": "和他意见一致并非目的，也不会被测量。",
  "About {minutes} minutes of listening. Headphones help.": "大约 {minutes} 分钟的聆听。戴耳机更好。",
  "Start listening": "开始聆听",

  // Rating.
  "Clip {n} of {total}": "第 {n} 段，共 {total} 段",
  "Clip {n}": "第 {n} 段",
  "Listen, then say whether you know it — and only then rate it.": "先听，再说你是否听过，然后才打分。",
  "Had you heard this before?": "你以前听过这一段吗？",
  "Yes, I know it": "听过",
  "No, it is new": "没听过，是新的",
  "Saying yes leaves the clip out of the result. It is never counted against you.": "回答听过，这一段就不计入结果。这绝不会算作你的失分。",
  "How good is it?": "它有多好？",
  "Rate {v}": "打 {v} 分",
  "Nothing there": "毫无可取",
  "As good as this gets": "好到不能再好",

  // The reveal.
  "Where your gaps fell": "你的差距落在哪里",
  "across works he placed far apart": "他排得相隔很远的作品之间",
  "across works he bracketed together": "他排得挨在一起的作品之间",
  "Rating at random gives {value} on both.": "随机评分在两者上都得到 {value}。",
  "How this is measured": "测量方法",

  // The other machines (src/components/OtherMachines.tsx).
  "THE OTHER MACHINES": "其他机器",
  "The Prestige Test": "名气偏差测试（Prestige Test）",
  "How far a famous name moves what you hear.": "一个有名的名字，能把你听到的东西挪动多远。",
  "The Delicacy Trials": "细辨测试（Delicacy Trials）",
  "One clip of each pair is quietly damaged. Find it, then name what is wrong.": "每一对录音里，有一段被悄悄损坏过。把它找出来，再说出哪里出了问题。",
  "The Threshold Test": "阈值测试（Threshold Test）",
  "The smallest flaw you can still hear, in cents, milliseconds or kilobits.": "你还听得出的最小瑕疵，以音分（cents）、毫秒或千比特计。",
  "Six works a critic ranked. Whether your gaps fall where his did — never whether you agree.":
    "一位评论家排过先后的六部作品。看你的评分差距是否落在他拉开的地方，从不看你是否同意他。",

  // The clip player (src/app/bias/ClipPlayer.tsx).
  "Play {label}": "播放{label}",
  "Stop {label}": "停止{label}",
  "clip {n}": "第 {n} 段",
  "clip failed to load — tap to retry": "录音加载失败，点一下重试",
};

export default SPREAD;
