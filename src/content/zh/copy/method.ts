/**
 * 方法 · /method in Chinese (bilingual Part 2; BA-12, N2, N3).
 *
 * Keys are the exact English `src/content/method/prose.ts`, `claims.ts` and
 * `src/app/method/page.tsx` render. Each block's cited sources stay as paths:
 * the documents are English, and the page says the English governs. Passages
 * the English quotes from those documents are translated in the running text;
 * a phrase kept in English sits in 「」, because only there is it verbatim.
 * DRAFT: not yet through the owner's writing pass.
 */
import type { Dict } from "@/lib/i18n";

const METHOD: Dict = {
  // Metadata and chrome.
  "The method — Standard of Taste": "方法 · 鉴衡",
  "How this project is run: the rules it refuses work under, what each refusal cost, and the worst finding it has recorded against itself. Every claim cites a document in the repository.":
    "这个项目怎样运作：它拒绝在什么规则下工作，每一次否决付出了什么代价，以及它记下的对自己最不利的发现。每一条陈述都注明代码仓库里的一份文件。",
  "The rules, the refusals, the price each one carried, and the finding this project recorded against itself.":
    "规则、否决、每一次否决的代价，以及这个项目记下的对自己不利的发现。",
  "Terms · Privacy": "条款 · 隐私",
  "Inference — the engineer's reading, not a recorded ruling": "推论（INFERENCE）：工程师的看法，并非记录在案的裁定",
  "Refused under {rule}": "否决的理由：{rule}",
  "What it cost. ": "代价。",
  "{count} refusals": "{count} 项否决",
  "{count} reversals": "{count} 次改判（reversal）",
  "{count} reversal": "{count} 次改判（reversal）",
  "Not a refusal. A constraint this project held, then deliberately relaxed — with what the relaxation bought and what it cost. A page that only ever tightens is a page whose rules were never tested against anything the project wanted.":
    "这里记的并非否决。它们是这个项目曾经坚持、后来有意放宽的约束，附上放宽换来了什么、付出了什么。一个只会收紧的页面，它的规则从来没有和项目想要的东西较量过。",
  "Relaxed: {rule}": "放宽的规则：{rule}",
  "What it bought. ": "换来的。",
  "The worst finding against itself": "对自己最不利的发现",
  "A review process is only worth describing if it catches things. This is the worst thing this one has caught, dated, with the rule it broke — and it is still open.":
    "一套审查流程，只有真能抓到问题才值得描述。这是它抓到的最糟的一件事，注明日期和违反的规则，至今没有收尾。",
  "{date} · broke {rule}": "{date} · 违反 {rule}",
  "Since then. ": "此后。",
  "at work in commit {commit}": "在提交 {commit} 中可见其运作",

  // The opening (prose.ts).
  "THE HOUSE RULES · HOW THIS IS RUN": "规矩 · 这个项目怎么运作",
  "What this project refused, and what each refusal cost.": "这个项目否决了什么，每一次否决付出了什么代价。",
  "Start with the reading; it is the product. This page is for afterwards: how it was built — by one owner and an AI engineer, under a written constitution, two review protocols, and a decision record that has repeatedly deleted finished work for being untrue rather than for being broken.":
    "先看解读（the reading），它就是产品本身。这一页留到之后再看，讲的是它怎样建成：建它的是一位项目负责人和一位 AI 工程师，按照一部成文的项目章程（constitution，即 CLAUDE.md）、两套审查协议和一份决策记录；这份记录多次删掉已经完成的工作，理由是它说的不真，并非它坏了。",
  "Any project can list what it built. This page lists what it refused, because a refusal is the only decision with a verifiable cost attached, and because a page of things that went well is a brochure. Each block below names the document it comes from. Those documents are in the repository, and a test opens every one of them on every run to check the quoted passage is still there — if a source is reworded, this page fails the build instead of quietly becoming false.":
    "任何项目都能列出自己建了什么。这一页列的是它否决了什么，因为在所有决定里，只有拒绝附带可以核查的代价，也因为一页只写顺利之事的纸，只是宣传册。下面每一块都注明了出处文件。这些文件都在代码仓库里，每次运行都有一个测试逐一打开它们，核对引用的段落是否还在；来源一旦改写，测试就会失败，这一页随之发布不了，不会悄悄变成假话。",
  refused: "否决",
  "Standing facts on this page last checked {asOf}. The library argues why the product exists; the Lab holds the measurements behind the hearing tests, including a page listing what the instruments cannot do.":
    "本页的常设事实最后核对于 {asOf}。资料室论证了产品为什么存在；实验室存放听辨测试（hearing tests）背后的测量，其中有一页列出了各项测试做不到的事。",
  "why the product exists": "产品为什么存在",
  "a page listing what the instruments cannot do": "一页列出了各项测试做不到的事",

  // The three sections.
  "For a product manager": "写给产品经理",
  "How a decision gets made, and stays made": "一个决定怎样做出，又怎样不被推翻",
  "The project runs on a written constitution and two review protocols. What is unusual is not that they exist. It is that they constrain the engineer more than the owner, and that they are enforced by tests rather than by good intentions.":
    "项目按照一部成文的章程和两套审查协议运作。它们的存在本身并不稀奇。稀奇的是，它们对工程师的约束多于对负责人的约束，而且靠测试执行，并非靠善意。",
  "For a business analyst": "写给业务分析师",
  "How a written requirement stays true": "一条成文的要求怎样保持为真",
  "Documentation drifting away from the system it describes is the normal condition of software, and it is usually filed under untidiness. Here it is a defect with a failing test attached — because a document describing a gate nobody performs sends the next reader to ask for a sign-off that cannot be given.":
    "文档和它描述的系统渐行渐远，是软件的常态，通常被归为不整洁。在这里，它属于缺陷，附带一个会失败的测试：一份描述着没人再执行的关卡的文档，会让下一位读者去索要一个根本无法给出的签字。",
  "For a data analyst": "写给数据分析师",
  "How a number earns the right to be shown": "一个数字怎样赢得被展示的资格",
  "There are no real respondents yet. That single fact governs every figure on this site, and the interesting part is what it forbids rather than what it permits.":
    "目前还没有真实的作答者。这一个事实支配着本站的每一个数字，值得看的是它禁止了什么，并非它允许了什么。",

  // The claims.
  "The guardrail this project runs on is not a preference for simplicity. It is written down as a cost: complexity is a cost, not a value — and either party may object by citing it.":
    "这个项目遵循的护栏，并非对简单的偏好。它被写成一项成本：复杂是成本，并非价值；任何一方都可以引用这一条提出反对。",
  "The honesty rule is stated as a constraint on output, not an aspiration: no score, percentile, or claim the data can't support.":
    "诚实规则被写成对输出的约束，并非一种期许：不给出数据撑不起的分数、百分位或论断。",
  "Work is reviewed in the smallest increment that can be proved on its own, and the reason is written into the protocol: self-review honesty is inversely proportional to the amount of sunk work under review.":
    "工作按能单独证明的最小增量来审查，理由写进了协议：自我审查的诚实程度，与被审查的沉没工作量成反比。",
  "Every request for a decision goes in one fixed block at the end of a reply, and anything outside it does not count: any ask NOT in this block is deemed not asked.":
    "每一个请求决定的问题，都放在回复末尾一个固定的区块里，区块之外的一概不算：没写进这个区块的请求，视为没有提出。",
  "Both protocols are aimed at the same weakness, and it is not incompetence — it is ownership. A reviewer goes soft on work they built, so the rules shrink what is under review and force the ask into a place it cannot be buried.":
    "两套协议针对的是同一个弱点，这个弱点在于审查的是自己做的东西，与能力无关。审查者对自己建的东西会手软，所以规则缩小每次审查的范围，并把请求逼到一个埋不掉的位置。",
  "The constitution constrains how the engineer must write, not what the owner must know: explain tradeoffs in plain language and teach as you go. Every option put to them has to be legible without the jargon, or the ruling that comes back is a rubber stamp on a sentence nobody understood — so the rule is enforced against the writer, and a decision taken on an unread sentence is the failure it exists to prevent.":
    "项目章程约束的是工程师必须怎样写，并非负责人必须懂什么：用平实的语言解释取舍，边做边讲。交给负责人的每一个选项，不靠术语也要读得懂，否则回来的裁定（ruling）只是给一句没人看懂的话盖章；所以这条规则针对写的人执行，一个基于没读懂的句子做出的决定，正是它要防止的失败。",
  "Each open question carries a default that applies if nobody answers, and the default is constrained rather than chosen: Defaults must be reversible choices, never one-way doors (pricing, data schema, deletions = no default, PM must answer). Silence can therefore only ever produce the undoable option.":
    "每个悬而未决的问题都带一个默认选项，没人回答时就按它执行；默认选项受约束，并非随意挑选：默认必须是可撤销的选择，永远不能是单向门（定价、数据结构、删除一律没有默认，必须由负责人回答）。因此，沉默只可能产生可以撤销的选项。",
  "Two documents once described a quality gate that had been abolished months earlier, as though it were still owed. The rule that came out of it is stated as a matter of truth rather than tidiness: a gate nobody performs any more, written as a thing still to be done, is a false statement in the repository.":
    "曾有两份文档描述一道几个月前就已废除的质量关卡，好像它还欠着没做。由此定下的规则，着眼于真假，并非整洁：一道没人再执行的关卡，被写成还要做的事，就是代码仓库里的一句假话。",
  "The repair was not the two sentences. Fixing the two sentences leaves the class open, so the rule became a test that scans every document on every run, proved in both directions, because a guard that has only ever returned clean is not known to check anything.":
    "修复的对象并非那两句话。只改那两句，同类的问题仍然敞着，所以这条规则变成一个测试，每次运行都扫描每一份文档，并从正反两个方向证明过；一个从来只返回干净结果的守卫，没人知道它到底查了什么。",
  "The same rule now binds the files this site publishes about itself. They described an instrument of eight clips long after it had grown to sixteen, so the quantities are derived from the shipped item pool instead of being retyped: change the pool without changing the sentence and this fails, naming both numbers.":
    "同一条规则现在也约束本站发布的关于自身的文件。这些文件在一项测试早已增加到 16 段录音之后，仍写着 8 段，所以数量改为从上线的题库推算，不再重打：改了题库却没改句子，测试就会失败，并说出两个数字。",
  "Before an estimator is trusted with real answers it is run on simulated ones generated from a known model, and required to recover the known parameters. The claim that buys is deliberately modest: I validated the estimator by parameter recovery before fielding it.":
    "一个估计量在被托付真实作答之前，先用已知模型生成的模拟作答来跑，并且必须复原出已知的参数。由此换来的说法刻意克制：在投入使用之前，我用参数复原（parameter recovery）验证过这个估计量。",
  "Nothing simulated is allowed to pass as observed, anywhere it might be seen: in-app, in charts, in the write-up, in the repo. The badge is not small print. It is the reason the analytics pages are allowed to exist before a single person has taken a test.":
    "任何模拟的数据都不许冒充观测所得，在任何可能被看到的地方都一样：应用里、图表里、报告里、代码仓库里。这个标记并非小字附注。正因为有它，分析页面才得以在还没有一个人做过测试之前就存在。",
  "Where a measurement is noisy the product must show the uncertainty rather than hide it behind a label: report the band, never the point, because a point estimate from a noisy measurement is a claim the measurement cannot support.":
    "测量有噪声时，产品必须把不确定性摆出来，不许藏在一个标签后面：报告区间，永远不报点，因为从有噪声的测量得出的点估计，是这个测量撑不起的论断。",

  // The refusals.
  "A fifth instrument, to turn preference into words": "第五项测试：把口味（taste）变成文字",
  "N3, and the arithmetic the proposal produced about itself": "N3，以及这项提议对自己算出的账",
  "The four instruments here each have a right answer — damage you can or cannot hear, a label's pull, a critic's gaps. None of them touches the thing listeners actually report, which is that they cannot say what they like. Another was specified for exactly that: you say what you prefer, then choose blind between two versions of the same passage differing in one respect, and the product is the moment your words and your ears disagree. It was approved, sized, and killed by the first slice that did its arithmetic. A preference has no right answer, so the only measurable thing is whether blind choices agree with each other — and that takes twenty-eight of them per dimension from a decisive listener. Three dimensions is eighty-four pairs; at sixty seconds a pair, eighty-four minutes — longer than all four shipped instruments together. It had been sized against a figure a quarter that size, which engineering stated without deriving. Run against the numbers in its own specification, two of its four findings did not survive, the contradiction it existed to deliver among them. Nothing further is added to this product on easier terms than these: an instrument arrives with the arithmetic for its own sitting length, or it does not arrive.":
    "这里的四项测试各有一个正确答案：你听不听得出的损伤、一个标签的拉力、一位评论家拉开的差距。它们都碰不到听者真正反映的那件事：他们说不出自己喜欢什么。为此曾专门设计过另一项测试：你先说出自己的偏好，再在同一段音乐的两个版本之间盲选，两个版本只有一处不同；产品就是你的话和你的耳朵出现分歧的那一刻。它获得了批准、估算了规模，然后在第一个真正算账的切片里被否决。偏好没有正确答案，所以唯一能测的，是几次盲选彼此是否一致；对一位果断的听者，每个维度要选二十八次。三个维度就是八十四对；每对六十秒，就是八十四分钟，比已上线的四项测试加起来还长。它原先估算时用的数字只有实际的四分之一，而那个数字是工程方面直接给出的，没有推导。用它自己规格里的数字一跑，它的四项发现有两项没能成立，其中就包括它存在的意义所在的那个矛盾。今后任何东西加进这个产品，条件都不会比这更宽松：一项测试要么带着自己测试时长的算术到来，要么不来。",
  "The largest one on this page, and it is unpaid rather than accepted. Two findings came out of listening to people: that past listening predicts less than present and forming taste, and that almost nobody can describe their own taste in words. This product serves the first and does nothing at all for the second, which is the one with somebody in front of it. The refusal does not say that instrument was a bad idea — it says this design could not be built at a length anyone would sit, and no better design has been found. Somebody else may well find one.":
    "这是本页最大的一笔代价，而且它没有被接受，只是还欠着。倾听人们之后得到了两条发现：过去的收听，预测力不如现在的口味和正在形成的口味；几乎没有人能用文字描述自己的口味。这个产品服务了第一条，对第二条毫无作为，而第二条的面前站着真实的人。这项否决并没有说那项测试是个坏主意，它说的是：这种设计做不到任何人愿意坐完的长度，而更好的设计还没找到。别人也许能找到。",
  "The Taste Gem — a five-faceted picture of your result": "Taste Gem：用五个切面呈现你的结果",
  "the anti-clone clause, and the writing pass that made it unnecessary": "反克隆条款，以及让它变得多余的那次写作校订",
  "A visual was held back until the product's sentences had been through a writer, on the rule that if the sentences landed the picture was decoration. Three batches of them have now been written, applied and shipped, and every result screen ends in prose rather than in a unit. The picture would add no fact the sentences do not already carry. What it would add is five facets, most of them dark for most people — because a reader has usually taken one instrument, not four — and a shape with slots to fill in is a completion meter however carefully it is drawn. This product refuses those by name.":
    "一个视觉设计被搁置，要等产品的句子先经过写作者的手；规则是：句子立得住，图就只是装饰。如今已有三批句子写完、用上、上线，每个结果页都以文字收尾，并非以一个单位收尾。这张图不会带来任何句子里没有的事实。它会带来的是五个切面，其中大多数对大多数人是暗的，因为读者通常只做过一项测试，并非四项；而一个留着空位等人填满的形状，不管画得多用心，都是一个完成度进度条。这个产品点名否决这类东西。",
  "The one thing the product will never have is an image a person can post without reading a word. Every result here has to be read to be understood, which costs the share loop most of its reach and is the second time that trade has been made deliberately: the ranked verdict went the same way. What it buys is that nothing on a result screen can be understood as a score out of five.":
    "这个产品永远不会有的一样东西，是一张人们不读一个字就能发出去的图。这里的每个结果都得读了才懂，这让分享循环失去了大部分传播力，而这已是第二次有意做出这种取舍：分级评语也是这样被撤下的。换来的是：结果页上没有任何东西能被理解成一个满分五分的分数。",
  "The Taste Index — one number standing for a person's taste": "Taste Index：用一个数字代表一个人的品味（taste）",
  "N3, and the ruling on ranked tiers that it would have repeated": "N3，以及它本会重蹈的那次关于分级的裁定",
  "The design that opened this phase ended at a single composite over five sub-scores. The five are a percentage of movement toward a label, a detection band, a threshold in cents, a count of distinguished works and a calibration score — five different units measuring five different things. Adding them requires deciding how much each is worth, and that weighting can only be argued from a population this product does not have: the cohort is zero. A number assembled from an unjustifiable weighting is not a summary of five measurements, it is a sixth claim resting on none of them. There is no Taste Index, and there will not be one.":
    "开启这一阶段的设计，终点是五个子分数之上的一个综合分。这五个分别是：向标签靠拢的百分比、一个识别区间、一个以音分（cents）计的阈值（threshold）、分辨出的作品数，以及一个校准分，五种不同的单位测着五种不同的东西。把它们加起来，就得决定每一项值多少，而这种权重只能靠一个本产品没有的人群来论证：样本量为零。用一个无法论证的权重拼出来的数字，算不上五项测量的汇总；它是第六个论断，哪一项测量都撑不起它。Taste Index 不存在，将来也不会有。",
  "The product gave up the one thing it could have put on a share card and in a headline — a single figure a person could compare, remember and repeat. What ships instead is five readings in their own units, each meaningless outside its own context, on five screens nobody has to visit in order. That is a worse product to market and the only honest one available, and it is the same trade the six ranked tiers lost: a sharper claim given up, rather than kept in the hope nobody checked.":
    "产品放弃了本可以放进分享卡片和标题里的那一样东西：一个人们可以比较、记住、转述的数字。取而代之上线的，是五个各用自身单位的读数，离开各自的语境就毫无意义，分布在五个不必按顺序访问的页面上。这样的产品更难推销，却是唯一诚实的选项；六个分级评语输掉的也是同一种取舍：放弃一个更锋利的说法，不去保留它、指望没人核查。",
  "Six ranked verdict tiers on the Delicacy result": "细辨测试（Delicacy Trials）结果上的六个分级评语",
  "N3, applying RT-90a — report the band, never the point": "N3，执行 RT-90a：报告区间，永远不报点",
  "They shipped first, and then the measurement meant to justify them killed them. Asked how often the six tiers put a person in the right one at the shipping length: 30.5%. No coarser cut rescued it. A tier name is a point estimate wearing an adjective.":
    "它们先上线了，随后本该为它们背书的测量否决了它们。问六个等级在上线时的测试长度下把人放进正确那一级的比例，答案是 30.5%。换成更粗的分法也救不回来。等级名称，就是一个披着形容词的点估计。",
  "The result screen lost the one line a person could repeat to a friend and got an interval instead — wider, duller, and true. Earning a ranked verdict honestly would land on ~42–45 trials = 21 min, which is the session 15 was chosen to avoid. The product kept the shorter session and gave up the sharper claim, rather than keeping both and hoping nobody checked.":
    "结果页失去了人们能讲给朋友听的那一句话，换来一个区间：更宽，更平淡，但真实。要诚实地挣到一个分级评语，需要大约 42 到 45 个试次，也就是 21 分钟，而选定 15 个试次，正是为了避开这样长的测试。产品保留了较短的测试，放弃了更锋利的说法，没有两者都留下、再指望没人核查。",
  "The paid training arc — the entire business model": "付费训练线：整个商业模式",
  "the D4 amendment": "D4 修正案",
  "The plan was to give the assessment away and charge for the training arc. It was withdrawn in one line — there is no paid tier, and no pricing question — because a paywall on the training loop would have put the honest deliverable, whether your ear actually moved, behind the wall.":
    "原计划是免费提供评估，对训练线收费。这个计划用一句话撤回了：没有付费层级，也没有定价问题；因为在训练循环上设付费墙，会把诚实的交付物，也就是你的耳朵到底有没有进步，关在墙后面。",
  "The project gave up its only means of showing that anyone would pay for this, at a point where monetization remains a goal but as proof of commercial viability, not income. It also created upkeep nobody budgeted for: six weeks after the ruling, three published sentences still promised the tier — on two reading-room pages and in the file the product serves to AI crawlers. Writing a rule down does not enforce it.":
    "项目放弃了唯一能证明有人愿意为此付费的手段，而当时的定位是：变现仍是目标，但作为商业可行性的证明，并非收入。它还带来了没人列进预算的维护工作：裁定六周之后，仍有三句已发布的话在承诺那个层级，两句在资料室（The Library）的页面上，一句在产品提供给 AI 爬虫的文件里。把规则写下来，并不等于执行了它。",
  "The $3.99 consumer product, and the funnel built to feed it": "3.99 美元的消费级产品，以及为它搭建的漏斗",
  "memo C1 — a conclusion of record rather than a rule": "备忘录 C1：一项记录在案的结论，并非规则",
  "Viral consumer distribution for a $3.99 impulse product is dead, concluded on twenty-nine visitors across a month, with the World Cup front door spreading to nobody at all.":
    "为一款 3.99 美元的冲动消费产品做病毒式分发，这条路走不通了；这是根据一个月里 29 位访客得出的结论，世界杯那扇前门一个人都没传播出去。",
  "A quiz, a share-card pipeline, a paywall and a Merchant-of-Record payment adapter all became legacy in a single decision. And here is the part that is easiest to leave off a page like this: the paid product itself was never tested (4 paywall views). The verdict was reached on distribution evidence, and the pricing question it looks like it answers was never actually asked.":
    "一个测验、一条分享卡片流水线、一道付费墙和一个记账商户（Merchant-of-Record）支付适配器，在一个决定里全部成了遗留物。还有一点，最容易从这样的页面上漏掉：付费产品本身从未被测试过（付费墙只被看过 4 次）。这个结论靠的是分发方面的证据，它看起来回答了的定价问题，其实从来没有被真正问过。",
  "The human ear-check on every audio clip": "对每段音频的人工试听",
  "a gate only one person can discharge is debt; artifact pivot §1": "只有一个人能放行的关卡就是债务；成果转向文件第 1 节",
  "Quality control was a person listening to each clip and approving it. It was abolished — The PM never judges a clip again — on the owner's own finding: Ear-passes by a non-musician = unstable labels = no value. The gate was not adding quality. It was adding a delay only one person could clear.":
    "质量控制原本是由一个人逐段试听并批准。这道关卡被废除了，产品经理从此不再评判任何一段录音；根据是负责人自己的发现：由非音乐人做的试听放行，得到的标签不稳定，也就没有价值。这道关卡并没有增加质量。它增加的是一段只有一个人能清除的延迟。",
  "The replacement has two layers, and the one the pivot itself calls the real gate — item difficulty and discrimination estimated from response data — has never run, because there are Zero real responses. What gates clips today is the acoustic layer alone: loudness, spectral distance, silence, clipping. It can measure how large a manipulation is. It cannot notice that a clip is bad in a way nobody thought to model.":
    "替代方案有两层，而转向文件自己称为真正关卡的那一层，即从作答数据估计题目难度和区分度，从来没有运行过，因为真实作答为零。今天把关录音的只有声学这一层：响度、频谱距离、静音、削波。它能测出一次处理有多大。它察觉不到一段录音以某种没人想到要建模的方式出了问题。",

  // The reversals.
  "Speaking about the person, on one surface only": "只在一个页面上谈论人本身",
  "D1 — the product describes what you did, never what you are": "D1：产品描述你做了什么，从不描述你是什么",
  "Every reading on this site is a statement about a performance. That was a rule rather than a habit: it is written into the constitution as D1, and it is why a five-tap personality verdict with no measurement behind it was killed rather than improved. On 2026-09-16 the owner relaxed it, against the engineering recommendation on file. The card that turns a measured threshold into words a person can use may speak to the reader about themselves. The amendment's own wording was that D1 is suspended for the prompt card, and for nothing else; a second named surface followed a week later, recorded below. Every instrument readout on this site still says only what you did.":
    "本站的每一个读数，都是关于一次表现的陈述。这曾是一条规则，并非习惯：它作为 D1 写进了项目章程，也正因为它，一个背后没有任何测量的五次点击人格判定被砍掉，没有被改进。2026-09-16，负责人放宽了它，违背了记录在案的工程建议。那张把测得的阈值变成人能用的文字的卡片，可以对读者谈论读者自己。修正案的原话是：D1 只对提示卡片暂停，别处一概不变；一周后又有第二个点名的页面，记在下面。本站每一个测试读数，仍然只说你做了什么。",
  "The one thing here anybody would keep. The measurement ends in a threshold in cents, the number is evidence, and it had been standing in the position of the deliverable — which is why a technically sound instrument was neither enjoyable to use nor convincing to look at. A sentence that is only about a performance cannot be the thing somebody leaves with.":
    "这里唯一有人会保留下来的东西。测量的终点是一个以音分计的阈值，这个数字是证据，却一直站在交付物的位置上；所以一项技术上可靠的测试，用起来不愉快，看起来也没有说服力。一句只关于表现的话，成不了人们带走的东西。",
  "This project can no longer say that every sentence it shows is about performance. That was true, it was one of the plainest things the product could say about itself, and it is now false — the exception is real even though it is one surface wide. The constitution also gains an exception, which is complexity it did not have, and every surface built from here has to ask which side of it it falls on. The rule that survives is narrower and harder to hold: offer, do not assert.":
    "这个项目再也不能说，它展示的每一句话都关于表现。这句话曾经为真，是产品能说出的关于自己最平实的话之一，如今却是假的：例外只有一个页面宽，但它确实存在。项目章程也多了一个例外，这是它原本没有的复杂度，此后每建一个页面，都得问它落在例外的哪一边。留下来的规则更窄，也更难守：只提示，不断言（offer, do not assert）。",
  "A second surface that speaks about the person: the snack": "第二个谈论人本身的页面：小测验",
  "On the morning of 2026-09-23 the five-tap music snack was retired so that two sentences on this site would be true. The same day the owner restored it, on the argument that it was the part of the product carrying the product's own thesis — that taste carries cues about feeling, and that the gap between what a person's taste reveals and what they know about themselves is where insight lives. The constitution records the decision in one line: it extends the 2026-09-16 suspension to one more named surface. A reading built from that thesis later is not covered until it, too, is named.":
    "2026-09-23 上午，五次点击的音乐小测验被撤下，为的是让本站的两句话为真。同一天，负责人又恢复了它，理由是它承载着产品自己的论点：口味带着关于感受的线索，而一个人的口味透露的东西和这个人对自己的了解之间的落差，正是领悟所在。项目章程用一句话记下这个决定：它把 2026-09-16 的暂停扩展到另一个点名的页面。之后按这个论点做出的解读，在它也被点名之前不受覆盖。",
  "The part of the product people could enjoy, and the half of its thesis the instruments never reached. The instruments test whether a listener can hear; the snack is where the product speaks to what a listener might be going through — as a playful verdict that says at its own door there is no measurement behind it.":
    "产品里人们能乐在其中的那一部分，也是论点中测试从未触及的那一半。测试检验的是听者能否听出；小测验则是产品对听者可能正在经历的事说话的地方，形式是一个玩笑式的判定，并在自己门口就说明背后没有任何测量。",
  'The pivot concluded the five-tap verdict dead, and the reversal above names it as the reason D1 exists. It is back, beside the instruments. The line between a reading about the person and a measurement of a performance is now held only by naming surfaces one at a time, and the card\'s own disclosure had to narrow from "on this site" to "in the gym". One line did not move: nothing on any surface asserts anything about trauma, abuse or mental health.':
    "那次转向已判定五次点击的小测验走不通，上面那条改判也说它正是 D1 存在的原因。如今它回来了，就在测试旁边。关于人的解读和对表现的测量之间的界线，现在只靠一个个点名页面来守，卡片自己的声明也只好从「on this site」收窄到「in the gym」。有一条线没有动：任何页面都不对创伤、虐待或心理健康作出任何断言。",
  "The snack retired again, and the reading made the product": "小测验再次撤下，解读成为产品本身",
  "D1 and D3 — the product describes what you did, and the Prestige Test was the flagship": "D1 与 D3：产品描述你做了什么，名气偏差测试（Prestige Test）曾是旗舰",
  "Hours after the snack came back, on 2026-09-23, the owner retired it for good and withdrew its exemption from D1. Its questions asked people to describe their own taste, which is the one thing the interviews behind this project found almost nobody can do, and its verdict was written by a language model. The same ruling moved the flagship: the Prestige Test is no longer the front door. A reading of a listener's recent plays is, and the four instruments become the hearing section behind it. The ruling adds the rule the reading is built under: no surface may assert a feeling. And nothing on any surface asserts anything about trauma, abuse or mental health.":
    "小测验回来几个小时之后，同在 2026-09-23，负责人将它永久撤下，并收回它对 D1 的豁免。它的问题要人们描述自己的口味，而本项目背后的访谈发现，这件事几乎没有人做得到；它的判定还是由语言模型写的。同一项裁定挪动了旗舰：名气偏差测试不再是前门。一位听者近来播放记录（plays）的解读成了前门，四项测试成为它身后的听辨部分。这项裁定还加上了解读赖以建立的规则：任何页面都不许断言一种感受。而且，任何页面都不对创伤、虐待或心理健康作出任何断言。",
  "A front door that shows the idea the project was started for: a listener's recent taste read into lines that can be checked against the plays, argued with, and carried into a prompt. And no sentence on this site is generated by a model when a visitor arrives any more, so every one of them is a fixed template a test can read.":
    "一扇展示项目初衷的前门：把一位听者近来的口味读成一条条文字，可以对照播放记录核对，可以反驳，可以带进提示词（prompt）。而且，访客到来时，本站再也没有任何一句话由模型生成，所以每一句都是测试读得到的固定模板。",
  "The snack was the one part of the product a person could enjoy without headphones, and it is gone. The reading that replaces it at the door runs on three illustrative listeners, so the first thing a visitor meets is simulated plays, labelled as such, where it used to be a measurement of the visitor. And the reversal above now records a decision that lasted less than a day.":
    "小测验是产品里唯一不戴耳机也能乐在其中的部分，现在没有了。在门口取代它的解读，运行在三位示例听者（illustrative listener）身上，所以访客遇到的第一样东西，是标明为模拟的播放记录，而这里原先是对访客本人的测量。上面那条改判，如今记录的是一个持续不到一天的决定。",

  // The findings.
  "N3 — nothing the data cannot support": "N3：数据撑不起的东西一概不说",
  "Before the retest arc was allowed to tell anyone their ear had moved, the size of change it can resolve was measured: the whole hazard here is that subtracting two noisy numbers manufactures progress. Simulating the same unchanged person through two sessions at the shipped length puts the floor on the pitch ladder at roughly 3.5 times — the threshold has to more than halve before the difference can be told from ordinary run-to-run wobble. On the prestige test it is eight points of the scale. The delicacy trials cannot support an arc at all: six of their fifteen pairs would have to change hands.":
    "在允许重测线告诉任何人其耳朵有了进步之前，先测了它能分辨多大的变化：这里的全部风险在于，两个有噪声的数相减，会凭空造出进步。用上线时的测试长度，模拟同一个没有变化的人做两次测试，音高梯级上的下限约为 3.5 倍：阈值要缩小一半以上，差别才能和每次运行之间的正常波动区分开。在名气偏差测试上，这个下限是量表上的 8 分。细辨测试根本撑不起一条重测线：15 对里得有 6 对易手。",
  "Most retests are therefore told, in as many words, that nothing changed the instrument could hear. That refusal is the ordinary output of this feature rather than its edge case, and the sentence names the floor in the reader's own units so it reads as a fact about the instrument rather than a verdict on them. The only thing that lowers the floor is returning: pooled across four sittings it falls to about two and a half times, which is the entire reward this product offers for coming back.":
    "因此，大多数重测得到的回答，都明明白白地说：没有发生测试能听出的变化。这种拒绝是这项功能的常规输出，并非边缘情况；那句话用读者自己的单位说出下限，读起来是关于测试的事实，并非对读者的评判。唯一能降低下限的是再来：合并四次测试，下限降到约两倍半，这就是这个产品为回访提供的全部回报。",
  "N2 — the anti-theater guardrail": "N2：反作秀护栏",
  "A ruling had already been made: post the flagship instrument on its own, within one to two weeks, and do not let the second instrument gate it. The second instrument got built instead. The plan written that day says it without softening: Delicacy got built instead. That is the N2 launch-avoidance pattern, on the record. And directly above it, the diagnosis: Nothing is blocked by engineering. Everything is blocked by the launch not having happened.":
    "当时已有一项裁定：单独发布旗舰测试，一到两周之内，不许第二项测试挡住它。结果建出来的是第二项测试。那天写下的计划毫不掩饰：结果建出来的是细辨测试。这是 N2 所说的逃避发布的表现，记录在案。就在它上面，是诊断：没有任何事被工程卡住。所有事都卡在发布没有发生。",
  "As of the revision date at the foot of this page, it still has not been posted. The product has had 29 real visitors, ever. There are Zero real responses, which is why every psychometric figure in the Lab is generated from a known model and badged as simulated — the dataset that was named as the project's proprietary asset does not exist. Building is the part that feels like progress, and it is the part that was never the constraint.":
    "截至本页底部的修订日期，它仍未发布。产品至今一共只有 29 位真实访客。真实作答为零，所以实验室（The Lab）里的每一个心理测量数字，都由已知模型生成并标为模拟；那个被称为项目专有资产的数据集并不存在。建造让人感觉在进步，而瓶颈从来都不在它。",
  "N2 — the same guardrail, applied to the response rather than the act": "N2：同一条护栏，用在回应上，并非用在行为上",
  "What happened next is the part that is harder to read, and this reading is mine rather than a recorded ruling. Within the same week the project adopted a direction that made the avoided thing optional: Resume value cannot be hostage to a launch the owner has no energy to run, and after it, The 2026-09-15 deadline is not a live constraint. That argument is sound on its own terms. It is also, in sequence, a project noticing that it was avoiding something and then removing the requirement to do it.":
    "接下来发生的事更难看懂，下面的看法出自我本人，并非记录在案的裁定。同一周内，项目采纳了一个让被逃避的事变成可选的方向：简历价值不能被一次负责人没有精力去做的发布绑架；随后又写道：2026-09-15 的截止日期已不再是一项有效约束。就其自身而言，这个论证站得住。按先后顺序看，它同时也是一个项目发现自己在逃避某件事，随即取消了做这件事的要求。",
  "I cannot tell from the record which of the two it was, and neither can a reader, so the page says so rather than choosing the flattering reading. The test that would settle it is not an argument: it is whether the instruments are ever put in front of strangers. Until they are, the honest description of this project is that it has built four working instruments and measured them against simulated respondents.":
    "从记录里我分辨不出是两者中的哪一种，读者也分辨不出，所以本页照实说明，不去挑那个好听的说法。能定下结论的检验并非一番论证：它在于这些测试是否真正放到陌生人面前。在那之前，对这个项目诚实的描述是：它建成了四项能用的测试，并用模拟作答者测量过它们。",

  // How the agents are run.
  "How the agents are run": "智能体怎样运作",
  'This project is built with an AI engineer, and the owner ruled where that story is told: the "I harness AI" pitch lives in the repository and on /method, not in the product. These are the five working parts, each with the file that holds it and one later commit whose message shows it at work. A commit message proves the use was recorded, not that it happened; the files are there to check against.':
    "这个项目是和一位 AI 工程师一起建的，负责人也裁定了这件事在哪里讲：「I harness AI」这套说法，放在代码仓库和 /method 页面上，不放进产品里。下面是五个在用的部件，每一个都附上存放它的文件，以及一次后来的提交，其提交说明显示了它在运作。提交说明只证明这次使用被记录下来了，并不证明它确实发生过；文件都在，可以对照核查。",
  "A constitution the engineer is held to": "一部约束工程师的章程",
  "Every session starts from one written constitution, and its first standing rule is about the engineer: every proposal must cite the memo decision (D1–D6) or guardrail (N1–N3) it serves.":
    "每次会话都从同一部成文章程开始，它的第一条常设规则针对的是工程师：每一项提议都必须注明它服务的备忘录决定（D1 至 D6）或护栏（N1 至 N3）。",
  "Hooks that enforce the loop": "执行循环的钩子",
  "Git refuses a code commit that does not carry the slice's north star, three red-team findings and a confession. It checks presence, not honesty. A second hook, run by Claude Code, is the stop between slices: a git commit arms the latch, and file edits are refused until the owner replies. It stands down while the owner's standing auto-advance is in force.":
    "如果一次代码提交没有带上这个切片的北极星、三条红队发现和一份自白，Git 会拒绝它。它只检查有没有，不检查诚不诚实。第二个钩子由 Claude Code 运行，是切片之间的停顿：一次 git 提交会锁上闩锁，在负责人回复之前，编辑文件的操作一律被拒绝。负责人的常设自动推进生效期间，它会让开。",
  "Skills that quote their rules": "引用自身规则的技能",
  "Three skills load a procedure into a session at the moment it is needed. The red-team skill packages a procedure every session here already follows from prose; the session close packages the closing rules; the blueprint check packages the blueprint rule of record.":
    "三个技能在需要的时刻把一套流程载入会话。红队技能打包的是这里每次会话本来就照着文字执行的流程；收尾技能打包的是收尾规则；蓝图检查打包的是记录在案的蓝图规则。",
  "A reviewer that cannot edit": "不能改代码的审查者",
  "The red-team skill hands a slice's staged change to a second agent, which returns up to three findings and cannot change the code: you report; the main session fixes. It has no tool that writes because a hook meant to keep it read-only was tested and did not deny a write, and a guard that did not deny a write cannot be the thing that makes a reviewer read-only.":
    "红队技能把一个切片暂存的改动交给第二个智能体，它最多返回三条发现，不能改代码：你负责报告，主会话负责修。它没有任何能写入的工具，因为一个本想让它保持只读的钩子经过测试，并没有拦下写入操作；一个拦不住写入的守卫，不可能是让审查者保持只读的那样东西。",
  "A server that quotes the record": "引用记录的服务器",
  "A small read-only server answers a session's questions about the blueprint, the rulings and the abandoned hypotheses with the files' own words, because a tool that returns the file's own text cannot paraphrase it.":
    "一个小型只读服务器，用文件自己的原话回答会话关于蓝图、裁定和已放弃假设的提问，因为一个返回文件原文的工具没办法转述它。",
};

export default METHOD;
