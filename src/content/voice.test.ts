/**
 * The automated voice gate (2026-08-08) — replaces the PM voice pass.
 *
 * Proven in both directions, like every other gate here: the shipping decks
 * pass, and deliberately off-voice fixtures fail with named rules. A checker
 * that has only ever returned "clean" is not known to check anything.
 */

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { checkVoice, formatVoiceReport, type VoiceString } from "./voice";
import { flawFamilies, FLAWS_INTRO, FLAWS_LIMITS, FLAWS_INVITE } from "./flaw-families";
import { landingLead, landingHint, SECONDARY_DOORS } from "./landing";
import { VERDICT_COPY, biasCardSwayLine, biasCardCta, shareText as biasShareText, resultTitleFragment } from "./bias/copy";
import {
  CALIBRATION_PHASE_LINE,
  MAGNITUDE_WORDS,
  PROVISIONAL_FOOTNOTE,
  delicacyResultSummary,
  detectionTitle,
  detectionBody,
  detectionCardAnchor,
  detectionCardFigure,
  shareText as delicacyShareText,
} from "./delicacy/copy";
import { DELICACY_TRIALS, FLAW_LABELS } from "./delicacy/items";
import { flawLineText } from "./delicacy/copy";
import { BIAS_CLIPS } from "./bias/items";
import { detectionBand } from "@/engine/delicacy";
import {
  FAMILY_BLURB,
  cooldownTitle,
  cooldownBody,
  COOLDOWN_ALTERNATIVE,
  COOLDOWN_DEVICE_NOTE,
  SNACK_LEAD,
  SNACK_LINE,
  SNACK_CTA,
  FAMILY_LABEL,
  NO_COHORT_FOOTNOTE,
  NO_COHORT_BADGE,
  thresholdCardFigure,
  thresholdCardCaption,
  thresholdShareText,
  THRESHOLD_SHARE_LABEL,
  THRESHOLD_STORY_LABEL,
  resultLines,
} from "./staircase/copy";
import { staircaseCopyFixtures, staircaseCardFixtures } from "./staircase/fixtures";
import { vocabularyStrings } from "./vocabulary/fixtures";
import { LIMIT_KIND_COPY, RETIRED_SOURCE_NOTE } from "./staircase/limits";
import { LEARN_PAGES } from "./learn";
import {
  METHOD_CLAIMS,
  METHOD_FINDINGS,
  METHOD_REFUSALS,
  METHOD_SECTIONS,
} from "./method/claims";

/** Every cohort-visible string, with the intensity its surface is allowed. */
function shippingStrings(): VoiceString[] {
  const out: VoiceString[] = [];
  const n = DELICACY_TRIALS.length;

  for (const [k, v] of Object.entries(VERDICT_COPY)) {
    out.push({ surface: `bias/verdict/${k}/title`, text: v.title, intensity: "pointed" });
    out.push({ surface: `bias/verdict/${k}/sub`, text: v.sub, intensity: "pointed" });
  }
  out.push({ surface: "bias/share", text: biasShareText(31), intensity: "full" });
  /**
   * The bias share card's own two lines (E6/S13). They were composed in the
   * route, which is outside this gate — the same structural gap the delicacy
   * card's hardcoded "calls 3" lived in. Swept every reachable denominator
   * rather than one example, because the boundary cases (0 of 8, 8 of 8) are
   * where a sentence stops reading like a sentence.
   */
  for (const [moved, movable] of [[0, 8], [1, 8], [7, 8], [8, 8]]) {
    out.push({
      surface: `bias/card/sway/${moved}-${movable}`,
      text: biasCardSwayLine(moved, movable),
      intensity: "calm",
    });
  }
  out.push({ surface: "bias/card/cta", text: biasCardCta("example.com"), intensity: "calm" });

  /**
   * The "not built yet" notice (E7/S24b, RT-155a). It appears on two reading-room
   * articles whose criterion has no instrument, and it is the one place the
   * product tells a reader that a door they came looking for is not there. If
   * that sentence goes off-voice it reads as an excuse instead of a fact.
   */
  for (const [criterion, blocker] of [
    ["comparison", "it needs no new audio, so what it waits on is a decision rather than a build"],
    ["practice", "it needs the product to remember you between sessions, and today it does not"],
  ]) {
    out.push({
      surface: `learn/not-built/${criterion}`,
      text:
        `There is no instrument for ${criterion} in the gym today. It is in the plan and not in ` +
        `the product — ${blocker}. When it exists it will be measured the same way as the rest, ` +
        `and until then this page is an explanation rather than a door.`,
      intensity: "calm",
    });
  }

  /**
   * THE READING-ROOM FAQ (E9/S1) — the largest block of cohort-visible prose
   * that was never in this deck.
   *
   * THE DEFECT THIS EXISTS FOR, in the words it shipped in:
   *
   *   learn.ts     "The paid tier is the training arc — retests, progression
   *                 charts, and the delicacy battery — not the reading itself."
   *   learn.ts     "The paid training arc is practice made measurable..."
   *
   * Both render as visible <dt>/<dd> pairs on /learn/prestige-bias-test and
   * /learn/practice, AND are emitted as FAQPage JSON-LD, so a search engine
   * repeats them. There is no paid tier and never was one (CLAUDE.md, "D4
   * amendment", RT-44a), and the amendment says user-facing copy promising one
   * "must be fixed on sight".
   *
   * The no-paid-tier check was already here and already passing, because the
   * deck harvested two hand-written `learn/` strings and never the registry.
   * That is the same failure the prefix-coverage test below was written for:
   * A GUARD LOOKING AT PART OF THE ROOM. Fixing the two sentences without
   * harvesting the registry would leave the next FAQ entry free to repeat them.
   *
   * ONE STRING PER ENTRY, question and answer assembled, because a <dt>/<dd>
   * pair is the unit a person reads — the same reasoning the footnote assertion
   * gives for testing the assembled line rather than its parts.
   */
  for (const p of LEARN_PAGES) {
    for (const f of p.faq) {
      out.push({
        surface: `learn/faq/${p.slug}`,
        text: `${f.q} ${f.a}`,
        intensity: "calm",
      });
    }
  }

  /**
   * `/method` (E9/S7) — every string a stranger reads on the method page.
   *
   * INTENSITY IS CALM THROUGHOUT. This is documentary prose about how the
   * project is run; the examiner's register belongs to the instruments. What
   * still binds here, and binds hard, is motive-attribution: the page discusses
   * whether the project avoided its own launch, which is the one place in this
   * product where writing about someone's REASONS is a live temptation.
   */
  for (const c of METHOD_CLAIMS) {
    out.push({ surface: `method/claim/${c.id}`, text: c.text, intensity: "calm" });
  }
  for (const r of METHOD_REFUSALS) {
    out.push({
      surface: `method/refusal/${r.id}`,
      text: `${r.what} ${r.refusal} ${r.price}`,
      intensity: "calm",
    });
  }
  for (const f of METHOD_FINDINGS) {
    out.push({
      surface: `method/finding/${f.id}`,
      text: `${f.finding} ${f.consequence}`,
      intensity: "calm",
    });
  }
  for (const s of METHOD_SECTIONS) {
    out.push({ surface: `method/section/${s.id}`, text: `${s.heading} ${s.lede}`, intensity: "calm" });
  }

  /**
   * The result page's <title> and the card's alt text (E7/S6). Both sides of
   * zero and the zero itself: the defect this replaced said "label-driven" on
   * every result, which was simply the wrong verdict for a steady session and
   * the OPPOSITE of what a contrarian one did.
   */
  for (const pct of [-31, -1, 0, 1, 31]) {
    out.push({ surface: `bias/result/title/${pct}`, text: resultTitleFragment(pct), intensity: "calm" });
  }

  /**
   * THE ITEM BLURBS (E7/S5) — the most consequential strings in the product,
   * and the gate had never seen one of them.
   *
   * Everything else here is copy ABOUT a result. These are the instrument
   * itself: the blurb is the prestige cue whose effect the test measures, and
   * three of them are the sanctioned deception (memo §3). A blurb that reads
   * fake weakens the very thing being measured, and a blurb that crosses one of
   * the five named hazards does it while wearing our brand.
   *
   * Every scored item, not a sample. RT-103a took the pool from 8 to 14 and six
   * of these have never been read by anyone but their author.
   */
  for (const clip of BIAS_CLIPS.filter((c) => !c.isControl)) {
    out.push({ surface: `bias/item/${clip.id}/blurb`, text: clip.shownBlurb, intensity: "pointed" });
  }

  out.push({ surface: "delicacy/share", text: delicacyShareText(12, n), intensity: "full" });

  /**
   * The reveal's flaw line (E7/S10). It was a JSX fragment — the same structural
   * gap "a coin flip calls 3" lived in — and it read "1 of 1 times" for anyone
   * who caught exactly one pair. Both boundaries are gated, not just a sample.
   */
  for (const [correct, eligible] of [[0, 1], [1, 1], [1, 2], [12, 12]]) {
    out.push({ surface: `delicacy/flaw/${correct}-${eligible}`, text: flawLineText(correct, eligible), intensity: "calm" });
  }
  /**
   * THE DETECTION READOUT (E6/S9). Every reachable score at the shipping
   * length, not a sample — all three branches (cleared the coin, ahead but not
   * proven, at or under it) and both boundaries between them. A score nobody
   * exercised is exactly where an off-voice line survives; that is the same
   * argument the tier sweep above makes, and it caught a live bug once.
   */
  for (let k = 0; k <= n; k++) {
    const band = detectionBand(k, n);
    out.push({ surface: `delicacy/detection/${k}/title`, text: detectionTitle(band), intensity: "pointed" });
    out.push({ surface: `delicacy/detection/${k}/body`, text: detectionBody(band), intensity: "calm" });
    // The share card is the most public surface we have, and its previous line
    // was a JSX literal the gate never saw — hardcoded "a coin flip calls 3"
    // against a fifteen-trial pool. Both card lines are gated now.
    out.push({ surface: `delicacy/card/${k}/anchor`, text: detectionCardAnchor(band), intensity: "calm" });
    out.push({ surface: `delicacy/card/${k}/figure`, text: detectionCardFigure(band), intensity: "pointed" });
  }
  out.push({
    surface: "delicacy/summary",
    text: delicacyResultSummary({ nCorrect: 12, nTrials: n } as never),
    intensity: "pointed",
  });
  out.push({ surface: "delicacy/calibration-phase", text: CALIBRATION_PHASE_LINE, intensity: "calm" });
  // The ASSEMBLED paragraph, not just its middle clause — the fragments either
  // side of it used to live in JSX, outside this gate entirely.
  out.push({ surface: "delicacy/provisional-footnote", text: PROVISIONAL_FOOTNOTE, intensity: "calm" });
  for (const [k, v] of Object.entries(FLAW_LABELS)) {
    out.push({ surface: `delicacy/flaw/${k}/label`, text: v.label, intensity: "calm" });
    out.push({ surface: `delicacy/flaw/${k}/hint`, text: v.hint, intensity: "calm" });
  }
  for (const [k, v] of Object.entries(MAGNITUDE_WORDS)) {
    out.push({ surface: `delicacy/rung/${k}`, text: v, intensity: "calm" });
  }

  /**
   * THE GYM'S RESULT DECK (E5/S5). Every reachable line, for every outcome kind
   * on every shipping ladder — generated from real sessions rather than sampled,
   * because an outcome nobody exercised is exactly where an off-voice line
   * survives (the same argument the delicacy tier sweep above makes).
   */
  for (const { surface, lines } of staircaseCopyFixtures()) {
    lines.forEach((text, i) => {
      // The band headline is the verdict; the rest is explanation and caveat.
      out.push({ surface: `${surface}/${i}`, text, intensity: i === 0 ? "pointed" : "calm" });
    });
  }
  for (const [k, v] of Object.entries(FAMILY_LABEL)) {
    out.push({ surface: `staircase/family/${k}/label`, text: v, intensity: "calm" });
  }
  for (const [k, v] of Object.entries(FAMILY_BLURB)) {
    out.push({ surface: `staircase/family/${k}/blurb`, text: v, intensity: "calm" });
  }
  out.push({ surface: "staircase/no-cohort", text: NO_COHORT_FOOTNOTE, intensity: "calm" });
  out.push({ surface: "staircase/no-cohort-badge", text: NO_COHORT_BADGE, intensity: "calm" });
  /**
   * THE THRESHOLD SHARE CARD (E6/S15). Driven from the SAME generated fixtures
   * as the result deck, so every outcome kind on every shipping ladder is
   * covered — including `inconclusive`, which is the one that must never print
   * a number and is therefore the one worth gating.
   */
  for (const { surface, result } of staircaseCardFixtures()) {
    out.push({ surface: `${surface}/card-figure`, text: thresholdCardFigure(result), intensity: "pointed" });
    out.push({ surface: `${surface}/card-caption`, text: thresholdCardCaption(result), intensity: "calm" });
    out.push({ surface: `${surface}/share-text`, text: thresholdShareText(result), intensity: "full" });
  }
  out.push({ surface: "staircase/share-label", text: THRESHOLD_SHARE_LABEL, intensity: "calm" });
  out.push({ surface: "staircase/story-label", text: THRESHOLD_STORY_LABEL, intensity: "calm" });
  // The Lab's limits page (E5/S7) — cohort-facing prose, so it is gated too.
  for (const [k, v] of Object.entries(LIMIT_KIND_COPY)) {
    out.push({ surface: `staircase/limit/${k}/title`, text: v.title, intensity: "calm" });
    out.push({ surface: `staircase/limit/${k}/blurb`, text: v.blurb, intensity: "calm" });
  }
  out.push({ surface: "staircase/retired-source", text: RETIRED_SOURCE_NOTE, intensity: "calm" });
  /**
   * The retest gate (RT-89a). Every family, and BOTH day phrasings — "Tomorrow"
   * is a separate sentence from "In N days" and only one of them is reachable
   * on any given day, which is exactly the shape of line that escapes a gate.
   */
  for (const k of Object.keys(FAMILY_LABEL)) {
    out.push({ surface: `staircase/cooldown/${k}/title`, text: cooldownTitle(k), intensity: "calm" });
  }
  for (const days of [1, 2, 7]) {
    out.push({ surface: `staircase/cooldown/body/${days}`, text: cooldownBody(days), intensity: "calm" });
  }
  out.push({ surface: "staircase/cooldown/alternative", text: COOLDOWN_ALTERNATIVE, intensity: "calm" });
  out.push({ surface: "staircase/cooldown/device-note", text: COOLDOWN_DEVICE_NOTE, intensity: "calm" });
  // The snack that sits beside the instrument (PM direction 2026-08-22). It is
  // cohort-facing copy on the Gym's own screen, so it is gated with the rest.
  out.push({ surface: "staircase/snack/lead", text: SNACK_LEAD, intensity: "calm" });
  out.push({ surface: "staircase/snack/line", text: SNACK_LINE, intensity: "calm" });
  out.push({ surface: "staircase/snack/cta", text: SNACK_CTA, intensity: "calm" });

  /**
   * THE VOCABULARY LAYER (E8/S9). Every sentence the creator translation and the
   * combined view can emit, ENUMERATED from real engine results rather than
   * sampled — the same argument the staircase deck above makes, and the same
   * one that motivated `covers every reachable readout score`: an outcome nobody
   * exercised is exactly where an off-voice line survives.
   *
   * These lines live in `src/content/vocabulary/`, are rendered on all three
   * result screens, and until this slice were gated only by their own module
   * tests. A per-module check is not the deck — the deck is what the paid-tier
   * ruling, the norm rule and the datum rule are applied to as a whole.
   */
  /**
   * THE FLAW-FAMILY VOCABULARY (E11/S1, Track B).
   *
   * Six sentences describing what each degradation sounds like to somebody
   * whose own render is broken. They are written by engineering and have not
   * had a writing pass, so registering them here is the difference between
   * "cannot contain a NAMED hazard" and "nobody has looked". Swept from the
   * registry rather than listed, so a family added later cannot enter the
   * product ungated — the exact hole that let the delicacy card's hardcoded
   * line survive for months.
   */
  for (const f of flawFamilies()) {
    out.push({ surface: `learn/flaws/${f.family}/symptom`, text: f.symptom, intensity: "calm" });
    out.push({ surface: `learn/flaws/${f.family}/mechanism`, text: f.mechanism, intensity: "calm" });
  }

  /**
   * THE FRONT DOOR'S LEAD (E11/S2). The most-read paragraph in the product,
   * and until it moved out of JSX in this slice it was outside every gate —
   * which is how it went on saying "Two machines" over three cards. Swept at
   * more than one count so the sentence is checked as a sentence rather than
   * at the one value that happens to ship.
   */
  for (const n of [2, 3, 4]) {
    out.push({ surface: `learn/landing/lead/${n}`, text: landingLead(n), intensity: "pointed" });
  }
  out.push({ surface: "learn/landing/hint", text: landingHint(), intensity: "calm" });

  // The two claim-bearing sentences on /learn/flaws (E11/S3). The rest of that
  // page is registry data already swept above, or connective wording.
  out.push({ surface: "learn/flaws/intro", text: FLAWS_INTRO, intensity: "calm" });
  out.push({ surface: "learn/flaws/limits", text: FLAWS_LIMITS, intensity: "calm" });
  out.push({ surface: "learn/flaws/invite", text: FLAWS_INVITE, intensity: "calm" });

  // The three quiet doors under the machine cards (E11/S4). Two of them had
  // never been through this gate; they were JSX.
  for (const d of SECONDARY_DOORS) {
    out.push({ surface: `learn/landing/door${d.href}`, text: `${d.label} ${d.line}`, intensity: "calm" });
  }

  out.push(...vocabularyStrings());
  return out;
}

/**
 * THE GYM, NAMED. Every instrument the D4 amendment governs — the Prestige
 * Test, the Delicacy Trials, the Threshold staircase — where the ruling is
 * that there is no paid tier and never was one to promise.
 *
 * Named here rather than inlined at the call site because the call site's
 * two-prefix list had already gone stale: `bias/` joined the deck and nothing
 * noticed, so 31 strings sat outside the ruling that governs them.
 */
// "learn" joined in E7/S24b. The reading room is part of the Gym, not the
// legacy funnel — so the no-paid-tier ruling applies to its copy too, which is
// exactly what this classification decides.
// "vocabulary" joined in E8/S9: the creator-translation and combined-view
// sentences sit on the Gym's own result screens, so the no-paid-tier ruling
// governs them exactly as it governs the rest of the deck.
const GYM_SURFACE_PREFIXES = ["bias", "delicacy", "staircase", "learn", "vocabulary"] as const;

/**
 * Surfaces where a price is LEGITIMATE — the legacy music/world-cup funnel,
 * whose $3.99 unlock RT-125a explicitly kept alive. Empty today because none of
 * that funnel's copy is registered in this deck; it exists so that the day some
 * of it is, the answer is "classify it", not "widen the pattern until the test
 * goes quiet".
 */
const LEGACY_PAID_PREFIXES: readonly string[] = [];

/**
 * SURFACES THAT DESCRIBE A REFUSED PAYMENT MODEL (E9/S7).
 *
 * `/method` is neither Gym copy nor legacy funnel. Its subject is decisions
 * this project made, and two of them are about money: the paid training arc,
 * withdrawn, and the $3.99 consumer product, concluded dead. It cannot say what
 * was refused without naming it.
 *
 * The Gym rule — "must not mention a paid tier" — is the wrong instrument here,
 * and the wrong repair would be to exempt the prefix and move on. So the rule
 * is REPLACED WITH A STRICTER ONE rather than lifted: a documentary string may
 * name a payment model only if the same string also says it is gone. That is
 * checked below, and it is a harder test to pass than silence.
 */
const DOCUMENTARY_PREFIXES = ["method"] as const;

/** Phrases that put a payment model in the past. Deliberately short. */
const PAYMENT_IS_GONE = /there is no paid tier|is dead|was withdrawn|became legacy/i;

/**
 * Does this string PROMISE that something costs money? (RT-44a, D4 amendment.)
 *
 * One definition, shared by the forward and reverse tests, so the check that
 * guards the copy and the check that proves the guard works can never drift
 * apart — which is the same class of bug as the two rung tables that disagreed.
 *
 * Negated forms are stripped first: denying a paid tier is exactly what the
 * copy is supposed to do, and a blunt substring match cannot tell "no paid
 * tier" from "join the paid tier".
 */
function promisesPayment(text: string): boolean {
  const claim = text.replace(/\bno (paid|premium)\b/gi, "").replace(/\bnot paid\b/gi, "");
  // Up to two words may sit between "paid" and the noun — the retired line said
  // "the paid TRAINING arc", and an adjacency-only pattern sailed past it.
  return /\bpaid\s+(?:\w+\s+){0,2}(?:tier|arc|plan|version|training|feature)\b|\bpremium\b|\bupgrade\b|\bsubscri|\bunlock for\b|\$\d/i.test(
    claim,
  );
}

describe("hazard gate — the shipping decks", () => {
  it("every cohort-visible string passes the spec", () => {
    const violations = checkVoice(shippingStrings());
    if (violations.length > 0) console.log(formatVoiceReport(violations));
    expect(violations).toEqual([]);
  });

  /**
   * RT-44a. The no-payment ruling (CLAUDE.md, "D4 amendment") is a product
   * decision, and the only way a user ever learns it was violated is by reading
   * a screen that promises a tier that does not exist. Pin it in the deck.
   *
   * Asserted on the ASSEMBLED footnote, because that is the unit a user reads.
   */
  it("no Gym copy promises a paid tier (D4 amendment)", () => {
    const surfaces = shippingStrings().filter((s) =>
      GYM_SURFACE_PREFIXES.some((p) => s.surface.startsWith(`${p}/`)),
    );
    expect(surfaces.length).toBeGreaterThan(0);
    /**
     * COLLECTED, NOT THROWN ON THE FIRST (E9/S1). This loop used to assert
     * inside the iteration, so the run stopped at the first offending surface.
     * When the reading-room registry joined the deck it carried TWO paid-tier
     * sentences and the report named one — which is how a second defect gets
     * fixed a session later than the first, if at all.
     */
    const promising = surfaces.filter((s) => promisesPayment(s.text));
    expect(
      promising.map((s) => `${s.surface}  "${s.text}"`),
      "These promise a tier the D4 amendment abolished:",
    ).toEqual([]);
    // ...and the footnote must still SAY so, rather than going quiet about it.
    expect(PROVISIONAL_FOOTNOTE).toMatch(/no paid tier/i);
  });

  /**
   * THE PUBLISHED TEXT FILES (E9/S1) — served, indexed, and outside every deck.
   *
   * `public/llms.txt` and `public/llms-full.txt` are shipped at /llms.txt and
   * /llms-full.txt for AI crawlers. `llms-full.txt` said "The paid tier, when
   * it ships, is the training arc", which is a promise of a tier that does not
   * exist, addressed to the readers least able to check it against the product.
   *
   * NOT run through `checkVoice`, deliberately. The voice spec governs the
   * examiner's register on instrument copy; these files are a factual
   * description written for machines, and pushing them through a register gate
   * would either fail them for being flat — which they are supposed to be — or
   * force the gate to be widened until it stops meaning anything. What binds
   * here is the D4 ruling, and only that.
   *
   * PER LINE, so the failure names the sentence rather than the file.
   */
  it("no published text file promises a paid tier (D4 amendment)", () => {
    const files = ["public/llms.txt", "public/llms-full.txt"];
    const offences: string[] = [];
    for (const path of files) {
      const lines = readFileSync(path, "utf8").split("\n");
      // Two lines joined, because these files hard-wrap mid-sentence and the
      // specimen sentence began on one line and named its tier on the next.
      lines.forEach((line, i) => {
        const unit = `${line} ${lines[i + 1] ?? ""}`;
        if (promisesPayment(unit)) offences.push(`${path}:${i + 1}  ${line.trim()}`);
      });
    }
    expect(
      offences,
      "These published files promise a tier the D4 amendment abolished:\n" + offences.join("\n"),
    ).toEqual([]);
  });

  /**
   * E7/S11 — THE SCOPE MUST STAY COMPLETE, NOT JUST CORRECT.
   *
   * The check above used to name two prefixes inline: `delicacy/` and
   * `staircase/`. Nothing kept that list current, and it had already gone
   * stale — the deck carries 31 `bias/` strings, including all fourteen item
   * blurbs and the result-page title, and NONE of them were being checked. The
   * guard was passing because it was looking at part of the room.
   *
   * So the prefixes are named once, above, and this test asserts they cover
   * EVERYTHING in the deck. A new instrument's strings cannot slip past the
   * no-paid-tier ruling by arriving under a prefix nobody added to a list; they
   * fail here instead, and somebody decides on purpose whether that surface is
   * Gym (D4 applies) or legacy funnel (RT-125a sanctions the $3.99).
   */
  /**
   * A DOCUMENTARY SURFACE MAY NAME A PAYMENT MODEL ONLY WHILE BURYING IT
   * (E9/S7). Two /method entries mention money — the withdrawn training arc and
   * the $3.99 product — and both must carry the sentence that kills it in the
   * same breath a reader gets it. Silence would have been easier to arrange and
   * would have told the reader less.
   */
  it("names a payment model only alongside its refusal (documentary surfaces)", () => {
    const surfaces = shippingStrings().filter((s) =>
      DOCUMENTARY_PREFIXES.some((p) => s.surface.startsWith(`${p}/`)),
    );
    expect(surfaces.length).toBeGreaterThan(0);
    const mentions = surfaces.filter((s) => promisesPayment(s.text));
    // The page would be hiding its own history if it stopped mentioning them.
    expect(mentions.length, "no /method string mentions the refused payment models any more").toBe(
      2,
    );
    const undenied = mentions.filter((s) => !PAYMENT_IS_GONE.test(s.text));
    expect(
      undenied.map((s) => `${s.surface}  "${s.text}"`),
      "These name a payment model without saying, in the same block, that it is gone:",
    ).toEqual([]);
  });

  it("the Gym prefix list covers every surface in the deck", () => {
    const known = new Set<string>([
      ...GYM_SURFACE_PREFIXES,
      ...LEGACY_PAID_PREFIXES,
      ...DOCUMENTARY_PREFIXES,
    ]);
    const unclassified = [...new Set(shippingStrings().map((s) => s.surface.split("/")[0]))]
      .filter((p) => !known.has(p))
      .sort();
    expect(
      unclassified,
      "These surfaces belong to neither the Gym nor the legacy funnel, so the paid-tier " +
        "ruling is silently not being applied to them. Classify each one deliberately:\n" +
        unclassified.join("\n"),
    ).toEqual([]);
  });

  /**
   * Proven in both directions: the RETIRED line must trip the check.
   *
   * This test failed on its first run and the failure was the point. The
   * original pattern required "paid" adjacent to tier/arc/plan — and the line
   * it was written to prevent said "the paid TRAINING arc". A gate that cannot
   * catch the specimen that motivated it is decoration.
   *
   * RESTORED IN E6/S23. Deleting the retired delicacy tiers took this and its
   * sibling with them — they sat in the same `describe` and had nothing to do
   * with tiers. The suite went GREEN with the paid-tier guard's reverse proof
   * missing, which is the exact failure this whole session has been about.
   */
  it("would have caught the line it replaced", () => {
    expect(
      promisesPayment("Free while the gym calibrates — the trials join the paid training arc once norms exist."),
    ).toBe(true);
  });

  it("does not fire on a DENIAL of a paid tier", () => {
    expect(promisesPayment("Free, with no paid tier now or later.")).toBe(false);
    expect(promisesPayment("There is no premium version.")).toBe(false);
  });

  /**
   * The sweep must stay a SWEEP. Its old form counted delicacy verdict tiers,
   * which no longer exist; it now counts detection-readout scores, which is the
   * same guarantee against the same failure — a deck that quietly starts
   * sampling instead of enumerating.
   */
  it("covers every reachable readout score, not a sample", () => {
    const strings = shippingStrings();
    const scores = new Set(
      strings.filter((s) => s.surface.startsWith("delicacy/detection/")).map((s) => s.surface.split("/")[2]),
    );
    expect(scores.size).toBe(DELICACY_TRIALS.length + 1);
    expect(strings.length).toBeGreaterThan(40);
  });
});

/**
 * THE VOCABULARY LAYER, PROVEN IN BOTH DIRECTIONS (E8/S9).
 *
 * A green deck proves the strings are CLEAN. It does not prove they are
 * CHECKED — a surface that never reaches `checkVoice` passes for the same
 * reason an empty list does. This repo has already shipped that failure twice:
 * the delicacy card's "a coin flip calls 3" and the bias card's two lines both
 * lived in JSX, outside the deck, passing by absence.
 *
 * So each test below breaks something on purpose and requires the break to be
 * caught at the exact surface it was introduced.
 */
describe("hazard gate — the vocabulary layer is reached, not merely clean", () => {
  const strings = vocabularyStrings();

  it("is actually part of the shipping deck, not just checkable on its own", () => {
    const deck = shippingStrings().filter((s) => s.surface.startsWith("vocabulary/"));
    expect(deck.length).toBe(strings.length);
    expect(deck.length).toBeGreaterThan(30);
  });

  /**
   * ONE MUTATION PER SURFACE. Every registered sentence is replaced, in turn,
   * with a line that violates a named rule — and the violation must be reported
   * against THAT surface. A string the deck merely lists but never passes to
   * the checker would sail through this.
   */
  it("catches a banned line at every single vocabulary surface", () => {
    const banned = "Better than 80% of listeners — you were trying to look clever.";
    const missed: string[] = [];
    for (const s of strings) {
      const violations = checkVoice([{ ...s, text: banned }]);
      if (!violations.some((v) => v.surface === s.surface)) missed.push(s.surface);
    }
    expect(missed, `surfaces the gate did not flag: ${missed.join(" | ")}`).toEqual([]);
  });

  /** The rules that matter most for this layer, each proven to fire. */
  it.each([
    ["fabricated-norm", "Your pitch threshold puts you in the top 10% of ears."],
    ["person-verdict", "You have no ear for compression damage."],
    ["motive-attribution", "You rated it highly because you wanted the label to be right."],
    ["unmeasured-claim", "Anyone can hear the drift at 25 cents."],
  ])("a %s line is caught if it ever reaches this layer", (rule, text) => {
    const violations = checkVoice([{ surface: "vocabulary/threshold/mutant/0", text, intensity: "pointed" }]);
    expect(violations.map((v) => v.rule)).toContain(rule);
  });

  /**
   * THE ENUMERATION MUST STAY AN ENUMERATION. If a branch stops being
   * exercised, its sentences leave the deck silently and the suite stays green
   * — the failure mode the staircase fixtures were built to prevent.
   */
  it("covers every branch the layer can take, not a sample", () => {
    const surfaces = strings.map((s) => s.surface);
    for (const family of ["pitch-drift", "timing-smear", "lossy-artifact"]) {
      expect(surfaces.some((s) => s.includes(`/threshold/${family}`)), family).toBe(true);
    }
    for (const kind of ["threshold", "below", "above", "inconclusive"]) {
      expect(surfaces.some((s) => s.startsWith("vocabulary/threshold/") && s.includes(`/${kind}/`)), kind).toBe(true);
    }
    for (const state of ["all", "some", "none"]) {
      expect(surfaces.some((s) => s === `vocabulary/delicacy/${state}/0`), state).toBe(true);
    }
    for (const verdict of ["swayed", "steady", "contrarian"]) {
      expect(surfaces.some((s) => s.startsWith(`vocabulary/bias/${verdict}/`)), verdict).toBe(true);
    }
    for (const across of ["bias-delicacy", "delicacy-threshold", "all-three", "full-coverage"]) {
      expect(surfaces.some((s) => s.startsWith(`vocabulary/across/${across}/`)), across).toBe(true);
    }
  });

  /**
   * The layer's own N3 promise, asserted over the WHOLE deck rather than per
   * module: no sentence anywhere claims a paid tier, a percentile, or a cohort.
   */
  it("promises no payment and no cohort anywhere in the layer", () => {
    for (const s of strings) {
      expect(promisesPayment(s.text), s.surface).toBe(false);
      expect(s.text, s.surface).not.toMatch(/\bpercentile\b|\btop \d+\s*%/i);
    }
  });
});

describe("hazard gate — it CATCHES what the spec bans", () => {
  const at = (text: string, intensity: VoiceString["intensity"] = "pointed"): VoiceString[] => [
    { surface: "fixture", text, intensity },
  ];

  it("catches motive attribution (fails debrief-proof)", () => {
    const v = checkVoice(at("You docked the famous names out of spite."));
    expect(v[0].rule).toBe("motive-attribution");
  });

  it("catches a person-verdict (fails ratings-not-you)", () => {
    expect(checkVoice(at("You're basic."))[0].rule).toBe("person-verdict");
    expect(checkVoice(at("You have no taste."))[0].rule).toBe("person-verdict");
  });

  it("catches beige chrome in a verdict, but allows it in onboarding", () => {
    expect(checkVoice(at("Your results are ready."))[0].rule).toBe("beige-chrome");
    // The spec says onboarding is meant to be calm — the rule must not fire there.
    expect(checkVoice(at("Your results are ready.", "calm"))).toEqual([]);
  });

  it("catches fabricated norms (N3) — there is no cohort", () => {
    expect(checkVoice(at("You scored in the top 10% of listeners."))[0].rule).toBe("fabricated-norm");
    expect(checkVoice(at("That puts you in the 90th percentile."))[0].rule).toBe("fabricated-norm");
    expect(checkVoice(at("Above average, comfortably."))[0].rule).toBe("fabricated-norm");
  });

  it("catches an audibility claim the measurements do not support", () => {
    expect(checkVoice(at("Anyone can hear the difference."))[0].rule).toBe("unmeasured-claim");
    expect(checkVoice(at("This proves your ears are good."))[0].rule).toBe("unmeasured-claim");
  });

  it("catches a full-intensity line that cites no measured quantity", () => {
    const v = checkVoice(at("Think your ears are better?", "full"));
    expect(v[0].rule).toBe("datum-anchored");
    // …and passes once it carries the datum.
    expect(checkVoice(at("I called 12 of 18. Think your ears are better?", "full"))).toEqual([]);
  });

  it("reports EVERY violation in a line, not just the first", () => {
    const v = checkVoice(at("You're basic — bottom percentile, out of spite."));
    expect(new Set(v.map((x) => x.rule)).size).toBeGreaterThanOrEqual(3);
  });
});

/**
 * THE BOUNDARY OF THIS GATE, MADE EXECUTABLE (PM ruling RT-106a a, 2026-08-21).
 *
 * WHAT WENT WRONG WITH THE OLD NAME. The standing rule said every new
 * user-facing string must be "registered in the voice gate", and both the PM
 * and I read a passing run as "the copy is in voice". It does not mean that.
 * `voice.ts` says so in its own header — it cannot tell you a line is dull —
 * but the header is not what anyone reads at 1am; the green tick is. So the
 * suites above are now the HAZARD gate, and this block pins why.
 *
 * It catches five named dangers with surface forms: motive attribution,
 * person-verdicts, beige chrome in a verdict, fabricated norms, unmeasured
 * audibility claims. It also requires a full-intensity line to cite a measured
 * quantity. That is the whole of it.
 *
 * It does NOT check register, rhythm, or whether a line is any good. The test
 * below asserts that a deliberately off-brand string PASSES — which is a
 * boundary, not a bug, and asserting it is how the boundary stays visible
 * instead of being rediscovered by someone shipping slop with a green suite.
 *
 * MEASURED, NOT ASSUMED: this exact string was run through the gate and passed
 * (2026-08-21). It is the specimen that prompted the rename.
 */
describe("hazard gate — what it deliberately does NOT check", () => {
  it("lets off-register copy through, because register has no surface form", () => {
    const offBrand: VoiceString[] = [
      { surface: "specimen/slang", text: "13 of 15. LITERALLY INSANE bestie no cap fr fr.", intensity: "pointed" },
      { surface: "specimen/limp", text: "You got 13 of 15 correct. That is a fine result.", intensity: "pointed" },
    ];
    // Both are bad copy. Neither contains a banned move, so both pass — and a
    // green run on new strings therefore means "no named hazard", never "this
    // reads well". Nothing in the pipeline judges the second thing.
    expect(checkVoice(offBrand)).toEqual([]);
  });

  it("still catches a named hazard hiding inside otherwise fine copy", () => {
    const hazard: VoiceString[] = [
      {
        surface: "specimen/hazard",
        text: "13 of 15, and the coin calls 7.5 — you are better than 80% of listeners.",
        intensity: "pointed",
      },
    ];
    const found = checkVoice(hazard);
    expect(found.map((v) => v.rule)).toContain("fabricated-norm");
  });
});

/**
 * E6/S15 — the norm rule now reads past an explicit denial, and this pins the
 * exact width of that hole.
 *
 * WHY IT WAS OPENED. N3 requires the product to SAY there is no cohort. The
 * blunt pattern flagged "no percentile — cohort n = 0" for containing the word
 * it exists to deny, which makes the honest sentence unwritable inside the deck
 * — and an unwritable sentence gets written in ungated JSX instead, which is
 * exactly where the delicacy card's "a coin flip calls 3" survived for months.
 * A gate that pushes copy out of the gate is worse than a slightly narrower
 * gate.
 *
 * WHY IT IS SAFE. Only a negation attached to the word is stripped. Everything
 * that actually claims a norm still trips, including a claim that tries to hide
 * behind a nearby denial.
 */
describe("hazard gate — denying a norm is not claiming one", () => {
  const check = (text: string) =>
    checkVoice([{ surface: "specimen", text, intensity: "calm" }]).map((v) => v.rule);

  it("lets the product say there is no cohort", () => {
    expect(check("no percentile — cohort n = 0")).toEqual([]);
    expect(check("Percentiles arrive when the cohort does, not before.")).toEqual([]);
    expect(check("There is not a percentile here and there will not be one yet.")).toEqual([]);
    // E9/S1 — the reading-room FAQ heading. A question is not a claim, and the
    // answer beneath it is "Not yet."
    expect(check("Is my result a percentile? Not yet.")).toEqual([]);
    // E9/S7 — the honesty rule quoted on /method, in its own words. A denial
    // written as a list is still a denial.
    expect(check("no score, percentile, or claim the data can't support")).toEqual([]);
  });

  it("still catches a real population claim", () => {
    expect(check("Your percentile is 87.")).toContain("fabricated-norm");
    // The interrogative strip is narrow ON PURPOSE: only the exact phrase
    // "a percentile?". A rhetorical question is still the shape a real
    // population claim takes, and it must still trip.
    expect(check("You're top 10 percentile?")).toContain("fabricated-norm");
    // The list strip is short and adjacent on purpose: a claim that merely
    // follows a denial in the same sentence is not covered by it.
    expect(check("No cohort, no norms — your percentile is 87.")).toContain("fabricated-norm");
    expect(check("You scored better than 80% of listeners.")).toContain("fabricated-norm");
    expect(check("That is above average for this test.")).toContain("fabricated-norm");
    expect(check("You are in the top 5% of ears.")).toContain("fabricated-norm");
  });

  it("catches a claim that hides behind a denial in the same sentence", () => {
    // The strip removes the denial, not the claim beside it.
    expect(check("No percentiles yet, but you are better than 90% of listeners.")).toContain(
      "fabricated-norm",
    );
  });
});
