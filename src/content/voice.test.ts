/**
 * The automated voice gate (2026-08-08) — replaces the PM voice pass.
 *
 * Proven in both directions, like every other gate here: the shipping decks
 * pass, and deliberately off-voice fixtures fail with named rules. A checker
 * that has only ever returned "clean" is not known to check anything.
 */

import { describe, expect, it } from "vitest";
import { checkVoice, formatVoiceReport, type VoiceString } from "./voice";
import { VERDICT_COPY, biasCardSwayLine, biasCardCta, shareText as biasShareText } from "./bias/copy";
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
import { BIAS_CLIPS } from "./bias/items";
import { detectionBand } from "@/engine/delicacy";
import {
  FAMILY_BLURB,
  cooldownTitle,
  cooldownBody,
  COOLDOWN_ALTERNATIVE,
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
import { LIMIT_KIND_COPY, RETIRED_SOURCE_NOTE } from "./staircase/limits";

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
  // The snack that sits beside the instrument (PM direction 2026-08-22). It is
  // cohort-facing copy on the Gym's own screen, so it is gated with the rest.
  out.push({ surface: "staircase/snack/lead", text: SNACK_LEAD, intensity: "calm" });
  out.push({ surface: "staircase/snack/line", text: SNACK_LINE, intensity: "calm" });
  out.push({ surface: "staircase/snack/cta", text: SNACK_CTA, intensity: "calm" });
  return out;
}

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
  it("no user-facing delicacy or Gym copy promises a paid tier (D4 amendment)", () => {
    const surfaces = shippingStrings().filter(
      (s) => s.surface.startsWith("delicacy/") || s.surface.startsWith("staircase/"),
    );
    expect(surfaces.length).toBeGreaterThan(0);
    for (const s of surfaces) {
      expect(promisesPayment(s.text), `${s.surface} promises payment`).toBe(false);
    }
    // ...and the footnote must still SAY so, rather than going quiet about it.
    expect(PROVISIONAL_FOOTNOTE).toMatch(/no paid tier/i);
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
  });

  it("still catches a real population claim", () => {
    expect(check("Your percentile is 87.")).toContain("fabricated-norm");
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
