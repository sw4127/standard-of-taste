# Cowork jobs — open, each with its prompt

**The rule (owner, 2026-09-30):** any job assigned to Cowork comes with a copy-paste prompt, and every
session close reminds the owner of every open job here. Cowork cannot see this repository's working
tree, so each prompt stands alone and points at public GitHub URLs. When Cowork returns, the owner
pastes the reply into a Claude Code session, which commits it, runs the guards and fixes whatever a
guard catches. A job leaves this file when its result is committed.

---

## Job 1 · Check the Chinese PRD, line by line — DONE 2026-09-30 (`2e5e701`)

Cowork's checked parts are committed unchanged. Kept here because Job 2's prompt uses this one's
rule list (C.1 to C.10).

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

**Redrafted 2026-10-01, before it was sent.** The first draft had to be sent in the PRD check's
conversation because it borrowed that check's rules; this one carries them and works in any
conversation. It is split into four messages because the text is about 300 KB, and a check of the
whole site in one pass would be skimmed. It also names the two statements in force (the file holds a
superseded card statement too), protects the `${...}` slots inside code, and asks Cowork to flag any
sentence that relied on the old 口味 / 品味 split.

**How to send it.** Open a new Cowork conversation. Send message 1 and wait for its full return, then
send message 2, then 3, then 4. Paste each return into a Claude Code session as it arrives, or all four
together at the end.

### Message 1 of 4 · rules, glossary, blueprint, statements, front-door pages

```text
You are revising the Chinese text of my project's website and its Chinese blueprint. This is message
1 of 4. Messages 2 to 4 send more files under the same rules, so keep these rules for the whole
conversation. If you have an earlier brief from me about the Chinese site, this one is newer and wins
where they disagree.

WHAT IT IS
My project "Standard of Taste" (Chinese title 鉴衡, subtitle 论品味的标准) has a Chinese version of its
website. A Chinese recruiter may read it. The English is the original and governs. Claude Code wrote
the Chinese, and it writes Chinese less well than you do.

TWO RULINGS TO APPLY EVERYWHERE
1. Musical taste is 品味. Never 口味, never 趣味. 论品味的标准 stays as it is.
   Today the glossary splits taste in two: 口味 for preference (what someone reaches for, used by the
   reading) and 品味 for discernment (Hume's sense, used by the hearing tests). The ruling makes both
   品味. Where a sentence only made sense because of that split, reword it so the meaning survives, and
   list it under "questions for me".
2. English in brackets only for specialised technical terms, at first use, written 中文（English）, for
   example 音分（cents）, 基线（baseline）, 自适应阶梯法（adaptive staircase）. Today the site glosses
   every glossary term, everyday words included: 解读（the reading）, 提示词（prompt）,
   播放记录（plays）, 规律（pattern）. Remove the everyday glosses. Keep the technical ones where they
   are; do not add new ones. My tests check where each first use falls on each page.

THE RULES (the same ones my Chinese PRD was checked against)
 1. Accuracy: same meaning as the English, nothing added or dropped. Every number, date, ID (UC-1,
    BP-GOAL, BA-3, RT-Z10 a, N3, D1), route (/reading), file path and code name stays exactly as it is.
 2. Natural Chinese for a professional reader. Fix English clause order, long pre-modifiers,
    English-shaped commas and translationese. Put conditions, causes and time before the main clause
    where Chinese would.
 3. No comma between an "X的是" opener and its clause: 要看的是哪些功能, never 要看的是，哪些功能.
    Better still, avoid the opener.
 4. 不是 is banned in every form (并不是, 是不是, 不是……而是). For a negation use 并非, 没有, 无, 未,
    不属于 or 谈不上. Also banned: 而是, 而非, 反而, 恰恰, 与其说……不如说.
 5. No dashes, no ellipses, no exclamation marks.
 6. Quotation marks are 「」 only, and only for a verbatim quote or a button label. Punctuation next to
    Chinese is full-width. Brackets are full-width （）, with no space inside or before them, and never
    directly after `code` (write "`/reading` 上的依据", never "`/reading`（依据）").
 7. Banned words. Empty verbs: 进行 开展 实现 提升 推动 助力 赋能 打造 构建 落地 深耕 聚焦 围绕 致力于
    旨在 对齐. Jargon: 显著 高效 深度 全方位 多维度 无缝 极致 沉浸式 底层逻辑 颗粒度 链路 闭环 抓手.
    Register: 值得注意的是 总而言之 综上所述 让我们 相信, 不仅……而且, 在……的背景下. Loan
    translations: 模式 (商业模式 is fine), 收据 (use 依据), 杀掉.
 8. Renderings the glossary refused: 读解 (also inside 阅读解读), 虚构听者 / 虚拟听众 / 示例听众 (use
    示例听者), 反转 (a staircase reversal is 转折点), 听力测试 (use 听辨测试), 美分 (use 音分),
    声望测试 (use 名气偏差测试), 收听模式 / 听歌模式 (use 规律).
 9. In the blueprint, one line per paragraph. Do not hard-wrap Chinese: a line break inside a paragraph
    shows as a stray space on GitHub.
10. Every page says the English governs. Keep that note; you may improve its wording.

DO NOT CHANGE
- The English side of any dictionary entry. Each entry reads "English": "中文"; revise only the Chinese.
- Slots the code fills: anything in {braces}, and anything in ${...} inside a `template string`.
- Anything outside quotation marks in the .ts files (code, comments, names).
- IDs, the <!-- BLUEPRINT --> markers, the <!-- EN-SOURCE ... --> line, and the status line near the top
  of the blueprint (it waits on my ruling, not on yours).
- The meaning of any sentence.
- Button labels in 「」. My checked Chinese PRD quotes them. If one reads badly, note it; do not change it.
- BP-GOAL in the blueprint. My checked Chinese PRD quotes it word for word, and a test fails if they
  differ. If you think it should change, say so in your notes and leave it.

FILES FOR THIS MESSAGE (public; open each URL)
Glossary: https://raw.githubusercontent.com/sw4127/standard-of-taste/main/docs/glossary-zh.md
Chinese blueprint: https://raw.githubusercontent.com/sw4127/standard-of-taste/main/docs/blueprint.zh.md
English blueprint, to check against: https://raw.githubusercontent.com/sw4127/standard-of-taste/main/docs/blueprint.md
Dictionaries, base URL https://raw.githubusercontent.com/sw4127/standard-of-taste/main/src/content/zh/copy/
then: chrome.ts landing.ts reading.ts reading-lines.ts reading-sound.ts spread.ts spread-lines.ts
across.ts expert.ts learn.ts
Some files build sentences inside functions. Revise every Chinese string you find, wherever it sits,
and say where it was.

THE TWO ON-SURFACE STATEMENTS
They are in force on the Chinese site and say what a page is doing. Both open with 谈的是，, which rule
3 forbids. Revise these two exactly. CLAUDE.md also holds an older card statement that mentions 解读;
it is superseded, so ignore it.
Card: 这张卡片谈的是，这次测出的结果对你可能意味着什么。听辨测试（hearing tests）里的其余内容，只描述你做了什么。
Reading: 这份解读（the reading）谈的是，一位听者近来的播放记录（plays）可能意味着什么。它说出规律（pattern），提示几种读法；哪一种对，或者都不对，由你来说。听辨测试（hearing tests）只描述你做了什么。
The English they translate:
Card: This card speaks to you about what the reading might mean for you. Everything else in the gym describes only what you did. (On the card, "the reading" means this sitting's measured result, not the page called 解读.)
Reading: This reading speaks to you about what a listener's recent plays might mean. It names patterns and offers readings; which one is right, if either, is yours to say. The hearing tests describe only what you did.

RETURN FOR THIS MESSAGE
1. A table for the glossary: each term, its English, and "gloss at first use: yes (technical) / no
   (everyday)". Mark 口味 as replaced by 品味.
2. docs/blueprint.zh.md in full, revised, in one code block.
3. For each dictionary: only the entries you changed, as a table per file: English key (or, for a
   string inside a function, the function name), old Chinese, new Chinese.
4. The two revised statements, each on its own line.
5. Anything you could not decide, as questions for me.
```

### Message 2 of 4 · the hearing tests

```text
Message 2 of 4. Same rules and same DO NOT CHANGE list as message 1. Same base URL:
https://raw.githubusercontent.com/sw4127/standard-of-taste/main/src/content/zh/copy/
Files: threshold.ts threshold-lines.ts bias.ts bias-lines.ts delicacy.ts delicacy-lines.ts company.ts
Use the glossary decisions you made in message 1.

RETURN
1. For each file: only the entries you changed, as a table per file: English key (or function name),
   old Chinese, new Chinese.
2. Anything you could not decide, as questions for me.
```

### Message 3 of 4 · the lab and the method page

```text
Message 3 of 4. Same rules and same DO NOT CHANGE list as message 1. Same base URL:
https://raw.githubusercontent.com/sw4127/standard-of-taste/main/src/content/zh/copy/
Files: lab.ts method.ts
These are the two longest pages after the library. Check every line; do not skim. Use the glossary
decisions you made in message 1.

RETURN
1. For each file: only the entries you changed, as a table per file: English key (or function name),
   old Chinese, new Chinese.
2. Anything you could not decide, as questions for me.
```

### Message 4 of 4 · the library

```text
Message 4 of 4, the last. Same rules and same DO NOT CHANGE list as message 1. Same base URL:
https://raw.githubusercontent.com/sw4127/standard-of-taste/main/src/content/zh/copy/
File: library.ts
It is the longest file. Check every line; do not skim. Use the glossary decisions you made in
message 1.

RETURN
1. Only the entries you changed, as a table: English key (or function name), old Chinese, new Chinese.
2. Anything you could not decide, as questions for me.
3. One line per message (1 to 4): whether every line of it was checked, yes or no, and if no, what
   remains.
```
