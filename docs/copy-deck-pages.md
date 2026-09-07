# Page copy deck - for a writing pass

**Generated, do not edit by hand.** `node scripts/export-page-deck.mjs > docs/copy-deck-pages.md`

Every paragraph, heading and caption a reader meets on these pages, pulled from the components that render them. Surfaces are found on disk, so a new page appears here the day it ships.

## How to use this

**This deck is a READING surface, not an editing one, and the other three are both.** They enumerate strings that live in content modules, so an edit lands in one place. This copy sits inline in the page components, so an edit has to be made in the `.tsx` file named under each section. Moving it into modules is real work and was deliberately not done first, because it would have stood between you and this document.

**It is a source scan, so it can drift from what renders.** Braces mark a value the page computes rather than words on screen. Where a page imports its numbers from the modules that compute them, that is deliberate and the slots must stay slots: typing the value in is how a page drifts away from the instrument it describes.

**One rule is not negotiable, and it is on `/legal`.** It may not promise a paid tier and may not describe the product as a personality reading. Both were live false claims until 2026-09-05, on the page a reader opens to find out what they are agreeing to.

---

## `/learn/comparison`

**Edits land in** `src/app/learn/comparison/page.tsx`.

> HUME'S CRITERIA · COMPARISON

> Hume's test case is a pairing nobody now remembers was ever a contest: John Ogilby, a workmanlike seventeenth-century versifier, against John Milton. His point was uncomfortable: a person acquainted with no better poetry might genuinely admire Ogilby — and the admiration would be sincere, felt, and wrong in a way the admirer has no way to detect. By comparison alone, he argued, do we learn to assign degrees of praise; whoever has seen only one kind of beauty cannot rank any.

> Read that carefully and it is not a claim about how much music you have heard. It is a claim about what breadth gives you — degrees. The judge who has weighed many works can say that one is a little better than another and a third is far worse; the judge who has not is left with liking and not-liking, which is not a scale but a floor.

> This page used to promise something else, and the correction is worth stating rather than hiding. It described an optional import of your streaming history and said that breadth was a fact about your listening rather than a skill anyone could test. That version needed a catalogue we would have had to license and a taxonomy we would have had to invent, and it measured what you had been exposed to rather than what you could do with it. The version that shipped measures the thing Hume actually named.

> It reuses a test you have already taken. The Prestige Test asks you to rate {numberWord(CLIPS)} clips blind on a scale of {numberWord(DEGREES_AVAILABLE)} whole numbers, then rate them again with names attached. Those ratings are already on your device, so comparison costs no new clip and no new tap. Two things come out of them: how many of the {numberWord(DEGREES_AVAILABLE)} degrees you actually landed on, and how many pairs you ordered one way blind and the opposite way once the names were time — counting only pairs where the labels pushed both clips the same direction, so a prestige label cannot be the explanation.

> Neither number is a mark out of anything. The count is read against what an indifferent rater would produce rather than against the top of the scale, because rating {numberWord(CLIPS)} clips at random already lands on about {numberWord(BY_CHANCE)} distinct values — the ceiling is reachable by accident, and a reader measuring themselves against it is measuring themselves against nothing.

> What the professionals do with their own scales

> Assigning degrees is not an eighteenth-century abstraction; it is the daily work of music criticism, and its central embarrassment is how few degrees anyone uses. These are quoted as a reference point and never as a target — nobody here is scored against a critic, for a reason given below.

> Ours is {OUR_SCALE.scale} — {numberWord(DEGREES_AVAILABLE)} places to put a clip. The instrument asks only how many of them you used — not whether you used the right ones, because on this question there is no right one.

> Why it never scores you against a critic

> The obvious version of this instrument compares your ranking with a famous reviewer's and tells you how close you got. It is not built, and it is not going to be. The Prestige Test exists to measure how far a prestigious name moves your judgment. Rewarding you for agreeing with a prestigious critic would have this product contradict itself on the same screen — so critics here set the spread and never the answer, and the instrument never says a reader is wrong.

> The honest limit, last, because it matters more than anything above it: these clips were never spaced out by quality. They were chosen for licence clarity and for genre spread, so nobody knows how far apart they truly sit. If they really are close together, hearing them that way is the correct answer — and this instrument cannot tell that apart from a listener who hears everything as much the same. It reports what you did with the scale. It does not grade your ear.

> The measurements themselves, with their formulas and their caveats, are published in the Lab.

*1 further block on this page is filled entirely from content modules, so the words are reviewed in the earlier parts rather than here.*

---

## `/learn/delicacy`

**Edits land in** `src/app/learn/delicacy/page.tsx`.

> HUME'S CRITERIA · DELICACY

> Hume anchors delicacy in a story he borrows from Don Quixote. Two of Sancho's kinsmen are asked to judge a hogshead of wine. One tastes leather in it; the other tastes iron. The company ridicules them — the wine is excellent, everyone else agrees. Then the hogshead is drained, and at the bottom lies an old key on a leathern thong.

> The point of the story is not that the kinsmen had refined opinions. It's that their perception was verifiable. There was a fact at the bottom of the barrel, and their palates found it while everyone else's missed it. Delicacy, in Hume's account, is exactly this: the capacity to register fine ingredients in a composition that most perceivers never notice — and the key in the wine is what separates delicacy from pretension. A claim of fine taste that can never be checked is just a claim.

> Most taste tests never leave opinion territory, which is why they can't measure delicacy at all. The Delicacy Trials are built the other way around: start from recordings in the public domain or under Creative Commons licenses, introduce controlled degradations — {flawFamilyList()} — and ask which version is the original and what, precisely, is wrong with the other. Every trial has a key at the bottom of the barrel: an objectively correct answer. Difficulty is tunable, so the trials can find the exact threshold where your ears give out, and the items can be calibrated with item-response theory as real response data accumulates.

> In the gym, the Delicacy Trials are {DELICACY_LIVE ? "machine 02, and they are open" : "machine 02, visible and locked until their pool clears validation"} — built after the Prestige Test. And where prejudice is something to be caught in the act, delicacy is something Hume says training improves — which is what practice is for.

---

## `/learn/flaws`

**Edits land in** `src/app/learn/flaws/page.tsx`.

> REFERENCE · WHAT THE GYM CAN MEASURE

> Measured in {f.unit} by {machineLinks(f.machines)}. {f.plainUnit}

*5 further blocks on this page are filled entirely from content modules, so the words are reviewed in the earlier parts rather than here.*

---

## `/learn/freedom-from-prejudice`

**Edits land in** `src/app/learn/freedom-from-prejudice/page.tsx`.

> HUME'S CRITERIA · FREEDOM FROM PREJUDICE

> Of Hume's five criteria, this is the one about contamination. A judge, he argued, must keep the mind "free from all prejudice" and let nothing into the verdict except the object itself — not the author's reputation, not the fashion of the moment, not loyalty, not rivalry. The judgment should belong to the work, and works don't have names until someone attaches one.

> Hume was blunt about how rarely anyone manages this. Reputation arrives before the art does; by the time you press play on an acclaimed record, the acclaim has already voted. The striking thing is that in 1757 he described what is now a replicated experimental finding: attach a prestigious label to a work and evaluations move, even when the label is false. Wine tastes better wearing an expensive price tag; the same manuscript reads worse under an unknown byline.

> Most people, asked whether they judge music by the name on it, say no. That answer is worthless — not because people lie, but because prejudice doesn't announce itself to the person having it. The only honest way to know is to be caught in the act.

> That is the entire design brief of the Prestige Test: same clips, rated blind and then labeled, with some labels deliberately swapped. When your rating follows a false name, prejudice is the only suspect left in the room. The gap between your two passes is Hume's criterion turned into a number — and because you are your own control, the number never depends on anyone's opinion of what the "right" rating was.

> Freedom from prejudice is the first criterion the gym measures, but it is one of five. The others — delicacy, practice, comparison, and good sense — each have a machine of their own.

---

## `/learn/good-sense`

**Edits land in** `src/app/learn/good-sense/page.tsx`.

> HUME'S CRITERIA · GOOD SENSE

> Good sense is Hume's supervising faculty — reason, standing behind perception and checking its work. The other criteria can all misfire without it: delicate ears with no judgment about when to trust themselves, practice that rehearses a bias into a habit, breadth that collects exposure without weighing it. Good sense is the part of a judge that knows when their own verdict is reliable and when it isn't.

> That sounds unmeasurable — a faculty about faculties. It isn't. Decision science has a precise, boring name for it: calibration. A judge is well calibrated when their confidence matches their accuracy — when the answers they'd stake 95% on are right about 95% of the time, and the coin-flip feelings are right about half the time. Overconfidence and underconfidence are both failures of exactly the thing Hume was pointing at: knowing the reliability of your own judgment.

> So the gym measures it. On performance items — trials with objectively right answers, like the Delicacy Trials — you attach a confidence level to each answer: 95%, 70%, or 50%. Plot claimed confidence against actual accuracy and you get a calibration curve; a Brier score summarizes how far you sit from the diagonal where confidence and reality agree. The result is Hume's most abstract criterion turned into arithmetic: a curve you can read, and one number for how far it sits from the line.

> One honesty note, because it's the house rule: confidence input never inflates or weights your scores — it's measured against your accuracy, never blended into it. A confident wrong answer costs you calibration; it cannot buy you points. The gym opens with the Prestige Test; the full measurement rules live in the methodology.

---

## `/learn/methodology`

**Edits land in** `src/app/learn/methodology/page.tsx`.

> THE HOUSE RULES · METHODOLOGY

> Hume closed his essay with a job description: strong sense, delicate sentiment, improved by practice, perfected by comparison, cleared of prejudice — that is a true judge. The Taste Gym's methodology is that sentence turned into engineering constraints.

> 1. Performance over self-report. Every instrument is a task where you can be wrong. Questionnaires measure your self-image; tasks measure what you actually did. The prestige gap is computed from what your ratings did under false labels; delicacy from whether you found the planted flaw; good sense from whether your confidence matched your accuracy. Nothing asks you to describe your taste, because that answer was never evidence.

> 2. The user is their own control. Wherever possible the design is within-subject: your labeled ratings are compared to your blind ratings, your retest to your baseline. This removes the need for an external ground truth about which music is good — the instrument never has to take a side in that argument to measure your movement within it. The Prestige Test additionally carries unlabeled control clips, rated in both passes and labeled in neither: they measure each user's plain second-pass drift (memory, familiarity, regression), and the headline score subtracts the residual that drift would leave in it.

> 3. Deterministic scoring, in code. Every number is computed by a scoring engine whose rules are fixed and inspectable — same responses, same score, every time. No language model classifies you, no black box guesses. Where an AI writes narrative around a result, it narrates a number that was already computed and cannot change it.

> 4. No number the data can't back. Until a real calibration cohort exists, results carry a provisional label and no percentile appears anywhere in the product. As sessions accumulate, the psychometrics are standard and open about their assumptions: item-response theory for item difficulty and discrimination, signal-detection analysis for the trials, calibration curves and Brier scores for confidence, reliability checks before any norm is published — always with its N attached.

> 5. The rulers were not invented here. Every figure above is simulated and the cohort is zero, so this product cannot argue from data about people. What it can show is where its measuring apparatus came from — which was published practice all along, uncredited until now.

> {degreesConvergenceLine()} That last number is the comparison reading, and it is the only place in this product where a professional's scale appears beside your own. It is a reference point and never a target: agreement with a critic is not scored here, because the Prestige Test measures being moved by a prestigious name and rewarding that agreement would contradict it on the same screen.

> The analytics dataset behind this — a different store from the one on your device — is self-generated and boring by design: anonymized response vectors under a random session id, carrying ratings, listen times, item-pool version and the scores computed from them. No accounts, no names, no ad-tech. Your browser keeps only your raw answers, never a score; the two are separate on purpose, and the terms say which is which. It exists so the instruments can be calibrated honestly, and that's the whole job. The criteria these rules serve are in the reading room — start with freedom from prejudice — or skip the theory and take the Prestige Test.

*2 further blocks on this page are filled entirely from content modules, so the words are reviewed in the earlier parts rather than here.*

---

## `/learn/practice`

**Edits land in** `src/app/learn/practice/page.tsx`.

> HUME'S CRITERIA · PRACTICE

> Practice is the criterion that makes this product a gym rather than a mirror. Hume is unambiguous: nothing improves the faculty of judging more than practice in a particular art — the repeated, attentive survey of works of one kind. Taste, in his account, is not an endowment you check once and frame. It's a capacity that sharpens with reps and dulls with neglect.

> He even describes the beginner's condition: confront a work for the first time and the sentiment it produces is obscure and confused — you can tell you feel something, but not which parts of the work are doing it, or how well. Only repeated encounters let a judge resolve that blur into discrimination: this voicing, that transition, this specific flaw. Anyone who has learned to hear the difference between a good and a great recording of the same piece has lived this.

> The gym takes the claim literally, with the same honesty rule as everything else: an improvement you can't measure is an improvement you can't claim. Sit a threshold ladder twice in the same browser and the result screen compares the two — against a noise floor we measured first, so that a difference smaller than the instrument's own run-to-run wobble is reported as no change rather than as progress.

> That floor is high, and saying so is the point. Two sittings on the pitch ladder have to differ by roughly {PITCH_FLOOR_TIMES} times before the arc will call it movement; on the prestige test the label's pull has to shift by {numberWord(BIAS_FLOOR_POINTS)} points of the scale. Most retests are therefore told that nothing changed the instrument could hear — which is the honest answer, and the reason the sentence names what it would have taken instead of leaving you to guess. The delicacy trials get no arc at all: {numberWord(DELICACY_ARC_FLOOR.trials)} pairs cannot resolve a change smaller than {numberWord(DELICACY_ARC_FLOOR.itemsToMove)} of them, so that screen says so and points here.

> What a second sitting genuinely buys is precision. The wobble of an average falls as the square root of the number of sittings, so the more often you come back, the smaller a real change has to be before this can see it. That is the whole return: not a badge or a streak, but a number that gets harder to argue with.

> Practice alone isn't sufficient, though. Hume pairs it with breadth — you can rehearse one narrow corner of music forever and stay a provincial judge. That failure mode belongs to comparison, and knowing whether to trust your own sharpening judgment belongs to good sense. The gym starts where prejudice is caught in the act: the Prestige Test.

---

## `/learn/prestige-bias-test`

**Edits land in** `src/app/learn/prestige-bias-test/page.tsx`.

> MACHINE 01 · THE FLAGSHIP

> The Prestige Test measures one thing: how far a famous name can move your ratings. Not whether you like the right music — whether the label in the room changes what your ears report.

> The design is a within-subject experiment, about {BIAS_SESSION_MINUTES} minutes long. You hear {numberWord(BIAS_CLIP_COUNT)} short clips and rate each one blind — no artist, no context, just sound. Then you hear the same {numberWord(BIAS_CLIP_COUNT)} clips again with names and reputations attached, and rate them again. Your score is computed from the gap between the two passes: the share of your rating movement that flowed toward the labels.

> Here is the part that makes it an instrument instead of a party trick: {numberWord(BIAS_SWAPPED_COUNT)} of the {numberWord(BIAS_LABELLED_COUNT)} labels are deliberately false. A modest work arrives wearing borrowed acclaim; a distinguished one arrives dressed down. If your ratings follow the labels even when the labels lie, the movement can't be explained by the music — only by the prestige. You serve as your own control, which is why the test needs no external ground truth about which clip is "objectively better."

> {numberWordLeading(BIAS_CONTROL_COUNT)} of the {numberWord(BIAS_CLIP_COUNT)} clips are controls: they carry no label in either pass. They measure how much your ratings drift on a plain second listen — memory, familiarity, fatigue — and that measured drift is corrected out of your headline number. The obvious objection to any re-rating design, "the second pass just tests memory," is thereby a published control rather than a caveat.

> Every swap is confessed. The test ends with a mandatory debrief that names each false label, shows the true attribution, and shows exactly what your ratings did when the name was a lie. You cannot exit around it. An instrument built on deception owes you the disclosure — and the disclosure is the part worth staying for.

> Your result is a measured number, not a diagnosis. And until enough real sessions exist to compute honest norms, it is labeled provisional — no invented percentiles, no "better than 73% of listeners." The philosophy behind the design is Hume's criterion of freedom from prejudice; the measurement principles are laid out in the methodology.

---

## `/learn/ranking-test`

**Edits land in** `src/app/learn/ranking-test/page.tsx`.

> THE INSTRUMENTS · THE RANKING TEST

> A critic once put twenty-one Beethoven works in order. Michael Tanner did it for BBC Music Magazine, and like every such list it is one person's opinion published under his own name — which is exactly what makes it usable here. It is not a correct answer. It is a second set of gaps to compare yours against.

> {numberWordLeading(WORKS)} of those works are played here, {numberWord(SPREAD_CLIP_SECONDS)} seconds each, with nothing attached: no composer date, no movement title, no hint of where he placed them. You rate what you hear. Afterwards the instrument reports how far apart your two ratings fell across the {numberWord(FAR)} pairs he separated by ten positions or more, and the same figure across the {numberWord(CLOSE)} pairs he placed within three of each other.

> Agreeing with him is not measured, and the instrument could not measure it if it tried. The only thing taken from the ranking is the distance between two positions. Which of the two he put higher was never imported, so there is no stored number from which your agreement could be worked out afterwards — not by us, not later, not by accident. Preferring the work he ranked lower costs you nothing. It would also contradict the Prestige Test, which measures being moved by an authority, to reward being moved by one on the same product.

> Both numbers are read against {BY_CHANCE} points, which is what rating at random produces — and it produces the same figure on both kinds of pair, because chance does not know which works a critic separated. That is the whole reference point. Two figures sitting together near it show no discrimination in this sitting; two that differ show some, on these clips.

> The two numbers are never combined, and the difference between them is never reported. They rest on {numberWord(FAR)} pairs and {numberWord(CLOSE)} pairs, built from clips that appear in several pairs apiece, and nobody has sat this instrument twice — so how far the figures wander on their own has never been measured. There is no honest size at which the gap between them becomes a result. Offering one would be inventing the threshold, which is the failure this product spends its existence refusing.

> If you already know the music, say so before you rate it. Half of any critic's list is famous, and recognising a work means part of your rating is memory of a reputation rather than the last {numberWord(SPREAD_CLIP_SECONDS)} seconds. Those clips are removed before anything is computed. It is taken on your word — nothing checks — and what you recognised is never reported as a fact about you. Recognise enough and you get no number at all, plus a plain statement of why, because the instrument needs at least {numberWord(MIN_PAIRS_PER_KIND)} usable pairs of each kind and will not print a figure it cannot support.

> Two limits are published rather than hidden. A forty-second excerpt cannot carry a critic's verdict on a work that runs forty minutes; {numberWord(SPREAD_CLIP_SECONDS)} seconds is longer than anything else here and is still a mitigation rather than a fix. And these {numberWord(WORKS)} recordings differ in brightness by about ten kilohertz for reasons no ranking caused — one source is a 128 kbps mp3 whose sound stops at 8,624 Hz. Measured, that difference is larger across the pairs he bracketed together than across the ones he separated, so it makes a difference harder to find rather than easier. Both figures, and what they were measured against, are on the Lab.

> Your answers stay in the browser you gave them in, like every other result here — the ratings and which clips you said you already knew, never the two figures, which are worked out again each time they are read. Underneath the result is the raw record: what you gave each of the six, which works they actually were, and the gap you left on every pair that counted. It is the only place the six are named, and reading it is the end of your blind sitting.

---

## `/legal`

**Edits land in** `src/app/legal/page.tsx`.

> THE TASTE GYM

> Plain language, no tricks. Last updated {LEGAL_LAST_UPDATED}.

> What this is

> The Taste Gym measures how you hear music. Each instrument is a listening task with answers you can get objectively wrong, and every number is computed by a deterministic engine in code — no machine-learning model and no language model classifies you. It is not a psychological assessment, not a personality test, not medical or mental-health advice, and not a diagnosis of anything. It does not predict your personality, your mood or your character, and it never claims to. Older readings still reachable here — the music and football quizzes — are entertainment and were never measurements.

> Terms of use

> Everything here is free. There is no paid tier, no subscription and nothing to buy. The only gate is a seven-day wait before repeating an instrument, and that exists because a retest taken sooner measures your memory of the clips rather than your ear.

> Don't use any result here to make decisions about employment, credit, insurance, housing, or anything else that matters that much. It measures how you heard a handful of short clips on one afternoon.

> Footballer names appear only to describe public playing styles. The Taste Gym is not affiliated with, endorsed by, or connected to FIFA, any club, league, or player.

> Don't abuse, reverse-engineer, or resell the service. Be normal.

> Not directed at children under 13.

> No accounts, no user database. There is nothing to sign up for and no record of you on a server. Everything the gym knows about you is in the browser you are reading this in.

> Your sessions are stored on your device. When you finish an instrument we keep your raw answers in this browser's local storage — never a computed score, so nothing here can be edited into a better result. It is what lets a later session say whether your ear moved, and it is why the seven-day retest gate knows you. Switch device or clear your browsing data and it is gone; there is no copy anywhere else.

> Quiz answers in the older music and football readings live in the page URL, so a link you share carries them and nothing else does.

> Artist names you type into the older music reading are sent to our AI provider (Anthropic) solely to write that reading. No instrument in the gym sends anything to a language model: every measured result is computed here, in code.

> We collect anonymised usage events (page views, session completion, shares) through Vercel Web Analytics and PostHog, to see whether the product works. No advertising trackers, no selling data.

> Want anything else gone? There is no server-side record of you to delete, but the button below clears everything this browser holds, and you can contact us ({support ? support : "through the address on the repository"}) with any question about it.

*4 further blocks on this page are filled entirely from content modules, so the words are reviewed in the earlier parts rather than here.*

---

## `/spread (the frame and the hero captions)`

**Edits land in** `src/app/spread/SpreadFlow.tsx`.

> The Ranking Test

> **A critic ranked these works. Do your gaps fall where his did?**

> {numberWordLeading(SPREAD_WORK_COUNT)} pieces of music, {numberWord(SPREAD_CLIP_SECONDS)} seconds each. Rate what you hear, and nothing else. A published critic once ranked all of these against each other — some he placed far apart, some he bracketed together.

> What comes out is two numbers: how far apart your ratings fell on the pairs he separated, and how far apart they fell on the pairs he did not. Agreeing with him is not the point and is not measured. Nothing here can even see which of two works he ranked higher.

> About {numberWord(SPREAD_SESSION_MINUTES)} minutes of listening. Headphones help.

> Listen, then say whether you know it — and only then rate it.

> Had you heard this before?

> Saying yes leaves the clip out of the result. It is never counted against you.

> How good is it?

> The Ranking Test

> **Where your gaps fell**

> across works he placed far apart

> across works he bracketed together

> How this is measured

> Rating at random gives {baseline.toFixed(1)} on both.

*5 further blocks on this page are filled entirely from content modules, so the words are reviewed in the earlier parts rather than here.*

---

**94 blocks, roughly 4295 words, across 11 surfaces.**
