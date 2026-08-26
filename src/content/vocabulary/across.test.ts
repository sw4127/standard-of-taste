import { describe, expect, it } from "vitest";
import {
  acrossLines,
  coverageLine,
  dossierLine,
  instrumentCount,
  replicationLine,
  thresholdRoster,
  type AcrossInput,
} from "./across";
import { creatorLines as thresholdCreatorLines } from "./threshold";
import { creatorLines as delicacyCreatorLines } from "./delicacy";
import { creatorLines as biasCreatorLines } from "./bias";
import { replicationCheck } from "@/engine/replication";
import { thresholdClaim } from "@/engine/evidence";
import { DELICACY_INSTRUMENT_ID, MEASURED_TRIALS } from "@/content/delicacy/items";
import { computeDelicacyResult, type DelicacyResponses } from "@/engine/delicacy";
import { BIAS_CLIPS, BIAS_INSTRUMENT_ID } from "@/content/bias/items";
import { BIAS_SCALE_MAX, BIAS_SCALE_MIN, computeBiasResult } from "@/engine/bias";
import {
  answer,
  axisFor,
  isFinished,
  nextTrial,
  sessionResult,
  startSession,
  type StaircaseResult,
} from "@/engine/staircase-session";
import { observer, pCorrect, rng } from "@/analytics/observer";
import { familyLabel, resultLines } from "@/content/staircase/copy";
import { checkVoice, formatVoiceReport } from "@/content/voice";

/* ------------------------------------------------------------------ *
 * Real results from real engines
 * ------------------------------------------------------------------ */

function thresholdFor(family: string, place: number, sourceId?: string): StaircaseResult {
  const mags = axisFor(family, sourceId).magnitudes;
  const lo = Math.log(mags[0] / 4);
  const hi = Math.log(mags[mags.length - 1] * 4);
  const o = observer(Math.exp(lo + (hi - lo) * place), 0.35, 0.02);
  let s = startSession(family, 7919, sourceId);
  const rand = rng(7919 ^ 0x5bf03635);
  while (!isFinished(s)) {
    const t = nextTrial(s);
    s = answer(s, rand() < pCorrect(s.axis.magnitudes[t.levelIndex], o));
  }
  return sessionResult(s);
}

function delicacyFor(pick: (family: string) => boolean) {
  const responses: DelicacyResponses = {};
  for (const t of MEASURED_TRIALS) {
    const ok = pick(t.family);
    responses[t.id] = {
      pickedSide: ok ? t.originalSide : t.originalSide === "a" ? "b" : "a",
      flawPick: t.family,
      confidence: 70,
    };
  }
  return computeDelicacyResult(DELICACY_INSTRUMENT_ID, MEASURED_TRIALS, responses);
}

function biasFor(shift: number) {
  const blind: Record<string, number> = {};
  const labeled: Record<string, number> = {};
  for (const item of BIAS_CLIPS) {
    blind[item.id] = 5;
    const toward = item.isControl ? 0 : item.labelDirection === "up" ? shift : -shift;
    labeled[item.id] = Math.max(BIAS_SCALE_MIN, Math.min(BIAS_SCALE_MAX, 5 + toward));
  }
  return computeBiasResult(BIAS_INSTRUMENT_ID, BIAS_CLIPS, blind, labeled);
}

const EMPTY: AcrossInput = {
  bias: null,
  delicacy: null,
  thresholds: [],
  replications: [],
  unmeasured: ["pitch-drift", "timing-smear", "lossy-artifact"],
};

function build(opts: Partial<AcrossInput>): AcrossInput {
  const input = { ...EMPTY, ...opts };
  if (input.delicacy && input.thresholds.length > 0 && opts.replications === undefined) {
    input.replications = input.thresholds
      .map((t) => replicationCheck(t.family as never, input.delicacy!, t))
      .filter((c) => c.ok)
      .map((c) => (c as Extract<typeof c, { ok: true }>).value);
  }
  input.unmeasured = ["pitch-drift", "timing-smear", "lossy-artifact"].filter(
    (f) => !input.thresholds.some((t) => t.family === f),
  );
  return input;
}

const SCENARIOS: Record<string, AcrossInput> = {
  biasOnly: build({ bias: biasFor(2) }),
  biasPlusDelicacy: build({ bias: biasFor(2), delicacy: delicacyFor(() => true) }),
  agreeing: build({
    delicacy: delicacyFor(() => true),
    thresholds: [thresholdFor("pitch-drift", 0)],
  }),
  disagreeing: build({
    delicacy: delicacyFor((f) => f !== "pitch-drift"),
    thresholds: [thresholdFor("pitch-drift", 0)],
  }),
  everything: build({
    bias: biasFor(2),
    delicacy: delicacyFor(() => true),
    thresholds: [
      thresholdFor("pitch-drift", 0),
      thresholdFor("timing-smear", 0.4),
      thresholdFor("lossy-artifact", 0, "pb1"),
    ],
  }),
};

describe("the rendered deck", () => {
  it("prints every scenario", () => {
    for (const [name, input] of Object.entries(SCENARIOS)) {
      const lines = acrossLines(input);
      console.log(`\n### ${name} — instruments=${instrumentCount(input)} replications=${input.replications.length}`);
      if (lines.length === 0) console.log("    (silent — fewer than two instruments)");
      for (const l of lines) console.log(`    ${l}`);
      for (const r of thresholdRoster(input)) console.log(`      · ${r}`);
    }
  });
});

/* ------------------------------------------------------------------ *
 * The gate
 * ------------------------------------------------------------------ */

describe("it says nothing until there is something only it can say", () => {
  it("is silent with one instrument", () => {
    expect(acrossLines(SCENARIOS.biasOnly)).toEqual([]);
    expect(instrumentCount(SCENARIOS.biasOnly)).toBe(1);
  });

  it("speaks once two instruments have run", () => {
    expect(instrumentCount(SCENARIOS.biasPlusDelicacy)).toBe(2);
    expect(acrossLines(SCENARIOS.biasPlusDelicacy).length).toBeGreaterThan(0);
  });

  /** Three threshold ladders are still ONE instrument. */
  it("counts the three ladders as a single instrument", () => {
    const t = build({
      thresholds: [thresholdFor("pitch-drift", 0), thresholdFor("timing-smear", 0.4)],
    });
    expect(instrumentCount(t)).toBe(1);
    expect(acrossLines(t)).toEqual([]);
  });
});

/* ------------------------------------------------------------------ *
 * The claims
 * ------------------------------------------------------------------ */

describe("the dossier names questions, never scores", () => {
  it("lists what was asked and denies that the answers add up", () => {
    const line = dossierLine(SCENARIOS.everything)!;
    expect(line).toContain("3 different questions");
    expect(line).toContain("not 3 scores of one thing");
    expect(line).toMatch(/do not add up/i);
  });

  /** The count is derived, not written out — a two-instrument session said
   *  "not three scores of one thing" in the first draft. */
  it("counts correctly with only two instruments, and reads as a list", () => {
    const line = dossierLine(SCENARIOS.biasPlusDelicacy)!;
    expect(line).toContain("2 different questions");
    expect(line).toContain("not 2 scores of one thing");
    expect(line).not.toMatch(/\bit is and\b|\band how small\b/);
  });

  it("never ranks one family against another", () => {
    for (const input of Object.values(SCENARIOS)) {
      const joined = [...acrossLines(input), ...thresholdRoster(input)].join(" ");
      expect(joined).not.toMatch(/\b(strength|blind spot|weakest|sharpest|best|worst)\b/i);
      expect(joined).not.toMatch(/\bbetter (at|than)\b/i);
    }
  });

  /** Two numbers in different units are a list, not a ranking. */
  it("the roster prints each threshold in its own unit with nothing between them", () => {
    const roster = thresholdRoster(SCENARIOS.everything);
    expect(roster.length).toBeGreaterThan(1);
    for (const r of roster) expect(r).toMatch(/caught at [\d.]+ (cents|ms|kbps)|not pinned down/);
  });

  /**
   * The roster and the per-instrument screen must hedge the SAME sessions. A
   * wide band is refused in both places or in neither.
   */
  it("refuses to state a wide band's edge, exactly as the result screen does", () => {
    const wide = build({
      bias: biasFor(2),
      delicacy: delicacyFor(() => true),
      thresholds: [thresholdFor("pitch-drift", 0.5)],
    });
    for (const t of wide.thresholds) {
      const claim = thresholdClaim(t);
      if (!claim.ok || !claim.value.wide) continue;
      const entry = thresholdRoster(wide).find((r) => r.startsWith(familyLabel(t.family)));
      expect(entry).toContain("not pinned down");
    }
  });

  /** A kbps number is a fact about the recording too (RT-85a). */
  it("names the recording on a lossy threshold", () => {
    const lossy = SCENARIOS.everything.thresholds.find((t) => t.family === "lossy-artifact")!;
    const entry = thresholdRoster(SCENARIOS.everything).find((r) => r.startsWith("Compression"))!;
    if (!entry.includes("not pinned down")) expect(entry).toContain(`on ${lossy.sourceId}`);
  });
});

describe("the replication line", () => {
  it("reports agreement without folding in unpredicted trials", () => {
    const check = SCENARIOS.agreeing.replications[0];
    expect(check).toBeDefined();
    const line = replicationLine(check);
    const tested = check.agree + check.disagree;
    expect(line).toContain(`${tested} of ${tested}`);
    expect(line).not.toContain(String(check.trials.length + 1));
  });

  it("does not dress disagreement up as a result", () => {
    const check = SCENARIOS.disagreeing.replications[0];
    expect(check.agree).toBe(0);
    const line = replicationLine(check);
    expect(line).toMatch(/disagreed/i);
    expect(line).toMatch(/not describing your ear/i);
  });

  it("names the cross-material caveat for lossy and not for pitch", () => {
    const lossy = SCENARIOS.everything.replications.find((r) => r.family === "lossy-artifact");
    const pitch = SCENARIOS.everything.replications.find((r) => r.family === "pitch-drift");
    expect(lossy).toBeDefined();
    expect(replicationLine(lossy!)).toMatch(/different recordings/i);
    if (pitch) expect(replicationLine(pitch)).not.toMatch(/different recordings/i);
  });

  it("never reports a replication for timing", () => {
    for (const input of Object.values(SCENARIOS)) {
      expect(input.replications.some((r) => r.family === "timing-smear")).toBe(false);
    }
  });
});

describe("coverage points at a measurement, not a streak", () => {
  it("names what is unmeasured and disclaims it", () => {
    const line = coverageLine(SCENARIOS.agreeing)!;
    expect(line).toMatch(/unmeasured on this device/i);
    expect(line).toMatch(/nothing here says how you would do/i);
  });

  it("has no leaderboard, streak, XP or points anywhere", () => {
    for (const input of Object.values(SCENARIOS)) {
      const joined = [...acrossLines(input), ...thresholdRoster(input)].join(" ");
      expect(joined).not.toMatch(/\b(streak|xp|points?|leaderboard|rank|level up|badge)\b/i);
    }
  });
});

/* ------------------------------------------------------------------ *
 * Non-redundancy across ALL layers — the PM's explicit constraint
 * ------------------------------------------------------------------ */

describe("no sentence appears in two layers", () => {
  /**
   * THE GUARANTEE, ENFORCED RATHER THAN PROMISED. The combined view sits on the
   * same screens as the per-instrument translation and the measurement copy. If
   * any sentence were reachable from two of them, a reader would be told the
   * same thing twice on one page — which is the thing the PM refused.
   */
  it("shares nothing with the per-instrument translations or the measurement copy", () => {
    const input = SCENARIOS.everything;
    const mine = new Set(acrossLines(input));

    const others: string[] = [];
    for (const t of input.thresholds) {
      const claim = thresholdClaim(t);
      if (claim.ok) others.push(...thresholdCreatorLines(claim.value));
      others.push(...resultLines(t));
    }
    if (input.delicacy) others.push(...delicacyCreatorLines(input.delicacy));
    if (input.bias) others.push(...biasCreatorLines(input.bias));

    for (const line of others) expect(mine.has(line), line.slice(0, 60)).toBe(false);
    expect(others.length).toBeGreaterThan(6);
    expect(mine.size).toBeGreaterThan(2);
  });
});

describe("D1 / N3 / voice", () => {
  it("passes the voice gate on every line of every scenario", () => {
    const strings = Object.entries(SCENARIOS).flatMap(([name, input]) =>
      [...acrossLines(input), ...thresholdRoster(input)].map((text, i) => ({
        surface: `vocabulary/across/${name}/${i}`,
        text,
        intensity: "pointed" as const,
      })),
    );
    expect(formatVoiceReport(checkVoice(strings))).toBe("voice check: no violations");
  });

  it("makes no comparison to other people", () => {
    for (const input of Object.values(SCENARIOS)) {
      const joined = [...acrossLines(input), ...thresholdRoster(input)].join(" ");
      expect(joined).not.toMatch(/\bpercentile\b|\baverage\b|\bmost (people|listeners)\b|\bcohort of\b/i);
    }
  });

  it("is deterministic", () => {
    for (const input of Object.values(SCENARIOS)) expect(acrossLines(input)).toEqual(acrossLines(input));
  });
});
