/**
 * 公司视角 · The Company view in Chinese (bilingual Part 2; BA-9, BA-12; BP-BUSINESS, BP-GOAL).
 *
 * Keys are the exact English `src/content/company/copy.ts` and `plan.ts` render;
 * a key that stops matching its English fails `site-zh.test.tsx`. Numbers come
 * through slots, as in the English. DRAFT: not yet through the owner's writing pass.
 */
import type { Dict } from "@/lib/i18n";

const COMPANY: Dict = {
  // Page metadata.
  "The company view — Standard of Taste": "公司视角 · 鉴衡",
  "Illustrative: why a fictional streaming service would build the reading, the metrics it would watch, and the A/B test that would decide it.":
    "示意：一家虚构的流媒体平台为什么会做解读，会盯哪些指标，又用哪一次 A/B 测试来定去留。",

  "Illustrative. A fictional company; nothing here was measured.": "示意（ILLUSTRATIVE）。公司是虚构的，这里的数字都未经测量。",
  "THE COMPANY VIEW": "公司视角",
  "Why Tessavox would build the reading, and how it would find out if it was wrong.":
    "Tessavox 为什么会做解读，做错了又怎样查得出来。",

  "The business case": "商业论证（business case）",
  "Tessavox already holds what the reading needs: every listener's recent plays. Nobody is asked to describe their taste, which the interviews behind this project found almost nobody can do.":
    "解读需要的东西，Tessavox 手里已经有了：每位听者近来的播放记录。解读不需要任何人描述自己的品味，本项目背后的访谈发现，这件事几乎没有人做得到。",
  "The prompt the reading ends in is pasted into Tessavox's own creation tool, trained on music it has licensed. The reading is the way in; the tool is what it feeds.":
    "解读最后给出的提示词，会贴进 Tessavox 自己的创作工具，这个工具用 Tessavox 获得授权的音乐训练而成。解读是入口，它的产出交给工具使用。",
  "What a listener rejects and what they choose is a signal a recommender does not collect: a person correcting a description of their own listening.":
    "听者删去哪一条、选了哪种读法，是推荐系统收集不到的信号：一个人在纠正对自己收听的描述。",

  "What it would measure": "它会测什么",
  "NORTH STAR": "北极星指标（north star）",
  "Readings that end in a creation start": "以开始创作收尾的解读",
  "Of the readings a listener opens, the share that reach the creation screen and start a track.":
    "听者打开的解读中，走到创作界面并开始做一首曲子的比例。",
  "It is the whole claim in one number: a reading worth having is one somebody carries into something they make.":
    "整个主张压成一个数：值得拥有的解读，是有人会把它带进自己作品里的解读。",
  SUPPORTING: "辅助指标",
  "Kept-line rate": "保留率",
  "Lines kept, over lines shown.": "保留的条数除以展示的条数。",
  "A reading whose lines are mostly rejected is describing somebody else.": "大部分条目都被删去的解读，描述的是另一个人。",
  "Chosen-reading rate": "读法选中率",
  "Kept lines where the listener picked one of the two offered readings, over kept lines.":
    "保留下来的条目中，听者从提示的两种读法里选了一种的，占保留条数的比例。",
  'It says whether the offers land. A line kept with "neither" every time names a real pattern and misreads it.':
    "这个比率反映提示的读法有没有说中。一条每次都被保留、却每次都选「都不对」的条目，说中了真实的规律，却读错了它的意思。",
  GUARDRAILS: "护栏指标（guardrail）",
  "Rejection rate, per template": "删去率，按模板统计",
  "For each line template, rejections over showings.": "每个条目模板被删去的次数除以展示次数。",
  "High means the template is wrong. Near zero is its own warning: a line nobody ever rejects may be true of everyone, which is the Barnum effect the receipts exist to prevent.":
    "删去率高，说明模板写错了。接近零也是一种警告：一条从来没人删去的条目，可能对谁都成立，这就是巴纳姆效应（Barnum effect），依据就是为防它而设的。",
  "Carve-out hits": "红线条款（carve-out）命中数",
  "Rendered sentences that match the carve-out patterns.": "页面上出现的、与红线条款所列词语相符的句子。",
  "The target is zero, always: nothing on any surface asserts anything about trauma, abuse or mental health.":
    "目标永远是零：任何页面都不对创伤、虐待或心理健康作出任何断言。",
  "Opt-out rate": "关闭率",
  "Listeners who turn the reading off, over listeners shown it.": "关掉解读的听者，占看到解读的听者的比例。",
  "A feature that reads your listening back to you has to be easy to refuse, and a rising opt-out is the first sign it is unwelcome.":
    "一项把你的收听读给你听的功能，必须容易拒绝；关闭率上升，是它不受欢迎的第一个信号。",

  "How it would test it": "它会怎样检验",
  "An A/B test at Tessavox's creation entry. Half of the visitors who open the creation tool see the reading and the prompt it ends in; the other half see the plain prompt box they see today.":
    "在 Tessavox 的创作入口做一次 A/B 测试。打开创作工具的访客，一半看到解读和它最后给出的提示词，另一半看到今天那个普通的提示词输入框。",
  "Primary metric: creation starts per visitor who reaches the creation entry, compared between the two arms.":
    "主要指标：到达创作入口的每位访客开始创作的次数，在两组之间比较。",
  "Planning assumptions": "规划假设（planning assumption）",
  "Every number below is a planning assumption or computed from one. None is a result.":
    "下面每个数，要么是规划假设，要么由规划假设算出。没有一个是结果。",
  "PLANNING ASSUMPTION": "规划假设",
  "{label}: {value}": "{label}：{value}",
  "Creation starts per visitor at the creation entry, with the plain prompt box":
    "使用普通提示词输入框时，创作入口处每位访客开始创作的比例",
  "20%": "20%",
  "We found no published rate, so nothing measured stands behind it. It is a round number chosen to make the arithmetic visible, and the sample size is shown for two others beside it.":
    "我们没有找到公开发布的比率，所以它背后没有任何测得的数据。选一个整数，是为了让计算一目了然；旁边还列出了另外两个基线（baseline）下的样本量。",
  "The smallest lift worth detecting": "值得检测的最小增幅",
  "2 percentage points": "2 个百分点",
  "The reading adds screens before creation, and screens cost attention and maintenance. The assumption is that a lift smaller than a tenth of the baseline would not pay for them, so the test is sized to see one that size and not smaller.":
    "解读在创作之前多出几屏，每一屏都占用注意力，也要维护。这里假设：增幅小于基线的十分之一，就抵不上这些成本，所以测试的样本量按正好看得出这么大的增幅来定，更小的不管。",
  "False-positive rate, two-sided": "假阳性率，双侧",
  "5%": "5%",
  "Convention, kept because a reviewer can check it at a glance; nothing about this feature argues for another.":
    "沿用惯例，因为评审者一眼就能核对；这项功能没有任何理由换一个值。",
  Power: "统计功效",
  "80%": "80%",
  "Convention: a one-in-five chance of missing a real lift of the minimum size is the usual trade against run length.":
    "沿用惯例：接受五分之一的概率漏掉一个恰为最小幅度的真实增幅，换取较短的测试周期，这是通常的取舍。",
  "Visitors needed in each arm, from the assumptions:": "按这些假设，每组需要的访客数：",
  "n per arm = (z₁₋α/₂ · √(2·p̄(1−p̄)) + z₁₋β · √(p₁(1−p₁) + p₂(1−p₂)))² ÷ (p₂ − p₁)²":
    "每组 n = (z₁₋α/₂ · √(2·p̄(1−p̄)) + z₁₋β · √(p₁(1−p₁) + p₂(1−p₂)))² ÷ (p₂ − p₁)²",
  "{from} → {to}: {count}": "{from} → {to}：{count}",
  "{n} visitors per arm": "每组 {n} 名访客",
  "If the baseline were different:": "如果基线换一个值：",
  "The result that would kill it": "终止条件（kill criteria）",
  "The upper end of the 95% interval for the lift falls below the smallest lift worth detecting. The reading is then not worth its screens, however much people enjoy it.":
    "增幅 95% 区间的上限，低于值得检测的最小增幅。那样的话，无论人们多喜欢解读，它都抵不上它占用的那几屏。",
  "Any carve-out hit in the rendered copy, at any point in the test.": "测试期间任何时候，页面文字中出现任何一次红线条款命中。",
  "A template rejected by more than half the listeners it is shown to is pulled, and the test continues without it.":
    "某个模板若被超过一半看到它的听者删去，就撤下它，测试照常继续。",

  "What five departments would ask": "五个部门会问什么",
  Personalization: "个性化推荐",
  "Doesn't the recommender already do this?": "推荐系统不已经在做这件事了吗？",
  "The recommender acts on a listener's taste without ever showing it to them. The reading shows the pattern, points at the plays behind it, and lets the listener correct it; a correction is a signal the recommender never gets.":
    "推荐系统按听者的品味行事，却从不把品味摆给听者看。解读把规律摆出来，指出背后的播放记录，并让听者纠正它；一次纠正，就是推荐系统永远拿不到的信号。",
  "Trust & safety": "信任与安全",
  "Are we inferring how people feel from what they play?": "我们在从人们播放的歌里推断他们的感受吗？",
  "We don't infer it, and the design refuses to. A line names a pattern and offers two readings as questions, because the same pattern can come from opposite feelings; the listener says which, if either. No model writes any sentence, and nothing on any surface asserts anything about trauma, abuse or mental health. In 2021 a streaming service's patent for detecting a listener's emotional state from their voice drew a public campaign against it.":
    "我们不推断，设计上也拒绝推断。每一条只说出一种规律，再以问题的形式提示两种读法，因为同一种规律可能来自相反的感受；哪一种对，或者都不对，由听者来说。没有任何一句话由模型写成，任何页面都不对创伤、虐待或心理健康作出任何断言。2021 年，一家流媒体平台用来从听者声音中检测情绪状态的专利，招来了一场公开的抗议。",
  'Access Now, Fight for the Future, the Union of Musicians and Allied Workers and more than 180 musicians and rights groups, letter to Spotify dated 4 May 2021 on its patent for detecting a speaker\'s "emotional state"; press release published':
    "Access Now、Fight for the Future、Union of Musicians and Allied Workers 以及 180 多位音乐人和权益组织致 Spotify 的公开信，落款 2021 年 5 月 4 日，针对其检测说话者「情绪状态」的专利；新闻稿发布于",
  "19 May 2021": "2021 年 5 月 19 日",
  "{what}, {date}. {link}": "{what} {date}。{link}",
  Source: "来源",
  "Legal & licensing": "法务与版权",
  "What data does it touch, and where does the prompt go?": "它会碰哪些数据，提示词又送到哪里？",
  "Listening history Tessavox already holds, read inside Tessavox. The prompt goes only to Tessavox's own licensed creation tool, never to a third-party generator, and it names no artist. What that tool was trained on is its own licensing question, not the reading's.":
    "只碰 Tessavox 本来就有的播放记录，并且只在 Tessavox 内部读取。提示词只送进 Tessavox 自有、已获授权的创作工具，从不交给第三方生成工具，也不点任何艺人的名字。那个工具用什么训练，属于它自己的授权问题，与解读无关。",
  Growth: "增长",
  "Which number does it move, and how would we know it didn't?": "它会让哪个数变化，没变的话我们又怎么知道？",
  "Creation starts, tested against today's plain prompt box, with the result that kills it written down before the test runs. The demand underneath is assumed, not shown: nobody has yet been observed wanting this.":
    "开始创作的次数，与今天普通的提示词输入框对照测试；终止条件在测试开始前就写下来。背后的需求只是假设，并未得到证明：至今没有观察到任何人想要它。",
  "Label partnerships": "唱片公司合作",
  "Will labels see this as a tool that competes with their artists?": "唱片公司会不会把它看成与旗下艺人竞争的工具？",
  "The prompt feeds Tessavox's licensed tool, which is the direction the industry has taken in public: in October 2025 a major streaming service announced AI music products built with the labels rather than around them.":
    "提示词交给 Tessavox 已获授权的工具，这也是行业公开选择的方向：2025 年 10 月，一家大型流媒体平台宣布推出与唱片公司一起做的 AI 音乐产品，唱片公司是合作方，没有被绕开。",
  'Spotify, "artist-first" AI music products announced with Sony, Universal, Warner, Merlin and Believe — not, at the time, a licence to train on their catalogues':
    "Spotify 与 Sony、Universal、Warner、Merlin 和 Believe 共同宣布的「artist-first」AI 音乐产品；当时并未包含用其曲库训练模型的授权；",
  "16 October 2025": "2025 年 10 月 16 日",
  "Try the reading": "试试解读",
};

export default COMPANY;
