/**
 * 阈值测试 · The Threshold Test's fixed strings in Chinese (bilingual Part 4; D4, N3).
 *
 * Keys are the exact English the index, the flow, the result screen and the
 * shared controls render (`src/app/threshold/`, `src/content/staircase/copy.ts`,
 * `AbCompare`, `ShareButton`, `DownloadButton`, `AcrossTime`,
 * `src/content/flaw-families.ts`). The sentences built from a result live in
 * `threshold-lines.ts`. DRAFT: not yet through the owner's writing pass.
 */
import type { Dict } from "@/lib/i18n";

const THRESHOLD: Dict = {
  // Metadata.
  "Find your threshold — Standard of Taste": "找出你的阈值 · 鉴衡",
  "Three adaptive listening tests, one per kind of damage. Each finds the smallest flaw you can still catch and reports it in physical units — cents, milliseconds, kilobits per second.":
    "三项自适应听辨测试，每一项针对一种损伤。每一项都找出你还能听出的最小瑕疵，并用物理单位报告：音分、毫秒、千比特每秒。",
  "How small a flaw can you actually hear? Measured, in physical units.": "你到底能听出多小的瑕疵？用物理单位实测。",
  "{label} — how small a flaw can you hear?": "{label}：你能听出多小的瑕疵？",
  "An adaptive listening test that finds the smallest {blurb} you can still catch, and reports it in physical units.":
    "一项自适应听辨测试，针对这种损伤：{blurb}；它找出你还能听出的最小程度，并用物理单位报告。",
  "Your threshold — Standard of Taste": "你的阈值 · 鉴衡",
  "{figure} — Standard of Taste": "{figure} · 鉴衡",

  // The index.
  "STANDARD OF TASTE": "鉴衡",
  "THE GYM FLOOR": "首页",
  "How small a flaw can you hear?": "你能听出多小的瑕疵？",
  "Three kinds of damage, one per session. Each test walks the flaw down until you stop being sure, and gives you the size where that happened — {strong}":
    "三种损伤，每次测试一种。每项测试把瑕疵一步步调小，直到你不再有把握，然后告诉你那一刻的大小：{strong}",
  "a physical quantity, not a score.": "它是一个物理量，并非分数。",
  "~{minutes} min · {rungs} rungs · {lo} to {hi}": "约 {minutes} 分钟 · {rungs} 级 · {lo} 至 {hi}",
  "Start →": "开始 →",
  "Free · no sign-up · headphones required, not advised — laptop speakers cannot reproduce most of what this measures.":
    "免费 · 无需注册 · 必须戴耳机，并非建议：笔记本扬声器放不出这里测的大部分内容。",
  "What this instrument cannot do.": "这项测试做不到的事。",
  "Every limit we measured and could not fix.": "我们测到、却修不好的每一项限制。",

  // The flow.
  "How small a flaw can you still hear?": "你还能听出多小的瑕疵？",
  "Every pair is the same twenty seconds of music twice, and one of them has been damaged — {blurb}. Pick the damaged one. Get it right twice and the damage gets {smaller}; get it wrong and it gets bigger again.":
    "每一对都是同样的二十秒音乐放两遍，其中一遍被损坏了：{blurb}。选出被损坏的那一遍。连续答对两次，损坏就变得{smaller}；答错一次，它又会变大。",
  smaller: "更小",
  "The test walks down until it finds the size where you stop being sure. That size is your answer, and it is a real physical quantity — not a score out of ten.":
    "测试一步步往下走，直到找到你不再有把握的那个大小。那个大小就是你的答案，它是一个真实的物理量，并非十分制的分数。",
  "This session locks to a single recording, named at the top of every trial and on your result. A bitrate does different damage to different music, so the number means nothing without the material it was measured on.":
    "这次测试锁定在一段录音上，它的名字写在每个试次的顶部和你的结果上。同样的比特率对不同的音乐造成的损伤不同，所以离开测量所用的素材，这个数字没有意义。",
  "If you have measured this in this browser before, the retest reuses the same recording, so the two sittings can be compared — no account, nothing on a server. Clearing your browsing data starts you on a fresh one.":
    "如果你以前在本浏览器里测过这一项，重测会沿用同一段录音，这样两次测试才能比较；没有账户，服务器上也什么都没有。清除浏览数据后，你会从一段新的录音开始。",
  Start: "开始",
  "~{minutes} minutes. No sign-up. Headphones strongly advised — laptop speakers cannot reproduce most of what this measures.":
    "约 {minutes} 分钟。无需注册。强烈建议戴耳机：笔记本扬声器放不出这里测的大部分内容。",
  "trial {n}": "第 {n} 个试次",
  "One of these two has {blurb}. The other is untouched.": "这两段中有一段被这样损坏过：{blurb}。另一段没有动过。",
  "tap to listen": "点按收听",
  "Which one is damaged?": "哪一段被损坏了？",
  "Hear both all the way through first.": "先把两段都完整听一遍。",
  "{side} is the damaged one": "{side} 是被损坏的那一段",
  "No feedback until the end — being told would teach you the clip rather than the flaw.":
    "结束前不给反馈：告诉你对错，你学到的会是这段录音，学不到瑕疵本身。",
  "Measure a different flaw instead": "改测另一种瑕疵",
  "Try the reading while you wait": "等待期间，试试解读（the reading）",
  "Remembered in this browser only — no account, nothing on a server. Another device, or cleared browsing data, and the gym has never met you.":
    "只记在本浏览器里：没有账户，服务器上也什么都没有。换一台设备，或清除浏览数据，这里就从未见过你。",

  // The result screen.
  "YOUR SESSION · COHORT n = {n}": "你的测试 · 样本人群 n = {n}",
  "Measured from your session. No cohort exists to compare it against.": "从你的测试测得。没有可供比较的样本人群。",
  "Threshold card: {figure}": "阈值卡片：{figure}",
  "Share this number": "分享这个数字",
  "Story card": "竖版卡片",
  "WHAT THIS MEANS IN A RENDER": "放进生成的曲子里，这意味着什么",
  "What each flaw is called, and what it sounds like": "每种瑕疵叫什么，听起来是什么样",
  "THE LADDER · GENTLEST FIRST · {unit}": "阶梯 · 最轻的在前 · {unit}",
  CAUGHT: "听出",
  GUESSED: "在猜",
  "Right / shown, per rung. A staircase spends most of its trials near your limit, so the busy rows are where the answer is and the faint ones are rungs you were never asked about.":
    "每一级的答对数 / 出现数。阶梯的大部分试次都花在你的极限附近，所以试次多的几行就是答案所在，淡色的几行是从没问过你的级别。",
  "The two marked rungs come from the whole session, not from the count beside them — a boundary row can hold a single trial and still be the boundary.":
    "两个标出的级别来自整次测试，与旁边的计数无关：一个边界行可能只有一个试次，仍然是边界。",
  "SINCE LAST TIME": "与上次相比",
  "Read from this browser only — there are no accounts and nothing on a server, so another device has no history to compare and starts over.":
    "只读自本浏览器：没有账户，服务器上也什么都没有，所以换一台设备就没有历史可比，要从头开始。",

  // Shared controls.
  "Link copied ✓": "链接已复制 ✓",
  "Preparing…": "正在准备",
  "COMPARE — SAME MOMENT": "同一时刻对比",
  "loading both clips": "两段录音加载中",
  "playback blocked": "播放被拦截",
  "switch as often as you like": "想切换多少次都行",
  "{n} switch": "切换 {n} 次",
  "{n} switches": "切换 {n} 次",
  "Both clips run together — switching swaps which one you hear, at the same instant of the music. This is how a difference this small is actually found.":
    "两段录音同时播放：切换时，换掉的是你听到的那一段，切换落在音乐的同一个时刻，播放不停。这么小的差别，就是这样找出来的。",
  "Stop comparing": "停止对比",
  "Start comparing": "开始对比",
  Stop: "停止",
  Compare: "对比",
  Loading: "加载中",
  "Hear {side}": "听 {side}",
  "Your browser blocked playback. Tap Compare again — a direct tap usually clears it. Until both clips are actually sounding, this control will not pretend they are.":
    "你的浏览器拦截了播放。再点一次「对比」，直接点击通常就能解除。在两段录音真正响起之前，这个控件不会假装它们在响。",
};

export default THRESHOLD;
