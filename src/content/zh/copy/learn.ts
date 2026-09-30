/**
 * 资料室 · The library in Chinese (bilingual Part 2; BP-INSIGHT, BP-ARG, BP-BRIDGE).
 *
 * Keys are the exact English the library renders: its shell
 * (`src/app/learn/LearnShell.tsx`), the explainer scaffold
 * (`src/app/learn/Explainer.tsx`), the registry entries in
 * `src/content/learn.ts`, and each page's own prose. Statements of the argument
 * come from `docs/blueprint.zh.md`, never from here.
 * DRAFT: not yet through the owner's writing pass.
 */
import type { Dict } from "@/lib/i18n";
import LIBRARY from "./library";

const LEARN: Dict = {
  // The registry entries and the explainers' prose (bilingual Part 4).
  ...LIBRARY,

  // The shell and the scaffold.
  "The library": "资料室（The Library）",
  "Take the Prestige Test": "做一次名气偏差测试（Prestige Test）",
  "Terms · Privacy": "条款 · 隐私",
  "Questions, answered straight": "问题与直接的回答",
  "Standard of Taste": "鉴衡",

  // /learn/why.
  "Why this exists": "为什么做这个项目",
  "Why this exists — Standard of Taste": "为什么做这个项目 · 鉴衡",
  "The argument behind the reading, step by step and labelled with what supports each step, the three common-sense assumptions it rejects, and the bridge from hearing to the prompt.":
    "解读背后的论证，逐步列出，每一步标明支撑它的是什么；它否定的三条常识；以及从听辨到提示词的桥接。",
  "THE READING · THE ARGUMENT": "解读（the reading） · 论证",
  "The argument.": "论证。",
  "{lead} Each step is labelled with what supports it: evidence, an assumption, or an inference from the steps before.":
    "{lead}每一步都标明了支撑它的是什么：证据、假设，或由前几步推出的推论（INFERENCE）。",
  "Three things common sense says, and the project rejects.": "三条被挑战的常识（challenged assumption）：常识这样说，本项目不认同。",
  "The bridge.": "桥接。",
  "{lead} Why the reading ends where the hearing tests begin.": "{lead}为什么解读结束的地方，就是听辨测试（hearing tests）开始的地方。",
  "Is the reading telling me how I feel?": "解读是在告诉我，我感受到了什么吗？",
  "No. It names a pattern in the plays and offers two things it might mean, as questions. The same pattern can come from opposite feelings, so which one is right, if either, is yours to say.":
    "没有。它说出播放记录里的一种规律，再以问题的形式提示两种可能的意思。同一种规律可能来自相反的感受，所以哪一种对，或者都不对，由你来说。",
  "Whose plays does it read?": "它读的是谁的播放记录？",
  "Three illustrative listeners who do not exist. Their plays are generated from habits written for them, and nothing on this site reads anybody's real listening history.":
    "三位虚构的示例听者（illustrative listener）。他们的播放记录由为他们写好的习惯生成，本站不读取任何人真实的播放记录。",
  "Where is the argument weakest?": "这个论证最弱在哪里？",
  "At the fourth premise, which nothing supports yet, and at the step from naming a pattern to saying anything about a feeling. That step is why the reading offers and the reader decides.":
    "在第四个前提，目前没有任何证据支持它；还有从说出规律到谈论感受的那一步。正因为这一步，解读只作提示，由读者决定。",
};

export default LEARN;
