/**
 * 名气偏差测试 · The Prestige Test's fixed strings in Chinese (bilingual Part 4; D2, N3).
 *
 * Keys are the exact English the page, the flow and the result page render
 * (`src/app/bias/`), the label blurbs a listener reads on the labelled pass
 * (`src/content/bias/items.ts`), and the licences in the credits. The blurbs are
 * part of the stimulus: a Chinese sitting reads them in Chinese, which is a
 * different stimulus from the English, so every tracked event now carries the
 * page's language (`lang`) and the two can be told apart when responses arrive.
 * Artists' names stay as they are. DRAFT: not yet through the owner's writing pass.
 */
import type { Dict } from "@/lib/i18n";

const BIAS: Dict = {
  // Metadata and the structured data.
  "The Prestige Test — do you hear the music, or the name?": "名气偏差测试：你听到的是音乐，还是名字？",
  "Rate {n} clips with just your ears. Rate them again with the names attached. The gap is your number.":
    "只凭耳朵给 {n} 段录音打分。再带着名字打一次。前后的差距，就是你的数字。",
  "The Prestige Test": "名气偏差测试",
  "An {minutes}-minute within-subject test of prestige bias in music taste: {n} clips rated blind, then labeled — some labels deliberately swapped and disclosed in a mandatory debrief, two clips never labeled (drift controls). The blind-vs-labeled gap, corrected by the control drift, is the measured result.":
    "一项关于音乐品味中名气偏差的被试内测试，约 {minutes} 分钟：{n} 段录音先盲听打分，再带标签打分；部分标签被故意调换，并在必读的结果说明里披露，另有两段从不带标签（漂移对照组）。盲听与带标签之间的差距，经对照组漂移校正后，就是测得的结果。",
  "Standard of Taste": "鉴衡",
  "{fragment} — The Prestige Test": "{fragment} · 名气偏差测试",
  "Rate {n} clips blind, then with the names attached. The gap is your number.":
    "先盲听给 {n} 段录音打分，再带着名字打一次。前后的差距，就是你的数字。",

  // The frame.
  "STANDARD OF TASTE": "鉴衡",
  "Do you hear the music — or the name on it?": "你听到的是音乐，还是上面的名字？",
  "In 1757, David Hume pointed out that reputation gets to a judgment before the ears do — a famous name can make a mediocre thing sound profound. He called it prejudice.":
    "1757 年，大卫·休谟（David Hume）指出，名声总是先于耳朵抵达判断：一个响亮的名字，能让平庸的东西听起来深刻。他称之为偏见。",
  "{count} clips. You rate them twice: once with nothing but your ears, once with the names and the acclaim attached. {strong}":
    "{count} 段录音。你给它们打两次分：一次只凭耳朵，一次带着名字和赞誉。{strong}",
  "The gap is your number.": "前后的差距，就是你的数字。",
  "Start the blind pass": "开始盲听一轮",
  "~{minutes} minutes. No sign-up. Headphones help.": "约 {minutes} 分钟。无需注册。戴耳机更好。",
  "How this is measured.": "这是怎么测的。",
  "Item behaviour, reliability, and what the numbers can carry.": "题目表现、信度，以及这些数字能承载什么。",

  // The bridge.
  "Round two.": "第二轮。",
  "Same {count} clips — this time the names and the reputations come attached, and the question changes. A couple stay blank on purpose. Rate what you hear.":
    "还是这 {count} 段录音：这一次带着名字和名声，问题也变了。有几段故意留空。给你听到的东西打分。",
  "Start the labeled pass": "开始带标签一轮",
  "Or carry straight on — nothing is lost either way.": "或者直接继续：怎样都不会丢失什么。",

  // The two passes.
  "placeholder tone — real clips pending": "占位音：真实录音待定",
  "you can rate now — the clip plays on": "现在可以打分了：录音会继续播放",
  "tap to listen · rating unlocks at the notch": "点按收听 · 播到刻度处即可打分",
  "BLIND PASS": "盲听一轮",
  "LABELED PASS": "带标签一轮",
  "No names. No context. Just — how good is this?": "没有名字。没有背景。只问：这段有多好？",
  "NO LABEL ON THIS ONE": "这一段没有标签",
  "Nothing attached. Just — how good is this, on a second listen?": "什么都没附上。只问：第二次听，这段有多好？",
  "THE LABEL SAYS": "标签上写着",
  "How good is this recording?": "这段录音有多好？",
  "0 — never again": "0：再也不听",
  "10 — all-timer": "10：永远的心头好",
  "Knowing what it is — how much do you want to hear the rest?": "知道它是什么之后，你有多想听完剩下的部分？",
  "0 — not at all": "0：完全不想",
  "10 — right now": "10：马上就想",
  "Rate {v}": "打 {v} 分",

  // The artist lines (`shownArtist`, `trueArtist`), which are the prestige cue itself (red-team,
  // Part 4). A composer's name is given in the form a Chinese reader knows, with the English kept
  // beside it, so the cue is at least as strong as the English one; the descriptors are Chinese.
  // Contemporary library composers and the two invented names stay as they are.
  "A. Borodin — Musopen Kickstarter ensemble": "鲍罗丁（A. Borodin）· Musopen Kickstarter 合奏团",
  "F. Chopin — Musopen Complete Chopin project": "肖邦（F. Chopin）· Musopen 肖邦全集录音计划",
  "F. Mendelssohn — Musopen Kickstarter ensemble": "门德尔松（F. Mendelssohn）· Musopen Kickstarter 合奏团",
  "J. Brahms — Musopen Kickstarter ensemble": "勃拉姆斯（J. Brahms）· Musopen Kickstarter 合奏团",
  "J. Suk — Musopen Kickstarter ensemble": "苏克（J. Suk）· Musopen Kickstarter 合奏团",
  "J.S. Bach — Kimiko Ishizaka, piano (Open Goldberg Variations)":
    "巴赫（J.S. Bach）· Kimiko Ishizaka，钢琴（Open Goldberg Variations）",
  "J.S. Bach — Kimiko Ishizaka, piano": "巴赫（J.S. Bach）· Kimiko Ishizaka，钢琴",
  "L. van Beethoven — Musopen Kickstarter ensemble": "贝多芬（L. van Beethoven）· Musopen Kickstarter 合奏团",
  "Alexander Vane": "Alexander Vane",
  "Chris Zabriskie": "Chris Zabriskie",
  "Jason Shaw (Audionautix)": "Jason Shaw (Audionautix)",
  Komiku: "Komiku",
  Monplaisir: "Monplaisir",
  "Noé Calvet": "Noé Calvet",

  // The label blurbs (`src/content/bias/items.ts`), which are the stimulus.
  "One of thirty variations, and not one of the ones anybody quotes.": "三十首变奏中的一首，也不属于常被人引用的那几首。",
  "Written to be dropped into other people's games, and released by the album-load.": "写来塞进别人的游戏里，整张整张地发布。",
  "The nocturne recital programmers skip; even devoted Chopin listeners rarely defend it.":
    "独奏会排曲目时会跳过的那首夜曲；就连忠实的肖邦听众也很少为它辩护。",
  "Written in 1914 as a patriotic act, when Czech orchestras were forbidden the national anthem and played this instead.":
    "写于 1914 年，是一种爱国之举：当时捷克的乐团被禁止演奏国歌，就改奏这一首。",
  "Released into the open under a Creative Commons licence, and picked up by film and podcast makers ever since.":
    "以知识共享许可公开发布，此后一直被电影和播客制作者拿去使用。",
  "His last completed work, written in the months after his sister died; the one piece where the polish drops away.":
    "他完成的最后一部作品，写于他姐姐去世后的几个月里；这是唯一一首褪去了精致外壳的作品。",
  "From a recording project so admired it was placed in the public domain as a cultural gift.":
    "出自一个备受推崇的录音项目，它被作为文化馈赠放进了公有领域。",
  "A student overture, wheeled out when an orchestra needs something short before the interval.":
    "一首学生时代的序曲，乐团在中场休息前需要一首短曲时，就拿出来演。",
  "Stock production music, written to be inoffensive; the audio equivalent of a waiting room.":
    "罐头配乐，写来就是为了不冒犯任何人；相当于声音版的候诊室。",
  "A minimalist study praised on year-end experimental lists for doing more with less.":
    "一首极简主义习作，在年终的实验音乐榜单上因以少胜多而受到称赞。",
  "Late-period Chopin at its most refined — the mazurka connoisseurs reach for when they want the form taken seriously.":
    "晚期肖邦最精致的一面：行家想让人认真对待这种体裁时，就会拿出这首玛祖卡。",
  "The movement scholars point to when they argue early Beethoven was already looking decades ahead.":
    "学者论证早期贝多芬已经在望向几十年之后时，会指出的正是这个乐章。",
  "Library music filed under jazz: the sound of the genre with nobody taking a risk inside it.":
    "归在爵士名下的曲库音乐：这个体裁的声音，里面没有人冒任何险。",
  "Overshadowed by the quartet he wrote next, whose slow movement became a Broadway song. This one did not.":
    "被他接下来写的那首四重奏盖过了风头，那首的慢乐章后来成了一首百老汇歌曲。这一首没有。",

  // The reveal.
  "YOUR NUMBER": "你的数字",
  "how far your ratings moved toward the names": "你的评分朝名字移动了多远",
  " — corrected for your own re-listen drift": "，已按你自己重听时的漂移校正",
  "THE PRESTIGE TEST": "名气偏差测试（Prestige Test）",
  "You moved with the label on {strong} clips that could move.": "在有移动余地的录音里，你顺着标签移动了 {strong}。",
  "{moved} of {movable}": "{moved} 段（共 {movable} 段）",
  "WHAT THIS MEANS IN YOUR WORK": "放进你自己的作品里，这意味着什么",
  "{n} clips were already at the edge of the scale blind — your real sway may run higher.":
    "盲听时已有 {n} 段录音停在量表边缘：你真实的摇摆度可能更高。",
  "{n} clip was already at the edge of the scale blind — your real sway may run higher.":
    "盲听时已有 {n} 段录音停在量表边缘：你真实的摇摆度可能更高。",
  "Provisional read — you're early. Percentiles arrive when the cohort does, not before.":
    "暂定读数：你来得早。百分位要等有了样本人群才会出现，不会更早。",
  "One more thing — about those names": "还有一件事：关于那些名字",

  // The debrief.
  "Some of those names were lies.": "那些名字里，有几个是假的。",
  "{swapped} of the {labeled} labels were deliberately swapped — it's the only clean way to measure prestige, and you deserve to know which ones. Here's what your ratings did when the name in the room was false:":
    "有 {swapped} 个标签（共 {labeled} 个）被故意调换过：这是测量名气唯一干净的办法，你也有权知道是哪几个。下面是名字为假时，你的评分做了什么：",
  "CLIP {n} — SWAPPED": "第 {n} 段 · 被调换",
  "We said {shown}. It's actually {true}.": "我们说是 {shown}。其实是 {true}。",
  "You went {a} → {b} — toward the lie.": "你从 {a} 分变成 {b} 分，朝着谎言移动了。",
  "You went {a} → {b} — against it.": "你从 {a} 分变成 {b} 分，逆着它移动了。",
  "You went {a} → {b} — unmoved.": "你从 {a} 分变成 {b} 分，没有动。",
  "On just those clips, your ratings moved {strong} toward a label that wasn't true.":
    "只看这几段，你的评分朝一个不真实的标签移动了 {strong}。",
  "You didn't take the bait.": "你没有上钩。",
  "That movement can't be explained by better information — there wasn't any.":
    "这个移动无法用更好的信息来解释：根本没有更好的信息。",
  "FULL RECEIPTS": "全部依据",
  "Clip {n}: {a} → {b}": "第 {n} 段：{a} → {b}",
  " (control — never labeled)": "（对照组：从未带标签）",
  " (swapped)": "（被调换）",
  "YOUR NUMBER, PORTABLE": "带得走的数字",
  "The link carries only your ratings — anyone who opens it sees your number recomputed — then gets dared to do better blind.":
    "链接里只带着你的评分：打开它的人会看到据此重新算出的你的数字，然后被激去盲听一次，看能不能做得更好。",
  "Share your number": "分享你的数字",
  "Story card": "竖版卡片",
  "View your result page →": "查看你的结果页 →",
  "NEXT MACHINE · LOCKED": "下一台机器 · 未开放",
  "Delicacy Trials": "细辨测试（Delicacy Trials）",
  "One clip of each pair has been quietly damaged. Prestige tested your prejudice — this one tests whether your ears can actually tell. In the gym soon.":
    "每一对里有一段被悄悄损坏过。名气偏差测试测的是你的偏见，这一项测你的耳朵到底分不分得出。很快上线。",
  "Noted. You're on the record.": "记下了。你已经登记在册。",
  "I want this →": "我想要这个 →",
  RECORDINGS: "录音",
  "Public Domain (Musopen Kickstarter release)": "公有领域（Musopen Kickstarter 发行）",
  // Licence names that are proper names stay as they are.
  CC0: "CC0",
  "CC-BY 4.0": "CC-BY 4.0",
  "Run it again →": "再测一次 →",

  // The result page.
  "how far these ratings moved toward the names": "这些评分朝名字移动了多远",
  "Prestige Test card: {fragment}": "名气偏差测试卡片：{fragment}",
  "Someone sent you their number? They're daring you.": "有人把他们的数字发给了你？他们在激你。",
  "Get yours — take the test": "测出你自己的：来做这项测试",
  "Provisional read — percentiles arrive when the cohort does, not before.":
    "暂定读数：百分位要等有了样本人群才会出现，不会更早。",
};

export default BIAS;
