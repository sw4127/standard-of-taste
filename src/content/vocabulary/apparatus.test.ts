import { describe, expect, it } from "vitest";

import { BORROWED_STANDARDS, LOUDNESS_TARGET_LUFS, externalStandards, inRepoStandards } from "@/content/apparatus/standards";
import { CRITIC_SCALES, OUR_SCALE } from "@/content/comparison/scales";
import { checkVoice, formatVoiceReport, type VoiceString } from "@/content/voice";
import {
  apparatusLines,
  apparatusSection,
  citationStrengthLine,
  degreesConvergenceLine,
} from "./apparatus";

describe("apparatus copy", () => {
  it("writes one paragraph per standard, each naming what we do with it", () => {
    const lines = apparatusLines();
    expect(lines.length).toBe(BORROWED_STANDARDS.length);
    expect(lines.length).toBeGreaterThan(0);
    for (const s of BORROWED_STANDARDS) {
      const line = lines.find((l) => l.startsWith(s.name));
      expect(line, `${s.id} has no line`).toBeDefined();
      expect(line!).toContain(s.howWeUseIt);
    }
  });

  it("renders every departure in the same breath as the borrowing", () => {
    const lines = apparatusLines().join(" ");
    const withDeparture = BORROWED_STANDARDS.filter((s) => s.departure);
    expect(withDeparture.length).toBeGreaterThan(0);
    for (const s of withDeparture) expect(lines).toContain(s.departure!);
  });

  it("computes the citation-strength counts instead of stating them", () => {
    const line = citationStrengthLine();
    // Both counts must track the registry, so the sentence cannot go stale.
    expect(inRepoStandards().length).toBeGreaterThan(0);
    expect(externalStandards().length).toBeGreaterThan(0);
    expect(line).toContain("Two of these are decisions living in this repository");
    expect(line).toContain("The other one rests on a document no test can open");
  });

  it("builds the convergence from the modules that own the numbers", () => {
    const line = degreesConvergenceLine();
    expect(line).not.toBeNull();
    const pitchfork = CRITIC_SCALES.find((s) => s.degreesAllowed !== null)!;
    expect(line!).toContain(String(pitchfork.degreesAllowed));
    expect(line!).toContain("eleven");
    expect(OUR_SCALE.degreesAllowed).toBe(11);
    // MUSHRA's scale is CONTINUOUS and must never be rendered as a count.
    expect(line!).toContain("continuous scale from 0 to 100");
    expect(line!).not.toMatch(/\b101 (?:degrees|points) on a continuous\b/);
  });

  it("refuses the convergence rather than inventing it when a term is missing", () => {
    /*
     * A convergence with one term missing is not a convergence. Proven by
     * removing the scale label, not by trusting the branch exists.
     */
    const entry = BORROWED_STANDARDS.find((s) => s.scaleLabel)!;
    const saved = entry.scaleLabel;
    try {
      entry.scaleLabel = undefined;
      expect(degreesConvergenceLine()).toBeNull();
    } finally {
      entry.scaleLabel = saved;
    }
    expect(degreesConvergenceLine()).not.toBeNull();
  });


  it("lets no figure into the convergence that no source owns", () => {
    /*
     * HALF A GUARD, AND IT SAYS SO. Reading this line rendered found two false
     * claims in it: that the two scales were a century apart (they are
     * contemporaries) and that both cluster near the top of their range
     * (measured for one, unsourced for the other). NEITHER carried a digit, so
     * nothing below would have caught them. What this CAN do is refuse a number
     * that traces to no source, which is the other half of the same hazard.
     */
    const line = degreesConvergenceLine()!;
    const entry = BORROWED_STANDARDS.find((s) => s.scaleLabel)!;
    const pitchfork = CRITIC_SCALES.find((s) => s.degreesAllowed !== null)!;

    const allowed = new Set<string>();
    for (const n of entry.scaleLabel!.match(/\d+/g) ?? []) allowed.add(n);
    for (const n of entry.name.match(/\d+/g) ?? []) allowed.add(n);
    allowed.add(String(pitchfork.degreesAllowed));

    const found = line.match(/\d+/g) ?? [];
    expect(found.length, "no figures in the convergence — this guard is vacuous").toBeGreaterThan(2);
    for (const n of found) {
      expect(allowed.has(n), `${n} appears in the convergence and no source declares it`).toBe(true);
    }
  });

  it("never opens a sentence with a lowercase word", () => {
    const all = apparatusSection();
    let openings = 0;
    for (const line of all) {
      for (const part of line.split(/(?<=[.!?])\s+/)) {
        if (part.trim().length === 0) continue;
        openings++;
        const first = part.trim()[0];
        expect(first === first.toUpperCase(), `opens lowercase: "${part.slice(0, 48)}"`).toBe(true);
      }
    }
    expect(openings).toBeGreaterThan(all.length);
  });

  it("types no figure that a module or a citation owns", () => {
    const prose = apparatusSection().join(" ");
    expect(prose.length).toBeGreaterThan(0);
    // The loudness target is imported, never written into copy.
    expect(prose).not.toContain(String(LOUDNESS_TARGET_LUFS));
    // And the section must actually be carrying figures, or this is vacuous.
    expect(/\d/.test(prose)).toBe(true);
  });

  it("claims nothing about how well people score", () => {
    const prose = apparatusSection().join(" ");
    expect(prose).not.toMatch(/\blisteners? (?:can|detect|hear|score|average)\b/i);
    expect(prose).not.toMatch(/\btrained (?:listeners|ears)\b/i);
    expect(prose).not.toMatch(/percentile|\bon average\b|\bmost people\b/i);
  });

  it("passes the voice gate on every line it produces", () => {
    const strings: VoiceString[] = apparatusSection().map((text, i) => ({
      surface: `apparatus/${i}`,
      text,
      intensity: "calm",
    }));
    expect(strings.length).toBeGreaterThan(0);
    expect(formatVoiceReport(checkVoice(strings))).toBe("voice check: no violations");
  });
});
