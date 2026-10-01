# Cowork jobs — open, each with its prompt

**The rule (owner, 2026-09-30):** any job assigned to Cowork comes with a copy-paste prompt, and every
session close reminds the owner of every open job here. Cowork cannot see this repository's working
tree, so each prompt stands alone and points at public GitHub URLs. When Cowork returns, the owner
pastes the reply into a Claude Code session, which commits it, runs the guards and fixes whatever a
guard catches. A job leaves this file when its result is committed.

---

## Job 1 · Check the Chinese PRD, line by line (opened 2026-09-30, URGENT: needed for the résumé)

Files: `docs/prd-1-use-cases.zh.md` to `docs/prd-4-screens.zh.md` (commit `70ae414`). Cowork returns whole
files, so engineering diffs the return against `70ae414` and merges it: anything committed to these files
after that commit would otherwise be silently overwritten.

```text
You are checking a Chinese translation before it goes on my résumé. I am applying for product roles,
and a Chinese recruiter may read it. Check every line; do not skim.

WHAT IT IS
A four-part product requirements document (PRD) for my project "Standard of Taste" (论品味的标准).
The English is the original and governs. The Chinese was translated by Claude Code, which writes
Chinese less well than you do, and no native reader has checked it yet.

FILES (public; open each URL)
Chinese, to revise:
1. https://raw.githubusercontent.com/sw4127/standard-of-taste/main/docs/prd-1-use-cases.zh.md
2. https://raw.githubusercontent.com/sw4127/standard-of-taste/main/docs/prd-2-features.zh.md
3. https://raw.githubusercontent.com/sw4127/standard-of-taste/main/docs/prd-3-requirements.zh.md
4. https://raw.githubusercontent.com/sw4127/standard-of-taste/main/docs/prd-4-screens.zh.md
English originals, to check against:
1. https://raw.githubusercontent.com/sw4127/standard-of-taste/main/docs/prd-1-use-cases.md
2. https://raw.githubusercontent.com/sw4127/standard-of-taste/main/docs/prd-2-features.md
3. https://raw.githubusercontent.com/sw4127/standard-of-taste/main/docs/prd-3-requirements.md
4. https://raw.githubusercontent.com/sw4127/standard-of-taste/main/docs/prd-4-screens.md
Terminology reference: https://raw.githubusercontent.com/sw4127/standard-of-taste/main/docs/glossary-zh.md
(rule 3 below overrides it: taste is 品味 here, never 口味)

CHECK EVERY LINE FOR THREE THINGS
A. Accuracy against the English: same meaning, nothing added or dropped. Every number, date, ID
   (UC-1, FR-3.2, S-4, BP-GOAL, BA-3, RT-Z10 a, N3, D1), route (/reading), file path and code name
   stays exactly as it is.
B. Natural Chinese for a professional reader. Fix English clause order, long pre-modifiers,
   English-shaped commas and translationese. Put conditions, causes and time before the main clause
   where Chinese would.
C. My rules, all of them:
 1. Keep the caveat at the top of each file. It must keep these four phrases word for word, because a
    test checks them: 中文并非主要开发语言 · 译自英文原文 · 句子结构沿用英文语法 · 以英文原文为准.
    You may improve the words around them.
 2. English in brackets only for specialised technical terms, at first use, written 中文（English）:
    音分（cents）, 基线（baseline）, 自适应阶梯法（adaptive staircase）. Do not gloss everyday words
    such as 解读, 提示词, 播放记录, 规律.
 3. Musical taste is 品味. Never 口味, never 趣味.
 4. No comma between an "X的是" opener and its clause: 要看的是哪些功能, never 要看的是，哪些功能.
    Better still, avoid the opener.
 5. 不是 is banned in every form (并不是, 是不是, 不是……而是). For a negation use 并非, 没有, 无, 未,
    不属于 or 谈不上. Also banned: 而是, 而非, 反而, 恰恰, 与其说……不如说.
 6. No dashes, no ellipses, no exclamation marks.
 7. Quotation marks are 「」 only, and only for a verbatim quote or a button label. Punctuation next to
    Chinese is full-width. Brackets are full-width （）, with no space inside or before them, and never
    directly after `code` (write "`/reading` 上的依据", never "`/reading`（依据）").
 8. Banned words. Empty verbs: 进行 开展 实现 提升 推动 助力 赋能 打造 构建 落地 深耕 聚焦 围绕 致力于
    旨在 对齐. Jargon: 显著 高效 深度 全方位 多维度 无缝 极致 沉浸式 底层逻辑 颗粒度 链路 闭环 抓手.
    Register: 值得注意的是 总而言之 综上所述 让我们 相信, 不仅……而且, 在……的背景下. Loan
    translations: 模式 (商业模式 is fine), 收据 (use 依据), 杀掉.
 9. Renderings the glossary refused: 读解 (also inside 阅读解读), 虚构听者 / 虚拟听众 / 示例听众 (use
    示例听者), 反转 (a staircase reversal is 转折点), 听力测试 (use 听辨测试), 美分 (use 音分),
    声望测试 (use 名气偏差测试), 收听模式 / 听歌模式 (use 规律).
 10. One line per paragraph. Do not hard-wrap Chinese: a line break inside a paragraph shows as a
    stray space on GitHub.

DO NOT CHANGE
- The comment line <!-- EN-SOURCE ... --> near the top of each file. A test reads it.
- The BP-GOAL quotation in part 2. It is quoted word for word from the Chinese blueprint, and a test
  fails if it differs. If you think it should change, say so in your notes and leave it.
- Anything inside `backticks`, link targets, table structure, and the IDs in headings (FR-1, S-3).
- Button labels in 「」. They match the Chinese site. If one reads badly, note it; do not change it.

LOOK HERE FIRST (the translator's own weak spots)
- Part 2: the axis names 试用（TRY）and 出资（FUND）, and the tie-break paragraph under 排序.
- Terms: 使用场景 for "use case" (an engineering reader may expect 用例), 措辞规范 for "register",
  反模仿条款 for "anti-clone clause", 复测训练线 for "retest arc".
- Part 3: FR-14.3 and FR-17.1. Part 4: the long paragraph under S-4.

RETURN
1. Each of the four files in full, revised, each in its own code block, ready to replace the file.
2. In each file, change 「**译文状态：** 初稿，待逐句校对。」 to 「**译文状态：** 已逐句校对，<today's date>。」
   only if you checked every line of that file.
3. A change log per file, as a table: where (section or line), old, new, why.
4. Anything where the English itself looks wrong or unclear. Report it; do not fix the English.
5. One line per file: résumé-ready yes or no, and if no, what remains.
```

---

## Job 2 · Bring the Chinese site and blueprint into line with the PRD's rules (opened 2026-09-30, ruling (a))

The owner ruled (a) on 2026-09-30: the same two rules apply site-wide. Musical taste becomes 品味 (口味
appears in `docs/blueprint.zh.md`, `docs/glossary-zh.md` and four dictionaries), and only specialised
technical terms keep their English. Engineering follows Cowork's return: the glossary data, the
first-use test and the 趣味 ban's hint all name 口味 today and change with it. The two on-surface
statements live in `CLAUDE.md`, which is append-only: Cowork's revisions are appended as a new stamped
rendering, pending the owner's approval, never edited in place.

```text
Send this in the same conversation as the PRD check, after it: it uses that check's rule list.

You are revising the Chinese text of my project's website and its Chinese blueprint. If you already
have my earlier brief for revising the Chinese site, this adds to it; where the two disagree, this one
is newer.

TWO RULINGS TO APPLY EVERYWHERE
1. Musical taste is 品味, never 口味 (and never 趣味). 论品味的标准 stays as it is.
2. English in brackets only for specialised technical terms, at first use, as 中文（English）. Today the
   site glosses every glossary term, everyday words included (解读（the reading）, 提示词（prompt）,
   播放记录（plays）). Those everyday glosses go.

FILES (public)
- Glossary: https://raw.githubusercontent.com/sw4127/standard-of-taste/main/docs/glossary-zh.md
- Chinese blueprint: https://raw.githubusercontent.com/sw4127/standard-of-taste/main/docs/blueprint.zh.md
- The site's Chinese text, one dictionary per page or section. Each entry reads "English": "中文", and
  you revise only the Chinese side. Some files also build sentences inside functions or named
  exports: revise every Chinese string you find, wherever it sits, and say where it was. Base URL:
  https://raw.githubusercontent.com/sw4127/standard-of-taste/main/src/content/zh/copy/
  Files: across.ts bias-lines.ts bias.ts chrome.ts company.ts delicacy-lines.ts delicacy.ts expert.ts
  lab.ts landing.ts learn.ts library.ts method.ts reading-lines.ts reading-sound.ts reading.ts
  spread-lines.ts spread.ts statements.ts threshold-lines.ts threshold.ts
- The two on-surface statements, under "D1 on-surface statements in Chinese" in
  https://raw.githubusercontent.com/sw4127/standard-of-taste/main/CLAUDE.md
  Both open with 谈的是，, a comma after an X的是 opener, which my rules forbid.

ALL THE RULES OF THE PRD CHECK ALSO APPLY HERE: 不是 banned in every form, no 而是 / 而非 / 反而 /
恰恰, no dashes, ellipses or exclamation marks, 「」 only, full-width punctuation and brackets, the
banned-word lists, no comma after an X的是 opener, no English clause order.

DO NOT CHANGE: the English keys, anything in {braces} (they are slots the code fills), IDs, the
markers and the <!-- EN-SOURCE --> line in the blueprint, and the meaning of any sentence.

RETURN
1. A table for the glossary: each term, its English, and "gloss at first use: yes (technical) / no
   (everyday)". Mark 口味 as replaced by 品味.
2. docs/blueprint.zh.md in full, revised, in one code block.
3. For the dictionaries: only the entries you changed, as a table per file: English key, old Chinese,
   new Chinese.
4. The two revised on-surface statements.
5. Anything you could not decide, as questions for me.
```
