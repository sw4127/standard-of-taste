# 术语表 · Chinese glossary (owner-approved 2026-09-29)

**Status.** The terms in the first table were approved by the owner on 2026-09-29, and the site name
was confirmed the same day: main title **鉴衡**, subtitle **论品味的标准**. They are copied here
verbatim from Cowork's draft guide, which
stays private.

**This file is the one text.** `src/content/zh/glossary.ts` holds the same terms as data for the
guard, and `src/content/zh-style.test.ts` fails the build if a term there is missing from the table
below, or if its Chinese differs. Serves BP-GOAL and BA-12; the guard is N3's.

**Rule of use (revised 2026-10-01, owner ruling of 2026-09-30).** Only specialised technical terms keep
their English. On each page or document, the first occurrence of such a term in the body is written
中文（English）, with full-width brackets; later occurrences are Chinese only. Everyday words, including
the product's own plain names (解读, 提示词, 播放记录, 规律, 依据), take no English at all. The third
column says which is which. Product and company names, fictional artists and tracks, units and
statement IDs (BP-…, BA-…, RT-…) stay in English.

## 术语 · Terms

| English | 中文 | 首次出现加注英文 |
|---|---|---|
| Standard of Taste (site name) | Main title **鉴衡**, subtitle **论品味的标准（Standard of Taste）** (owner, 2026-09-29). The header shows the main title with the subtitle beneath it; page titles read 「鉴衡 · 论品味的标准」 | yes (the project's English name) |
| Hume, *Of the Standard of Taste* (1757) | 休谟《论品味的标准》（Of the Standard of Taste） | yes (title of the work cited) |
| taste, in every sense: preference (the reading) and discernment (the hearing tests) | 品味, e.g. 近来的品味、说清自己的品味. Never 口味, never 趣味 (owner, 2026-09-30) | no (everyday) |
| delicacy of taste (the faculty) | 鉴赏力（delicacy of taste） | yes (Hume's term) |
| the reading | 解读 | no (everyday) |
| illustrative listener | 示例听者 | no (everyday) |
| plays | 播放记录；一次播放 | no (everyday) |
| pattern (in listening) | 规律 | no (everyday) |
| receipt (the plays behind a line) | 依据 | no (everyday) |
| offer / offer, do not assert | 提示／只提示，不断言 | no (everyday) |
| keep a line / reject a line | 保留／删去 | no (everyday) |
| prompt | 提示词 | no (everyday) |
| creation screen (mock) | 创作界面 | no (everyday) |
| hearing tests | 听辨测试 | no (everyday) |
| Prestige Test | 名气偏差测试（Prestige Test） | yes (instrument name) |
| Delicacy Trials | 细辨测试（Delicacy Trials） | yes (instrument name) |
| Threshold Test | 阈值测试（Threshold Test） | yes (instrument name) |
| Ranking Test | 排序测试（Ranking Test） | yes (instrument name) |
| threshold · cents | 阈值（threshold）· 音分（cents） | yes (technical) |
| tuning · timing · fidelity | 音准（tuning）· 节拍（timing）· 保真度（fidelity） | yes (the three measured families) |
| freedom from prejudice · good sense (Hume's criteria; added 2026-09-30) | 不受偏见左右（freedom from prejudice）· 良好的判断力（good sense） | yes (Hume's terms) |
| arc (the comparison across sittings; added 2026-09-30) | 训练线 | no |
| pitch drift · timing smear · compression damage (the three flaw families; added 2026-09-29) | 音高漂移 · 节拍模糊 · 压缩损伤 | no |
| Company view | 公司视角 | no (page name) |
| business case | 商业论证（business case） | yes (PM term) |
| metric tree · north star · guardrail | 指标体系（metric tree）· 北极星指标（north star）· 护栏指标（guardrail） | yes (PM terms) |
| kill criteria · planning assumption | 终止条件（kill criteria）· 规划假设（planning assumption） | yes (PM terms) |
| A/B test · per arm · baseline · minimum detectable effect | A/B 测试 · 每组 · 基线（baseline）· 最小可检测效应（MDE） | baseline and MDE yes; A/B 测试 and 每组 no |
| insight · demand · unmet demand | 产品洞察（insight）· 需求 · 未满足的需求（unmet demand） | insight and unmet demand yes (blueprint fields); demand no (everyday) |
| challenged assumption | 被挑战的常识（challenged assumption） | yes (blueprint field) |
| EVIDENCED · ASSUMED · INFERENCE | 有依据（EVIDENCED）· 假设（ASSUMED）· 推论（INFERENCE） | yes for 有依据 and 推论; 假设 no |
| SIMULATED · MEASURED · REAL · ILLUSTRATIVE | 模拟（SIMULATED）· 实测（MEASURED）· 真实（REAL）· 示意（ILLUSTRATIVE） | yes for 实测; the others where a label renders |
| ruling · constitution | 裁定（ruling）· 项目章程（constitution，即 CLAUDE.md） | 裁定 no; 项目章程 yes |
| refusal · reversal (on /method) | 否决（refusal）· 改判（reversal） | no |
| falsified-hypothesis registry | 证伪记录（falsified registry） | no (page name) |
| carve-out | 红线条款（carve-out） | yes (policy term) |
| Barnum effect | 巴纳姆效应（Barnum effect） | yes (technical) |
| parameter recovery · item response theory | 参数复原（parameter recovery）· 项目反应理论（IRT） | yes (technical) |
| The Lab · The Method · The Library | 实验室（The Lab）· 方法（The Method）· 资料室（The Library） | no (page names) |

**Why taste has one rendering (owner, 2026-09-30).** The draft glossary split taste in two: 口味 for
preference, used by the reading, and 品味 for Hume's discernment, used by the hearing tests. The owner
ruled that musical taste is 品味 in both senses. The line between the reading and the hearing tests
is carried by what each surface does (BA-6: the reading reads, the hearing tests measure), not by two
words for taste. 口味 and 趣味 are refused everywhere.

## How the guard applies it (engineering, 2026-09-29)

This section is engineering's and is not part of the approved text. It records two choices the table
cannot express, so a reader can check them against the guard.

- **Some terms are also everyday words**, and requiring the English at their first appearance would
  put brackets after ordinary verbs. The guard does not demand the bilingual form for these, and
  still refuses every alternative rendering of them: every term marked no in the third column. Since
  2026-10-01 that includes the product's plain names (解读, 提示词, 播放记录, 规律, 依据 and the rest). The status labels among them are
  checked where labels render, in the documents' own tests.
- **The header and navigation are exempt from the first-use rule.** They repeat on every page, and
  实验室（The Lab） in a navigation bar is clutter. The rule reads the page body.
- **Refused alternates** (a rendering the glossary did not choose, refused everywhere) are listed per
  term in `src/content/zh/glossary.ts`, each with the error it guards against, for example 美分 for
  cents and 收据 for receipt.
