/**
 * 实验室 · The Lab in Chinese (bilingual Part 2; D6, N3, BA-12).
 *
 * Keys are the exact English the Lab index renders: `src/app/lab/page.tsx`, the
 * metric dictionary (`src/content/lab/metrics.ts` and its registry), the panel
 * list (`panels.ts`) and the funnel specification with its event descriptions
 * (`funnel-spec.ts`). Mathematics stays as written; the prose inside a formula
 * is translated. Nothing here is a rate, as in the English.
 * DRAFT: not yet through the owner's writing pass.
 */
import type { Dict } from "@/lib/i18n";

const LAB: Dict = {
  // Metadata and the shell.
  "The Lab — Standard of Taste": "实验室 · 鉴衡",
  "The measurement layer, in the open: every metric defined with its formula, owner, acceptance band, and caveat — plus the provenance of every number shown.":
    "公开的测量层：每一项指标都附上公式、负责方、验收区间和注意事项，并注明每一个数字的来源。",
  "Every metric this product computes, defined in the open — formula, owner, target, caveat.":
    "这个产品计算的每一项指标，公开定义：公式、负责方、目标、注意事项。",
  Methodology: "方法论",

  // The page.
  "THE LAB": "实验室",
  "The measurement layer, with the lid off.": "测量层，揭开盖子给你看。",
  "Most products show you a score and hide the machine. This page is the machine. Every number the gym computes is defined here — the formula, who owns it, what good would look like, and the caveat that has to travel with it. Where a number has no defensible target yet, it says so instead of inventing one.":
    "大多数产品给你看一个分数，把机器藏起来。这一页就是那台机器。各项听辨测试计算的每一个数字都在这里定义：公式、由谁负责、好的结果是什么样、必须随它一起出现的注意事项。一个数字若还没有站得住的目标，这里就照直说，不去编一个。",
  "Every panel that shows data carries one of these badges. Right now the instrument has never been fielded, so {strong} and nothing here is a percentile. Numbers generated from a known model to validate the pipeline are labelled {sim} wherever they appear. When real responses arrive they flow through the identical pipeline — the only thing that changes is the badge. Figures taken off the audio files themselves, which involve nobody, are labelled {meas}.":
    "每一个展示数据的面板都带着其中一个标记。目前这些测试从未投入使用，所以{strong}，这里也没有任何百分位。为验证处理流程、由已知模型生成的数字，出现在哪里都标为{sim}。真实作答到来时，会走完全相同的流程，唯一变的是标记。直接从音频文件本身测得、不涉及任何人的数字，标为{meas}。",
  "no real cohort exists": "还不存在真实的样本人群",
  Panels: "面板",
  "Metric dictionary": "指标词典",
  "{metrics} METRICS · {owners} OWNERS": "{metrics} 项指标 · {owners} 个负责方",
  "Metric index": "指标索引",
  "▸ HAS AN ACCEPTANCE TARGET · — NO DEFENSIBLE TARGET YET": "▸ 有验收目标 · ○ 尚无站得住的目标",
  Target: "目标",
  "none defensible yet": "尚无站得住的目标",
  Unit: "单位",
  "Computed in": "计算位置",
  "Not built yet": "还没建成",
  "Listed rather than mocked up. An empty panel is not a panel — and a date is not a reason, so each of these says what is actually in the way.":
    "只列出来，不做假样子。空面板算不上面板，日期也算不上理由，所以每一项都说明了真正挡在路上的是什么。",
  "The funnel, specified": "漏斗，按规格写出",
  "The panel above is not built, so here is what it would be. Every step names the event it would be counted from, and each description is the one the code's own event registry carries — not a second copy written here, which would be free to drift from what actually fires.":
    "上面的面板没有建成，所以这里写出它建成后的样子。每一步都注明据以计数的事件，每一条描述都译自代码自身的事件登记表，并非另写的一份副本；登记表里的英文一改，测试就会把对不上的译文拦下，所以这里不会悄悄偏离实际触发的事件。",
  "WHAT IT WOULD TAKE": "需要什么条件",
  "A step's rate cannot be published until it can be estimated. At the worst case for a proportion — a rate near half, where the uncertainty is largest — one step needs {strong} before its rate is known to within five percentage points, and {ten} to within ten. Those are requirements per step, not for the funnel: the last step is the expensive one.":
    "一个步骤的比率，在能被估计之前不能发布。按比例最坏的情况算，即比率接近一半、不确定性最大时，一个步骤需要 {strong}，才能把它的比率确定在五个百分点以内；要确定在十个百分点以内，需要 {ten} 次。这些是每一步的要求，并非整个漏斗的要求：最后一步最贵。",
  "{n} sessions reaching it": "{n} 次到达这一步的测试",
  "How many arrivals it takes to put {n} people at the bottom depends on the pass-through between steps, which has never been measured here — so this page does not estimate it. {noReal}":
    "要让 {n} 个人走到底需要多少访客，取决于步骤之间的通过率，而这里从未测量过它，所以本页不作估计。{noReal}",
  "No panel on this page carries a REAL badge.": "本页没有任何面板带着真实标记。",
  "THE ESTIMATOR, DEMONSTRATED": "估计量，演示一遍",
  "The panel is absent because there is no traffic. The ANALYSIS is not absent, and this shows it working. {arrivals} synthetic arrivals were pushed through the steps below {reps} times, each step keeping people at a rate {strong}. The estimator then read those rates back off the counts, knowing nothing about how they were made.":
    "面板空缺，是因为没有流量。分析并没有空缺，下面演示它怎样运作。{arrivals} 个合成访客依次经过下面各个步骤，共重复 {reps} 次，每一步按{strong}的比率留下访客。随后，估计量在完全不知道这些比率如何产生的情况下，从计数里把它们读了回来。",
  "chosen in advance": "事先选定",
  "The pass-through rates in the first column are inventions. They are not this product's rates, they are not anybody's rates, and nothing here should be read as an estimate of what real visitors would do. They are the answer key: the point is whether the estimator finds them.":
    "第一列的通过率是编出来的。它们并非这个产品的比率，也并非任何人的比率，这里的任何东西都不应被读成对真实访客行为的估计。它们是答案：关键在于估计量能不能找到它们。",
  Step: "步骤",
  "True rate": "设定比率",
  Recovered: "复原值",
  Error: "误差",
  "95% interval covered it": "95% 区间覆盖率",
  "{n} pts": "{n} 个百分点",
  "What the last column is for.": "最后一列是做什么的。",
  "{lead} A rate without an interval is decoration, and an interval that does not contain the truth as often as it claims is worse than none. A 95% interval should contain the answer key about 95 times in 100, and that column is the measurement of whether it does.":
    "{lead}没有区间的比率只是装饰；一个区间若不像它声称的那样经常包含真值，还不如没有。一个 95% 区间应该在大约 100 次里有 95 次包含答案，最后一列测的就是它有没有做到。",
  "Read it down the column, not across.": "这一列要从上往下读，不要横着读。",
  "{lead} Coverage sits on 95 at the top and slips a point or two at the bottom, and that is the most useful thing on this page. Each step's denominator is the step above it, so a run that starts with {arrivals} arrivals has a few hundred left by the debrief — and an interval built on a few hundred is doing worse than one built on thousands, exactly where a funnel is most often quoted. That is the arithmetic reason this panel is not built, shown rather than asserted.":
    "{lead}覆盖率在顶部停在 95，到底部掉了一两个点，这是本页最有用的一条信息。每一步的分母是它上面那一步，所以一次从 {arrivals} 个访客开始的运行，到结果说明页时只剩几百人；建立在几百人上的区间，比建立在几千人上的差，偏偏这里是漏斗最常被引用的地方。这就是这个面板没有建成的算术理由，摆出来给你看，并非只是声称。",
  "The same code is what would run the day traffic arrives; it is exercised on the real event names above. Everything it cannot do without respondents — say what any of these rates IS — it still cannot do, and this page will go on saying so.":
    "等流量到来的那天，跑的就是同一份代码；它已经在上面代码实际使用的事件名上运行过。没有作答者就做不到的事，也就是说出这些比率到底是多少，它现在仍然做不到，本页也会一直这样说明。",

  // Owners.
  Instrument: "测试",
  Psychometrics: "心理测量",
  Ops: "运营",
  "What a single session measures about one person.": "一次测试对一个人测到了什么。",
  "Whether the instrument and the estimator can be trusted at all.": "测试和估计量到底能不能信。",
  "Whether enough people have been through it to say anything.": "做过的人够不够多，能不能说明任何事。",

  // Units.
  percent: "百分比",
  proportion: "比例",
  points: "分",
  count: "计数",
  correlation: "相关系数",
  physical: "物理单位",

  // The metric dictionary.
  "Sway (drift-corrected)": "摇摆度（已校正漂移）",
  "How far ratings moved toward the shown label between the blind and labeled passes, as a share of the rating scale. Positive = swayed by the label; negative = resisted it.":
    "从盲听一轮到带标签一轮，评分朝所示标签移动了多远，以占评分量表的比例表示。正值表示被标签带动；负值表示抵住了它。",
  "pct = round((adjusted mean shift / scale span) · 100), adjusted = raw − d̄·(nUp−nDown)/n":
    "pct = round（（校正后的平均偏移 / 量表跨度）· 100），其中校正值 adjusted = raw − d̄·(nUp−nDown)/n",
  "Not a percentile. Understates the true effect: re-rating anchors people on their first answer, and the scale ceiling truncates upward movement.":
    "并非百分位。它低估了实际效应：重新打分会让人锚定在第一次的答案上，量表的上限也会截掉向上的移动。",
  "Sway (uncorrected)": "摇摆度（未校正）",
  "The same shift before the control-drift correction is applied. Shown beside the corrected figure so the correction is never invisible.":
    "同一个偏移，在施加对照组漂移校正之前的值。与校正后的数字并列展示，让校正始终看得见。",
  "rawPct = round((mean shift toward label / scale span) · 100)": "rawPct = round（（朝标签的平均偏移 / 量表跨度）· 100）",
  "Control drift": "对照组漂移",
  "How much a respondent's ratings move on the second pass for clips that carry NO label — the baseline for memory, familiarity, and regression.":
    "作答者对不带任何标签的录音，在第二轮里评分移动了多少；这是记忆、熟悉度和回归效应的基线（baseline）。",
  "d̄ = mean(second pass − first pass) over control items": "d̄ = 对照录音上（第二轮 − 第一轮）的均值",
  "Biased toward zero by the scale ceiling: control ratings sitting at the maximum can only fall, so the correction it feeds is systematically too small.":
    "受量表上限影响而偏向零：处在最高分的对照评分只能往下走，所以它提供的校正系统性地偏小。",
  "Sway share": "摇摆比例",
  "Of the clips that had room to move toward their label, the share that actually did. The one sway statistic the scale-edge artifact cannot touch.":
    "在有余地朝标签移动的录音里，真正移动了的比例。这是量表边缘效应唯一碰不到的摇摆统计量。",
  "share = (items moved toward label) / (items with headroom > 0)": "share =（朝标签移动的录音数）/（余地大于 0 的录音数）",
  "Degrees used": "用到的分档数",
  "How many distinct points of the rating scale a listener actually landed on during the blind pass — Hume's comparison criterion, which holds that degrees of praise can only be assigned by someone who has weighed works against each other.":
    "听者在盲听一轮中实际用到了评分量表上多少个不同的分值；这对应休谟的比较标准：只有把作品相互掂量过的人，才能给出不同程度的称赞。",
  "degreesUsed = |{ blind rating : every clip rated, controls included }|": "degreesUsed = |{ 盲听评分：所有录音，含对照组 }|",
  "Bounded by the number of clips as well as by the scale, and a narrow spread may simply be the correct answer if the clips really are close in quality. The instrument cannot tell those two cases apart. Read it against the indifferent-rater figure, never against the ceiling.":
    "它既受量表限制，也受录音数量限制；如果录音的质量确实接近，窄的分布可能就是正确答案。测试分不清这两种情况。要拿它和随意打分会得出的数字对照着读，永远不要拿它和上限比。",
  "Degrees an indifferent rater would use": "随意打分会用到的分档数",
  "How many distinct scale points somebody rating every clip at random would be expected to land on. The reference point for the degrees-used count, because the top of the scale is reachable by accident.":
    "一个随机给每段录音打分的人，预计会用到多少个不同的分值。这是分档数的参照点，因为量表的最高档也可能碰巧达到。",
  "D · (1 − ((D−1)/D)^n) for n clips on a D-point scale": "n 段录音、D 点量表时为 D · (1 − ((D−1)/D)^n)",
  "Arithmetic, not a norm. It is what chance produces, not what anybody scored — there is no cohort and this is not a percentile.":
    "这是算术，并非常模。它是随机产生的结果，并非任何人的得分；没有样本人群，这也并非百分位。",
  "Rating span": "评分跨度",
  "The distance between the highest and lowest blind rating, in points of the rating scale.": "盲听中最高分和最低分之间的距离，以评分量表的分计。",
  "span = max(blind) − min(blind)": "span = max(blind) − min(blind)",
  "Order reversals": "顺序颠倒",
  "Pairs of clips a listener ordered one way blind and the opposite way on the labelled pass, counted only where the shown labels push both clips the same direction and so offer no differential reason to change one's mind.":
    "听者在盲听时排成一种顺序、在带标签一轮排成相反顺序的录音对；只计入所示标签把两段录音推向同一方向的情况，因为那时没有差别性的理由让人改主意。",
  "reversed / asserted, over pairs with equal label direction (or both controls) separated by at least the assertion floor blind":
    "颠倒数 / 确认数，取标签方向相同或两段都是对照组、盲听时相差至少达到确认下限的录音对",
  "Two labels pushing the same way need not push equally hard, so this removes the first-order reason for a reversal rather than every reason. Pairs that became equal stay in the denominator and can never be reversals, which biases the figure toward calling a listener steady. Null when no pair was separated far enough to count.":
    "两个标签朝同一方向推，力度未必相同，所以这只去掉了颠倒的一阶理由，并非全部理由。变成相等的录音对留在分母里，永远算不上颠倒，这让这个数字偏向把听者判为稳定。没有任何一对拉开到足以计数时，结果为空。",
  "Delicacy accuracy": "细辨准确率",
  "Share of trials where the respondent correctly identified which of two clips was the unmodified original.": "作答者正确认出两段录音中哪一段是未经改动的原版的试次比例。",
  "accuracy = (correct side picks) / (trials)": "accuracy =（选对的次数）/（试次数）",
  "above 0.50 chance": "高于随机水平 0.50",
  "Two-alternative forced choice: 50% is a coin flip, not a middling score.": "二选一的迫选：50% 等于掷硬币，并非中等成绩。",
  "Flaw-identification accuracy": "瑕疵辨认准确率",
  "Share of correctly-identified trials where the respondent also named the right degradation family.": "在选对了的试次里，作答者还说对了损伤类别的比例。",
  "accuracy = (correct flaw picks) / (trials where the side pick was correct)": "accuracy =（说对瑕疵的次数）/（选对的试次数）",
  "above 0.33 chance": "高于随机水平 0.33",
  "Scored only on trials where the side pick was right — judging the flaw in the wrong file is unscoreable, not wrong.":
    "只在选对的试次上计分：在选错的文件里判断瑕疵，无从计分，谈不上错。",
  "Your spread across works the critic separated": "你在评论家拉开的作品之间的评分差距",
  "The average distance between your two ratings, across pairs of works a published critic placed at least ten positions apart in his own ranking.":
    "一位评论家在自己公开发表的排名里，把一些作品排得相隔至少 10 位；在这些作品配对上，你的两个评分之间的平均距离。",
  "mean |rating(a) − rating(b)| over pairs with |Δposition| ≥ 10": "取 |Δposition| ≥ 10 的配对：mean |rating(a) − rating(b)|",
  "Read it beside the close-pairs figure and beside the indifferent-rater figure; alone it says nothing. It measures whether your ratings moved, never whether they moved the same way the critic's did — agreement is not scored and cannot be computed from what this instrument stores. Three further limits travel with it: a forty-second excerpt cannot carry a critic's verdict on a work up to forty minutes long, so the clip is longer than this product's others and that is a mitigation rather than a fix; clips the listener says they already knew are removed on their word alone, unverified; and the difference between the two figures is never reported, because four pairs against four drawn from clips that appear in several pairs each, with nobody having sat the instrument twice, leaves no measured wobble against which a difference could be called real.":
    "要和挨得很近的配对的数字、以及随意打分会得出的数字放在一起读；单独看它什么也说明不了。它测的是你的评分有没有拉开，从不看拉开的方向是否和评论家一致：一致与否不计分，也无法从这项测试存下的数据里算出来。还有三条限制随它一起：40 秒的片段承载不了评论家对一部长达 40 分钟作品的评判，所以这里的片段比本产品其他测试的长，这是缓解，并非解决；听者说以前听过的录音，只凭本人的话就被剔除，未经核实；两个数字之间的差距从不报告，因为每边只有 4 对，取自每段都出现在好几对里的录音，而且还没有人做过两次，没有测得的波动可以用来判断一个差距确实存在。",
  "Your spread across works the critic bracketed together": "你在评论家排得挨在一起的作品之间的评分差距",
  "The average distance between your two ratings, across pairs of works the same critic placed within three positions of each other.":
    "在同一位评论家排得相距 3 位以内的作品配对上，你的两个评分之间的平均距离。",
  "mean |rating(a) − rating(b)| over pairs with |Δposition| ≤ 3": "取 |Δposition| ≤ 3 的配对：mean |rating(a) − rating(b)|",
  "The recordings in this pool differ in where their spectrum ends by 10,002 Hz, for reasons no ranking caused — one source is a 128 kbps mp3 that stops at 8,624 Hz. Measured, that difference is larger across these pairs (6,498 Hz mean) than across the separated ones (3,758 Hz), so the confound works against finding a difference rather than for it. It cannot be removed without destroying the recordings; its direction is guarded instead.":
    "这个曲库里的录音，频谱截止的位置相差可达 10,002 Hz，原因与任何排名无关：其中一个来源是 128 kbps 的 mp3，在 8,624 Hz 就截止了。实测下来，这种差别在这些配对上（平均 6,498 Hz）比在拉开的配对上（3,758 Hz）更大，所以这个混淆因素只会让差异更难被发现，不会让它更容易出现。不毁掉录音就去不掉它，于是改为守住它的方向。",
  "What an indifferent rater would produce": "随意打分会得出的数字",
  "The average distance between two ratings chosen at random on this scale. Chance does not know which works a critic separated, so it produces this same figure on both kinds of pair — which is what makes it the reference point for both.":
    "在这个量表上随机选出的两个评分之间的平均距离。随机不知道评论家拉开了哪些作品，所以在两类配对上给出同一个数字，这正是它能作为两者参照点的原因。",
  "(D² − 1) / (3D) for a D-point scale": "D 点量表时为 (D² − 1) / (3D)",
  "Sensitivity threshold": "敏感阈值",
  "The smallest amount of one kind of damage a listener still reliably detects, in that damage's own physical unit — cents of peak detune, milliseconds of drift, or kbps. Fitted from every answer in the session rather than averaged from the levels the staircase happened to visit.":
    "听者仍能可靠察觉的某一类损伤的最小量，用这类损伤自己的物理单位表示：峰值失谐的音分（cents）、漂移的毫秒数，或 kbps。它由这次测试的全部回答拟合得出，并非对阶梯碰巧经过的几个级别取平均。",
  "the magnitude at which the fitted psychometric curve crosses the target detection rate, from all (magnitude, correct) observations in the run — reported in cents, milliseconds or kbps depending on the family":
    "拟合出的心理测量曲线与目标察觉率相交处的量级，用本次运行中全部的量级与对错观测拟合；按类别以音分、毫秒或 kbps 报告",
  "A fact about one person on one sitting, not a statistic describing the instrument, and not comparable across families because the units differ. Most sittings report a BAND rather than a single number, because a point estimate from a noisy measurement is a claim the measurement cannot support. The estimator that averaged reversal levels was retired for printing a 95% interval that covered the truth 49-72% of the time; this one was measured at 94-100%, and 94-98% even when the psychometric model is wrong.":
    "这是关于一个人某一次测试的事实，并非描述测试本身的统计量；由于单位不同，不同类别之间也不可比较。大多数测试报告的是一个区间，并非单个数字，因为从有噪声的测量得出的点估计，是这个测量撑不起的论断。原先对阶梯转折点所在级别取平均的估计量已经撤下，因为它给出的 95% 区间只有 49% 到 72% 的时候覆盖真值；现在这个测得的覆盖率是 94% 到 100%，即使心理测量模型设错了，也有 94% 到 98%。",
  "Brier score": "布里尔分数（Brier score）",
  "Mean squared error between claimed confidence and what actually happened. Lower is better; it rewards knowing how right you are.":
    "自报把握与实际结果之间的均方误差。越低越好；它奖励的是知道自己有多对。",
  "brier = mean((claimed probability − outcome)²)": "brier = mean（（自报概率 − 结果）²）",
  "below 0.25 (the always-guess-50% anchor)": "低于 0.25（一直猜 50% 的基准）",
  "Misleads alone: a perfectly accurate respondent who always claims 50% scores the same 0.25 as someone guessing. Always pair it with the confidence gap.":
    "单独看会误导：一个完全准确、却总说 50% 的作答者，得分和瞎猜的人一样，都是 0.25。一定要和把握差距一起看。",
  "Confidence gap": "把握差距",
  "Mean claimed confidence minus actual accuracy. Positive = claiming more than delivered.": "平均自报把握减去实际准确率。正值表示说得比做到的多。",
  "gap = mean(confidence) − accuracy, both in percentage points": "gap = mean(confidence) − accuracy，两者都以百分点计",
  "within ±10 points": "在 ±10 个百分点以内",
  "The ±10 threshold is provisional judgment, not data. At session length the gap's standard error can exceed the threshold itself.":
    "±10 这个界限是暂定的判断，并非数据。以一次测试的长度，差距的标准误可能超过这个界限本身。",
  "Item difficulty (p)": "题目难度（p）",
  "Proportion of respondents who answered the item correctly. Higher means EASIER — the field's unfortunate convention, kept because the acceptance band is written in it.":
    "答对这道题的作答者比例。数值越高表示越容易，这是这个领域一个不太理想的惯例，保留它是因为验收区间就是按它写的。",
  "p = (number correct) / (number who answered)": "p =（答对人数）/（作答人数）",
  "0.55 – 0.85": "0.55 至 0.85",
  "Population-dependent: the same item is 'easier' in an abler cohort. Not an intrinsic property of the item.":
    "取决于人群：同一道题在能力更强的人群里更容易。它并非题目本身固有的属性。",
  "Item discrimination (corrected r-pbis)": "题目区分度（校正后的 r-pbis）",
  "How well an item separates strong respondents from weak ones — the correlation between getting this item right and scoring well on everything else.":
    "一道题把强的作答者和弱的作答者分开的程度，即答对这道题与在其余所有题上得分高之间的相关。",
  "r = corr(item score, total score EXCLUDING this item)": "r = corr（本题得分，去掉本题后的总分）",
  "≥ 0.2": "≥ 0.2",
  "Undefined (not zero) when everyone answers alike. Attenuated at extreme difficulty, which caps how well it can track true discrimination.":
    "所有人答得一样时，它没有定义（并非零）。难度极端时它会被削弱，这限制了它追踪区分度真值的能力。",
  "Reliability (Cronbach's α / KR-20)": "信度（Cronbach's α / KR-20）",
  "How consistently the trials measure the same underlying ability. Low α means an individual score is mostly noise.":
    "各个试次测量同一种潜在能力的一致程度。α 低，意味着个人得分大多是噪声。",
  "α = k/(k−1) · (1 − Σp·q / Var(total))": "α = k/(k−1) · (1 − Σp·q / Var(total))",
  "≥ 0.70 (conventional floor)": "≥ 0.70（惯例下限）",
  "The live 18-trial delicacy pool measures α ≈ 0.49 under simulation — below the 0.70 floor. Spearman-Brown puts that floor near 44 trials; two-alternative trials throw away information that no scoring cleverness recovers.":
    "上线的 18 个试次的细辨题库，在模拟中测得 α ≈ 0.49，低于 0.70 的下限。按 Spearman-Brown 公式，要达到这个下限约需 44 个试次；二选一的试次丢掉的信息，再巧妙的计分也补不回来。",
  "Split-half reliability": "分半信度",
  "Reliability estimated by correlating two halves of the test and correcting for the halving.": "把测试分成两半、求两半之间的相关并校正折半效应得到的信度。",
  "r_sb = 2r / (1 + r), halves split odd/even": "按奇偶分半：r_sb = 2r / (1 + r)",
  "Odd/even is ONE arbitrary split; a different split gives a different number.": "奇偶只是一种随意的分法；换一种分法就会得到另一个数字。",
  "Item-difficulty recovery error": "题目难度复原误差",
  "Root mean squared error between estimated item difficulty and the known difficulty that generated the data. The headline evidence that the estimator works.":
    "估计出的题目难度与生成数据时所用的已知难度之间的均方根误差。这是估计量可用的首要证据。",
  "rmse = √mean((estimated p − true p)²)": "rmse = √mean（（估计的 p − 设定的 p）²）",
  "shrinks toward 0 as sample size grows": "随样本量增大而缩向 0",
  "Computable only against simulated data, where the truth is known by construction.": "只能对照模拟数据计算，因为只有在那里，真值是按构造已知的。",
  "Ability recovery correlation": "能力复原相关",
  "Correlation between a respondent's score and their true underlying ability. Capped by reliability — it cannot reach 1 on a test of finite length.":
    "作答者的得分与其潜在能力真值之间的相关。它受信度限制：在长度有限的测试上，它到不了 1。",
  "r = corr(proportion correct, true θ)": "r = corr（答对比例，设定的 θ）",
  "approaches √reliability": "趋近 √信度",
  "Improves with TEST LENGTH, not with sample size.": "它随测试长度提高，并非随样本量提高。",
  "Sway attenuation bias": "摇摆度衰减偏差",
  "How far the cohort's mean measured sway sits below the true mean susceptibility. Systematic, not noise — recruiting more respondents does not reduce it.":
    "人群测得的平均摇摆度比平均易受影响程度的真值低多少。这是系统性的，并非噪声：招募更多作答者也减不掉它。",
  "bias = mean(estimated sway) − mean(true β), averaged over replications": "bias = mean（估计的摇摆度）− mean（设定的 β），对各次重复取平均",
  "0 (currently ≈ −0.065)": "0（目前约为 −0.065）",
  "Magnitude depends on assumed model parameters and must not be quoted as a measured property of real listeners.":
    "它的大小取决于假定的模型参数，不得当作真实听者的实测属性来引用。",
  "Completed sessions": "完成的测试次数",
  "Sessions that reached the result screen. The denominator under every cohort statistic.": "到达结果页的测试次数。每一个人群统计量底下的分母。",
  "count(bias_result events), excluding ?ref=dev traffic": "count（bias_result 事件），不含 ?ref=dev 的流量",
  "≥ 300 for defensible provisional norms; ≥ 100 for meaningful charts": "要有站得住的暂定常模需 ≥ 300；要有意义的图表需 ≥ 100",
  "Currently 0 — the instrument has never been fielded.": "目前为 0：这些测试从未投入使用。",

  // The panels.
  "Every number this product computes, with its formula, owner, acceptance band, and the caveat that travels with it.":
    "这个产品计算的每一个数字，附上公式、负责方、验收区间，以及随它一起出现的注意事项。",
  "Parameter recovery": "参数复原（parameter recovery）",
  "Does the estimator return the parameters that generated the data? Known-vs-estimated, with error against sample size.":
    "估计量能不能还原出生成数据的参数？已知值对照估计值，并给出误差随样本量的变化。",
  "Instrument health": "测试健康状况",
  "Item difficulty and discrimination tables, characteristic curves, reliability, and the auto-flags that follow from them.":
    "题目难度和区分度表、特征曲线、信度，以及据此自动给出的警示。",
  "What this instrument cannot do": "这项测试做不到的事",
  "Every limit the clip pipeline measured in the threshold ladders and could not fix — rungs that are not separable, levels whose damage varies by passage, and the bottom of what the rulers can read.":
    "录音处理流程在阈值（threshold）梯级里测到、却修不好的每一项限制：无法区分的梯级、损伤随段落变化的级别，以及测量尺能读到的底线。",
  "Calibration & bias distributions": "校准与偏差分布",
  "Brier scores, over- and under-confidence, and the distribution of prestige sway across respondents.": "布里尔分数、过度与不足的自信，以及名气摇摆度在作答者之间的分布。",
  "A distribution is a fact about a group of people, and no group has been through this yet. Simulating one would draw the model we assumed rather than anything measured — a shape with no information in it, wearing the badge of a finding.":
    "分布是关于一群人的事实，而还没有任何一群人做过这些测试。模拟出一个分布，画的只是我们假定的模型，并非任何测量结果：一个不含任何信息的形状，却挂着研究发现的标记。",
  "Falsified hypotheses": "证伪记录",
  "Everything this project believed, tested, and had to abandon — with the measurement that killed it and where the derivation lives.":
    "这个项目曾经认定、检验过、又不得不放弃的一切，附上否定它的测量，以及推导所在的位置。",
  "Funnel & cohorts": "漏斗与人群",
  "Entry through completion by channel, and what each cohort did after arriving.": "按渠道从进入到完成的过程，以及每个人群到来之后做了什么。",
  "A funnel is a set of ratios, and a ratio needs a denominator. This one has none: nobody has been through the instrument, so every rate it could print would be zero divided by zero. What it would measure, and how much traffic each step would need before its rate could be published at all, is specified below.":
    "漏斗是一组比率，而比率需要分母。这个漏斗没有分母：还没有人做过这些测试，所以它能打印出的每一个比率都是零除以零。它会测什么，以及每一步需要多少流量才能发布比率，都写在下面。",
  "Data model": "数据模型",
  "Everything this product stores about a person, every event it sends away, and the path from one tap to one statistic — with every key, cap and event read from the code that owns it.":
    "这个产品关于一个人存下的一切、它发出去的每一个事件，以及从一次点击到一个统计量的路径；每一个键、上限和事件，都读自掌管它的代码。",

  // The funnel's steps and the events they count (src/content/lab/event-schema.ts).
  Arrives: "到达",
  "Reaches the instrument": "进入测试",
  "Begins rating": "开始打分",
  "Finishes the blind pass": "完成盲听一轮",
  "Finishes the labelled pass": "完成带标签一轮",
  "Gets a verdict": "得到结果",
  "Reads the debrief": "阅读结果说明",
  "Shares it": "分享",
  "the homepage mounts": "首页加载",
  "the Hume frame is shown on /bias": "/bias 上显示休谟的开场说明",
  "the blind pass begins": "盲听一轮开始",
  "the final blind rating is given and the pass ends": "给出盲听的最后一个评分，这一轮结束",
  "the final labelled rating is given; the verdict is computed": "给出带标签的最后一个评分；计算出结果",
  "the verdict is computed — the interim D6 record, carrying the raw ratings": "计算出结果，即 D6 的临时记录，带着原始评分",
  "the mandatory debrief is shown, disclosing the swapped labels": "显示必读的结果说明，披露被调换的标签",
  "the share control is used on the reveal": "在结果揭晓页上使用了分享按钮",
  "Not a denominator. A shared link opens the instrument directly, so someone can reach the next step without ever passing through this one — which means this ratio can exceed one. The descent proper begins below it.":
    "它并非分母。分享的链接会直接打开测试，所以有人可以不经过这一步就到达下一步，这意味着这个比率可能大于 1。真正的逐级下降从它下面开始。",
};

export default LAB;
