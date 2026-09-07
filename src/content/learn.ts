/**
 * Reading-room registry (2026-07-16 brief §3.C7 — serves C2/N1; voice per D5:
 * Hume narrates, depth is unlocked never buried).
 *
 * One entry per explainer page. The registry feeds the /learn index, the
 * sitemap, and each page's Article/BreadcrumbList/FAQPage JSON-LD, so a new
 * explainer is one entry + one page.tsx and every surface stays in sync.
 *
 * N3: nothing here states a number the data can't support. Methodology
 * numbers arrive when the cohort does.
 */

import { flawFamilyList } from "./flaw-families";
import { DELICACY_LIVE } from "./delicacy/items";
import { numberWord } from "./vocabulary/numbers";
import { numberWordLeading } from "./vocabulary/numbers";
import { ARC_FLOORS, soloFloorFactor } from "@/engine/arc";
import {
  BIAS_CLIP_COUNT,
  BIAS_CLIP_SECONDS,
  BIAS_CONTROL_COUNT,
  BIAS_DEGREES_BY_CHANCE,
  BIAS_LABELLED_COUNT,
  BIAS_SWAPPED_COUNT,
  SPREAD_CLIP_SECONDS,
  SPREAD_WORK_COUNT,
} from "./instrument-shape";

/*
 * THE FAQ STATES THE SAME QUANTITIES THE PAGES DO (E19/S15), and it was missed.
 * E19/S12 derived them across the reading room and reported the job done; the
 * guard it shipped scanned page components only, so every one of these survived
 * in a data module that renders into those same pages. A roster of files is a
 * roster of the places somebody thought to look.
 */
const PITCH_FLOOR_TIMES = (soloFloorFactor("pitch-drift") ?? 0).toFixed(1);

/**
 * The degradation families, derived (E11/S1).
 *
 * This answer used to name four of them by hand, including one the pipeline
 * has never rendered. It had been wrong since before the trials opened, and it
 * is served as an FAQPage JSON-LD answer as well as on the page, so a search
 * engine was being told it too.
 */
const FAMILY_LIST = flawFamilyList();

/**
 * THE READING ROOM DESCRIBED A MACHINE THAT HAD BEEN OPEN FOR TWENTY DAYS (E11/S2).
 *
 * Three strings in this registry called the Delicacy Trials locked, unopened
 * or forthcoming. They were written while that was true and nothing tied them
 * to the flag that stopped it being true, so `DELICACY_LIVE` flipped on
 * 2026-08-08 and the reading room went on advertising a machine you could
 * already walk up to and use.
 *
 * Both states are written out because BOTH ARE REACHABLE: the D3
 * visible-and-locked door is deliberately kept for a pool that has not cleared
 * validation, and the front door and the bias debrief still render it. Copy
 * that reads the flag is the only version that is true in both.
 */

export interface LearnFaq {
  q: string;
  a: string;
}

export interface LearnPage {
  slug: string;
  /** Display title (H1). */
  title: string;
  /** <title> + meta description. */
  metaTitle: string;
  description: string;
  /** Index-card teaser line. */
  teaser: string;
  faq: LearnFaq[];
}

export const LEARN_PAGES: LearnPage[] = [
  {
    slug: "prestige-bias-test",
    title: "What is the Prestige Test?",
    metaTitle: "What is the Prestige Test? — The Taste Gym",
    description:
      `${numberWordLeading(BIAS_CLIP_COUNT)} clips, rated twice — once blind, once with names attached. Some names are deliberately false. The gap between your two ratings is your prestige-bias number.`,
    teaser: "The flagship machine: how far can a famous name move your ratings?",
    faq: [
      {
        q: "How does the Prestige Test work?",
        a: `You rate ${numberWord(BIAS_CLIP_COUNT)} short music clips blind, then rate the same ${numberWord(BIAS_CLIP_COUNT)} clips again — ${numberWord(BIAS_LABELLED_COUNT)} with artist names and reputations attached, ${numberWord(BIAS_CONTROL_COUNT)} deliberately left unlabeled as drift controls. ${numberWord(BIAS_SWAPPED_COUNT)} of the ${numberWord(BIAS_LABELLED_COUNT)} labels are deliberately swapped. Your score is computed from how far your ratings moved toward the labels, corrected by your measured drift on the unlabeled controls — a measured gap, not a self-report.`,
      },
      {
        q: "Why does the test lie about some labels?",
        a: "If every label were true, a rating shift toward acclaimed names could just mean the acclaimed clips were genuinely better. Swapped labels separate the name from the sound: when your rating follows a false name, only prestige can explain the move. Every swap is disclosed on a mandatory debrief screen before you leave — the deception is the instrument, and you always learn the truth.",
      },
      {
        q: "Is my result a percentile?",
        a: "Not yet. Results are labeled provisional until a calibration cohort exists — the product does not fabricate norms. You get your measured gap and what it means; percentiles arrive when there are enough real sessions to compute them honestly.",
      },
      {
        q: "Is the Prestige Test free?",
        a: "Yes, and so is everything else. There is no paid tier here: the assessment, your headline score, and the training arc when it exists are all free. The only gate anywhere in the gym is a seven-day wait before you retake a family of trials — sooner than that and a retest measures your memory of the clips rather than your ear.",
      },
    ],
  },
  {
    slug: "freedom-from-prejudice",
    title: "Freedom from prejudice",
    metaTitle: "Freedom from Prejudice — Hume's Criterion, Measured",
    description:
      "Hume required a true judge to clear their mind of every consideration except the work itself. The Prestige Test measures how far you actually manage it.",
    teaser: "Hume's fourth criterion — the one the flagship machine measures.",
    faq: [
      {
        q: "What did Hume mean by freedom from prejudice?",
        a: "In 'Of the Standard of Taste' (1757), Hume argued a critic must set aside everything about the work except the work — reputation, fashion, friendship, rivalry — and judge only what is in front of them. A judgment moved by the author's name rather than the object is, in his account, corrupted.",
      },
      {
        q: "Can prestige bias be measured?",
        a: "Yes, with a within-subject design: the same person rates the same works with and without labels, and some labels are deliberately false. The rating shift attributable to the label is a measurable quantity. You serve as your own control, so no external ground truth about the music's quality is needed.",
      },
    ],
  },
  {
    slug: "delicacy",
    title: "Delicacy of taste",
    metaTitle: "Delicacy of Taste — The Key in the Wine",
    description:
      "Sancho's kinsmen tasted leather and iron in a hogshead of wine and were laughed at — until the key on a leathern thong was found at the bottom. Delicacy is verifiable perception.",
    teaser: DELICACY_LIVE
      ? "Machine 02: can your ears find the key in the wine?"
      : "The locked machine: can your ears find the key in the wine?",
    faq: [
      {
        q: "What is the key-in-the-wine story?",
        a: "Hume retells it from Don Quixote: two of Sancho's kinsmen judged a wine good but for a faint taste of leather and iron. They were ridiculed — until the hogshead was emptied and an old key on a leathern thong was found at the bottom. Their perception was real and verifiable; that is delicacy.",
      },
      {
        q: DELICACY_LIVE ? "How do the Delicacy Trials work?" : "How will the Delicacy Trials work?",
        a: `Public-domain and Creative-Commons recordings are altered with controlled degradations — ${FAMILY_LIST} — and you identify the original and name the flaw. Unlike a taste quiz, answers are objectively right or wrong, difficulty is tunable, and items can be calibrated with item-response theory.`,
      },
      {
        q: DELICACY_LIVE ? "Where do the Delicacy Trials sit in the gym?" : "When do the Delicacy Trials open?",
        a: DELICACY_LIVE
          ? "They are machine 02, and they are open. The battery was built after the Prestige Test, on the principle that a gym has equipment you can see before you are ready for it — and now you are."
          : "The battery is built after the Prestige Test and is visible in the gym now as a locked tier. A gym has equipment you can see before you're ready for it.",
      },
    ],
  },
  /**
   * THE CREATOR REFERENCE (E11/S3, Track B / blueprint B1).
   *
   * The only page in the reading room addressed to somebody with a broken file
   * rather than to somebody reading about Hume. RT-C(b) put the creator
   * language here and on results, and left the landing page general.
   */
  {
    slug: "flaws",
    title: "Naming what went wrong",
    metaTitle: "Naming what went wrong — The Taste Gym",
    description:
      "Three kinds of audio damage, what each one sounds like, the unit it is measured in, and which machine finds how small a dose of it you can still catch.",
    teaser: "You can hear that it is wrong. Here is what it is called.",
    faq: [
      {
        q: "Can you tell me which flaw is wrecking my track?",
        a: "No. Nothing here listens to your files, and there is nowhere to upload one. What this gives you is the vocabulary — three kinds of damage, what each sounds like, and the machine that measures how small a dose of it your own ears still catch.",
      },
      {
        q: "Why only three?",
        a: `Because three is what the clip pipeline can render as a controlled dose with an objectively correct answer behind it: ${FAMILY_LIST}. Other things go wrong in a mix. They are absent because we cannot measure them yet, not because they do not matter.`,
      },
      {
        q: "If I catch these in the trials, will I catch them in my own work?",
        a: "Unmeasured, so it is not claimed. The instruments report what you caught in these trials, on these recordings, in physical units. Whether that transfers to your own sessions is a question no data here answers.",
      },
    ],
  },
  {
    slug: "practice",
    title: "Practice",
    metaTitle: "Practice — Why Taste Is Trainable",
    description:
      "Hume held that no one is born a judge: facility in judging comes from repeated, attentive encounters with works. Practice is the criterion that makes a taste gym possible.",
    teaser: "The premise of the whole gym: judgment improves with reps.",
    faq: [
      {
        q: "Did Hume think taste could be trained?",
        a: "Yes — explicitly. He wrote that nothing improves the talent of judging more than practice in a particular art, and that a first attempt at judging is always 'obscure and confused.' Delicacy sharpens with use; that claim is why a gym for taste is coherent at all.",
      },
      {
        q: "How does the Taste Gym use practice?",
        a: "Sit a threshold ladder twice in the same browser and the result screen compares the two sittings. It is free, because charging for the training loop would put the one honest question — did your ear actually move — behind a wall. The comparison is judged against a noise floor measured first, so a difference smaller than the instrument's own run-to-run wobble is reported as no change rather than as progress: on the pitch ladder two sittings must differ by roughly ${PITCH_FLOOR_TIMES} times before it will call it movement. Most retests are therefore told that nothing changed the instrument could hear, which is the honest answer.",
      },
    ],
  },
  {
    slug: "comparison",
    title: "Comparison",
    metaTitle: "Comparison — Ogilby, Milton, and Degrees of Praise",
    description:
      "Whoever has seen only one kind of beauty, Hume argued, cannot rank any. Comparison is the ability to assign degrees — and the Prestige Test's own ratings already measure how many you used.",
    teaser: "Eleven degrees are on offer. How many did you actually use?",
    faq: [
      {
        q: "Why did Hume compare Ogilby and Milton?",
        a: "Hume's point was that only someone who has weighed many works against each other can assign degrees of merit — a person acquainted with nothing else might genuinely prefer Ogilby, and only breadth of comparison exposes the mistake. The pairing stands for the criterion: ranking requires range.",
      },
      {
        q: "How is comparison measured?",
        a: "From the ratings the Prestige Test already collects. It reports how many of the eleven points on the rating scale you actually landed on, and how many pairs of clips you ordered one way blind and the other way round on the second pass — counting only pairs where the labels pushed both clips the same way, so a prestige label cannot explain the change. Both numbers are about one sitting, and neither is compared against anybody else.",
      },
      {
        q: "Is a narrow spread a bad result?",
        a: `No, and the instrument is built so it can never say otherwise. The clips were chosen for licence clarity and genre spread, never for being equally good, so nobody knows how far apart they truly are — a listener who heard them as close together and rated them that way did the task correctly. The count is also read against what an indifferent rater would produce rather than against the top of the scale, because rating ${numberWord(BIAS_CLIP_COUNT)} clips at random already lands on about ${numberWord(BIAS_DEGREES_BY_CHANCE)} distinct values.`,
      },
      {
        q: "Why does it quote Pitchfork and Robert Christgau?",
        a: "As a reference point for what assigning degrees looks like in practice, never as an answer to agree with. Pitchfork's scale offers a hundred and one places to put a record, yet across more than 18,000 reviews the mean was 7.0 and most scores sat between 6.4 and 7.8. Christgau graded from A+ down to E− and, from 1990, stopped using most of the letters below B+. Scoring your agreement with a prestigious critic would contradict the Prestige Test on the same screen, so this product does not do it.",
      },
    ],
  },
  {
    slug: "ranking-test",
    title: "The Ranking Test",
    metaTitle: "The Ranking Test — Do Your Gaps Fall Where a Critic's Did?",
    description:
      `${numberWordLeading(SPREAD_WORK_COUNT)} works a published critic ranked against each other, rated blind. It reports how far apart your ratings fell on the pairs he separated, beside the same figure on the pairs he bracketed together. Agreeing with him is never scored.`,
    teaser: `A critic ranked ${numberWord(SPREAD_WORK_COUNT)} works. Do your gaps fall where his did?`,
    faq: [
      {
        q: "What does the Ranking Test actually measure?",
        a: "Whether your ratings move where a critic's judgment moved. Michael Tanner ranked twenty-one Beethoven works against each other for BBC Music Magazine; six of them are played here as forty-second excerpts and you rate what you hear. The result is two numbers: the average distance between your two ratings across pairs he placed at least ten positions apart, and the same figure across pairs he placed within three. It is a question about whether you discriminate at all, not about whether you discriminate correctly.",
      },
      {
        q: "Am I being scored on agreeing with the critic?",
        a: "No, and the instrument could not do it if it tried. The only thing it takes from the ranking is the DISTANCE between two positions — never which of the two he placed higher. That sign was never imported, so there is no stored number from which agreement could be worked out afterwards. Preferring the work he ranked lower costs you nothing here. Scoring your agreement with a prestigious critic would also contradict the Prestige Test, which measures being moved by prestige, on the same product.",
      },
      {
        q: "Why are the two numbers not combined into one?",
        a: "Because nobody can say yet how much of a difference between them is real. The two figures rest on four pairs each, drawn from six clips that appear in several pairs apiece, and nobody has sat this instrument twice, so its wobble has never been measured. There is no honest size at which the gap between the numbers becomes a result, so none is offered — you get both figures and the number an indifferent rater would produce, which is the same on both kinds of pair because chance does not know which works a critic separated.",
      },
      {
        q: "What happens if I already know the music?",
        a: "You say so, before you rate it, and the clip is removed. Recognising a famous work means part of your rating is memory of a reputation rather than what you just heard — which is the thing the Prestige Test measures on purpose and this one must not measure by accident. It is taken on your word alone: nothing checks, and what you recognised is never reported as a fact about you. If too little is left, you get no number and a plain statement of why, rather than a smaller one.",
      },
      {
        q: "Is a small number a poor result?",
        a: `No. ${numberWordLeading(SPREAD_WORK_COUNT)} recordings of ${numberWord(SPREAD_WORK_COUNT)} different works were never spaced out by quality, and if they genuinely sounded close to you then rating them close was the accurate thing to do. The recordings also differ in brightness by about ten kilohertz for reasons no ranking caused — one source is a 128 kbps mp3 that stops at 8,624 Hz. That difference is measurably larger across the pairs the critic bracketed together than across the ones he separated, which means it works against the instrument finding anything rather than for it.`,
      },
      {
        q: `Why ${numberWord(SPREAD_CLIP_SECONDS)} seconds, when the other instruments use ${numberWord(BIAS_CLIP_SECONDS)}?`,
        a: `Because a critic's verdict is on a whole work, and some of these run forty minutes. A ${numberWord(BIAS_CLIP_SECONDS)}-second excerpt could not carry that at all; ${numberWord(SPREAD_CLIP_SECONDS)} seconds is a mitigation rather than a fix, and the limit is published rather than hidden. The window itself is chosen by measurement — the pipeline renders candidates and keeps the first one that passes its fitness gates, which on one source took twenty-three attempts because the work is short variations separated by pauses.`,
      },
    ],
  },
  {
    slug: "good-sense",
    title: "Good sense",
    metaTitle: "Good Sense — Calibration as a Number",
    description:
      "Hume's good sense checks the other faculties: knowing when your own judgment is trustworthy. Confidence-versus-accuracy calibration turns it into a computed curve.",
    teaser: "Do you know when you're right? That's measurable too.",
    faq: [
      {
        q: "What is good sense in Hume's essay?",
        a: "The supervising faculty: reason keeping the judge's other capacities honest — noticing purpose, consistency, and context, and guarding against one's own errors. A judge with delicate perception but no sense of when to trust it still judges badly.",
      },
      {
        q: "How does calibration measure good sense?",
        a: "On performance items you attach a confidence level (95%, 70%, or 50%) to each answer. Plotting confidence against actual accuracy yields a calibration curve, and Brier scores summarize it: well-calibrated judges are right about as often as they claim to be. Overconfidence and underconfidence both show up as measured distances from the diagonal.",
      },
    ],
  },
  {
    slug: "methodology",
    title: "Methodology",
    metaTitle: "Methodology — Quantifying Hume's Standard of Taste",
    description:
      "Performance tasks over self-report, the user as their own control, deterministic scoring in code, and a psychometrics pipeline: how the Taste Gym measures without fabricating.",
    teaser: "The measurement design, stated plainly — including what we refuse to claim.",
    faq: [
      {
        q: "Why performance tasks instead of a questionnaire?",
        a: "Self-report measures self-image. On a performance task you can be wrong, and being wrong is informative: the prestige gap, the detection rate, and the calibration curve are all computed from what you did, not what you said about yourself.",
      },
      {
        q: "Does an AI score my taste?",
        a: "No. Every score is computed by a deterministic engine in code — the same inputs always produce the same number, and the scoring rules are inspectable. No model classifies you.",
      },
      {
        q: "Where do the norms come from?",
        a: "From real sessions, and only from real sessions. Until a calibration cohort exists, every result is labeled provisional and no percentile is shown. Published statistics will state their N. This is a hard rule, not a disclaimer.",
      },
      {
        q: "What data does the Taste Gym collect?",
        a: "Anonymized response vectors: ratings, listen durations, item-pool version, and computed scores, keyed to a random per-session id. No account, no name, no email, no third-party tracking cookies.",
      },
    ],
  },
];

export function learnPage(slug: string): LearnPage | undefined {
  return LEARN_PAGES.find((p) => p.slug === slug);
}
