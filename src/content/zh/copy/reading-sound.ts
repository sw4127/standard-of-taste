/**
 * 三位示例听者的声音描述 · The listeners' sound words in Chinese (bilingual Part 2; RT-Z8 a).
 *
 * Keys are the exact English in `src/content/reading/listeners.ts`: each
 * cluster's tempo, texture, voice and production, and its words in the three
 * flaw families (BP-BRIDGE). They feed the Chinese prompt and the drift line.
 * Generic generator vocabulary, no generator named. Tempo stays in bpm.
 * DRAFT: not yet through the owner's writing pass.
 */
import type { Dict } from "@/lib/i18n";

const SOUND: Dict = {
  // Mira · hush
  "slow, around 70 bpm": "慢速，约 70 bpm",
  "sparse piano and room hiss": "稀疏的钢琴和房间底噪",
  "no vocals": "无人声",
  "close-miked and dry": "近距离收音，干声",
  "a felt piano, a little out of tune": "毛毡钢琴，音准略偏",
  "rubato, off the grid": "自由速度，不贴网格",
  "clean and close, room hiss left in": "干净贴近，保留房间底噪",
  // Mira · haze
  "mid-tempo on half-time drums": "中速，半速律动的鼓",
  "washed-out synth pads": "朦胧的合成器长音",
  "a low, breathy vocal": "低沉、带气声的人声",
  "tape-saturated": "磁带饱和",
  "warbling, detuned pads": "摇晃、失谐的长音",
  "lazy, behind-the-beat drums": "慵懒、拖在拍子后面的鼓",
  "tape-worn, soft top end": "磁带磨损感，高频柔和",
  // Mira · pulse
  "a steady 120 bpm": "稳定的 120 bpm",
  "clean electric guitar arpeggios": "干净的电吉他琶音",
  "a bright, doubled vocal": "明亮的双轨人声",
  "polished and wide": "精修，声场宽阔",
  "a pitch-corrected vocal": "修过音高的人声",
  "tight to the grid": "紧贴网格",
  "glossy, fully polished": "光亮，彻底精修",
  // Teo · groove
  "a loose 100 bpm swing": "松弛的 100 bpm 摇摆",
  "live bass and brushed drums": "现场贝斯和鼓刷",
  "a dry, conversational vocal": "干声、像说话一样的人声",
  "roomy, barely processed": "有房间感，几乎不加处理",
  "horns that sit a little sharp": "铜管略微偏高",
  "a loose swing": "松弛的摇摆",
  "a live-room recording, unpolished": "现场房间录音，不加修饰",
  // Teo · bright
  "fast, around 140 bpm": "快速，约 140 bpm",
  "chopped vocal samples and bright synths": "切碎的人声采样和明亮的合成器",
  "pitched-up vocal chops": "升调的人声切片",
  "loud and glossy": "响亮、光亮",
  "hard-tuned vocals": "强修音的人声",
  "quantised, machine-tight": "量化到网格，像机器一样紧",
  "crisp, digital, bright top end": "清脆的数字感，高频明亮",
  // Teo · drone
  "no fixed pulse": "没有固定律动",
  "long bowed strings and drones": "绵长的弓弦和持续音",
  "a cavernous reverb": "洞穴般的混响",
  "pure-interval drones": "纯律音程的持续音",
  "free time": "自由节拍",
  "pristine, full detail": "纯净，细节完整",
  // Lin · wall
  "fast and driving, around 160 bpm": "快速推进，约 160 bpm",
  "distorted guitars in a wall of sound": "失真吉他堆成的音墙",
  "a shouted, double-tracked vocal": "嘶喊的双轨人声",
  "dense and loud": "密实、响亮",
  "drop-tuned guitars": "降调定弦的吉他",
  "tight, pushed drums": "紧凑、往前赶的鼓",
  "gritty, lo-fi edges": "粗粝的低保真边缘",
  // Lin · acoustic
  "slow, around 80 bpm": "慢速，约 80 bpm",
  "fingerpicked nylon guitar": "指弹尼龙弦吉他",
  "a quiet, close vocal": "轻声、贴近的人声",
  "intimate and dry": "私密，干声",
  "open tunings, a little loose": "开放定弦，略松",
  "human, slightly uneven": "人手的节奏，略有不齐",
  "warm and analog, a little hiss": "温暖的模拟感，带一点底噪",
  // Lin · choir
  "a slow swell": "缓慢地涨起",
  "layered voices and organ": "层叠的人声和管风琴",
  "choral harmony": "合唱和声",
  "a church-hall reverb": "教堂大厅的混响",
  "pure, stacked harmony": "纯净、层叠的和声",
  "free, paced by breath": "自由，随呼吸起落",
  "clean and airy, every breath audible": "干净通透，每一口气都听得见",
};

export default SOUND;
