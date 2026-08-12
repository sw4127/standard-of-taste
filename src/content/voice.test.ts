/**
 * The automated voice gate (2026-08-08) — replaces the PM voice pass.
 *
 * Proven in both directions, like every other gate here: the shipping decks
 * pass, and deliberately off-voice fixtures fail with named rules. A checker
 * that has only ever returned "clean" is not known to check anything.
 */

import { describe, expect, it } from "vitest";
import { checkVoice, formatVoiceReport, type VoiceString } from "./voice";
import { VERDICT_COPY, shareText as biasShareText } from "./bias/copy";
import {
  CALIBRATION_PHASE_LINE,
  MAGNITUDE_WORDS,
  delicacyResultSummary,
  delicacyVerdict,
  shareText as delicacyShareText,
} from "./delicacy/copy";
import { DELICACY_TRIALS, FLAW_LABELS } from "./delicacy/items";

/** Every cohort-visible string, with the intensity its surface is allowed. */
function shippingStrings(): VoiceString[] {
  const out: VoiceString[] = [];
  const n = DELICACY_TRIALS.length;

  for (const [k, v] of Object.entries(VERDICT_COPY)) {
    out.push({ surface: `bias/verdict/${k}/title`, text: v.title, intensity: "pointed" });
    out.push({ surface: `bias/verdict/${k}/sub`, text: v.sub, intensity: "pointed" });
  }
  out.push({ surface: "bias/share", text: biasShareText(31), intensity: "full" });

  // Sweep every reachable delicacy verdict tier, not a sample: a tier nobody
  // exercised is exactly where an off-voice line survives.
  for (let correct = 0; correct <= n; correct++) {
    const v = delicacyVerdict(correct, n);
    out.push({ surface: `delicacy/verdict/${correct}/title`, text: v.title, intensity: "pointed" });
    out.push({ surface: `delicacy/verdict/${correct}/sub`, text: v.sub, intensity: "pointed" });
  }
  out.push({ surface: "delicacy/share", text: delicacyShareText(12, n), intensity: "full" });
  out.push({
    surface: "delicacy/summary",
    text: delicacyResultSummary({ nCorrect: 12, nTrials: n } as never),
    intensity: "pointed",
  });
  out.push({ surface: "delicacy/calibration-phase", text: CALIBRATION_PHASE_LINE, intensity: "calm" });
  for (const [k, v] of Object.entries(FLAW_LABELS)) {
    out.push({ surface: `delicacy/flaw/${k}/label`, text: v.label, intensity: "calm" });
    out.push({ surface: `delicacy/flaw/${k}/hint`, text: v.hint, intensity: "calm" });
  }
  for (const [k, v] of Object.entries(MAGNITUDE_WORDS)) {
    out.push({ surface: `delicacy/rung/${k}`, text: v, intensity: "calm" });
  }
  return out;
}

describe("voice gate — the shipping decks", () => {
  it("every cohort-visible string passes the spec", () => {
    const violations = checkVoice(shippingStrings());
    if (violations.length > 0) console.log(formatVoiceReport(violations));
    expect(violations).toEqual([]);
  });

  it("covers every reachable verdict tier, not a sample", () => {
    const strings = shippingStrings();
    const tiers = new Set(
      strings.filter((s) => s.surface.startsWith("delicacy/verdict/")).map((s) => s.surface.split("/")[2]),
    );
    expect(tiers.size).toBe(DELICACY_TRIALS.length + 1);
    expect(strings.length).toBeGreaterThan(40);
  });
});

describe("voice gate — it CATCHES what the spec bans", () => {
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

describe("delicacy verdicts are POOL-SIZE-RELATIVE (the bug this caught)", () => {
  const n = DELICACY_TRIALS.length;
  const chance = n / 2;

  it("a below-chance score never earns a positive verdict", () => {
    // The defect: tiers were keyed on raw counts out of six, so after the pool
    // expanded to eighteen a score of 6 — two-thirds of the way BELOW chance —
    // still returned "The key in the wine."
    for (let correct = 0; correct < chance; correct++) {
      expect(delicacyVerdict(correct, n).title, `${correct}/${n}`).toBe("The village.");
    }
  });

  it("exactly chance ties the coin", () => {
    expect(delicacyVerdict(chance, n).title).toBe("The coin ties you.");
  });

  it("a perfect score earns the top verdict, and only a perfect score", () => {
    expect(delicacyVerdict(n, n).title).toBe("The key in the wine.");
    expect(delicacyVerdict(n - 1, n).title).not.toBe("The key in the wine.");
  });

  it("verdicts are monotone in score — a better score never reads worse", () => {
    const rank = ["The village.", "The coin ties you.", "A hair above chance.", "Better than the coin.", "Sharp ears.", "The key in the wine."];
    let last = -1;
    for (let correct = 0; correct <= n; correct++) {
      const r = rank.indexOf(delicacyVerdict(correct, n).title);
      expect(r, `${correct}/${n} produced an unranked title`).toBeGreaterThanOrEqual(0);
      expect(r, `${correct}/${n} ranks below ${correct - 1}/${n}`).toBeGreaterThanOrEqual(last);
      last = r;
    }
  });

  it("works for a six-trial pool too — the tiers are computed, not hardcoded", () => {
    expect(delicacyVerdict(6, 6).title).toBe("The key in the wine.");
    expect(delicacyVerdict(3, 6).title).toBe("The coin ties you.");
    expect(delicacyVerdict(1, 6).title).toBe("The village.");
  });
});
