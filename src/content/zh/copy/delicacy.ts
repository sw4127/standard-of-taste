/**
 * 细辨测试 · The Delicacy Trials' fixed strings in Chinese (bilingual Part 4; D2, N3).
 *
 * Keys are the exact English the page, the flow, the reveal blocks and the result
 * page render (`src/app/delicacy/`). The sentences built from a result live in
 * `delicacy-lines.ts`. The recordings' credits keep their licensors' English
 * wording (a CC requirement); only the heading above them is translated.
 * DRAFT: not yet through the owner's writing pass.
 */
import type { Dict } from "@/lib/i18n";

const DELICACY: Dict = {
  // Metadata.
  "The Delicacy Trials — can you hear what's wrong?": "细辨测试：你能听出哪里不对吗？",
  "{n} pairs of clips. In each, one is the original and one has been quietly damaged. Find the key in the wine.":
    "{n} 对录音。每一对里，一段是原版，一段被悄悄损坏过。找出酒里的那把钥匙。",
  "The Delicacy Trials": "细辨测试",
  "{k}/{n} originals caught — The Delicacy Trials": "认出 {k}/{n} 段原版 · 细辨测试",
  "{n} scored pairs of clips; one of each is quietly damaged. A coin flip gets half. Find the key in the wine.":
    "{n} 对计分的录音；每一对里有一段被悄悄损坏过。抛硬币能得一半。找出酒里的那把钥匙。",

  // The frame.
  "STANDARD OF TASTE": "鉴衡",
  "Two of Sancho's kinsmen tasted the wine.": "桑丘的两位亲戚尝了那桶酒。",
  "One said it was good — except for a faint taste of leather. The other agreed — except for the iron. The village laughed at both. Then the barrel ran dry, and at the bottom: an old key on a leather thong.":
    "一位说酒很好，只是有一丝皮革味。另一位也说好，只是有一股铁味。全村人都笑话他们俩。后来酒桶喝空了，桶底躺着一把旧钥匙，拴着一根皮绳。",
  "Hume's point: delicacy of taste is real, physical, and checkable. {strong} {practice} practice pairs with the answers shown, then {scored} scored ones. In each, one clip is the original and one has been quietly damaged. Find the key in the wine.":
    "休谟的意思是：鉴赏力（delicacy of taste）是真实的、物理的、可以核查的。{strong}先练 {practice} 对，答案当场揭晓，再做 {scored} 对计分的。每一对里，一段是原版，一段被悄悄损坏过。找出酒里的那把钥匙。",
  "Now you taste.": "现在轮到你来尝。",
  "Start the trials": "开始测试",
  "~{minutes} minutes. No sign-up. Headphones strongly advised.": "约 {minutes} 分钟。无需注册。强烈建议戴耳机。",
  "How this is measured.": "这是怎么测的。",
  "Item behaviour, reliability, and what the numbers can carry.": "题目表现、信度，以及这些数字能承载什么。",

  // Practice.
  "PRACTICE — NOT SCORED": "练习 · 不计分",
  "These three are the {loudest} examples of each kind of damage, and the answers are shown. Learn what to listen for.":
    "这三对是每种损伤里{loudest}的例子，答案都会揭晓。先学会该听什么。",
  loudest: "最重",
  "Practice {n} — A": "练习 {n} · A",
  "Practice {n} — B": "练习 {n} · B",
  "tap to listen": "点按收听",
  "Which one is the original?": "哪一段是原版？",
  "{side} is the original": "{side} 是原版",
  "That's it.": "就是它。",
  "Not this time.": "这次没对。",
  "{original} was the original. The damage in {other} was {flaw} — {hint}. Go back and switch between them until you can hear it; that is the whole skill.":
    "{original} 是原版。{other} 里的损伤是{flaw}：{hint}。回去在这一对里来回切换，直到你听出来；这项本事全在于此。",
  "Next practice pair": "下一对练习",
  "Start the {n} scored trials": "开始 {n} 对计分测试",

  // The trials.
  "heard enough — it plays on": "听够了：会继续播放",
  "tap to listen · unlocks at the notch": "点按收听 · 播到刻度处解锁",
  "DELICACY TRIALS": "细辨测试（Delicacy Trials）",
  "One of these is the original. The other has something wrong with it. Listen to both.":
    "其中一段是原版。另一段有哪里不对。两段都听一听。",
  "Pair {n} — A": "第 {n} 对 · A",
  "Pair {n} — B": "第 {n} 对 · B",
  "WHICH IS THE ORIGINAL?": "哪一段是原版？",
  "WHAT'S WRONG WITH {side}?": "{side} 哪里不对？",
  "HOW SURE ARE YOU {side} IS THE ORIGINAL?": "你有多确定 {side} 是原版？",
  certain: "确定",
  "fairly sure": "比较确定",
  "honestly guessing": "老实说在猜",
  "{label} — {hint}": "{label}：{hint}",
  "Honesty pays here — your confidence is scored against your accuracy at the end.":
    "在这里诚实有好处：你的把握最后会和你的准确率对照计分。",

  // The reveal.
  "YOUR EARS, MEASURED": "你的耳朵，测出来了",
  "originals identified": "认出的原版",
  "WHAT THIS MEANS IN YOUR WORK": "放进你自己的作品里，这意味着什么",
  "What each flaw is called, and what it sounds like": "每种瑕疵叫什么，听起来是什么样",
  "DID YOU KNOW WHEN YOU KNEW?": "你自报的把握准不准？",
  "Brier score {b} — pure coin-flip guessing scores {c}; lower is better, but only next to the direction above.":
    "布里尔分数（Brier score）{b}：纯抛硬币式的猜测得 {c}；越低越好，但只有和上面的方向放在一起看才算数。",
  "When you said {p}%: right {c} of {n}.": "你说 {p}% 时：对了 {c} 次（共 {n} 次）。",
  "Per-level breakdowns need 3+ answers at a level. The whole-session read above is the honest number.":
    "按把握程度拆分，每一档至少需要 3 个回答。上面整次测试的读数，才是诚实的数字。",
  "WHAT WAS ACTUALLY WRONG": "到底哪里不对",
  "Pair {n}: caught it": "第 {n} 对：听出来了",
  "Pair {n}: fooled you": "第 {n} 对：被骗过去了",
  " — the original was {original}, you picked {picked} at {conf}%.": "，原版是 {original}，你选了 {picked}，把握 {conf}%。",
  "The flaw: {flaw} ({size})": "瑕疵：{flaw}（{size}）",
  " — you named it.": "，你说对了。",
  ' — you said "{flaw}".': "，你说的是「{flaw}」。",
  "YOUR EARS, PORTABLE": "带得走的耳朵",
  "The link carries only your answers — anyone who opens it sees your session rescored, then gets dared to beat it.":
    "链接里只带着你的回答：打开它的人会看到你的测试被重新计分，然后被激去打破这个成绩。",
  "Share your ears": "分享你的耳朵",
  "Story card": "竖版卡片",
  "View your result page →": "查看你的结果页 →",
  RECORDINGS: "录音",
  "Run it again →": "再测一次 →",

  // The result page.
  "THE DELICACY TRIALS": "细辨测试（Delicacy Trials）",
  "Delicacy Trials card: {k} of {n} originals caught": "细辨测试卡片：认出 {k} 段原版（共 {n} 对）",
  "Share these ears": "分享这双耳朵",
  "Someone sent you their score? They're daring you.": "有人把他们的分数发给了你？他们在激你。",
  "Get your ears tested": "测测你的耳朵",
  "Provisional read — percentiles arrive when the cohort does, not before.":
    "暂定读数：百分位要等有了样本人群才会出现，不会更早。",
};

export default DELICACY;
