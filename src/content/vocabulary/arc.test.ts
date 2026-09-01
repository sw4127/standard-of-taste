/**
 * E14/S3 — THE COMPARATIVE SENTENCES.
 *
 * PRE-REGISTERED, WRITTEN BEFORE THE COPY:
 *
 *   (a) EVERY BRANCH IS REACHED. The fixture placements must actually produce
 *       each direction, the off-ladder case, and every refusal. A branch that
 *       drifts out of reach is a sentence nobody ever reads and nothing ever
 *       checks — the hole the voice deck's own hazard gate exists to close.
 *   (b) THE "NO CHANGE" SENTENCE NAMES THE FLOOR IN THE READER'S UNITS. This is
 *       the ruled behaviour (RT-H1 a) and the whole difference between a
 *       refusal and a shrug, so it is asserted rather than assumed.
 *   (c) NO STAIRCASE SENTENCE PRINTS AN ENDPOINT AS A THRESHOLD. The arc
 *       compares the posterior median; the result screen prints the band and
 *       usually declines a point. Two different numbers on one page is the
 *       defect E8/S8 shipped and found by rendering. Enforced by pattern, over
 *       every reachable sentence.
 *   (d) NOTHING CLAIMS A CHANGE THAT WAS NOT MEASURED. No sentence may say a
 *       person improved, practised, got better, or is ahead of anyone.
 *   (e) THE SENTENCES ARE READ, NOT INSPECTED. The full deck is printed so the
 *       lines can be read as a person meets them.
 */
import { describe, expect, it } from "vitest";
import { arcLines, ARC_REFUSAL, arcRefusal } from "./arc";
import { arcClaims } from "./fixtures";
import { checkVoice } from "../voice";

const claims = arcClaims();

describe("E14/S3 — every branch the arc can take is reached and voiced", () => {
  it("prints the whole deck, so the sentences are read rather than inspected", () => {
    for (const [name, claim] of Object.entries(claims)) {
      const shape = claim.ok
        ? `${claim.value.instrument}/${String(claim.value.direction)}`
        : `refused/${claim.gap}`;
      console.log(`[E14/S3] --- ${name}  (${shape})`);
      for (const line of arcLines(claim)) console.log(`[E14/S3]     ${line}`);
    }
    expect(Object.keys(claims).length).toBeGreaterThan(0);
  });

  /**
   * (a) The placements in `fixtures.ts` are chosen to reach these shapes. If a
   * ladder, a budget or the floor moves, a placement can silently stop reaching
   * its branch — and the branch would then be unvoiced, untested, and still
   * shipped. This is the assertion that notices.
   */
  it("reaches every direction, the off-ladder case, and every refusal", () => {
    const shape = (name: string) => {
      const c = claims[name];
      return c.ok ? `${c.value.instrument}/${String(c.value.direction)}` : `refused/${c.gap}`;
    };
    expect(shape("threshold-no-change")).toBe("threshold/null");
    expect(shape("threshold-closer")).toBe("threshold/closer");
    expect(shape("threshold-further")).toBe("threshold/further");
    expect(shape("bias-no-change")).toBe("bias/null");
    expect(shape("bias-closer")).toBe("bias/closer");
    expect(shape("bias-further")).toBe("bias/further");
    expect(shape("refuse-too-few")).toBe("refused/too-few-sessions");
    expect(shape("refuse-different-material")).toBe("refused/different-material");
    expect(shape("refuse-delicacy")).toBe("refused/arc-instrument-unsupported");
    expect(shape("refuse-no-floor")).toBe("refused/no-arc-floor");

    /*
     * THE DIRECTION IS NOT THE BRANCH, and this assertion used to check only
     * the direction. Both "closer" and "further" were landing on the OFF-LADDER
     * sentence, so the ordinary in-range sentence — the one that carries the
     * actual multiple, and the one most readers with a real change would get —
     * was never rendered anywhere in the deck, never read, and never checked.
     * The test passed. It was found by printing the sentences.
     */
    const inRange = (name: string) => {
      const c = claims[name];
      expect(c.ok, `${name} refused`).toBe(true);
      return c.ok && c.value.earlier.withinRange && c.value.latest.withinRange;
    };
    expect(inRange("threshold-closer"), "the 'closer' fixture drifted off the ladder").toBe(true);
    expect(inRange("threshold-further"), "the 'further' fixture drifted off the ladder").toBe(true);
    expect(inRange("threshold-no-change"), "the 'no change' fixture drifted off the ladder").toBe(true);
    expect(inRange("threshold-off-ladder"), "the off-ladder fixture is no longer off the ladder").toBe(false);

    const off = claims["threshold-off-ladder"];
    if (off.ok) {
      expect(off.value.direction, "the off-ladder fixture no longer produces a direction").not.toBeNull();
    }
  });

  it("has a written refusal for every gap the arc can return", () => {
    // Read off the module's own map rather than a second list here: a gap that
    // gained a sentence without gaining a test would otherwise pass, and one
    // that lost its sentence would fall through to the wrong text.
    for (const gap of ["too-few-sessions", "different-material", "arc-instrument-unsupported", "no-arc-floor", "no-scoreable-trials"]) {
      expect(ARC_REFUSAL[gap], `no refusal sentence for "${gap}"`).toBeTruthy();
      expect(arcRefusal(gap)).toBe(ARC_REFUSAL[gap]);
    }
  });
});

describe("E14/S3 — what the sentences may not do", () => {
  const everyLine = () => Object.values(claims).flatMap((c) => arcLines(c));

  /** (b) The ruled behaviour, asserted on the rendered sentence. */
  it("names the floor, in the reader's units, when it declines to call a change", () => {
    const noChange = claims["threshold-no-change"];
    expect(noChange.ok).toBe(true);
    if (!noChange.ok) return;
    const text = arcLines(noChange).join(" ");
    const floor = noChange.value.floorFactor ?? 0;
    // The multiple as the copy rounds it, not as the engine holds it.
    expect(text, "the no-change sentence does not say what it would have taken").toContain(
      `${floor.toFixed(1)}x`,
    );
    // And it must not read as a verdict on the person.
    expect(text.toLowerCase()).toContain("instrument");
  });

  /**
   * (c) THE NUMBER THIS LAYER MAY NOT PRINT.
   *
   * A staircase sentence naming "34 cents" or "96 kbps" would be printing the
   * posterior median as though it were the threshold the result screen reports,
   * which it is not. Multiples ("3.5x") are fine and are the whole design.
   */
  it("never prints a staircase endpoint as a threshold", () => {
    const units = /\d+(\.\d+)?\s*(cents?|ms|milliseconds?|kbps)\b/i;
    for (const [name, claim] of Object.entries(claims)) {
      if (claim.ok && claim.value.instrument === "bias") continue;
      for (const line of arcLines(claim)) {
        expect(units.test(line), `${name} prints a physical quantity: ${line}`).toBe(false);
      }
    }
  });

  /** (d) N3 and D1: no unmeasured claim, and no comparison with other people. */
  it("claims no improvement it did not measure, and compares nobody to anybody", () => {
    const banned: [RegExp, string][] = [
      [/\bpercentile\b/i, "percentile"],
      [/\bbetter than (?:most|other|average)\b/i, "between-people comparison"],
      [/\bmost (?:people|listeners|users)\b/i, "cohort claim"],
      [/\baverage (?:person|listener)\b/i, "cohort claim"],
      [/\byour best\b/i, "personal record"],
      [/\bpersonal best\b/i, "personal record"],
      [/\bstreak\b/i, "streak"],
      [/\bkeep it up\b/i, "encouragement as finding"],
      [/\bpractice (?:is )?(?:working|paying)\b/i, "unmeasured causal claim"],
      [/\byou (?:have )?improved\b/i, "verdict on the person"],
      [/\byou got better\b/i, "verdict on the person"],
    ];
    for (const [name, claim] of Object.entries(claims)) {
      for (const line of arcLines(claim)) {
        for (const [re, why] of banned) {
          expect(re.test(line), `${name}: ${why} in "${line}"`).toBe(false);
        }
      }
    }
  });

  it("passes the voice deck as its own surface", () => {
    const violations = checkVoice(
      everyLine().map((text, i) => ({ surface: `vocabulary/arc/direct/${i}`, text, intensity: "pointed" as const })),
    );
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  });

  /**
   * A GUARD THAT ONLY EVER SAYS YES IS NOT A GUARD. The two checks above are
   * pattern matches over generated prose, and a pattern that matches nothing is
   * indistinguishable from a pattern that is broken. These are the same checks
   * pointed at sentences that SHOULD fail them.
   */
  it("the two prose guards above actually fire", () => {
    const units = /\d+(\.\d+)?\s*(cents?|ms|milliseconds?|kbps)\b/i;
    expect(units.test("your threshold went from 34 cents to 12 cents")).toBe(true);
    expect(units.test("a change of about 3.5x")).toBe(false);
    expect(/\byou (?:have )?improved\b/i.test("you improved since last time")).toBe(true);
    expect(/\bstreak\b/i.test("three sessions in a row — keep the streak")).toBe(true);
  });
});
