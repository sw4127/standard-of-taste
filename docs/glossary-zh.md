# 术语表 · Chinese glossary (owner-approved 2026-09-29)

**Status.** The terms in the first table were approved by the owner on 2026-09-29, and the site name
was confirmed the same day: main title **鉴衡**, subtitle **论品味的标准**. They are copied here
verbatim from Cowork's draft guide, which
stays private.

**This file is the one text.** `src/content/zh/glossary.ts` holds the same terms as data for the
guard, and `src/content/zh-style.test.ts` fails the build if a term there is missing from the table
below, or if its Chinese differs. Serves BP-GOAL and BA-12; the guard is N3's.

**Rule of use.** On each page or document, the first occurrence of a term in the body is written
中文（English）, with full-width brackets; later occurrences are Chinese only. Product and company
names, fictional artists and tracks, units and statement IDs (BP-…, BA-…, RT-…) stay in English.

## 术语 · Terms

| English | 中文（首次出现写作「中文（English）」） |
|---|---|
| Standard of Taste (site name) | Main title **鉴衡**, subtitle **论品味的标准（Standard of Taste）** (owner, 2026-09-29). The header shows the main title with the subtitle beneath it; page titles read 「鉴衡 · 论品味的标准」 |
| Hume, *Of the Standard of Taste* (1757) | 休谟《论品味的标准》（Of the Standard of Taste） |
| taste, meaning **preference**: what someone reaches for (the reading; BP-INSIGHT, BP-CA1, BP-CA2) | 口味（taste）, e.g. 近来的口味、说清自己的口味 |
| taste, meaning **discernment**: Hume's sense (the hearing tests; BP-CA3) | 品味（taste）; the faculty itself is 鉴赏力（delicacy of taste） |
| the reading | 解读（the reading） |
| illustrative listener | 示例听者（illustrative listener） |
| plays | 播放记录（plays）；一次播放 |
| pattern (in listening) | 规律（pattern） |
| receipt (the plays behind a line) | 依据（receipt） |
| offer / offer, do not assert | 提示（offer）／只提示，不断言（offer, do not assert） |
| keep a line / reject a line | 保留／删去（reject） |
| prompt | 提示词（prompt） |
| creation screen (mock) | 创作界面（creation screen，示意） |
| hearing tests | 听辨测试（hearing tests） |
| Prestige Test | 名气偏差测试（Prestige Test） |
| Delicacy Trials | 细辨测试（Delicacy Trials） |
| Threshold Test | 阈值测试（Threshold Test） |
| Ranking Test | 排序测试（Ranking Test） |
| threshold · cents | 阈值（threshold）· 音分（cents） |
| tuning · timing · fidelity | 音准（tuning）· 节拍（timing）· 保真度（fidelity） |
| freedom from prejudice · good sense (Hume's criteria; added 2026-09-30) | 不受偏见左右（freedom from prejudice）· 良好的判断力（good sense） |
| arc (the comparison across sittings; no bracket needed, added 2026-09-30) | 训练线（arc） |
| pitch drift · timing smear · compression damage (the three flaw families; no bracket needed, added 2026-09-29) | 音高漂移（pitch drift）· 节拍模糊（timing smear）· 压缩损伤（compression damage） |
| Company view | 公司视角（Company view） |
| business case | 商业论证（business case） |
| metric tree · north star · guardrail | 指标体系（metric tree）· 北极星指标（north star）· 护栏指标（guardrail） |
| kill criteria · planning assumption | 终止条件（kill criteria）· 规划假设（planning assumption） |
| A/B test · per arm · baseline · minimum detectable effect | A/B 测试 · 每组 · 基线（baseline）· 最小可检测效应（MDE） |
| insight · demand · unmet demand | 产品洞察（insight）· 需求（demand）· 未满足的需求（unmet demand） |
| challenged assumption | 被挑战的常识（challenged assumption） |
| EVIDENCED · ASSUMED · INFERENCE | 有依据（EVIDENCED）· 假设（ASSUMED）· 推论（INFERENCE） |
| SIMULATED · MEASURED · REAL · ILLUSTRATIVE | 模拟（SIMULATED）· 实测（MEASURED）· 真实（REAL）· 示意（ILLUSTRATIVE） |
| ruling · constitution | 裁定（ruling）· 项目章程（constitution，即 CLAUDE.md） |
| refusal · reversal (on /method) | 否决（refusal）· 改判（reversal） |
| falsified-hypothesis registry | 证伪记录（falsified registry） |
| carve-out | 红线条款（carve-out） |
| Barnum effect | 巴纳姆效应（Barnum effect） |
| parameter recovery · item response theory | 参数复原（parameter recovery）· 项目反应理论（IRT） |
| The Lab · The Method · The Library | 实验室（The Lab）· 方法（The Method）· 资料室（The Library） |

**Why taste has two renderings.** English uses one word for two things this product keeps apart.
The reading is about preference: what someone has been reaching for, which Chinese calls 口味. The
hearing tests stand on Hume's sense, discernment that can be trained, which Chinese calls 品味.
One rendering for both would blur the line the product's design depends on (BA-6: the reading
reads, the hearing tests measure).

## How the guard applies it (engineering, 2026-09-29)

This section is engineering's and is not part of the approved text. It records two choices the table
cannot express, so a reader can check them against the guard.

- **Some terms are also everyday words**, and requiring the English at their first appearance would
  put brackets after ordinary verbs. The guard does not demand the bilingual form for these, and
  still refuses every alternative rendering of them: 保留, 删去, 提示 (the phrase 只提示，不断言 is
  checked), 否决, 方法, 假设, 模拟, 真实, 示意, A/B 测试, 每组. The status labels among them are
  checked where labels render, in the documents' own tests.
- **The header and navigation are exempt from the first-use rule.** They repeat on every page, and
  实验室（The Lab） in a navigation bar is clutter. The rule reads the page body.
- **Refused alternates** (a rendering the glossary did not choose, refused everywhere) are listed per
  term in `src/content/zh/glossary.ts`, each with the error it guards against, for example 美分 for
  cents and 收据 for receipt.
