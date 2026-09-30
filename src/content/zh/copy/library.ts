/**
 * 资料室的条目与正文 · The library's registry and pages in Chinese (bilingual Part 4).
 *
 * Keys are the exact English the library renders: every entry of `src/content/learn.ts`
 * (title, meta title, description, teaser, questions and answers) and the prose of each
 * explainer, one paragraph per key with its links and emphasis as `{slots}`. Merged into
 * the library's dictionary (`learn.ts`), so the Explainer and the pages read one table.
 * DRAFT: not yet through the owner's writing pass.
 */
import type { Dict } from "@/lib/i18n";

const LIBRARY: Dict = {
  "What is the Prestige Test?":
    "什么是名气偏差测试（Prestige Test）？",
  "What is the Prestige Test? — Standard of Taste":
    "什么是名气偏差测试？ · 鉴衡",
  "Sixteen clips, rated twice — once blind, once with names attached. Some names are deliberately false. The gap between your two ratings is your prestige-bias number.":
    "16 段录音，打两次分：一次盲听，一次带着名字。有些名字是故意写错的。两次评分之间的差距，就是你的名气偏差数字。",
  "The flagship machine: how far can a famous name move your ratings?":
    "旗舰测试：一个有名的名字，能把你的评分挪动多远？",
  "How does the Prestige Test work?":
    "名气偏差测试是怎么做的？",
  "You rate sixteen short music clips blind, then rate the same sixteen clips again — fourteen with artist names and reputations attached, two deliberately left unlabeled as drift controls. Two of the fourteen labels are deliberately swapped. Your score is computed from how far your ratings moved toward the labels, corrected by your measured drift on the unlabeled controls — a measured gap, not a self-report.":
    "你先盲听给 16 段短录音打分，再给同样这 16 段打一次：其中 14 段带着艺术家的名字和名声，2 段故意不带标签，作为漂移对照组。14 个标签里有 2 个是故意调换的。你的分数由你的评分朝标签移动了多远算出，并按你在无标签对照组上测得的漂移校正：这是测出来的差距，并非自我报告。",
  "Why does the test lie about some labels?":
    "测试为什么要在一些标签上说谎？",
  "If every label were true, a rating shift toward acclaimed names could just mean the acclaimed clips were genuinely better. Swapped labels separate the name from the sound: when your rating follows a false name, only prestige can explain the move. Every swap is disclosed on a mandatory debrief screen before you leave — the deception is the instrument, and you always learn the truth.":
    "如果每个标签都是真的，评分朝有名的名字移动，也可能只是因为那些有名的录音确实更好。调换标签能把名字和声音拆开：当你的评分跟着一个假名字走，能解释这个移动的只有名气。每一次调换，都会在你离开前的必读结果说明里披露：欺骗就是这项测试本身，而你总会得知真相。",
  "Is my result a percentile?":
    "我的结果是百分位吗？",
  "Not yet. Results are labeled provisional until a calibration cohort exists — the product does not fabricate norms. You get your measured gap and what it means; percentiles arrive when there are enough real sessions to compute them honestly.":
    "目前还没有。在校准样本人群出现之前，结果都标为暂定：这个产品不编造常模。你得到的是测出来的差距和它的含义；等真实的测试多到足以诚实地计算百分位，百分位才会出现。",
  "Is the Prestige Test free?":
    "名气偏差测试免费吗？",
  "Yes, and so is everything else. There is no paid tier here: the assessment, your headline score, and the training arc when it exists are all free. The only gate anywhere in the gym is a seven-day wait before you retake a family of trials — sooner than that and a retest measures your memory of the clips rather than your ear.":
    "免费，其他一切也都免费。这里没有付费版：测试本身、你的主要分数，以及日后会有的训练，全都免费。整个训练馆唯一的限制，是同一类测试要隔七天才能重测：早于这个时间，重测测到的是你对录音的记忆，并非你的耳朵。",
  "Freedom from prejudice":
    "不受偏见左右",
  "Freedom from Prejudice — Hume's Criterion, Measured":
    "不受偏见左右：休谟的标准，测出来",
  "Hume required a true judge to clear their mind of every consideration except the work itself. The Prestige Test measures how far you actually manage it.":
    "休谟要求一位真正的评判者，除了作品本身，把一切考虑都从心里清出去。名气偏差测试测的是，你实际上能做到多少。",
  "Hume's fourth criterion — the one the flagship machine measures.":
    "休谟的第四条标准，也就是旗舰测试测量的那一条。",
  "What did Hume mean by freedom from prejudice?":
    "休谟说的「不受偏见左右」是什么意思？",
  "In 'Of the Standard of Taste' (1757), Hume argued a critic must set aside everything about the work except the work — reputation, fashion, friendship, rivalry — and judge only what is in front of them. A judgment moved by the author's name rather than the object is, in his account, corrupted.":
    "休谟在 1757 年的《论品味的标准》（Of the Standard of Taste）里主张，评论者必须把作品之外的一切都放到一边，包括名声、潮流、交情、竞争，只评判摆在面前的东西。在他看来，被作者的名字左右、没有被对象本身左右的判断，就是被败坏了的判断。",
  "Can prestige bias be measured?":
    "名气偏差能测吗？",
  "Yes, with a within-subject design: the same person rates the same works with and without labels, and some labels are deliberately false. The rating shift attributable to the label is a measurable quantity. You serve as your own control, so no external ground truth about the music's quality is needed.":
    "能，用被试内设计：同一个人给同样的作品分别在有标签和没标签时打分，其中有些标签是故意写错的。可以归因于标签的评分偏移，是一个可以测量的量。你自己就是自己的对照组，所以不需要任何关于音乐质量的外部标准答案。",
  "Delicacy of taste":
    "鉴赏力",
  "Delicacy of Taste — The Key in the Wine":
    "鉴赏力：酒里的钥匙",
  "Sancho's kinsmen tasted leather and iron in a hogshead of wine and were laughed at — until the key on a leathern thong was found at the bottom. Delicacy is verifiable perception.":
    "桑丘的亲戚在一大桶酒里尝出了皮革味和铁味，被人嘲笑，直到桶底找到一把拴着皮绳的钥匙。鉴赏力，就是可以核查的感知。",
  "Machine 02: can your ears find the key in the wine?":
    "第 02 台机器：你的耳朵能找到酒里的钥匙吗？",
  "What is the key-in-the-wine story?":
    "「酒里的钥匙」是什么故事？",
  "Hume retells it from Don Quixote: two of Sancho's kinsmen were asked to judge a hogshead of wine. One found a faint taste of leather, the other of iron, and both were laughed at — until the cask was drained and an old key on a leathern thong was found at the bottom. Their perception was real and verifiable, and that is delicacy.":
    "休谟转述的是《堂吉诃德》里的故事：桑丘的两位亲戚被请去评一大桶酒。一位尝出一丝皮革味，另一位尝出铁味，两人都被人嘲笑，直到酒桶喝空，桶底露出一把拴着皮绳的旧钥匙。他们的感知是真实的、可以核查的，这就是鉴赏力。",
  "How do the Delicacy Trials work?":
    "细辨测试是怎么做的？",
  "Public-domain and Creative-Commons recordings are damaged on purpose, by a known amount — pitch drift, timing smear and compression damage — and you pick the original and name the flaw. Unlike a taste quiz, the answers are right or wrong, the difficulty is tunable, and the items can be calibrated with item-response theory.":
    "公有领域和知识共享许可的录音被有意地、按已知的程度损坏，损坏方式有音高漂移、节拍模糊和压缩损伤；你选出原版，并说出瑕疵的名字。和口味小测验不同，这里的答案有对有错，难度可以调，题目也可以用项目反应理论来校准。",
  "Where do the Delicacy Trials sit in the gym?":
    "细辨测试在训练馆里处于什么位置？",
  "They are machine 02, and the door is open. They were built after the Prestige Test, on the principle that a gym leaves its equipment in plain view long before anyone is ready for it. This one is no longer roped off.":
    "它是第 02 台机器，门已经开了。它建在名气偏差测试之后，按照的原则是：训练馆会早早把器材摆在明处，远在任何人准备好之前。这一台已经不再拦着了。",
  "Naming what went wrong":
    "说出哪里出了问题",
  "Naming what went wrong — Standard of Taste":
    "说出哪里出了问题 · 鉴衡",
  "Three kinds of audio damage, what each one sounds like, the unit it is measured in, and which machine finds how small a dose of it you can still catch.":
    "三种音频损伤：每一种听起来是什么样，用什么单位测量，以及哪台机器能测出你还能听出的最小剂量。",
  "You can hear that it is wrong. Here is what it is called.":
    "你听得出它不对。这里告诉你它叫什么。",
  "Can you tell me which flaw is wrecking my track?":
    "你能告诉我是哪种瑕疵毁了我的曲子吗？",
  "No. Nothing here listens to your files, and there is nowhere to upload one. What you get is the vocabulary, and nothing else: the names, and how small a dose of each one your own ears still catch.":
    "不能。这里没有任何东西会去听你的文件，也没有地方可以上传。你得到的只有词汇：这些瑕疵的名字，以及每一种你自己的耳朵还能听出的最小剂量。",
  "Why only three?":
    "为什么只有三种？",
  "Because three is what the clip pipeline can render as a controlled dose with a right answer behind it: pitch drift, timing smear and compression damage. Plenty of other things go wrong in a mix; they are absent because we cannot measure them yet, not because they do not matter.":
    "因为录音处理流程能做成受控剂量、背后有正确答案的，就是这三种：音高漂移、节拍模糊和压缩损伤。混音里还有很多别的东西会出问题；它们不在这里，原因是我们还测不了，与它们重不重要无关。",
  "If I catch these in the trials, will I catch them in my own work?":
    "如果我在测试里听得出这些，在自己的作品里也能听出来吗？",
  "Unmeasured, so it is not claimed. The instruments report what you caught in these trials, on these recordings, in physical units. Whether that transfers to your own sessions is a question no data here answers.":
    "这没有测过，所以不作声称。这些测试报告的，是你在这些测试里、在这些录音上听出了什么，用物理单位表示。它能不能迁移到你自己的创作里，这里没有任何数据能回答。",
  "Practice":
    "练习",
  "Practice — Why Taste Is Trainable":
    "练习：为什么品味可以训练",
  "Hume held that no one is born a judge: facility in judging comes from repeated, attentive encounters with works. Practice is the criterion that makes a taste gym possible.":
    "休谟认为，没有人生来就是评判者：判断的熟练来自一次次专注地与作品相遇。练习，是让一个品味训练馆成为可能的那条标准。",
  "The premise of the whole gym: judgment improves with reps.":
    "整个训练馆的前提：判断力会随着反复练习而提高。",
  "Did Hume think taste could be trained?":
    "休谟认为品味可以训练吗？",
  "Yes — explicitly. He wrote that nothing improves the talent of judging more than practice in a particular art, and that a first attempt at judging is always 'obscure and confused.' Delicacy sharpens with use; that claim is why a gym for taste is coherent at all.":
    "是的，而且说得很明白。他写道，没有什么比在某一门艺术里的练习更能提高判断的才能，而初次尝试判断时，总是「模糊而混乱」的。鉴赏力（delicacy of taste）越用越敏锐；正是这个主张，让一个品味训练馆说得通。",
  "How does the Taste Gym use practice?":
    "品味训练馆怎样使用练习？",
  "Sit a threshold ladder twice in the same browser and the result screen compares the two sittings. It is free, because charging for the training loop would put the one honest question — did your ear actually move — behind a wall. The comparison is judged against a noise floor measured first, so a difference smaller than the instrument's own run-to-run wobble is reported as no change rather than as progress: on the pitch ladder two sittings must differ by roughly 3.5 times before it will call it movement. Most retests are therefore told that nothing changed the instrument could hear, which is the honest answer.":
    "在同一个浏览器里把阈值阶梯做两次，结果页就会比较这两次测试。它是免费的，因为给训练收费，会把唯一诚实的问题，也就是你的耳朵到底有没有变化，关进一堵墙后面。这种比较对照的是先测出来的噪声下限，所以小于这项测试自身前后起伏的差别，会被报告为没有变化，不会被当成进步：在音高阶梯上，两次测试要相差大约 3.5 倍，它才会称之为变化。所以大多数重测得到的回答是，这项测试没听出任何变化，这是诚实的回答。",
  "Comparison":
    "比较",
  "Comparison — Ogilby, Milton, and Degrees of Praise":
    "比较：奥格尔比、弥尔顿与称赞的分档",
  "Whoever has seen only one kind of beauty, Hume argued, cannot rank any. Comparison is the ability to assign degrees — and the Prestige Test's own ratings already measure how many you used.":
    "休谟认为，只见过一种美的人，没法给任何美排出高下。比较是给出分档的能力，而名气偏差测试自己的评分，已经测出了你用了多少档。",
  "Eleven degrees are on offer. How many did you actually use?":
    "这里有 11 档可用。你实际用了几档？",
  "Why did Hume compare Ogilby and Milton?":
    "休谟为什么拿奥格尔比和弥尔顿作比较？",
  "Hume's point was that only someone who has weighed many works against each other can assign degrees of merit — a person acquainted with nothing else might genuinely prefer Ogilby, and only breadth of comparison exposes the mistake. The pairing stands for the criterion: ranking requires range.":
    "休谟的意思是，只有把许多作品相互掂量过的人，才能给出高下的分档：一个别的什么都没接触过的人，可能真心偏爱奥格尔比，只有比较的广度才能揭出这个错误。这一对代表的就是这条标准：排出高下，需要见识的范围。",
  "How is comparison measured?":
    "比较是怎么测的？",
  "From the ratings the Prestige Test already collects. It reports how many of the eleven points on the rating scale you actually landed on, and how many pairs of clips you ordered one way blind and the other way round on the second pass — counting only pairs where the labels pushed both clips the same way, so a prestige label cannot explain the change. Both numbers are about one sitting, and neither is compared against anybody else.":
    "用名气偏差测试已经收集的评分。它报告你在评分量表的 11 个分值里实际用到了多少个，以及有多少对录音你在盲听时排成一种顺序、在第二轮排成相反顺序；只计标签把两段录音往同一方向推的配对，所以名气标签解释不了这种变化。两个数字都只关乎一次测试，也都不和任何别人比较。",
  "Is a narrow spread a bad result?":
    "分布窄是不好的结果吗？",
  "No, and the instrument is built so it can never say otherwise. The clips were chosen for licence clarity and genre spread, never for being equally good, so nobody knows how far apart they truly are — a listener who heard them as close together and rated them that way did the task correctly. The count is also read against what an indifferent rater would produce rather than against the top of the scale, because rating sixteen clips at random already lands on about nine distinct values.":
    "不算，这项测试的设计就让它永远不会这样说。选这些录音，看的是许可清楚和体裁分布，从来没有看它们是否同样好，所以没人知道它们实际上相距多远；一位听者如果觉得它们很接近，并照此打分，就是正确地完成了任务。这个计数也要对照随手乱打分的人会得出的结果来读，不去对照量表的上限，因为随机给 16 段录音打分，本来就会落在大约 9 个不同的分值上。",
  "Why does it quote Pitchfork and Robert Christgau?":
    "它为什么引用 Pitchfork 和 Robert Christgau？",
  "As a reference point for what assigning degrees looks like in practice, never as an answer to agree with. Pitchfork's scale offers a hundred and one places to put a record, yet across more than 18,000 reviews the mean was 7.0 and most scores sat between 6.4 and 7.8. Christgau graded from A+ down to E− and, from 1990, stopped using most of the letters below B+. Scoring your agreement with a prestigious critic would contradict the Prestige Test on the same screen, so this product does not do it.":
    "作为给出分档在实践中是什么样子的参照点，从来不作为要去认同的答案。Pitchfork 的量表提供了一百零一个位置来放一张唱片，可是在 18,000 多篇评论里，平均分是 7.0，大多数分数落在 6.4 到 7.8 之间。Christgau 的等级从 A+ 排到 E−，而从 1990 年起，B+ 以下的大部分字母他都不再用了。给你和一位有声望的评论家的一致程度打分，会在同一屏上和名气偏差测试自相矛盾，所以这个产品不这样做。",
  "The Ranking Test":
    "排序测试",
  "The Ranking Test — Do Your Gaps Fall Where a Critic's Did?":
    "排序测试：你的评分差距，是否落在评论家拉开的地方？",
  "Six works a published critic ranked against each other, rated blind. It reports how far apart your ratings fell on the pairs he separated, beside the same figure on the pairs he bracketed together. Agreeing with him is never scored.":
    "6 部作品，一位发表过评论的评论家把它们彼此排过先后，你盲听打分。它报告在他拉开的配对上你的评分相差多远，旁边是在他排得挨在一起的配对上的同一个数字。和他意见一致，从不计分。",
  "A critic ranked six works. Do your gaps fall where his did?":
    "一位评论家给 6 部作品排过先后。你的评分差距，会落在他拉开的地方吗？",
  "What does the Ranking Test actually measure?":
    "排序测试实际测的是什么？",
  "Whether your ratings move where a critic's judgment moved. Michael Tanner ranked twenty-one Beethoven works against each other for BBC Music Magazine; six of them are played here as forty-second excerpts and you rate what you hear. The result is two numbers: the average distance between your two ratings across pairs he placed at least ten positions apart, and the same figure across pairs he placed within three. It is a question about whether you discriminate at all, not about whether you discriminate correctly.":
    "你的评分会不会在评论家的判断拉开的地方拉开。Michael Tanner 为 BBC Music Magazine 把贝多芬的 21 部作品彼此排过先后；这里播放其中 6 部，每部 40 秒片段，你给听到的东西打分。结果是两个数字：在他排得相隔至少 10 位的配对上，你两个评分之间的平均距离；以及在他排得相距 3 位以内的配对上的同一个数字。它问的是你到底有没有区分，并不问你区分得对不对。",
  "Am I being scored on agreeing with the critic?":
    "我和评论家意见一致会被计分吗？",
  "No, and the instrument could not do it if it tried. The only thing it takes from the ranking is the DISTANCE between two positions — never which of the two he placed higher. That sign was never imported, so there is no stored number from which agreement could be worked out afterwards. Preferring the work he ranked lower costs you nothing here. Scoring your agreement with a prestigious critic would also contradict the Prestige Test, which measures being moved by prestige, on the same product.":
    "不会，这项测试就算想这样做也做不到。它从排名里只取两个位置之间的距离，从不取他把两者中的哪一个排得更高。这个方向从来没有导入过，所以事后也没有存下的数字能算出一致程度。偏爱他排得更低的那部作品，在这里不会让你失去什么。给你和一位有声望的评论家的一致程度打分，也会和名气偏差测试自相矛盾，而那项测试测的正是被名气左右，就在同一个产品里。",
  "Why are the two numbers not combined into one?":
    "两个数字为什么不合成一个？",
  "Because nobody can say yet how much of a difference between them is real. The two figures rest on four pairs each, drawn from six clips that appear in several pairs apiece, and nobody has sat this instrument twice, so its wobble has never been measured. There is no honest size at which the gap between the numbers becomes a result, so none is offered — you get both figures and the number an indifferent rater would produce, which is the same on both kinds of pair because chance does not know which works a critic separated.":
    "因为还没人能说它们之间的差别有多少是真的。两个数字各自只建立在 4 对上，取自 6 段录音，每段都出现在好几对里，而且还没有人做过两次，所以它的起伏从未被测量过。差距大到多少才算一个结果，没有诚实的答案，所以不给：你得到两个数字，以及随手乱打分的人会得出的数字；这个数字在两类配对上相同，因为随机不知道评论家拉开了哪些作品。",
  "What happens if I already know the music?":
    "如果我已经知道这段音乐呢？",
  "You say so, before you rate it, and the clip is removed. Recognising a famous work means part of your rating is memory of a reputation rather than what you just heard — which is the thing the Prestige Test measures on purpose and this one must not measure by accident. It is taken on your word alone: nothing checks, and what you recognised is never reported as a fact about you. If too little is left, you get no number and a plain statement of why, rather than a smaller one.":
    "在打分之前说出来，这段录音就会被剔除。认出一部名作，意味着你的评分有一部分是对名声的记忆，并非你刚才听到的东西；这正是名气偏差测试有意去测、而这一项绝不能意外测到的东西。它只凭你的话：没有任何核查，你认出了什么也从不会被报告为关于你的事实。如果剩下的太少，你得不到数字，只会得到一句照直说明原因的话，不会得到一个更小的数字。",
  "Is a small number a poor result?":
    "数字小是不好的结果吗？",
  "No. Six recordings of six different works were never spaced out by quality, and if they genuinely sounded close to you then rating them close was the accurate thing to do. The recordings also differ in brightness by about ten kilohertz for reasons no ranking caused — one source is a 128 kbps mp3 that stops at 8,624 Hz. That difference is measurably larger across the pairs the critic bracketed together than across the ones he separated, which means it works against the instrument finding anything rather than for it.":
    "算不上坏结果。6 部不同作品的 6 段录音，从来没有按质量拉开距离；如果你听来它们确实很接近，那么把它们打得很接近就是准确的做法。这些录音在亮度上也相差大约 10 千赫，原因与任何排名无关：其中一个来源是 128 kbps 的 mp3，在 8,624 Hz 就截止了。实测下来，这种差别在评论家排得挨在一起的配对上，比在他拉开的配对上更大，这意味着它只会让这项测试更难发现什么，不会帮它发现。",
  "Why forty seconds, when the other instruments use twenty?":
    "为什么是 40 秒，其他测试用的是 20 秒？",
  "Because a critic's verdict is on a whole work, and some of these run forty minutes. A twenty-second excerpt could not carry that at all; forty seconds is a mitigation rather than a fix, and the limit is published rather than hidden. The window itself is chosen by measurement — the pipeline renders candidates and keeps the first one that passes its fitness gates, which on one source took twenty-three attempts because the work is short variations separated by pauses.":
    "因为评论家的评判针对的是整部作品，而其中有些长达 40 分钟。20 秒的片段根本承载不了这些；40 秒是缓解，并非解决，这个限制是公开的，没有藏起来。片段本身是靠测量选出来的：处理流程渲染候选片段，保留第一个通过适配检查的，有一个来源试了 23 次，因为那部作品是一段段被停顿隔开的短变奏。",
  "Good sense":
    "良好的判断力",
  "Good Sense — Calibration as a Number":
    "良好的判断力：把校准变成一个数字",
  "Hume's good sense checks the other faculties: knowing when your own judgment is trustworthy. Confidence-versus-accuracy calibration turns it into a computed curve.":
    "休谟所说的良好判断力，监督着其他能力：知道自己的判断什么时候可信。把握与准确率的校准，把它变成一条算出来的曲线。",
  "Do you know when you're right? That's measurable too.":
    "你知道自己什么时候是对的吗？这也能测。",
  "What is good sense in Hume's essay?":
    "休谟文章里的「良好的判断力」是什么？",
  "The supervising faculty: reason keeping the judge's other capacities honest — noticing purpose, consistency, and context, and guarding against one's own errors. A judge with delicate perception but no sense of when to trust it still judges badly.":
    "监督性的能力：理性让评判者的其他能力保持诚实，留意目的、一致性和背景，并防备自己的错误。一位感知灵敏、却不知道什么时候该信任这种感知的评判者，照样会判断失误。",
  "How does calibration measure good sense?":
    "校准怎样测量良好的判断力？",
  "On performance items you attach a confidence level (95%, 70%, or 50%) to each answer. Plotting confidence against actual accuracy yields a calibration curve, and Brier scores summarize it: well-calibrated judges are right about as often as they claim to be. Overconfidence and underconfidence both show up as measured distances from the diagonal.":
    "在表现类题目上，你给每个答案附上一个把握程度（95%、70% 或 50%）。把把握和实际准确率画在一起，就得到一条校准曲线，布里尔分数（Brier score）概括了它：校准得好的评判者，对的次数和他们声称的差不多。过度自信和信心不足，都会表现为离对角线的一段测得的距离。",
  "Methodology":
    "方法论",
  "Methodology — Quantifying Hume's Standard of Taste":
    "方法论：把休谟关于品味的标准量化",
  "Performance tasks over self-report, the user as their own control, deterministic scoring in code, and a psychometrics pipeline: how the Taste Gym measures without fabricating.":
    "用表现类任务取代自我报告，让用户做自己的对照组，在代码里确定性地计分，再加一条心理测量流程：品味训练馆怎样测量而不编造。",
  "The measurement design, stated plainly — including what we refuse to claim.":
    "测量设计，照直写出来，包括我们拒绝声称的东西。",
  "Why performance tasks instead of a questionnaire?":
    "为什么用表现类任务，不用问卷？",
  "Self-report measures self-image. On a performance task you can be wrong, and being wrong is informative: the prestige gap, the detection rate, and the calibration curve are all computed from what you did, not what you said about yourself.":
    "自我报告测的是自我形象。在表现类任务上你可能答错，而答错本身就有信息：名气差距、识别率和校准曲线，都由你做了什么算出，并非由你怎么描述自己算出。",
  "Does an AI score my taste?":
    "是 AI 在给我的品味打分吗？",
  "No. Every score is computed by a deterministic engine in code — the same inputs always produce the same number, and the scoring rules are inspectable. No model classifies you.":
    "没有。每一个分数都由代码里的确定性引擎算出：同样的输入永远得出同样的数字，计分规则可以查看。没有任何模型给你分类。",
  "Where do the norms come from?":
    "常模从哪里来？",
  "From real sessions, and only from real sessions. Until a calibration cohort exists, every result is labeled provisional and no percentile is shown. Published statistics will state their N. This is a hard rule, not a disclaimer.":
    "来自真实的测试，而且只来自真实的测试。在校准样本人群出现之前，每个结果都标为暂定，也不显示任何百分位。公布的统计数字都会写明 N。这是一条硬性规定，并非免责声明。",
  "What data does the Taste Gym collect?":
    "品味训练馆收集什么数据？",
  "Anonymized response vectors: ratings, listen durations, item-pool version, and computed scores, keyed to a random per-session id. No account, no name, no email, no third-party tracking cookies.":
    "匿名的作答向量：评分、收听时长、题库版本和算出的分数，关联到一个随机的每次测试编号。没有账户，没有姓名，没有邮箱，没有第三方追踪 Cookie。",
  "The locked machine: can your ears find the key in the wine?":
    "未开放的机器：你的耳朵能找到酒里的钥匙吗？",
  "How will the Delicacy Trials work?":
    "细辨测试将会怎么做？",
  "When do the Delicacy Trials open?":
    "细辨测试什么时候开放？",
  "The battery is built after the Prestige Test and is visible in the gym now as a locked tier. A gym has equipment you can see before you're ready for it.":
    "这组测试建在名气偏差测试之后，现在已经作为未开放的一层出现在训练馆里。训练馆里总有你还没准备好、却已经看得见的器材。",
  "The Library — Standard of Taste":
    "资料室 · 鉴衡",
  "How the Taste Gym measures taste: Hume's five criteria, the Prestige Test, the Delicacy Trials, and the methodology — stated plainly, including what we refuse to claim.":
    "品味训练馆怎样测量品味：休谟的五条标准、名气偏差测试、细辨测试，以及方法论，都照直写出来，包括我们拒绝声称的东西。",
  "Hume's five criteria of taste, and the instruments that turn them into measured numbers.":
    "休谟关于品味的五条标准，以及把它们变成测量数字的测试。",
  "THE LIBRARY":
    "资料室（The Library）",
  "The gym has a library.":
    "训练馆有一间资料室。",
  "In 1757 David Hume wrote {em} and named the five things a true judge needs: delicacy, practice, comparison, freedom from prejudice, and good sense. He never got to measure any of them. We built the machines. These pages explain each criterion, the instrument that operationalizes it, and the methodology — including the claims we deliberately refuse to make.":
    "1757 年，大卫·休谟写了{em}，列出一位真正的评判者需要的五样东西：鉴赏力（delicacy of taste）、练习、比较、不受偏见左右（freedom from prejudice），以及良好的判断力（good sense）。他从来没能测量其中任何一样。我们造出了这些机器。这些页面解释每一条标准、把它变成可测操作的测试，以及方法论，包括我们刻意拒绝作出的那些声称。",
  "Of the Standard of Taste":
    "《论品味的标准》（Of the Standard of Taste）",
  "Enough reading — the machines are through here.":
    "读够了：机器在这边。",
  "MACHINE 01 · THE FLAGSHIP":
    "第 01 台机器 · 旗舰",
  "HUME'S CRITERIA · FREEDOM FROM PREJUDICE":
    "休谟的标准 · 不受偏见左右（freedom from prejudice）",
  "HUME'S CRITERIA · DELICACY":
    "休谟的标准 · 鉴赏力（delicacy of taste）",
  "HUME'S CRITERIA · PRACTICE":
    "休谟的标准 · 练习",
  "HUME'S CRITERIA · GOOD SENSE":
    "休谟的标准 · 良好的判断力（good sense）",
  "The Prestige Test measures one thing: {strong}. Not whether you like the right music — whether the label in the room changes what your ears report.":
    "名气偏差测试（Prestige Test）只测一件事：{strong}。它不看你喜不喜欢对的音乐，只看屋里的标签会不会改变你耳朵的报告。",
  "how far a famous name can move your ratings":
    "一个有名的名字能把你的评分挪动多远",
  "The design is a within-subject experiment, about {minutes} minutes long. You hear {count} short clips and rate each one {blind} — no artist, no context, just sound. Then you hear the same {count} clips again with names and reputations attached, and rate them again. Your score is computed from the gap between the two passes: the share of your rating movement that flowed {toward} the labels.":
    "这个设计是一个被试内实验，大约 {minutes} 分钟。你听 {count} 段短录音，每段都{blind}打分：没有艺术家，没有背景，只有声音。然后你再听同样这 {count} 段，这次带着名字和名声，再打一次分。你的分数由两轮之间的差距算出：你的评分移动里，有多大比例是{toward}标签去的。",
  "blind":
    "盲听",
  "toward":
    "朝着",
  "Here is the part that makes it an instrument instead of a party trick: {strong} A modest work arrives wearing borrowed acclaim; a distinguished one arrives dressed down. If your ratings follow the labels even when the labels lie, the movement can't be explained by the music — only by the prestige. You serve as your own control, which is why the test needs no external ground truth about which clip is \"objectively better.\"":
    "下面这一点，让它成了一件测量仪器，算不上派对把戏：{strong}一件平庸的作品披着借来的赞誉登场；一件出色的作品却穿得朴素。如果标签说谎时你的评分仍然跟着标签走，这个移动就没法用音乐解释，只能用名气解释。你自己就是自己的对照组，所以这项测试不需要任何关于哪段录音「客观上更好」的外部标准答案。",
  "{swapped} of the {labeled} labels are deliberately false.":
    "{labeled} 个标签里有 {swapped} 个是故意写错的。",
  "{count} of the {total} clips are {controls}: they carry no label in either pass. They measure how much your ratings drift on a plain second listen — memory, familiarity, fatigue — and that measured drift is corrected out of your headline number. The obvious objection to any re-rating design, \"the second pass just tests memory,\" is thereby a published control rather than a caveat.":
    "{total} 段录音中有 {count} 段是{controls}：它们在任何一轮里都不带标签。它们测量你的评分在单纯重听时漂移了多少（记忆、熟悉感、疲劳），这个测得的漂移会从你的主数字里校正掉。任何重复打分设计都会遇到的那个明显的反对意见，「第二轮只是在测记忆」，于是成了一个公开的对照组，并非一条附注。",
  "controls":
    "对照组",
  "Every swap is confessed. The test ends with a {strong} that names each false label, shows the true attribution, and shows exactly what your ratings did when the name was a lie. You cannot exit around it. An instrument built on deception owes you the disclosure — and the disclosure is the part worth staying for.":
    "每一次调换都会坦白。测试以一份{strong}结束，它点出每一个假标签，给出真实的出处，并准确展示名字为假时你的评分做了什么。你没法绕过它离开。一件建立在欺骗上的仪器，欠你这份披露，而这份披露也正是值得留下来看的部分。",
  "mandatory debrief":
    "必读的结果说明",
  "Your result is a measured number, not a diagnosis. And until enough real sessions exist to compute honest norms, it is labeled {provisional} — no invented percentiles, no \"better than 73% of listeners.\" The philosophy behind the design is Hume's criterion of {freedom}; the measurement principles are laid out in the {methodology}.":
    "你的结果是一个测出来的数字，并非诊断。在真实的测试多到足以算出诚实的常模之前，它都标为{provisional}：没有编造的百分位，也没有「比 73% 的听者更好」这种话。这个设计背后的理念，是休谟的{freedom}这条标准；测量原则写在{methodology}里。",
  "provisional":
    "暂定",
  "freedom from prejudice":
    "不受偏见左右（freedom from prejudice）",
  "methodology":
    "方法论",
  "Of Hume's five criteria, this is the one about contamination. A judge, he argued, must keep the mind {quote} and let nothing into the verdict except the object itself — not the author's reputation, not the fashion of the moment, not loyalty, not rivalry. The judgment should belong to the work, and works don't have names until someone attaches one.":
    "休谟的五条标准里，这一条关乎污染。他主张，评判者必须让心灵{quote}，除了对象本身，什么都不放进评判：作者的名声、一时的潮流、忠诚、竞争，都不行。判断应当属于作品，而作品在有人给它贴上名字之前，本来没有名字。",
  "\"free from all prejudice\"":
    "「不受任何偏见左右」",
  "Hume was blunt about how rarely anyone manages this. Reputation arrives before the art does; by the time you press play on an acclaimed record, the acclaim has already voted. The striking thing is that in 1757 he described what is now a replicated experimental finding: attach a prestigious label to a work and evaluations move, even when the label is false. Wine tastes better wearing an expensive price tag; the same manuscript reads worse under an unknown byline.":
    "休谟直言，能做到这一点的人少之又少。名声总比艺术先到；等你按下一张备受赞誉的唱片的播放键，赞誉早就投过票了。惊人的是，他在 1757 年描述的，正是今天一个已被重复验证的实验发现：给作品贴上有声望的标签，评价就会移动，即使标签是假的。贴着昂贵价签的酒尝起来更好；同一份稿子署上无名作者的名字，读起来就更差。",
  "Most people, asked whether they judge music by the name on it, say no. That answer is worthless — not because people lie, but because prejudice doesn't announce itself to the person having it. The only honest way to know is to be caught in the act.":
    "问大多数人会不会凭名字评判音乐，他们都说不会。这个回答毫无价值：原因在于偏见从来不会向怀着它的人自报家门，与人们说不说谎无关。唯一诚实的办法，是当场被抓个正着。",
  "That is the entire design brief of {link}: same clips, rated blind and then labeled, with some labels deliberately swapped. When your rating follows a false name, prejudice is the only suspect left in the room. The gap between your two passes is Hume's criterion turned into a number — and because you are your own control, the number never depends on anyone's opinion of what the \"right\" rating was.":
    "这就是{link}的全部设计要求：同样的录音，先盲听打分，再带标签打分，其中一些标签故意调换。当你的评分跟着一个假名字走，屋里剩下的嫌疑人就只有偏见。你两轮之间的差距，就是休谟的标准变成的数字；而且因为你自己就是自己的对照组，这个数字从不取决于任何人对「正确」评分的看法。",
  "the Prestige Test":
    "名气偏差测试（Prestige Test）",
  "Freedom from prejudice is the first criterion the gym measures, but it is one of five. The others — {delicacy}, {practice}, {comparison}, and {goodsense} — each have a machine of their own.":
    "不受偏见左右是训练馆测量的第一条标准，但它只是五条之一。其余的几条，{delicacy}、{practice}、{comparison}和{goodsense}，各有自己的机器。",
  "delicacy":
    "鉴赏力（delicacy of taste）",
  "practice":
    "练习",
  "comparison":
    "比较",
  "good sense":
    "良好的判断力（good sense）",
  "Hume anchors delicacy in a story he borrows from {dq}. Two of Sancho's kinsmen are asked to judge a hogshead of wine. One tastes leather in it; the other tastes iron. The company ridicules them — the wine is excellent, everyone else agrees. Then the hogshead is drained, and at the bottom lies {key}.":
    "休谟把鉴赏力落在一个借自{dq}的故事上。桑丘的两位亲戚被请去评一大桶酒。一位尝出里面有皮革味；另一位尝出铁味。在场的人都嘲笑他们：酒好极了，别人都这么说。后来酒桶喝空了，桶底躺着{key}。",
  "Don Quixote":
    "《堂吉诃德》",
  "an old key on a leathern thong":
    "一把拴着皮绳的旧钥匙",
  "The point of the story is not that the kinsmen had refined opinions. It's that their perception was {verifiable}. There was a fact at the bottom of the barrel, and their palates found it while everyone else's missed it. Delicacy, in Hume's account, is exactly this: the capacity to register fine ingredients in a composition that most perceivers never notice — and the key in the wine is what separates delicacy from pretension. A claim of fine taste that can never be checked is just a claim.":
    "这个故事的重点并非那些亲戚的见解有多精致。它的重点是，他们的感知是{verifiable}。桶底有一个事实，他们的味觉找到了它，别人的都错过了。在休谟看来，鉴赏力正是这样：能察觉一部作品里大多数人从未注意到的细微成分；而酒里的钥匙，正是把鉴赏力和装腔作势分开的东西。一种永远无法核查的精致品味（taste），只是一句声称。",
  "verifiable":
    "可以核查的",
  "Most taste tests never leave opinion territory, which is why they can't measure delicacy at all. The {trials} are built the other way around: start from recordings in the public domain or under Creative Commons licenses, introduce controlled degradations — {list} — and ask which version is the original and what, precisely, is wrong with the other. Every trial has a key at the bottom of the barrel: {answer}. Difficulty is tunable, so the trials can find the exact threshold where your ears give out, and the items can be calibrated with item-response theory as real response data accumulates.":
    "大多数口味（taste）测试从不离开观点的地盘，所以它们根本测不了鉴赏力。{trials}反过来建：从公有领域或知识共享许可的录音出发，加入受控的损伤，也就是{list}；然后问哪个版本是原版，另一个到底哪里不对。每个试次的桶底都有一把钥匙：{answer}。难度可以调，所以这些试次能找出你的耳朵失灵的确切阈值（threshold），题目也能随着真实作答数据的积累，用项目反应理论（IRT）来校准。",
  "Delicacy Trials":
    "细辨测试（Delicacy Trials）",
  "an objectively correct answer":
    "一个客观上正确的答案",
  "In the gym, the Delicacy Trials are {status} — built after {prestige}. And where prejudice is something to be caught in the act, delicacy is something Hume says training improves — which is what {practice} is for.":
    "在训练馆里，细辨测试是{status}，建在{prestige}之后。偏见要当场抓住，鉴赏力则是休谟所说的训练能提高的东西，这正是{practice}的用处。",
  "machine 02, and they are open":
    "第 02 台机器，已经开放",
  "machine 02, visible and locked until their pool clears validation":
    "第 02 台机器，在题库通过验证之前看得见、进不去",
  "Practice is the criterion that makes this product a {gym} rather than a mirror. Hume is unambiguous: nothing improves the faculty of judging more than {em} — the repeated, attentive survey of works of one kind. Taste, in his account, is not an endowment you check once and frame. It's a capacity that sharpens with reps and dulls with neglect.":
    "练习这条标准，让这个产品成为一个{gym}，算不上一面镜子。休谟说得毫不含糊：没有什么比{em}更能提高判断的能力，也就是对同一类作品反复、专注的审视。在他看来，品味（taste）并非一种查验一次就能裱起来挂着的天赋。它是一种能力，反复练习会变敏锐，荒废了会变迟钝。",
  "gym":
    "训练馆",
  "practice in a particular art":
    "在某一门艺术里的练习",
  "He even describes the beginner's condition: confront a work for the first time and the sentiment it produces is {em} — you can tell you feel something, but not which parts of the work are doing it, or how well. Only repeated encounters let a judge resolve that blur into discrimination: this voicing, that transition, this specific flaw. Anyone who has learned to hear the difference between a good and a great recording of the same piece has lived this.":
    "他甚至描述了初学者的状态：第一次面对一部作品，它引起的感受是{em}的：你知道自己感受到了什么，却说不清是作品的哪些部分在起作用，作用得好不好。只有反复相遇，才能让评判者把那团模糊分辨清楚：这一处声部安排，那一处过渡，这一个具体的瑕疵。凡是学会了听出同一首曲子的好录音和伟大录音之间差别的人，都亲身经历过这一点。",
  "obscure and confused":
    "模糊而混乱",
  "The gym takes the claim literally, with the same honesty rule as everything else: an improvement you can't measure is an improvement you can't claim. Sit a threshold ladder twice in the same browser and the result screen compares the two — {strong}, so that a difference smaller than the instrument's own run-to-run wobble is reported as no change rather than as progress.":
    "训练馆按字面去理解这个主张，并遵守和其他一切相同的诚实规则：测不出的进步，就不能声称。在同一个浏览器里把阈值（threshold）阶梯做两次，结果页会把两次相互比较，{strong}，所以小于这项测试自身前后起伏的差别，会被报告为没有变化，不会被当成进步。",
  "against a noise floor we measured first":
    "对照的是我们先测出来的噪声下限",
  "That floor is high, and saying so is the point. Two sittings on the pitch ladder have to differ by roughly {times} before the arc will call it movement; on the prestige test the label's pull has to shift by {points} points of the scale. Most retests are therefore told that nothing changed the instrument could hear — which is the honest answer, and the reason the sentence names what it would have taken instead of leaving you to guess. The delicacy trials get no arc at all: {trials} pairs cannot resolve a change smaller than {items} of them, so that screen says so and points here.":
    "这个下限很高，照直说出来正是重点。音高阶梯上的两次测试要相差大约{times}，训练线（arc）才会称之为变化；在名气偏差测试（Prestige Test）里，标签的拉力要移动 {points} 个量表分。所以大多数重测得到的回答是，这项测试没听出任何变化；这是诚实的回答，也是为什么那句话会说出需要多大的变化，不让你去猜。细辨测试（Delicacy Trials）根本没有训练线：{trials} 对试次分辨不出小于 {items} 对的变化，所以那一屏就照直说明，并指到这里。",
  "{n} times":
    "{n} 倍",
  "What a second sitting genuinely buys is {precision}. The wobble of an average falls as the square root of the number of sittings, so the more often you come back, the smaller a real change has to be before this can see it. That is the whole return: not a badge or a streak, but a number that gets harder to argue with.":
    "第二次测试真正换来的是{precision}。平均值的起伏会随测试次数的平方根下降，所以你回来得越多，真实的变化只需更小，这里就能看见。这就是全部的回报：没有徽章，没有连续打卡，只有一个越来越难反驳的数字。",
  "precision":
    "精度",
  "Practice alone isn't sufficient, though. Hume pairs it with breadth — you can rehearse one narrow corner of music forever and stay a provincial judge. That failure mode belongs to {comparison}, and knowing whether to trust your own sharpening judgment belongs to {goodsense}. The gym starts where prejudice is caught in the act: {prestige}.":
    "不过，单靠练习还不够。休谟把它和广度配在一起：你可以永远只在音乐的一个小角落里反复练习，结果仍是一个眼界狭窄的评判者。这种失败归{comparison}管，而知道能不能信任自己越来越敏锐的判断，归{goodsense}管。训练馆从偏见被当场抓住的地方开始：{prestige}。",
  "Good sense is Hume's supervising faculty — reason, standing behind perception and checking its work. The other criteria can all misfire without it: delicate ears with no judgment about when to trust themselves, practice that rehearses a bias into a habit, breadth that collects exposure without weighing it. Good sense is the part of a judge that knows {strong}.":
    "良好的判断力是休谟所说的监督能力：理性站在感知背后，检查它的工作。没有它，其他标准都可能失灵：耳朵灵敏，却不知道什么时候该信自己；练习把一种偏差练成了习惯；广度收集了大量接触，却从不掂量。良好的判断力，是评判者身上知道{strong}的那一部分。",
  "when their own verdict is reliable and when it isn't":
    "自己的评判什么时候可靠、什么时候不可靠",
  "That sounds unmeasurable — a faculty about faculties. It isn't. Decision science has a precise, boring name for it: {calibration}. A judge is well calibrated when their confidence matches their accuracy — when the answers they'd stake 95% on are right about 95% of the time, and the coin-flip feelings are right about half the time. Overconfidence and underconfidence are both failures of exactly the thing Hume was pointing at: knowing the reliability of your own judgment.":
    "这听起来没法测量：一种关于能力的能力。其实能测。决策科学给它起了一个精确而乏味的名字：{calibration}。当一位评判者的把握和准确率相符，也就是他愿意押上 95% 的答案，大约 95% 的时候是对的，而那些像抛硬币一样的感觉，大约一半时候是对的，他就校准得很好。过度自信和信心不足，都正是休谟所指的那件事的失败：知道自己判断的可靠程度。",
  "calibration":
    "校准",
  "So the gym measures it. On performance items — trials with objectively right answers, like the {delicacy} — you attach a confidence level to each answer: {levels}. Plot claimed confidence against actual accuracy and you get a calibration curve; a Brier score summarizes how far you sit from the diagonal where confidence and reality agree. The result is Hume's most abstract criterion turned into arithmetic: a curve you can read, and one number for how far it sits from the line.":
    "所以训练馆测量它。在表现类题目上，也就是有客观正确答案的试次，比如{delicacy}，你给每个答案附上一个把握程度：{levels}。把自报的把握和实际的准确率画在一起，就得到一条校准曲线；布里尔分数（Brier score）概括了你离把握与现实一致的那条对角线有多远。结果就是休谟最抽象的一条标准变成了算术：一条你能读懂的曲线，和一个表示它离那条线多远的数字。",
  "95%, 70%, or 50%":
    "95%、70% 或 50%",
  "One honesty note, because it's the house rule: confidence input never inflates or weights your scores — it's measured {against} your accuracy, never blended into it. A confident wrong answer costs you calibration; it cannot buy you points. The gym opens with {prestige}; the full measurement rules live in the {methodology}.":
    "说明一件诚实的事，因为这是这里的规矩：你输入的把握从不抬高你的分数，也不给它加权；它是{against}你的准确率来测量的，从不掺进去。一个有把握的错误答案，会让你在校准上失分；它买不来分数。训练馆从{prestige}开始；完整的测量规则写在{methodology}里。",
  "against":
    "对照着",
  "The argument the reading rests on, with the weakest step marked.":
    "解读（the reading）所依托的论证，最弱的一步已经标出。",
};

export default LIBRARY;
