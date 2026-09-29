/**
 * 解读页 · The reading's page copy in Chinese (bilingual Part 2; BA-6, BA-8, BA-11).
 *
 * Keys are the exact English in `src/content/reading/copy.ts`, the prompt's
 * labels in `prompt.ts`, the listener label, the data-source badge and the
 * front door's share line. The lines themselves are templates in
 * `reading-lines.ts`. The fictional host, Tessavox, keeps its name.
 * DRAFT: not yet through the owner's writing pass.
 */
import type { Dict } from "@/lib/i18n";

const READING: Dict = {
  // Metadata.
  "The reading — Standard of Taste": "解读 · 鉴衡",
  "Four weeks of an illustrative listener's plays, read into lines you can check against the plays, argue with, and carry into a prompt.":
    "一位示例听者四周的播放记录，读成一条条可以对照播放核对、可以反驳、可以带进提示词的文字。",

  // The page (src/content/reading/copy.ts).
  "THE READING": "解读（the reading）",
  "What a month of listening says, in words you can argue with.": "一个月的收听说了什么，写成你可以反驳的话。",
  "Pick a listener.": "选一位听者。",
  "Each is four weeks of plays by someone who does not exist. Read one as if the plays were yours: every line is computed from them, and every line shows the plays it counted.":
    "每一位都是一个虚构的人四周的播放记录。读的时候，把这些播放当成你自己的：每一条都由它们算出，每一条都列出它计入的播放。",
  "{plays} plays · {tracks} tracks · four weeks": "{plays} 次播放 · {tracks} 首歌 · 四周",
  "Illustrative listener. Fictional artists and plays.": "示例听者（illustrative listener）。艺人和播放记录都是虚构的。",
  "Each line names a pattern in the plays and offers two things it might mean. Keep a line or reject it; pick the reading that fits, or neither.":
    "每一条说出播放记录里的一种规律，再提示它可能意味着的两种情况。一条可以保留，也可以删去；挑出合适的那种读法，或者两种都不要。",
  "Show the plays": "展开播放记录",
  "Hide the plays": "收起播放记录",
  "What might it mean?": "它可能意味着什么？",
  "This isn't right": "这条不对",
  "Rejected. It won't be in your prompt.": "已删去，它不会进入你的提示词。",
  "Put it back": "放回来",
  "skipped within 30 s": "30 秒内跳过",
  "played past 30 s": "播放超过 30 秒",
  "Day {day} · {time} · {title} — {artist}{mark}": "第 {day} 天 · {time} · 《{title}》，{artist}{mark}",
  " · {mark}": " · {mark}",
  "Turn what you kept into a prompt": "把留下的内容写成提示词（prompt）",
  "Read another listener": "换一位听者",
  "Your prompt": "你的提示词（prompt）",
  "Built only from the lines you kept and the readings you chose. Change either above and this changes.":
    "只用你保留的条目和你选的读法拼成。上面改动任何一处，这里就跟着变。",
  "You rejected every line, so there is nothing left to make a prompt from. Put one back.":
    "你删去了所有条目，没有剩下能写成提示词的东西。放回一条吧。",
  Copy: "复制",
  Copied: "已复制",
  "Which of these words can you hear?": "这些词里，哪些你听得出来？",
  "you heard this in the test": "你在测试中听出了这一项",
  "at your threshold you may not tell": "在你的阈值（threshold）上，可能分辨不出",
  "Tune these with the hearing tests": "用听辨测试校准这些词",
  "Any mark here is read from a Threshold sitting stored in this browser. There is no account; on another device, or after clearing site data, the marks are gone.":
    "这里的标记，都读自本浏览器里存下的一次阈值测试。没有账户；换一台设备，或清除网站数据之后，标记就没有了。",
  "Tuning, timing and fidelity are the three kinds of damage the Threshold Test measures. A word for a difference you cannot hear is a word the generator can ignore without you noticing.":
    "音准（tuning）、节拍（timing）和保真度（fidelity）是阈值测试（Threshold Test）测量的三类损伤。描述一个你听不出的差别的词，生成工具可以忽略，你也察觉不到。",
  "Paste it into Tessavox": "贴进 Tessavox",
  "Illustrative. Tessavox is a fictional company, and this is a mock of its creation screen.":
    "示意（ILLUSTRATIVE）。Tessavox 是一家虚构的公司，下面是仿照它的创作界面（creation screen，示意）做的模型。",
  "New track": "新曲目",
  "Describe the track": "描述这首曲子",
  Generate: "生成",
  "Illustrative. No audio is generated.": "示意。不会生成任何音频。",
  "Back to the reading": "回到解读",
  "Why this works, and where it might not": "为什么行得通，又可能在哪里行不通",
  "The reading rests on an argument. Here it is in full, each step labelled with what supports it.":
    "解读建立在一个关于口味（taste）的论证上。下面列出全文，每一步都标明了支撑它的是什么。",
  "A reading of a listener's recent plays, in lines you can check, argue with, and carry into a prompt.":
    "对一位听者近来播放记录的解读，每一条都能核对、能反驳、能带进提示词。",

  // The prompt (src/content/reading/prompt.ts).
  Tuning: "音准",
  Timing: "节拍",
  Fidelity: "保真度",
  "Style: {style}.": "风格：{style}。",
  "Vocals: {vocals}.": "人声：{vocals}。",
  "Production: {production}.": "制作：{production}。",
  "{label}: {text}.": "{label}：{text}。",
  "Mood: {mood}.": "情绪：{mood}。",
  "{texture}, {tempo}": "{texture}，{tempo}",
  "with touches of {texture}": "带一点{texture}",
  "; ": "；",
  ", ": "、",

  // The argument's step names (src/components/BlueprintArgument.tsx).
  So: "所以",
  Therefore: "因此",
  Objection: "反对意见",
  Reply: "回应",
  "Held open": "存疑",

  // The data-source badge (src/components/lab/SourceBadge.tsx).
  MEASURED: "实测",
  SIMULATED: "模拟",
  MIXED: "混合",
  REAL: "真实",
  "measured off the shipped audio files — no people involved": "从上线的音频文件测得，不涉及任何人",
  "generated from a known model — not measured from people": "由已知模型生成，并非从人身上测得",
  "combines model-generated and measured responses": "混合了模型生成的与实测的作答",
  "measured from real respondents": "从真实作答者身上测得",
};

export default READING;
